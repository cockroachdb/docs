"""Replaces output blocks in markdown files with actual SQL execution results."""

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional

from .models import ResponseMode, SqlBlock, TestResult, PageResult


@dataclass
class BlockUpdateResult:
    """Result of updating a single output block."""
    block_index: int
    line_number: int
    action: str  # "replaced", "inserted", "unchanged", "skipped"
    reason: str = ""


@dataclass
class FileUpdateResult:
    """Summary of all updates applied to a single file."""
    file_path: str
    blocks_updated: int = 0
    blocks_inserted: int = 0
    blocks_unchanged: int = 0
    blocks_skipped: int = 0
    block_details: List[BlockUpdateResult] = field(default_factory=list)

    @property
    def modified(self) -> bool:
        return self.blocks_updated > 0 or self.blocks_inserted > 0


# Pattern to strip cockroach sql Time: lines
TIME_LINE_RE = re.compile(r'^Time:.*$', re.MULTILINE)


def format_output(raw_output: str) -> str:
    """Format raw SQL execution output for insertion into a markdown file.

    Strips:
    - Time: lines appended by cockroach sql (e.g., "Time: 1ms total (execution 1ms / network 0ms)")
    - Leading/trailing blank lines
    - Trailing whitespace on each line

    Preserves table formatting as-is.
    """
    # Strip Time: lines
    cleaned = TIME_LINE_RE.sub('', raw_output)

    # Strip trailing whitespace on each line
    lines = [line.rstrip() for line in cleaned.split('\n')]

    # Strip leading/trailing blank lines
    while lines and lines[0] == '':
        lines.pop(0)
    while lines and lines[-1] == '':
        lines.pop()

    return '\n'.join(lines)


def update_file_responses(
    file_path: str,
    page_result: PageResult,
    results: Dict[int, TestResult],
    dry_run: bool = False,
) -> FileUpdateResult:
    """Update output blocks in a markdown file with actual SQL execution results.

    Args:
        file_path: Path to the markdown file.
        page_result: PageResult containing extracted blocks.
        results: Map from block_index to TestResult for executed blocks.
        dry_run: If True, compute changes but don't write the file.

    Returns:
        FileUpdateResult summarizing what changed.
    """
    file_result = FileUpdateResult(file_path=file_path)
    path = Path(file_path)
    lines = path.read_text(encoding='utf-8').split('\n')

    # Collect blocks eligible for generation, sorted by block_index
    generate_blocks = []
    for block in page_result.blocks:
        if block.response_mode != ResponseMode.GENERATE:
            file_result.blocks_skipped += 1
            file_result.block_details.append(BlockUpdateResult(
                block_index=block.block_index,
                line_number=block.line_number,
                action="skipped",
                reason="response_mode is not GENERATE",
            ))
            continue

        # Fragments are never eligible
        if block.block_type.value == "fragment":
            file_result.blocks_skipped += 1
            file_result.block_details.append(BlockUpdateResult(
                block_index=block.block_index,
                line_number=block.line_number,
                action="skipped",
                reason="block is a fragment",
            ))
            continue

        test_result = results.get(block.block_index)
        if test_result is None or not test_result.success:
            file_result.blocks_skipped += 1
            reason = "no test result" if test_result is None else f"execution failed: {test_result.error_message}"
            file_result.block_details.append(BlockUpdateResult(
                block_index=block.block_index,
                line_number=block.line_number,
                action="skipped",
                reason=reason,
            ))
            continue

        generate_blocks.append((block, test_result))

    # Process in reverse document order to avoid line-number shifting
    generate_blocks.sort(key=lambda x: x[0].line_number, reverse=True)

    for block, test_result in generate_blocks:
        formatted = format_output(test_result.actual_output)

        if block.output_block_range is not None:
            # Replace existing output block
            out_open, out_close = block.output_block_range
            existing_content = '\n'.join(lines[out_open + 1:out_close])

            if existing_content == formatted:
                file_result.blocks_unchanged += 1
                file_result.block_details.append(BlockUpdateResult(
                    block_index=block.block_index,
                    line_number=block.line_number,
                    action="unchanged",
                ))
            else:
                # Replace lines between the ~~~ delimiters (keep the delimiters)
                new_lines = lines[:out_open + 1] + formatted.split('\n') + lines[out_close:]
                lines = new_lines
                file_result.blocks_updated += 1
                file_result.block_details.append(BlockUpdateResult(
                    block_index=block.block_index,
                    line_number=block.line_number,
                    action="replaced",
                ))
        else:
            # Insert new output block after the SQL block's closing ~~~
            # Find the closing ~~~ of the SQL block
            # line_number is 1-indexed and points to the ~~~ sql line
            sql_open_idx = block.line_number - 1  # 0-indexed
            sql_close_idx = sql_open_idx + 1
            while sql_close_idx < len(lines) and lines[sql_close_idx].strip() != '~~~':
                sql_close_idx += 1

            # Insert after the closing ~~~
            insert_idx = sql_close_idx + 1
            new_block_lines = ['', '~~~'] + formatted.split('\n') + ['~~~']
            lines = lines[:insert_idx] + new_block_lines + lines[insert_idx:]
            file_result.blocks_inserted += 1
            file_result.block_details.append(BlockUpdateResult(
                block_index=block.block_index,
                line_number=block.line_number,
                action="inserted",
            ))

    # Write updated file
    if file_result.modified and not dry_run:
        path.write_text('\n'.join(lines), encoding='utf-8')

    return file_result
