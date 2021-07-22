---
title: Console Access Management
summary: Manage your account roles and permissions.
toc: true
---

The **Access** page displays the name, email address, role, and invite acceptance status of the Team Members with access to your CockroachCloud Organization. To view the Access page, [log in](https://cockroachlabs.cloud/) and click **Access**.

## Organization

An **Organization** allows you to manage your clusters under a shared [billing](#manage-billing-for-the-organization) account and collaborate with team members. You can belong to multiple organizations.

To switch between the organizations:

1. [Log in](https://cockroachlabs.cloud/).
2. From the drop-down box in the top-right corner, select the Organization you want to access.

### Organization verification

CockroachCloud Organizations have two levels of verification, **Basic** and **Core**. New CockroachCloud Serverless (beta) Organizations are at the Basic level once an email address is verified, and all CockroachCloud Dedicated Organizations are at the Core level. Console Admins can upgrade your Organization to Core verification by [adding credit card information](#manage-billing-for-the-organization).

Basic                             | Core
----------------------------------|----------------------------------
Import and Backup with `userfile`   | Import and Backup with cloud storage or `userfile`
Up to 5 Serverless clusters       | Up to 50 Serverless clusters
placeholder      | placeholder

## SQL users

[Console Admins](#console-admin) can [create and manage SQL users](user-authorization.html#create-a-sql-user). A SQL user can interact with a CockroachDB database using the built-in SQL shell or through an application.

SQL users created in the Console have admin privileges on the database by default. Therefore, anyone with the username and password of a default SQL user has privileges for all database objects across the cluster.

Anyone with database admin privileges can [change a SQL user's databases privileges](../{{site.versions["stable"]}}/authorization.html#assign-privileges).

## Roles

Every CockroachCloud user is either a Developer or a Console Admin for the Organization.

### Developer

A Developer is a limited-access role. A Developer cannot invite Team Members to the Console or create new SQL users.

To access a cluster, you need to ask a Console Admin for the username and password of a SQL user. To find out who's your Console Admin, check the **Access** page.

### Console Admin

A Console Admin is an all-access role. A Console Admin can perform the following tasks:

- [Create a cluster](create-your-cluster.html)
- [Invite Team Members to CockroachCloud](#invite-team-members-to-cockroachcloud)
- [Manage Team Members](#manage-team-members)
- [Create and manage SQL users](user-authorization.html#create-a-sql-user)
- [Manage billing for the Organization](#manage-billing-for-the-organization)
- [Restore databases and tables from a CockroachCloud backup](backups-page.html#ways-to-restore-data)
- [Delete an Organization](#delete-an-organization)

## Administrative tasks

### Invite Team Members to CockroachCloud

As a Console Admin, you can invite Team Members to CockroachCloud. To invite Team Members:

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

### Manage billing for the Organization

As a Console Admin, you can set up and manage billing for the Organization.

#### Set up billing for an Organization

1. On the **Billing** page, click the pen icon for the **Payment method** field.
2. On the **Edit payment method** page, enter the email address at which you want get invoices for the Organization.
3. Enter the credit or debit card details.
4. Enter the address associated with your payment method. This address appears on your monthly invoice and should be the legal address of your home or business.
4. Click **Add card**.

#### Change the billing email address

1. On the **Billing** page, click the pen icon for the **Billing email address** field.
2. On the **Edit payment method** page, enter the new email address at which you want get invoices for the Organization.
3. Click **Add card**.

#### Delete your credit card information

We keep a card on file after the associated Organization is deleted so we can process pending charges. You can [contact Support](https://support.cockroachlabs.com) to remove your card once your charges are settled.

#### Check trial code details

If you had used a CockroachCloud trial code while [creating a cluster](create-your-cluster.html#step-8-enter-billing-details), you can check the trial expiration details on the **Billing page**.

{{site.data.alerts.callout_info}}
Your credit card will be charged after the trial ends. You can check the expiration date of the code on the [Billing](console-access-management.html#manage-billing-for-the-organization) page.
{{site.data.alerts.end}}

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
