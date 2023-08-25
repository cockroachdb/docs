Single Sign-On (SSO) allows members of your CockroachDB {{ site.data.products.cloud }} organization to authenticate using an identity from an identity provider (IdP) instead of using an email address and password.

[Basic SSO]({% link cockroachcloud/cloud-org-sso.md %}#basic-sso) is enabled by default for each CockroachDB {{ site.data.products.cloud }} organization. members can authenticate to [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud) with any GitHub, Google, or Microsoft identity or with a password.

[Cloud Organization SSO]({% link cockroachcloud/cloud-org-sso.md %}#cloud-organization-sso) lets users sign in at a custom login page unique to your organization, and provides additional customization and capabilities to help your organization meet its security and compliance requirements.

Cloud Organization SSO supports autoprovisioning, allows you to restrict the email addresses that can log in using a given method, and allows you to connect to your identity provider (IdP) using the [Security Access Markup Language (SAML)](https://wikipedia.org/wiki/Security_Assertion_Markup_Language) and [OpenID Connect (OIDC)](https://openid.net/connect/) identity protocols.

{{site.data.alerts.callout_success}}
If you sign in using a URL other than [https://cockroachlabs.cloud](https://cockroachlabs.cloud), Cloud Organization SSO is already enabled for your organization.
{{site.data.alerts.end}}
