---
title: Authorization in CockroachDB
summary: Overview of Users/Roles and Privilege Grants in CockroachDB
toc: true
docs_area: reference.security
---

Authorization, generally, is the control over **who** (users/roles) can perform **which actions** (e.g read, write, update, delete, grant, etc.) to **which resources or targets** (databases, functions, tables, clusters, schemas, rows, users, jobs, etc.).

This page describes authorization of SQL users on particular [CockroachDB database clusters]({% link {{ page.version.version }}/architecture/glossary.md %}#cluster). This is distinct from authorization of CockroachDB {{ site.data.products.cloud }} Console users on CockroachDB {{ site.data.products.cloud }} organizations.

Learn more about the [CockroachDB {{ site.data.products.cloud }} authorization model]({% link cockroachcloud/authorization.md %}#overview-of-the-cockroachdb-cloud-authorization-model)

## Authorization models

Authorization in CockroachDB is *unified*, meaning that a given SQL user's permissions on a given cluster are governed by the same policies in different contexts such as accessing the SQL shell or viewing data from the DB Console.

{{site.data.alerts.callout_info}}
Starting in v22.2, CockroachDB introduces a new granular [system-level privilege model](#supported-privileges) that provides finer control over a user's ability to work with the database. This new system-level privilege model is intended to replace the existing [role options model](#role-options) in a future release of CockroachDB. As such, any legacy role options that now have corresponding system-level privilege versions are **deprecated in CockroachDB v22.2**, though both are supported alongside each other in v22.2. We recommend familiarizing yourself with the new system-level privilege model, and implementing it where possible.
{{site.data.alerts.end}}

CockroachDB offers two authorization models:

Authorization Model         | Features
----------------------------|---------------------------------------
[System-level Privileges](#supported-privileges)  | <ul><li> Introduced in CockroachDB v22.2.</li><li> Supported in CockroachDB v22.2, alongside the existing role options.</li><li>Apply cluster-wide. A system-level privilege is granted at the cluster level, and is inherited via role membership, similar to how [object-level privileges](#privileges) are inherited.</li><li>Are granted with the [`GRANT`]({% link {{ page.version.version }}/grant.md %}) statement using the `SYSTEM` parameter, and viewed with the [`SHOW SYSTEM GRANTS`]({% link {{ page.version.version }}/show-system-grants.md %}) statement.</li><li>May be assigned with the [`GRANT OPTION`]({% link {{ page.version.version }}/grant.md %}), which allows the assigned user or role to further grant that same system-level privilege to other users or roles.</li></ul>
[Role Options](#role-options) |  <ul><li> [Specific role options](#supported-privileges) which have had corresponding system-level privileges introduced in CockroachDB v22.2 are now **deprecated**.</li><li>Supported in CockroachDB v22.2, alongside the new system-level privileges.</li><li>Apply only to specific users, and are not inheritable via role membership.</li><li>Are granted with the [`GRANT`]({% link {{ page.version.version }}/grant.md %}) statement, and viewed with the [`SHOW GRANTS`]({% link {{ page.version.version }}/show-grants.md %}) statement.</li><li>May be assigned with the [`GRANT OPTION`]({% link {{ page.version.version }}/grant.md %}), which allows the assigned user or role to further grant that same role option to other users or roles.</li></ul>

If a system-level privilege exists with the same name as a role option, the system-level privilege should be used.

## Users and roles

Both [authorization models](#authorization-models) make use of the concept of user and roles. There is no technical distinction between a role or user in CockroachDB. A role/user can:

- Be permitted to log in to the [SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}).
- Be granted [privileges](#privileges) to specific actions and database objects.
- Be a member of other users/roles, inheriting their privileges.
- Have other users/roles as members that inherit its privileges.
- Be configured with other [role options](#role-options).

We refer to these as "roles" when they are created for managing the privileges of their member "users" and not for logging in directly, which is typically reserved for "users".

The SQL statements [`CREATE USER`]({% link {{ page.version.version }}/create-user.md %}) and [`CREATE ROLE`]({% link {{ page.version.version }}/create-role.md %}) will create the same entity with one exception: `CREATE ROLE` will add the `NOLOGIN` option by default, preventing the user/role from being used to log in. Otherwise, for enhanced PostgreSQL compatibility, the keywords `ROLE` and `USER` can be used interchangeably in SQL statements.

Throughout the documentation, however, we will refer to a "user" or "role" based on the intended purpose of the entity.

## SQL users

A SQL user can interact with a CockroachDB database using the [built-in SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}) or through an application.

### Create and manage users

Use the [`CREATE USER`]({% link {{ page.version.version }}/create-user.md %}) and [`DROP USER`]({% link {{ page.version.version }}/drop-user.md %}) statements to create and remove users, the [`ALTER USER`]({% link {{ page.version.version }}/alter-user.md %}) statement to add or change a user's password and role options, the [`GRANT`]({% link {{ page.version.version }}/grant.md %}) and [`REVOKE`]({% link {{ page.version.version }}/revoke.md %}) statements to manage the user’s privileges, and the [`SHOW USERS`]({% link {{ page.version.version }}/show-users.md %}) statement to list users.

A new user must be granted the required privileges for each database and table that the user needs to access.

{{site.data.alerts.callout_info}}
By default, a new user belongs to the `public` role and has no privileges other than those assigned to the `public` role.
{{site.data.alerts.end}}

### Automatic role synchronization with external identity providers



CockroachDB can automatically synchronize user role memberships based on group claims from external identity providers (IdPs). This feature is available for:

- **JWT authentication**: When users authenticate via JWT tokens for SQL client connections, CockroachDB can extract group claims from the token and automatically grant or revoke role memberships based on those groups. For details, refer to [JWT Authorization]({% link {{ page.version.version }}/jwt-authorization.md %}).

- **OIDC authentication**: When users authenticate via OIDC to the DB Console, CockroachDB can extract group claims from the ID token, access token, or userinfo endpoint and automatically manage role memberships. For details, refer to [OIDC Authorization]({% link {{ page.version.version }}/oidc-authorization.md %}).

When authorization is enabled:

1. On each login, CockroachDB extracts the groups claim from the authentication token or queries the IdP's userinfo endpoint.
1. Each group name is normalized using case folding and Unicode normalization (NFC).
1. Each normalized group name is matched against existing CockroachDB role names.
1. Roles corresponding to matching groups are automatically granted to the user.
1. Roles that no longer match any current groups are automatically revoked.

{{site.data.alerts.callout_info}}
Groups from the IdP that don't correspond to existing CockroachDB roles are silently ignored. You must pre-create roles in CockroachDB for them to be granted through IdP group synchronization.
{{site.data.alerts.end}}

This automatic role synchronization simplifies access management by delegating group membership management to your identity provider while maintaining CockroachDB's granular privilege system.

### Reserved identities

These identities are reserved within CockroachDB. These identities are created automatically and cannot be removed.

Identity                         | Description
---------------------------------|-------------
<a id="node-user"></a> `node`    | Used for all internode communications and for executing internal SQL operations that are run as part of regular node background processes. The `node` user does not appear when listing a cluster's users.
<a id="root-user"></a>`root`   | Used for administrator access in cases where it is required to manage other admins, such as when deploying a new cluster. The `root` user is created by default for each cluster. The `root` user is assigned to the [`admin` role](#admin-role) and has all privileges across the cluster.<br />For routine administration in production, Cockroach Labs recommends that you:<ul><li>Assign a password for the `root` user using the [`ALTER USER`]({% link {{ page.version.version }}/alter-user.md %}) statement, and restrict access to the password.</li><li>Avoid relying on the `root` user, and instead [grant the `admin` role]({% link {{ page.version.version }}/authorization.md %}#create-and-manage-roles) to users.</li></ul>

In production, access to the `node` and `root` cluster certificates must be handled with care due to the broad level of access they confer on their holders.

## Roles

{{site.data.alerts.callout_info}}
This section describes roles. For role options like `CREATEROLE`, see [role options](#role-options).
{{site.data.alerts.end}}

A role is a group of users and/or other roles for which you can grant or revoke privileges as a whole. To simplify access management, create a role and grant privileges to the role, then create SQL users and grant them membership to the role.

### Default roles

The `admin` and `public` roles exist by default.

#### `admin` role

The `admin` role is created by default and cannot be dropped. Users belonging to the `admin` role have all privileges for all database objects across the cluster. The `root` user belongs to the `admin` role by default.

An `admin` user is a member of the `admin` role. Only `admin` users can use [`CREATE ROLE`]({% link {{ page.version.version }}/create-role.md %}) and [`DROP ROLE`]({% link {{ page.version.version }}/drop-role.md %}).

To assign a user to the `admin` role:

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT admin TO <username>;
~~~

#### `public` role

All new users and roles belong to the `public` role by default. You can grant and revoke the privileges on the `public` role.

### Terminology

#### Role admin

`Role admin` is a [role option](#role-options) that allows a given user or role to *administrate* itself, by granting and revoking it to other users and roles.

To create a `role admin`, use [`WITH ADMIN OPTION`]({% link {{ page.version.version }}/grant.md %}#grant-the-admin-option).

{{site.data.alerts.callout_success}}
The terms “`admin` role” and “`role admin`” can be confusing.
The `admin` role is a role (specifically the role granting all privileges on all database resources across a cluster), whereas `role admin` is a role option that is either enabled or disabled or not on any given role or grant of a role to another user or role.

Learn more about [`role options`]({% link {{ page.version.version }}/create-user.md %}#role-options).
{{site.data.alerts.end}}

#### Direct member

A user or role that is an immediate member of the role.

Example: A is a member of B.

#### Indirect member

A user or role that is a member of the role by association.

Example: A is a member of C ... is a member of B where "..." is an arbitrary number of memberships.

## Object ownership

All CockroachDB objects (such as databases, tables, schemas, and types) must have owners. The user that created the object is the default owner of the object and has `ALL` privileges on the object. Similarly, any roles that are members of the owner role also have all privileges on the object.

All objects that do not have owners (for example, objects created before upgrading to v20.2) have `admin` set as the default owner, with the exception of system objects. System objects without owners have `node` as their owner.

To allow another user to use the object, the owner can [assign privileges](#managing-privileges) to the other user. Members of the `admin` role have `ALL` privileges on all objects.

Users that own objects cannot be dropped until the [ownership is transferred to another user]({% link {{ page.version.version }}/alter-database.md %}#change-a-databases-owner).

## Privileges

When a user connects to a database, either via the built-in SQL client or a client driver, CockroachDB checks the user and role's privileges for each statement executed. If the user does not have sufficient privileges for a statement, CockroachDB gives an error.

<a id="role-options"></a>
### Supported privileges

System-level privileges (also known as global privileges) offer more granular control over a user's actions when working with CockroachDB, compared to the [role options authorization model]({% link {{ page.version.version }}/create-role.md %}#role-options).

You can work with system-level privileges using the [`GRANT `]({% link {{ page.version.version }}/grant.md %}) statement with the `SYSTEM` parameter, and the [`SHOW SYSTEM GRANTS`]({% link {{ page.version.version }}/show-system-grants.md %}) statement.

Roles and users can be granted the following privileges:

{% include {{ page.version.version }}/sql/privileges.md %}

If a system-level privilege exists with the same name as a role option, the system-level privilege should be used. Some role options do not have a corresponding system-level privilege, since they configure per-user attributes. For those system-level privileges that replace legacy role options (such as `VIEWACTIVITY`), if both the system-level privilege and its legacy role option are specified for a user/role, the system-level privilege will take precedence and the legacy role option will be ignored.

### Managing privileges

Use the [`GRANT`]({% link {{ page.version.version }}/grant.md %}) and [`REVOKE`]({% link {{ page.version.version }}/revoke.md %}) statements to manage privileges for users and roles.

Take the following points into consideration while granting privileges to roles and users:

- When a role or user is granted privileges for a database, that role or user is not automatically granted access to any new or existing objects within that database. To change access to those objects, see [Default privileges](#default-privileges). This does not apply to system-level privileges, which apply cluster-wide.
- When a role or user is granted privileges for a table, the privileges are limited to the table.
- In CockroachDB, privileges are granted to users and roles at the database and table levels, or cluster-wide at the system level. They are not yet supported for other granularities such as columns or rows.
- The `root` user automatically belongs to the `admin` role and has the `ALL` privilege for new databases.
- For privileges required by specific statements, see the documentation for the respective [SQL statement]({% link {{ page.version.version }}/sql-statements.md %}).

### Default privileges

By default, CockroachDB grants the current role/user `ALL` privileges on the objects that they create.

To view the default privileges for a role, or for a set of roles, use the [`SHOW DEFAULT PRIVILEGES`]({% link {{ page.version.version }}/show-default-privileges.md %}) statement.

To change the default privileges on objects that a user creates, use the [`ALTER DEFAULT PRIVILEGES`]({% link {{ page.version.version }}/alter-default-privileges.md %}) statement.

The creator of an object is also the object's [owner](#object-ownership). Any roles that are members of the owner role have `ALL` privileges on the object, independent of the default privileges. Altering the default privileges of objects created by a role does not affect that role's privileges as the object's owner. The default privileges granted to other users/roles are always in addition to the ownership (i.e., `ALL`) privileges given to the creator of the object.

For more examples of default privileges, see the examples on the [`SHOW DEFAULT PRIVILEGES`]({% link {{ page.version.version }}/show-default-privileges.md %}#examples) and [`ALTER DEFAULT PRIVILEGES`]({% link {{ page.version.version }}/alter-default-privileges.md %}#examples) statement pages.

## Authorization best practices

We recommend the following best practices to set up access control for your clusters:

- Use the `root` user only for database administration tasks such as creating and managing other [users](#sql-users), creating and managing [roles](#roles), and creating and managing databases. Do not use the `root` user for applications; instead, create users or roles with specific [privileges](#managing-privileges) based on your application’s access requirements.
- Use the [Principle of Least Privilege (PoLP)](https://wikipedia.org/wiki/Principle_of_least_privilege) as a golden rule when to designing your system of privilege grants.

  For improved performance, CockroachDB securely caches [authentication information for users]({% link {{ page.version.version }}/authentication.md %}#client-authentication). To limit the authentication latency of users logging into a new session, we recommend the following best practices for `ROLE` operations ([`CREATE ROLE`]({% link {{ page.version.version }}/create-role.md %}), [`ALTER ROLE`]({% link {{ page.version.version }}/alter-role.md %}), [`DROP ROLE`]({% link {{ page.version.version }}/drop-role.md %})):

- Run bulk `ROLE` operations inside a transaction.
- Run regularly-scheduled `ROLE` operations together, rather than at different times throughout the day.
- Generally, if a [system-level privilege](#supported-privileges) exists with the same name as a [role option](#role-options), the system-level privilege should be used.
