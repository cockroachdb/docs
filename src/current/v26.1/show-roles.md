---
title: SHOW ROLES
summary: The SHOW ROLES statement lists the roles for all databases.
toc: true
docs_area: reference.sql
---

The `SHOW ROLES` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lists the roles for all databases.

{{site.data.alerts.callout_info}}
 Since the keywords `ROLES` and `USERS` can now be used interchangeably in SQL statements for enhanced PostgreSQL compatibility, `SHOW ROLES` is now an alias for [`SHOW USERS`]({% link {{ page.version.version }}/show-users.md %}).
{{site.data.alerts.end}}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_roles.html %}
</div>

## Required privileges

The role must have the [`SELECT`]({% link {{ page.version.version }}/select-clause.md %}) [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the `system.users` and `system.role_members` tables.

## Example

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ROLES;
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

- [Authorization]({% link {{ page.version.version }}/authorization.md %})
- [`CREATE ROLE`]({% link {{ page.version.version }}/create-role.md %})
- [`DROP ROLE`]({% link {{ page.version.version }}/drop-role.md %})
- [`GRANT`]({% link {{ page.version.version }}/grant.md %})
- [`REVOKE`]({% link {{ page.version.version }}/revoke.md %})
- [Manage Users]({% link {{ page.version.version }}/security-reference/authorization.md %}#create-and-manage-users)

<!-- REF DOC DRAFT: The following content was auto-generated. Please integrate into the sections above and remove this comment block. -->

## `SHOW ROLES`

**Synopsis**:
```sql
SHOW ROLES [WITH option [, ...]] [LIMIT count]

-- Available options:
-- SOURCE = 'source_string'
-- LAST LOGIN BEFORE timestamp_expr
```

**Description**: Lists all roles in the cluster, including both user and non-user roles. The `SHOW ROLES` statement now supports the same optional filtering clauses as `SHOW USERS`, allowing you to filter roles by their provisioning source, last login time, and limit the number of returned rows.

**Required privileges**: The user must be a member of the `admin` role or have the `VIEWACTIVITY` privilege.

**Parameters**:

| Parameter | Description | Required |
| --- | --- | --- |
| `SOURCE = 'source_string'` | filters roles by their provisioning source (matches the `PROVISIONSRC` role option value) | No |
| `LAST LOGIN BEFORE timestamp_expr` | filters roles whose estimated last login time is before the given timestamp | No |
| `count` | limits the number of returned rows to the specified count | No |

**Examples**:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Show all roles
SHOW ROLES;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
-- Show roles provisioned from a specific LDAP source
SHOW ROLES WITH SOURCE = 'ldap:ldap.example.com';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
-- Show roles that haven't logged in since a specific date
SHOW ROLES WITH LAST LOGIN BEFORE '2025-01-01';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
-- Combine multiple filters and limit results
SHOW ROLES WITH SOURCE = 'ldap:ldap.example.com', LAST LOGIN BEFORE '2025-01-01' LIMIT 10;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
-- Limit results without other filters
SHOW ROLES LIMIT 5;
~~~

{{site.data.alerts.callout_info}}
The `estimated_last_login_time` field is computed on a best-effort basis and is not guaranteed to capture every login event. Roles with a `NULL` estimated_last_login_time are excluded from results when using the `LAST LOGIN BEFORE` filter.
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
Duplicate options (e.g., `SOURCE = 'a', SOURCE = 'b'`) produce a parse error.
{{site.data.alerts.end}}

**See also**:
- [`SHOW USERS`]({% link {{ page.version.version }}/show-users.md %})
- [`CREATE ROLE`]({% link {{ page.version.version }}/create-role.md %})
- [`DROP ROLE`]({% link {{ page.version.version }}/drop-role.md %})

---

## Updated `SHOW USERS` 

The `SHOW USERS` statement syntax should be updated to reflect the same options (if not already documented):

**Synopsis**:
```sql
SHOW USERS [WITH option [, ...]] [LIMIT count]

-- Available options:
-- SOURCE = 'source_string'
-- LAST LOGIN BEFORE timestamp_expr
```

**Description**: Lists all users in the cluster. Supports optional filtering clauses to filter users by their provisioning source, last login time, and limit the number of returned rows.

**Parameters**: [Same as SHOW ROLES above]

**Examples**:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Show users provisioned from a specific OIDC source
SHOW USERS WITH SOURCE = 'oidc:okta.example.com';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
-- Show users that haven't logged in recently, limited to 5 results
SHOW USERS WITH LAST LOGIN BEFORE '2024-12-01' LIMIT 5;
~~~

{{site.data.alerts.callout_info}}
`SHOW USERS` and `SHOW ROLES` are interchangeable — both statements return the same data and now support the same filtering syntax.
{{site.data.alerts.end}}

**See also**:
- [`SHOW ROLES`]({% link {{ page.version.version }}/show-roles.md %})
- [`CREATE USER`]({% link {{ page.version.version }}/create-user.md %})
- [`ALTER USER`]({% link {{ page.version.version }}/alter-user.md %})

<!-- END REF DOC DRAFT -->
