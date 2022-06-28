---
title: Managing Single Sign-On (SSO) for CockroachDB Cloud Dedicated
summary: Implement single sign-on (SSO) for DB Console access.
toc: true
docs_area: manage
---

This page covers the management and configuration of [Single Sign-On (SSO) for {{ site.data.products.db }}](cloud-sso.html)

{{site.data.alerts.callout_info}}
Sign-On (SSO) for {{ site.data.products.dedicated }} is currently in **Private Preview**. Contact your {{ site.data.products.dedicated }} account team or file a support ticket for more information.
{{site.data.alerts.end}}

## Enterprise SSO features

### Autoprovisioning

Org admins would be able to request auto-provisioning setup for their orgs. If enabled, an org admin could share the org-unique sign-in URL with their team members internally, after which new users could sign-up without needing an invite, by using one of the allowed login methods for that org.

### Support for [Security Access Markup Language (SAML)](https://en.wikipedia.org/wiki/Security_Assertion_Markup_Language) and [OpenID Connect (OIDC)](https://openid.net/connect/) identity protocols

Yada yada you can run your own thing.

### Enhanced configuration options

Org admins would be able to request enabling / disabling specific login methods for their orgs. E.g., a customer may just want Okta SAML and Google based authentication to work in their org, while user-pass, Github, Microsoft etc. should be disabled. Another customer may just want Azure Active Directory (OIDC) and user-pass to work for their org, while disabling others. Only the enabled login methods will be visible on the org-unique sign-in URL.

## How to enable Enterprise SSO for {{ site.data.products.dedicated }}

- Customer name

- CC Organization Id

- Do they need auto-provisioning? [Yes / No]

- Specific login methods to enable (any not mentioned here will be disabled)

- Identity provider to setup [Okta / Active Directory / Azure Active Directory / Onelogin / Other]

- If SAML, provide either:

- The customer IDP metadata XML file

- OR all of the following fields:

	- Sign in URL

	- Signing certificate

- If OIDC, provide the following values:

	- Issuer URL (ends with .well-known/openid-configuration)

	- Client ID

	- Client Secret

		If the customer prefers using a frontend channel, then this value won’t be needed

		This value should be treated as moderately sensitive and so should be passed to the Identity team via OnePassword

{{site.data.alerts.callout_success}}
Initial response to the ticket will have a 2 business days SLA. After SSO Enterprise is enabled, the support team will reach out to again to finalize and confirm the setup.
{{site.data.alerts.end}}
