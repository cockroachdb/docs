---
title: GRANT
summary: The GRANT statement grants user privileges for interacting with specific database objects and adds roles or users as a member of a role.
toc: true
docs_area: reference.sql
---

The `GRANT` [statement]({% link {{ page.version.version }}/sql-statements.md %}) controls each [role or user's]({% link {{ page.version.version }}/security-reference/authorization.md %}#users-and-roles) [SQL privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#privileges) for interacting with specific [databases]({% link {{ page.version.version }}/create-database.md %}), [schemas]({% link {{ page.version.version }}/create-schema.md %}), [tables]({% link {{ page.version.version }}/create-table.md %}), or [user-defined types]({% link {{ page.version.version }}/enum.md %}). For privileges required by specific statements, see the documentation for the respective [SQL statement]({% link {{ page.version.version }}/sql-statements.md %}).

You can use `GRANT` to directly grant privileges to a role or user, or you can grant membership to an existing role, which grants that role's privileges to the grantee. Users granted a privilege with `WITH GRANT OPTION` can in turn grant that privilege to others. The owner of an object implicitly has the `GRANT OPTION` for all privileges, and the `GRANT OPTION` is inherited through role memberships.

For new databases, users with the following roles are automatically granted the [`ALL` privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges):

- Every user who is part of [the `admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) (including [the `root` user]({% link {{ page.version.version }}/security-reference/authorization.md %}#root-user)).
- Every user who is part of [the `owner` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) for the new database.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Syntax

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/grant.html %}
</div>

### Parameters

Parameter                 | Description
--------------------------|------------
`ALL`<br>`ALL PRIVILEGES` | Grant all [privileges](#supported-privileges).
`privilege_list`          | A comma-separated list of [privileges](#supported-privileges) to grant. For guidelines, see [Managing privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges).
`grant_targets`           | A comma-separated list of database, table, sequence, or function names. The list should be preceded by the object type (e.g., `DATABASE mydatabase`). If the object type is not specified, all names are interpreted as table or sequence names.
`target_types`            | A comma-separated list of [user-defined types]({% link {{ page.version.version }}/create-type.md %}).
`ALL SEQUENCES IN SCHEMA` | Grant [privileges](#supported-privileges) on all sequences in a schema or list of schemas.
`ALL TABLES IN SCHEMA`    | Grant [privileges](#supported-privileges) on all tables and sequences in a schema or list of schemas.
`ALL FUNCTIONS IN SCHEMA` | Grant [privileges](#supported-privileges) on all [user-defined functions]({% link {{ page.version.version }}/user-defined-functions.md %}) in a schema or list of schemas.
`schema_name_list`        | A comma-separated list of [schemas]({% link {{ page.version.version }}/create-schema.md %}).
`role_spec_list`          | A comma-separated list of [roles]({% link {{ page.version.version }}/security-reference/authorization.md %}#users-and-roles).
`WITH ADMIN OPTION`       | Designate the user as a role admin. Role admins can grant or [revoke]({% link {{ page.version.version }}/revoke.md %}) membership for the specified role.
`WITH GRANT OPTION`       | Allow the user to grant the specified privilege to others.

## Supported privileges

Roles and users can be granted the following privileges:

{% include {{ page.version.version }}/sql/privileges.md %}

## Required privileges

- To grant privileges, the user granting the privileges must also have the privilege being granted on the target database or tables. For example, a user granting the `SELECT` privilege on a table to another user must have the `SELECT` privileges on that table and `WITH GRANT OPTION` on `SELECT`.

- To grant roles, the user granting role membership must be a role admin (i.e., members with the `WITH ADMIN OPTION`) or a member of the `admin` role. To grant membership to the `admin` role, the user must have `WITH ADMIN OPTION` on the `admin` role.

## Details

### Granting privileges

When a role or user is granted privileges for a table, the privileges are limited to the table. The user does _not_ automatically get privileges to new or existing tables in the database. To grant privileges to a user on all new and/or existing tables in a database, see [Grant privileges on all tables in a database](#grant-privileges-on-all-tables-in-a-database-or-schema).

For privileges required by specific statements, see the documentation for the respective [SQL statement]({% link {{ page.version.version }}/sql-statements.md %}).

### Granting roles

- Users and roles can be members of roles.
- The `root` user is automatically created as an `admin` role and assigned the `ALL` privilege for new databases.
- All privileges of a role are inherited by all its members.
- Membership loops are not allowed (direct: `A is a member of B is a member of A` or indirect: `A is a member of B is a member of C ... is a member of A`).
- When you grant role membership (for example, `GRANT {role} TO {user}`), CockroachDB waits for full-cluster visibility of the updated role metadata. The operation is not blocked by long-running transactions that may have accessed older metadata, and it does not create a [background job]({% link {{ page.version.version }}/show-jobs.md %}).

## Known limitations

{% include {{page.version.version}}/known-limitations/grant-revoke-schema-changes.md %}

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Grant privileges on databases

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE USER IF NOT EXISTS max WITH PASSWORD 'roach';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT ALL ON DATABASE movr TO max WITH GRANT OPTION;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON DATABASE movr;
~~~

~~~
  database_name | grantee | privilege_type | is_grantable
----------------+---------+----------------+---------------
  movr          | admin   | ALL            |      t
  movr          | max     | ALL            |      t
  movr          | public  | CONNECT        |      f
  movr          | root    | ALL            |      t
(4 rows)
~~~

### Grant privileges on specific tables in a database

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT DELETE ON TABLE rides TO max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON TABLE rides;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type | is_grantable
----------------+-------------+------------+---------+----------------+---------------
  movr          | public      | rides      | admin   | ALL            |      t
  movr          | public      | rides      | max     | DELETE         |      f
  movr          | public      | rides      | root    | ALL            |      t
(3 rows)
~~~

### Grant privileges on all tables in a database or schema

To grant all the privileges on existing tables to a user:

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT ALL ON * TO max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON TABLE movr.public.*;
~~~

~~~
  database_name | schema_name |         table_name         | grantee | privilege_type | is_grantable
----------------+-------------+----------------------------+---------+----------------+---------------
  movr          | public      | promo_codes                | admin   | ALL            |      t
  movr          | public      | promo_codes                | max     | ALL            |      f
  movr          | public      | promo_codes                | root    | ALL            |      t
  movr          | public      | rides                      | admin   | ALL            |      t
  movr          | public      | rides                      | max     | ALL            |      f
  movr          | public      | rides                      | root    | ALL            |      t
  movr          | public      | user_promo_codes           | admin   | ALL            |      t
  movr          | public      | user_promo_codes           | max     | ALL            |      f
  movr          | public      | user_promo_codes           | root    | ALL            |      t
  movr          | public      | users                      | admin   | ALL            |      t
  movr          | public      | users                      | max     | ALL            |      f
  movr          | public      | users                      | root    | ALL            |      t
  movr          | public      | vehicle_location_histories | admin   | ALL            |      t
  movr          | public      | vehicle_location_histories | max     | ALL            |      f
  movr          | public      | vehicle_location_histories | root    | ALL            |      t
  movr          | public      | vehicles                   | admin   | ALL            |      t
  movr          | public      | vehicles                   | max     | ALL            |      f
  movr          | public      | vehicles                   | root    | ALL            |      t
(18 rows)
~~~

To ensure that anytime a new table is created, all the privileges on that table are granted to a user, use [`ALTER DEFAULT PRIVILEGES`]({% link {{ page.version.version }}/alter-default-privileges.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DEFAULT PRIVILEGES FOR ALL ROLES GRANT ALL ON TABLES TO max;
~~~

To check that this is working as expected, [create a table]({% link {{ page.version.version }}/create-table.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE IF NOT EXISTS usertable(x INT);
~~~

Then, check that the all privileges on the newly created table are granted to the user you specified using [`SHOW GRANTS`]({% link {{ page.version.version }}/show-grants.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON TABLE usertable;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type | is_grantable
----------------+-------------+------------+---------+----------------+---------------
  movr          | public      | usertable  | admin   | ALL            |      t
  movr          | public      | usertable  | max     | ALL            |      f
  movr          | public      | usertable  | root    | ALL            |      t
(3 rows)
~~~

### Grant system-level privileges on the entire cluster

[System-level privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) live above the database level and apply to the entire cluster.

`root` and [`admin`]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) users have system-level privileges by default, and are capable of granting it to other users and roles using the `GRANT` statement.

For example, the following statement allows the user `max` (created in a [previous example](#grant-privileges-on-databases)) to use the [`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %}) statement by assigning the `MODIFYCLUSTERSETTING` system privilege:

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT SYSTEM MODIFYCLUSTERSETTING TO max;
~~~

