---
title: Cluster Single Sign-on (SSO) for {{ site.data.products.db }}
summary: Overview of Cluster Single Sign-on (SSO) for {{ site.data.products.db }}, and review of workflows for authenticating human and application users, and for configuring required cluster settings.
toc: true
docs_area: manage
---

Cluster SSO allows users to access the SQL interface of a CockroachDB cluster (whether provisioned on {{ site.data.products.db }} or self-hosted) with the full security of Single Sign-On (SSO), and the convenience of being able to choose from a variety of SSO identity providers, including {{ site.data.products.db }}, Google, Azure, GitHub, or your own self-hosted OIDC.

This page describes:

- [Authenticating human users](#authenticate-human-users-with-the-cloud-console) with the {{ site.data.products.db }} Console acting as identity provider (IdP) or token issuer
- [Authenticating service accounts](#authenticate-application-users-service-accounts-with-external-idps) with an external token issuer
- [Configuring the cluster settings](#configure-your-cluster-to-accept-your-external-identity-provider) required to authenticate service accounts

Note that this regards SQL access to a specific CockroachDB Cluster, not access to a {{ site.data.products.db }} organization. For the latter, see [Single Sign-On (SSO) for CockroachDB Cloud organizations](cloud-org-sso.html).

You might also be looking for [Cluster Single Sign-On (SSO) for Self-hosted CockroachDB](../v22.2/sso-sql.html).

## Authenticate human users with the cloud console

{{ site.data.products.db }} can issue authentication tokens for human users, which can be used for SSO using the `ccloud` CLI. {{ site.data.products.dedicated }} and {{ site.data.products.serverless }} clusters are, by default, configured to allow Cluster SSO authentication with {{ site.data.products.db }} serving as SSO provider. No additional set-up is required.

{{site.data.alerts.callout_info}}
Note that this authentication method only works for human users, since only humans may have {{ site.data.products.db }} Console identities.

Application users (i.e. service accounts), can authenticate using JWT tokens from your own identity provider. See [Authenticating software users (service accounts) with Cluster SSO](#authenticate-human-users-with-the-cloud-console).
{{site.data.alerts.end}}

**Learn more:**

- [Single Sign-On (SSO) for CockroachDB Cloud organizations](cloud-org-sso.html#cloud-organization-sso)
- [Configure Cloud Organization Single Sign-On (SSO)](configure-cloud-org-sso.html)

**Prerequisites:**

- You must have a user identity on a {{ site.data.products.db }} organization. For help setting up an organization and cluster, see: [Quickstart with CockroachDB](quickstart.html).
- SSO must be enabled for your organization. For help configuring SSO for your {{ site.data.products.db }} organization, see: [Configure Cloud Organization Single Sign-On (SSO)](configure-cloud-org-sso.html)
- SSO must be enabled for your particular {{ site.data.products.db }} user. Configure this at the [{{ site.data.products.db }} Console account settings page](https://cockroachlabs.cloud/account/profile).
- Your {{ site.data.products.db }} user identity must have access to at least one cluster in your organization.
- To authenticate to a specific cluster using SSO, a {{ site.data.products.db }} user must have a corresponding SQL user already [created](../{{site.versions["stable"]}}/create-user.html#create-a-user) on that cluster. {{ site.data.products.db }} users must correspond to SQL users by the convention that the SQL username must be `sso_{email_address}`. 

???!!! {Cameron, how does this format actually work, does the "@gmail" go in there???}

- [`ccloud`, the {{ site.data.products.db }} CLI](ccloud-get-started.html) must be installed on your local workstation.


1. First authenticate to your {{ site.data.products.db }} organization. This command will cause your workstation's default browser to open to a {{ site.data.products.db }} authentication portal. Authenticate here as you normally do to the {{ site.data.products.db }} Console. The `ccloud` utility will receive an authentication token from the browser, allowing you to authenticate from the command line.

	{% include_cached copy-clipboard.html %}
	~~~shell
	ccloud auth login
	~~~

1. You may then use the `ccloud` utility to authenticate to your {{ site.data.products.db }} cluster, allowing you to access the SQL interface.

	{% include_cached copy-clipboard.html %}
	~~~shell
	ccloud cluster sql --sso {your cluster name}
	~~~

## Authenticate application users (service accounts) with external IdPs

Currently, {{ site.data.products.db }} can only serve as a token issuer for human users as it requires an interactive flow. Authenticating service accounts, i.e. user identities to be controlled by software applications or scripts, rather than by humans, can not leverage an interactive flow and it needs a different headless mechanism.

{{ site.data.products.db }} SSO supports the use of external IdPs such as Google, Microsoft, GitHub, or customer deployed OIDC or SAML solutions, such as Okta. All of these options support multifactor authentication (MFA).

**Learn more:**

This [Cockroach Labs blog post](https://www.cockroachlabs.com/blog/) covers and provides further resources for a variety of auth token-issuing use cases, including using Okta and Google Cloud Platform to issue tokens.

**Prerequisites:**

- You must have the ability to create identities and issue tokens with a SAML or OIDC identity provider.
	{{site.data.alerts.callout_success}}
	The `issuer` and `audience` fields in the token must match values [configured in your cluster settings](#configure-your-cluster-to-accept-your-external-identity-provider).
	{{site.data.alerts.end}}
- You must have a user identity on a {{ site.data.products.db }} organization. For help setting up an organization and cluster, see: [Quickstart with CockroachDB](quickstart.html).
- You must have access to a SQL user with either the [`admin` role](../{{site.versions["stable"]}}/security-reference/authorization.html#admin-role) or the [`MODIFYCLUSTERSETTING`](../{{site.versions["stable"]}}/security-reference/authorization.html#supported-privileges.html), in order to update cluster settings. This is required to add an external token issuer/IdP.
- A SQL user specifically corresponding to the service account must be pre-provisioned on the cluster (or you must have access to a SQL role allowing you to create such a user).

### Configure your cluster to accept your external identity provider

In order to authenticate a service account to a {{ site.data.products.db }} cluster using a JWT issuer, you must update several cluster settings in the `server.jwt_authentication` namespace:

1. `server.jwt_authentication.jwks`

	Add your IdP's public signing key to your cluster's list of accepted signing JSON web keys (JWKS), under the `jwks` setting. This is a [JWK](https://www.rfc-editor.org/rfc/rfc7517) formatted single key or key set, containing the [public keys](../{{site.versions["stable"]}}/security-reference/transport-layer-security.html#key-pairs) for SSO token issuers/IdPs that will be accepted by your cluster.

	By default, your cluster's configuration will contain the {{ site.data.products.db }}'s own public key, allowing {{ site.data.products.db }} to serve as an IdP. When modifying this cluster setting, you must include the {{ site.data.products.db }} public key in the key set. Failing to do so can prevent maintenance access by the {{ site.data.products.db }} managed service, leading to unintended consequences. It can also break the cluster SSO for human users to this cluster.

	!!!{ @cameron Fact check on this? Seems right}

1. `server.jwt_authentication.issuers`

	Add your IdP's formal `issuer` name (this must match the `issuer` field in the JWT itself) to your cluster's list of accepted token issuers. This field takes a comma-separated list of formal names of accepted JWT issuers. This list must include a given IdP, or the cluster will reject JWTs issued by it.

	The default value is {{ site.data.products.db }}. When modifying this cluster setting, you must include {{ site.data.products.db }} in the new value. Failing to do so can prevent maintenance access by the {{ site.data.products.db }} managed service, leading to unintended consequences. It can also break the cluster SSO for human users to this cluster.
	!!!{ @cameron Fact check on this? Seems right}

1. `server.jwt_authentication.audience`
	
	The name of your cluster as specified by the IdP, or a comma-separated list of such names. One of the audience names configured here must match the `audience` field with which your IdP will generate JWT formatted auth tokens.

1. `server.jwt_authentication.enabled`

	Required value: `true`

	Check to confirm that JWT authentication is enabled on your cluster. It is enabled by default in {{ site.data.products.db }} clusters.

### Authenticate to your cluster with your JWT token

To provision SQL cluster access for application users or service accounts, you must provision JWT tokens. There are many ways to do this, which are beyond the scope of this tutorial.

For example, your Google Cloud Platform organization can serve as IdP by issuing OIDC auth tokens for GCP service accounts, as described here in the [GCP docs on issuing tokens to service accounts](https://cloud.google.com/iam/docs/create-short-lived-credentials-direct#sa-credentials-oidc). This [blog post](https://morgans-blog.deno.dev/sso-crdb-gcp) discusses using GCP-issued OIDC tokens to authenticate to CockroachDB.

Once you have a valid JWT auth token (with `issuer` and `audience` matching the values [configured in your cluster settings](#configure-your-cluster-to-accept-your-external-identity-provider)) from your IdP, you may use it to connect to your cluster's SQL interface.

{{site.data.alerts.callout_success}}
This example uses [`cockroach sql`](../{{site.versions["stable"]}}/cockroach-sql.html), but you can use any SQL client that supports sufficiently long passwords.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~shell
cockroach sql --url "postgresql://{SQL_USERNAME}:{JWT_TOKEN}@{CLUSTER_HOST}:26257?options=--crdb:jwt_auth_enabled=true" --certs-dir={CLUSTER_CERT_DIR}
~~~

~~~txt
Welcome to the cockroach SQL interface...
~~~

## Support for tokens with SQL-incompatible subject names

Some token issuers create tokens with a `subject` that isn’t a valid SQL username, for example starting with a number.

You can accommodate this with **user name mapping**, by mapping the third-party subjects to valid SQL usernames.

To do this, set the `server.identity_map.configuration` cluster setting appropriately with the map name equal to the issuer of the token you wish the map to apply to. See the [PostgreSQL  user name maps documentation](https://www.postgresql.org/docs/current/auth-username-maps.html) for full details of the syntax of this field.

When connecting to the cluster, make sure the username in your connection string matches the *mapped to* username, not the subject of the token.
