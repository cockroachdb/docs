---
title: Databases Page
summary: The Databases page provides details about databases configured, the tables and indexes in each database, and the grants assigned to each role and user.
toc: true
cloud: true
---

{% capture version_prefix %}{{ site.current_cloud_version }}{% endcapture %}

The **Databases** page of the CockroachDB {{ site.data.products.cloud }} Console provides details of the following:

- The databases configured.
- The tables in each database and the indexes on each table.
- The grants assigned to each role and SQL user.
- [Index recommendations](#index-recommendations).

To view this information, select a cluster from the [**Clusters** page]({% link "cockroachcloud/cluster-management.md" %}#view-clusters-page), and click **Databases** in the **Data** section of the left side navigation menu. This will give you access to the following:

- [Databases List Page](#databases-list-page): initial page that lists the databases on the cluster.
- [Database Details Page](#database-details-page)
    - [Tables List Tab](#tables-list-tab): lists tables in a database.
    - [Database Grants Tab](#database-grants-tab): lists privileges on a database.
- [Table Details Page](#table-details-page)
    - [Overview Tab](#overview-tab): displays a table’s details.
    - [Table Grants Tab](#table-grants-tab): lists privileges on a table.
    - [Indexes List Tab](#indexes-list-tab): lists indexes on a table with index recommendations and actions.
- [Index Details Page](#index-details-page): displays an index’s details with index recommendations.

{% dynamic_include version_prefix, "/ui/index-recommendations.md" %}

{% dynamic_include version_prefix, "/ui/databases-list-page.md" %}

{% dynamic_include version_prefix, "/ui/database-details-page.md" %}

{% dynamic_include version_prefix, "/ui/table-details-page.md" %}

{% dynamic_include version_prefix, "/ui/index-details-page.md" %}

## See also

- [Statements page]({% link "cockroachcloud/statements-page.md" %})
- [Assign privileges]({% link "{{ version_prefix }}/security-reference/authorization.md" %}#managing-privileges)
- [`GRANT`]({% link "{{ version_prefix }}/grant.md" %})
