{% if page.name != "known-limitations.md" # New limitations in v24.2 %}
{% endif %}
- A `RECORD`-returning UDF cannot be created without a `RETURN` statement in the root block, which would restrict the wildcard type to a concrete one. [#122945](https://github.com/cockroachdb/cockroach/issues/122945)
- User-defined functions are not currently supported in:
    - Expressions (column, index, constraint) in tables. [#87699](https://github.com/cockroachdb/cockroach/issues/87699)
    - Views. [#87699](https://github.com/cockroachdb/cockroach/issues/87699)
- User-defined functions cannot call themselves recursively. [#93049](https://github.com/cockroachdb/cockroach/issues/93049)
- The `setval` function cannot be resolved when used inside UDF bodies. [#110860](https://github.com/cockroachdb/cockroach/issues/110860)
- Casting subqueries to [user-defined types]({% link {{ page.version.version }}/create-type.md %}) in UDFs is not supported. [#108184](https://github.com/cockroachdb/cockroach/issues/108184)