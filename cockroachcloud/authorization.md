---
title: Authorization in CockroachDB Cloud
summary: Learn about the CockroachDB Cloud Authorization features and concepts
toc: true
docs_area: manage
---

{{ site.data.products.db }}'s authorization model has two levels: the {{ site.data.products.db }} organization and clusters within that organization.

A CockroachDB Cloud *organization* corresponds to a an authorization hierarchy rooted in a billing account. Each {{ site.data.products.db }} cluster is created within an organization. The user of the billing account can:

- Create or invite other users to the organization, and can change their role.
- Create clusters in the organization.
- Manage SQL users and roles on clusters in the organization, and grant access to those users and roles by managing the associated credentials or single sign-on (SSO) authentication flows.

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

This correspondence lies in the SQL role name, which must be: `sso_{email_name}`, where 'email_name' refers to everything up to the '@' in an email address. For example, the SQL user `sso_docs` would result from `docs@cockroachlabs.com`. `ccloud` prompts you to create this user if it does not already exist, in which case an admin must create it manually.
