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

This page describes how to set up Single Sign-on to the DB Console, which includes the following steps:

- [The login flow for users](#log-in-to-a-clusters-db-console-with-sso), once a cluster is SSO-enabled.
- [Provision an OIDC client](#provision-an-oauth-client-using-google-cloud-platform-gcp) for CockroachDB Cluster SSO authentication using GCP.
- [Configure a CockroachDB Cluster for OIDC SSO authentication](#configure-your-cluster-to-use-an-oidc-client-and-provider) to the DB Console.

If you would also like to enable SSO authentication for SQL clients, you must complete additional configuration on the [Cluster Single Sign-on (SSO) using a JSON web token (JWT)]({% link {{ page.version.version }}/sso-sql.md %}) page.

This SSO implementation uses the [authorization code grant type](https://tools.ietf.org/html/rfc6749#section-4.1) to authenticate a user.

**Prerequisites**:

- **IdP:** You must have access to an OAuth 2.0 identity provider and client. The process of provisioning one with Google Cloud Platform is described on this page in the [Provision an OAuth client using Google Cloud Platform (GCP)](#provision-an-oauth-client-using-google-cloud-platform-gcp) section.

- **CockroachDB cluster**: you must have access to one of the following:
	- A {{ site.data.products.core }} cluster enabled with a valid [CockroachDB Enterprise license]({% link {{ page.version.version }}/licensing-faqs.md %}#types-of-licenses).
	- A [CockroachDB {{ site.data.products.advanced }} cluster]({% link cockroachcloud/create-your-cluster.md %}).

{{site.data.alerts.callout_info}}
CockroachDB {{ site.data.products.cloud }} {{ site.data.products.standard }} and {{ site.data.products.basic }} clusters do not have access to the DB Console. For SQL client authentication on these tiers, refer to [Cluster Single Sign-on (SSO) using the Cloud Console]({% link cockroachcloud/cloud-sso-sql.md %}).
{{site.data.alerts.end}}

## Log in to a cluster's DB Console with SSO

From the user's perspective, once the cluster is properly configured to an identity provider, the sign-in flow is as follows:

1. A user opens the cluster's DB Console, and clicks on the **Log in with your OIDC provider** button that renders on the page.
1. The user is redirected to an external identity provider.
1. The user authenticates successfully with the provider, which completes the OAuth flow.
1. The user is redirected to the CockroachDB cluster.
1. CockroachDB creates a web session for the SQL user in a new browser tab.
1. In the original browser tab, the user is redirected to the [DB Console Cluster Overview]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}).

## Provision an OAuth client using Google Cloud Platform (GCP)

These steps demonstrate how to create an OIDC auth client in Google Cloud Platform to use for SSO authentication to the DB Console.

1. Open the [Credentials page](https://console.developers.google.com/apis/credentials) for your account at Google APIs.

1. Click **+ CREATE CREDENTIALS** and select **OAuth client ID**. Specify a **web application** from the pulldown menu.

1. Note the *client ID* and *client secret* of the OAuth 2.0 client—you will need to configure your cluster to use these values.

1. Add your cluster's callback URL to the list of **Authorized redirect URIs**. On a local cluster, this will be `https://{ your cluster's domain }:8080/oidc/v1/callback`. Subsequently, when configuring your cluster, you will need to ensure that the cluster setting `server.oidc_authentication.redirect_url` has the same value.
    - For a {{ site.data.products.core }} cluster, the domain is `localhost`.
    - For a {{ site.data.products.advanced }} cluster, find the domain by opening the DB Console from your cluster's **Tools** tab in DB Console.

## Configure your cluster to use an OIDC client and provider

**Prerequisites**:

You must have the ability to update your cluster settings, which you can achieve in several ways. Refer to the Required Privileges section on the [`SET CLUSTER SETTING`](set-cluster-setting.html#required-privileges) page.

### Cluster Settings

You must configure the [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}) in the following table to enable SSO authentication to the DB Console. Refer to the [Update your cluster settings](#update-your-cluster-settings) section to configure your cluster settings.

Cluster Setting | Description
----------------|------
`server.oidc_authentication.enabled` | A Boolean that enables or disables SSO.
`server.oidc_authentication.client_id` | Your auth client's ID.<br>**Example:** `32789079457-g3hdfw8cbw85obi5cb525hsceaqf69unn.apps.googleusercontent.com`.
`server.oidc_authentication.client_secret` | Your auth client's secret.
`server.oidc_authentication.client.timeout` | An optional HTTP client timeout for external calls made during OIDC authentication, in seconds. Defaults to `15` seconds.
`server.oidc_authentication.redirect_url` | Specifies the callback URL that redirects the user to CockroachDB after a successful authentication. This can be the address of a node in the cluster or the address of a load balancer that routes traffic to the nodes. You must append the path with <code>/oidc/v1/callback</code>. Accepts either a single URL string (for example, <code>https://{your_cluster's_domain }:8080/oidc/v1/callback</code>) or a JSON object with the following format, which supports region-based OIDC authentication with a callback URL configured per region:<br />**Example:** `{"redirect_urls": {"us-east-1": "https://{cluster_ip_address}:8080/oidc/v1/callback","eu-west-1": "example.com"{% raw %}}}{% endraw %}`
`server.oidc_authentication.provider_url` | Specifies the OAuth issuer identifier. Ensure that the URL does not have a terminating `/`. For more information, refer to the [OIDC specification](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig). Note that CockroachDB appends the required `/.well-known/openid-configuration` by default. You do not need to include it.<br />**Example:** `https://accounts.google.com`.
`server.oidc_authentication.scopes` | A space-delimited list of the [OAuth scopes](https://openid.net/specs/openid-connect-core-1_0.html#ScopeClaims) being requested for an Access Token. The `openid` and `email` scopes must be included.<br>**Example:** `openid profile email`.
`server.oidc_authentication.claim_json_key` | The field/key used to identify the user from the external identity provider's [ID Token](https://openid.net/specs/openid-connect-core-1_0.html#IDToken), such as `email`. The key can contain a single identity or a list of identities, and is parsed using `server.oidc_authentication.principal_regex`.
`server.oidc_authentication.principal_regex` | Regex used to map the external identity key to a SQL user. If the identity key contains a list of identities instead of a single identity, each identity is evaluated serially until a match is found. The first match that is found is used, and the remaining identities are not evaluated. For example: `^([^@]+)@[^@]+$` matches any email address (defined as a string containing one `@` sign) and extracts a username from the string to the left of `@`, whereas `^(.+)$` maps the claim directly to a principal. The regex must contain exactly one capture group (set of parentheses); a regex with no capture groups or multiple capture groups will never find a match.
`server.oidc_authentication.autologin` | A Boolean that enables or disables automatic login with SSO when the DB Console is loaded. If set to `false` (the default), the user will have to click **Log in with your OIDC provider** (unless overriden with `server.oidc_authentication.button_text`) before they're authenticated.
`server.oidc_authentication.button_text` | Specifies the text to show on the button that launches authentication with the OIDC provider. This is set to `Log in with your OIDC provider` by default but can be customized to reference your specific provider by name.
`security.provisioning.oidc.enabled` | Enables automatic user creation on first OIDC login. Defaults to `false`. See [Configure OIDC Authorization for DB Console]({% link {{ page.version.version }}/oidc-authorization.md %}#step-3-configure-user-provisioning-optional).
`server.oidc_authentication.authorization.enabled` | Enables automatic role synchronization based on OIDC group claims. See [Configure OIDC Authorization for DB Console]({% link {{ page.version.version }}/oidc-authorization.md %}). Defaults to `false`.

### Update your cluster settings

1. Open a SQL shell to your cluster:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    cockroach sql --certs-dir=certs --host={your cluster url}:26257
    ~~~

1. Specify the client ID and client secret you obtained earlier:

	{% include_cached copy-clipboard.html %}
	~~~sql
	SET CLUSTER SETTING server.oidc_authentication.client_id = '\<client id\>';
	SET CLUSTER SETTING server.oidc_authentication.client_secret = '\<client secret\>';
	~~~

1. Specify the OAuth provider URL:

	{% include_cached copy-clipboard.html %}
	~~~sql
	SET CLUSTER SETTING server.oidc_authentication.provider_url = 'https://accounts.google.com';
	~~~

1. Specify the callback URL to redirect the user to the CockroachDB cluster. On a local cluster, this will be `https://localhost:8080/oidc/v1/callback`. For a {{ site.data.products.advanced }} cluster, replace 'localhost' with your cluster's domain, which can be found by opening the DB Console from the **Tools** tab in your cluster's page in Cloud Console.

	{% include_cached copy-clipboard.html %}
	~~~sql
	SET CLUSTER SETTING server.oidc_authentication.redirect_url = 'https://{your cluster url}:8080/oidc/v1/callback';
	~~~

1. Specify the following values to obtain an OIDC identifier that will be mapped to a SQL user.

	Request the `openid` and `email` scopes from the Access Token:

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

1. [Create a SQL user]({% link {{ page.version.version }}/create-user.md %}#create-a-user) that will log into the DB Console. The SQL username you specify must match the identifier obtained in the previous step. For example, a user with the email address `docs@cockroachlabs.com` will need the SQL username `docs`:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    CREATE USER docs;
    ~~~

    Alternatively, you can enable automatic user provisioning to create users automatically on their first OIDC login. For details, refer to [Configure OIDC Authorization for DB Console]({% link {{ page.version.version }}/oidc-authorization.md %}#step-3-configure-user-provisioning-optional).

1. Finally, enable OIDC authentication:

	{% include_cached copy-clipboard.html %}
	~~~sql
	SET CLUSTER SETTING server.oidc_authentication.enabled = true;
	~~~

{{site.data.alerts.callout_info}}
You can optionally enable the [`server.oidc_authentication.autologin` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to automatically log in an authenticated user who visits the DB Console.
{{site.data.alerts.end}}

## Configure role-based access control



Once OIDC authentication is configured, you can optionally enable:

- **Automatic user provisioning**: Automatically create SQL users on their first OIDC login, eliminating the need to pre-create users manually.
- **Automatic role synchronization**: Automatically grant and revoke CockroachDB roles based on group memberships from your identity provider.

For detailed instructions on configuring OIDC authorization and user provisioning, refer to [Configure OIDC Authorization for DB Console]({% link {{ page.version.version }}/oidc-authorization.md %}).

## See also

- [DB Console Overview]({% link {{ page.version.version }}/ui-overview.md %})
- [Cluster Single Sign-on (SSO) using JSON web tokens (JWTs)]({% link {{ page.version.version }}/sso-sql.md %})
- [Configure OIDC Authorization for DB Console]({% link {{ page.version.version }}/oidc-authorization.md %})
- [JWT Authorization]({% link {{ page.version.version }}/jwt-authorization.md %})
- [LDAP Authorization]({% link {{ page.version.version }}/ldap-authorization.md %})
