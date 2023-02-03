---
title: Sessions Page
summary: The Sessions page provides details of all open sessions in the cluster.
toc: true
cloud: true
docs_area: manage
---

{% capture version_prefix %}{{site.current_cloud_version}}/{% endcapture %}

The **Sessions** page of the {{ site.data.products.db }} Console provides details of all open sessions in the cluster.

To view this page, select a cluster from the **Clusters** page, and click **SQL Activity** in the **Monitoring** section of the left side navigation. Select the **Sessions** tab.

{% include common/ui/sessions-page.md %}

{% include {{version_prefix}}ui/sessions.md %}
