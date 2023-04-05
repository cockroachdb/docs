---
title: Authorization in CockroachDB Cloud
summary: Learn about the CockroachDB Cloud Authorization features and concepts
toc: true
docs_area: manage
---

In CockroachDB Cloud, an organization corresponds to an authorization hierarchy rooted in a billing account. The user of the billing account can add or invite other CockroachDB Cloud users to the organization.

In an updated implementation planned for v23.1, it will be possible to split billing functionality from the account that created the organization.

Within a CockroachDB Cloud organization, the unit of database functionality is the *CockroachDB cluster*, which corresponds to a networked set of CockroachDB database nodes. SQL operations and data storage are distributed over the cluster. All clusters belong to an organization.

{{ site.data.products.db }}'s authorization model has two levels: the {{ site.data.products.db }} organization and clusters within that organization.

Note that organization users/roles SQL users/roles are distinct from SQL users/roles. Each CockroachDB cluster has its own set of SQL roles, which allow authenticated users to execute SQL statements via any PostgreSQL-compatible client.

### Organization user roles
- **Org member**: the default role given to all organization users upon creation or invitation. This role grants no permissions to perform cluster or org actions.
- **Org admin**: the administrator role for organization functions. In the current implementation, this grants permissions to manage clusters, org users, cluster users, and billing for the organization. In the implementation planned for v23.1, this legacy role will be split into separate roles for administrating organization level user-management functions, cluster functions, and billing functions.
- **Cluster developer**: the minimum access role for clusters. This role allows users to view the details of one or more specified clusters, as well as change their IP allowlist configuration.
- **Cluster admin**: the administrator role for a specific database cluster, including managing SQL users/roles. This role can be granted to an organization user for one or more specific clusters, or for all clusters in the organization.
- **Cluster creator**: allows an organization user to create clusters in an organization; the cluster creator is automatically granted the cluster admin role on clusters they create.




A CockroachDB Cloud *organization* corresponds to a an authorization hierarchy rooted in a billing account. Each {{ site.data.products.db }} cluster is created within an organization. The user of the billing account can create or invite other users to the organization, and can grant roles to those users, such as **Cluster Admin** or **Cluster Creator**.. 

A user who has the Cluster Admin or Cluster Creator role can create clusters in the organization, create SQL users and roles on those clusters, and grant access to those users and roles by managing the associated credentials or single sign-on (SSO) authentication flows.

See:

- [Overview of Cluster Users/Roles and Privilege Grants in CockroachDB](../{{site.versions["stable"]}}/security-reference/authorization.html)
- [Managing Cluster User Authorization](../{{site.versions["dev"]}}/authorization.html)

## Organization user roles

<!-- all below to be changed with FGAC -->

Users may be granted two levels of access:

- 'Developer' allows users to:
  - Read cluster information using the CockroachDB Cloud Console and Cloud API
- 'Administrator' allows users to:
  - Create and delete organization users
  - Create, modify, and delete clusters
  - Create and manage SQL roles on particular clusters

Within an organization, the unit of database functionality is the *CockroachDB cluster*, which corresponds to a networked set of CockroachDB database nodes. All SQL operations and data storage are distributed across the cluster.

Each cluster has its own set of SQL roles, which allow authenticated users to execute SQL statements using any PostgreSQL-compatible client.

## Cluster roles for organization users using Cluster SSO

Cluster Single Sign-On (SSO) for {{ site.data.products.db }} allows authorized organization users to directly access clusters within the organization via [`ccloud`](ccloud-get-started.html), the {{ site.data.products.db }} command line interface.

However, because organization roles and roles on any given SQL cluster are logically separate, a corresponding SQL role must be created for each SSO organization user, on each particular cluster.

This correspondence lies in the SQL role name, which must be: `sso_{email_name}`, where 'email_name' refers to everything up to the '@'' in an email address. For example, the SQL user `sso_docs` would result from docs@cockroachlabs.com. `ccloud` prompts you to create this user if it does not already exist, in which case an admin must create it manually.