---
title: RESET (storage parameter)
summary: RESET (storage parameter) resets a storage parameter on an existing table.
toc: true
docs_area: reference.sql
---

The `RESET (storage parameter)` [statement](sql-statements.html) reverts the value of a storage parameter on a table to its default value.

{{site.data.alerts.callout_info}}
The `RESET (storage parameter)` is a subcommand of [`ALTER TABLE`](alter-table.html).

To reset a storage parameter on an existing index, you must drop and [recreate the index with the storage parameter](with-storage-parameter.html).
{{site.data.alerts.end}}

## Syntax

**alter_table_reset_storage_param ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_table_reset_storage_param.html %}
</div>

{% comment %} need alter index diagram here {% endcomment %}

## Command parameters

| Parameter           | Description          |
|---------------------+----------------------|
| `table`             | The table to which you are setting the parameter.                                                                                         |
| `parameter_name`    | The name of the storage parameter you are changing. See [Storage parameters](#storage-parameters) for a list of available parameters. |

## Storage parameters

### Table parameters

{% include {{ page.version.version }}/misc/table-storage-parameters.md %}

## Required privileges

The user must be a member of the [`admin`](security-reference/authorization.html#roles) or [owner](security-reference/authorization.html#object-ownership) roles, or have the [`CREATE` privilege](security-reference/authorization.html#supported-privileges) on the table.

## Examples

### Reset a storage parameter

Following the example in [`WITH` (storage parameter)](with-storage-parameter.html#create-a-table-with-row-level-ttl-enabled), the `ttl_test` table has three TTL-related storage parameters active on the table:

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

To remove these settings, run the following command:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE ttl_test RESET (ttl);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CREATE TABLE ttl_test;
~~~

~~~
  table_name |                            create_statement
-------------+--------------------------------------------------------------------------
  ttl_test   | CREATE TABLE public.ttl_test (
             |     id UUID NOT NULL DEFAULT gen_random_uuid(),
             |     description STRING NULL,
             |     inserted_at TIMESTAMP NULL DEFAULT current_timestamp():::TIMESTAMP,
             |     CONSTRAINT ttl_test_pkey PRIMARY KEY (id ASC)
             | )
(1 row)
~~~

## See also

- [`CREATE TABLE`](create-table.html)
- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`SET` (storage parameter)](set-storage-parameter.html)
- [`WITH` (storage parameter)](with-storage-parameter.html)
