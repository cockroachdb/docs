{% if page.name != "known-limitations.md" # New limitations in v24.2 %}
{% endif %}
- Routines cannot be invoked with named arguments, e.g., `SELECT foo(a => 1, b => 2);` or `SELECT foo(b := 1, a := 2);`. [#122264](https://github.com/cockroachdb/cockroach/issues/122264)
- Routines cannot be created if they reference temporary tables. [#121375](https://github.com/cockroachdb/cockroach/issues/121375)
- Routines cannot be created with unnamed `INOUT` parameters. For example, `CREATE PROCEDURE p(INOUT INT) AS $$ BEGIN NULL; END; $$ LANGUAGE PLpgSQL;`. [#121251](https://github.com/cockroachdb/cockroach/issues/121251)
- Routines cannot be created if they return fewer columns than declared. For example, `CREATE FUNCTION f(OUT sum INT, INOUT a INT, INOUT b INT) LANGUAGE SQL AS $$ SELECT (a + b, b); $$;`. [#121247](https://github.com/cockroachdb/cockroach/issues/121247)
- Routines cannot be created with an `OUT` parameter of type `RECORD`. [#123448](https://github.com/cockroachdb/cockroach/issues/123448)
- DDL statements (e.g., `CREATE TABLE`, `CREATE INDEX`) are not allowed within UDFs or stored procedures. [#110080](https://github.com/cockroachdb/cockroach/issues/110080)
- Polymorphic types cannot be cast to other types (e.g., `TEXT`) within routine parameters. [#123536](https://github.com/cockroachdb/cockroach/issues/123536)
- Routine parameters and return types cannot be declared using the `ANYENUM` polymorphic type, which is able to match any [`ENUM`]({% link {{ page.version.version }}/enum.md %}) type. [123048](https://github.com/cockroachdb/cockroach/issues/123048)