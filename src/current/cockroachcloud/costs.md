---
title: Understand CockroachDB Cloud Costs
summary: Understand the ways that customers are billed for CockroachDB Cloud clusters.
toc: true
keywords: pricing
---

The cost structure for a CockroachDB Cloud organization depends on its deployment types, which correspond to CockroachDB Cloud plans.

This page applies to CockroachDB Cloud clusters as of October 1, 2024.

## Costs across CockroachDB Cloud plans

For specific rates and feature comparisons, refer to the [Pricing](https://www.cockroachlabs.com/pricing/) page.

This section summarizes key details about each plan to help you make the best choice for each cluster and its workload. For more details, refer to:

- [Plan a CockroachDB {{ site.data.products.basic }} cluster]({% link cockroachcloud/plan-your-cluster-basic.md %})
- [Plan a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/plan-your-cluster.md %})
- [Plan a CockroachDB {{ site.data.products.advanced }} cluster]({% link cockroachcloud/plan-your-cluster-advanced.md %})

<table markdown="1">
<thead>
  <tr>
    <td>&nbsp;</td>
    <td>**CockroachDB {{ site.data.products.basic }}**<br />Usage-based billing only</td>
    <td>**CockroachDB {{ site.data.products.standard }}**<br />Provisioned compute, usage-based storage, data transfer, backups, and Change Data Capture (CDC)</td>
    <td>**CockroachDB {{ site.data.products.advanced }}**<br />Provisioned compute, storage, and IOPS with usage-based billing for data transfer, backups, and CDC</td>
  </tr>
