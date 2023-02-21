---
title: Authorization in CockroachDB Cloud
summary: Learn about the CockroachDB Cloud Authorization features and concepts
toc: true
docs_area: manage
---

In CockroachDB Cloud, an *Organization* corresponds to a an authorization hierarchy rooted in a billing account. All database clusters in {{ site.data.products.db }} belong within an organization. The user of the billing account can create or invite other CockroachDB Cloud users to the organization. 

## Organization user roles

<!-- all below to be changed with FGAC -->

Users may be granted two levels of access:

- 'Developer' allows users to:
  - Read cluster information in the CockroachDB Cloud Console and Cloud API
  - Be assigned SQL roles on particular database clusters
- 'Administrator' allows users to:
  - Create, modify and delete clusters
  - Create and delete users
  - Grant users SQL roles on particular clusters
  - Be assigned SQL roles on particular cluster

Within a CockroachDB Cloud Organization, the unit of database functionality is the *CockroachDB cluster*, which corresponds to a networked set of CockroachDB database nodes. All SQL operations and data storage are distributed over the cluster.

Each cluster also has its own set of SQL roles, which allow authenticated users to execute SQL statements via any PostgreSQL-compatible client.

## Cluster roles for organization users


yada yada