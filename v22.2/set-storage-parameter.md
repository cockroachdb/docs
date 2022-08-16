---
title: SET (storage parameter)
summary: SET (storage parameter) applies a storage parameter to a table or an index after table or index creation.
toc: true
docs_area: reference.sql
---

The `SET (storage parameter)` [statement](sql-statements.html) sets a storage parameter on an existing table or index.

{{site.data.alerts.callout_info}}
The `SET (storage parameter)` is a subcommand of [`ALTER TABLE`](alter-table.html) and [`ALTER INDEX`](alter-index.html).
{{site.data.alerts.end}}

## Syntax

**alter_table_set_storage_param ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-{{ page.version.version | replace: "v", "" }}/grammar_svg/alter_table_set_storage_param.html %}
</div>

{% comment %} need alter index diagram here {% endcomment %}

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

### Exclude a table's data from backups

In some situations, you may want to exclude a table's row data from a [backup](backup.html). For example, you have a table that contains high-churn data that you would like to [garbage collect](architecture/storage-layer.html#garbage-collection) more quickly than the [incremental backup](take-full-and-incremental-backups.html#incremental-backups) schedule for the database or cluster holding the table. You can use the `exclude_data_from_backup = true` parameter with a [`CREATE TABLE`](create-table.html#create-a-table-with-data-excluded-from-backup) or `ALTER TABLE` statement to mark a table's row data for exclusion from a backup.

For more detail and an example through the backup and [restore](restore.html) process using this parameter, see [Take Full and Incremental Backups](take-full-and-incremental-backups.html#exclude-a-tables-data-from-backups).

To set the `exclude_data_from_backup` parameter for a table, run the following:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE movr.user_promo_codes SET (exclude_data_from_backup = true);
~~~

The `CREATE` statement for this table will now show the parameter set:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CREATE user_promo_codes;
~~~

~~~
table_name         |                                                create_statement
-------------------+------------------------------------------------------------------------------------------------------------------
user_promo_codes   | CREATE TABLE public.user_promo_codes (
                   |     city VARCHAR NOT NULL,
                   |     user_id UUID NOT NULL,
                   |     code VARCHAR NOT NULL,
                   |     "timestamp" TIMESTAMP NULL,
                   |     usage_count INT8 NULL,
                   |     CONSTRAINT user_promo_codes_pkey PRIMARY KEY (city ASC, user_id ASC, code ASC),
                   |     CONSTRAINT user_promo_codes_city_user_id_fkey FOREIGN KEY (city, user_id) REFERENCES public.users(city, id)
                   | ) WITH (exclude_data_from_backup = true)
(1 row)
~~~

Backups will no longer include the data within the `user_promo_codes` table. The table will still be present in the backup, but it will be empty.

To remove this parameter from a table, run:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE movr.user_promo_codes SET (exclude_data_from_backup = false);
~~~

This will ensure that the table's data is stored in subsequent backups that you take.

## See also

- [`CREATE TABLE`](create-table.html)
- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`RESET` (storage parameter)](reset-storage-parameter.html)
- [`WITH` (storage parameter)](with-storage-parameter.html)
