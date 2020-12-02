---
title: Authorization
summary: Learn about the authorization features for secure CockroachDB clusters.
toc: true
redirect_from: [create-and-manage-users.html, roles.html]
---

User authorization is the act of defining access policies for authenticated CockroachDB users. CockroachDB allows you to create, manage, and remove your cluster's [users](#sql-users) and assign SQL-level [privileges](#assign-privileges) to the users. Additionally, you can use [role-based access management (RBAC)](#roles) for simplified user management.

{{site.data.alerts.callout_info}}
 Role-based access management (RBAC) is no longer an enterprise feature and is now freely available in the core version of CockroachDB. Also, for enhanced PostgreSQL compatibility, the keywords `ROLE` and `USER` can now be used interchangeably in SQL statements. Note that even though the keywords are now interchangeable, it is still helpful to understand the distinction between the concepts (a "user" refers to an individual database user and a "role" refers to a group of database users).
{{site.data.alerts.end}}

## SQL users

A SQL user can interact with a CockroachDB database using the [built-in SQL shell](cockroach-sql.html) or through an application.

### Create and manage users

Use the [`CREATE USER`](create-user.html) and [`DROP USER`](drop-user.html) statements to create and remove users, the [`ALTER USER`](alter-user.html) statement to add or change a user's password and role options, the [`GRANT <privileges>`](grant.html) and [`REVOKE <privileges>`](revoke.html) statements to manage the user’s privileges, and the [`SHOW USERS`](show-users.html) statement to list users.

A new user must be granted the required privileges for each database and table that the user needs to access.

