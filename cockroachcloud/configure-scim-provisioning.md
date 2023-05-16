---
title: Configure SCIM provisioning
summary: Learn how to automatically provision and deprovision Cockroach Cloud organization users using SCIM.
toc: true
docs_area: manage
---

{{site.data.alerts.callout_info}}
{% include_cached feature-phases/limited-access.md %}
{{site.data.alerts.end}}

[System for Cross-Domain Identity Management SCIM](https://www.rfc-editor.org/rfc/rfc7644) autoprovisioning centralizes and automates provisioning and deprovisioning of {{ site.data.products.db }} organization users and groups from your identity provider (IdP).

Rather than using [invitations](managing-access.html#invite-team-members-to-an-organization) or self-service [autoprovisioning](cloud-org-sso.html#autoprovisioning), SCIM autoprovisioning tasks are performed centrally by a team of IAM admins in your IdP, who manage the assignment of your organization's users to your organization's app integrations. This page describes SCIM provisioning and shows how to configure and use it to provision {{ site.data.products.db }} users.

## Overview of SCIM provisioning

This section describes how SCIM provisioning works if you use Okta. Depending on how your IdP has implemented SCIM, some details may differ.

1. In your IdP, an IAM admin creates a SCIM app integration and configures it to authenticate to {{ site.data.products.db }} using a {{ site.data.products.db }} service account with the [**Org Administrator (legacy)** role](authorization.html#org-administrator-legacy).
1. In your IdP, an IAM admin assigns users and groups to the app integration.
1. The app integration provisions or deactivates users in {{ site.data.products.db }} based on the app integration's assignments.

Depending on your IdP's configuration, provisioned users can access your {{ site.data.products.db }} organization using either your IdP's interface or your {{ site.data.products.db }} organization's custom sign-in URL. The first time a user successfully authenticates to your {{ site.data.products.db }} organization, the identity for the provisioned user is created.

SCIM operations on a group are applied to each member of the group individually. For example, assigning a group to an app integration provisions accounts for each of its members, and they can access {{ site.data.products.db }}. However, {{ site.data.products.db }} has no awareness of the IAM group itself unless an IAM admin uses the app integration to push the group to {{ site.data.products.db }}. If a group is pushed but not assigned to the app integration, new users are not provisioned in the app integration, but memberships of users that have already been assigned to the app integration are automatically affected. Refer to [Automate Group Management](#automate-group-management).

When a user is directly or indirectly unassigned, their {{ site.data.products.db }} account is disabled or removed, depending on the capabilities of your IdP. To remove a disabled user from {{ site.data.products.db }}, refer to [Manage an Organization's Members](managing-access.html#manage-an-organizations-users).

{{site.data.alerts.callout_info}}
Okta disables deprovisioned users and does not support deleting them.
{{site.data.alerts.end}}

To learn more about user and group assignments and group push on Okta, refer to the following topics in the Okta documentation:

- [Manage Users](https://help.okta.com/en-us/Content/Topics/users-groups-profiles/usgp-people.htm)
- [Manage Groups](https://help.okta.com/en-us/Content/Topics/users-groups-profiles/usgp-groups-main.htm)
- [Manage Group Push](https://help.okta.com/en-us/Content/Topics/users-groups-profiles/usgp-group-push-main.htm)

Before following these instructions, if your IdP is Okta, then it may be helpful to read Okta's [article about SCIM](https://developer.okta.com/docs/concepts/scim/), as well as [Configure provisioning for an app integration
](https://help.okta.com/en-us/Content/Topics/Provisioning/lcm/lcm-provision-application.htm) in the Okta documentation. Otherwise, refer to your IdP's documentation about configuring SCIM.

## Requirements

1. As a user with the [**Org Administrator (legacy)** role](authorization.html#org-administrator-legacy):

   1. [Enable Cloud Organization SSO](configure-cloud-org-sso.html#enable-cloud-organization-sso).
   1. [Create a service account](managing-access.html#create-a-service-account) with the [**Org Administrator (legacy)** role](authorization.html#org-administrator-legacy) and make a note of its API token. This is the bearer token the IdP will use to authenticate to the {{ site.data.products.db }} API.
   1. Contact your account team to enable your {{ site.data.products.db }} organization in SCIM limited access.

1. If your IdP is Okta, SCIM provisioning can be enabled only on a [custom SAML authentication method](configure-cloud-org-sso.html#saml). This requirement is imposed by Okta, and is not part of the SCIM or SAML protocols.

Individual IdPs may impose different requirements, and the exact steps and requirements for enabling SCIM autoprovisioning depend upon your IdP. Refer to your IdP's documentation about configuring SCIM provisioning.

## Configure SCIM provisioning on Okta

The exact steps and requirements for enabling SCIM provisioning depend upon your IdP. At a minimum, you must provide your IdP two pieces of information:

- The endpoint to the {{ site.data.products.db }} SCIM API, `https://cockroachlabs.cloud/api/scim/v2`.
- The API token of a {{ site.data.products.db }} service account with the [**Org Administrator (legacy)** role](authorization.html#org-administrator-legacy).

To add SCIM provisioning to a SAML app integration in Okta:

1. Log in to Okta Admin Dashboard as an admin user.
1. Click **Applications** and edit the [SAML](configure-cloud-org-sso.html#saml) app integration for your {{ site.data.products.db }} organization.
1. Click **Edit**.
1. Click **Provisioning**.
1. Select **SCIM** and click **Save**.
1. In the integration's settings page, click **Provisioning** again, then click **Edit**.
1. Click **Integrations**. This tab controls the app integration's authentication to the {{ site.data.products.db }} API. Set:

    <ul><li><b>SCIM connector base URL</b>: <code>https://cockroachlabs.cloud/api/scim/v2</code></li><li><b>API authentication token</b>: the API token for a {{ site.data.products.db }} <a href="managing-access.html#create-a-service-account">service account</a> with the <a href="authorization.html#org-administrator-legacy"><b>Org Administrator (legacy)</b> role</a></li><li><b>Unique identifier field for users</b>: <code>userName</code></li><li><b>Authentication Mode</b>: <b>HTTP Header</b></li></ul>

1. Click **Test Connector Configuration**.
1. Click **Save**.
1. Click **To App**. This tab controls assignment of Okta identities to {{ site.data.products.db }}. To allow provisioning and deprovisioning of users, ensure that **Create Users** and **Deactivate Users** are selected, and make any other desired changes.
1. Optionally, click **To Okta**. This tab allows you to perform a one-time import of a {{ site.data.products.db }} organization's existing users into Okta. Refer to Okta's documentation about mapping individual fields. Make any desired changes.

To learn more, refer to [Add SCIM Provisioning to App Integrations](https://help.okta.com/en-us/Content/Topics/Apps/Apps_App_Integration_Wizard_SCIM.htm) in the Okta documentation

## Manage users and groups on Okta

The following sections show how to manage the access of Okta users to your {{ site.data.products.db }} organization.

### Assign a user or group

To provision a user or group to {{ site.data.products.db }}, you assign the user or group to the app integration.

{{site.data.alerts.callout_success}}
After you assign a user to the app integration, changes that you make to the user's record in Okta, such as renaming the user or changing their email address, are automatically applied to the user's {{ site.data.products.db }} account.
{{site.data.alerts.end}}

1. Log in to Okta Admin Dashboard as an IAM admin.
1. Click **Applications** and click the [SAML](configure-cloud-org-sso.html#saml) application for your {{ site.data.products.db }} organization.
1. Click **Assignments**. When a user or group is assigned to an application, Okta allows them to sign in to the application.
1. Click **Assign**, then select **Assign to People** or **Assign to Groups**.

      Operations on a group are applied to each member of the group individually by the {{ site.data.products.db }} API. For example, assigning a group to the app integration provisions an account for each of the group's members at the time of assignment. Changes to a group's membership in Okta are not automatically reflected in {{ site.data.products.db }} unless the group is linked in the app integration. Refer to [Automate Group Management](#automate-group-management).

      Filter or search for a user or group. Next to them, click **Assign**, then **Save and go back**.

      {{ site.data.products.db }} accounts are provisioned when a user or group is assigned to the app integration.

1. Instruct the user how to access your {{ site.data.products.db }} organization. {{ site.data.products.db }} does not notify a user when an account is provisioned for them using SCIM. Users may use your IdP's web interface or a browser plugin, or they may access your {{ site.data.products.db }} organization's custom login URL directly and select an SSO login method.

To learn more, refer to [Assign An App Integration to a User](https://help.okta.com/en-us/Content/Topics/Provisioning/lcm/lcm-assign-app-user.htm) in the Okta documentation.

If you assign a group to the app integration, its members are provisioned and appear in {{ site.data.products.db }}, but members who are subsequently added to the group in Okta are not automatically provisioned to {{ site.data.products.db }} unless you push the groups to {{ site.data.products.db }} in the app integration. Refer to [Automate Group Management](#automate-group-management).

### Unassign a user or group

To remove a user's access to {{ site.data.products.db }}, unassign the user from the app integration.

1. Log in to Okta Admin Dashboard as an admin user.
1. Click **Applications** and click the [SAML](configure-cloud-org-sso.html#saml) application for your {{ site.data.products.db }} organization.
1. Click **Assignments**.
1. Next to a user or group, click **More Actions** > **Deactivate**.

      {{site.data.alerts.callout_info}}
      Unassigning an IdP group from the app integration disables each group member's {{ site.data.products.db }} organization account. Changes to a group's membership in Okta are not automatically reflected in {{ site.data.products.db }} unless the group is linked in the app integration. Refer to [Automate Group Management](#automate-group-management).
      {{site.data.alerts.end}}

1. In the dialog, click **Deactivate**.

      The app integration deprovisions the user's account from your {{ site.data.products.db }} organization.

To learn more, refer to [Deprovision a user](https://help.okta.com/en-us/Content/Topics/Provisioning/lcm/lcm-deprovision-user.htm) in the Okta documentation.

A linked group that is unassigned from the app integration continues to appear in {{ site.data.products.db }} unless it is unlinked. Refer to [Automate Group Management](#automate-group-management).

### Automate group management

By default, users and groups are provisioned in {{ site.data.products.db }} only when they are assigned to the app integration, and changes to a group's membership in Okta are not automatically reflected in {{ site.data.products.db }}. When [Group Push](https://help.okta.com/en-us/Content/Topics/users-groups-profiles/usgp-about-group-push.htm) is enabled in an app integration, modifying group membership in Okta is automatically reflected in {{ site.data.products.db }}.

To enable Group Push and link groups:

1. Log in to Okta Admin Dashboard as an admin user.
1. Click **Applications** and click the [SAML](configure-cloud-org-sso.html#saml) app integration for your {{ site.data.products.db }} organization.
1. Click the **Push Groups** tab. Unless you disable **Push group memberships immediately**, changes you make in this tab will be applied immediately.

   1. To link a group, click **Push Groups**, then select it.
   1. To unlink a linked group, select it, then click **Unlink pushed group**.
   1. If you disabled **Push group memberships immediately**, click **Push Now**.

1. To disable Group Push, click **Deactivate Group Push**.


For more information and troubleshooting, refer to [Manage Group Push](https://help.okta.com/en-us/Content/Topics/users-groups-profiles/usgp-group-push-main.htm) in the Okta documentation.

## What next?

- Learn more about [Cloud Organization SSO](cloud-org-sso.html)
- [Configure Cloud Organization SSO](configure-cloud-org-sso.html)
- Learn more about [authenticating to {{ site.data.products.db }}](authentication.html).
