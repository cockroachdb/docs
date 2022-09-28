---
title: Cloud Organization Single Sign-On (SSO)
summary: Learn about Cloud Organization Single Sign-On.
toc: true
docs_area: manage
---

{% include feature-phases/preview.md %}

{% include_cached cockroachcloud/sso-intro.md %}

This page describes Basic SSO and Cloud Organization SSO. To enable Cloud Organization SSO, refer to [Configure Cloud Organization SSO](configure-cloud-org-sso.html).

## Basic SSO

Basic SSO provides flexibility and convenience for your users, and is enabled by default for each {{ site.data.products.db }} organization. With no configuration required, members can sign in using an identity from GitHub, Google, or Microsoft instead of using an email address or password.

Basic SSO has the following differences from [Cloud Organization SSO](#cloud-organization-sso):

  - Customization is not possible.
  - New authentication methods cannot be added, and existing authentication methods cannot be disabled.
  - It is not possible to enforce a requirement to use SSO rather than password authentication.
  - It is not possible to limit the email domains allowed to sign in using a given authentication method.
  - Autoprovisioning is not supported, and members must be invited before they can sign in.
  - A member may have only one active authentication method in an organization, but may change it at any time by logging in using a different method. For a member to switch back to using a password, they must be removed and re-invited to your {{ site.data.products.db }} organization. Refer to [Migration of individual members to SSO](#migration-of-individual-members-to-sso).

If your organization needs more flexibility and customization to meet your security and compliance requirements, you can enable and configure [Cloud Organization SSO](#cloud-organization-sso).

## Cloud Organization SSO

Cloud Organization SSO allows you to customize your SSO configuration to meet your organization's security and business requirements:

- Members sign in using a custom URL that allows only the authentication methods that you have configured.
- Members can sign in using any enabled authentication method, to help reduce the impact of an identity provider outage. If a member signs in using a new method, they are prompted to optionally update their default.
- Multiple authentication methods can be enabled simultaneously. You can add custom authentication methods that connect to IdPs such as Okta or OneLogin using the [Security Access Markup Language (SAML)](https://en.wikipedia.org/wiki/Security_Assertion_Markup_Language) and [OpenID Connect (OIDC)](https://openid.net/connect/) identity protocols.
- Authentication methods can be disabled, including email authentication. Disabled authentication methods are not available on the custom login URL.
- [Autoprovisioning](#autoprovisioning) optionally removes the need to invite members to your organization. Autoprovisioning is disabled by default for each SSO authentication method.
- You can limit the email domains that are allowed to log in, at the level of the individual authentication method. By default, any email domain is allowed.

To enable and configure Cloud Organization SSO, refer to [Configure Cloud Organization SSO](configure-cloud-org-sso.html).

### Restrict SSO authentication by email domain

Cockroach Labs recommends that you invite users to your organization using only identities that you manage, such as your organization's Google, Github, or Microsoft organization or a centralized IdP that supports [Security Access Markup Language (SAML)](https://en.wikipedia.org/wiki/Security_Assertion_Markup_Language) or [OpenID Connect (OIDC)](https://openid.net/connect/). With [Cloud Organization SSO](#cloud-organization-sso), you can limit the email domains that are allowed to log in, at the level of the individual authentication method. If you enable [autoprovisioning](#autoprovisioning), members can sign in without an invitation.

- For members who log in in using an IdP managed by your organization, deprovisioning them from the IdP prevents them from accessing  resources in your {{ site.data.products.db }} organization.
- For members who log in using an identity you don't manage, such as a personal GMail account, you must deprovision them from {{ site.data.products.db }} to prevent their access to your {{ site.data.products.db }} organization.

### Autoprovisioning

Autoprovisioning allows you to centralize management of your users in an IdP and removes the need to [invite users to your organization](https://www.cockroachlabs.com/docs/cockroachcloud/console-access-management.html#invite-team-members-to-cockroachdb-cloud). When autoprovisioning is enabled, the first time a new user successfully signs in using the custom sign-in page, a {{ site.data.products.db }} account is automatically created for them and and are assigned the [Developer role](/docs/cockroachcloud/console-access-management.html#developer) by default.

When autoprovisioning is enabled for an SSO authentication method, a {{ site.data.products.db }} account is created automatically when a member successfully authenticates using that method. Together with [Allowed Email Domains](configure-cloud-org-sso.html#allowed-email-domains), autoprovisioning allows the users who are already provisioned in your IdP to get started quickly, without waiting for an invitation.

Autoprovisioning is optional, and can be configured separately for each enabled SSO authentication method.

{{site.data.alerts.callout_danger}}
{{ site.data.products.db }} users are identified by their email address. To reduce the risk of duplicated users, ensure that users have unique email addresses before enabling auto-provisioning for an authentication method. If duplicate users result from auto-provisioning, you must delete them manually. Refer to [Manage Team Members](/docs/cockroachcloud/console-access-management.html#manage-team-members).
{{site.data.alerts.end}}

Cockroach Labs recommends that you enable autoprovisioning on only a single SSO method at a time, and that you migrate your users gradually. Most organizations aim to manage users in a single centralized IdP. It may be necessary to temporarily enable autoprovisioning to migrate a group of users who have not yet been created in your centralized IdP.

### Migration of individual members to SSO

After you [enable an authentication method](configure-cloud-org-sso.html#enable-or-disable-an-authentication-method) for your organization, it will appear on your organization's custom URL, and your existing users can opt to sign in using that method rather than their password. When an existing member signs in using an SSO authentication method for the first time, they can optionally designate that authentication method as their new default.

When a member changes their authentication method, there are some important differences between **Basic SSO** and **Cloud Organization SSO**:

- **Basic SSO**: When a member signs up for an account, they can authenticate using an email address and password or using SSO. When a member successfully authenticates using SSO for the first time, that method becomes their new authentication method, and their previously-used password is not retained. If they want to go back to using a password, they must be manually deleted and re-invited. Refer to [Manage Team Members](https://www.cockroachlabs.com/docs/cockroachcloud/console-access-management.html#manage-team-members).

- **Cloud Organization SSO**: A member may sign in using any enabled authentication method, including switching back to using a password if password authentication is enabled.

    Keep the following in mind and communicate it to your members before enabling Cloud Organization SSO:

      - If your organization includes members who are also members of other organizations, and this is the first of their organizations to enable Cloud Organization SSO, those members must be re-added to your organization. If they sign in using an authentication method with [autoprovisioning](#autoprovisioning) enabled, they are automatically added upon successful sign-in. **However, those who were previously admins must be granted the role again**.
      - After you enable Cloud Organization SSO, all other members of your {{ site.data.products.db }} organization who were using [Basic SSO](cloud-org-sso.html#basic-sso) rather than an email and password must sign in again to regain access to your organization. After signing in, members retain the same access they had before the migration.

During enablement of the feature, a list of affected members is shown, and those members are also notified individually.

### Enforce a requirement to use SSO

Using SSO with a centralized identity management and user provisioning is a recommended security practice. It helps to mitigate against the risk of unauthorized access to your organization's data and infrastructure by users who should no longer have access, such as when a {{ site.data.products.db }} account using password authentication is not deprovisioned when an employee leaves the organization.

To help mitigate against this risk, SSO is preferred over password authentication, whether your organization uses Basic SSO or Cloud Organization SSO. If a member opts to log in using SSO, their default authentication method is automatically and their previous password is not retained. After a member switches to using SSO, they cannot switch back to using a password, but they can switch to a different SSO authentication method as long as the associated email address is identical. For a member to switch back to using a password, they must be removed and re-invited to your {{ site.data.products.db }} organization.

Refer to [Require SSO](configure-cloud-org-sso.html#require-sso).

## Frequently Asked Questions (FAQ)

#### Will it work if I try to sign in with SSO without explicitly setting it up for my account, if I already use an email from an SSO Provider such as Gmail?

Yes, as long as the email address associated with your SSO provider is exactly the same as the one associated with your existing {{ site.data.products.db }} account. After successfully signing in, you will be prompted to approve the updated authentication method for your account.

To view your current authentication method, visit **My Account** in the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud).

#### Once I change my active login method to a new SSO provider, can I still sign in using my email/password combination or my GitHub identity?

No. Only one authentication method can be active for each {{ site.data.products.db }} Console user. Visit **My Account** in the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud) to view or update your active authentication method.

#### Does this change how administrators invite users?

The [workflow for inviting team members](console-access-management.html#invite-team-members-to-cockroachdb-cloud) to {{ site.data.products.db }} remains the same. However, if Cloud Organization SSO is enabled for your {{ site.data.products.db }} organization and autoprovisioning is enabled for the authentication method they use to sign in, then an account is created automatically after they successfully authenticate.

#### As an admin, how do I deprovision a user's access to {{ site.data.products.db }} Console if they leave the relevant project?

If Cloud Organization SSO is enabled, then deprovisioning a user at the level of the IdP also removes their access to the {{ site.data.products.db }} organization.

To remove a user's access to {{ site.data.products.db }} without deprovisioning the user from the IdP (such as when a user changes teams but does not leave the organization entirely), you can [remove their {{ site.data.products.db }} user identity from your {{ site.data.products.db}} organization](console-access-management.html#delete-a-team-member).

#### Can admins require a particular authentication method for their {{ site.data.products.db }} organization?

Yes, when Cloud Organization SSO is enabled for your {{ site.data.products.db }} organization, only the authentication methods you have enabled are displayed to your users.

#### Which authentication flows are supported with Enterprise Authentication? Is it possible to enable the identity provider initiated flow?

The primary flow is to initiate Cloud Organization SSO through the {{ site.data.products.db }} Console.

If you need to initiate SSO integration from the IdP, contact your account team for assistance.

#### What default role is assigned to users when auto-provisioning is enabled in a {{ site.data.products.db }} organization?

The `Developer` role is assigned by default to auto-provisioned users.

## What's next?
- [Configure Cloud Organization SSO](configure-cloud-org-sso.html)
- Learn more about [authenticating to {{ site.data.products.db }}](authentication.html).
