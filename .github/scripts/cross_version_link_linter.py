#!/usr/bin/env python3
"""
cross_version_link_linter.py

Detects and prevents cross-version links in CockroachDB documentation.
This linter runs on PRs to ensure documentation links stay within the same version.

Usage:
    python cross_version_link_linter.py <file1> <file2> ...
"""

import re
import sys
import json
import os
from pathlib import Path
from typing import List, Dict, Optional, Tuple


class CrossVersionLinkLinter:
    """Linter to detect cross-version links in CockroachDB documentation."""

    # Regex patterns to detect different types of cross-version links
    # Note: Version capture group should always be the first group for consistency
    PATTERNS = {
        'liquid_link': r'{%\s*link\s+(v\d+\.\d+)/[^%]*%}',
        'include_cached': r'{%\s*include_cached\s+(v\d+\.\d+)/[^%]*%}',
        'include': r'{%\s*include\s+(v\d+\.\d+)/[^%]*%}',
        'image_ref': r"{{\s*'images/(v\d+\.\d+)/[^']*'\s*\|\s*relative_url\s*}}",
        'markdown_relative': r'\[[^\]]+\]\((?:\.\./)+(v\d+\.\d+)/[^\)]+\)',
        'markdown_absolute': r'\[[^\]]+\]\(/docs/(v\d+\.\d+)/[^\)]+\)',
        'html_link': r'<a[^>]*href=["\']/?(?:docs/)?(v\d+\.\d+)/[^"\']+["\'][^>]*>',
    }

    # Patterns that are allowed (using dynamic version variables)
    ALLOWED_PATTERNS = [
        r'page\.version\.version',
        r'site\.versions(?:\.|\[)',
        r'include\.version',
        r'page\.release_info',
    ]

    def __init__(self, verbose: bool = False):
        """Initialize the linter."""
        self.verbose = verbose
        self.violations = []

    def extract_file_version(self, filepath: Path) -> Optional[str]:
        """
        Extract the version from a file path.

        Args:
            filepath: Path to the file

        Returns:
            Version string (e.g., 'v25.4') or None if no version found
        """
        parts = filepath.parts
        for part in parts:
            if re.match(r'^v\d+\.\d+$', part):
                return part
        return None

    def is_allowed_pattern(self, text: str) -> bool:
        """
        Check if the text contains an allowed dynamic version pattern.

        Args:
            text: The text to check

        Returns:
            True if the pattern is allowed (uses dynamic variables)
        """
        for pattern in self.ALLOWED_PATTERNS:
            if re.search(pattern, text):
                return True
        return False

    def generate_fix(self, pattern_type: str, original: str, source_version: str) -> str:
        """
        Generate a fix suggestion for the violation.

        Args:
            pattern_type: Type of the pattern that was matched
            original: The original problematic text
            source_version: The version the file belongs to

        Returns:
            Suggested fix for the violation
        """
        if pattern_type == 'liquid_link':
            return re.sub(r'v\d+\.\d+', '{{ page.version.version }}', original)
        elif pattern_type in ['include_cached', 'include']:
            # For includes, we need to be careful about the path structure
            return re.sub(r'v\d+\.\d+', '{{ page.version.version }}', original)
        elif pattern_type == 'image_ref':
            # Fix image references to use dynamic version
            return re.sub(r'(images/)(v\d+\.\d+)(/)', r'\1{{ page.version.version }}\3', original)
        elif pattern_type in ['markdown_relative', 'markdown_absolute']:
            # For markdown links, suggest using Jekyll link syntax
            link_match = re.search(r'\[([^\]]+)\]\([^\)]+\)', original)
            if link_match:
                link_text = link_match.group(1)
                # Extract the full path after the version token
                path_match = re.search(r'v\d+\.\d+/([^\)]+)', original)
                if path_match:
                    page_path = path_match.group(1)  # e.g. 'admin/restore.md'
                    return f'[{link_text}]({{% link {{{{ page.version.version }}}}/{page_path} %}})'
            return "Use {% link {{ page.version.version }}/page.md %} syntax"
        else:
            return "Use appropriate version variable or relative path within same version"

    def find_violations(self, filepath: Path, content: str) -> List[Dict]:
        """
        Find all cross-version link violations in a file.

        Args:
            filepath: Path to the file
            content: File content

        Returns:
            List of violation dictionaries
        """
        source_version = self.extract_file_version(filepath)
        if not source_version:
            # File doesn't have a version in its path, skip checking
            if self.verbose:
                print(f"Skipping {filepath}: No version in path")
            return []

        violations = []
        lines = content.split('\n')

        for pattern_name, pattern in self.PATTERNS.items():
            for match in re.finditer(pattern, content, re.MULTILINE | re.IGNORECASE):
                # Check if this is an allowed pattern (uses dynamic variables)
                if self.is_allowed_pattern(match.group(0)):
                    continue

                # Extract target version from the match
                target_version = match.group(1)

                # Check if it's a cross-version link
                if target_version != source_version:
                    # Calculate line number
                    line_num = content[:match.start()].count('\n') + 1

                    # Get the actual line content for context
                    line_content = lines[line_num - 1].strip() if line_num <= len(lines) else ""

                    # Generate fix suggestion
                    fix = self.generate_fix(pattern_name, match.group(0), source_version)

                    violations.append({
                        'file': str(filepath),
                        'line': line_num,
                        'source_version': source_version,
                        'target_version': target_version,
                        'link': match.group(0),
                        'line_content': line_content,
                        'fix': fix,
                        'type': pattern_name
                    })

        return violations

    def check_file(self, filepath: str) -> List[Dict]:
        """
        Check a single file for cross-version link violations.

        Args:
            filepath: Path to the file to check

        Returns:
            List of violations found
        """
        path = Path(filepath)

        # Skip non-markdown files
        if not path.suffix in ['.md', '.markdown']:
            if self.verbose:
                print(f"Skipping non-markdown file: {filepath}")
            return []

        # Skip if file doesn't exist
        if not path.exists():
            if self.verbose:
                print(f"File not found: {filepath}")
            return []

        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {filepath}: {e}", file=sys.stderr)
            return []

        violations = self.find_violations(path, content)
        self.violations.extend(violations)
        return violations

    def format_violations_for_github(self) -> str:
        """
        Format violations as a GitHub comment.

        Returns:
            Formatted markdown string for GitHub comment
        """
        if not self.violations:
            return "✅ **Cross-Version Link Check Passed**\n\nNo cross-version links detected."

        # Group violations by file
        violations_by_file = {}
        for v in self.violations:
            file_path = v['file']
            if file_path not in violations_by_file:
                violations_by_file[file_path] = []
            violations_by_file[file_path].append(v)

        # Build the comment
        lines = [
            "❌ **Cross-Version Link Check Failed**",
            "",
            f"Found {len(self.violations)} cross-version link violation{'s' if len(self.violations) > 1 else ''} that must be fixed:",
            ""
        ]

        for file_path, file_violations in violations_by_file.items():
            lines.append("---")
            lines.append("")
            lines.append(f"### File: `{file_path}`")
            lines.append("")

            for v in file_violations:
                lines.append(f"**Line {v['line']}**: Link from {v['source_version']} to {v['target_version']} detected")
                lines.append(f"```")
                lines.append(f"{v['link']}")
                lines.append(f"```")
                lines.append(f"**Suggested fix:**")
                lines.append(f"```")
                lines.append(f"{v['fix']}")
                lines.append(f"```")
                lines.append("")

        lines.extend([
            "---",
            "",
            "**Action Required**: Please update all cross-version links to use version variables or ensure links stay within the same version.",
            "",
            "For more information about proper link formatting, see the [CockroachDB Docs Style Guide](https://github.com/cockroachdb/docs/blob/main/StyleGuide.md#links)."
        ])

        return "\n".join(lines)

    def print_violations(self):
        """Print violations to stderr in a human-readable format."""
        if not self.violations:
            return

        print("\n❌ Cross-version link violations found:\n", file=sys.stderr)

        for v in self.violations:
            print(f"File: {v['file']}", file=sys.stderr)
            print(f"  Line {v['line']}: Link from {v['source_version']} to {v['target_version']}", file=sys.stderr)
            print(f"  Problematic link: {v['link']}", file=sys.stderr)
            print(f"  Fix: {v['fix']}", file=sys.stderr)
            print(file=sys.stderr)


