---
title: Console Access Management
summary: Manage your account roles and permissions.
toc: true
docs_area: manage
---

## Organization

An **organization** allows you to manage your clusters under a shared [billing](billing-management.html) account and collaborate with team members. You can belong to multiple organizations.

To switch between the organizations:

1. [Log in](https://cockroachlabs.cloud/).
1. From the drop-down box in the top-right corner, select the organization you want to access.

The settings and information about the organization are found on the **Settings** page. The organization ID and organization label used by the `ccloud` CLI are listed under **Organization settings**.

## SQL users

[Console Admins](#console-admin) can [create and manage SQL users](user-authorization.html#create-a-sql-user). A SQL user can interact with a CockroachDB database using the built-in SQL shell or through an application.

SQL users created in the Console have the [`admin` role](../{{site.current_cloud_version}}/security-reference/authorization.html#admin-role) on the cluster by default, even if the user has [Developer](#developer) privileges for the organization. Therefore, anyone with the username and password of a default SQL user has privileges for all resources across the cluster.

For this reason, while creating SQL users in the Console is quick and easy, it is also dangerously powerful, and on clusters with any data of value, users should generally be be [created](../{{site.current_cloud_version}}/create-user.html) from the SQL client instead, and have their database resource access granted explicitly, precisely, and in keeping with the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege).

Learn more about [managing SQL users' privileges](../{{site.current_cloud_version}}/security-reference/authorization.html#users-and-roles).

## Roles

Every {{ site.data.products.db }} user is either a Developer or a Console Admin for the organization.

{{site.data.alerts.callout_danger}}
Both Console Admins and Developers have access to all the information on the **SQL Activity** and **Databases** pages.
{{site.data.alerts.end}}

### Developer

A Developer is a limited-access role. A Developer cannot invite Team Members to the Console or create new SQL users. Note that Developers can still create [SQL Users](#sql-users) with the [`admin` role](../{{site.current_cloud_version}}/security-reference/authorization.html#admin-role) on a cluster.

To access a cluster, you need to ask a Console Admin for the username and password of a SQL user. To find out who your Console Admin is, check the **Access** page.

### Console Admin

A Console Admin is an all-access role. A Console Admin can perform the following tasks:

- [Create a cluster](create-your-cluster.html)
- [Invite Team Members to {{ site.data.products.db }}](#invite-team-members-to-cockroachdb-cloud)
- [Manage Team Members](#manage-team-members)
- [Create and manage SQL users](user-authorization.html#create-a-sql-user)
- [Manage billing for the organization](billing-management.html)
- [Restore databases and tables from a {{ site.data.products.db }} backup](use-managed-service-backups.html#ways-to-restore-data)
- [Delete an organization](#delete-an-organization)

## Service accounts

Service accounts are used by applications accessing the [Cloud API](cloud-api.html) to manage {{ site.data.products.db }} clusters within the organization. Service accounts are not for human users.

## Administrative tasks

