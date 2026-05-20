"""Extracts and classifies SQL code blocks from CockroachDB documentation markdown files."""

import re
from pathlib import Path
from typing import List, Optional

from .models import BlockType, ResponseMode, SqlBlock, PageResult


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

# Response generation annotation patterns
RESPONSE_GENERATE_RE = re.compile(
    r'<!--\s*sql-response:generate\s*-->'
)
RESPONSE_SKIP_RE = re.compile(
    r'<!--\s*sql-response:skip(?:\s+reason="([^"]*)")?\s*-->'
)


def _has_page_level_skip(content: str) -> bool:
    """Check if frontmatter contains sql_test: skip."""
    frontmatter_match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    if not frontmatter_match:
        return False
    frontmatter = frontmatter_match.group(1)
    return bool(re.search(r'^\s*sql_test:\s*skip\s*$', frontmatter, re.MULTILINE))


def _has_page_level_response_generate(content: str) -> bool:
    """Check if frontmatter contains sql_response: generate."""
    frontmatter_match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    if not frontmatter_match:
        return False
    frontmatter = frontmatter_match.group(1)
    return bool(re.search(r'^\s*sql_response:\s*generate\s*$', frontmatter, re.MULTILINE))


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

    # Check for page-level flags
    page_skip = _has_page_level_skip(content)
    page_response_generate = _has_page_level_response_generate(content)

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

                # Check for response annotations on the same comment line
                # or look back for a preceding response annotation
                response_mode = _determine_response_mode(
                    lines, i, page_response_generate, is_skip_annotated=True
                )

                # Look ahead for output block range
                output_block_range = None
                k = sql_end + 1
                while k < len(lines) and lines[k].strip() == '':
                    k += 1
                if k < len(lines) and lines[k].strip() == '~~~':
                    out_open = k
                    out_close = out_open + 1
                    while out_close < len(lines) and lines[out_close].strip() != '~~~':
                        out_close += 1
                    output_block_range = (out_open, out_close)

                block = SqlBlock(
                    file_path=file_path,
                    line_number=j + 1,  # 1-indexed
                    raw_content=raw,
                    cleaned_statements=statements,
                    block_type=BlockType.SKIPPED,
                    skip_reason=skip_reason,
                    block_index=block_index,
                    response_mode=response_mode,
                    output_block_range=output_block_range,
                )
                page_result.blocks.append(block)
                block_index += 1
                i = sql_end + 1
                continue

            i += 1
            continue

        # Check for response generate/skip annotation (not tied to sql-test:skip)
        response_generate_match = RESPONSE_GENERATE_RE.search(line)
        response_skip_match = RESPONSE_SKIP_RE.search(line)

        if response_generate_match or response_skip_match:
            # Look for the next SQL block immediately following
            j = i + 1
            while j < len(lines) and lines[j].strip() == '':
                j += 1

            if j < len(lines) and lines[j].strip() == '~~~ sql':
                # The SQL block will be processed when we reach it.
                # Store the annotation info to be picked up below.
                # We don't advance i; we let the normal ~~~ sql handler pick it up.
                pass

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
            output_block_range = None
            j = sql_end + 1
            # Skip blank lines between SQL and output
            while j < len(lines) and lines[j].strip() == '':
                j += 1

            if j < len(lines) and lines[j].strip() == '~~~':
                # This is a plain ~~~ block (output block)
                out_start = j + 1
                out_end = out_start
                while out_end < len(lines) and lines[out_end].strip() != '~~~':
                    out_end += 1
                expected_output = '\n'.join(lines[out_start:out_end])
                output_block_range = (j, out_end)  # 0-indexed, inclusive of ~~~ delimiters

            # Determine skip reason
            skip_reason = None
            if page_skip:
                skip_reason = "Page-level sql_test: skip in frontmatter"

            block_type = _classify_block(raw, statements, expected_output, skip_reason)

            # Determine response mode by looking back for annotations
            response_mode = _determine_response_mode(
                lines, i, page_response_generate
            )

            block = SqlBlock(
                file_path=file_path,
                line_number=sql_line_number,
                raw_content=raw,
                cleaned_statements=statements,
                block_type=block_type,
                expected_output=expected_output,
                skip_reason=skip_reason,
                block_index=block_index,
                response_mode=response_mode,
                output_block_range=output_block_range,
            )
            page_result.blocks.append(block)
            block_index += 1

            # Advance past the closing ~~~
            i = sql_end + 1
            continue

        i += 1

    return page_result


def _determine_response_mode(
    lines: List[str],
    sql_block_line_idx: int,
    page_response_generate: bool,
    is_skip_annotated: bool = False,
) -> ResponseMode:
    """Determine the response mode for a SQL block.

    Looks backward from the SQL block's opening ~~~ sql line (or from
    the sql-test:skip comment line) for a sql-response annotation.
    Block-level annotations override page-level settings.

    Args:
        lines: All lines from the file.
        sql_block_line_idx: 0-indexed line of the ~~~ sql opener or skip comment.
        page_response_generate: Whether the page has sql_response: generate in frontmatter.
        is_skip_annotated: Whether this block has a sql-test:skip annotation.

    Returns:
        The ResponseMode for this block.
    """
    # Look backward through preceding blank lines and comments
    j = sql_block_line_idx - 1
    while j >= 0 and lines[j].strip() == '':
        j -= 1

    if j >= 0:
        # Check if the line immediately before (skipping blanks) is a response annotation
        if RESPONSE_SKIP_RE.search(lines[j]):
            return ResponseMode.SKIP
        if RESPONSE_GENERATE_RE.search(lines[j]):
            return ResponseMode.GENERATE
        # Also check the case where sql-test:skip is on j, and response annotation is above that
        if is_skip_annotated:
            # sql_block_line_idx points to the skip comment, look further back
            pass
        else:
            # Check one more line back (annotations may be above a sql-test:skip comment)
            k = j - 1
            while k >= 0 and lines[k].strip() == '':
                k -= 1
            if k >= 0:
                if RESPONSE_SKIP_RE.search(lines[k]):
                    return ResponseMode.SKIP
                if RESPONSE_GENERATE_RE.search(lines[k]):
                    return ResponseMode.GENERATE

    # Fall back to page-level setting
    if page_response_generate:
        return ResponseMode.GENERATE

    return ResponseMode.MANUAL


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
