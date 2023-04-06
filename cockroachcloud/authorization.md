---
title: Authorization in CockroachDB Cloud
summary: Learn about the CockroachDB Cloud Authorization features and concepts
toc: true
docs_area: manage
---

{{ site.data.products.db }}'s authorization model has two levels: the {{ site.data.products.db }} organization and clusters within that organization.

A CockroachDB Cloud *organization* corresponds to a an authorization hierarchy rooted in a billing account. Each {{ site.data.products.db }} cluster is created within an organization. The user of the organization billing account can create or invite other users to the organization, and can grant roles to those organization users.

**Organization users/roles SQL users/roles are distinct from SQL users/roles.** Each CockroachDB cluster has its own set of SQL roles, which allow authenticated users to execute SQL statements via any PostgreSQL-compatible client. An organization user who has the Cluster Admin or Cluster Creator role can create clusters in the organization, create SQL users/roles on those clusters, and grant access to those users and roles by managing the associated credentials or single sign-on (SSO) authentication flows.

See:

- [Overview of Cluster Users/Roles and Privilege Grants in CockroachDB](../{{site.versions["stable"]}}/security-reference/authorization.html)
- [Managing Cluster User Authorization](../{{site.versions["dev"]}}/authorization.html)

## Organization user roles

- **Org member**: the default role given to all organization users upon creation or invitation. This role grants no permissions to perform cluster or org actions.
- **Org. Administrator (legacy)**: the administrator role for organization functions. This role grants the user permissions to perform all functions pertaining to clusters, org users, cluster users, and billing for the organization. In a future release, this role will be deprecated in favor of more fine-grained roles for separately administrating organization-level user-management functions, cluster functions, and billing functions.
- **Org developer (legacy)**: this role allows the user to read information for all clusters, and to create and manage SQL users on all clusters. It is considered deprecated in favor of the more fine-grained cluster roles below.
- **Cluster developer**: the minimum access role for clusters. This role allows users to view the details of one or more specified clusters, as well as change their IP allowlist configuration.
- **Cluster admin**: the administrator role for a specific database cluster, including managing SQL users/roles. This role can be granted to an organization user for one or more specific clusters, or for all clusters in the organization.
- **Cluster creator**: allows an organization user to create clusters in an organization; the cluster creator is automatically granted the cluster admin role on clusters they create.

Within an organization, the unit of database functionality is the *CockroachDB cluster*, which corresponds to a networked set of CockroachDB database nodes. All SQL operations and data storage are distributed across the cluster.

Each cluster has its own set of SQL roles, which allow authenticated users to execute SQL statements using any PostgreSQL-compatible client.

## Cluster roles for organization users using Cluster SSO

Cluster Single Sign-On (SSO) for {{ site.data.products.db }} allows authorized organization users to directly access clusters within the organization via [`ccloud`](ccloud-get-started.html), the {{ site.data.products.db }} command line interface.

However, because organization roles and roles on any given SQL cluster are logically separate, a corresponding SQL role must be created for each SSO organization user, on each particular cluster.

This correspondence lies in the SQL role name, which must be in the format `sso_{email_name}`. Replace '(email_name}' with the portion of the user's email address before `@`. For example, the SQL role name of a user with the email address `docs@cockroachlabs.com`  is `sso_docs`. If the role is not set up correctly, `ccloud` prompts you to create or add it. Only an admin can manage users/roles, so you must contact your cluster administrator if you do not permissions to create SQL roles on the cluster.
