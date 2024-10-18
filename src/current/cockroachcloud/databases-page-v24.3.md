---
title: Databases Page
summary: The Databases page provides details about databases configured, the tables and indexes in each database, and the grants assigned to each role and user.
toc: true
cloud: true
ver: v24.3
---

{% comment %} TODO When v24.3 is released, set version_prefex to {{site.current_cloud_version}} and remove hard-coded ver: v24.3 in frontmatter {% endcomment %}
{% capture version_prefix %}{{ page.ver }}{% endcapture %}

The **Databases** page of the CockroachDB {{ site.data.products.cloud }} Console provides details of the following:

- The databases configured.
- The tables in each database and the indexes on each table.
- The grants assigned to each role and user.
- [Index recommendations](#index-recommendations).

To view this page, select a cluster from the [**Clusters** page]({% link cockroachcloud/cluster-management.md %}#view-clusters-page), and click **Databases** in the **Data** section of the left side navigation.

The [**Databases**](#databases) page lists the databases on the cluster. From this page, you can traverse to the following pages:

- [**Database Tables**](#database-tables): lists tables in a database.
- [**Database Grants**](#database-grants): lists privileges on a database.
- [**Table Overview**](#table-overview): displays a table’s details.
- [**Table Grants**](#table-grants): lists privileges on a table.
- [**Table Indexes**](#table-indexes): lists indexes on a table with possible index recommendations and actions.
- [**Index**](#index): displays an index’s details with index recommendations.

{% include {{ version_prefix }}/ui/index-recommendations.md %}

{% include {{ version_prefix }}/ui/databases.md %}

{% include {{ version_prefix }}/ui/database-tables.md %}

{% include {{ version_prefix }}/ui/database-grants.md %}

{% include {{ version_prefix }}/ui/table-overview.md %}

{% include {{ version_prefix }}/ui/table-grants.md %}

{% include {{ version_prefix }}/ui/table-indexes.md %}

{% include {{ version_prefix }}/ui/index.md %}

## See also

- [Statements page]({% link cockroachcloud/statements-page.md %})
- [Assign privileges]({% link {{ version_prefix }}/security-reference/authorization.md %}#managing-privileges)
- [`GRANT`]({% link {{ version_prefix }}/grant.md %})
