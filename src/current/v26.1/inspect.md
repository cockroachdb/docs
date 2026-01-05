---
title: INSPECT
summary: Use the INSPECT statement to run data consistency validation checks against tables or databases.
toc: true
docs_area: reference.sql
---

The `INSPECT` [statement]({% link {{ page.version.version }}/sql-statements.md %}) runs a data consistency validation job against a table or database. The initial validation checks primary-to-secondary index consistency and records any errors.

{{site.data.alerts.callout_info}}
`INSPECT` does not automatically repair errors.
{{site.data.alerts.end}}

## Considerations

[XXX](XXX): DECIDE WHICH THINGS SHOULD GO IN KNOWN LIMITATIONS

- `INSPECT` always runs as a [background job]({% link {{ page.version.version }}/show-jobs.md %}).
- `INSPECT` must be run in an implicit transaction. It cannot be run inside a multi-statement transaction. For more information, see [Run Multi-Statement Transactions]({% link {{ page.version.version }}/run-multi-statement-transactions.md %}).
- `INSPECT` runs with low priority admission control and may take time on large datasets. Plan to run during periods of lower load.
- Unsupported indexes (such as vector, partial, or expression indexes) are skipped when using the default `INDEX ALL` behavior. If an unsupported index is explicitly requested using `INDEX (...)`, the statement fails before starting.

## Required privileges

To run `INSPECT` and view its results, the user must have:

- The `INSPECT` system-level [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges).
- The `VIEWSYSTEMTABLE` system-level [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) (required to view results via [`SHOW INSPECT ERRORS`]({% link {{ page.version.version }}/show-inspect-errors.md %})).

## Syntax

[XXX](XXX): ADD SQL DIAGRAM

~~~ sql
INSPECT TABLE <table_name> [AS OF SYSTEM TIME <expr>] [WITH OPTIONS ( <option> [, ...] )] [DETACHED]

INSPECT DATABASE <database_name> [AS OF SYSTEM TIME <expr>] [WITH OPTIONS ( <option> [, ...] )] [DETACHED]
~~~

## Parameters

Parameter | Description
----------|------------
`table_name` | The table to inspect.
`database_name` | The database to inspect.
`AS OF SYSTEM TIME <expr>` | Optional. Run inspection against a historical read timestamp. For details, see [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}).
`WITH OPTIONS (...)` | Optional. Controls which indexes are inspected. See [Options](#options).
`DETACHED` | Optional. Run the inspection job asynchronously and return the job ID without waiting for completion. To monitor progress, use [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %}).

### Options

Option | Description
-------|------------
`INDEX ALL` | Inspect all supported indexes in the target table or database. This is the default.
`INDEX (<indexname> [, ...])` | Inspect only the specified indexes. `INDEX ALL` and `INDEX (...)` are mutually exclusive.

## Viewing results

To view errors found by an inspection job, use [`SHOW INSPECT ERRORS`]({% link {{ page.version.version }}/show-inspect-errors.md %}). Errors are stored internally and may be subject to retention policies.

## Examples

### Inspect a table (all supported indexes)

{% include_cached copy-clipboard.html %}
~~~ sql
INSPECT TABLE movr.public.users;
~~~

### Inspect a table for specific indexes

{% include_cached copy-clipboard.html %}
~~~ sql
INSPECT TABLE movr.public.users WITH OPTIONS (INDEX (users_pkey, users_name_idx));
~~~

### Inspect at a specific timestamp

{% include_cached copy-clipboard.html %}
~~~ sql
INSPECT TABLE movr.public.users AS OF SYSTEM TIME '-10s';
~~~

### Run an inspection job asynchronously

{% include_cached copy-clipboard.html %}
~~~ sql
INSPECT TABLE movr.public.users DETACHED;
~~~

The job ID is returned after job creation completes:

~~~
        job_id
----------------------
  592786066399264769
(1 row)
~~~

## Known limitations

[XXX](XXX): FILL IN KNOWN LIMITATIONS SECTION

## See also

- [`SHOW INSPECT ERRORS`]({% link {{ page.version.version }}/show-inspect-errors.md %})
- [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %})
- [Jobs page in DB Console]({% link {{ page.version.version }}/ui-jobs-page.md %})
- [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %})
- [Authorization]({% link {{ page.version.version }}/security-reference/authorization.md %})
- [INSPECT privilege](XXX)
