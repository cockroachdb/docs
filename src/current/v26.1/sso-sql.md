---
title: Cluster Single Sign-on (SSO) using JSON Web Tokens (JWTs)
summary: Overview of Cluster Single Sign-on (SSO) for CockroachDB self-hosted clusters, review of authenticating users, configuring required cluster settings.
toc: true
docs_area: manage
---

CockroachDB clusters allow users to authenticate with Single Sign-on (SSO), both to the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}), and for SQL client access.

Cluster single sign-on (SSO) enables users to access the SQL interface of a CockroachDB cluster (whether provisioned on CockroachDB {{ site.data.products.cloud }} or {{ site.data.products.core }}) with the full security of single sign-on (SSO), using JSON Web Tokens (JWTs) from external identity providers (IdPs) such as Okta, Google, Azure AD, or Keycloak.

Users can obtain JWTs directly from their IdP and use them to authenticate to SQL clients. Optionally, CockroachDB {{ site.data.products.cloud }} {{ site.data.products.advanced }} clusters and {{ site.data.products.core }} clusters can also generate JWTs via the DB Console as a convenience feature. When DB Console JWT generation is enabled, users can sign in to their IdP through a link embedded in the DB Console, then copy the generated JWT and use it in a SQL connection string to authenticate to the cluster.

JWT authentication supports automatic role synchronization and user provisioning. When [JWT authorization]({% link {{ page.version.version }}/jwt-authorization.md %}) is enabled, users' role memberships are automatically synchronized based on group claims from the IdP on each login. Additionally, [automatic user provisioning](#configure-user-provisioning) can automatically create SQL users on first authentication, eliminating the need to pre-create users.

This page describes how to configure a cluster for cluster single sign-on using JWTs and then how users can authenticate using the JWTs:

