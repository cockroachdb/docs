"""Extracts and classifies SQL code blocks from CockroachDB documentation markdown files."""

import re
from pathlib import Path
from typing import List, Optional

from .models import BlockType, SqlBlock, PageResult


# Tables that indicate MovR dataset usage
MOVR_TABLES = frozenset({
    "users", "vehicles", "rides", "promo_codes",
    "vehicle_location_histories", "user_promo_codes",
})

# Patterns that indicate a block is a fragment (not executable as-is)
FRAGMENT_INDICATORS = [
    re.compile(r'\.\.\.'),                  # Ellipsis (truncated content)
    re.compile(r'<[a-zA-Z_][a-zA-Z0-9_ -]*>'),  # <placeholder> style
    re.compile(r'\{[a-zA-Z_][a-zA-Z0-9_]*\}'),  # {placeholder} style
    re.compile(r'{% remote_include'),       # Liquid remote include
]

# Skip annotation pattern: <!-- sql-test:skip reason="..." -->
SKIP_COMMENT_RE = re.compile(
    r'<!--\s*sql-test:skip(?:\s+reason="([^"]*)")?\s*-->'
)


def _has_page_level_skip(content: str) -> bool:
    """Check if frontmatter contains sql_test: skip."""
    frontmatter_match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    if not frontmatter_match:
        return False
    frontmatter = frontmatter_match.group(1)
    return bool(re.search(r'^\s*sql_test:\s*skip\s*$', frontmatter, re.MULTILINE))


def _clean_sql_lines(raw: str) -> List[str]:
    """Clean raw SQL block content into executable statements.

    Strips the leading '> ' prompt prefix from each line, then splits
    on semicolons to produce individual statements.
    """
    lines = []
    for line in raw.split('\n'):
        # Strip the leading '> ' prompt that CockroachDB docs use
        stripped = line
        if stripped.startswith('> '):
            stripped = stripped[2:]
        elif stripped == '>':
            stripped = ''
        lines.append(stripped)

    joined = '\n'.join(lines).strip()
    if not joined:
        return []

    # Split on semicolons, keeping each as a complete statement
    statements = []
    current = []
    for line in joined.split('\n'):
        current.append(line)
        if line.rstrip().endswith(';'):
            stmt = '\n'.join(current).strip()
            if stmt:
                statements.append(stmt)
            current = []

    # If there's remaining content without a trailing semicolon,
    # include it as a statement (some SQL commands like \dt don't use semicolons)
    if current:
        stmt = '\n'.join(current).strip()
        if stmt:
            statements.append(stmt)

    return statements


def _classify_block(
    raw: str,
    statements: List[str],
    expected_output: Optional[str],
    skip_reason: Optional[str],
) -> BlockType:
    """Classify a SQL block based on its content and context."""
    if skip_reason is not None:
        return BlockType.SKIPPED

    # Check for fragment indicators in the raw SQL content
    for pattern in FRAGMENT_INDICATORS:
        if pattern.search(raw):
            return BlockType.FRAGMENT

    # Check if any statement starts with $ (shell command, not SQL)
    for stmt in statements:
        if stmt.lstrip().startswith('$'):
            return BlockType.FRAGMENT

    # Check if expected output indicates an error
    if expected_output:
        output_stripped = expected_output.strip()
        if output_stripped.startswith('ERROR:') or output_stripped.startswith('pq:'):
            return BlockType.EXPECTED_ERROR

    return BlockType.EXECUTABLE


def _uses_movr(blocks: List[SqlBlock]) -> bool:
    """Check if any block references MovR tables."""
    for block in blocks:
        content_lower = block.raw_content.lower()
        for table in MOVR_TABLES:
            # Match table name as a word boundary to avoid false positives
            if re.search(r'\b' + table + r'\b', content_lower):
                return True
    return False


def extract_blocks(file_path: str, content: Optional[str] = None) -> PageResult:
    """Extract all SQL code blocks from a markdown file.

    Args:
        file_path: Path to the markdown file.
        content: Optional file content. If None, reads from file_path.

    Returns:
        PageResult containing all extracted and classified SQL blocks.
    """
    path = Path(file_path)

    if content is None:
        if not path.exists():
            return PageResult(file_path=file_path)
        content = path.read_text(encoding='utf-8')

    page_result = PageResult(file_path=file_path)

    # Check for page-level skip
    page_skip = _has_page_level_skip(content)

    lines = content.split('\n')
    i = 0
    block_index = 0

    while i < len(lines):
        line = lines[i]

        # Check for skip annotation comment
        skip_match = SKIP_COMMENT_RE.search(line)
        if skip_match:
            skip_reason = skip_match.group(1) or "Marked with sql-test:skip"
            # Look for the next SQL block immediately following
            j = i + 1
            while j < len(lines) and lines[j].strip() == '':
                j += 1

            if j < len(lines) and lines[j].strip() == '~~~ sql':
                # Found the SQL block after the skip comment
                sql_start = j + 1
                sql_end = sql_start
                while sql_end < len(lines) and lines[sql_end].strip() != '~~~':
                    sql_end += 1

                raw = '\n'.join(lines[sql_start:sql_end])
                statements = _clean_sql_lines(raw)

                block = SqlBlock(
                    file_path=file_path,
                    line_number=j + 1,  # 1-indexed
                    raw_content=raw,
                    cleaned_statements=statements,
                    block_type=BlockType.SKIPPED,
                    skip_reason=skip_reason,
                    block_index=block_index,
                )
                page_result.blocks.append(block)
                block_index += 1
                i = sql_end + 1
                continue

            i += 1
            continue

        # Detect ~~~ sql block
        if line.strip() == '~~~ sql':
            sql_line_number = i + 1  # 1-indexed

            # Collect SQL content
            sql_start = i + 1
            sql_end = sql_start
            while sql_end < len(lines) and lines[sql_end].strip() != '~~~':
                sql_end += 1

            raw = '\n'.join(lines[sql_start:sql_end])
            statements = _clean_sql_lines(raw)

            # Look ahead for expected output block (~~~ without a language tag)
            expected_output = None
            j = sql_end + 1
            # Skip blank lines and non-code-block lines between SQL and output
            while j < len(lines) and lines[j].strip() == '':
                j += 1

            if j < len(lines) and lines[j].strip() == '~~~':
                # This is a plain ~~~ block (output block)
                out_start = j + 1
                out_end = out_start
                while out_end < len(lines) and lines[out_end].strip() != '~~~':
                    out_end += 1
                expected_output = '\n'.join(lines[out_start:out_end])

            # Determine skip reason
            skip_reason = None
            if page_skip:
                skip_reason = "Page-level sql_test: skip in frontmatter"

            block_type = _classify_block(raw, statements, expected_output, skip_reason)

            block = SqlBlock(
                file_path=file_path,
                line_number=sql_line_number,
                raw_content=raw,
                cleaned_statements=statements,
                block_type=block_type,
                expected_output=expected_output,
                skip_reason=skip_reason,
                block_index=block_index,
            )
            page_result.blocks.append(block)
            block_index += 1

            # Advance past the closing ~~~
            i = sql_end + 1
            continue

        i += 1

    return page_result


def extract_from_files(file_paths: List[str]) -> List[PageResult]:
    """Extract SQL blocks from multiple files.

    Args:
        file_paths: List of markdown file paths to process.

    Returns:
        List of PageResult, one per file (only files with blocks).
    """
    results = []
    for fp in file_paths:
        page = extract_blocks(fp)
        if page.blocks:
            results.append(page)
    return results
