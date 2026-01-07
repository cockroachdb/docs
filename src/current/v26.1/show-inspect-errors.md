---
title: SHOW INSPECT ERRORS
summary: The SHOW INSPECT ERRORS statement lists issues detected by the INSPECT data consistency checker.
toc: true
docs_area: reference.sql
---

The `SHOW INSPECT ERRORS` [statement]({% link {{ page.version.version }}/sql-statements.md %}) displays issues detected by [`INSPECT`]({% link {{ page.version.version }}/inspect.md %}) data consistency validation jobs.

By default, `SHOW INSPECT ERRORS` returns errors from the most recent completed and successful `INSPECT` job for the specified table. To view errors from a specific inspection job, use `FOR JOB <id>`.

## Syntax

[XXX](XXX): ADD LINK TO SQL DIAGRAM

~~~ sql
SHOW INSPECT ERRORS
  [FOR TABLE <table_name>]
  [FOR JOB <job_id>]
  [WITH DETAILS]
~~~

## Parameters

Parameter | Description
----------|------------
`FOR TABLE <table_name>` | Show errors for the specified table.
`FOR JOB <job_id>` | Show errors produced by the specified `INSPECT` job ID.
`WITH DETAILS` | Include structured error metadata from the `details` column (JSON) in the results.

## Required privileges

To run `SHOW INSPECT ERRORS`, the user must have:

- The `INSPECT` system-level [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges).
- The `VIEWSYSTEMTABLE` system-level [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges).

## Response

`SHOW INSPECT ERRORS` returns one row per detected issue.

Field | Description
------|------------
`job_id` | The ID of the `INSPECT` job that detected the issue.
`error_type` | The type of inconsistency detected. See [Error types](#error-types).
`aost` | The [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) timestamp used by the job (if any).
`database_name` | The database containing the object with an issue.
`schema_name` | The schema containing the object with an issue.
`object_name` | The table or index with an issue.
`primary_key` | The primary key of the row involved in the issue, if applicable.
`details` | Present only with `WITH DETAILS`. Structured metadata (JSON) describing the issue.

### Error types

The initial `INSPECT` implementation reports the following `error_type` values:

Error type | Meaning
----------|---------
`secondary_index_missing` | A row in the primary index is missing a corresponding entry in a secondary index.
`secondary_index_dangling` | A secondary index entry exists, but the referenced primary index row does not.

## Examples

### Show the latest errors for a table

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW INSPECT ERRORS FOR TABLE movr.public.users;
~~~

### Show errors for a specific inspection job

First, find the job ID (for example, by using [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %})):

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW JOBS;
~~~

Then show errors for that job:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW INSPECT ERRORS FOR JOB 592786066399264769;
~~~

### Show errors with details

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW INSPECT ERRORS FOR TABLE movr.public.users WITH DETAILS;
~~~

## See also

- [`INSPECT`]({% link {{ page.version.version }}/inspect.md %})
- [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %})
- [Jobs page in DB Console]({% link {{ page.version.version }}/ui-jobs-page.md %})
- [Authorization]({% link {{ page.version.version }}/security-reference/authorization.md %})
- [XXX](XXX): LINK TO EXACT INSPECT PRIVILEGES
