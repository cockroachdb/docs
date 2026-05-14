"""Output formatting for SQL test results."""

import sys
from typing import List

from .models import BlockType, PageResult, TestResult


def _count_blocks(pages: List[PageResult]):
    """Count blocks by type across all pages."""
    total = 0
    executable = 0
    skipped = 0
    fragments = 0
    for page in pages:
        for block in page.blocks:
            total += 1
            if block.block_type == BlockType.SKIPPED:
                skipped += 1
            elif block.block_type == BlockType.FRAGMENT:
                fragments += 1
            elif block.block_type in (BlockType.EXECUTABLE, BlockType.EXPECTED_ERROR):
                executable += 1
    return total, executable, skipped, fragments


def print_dry_run(pages: List[PageResult], verbose: bool = False) -> None:
    """Print extraction/classification summary without execution results."""
    total, executable, skipped, fragments = _count_blocks(pages)

    print(f"\n{'='*60}")
    print(f"SQL Test Dry Run Summary")
    print(f"{'='*60}")
    print(f"Pages scanned:      {len(pages)}")
    print(f"Total SQL blocks:   {total}")
    print(f"  Executable:       {executable}")
    print(f"  Expected errors:  {sum(1 for p in pages for b in p.blocks if b.block_type == BlockType.EXPECTED_ERROR)}")
    print(f"  Fragments:        {fragments}")
    print(f"  Skipped:          {skipped}")
    print(f"{'='*60}\n")

    if verbose:
        for page in pages:
            print(f"\n--- {page.file_path} ({len(page.blocks)} blocks) ---")
            for block in page.blocks:
                status = block.block_type.value.upper()
                preview = block.raw_content.split('\n')[0][:60]
                print(f"  [{status:15s}] line {block.line_number}: {preview}")
                if block.skip_reason:
                    print(f"                    skip reason: {block.skip_reason}")


def print_results(pages: List[PageResult]) -> None:
    """Print execution results to console."""
    total_tested = 0
    total_passed = 0
    total_failed = 0
    failures = []

    for page in pages:
        for result in page.results:
            total_tested += 1
            if result.success:
                total_passed += 1
            else:
                total_failed += 1
                failures.append(result)

    total, executable, skipped, fragments = _count_blocks(pages)

    print(f"\n{'='*60}")
    print(f"SQL Test Results")
    print(f"{'='*60}")
    print(f"Pages tested:       {len(pages)}")
    print(f"Total SQL blocks:   {total}")
    print(f"  Tested:           {total_tested}")
    print(f"  Passed:           {total_passed}")
    print(f"  Failed:           {total_failed}")
    print(f"  Fragments:        {fragments}")
    print(f"  Skipped:          {skipped}")
    print(f"{'='*60}")

    if failures:
        print(f"\nFailures:\n")
        for result in failures:
            block = result.block
            print(f"  FAIL: {block.file_path}:{block.line_number}")
            # Show first statement as context
            if block.cleaned_statements:
                stmt_preview = block.cleaned_statements[0][:100]
                print(f"    Statement: {stmt_preview}")
            print(f"    Error: {result.error_message}")
            print()
    else:
        print(f"\nAll tests passed.\n")


def write_github_comment(pages: List[PageResult], output_path: str = "sql-test-comment.md") -> None:
    """Write a GitHub PR comment markdown file."""
    failures = []
    total_tested = 0
    total_passed = 0

    for page in pages:
        for result in page.results:
            total_tested += 1
            if result.success:
                total_passed += 1
            else:
                failures.append(result)

    total, executable, skipped, fragments = _count_blocks(pages)

    lines = []
    if not failures:
        lines.append("**SQL Test Check Passed**")
        lines.append("")
        lines.append(f"Tested {total_tested} SQL blocks across {len(pages)} pages. All passed.")
    else:
        lines.append("**SQL Test Check Failed**")
        lines.append("")
        lines.append(f"Found {len(failures)} failure(s) out of {total_tested} tested SQL blocks.")
        lines.append("")
        lines.append("| File | Line | Error |")
        lines.append("|------|------|-------|")
        for result in failures:
            block = result.block
            error_brief = result.error_message.split('\n')[0][:120]
            lines.append(f"| `{block.file_path}` | {block.line_number} | {error_brief} |")
        lines.append("")
        lines.append("<details>")
        lines.append("<summary>Failure details</summary>")
        lines.append("")
        for result in failures:
            block = result.block
            lines.append(f"### `{block.file_path}:{block.line_number}`")
            lines.append("")
            if block.cleaned_statements:
                lines.append("```sql")
                lines.append(block.cleaned_statements[0][:200])
                lines.append("```")
            lines.append("")
            lines.append(f"**Error:** {result.error_message}")
            lines.append("")
        lines.append("</details>")

    lines.append("")
    lines.append(f"**Summary:** {total_tested} tested, {total_passed} passed, {len(failures)} failed, {fragments} fragments, {skipped} skipped")

    with open(output_path, 'w') as f:
        f.write('\n'.join(lines))
