---
title: Console Access Management
summary: Manage your account roles and permissions.
toc: true
docs_area: manage
---

The **Access** page displays the name, email address, role, and invite acceptance status of the Team Members with access to your {{ site.data.products.db }} organization. To view the **Access** page, [log in](https://cockroachlabs.cloud/) and click **Access**.

{% include cockroachcloud/prefer-sso.md %}

## Organization

An **organization** allows you to manage your clusters under a shared [billing](billing-management.html) account and collaborate with team members. You can belong to multiple organizations.

To switch between the organizations:

1. [Log in](https://cockroachlabs.cloud/).
2. From the drop-down box in the top-right corner, select the organization you want to access.

The settings and information about the organization are found on the **Settings** page. The organization ID and organization label used by the `ccloud` CLI are listed under **Organization settings**. 

## SQL users

[Console Admins](#console-admin) can [create and manage SQL users](user-authorization.html#create-a-sql-user). A SQL user can interact with a CockroachDB database using the built-in SQL shell or through an application.

SQL users created in the Console have the [`admin` role](../{{site.versions["stable"]}}/security-reference/authorization.html#admin-role) on the cluster by default, even if the user has [Developer](#developer) privileges for the organization. Therefore, anyone with the username and password of a default SQL user has privileges for all resources across the cluster.

For this reason, while creating SQL users in the Console is quick and easy, it is also dangerously powerful, and on clusters with any data of value, users should generally be be [created](../{{site.versions["stable"]}}/create-user.html) from the SQL client instead, and have their database resource access granted explicitly, precisely, and in keeping with the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege).

Learn more about [managing SQL users' privileges](../{{site.versions["stable"]}}/security-reference/authorization.html#users-and-roles).

## Roles

Every {{ site.data.products.db }} user is either a Developer or a Console Admin for the organization.

### Developer

A Developer is a limited-access role. A Developer cannot invite Team Members to the Console or create new SQL users. Note that Developers can still create [SQL Users](#sql-users) with the [`admin` role](../{{site.versions["stable"]}}/security-reference/authorization.html#admin-role) on a cluster.

To access a cluster, you need to ask a Console Admin for the username and password of a SQL user. To find out who your Console Admin is, check the **Access** page.

### Console Admin

A Console Admin is an all-access role. A Console Admin can perform the following tasks:

- [Create a cluster](create-your-cluster.html)
- [Invite Team Members to {{ site.data.products.db }}](#invite-team-members-to-cockroachdb-cloud)
- [Manage Team Members](#manage-team-members)
- [Create and manage SQL users](user-authorization.html#create-a-sql-user)
- [Manage billing for the organization](billing-management.html)
- [Restore databases and tables from a {{ site.data.products.db }} backup](backups-page.html#ways-to-restore-data)
- [Delete an organization](#delete-an-organization)

## Service accounts

Service accounts are used by applications accessing the [Cloud API](cloud-api.html) to manage {{ site.data.products.db }} clusters within the organization. Service accounts are not for human users.

To create a service account:

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

## Administrative tasks

### Invite Team Members to {{ site.data.products.db }}

As a Console Admin, you can invite Team Members to {{ site.data.products.db }}. To invite Team Members:

1. If you are a member of multiple organizations, navigate to the organization to which you want to invite a Team Member. You can navigate to the correct organization by using the drop-down box in the top-right corner.
2. On the **Access** page, click **Add Team Member**.
3. In the **Email Address** field, enter the email address of the team member you want to invite.
4. From the **Role** dropdown list, assign either the **Developer** role or the **Admin** role.
5. (Optional) Click **Add another** to invite another team member.
6. Click **Invite**.

{{site.data.alerts.callout_success}}
We recommend [creating a SQL user](user-authorization.html) for each Team Member you invite.
{{site.data.alerts.end}}

### Manage Team Members

As a Console Admin, you can change Team Members' roles, delete Team Members, and revoke pending invites.

{{site.data.alerts.callout_info}}
If you are a member of multiple [organizations](console-access-management.html#organization), make sure you are looking at the same organization as the Team Member you want to manage. You can navigate to the correct organization by using the drop-down box in the top-right corner.
{{site.data.alerts.end}}

#### Change a Team Member's role

1. On the **Access** page, locate the Team Member's details whose role you want to change.
2. In the **Action** column, click the three dots to view the allowed actions.
3. If the Team Member is a Developer, click **Change to Admin** to grant them Admin access. If the Team Member is an Admin, click **Change to Developer** to grant them only Developer access.

{{site.data.alerts.callout_info}}
As a Console Admin, you can change your own access to a Developer role; however, you will not be able to change yourself back to the Admin role. If you are the only Team Member with Console Admin access, you will not be allowed to change your role until you assign another Team Member to be the Console Admin.
{{site.data.alerts.end}}

#### Delete a Team Member

1. On the **Access** page, locate the Team Member you want to delete.
2. In the **Action** column, click the three dots to view the allowed actions.
3. Click **Delete Member**.
4. On the confirmation window, click **Delete**.

#### Revoke a pending invite

1. On the **Access** page, locate the Team Member's details whose pending invite you want to revoke.
2. In the **Action** column, click the three dots to view the allowed actions.
3. Click **Revoke Invite**.

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
