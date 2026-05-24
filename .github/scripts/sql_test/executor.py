"""Executes SQL blocks against a CockroachDB cluster."""

import re
import subprocess
import time
from pathlib import Path
from typing import List

from .models import BlockType, SqlBlock, TestResult, PageResult
from .extractor import MOVR_TABLES

DEFAULT_CONNECTION_URL = "postgresql://root@localhost:26257?sslmode=disable"
STATEMENT_TIMEOUT_S = 30


def _sanitize_db_name(file_path: str) -> str:
    """Generate a safe database name from a file path."""
    name = Path(file_path).stem
    # Replace non-alphanumeric characters with underscores
    name = re.sub(r'[^a-zA-Z0-9]', '_', name)
    return f"sqltest_{name}"[:63]  # CockroachDB identifier limit


def _uses_movr(blocks: List[SqlBlock]) -> bool:
    """Check if any block references MovR tables."""
    for block in blocks:
        content_lower = block.raw_content.lower()
        for table in MOVR_TABLES:
            if re.search(r'\b' + table + r'\b', content_lower):
                return True
    return False


def _run_sql(connection_url: str, sql: str, timeout: int = STATEMENT_TIMEOUT_S) -> subprocess.CompletedProcess:
    """Execute SQL via cockroach sql subprocess."""
    return subprocess.run(
        ["cockroach", "sql", "--url", connection_url, "--format=table", "-e", sql],
        capture_output=True,
        text=True,
        timeout=timeout,
    )


def execute_page(page_result: PageResult, connection_url: str = DEFAULT_CONNECTION_URL) -> PageResult:
    """Execute all SQL blocks for a single page against CockroachDB.

    Creates an isolated database per page, runs all executable blocks in
    document order within that database, then cleans up.

    Args:
        page_result: PageResult with extracted blocks (no results yet).
        connection_url: CockroachDB connection URL.

    Returns:
        The same PageResult with results populated.
    """
    db_name = _sanitize_db_name(page_result.file_path)

    # Create isolated database
    try:
        _run_sql(connection_url, f'CREATE DATABASE IF NOT EXISTS "{db_name}";')
    except Exception as e:
        # If we can't create the DB, fail all blocks
        for block in page_result.blocks:
            if block.block_type in (BlockType.EXECUTABLE, BlockType.EXPECTED_ERROR):
                page_result.results.append(TestResult(
                    block=block,
                    success=False,
                    error_message=f"Failed to create test database: {e}",
                ))
        return page_result

    # Build connection URL with the test database
    if '?' in connection_url:
        db_url = connection_url.replace('?', f'/"{db_name}"?', 1)
    else:
        db_url = f'{connection_url}/"{db_name}"'

    # Initialize MovR data if needed
    executable_blocks = [b for b in page_result.blocks if b.block_type in (BlockType.EXECUTABLE, BlockType.EXPECTED_ERROR)]
    if _uses_movr(page_result.blocks):
        try:
            subprocess.run(
                ["cockroach", "workload", "init", "movr", db_url],
                capture_output=True,
                text=True,
                timeout=60,
            )
        except Exception as e:
            for block in executable_blocks:
                page_result.results.append(TestResult(
                    block=block,
                    success=False,
                    error_message=f"Failed to initialize MovR: {e}",
                ))
            _cleanup_db(connection_url, db_name)
            return page_result

    # Execute blocks in order
    for block in page_result.blocks:
        if block.block_type == BlockType.FRAGMENT or block.block_type == BlockType.SKIPPED:
            continue

        result = _execute_block(block, db_url)
        page_result.results.append(result)

    # Cleanup
    _cleanup_db(connection_url, db_name)

    return page_result


def _execute_block(block: SqlBlock, db_url: str) -> TestResult:
    """Execute a single SQL block and return the result."""
    start_time = time.time()
    combined_output = []
    combined_errors = []

    for stmt in block.cleaned_statements:
        try:
            proc = _run_sql(db_url, stmt)
            if proc.stdout:
                combined_output.append(proc.stdout)
            if proc.stderr:
                combined_errors.append(proc.stderr)

            if proc.returncode != 0:
                elapsed = (time.time() - start_time) * 1000
                error_text = proc.stderr.strip() if proc.stderr else "Non-zero exit code"

                if block.block_type == BlockType.EXPECTED_ERROR:
                    # Expected error: passing because it did error
                    return TestResult(
                        block=block,
                        success=True,
                        actual_output=error_text,
                        execution_time_ms=elapsed,
                    )
                else:
                    return TestResult(
                        block=block,
                        success=False,
                        actual_output='\n'.join(combined_output),
                        error_message=error_text,
                        execution_time_ms=elapsed,
                    )

        except subprocess.TimeoutExpired:
            elapsed = (time.time() - start_time) * 1000
            return TestResult(
                block=block,
                success=False,
                error_message=f"Statement timed out after {STATEMENT_TIMEOUT_S}s: {stmt[:100]}",
                execution_time_ms=elapsed,
            )
        except Exception as e:
            elapsed = (time.time() - start_time) * 1000
            if block.block_type == BlockType.EXPECTED_ERROR:
                return TestResult(
                    block=block,
                    success=True,
                    actual_output=str(e),
                    execution_time_ms=elapsed,
                )
            return TestResult(
                block=block,
                success=False,
                error_message=str(e),
                execution_time_ms=elapsed,
            )

    elapsed = (time.time() - start_time) * 1000

    # All statements succeeded
    if block.block_type == BlockType.EXPECTED_ERROR:
        # Expected an error but all statements succeeded — this is a failure
        return TestResult(
            block=block,
            success=False,
            actual_output='\n'.join(combined_output),
            error_message="Expected an error but all statements succeeded",
            execution_time_ms=elapsed,
        )

    return TestResult(
        block=block,
        success=True,
        actual_output='\n'.join(combined_output),
        execution_time_ms=elapsed,
    )


def _cleanup_db(connection_url: str, db_name: str) -> None:
    """Drop the test database."""
    try:
        _run_sql(connection_url, f'DROP DATABASE IF EXISTS "{db_name}" CASCADE;')
    except Exception:
        pass  # Best-effort cleanup
