---
title: CockroachDB Cloud docs
summary: Learn more about CockroachDB Cloud, a fully-managed service created and owned by Cockroach Labs that makes deploying, scaling, and managing CockroachDB effortless.
toc: true
contribute: true
cta: false
homepage: true
docs_area:
---

## Overview

CockroachDB {{ site.data.products.cloud }} is a fully-managed service run by Cockroach Labs, which simplifies deployment and management of CockroachDB deployments. This page provides an introduction to CockroachDB {{ site.data.products.cloud }} provides an overview of each type of cluster: CockroachDB {{ site.data.products.standard }}, CockroachDB {{ site.data.products.basic }}, and CockroachDB {{ site.data.products.advanced }}.

To get started right away, you can [sign up for a CockroachDB {{ site.data.products.cloud }} account](https://cockroachlabs.cloud) and [create a cluster]({% link cockroachcloud/create-your-cluster.md %}) using [trial credits]({% link cockroachcloud/billing-management.md %}#view-credits-balance).

## Plans

When you create a cluster in CockroachDB {{ site.data.products.cloud }}, you select its plan. A CockroachDB {{ site.data.products.cloud }} organization can include clusters of each plan. This section provides an overview of each plan. For a more detailed comparison, refer to [Compare plans](#compare-plans).

- **CockroachDB {{ site.data.products.basic }}**: TODO

- **CockroachDB {{ site.data.products.standard }}**: TODO

- ** CockroachDB {{ site.data.products.advanced }}**: TODO

## Compare plans

This section summarizes key details about each plan to help you make the best choice for each cluster and its workload. For more details, refer to:

- [Plan a CockroachDB {{ site.data.products.basic }} cluster]({% link cockroachcloud/plan-a-basic-cluster.md %})
- [Plan a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/plan-your-cluster.md %})
- [Plan a CockroachDB {{ site.data.products.advanced }} cluster]({% link cockroachcloud/plan-an-advanced-cluster.md %})

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
    <td>Usage-based via [Request Units]({% link cockroachcloud/create-a-basic-cluster.md %}#step-4-edit-cluster-capacity)</td>
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
    <td>Managed backup storage</td>
    <td>Daily backups included in Request Unit costs</td>
    <td>Usage-based, varies per cloud provider and region.<br /><br />Currently not charged during [Usage-based backup metrics Preview]({% link {{ site.current_cloud_version}}/essential-metrics.md %}#backup-and-restore).</td>
    <td>Usage-based, varies per cloud provider and region.<br /><br />Currently not charged during [Usage-based backup metrics Preview]({% link {{ site.current_cloud_version}}/essential-metrics.md %}#backup-and-restore).</td>
  </tr>
  <tr>
    <td>[Data transfer](#data-transfer)</td>
    <td>Usage-based via Request Units</td>
    <td>Usage-based; cloud provider list price<br /><br />Currently not charged during [Usage-based backup metrics Preview]({% link {{ site.current_cloud_version}}/essential-metrics.md %}#backup-and-restore)</td>
    <td>Usage-based; cloud provider list price<br /><br />Currently not charged during [Usage-based backup metrics Preview]({% link {{ site.current_cloud_version}}/essential-metrics.md %}#backup-and-restore)</td>
  </tr>
  <tr>
    <td>[Change Data Capture]({% link {{site.current_cloud_version}}/change-data-capture-overview.md %})</td>
    <td>Usage-based via Request Units</td>
    <td>Usage-based.<br /><br />Currently not charged during [Usage-based backup metrics Preview]({% link {{ site.current_cloud_version}}/essential-metrics.md %}#backup-and-restore)</td>
    <td>Usage-based.<br /><br />Currently not charged during [Usage-based backup metrics Preview]({% link {{ site.current_cloud_version}}/essential-metrics.md %}#backup-and-restore)</td>
  </tr>
</tbody>
</table>

To learn more about pricing in CockroachDB {{ site.data.products.cloud }}, refer to [Pricing](https://www.cockroachlabs.com/pricing/).

## More details

This section supplements the details in [Compare plans](#compare-plans). Select a plan to learn more.

<div class="filters clearfix">
  <button class="filter-button" data-scope="basic">CockroachDB {{ site.data.products.basic }}</button>
  <button class="filter-button" data-scope="standard">CockroachDB {{ site.data.products.standard }}</button>
  <button class="filter-button" data-scope="advanced">CockroachDB {{ site.data.products.advanced }}</button>
</div>

### Compute

<section class="filter-content" markdown="1" data-scope="basic">

For CockroachDB {{ site.data.products.basic }}, compute is usage-based and calculated in Request Units.

</section>

<section class="filter-content" markdown="1" data-scope="standard">

A CockroachDB {{ site.data.products.standard }} cluster's provisioned compute capacity is configured when the cluster is created and can be modified over time. This capacity represents the peak processing power the deployment can handle at any given time.

Provisioned compute is calculated in vCPU-hours, with rates depending on the cloud provider and the region. Billing is based on the capacity reserved, not the actual usage. Charges are accumulated throughout the month to determine the total monthly compute charges.

In a multi-region cluster, the price of the most expensive region is applied to the entire cluster’s compute capacity. The compute cost is calculated by multiplying the total provisioned capacity by the highest rate per vCPU-hour among all regions.

Refer to [Pricing](https://www.cockroachlabs.com/pricing/).

</section>

<section class="filter-content" markdown="1" data-scope="advanced">

Each node of a CockroachDB {{ site.data.products.advanced }} cluster is provisioned with dedicated vCPU resources. You can [customize]({% link create-an-advanced-cluster.md %}#step-5-configure-cluster-capacity) the number of vCPUs per node. This configuration applies to all nodes in the cluster. Compute costs are based on the vCPUs provisioned for each node, at rates that vary rates depending on the cloud provider and region.

Compute charges are calculated hourly by multiplying the hourly rate of the provisioned compute per node and number of nodes per cluster. These charges are accumulated throughout the month to determine the total monthly compute charges. When you configure your cluster's capacity, you are implicitly selecting a _machine type_ offered by the cloud provider. Different machine types are billed at different rates. The hourly compute cost is calculated by multiplying the hourly rate of the machine type by the number of nodes.

Refer to [Pricing](https://www.cockroachlabs.com/pricing/).

</section>

### Storage

{{site.data.alerts.callout_info}}
There is no charge for backup storage during [Usage-based backup metrics Preview]({% link {{ site.current_cloud_version}}/essential-metrics.md %}#backup-and-restore)
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="basic">

Storage for CockroachDB {{ site.data.products.basic }} is automatically provisioned on demand, eliminating the need for manual management. Costs are based on actual usage and adjust dynamically as data is added or removed, starting from zero.

Storage is billed hourly, with [rates](https://www.cockroachlabs.com/pricing) depending on the cloud provider and the region where the cluster is hosted.{% comment %}TODO: Resolve this contradiction. https://cockroachlabs.slack.com/archives/C05KHQULKFB/p1726955009576009{% endcomment %}

</section>

<section class="filter-content" markdown="1" data-scope="standard">

Storage for CockroachDB {{ site.data.products.standard }} is automatically provisioned on demand, eliminating the need for manual management. Costs are based on actual usage and adjust dynamically as data is added or removed, starting from zero.

A CockroachDB {{ site.data.products.standard }} cluster maintains a minimum of three replicas of your data, which are maintained at no additional cost. If you add further replicas, each will incur a storage cost equal to that of the logical database size. For more details, refer to [Plan a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/plan-your-cluster.md %}).

Storage is billed hourly, with [rates](https://www.cockroachlabs.com/pricing) specific to each cloud provider and the region where the cluster is hosted. CockroachDB {{ site.data.products.cloud }} measures storage in GiB-hour. Hourly storage charges are accumulated throughout the month to determine the total monthly storage charges.

</section>

<section class="filter-content" markdown="1" data-scope="advanced">

Each CockroachDB {{ site.data.products.advanced }} cluster is provisioned with dedicated storage, configured when the cluster is created. The storage configuration applies to all nodes in the cluster. Storage is billed hourly, with [rates](https://www.cockroachlabs.com/pricing) depending on the cluster's cloud provider and regions. Storage costs are independent of compute costs, and you can adjust your cluster's storage capacity without altering its vCPU or memory configurations. Refer to [Plan a CockroachDB {{ site.data.products.advanced }} cluster]({% link cockroachcloud/plan-an-advanced-cluster.md %}).

- **AWS**: For CockroachDB {{ site.data.products.advanced }} on AWS, storage charges are calculated per hour by multiplying the storage size in GiB by the hourly rate charged by AWS, plus any additional charges for IOPS.
- **GCP and Azure**: For CockroachDB {{ site.data.products.advanced }} on GCP or Azure, storage charges are calculated per hour by multiplying the storage size in GiB by the hourly rate charged by the cloud provider, with no additional fees for IOPS.

Hourly storage charges are accumulated throughout the month to determine the total monthly storage charges.

</section>

### Data transfer

{{site.data.alerts.callout_info}}
There is no charge for data transfer during [Usage-based backup metrics Preview]({% link {{ site.current_cloud_version}}/essential-metrics.md %}#backup-and-restore)
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="basic">
For CockroachDB {{ site.data.products.basic }}, data transfer is included in the Request Unit price.
</section>

{% capture standard_and_advanced_data_transfer %}
The usage data is based on the volume of data transferred (per GiB), using the cloud provider's rate for the type of data transfer: to the same region, across regions, or across the public internet.
{% endcapture %}

{% capture standard_and_advanced_cross_and_public %}
- **Cross-region**: When data is transferred from one region to another, this incurs additional cross-region charges, also known as inter-region charges. Data transfer across regions typically incurs higher costs than same-region transfer.
- **Public internet**: When data, manual backups, or logs are transferred or exported out of your cluster to SQL clients, third-party tools or storage, it is classified as public-internet data transfer.
{% endcapture %}

Cloud providers may calculate each category differently. Refer to the documentation for the Cloud provider (AWS, GCP, or Azure).

<section class="filter-content" markdown="1" data-scope="standard">
For CockroachDB {{ site.data.products.standard }}, data transfer is billed based on usage.

{{ standard_and_advanced_data_transfer }}

- **Same-region**: CockroachDB {{ site.data.products.standard }} stores data in three availability zones (AZs) per region. Data transfer among the AZs in the same region is classified as same-region data transfer.
{{ standard_and_advanced_cross_and_public }}

</section>

<section class="filter-content" markdown="1" data-scope="advanced">
For CockroachDB {{ site.data.products.advanced }}, data transfer is billed based on usage.

{{ standard_and_advanced_data_transfer }}

- **Same-region**: CockroachDB {{ site.data.products.advanced }} requires a minimum of three nodes per region, in three availability zones (AZs). Data transfer among the AZs in the same region is classified as same-region data transfer.
{{ standard_and_advanced_cross_and_public }}

</section>

### Changefeeds

All CockroachDB {{ site.data.products.cloud }} clusters can use [Enterprise Changefeeds](% link {{ site.current_cloud_version}}/how-does-an-enterprise-changefeed-work.md %).

{{site.data.alerts.callout_info}}
There is no charge for changefeeds during [Usage-based backup metrics Preview]({% link {{ site.current_cloud_version}}/essential-metrics.md %}#backup-and-restore)
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="basic">

In CockroachDB {{ site.data.products.basic }}, Change Data Capture is included in the Request Unit price.
</section>

<section class="filter-content" markdown="1" data-scope="standard">

In CockroachDB {{ site.data.products.standard }}, Change Data Capture is billed monthly based on usage, and is calculated monthly based on the total GiB watched across all of a cluster's changefeeds, with the following thresholds:

- &lt; 5 GiB/month
- 5-100 GiB/month
- 100-250 GiB/month
- &gt; 250 GiB/month

</section>

<section class="filter-content" markdown="1" data-scope="advanced">

In CockroachDB {{ site.data.products.standard }}, Change Data Capture is billed monthly based on usage, and is calculated monthly based on the total GiB watched across all of a cluster's changefeeds, with the following thresholds:

- &lt; 5 GiB/month
- 5-100 GiB/month
- 100-250 GiB/month
- &gt; 250 GiB/month

</section>

## Next steps

- [Plan a CockroachDB {{ site.data.products.basic }} cluster]({% link cockroachcloud/plan-your-cluster-basic.md %}) and [Create a CockroachDB {{ site.data.products.basic }} cluster]({% link cockroachcloud/create-a-basic-cluster.md %}).
- [Plan a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/plan-your-cluster.md %}) and [Create a CockroachDB {{ site.data.products.standard }} cluster]({% link create-your-cluster.md %})
- [Plan a CockroachDB {{ site.data.products.advanced }} cluster]({% link cockroachcloud/plan-your-cluster-advanced.md %}) and [Create a CockroachDB {{ site.data.products.advanced }} cluster]{% link cockroachcloud/create-an-advanced-cluster.md %}

{% comment %}Old content below
<div class="home-header mb-xl-5 bg-cover bg-cover__bg-gradient-purple-blue">
  <div class="p-2 p-md-5">
  <h1 class="m-0 text-white">CockroachDB Cloud Docs</h1>
  <p class="mt-0 pb-4 text-white">Get your applications to market faster with a fully managed CockroachDB instance.</p>
    <div class="row d-lg-flex mx-0 pt-lg-5">
      <div class="col-lg-4 mb-3 mb-lg-0 pb-5">
        <div class="card card-link h-100 d-flex ">
        <a href="quickstart.html" class="h-100">
          <div class="card-body p-4 d-flex flex-column h-100 card-header-overlap-text">
            <h6 class="mt-2 mt-0 text-black">Quickstart with<br>CockroachDB Cloud</h6>
            <p class="text-black">Learn how to create and use your CockroachDB {{ site.data.products.cloud }} cluster</p>
            <h4 class="mt-auto mb-0 text-electric-purple font-poppins-sb text-center">Learn more <img class="mt-2 mt-0 ml-2" src="{{ 'images/icon-arrow-right-purple.svg' | relative_url }}" alt="arrow right" /></h4>
          </div>
          </a>
        </div>
      </div>
      <div class="col-lg-4 mb-3 mb-lg-0 pb-5">
        <div class="card card-link h-100 d-flex ">
        <a href="cluster-management.html" class="h-100">
          <div class="card-body p-4 d-flex flex-column h-100 card-header-overlap-text">
            <h6 class="mt-2 mt-0 text-black">Manage your <br>cluster</h6>
            <p class="text-black">Manage your cluster's schema, data, and backups</p>
            <h4 class="mt-auto mb-0 text-electric-purple font-poppins-sb text-center">Learn more <img class="m-0 ml-2" src="{{ 'images/icon-arrow-right-purple.svg' | relative_url }}" alt="arrow right" /></h4>
          </div>
          </a>
        </div>
        </div>
    </div>
  </div>
</div>
  <div class="row pt-5 mt-5 pb-5 mb-5">
    <div class="col-lg-12 text-center">
      <a class="btn btn-redirect mt-3" href="https://cockroachlabs.cloud/signup?referralId=docs_cc_landing">Start a Free Serverless Cluster <img class="m-0" src="{{ 'images/arrow-left.svg' | relative_url }}" alt="arrow left" /></a>
    </div>
  </div>

<div class="container">

  <div class="row">
    <div class="col-12">
      <p class="overline">CockroachDB Cloud</p>
      <h2 class="mt-2">Recommended articles</h2>
    </div>
  </div>

  <div class="row display-flex pb-4">
    <div class="col-6 col-lg-3">
      <h3 class="mt-3">Get Started</h3>
      <div class="landing-column-content">
      <ul>
        <li><a href="{% link cockroachcloud/quickstart.md %}">Start a Free Serverless Cluster</a></li>
        <li><a href="{% link cockroachcloud/create-your-cluster.md %}">Start a Dedicated Cluster</a></li>
        <li><a href="{% link cockroachcloud/connect-to-your-cluster.md %}">Connect to Your Cluster</a></li>
        <li><a href="{% link cockroachcloud/learn-cockroachdb-sql.md %}">Learn CockroachDB SQL</a></li>
        <li><a href="{% link {{site.current_cloud_version}}/build-a-python-app-with-cockroachdb-django.md %}">Hello, World!</a></li>
        </ul>
      </div>
    </div>
    <div class="col-6 col-lg-3">
      <h3 class="mt-3">Use Your Cluster</h3>
      <div class="landing-column-content">
      <ul>
        <li><a href="{% link {{site.current_cloud_version}}/migration-overview.md %}">Migrate Data</a></li>
        <li><a href="{% link {{site.current_cloud_version}}/performance-best-practices-overview.md %}">Tune Performance</a></li>
        <li><a href="{% link cockroachcloud/production-checklist.md %}">Move into Production</a></li>
        <li><a href="{% link cockroachcloud/cluster-management.md %}">Manage Your Cluster</a></li>
        <li><a href="{% link cockroachcloud/managing-access.md %}">Managing Access in CockroachDB Cloud</a></li>
        <li><a href="{% link cockroachcloud/billing-management.md %}">Manage Billing</a></li>
        </ul>
      </div>
    </div>
    <div class="col-6 col-lg-3">
      <h3 class="mt-3">Develop</h3>
      <div class="landing-column-content">
      <ul>
        <li><a href="{% link {{site.current_cloud_version}}/developer-guide-overview.md %}">Common Dev Tasks</a></li>
        <li><a href="{% link {{site.current_cloud_version}}/example-apps.md %}">Sample Apps</a></li>
        <li><a href="{% link {{site.current_cloud_version}}/sql-feature-support.md %}">SQL Reference</a></li>
        <li><a href="{% link {{site.current_cloud_version}}/performance-best-practices-overview.md %}">SQL Best Practices</a></li>
        <li><a href="{% link {{site.current_cloud_version}}/query-behavior-troubleshooting.md %}">SQL Troubleshooting</a></li>
        </ul>
      </div>
    </div>
    <div class="col-6 col-lg-3">
      <h3 class="mt-3">Learn More</h3>
      <div class="landing-column-content">
      <ul>
        <li><a href="{% link cockroachcloud/upgrade-policy.md %}">Upgrade Policy</a></li>
        <li><a href="{% link cockroachcloud/deploy-a-python-to-do-app-with-flask-kubernetes-and-cockroachcloud.md %}">Deploy a Python App</a></li>
        <li><a href="{% link cockroachcloud/stream-changefeed-to-snowflake-aws.md %}">Stream a Changefeed</a></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="row">
    <div class="col-lg-12">
      <div class="card shadow position-relative alert alert-dismissable">
        <a
          class="close close-card position-absolute"
          href="#"
          data-dismiss="alert"
          aria-label="Close"
          ><svg
            width="11"
            height="11"
            viewBox="0 0 11 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M1.75373 0.387174C1.37633 0.00977659 0.764449 0.00977659 0.387052 0.387174C0.00965453 0.764571 0.00965453 1.37645 0.387052 1.75385L3.73733 5.10413L0.387052 8.4544C0.00965451 8.8318 0.00965451 9.44368 0.387052 9.82108C0.764449 10.1985 1.37633 10.1985 1.75373 9.82108L5.104 6.4708L8.45428 9.82108C8.83168 10.1985 9.44356 10.1985 9.82096 9.82108C10.1984 9.44368 10.1984 8.8318 9.82096 8.4544L6.47068 5.10413L9.82096 1.75385C10.1984 1.37645 10.1984 0.764571 9.82096 0.387174C9.44356 0.00977658 8.83168 0.00977658 8.45428 0.387174L5.104 3.73745L1.75373 0.387174Z"
              fill="black"
            />
          </svg>
        </a>
        <div class="row no-gutters p-3">
          <div class="col-md-6 m-0">
          <div class="embed-responsive embed-responsive-16by9">
            <iframe src="https://www.youtube.com/embed/XJZD1rorEQE" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card-body p-0 pl-4">
              <p
                class="d-inline-block caption-sm rounded py-1 px-3 bg-purple-transparent font-weight-bold text-purple-300 m-0"
              >
                CockroachDB Cloud
              </p>
              <h6 class="card-title font-weight-bold mt-3">
                Connecting to Your CockroachDB Cloud Cluster
              </h6>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</div>
{% endcomment %}
