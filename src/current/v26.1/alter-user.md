---
title: ALTER USER
summary: The ALTER USER statement can be used to add or change a user's password.
toc: true
docs_area: reference.sql
---

The `ALTER USER` [statement]({% link {{ page.version.version }}/sql-statements.md %}) can be used to add, change, or remove a [user's]({% link {{ page.version.version }}/create-user.md %}) password and to change the role options for a user.

You can use the keywords `ROLE` and `USER` interchangeably. `ALTER USER` is an alias for [`ALTER ROLE`]({% link {{ page.version.version }}/alter-role.md %}).

## Considerations

- Password creation and alteration is supported only in secure clusters.

## Required privileges

To alter other users, the user must be a member of the `admin` role or have the [`CREATEROLE`]({% link {{ page.version.version }}/create-role.md %}#create-a-role-that-can-create-other-roles-and-manage-authentication-methods-for-the-new-roles) [role option](#role-options).

## Synopsis

See [`ALTER ROLE`: Synopsis]({% link {{ page.version.version }}/alter-role.md %}#synopsis).

## Parameters

Parameter | Description
----------|-------------
`name` | The name of the user whose password or role options to alter.

### Role options

{% include {{page.version.version}}/sql/role-options.md %}

## Examples

{{site.data.alerts.callout_info}}
The following statements are run by the `root` user that is a member of the `admin` role and has `ALL` privileges.
{{site.data.alerts.end}}

### Change a user's password

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH PASSWORD 'An0ther$tr0nGpassW0rD' VALID UNTIL '2021-10-10';
~~~

### Prevent a user from using password authentication

The following statement prevents the user from using password authentication and mandates certificate-based [client authentication]({% link {{ page.version.version }}/authentication.md %}#client-authentication):

{% include_cached copy-clipboard.html %}
~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH PASSWORD NULL;
~~~

### Allow a user to create other users and manage authentication methods for the new users

The following example allows the user to [create other users]({% link {{ page.version.version }}/create-user.md %}) and [manage authentication methods]({% link {{ page.version.version }}/authentication.md %}#client-authentication) for them:

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH CREATEROLE CREATELOGIN;
~~~

### Allow a user to create and rename databases

The following example allows the user to [create]({% link {{ page.version.version }}/create-database.md %}) or [rename]({% link {{ page.version.version }}/alter-database.md %}#rename-to) databases:

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH CREATEDB;
~~~

### Allow a user to pause, resume, and cancel non-admin jobs

The following example allows the user to [pause]({% link {{ page.version.version }}/pause-job.md %}), [resume]({% link {{ page.version.version }}/resume-job.md %}), and [cancel]({% link {{ page.version.version }}/cancel-job.md %}) jobs:

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH CONTROLJOB;
~~~

### Allow a user to see and cancel non-admin queries and sessions

The following example allows the user to cancel [queries]({% link {{ page.version.version }}/cancel-query.md %}) and [sessions]({% link {{ page.version.version }}/cancel-session.md %}) for other non-`admin` roles:

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH CANCELQUERY VIEWACTIVITY;
~~~

### Allow a user to control changefeeds

The following example allows the user to run [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}):

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH CONTROLCHANGEFEED;
~~~

### Allow a user to modify cluster settings

The following example allows the user to modify [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}):

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH MODIFYCLUSTERSETTING;
~~~

## See also

- [`DROP USER`]({% link {{ page.version.version }}/drop-user.md %})
- [`SHOW USERS`]({% link {{ page.version.version }}/show-users.md %})
- [`GRANT`]({% link {{ page.version.version }}/grant.md %})
- [`SHOW GRANTS`]({% link {{ page.version.version }}/show-grants.md %})
- [Create Security Certificates]({% link {{ page.version.version }}/cockroach-cert.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
