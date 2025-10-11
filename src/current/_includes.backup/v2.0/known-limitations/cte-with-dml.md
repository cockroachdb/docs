{{site.data.alerts.callout_info}}
Resolved as of v2.1.
{{site.data.alerts.end}}

If a [common table expression](common-table-expressions.html) containing data-modifying statement is not referred to
by the top level query, either directly or indirectly, the
data-modifying statement will not be executed at all.

For example, the following query does not insert any row, because the CTE `a` is not used:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH a AS (INSERT INTO t(x) VALUES (1), (2), (3))
  SELECT * FROM b;
~~~

Also, the following query does not insert any row, even though the CTE `a` is used, because
the other CTE that uses `a` are themselves not used:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH a AS (INSERT INTO t(x) VALUES (1), (2), (3)),
       b AS (SELECT * FROM a)
  SELECT * FROM c;
~~~

To determine whether a modification will effectively take place, use
[`EXPLAIN`](explain.html) and check whether the desired data
modification is part of the final plan for the overall query.
