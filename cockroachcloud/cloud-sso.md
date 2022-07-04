---
title: Single Sign-On (SSO) for CockroachDB Cloud
summary: Learn about SSO Authentication for the {{ site.data.products.db }} Console
toc: true
docs_area: manage
---

Users may authenticate to the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud) using Single Sign-On (SSO). GitHub, Google, and Microsoft are currently supported as identity providers (IdPs).

[Enterprise authentication features](#private-preview-enterprise-authentication) are currently available in Private Preview. File a [support ticket](https://support.cockroachlabs.com/) to enquire about the Enterprise Authentication for Cloud SSO Private Preview.

Authentication with a centralized identity managed by a dedicated IdP offers several security advantages:

- All supported SSO providers (Google, Microsoft, and GitHub) support multi-factor authentication (MFA).
- Administrators avoid responsibility for managing an additional set of credentials and tying those to other identities and credentials. Every additional credential or identity management operation introduces risk as well as costing effort, so minimizing these is doubly advantageous.
- Administrators can onboard and offboard users quickly and efficiently.

## Private Preview: Enterprise authentication

### Support for SAML and OIDC identity protocols

[Security Access Markup Language (SAML)](https://en.wikipedia.org/wiki/Security_Assertion_Markup_Language) and [OpenID Connect (OIDC)](https://openid.net/connect/) are identity protocols that allow applications and services to rely on identity providers (IdPs) for centralized authentication.

With support for SAML and OIDC, {{ site.data.products.db }} allows enterprise organizations to use a wide variety of self-hosted or SaaS enterprise IdP solutions, such as Okta, Active Directory, Onelogin, etc., to authenticate to the {{ site.data.products.db }} Console.

### Custom sign-in page

With this feature, customers get a unique and private sign-in URL for their {{ site.data.products.db }} organization, and will no longer use the [public sign-in URL](https://cockroachlabs.cloud).

### Extended configuration options

Enterprise authentication allows {{ site.data.products.db }} organization admins to configure a list of allowed and disallowed authentication methods.

Only enabled authentication methods are shown on the [custom sign-in page](#custom-sign-in-page).

### Auto-provisioning

This optional enterprise feature removes the need to invite users to your organization. When auto-provisioning is enabled, a {{ site.data.products.db }} account will be created automatically for your users when they sign in to the [custom sign-in page](#custom-sign-in-page) for the first time.

### How to enable enterprise authentication for {{ site.data.products.db }}

File a [support ticket](https://support.cockroachlabs.com/) to enquire about the enterprise authentication Private Preview.

{{site.data.alerts.callout_success}}
You should hear back from support within 2 business days.

After Enhanced SSO is enabled, the support team will reach out to again to finalize and confirm the setup.
{{site.data.alerts.end}}

## {{ site.data.products.db }} SSO Frequently Asked Questions (FAQ)

### Will it work if I try to sign in with SSO without explicitly setting it up for my account, if I already use an email from an SSO Provider (e.g., my-example-account@gmail.com)?

No, that won't work until you set up SSO for your account with that specific identity provider. Using an email associated with an SSO provider (Google, GitHub, or Microsoft) does not automatically enable SSO.

To change your SSO method to use that provider, visit **My Account** in the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud).

### Once I change my active login method to a new SSO provider, can I still sign in using my email/password combination or my GitHub identity?

No. Only one authentication method can be active for each {{ site.data.products.db }} Console user at a time. Visit **My Account** in the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud) to configure which authentication method is active.

### Does this change how administrators invite users?

At the moment, no. The [workflow for inviting team members](console-access-management.html#invite-team-members-to-cockroachdb-cloud) to {{ site.data.products.db }} remains the same.

### As an admin, how do I deprovision a user's access to {{ site.data.products.db }} Console if they leave the relevant project?

If a user is using SSO, deleting the user's identity at the level of the SSO provider (e.g., deleting their Google account), will remove their access to the {{ site.data.products.db }} organization.

To remove a user's access to {{ site.data.products.db }} without deleting their SSO identity, you can [remove their {{ site.data.products.db }} user identity from your org](console-access-management.html#delete-a-team-member) in the console.

### Can admins require a particular login method for their {{ site.data.products.db }} organization?

Currently, no.
