---
title: CREATE ROLE
summary: The CREATE ROLE statement creates SQL roles, which are groups containing any number of roles and users as members.
toc: true
docs_area: reference.sql
---

The `CREATE ROLE` [statement](sql-statements.html) creates SQL [roles](security-reference/authorization.html#users-and-roles), which are groups containing any number of roles and users as members. You can assign [privileges](security-reference/authorization.html#privileges) to roles, and all members of the role (regardless of whether if they are direct or indirect members) will inherit the role's privileges.

You can use the keywords `ROLE` and `USER` interchangeably. [`CREATE USER`](create-user.html) is equivalent to `CREATE ROLE`, with one exception: `CREATE ROLE` sets the `NOLOGIN` [role option](#role-options), which prevents the new role from being used to log in to the database. You can use `CREATE ROLE` and specify the `LOGIN` [role option](#role-options) to achieve the same result as `CREATE USER`.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Considerations

- After creating a role, you must [grant it privileges to databases and tables](grant.html).
- All [privileges](security-reference/authorization.html#privileges) of a role are inherited by all of its members.
- Users and roles can be members of roles.
- Role options of a role are not inherited by any of its members.
- There is no limit to the number of members in a role.
- Membership loops are not allowed (direct: `A is a member of B is a member of A` or indirect: `A is a member of B is a member of C ... is a member of A`).

## Required privileges

Unless a role is a member of the `admin` role, additional [privileges](#parameters) are required to manage other roles.

- To create other roles, a role must have the [`CREATEROLE`](#create-a-role-that-can-create-other-roles-and-manage-authentication-methods-for-the-new-roles) [role option](#role-options).
- To add the `LOGIN` capability for other roles so that they can log in as users, a role must also have the [`CREATELOGIN`](#create-a-role-that-can-create-other-roles-and-manage-authentication-methods-for-the-new-roles) role option.
- To be able to grant or revoke membership to a role for additional roles, a member of the role must be set as a [role admin](security-reference/authorization.html#role-admin) for that role.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_role.html %}
</div>

## Parameters

Parameter | Description
----------|-------------
`name` | The name of the role to create.
`WITH role_option` | Apply a [role option](#role-options) to a role.

### Role names

- Are case-insensitive.
- Must start with either a letter or underscore.
- Must contain only letters, numbers, periods, or underscores.
- Must be between 1 and 63 characters.
- Cannot be `none`.
- Cannot start with `pg_` or `crdb_internal`. Object names with these prefixes are reserved for [system catalogs](system-catalogs.html).
- User and role names share the same namespace and must be unique.

### Role options

{% include {{page.version.version}}/sql/role-options.md %}

## Examples

To run the following examples, [start a secure single-node cluster](cockroach-start-single-node.html) and use the built-in SQL shell:

~~~ shell
$ cockroach sql --certs-dir=certs
~~~

~~~ sql
> SHOW ROLES;
~~~

~~~
username | options | member_of
---------+---------+------------
admin    |         | {}
root     |         | {admin}
(2 rows)
~~~

{{site.data.alerts.callout_info}}
The following statements are run by the `root` user that is a member of the `admin` role and has `ALL` privileges.
{{site.data.alerts.end}}

### Create a role

Role names are case-insensitive; must start with a letter, number, or underscore; must contain only letters, numbers, periods, or underscores; and must be between 1 and 63 characters.

~~~ sql
root@:26257/defaultdb> CREATE ROLE no_options;
~~~

~~~ sql
root@:26257/defaultdb> SHOW ROLES;
~~~

~~~
 username  | options | member_of
 ----------+---------+------------
admin      |         | {}
no_options | NOLOGIN | {}
root       |         | {admin}
(3 rows)
~~~

After creating roles, you must [grant them privileges to databases](grant.html).

### Create a role that can log in to the database

~~~ sql
root@:26257/defaultdb> CREATE ROLE can_login WITH LOGIN PASSWORD '$tr0nGpassW0rD' VALID UNTIL '2021-10-10';
~~~

~~~ sql
root@:26257/defaultdb> SHOW ROLES;
~~~

~~~
 username  |                options                | member_of
-----------+---------------------------------------+------------
admin      |                                       | {}
can_login  | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
no_options | NOLOGIN                               | {}
root       |                                       | {admin}
(4 rows)
~~~

### Prevent a role from using password authentication

The following statement prevents the role from using password authentication and mandates certificate-based client authentication:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE ROLE no_password WITH PASSWORD NULL;
~~~

~~~ sql
root@:26257/defaultdb> SHOW ROLES;
~~~

~~~
 username  |                options                | member_of
-----------+---------------------------------------+------------
admin      |                                       | {}
can_login  | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
no_options | NOLOGIN                               | {}
no_password| NOLOGIN                               | {}
root       |                                       | {admin}
(5 rows)
~~~

### Create a role that can create other roles and manage authentication methods for the new roles

The following example allows the role to [create other users](create-role.html) and [manage authentication methods](authentication.html#client-authentication) for them:

~~~ sql
root@:26257/defaultdb> CREATE ROLE can_create_role WITH CREATEROLE CREATELOGIN;
~~~

~~~ sql
root@:26257/defaultdb> SHOW ROLES;
~~~

~~~
   username     |                options                | member_of
----------------+---------------------------------------+------------
admin           |                                       | {}
can_create_role | CREATELOGIN, CREATEROLE, NOLOGIN      | {}
can_login       | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
no_options      | NOLOGIN                               | {}
no_password     | NOLOGIN                               | {}
root            |                                       | {admin}
(6 rows)
~~~

### Create a role that can create and rename databases

The following example allows the role to [create](create-database.html) or [rename](alter-database.html#rename-to) databases:

~~~ sql
root@:26257/defaultdb> CREATE ROLE can_create_db WITH CREATEDB;
~~~

~~~ sql
root@:26257/defaultdb> SHOW ROLES;
~~~

~~~
      username        |                options                | member_of
----------------------+---------------------------------------+------------
admin                 |                                       | {}
can_create_db         | CREATEDB, NOLOGIN                     | {}
can_create_role       | CREATELOGIN, CREATEROLE, NOLOGIN      | {}
can_login             | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
no_options            | NOLOGIN                               | {}
no_password           | NOLOGIN                               | {}
root                  |                                       | {admin}
(7 rows)
~~~

### Create a role that can pause, resume, and cancel non-admin jobs

The following example allows the role to [pause](pause-job.html), [resume](resume-job.html), and [cancel](cancel-job.html) jobs:

~~~ sql
root@:26257/defaultdb> CREATE ROLE can_control_job WITH CONTROLJOB;
~~~

~~~ sql
root@:26257/defaultdb> SHOW ROLES;
~~~

~~~
      username        |                options                | member_of
----------------------+---------------------------------------+------------
admin                 |                                       | {}
can_control_job       | CONTROLJOB, NOLOGIN                   | {}
can_create_db         | CREATEDB, NOLOGIN                     | {}
can_create_role       | CREATELOGIN, CREATEROLE, NOLOGIN      | {}
can_login             | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
manage_auth_for_roles | CREATELOGIN, NOLOGIN                  | {}
no_options            | NOLOGIN                               | {}
no_password           | NOLOGIN                               | {}
root                  |                                       | {admin}
(8 rows)
~~~

### Create a role that can see and cancel non-admin queries and sessions

The following example allows the role to cancel [queries](cancel-query.html) and [sessions](cancel-session.html) for other non-`admin` roles:

~~~ sql
root@:26257/defaultdb> CREATE ROLE can_manage_queries WITH CANCELQUERY VIEWACTIVITY;
~~~

~~~ sql
root@:26257/defaultdb> SHOW ROLES;
~~~

~~~
      username        |                options                | member_of
----------------------+---------------------------------------+------------
admin                 |                                       | {}
can_control_job       | CONTROLJOB, NOLOGIN                   | {}
can_create_db         | CREATEDB, NOLOGIN                     | {}
can_create_role       | CREATELOGIN, CREATEROLE, NOLOGIN      | {}
can_login             | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
can_manage_queries    | CANCELQUERY, NOLOGIN, VIEWACTIVITY    | {}
no_options            | NOLOGIN                               | {}
no_password           | NOLOGIN                               | {}
root                  |                                       | {admin}
(9 rows)
~~~

### Create a role that can control changefeeds

The following example allows the role to run [`CREATE CHANGEFEED`](create-changefeed.html):

~~~ sql
root@:26257/defaultdb> CREATE ROLE can_control_changefeed WITH CONTROLCHANGEFEED;
~~~

~~~ sql
root@:26257/defaultdb> SHOW ROLES;
~~~

~~~
       username        |                options                | member_of
-----------------------+---------------------------------------+------------
admin                  |                                       | {}
can_control_changefeed | CONTROLCHANGEFEED, NOLOGIN            | {}
can_control_job        | CONTROLJOB, NOLOGIN                   | {}
can_create_db          | CREATEDB, NOLOGIN                     | {}
can_create_role        | CREATELOGIN, CREATEROLE, NOLOGIN      | {}
can_login              | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
can_manage_queries     | CANCELQUERY, NOLOGIN, VIEWACTIVITY    | {}
no_options             | NOLOGIN                               | {}
no_password            | NOLOGIN                               | {}
root                   |                                       | {admin}
(10 rows)
~~~

### Create a role that can modify cluster settings

The following example allows the role to modify [cluster settings](cluster-settings.html):

~~~ sql
root@:26257/defaultdb> CREATE ROLE can_modify_cluster_setting WITH MODIFYCLUSTERSETTING;
~~~

~~~ sql
root@:26257/defaultdb> SHOW ROLES;
~~~

~~~
         username          |                options                | member_of
---------------------------+---------------------------------------+------------
admin                      |                                       | {}
can_control_changefeed     | CONTROLCHANGEFEED, NOLOGIN            | {}
can_control_job            | CONTROLJOB, NOLOGIN                   | {}
can_create_db              | CREATEDB, NOLOGIN                     | {}
can_create_role            | CREATELOGIN, CREATEROLE, NOLOGIN      | {}
can_login                  | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
can_manage_queries         | CANCELQUERY, NOLOGIN, VIEWACTIVITY    | {}
can_modify_cluster_setting | MODIFYCLUSTERSETTING, NOLOGIN         | {}
no_options                 | NOLOGIN                               | {}
no_password                | NOLOGIN                               | {}
root                       |                                       | {admin}
(11 rows)
~~~

## See also

- [Authorization](authorization.html)
- [Authorization Best Practices](security-reference/authorization.html#authorization-best-practices)
- [`ALTER ROLE`](alter-role.html)
- [`DROP ROLE`](drop-role.html)
- [`GRANT`](grant.html)
- [`REVOKE`](revoke.html)
- [`SHOW ROLES`](show-roles.html)
- [`SHOW USERS`](show-users.html)
- [`SHOW GRANTS`](show-grants.html)
- [SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
