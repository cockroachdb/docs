---
title: INSPECT
summary: Use the INSPECT statement to run data consistency validation checks against tables or databases.
toc: true
docs_area: reference.sql
---

The `INSPECT` [statement]({% link {{ page.version.version }}/sql-statements.md %}) runs a data consistency validation job against a table or database. The initial validation checks primary-to-secondary index consistency and records any errors. To display any errors recorded by the validation job, use [`SHOW INSPECT ERRORS`]({% link {{ page.version.version }}/show-inspect-errors.md %}).

{{site.data.alerts.callout_info}}
`INSPECT` is used to verify data integrity. It does not automatically repair errors.
{{site.data.alerts.end}}

## Required privileges

To run `INSPECT` and view its results, the user must have:

- The `INSPECT` system-level [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) is required to run the `INSPECT` statement.
- The `VIEWSYSTEMTABLE` system-level [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges), which is required to view the results of [`SHOW INSPECT ERRORS`]({% link {{ page.version.version }}/show-inspect-errors.md %})).

## Synopsis

<div>
  {% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/inspect_table.html %}
</div>

<div>
  {% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/inspect_database.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`table_name` | The [table]({% link {{ page.version.version }}/create-table.md %}) to inspect.
`db_name` | The [database]({% link {{ page.version.version }}/create-database.md %}) to inspect.
`opt_as_of_clause` | Optional. Run the inspection against a historical read timestamp using `INSPECT ... AS OF SYSTEM TIME {expr}`. For an example, see [Inspect at a specific timestamp](#inspect-at-a-specific-timestamp). For more information about historical reads, see [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}).
`opt_inspect_options_clause` | Optional. Control which [indexes]({% link {{ page.version.version }}/indexes.md %}) are inspected using `INSPECT ... WITH OPTIONS (...)`. For an example, see [Inspect a table for specific indexes](#inspect-a-table-for-specific-indexes). See [Options](#options).

### Options

Option | Description
-------|------------
`INDEX ALL` | Inspect all supported index types in the target table or database. This is the default.
`INDEX ({index_name} [, ...])` | Inspect only the specified indexes. Note that `INDEX ALL` and this option are mutually exclusive.

## Considerations

- `INSPECT` must be run in an [implicit transaction]({% link {{ page.version.version }}/transactions.md %}#individual-statements). It cannot be run inside a multi-statement transaction. For more information, see [Run Multi-Statement Transactions]({% link {{ page.version.version }}/run-multi-statement-transactions.md %}).
- `INSPECT` always runs as a [background job]({% link {{ page.version.version }}/show-jobs.md %}).
- `INSPECT` runs with low priority under the [admission control]({% link {{ page.version.version }}/admission-control.md %}) subsystem and may take time on large datasets. Plan to run it during periods of lower system load.
- The following index types are unsupported:
  - [Vector indexes]({% link {{ page.version.version }}/vector-indexes.md %})
  - [Partial indexes]({% link {{ page.version.version }}/partial-indexes.md %})
  - [Expression indexes]({% link {{ page.version.version }}/expression-indexes.md %})
- Unsupported index types are automatically skipped when using the default `INDEX ALL` behavior. If an unsupported index type is directly requested using `INDEX {index_name}`, the statement will fail before starting.

## Examples

### `INSPECT` a table (all supported indexes)

{% include_cached copy-clipboard.html %}
~~~ sql
INSPECT TABLE movr.public.users;
~~~

~~~
NOTICE: waiting for INSPECT job to complete: 1141477630617223169
If the statement is canceled, the job will continue in the background.
~~~

### `INSPECT` a table for specific indexes

{% include_cached copy-clipboard.html %}
~~~ sql
INSPECT TABLE movr.public.vehicles WITH OPTIONS INDEX (vehicles_auto_index_fk_city_ref_users);
~~~

~~~
NOTICE: waiting for INSPECT job to complete: 1141477560713150465
If the statement is canceled, the job will continue in the background.
~~~

### `INSPECT` at a specific timestamp

{% include_cached copy-clipboard.html %}
~~~ sql
INSPECT TABLE movr.public.users AS OF SYSTEM TIME '-10s';
~~~

~~~
NOTICE:  waiting for INSPECT job to complete: 1141477013029322753
If the statement is canceled, the job will continue in the background.
~~~

### Checking `INSPECT` job status

When you issue the `INSPECT` statement, a `NOTICE` message is returned to the client showing the job ID:

~~~
NOTICE:  waiting for INSPECT job to complete: 1141477013029322753
If the statement is canceled, the job will continue in the background.
~~~

You can check the status of the `INSPECT` job using a statement like the following:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM [SHOW JOBS] WHERE job_id = 1141477013029322753;
~~~
~~~
        job_id        | job_type |           description           | user_name |  status   | running_status |        created         |        started         |        finished        |        modified        | fraction_completed | error | coordinator_id
----------------------+----------+---------------------------------+-----------+-----------+----------------+------------------------+------------------------+------------------------+------------------------+--------------------+-------+-----------------
  1141477013029322753 | INSPECT  | INSPECT TABLE movr.public.users | node      | succeeded | NULL           | 2026-01-14 20:12:19+00 | 2026-01-14 20:12:19+00 | 2026-01-14 20:12:19+00 | 2026-01-14 20:12:19+00 |                  1 |       |              1
~~~

### Viewing `INSPECT` results

To view errors found by an inspection job, use [`SHOW INSPECT ERRORS`]({% link {{ page.version.version }}/show-inspect-errors.md %}). Errors are stored in an internal system table and are subject to a 90 day retention policy.

## See also

- [`SHOW INSPECT ERRORS`]({% link {{ page.version.version }}/show-inspect-errors.md %})
- [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %})
- [Jobs page in DB Console]({% link {{ page.version.version }}/ui-jobs-page.md %})
- [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %})
- [Supported privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges)
