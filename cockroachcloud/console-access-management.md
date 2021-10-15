---
title: Console Access Management
summary: Manage your account roles and permissions.
toc: true
---

The **Access** page displays the name, email address, role, and invite acceptance status of the Team Members with access to your {{ site.data.products.db }} Organization. To view the Access page, [log in](https://cockroachlabs.cloud/) and click **Access**.

## Organization

An **Organization** allows you to manage your clusters under a shared [billing](billing-management.html) account and collaborate with team members. You can belong to multiple organizations.

To switch between the organizations:

1. [Log in](https://cockroachlabs.cloud/).
2. From the drop-down box in the top-right corner, select the Organization you want to access.

## SQL users

[Console Admins](#console-admin) can [create and manage SQL users](user-authorization.html#create-a-sql-user). A SQL user can interact with a CockroachDB database using the built-in SQL shell or through an application.

SQL users created in the Console have admin privileges on the database by default. Therefore, anyone with the username and password of a default SQL user has privileges for all database objects across the cluster.

Anyone with database admin privileges can [change a SQL user's databases privileges](../{{site.versions["stable"]}}/authorization.html#assign-privileges).

## Roles

Every {{ site.data.products.db }} user is either a Developer or a Console Admin for the Organization.

### Developer

A Developer is a limited-access role. A Developer cannot invite Team Members to the Console or create new SQL users.

To access a cluster, you need to ask a Console Admin for the username and password of a SQL user. To find out who your Console Admin is, check the **Access** page.

### Console Admin

A Console Admin is an all-access role. A Console Admin can perform the following tasks:

- [Create a cluster](create-your-cluster.html)
- [Invite Team Members to {{ site.data.products.db }}](#invite-team-members-to-cockroachdb-cloud)
- [Manage Team Members](#manage-team-members)
- [Create and manage SQL users](user-authorization.html#create-a-sql-user)
- [Manage billing for the Organization](billing-management.html)
- [Restore databases and tables from a {{ site.data.products.db }} backup](backups-page.html#ways-to-restore-data)
- [Delete an Organization](#delete-an-organization)

## Administrative tasks

### Invite Team Members to {{ site.data.products.db }}

As a Console Admin, you can invite Team Members to {{ site.data.products.db }}. To invite Team Members:

1. If you are a member of multiple Organizations, navigate to the Organization to which you want to invite a Team Member. You can navigate to the correct Organization by using the drop-down box in the top-right corner.
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
If you are a member of multiple [organizations](console-access-management.html#organization), make sure you are looking at the same Organization as the Team Member you want to manage. You can navigate to the correct Organization by using the drop-down box in the top-right corner.
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

### Delete an Organization

{{site.data.alerts.callout_danger}}
Deleting an Organization will delete all clusters and user data within the Organization. This action cannot be reversed. To delete a single cluster instead, see [Cluster Management](cluster-management.html#delete-cluster).
{{site.data.alerts.end}}

If you are sure you want to delete the Organization, proceed with the following steps:

1. Navigate to the **Settings** page for the Organization you want to delete.
1. Click **Delete**.
1. Enter the name of the Organization.
1. Click **Delete**.

    You will be automatically logged out of your account.
