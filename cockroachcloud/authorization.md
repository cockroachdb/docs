---
title: CockroachDB Cloud Access Management Overview and FAQ
summary: Learn about the CockroachDB Cloud Authorization features and concepts
toc: true
docs_area: manage
---

This page covers the essential concepts related to access management (authorization) in {{ site.data.products.db }}. Procedures for managing access are covered in [Managing Access in {{ site.data.products.db }}](managing-access.html).

{% include_cached cockroachcloud/fgac-transition-callout.md %}

## Overview of the CockroachDB Cloud two-level authorization model

**The {{ site.data.products.db }} console**, found at `https://cockroachlabs.cloud/`, is a 'single pane of glass' for managing users, billing, and all functions for administering {{ site.data.products.serverless }} and {{ site.data.products.dedicated }} clusters. When accessing the console, users must sign in to a CockroachDB Cloud **organization** (or create a new one).

You can also execute many administrative commands using the `ccloud` command-line utility and the {{ site.data.products.db }} API:

- `ccloud` allows human users to authenticate their terminal via a browser token from the {{ site.data.products.db }} console.
- The {{ site.data.products.db }} API allows [service accounts](#service-accounts) to authenticate via API keys, which are issued through the console.
- You can [use Terraform to provision users and other aspects of your {{ site.data.products.db }} clusters](provision-a-cluster-with-terraform.html). However, note that currently Terraform can only be used to provision admin SQL users, as this is a current limitation of the API, on which Terraform depends.

In {{ site.data.products.db }}, an organization corresponds to an authorization hierarchy linked to a billing account. Within each CockroachDB Cloud organization, the unit of database functionality is the *CockroachDB cluster*, which corresponds to a networked set of CockroachDB cluster nodes. SQL operations and data storage are distributed over a cluster. Every cluster belong to an organization.

{{ site.data.products.db }} has a two-level authorization model:

1. SQL level within a cluster: Each CockroachDB cluster has its own set of SQL users and roles defined in it. Roles grant users permission to execute some set of SQL statements against some set of database resources (like tables, databases) on the cluster.
1. Organization level: Each {{ site.data.products.db }} organization has a set of roles defined on it, which allow users to perform administrative tasks relating to the management of clusters, organization users, SQL users, and billing.

This page primarily covers the latter, organization level. However, the two levels intersect because administrating SQL-level users on specific clusters within an organization is an organization-level function.

For the main pages covering users and roles at the SQL level within a specific database cluster, see:

- [Overview of Cluster Users/Roles and Privilege Grants in CockroachDB](../{{site.versions["stable"]}}/security-reference/authorization.html)
- [Managing Cluster User Authorization](../{{site.versions["dev"]}}/authorization.html)

## Organization user roles

When a user is first added to an organization, they are granted the default role, **Org member**, which grants no permissions and just indicates the membership in the organization. Org. Administrators may edit the roles assigned to organization users in the {{ site.data.products.db }} console's **Access Management** page, or using the CockroachDB Cloud API / Terraform Provider.

To learn more, refer to [Manage organization users](managing-access.html#manage-an-organizations-users)

The following roles may be granted to {{ site.data.products.db }} organization users within a specific organization:

- Org member
- Org Administrator (legacy)
- Org developer (legacy)
- Cluster developer
- Cluster admin
- Cluster creator

### Organization member
This default role is granted to all organization users once they are invited. It grants no permissions to perform cluster or org actions.
### Org Administrator (legacy)
Org Administrators can manage the organization and its members, clusters, and configuration. This role grants the user permissions to perform all critical functions managing a {{ site.data.products.db }} organization:

- [Create a cluster](create-your-cluster.html)
- [Invite Team Members to the organization](managing-access.html#invite-team-members-to-an-organization)
- [Manage an organization's users and their roles](managing-access.html#manage-an-organizations-users)
- [Create and manage SQL users](managing-access.html#create-a-sql-user)
- [Manage billing for the organization](billing-management.html)
- [Restore databases and tables from a {{ site.data.products.db }} backup](use-managed-service-backups.html#ways-to-restore-data)
- [Delete an organization](managing-access.html#delete-an-organization)
{{site.data.alerts.callout_info}}
In a future release, this role will be deprecated in favor of more fine-grained roles for separately administering organization-level user-management functions, cluster management functions, and billing management functions.
{{site.data.alerts.end}}
  
### Org developer (legacy)
Org Developers can read high-level information for all clusters, and monitor all clusters using DB Console.
{{site.data.alerts.callout_info}}
In a future release, this role will be deprecated in favor of more fine-grained roles introduced below.
{{site.data.alerts.end}}
### Cluster developer
Cluster Developers can view the details of clusters and can change their IP allowlist configuration. This role can be granted for specific clusters or for all clusters in the organization.
### Cluster administrator
Cluster Administrators can manage SQL users and roles for a cluster. This role can be granted for one or more specific clusters, or for all clusters in the organization.
### Cluster creator
Cluster Creators can create clusters in an organization. A cluster's creator is automatically granted this role for that cluster.

## Service accounts

Service accounts authenticate with API keys and the {{ site.data.products.db }} API, rather than  {{ site.data.products.db }} Console.

Service accounts operate under a unified authorization model with organization users, and can be assigned all of the same [organization roles](#organization-user-roles) as users.

However, 'legacy service accounts' that were created before the updated authorization model was enabled for your cloud organization may have permissions assigned under the legacy model (like ADMIN, CREATE, EDIT, READ, DELETE). The legacy model for service accounts will be deprecated in a future release. It's recommended to update such service accounts with updated organization roles.

To learn more, refer to [Manage Service Accounts](managing-access.html#manage-service-accounts)

## Cluster roles for organization users using Cluster SSO

Cluster Single Sign-On (SSO) for {{ site.data.products.db }} allows authorized organization users to directly access clusters within the organization via [`ccloud`](ccloud-get-started.html), the {{ site.data.products.db }} command line interface.

However, because organization users and cluster SQL users are logically separate, a corresponding SQL user must be created for each SSO organization user, on each particular cluster.

This correspondence lies in the SQL user name, which must be in the format `sso_{email_name}`. Replace '(email_name}' with the portion of the user's email address before `@`. For example, the SQL username of a user with the email address `docs@cockroachlabs.com`  is `sso_docs`. If the role is not set up correctly, `ccloud` prompts you to create or add it. Only an SQL admin can manage SQL users.

## FAQ

### What role is assigned to new  {{ site.data.products.db }} members? What entitlements are included?

Org Member is the default and only role assignable to new users as they are added to a CockroachDB Cloud organization. This role has most minimum entitlements across all the available roles, including just the ability to view the list of available clusters and high-level organization information like ID, Name, Label etc. 

### What is the minimum access role that can be granted on a cluster?

Cluster Developer is the minimum access role that can be assigned to a cluster user on a cluster. Cluster Developers can view the details of the target cluster and can modify its IP allowlist.

### What roles are assigned to the user that creates a CockroachDB Cloud organization and thus becomes the first and only user in that organization?

Org Member, Org Admin (legacy), and Cluster Admin are assigned to the first and only user in a CockroachDB Cloud organization. This is done to allow the user to perform all actions required to invite other users, create and manage clusters, configure billing, etc. 

Once the initial user has added more users to the CockroachDB Cloud organization, it is possible to assign Cluster Admin role to one or more of those users and optionally remove that role from the initial user.

{{site.data.alerts.callout_info}}
In a future release, Org Admin (legacy) role will be deprecated in favor of more fine-grained roles for separately administering organization-level user-management functions, cluster management functions, and billing management functions.
{{site.data.alerts.end}}

### Is it possible to assign more than one role to a user in a {{ site.data.products.db }} organization?

Yes, it is possible, and often necessary, to assign more than one role to a user. The default minimum access role Org Member is always assigned to every user as long as they’re a part of the CockroachDB Cloud organization. Beyond that, every other assigned role is additive to the overall entitlements of a user. Best example of this is the initial user who is by default assigned the Org Member, Org Admin (legacy), and Cluster Admin roles when they create the CockroachDB Cloud organization. 

### Can we follow the least privilege principle by using the roles available in the CockroachDB Cloud authorization model?

Yes, the roles available in the CockroachDB Cloud authorization model allow admins to grant only those entitlements to users that are supposed to map to their intended workflows. 

Cluster level roles like Cluster Admin or Cluster Developer allow to perform pertinent actions for one or more clusters, while providing differentiation between admin and non-admin entitlements. Whereas, the Organization level roles like Org Admin (legacy), Org Developer (legacy) allow admin and non-admin access respectively for the entire organization.

{{site.data.alerts.callout_info}}
In a future release, legacy roles will be deprecated in favor of more fine-grained roles for separately administering organization-level user-management functions, cluster management functions, and billing management functions.
{{site.data.alerts.end}}


### Is the same authorization model used for both service accounts and human users in a {{ site.data.products.db }} organization?

Yes, for service accounts created after the updated authorization model is enabled for your organization. Service accounts created previously continue to use the older authorization model. See [Service Accounts](#service-accounts).

### Can I assign a cluster-level role to a few users such that they have the relevant entitlements on all clusters in the {{ site.data.products.db }} organization?

Yes, an admin could assign a cluster level role like Cluster Admin or Cluster Developer on the entire CockroachDB DB Cloud organization or on one or more specific clusters. There are two scopes in the authorization model - organization and clusters, with organization being the parent, and clusters being the children in the hierarchy. So if an admin assigns cluster level roles at the organization scope, they are automatically applicable on all clusters in the CockroachDB DB Cloud organization. Such access should be granted only to users who need to work with all clusters.

### What happens if an admin removes all role assignments for a particular user? Is that user removed from the CockroachDB Cloud organization?

When all role assignments have been removed for a user, they still implicitly have the Org Member role which is granted to each newly-added {{ site.data.products.db }} member, and the member is not automatically removed from the organization. To manually remove a member, refer to [Manage Team Members](../cockroachcloud/console-access-management.html#manage-team-members).

### Which roles grant the ability to add, remove, and manage members in in a {{ site.data.products.db }} organization?

Users with the Org Admin (legacy) role are allowed to manage users and roles at both the organization and the cluster levels. Users with the Cluster Admin role are only allowed to manage role assignments at the cluster level.

### What is the Cluster Creator role useful for when there’s a Cluster Admin role as well?

A user with the Cluster Creator role can create new clusters in the {{ site.data.products.db }} organization, so this role can be assigned only at the organization scope.

After the cluster is created, its creator is automatically granted the Cluster Admin role on that cluster. If that user already had the Cluster Admin role at the organization scope, this cluster-specific grant appears to have no effect.

This overlap allows admins to give users from different projects or teams access to create and fully manage their own clusters without the ability to manage clusters owned by other projects or teams. For example, two different users from different teams could each be granted the Cluster Creator role so that they can fully manage clusters they own but not clusters owned by anyone else.

### Are SQL roles part of the CockroachDB Cloud authorization model?

{{ site.data.products.db }} has a two-level authorization model:

1. SQL level in a cluster: Each CockroachDB cluster has its own set of SQL users and roles defined in it. Roles grant users permission to execute some set of SQL statements against some set of database resources (like tables, databases) on the cluster.
2. Organization level: Each {{ site.data.products.db }} organization has a set of roles defined in it, which allow users to perform administrative tasks relating to the management of clusters, organization users, SQL users, and billing.

### What methods can an admin use to assign organization-wide and cluster-specific roles service accounts and human users?

To manage roles for human users, you can use [Cloud Console](../cockroachcloud/console-access-management.htm), the [Cloud API](../cockroachcloud/cloud-api.html), or the [CockroachDB Terraform provider](https://registry.terraform.io/providers/cockroachdb/cockroach/latest).

To manage roles for service accounts, you must use the [Cloud API](../cockroachcloud/cloud-api.html).

### How can we track and audit role-assignment actions in a {{ site.data.products.db }} organization?

Any user with the Org Admin role can access [Cloud Organization audit logs](cloud-org-audit-logs.html) capability to track when users are added and removed in the CockroachDB Cloud organization, and whenever any role assignment changes are performed for those users.
