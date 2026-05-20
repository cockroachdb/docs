"""Unit tests for the SQL response generator."""

import os
import sys
import tempfile
import unittest

# Ensure the scripts directory is on the path
sys.path.insert(0, os.path.dirname(__file__))

from sql_test.extractor import extract_blocks, _has_page_level_response_generate
from sql_test.generator import format_output, update_file_responses
from sql_test.models import BlockType, ResponseMode, SqlBlock, TestResult, PageResult


class TestFormatOutput(unittest.TestCase):
    """Tests for output formatting."""

    def test_strips_time_line(self):
        raw = "  id\n+----+\n   1\n(1 row)\n\nTime: 1ms total (execution 1ms / network 0ms)"
        result = format_output(raw)
        self.assertNotIn("Time:", result)
        self.assertIn("(1 row)", result)

    def test_strips_multiple_time_lines(self):
        raw = "result1\nTime: 2ms total\nresult2\nTime: 3ms total"
        result = format_output(raw)
        self.assertNotIn("Time:", result)
        self.assertIn("result1", result)
        self.assertIn("result2", result)

    def test_strips_leading_trailing_blanks(self):
        raw = "\n\n  id\n+----+\n   1\n\n\n"
        result = format_output(raw)
        self.assertTrue(result.startswith("  id"))
        self.assertTrue(result.endswith("1"))

    def test_strips_trailing_whitespace_per_line(self):
        raw = "  id   \n+----+   \n   1   "
        result = format_output(raw)
        for line in result.split('\n'):
            self.assertEqual(line, line.rstrip())

    def test_preserves_table_formatting(self):
        raw = "  column_name |  data_type\n+-------------+-----------+\n  id          | INT8\n(1 row)"
        result = format_output(raw)
        self.assertIn("+-------------+-----------+", result)

    def test_empty_output(self):
        result = format_output("")
        self.assertEqual(result, "")

    def test_only_time_line(self):
        raw = "Time: 1ms total (execution 1ms / network 0ms)"
        result = format_output(raw)
        self.assertEqual(result, "")

    def test_whitespace_only(self):
        raw = "   \n\n  \n"
        result = format_output(raw)
        self.assertEqual(result, "")


class TestAnnotationDetection(unittest.TestCase):
    """Tests for sql-response annotation detection."""

    def test_block_level_generate(self):
        md = """<!-- sql-response:generate -->
~~~ sql
> SELECT 1;
~~~

~~~
old output
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        self.assertEqual(result.blocks[0].response_mode, ResponseMode.GENERATE)

    def test_block_level_skip(self):
        md = """<!-- sql-response:skip reason="Output is curated" -->
~~~ sql
> SELECT 1;
~~~

~~~
curated output
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        self.assertEqual(result.blocks[0].response_mode, ResponseMode.SKIP)

    def test_block_level_skip_no_reason(self):
        md = """<!-- sql-response:skip -->
~~~ sql
> SELECT 1;
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        self.assertEqual(result.blocks[0].response_mode, ResponseMode.SKIP)

    def test_page_level_generate(self):
        md = """---
title: Test
sql_response: generate
---

~~~ sql
> SELECT 1;
~~~

~~~
old output
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        self.assertEqual(result.blocks[0].response_mode, ResponseMode.GENERATE)

    def test_page_level_generate_detected(self):
        content = "---\ntitle: Test\nsql_response: generate\n---\nBody"
        self.assertTrue(_has_page_level_response_generate(content))

    def test_page_level_generate_not_detected(self):
        content = "---\ntitle: Test\n---\nBody"
        self.assertFalse(_has_page_level_response_generate(content))

    def test_block_skip_overrides_page_generate(self):
        md = """---
title: Test
sql_response: generate
---

<!-- sql-response:skip reason="Curated" -->
~~~ sql
> SELECT 1;
~~~

~~~
curated output
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        self.assertEqual(result.blocks[0].response_mode, ResponseMode.SKIP)

    def test_no_annotation_defaults_to_manual(self):
        md = """~~~ sql
> SELECT 1;
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        self.assertEqual(result.blocks[0].response_mode, ResponseMode.MANUAL)

    def test_generate_with_blank_line_before_sql(self):
        md = """<!-- sql-response:generate -->

~~~ sql
> SELECT 1;
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        self.assertEqual(result.blocks[0].response_mode, ResponseMode.GENERATE)

    def test_sql_test_skip_and_response_generate(self):
        """A block can be skipped for testing but still have response generation."""
        md = """<!-- sql-response:generate -->
