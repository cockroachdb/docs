---
title: Authorization in CockroachDB Cloud
summary: Learn about the CockroachDB Cloud Authorization features and concepts
toc: true
docs_area: manage
---

{{ site.data.products.db }}'s authorization model has two levels: the {{ site.data.products.db }} organization and clusters within that organization.

A CockroachDB Cloud *organization* corresponds to a an authorization hierarchy rooted in a billing account. Each {{ site.data.products.db }} cluster is created within an organization. The user of the organization billing account can create or invite other users to the organization, and can grant roles to those organization users.

**Organization users/roles SQL users/roles are distinct from SQL users/roles.** Each CockroachDB cluster has its own set of SQL roles, which allow authenticated users to execute SQL statements via any PostgreSQL-compatible client. An organization user who has the Cluster Admin or Cluster Creator role can create clusters in the organization, create SQL users/roles on those clusters, and grant access to those users and roles by managing the associated credentials or single sign-on (SSO) authentication flows.

See:

- [Overview of Cluster Users/Roles and Privilege Grants in CockroachDB](../{{site.versions["stable"]}}/security-reference/authorization.html)
- [Managing Cluster User Authorization](../{{site.versions["dev"]}}/authorization.html)

## Organization user roles

- **Org member**: the default role given to all organization users upon creation or invitation. This role grants no permissions to perform cluster or org actions.
- **Org. Administrator (legacy)**: the administrator role for organization functions. This role grants the user permissions to perform all functions pertaining to clusters, org users, cluster users, and billing for the organization. In a future release, this role will be deprecated in favor of more fine-grained roles for separately administrating organization-level user-management functions, cluster functions, and billing functions.
- **Org developer (legacy)**: this role allows the user to read information for all clusters, and to create and manage SQL users on all clusters. It is considered deprecated in favor of the more fine-grained cluster roles below.
- **Cluster developer**: the minimum access role for clusters. This role allows users to view the details of one or more specified clusters, as well as change their IP allowlist configuration.
- **Cluster admin**: the administrator role for a specific database cluster, including managing SQL users/roles. This role can be granted to an organization user for one or more specific clusters, or for all clusters in the organization.
- **Cluster creator**: allows an organization user to create clusters in an organization; the cluster creator is automatically granted the cluster admin role on clusters they create.

Within an organization, the unit of database functionality is the *CockroachDB cluster*, which corresponds to a networked set of CockroachDB database nodes. All SQL operations and data storage are distributed across the cluster.

Each cluster has its own set of SQL roles, which allow authenticated users to execute SQL statements using any PostgreSQL-compatible client.

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

Org Member, Org Admin, Cluster Admin and Billing Coordinator [to be added soon] are assigned to the first and only user in a CockroachDB Cloud organization. This is done to allow the user perform all possible actions to create & manage clusters, configure billing & view usage etc. 

Once the initial user has added more users to the CockroachDB Cloud organization, it is possible to assign Cluster Admin and Billing Coordinator roles to one or more of those users and optionally remove those roles from the initial user. Latter operation is allowed to satisfy enterprise security standards as some companies like to differentiate between product admins who can manage users, roles, and authentication configuration in a product, and the admins who are allowed to provision core resources in that product (like creating and managing clusters in CockroachDB Cloud).

### Is it possible to assign more than 1 role to a user in a CockroachDB Cloud organization?

Yes, it is possible to assign more than one role to a user. The default minimum access role Org Member is always assigned to every user as long as they’re a part of the CockroachDB Cloud organization. Beyond that, every other assigned role is additive to the overall entitlements of a user. Best example of this is the initial user who is by default assigned the Org Member, Org Admin, Cluster Admin and Billing Coordinator [to be added soon] roles when they create the CockroachDB Cloud organization. 

### Can we follow the least privilege principle by using the roles available in the CockroachDB Cloud authorization model?

Yes, the roles available in the CockroachDB Cloud authorization model allow admins to grant only those entitlements to users that are supposed to map to their intended workflows. 

Cluster level roles like Cluster Admin, Cluster Operator Reader & Writer [to be added soon] or Cluster Developer allow to perform pertinent actions for one or more clusters, while providing differentiation between admin, operational hybrid and non-admin entitlements. Whereas, the Organization level roles like Org Admin and Org Member allow admin and non-admin access respectively for the entire organization, while avoiding overlap with cluster specific actions.

We discourage further use of the Legacy Org Developer role as that may have a broader set of entitlements than what you may want to assign to non-admins. Same would apply to Legacy Org Admin once the new Org Admin [to be added soon] role is available. The legacy roles will be deprecated after the updated CockroachDB Cloud authorization model is generally available to all customers, and will be completely removed six months after that.

### What are the legacy roles in the CockroachDB Cloud authorization model?

