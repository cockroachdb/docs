---
title: Cluster Single Sign-on (SSO) for CockroachDB Cloud
summary: Overview of Cluster Single Sign-on (SSO) for {{ site.data.products.db }}, review of authenticating users, configuring required cluster settings.
toc: true
docs_area: manage
---

Cluster SSO allows users to access the SQL interface of a CockroachDB cluster (whether provisioned on {{ site.data.products.db }} or self-hosted) with the full security of Single Sign-On (SSO), and the convenience of being able to choose from a variety of SSO identity providers, including {{ site.data.products.db }}, Google, Azure, GitHub, or your own self-hosted OIDC.

This page describes:

- [Authenticating human users](#authenticate-human-users-with-the-cloud-console) with the {{ site.data.products.db }} Console acting as identity provider (IdP) or token issuer
- [Authenticating service accounts](#authenticate-application-users-service-accounts) with an external token issuer
- [Configuring the cluster settings](#configure-your-cluster-to-accept-your-external-identity-provider) required to authenticate service accounts

Note that this regards SQL access to a specific CockroachDB Cluster, not access to a {{ site.data.products.db }} organization. For the latter, see [Single Sign-On (SSO) for {{ site.data.products.db }} organizations](cloud-org-sso.html).

You might also be looking for [Cluster Single Sign-On (SSO) for Self-hosted CockroachDB](../v22.2/sso-sql.html).

## Authenticate human users with the cloud console

{{ site.data.products.db }} can issue authentication tokens for human users, which can be used for SSO using the `ccloud` CLI. {{ site.data.products.dedicated }} and {{ site.data.products.serverless }} clusters are, by default, configured to allow Cluster SSO authentication with {{ site.data.products.db }} serving as SSO provider. No additional set-up is required.

{{site.data.alerts.callout_info}}
Note that this authentication method only works for human users, since only humans may have {{ site.data.products.db }} Console identities.

Application users (i.e. service accounts), can authenticate using JWT tokens from your own identity provider. See [Authenticate application users (service accounts) with Cluster SSO](#authenticate-application-users-service-accounts).
{{site.data.alerts.end}}

**Prerequisites:**

- You must have a user identity on a {{ site.data.products.db }} organization. For help setting up an organization and cluster, see: [Quickstart with CockroachDB](quickstart.html).
- Your {{ site.data.products.db }} user identity must have access to at least one cluster in your organization.
- To authenticate to a specific cluster using SSO, a {{ site.data.products.db }} user must have a corresponding SQL user already [created](../{{site.versions["stable"]}}/create-user.html#create-a-user) on that cluster. {{ site.data.products.db }} generates a SSO SQL username for each console, corresponding to the user's email by the convention `sso_{email_name}`, where `email_name` is everything up to the `@` in an email address, for example the SQL user `sso_docs` would result from `docs@cockroachlabs.com`. `ccloud` will prompt you to make this user if it does not already exist, in which case an admin must create it manually. 
- [`ccloud`, the {{ site.data.products.db }} CLI](ccloud-get-started.html) must be installed on your local workstation.

1. First authenticate to your {{ site.data.products.db }} organization. This command will cause your workstation's default browser to open to a {{ site.data.products.db }} authentication portal. Authenticate here as you normally do to the {{ site.data.products.db }} Console. The `ccloud` utility will receive an authentication token from the browser, allowing you to authenticate from the command line.

	{% include_cached copy-clipboard.html %}
	~~~shell
	ccloud auth login
	# when running ccloud on a remote host, add the following:
	# --no-redirect
	~~~

1. You may then use the `ccloud` utility to authenticate to your {{ site.data.products.db }} cluster, allowing you to access the SQL interface. Your browser will open again as `ccloud` requests a fresh token, although will not need to log in again if you are already logged in.

	{% include_cached copy-clipboard.html %}
	~~~shell
	ccloud cluster sql --sso {your cluster name}
	# when running ccloud on a remote host, add the following:
	# --no-redirect
	~~~

## Authenticate application users (service accounts)

Currently, {{ site.data.products.db }} can only serve as a token issuer for humans. To authenticate service accounts, i.e. user identities to be controlled by software applications, you may either continue to use your existing auth method (username/password), or use an external token issuer if you want to better integrate with your identity provider, as described here.

You can also use this flow to provision tokens to human users directly.

{{site.data.alerts.callout_info}}
Currently, this flow will not work for service accounts provisioned in {{ site.data.products.db }} console. You must [create the service account manually](#manually-provision-a-service-account), as detailed below.

{{site.data.alerts.end}}

**Learn more:**

This [Cockroach Labs blog post](https://www.cockroachlabs.com/blog/) covers and provides further resources for a variety of auth token-issuing use cases, including using Okta and Google Cloud Platform to issue tokens.

**Prerequisites:**

- You must have the ability to create identities and issue access token JWTs
	{{site.data.alerts.callout_success}}
	The `issuer` and `audience` fields in the token must match values [configured in your cluster settings](#configure-your-cluster-to-accept-your-external-identity-provider).
	{{site.data.alerts.end}}
- You must have access to a SQL user with either the [`admin` role](../{{site.versions["stable"]}}/security-reference/authorization.html#admin-role) or the [`MODIFYCLUSTERSETTING`](../{{site.versions["stable"]}}/security-reference/authorization.html#supported-privileges), in order to update cluster settings. This is required to add an external token issuer/IdP.
- A SQL user corresponding to the service account must be pre-provisioned on the cluster (or you must have access to a SQL role allowing you to create such a user).

### Manually provision a service account

To create a service account, you must:

- Create a service account/IAM username with your external IdP (for example, GCP).
- Create a SQL username in your cluster.
- Ensure the correspondence between IdP username and SQL username is covered by your identity mapping configuration, as described in the next section.

### Configure your cluster to accept your external identity provider

In order to authenticate a service account to a {{ site.data.products.db }} cluster using a JWT issuer, you must update several cluster settings in the `server.jwt_authentication` namespace, as well as the `identity_map.configuration`.

{{site.data.alerts.callout_success}}
Note that the required information for a given IdP is served up at that IdP's `.well-known/openid-configuration` path, for example `https://cockroachlabs.cloud/.well-known/openid-configuration` for {{ site.data.products.db }}, and `https://accounts.google.com/.well-known/openid-configuration` for Google cloud.
{{site.data.alerts.end}}

1. `server.jwt_authentication.jwks`

	Add your IdP's public signing key to your cluster's list of accepted signing JSON web keys (JWKS), under the `jwks` setting. This is a [JWK](https://www.rfc-editor.org/rfc/rfc7517) formatted single key or key set, containing the public keys for SSO token issuers/IdPs that will be accepted by your cluster.

	By default, your cluster's configuration will contain the {{ site.data.products.db }}'s own public key, allowing {{ site.data.products.db }} to serve as an IdP. When modifying this cluster setting, you must include the {{ site.data.products.db }} public key in the key set. Failing to do so will lock out console SSO users and prevent maintenance access by the {{ site.data.products.db }} managed service, leading to unintended consequences.

	{{site.data.alerts.callout_success}}
	{{ site.data.products.db }}'s IdP configuration can be viewed publicly at: `https://cockroachlabs.cloud/.well-known/openid-configuration`.
	The link specified for `jwks_uri` provides the IdP's public signing key. For {{ site.data.products.db }} this is `https://cockroachlabs.cloud/oauth2/keys`
	{{site.data.alerts.end}}

	For example:

	{% include_cached copy-clipboard.html %}
	~~~shell
	SET CLUSTER SETTING server.jwt_authentication.jwks = '{"keys": [{"alg": "RS256","e": "AQAB","kid": "e34e6c51-917d-4e77-8a8c-812d3aa2d730","kty": "RSA","n": "1Y7D2TssaJeeE_g-6ynRrfhfkI_RyvGOv3AVxnkeF3HvYZwJUp4QMngqsbZ-n_J_cdMlKYiuop8S0PW6lZiCx7kHw872tgvrYycRXLo6QgIO_JqJboG5gsXkf92lO8niGgXllyFuilQajzR9_K8bPIqMoLaoKHnEjULNleK6j7pHWW-MnQ_vs4NmU69Ctn3c_3muCZ5ULZKZ3FozlfFCj1D_HC5gk7hRJe22-VYyaxLgO-DqOCE4EedQW-yTGGIy8inMZ9l1EdoNwfDS0RCDnQad9F-DXqcN0VhSJO6nRgWf8EtFuW1sNAknSb6MiI0QGZt9yIVhd2VUMg9HHqXAEQ","use": "sig"},{"alg": "RS256","e": "AQAB","kid": "c0d742ec-edc6-409e-88c7-57747914c09c","kty": "RSA","n": "qG6aXxmuYM-9z2gD83g6o79kNd4T1d_YsKs9VBRDmtvV3Lep5oVwj1wQ2bqbsWtG8JNFej0yzKi8NB16_yfL9NSMw3be2HF6-zr6aBswTAY31_SxBFGzN-sQq0-x49kqZuWOw2_CGz8Z7ZThlB4GAhfqcztFFps_j1z5kOTrzZSX0yIWY-HSv_gCps1bVKJ-d8HJR_AHGtyAOuGZJjJxwJYyWWQmLEHz4YK-GXz4GRO6oMXMDiZTBJCNTUI1g4XRKezZhEA6MHLtbeuIjeiLo1ZG571nfVbPjidHZPPREnR8LxePYYw3WTTddxtCanCo1G9e3ENW4TKHX-wx1YvkQQ","use": "sig"}]}';
	~~~

1. `server.jwt_authentication.issuers`

	Add your IdP's formal `issuer` name (this must match the `issuer` field in the JWT itself) to your cluster's list of accepted token issuers.

	This field takes a single JWT or JSON array of JWTS. This list must include a given IdP, or the cluster will reject JWTs issued by it.

	The default value is {{ site.data.products.db }}. When modifying this cluster setting, you must include {{ site.data.products.db }} in the new value. Failing to do so can prevent maintenance access by the {{ site.data.products.db }} managed service, leading to unintended consequences. It can also break the cluster SSO for human users to this cluster.

	{{site.data.alerts.callout_success}}
	{{ site.data.products.db }}'s IdP configuration can be viewed publicly at: `https://cockroachlabs.cloud/.well-known/openid-configuration`.
	The `issuer` is `https://cockroachlabs.cloud`.
	{{site.data.alerts.end}}

1. `server.jwt_authentication.audience`
	
	The ID of your cluster as specified by the IdP, or a JSON array of such names. One of the audience values here must match the `audience` claim of an access token, or it will be rejected.

1. `server.jwt_authentication.enabled`

	Enable or disable Cluster SSO

	Required value: `true`

	Check to confirm that JWT authentication is enabled on your cluster. It is enabled by default in {{ site.data.products.db }} clusters.

1. `server.identity_map.configuration`

	Format: `<external issuer> <external user ID> <SQL username>`

	Specifies mapping of subject names to SQL usernames, for each allowed IdP. For example, a configuration of:

	`https://accounts.google.com   /^([9-0]*)$   gcp_\1`

	would yield a mapping where the SQL username for each GCP-provisioned service account would be `gcp_{user ID}`, e.g. `gcp_1234567` for a service account with ID `1234567`.


### Authenticate to your cluster with your JWT token

To provision SQL cluster access for application users or service accounts, you must provision JWT tokens. There are many ways to do this, which are beyond the scope of this tutorial.

For example, your Google Cloud Platform organization can serve as token issuer, as described here in the [GCP docs on issuing tokens to service accounts](https://cloud.google.com/iam/docs/create-short-lived-credentials-direct#sa-credentials-oidc). This [blog post](https://morgans-blog.deno.dev/sso-crdb-gcp) discusses using GCP to authenticate issue tokens.

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
