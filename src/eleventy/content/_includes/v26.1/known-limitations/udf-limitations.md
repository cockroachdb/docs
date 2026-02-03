{% if page.name != "known-limitations.md" %}
- User-defined functions are not supported in partial index predicates. [#155488](https://github.com/cockroachdb/cockroach/issues/155488)
- Views cannot reference a UDF that contains mutation statements (`INSERT`, `UPDATE`, `UPSERT`, `DELETE`). [#151686](https://github.com/cockroachdb/cockroach/issues/151686)
{% endif %}
- A `RECORD`-returning UDF cannot be created without a `RETURN` statement in the root block, which would restrict the wildcard type to a concrete one. [#122945](https://github.com/cockroachdb/cockroach/issues/122945)
- User-defined functions are not currently supported in:
    - Expressions (column, index, constraint) in tables. [#87699](https://github.com/cockroachdb/cockroach/issues/87699)
    {% if page.name != "known-limitations.md" %}
    - Partial index predicates. [#155488](https://github.com/cockroachdb/cockroach/issues/155488)
    {% endif %}
- User-defined functions cannot call themselves recursively. [#93049](https://github.com/cockroachdb/cockroach/issues/93049)
- The `setval` function cannot be resolved when used inside UDF bodies. [#110860](https://github.com/cockroachdb/cockroach/issues/110860)
- Casting subqueries to [user-defined types]({% link "{{ page.version.version }}/create-type.md" %}) in UDFs is not supported. [#108184](https://github.com/cockroachdb/cockroach/issues/108184)