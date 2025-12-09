---
title: Databases Page
summary: The Databases page provides details about databases configured, the tables and indexes in each database, and the grants assigned to each role and user.
toc: true
---

{% capture version_prefix %}{{ page.version.version }}{% endcapture %}

{{site.data.alerts.callout_info}}
On a [secure cluster]({% link {{ page.version.version }}/secure-a-cluster.md %}), you must be an [`admin` user]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) or a SQL user with the [`CONNECT`]({% link {{ page.version.version }}/security-reference/authorization.md %}#connect) privilege [granted]({% link {{ page.version.version }}/grant.md %}#grant-privileges-on-databases) on a database.

{{site.data.alerts.end}}

<a id="databases"></a>

The **Databases** page of the DB Console provides details of the following:

- The databases configured.
- The tables in each database and the indexes on each table.
- The grants assigned to each role and user.
- [Index recommendations](#index-recommendations).

To view this information, [access the DB Console]({% link {{ version_prefix }}/ui-overview.md %}#db-console-access) and click **Databases** in the left side navigation menu. This will give you access to the following:

- [Databases List Page](#databases-list-page): initial page that lists the databases on the cluster.
- [Database Details Page](#database-details-page)
    - [Tables List Tab](#tables-list-tab): lists tables in a database.
    - [Database Grants Tab](#database-grants-tab): lists privileges on a database.
- [Table Details Page](#table-details-page)
    - [Overview Tab](#overview-tab): displays a table’s details.
    - [Table Grants Tab](#table-grants-tab): lists privileges on a table.
    - [Indexes List Tab](#indexes-list-tab): lists indexes on a table with index recommendations and actions.
- [Index Details Page](#index-details-page): displays an index’s details with index recommendations.

{% include {{ version_prefix }}/ui/index-recommendations.md %}

{% include {{ version_prefix }}/ui/databases-list-page.md %}

{% include {{ version_prefix }}/ui/database-details-page.md %}

{% include {{ version_prefix }}/ui/table-details-page.md %}

{% include {{ version_prefix }}/ui/index-details-page.md %}

## See also

- [Statements page]({% link {{ version_prefix }}/ui-statements-page.md %})
- [Assign privileges]({% link {{ version_prefix }}/security-reference/authorization.md %}#managing-privileges)
- [`GRANT`]({% link {{ version_prefix }}/grant.md %})
- [Cluster API]({% link {{ version_prefix }}/monitoring-and-alerting.md %}#cluster-api)
