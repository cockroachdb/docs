Single Sign-On (SSO) allows members of your {{ site.data.products.db }} organization to authenticate using an identity from an identity provider (IdP) instead of using an email address and password.

[Basic SSO](cloud-org-sso.html#basic-sso) is enabled by default for each {{ site.data.products.db }} organization. members can authenticate to [{{ site.data.products.db }} Console](https://cockroachlabs.cloud) with any GitHub, Google, or Microsoft identity or with a password.

[Cloud Organization SSO](cloud-org-sso.html#cloud-organization-sso) lets users sign in at a custom login page unique to your organization, and provides additional customization and capabilities to help your organization meet its security and compliance requirements. For example, it supports autoprovisioning, allows you to restrict the email addresses that can log in using a given method, and allows you to connect to your identity provider (IdP) using the [Security Access Markup Language (SAML)](https://en.wikipedia.org/wiki/Security_Assertion_Markup_Language) and [OpenID Connect (OIDC)](https://openid.net/connect/) identity protocols.

{{site.data.alerts.callout_success}}
If you sign in using a URL other than [https://cockroachlabs.cloud](https://cockroachlabs.cloud), Cloud Organization SSO is already enabled for your organization.
{{site.data.alerts.end}}
