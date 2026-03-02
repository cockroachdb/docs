---
title: Change a Cluster's Plan Between Basic and Standard
summary: Learn how to change a cluster's plan between a CockroachDB Basic cluster and a CockroachDB Standard cluster.
toc: true
---

{{site.data.alerts.callout_info}}
CockroachDB {{ site.data.products.standard }} is currently in [Preview]({% link {{ site.current_cloud_version }}/cockroachdb-feature-availability.md %}).
{{site.data.alerts.end}}

This page describes how to change a cluster [plan]({% link cockroachcloud/index.md %}#plans) between CockroachDB {{ site.data.products.basic }} and CockroachDB {{ site.data.products.standard }} using the [{{ site.data.products.cloud }} Console](https://cockroachlabs.cloud/).

To use the CockroachDB Cloud API to change your cluster's plan, refer to [Use the CockroachDB Cloud API]({% link cockroachcloud/cloud-api.md %}#change-a-clusters-plan).

## Before you begin

You'll need the [Cluster Admin]({% link cockroachcloud/authorization.md %}#cluster-admin) or [Cluster Operator]({% link cockroachcloud/authorization.md %}#cluster-operator) role on the running {{ site.data.products.standard }} or {{ site.data.products.basic }} cluster in order to change the cluster's [plan]({% link cockroachcloud/index.md %}#plans).

For changing plans from {{ site.data.products.standard }} to {{ site.data.products.basic }}, you must disable {{ site.data.products.standard }}-only features before starting the plan change.

### Considerations

- If the option to Change Plan Type is unavailable, hovering your mouse on this option may display a note that the cluster was created on a legacy architecture that does not support multi-region features or private connections on any plan. To use these features, follow the procedure to [migrate to a new {{ site.data.products.standard }} cluster](#migrate-to-a-new-standard-cluster). Alternatively, to change the plan for your current cluster despite these feature limitations, you can use the [Cloud API]({% link cockroachcloud/cloud-api.md %}#change-a-clusters-plan).
- The plan change will take up to 5 minutes.
- The cluster will remain operational under the current plan during the switching period.
- You can change back the plan if needed. However, when you change from {{ site.data.products.standard }} to {{ site.data.products.basic }}, you will need to wait 48 hours before being able to change back to {{ site.data.products.standard }}.

## Change a cluster's plan

{{site.data.alerts.callout_info}}
When you change from {{ site.data.products.standard }} to {{ site.data.products.basic }}, you will not be able to change the plan back to {{ site.data.products.standard }} for 48 hours.
{{site.data.alerts.end}}

1. On the [**Clusters** page]({% link cockroachcloud/cluster-management.md %}#view-clusters-page), select the cluster that requires a plan change.
1. On the [**Cluster Overview** page]({% link cockroachcloud/cluster-overview-page.md %}), select the **Action** dropdown in the top-right corner, and then **Change plan type**. If this option is unavailable, refer to [Considerations](#considerations).
1. Choose a [plan]({% link cockroachcloud/index.md %}#plans) from {{ site.data.products.standard }} or {{ site.data.products.basic }} to change to. The current plan of the cluster will be labeled, while the other plan type will be highlighted. Select **Next: Capacity**.
1. For capacity:
    - If you are changing to a {{ site.data.products.standard }} plan, choose the amount of [provisioned capacity]({% link cockroachcloud/plan-your-cluster.md %}#provisioned-capacity) you want for your cluster. The Cloud Console provides a suggestion for provisioned vCPU, we recommend monitoring CPU utilization and adjusting the cluster's compute capacity as necessary. For additional information, refer to [Recommended provisioned capacity when changing cluster plan]({% link cockroachcloud/plan-your-cluster.md %}#recommended-provisioned-capacity-when-changing-cluster-plan). Select **Next: Finalize**.
    - If you are changing to a [{{ site.data.products.basic }} plan]({% link cockroachcloud/create-a-basic-cluster.md %}#step-4-configure-cluster-capacity), choose whether the cluster should have **Unlimited** capacity to scale, or **Set a monthly limit**. Select **Next: Finalize**.
1. Review the changes and then **Update cluster**.

## Migrate to a new {{ site.data.products.standard }} cluster

{% include cockroachcloud/backup-restore-into-new-cluster.md %}

## See more

- [CockroachDB Cloud Documentation]({% link cockroachcloud/index.md %})
- [Use the CockroachDB Cloud API]({% link cockroachcloud/cloud-api.md %})



