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

While LDAP configuration is cluster-specific, each request to authenticate a user in CockroachDB is handled by the node that receives it. When LDAP is enabled, the node handles each authentication request  using a "search and bind" approach:

1. Find the user record
  - The node connects to the LDAP server using a dedicated directory access account.
  - The node searches the directory for a record that matches the authenticating user, using configurable search criteria.
1. Authenticate the user
  - If a matching record was found, the cluster attempts to verify the user's identity through another LDAP request, this time using the credentials (username and password) provided by that user.
  - If this LDAP bind operation succeeds, the user is authenticated to the CockroachDB cluster.
1. Authorize the user (optional)
  - If [LDAP authorization]({% link {{ page.version.version }}/ldap-authorization.md %}) is also enabled, the cluster sends an additional request to retrieve the groups to which the user is assigned, using configurable criteria.
  - If group memberships are found, any existing CockroachDB roles that match these group names are assigned to the user.

These requests use a node's existing connection to the LDAP server, if one is open. Otherwise, the node establishes a new connection. The connection remains open for handling additional LDAP requests until it is closed by the LDAP server, based on its timeout setting.

Because CockroachDB maintains no more than one LDAP connection per node, for a cluster with `n` nodes, you can expect up to `n` concurrent LDAP connections.

{{site.data.alerts.callout_info}}
LDAP authentication cannot be used for the `root` user or other [reserved identities]({% link {{ page.version.version }}/security-reference/authorization.md %}#reserved-identities). You must manage credentials for `root` separately using password authentication to ensure continuous administrative access regardless of LDAP availability.
{{site.data.alerts.end}}

## Configuration

### Prerequisites

- An LDAP-compatible directory service, such as Microsoft Entra ID or Active Directory.
- Network connectivity on port 636 for LDAPS.
- A service account (bind DN) with permissions to search the directory for basic information about users and groups. For example, in Microsoft Entra ID, a [service principal](https://learn.microsoft.com/entra/architecture/secure-service-accounts) with the Directory Readers role.
- The LDAP server's CA certificate, if using a custom CA not already trusted by the CockroachDB host.

Before you begin, it may be useful to enable authentication logging, which can help you confirm successful configuration or troubleshoot issues. For details, refer to [Troubleshooting](#troubleshooting).

### Step 1: Enable redaction of sensitive cluster settings

You will set LDAP bind credentials for the service account that enables this integration using the cluster setting `server.host_based_authentication.configuration`. You will also configure the mapping of external identities to CockroachDB SQL users using the cluster settings `server.identity_map.configuration`.
	
To redact these two settings, refer to [Sensitive settings]({% link {{ page.version.version }}/cluster-settings.md %}#sensitive-settings).

### Step 2: Configure Host-Based Authentication (HBA)

To enable LDAP, you will need to update the [host-based authentication (HBA)]({% link {{ page.version.version }}/security-reference/authentication.md %}#authentication-configuration) configuration specified in the cluster setting `server.host_based_authentication.configuration`.

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

Set the custom CA certificate:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.ldap_authentication.domain.custom_ca = '<PEM_ENCODED_CA_CERT>';
~~~

Configure a client certificate for mTLS if required:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.ldap_authentication.client.tls_certificate = '<PEM_ENCODED_CERT>';
SET CLUSTER SETTING server.ldap_authentication.client.tls_key = '<PEM_ENCODED_KEY>';
~~~

### Step 4: Sync database users

Before LDAP authentication can be enabled for a user, you must create the username directly in CockroachDB. You will need to establish an automated method for keeping users in sync with the directory server, creating and dropping them as needed.

{{site.data.alerts.callout_info}}
As of v25.3, CockroachDB can automatically provision users during their first successful LDAP authentication. Refer to the [latest version]({% link {{ site.versions.stable }}/ldap-authentication.md %}) of this page.
{{site.data.alerts.end}}

For Active Directory deployments, the CockroachDB username can typically be set to match the `sAMAccountName` field from the `user` object. This field name would need to be specified in the HBA configuration using `ldapsearchattribute=sAMAccountName`.

SQL usernames must comply with CockroachDB's [username requirements]({% link {{ page.version.version }}/create-user.md %}#user-names). Ensure that the values in the field you are using for `ldapsearchattribute` meet these requirements.

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

If LDAP authentication is configured, DB Console access will also use this configuration, allowing users to log in with their SQL username and LDAP password. During a login attempt, the system checks if LDAP authentication is configured for the user in the HBA configuration. If so, it validates the credentials against the LDAP server. If LDAP authentication fails or is not configured, the system falls back to password authentication.

{{site.data.alerts.callout_info}}
Authorization (role-based access control) is not applied when logging in to DB Console.
{{site.data.alerts.end}}

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

## Security Considerations

1. Always keep a backup authentication method (like password) for administrative users.
2. Use LDAPS (LDAP over TLS) in production environments.
3. Use a restricted service account for directory searches.
4. Regularly audit LDAP group memberships.
5. Monitor authentication logs for unusual patterns.