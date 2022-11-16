---
title: Trigram Indexes
summary: Trigram indexes on STRING columns improve the performance of fuzzy string matching and pattern matching in large datasets.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes, trigram, trigrams
docs_area: develop
---

{% include_cached new-in.html version="v22.2" %} A _trigram index_ is a type of [inverted index](inverted-indexes.html) created on a [`STRING`](string.html) column. Trigram indexes are used to efficiently search for strings in large tables without providing an exact search term.

This page describes how to create and use trigram indexes on CockroachDB.

{{site.data.alerts.callout_info}}
Some PostgreSQL syntax and features are currently unsupported. For details, see [Unsupported features](#unsupported-features).
{{site.data.alerts.end}}

## How do trigram indexes work?

Trigram indexes make [substring and similarity matches](https://www.postgresql.org/docs/current/pgtrgm.html) efficient by indexing the unique trigrams of a string. A trigram is a group of three consecutive characters (including spaces) in a string.

To display all of the possible trigrams for a string, use the `show_trgm()` [built-in function](functions-and-operators.html#trigrams-functions):

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT show_trgm('word');
~~~

~~~
           show_trgm
-------------------------------
  {"  w"," wo",ord,"rd ",wor}
~~~

A trigram index stores every unique trigram within each string being indexed. When you search a trigram index for a value, the database retrieves all of the entries in the index that match enough of the trigrams of the search value to satisfy the match. The type of match depends on the [comparison operator](#comparisons):

- Exact for an equality (`=`) or pattern matching (`LIKE`/`ILIKE`) search.
- Inexact for a similarity (`%`) search.

Trigrams enable pattern matching even when the prefix of the string is not known. For example: 

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM t WHERE text_col LIKE '%foobar%';
~~~

Fuzzy string matching based on text similarity is useful when:

- The spelling of a search term is not exact.
- The exact search term is not known.

For example, if you don't know how to spell a name in your database, you can use a `%` comparison to perform a fuzzy search. When applied to a `STRING` column, the `%` operator matches values that meet a [configured similarity threshold](#comparisons).

To search for names like "Steven" in column `first_name`:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT first_name FROM users WHERE first_name % 'steven';
~~~

~~~
  first_name    
--------------
  Stephen
  Steve
  Seven
~~~

{{site.data.alerts.callout_info}}
Trigram matching only works if the search term has at least 3 characters.
{{site.data.alerts.end}}

Fuzzy string matching, as well as `LIKE` and `ILIKE` pattern matching, can be very slow on large datasets. To make both types of searches more efficient, create a trigram index. For an example, see [Use a trigram index to speed up fuzzy string matching](#use-a-trigram-index-to-speed-up-fuzzy-string-matching).

### Creation

To create a trigram index, use the [`CREATE INDEX`](create-index.html) syntax that defines an [inverted index](inverted-indexes.html), specifying a `STRING` column and the `gin_trgm_ops` or `gist_trgm_ops` opclass. It is necessary to specify an opclass in order to enable [trigram-based comparisons](#comparisons).

- Using the PostgreSQL-compatible syntax:

  ~~~ sql
  CREATE INDEX {optional name} ON {table} USING GIN({column} gin_trgm_ops);
  ~~~

  ~~~ sql
  CREATE INDEX {optional name} ON {table} USING GIST({column} gist_trgm_ops);
  ~~~

  {{site.data.alerts.callout_info}}
  GIN and GiST indexes are implemented identically on CockroachDB. `GIN` and `GIST` are therefore synonymous when defining a trigram index.
  {{site.data.alerts.end}}

- Using `CREATE INVERTED INDEX`:

  ~~~ sql
  CREATE INVERTED INDEX {optional name} ON {table} ({column} {opclass});
  ~~~

### Comparisons

Trigram indexes on `STRING` columns support the following comparison operators:

- **equality**: [`=`](functions-and-operators.html#operators). Note that standard [`btree` secondary indexes](create-index.html#parameters) may perform better than trigram indexes for equality searches.
- **pattern matching (case-sensitive)**: [`LIKE`](functions-and-operators.html#operators)
- **pattern matching (case-insensitive)**: [`ILIKE`](functions-and-operators.html#operators)
- **similarity matching**: [`%`](functions-and-operators.html#operators). This operator returns `true` if the strings in the comparison have a similarity that meets or exceeds the threshold set by the `pg_trgm.similarity_threshold` [session variable](show-vars.html#pg_trgm_similarity_threshold).

For usage examples, see [Use a trigram index to speed up fuzzy string matching](#use-a-trigram-index-to-speed-up-fuzzy-string-matching).

## Examples

### Create various trigram indexes

Suppose you have a table with the following columns:

~~~ sql
CREATE TABLE t (a INT, w STRING);
~~~

The following examples illustrate how to create various trigram indexes on column `w`.

A GIN index with trigram matching enabled:
{% include_cached copy-clipboard.html %}
~~~sql
CREATE INDEX ON t USING GIN (w gin_trgm_ops);
~~~

A partial index with trigram matching enabled:
{% include_cached copy-clipboard.html %}
~~~ sql
CREATE INDEX ON t USING GIN (w gin_trgm_ops) WHERE a > 0;
~~~

A multi-column index with trigram matching enabled:
{% include_cached copy-clipboard.html %}
~~~ sql
CREATE INDEX ON t USING GIN (a, w gin_trgm_ops);
~~~

An expression index with trigram matching enabled:
{% include_cached copy-clipboard.html %}
~~~ sql
CREATE INDEX ON t USING GIN ((json_col->>'json_text_field'))
~~~

### Use a trigram index to speed up fuzzy string matching

Create a table with a `STRING` column:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE t (w STRING);
~~~

Populate the table with sample values:

{% include_cached copy-clipboard.html %}
~~~ sql
INSERT INTO t VALUES
  ('foo'),
  ('bar'),
  ('wordy'),
  ('world'),
  ('whorl'),
  ('wort'),
  ('worm'),
  ('norm'),
  ('weird'),
  ('worried'),
  ('wofoord'),
  ('wobarrd');

INSERT INTO t SELECT 'empty' FROM generate_series(1, 10000);
~~~

First, see how trigram matching performs without a trigram index. Retrieve the columns with values similar to `word`, using the `%` operator. Sort the results by the output of the `similarity()` [built-in function](functions-and-operators.html#trigrams-functions):

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT w, similarity(w, 'word')
  FROM t
  WHERE w % 'word'
  ORDER BY similarity DESC, w;
~~~

~~~
     w    |     similarity
----------+----------------------
  wordy   |  0.5714285714285714
  wofoord |  0.4444444444444444
  worm    | 0.42857142857142855
  wort    | 0.42857142857142855
  world   |               0.375
  wobarrd |                 0.3
  worried |                 0.3
(7 rows)


Time: 30ms total (execution 30ms / network 0ms)
~~~

Values are not included in the results if their similarities do not meet the threshold set by [`pg_trgm.similarity_threshold`](show-vars.html#pg_trgm_similarity_threshold), which defaults to `0.3`. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT similarity('weird', 'word');
~~~

~~~
      similarity
----------------------
  0.2222222222222222
~~~

Notice that the fuzzy search took 30 milliseconds to execute. Without a trigram index, the statement performs a full scan, which you can verify using [`EXPLAIN`](explain.html):

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN SELECT w, similarity(w, 'word')
  FROM t
  WHERE w % 'word'
  ORDER BY similarity DESC, w;
~~~

~~~
                                              info
-------------------------------------------------------------------------------------------------
  distribution: local
  vectorized: true

  • sort
  │ estimated row count: 3,337
  │ order: -similarity,+w
  │
  └── • render
      │
      └── • filter
          │ estimated row count: 3,337
          │ filter: w % 'word'
          │
          └── • scan
                estimated row count: 10,012 (100% of the table; stats collected 59 minutes ago)
                table: t@t_pkey
                spans: FULL SCAN
~~~

To speed up the fuzzy search, create a trigram index on column `w`:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE INDEX ON t USING GIN (w gin_trgm_ops);
~~~

Check that the statement uses the trigram index:

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN SELECT w, similarity(w, 'word')
  FROM t
  WHERE w % 'word'
  ORDER BY similarity DESC, w;
~~~

~~~
                                                                         info
-------------------------------------------------------------------------------------------------------------------------------------------------------
  distribution: local
  vectorized: true

  • sort
  │ estimated row count: 3,337
  │ order: -similarity,+w
  │
  └── • render
      │
      └── • filter
          │ estimated row count: 3,337
          │ filter: w % 'word'
          │
          └── • index join
              │ estimated row count: 6
              │ table: t@t_pkey
              │
              └── • inverted filter
                  │ estimated row count: 6
                  │ inverted column: w_inverted_key
                  │ num spans: 2
                  │
                  └── • scan
                        estimated row count: 6 (0.06% of the table; stats collected 8 minutes ago; using stats forecast for 24 minutes in the future)
                        table: t@t_w_idx
                        spans: 2 spans
~~~

Execute the statement again and note the improved performance:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT w, similarity(w, 'word')
  FROM t
  WHERE w % 'word'
  ORDER BY similarity DESC, w;
~~~

~~~
     w    |     similarity
----------+----------------------
  wordy   |  0.5714285714285714
  wofoord |  0.4444444444444444
  worm    | 0.42857142857142855
  wort    | 0.42857142857142855
  world   |               0.375
  worried |                 0.3
(6 rows)


Time: 4ms total (execution 4ms / network 0ms)
~~~

Pattern matching with `LIKE` and `ILIKE` is also accelerated by a trigram index:

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN SELECT * FROM t WHERE w LIKE '%foo%';
~~~

~~~
                                                                    info
---------------------------------------------------------------------------------------------------------------------------------------------
  distribution: local
  vectorized: true

  • filter
  │ estimated row count: 3,337
  │ filter: w LIKE '%foo%'
  │
  └── • index join
      │ estimated row count: 0
      │ table: t@t_pkey
      │
      └── • scan
            estimated row count: 0 (<0.01% of the table; stats collected 15 minutes ago; using stats forecast for 42 minutes in the future)
            table: t@t_w_idx
            spans: 1 span
~~~

## Unsupported features

The following PostgreSQL syntax and features are currently unsupported. For details, see the [tracking issue](https://github.com/cockroachdb/cockroach/issues/41285).

{% include {{ page.version.version }}/sql/trigram-unsupported-syntax.md %}

## See also

- [`CREATE INDEX`](create-index.html)
- [`DROP INDEX`](drop-index.html)
- [`RENAME INDEX`](rename-index.html)
- [`SHOW INDEX`](show-index.html)
- [Inverted indexes](inverted-indexes.html)
- [Indexes](indexes.html)
- [SQL Statements](sql-statements.html)