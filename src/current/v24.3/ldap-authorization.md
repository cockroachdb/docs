---
title: Configure LDAP Authorization
summary: Learn how to configure role-based access control (authorization) using LDAP with directory services such as Active Directory or Microsoft Entra ID.
toc: true
---

You can configure your cluster to assign [roles]({% link {{ page.version.version }}/ldap-authentication.md %}) based on a user's group membership in an LDAP service, such as Active Directory or Microsoft Entra ID.

When enabled:

1. When a client connects to the cluster using LDAP, the cluster looks up the user's group membership in the LDAP service.
1. Each LDAP group is mapped to a cluster role using the group's Common Name (CN) in the LDAP service.
1. The user is granted each corresponding role, and roles that no longer match the user's groups are revoked.

## Prerequisites

- Enable [LDAP Authentication]({% link {{ page.version.version }}/ldap-authentication.md %}).

## Configuration

Before you begin, it may be useful to enable authentication logging, which can help you confirm sucessful configuration or troubleshoot issues. For details, refer to [Troubleshooting](#troubleshooting).

### Step 1: Enable LDAP Authorization

Add the `ldapgrouplistfilter` parameter to the HBA configuration that you enabled for [LDAP Authentication]({% link {{ page.version.version }}/ldap-authentication.md %}). The configuration will include two important LDAP filters:

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

For more precise control, you can configure these filters to match your security requirements. Refer to the examples below, and further documentation on [LDAP syntax filters](https://learn.microsoft.com/en-us/archive/technet-wiki/5392.active-directory-ldap-syntax-filters).

#### Search filter examples

To restrict authentication to members of specific groups:

~~~ sql
-- Users must be members of either the database users group or the analytics team
"ldapsearchfilter=(|(memberof=cn=cockroachdb_users,ou=groups,dc=example,dc=com)(memberof=cn=analytics_team,ou=groups,dc=example,dc=com))"
~~~

#### Group List filter examples

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

### Step 2: Create matching roles

Create CockroachDB roles that match your LDAP group names and grant appropriate privileges to each role. Remember that role names must comply with CockroachDB's [identifier requirements]({% link {{ page.version.version }}/create-user.md %}#user-names).

For example, if you've configured the group filter to allow `crdb_analysts` and `crdb_developers`:

~~~ sql
-- Create role for analysts
CREATE ROLE crdb_analysts;
GRANT SELECT ON DATABASE analytics TO crdb_analysts;

-- Create role for developers
CREATE ROLE crdb_developers;
GRANT ALL ON DATABASE app TO crdb_developers;
~~~

### Step 3: Confirm configuration

1. On the LDAP server, set up test users with memberships in groups that should be synced to CockroachDB users.
1. When logged in as an admin to CockroachDB, create the matching test users:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE ROLE username1 LOGIN;
    CREATE ROLE username2 LOGIN;
    CREATE ROLE username3 LOGIN;
    ~~~

1. Log in to CockroachDB as each test user (refer to [Connect to a cluster using LDAP]({% link {{ page.version.version }}/ldap-authentication.md %})#connect-to-a-cluster-using-ldap).
1. Using your admin credentials, log in to the CockroachDB SQL shell and run `SHOW ROLES;` to view and verify users and their role assignments.

## Troubleshooting

Enable [`SESSION` logging]({% link {{ page.version.version }}/logging.md %}#sessions) to preserve data that will help troubleshoot LDAP issues:

~~~ sql
SET CLUSTER SETTING server.auth_log.sql_sessions.enabled = true;
~~~

{{site.data.alerts.callout_info}}
Once all functionality is configured and tested successfully, we recommend disabling session logging to conserve system resources.
{{site.data.alerts.end}}

To view the logs, open `cockroach-session.log` from your [logging directory]({% link {{ page.version.version }}/configure-logs.md %}#logging-directory).

Potential issues to investigate may pertain to:

- Network connectivity to the LDAP server.
- Incorrect bind DN or password.
- Search filter not matching the intended users.
- TLS certificates.
- Missing or mismatched role names.

## Security Considerations

1. Always keep a backup authentication method (like password) for administrative users.
2. Use LDAPS (LDAP over TLS) in production environments.
3. Use a restricted service account for directory searches.
4. Regularly audit LDAP group memberships.
5. Monitor authentication logs for unusual patterns.
