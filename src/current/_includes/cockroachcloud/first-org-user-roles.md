{{site.data.alerts.callout_info}}
The user who creates a new organization is assigned the following [roles]({% link cockroachcloud/authorization.md %}#organization-user-roles) at the organization scope:

- [Organization Admin]({% link cockroachcloud/authorization.md %}#organization-admin)
- [Billing Coordinator]({% link cockroachcloud/authorization.md %}#billing-coordinator)
- [Cluster Admin]({% link cockroachcloud/authorization.md %}#cluster-admin)
- [Folder Administrator]({% link cockroachcloud/authorization.md %}#folder-admin)

Any of these roles may subsequently be removed by a user with both the Organization Admin role and the Cluster Admin role at the organization scope. This is to ensure that at least one user has both of these roles.
{{site.data.alerts.end}}
