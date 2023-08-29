    {{site.data.alerts.callout_info}}
    We recommend that CockroachDB {{ site.data.products.cloud }} Console users log in with [Single Sign-On (SSO)]({% link cockroachcloud/cloud-org-sso.md %}), optionally with two-factor authentication (2FA) enabled for the SSO provider. This prevents potential attackers from using stolen credentials to access or tamper with your critical data.

    CockroachDB {{ site.data.products.cloud }} [Basic SSO]({% link cockroachcloud/cloud-org-sso.md %}#basic-sso) supports SSO with GitHub, Google, and Microsoft. [Cloud Organization SSO]({% link cockroachcloud/cloud-org-sso.md %}#cloud-organization-sso) provides additional configuration and flexibility, and includes support for OIDC or SAML protocols, autoprovisioning, and limiting the email domains that can use a given authentication method.

    Visit your CockroachDB {{ site.data.products.cloud }} Console's [account settings page](https://cockroachlabs.cloud/account/profile) and switch to SSO to improve the security of your cluster.
    {{site.data.alerts.end}}
