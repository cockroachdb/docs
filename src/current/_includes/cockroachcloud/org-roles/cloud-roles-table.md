The following table describes the high level permissions given by each CockroachDB {{ site.data.products.cloud }} user role. Permissions are additive, so a user with multiple roles is given all permissions in each area across all assigned roles.

<div class="roles-table" markdown="1">

|  | Org. Member | Org. Admin | Billing Coord. | Cluster Creator | Cluster Operator | Cluster Admin | Cluster Developer | Folder Admin | Folder Mover |
|---|-------------|-------------|------------------|------------------|-------------------|----------------|--------------------|----------------|----------------|
| **User/Access Management** |  |  |  |  |  |  |  |  |  |
| Assign and revoke roles | — | ✓ | — | — | — | ✓ | — | — | — |
| Assign {{ site.data.products.cloud }} user and service account roles | — | — | — | — | — | ✓ | — | — | — |
| Manage SQL users | — | — | — | — | — | ✓ | — | — | — |
| Manage {{ site.data.products.cloud }} users and service accounts | — | ✓ | — | — | — | ✓ | — | — | — |
| Apply roles at the [folder]({% link cockroachcloud/folders.md %}) scope | — | — | — | — | — | — | — | ✓ | — |
| **Cluster & Infrastructure** |  |  |  |  |  |  |  |  |  |
| Create cluster or [private cluster]({% link cockroachcloud/private-clusters.md %}) | — | — | — | ✓ | — | — | — | — | — |
| Create / edit / delete cluster | — | — | — | — | — | ✓ | — | — | — |
| Edit / delete clusters created by this user | — | — | — | ✓ | — | — | — | — | — |
| Create / delete / manage [folders]({% link cockroachcloud/folders.md %}) | — | — | — | — | — | — | — | ✓ | — |
| Move cluster between [folders]({% link cockroachcloud/folders.md %}) | — | — | — | — | — | — | — | — | ✓ |
| Scale nodes | — | — | — | — | ✓ | ✓ | — | — | — |
| Upgrade CockroachDB | — | — | — | — | ✓ | ✓ | — | — | — |
| Configure [maintenance windows]({% link cockroachcloud/advanced-cluster-management.md %}#set-a-maintenance-window) | — | — | — | — | ✓ | ✓ | — | — | — |
| Use the [{{ site.data.products.cloud }} Terraform provider]({% link cockroachcloud/provision-a-cluster-with-terraform.md %}) | — | — | — | ✓ | — | ✓ | — | — | — |
| **Monitoring & Observability** |  |  |  |  |  |  |  |  |  |
| View cluster details | — | — | — | — | — | — | ✓ | — | — |
| View [audit logs]({% link cockroachcloud/cloud-org-audit-logs.md %}) | — | — | — | — | ✓ | — | — | — | — |
| View [insights]({% link cockroachcloud/insights-page.md %}) | — | — | — | — | ✓ | ✓ | — | — | — |
| View [jobs]({% link cockroachcloud/jobs-page.md %}) | — | — | — | — | ✓ | — | — | — | — |
| View [metrics]({% link cockroachcloud/metrics.md %}) | — | — | — | — | ✓ | ✓ | — | — | — |
| Send [test alerts]({% link cockroachcloud/alerts-page.md %}#send-a-test-alert) | — | — | — | — | ✓ | — | — | — | — |
| Access [DB console]({% link cockroachcloud/network-authorization.md %}#db-console) | — | — | — | — | ✓ | ✓ | ✓ | — | — |
| **Security** |  |  |  |  |  |  |  |  |  |
| Configure [cluster SSO]({% link cockroachcloud/cloud-sso-sql.md %}) | — | — | — | — | ✓ | ✓ | — | — | — |
| Manage [egress perimeter controls]({% link cockroachcloud/egress-perimeter-controls.md %}) | — | — | — | — | — | ✓ | — | — | — |
| Manage [network authorization]({% link cockroachcloud/network-authorization.md %}) | — | — | — | — | ✓ | ✓ | — | — | — |
| View PCI status | — | — | — | — | ✓ | ✓ | — | — | — |
| **Database & Data** |  |  |  |  |  |  |  |  |  |
| Manage databases | — | — | — | — | ✓ | ✓ | — | — | — |
| View / restore [backups]({% link cockroachcloud/backup-and-restore-overview.md %}) | — | — | — | — | ✓ | ✓ | — | — | — |
| **Billing & Licensing** |  |  |  |  |  |  |  |  |  |
| Manage [billing]({% link cockroachcloud/billing-management.md %}) | — | — | ✓ | — | — | — | — | — | — |
| Manage [email alerts]({% link cockroachcloud/alerts-page.md %}#configure-alerts) | — | ✓ | — | — | — | — | — | — | — |
| Manage CockroachDB [Self-Hosted cluster licenses]({% link {{ site.current_cloud_version }}/licensing-faqs.md %}#obtain-a-license) | — | ✓ | — | — | — | — | — | — | — |

</div>

Some roles can be assigned to users at specific levels of scope to provide more granular permission control:

| **Scope level** | **Description** | **Applicable roles** |
|---|---|---|
| `Organization` | Applies to the entire CockroachDB {{ site.data.products.cloud }} organization, including all clusters and folders | `Cluster Operator`, `Cluster Admin`, `Cluster Creator`, `Cluster Developer`, `Billing Coordinator`, `Organization Admin`, `Folder Admin`, `Folder Mover` |
| `Folder` | Applies to clusters within a specific [folder]({% link cockroachcloud/folders.md %}). Only available as a selectable scope if folders have been created within the organization by a user with the `Folder Admin` role | `Cluster Operator`, `Cluster Admin`, `Cluster Creator`, `Cluster Developer`, `Folder Admin`, `Folder Mover` |
| `Cluster` | Applies to a specific cluster | `Cluster Operator`, `Cluster Admin`, `Cluster Developer` |

{% if page.name != 'authorization.md' %}For more information on these roles and the specific permissions given, see [Organization user roles]({% link cockroachcloud/authorization.md %}#organization-member).{% endif %}