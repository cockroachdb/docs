---
title: Limiting Query Results
summary: LIMIT and OFFSET restrict an operation to a few row.
toc: true
---

The `LIMIT` and `OFFSET` clauses restrict the operation of:

- A [selection query](selection-queries.html), including when it occurs as part of [`INSERT`](insert.html) or [`UPSERT`](upsert.html).
- [`UPDATE`](update.html) and [`DELETE`](delete.html) statements.


`OFFSET` instructs the operation to skip a specified number of rows. It is often used in conjunction with `LIMIT` to "paginate" through retrieved rows.

{{site.data.alerts.callout_danger}}
Using `LIMIT`/`OFFSET` to implement pagination can be very slow for large tables.  We recommend using [keyset pagination](selection-queries.html#pagination-example) instead.
{{site.data.alerts.end}}

## Syntax

### LIMIT

~~~
LIMIT { <limit_value> | ALL }
~~~

For PostgreSQL compatibility, CockroachDB also supports `FETCH FIRST limit_value ROWS ONLY` and `FETCH NEXT limit_value ROWS ONLY` as aliases for `LIMIT`. If `limit_value` is omitted, then one row is fetched.

### OFFSET

~~~
OFFSET <offset_value> [ ROW | ROWS ]
~~~

## Examples

For example uses with `SELECT`, see [Limiting Row Count and Pagination](selection-queries.html#limiting-row-count-and-pagination).

## See also

- [`DELETE`](delete.html)
- [`UPDATE`](delete.html)
- [`INSERT`](insert.html)
- [`UPSERT`](upsert.html)
- [Selection Queries](selection-queries.html)