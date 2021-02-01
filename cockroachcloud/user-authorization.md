---
title: User Authorization
summary: Learn about the user authorization features for CockroachCloud CockroachDB clusters.
toc: true
redirect_from:
- ../stable/cockroachcloud-authorization.html
---

CockroachCloud requires you to create SQL users to access the cluster.

By default, a new SQL user created using a [Console Admin](console-access-management.html#console-admin) is assigned to the `admin` role. An `admin` SQL user has full [privileges](../v20.2/authorization.html#assign-privileges) for all databases and tables in your cluster. This user can also create additional users and grant them appropriate privileges.

## Create a SQL user

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="console">Use the CockroachCloud Console</button>
  <button class="filter-button page-level" data-scope="client">Use the SQL client</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="console">
{% include cockroachcloud/cockroachcloud-ask-admin.md %}

Once you are [logged in](https://cockroachlabs.cloud/), you can use the Console to create a new user:

1. Navigate to your cluster's **SQL Users** page.
2. Click the **Add User** button in the top right corner.

    The **Add User** modal displays.

3. Enter a **Username**.
4. Enter and confirm the **Password**.
5. Click **Create**.

    Currently, all new users are created with full privileges. For more information and to change the default settings, see [Grant privileges](#grant-privileges) and [Use roles](#use-roles).
</section>

<section class="filter-content" markdown="1" data-scope="client">
Once you have [connected to the cluster's SQL client](connect-to-your-cluster.html), you can create a new user.

To create a new user, use the [`CREATE USER ... WITH PASSWORD`](../stable/create-user.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER <username> WITH PASSWORD '<password>';
~~~

{{site.data.alerts.callout_info}}
Be sure to create a password for each new user. Without a password, a user cannot connect to the cluster or access the DB Console. To add or change a password for a user, use the [`ALTER USER`](../stable/alter-user.html) statement.
{{site.data.alerts.end}}
</section>

## Manage SQL users

- [View all users in your cluster](#view-all-users-in-your-cluster)
- [Change a user's password](#change-a-users-password)
- [Remove a user](#remove-a-user)

### View all users in your cluster

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="console">Use the CockroachCloud Console</button>
  <button class="filter-button page-level" data-scope="client">Use the SQL client</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="console">
To view a list of all of the users in your cluster, navigate to the **SQL Users** page.

<img src="{{ 'images/cockroachcloud/sql-users.png' | relative_url }}" alt="SQL Users page" style="border:1px solid #eee;max-width:100%" />

On the **SQL Users** page, you can do the following:

- [Create a user](#create-a-sql-user)
- [Change a user's password](#change-a-users-password)
- [Remove a user](#remove-a-user)

</section>

<section class="filter-content" markdown="1" data-scope="client">
To list all the users in your cluster, use the [`SHOW USERS`](../stable/show-users.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> SHOW USERS;
~~~
</section>

### Change a user's password

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="console">Use the CockroachCloud Console</button>
  <button class="filter-button page-level" data-scope="client">Use the SQL client</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="console">
{{site.data.alerts.callout_info}}
Only [Console Admins](console-access-management.html#console-admin) can change a user's password. If you are a [Developer](console-access-management.html#developer), you need to ask your Console Admin to change the password. To find out who's your Console Admin, [log in](https://cockroachlabs.cloud/) and navigate to **Cluster Overview** > **Access**.
{{site.data.alerts.end}}

To change a user's password:

1. Navigate to the **SQL Users** page.
1. In the row of the user whose password needs to be changed, click the **...** button.

    <img src="{{ 'images/cockroachcloud/sql-users-actions.png' | relative_url }}" alt="Change SQL password" style="border:1px solid #eee;max-width:100%" />

1. From the dropdown, select **Change Password**.
1. In the **New Password** field, enter the new password.

    The password must be at least 12 characters long.

1. Click **Save**.
</section>

<section class="filter-content" markdown="1" data-scope="client">
To change a user's password, use the [`ALTER USER`](../stable/alter-user.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> ALTER USER <user> WITH PASSWORD '<new password>';
~~~
</section>

### Remove a user

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="console">Use the CockroachCloud Console</button>
  <button class="filter-button page-level" data-scope="client">Use the SQL client</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="console">
To remove a user:

1. Navigate to the **SQL Users** page.
1. In the row of the user you want to remove, click the **...** button.

    <img src="{{ 'images/cockroachcloud/sql-users-actions.png' | relative_url }}" alt="Remove a SQL users" style="border:1px solid #eee;max-width:100%" />

1. From the dropdown, select **Delete SQL User**.
1. Click **Delete**.
</section>

</section>

<section class="filter-content" markdown="1" data-scope="client">
To remove a user, use the [`DROP USER`](../stable/drop-user.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> DROP USER <user>;
~~~
</section>

{{site.data.alerts.callout_info}}
All of a user's privileges must be [revoked](#revoke-a-users-privileges) before the user can be dropped.
{{site.data.alerts.end}}

## Grant privileges

Access to the data in your cluster is controlled by [privileges](../v20.2/authorization.html#assign-privileges). When a user connects to a database, either via the CockroachDB SQL client or a Postgres driver or ORM, CockroachDB checks the user's privileges for each statement executed. If the user does not have sufficient privileges for a statement, CockroachDB returns an error.

To grant a user privileges for specific databases and tables in your cluster, use the [`GRANT`](../stable/grant.html) statement. For example, to assign a user all privileges for all tables in a database:

{% include copy-clipboard.html %}
~~~ sql
> GRANT ALL ON DATABASE <database> TO <user>;
~~~

To assign a user more limited privileges for one table in a database:

{% include copy-clipboard.html %}
~~~ sql
> GRANT SELECT, INSERT ON TABLE <database>.<table> TO <user>;
~~~

For more details, see [Privileges](../v20.2/authorization.html#assign-privileges) and [`GRANT`](../stable/grant.html).

## Manage privileges

- [View a user's privileges](#view-a-users-privileges)
- [Revoke a user's privileges](#revoke-a-users-privileges)

### View a user's privileges

To show privileges granted to a user, use the [`SHOW GRANTS`](../stable/show-grants.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON DATABASE <database> FOR <user>;
~~~

### Revoke a user's privileges

To revoke privileges from a user, use the [`REVOKE`](../stable/revoke.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> REVOKE INSERT ON TABLE <database>.<table> FROM <user>;
~~~

## Use roles

Role-based access control lets you simplify how you manage privileges. In essence, a role is a group containing any number of other roles and users as members. You can assign privileges to a role, and all direct and indirect members of the role will inherit the privileges.

Once you have [connected to the cluster](connect-to-your-cluster.html), you can set up roles:

- To create a role, use the [`CREATE ROLE`](../stable/create-role.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE ROLE <role>;
    ~~~

- To grant privileges to a role, use the [`GRANT <privilege>`](../stable/grant.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT <privilege> ON DATABASE <database> TO <role>;
    ~~~

- To add a user (or another role) to a role, use the [`GRANT <role>`](../stable/grant-roles.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT <role> TO <user or role>;
    ~~~

- To revoke privileges from a role, use the [`REVOKE <privilege>`](../stable/revoke.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > REVOKE INSERT ON TABLE <database>.<table> FROM <role>;
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
    All of a role's privileges must be [revoked](#manage-privileges) before the role can be dropped.
    {{site.data.alerts.end}}

## See also

- [Client Connection Parameters](../stable/connection-parameters.html)
- [Connect to Your CockroachCloud Cluster](connect-to-your-cluster.html)
