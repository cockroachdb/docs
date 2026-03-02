---
title: Plan a CockroachDB Standard Cluster
summary: Plan your cluster's configuration.
toc: true
docs_area: deploy
cloud: true
---

{{site.data.alerts.callout_info}}
CockroachDB Standard is currently in [Preview]({% link {{ site.current_cloud_version }}/cockroachdb-feature-availability.md %}).
{{site.data.alerts.end}}

{% include cockroachcloud/filter-tabs/plan-your-cluster.md %}

This page provides guidance for planning and estimating costs for a CockroachDB {{ site.data.products.standard }} cluster that meets your business requirements. For information on diagnosing and optimizing your resource consumption, see [Optimize your Resource Usage]({% link cockroachcloud/resource-usage.md %}).

## Provisioned capacity

The compute resources available to a CockroachDB {{ site.data.products.standard }} cluster is provisioned and scaled using a capacity model measured in _virtual CPUs (vCPUs)_. A cluster's capacity requirements depend on the scale and query profile of the cluster's workload, and may change over time as the workload evolves. It’s typical to estimate the initial compute capacity needed for a workload before creating the cluster, and to adjust the capacity up or down based observation of the workload's consumption.

Storage for a CockroachDB {{ site.data.products.standard }} cluster is allocated on demand and is not covered in this section. Refer to [Storage](#storage-pricing).

### Quickstart: Provision and adjust capacity

To achieve a rough initial estimate of compute capacity, consider:

- **Expected workload maximum**: the maximum expected long-term compute consumption for the workload, measured in vCPUs.
  - If your workload is already using CockroachDB {{ site.data.products.core }} and is performing well, we recommend that you start with the sum of the compute capacity of its nodes across all regions.
  - If you are moving the workload from another database and is performing well, we recommend that you consider its historical compute requirements to arrive at an initial compute capacity.
  - [Talk to an expert](https://www.cockroachlabs.com/contact/). Engineers at Cockroach Labs will work with you to understand the resource demands of your workload and help you estimate and validate its required capacity.

- **Additional capacity buffer**: To accommodate unanticipated load and mitigate the risk of application degradation if the cluster's capacity is exceeded, we recommend that you plan for additional capacity beyond your initial estimate. A 40% buffer is a good starting point, but more may be needed if the workload is unpredictable or highly sensitive to query latency. Depending on the nature of the workload, such as when demand is seasonal, you can plan to scale the cluster's capacity temporarily to address the workload's requirements.
  - **Exceeding capacity limit**: CockroachDB {{ site.data.products.standard }} enforces the cluster's provisioned capacity, limiting application throughput if the workload exceeds the cluster's provisioned capacity. This can lead to increased query latency and degraded application performance.
  - **Notifications to prevent overrun**: To help mitigate against the risk of exceeding a cluster's capacity, email and CockroachDB {{ site.data.products.cloud }} Console notifications will occur when a cluster workload exceeds 70% and 90% of its provisioned capacity.

- **Multi-region deployments**: The provisioned capacity of your cluster applies to the entire cluster, regardless of the number of nodes or regional topography. The provisioned capacity is effectively a budget for the cluster that can be used by a node in any region to meet its compute demand. This simplifies planning compute capacity for multi-region deployments. The overall [compute capacity cost]({% link cockroachcloud/billing-management.md %}) for a multi-region CockroachDB {{ site.data.products.standard }} cluster is calculated based on the price of the most expensive region in the cluster.

After considering the preceding factors, you have enough information to [create a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/create-your-cluster.md %}) using the CockroachDB {{ site.data.products.cloud }} Console, the [CockroachDB Terraform provider]({% link cockroachcloud/provision-a-cluster-with-terraform.md %}), or the [CockroachDB {{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}). After the cluster is deployed, you can [scale its compute capacity]({% link cockroachcloud/cluster-management.md %}#edit-cluster-capacity) by increasing or decreasing its provisioned capacity as needed.

{{site.data.alerts.callout_success}}
You can decrease the provisioned capacity only three times within a 7-day period. You can increase the provisioned capacity at any time.
{{site.data.alerts.end}}

The CockroachDB {{ site.data.products.cloud }} Console provides insight into your cluster's compute usage relative to its provisioned capacity on a monthly basis. We recommend that you maintain at minimum a 40% capacity buffer over time, and that you increase this buffer if the workload is unpredictable or highly sensitive to query latency. You now have the advantage of historical data about the cluster's performance to help you maintain and improve the cluster's performance over time.

### Recommended provisioned capacity when changing cluster plan

If you change your cluster's plan from {{ site.data.products.basic }} to {{ site.data.products.standard }}, the Cloud Console will provide a suggested provisioned capacity. This is calculated based on your [peak request units (RU/sec)]({% link cockroachcloud/plan-your-cluster-basic.md %}) in the last 30 days on the {{ site.data.products.basic }} cluster plan. The vCPU suggestion is based on the 30-day peak RU/sec with an additional 40% buffer. 500 RU/sec equates to 1 vCPU. There is a 10-minute roll-up period for the peak RU/sec. If the estimate is beyond the {{ site.data.products.standard }} plan's maximum supported vCPU, you may experience performance issues if your cluster's workload consistently spikes above that level.

### Capacity pricing policies

Important capacity and pricing policies mentioned elsewhere are summarized here:

- **Minimum and maximum provisioned capacity**: A CockroachDB {{ site.data.products.standard }} cluster must have a provisioned capacity of at minimum 2 vCPUs. For production workloads, we recommend at minimum 4 to 8 vCPUs. The maximum capacity for CockroachDB {{ site.data.products.standard }} is 200 vCPUs. To express interest in higher-capacity clusters, [talk to an expert](https://www.cockroachlabs.com/contact/).

- **Enforcing provisioned capacity limits**: CockroachDB {{ site.data.products.cloud }} enforces the cluster’s provisioned capacity, limiting application throughput if the workload exceeds the capacity limit. This can result in degraded performance and increased query latency. You can increase a cluster's capacity at any time.

- **Capacity for multi-region clusters**: A multi-region cluster's capacity is available to all cluster nodes in all regions, but is not pre-allocated per region. The cluster's CPU utilization across regions cannot exceed its provisioned capacity.

- **Multi-region pricing by the most expensive region**: The overall [compute capacity cost]({% link cockroachcloud/billing-management.md %}) for a multi-region CockroachDB {{ site.data.products.standard }} cluster is calculated based on the price of the most expensive region in the cluster.

- **Limitations on capacity scaling**: You can decrease the provisioned capacity only three times within a 7-day period. You can increase the provisioned capacity at any time.

### More details about capacity

We recommend that you start with [Quickstart: Provision and adjust capacity](#quickstart-provision-and-adjust-capacity) to arrive at the best initial compute capacity for your workload and that you adjust the cluster's capacity over time as the workload evolves. In addition, consider the following:

- **Smaller workloads**: CockroachDB {{ site.data.products.standard }} is well suited for workloads that require 12 or fewer vCPUs. By contrast, 12 vCPUs (3 nodes x 4 vCPUs) is the minimum configuration for CockroachDB {{ site.data.products.advanced }}.

CockroachDB {{ site.data.products.standard }} is not recommended for:

- **Analytical workloads that involve many large, complex reads**
- **OLAP or hybrid OLTP/OLAP applications**

- **Asymmetric multi-region workloads**: Often, multi-region deployments are asymmetric in terms of CPU utilization across regions. For example, in a three-region cluster, two of the three regions may require more capacity than the third, or vice versa. In CockroachDB {{ site.data.products.standard }}, a cluster's compute capacity is available in all regions.

    For workloads that require asymmetric capacity per region or where a given region must maintain a given compute capacity, CockroachDB {{ site.data.products.advanced }} may be a better option.

- **Workloads that are sensitive to latency**: CockroachDB {{ site.data.products.standard }} clusters use a different networking architecture than CockroachDB {{ site.data.products.advanced }}. This architecture can introduce additional query latency of around 1 microsecond when compared with CockroachDB {{ site.data.products.advanced }}.

- **Workloads with advanced security or compliance requirements**: For workloads subject to advanced security or compliance requirements, consider CockroachDB {{ site.data.products.advanced }}, which complies with [PCI DSS and HIPAA]({% link cockroachcloud/pci-dss.md %}). To learn more refer to [Compliance in CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/compliance.md %}).

For more details to help you compare CockroachDB {{ site.data.products.cloud }} cluster plans, refer to [CockroachDB {{ site.data.products.cloud }} Overview]({% link cockroachcloud/index.md %}).

## Storage pricing

Storage capacity for a CockroachDB {{ site.data.products.standard }} cluster is [priced]({% link cockroachcloud/billing-management.md %}) on demand in units of GiB-month. Storage prices vary across providers and [regions]({% link cockroachcloud/regions.md %}). Storage is charged based on the logical amount of data in the database.

- **3 replicas included**: CockroachDB {{ site.data.products.standard }} maintains at minimum three replicas of your data at no additional cost.

  For a cluster with more than three replicas, storage for each additional replica is priced at the storage price for the region.

- **Multi-region storage**: In a multi-region cluster, storage prices vary by region. The data in each region is priced at that region's storage rate.

### Single-region example

By default, CockroachDB {{ site.data.products.cloud }} maintains three replicas for a single-region cluster, spread across three different availability zones within the region. You are not charged to store these replicas.

For example, if a single-region cluster is deployed in `us-central-1` and contains 500 GiB of data. CockroachDB {{ site.data.products.cloud }} stores three replicas, for a total of 1500 GiB of data. However, you are billed only for 500 GiB of storage.

If you add a fourth replica, the cluster consumes 2000 GiB of storage (500 x 4), but you are billed only for 1000 GiB (500 for the data and 500 for the fourth replica).

### Multi-region example

For multi-region clusters, we recommend that 5 or more replicas are maintained across availability zones and regions for resilience against both zone and region failure. The first three replicas are included in the base storage price, while additional replicas are priced based on the ratio of additional regions to the initial three.

Consider the example of a three-region cluster with 500 GiB of logical data, deployed in `us-central1`, `us-west2`, and `europe-west1`, with 5 replicas. The logical data and the first three replicas are included in the monthly storage cost. The additional two replicas are charged at 2/3 of the monthly storage cost. This cluster consumes 2500 GiB of storage, but is billed for 1500 GiB for the initial data and 3 replicas, plus 2/3 of the additional 1000 GiB for the additional two replicas (2 replicas beyond the initial 3).

If you add a 6th replica, the cluster will consume 3000 GiB (500 x 6), and will be billed for 1500 GiB for the initial data and 3 replicas, plus 100% (3/3) of the additional three replicas (3 replicas beyond the initial 3).

## See also

- [Create a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/create-your-cluster.md %})
- [Edit cluster capacity]({% link cockroachcloud/cluster-management.md %}#edit-cluster-capacity)
- [Plan an CockroachDB {{ site.data.products.advanced }} cluster]({% link cockroachcloud/plan-your-cluster-advanced.md %})
- [Plan an CockroachDB {{ site.data.products.basic }} cluster]({% link cockroachcloud/plan-your-cluster-basic.md %})
