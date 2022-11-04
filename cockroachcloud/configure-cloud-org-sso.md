---
title: Configure Cloud Organization Single Sign-On (SSO)
summary: Learn how to configure single Cloud Organization Single Sign-On (SSO) for your CockroachDB Cloud organization.
toc: true
docs_area: manage
---

{% include_cached feature-phases/preview-opt-in.md %}

{% include_cached cockroachcloud/sso-intro.md %}

This page describes how to enable [Cloud Organization SSO](cloud-org-sso.html) and manage your SSO configuration.

## Plan to enable Cloud Organization SSO

To ensure a smooth migration to Cloud Organization SSO, review the following information before you enable the feature.

{{site.data.alerts.callout_info}}
After it is enabled, Cloud Organization SSO **cannot** be disabled. To configure Cloud Organization SSO to behave like [Basic SSO](cloud-org-sso.html#basic-sso), refer to [Emulate Basic SSO](#emulate-basic-sso).
{{site.data.alerts.end}}

### Decide your custom URL

When you [enable Cloud Organization SSO](#enable-cloud-organization-sso), you will configure a custom URL through which your members can access {{ site.data.products.db }}. After the feature is enabled, your members must use that page to sign in. Your custom URL must be unique within {{ site.data.products.db }}. **Communicate this custom URL to your members ahead of time.**

To change your custom URL after enabling Cloud Organization SSO, contact your account team.

### Decide which authentication methods to enable

All enabled authentication methods appear on your custom URL and are available to your members. By default, when you enable Cloud Organization SSO, the following authentication methods are enabled by default:

- Password
- GitHub
- Google
- Microsoft

In addition, you can create authentication methods that connect to your identity provider using the [Security Access Markup Language (SAML)](https://en.wikipedia.org/wiki/Security_Assertion_Markup_Language) and [OpenID Connect (OIDC)](https://openid.net/connect/) identity protocols.

Members are identified by their email address. To allow members to migrate from password authentication to SSO, ensure that their email addresses in your {{ site.data.products.db }} organization match those in your identity providers. To allow your members to select from multiple SSO authentication methods, ensure that the email addresses match across all of them.

### Communicate to your members

Before you enable Cloud Organization SSO, notify your members about what to expect, such as:

- The custom login URL and when they should begin using it.
- Which authentication methods they can use and whether they have autoprovisioning enabled.
- Some members may need to be re-added to your organization:
  - All members of your {{ site.data.products.db }} organization who were using [Basic SSO](cloud-org-sso.html#basic-sso) rather than an email and password must sign in again to regain access to your organization. After signing in, members retain the same access they had before the migration.
  - Members who are also members of other organizations must be re-added to your organization. If they sign in using an authentication method with [autoprovisioning](#autoprovisioning) enabled, they are automatically added upon successful sign-in. Otherwise, they must be re-invited. If they previously had the [console admin](console-access-management.html#console-admin) role, it must be granted to them again.

During enablement of the feature, a list of affected members is shown, and those members are also notified individually.

## Enable Cloud Organization SSO

To enable Cloud Organization SSO:

1. Log in to [{{ site.data.products.db }} Console](https://cockroachlabs.cloud) as a [console admin](console-access-management.html#console-admin).
1. Go to **Organization** > **Authentication**.
1. Next to **Enable Authentication**, click **Enable**.
1. In the dialog, configure the custom URL your members will use to sign in. This value must be unique across {{ site.data.products.db }}. For more details, refer to [Update the custom URL](#update-the-custom-url).

      {{site.data.alerts.callout_info}}
      If you previously updated the custom URL from **Organization** > **Authentication** but did not enable Cloud Organization SSO, you are not prompted to configure it again. The value you have already configured is automatically used during enablement. To edit the custom URL again, click **Back** in the dialog.
      {{site.data.alerts.end}}

      Click **Next**

1. The list of default authentication methods displays. By default, **Password**, **GitHub**, **Google**, and **Microsoft** are enabled.

     To configure an authentication method, click its name and fill in the details. You can also do this later. Refer to [Configure advanced settings](#configure-advanced-settings).
     To disable an authentication method, click **Disable**. You can also do this later.

      {{site.data.alerts.callout_danger}}
      If you disable password authentication, members can no longer authenticate to [{{ site.data.products.db }} Console](https://cockroachlabs.cloud) using the passwords that were  previously stored for them, and those passwords are not retained. Cockroach Labs recommends that you thoroughly test each SSO authentication method that you enable before disabling password authentication.
      {{site.data.alerts.end}}

     Click **Next**.

1. Select **Confirm**, then click **Enable**.

Cloud Organization SSO is enabled, and members can sign in by using the custom URL and selecting any enabled authentication method.

## Update the custom URL

After you enable Cloud Organization SSO, your members sign in at a custom URL that exposes only the authentication methods that you enable, rather than the public sign-in URL at `https://cockroachlabs.cloud`.

To update the custom URL after Cloud Organization SSO is enabled, contact your account team.

## Enable or disable an authentication method

When you enable an authentication method, members can begin authenticating to {{ site.data.products.db }} using that authentication method. A member can log in using any enabled authentication method, as long as the email address for the member is the same across all enabled methods. When they successfully sign in with a new authentication method for the first time, they have the option to update their default authentication method. You can optionally [configure advanced settings](#configure-advanced-settings) for each enabled authentication method.

When you disable an authentication method, members who are no longer associated with the other enabled authentication method(s) can no longer sign in and must be provisioned in an identity provider that is associated with one of those other enabled methods.

When you enable or disable an authentication method, a notification is displayed with a list of members who must sign in with a different authentication method to regain access. Each affected member also receives an email notification prompting them to sign in again.

To enable or disable an authentication method:

1. Log in to [{{ site.data.products.db }} Console](https://cockroachlabs.cloud) as a [console admin](console-access-management.html#console-admin).
1. Go to **Organization** > **Authentication**.
1. To configure an authentication method, click its name.
1. To enable or disable the authentication method, toggle **Enable**.
1. If desired, configure [advanced settings](#configure-advanced-settings) for the authentication method.
1. Click **Save**.

## Configure advanced settings

The following sections describe the advanced settings you can configure for an SSO authentication method. To configure an authentication method:

1. Log in to [{{ site.data.products.db }} Console](https://cockroachlabs.cloud) as an organizational admin.
1. Go to **Organization** > **Authentication**.
1. To configure an authentication method, click its name.
1. At the top of the page, click **Edit**.
1. Click **Advanced Settings**.
1. Configure the advanced settings as desired.
1. Click **Save**.

### Allowed email domains

By default, members can access your {{ site.data.products.db }} organization from any email domain. To restrict access to a specific list of email domains:

1. Log in to [{{ site.data.products.db }} Console](https://cockroachlabs.cloud) as a [console admin](console-access-management.html#console-admin).
1. Go to **Organization** > **Authentication**.
1. To configure an authentication method, click its name.
1. At the top of the page, click **Edit**.
1. Set **Allowed Email Domains** to a comma-separated list of email domains. Each domain should begin with a `@`. To ensure that you are not locked out of {{ site.data.products.db }} while you are configuring Cloud Organization SSO, be sure to allow access to the email domain that you use to sign in.
1. Click **Save**.

### Autoprovisioning

By default, autoprovisioning is disabled. In order to log in to {{ site.data.products.db }} using SSO without autoprovisioning:

- A member's email address must exist in the SSO IdP.
- A [console admin](console-access-management.html#console-admin) must have already invited the member to the {{ site.data.products.db }} organization.

Autoprovisioning allows members to access your organization without an invitation. Members are assigned the [Developer role](/docs/cockroachcloud/console-access-management.html#developer) by default. If you enable autoprovisioning, Cockroach Labs recommends that you also limit the [allowed email domains](#allowed-email-domains) for the authentication method.

To enable autoprovisioning for an SSO authentication method:

1. Log in to [{{ site.data.products.db }} Console](https://cockroachlabs.cloud) as a [console admin](console-access-management.html#console-admin).
1. Go to **Organization** > **Authentication**.
1. Click the name of an authentication method.
1. Click **Advanced Settings**.
1. Next to **Autoprovisioning**, click **Enable**.

## Add a custom authentication method

You can add a custom authentication method to connect to any IdP that supports [Security Access Markup Language (SAML)](https://en.wikipedia.org/wiki/Security_Assertion_Markup_Language) or [OpenID Connect (OIDC)](https://openid.net/connect/).

### OIDC

To configure a custom OIDC authentication method:

1. Log in to your IdP and gather the following information, which you will use to configure {{ site.data.products.db }} SSO:<ul><li>Issuer URL</li><li>Client ID</li><li>Client secret</li><li>Callback URL</li></ul>
1. In a separate browser, log in to [{{ site.data.products.db }} Console](https://cockroachlabs.cloud) as a [console admin](console-access-management.html#console-admin).
1. Go to **Organization** > **Authentication**.
1. Next to **Authentication Methods**, click **Add**.
1. Set **Configuration** to **OIDC (OpenID Connect)**.
1. Set **Provider Name** to a display name for the connection.
1. Click **Next**.
1. The **Provider Details** page displays.
1. To edit the connection, click **Edit**.
1. Paste the values from your IdP for the **Issuer URL**, **Client ID**, **Client Secret**, and **Callback URL**.
1. Click **Save**.
1. The authentication method has been added but is disabled. To enable it, toggle **Enable**.
1. Click **Test**. If errors are shown, edit the configuration to fix the problems and try again.
1. Optionally, [configure advanced settings](#configure-advanced-settings) for the new authentication method.

### SAML

To configure a custom SAML authentication method:

1. Log in to your IdP and gather the following information, which you will use to configure {{ site.data.products.db }} SSO:<ul><li>Sign-in URL</li><li>Signing certificate</li></ul>
1. In a separate browser, log in to [{{ site.data.products.db }} Console](https://cockroachlabs.cloud) as a [console admin](console-access-management.html#console-admin).
1. Go to **Organization** > **Authentication**.
1. Next to **Authentication Methods**, click **Add**.
1. Set **Configuration** to **SAML**.
1. Set **Provider Name** to a display name for the connection.
1. Click **Next**.
1. The **Provider Details** page displays.
1. To edit the connection, click **Edit**.
1. Set **Sign-in URL** to the sign-in URL from your IdP.
1. Next to **Signing Certificate**, paste the entire certificate from your IdP, including the lines `-begin certificate-` and `-end certificate`.
1. Click **Save**.
1. Click **Test**. If errors are shown, edit the configuration to fix the problems and try again.
1. Optionally, [configure advanced settings](#configure-advanced-settings) for the new authentication method.
1. Download metadata required by your IdP. Click **Download**. Open the file and make a note of the following values:<ul><li><b>Entity ID</b>: The <code>entityID</code> attribute of the <code>&lt;EntityDescriptor&gt;</code> tag.</li><li><b>Login URL</b>:<code>The <code>location</code> attribute of the <code>&lt;AssertionConsumerService&gt;</code> tag.</li></ul>
1. In the browser where you are logged in to your IdP, update the authentication configuration to use the Entity ID and Login URL from the metadata file.
1. Configure the SAML assertions that your IdP sends to {{ site.data.products.db }}. Your IdP must send an assertion with a `name` field and a second assertion with an `email` field, each mapped to the relevant fields in your IdP. Refer to the documentation for your IdP.

## Require SSO

To begin enforcing a requirement to sign in using SSO:

1. [Enable Cloud Organization SSO](#enable-cloud-organization-sso).
1. [Disable SSO authentication methods](#enable-or-disable-an-authentication-method) that you don't need and optionally [configure advanced settings](#configure-advanced-settings) for those that are enabled.
1. After thorough testing, [disable email authentication](#enable-or-disable-an-authentication-method).

## Emulate Basic SSO

After Cloud Organization SSO is enabled, it cannot be disabled. To emulate the behavior of Basic SSO:

1. Enable the following authentication methods:
      - Password
      - GitHub
      - Google
      - Microsoft
1. For GitHub, Google, and Microsoft authentication methods, allow all email domains and disable autoprovisioning.

Members must still sign in using your organization's custom URL.

## What's next?

- Read the [Cloud Org SSO Frequently Asked Questions](cloud-org-sso.html#frequently-asked-questions-faq).
- Learn more about [authenticating to {{ site.data.products.db }}](authentication.html).
