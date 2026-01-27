---
title: Single Sign-on (SSO) for DB Console
summary: Overview of requirements and management procedures for single sign-on (SSO) for DB Console.
toc: true
docs_area: manage
key: sso.html
---

CockroachDB clusters allow users to authenticate with single sign-on (SSO) to the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) and the SQL interface:

- Cluster single sign-on (SSO): Enables users to access the SQL interface of a CockroachDB cluster (whether provisioned on CockroachDB {{ site.data.products.cloud }} or {{ site.data.products.core }}) with the full security of single sign-on (SSO), and the choice of a variety of cloud-based or customer-managed identity providers (IdPs).

- Single sign-on (SSO) for DB Console: Allows a CockroachDB user to access the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) in a secure cluster via an OpenID Connect (OIDC) client and an external identity provider. When SSO is configured and enabled, the [DB Console login page]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access) will display an OAuth login button in addition to the password access option.

This page describes how to set up SSO to the DB Console:

- [Configuration](#configuration)
- [Log in to a cluster's DB Console with SSO](#log-in-to-a-clusters-db-console-with-sso)
- [Manage auto-provisioned users](#manage-auto-provisioned-users)
- [Configure role-based access control](#configure-role-based-access-control)

{{site.data.alerts.callout_info}}
Enabling SSO authentication for SQL clients requires additional configuration. Refer to [Cluster Single Sign-on (SSO) using a JSON web token (JWT)]({% link {{ page.version.version }}/sso-sql.md %}).
{{site.data.alerts.end}}

This SSO implementation uses the [authorization code grant type](https://tools.ietf.org/html/rfc6749#section-4.1) to authenticate a user.

## Configuration

### Prerequisites

- **IdP:** You must have access to an OAuth 2.0 identity provider and client. Refer to [Step 1: Provision an OIDC client](#step-1-provision-an-oidc-client).

- **CockroachDB cluster**: You must have access to one of the following:
	- A {{ site.data.products.core }} cluster enabled with a valid [CockroachDB Enterprise license]({% link {{ page.version.version }}/licensing-faqs.md %}#types-of-licenses).
	- A [CockroachDB {{ site.data.products.advanced }} cluster]({% link cockroachcloud/create-your-cluster.md %}).

{{site.data.alerts.callout_info}}
CockroachDB {{ site.data.products.standard }} and {{ site.data.products.basic }} clusters do not have access to the DB Console. For SQL client authentication on these tiers, refer to [Cluster Single Sign-on (SSO) using the Cloud Console]({% link cockroachcloud/cloud-sso-sql.md %}).
{{site.data.alerts.end}}

### Step 1: Provision an OIDC client

These steps demonstrate how to create an OIDC auth client in Google Cloud Platform to use for SSO authentication to the DB Console.

1. Open the [Credentials page](https://console.developers.google.com/apis/credentials) for your account at Google APIs.

1. Click **+ CREATE CREDENTIALS** and select **OAuth client ID**. Specify a **web application** from the pulldown menu.

1. Note the *client ID* and *client secret* of the OAuth 2.0 client: you will need to configure your cluster to use these values.

1. Add your cluster's callback URL to the list of **Authorized redirect URIs**. On a local cluster, this will be `https://{ your cluster's domain }:8080/oidc/v1/callback`. Subsequently, when configuring your cluster, you will need to ensure that the cluster setting `server.oidc_authentication.redirect_url` has the same value.
    - For a {{ site.data.products.core }} cluster, the domain is `localhost`.
    - For an {{ site.data.products.advanced }} cluster, open the DB Console from the cluster’s **Tools** tab in the Cloud Console, and use the host portion of that URL as your domain.

### Step 2: Configure cluster settings

You must have the required privileges to update your cluster settings. Refer to [`SET CLUSTER SETTING`](set-cluster-setting.html#required-privileges).

#### Cluster settings

Configure the [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}) in the following table to enable SSO authentication to the DB Console. Refer to [Update your cluster settings](#update-your-cluster-settings).

Cluster Setting | Description
----------------|------
`server.oidc_authentication.enabled` | A Boolean that enables or disables SSO.
`server.oidc_authentication.client_id` | Your auth client's ID.<br>**Example:** `32789079457-g3hdfw8cbw85obi5cb525hsceaqf69unn.apps.googleusercontent.com`.
`server.oidc_authentication.client_secret` | Your auth client's secret.
`server.oidc_authentication.client.timeout` | An optional HTTP client timeout for external calls made during OIDC authentication, in seconds. Defaults to `15` seconds.
`server.oidc_authentication.redirect_url` | Specifies the callback URL that redirects the user to CockroachDB after a successful authentication. This can be the address of a node in the cluster or the address of a load balancer that routes traffic to the nodes. You must append the path with <code>/oidc/v1/callback</code>. Accepts either a single URL string (for example, <code>https://{your_cluster's_domain }:8080/oidc/v1/callback</code>) or a JSON object with the following format, which supports region-based OIDC authentication with a callback URL configured per region:<br />**Example:** `{"redirect_urls": {"us-east-1": "https://{cluster_ip_address}:8080/oidc/v1/callback","eu-west-1": "example.com"{% raw %}}}{% endraw %}`
`server.oidc_authentication.provider_url` | Specifies the OAuth issuer identifier. Ensure that the URL does not have a terminating `/`. For more information, refer to the [OIDC specification](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig). Note that CockroachDB appends the required `/.well-known/openid-configuration` by default. You do not need to include it.<br />**Example:** `https://accounts.google.com`.
`server.oidc_authentication.scopes` | A space-delimited list of the [OAuth scopes](https://openid.net/specs/openid-connect-core-1_0.html#ScopeClaims) being requested for an access token. The `openid` scope is required. Additional scopes such as `email` and `profile` may be needed depending on your `claim_json_key` configuration.<br>**Example:** `openid email` or `openid profile email`.
`server.oidc_authentication.claim_json_key` | The field/key used to identify the user from the external identity provider's [ID Token](https://openid.net/specs/openid-connect-core-1_0.html#IDToken), such as `email`. The key can contain a single identity or a list of identities, and is parsed using `server.oidc_authentication.principal_regex`.
`server.oidc_authentication.principal_regex` | Regex used to map the external identity key to a SQL user. If the identity key contains a list of identities instead of a single identity, each identity is evaluated serially until a match is found. The first match that is found is used, and the remaining identities are not evaluated. For example: `^([^@]+)@[^@]+$` matches any email address (defined as a string containing one `@` sign) and extracts a username from the string to the left of `@`, whereas `^(.+)$` maps the claim directly to a principal. The regex must contain exactly one capture group (set of parentheses); a regex with no capture groups or multiple capture groups will never find a match.
`server.oidc_authentication.autologin` | A Boolean that enables or disables automatic login with SSO when the DB Console is loaded. If set to `false` (the default), the user will have to click **Log in with your OIDC provider** (unless overriden with `server.oidc_authentication.button_text`) before they're authenticated.
`server.oidc_authentication.button_text` | Specifies the text to show on the button that launches authentication with the OIDC provider. This is set to `Log in with your OIDC provider` by default but can be customized to reference your specific provider by name.
`security.provisioning.oidc.enabled` | Enables automatic user creation on first OIDC login. Defaults to `false`. Refer to [Step 3: Configure user creation](#step-3-configure-user-creation).
`server.oidc_authentication.authorization.enabled` | Enables automatic role synchronization based on OIDC group claims. See [Configure OIDC Authorization for DB Console]({% link {{ page.version.version }}/oidc-authorization.md %}). Defaults to `false`.

#### Update your cluster settings

Open a SQL shell to your cluster:

{% include_cached copy-clipboard.html %}
~~~shell
cockroach sql --certs-dir=certs --host={your cluster url}:26257
~~~

Specify the client ID and client secret you [obtained earlier](#step-1-provision-an-oidc-client):

{% include_cached copy-clipboard.html %}
~~~sql
SET CLUSTER SETTING server.oidc_authentication.client_id = '\<client id\>';
SET CLUSTER SETTING server.oidc_authentication.client_secret = '\<client secret\>';
~~~

Specify the OAuth provider URL:

{% include_cached copy-clipboard.html %}
~~~sql
SET CLUSTER SETTING server.oidc_authentication.provider_url = 'https://accounts.google.com';
~~~

Specify the callback URL to redirect the user to the CockroachDB cluster. On a local cluster, this will be `https://localhost:8080/oidc/v1/callback`. For a {{ site.data.products.advanced }} cluster, replace `localhost` with your cluster's domain, which can be found by opening the DB Console from the **Tools** tab in your cluster's page in Cloud Console.

{% include_cached copy-clipboard.html %}
~~~sql
SET CLUSTER SETTING server.oidc_authentication.redirect_url = 'https://{your cluster url}:8080/oidc/v1/callback';
~~~

Specify the following values to obtain an OIDC identifier that will be mapped to a SQL user.

Request the `openid` scope (required) and the `email` scope (needed when using email as the claim key):

{% include_cached copy-clipboard.html %}
~~~sql
SET CLUSTER SETTING server.oidc_authentication.scopes = 'openid email';
~~~

Specify the `email` field from the ID Token:

{% include_cached copy-clipboard.html %}
~~~sql
SET CLUSTER SETTING server.oidc_authentication.claim_json_key = 'email';
~~~

Use a regular expression that will extract a username from `email` that you can match to a SQL user. For example, `'^([^@]+)@cockroachlabs\.com$'` extracts the characters that precede `@cockroachlabs.com` in the email address.

{% include_cached copy-clipboard.html %}
~~~sql
SET CLUSTER SETTING server.oidc_authentication.principal_regex = '^([^@]+)@cockroachlabs.com$';
~~~

### Step 3: Configure user creation

CockroachDB supports two approaches for the creation of users who will authenticate via OIDC:

#### Option 1: Automatic user provisioning (recommended)

With automatic user provisioning, CockroachDB creates users automatically during their first successful OIDC authentication. This eliminates the need for custom scripting to create user accounts.

To enable automatic user provisioning:

{% include_cached copy-clipboard.html %}
~~~sql
SET CLUSTER SETTING security.provisioning.oidc.enabled = true;
~~~

When enabled:

- Users are created automatically upon successful OIDC authentication.
- All auto-provisioned users receive a `PROVISIONSRC` role option set to `oidc:{provider_url}`.
- The `estimated_last_login_time` is tracked for auditing purposes.
- Auto-provisioned users cannot change their own passwords (managed via OIDC only).

{{site.data.alerts.callout_info}}
Before you enable automatic user provisioning, it is recommended that you enable [OIDC authorization]({% link {{ page.version.version }}/oidc-authorization.md %}). This ensures that upon initial login, new CockroachDB users are members of the intended CockroachDB roles, with the privileges they confer, according to users' group memberships in the identity provider. Otherwise, functionality may be limited for a new user until your alternative process applies roles or privileges.

If you choose to manage CockroachDB role memberships and privileges directly, you could script the required [`GRANT`]({% link {{ page.version.version }}/grant.md %}) commands to be [executed]({% link {{ page.version.version }}/cockroach-sql.md %}#general) as needed.
{{site.data.alerts.end}}

#### Option 2: Manual/scripted user creation

You can manage users by directly creating them before OIDC authentication is used. This approach provides explicit control over user creation.

To create a single user:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE USER docs;
~~~

The SQL username you specify must match the identifier extracted by your `principal_regex` from the OIDC token. For example, if you configured `claim_json_key = 'email'` and `principal_regex = '^([^@]+)@cockroachlabs\.com$'`, a user with the email address `docs@cockroachlabs.com` will need the SQL username `docs`.

### Step 4: Enable OIDC authentication

{% include_cached copy-clipboard.html %}
~~~sql
SET CLUSTER SETTING server.oidc_authentication.enabled = true;
~~~

{{site.data.alerts.callout_success}}
You can enable the optional [`server.oidc_authentication.autologin` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to automatically log in an authenticated user who visits the DB Console.
{{site.data.alerts.end}}

## Log in to a cluster's DB Console with SSO

From the user's perspective, once the cluster is properly configured to an identity provider, the sign-in flow is as follows:

1. A user opens the cluster's DB Console, and clicks the **Log in with your OIDC provider** button on the page.
1. The user is redirected to an external identity provider.
1. The user authenticates successfully with the provider, which completes the OAuth flow.
1. The user is redirected to the CockroachDB cluster.
1. CockroachDB creates a web session for the SQL user in a new browser tab.
1. In the original browser tab, the user is redirected to the DB Console [**Cluster Overview**]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}) page.

## Manage auto-provisioned users

When automatic user provisioning is enabled, you can identify and manage auto-provisioned users as follows:

### View provisioned users

Auto-provisioned users can be identified by their `PROVISIONSRC` role option:

{% include_cached copy-clipboard.html %}
~~~ sql
-- View all auto-provisioned users (users with PROVISIONSRC role option)
SELECT * FROM [SHOW USERS] AS u
WHERE EXISTS (
  SELECT 1 FROM unnest(u.options) AS opt
  WHERE opt LIKE 'PROVISIONSRC=oidc:%'
);
~~~

~~~
  username |                     options                     | member_of    |   estimated_last_login_time
-----------+-------------------------------------------------+--------------+--------------------------------
  alice    | {PROVISIONSRC=oidc:https://accounts.google.com} | {developers} | 2025-08-04 19:18:00.201402+00
  bob      | {PROVISIONSRC=oidc:https://accounts.google.com} | {analysts}   | 2025-08-03 14:22:15.102938+00
(2 rows)
~~~

Users provisioned via OIDC will have `PROVISIONSRC=oidc:{provider_url}` in their options column.

### Last-login tracking for usage and dormancy

The `estimated_last_login_time` column in the [`SHOW USERS` output](#view-provisioned-users) tracks when users last authenticated. This can help identify dormant accounts that may need review or removal.

{{site.data.alerts.callout_info}}
`estimated_last_login_time` is computed on a best-effort basis and may not capture every login event due to asynchronous updates.
{{site.data.alerts.end}}

To identify potentially dormant auto-provisioned users:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT u.username, u.estimated_last_login_time
FROM [SHOW USERS] AS u
WHERE EXISTS (
  SELECT 1 FROM unnest(u.options) AS opt
  WHERE opt LIKE 'PROVISIONSRC=oidc:%'
) AND (
  u.estimated_last_login_time IS NULL OR
  u.estimated_last_login_time < NOW() - INTERVAL '90 days'
)
ORDER BY u.estimated_last_login_time DESC NULLS LAST;
~~~

### Clean up users removed from the identity provider

Auto-provisioned users who have been removed or deactivated in your identity provider will not be automatically removed from CockroachDB. To identify and clean up these orphaned accounts:

#### Step 1: Export auto-provisioned users from CockroachDB

{% include_cached copy-clipboard.html %}
~~~ sql
-- Export list of auto-provisioned usernames for comparison with your IdP
SELECT u.username FROM [SHOW USERS] AS u
WHERE EXISTS (
  SELECT 1 FROM unnest(u.options) AS opt
  WHERE opt LIKE 'PROVISIONSRC=oidc:%'
);
~~~

#### Step 2: Cross-reference with your identity provider

Use your organization's identity management tools to verify which of these users still exist in your IdP. The specific method depends on your identity provider (Okta, Google Workspace, Azure AD, etc.).

#### Step 3: Remove orphaned users

Before dropping users confirmed to no longer exist in your identity provider, check for any privileges that were granted directly to the user:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Check for direct grants to the user (privileges inherited through roles won't block DROP USER)
SHOW GRANTS FOR username;
~~~

If any direct grants exist, revoke them before dropping the user. For users confirmed to no longer exist in your identity provider:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Remove users that no longer exist in the identity provider
DROP USER username1, username2, username3;
~~~

{{site.data.alerts.callout_info}}
Users cannot be dropped if they have direct privilege grants or own database objects. For complete requirements, refer to [`DROP USER`]({% link {{ page.version.version }}/drop-user.md %}). When using both automatic user provisioning and OIDC authorization, consider granting privileges primarily through roles (mapped to IdP groups) rather than directly to users to simplify cleanup operations.
{{site.data.alerts.end}}

### Restrictions on auto-provisioned users

{% include {{ page.version.version }}/security/auto-provisioned-user-restrictions.md %}

## Configure role-based access control

Once OIDC authentication is configured, you can optionally enable automatic role synchronization to automatically grant and revoke CockroachDB roles based on group memberships from your identity provider.

For detailed instructions, refer to [Configure OIDC Authorization for DB Console]({% link {{ page.version.version }}/oidc-authorization.md %}).

## See also

- [DB Console Overview]({% link {{ page.version.version }}/ui-overview.md %})
- [Cluster Single Sign-on (SSO) using JSON web tokens (JWTs)]({% link {{ page.version.version }}/sso-sql.md %})
- [Configure OIDC Authorization for DB Console]({% link {{ page.version.version }}/oidc-authorization.md %})
- [JWT Authorization]({% link {{ page.version.version }}/jwt-authorization.md %})
- [LDAP Authorization]({% link {{ page.version.version }}/ldap-authorization.md %})
