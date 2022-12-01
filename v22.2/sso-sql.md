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

	!!!{

	@cameron
	Fact check on this? I thought SAML was supported, but SAML and JWT format are different, yeah? 

	}

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



Third-party issuers
There are some cases where a customer will want to use a third-party token issuer (such as GCP or Azure). This is supported but introduces some sharp edges. It is important for customers to understand how the audience, issuer, and subject fields are populated by their provider and make sure to only allow users they wish to access it.

Many of these providers do not have subject fields that are valid SQL usernames. To support this, we reuse the existing username maps (see PSQL docs https://www.postgresql.org/docs/current/auth-username-maps.html). Using this method, users can map the subjects in their tokens to whatever they wish.

## CRDB SSO FAQ

What is CRDB SSO?
CRDB SSO is a feature to be released in 22.2.0 (currently available on beta3) that allows users to integrate with external identity providers so that user logins can be managed centrally. The way we do this under the hood is by passing JWTs (signed tokens) to CRDB.

Will CRDB SSO Create a CRDB User on First Login?
No. Your user must be created before you can log in to it. There is some upcoming work that will make this easier in CC.

Can I use CC as the identity provider for my CRDB cluster?
Yes. We are currently working on making a ccloud CLI command that will let you seamlessly use your CC user to login to CRDB. The current idea is that the will be a command like `ccloud cluster sql –sso <cluster url>` that will open up a browser for you to login to CC and then it will seamlessly grant you access to the cluster (if you have access).

We select a SQL username for you based on your email address. You will need to make this user (and give it the correct permissions) before you can login.

Can I force CRDB users to login with CRDB SSO?
Yes, except for the root user (and other management users in CC). To do this you can modify the hba conf cluster setting. In CC we will provide a convenient UI for you. Note that even if a user is marked as `reject` in the hba conf, the user will still be able to login with CRDB SSO.
Can I mint my own tokens and use them to login?
Yes. You just need to tell CRDB what your issuer, audience, and signing key are. You can do this through the jwt_authentication cluster settings. Make sure the subject field matches the SQL username you wish to login as.

Just pass the token in the password field with the additional `--crdb:jwt_auth_enabled=true` option added to your command (similar to how you specify your tenant with serverless).

Can I use a third party’s tokens (like a cloud provider)? 
Yes. As before you just need to populate the issuer, audience, and signing key the third party is using for their tokens. You can often find the signing key by going to <provider>/.well-known/openid-configuration and then going to the value in the jwks_uri field.

Just pass the token in the password field with the additional `--crdb:jwt_auth_enabled=true` option added to your command (similar to how you specify your tenant with serverless).
How can I figure out what the values in the JWT are?
Base 64 decode the middles section (between the periods). That will have a number of claims. For example `iss` will be the issuer, `aud` the audience, and `sub` the subject. Also make sure the first section contains a key ID (kid) when base64 decoded.

What do I do if the third party tokens have a subject that isn’t a valid SQL username (for example it starts with a number)?
You can use the pre-existing user name mapping functionality to map the third party subjects to valid SQL usernames. Just set the `server.identity_map.configuration` cluster setting appropriately with the map name equal to the issuer of the token you wish the map to apply to. See https://www.postgresql.org/docs/current/auth-username-maps.html for more details of the syntax of this field.

Make sure the username you use in your connection string matches the MAPPED username, not the subject of the token. If you don’t provide a map, the code will assume you want to user the subject fields as the usernames directly.

Can I have multiple audiences, issuers, and keys in CRDB?
Yes. The audience and issuer fields accept either a single value or a JSON array containing multiple values: `[“value1”,”value2”,”value3”]`. The format for public keys is JWKS. You can combine multiple JWKSes by combining the keys array. In that way multiple keys will be accepted.




For apps / services, it would be a headless authentication workflow, where the app would get a JWT token from a OIDC-supporting identity provider and then pass that as a password to the database cluster (see below).

```
cockroach sql --url "postgresql://{SQL_USERNAME}:{JWT_TOKEN}@{CLUSTER_HOST}:26257?options=--crdb:jwt_auth_enabled=true" --certs-dir={CLUSTER_CERT_DIR}
```


Blogs created:

Short-lived Okta tokens from Python to CRDB - Artem Ervits
SSO using Okta tokens from Golang to CRDB - Morgan Winslow
SSO to CRDB using auto-refresh of Okta tokens - Morgan Winslow
SSO to CRDB using Azure managed identities - Dan Sheldon & Mike Bookham
SSO to CRDB using GCP Service Account - Morgan Winslow
