---
title: Configure JWT Authorization
summary: Learn how to configure role-based access control (authorization) using JWT tokens for SQL client connections.
toc: true
docs_area: manage
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

If you manage users through an identity provider (IdP) that supports JSON Web Tokens (JWT), you can configure CockroachDB to automatically assign [roles]({% link {{ page.version.version }}/security-reference/authorization.md %}) to users based on group claims in their JWT tokens, simplifying access control.

If JWT authorization is enabled:

1. When a client connects to the cluster using a JWT token, the cluster extracts the groups claim from the token.
1. If the groups claim is not present in the token, the cluster queries the IdP's userinfo endpoint as a fallback.
1. Each group is mapped to a cluster role by matching the group name to a role name.
1. The user is granted each corresponding role, and roles that no longer match the user's groups are revoked.
1. In conjunction with [automatic user provisioning]({% link {{ page.version.version }}/sso-sql.md %}#configure-user-provisioning) if enabled, users are created automatically during their first authentication and simultaneously receive specified role memberships.

## Prerequisites

- Enable [JWT Authentication]({% link {{ page.version.version }}/sso-sql.md %}).
- Understand the structure of JWT tokens issued by your identity provider.
- Know which claim in your JWT tokens contains group memberships.

## Configuration

Before you begin, it may be useful to enable authentication logging, which can help you confirm successful configuration or troubleshoot issues. For details, refer to [Troubleshooting](#troubleshooting).

### Step 1: Enable JWT authorization

Enable JWT authorization and configure the groups claim:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Enable JWT authentication (if not already enabled)
SET CLUSTER SETTING server.jwt_authentication.enabled = true;

-- Enable JWT authorization
SET CLUSTER SETTING server.jwt_authentication.authorization.enabled = true;

-- Configure the JWT claim containing groups (default: 'groups')
SET CLUSTER SETTING server.jwt_authentication.group_claim = 'groups';

-- (Optional) Configure the userinfo endpoint JSON key for groups fallback
SET CLUSTER SETTING server.jwt_authentication.userinfo_group_key = 'groups';
~~~

{{site.data.alerts.callout_info}}
The `userinfo_group_key` setting is only used when the groups claim is missing from the JWT token. CockroachDB will query the IdP's userinfo endpoint using this key to retrieve group memberships.
{{site.data.alerts.end}}

### Step 2: Configure IdP-specific settings

The configuration varies by identity provider:

#### Okta

Okta typically includes groups in the default `groups` claim:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.jwt_authentication.group_claim = 'groups';
SET CLUSTER SETTING server.jwt_authentication.userinfo_group_key = 'groups';
~~~

Example JWT token from Okta:

~~~json
{
  "iss": "https://your-okta-domain.okta.com",
  "sub": "00u1abc2def3ghi4jkl",
  "aud": "your_client_id",
  "email": "alice@example.com",
  "groups": ["developers", "team-alpha"]
}
~~~

#### Keycloak

For Keycloak Groups (default mapping):

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.jwt_authentication.group_claim = 'groups';
~~~

Example JWT token:

~~~json
{
  "iss": "https://keycloak.example.com/realms/myrealm",
  "sub": "user123",
  "email": "alice@example.com",
  "groups": ["developers", "team-alpha"]
}
~~~

{{site.data.alerts.callout_info}}
**For Keycloak realm roles**: CockroachDB does not support nested JSON paths like `realm_access.roles`. If you need to use realm roles, create a Keycloak protocol mapper to flatten the roles into a top-level claim:

1. In Keycloak, go to your client settings
1. Navigate to **Mappers** > **Create**
1. Choose **User Realm Role** mapper type
1. Set the **Token Claim Name** to `roles` (or another simple name)
1. Configure CockroachDB to use this claim:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.jwt_authentication.group_claim = 'roles';
~~~
{{site.data.alerts.end}}

####  Azure AD / Microsoft Entra ID

Azure AD typically uses the `groups` claim:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.jwt_authentication.group_claim = 'groups';
~~~

{{site.data.alerts.callout_info}}
In Azure AD, you may need to configure group claims in your app registration. Refer to [Microsoft's documentation](https://learn.microsoft.com/en-us/azure/active-directory/hybrid/connect/how-to-connect-fed-group-claims) for details.
{{site.data.alerts.end}}

### Step 3: Create matching roles

Create CockroachDB roles that match your IdP group names and grant appropriate privileges to each role. Remember that role names must comply with CockroachDB's [identifier requirements]({% link {{ page.version.version }}/create-user.md %}#user-names).

{{site.data.alerts.callout_info}}
Group names from the IdP are normalized using case folding and Unicode normalization (NFC) before matching to role names. This means that group names are typically converted to lowercase for matching purposes.
{{site.data.alerts.end}}

For example, if your JWT tokens contain groups named `developers` and `analysts`:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Create role for developers
CREATE ROLE developers;
GRANT ALL ON DATABASE app TO developers;

-- Create role for analysts
CREATE ROLE analysts;
GRANT SELECT ON DATABASE analytics TO analysts;
~~~

{{site.data.alerts.callout_info}}
If you are going to use [automatic user provisioning]({% link {{ page.version.version }}/sso-sql.md %}#configure-user-provisioning) in conjunction with JWT authorization, be sure to complete the creation of group roles before enabling automatic user provisioning. Auto-provisioned users will only receive roles for groups that already exist as CockroachDB roles.
{{site.data.alerts.end}}

### Step 4: Confirm configuration

1. On your identity provider, set up test users with memberships in groups that should be synced to CockroachDB roles.

1. If [automatic user provisioning]({% link {{ page.version.version }}/sso-sql.md %}#configure-user-provisioning) is not enabled, create the matching test users when logged in as an admin to CockroachDB:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE ROLE username1 LOGIN;
    CREATE ROLE username2 LOGIN;
    CREATE ROLE username3 LOGIN;
    ~~~

    If automatic user provisioning is enabled, users will be created automatically during their first login.

1. Obtain a JWT token from your identity provider and connect to CockroachDB using the token. Refer to [Authenticate to your cluster]({% link {{ page.version.version }}/sso-sql.md %}#authenticate-to-your-cluster).

1. Using your `admin` credentials, log in to the CockroachDB SQL shell and verify the user's role assignments:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    -- View roles granted to a specific user
    SHOW GRANTS FOR username1;

    -- Check if user has a specific role
    SELECT pg_has_role('username1', 'developers', 'member');
    ~~~

    For auto-provisioned users, you can identify them by their `PROVISIONSRC` role option:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    -- View all users and their provisioning source
    SELECT rolname, rolprovisionsrc FROM pg_roles
    WHERE rolprovisionsrc LIKE 'jwt_token:%';
    ~~~

## How it works

### Group extraction process

When a user authenticates with a JWT token and JWT authorization is enabled:

1. **Token validation**: CockroachDB first validates the JWT token signature, issuer, and claims.

1. **Group extraction**:
   - CockroachDB looks for the configured `group_claim` (default: `groups`) in the JWT token.
   - If the claim is missing or cannot be parsed, CockroachDB queries the IdP's userinfo endpoint and looks for the `userinfo_group_key` (default: `groups`).

1. **Normalization**: Group names are normalized using `MakeSQLUsernameFromUserInput`, which performs case folding and Unicode normalization (NFC).

1. **Role matching**: Each normalized group name is compared against existing CockroachDB roles.

### Role synchronization

On each login, CockroachDB synchronizes the user's role memberships:

1. **Grant new roles**: If a group matches an existing role name and the user doesn't already have that role, it is granted.

1. **Revoke stale roles**: If the user has roles that don't match any current groups, those roles are revoked.

1. **Skip non-existent roles**: If a group doesn't match any existing role, it is silently skipped (no error is raised).

{{site.data.alerts.callout_info}}
IdP groups that don't correspond to CockroachDB roles are silently ignored. You must pre-create roles in CockroachDB for them to be granted.
{{site.data.alerts.end}}

### Empty groups behavior

If the groups claim exists but contains an empty array (`[]`):

1. All existing role memberships are revoked from the user.
1. Login is **rejected** with error: `JWT authorization: empty group list`

This behavior ensures that users without group memberships cannot access the cluster, which is a security feature to prevent unauthorized access.

### Userinfo endpoint fallback

If the JWT token does not contain the configured groups claim, CockroachDB will attempt to query the IdP's userinfo endpoint:

1. CockroachDB makes an HTTP GET request to the userinfo endpoint using the access token.
1. The response is parsed as JSON, and CockroachDB looks for the `userinfo_group_key`.
1. If the userinfo lookup fails, login is rejected with error: `JWT authorization: userinfo lookup failed`

## Troubleshooting

Enable [`SESSION` logging]({% link {{ page.version.version }}/logging.md %}#sessions) to preserve data that will help troubleshoot JWT authorization issues:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.auth_log.sql_sessions.enabled = true;
~~~

{{site.data.alerts.callout_info}}
Once all functionality is configured and tested successfully, we recommend disabling session logging to conserve system resources.
{{site.data.alerts.end}}

To view the logs, open `cockroach-session.log` from your [logging directory]({% link {{ page.version.version }}/configure-logs.md %}#logging-directory).

Potential issues to investigate may pertain to:

- **JWT token validation**: Ensure the token is properly signed and issued by a trusted issuer.
- **Missing groups claim**: Check if the token contains the configured claim name. Use a JWT decoder tool to inspect the token.
- **Claim name mismatch**: Verify that `server.jwt_authentication.group_claim` matches the actual claim name in your tokens.
- **Userinfo endpoint**: If relying on userinfo fallback, ensure the endpoint is accessible and returns the expected JSON structure.
- **Role name mismatches**: Remember that group names are normalized (typically lowercased). Check that your role names match the normalized group names.
- **Empty groups**: Verify that users have group memberships in the IdP.

### Common errors

**Error**: `JWT authorization: empty group list`

- **Cause**: The groups claim exists but contains an empty array.
- **Solution**: Ensure users have appropriate group memberships in your identity provider.

**Error**: `JWT authorization: userinfo lookup failed`

- **Cause**: The token doesn't contain the groups claim, and the userinfo endpoint query failed.
- **Solution**: Either include groups in the JWT token or ensure the userinfo endpoint is accessible and configured correctly.

**Error**: User can log in but has no privileges

- **Cause**: Groups from the IdP don't match any existing CockroachDB roles.
- **Solution**: Create roles with names matching the normalized group names from your IdP.

## Security considerations

1. **Maintain backup authentication**: Always keep a backup authentication method (like password or client certificate) for administrative users in case of IdP outages.

1. **Validate token issuers**: Ensure `server.jwt_authentication.issuers` is properly configured to accept only trusted issuers.

1. **Pre-create roles with minimal privileges**: Create roles before enabling authorization and grant only the necessary privileges following the principle of least privilege.

1. **Monitor role synchronization**: Regularly audit role assignments and changes. Enable audit logging if available to track when roles are granted or revoked.

1. **Secure the userinfo endpoint**: If using userinfo fallback, ensure the endpoint requires proper authentication and is only accessible over HTTPS.

1. **Review empty groups policy**: Understand that empty groups will block login. Ensure this aligns with your security requirements.

1. **Regularly audit IdP groups**: Review and clean up group memberships in your identity provider to ensure they reflect current access requirements.

## See also

- [Cluster Single Sign-on (SSO) using JWTs]({% link {{ page.version.version }}/sso-sql.md %})
- [LDAP Authorization]({% link {{ page.version.version }}/ldap-authorization.md %})
- [OIDC Authorization]({% link {{ page.version.version }}/oidc-authorization.md %})
- [Authorization]({% link {{ page.version.version }}/security-reference/authorization.md %})
- [Security Reference: Authorization]({% link {{ page.version.version }}/security-reference/authorization.md %})
