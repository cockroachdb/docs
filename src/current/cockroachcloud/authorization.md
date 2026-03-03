---
title: CockroachDB Cloud Access Management (Authorization) Overview
summary: Learn about CockroachDB Cloud authorization features and concepts
toc: true
docs_area: manage
---

This page covers the essential concepts related to access management (authorization) in CockroachDB {{ site.data.products.cloud }}. Procedures for managing access are covered in [Managing Users, Roles, and Service Accounts in CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/managing-access.md %}).

## Overview of the CockroachDB {{ site.data.products.cloud }} authorization model

**The CockroachDB {{ site.data.products.cloud }} console**, found at `https://cockroachlabs.cloud/`, is a 'single pane of glass' for managing users, billing, and all functions for administering clusters in CockroachDB {{ site.data.products.cloud }}. When accessing the console, users must sign in to a CockroachDB {{ site.data.products.cloud }} **organization** (or create a new one).

You can also execute many administrative commands using the `ccloud` command-line utility and the CockroachDB {{ site.data.products.cloud }} API:

- `ccloud` allows human users to authenticate their terminal via a browser token from the CockroachDB {{ site.data.products.cloud }} console.
- The CockroachDB {{ site.data.products.cloud }} API allows [service accounts](#service-accounts) to authenticate via API keys, which are issued through the console.
- You can [use Terraform to provision users and other aspects of your CockroachDB {{ site.data.products.cloud }} clusters]({% link cockroachcloud/provision-a-cluster-with-terraform.md %}). However, note that currently Terraform can only be used to provision admin SQL users, as this is a current limitation of the API, on which Terraform depends.

In CockroachDB {{ site.data.products.cloud }}, an organization corresponds to an authorization hierarchy linked to a billing account. Within each CockroachDB {{ site.data.products.cloud }} organization, the unit of database functionality is the *CockroachDB cluster*, which corresponds to a networked set of CockroachDB cluster nodes. SQL operations and data storage are distributed over a cluster. Every cluster belongs to an organization.

CockroachDB {{ site.data.products.cloud }} has a hierarchical authorization model, where roles can be assigned at different scopes:

1. Organization: A CockroachDB {{ site.data.products.cloud }} organization assigns permissions based on [roles](#organization-user-roles) assigned to a {{ site.data.products.cloud }} Console user account, which allow these accounts to perform administrative tasks relating to the management of clusters, Console user management, SQL user management, and billing.
1. Folder: {{ site.data.products.cloud }} Console [roles](#organization-user-roles) can be assigned to a folder containing a group of clusters. Role inheritance is transitive; a role applied with the organization or folder scope is inherited by descendent resources.

    {{site.data.alerts.callout_success}}
    Organizing clusters using folders is available in [Preview]({% link {{site.current_cloud_version}}/cockroachdb-feature-availability.md %}#feature-availability-phases). To learn more, refer to [Organize {{ site.data.products.db }} Clusters Using Folders]({% link cockroachcloud/folders.md %}).
    {{site.data.alerts.end}}

1. Cluster: Each CockroachDB cluster defines its own set of [SQL users]({% link {{ site.current_cloud_version }}/security-reference/authorization.md %}#create-and-manage-users) and SQL user [roles]({% link {{ site.current_cloud_version }}/security-reference/authorization.md %}#roles) which manage permission to execute SQL statements on the cluster. 

The levels within the hierarchy intersect, because administering SQL-level users on specific clusters within an organization is an organization-level function.

{{site.data.alerts.callout_info}}
SQL users are granted a distinct set of roles and privileges that are specific to data management on the cluster, independent of the {{ site.data.products.cloud }} user roles and permissions described on this page. For the main pages covering users and roles at the SQL level within a specific database cluster, refer to the main [Authorization in CockroachDB documentation]({% link {{site.current_cloud_version}}/security-reference/authorization.md %})
{{site.data.alerts.end}}. The [GRANT]({% link {{site.current_cloud_version}}/grant.md %}) SQL statement cannot be used to assign {{ site.data.products.cloud }} roles and permissions.

## Organization user roles

When a user or service account is first added to an organization, they are assigned the default Console role, **Organization Member**, which adds no permissions and only indicates membership in the organization. Users with the Organization or Cluster Admin role may [edit the roles assigned to organization users]({% link cockroachcloud/managing-access.md %}#change-a-team-members-role) in the CockroachDB {{ site.data.products.cloud }} Console's [**Access Management** page](https://cockroachlabs.cloud/access), or using the CockroachDB {{ site.data.products.cloud }} API or Terraform Provider.

{% include_cached cockroachcloud/first-org-user-roles.md %}

To learn more, refer to [Manage organization users]({% link cockroachcloud/managing-access.md %}#manage-an-organizations-users).

{% include_cached cockroachcloud/org-roles/cloud-roles-table.md %}

The following sections describe the available CockroachDB {{ site.data.products.cloud }} roles in more detail:

### Organization Member

The **Organization Member** role is assigned by default to all organization users when they are invited or provisioned. This role gives no additional permissions.

### Organization Admin

The **Organization Admin** role allows users to perform the following actions:

- [Invite users to join that organization]({% link cockroachcloud/managing-access.md %}#invite-team-members-to-an-organization).
- [Create service accounts]({% link cockroachcloud/managing-access.md %}#create-a-service-account).
- Assign and revoke {{ site.data.products.cloud }} roles for both [users]({% link cockroachcloud/managing-access.md %}#manage-an-organizations-users) and [service accounts]({% link cockroachcloud/managing-access.md %}#manage-service-accounts).

Organization Admins automatically receive [email alerts]({% link cockroachcloud/alerts-page.md %}) about planned cluster maintenance and when CockroachDB {{ site.data.products.cloud }} detects that a cluster is overloaded or experiencing issues. In addition, Organization Admins can subscribe other members to the email alerts, and configure how alerts work for the organization.

This role can be assigned only at the organization scope.

### Billing Coordinator

The **Billing Coordinator** role allows users to [manage and view billing details, invoices, and usage for that organization]({% link cockroachcloud/billing-management.md %}) through the CockroachDB {{ site.data.products.cloud }} console billing page at [`https://cockroachlabs.cloud/billing/overview`](https://cockroachlabs.cloud/billing/overview).

### Billing Viewer

The **Billing Viewer** role allows users to [view billing details, invoices, and usage for that organization]({% link cockroachcloud/billing-management.md %}) through the CockroachDB {{ site.data.products.cloud }} console billing page at [`https://cockroachlabs.cloud/billing/overview`](https://cockroachlabs.cloud/billing/overview).

### Cluster Operator

The **Cluster Operator** role allows actions that are dependent on whether it is assigned to a user or a service account.

- *Users* with this role can perform the following *console operations*:

  - View a cluster's [Overview page]({% link cockroachcloud/cluster-overview-page.md %}), which displays its configuration, attributes and statistics, including cloud provider, region topography, and available and maximum storage and request units.
  - Manage a cluster's databases from the [Databases Page]({% link cockroachcloud/databases-page.md %}).
  - [Scale a cluster's nodes]({% link cockroachcloud/advanced-cluster-management.md %}#scale-your-cluster).
  - View and configure a cluster's authorized networks from the [Networking Page]({% link cockroachcloud/network-authorization.md %}).
  - [Manage network authorization]({% link cockroachcloud/network-authorization.md %}) for a cluster.
  - View backups in a cluster's [Backup and Restore Page]({% link cockroachcloud/managed-backups.md %}#cloud-console).
  - [Restore a cluster from a backup]({% link cockroachcloud/managed-backups.md %}?filters=standard#restore-a-cluster).
  - View a cluster's Jobs from the [Jobs page]({% link cockroachcloud/jobs-page.md %}).
  - View a cluster's Metrics from the [Metrics page]({% link cockroachcloud/metrics.md %}#cockroachdb-cloud-console-metrics-page).
  - View a cluster's Insights from the [Insights page]({% link cockroachcloud/insights-page.md %}).
  - [Upgrade]({% link cockroachcloud/upgrade-cockroach-version.md %}) a cluster's major version of CockroachDB.
  - View a cluster's [PCI-readiness status (Advanced clusters with Security add-on only)]({% link cockroachcloud/cluster-overview-page.md %}?filters=advanced#pci-ready-with-security-add-on).
  - Send a test alert from the [Alerts Page]({% link cockroachcloud/alerts-page.md %}).
  - Configure single sign-on (SSO) enforcement.
  - Access the [DB Console]({% link cockroachcloud/network-authorization.md %}#db-console).
  - Configure a cluster's [maintenance window]({% link cockroachcloud/advanced-cluster-management.md %}#set-a-maintenance-window).
  - [Edit a cluster's labels]({% link cockroachcloud/labels.md %}).

- *Service accounts* with this role can perform the following *API operations*:

  - [Read a cluster summary]({% link cockroachcloud/cloud-api.md %}#get-information-about-a-specific-cluster).
  - [Manage Customer-Managed Encryption Keys (CMEK) for Advanced Clusters]({% link cockroachcloud/managing-cmek.md %})
  - [Export a cluster's logs]({% link cockroachcloud/export-logs.md %}).
  - [Export a cluster's metrics]({% link cockroachcloud/export-metrics.md %}).
  - [Manage network authorization]({% link cockroachcloud/network-authorization.md %}) for a cluster.
  - [View and configure a cluster's Egress Rules]({% link cockroachcloud/egress-perimeter-controls.md %}).
  - [Configure the export of metrics to DataDog or Amazon CloudWatch]({% link cockroachcloud/export-metrics.md %}).

This role can be considered a more restricted alternative to [Cluster Admin](#cluster-admin), as it gives all of the permissions of that role but does **not** allow users to:

- Manage cluster-scoped roles on organization users.
- Manage SQL users from the cloud console.
- Create or delete a cluster.

This role can be assigned at the scope of the organization, on an individual cluster, or on a folder. If assigned to a folder, the role is inherited on the folder's clusters, descendent folders, and their descendants.

### Cluster Admin

The **Cluster Admin** role allows users to perform all [Cluster Operator](#cluster-operator) actions, as well as the following:

- [Provision SQL users for a cluster using the console]({% link cockroachcloud/managing-access.md %}#create-a-sql-user).
- [Create Service Accounts]({% link cockroachcloud/managing-access.md %}#change-a-team-members-role).
- Edit cluster-scope role assignments (specifically, the Cluster Admin, Cluster Operator, and Cluster Developer roles) on [users]({% link cockroachcloud/managing-access.md %}#change-a-team-members-role), and [service accounts]({% link cockroachcloud/managing-access.md %}#edit-roles-on-a-service-account).
- [Edit or delete a cluster]({% link cockroachcloud/cluster-management.md %}).
- Cluster Admins for the whole organization (rather than scoped to a single cluster) can [create new clusters]({% link cockroachcloud/create-your-cluster.md %}).
- Access the [DB Console]({% link cockroachcloud/network-authorization.md %}#db-console).
- Configure a cluster's [maintenance window]({% link cockroachcloud/advanced-cluster-management.md %}#set-a-maintenance-window).

This role can be assigned at the scope of the organization, on an individual cluster, or on a folder. If assigned to a folder, it is inherited on the folder's clusters, descendent folders, and their descendants.

### Cluster Creator

The **Cluster Creator** role allows users to create clusters in an organization. A cluster's creator is automatically assigned the [Cluster Admin](#cluster-admin) role for that cluster upon creation.

This role can be assigned at the scope of the organization or on a folder. If assigned to a folder, it is inherited on the folder's clusters, descendent folders, and their descendants.

### Cluster Developer

The **Cluster Developer** role allows users to view cluster details and access the [DB Console]({% link cockroachcloud/network-authorization.md %}#db-console), allowing them to [export a connection string from the cluster page UI]({% link cockroachcloud/authentication.md %}#the-connection-string), although they will still need a Cluster Admin to [provision their SQL credentials]({% link cockroachcloud/managing-access.md %}#manage-sql-users-on-a-cluster) for the cluster.

This role can be assigned at the scope of the organization, on an individual cluster, or on a folder. If assigned to a folder, it is inherited on the folder's clusters, descendent folders, and their descendants.

### Cluster Monitor

The **Cluster Monitor** role provides read‑only visibility into SQL activity and workload health without broader administrative privileges. Users with this role can view the SQL Activity pages ([Sessions]({% link cockroachcloud/sessions-page.md %}), [Statements]({% link cockroachcloud/statements-page.md %}), and [Transactions]({% link cockroachcloud/transactions-page.md %})), the [Jobs page]({% link cockroachcloud/jobs-page.md %}), and the [Insights page]({% link cockroachcloud/insights-page.md %}).

This role can be assigned at the scope of the organization, on an individual cluster, or on a folder. If assigned to a folder, it is inherited on the folder's clusters, descendent folders, and their descendants.

### Metrics Viewer

The **Metrics Viewer** role grants read‑only access to observability metrics for a cluster without any administrative or data‑manipulation privileges.

- Users with this role can view a cluster's Metrics from the [Metrics page]({% link cockroachcloud/metrics.md %}#cockroachdb-cloud-console-metrics-page).
- Service accounts with this role can access the [metrics export API]({% link cockroachcloud/export-metrics.md %}#the-metricexport-endpoint) and the [log export API]({% link cockroachcloud/export-logs.md %}#the-logexport-endpoint) to integrate with external observability systems.

This role can be assigned at the scope of the organization, on an individual cluster, or on a folder. If assigned to a folder, it is inherited on the folder's clusters, descendent folders, and their descendants.

{{site.data.alerts.callout_info}}
To give a developer the ability to both connect to a cluster and monitor performance with least privilege, combine [**Cluster Developer**](#cluster-developer) with **Metrics Viewer** (and optionally [**Cluster Monitor**](#cluster-monitor)).
{{site.data.alerts.end}}

### Folder Admin

{% capture folder_admin_docs %}{% include cockroachcloud/org-roles/folder-admin.md %}{% endcapture %}
{{ folder_admin_docs | strip }}

### Folder Mover

{% capture folder_mover_docs %}{% include cockroachcloud/org-roles/folder-mover.md %}{% endcapture %}
{{ folder_mover_docs | strip }}

## Service accounts

Service accounts authenticate with API keys to the CockroachDB {{ site.data.products.cloud }} API, rather than to the CockroachDB {{ site.data.products.cloud }} Console UI.

Service accounts operate under a unified authorization model with organization users, and can be assigned all of the same [roles](#organization-user-roles) as users, but note that some actions are available in the console but not the API, or vice versa (For example, in the [Cluster Operator Role](#cluster-operator)).

Refer to [Manage Service Accounts]({% link cockroachcloud/managing-access.md %}#manage-service-accounts).

## Cluster roles for organization users using Cluster SSO

Cluster Single Sign-On (SSO) for CockroachDB {{ site.data.products.cloud }} allows authorized organization users to directly access clusters within the organization via [`ccloud`]({% link cockroachcloud/ccloud-get-started.md %}), the CockroachDB {{ site.data.products.cloud }} command line interface.

However, because organization users and cluster SQL users are logically separate, a corresponding SQL user must be created for each SSO organization user, on each particular cluster.

This correspondence lies in the SQL user name, which must be in the format `sso_{email_name}`. Replace `(email_name}` with the portion of the user's email address before `@`. For example, the SQL username of a user with the email address `docs@cockroachlabs.com`  is `sso_docs`. If the role is not set up correctly, `ccloud` prompts you to create or add it. Only an SQL admin can manage SQL users.
