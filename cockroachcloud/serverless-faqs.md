---
title: CockroachDB Serverless (beta) FAQs
summary: Get answers to frequently asked questions about CockroachDB Serverless (beta)
toc: true
redirect_from: free-faqs.html
filter_category: cloud_faqs
filter_html: CockroachDB Serverless (beta)
filter_sort: 1
docs_area: get_started
---

This page answers the frequently asked questions about {{ site.data.products.serverless }} and {{ site.data.products.dedicated }}.

{% include filter-tabs.md %}

## General

### What is {{ site.data.products.serverless }}?

{{ site.data.products.serverless }} delivers free and pay-as-you-go CockroachDB clusters for you and your Organization. It is a managed instance of CockroachDB that lets you start using your database immediately and auto-scales based on your application traffic.

{{site.data.alerts.callout_success}}
For a deeper dive into serverless database concepts and how to get started with {{ site.data.products.serverless }}, take the free [Introduction to Serverless Databases and {{ site.data.products.serverless }}](https://university.cockroachlabs.com/courses/course-v1:crl+intro-to-serverless+self-paced/about) course on Cockroach University.
{{site.data.alerts.end}}

### How do I start using {{ site.data.products.serverless }}?

To get started with {{ site.data.products.serverless }}, <a href="https://cockroachlabs.cloud/signup?referralId=docs_serverless_faq" rel="noopener" target="_blank">sign up for a {{ site.data.products.db }} account</a>, click **Create Cluster**, then click **Create your free cluster**. Your cluster will be ready in 20-30 seconds. For more information, see [**Quickstart**](quickstart.html).

### What are the usage limits of {{ site.data.products.serverless }}?

Clusters start with 10M RUs of free burst capacity each month and earn 100 RUs per second up to a maximum of 250M free RUs per month. Earned RUs can be used immediately or accumulated. If you use all of your burst capacity and earned RUs, your cluster will revert to baseline performance.

If you set a spend limit, your cluster will not be throttled to baseline performance once you use all of your free earned RUs. Instead, it will continue to use burst performance as needed until you reach your spend limit. If you reach your spend limit, your cluster will revert to the baseline performance of 100 RUs per second.

You can create a maximum of five Serverless clusters per organization.

### What is a Request Unit?

With {{ site.data.products.serverless }}, you are charged for the storage and activity of your cluster. All cluster activity, including SQL queries, bulk operations, and background jobs, is measured in [Request Units](learn-about-serverless.html), or RUs. RUs are an abstracted metric that represent the size and complexity of requests made to your cluster. For example, the cost to do a prepared point read (fetching a single row by its key) of a 64 byte row is approximately 1 RU, plus 1 RU for each additional KiB. Writing a 64 byte row costs approximately 7 RUs, which includes the cost of replicating the write 3 times for high availability and durability, plus 3 RUs for each additional KiB. Request Unit consumption scales to zero when your cluster has no activity, so you will only be charged for what you use.

### Do I have to pay for {{ site.data.products.serverless }}?

No, you can create a Serverless cluster that is free forever. If you choose to set a spend limit for your cluster, you will only be charged for the resources you use up to your spend limit.

### How can I estimate how many RUs my workload will consume?

{% include cockroachcloud/serverless-usage.md %}

### How can I reduce the number of RUs my workload consumes?

Make sure your queries have been [optimized for performance](../{{site.versions["stable"]}}/make-queries-fast.html), and follow the [SQL best practices recommendations](../{{site.versions["stable"]}}/performance-best-practices-overview.html).

For example, if your statement uses filters in a `WHERE` clause but you don't have [indexes on the filter columns](../{{site.versions["stable"]}}/schema-design-indexes.html#best-practices), you will consume more RUs because the statement causes a full table scan when doing the join. Use the [`EXPLAIN` statement](../{{site.versions["stable"]}}/explain.html) with your queries to find full table scans or other costly operations. Adding the correct index will result in better performance for the statement, and also consume fewer RUs.

The size of the data in your columns also directly affects RU consumption and query performance. For example, Cockroach Labs recommends [keeping `JSONB` column data under 1 MB](../{{site.versions["stable"]}}/jsonb.html#size) to maximize performance. Statements that read or write large `JSONB` values will consume more RUs as the storage and I/O costs are higher. Adding [GIN indexes](../{{site.versions["stable"]}}/inverted-indexes.html) or [partial GIN indexes](../{{site.versions["stable"]}}/partial-indexes.html#partial-gin-indexes) when querying `JSONB` columns can help improve performance and reduce the RU usage of these statements.

### What can I use {{ site.data.products.serverless }} for?

Free {{ site.data.products.serverless }} clusters can be used for proofs-of-concept, toy programs, or to use while completing [Cockroach University](https://www.cockroachlabs.com/cockroach-university/).

For examples of applications that use free clusters, check out the following [Hack the North](https://hackthenorth.com/) projects:

- [flock](https://devpost.com/software/flock-figure-out-what-film-to-watch-with-friends)
- [mntr.tech](https://devpost.com/software/mntr-tech)
- [curbshop.online](https://devpost.com/software/curbshop-online)

Paid Serverless clusters include additional resources to maintain higher performance. They are ideal for applications with varying workloads and spikes in traffic. We do not recommend using {{ site.data.products.serverless-plan }} for production applications that need an SLA while it is still in beta.

### How do I connect to my cluster?

To connect to a cluster, download the CA certificate, and then generate a connection string or parameters. You can use this information to connect to your cluster through the CockroachDB SQL client or a PostgreSQL-compatible driver or ORM. For more details, see [Connect to Your {{ site.data.products.serverless }} Cluster](connect-to-a-serverless-cluster.html).

### I created a CockroachCloud Free (beta) cluster before {{ site.data.products.serverless }} was available. Can I still use my cluster?

Yes, your free cluster has been automatically migrated to {{ site.data.products.serverless }}. Your ability to use your cluster should not be affected, and you will now have the option to [add a spend limit](serverless-cluster-management.html#edit-your-spend-limit) for your cluster with no downtime.

### Why does my RU usage briefly spike when I'm running a steady workload?

CockroachDB [automatically collects statistics](../{{site.versions["stable"]}}/cost-based-optimizer.html#control-statistics-refresh-rate) in a background process when certain conditions are met (for example, when more than 20% of rows in a table are modified). The statistics are used by the cost-based optimizer to tune statements for higher performance.

When automatic statistics collection starts your cluster may consume RUs above the 100 RUs per second baseline when your workload is otherwise consuming RUs below the baseline. You can [turn off automatic statistics collection](../{{site.versions["stable"]}}/cost-based-optimizer.html#turn-off-statistics) to avoid these RU bursts, but the cost-based optimizer may choose inefficient statement plans as it doesn't have access to the latest statistics.

### What is the cold start latency of a Serverless cluster?

When a Serverless cluster is idle, it will scale down to zero and consume no RUs. When the cluster becomes active again it will begin serving requests within a fraction of a second, typically around 600 milliseconds.

## Beta release

### What does it mean for {{ site.data.products.serverless-plan }} to be in beta?

{{ site.data.products.serverless }} is in beta while we continue to add new features and improve our own testing for existing features. We don’t provide a Support Policy or Service Level Agreement (SLA) for beta products.

### Where can I submit feedback or bugs on the beta?

You can submit feedback or log any bugs you find through [this survey](https://forms.gle/jWNgmCFtF4y15ePw5).

## Security

### Is my cluster secure?

Yes, we use separate certificate authorities for each cluster, and all connections to the cluster over the internet use TLS 1.3.

### What certificates do I need to connect to my cluster?

All connections to {{ site.data.products.serverless }} require SSL encryption. When connecting to your cluster using the CockroachDB SQL client or many drivers and ORMs, you don't need to download a root certificate and configure your client to use that certificate because the client will connect using the system root certificates. If you configure your client to use SSL and to verify the certificates (for example, by setting `sslmode=verify-full` in your [connection string](../{{site.versions["stable"]}}/connection-parameters.html#additional-connection-parameters)), your connection will be encrypted.

However, some drivers and ORMs don't use the system root certificates. In those cases, you need to download a root certificate file and configure your client to use that certificate when connecting to your cluster. You can [download the certificate](connect-to-a-serverless-cluster.html?filters=connection-string#step-2-connect-to-your-cluster) by following the instructions in the {{ site.data.products.db }} Console. Configure your client to use this certificate (for example, by setting `sslrootcert=<path to the root certificate>` in your connection string) and to use SSL (for example, by setting `sslmode=verify-full` in your connection string) to connect to your cluster.

See [Connect to a CockroachDB Cluster](../{{site.versions["stable"]}}/connect-to-the-database.html) for detailed information on connecting to your cluster using CockroachDB supported languages, drivers, and ORMs

### Is encryption-at-rest enabled on {{ site.data.products.serverless }}?

Yes. All data on {{ site.data.products.db }} is encrypted-at-rest using the tools provided by the cloud provider that your cluster is running in.

- Data stored in clusters running in GCP are encrypted-at-rest using [persistent disk encryption](https://cloud.google.com/compute/docs/disks#pd_encryption).
- Data stored in clusters running in AWS are encrypted-at-rest using [EBS encryption-at-rest](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html).

Because we are relying on the cloud provider's encryption implementation (as noted above), we do not enable CockroachDB's [internal implementation of encryption-at-rest](../{{site.versions["stable"]}}/security-reference/encryption.html#encryption-at-rest-enterprise). This means that encryption will appear to be disabled in the [DB Console](../{{site.versions["stable"]}}/ui-overview.html), since the console is unaware of cloud provider encryption.

### Is my cluster isolated? Does it share resources with any other clusters?

{{ site.data.products.serverless }} is a multi-tenant offering and resources are shared between clusters. For more information, see [{{ site.data.products.serverless }} Architecture](architecture.html).

## Cluster maintenance

### Can I upgrade my free {{ site.data.products.serverless }} cluster's performance?

Yes, you can upgrade your cluster through the Console by [increasing your spend limit](serverless-cluster-management.html#edit-your-spend-limit) and entering [billing information](billing-management.html) if you haven't already.

### Can I upgrade the version of CockroachDB my {{ site.data.products.serverless }} cluster is running on?

No, {{ site.data.products.serverless }} clusters are upgraded automatically for you. You can see what version of CockroachDB your cluster is running in the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud/) or in the [latest release notes](../releases/cloud.html).

## Product features

### Do you have a UI? How can I see details?

Yes, you can view and your clusters in the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud/). However, some [DB Console](../{{site.versions["stable"]}}/ui-overview.html) pages are not currently available for {{ site.data.products.serverless }} clusters.

### Can I run bulk operations such as `IMPORT` and `EXPORT` from my cluster?

Yes, you can [run bulk operations on Serverless clusters](run-bulk-operations.html). If you [add billing information to your organization](billing-management.html), even if you don't set a spend limit, you can run bulk operations using cloud storage providers. If you don't have billing set up for your organization, you can set up a [`userfile`](../{{site.versions["stable"]}}/use-userfile-for-bulk-operations.html) location for bulk operations.

{{site.data.alerts.callout_danger}}
We don't recommend `userfile` for `EXPORT` operations. You can either add billing information to your organization to enable access to cloud storage, or [export data to a local CSV file](migrate-from-serverless-to-dedicated.html#step-1-export-data-to-a-local-csv-file).
{{site.data.alerts.end}}

### Is change data capture available to me?

Yes, {{ site.data.products.serverless-plan }} clusters have access to both [Core Changefeeds](../{{site.versions["stable"]}}/changefeed-examples.html#create-a-core-changefeed) and [Enterprise Changefeeds](../{{site.versions["stable"]}}/changefeed-examples.html).

### Can I backup my {{ site.data.products.serverless }} cluster? Does Cockroach Labs take backups of my cluster?

{{ site.data.products.db }} does not take incremental backups of Serverless clusters, and you cannot restore backups from the Console. However, you can backup and restore your {{ site.data.products.serverless }} cluster manually. If you don't have [billing information on file](billing-management.html) for your organization, you can [take backups locally](run-bulk-operations.html#backup-and-restore-data) to `userfile`. Once you enter billing information, even if you don't set a spend limit, you can also [backup to cloud storage](run-bulk-operations.html#backup-and-restore-data).

{{site.data.alerts.callout_info}}
Running a [bulk operation](run-bulk-operations.html) to cloud storage from a {{ site.data.products.serverless }} cluster without first entering billing information will cause the following error: `external network access is disabled`.
{{site.data.alerts.end}}
