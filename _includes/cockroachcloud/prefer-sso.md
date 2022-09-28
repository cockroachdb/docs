    {{site.data.alerts.callout_info}}
    We recommend that {{ site.data.products.db }} Console users log in with [Single Sign-On (SSO)](cloud-org-sso.html), with two-factor authentication (2FA) enabled for the SSO provider. This prevents potential attackers from using stolen credentials to accesss or tamper with your critical data.

    {{ site.data.products.db }} [Basic SSO](/docs/cockroachcloud/cloud-org-sso.html#basic-sso) supports SSO with GitHub, Google, and Microsoft. [Cloud Organization SSO](/docs/cockroachcloud/cloud-org-sso.html#cloud-organization-sso) provides additional configuration and flexibility, and includes support for OIDC or SAML protocols, autoprovisioning, limiting the email domains that can use a given authentication method.

    Visit your {{ site.data.products.db }} Console's [account settings page](https://cockroachlabs.cloud/account/profile) and switch to SSO to improve the security of your cluster.
    {{site.data.alerts.end}}
