---
title: sql: add remaining compatibility fixes for pg_dump
summary: ```yaml
toc: true
docs_area: reference
---

```yaml
---
title: LOCK
summary: Acquire table-level locks for PostgreSQL compatibility.
toc: true
docs_area: reference.sql
---
```

The `LOCK` statement acquires table-level locks on specified tables. This statement is primarily intended for PostgreSQL compatibility, particularly with `pg_dump`. When the `pg_dump_compatibility` cluster setting is enabled, all lock modes are accepted as no-ops since CockroachDB uses Multi-Version Concurrency Control (MVCC) where reads never block. When compatibility mode is disabled, `LOCK` returns a feature not supported error.

## Required privileges

No specific privileges are documented in the implementation. [NEEDS REVIEW: privilege requirements]

## Synopsis

{% include_cached copy-clipboard.html %}
~~~ sql
LOCK [TABLE] table_name [, ...] [IN lock_mode MODE] [NOWAIT]
~~~

## Parameters

| Parameter | Description | Required |
|-----------|-------------|----------|
| `table_name` | The name of the table(s) to lock. Multiple tables can be specified as a comma-separated list. | Yes |
| `lock_mode` | The lock mode to acquire. If omitted, defaults to `ACCESS EXCLUSIVE`. | No |
| `NOWAIT` | If specified, the statement will not wait if the lock cannot be acquired immediately. In CockroachDB, this has no effect when `pg_dump_compatibility` is enabled. | No |

### Lock modes

The following lock modes are supported:

- `ACCESS SHARE`
- `ROW SHARE`  
- `ROW EXCLUSIVE`
- `SHARE UPDATE EXCLUSIVE`
- `SHARE ROW EXCLUSIVE`
- `SHARE`
- `EXCLUSIVE`
- `ACCESS EXCLUSIVE` (default when no mode specified)

{{site.data.alerts.callout_info}}
All lock modes are treated as no-ops when `pg_dump_compatibility` is enabled, since CockroachDB's MVCC concurrency control makes explicit locking unnecessary.
{{site.data.alerts.end}}

## Examples

### Basic table locking

{% include_cached copy-clipboard.html %}
~~~ sql
SET pg_dump_compatibility = 'postgres';
LOCK TABLE employees IN ACCESS SHARE MODE;
~~~

### Locking multiple tables

{% include_cached copy-clipboard.html %}
~~~ sql
LOCK TABLE employees, departments IN ACCESS SHARE MODE;
~~~

### Using NOWAIT

{% include_cached copy-clipboard.html %}
~~~ sql
LOCK TABLE employees IN ACCESS SHARE MODE NOWAIT;
~~~

### Default lock mode (ACCESS EXCLUSIVE)

{% include_cached copy-clipboard.html %}
~~~ sql
LOCK TABLE employees;
~~~

### Without TABLE keyword

{% include_cached copy-clipboard.html %}
~~~ sql
LOCK employees IN SHARE MODE;
~~~

## Compatibility notes

{{site.data.alerts.callout_danger}}
`LOCK TABLE` is only supported when the `pg_dump_compatibility` cluster setting is enabled. When disabled, all `LOCK` statements return a "feature not supported" error.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
-- Enable pg_dump compatibility
SET pg_dump_compatibility = 'postgres';

-- Now LOCK statements work
LOCK TABLE mytable IN ACCESS SHARE MODE;

-- Disable compatibility  
SET pg_dump_compatibility = 'off';

-- This will now fail
LOCK TABLE mytable IN ACCESS SHARE MODE;
-- Error: LOCK TABLE is not supported
~~~

## See also

- [`SET (session variable)`]({% link {{ page.version.version }}/set-vars.md %}) for setting `pg_dump_compatibility`
- [PostgreSQL compatibility]({% link {{ page.version.version }}/postgresql-compatibility.md %})
