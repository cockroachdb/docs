{% if page.name != "known-limitations.md" # New limitations in v24.1 %}
- A `RECORD`-returning UDF cannot be created without a `RETURN` statement in the root block, which would restrict the wildcard type to a concrete one. [#122945](https://github.com/cockroachdb/cockroach/issues/122945)
{% endif %}
- User-defined functions are not currently supported in:
    - Expressions (column, index, constraint) in tables. [#87699](https://github.com/cockroachdb/cockroach/issues/87699)
    - Views. [#87699](https://github.com/cockroachdb/cockroach/issues/87699)
- User-defined functions cannot call themselves recursively. [#93049](https://github.com/cockroachdb/cockroach/issues/93049)
- [Common table expressions]({% link {{ page.version.version }}/common-table-expressions.md %}) (CTE), recursive or non-recursive, are not supported in [user-defined functions]({% link {{ page.version.version }}/user-defined-functions.md %}) (UDF). That is, you cannot use a `WITH` clause in the body of a UDF. [#92961](https://github.com/cockroachdb/cockroach/issues/92961)
- The `setval` function cannot be resolved when used inside UDF bodies. [#110860](https://github.com/cockroachdb/cockroach/issues/110860)