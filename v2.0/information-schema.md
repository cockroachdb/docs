---
title: Information Schema
summary: The information_schema database contains read-only views that you can use for introspection into your database's tables, columns, indexes, and views.
toc: false
---

CockroachDB provides a virtual schema called `information_schema` that contains information about your database's tables, columns, indexes, and views. This information can be used for introspection and reflection.

The definition of `information_schema` is part of the SQL standard and can therefore be relied on to remain stable over time. This contrasts with CockroachDB's `SHOW` statements, which provide similar data and are meant to be stable in CockroachDB but not standardized. It also contrasts with the virtual schema `crdb_internal`, which reflects the internals of CockroachDB and may thus change across CockroachDB versions.

{{site.data.alerts.callout_info}}The <code>information_schema</code> views typically represent objects that the current user has privilege to access. To ensure you can view all the objects in a database, access it as the <code>root</code> user.{{site.data.alerts.end}}

<div id="toc"></div>

## Data Exposed by information_schema

To perform introspection on objects, you can either read from the related `information_schema` table or use one of CockroachDB's `SHOW` statements.

Object | Information Schema Table | Corresponding `SHOW` Statement
-------|--------------|--------
Columns | [`columns`](#columns)| [`SHOW COLUMNS`](show-columns.html)
Constraints | [`key_column_usage`](#key_column_usage), [`referential_constraints`](#referential_constraints), [`table_constraints`](#table_constraints)| [`SHOW CONSTRAINTS`](show-constraints.html)
Databases | [`schemata`](#schemata)| [`SHOW DATABASE`](show-vars.html)
Indexes | [`statistics`](#statistics)| [`SHOW INDEX`](show-index.html)
Privileges | [`schema_privileges`](#schema_privileges), [`table_privileges`](#table_privileges)| [`SHOW GRANTS`](show-grants.html)
Tables | [`tables`](#tables)| [`SHOW TABLES`](show-tables.html)
Views | [`tables`](#tables), [`views`](#views)| [`SHOW CREATE VIEW`](show-create-view.html)

## Tables in information_schema

The virtual schema `information_schema` contains virtual tables, also called "system views", representing the database's objects, each of which is detailed below.

These differ from regular [SQL views](views.html) in that they are
not showing data created from the content of other tables. Instead,
CockroachDB generates the data for virtual tables when they are accessed.

### administrable_role_authorizations

`administrable_role_authorizations` identifies all roles that the current user has the admin option for.

Column | Description
-------|-----------
`grantee` | The name of the user to which this role membership was granted (always the current user).

### applicable_roles

`applicable_roles` identifies all roles whose privileges the current user can use. This implies there is a chain of role grants from the current user to the role in question. The current user itself is also an applicable role, but is not listed.

Column | Description
-------|-----------
`grantee` | Name of the user to which this role membership was granted (always the current user).
`role_name` | Name of a role.
`is_grantable` | `YES` if the grantee has the admin option on the role; `NO` if not.

### columns

`columns` contains information about the columns in each table.

Column | Description
-------|-----------
`table_catalog` | Name of the database containing the table.
`table_schema` | Name of the schema containing the table.
`table_name` | Name of the table.
`column_name` | Name of the column.
`ordinal_position` | Ordinal position of the column in the table (begins at 1).
`column_default` | Default value for the column.
`is_nullable` | `YES` if the column accepts `NULL` values; `NO` if it doesn't (e.g., it has the [`NOT NULL` constraint](not-null.html)).
`data_type` | [Data type](data-types.html) of the column.
`character_maximum_length` |  If `data_type` is `STRING`, the maximum length in characters of a value; otherwise `NULL`.
`character_octet_length` | If `data_type` is `STRING`, the maximum length in octets (bytes) of a value; otherwise `NULL`.
`numeric_precision` | If `data_type` is numeric, the declared or implicit precision (i.e., number of significant digits); otherwise `NULL`.
`numeric_scale` | If `data_type` is an exact numeric type, the scale (i.e., number of digits to the right of the decimal point); otherwise `NULL`.
`datetime_precision` | Always `NULL` (unsupported by CockroachDB).
`character_set_catalog` | Always `NULL` (unsupported by CockroachDB).
`character_set_schema` | Always `NULL` (unsupported by CockroachDB).
`character_set_name` | Always `NULL` (unsupported by CockroachDB).
`generation_expression` | The expression used for computing the column value in a computed column.

### column_privileges

`column_privileges` identifies all privileges granted on columns to or by a currently enabled role. There is one row for each combination of `grantor`, `grantee`, and column (defined by `table_catalog`, `table_schema`, `table_name`, and `column_name`).

Column | Description
-------|-----------
`grantor` | Name of the role that granted the privilege.
`grantee` | Name of the role that was granted the privilege.
`table_catalog` | Name of the database containing the table that contains the column (always the current database).
`table_schema` | Name of the schema containing the table that contains the column.
`table_name` | Name of the table.
`column_name` | Name of the column.
`privilege_type` | Name of the [privilege](privileges.html).
`is_grantable` | Always `NULL` (unsupported by CockroachDB).

### enabled_roles

The `enabled_roles` view identifies enabled roles for the current user. This includes both direct and indirect roles.

Column | Description
-------|-----------
`role_name` | Name of a role.

### key_column_usage

`key_column_usage` identifies columns with [`PRIMARY KEY`](primary-key.html), [`UNIQUE`](unique.html), or [`FOREIGN KEY` / `REFERENCES`](foreign-key.html) constraints.

Column | Description
-------|-----------
`constraint_catalog` | Name of the database containing the constraint.
`constraint_schema` | Name of the schema containing the constraint.
`constraint_name` | Name of the constraint.
`table_catalog` | Name of the database containing the constrained table.
`table_schema` | Name of the schema containing the constrained table.
`table_name` | Name of the constrained table.
`column_name` | Name of the constrained column.
`ordinal_position` | Ordinal position of the column within the constraint (begins at 1).
`position_in_unique_constraint` | For foreign key constraints, ordinal position of the referenced column within its uniqueness constraint (begins at 1).

### referential_constraints

`referential_constraints` identifies all referential ([Foreign Key](foreign-key.html)) constraints.

Column | Description
-------|-----------
`constraint_catalog` | Name of the database containing the constraint.
`constraint_schema` | Name of the schema containing the constraint.
`constraint_name` | Name of the constraint.
`unique_constraint_catalog` | Name of the database containing the unique or primary key constraint that the foreign key constraint references (always the current database).
`unique_constraint_schema` | Name of the schema containing the unique or primary key constraint that the foreign key constraint references.
`unique_constraint_name` | Name of the unique or primary key constraint.
`match_option` | Match option of the foreign key constraint: `FULL`, `PARTIAL`, or `NONE`.
`update_rule` | Update rule of the foreign key constraint: `CASCADE`, `SET NULL`, `SET DEFAULT`, `RESTRICT`, or `NO ACTION`.
`delete_rule` | Delete rule of the foreign key constraint: `CASCADE`, `SET NULL`, `SET DEFAULT`, `RESTRICT`, or `NO ACTION`.
`table_name` | Name of the table containing the constraint.
`referenced_table_name` | Name of the table containing the unique or primary key constraint that the foreign key constraint references.

### role_table_grants

`role_table_grants` identifies which [privileges](privileges.html) have been granted on tables or views where the grantor
or grantee is a currently enabled role. This table is identical to [`table_privileges`](#table_privileges).

Column | Description
-------|-----------
`grantor` | Name of the role that granted the privilege.
`grantee` | Name of the role that was granted the privilege.
`table_catalog` | Name of the database containing the table.
`table_schema` | Name of the schema containing the table.
`table_name` | Name of the table.
`privilege_type` | Name of the [privilege](privileges.html).
`is_grantable` | Always `NULL` (unsupported by CockroachDB).
`with_hierarchy` | Always `NULL` (unsupported by CockroachDB).

### schema_privileges

`schema_privileges` identifies which [privileges](privileges.html) have been granted to each user at the database level.

Column | Description
-------|-----------
`grantee` | Username of user with grant.
`table_catalog` | Name of the database containing the constrained table.
`table_schema` | Name of the schema containing the constrained table.
`privilege_type` | Name of the [privilege](privileges.html).
`is_grantable` | Always `NULL` (unsupported by CockroachDB).

### schemata

`schemata` identifies the database's schemas.

Column | Description
-------|-----------
`table_catalog` | Name of the database.
`table_schema` | Name of the schema.
`default_character_set_name` |  Always `NULL` (unsupported by CockroachDB).
`sql_path` |  Always `NULL` (unsupported by CockroachDB).

### statistics

`statistics` identifies table [indexes](indexes.html).

Column | Description
-------|-----------
`table_catalog` | Name of the database that contains the constrained table.
`table_schema` | Name of the schema that contains the constrained table.
`table_name` | Name of the table.
`non_unique` | `NO` if the index was created with the `UNIQUE` constraint; `YES` if the index was not created with `UNIQUE`.
`index_schema` | Name of the database that contains the index.
`index_name` | Name of the index.
`seq_in_index` | Ordinal position of the column within the index (begins at 1).
`column_name` | Name of the column being indexed.
`collation` | Always `NULL` (unsupported by CockroachDB).
`cardinality` | Always `NULL` (unsupported by CockroachDB).
`direction` | `ASC` (ascending) or `DESC` (descending) order.
`storing` | `YES` if column is [stored](create-index.html#store-columns); `NO` if it's indexed or implicit.
`implicit` | `YES` if column is implicit (i.e., it is not specified in the index and not stored); `NO` if it's indexed or stored.

### table_constraints

`table_constraints` identifies [constraints](constraints.html) applied to tables.

Column | Description
-------|-----------
`constraint_catalog` | Name of the database containing the constraint.
`constraint_schema` | Name of the schema containing the constraint.
`constraint_name` | Name of the constraint.
`table_catalog` | Name of the database containing the constrained table.
`table_schema` | Name of the schema containing the constrained table.
`table_name` | Name of the constrained table.
`constraint_type` | Type of [constraint](constraints.html): `CHECK`, `FOREIGN KEY`, `PRIMARY KEY`, or `UNIQUE`.
`is_deferrable` | `YES` if the constraint can be deferred; `NO` if not.
`initially_deferred` | `YES` if the constraint is deferrable and initially deferred; `NO` if not.

### table_privileges

`table_privileges`  identifies which [privileges](privileges.html) have been granted to each user at the table level.

Column | Description
-------|-----------
`grantor` | Always `NULL` (unsupported by CockroachDB).
`grantee` | Username of user with grant.
`table_catalog` | Name of the database that the grant applies to.
`table_schema` | Name of the schema that the grant applies to.
`table_name` | Name of the table that the grant applies to.
`privilege_type` | Type of [privilege](privileges.html): `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `REFERENCES`, or `TRIGGER`.
`is_grantable` | Always `NULL` (unsupported by CockroachDB).
`with_hierarchy` | Always `NULL` (unsupported by CockroachDB).

### tables

`tables` identifies tables and views in the database.

Column | Description
-------|-----------
`table_catalog` | Name of the database that contains the table.
`table_schema` | Name of the schema that contains the table.
`table_name` | Name of the table.
`table_type` | Type of the table: `BASE TABLE` for a normal table, `VIEW` for a view, or `SYSTEM VIEW` for a view created by CockroachDB.
`version` | Version number of the table; versions begin at 1 and are incremented each time an `ALTER TABLE` statement is issued on the table.

### user_privileges

`user_privileges` identifies global [privileges](privileges.html).

{{site.data.alerts.callout_info}}Currently, CockroachDB does not support global privileges for non-<code>root</code> users. Therefore, this view contains global privileges only for <code>root</code>.
{{site.data.alerts.end}}

Column | Description
-------|-----------
`grantee` | Username of user with grant.
`table_catalog` | Name of the database that the privilege applies to.
`privelege_type` | Type of [privilege](privileges.html).
`is_grantable` | Always `NULL` (unsupported by CockroachDB).

### views

`views` identifies [views](views.html) in the database.

Column | Description
-------|-----------
`table_catalog` | Name of the database that contains the view.
`table_schema` | Name of the schema that contains the view.
`table_name` | Name of the view.
`view_definition` | `AS` clause used to [create the view](views.html#creating-views).
`check_option` | Always `NULL` (unsupported by CockroachDB).
`is_updatable` | Always `NULL` (unsupported by CockroachDB).
`is_insertable_into` | Always `NULL` (unsupported by CockroachDB).
`is_trigger_updatable` | Always `NULL` (unsupported by CockroachDB).
`is_trigger_deletable` | Always `NULL` (unsupported by CockroachDB).
`is_trigger_insertable_into` | Always `NULL` (unsupported by CockroachDB).

## See Also

- [`SHOW`](show-vars.html)
- [`SHOW COLUMNS`](show-columns.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`SHOW CREATE TABLE`](show-create-table.html)
- [`SHOW CREATE VIEW`](show-create-view.html)
- [`SHOW DATABASES`](show-databases.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW INDEX`](show-index.html)
- [`SHOW TABLES`](show-tables.html)
