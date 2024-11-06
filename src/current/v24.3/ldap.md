---
title: Configure LDAP Authentication and Authorization
summary: A guide to the configuration of authentication and authorization using LDAP or Active Directory.
toc: true
---

{% include enterprise-feature.md %}

CockroachDB supports authentication and authorization using LDAP (Lightweight Directory Access Protocol) or Active Directory servers. This allows you to integrate your existing directory service with CockroachDB for centralized user management and access control.

Q: Should we be flipping these and putting authorization before authentication?  
Q: Can customers just use one, if they want, of LDAP authn and authz? What do we expect will be typical or recommended?  
Q: Decide if Authz and Authn should be 2 separate pages.  
Q: Is this also available for Cloud? If so, I will find another nav location (this is in a self-hosted section) and update to the Enterprise license mention.

## LDAP Authentication

### Overview

LDAP authentication in CockroachDB uses a 'find/bind' approach:

1. CockroachDB first connects to the LDAP server using a service account (bind DN).
2. It searches for the authenticating user using configurable search criteria.
3. If found, it attempts to bind to LDAP using the user's credentials.
4. Upon successful binding, the user is authenticated to CockroachDB.

This method supports both standard LDAP servers and Active Directory, with secure LDAPS connections over TLS.

### Configuration

#### Prerequisites

1. An LDAP or Active Directory server accessible from your CockroachDB nodes.
2. A service account (bind DN) with permissions to search the directory.
3. Network connectivity on port 636 for LDAPS.
4. The LDAP server's CA certificate if using LDAPS.

#### Step 1: Set sensitive cluster settings to be redacted

LDAP configuration requires you to store LDAP bind credentials and the mapping of external identities to SQL users within CockroachDB cluster settings (`server.host_based_authentication.configuration`, `server.identity_map.configuration`). Prior to this configuration, ensure that your cluster is set to redact sensitive cluster settings for all users except those who are assigned the `admin` role or were granted the `MODIFYCLUSTERSETTING` privilege.

    ~~~ sql
    SET CLUSTER SETTING server.redact_sensitive_settings.enabled = 'true';
    ~~~

#### Step 2: Configure Host-Based Authentication (HBA)

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
    "ldapsearchfilter=(memberof=cn=cockroachdb_users,ou=groups,dc=example,dc=com)"
host    all    root    0.0.0.0/0    password';
~~~

For more information on the HBA fields and HBA in CockroachDB, generally, refer to [SQL Authentication configuration](https://www.cockroachlabs.com/docs/stable/security-reference/authentication#authentication-configuration).

Q: Should we specify any LDAP-specific recommendations/considerations for the first four fields (host, all, all, all) or enhance the authentication page to better cover them?

#### Step 3: Configure TLS (Optional)

If using LDAPS, configure the necessary certificates.

Set a custom CA certificate if needed:

~~~ sql
    SET CLUSTER SETTING server.ldap_authentication.domain_ca = '<PEM_ENCODED_CA_CERT>';
~~~

Configure a client certificate for mTLS if required:

~~~ sql
    SET CLUSTER SETTING server.ldap_authentication.client.tls_certificate = '<PEM_ENCODED_CERT>';
    SET CLUSTER SETTING server.ldap_authentication.client.tls_key = '<PEM_ENCODED_KEY>';
~~~

#### Step 4: Create Database Users

Q: Confirm: Does a new customer need to create one user here or all users in bulk? 

Create a CockroachDB user that matches the LDAP username:

~~~ sql
CREATE ROLE username LOGIN;
~~~

### Connecting with LDAP Authentication

Users can connect using their LDAP credentials:

~~~ bash
# Method 1: Password in connection string
cockroach sql --url "postgresql://username:ldap_password@host:26257" --certs-dir=certs

# Method 2: Password in environment variable
export PGPASSWORD='ldap_password'
cockroach sql --url "postgresql://username@host:26257" --certs-dir=certs
~~~

## LDAP Authorization

### Overview

LDAP authorization allows CockroachDB to use LDAP/AD groups as the source of truth for [role](https://www.cockroachlabs.com/docs/stable/security-reference/authorization#roles) assignments. When enabled:

1. During login, CockroachDB fetches the user's group memberships from LDAP.
2. Groups are mapped to CockroachDB roles using the group's Common Name (CN).
3. The user is automatically granted membership to corresponding roles.
4. Any existing role memberships not matched to LDAP groups are revoked.

### Configuration

#### Step 1: Enable LDAP Authorization

Add the `ldapgrouplistfilter` parameter to your HBA configuration:

~~~ sql
SET CLUSTER SETTING server.host_based_authentication.configuration = '
host    all    all    all    ldap    ldapserver=ldap.example.com 
    ldapport=636 
    "ldapbasedn=ou=users,dc=example,dc=com" 
    "ldapbinddn=cn=readonly,dc=example,dc=com" 
    ldapbindpasswd=readonly_password 
    ldapsearchattribute=uid 
    "ldapsearchfilter=(memberof=cn=cockroachdb_users,ou=groups,dc=example,dc=com)"
    "ldapgrouplistfilter=(objectClass=groupOfNames)"
host    all    root    0.0.0.0/0    password';
~~~

The `ldapgrouplistfilter` parameter defines which LDAP objects should be considered as groups.

Q: Get more specific/realistic example from Eng?

#### Step 2: Create Matching Roles

Create CockroachDB roles that match your LDAP group names and grant appropriate privileges to each role.

For an LDAP group `cn=db_admins,ou=groups,dc=example,dc=com`:

~~~ sql
CREATE ROLE db_admins;
GRANT ALL ON DATABASE app TO db_admins;
~~~

### Group Search Template

You can configure how LDAP groups are searched using the `server.ldap.group_search_template` setting:

~~~ sql
SET CLUSTER SETTING server.ldap.group_search_template = 'ou=groups,dc=example,dc=com??sub?(&(objectClass=groupOfNames)(member={USER_DN}))';
~~~

The template follows RFC4515/4516 format:

- Base DN: Where to start the search
- Scope: How deep to search (`sub` for subtree)
- Filter: Criteria for matching groups
- `{USER_DN}`: Placeholder for the authenticated user's DN

### Troubleshooting

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

### Security Considerations

1. Always keep a backup authentication method (like password) for administrative users
2. Use LDAPS (LDAP over TLS) in production environments
3. Use a restricted service account for directory searches
4. Regularly audit LDAP group memberships
5. Monitor authentication logs for unusual patterns

### Database Console Integration

LDAP authentication is also available for the DB Console. Users can log in using their LDAP credentials if configured in the HBA configuration.

Q: Do you have more detail that we should include on this?
