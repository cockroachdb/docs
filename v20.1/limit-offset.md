---
title: Limiting Query Results
summary: LIMIT and OFFSET restrict an operation to a few row.
toc: true
---

The `LIMIT` and `OFFSET` clauses restrict the operation of:

- A [selection query](selection-queries.html), including when it occurs
as part of [`INSERT`](insert.html) or [`UPSERT`](upsert.html).
- [`UPDATE`](update.html) and [`DELETE`](delete.html) statements.


## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/limit_clause.html %}
</div>

<div>
  {% include {{ page.version.version }}/sql/diagrams/offset_clause.html %}
</div>

`LIMIT` restricts the operation to only retrieve `limit_val` number of rows.

`OFFSET` restricts the operation to skip the first `offset_value` number of rows.
It is often used in conjunction with `LIMIT` to "paginate" through retrieved rows.

{{site.data.alerts.callout_danger}}
Using `LIMIT`/`OFFSET` to implement pagination can be very slow for large tables.  We recommend using [keyset pagination](selection-queries.html#pagination-example) instead.
{{site.data.alerts.end}}

For PostgreSQL compatibility, CockroachDB also supports `FETCH FIRST
limit_val ROWS ONLY` and `FETCH NEXT limit_val ROWS ONLY` as aliases
for `LIMIT`. If `limit_val` is omitted, then one row is fetched.

## Examples

For example uses with `SELECT`, see [Limiting Row Count and
Pagination](selection-queries.html#limiting-row-count-and-pagination).

## See also

- [`DELETE`](delete.html)
- [`UPDATE`](delete.html)
- [`INSERT`](insert.html)
- [`UPSERT`](upsert.html)
- [Selection Queries](selection-queries.html)
