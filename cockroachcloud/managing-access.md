---
title: Managing Access in CockroachDB Cloud
summary: Learn how to manage the lifecycle of CockroachDB Cloud organization users and roles.
toc: true
docs_area: manage
---

This page details procedures for managing {{ site.data.products.db }} access to {{ site.data.products.db }}.
Before proceeding, it is recommended to review the concepts related to {{ site.data.products.db }} model, which are detailed in [{{ site.data.products.db }} Access Management Overview and FAQ](authorization.html).

**Contents**:

- Adding users to your organization, by creating them or inviting them from another organization.
- Managing organization-level users roles.
- Granting organization users access to clusters through cluster roles.
- Managing the privileges associated with cluster roles.

{{ site.data.products.db }} requires you to create SQL users to access the cluster.

The {{ site.data.products.db }} console **Access** page allows organization administrators to manage users, service accounts, and the roles granted to them. To view the **Access** page, [log in](https://cockroachlabs.cloud/), select the correct organization from the organizations tab, and either click **Access** or visit `https://cockroachlabs.cloud/access`.

{% include cockroachcloud/prefer-sso.md %}

## Manage your organizations

An **organization** allows you to manage your clusters under a shared [billing](billing-management.html) account and collaborate with team members. You can belong to multiple organizations.

To switch between the organizations:

1. [Log in](https://cockroachlabs.cloud/).
1. From the drop-down box in the top-right corner, select the organization you want to access.

The settings and information about the organization are found on the **Settings** page. The organization ID and organization label used by the `ccloud` CLI are listed under **Organization settings**.

## Manage an organization's users
### Invite Team Members to an organization
<!-- change for FGAC ??? -->
As an org admin, you can invite Team Members to {{ site.data.products.db }}. To invite Team Members:

1. If you are a member of multiple organizations, navigate to the organization to which you want to invite a Team Member. You can navigate to the correct organization by using the drop-down box in the top-right corner.
1. On the **Access** page, click **Add Team Member**.
1. In the **Email Address** field, enter the email address of the team member you want to invite.
1. From the **Role** dropdown list, assign either the **Developer** role or the **Admin** role.
1. (Optional) Click **Add another** to invite another team member.
1. Click **Invite**.

#### Change a Team Member's role

<!-- change for FGAC ??? -->
1. On the **Access** page, locate the Team Member's details whose role you want to change.
1. In the **Action** column, click the three dots to view the allowed actions.
1. If the Team Member is a Developer, click **Change to Admin** to grant them Admin access. If the Team Member is an Admin, click **Change to Developer** to grant them only Developer access.

{{site.data.alerts.callout_info}}
As an org admin, you can change your own access to a Developer role; however, you will not be able to change yourself back to the Admin role. If you are the only Team Member with org admin access, you will not be allowed to change your role until you assign another Team Member to be the org admin.
{{site.data.alerts.end}}

#### Delete a Team Member

1. On the **Access** page, locate the Team Member you want to delete.
1. In the **Action** column, click the three dots to view the allowed actions.
1. Click **Delete Member**.
1. On the confirmation window, click **Delete**.

#### Revoke a pending invite

1. On the **Access** page, locate the Team Member's details whose pending invite you want to revoke.
1. In the **Action** column, click the three dots to view the allowed actions.
1. Click **Revoke Invite**.

#### Delete an email address

This is not currently available through the Console. To remove an email address from your account, [contact Support](https://support.cockroachlabs.com).

### Delete an organization

{{site.data.alerts.callout_danger}}
Deleting an organization will delete all clusters and user data within the organization. This action cannot be reversed. To delete a single cluster instead, see [Cluster Management](cluster-management.html#delete-cluster).
{{site.data.alerts.end}}

If you are sure you want to delete the organization, proceed with the following steps:

1. Navigate to the **Settings** page for the organization you want to delete.
1. Click **Delete**.
1. Enter the name of the organization.
1. Click **Delete**.

    You will be automatically logged out of your account.

## Manage service accounts

### Create a service account

1.  On the **Access** page, select the **Service Accounts** tab.
1. Click **Create Service Account**.
1. In the **Create service account** dialog:
    1. Enter the **Account name**.
    1. (Optional) Enter a **Description** of the service account.
    1. Set the **Permissions** of the service account.

        Granting `ADMIN` permissions allows the service account full authorization for the organization, where the service account can create, modify, and delete clusters.

        The `CREATE` permission allows the service account to create new clusters within the organization.

        The `DELETE` permission allows the service account to delete clusters within the organization.

        The `EDIT` permission allows the service account to modify clusters within the organization.

        The `READ` permission allows the service account to get details about clusters within the organization.

    1. Click **Create**.

1. [Create an API key](#create-api-keys) for the newly created service account, or click **Skip** to go back to the Service Accounts table.

### Modify a service account

To modify the name, description, or permissions of a service account:

1. Click the **Action** button for the service account name in the **Service Accounts** table.
1. Select **Edit**.
1. In the **Edit service account** dialog, modify the name, description, or permissions for the service account.
1. Click **Save changes**.

### API access

Each service account can have one or more API keys. API keys are used to authenticate and authorize service accounts when using the API. All API keys created by the account are listed under **API Access**.

We recommend creating service accounts with the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege), and giving each application that accesses the API its own API key. This allows fine-grained permission and API key access to the cluster.

#### Create API keys

To create an API key:

1. On the **Access** page, select the **Service Accounts** tab.
1. Click the service account for which you want to create an API key to bring up the **Service Account Details** page.
1. Click **Create API Key**.
1. Enter the **API key name** and click **Create**. The name should identify how the API key will be used. For example, you could name your API key for the application that will use the key.
1. Copy the **Secret key** and store it in a secure location. There is a **Copy** button to the right of the displayed secret key that will copy the secret key to your OS clipboard.

    The secret key contains the API key and secret. It should never be shared or publicly accessible. Anyone with the secret key can use the API with the permissions of the service account.

    {{site.data.alerts.callout_danger}}
    The secret key will not be available after closing the **Create API key** dialog. If you have lost your secret key, you should [delete the API key](#delete-api-keys) and create a new one.
    {{site.data.alerts.end}}

1. Click **Done**.

#### Delete API keys

To delete an API key associated with a service account:

1. On the **Access** page, select the **Service Accounts** tab.
1. Click the service account for which you want to create an API key to bring up the **Service Account Details** page.
1. Click the **Action** button for the API key ID in the **API Access** table.
1. Select **Delete**.
1. In the **Delete API key** dialog enter the name of the service account to confirm the delete operation, then click **Delete**.

#### Edit API key names

To change the API key name for an existing API key:

1. On the **Access** page, select the **Service Accounts** tab.
1. Click the service account for which you want to create an API key to bring up the **Service Account Details** page.
1. Find the API key ID in the **API Access** table.
1. Click the **Action** button.
1. Select **Edit**.
1. In the **Edit API key name** dialog modify the API key name and click **Save changes**.

## Manage SQL users on a cluster

- [View all users in your cluster](#view-all-users-in-your-cluster)
- [Change a user's password](#change-a-users-password)
- [Remove a user](#remove-a-user)

### Create a SQL user

{{site.data.alerts.callout_danger}}
By default, a new SQL user created by a [org admin](authorization.html#org-administrator-legacy) is granted the `admin` role. An `admin` SQL user has full privileges for all databases and tables in the cluster, and can create additional SQL users and manage their privileges.
When possible, it is best practice to limit each user's privileges to the minimum necessary for their tasks, in keeping with the [Principle of Least Privilege (PoLP)](https://en.wikipedia.org/wiki/Principle_of_least_privilege).
{{site.data.alerts.end}}

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="console">Use the {{ site.data.products.db }} Console</button>
  <button class="filter-button page-level" data-scope="client">Use the SQL client</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="console">
{% include cockroachcloud/cockroachcloud-ask-admin.md %}

Once you are [logged in](https://cockroachlabs.cloud/), you can use the Console to create a new user:

1. Navigate to your cluster's **SQL Users** page in the **Security** section of the left side navigation.
1. Click the **Add User** button in the top right corner.

    The **Create SQL user** modal displays.

1. Enter a **Username**.
1. Click **Generate & save password**.
1. Copy the generated password and save it in a secure location.

    Currently, all new users are created with full privileges. For more information and to change the default settings, see [Grant privileges](#grant-privileges) and [Use roles to manage access](#use-roles-to-manage-access).
</section>

<section class="filter-content" markdown="1" data-scope="client">
Once you have [connected to the cluster's SQL client](connect-to-your-cluster.html), you can create a new user.

To create a new user, use the [`CREATE USER ... WITH PASSWORD`](../{{site.current_cloud_version}}/create-user.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE USER <username> WITH PASSWORD '<password>';
~~~

{{site.data.alerts.callout_info}}
Be sure to create a password for each new user. Without a password, a user cannot connect to the cluster or access the DB Console. To add or change a password for a user, use the [`ALTER USER`](../{{site.current_cloud_version}}/alter-user.html) statement.
{{site.data.alerts.end}}
</section>

### View all users in your cluster

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="console">Use the {{ site.data.products.db }} Console</button>
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
To list all the users in your cluster, use the [`SHOW USERS`](../{{site.current_cloud_version}}/show-users.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW USERS;
~~~
</section>

### Change a users password

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="console">Use the {{ site.data.products.db }} Console</button>
  <button class="filter-button page-level" data-scope="client">Use the SQL client</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="console">

<!-- change for FGAC ??? -->
{{site.data.alerts.callout_info}}
Only users with the [org admin](authorization.html#org-administrator-legacy), or [cluster admin](authorization.html#cluster-administrator) can change a user's password. If you do not the required permissions, ask your cluster or org admin to change the password. To find out who your admin is, [log in](https://cockroachlabs.cloud/) and navigate to **Cluster Overview** > **Access**.
{{site.data.alerts.end}}

To change a user's password:

1. Navigate to the **SQL Users** page.
1. In the row of the user whose password needs to be changed, click the **...** button.

    <img src="{{ 'images/cockroachcloud/sql-users-actions.png' | relative_url }}" alt="Change SQL password" style="border:1px solid #eee;max-width:100%" />

1. From the dropdown, select **Change Password**.
1. Click **Generate & save password**.
1. Copy the generated password and save it in a secure location.

</section>

<section class="filter-content" markdown="1" data-scope="client">
To change a user's password, use the [`ALTER USER`](../{{site.current_cloud_version}}/alter-user.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER USER <user> WITH PASSWORD '<new password>';
~~~
</section>

### Remove a user

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="console">Use the {{ site.data.products.db }} Console</button>
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
To remove a user, use the [`DROP USER`](../{{site.current_cloud_version}}/drop-user.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP USER <user>;
~~~
</section>

{{site.data.alerts.callout_info}}
All of a user's privileges must be [revoked](#revoke-a-users-privileges) before the user can be dropped.
{{site.data.alerts.end}}

### Grant privileges

Access to the data in your cluster is controlled by [privileges](../{{site.current_cloud_version}}/security-reference/authorization.html#managing-privileges). When a user connects to a database, either via the CockroachDB SQL client or a PostgreSQL driver or ORM, CockroachDB checks the user's privileges for each statement executed. If the user does not have sufficient privileges for a statement, CockroachDB returns an error.

To grant a user privileges for specific databases and tables in your cluster, use the [`GRANT`](../{{site.current_cloud_version}}/grant.html) statement. For example, to assign a user all privileges for all tables in a database:

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT ALL ON DATABASE <database> TO <user>;
~~~

To assign a user more limited privileges for one table in a database:

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT SELECT, INSERT ON TABLE <database>.<table> TO <user>;
~~~

For more details, see [Privileges](../{{site.current_cloud_version}}/security-reference/authorization.html#managing-privileges) and [`GRANT`](../{{site.current_cloud_version}}/grant.html).

### View a user's privileges

To show privileges granted to a user, use the [`SHOW GRANTS`](../{{site.current_cloud_version}}/show-grants.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON DATABASE <database> FOR <user>;
~~~

### Revoke a user's privileges

To revoke privileges from a user, use the [`REVOKE`](../{{site.current_cloud_version}}/revoke.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> REVOKE INSERT ON TABLE <database>.<table> FROM <user>;
~~~

### Use roles to manage access

Role-based access control lets you simplify how you manage privileges. In essence, a role is a group containing any number of other roles and users as members. You can assign privileges to a role, and all direct and indirect members of the role will inherit the privileges.

Once you have [connected to the cluster](connect-to-your-cluster.html), you can set up roles:

- To create a role, use the [`CREATE ROLE`](../{{site.current_cloud_version}}/create-role.html) statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE ROLE <role>;
    ~~~

- To grant privileges to a role, use the [`GRANT <privilege>`](../{{site.current_cloud_version}}/grant.html) statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > GRANT <privilege> ON DATABASE <database> TO <role>;
    ~~~

- To add a user (or another role) to a role, use the [`GRANT <role>`](../{{site.current_cloud_version}}/grant.html) statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > GRANT <role> TO <user or role>;
    ~~~

- To revoke privileges from a role, use the [`REVOKE <privilege>`](../{{site.current_cloud_version}}/revoke.html) statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > REVOKE INSERT ON TABLE <database>.<table> FROM <role>;
    ~~~

- To remove a user (or another role) from a role, use the [`REVOKE <role>`](../{{site.current_cloud_version}}/revoke.html) statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > REVOKE <role> FROM <user or role>;
    ~~~

- To list all roles in your cluster, use the [`SHOW ROLES`](../{{site.current_cloud_version}}/show-roles.html) statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW ROLES;
    ~~~

- To remove a role, use the [`DROP ROLE`](../{{site.current_cloud_version}}/drop-role.html) statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > DROP ROLE <role>;
    ~~~

    {{site.data.alerts.callout_info}}
    All of a role's privileges must be [revoked](#revoke-a-users-privileges) before the role can be dropped.
    {{site.data.alerts.end}}

## See also

- [Client Connection Parameters](../{{site.current_cloud_version}}/connection-parameters.html)
- [Connect to Your {{ site.data.products.dedicated }} Cluster](connect-to-your-cluster.html)
