To sort the output of a `DELETE` statement, you have several options:

1. (Recommended) Use `SELECT ... FROM [DELETE ...] ORDER BY ...`

2. Use `DELETE FROM ... ORDER BY ... LIMIT ...`

{{site.data.alerts.callout_danger}}
Note that in versions 19.1 and later of CockroachDB, the
[`LIMIT`](limit-offset.html) clause is required in order to use
[`ORDER BY`](query-order.html) in a [`DELETE`](delete.html) statement.
{{site.data.alerts.end}}

For examples of specific queries using these patterns, see
[Sort and return deleted rows](delete.html#sort-and-return-deleted-rows).
