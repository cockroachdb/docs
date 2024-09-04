---
title: Manage Cluster User Authorization
summary: Learn procedures for managing the lifecycle of SQL users and roles.
toc: true
docs_area: manage
---

This page documents procedures for managing the lifecycle of SQL users and roles on CockroachDB clusters.

Procedures for managing access are covered in [Managing Access in CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/managing-access.md %}).

{{site.data.alerts.callout_info}}
The concept of *Organization user* is distinct from Authorization of *SQL user/role* on clusters is distinct from authorization of CockroachDB {{ site.data.products.cloud }} users within CockroachDB {{ site.data.products.cloud }} organizations.

Learn more: [Overview of the CockroachDB Cloud authorization model]({% link cockroachcloud/authorization.md %}#overview-of-the-cockroachdb-cloud-authorization-model)
{{site.data.alerts.end}}

For reference documentation and explanation of related concepts, see [Security Reference&mdash;Authorization]({% link {{ page.version.version }}/security-reference/authorization.md %}).

## Create CockroachDB users

Use the [`CREATE USER`]({% link {{ page.version.version }}/create-user.md %}) and [`DROP USER`]({% link {{ page.version.version }}/drop-user.md %}) statements to create and remove users, the [`ALTER USER`]({% link {{ page.version.version }}/alter-user.md %}) statement to add or change a user's password and role options, the [`GRANT`]({% link {{ page.version.version }}/grant.md %}) and [`REVOKE`]({% link {{ page.version.version }}/revoke.md %}) statements to manage the user’s privileges, and the [`SHOW USERS`]({% link {{ page.version.version }}/show-users.md %}) statement to list users.

A new user must be granted the required privileges for each database and table that the user needs to access.

{{site.data.alerts.callout_info}}
By default, a new user belongs to the `public` role and has no privileges other than those assigned to the `public` role.
{{site.data.alerts.end}}

## Create and manage roles

For examples showing how to create and manage your cluster's users and roles, see the following documentation:

Statement | Description
----------|------------
[`CREATE ROLE`]({% link {{ page.version.version }}/create-role.md %}) | Create SQL roles.
[`DROP ROLE`]({% link {{ page.version.version }}/drop-role.md %}) | Remove one or more SQL roles.
[`ALTER ROLE`]({% link {{ page.version.version }}/alter-role.md %}) | Change passwords, role options, and default session variables for a role.
[`CREATE USER`]({% link {{ page.version.version }}/create-user.md %}) | Create SQL users.
[`DROP USER`]({% link {{ page.version.version }}/create-user.md %}) | Remove one or more SQL users.
[`ALTER USER`]({% link {{ page.version.version }}/alter-user.md %}) | Change passwords and role options for a user.
[`GRANT`]({% link {{ page.version.version }}/grant.md %}) | Manage each role or user's SQL privileges for interacting with specific databases and tables, or add a role or user as a member to a role.
[`REVOKE`]({% link {{ page.version.version }}/revoke.md %}) | Revoke privileges from users and/or roles, or revoke a role or user's membership to a role.
[`SHOW ROLES`]({% link {{ page.version.version }}/show-roles.md %}) | List the roles for all databases.
[`SHOW GRANTS`]({% link {{ page.version.version }}/show-grants.md %}) | List the privileges granted to users.

## See also

- [Client Connection Parameters]({% link {{ page.version.version }}/connection-parameters.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [`CREATE USER`]({% link {{ page.version.version }}/create-user.md %})
- [`ALTER USER`]({% link {{ page.version.version }}/alter-user.md %})
- [`DROP USER`]({% link {{ page.version.version }}/drop-user.md %})
- [`SHOW USERS`]({% link {{ page.version.version }}/show-users.md %})
- [`CREATE ROLE`]({% link {{ page.version.version }}/create-role.md %})
- [`ALTER ROLE`]({% link {{ page.version.version }}/alter-role.md %})
- [`DROP ROLE`]({% link {{ page.version.version }}/drop-role.md %})
- [`SHOW ROLES`]({% link {{ page.version.version }}/show-roles.md %})
- [`GRANT`]({% link {{ page.version.version }}/grant.md %})
- [`REVOKE`]({% link {{ page.version.version }}/revoke.md %})
- [`SHOW GRANTS`]({% link {{ page.version.version }}/show-grants.md %})
