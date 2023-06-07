---
title: Manage Roles
summary: Roles are SQL groups that contain any number of users and roles as members.
toc: true
---

<span class="version-tag">New in v2.0:</span> Roles are SQL groups that contain any number of users and roles as members. To create and manage your cluster's roles, use the following statements:

- [`CREATE ROLE` (Enterprise)](create-role.html)
- [`DROP ROLE` (Enterprise)](drop-role.html)
- [`GRANT <roles>` (Enterprise)](grant-roles.html)
- [`REVOKE <roles>` (Enterprise)](revoke-roles.html)
- [`GRANT <privileges>`](grant.html)
- [`REVOKE <privileges>`](revoke.html)
- [`SHOW ROLES`](show-roles.html)
- [`SHOW GRANTS`](show-grants.html)


## Terminology

To get started, basic role terminology is outlined below:

Term | Description
-----|------------
Role | A group containing any number of [users](create-and-manage-users.html) or other roles.
Role admin | A member of the role that's allowed to modify role membership. To create a role admin, use [`WITH ADMIN OPTION`](grant-roles.html#grant-the-admin-option).
Superuser / Admin | A member of the `admin` role. Only superusers can [`CREATE ROLE`](create-role.html) or [`DROP ROLE`](drop-role.html). The `admin` role is created by default and cannot be dropped.
`root` | A user that exists by default as a member of the `admin` role. The `root` user must always be a member of the `admin` role.
Inherit | The behavior that grants a role's privileges to its members.
Direct member | A user or role that is an immediate member of the role.<br><br>Example: `A` is a member of `B`.
Indirect member | A user or role that is a member of the role by association. <br><br>Example: `A` is a member of `C` ... is a member of `B` where "..." is an arbitrary number of memberships.

## Example

For the purpose of this example, you need:

- An [enterprise license](enterprise-licensing.html)
- One CockroachDB node running in insecure mode:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=roles \
    --host=localhost
    ~~~

In a new terminal, as the `root` user, use the [`cockroach user`](create-and-manage-users.html) command to create a new user, `maxroach`:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach user set maxroach --insecure
~~~

As the `root` user, open the [built-in SQL client](use-the-built-in-sql-client.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure
~~~

Create a database and set it as the default:

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE test_roles;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SET DATABASE = test_roles;
~~~

Now, let's [create a role](create-role.html):

{% include copy-clipboard.html %}
~~~ sql
> CREATE ROLE system_ops;
~~~

See what roles are in our databases:

{% include copy-clipboard.html %}
~~~ sql
> SHOW ROLES;
~~~
~~~
+------------+
|  rolename  |
+------------+
| admin      |
| system_ops |
+------------+
~~~

Next, grant privileges to the `system_ops` role you created:

{% include copy-clipboard.html %}
~~~ sql
> GRANT CREATE, SELECT ON DATABASE test_roles TO system_ops;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON DATABASE test_roles;
~~~
~~~
+------------+--------------------+------------+------------+
|  Database  |       Schema       |    User    | Privileges |
+------------+--------------------+------------+------------+
| test_roles | crdb_internal      | admin      | ALL        |
| test_roles | crdb_internal      | root       | ALL        |
| test_roles | crdb_internal      | system_ops | CREATE     |
| test_roles | crdb_internal      | system_ops | SELECT     |
| test_roles | information_schema | admin      | ALL        |
| test_roles | information_schema | root       | ALL        |
| test_roles | information_schema | system_ops | CREATE     |
| test_roles | information_schema | system_ops | SELECT     |
| test_roles | pg_catalog         | admin      | ALL        |
| test_roles | pg_catalog         | root       | ALL        |
| test_roles | pg_catalog         | system_ops | CREATE     |
| test_roles | pg_catalog         | system_ops | SELECT     |
| test_roles | public             | admin      | ALL        |
| test_roles | public             | root       | ALL        |
| test_roles | public             | system_ops | CREATE     |
| test_roles | public             | system_ops | SELECT     |
+------------+--------------------+------------+------------+
~~~

Now, add the `maxroach` user to the `system_ops` role:

{% include copy-clipboard.html %}
~~~ sql
> GRANT system_ops TO maxroach;
~~~

To test the privileges you just added to the `system_ops` role, use `\q` or `ctrl-d` to exit the interactive shell, and then open the shell again as the `maxroach` user (who is a member of the `system_ops` role):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --user=maxroach --database=test_roles --insecure
~~~

Create a table:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE employees (
    id UUID DEFAULT uuid_v4()::UUID PRIMARY KEY,
    profile JSONB
  );
~~~

You were able to create the table because `maxroach` has `CREATE` privileges. Now, try to drop the table:

{% include copy-clipboard.html %}
~~~ sql
> DROP TABLE employees;
~~~
~~~
pq: user maxroach does not have DROP privilege on relation employees
~~~

You cannot drop the table because your current user (`maxroach`) is a member of the `system_ops` role, which doesn't have `DROP` privileges.

`maxroach` has `CREATE` and `SELECT` privileges, so try a `SHOW` statement:

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE employees;
~~~
~~~
+------------+--------+-----------+------------+------------+
|  Database  | Schema |   Table   |    User    | Privileges |
+------------+--------+-----------+------------+------------+
| test_roles | public | employees | admin      | ALL        |
| test_roles | public | employees | root       | ALL        |
| test_roles | public | employees | system_ops | CREATE     |
| test_roles | public | employees | system_ops | SELECT     |
+------------+--------+-----------+------------+------------+
~~~

Let's switch back to the `root` user to test more of the SQL statements related to roles. Log out of the `maxroach` user by exiting the interactive shell. To exit the interactive shell, use `\q` or `ctrl-d`.

Open `cockroach sql` as the `root` user:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure
~~~

Now that you're logged in as the `root` user, revoke privileges and then drop the `system_ops` role.

{% include copy-clipboard.html %}
~~~ sql
> REVOKE ALL ON DATABASE test_roles FROM system_ops;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON DATABASE test_roles;
~~~
~~~
+------------+--------------------+-------+------------+
|  Database  |       Schema       | User  | Privileges |
+------------+--------------------+-------+------------+
| test_roles | crdb_internal      | admin | ALL        |
| test_roles | crdb_internal      | root  | ALL        |
| test_roles | information_schema | admin | ALL        |
| test_roles | information_schema | root  | ALL        |
| test_roles | pg_catalog         | admin | ALL        |
| test_roles | pg_catalog         | root  | ALL        |
| test_roles | public             | admin | ALL        |
| test_roles | public             | root  | ALL        |
+------------+--------------------+-------+------------+
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
+------------+--------+-----------+-------+------------+
|  Database  | Schema |   Table   | User  | Privileges |
+------------+--------+-----------+-------+------------+
| test_roles | public | employees | admin | ALL        |
| test_roles | public | employees | root  | ALL        |
+------------+--------+-----------+-------+------------+
~~~

{{site.data.alerts.callout_info}}All of a role or user's privileges must be revoked before it can be dropped.{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
> DROP ROLE system_ops;
~~~

## See Also

- [`CREATE ROLE`](create-role.html)
- [`DROP ROLE`](drop-role.html)
- [`SHOW ROLES`](show-roles.html)
- [`GRANT <privileges>`](grant.html)
- [`GRANT <roles>` (Enterprise)](grant-roles.html)
- [`REVOKE <privileges>`](revoke.html)
- [`REVOKE <roles>` (Enterprise)](revoke-roles.html)
- [`SHOW GRANTS`](show-grants.html)
- [Manage Users](create-and-manage-users.html)
- [Privileges](privileges.html)
- [Other Cockroach Commands](cockroach-commands.html)
