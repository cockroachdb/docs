---
title: Databases Page
summary: The Databases page of the CockroachDB Cloud Console provides details about databases configured, the tables in each database, and the grants assigned to each user.
toc: true
cloud: true
docs_area: manage
---

{% capture link_prefix %}../{{site.current_cloud_version}}/{% endcapture %}
{% assign page_prefix = "" %}

{% capture version_prefix %}{{site.current_cloud_version}}/{% endcapture %}

The **Databases** page of the CockroachDB {{ site.data.products.cloud }} Console provides details of the following:

- The databases configured.
- The tables in each database and the indexes on each table.
- The grants assigned to each user.

To view this page, select a cluster from the [**Clusters** page]({% link cockroachcloud/cluster-management.md %}#view-clusters-page), and click **Databases** in the **Data** section of the left side navigation.

{% include {{site.current_cloud_version}}/ui/databases.md %}

{% include {{site.current_cloud_version}}/ui/index-details.md %}
