---
title: CockroachDB Cloud Access Management (Authorization) FAQ
summary: Frequently asked questions about CockroachDB Cloud
toc: true
docs_area: manage
---

### What role is assigned to new  CockroachDB {{ site.data.products.cloud }} members? What entitlements are included?

Org Member is the default and only role assignable to new users as they are added to a CockroachDB {{ site.data.products.cloud }} organization. This role has most minimum entitlements across all the available roles, including the ability to view the list of available clusters and high-level organization information like ID, Name, Label etc.

### What is the minimum access role that can be granted on a cluster?

Cluster Developer is the minimum access role that can be assigned to a cluster user on a cluster. Cluster Developers can view the details of the target cluster and access DB Console for monitoring.

### What roles are assigned to the user that creates a CockroachDB {{ site.data.products.cloud }} organization and thus becomes the first and only user in that organization?

The user who creates a new organization is assigned a combination of Org Administrator, Billing Coordinator, and Cluster Admin at the organization scope. Any of these roles may subsequently be removed, although another user must have the Org Adminstrator role, and the Cluster Admin role at the organization scope, before either of those can be removed. This is to ensure that at least one user has each of these roles.

### Is it possible to assign more than one role to a user in a CockroachDB {{ site.data.products.cloud }} organization?

Yes, it is possible, and often necessary, to assign more than one role to a user. The default minimum access role Org Member is always assigned to every user as long as they’re a part of the CockroachDB {{ site.data.products.cloud }} organization. Beyond that, every other assigned role is additive to the overall entitlements of a user. For example, the initial user is automatically assigned the Org Member, Org Administrator, Cluster Administrator, and Billing Coordinator roles at organization scope when they create the CockroachDB {{ site.data.products.cloud }} organization.

### Can we follow the least privilege principle by using the roles available in the CockroachDB {{ site.data.products.cloud }} authorization model?

Yes, the roles available in the CockroachDB {{ site.data.products.cloud }} authorization model allow Org Administrators to grant only those entitlements to users that are required for their intended workflows.

Cluster level roles like Cluster Admin, Cluster Operator and Cluster Developer allow users to perform pertinent actions for one or more clusters, while providing differentiation between admin and non-admin entitlements.

### Is the same authorization model used for both service accounts and human users in a CockroachDB {{ site.data.products.cloud }} organization?

Yes, service accounts and human users utilize the same authorization model.

### Can I assign a cluster-level role to a few users such that they have the relevant entitlements on all clusters in the CockroachDB {{ site.data.products.cloud }} organization?

Yes, an admin could assign a cluster level role like Cluster Admin, Cluster Operator or Cluster Developer on the entire CockroachDB DB Cloud organization or on one or more specific clusters. There are two scopes in the authorization model - organization and clusters, with organization being the parent, and clusters being the children in the hierarchy. So if an admin assigns cluster level roles at the organization scope, they are automatically applicable on all clusters in the CockroachDB DB Cloud organization. Such access should be granted only to users who need to work with all clusters.

### If an admin removes all role assignments for a particular user, is that user automatically removed from the CockroachDB {{ site.data.products.cloud }} organization?

When all role assignments have been removed for a user, they still implicitly have the Org Member role which is granted to each newly-added CockroachDB {{ site.data.products.cloud }} member, and the member is not automatically removed from the organization. Refer to: [Remove a team member]({% link cockroachcloud/managing-access.md %}#remove-a-team-member)

### Which roles grant the ability to add, remove, and manage members in a CockroachDB {{ site.data.products.cloud }} organization?

Users with the Org Administrator role are allowed to manage users and roles at both the organization and the cluster scopes. Users with the Cluster Admin role are only allowed to manage role assignments at the cluster scope.

### What is the Cluster Creator role useful for when there’s a Cluster Admin role as well?

A user with the Cluster Creator role can create new clusters in the CockroachDB {{ site.data.products.cloud }} organization, so this role can be assigned only at the organization scope.

After the cluster is created, its creator is automatically granted the Cluster Admin role on that cluster. If that user already had the Cluster Admin role at the organization scope, this cluster-specific grant appears to have no effect.

This overlap allows admins to give users from different projects or teams access to create and fully manage their own clusters without the ability to manage clusters owned by other projects or teams. For example, two different users from different teams could each be granted the Cluster Creator role so that they can fully manage clusters they own but not clusters owned by anyone else.

### Are SQL roles part of the CockroachDB {{ site.data.products.cloud }} authorization model?

CockroachDB {{ site.data.products.cloud }} has a two-level authorization model:

1. SQL level in a cluster: Each CockroachDB cluster has its own set of SQL users and SQL roles defined in it. SQL roles grant SQL users permission to execute some set of SQL statements against some set of database resources (like tables, databases) on the cluster.
2. Organization level: Each CockroachDB {{ site.data.products.cloud }} organization has a set of roles defined in it, which allow users to perform administrative tasks relating to the management of clusters, organization users, SQL users, and billing.

### What methods can an admin use to assign organization-wide and cluster-specific roles to human users and service accounts?

You can use Cloud Console, the [Cloud API]({% link cockroachcloud/cloud-api.md %}), or the [CockroachDB Terraform provider](https://registry.terraform.io/providers/cockroachdb/cockroach/latest) to assign roles to human users.

To manage roles for service accounts, you must use the Cloud API.

Refer to:
- [Manage organization users]({% link cockroachcloud/managing-access.md %}#manage-an-organizations-users)
- [Manage service accounts]({% link cockroachcloud/managing-access.md %}#manage-service-accounts)

### How can we track and audit role-assignment actions in a CockroachDB {{ site.data.products.cloud }} organization?

Any user with the Org Administrator role can access [Cloud Organization audit logs]({% link cockroachcloud/cloud-org-audit-logs.md %}) to track when users are added and removed in the CockroachDB {{ site.data.products.cloud }} organization, and whenever any role assignment changes are performed for those users.
