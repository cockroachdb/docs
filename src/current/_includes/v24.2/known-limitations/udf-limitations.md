{% if page.name != "known-limitations.md" # New limitations in v24.2 %}
{% endif %}
- A `RECORD`-returning UDF cannot be created without a `RETURN` statement in the root block, which would restrict the wildcard type to a concrete one.
- User-defined functions are not currently supported in:
    - Expressions (column, index, constraint) in tables.
    - Views.
- User-defined functions cannot call themselves recursively.
- [Common table expressions]({% link {{ page.version.version }}/common-table-expressions.md %}) (CTE), recursive or non-recursive, are not supported in [user-defined functions]({% link {{ page.version.version }}/user-defined-functions.md %}) (UDF). That is, you cannot use a `WITH` clause in the body of a UDF.
- The `setval` function cannot be resolved when used inside UDF bodies.
- Casting subqueries to [user-defined types]({% link {{ page.version.version }}/create-type.md %}) in UDFs is not supported.
