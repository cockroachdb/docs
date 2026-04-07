---
title: Multi-Factor Authentication for the CockroachDB Cloud Console
summary: Secure CockroachDB Cloud Console access with multi-factor authentication
toc: true
docs_area: manage.security
cloud: true
---

Multi-Factor Authentication (MFA) adds an additional layer of security to CockroachDB {{ site.data.products.cloud }} Console access by requiring users to provide a second form of verification to log in.

CockroachDB {{ site.data.products.cloud }} Console supports MFA through different mechanisms depending on how your organization authenticates users:

## MFA through an identity provider (recommended)

When accessing the CockroachDB {{ site.data.products.cloud }} Console through Google, Microsoft, GitHub, or a custom [Cloud Organization SSO]({% link cockroachcloud/cloud-org-sso.md %}#cloud-organization-sso) authentication method, MFA is managed at the identity provider (IdP) level. This is the **recommended approach** for the majority of users in your organization.

With this approach:

- The IdP manages MFA policies and enrollment for all SSO users
- Users authenticate through your IdP's MFA flow (push notifications, TOTP codes, biometrics, etc.)
- CockroachDB {{ site.data.products.cloud }} Console inherits the MFA protection from your IdP

Refer to your IdP's documentation for configuring MFA.

## Native CockroachDB Cloud MFA for password-based access

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

{% include_cached new-in.html version="v26.2" %} While Cockroach Labs recommends SSO for CockroachDB {{ site.data.products.cloud }} Console access, organizations commonly retain password-based accounts as a failsafe when SSO is unavailable. To ensure that these remaining password-based accounts are well-protected, you can enable Cockroach {{ site.data.products.cloud }}'s native MFA feature for password-based access:

- All users who authenticate with a password (rather than SSO) must enroll in Time-based One-Time Password (TOTP) authentication
- Users scan a QR code with a standard authenticator app (Google Authenticator, Authy, 1Password, Microsoft Authenticator, etc.)
- At each login, password users must enter their TOTP code in addition to their password
- Users receive recovery codes for account recovery if they lose access to their authenticator app

Only organizations that have [enabled Cloud Organization SSO]({% link cockroachcloud/configure-cloud-org-sso.md %}#enable-cloud-organization-sso) can set up MFA for these password-based accounts.

Organization Admins can [enforce MFA usage for all password-based accounts](#enable-mfa-enforcement-for-all-password-based-accounts), which ensures account security across the organization.

### Set up MFA for a password-based account

You can increase the security of password-based access to the CockroachDB {{ site.data.products.cloud }} Console by setting up MFA for your account. This feature is specific to password-based access. MFA for [SSO users]({% link cockroachcloud/cloud-org-sso.md %}#cloud-organization-sso) is managed directly by the identity provider.

Organization Admins can initiate MFA setup for their own accounts when they [enable MFA enforcement](#enable-mfa-enforcement-for-all-password-based-accounts). All users will be required to initiate MFA setup upon attempting to log in after MFA enforcement has been enabled by an Organization Admin:

1. A 6-digit verification code will be sent to the email associated with the account. Enter the code then click **Verify & Continue**.
1. Scan the QR code using an authenticator app. You will receive another 6-digit code via the app. Enter the code then click **Verify & Continue**.
1. You will be given several recovery codes, to use [in case you lose access to your authenticator app](#recover-your-account). Store them in a safe place, as the codes will not be shown again. Check the box indicating that you have saved the codes, then click **Complete setup**.

The account associated with this email address will now need to [use MFA when logging in](#log-in-using-mfa-for-a-password-based-account) with username and password.

For organizations that have enabled [Cloud Organization SSO]({% link cockroachcloud/cloud-org-sso.md %}#cloud-organization-sso), Organization Admins can [enforce MFA usage for all password-based accounts](#enable-mfa-enforcement-for-all-password-based-accounts).

### Log in using MFA for a password-based account

Users who have [set up MFA](#set-up-mfa-for-a-password-based-account) must provide a second authentication factor every time they log in to the CockroachDB {{ site.data.products.cloud }} Console with a password.

To log in with MFA enabled:

1. Go to the [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud).
1. Enter your email address and password, then click **Continue**.
1. When prompted for MFA verification, enter the 6-digit TOTP code from your authenticator app, then click **Verify**.

        Alternatively, if you don't have access to your authenticator app, click **Use a recovery code instead** and enter one of the recovery codes that you stored during [MFA setup](#set-up-mfa-for-a-password-based-account). If you've lost access to your recovery codes, refer to [Recover your account](#recover-your-account).

MFA verification is required once per session. You won't be prompted again until your session expires or you log out.

### Enable MFA enforcement for all password-based accounts

Organization Admins can require password-based users to use MFA to access the CockroachDB {{ site.data.products.cloud }} Console.

Before you can enforce MFA, you must have [Cloud Organization SSO]({% link cockroachcloud/cloud-org-sso.md %}#cloud-organization-sso) enabled for your organization. First make a [plan to enable Cloud Organization SSO]({% link cockroachcloud/configure-cloud-org-sso.md %}#plan-to-enable-cloud-organization-sso), then [enable Cloud Organization SSO]({% link cockroachcloud/configure-cloud-org-sso.md %}#enable-cloud-organization-sso).

1. Log in to the [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud) as a user with the [Organization Admin]({% link cockroachcloud/authorization.md %}#organization-admin) role.
1. Go to **Organization** > **Authentication**.
1. Under **Authentication Methods**, click on the **Username and Password** method.
1. If you have not yet enabled [Cloud Organization SSO]({% link cockroachcloud/cloud-org-sso.md %}#cloud-organization-sso), you will be prompted to do so.
1. At least one Organization Admin must enable MFA on their own account before MFA enforcement can be enabled for all users. If no Organization Admins have enabled MFA, you will be prompted to do so:
    1. Click **Set up Multi-Factor Authentication on your account**.
    1. Read the information on the **Enable MFA enforcement** modal, then click **Set up MFA**.
    1. [Set up MFA for your account](#set-up-mfa-for-a-password-based-account).
1. The **Multi-Factor Authentication Enforcement** toggle will switch on once you've set up MFA for your own account. An Organization Admin can toggle this setting on and off.

Once enabled, all password-based users will be required to [enroll in MFA](#set-up-mfa-for-a-password-based-account) at their next login. 

Note that this does not enforce MFA for users who log in via SSO or social credentials. MFA enforcement for those users is handled by the respective SSO or social platform.

### Reset a user's MFA

TODO

### Recover your account

During [MFA setup](#set-up-mfa-for-a-password-based-account), the user receives several recovery codes that they should store in a safe place. If the user loses access to their authenticator app, they can instead [log in using one of those codes](#log-in-using-mfa-for-a-password-based-account).

A user might lose access to both their authenticator app and recovery codes. The account recovery process depends on their [role]({% link cockroachcloud/authorization.md %}):

- **Regular users**: Contact an [Organization Admin]({% link cockroachcloud/authorization.md %}#organization-admin). The Admin can [reset your MFA](#reset-a-users-mfa) via the dashboard, which will require you to re-enroll at your next login.

- **Organization Admin**: Contact another Organization Admin in your organization. The other Admin can [reset your MFA](#reset-a-users-mfa) via the dashboard, which will require you to re-enroll at your next login. 

If every Organization Admin has been locked out, contact [CockroachDB Support](https://support.cockroachlabs.com). Support will perform a multi-signal identity verification process before manually resetting your MFA. You will be required to re-enroll at your next login.

## See also

- [Single Sign-On (SSO) for CockroachDB Cloud organizations]({% link cockroachcloud/cloud-org-sso.md %})
- [Configure Cloud Organization SSO]({% link cockroachcloud/configure-cloud-org-sso.md %})
- [Require SSO]({% link cockroachcloud/configure-cloud-org-sso.md %}#require-sso)
- [Manage Users, Roles, and Service Accounts]({% link cockroachcloud/managing-access.md %})
- [Authentication on CockroachDB Cloud]({% link cockroachcloud/authentication.md %})
