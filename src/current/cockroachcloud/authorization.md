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

1. Organization: Each CockroachDB {{ site.data.products.cloud }} organization has a set of [roles](#organization-user-roles) defined on it, which allow users to perform administrative tasks relating to the management of clusters, organization users, SQL users, and billing.
1. Folder: [roles](#organization-user-roles) can be assigned on folders. Role inheritance is transitive; a role granted on the organization or a folder is inherited by descendent resources.

    {{site.data.alerts.callout_success}}
    Organizing clusters using folders is available in [Preview]({% link v23.1/cockroachdb-feature-availability.md %}#feature-availability-phases). To learn more, refer to [Organize {{ site.data.products.db }} Clusters Using Folders]({% link cockroachcloud/folders.md %}).
    {{site.data.alerts.end}}

1. Cluster: Each CockroachDB cluster defines its own set of [SQL users]({% link {{ site.current_cloud_version }}/security-reference/authorization.md %}#create-and-manage-users) and [roles]({% link {{ site.current_cloud_version }}/security-reference/authorization.md %}#roles) which manage permission to execute SQL statements on the cluster.

The levels within the hierarchy intersect, because administering SQL-level users on specific clusters within an organization is an organization-level function.

For the main pages covering users and roles at the SQL level within a specific database cluster, refer to:

- [Overview of Cluster Users/Roles and Privilege Grants in CockroachDB]({% link {{site.current_cloud_version}}/security-reference/authorization.md %})
- [Managing Cluster User Authorization]({% link {{site.current_cloud_version}}/security-reference/authorization.md %})

## Organization user roles

When a user or service account is first added to an organization, they are granted the default role, **Org Member**, which grants no permission and only indicates membership in the organization. Org or Cluster Administrators may [edit the roles assigned to organization users]({% link cockroachcloud/managing-access.md %}#change-a-team-members-role) in the CockroachDB {{ site.data.products.cloud }} console's [**Access Management** page](https://cockroachlabs.cloud/access), or using the CockroachDB {{ site.data.products.cloud }} API or Terraform Provider.

{% include_cached cockroachcloud/first-org-user-roles.md %}

To learn more, refer to [Manage organization users]({% link cockroachcloud/managing-access.md %}#manage-an-organizations-users).

The following CockroachDB {{ site.data.products.cloud }} organization roles can be granted:

### Organization Member

This default role is granted to all organization users when they are invited or provisioned. It grants no permissions to perform cluster or organization actions.

### Org Administrator

Org Administrators can:

- [Invite users to join that organization]({% link cockroachcloud/managing-access.md %}#invite-team-members-to-an-organization).
- [Create service accounts]({% link cockroachcloud/managing-access.md %}#create-a-service-account).
- Grant and revoke roles for both [users]({% link cockroachcloud/managing-access.md %}#manage-an-organizations-users) and [service accounts]({% link cockroachcloud/managing-access.md %}#manage-service-accounts).

Org Administrators automatically receive [email alerts]({% link cockroachcloud/alerts-page.md %}) about planned cluster maintenance and when CockroachDB {{ site.data.products.cloud }} detects that a cluster is overloaded or experiencing issues. In addition, Org Administrators can subscribe other members to the email alerts, and can configure how alerts work for the organization.

This role can be granted only at the scope of the organization.

### Billing Coordinator

Users with this role in an organization can [manage billing for that organization]({% link cockroachcloud/billing-management.md %}) through the CockroachDB {{ site.data.products.cloud }} console billing page at [`https://cockroachlabs.cloud/billing/overview`](https://cockroachlabs.cloud/billing/overview).

### Cluster Operator

Cluster Operators can perform a variety of cluster functions:

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
  - [Upgrade]({% link cockroachcloud/upgrade-to-{{site.current_cloud_version}}.md %}) a cluster's CockroachDB version.
  - View a cluster's [PCI-readiness status (Advanced clusters with Security add-on only)]({% link cockroachcloud/cluster-overview-page.md %}?filters=advanced#pci-ready-with-security-add-on).
  - Send a test alert from the [Alerts Page]({% link cockroachcloud/alerts-page.md %}).
  - Configure single sign-on (SSO) enforcement.
  - Access the [DB Console]({% link cockroachcloud/network-authorization.md %}#db-console).
  - Configure a cluster's [maintenance window]({% link cockroachcloud/advanced-cluster-management.md %}#set-a-maintenance-window).

- *Service accounts* with this role can perform the following *API operations*:

  - [Read a cluster summary]({% link cockroachcloud/cloud-api.md %}#get-information-about-a-specific-cluster).
  - [Manage Customer-Managed Encryption Keys (CMEK) for Advanced Clusters]({% link cockroachcloud/managing-cmek.md %})
  - [Export a cluster's logs]({% link cockroachcloud/export-logs.md %}).
  - [Export a cluster's metrics]({% link cockroachcloud/export-metrics.md %}).
  - [Manage network authorization]({% link cockroachcloud/network-authorization.md %}) for a cluster.
  - [View and configure a cluster's Egress Rules]({% link cockroachcloud/egress-perimeter-controls.md %}).
  - [Configure the export of metrics to DataDog or Amazon CloudWatch]({% link cockroachcloud/export-metrics.md %}).

This role can be considered a more restricted alternative to [Cluster Administrator](#cluster-administrator), as it grants all of the permissions of that role, except that it does **not** allow users to:

- Manage cluster-scoped roles on organization users.
- Manage SQL users from the cloud console.
- Create or delete a cluster.

This role can be granted at the scope of the organization, on an individual cluster, or on a folder. If granted on a folder, it is inherited on the folder's clusters, descendent folders, and their descendants.

### Cluster Administrator

Cluster Administrators can perform all of the [Cluster Operator actions](#cluster-operator), as well as:

- [Provision SQL users for a cluster using the console]({% link cockroachcloud/managing-access.md %}#create-a-sql-user).
- [Create Service Accounts]({% link cockroachcloud/managing-access.md %}#change-a-team-members-role).
- Edit cluster-scope role assignments (specifically, the Cluster Administrator, Cluster Operator, and Cluster Developer roles) on [users]({% link cockroachcloud/managing-access.md %}#change-a-team-members-role), and [service accounts]({% link cockroachcloud/managing-access.md %}#edit-roles-on-a-service-account).
- [Edit or delete a cluster]({% link cockroachcloud/cluster-management.md %}).
- Cluster Administrators for the whole organization (rather than scoped to a single cluster) can [create new clusters]({% link cockroachcloud/create-your-cluster.md %}).
- Access the [DB Console]({% link cockroachcloud/network-authorization.md %}#db-console).
- Configure a cluster's [maintenance window]({% link cockroachcloud/advanced-cluster-management.md %}#set-a-maintenance-window).

This role can be granted at the scope of the organization, on an individual cluster, or on a folder. If granted on a folder, it is inherited on the folder's clusters, descendent folders, and their descendants.

### Cluster Creator

Cluster Creators can create clusters in an organization. A cluster's creator is automatically granted the [Cluster Administrator](#cluster-administrator) role for that cluster upon creation.

This role can be granted at the scope of the organization or on a folder. If granted on a folder, it is inherited on the folder's clusters, descendent folders, and their descendants.

### Cluster Developer

Users with this role can view cluster details and access the [DB Console]({% link cockroachcloud/network-authorization.md %}#db-console), allowing them to [export a connection string from the cluster page UI]({% link cockroachcloud/authentication.md %}#the-connection-string), although they will still need a Cluster Administrator to [provision their SQL credentials]({% link cockroachcloud/managing-access.md %}#manage-sql-users-on-a-cluster) for the cluster.

This role can be granted at the scope of the organization, on an individual cluster, or on a folder. If granted on a folder, it is inherited on the folder's clusters, descendent folders, and their descendants.

### Folder Admin

{% capture folder_admin_docs %}{% include cockroachcloud/org-roles/folder-admin.md %}{% endcapture %}
{{ folder_admin_docs | strip }}

### Folder Mover

{% capture folder_mover_docs %}{% include cockroachcloud/org-roles/folder-mover.md %}{% endcapture %}
{{ folder_mover_docs | strip }}

## Service accounts

Service accounts authenticate with API keys to the CockroachDB {{ site.data.products.cloud }} API, rather than to the CockroachDB {{ site.data.products.cloud }} Console UI.

Service accounts operate under a unified authorization model with organization users, and can be assigned all of the same [organization roles](#organization-user-roles) as users, but note that some actions are available in the console but not the API, or vice versa (For example, in the [Cluster Operator Role](#cluster-operator)).

Refer to [Manage Service Accounts]({% link cockroachcloud/managing-access.md %}#manage-service-accounts).

## Cluster roles for organization users using Cluster SSO

Cluster Single Sign-On (SSO) for CockroachDB {{ site.data.products.cloud }} allows authorized organization users to directly access clusters within the organization via [`ccloud`]({% link cockroachcloud/ccloud-get-started.md %}), the CockroachDB {{ site.data.products.cloud }} command line interface.

However, because organization users and cluster SQL users are logically separate, a corresponding SQL user must be created for each SSO organization user, on each particular cluster.

This correspondence lies in the SQL user name, which must be in the format `sso_{email_name}`. Replace `(email_name}` with the portion of the user's email address before `@`. For example, the SQL username of a user with the email address `docs@cockroachlabs.com`  is `sso_docs`. If the role is not set up correctly, `ccloud` prompts you to create or add it. Only an SQL admin can manage SQL users.
