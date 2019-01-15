---
title: Information Schema
summary: The information_schema database contains read-only views that you can use for introspection into your database's tables, columns, indexes, and views.
toc: true
---

CockroachDB represents your cluster's schema in a database called `information_schema`, which contains read-only [views](views.html) that you can use for introspection into your database's tables, columns, indexes, and views.

This notion of an information schema is part of the SQL standard, which means it is portable and will remain stable. This contrasts with other objects like `pg_catalog`, which is not part of the SQL standard and handles specific implementation issues.

{{site.data.alerts.callout_info}}The <code>information_schema</code> views typically represent objects that the current user has privilege to access. To ensure you can view your cluster's entire schema, access it as the <code>root</code> user.{{site.data.alerts.end}}


## Objects

To perform introspection on objects, you can either read from the related `information_schema` view or use one of CockroachDB's `SHOW` statements.

Object | Information Schema View| SHOW .
-------|--------------|--------
Columns | [columns](#columns)| [`SHOW COLUMNS`](show-columns.html)
Constraints | [key_column_usage](#key_column_usage), [table_constraints](#table_constraints)| [`SHOW CONSTRAINTS`](show-constraints.html)
Databases | [schemata](#schemata)| [`SHOW DATABASE`](show-vars.html)
Indexes | [statistics](#statistics)| [`SHOW INDEX`](show-index.html)
Privileges | [schema_privileges](#schema_privileges), [table_privileges](#table_privileges)| [`SHOW GRANTS`](show-grants.html)
Tables | [tables](#tables)| [`SHOW TABLES`](show-tables.html)
Views | [tables](#tables), [views](#views)| [`SHOW CREATE VIEW`](show-create-view.html)

## Views

The `information_schema` database is comprised of many views representing your cluster's schema, each of which is detailed below.

### columns

The `columns` view contains information about the columns in each table.

Column | Description
-------|-----------
`TABLE_CATALOG` | Always equal to `def` (CockroachDB does not support the notion of catalogs).
`TABLE_SCHEMA` | Name of the database containing the table.
`TABLE_NAME` | Name of the table.
`COLUMN_NAME` | Name of the column.
`ORDINAL_POSITION` | Ordinal position of the column in the table (begins at 1).
`COLUMN_DEFAULT` | Default Value for the column.
`IS_NULLABLE` | `YES` if the column accepts *NULL* values; `NO` if it doesn't (e.g., it has the [Not Null constraint](not-null.html)).
`DATA_TYPE` | [Data type](data-types.html) of the column.
`CHARACTER_MAXIMUM_LENGTH` |  If `DATA_TYPE` is `STRING`, the maximum length in characters of a value; otherwise *NULL*.
`CHARACTER_OCTET_LENGTH` | If `DATA_TYPE` is `STRING`, the maximum length in octets (bytes) of a value; otherwise *NULL*.
`NUMERIC_PRECISION` | If `DATA_TYPE` is numeric, the declared or implicit precision (i.e., number of significant digits); otherwise *NULL*.
`NUMERIC_SCALE` | If `DATA_TYPE` is an exact numeric type, the scale (i.e., number of digits to the right of the decimal point); otherwise *NULL*.
`DATETIME_PRECISION` | Always *NULL* (unsupported by CockroachDB).

### key_column_usage

The `key_column_usage` view identifies columns with [Primary Key](primary-key.html), [Unique](unique.html), or [Foreign Key](foreign-key.html) constraints.

Column | Description
-------|-----------
`CONSTRAINT_CATALOG` | Always equal to `def` (CockroachDB does not support the notion of catalogs).
`CONSTRAINT_SCHEMA` | Name of the database containing the constraint.
`CONSTRAINT_NAME` | Name of the constraint.
`TABLE_CATALOG` | Always equal to `def` (CockroachDB does not support the notion of catalogs).
`TABLE_SCHEMA` | Name of the database that contains the constrained table.
`TABLE_NAME` | Name of the constrained table.
`COLUMN_NAME` | Name of the constrained column.
`ORDINAL_POSITION` | Ordinal position of the column within the constraint (begins at 1).
`POSITION_IN_UNIQUE_CONSTRAINT` | For Foreign Key constraints, ordinal position of the referenced column within its Unique constraint (begins at 1).

### schema_privileges

The `schema_privileges` view identifies which [privileges](privileges.html) have been granted to each user at the database level.

Column | Description
-------|-----------
`GRANTEE` | Username of user with grant.
`TABLE_CATALOG` | Always equal to `def` (CockroachDB does not support the notion of catalogs).
`TABLE_SCHEMA` | Name of the database that contains the constrained table.
`PRIVILEGE_TYPE` | Name of the [privilege](privileges.html).
`IS_GRANTABLE` | Always *NULL* (unsupported by CockroachDB).

### schemata

The `schemata` view identifies the cluster's databases.

Column | Description
-------|-----------
`TABLE_CATALOG` | Always equal to `def` (CockroachDB does not support the notion of catalogs).
`SCHEMA_NAME` | Name of the database.
`DEFAULT_CHARACTER_SET_NAME` |  Always *NULL* (unsupported by CockroachDB).
`SQL_PATH` |  Always *NULL* (unsupported by CockroachDB).

### statistics

The `statistics` view identifies table's [indexes](indexes.html).

Column | Description
-------|-----------
`TABLE_CATALOG` | Always equal to `def` (CockroachDB does not support the notion of catalogs).
`TABLE_SCHEMA` | Name of the database that contains the constrained table.
`TABLE_NAME` | Name of the table	 .
`NON_UNIQUE` | `false` if the index was created by a Unique constraint; `true` if the index was not created by a Unique constraint.
`INDEX_SCHEMA` | Name of the database that contains the index.
`INDEX_NAME` | Name of the index.
`SEQ_IN_INDEX` | Ordinal position of the column within the index (begins at 1).
`COLUMN_NAME` | Name of the column being indexed.
`COLLATION` | Always *NULL* (unsupported by CockroachDB).
`CARDINALITY` | Always *NULL* (unsupported by CockroachDB).
`DIRECTION` | `ASC` (ascending) or `DESC` (descending) order.
`STORING` | `true` if column is [stored](create-index.html#store-columns); `false` if it's indexed.

### table_constraints

The `table_constraints` view identifies [constraints](constraints.html) applied to tables.

Column | Description
-------|-----------
`CONSTRAINT_CATALOG` | Always equal to `def` (CockroachDB does not support the notion of catalogs).
`CONSTRAINT_SCHEMA` | Name of the database that contains the constraint.
`CONSTRAINT_NAME` | Name of the constraint.
`TABLE_SCHEMA` | Name of the database that contains the constrained table.
`TABLE_NAME` | Name of the constrained table.
`CONSTRAINT_TYPE` | Type of [constraint](constraints.html): `CHECK`, `FOREIGN KEY`, `PRIMARY KEY`, or `UNIQUE`.

### table_privileges

The `table_privileges` view identifies which [privileges](privileges.html) have been granted to each user at the table level.

Column | Description
-------|-----------
`GRANTOR` | Always *NULL* (unsupported by CockroachDB).
`GRANTEE` | Username of user with grant.
`TABLE_CATALOG` | Always equal to `def` (CockroachDB does not support the notion of catalogs).
`TABLE_SCHEMA` | Name of the database that the grant applies to.
`TABLE_NAME` | Name of the table that the grant applies to.
`PRIVILEGE_TYPE` | Type of [privilege](privileges.html): `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `REFERENCES`, or `TRIGGER`.
`IS_GRANTABLE` | Always *NULL* (unsupported by CockroachDB).
`WITH_HIERARCHY` | Always *NULL* (unsupported by CockroachDB).

### tables

The `tables` view identifies tables and views in the cluster.

Column | Description
-------|-----------
`TABLE_CATALOG` | Always equal to `def` (CockroachDB does not support the notion of catalogs).
`TABLE_SCHEMA` | Name of the database that contains the table.
`TABLE_NAME` | Name of the table.
`TABLE_TYPE` | Type of the table: `BASE TABLE` for a normal table, `VIEW` for a view, or `SYSTEM VIEW` for a view created by CockroachDB.
`VERSION` | Version number of the table; versions begin at 1 and are incremented each time an `ALTER TABLE` statement is issued on the table.

### user_privileges <div class="version-tag">New in v1.1</div>

The `user_privileges` view identifies global [privileges](privileges.html).

{{site.data.alerts.callout_info}}Currently, CockroachDB does not support global privileges for non-<code>root</code> users. Therefore, this view contains global privileges only for <code>root</code>.
{{site.data.alerts.end}}

Column | Description
-------|-----------
`GRANTEE` | Username of user with grant.
`TABLE_CATALOG` | Always equal to `def` (CockroachDB does not support the notion of catalogs).
`PRIVELEGE_TYPE` | Type of [privilege](privileges.html).
`IS_GRANTABLE` | Always *NULL* (unsupported by CockroachDB).

### views

The `views` view identifies [views](views.html) in the cluster.

Column | Description
-------|-----------
`TABLE_CATALOG` | Always equal to `def` (CockroachDB does not support the notion of catalogs).
`TABLE_SCHEMA` | Name of the database that the view reads from.
`TABLE_NAME` | Name of the table the view reads from.
`VIEW_DEFINITION` | `AS` clause used to [create the view](views.html#creating-views).
`CHECK_OPTION` | Always *NULL* (unsupported by CockroachDB).
`IS_UPDATABLE` | Always *NULL* (unsupported by CockroachDB).
`IS_INSERTABLE_INTO` | Always *NULL* (unsupported by CockroachDB).
`IS_TRIGGER_UPDATABLE` | Always *NULL* (unsupported by CockroachDB).
`IS_TRIGGER_DELETABLE` | Always *NULL* (unsupported by CockroachDB).
`IS_TRIGGER_INSERTABLE_INTO` | Always *NULL* (unsupported by CockroachDB).

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
