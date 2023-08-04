---
title: CockroachDB Cloud Access Management (Authorization) Overview
summary: Learn about the {{ site.data.products.db }} Authorization features and concepts
toc: true
docs_area: manage
---

This page covers the essential concepts related to access management (authorization) in {{ site.data.products.db }}. Procedures for managing access are covered in [Managing Users, Roles, and Service Accounts in {{ site.data.products.db }}]({% link cockroachcloud/managing-access.md %}). For Frequently Asked Questions, refer to [CockroachDB Cloud FAQ]({% link cockroachcloud/ccloud-faq.md %}).

## Overview of the {{ site.data.products.db }} two-level authorization model

**The {{ site.data.products.db }} console**, found at `https://cockroachlabs.cloud/`, is a 'single pane of glass' for managing users, billing, and all functions for administering {{ site.data.products.serverless }} and {{ site.data.products.dedicated }} clusters. When accessing the console, users must sign in to a {{ site.data.products.db }} **organization** (or create a new one).

You can also execute many administrative commands using the `ccloud` command-line utility and the {{ site.data.products.db }} API:

- `ccloud` allows human users to authenticate their terminal via a browser token from the {{ site.data.products.db }} console.
- The {{ site.data.products.db }} API allows [service accounts](#service-accounts) to authenticate via API keys, which are issued through the console.
- You can [use Terraform to provision users and other aspects of your {{ site.data.products.db }} clusters]({% link cockroachcloud/provision-a-cluster-with-terraform.md %}). However, note that currently Terraform can only be used to provision admin SQL users, as this is a current limitation of the API, on which Terraform depends.

In {{ site.data.products.db }}, an organization corresponds to an authorization hierarchy linked to a billing account. Within each {{ site.data.products.db }} organization, the unit of database functionality is the *CockroachDB cluster*, which corresponds to a networked set of CockroachDB cluster nodes. SQL operations and data storage are distributed over a cluster. Every cluster belongs to an organization.

{{ site.data.products.db }} has a two-level authorization model:

1. SQL level within a cluster: Each CockroachDB cluster has its own set of SQL users and roles defined in it. Roles grant users permission to execute some set of SQL statements against some set of database resources (like tables, databases) on the cluster.
1. Organization level: Each {{ site.data.products.db }} organization has a set of roles defined on it, which allow users to perform administrative tasks relating to the management of clusters, organization users, SQL users, and billing.

This page primarily covers the latter, organization level. However, the two levels intersect because administrating SQL-level users on specific clusters within an organization is an organization-level function.

For the main pages covering users and roles at the SQL level within a specific database cluster, see:

- [Overview of Cluster Users/Roles and Privilege Grants in CockroachDB](../{{site.versions["stable"]}}/security-reference/authorization.html)
- [Managing Cluster User Authorization](../{{site.versions["dev"]}}/authorization.html)

## Organization user roles

When a user is first added to an organization, they are granted the default role, **Org Member**, which grants no permissions and only indicates membership in the organization. Org or Cluster Administrators may edit the roles assigned to organization users in the {{ site.data.products.db }} console's [**Access Management** page](https://cockroachlabs.cloud/access), or using the {{ site.data.products.db }} API /Terraform Provider.

{% include_cached cockroachcloud/first-org-user-roles.md %}

To learn more, refer to [Manage organization users]({% link cockroachcloud/managing-access.md %}#manage-an-organizations-users).

The following roles may be granted to {{ site.data.products.db }} organization users within a specific organization:

### Organization Member

This default role is granted to all organization users once they are invited. It grants no permissions to perform cluster or org actions.

### Org Administrator

Users with this role on an organization can:

- [Invite users to join that organization]({% link cockroachcloud/managing-access.md %}#invite-team-members-to-an-organization).
- [Create service accounts]({% link cockroachcloud/managing-access.md %}#create-a-service-account).
- Grant and revoke roles for both [users]({% link cockroachcloud/managing-access.md %}#manage-an-organizations-users) and [service accounts]({% link cockroachcloud/managing-access.md %}#manage-service-accounts).

This role replaces the [Org Administrator (legacy)](#org-administrator-legacy) role, which is considered deprecated.

### Billing Coordinator

Users with this role in an organization can [manage billing for that organization]({% link cockroachcloud/billing-management.md %}) through the {{ site.data.products.db }} console billing page at [`https://cockroachlabs.cloud/billing/overview`](https://cockroachlabs.cloud/billing/overview).

### Cluster Operator

This role can be granted for one or more specific clusters, or for all clusters in the organization. It allows users and service accounts to perform a variety of cluster functions:

- *Users* with this role can perform the following *console operations*:

	- View a cluster's [Overview page]({% link cockroachcloud/cluster-overview-page.md %}), which displays its configuration, attributes and statistics, including cloud provider, region topography, and available and maximum storage and request units.
	- Manage a cluster's databases from the [Databases Page]({% link cockroachcloud/databases-page.md %}).
	- [Scale a cluster's nodes]({% link cockroachcloud/cluster-management.md %}#scale-your-cluster).
	- View and configure a cluster's authorized networks from the [Networking Page]({% link cockroachcloud/network-authorization.md %}).
	- View backups in a cluster's [Backup and Restore Page]({% link cockroachcloud/use-managed-service-backups.md %}#backups-tab).
	- [Restore a cluster from a backup]({% link cockroachcloud/use-managed-service-backups.md %}#restore-a-cluster).
	- View a cluster's Jobs from the [Jobs page]({% link cockroachcloud/jobs-page.md %}).
	- View a cluster's Metrics from the [Metrics page]({% link cockroachcloud/metrics-page.md %}).
	- View a cluster's Insights from the [Insights page]({% link cockroachcloud/insights-page.md %}).
	- [Upgrade]({% link cockroachcloud/upgrade-to-v23.1.md %}#step-5-start-the-upgrade) a cluster's CRDB version.
	- View a cluster's [PCI-readiness status (Dedicated Advanced clusters only)]({% link cockroachcloud/cluster-overview-page.md %}?filters=dedicated#pci-ready-dedicated-advanced).
	- Send a test alert from the [Alerts Page]({% link cockroachcloud/alerts-page.md %}).
	- Configure single sign-on (SSO) enforcement.
	- Access the [DB Console]({% link cockroachcloud/network-authorization.md %}#db-console).

- *Service accounts* with this role can perform the following *API operations*:

	- [Read a cluster summary]({% link cockroachcloud/cloud-api.md %}#get-information-about-a-specific-cluster).
	- [Manage Customer-Managed Encryption Keys (CMEK) for Dedicated Clusters]({% link cockroachcloud/managing-cmek.md %})
	- [Export a cluster's logs]({% link cockroachcloud/export-logs.md %}).
	- [Export a cluster's metrics]({% link cockroachcloud/export-metrics.md %}).
	- [View and configure a cluster's Egress Rules]({% link cockroachcloud/egress-perimeter-controls.md %}).
	- [Configure the export of metrics to DataDog or AWS CloudWatch]({% link cockroachcloud/export-metrics.md %}).

This role can be considered a more restricted alternative to [Cluster Administrator](#cluster-administrator), as it grants all of the permissions of that role, except that it does **not** allow users to:

- Manage cluster-scoped roles on organization users.
- Manage SQL users from the cloud console.
- Create or delete a cluster.

### Cluster Administrator

This role can be granted for one or more specific clusters, or for all clusters in the organization.

Cluster Administrators can perform all of the [Cluster Operator actions](#cluster-operator), as well as:

- [Provision SQL users for a cluster using the console]({% link cockroachcloud/managing-access.md %}#create-a-sql-user).
- [Create Service Accounts]({% link cockroachcloud/managing-access.md %}#change-a-team-members-role).
- Edit cluster-scope role assignments (specifically, the Cluster Administrator, Cluster Operator, and Cluster Developer roles) on [users]({% link cockroachcloud/managing-access.md %}#change-a-team-members-role), and [service accounts]({% link cockroachcloud/managing-access.md %}#edit-roles-on-a-service-account).
- [Edit or delete a cluster]({% link cockroachcloud/cluster-management.md %}).
- Cluster Administrators for the whole organization (rather than scoped to a single cluster) can [create new clusters]({% link cockroachcloud/create-your-cluster.md %}).
- Access the [DB Console]({% link cockroachcloud/network-authorization.md %}#db-console).

### Cluster Creator

Cluster Creators can create clusters in an organization. A cluster's creator is automatically granted the [Cluster Administrator](#cluster-administrator) role for that cluster upon creation.

### Cluster Developer

Users with this role can view cluster details and access the [DB Console]({% link cockroachcloud/network-authorization.md %}#db-console), allowing them to [export a connection string from the cluster page UI]({% link cockroachcloud/authentication.md %}#the-connection-string), although they will still need a Cluster Administrator to [provision their SQL credentials]({% link cockroachcloud/managing-access.md %}#manage-sql-users-on-a-cluster) for the cluster.

This role can be granted for specific clusters or for all clusters in the organization.

## Legacy Roles (deprecated)

### Org Administrator (legacy)

Org Administrator (legacy) can manage the organization and its members, clusters, and configuration. This role grants the user permissions to perform all critical functions managing a {{ site.data.products.db }} organization:

- [Create or delete a cluster]({% link cockroachcloud/create-your-cluster.md %})
- [Invite team members to the organization]({% link cockroachcloud/managing-access.md %}#invite-team-members-to-an-organization)
- [Manage an organization's users and their roles]({% link cockroachcloud/managing-access.md %}#manage-an-organizations-users)
- [Create and manage SQL users]({% link cockroachcloud/managing-access.md %}#create-a-sql-user)
- [Manage billing for the organization]({% link cockroachcloud/billing-management.md %})
- [Restore databases and tables from a {{ site.data.products.db }} backup]({% link cockroachcloud/use-managed-service-backups.md %}#ways-to-restore-data)
- [Delete an organization]({% link cockroachcloud/managing-access.md %}#delete-an-organization)

{{site.data.alerts.callout_info}}
This role is deprecated in favor of the following more fine-grained roles, which, in combination, cover the same permissions:

- [Org Administrator](#org-administrator)
- [Cluster Administrator](#cluster-administrator)
- [Billing Coordinator](#billing-coordinator)
{{site.data.alerts.end}}
  
### Org Developer (legacy)

Org Developer (legacy) can read information for all clusters, and monitor all clusters using DB Console.

{{site.data.alerts.callout_info}}
This role is deprecated in favor of more fine-grained roles described above.
{{site.data.alerts.end}}

## Service accounts

Service accounts authenticate with API keys to the {{ site.data.products.db }} API, rather than to the {{ site.data.products.db }} Console UI.

Service accounts operate under a unified authorization model with organization users, and can be assigned all of the same [organization roles](#organization-user-roles) as users, but note that some actions are available in the console but not the API, or vice versa (For example, in the [Cluster Operator Role](#cluster-operator)).

*Legacy service accounts* that were created before the updated authorization model was enabled for your cloud organization may have roles assigned under the *legacy model*:

- The `ADMIN` role  allows the service account full authorization for the organization, where the service account can create, modify, and delete clusters.
- The `CREATE` role allows the service account to create new clusters within the organization.
- The `DELETE` role allows the service account to delete clusters within the organization.
- The `EDIT` role allows the service account to modify clusters within the organization.
- The `READ` role allows the service account to get details about clusters within the organization.

Update legacy service accounts to roles in the new authorization model, and grant only the required access, according to the [principle of least privilege](https://wikipedia.org/wiki/Principle_of_least_privilege).

Refer to [Manage Service Accounts]({% link cockroachcloud/managing-access.md %}#manage-service-accounts).

## Cluster roles for organization users using Cluster SSO

Cluster Single Sign-On (SSO) for {{ site.data.products.db }} allows authorized organization users to directly access clusters within the organization via [`ccloud`]({% link cockroachcloud/ccloud-get-started.md %}), the {{ site.data.products.db }} command line interface.

However, because organization users and cluster SQL users are logically separate, a corresponding SQL user must be created for each SSO organization user, on each particular cluster.

This correspondence lies in the SQL user name, which must be in the format `sso_{email_name}`. Replace `(email_name}` with the portion of the user's email address before `@`. For example, the SQL username of a user with the email address `docs@cockroachlabs.com`  is `sso_docs`. If the role is not set up correctly, `ccloud` prompts you to create or add it. Only an SQL admin can manage SQL users.
