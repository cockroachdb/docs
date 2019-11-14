---
title: Console Access Management
summary: Manage your account roles and permissions.
toc: true
build_for: [cockroachcloud]
---

The **Access** page displays the name, email address, role, and invite acceptance status of the Team Members with access to your CockroachCloud Organization. To view the Access page, [sign in to the Console](cockroachcloud-sign-up-for-a-cluster.html#sign-in) and click **Access**.

## Organization

An **Organization** allows you to manage your clusters under a shared [billing]() account and collaborate with team members. You can belong to multiple organizations.

To switch between the organizations:
1. [Sign in to the Console](cockroachcloud-create-your-account.html#sign-in).
2. From the drop-down box in the top-right corner, select the **Organization** you want to access.

## Roles

Every CockroachCloud user is either a Developer or a Console Admin for the Organization.

### Developer

A Developer is a limited-access role. A Developer cannot invite Team Members to the Console or access databases.

To access a database, you need to ask a Console Admin for details of a SQL user. To find out who's your Console Admin, check the **Access** page.

### Console Admin

A Console Admin is an all-access role. A Console Admin can perform the following tasks:

- [Create a cluster](cockroachcloud-create-your-cluster.html)
- [Invite Team Members to CockroachDB Cloud](#invite-team-members-to-cockroachcloud)
- [Manage Team Members](#manage-team-members)
- [Create and manage SQL users](cockroachcloud-connect-to-your-cluster.html#step-2-create-a-sql-user)
- [Manage billing for the Organization](#manage-billing-for-the-organization)

## Administrative tasks

### Invite Team Members to CockroachCloud

As a Console Admin, you can invite Team Members to CockroachCloud. To invite Team Members:

1. If you are a member of multiple Organizations, navigate to the Organization to which you want to invite a Team Member. You can navigate to the correct Organization by using the drop-down box in the top-right corner.
2. On the **Access** page, click **Add Team Member**.
3. In the **Email Address** field, enter the email address of the team member you want to invite.
4. From the **Role** dropdown list, assign either the **Developer** role or the **Admin** role.
5. (Optional) Click **Add another** to invite another team member.
6. Click **Invite**.

### Manage Team Members

As a Console Admin, you can change Team Members' roles, delete Team Members, and revoke pending invites.

{{site.data.alerts.callout_info}}
If you are a member of multiple [organizations](cockroachcloud-create-your-account.html#create-your-cockroachcloud-account), make sure you are looking at the same Organization as the Team Member you want to manage. You can navigate to the correct Organization by using the drop-down box in the top-right corner.
{{site.data.alerts.end}}

#### Change a Team Member's role

1. On the **Access** page, locate the Team Member's details whose role you want to change.
2. In the **Action** column, click the three dots to view the allowed actions.
3. If the Team Member is a Developer, click **Change to Admin** to grant them Admin access. If the Team Member is an Admin, click **Change to Developer** to grant them only Developer access.

{{site.data.alerts.callout_info}}
As a Console Admin, you can change your own access to a Developer role; however, you won't be able to change yourself back to the Admin role. If you are the only Team Member with Console Admin access, you won't be allowed to change your role until you assign another Team Member to be the Console Admin.
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
