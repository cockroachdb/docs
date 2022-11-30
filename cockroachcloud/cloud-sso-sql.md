---
title: Cluster Single Sign-On (SSO) for Cockroach Cloud
summary: Overview of Cluster Single Sign-On (SSO) for {{ site.data.products.db }}, and review of workflows for authenticating human and bot users, and for configuring required cluster settings.
toc: true
docs_area: manage
---

## What is Cluster Single Sign-On (SSO)?

Cluster SSO allows users to access the SQL interface of a CockroachDB cluster (whether provisioned on {{ site.data.products.db }} or self-hosted) with the full security of Single Sign-On (SSO), and the convenience of being able to choose from a variety of SSO identity providers, including Cockroach Cloud, Google, Microsoft, GitHub, or your own self-hosted SAML or OIDC.

This page describes:

- [Authenticating human users](#authenticate-human-users-with-the-cloud-console) with the {{ site.data.products.db }} console acting as identity provider (IdP) or token issuer
- [Authenticating service accounts](#authenticate-software-users-service-accounts-with-external-idps) with an external token issuer
- [Configuring the cluster settings](#configure-your-cluster-to-accept-your-external-identity-provider) required to authenticate service accounts

Note that this regards SQL access to a specific CockroachDB Cluster, not access to a Cockroach Cloud organization. For the latter, see [Single Sign-On (SSO) for CockroachDB Cloud organizations](cloud-org-sso.html).

You might also be looking for [Cluster Single Sign-On (SSO) for Self-hosted CockroachDB](../v22.2/sso-sql.html).

## Authenticate human users with the cloud console

{{ site.data.products.db }} itself can issue authentication tokens for human users, which can be used for SSO using the `ccloud` CLI. {{ site.data.products.dedicated }} and {{ site.data.products.serverless }} clusters are, by default, configured to allow Cluster SSO authentication with {{ site.data.products.db }} serving as SSO provider. No additional set-up is required.

{{site.data.alerts.callout_info}}
Note that this authentication method only works for *human users*, since only humans may have {{ site.data.products.db }} console identities.

Software users (i.e. service accounts), can authenticate using JWT tokens from your own identity provider. See [Authenticating software users (service accounts) with Cluster SSO](#authenticate-human-users-with-the-cloud-console).
{{site.data.alerts.end}}

**Learn more:**

- [Single Sign-On (SSO) for CockroachDB Cloud organizations](cloud-org-sso.html#cloud-organization-sso)
- [Configure Cloud Organization Single Sign-On (SSO)](configure-cloud-org-sso.html)

**Prerequisites:**

- You must have a user identity on a {{ site.data.products.db }} organization. For help setting up an organization and cluster, see: [Quickstart with CockroachDB](quickstart.html).
- SSO must be enabled for your organization. For help configuring SSO for your {{ site.data.products.db }} organization, see: [Configure Cloud Organization Single Sign-On (SSO)](configure-cloud-org-sso.html)
- SSO must be enabled for your particular {{ site.data.products.db }} user. Configure this at the [{{ site.data.products.db }} console account settings page](https://cockroachlabs.cloud/account/profile).
- Your {{ site.data.products.db }} user identity must have access to at least one cluster in your organization.
- A SQL user specifically corresponding to your SSO identity must be pre-provisioned on the cluster. To authenticate to a specific SQL database, i.e. a cluster, using SSO, a {{ site.data.products.db }} user must have a corresponding SQL user already [created](../{{site.versions["stable"]}}/create-user.html#create-a-user) on that cluster. {{ site.data.products.db }} users must correspond to SQL database users by the convention that the SQL username must be `sso_{email_address}`. ???!!! {how does this format actually work, does the at gmail go in there???}
- [`ccloud`, the Cockroach Cloud CLI](ccloud-get-started.html) must be installed on your local workstation.


1. First authenticate to your {{ site.data.products.db }} organization. This command will cause your workstation's default browser to open to a Cockroach Cloud authentication portal. Authenticate here as you normally do to the Cockroach Cloud console. The `ccloud` utility will receive an authentication token from the browser, allowing you to authenticate from the command line.

	{% include_cached copy-clipboard.html %}
	~~~shell
	ccloud auth login
	~~~

1. You may then use the `ccloud` utility to authenticate to your {{ site.data.products.db }} cluster, allowing you to access the SQL interface.

	{% include_cached copy-clipboard.html %}
	~~~shell
	ccloud cluster sql --sso { your cluster name}
	~~~

## Authenticate software users (service accounts) with external IdPs

Currently, Cockroach Cloud can only serve as an token issuer for human users. Authenticating service accounts, i.e. user identities to be controlled by software applications or scripts, rather by humans, is considerably more complicated, as it requires the user, or more realistically, an IdP admin, to provision the appropriate JWT token.

Cockroach Cloud SSO supports the use of external IdPs such as Google, Microsoft, Github, or customer deployed OIDC or SAML solutions, such as Okta. All of these options support MFA.

**Learn more:**

This [Cockroach Labs blog post](https://www.cockroachlabs.com/blog/) covers and provides further resources for a variety of auth token-issuing use cases, including using Okta and Google Cloud Platform to issue tokens.

**Prerequisites:**

- You must have the ability to create identities and issue tokens with a SAML or OIDC identity provider.
	{{site.data.alerts.callout_success}}
	The `issuer` and `audience` fields in the token must match valued [configured in your cluster settings](#configure-your-cluster-to-accept-your-external-identity-provider).
	{{site.data.alerts.end}}
- You must have a user identity on a {{ site.data.products.db }} organization. For help setting up an organization and cluster, see: [Quickstart with CockroachDB](quickstart.html).
- You must have access to a member of the [`admin` role](../{{site.versions["stable"]}}/security-reference/authorization.html#admin-role) in order to update cluster settings, which is required to add an external token issuer/IdP.
- A SQL user specifically corresponding to the service account must be pre-provisioned on the cluster (or you must have access to a SQL role allowing you to create such a user).

### Configure your cluster to accept your external identity provider

In order to authenticate a service account to a {{ site.data.products.db }} cluster using a JWT issuer, you must update several cluster settings in the `server.jwt_authentication` namespace:

1. `server.jwt_authentication.jwks`

	Add your IdP's public signing key to your cluster's list of accepted signing JSON web keys (JWKS), under the `jwks` setting.

	This is a [JWK](https://www.rfc-editor.org/rfc/rfc7517) formatted single key or key set, containing the [public keys](../{{site.versions["stable"]}}/security-reference/transport-layer-security.html#key-pairs) for SSO token issuers/IdPs that will be accepted by your cluster.

	By default, your cluster's configuration will contain the {{ site.data.products.db }}'s own public key, allowing Cockroach Cloud to serve as an IdP.

	When modifying this cluster setting, you must include the Cockroach Cloud public key in the key set. Failing to do so can prevent maintenance access by essential Cockroach Cloud managed service accounts, leading to unintended consequences. !!!{ Fact check on this? Seems right}

1. `server.jwt_authentication.issuers`

	Add your IdP's formal `issuer` name (this must match the `issuer` field in the JWT itself) to your cluster's list of accepted token issuers:

	A comma separated list of formal names of accepted JWT issuers. This list must include a given IdP, or the cluster will reject JWTs issued by it.

	By default will be the CC issuer but they can set it to any string or any list of strings formatted as a json array. Needs to match the issuer of JWTs

1. `server.jwt_authentication.audience`
	
	The name of your cluster as specified by the IdP. This must match the `audience` field with which your IdP will generate JWT formatted auth tokens.

1. `server.jwt_authentication.enabled`

	Required value: `true`

	Check to confirm that JWT authentication is enabled on your cluster. It is enabled by default in {{ site.data.products.db }} clusters.

### Authenticate to your cluster with your JWT token

To provision SQL cluster access for service accounts, you must provision OIDC or SAML tokens. There are many ways to do this, which are beyond the scope of this tutorial.

For example, your Google Cloud Platform organization can serve as IdP by issuing OIDC auth tokens, as described here in the [GCP docs on issuing tokens to service accounts](https://cloud.google.com/iam/docs/create-short-lived-credentials-direct#sa-credentials-oidc). This [blog post](https://morgans-blog.deno.dev/sso-crdb-gcp) discussing using GCP-issued OIDC tokens to authenticate to CockroachDB.

Once you have a valid JWT auth token (with `issuer` and `audience` matching the values [configured in your cluster settings](#configure-your-cluster-to-accept-your-external-identity-provider)) from your IdP, use it to connect to your cluster's SQL interface via the CockroachDB CLI's [`cockroach sql`](../{{site.versions["stable"]}}/cockroach-sql.html) command.

{% include_cached copy-clipboard.html %}
~~~shell
cockroach sql --url "postgresql://{SQL_USERNAME}:{JWT_TOKEN}@{CLUSTER_HOST}:26257?options=--crdb:jwt_auth_enabled=true" --certs-dir={CLUSTER_CERT_DIR}
~~~

~~~txt
Welcome to the cockroach SQL interface...
~~~
