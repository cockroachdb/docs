---
title: Cluster Single Sign-On (SSO) for CockroachDB SQL Access
summary: Overview of Single Sign-On (SSO) for CockroachDB SQL Access, and review of workflows for authenticating human and bot users, and for configuring the feature.
toc: true
docs_area: manage
---

## What is Cluster Single Sign-On (SSO) for SQL Access?

Cluster SSO for SQL access allows users to access the SQL interface of a CockroachDB cluster (whether provisioned on {{ site.data.products.db }} or self-hosted) with the full security of Single Sign-On (SSO), and the convenience of being able to choose from a variety of SSO identity providers, including Cockroach Cloud, Google, Microsoft, GitHub, or your own self-hosted SAML or OIDC.

Note that this regards SQL access to a specific CockroachDB Cluster, not access to a Cockroach Cloud organization. For the latter, see [Single Sign-On (SSO) for CockroachDB Cloud organizations](../cockroachcloud/cloud-org-sso.html)

Cluster SSO includes separate flows for human users and software-operated service accounts.

## Access {{ site.data.products.db }} clusters with the cloud console as SSO identity provider

{{ site.data.products.dedicated }} and {{ site.data.products.serverless }} clusters are, by default, configured for Cluster SSO with {{ site.data.products.db }} serving as SSO provider.

{{site.data.alerts.callout_info}}
Note that this authentication method only works for *human users*, since only humans may have {{ site.data.products.db }} console identities.

Software users (i.e. service accounts), can authenticate using JWT tokens from your own identity provider. See [Authenticating software users (service accounts) with Cluster SSO].
{{site.data.alerts.end}}

