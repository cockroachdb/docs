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

## Updated Documentation for `SHOW USERS`

### `SHOW USERS`

Use the `SHOW USERS` statement to list all users in a cluster, with optional filtering and result limiting.

**Synopsis**:
```
SHOW USERS [WITH <options>] [LIMIT <n>]
```

Where `<options>` can include:
- `SOURCE = <string>` 
- `LAST LOGIN BEFORE <expr>`

**Description**: 

The `SHOW USERS` statement lists all database users and roles in the cluster. You can filter the results by provisioning source or last login time, and limit the number of rows returned. The statement displays the username, user options (including provisioning source if set), and role memberships.

**Parameters**:

| Parameter | Description | Required |
| --- | --- | --- |
| `SOURCE` | Filter users by provisioning source (e.g., `'ldap:ldap.example.com'`, `'oidc:okta.example.com'`) | No |
| `LAST LOGIN BEFORE` | Filter users who last logged in before the specified timestamp expression | No |
| `LIMIT` | Maximum number of rows to return | No |

**Examples**:

Show all users:
{% include_cached copy-clipboard.html %}
~~~ sql
SHOW USERS;
~~~

Filter users by provisioning source:
{% include_cached copy-clipboard.html %}
~~~ sql
SHOW USERS WITH SOURCE = 'ldap:ldap.example.com';
~~~

Filter users by last login time:
{% include_cached copy-clipboard.html %}
~~~ sql
SHOW USERS WITH LAST LOGIN BEFORE '2024-01-01';
~~~

Combine multiple filters:
{% include_cached copy-clipboard.html %}
~~~ sql
SHOW USERS WITH SOURCE = 'ldap:ldap.example.com', LAST LOGIN BEFORE '2024-01-01';
~~~

Limit the number of results:
{% include_cached copy-clipboard.html %}
~~~ sql
SHOW USERS LIMIT 10;
~~~

Combine filtering with limiting:
{% include_cached copy-clipboard.html %}
~~~ sql
SHOW USERS WITH SOURCE = 'ldap:ldap.example.com' LIMIT 5;
~~~

**Required privileges**: 

The `VIEWACTIVITY` or `VIEWACTIVITYREDACTED` privilege on the cluster.

**Notes**:

{{site.data.alerts.callout_info}}
The `estimated_last_login_time` column is computed on a best effort basis and is not guaranteed to capture every login event.
{{site.data.alerts.end}}

- Each option can only be specified once per statement. Duplicate options will result in a syntax error.
- The `SOURCE` filter matches users created with a `PROVISIONSRC` value exactly matching the specified string.
- The `LAST LOGIN BEFORE` filter includes users whose `estimated_last_login_time` is before the specified timestamp, plus users with `NULL` login times.
- When no options are specified, `SHOW USERS` returns all users and roles in the cluster.

## Upcoming Changes for `SHOW ROLES`

{{site.data.alerts.callout_info}}
**[NEEDS REVIEW]** The `SHOW ROLES` statement is being enhanced to support the same filtering options as `SHOW USERS`. The AST structure has been prepared in this release, but the grammar and functionality will be available in subsequent releases.
{{site.data.alerts.end}}

**See also**:

- [`CREATE USER`]({% link {{ page.version.version }}/create-user.md %})
- [`DROP USER`]({% link {{ page.version.version }}/drop-user.md %})
- [`SHOW ROLES`]({% link {{ page.version.version }}/show-roles.md %})
- [`ALTER USER`]({% link {{ page.version.version }}/alter-user.md %})

<!-- END REF DOC DRAFT -->
