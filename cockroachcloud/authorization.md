---
title: Authorization in CockroachDB Cloud
summary: Learn about the CockroachDB Cloud Authorization features and concepts
toc: true
docs_area: manage
---

{{ site.data.products.db }} has a two-level authorization model: users have permissions within organizations, and on specific database clusters within organizations.

In CockroachDB Cloud, an *Organization* corresponds to a an authorization hierarchy rooted in a billing account. All database clusters in {{ site.data.products.db }} belong within an organization. The user of the billing account can create or invite other CockroachDB Cloud users to the organization. 

Authorized organization users (with an Cluster Admin or Cluster Creator role) can create clusters in their organization, create SQL users/roles on those clusters, and grant access to those users/roles by managing the associated credentials or single sign-on (SSO) authentication flows.

See:

- [Overview of Cluster Users/Roles and Privilege Grants in CockroachDB](../{{site.versions["stable"]}}/security-reference/authorization.html)
- [Managing Cluster User Authorization](../{{site.versions["dev"]}}/authorization.html)

## Organization user roles

<!-- all below to be changed with FGAC -->

Users may be granted two levels of access:

- 'Developer' allows users to:
  - Read cluster information in the CockroachDB Cloud Console and Cloud API
- 'Administrator' allows users to:
  - Create and delete organization users
  - Create, modify and delete clusters
  - Create and manage SQL roles on particular clusters

Within a CockroachDB Cloud Organization, the unit of database functionality is the *CockroachDB cluster*, which corresponds to a networked set of CockroachDB database nodes. All SQL operations and data storage are distributed over the cluster.

Each cluster also has its own set of SQL roles, which allow authenticated users to execute SQL statements via any PostgreSQL-compatible client.

## Cluster roles for organization users using Cluster SSO

Cluster Single Sign-On (SSO) for {{ site.data.products.db }} allows authorized organization users to directly access clusters within the organization via [`ccloud`](ccloud-get-started.html), the {{ site.data.products.db }} command line interface.

However, because organization roles and roles on any given SQL cluster are logically separate, a corresponding SQL role must be created for each SSO organization user, on each particular cluster.

This correspondence lies in the SQL role name, which must be: `sso_{email_name}`, where 'email_name' refers to everything up to the '@'' in an email address. For example, the SQL user `sso_docs` would result from docs@cockroachlabs.com. `ccloud will prompt you to create this user if it does not already exist, in which case an admin must create it manually.