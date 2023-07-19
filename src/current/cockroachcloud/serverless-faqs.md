---
title: CockroachDB Serverless FAQs
summary: Get answers to frequently asked questions about CockroachDB serverless
toc: true
docs_area: get_started
---

This page answers the frequently asked questions about {{ site.data.products.serverless }} and {{ site.data.products.dedicated }}.

{% include cockroachcloud/filter-tabs/cloud-faqs.md %}

## General

### What is {{ site.data.products.serverless }}?

{{ site.data.products.serverless }} delivers free and pay-as-you-go CockroachDB clusters for you and your organization. It is a managed instance of CockroachDB that lets you start using your database immediately and auto-scales based on your application traffic.

{{site.data.alerts.callout_success}}
For a deeper dive into serverless database concepts and how to get started with {{ site.data.products.serverless }}, take the free [Introduction to Serverless Databases and {{ site.data.products.serverless }}](https://university.cockroachlabs.com/courses/course-v1:crl+intro-to-serverless+self-paced/about) course on Cockroach University.
{{site.data.alerts.end}}

### How do I start using {{ site.data.products.serverless }}?

To get started with {{ site.data.products.serverless }}, <a href="https://cockroachlabs.cloud/signup?referralId=docs_serverless_faq" rel="noopener" target="_blank">sign up for a {{ site.data.products.db }} account</a>, click **Create Cluster**, then click **Create your free cluster**. Your cluster will be ready in 20-30 seconds. For more information, see [**Quickstart**](quickstart.html).

### What are the usage limits of {{ site.data.products.serverless }}?

All {{ site.data.products.db }} organizations are given 50M RUs and 10 GiB of storage for free each month. Free resources can be spent across all {{ site.data.products.serverless }} clusters in an organization and will appear as a deduction on your monthly invoice.

[Setting higher resource limits](serverless-cluster-management.html#edit-your-resource-limits) will allow your cluster to scale to meet your application's needs and maintain a high level of performance. If you reach your storage limit, your cluster will be throttled and you will only be able to delete data or increase your storage limit. If you reach your RU limit, your cluster will be disabled until the end of the billing cycle unless you increase your RU limit.

Organizations without billing information on file can only create one cluster. Once you [set up billing information](billing-management.html), your organization can have up to 200 clusters.

### What is a Request Unit?

With {{ site.data.products.serverless }}, you are charged for the storage and activity of your cluster. All cluster activity, including SQL queries, bulk operations, and background jobs, is measured in [Request Units](plan-your-cluster-serverless.html#request-units), or RUs. An RU is an abstracted metric that represent the size and complexity of requests made to your cluster. See [Plan your {{ site.data.products.serverless }} Cluster](plan-your-cluster-serverless.html#request-units) for more information.

### Do I have to pay for {{ site.data.products.serverless }}?

No, you can create one {{ site.data.products.serverless }} cluster for free. The free cluster can use up to 50M RUs and 10 GiB of storage per month. If you need more resources, you can [set higher limits](serverless-cluster-management.html#edit-your-resource-limits) for your cluster. You will only be charged for your usage beyond the free threshold.

### What regions are available for {{ site.data.products.serverless }} clusters?

Refer to [{{ site.data.products.db }} Regions](regions.html) for the regions where {{ site.data.products.dedicated }} and {{ site.data.products.serverless-plan }} clusters can be deployed. A multi-region Serverless cluster can have a maximum of six regions. To express interest in additional regions, [contact Support](https://support.cockroachlabs.com) or your Cockroach Labs account team.

### How can I estimate how many RUs my workload will consume?

{% include cockroachcloud/serverless-usage.md %}

### How can I reduce the number of RUs my workload consumes?

Make sure your queries have been [optimized for performance](../{{site.current_cloud_version}}/make-queries-fast.html), and follow the [SQL best practices recommendations](../{{site.current_cloud_version}}/performance-best-practices-overview.html).

For example, if your statement uses filters in a `WHERE` clause but you don't have [indexes on the filter columns](../{{site.current_cloud_version}}/schema-design-indexes.html#best-practices), you will consume more RUs because the statement causes a full table scan when doing the join. Use the [`EXPLAIN` statement](../{{site.current_cloud_version}}/explain.html) with your queries to find full table scans or other costly operations. Adding the correct index will result in better performance for the statement, and also consume fewer RUs.

The size of the data in your columns also directly affects RU consumption and query performance. For example, Cockroach Labs recommends [keeping `JSONB` column data under 1 MB](../{{site.current_cloud_version}}/jsonb.html#size) to maximize performance. Statements that read or write large `JSONB` values will consume more RUs as the storage and I/O costs are higher. Adding [GIN indexes](../{{site.current_cloud_version}}/inverted-indexes.html) or [partial GIN indexes](../{{site.current_cloud_version}}/partial-indexes.html#partial-gin-indexes) when querying `JSONB` columns can help improve performance and reduce the RU usage of these statements.

### What can I use {{ site.data.products.serverless }} for?

Free {{ site.data.products.serverless }} clusters can be used for proofs-of-concept, toy programs, or to use while completing [Cockroach University](https://www.cockroachlabs.com/cockroach-university/).

For examples of applications that use free clusters, check out the following [Hack the North](https://hackthenorth.com/) projects:

- [flock](https://devpost.com/software/flock-figure-out-what-film-to-watch-with-friends)
- [mntr.tech](https://devpost.com/software/mntr-tech)
- [curbshop.online](https://devpost.com/software/curbshop-online)

Paid {{ site.data.products.serverless }} clusters include additional resources to maintain higher performance. They are ideal for applications with varying workloads and spikes in traffic.

### How do I connect to my cluster?

To connect to a cluster, download the CA certificate, and then generate a connection string or parameters. You can use this information to connect to your cluster through the CockroachDB SQL client or a PostgreSQL-compatible driver or ORM. For more details, see [Connect to Your {{ site.data.products.serverless }} Cluster](connect-to-a-serverless-cluster.html).

### I created a CockroachCloud Free (beta) cluster before {{ site.data.products.serverless }} was available. Can I still use my cluster?

Yes, your free cluster has been automatically migrated to {{ site.data.products.serverless }}. Your ability to use your cluster should not be affected, and you will now have the option to [add resource limits](serverless-cluster-management.html#edit-your-resource-limits) for your cluster with no downtime.

### Why does my RU usage briefly spike when I'm running a steady workload?

CockroachDB [automatically collects statistics](../{{site.current_cloud_version}}/cost-based-optimizer.html#table-statistics) in a background process when certain conditions are met (for example, when more than 20% of rows in a table are modified). The statistics are used by the cost-based optimizer to tune statements for higher performance.

When automatic statistics collection starts, the cluster will experience a spike in RU usage. You can [disable automatic statistics collection](../{{site.current_cloud_version}}/cost-based-optimizer.html#enable-and-disable-automatic-statistics-collection-for-clusters) to avoid these RU bursts, but this may cause the cost-based optimizer to choose inefficient statement plans based on outdated statistics.

Refreshing the Cloud Console will also consume RUs.

### What is the cold start latency of a {{ site.data.products.serverless }} cluster?

When a {{ site.data.products.serverless }} cluster is idle, it will scale down to zero and consume no RUs. When the cluster becomes active again it will begin serving requests within a fraction of a second, typically around 600 milliseconds. Note that cold starts consume RUs, so you will see a spike in usage.

### Why is disk usage increasing despite lack of writes?

{{ site.data.products.serverless }} clusters regularly store information about their own health and status in system tables. Once these tables hit their retention limit, storage will level off. However, the amount of stored data should be very small in relation to the overall storage limits.

### How do I get the SQL endpoint for a specific region of my multi-region cluster?

This information is not currently available in the {{ site.data.products.db }} Console. The connection string provided in the Console uses a geolocation routing policy to automatically route clients to the nearest region. However, if you need to determine region-specific DNS names, you can do either of the following:

Make an [API request](cloud-api.html) to `GET /api/v1/clusters/{cluster_id}`. The SQL endpoint for each region will be visible in `regions` -> `sql_dns`.

Or, manually create the region-specific DNS names using your cloud provider and the single region names. For example, a GCP Serverless cluster with the DNS name `<routing-id>.h4f.cockroachlabs.cloud` might have the following regional DNS names:

- `<routing-id>.h4f.gcp-us-east1.cockroachlabs.cloud`
- `<routing-id>.h4f.gcp-us-west2.cockroachlabs.cloud`
- `<routing-id>.h4f.gcp-europe-west2.cockroachlabs.cloud`.

## Security

### Is my cluster secure?

Yes, intra-cluster communications are secured using certificates, and all connections to the cluster over the internet use TLS 1.3.

### What certificates do I need to connect to my cluster?

All connections to {{ site.data.products.serverless }} require SSL encryption. When connecting to your cluster using the CockroachDB SQL client or many drivers and ORMs, you don't need to download a root CA certificate and configure your client to use that certificate because the client will connect using the system root CA certificates.

However, some drivers and ORMs don't use the system root CA certificates. In those cases, you need to download a root CA certificate and configure your client to use that certificate to verify the cluster's identity when connecting to it. You can [download the root CA certificate](connect-to-a-serverless-cluster.html?filters=connection-string#connect-to-your-cluster) by following the instructions in the {{ site.data.products.db }} Console. Configure your client to use this certificate (for example, by setting `sslrootcert=<path to the root CA certificate>` in your [connection string](../{{site.current_cloud_version}}/connection-parameters.html#additional-connection-parameters)) and to use SSL (for example, by setting `sslmode=verify-full` in your connection string) to connect to your cluster. We recommend using `sslmode=verify-full` so that your cluster is not vulnerable to man-in-the-middle attacks.

See [Connect to a CockroachDB Cluster](../{{site.current_cloud_version}}/connect-to-the-database.html) for detailed information on connecting to your cluster using CockroachDB supported languages, drivers, and ORMs

### Is encryption-at-rest enabled on {{ site.data.products.serverless }}?

Yes. All data on {{ site.data.products.db }} is encrypted-at-rest using the tools provided by the cloud provider that your cluster is running in.

- Data stored in clusters running in GCP is encrypted-at-rest using [persistent disk encryption](https://cloud.google.com/compute/docs/disks#pd_encryption).
- Data stored in clusters running in AWS is encrypted-at-rest using [EBS encryption](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html).

As noted above, we rely on the cloud provider's encryption implementation. We do not enable CockroachDB's [internal implementation of encryption-at-rest](../{{site.current_cloud_version}}/security-reference/encryption.html#encryption-at-rest-enterprise).

### Is there a public API for {{ site.data.products.db }}?

Yes, see the [Cloud API](cloud-api.html) page for more information. Note that the Cloud API is a [REST interface](https://wikipedia.org/wiki/Representational_state_transfer), and we do not currently support an HTTP data API. We’re always looking for design partners and customer input for our features, so please [contact us](https://support.cockroachlabs.com/hc/en-us) if you have specific API requirements.

### Is my cluster isolated? Does it share resources with any other clusters?

{{ site.data.products.serverless }} is a multi-tenant offering and resources are shared between clusters. For more information, see [{{ site.data.products.serverless }} Architecture](architecture.html).

## Cluster maintenance

### Can I upgrade my free {{ site.data.products.serverless }} cluster's performance?

Yes, you can upgrade your cluster through the Console by [increasing your resource limits](serverless-cluster-management.html#edit-your-resource-limits) and entering [billing information](billing-management.html) if you haven't already.

### Can I upgrade the version of CockroachDB my {{ site.data.products.serverless }} cluster is running on?

No, {{ site.data.products.serverless }} clusters are upgraded automatically for you. You can see what version of CockroachDB your cluster is running in the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud/) or in the [latest release notes](../releases/cloud.html).

## Product features

### Do you have a UI? How can I see details?

Yes, you can view and your clusters in the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud/). However, some [DB Console](../{{site.current_cloud_version}}/ui-overview.html) pages are not currently available for {{ site.data.products.serverless }} clusters.

### Are all CockroachDB features available in {{ site.data.products.serverless }} clusters?

There are some features of CockroachDB that are unsupported or partially supported in {{ site.data.products.serverless }} clusters. Cockroach Labs intends to eliminate these feature gaps in future releases of {{ site.data.products.serverless }}. See [Unsupported Features in CockroachDB Serverless](serverless-unsupported-features.html) for more details.

### Can I run bulk operations such as `IMPORT` and `EXPORT` from my cluster?

Yes, you can [IMPORT](../{{site.versions["stable"]}}/import.html#import-data-into-your-cockroachdb-cloud-cluster) and [EXPORT](../{{site.versions["stable"]}}/export.html#export-data-out-of-cockroachdb-cloud) on {{ site.data.products.serverless }} clusters. You can use a [cloud storage provider](../{{site.current_cloud_version}}/use-cloud-storage.html) or set up a [`userfile`](../{{site.current_cloud_version}}/use-userfile-storage.html) location.

We don't recommend [`userfile`](../{{site.current_cloud_version}}//use-userfile-storage.html) for [`EXPORT`](../{{site.current_cloud_version}}/export.html) operations. You can either use cloud storage or export data to a local CSV file by using [`cockroach sql --execute`](../{{site.current_cloud_version}}/cockroach-sql.html#general). For example:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--url 'postgres://{username}:{password}@{host}:26257?sslmode=verify-full&sslrootcert={path/to/certs_dir}/cc-ca.crt' \
--execute "SELECT * FROM db.table" --format=csv > /Users/{username}/{path/to/file}/table.csv
~~~

### Is change data capture available to me?

Yes, {{ site.data.products.serverless }} clusters have access to both [Core changefeeds](../{{site.current_cloud_version}}/changefeed-examples.html#create-a-core-changefeed) and [Enterprise changefeeds](../{{site.current_cloud_version}}/changefeed-examples.html).

You can run a "sinkless" changefeed to the current SQL session with [`EXPERIMENTAL CHANGEFEED FOR`](../{{site.current_cloud_version}}/changefeed-for.html) or [`CREATE CHANGEFEED`](../{{site.current_cloud_version}}/create-changefeed.html), or you can [run a changefeed to a configurable sink](../{{site.current_cloud_version}}/changefeed-sinks.html).

### Can I backup my {{ site.data.products.serverless }} cluster? Does Cockroach Labs take backups of my cluster?

{{ site.data.products.db }} automatically [runs full backups](use-managed-service-backups.html?filters=serverless) daily for every {{ site.data.products.serverless }} cluster. Full backups are retained for 30 days. {{ site.data.products.db }} does not take incremental backups of {{ site.data.products.serverless }} clusters, or allow database or table level restores from automatic full cluster backups. However, you can also [take manual backups locally](take-and-restore-customer-owned-backups.html#back-up-data) and store them in your cloud storage buckets using the [`BACKUP`](../{{site.current_cloud_version}}/backup.html) statement.

Once a cluster is deleted, Cockroach Labs retains the full backups for 30 days. If an organization is deleted, you will lose access to all of the managed-service backups that Cockroach Labs has taken of the cluster.
