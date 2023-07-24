By using the explicit index annotation, you can override [CockroachDB's index selection](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/) and use a specific [index](indexes.html) when reading from a named table.

{{site.data.alerts.callout_info}}
Index selection can impact [performance](performance-best-practices-overview.html), but does not change the result of a query.
{{site.data.alerts.end}}

The syntax to force a scan of a specific index is:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM table@my_idx;
~~~

This is equivalent to the longer expression:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM table@{FORCE_INDEX=my_idx};
~~~

The syntax to force a **reverse scan** of a specific index is:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM table@{FORCE_INDEX=my_idx,DESC};
~~~

Forcing a reverse scan is sometimes useful during [performance tuning](performance-best-practices-overview.html). For reference, the full syntax for choosing an index and its scan direction is

{% include copy-clipboard.html %}
~~~ sql
SELECT * FROM table@{FORCE_INDEX=idx[,DIRECTION]}
~~~

where the optional `DIRECTION` is either `ASC` (ascending) or `DESC` (descending).

When a direction is specified, that scan direction is forced; otherwise the [cost-based optimizer](cost-based-optimizer.html) is free to choose the direction it calculates will result in the best performance.

You can verify that the optimizer is choosing your desired scan direction using [`EXPLAIN (OPT)`](explain.html#opt-option). For example, given the table

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE kv (K INT PRIMARY KEY, v INT);
~~~

you can check the scan direction with:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (opt) SELECT * FROM users@{FORCE_INDEX=primary,DESC};
~~~

~~~
                 text
+-------------------------------------+
  scan users,rev
   └── flags: force-index=primary,rev
(2 rows)
~~~

To see all indexes available on a table, use [`SHOW INDEXES`](show-index.html).
