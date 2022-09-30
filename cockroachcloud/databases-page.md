---
title: Databases Page
summary: The Databases page of the CockroachDB Cloud Console provides details about databases configured, the tables in each database, and the grants assigned to each user.
toc: true
cloud: true
docs_area: manage
---

{% capture version_prefix %}{{site.versions["stable"]}}/{% endcapture %}

The **Databases** page of the {{ site.data.products.db }} Console allows you to create, edit, and delete databases and provides details of the following:

- The databases configured.
- The tables in each database and the indexes on each table.
- The grants assigned to each user.

To view this page, click **Databases** in the left-hand navigation of the {{ site.data.products.db }} Console.

{% include {{version_prefix}}ui/databases.md %}

{% include common/ui/databases-page.md %}

{% include {{version_prefix}}ui/index-details.md %}
