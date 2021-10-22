---
title: CockroachDB Serverless (beta) FAQs
summary: Get answers to frequently asked questions about CockroachDB Serverless (beta)
toc: true
redirect_from: free-faqs.html
---

This page answers the frequently asked questions about {{ site.data.products.serverless }} and {{ site.data.products.dedicated }}.

<div class="filters clearfix">
    <a href="serverless-faqs.html"><button class="filter-button page-level current">{{ site.data.products.serverless }}</button></a>
    <a href="frequently-asked-questions.html"><button class="filter-button page-level">{{ site.data.products.dedicated }}</button></a>
</div>

## General

### What is {{ site.data.products.serverless }}?

{{ site.data.products.serverless }} delivers free and pay-as-you-go CockroachDB clusters for you and your Organization. It is a managed instance of CockroachDB that lets you start using your database immediately and auto-scales based on your application traffic.

### How do I start using {{ site.data.products.serverless }}?

To get started with {{ site.data.products.serverless }}, <a href="https://cockroachlabs.cloud/signup?referralId=docs_serverless_faq" rel="noopener" target="_blank">sign up for a {{ site.data.products.db }} account</a>, click **Create Cluster**, then click **Create your free cluster**. Your cluster will be ready in 20-30 seconds. For more information, see [**Quickstart**](quickstart.html).

### What are the usage limits of {{ site.data.products.serverless }}?

Clusters start with 10M RUs of free burst capacity each month and earn 100 RUs per second up to a maximum of 250M free RUs per month. Earned RUs can be used immediately or accumulated. If you use all of your burst capacity and earned RUs, your cluster will revert to baseline performance.

If you set a spend limit, your cluster will not be throttled to baseline performance once you use all of your free earned RUs. Instead, it will continue to use burst performance as needed until you reach your spend limit. If you reach your spend limit, your cluster will revert to the baseline performance of 100 RUs per second.

You can create a maximum of five Serverless clusters per organization.

### What is a Request Unit?

All resource usage in {{ site.data.products.serverless }} is measured in Request Units, or RUs. RUs represent the compute and I/O resources used by a query. All database operations cost a certain amount of RUs depending on the resources used. For example, a "small read" might cost 2 RUs, and a "large read" such as a full table scan with indexes might cost 100 RUs.

### Do I have to pay for {{ site.data.products.serverless }}?

No, you can create a Serverless cluster that is free forever. If you choose to set a spend limit for your cluster, you will only be charged for the resources you use up to your spend limit.

### What can I use {{ site.data.products.serverless }} for?

