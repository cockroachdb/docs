---
title: Configure SCIM Provisioning
summary: Learn how to automatically provision and deprovision Cockroach Cloud organization users using SCIM.
toc: true
docs_area: manage
---

[System for Cross-Domain Identity Management SCIM](https://www.rfc-editor.org/rfc/rfc7644) helps centralize and automate provisioning, deprovisioning, and identity management for CockroachDB {{ site.data.products.cloud }} organization users and groups from your identity provider (IdP).

Rather than using [invitations]({% link cockroachcloud/managing-access.md %}#invite-team-members-to-an-organization) or self-service [autoprovisioning]({% link cockroachcloud/cloud-org-sso.md %}#autoprovisioning), SCIM autoprovisioning tasks are performed centrally by a team of IAM admins in your IdP, who manage the assignment of your organization's users to your organization's app integrations. This page describes SCIM provisioning and shows how to configure and use it to provision CockroachDB {{ site.data.products.cloud }} users.

## Overview of SCIM provisioning

This section describes how SCIM provisioning works if you use Okta. Depending on how your IdP has implemented SCIM, some details may differ.

If your IdP is Okta, then it may be helpful to read Okta's [article about SCIM](https://developer.okta.com/docs/concepts/scim/), as well as [Configure provisioning for an app integration
](https://help.okta.com/en-us/Content/Topics/Provisioning/lcm/lcm-provision-application.htm) in the Okta documentation. Otherwise, refer to your IdP's documentation about configuring SCIM.

To configure SCIM provisioning, an IAM admin creates a SCIM app integration in your IdP and configures it to authenticate to CockroachDB {{ site.data.products.cloud }} using a CockroachDB {{ site.data.products.cloud }} service account with the [**Org Administrator**]({% link cockroachcloud/authorization.md %}#org-administrator) role.

From then on, the app integration works as follows.

### Automatic provisioning

1. When an IAM admin assigns a user or group to the app integration, the app integration uses the CockroachDB {{ site.data.products.cloud }} API to provision an account for the user, or for each of the group's members.
1. When an IAM admin unassigns a user or group from the app integration, or when the user or group is removed from the IdP, the app integration removes or deactivates users in CockroachDB {{ site.data.products.cloud }} based on the app integration's assignments.

When a user is directly or indirectly unassigned, their CockroachDB {{ site.data.products.cloud }} account is disabled or removed, depending on the capabilities of your IdP. To remove a disabled user from CockroachDB {{ site.data.products.cloud }}, refer to [Manage an Organization's Members]({% link cockroachcloud/managing-access.md %}#manage-an-organizations-users).

{{site.data.alerts.callout_info}}
Okta disables deprovisioned users and does not support deleting them.
{{site.data.alerts.end}}

<a id="scim-group-push"></a>

### SCIM Group Push with Okta

User accounts are provisioned in CockroachDB {{ site.data.products.cloud }} based on assignments in the SCIM app integration. Assigning an IAM group to the app integration is equivalent to assigning each of the group's members individually. However, depending on your IdP, assigning a group to the app integration may or may not automatically create a corresponding group in CockroachDB {{ site.data.products.cloud }} or keep its list of members in sync. Additional configuration of your IdP may be required. If you use Okta, you must enable [Group Push](#automate-group-management) to create and link groups in CockroachDB {{ site.data.products.cloud }}.

When CockroachDB {{ site.data.products.cloud }} has no awareness of group membership, role assignments must be applied to each user account separately.

Depending on what it supports, your IdP may provide a mechanism to sync IAM groups as groups in CockroachDB {{ site.data.products.cloud }}. In Okta, you must enable _Group Push_. When Group Push is enabled:

1. You can configure the SCIM app integration to selectively synchronize details about an IAM group to CockroachDB {{ site.data.products.cloud }}, including the group's name and membership list. In Okta, this group is said to be _pushed_.
1. Within CockroachDB {{ site.data.products.cloud }}, you can assign roles to a pushed group, and those roles are automatically assigned to the individual group members with provisioned accounts in CockroachDB {{ site.data.products.cloud }}.
1. A user account is only ever automatically provisioned in CockroachDB {{ site.data.products.cloud }} based on assignments in the SCIM app integration.
   - If a group is pushed but not assigned to the SCIM app in Okta, roles can be granted to the group in CockroachDB {{ site.data.products.cloud }}, and group members who are already provisioned in CockroachDB {{ site.data.products.cloud }} or who are assigned to the app integration in the future, automatically receive those roles.
   - If a group is assigned to the SCIM app in Okta but is not pushed, the group does not appear in CockroachDB {{ site.data.products.cloud }}, but user accounts are automatically provisioned for its members.

1. When details about a pushed IAM group change, such as the group's name or membership, these changes are automatically reflected in CockroachDB {{ site.data.products.cloud }}, unless group push is subsequently disabled for the group.

To learn more about Group Push, refer to [Automate Group Management](#automate-group-management).

## Requirements

1. As a user with the [**Org Administrator**]({% link cockroachcloud/authorization.md %}#org-administrator) role:

   1. [Enable Cloud Organization SSO]({% link cockroachcloud/configure-cloud-org-sso.md %}#enable-cloud-organization-sso).
   1. [Create a service account]({% link cockroachcloud/managing-access.md %}#create-a-service-account) with the [**Org Administrator** role]({% link cockroachcloud/authorization.md %}#org-administrator) and make a note of its API token. This is the bearer token the IdP will use to authenticate to the CockroachDB {{ site.data.products.cloud }} API.

1. If your IdP is Okta, SCIM provisioning can be enabled only on a [custom SAML authentication method]({% link cockroachcloud/configure-cloud-org-sso.md %}#saml). This requirement is imposed by Okta, and is not part of the SCIM or SAML protocols.

Individual IdPs may impose different requirements, and the exact steps and requirements for enabling SCIM autoprovisioning depend upon your IdP. Refer to your IdP's documentation about configuring SCIM provisioning.

## Configure SCIM provisioning on Okta

The exact steps and requirements for enabling SCIM provisioning depend upon your IdP. At a minimum, you must provide your IdP two pieces of information:

- The endpoint to the CockroachDB {{ site.data.products.cloud }} SCIM API, `https://cockroachlabs.cloud/api/scim/v2`.
- The API token of a CockroachDB {{ site.data.products.cloud }} service account with the [**Org Administrator**]({% link cockroachcloud/authorization.md %}#org-administrator) role.

To add SCIM provisioning to a SAML app integration in Okta:

1. Log in to Okta Admin Dashboard as an admin user.
1. Click **Applications** and edit the [SAML]({% link cockroachcloud/configure-cloud-org-sso.md %}#saml) app integration for your CockroachDB {{ site.data.products.cloud }} organization.
1. Click **Edit**.
1. Click **Provisioning**.
1. Select **SCIM** and click **Save**.
1. In the integration's settings page, click **Provisioning** again, then click **Edit**.
1. Click **Integrations**. This tab controls the app integration's authentication to the CockroachDB {{ site.data.products.cloud }} API. Set:

    <ul><li><b>SCIM connector base URL</b>: <code>https://cockroachlabs.cloud/api/scim/v2</code></li><li><b>API authentication token</b>: the API token for a CockroachDB {{ site.data.products.cloud }} <a href="managing-access.html#create-a-service-account">service account</a> with the <a href="authorization.html#org-administrator"><b>Org Administrator</b></a> role</li><li><b>Unique identifier field for users</b>: <code>userName</code></li><li><b>Authentication Mode</b>: <b>HTTP Header</b></li></ul>

1. Click **Test Connector Configuration**.
1. Click **Save**.
1. Click **To App**. This tab controls assignment of Okta identities to CockroachDB {{ site.data.products.cloud }}. To allow provisioning and deprovisioning of users, ensure that **Create Users** and **Deactivate Users** are selected, and make any other desired changes.
1. Optionally, click **To Okta**. This tab allows you to import a CockroachDB {{ site.data.products.cloud }} organization's existing users into Okta. This helps to maintain an updated list of IAM users when an organization creates IAM users in a variety of ways. Refer to Okta's documentation about mapping individual fields. Make any desired changes.

To learn more, refer to [Add SCIM Provisioning to App Integrations](https://help.okta.com/en-us/Content/Topics/Apps/Apps_App_Integration_Wizard_SCIM.htm) in the Okta documentation

## Manage users and groups on Okta

The following sections show how to manage the access of Okta users to your CockroachDB {{ site.data.products.cloud }} organization. To manage groups in CockroachDB {{ site.data.products.cloud }}, refer to [Manage Groups in CockroachDB {{ site.data.products.cloud }}](#manage-groups-in-cockroachdb-cloud).

### Assign a user or group

To provision a user to CockroachDB {{ site.data.products.cloud }}, you assign the user or one of their groups to the app integration.

{{site.data.alerts.callout_info}}
When you assign a group to the app integration, accounts are provisioned for each of its members, but the group itself is not provisioned in CockroachDB {{ site.data.products.cloud }}. In Okta, you must enable [Group Push](#automate-group-management) to provision the group and add links to its member users in CockroachDB {{ site.data.products.cloud }}.
{{site.data.alerts.end}}

After you assign a user to the app integration, changes that you make to the user's record in Okta, such as renaming the user or changing their email address, are automatically applied to the user's CockroachDB {{ site.data.products.cloud }} account.

1. Log in to Okta Admin Dashboard as an IAM admin.
1. Click **Applications** and click the [SAML]({% link cockroachcloud/configure-cloud-org-sso.md %}#saml) application for your CockroachDB {{ site.data.products.cloud }} organization.
1. Click **Assignments**. When a user or group is assigned to an application, Okta allows them to sign in to the application.
1. Click **Assign**, then select **Assign to People** or **Assign to Groups**.

    Operations on a group are applied to each member of the group individually by the CockroachDB {{ site.data.products.cloud }} API. For example, assigning a group to the app integration provisions an account for each of the group's members at the time of assignment. Changes to a group's membership in Okta are not automatically reflected in CockroachDB {{ site.data.products.cloud }} unless the group is linked in the app integration. Refer to [Automate Group Management](#automate-group-management).

    Filter or search for a user or group. Next to them, click **Assign**, then **Save and go back**.

    CockroachDB {{ site.data.products.cloud }} user accounts are provisioned when a user or group is assigned to the app integration.

1. Instruct the user how to access your CockroachDB {{ site.data.products.cloud }} organization. CockroachDB {{ site.data.products.cloud }} does not notify a user when an account is provisioned for them using SCIM. Users may use your IdP's web interface or a browser plugin, or they may access your CockroachDB {{ site.data.products.cloud }} organization's custom login URL directly and select an SSO login method.

To learn more, refer to [Assign An App Integration to a User](https://help.okta.com/en-us/Content/Topics/Provisioning/lcm/lcm-assign-app-user.htm) in the Okta documentation.

If you assign a group to the app integration, its members are provisioned and appear in CockroachDB {{ site.data.products.cloud }}, but members who are subsequently added to the group in Okta are not automatically provisioned to CockroachDB {{ site.data.products.cloud }} unless you push the groups to CockroachDB {{ site.data.products.cloud }} in the app integration. Refer to [Automate Group Management](#automate-group-management).

### Unassign a User or Group

To remove a user's access to CockroachDB {{ site.data.products.cloud }}, unassign the user from the app integration.

1. Log in to Okta Admin Dashboard as an admin user.
1. Click **Applications** and click the [SAML]({% link cockroachcloud/configure-cloud-org-sso.md %}#saml) application for your CockroachDB {{ site.data.products.cloud }} organization.
1. Click **Assignments**.
1. Next to a user or group, click **More Actions** > **Deactivate**.

    {{site.data.alerts.callout_info}}
    Unassigning an IdP group from the app integration disables each group member's CockroachDB {{ site.data.products.cloud }} organization account. Changes to a group's membership in Okta are not automatically reflected in CockroachDB {{ site.data.products.cloud }} unless the group is linked in the app integration. Refer to [Automate Group Management](#automate-group-management).
    {{site.data.alerts.end}}

1. In the dialog, click **Deactivate**.

    The app integration deprovisions the user's account from your CockroachDB {{ site.data.products.cloud }} organization.

To learn more, refer to [Deprovision a user](https://help.okta.com/en-us/Content/Topics/Provisioning/lcm/lcm-deprovision-user.htm) in the Okta documentation.

A linked group that is unassigned from the app integration continues to appear in CockroachDB {{ site.data.products.cloud }} unless it is unlinked. Refer to [Automate Group Management](#automate-group-management).

<a id="automate-group-management"></a>
### Automate group management with Okta

The following sections show how to enable and manage Okta's Group Push feature. For more information and troubleshooting, refer to [Manage Group Push](https://help.okta.com/en-us/Content/Topics/users-groups-profiles/usgp-group-push-main.htm) in the Okta documentation.

#### Enable Group Push

To enable Group Push and begin synchronizing a group with CockroachDB {{ site.data.products.cloud }}:

1. Log in to Okta Admin Dashboard as an admin user.
1. Click **Applications** and click the [SAML]({% link cockroachcloud/configure-cloud-org-sso.md %}#saml) app integration for your CockroachDB {{ site.data.products.cloud }} organization.
1. Click the **Push Groups** tab. Unless you disable **Push group memberships immediately**, changes you make in this tab will be applied immediately.

   1. To link a group:
     1. Click **Push Groups**, then select either **Find groups by name** or **Find groups by rule**.
     1. Find a group to push, and click its name.
     1. Under **Match result & push action**, click **Create Group** to create a new group in CockroachDB {{ site.data.products.cloud }} and link the Okta group to it. If a group exists in CockroachDB {{ site.data.products.cloud }} with the same name, click **Link Group**.
   1. To unlink a linked group, select it, then click **Unlink pushed group**.
   1. If you disabled **Push group memberships immediately**, click **Push Now**.

#### Disable Group Push

To disable Group Push, click **Deactivate Group Push**. You can optionally delete the group from CockroachDB {{ site.data.products.cloud }}. If you choose not to delete it, the group's membership stops being updated by the SCIM app integration, but the group's assigned roles continue to be applied to its members and can be modified.

## Manage groups in CockroachDB {{ site.data.products.cloud }}

### View a group's details

To view details about a group:

1. In CockroachDB {{ site.data.products.cloud }} Console, click **Access Management > Groups**.
1. In a group's row, click the three-dots **Action** button, then select any of **View Members**, **View Parent Groups**, or **View Child Groups**.

### Manage a group's roles

Within CockroachDB {{ site.data.products.cloud }}, you can grant [roles]({% link cockroachcloud/authorization.md %}#organization-user-roles) to a pushed group, and those roles are automatically granted to the group's members who have accounts in CockroachDB {{ site.data.products.cloud }}.

- When you push a group whose members already exist in CockroachDB {{ site.data.products.cloud }} and assign roles to the group, those members are granted the group's roles, in addition to roles explicitly granted to them.
- When the group's membership changes in your IdP, those changes are synchronized with the group in CockroachDB {{ site.data.products.cloud }}. If a CockroachDB {{ site.data.products.cloud }} account is added to or removed from the group in your IdP, they gain or lose roles granted to the group in CockroachDB {{ site.data.products.cloud }}.

This section shows how to view and manage a group's roles in the CockroachDB {{ site.data.products.cloud }} Console or using the [Cloud API]({% link cockroachcloud/cloud-api.md %}).

<div class="filters clearfix">
  <button class="filter-button" data-scope="console">Cloud Console</button>
  <button class="filter-button" data-scope="api"><code>ccloud</code> API</button>
</div>

<section class="filter-content" markdown="1" data-scope="console">

1. In CockroachDB {{ site.data.products.cloud }} Console, click **Access Management > Groups**.
1. In a group's row, click the three-dots **Action** button, then click **Edit Roles**.
1. The group's granted roles are shown. Add or remove roles, then click **Confirm**.

   {{site.data.alerts.callout_info}}
   The fields for inherited roles are read-only, because inherited roles cannot be edited directly. Instead, you must either remove the role from the parent group from which it is inherited, or remove the child group from the parent group.
   {{site.data.alerts.end}}

</section>

<section class="filter-content" markdown="1" data-scope="api">

Each group pushed to CockroachDB {{ site.data.products.cloud }} is assigned an ID, which is required to manage the group's roles using the CockroachDB {{ site.data.products.cloud }} API or Terraform provider, but is not displayed in the CockroachDB {{ site.data.products.cloud }} Console. A group's ID is returned when you:

- [Create the group explicitly](https://cockroachlabs.com/docs/api/cloud/v1.html#post-/api/scim/v2/Groups) using the API (rather than relying on Group Push to create it).
- [List all groups](https://cockroachlabs.com/docs/api/cloud/v1.html#get-/api/scim/v2/Groups/-id-).
- [Search for it by name](https://cockroachlabs.com/docs/api/cloud/v1.html#put-/api/scim/v2/Groups/.search).

To manage a group's roles, you can use the [Role Assignment API](https://www.cockroachlabs.com/docs/api/cloud/v1#get-/api/v1/roles) or the [`cockroach_user_role_grants`](https://registry.terraform.io/providers/cockroachdb/cockroach/latest/docs/resources/user_role_grants) Terraform provider resource.

</section>

## Troubleshooting

### Assigned user is not provisioned in CockroachDB {{ site.data.products.cloud }}

When using Okta, if an assigned user, or all members of an assigned group, are not automatically provisioned, the failed operation is not automatically retried. To view the status of operations and retry failed operations, go to **Dashboard > Tasks** in the Okta admin dashboard. For further assistance, [contact Support](https://support.cockroachlabs.com/).

### Group Push is enabled, but group is not provisioned in CockroachDB {{ site.data.products.cloud }}

When using Okta, if a configured group fails to be provisioned in CockroachDB {{ site.data.products.cloud }}, the failed operation is not automatically retried. To view the status of operations and retry failed operations, go to **Dashboard > Tasks** in the Okta admin dashboard. For further assistance, [contact Support](https://support.cockroachlabs.com/).

## What next?

- Learn more about [Cloud Organization SSO]({% link cockroachcloud/cloud-org-sso.md %})
- [Configure Cloud Organization SSO]({% link cockroachcloud/configure-cloud-org-sso.md %})
- Learn more about [authenticating to CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/authentication.md %}).
- Refer to the following topics in the Okta documentation:

   - [Manage Users](https://help.okta.com/en-us/Content/Topics/users-groups-profiles/usgp-people.htm)
   - [Manage Groups](https://help.okta.com/en-us/Content/Topics/users-groups-profiles/usgp-groups-main.htm)
   - [Manage Group Push](https://help.okta.com/en-us/Content/Topics/users-groups-profiles/usgp-group-push-main.htm)
