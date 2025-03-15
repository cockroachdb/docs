---
title: Cluster Single Sign-on (SSO) using JSON Web Tokens (JWTs)
summary: Overview of Cluster Single Sign-on (SSO) for CockroachDB self-hosted clusters, review of authenticating users, configuring required cluster settings.
toc: true
docs_area: manage
---

CockroachDB clusters allow users to authenticate with Single Sign-on (SSO), both to the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}), and for SQL client access.

Cluster single sign-on (SSO) enables users to access the SQL interface of a CockroachDB cluster (whether provisioned on CockroachDB {{ site.data.products.cloud }} or {{ site.data.products.core }}) with the full security of single sign-on (SSO), and the choice of a variety of cloud-based or customer-managed identity providers (IdPs).

{{ site.data.products.advanced }} clusters can provision their users with Java Web Tokens (JWTs) via the DB Console. This allows users to authenticate to a cluster by signing in to their IdP (for example, Okta or Google) with a link embedded in the DB Console. This flow provisions a JWT that a user can copy out of the DB Console UI and use in a SQL connection string to authenticate to the cluster.

{{site.data.alerts.callout_info}}
Cluster single sign-on for the DB Console is supported on CockroachDB [{{ site.data.products.enterprise }}]({% link {{ page.version.version }}/licensing-faqs.md %}#types-of-licenses) and {{ site.data.products.advanced }} clusters. CockroachDB {{ site.data.products.standard }} and {{ site.data.products.basic }} clusters do not support cluster single sign-on and do not have access to the DB Console. However, both CockroachDB {{ site.data.products.standard }} and CockroachDB {{ site.data.products.basic }} clusters can use [Cluster Single Sign-on (SSO) to authenticate to the `ccloud` command-line interface and to the CockroachDB {{ site.data.products.cloud }} Console]({% link cockroachcloud/cloud-sso-sql.md %}).
{{site.data.alerts.end}}

The page describes how to configure a cluster for cluster single sign-on using JWTs and then how users can authenticate using the JWTs. If you're a user ready to sign in to the DB Console with JWTs, you can skip the configuration section:

- [Configure a cluster for cluster single sign-on using JWTs](#configure-your-cluster-for-sso)
- [Authenticate to your cluster](#authenticate-to-your-cluster)

**Prerequisites**

- You must have your cluster pre-configured for OIDC/SSO authentication for DB Console. Use the [Single Sign-on (SSO) for DB Console]({% link {{ page.version.version }}/sso-db-console.md %}) guide to set this up.

- SQL users/credentials:

    - You must have the ability to update your cluster settings, which can be achieved in several ways. Refer to [`SET CLUSTER SETTING`: Required permissions]({% link {{ page.version.version }}/set-cluster-setting.md %}#required-privileges)
.
    - A SQL user that corresponds with your external identity must be pre-provisioned on the cluster. To provision such users, you must have access to the [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role).

## Configure your cluster for SSO

### Cluster Settings

You must configure the [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}) in the following table to enable JWT authentication to your cluster. Refer to the [Update your cluster settings](#update-your-cluster-settings) section to configure your cluster settings.

| Cluster Setting | Description
|-----------------|------
| `server.jwt_authentication.enabled` | Defaults to `false`, must be set to `true` to enable embedded JWT generation.
| `server.jwt_authentication.jwks` | A list of public signing keys for allowed IdPs; must include your IdP's key. If `server.jwt_authentication.jwks_auto_fetch.enabled` is `true`, there is no need to set `server.jwt_authentication.jwks`.
| `server.jwt_authentication.jwks_auto_fetch.enabled` | If `true`, public signing keys are automatically fetched from the issuer and there is no need to set `server.jwt_authentication.jwks`. Defaults to `false`.
| `server.jwt_authentication.issuers` | A list of accepted token issuers; must include your IdP.
| `server.jwt_authentication.audience` | This must match `server.oidc_authentication.client_id`; refer to [Single Sign-on (SSO) for DB Console](sso-db-console.html).
| `server.jwt_authentication.claim` | Which JWT field will be used to determine the user identity in CockroachDB; normally set either to `email`, or `sub` (subject).
| `server.oidc_authentication.generate_cluster_sso_token.enabled` | Enables token generation; must be set to `true`.
|`server.oidc_authentication.generate_cluster_sso_token.use_token`| Selects which part of the received OIDC credentials to display.
|`server.identity_map.configuration`| Takes an [Identity Map configuration](#identity-map-configuration).
| `server.oidc_authentication.generate_cluster_sso_token.sql_host` | This display value informs users the host for their SQL connections. Default: `localhost`.
| `server.oidc_authentication.generate_cluster_sso_token.sql_port` | This display value informs users the port for their SQL connections. Default: `26257`.

### Update your cluster settings

{{site.data.alerts.callout_success}}
In order for this feature to work, [Single Sign-on (SSO) for DB Console]({% link {{ page.version.version }}/sso-db-console.md %}) and cluster SSO must both be configured with the same IdP.
{{site.data.alerts.end}}

You can update your cluster settings with the [`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %}) SQL statement.

{{site.data.alerts.callout_success}}
You can also view all of your cluster settings in the DB Console.
{{site.data.alerts.end}}

1. `enable` JWT SQL authentication to your cluster.

    {% include_cached copy-clipboard.html %}
    ~~~sql
    SET CLUSTER SETTING server.jwt_authentication.enabled = true;
    ~~~

1. Add your IdP's formal `issuer` name (this must match the `iss` field in the JWT itself) to your cluster's list of accepted token issuers.


    This must match your cluster's configured value for `server.oidc_authentication.provider_url`. Refer to [Single Sign-on (SSO) for DB Console]({% link {{ page.version.version }}/sso-db-console.md %}#cluster-settings). Issuers are expected to publish their configuration at `https://{ domain }/.well-known/openid-configuration`. For example:

        - CockroachDB {{ site.data.products.cloud }}'s IdP configuration can be viewed publicly at: `https://cockroachlabs.cloud/.well-known/openid-configuration`.
        The `issuer` is `https://cockroachlabs.cloud`.

        - For Google Cloud Platform, the `openid-configuration` can be found at `https://accounts.google.com/.well-known/openid-configuration`. The `issuer` is `https://accounts.google.com`.

    {% include_cached copy-clipboard.html %}
    ~~~sql
    SET CLUSTER SETTING server.jwt_authentication.issuers = 'https://accounts.google.com';
    ~~~

1. `server.jwt_authentication.audience`

    The ID of your cluster as specified by the IdP, or a JSON array of such names. This must match `server.oidc_authentication.client_id`; refer to [Single Sign-on (SSO) for DB Console]({% link {{ page.version.version }}/sso-db-console.md %}).

    {{site.data.alerts.callout_danger}}
    Many third-party token issuers, including GCP and Azure, will by default create tokens with a generic default audience. It is best practice to limit the scope of access tokens as much as possible, so if possible, we recommend issuing tokens with only the required audience value corresponding to the `audience` configured on the cluster.

    By extension, if your provider allows you to specify scopes or permissions on the token, you should specify these as restrictively as possible, while still allowing for the functions intended for the service account or user.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~sql
    SET CLUSTER SETTING server.jwt_authentication.audience = '984901724939-njig7lkv7k724rbv2hllvr4of8ul7th7.apps.googleusercontent.com';
    ~~~

1. `server.jwt_authentication.claim`
    This setting determines which field in the JWT your cluster will use to the identity to a SQL user. The value of `email` indicates the email field in the JWT.

    {% include_cached copy-clipboard.html %}
    ~~~sql
    SET CLUSTER SETTING server.jwt_authentication.claim = 'email';
    ~~~

1. `server.jwt_authentication.jwks`

    Add your IdP's public signing key to your cluster's list of accepted signing JSON web keys (JWKS), under the `jwks` setting. This is a [JWK](https://www.rfc-editor.org/rfc/rfc7517) formatted single key or key set, containing the public keys for SSO token issuers/IdPs that will be accepted by your cluster. This list must include a given IdP, or the cluster will reject JWTs issued by it. IdPs serve their public certificates and other required information at `https://{ domain }/.well-known/openid-configuration`.

    IdPs such as Google rotate their signing keys periodically. You must update your cluster with a new signing key before the previous one expires, or your SQL clients will be unable to connect with cluster SSO. **We recommend updating this cluster setting with the current key daily to avoid this scenario.** Alternatively, you can enable `server.jwt_authentication.jwks_auto_fetch.enabled` to automatically fetch signing keys from the issuer instead of maintaining a static list of signing keys. If `server.jwt_authentication.jwks_auto_fetch.enabled` is enabled, then `server.jwt_authentication.jwks` is ignored.

    <b>CockroachDB {{ site.data.products.advanced }}:</b>

    By default, your cluster's configuration will contain the CockroachDB {{ site.data.products.cloud }}'s own public key, allowing CockroachDB {{ site.data.products.cloud }} to serve as an IdP. This is required for [SSO with `ccloud`]({% link cockroachcloud/cloud-sso-sql.md %}). When modifying this cluster setting, you must include the CockroachDB {{ site.data.products.cloud }} public key in the key set, or SSO with `ccloud` will no longer work.

    The public key for {{ site.data.products.db }} can be found at `https://cockroachlabs.cloud/.well-known/openid-configuration`.

    For example:

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

    {% include_cached copy-clipboard.html %}
    ~~~sql
    SET CLUSTER SETTING server.jwt_authentication.jwks = '{
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
    }';
    ~~~

1. Instead of setting `server.jwt_authentication.jwks` to a list of static signing keys, you can set `server.server.jwt_authentication.jwks_auto_fetch.enabled` to `true` to enable automatic fetching of signing keys for the issuers specified in `server.jwt_authentication.issuers`. Signing keys are fetched from the issuer's`https://{ domain }/.well-known/openid-configuration` endpoint.

1. Set your Identity Map. Refer to [Identity Map configuration](#identity-map-configuration).

    {% include_cached copy-clipboard.html %}
    ~~~sql
    SET CLUSTER SETTING server.identity_map.configuration = 'https://accounts.google.com /^(.*)@cockroachlabs\.com$ \1'  ;
    ~~~

1. Enable token generation.

    This will also cause the token generation button to appear in the UI.

    {% include_cached copy-clipboard.html %}
    ~~~sql
    SET CLUSTER SETTING server.oidc_authentication.generate_cluster_sso_token.enabled = true;
    ~~~

1. Set `use_token`, which determines how the user's identity will be displayed.

    It can be set to either `id_token` or `access_token`, depending on the structure of the your JWT as determined in your IDP configuration.

    {% include_cached copy-clipboard.html %}
    ~~~sql
    SET CLUSTER SETTING server.oidc_authentication.generate_cluster_sso_token.use_token = id_token;
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

## Authenticate to your cluster

Once ConsoleDB SSO and Cluster SSO with JWTs are enabled and your cluster is [properly configured](#) (including mapping authorized external users to SQL roles), users can self-provision auth tokens through a sign-in flow embedded in the DB Console. These tokens (JWTs) are intended as short-lived credentials, and although their expiry depends on the IdP configuration, it is usually 1 hour.

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