Free {{ site.data.products.serverless }} clusters can be used for proofs-of-concept, toy programs, or to use while completing [Cockroach University](https://www.cockroachlabs.com/cockroach-university/).

For examples of applications that use free clusters, check out the following [Hack the North](https://hackthenorth.com/) projects:

- [flock](https://devpost.com/software/flock-figure-out-what-film-to-watch-with-friends)
- [mntr.tech](https://devpost.com/software/mntr-tech)
- [curbshop.online](https://devpost.com/software/curbshop-online)

Paid Serverless clusters include additional resources to maintain higher performance. They are ideal for applications with varying workloads and spikes in traffic. We do not recommend using {{ site.data.products.serverless-plan }} for production applications that need an SLA while it is still in beta.

### How do I connect to my cluster?

To connect to a cluster, download the CA certificate, and then generate a connection string or parameters. You can use this information to connect to your cluster through the CockroachDB SQL client or a Postgres-compatible driver or ORM. For more details, see [Connect to Your {{ site.data.products.serverless }} Cluster](connect-to-a-serverless-cluster.html).

### I created a CockroachCloud Free (beta) cluster before {{ site.data.products.serverless }} was available. Can I still use my cluster?

Yes, your free cluster has been automatically migrated to {{ site.data.products.serverless }}. Your ability to use your cluster should not be affected, and you will now have the option to [add a spend limit](serverless-cluster-management.html#edit-your-spend-limit) for your cluster with no downtime.

### My cluster doesn't have any current connections, but I'm seeing my RU usage go up while observing the cluster. Why is the cluster using RUs when there are no connections?

Some pages on the Console runs background queries against your cluster, which means they consume a small number of RUs, up to 8 RUs per second. The baseline performance of 100 RUs per second includes the RUs used while observing an idle cluster.

### Why does my RU usage briefly spike when I'm running a steady workload?

CockroachDB will [automatically collect statistics](../{{site.versions["stable"]}}/cost-based-optimizer.html#control-statistics-refresh-rate) as a background process when certain conditions are met (for example, when more than 20% of rows in a table are modified). When automatic statistics collection is started your cluster may consume RUs above the 100 Request Units per second baseline when your workload is otherwise consuming RUs below the baseline. The statistics are used by the [cost-based optimizer](../{{site.versions["stable"]}}/cost-based-optimizer.html) to tune statements for higher performance. You can [turn off automatic statistics collection](../{{site.versions["stable"]}}/cost-based-optimizer.html#turn-off-statistics) to avoid these RU bursts, but the cost-based optimizer may choose inefficient statement plans as it doesn't have access to the latest statistics.

## Beta release

### What does it mean for {{ site.data.products.serverless-plan }} to be in beta?

{{ site.data.products.serverless }} is in beta while we continue to add new features and improve our own testing for existing features. We don’t provide a Support Policy or Service Level Agreement (SLA) for beta products.

### Where can I submit feedback or bugs on the beta?

You can submit feedback or log any bugs you find through [this survey](https://forms.gle/jWNgmCFtF4y15ePw5).

## Security

### Is my cluster secure?

Yes, we use separate certificate authorities for each cluster, and all connections to the cluster over the internet use TLS 1.3.

### Is encryption-at-rest enabled on {{ site.data.products.serverless }}?

Yes. All data on {{ site.data.products.db }} is encrypted-at-rest using the tools provided by the cloud provider that your cluster is running in.

- Data stored in clusters running in GCP are encrypted-at-rest using [persistent disk encryption](https://cloud.google.com/compute/docs/disks#pd_encryption).
- Data stored in clusters running in AWS are encrypted-at-rest using [EBS encryption-at-rest](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html).

Because we are relying on the cloud provider's encryption implementation (as noted above), we do not enable CockroachDB's [internal implementation of encryption-at-rest](../{{site.versions["stable"]}}/encryption.html#encryption-at-rest-enterprise). This means that encryption will appear to be disabled in the [DB Console](../{{site.versions["stable"]}}/ui-overview.html), since it is unaware of cloud provider encryption.

### Is my cluster isolated? Does it share resources with any other clusters?

{{ site.data.products.serverless }} is a multi-tenant offering and resources are shared between clusters. For more information, see [CockroachDB Serverless Architecture](architecture.html).

## Cluster maintenance

### Can I upgrade my free {{ site.data.products.serverless }} cluster's performance?

Yes, you can upgrade your cluster through the Console by [increasing your spend limit](serverless-cluster-management.html#edit-your-spend-limit) and entering [billing information](billing-management.html) if you haven't already.

### Can I upgrade the version of CockroachDB my {{ site.data.products.serverless }} cluster is running on?

No, {{ site.data.products.serverless }} clusters are upgraded automatically for you. You can see what version of CockroachDB your cluster is running in the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud/) or in the [latest release notes](../releases/index-cockroachcloud.html).

## Product features

### Do you have a UI? How can I see details?

Yes, you can view and your clusters in the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud/). However, some [DB Console](../{{site.versions["stable"]}}/ui-overview.html) pages are not currently available for {{ site.data.products.serverless }} clusters.

### Can I run bulk operations such as `IMPORT` and `EXPORT` from my cluster?

Yes, you can [run bulk operations on Serverless clusters](run-bulk-operations.html). If you [add billing information to your organization](billing-management.html) you can run bulk operations using cloud storage providers. If you don't have billing set up for your organization, you can set up a [`userfile`](../{{site.versions["stable"]}}/use-userfile-for-bulk-operations.html) location for bulk operations.

{{site.data.alerts.callout_danger}}
We don't recommend `userfile` for `EXPORT` operations. You can either add billing information to your organization to enable access to cloud storage, or [export data to a local CSV file](migrate-from-serverless-to-dedicated.html#step-1-export-data-to-a-local-csv-file).
{{site.data.alerts.end}}

### Is change data capture available to me?

Yes, {{ site.data.products.serverless-plan }} clusters have access to [Core Changefeeds](run-bulk-operations.html#stream-data-out-of-your-cockroachdb-cloud-cluster).

### Can I backup my {{ site.data.products.serverless }} cluster? Does Cockroach Labs take backups of my cluster?

{{ site.data.products.db }} does not take incremental backups of Serverless clusters, and you cannot restore backups from the Console. However, you can backup and restore your {{ site.data.products.serverless }} cluster manually. If you don't have [billing information on file](billing-management.html) for your organization, you can [take backups locally](run-bulk-operations.html#backup-and-restore-data) to `userfile`. Once you enter billing information, even if you don't set a spend limit, you can also [backup to cloud storage](run-bulk-operations.html#backup-and-restore-data).
