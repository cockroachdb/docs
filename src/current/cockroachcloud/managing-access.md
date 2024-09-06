---
title: Manage Users, Roles, and Service Accounts
summary: Learn how to manage the lifecycle of CockroachDB Cloud organization users and roles.
toc: true
docs_area: manage
---

This page details procedures for managing CockroachDB {{ site.data.products.cloud }} access to CockroachDB {{ site.data.products.cloud }}.
Before proceeding, it is recommended to review the concepts related to the two levels of CockroachDB {{ site.data.products.cloud }} access management model (the organization level and the SQL level in a cluster), which are detailed in [CockroachDB {{ site.data.products.cloud }} Access Management Overview and FAQ]({% link cockroachcloud/authorization.md %}).

Access management tasks for the organization level are performed in the CockroachDB {{ site.data.products.cloud }} console **Access Management** page, found at `https://cockroachlabs.cloud/access`. This page allows organization administrators to invite users to the CockroachDB {{ site.data.products.cloud }} organization, create service accounts, and manage the access roles granted to both. Users with Cluster Admin role on a cluster can also manage the access role grants on that cluster. Roles can be granted at different scopes (levels) of the resource hierarchy.

Access management tasks for SQL level in a cluster are a bit distributed. SQL users on particular clusters can be created in the console's 'SQL user' page for a specific cluster, found at `https://cockroachlabs.cloud/cluster/<CLUSTER ID>/users`, or with the `ccloud` command line utility's [`cluster user create`]({% link cockroachcloud/ccloud-get-started.md %}#create-a-sql-user-using-ccloud-cluster-user-create) command, or with a SQL client. However, the SQL roles that govern permissions in the cluster for SQL users must be managed with a SQL client. Furthermore, SQL users created with the console or with `ccloud` utility are granted the `admin` SQL role on the cluster by default; this makes it important from a security perspective to immediately modify this user if needed, revoking the `admin` role and replacing it with a SQL role with privileges required for its task, according to the [principle of least privilege](https://wikipedia.org/wiki/Principle_of_least_privilege).

See [Manage SQL users on a cluster](#manage-sql-users-on-a-cluster)

## Manage your organizations

An **organization** allows you to manage your clusters under a shared [billing]({% link cockroachcloud/billing-management.md %}) account and collaborate with team members. You can belong to multiple organizations, like a personal organization, an enterprise organization for evaluating CockroachDB Cloud, and another enterprise organization with [CockroachDB Cloud credits]({% link cockroachcloud/billing-management.md %}#view-credits-balance) to map to all application clusters.

To switch to a different organization:

1. Log in to the console at `https://cockroachlabs.cloud/` or your organization's custom domain.
1. From the drop-down box in the top-right corner, select the organization you want to access.

The settings and information about the organization are found on the **Information** page. The organization ID and organization label used by the `ccloud` CLI are listed on that page.

## Manage an organization's users
### Invite team members to an organization

An [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) can invite team members to CockroachDB {{ site.data.products.cloud }}. To invite team members:

1. If you are a member of multiple organizations, navigate to the organization to which you want to invite a team member. You can navigate to the correct organization by using the drop-down box in the top-right corner.
1. On the **Access Management** page, under the *Members* tab, click **Invite**.
1. In the **Email Address** field, enter the email address of the team member you want to invite. By default, a user is assigned the [Organization member]({% link cockroachcloud/authorization.md %}#organization-member) role; this default role grants no access. After the user accepts the invitation, an [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) can grant them additional roles.
1. If required, you could invite multiple users at the same time by adding a row per email address using **+ Add Member**.

It is also possible to enable [autoprovisioning]({% link cockroachcloud/cloud-org-sso.md %}#autoprovisioning) for your organization, which removes the need to invite team members.

### Change a team member's role

1. On the **Access Management** page, locate the team member's details whose role you want to change. Note that the **Role** column lists current organization roles granted to each user. See: [Organization User Roles]({% link cockroachcloud/authorization.md %}#organization-user-roles)
1. In the row for the target member, click the three-dots **Action** button and select **Edit Roles**.
1. A number of fine-grained roles can be assigned to a given user. Each role is represented by a row. Each row has a **scope**, which is either **Organization** or the name of a particular cluster. If the role is Cluster Administrator, Cluster Operator, or Cluster Developer, assigning it at the organization scope means that it applies to all clusters in the organization.

    {{site.data.alerts.callout_info}}
    When editing roles for a group in the **Groups** tab, the fields for that group's inherited roles are read-only, because inherited roles cannot be edited directly. Instead, you must either remove the role from the parent group from which it is inherited, or remove the member from the parent group.
    {{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
An [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) can revoke that role from their own user, but cannot subsequently re-grant the administrator role to themselves.
{{site.data.alerts.end}}


### Remove a team member

1. On the **Access Management** page, locate the team member you want to remove.
1. In the **Action** column, click the three dots to view the allowed actions.
1. Click **Remove Member** and confirm.

### Revoke a pending invite

1. On the **Access Management** page, locate the team member's details whose pending invite you want to revoke.
1. In the **Action** column, click the three dots to view the allowed actions.
1. Click **Revoke Invite**.

### Delete an email address

This is not currently available through the Console. To remove an email address from your account, [contact Support](https://support.cockroachlabs.com).

### Delete an organization

{{site.data.alerts.callout_danger}}
Deleting an organization will delete all clusters and user data within the organization. This action cannot be reversed. To delete a single cluster instead, see [Cluster Management]({% link cockroachcloud/cluster-management.md %}#delete-cluster).
{{site.data.alerts.end}}

If you are sure you want to delete the organization, proceed with the following steps:

1. Navigate to the **Information** page for the organization you want to delete.
1. Click **Delete**.
1. Enter the name of the organization.
1. Click **Delete**.

    You will be automatically logged out of your account.

## Manage service accounts

The access management model for service accounts is unified with the [user model](#manage-an-organizations-users). This means that service accounts may have all of the same [access roles]({% link cockroachcloud/authorization.md %}#organization-user-roles). However, service accounts and users still differ in the actions they can perform: only users can access the console, and only service accounts can access the API. The console and API differ in functionality.

### Create a service account

1. On the **Access Management** page, select the **Service Accounts** tab.
1. Click **Create**.
1. Enter a **Account name** and **Description**.
1. Create and export an **API key**.
1. Confirm creation of the service account.

{{site.data.alerts.callout_info}}
Service accounts, like users, are given only the **Org Member** role by default upon creation. This role grants no access in the organization.
{{site.data.alerts.end}}

### Edit roles on a service account

1. On the **Access Management** page, select the **Service Accounts** tab.
1. In the row for the target service account, click, click the three-dots **Action** button and select **Edit Roles**.
1. A number of fine-grained roles can be assigned to a given service account. These are the same [roles that can be assigned to users]({% link cockroachcloud/authorization.md %}#organization-user-roles). Each role is represented by a row. Each row has a **scope**, which is either **Organization** or the name of a particular cluster. If the role is Cluster Administrator, Cluster Operator, or Cluster Developer, assigning it at the organization scope means that it applies to all clusters in the organization.

    The fields for a group's inherited roles are read-only, because inherited roles cannot be edited directly. Instead, you must either remove the role from the parent group from which it is inherited, or remove the member from the parent group.
### API access

Each service account can have one or more API keys. API keys are used to authenticate and authorize service accounts when using the API. All API keys created by the account are listed under **API Access**.

We recommend creating service accounts with the [principle of least privilege](https://wikipedia.org/wiki/Principle_of_least_privilege), and giving each application that accesses the API its own service account and API key. This allows fine-grained access to the cluster.

#### Create API keys

To create an API key:

1. On the **Access Management** page, select the **Service Accounts** tab.
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

1. On the **Access Management** page, select the **Service Accounts** tab.
1. Click the service account for which you want to create an API key to bring up the **Service Account Details** page.
1. Click the **Action** button for the API key ID in the **API Access** table.
1. Select **Delete**.
1. In the **Delete API key** dialog enter the name of the service account to confirm the delete operation, then click **Delete**.

#### Edit API key names

To change the API key name for an existing API key:

1. On the **Access Management** page, select the **Service Accounts** tab.
1. Click the service account for which you want to create an API key to bring up the **Service Account Details** page.
1. Find the API key ID in the **API Access** table.
1. Click the **Action** button.
1. Select **Edit**.
1. In the **Edit API key name** dialog modify the API key name and click **Save changes**.

## Manage SQL users on a cluster

- [View all SQL users in your cluster](#view-all-sql-users-in-your-cluster)
- [Change a SQL user's password](#change-a-sql-users-password)
- [Remove a SQL user](#remove-a-sql-user)

### Create a SQL user

{% include cockroachcloud/danger-console-sql-users.md %}

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="console">Use the CockroachDB {{ site.data.products.cloud }} Console</button>
  <button class="filter-button page-level" data-scope="client">Use the SQL client</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="console">
{% include cockroachcloud/cockroachcloud-ask-admin.md %}

1. Navigate to your cluster's **SQL Users** page in the **Security** section of the left side navigation.
1. In the left navigation bar, click **SQL Users**.
1. Click **Add User**. The **Add User** dialog displays.
1. Enter a username and click **Generate & Save Password**.
1. Copy the generated password to a secure location, such as a password manager.
1. Click **Close**.

    Currently, all new users are created with SQL admin privileges. For more information and to change the default settings, see [Grant privileges to a SQL user](#grant-privileges-to-a-sql-user) and [Use SQL roles to manage access](#use-sql-roles-to-manage-access).
</section>

<section class="filter-content" markdown="1" data-scope="client">
Once you have [connected to the cluster's SQL client]({% link cockroachcloud/connect-to-your-cluster.md %}), you can create a new user.

To create a new user, use the [`CREATE USER ... WITH PASSWORD`]({% link {{site.current_cloud_version}}/create-user.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE USER <username> WITH PASSWORD '<password>';
~~~

{{site.data.alerts.callout_info}}
Be sure to create a password for each new user. Without a password, or being enrolled in cluster single sign-on (SSO), a user cannot connect to the cluster or access the DB Console. To add or change a password for a user, use the [`ALTER USER`]({% link {{site.current_cloud_version}}/alter-user.md %}) statement.
{{site.data.alerts.end}}
</section>

### View all SQL users in your cluster

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="console">Use the CockroachDB {{ site.data.products.cloud }} Console</button>
  <button class="filter-button page-level" data-scope="client">Use the SQL client</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="console">
To view a list of all of the users in your cluster, navigate to the **SQL Users** page.

On the **SQL Users** page, you can do the following:

- [Create a user](#create-a-sql-user)
- [Change a user's password](#change-a-sql-users-password)
- [Remove a user](#remove-a-sql-user)

</section>

<section class="filter-content" markdown="1" data-scope="client">
To list all the users in your cluster, use the [`SHOW USERS`]({% link {{site.current_cloud_version}}/show-users.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW USERS;
~~~
</section>

### Change a SQL user's password

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="console">Use the CockroachDB {{ site.data.products.cloud }} Console</button>
  <button class="filter-button page-level" data-scope="client">Use the SQL client</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="console">

{{site.data.alerts.callout_info}}
Only users with the [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator), or [Cluster Admin]({% link cockroachcloud/authorization.md %}#cluster-administrator) can change a user's password. If you do not have the required permissions, ask a user with one of the required roles to change the password.
{{site.data.alerts.end}}

To change a user's password:

1. Navigate to the **SQL Users** page.
1. In the row of the user whose password needs to be changed, click the **...** button.
1. From the dropdown, select **Change Password**.
1. Click **Generate & save password**.
1. Copy the generated password and save it in a secure location.

</section>

<section class="filter-content" markdown="1" data-scope="client">
To change a user's password, use the [`ALTER USER`]({% link {{site.current_cloud_version}}/alter-user.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER USER <user> WITH PASSWORD '<new password>';
~~~
</section>

### Remove a SQL user

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="console">Use the CockroachDB {{ site.data.products.cloud }} Console</button>
  <button class="filter-button page-level" data-scope="client">Use the SQL client</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="console">
To remove a user:

1. Navigate to the **SQL Users** page.
1. In the row of the user you want to remove, click the **...** button.
1. From the dropdown, select **Delete SQL User**.
1. Click **Delete**.

</section>

<section class="filter-content" markdown="1" data-scope="client">
To remove a user, use the [`DROP USER`]({% link {{site.current_cloud_version}}/drop-user.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP USER <user>;
~~~
</section>

{{site.data.alerts.callout_info}}
All of a user's privileges must be [revoked](#revoke-a-sql-users-privileges) before the user can be dropped.
{{site.data.alerts.end}}

### Grant privileges to a SQL user

Access to the data in your cluster is controlled by [privileges]({% link {{site.current_cloud_version}}/security-reference/authorization.md %}#managing-privileges). When a user connects to a database, either via the CockroachDB SQL client or a PostgreSQL driver or ORM, CockroachDB checks the user's privileges for each statement executed. If the user does not have sufficient privileges for a statement, CockroachDB returns an error.

To grant a user privileges for specific databases and tables in your cluster, use the [`GRANT`]({% link {{site.current_cloud_version}}/grant.md %}) statement. For example, to assign a user all privileges for all tables in a database:

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT ALL ON DATABASE <database> TO <user>;
~~~

To assign a user more limited privileges for one table in a database:

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT SELECT, INSERT ON TABLE <database>.<table> TO <user>;
~~~

For more details, see [Privileges]({% link {{site.current_cloud_version}}/security-reference/authorization.md %}#managing-privileges) and [`GRANT`]({% link {{site.current_cloud_version}}/grant.md %}).

### View a SQL user's privileges

To show privileges granted to a user, use the [`SHOW GRANTS`]({% link {{site.current_cloud_version}}/show-grants.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON DATABASE <database> FOR <user>;
~~~

### Revoke a SQL user's privileges

To revoke privileges from a user, use the [`REVOKE`]({% link {{site.current_cloud_version}}/revoke.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> REVOKE INSERT ON TABLE <database>.<table> FROM <user>;
~~~

### Use SQL roles to manage access

Role-based access control lets you simplify how you manage privileges. In essence, a role is a group containing any number of other roles and users as members. You can assign privileges to a role, and all direct and indirect members of the role will inherit the privileges.

Once you have [connected to the cluster]({% link cockroachcloud/connect-to-your-cluster.md %}), you can set up roles:

- To create a role, use the [`CREATE ROLE`]({% link {{site.current_cloud_version}}/create-role.md %}) statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE ROLE <role>;
    ~~~

- To grant privileges to a role, use the [`GRANT <privilege>`]({% link {{site.current_cloud_version}}/grant.md %}) statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > GRANT <privilege> ON DATABASE <database> TO <role>;
    ~~~

- To add a user (or another role) to a role, use the [`GRANT <role>`]({% link {{site.current_cloud_version}}/grant.md %}) statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > GRANT <role> TO <user or role>;
    ~~~

- To revoke privileges from a role, use the [`REVOKE <privilege>`]({% link {{site.current_cloud_version}}/revoke.md %}) statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > REVOKE INSERT ON TABLE <database>.<table> FROM <role>;
    ~~~

- To remove a user (or another role) from a role, use the [`REVOKE <role>`]({% link {{site.current_cloud_version}}/revoke.md %}) statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > REVOKE <role> FROM <user or role>;
    ~~~

- To list all roles in your cluster, use the [`SHOW ROLES`]({% link {{site.current_cloud_version}}/show-roles.md %}) statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW ROLES;
    ~~~

- To remove a role, use the [`DROP ROLE`]({% link {{site.current_cloud_version}}/drop-role.md %}) statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > DROP ROLE <role>;
    ~~~

    {{site.data.alerts.callout_info}}
    All of a role's privileges must be [revoked](#revoke-a-sql-users-privileges) before the role can be dropped.
    {{site.data.alerts.end}}

## See also

- [Client Connection Parameters]({% link {{site.current_cloud_version}}/connection-parameters.md %})
- [Connect to Your CockroachDB {{ site.data.products.dedicated }} Cluster]({% link cockroachcloud/connect-to-your-cluster.md %})
