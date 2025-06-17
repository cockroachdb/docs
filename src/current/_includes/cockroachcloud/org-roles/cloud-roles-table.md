The following table describes the high level permissions given by each CockroachDB {{ site.data.products.cloud }} user role. Permissions are additive, so a user with multiple roles is given all permissions in each area across all assigned roles.

| **Role name** | **User management** | **Billing management** | **Cluster management** | **Database management** | **Monitoring & observability** | **Security & access** | **Backup & restore** | **Folder management** | **Other permissions** |
|---|---|---|---|---|---|---|---|---|---|
| `Organization Member` | None | None | None | None | None | None | None | None | None |
| `Organization Admin` | Manage users and service accounts, assign and revoke roles | None | None | None | None | None | None | None | Manage [enterprise (self-hosted) licenses]({% link {{ site.current_cloud_version }}/licensing-faqs.md %}#obtain-a-license), manage email alerts |
| `Billing Coordinator` | None | Manage billing | None | None | None | None | None | None | None |
| `Cluster Operator` | None | None | Scale nodes, upgrade CockroachDB | Manage Databases | View metrics / insights / logs / jobs | Manage network auth, configure SQL SSO, view PCI status | View / restore backups | None | Access DB console, configure maintenance windows, send test alerts |
| `Cluster Admin` | Manage SQL users, manage service accounts, assign user roles | None | Create / edit / delete cluster, scale nodes, upgrade CockroachDB | Manage databases | View metrics / insights | Manage network auth, configure SQL SSO, view PCI status | View / restore backups | None, unless role is assigned with organization scope | Access DB console, configure maintenance windows |
| `Cluster Creator` | None | None | Create cluster (assigns `Cluster Admin` role for that cluster), edit / delete clusters created by this user | None | None | None, unless role is assigned with organization scope | None | None, unless role is assigned with organization scope | None |
| `Cluster Developer` | None | None | None | None | None | None | None | None | Access DB console, view cluster details |
| `Folder Admin` | Apply roles at the folder scope | None | None | None | None | None | None | Create / delete / manage folders | None |
| `Folder Mover` | None | None | Move cluster between folders | None | None | None | None | None | None |

Some roles can be assigned to users at specific levels of scope to provide more granular permission control:

| **Scope level** | **Description** | **Applicable roles** |
|---|---|---|
| `Organization` | Applies to the entire CockroachDB {{ site.data.products.cloud }} organization, including all clusters and folders | `Cluster Operator`, `Cluster Admin`, `Cluster Creator`, `Cluster Developer`, `Billing Coordinator`, `Organization Admin`, `Folder Admin`, `Folder Mover` |
| `Folder` | Applies to clusters within a specific folder. Only available as a selectable scope if folders have been created within the organization by a user with the `Folder Admin` role | `Cluster Operator`, `Cluster Admin`, `Cluster Creator`, `Cluster Developer`, `Folder Admin`, `Folder Mover` |
| `Cluster` | Applies to a specific cluster | `Cluster Operator`, `Cluster Admin`, `Cluster Developer` |

{% if page.name != 'authorization.md' %}For more information on these roles and the specific permissions given, see [Organization user roles]({% link cockroachcloud/authorization.md %}#organization-member).{% endif %}