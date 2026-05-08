---
title: SHOW INSPECT ERRORS
summary: The SHOW INSPECT ERRORS statement lists issues detected by the INSPECT data consistency checker.
toc: true
docs_area: reference.sql
---

The `SHOW INSPECT ERRORS` [statement]({% link {{ page.version.version }}/sql-statements.md %}) displays errors recorded by an [`INSPECT`]({% link {{ page.version.version }}/inspect.md %}) job.

`SHOW INSPECT ERRORS` shows results for a single `INSPECT` job at a time; it does not aggregate results across jobs. By default, it returns errors from the most recent completed, successful `INSPECT` job for the specified table. To view errors from a specific job, use `SHOW INSPECT ERRORS FOR JOB {job_id}`.

## Required privileges

To run `SHOW INSPECT ERRORS`, the user must have:

- The `INSPECT` system-level [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges), which is required to run the [`INSPECT` statement]({% link {{ page.version.version }}/inspect.md %}).

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_inspect_errors.html %}
</div>

## Parameters

Parameter | Syntax   | Description
----------|----------|------------
`opt_for_table_clause` | `FOR TABLE {table_name}` | Optional. Show errors for the specified [table]({% link {{ page.version.version }}/create-table.md %}).
`opt_for_job_clause` | `FOR JOB {job_id}` | Optional. Show errors produced by the job ID returned by the [`INSPECT` statement]({% link {{ page.version.version }}/inspect.md %}).
`opt_with_details` | `WITH DETAILS` | Optional. Include structured error metadata from the `details` column ([JSON]({% link {{ page.version.version }}/jsonb.md %})) in the results.

## Response

`SHOW INSPECT ERRORS` returns the following columns, with one row per issue detected.

Field | Description
------|------------
`job_id` | The ID of the [`INSPECT`]({% link {{ page.version.version }}/inspect.md %}) job that detected the issue.
`error_type` | The type of inconsistency detected. For more information, see [Error types](#error-types).
`aost` | The [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) timestamp used by the validation [job]({% link {{ page.version.version }}/show-jobs.md %}) (if any).
`database_name` | The [database]({% link {{ page.version.version }}/create-database.md %}) containing the schema object with an issue.
`schema_name` | The [schema]({% link {{ page.version.version }}/schema-design-overview.md %}) containing the object with an issue.
`object_name` | The [table]({% link {{ page.version.version }}/create-table.md %}) or [index]({% link {{ page.version.version }}/indexes.md %}) with an issue.
`primary_key` | The [primary key]({% link {{ page.version.version }}/primary-key.md %}) of the row involved in the issue, if applicable.
`details` | This column is present only if `WITH DETAILS` is specified. It contains structured metadata ([JSON]({% link {{ page.version.version }}/jsonb.md %})) describing the issue.

### Error types

The `INSPECT` implementation reports the following `error_type` values:

Error type | Meaning
----------|---------
`missing_secondary_index_entry` | A row in the [primary index]({% link {{ page.version.version }}/primary-key.md %}) is missing a corresponding entry in a [secondary index]({% link {{ page.version.version }}/indexes.md %}). If you see this error, [contact Support]({% link {{ page.version.version }}/support-resources.md %}).
`dangling_secondary_index_entry` | A [secondary index]({% link {{ page.version.version }}/indexes.md %}) entry exists, but the referenced [primary index]({% link {{ page.version.version }}/primary-key.md %}) row does not. If you see this error, [contact Support]({% link {{ page.version.version }}/support-resources.md %}).
`internal_error` | An error occurred while `INSPECT` was running its validation queries (for example, an [MVCC GC timeout]({% link {{ page.version.version }}/ui-queues-dashboard.md %}#mvcc-gc-queue)). The cause of this error type is usually not related to data validity. Investigate the underlying job error details and cluster logs to determine the cause before deciding whether to [contact Support]({% link {{ page.version.version }}/support-resources.md %}).

## Examples

### Show the latest errors for a table

To see the errors found by the most recent `INSPECT` job, issue the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW INSPECT ERRORS FOR TABLE movr.public.users;
~~~

### Show errors for a specific inspection job

When you issue the [`INSPECT` statement]({% link {{ page.version.version }}/inspect.md %}), a `NOTICE` message is returned to the client showing the job ID, e.g.,

{% include_cached copy-clipboard.html %}
~~~ sql
INSPECT TABLE movr.public.users AS OF SYSTEM TIME '-10s';
~~~

~~~
NOTICE:  waiting for INSPECT job to complete: 1141477013029322753
If the statement is canceled, the job will continue in the background.
~~~

To show errors for a job, issue the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW INSPECT ERRORS FOR JOB 1141477013029322753;
~~~

If there are no errors associated with that job ID, the output is:

~~~
SHOW INSPECT ERRORS 0
~~~

Note that if you issue a job ID for a nonexistent job, you will see the same output as for a job with no errors:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW INSPECT ERRORS FOR JOB 0;
~~~

~~~
SHOW INSPECT ERRORS 0
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
- [Authorization]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges)
