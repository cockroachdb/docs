---
title: Manage Cluster User Authorization
summary: Learn procedures for managing the lifecycle of SQL users and roles.
toc: true
docs_area: manage
---

This page documents procedures for managing the lifecycle of SQL users and roles on CockroachDB clusters.

Procedures for managing access are covered in [Managing Access in CockroachDB {{ site.data.products.cloud }}](https://www.cockroachlabs.com/docs/cockroachcloud/managing-access).

{{site.data.alerts.callout_info}}
The concept of *Organization user* is distinct from Authorization of *SQL user/role* on clusters is distinct from authorization of CockroachDB {{ site.data.products.cloud }} users within CockroachDB {{ site.data.products.cloud }} organizations.

Learn more: [Overview of the CockroachDB Cloud authorization model](https://www.cockroachlabs.com/docs/cockroachcloud/authorization#overview-of-the-cockroachdb-cloud-two-level-authorization-model)
{{site.data.alerts.end}}


For reference documentation and explanation of related concepts, see [Security Reference&mdash;Authorization]({% link {{ page.version.version }}/security-reference/authorization.md %}).
## Create CockroachDB users

Use the [`CREATE USER`]({% link {{ page.version.version }}/create-user.md %}) and [`DROP USER`]({% link {{ page.version.version }}/drop-user.md %}) statements to create and remove users, the [`ALTER USER`]({% link {{ page.version.version }}/alter-user.md %}) statement to add or change a user's password and role options, the [`GRANT`]({% link {{ page.version.version }}/grant.md %}) and [`REVOKE`]({% link {{ page.version.version }}/revoke.md %}) statements to manage the user’s privileges, and the [`SHOW USERS`]({% link {{ page.version.version }}/show-users.md %}) statement to list users.

A new user must be granted the required privileges for each database and table that the user needs to access.

{{site.data.alerts.callout_info}}
By default, a new user belongs to the `public` role and has no privileges other than those assigned to the `public` role.
{{site.data.alerts.end}}


## Create and manage roles

To create and manage your cluster's roles, use the following statements:

Statement | Description
----------|------------
[`CREATE ROLE`]({% link {{ page.version.version }}/create-role.md %}) | Create SQL roles.
[`DROP ROLE`]({% link {{ page.version.version }}/drop-role.md %}) | Remove one or more SQL roles.
[`GRANT`]({% link {{ page.version.version }}/grant.md %}) | Manage each role or user's SQL privileges for interacting with specific databases and tables, or add a role or user as a member to a role.
[`REVOKE`]({% link {{ page.version.version }}/revoke.md %}) | Revoke privileges from users and/or roles, or revoke a role or user's membership to a role.
[`SHOW ROLES`]({% link {{ page.version.version }}/show-roles.md %}) | List the roles for all databases.
[`SHOW GRANTS`]({% link {{ page.version.version }}/show-grants.md %}) | List the privileges granted to users.














For example, suppose a cluster contains a role named `cockroachlabs`, and a user named `max` is a member of the `cockroachlabs` role:

~~~
root@localhost:26257/defaultdb> show roles;
    username    | options |    member_of
----------------+---------+------------------
  admin         |         | {}
  cockroachlabs |         | {}
  max           |         | {cockroachlabs}
  root          |         | {admin}
(4 rows)
~~~

If a user connects to the cluster as `cockroachlabs` and creates a table named `albums`, then any user that is also a member of the `cockroachlabs` role will have `ALL` privileges on that table:

~~~
cockroachlabs@localhost:26257/db> CREATE TABLE albums (
        id UUID PRIMARY KEY,
        title STRING,
        length DECIMAL,
        tracklist JSONB
);
~~~

~~~
max@localhost:26257/db> ALTER TABLE albums ADD COLUMN year INT;
ALTER TABLE


Time: 1.137s total (execution 1.137s / network 0.000s)

max@localhost:26257/db> SHOW CREATE TABLE albums;
  table_name |                     create_statement
-------------+------------------------------------------------------------
  albums     | CREATE TABLE public.albums (
             |     id UUID NOT NULL,
             |     title STRING NULL,
             |     length DECIMAL NULL,
             |     tracklist JSONB NULL,
             |     year INT8 NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
             |     FAMILY "primary" (id, title, length, tracklist, year)
             | )
(1 row)
~~~





## Example

<div class="filters clearfix">
  <button style="width: 30%" class="filter-button" data-scope="users">Users-based Privileges</button>
  <button style="width: 30%" class="filter-button" data-scope="rbac">Roles-based Privileges</button>
</div>

<section class="filter-content" markdown="1" data-scope="users">

The following example uses MovR, a fictional vehicle-sharing application, to demonstrate CockroachDB [SQL statements]({% link {{ page.version.version }}/sql-statements.md %}). For more information about the MovR example application and dataset, see [MovR: A Global Vehicle-sharing App]({% link {{ page.version.version }}/movr.md %}).

Let's say we want to create the following access control setup for the `movr` database:

- One database admin (named `db_admin`) who can perform all database operations for existing tables as well as for tables added in the future.
- One app user (named `app_user`) who can add, read update, and delete vehicles from the `vehicles` table.
- One user (named `report_user`) who can only read the `vehicles` table.

1. Use the [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) command to load the `movr` database and dataset into a CockroachDB cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach demo
    ~~~

1. Create the database admin (named `db_admin`) who can perform all database operations for existing tables as well as for  tables added in the future:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER db_admin;
    ~~~

1. Grant all privileges on database `movr` to user `db_admin`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > GRANT ALL ON DATABASE movr TO db_admin;
    ~~~

1. Grant all privileges on all tables in database `movr` to user `db_admin`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > GRANT ALL ON TABLE * TO db_admin;
    ~~~

1. Verify that `db_admin` has all privileges:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW GRANTS FOR db_admin;
    ~~~

    ~~~
      database_name |    schema_name     |         table_name         | grantee  | privilege_type
    +---------------+--------------------+----------------------------+----------+----------------+
      movr          | crdb_internal      | NULL                       | db_admin | ALL
      movr          | information_schema | NULL                       | db_admin | ALL
      movr          | pg_catalog         | NULL                       | db_admin | ALL
      movr          | public             | NULL                       | db_admin | ALL
      movr          | public             | promo_codes                | db_admin | ALL
      movr          | public             | rides                      | db_admin | ALL
      movr          | public             | user_promo_codes           | db_admin | ALL
      movr          | public             | users                      | db_admin | ALL
      movr          | public             | vehicle_location_histories | db_admin | ALL
      movr          | public             | vehicles                   | db_admin | ALL
    (10 rows)
    ~~~

1. As the `root` user, create a SQL user named `app_user` with permissions to add, read, update, and delete vehicles in the `vehicles` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER app_user;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > GRANT INSERT, DELETE, UPDATE, SELECT ON vehicles TO app_user;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW GRANTS FOR app_user;
    ~~~

    ~~~
      database_name | schema_name | table_name | grantee  | privilege_type
    +---------------+-------------+------------+----------+----------------+
      movr          | public      | vehicles   | app_user | DELETE
      movr          | public      | vehicles   | app_user | INSERT
      movr          | public      | vehicles   | app_user | SELECT
      movr          | public      | vehicles   | app_user | UPDATE
    (4 rows)
    ~~~

1. As the `root` user, create a SQL user named `report_user` with permissions to only read from the `vehicles` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER report_user;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > GRANT SELECT ON vehicles TO report_user;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW GRANTS FOR report_user;
    ~~~

    ~~~
      database_name | schema_name | table_name |   grantee   | privilege_type
    +---------------+-------------+------------+-------------+----------------+
      movr          | public      | vehicles   | report_user | SELECT
    (1 row)
    ~~~

</section>

<section class="filter-content" markdown="1" data-scope="rbac">

The following example uses MovR, a fictional vehicle-sharing application, to demonstrate CockroachDB SQL statements. For more information about the MovR example application and dataset, see [MovR: A Global Vehicle-sharing App]({% link {{ page.version.version }}/movr.md %}).

Let's say we want to create the following access control setup for the `movr` database:

- Two database admins (named `db_admin_1` and `db_admin_2`) who can perform all database operations for existing tables as well as for tables added in the future.
- Three app users (named `app_user_1`, `app_user_2`, and `app_user_3`) who can add, read update, and delete vehicles from the `vehicles` table.
- Five users (named `report_user_1`, `report_user_2`, `report_user_3`, `report_user_4`, `report_user_5`) who can only read the `vehicles` table.

1. Use the [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) command to load the `movr` database and dataset into a CockroachDB cluster.:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach demo
    ~~~

1. Create the database admin role (named `db_admin_role`) whose members can perform all database operations for existing tables as well as for tables added in the future:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE ROLE db_admin_role;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW ROLES;
    ~~~

    ~~~
        username    |  options   | member_of
    ----------------+------------+------------
      admin         | CREATEROLE | {}
      db_admin_role | NOLOGIN    | {}
      root          | CREATEROLE | {admin}
    (3 rows)
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > GRANT ALL ON DATABASE movr TO db_admin_role;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > GRANT ALL ON TABLE * TO db_admin_role;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW GRANTS ON DATABASE movr;
    ~~~

    ~~~
      database_name |    schema_name     |    grantee    | privilege_type
    ----------------+--------------------+---------------+-----------------
      movr          | crdb_internal      | admin         | ALL
      movr          | crdb_internal      | db_admin_role | ALL
      movr          | crdb_internal      | root          | ALL
      movr          | information_schema | admin         | ALL
      movr          | information_schema | db_admin_role | ALL
      movr          | information_schema | root          | ALL
      movr          | pg_catalog         | admin         | ALL
      movr          | pg_catalog         | db_admin_role | ALL
      movr          | pg_catalog         | root          | ALL
      movr          | public             | admin         | ALL
      movr          | public             | db_admin_role | ALL
      movr          | public             | root          | ALL
    (12 rows)
    ~~~

1. Create two database admin users (named `db_admin_1` and `db_admin_2`) and grant them membership to the `db_admin_role` role:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER db_admin_1;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER db_admin_2;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > GRANT db_admin_role TO db_admin_1, db_admin_2;
    ~~~

1. Create a role named `app_user_role` whose members can add, read update, and delete vehicles to the `vehicles` table.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE ROLE app_user_role;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW ROLES;
    ~~~

    ~~~
        username    |  options   |    member_of
    ----------------+------------+------------------
      admin         | CREATEROLE | {}
      app_user_role | NOLOGIN    | {}
      db_admin_1    |            | {db_admin_role}
      db_admin_2    |            | {db_admin_role}
      db_admin_role | NOLOGIN    | {}
      root          | CREATEROLE | {admin}
    (6 rows)
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > GRANT INSERT, UPDATE, DELETE, SELECT ON TABLE vehicles TO app_user_role;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW GRANTS ON vehicles;
    ~~~

    ~~~
      database_name | schema_name | table_name |    grantee    | privilege_type
    ----------------+-------------+------------+---------------+-----------------
      movr          | public      | vehicles   | admin         | ALL
      movr          | public      | vehicles   | app_user_role | DELETE
      movr          | public      | vehicles   | app_user_role | INSERT
      movr          | public      | vehicles   | app_user_role | SELECT
      movr          | public      | vehicles   | app_user_role | UPDATE
      movr          | public      | vehicles   | db_admin_role | ALL
      movr          | public      | vehicles   | root          | ALL
    (7 rows)
    ~~~

1. Create three app users (named `app_user_1`, `app_user_2`, and `app_user_3`) and grant them membership to the `app_user_role` role:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER app_user_1;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER app_user_2;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER app_user_3;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > GRANT app_user_role TO app_user_1, app_user_2, app_user_3;
    ~~~

1. Create a role named `report_user_role` whose members can only read the `vehicles` table.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE ROLE report_user_role;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW ROLES;
    ~~~

    ~~~
          username     |  options   |    member_of
    -------------------+------------+------------------
      admin            | CREATEROLE | {}
      app_user_1       |            | {app_user_role}
      app_user_2       |            | {app_user_role}
      app_user_3       |            | {app_user_role}
      app_user_role    | NOLOGIN    | {}
      db_admin_1       |            | {db_admin_role}
      db_admin_2       |            | {db_admin_role}
      db_admin_role    | NOLOGIN    | {}
      report_user_role | NOLOGIN    | {}
      root             | CREATEROLE | {admin}
    (10 rows)
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > GRANT SELECT ON vehicles TO report_user_role;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW GRANTS ON vehicles;
    ~~~

    ~~~
      database_name | schema_name | table_name |     grantee      | privilege_type
    ----------------+-------------+------------+------------------+-----------------
      movr          | public      | vehicles   | admin            | ALL
      movr          | public      | vehicles   | app_user_role    | DELETE
      movr          | public      | vehicles   | app_user_role    | INSERT
      movr          | public      | vehicles   | app_user_role    | SELECT
      movr          | public      | vehicles   | app_user_role    | UPDATE
      movr          | public      | vehicles   | db_admin_role    | ALL
      movr          | public      | vehicles   | report_user_role | SELECT
      movr          | public      | vehicles   | root             | ALL
    (8 rows)
    ~~~

1. Create five report users (named `report_user_1`, `report_user_2`, `report_user_3`, `report_user_4`, and `report_user_5`) and grant them membership to the `report_user_role` role:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER report_user_1;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER report_user_2;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER report_user_3;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER report_user_4;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER report_user_5;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > GRANT report_user_role TO report_user_1, report_user_2, report_user_3, report_user_4, report_user_5;
    ~~~

</section>

## See also

- [Client Connection Parameters]({% link {{ page.version.version }}/connection-parameters.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [`CREATE USER`]({% link {{ page.version.version }}/create-user.md %})
- [`ALTER USER`]({% link {{ page.version.version }}/alter-user.md %})
- [`DROP USER`]({% link {{ page.version.version }}/drop-user.md %})
- [`SHOW USERS`]({% link {{ page.version.version }}/show-users.md %})
- [`CREATE ROLE`]({% link {{ page.version.version }}/create-role.md %})
- [`DROP ROLE`]({% link {{ page.version.version }}/drop-role.md %})
- [`SHOW ROLES`]({% link {{ page.version.version }}/show-roles.md %})
- [`GRANT`]({% link {{ page.version.version }}/grant.md %})
- [`REVOKE`]({% link {{ page.version.version }}/revoke.md %})
- [`SHOW GRANTS`]({% link {{ page.version.version }}/show-grants.md %})
