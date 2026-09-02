#!/usr/bin/env python3
"""
sql_test_runner.py

Extracts SQL code blocks from CockroachDB documentation markdown files
and optionally executes them against a CockroachDB cluster.

Usage:
    python sql_test_runner.py <file1> [file2] ...
    python sql_test_runner.py --version v25.4
    python sql_test_runner.py --dry-run --version v25.4
"""

import argparse
import glob
import os
import sys

# Ensure the scripts directory is on the path
sys.path.insert(0, os.path.dirname(__file__))

from sql_test.extractor import extract_blocks, extract_from_files
from sql_test.executor import execute_page, DEFAULT_CONNECTION_URL
from sql_test.reporter import print_dry_run, print_results, write_github_comment


def collect_files(file_args: list, version: str = None) -> list:
    """Collect markdown files to test.

    Args:
        file_args: Explicitly provided file paths.
        version: If set, find all markdown files under src/current/<version>/.

    Returns:
        List of file paths.
    """
    files = []

    if version:
        # Find repo root by looking for src/current/ relative to this script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        repo_root = os.path.dirname(os.path.dirname(script_dir))
        version_dir = os.path.join(repo_root, "src", "current", version)
        if not os.path.isdir(version_dir):
            print(f"Error: version directory not found: {version_dir}", file=sys.stderr)
            sys.exit(1)
        pattern = os.path.join(version_dir, "**", "*.md")
        files = sorted(glob.glob(pattern, recursive=True))

    if file_args:
        files.extend(file_args)

    return files


def main():
    parser = argparse.ArgumentParser(
        description="Test SQL code blocks in CockroachDB documentation."
    )
    parser.add_argument(
        "files", nargs="*", help="Markdown files to test."
    )
    parser.add_argument(
        "--version", type=str, default=None,
        help="Test all files in a version directory (e.g., v25.4)."
    )
    parser.add_argument(
        "--connection-url", type=str, default=DEFAULT_CONNECTION_URL,
        help=f"CockroachDB connection URL (default: {DEFAULT_CONNECTION_URL})."
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Extract and classify blocks only, no execution."
    )
    parser.add_argument(
        "--verbose", action="store_true",
        help="Show all blocks including skipped and fragments."
    )

    args = parser.parse_args()

    # Collect files
    files = collect_files(args.files, args.version)
    if not files:
        print("No files to test. Provide file paths or --version.", file=sys.stderr)
        sys.exit(1)

    if args.verbose:
        print(f"Scanning {len(files)} file(s)...")

    # Extract blocks from all files
    pages = extract_from_files(files)

    if not pages:
        print("No SQL blocks found in the provided files.")
        sys.exit(0)

    if args.dry_run:
        print_dry_run(pages, verbose=args.verbose)
        sys.exit(0)

    # Execute blocks
    has_failures = False
    for page in pages:
        if args.verbose:
            executable_count = sum(
                1 for b in page.blocks
                if b.block_type.value in ("executable", "expected_error")
            )
            print(f"Testing {page.file_path} ({executable_count} executable blocks)...")

        execute_page(page, connection_url=args.connection_url)

        for result in page.results:
            if not result.success:
                has_failures = True

    # Report results
    print_results(pages)

    # Write GitHub comment if in CI
    if os.environ.get("GITHUB_ACTIONS"):
        write_github_comment(pages)

    sys.exit(1 if has_failures else 0)


if __name__ == "__main__":
    main()
