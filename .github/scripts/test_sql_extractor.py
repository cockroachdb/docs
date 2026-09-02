"""Unit tests for the SQL block extractor."""

import sys
import os
import unittest

# Ensure the scripts directory is on the path
sys.path.insert(0, os.path.dirname(__file__))

from sql_test.extractor import extract_blocks, _clean_sql_lines, _has_page_level_skip
from sql_test.models import BlockType


class TestCleanSqlLines(unittest.TestCase):
    """Tests for SQL line cleaning."""

    def test_strips_prompt_prefix(self):
        raw = "> SELECT 1;"
        stmts = _clean_sql_lines(raw)
        self.assertEqual(stmts, ["SELECT 1;"])

    def test_strips_bare_prompt(self):
        raw = ">\n> SELECT 1;"
        stmts = _clean_sql_lines(raw)
        self.assertEqual(stmts, ["SELECT 1;"])

    def test_no_prefix(self):
        raw = "SELECT 1;"
        stmts = _clean_sql_lines(raw)
        self.assertEqual(stmts, ["SELECT 1;"])

    def test_multiline_statement(self):
        raw = "> SELECT\n>   id, name\n> FROM users;"
        stmts = _clean_sql_lines(raw)
        self.assertEqual(len(stmts), 1)
        self.assertIn("SELECT", stmts[0])
        self.assertIn("FROM users;", stmts[0])

    def test_multiple_statements(self):
        raw = "> CREATE TABLE t (id INT);\n> INSERT INTO t VALUES (1);"
        stmts = _clean_sql_lines(raw)
        self.assertEqual(len(stmts), 2)
        self.assertIn("CREATE TABLE", stmts[0])
        self.assertIn("INSERT INTO", stmts[1])

    def test_empty_content(self):
        self.assertEqual(_clean_sql_lines(""), [])
        self.assertEqual(_clean_sql_lines("  \n  "), [])


class TestHasPageLevelSkip(unittest.TestCase):
    """Tests for page-level skip detection."""

    def test_detects_skip(self):
        content = "---\ntitle: Test\nsql_test: skip\n---\nBody"
        self.assertTrue(_has_page_level_skip(content))

    def test_no_skip(self):
        content = "---\ntitle: Test\n---\nBody"
        self.assertFalse(_has_page_level_skip(content))

    def test_no_frontmatter(self):
        content = "No frontmatter here\n~~~ sql\nSELECT 1;\n~~~"
        self.assertFalse(_has_page_level_skip(content))


class TestExtractBlocks(unittest.TestCase):
    """Tests for block extraction and classification."""

    def test_basic_executable_block(self):
        md = """---
title: Test
---

~~~ sql
> SELECT 1;
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        block = result.blocks[0]
        self.assertEqual(block.block_type, BlockType.EXECUTABLE)
        self.assertEqual(block.cleaned_statements, ["SELECT 1;"])
        self.assertEqual(block.line_number, 5)

    def test_block_with_output(self):
        md = """~~~ sql
> SELECT 1;
~~~

~~~
  ?column?
+----------+
         1
(1 row)
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        block = result.blocks[0]
        self.assertEqual(block.block_type, BlockType.EXECUTABLE)
        self.assertIsNotNone(block.expected_output)
        self.assertIn("?column?", block.expected_output)

    def test_expected_error_pq(self):
        md = """~~~ sql
> INSERT INTO t VALUES (1);
~~~

~~~
pq: duplicate key value violates unique constraint
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        self.assertEqual(result.blocks[0].block_type, BlockType.EXPECTED_ERROR)

    def test_expected_error_ERROR(self):
        md = """~~~ sql
> DROP TABLE nonexistent;
~~~

~~~
ERROR: relation "nonexistent" does not exist
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        self.assertEqual(result.blocks[0].block_type, BlockType.EXPECTED_ERROR)

    def test_fragment_with_ellipsis(self):
        md = """~~~ sql
> SELECT ...;
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        self.assertEqual(result.blocks[0].block_type, BlockType.FRAGMENT)

    def test_fragment_with_placeholder(self):
        md = """~~~ sql
