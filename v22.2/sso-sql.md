---
title: Cluster Single Sign-On (SSO) for Self-hosted CockroachDB
summary: Overview of Single Sign-On (SSO) for CockroachDB SQL Access, and review of workflows for authenticating human and bot users, and for configuring the feature.
toc: true
docs_area: manage
---

## What is Cluster Single Sign-On (SSO)?

Cluster SSO allows users to access the SQL interface of a CockroachDB cluster using a JWT auth token issued by a customer-managed identity provider (IdP).

This page discusses use cases for authenticating to {{ site.data.products.core }} clusters. You might instead be looking for [Cluster Single Sign-On (SSO) for Cockroach Cloud](../cockroachcloud/cloud-sso-sql.html) or [Single Sign-On (SSO) for CockroachDB Cloud organizations](../cockroachcloud/cloud-org-sso.html).

**Prerequisites**

- **IdP:**

	You must have the ability to create identities and issue JSON Web Token (JWT) formatted auth tokens.

	This [Cockroach Labs blog post](https://www.cockroachlabs.com/blog/) covers and provides further resources for a variety of token-issuing use cases, including using Okta and Google Cloud Platform to issue tokens.

- **CockroachDB:**

	- You must have access to an enterprise cluster, i.e. configured with a valid [CockroachDB enterprise license](enterprise-licensing.html) enabled.

		See [Enterprise Trial –– Get Started](get-started-with-enterprise-trial.html) for help enabling your cluster with you enterprise license.

	- SQL users/credentials:

		- You must have access to credentials with the [`admin` role](security-reference/authorization.html#admin-role), in order to update cluster settings, which is required to allow an external token issuer/IdP.
	
		- A SQL user specifically corresponding to the service account must be pre-provisioned on the cluster (or you must have access to a SQL role allowing you to create such a user).

## Configure your cluster settings
In order to authenticate a service account to a {{ site.data.products.db }} cluster using a JWT issuer, you must update several cluster settings in the `server.jwt_authentication` namespace:

1. `server.jwt_authentication.enabled`

	JWT authentication must be enabled on your cluster.

	Required value: `true`

1. `server.jwt_authentication.jwks`

	Add your IdP's public signing key to your cluster's list of accepted signing JSON web keys (JWKS), under the `jwks` setting.

	This must be a [JWK](https://www.rfc-editor.org/rfc/rfc7517) formatted single key or key set, containing the [public keys](../{{site.versions["stable"]}}/security-reference/transport-layer-security.html#key-pairs) for SSO token issuers/IdPs that will be accepted by your cluster.

1. `server.jwt_authentication.issuers`

	Add your IdP's formal `issuer` name (this must match the `issuer` field in the JWT itself) to your cluster's list of accepted token issuers:

	A comma separated list of formal names of accepted JWT issuers. This list must include a given IdP, or the cluster will reject JWTs issued by it.

1. `server.jwt_authentication.audience`
	
	The name of your cluster as specified by the IdP, or a comma-separated list of such names. One of the audience names must match the `audience` field with which your IdP will generate JWT formatted auth tokens.

## Authenticate to your cluster with your JWT token

To provision SQL cluster access for service accounts, you must provision OIDC or SAML tokens. There are many ways to do this, which are beyond the scope of this tutorial.

For example, your Google Cloud Platform organization can serve as IdP by issuing OIDC auth tokens, as described here in the [GCP docs on issuing tokens to service accounts](https://cloud.google.com/iam/docs/create-short-lived-credentials-direct#sa-credentials-oidc). This [blog post](https://morgans-blog.deno.dev/sso-crdb-gcp) discussing using GCP-issued OIDC tokens to authenticate to CockroachDB.

Once you have a valid JWT auth token (with `issuer` and `audience` matching the values [configured in your cluster settings](#configure-your-cluster-settings)) from your IdP, you may use it to connect to your cluster's SQL interface.

{{site.data.alerts.success}}
This example uses [`cockroach sql`](cockroach-sql.html), but you can use any SQL client that supports sufficiently long passwords.
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

You can accomodate this with **user name mapping**, by maping the third party subjects to valid SQL usernames.

To do this, set the `server.identity_map.configuration` cluster setting appropriately with the map name equal to the issuer of the token you wish the map to apply to. See the [PostgreSQL  user name maps documentation](https://www.postgresql.org/docs/current/auth-username-maps.html) for full details of the syntax of this field.

When connecting to the cluster, make sure the username in your connection string matches the *mapped to* username, not the subject of the token.