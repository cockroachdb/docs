---
title: Information Schema
summary: The information_schema database contains read-only views that you can use for introspection into your database's tables, columns, indexes, and views.
toc: false
---

CockroachDB represents your cluster's schema in a database called `information_schema`, which contains read-only [views](views.html) that you can use for introspection into your database's tables, columns, indexes, and views.

This notion of an information schema is part of the SQL standard, which means it is portable and will remain stable. This contrasts with other objects like `pg_catalog`, which is not part of the SQL standard and handles specific implementation issues.

{{site.data.alerts.callout_info}}The <code>information_schema</code> views typically represent objects that the current user has privilege to access. To ensure you can view your cluster's entire schema, access it as the <code>root</code> user.{{site.data.alerts.end}}

<div id="toc"></div>

## Objects

To perform introspection on objects, you can either read from the related `information_schema` view or use one of CockroachDB's `SHOW` statements.

Object | Information Schema View| SHOW .
-------|--------------|--------
Columns | [columns](#columns)| [`SHOW COLUMNS`](show-columns.html)
Constraints | [key_column_usage](#key_column_usage), [referential_constraints](#referential_constraints), [table_constraints](#table_constraints)| [`SHOW CONSTRAINTS`](show-constraints.html)
Databases | [schemata](#schemata)| [`SHOW DATABASE`](show-vars.html)
Indexes | [statistics](#statistics)| [`SHOW INDEX`](show-index.html)
Privileges | [schema_privileges](#schema_privileges), [table_privileges](#table_privileges)| [`SHOW GRANTS`](show-grants.html)
Tables | [tables](#tables)| [`SHOW TABLES`](show-tables.html)
Views | [tables](#tables), [views](#views)| [`SHOW CREATE VIEW`](show-create-view.html)

## Views

The `information_schema` database is comprised of many views representing your cluster's schema, each of which is detailed below.

### administrable_role_authorizations

The `administrable_role_authorizations` view identifies all roles that the current user has the admin option for.

Column | Description
-------|-----------
`GRANTEE` | The name of the user to which this role membership was granted (always the current user).

### applicable_roles

The `applicable_roles` view identifies all roles whose privileges the current user can use. This implies there is a chain
of role grants from the current user to the role in question. The current user itself is also an applicable role, but is
not listed.

Column | Description
-------|-----------
`GRANTEE` | Name of the user to which this role membership was granted (always the current user).
`ROLE_NAME` | Name of a role.
`IS_GRANTABLE` | `YES` if the grantee has the admin option on the role; `NO` if not.

### columns

The `columns` view contains information about the columns in each table.

Column | Description
-------|-----------
`TABLE_CATALOG` | Name of the database containing the table.
`TABLE_SCHEMA` | Name of the schema containing the table.
`TABLE_NAME` | Name of the table.
`COLUMN_NAME` | Name of the column.
`ORDINAL_POSITION` | Ordinal position of the column in the table (begins at 1).
`COLUMN_DEFAULT` | Default Value for the column.
`IS_NULLABLE` | `YES` if the column accepts *NULL* values; `NO` if it doesn't (e.g. it has the [Not Null constraint](not-null.html)).
`DATA_TYPE` | [Data type](data-types.html) of the column.
`CHARACTER_MAXIMUM_LENGTH` |  If `DATA_TYPE` is `STRING`, the maximum length in characters of a value; otherwise *NULL*.
`CHARACTER_OCTET_LENGTH` | If `DATA_TYPE` is `STRING`, the maximum length in octets (bytes) of a value; otherwise *NULL*.
`NUMERIC_PRECISION` | If `DATA_TYPE` is numeric, the declared or implicit precision (i.e. number of significant digits); otherwise *NULL*.
`NUMERIC_SCALE` | If `DATA_TYPE` is an exact numeric type, the scale (i.e. number of digits to the right of the decimal point); otherwise *NULL*.
`DATETIME_PRECISION` | Always *NULL* (unsupported by CockroachDB).
`CHARACTER_SET_CATALOG` | Always *NULL* (unsupported by CockroachDB).
`CHARACTER_SET_SCHEMA` | Always *NULL* (unsupported by CockroachDB).
`CHARACTER_SET_NAME` | Always *NULL* (unsupported by CockroachDB).
`GENERATION_EXPRESSION` | The expression used for computing the column value in a computed column.

### column_privileges

The `column_privileges` view identifies all privileges granted on columns to a currently enabled role or by a currently enabled role.
There is one row for each combination of grantor, grantee, and column (defined by `table_catalog`, `table_schema`, `table_name`, and `column_name`).

Column | Description
-------|-----------
`GRANTOR` | Name of the role that granted the privilege.
`GRANTEE` | Name of the role that was granted the privilege.
`TABLE_CATALOG` | Name of the database containing the table that contains the column (always the current database).
`TABLE_SCHEMA` | Name of the schema containing the table that contains the column.
`TABLE_NAME` | Name of the table.
`COLUMN_NAME` | Name of the column.
`PRIVILEGE_TYPE` | Name of the [privilege](privileges.html).
`IS_GRANTABLE` | Always *NULL* (unsupported by CockroachDB).

### enabled_roles

The `enabled_roles` view identifies enabled roles for the current user. This includes both direct and indirect roles.

Column | Description
-------|-----------
`ROLE_NAME` | Name of a role.

### key_column_usage

The `key_column_usage` view identifies columns with [Primary Key](primary-key.html), [Unique](unique.html), or [Foreign Key](foreign-key.html) constraints.

Column | Description
-------|-----------
`CONSTRAINT_CATALOG` | Name of the database containing the constraint.
`CONSTRAINT_SCHEMA` | Name of the schema containing the constraint.
`CONSTRAINT_NAME` | Name of the constraint.
`TABLE_CATALOG` | Name of the database containing the constrained table.
`TABLE_SCHEMA` | Name of the schema containing the constrained table.
`TABLE_NAME` | Name of the constrained table.
`COLUMN_NAME` | Name of the constrained column.
`ORDINAL_POSITION` | Ordinal position of the column within the constraint (begins at 1).
`POSITION_IN_UNIQUE_CONSTRAINT` | For Foreign Key constraints, ordinal position of the referenced column within its Unique constraint (begins at 1).

### referential_constraints

The `referential_constraints` view identifies all referential ([Foreign Key](foreign-key.html)) constraints.

Column | Description
-------|-----------
`CONSTRAINT_CATALOG` | Name of the database containing the constraint.
`CONSTRAINT_SCHEMA` | Name of the schema containing the constraint.
`CONSTRAINT_NAME` | Name of the constraint.
`UNIQUE_CONSTRAINT_CATALOG` | Name of the database containing the unique or primary key constraint that the foreign key constraint references (always the current database).
`UNIQUE_CONSTRAINT_SCHEMA` | Name of the schema containing the unique or primary key constraint that the foreign key constraint references.
`UNIQUE_CONSTRAINT_NAME` | Name of the unique or primary key constraint.
`MATCH_OPTION` | Match option of the foreign key constraint: `FULL`, `PARTIAL`, or `NONE`.
`UPDATE_RULE` | Update rule of the foreign key constraint: `CASCADE`, `SET NULL`, `SET DEFAULT`, `RESTRICT`, or `NO ACTION`.
`DELETE_RULE` | Delete rule of the foreign key constraint: `CASCADE`, `SET NULL`, `SET DEFAULT`, `RESTRICT`, or `NO ACTION`.
`TABLE_NAME` | Name of the table containing the constraint.
`REFERENCED_TABLE_NAME` | Name of the table containing the unique or primary key constraint that the foreign key constraint references.

### role_table_grants

The `role_table_grants` view identifies which [privileges](privileges.html) have been granted on tables or views where the grantor
or grantee is a currently enabled role. This table is identical to the [`table_privileges`](#table_privileges) view.

Column | Description
-------|-----------
`GRANTOR` | Name of the role that granted the privilege.
`GRANTEE` | Name of the role that was granted the privilege.
`TABLE_CATALOG` | Name of the database containing the table.
`TABLE_SCHEMA` | Name of the schema containing the table.
`TABLE_NAME` | Name of the table.
`PRIVILEGE_TYPE` | Name of the [privilege](privileges.html).
`IS_GRANTABLE` | Always *NULL* (unsupported by CockroachDB).
`WITH_HIERARCHY` | Always *NULL* (unsupported by CockroachDB).

### schema_privileges

The `schema_privileges` view identifies which [privileges](privileges.html) have been granted to each user at the database level.

Column | Description
-------|-----------
`GRANTEE` | Username of user with grant.
`TABLE_CATALOG` | Name of the database containing the constrained table.
`TABLE_SCHEMA` | Name of the schema containing the constrained table.
`PRIVILEGE_TYPE` | Name of the [privilege](privileges.html).
`IS_GRANTABLE` | Always *NULL* (unsupported by CockroachDB).

### schemata

The `schemata` view identifies the cluster's databases.

Column | Description
-------|-----------
`TABLE_CATALOG` | Name of the database.
`TABLE_SCHEMA` | Name of the schema.
`DEFAULT_CHARACTER_SET_NAME` |  Always *NULL* (unsupported by CockroachDB).
`SQL_PATH` |  Always *NULL* (unsupported by CockroachDB).

### statistics

The `statistics` view identifies table's [indexes](indexes.html).

Column | Description
-------|-----------
`TABLE_CATALOG` | Name of the database that contains the constrained table.
`TABLE_SCHEMA` | Name of the schema that contains the constrained table.
`TABLE_NAME` | Name of the table	 .
`NON_UNIQUE` | `NO` if the index was created by a Unique constraint; `YES` if the index was not created by a Unique constraint.
`INDEX_SCHEMA` | Name of the database that contains the index.
`INDEX_NAME` | Name of the index.
`SEQ_IN_INDEX` | Ordinal position of the column within the index (begins at 1).
`COLUMN_NAME` | Name of the column being indexed.
`COLLATION` | Always *NULL* (unsupported by CockroachDB).
`CARDINALITY` | Always *NULL* (unsupported by CockroachDB).
`DIRECTION` | `ASC` (ascending) or `DESC` (descending) order.
`STORING` | `YES` if column is [stored](create-index.html#store-columns); `NO` if it's indexed or implicit.
`IMPLICIT` | `YES` if column is implicit (i.e. it is not specified in the index and not stored); `NO` if it's indexed or stored.

### table_constraints

The `table_constraints` view identifies [constraints](constraints.html) applied to tables.

Column | Description
-------|-----------
`CONSTRAINT_CATALOG` | Name of the database containing the constraint.
`CONSTRAINT_SCHEMA` | Name of the schema containing the constraint.
`CONSTRAINT_NAME` | Name of the constraint.
`TABLE_CATALOG` | Name of the database containing the constrained table.
`TABLE_SCHEMA` | Name of the schema containing the constrained table.
`TABLE_NAME` | Name of the constrained table.
`CONSTRAINT_TYPE` | Type of [constraint](constraints.html): `CHECK`, `FOREIGN KEY`, `PRIMARY KEY`, or `UNIQUE`.
`IS_DEFERRABLE` | `YES` if the constraint can be deferred; `NO` if not.
`INITIALLY_DEFERRED` | `YES` if the constraint is deferrable and initially deferred; `NO` if not.

### table_privileges

The `table_privileges` view identifies which [privileges](privileges.html) have been granted to each user at the table level.

Column | Description
-------|-----------
`GRANTOR` | Always *NULL* (unsupported by CockroachDB).
`GRANTEE` | Username of user with grant.
`TABLE_CATALOG` | Name of the database that the grant applies to.
`TABLE_SCHEMA` | Name of the schema that the grant applies to.
`TABLE_NAME` | Name of the table that the grant applies to.
`PRIVILEGE_TYPE` | Type of [privilege](privileges.html): `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `REFERENCES`, or `TRIGGER`.
`IS_GRANTABLE` | Always *NULL* (unsupported by CockroachDB).
`WITH_HIERARCHY` | Always *NULL* (unsupported by CockroachDB).

### tables

The `tables` view identifies tables and views in the cluster.

Column | Description
-------|-----------
`TABLE_CATALOG` | Name of the database that contains the table.
`TABLE_SCHEMA` | Name of the schema that contains the table.
`TABLE_NAME` | Name of the table.
`TABLE_TYPE` | Type of the table: `BASE TABLE` for a normal table, `VIEW` for a view, or `SYSTEM VIEW` for a view created by CockroachDB.
`VERSION` | Version number of the table; versions begin at 1 and are incremented each time an `ALTER TABLE` statement is issued on the table.

### user_privileges

The `user_privileges` view identifies global [privileges](privileges.html).

{{site.data.alerts.callout_info}}Currently, CockroachDB does not support global privileges for non-<code>root</code> users. Therefore, this view contains global privileges only for <code>root</code>.
{{site.data.alerts.end}}

Column | Description
-------|-----------
`GRANTEE` | Username of user with grant.
`TABLE_CATALOG` | Name of the database that the privilege applies to.
`PRIVELEGE_TYPE` | Type of [privilege](privileges.html).
`IS_GRANTABLE` | Always *NULL* (unsupported by CockroachDB).

### views

The `views` view identifies [views](views.html) in the cluster.

Column | Description
-------|-----------
`TABLE_CATALOG` | Name of the database that contains the view.
`TABLE_SCHEMA` | Name of the schema that contains the view.
`TABLE_NAME` | Name of the view.
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
