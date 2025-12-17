{% if page.name != "known-limitations.md" # New limitations in v24.2 %}
{% endif %}
- `COMMIT` and `ROLLBACK` statements are not supported within nested procedures. [#122266](https://github.com/cockroachdb/cockroach/issues/122266)