---
title: Console Access Management
summary: Manage your account roles and permissions.
toc: true
build_for: [cockroachcloud]
---

The **Access** page displays the name, email address, role, and invite acceptance status of the Team Members with access to your CockroachDB Cloud cluster. To view the Access page, [sign in to the Console](cockroachcloud-sign-up-for-a-cluster.html#sign-in) and click **Access**.

<Screenshot here>

## Roles

Every CockroachCloud user is either a Developer or a Console Admin.

### Developer

A Developer is a limited-access role. A Developer cannot invite Team Members to the Console or access databases.

To access a database, you need to ask a Console Admin for details of a SQL user. To find out who's your Console Admin, check the **Access** page.

### Console Admin

A Console Admin is an all-access role. A Console Admin can perform the following tasks:

- [Invite Team Members to CockroachDB Cloud](#invite-team-members-to-cockroachcloud)
- [Manage Team Members](#manage-team-members)
- [Create and manage SQL users](cockroachcloud-connect-to-your-cluster.html#step-2-create-a-sql-user)

## Administrative tasks

### Invite Team Members to CockroachCloud

To invite Team Members to CockroachCloud:

1. On the **Access** page, click **Add Team Member**.
2. In the **Email Address** field, enter the email address of the team member you want to invite.
3. From the **Role** dropdown list, assign either the **Developer** role or the **Admin** role.
4. (Optional) Click **Add another** to invite another team member.
4. Click **Invite**.

### Manage Team Members

As a Console Admin, you can change Team Members' roles, delete Team Members, and revoke pending invites.

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
