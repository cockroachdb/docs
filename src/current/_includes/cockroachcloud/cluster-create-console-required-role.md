**Required Permissions**

A user must have one of the following [organization roles]({% link cockroachcloud/authorization.md %}#organization-user-roles) in order to create a cluster in that organization:

- The [Cluster Creator role]({% link cockroachcloud/authorization.md %}#cluster-creator).
- The [Cluster Administrator role]({% link cockroachcloud/authorization.md %}#cluster-administrator)  scoped to the entire organization (Cluster Creator can be assigned to a single cluster, which does not allow the user to create new clusters).
- The deprecated [Org Administrator (legacy) role]({% link cockroachcloud/authorization.md %}#org-administrator-legacy).