- [Configure a cluster for cluster single sign-on using JWTs](#configure-your-cluster-for-sso)
- [Configure user provisioning](#configure-user-provisioning) (optional)
- [Authenticate to your cluster](#authenticate-to-your-cluster)

**Prerequisites**

- **Identity Provider (IdP)**: You must have access to an identity provider that supports JWT tokens, such as Okta, Google, Azure AD, or Keycloak.

- **Cluster Settings Access**: You must have the ability to update your cluster settings. Refer to [`SET CLUSTER SETTING`: Required permissions]({% link {{ page.version.version }}/set-cluster-setting.md %}#required-privileges).

- **SQL User Provisioning**:
    - If you are using [automatic user provisioning](#configure-user-provisioning), SQL users will be created automatically on first authentication.
    - If automatic user provisioning is disabled, a SQL user that corresponds with your external identity must be pre-created on the cluster. To create users, you must have access to the [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role).

- **(Optional) DB Console JWT Generation**: To use the DB Console to generate JWTs (instead of obtaining them directly from your IdP), you must have your cluster pre-configured for OIDC/SSO authentication for DB Console. Use the [Single Sign-on (SSO) for DB Console]({% link {{ page.version.version }}/sso-db-console.md %}) guide to set this up.

- **(Optional) JWT Authorization**: To enable automatic role synchronization based on IdP group claims, see [JWT Authorization]({% link {{ page.version.version }}/jwt-authorization.md %}).

## Configure your cluster for SSO

### Cluster Settings

You must configure the [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}) in the following table to enable JWT authentication to your cluster. Refer to the [Update your cluster settings](#update-your-cluster-settings) section to configure your cluster settings.

Cluster Setting | Description
----------------|------
`server.jwt_authentication.enabled` | Defaults to `false`, must be set to `true` to enable embedded JWT generation.
`server.jwt_authentication.jwks` | A list of public signing keys for allowed IdPs; must include your IdP's key. If `server.jwt_authentication.jwks_auto_fetch.enabled` is `true`, there is no need to set `server.jwt_authentication.jwks`.
`server.jwt_authentication.jwks_auto_fetch.enabled` | If `true`, public signing keys are automatically fetched from the issuer and there is no need to set `server.jwt_authentication.jwks`. Defaults to `false`.
`server.jwt_authentication.issuers.configuration` | A list of accepted token issuers; must include your IdP. Can be any of the following: <ul><li>A string representing a valid issuer URL</li><li>A string that contains a JSON array of issuer URLs</li><li>A string that contains a JSON map of issuer URLs to JWKS URIs</li></ul>The format is detected automatically. Refer to the [configuration examples](#configuration-examples). The previous cluster setting name `server.jwt_authentication.issuers` is aliased to this setting.
`server.jwt_authentication.issuer_custom_ca` | A string that contains the name of the custom root CA to use for verifying certificates when fetching a JWKS from the issuer.
`server.jwt_authentication.client.timeout` | An optional HTTP client timeout for external calls made during JWT authentication, in seconds. Defaults to `15` seconds.
`server.jwt_authentication.audience` | This must match `server.oidc_authentication.client_id`; refer to [Single Sign-on (SSO) for DB Console](sso-db-console.html).
`server.jwt_authentication.claim` | The JWT field that will be used to determine the user identity in CockroachDB; normally set either to `email`, or `sub` (subject).
`server.jwt_authentication.authorization.enabled` | Enables automatic role synchronization based on JWT groups claim. See [JWT Authorization]({% link {{ page.version.version }}/jwt-authorization.md %}). Defaults to `false`.
`server.jwt_authentication.group_claim` | JWT field containing groups for authorization. Defaults to `groups`. See [JWT Authorization]({% link {{ page.version.version }}/jwt-authorization.md %}).
`server.jwt_authentication.userinfo_group_key` | Userinfo endpoint JSON key for groups fallback. Defaults to `groups`. See [JWT Authorization]({% link {{ page.version.version }}/jwt-authorization.md %}).
`security.provisioning.jwt.enabled` | Enables automatic user creation on first JWT login. Defaults to `false`. See [Configure user provisioning](#configure-user-provisioning).
`server.oidc_authentication.generate_cluster_sso_token.enabled` | Enables token generation; must be set to `true`.
`server.oidc_authentication.generate_cluster_sso_token.use_token`| Selects which part of the received OIDC credentials to display.
`server.identity_map.configuration`| Takes an [Identity Map configuration](#identity-map-configuration).
`server.sql_host` | This display value informs users the host for their SQL connections. Default: `localhost`.
`server.sql_port` | This display value informs users the port for their SQL connections. Default: `26257`.

### Update your cluster settings

{{site.data.alerts.callout_info}}
[Single Sign-on (SSO) for DB Console]({% link {{ page.version.version }}/sso-db-console.md %}) and cluster SSO cannot be configured with different IdPs.
{{site.data.alerts.end}}

Follow these steps to configure Cluster SSO.

1. In your IdP, find:
    - The **issuer name**, which can be found in the `iss` field of a JWT.
    - The issuer's **OpenID configuration endpoint**, which is typically published at `https://{ issuer URL }/.well-known/openid-configuration`. The **issuer URL** is the domain portion of the configuration endpoint. From the full endpoint, you can find the issuer URL, and vice versa. For example, the issuer URL for CockroachDB {{ site.data.products.cloud }} is `https://cockroachlabs.cloud` and the configuration endpoint is `https://cockroachlabs.cloud/.well-known/openid-configuration`. The configuration endpoint for Google Cloud is `https://accounts.google.com` and the configuration endpoint is `https://accounts.google.com/.well-known/openid-configuration`. If you omit the `.well-known/openid-configuration` portion, it is appended automatically.
    - The **public signing key** your issuer uses to sign JWTs. Your cluster will reject JWTs that are not signed by this key. Fetch the public signing key from the configuration endpoint. For example:

        {% include_cached copy-clipboard.html %}
        ~~~shell
        curl --silent https://accounts.google.com/.well-known/openid-configuration | jq .jwks_uri | xargs curl
        ~~~

        ~~~txt
        {
          "keys": [
            {
              "alg": "RS256",
              "use": "sig",
              "e": "AQAB",
              "kty": "RSA",
              "kid": "7c0b6913fe13820a333399ace426e70535a9a0bf",
              "n": "lWXY0XOj_ikSIDIvGOhfuRhQJAAj6BWsbbZ6P-PXRclzV32-QLB4GZHPPcH37Lou5pQsTQPvTETAfCLnglIRSbP8x1zA5tUakRlm5RiGF4kcWh5k60x8u0Uslx-d6EueKuY-KLHUVDuMULlHkYAScIdYnXz-Cnr6PFZj8RQezzdPVPH53Q8a_Z9b-vpGzsMS5gszITb-72OQNokojXdPVctl5WzSx-JnWbJxPiwHx_dSWgmTnyiYrZLqrqfampGdroaamtIXy0W8CAe0uCqcD1LunpfX-Q-RD1IycxnEaXSuUKhNhCcxtHWrozEyeD23Zja2WlcvHdYuTzyrvrvS9Q"
            },
            {
              "kid": "6f7254101f56e41cf35c9926de84a2d552b4c6f1",
              "e": "AQAB",
              "alg": "RS256",
              "use": "sig",
              "n": "oUriU8GqbRw-avcMn95DGW1cpZR1IoM6L7krfrWvLSSCcSX6Ig117o25Yk7QWBiJpaPV0FbP7Y5-DmThZ3SaF0AXW-3BsKPEXfFfeKVc6vBqk3t5mKlNEowjdvNTSzoOXO5UIHwsXaxiJlbMRalaFEUm-2CKgmXl1ss_yGh1OHkfnBiGsfQUndKoHiZuDzBMGw8Sf67am_Ok-4FShK0NuR3-q33aB_3Z7obC71dejSLWFOEcKUVCaw6DGVuLog3x506h1QQ1r0FXKOQxnmqrRgpoHqGSouuG35oZve1vgCU4vLZ6EAgBAbC0KL35I7_0wUDSMpiAvf7iZxzJVbspkQ",
              "kty": "RSA"
            }
          ]
        }
        ~~~

1. Enable JWT SQL authentication for your cluster:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    SET CLUSTER SETTING server.jwt_authentication.enabled = true;
    ~~~

1. Add your IdP's issuer URL to your cluster's list of accepted token issuers. If you have already configured [Single Sign-on (SSO) for DB Console]({% link {{ page.version.version }}/sso-db-console.md %}#cluster-settings), the issuer URL must match the value of `server.oidc_authentication.provider_url`.

    {% include_cached copy-clipboard.html %}
    ~~~sql
    SET CLUSTER SETTING server.jwt_authentication.issuers.configuration = 'https://cockroachlabs.cloud';
    ~~~

1. Configure your cluster's audience, which is your cluster's ID (or JSON array of IDs) in your IdP. The audience is a mechanism for limiting the clients that can obtain JWTs from your IdP. If you have already configured [Single Sign-on (SSO) for DB Console]({% link {{ page.version.version }}/sso-db-console.md %}#cluster-settings), the issuer URL must match the value of `server.oidc_authentication.client_id`.

    Many third-party token issuers, including GCP and Azure, default to creating tokens with a generic default audience. We recommend limiting the scope of access tokens if possible.

    By extension, if your provider allows you to specify scopes or permissions on the token, we recommend configuring the scopes or permissions to be as restrictive as possible.

    {% include_cached copy-clipboard.html %}
    ~~~sql
    SET CLUSTER SETTING server.jwt_authentication.audience = '984901724939-njig7lkv7k724rbv2hllvr4of8ul7th7.apps.googleusercontent.com';
    ~~~

1. Configure the field in the JWT that contains the email address that corresponds to a SQL user.

    {% include_cached copy-clipboard.html %}
    ~~~sql
    SET CLUSTER SETTING server.jwt_authentication.claim = 'email';
    ~~~

1. Add your IdP's public signing key, which you found previously, to your cluster's list of acceptable signing JSON web keys (JWKS). Your cluster will reject JWTs that are not signed by a signing key that is listed in `server.jwt_authentication.jwks`. If you want to [enable automatic fetching of signing keys](#configuration-examples) instead of configuring static signing keys, skip this step.

    IdPs such as Google rotate their signing keys periodically. You must update your cluster with a new signing key before the previous one expires, or your SQL clients will be unable to connect with cluster SSO. **We recommend updating this cluster setting with the current key daily to avoid this scenario.** Alternatively, you can enable `server.jwt_authentication.jwks_auto_fetch.enabled` to automatically fetch signing keys from the issuer instead of maintaining a static list of signing keys. If `server.jwt_authentication.jwks_auto_fetch.enabled` is enabled, then `server.jwt_authentication.jwks` is ignored.

    By default, CockroachDB {{ site.data.products.advanced }} clusters are configured with CockroachDB {{ site.data.products.cloud }}'s public key, so that CockroachDB {{ site.data.products.cloud }} can serve as an IdP. This is required for [SSO with `ccloud`]({% link cockroachcloud/cloud-sso-sql.md %}). When modifying this cluster setting, do not omit the CockroachDB {{ site.data.products.cloud }} public key from the key set, or SSO with `ccloud` will no longer work.

    The public key for {{ site.data.products.db }} can be found at `https://cockroachlabs.cloud/.well-known/openid-configuration`.

    Replace the full contents of `keys` with the list of keys you found previously.

    {% include_cached copy-clipboard.html %}
    ~~~sql
    SET CLUSTER SETTING server.jwt_authentication.jwks = '{
      "keys": [
        {
          ...
        }
      ]
    }';
    ~~~

1. <a id="configuration-examples"></a>Instead of setting `server.jwt_authentication.jwks` to a list of static signing keys, you can set `server.server.jwt_authentication.jwks_auto_fetch.enabled` to `true` to enable automatic fetching of signing keys for the issuers specified in `server.jwt_authentication.issuers.configuration`. Signing keys are fetched from the issuer's`https://{ domain }/.well-known/openid-configuration` endpoint.

    Type                  | Example
    ----------------------|--------
    Single issuer URL     | `'https://accounts.google.com/'`
    Array of issuer URLs  | `'["example.com/adfs","https://accounts.google.com"]'`
    Map of issuer URLs    | `'{ "issuer_jwks_map": { "https://accounts.google.com/": "https://www.googleapis.com/oauth2/v3/certs", "example.com/adfs": "https://example.com/adfs/discovery/keys" } }'`

1. Set your Identity Map. Refer to [Identity Map configuration](#identity-map-configuration).

    {% include_cached copy-clipboard.html %}
    ~~~sql
    SET CLUSTER SETTING
      server.identity_map.configuration = 'https://accounts.google.com /^(.*)@cockroachlabs\.com$ \1';
    ~~~

1. Enable token generation.

    This will also enable the **Token Generation** button to appear in the DB Console.

    {% include_cached copy-clipboard.html %}
    ~~~sql
    SET CLUSTER SETTING
      server.oidc_authentication.generate_cluster_sso_token.enabled = true;
    ~~~

1. Configure how the user's identity will be displayed by setting `server.oidc_authentication.generate_cluster_sso_toke.use_token` to either `id_token` or `access_token`, depending on the structure of the JWTs issued by your IdP.

    {% include_cached copy-clipboard.html %}
    ~~~sql
    SET CLUSTER SETTING
      server.oidc_authentication.generate_cluster_sso_token.use_token = id_token;
    ~~~

## How CockroachDB determines the SQL username from a JWT

1. `server.jwt_authentication.claim` determines which field to use to identify the external user. This must match a SQL user via the identity map.
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

    Maps every `cockroachlabs` email to a SQL user with the same username. That is, the part of the email address to the left of the `@`). For example, `docs@cockroachlabs.com` becomes `docs`.

- `https://accounts.google.com 1232316645658094244789 roach`

    Maps a single external identity with the hard-coded ID to the [SQL user]({% link cockroachcloud/managing-access.md %}#manage-sql-users-on-a-cluster) `roach`.

- `https://accounts.google.com   /^([9-0]*)$   gcp_\1`

    Maps each GCP-provisioned service account to a SQL user named `gcp_{ GCP user ID }`. For example, `gcp_1234567` for a service account with ID `1234567`.

## Configure user provisioning

CockroachDB can automatically create users on their first JWT authentication, eliminating the need to pre-create user accounts.

### Enable user provisioning

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING security.provisioning.jwt.enabled = true;
~~~

### How it works

1. A user presents a valid JWT token during authentication.
1. If the user doesn't exist in CockroachDB, the user is created automatically.
1. The user is tagged with the `PROVISIONSRC` role option: `jwt_token:<issuer>`, where `<issuer>` is the JWT issuer URL.
1. If [JWT authorization]({% link {{ page.version.version }}/jwt-authorization.md %}) is also enabled, roles are synchronized immediately after user creation.

### Auditing provisioned users

You can identify automatically provisioned users by viewing their role options:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW ROLES;
~~~

Example output:

~~~txt
  username  |                       options                        | member_of
------------+------------------------------------------------------+-----------
  alice     | {PROVISIONSRC=jwt_token:https://auth.example.com}    | {developers}
  bob       | {PROVISIONSRC=jwt_token:https://auth.example.com}    | {admins}
~~~

Users provisioned via JWT will have `PROVISIONSRC=jwt_token:<issuer>` in their options column.

### Security considerations

- **Validate JWT issuers carefully**: Ensure `server.jwt_authentication.issuers.configuration` only includes trusted issuers, as any valid JWT from these issuers can create new users.
- **Monitor provisioned users**: Regularly review automatically created users to ensure only authorized users are being provisioned.
- **Combine with JWT authorization**: Consider enabling [JWT authorization]({% link {{ page.version.version }}/jwt-authorization.md %}) to automatically grant appropriate roles to provisioned users based on their IdP group memberships.
- **Password management**: Provisioned users cannot change their own passwords, as authentication is managed through the IdP.

{{site.data.alerts.callout_info}}
If you are going to use JWT user provisioning in conjunction with [JWT authorization]({% link {{ page.version.version }}/jwt-authorization.md %}), be sure to create the necessary roles in CockroachDB before enabling user provisioning. Auto-provisioned users will only receive roles for groups that already exist as CockroachDB roles.
{{site.data.alerts.end}}

## Authenticate to your cluster

JWT authentication supports two methods for obtaining tokens:

1. **Obtain JWTs directly from your IdP**: Use your identity provider's API or SDK to generate JWT tokens (e.g., via Okta APIs, Google OAuth, Azure AD). This is the primary method and requires only the JWT authentication cluster settings configured above.

2. **Generate JWTs via DB Console**: If you have [OIDC authentication for DB Console]({% link {{ page.version.version }}/sso-db-console.md %}) configured, users can obtain JWT tokens through the DB Console UI.

This section describes the DB Console method. For obtaining JWTs directly from your IdP, refer to your identity provider's documentation.

### Authenticate using DB Console-generated JWTs

Once DB Console SSO and Cluster SSO with JWTs are enabled and your cluster is [properly configured](#configure-your-cluster-for-sso) (including mapping authorized external users to SQL roles), users can self-provision auth tokens through a sign-in flow embedded in the DB Console. These tokens (JWTs) are intended as short-lived credentials. The expiry is set based on the OIDC token from your identity provider, which is typically 1 hour.

{{site.data.alerts.callout_success}}
This example uses [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}), but you can use any SQL client that supports sufficiently long passwords.
{{site.data.alerts.end}}

1. Obtain a token.

    Go to your cluster's DB Console and click the **Generate JWT auth token for cluster SSO** button

1. Use the token in place of a password in your database connection string.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    cockroach sql --url "postgresql://{SQL_USERNAME}:{JWT_TOKEN}@{CLUSTER_HOST}:26257?options=--crdb:jwt_auth_enabled=true" --certs-dir={CLUSTER_CERT_DIR}
    ~~~

    ~~~txt
    Welcome to the cockroach SQL interface...
    ~~~

## What's Next?

- Learn more about [Authentication]({% link {{ page.version.version }}/authentication.md %}) in CockroachDB.
- This [Cockroach Labs blog post](https://www.cockroachlabs.com/blog/sso-to-clusters-with-jwt/) covers and provides further resources for a variety of auth token-issuing use cases, including using Okta and Google Cloud Platform to issue tokens.

## See also

- [DB Console Overview]({% link {{ page.version.version }}/ui-overview.md %})
- [Single Sign-on (SSO) for DB Console]({% link {{ page.version.version }}/sso-db-console.md %})
- [JWT Authorization]({% link {{ page.version.version }}/jwt-authorization.md %})
- [OIDC Authorization]({% link {{ page.version.version }}/oidc-authorization.md %})
- [LDAP Authorization]({% link {{ page.version.version }}/ldap-authorization.md %})
