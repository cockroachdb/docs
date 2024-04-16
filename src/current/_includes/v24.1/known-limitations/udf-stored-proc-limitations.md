{% if page.name != "stored-procedures.md" %}
- User-defined functions are not currently supported in:
    - Expressions (column, index, constraint) in tables. [#87699](https://github.com/cockroachdb/cockroach/issues/87699)
    - Views. [#87699](https://github.com/cockroachdb/cockroach/issues/87699)
    - Other user-defined functions. [#93049](https://github.com/cockroachdb/cockroach/issues/93049)
- [Common table expressions]({% link {{ page.version.version }}/common-table-expressions.md %}) (CTE), recursive or non-recursive, are not supported in [user-defined functions]({% link {{ page.version.version }}/user-defined-functions.md %}) (UDF). That is, you cannot use a `WITH` clause in the body of a UDF. [#92961](https://github.com/cockroachdb/cockroach/issues/92961)
- The `setval` function cannot be resolved when used inside UDF bodies. [#110860](https://github.com/cockroachdb/cockroach/issues/110860)
{% endif %}

{% if page.name != "user-defined-functions.md" %} 
{% endif %}

- DDL statements (e.g., `CREATE TABLE`, `CREATE INDEX`) are not allowed within UDFs or stored procedures. [#110080](https://github.com/cockroachdb/cockroach/issues/110080)
