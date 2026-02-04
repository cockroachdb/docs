By using the explicit index annotation, you can override [CockroachDB's index selection](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/) and use a specific [index]({% link {{ page.version.version }}/indexes.md %}) when reading from a named table. This is called an *index hint*.

Index selection can impact [performance]({% link {{ page.version.version }}/performance-best-practices-overview.md %}), but does not change the result of a query.

{{site.data.alerts.callout_success}}
{% include_cached new-in.html version="v26.1" %} You can use [hint injection]({% link {{ page.version.version }}/cost-based-optimizer.md %}#hint-injection) to apply index hints without modifying the original query text.
{{site.data.alerts.end}}

##### Force index scan

To force a scan of a specific index:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM table@my_idx;
~~~

This is equivalent to the longer expression:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM table@{FORCE_INDEX=my_idx};
~~~

##### Force reverse scan

To force a reverse scan of a specific index:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM table@{FORCE_INDEX=my_idx,DESC};
~~~

Forcing a reverse scan can help with [performance tuning]({% link {{ page.version.version }}/performance-best-practices-overview.md %}). To choose an index and its scan direction:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM table@{FORCE_INDEX=idx[,DIRECTION]};
~~~

where the optional `DIRECTION` is either `ASC` (ascending) or `DESC` (descending).

When a direction is specified, that scan direction is forced; otherwise the [cost-based optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}) is free to choose the direction it calculates will result in the best performance.

You can verify that the optimizer is choosing your desired scan direction using [`EXPLAIN (OPT)`]({% link {{ page.version.version }}/explain.md %}#opt-option). For example, given the table

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE kv (K INT PRIMARY KEY, v INT);
~~~

you can check the scan direction with:

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN (opt) SELECT * FROM users@{FORCE_INDEX=primary,DESC};
~~~

~~~
                 text
+-------------------------------------+
  scan users,rev
   └── flags: force-index=primary,rev
(2 rows)
~~~

#### Force inverted index scan

To force a scan of any [inverted index]({% link {{ page.version.version }}/inverted-indexes.md %}) of the hinted table:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM table@{FORCE_INVERTED_INDEX};
~~~

The `FORCE_INVERTED_INDEX` hint does not allow specifying an inverted index. If no query plan can be generated, the query will result in the error:

~~~
ERROR: could not produce a query plan conforming to the FORCE_INVERTED_INDEX hint
~~~

##### Force partial index scan

To force a [partial index scan]({% link {{ page.version.version }}/partial-indexes.md %}), your statement must have a `WHERE` clause that implies the partial index filter.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE t (
  a INT,
  INDEX idx (a) WHERE a > 0);
INSERT INTO t(a) VALUES (5);
SELECT * FROM t@idx WHERE a > 0;
~~~

~~~
CREATE TABLE

Time: 13ms total (execution 12ms / network 0ms)

INSERT 1

Time: 22ms total (execution 21ms / network 0ms)

  a
-----
  5
(1 row)

Time: 1ms total (execution 1ms / network 0ms)
~~~

##### Force partial GIN index scan

To force a [partial GIN index]({% link {{ page.version.version }}/inverted-indexes.md %}#partial-gin-indexes) scan, your statement must have a `WHERE` clause that:

- Implies the partial index.
- Constrains the GIN index scan.

{% include_cached copy-clipboard.html %}
~~~ sql
DROP TABLE t;
CREATE TABLE t (
  j JSON,
  INVERTED INDEX idx (j) WHERE j->'a' = '1');
INSERT INTO t(j)
  VALUES ('{"a": 1}'),
         ('{"a": 3, "b": 2}'),
         ('{"a": 1, "b": 2}');
SELECT * FROM t@idx WHERE j->'a' = '1' AND j->'b' = '2';
~~~

~~~
DROP TABLE

Time: 68ms total (execution 22ms / network 45ms)

CREATE TABLE

Time: 10ms total (execution 10ms / network 0ms)

INSERT 3

Time: 22ms total (execution 22ms / network 0ms)

         j
--------------------
  {"a": 1, "b": 2}
(1 row)

Time: 1ms total (execution 1ms / network 0ms)
~~~

##### Prevent full scan

{% include {{ page.version.version }}/sql/no-full-scan.md %}

{{site.data.alerts.callout_success}}
For other ways to prevent full scans, refer to [Prevent the optimizer from planning full scans]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#prevent-the-optimizer-from-planning-full-scans).
{{site.data.alerts.end}}