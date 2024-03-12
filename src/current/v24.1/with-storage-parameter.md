---
title: WITH (storage parameter)
summary: WITH (storage parameter) applies a storage parameter to a table or an index at creation time.
toc: true
docs_area: reference.sql
---

The `WITH (storage parameter)` [statement]({% link {{ page.version.version }}/sql-statements.md %}) sets a storage parameter on a table.

## Syntax

**create_index_with_storage_param ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_index_with_storage_param.html %}
</div>

**create_table_with_storage_param ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_table_with_storage_param.html %}
</div>


## Command parameters

| Parameter           | Description          |
|---------------------+----------------------|
| `table`             | The table to which you are setting the parameter.  |
| `index`             | The index to which you are setting the parameter.  |
| `parameter_name`    | The name of the storage parameter. See [Storage parameters](#storage-parameters) for a list of available parameters. |

## Storage parameters

### Index parameters

{% include {{ page.version.version }}/misc/index-storage-parameters.md %}

### Table parameters

{% include {{ page.version.version }}/misc/table-storage-parameters.md %}

## Required privileges

The user must be a member of the [`admin`]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles) or [owner]({% link {{ page.version.version }}/security-reference/authorization.md %}#object-ownership) roles, or have the [`CREATE` privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) on the table.

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
  table_name |                                                                                         create_statement
-------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  ttl_test   | CREATE TABLE public.ttl_test (
             |     id UUID NOT NULL DEFAULT gen_random_uuid(),
             |     description STRING NULL,
             |     inserted_at TIMESTAMP NULL DEFAULT current_timestamp():::TIMESTAMP,
             |     crdb_internal_expiration TIMESTAMPTZ NOT VISIBLE NOT NULL DEFAULT current_timestamp():::TIMESTAMPTZ + '3 mons':::INTERVAL ON UPDATE current_timestamp():::TIMESTAMPTZ + '3 mons':::INTERVAL,
             |     CONSTRAINT ttl_test_pkey PRIMARY KEY (id ASC)
             | ) WITH (ttl = 'on', ttl_expire_after = '3 mons':::INTERVAL, ttl_job_cron = '@hourly')
(1 row)
~~~

In this case, CockroachDB implicitly added the `ttl` and `ttl_job_cron` [TTL storage parameters]({% link {{ page.version.version }}/row-level-ttl.md %}#ttl-storage-parameters).

## See also

- [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %})
- [Take Full and Incremental Backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %})
- [`BACKUP`]({% link {{ page.version.version }}/backup.md %})
- [`RESTORE`]({% link {{ page.version.version }}/restore.md %})
- [`SET` (storage parameter)]({% link {{ page.version.version }}/alter-table.md %}#set-storage-parameter)
- [`RESET` (storage parameter)]({% link {{ page.version.version }}/alter-table.md %}#reset-storage-parameter)
- [Batch Delete Expired Data with Row-Level TTL]({% link {{ page.version.version }}/row-level-ttl.md %})
