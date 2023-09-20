---
title: Cluster Single Sign-on (SSO) using JSON web tokens (JWTs)
summary: Overview of Cluster Single Sign-on (SSO) for CockroachDB {{ site.data.products.core }}, review of authenticating users, configuring required cluster settings.
toc: true
docs_area: manage
---

CockroachDB clusters allow users to authenticate with Single Sign-on (SSO), both to the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}), and for SQL client access.

Cluster Single sign-On (SSO) enables users to access the SQL interface of a CockroachDB cluster (whether provisioned on CockroachDB {{ site.data.products.cloud }} or self-hosted) with the full security of Single sign-On (SSO), and the convenience of being able to choose from a variety of cloud-based or customer-managed identity providers (IdPs).

{{ site.data.products.dedicated }} clusters can provision their users with JWTs via the DB Console. This allows users to authenticate to a cluster by signing in to their IdP (for example, Okta or Google) with a link embedded in the DB Console. This flow provisions a JWT which can be copied out of the DB Console UI and used in a SQL connection string to authenticate to the cluster. This applies for both {{ site.data.products.core }} {{ site.data.products.enterprise }} and {{ site.data.products.dedicated }} cluster, but is not possible with {{ site.data.products.serverless }} clusters, as they do not have ConsoleDB access. It is possible to use [Cluster Single Sign-on (SSO) using `ccloud` and the CockroachDB Cloud Console](https://www.cockroachlabs.com/docs/cockroachcloud/cloud-sso-sql) with {{ site.data.products.serverless }} clusters.

{{site.data.alerts.callout_info}}
You might also be looking for:

- [Cluster Single Sign-on (SSO) using `ccloud` and the CockroachDB Cloud Console](https://www.cockroachlabs.com/docs/cockroachcloud/cloud-sso-sql).
- [Single Sign-on (SSO) for DB Console](sso-db-console.html), which is a pre-requisite for Cluster SSO.
{{site.data.alerts.end}}

**Prerequisites**

- You must have your cluster pre-configured for OIDC/SSO authentication for DB Console. Refer to: [Single Sign-on (SSO) for DB Console](sso-db-console.html)

- SQL users/credentials:

    - You must have the ability to update your cluster settings, which can be achieved in several ways. Refer to [`SET CLUSTER SETTING`: Required permissions](set-cluster-setting.html#required-privileges)
.
    - A SQL user that corresponds with your external identity must be pre-provisioned on the cluster. To provision such users, you must have access to the [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role).

## Authenticate to your cluster

Once ConsoleDB SSO and Cluster SSO with JWTs are enabled and your cluster is [properly configured](#) (including mapping authorized external users to SQL roles), users can self-provision JWTs through a sign-in flow embedded in the DB Console.

{{site.data.alerts.callout_success}}
This example uses [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}), but you can use any SQL client that supports sufficiently long passwords.
{{site.data.alerts.end}}

1. Obtain a token.

    Go to your cluster's DB Console and click the **generate token** button

1. Use the token in place of a password in your database connection string.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    cockroach sql --url "postgresql://{SQL_USERNAME}:{JWT_TOKEN}@{CLUSTER_HOST}:26257?options=--crdb:jwt_auth_enabled=true" --certs-dir={CLUSTER_CERT_DIR}
    ~~~

    ~~~txt
    Welcome to the cockroach SQL interface...
    ~~~

## Configure your cluster for SSO

**Prerequisites**:

You must have the ability to update your cluster settings, which can be achieved in several ways. Refer to [`SET CLUSTER SETTING`: Required permissions](set-cluster-setting.html#required-privileges)

### Cluster Settings

| Cluster Setting | Description 
|-----------------|------ 
| `server.jwt_authentication.enabled` | Defaults to `false`, must be set to `true` to enable embedded JWT generation.
| `server.jwt_authentication.jwks` | A list of public signing keys for allowed IdPs; must include your IdP's key. 
| `server.jwt_authentication.issuers` | A list of accepted token issuers; must include your IdP.
| `server.jwt_authentication.audience` | This must match `server.oidc_authentication.client_id`; refer to [Single Sign-on (SSO) for DB Console](sso-db-console.html).
| `server.jwt_authentication.claim` | Which JWT field will be used to determine the user identity in CockroachDB; normally set either to `email`, or `sub` (subject).
| `server.oidc_authentication.generate_cluster_sso_token.enabled` | Enables token generation; must be set to `true`.
|`server.oidc_authentication.generate_cluster_sso_token.use_token`| This selects which part of the received OIDC credentials to use to [determine the user’s identity](#how-cockroachdb-determines-the-sql-username-from-a-jwt).
|`server.identity_map.configuration`| Takes an [Identity Map configuration](#identity-map-configuration)
| `server.sql_host` | This display value informs users the host for their SQL connections. Default: `localhost`.
| `server.sql_port` | This display value informs users the port for their SQL connections. Default: `26257`.

### Update your cluster settings


{{site.data.alerts.callout_success}}
In order for this feature to work, [Single Sign-on (SSO) for DB Console](sso-db-console.html) and cluster SSO must both be configured with the same IDP.
{{site.data.alerts.end}}

You can update your cluster settings with the [`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %}) SQL statement.

{{site.data.alerts.callout_success}}
You can also view all of your cluster settings in the DB Console...
{{site.data.alerts.end}}

1. `enable` JWT SQL authentication to your cluster.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    SET CLUSTER SETTING server.jwt_authentication.enabled = true;
    ~~~

1.  Add your IdP's formal `issuer` name (this must match the `issuer` field in the JWT itself) to your cluster's list of accepted token issuers.

    {{site.data.alerts.callout_success}}
    This must match your cluster's configured  value for `server.oidc_authentication.provider_url`. Refer to [Single Sign-on (SSO) for DB Console](sso-db-console.html#cluster-settings).

    CockroachDB {{ site.data.products.cloud }}'s IdP configuration can be viewed publicly at: `https://cockroachlabs.cloud/.well-known/openid-configuration`.
    The `issuer` is `https://cockroachlabs.cloud`.

    For Google Cloud Platform, the `openid-configuration` can be found at `https://accounts.google.com/.well-known/openid-configuration`. The `issuer` is `https://accounts.google.com`.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~shell
    SET CLUSTER SETTING server.jwt_authentication.issuers = 'https://accounts.google.com';
    ~~~

1. `server.jwt_authentication.audience`

    The ID of your cluster as specified by the IdP, or a JSON array of such names. This must match `server.oidc_authentication.client_id`; refer to [Single Sign-on (SSO) for DB Console](sso-db-console.html).

    {{site.data.alerts.callout_danger}}
    Many third-party token issuers, including GCP and Azure, will by default create tokens with a generic default audience. It is best practice to limit the scope of access tokens as much as possible, so if possible, we recommend issuing tokens with only the required audience value corresponding to the `audience` configured on the cluster.

    By extension, if your provider allows you to specify scopes or permissions on the token, you should specify these as restrictively as possible, while still allowing for the functions intended for the service account or user.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~shell
    SET CLUSTER SETTING server.jwt_authentication.audience = '984901724939-njig7lkv7k724rbv2hllvr4of8ul7th7.apps.googleusercontent.com';
    ~~~

1. `server.jwt_authentication.claim`
    This setting determines which field in the JWT your cluster will use to the identity to a SQL user. The value of `email` indicates the email field in the JWT.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    SET CLUSTER SETTING server.jwt_authentication.claim = 'email';
    ~~~

1. `server.jwt_authentication.jwks`

    This field takes a single JWT or JSON array of JWTS. This list must include a given IdP, or the cluster will reject JWTs issued by it.

    Add your IdP's public signing key to your cluster's list of accepted signing JSON web keys (JWKS), under the `jwks` setting. This is a [JWK](https://www.rfc-editor.org/rfc/rfc7517) formatted single key or key set, containing the public keys for SSO token issuers/IdPs that will be accepted by your cluster.

    {{site.data.alerts.callout_danger}}
    <b>{{ site.data.products.db }} {{ site.data.products.dedicated }} customers:</b> 

    By default, your cluster's configuration will contain the CockroachDB {{ site.data.products.cloud }}'s own public key, allowing CockroachDB {{ site.data.products.cloud }} to serve as an IdP. This is required for [SSO with `ccloud`](https://www.cockroachlabs.com/docs/cockroachcloud/cloud-sso-sql). When modifying this cluster setting, you must include the CockroachDB {{ site.data.products.cloud }} public key in the key set, or SSO with `ccloud` will no longer work.
    {{site.data.alerts.end}}
    
    {{site.data.alerts.callout_success}}
    The required information for a given IdP is published on that IdP's `.well-known/openid-configuration` path, for example, `https://cockroachlabs.cloud/.well-known/openid-configuration` for CockroachDB {{ site.data.products.cloud }}, or `https://accounts.google.com/.well-known/openid-configuration` for GCP.
    {{site.data.alerts.end}}

    For example:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    SET CLUSTER SETTING server.jwt_authentication.jwks = '{
      "keys": [
        {
          "alg": "RS256",
          "kty": "RSA",
          "kid": "85ba9313fd7a7d4afa84884abcc8403004363180",
          "e": "AQAB",
          "use": "sig",
          "n": "pP-rCe4jkKX6mq8yP1GcBZcxJzmxKWicHHor1S3Q49u6Oe-bQsk5NsK5mdR7Y7liGV9n0ikXSM42dYKQdxbhKA-7--fFon5isJoHr4fIwL2CCwVm5QWlK37q6PiH2_F1M0hRorHfkCb4nI56ZvfygvuOH4LIS82OzIgmsYbeEfwDRpeMSxWKwlpa3pX3GZ6jG7FgzJGBvmBkagpgsa2JZdyU4gEGMOkHdSzi5Ii-6RGfFLhhI1OMxC9P2JaU5yjMN2pikfFIq_dbpm75yNUGpWJNVywtrlNvvJfA74UMN_lVCAaSR0A03BUMg6ljB65gFllpKF224uWBA8tpjngwKQ"
        },
        {
          "alg": "RS256",
          "n": "8ASqcDDTYmFx53uAkWlmqx8qIx0WQacaswAAb7xGx9XL2T71VPtKKgPqoimXzj4fXT2F3opIgOQgGKxkxw2QrAAoejdIud5URrZLRponmbMQO3erG5sd8PC29rjekX8_hvX_AMT3zU8JLKVLFR0xJmFdmIomnarpEvWKmG0SNvbuVveprsve0n1W35uodcRe417vlTNnH9j8fesQekvFf8tIWbHouXDg3B1km4gqZBbQ_MWvGriGBY5sfr7A2d0iNe89Aje7pz1RFLUFOu-u_NyD6RwL6qo4_yetAYIzm02a2KAAq03YPs2LHMVQmkh1LtyeuA6bvf9146cAFY4BCQ",
          "use": "sig",
          "e": "AQAB",
          "kty": "RSA",
          "kid": "05150a1320b9395b05716877376928509bab44ac"
        }
      ]
    }';
    ~~~

1. Configure token generation.

The `use_token` field determines which part of the received OIDC credentials the cluster uses to [determine the user’s identity](#how-cockroachdb-determines-the-sql-username-from-a-jwt).

It can be set to either `id_token` or `access_token`, depending on the structure of the your JWT as determined in your IDP configuration.

{{site.data.alerts.callout_success}}
This can be tricky to determine; unless you have a previously generated token, you may need to try it both ways to determine which one works. If you have a token, you can base-64 decode the middle segment&mdash;the token consists of three `.`-delimited segments&mdash;and trace the path to the value the cluster will use to map an external identity to a SQL user (via the Identity Map).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~shell
SET CLUSTER SETTING server.oidc_authentication.generate_cluster_sso_token.enabled = true;
SET CLUSTER SETTING server.oidc_authentication.generate_cluster_sso_token.use_token = id_token;
~~~

## How CockroachDB determines the SQL username from a JWT

1. `server.oidc_authentication.generate_cluster_sso_token.use_token` determines which token to look at (`id_token` or `access_token`).
1. `server.jwt_authentication.claim` determines which claim in that token, defaulting to picking the token’s subject, but also potentially using email.
1. `server.identity_map.configuration` maps that claim (along with the token’s issuer) to a SQL username.

## Identity Map configuration

Th cluster setting `server.identity_map.configuration` holds your cluster's identity map configuration, which tells your cluster how to map external identities to SQL users. This is functionally similar to PostgreSQL's [User Name Map](https://www.postgresql.org/docs/current/auth-username-maps.html).

{{site.data.alerts.callout_info}}
Each line potentially maps many external identities to one SQL user, and a configuration can contain multiple lines, so the mapping can be many-to-many. The cluster checks to see if the SQL username given in the connection request matches the identity in the token by any of the lines in the Identity Map.
{{site.data.alerts.end}}

The format of an identity map configuration is a space-separated triple consisting of:

`<external issuer> <external user ID> <SQL username>`

Examples:

- `https://accounts.google.com /^(.*)@cockroachlabs\.com$ \1`

    Maps every cockroachlabs email to a SQL user with the same username (i.e. the part of the email address to the left of the `@`), for example `docs@cockroachlabs.com` becomes `docs`

- `https://accounts.google.com 1232316645658094244789 roach`

    Maps a single external identity with the hard-coded ID to the SQL user `roach`  

- `https://accounts.google.com   /^([9-0]*)$   gcp_\1`

    Maps each GCP-provisioned service account to a SQL user named `gcp_{ GCP user ID }`, e.g., `gcp_1234567` for a service account with ID `1234567`.

## What's Next?

- Learn more about [Authentication]({% link {{ page.version.version }}/authentication.md %}) in CockroachDB.
- This [Cockroach Labs blog post](https://www.cockroachlabs.com/blog/sso-to-clusters-with-jwt/) covers and provides further resources for a variety of auth token-issuing use cases, including using Okta and Google Cloud Platform to issue tokens.
