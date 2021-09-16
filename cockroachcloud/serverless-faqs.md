---
title: CockroachCloud Serverless (beta) FAQs
summary: Get answers to frequently asked questions about CockroachCloud Serverless (beta)
toc: true
---

This page answers the frequently asked questions about {{ site.data.products.serverless }} and {{ site.data.products.dedicated }}.

<div class="filters clearfix">
    <a href="serverless-faqs.html"><button class="filter-button page-level current">{{ site.data.products.serverless }}</button></a>
    <a href="frequently-asked-questions.html"><button class="filter-button page-level">{{ site.data.products.dedicated }}</button></a>
</div>

## General

### What is {{ site.data.products.serverless }}?

{{ site.data.products.serverless }} delivers free and paid CockroachDB clusters for you and your organization. It is a managed instance of CockroachDB that lets you start using your database immediately and auto-scales based on your application traffic.

### How do I start using {{ site.data.products.serverless }}?

To get started with {{ site.data.products.serverless }}, <a href="https://cockroachlabs.cloud/signup?referralId=docs_serverless_faq" rel="noopener" target="_blank">sign up for a {{ site.data.products.db }} account</a>, click **Create Cluster**, then click **Create your free cluster**. Your cluster will be ready in 20-30 seconds. For more information, see [**Quickstart**](quickstart.html).

### What are the usage limits of {{ site.data.products.serverless }}?

Free clusters have a limit of 250M Request Units per month and 5GB of storage. Paid clusters have access to the same resources with no limitations in addition to the amount you pay for.

### What is a Request Unit?

All resource usage in {{ site.data.products.serverless }} is measured in Request Units, or RUs. RUs represent the compute and I/O resources used by a query. All database operations cost a certain amount of RUs depending on the resources used. For example, a "small read" might cost 1 RU, and a "large read" such as a full table scan with indexes might cost 100 RUs.

### Do I have to pay for {{ site.data.products.serverless }}?

No, you can create a Serverless cluster that is free forever. If you choose to set a spend limit for your cluster, you will only be charged for the resources you use up to your spend limit.

### What can I use {{ site.data.products.serverless }} for?

Free {{ site.data.products.serverless }} clusters can be used for proofs-of-concept, toy programs, or to use while completing [Cockroach University](https://www.cockroachlabs.com/cockroach-university/).

For examples of applications that use free clusters, check out the following [Hack the North](https://hackthenorth.com/) projects:

- [flock](https://devpost.com/software/flock-figure-out-what-film-to-watch-with-friends)
- [mntr.tech](https://devpost.com/software/mntr-tech)
- [curbshop.online](https://devpost.com/software/curbshop-online)

Paid Serverless clusters include additional resources with no throttling. They can be used for all kinds of production applications.

### How do I connect to my cluster?

To connect to a cluster, download the CA certificate, and then generate a connection string or parameters. You can use this information to connect to your cluster through the CockroachDB SQL client or a Postgres-compatible driver or ORM. For more details, see [Connect to Your {{ site.data.products.serverless }} Cluster](connect-to-a-serverless-cluster.html).

## Beta release

### Where can I submit feedback or bugs on the beta?

You can submit feedback or log any bugs you find through [this survey](https://forms.gle/jWNgmCFtF4y15ePw5).

## Security

### Is my cluster secure?

Yes, we use separate certificate authorities for each cluster, and all connections to the cluster over the internet use TLS 1.2.

### Is encryption-at-rest enabled on {{ site.data.products.serverless }}?

Yes. All data on {{ site.data.products.db }} is encrypted-at-rest using the tools provided by the cloud provider that your cluster is running in.

- Data stored in clusters running in GCP are encrypted-at-rest using [persistent disk encryption](https://cloud.google.com/compute/docs/disks#pd_encryption).
- Data stored in clusters running in AWS are encrypted-at-rest using [EBS encryption-at-rest](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html).

Because we are relying on the cloud provider's encryption implementation (as noted above), we do not enable CockroachDB's [internal implementation of encryption-at-rest](../{{site.versions["stable"]}}/encryption.html#encryption-at-rest-enterprise). This means that encryption will appear to be disabled in the [DB Console](../{{site.versions["stable"]}}/ui-overview.html), since it is unaware of cloud provider encryption.

### Is my cluster isolated? Does it share resources with any other clusters?

{{ site.data.products.serverless }} is a multi-tenant offering and resources are shared between clusters.

## Cluster maintenance

### Can I upgrade my free {{ site.data.products.serverless }} cluster?

Yes, you can upgrade your cluster through the Console by [increasing your spend limit](serverless-cluster-management.html#edit-your-spend-limit) and entering [billing information](console-access-management.html#manage-billing-for-the-organization) if you haven't already.

## Product features

### Do you have a UI? How can I see details?

Yes, you can view and your clusters in the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud/). However, some [DB Console](../{{site.versions["stable"]}}/ui-overview.html) pages are not currently available for {{ site.data.products.serverless }} clusters.

### Can I run bulk operations such as `IMPORT` and `EXPORT` from my cluster?

Yes, see [Run Bulk Operations](run-bulk-operations.html) for more information. If you don't have billing information on file for your Organization, [`userfile`](../{{site.versions["stable"]}}/use-userfile-for-bulk-operations.html) is the only available storage options for bulk operations. Once you enter billing information, even if you don't set a spend limit, you will have access to [cloud storage](../{{site.versions["stable"]}}/use-cloud-storage-for-bulk-operations.html).

### Is change data capture available to me?

Yes, {{ site.data.products.serverless-plan }} clusters have access to [Core Changefeeds](run-bulk-operations.html#stream-data-out-of-your-cockroachcloud-cluster).

### Can I backup my {{ site.data.products.serverless }} cluster? Does Cockroach Labs take backups of my cluster?

Cockroach Labs takes full cluster backups of all {{ site.data.products.serverless }} clusters for our own purposes. If you don't have [billing information on file](console-access-management.html#manage-billing-for-the-organization) for your Organization, you can [take backups locally](run-bulk-operations.html#backup-and-restore-data) to `userfile`. Once you enter billing information, even if you don't set a spend limit, you can also [backup to cloud storage](run-bulk-operations.html#backup-and-restore-data).
