---
title: Single Sign-on (SSO) for DB Console
summary: Overview of requirements and management procedures for single sign-on (SSO) for DB Console.
toc: true
docs_area: manage
key: sso.html
---

CockroachDB clusters allow users to authenticate with Single sign-on (SSO), both to the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}), and for SQL client access.

Cluster Single sign-On (SSO) enables users to access the SQL interface of a CockroachDB cluster (whether provisioned on CockroachDB {{ site.data.products.cloud }} or {{ site.data.products.core }}) with the full security of Single sign-On (SSO), and the convenience of being able to choose from a variety of cloud-based or customer-managed identity providers (IdPs).

Single sign-on (SSO) for DB Console allows a CockroachDB user to access the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) in a secure cluster via an OpenID Connect (OIDC) client and an external identity provider. When SSO is configured and enabled, the [DB Console login page]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access) will display an OAuth login button in addition to the password access option.

This page describes how to set up Single Sign-on to the DB Console, which includes the following steps:

- The login flow for users, once a cluster is SSO-enabled.
- Configuring a CockroachDB Cluster for OIDC SSO authentication to the DB Console.
- Provisioning an OIDC client for CockroachDB Cluster SSO authentication, using GCP.

If you would also like to enable SSO authentication for SQL clients, you must complete additional configuration on the [Cluster Single Sign-on (SSO) using a JSON web token (JWT)]({% link {{ page.version.version }}/sso-sql.md %}) page.

{{site.data.alerts.callout_info}}
SSO for DB Console is available to CockroachDB {{ site.data.products.dedicated }} customers.

On CockroachDB {{ site.data.products.core }} clusters, SSO for DB Console requires an [Enterprise license]({% link {{ page.version.version }}/enterprise-licensing.md %}).
{{site.data.alerts.end}}

This SSO implementation uses the [authorization code grant type](https://tools.ietf.org/html/rfc6749#section-4.1) to authenticate a user.

**Prerequisites**:

- **IdP:** You must have access to an OAuth 2.0 identity provider and client. The process of provisioning one with Google Cloud Platform is described on this page in the [Provision an OAuth client using Google Cloud Platform (GCP)](#provision-an-oauth-client-using-google-cloud-platform-gcp) section.

- **CockroachDB cluster**: you must have access to one of the following:
	- A {{ site.data.products.core }} cluster enabled with a valid [CockroachDB Enterprise license]({% link {{ page.version.version }}/enterprise-licensing.md %}).
	- A [CockroachDB {{ site.data.products.dedicated }} cluster](https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster).


## Log in to a cluster's DB Console with SSO

From the user's perspective, once the cluster is properly configured to an identity provider, the sign-in flow is as follows:

1. A user opens the cluster's DB Console, and clicks on the **Log in with your OIDC provider** button which renders in the page.
1. The user is redirected to an external identity provider.
1. The user successfully authenticates with the provider, completing the OAuth flow.
1. The user is redirected to the CockroachDB cluster.
1. CockroachDB creates a web session for the SQL user in a new browser tab.
1. In the original browser tab, the user is redirected to the [DB Console Cluster Overview]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}).

## Provision an OAuth client using Google Cloud Platform (GCP)

These steps demonstrate how to create an OIDC auth client in Google Cloud Platform to use for SSO authentication to the DB Console.

1. Open the [Credentials page](https://console.developers.google.com/apis/credentials) for your account at Google APIs.

1. Click **+ CREATE CREDENTIALS** and select **OAuth client ID**. Specify a **web application** from the pulldown menu.

1. Note the *client ID* and *client secret* of the OAuth 2.0 client — you will need these values to configure you cluster to use them.

1. Add your cluster's callback URL to the list of **Authorized redirect URIs**. On a local cluster, this will be `https://{ your cluster's domain }:8080/oidc/v1/callback`. You must later set `server.oidc_authentication.redirect_url` to the same value.

	{{site.data.alerts.callout_info}}
	- For a {{ site.data.products.core }} cluster, The domain is `localhost`. 
	- For a {{ site.data.products.dedicated }} cluster, find the domain by opening the DB Console from your cluster's **Tools** tab in DB Console.
	{{site.data.alerts.end}}

## Configure your cluster to use an OIDC client and provider

**Prerequisites**:

You must have the ability to update your cluster settings, which you can achieve in several ways. Refer to the Required Privileges section on the [`SET CLUSTER SETTING`](set-cluster-setting.html#required-privileges) page.

### Cluster Settings

The following [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}) must be configured to enable SSO authentication to the DB Console.

Use the [Update your cluster settings](#update-your-cluster-settings) section to configure your cluster settings.

| Cluster Setting | Description 
|-----------------|------
| `server.oidc_authentication.enabled` | A Boolean that enables or disables SSO.
| `server.oidc_authentication.client_id` | Your auth client's ID, e.g., `32789079457-g3hdfw8cbw85obi5cb525hsceaqf69unn.apps.googleusercontent.com`.
| `server.oidc_authentication.client_secret` | Your auth client's secret.
| `server.oidc_authentication.redirect_url` | Specifies the callback URL that redirects the user to CockroachDB after a successful authentication. This can be the address of a node in the cluster or the address of a load balancer that routes traffic to the nodes. You must append the path with `/oidc/v1/callback`. E.g., `https://{ your cluster's domain } :8080/oidc/v1/callback`.
| `server.oidc_authentication.provider_url` | Specifies the OAuth issuer identifier. Ensure that the URL does not have a terminating `/`. For more information, refer to the [OIDC specification](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig). Note that CockroachDB appends the required `/.well-known/openid-configuration` by default. You do not need to include it. E.g., `https://accounts.google.com`.
| `server.oidc_authentication.scopes` | A space-delimited list of the [OAuth scopes](https://openid.net/specs/openid-connect-core-1_0.html#ScopeClaims) being requested for an Access Token. The `openid` and `email` scopes must be included. E.g., `openid profile email`.
| `server.oidc_authentication.claim_json_key` | The field/key used to identify the user from the external identity provider's [ID Token](https://openid.net/specs/openid-connect-core-1_0.html#IDToken).
| `server.oidc_authentication.principal_regex` | Regex used to map the external identity key to a SQL user. For example: `^([^@]+)@[^@]+$` matches any email address (defined as a string containing one `@` sign) and extracts a username from the string to the left of `@`, whereas `^(.+)$` maps the claim directly to a principal.
| `server.oidc_authentication.autologin` | Must be set to `true`.


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

1. Specify the callback URL to redirect the user to the CockroachDB cluster. On a local cluster, this will be `https://localhost:8080/oidc/v1/callback`. For a {{ site.data.products.dedicated }} cluster, replace 'localhost' with your cluster's domain. This can be found by opening the DB Console from the will be the URL of the You will later set `server.oidc_authentication.redirect_url` to the same value.

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

1. Finally, enable OIDC authentication:

	{% include_cached copy-clipboard.html %}
	~~~sql
	SET CLUSTER SETTING server.oidc_authentication.enabled = true;
	~~~

{{site.data.alerts.callout_info}}
You can optionally enable the [`server.oidc_authentication.autologin` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to automatically log in an authenticated user who visits the DB Console.
{{site.data.alerts.end}}