ALTER ROLE <username> SET copy_from_retries_enabled = true;
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        self.assertEqual(result.blocks[0].block_type, BlockType.FRAGMENT)

    def test_fragment_with_curly_placeholder(self):
        md = """~~~ sql
ALTER ROLE {username} SET copy_from_retries_enabled = true;
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        self.assertEqual(result.blocks[0].block_type, BlockType.FRAGMENT)

    def test_fragment_with_remote_include(self):
        md = """~~~ sql
{% remote_include https://example.com/snippet.sql %}
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        self.assertEqual(result.blocks[0].block_type, BlockType.FRAGMENT)

    def test_skip_annotation(self):
        md = """<!-- sql-test:skip reason="Demonstrates invalid syntax" -->
~~~ sql
> SLEECT * FORM users;
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        block = result.blocks[0]
        self.assertEqual(block.block_type, BlockType.SKIPPED)
        self.assertEqual(block.skip_reason, "Demonstrates invalid syntax")

    def test_skip_annotation_no_reason(self):
        md = """<!-- sql-test:skip -->
~~~ sql
> SELECT 1;
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        self.assertEqual(result.blocks[0].block_type, BlockType.SKIPPED)

    def test_page_level_skip(self):
        md = """---
title: Test
sql_test: skip
---

~~~ sql
> SELECT 1;
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        self.assertEqual(result.blocks[0].block_type, BlockType.SKIPPED)

    def test_multiple_blocks_preserve_order(self):
        md = """~~~ sql
> CREATE TABLE t (id INT PRIMARY KEY);
~~~

~~~ sql
> INSERT INTO t VALUES (1);
~~~

~~~ sql
> SELECT * FROM t;
~~~

~~~
  id
+----+
   1
(1 row)
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 3)
        self.assertEqual(result.blocks[0].block_index, 0)
        self.assertEqual(result.blocks[1].block_index, 1)
        self.assertEqual(result.blocks[2].block_index, 2)
        # Only the last block has expected output
        self.assertIsNone(result.blocks[0].expected_output)
        self.assertIsNone(result.blocks[1].expected_output)
        self.assertIsNotNone(result.blocks[2].expected_output)

    def test_ignores_non_sql_blocks(self):
        md = """~~~ shell
$ cockroach start --insecure
~~~

~~~ sql
> SELECT 1;
~~~

~~~ json
{"key": "value"}
~~~
"""
        result = extract_blocks("test.md", content=md)
        # Should only extract the sql block, not shell or json
        self.assertEqual(len(result.blocks), 1)
        self.assertEqual(result.blocks[0].cleaned_statements, ["SELECT 1;"])

    def test_no_sql_blocks(self):
        md = """---
title: No SQL
---

This page has no SQL blocks.

~~~ shell
$ echo hello
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 0)

    def test_sql_without_prompt_prefix(self):
        md = """~~~ sql
SELECT 1;
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        self.assertEqual(result.blocks[0].cleaned_statements, ["SELECT 1;"])

    def test_mixed_executable_and_fragment(self):
        md = """~~~ sql
> SELECT * FROM users;
~~~

~~~ sql
> SELECT ... FROM <table>;
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 2)
        self.assertEqual(result.blocks[0].block_type, BlockType.EXECUTABLE)
        self.assertEqual(result.blocks[1].block_type, BlockType.FRAGMENT)

    def test_block_line_numbers(self):
        md = """Line 1
Line 2
Line 3
~~~ sql
> SELECT 1;
~~~
Line 7
Line 8
~~~ sql
> SELECT 2;
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 2)
        # ~~~ sql is on line 4 (1-indexed)
        self.assertEqual(result.blocks[0].line_number, 4)
        # ~~~ sql is on line 9 (1-indexed)
        self.assertEqual(result.blocks[1].line_number, 9)


class TestExtractBlocksFromRealPatterns(unittest.TestCase):
    """Tests using patterns found in actual CockroachDB docs."""

    def test_movr_select_with_output(self):
        """Pattern from select-clause.md."""
        md = """{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT id, city, name FROM users LIMIT 10;
~~~

~~~
                   id                  |     city      |       name
+--------------------------------------+---------------+------------------+
  7ae147ae-147a-4000-8000-000000000018 | los angeles   | Alfred Garcia
(1 row)
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        block = result.blocks[0]
        self.assertEqual(block.block_type, BlockType.EXECUTABLE)
        self.assertEqual(block.cleaned_statements, ["SELECT id, city, name FROM users LIMIT 10;"])
        self.assertIn("Alfred Garcia", block.expected_output)

    def test_upsert_error_pattern(self):
        """Pattern from upsert.md with pq: error output."""
        md = """~~~ sql
> UPSERT INTO unique_test VALUES (4, 1);
~~~

~~~
pq: duplicate key value (b)=(1) violates unique constraint "unique_test_b_key"
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        self.assertEqual(result.blocks[0].block_type, BlockType.EXPECTED_ERROR)

    def test_multiline_insert(self):
        """Multi-line SQL statement."""
        md = """~~~ sql
> INSERT INTO user_promo_codes (city, user_id, code, "timestamp", usage_count)
    VALUES ('new york', '147ae147-ae14-4b00-8000-000000000004', 'promo_code', now(), 1);
~~~
"""
        result = extract_blocks("test.md", content=md)
        self.assertEqual(len(result.blocks), 1)
        self.assertEqual(len(result.blocks[0].cleaned_statements), 1)
        self.assertIn("INSERT INTO", result.blocks[0].cleaned_statements[0])


if __name__ == '__main__':
    unittest.main()