{{site.data.alerts.callout_info}}
By default, a new user belongs to the `public` role and has no privileges other than those assigned to the `public` role. For more information, see [Public role](#public-role).
{{site.data.alerts.end}}

### `root` user

The `root` user is created by default for each cluster. The `root` user is assigned to the [`admin` role](#admin-role) and has all privileges across the cluster.

For secure clusters, in addition to [generating the client certificate](authentication.html#client-authentication) for the `root` user, you can assign or change the password for the `root` user using the [`ALTER USER`](alter-user.html) statement.

## Roles

{{site.data.alerts.callout_info}}
 Role-based access management is no longer an enterprise feature and is now freely available in the core version of CockroachDB.
{{site.data.alerts.end}}

A role is a group of users and/or other roles for which you can grant or revoke privileges as a whole. To simplify access management, create a role and grant privileges to the role, then create SQL users and grant them membership to the role.

### Create and manage roles

To create and manage your cluster's roles, use the following statements:

Statement | Description
----------|------------
[`CREATE ROLE`](create-role.html) | Create SQL roles.
[`DROP ROLE`](drop-role.html) | Remove one or more SQL roles.
[`GRANT <roles>`](grant-roles.html) | Add a role or user as a member to a role.
[`REVOKE <roles>`](revoke-roles.html) | Revoke a role or user's membership to a role.
[`GRANT <privileges>`](grant.html) | Manage each role or user's SQL privileges for interacting with specific databases and tables.
[`REVOKE <privileges>`](revoke.html) | Revoke privileges from users and/or roles.
[`SHOW ROLES`](show-roles.html) | List the roles for all databases.
[`SHOW GRANTS`](show-grants.html) | List the privileges granted to users.

### Default roles

The `admin` and `public` roles exist by default.

#### `admin` role

The `admin` role is created by default and cannot be dropped. Users belonging to the `admin` role have all privileges for all database objects across the cluster. The `root` user belongs to the `admin` role by default.

An `admin` user is a member of the `admin` role. Only `admin` users can use [`CREATE ROLE`](create-role.html) and [`DROP ROLE`](drop-role.html).

To assign a user to the `admin` role:

{% include copy-clipboard.html %}
~~~ sql
> GRANT admin TO <username>;
~~~

#### `public` role

All new users and roles belong to the `public` role by default. You can grant and revoke the privileges on the `public` role.

### Terminology

#### Role admin

A `role admin` is a member of the role that's allowed to grant or revoke role membership to other users for that specific role. To create a `role admin`, use [`WITH ADMIN OPTION`](grant-roles.html#grant-the-admin-option).

{{site.data.alerts.callout_success}}
The terms “`admin` role” and “`role admin`” can be confusing. A user who is a member of the `admin` role has all privileges on all database objects across the entire cluster, whereas a `role admin` has privileges limited to the role they are a member of. Assign the `admin` role to a SQL user if you want the user to have privileges across the cluster. Make a SQL user the `role admin` if you want to limit the user’s privileges to its current role, but with an option to grant or revoke role membership to other users. This applies to the `admin` role as well - only admin users with the `WITH ADMIN OPTION` can add or remove other users from the `admin` role.
{{site.data.alerts.end}}

#### Direct member

A user or role that is an immediate member of the role.

Example: A is a member of B.

#### Indirect member

A user or role that is a member of the role by association.

Example: A is a member of C ... is a member of B where "..." is an arbitrary number of memberships.

## Object ownership

All CockroachDB objects (such as databases, tables, schemas, and types) must have owners. The user that created the object is the default owner of the object and has `ALL` privileges on the object. Similarly, any roles that are members of the owner role also have all privileges on the object.

All objects that do not have owners (for example, objects created before upgrading to v20.2) have `admin` set as the default owner except system objects. System objects without owners have `node` as their owner.

To allow another user to use the object, the owner can [assign privileges](#assign-privileges) to the other user. Members of the `admin` role have `ALL` privileges on all objects.

Users that [own objects](authorization.html#privileges) cannot be dropped until the [ownership is transferred to another user](owner-to.html#change-a-databases-owner).

## Privileges

When a user connects to a database, either via the built-in SQL client or a client driver, CockroachDB checks the user and role's privileges for each statement executed. If the user does not have sufficient privileges for a statement, CockroachDB gives an error.

### Supported privileges

Roles and users can be granted the following privileges:

{% include {{ page.version.version }}/sql/privileges.md %}

### Assign privileges

Use the [`GRANT <privileges>`](grant.html) and [`REVOKE <privileges>`](revoke.html) statements to manage privileges for users and roles.

Take the following points into consideration while granting privileges to roles and users:

- When a role or user is granted privileges for a database, new tables created in the database will inherit the privileges, but the privileges can then be changed. To grant privileges to a user on all existing tables in a database, see [Grant privileges on all tables in a database](grant.html#grant-privileges-on-all-tables-in-a-database-or-schema)

    {{site.data.alerts.callout_info}}
    The user does not get privileges to existing tables in the database.
    {{site.data.alerts.end}}

- When a role or user is granted privileges for a table, the privileges are limited to the table.
- In CockroachDB, privileges are granted to users and roles at the database and table levels. They are not yet supported for other granularities such as columns or rows.
- The `root` user automatically belongs to the `admin` role and has the `ALL` privilege for new databases.
- For privileges required by specific statements, see the documentation for the respective [SQL statement](sql-statements.html).

## Authorization best practices

We recommend the following best practices to set up access control for your clusters:

- Use the `root` user only for database administration tasks such as creating and managing other [users](#sql-users), creating and managing [roles](#roles), and creating and managing databases. Do not use the `root` user for applications; instead, create users or roles with specific [privileges](#assign-privileges) based on your application’s access requirements.
- Use the ["least privilege model"](https://en.wikipedia.org/wiki/Principle_of_least_privilege) to grant privileges to users and roles.

## Example

<div class="filters clearfix">
  <button style="width: 30%" class="filter-button" data-scope="users">Users-based Privileges</button>
  <button style="width: 30%" class="filter-button" data-scope="rbac">Roles-based Privileges</button>
</div>

<section class="filter-content" markdown="1" data-scope="users">

The following example uses MovR, a fictional vehicle-sharing application, to demonstrate CockroachDB [SQL statements](sql-statements.html). For more information about the MovR example application and dataset, see [MovR: A Global Vehicle-sharing App](movr.html).

Let's say we want to create the following access control setup for the `movr` database:

- One database admin (named `db_admin`) who can perform all database operations for existing tables as well as for tables added in the future.
- One app user (named `app_user`) who can add, read update, and delete vehicles from the `vehicles` table.
- One user (named `report_user`) who can only read the `vehicles` table.

1. Use the [`cockroach demo`](cockroach-demo.html) command to load the `movr` database and dataset into a CockroachDB cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach demo
    ~~~

2. Create the database admin (named `db_admin`) who can perform all database operations for existing tables as well as for  tables added in the future:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE USER db_admin;
    ~~~

3. Grant all privileges on database `movr` to user `db_admin`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT ALL ON DATABASE movr TO db_admin;
    ~~~

4. Grant all privileges on all tables in database `movr` to user `db_admin`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT ALL ON TABLE * TO db_admin;
    ~~~

5. Verify that `db_admin` has all privileges:

    {% include copy-clipboard.html %}
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

6. As the `root` user, create a SQL user named `app_user` with permissions to add, read, update, and delete vehicles in the `vehicles` table:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE USER app_user;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT INSERT, DELETE, UPDATE, SELECT ON vehicles TO app_user;
    ~~~

    {% include copy-clipboard.html %}
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

7. As the `root` user, create a SQL user named `report_user` with permissions to only read from the `vehicles` table:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE USER report_user;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT SELECT ON vehicles TO report_user;
    ~~~

    {% include copy-clipboard.html %}
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

The following example uses MovR, a fictional vehicle-sharing application, to demonstrate CockroachDB SQL statements. For more information about the MovR example application and dataset, see [MovR: A Global Vehicle-sharing App](movr.html).

Let's say we want to create the following access control setup for the `movr` database:

- Two database admins (named `db_admin_1` and `db_admin_2`) who can perform all database operations for existing tables as well as for tables added in the future.
- Three app users (named `app_user_1`, `app_user_2`, and `app_user_3`) who can add, read update, and delete vehicles from the `vehicles` table.
- Five users (named `report_user_1`, `report_user_2`, `report_user_3`, `report_user_4`, `report_user_5`) who can only read the `vehicles` table.

1. Use the [`cockroach demo`](cockroach-demo.html) command to load the `movr` database and dataset into a CockroachDB cluster.:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach demo
    ~~~

2. Create the database admin role (named `db_admin_role`) whose members can perform all database operations for existing tables as well as for tables added in the future:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE ROLE db_admin_role;
    ~~~

    {% include copy-clipboard.html %}
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

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT ALL ON DATABASE movr TO db_admin_role;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT ALL ON TABLE * TO db_admin_role;
    ~~~

    {% include copy-clipboard.html %}
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

3. Create two database admin users (named `db_admin_1` and `db_admin_2`) and grant them membership to the `db_admin_role` role:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE USER db_admin_1;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE USER db_admin_2;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT db_admin_role TO db_admin_1, db_admin_2;
    ~~~

4. Create a role named `app_user_role` whose members can add, read update, and delete vehicles to the `vehicles` table.

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE ROLE app_user_role;
    ~~~

    {% include copy-clipboard.html %}
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

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT INSERT, UPDATE, DELETE, SELECT ON TABLE vehicles TO app_user_role;
    ~~~

    {% include copy-clipboard.html %}
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

5. Create three app users (named `app_user_1`, `app_user_2`, and `app_user_3`) and grant them membership to the `app_user_role` role:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE USER app_user_1;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE USER app_user_2;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE USER app_user_3;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT app_user_role TO app_user_1, app_user_2, app_user_3;
    ~~~

6. Create a role named `report_user_role` whose members can only read the `vehicles` table.

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE ROLE report_user_role;
    ~~~

    {% include copy-clipboard.html %}
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

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT SELECT ON vehicles TO report_user_role;
    ~~~

    {% include copy-clipboard.html %}
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

7. Create five report users (named `report_user_1`, `report_user_2`, `report_user_3`, `report_user_4`, and `report_user_5`) and grant them membership to the `report_user_role` role:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE USER report_user_1;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE USER report_user_2;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE USER report_user_3;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE USER report_user_4;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE USER report_user_5;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT report_user_role TO report_user_1, report_user_2, report_user_3, report_user_4, report_user_5;
    ~~~

</section>

## See also

- [Client Connection Parameters](connection-parameters.html)
- [SQL Statements](sql-statements.html)
- [`CREATE USER`](create-user.html)
- [`ALTER USER`](alter-user.html)
- [`DROP USER`](drop-user.html)
- [`SHOW USERS`](show-users.html)
- [`CREATE ROLE`](create-role.html)
- [`DROP ROLE`](drop-role.html)
- [`SHOW ROLES`](show-roles.html)
- [`GRANT <privileges>`](grant.html)
- [`GRANT <roles>`](grant-roles.html)
- [`REVOKE <privileges>`](revoke.html)
- [`REVOKE <roles>`](revoke-roles.html)
- [`SHOW GRANTS`](show-grants.html)
