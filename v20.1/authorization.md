---
title: Authorization
summary: Learn about the authorization features for secure CockroachDB clusters.
toc: true
redirect_from: create-and-manage-users.html
---

User authorization is the act of defining access policies for authenticated CockroachDB users. CockroachDB allows you to create, manage, and remove your cluster's [users](#create-and-manage-users) and assign SQL-level [privileges](#assign-privileges) to the users. Additionally, if you have an [Enterprise license](get-started-with-enterprise-trial.html), you can use [role-based access management (RBAC)](#create-and-manage-roles) for simplified user management.

## Create and manage users

Use the [`CREATE USER`](create-user.html) and [`DROP USER`](drop-user.html) statements to create and remove users, the [`ALTER USER`](alter-user.html) statement to add or change a user's password, and the [`SHOW USERS`](show-users.html) statement to list users.

## Create and manage roles

{{site.data.alerts.callout_info}}
Role-based access management is an enterprise feature. To request a 30-day trial license, see [Get CockroachDB](https://www.cockroachlabs.com/get-cockroachdb/).
{{site.data.alerts.end}}

Roles are SQL groups that contain any number of users and roles as members.

### Terminology

Term | Description
-----|------------
Role | A group containing any number of [users](create-user.html) or other roles.<br><br>Note: All users belong to the `public` role, to which you can [grant](grant.html) and [revoke](revoke.html) privileges.
Role admin | A member of the role that's allowed to modify role membership. To create a role admin, use [`WITH ADMIN OPTION`](grant-roles.html#grant-the-admin-option).
Superuser / Admin | A member of the `admin` role. Only superusers can [`CREATE ROLE`](create-role.html) or [`DROP ROLE`](drop-role.html). The `admin` role is created by default and cannot be dropped.
`root` | A user that exists by default as a member of the `admin` role. The `root` user must always be a member of the `admin` role.
Inherit | The behavior that grants a role's privileges to its members.
Direct member | A user or role that is an immediate member of the role.<br><br>Example: `A` is a member of `B`.
Indirect member | A user or role that is a member of the role by association. <br><br>Example: `A` is a member of `C` ... is a member of `B` where "..." is an arbitrary number of memberships.

To create and manage your cluster's roles, use the following statements:

- [`CREATE ROLE` (Enterprise)](create-role.html)
- [`DROP ROLE` (Enterprise)](drop-role.html)
- [`GRANT <roles>` (Enterprise)](grant-roles.html)
- [`REVOKE <roles>` (Enterprise)](revoke-roles.html)
- [`GRANT <privileges>`](grant.html)
- [`REVOKE <privileges>`](revoke.html)
- [`SHOW ROLES`](show-roles.html)
- [`SHOW GRANTS`](show-grants.html)

## Assign privileges

In CockroachDB, privileges are granted to [users](#create-and-manage-users) and [roles](#create-and-manage-roles) at the database and table levels. They are not yet supported for other granularities such as columns or rows.

When a user connects to a database, either via the [built-in SQL client](use-the-built-in-sql-client.html) or a [client driver](install-client-drivers.html), CockroachDB checks the user and role's privileges for each statement executed. If the user does not have sufficient privileges for a statement, CockroachDB gives an error.

For the privileges required by specific statements, see the documentation for the respective [SQL statement](sql-statements.html).

### Supported privileges

For a full list of supported privileges, see the [`GRANT`](grant.html) documentation.

### Granting privileges

To grant privileges to a role or user, use the [`GRANT`](grant.html) statement, for example:

{% include copy-clipboard.html %}
~~~ sql
> GRANT SELECT, INSERT ON bank.accounts TO maxroach;
~~~

### Showing privileges

To show privileges granted to roles or users, use the [`SHOW GRANTS`](show-grants.html) statement, for example:

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON DATABASE bank FOR maxroach;
~~~

### Revoking privileges

To revoke privileges from roles or users, use the [`REVOKE`](revoke.html) statement, for example:

{% include copy-clipboard.html %}
~~~ sql
> REVOKE INSERT ON bank.accounts FROM maxroach;
~~~

## Example

This example demonstrates user- and role-based access management. Role-based access management is an enterprise feature, so before you begin, [request a trial enterprise license](https://www.cockroachlabs.com/get-cockroachdb/).

1. Start a single-node, insecure cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start-single-node \
    --insecure \
    --store=roles \
    --listen-addr=localhost:26257 \
    --background
    ~~~

2. As the `root` user, open the [built-in SQL client](use-the-built-in-sql-client.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

3. Run the following commands in your SQL shell to enable enterprise features using your trial license:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING cluster.organization = '<your organization>';
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING enterprise.license = '<your license key>';
    ~~~

4. [Create a user](create-user.html), `maxroach`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE USER maxroach;
    ~~~

5. [Create a database](create-database.html) and [set it as the default](set-database.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE test_roles;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET DATABASE = test_roles;
    ~~~

6. [Create a role](create-role.html) and then [list all roles](show-roles.html) in your database:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE ROLE system_ops;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW ROLES;
    ~~~

    ~~~
      role_name
    +------------+
      admin
      system_ops
    (2 rows)
    ~~~

7. [Grant privileges](grant.html) to the `system_ops` role you created:

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT CREATE, SELECT ON DATABASE test_roles TO system_ops;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW GRANTS ON DATABASE test_roles;
    ~~~

    ~~~
      database_name |    schema_name     |  grantee   | privilege_type
    +---------------+--------------------+------------+----------------+
      test_roles    | crdb_internal      | admin      | ALL
      test_roles    | crdb_internal      | root       | ALL
      test_roles    | crdb_internal      | system_ops | CREATE
      test_roles    | crdb_internal      | system_ops | SELECT
      test_roles    | information_schema | admin      | ALL
      test_roles    | information_schema | root       | ALL
      test_roles    | information_schema | system_ops | CREATE
      test_roles    | information_schema | system_ops | SELECT
      test_roles    | pg_catalog         | admin      | ALL
      test_roles    | pg_catalog         | root       | ALL
      test_roles    | pg_catalog         | system_ops | CREATE
      test_roles    | pg_catalog         | system_ops | SELECT
      test_roles    | public             | admin      | ALL
      test_roles    | public             | root       | ALL
      test_roles    | public             | system_ops | CREATE
      test_roles    | public             | system_ops | SELECT
    (16 rows)
    ~~~

8. Add the `maxroach` user to the `system_ops` role:

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT system_ops TO maxroach;
    ~~~

9. To test the privileges you just added to the `system_ops` role, use `\q` or `ctrl-d` to exit the interactive shell, and then open the shell again as the `maxroach` user (who is a member of the `system_ops` role):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --user=maxroach --database=test_roles --insecure
    ~~~

10. As the `maxroach` user, create a table:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE employees (
        id UUID DEFAULT uuid_v4()::UUID PRIMARY KEY,
        profile JSONB
      );
    ~~~

    We were able to create the table because `maxroach` has `CREATE` privileges.

11. As the `maxroach` user, try to drop the table:

    {% include copy-clipboard.html %}
    ~~~ sql
    > DROP TABLE employees;
    ~~~

    ~~~
    pq: user maxroach does not have DROP privilege on relation employees
    ~~~

    You cannot drop the table because your current user (`maxroach`) is a member of the `system_ops` role, which doesn't have `DROP` privileges.

12. `maxroach` has `CREATE` and `SELECT` privileges, so try a `SHOW` statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW GRANTS ON TABLE employees;
    ~~~

    ~~~
      database_name | schema_name | table_name |  grantee   | privilege_type
    +---------------+-------------+------------+------------+----------------+
      test_roles    | public      | employees  | admin      | ALL
      test_roles    | public      | employees  | root       | ALL
      test_roles    | public      | employees  | system_ops | CREATE
      test_roles    | public      | employees  | system_ops | SELECT
    (4 rows)
    ~~~

12. Now switch back to the `root` user to test more of the SQL statements related to roles. Use `\q` or `ctrl-d` to exit the interactive shell, and then open the shell again as the `root` user:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

13. As the `root` user, revoke privileges and then drop the `system_ops` role:

    {% include copy-clipboard.html %}
    ~~~ sql
    > REVOKE ALL ON DATABASE test_roles FROM system_ops;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW GRANTS ON DATABASE test_roles;
    ~~~
    ~~~
      database_name |    schema_name     | grantee | privilege_type
    +---------------+--------------------+---------+----------------+
      test_roles    | crdb_internal      | admin   | ALL
      test_roles    | crdb_internal      | root    | ALL
      test_roles    | information_schema | admin   | ALL
      test_roles    | information_schema | root    | ALL
      test_roles    | pg_catalog         | admin   | ALL
      test_roles    | pg_catalog         | root    | ALL
      test_roles    | public             | admin   | ALL
      test_roles    | public             | root    | ALL
    (8 rows)
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > REVOKE ALL ON TABLE test_roles.* FROM system_ops;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW GRANTS ON TABLE test_roles.*;
    ~~~
    ~~~
      database_name | schema_name | table_name | grantee | privilege_type
    +---------------+-------------+------------+---------+----------------+
      test_roles    | public      | employees  | admin   | ALL
      test_roles    | public      | employees  | root    | ALL
    (2 rows)
    ~~~

    {{site.data.alerts.callout_info}}
    All of a role or user's privileges must be revoked before it can be dropped.
    {{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~ sql
    > DROP ROLE system_ops;
    ~~~

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
- [`GRANT <roles>` (Enterprise)](grant-roles.html)
- [`REVOKE <privileges>`](revoke.html)
- [`REVOKE <roles>` (Enterprise)](revoke-roles.html)
- [`SHOW GRANTS`](show-grants.html)
