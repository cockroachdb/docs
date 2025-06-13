---
title: Configure Cloud Organization SSO
summary: Learn how to configure single Cloud Organization Single Sign-On (SSO) for your CockroachDB Cloud organization.
toc: true
docs_area: manage
---

{% include_cached cockroachcloud/sso-intro.md %}

This page describes how to enable [Cloud Organization SSO]({% link cockroachcloud/cloud-org-sso.md %}) and manage your SSO configuration.

## Plan to enable Cloud Organization SSO

To ensure a smooth migration to Cloud Organization SSO, review the following information before you enable the feature.

{{site.data.alerts.callout_info}}
After it is enabled, Cloud Organization SSO **cannot** be disabled. To configure Cloud Organization SSO to behave like [Basic SSO]({% link cockroachcloud/cloud-org-sso.md %}#basic-sso), refer to [Emulate Basic SSO](#emulate-basic-sso).
{{site.data.alerts.end}}

### Decide your custom URL

When you [enable Cloud Organization SSO](#enable-cloud-organization-sso), you will configure a custom URL through which your members can access CockroachDB {{ site.data.products.cloud }}. After the feature is enabled, your members must use that page to sign in. Your custom URL must be unique within CockroachDB {{ site.data.products.cloud }}. **Communicate this custom URL to your members ahead of time.**

To change your custom URL after enabling Cloud Organization SSO, contact your account team.

### Decide which authentication methods to enable

All enabled authentication methods appear on your custom URL and are available to your members. By default, when you enable Cloud Organization SSO, the following authentication methods are enabled by default:

- Password
- GitHub
- Google
- Microsoft

In addition, you can create authentication methods that connect to your identity provider (IdP) using the [Security Access Markup Language (SAML)](https://wikipedia.org/wiki/Security_Assertion_Markup_Language), [System for Cross-Domain Identity Management SCIM](https://www.rfc-editor.org/rfc/rfc7644), and [OpenID Connect (OIDC)](https://openid.net/connect/) identity protocols.

Members are identified by their email address. To allow members to migrate from password authentication to SSO, ensure that their email addresses in your CockroachDB {{ site.data.products.cloud }} organization match those in your IdPs. To allow your members to select from multiple SSO authentication methods, ensure that the email addresses match across all of them.

### Communicate to your members

Before you enable Cloud Organization SSO, notify your members about what to expect, such as:

- The custom login URL and when they should begin using it.
- Which authentication methods they can use and whether they have autoprovisioning enabled.
- Some members may need to be re-added to your organization:
  - All members of your CockroachDB {{ site.data.products.cloud }} organization who were using [Basic SSO]({% link cockroachcloud/cloud-org-sso.md %}#basic-sso) rather than an email and password must sign in again to regain access to your organization. After signing in, members retain the same access they had before the migration.
  - Members who are also members of other organizations must be re-added to your organization. If they sign in using an authentication method with [autoprovisioning](#autoprovisioning) enabled, they are automatically added upon successful sign-in. Otherwise, they must be re-invited or [provisioned using SCIM]({% link cockroachcloud/configure-scim-provisioning.md %}). If a re-invited member previously had the [Organization Admin]({% link cockroachcloud/authorization.md %}#organization-admin) role, it must be granted to them again.

During enablement of the feature, a list of affected members is shown, and those members are also notified individually.

### Ensure that at least one organization admin belongs to no other CockroachDB {{ site.data.products.cloud }} organization

{{site.data.alerts.callout_success}}
You can now use [Folders]({% link cockroachcloud/folders.md %}) (Limited Access) to group, organize, and manage access to clusters in a hierarchy within a single CockroachDB Cloud organization. Compared with managing multiple CockroachDB Cloud organizations, folders simplify billing and centralize cluster administration and observability. To learn more, contact your Cockroach Labs account team.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
If your migration fails with the error: `Cloud Organization SSO cannot be enabled`, confirm that the admin who is enabling CockroachDB {{ site.data.products.cloud }} Organization SSO is not a member of any other CockroachDB {{ site.data.products.cloud }} organization.
{{site.data.alerts.end}}

For your migration to succeed, you must ensure that at least one admin belongs to no other CockroachDB {{ site.data.products.cloud }} organization than the one to be migrated. If all admins belong to multiple organizations, the migration will fail with the generic error `Cloud Organization SSO cannot be enabled`.

If all of your administrators belong to multiple organizations, you can create a temporary user in your SSO provider or directly in CockroachDB {{ site.data.products.cloud }}. Grant the [**Organization Admin** role]({% link cockroachcloud/authorization.md %}#organization-admin) to the temporary user, and use this temporary admin to enable Cloud Organization SSO. After migration, you should delete this temporary user or revoke the **Organization Admin** role.

## Enable Cloud Organization SSO

To enable Cloud Organization SSO:

1. Log in to [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud) as an user with the [Organization Admin]({% link cockroachcloud/authorization.md %}#organization-admin) role.
1. Go to **Organization** > **Authentication**.
1. Next to **Enable Authentication**, click **Enable**.
1. In the dialog, configure the custom URL your members will use to sign in. This value must be unique across CockroachDB {{ site.data.products.cloud }}. For more details, refer to [Update the custom URL](#update-the-custom-url).

      {{site.data.alerts.callout_info}}
      If you previously updated the custom URL from **Organization** > **Authentication** but did not enable Cloud Organization SSO, you are not prompted to configure it again. The value you have already configured is automatically used during enablement. To edit the custom URL again, click **Back** in the dialog.
      {{site.data.alerts.end}}

      Click **Next**

1. The list of default authentication methods displays. By default, **Password**, **GitHub**, **Google**, and **Microsoft** are enabled.

     To configure an authentication method, click its name and fill in the details. You can also do this later. Refer to [Configure advanced settings](#configure-advanced-settings).
     To disable an authentication method, click **Disable**. You can also do this later.

      {{site.data.alerts.callout_danger}}
      If you disable password authentication, members can no longer authenticate to [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud) using the passwords that were  previously stored for them, and those passwords are not retained. Cockroach Labs recommends that you thoroughly test each SSO authentication method that you enable before disabling password authentication.
      {{site.data.alerts.end}}

     Click **Next**.

1. Select **Confirm**, then click **Enable**.

Cloud Organization SSO is enabled, and members can sign in by using the custom URL and selecting any enabled authentication method.

## Update the custom URL

After you enable Cloud Organization SSO, your members sign in at a custom URL that exposes only the authentication methods that you enable, rather than the public sign-in URL at `https://cockroachlabs.cloud`.

To update the custom URL after Cloud Organization SSO is enabled, contact your account team.

## Enable or disable an authentication method

When you enable an authentication method, members can begin authenticating to CockroachDB {{ site.data.products.cloud }} using that authentication method. A member can log in using any enabled authentication method, as long as the email address for the member is the same across all enabled methods. When they successfully sign in with a new authentication method for the first time, they have the option to update their default authentication method. You can optionally [configure advanced settings](#configure-advanced-settings) for each enabled authentication method.

When you disable an authentication method, members who are no longer associated with the other enabled authentication method(s) can no longer sign in and must be provisioned in an IdP that is associated with one of those other enabled methods.

When you enable or disable an authentication method, a notification is displayed with a list of members who must sign in with a different authentication method to regain access. Each affected member also receives an email notification prompting them to sign in again.

To enable or disable an authentication method:

1. Log in to [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud) as user with the [Organization Admin]({% link cockroachcloud/authorization.md %}#organization-admin) role.
1. Go to **Organization** > **Authentication**.
1. To configure an authentication method, click its name.
1. To enable or disable the authentication method, toggle **Enable**.
1. If desired, configure [advanced settings](#configure-advanced-settings) for the authentication method.
1. Click **Save**.

## Configure advanced settings

The following sections describe the advanced settings you can configure for an SSO authentication method. To configure an authentication method:

1. Log in to [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud) as an organizational admin.
1. Go to **Organization** > **Authentication**.
1. To configure an authentication method, click its name.
1. At the top of the page, click **Edit**.
1. Click **Advanced Settings**.
1. Configure the advanced settings as desired.
1. Click **Save**.

### Allowed email domains

By default, members can access your CockroachDB {{ site.data.products.cloud }} organization from any email domain. To restrict access to a specific list of email domains:

1. Log in to [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud) as a user with the [Organization Admin]({% link cockroachcloud/authorization.md %}#organization-admin) role.
1. Go to **Organization** > **Authentication**.
1. To configure an authentication method, click its name.
1. At the top of the page, click **Edit**.
1. Set **Allowed Email Domains** to a comma-separated list of email domains. Each domain should begin with a `@`. To ensure that you are not locked out of CockroachDB {{ site.data.products.cloud }} while you are configuring Cloud Organization SSO, be sure to allow access to the email domain that you use to sign in.
1. Click **Save**.

### Autoprovisioning

Autoprovisioning allows members to sign up for an account without waiting for an invitation. By default, autoprovisioning is disabled, and a member must exist in the SSO provider and must be [invited by a user with the **Organization Admin** role]({% link cockroachcloud/managing-access.md %}#invite-team-members-to-an-organization) before they can create an account. When autoprovisioning is enabled, no invitation is required.

Autoprovisioned accounts are initially assigned the [**Organization Member** role]({% link cockroachcloud/authorization.md %}#organization-member), which grants no permissions to perform cluster or org actions. Additional roles can be granted by a user with the [**Organization Admin** role]({% link cockroachcloud/authorization.md %}#organization-admin).

If a member's identity is removed from the SSO provider, they can no longer log in to CockroachDB {{ site.data.products.cloud }}, but their account is not automatically deprovisioned. If you require automatic deprovisioning or other centralized account automation features, refer to [SCIM Provisioning]({% link cockroachcloud/configure-scim-provisioning.md %}).

Cockroach Labs does not recommend enabling both autoprovisioning and SCIM provisioning for the same authentication method.

To enable autoprovisioning for an SSO authentication method:

1. Log in to [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud) as a user with the [Organization Admin]({% link cockroachcloud/authorization.md %}#organization-admin) role.
1. Go to **Organization** > **Authentication**.
1. Click the name of an authentication method.
1. Click **Advanced Settings**.
1. Next to **Autoprovisioning**, click **Enable**.

## Add a custom authentication method

You can add a custom authentication method to connect to any IdP that supports [OpenID Connect (OIDC)](https://openid.net/connect/) or [Security Access Markup Language (SAML)](https://wikipedia.org/wiki/Security_Assertion_Markup_Language).

### OIDC

#### Supported features

* IdP-initiated SSO
* SP-initiated SSO
* Just-In-Time provisioning

#### Configuration steps

To configure a custom OIDC authentication method, you need the following information from your IdP:

- Issuer URL
- Client ID
- Client secret

These instructions work for Okta. If you use a different IdP, refer to its documentation for configuring OIDC.

1. Log in to Okta as a user with the Admin role.
1. In the Admin Console, click **Applications**, then click **Browse Catalog**.
1. Search for "Cockroach Labs", then click **Add integration**.
1. Set **Application label** to a name for the integration. Set **Entity ID** and **ACS URL** to `none`. These fields are ignored.
1. Click **Next**.
1. In **Sign-On Options**, select **OpenID Connect**. SAML is selected by default.
1. Set **Application username format** to **Email**.
1. Click **Done**. The app integration's details appear.
1. Assign at least one Okta identity to the application, such as the identity you already use to sign in to CockroachDB {{ site.data.products.cloud }}. Click **Assignments**, then click **Assign to People**. Find the identity, click **Assign**, then click **Save and go back**. Click **Done** to close the assignment dialog.
1. Click the **Sign-On** tab. Find the link for **OpenID Provider Metadata**. Right-click and copy the URL. This is your issuer URL, which you will provide to CockroachDB {{ site.data.products.cloud }}.
1. Keep this tab open so that you can copy the Client ID and Client Secret to CockroachDB {{ site.data.products.cloud }}.
1. In a separate browser, log in to [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud) as a user with the [Organization Admin]({% link cockroachcloud/authorization.md %}#organization-admin) role.
1. Go to **Organization** > **Authentication**.
1. Next to **Authentication Methods**, click **Add**.
1. Set **Configuration** to **OIDC (OpenID Connect)** and provide a name for the connection. This name will appear on your custom sign-in page.
1. Click **Submit**. The authentication method's details are displayed. Click **Edit**.
1. Set **Issuer URL** to the issuer URL you copied from Okta, beginning with `https://` and ending with `/openid-configuration`.
1. Copy the **Client ID** and **Client Secret** from the Okta browser tab.
1. Test the connection. This is recommended before enabling the method. Click **Test**, then follow the prompts. If you get an error, review your configuration details, then try again. When the test is successful, the test status changes to **Verified**.
1. Click **Save**.
1. The authentication method has been added but is disabled. To enable it, toggle **Enable**.
1. Optionally, [configure advanced settings](#configure-advanced-settings) for the new authentication method.

#### SP-initiated SSO
1. Navigate to CockroachDB Cloud Console via your organization's vanity URL.
2. Select the appropriate login method which uses OIDC. You will be redirected to your IdP (e.g. Okta).
3. Log in using your IdP credentials.
4. You will then be automatically redirected and logged into your CockroachDB Cloud Console organization.

### SAML

#### Supported features

* IdP-initiated SSO
* SP-initiated SSO
* Just-In-Time provisioning

#### Supported SAML Attributes

   CockroachDB Cloud expects the following SAML attribute mappings from your IdP:
   
| Name  | Value             |
|-------|-------------------|
| email | `user.email`      |
| name  | `user.displayName`|



#### Configuration steps

To configure a custom SAML authentication method, you need the following information from your IdP:

- Sign On URL
- Signing certificate

These instructions work for Okta. If you use a different IdP, refer to its documentation for configuring SAML.

1. Log in to [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud) as a user with the [Organization Admin]({% link cockroachcloud/authorization.md %}#organization-admin) role.
1. Go to **Organization** > **Authentication**.
1. Next to **Authentication Methods**, click **Add**.
1. Set **Configuration** to **SAML**.
1. Set **Provider Name** to a display name for the connection.
1. Click **Next**. The **Provider Details** page opens.
1. To edit the connection, click **Edit**. Keep this browser tab open.
1. In a separate browser tab, log in to Okta as a user with the Admin role.
1. In the Admin Console, click **Applications**, then click **Browse Catalog**.
1. Search for "Cockroach Labs", Click **Add integration**.
1. SAML is selected by default. Provide a name for the connection. This name will appear on your custom sign-in page.
1. Click **Submit**. The authentication method's details are displayed.
1. To download the metadata you will need to provide to Okta, click **Download**. The metadata is downloaded in XML format.
1. Open the metadata file. Make a note of the following:
    - Entity ID: The `entityID` attribute of the `<EntityDescriptor>` tag.
    - ACS URL: The `location` attribute of the `<AssertionConsumerService>` tag.

    Close the metadata file. Keep the browser tab open.
1. Next to **Sign On Certificate**, click **Download**. Do not click **Copy**. Open the downloaded file in a text editor.
1. In the browser tab for CockroachDB {{ site.data.products.cloud }}, click **Edit**.
1. Set **Sign-in URL** to the Sign on URL from Okta.
1. Copy the entire contents of the certificate from your text editor into **Signing Certificate**, including the `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----` lines, and paste it into the Signing Certificate field.
1. Test the connection. This is recommended before enabling the method. Click **Test**, then follow the prompts. If you get an error, review your configuration details, then try again. When the test is successful, the test status changes to **Verified**.
1. Click **Save**.
1. The authentication method has been added but is disabled. To enable it, toggle **Enable**.
1. (Optional) [Configure SCIM autoprovisioning]({% link cockroachcloud/configure-scim-provisioning.md %}).

After SAML is configured, your users can sign in to the CockroachDB {{ site.data.products.cloud }} Console in two different ways:

- **Service provider-initiated flow**: Users sign in to the CockroachDB {{ site.data.products.cloud }} Console directly, using your custom sign-in URL.
- **Identity provider-initiated flow**: Users sign in to the CockroachDB {{ site.data.products.cloud }} Console from within your IdP (for example, by accessing its tile in Okta).

#### SP-initiated SSO
1. Navigate to CockroachDB Cloud Console via your organization's vanity URL.
2. Select the appropriate login method which uses SAML. You will be redirected to your IdP (e.g. Okta).
3. Log in using your IdP credentials.
4. You will then be automatically redirected and logged into your CockroachDB Cloud Console organization.


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

## What next?

- [Cloud Organization SSO Frequently Asked Questions]({% link cockroachcloud/cloud-org-sso.md %}#frequently-asked-questions-faq).
- [Configure SCIM Provisioning]({% link cockroachcloud/configure-scim-provisioning.md %})
- Learn more about [authenticating to CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/authentication.md %}).
