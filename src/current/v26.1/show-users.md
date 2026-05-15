---
title: SHOW USERS
summary: The SHOW USERS statement lists the users for all databases.
toc: true
docs_area: reference.sql
---

The `SHOW USERS` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lists the users for all databases.

{{site.data.alerts.callout_info}}
 Since the keywords `ROLES` and `USERS` can now be used interchangeably in SQL statements for enhanced PostgreSQL compatibility, `SHOW USERS` is now an alias for [`SHOW ROLES`]({% link {{ page.version.version }}/show-roles.md %}).
{{site.data.alerts.end}}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_users.html %}
</div>

## Required privileges

The user must have the [`SELECT`]({% link {{ page.version.version }}/select-clause.md %}) [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the `system.users` and `system.role_members` tables.

## Example

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW USERS;
~~~

~~~
  username |    options     | member_of | estimated_last_login_time
-----------+----------------+-----------+------------------------------
  admin    | {CREATEROLE}   | {}        | NULL
  carl     | {NOLOGIN}      | {}        | NULL
  petee    | {}             | {}        | 2025-08-04 19:18:00.201402+00
  root     | {CREATEROLE}   | {admin}   | NULL
(4 rows)
~~~

Alternatively, within the built-in SQL shell, you can use the `\du` [shell command]({% link {{ page.version.version }}/cockroach-sql.md %}#commands):

{% include_cached copy-clipboard.html %}
~~~ sql
> \du
~~~

~~~
  username |    options     | member_of | estimated_last_login_time
-----------+----------------+-----------+------------------------------
  admin    | {CREATEROLE}   | {}        | NULL
  carl     | {NOLOGIN}      | {}        | NULL
  petee    | {}             | {}        | 2025-08-04 19:18:00.201402+00
  root     | {CREATEROLE}   | {admin}   | NULL
(4 rows)
~~~

## See also

- [`CREATE USER`]({% link {{ page.version.version }}/create-user.md %})
- [Manage Users]({% link {{ page.version.version }}/security-reference/authorization.md %}#create-and-manage-users)

<!-- REF DOC DRAFT: The following content was auto-generated. Please integrate into the sections above and remove this comment block. -->

## Required privileges

The user must have the [`VIEWACTIVITY`]({% link {{ page.version.version }}/create-user.md %}#create-a-user-that-can-see-and-cancel-non-admin-queries-and-sessions) privilege or be a member of the `admin` role.

## Synopsis

{% include_cached copy-clipboard.html %}
~~~
SHOW USERS [WITH <options>] [LIMIT <n>]
~~~

Where `<options>` can include:

- `SOURCE = <string>`
- `LAST LOGIN BEFORE <expr>`

Multiple options can be comma-separated.

## Parameters

| Parameter | Description | Required |
|-----------|-------------|----------|
| `SOURCE` | Filters users by their provisioning source (`PROVISIONSRC` role option value). Must match the exact provisioning source string. | No |
| `LAST LOGIN BEFORE` | Filters users whose estimated last login time is before the specified timestamp. Users who have never logged in (`NULL` estimated_last_login_time) are excluded from results. | No |
| `LIMIT` | Restricts the number of returned rows to the specified count. | No |

## Examples

### Show all users

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW USERS;
~~~

### Filter by provisioning source

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW USERS WITH SOURCE = 'ldap:ldap.example.com';
~~~

### Filter by last login time

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW USERS WITH LAST LOGIN BEFORE '2024-01-01';
~~~

### Combine multiple filters

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW USERS WITH SOURCE = 'ldap:ldap.example.com', LAST LOGIN BEFORE '2024-06-01';
~~~

### Use LIMIT with filters

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW USERS WITH SOURCE = 'ldap:ldap.example.com' LIMIT 100;
~~~

### Use LIMIT without filters

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW USERS LIMIT 10;
~~~

{{site.data.alerts.callout_info}}
The `estimated_last_login_time` column is computed on a best-effort basis and is not guaranteed to capture every login event. Users who have never logged in will have `NULL` for this value and are excluded when using the `LAST LOGIN BEFORE` filter.
{{site.data.alerts.end}}

## See also

- [`CREATE USER`]({% link {{ page.version.version }}/create-user.md %})
- [`ALTER USER`]({% link {{ page.version.version }}/alter-user.md %})
- [`DROP USER`]({% link {{ page.version.version }}/drop-user.md %})
- [`SHOW ROLES`]({% link {{ page.version.version }}/show-roles.md %})
- [Manage users]({% link {{ page.version.version }}/security-reference/authorization.md %}#create-and-manage-users)

<!-- END REF DOC DRAFT -->
