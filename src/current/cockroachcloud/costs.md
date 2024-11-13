---
title: Understand CockroachDB Cloud Costs
summary: Understand the ways that customers are billed for CockroachDB Cloud clusters.
toc: true
keywords: pricing
---

The ways that monthly charges are incurred for a CockroachDB Cloud organization depend on the plans of its clusters: CockroachDB Basic, Standard, or Advanced. This page explains costs under each plan, specifying components that are billed based on provisioned capacity or usage.

Refer to [CockroachDB Pricing](https://www.cockroachlabs.com/pricing/) for details on plans and rates.

For details on planning or provisioning clusters, refer to:

- [Plan a CockroachDB {{ site.data.products.basic }} cluster]({% link cockroachcloud/plan-your-cluster-basic.md %})
- [Plan a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/plan-your-cluster.md %})
- [Plan a CockroachDB {{ site.data.products.advanced }} cluster]({% link cockroachcloud/plan-your-cluster-advanced.md %})

## Costs across CockroachDB Cloud plans

This table summarizes key details about how costs are calculated for each plan to help you get started in choosing the one that best meets your needs for a given workload.

|   | <strong>CockroachDB Basic</strong><br><br>Usage-based billing only | <strong>CockroachDB Standard</strong><br><br>Provisioned compute, usage-based storage, data transfer, backups, and Change Data Capture (CDC) | <strong>CockroachDB Advanced</strong><br><br>Provisioned compute, storage, and IOPS with usage-based billing for data transfer, backups, and CDC |
| :---- | :---- | :---- | :---- |
| [Compute](#compute) | Usage-based via [Request Units]({% link cockroachcloud/create-a-basic-cluster.md %}#step-4-configure-cluster-capacity). | Provisioned; cost per hour based on plan, [vCPU quantity, cloud provider, and regions]({% link cockroachcloud/create-your-cluster.md %}#step-4-provision-cluster-capacity). | Provisioned; cost per hour per node based on plan, [vCPU quantity, cloud provider, region]({% link cockroachcloud/create-an-advanced-cluster.md %}#step-5-configure-cluster-capacity), and whether security add-on is enabled. |
| [Storage](#storage) | Usage-based. | Usage-based; rates vary per cloud provider and region. | Provisioned; billed per hour per node; rates vary per cloud provider, region, and whether security add-on is enabled. |
| [IOPS](#iops) | Usage-based via Request Units. | Included in storage costs. | Provisioned based on storage and varies per cloud provider. |
| [Backups](#backups) | Usage-based via Request Units. | Usage-based.<br><br>[Managed Backups]({% link cockroachcloud/managed-backups.md %}) storage rates vary per cloud provider, region, and backup frequency.<br><br>[Self-Managed Backups]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}) fee incurred per GiB transferred to your own object storage.<br><br>No charges for either backup type during the [Usage-based billing metrics Preview](#usage-based-billing-metrics-in-preview). | Usage-based.<br><br>[Managed Backups]({% link cockroachcloud/managed-backups.md %}) storage rates vary per cloud provider, region,  backup frequency, and whether security add-on is enabled.<br><br>[Self-Managed Backups]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}) fee incurred per GiB transferred to your own object storage. Rate varies depending on whether security add-on is enabled.<br><br>No charges for either backup type during the [Usage-based billing metrics Preview](#usage-based-billing-metrics-in-preview). |
| [Data transfer](#data-transfer) | Usage-based via Request Units. | Usage-based; rates vary per cloud provider and data transfer type.<br><br>Currently not charged during [Usage-based billing metrics Preview](#usage-based-billing-metrics-in-preview). | Usage-based; rates vary per cloud provider and data transfer type.<br><br>Currently not charged during [Usage-based billing metrics Preview](#usage-based-billing-metrics-in-preview). |
| [Change Data Capture](#change-data-capture-changefeeds) | Usage-based via Request Units. | Usage-based, per GiB-Hour watched across all changefeeds.<br><br>Currently not charged during [Usage-based billing metrics Preview](#usage-based-billing-metrics-in-preview). | Usage-based, per GiB-Hour watched across all changefeeds. Rates vary depending on whether security add-on is enabled.<br><br>Currently not charged during [Usage-based billing metrics Preview](#usage-based-billing-metrics-in-preview). |

## More details

This section supplements the details in [Costs across CockroachDB Cloud plans](#costs-across-cockroachdb-cloud-plans). Select a plan to learn more.

<div class="filters clearfix">
  <button class="filter-button" data-scope="standard">CockroachDB {{ site.data.products.standard }}</button>
  <button class="filter-button" data-scope="advanced">CockroachDB {{ site.data.products.advanced }}</button>
  <button class="filter-button" data-scope="basic">CockroachDB {{ site.data.products.basic }}</button>
</div>

### Compute

<section class="filter-content" markdown="1" data-scope="basic">

For CockroachDB Basic, compute cost is usage-based through its consumption of [Request Units]({% link cockroachcloud/resource-usage-basic.md %}#understand-resource-consumption).

</section>

<section class="filter-content" markdown="1" data-scope="standard">

Standard clusters have provisioned compute capacity where customers set a maximum processing capacity for their cluster, measured in vCPUs. This capacity represents the peak processing power the cluster can handle at any given time.

A cluster’s compute charges are based on the cluster’s provisioned capacity in vCPU-hours, with rates that depend on the cluster’s cloud provider and regions. Billing is based on the capacity reserved, not the actual usage. Charges are accumulated throughout the month to determine the total monthly compute charges.

In a multi-region cluster, the price of the most expensive region is applied to the entire cluster’s compute capacity.

For example, consider a three-region Multi-Region GCP cluster provisioned in Iowa (us-central1), St. Ghislain (europe-central1) and Jurong West (asia-southeast1) with 32 vCPUs provisioned compute capacity. The compute cost for the cluster is calculated by multiplying the number of vCPUs provisioned by the highest per vCPU-hour rate amongst Iowa ($0.100), St. Ghislain ($0.113) and Jurong West ($0.121) regions: (32 vCPU \* $0.121), which equals $3.872 per hour.

**Note:** These prices are intended as examples only. For the latest pricing, refer to [CockroachDB Pricing](https://www.cockroachlabs.com/pricing/).

</section>

<section class="filter-content" markdown="1" data-scope="advanced">

For an Advanced cluster, each node is provisioned with dedicated compute resources. Users can customize the number of vCPUs per node, which applies to all nodes in the cluster. Compute costs are based on the vCPUs provisioned for each node, with rates depending on the cloud provider, region, and whether a security add-on is enabled.

Compute charges are calculated by multiplying the hourly rate of the provisioned compute by the number of nodes in the cluster. Hourly charges are accumulated throughout the month to determine the total monthly charge.

For example, consider a GCP cluster provisioned in Oregon (us-west1). The cluster consists of three nodes, each with 8vCPU, 32 GiB of RAM. The compute cost for the cluster is determined by multiplying the hourly rate of 8vCPU, 32GiB RAM machine type ($1.062) and the total number of nodes (3), which equals $3.186 per hour.

**Note:** These prices are intended as examples only. For the latest pricing, refer to [CockroachDB Pricing](https://www.cockroachlabs.com/pricing/). 

</section>

### IOPS

<section class="filter-content" markdown="1" data-scope="basic">

IOPS are included as part of request units (RUs).

</section>

<section class="filter-content" markdown="1" data-scope="standard">

IOPS are included in storage costs.

</section>

<section class="filter-content" markdown="1" data-scope="advanced">

For Advanced clusters on AWS, each node will incur charges for the provisioned IOPS, an amount determined based on the allocated storage size (in GiB).

</section>

### Storage

<section class="filter-content" markdown="1" data-scope="basic">

For CockroachDB Basic clusters, storage is automatically provisioned on demand, eliminating the need for manual management. Costs are based on actual usage and adjust dynamically as data is added or removed, starting from zero.

Storage is billed hourly, with [rates](https://www.cockroachlabs.com/pricing) depending on the cloud provider and the region where the cluster is hosted. Basic plan clusters charge for storage per GiB-hour. These charges are accumulated throughout the month to determine the total monthly storage charges.

</section>

<section class="filter-content" markdown="1" data-scope="standard">

For CockroachDB Standard clusters, storage is automatically provisioned on demand, eliminating the need for manual management. Costs are based on actual usage and adjust dynamically as data is added or removed, starting from zero.

Storage is billed hourly, with [rates](https://www.cockroachlabs.com/pricing) specific to each cloud provider and the region where the cluster is hosted. CockroachDB Cloud measures storage in GiB-hour. These charges are accumulated throughout the month to determine the total monthly storage charges.

A CockroachDB Standard cluster maintains a minimum of three [replicas]({% link {{site.current_cloud_version}}/architecture/replication-layer.md %}) of your data. The second and third replicas are included, with no additional storage charge. If you add further replicas, each will incur a storage cost equal to that of the first replica—the logical database size.

</section>

<section class="filter-content" markdown="1" data-scope="advanced">

Each Advanced cluster is provisioned with dedicated storage, and users can configure the per-node storage size when setting up their cluster. This storage setting applies to all nodes in the cluster. The storage is billed hourly, with the rate depending on the cloud provider, the region where the cluster is hosted, and whether the Advanced security add-on is enabled. Storage costs are independent of other resources, meaning you can adjust your cluster's storage capacity without altering its compute capacity. For guidance on provisioning compute and storage, refer to [Plan Your Cluster]({% link cockroachcloud/plan-your-cluster-advanced.md %}).

- For AWS clusters: Storage charge (per hour) is calculated by multiplying the storage size (in GiB) by the per GiB-hour rate for storage, plus any additional charges for IOPS.  
- For GCP and Azure clusters: Node storage charge (per hour) is determined by multiplying the storage size (in GiB) by the per GiB-hour rate, without additional IOPS fees.

These charges are accumulated throughout the month to determine the total monthly storage charges.

For example, consider a GCP cluster provisioned in Oregon (us-west1). The cluster consists of three nodes, each with 75 GiB of storage. The storage cost for the cluster is determined by multiplying the storage size (75 GiB) by the storage rate ($0.0010338 per GiB) per node. The total storage cost is then calculated by multiplying this figure by the number of nodes: (75 GiB \* $0.0010338) \* 3, which equals $0.232605 per hour.

**Note:** These prices are intended as examples only. For the latest pricing, refer to [CockroachDB Pricing](https://www.cockroachlabs.com/pricing/).

</section>

### Backups

<section class="filter-content" markdown="1" data-scope="basic">

Backups on Basic clusters are included in the Request Unit costs. Managed backups occur daily and are not configurable. 

</section>

<section class="filter-content" markdown="1" data-scope="standard">

[Managed Backups]({% link cockroachcloud/managed-backups.md %}) are charged per-GiB storage rates that vary per cloud provider, region, and backup [frequency]({% link cockroachcloud/managed-backups.md %}#frequency) (daily vs. more than daily). The per-GiB unit prices are tiered, based on the amount of backup data stored: Less than 5 GiB-Month, 5 to 100 GiB-Month, 100 to 500 GiB-Month, 500 to 1000 GiB-Month, or 1000 GiB-Month and higher.

[Self-Managed Backups]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}) to your own object storage are charged a per-GiB fee for the data transferred. This option provides an advanced backup scheduler and additional control over backup storage placement.

For further details, refer to CockroachDB Cloud [Pricing](https://www.cockroachlabs.com/pricing/).

{{site.data.alerts.callout_info}}
Customers will not be charged for backups for CockroachDB {{ site.data.products.standard }} or {{ site.data.products.advanced }} clusters during the current [Preview](#usage-based-billing-metrics-in-preview) of usage-based metrics.
{{site.data.alerts.end}}

</section>

<section class="filter-content" markdown="1" data-scope="advanced">

[Managed Backups]({% link cockroachcloud/managed-backups.md %}) are charged per-GiB storage rates that vary per cloud provider, region, backup [frequency]({% link cockroachcloud/managed-backups.md %}#frequency) (daily vs. more than daily), and whether the Advanced security add-on is enabled. The per-GiB unit prices are tiered, based on the amount of backup data stored: Less than 5 GiB-Month, 5 to 100 GiB-Month, 100 to 500 GiB-Month, 500 to 1000 GiB-Month, or 1000 GiB-Month and higher.

[Self-Managed Backups]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}) to your own object storage are charged a per-GiB fee for the data transferred. The rate varies depending on whether the Advanced security add-on is enabled. Self-Managed Backups offer additional control over backup storage placement, and an advanced backup scheduler.

For further details, refer to CockroachDB Cloud [Pricing](https://www.cockroachlabs.com/pricing/).

{{site.data.alerts.callout_info}}
Customers will not be charged for backups for CockroachDB {{ site.data.products.standard }} or {{ site.data.products.advanced }} clusters during the current [Preview](#usage-based-billing-metrics-in-preview) of usage-based metrics.
{{site.data.alerts.end}}

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

The usage data is based on the volume of data moved (per GiB) and the cloud provider’s identified data transfer type, which CockroachDB categorizes as **Same-region data transfer**, **Cross-Region data transfer**, or **Public Internet data transfer**. Each category is reflected as a line item on your invoice. Within each data transfer category, for a given Cloud provider, rates are consistent across plans: CockroachDB Standard, Advanced, and Advanced with security add-on enabled.

Cloud providers may vary in how they calculate each category and define each region. We recommend consulting the provider’s documentation for details (i.e. [AWS](https://aws.amazon.com/ec2/pricing/on-demand/), [GCP](https://cloud.google.com/vpc/network-pricing), or [Azure](https://azure.microsoft.com/en-us/pricing/details/bandwidth/)).

#### Same-region

There are no charges for same-region data transfer between CockroachDB cluster nodes. Data egressing the cluster to endpoints in the same region for backups or changefeeds, or using private connectivity, is charged the cloud provider's list price for same-region data transfer.

#### Cross-region

When data moves between CockroachDB nodes that are in different regions, or from a CockroachDB node to another endpoint in a different region, it is metered as cross-region data transfer. 

Cross-region data transfer includes:

- Data transfer required to support queries that involve lookups on nodes in another region.  
- CockroachDB replication across nodes that are in different regions.  
- Data egress from the CockroachDB Cloud cluster via supported [private connectivity]({% link cockroachcloud/connect-to-your-cluster.md %}#establish-private-connectivity) services to a private endpoint in another region.  
- [Managed backup]({% link cockroachcloud/backup-and-restore-overview.md %}#managed-backups) and [Self-managed backup]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}) data transfer to another region.  
- Change Data Capture (changefeed) data transfer to another region.

Customers are charged the cloud service provider’s (CSP) list price for metered cross-region data transfer.

Typically, data transfer costs across regions are higher than data transfer costs across AZs (data centers) in a single region.

#### Public internet

This is the usage for any data leaving CockroachDB such as SQL data being sent to clients, or logs and metrics exported to third-party tools.

</section>

<section class="filter-content" markdown="1" data-scope="advanced">

{{site.data.alerts.callout_info}}
Customers will not be charged for data transfer for CockroachDB {{ site.data.products.standard }} or {{ site.data.products.advanced }} clusters during the current [Preview](#usage-based-billing-metrics-in-preview) of usage-based metrics.
{{site.data.alerts.end}}

For CockroachDB Standard and Advanced, CockroachDB Cloud bills directly to customers based on their usage with a zero-dollar rate during the preview period.

The usage data is based on the volume of data moved (per GiB) and the cloud provider’s identified data transfer type, which CockroachDB categorizes as **Same-region data transfer**, **Cross-Region data transfer**, or **Public Internet data transfer**. Each category is reflected as a line item on your invoice. Within each data transfer category, for a given Cloud provider, rates are consistent across plans: CockroachDB Standard, Advanced, and Advanced with security add-on enabled.

Cloud providers may vary in how they calculate each category and define each region. We recommend consulting the provider’s documentation for details (i.e. [AWS](https://aws.amazon.com/ec2/pricing/on-demand/), [GCP](https://cloud.google.com/vpc/network-pricing), or [Azure](https://azure.microsoft.com/en-us/pricing/details/bandwidth/)).

#### Same-region

There are no charges for same-region data transfer between CockroachDB cluster nodes. Data egressing the cluster to endpoints in the same region for backups or changefeeds, or using private connectivity, is charged the cloud provider's list price for same-region data transfer.

#### Cross-region

When data moves between CockroachDB nodes that are in different regions, or from a CockroachDB node to another endpoint in a different region, it is metered as cross-region data transfer. 

Cross-region data transfer includes:

- Data transfer required to support queries that involve lookups on nodes in another region.  
- CockroachDB replication across nodes that are in different regions.  
- Data egress from the CockroachDB Cloud cluster via supported [private connectivity]({% link cockroachcloud/connect-to-your-cluster.md %}#establish-private-connectivity) services to a private endpoint in another region.  
- [Managed backup]({% link cockroachcloud/backup-and-restore-overview.md %}#managed-backups) and [Self-managed backup]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}) data transfer to another region.  
- Change Data Capture (changefeed) data transfer to another region.

Customers are charged the cloud service provider’s (CSP) list price for metered cross-region data transfer.

Typically, data transfer costs across regions are higher than data transfer costs across AZs (data centers) in a single region.

#### Public internet

This is the usage for any data leaving CockroachDB such as SQL data being sent to clients, or logs and metrics exported to third-party tools.

</section>

### Change Data Capture (Changefeeds)

For Change Data Capture (CDC), all CockroachDB {{ site.data.products.cloud }} clusters can use [Enterprise Changefeeds]({% link {{ site.current_cloud_version}}/how-does-an-enterprise-changefeed-work.md %}).

<section class="filter-content" markdown="1" data-scope="basic">

In CockroachDB {{ site.data.products.basic }}, CDC cost is usage-based via Request Units.
</section>

<section class="filter-content" markdown="1" data-scope="standard">

In CockroachDB {{ site.data.products.standard }}, CDC is billed monthly based on usage, determined by the total GiB-Month watched across all of a cluster’s changefeeds. The per-GiB unit price is tiered, based on the total watched: Less than 5 GiB-Month, 5 to 100 GiB-Month, 100 to 250 GiB-Month, 250 to 500 GiB-Month, or 500 GiB-Month and higher.

{{site.data.alerts.callout_info}}
Customers will not be charged for CockroachDB {{ site.data.products.standard }} or {{ site.data.products.advanced }} changefeed usage during the current [Preview](#usage-based-billing-metrics-in-preview) of usage-based metrics.
{{site.data.alerts.end}}

</section>

<section class="filter-content" markdown="1" data-scope="advanced">

In CockroachDB {{ site.data.products.advanced }}, CDC is billed monthly based on usage, determined by the total GiB-Month watched across all of a cluster’s changefeeds and whether the Advanced security add-on is enabled. The per-GiB unit price is tiered, based on the total watched: Less than 5 GiB-Month, 5 to 100 GiB-Month, 100 to 250 GiB-Month, 250 to 500 GiB-Month, or 500 GiB-Month and higher.

{{site.data.alerts.callout_info}}
Customers will not be charged for CockroachDB {{ site.data.products.standard }} or {{ site.data.products.advanced }} changefeed usage during the current [Preview](#usage-based-billing-metrics-in-preview) of usage-based metrics.
{{site.data.alerts.end}}

</section>

## Usage-based billing metrics in Preview
<a id="usage-based-costs"></a>

Metering for usage-based billing of data transfer, managed backup storage, and changefeeds is in [Preview]({% link {{site.current_cloud_version}}/cockroachdb-feature-availability.md %}) for all CockroachDB Cloud organizations.

- Usage metrics for data transfer, managed backup storage, and changefeeds are now visible for CockroachDB Standard and Advanced clusters in the CockroachDB Cloud Console. You can view your usage across these metrics on the [Billing page](https://cockroachlabs.cloud/billing/overview) and on invoices.  
- There will be no usage-based charges associated with these metrics during the Preview period, which is in effect through November 30, 2024. During this time, line items with a charge of $0 will be shown for each metric on your monthly invoice.  
- Future pricing for these usage-based costs is available on the [Pricing](https://www.cockroachlabs.com/pricing) page.  
- On December 1, 2024, once the Preview has ended, pricing for these metrics goes into effect immediately for new customers and for existing pay-as-you-go customers (e.g. paying monthly by credit card). Customers with annual or multi-year contracts will continue to preview these line items without incurring charges for them (i.e. expending credits) through the end of their current contract term.

## Learn more

- [Plan a CockroachDB {{ site.data.products.basic }} cluster]({% link cockroachcloud/plan-your-cluster-basic.md %})
- [Plan a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/plan-your-cluster.md %})
- [Plan a CockroachDB {{ site.data.products.advanced }} cluster]({% link cockroachcloud/plan-your-cluster-advanced.md %})
