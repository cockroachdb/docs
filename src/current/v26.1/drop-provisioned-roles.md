---
title: docs: document DROP PROVISIONED ROLES statement from PR #166980
summary: The `DROP PROVISIONED ROLES` statement removes multiple provisioned (auto-created) user accounts that match specified filter criteria. Provisioned users are those created automatically by external authentication systems such as LDAP or OIDC. The statement skips users that own database objects or have other dependencies, issuing notices instead of failing the operation.
toc: true
docs_area: reference
---

The `DROP PROVISIONED ROLES` statement removes multiple provisioned (auto-created) user accounts that match specified filter criteria. Provisioned users are those created automatically by external authentication systems such as LDAP or OIDC. The statement skips users that own database objects or have other dependencies, issuing notices instead of failing the operation.

## Required privileges

The user must have the `CREATEROLE` [role option]({% link {{ page.version.version }}/security-reference/authorization.md %}#role-options) or be a member of the `admin` role.

## Synopsis

{% include_cached copy-clipboard.html %}
~~~ sql
DROP PROVISIONED ROLES [WITH filter_options] LIMIT count
~~~

## Parameters

| Parameter | Description |
|-----------|-------------|
| `SOURCE` | Optional. Filter provisioned users by their provisioning source (e.g., `'ldap:ldap.example.com'`, `'oidc:okta.corp.com'`). If not specified, matches users from all provisioning sources. |
| `LAST LOGIN BEFORE` | Optional. Filter provisioned users who last logged in before the specified timestamp. Accepts timestamp expressions like `'2025-01-01'` or `now() - '30d'::interval`. |
| `LIMIT` | **Required.** Maximum number of users to drop in a single statement. Must be a positive integer. |

## Behavior

- Only removes users that have a `PROVISIONSRC` role option (i.e., are provisioned)
- Skips users that own database objects, have granted privileges, or have other dependencies
- Skips reserved roles (`public`, `node`, PostgreSQL built-in roles), `root`, and `admin`
- Non-admin users cannot drop users with admin privileges
- Issues `NOTICE` messages for skipped users rather than failing
- Evaluates filter expressions at execution time, allowing dynamic values like `now() - interval`

{{site.data.alerts.callout_danger}}
The `LIMIT` clause is mandatory to prevent accidentally dropping an unbounded number of users in a single transaction.
{{site.data.alerts.end}}

## Examples

### Drop all provisioned users (up to limit)

{% include_cached copy-clipboard.html %}
~~~ sql
DROP PROVISIONED ROLES LIMIT 50;
~~~

### Drop provisioned users from a specific LDAP source

{% include_cached copy-clipboard.html %}
~~~ sql
DROP PROVISIONED ROLES WITH SOURCE = 'ldap:ldap.example.com' LIMIT 100;
~~~

### Drop provisioned users who have not logged in recently

{% include_cached copy-clipboard.html %}
~~~ sql
DROP PROVISIONED ROLES WITH LAST LOGIN BEFORE = '2025-01-01' LIMIT 25;
~~~

### Combine filters to target specific inactive users

{% include_cached copy-clipboard.html %}
~~~ sql
DROP PROVISIONED ROLES WITH 
    SOURCE = 'oidc:okta.corp.com',
    LAST LOGIN BEFORE = now() - '90d'::interval 
LIMIT 200;
~~~

## See also

- [`DROP ROLE`]({% link {{ page.version.version }}/drop-role.md %})
- [`DROP USER`]({% link {{ page.version.version }}/drop-user.md %})
- [`CREATE ROLE`]({% link {{ page.version.version }}/create-role.md %})
- [Authentication]({% link {{ page.version.version }}/authentication.md %})
- [LDAP Authentication]({% link {{ page.version.version }}/ldap-authentication.md %})
- [OIDC Authorization]({% link {{ page.version.version }}/oidc-authorization.md %})
