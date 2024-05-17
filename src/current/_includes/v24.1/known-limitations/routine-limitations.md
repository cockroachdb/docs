{% if page.name != "known-limitations.md" # New limitations in v24.1 %}
- Routines cannot be invoked with named arguments, e.g., `SELECT foo(a => 1, b => 2);` or `SELECT foo(b := 1, a := 2);`. [#122264](https://github.com/cockroachdb/cockroach/issues/122264)
- Routines cannot be created if they reference temporary tables. [#121375](https://github.com/cockroachdb/cockroach/issues/121375)
- Routines cannot be created with unnamed `INOUT` parameters. For example, `CREATE PROCEDURE p(INOUT INT) AS $$ BEGIN NULL; END; $$ LANGUAGE PLpgSQL;`. [#121251](https://github.com/cockroachdb/cockroach/issues/121251)
- Routines cannot be created if they return fewer columns than declared. For example, `CREATE FUNCTION f(OUT sum INT, INOUT a INT, INOUT b INT) LANGUAGE SQL AS $$ SELECT (a + b, b); $$;`. [#121247](https://github.com/cockroachdb/cockroach/issues/121247)
{% endif %}
- DDL statements (e.g., `CREATE TABLE`, `CREATE INDEX`) are not allowed within UDFs or stored procedures. [#110080](https://github.com/cockroachdb/cockroach/issues/110080)