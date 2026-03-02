---
title: CREATE ROLE
summary: The CREATE ROLE statement creates SQL roles, which are groups containing any number of roles and users as members.
toc: true
docs_area: reference.sql
---

The `CREATE ROLE` [statement]({% link {{ page.version.version }}/sql-statements.md %}) creates SQL [roles]({% link {{ page.version.version }}/security-reference/authorization.md %}#users-and-roles), which are groups containing any number of roles and users as members. You can assign [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#privileges) to roles, and all members of the role (regardless of whether if they are direct or indirect members) will inherit the role's privileges.

You can use the keywords `ROLE` and `USER` interchangeably. [`CREATE USER`]({% link {{ page.version.version }}/create-user.md %}) is equivalent to `CREATE ROLE`, with one exception: `CREATE ROLE` sets the `NOLOGIN` [role option](#role-options), which prevents the new role from being used to log in to the database. You can use `CREATE ROLE` and specify the `LOGIN` [role option](#role-options) to achieve the same result as `CREATE USER`.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Considerations

- After creating a role, you must [grant it privileges to databases and tables]({% link {{ page.version.version }}/grant.md %}).
- All [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#privileges) of a role are inherited by all of its members.
- Users and roles can be members of roles.
- Role options of a role are not inherited by any of its members.
- There is no limit to the number of members in a role.
- Membership loops are not allowed (direct: `A is a member of B is a member of A` or indirect: `A is a member of B is a member of C ... is a member of A`).

## Required privileges

Unless a role is a member of the `admin` role, additional [privileges](#parameters) are required to manage other roles.

- To create other roles, a role must have the [`CREATEROLE`](#create-a-role-that-can-create-other-roles-and-manage-authentication-methods-for-the-new-roles) [role option](#role-options).
- To add the `LOGIN` capability for other roles so that they can log in as users, a role must also have the [`CREATELOGIN`](#create-a-role-that-can-create-other-roles-and-manage-authentication-methods-for-the-new-roles) role option.
- To be able to grant or revoke membership to a role for additional roles, a member of the role must be set as a [role admin]({% link {{ page.version.version }}/security-reference/authorization.md %}#role-admin) for that role.

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
- Cannot start with `pg_` or `crdb_internal`. Object names with these prefixes are reserved for [system catalogs]({% link {{ page.version.version }}/system-catalogs.md %}).
- User and role names share the same namespace and must be unique.

### Role options

{% include {{page.version.version}}/sql/role-options.md %}

## Examples

To run the following examples, [start a secure single-node cluster]({% link {{ page.version.version }}/cockroach-start-single-node.md %}) and use the built-in SQL shell:

~~~ shell
$ cockroach sql --certs-dir=certs
~~~

~~~ sql
> SHOW ROLES;
~~~

~~~
username | options | member_of | estimated_last_login_time
---------+---------+-----------+------------------------------
admin    | {}      | {}        | NULL
root     | {}      | {admin}   | NULL
(2 rows)
~~~

{{site.data.alerts.callout_info}}
The following statements are run by the `root` user that is a member of the `admin` role and has `ALL` privileges.
{{site.data.alerts.end}}

### Create a role

Role names are case-insensitive; must start with a letter, number, or underscore; must contain only letters, numbers, periods, or underscores; and must be between 1 and 63 characters.

~~~ sql
CREATE ROLE no_options;
~~~

~~~ sql
SHOW ROLES;
~~~

~~~
username   | options   | member_of | estimated_last_login_time
-----------+-----------+-----------+------------------------------
admin      | {}        | {}        | NULL
no_options | {NOLOGIN} | {}        | NULL
root       | {}        | {admin}   | NULL
(3 rows)
~~~

After creating roles, you must [grant them privileges to databases]({% link {{ page.version.version }}/grant.md %}).

### Create a role that can log in to the database

~~~ sql
CREATE ROLE can_login WITH LOGIN PASSWORD '$tr0nGpassW0rD' VALID UNTIL '2021-10-10';
~~~

~~~ sql
SHOW ROLES;
~~~

~~~
 username  |                     options                     | member_of | estimated_last_login_time
-----------+-------------------------------------------------+-----------+------------------------------
admin      | {}                                              | {}        | NULL
can_login  | {VALID UNTIL=2025-10-10 00:00:00+00:00}         | {}        | NULL
no_options | {NOLOGIN}                                       | {}        | NULL
root       | {}                                              | {admin}   | NULL
(4 rows)
~~~

### Prevent a role from using password authentication

The following statement prevents the role from using password authentication and mandates certificate-based client authentication:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE ROLE no_password WITH PASSWORD NULL;
~~~

~~~ sql
SHOW ROLES;
~~~

~~~
 username  |                     options                     | member_of | estimated_last_login_time
-----------+-------------------------------------------------+-----------+------------------------------
admin      | {}                                              | {}        | NULL
can_login  | {VALID UNTIL=2025-10-10 00:00:00+00:00}         | {}        | NULL
no_options | {NOLOGIN}                                       | {}        | NULL
no_password| {NOLOGIN}                                       | {}        | NULL
root       | {}                                              | {admin}   | NULL
(5 rows)
~~~

### Create a role that can create other roles and manage authentication methods for the new roles

The following example allows the role to [create other users]({% link {{ page.version.version }}/create-role.md %}) and [manage authentication methods]({% link {{ page.version.version }}/authentication.md %}#client-authentication) for them:

~~~ sql
CREATE ROLE can_create_role WITH CREATEROLE CREATELOGIN;
~~~

~~~ sql
SHOW ROLES;
~~~

~~~
   username     |                     options                     | member_of | estimated_last_login_time
----------------+-------------------------------------------------+-----------+------------------------------
admin           | {}                                              | {}        | NULL
can_create_role | {CREATELOGIN,CREATEROLE,NOLOGIN}                | {}        | NULL
can_login       | {VALID UNTIL=2025-10-10 00:00:00+00:00}         | {}        | NULL
no_options      | {NOLOGIN}                                       | {}        | NULL
no_password     | {NOLOGIN}                                       | {}        | NULL
root            | {}                                              | {admin}   | NULL
(6 rows)
~~~

### Create a role that can create and rename databases

The following example allows the role to [create]({% link {{ page.version.version }}/create-database.md %}) or [rename]({% link {{ page.version.version }}/alter-database.md %}#rename-to) databases:

~~~ sql
CREATE ROLE can_create_db WITH CREATEDB;
~~~

~~~ sql
SHOW ROLES;
~~~

~~~
      username        |                     options                     | member_of | estimated_last_login_time
----------------------+-------------------------------------------------+-----------+------------------------------
admin                 | {}                                              | {}        | NULL
can_create_db         | {CREATEDB,NOLOGIN}                              | {}        | NULL
can_create_role       | {CREATELOGIN,CREATEROLE,NOLOGIN}                | {}        | NULL
can_login             | {VALID UNTIL=2025-10-10 00:00:00+00:00}         | {}        | NULL
no_options            | {NOLOGIN}                                       | {}        | NULL
no_password           | {NOLOGIN}                                       | {}        | NULL
root                  | {}                                              | {admin}   | NULL
(7 rows)
~~~

### Create a role that can pause, resume, and cancel non-admin jobs

The following example allows the role to [pause]({% link {{ page.version.version }}/pause-job.md %}), [resume]({% link {{ page.version.version }}/resume-job.md %}), and [cancel]({% link {{ page.version.version }}/cancel-job.md %}) jobs:

~~~ sql
CREATE ROLE can_control_job WITH CONTROLJOB;
~~~

~~~ sql
SHOW ROLES;
~~~

~~~
      username        |                     options                     | member_of | estimated_last_login_time
----------------------+-------------------------------------------------+-----------+------------------------------
admin                 | {}                                              | {}        | NULL
can_control_job       | {CONTROLJOB,NOLOGIN}                            | {}        | NULL
can_create_db         | {CREATEDB,NOLOGIN}                              | {}        | NULL
can_create_role       | {CREATELOGIN,CREATEROLE,NOLOGIN}                | {}        | NULL
can_login             | {VALID UNTIL=2025-10-10 00:00:00+00:00}         | {}        | NULL
manage_auth_for_roles | {CREATELOGIN,NOLOGIN}                           | {}        | NULL
no_options            | {NOLOGIN}                                       | {}        | NULL
no_password           | {NOLOGIN}                                       | {}        | NULL
root                  | {}                                              | {admin}   | NULL
(8 rows)
~~~

### Create a role that can see and cancel non-admin queries and sessions

The following example allows the role to cancel [queries]({% link {{ page.version.version }}/cancel-query.md %}) and [sessions]({% link {{ page.version.version }}/cancel-session.md %}) for other non-`admin` roles:

~~~ sql
CREATE ROLE can_manage_queries WITH CANCELQUERY VIEWACTIVITY;
~~~

~~~ sql
SHOW ROLES;
~~~

~~~
      username        |                     options                     | member_of | estimated_last_login_time
----------------------+-------------------------------------------------+-----------+------------------------------
admin                 | {}                                              | {}        | NULL
can_control_job       | {CONTROLJOB,NOLOGIN}                            | {}        | NULL
can_create_db         | {CREATEDB,NOLOGIN}                              | {}        | NULL
can_create_role       | {CREATELOGIN,CREATEROLE,NOLOGIN}                | {}        | NULL
can_login             | {VALID UNTIL=2025-10-10 00:00:00+00:00}         | {}        | NULL
can_manage_queries    | {CANCELQUERY,NOLOGIN,VIEWACTIVITY}              | {}        | NULL
no_options            | {NOLOGIN}                                       | {}        | NULL
no_password           | {NOLOGIN}                                       | {}        | NULL
root                  | {}                                              | {admin}   | NULL
(9 rows)
~~~

### Create a role that can control changefeeds

The following example allows the role to run [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}):

~~~ sql
CREATE ROLE can_control_changefeed WITH CONTROLCHANGEFEED;
~~~

~~~ sql
SHOW ROLES;
~~~

~~~
       username        |                     options                     | member_of | estimated_last_login_time
-----------------------+-------------------------------------------------+-----------+------------------------------
admin                  | {}                                              | {}        | NULL
can_control_changefeed | {CONTROLCHANGEFEED,NOLOGIN}                     | {}        | NULL
can_control_job        | {CONTROLJOB,NOLOGIN}                            | {}        | NULL
can_create_db          | {CREATEDB,NOLOGIN}                              | {}        | NULL
can_create_role        | {CREATELOGIN,CREATEROLE,NOLOGIN}                | {}        | NULL
can_login              | {VALID UNTIL=2025-10-10 00:00:00+00:00}         | {}        | NULL
can_manage_queries     | {CANCELQUERY,NOLOGIN,VIEWACTIVITY}              | {}        | NULL
no_options             | {NOLOGIN}                                       | {}        | NULL
no_password            | {NOLOGIN}                                       | {}        | NULL
root                   | {}                                              | {admin}   | NULL
(10 rows)
~~~

### Create a role that can modify cluster settings

The following example allows the role to modify [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}):

~~~ sql
CREATE ROLE can_modify_cluster_setting WITH MODIFYCLUSTERSETTING;
~~~

~~~ sql
SHOW ROLES;
~~~

~~~
         username          |                     options                     | member_of | estimated_last_login_time
---------------------------+-------------------------------------------------+-----------+------------------------------
admin                      | {}                                              | {}        | NULL
can_control_changefeed     | {CONTROLCHANGEFEED,NOLOGIN}                     | {}        | NULL
can_control_job            | {CONTROLJOB,NOLOGIN}                            | {}        | NULL
can_create_db              | {CREATEDB,NOLOGIN}                              | {}        | NULL
can_create_role            | {CREATELOGIN,CREATEROLE,NOLOGIN}                | {}        | NULL
can_login                  | {VALID UNTIL=2025-10-10 00:00:00+00:00}         | {}        | NULL
can_manage_queries         | {CANCELQUERY,NOLOGIN,VIEWACTIVITY}              | {}        | NULL
can_modify_cluster_setting | {MODIFYCLUSTERSETTING,NOLOGIN}                  | {}        | NULL
no_options                 | {NOLOGIN}                                       | {}        | NULL
no_password                | {NOLOGIN}                                       | {}        | NULL
root                       | {}                                              | {admin}   | NULL
(11 rows)
~~~

### Create a role that can bypass row-level security (RLS)

To create a [role]({% link {{ page.version.version }}/security-reference/authorization.md %}#users-and-roles) that can bypass [row-level security]({% link {{ page.version.version }}/row-level-security.md %}), execute the following statement to grant the [`BYPASSRLS`]({% link {{ page.version.version }}/security-reference/authorization.md %}#bypassrls) privilege:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE ROLE can_bypassrls WITH BYPASSRLS;
~~~

For instructions showing how to alter a role to add or remove the `BYPASSRLS` privilege, refer to [`ALTER ROLE`]({% link {{ page.version.version }}/alter-role.md %}#allow-a-role-to-bypass-row-level-security-rls).

### Set the `SUBJECT` role option for certificate based authentication

{% include {{page.version.version}}/sql/role-subject-option.md %}

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE ROLE maxroach WITH SUBJECT 'CN=myName,OU=myOrgUnit,O=myOrg,L=myLocality,ST=myState,C=myCountry' LOGIN;
~~~

{% include {{page.version.version}}/misc/cert-auth-using-x509-subject.md %}

## See also

- [Authorization]({% link {{ page.version.version }}/authorization.md %})
- [Authorization Best Practices]({% link {{ page.version.version }}/security-reference/authorization.md %}#authorization-best-practices)
- [`ALTER ROLE`]({% link {{ page.version.version }}/alter-role.md %})
- [`DROP ROLE`]({% link {{ page.version.version }}/drop-role.md %})
- [`GRANT`]({% link {{ page.version.version }}/grant.md %})
- [`REVOKE`]({% link {{ page.version.version }}/revoke.md %})
- [`SHOW ROLES`]({% link {{ page.version.version }}/show-roles.md %})
- [`SHOW USERS`]({% link {{ page.version.version }}/show-users.md %})
- [`SHOW GRANTS`]({% link {{ page.version.version }}/show-grants.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %})
