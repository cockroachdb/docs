---
title: Configure LDAP Authentication
summary: Learn how to configure CockroachDB for user authentication using LDAP-compatible directory services such as Active Directory.
toc: true
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

CockroachDB supports authentication and authorization using systems compatible with the Lightweight Directory Access Protocol (LDAP), such as Active Directory and Microsoft Entra ID. This allows you to integrate your cluster with your organization's existing identity infrastructure for centralized user management and access control.

This page describes how to configure CockroachDB user authentication using LDAP. You can additionally configure CockroachDB to use the same directory service for user [authorization]({% link {{ page.version.version }}/ldap-authorization.md %}) (role-based access control), which assigns CockroachDB roles to users based on their group memberships in the directory.

## Overview

LDAP authentication in CockroachDB works with LDAP-compatible directory services, including Microsoft Entra ID, Active Directory, and OpenLDAP. Secure LDAPS connectivity over TLS is required.

While LDAP configuration is cluster-specific, each request to authenticate a user in CockroachDB is handled by the node that receives it. When LDAP is enabled, the node handles each authentication request using a "search and bind" approach:

1. Find the user record
  - The node connects to the LDAP server using a dedicated directory access account.
  - The node searches the directory for a record that matches the authenticating user, using configurable search criteria.
1. Authenticate the user
  - If a matching record was found, the cluster attempts to verify the user's identity through another LDAP request, this time using the credentials (username and password) provided by that user.
  - If this LDAP bind operation succeeds, the user is authenticated to the CockroachDB cluster.
1. Authorize the user (optional)
  - If [LDAP authorization]({% link {{ page.version.version }}/ldap-authorization.md %}) is also enabled, an additional request is sent to retrieve the groups to which the user is assigned, using configurable criteria.
  - If group memberships are found, any existing CockroachDB roles that match these group names are assigned to the user.

These requests use a node's existing connection to the LDAP server, if one is open. Otherwise, the node establishes a new connection. The connection remains open for handling additional LDAP requests until it is closed by the LDAP server, based on its timeout setting.

Because CockroachDB maintains no more than one LDAP connection per node, for a cluster with `n` nodes, you can expect up to `n` concurrent LDAP connections.

