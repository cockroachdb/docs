---
title: information_schema
summary: The information_schema schema contains read-only views that you can use for introspection into your database's tables, columns, indexes, and views.
toc: true
docs_area: reference.sql
---

The `information_schema` [system catalog](system-catalogs.html) contains information about your database's tables, columns, indexes, and views. This information can be used for introspection and reflection.

## Data exposed by `information_schema`

To perform introspection on objects, you can either read from the related `information_schema` table or use one of CockroachDB's `SHOW` statements. `information_schema` tables are read-only.

Object | `information_schema` Table | Corresponding `SHOW` Statement
-------|--------------|--------
Columns | [`columns`](#columns) | [`SHOW COLUMNS`](show-columns.html)
Constraints | [`check_constraints`](#check_constraints), [`key_column_usage`](#key_column_usage), [`referential_constraints`](#referential_constraints), [`table_constraints`](#table_constraints)| [`SHOW CONSTRAINTS`](show-constraints.html)
Databases | [`schemata`](#schemata)| [`SHOW DATABASE`](show-vars.html)
Indexes | [`statistics`](#statistics)| [`SHOW INDEX`](show-index.html)
Privileges | [`schema_privileges`](#schema_privileges), [`table_privileges`](#table_privileges)| [`SHOW GRANTS`](show-grants.html)
Roles | [`role_table_grants`](#role_table_grants) | [`SHOW ROLES`](show-roles.html)
Sequences | [`sequences`](#sequences) | [`SHOW CREATE SEQUENCE`](show-create.html)
Tables | [`tables`](#tables)| [`SHOW TABLES`](show-tables.html)
Views | [`tables`](#tables), [`views`](#views)| [`SHOW CREATE`](show-create.html)

## Tables in `information_schema`

The virtual schema `information_schema` contains virtual tables, also called "system views," representing the database's objects, each of which is detailed below.

These differ from regular [SQL views](views.html) in that they do not show data created from the content of other tables. Instead, CockroachDB generates the data for virtual tables when they are accessed.

{{site.data.alerts.callout_info}}
A query can specify a table name without a database name (e.g., `SELECT * FROM information_schema.sequences`). See [Name Resolution](sql-name-resolution.html) for more information.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
The virtual tables in `information_schema` contain useful comments with links to further documentation. To view these comments, use `SHOW TABLES FROM information_schema WITH COMMENT`:
{{site.data.alerts.end}}

### administrable_role_authorizations

`administrable_role_authorizations` identifies all roles that the current user has the admin option for.

Column | Description
-------|-----------
`grantee` | Name of the user to which this role membership was granted (always the current user).
`role_name` | Name of a role.
`is_grantable` | `YES` if the grantee has the admin option on the role; `NO` if not.

### applicable_roles

`applicable_roles` identifies all roles whose privileges the current user can use. This implies there is a chain of role grants from the current user to the role in question. The current user itself is also an applicable role, but is not listed.

Column | Description
-------|-----------
`grantee` | Name of the user to which this role membership was granted (always the current user).
`role_name` | Name of a role.
`is_grantable` | `YES` if the grantee has the admin option on the role; `NO` if not.

### character_sets

 `character_sets` identifies the character sets available in the current database.

Column | Description
-------|-----------
`character_set_catalog` | Always `NULL` (unsupported by CockroachDB).
`character_set_schema` | Always `NULL` (unsupported by CockroachDB).
`character_set_name` | Name of the character set (i.e., the name of the database encoding). Always `UTF8`.
`character_repertoire` | Character repertoire. `UCS` if the encoding is UTF8; the encoding name if not.
`form_of_use` | Character encoding form (i.e., the name of the database encoding). Always `UTF8`.
`default_collate_catalog` | Name of the database containing the default collation (if any collation is identified, always the current database).
`default_collate_schema` | Always `NULL` (unsupported by CockroachDB).
`default_collate_name` | Always `NULL` (unsupported by CockroachDB).

### check_constraints

`check_constraints` contains information about the [`CHECK`](check.html) constraints applied to columns in a database.

Column | Description
-------|-----------
`constraint_catalog` | Name of the database containing the constraint.
`constraint_schema` | Name of the schema containing the constraint.
`constraint_name` | Name of the constraint.
`check_clause` | Definition of the `CHECK` constraint.

### collations

 `collations` identifies the collations available in the current database.

Column | Description
-------|-----------
`collation_catalog` | Name of the database containing the collation (always the current database).
`collation_schema` | Name of the schema containing the collation (always `pg_catalog`).
`collation_name` | Name of the collation.
`pad_attribute` | Always `NO PAD` (`PAD SPACE` is not supported by CockroachDB).

### collation_character_set_applicability

 `collation_character_set_applicability` identifies which character set the available collations are applicable to.

Column | Description
-------|-----------
`collation_catalog` | Name of the database containing the collation (always the current database).
`collation_schema` | Name of the schema containing the collation (always `pg_catalog`).
`collation_name` | Name of the collation.
`character_set_catalog` | Always `NULL` (unsupported by CockroachDB).
`character_set_schema` | Always `NULL` (unsupported by CockroachDB).
`character_set_name` | Name of the character set (always `UTF8`).

### columns

`columns` contains information about the columns in each table.

Column | Description
-------|-----------
`table_catalog` | Name of the database containing the table.
`table_schema` | Name of the schema containing the table.
`table_name` | Name of the table.
`column_name` | Name of the column.
`column_comment` | Comment on the column.
`ordinal_position` | Ordinal position of the column in the table (begins at 1).
`column_default` | Default value for the column.
`is_nullable` | `YES` if the column accepts `NULL` values; `NO` if it doesn't (e.g., it has the [`NOT NULL` constraint](not-null.html)).
`data_type` | [Data type](data-types.html) of the column.
`character_maximum_length` |  If `data_type` is `STRING`, the maximum length in characters of a value; otherwise `NULL`.
`character_octet_length` | If `data_type` is `STRING`, the maximum length in octets (bytes) of a value; otherwise `NULL`.
`numeric_precision` | If `data_type` is numeric, the declared or implicit precision (i.e., number of significant digits); otherwise `NULL`.
`numeric_precision_radix` | If `data_type` identifies a numeric type, the base in which the values in the columns `numeric_precision` and `numeric_scale` are expressed (either `2` or `10`). For all other data types, column is `NULL`.
`numeric_scale` | If `data_type` is an exact numeric type, the scale (i.e., number of digits to the right of the decimal point); otherwise `NULL`.
`datetime_precision` | The precision level of columns with data type [`TIME`/`TIMETZ`](time.html), [`TIMESTAMP`/`TIMESTAMPTZ`](timestamp.html), or [`INTERVAL`](interval.html). For all other data types, this column is `NULL`.
`interval_type` | If `data_type` is [`INTERVAL`](interval.html), the specified fields (e.g., `YEAR TO MONTH`); otherwise `NULL`.
`interval_precision` | If `data_type` is [`INTERVAL`](interval.html), the declared or implicit precision (i.e., number of significant digits); otherwise `NULL`.
`character_set_catalog` | Always `NULL` (unsupported by CockroachDB).
`character_set_schema` | Always `NULL` (unsupported by CockroachDB).
`character_set_name` | Always `NULL` (unsupported by CockroachDB).
`collation_catalog` | Name of the database containing the collation (always the current database); `NULL` if the default collation is used, or if `data_type` is not collatable.
`collation_schema` | Name of the schema containing the collation; `NULL` if the default collation is used, or if `data_type` is not collatable.
`collation_name` | Name of the collation; `NULL` if the default collation is used, or if `data_type` is not collatable.
`domain_catalog` | Always `NULL` (unsupported by CockroachDB).
`domain_schema` | Always `NULL` (unsupported by CockroachDB).
`domain_name` | Always `NULL` (unsupported by CockroachDB).
`udt_catalog` | Name of the column data type's database (always the current database).
`udt_schema` | Name of the column data type's schema.
`udt_name` | Name of the column data type.
`scope_catalog` | Always `NULL` (unsupported by CockroachDB).
`scope_schema` | Always `NULL` (unsupported by CockroachDB).
`scope_name` | Always `NULL` (unsupported by CockroachDB).
`maximum_cardinality` | Always `NULL` (unsupported by CockroachDB).
`dtd_identifier` | Always `NULL` (unsupported by CockroachDB).
`is_self_referencing` | Always `NULL` (unsupported by CockroachDB).
`is_identity` | Whether or not the column is an identity column (always `NO`).
`identity_generation` | Always `NULL` (unsupported by CockroachDB).
`identity_start` | If the column is an identity column, then the start value of the internal sequence, else `NULL`.
`identity_increment` | If the column is an identity column, then the increment of the internal sequence, else `NULL`.
`identity_maximum` | If the column is an identity column, then the maximum value of the internal sequence, else `NULL`.
`identity_minimum` | If the column is an identity column, then the minimum value of the internal sequence, else `NULL`.
`identity_cycle` | If the column is an identity column, then `YES` if the internal sequence cycles or `NO` if it does not; otherwise `NULL`.
`is_generated` | Whether or not the column is generated (i.e., a [computed column](computed-columns.html)). Possible values: `YES` or `NO`.
`generation_expression` | The expression used for computing the column value in a computed column.
`is_updatable` | Whether or not the column is able to be updated. Possible values: `YES` or `NO`.
`is_hidden` | Whether or not the column is hidden. Possible values: `YES` or `NO`.
`crdb_sql_type` | [Data type](data-types.html) of the column.

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
`privilege_type` | Name of the [privilege](security-reference/authorization.html#managing-privileges).
`is_grantable` | Always `NULL` (unsupported by CockroachDB).

### column_udt_usage

`column_udt_usage` identifies all columns that use data types owned by a currently-enabled role.

Column | Description
-------|-----------
`udt_catalog` | Name of the database in which the column data type is defined (always the current database).
`udt_schema` | Name of the schema in which the column data type is defined.
`udt_name` | Name of the column data type.
`table_catalog` | Name of the database containing the table (always the current database).
`table_schema` | Name of the schema containing the table.
`table_name` | Name of the table.
`column_name` | Name of the column.

### constraint_column_usage

`constraint_column_usage` identifies all columns in a database that are used by some [constraint](constraints.html).

Column | Description
-------|-----------
`table_catalog` | Name of the database that contains the table that contains the column that is used by some constraint.
`table_schema` | Name of the schema that contains the table that contains the column that is used by some constraint.
`table_name` | Name of the table that contains the column that is used by some constraint.
`column_name` | Name of the column that is used by some constraint.
`constraint_catalog` | Name of the database that contains the constraint.
`constraint_schema` | Name of the schema that contains the constraint.
`constraint_name` | Name of the constraint.

### enabled_roles

The `enabled_roles` view identifies enabled roles for the current user. This includes both direct and indirect roles.

Column | Description
-------|-----------
`role_name` | Name of a role.

### key_column_usage

`key_column_usage` identifies columns with [`PRIMARY KEY`](primary-key.html), [`UNIQUE`](unique.html), or [foreign key / `REFERENCES`](foreign-key.html) constraints.

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

`referential_constraints` identifies all referential ([foreign key](foreign-key.html)) constraints.

Column | Description
-------|-----------
`constraint_catalog` | Name of the database containing the constraint.
`constraint_schema` | Name of the schema containing the constraint.
`constraint_name` | Name of the constraint.
`unique_constraint_catalog` | Name of the database containing the `UNIQUE` or `PRIMARY KEY` constraint that the foreign key constraint references (always the current database).
`unique_constraint_schema` | Name of the schema containing the `UNIQUE` or `PRIMARY KEY` constraint that the foreign key constraint references.
`unique_constraint_name` | Name of the `UNIQUE` or `PRIMARY KEY` constraint.
`match_option` | Match option of the foreign key constraint: `FULL`, `PARTIAL`, or `NONE`.
`update_rule` | Update rule of the foreign key constraint: `CASCADE`, `SET NULL`, `SET DEFAULT`, `RESTRICT`, or `NO ACTION`.
`delete_rule` | Delete rule of the foreign key constraint: `CASCADE`, `SET NULL`, `SET DEFAULT`, `RESTRICT`, or `NO ACTION`.
`table_name` | Name of the table containing the constraint.
`referenced_table_name` | Name of the table containing the `UNIQUE` or `PRIMARY KEY` constraint that the foreign key constraint references.

### role_table_grants

`role_table_grants` identifies which [privileges](security-reference/authorization.html#managing-privileges) have been granted on tables or views where the grantor
or grantee is a currently enabled role. This table is identical to [`table_privileges`](#table_privileges).

Column | Description
-------|-----------
`grantor` | Name of the role that granted the privilege.
`grantee` | Name of the role that was granted the privilege.
`table_catalog` | Name of the database containing the table.
`table_schema` | Name of the schema containing the table.
`table_name` | Name of the table.
`privilege_type` | Name of the [privilege](security-reference/authorization.html#managing-privileges).
`is_grantable` | Always `NULL` (unsupported by CockroachDB).
`with_hierarchy` | Always `NULL` (unsupported by CockroachDB).

### schema_privileges

`schema_privileges` identifies which [privileges](security-reference/authorization.html#managing-privileges) have been granted to each user at the database level.

Column | Description
-------|-----------
`grantee` | Username of user with grant.
`table_catalog` | Name of the database containing the constrained table.
`table_schema` | Name of the schema containing the constrained table.
`privilege_type` | Name of the [privilege](security-reference/authorization.html#managing-privileges).
`is_grantable` | Always `NULL` (unsupported by CockroachDB).

### schemata

`schemata` identifies the database's schemas.

Column | Description
-------|-----------
`table_catalog` | Name of the database.
`table_schema` | Name of the schema.
`default_character_set_name` |  Always `NULL` (unsupported by CockroachDB).
`sql_path` |  Always `NULL` (unsupported by CockroachDB).

### sequences

`sequences` identifies [sequences](create-sequence.html) defined in a database.

Column | Description
-------|-----------
`sequence_catalog` | Name of the database that contains the sequence.
`sequence_schema` | Name of the schema that contains the sequence.
`sequence_name` | Name of the sequence.
`data_type` | The data type of the sequence.
`numeric_precision` | The (declared or implicit) precision of the sequence `data_type`.
`numeric_precision_radix` | The base of the values in which the columns `numeric_precision` and `numeric_scale` are expressed. The value is either `2` or `10`.
`numeric_scale` | The (declared or implicit) scale of the sequence `data_type`. The scale indicates the number of significant digits to the right of the decimal point. It can be expressed in decimal (base 10) or binary (base 2) terms, as specified in the column `numeric_precision_radix`.
`start_value` | The first value of the sequence.
`minimum_value` | The minimum value of the sequence.
`maximum_value` | The maximum value of the sequence.
`increment` | The value by which the sequence is incremented. A negative number creates a descending sequence. A positive number creates an ascending sequence.
`cycle_option` | Currently, all sequences are set to `NO CYCLE` and the sequence will not wrap.

### session_variables

 `session_variables` contains information about the [session variable settings](set-vars.html) for your session. `session_variables` contains a `variable` column and a `value` column. The `value` column corresponds to the output of the [`SHOW {session variable}`](show-vars.html) statement.

For a list of the session variables, see [supported variables](show-vars.html#supported-variables).

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
`constraint_type` | Type of [constraint](constraints.html): `CHECK`, `FOREIGN KEY`, `PRIMARY KEY`, or `UNIQUE`.<br>`NOT NULL` constraints appear as `CHECK` constraints in this column.
`is_deferrable` | `YES` if the constraint can be deferred; `NO` if not.
`initially_deferred` | `YES` if the constraint is deferrable and initially deferred; `NO` if not.

### table_privileges

`table_privileges` identifies which [privileges](security-reference/authorization.html#managing-privileges) have been granted to each user at the table level.

Column | Description
-------|-----------
`grantor` | Always `NULL` (unsupported by CockroachDB).
`grantee` | Username of the user with grant.
`table_catalog` | Name of the database that the grant applies to.
`table_schema` | Name of the schema that the grant applies to.
`table_name` | Name of the table that the grant applies to.
`privilege_type` | Type of [privilege](security-reference/authorization.html#managing-privileges): `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `REFERENCES`, or `TRIGGER`.
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
`version` | Version number of the table; versions begin at 1 and are incremented each time an `ALTER TABLE` statement is issued on the table. Note that this column is an experimental feature used for internal purposes inside CockroachDB and its definition is subject to change without notice.

### type_privileges

`type_privileges` contains information about privileges on the user-defined types in the current database.

Column | Description
-------|-----------
`grantee` | Username of user with privilege grant.
`type_catalog` | Name of the database that contains the type (always the current database).
`type_schema` | Name of the schema that contains the type.
`type_name` | Name of the type.
`privilege_type` | Type of [privilege](security-reference/authorization.html#managing-privileges).

### user_privileges

`user_privileges` identifies global [privileges](security-reference/authorization.html#managing-privileges).

Column | Description
-------|-----------
`grantee` | Username of user with grant.
`table_catalog` | Name of the database that the privilege applies to.
`privilege_type` | Type of [privilege](security-reference/authorization.html#managing-privileges).
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


### Empty tables

{% include_cached new-in.html version="v21.2" %} For compatibility with third-party [PostgreSQL](https://www.postgresql.org/docs/13/information-schema.html) and [MySQL](https://dev.mysql.com/doc/refman/8.0/en/information-schema-table-reference.html) tooling, `information_schema` includes the following empty tables:

- `attributes`
- `check_constraint_routine_usage`
- `column_column_usage`
- `column_domain_usage`
- `column_options`
- `column_statistics`
- `columns_extensions`
- `constraint_table_usage`
- `data_type_privileges`
- `domain_constraints`
- `domain_udt_usage`
- `domains`
- `element_types`
- `engines`
- `events`
- `files`
- `foreign_data_wrapper_options`
- `foreign_data_wrappers`
- `foreign_server_options`
- `foreign_servers`
- `foreign_table_options`
- `foreign_tables`
- `information_schema_catalog_name`
- `keywords`
- `optimizer_trace`
- `parameters`
- `partitions`
- `plugins`
- `processlist`
- `profiling`
- `resource_groups`
- `role_column_grants`
- `role_routine_grants`
- `role_udt_grants`
- `role_usage_grants`
- `routines`
- `routine_privileges`
- `schemata_extensions`
- `sql_features`
- `sql_implementation_info`
- `sql_parts`
- `sql_sizing`
- `st_geometry_columns`
- `st_spatial_reference_systems`
- `st_units_of_measure`
- `table_constraints_extensions`
- `tables_extensions`
- `tablespaces`
- `tablespaces_extensions`
- `transforms`
- `triggered_update_columns`
- `triggers`
- `udt_privileges`
- `usage_privileges`
- `user_attributes`
- `user_defined_types`
- `user_mapping_options`
- `user_mappings`
- `view_column_usage`
- `view_routine_usage`
- `view_table_usage`

## Querying `information_schema` tables

You can run [`SELECT` queries](selection-queries.html) on the tables in `information_schema`.

{{site.data.alerts.callout_success}}
The `information_schema` views typically represent objects that the current user has privilege to access. To ensure you can view all the objects in a database, access it as a user with [`admin` privileges](security-reference/authorization.html#admin-role).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Unless specified otherwise, queries to `information_schema` assume the [current database](sql-name-resolution.html#current-database).
{{site.data.alerts.end}}

For example, to retrieve all columns from the `table_constraints` table:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM movr.information_schema.table_constraints;
~~~

~~~
  constraint_catalog | constraint_schema |       constraint_name        | table_catalog | table_schema |         table_name         | constraint_type | is_deferrable | initially_deferred
---------------------+-------------------+------------------------------+---------------+--------------+----------------------------+-----------------+---------------+---------------------
  movr               | public            | primary                      | movr          | public       | users                      | PRIMARY KEY     | NO            | NO
  movr               | public            | 3426283741_53_1_not_null     | movr          | public       | users                      | CHECK           | NO            | NO
  movr               | public            | 3426283741_53_2_not_null     | movr          | public       | users                      | CHECK           | NO            | NO
  movr               | public            | primary                      | movr          | public       | vehicles                   | PRIMARY KEY     | NO            | NO
...
(25 rows)
~~~

And to retrieve specific columns from the `table_constraints` table:

{% include copy-clipboard.html %}
~~~ sql
> SELECT table_name, constraint_name FROM movr.information_schema.table_constraints;
~~~

~~~
          table_name         |       constraint_name
-----------------------------+-------------------------------
  users                      | primary
  users                      | 3426283741_53_1_not_null
  users                      | 3426283741_53_2_not_null
  vehicles                   | primary
...
(25 rows)
~~~

## See also

- [System Catalogs](system-catalogs.html)
- [`SHOW`](show-vars.html)
- [`SHOW COLUMNS`](show-columns.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`SHOW CREATE`](show-create.html)
- [`SHOW DATABASES`](show-databases.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW INDEX`](show-index.html)
- [`SHOW TABLES`](show-tables.html)
