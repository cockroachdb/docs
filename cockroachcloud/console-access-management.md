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

[Console Admins](#console-admin) can [create and manage SQL users](managing-access.html#create-a-sql-user). A SQL user can interact with a CockroachDB database using the built-in SQL shell or through an application.

SQL users created in the Console have the [`admin` role](../{{site.current_cloud_version}}/security-reference/authorization.html#admin-role) on the cluster by default, even if the user has [Developer](#developer) privileges for the organization. Therefore, anyone with the username and password of a default SQL user has privileges for all resources across the cluster.

For this reason, while creating SQL users in the Console is quick and easy, it is also dangerously powerful, and on clusters with any data of value, users should generally be be [created](../{{site.current_cloud_version}}/create-user.html) from the SQL client instead, and have their database resource access granted explicitly, precisely, and in keeping with the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege).

Learn more about [managing SQL users' privileges](../{{site.current_cloud_version}}/security-reference/authorization.html#users-and-roles).



## Service accounts

Service accounts are used by applications accessing the [Cloud API](cloud-api.html) to manage {{ site.data.products.db }} clusters within the organization. Service accounts are not for human users.

## Administrative tasks