</thead>
<tbody>
  <tr>
    <td>[Compute](#compute)</td>
    <td>Usage-based via [Request Units]({% link cockroachcloud/create-a-basic-cluster.md %}#step-4-configure-cluster-capacity)</td>
    <td>Provisioned; cost per hour based on [vCPU quantity, cloud provider, and regions]({% link cockroachcloud/create-your-cluster.md %}#step-4-provision-cluster-capacity).</td>
    <td>Provisioned; cost per hour per node based on [vCPU quantity, cloud provider, and region]({% link cockroachcloud/create-an-advanced-cluster.md %}#step-5-configure-cluster-capacity)</td>
  </tr>
  <tr>
    <td>IOPS</td>
    <td>Usage-based via Request Units</td>
    <td>Factored into storage costs</td>
    <td>Provisioned based on storage costs and varies per cloud provider</td>
  </tr>
  <tr>
    <td>Data storage</td>
    <td>Usage-based
    <td>Usage-based, varies per cloud provider and region</td>
    <td>Provisioned; billed per hour per node and varies per cloud provider and region</td>
  </tr>
  <tr>
    <td>[Managed backup]({% link cockroachcloud/managed-backups.md %}) storage</td>
    <td>Daily backups included in Request Unit costs</td>
    <td>Usage-based, varies per cloud provider and region.<br /><br />Currently not charged during [Usage-based billing metrics Preview](#usage-based-billing-metrics-in-preview).</td>
    <td>Usage-based, varies per cloud provider and region.<br /><br />Currently not charged during [Usage-based billing metrics Preview](#usage-based-billing-metrics-in-preview).</td>
  </tr>
  <tr>
    <td>[Data transfer](#data-transfer)</td>
    <td>Usage-based via Request Units</td>
    <td>Usage-based; cloud provider list price<br /><br />Currently not charged during [Usage-based billing metrics Preview](#usage-based-billing-metrics-in-preview)</td>
    <td>Usage-based; cloud provider list price<br /><br />Currently not charged during [Usage-based billing metrics Preview](#usage-based-billing-metrics-in-preview)</td>
  </tr>
  <tr>
    <td>[Change Data Capture]({% link {{site.current_cloud_version}}/change-data-capture-overview.md %})</td>
    <td>Usage-based via Request Units</td>
    <td>Usage-based.<br /><br />Currently not charged during [Usage-based billing metrics Preview](#usage-based-billing-metrics-in-preview)</td>
    <td>Usage-based.<br /><br />Currently not charged during [Usage-based billing metrics Preview](#usage-based-billing-metrics-in-preview)</td>
  </tr>
</tbody>
</table>

To learn more about pricing in CockroachDB {{ site.data.products.cloud }}, refer to [Pricing](https://www.cockroachlabs.com/pricing/).

## More details

This section supplements the details in [Costs across CockroachDB Cloud plans](#costs-across-cockroachdb-cloud-plans). Select a plan to learn more.

<div class="filters clearfix">
  <button class="filter-button" data-scope="standard">CockroachDB {{ site.data.products.standard }}</button>
  <button class="filter-button" data-scope="advanced">CockroachDB {{ site.data.products.advanced }}</button>
  <button class="filter-button" data-scope="basic">CockroachDB {{ site.data.products.basic }}</button>
</div>

### Compute

<section class="filter-content" markdown="1" data-scope="basic">

For CockroachDB {{ site.data.products.basic }}, compute is usage-based and calculated in Request Units.

</section>

<section class="filter-content" markdown="1" data-scope="standard">

Standard deployments have provisioned compute capacity where customers set a maximum processing capacity for their cluster, measured in vCPUs. This capacity represents the peak processing power the deployment can handle at any given time.

The compute pricing is measured in vCPU-hour, with rates depending on the cloud provider and the region. Billing is based on the capacity reserved, not the actual usage. Charges are accumulated throughout the month to determine the total monthly compute charges.

Note: In multi-region clusters, the price of the most expensive region is applied to the entire cluster’s compute capacity.

For example, consider a three region Multi-Region GCP deployment provisioned in Iowa (us-central1), St. Ghislain (europe-central1) and Jurong West(asia-southeast1) with 32 vCPUs provisioned compute capacity. The compute cost for the deployment is calculated by multiplying the number of vCPUs provisioned by the highest per vCPU-hour rate amongst Iowa ($0.1000000), St. Ghislain ($0.1130000) and Jurong West ($0.1210000) regions: (32 vCPU \* $0.121), which equals $3.872 per hour.

**Note:** These prices are intended as examples only. For the latest pricing, refer to [CockroachDB Pricing](https://www.cockroachlabs.com/pricing/).

</section>

<section class="filter-content" markdown="1" data-scope="advanced">

For an Advanced cluster, each node is provisioned with dedicated vCPU resources. Users can customize the number of vCPUs per node by selecting desired compute per node. This configuration applies to all nodes in the cluster. Compute costs are based on the vCPUs provisioned for each node, with rates depending on the cloud provider and the region.

Compute charges are calculated hourly by multiplying the hourly rate of the provisioned compute per node and number of nodes per cluster. These charges are accumulated throughout the month to determine the total monthly compute charges.

For example, consider a GCP cluster provisioned in Oregon (us-west1). The cluster consists of three nodes, each with 8vCPU, 32 GiB of RAM. The compute cost for the cluster is determined by multiplying the hourly rate of 8vCPU, 32GiB RAM machine type ($1.0620000) and the total number of nodes (3), which equals $3.1860000 per hour.

**Note:** These prices are intended as examples only. For the latest pricing, refer to [CockroachDB Pricing](https://www.cockroachlabs.com/pricing/).

</section>

### Storage

<section class="filter-content" markdown="1" data-scope="basic">

In CockroachDB Basic, storage is automatically provisioned on demand, eliminating the need for manual management. Costs are based on actual usage and adjust dynamically as data is added or removed, starting from zero.

Storage is billed hourly, with rates depending on the cloud provider and the region where the cluster is hosted. Basic plan deployments charge storage at $0.50 per GiB-hour.

</section>

<section class="filter-content" markdown="1" data-scope="standard">

For Standard clusters, storage is automatically provisioned on demand, eliminating the need for manual management. Costs are based on actual usage and adjust dynamically as data is added or removed, starting from zero.

Storage is billed hourly, with [rates](https://www.cockroachlabs.com/pricing) specific to each cloud provider and the region where the cluster is hosted. CockroachDB Cloud measures storage in GiB-hour. These charges are accumulated throughout the month to determine the total monthly storage charges.

A CockroachDB Standard cluster maintains a minimum of three replicas of your data. The second and third replicas are included, with no additional storage charge. If you add further replicas, each will incur a storage cost equal to that of the first replica—the logical database size.

</section>

<section class="filter-content" markdown="1" data-scope="advanced">

Each Advanced cluster is provisioned with dedicated storage, and users can configure the storage size for each node when setting up their cluster. This storage setting applies to all nodes in the cluster. The storage is billed hourly, with the rate depending on the cloud provider and the region where the cluster is hosted. Storage costs are independent of other resources, meaning you can adjust your cluster's storage capacity without altering its vCPU or memory configurations. For guidance on provisioning compute and storage, refer to [Plan Your Cluster]({% link cockroachcloud/plan-your-cluster-advanced.md %}).

- For AWS clusters: Storage charge (per hour) is calculated by multiplying the storage size (in GiB) by the per GiB-hour rate for storage, plus any additional charges for IOPS.
- For GCP and Azure clusters: Node storage charge (per hour) is determined by multiplying the storage size (in GiB) by the per GiB-hour rate, without additional IOPS fees.

These charges are accumulated throughout the month to determine the total monthly storage charges.

For example, consider a GCP cluster provisioned in Oregon (us-west1). The cluster consists of three nodes, each with 75 GiB of storage. The storage cost for the cluster is determined by multiplying the storage size (75 GiB) by the storage rate ($0.0010338 per GiB) per node. The total storage cost is then calculated by multiplying this figure by the number of nodes: (75 GiB \* $0.0010338) \* 3, which equals $0.232605 per hour.

**Note:** These prices are intended as examples only. For the latest pricing, refer to [CockroachDB Pricing](https://www.cockroachlabs.com/pricing/).

</section>

### Data transfer

<section class="filter-content" markdown="1" data-scope="basic">
For CockroachDB {{ site.data.products.basic }}, data transfer is included in the Request Unit price.
</section>

<section class="filter-content" markdown="1" data-scope="standard">

{{site.data.alerts.callout_info}}
Customers will not be charged for data transfer for CockroachDB {{ site.data.products.standard }} or {{ site.data.products.advanced }} clusters during the current [Preview](#usage-based-billing-metrics-in-preview) of usage-based metrics.
{{site.data.alerts.end}}

For CockroachDB Standard and Advanced, CockroachDB Cloud bills directly to customers based on their usage with a zero-dollar rate during the preview period.

The usage data is based on the volume of data moved (per GiB) and the cloud provider’s line item for each type of data transfer, which CockroachDB categorizes as **Same-region data transfer**, **Cross-Region data transfer**, or **Public Internet data transfer**.

Cloud providers may vary in how they calculate each category. We recommend consulting the provider’s documentation for details (i.e. [AWS](https://aws.amazon.com/ec2/pricing/on-demand/), [GCP](https://cloud.google.com/vpc/network-pricing), or [Azure](https://azure.microsoft.com/en-us/pricing/details/bandwidth/)).

#### Same-region

A minimum production grade CockroachDB Advanced deployment consists of three nodes or more placed across three Availability Zones (AZs) within the selected region. When data moves between these AZs within a single region, this is considered same-region data transfer.

#### Cross-region

Similar to same-region data transfer , when data moves between CockroachDB nodes across multiple regions, we get cross-region charges (also known as inter-region charges). Typically, data transfer costs across regions are higher than data transfer costs across AZs (data centers) in a single region.

#### Public internet

This is the usage for any data leaving CockroachDB such as SQL data being sent to clients, or logs and metrics exported to third-party tools.

</section>

<section class="filter-content" markdown="1" data-scope="advanced">

{{site.data.alerts.callout_info}}
Customers will not be charged for data transfer for CockroachDB {{ site.data.products.standard }} or {{ site.data.products.advanced }} clusters during the current [Preview](#usage-based-billing-metrics-in-preview) of usage-based metrics.
{{site.data.alerts.end}}

For CockroachDB Standard and Advanced, CockroachDB Cloud bills directly to customers based on their usage with a zero-dollar rate during the preview period.

The usage data is based on the volume of data moved (per GiB) and the cloud provider’s line item for each type of data transfer, which CockroachDB categorizes as **Same-region data transfer**, **Cross-Region data transfer**, or **Public Internet data transfer**.

Cloud providers may vary in how they calculate each category. We recommend consulting the provider’s documentation for details (i.e. [AWS](https://aws.amazon.com/ec2/pricing/on-demand/), [GCP](https://cloud.google.com/vpc/network-pricing), or [Azure](https://azure.microsoft.com/en-us/pricing/details/bandwidth/)).

#### Same-region

A minimum production grade CockroachDB Advanced deployment consists of three nodes or more placed across three Availability Zones (AZs) within the selected region. When data moves between these AZs within a single region, this is considered same-region data transfer.

#### Cross-region

Similar to same-region data transfer , when data moves between CockroachDB nodes across multiple regions, we get cross-region charges (also known as inter-region charges). Typically, data transfer costs across regions are higher than data transfer costs across AZs (data centers) in a single region.

#### Public internet

This is the usage for any data leaving CockroachDB such as SQL data being sent to clients, or logs and metrics exported to third-party tools.

</section>

### Changefeeds

All CockroachDB {{ site.data.products.cloud }} clusters can use [Enterprise Changefeeds]({% link {{ site.current_cloud_version}}/how-does-an-enterprise-changefeed-work.md %}).

<section class="filter-content" markdown="1" data-scope="basic">

In CockroachDB {{ site.data.products.basic }}, Change Data Capture (CDC) cost is usage-based via Request Units
</section>

<section class="filter-content" markdown="1" data-scope="standard">

In CockroachDB {{ site.data.products.standard }} and {{ site.data.products.advanced }}, CDC is billed monthly based on usage, determined by the total GiB-Month watched across all of a cluster’s changefeeds. The per-GiB unit price is tiered, based on the total watched: Less than 5 GiB-Month, 5 to 100 GiB-Month, 100 to 250 GiB-Month, 250 to 500 GiB-Month, or 500 GiB-Month and higher.

{{site.data.alerts.callout_info}}
Customers will not be charged for CockroachDB {{ site.data.products.standard }} or {{ site.data.products.advanced }} changefeed usage during the current [Preview](#usage-based-billing-metrics-in-preview) of usage-based metrics.
{{site.data.alerts.end}}

</section>

<section class="filter-content" markdown="1" data-scope="advanced">

In CockroachDB {{ site.data.products.standard }} and {{ site.data.products.advanced }}, CDC is billed monthly based on usage, determined by the total GiB-Month watched across all of a cluster’s changefeeds. The per-GiB unit price is tiered, based on the total watched: Less than 5 GiB-Month, 5 to 100 GiB-Month, 100 to 250 GiB-Month, 250 to 500 GiB-Month, or 500 GiB-Month and higher.

{{site.data.alerts.callout_info}}
Customers will not be charged for CockroachDB {{ site.data.products.standard }} or {{ site.data.products.advanced }} changefeed usage during the current [Preview](#usage-based-billing-metrics-in-preview) of usage-based metrics.
{{site.data.alerts.end}}

</section>

## Usage-based billing metrics in Preview

Metering for usage-based billing of data transfer, managed backup storage, and changefeeds is now in [Preview]({% link {{site.current_cloud_version }}/cockroachdb-feature-availability.md %}) for all CockroachDB Cloud organizations.

- [Usage metrics]({% link cockroachcloud/costs.md %}) for data transfer, managed backup storage, and changefeeds are now visible for CockroachDB Standard and Advanced clusters in the CockroachDB Cloud Console. You can view your usage across these metrics on the [Billing page](https://cockroachlabs.cloud/billing/overview) and on invoices.
- There will be no usage-based charges associated with these metrics during the preview period, which is in effect through November 30, 2024. During this time, line items with a charge of $0 will be shown for each metric on your monthly invoice.
- We will share pricing for these usage-based costs by November 1, 2024.
- On December 1, 2024, once the preview has ended, pricing for these metrics goes into effect immediately for new customers and customers billed monthly, and upon contract renewal for customers billed by invoice. 

{{site.data.alerts.callout_info}}
Bytes transferred for [managed backups]({% link cockroachcloud/managed-backups.md %}) on CockroachDB Standard are not yet metered under [Data Transfer]({% link cockroachcloud/costs.md %}#data-transfer) metrics. This will be implemented during the Preview period and be announced in a future release note.
{{site.data.alerts.end}}

## Learn more

- [Plan a CockroachDB {{ site.data.products.basic }} cluster]({% link cockroachcloud/plan-your-cluster-basic.md %})
- [Plan a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/plan-your-cluster.md %})
- [Plan a CockroachDB {{ site.data.products.advanced }} cluster]({% link cockroachcloud/plan-your-cluster-advanced.md %})
