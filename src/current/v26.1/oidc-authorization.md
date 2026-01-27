---
title: Configure OIDC Authorization for DB Console
summary: Learn how to configure role-based access control for users logging into DB Console via OIDC.
toc: true
docs_area: manage
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

If you manage users through an identity provider (IdP) that supports OpenID Connect (OIDC), you can configure CockroachDB to automatically assign [roles]({% link {{ page.version.version }}/security-reference/authorization.md %}) to users based on group claims when they log into the DB Console, simplifying access control.

If OIDC authorization is enabled:

1. When a user logs into the DB Console using OIDC, the cluster extracts the groups claim from the ID token.
1. If the groups claim is not present in the ID token, the cluster checks the access token (if it's a JWT).
1. If still not found, the cluster queries the IdP's userinfo endpoint as a fallback.
1. Each group is mapped to a cluster role by matching the group name to a role name.
1. The user is granted each corresponding role, and roles that no longer match the user's groups are revoked.

## Prerequisites

- Enable [OIDC Authentication for DB Console]({% link {{ page.version.version }}/sso-db-console.md %}).
- Understand the structure of tokens issued by your identity provider.
- Know which claim in your tokens contains group memberships.

## Configuration

Before you begin, it may be useful to enable authentication logging, which can help you confirm successful configuration or troubleshoot issues. For details, refer to [Troubleshooting](#troubleshooting).

### Step 1: Enable OIDC authorization

Enable OIDC authorization and configure the groups claim:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Enable OIDC authorization
SET CLUSTER SETTING server.oidc_authentication.authorization.enabled = true;

-- Configure the claim containing groups (default: 'groups')
SET CLUSTER SETTING server.oidc_authentication.group_claim = 'groups';

-- (Optional) Configure the userinfo endpoint JSON key for groups fallback
SET CLUSTER SETTING server.oidc_authentication.userinfo_group_key = 'groups';
~~~

{{site.data.alerts.callout_info}}
The `userinfo_group_key` setting is only used when the groups claim is missing from both the ID token and access token. CockroachDB will query the IdP's userinfo endpoint using this key to retrieve group memberships.
{{site.data.alerts.end}}

### Step 2: Create matching roles

[Create CockroachDB roles]({% link {{ page.version.version }}/create-user.md %}) that match your IdP group names and grant appropriate privileges to each role. Remember that role names must comply with CockroachDB's [identifier requirements]({% link {{ page.version.version }}/create-user.md %}#user-names).

{{site.data.alerts.callout_info}}
Group names from the IdP are normalized using case folding and Unicode normalization (NFC) before matching to role names. This means that group names are typically converted to lowercase for matching purposes.
{{site.data.alerts.end}}

For example, if your OIDC tokens contain groups named `developers` and `analysts`:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Create role for developers
CREATE ROLE developers;
GRANT ALL ON DATABASE app TO developers;

-- Create role for analysts
CREATE ROLE analysts;
GRANT SELECT ON DATABASE analytics TO analysts;
~~~

### Step 3: Confirm configuration

1. On your identity provider, set up test users with memberships in groups that should be synced to CockroachDB roles.

1. Navigate to the DB Console in your web browser and log in using OIDC. Refer to [Log in to a cluster's DB Console with SSO]({% link {{ page.version.version }}/sso-db-console.md %}#log-in-to-a-clusters-db-console-with-sso).

1. Using your `admin` credentials in a SQL shell, verify the user's role assignments:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    -- View roles granted to a specific user
    SHOW GRANTS FOR alice;

    -- Check if user has a specific role
    SELECT pg_has_role('alice', 'developers', 'member');
    ~~~

## How it works

### Group extraction process

When a user authenticates with OIDC and OIDC authorization is enabled:

1. **Token validation**: CockroachDB validates the ID token signature, issuer, and claims.

1. **Group extraction from ID token**: CockroachDB looks for the configured `group_claim` (default: `groups`) in the ID token.

1. **Group extraction from access token**: If the groups claim is not found in the ID token, CockroachDB checks the access token (if it's a JWT format) for the same claim.

1. **Userinfo endpoint fallback**: If the groups claim is still not found, CockroachDB queries the IdP's userinfo endpoint and looks for the `userinfo_group_key` (default: `groups`).

1. **Combine and deduplicate**: Groups from the ID token and access token are combined and deduplicated. Groups from the userinfo endpoint are processed separately.

1. **Normalization**: Group names are normalized using `MakeSQLUsernameFromUserInput`, which performs case folding and Unicode normalization (NFC).

1. **Role matching**: Each normalized group name is compared against existing CockroachDB roles.

{{site.data.alerts.callout_info}}
OIDC authorization checks three sources for groups: ID token, access token, and userinfo endpoint. Groups from the ID token and access token are combined into a single list, while userinfo groups are treated as a separate fallback.
{{site.data.alerts.end}}

### Role synchronization

On each DB Console login, CockroachDB synchronizes the user's role memberships:

1. **Grant new roles**: If a group matches an existing role name and the user doesn't already have that role, it is granted.

1. **Revoke stale roles**: If the user has roles that don't match any current groups, those roles are revoked.

1. **Skip non-existent roles**: If a group doesn't match any existing role, it is silently skipped (no error is raised).

{{site.data.alerts.callout_info}}
IdP groups that don't correspond to CockroachDB roles are silently ignored. You must pre-create roles in CockroachDB for them to be granted.
{{site.data.alerts.end}}

### Empty groups behavior

If the groups claim exists but contains an empty array (`[]`):

1. All existing role memberships are revoked from the user.
1. Login is **rejected** with an authorization error.

This behavior ensures that users without group memberships cannot access the cluster, which is a security feature to prevent unauthorized access.

## Troubleshooting

Enable [`SESSION` logging]({% link {{ page.version.version }}/logging.md %}#sessions) to preserve data that will help troubleshoot OIDC authorization issues:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.auth_log.sql_sessions.enabled = true;
~~~

{{site.data.alerts.callout_info}}
Once all functionality is configured and tested successfully, we recommend disabling session logging to conserve system resources.
{{site.data.alerts.end}}

To view the logs, open `cockroach-session.log` from your [logging directory]({% link {{ page.version.version }}/configure-logs.md %}#logging-directory).

Potential issues to investigate may pertain to:

- **Token validation**: Ensure the ID token is properly signed and issued by a trusted issuer.
- **Missing groups claim**: Check if the ID token or access token contains the configured claim name. Use a JWT decoder tool to inspect the tokens.
- **Claim name mismatch**: Verify that `server.oidc_authentication.group_claim` matches the actual claim name in your tokens.
- **Userinfo endpoint**: If relying on userinfo fallback, ensure the endpoint is accessible and returns the expected JSON structure.
- **Role name mismatches**: Remember that group names are normalized (typically lowercased). Check that your role names match the normalized group names.
- **Empty groups**: Verify that users have group memberships in the IdP.
- **User doesn't exist**: Ensure the user has been created in CockroachDB before attempting to log in, or enable [automatic user provisioning]({% link {{ page.version.version }}/sso-db-console.md %}#manage-auto-provisioned-users).

### Common errors

**Error**: Authorization failure with empty groups

- **Cause**: The groups claim exists but contains an empty array.
- **Solution**: Ensure users have appropriate group memberships in your identity provider.

**Error**: User can log in but has no privileges

- **Cause**: Groups from the IdP don't match any existing CockroachDB roles.
- **Solution**: Create roles with names matching the normalized group names from your IdP.

**Error**: User not found

- **Cause**: The user doesn't exist in CockroachDB and automatic user provisioning is not enabled.
- **Solution**: Either create the user in CockroachDB manually before they attempt to log into the DB Console, or enable [automatic user provisioning]({% link {{ page.version.version }}/sso-db-console.md %}#manage-auto-provisioned-users).

## Security considerations

1. **Maintain backup authentication**: Always keep a backup authentication method (like password) for administrative users in case of IdP outages.

1. **Validate token issuers**: Ensure your OIDC configuration only accepts tokens from trusted issuers.

1. **Pre-create roles with minimal privileges**: Create roles before enabling authorization and grant only the necessary privileges following the principle of least privilege.

1. **Monitor role synchronization**: Regularly audit role assignments and changes. Enable audit logging if available to track when roles are granted or revoked.

1. **Secure the userinfo endpoint**: If using userinfo fallback, ensure the endpoint requires proper authentication and is only accessible over HTTPS.

1. **Review empty groups policy**: Understand that empty groups will block login. Ensure this aligns with your security requirements.

1. **Regularly audit IdP groups**: Review and clean up group memberships in your identity provider to ensure they reflect current access requirements.

1. **User provisioning**: If using [automatic user provisioning]({% link {{ page.version.version }}/sso-db-console.md %}#manage-auto-provisioned-users), ensure your OIDC provider is properly secured and only trusted users can authenticate. Regularly review auto-provisioned users to identify accounts that may need deprovisioning. If not using automatic provisioning, ensure all users are created in CockroachDB before they need access to the DB Console.

## See also

- [Single sign-on (SSO) to DB Console]({% link {{ page.version.version }}/sso-db-console.md %})
- [JWT Authorization]({% link {{ page.version.version }}/jwt-authorization.md %})
- [LDAP Authorization]({% link {{ page.version.version }}/ldap-authorization.md %})
- [Authorization]({% link {{ page.version.version }}/security-reference/authorization.md %})
