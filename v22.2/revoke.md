---
title: REVOKE
summary: The REVOKE statement revokes privileges from users and/or roles, or revokes privileges from users and/or roles.
toc: true
docs_area: reference.sql
---

The `REVOKE` [statement](sql-statements.html) revokes [privileges](security-reference/authorization.html#managing-privileges) from [users and/or roles](security-reference/authorization.html#users-and-roles). For the list of privileges that can be granted to and revoked from users and roles, see [`GRANT`](grant.html).

You can use `REVOKE` to directly revoke privileges from a role or user, or you can revoke membership to an existing role, which effectively revokes that role's privileges.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Syntax

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/revoke.html %}
</div>

### Parameters

Parameter                   | Description
----------------------------|------------
`ALL`<br>`ALL PRIVILEGES`   | Revoke all [privileges](#supported-privileges).
`privilege_list`            | A comma-separated list of [privileges](security-reference/authorization.html#managing-privileges) to revoke.
`grant_targets`             | A comma-separated list of database, table, sequence, or function names. The list should be preceded by the object type (e.g., `DATABASE mydatabase`). If the object type is not specified, all names are interpreted as table or sequence names.
`target_types`              | A comma-separated list of [user-defined types](create-type.html).
`ALL SEQUENCES IN SCHEMA`   | Revoke [privileges](#supported-privileges) on all sequences in a schema or list of schemas.
`ALL TABLES IN SCHEMA`      | Revoke [privileges](#supported-privileges) on all tables and sequences in a schema or list of schemas.
`ALL FUNCTIONS IN SCHEMA`.  | Revoke [privileges](#supported-privileges) on all [user-defined functions](user-defined-functions.html) in a schema or list of schemas.
`schema_name_list`          | A comma-separated list of [schemas](create-schema.html).
`role_spec_list`            | A comma-separated list of [roles](security-reference/authorization.html#users-and-roles).

## Supported privileges

The following privileges can be revoked:

{% include {{ page.version.version }}/sql/privileges.md %}

## Required privileges

- To revoke privileges, user revoking privileges must have the `GRANT` privilege on the target [database](create-database.html), [schema](create-schema.html), [table](create-table.html), or [user-defined type](enum.html). In addition to the `GRANT` privilege, the user revoking privileges must have the privilege being revoked on the target object. For example, a user revoking the `SELECT` privilege on a table to another user must have the `GRANT` and `SELECT` privileges on that table.

- To revoke role membership, the user revoking role membership must be a role admin (i.e., members with the `WITH ADMIN OPTION`) or a member of the `admin` role. To remove membership to the `admin` role, the user must have `WITH ADMIN OPTION` on the `admin` role.

## Considerations

- The `root` user cannot be revoked from the `admin` role.

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Revoke privileges on databases

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE USER max WITH PASSWORD 'roach';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT CREATE ON DATABASE movr TO max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON DATABASE movr;
~~~

~~~
  database_name | grantee | privilege_type
----------------+---------+-----------------
  movr          | admin   | ALL
  movr          | max     | CREATE
  movr          | root    | ALL
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
REVOKE CREATE ON DATABASE movr FROM max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON DATABASE movr;
~~~

~~~
  database_name | grantee | privilege_type
----------------+---------+-----------------
  movr          | admin   | ALL
  movr          | root    | ALL
(2 rows)
~~~

{{site.data.alerts.callout_info}}
Any tables that previously inherited the database-level privileges retain the privileges.
{{site.data.alerts.end}}

### Revoke privileges on specific tables in a database

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT DELETE ON TABLE rides TO max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON TABLE rides;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type
----------------+-------------+------------+---------+-----------------
  movr          | public      | rides      | admin   | ALL
  movr          | public      | rides      | max     | DELETE
  movr          | public      | rides      | root    | ALL
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
REVOKE DELETE ON TABLE rides FROM max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON TABLE rides;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type
----------------+-------------+------------+---------+-----------------
  movr          | public      | rides      | admin   | ALL
  movr          | public      | rides      | root    | ALL
(2 rows)
~~~

### Revoke privileges on all tables in a database or schema

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT CREATE, SELECT, DELETE ON TABLE rides, users TO max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON TABLE movr.*;
~~~

~~~
  database_name | schema_name |         table_name         | grantee | privilege_type | is_grantable
----------------+-------------+----------------------------+---------+----------------+---------------
  movr          | public      | promo_codes                | admin   | ALL            |      t
  movr          | public      | promo_codes                | demo    | ALL            |      t
  movr          | public      | promo_codes                | root    | ALL            |      t
  movr          | public      | rides                      | admin   | ALL            |      t
  movr          | public      | rides                      | demo    | ALL            |      t
  movr          | public      | rides                      | max     | CREATE         |      f
  movr          | public      | rides                      | max     | DELETE         |      f
  movr          | public      | rides                      | max     | SELECT         |      f
  movr          | public      | rides                      | root    | ALL            |      t
  movr          | public      | user_promo_codes           | admin   | ALL            |      t
  movr          | public      | user_promo_codes           | demo    | ALL            |      t
  movr          | public      | user_promo_codes           | root    | ALL            |      t
  movr          | public      | users                      | admin   | ALL            |      t
  movr          | public      | users                      | demo    | ALL            |      t
  movr          | public      | users                      | max     | CREATE         |      f
  movr          | public      | users                      | max     | DELETE         |      f
  movr          | public      | users                      | max     | SELECT         |      f
  movr          | public      | users                      | root    | ALL            |      t
  movr          | public      | vehicle_location_histories | admin   | ALL            |      t
  movr          | public      | vehicle_location_histories | demo    | ALL            |      t
  movr          | public      | vehicle_location_histories | root    | ALL            |      t
  movr          | public      | vehicles                   | admin   | ALL            |      t
  movr          | public      | vehicles                   | demo    | ALL            |      t
  movr          | public      | vehicles                   | root    | ALL            |      t
(24 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
REVOKE DELETE ON ALL TABLES IN SCHEMA public FROM max;
~~~

This is equivalent to the following syntax:

{% include_cached copy-clipboard.html %}
~~~ sql
REVOKE DELETE ON movr.public.* FROM max;
~~~

~~~
  database_name | schema_name |         table_name         | grantee | privilege_type | is_grantable
----------------+-------------+----------------------------+---------+----------------+---------------
  movr          | public      | promo_codes                | admin   | ALL            |      t
  movr          | public      | promo_codes                | demo    | ALL            |      t
  movr          | public      | promo_codes                | root    | ALL            |      t
  movr          | public      | rides                      | admin   | ALL            |      t
  movr          | public      | rides                      | demo    | ALL            |      t
  movr          | public      | rides                      | max     | CREATE         |      f
  movr          | public      | rides                      | max     | SELECT         |      f
  movr          | public      | rides                      | root    | ALL            |      t
  movr          | public      | user_promo_codes           | admin   | ALL            |      t
  movr          | public      | user_promo_codes           | demo    | ALL            |      t
  movr          | public      | user_promo_codes           | root    | ALL            |      t
  movr          | public      | users                      | admin   | ALL            |      t
  movr          | public      | users                      | demo    | ALL            |      t
  movr          | public      | users                      | max     | CREATE         |      f
  movr          | public      | users                      | max     | SELECT         |      f
  movr          | public      | users                      | root    | ALL            |      t
  movr          | public      | vehicle_location_histories | admin   | ALL            |      t
  movr          | public      | vehicle_location_histories | demo    | ALL            |      t
  movr          | public      | vehicle_location_histories | root    | ALL            |      t
  movr          | public      | vehicles                   | admin   | ALL            |      t
  movr          | public      | vehicles                   | demo    | ALL            |      t
  movr          | public      | vehicles                   | root    | ALL            |      t
(22 rows)
~~~

### Revoke privileges on schemas

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE SCHEMA cockroach_labs;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT ALL ON SCHEMA cockroach_labs TO max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON SCHEMA cockroach_labs;
~~~

~~~
  database_name |  schema_name   | grantee | privilege_type
----------------+----------------+---------+-----------------
  movr          | cockroach_labs | admin   | ALL
  movr          | cockroach_labs | max     | ALL
  movr          | cockroach_labs | root    | ALL
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
REVOKE CREATE ON SCHEMA cockroach_labs FROM max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON SCHEMA cockroach_labs;
~~~

~~~
  database_name |  schema_name   | grantee | privilege_type
----------------+----------------+---------+-----------------
  movr          | cockroach_labs | admin   | ALL
  movr          | cockroach_labs | max     | GRANT
  movr          | cockroach_labs | max     | USAGE
  movr          | cockroach_labs | root    | ALL
(4 rows)
~~~

### Revoke privileges on user-defined types

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TYPE status AS ENUM ('available', 'unavailable');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT ALL ON TYPE status TO max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON TYPE status;
~~~

~~~
  database_name | schema_name | type_name | grantee | privilege_type
----------------+-------------+-----------+---------+-----------------
  movr          | public      | status    | admin   | ALL
  movr          | public      | status    | max     | ALL
  movr          | public      | status    | public  | USAGE
  movr          | public      | status    | root    | ALL
(4 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
REVOKE GRANT ON TYPE status FROM max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON TYPE status;
~~~

~~~
  database_name | schema_name | type_name | grantee | privilege_type
----------------+-------------+-----------+---------+-----------------
  movr          | public      | status    | admin   | ALL
  movr          | public      | status    | max     | USAGE
  movr          | public      | status    | public  | USAGE
  movr          | public      | status    | root    | ALL
(4 rows)
~~~

### Revoke role membership

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE ROLE developer WITH CREATEDB;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE USER abbey WITH PASSWORD 'lincoln';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT developer TO abbey;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON ROLE developer;
~~~

~~~
  role_name | member | is_admin
------------+--------+-----------
  developer | abbey  |  false
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
REVOKE developer FROM abbey;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON ROLE developer;
~~~

~~~
  role_name | member | is_admin
------------+--------+-----------
(0 rows)
~~~

### Revoke the admin option

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT developer TO abbey WITH ADMIN OPTION;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON ROLE developer;
~~~

~~~
  role_name | member | is_admin
------------+--------+-----------
  developer | abbey  |   true
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
REVOKE ADMIN OPTION FOR developer FROM abbey;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON ROLE developer;
~~~

~~~
  role_name | member | is_admin
------------+--------+-----------
  developer | abbey  |  false
(1 row)
~~~



## See also

- [Authorization](authorization.html)
- [`GRANT`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW ROLES`](show-roles.html)
- [`CREATE USER`](create-user.html)
- [`DROP USER`](drop-user.html)
- [SQL Statements](sql-statements.html)