{{site.data.alerts.callout_info}}
LDAP authentication cannot be used for the `root` user or other [reserved identities]({% link {{ page.version.version }}/security-reference/authorization.md %}#reserved-identities). Credentials for `root` must be managed separately using password authentication to ensure continuous administrative access regardless of LDAP availability.
{{site.data.alerts.end}}

## Configuration

### Prerequisites

- An LDAP-compatible directory service, such as Microsoft Entra ID or Active Directory.
- Network connectivity on port 636 for LDAPS.
- A service account (bind DN) with permissions to search the directory for basic information about users and groups. For example, in Microsoft Entra ID, a [service principal](https://learn.microsoft.com/entra/architecture/secure-service-accounts) with the Directory Readers role.
- The LDAP server's CA certificate, if using a custom CA not already trusted by the CockroachDB host.
- Verification that the attribute values that will become CockroachDB usernames meet the CockroachDB [requirements for usernames]({% link {{ page.version.version }}/create-user.md %}#user-names).

Before you begin, it may be useful to enable authentication logging, which can help you confirm successful configuration or troubleshoot issues. For details, refer to [Troubleshooting](#troubleshooting).

### Step 1: Enable redaction of sensitive cluster settings

For this integration, you will need to store LDAP bind credentials for the service account that enables the integration in the [cluster setting `server.host_based_authentication.configuration`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-host-based-authentication-configuration). You will also configure the mapping of external identities to CockroachDB SQL users with the [cluster setting `server.identity_map.configuration`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-identity-map-configuration). In addition, for a custom CA configuration, you may need to store certificate and key details in the cluster settings specified in the optional [Step 3: Configure TLS](#step-3-configure-tls-optional). 
	
It is highly recommended that you redact these settings, so that only authorized users, such as members of the `admin` role, can view them. To enable this redaction and learn about its permission scheme, refer to [Sensitive settings]({% link {{ page.version.version }}/cluster-settings.md %}#sensitive-settings).

### Step 2: Configure Host-Based Authentication (HBA)

To enable LDAP, you will need to update the [host-based authentication (HBA)]({% link {{ page.version.version }}/security-reference/authentication.md %}#authentication-configuration) configuration specified in the [cluster setting `server.host_based_authentication.configuration`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-host-based-authentication-configuration).

Set the authentication method for all users and databases to `ldap` and include the LDAP-specific option parameters:

- `ldapserver`: LDAP server hostname
- `ldapport`: LDAP server port (typically 636 for LDAPS)
- `ldapbasedn`: Base DN for user searches
- `ldapbinddn`: Service account DN for directory searches
- `ldapbindpasswd`: Service account password
- `ldapsearchattribute`: Attribute to match against SQL usernames
- `ldapsearchfilter`: LDAP filter to restrict valid users

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.host_based_authentication.configuration = '
host    all    all    all    ldap    ldapserver=ldap.example.com 
    ldapport=636 
    "ldapbasedn=ou=users,dc=example,dc=com" 
    "ldapbinddn=cn=readonly,dc=example,dc=com" 
    ldapbindpasswd=readonly_password 
    ldapsearchattribute=uid 
    "ldapsearchfilter=(memberof=cn=cockroachdb_users,ou=groups,dc=example,dc=com)"';
~~~

If you also intend to configure LDAP Authorization, you will need to include an additional LDAP parameter, `ldapgrouplistfilter`. For details, refer to [LDAP Authorization]({% link {{ page.version.version }}/ldap-authorization.md %}#configuration).

### Step 3: Configure TLS (Optional)

If, for LDAPS, you are using a certificate signed by a custom Certificate Authority (CA) that is not in the system's trusted CA store, you will need to configure the CA certificate. This step is only necessary when using certificates signed by your organization's private CA or other untrusted CA.

**Set the custom CA certificate:**

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.ldap_authentication.domain.custom_ca = '<PEM_ENCODED_CA_CERT>';
~~~

**Configure a client certificate for mTLS if required:**

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.ldap_authentication.client.tls_certificate = '<PEM_ENCODED_CERT>';
SET CLUSTER SETTING server.ldap_authentication.client.tls_key = '<PEM_ENCODED_KEY>';
~~~

### Step 4: Configure user creation

CockroachDB supports two approaches for the creation of users who will authenticate via LDAP:

#### Option 1: Automatic user provisioning (recommended)

With automatic user provisioning, CockroachDB creates users automatically during their first successful LDAP authentication. This eliminates the need for custom scripting to create user accounts.

When enabled:

- Users are created automatically upon successful LDAP authentication.
- All auto-provisioned users receive a `PROVISIONSRC` role option set to `ldap:{ldap_server}`.
- The `estimated_last_login_time` is tracked for auditing purposes.
- Auto-provisioned users cannot change their own passwords (managed via LDAP only).

For Active Directory deployments, the CockroachDB username will match the `sAMAccountName` field from the `user` object. Specify this field name with `ldapsearchattribute=sAMAccountName` in the HBA configuration. Ensure that the values in the field you are using for `ldapsearchattribute` meet the CockroachDB [requirements for usernames]({% link {{ page.version.version }}/create-user.md %}#user-names).

{{site.data.alerts.callout_info}}
Before you enable automatic user provisioning, it is recommended that you enable [LDAP authorization]({% link {{ page.version.version }}/ldap-authorization.md %}). This ensures that upon initial login, new CockroachDB users are members of the intended CockroachDB roles, with the privileges they confer, according to users' group memberships in the directory. Otherwise, functionality may be limited for a new user until your alternative process applies roles or privileges.

If you choose to manage CockroachDB role memberships and privileges directly, you could script the required [`GRANT`]({% link {{ page.version.version }}/grant.md %}) commands to be [executed]({% link {{ page.version.version }}/cockroach-sql.md %}#general) as needed.
{{site.data.alerts.end}}

**To enable automatic user provisioning:**

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING security.provisioning.ldap.enabled = true;
~~~

#### Option 2: Manual/scripted user creation

Alternatively, you can manage users by directly creating them before LDAP authentication is used. This approach provides explicit control over user creation.

To create a single user:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE ROLE username LOGIN;
~~~

To create users in bulk:

1. Export usernames from the directory server.
1. Produce a `.sql` file with a [`CREATE ROLE`]({% link {{ page.version.version }}/create-role.md %}) statement per user, each on a separate line.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE ROLE username1 LOGIN;
    CREATE ROLE username2 LOGIN;
    CREATE ROLE username3 LOGIN;
    ~~~

    If you are not also enabling LDAP Authorization to manage roles and privileges, you can also include one or more `GRANT` lines for each user. For example, `GRANT developer TO username1` or `GRANT SELECT ON DATABASE orders TO username2;`.

1. Run the SQL statements in the [file]({% link {{ page.version.version }}/cockroach-sql.md %}#general):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    cockroach sql --file=create_users.sql --host=<servername> --port=<port> --user=<user> --database=<db> --certs-dir=path/to/certs
    ~~~

To update users on an ongoing basis, you could script the required [`CREATE ROLE`]({% link {{ page.version.version }}/create-role.md %}), [`DROP ROLE`]({% link {{ page.version.version }}/drop-role.md %}), or [`GRANT`]({% link {{ page.version.version }}/grant.md %}) commands to be [executed]({% link {{ page.version.version }}/cockroach-sql.md %}#general) as needed. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
cockroach sql --execute="DROP ROLE username1" --host=<servername> --port=<port> --user=<user> --database=<db> --certs-dir=path/to/certs
~~~

## Connect to a cluster using LDAP

### SQL shell connection with LDAP authentication

To connect using LDAP credentials, use your LDAP password: 

{% include_cached copy-clipboard.html %}
~~~ shell
# Method 1: Password in environment variable
export PGPASSWORD='ldap_password'
cockroach sql --url "postgresql://username@host:26257" --certs-dir=certs

# Method 2: Password in connection string
cockroach sql --url "postgresql://username:ldap_password@host:26257" --certs-dir=certs
~~~

### DB Console connection with LDAP authentication

If LDAP authentication is configured, DB Console access will also use this configuration, allowing users to log in with their SQL username and LDAP password. During a login attempt, the system checks if LDAP authentication is configured for the user in the HBA configuration. If so, it validates the credentials against the LDAP server. If automatic user provisioning is enabled, users will be created automatically during their first successful login. If LDAP authentication fails or is not configured, the system falls back to password authentication.

{{site.data.alerts.callout_info}}
Authorization (role-based access control) is not applied when logging in to DB Console.
{{site.data.alerts.end}}

## Manage auto-provisioned users

When automatic user provisioning is enabled, you can identify and manage auto-provisioned users using the following methods:

### View provisioned users

Auto-provisioned users can be identified by their `PROVISIONSRC` role option:

{% include_cached copy-clipboard.html %}
~~~ sql
-- View all auto-provisioned users (users with PROVISIONSRC role option)
SELECT * FROM [SHOW USERS] AS u 
WHERE EXISTS (
  SELECT 1 FROM unnest(u.options) AS opt 
  WHERE opt LIKE 'PROVISIONSRC=ldap:%'
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
-- View all manually created users (users without PROVISIONSRC role option)
SELECT * FROM [SHOW USERS] AS u 
WHERE NOT EXISTS (
  SELECT 1 FROM unnest(u.options) AS opt 
  WHERE opt LIKE 'PROVISIONSRC=ldap:%'
);
~~~

### Last-login tracking for usage and dormancy

The `estimated_last_login_time` column in the output of `SHOW USERS` tracks when users last authenticated. For example:

~~~ 
     username    |                options                | member_of | estimated_last_login_time  
-----------------+---------------------------------------+-----------+----------------------------
  admin          | {}                                    | {}        | NULL  
  root           | {}                                    | {admin}   | 2025-06-01 11:51:29.406216+00  
  e.codd         | {PROVISIONSRC=ldap:example.com}       | {}        | 2025-08-04 19:18:00.201402+00  
~~~

{{site.data.alerts.callout_info}}
`estimated_last_login_time` is computed on a best-effort basis and may not capture every login event due to asynchronous updates.
{{site.data.alerts.end}}

**To identify potentially dormant auto-provisioned users:**

{% include_cached copy-clipboard.html %}
~~~ sql
  SELECT u.username, u.estimated_last_login_time FROM [SHOW USERS]
  AS u
  WHERE EXISTS (
    SELECT 1 FROM unnest(u.options) AS opt
    WHERE opt LIKE 'PROVISIONSRC=ldap:%'
  ) AND (
    u.estimated_last_login_time IS NULL OR
    u.estimated_last_login_time < NOW() - INTERVAL '90 days'
  )
  ORDER BY u.estimated_last_login_time DESC NULLS LAST;
~~~

### Clean up users removed from Active Directory

Auto-provisioned users who have been removed or deactivated in Active Directory will not be automatically removed from CockroachDB. To identify and clean up these orphaned accounts:

**Step 1: Export auto-provisioned users from CockroachDB**

{% include_cached copy-clipboard.html %}
~~~ sql
-- Export list of auto-provisioned usernames for comparison with Active Directory
SELECT u.username FROM [SHOW USERS] AS u 
WHERE EXISTS (
  SELECT 1 FROM unnest(u.options) AS opt 
  WHERE opt LIKE 'PROVISIONSRC=ldap:%'
);
~~~

**Step 2: Cross-reference with Active Directory**

Use your organization's directory tools to verify which of these users still exist in Active Directory. For example, you might use PowerShell with Active Directory cmdlets:

~~~ powershell
# Example PowerShell script to check if users exist in AD
$cockroachUsers = @("user1", "user2", "user3")  # Replace with actual usernames
$orphanedUsers = @()

foreach ($user in $cockroachUsers) {
    try {
        Get-ADUser -Identity $user -ErrorAction Stop | Out-Null
    } catch {
        $orphanedUsers += $user
        Write-Host "User not found in AD: $user"
    }
}
~~~

**Step 3: Remove orphaned users**

Before dropping users confirmed to no longer exist in Active Directory, check for any privileges that were granted directly to the user:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Check for direct grants to the user (privileges inherited through roles won't block DROP USER)  
SHOW GRANTS FOR username;
~~~

If any direct grants exist, revoke them before dropping the user. For users confirmed to no longer exist in Active Directory:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Remove users that no longer exist in Active Directory
DROP USER username1, username2, username3;
~~~

{{site.data.alerts.callout_info}}
Users cannot be dropped if they have direct privilege grants or own database objects. For complete requirements, refer to [`DROP USER`]({% link {{ page.version.version }}/drop-user.md %}). When using both automatic user provisioning and LDAP Authorization, consider granting privileges primarily through roles (mapped to AD groups) rather than directly to users to simplify cleanup operations.
{{site.data.alerts.end}}

### Restrictions on auto-provisioned users

{% include {{ page.version.version }}/security/auto-provisioned-user-restrictions.md %}

## Troubleshooting

Enable [`SESSION` logging]({% link {{ page.version.version }}/logging.md %}#sessions) to preserve data that will help troubleshoot LDAP issues.

{% include_cached copy-clipboard.html %}
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

## Security considerations

1. Always keep a backup authentication method (like password) for administrative users.
1. Use LDAPS (LDAP over TLS) in production environments.
1. Use a restricted service account for directory searches.
1. Regularly audit LDAP group memberships.
1. Monitor authentication logs for unusual patterns.
1. **Auto-provisioning considerations**:
   - When enabling automatic user provisioning, ensure your LDAP search filters are restrictive to prevent unauthorized user creation.
   - Regularly review auto-provisioned users using the `SHOW USERS` command to identify accounts that may need deprovisioning.
   - If using LDAP Authorization, ensure all group roles are created before enabling auto-provisioning to maintain proper access control.
   - The `estimated_last_login_time` can help identify dormant accounts that may need manual removal.
