---
title: User Authorization
summary: Learn about the user authorization features for CockroachCloud CockroachDB clusters.
toc: true
redirect_from:
- ../stable/cockroachcloud-authorization.html
---

CockroachCloud requires you to create SQL users to access the cluster.

By default, a new SQL user created using a [Console Admin](console-access-management.html#console-admin) is assigned to the `admin` role. An `admin` SQL user has full [privileges](../v20.1/authorization.html#assign-privileges) for all databases and tables in your cluster. This user can also create additional users and grant them appropriate privileges.

### Before you begin

Make sure you have already [connected to the cluster](connect-to-your-cluster.html) with your `admin` SQL user.

#### Create a SQL user

- [Use the Console](#use-the-console)
- [Use the CockroachDB SQL client](#use-the-cockroachdb-sql-client)

#### Use the Console

Once you are [logged in](https://cockroachlabs.cloud/), you can use the Console to create a new user:

{% include cockroachcloud/create-a-sql-user.md %}

#### Use the CockroachDB SQL client

Once you have [connected to the cluster's SQL client](connect-to-your-cluster.html#use-the-cockroachdb-sql-client), you can create a new user.

To create a new user, use the [`CREATE USER ... WITH PASSWORD`](../stable/create-user.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER <username> WITH PASSWORD '<password>';
~~~

{{site.data.alerts.callout_info}}
Be sure to create a password for each new user. Without a password, a user cannot connect to the cluster or access the DB Console. To add or change a password for a user, use the [`ALTER USER`](../stable/alter-user.html) statement.
{{site.data.alerts.end}}

### Granting privileges

Access to the data in your cluster is controlled by [privileges](../v20.1/authorization.html#assign-privileges). When a user connects to a database, either via the CockroachDB SQL client or a Postgres driver or ORM, CockroachDB checks the user's privileges for each statement executed. If the user does not have sufficient privileges for a statement, CockroachDB returns an error.

To grant a user privileges for specific databases and tables in your cluster, use the [`GRANT`](../stable/grant.html) statement. For example, to assign a user all privileges for all tables in a database:

{% include copy-clipboard.html %}
~~~ sql
> GRANT ALL ON <database> TO <user>;
~~~

To assign a user more limited privileges for one table in a database:

{% include copy-clipboard.html %}
~~~ sql
> GRANT SELECT, INSERT ON <database>.<table> TO <user>;
~~~

For more details, see [Privileges](../v20.1/authorization.html#assign-privileges) and [`GRANT`](../stable/grant.html).

### Managing SQL users

- To change a user's password, use the [`ALTER USER`](../stable/alter-user.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER USER <user> WITH PASSWORD '<new password>';
    ~~~

- To list all the users in your cluster, use the [`SHOW USERS`](../stable/show-users.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW USERS;
    ~~~

- To remove a user, use the [`DROP USER`](../stable/drop-user.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > DROP USER <user>;
    ~~~

    {{site.data.alerts.callout_info}}
    All of a user's privileges must be [revoked](#managing-privileges) before the user can be dropped.
    {{site.data.alerts.end}}

### Managing privileges

- To show privileges granted to a user, use the [`SHOW GRANTS`](../stable/show-grants.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW GRANTS ON DATABASE <database> FOR <user>;
    ~~~

- To revoke privileges from a user, use the [`REVOKE`](../stable/revoke.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > REVOKE INSERT ON <database>.<table> FROM <user>;
    ~~~

### Using roles

Role-based access control lets you simplify how you manage privileges. In essence, a role is a group containing any number of other roles and users as members. You can assign privileges to a role, and all direct and indirect members of the role will inherit the privileges.

- To create a role, use the [`CREATE ROLE`](../stable/create-role.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE ROLE <role>;
    ~~~

- To grant privileges to a role, use the [`GRANT <privilege>`](../stable/grant.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT <privilege> ON <database> TO <role>;
    ~~~

- To add a user (or another role) to a role, use the [`GRANT <role>`](../stable/grant-roles.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT <role> TO <user or role>;
    ~~~

- To revoke privileges from a role, use the [`REVOKE <privilege>`](../stable/revoke.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > REVOKE INSERT ON <database>.<table> FROM <role>;
    ~~~

- To remove a user (or another role) from a role, use the [`REVOKE <role>`](../stable/revoke-roles.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > REVOKE <role> FROM <user or role>;
    ~~~

- To list all roles in your cluster, use the [`SHOW ROLES`](../stable/show-roles.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW ROLES;
    ~~~

- To remove a role, use the [`DROP ROLE`](../stable/drop-role.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > DROP ROLE <role>;
    ~~~

    {{site.data.alerts.callout_info}}
    All of a role's privileges must be [revoked](#managing-privileges) before the user can be dropped.
    {{site.data.alerts.end}}

## See also

- [Client Connection Parameters](../stable/connection-parameters.html)
- [Connect to Your CockroachCloud Cluster](connect-to-your-cluster.html)
