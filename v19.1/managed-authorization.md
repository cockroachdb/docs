---
title: Authorization
summary: Learn about the authorization features for Managed CockroachDB clusters.
toc: true
build_for: [managed]
---

Managed CockroachDB supports network authorization and user authorization.

## Network authorization

Managed CockroachDB requires you to authorize the networks that can access the cluster. This helps prevent denial-of-service and brute force password attacks.

Authorize your application server’s network and your local machine’s network by adding the IP addresses in the CIDR notation using the [Networking page](managed-connect-to-your-cluster.html#authorize-your-network). If you change your location, you will need to authorize the new location’s network, else the connection from that network will be rejected.

{{site.data.alerts.callout_info}}
While developing and testing your application, you may whitelist `0.0.0.0/0`, which allows all networks. However, before moving into production, make sure you delete the `0.0.0.0/0` network since it allows anybody who uses your password to reach the CockroachDB nodes.
{{site.data.alerts.end}}

## User authorization

By default, a new SQL user created using the Console is assigned to the `admin` role. An `admin` SQL user has full [privileges](authorization.html#assign-privileges) for all databases and tables in your cluster. This user can also create additional users and grant them appropriate privileges.

### Before you begin

Make sure you have already [connected to the cluster](managed-connect-to-your-cluster.html) with your `admin` SQL user.

#### Create a SQL user

- [Use the Console](#use-the-console)
- [Use the CockroachDB SQL client](#use-the-cockroachdb-sql-client)

#### Use the Console

Once you are [logged in](managed-sign-up-for-a-cluster.html#sign-in), you can use the Console to create a new user:

1. Navigate to your cluster's **SQL Users** page.
2. Click the **Add User** button in the top right corner.

    The **Add User** modal displays.

    <img src="{{ 'images/v19.1/managed/add-user-modal.png' | relative_url }}" alt="Add user" style="border:1px solid #eee;max-width:100%" />

3. Enter a **Username**.
4. Enter and confirm the **Password**.
5. Click **Create**.

    Currently, all new users are created with full privileges. For more information and to change the default settings, see [Granting privileges](#granting-privileges) and [Using roles](#using-roles).

#### Use the CockroachDB SQL client

Once you have [connected to the cluster's SQL client](managed-connect-to-your-cluster.html#use-the-cockroachdb-sql-client), you can create a new user.

To create a new user, use the [`CREATE USER ... WITH PASSWORD`](create-user.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER <username> WITH PASSWORD '<password>';
~~~

{{site.data.alerts.callout_info}}
Be sure to create a password for each new user. Without a password, a user cannot connect to the cluster or access the admin UI. To add or change a password for a user, use the [`ALTER USER`](alter-user.html) statement.
{{site.data.alerts.end}}

### Granting privileges

Access to the data in your cluster is controlled by [privileges](authorization.html#assign-privileges). When a user connects to a database, either via the CockroachDB SQL client or a Postgres driver or ORM, CockroachDB checks the user's privileges for each statement executed. If the user does not have sufficient privileges for a statement, CockroachDB returns an error.

To grant a user privileges for specific databases and tables in your cluster, use the [`GRANT`](grant.html) statement. For example, to assign a user all privileges for all tables in a database:

{% include copy-clipboard.html %}
~~~ sql
> GRANT ALL ON <database> TO <user>;
~~~

To assign a user more limited privileges for one table in a database:

{% include copy-clipboard.html %}
~~~ sql
> GRANT SELECT, INSERT ON <database>.<table> TO <user>;
~~~

For more details, see [Privileges](authorization.html#assign-privileges) and [`GRANT`](grant.html).

### Managing SQL users

- To change a user's password, use the [`ALTER USER`](alter-user.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER USER <user> WITH PASSWORD '<new password>';
    ~~~

- To list all the users in your cluster, use the [`SHOW USERS`](show-users.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW USERS;
    ~~~

- To remove a user, use the [`DROP USER`](drop-user.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > DROP USER <user>;
    ~~~

    {{site.data.alerts.callout_info}}
    All of a user's privileges must be [revoked](#managing-privileges) before the user can be dropped.
    {{site.data.alerts.end}}

### Managing privileges

- To show privileges granted to a user, use the [`SHOW GRANTS`](show-grants.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW GRANTS ON DATABASE <database> FOR <user>;
    ~~~

- To revoke privileges from a user, use the [`REVOKE`](revoke.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > REVOKE INSERT ON <database>.<table> FROM <user>;
    ~~~

### Using roles

Role-based access control is an Enterprise feature available to all managed clusters that lets you simplify how you manage privileges. In essence, a role is a group containing any number of other roles and users as members. You can assign privileges to a role, and all direct and indirect members of the role will inherit the privileges.

- To create a role, use the [`CREATE ROLE`](create-role.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE ROLE <role>;
    ~~~

- To grant privileges to a role, use the [`GRANT <privilege>`](grant.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT <privilege> ON <database> TO <role>;
    ~~~

- To add a user (or another role) to a role, use the [`GRANT <role>`](grant-roles.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT <role> TO <user or role>;
    ~~~

- To revoke privileges from a role, use the [`REVOKE <privilege>`](revoke.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > REVOKE INSERT ON <database>.<table> FROM <role>;
    ~~~

- To remove a user (or another role) from a role, use the [`REVOKE <role>`](revoke-roles.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > REVOKE <role> FROM <user or role>;
    ~~~

- To list all roles in your cluster, use the [`SHOW ROLES`](show-roles.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW ROLES;
    ~~~

- To remove a role, use the [`DROP ROLE`](drop-role.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > DROP ROLE <role>;
    ~~~

    {{site.data.alerts.callout_info}}
    All of a role's privileges must be [revoked](#managing-privileges) before the user can be dropped.
    {{site.data.alerts.end}}

## See also

- [Client Connection Parameters](connection-parameters.html)
- [Connect to Your Managed Cluster](managed-connect-to-your-cluster.html)