def main():
    """Main entry point for the linter."""
    if len(sys.argv) < 2:
        print("Usage: python cross_version_link_linter.py <file1> [file2] ...", file=sys.stderr)
        sys.exit(1)

    # Parse command line arguments
    verbose = os.environ.get('VERBOSE', '').lower() in ['true', '1', 'yes']

    # Get list of files to check
    # Files can be passed as separate arguments or as a single space-separated string
    files = []
    for arg in sys.argv[1:]:
        if ' ' in arg:
            # Split space-separated list
            files.extend(arg.split())
        else:
            files.append(arg)

    # Initialize linter
    linter = CrossVersionLinkLinter(verbose=verbose)

    # Check each file
    for filepath in files:
        if verbose:
            print(f"Checking {filepath}...")
        linter.check_file(filepath)

    # Print violations to stderr
    linter.print_violations()

    # If running in GitHub Actions, write comment to file
    if os.environ.get('GITHUB_ACTIONS'):
        comment = linter.format_violations_for_github()
        comment_file = os.environ.get('GITHUB_STEP_SUMMARY')
        if comment_file:
            with open(comment_file, 'w') as f:
                f.write(comment)

        # Also write to a file for the PR comment action
        with open('pr-comment.md', 'w') as f:
            f.write(comment)

    # Exit with appropriate code
    if linter.violations:
        print(f"\n❌ Found {len(linter.violations)} cross-version link violation(s)", file=sys.stderr)
        sys.exit(1)
    else:
        print("✅ No cross-version link violations found")
        sys.exit(0)


if __name__ == '__main__':
    main()