**Learn more:**
- [Single Sign-On (SSO) for CockroachDB Cloud organizations](../cockroachcloud/cloud-org-sso.html#cloud-organization-sso)
- [Configure Cloud Organization Single Sign-On (SSO)](../cockroachcloud/configure-cloud-org-sso.html)

**Prerequisites to access a {{ site.data.products.db }} cluster using SSO:** 
- You must have a user identity on a {{ site.data.products.db }} organization. For help setting up an organization and cluster, see: [Quickstart with CockroachDB](../cockroachcloud/quickstart.html).
- SSO must be enabled for your organization. For help configuring SSO for your {{ site.data.products.db }} organization, see: [Configure Cloud Organization Single Sign-On (SSO)](../cockroachcloud/configure-cloud-org-sso.html)
- SSO must be enabled for your particular {{ site.data.products.db }} user. Configure this at the [{{ site.data.products.db }} console account settings page](https://cockroachlabs.cloud/account/profile).
- Your {{ site.data.products.db }} user identity must have access to at least one cluster in your organization.
- A SQL user specifically corresponding to your SSO identity must be pre-provisioned on the cluster. To authenticate to a specific SQL database, i.e. a cluster, using SSO, a {{ site.data.products.db }} user must have a corresponding SQL user already [created](create-user.html#create-a-user) on that cluster. {{ site.data.products.db }} users must correspond to SQL database users by the convention that the SQL username must be `sso_{email_address}`. ???!!! {how does this format actually work, does the at gmail go in there???}
- [`ccloud`, the Cockroach Cloud CLI](../cockroachcloud/ccloud-get-started.html) must be installed on your local workstation.


1. First authenticate to your {{ site.data.products.db }} organization.

	{% include_cached copy-clipboard.html %}
	~~~shell
	ccloud auth login
	~~~
	
	This command will cause your workstation's default browser to open to a Cockroach Cloud authentication portal. Authenticate here as you normally do to the Cockroach Cloud console. The `ccloud` utility will receive an authentication token from the browser, allowing you to authenticate from the command line.


1. You may then use the `ccloud` utility to authenticate to your {{ site.data.products.db }} cluster, allowing you to access the SQL interface.

	{% include_cached copy-clipboard.html %}
	~~~shell
	ccloud cluster sql --sso { your cluster name}
	~~~

## Authenticating software users (service accounts) with Cluster SSO

Authenticating service accounts, i.e. user identities to be controlled by software applications or scripts, rather by humans, is considerably complicated. Currently, Cockroach Cloud can only serve as an identiy provider for humans, so to do this, you must operate your own IdP and configure your cluster to accept auth tokens issued by this IdP.

A service account can then authenticate to your cluster by obtaining an auth token and including it in the request.

**Prerequisites**

- You must have the ability to create identities and issue tokens with a SAML or OIDC identity provider.
- You must have a user identity on a {{ site.data.products.db }} organization. For help setting up an organization and cluster, see: [Quickstart with CockroachDB](../cockroachcloud/quickstart.html).
- You must have access to a member of the [`admin` role](security-reference/authorization.html#admin-role) in order to update cluster settings, which is required to add an external token issuer/IdP.
- A SQL user specifically corresponding to the service account must be pre-provisioned on the cluster (or you must have access to a SQL role allowing you to create such a user).

### Configure your cluster to accept your external identity provider.

You must update three cluster settings in order to use an external token issues/IdP:

- 
In order to authenticate a service account to a {{ site.data.products.db }} cluster using a JWT issuer , you must update several cluster settings in the `server.jwt_authentication` namespace:

- `jwks`
- `issuers`
- `audience`


1. Add your IdP's public signing key to your cluster's list of accepted signing JSON web keys (JWKS), under the `jwks` setting.

`server.jwt_authentication.jwks`

A JWKS of the signing keys. Will default to the Cockroach Console ones. If users want more than one they have to combine formats. This can either be a singular key or a key set. Note these are public keys not private keys


1. Issuers: `server.jwt_authentication.issuers`
The list of accepted JWT issues. This list must include a given IdP, or the cluster will reject JWTs issued by it.


By default will be the CC issuer but they can set it to any string or any list of strings formatted as a json array. Needs to match the issuer of JWTs
https://cockroachlabs.cloud

Can be one value or a json array of values

1. Audience: `server.jwt_authentication.audience`
What the audience on the tokens will be
Can be one value or a json array of values





1. Enabled: `server.jwt_authentication.enabled`
Whether to allow JWT based logins. This is enabled by default for cloud customers, you just need to leave it.

Cluster settings to be configured to use the feature

True or false



### Authenticate to your cluster with the JWT token

To provision SQL cluster access for service accounts, i.e. software users (as opposed to human users), you must   JWT tokens from your IdP.

they can then issue the tokens with normal JWT fields along with the subject field which will be equal to the user’s SQL username.

They then pass this token in the password field along with a special option flag to indicate that the password field contains a token. Notably, you can use any SQL client that supports sufficiently long passwords.

Once you have a valid token from your IdP

```
cockroach sql --url "postgresql://{SQL_USERNAME}:{JWT_TOKEN}@{CLUSTER_HOST}:26257?options=--crdb:jwt_auth_enabled=true" --certs-dir={CLUSTER_CERT_DIR}
```





For apps / services, it would be a headless authentication workflow, where the app would get a JWT token from a OIDC-supporting identity provider and then pass that as a password to the database cluster (see below).








!!!???{

"
How does this work in CC? We use Cockroach Cloud as the identity provider. This allows us to utilize the existing integrations with external identity providers (SAML, OIDC, Google, Microsoft, and GitHub), while still allowing customers with password based authentication to use the feature.""
}

## SQL access using the {{ site.data.products.db }} console as SSO identity provider

!!!???
"We are currently working on making a ccloud CLI command that will let you seamlessly use your CC user to login to CRDB. The current idea is that the will be a command like `ccloud cluster sql –sso <cluster url>` that will open up a browser for you to login to CC and then it will seamlessly grant you access to the cluster (if you have access).

We select a SQL username for you based on your email address. You will need to make this user (and give it the correct permissions) before you can login."


"Process (still being wrapped up):
Using the ccloud CLI, issue the sql command with the sso flag (flag name etc TBD)
The CLI will open up the browser (as it does today during login)
If you are not already logged in you will be prompted to login to Cockroach Cloud using
The flow will then complete and you will have connected to the CRDB cluster as normal
You will be logged in as a username derived from your email address with a sso_ prefix.
For now this can’t be changed
The user in CRDB won’t be created for you (yet)
"










### Configure your cluster settings to enforce SSO

don't try this! bad! you'll lock out CRL accounts

### Configure your cluster's accepted JWT providers

!!!???
{
	This applies both in cloud (i.e. cloud clusters can accept other (non-CC) JWT providers? )
}






## Cluster SSO for SQL access with self-hosted CockroachDB clusters

### Configure your self-hosted cluster to enable Cluster SSO for SQL access

In order to get this to work for self-hosted customers, they have to set a series of cluster settings including:

Jwks
The signing key of the issuer they wish to use
Can be one key (JWK) or a set of values (JWKS)

`server.jwt_authentication.jwks`
A JWKS of the signing keys. Will default to the Cockroach Console ones. If users want more than one they have to combine formats. This can either be a singular key or a key set. Note these are public keys not private keys


Issuers
What the issuer of the tokens will be

`server.jwt_authentication.issuers`
By default will be the CC issuer but they can set it to any string or any list of strings formatted as a json array. Needs to match the issuer of JWTs
https://cockroachlabs.cloud

Can be one value or a json array of values

Audience
What the audience on the tokens will be
Can be one value or a json array of values


By default will be the CC cluster ID but they can set it to any string or any list of strings formatted as a json array. Needs to match the audience on JWTs
[“audience1”,”audience2”]
Audience1
For Azure - https://learn.microsoft.com/en-us/azure/active-directory/develop/access-tokens (it’s the AppID of the dummy app registration with no permissions)

[“https://cockroachlabs.cloud”,”https://accounts.google.com”]
For Azure - https://login.microsoftonline.com/<Azure_Tenant_Id>/v2.0

Enabled
Whether to allow JWT based logins


Cluster settings to be configured to use the feature
`server.jwt_authentication.enabled`
True or false
`server.jwt_authentication.audience`
By default will be the CC cluster ID but they can set it to any string or any list of strings formatted as a json array. Needs to match the audience on JWTs
[“audience1”,”audience2”]
Audience1
For Azure - https://learn.microsoft.com/en-us/azure/active-directory/develop/access-tokens (it’s the AppID of the dummy app registration with no permissions)

[“https://cockroachlabs.cloud”,”https://accounts.google.com”]
For Azure - https://login.microsoftonline.com/<Azure_Tenant_Id>/v2.0




### SQL access for human users

### SQL access for service accounts


Self-hosted
CC allows us to abstract away lots of the complexity of setting this all up. Under the hood, CC is creating signed JWTs. These tokens contain information about the user who logged in and are signed with an asymmetric key so we know they came from CC. In order to get this to work for self-hosted customers, they have to set a series of cluster settings including:
Jwks
The signing key of the issuer they wish to use
Can be one key (JWK) or a set of values (JWKS)
Issuers
What the issuer of the tokens will be
Can be one value or a json array of values
Audience
What the audience on the tokens will be
Can be one value or a json array of values
Enabled
Whether to allow JWT based logins

Once these are set up they can then issue the tokens with normal JWT fields along with the subject field which will be equal to the user’s SQL username. They then pass this token in the password field along with a special option flag to indicate that the password field contains a token. Notably, you can use any SQL client that supports sufficiently long passwords.
Third-party issuers
There are some cases where a customer will want to use a third-party token issuer (such as GCP or Azure). This is supported but introduces some sharp edges. It is important for customers to understand how the audience, issuer, and subject fields are populated by their provider and make sure to only allow users they wish to access it.

Many of these providers do not have subject fields that are valid SQL usernames. To support this, we reuse the existing username maps (see PSQL docs https://www.postgresql.org/docs/current/auth-username-maps.html). Using this method, users can map the subjects in their tokens to whatever they wish.




CRDB SSO FAQ

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

## Workflows

For human users, we would have a more integrated flow through cloud CLI which would do the necessary handshake across CC Console and the cluster, while users would be prompted to enter their credentials in the identity provider - very much like how SSO for CC Console works.

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
