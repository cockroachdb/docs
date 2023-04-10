---
title: CockroachDB Cloud Access Management Overview and FAQ
summary: Learn about the CockroachDB Cloud Authorization features and concepts
toc: true
docs_area: manage
---

This page covers the essential concepts related to access management (authorization) in {{ site.data.products.db }}. Procedures for managing access are covered in [Managing Access in {{ site.data.products.db }}](managing-access.html).


## Overview of the CockroachDB Cloud two-level authorization model

**The {{ site.data.products.db }} console**, found at `https://cockroachlabs.cloud/`, is a 'single pane of glass' for managing users, billing, and all functions for adminstering {{ site.data.products.serverless }} and {{ site.data.products.dedicated }} clusters. When accessing the console, users must sign in to a CockroachDB Cloud **organization** (or create a new one).

Many administrative functions can also be executed using the `ccloud` command line utility and the CockroachDB Cloud API:

- `ccloud` allows human users to authenticate their terminal via a browser token from the {{ site.data.products.db }} console.
- The {{ site.data.products.db }} API allows [service accounts](#service-accounts) to authenticate via API keys, which are issued through the console.

In {{ site.data.products.db }}, an organization corresponds to an authorization hierarchy rooted in a billing account. Within each CockroachDB Cloud organization, the unit of database functionality is the *CockroachDB cluster*, which corresponds to a networked set of CockroachDB database nodes. SQL operations and data storage are distributed over a cluster. Every clusters belong to an organization.

{{ site.data.products.db }} has a two-level authorization model:

1. Cluster/SQL level: Each CockroachDB cluster has its own set of SQL users and roles defined on it. Roles grant users permission to execute some set of SQL statements against some set of database resources on the cluster.
2. Organization level: Each {{ site.data.products.db }} organization has a set of roles defined on it, which allow users to perform administrative tasks relating to the management of clusters, organization users, SQL users, and billing.

This page primarily covers the latter, organization level. However, the two levels intersect because administrating SQL-level users on specific clusters within an organization is an organization-level function.

For the main pages covering users and roles at the SQL levelandmdash;within a specific database cluster, see:

- [Overview of Cluster Users/Roles and Privilege Grants in CockroachDB](../{{site.versions["stable"]}}/security-reference/authorization.html)
- [Managing Cluster User Authorization](../{{site.versions["dev"]}}/authorization.html)

## Organization user roles

When a user is first added to an organization, they will have the default role, **Org member**, which grants no permissions. Org. Administrators may edit the roles assigned to organization users in the {{ site.data.products.db }} console's **Access Management** page, or using the CockroachDB Cloud API.

See: [Managing Access in CockroachDB Cloud: Manage organization users](managing-access.html#manage-an-organizations-users)

The following roles may be granted to {{ site.data.products.db }} organization users within a specific organization:

- Org member
- Org Administrator (legacy)
- Org developer (legacy)
- Cluster developer
- Cluster admin
- Cluster creator

### Organization member
The default role given to all organization users upon creation or invitation. This role grants no permissions to perform cluster or org actions.
### Org Administrator (legacy)
The administrator role for organization functions. This role grants the user permissions to perform all critical functions managing a {{ site.data.products.db }} organization:

- [Create a cluster](create-your-cluster.html)
- [Invite Team Members to the organization](managing-access.html#invite-team-members-to-an-organization)
- [Manage an organization's users and their roles](managing-access.html#manage-an-organizations-users)
- [Create and manage SQL users](managing-access.html#create-a-sql-user)
- [Manage billing for the organization](billing-management.html)
- [Restore databases and tables from a {{ site.data.products.db }} backup](use-managed-service-backups.html#ways-to-restore-data)
- [Delete an organization](managing-access.html#delete-an-organization)
{{site.data.alerts.callout_info}}
In a future release, this role will be deprecated in favor of more fine-grained roles for separately administrating organization-level user-management functions, cluster functions, and billing functions.
{{site.data.alerts.end}}
  
### Org developer (legacy)
This role allows the user to read information for all clusters, and to create and manage SQL users on all clusters. It is considered deprecated in favor of the more fine-grained cluster roles below.
### Cluster developer
The minimum access role for clusters. This role allows users to view the details of one or more specified clusters, as well as change their IP allowlist configuration.
### Cluster administrator
The administrator role for a specific database cluster, including managing SQL users/roles. This role can be granted to an organization user for one or more specific clusters, or for all clusters in the organization.
### Cluster creator
This role alows an organization user to create clusters in an organization; the cluster creator is automatically granted the cluster admin role on clusters they create.

## Service accounts

Service accounts differ from users in that they authenticate with API keys, rather than through the {{ site.data.products.db }} console.

Service accounts currently operate under a unified authorization model with organization users, and can be assigned all of the same [organization roles](#organization-user-roles) as users.

However, 'legacy service accounts'andmdash;service accounts created prior to April 15 ???andmdash;still may have roles assigned under the legacy model.

See: [Managing service accounts](managing-access.html#manage-service-accounts)

## Cluster roles for organization users using Cluster SSO

Cluster Single Sign-On (SSO) for {{ site.data.products.db }} allows authorized organization users to directly access clusters within the organization via [`ccloud`](ccloud-get-started.html), the {{ site.data.products.db }} command line interface.

However, because organization roles and roles on any given SQL cluster are logically separate, a corresponding SQL role must be created for each SSO organization user, on each particular cluster.

This correspondence lies in the SQL role name, which must be in the format `sso_{email_name}`. Replace '(email_name}' with the portion of the user's email address before `@`. For example, the SQL role name of a user with the email address `docs@cockroachlabs.com`  is `sso_docs`. If the role is not set up correctly, `ccloud` prompts you to create or add it. Only an admin can manage users/roles.

## CockroachDB Cloud Authorization Frequently Asked Questions (FAQ)

### What is the default role assigned to users as they’re added to a CockroachDB Cloud organization? What entitlements does that role include?

Org Member is the default and only role assignable to new users as they are added to a CockroachDB Cloud organization. This role has most minimum entitlements across all the available roles, including just the ability to view the list of available clusters and high-level organization information like ID, Name, Label etc. 

### What is the minimum access role that can be granted on a cluster?

Cluster Developer is the minimum access role within the roles that could be assigned to a user on a cluster. It allows users to view the details of the target cluster(s) as well as change the IP allowlisting configuration for those cluster(s).

### What roles are assigned to the user that creates a CockroachDB Cloud organization and thus becomes the first and only user in that organization?

Org Member, Org Admin, Cluster Admin and Billing Coordinator (to be added in a future release) are assigned to the first and only user in a CockroachDB Cloud organization. This is done to allow the user to perform all actions required to invite other users, create and manage clusters, configure billing, etc. 

Once the initial user has added more users to the CockroachDB Cloud organization, it is possible to assign Cluster Admin and Billing Coordinator roles to one or more of those users and optionally remove those roles from the initial user.

### Is it possible to assign more than 1 role to a user in a CockroachDB Cloud organization?

Yes, it is possible, and often necessary, to assign more than one role to a user. The default minimum access role Org Member is always assigned to every user as long as they’re a part of the CockroachDB Cloud organization. Beyond that, every other assigned role is additive to the overall entitlements of a user. Best example of this is the initial user who is by default assigned the Org Member, Org Admin, Cluster Admin and Billing Coordinator (to be added in a future release) roles when they create the CockroachDB Cloud organization. 

### Can we follow the least privilege principle by using the roles available in the CockroachDB Cloud authorization model?

Yes, the roles available in the CockroachDB Cloud authorization model allow admins to grant only those entitlements to users that are supposed to map to their intended workflows. 

Cluster level roles like Cluster Admin, Cluster Operator Reader and Writer (to be added in a future release) or Cluster Developer allow to perform pertinent actions for one or more clusters, while providing differentiation between admin, operational hybrid and non-admin entitlements. Whereas, the Organization level roles like Org Admin and Org Member allow admin and non-admin access respectively for the entire organization, while avoiding overlap with cluster specific actions.

We discourage further use of the Legacy Org Developer role as that may have a broader set of entitlements than what you may want to assign to non-admins. Same would apply to Legacy Org Admin once the new Org Admin (to be added in a future release) role is available. The legacy roles will be deprecated after the updated CockroachDB Cloud authorization model is generally available to all customers, and will be completely removed six months after that.


### Does the CockroachDB Cloud authorization model apply similarly to both service accounts and human users in a CockroachDB Cloud organization?

Yes, for service accounts created after release v23.1. Older, legacy service accounts use an older authorization model. See [Service Accounts](#service-accounts).

### Could I assign a cluster level role to a few users such that they have the relevant entitlements on all clusters in the CockroachDB Cloud organization?

Yes, an admin could assign a cluster level role like Cluster Admin, Cluster Operator Reader and Writer (to be added in a future release) or Cluster Developer on the entire CockroachDB DB Cloud organization or on one or more specific clusters. There are two scopes in the authorization model - organization and clusters, with organization being the parent, and clusters being the children in the hierarchy. So if an admin assigns cluster level roles at the organization scope, they are automatically applicable on all clusters in the CockroachDB DB Cloud organization. Such access should be granted only to users who need to work with all clusters.

### What happens if an admin removes all role assignments for a particular user? Is that user removed from the CockroachDB Cloud organization?

When all role assignments have been removed for a user, they still retain the Org Member role which is added at the time when a user is added to the CockroachDB Cloud organization. The user is not automatically removed at that point. To remove a user from the CockroachDB Cloud organization, the admin should take the specific remove action.

### Which roles are allowed to add and remove users, and manage their role assignments in a CockroachDB Cloud organization?

Only users with the Org Admin role are allowed to add and remove users at the organization level. Users with the Cluster Admin role are allowed to manage role assignments at the cluster level. If a user has been assigned both Org Admin and Cluster Admin roles at the organization scope (which is true for the initial user by default), they can manage role assignments at both organization and cluster scopes.

### Why is the Cluster Creator role useful for when there’s a Cluster Admin role as well?

Cluster Creator role entitles a user to create new clusters in the CockroachDB Cloud organization, and is thus only assignable at the organization scope. Once the cluster is created, the user is additionally granted Cluster Admin role on that cluster automatically. Now, if a user has been already assigned the Cluster Admin role at the organization scope, they are allowed to create new clusters too. So why is the Cluster Creator role needed?

This slight duplication is intentional and it allows admins to provide users from different projects or teams access to create and fully manage their own clusters, while not having automatic access to clusters of other projects or teams. E.g. Users A and B from two different teams could both be assigned the Cluster Creator role, and then they are allowed to fully manage the clusters for their respective teams (by the virtue of automatically assigned Cluster Admin role), without having any access to the clusters of the other team.

### Are SQL roles part of the CockroachDB Cloud authorization model?

{{ site.data.products.db }} has a two-level authorization model:

1. Cluster/SQL level: Each CockroachDB cluster has its own set of SQL users and roles defined on it. Roles grant users permission to execute some set of SQL statements against some set of database resources on the cluster.
2. Organization level: Each {{ site.data.products.db }} organization has a set of roles defined on it, which allow users to perform administrative tasks relating to the management of clusters, organization users, SQL users, and billing.

### What are the possible ways to assign roles available in the CockroachDB Cloud authorization model to service accounts and human users?

An admin could assign roles to human users using either the access management UI in the CockroachDB Cloud Console or using the role assignment API (also available through CockroachDB Cloud Terraform Provider).

Role assignment for service accounts can only be done using the role assignment API for now. Relevant support will be available in the access management UI soon.

### Is there a way to track who is assigning what roles to which users in a CockroachDB Cloud Organization?

Yes, a user with the Org Admin role could use the [Cloud Organization Audit Logs](cloud-org-audit-logs.html) capability to track when users are added and removed in the CockroachDB Cloud organization, and whenever any role assignment changes are performed for those users.
