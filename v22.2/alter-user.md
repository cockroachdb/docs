---
title: ALTER USER
summary: The ALTER USER statement can be used to add or change a user's password.
toc: true
docs_area: reference.sql
---

The `ALTER USER` [statement](sql-statements.html) can be used to add, change, or remove a [user's](create-user.html) password and to change the role options for a user.

You can use the keywords `ROLE` and `USER` interchangeably. `ALTER USER` is an alias for [`ALTER ROLE`](alter-role.html).

## Considerations

- Password creation and alteration is supported only in secure clusters.

## Required privileges

To alter other users, the user must be a member of the `admin` role or have the [`CREATEROLE`](create-role.html#create-a-role-that-can-create-other-roles-and-manage-authentication-methods-for-the-new-roles) [role option](#role-options).

## Synopsis

See [`ALTER ROLE`: Synopsis](alter-role.html#synopsis).

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

Parameter | Description
----------|-------------
`name` | The name of the user whose password or role options to alter.

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

The following statement prevents the user from using password authentication and mandates certificate-based [client authentication](authentication.html#client-authentication):

{% include_cached copy-clipboard.html %}
~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH PASSWORD NULL;
~~~

### Allow a user to create other users and manage authentication methods for the new users

The following example allows the user to [create other users](create-user.html) and [manage authentication methods](authentication.html#client-authentication) for them:

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH CREATEROLE CREATELOGIN;
~~~

### Allow a user to create and rename databases

The following example allows the user to [create](create-database.html) or [rename](rename-database.html) databases:

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH CREATEDB;
~~~

### Allow a user to pause, resume, and cancel non-admin jobs

The following example allows the user to [pause](pause-job.html), [resume](resume-job.html), and [cancel](cancel-job.html) jobs:

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH CONTROLJOB;
~~~

### Allow a user to see and cancel non-admin queries and sessions

The following example allows the user to cancel [queries](cancel-query.html) and [sessions](cancel-session.html) for other non-`admin` roles:

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH CANCELQUERY VIEWACTIVITY;
~~~

### Allow a user to control changefeeds

The following example allows the user to run [`CREATE CHANGEFEED`](create-changefeed.html):

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH CONTROLCHANGEFEED;
~~~

### Allow a user to modify cluster settings

The following example allows the user to modify [cluster settings](cluster-settings.html):

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH MODIFYCLUSTERSETTING;
~~~

## See also

- [`DROP USER`](drop-user.html)
- [`SHOW USERS`](show-users.html)
- [`GRANT`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [Create Security Certificates](cockroach-cert.html)
- [SQL Statements](sql-statements.html)
