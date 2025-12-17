---
title: Jobs Page
summary: The Jobs page provides details of all jobs in the cluster.
toc: true
cloud: true
docs_area: manage
---

{% capture version_prefix %}{{site.current_cloud_version}}/{% endcapture %}

The **Jobs** page of the CockroachDB {{ site.data.products.cloud }} Console provides details of all jobs in the cluster.

Viewing jobs requires the [Cluster Monitor]({% link "cockroachcloud/authorization.md" %}#cluster-monitor), [Cluster Operator]({% link "cockroachcloud/authorization.md" %}#cluster-operator), or [Cluster Admin]({% link "cockroachcloud/authorization.md" %}#cluster-admin) role. To view this page, select a cluster from the [**Clusters** page]({% link "cockroachcloud/cluster-management.md" %}#view-clusters-page), and click **Jobs** in the **Monitoring** section of the left side navigation.

{% include "common/ui/jobs-page.md" %}

{% dynamic_include version_prefix, "ui/jobs.md" %}
