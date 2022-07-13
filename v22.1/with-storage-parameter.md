---
title: WITH (storage parameter)
summary: WITH (storage parameter) applies a storage parameter to a table or an index at creation time.
toc: true
docs_area: reference.sql
---

The `SET (storage parameter)` [statement](sql-statements.html) sets a storage parameter on a table.

{{site.data.alerts.callout_info}}
The `SET (storage parameter)` is a subcommand of [`ALTER TABLE`](alter-table.html).
{{site.data.alerts.end}}

## Syntax

**create_index_with_storage_param ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/create_index_with_storage_param.html %}
</div>

**create_table_with_storage_param ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/create_table_with_storage_param.html %}
</div>

## Command parameters

| Parameter           | Description                                                                                                                |
|---------------------+----------------------|
| `table`             | The table to which you are setting the parameter.                                                                                         |
| `index`             | The index to which you are setting the parameter.                                                                                         |
| `parameter_name`    | The name of the storage parameter. See [Storage parameters](#list-of-storage-parameters) for a list of available parameters. |

## List of storage parameters

### Index parameters

{% include {{ page.version.version }}/misc/index-storage-parameters.md %}

### Table parameters

{% include {{ page.version.version }}/misc/table-storage-parameters.md %}

## Required privileges

The user must be a member of the [`admin`](security-reference/authorization.html#roles) or [owner](security-reference/authorization.html#object-ownership) roles, or have the [`CREATE` privilege](security-reference/authorization.html#supported-privileges) on the table.

## Examples

### Create a table with row-level TTL enabled

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE ttl_test (
  id UUID PRIMARY KEY default gen_random_uuid(),
  description TEXT,
  inserted_at TIMESTAMP default current_timestamp()
) WITH (ttl_expire_after = '3 months');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CREATE TABLE ttl_test;
~~~

~~~
  table_name |                                                                                           create_statement
-------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  ttl_test   | CREATE TABLE public.ttl_test (
             |     id UUID NOT NULL DEFAULT gen_random_uuid(),
             |     description STRING NULL,
             |     inserted_at TIMESTAMP NULL DEFAULT current_timestamp():::TIMESTAMP,
             |     crdb_internal_expiration TIMESTAMPTZ NOT VISIBLE NOT NULL DEFAULT current_timestamp():::TIMESTAMPTZ + '3 mons':::INTERVAL ON UPDATE current_timestamp():::TIMESTAMPTZ + '3 mons':::INTERVAL,
             |     CONSTRAINT ttl_test_pkey PRIMARY KEY (id ASC)
             | ) WITH (ttl = 'on', ttl_automatic_column = 'on', ttl_expire_after = '3 mons':::INTERVAL)
(1 row)
~~~

In this case, CockroachDB implicitly added the `ttl` and `ttl_automatic_column` storage parameters.

## See also

- [`CREATE TABLE`](create-table.html)
- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`SET` (storage parameter)](set-storage-parameter.html)
- [`RESET` (storage parameter)](reset-storage-parameter.html)
