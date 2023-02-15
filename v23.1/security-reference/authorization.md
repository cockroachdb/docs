---
title: Authorization in CockroachDB
summary: Overview of Users/Roles and Privilege Grants in CockroachDB
toc: true
docs_area: reference.security
---

Authorization, generally, is the control over **who** (users/roles) can perform **which actions** (e.g read, write, update, delete, grant, etc.) to **which resources or targets** (databases, functions, tables, clusters, schemas, rows, users, jobs, etc.).

CockroachDB has a unified authorization model, meaning that a given user's permissions are governed by the same policies in different contexts such as accessing the SQL shell or viewing data from the DB Console.

## Authorization models

{{site.data.alerts.callout_info}}
Starting in v22.2, CockroachDB introduces a new granular [system-level privilege model](#system-level-privileges) that provides finer control over a user's ability to work with the database. This new system-level privilege model is intended to replace the existing [role options model](#role-options) in a future release of CockroachDB. As such, any legacy role options that now have corresponding system-level privilege versions are **deprecated in CockroachDB v22.2**, though both are supported alongside each other in v22.2. We recommend familiarizing yourself with the new system-level privilege model, and implementing it where possible.
{{site.data.alerts.end}}

CockroachDB offers two authorization models:

Authorization Model         | Features
----------------------------|---------------------------------------
[System-level Privileges](#system-level-privileges)  | <ul><li> Introduced in CockroachDB v22.2.</li><li> Supported in CockroachDB v22.2, alongside the existing role options.</li><li>Apply cluster-wide. A system-level privilege is granted at the cluster level, and is inherited via role membership, similar to how [object-level privileges](#privileges) are inherited.</li><li>Are granted with the [`GRANT`](../grant.html) statement using the `SYSTEM` parameter, and viewed with the [`SHOW SYSTEM GRANTS`](../show-system-grants.html) statement.</li><li>May be assigned with the [`GRANT OPTION`](../grant.html), which allows the assigned user or role to further grant that same system-level privilege to other users or roles.</li></ul>
[Role Options](#role-options) |  <ul><li> [Specific role options](#system-level-privileges) which have had corresponding system-level privileges introduced in CockroachDB v22.2 are now **deprecated**.</li><li>Supported in CockroachDB v22.2, alongside the new system-level privileges.</li><li>Apply only to specific users, and are not inheritable via role membership.</li><li>Are granted with the [`GRANT`](../grant.html) statement, and viewed with the [`SHOW GRANTS`](../show-grants.html) statement.</li><li>May be assigned with the [`GRANT OPTION`](../grant.html), which allows the assigned user or role to further grant that same role option to other users or roles.</li></ul>

If a system-level privilege exists with the same name as a role option, the system-level privilege should be used.

## Users and roles

Both [authorization models](#authorization-models) make use of the concept of user and roles. There is no technical distinction between a role or user in CockroachDB. A role/user can:

- Be permitted to log in to the [SQL shell](../cockroach-sql.html).
- Be granted [privileges](#privileges) to specific actions and database objects.
- Be a member of other users/roles, inheriting their privileges.
- Have other users/roles as members that inherit its privileges.
- Be configured with other [role options](#role-options).

We refer to these as "roles" when they are created for managing the privileges of their member "users" and not for logging in directly, which is typically reserved for "users".

The SQL statements [`CREATE USER`](../create-user.html) and [`CREATE ROLE`](../create-role.html) will create the same entity with one exception: `CREATE ROLE` will add the `NOLOGIN` option by default, preventing the user/role from being used to log in. Otherwise, for enhanced PostgreSQL compatibility, the keywords `ROLE` and `USER` can be used interchangeably in SQL statements.

Throughout the documentation, however, we will refer to a "user" or "role" based on the intended purpose of the entity.

## SQL users

A SQL user can interact with a CockroachDB database using the [built-in SQL shell](../cockroach-sql.html) or through an application.

### Create and manage users

Use the [`CREATE USER`](../create-user.html) and [`DROP USER`](../drop-user.html) statements to create and remove users, the [`ALTER USER`](../alter-user.html) statement to add or change a user's password and role options, the [`GRANT`](../grant.html) and [`REVOKE`](../revoke.html) statements to manage the user’s privileges, and the [`SHOW USERS`](../show-users.html) statement to list users.

A new user must be granted the required privileges for each database and table that the user needs to access.

{{site.data.alerts.callout_info}}
By default, a new user belongs to the `public` role and has no privileges other than those assigned to the `public` role.
{{site.data.alerts.end}}

### `root` user

The `root` user is created by default for each cluster. The `root` user is assigned to the [`admin` role](#admin-role) and has all privileges across the cluster.

For secure clusters, in addition to [generating the client certificate](../authentication.html#client-authentication) for the `root` user, you can assign or change the password for the `root` user using the [`ALTER USER`](../alter-user.html) statement.

## Roles

{{site.data.alerts.callout_info}}
This section describes roles. For role options like `CREATEROLE`, see [role options](#role-options).
{{site.data.alerts.end}}

A role is a group of users and/or other roles for which you can grant or revoke privileges as a whole. To simplify access management, create a role and grant privileges to the role, then create SQL users and grant them membership to the role.

### Default roles

The `admin` and `public` roles exist by default.

#### `admin` role

The `admin` role is created by default and cannot be dropped. Users belonging to the `admin` role have all privileges for all database objects across the cluster. The `root` user belongs to the `admin` role by default.

An `admin` user is a member of the `admin` role. Only `admin` users can use [`CREATE ROLE`](../create-role.html) and [`DROP ROLE`](../drop-role.html).

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

To create a `role admin`, use [`WITH ADMIN OPTION`](../grant.html#grant-the-admin-option).

{{site.data.alerts.callout_success}}
The terms “`admin` role” and “`role admin`” can be confusing.
The `admin` role is a role (specifically the role granting all privileges on all database resources across a cluster), whereas `role admin` is a role option that is either enabled or disabled or not on any given role or grant of a role to another user or role.

Learn more about [`role options`](../create-user.html#role-options).
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

Users that own objects cannot be dropped until the [ownership is transferred to another user](../alter-database.html#change-a-databases-owner).

## Privileges

When a user connects to a database, either via the built-in SQL client or a client driver, CockroachDB checks the user and role's privileges for each statement executed. If the user does not have sufficient privileges for a statement, CockroachDB gives an error.

### Supported privileges

Roles and users can be granted the following privileges:

{% include {{ page.version.version }}/sql/privileges.md %}

### System-level privileges 

System-level privileges offer more granular control over a user's actions when working with CockroachDB, compared to the [role options authorization model](#role-options).

System-level privileges are a special kind of privilege that apply cluster-wide, meaning that the privilege is not tied to any specific object in the database.

You can work with system-level privileges using the [`GRANT `](../grant.html) statement with the `SYSTEM` parameter, and the [`SHOW SYSTEM GRANTS`](../show-system-grants.html) statement.

The following table lists the new system-level privileges introduced with CockroachDB v22.2, and indicates which system-level privileges replace role options:

New System-level Privilege  | Replaces Legacy Role Option
----------------------------|---------------------------------------
`MODIFYCLUSTERSETTING`      | Yes: the `MODIFYCLUSTERSETTING` and `NOMODIFYCLUSTERSETTING` role option
`EXTERNALCONNECTION`        | No, new in v22.2
`VIEWACTIVITY`              | Yes: the `VIEWACTIVITY` and `NOVIEWACTIVITY` role options
`VIEWACTIVITYREDACTED`      | Yes: the `VIEWACTIVITYREDACTED` and `NOVIEWACTIVITYREDACTED` role options
`VIEWCLUSTERSETTING`        | Yes: the `VIEWCLUSTERSETTING` and `NOVIEWCLUSTERSETTING` role options
`CANCELQUERY`               | Yes: the `CANCELQUERY` and `NOCANCELQUERY` role options
`NOSQLLOGIN`                | Yes: the `SQLLOGIN` and `NOSQLLOGIN` role options
`VIEWCLUSTERMETADATA`       | No, new in v22.2
`VIEWDEBUG`                 | No, new in v22.2
`BACKUP`                    | No, new in v22.2
`RESTORE`                   | No, new in v22.2
`EXTERNALIOIMPLICITACCESS`  | No, new in v22.2
`CHANGEFEED`                | No, new in v22.2

If a system-level privilege exists with the same name as a role option, the system-level privilege should be used. Some role options do not have a corresponding system-level privilege, since they configure per-user attributes. For those system-level privileges that replace legacy role options (such as `VIEWACTIVITY`), if both the system-level privilege and its legacy role option are specified for a user/role, the system-level privilege will take precedence and the legacy role option will be ignored.

### Managing privileges

Use the [`GRANT`](../grant.html) and [`REVOKE`](../revoke.html) statements to manage privileges for users and roles.

Take the following points into consideration while granting privileges to roles and users:

- When a role or user is granted privileges for a database, that role or user is not automatically granted access to any new or existing objects within that database. To change access to those objects, see [Default privileges](#default-privileges). This does not apply to system-level privileges, which apply cluster-wide.
- When a role or user is granted privileges for a table, the privileges are limited to the table.
- In CockroachDB, privileges are granted to users and roles at the database and table levels, or cluster-wide at the system level. They are not yet supported for other granularities such as columns or rows.
- The `root` user automatically belongs to the `admin` role and has the `ALL` privilege for new databases.
- For privileges required by specific statements, see the documentation for the respective [SQL statement](../sql-statements.html).

### Default privileges

By default, CockroachDB grants the current role/user `ALL` privileges on the objects that they create.

To view the default privileges for a role, or for a set of roles, use the [`SHOW DEFAULT PRIVILEGES`](../show-default-privileges.html) statement.

To change the default privileges on objects that a user creates, use the [`ALTER DEFAULT PRIVILEGES`](../alter-default-privileges.html) statement.

The creator of an object is also the object's [owner](#object-ownership). Any roles that are members of the owner role have `ALL` privileges on the object, independent of the default privileges. Altering the default privileges of objects created by a role does not affect that role's privileges as the object's owner. The default privileges granted to other users/roles are always in addition to the ownership (i.e., `ALL`) privileges given to the creator of the object.

For more examples of default privileges, see the examples on the [`SHOW DEFAULT PRIVILEGES`](../show-default-privileges.html#examples) and [`ALTER DEFAULT PRIVILEGES`](../alter-default-privileges.html#examples) statement pages.

## Role options

Users' authorization to perform certain actions are governed not by grants but by [`role options`](../create-user.html#role-options). These options govern whether users can perform actions such as:

- Viewing or canceling ongoing queries and sessions owned by other roles.
- Pausing, resuming, and canceling jobs.
- Creating or renaming databases.
- Managing authentication for other users.
- Modifying cluster settings.
- Creating changefeeds.

## Authorization best practices

We recommend the following best practices to set up access control for your clusters:

- Use the `root` user only for database administration tasks such as creating and managing other [users](#sql-users), creating and managing [roles](#roles), and creating and managing databases. Do not use the `root` user for applications; instead, create users or roles with specific [privileges](#managing-privileges) based on your application’s access requirements.
- Use the [Principle of Least Privilege (PoLP)](https://en.wikipedia.org/wiki/Principle_of_least_privilege) as a golden rule when to designing your system of privilege grants.

  For improved performance, CockroachDB securely caches [authentication information for users](../authentication.html#client-authentication). To limit the authentication latency of users logging into a new session, we recommend the following best practices for `ROLE` operations ([`CREATE ROLE`](../create-role.html), [`ALTER ROLE`](../alter-role.html), [`DROP ROLE`](../drop-role.html)):

- Run bulk `ROLE` operations inside a transaction.
- Run regularly-scheduled `ROLE` operations together, rather than at different times throughout the day.
- Generally, if a [system-level privilege](#system-level-privileges) exists with the same name as a [role option](#role-options), the system-level privilege should be used. 
