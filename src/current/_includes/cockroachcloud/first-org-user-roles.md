{{site.data.alerts.callout_info}}
The user who creates a new organization is assigned the following [roles]({% link cockroachcloud/authorization.md %}#organization-user-roles) at the organization scope:

- [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator)
- [Billing Coordinator]({% link cockroachcloud/authorization.md %}#billing-coordinator)
- [Cluster Administrator]({% link cockroachcloud/authorization.md %}#cluster-administrator)
- [Folder Administrator]({% link cockroachcloud/authorization.md %}#folder-admin)

Any of these roles may subsequently be removed by a user with both the Org Administrator role and the Cluster Admin role at the organization scope. This is to ensure that at least one user has both of these roles.
{{site.data.alerts.end}}
