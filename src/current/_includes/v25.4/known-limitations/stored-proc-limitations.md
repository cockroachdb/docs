{% if page.name != "known-limitations.md" # New limitations in v24.2 %}
{% endif %}
- `COMMIT` and `ROLLBACK` statements are not supported within nested procedures. [#122266](https://github.com/cockroachdb/cockroach/issues/122266)
- Pausable portals are not supported with `CALL` statements for stored procedures. [#151529](https://github.com/cockroachdb/cockroach/issues/151529)