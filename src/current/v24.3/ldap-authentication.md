---
title: Configure LDAP Authentication
summary: Learn how to configure CockroachDB to use LDAP for user authentication with directory services like Active Directory.
toc: true
---

{% include enterprise-feature.md %}

CockroachDB supports authentication and authorization using LDAP (Lightweight Directory Access Protocol) with services such as Active Directory. This allows you to integrate your existing directory service with CockroachDB for centralized user management and access control.

This page describes how to configure CockroachDB user authentication using LDAP. You can also configure user authorization (role-based access control) with LDAP, to set users' CockroachDB roles based on group memberships in the directory, but this is not required.

## Overview

LDAP authentication in CockroachDB uses a 'search and bind' approach:

1. CockroachDB first connects to the LDAP server using a service account (bind DN).
2. It searches for the authenticating user using configurable search criteria.
3. If found, it attempts to bind to LDAP using the user's credentials.
4. Upon successful binding, the user is authenticated to CockroachDB.

This method supports both standard LDAP servers and Active Directory, with secure LDAPS connections over TLS.

{{site.data.alerts.callout_info}}
LDAP authentication cannot be used for the `root` user or other admin users. These credentials must be managed separately using password authentication to ensure continuous administrative access, especially if the LDAP service becomes unavailable.
{{site.data.alerts.end}}

## Configuration

### Prerequisites

1. An LDAP or Active Directory server accessible from your CockroachDB nodes.
2. A service account (bind DN) with permissions to search the directory.
3. Network connectivity on port 636 for LDAPS.
4. The LDAP server's CA certificate if using LDAPS.

### Step 1: Set sensitive cluster settings to be redacted

LDAP configuration requires you to store LDAP bind credentials and the mapping of external identities to SQL users within CockroachDB cluster settings (`server.host_based_authentication.configuration`, `server.identity_map.configuration`). Prior to this configuration, ensure that your cluster is set to redact sensitive cluster settings for all users except those who are assigned the `admin` role or were granted the `MODIFYCLUSTERSETTING` privilege.

~~~ sql
SET CLUSTER SETTING server.redact_sensitive_settings.enabled = 'true';
~~~

### Step 2: Configure Host-Based Authentication (HBA)

Set the `server.host_based_authentication.configuration` cluster setting to enable LDAP authentication.

The format for HBA is `TYPE  DATABASE  USER  ADDRESS  METHOD  [OPTIONS]`. For LDAP, the method should be set to `ldap` and the option parameters that follow will be LDAP specific:

- `ldapserver`: LDAP server hostname
- `ldapport`: LDAP server port (typically 636 for LDAPS)
- `ldapbasedn`: Base DN for user searches
- `ldapbinddn`: Service account DN for directory searches
- `ldapbindpasswd`: Service account password
- `ldapsearchattribute`: Attribute to match against SQL usernames
- `ldapsearchfilter`: LDAP filter to restrict valid users

For example:

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

If you also intend to [configure LDAP Authorization]({% link v24.3/ldap-authorization.md %}#configuration), you will need to include an additional LDAP parameter, `ldapgrouplistfilter`.

For more information on the HBA fields and HBA in CockroachDB, generally, refer to [SQL Authentication configuration](https://www.cockroachlabs.com/docs/stable/security-reference/authentication#authentication-configuration).

### Step 3: Configure TLS (Optional)

If using LDAPS with a certificate signed by a custom Certificate Authority (CA) that is not in the system's trusted CA store, you'll need to configure the CA certificate. This step is only necessary when using certificates signed by your organization's private CA or other untrusted CA.

Set the custom CA certificate:

~~~ sql
SET CLUSTER SETTING server.ldap_authentication.domain_ca = '<PEM_ENCODED_CA_CERT>';
~~~

Configure a client certificate for mTLS if required:

~~~ sql
SET CLUSTER SETTING server.ldap_authentication.client.tls_certificate = '<PEM_ENCODED_CERT>';
SET CLUSTER SETTING server.ldap_authentication.client.tls_key = '<PEM_ENCODED_KEY>';
~~~

### Step 4: Sync Database Users

Before LDAP authentication can be used for a user, the username must be created directly in CockroachDB. You will, therefore, need to establish an automated method for keeping users in sync with the directory server, creating and dropping them as needed.

For Azure AD deployments, the username typically corresponds to the `sAMAccountName` field from AD's person object, which is specified in the HBA configuration using `ldapsearchattribute=sAMAccountName`.

{{site.data.alerts.callout_info}}
SQL usernames must comply with CockroachDB's [username requirements](https://www.cockroachlabs.com/docs/v24.2/create-user#user-names). Ensure that the values in the LDAP `sAMAccountName` field (or other mapped attribute) meet these requirements.
{{site.data.alerts.end}}

To create a single user:

~~~ sql
CREATE ROLE username LOGIN;
~~~

To create users in bulk:

1. Export usernames from the directory server.
1. Produce a `.sql` file with a [`CREATE ROLE`](https://www.cockroachlabs.com/docs/v24.2/create-role) statement per user, each on a separate line.

    ~~~ sql
    CREATE ROLE username1 LOGIN;
    CREATE ROLE username2 LOGIN;
    CREATE ROLE username3 LOGIN;
    ~~~

    If you are not also enabling LDAP Authorization to manage roles and privileges, you can also include one or more `GRANT` lines for each user. For example, `GRANT developer TO username1` or `GRANT SELECT ON DATABASE orders TO username2;`.

1. Run the SQL file to create the users.

    ~~~ sql
    cockroach sql --file=create_users.sql --host=<servername> --port=<port> --user=<user> --database=<db> --certs-dir=path/to/certs
    ~~~

You can similarly [`DROP`](https://www.cockroachlabs.com/docs/stable/drop-role) users as they are removed from the directory, and update roles and groups as needed, if not using LDAP authorization.

### Connecting to CockroachDB

#### SQL shell connection with LDAP authentication

After LDAP authentication is configured, users can connect using their LDAP credentials:

~~~ bash
# Method 1: Password in connection string
cockroach sql --url "postgresql://username:ldap_password@host:26257" --certs-dir=certs

# Method 2: Password in environment variable
export PGPASSWORD='ldap_password'
cockroach sql --url "postgresql://username@host:26257" --certs-dir=certs
~~~

#### DB Console connection with LDAP authentication

If LDAP authentication is configured, DB Console access will also use this configuration, allowing users to log in with their SQL username and LDAP password. During a login attempt, the system checks if LDAP authentication is configured for the user in the HBA configuration. If so, it validates the credentials against the LDAP server. If LDAP authentication fails or is not configured, the system falls back to password authentication.

{{site.data.alerts.callout_info}}
Authorization (role-based access control) is not applied when logging in to DB Console.
{{site.data.alerts.end}}