### Make a table readable to every user in the system

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT SELECT ON TABLE vehicles TO public;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON TABLE vehicles;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type | is_grantable
----------------+-------------+------------+---------+----------------+---------------
  movr          | public      | vehicles   | admin   | ALL            |      t
  movr          | public      | vehicles   | max     | ALL            |      f
  movr          | public      | vehicles   | public  | SELECT         |      f
  movr          | public      | vehicles   | root    | ALL            |      t
(4 rows)
~~~

### Grant privileges on schemas

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE SCHEMA IF NOT EXISTS cockroach_labs;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT ALL ON SCHEMA cockroach_labs TO max WITH GRANT OPTION;
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

### Grant privileges on user-defined types

To grant privileges on [user-defined types]({% link {{ page.version.version }}/create-type.md %}), use the following statements.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TYPE IF NOT EXISTS status AS ENUM ('open', 'closed', 'inactive');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT ALL ON TYPE status TO max WITH GRANT OPTION;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON TYPE status;
~~~

~~~
  database_name | schema_name | type_name | grantee | privilege_type | is_grantable
----------------+-------------+-----------+---------+----------------+---------------
  movr          | public      | status    | admin   | ALL            |      t
  movr          | public      | status    | max     | ALL            |      t
  movr          | public      | status    | public  | USAGE          |      f
  movr          | public      | status    | root    | ALL            |      t
(4 rows)
~~~

### Grant the privilege to manage the replication zones for a database or table

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT ZONECONFIG ON TABLE rides TO max;
~~~

The user `max` can then use the [`CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-table.md %}#configure-zone) statement to add, modify, reset, or remove replication zones for the table `rides`.

### Grant role membership

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE ROLE IF NOT EXISTS developer WITH CREATEDB;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE USER IF NOT EXISTS abbey WITH PASSWORD 'lincoln';
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

### Grant the admin option

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

### Grant privileges with the option to grant to others

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT UPDATE ON TABLE rides TO max WITH GRANT OPTION;
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
  movr          | public      | rides      | max     | UPDATE         |      t
  movr          | public      | rides      | root    | ALL            |      t
(4 rows)
~~~

## See also

- [Authorization]({% link {{ page.version.version }}/authorization.md %})
- [`REVOKE`]({% link {{ page.version.version }}/revoke.md %})
- [`SHOW GRANTS`]({% link {{ page.version.version }}/show-grants.md %})
- [`SHOW ROLES`]({% link {{ page.version.version }}/show-roles.md %})
- [`CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-table.md %}#configure-zone)
- [Manage Users]({% link {{ page.version.version }}/security-reference/authorization.md %}#create-and-manage-users)
