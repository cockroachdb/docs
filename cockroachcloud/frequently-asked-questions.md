---
title: Frequently Asked Questions
summary: CockroachCloud FAQs
toc: true
redirect_from:
- ../stable/cockroachcloud-frequently-asked-questions.html
---

This page answers the frequently asked questions.

## Cluster basics

### Is my cluster secure?

Yes. We create individual sub-accounts and VPCs for each cluster within the cloud provider. These VPCs are firewalled from each other and any other outside connection, unless allowlisted for SQL and Web UI ports.

The allowlist is comprised of IP addresses that you provide to us, and is an additional layer of protection for your cluster. Connections will only be accepted if they come from an allowlisted IP address, which protects against both compromised passwords and any potential bugs in the server.

We use separate certificate authorities for each cluster, and all connections to the cluster over the internet use TLS 1.2.

## Is encryption-at-rest enabled on CockroachCloud?

Yes. All data on CockroachCloud is encrypted-at-rest using the tools provided by the cloud provider that your cluster is running in. However, we do not enable encryption-at-rest within CockroachDB by default, so encryption will appear to be disabled in the [DB Console](../stable/ui-overview.html) since it is unaware of cloud provider encryption.

### Is my cluster isolated? Does it share resources with any other clusters?

CockroachCloud is a single-tenant offering and resources are not shared between clusters.

### Why can't I use certain regions in AWS and  GCP?

We run CockroachCloud in EKS and GKE - the managed Kubernetes offerings for AWS and GCP respectively - and support all regions that the offerings are available in. If a particular region is not available on the CockroachCloud console, that is due to the cloud provider not supporting the managed Kubernetes offering in that region. See
[list of EKS regions](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/) and [list of GKE regions](https://cloud.google.com/about/locations/) for details.

**Known issue:** In addition to the non-GKE regions, we had to temporarily disable the following 4 GCP regions due to technical limitations that we are actively trying to resolve:

- `asia-northeast2`
- `europe-north1`
- `europe-west3`
- `europe-west6`

### How do CockroachCloud free trials work?

CockroachCloud offers a 30-day free trial. Free trials require a credit card so we can validate that you are not a bot and provide a seamless transition into production. Free trials apply when you:

- Create the first cluster in your organization
- Select 4 or fewer nodes (we recommend starting with 3 so you can try scaling)
- Don't remove the pre-applied trial code at check out

Once the 30-day period is over, your trial cluster can be scaled beyond 4 nodes. You can create other paid clusters at any time. If Cockroach Labs has provided you with additional codes, you can use those on applicable clusters. For extended trial options, [contact us](https://www.cockroachlabs.com/contact-sales/).

### How do I connect to my cluster?

To connect to a cluster, you need to authorize your network, create a SQL user, download the CA certificate, and then generate a connection string or parameters. You can use this information to connect to your cluster through the CockroachDB SQL client or a Postgres-compatible driver or ORM. For more details, see [Connect to Your CockroachCloud Cluster](connect-to-your-cluster.html).

## Cluster maintenance

### How do I change the configurations on my cluster?

Contact [Support](https://support.cockroachlabs.com/hc/en-us) to change your cluster configuration.

### How do I add nodes?

To request to add nodes, you can contact [Support](https://support.cockroachlabs.com/hc/en-us). Our team will work with you to update your cluster configurations. We expect this to be self-service next year.

### Do you auto-scale?

Today, we do not automatically scale nodes based on your capacity usage. To add nodes, please contact [Support](https://support.cockroachlabs.com/hc/en-us). There are plans to allow auto-scaling in the future.

### Who is responsible for backup?

Cockroach Labs runs full backups daily and incremental backups hourly for every CockroachCloud cluster. The full backups are retained for 30 days and incremental backups for 7 days.

The backups for AWS clusters are encrypted using [AWS S3’s server-side encryption](https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingServerSideEncryption.html) and the backups for GCP clusters are encrypted using [Google-managed server-side encryption keys](https://cloud.google.com/storage/docs/encryption/default-keys).

{{site.data.alerts.callout_info}}
All databases are not backed up at the same time. Each database is backed up every hour based on the time of creation. For larger databases, you might see an hourly CPU spike while the database is being backed up.
{{site.data.alerts.end}}

To restore your data, [contact us](https://support.cockroachlabs.com).

Additionally, you can [backup and restore](../stable/backup-and-restore.html) data on your own.

### Can I restore my self-hosted CockroachDB cluster to CockroachCloud?

Yes. You can [backup](../stable/backup.html) your self-hosted CockroachDB databases to an [external location](../v20.1/backup.html#backup-file-urls) and then [restore](../stable/restore.html) to your CockroachCloud cluster.

{{site.data.alerts.callout_danger}}
If you are backing up the data to AWS or GCP, use the `specified` option for the `AUTH` parameter.
{{site.data.alerts.end}}

## Product features

### Are enterprise features like partitioning or change data capture available to me?

Yes, CockroachCloud clusters run the enterprise version of CockroachDB and all enterprise features are available to you. We encourage you to [contact Support](https://support.cockroachlabs.com/hc/en-us) to set up [partitioning](../stable/partitioning.html), [change data capture](../stable/change-data-capture.html), and other advanced features, as we have best practices and reference architectures we would be happy to share with you.

## Cluster troubleshooting

### What do I do if my queries are too slow?

To optimize schema design to achieve your performance goals, we recommend working with our Sales Engineering team before you set up your cluster. You can also read our [SQL Performance Best Practices](../stable/performance-best-practices-overview.html) and [Performance Tuning](../stable/performance-tuning.html) docs for more information.

If you need additional help, contact [Support](https://support.cockroachlabs.com/hc/en-us).

### Can you run my CockroachDB cluster on-premise?

Today, we do not have an offering that manages running CockroachDB on customer premises. In the future, we expect to have a private cloud offering that will allow you to run multiple CockroachDB clusters on your premises using the same tools that we use internally for our CockroachCloud offering.

### Do you have a private cloud offering?

[See above.](#can-you-run-my-cockroachdb-cluster-on-premise)

### Can I see a demo?

Yes, [contact us](https://support.cockroachlabs.com/hc/en-us) and we’d be happy to show you a demo of our CockroachCloud offering.

### Do you have a UI? How can I see details?

All customers of our CockroachCloud service can view and manage their clusters in the [Console](https://cockroachlabs.cloud/).
