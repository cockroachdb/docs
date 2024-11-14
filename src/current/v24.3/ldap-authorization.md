---
title: Configure LDAP Authorization
 summary: Learn how to configure role-based access control (authorization) using LDAP with directory services like Active Directory.
toc: true
---

LDAP authorization allows CockroachDB to use group memberships accessed using LDAP, for example, from an Active Directory server, as the source of truth for [role](https://www.cockroachlabs.com/docs/stable/security-reference/authorization#roles) assignments. When enabled:

1. During login, CockroachDB retrieves the user's group memberships using LDAP.
2. Groups are mapped to CockroachDB roles using the group's Common Name (CN).
3. The user is automatically granted membership to corresponding roles.
4. Any existing role memberships not matched to LDAP groups are revoked.

## Prerequisites

- Enable LDAP Authentication

## Configuration

### Step 1: Enable LDAP Authorization

Add the `ldapgrouplistfilter` parameter to your HBA configuration. The configuration includes two important LDAP filters:

1. `ldapsearchfilter`: Determines which users can authenticate
2. `ldapgrouplistfilter`: Defines which groups should be considered for authorization

Here's a basic example:

~~~ sql
SET CLUSTER SETTING server.host_based_authentication.configuration = '
host    all    all    all    ldap    ldapserver=ldap.example.com 
    ldapport=636 
    "ldapbasedn=ou=users,dc=example,dc=com" 
    "ldapbinddn=cn=readonly,dc=example,dc=com" 
    ldapbindpasswd=readonly_password 
    ldapsearchattribute=uid 
    "ldapsearchfilter=(memberof=cn=cockroachdb_users,ou=groups,dc=example,dc=com)"
    "ldapgrouplistfilter=(objectClass=groupOfNames)"';
~~~

For more precise control, you can configure these filters to match your security requirements:

#### Search Filter Examples

To restrict authentication to members of specific groups:

~~~ sql
-- Users must be members of either the database users group or the analytics team
"ldapsearchfilter=(|(memberof=cn=cockroachdb_users,ou=groups,dc=example,dc=com)(memberof=cn=analytics_team,ou=groups,dc=example,dc=com))"
~~~

#### Group List Filter Examples

The `ldapgrouplistfilter` configuration varies by LDAP server type:

~~~ sql
-- For Azure Active Directory:
"ldapgrouplistfilter=(objectCategory=CN=Group,CN=Schema,CN=Configuration,DC=example,DC=com)"

-- For OpenLDAP:
"ldapgrouplistfilter=(objectClass=groupOfNames)"
~~~

For enhanced security, restrict the groups that can be mapped to CockroachDB roles:

~~~ sql
-- Only map specific groups to CockroachDB roles
"ldapgrouplistfilter=(|(cn=crdb_analysts)(cn=crdb_developers))"
~~~

{{site.data.alerts.callout_info}}
We recommend that you explicitly specify which groups should be mapped to CockroachDB roles rather than using broader filters. This ensures that only intended groups are granted database access.
{{site.data.alerts.end}}

### Step 2: Create Matching Roles

Create CockroachDB roles that match your LDAP group names and grant appropriate privileges to each role. Remember that role names must comply with CockroachDB's [identifier requirements](https://www.cockroachlabs.com/docs/v24.2/create-user#user-names).

For example, if you've configured the group filter to allow `crdb_analysts` and `crdb_developers`:

~~~ sql
-- Create role for analysts
CREATE ROLE crdb_analysts;
GRANT SELECT ON DATABASE analytics TO crdb_analysts;

-- Create role for developers
CREATE ROLE crdb_developers;
GRANT ALL ON DATABASE app TO crdb_developers;
~~~

## Troubleshooting

Enable authentication logging to troubleshoot LDAP issues:

~~~ sql
SET CLUSTER SETTING server.auth_log.sql_sessions.enabled = true;
~~~

Potential issues may pertain to:

- Network connectivity to the LDAP server.
- Incorrect bind DN or password.
- Search filter not matching the intended users.
- TLS certificates.
- Missing or mismatched role names.

## Security Considerations

1. Always keep a backup authentication method (like password) for administrative users
2. Use LDAPS (LDAP over TLS) in production environments
3. Use a restricted service account for directory searches
4. Regularly audit LDAP group memberships
5. Monitor authentication logs for unusual patterns
