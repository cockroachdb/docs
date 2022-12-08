---
title: Cluster Single Sign-on (SSO) using JSON web tokens (JWT)
summary: Overview of Cluster Single Sign-on (SSO) for {{ site.data.products.core }}, review of authenticating users, configuring required cluster settings.
toc: true
docs_area: manage
---

Cluster SSO allows users to access the SQL interface of a CockroachDB cluster (whether provisioned on {{ site.data.products.db }} or self-hosted) with the full security of Single Sign-On (SSO), and the convenience of being able to choose from a variety of cloud based on customer-managed identity providers (IdPs).

This page describes the procedure for accessing a {{ site.data.products.db }} cluster using the JWT access tokens provided by a customer-managed IdP. This document applies for both {{ site.data.products.core }} and {{ site.data.products.dedicated }} customers.

You might also be looking for: [Cluster Single Sign-on (SSO) using CockroachDB Cloud Console](../cockroachcloud/cloud-sso-sql.html).

{{site.data.alerts.callout_info}}
Note for {{ site.data.products.dedicated }} customers:
Currently, this flow will not work for service accounts provisioned in {{ site.data.products.db }} console. You must [create the service account manually](#provision-a-service-account), as detailed below.
{{site.data.alerts.end}}

## Prerequisites

- **IdP:**

	You must have the ability to create identities and issue JSON Web Token (JWT) formatted access tokens.

	This [Cockroach Labs blog post](https://www.cockroachlabs.com/blog/) covers and provides further resources for a variety of token-issuing use cases, including using Okta and Google Cloud Platform to issue tokens.

- **CockroachDB:**

	- **Self-Hosted Customers**: You must have access to an cluster enabled with a valid [CockroachDB Enterprise license](enterprise-licensing.html).

		See [Enterprise Trial –– Get Started](get-started-with-enterprise-trial.html) for help enabling your cluster with you enterprise license.

	- **Cloud Customers**: You must have access to a [**dedicated** cluster](../cockroachcloud/create-your-cluster.html).

	- SQL users/credentials:

		- In order to configure your cluster for SSO with JWTs, you must have access to a SQL user with either the [`admin` role](security-reference/authorization.html#admin-role) or the [`MODIFYCLUSTERSETTING`](security-reference/authorization.html#supported-privileges), in order to update cluster settings. This is required to add an external token issuer/IdP.
	
		- In order to access the cluster with a JWT access token, you must have a SQL user specifically corresponding to your external identity must be pre-provisioned on the cluster. To provision such users, you must have access to the [`admin` role](security-reference/authorization.html#admin-role).

## Learn more

This [Cockroach Labs blog post](https://www.cockroachlabs.com/blog/) covers and provides further resources for a variety of auth token-issuing use cases, including using Okta and Google Cloud Platform to issue tokens.

## Provision a service account

For access to a CockroachDB cluster, an identity in an external IdP must correspond to a SQL user on the target cluster, so creating a service for your cluster entails two steps:

- Create a service account/IAM username with your external IdP (for example, GCP).
- [Create a SQL user](create-user.html) in your cluster.

The **correspondence** between IdP identity and SQL username is crucial. This determined by [your cluster's identity mapping](#configure-your-clusters-identity-mapping).

## Configure your cluster to accept your external identity provider

In order to authenticate a service account to a {{ site.data.products.db }} cluster using a JWT issuer, you must update several cluster settings in the `server.jwt_authentication` namespace, as well as the [`identity_map.configuration`](#configure-your-clusters-identity-mapping)

- [`enabled`](#server-jwt_authentication-enabled): JWT token authentication must be allowed on your cluster.
- [`jwks`](#server-jwt_authentication-jwks): A list of public signing keys for allowed IdPs. You'll need to add your IdP's key.
- [`issuers`](#server-jwt_authentication-issuers): A list of accepted token issuers. You'll need to add your IdP.
- [`audience`](#server-jwt_authentication-audience): A list of audiences (or targets) for authentication, most relevantly, clusters.

{{site.data.alerts.callout_success}}
Note that the required information for a given IdP is served up at that IdP's `.well-known/openid-configuration` path, for example `https://cockroachlabs.cloud/.well-known/openid-configuration` for {{ site.data.products.db }}, and `https://accounts.google.com/.well-known/openid-configuration` for Google cloud.
{{site.data.alerts.end}}

### `server.jwt_authentication.enabled`

	Enable or disable Cluster SSO

	Required value: `true`

	Check to confirm that JWT authentication is enabled on your cluster. It is enabled by default in {{ site.data.products.db }} clusters.

### `server.jwt_authentication.jwks`

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

### `server.jwt_authentication.issuers`

	Add your IdP's formal `issuer` name (this must match the `issuer` field in the JWT itself) to your cluster's list of accepted token issuers.

	This field takes a single JWT or JSON array of JWTS. This list must include a given IdP, or the cluster will reject JWTs issued by it.

	The default value is {{ site.data.products.db }}. When modifying this cluster setting, you must include {{ site.data.products.db }} in the new value. Failing to do so can prevent maintenance access by the {{ site.data.products.db }} managed service, leading to unintended consequences. It can also break the cluster SSO for human users to this cluster.

	{{site.data.alerts.callout_success}}
	{{ site.data.products.db }}'s IdP configuration can be viewed publicly at: `https://cockroachlabs.cloud/.well-known/openid-configuration`.
	The `issuer` is `https://cockroachlabs.cloud`.
	{{site.data.alerts.end}}

### `server.jwt_authentication.audience`
	
	The ID of your cluster as specified by the IdP, or a JSON array of such names. One of the audience values here must match the `audience` claim of an access token, or it will be rejected.

## Configure your cluster's identity mapping

### `server.identity_map.configuration`

Format: `<external issuer> <external user ID> <SQL username>`

Specifies mapping of subject names to SQL usernames, for each allowed IdP. For example, a configuration of:

`https://accounts.google.com   /^([9-0]*)$   gcp_\1`

would yield a mapping where the SQL username for each GCP-provisioned service account would be `gcp_{user ID}`, e.g. `gcp_1234567` for a service account with ID `1234567`.

## Authenticate to your cluster with your JWT token

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