<!-- sql-test:skip reason="Not testable" -->
~~~ sql
> SELECT 1;
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        self.assertEqual(result.blocks[0].block_type, BlockType.SKIPPED)
        self.assertEqual(result.blocks[0].response_mode, ResponseMode.GENERATE)


class TestOutputBlockRange(unittest.TestCase):
    """Tests for output block range tracking."""

    def test_tracks_existing_output_block(self):
        md = """~~~ sql
> SELECT 1;
~~~

~~~
old output
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        block = result.blocks[0]
        self.assertIsNotNone(block.output_block_range)
        # The output block ~~~ opens on line index 4, closes on line index 6
        out_open, out_close = block.output_block_range
        lines = md.split('\n')
        self.assertEqual(lines[out_open].strip(), '~~~')
        self.assertEqual(lines[out_close].strip(), '~~~')

    def test_no_output_block_range_when_none(self):
        md = """~~~ sql
> SELECT 1;
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        self.assertIsNone(result.blocks[0].output_block_range)


class TestOutputBlockReplacement(unittest.TestCase):
    """Tests for replacing output blocks in files."""

    def _write_temp(self, content):
        """Write content to a temp file and return the path."""
        fd, path = tempfile.mkstemp(suffix='.md')
        with os.fdopen(fd, 'w') as f:
            f.write(content)
        return path

    def test_replace_existing_output(self):
        md = """<!-- sql-response:generate -->
~~~ sql
> SELECT 1;
~~~

~~~
old output
~~~
"""
        path = self._write_temp(md)
        try:
            page = extract_blocks(path)
            block = page.blocks[0]

            test_result = TestResult(
                block=block,
                success=True,
                actual_output="  ?column?\n+----------+\n         1\n(1 row)\n\nTime: 1ms total",
            )
            results = {block.block_index: test_result}

            file_result = update_file_responses(path, page, results, dry_run=False)
            self.assertTrue(file_result.modified)
            self.assertEqual(file_result.blocks_updated, 1)

            updated = open(path).read()
            self.assertIn("?column?", updated)
            self.assertNotIn("old output", updated)
            self.assertNotIn("Time:", updated)
        finally:
            os.unlink(path)

    def test_insert_new_output(self):
        md = """<!-- sql-response:generate -->
~~~ sql
> SELECT 1;
~~~
"""
        path = self._write_temp(md)
        try:
            page = extract_blocks(path)
            block = page.blocks[0]

            test_result = TestResult(
                block=block,
                success=True,
                actual_output="  ?column?\n+----------+\n         1\n(1 row)",
            )
            results = {block.block_index: test_result}

            file_result = update_file_responses(path, page, results, dry_run=False)
            self.assertTrue(file_result.modified)
            self.assertEqual(file_result.blocks_inserted, 1)

            updated = open(path).read()
            self.assertIn("?column?", updated)
            self.assertIn("~~~\n  ?column?", updated)
        finally:
            os.unlink(path)

    def test_unchanged_output(self):
        md = """<!-- sql-response:generate -->
~~~ sql
> SELECT 1;
~~~

~~~
  ?column?
+----------+
         1
(1 row)
~~~
"""
        path = self._write_temp(md)
        try:
            page = extract_blocks(path)
            block = page.blocks[0]

            test_result = TestResult(
                block=block,
                success=True,
                actual_output="  ?column?\n+----------+\n         1\n(1 row)",
            )
            results = {block.block_index: test_result}

            file_result = update_file_responses(path, page, results, dry_run=False)
            self.assertFalse(file_result.modified)
            self.assertEqual(file_result.blocks_unchanged, 1)
        finally:
            os.unlink(path)

    def test_dry_run_does_not_write(self):
        md = """<!-- sql-response:generate -->
~~~ sql
> SELECT 1;
~~~

~~~
old output
~~~
"""
        path = self._write_temp(md)
        try:
            page = extract_blocks(path)
            block = page.blocks[0]

            test_result = TestResult(
                block=block,
                success=True,
                actual_output="new output",
            )
            results = {block.block_index: test_result}

            file_result = update_file_responses(path, page, results, dry_run=True)
            self.assertTrue(file_result.modified)

            # File should be unchanged
            unchanged = open(path).read()
            self.assertIn("old output", unchanged)
            self.assertNotIn("new output", unchanged)
        finally:
            os.unlink(path)

    def test_skips_manual_blocks(self):
        md = """~~~ sql
> SELECT 1;
~~~

~~~
old output
~~~
"""
        path = self._write_temp(md)
        try:
            page = extract_blocks(path)
            block = page.blocks[0]
            self.assertEqual(block.response_mode, ResponseMode.MANUAL)

            test_result = TestResult(
                block=block,
                success=True,
                actual_output="new output",
            )
            results = {block.block_index: test_result}

            file_result = update_file_responses(path, page, results, dry_run=False)
            self.assertFalse(file_result.modified)
            self.assertEqual(file_result.blocks_skipped, 1)
        finally:
            os.unlink(path)

    def test_skips_fragments(self):
        md = """<!-- sql-response:generate -->
~~~ sql
> SELECT ... FROM <table>;
~~~
"""
        path = self._write_temp(md)
        try:
            page = extract_blocks(path)
            block = page.blocks[0]
            self.assertEqual(block.block_type, BlockType.FRAGMENT)

            file_result = update_file_responses(path, page, {}, dry_run=False)
            self.assertFalse(file_result.modified)
            self.assertEqual(file_result.blocks_skipped, 1)
        finally:
            os.unlink(path)

    def test_skips_failed_execution(self):
        md = """<!-- sql-response:generate -->
~~~ sql
> SELECT 1;
~~~

~~~
old output
~~~
"""
        path = self._write_temp(md)
        try:
            page = extract_blocks(path)
            block = page.blocks[0]

            test_result = TestResult(
                block=block,
                success=False,
                error_message="connection refused",
            )
            results = {block.block_index: test_result}

            file_result = update_file_responses(path, page, results, dry_run=False)
            self.assertFalse(file_result.modified)
            self.assertEqual(file_result.blocks_skipped, 1)

            unchanged = open(path).read()
            self.assertIn("old output", unchanged)
        finally:
            os.unlink(path)


