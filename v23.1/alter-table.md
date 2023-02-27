---
title: ALTER TABLE
summary: Use the ALTER TABLE statement to change the schema of a table.
toc: true
docs_area: reference.sql
---

The `ALTER TABLE` [statement](sql-statements.html) changes the definition of a table. For information on using `ALTER TABLE`, see the pages for its [subcommands](#subcommands).

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/misc/schema-change-view-job.md %}
{{site.data.alerts.end}}

## Required privileges

Refer to the respective [subcommands](#subcommands).

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_table.html %}
</div>
<br>

where `alter_table_cmd` is:

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_table_cmds.html %}
</div>

## Parameters

 Parameter | Description
-----------|-------------
`IF EXISTS` | Change the table only if a table with the current name exists; if one does not exist, do not return an error.
`table_name` | The name of the table you want to change.

Additional parameters are documented for the respective [subcommands](#subcommands).

## Subcommands

{{site.data.alerts.callout_success}}
Some subcommands can be used in combination in a single `ALTER TABLE` statement. For example, you can [atomically rename a column and add a new column with the old name of the existing column](#add-and-rename-columns-atomically).
{{site.data.alerts.end}}

Subcommand | Description | Can combine with other subcommands?
-----------|-------------|------------------------------------
[`ADD COLUMN`](#add-column) | Add columns to tables. | Yes
[`ADD CONSTRAINT`](#add-constraint) | Add constraints to columns. | Yes
[`ALTER COLUMN`](#alter-column) | Change an existing column. | Yes
[`ALTER PRIMARY KEY`](#alter-primary-key) | Change the [primary key](primary-key.html) of a table. | Yes
[`CONFIGURE ZONE`](#configure-zone) | [Configure replication zones](configure-replication-zones.html) for a table. | No
[`DROP COLUMN`](#drop-column) | Remove columns from tables. | Yes
[`DROP CONSTRAINT`](#drop-constraint) | Remove constraints from columns. | Yes
[`EXPERIMENTAL_AUDIT`](#experimental_audit) | Enable per-table audit logs, for security purposes. | Yes
[`OWNER TO`](#owner-to) |  Change the owner of the table. | No
[`PARTITION BY`](#partition-by)  | Partition, re-partition, or un-partition a table. ([Enterprise-only](enterprise-licensing.html).) | Yes
[`RENAME COLUMN`](#rename-column) | Change the names of columns. | Yes
[`RENAME CONSTRAINT`](#rename-constraint) | Change constraints columns. | Yes
[`RENAME TO`](#rename-to) | Change the names of tables. | No
[`RESET {storage parameter}`](#reset-storage-parameter) | Reset a storage parameter on a table to its default value. | Yes
[`SET {storage parameter}`](#set-storage-parameter) | Set a storage parameter on a table. | Yes
[`SET LOCALITY`](#set-locality) |  Set the table locality for a table in a [multi-region database](multiregion-overview.html). | No
[`SET SCHEMA`](#set-schema) |  Change the [schema](sql-name-resolution.html) of a table. | No
[`SPLIT AT`](#split-at) | Force a [range split](architecture/distribution-layer.html#range-splits) at the specified row in the table. | No
[`UNSPLIT AT`](#unsplit-at) | Remove a range split enforcement in the table. | No
[`VALIDATE CONSTRAINT`](#validate-constraint) | Check whether values in a column match a [constraint](constraints.html) on the column. | Yes

### `ADD COLUMN`

Use `ALTER TABLE ... ADD COLUMN` to add columns to existing tables.

For examples, see [Add columns](#add-columns).

#### Required privileges

The user must have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the table.

#### Parameters

Parameter | Description |
----------|-------------|
`IF NOT EXISTS` | Add a column only if a column of the same name does not already exist; if one does exist, do not return an error.
`column_name` | The name of the column you want to add. The column name must follow these [identifier rules](keywords-and-identifiers.html#identifiers) and must be unique within the table but can have the same name as indexes or constraints.
`typename` | The [data type](data-types.html) of the new column.
`col_qualification` | An optional list of [column qualifications](create-table.html#column-qualifications).

For usage, see [Synopsis](#synopsis).

### `ADD CONSTRAINT`

Use `ALTER TABLE ... ADD CONSTRAINT` to add the following [constraints](constraints.html) to columns:

- [`UNIQUE`](#add-the-unique-constraint)
- [`CHECK`](#add-the-check-constraint)
- [`FOREIGN KEY`](#add-the-foreign-key-constraint-with-cascade)

To add a primary key constraint to a table, you should explicitly define the primary key at [table creation](create-table.html). To replace an existing primary key, you can use `ADD CONSTRAINT ... PRIMARY KEY`. For details, see [Changing primary keys with `ADD CONSTRAINT ... PRIMARY KEY`](#changing-primary-keys-with-add-constraint-primary-key).

The [`DEFAULT`](default-value.html) and [`NOT NULL`](not-null.html) constraints are managed through [`ALTER COLUMN`](alter-table.html#alter-column).

For examples, see [Add constraints](#add-constraints).

#### Required privileges

The user must have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the table.

#### Parameters

Parameter | Description |
----------|-------------|
`IF NOT EXISTS` | Add a constraint only if a constraint of the same name does not already exist; if one does exist, do not return an error.
`constraint_name` | The name of the constraint, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers).
`constraint_elem` | The [`CHECK`](check.html), [foreign key](foreign-key.html), or [`UNIQUE`](unique.html) constraint you want to add. <br/><br/>Adding/changing a `DEFAULT` constraint is done through [`ALTER COLUMN`](#alter-column). <br/><br/>Adding/changing the table's `PRIMARY KEY` is not supported through `ALTER TABLE`; it can only be specified during [table creation](create-table.html).
`NOT VALID` | Create unvalidated constraints. When creating an unvalidated constraint, the system does not check that existing table data satisfies the constraint. The constraint is still enforced when table data is modified. An unvalidated constraint can later be validated using [`VALIDATE CONSTRAINT`](#validate-constraint).

For usage, see [Synopsis](#synopsis).

#### Changing primary keys with `ADD CONSTRAINT ... PRIMARY KEY`

When you change a primary key with [`ALTER TABLE ... ALTER PRIMARY KEY`](#alter-primary-key), the existing primary key index becomes a secondary index. The secondary index created by `ALTER PRIMARY KEY` takes up node memory and can slow down write performance to a cluster. If you do not have queries that filter on the primary key that you are replacing, you can use `ADD CONSTRAINT` to replace the existing primary index without creating a secondary index.

You can use `ADD CONSTRAINT ... PRIMARY KEY` to add a primary key to an existing table if one of the following is true:

- No primary key was explicitly defined at [table creation](create-table.html). In this case, the table is created with a default [primary key on `rowid`](indexes.html#creation). Using `ADD CONSTRAINT ... PRIMARY KEY` drops the default primary key and replaces it with a new primary key.
- A [`DROP CONSTRAINT`](alter-table.html#drop-constraint) statement precedes the `ADD CONSTRAINT ... PRIMARY KEY` statement, in the same transaction. For an example, see [Drop and add the primary key constraint](#drop-and-add-a-primary-key-constraint).

#### Aliases

In CockroachDB, the following are aliases for `ALTER TABLE ... ADD CONSTRAINT ... PRIMARY KEY`:

- `ALTER TABLE ... ADD PRIMARY KEY`

### `ALTER COLUMN`

Use `ALTER TABLE ... ALTER COLUMN` to do the following:

- Set, change, or drop a column's [`DEFAULT` constraint](default-value.html).
- Set or drop a column's [`NOT NULL` constraint](not-null.html).
- Set, change, or drop an [`ON UPDATE` expression](create-table.html#on-update-expressions).
- Change a column's [data type](data-types.html).
- Set the [visibility](#set-the-visibility-of-a-column) of a column.

{{site.data.alerts.callout_info}}
Support for altering column data types is [in preview](cockroachdb-feature-availability.html), with certain limitations. For details, see [Altering column data types](#alter-column-data-types).
{{site.data.alerts.end}}

For examples, see [Alter columns](#alter-columns).

#### Required privileges

The user must have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the table.

#### Parameters

Parameter | Description |
----------|-------------|
`column_name` | The name of the column to modify. |
`a_expr` | The new [default value](default-value.html) to set. |
`b_expr` | The [`ON UPDATE` expression](create-table.html#on-update-expressions) to set.
`[NOT] VISIBLE` | The visibility of a column when using `*` in a [`SELECT` clause](select-clause.html).
`typename` | The new [data type](data-types.html) you want to use.<br> Support for altering column types is [in preview](cockroachdb-feature-availability.html), with certain limitations. For details, see [Alter column data types](#alter-column-data-types). |
`USING a_expr` |  How to compute a new column value from the old column value. |

For usage, see [Synopsis](#synopsis).

#### Alter column data types

Support for altering column data types is [in preview](cockroachdb-feature-availability.html), with certain limitations. To enable column type altering, set the `enable_experimental_alter_column_type_general` [session variable](set-vars.html) to `true`.

The following are equivalent in CockroachDB:

- `ALTER TABLE ... ALTER ... TYPE`
- `ALTER TABLE ... ALTER COLUMN TYPE`
- `ALTER TABLE ... ALTER COLUMN SET DATA TYPE`

#### Limitations on altering data types

You cannot alter the data type of a column if:

- The column is part of an [index](indexes.html).
- The column has [`CHECK` constraints](check.html).
- The column owns a [sequence](create-sequence.html).
- The `ALTER COLUMN TYPE` statement is part of a combined `ALTER TABLE` statement.
- The `ALTER COLUMN TYPE` statement is inside an [explicit transaction](begin-transaction.html).

{{site.data.alerts.callout_info}}
Most `ALTER COLUMN TYPE` changes are finalized asynchronously. Schema changes on the table with the altered column may be restricted, and writes to the altered column may be rejected until the schema change is finalized.
{{site.data.alerts.end}}

### `ALTER PRIMARY KEY`

Use `ALTER TABLE ... ALTER PRIMARY KEY` to change the [primary key](primary-key.html) of a table.

Note the following:

- You cannot change the primary key of a table that is currently undergoing a primary key change, or any other [schema change](online-schema-changes.html).

- `ALTER PRIMARY KEY` might need to rewrite multiple indexes, which can make it an expensive operation.

-  When you change a primary key with `ALTER PRIMARY KEY`, the old primary key index becomes a [`UNIQUE`](unique.html) secondary index. This helps optimize the performance of queries that still filter on the old primary key column.

- `ALTER PRIMARY KEY` does not alter the [partitions](partitioning.html) on a table or its indexes, even if a partition is defined on [a column in the original primary key](partitioning.html#partition-using-primary-key). If you alter the primary key of a partitioned table, you must update the table partition accordingly.

- The secondary index created by `ALTER PRIMARY KEY` will not be partitioned, even if a partition is defined on [a column in the original primary key](partitioning.html#partition-using-primary-key). To ensure that the table is partitioned correctly, you must create a partition on the secondary index, or drop the secondary index.

- Any new primary key column set by `ALTER PRIMARY KEY` must have an existing [`NOT NULL` constraint](not-null.html). To add a `NOT NULL` constraint to an existing column, use [`ALTER TABLE ... ALTER COLUMN ... SET NOT NULL`](#set-not-null-constraint).

{{site.data.alerts.callout_success}}
To change an existing primary key without creating a secondary index from that primary key, use [`DROP CONSTRAINT ... PRIMARY KEY`/`ADD CONSTRAINT ... PRIMARY KEY`](#changing-primary-keys-with-add-constraint-primary-key). For examples, see [Add constraints](#add-constraints) and [Drop constraints](#drop-constraints).
{{site.data.alerts.end}}

For examples, see [Alter a primary key](#alter-a-primary-key).

#### Required privileges

The user must have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on a table to alter its primary key.

#### Parameters

Parameter | Description |
----------|-------------|
`index_params` | The name of the column(s) that you want to use for the primary key. These columns replace the current primary key column(s).
`USING HASH` | Creates a [hash-sharded index](hash-sharded-indexes.html).

For usage, see [Synopsis](#synopsis).

### `CONFIGURE ZONE`

`ALTER TABLE ... CONFIGURE ZONE` is used to add, modify, reset, or remove replication zones for a table. To view details about existing replication zones, use [`SHOW ZONE CONFIGURATIONS`](show-zone-configurations.html). For more information about replication zones, see [Configure Replication Zones](configure-replication-zones.html).

You can use *replication zones* to control the number and location of replicas for specific sets of data, both when replicas are first added and when they are rebalanced to maintain cluster equilibrium.

For examples, see [Configure replication zones](#configure-replication-zones).

#### Required privileges

The user must be a member of the [`admin` role](security-reference/authorization.html#admin-role) or have been granted [`CREATE`](security-reference/authorization.html#supported-privileges) or [`ZONECONFIG`](security-reference/authorization.html#supported-privileges) privileges. To configure [`system` objects](configure-replication-zones.html#for-system-data), the user must be a member of the `admin` role.

#### Parameters

 Parameter | Description
-----------+-------------
`variable` | The name of the [replication zone variable](configure-replication-zones.html#replication-zone-variables) to change.
`value` | The value of the [replication zone variable](configure-replication-zones.html#replication-zone-variables) to change.
`DISCARD` | Remove a replication zone.

For usage, see [Synopsis](#synopsis).

### `DROP COLUMN`

Use `ALTER TABLE ... DROP COLUMN` to remove columns from a table.

{{site.data.alerts.callout_danger}}
When used in an explicit transaction combined with other schema changes to the same table, `DROP COLUMN` can result in data loss if one of the other schema changes fails or is canceled. To work around this, move the `DROP COLUMN` statement to its own explicit transaction or run it in a single statement outside the existing transaction.
{{site.data.alerts.end}}

By default, `DROP COLUMN` drops any [indexes](indexes.html) on the column being dropped, and any indexes that reference the column, including [partial indexes](partial-indexes.html) with predicates that reference the column and indexes with [`STORING` clauses](create-index.html#store-columns) that reference the column.

For examples, see [Drop columns](#drop-columns).

#### Required privileges

The user must have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the table.

#### Parameters

Parameter | Description |
----------|-------------|
`column_name` | The name of the column you want to drop.<br><br>When a column with a [`CHECK`](check.html) constraint is dropped, the `CHECK` constraint is also dropped.
`CASCADE` | Drop the column even if objects (such as [views](views.html)) depend on it; drop the dependent objects, as well. `CASCADE` will drop a column with a foreign key constraint if it is the only column in the reference.<br><br>`CASCADE` does not list the objects it drops, so should be used cautiously.<br><br> `CASCADE` is not required to drop an indexed column, or a column that is referenced by an index. By default, `DROP COLUMN` drops any [indexes](indexes.html) on the column being dropped, and any indexes that reference the column, including [partial indexes](partial-indexes.html) with predicates that reference the column and indexes with [`STORING` clauses](create-index.html#store-columns) that reference the column.
`RESTRICT` | *(Default)* Do not drop the column if any objects (such as [views](views.html)) depend on it.

For usage, see [Synopsis](#synopsis).

### `DROP CONSTRAINT`

Use `ALTER TABLE ... DROP CONSTRAINT` to remove [`CHECK`](check.html) and [`FOREIGN KEY`](foreign-key.html) constraints from columns.

[`PRIMARY KEY`](primary-key.html) constraints can be dropped with `DROP CONSTRAINT` if an [`ADD CONSTRAINT`](alter-table.html#add-constraint) statement follows the `DROP CONSTRAINT` statement in the same transaction.

{{site.data.alerts.callout_success}}
When you change a primary key with [`ALTER TABLE ... ALTER PRIMARY KEY`](alter-table.html#alter-primary-key), the old primary key index becomes a secondary index. If you do not want the old primary key to become a secondary index, use `DROP CONSTRAINT`/[`ADD CONSTRAINT`](alter-table.html#add-constraint) to change the primary key.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
For information about removing other constraints, see [Constraints: Remove Constraints](constraints.html#remove-constraints).
{{site.data.alerts.end}}

For examples, see [Drop constraints](#drop-constraints).

#### Required privileges

The user must have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the table.

#### Parameters

Parameter | Description |
----------|-------------|
`constraint_name` | The name of the constraint you want to drop.

For usage, see [Synopsis](#synopsis).

<a id="experimental_audit"></a>

### `EXPERIMENTAL_AUDIT`

`ALTER TABLE ... EXPERIMENTAL_AUDIT` enables or disables the recording of SQL audit events to the [`SENSITIVE_ACCESS`](logging.html#sensitive_access) logging channel for a table. The `SENSITIVE_ACCESS` log output is also called the *SQL audit log*. For details on using SQL audit logs, see [SQL Audit Logging](sql-audit-logging.html).

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

SQL audit logs contain detailed information about queries being executed against your system, including:

- Full text of the query (which may include personally identifiable information (PII))
- Date/Time
- Client address
- Application name

CockroachDB stores audit log information in a way that ensures durability, but negatively impacts performance. As a result, we recommend using SQL audit logs for security purposes only. For more information, see [Performance considerations](sql-audit-logging.html#performance-considerations).

For examples, see [Configure audit logging](#configure-audit-logging).

#### Required privileges

Only members of the `admin` role can enable audit logs on a table. By default, the `root` user belongs to the `admin` role.

#### Parameters

Parameter | Description |
----------|-------------|
`READ`    | Log all table reads to the audit log file.
`WRITE`   | Log all table writes to the audit log file.
`OFF`     | Turn off audit logging.

For usage, see [Synopsis](#synopsis).

{{site.data.alerts.callout_info}}
This command logs all reads and writes, and both the `READ` and `WRITE` parameters are required (as shown in the [examples](#configure-audit-logging)).
{{site.data.alerts.end}}

### `OWNER TO`

`ALTER TABLE ... OWNER TO` is used to change the owner of a table.

For examples, see [Change table owner](#change-table-owner).

#### Required privileges

To change the owner of a table, the user must be an `admin` user, or the current owner of the table and a member of the new owner [role](security-reference/authorization.html#roles). The new owner role must also have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the schema to which the table belongs.

#### Parameters

Parameter | Description |
----------|-------------|
`role_spec` | The role to set as the owner of the table.

For usage, see [Synopsis](#synopsis).

### `PARTITION BY`

#### Required privileges

`ALTER TABLE ... PARTITION BY` is used to partition, re-partition, or un-partition a table. After defining partitions, [`CONFIGURE ZONE`](#configure-zone) is used to control the replication and placement of partitions.

{% include enterprise-feature.md %}

For examples, see [Define partitions](#define-partitions).

#### Parameters

Parameter | Description |
----------|-------------|
`name_list` | List of columns you want to define partitions on (in the order they are defined in the primary key).
`list_partitions` | Name of list partition followed by the list of values to be included in the partition.
`range_partitions` | Name of range partition followed by the range of values to be included in the partition.

For usage, see [Synopsis](#synopsis).

### `RENAME COLUMN`

`ALTER TABLE ... RENAME COLUMN` changes the name of a column in a table.

{{site.data.alerts.callout_info}}
It is not possible to rename a column referenced by a view. For more details, see [View Dependencies](views.html#view-dependencies).
{{site.data.alerts.end}}

For examples, see [Rename columns](#rename-columns).

#### Required privileges

The user must have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the table.

#### Parameters

Parameter | Description |
----------|-------------|
`IF EXISTS` | Rename the column only if a table of `table_name` exists; if one does not exist, do not return an error.
`column_name` | The current name of the column.
`column_new_name` | The [`name`](sql-grammar.html#name) you want to use for the column, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers).

For usage, see [Synopsis](#synopsis).

### `RENAME CONSTRAINT`

`ALTER TABLE ... RENAME CONSTRAINT` changes the name of a constraint on a column.

{{site.data.alerts.callout_info}}
It is not possible to rename a constraint for a column referenced by a view. For more details, see [View Dependencies](views.html#view-dependencies).
{{site.data.alerts.end}}

For examples, see [Rename constraints](#rename-constraints).

#### Required privileges

The user must have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the table.

#### Parameters

Parameter | Description |
----------|-------------|
`IF EXISTS` | Rename the constraint only if a constraint of `current_name` exists; if one does not exist, do not return an error.
`constraint_name` | The current name of the constraint.
`constraint_new_name` | The new [`name`](sql-grammar.html#name) you want to use for the constraint, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers).

For usage, see [Synopsis](#synopsis).

### `RENAME TO`

`ALTER TABLE ... RENAME TO` changes the name of a table.

{{site.data.alerts.callout_info}}
`ALTER TABLE ... RENAME TO` cannot be used to move a table from one schema to another. To change a table's schema, use [`SET SCHEMA`](#set-schema).

`ALTER TABLE ... RENAME TO` cannot be used to move a table from one database to another. To change a table's database, use [`BACKUP`](backup.html#backup-a-table-or-view) and [`RESTORE`](restore.html#restore-a-table).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
It is not possible to rename a table referenced by a view. For more details, see <a href="views.html#view-dependencies">View Dependencies</a>.
{{site.data.alerts.end}}

For examples, see [Rename tables](#rename-tables).

#### Required privileges

The user must have the `DROP` [privilege](security-reference/authorization.html#managing-privileges) on the table and the `CREATE` on the parent database. When moving a table from one database to another, the user must have the `CREATE` privilege on both the source and target databases.

#### Parameters

Parameter | Description |
----------|-------------|
`table_new_name` | The new name of the table, which must be unique within its database and follow these [identifier rules](keywords-and-identifiers.html#identifiers). When the parent database is not set as the default, the name must be formatted as `database.name`.<br><br>The [`UPSERT`](upsert.html) and [`INSERT ON CONFLICT`](insert.html) statements use a temporary table called `excluded` to handle uniqueness conflicts during execution. It's therefore not recommended to use the name `excluded` for any of your tables.

For usage, see [Synopsis](#synopsis).

### `RESET {storage parameter}`

`ALTER TABLE ... RESET {storage parameter}` reverts the value of a storage parameter on a table to its default value.

{{site.data.alerts.callout_info}}
To reset a storage parameter on an existing index, you must drop and [recreate the index without the storage parameter](with-storage-parameter.html).
{{site.data.alerts.end}}

For examples, see [Set and reset storage parameters](#set-and-reset-storage-parameters).

#### Required privileges

The user must be a member of the [`admin`](security-reference/authorization.html#roles) or [owner](security-reference/authorization.html#object-ownership) roles, or have the [`CREATE` privilege](security-reference/authorization.html#supported-privileges) on the table.

#### Parameters

Parameter | Description |
----------|-------------|
`storage_parameter_key`    | The name of the storage parameter you are changing. See [Table storage parameters](#table-storage-parameters) for a list of available parameters. |

For usage, see [Synopsis](#synopsis).

### `SET {storage parameter}`

`ALTER TABLE ... SET {storage parameter}` sets a storage parameter on an existing table.

{{site.data.alerts.callout_info}}
To set a storage parameter on an existing index, you must drop and [recreate the index with the storage parameter](with-storage-parameter.html).
{{site.data.alerts.end}}

For examples, see [Set and reset storage parameters](#set-and-reset-storage-parameters).

#### Required privileges

The user must be a member of the [`admin`](security-reference/authorization.html#roles) or [owner](security-reference/authorization.html#object-ownership) roles, or have the [`CREATE` privilege](security-reference/authorization.html#supported-privileges) on the table.

#### Parameters

Parameter | Description |
----------|-------------|
`storage_parameter_key`    | The name of the storage parameter. See [Table storage parameters](#table-storage-parameters) for a list of available parameters. |
`value` | The value to assign the storage parameter.

For usage, see [Synopsis](#synopsis).

#### Table storage parameters

{% include {{ page.version.version }}/misc/table-storage-parameters.md %}

### `SET LOCALITY`

`ALTER TABLE .. SET LOCALITY` changes the [table locality](multiregion-overview.html#table-locality) of a [table](create-table.html) in a [multi-region database](multiregion-overview.html).

While CockroachDB is processing an `ALTER TABLE .. SET LOCALITY` statement that enables or disables `REGIONAL BY ROW` on a table within a database, any [`ADD REGION`](alter-database.html#add-region) and [`DROP REGION`](alter-database.html#drop-region) statements on that database will fail.

For examples, see [Set localities](#set-localities).

#### Required privileges

The user must be a member of the [`admin`](security-reference/authorization.html#roles) or [owner](security-reference/authorization.html#object-ownership) roles, or have the [`CREATE` privilege](security-reference/authorization.html#supported-privileges) on the table.

#### Parameters

Parameter | Description |
----------|-------------|
`locality`   | The `LOCALITY` clause, followed by the [locality](multiregion-overview.html#table-locality) to apply to this table. Allowed values: <ul><li>[`REGIONAL BY TABLE`](#regional-by-table) (default)</li><li>[`REGIONAL BY ROW`](#regional-by-row)</li><li>[`GLOBAL`](#global)</li></ul> |

For usage, see [Synopsis](#synopsis).

For more information about which table locality is right for your use case, see [Table localities](multiregion-overview.html#table-locality).

### `SET SCHEMA`

`ALTER TABLE ... SET SCHEMA` changes the [schema](sql-name-resolution.html) of a table.

{{site.data.alerts.callout_info}}
CockroachDB supports `SET SCHEMA` as an [alias for setting the `search_path` session variable](set-vars.html#supported-variables).
{{site.data.alerts.end}}

For examples, see [Set table schema](#set-table-schema).

#### Required privileges

The user must have the `DROP` [privilege](security-reference/authorization.html#managing-privileges) on the table, and the `CREATE` privilege on the schema.

#### Parameters

Parameter | Description |
----------|-------------|
`schema_name` | The name of the new schema for the table.

For usage, see [Synopsis](#synopsis).

### `SPLIT AT`

`ALTER TABLE ... SPLIT AT` forces a [range split](architecture/distribution-layer.html#range-splits) at a specified row in the table.

{% include {{ page.version.version }}/sql/range-splits.md %}

For examples, see [Split and unsplit tables](#split-and-unsplit-tables).

#### Required privileges

The user must have the `INSERT` [privilege](security-reference/authorization.html#managing-privileges) on the table.

#### Parameters

Parameter | Description |
----------|-------------|
`select_stmt` | A [selection query](selection-queries.html) that produces one or more rows at which to split the table.
`a_expr` | The expiration of the split enforcement on the table. This can be a [`DECIMAL`](decimal.html), [`INTERVAL`](interval.html), [`TIMESTAMP`](timestamp.html), or [`TIMESTAMPZ`](timestamp.html).

For usage, see [Synopsis](#synopsis).

### `UNSPLIT AT`

`ALTER TABLE ... UNSPLIT AT` removes a [split enforcement](#split-at) on a [range split](architecture/distribution-layer.html#range-splits), at a specified row in the table.

Removing a split enforcement from a table or index ("unsplitting") allows CockroachDB to merge ranges as needed, to help improve your cluster's performance. For more information, see [Range Merges](architecture/distribution-layer.html#range-merges).

For examples, see [Split and unsplit tables](#split-and-unsplit-tables).

#### Required privileges

The user must have the `INSERT` [privilege](security-reference/authorization.html#managing-privileges) on the table.

#### Parameters

 Parameter | Description
-----------|-------------
`select_stmt` | A [selection query](selection-queries.html) that produces one or more rows at which to unsplit a table.
`ALL` | Remove all split enforcements for a table.

For usage, see [Synopsis](#synopsis).

### `VALIDATE CONSTRAINT`

`ALTER TABLE ... VALIDATE CONSTRAINT` checks whether values in a column match a [constraint](constraints.html) on the column.

This statement is especially useful after applying a constraint to an existing column via [`ADD CONSTRAINT`](#add-constraint). In this case, `VALIDATE CONSTRAINT` can be used to find values already in the column that do not match the constraint.

For examples, see [Validate constraints](#validate-constraints).

#### Required privileges

The user must have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the table.

#### Parameters

Parameter | Description |
----------|-------------|
`constraint_name` | The name of the constraint to validate.

For usage, see [Synopsis](#synopsis).

## View schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

### Add columns

The following examples use the [`bank` demo database schema](cockroach-demo.html#datasets).

To follow along, run [`cockroach demo bank`](cockroach-demo.html) to start a temporary, in-memory cluster with the `bank` schema and dataset preloaded:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach demo bank
~~~

#### Add a single column

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN active BOOL;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM bank;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices    | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-------------+------------
  id          | INT8      |    false    | NULL           |                       | {bank_pkey} |   false
  balance     | INT8      |    true     | NULL           |                       | {bank_pkey} |   false
  payload     | STRING    |    true     | NULL           |                       | {bank_pkey} |   false
  active      | BOOL      |    true     | NULL           |                       | {bank_pkey} |   false
(4 rows)
~~~

#### Add multiple columns

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN location STRING, ADD COLUMN currency STRING;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM bank;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices    | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-------------+------------
  id          | INT8      |    false    | NULL           |                       | {bank_pkey} |   false
  balance     | INT8      |    true     | NULL           |                       | {bank_pkey} |   false
  payload     | STRING    |    true     | NULL           |                       | {bank_pkey} |   false
  active      | BOOL      |    true     | NULL           |                       | {bank_pkey} |   false
  location    | STRING    |    true     | NULL           |                       | {bank_pkey} |   false
  currency    | STRING    |    true     | NULL           |                       | {bank_pkey} |   false
(6 rows)
~~~

#### Add a column with a `NOT NULL` constraint and a `DEFAULT` value

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN interest DECIMAL NOT NULL DEFAULT (DECIMAL '1.3');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM bank;
~~~
~~~
  column_name | data_type | is_nullable |     column_default     | generation_expression |  indices    | is_hidden
--------------+-----------+-------------+------------------------+-----------------------+-------------+------------
  id          | INT8      |    false    | NULL                   |                       | {bank_pkey} |   false
  balance     | INT8      |    true     | NULL                   |                       | {bank_pkey} |   false
  payload     | STRING    |    true     | NULL                   |                       | {bank_pkey} |   false
  active      | BOOL      |    true     | NULL                   |                       | {bank_pkey} |   false
  location    | STRING    |    true     | NULL                   |                       | {bank_pkey} |   false
  currency    | STRING    |    true     | NULL                   |                       | {bank_pkey} |   false
  interest    | DECIMAL   |    false    | 1.3:::DECIMAL::DECIMAL |                       | {bank_pkey} |   false
(7 rows)
~~~

#### Add a column with a `UNIQUE` constraint

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN address STRING UNIQUE;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM bank;
~~~
~~~
  column_name | data_type | is_nullable | column_default | generation_expression |          indices             | is_hidden
--------------+-----------+-------------+----------------+-----------------------+------------------------------+------------
  id          | INT8      |    false    | NULL           |                       | {bank_address_key,bank_pkey} |   false
  balance     | INT8      |    true     | NULL           |                       | {bank_pkey}                  |   false
  payload     | STRING    |    true     | NULL           |                       | {bank_pkey}                  |   false
  active      | BOOL      |    true     | NULL           |                       | {bank_pkey}                  |   false
  location    | STRING    |    true     | NULL           |                       | {bank_pkey}                  |   false
  currency    | STRING    |    true     | NULL           |                       | {bank_pkey}                  |   false
  interest    | DECIMAL   |    false    | 1.3:::DECIMAL  |                       | {bank_pkey}                  |   false
  address     | STRING    |    true     | NULL           |                       | {bank_address_key,bank_pkey} |   false
(8 rows)
~~~

#### Add a column with a `FOREIGN KEY` constraint

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers (
  id INT PRIMARY KEY,
  name STRING
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN cust_number INT REFERENCES customers(id);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM bank;
~~~
~~~
  column_name | data_type | is_nullable | column_default | generation_expression |          indices             | is_hidden
--------------+-----------+-------------+----------------+-----------------------+------------------------------+------------
  id          | INT8      |    false    | NULL           |                       | {bank_address_key,bank_pkey} |   false
  balance     | INT8      |    true     | NULL           |                       | {bank_pkey}                  |   false
  payload     | STRING    |    true     | NULL           |                       | {bank_pkey}                  |   false
  active      | BOOL      |    true     | NULL           |                       | {bank_pkey}                  |   false
  location    | STRING    |    true     | NULL           |                       | {bank_pkey}                  |   false
  currency    | STRING    |    true     | NULL           |                       | {bank_pkey}                  |   false
  interest    | DECIMAL   |    false    | 1.3:::DECIMAL  |                       | {bank_pkey}                  |   false
  address     | STRING    |    true     | NULL           |                       | {bank_address_key,bank_pkey} |   false
  cust_number | INT8      |    true     | NULL           |                       | {bank_pkey}                  |   false

(9 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CONSTRAINTS FROM bank;
~~~
~~~
  table_name |    constraint_name    | constraint_type |                      details                       | validated
-------------+-----------------------+-----------------+----------------------------------------------------+------------
  bank       | bank_address_key      | UNIQUE          | UNIQUE (address ASC)                               |     t
  bank       | bank_cust_number_fkey | FOREIGN KEY     | FOREIGN KEY (cust_number) REFERENCES customers(id) |     t
  bank       | bank_pkey             | PRIMARY KEY     | PRIMARY KEY (id ASC)                               |     t
(3 rows)
~~~

#### Add a column with collation

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN more_names STRING COLLATE en;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM bank;
~~~
~~~
  column_name |     data_type     | is_nullable | column_default | generation_expression |          indices             | is_hidden
--------------+-------------------+-------------+----------------+-----------------------+------------------------------+------------
  id          | INT8              |    false    | NULL           |                       | {bank_address_key,bank_pkey} |   false
  balance     | INT8              |    true     | NULL           |                       | {bank_pkey}                  |   false
  payload     | STRING            |    true     | NULL           |                       | {bank_pkey}                  |   false
  active      | BOOL              |    true     | NULL           |                       | {bank_pkey}                  |   false
  location    | STRING            |    true     | NULL           |                       | {bank_pkey}                  |   false
  currency    | STRING            |    true     | NULL           |                       | {bank_pkey}                  |   false
  interest    | DECIMAL           |    false    | 1.3:::DECIMAL  |                       | {bank_pkey}                  |   false
  address     | STRING            |    true     | NULL           |                       | {bank_address_key,bank_pkey} |   false
  cust_number | INT8              |    true     | NULL           |                       | {bank_pkey}                  |   false
  more_names  | STRING COLLATE en |    true     | NULL           |                       | {bank_pkey}                  |   false
(10 rows)
~~~

#### Add a column and assign it to a column family

##### Add a column and assign it to a new column family

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN location1 STRING CREATE FAMILY f1;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE bank;
~~~
~~~
  table_name |                                                          create_statement
-------------+--------------------------------------------------------------------------------------------------------------------------------------
  bank       | CREATE TABLE bank (
             |     id INT8 NOT NULL,
             |     balance INT8 NULL,
             |     payload STRING NULL,
             |     active BOOL NULL,
             |     location STRING NULL,
             |     currency STRING NULL,
             |     interest DECIMAL NOT NULL DEFAULT 1.3:::DECIMAL,
             |     address STRING NULL,
             |     cust_number INT8 NULL,
             |     more_names STRING COLLATE en NULL,
             |     location1 STRING NULL,
             |     CONSTRAINT bank_pkey PRIMARY KEY (id ASC),
             |     CONSTRAINT fk_cust_number_ref_customers FOREIGN KEY (cust_number) REFERENCES customers(id),
             |     UNIQUE INDEX bank_address_key (address ASC),
             |     FAMILY fam_0_id_balance_payload (id, balance, payload, active, location, currency, interest, address, cust_number, more_names),
             |     FAMILY f1 (location1)
             | )
(1 row)
~~~

##### Add a column and assign it to an existing column family

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN location2 STRING FAMILY f1;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE bank;
~~~
~~~
  table_name |                                                          create_statement
-------------+--------------------------------------------------------------------------------------------------------------------------------------
  bank       | CREATE TABLE bank (
             |     id INT8 NOT NULL,
             |     balance INT8 NULL,
             |     payload STRING NULL,
             |     active BOOL NULL,
             |     location STRING NULL,
             |     currency STRING NULL,
             |     interest DECIMAL NOT NULL DEFAULT 1.3:::DECIMAL,
             |     address STRING NULL,
             |     cust_number INT8 NULL,
             |     more_names STRING COLLATE en NULL,
             |     location1 STRING NULL,
             |     location2 STRING NULL,
             |     CONSTRAINT bank_pkey PRIMARY KEY (id ASC),
             |     CONSTRAINT fk_cust_number_ref_customers FOREIGN KEY (cust_number) REFERENCES customers(id),
             |     UNIQUE INDEX bank_address_key (address ASC),
             |     FAMILY fam_0_id_balance_payload (id, balance, payload, active, location, currency, interest, address, cust_number, more_names),
             |     FAMILY f1 (location1, location2)
             | )
(1 row)
~~~

##### Add a column and create a new column family if column family does not exist

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN new_name STRING CREATE IF NOT EXISTS FAMILY f2;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE bank;
~~~
~~~
  table_name |                                                          create_statement
-------------+--------------------------------------------------------------------------------------------------------------------------------------
  bank       | CREATE TABLE bank (
             |     id INT8 NOT NULL,
             |     balance INT8 NULL,
             |     payload STRING NULL,
             |     active BOOL NULL,
             |     location STRING NULL,
             |     currency STRING NULL,
             |     interest DECIMAL NOT NULL DEFAULT 1.3:::DECIMAL,
             |     address STRING NULL,
             |     cust_number INT8 NULL,
             |     more_names STRING COLLATE en NULL,
             |     location1 STRING NULL,
             |     location2 STRING NULL,
             |     new_name STRING NULL,
             |     CONSTRAINT bank_pkey PRIMARY KEY (id ASC),
             |     CONSTRAINT fk_cust_number_ref_customers FOREIGN KEY (cust_number) REFERENCES customers(id),
             |     UNIQUE INDEX bank_address_key (address ASC),
             |     FAMILY fam_0_id_balance_payload (id, balance, payload, active, location, currency, interest, address, cust_number, more_names),
             |     FAMILY f1 (location1, location2),
             |     FAMILY f2 (new_name)
             | )
(1 row)
~~~

#### Add a column with an `ON UPDATE` expression

 `ON UPDATE` expressions set the value for a column when other values in a row are updated.

For example, suppose you add a new column to the `bank` table:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN last_updated TIMESTAMPTZ DEFAULT now() ON UPDATE now();
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT id, balance, last_updated FROM bank LIMIT 5;
~~~

~~~
  id | balance |         last_updated
-----+---------+--------------------------------
   0 |       0 | 2021-10-21 17:03:41.213557+00
   1 |       0 | 2021-10-21 17:03:41.213557+00
   2 |       0 | 2021-10-21 17:03:41.213557+00
   3 |       0 | 2021-10-21 17:03:41.213557+00
   4 |       0 | 2021-10-21 17:03:41.213557+00
(5 rows)
~~~

When any value in any row of the `bank` table is updated, CockroachDB re-evaluates the `ON UPDATE` expression and updates the `last_updated` column with the result.

{% include_cached copy-clipboard.html %}
~~~ sql
> UPDATE bank SET balance = 500 WHERE id = 0;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT id, balance, last_updated FROM bank LIMIT 5;
~~~

~~~
  id | balance |         last_updated
-----+---------+--------------------------------
   0 |     500 | 2021-10-21 17:06:42.211261+00
   1 |       0 | 2021-10-21 17:03:41.213557+00
   2 |       0 | 2021-10-21 17:03:41.213557+00
   3 |       0 | 2021-10-21 17:03:41.213557+00
   4 |       0 | 2021-10-21 17:03:41.213557+00
(5 rows)
~~~

### Add constraints

{% include {{page.version.version}}/sql/movr-statements.md %}

#### Add the `UNIQUE` constraint

Adding the [`UNIQUE` constraint](unique.html) requires that all of a column's values be distinct from one another (except for `NULL` values).

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ADD CONSTRAINT id_name_unique UNIQUE (id, name);
~~~

#### Add the `CHECK` constraint

Adding the [`CHECK` constraint](check.html) requires that all of a column's values evaluate to `TRUE` for a Boolean expression.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE rides ADD CONSTRAINT check_revenue_positive CHECK (revenue >= 0);
~~~

In the process of adding the constraint CockroachDB will run a background job to validate existing table data. If CockroachDB finds a row that violates the constraint during the validation step, the [`ADD CONSTRAINT`](#add-constraint) statement will fail.

##### Add constraints to columns created during a transaction

You can add check constraints to columns that were created earlier in the transaction. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> BEGIN;
> ALTER TABLE users ADD COLUMN is_owner STRING;
> ALTER TABLE users ADD CONSTRAINT check_is_owner CHECK (is_owner IN ('yes', 'no', 'unknown'));
> COMMIT;
~~~

~~~
BEGIN
ALTER TABLE
ALTER TABLE
COMMIT
~~~

{{site.data.alerts.callout_info}}
The entire transaction will be rolled back, including any new columns that were added, in the following cases:

- If an existing column is found containing values that violate the new constraint.
- If a new column has a default value or is a [computed column](computed-columns.html) that would have contained values that violate the new constraint.
{{site.data.alerts.end}}

#### Add the foreign key constraint with `CASCADE`

To add a foreign key constraint, use the following steps.

Given two tables, `users` and `vehicles`, without foreign key constraints:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE users;
~~~

~~~
  table_name |                      create_statement
-------------+--------------------------------------------------------------
  users      | CREATE TABLE users (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     name VARCHAR NULL,
             |     address VARCHAR NULL,
             |     credit_card VARCHAR NULL,
             |     CONSTRAINT users_pkey PRIMARY KEY (city ASC, id ASC)
             | )
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE vehicles;
~~~

~~~
  table_name |                                       create_statement
-------------+------------------------------------------------------------------------------------------------
  vehicles   | CREATE TABLE vehicles (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     type VARCHAR NULL,
             |     owner_id UUID NULL,
             |     creation_time TIMESTAMP NULL,
             |     status VARCHAR NULL,
             |     current_location VARCHAR NULL,
             |     ext JSONB NULL,
             |     CONSTRAINT vehicles_pkey PRIMARY KEY (city ASC, id ASC),
             | )
(1 row)
~~~

You can include a [foreign key action](foreign-key.html#foreign-key-actions) to specify what happens when a foreign key is updated or deleted.

Using `ON DELETE CASCADE` will ensure that when the referenced row is deleted, all dependent objects are also deleted.

{{site.data.alerts.callout_danger}}
`CASCADE` does not list the objects it drops or updates, so it should be used with caution.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE vehicles ADD CONSTRAINT users_fk FOREIGN KEY (city, owner_id) REFERENCES users (city, id) ON DELETE CASCADE;
~~~

For an example of validating this constraint, see [Validate a constraint](#validate-a-constraint).

{{site.data.alerts.callout_info}}
By default, referenced columns must be in the same database as the referencing foreign key column. To enable cross-database foreign key references, set the `sql.cross_db_fks.enabled` [cluster setting](cluster-settings.html) to `true`.
{{site.data.alerts.end}}

#### Drop and add a primary key constraint

Suppose that you want to add `name` to the composite primary key of the `users` table, [without creating a secondary index of the existing primary key](#changing-primary-keys-with-add-constraint-primary-key).

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
  table_name |                      create_statement
-------------+--------------------------------------------------------------
  users      | CREATE TABLE users (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     name VARCHAR NULL,
             |     address VARCHAR NULL,
             |     credit_card VARCHAR NULL,
             |     CONSTRAINT users_pkey PRIMARY KEY (city ASC, id ASC)
             | )
(1 row)
~~~

1. Add a [`NOT NULL`](not-null.html) constraint to the `name` column with [`ALTER COLUMN`](#alter-column).

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE users ALTER COLUMN name SET NOT NULL;
    ~~~

1. In the same transaction, `DROP` the old `"primary"` constraint and [`ADD`](#add-constraint) the new one:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > BEGIN;
    > ALTER TABLE users DROP CONSTRAINT "primary";
    > ALTER TABLE users ADD CONSTRAINT "primary" PRIMARY KEY (city, name, id);
    > COMMIT;
    ~~~

    ~~~
    NOTICE: primary key changes are finalized asynchronously; further schema changes on this table may be restricted until the job completes
    ~~~

1. View the table structure: 

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW CREATE TABLE users;
    ~~~

    ~~~
      table_name |                          create_statement
    -------------+---------------------------------------------------------------------
      users      | CREATE TABLE users (
                |     id UUID NOT NULL,
                |     city VARCHAR NOT NULL,
                |     name VARCHAR NOT NULL,
                |     address VARCHAR NULL,
                |     credit_card VARCHAR NULL,
                |     CONSTRAINT "primary" PRIMARY KEY (city ASC, name ASC, id ASC),
                |     FAMILY "primary" (id, city, name, address, credit_card)
                | )
    (1 row)
    ~~~

Using [`ALTER PRIMARY KEY`](alter-table.html#alter-primary-key) would have created a `UNIQUE` secondary index called `users_city_id_key`. Instead, there is just one index for the primary key constraint.

#### Add a unique index to a `REGIONAL BY ROW` table

{% include {{page.version.version}}/sql/indexes-regional-by-row.md %}

This example assumes you have a simulated multi-region database running on your local machine following the steps described in [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html). It shows how a `UNIQUE` index is partitioned, but it's similar to how all indexes are partitioned on `REGIONAL BY ROW` tables.

To show how the automatic partitioning of indexes on `REGIONAL BY ROW` tables works, we will:

1. [Add a column](alter-table.html#add-column) to the `users` table in the [MovR dataset](movr.html).
1. Add a [`UNIQUE` constraint](unique.html) to that column.
1. Verify that the index is automatically partitioned for better multi-region performance by using [`SHOW INDEXES`](show-index.html) and [`SHOW PARTITIONS`](show-partitions.html).

First, add a column and its unique constraint. We'll use `email` since that is something that should be unique per user.

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE users ADD COLUMN email STRING;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE users ADD CONSTRAINT user_email_unique UNIQUE (email);
~~~

Next, issue the [`SHOW INDEXES`](show-index.html) statement. You will see that [the implicit region column](#set-the-table-locality-to-regional-by-row) that was added when the table [was converted to regional by row](demo-low-latency-multi-region-deployment.html#configure-regional-by-row-tables) is now indexed:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW INDEXES FROM users;
~~~

~~~
  table_name |    index_name     | non_unique | seq_in_index | column_name | direction | storing | implicit| visible
-------------+-------------------+------------+--------------+-------------+-----------+---------+---------+--------
  users      | users_pkey        |     f      |            1 | region      | ASC       |   f     |   t     |   t
  users      | users_pkey        |     f      |            2 | id          | ASC       |   f     |   f     |   t
  users      | users_pkey        |     f      |            3 | city        | N/A       |   t     |   f     |   t
  users      | users_pkey        |     f      |            4 | name        | N/A       |   t     |   f     |   t
  users      | users_pkey        |     f      |            5 | address     | N/A       |   t     |   f     |   t
  users      | users_pkey        |     f      |            6 | credit_card | N/A       |   t     |   f     |   t
  users      | users_pkey        |     f      |            7 | email       | N/A       |   t     |   f     |   t
  users      | user_email_unique |     f      |            1 | region      | ASC       |   f     |   t     |   t
  users      | user_email_unique |     f      |            2 | email       | ASC       |   f     |   f     |   t
  users      | user_email_unique |     f      |            3 | id          | ASC       |   f     |   t     |   t
  users      | users_city_idx    |     t      |            1 | region      | ASC       |   f     |   t     |   t
  users      | users_city_idx    |     t      |            2 | city        | ASC       |   f     |   f     |   t
  users      | users_city_idx    |     t      |            3 | id          | ASC       |   f     |   t     |   t
(13 rows)
~~~

Next, issue the [`SHOW PARTITIONS`](show-partitions.html) statement. The following output (which is edited for length) will verify that the unique index was automatically [partitioned](partitioning.html) for you. It shows that the `user_email_unique` index is now partitioned by the database regions `europe-west1`, `us-east1`, and `us-west1`.

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW PARTITIONS FROM TABLE users;
~~~

~~~
  database_name | table_name | partition_name | column_names |       index_name        | partition_value  |  ...
----------------+------------+----------------+--------------+-------------------------+------------------+-----
  movr          | users      | europe-west1   | region       | users@user_email_unique | ('europe-west1') |  ...
  movr          | users      | us-east1       | region       | users@user_email_unique | ('us-east1')     |  ...
  movr          | users      | us-west1       | region       | users@user_email_unique | ('us-west1')     |  ...
~~~

To ensure that the uniqueness constraint is enforced properly across regions when rows are inserted, or the `email` column of an existing row is updated, the database needs to do the following additional work when indexes are partitioned:

1. Run a one-time-only validation query to ensure that the existing data in the table satisfies the unique constraint.
1. Thereafter, the [optimizer](cost-based-optimizer.html) will automatically add a "uniqueness check" when necessary to any [`INSERT`](insert.html), [`UPDATE`](update.html), or [`UPSERT`](upsert.html) statement affecting the columns in the unique constraint.

{% include {{page.version.version}}/sql/locality-optimized-search.md %}

#### Using `DEFAULT gen_random_uuid()` in `REGIONAL BY ROW` tables

To auto-generate unique row identifiers in `REGIONAL BY ROW` tables, use the [`UUID`](uuid.html) column with the `gen_random_uuid()` [function](functions-and-operators.html#id-generation-functions) as the [default value](default-value.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE users (
        id UUID NOT NULL DEFAULT gen_random_uuid(),
        city STRING NOT NULL,
        name STRING NULL,
        address STRING NULL,
        credit_card STRING NULL,
        CONSTRAINT users_pkey PRIMARY KEY (city ASC, id ASC)
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO users (name, city) VALUES ('Petee', 'new york'), ('Eric', 'seattle'), ('Dan', 'seattle');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM users;
~~~

~~~
                   id                  |   city   | name  | address | credit_card
+--------------------------------------+----------+-------+---------+-------------+
  cf8ee4e2-cd74-449a-b6e6-a0fb2017baa4 | new york | Petee | NULL    | NULL
  2382564e-702f-42d9-a139-b6df535ae00a | seattle  | Eric  | NULL    | NULL
  7d27e40b-263a-4891-b29b-d59135e55650 | seattle  | Dan   | NULL    | NULL
(3 rows)
~~~

{{site.data.alerts.callout_info}}
When using `DEFAULT gen_random_uuid()` on columns in `REGIONAL BY ROW` tables, uniqueness checks on those columns are disabled by default for performance purposes. CockroachDB assumes uniqueness based on the way this column generates [`UUIDs`](uuid.html#create-a-table-with-auto-generated-unique-row-ids). To enable this check, you can modify the `sql.optimizer.uniqueness_checks_for_gen_random_uuid.enabled` [cluster setting](cluster-settings.html). Note that while there is virtually no chance of a [collision](https://en.wikipedia.org/wiki/Universally_unique_identifier#Collisions) occurring when enabling this setting, it is not truly zero.
{{site.data.alerts.end}}

#### Using implicit vs. explicit index partitioning in `REGIONAL BY ROW` tables

In `REGIONAL BY ROW` tables, all indexes are partitioned on the region column (usually called [`crdb_region`](alter-table.html#crdb_region)).

These indexes can either include or exclude the partitioning key (`crdb_region`) as the first column in the index definition:

- If `crdb_region` is included in the index definition, a [`UNIQUE` index](unique.html) will enforce uniqueness on the set of columns, just like it would in a non-partitioned table.
- If `crdb_region` is excluded from the index definition, that serves as a signal that CockroachDB should enforce uniqueness on only the columns in the index definition.

In the latter case, the index alone cannot enforce uniqueness on columns that are not a prefix of the index columns, so any time rows are [inserted](insert.html) or [updated](update.html) in a `REGIONAL BY ROW` table that has an implicitly partitioned `UNIQUE` index, the [optimizer](cost-based-optimizer.html) must add uniqueness checks.

Whether or not to explicitly include `crdb_region` in the index definition depends on the context:

- If you only need to enforce uniqueness at the region level, then including `crdb_region` in the `UNIQUE` index definition will enforce these semantics and allow you to get better performance on [`INSERT`](insert.html)s, [`UPDATE`](update.html)s, and [`UPSERT`](upsert.html)s, since there will not be any added latency from uniqueness checks.
- If you need to enforce global uniqueness, you should not include `crdb_region` in the `UNIQUE` (or [`PRIMARY KEY`](primary-key.html)) index definition, and the database will automatically ensure that the constraint is enforced.

To illustrate the different behavior of explicitly vs. implicitly partitioned indexes, we will perform the following tasks:

- Create a schema that includes an explicitly partitioned index, and an implicitly partitioned index.
- Check the output of several queries using `EXPLAIN` to show the differences in behavior between the two.

1. Start [`cockroach demo`](cockroach-demo.html) as follows:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach demo --geo-partitioned-replicas
    ~~~

1. Create a multi-region database and an `employees` table. There are three indexes in the table, all `UNIQUE` and all partitioned by the `crdb_region` column. The table schema guarantees that both `id` and `email` are globally unique, while `desk_id` is only unique per region. The indexes on `id` and `email` are implicitly partitioned, while the index on `(crdb_region, desk_id)` is explicitly partitioned. `UNIQUE` indexes can only directly enforce uniqueness on all columns in the index, including partitioning columns, so each of these indexes enforce uniqueness for `id`, `email`, and `desk_id` per region, respectively.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE DATABASE multi_region_test_db PRIMARY REGION "europe-west1" REGIONS "us-west1", "us-east1";
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    USE multi_region_test_db;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE employee (
      id INT PRIMARY KEY,
      email STRING UNIQUE,
      desk_id INT,
      UNIQUE (crdb_region, desk_id)
    ) LOCALITY REGIONAL BY ROW;
    ~~~

1. In the following statement, we add a new user with the required `id`, `email`, and `desk_id` columns. CockroachDB needs to do additional work to enforce global uniqueness for the `id` and `email` columns, which are implicitly partitioned. This additional work is in the form of "uniqueness checks" that the optimizer adds as part of mutation queries.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    EXPLAIN INSERT INTO employee VALUES (1, 'joe@example.com', 1);
    ~~~

    The following `EXPLAIN` output shows that the optimizer has added two `constraint-check` post queries to check the uniqueness of the implicitly partitioned indexes `id` and `email`. There is no check needed for `desk_id` (really `(crdb_region, desk_id)`), since that constraint is automatically enforced by the explicitly partitioned index we added in the preceding [`CREATE TABLE`](create-table.html) statement.

    ~~~
                                             info
    --------------------------------------------------------------------------------------
      distribution: local
      vectorized: true

      • root
      │
      ├── • insert
      │   │ into: employee(id, email, desk_id, crdb_region)
      │   │
      │   └── • buffer
      │       │ label: buffer 1
      │       │
      │       └── • values
      │             size: 5 columns, 1 row
      │
      ├── • constraint-check
      │   │
      │   └── • error if rows
      │       │
      │       └── • lookup join (semi)
      │           │ table: employee@primary
      │           │ equality: (lookup_join_const_col_@15, column1) = (crdb_region,id)
      │           │ equality cols are key
      │           │ pred: column10 != crdb_region
      │           │
      │           └── • cross join
      │               │ estimated row count: 3
      │               │
      │               ├── • values
      │               │     size: 1 column, 3 rows
      │               │
      │               └── • scan buffer
      │                     label: buffer 1
      │
      └── • constraint-check
          │
          └── • error if rows
              │
              └── • lookup join (semi)
                  │ table: employee@employee_email_key
                  │ equality: (lookup_join_const_col_@25, column2) = (crdb_region,email)
                  │ equality cols are key
                  │ pred: (column1 != id) OR (column10 != crdb_region)
                  │
                  └── • cross join
                      │ estimated row count: 3
                      │
                      ├── • values
                      │     size: 1 column, 3 rows
                      │
                      └── • scan buffer
                            label: buffer 1
    ~~~

1. The following statement updates the user's `email` column. Because the unique index on the `email` column is implicitly partitioned, the optimizer must perform a uniqueness check.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    EXPLAIN UPDATE employee SET email = 'joe1@example.com' WHERE id = 1;
    ~~~

    In the following `EXPLAIN` output, the optimizer performs a uniqueness check for `email` since we're not updating any other columns (see the `constraint-check` section).

    ~~~
                                                      info
    --------------------------------------------------------------------------------------------------------
      distribution: local
      vectorized: true

      • root
      │
      ├── • update
      │   │ table: employee
      │   │ set: email
      │   │
      │   └── • buffer
      │       │ label: buffer 1
      │       │
      │       └── • render
      │           │ estimated row count: 1
      │           │
      │           └── • union all
      │               │ estimated row count: 1
      │               │ limit: 1
      │               │
      │               ├── • scan
      │               │     estimated row count: 1 (100% of the table; stats collected 1 minute ago)
      │               │     table: employee@primary
      │               │     spans: [/'us-east1'/1 - /'us-east1'/1]
      │               │
      │               └── • scan
      │                     estimated row count: 1 (100% of the table; stats collected 1 minute ago)
      │                     table: employee@primary
      │                     spans: [/'europe-west1'/1 - /'europe-west1'/1] [/'us-west1'/1 - /'us-west1'/1]
      │
      └── • constraint-check
          │
          └── • error if rows
              │
              └── • lookup join (semi)
                  │ table: employee@employee_email_key
                  │ equality: (lookup_join_const_col_@18, email_new) = (crdb_region,email)
                  │ equality cols are key
                  │ pred: (id != id) OR (crdb_region != crdb_region)
                  │
                  └── • cross join
                      │ estimated row count: 3
                      │
                      ├── • values
                      │     size: 1 column, 3 rows
                      │
                      └── • scan buffer
                            label: buffer 1
    ~~~

1. If we only update the user's `desk_id`, no uniqueness checks are needed, since the index on that column is explicitly partitioned (it's really `(crdb_region, desk_id)`).

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    EXPLAIN UPDATE employee SET desk_id = 2 WHERE id = 1;
    ~~~

    Because no uniqueness check is needed, there is no `constraint-check` section in the `EXPLAIN` output.

    ~~~
                                                  info
    ------------------------------------------------------------------------------------------------
      distribution: local
      vectorized: true

      • update
      │ table: employee
      │ set: desk_id
      │ auto commit
      │
      └── • render
          │ estimated row count: 1
          │
          └── • union all
              │ estimated row count: 1
              │ limit: 1
              │
              ├── • scan
              │     estimated row count: 1 (100% of the table; stats collected 2 minutes ago)
              │     table: employee@primary
              │     spans: [/'us-east1'/1 - /'us-east1'/1]
              │
              └── • scan
                    estimated row count: 1 (100% of the table; stats collected 2 minutes ago)
                    table: employee@primary
                    spans: [/'europe-west1'/1 - /'europe-west1'/1] [/'us-west1'/1 - /'us-west1'/1]
    ~~~

### Alter columns

#### Set or change a `DEFAULT` value

Setting the [`DEFAULT` value constraint](default-value.html) inserts the value when data's written to the table without explicitly defining the value for the column. If the column already has a `DEFAULT` value set, you can use this statement to change it.

The following example inserts the Boolean value `true` whenever you inserted data to the `subscriptions` table without defining a value for the `newsletter` column.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE subscriptions ALTER COLUMN newsletter SET DEFAULT true;
~~~

#### Remove `DEFAULT` constraint

If the column has a defined [`DEFAULT` value](default-value.html), you can remove the constraint, which means the column will no longer insert a value by default if one is not explicitly defined for the column.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE subscriptions ALTER COLUMN newsletter DROP DEFAULT;
~~~

#### Set `NOT NULL` constraint

To specify that the column cannot contain `NULL` values, set the [`NOT NULL` constraint](not-null.html).

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE subscriptions ALTER COLUMN newsletter SET NOT NULL;
~~~

#### Remove `NOT NULL` constraint

If the column has the [`NOT NULL` constraint](not-null.html) applied to it, you can remove the constraint, which means the column becomes optional and can have `NULL` values written into it.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE subscriptions ALTER COLUMN newsletter DROP NOT NULL;
~~~

#### Convert a computed column into a regular column

{% include {{ page.version.version }}/computed-columns/convert-computed-column.md %}

#### Alter the formula for a computed column

{% include {{ page.version.version }}/computed-columns/alter-computed-column.md %}

#### Convert to a different data type

The [TPC-C](performance-benchmarking-with-tpcc-small.html) database has a `customer` table with a column `c_credit_lim` of type `DECIMAL(10,2)`:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW COLUMNS FROM customer) SELECT column_name, data_type FROM x WHERE column_name='c_credit_lim';
~~~

~~~
  column_name  |   data_type
---------------+----------------
  c_credit_lim | DECIMAL(10,2)
(1 row)
~~~

To change the data type from `DECIMAL` to `STRING`:

1. Set the `enable_experimental_alter_column_type_general` [session variable](set-vars.html) to `true`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SET enable_experimental_alter_column_type_general = true;
    ~~~

1. Alter the column type:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE customer ALTER c_credit_lim TYPE STRING;
    ~~~

    ~~~
    NOTICE: ALTER COLUMN TYPE changes are finalized asynchronously; further schema changes on this table may be restricted until the job completes; some writes to the altered column may be rejected until the schema change is finalized
    ~~~

1. Verify the type:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > WITH x AS (SHOW COLUMNS FROM customer) SELECT column_name, data_type FROM x WHERE column_name='c_credit_lim';
    ~~~

    ~~~
      column_name  | data_type
    ---------------+------------
      c_credit_lim | STRING
    (1 row)
    ~~~


#### Change a column type's precision

The [TPC-C](performance-benchmarking-with-tpcc-small.html) `customer` table contains a column `c_balance` of type `DECIMAL(12,2)`:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW COLUMNS FROM customer) SELECT column_name, data_type FROM x WHERE column_name='c_balance';
~~~

~~~
  column_name |   data_type
--------------+----------------
  c_balance   | DECIMAL(12,2)
(1 row)
~~~

To increase the precision of the `c_balance` column from `DECIMAL(12,2)` to `DECIMAL(14,2)`:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE customer ALTER c_balance TYPE DECIMAL(14,2);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW COLUMNS FROM customer) SELECT column_name, data_type FROM x WHERE column_name='c_balance';
~~~

~~~
  column_name |   data_type
--------------+----------------
  c_balance   | DECIMAL(14,2)
(1 row)
~~~

#### Change a column's type using an expression

You can change the data type of a column and create a new, computed value from the old column values, with a [`USING` clause](#parameters). For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW COLUMNS FROM customer) SELECT column_name, data_type FROM x WHERE column_name='c_discount';
~~~

~~~
  column_name |  data_type
--------------+---------------
  c_discount  | DECIMAL(4,4)
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT c_discount FROM customer LIMIT 10;
~~~

~~~
  c_discount
--------------
      0.1569
      0.4629
      0.2932
      0.0518
      0.3922
      0.1106
      0.0622
      0.4916
      0.3072
      0.0316
(10 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE customer ALTER c_discount TYPE STRING USING ((c_discount*100)::DECIMAL(4,2)::STRING || ' percent');
~~~

~~~
NOTICE: ALTER COLUMN TYPE changes are finalized asynchronously; further schema changes on this table may be restricted until the job completes; some writes to the altered column may be rejected until the schema change is finalized
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW COLUMNS FROM customer) SELECT column_name, data_type FROM x WHERE column_name='c_discount';
~~~

~~~
  column_name | data_type
--------------+------------
  c_discount  | STRING
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT c_discount FROM customer LIMIT 10;
~~~

~~~
   c_discount
-----------------
  15.69 percent
  46.29 percent
  29.32 percent
  5.18 percent
  39.22 percent
  11.06 percent
  6.22 percent
  49.16 percent
  30.72 percent
  3.16 percent
(10 rows)
~~~

#### Set the visibility of a column

To specify that a column won't be returned when using `*` in a [`SELECT` clause](select-clause.html), set the `NOT VISIBLE` property. You can set the `NOT VISIBLE` property only on individual columns.

For example, the `users` table of the [`movr` database](movr.html) contains the `credit_card` column. If you don't want users to see that column when running `SELECT * FROM users;`, you can hide it as follows:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ALTER COLUMN credit_card SET NOT VISIBLE;
~~~

When you run `SELECT *`, the column does not appear:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM users WHERE city = 'rome';
~~~

~~~
id                                     | city |       name        |            address
---------------------------------------+------+-------------------+--------------------------------
e6666666-6666-4800-8000-00000000002d   | rome | Misty Adams       | 82289 Natasha River Suite 12
eb851eb8-51eb-4800-8000-00000000002e   | rome | Susan Morse       | 49364 Melissa Squares Suite 4
f0a3d70a-3d70-4000-8000-00000000002f   | rome | Victoria Jennings | 31562 Krista Squares Suite 62
f5c28f5c-28f5-4000-8000-000000000030   | rome | Eric Perez        | 57624 Kelly Forks
fae147ae-147a-4000-8000-000000000031   | rome | Richard Bullock   | 21194 Alexander Estate
(5 rows)
~~~

The column is still selectable if you name it directly in the `target_elem` parameter:

~~~ sql
> SELECT id, credit_card FROM users WHERE city = 'rome';
~~~

~~~
id                                     | credit_card
---------------------------------------+--------------
e6666666-6666-4800-8000-00000000002d   | 4418943046
eb851eb8-51eb-4800-8000-00000000002e   | 0655485426
f0a3d70a-3d70-4000-8000-00000000002f   | 2232698265
f5c28f5c-28f5-4000-8000-000000000030   | 2620636730
fae147ae-147a-4000-8000-000000000031   | 2642076323
(5 rows)
~~~

To unhide the column, run:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ALTER COLUMN credit_card SET VISIBLE;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * from user WHERE city = 'rome';
~~~

~~~
                   id                  | city |       name        |            address            | credit_card
---------------------------------------+------+-------------------+-------------------------------+--------------
  e6666666-6666-4800-8000-00000000002d | rome | Misty Adams       | 82289 Natasha River Suite 12  |  4418943046
  eb851eb8-51eb-4800-8000-00000000002e | rome | Susan Morse       | 49364 Melissa Squares Suite 4 |  0655485426
  f0a3d70a-3d70-4000-8000-00000000002f | rome | Victoria Jennings | 31562 Krista Squares Suite 62 |  2232698265
  f5c28f5c-28f5-4000-8000-000000000030 | rome | Eric Perez        | 57624 Kelly Forks             |  2620636730
  fae147ae-147a-4000-8000-000000000031 | rome | Richard Bullock   | 21194 Alexander Estate        |  2642076323
(5 rows)
~~~

### Alter a primary key

#### Demo

<iframe width="560" height="315" src="https://www.youtube.com/embed/MPx-LXY2D-c" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

#### Alter a single-column primary key

Suppose that you are storing the data for users of your application in a table called `users`, defined by the following `CREATE TABLE` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE users (
  name STRING PRIMARY KEY,
  email STRING
);
~~~

The primary key of this table is on the `name` column. This is a poor choice, as some users likely have the same name, and all primary keys enforce a `UNIQUE` constraint on row values of the primary key column. Per our [best practices](performance-best-practices-overview.html#use-uuid-to-generate-unique-ids), you should instead use a `UUID` for single-column primary keys, and populate the rows of the table with generated, unique values.

You can add a column and change the primary key with a couple of `ALTER TABLE` statements:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ADD COLUMN id UUID NOT NULL DEFAULT gen_random_uuid();
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ALTER PRIMARY KEY USING COLUMNS (id);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
  table_name |                create_statement
-------------+--------------------------------------------------
  users      | CREATE TABLE users (
             |     name STRING NOT NULL,
             |     email STRING NULL,
             |     id UUID NOT NULL DEFAULT gen_random_uuid(),
             |     CONSTRAINT users_pkey PRIMARY KEY (id ASC),
             |     UNIQUE INDEX users_name_key (name ASC)
             | )
(1 row)
~~~

#### Alter an existing primary key to use hash sharding

{% include {{page.version.version}}/performance/alter-primary-key-hash-sharded.md %}

Note that the old primary key index becomes a secondary index, in this case, `users_name_key`. If you do not want the old primary key to become a secondary index when changing a primary key, you can use [`DROP CONSTRAINT`](alter-table.html#drop-constraint)/[`ADD CONSTRAINT`](alter-table.html#add-constraint) instead.

### Configure replication zones

{% include {{ page.version.version }}/sql/movr-statements-geo-partitioned-replicas.md %}

#### Create a replication zone for a table

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-table.md %}

#### Edit a replication zone

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users CONFIGURE ZONE USING range_min_bytes = 0, range_max_bytes = 90000, gc.ttlseconds = 89999, num_replicas = 4;
~~~

~~~
CONFIGURE ZONE 1
~~~

#### Reset a replication zone

{% include {{ page.version.version }}/zone-configs/reset-a-replication-zone.md %}

#### Remove a replication zone

{% include {{ page.version.version }}/zone-configs/remove-a-replication-zone.md %}

### Drop columns

{% include {{page.version.version}}/sql/movr-statements.md %}

#### Drop a column

If you no longer want a column in a table, you can drop it.

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM users;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-----------+------------
  id          | UUID      |    false    | NULL           |                       | {primary} |   false
  city        | VARCHAR   |    false    | NULL           |                       | {primary} |   false
  name        | VARCHAR   |    true     | NULL           |                       | {primary} |   false
  address     | VARCHAR   |    true     | NULL           |                       | {primary} |   false
  credit_card | VARCHAR   |    true     | NULL           |                       | {primary} |   false
(5 rows)
~~~

If there is data in the table, the `sql_safe_updates` [session variable](set-vars.html) must be set to `false`.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users DROP COLUMN credit_card;
~~~

~~~
ERROR: rejected (sql_safe_updates = true): ALTER TABLE DROP COLUMN will remove all data in that column
SQLSTATE: 01000
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SET sql_safe_updates = false;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users DROP COLUMN credit_card;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM users;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-----------+------------
  id          | UUID      |    false    | NULL           |                       | {primary} |   false
  city        | VARCHAR   |    false    | NULL           |                       | {primary} |   false
  name        | VARCHAR   |    true     | NULL           |                       | {primary} |   false
  address     | VARCHAR   |    true     | NULL           |                       | {primary} |   false
(4 rows)
~~~

#### Prevent dropping columns with dependent objects (`RESTRICT`)

If the column has dependent objects, such as [views](views.html), CockroachDB will not drop the column by default. However, if you want to be sure of the behavior you can include the `RESTRICT` clause.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE VIEW expensive_rides AS SELECT id, city FROM rides WHERE revenue > 90;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE rides DROP COLUMN revenue RESTRICT;
~~~

~~~
ERROR: cannot drop column "revenue" because view "expensive_rides" depends on it
SQLSTATE: 2BP01
HINT: you can drop expensive_rides instead.
~~~

#### Drop a column and its dependent objects (`CASCADE`)

If you want to drop the column and all of its dependent options, include the `CASCADE` clause.

{{site.data.alerts.callout_danger}}
<code>CASCADE</code> does not list objects it drops, so should be used cautiously.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE expensive_rides;
~~~

~~~
    table_name    |                                              create_statement
------------------+-------------------------------------------------------------------------------------------------------------
  expensive_rides | CREATE VIEW public.expensive_rides (id, city) AS SELECT id, city FROM movr.public.rides WHERE revenue > 90
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE rides DROP COLUMN revenue CASCADE;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE expensive_rides;
~~~

~~~
ERROR: relation "expensive_rides" does not exist
SQLSTATE: 42P01
~~~

#### Drop an indexed column

 `DROP COLUMN` drops a column and any indexes on the column being dropped.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX start_end_idx ON rides(start_time, end_time);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW INDEXES FROM rides) SELECT * FROM x WHERE index_name='start_end_idx';
~~~

~~~
  table_name |  index_name   | non_unique | seq_in_index | column_name | direction | storing | implicit | visible
-------------+---------------+------------+--------------+-------------+-----------+---------+----------+----------
  rides      | start_end_idx |     t      |            1 | start_time  | ASC       |    f    |    f     |    t
  rides      | start_end_idx |     t      |            2 | end_time    | ASC       |    f    |    f     |    t
  rides      | start_end_idx |     t      |            3 | city        | ASC       |    f    |    t     |    t
  rides      | start_end_idx |     t      |            4 | id          | ASC       |    f    |    t     |    t
(4 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE rides DROP COLUMN start_time;
~~~

~~~
NOTICE: the data for dropped indexes is reclaimed asynchronously
HINT: The reclamation delay can be customized in the zone configuration for the table.
ALTER TABLE
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW INDEXES FROM rides) SELECT * FROM x WHERE index_name='start_end_idx';
~~~

~~~
  table_name | index_name | non_unique | seq_in_index | column_name | direction | storing | implicit
-------------+------------+------------+--------------+-------------+-----------+---------+-----------
(0 rows)
~~~

### Drop constraints

{% include {{page.version.version}}/sql/movr-statements.md %}

#### Drop a foreign key constraint

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CONSTRAINTS FROM vehicles;
~~~

~~~
  table_name |  constraint_name  | constraint_type |                         details                         | validated
-------------+-------------------+-----------------+---------------------------------------------------------+------------
  vehicles   | fk_city_ref_users | FOREIGN KEY     | FOREIGN KEY (city, owner_id) REFERENCES users(city, id) |   true
  vehicles   | vehicles_pkey     | PRIMARY KEY     | PRIMARY KEY (city ASC, id ASC)                          |   true
(2 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE vehicles DROP CONSTRAINT fk_city_ref_users;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CONSTRAINTS FROM vehicles;
~~~

~~~
  table_name | constraint_name | constraint_type |            details             | validated
-------------+-----------------+-----------------+--------------------------------+------------
  vehicles   | vehicles_pkey   | PRIMARY KEY     | PRIMARY KEY (city ASC, id ASC) |   true
(1 row)
~~~

### Configure audit logging

#### Turn on audit logging

Let's say you have a  `customers` table that contains personally identifiable information (PII). To turn on audit logs for that table, run the following command:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE customers EXPERIMENTAL_AUDIT SET READ WRITE;
~~~

Now, every access of customer data is logged to the `SENSITIVE_ACCESS` channel in a [`sensitive_table_access`](eventlog.html#sensitive_table_access) event that looks like the following:

~~~
I210323 18:50:10.951550 1182 8@util/log/event_log.go:32 ⋮ [n1,client=‹[::1]:49851›,hostnossl,user=root] 4 ={"Timestamp":1616525410949087000,"EventType":"sensitive_table_access","Statement":"‹SELECT * FROM \"\".\"\".customers›","User":"‹root›","DescriptorID":52,"ApplicationName":"‹$ cockroach sql›","ExecMode":"exec","NumRows":2,"Age":2.514,"FullTableScan":true,"TxnCounter":38,"TableName":"‹defaultdb.public.customers›","AccessMode":"r"}
~~~

{{site.data.alerts.callout_info}}
The preceding example shows the default [`crdb-v2`](log-formats.html#format-crdb-v2) log format. This can be changed to a different format (e.g., JSON). For details, see [Configure Logs](configure-logs.html#file-logging-format).
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
For descriptions of all SQL audit event types and their fields, see [Notable Event Types](eventlog.html#sql-access-audit-events).
{{site.data.alerts.end}}

To turn on auditing for more than one table, issue a separate `ALTER` statement for each table.

{{site.data.alerts.callout_success}}
For a more detailed example, see [SQL Audit Logging](sql-audit-logging.html).
{{site.data.alerts.end}}

#### Turn off audit logging

To turn off logging, issue the following command:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE customers EXPERIMENTAL_AUDIT SET OFF;
~~~

### Change table owner

#### Change a table's owner

Suppose that the current owner of the `rides` table is `root` and you want to change the owner to a new user named `max`.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE promo_codes OWNER TO max;
~~~

To verify that the owner is now `max`, query the `pg_catalog.pg_tables` table:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT tableowner FROM pg_catalog.pg_tables WHERE tablename = 'promo_codes';
~~~

~~~
  tableowner
--------------
  max
(1 row)
~~~

{{site.data.alerts.callout_info}}
If the user running the command is not an admin user, they must own the table and be a member of the new owning role. Also, the new owner role must also have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the schema to which the table belongs.
{{site.data.alerts.end}}

### Define partitions

#### Define a list partition on a table

Suppose we have a table called `students_by_list`, and the primary key of the table is defined as `(country, id)`. We can define partitions on the table by list:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE students_by_list PARTITION BY LIST (country) (
    PARTITION north_america VALUES IN ('CA','US'),
    PARTITION australia VALUES IN ('AU','NZ'),
    PARTITION DEFAULT VALUES IN (default)
  );
~~~

#### Define a range partition on a table

Suppose we have a table called `students_by_range`, and the primary key of the table is defined as `(expected_graduation_date, id)`. We can define partitions on the table by range:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE students_by_range PARTITION BY RANGE (expected_graduation_date) (
    PARTITION graduated VALUES FROM (MINVALUE) TO ('2017-08-15'),
    PARTITION current VALUES FROM ('2017-08-15') TO (MAXVALUE)
  );
~~~

#### Define subpartitions on a table

Suppose we have a table named `students`, and the primary key is defined as `(country, expected_graduation_date, id)`. We can define partitions and subpartitions on the table:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE students PARTITION BY LIST (country) (
    PARTITION australia VALUES IN ('AU','NZ') PARTITION BY RANGE (expected_graduation_date) (
      PARTITION graduated_au VALUES FROM (MINVALUE) TO ('2017-08-15'),
      PARTITION current_au VALUES FROM ('2017-08-15') TO (MAXVALUE)
    ),
    PARTITION north_america VALUES IN ('US','CA') PARTITION BY RANGE (expected_graduation_date) (
      PARTITION graduated_us VALUES FROM (MINVALUE) TO ('2017-08-15'),
      PARTITION current_us VALUES FROM ('2017-08-15') TO (MAXVALUE)
    )
  );
~~~

#### Repartition a table

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE students_by_range PARTITION BY RANGE (expected_graduation_date) (
    PARTITION graduated VALUES FROM (MINVALUE) TO ('2018-08-15'),
    PARTITION current VALUES FROM ('2018-08-15') TO (MAXVALUE)
  );
~~~

#### Unpartition a table

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE students PARTITION BY NOTHING;
~~~

### Rename columns

#### Rename a column

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE users (
    id INT PRIMARY KEY,
    first_name STRING,
    family_name STRING
  );
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users RENAME COLUMN family_name TO last_name;
~~~

~~~
  table_name |                 create_statement
+------------+--------------------------------------------------+
  users      | CREATE TABLE users (
             |     id INT8 NOT NULL,
             |     first_name STRING NULL,
             |     last_name STRING NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
             |     FAMILY "primary" (id, first_name, last_name)
             | )
(1 row)
~~~

#### Add and rename columns atomically

Some subcommands can be used in combination in a single [`ALTER TABLE`](alter-table.html) statement. For example, let's say you create a `users` table with 2 columns, an `id` column for the primary key and a `name` column for each user's last name:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE users (
    id INT PRIMARY KEY,
    name STRING
  );
~~~

Then you decide you want distinct columns for each user's first name, last name, and full name, so you execute a single `ALTER TABLE` statement renaming `name` to `last_name`, adding `first_name`, and adding a [computed column](computed-columns.html) called `name` that concatenates `first_name` and `last_name`:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users
    RENAME COLUMN name TO last_name,
    ADD COLUMN first_name STRING,
    ADD COLUMN name STRING
      AS (CONCAT(first_name, ' ', last_name)) STORED;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
  table_name |                           create_statement
+------------+----------------------------------------------------------------------+
  users      | CREATE TABLE users (
             |     id INT8 NOT NULL,
             |     last_name STRING NULL,
             |     first_name STRING NULL,
             |     name STRING NULL AS (concat(first_name, ' ', last_name)) STORED,
             |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
             |     FAMILY "primary" (id, last_name, first_name, name)
             | )
(1 row)
~~~

### Rename constraints

#### Rename a constraint

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE logon (
    login_id INT PRIMARY KEY,
    customer_id INT NOT NULL,
    sales_id INT,
    UNIQUE (customer_id, sales_id)
  );
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CONSTRAINTS FROM logon;
~~~

~~~
  table_name |        constraint_name         | constraint_type |                details                 | validated
+------------+--------------------------------+-----------------+----------------------------------------+-----------+
  logon      | logon_customer_id_sales_id_key | UNIQUE          | UNIQUE (customer_id ASC, sales_id ASC) |   true
  logon      | logon_pkey                     | PRIMARY KEY     | PRIMARY KEY (login_id ASC)             |   true
(2 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE logon RENAME CONSTRAINT logon_customer_id_sales_id_key TO unique_customer_id_sales_id;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CONSTRAINTS FROM logon;
~~~

~~~
  table_name |       constraint_name       | constraint_type |                details                 | validated
+------------+-----------------------------+-----------------+----------------------------------------+-----------+
  logon      | logon_pkey                  | PRIMARY KEY     | PRIMARY KEY (login_id ASC)             |   true
  logon      | unique_customer_id_sales_id | UNIQUE          | UNIQUE (customer_id ASC, sales_id ASC) |   true
(2 rows)
~~~

### Rename tables

{% include {{page.version.version}}/sql/movr-statements.md %}

#### Rename a table

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
  schema_name |         table_name         | type  | estimated_row_count
--------------+----------------------------+-------+----------------------
  public      | promo_codes                | table |                1000
  public      | rides                      | table |                 500
  public      | user_promo_codes           | table |                   0
  public      | users                      | table |                  50
  public      | vehicle_location_histories | table |                1000
  public      | vehicles                   | table |                  15
(6 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users RENAME TO riders;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
  schema_name |         table_name         | type  | estimated_row_count
--------------+----------------------------+-------+----------------------
  public      | promo_codes                | table |                1000
  public      | rides                      | table |                 500
  public      | user_promo_codes           | table |                   0
  public      | riders                     | table |                  50
  public      | vehicle_location_histories | table |                1000
  public      | vehicles                   | table |                  15
(6 rows)
~~~

To avoid an error in case the table does not exist, you can include `IF EXISTS`:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE IF EXISTS customers RENAME TO clients;
~~~

### Set and reset storage parameters

#### Exclude a table's data from backups

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

#### Reset a storage parameter

The following `ttl_test` table has three TTL-related storage parameters active on the table:

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

### Set localities

{{site.data.alerts.callout_info}}
[`RESTORE`](restore.html) on [`REGIONAL BY TABLE`](#regional-by-table), [`REGIONAL BY ROW`](#regional-by-row), and [`GLOBAL`](#global) tables is supported with some limitations — see [Restoring to multi-region databases](restore.html#restoring-to-multi-region-databases) for more detail.
{{site.data.alerts.end}}

<a name="regional-by-table"></a>

#### Set the table locality to `REGIONAL BY TABLE`

To optimize read and write access to the data in a table from the primary region, use the following statement, which sets the table's home region to the primary region:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE {table} SET LOCALITY REGIONAL BY TABLE IN PRIMARY REGION;
~~~

To optimize read and write access to the data in a table from the `us-east-1` region, use the following statement, which sets the table's home region to `us-east-1`:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE {table} SET LOCALITY REGIONAL BY TABLE IN "us-east-1";
~~~

{{site.data.alerts.callout_info}}
If no region is supplied, `REGIONAL BY TABLE` defaults the table's home region to the primary region.
{{site.data.alerts.end}}

For more information about how this table locality works, see [Regional tables](multiregion-overview.html#regional-tables).

<a name="regional-by-row"></a>

#### Set the table locality to `REGIONAL BY ROW`

{{site.data.alerts.callout_info}}
Before setting the locality to `REGIONAL BY ROW` on a table targeted by a changefeed, read the considerations in [Changefeeds on regional by row tables](changefeeds-in-multi-region-deployments.html).
{{site.data.alerts.end}}

To make an existing table a _regional by row_ table, use the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE {table} SET LOCALITY REGIONAL BY ROW;
~~~

<a name="crdb_region"></a>

Every row in a regional by row table has a column of type `crdb_internal_region` that represents the row's [home region](multiregion-overview.html#table-localities). By default, this column is called `crdb_region` and is hidden. To see a row's home region, issue a statement like the following:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT crdb_region, id FROM {table};
~~~

<a name="update-a-rows-home-region"></a> To update an existing row's home region, use an [`UPDATE`](update.html) statement like the following:

{% include_cached copy-clipboard.html %}
~~~ sql
UPDATE {table} SET crdb_region = 'eu-west' WHERE id IN (...)
~~~

To add a new row to a regional by row table, you must choose one of the following options.

- Let CockroachDB set the row's home region automatically. It will use the region of the [gateway node](architecture/life-of-a-distributed-transaction.html#gateway) from which the row is inserted.

- Set the home region explicitly using an [`INSERT`](insert.html) statement like the following:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    INSERT INTO {table} (crdb_region, ...) VALUES ('us-east-1', ...);
    ~~~

This is necessary because every row in a regional by row table must have a home region.

If you do not set a home region for a row in a regional by row table, it defaults to the value returned by the built-in function `gateway_region()`. If the value returned by `gateway_region()` does not belong to the multi-region database the table is a part of, the home region defaults to the database's primary region.

For more information about how this table locality works, see [Regional by row tables](multiregion-overview.html#regional-by-row-tables).

<a name="rename-crdb_region"></a>

Note that you can use a name other than `crdb_region` for the hidden column by using the following statements:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE foo SET LOCALITY REGIONAL BY ROW AS bar;
SELECT bar, id FROM foo;
INSERT INTO foo (bar, ...) VALUES ('us-east-1', ...);
~~~

In fact, you can specify any column definition you like for the `REGIONAL BY ROW AS` column, as long as the column is of type `crdb_internal_region` and is not nullable. For example, you could modify the [movr schema](movr.html#the-movr-database) to have a region column generated as:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE rides ADD COLUMN region crdb_internal_region AS (
  CASE
    WHEN city IN ('new york', 'boston', 'washington dc', 'chicago', 'detroit', 'minneapolis') THEN 'us-east-1'
    WHEN city IN ('san francisco', 'seattle', 'los angeles') THEN 'us-west-1'
    WHEN city IN ('amsterdam', 'paris', 'rome') THEN 'eu-west-1'
  END
) STORED;
~~~

{% include {{page.version.version}}/sql/locality-optimized-search.md %}

#### Turn on auto-rehoming for `REGIONAL BY ROW` tables

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

This feature is disabled by default.

When auto-rehoming is enabled, the [home regions](#crdb_region) of rows in [`REGIONAL BY ROW`](#set-the-table-locality-to-regional-by-row) tables are automatically set to the region of the [gateway node](ui-sessions-page.html#session-details-gateway-node) from which any [`UPDATE`](update.html) or [`UPSERT`](upsert.html) statements that operate on those rows originate. This functionality is provided by adding [an `ON UPDATE` expression](create-table.html#on-update-expressions) to the [home region column](#crdb_region).

Once enabled, the auto-rehoming behavior described here has the following limitations:

- It **will only apply to newly created `REGIONAL BY ROW` tables**. Existing `REGIONAL BY ROW` tables will not be auto-rehomed.
- The [`crdb_region`](#crdb_region) column from a [`REGIONAL BY ROW`](#set-the-table-locality-to-regional-by-row) table cannot be referenced as a [foreign key](foreign-key.html) from another table.

To enable it using the [session setting](set-vars.html), issue the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SET enable_auto_rehoming = on;
~~~

~~~
SET
~~~

##### Example

1. Follow steps 1 and 2 from the [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html) tutorial. This will involve starting a [`cockroach demo`](cockroach-demo.html) cluster in a terminal window (call it _terminal 1_).

1. From the [SQL client](cockroach-sql.html) running in terminal 1, set the setting that enables auto-rehoming. You must issue this setting before creating the `REGIONAL BY ROW` tables that you want auto-rehomed.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET enable_auto_rehoming = on;
    ~~~

1. In a second terminal window (call it _terminal 2_), [finish the tutorial starting from step 3](demo-low-latency-multi-region-deployment.html#step-3-load-and-run-movr) onward to finish loading the cluster with data and applying the multi-region SQL configuration.

1. Switch back to terminal 1, and check the gateway region of the node you are currently connected to:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT gateway_region();
    ~~~

    ~~~
      gateway_region
    ------------------
      us-east1
    (1 row)
    ~~~

1. Open another terminal (call it _terminal 3_), and use [`cockroach sql`](cockroach-sql.html) to connect to a node in a different region in the demo cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --insecure --host localhost --port 26262
    ~~~

    ~~~
    # Welcome to the CockroachDB SQL shell.
    # All statements must be terminated by a semicolon.
    # To exit, type: \q.
    #
    # Server version: CockroachDB CCL {{ page.release_info.version }} (x86_64-apple-darwin19, built {{ page.release_info.build_time }}) (same version as client)
    # Cluster ID: 87b22d9b-b9ce-4f3a-8635-acad89c5981f
    # Organization: Cockroach Demo
    #
    # Enter \? for a brief introduction.
    #
    root@localhost:26262/defaultdb>
    ~~~

1. From the SQL shell prompt that appears in terminal 3, switch to the `movr` database, and verify that the current gateway node is in a different region (`us-west1`):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    USE movr;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT gateway_region();
    ~~~

    ~~~
      gateway_region
    ------------------
      us-west1
    (1 row)
    ~~~

1. Still in terminal 3, update a row in the `vehicles` table that is homed in the `us-east1` region. After the update, it should be homed in the current gateway node's home region, `us-west1`.

   1. First, pick a row at random from the `us-east1` region:

           {% include_cached copy-clipboard.html %}
           ~~~ sql
           select * from vehicles where region = 'us-east1' limit 1;
           ~~~

           ~~~
                              id                  |  city  | type |               owner_id               |       creation_time        |  status   |       current_location       |                    ext                     |  region
           ---------------------------------------+--------+------+--------------------------------------+----------------------------+-----------+------------------------------+--------------------------------------------+-----------
             3e127e68-a3f9-487d-aa56-bf705beca05a | boston | bike | 2f057d6b-ba8d-4f56-8fd9-894b7c082713 | 2021-10-28 16:19:22.309834 | available | 039 Stacey Plain             | {"brand": "FujiCervelo", "color": "green"} | us-east1
                                                  |        |      |                                      |                            |           | Lake Brittanymouth, LA 09374 |                                            |
           (1 row)
           ~~~

   1. Next, update that row's `city` and `current_location` to addresses in Seattle, WA (USA). Note that this UUID is different than what you will see in your cluster, so you'll have to update the query accordingly.

           {% include_cached copy-clipboard.html %}
           ~~~ sql
           UPDATE vehicles set (city, current_location) = ('seattle', '2604 1st Ave, Seattle, WA 98121-1305') WHERE id = '3e127e68-a3f9-487d-aa56-bf705beca05a';
           ~~~

           ~~~
           UPDATE 1
           ~~~

   1. Finally, verify that the row has been auto-rehomed in this gateway's region by running the following statement and checking that the `region` column is now `us-west1`:

           {% include_cached copy-clipboard.html %}
           ~~~ sql
           SELECT * FROM vehicles WHERE id = '3e127e68-a3f9-487d-aa56-bf705beca05a';
           ~~~

           ~~~
                              id                  |  city   | type |               owner_id               |       creation_time        |  status   |           current_location           |                    ext                     |  region
           ---------------------------------------+---------+------+--------------------------------------+----------------------------+-----------+--------------------------------------+--------------------------------------------+-----------
             3e127e68-a3f9-487d-aa56-bf705beca05a | seattle | bike | 2f057d6b-ba8d-4f56-8fd9-894b7c082713 | 2021-10-28 16:19:22.309834 | available | 2604 1st Ave, Seattle, WA 98121-1305 | {"brand": "FujiCervelo", "color": "green"} | us-west1
           (1 row)
           ~~~

<a name="global"></a>

#### Set the table locality to `GLOBAL`

To optimize read access to the data in a table from any region (that is, globally), use the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE {table} SET LOCALITY GLOBAL;
~~~

~~~
ALTER TABLE SET LOCALITY
~~~

For more information about how this table locality works, see [Global tables](multiregion-overview.html#global-tables).

### Set table schema

{% include {{page.version.version}}/sql/movr-statements.md %}

#### Change the schema of a table

Suppose you want to add the `promo_codes` table to a new schema called `cockroach_labs`.

By default, [unqualified tables](sql-name-resolution.html#lookup-with-unqualified-names) created in the database belong to the `public` schema:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
  schema_name |         table_name         | type  | estimated_row_count
--------------+----------------------------+-------+----------------------
  public      | promo_codes                | table |                1000
  public      | rides                      | table |                 500
  public      | user_promo_codes           | table |                   0
  public      | users                      | table |                  50
  public      | vehicle_location_histories | table |                1000
  public      | vehicles                   | table |                  15
(6 rows)
~~~

If the new schema does not already exist, [create it](create-schema.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA IF NOT EXISTS cockroach_labs;
~~~

Then, change the table's schema:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE promo_codes SET SCHEMA cockroach_labs;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
   schema_name   |         table_name         | type  | estimated_row_count
-----------------+----------------------------+-------+----------------------
  cockroach_labs | promo_codes                | table |                1000
  public         | rides                      | table |                 500
  public         | user_promo_codes           | table |                   0
  public         | users                      | table |                  50
  public         | vehicle_location_histories | table |                1000
  public         | vehicles                   | table |                  15
(6 rows)
~~~

### Split and unsplit tables

{% include {{page.version.version}}/sql/movr-statements-geo-partitioned-replicas.md %}

#### Split a table

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW RANGES FROM TABLE users;
~~~

~~~
                                     start_key                                     |                                     end_key                                      | range_id | range_size_mb | lease_holder |  lease_holder_locality   | replicas |                             replica_localities
-----------------------------------------------------------------------------------+----------------------------------------------------------------------------------+----------+---------------+--------------+--------------------------+----------+-----------------------------------------------------------------------------
  NULL                                                                             | /"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |       37 |      0.000116 |            1 | region=us-east1,az=b     | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}
  /"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | /"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"                            |       46 |      0.000886 |            8 | region=europe-west1,az=c | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}
  /"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"                            | /"los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"   |       45 |       0.00046 |            8 | region=europe-west1,az=c | {2,4,8}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=c"}
  /"los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"   | /"new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"      |       44 |      0.001015 |            8 | region=europe-west1,az=c | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}
  /"new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"      | /"paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("            |       77 |      0.000214 |            8 | region=europe-west1,az=c | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}
  /"paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("            | /"san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19" |       43 |      0.001299 |            8 | region=europe-west1,az=c | {3,4,8}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=c"}
  /"san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19" | /"seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"                         |       61 |      0.000669 |            3 | region=us-east1,az=d     | {3,4,8}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=c"}
  /"seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"                         | /"washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"    |       57 |      0.000671 |            3 | region=us-east1,az=d     | {3,4,7}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=b"}
  /"washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"    | NULL                                                                             |       87 |      0.000231 |            4 | region=us-west1,az=a     | {3,4,7}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=b"}
(9 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users SPLIT AT VALUES ('chicago'), ('new york'), ('seattle');
~~~

~~~
              key              |   pretty    |        split_enforced_until
-------------------------------+-------------+--------------------------------------
  \275\211\022chicago\000\001  | /"chicago"  | 2262-04-11 23:47:16.854776+00:00:00
  \275\211\022new york\000\001 | /"new york" | 2262-04-11 23:47:16.854776+00:00:00
  \275\211\022seattle\000\001  | /"seattle"  | 2262-04-11 23:47:16.854776+00:00:00
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW RANGES FROM TABLE users;
~~~

~~~
                                     start_key                                     |                                     end_key                                      | range_id | range_size_mb | lease_holder |  lease_holder_locality   | replicas |                                 replica_localities
-----------------------------------------------------------------------------------+----------------------------------------------------------------------------------+----------+---------------+--------------+--------------------------+----------+-------------------------------------------------------------------------------------
  NULL                                                                             | /"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |       37 |      0.000116 |            1 | region=us-east1,az=b     | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}
  /"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | /"amsterdam"/PrefixEnd                                                           |       46 |      0.000446 |            8 | region=europe-west1,az=c | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}
  /"amsterdam"/PrefixEnd                                                           | /"boston"                                                                        |       70 |             0 |            8 | region=europe-west1,az=c | {3,6,8}  | {"region=us-east1,az=d","region=us-west1,az=c","region=europe-west1,az=c"}
  /"boston"                                                                        | /"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"                            |       71 |       0.00044 |            1 | region=us-east1,az=b     | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}
  /"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"                            | /"boston"/PrefixEnd                                                              |       45 |      0.000225 |            2 | region=us-east1,az=c     | {2,3,8}  | {"region=us-east1,az=c","region=us-east1,az=d","region=europe-west1,az=c"}
  /"boston"/PrefixEnd                                                              | /"chicago"                                                                       |       72 |             0 |            8 | region=europe-west1,az=c | {2,4,8}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=c"}
  /"chicago"                                                                       | /"los angeles"                                                                   |       74 |             0 |            8 | region=europe-west1,az=c | {2,4,8}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=c"}
  /"los angeles"                                                                   | /"los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"   |       73 |      0.000235 |            8 | region=europe-west1,az=c | {2,4,8}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=c"}
  /"los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"   | /"los angeles"/PrefixEnd                                                         |       44 |      0.000462 |            4 | region=us-west1,az=a     | {4,6,8}  | {"region=us-west1,az=a","region=us-west1,az=c","region=europe-west1,az=c"}
  /"los angeles"/PrefixEnd                                                         | /"new york"                                                                      |       68 |             0 |            8 | region=europe-west1,az=c | {2,6,8}  | {"region=us-east1,az=c","region=us-west1,az=c","region=europe-west1,az=c"}
  /"new york"                                                                      | /"new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"      |       69 |      0.000553 |            8 | region=europe-west1,az=c | {1,3,8}  | {"region=us-east1,az=b","region=us-east1,az=d","region=europe-west1,az=c"}
  /"new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"      | /"new york"/PrefixEnd                                                            |       77 |      0.000111 |            1 | region=us-east1,az=b     | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}
  /"new york"/PrefixEnd                                                            | /"paris"                                                                         |       62 |             0 |            8 | region=europe-west1,az=c | {3,4,8}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=c"}
  /"paris"                                                                         | /"paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("            |       63 |      0.000103 |            8 | region=europe-west1,az=c | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}
  /"paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("            | /"paris"/PrefixEnd                                                               |       43 |      0.000525 |            8 | region=europe-west1,az=c | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}
  /"paris"/PrefixEnd                                                               | /"rome"                                                                          |       64 |             0 |            8 | region=europe-west1,az=c | {3,4,8}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=c"}
  /"rome"                                                                          | /"rome"/PrefixEnd                                                                |       65 |      0.000539 |            8 | region=europe-west1,az=c | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}
  /"rome"/PrefixEnd                                                                | /"san francisco"                                                                 |       66 |             0 |            8 | region=europe-west1,az=c | {3,4,8}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=c"}
  /"san francisco"                                                                 | /"san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19" |       67 |      0.000235 |            4 | region=us-west1,az=a     | {4,5,8}  | {"region=us-west1,az=a","region=us-west1,az=b","region=europe-west1,az=c"}
  /"san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19" | /"san francisco"/PrefixEnd                                                       |       61 |      0.000365 |            4 | region=us-west1,az=a     | {4,5,6}  | {"region=us-west1,az=a","region=us-west1,az=b","region=us-west1,az=c"}
  /"san francisco"/PrefixEnd                                                       | /"seattle"                                                                       |       88 |             0 |            3 | region=us-east1,az=d     | {3,4,8}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=c"}
  /"seattle"                                                                       | /"seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"                         |       89 |      0.000304 |            3 | region=us-east1,az=d     | {3,4,8}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=c"}
  /"seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"                         | /"seattle"/PrefixEnd                                                             |       57 |      0.000327 |            3 | region=us-east1,az=d     | {3,4,7}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=b"}
  /"seattle"/PrefixEnd                                                             | /"washington dc"                                                                 |       90 |             0 |            3 | region=us-east1,az=d     | {3,4,7}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=b"}
  /"washington dc"                                                                 | /"washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"    |       91 |      0.000344 |            3 | region=us-east1,az=d     | {1,2,3}  | {"region=us-east1,az=b","region=us-east1,az=c","region=us-east1,az=d"}
  /"washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"    | /"washington dc"/PrefixEnd                                                       |       87 |      0.000231 |            3 | region=us-east1,az=d     | {1,2,3}  | {"region=us-east1,az=b","region=us-east1,az=c","region=us-east1,az=d"}
  /"washington dc"/PrefixEnd                                                       | NULL                                                                             |      157 |             0 |            4 | region=us-west1,az=a     | {3,4,7}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=b"}
(27 rows)
~~~

#### Split a table with a compound primary key

You may want to split a table with a compound primary key.

Suppose that you want MovR to offer ride-sharing services, in addition to vehicle-sharing services. Some users need to sign up to be drivers, so you need a `drivers` table to store driver information.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE drivers (
    id UUID DEFAULT gen_random_uuid(),
    city STRING,
    name STRING,
    dl STRING DEFAULT left(md5(random()::text),8) UNIQUE CHECK (LENGTH(dl) < 9),
    address STRING,
    CONSTRAINT "primary" PRIMARY KEY (city ASC, dl ASC)
);
~~~

The table's compound primary key is on the `city` and `dl` columns. Note that the table automatically generates an `id` and a `dl` value [using supported SQL functions](functions-and-operators.html) if they are not provided.

Because this table has several columns in common with the `users` table, you can populate the table with values from the `users` table with an `INSERT` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO drivers (id, city, name, address)
    SELECT id, city, name, address FROM users;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW RANGES FROM TABLE drivers;
~~~

~~~
  start_key | end_key | range_id | range_size_mb | lease_holder |  lease_holder_locality   | replicas |                             replica_localities
------------+---------+----------+---------------+--------------+--------------------------+----------+-----------------------------------------------------------------------------
  NULL      | NULL    |      310 |      0.007218 |            7 | region=europe-west1,az=b | {1,4,7}  | {"region=us-east1,az=b","region=us-west1,az=a","region=europe-west1,az=b"}
(1 row)
~~~

Now you can split the table based on the compound primary key. Note that you do not have to specify the entire value for the primary key, just the prefix.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE drivers SPLIT AT VALUES ('new york', '3'), ('new york', '7'), ('chicago', '3'), ('chicago', '7'), ('seattle', '3'), ('seattle', '7');
~~~

~~~
                     key                    |     pretty      |        split_enforced_until
--------------------------------------------+-----------------+--------------------------------------
  \303\211\022new york\000\001\0223\000\001 | /"new york"/"3" | 2262-04-11 23:47:16.854776+00:00:00
  \303\211\022new york\000\001\0227\000\001 | /"new york"/"7" | 2262-04-11 23:47:16.854776+00:00:00
  \303\211\022chicago\000\001\0223\000\001  | /"chicago"/"3"  | 2262-04-11 23:47:16.854776+00:00:00
  \303\211\022chicago\000\001\0227\000\001  | /"chicago"/"7"  | 2262-04-11 23:47:16.854776+00:00:00
  \303\211\022seattle\000\001\0223\000\001  | /"seattle"/"3"  | 2262-04-11 23:47:16.854776+00:00:00
  \303\211\022seattle\000\001\0227\000\001  | /"seattle"/"7"  | 2262-04-11 23:47:16.854776+00:00:00
(6 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW RANGES FROM TABLE drivers;
~~~

~~~
     start_key    |     end_key     | range_id | range_size_mb | lease_holder |  lease_holder_locality   | replicas |                             replica_localities
------------------+-----------------+----------+---------------+--------------+--------------------------+----------+-----------------------------------------------------------------------------
  NULL            | /"chicago"/"3"  |      310 |      0.001117 |            7 | region=europe-west1,az=b | {3,4,7}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=b"}
  /"chicago"/"3"  | /"chicago"/"7"  |      314 |             0 |            7 | region=europe-west1,az=b | {3,4,7}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=b"}
  /"chicago"/"7"  | /"new york"/"3" |      315 |      0.000933 |            7 | region=europe-west1,az=b | {3,4,7}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=b"}
  /"new york"/"3" | /"new york"/"7" |      311 |             0 |            7 | region=europe-west1,az=b | {1,4,7}  | {"region=us-east1,az=b","region=us-west1,az=a","region=europe-west1,az=b"}
  /"new york"/"7" | /"seattle"/"3"  |      312 |      0.001905 |            7 | region=europe-west1,az=b | {1,4,7}  | {"region=us-east1,az=b","region=us-west1,az=a","region=europe-west1,az=b"}
  /"seattle"/"3"  | /"seattle"/"7"  |      316 |      0.000193 |            7 | region=europe-west1,az=b | {1,6,7}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=b"}
  /"seattle"/"7"  | NULL            |      317 |       0.00307 |            7 | region=europe-west1,az=b | {1,4,7}  | {"region=us-east1,az=b","region=us-west1,az=a","region=europe-west1,az=b"}
(7 rows)
~~~

#### Set the expiration on a split enforcement

You can specify the time at which a split enforcement expires by adding a `WITH EXPIRATION` clause to your `SPLIT` statement. Supported expiration values include [`DECIMAL`](decimal.html), [`INTERVAL`](interval.html), [`TIMESTAMP`](timestamp.html), and [`TIMESTAMPZ`](timestamp.html).

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE vehicles SPLIT AT VALUES ('chicago'), ('new york'), ('seattle') WITH EXPIRATION '2022-01-10 23:30:00+00:00';
~~~
~~~
              key              |   pretty    |     split_enforced_until
-------------------------------+-------------+-------------------------------
  \276\211\022chicago\000\001  | /"chicago"  | 2022-01-10 23:30:00+00:00:00
  \276\211\022new york\000\001 | /"new york" | 2022-01-10 23:30:00+00:00:00
  \276\211\022seattle\000\001  | /"seattle"  | 2022-01-10 23:30:00+00:00:00
(3 rows)
~~~

You can see the split's expiration date in the `split_enforced_until` column. The [`crdb_internal.ranges`](crdb-internal.html) table also contains information about ranges in your CockroachDB cluster, including the `split_enforced_until` column.

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT range_id, start_pretty, end_pretty, split_enforced_until FROM crdb_internal.ranges WHERE table_name='vehicles';
~~~

~~~
  range_id |                                       start_pretty                                        |                                        end_pretty                                         |        split_enforced_until
-----------+-------------------------------------------------------------------------------------------+-------------------------------------------------------------------------------------------+--------------------------------------
        38 | /Table/54                                                                                 | /Table/54/1/"amsterdam"                                                                   | NULL
        55 | /Table/54/1/"amsterdam"                                                                   | /Table/54/1/"amsterdam"/PrefixEnd                                                         | NULL
       109 | /Table/54/1/"amsterdam"/PrefixEnd                                                         | /Table/54/1/"boston"                                                                      | NULL
       114 | /Table/54/1/"boston"                                                                      | /Table/54/1/"boston"/"\"\"\"\"\"\"B\x00\x80\x00\x00\x00\x00\x00\x00\x02"                  | NULL
        50 | /Table/54/1/"boston"/"\"\"\"\"\"\"B\x00\x80\x00\x00\x00\x00\x00\x00\x02"                  | /Table/54/1/"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\x03"                        | 2262-04-11 23:47:16.854776+00:00:00
        49 | /Table/54/1/"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\x03"                        | /Table/54/1/"boston"/PrefixEnd                                                            | 2262-04-11 23:47:16.854776+00:00:00
       129 | /Table/54/1/"boston"/PrefixEnd                                                            | /Table/54/1/"chicago"                                                                     | NULL
       241 | /Table/54/1/"chicago"                                                                     | /Table/54/1/"los angeles"                                                                 | 2022-01-10 23:30:00+00:00:00
       130 | /Table/54/1/"los angeles"                                                                 | /Table/54/1/"los angeles"/PrefixEnd                                                       | NULL
       131 | /Table/54/1/"los angeles"/PrefixEnd                                                       | /Table/54/1/"new york"                                                                    | NULL
       132 | /Table/54/1/"new york"                                                                    | /Table/54/1/"new york"/"\x11\x11\x11\x11\x11\x11A\x00\x80\x00\x00\x00\x00\x00\x00\x01"    | 2022-01-10 23:30:00+00:00:00
        48 | /Table/54/1/"new york"/"\x11\x11\x11\x11\x11\x11A\x00\x80\x00\x00\x00\x00\x00\x00\x01"    | /Table/54/1/"new york"/PrefixEnd                                                          | 2262-04-11 23:47:16.854776+00:00:00
...
(46 rows)
~~~

#### Unsplit a table

Create a `drivers` table and split the table based on the compound primary key as described in [Split a table with a compound primary key](#split-a-table-with-a-compound-primary-key).

To remove the split enforcements, run the following:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE drivers UNSPLIT AT VALUES ('new york', '3'), ('new york', '7'), ('chicago', '3'), ('chicago', '7'), ('seattle', '3'), ('seattle', '7');
~~~

~~~
                     key                    |           pretty
--------------------------------------------+-----------------------------
  \xc3\x89\x12new york\x00\x01\x123\x00\x01 | /Table/59/1/"new york"/"3"
  \xc3\x89\x12new york\x00\x01\x127\x00\x01 | /Table/59/1/"new york"/"7"
  \xc3\x89\x12chicago\x00\x01\x123\x00\x01  | /Table/59/1/"chicago"/"3"
  \xc3\x89\x12chicago\x00\x01\x127\x00\x01  | /Table/59/1/"chicago"/"7"
  \xc3\x89\x12seattle\x00\x01\x123\x00\x01  | /Table/59/1/"seattle"/"3"
  \xc3\x89\x12seattle\x00\x01\x127\x00\x01  | /Table/59/1/"seattle"/"7"
(6 rows)
~~~

You can see the split's expiration date in the `split_enforced_until` column. The [`crdb_internal.ranges`](crdb-internal.html) table also contains information about ranges in your CockroachDB cluster, including the `split_enforced_until` column.

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT range_id, start_pretty, end_pretty, split_enforced_until FROM crdb_internal.ranges WHERE table_name='drivers';
~~~

~~~
  range_id |        start_pretty        |         end_pretty         | split_enforced_until
-----------+----------------------------+----------------------------+-----------------------
        74 | /Table/59                  | /Table/59/1/"chicago"/"3"  | NULL
        77 | /Table/59/1/"chicago"/"3"  | /Table/59/1/"chicago"/"7"  | NULL
        78 | /Table/59/1/"chicago"/"7"  | /Table/59/1/"new york"/"3" | NULL
        75 | /Table/59/1/"new york"/"3" | /Table/59/1/"new york"/"7" | NULL
        76 | /Table/59/1/"new york"/"7" | /Table/59/1/"seattle"/"3"  | NULL
        79 | /Table/59/1/"seattle"/"3"  | /Table/59/1/"seattle"/"7"  | NULL
        80 | /Table/59/1/"seattle"/"7"  | /Max                       | NULL
(7 rows)

~~~

The `drivers` table is still split into ranges at specific primary key column values, but the `split_enforced_until` column is now `NULL` for all ranges in the table. The split is no longer enforced, and CockroachDB can [merge the data](architecture/distribution-layer.html#range-merges) in the table as needed.

### Validate constraints

{% include {{page.version.version}}/sql/movr-statements.md %}

#### Validate a constraint

In the example [Add the foreign key constraint with `CASCADE`](#add-the-foreign-key-constraint-with-cascade), we add a foreign key constraint as follows:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE vehicles ADD CONSTRAINT users_fk FOREIGN KEY (city, owner_id) REFERENCES users (city, id) ON DELETE CASCADE;
~~~

To ensure that the data added to the `vehicles` table prior to the creation of the `users_fk` constraint conforms to that constraint, run the following:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE vehicles VALIDATE CONSTRAINT users_fk;
~~~

{{site.data.alerts.callout_info}}
If present in a [`CREATE TABLE`](create-table.html) statement, the table is considered validated because an empty table trivially meets its constraints.
{{site.data.alerts.end}}

## See also

- [Multi-Region Capabilities Overview](multiregion-overview.html)
- [Online Schema Changes](online-schema-changes.html)
- [Constraints](constraints.html)
- [Foreign Key Constraint](foreign-key.html)
- [Configure Replication Zones](configure-replication-zones.html)
- [SQL Audit Logging](sql-audit-logging.html)
- [`CREATE TABLE`](create-table.html)
- [`CREATE INDEX`](create-index.html)
- [`ALTER INDEX`](alter-index.html)
- [`ALTER PARTITION`](alter-partition.html)
- [`SHOW JOBS`](show-jobs.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`WITH` (storage parameter)](with-storage-parameter.html)
- [Selection Queries](selection-queries.html)
- [Distribution Layer](architecture/distribution-layer.html)
- [Replication Layer](architecture/replication-layer.html)
- [Online Schema Changes](online-schema-changes.html)
- [SQL Statements](sql-statements.html)
