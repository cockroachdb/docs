#!/usr/bin/env python3
"""
test_cross_version_linter.py

Unit tests for the cross-version link linter.
"""

import unittest
import tempfile
import os
from pathlib import Path
import sys

# Add the script directory to path to import the linter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from cross_version_link_linter import CrossVersionLinkLinter


class TestCrossVersionLinkLinter(unittest.TestCase):
    """Test cases for the CrossVersionLinkLinter."""

    def setUp(self):
        """Set up test fixtures."""
        self.linter = CrossVersionLinkLinter(verbose=False)

    def test_extract_file_version(self):
        """Test version extraction from file paths."""
        test_cases = [
            (Path('src/current/v25.4/backup.md'), 'v25.4'),
            (Path('src/current/v26.1/restore.md'), 'v26.1'),
            (Path('src/current/_includes/v23.1/header.md'), 'v23.1'),
            (Path('src/current/index.md'), None),  # No version
            (Path('README.md'), None),  # No version
        ]

        for path, expected in test_cases:
            result = self.linter.extract_file_version(path)
            self.assertEqual(result, expected, f"Failed for path: {path}")

    def test_liquid_link_detection(self):
        """Test detection of hard-coded liquid link tags."""
        content = """
        Here's a valid link: {% link {{ page.version.version }}/backup.md %}
        Here's a problematic link: {% link v21.2/take-full-and-incremental-backups.md %}
        Another bad one: {% link v23.1/restore.md %}#section
        """

        violations = self.linter.find_violations(
            Path('src/current/v26.1/test.md'),
            content
        )

        # Should find 2 violations (v21.2 and v23.1)
        self.assertEqual(len(violations), 2)
        self.assertEqual(violations[0]['target_version'], 'v21.2')
        self.assertEqual(violations[1]['target_version'], 'v23.1')

    def test_include_detection(self):
        """Test detection of include statements with wrong versions."""
        content = """
        Good include: {% include_cached {{ page.version.version }}/prod-deployment/provision.md %}
        Bad include: {% include_cached v22.1/prod-deployment/provision-storage.md %}
        Another bad: {% include v20.1/sidebar.md %}
        """

        violations = self.linter.find_violations(
            Path('src/current/v26.1/test.md'),
            content
        )

        # Should find 2 violations
        self.assertEqual(len(violations), 2)
        self.assertEqual(violations[0]['target_version'], 'v22.1')
        self.assertEqual(violations[0]['type'], 'include_cached')
        self.assertEqual(violations[1]['target_version'], 'v20.1')
        self.assertEqual(violations[1]['type'], 'include')

    def test_image_ref_detection(self):
        """Test detection of image references with wrong versions."""
        content = """
        Good image: {{ 'images/{{ page.version.version }}/diagram.png' | relative_url }}
        Bad image: {{ 'images/v22.2/hasura-ca-cert.png' | relative_url }}
        Another bad: {{ 'images/v19.1/old-diagram.png' | relative_url }}
        """

        violations = self.linter.find_violations(
            Path('src/current/v26.1/test.md'),
            content
        )

        # Should find 2 violations
        self.assertEqual(len(violations), 2)
        self.assertEqual(violations[0]['target_version'], 'v22.2')
        self.assertEqual(violations[1]['target_version'], 'v19.1')

    def test_markdown_links_detection(self):
        """Test detection of markdown links with cross-version references."""
        content = """
        [Link to same version](backup.md)
        [Cross-version link](../v23.1/restore.md)
        [Another cross-version](/docs/v20.1/migration.md)
        """

        violations = self.linter.find_violations(
            Path('src/current/v26.1/test.md'),
            content
        )

        # Should find 2 violations
        self.assertEqual(len(violations), 2)
        self.assertEqual(violations[0]['target_version'], 'v23.1')
        self.assertEqual(violations[0]['type'], 'markdown_relative')
        self.assertEqual(violations[1]['target_version'], 'v20.1')
        self.assertEqual(violations[1]['type'], 'markdown_absolute')

    def test_allowed_patterns(self):
        """Test that allowed patterns are not flagged."""
        content = """
        {% link {{ page.version.version }}/backup.md %}
        {% link {{ site.versions["stable"] }}/restore.md %}
        {% include_cached {{ page.version.version }}/header.md %}
        {{ 'images/{{ page.version.version }}/diagram.png' | relative_url }}
        """

        violations = self.linter.find_violations(
            Path('src/current/v26.1/test.md'),
            content
        )

        # Should find no violations
        self.assertEqual(len(violations), 0)

    def test_same_version_links(self):
        """Test that links within the same version are not flagged."""
        content = """
        {% link v26.1/backup.md %}
        {% include_cached v26.1/header.md %}
        {{ 'images/v26.1/diagram.png' | relative_url }}
        """

        violations = self.linter.find_violations(
            Path('src/current/v26.1/test.md'),
            content
        )

        # Should find no violations (all links are to the same version)
        self.assertEqual(len(violations), 0)

    def test_fix_generation(self):
        """Test that fix suggestions are generated correctly."""
        test_cases = [
            ('liquid_link', '{% link v21.2/backup.md %}', '{% link {{ page.version.version }}/backup.md %}'),
            ('include_cached', '{% include_cached v22.1/header.md %}', '{% include_cached {{ page.version.version }}/header.md %}'),
            ('include', '{% include v20.1/sidebar.md %}', '{% include {{ page.version.version }}/sidebar.md %}'),
            ('image_ref', "{{ 'images/v19.1/diagram.png' | relative_url }}", "{{ 'images/{{ page.version.version }}/diagram.png' | relative_url }}"),
        ]

        for pattern_type, original, expected_fix in test_cases:
            fix = self.linter.generate_fix(pattern_type, original, 'v26.1')
            self.assertIn('{{ page.version.version }}', fix, f"Fix for {pattern_type} doesn't contain version variable")

    def test_html_link_detection(self):
        """Test detection of HTML anchor tags with cross-version references."""
        content = """
        <a href="/docs/v20.1/backup.html">Old backup docs</a>
        <a href="v21.2/restore.html">Restore guide</a>
        <a href="{{ page.version.version }}/migrate.html">Migration</a>
        """

        violations = self.linter.find_violations(
            Path('src/current/v26.1/test.md'),
            content
        )

        # Should find 2 violations (v20.1 and v21.2)
        self.assertEqual(len(violations), 2)
        self.assertEqual(violations[0]['target_version'], 'v20.1')
        self.assertEqual(violations[1]['target_version'], 'v21.2')

    def test_line_number_accuracy(self):
        """Test that line numbers are reported correctly."""
        content = """Line 1
Line 2
Line 3 with {% link v21.2/backup.md %}
Line 4
Line 5 with {% include v20.1/header.md %}
Line 6"""

        violations = self.linter.find_violations(
            Path('src/current/v26.1/test.md'),
            content
        )

        self.assertEqual(len(violations), 2)
        self.assertEqual(violations[0]['line'], 3)
        self.assertEqual(violations[1]['line'], 5)

    def test_file_without_version(self):
        """Test that files without version in path are skipped."""
        content = """
        {% link v21.2/backup.md %}
        {% include v20.1/header.md %}
        """

        violations = self.linter.find_violations(
            Path('src/current/README.md'),  # No version in path
            content
        )

        # Should find no violations (file skipped)
        self.assertEqual(len(violations), 0)

    def test_case_insensitive_detection(self):
        """Test that patterns are detected case-insensitively."""
        content = """
        {% LINK v21.2/backup.md %}
        {% Include_Cached v20.1/header.md %}
        """

        violations = self.linter.find_violations(
            Path('src/current/v26.1/test.md'),
            content
        )

        # Should find 2 violations despite different casing
        self.assertEqual(len(violations), 2)

    def test_complex_real_world_example(self):
        """Test with a complex real-world example."""
        content = """---
title: Backup and Restore
---

# Backup and Restore

For information about backups in v21.2, see {% link v21.2/take-full-and-incremental-backups.md %}#backup-collections.

## Configuration

Make sure to provision storage as described in {% include_cached v22.1/prod-deployment/provision-storage.md %}.

## UI Screenshots

Here's the backup UI:

<img src="{{ 'images/v22.2/backup-ui.png' | relative_url }}" alt="Backup UI" />

## Related Documentation

- [Restore Guide](../v20.1/restore.md)
- [Migration from v19.1](/docs/v19.1/migration.html)
- <a href="v18.2/legacy.html">Legacy Documentation</a>
"""

        violations = self.linter.find_violations(
            Path('src/current/v26.1/backup.md'),
            content
        )

        # Should find 6 violations
        self.assertEqual(len(violations), 6)

        # Verify each violation
        versions_found = [v['target_version'] for v in violations]
        self.assertIn('v21.2', versions_found)
        self.assertIn('v22.1', versions_found)
        self.assertIn('v22.2', versions_found)
        self.assertIn('v20.1', versions_found)
        self.assertIn('v19.1', versions_found)
        self.assertIn('v18.2', versions_found)

    def test_github_comment_formatting(self):
        """Test that GitHub comment is formatted correctly."""
        # Create some violations
        content = """
        {% link v21.2/backup.md %}
        {% include v20.1/header.md %}
        """

        violations = self.linter.find_violations(
            Path('src/current/v26.1/test.md'),
            content
        )

        self.linter.violations = violations
        comment = self.linter.format_violations_for_github()

        # Check that comment contains expected elements
        self.assertIn('❌ **Cross-Version Link Check Failed**', comment)
        self.assertIn('Found 2 cross-version link violations', comment)
        self.assertIn('v21.2', comment)
        self.assertIn('v20.1', comment)
        self.assertIn('Suggested fix:', comment)
        self.assertIn('{{ page.version.version }}', comment)

    def test_no_violations_message(self):
        """Test message when no violations are found."""
        self.linter.violations = []
        comment = self.linter.format_violations_for_github()
        self.assertIn('✅ **Cross-Version Link Check Passed**', comment)

    def test_markdown_links_multi_level_parent(self):
        """Test detection of markdown links with multiple ../ levels."""
        content = "[Multi](../../v23.1/restore.md)"
        violations = self.linter.find_violations(Path('src/current/v26.1/test.md'), content)
        self.assertEqual(len(violations), 1)
        self.assertEqual(violations[0]['target_version'], 'v23.1')

    def test_markdown_links_three_level_parent(self):
        """Test detection of markdown links with three ../ levels."""
        content = "[Deep](../../../v22.2/backup.md)"
        violations = self.linter.find_violations(Path('src/current/v26.1/deep/nested/test.md'), content)
        self.assertEqual(len(violations), 1)
        self.assertEqual(violations[0]['target_version'], 'v22.2')

    def test_site_versions_bracket_notation_allowed(self):
        """Test that site.versions bracket notation is not flagged."""
        content = '{% link {{ site.versions["stable"] }}/backup.md %}'
        violations = self.linter.find_violations(Path('src/current/v26.1/test.md'), content)
        self.assertEqual(len(violations), 0)

    def test_site_versions_dot_notation_allowed(self):
        """Test that site.versions dot notation is not flagged."""
        content = '{% link {{ site.versions.stable }}/backup.md %}'
        violations = self.linter.find_violations(Path('src/current/v26.1/test.md'), content)
        self.assertEqual(len(violations), 0)

    def test_image_ref_fix_generation(self):
        """Test that image_ref fix generation works correctly."""
        original = "{{ 'images/v22.2/diagram.png' | relative_url }}"
        fix = self.linter.generate_fix('image_ref', original, 'v26.1')
        self.assertIn('images/{{ page.version.version }}/', fix)
        self.assertNotIn('v22.2', fix)

    def test_markdown_fix_nested_paths(self):
        """Test that markdown fix preserves nested directory paths."""
        original = "[Restore](../v23.1/admin/restore.md)"
        fix = self.linter.generate_fix('markdown_relative', original, 'v26.1')
        self.assertIn('admin/restore.md', fix)
        self.assertIn('{{ page.version.version }}', fix)

    def test_markdown_fix_complex_filename(self):
        """Test that markdown fix handles filenames with dots."""
        original = "[Guide](../v23.1/backup-and-restore.overview.md)"
        fix = self.linter.generate_fix('markdown_relative', original, 'v26.1')
        self.assertIn('backup-and-restore.overview.md', fix)
        self.assertIn('{{ page.version.version }}', fix)

    def test_markdown_fix_deeply_nested_path(self):
        """Test that markdown fix handles deeply nested paths."""
        original = "[Config](/docs/v20.1/cockroachcloud/production/settings.md)"
        fix = self.linter.generate_fix('markdown_absolute', original, 'v26.1')
        self.assertIn('cockroachcloud/production/settings.md', fix)
        self.assertIn('{{ page.version.version }}', fix)


class TestIntegration(unittest.TestCase):
    """Integration tests for the linter."""

    def test_check_file_integration(self):
        """Test checking an actual file end-to-end."""
        # Create a temporary file with violations
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as f:
            # Use a path that contains a version
            test_path = Path(f.name)
            # We need to mock the path to include a version
            mock_path = Path('src/current/v26.1/test.md')

            f.write("""
# Test Document

Here's a cross-version link: {% link v21.2/backup.md %}
And an include: {% include v20.1/header.md %}
And an image: {{ 'images/v19.1/diagram.png' | relative_url }}
""")
            f.flush()

            linter = CrossVersionLinkLinter()

            # Read the content
            with open(test_path, 'r') as content_file:
                content = content_file.read()

            # Find violations using the mock path
            violations = linter.find_violations(mock_path, content)

            # Should find 3 violations
            self.assertEqual(len(violations), 3)

            # Clean up
            os.unlink(f.name)


if __name__ == '__main__':
    # Run tests with verbose output
    unittest.main(verbosity=2)