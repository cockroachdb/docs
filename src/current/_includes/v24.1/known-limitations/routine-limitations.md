{% if page.name != "known-limitations.md" # New limitations in v24.1 %}
- Routines cannot be invoked with named arguments, e.g., `SELECT foo(a => 1, b => 2);` or `SELECT foo(b := 1, a := 2);`.
- Routines cannot be created if they reference temporary tables.
- Routines cannot be created with unnamed `INOUT` parameters. For example, `CREATE PROCEDURE p(INOUT INT) AS $$ BEGIN NULL; END; $$ LANGUAGE PLpgSQL;`.
- Routines cannot be created if they return fewer columns than declared. For example, `CREATE FUNCTION f(OUT sum INT, INOUT a INT, INOUT b INT) LANGUAGE SQL AS $$ SELECT (a + b, b); $$;`.
{% endif %}
- Routines cannot be created with an `OUT` parameter of type `RECORD`.
- DDL statements (e.g., `CREATE TABLE`, `CREATE INDEX`) are not allowed within UDFs or stored procedures.
- Polymorphic types cannot be cast to other types (e.g., `TEXT`) within routine parameters.
