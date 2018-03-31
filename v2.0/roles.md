---
title: Managing roles
summary: Roles allow grouping of users and easier privilege management.
toc: false
---

<div id="toc"></div>

## Summary

A role can be seen as a group containing any number of roles or users as members.

Roles can have privileges on SQL objects. Any member of the role (directly a member,
or indirectly by being a member-of-a-member) inherits all privileges of the role.

## Rules

Roles follow a few rules:

- roles cannot login (they do not have a password and cannot use certs)
- roles and users share the same namespace (ie: if a user `marc` exists, we cannot create a role `marc`)
- users and roles can be members of roles
- membership loops are not allowed (direct: `A ∈ B ∈ A` or indirect: `A ∈ B ∈ C ... ∈ A`)
- all privileges of a role are inherited by all its members
- privileges on a table/database can be assigned to roles and users
- only superusers (members of the `admin` role) can create/drop roles
- role admins (members with the `ADMIN OPTION`) and superusers can modify role memberships
- a role cannot be dropped if it still has privileges
- there is no limit (minimum or maximum) to the number of members of a role
- the `admin` role cannot be dropped, and `root` must always be a member of `admin`

## Superusers and the `admin` role

A new role `admin` exists by default with `root` as the only member. All members of the `admin`
role are considered super users and can perform any task on the cluster.

## Creating and dropping roles

Creating and dropping roles requires an enterprise license.

Viewing existing roles can be done without an enterprise license.

Roles can only be created and dropped by super users (members of the `admin` role).

Statements:

~~~ sql
# Create a role.
> CREATE ROLE [IF NOT EXISTS] <role>

# Drop one or more role.
> DROP ROLE [IF EXISTS] <role> [, <role>]

# List existing roles.
> SHOW ROLES;
~~~

## Managing role memberships

Modifying roles memberships requires an enterprise license.

Viewing existing role memberships can be done without an enterprice license.

Role memberships can be modified by either:
- super users
- members of a role with the `ADMIN OPTION`

Statements:

~~~ sql
# Add member(s) to a role.
> GRANT <role, ...> TO <grantee, ...> [WITH ADMIN OPTION]

# Remove member(s) of a role.
> REVOKE [ADMIN OPTION FOR] <role, ...> FROM <grantee, ...>
~~~

The `ADMIN OPTION` can be added to an existing role: eg:

~~~ sql
# Add a member to a role without the admin option:
> GRANT myrole TO myuser

# Add the admin option to an existing membership:
> GRANT myrole TO myuser WITH ADMIN OPTION
~~~

Or removed from an existing role (without removing the membership):

~~~ sql
# Remove admin option for a membership:
> REVOKE ADMIN OPTION FOR myrole FROM myuser

# Remove the membership:
> REVOKE myrole FROM myuser
~~~

Existing role memberships can be seen using `SHOW GRANTS ON ROLE`:

~~~ sql
> SHOW GRANTS ON ROLE [role, ...] [ FOR <grantee, ...> ]
# Show all role memberships:
> SHOW GRANTS ON ROLE
# Show role memberships in two roles:
> SHOW GRANTS ON ROLE admin, foo
# Show role memberships for two members:
> SHOW GRANTS ON ROLE FOR root, bar
~~~

Or in in the `pg_catalog.pg_auth_members` table:

~~~ sql
> SELECT * FROM pg_catalog.pg_auth_members;
+------------+------------+---------+--------------+
|   roleid   |   member   | grantor | admin_option |
+------------+------------+---------+--------------+
|  823966177 | 2901009604 | NULL    |     true     |
| 3723173618 | 2350666299 | NULL    |     true     |
+------------+------------+---------+--------------+
~~~


## Using privileges with roles

Granting and revoking privileges for roles does not require an enterprise license.

[`GRANT`](grant.html) and [`REVOKE`](revoke.html) for privileges accept both user names and role names
as the grantees.

eg: given `myrole` as a role above, we can grant it privileges on a database:

~~~ sql
> GRANT ALL ON DATABASE foo TO myrole
~~~

Any member of `myrole` implicitly inherits its privileges.