Legacy Org Admin and Legacy Org Developer refer to the older roles available in a CockroachDB Cloud organization. These roles have a broad set of entitlements which make it hard to reason about least privilege principle in an organization. 

The new incarnation for Legacy Org Admin will be Org Admin [to be added soon], while the same for Legacy Org Developer will be Org Member which will become the new default role. The new roles will have a limited set of entitlements so that it’s easier to reason about least privilege principle.

The legacy roles will be deprecated after the updated CockroachDB Cloud authorization model is generally available to all customers, and will be completely removed six months after that. At general availability, it will no longer be possible to assign the legacy roles to human users or service accounts.

### Does the CockroachDB Cloud authorization model apply similarly to both service accounts and human users in a CockroachDB Cloud organization?

If the updated authorization model in limited access is enabled for a CockroachDB Cloud organization, then the new roles at both organization & cluster scopes are consistently applicable for all new service accounts and all human users in the organization. Any existing service accounts that were created before the updated authorization model was enabled, follow an older model consisting of Admin-Create-Edit-Read-Delete entitlements. That older permission model will be deprecated once the CockroachDB Cloud authorization model is generally available to all customers, and relevant service accounts will completely stop working six months after that. For such service accounts, an Org Admin or Cluster Admin could opt in to the updated model by assigning one of the new roles at the organization or cluster scopes, which would automatically overwrite the old entitlements pertaining to the older model.

If for some reason, you decide to retire the existing service accounts and plan to create new ones that use the updated authorization model, don’t forget to update your API clients with the new API keys.

### Could I assign a cluster level role to a few users such that they’ve the relevant entitlements on all clusters in the CockroachDB Cloud organization?

Yes, an admin could assign a cluster level role like Cluster Admin, Cluster Operator Reader & Writer [to be added soon] or Cluster Developer on the entire CockroachDB DB Cloud organization or on one or more specific clusters. There are two scopes in the authorization model - organization and clusters, with organization being the parent, and clusters being the children in the hierarchy. So if an admin assigns cluster level roles at the organization scope, they are automatically applicable on all clusters in the CockroachDB DB Cloud organization. Such access should be granted after due consideration and only to users who are going to work with all clusters. Otherwise it could lead to unintended privilege escalation and thus potential access to data when it shouldn’t be allowed.


### What happens if an admin removes all role assignments for a particular user? Is that user removed from the CockroachDB Cloud organization?

When all role assignments have been removed for a user, they still retain the Org Member role which is added at the time when a user is added to the CockroachDB Cloud organization. The user is not automatically removed at that point. To remove a user from the CockroachDB Cloud organization, the admin should take the specific remove action.

### Which roles are allowed to add and remove users, and manage their role assignments in a CockroachDB Cloud organization?

Only users with the Org Admin role are allowed to add and remove users in a CockroachDB Cloud organization, and manage role assignments at both organization and cluster scopes. In addition, users with the Cluster Admin role are allowed to manage role assignments at the cluster scope (only clusters on which the Cluster Admin role is itself assigned to the user). If a user has been assigned both Org Admin and Cluster Admin roles at the organization scope (which is true for the initial user by default), they could manage role assignments for other users at both organization and cluster scopes.

### Why is the Cluster Creator role useful for when there’s a Cluster Admin role as well?

Cluster Creator role entitles a user to create new clusters in the CockroachDB Cloud organization, and is thus only assignable at the organization scope. Once the cluster is created, the user is additionally granted Cluster Admin role on that cluster automatically. Now, if a user has been already assigned the Cluster Admin role at the organization scope, they are allowed to create new clusters too. So why is the Cluster Creator role needed?

This slight duplication is intentional and it allows admins to provide users from different projects or teams access to create and fully manage their own clusters, while not having automatic access to clusters of other projects or teams. E.g. Users A and B from two different teams could both be assigned the Cluster Creator role, and then they are allowed to fully manage the clusters for their respective teams (by the virtue of automatically assigned Cluster Admin role), without having any access to the clusters of the other team.

### Are SQL roles part of the CockroachDB Cloud authorization model?

No, the SQL roles assignable to SQL users in a CockroachDB cluster are different from the roles available in the CockroachDB Cloud authorization model. Those have to be managed separately within each cluster.

### What are the possible ways to assign roles available in the CockroachDB Cloud authorization model to service accounts and human users?

An admin could assign roles to human users using either the access management UI in the CockroachDB Cloud Console or using the role assignment API (also available through CockroachDB Cloud Terraform Provider).

Role assignment for service accounts can only be done using the role assignment API for now. Relevant support will be available in the access management UI soon.

### Is there a way to track who is assigning what roles to which users in a CockroachDB Cloud Organization?

Yes, a user with the Org Admin role could use the Cloud Organization Audit Logs capability to track when users are added and removed in the CockroachDB Cloud organization, and whenever any role assignment changes are performed for those users.
