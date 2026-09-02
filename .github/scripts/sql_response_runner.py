#!/usr/bin/env python3
"""
sql_response_runner.py

Generates SQL response output blocks in CockroachDB documentation markdown
files by executing SQL blocks and writing their output back into the docs.

Usage:
    python sql_response_runner.py --version v26.2 --update    # write changes
    python sql_response_runner.py --version v26.2 --diff      # show diffs only
    python sql_response_runner.py --version v26.2 --check     # exit non-zero if stale
    python sql_response_runner.py src/current/v26.2/show-tables.md --update
"""

import argparse
import difflib
import os
import sys

# Ensure the scripts directory is on the path
sys.path.insert(0, os.path.dirname(__file__))

from sql_test.extractor import extract_from_files
from sql_test.executor import execute_page, DEFAULT_CONNECTION_URL
from sql_test.generator import update_file_responses, format_output
from sql_test.models import ResponseMode


def collect_files(file_args: list, version: str = None) -> list:
    """Collect markdown files to process.

    Args:
        file_args: Explicitly provided file paths.
        version: If set, find all markdown files under src/current/<version>/.

    Returns:
        List of file paths.
    """
    import glob as globmod

    files = []

    if version:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        repo_root = os.path.dirname(os.path.dirname(script_dir))
        version_dir = os.path.join(repo_root, "src", "current", version)
        if not os.path.isdir(version_dir):
            print(f"Error: version directory not found: {version_dir}", file=sys.stderr)
            sys.exit(1)
        pattern = os.path.join(version_dir, "**", "*.md")
        files = sorted(globmod.glob(pattern, recursive=True))

    if file_args:
        files.extend(file_args)

    return files


def _has_generate_blocks(page) -> bool:
    """Check if a page has any blocks with response_mode == GENERATE."""
    return any(
        b.response_mode == ResponseMode.GENERATE
        for b in page.blocks
    )


def _build_results_map(page):
    """Build a dict mapping block_index -> TestResult for a page."""
    return {r.block.block_index: r for r in page.results}


def _compute_diff(file_path: str, page, results_map: dict) -> str:
    """Compute unified diff of what would change in a file."""
    from pathlib import Path

    original = Path(file_path).read_text(encoding='utf-8')
    original_lines = original.split('\n')

    # Perform the update on a copy
    file_result = update_file_responses(file_path, page, results_map, dry_run=True)

    if not file_result.modified:
        return ""

    # Actually compute updated content by replaying the logic
    lines = list(original_lines)

    generate_blocks = []
    for block in page.blocks:
        if block.response_mode != ResponseMode.GENERATE:
            continue
        if block.block_type.value == "fragment":
            continue
        test_result = results_map.get(block.block_index)
        if test_result is None or not test_result.success:
            continue
        generate_blocks.append((block, test_result))

    generate_blocks.sort(key=lambda x: x[0].line_number, reverse=True)

    for block, test_result in generate_blocks:
        formatted = format_output(test_result.actual_output)

        if block.output_block_range is not None:
            out_open, out_close = block.output_block_range
            existing_content = '\n'.join(lines[out_open + 1:out_close])
            if existing_content != formatted:
                lines = lines[:out_open + 1] + formatted.split('\n') + lines[out_close:]
        else:
            sql_open_idx = block.line_number - 1
            sql_close_idx = sql_open_idx + 1
            while sql_close_idx < len(lines) and lines[sql_close_idx].strip() != '~~~':
                sql_close_idx += 1
            insert_idx = sql_close_idx + 1
            new_block_lines = ['', '~~~'] + formatted.split('\n') + ['~~~']
            lines = lines[:insert_idx] + new_block_lines + lines[insert_idx:]

    updated = '\n'.join(lines)
    if original == updated:
        return ""

    diff = difflib.unified_diff(
        original.splitlines(keepends=True),
        updated.splitlines(keepends=True),
        fromfile=f"a/{file_path}",
        tofile=f"b/{file_path}",
    )
    return ''.join(diff)


def main():
    parser = argparse.ArgumentParser(
        description="Generate SQL response output blocks in CockroachDB documentation."
    )
    parser.add_argument(
        "files", nargs="*", help="Markdown files to process."
    )
    parser.add_argument(
        "--version", type=str, default=None,
        help="Process all files in a version directory (e.g., v26.2)."
    )
    parser.add_argument(
        "--connection-url", type=str, default=DEFAULT_CONNECTION_URL,
        help=f"CockroachDB connection URL (default: {DEFAULT_CONNECTION_URL})."
    )

    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument(
        "--update", action="store_true",
        help="Write updated output blocks back to files."
    )
    mode.add_argument(
        "--diff", action="store_true",
        help="Show unified diff of what would change (no writes)."
    )
    mode.add_argument(
        "--check", action="store_true",
        help="Exit non-zero if any output is stale (for CI)."
    )

    parser.add_argument(
        "--verbose", action="store_true",
        help="Show detailed progress."
    )

    args = parser.parse_args()

    # Collect files
    files = collect_files(args.files, args.version)
    if not files:
        print("No files to process. Provide file paths or --version.", file=sys.stderr)
        sys.exit(1)

    # Extract blocks
    pages = extract_from_files(files)

    # Filter to pages that have at least one GENERATE block
    pages_with_generate = [p for p in pages if _has_generate_blocks(p)]

    if not pages_with_generate:
        print("No blocks with sql-response:generate found.")
        sys.exit(0)

    if args.verbose:
        total_generate = sum(
            1 for p in pages_with_generate for b in p.blocks
            if b.response_mode == ResponseMode.GENERATE
        )
        print(f"Found {total_generate} generate block(s) across {len(pages_with_generate)} file(s).")

    # Execute pages
    stale_count = 0
    total_updated = 0
    total_inserted = 0
    total_unchanged = 0

    for page in pages_with_generate:
        if args.verbose:
            print(f"Executing {page.file_path}...")

        execute_page(page, connection_url=args.connection_url)
        results_map = _build_results_map(page)

        if args.update:
            file_result = update_file_responses(
                page.file_path, page, results_map, dry_run=False
            )
            total_updated += file_result.blocks_updated
            total_inserted += file_result.blocks_inserted
            total_unchanged += file_result.blocks_unchanged

            if args.verbose and file_result.modified:
                print(f"  Updated: {file_result.blocks_updated} replaced, {file_result.blocks_inserted} inserted")

        elif args.diff:
            diff_output = _compute_diff(page.file_path, page, results_map)
            if diff_output:
                print(diff_output)
                stale_count += 1

        elif args.check:
            file_result = update_file_responses(
                page.file_path, page, results_map, dry_run=True
            )
            if file_result.modified:
                stale_count += 1
                print(f"STALE: {page.file_path} ({file_result.blocks_updated} to replace, {file_result.blocks_inserted} to insert)")

    # Summary
    if args.update:
        print(f"\nDone. {total_updated} replaced, {total_inserted} inserted, {total_unchanged} unchanged.")
    elif args.diff:
        if stale_count == 0:
            print("All output blocks are up to date.")
    elif args.check:
        if stale_count > 0:
            print(f"\n{stale_count} file(s) have stale output blocks.", file=sys.stderr)
            sys.exit(1)
        else:
            print("All output blocks are up to date.")


if __name__ == "__main__":
    main()
