---
title: docs: document DDL statements in PL/pgSQL stored procedures
summary: Starting in CockroachDB v26.3, `CREATE TABLE` and `DROP TABLE` statements are allowed inside PL/pgSQL stored procedure bodies. This enhancement improves PostgreSQL compatibility for applications that perform schema management within stored procedures.
toc: true
docs_area: reference
---

Starting in CockroachDB v26.3, `CREATE TABLE` and `DROP TABLE` statements are allowed inside PL/pgSQL stored procedure bodies. This enhancement improves PostgreSQL compatibility for applications that perform schema management within stored procedures.

## Supported DDL statements

The following DDL statements are now supported in PL/pgSQL stored procedures:

| Statement | Supported in Procedures | Supported in Functions | Supported in DO Blocks |
|-----------|------------------------|----------------------|----------------------|
| `CREATE TABLE` | ✓ (v26.3+) | ✗ | ✗ |
| `DROP TABLE` | ✓ (v26.3+) | ✗ | ✗ |
| `ALTER TABLE` | ✗ | ✗ | ✗ |
| `CREATE INDEX` | ✗ | ✗ | ✗ |
| `CREATE VIEW` | ✗ | ✗ | ✗ |

## Behavior and limitations

{{site.data.alerts.callout_info}}
**Version gate**: This feature requires all nodes in the cluster to be running CockroachDB v26.3 or later. It is automatically enabled when the cluster upgrade to v26.3 is finalized.
{{site.data.alerts.end}}

### Compilation-time binding

CockroachDB compiles routine body statements at `CREATE PROCEDURE` time, resolving all table references against the current catalog. This differs from PostgreSQL's late-binding model:

- **CockroachDB**: Table references are resolved when the procedure is created
- **PostgreSQL**: Table references are resolved when the procedure is executed

This means that DDL followed by DML on the newly created table in the same procedure body will fail:

{% include_cached copy-clipboard.html %}
~~~ sql
-- This will fail at CREATE PROCEDURE time
CREATE PROCEDURE p_create_and_use() LANGUAGE PLpgSQL AS $$
BEGIN
  CREATE TABLE new_table (id INT);
  INSERT INTO new_table VALUES (1);  -- Error: table doesn't exist at compile time
END
$$;
~~~

**Workaround**: Split DDL and DML operations into separate procedures.

### Transaction behavior

DDL statements in procedures participate in the caller's transaction:

- If the calling transaction is rolled back, the DDL is undone
- `COMMIT` and `ROLLBACK` within the procedure affect the DDL operations
- Exception handling with savepoints works as expected

## Examples

### Basic table creation and deletion

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE PROCEDURE manage_temp_table() LANGUAGE PLpgSQL AS $$
BEGIN
  CREATE TABLE temp_analysis (
    id SERIAL PRIMARY KEY,
    data TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  
  -- ... perform operations on temp_analysis ...
  
  DROP TABLE temp_analysis;
END
$$;
~~~

### Using IF NOT EXISTS and IF EXISTS

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE PROCEDURE safe_table_management() LANGUAGE PLpgSQL AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS user_sessions (
    session_id UUID PRIMARY KEY,
    user_id INT,
    expires_at TIMESTAMPTZ
  );
  
  -- ... perform cleanup operations ...
  
  DROP TABLE IF EXISTS old_temp_table;
END
$$;
~~~

### Error handling with DDL

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE PROCEDURE create_with_rollback() LANGUAGE PLpgSQL AS $$
BEGIN
  CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    event_data JSONB
  );
  
  BEGIN
    -- Some operation that might fail
    CREATE TABLE problematic_table (invalid_constraint);
  EXCEPTION WHEN OTHERS THEN
    -- The audit_log table creation is rolled back automatically
    RAISE NOTICE 'Table creation failed, rolling back';
  END;
END
$$;
~~~

## Schema changer interaction

Tables created within procedures use the legacy schema changer (direct descriptor write) rather than the declarative schema changer. This ensures compatibility with the procedure execution model.

## See also

- [CREATE PROCEDURE]({% link {{ page.version.version }}/create-procedure.md %})
- [CREATE TABLE]({% link {{ page.version.version }}/create-table.md %})
- [DROP TABLE]({% link {{ page.version.version }}/drop-table.md %})
- [Stored Procedures]({% link {{ page.version.version }}/stored-procedures.md %})
