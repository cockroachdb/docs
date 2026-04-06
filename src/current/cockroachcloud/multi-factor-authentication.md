---
title: Multi-Factor Authentication for the Cloud Console
summary: Secure CockroachDB Cloud Console access with multi-factor authentication
toc: true
docs_area: manage.security
cloud: true
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

Multi-Factor Authentication (MFA) adds an additional layer of security to CockroachDB Cloud Console access by requiring users to provide a second form of verification beyond their password.

## Overview

CockroachDB Cloud Console supports MFA through different mechanisms depending on how your organization authenticates users:

### MFA at the Identity Provider (Recommended)

When you configure [Single Sign-On (SSO)](cloud-org-sso.html) for your organization, MFA is enforced at your Identity Provider (IdP) level—Okta, Microsoft Entra ID, Ping Identity, etc. This is the **recommended approach** for the majority of users in your organization.

With this approach:
- Your IdP manages MFA policies and enrollment for all SSO users
- Users authenticate through your IdP's MFA flow (push notifications, TOTP codes, biometrics, etc.)
- CockroachDB Cloud Console inherits the MFA protection from your IdP

Refer to your Identity Provider's documentation for configuring MFA.

### Native CockroachDB Cloud MFA for non-SSO users

{% include_cached new-in.html version="v26.2" %} Organizations that have SSO enabled can also enforce MFA for their remaining password-based accounts. This is primarily used for **break-glass accounts**—local admin accounts that exist outside the SSO provider as a failsafe when the SSO provider is unavailable.

When you enable the "Require MFA for non-SSO/Social users" setting:

- All users who authenticate with a password (rather than SSO) must enroll in Time-based One-Time Password (TOTP) authentication
- Users scan a QR code with a standard authenticator app (Google Authenticator, Authy, 1Password, Microsoft Authenticator, etc.)
- At each login, password users must enter their TOTP code in addition to their password
- Users receive recovery codes for account recovery if they lose access to their authenticator app

{{site.data.alerts.callout_info}}
**Prerequisite:** Native MFA enforcement is only available for organizations that have SSO configured. Organizations without SSO enabled cannot use this feature.
{{site.data.alerts.end}}

#### Enable native MFA enforcement

To enable native MFA enforcement for non-SSO users:

1. Navigate to your organization's **Authentication** settings in the CockroachDB Cloud Console.
1. Verify that SSO is configured for your organization.
1. Toggle **Require MFA for non-SSO/Social users** to **On**.
1. Complete your own MFA enrollment by scanning the QR code with your authenticator app and saving your recovery codes.

Once enabled, all non-SSO users will be required to enroll in MFA at their next login.

### Organizations without SSO

Organizations that have not configured SSO must rely on alternative methods for MFA:

- **Social login**: Users who authenticate with Google, GitHub, or Microsoft can enable MFA through their social provider's account settings.
- **Password-only accounts**: Users who authenticate with a password alone do not have MFA protection in CockroachDB Cloud. We strongly recommend configuring SSO to enable MFA for your organization.

## See also

- [Cloud Organization SSO](cloud-org-sso.html)
- [Authentication](authentication.html)