class TestReverseOrderProcessing(unittest.TestCase):
    """Tests that reverse-order processing preserves line numbers."""

    def _write_temp(self, content):
        fd, path = tempfile.mkstemp(suffix='.md')
        with os.fdopen(fd, 'w') as f:
            f.write(content)
        return path

    def test_multiple_blocks_replaced_correctly(self):
        md = """<!-- sql-response:generate -->
~~~ sql
> SELECT 1;
~~~

~~~
old1
~~~

<!-- sql-response:generate -->
~~~ sql
> SELECT 2;
~~~

~~~
old2
~~~
"""
        path = self._write_temp(md)
        try:
            page = extract_blocks(path)
            self.assertEqual(len(page.blocks), 2)

            results = {}
            for block in page.blocks:
                if "SELECT 1" in block.raw_content:
                    results[block.block_index] = TestResult(
                        block=block, success=True, actual_output="new1",
                    )
                else:
                    results[block.block_index] = TestResult(
                        block=block, success=True, actual_output="new2",
                    )

            file_result = update_file_responses(path, page, results, dry_run=False)
            self.assertEqual(file_result.blocks_updated, 2)

            updated = open(path).read()
            self.assertNotIn("old1", updated)
            self.assertNotIn("old2", updated)
            self.assertIn("new1", updated)
            self.assertIn("new2", updated)

            # Verify ordering: new1 should appear before new2
            self.assertLess(updated.index("new1"), updated.index("new2"))
        finally:
            os.unlink(path)

    def test_mixed_insert_and_replace(self):
        md = """<!-- sql-response:generate -->
~~~ sql
> SELECT 1;
~~~

<!-- sql-response:generate -->
~~~ sql
> SELECT 2;
~~~

~~~
old2
~~~
"""
        path = self._write_temp(md)
        try:
            page = extract_blocks(path)
            self.assertEqual(len(page.blocks), 2)

            results = {}
            for block in page.blocks:
                if "SELECT 1" in block.raw_content:
                    results[block.block_index] = TestResult(
                        block=block, success=True, actual_output="new1",
                    )
                else:
                    results[block.block_index] = TestResult(
                        block=block, success=True, actual_output="new2",
                    )

            file_result = update_file_responses(path, page, results, dry_run=False)
            self.assertEqual(file_result.blocks_inserted, 1)
            self.assertEqual(file_result.blocks_updated, 1)

            updated = open(path).read()
            self.assertIn("new1", updated)
            self.assertIn("new2", updated)
            self.assertNotIn("old2", updated)
        finally:
            os.unlink(path)


if __name__ == '__main__':
    unittest.main()
