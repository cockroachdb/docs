---
title: Cluster Single Sign-on (SSO) using a JSON web token (JWT)
summary: Overview of Cluster Single Sign-on (SSO) for CockroachDB {{ site.data.products.core }}, review of authenticating users, configuring required cluster settings.
toc: true
docs_area: manage
---

Cluster Single Sign-On (SSO) allows users to access the SQL interface of a CockroachDB cluster (whether provisioned on CockroachDB {{ site.data.products.cloud }} or self-hosted) with the full security of Single Sign-On (SSO), and the convenience of being able to choose from a variety of cloud-based or customer-managed identity providers (IdPs).

The [DB Console](ui-overview.html) allows users to easily generate JSON Web Tokens (JWTs) by authenticating to their IdP through an embedded flow. The JWT can then be copied out of the DB Console UI and used in a SQL connection string to authenticate to the cluster.

This page describes:

- The administrative procedure for configuring a cluster to accept an external identity provider.
- The administrative procedure for configuring a cluster to generate JWTs through the DB Console's embedded authentication UI.
- The SQL developer/operator procedure for generating a JWT token through the embedded authentication flow provided by the DB Console.
- The SQL developer/operator procedure for authenticating to a cluster using a JWT token provisioned for their identity (either by the DB Console's embedded flow or directly from their IdP).

This document applies for both {{ site.data.products.core }} and {{ site.data.products.dedicated }} customers.

You might also be looking for: [Cluster Single Sign-on (SSO) using CockroachDB Cloud Console](https://www.cockroachlabs.com/docs/cockroachcloud/cloud-sso-sql). This is an option for authenticating human users to cloud clusters, but does not work for service accounts or in the context of self-hosted clusters.

{{site.data.alerts.callout_info}}
Note for CockroachDB {{ site.data.products.dedicated }} customers:
Currently, this flow will not work for service accounts provisioned in CockroachDB {{ site.data.products.cloud }} console. You must [create the service account manually](#provision-a-service-account), as detailed below.
{{site.data.alerts.end}}

## Before you begin

For more details and examples, refer to [SSO to CockroachDB clusters using JWT](https://www.cockroachlabs.com/blog/sso-to-clusters-with-jwt/) in the CockroachDB blog.

- **IdP:**

	You must have the ability to create identities and issue access tokens formatted using JSON Web Token (JWT).

- **CockroachDB:**

	- **Self-Hosted**: You must have access to a cluster enabled with a valid [CockroachDB Enterprise license]({% link {{ page.version.version }}/enterprise-licensing.md %}).

		See [Enterprise Trial –– Get Started]({% link {{ page.version.version }}/get-started-with-enterprise-trial.md %}) for help enabling your cluster with you enterprise license.

	- **CockroachDB {{ site.data.products.cloud }}**: You must have access to a [CockroachDB {{ site.data.products.dedicated }}cluster](https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster).

	- SQL users/credentials:

		- Your SQL user must have the ability to update cluster settings. This permission is provided by either the [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) or the [`MODIFYCLUSTERSETTING` role option]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges). This is required to designate an IdP as an external token issuer.

		- A SQL user that corresponds with your external identity must be pre-provisioned on the cluster. To provision such users, you must have access to the [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role).

## Learn more

This [Cockroach Labs blog post](https://www.cockroachlabs.com/blog/sso-to-clusters-with-jwt/) covers and provides further resources for a variety of auth token-issuing use cases, including using Okta and Google Cloud Platform to issue tokens.

## Provision a service account

For access to a CockroachDB cluster, an identity in an external IdP must correspond to a SQL user on the target cluster, so creating a service for your cluster entails two steps:

- Create a service account/IAM username with your external IdP (for example, GCP).
- [Create a SQL user]({% link {{ page.version.version }}/create-user.md %}) in your cluster.

The **correspondence** between IdP identity and SQL username is crucial. This determined by [your cluster's identity mapping](#configure-your-clusters-identity-mapping).

## Configure your cluster to accept your external identity provider

In order to authenticate a service account to a CockroachDB {{ site.data.products.cloud }} cluster using a JWT issuer, you must update several cluster settings in the `server.jwt_authentication` namespace, as well as the [`identity_map.configuration`](#configure-your-clusters-identity-mapping)

- [`enabled`](#server-jwt_authentication-enabled): JWT token authentication must be allowed on your cluster.
- [`jwks`](#server-jwt_authentication-jwks): A list of public signing keys for allowed IdPs. You'll need to add your IdP's key.
- [`issuers`](#server-jwt_authentication-issuers): A list of accepted token issuers. You'll need to add your IdP.
- [`audience`](#server-jwt_authentication-audience): A list of audiences (or targets) for authentication, most relevantly, clusters.

{{site.data.alerts.callout_success}}
The required information for a given IdP is published on that IdP's `.well-known/openid-configuration` path (for example, `https://cockroachlabs.cloud/.well-known/openid-configuration` for CockroachDB {{ site.data.products.cloud }} or `https://accounts.google.com/.well-known/openid-configuration` for GCP.
{{site.data.alerts.end}}

### `server.jwt_authentication.enabled`

	Enable or disable Cluster SSO

	Required value: `true`

	Check to confirm that JWT authentication is enabled on your cluster. It is enabled by default in CockroachDB {{ site.data.products.cloud }} clusters.

### `server.jwt_authentication.jwks`

Add your IdP's public signing key to your cluster's list of accepted signing JSON web keys (JWKS), under the `jwks` setting. This is a [JWK](https://www.rfc-editor.org/rfc/rfc7517) formatted single key or key set, containing the public keys for SSO token issuers/IdPs that will be accepted by your cluster.

By default, your cluster's configuration will contain the CockroachDB {{ site.data.products.cloud }}'s own public key, allowing CockroachDB {{ site.data.products.cloud }} to serve as an IdP. When modifying this cluster setting, you must include the CockroachDB {{ site.data.products.cloud }} public key in the key set. Failing to do so will lock out console SSO users and prevent maintenance access by the CockroachDB {{ site.data.products.cloud }} managed service, leading to unintended consequences.

{{site.data.alerts.callout_success}}
CockroachDB {{ site.data.products.cloud }}'s IdP configuration can be viewed publicly at: [`https://cockroachlabs.cloud/.well-known/openid-configuration`](https://cockroachlabs.cloud/.well-known/openid-configuration).
The link specified for `jwks_uri` provides the IdP's public signing key. For CockroachDB {{ site.data.products.cloud }} this is `https://cockroachlabs.cloud/oauth2/keys`
{{site.data.alerts.end}}

For example:

{% include_cached copy-clipboard.html %}
~~~shell
SET CLUSTER SETTING server.jwt_authentication.jwks = '{"keys": [{"alg": "RS256","e": "AQAB","kid": "e34e6c51-917d-4e77-8a8c-812d3aa2d730","kty": "RSA","n": "1Y7D2TssaJeeE_g-6ynRrfhfkI_RyvGOv3AVxnkeF3HvYZwJUp4QMngqsbZ-n_J_cdMlKYiuop8S0PW6lZiCx7kHw872tgvrYycRXLo6QgIO_JqJboG5gsXkf92lO8niGgXllyFuilQajzR9_K8bPIqMoLaoKHnEjULNleK6j7pHWW-MnQ_vs4NmU69Ctn3c_3muCZ5ULZKZ3FozlfFCj1D_HC5gk7hRJe22-VYyaxLgO-DqOCE4EedQW-yTGGIy8inMZ9l1EdoNwfDS0RCDnQad9F-DXqcN0VhSJO6nRgWf8EtFuW1sNAknSb6MiI0QGZt9yIVhd2VUMg9HHqXAEQ","use": "sig"},{"alg": "RS256","e": "AQAB","kid": "c0d742ec-edc6-409e-88c7-57747914c09c","kty": "RSA","n": "qG6aXxmuYM-9z2gD83g6o79kNd4T1d_YsKs9VBRDmtvV3Lep5oVwj1wQ2bqbsWtG8JNFej0yzKi8NB16_yfL9NSMw3be2HF6-zr6aBswTAY31_SxBFGzN-sQq0-x49kqZuWOw2_CGz8Z7ZThlB4GAhfqcztFFps_j1z5kOTrzZSX0yIWY-HSv_gCps1bVKJ-d8HJR_AHGtyAOuGZJjJxwJYyWWQmLEHz4YK-GXz4GRO6oMXMDiZTBJCNTUI1g4XRKezZhEA6MHLtbeuIjeiLo1ZG571nfVbPjidHZPPREnR8LxePYYw3WTTddxtCanCo1G9e3ENW4TKHX-wx1YvkQQ","use": "sig"}]}';
~~~

### `server.jwt_authentication.issuers`

	Add your IdP's formal `issuer` name (this must match the `issuer` field in the JWT itself) to your cluster's list of accepted token issuers.

	This field takes a single JWT or JSON array of JWTS. This list must include a given IdP, or the cluster will reject JWTs issued by it.

	The default value is CockroachDB {{ site.data.products.cloud }}. When modifying this cluster setting, you must include CockroachDB {{ site.data.products.cloud }} in the new value. Failing to do so can prevent maintenance access by the CockroachDB {{ site.data.products.cloud }} managed service, leading to unintended consequences. It can also break the cluster SSO for human users to this cluster.

	{{site.data.alerts.callout_danger}}
	Any IdP that is configured on your cluster can grant SQL access to your cluster, and therefore any data that is stored within. This configuration is therefore critical for security.

	Changes to this configuration should be made with utmost care, and access to updating this configuration (granted by the [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) or the [`MODIFYCLUSTERSETTING` role option]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges)) should be carefully restricted.
	{{site.data.alerts.end}}

	{{site.data.alerts.callout_success}}
	CockroachDB {{ site.data.products.cloud }}'s IdP configuration can be viewed publicly at: `https://cockroachlabs.cloud/.well-known/openid-configuration`.
	The `issuer` is `https://cockroachlabs.cloud`.
	{{site.data.alerts.end}}

### `server.jwt_authentication.audience`

	The ID of your cluster as specified by the IdP, or a JSON array of such names. One of the audience values here must match the `audience` claim of an access token, or it will be rejected.

	{{site.data.alerts.callout_danger}}
	Many third-party token issuers, including GCP and Azure, will by default create tokens with a generic default audience. It is best practice to limit the scope of access tokens as much as possible, so if possible, we recommend issuing tokens with only the required audience value corresponding to the `audience` configured on the cluster.

	By extension, if your provider allows you to specify scopes or permissions on the token, you should specify these as restrictively as possible, while still allowing for the functions intended for the service account or user.
	{{site.data.alerts.end}}

## How CockroachDB determines the SQL username from a JWT:

1. `server.oidc_authentication.generate_cluster_sso_token.use_token` determines which token to look at (id_token or access_token).
<!-- this one below needs doing! it's new -->
1. `server.jwt_authentication.claim` determines which claim in that token, defaulting to picking the token’s subject.
1. `server.identity_map.configuration` maps that claim (along with the token’s issuer) to a SQL username.

## Configure your cluster's identity mapping

### `server.identity_map.configuration`

Format: `<external issuer> <external user ID> <SQL username>`

Specifies mapping of subject names to SQL usernames, for each allowed IdP. For example, a configuration of:

`https://accounts.google.com   /^([9-0]*)$   gcp_\1`

would yield a mapping where the SQL username for each GCP-provisioned service account would be `gcp_{user ID}`, e.g. `gcp_1234567` for a service account with ID `1234567`.

## Configure your cluster for DB Console-embedded IdP authentication and JWT generation

The following settings, in the `server.oidc_authentication.generate_cluster_sso_token` namespace must be configured to enable DB Console-embedded JWT generation:

### `.enabled`

Defaults to `false`, must be set to `true` to enable embedded JWT generation.

### `.use_token`

This selects which part of the received OIDC credentials to use to determine the user’s identity. (See below for overall data flow.)

### `.sql_host`

This display value informs users the host for their SQL connections. Default: `localhost`.
### `.sql_port`
This display value informs users the port for their SQL connections. Default: `26257`.



## Authenticate to your cluster with your JWT token

To provision SQL cluster access for application users or service accounts, you must provision JWT tokens. There are many ways to do this, which are beyond the scope of this tutorial.

For example, your Google Cloud Platform organization can serve as token issuer, as described here in the [GCP docs on issuing tokens to service accounts](https://cloud.google.com/iam/docs/create-short-lived-credentials-direct#sa-credentials-oidc). This [blog post](https://morgans-blog.deno.dev/sso-crdb-gcp) discusses using GCP to authenticate issue tokens.

Once you have a valid JWT auth token (with `issuer` and `audience` matching the values [configured in your cluster settings](#configure-your-cluster-to-accept-your-external-identity-provider)) from your IdP, you may use it to connect to your cluster's SQL interface.

{{site.data.alerts.callout_success}}
This example uses [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}), but you can use any SQL client that supports sufficiently long passwords.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~shell
cockroach sql --url "postgresql://{SQL_USERNAME}:{JWT_TOKEN}@{CLUSTER_HOST}:26257?options=--crdb:jwt_auth_enabled=true" --certs-dir={CLUSTER_CERT_DIR}
~~~

~~~txt
Welcome to the cockroach SQL interface...
~~~

## What's Next?

- Read about [SSO to CockroachDB clusters using JWT](https://www.cockroachlabs.com/blog/sso-to-clusters-with-jwt/) in the CockroachDB blog.
- Learn more about [Authentication]({% link {{ page.version.version }}/authentication.md %}) in CockroachDB.
