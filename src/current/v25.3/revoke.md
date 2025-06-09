---
title: REVOKE
summary: The REVOKE statement revokes privileges from users and/or roles, or revokes privileges from users and/or roles.
toc: true
docs_area: reference.sql
---

The `REVOKE` [statement]({% link {{ page.version.version }}/sql-statements.md %}) revokes [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) from [users and/or roles]({% link {{ page.version.version }}/security-reference/authorization.md %}#users-and-roles). For the list of privileges that can be granted to and revoked from users and roles, see [`GRANT`]({% link {{ page.version.version }}/grant.md %}).

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
`privilege_list`            | A comma-separated list of [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) to revoke.
`grant_targets`             | A comma-separated list of database, table, sequence, or function names. The list should be preceded by the object type (e.g., `DATABASE mydatabase`). If the object type is not specified, all names are interpreted as table or sequence names.
`target_types`              | A comma-separated list of [user-defined types]({% link {{ page.version.version }}/create-type.md %}).
`ALL SEQUENCES IN SCHEMA`   | Revoke [privileges](#supported-privileges) on all sequences in a schema or list of schemas.
`ALL TABLES IN SCHEMA`      | Revoke [privileges](#supported-privileges) on all tables and sequences in a schema or list of schemas.
`ALL FUNCTIONS IN SCHEMA`.  | Revoke [privileges](#supported-privileges) on all [user-defined functions]({% link {{ page.version.version }}/user-defined-functions.md %}) in a schema or list of schemas.
`schema_name_list`          | A comma-separated list of [schemas]({% link {{ page.version.version }}/create-schema.md %}).
`role_spec_list`            | A comma-separated list of [roles]({% link {{ page.version.version }}/security-reference/authorization.md %}#users-and-roles).

## Supported privileges

The following privileges can be revoked:

{% include {{ page.version.version }}/sql/privileges.md %}

## Required privileges

- To revoke privileges, user revoking privileges must have the `GRANT` privilege on the target [database]({% link {{ page.version.version }}/create-database.md %}), [schema]({% link {{ page.version.version }}/create-schema.md %}), [table]({% link {{ page.version.version }}/create-table.md %}), or [user-defined type]({% link {{ page.version.version }}/enum.md %}). In addition to the `GRANT` privilege, the user revoking privileges must have the privilege being revoked on the target object. For example, a user revoking the `SELECT` privilege on a table to another user must have the `GRANT` and `SELECT` privileges on that table.

- To revoke role membership, the user revoking role membership must be a role admin (i.e., members with the `WITH ADMIN OPTION`) or a member of the `admin` role. To remove membership to the `admin` role, the user must have `WITH ADMIN OPTION` on the `admin` role.

## Considerations

- The `root` user cannot be revoked from the `admin` role.

## Known limitations

{% include {{page.version.version}}/known-limitations/grant-revoke-schema-changes.md %}

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
  database_name | grantee | privilege_type | is_grantable
----------------+---------+----------------+---------------
  movr          | admin   | ALL            |      t
  movr          | max     | CREATE         |      f
  movr          | root    | ALL            |      t
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
  database_name | grantee | privilege_type | is_grantable
----------------+---------+----------------+---------------
  movr          | admin   | ALL            |      t
  movr          | root    | ALL            |      t
(2 rows)
~~~

{{site.data.alerts.callout_info}}
Any tables that previously inherited the database-level privileges retain the privileges.
{{site.data.alerts.end}}

### Revoke privileges on specific tables in a database

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT ALL ON TABLE rides TO max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON TABLE rides;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type | is_grantable
----------------+-------------+------------+---------+----------------+---------------
  movr          | public      | rides      | admin   | ALL            |      t
  movr          | public      | rides      | max     | ALL            |      f
  movr          | public      | rides      | root    | ALL            |      t
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
REVOKE ALL ON TABLE rides FROM max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON TABLE rides;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type | is_grantable
----------------+-------------+------------+---------+----------------+---------------
  movr          | public      | rides      | admin   | ALL            |      t
  movr          | public      | rides      | root    | ALL            |      t
(2 rows)
~~~

### Revoke privileges on all tables in a database or schema

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT ALL ON TABLE rides, users TO max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON TABLE movr.*;
~~~

~~~
  database_name | schema_name |         table_name         | grantee | privilege_type | is_grantable
----------------+-------------+----------------------------+---------+----------------+---------------
  movr          | public      | promo_codes                | admin   | ALL            |      t
  movr          | public      | promo_codes                | root    | ALL            |      t
  movr          | public      | rides                      | admin   | ALL            |      t
  movr          | public      | rides                      | max     | ALL            |      f
  movr          | public      | rides                      | root    | ALL            |      t
  movr          | public      | user_promo_codes           | admin   | ALL            |      t
  movr          | public      | user_promo_codes           | root    | ALL            |      t
  movr          | public      | users                      | admin   | ALL            |      t
  movr          | public      | users                      | max     | ALL            |      f
  movr          | public      | users                      | root    | ALL            |      t
  movr          | public      | usertable                  | admin   | ALL            |      t
  movr          | public      | usertable                  | root    | ALL            |      t
  movr          | public      | vehicle_location_histories | admin   | ALL            |      t
  movr          | public      | vehicle_location_histories | root    | ALL            |      t
  movr          | public      | vehicles                   | admin   | ALL            |      t
  movr          | public      | vehicles                   | public  | SELECT         |      f
  movr          | public      | vehicles                   | root    | ALL            |      t
(17 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM max;
~~~

This is equivalent to the following syntax:

{% include_cached copy-clipboard.html %}
~~~ sql
REVOKE ALL ON movr.public.* FROM max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON TABLE movr.*;
~~~

~~~
  database_name | schema_name |         table_name         | grantee | privilege_type | is_grantable
----------------+-------------+----------------------------+---------+----------------+---------------
  movr          | public      | promo_codes                | admin   | ALL            |      t
  movr          | public      | promo_codes                | root    | ALL            |      t
  movr          | public      | rides                      | admin   | ALL            |      t
  movr          | public      | rides                      | root    | ALL            |      t
  movr          | public      | user_promo_codes           | admin   | ALL            |      t
  movr          | public      | user_promo_codes           | root    | ALL            |      t
  movr          | public      | users                      | admin   | ALL            |      t
  movr          | public      | users                      | root    | ALL            |      t
  movr          | public      | usertable                  | admin   | ALL            |      t
  movr          | public      | usertable                  | root    | ALL            |      t
  movr          | public      | vehicle_location_histories | admin   | ALL            |      t
  movr          | public      | vehicle_location_histories | root    | ALL            |      t
  movr          | public      | vehicles                   | admin   | ALL            |      t
  movr          | public      | vehicles                   | public  | SELECT         |      f
  movr          | public      | vehicles                   | root    | ALL            |      t
(15 rows)
~~~

### Revoke system-level privileges on the entire cluster

[System-level privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) live above the database level and apply to the entire cluster.

`root` and [`admin`]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) users have system-level privileges by default, and are capable of revoking it from other users and roles using the `REVOKE` statement.

For example, the following statement removes the ability to use the [`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %}) statement from the user `maxroach` by revoking the `MODIFYCLUSTERSETTING` system privilege:

{% include_cached copy-clipboard.html %}
~~~ sql
REVOKE SYSTEM MODIFYCLUSTERSETTING FROM max;
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
  database_name |  schema_name   | grantee | privilege_type | is_grantable
----------------+----------------+---------+----------------+---------------
  movr          | cockroach_labs | admin   | ALL            |      t
  movr          | cockroach_labs | max     | ALL            |      t
  movr          | cockroach_labs | root    | ALL            |      t
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
  database_name |  schema_name   | grantee | privilege_type | is_grantable
----------------+----------------+---------+----------------+---------------
  movr          | cockroach_labs | admin   | ALL            |      t
  movr          | cockroach_labs | max     | USAGE          |      t
  movr          | cockroach_labs | root    | ALL            |      t
(3 rows)
~~~

### Revoke privileges on user-defined types

To revoke privileges on [user-defined types]({% link {{ page.version.version }}/create-type.md %}), use the following statements.

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
  database_name | schema_name | type_name | grantee | privilege_type | is_grantable
----------------+-------------+-----------+---------+----------------+---------------
  movr          | public      | status    | admin   | ALL            |      t
  movr          | public      | status    | max     | ALL            |      f
  movr          | public      | status    | public  | USAGE          |      f
  movr          | public      | status    | root    | ALL            |      t
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
  developer | abbey  |    f
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
SHOW GRANTS ON ROLE 0
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
  developer | abbey  |    t
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
  developer | abbey  |    f
(1 row)
~~~

## See also

- [Authorization]({% link {{ page.version.version }}/authorization.md %})
- [`GRANT`]({% link {{ page.version.version }}/grant.md %})
- [`SHOW GRANTS`]({% link {{ page.version.version }}/show-grants.md %})
- [`SHOW ROLES`]({% link {{ page.version.version }}/show-roles.md %})
- [`CREATE USER`]({% link {{ page.version.version }}/create-user.md %})
- [`DROP USER`]({% link {{ page.version.version }}/drop-user.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
