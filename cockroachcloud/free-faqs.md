---
title: Frequently Asked Questions
summary: Get answers to frequently asked questions about CockroachCloud Free (beta)
toc: true
redirect_from:
- ../stable/cockroachcloud-frequently-asked-questions.html
---

This page answers the frequently asked questions about CockroachCloud Free (beta). For answers to frequently asked questions about the paid version of CockroachCloud, see [CockroachCloud FAQs](frequently-asked-questions.html).

## General

### What is CockroachCloud Free?

CockroachCloud Free delivers free CockroachDB clusters for you and your organization. It is a managed instance of CockroachDB that also removes the friction of initial cluster sizing and auto-scales based on your application traffic. While we have eliminated the concept of nodes for you, there will be an upper limit of usage of up to 1 vCPU and 5GB storage per free cluster.

### Do I have to pay for CockroachCloud Free?

CockroachCloud Free is free forever.

### What can I use CockroachCloud Free for?

CockroachCloud Free can be used for proofs-of-concept, toy programs, or to use while completing [Cockroach University](https://www.cockroachlabs.com/cockroach-university/).

For examples of applications that use CockroachCloud Free, check out the following [Hack the North](https://hackthenorth.com/) projects:

- [flock](https://devpost.com/software/flock-figure-out-what-film-to-watch-with-friends)
- [mntr.tech](https://devpost.com/software/mntr-tech)
- [curbshop.online](https://devpost.com/software/curbshop-online)

### What are the limitations of CockroachCloud Free?

CockroachCloud Free is currently in beta and as such, it is not suitable for heavy production use. Specifically, there are capabilities we are still working on enabling, such as the ability to enable backups, to import data, and no-downtime upgrades to a paid tier. If you want to use any of these capabilities, try a [30-day trial of CockroachCloud](quickstart-trial-cluster.html).

### Can I use a specific region in AWS or GCP?

At this time, CockroachCloud Free is only available in the GCP `us-central-1` region.

### How do I connect to my cluster?

To connect to a cluster, download the CA certificate, and then generate a connection string or parameters. You can use this information to connect to your cluster through the CockroachDB SQL client or a Postgres-compatible driver or ORM. For more details, see [Connect to Your CockroachCloud Cluster](connect-to-your-cluster.html).

## Beta release

### Why is CockroachCloud Free in beta?

CockroachCloud Free is in beta while we work on adding core features like [import](../v20.2/import.html) and [backups](backups-page.html).

### Where can I submit feedback or bugs on the beta?

You can submit feedback or log any bugs you find through [this survey](https://cockroachlabs.typeform.com/to/gvCcF14q).

## Security

### Is my cluster secure?

Yes. We create individual sub-accounts and VPCs for each cluster within the cloud provider. These VPCs are firewalled from each other and any other outside connection, unless allowlisted for SQL and Web UI ports.

The allowlist is comprised of IP addresses that you provide to us, and is an additional layer of protection for your cluster. Connections will only be accepted if they come from an allowlisted IP address, which protects against both compromised passwords and any potential bugs in the server.

We use separate certificate authorities for each cluster, and all connections to the cluster over the internet use TLS 1.2.

### Is encryption-at-rest enabled on CockroachCloud Free?

Yes. All data on CockroachCloud is encrypted-at-rest using the tools provided by the cloud provider that your cluster is running in.

- Data stored in clusters running in GCP are encrypted-at-rest using [persistent disk encryption](https://cloud.google.com/compute/docs/disks#pd_encryption).
- Data stored in clusters running in AWS are encrypted-at-rest using [EBS encryption-at-rest](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html).

Because we are relying on the cloud provider's encryption implementation (as noted above), we do not enable CockroachDB's [internal implementation of encryption-at-rest](../v20.2/encryption.html#encryption-at-rest-enterprise). This means that encryption will appear to be disabled in the [DB Console](../v20.2/ui-overview.html), since it is unaware of cloud provider encryption.

### Is my cluster isolated? Does it share resources with any other clusters?

CockroachCloud Free is a multi-tenant offering and resources are shared between clusters.

## Cluster maintenance

### How do I add nodes?

We have eliminated the concept of nodes for CockroachCloud Free. However, there is an upper limit of usage of up to 1 vCPU and 5GB storage per free cluster. If you exceed this limit, you can create a cluster using the paid version of [CockroachCloud](create-your-cluster.html).

### Can I upgrade my cluster from CockroachCloud Free to the paid version of CockroachCloud?

At this time, a CockroachCloud Free cluster cannot be upgraded. In the future, you will have the ability to move from CockroachCloud Free to a paid version of CockroachCloud.

### Who is responsible for backups? Can I backup my cluster?

Currently, backups are not supported on CockroachCloud Free. The ability to enable backups will be supported in the future.

## Product features

### Are enterprise features like partitioning or change data capture available to me?

At this time, change data capture and partitioning are not available on CockroachCloud Free clusters, but will be in the future.

### Do you have a UI? How can I see details?

All customers of our CockroachCloud service can view and manage their clusters in the [Console](https://cockroachlabs.cloud/).

### Can I backup my CockroachCloud Free cluster? Does Cockroach Labs take backups of my cluster?

Cockroach Labs takes full cluster backups of all CockroachCloud Free clusters for our own purposes. Currently, these backups are not available to you and you cannot backup and restore a CC Free cluster yourself. We expect to support user initiated backup and restore of free clusters in the future.

In the meantime, you can run a [`SELECT`](../v20.2/select.html) statement using the [`--format=csv` flag](../v20.2/cockroach-sql.html#general) to print the output into a file. For example:

{% include copy-clipboard.html %}
~~~
$ cockroach sql -e 'SELECT * FROM test_database.table1' --format=csv --url='postgres://username:password@free-tier...' > users.txt
~~~
