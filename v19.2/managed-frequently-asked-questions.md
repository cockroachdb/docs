---
title: Frequently Asked Questions
summary: Managed CockroachDB FAQs
toc: true
build_for: [managed]
---

## Cluster basics

### Is my cluster secure?

Yes. We create individual sub-accounts and VPCs for each cluster within the cloud provider. These VPCs are firewalled from each other and any other outside connection, unless whitelisted for SQL and Web UI ports.

The whitelist is comprised of IP addresses that you provide to us, and is an additional layer of protection for your cluster. Connections will only be accepted if they come from a whitelisted IP address, which protects against both compromised passwords and any potential bugs in the server.

We use separate certificate authorities for each cluster, and all connections to the cluster over the internet use TLS 1.2.

### Is my cluster isolated? Does it share resources with any other clusters?

Managed CockroachDB is a single-tenant offering and resources are not shared between clusters.

### How do I connect to my cluster?

You can generate a connection string for each region (or one region if its a single region cluster) as well as a global load balancer, a CA certificate, and your database username and password. You can use this information to connect to your cluster through the CockroachDB SQL client or a Postgres-compatible driver or ORM. For more details, see [Connect to Your Managed Cluster](managed-connect-to-your-cluster.html).

### What machines do you run your cluster on?

Our machines run with 4 CPUs, 8 CPUs, or 16 CPUs per node.

Based on your cluster requirements (e.g., number of CPUs, GBs of storage, and regions) and budget, we will determine the optimal setup for your cluster.

## Cluster maintenance

### How do I change the configurations on my cluster?

Today, you can contact [Support](https://support.cockroachlabs.com/hc/en-us) for most cluster changes. In early 2019, you will be able to make changes using a self-service management console.

### How do I add nodes?

To request to add nodes, you can contact [Support](https://support.cockroachlabs.com/hc/en-us). Our team will work with you to update your cluster configurations. We expect this to be self-service next year.

### Do you auto-scale?

Today, we do not automatically scale nodes based on your capacity usage. To add nodes, please contact [Support](https://support.cockroachlabs.com/hc/en-us). There are plans to allow auto-scaling in the future.

### Who is responsible for backup?

Cockroach Labs will run daily full backups and hourly incremental backups for all of your managed clusters.

## Product features

### Are enterprise features like partitioning or change data capture available to me?

Yes, managed clusters run the enterprise version of CockroachDB and all enterprise features are available to you. We encourage you to work with our Sales Engineering team to set up [partitioning](partitioning.html), [change data capture](change-data-capture.html), and other advanced features, as we have best practices and reference architectures we would be happy to share with you.

## Cluster troubleshooting

### What do I do if my queries are too slow?

To optimize schema design to achieve your performance goals, we recommend working with our Sales Engineering team before you set up your cluster. You can also read our [SQL Performance Best Practices](performance-best-practices-overview.html) and [Performance Tuning](performance-tuning.html) docs for more information.

If you need additional help, contact [Support](https://support.cockroachlabs.com/hc/en-us).

### Can I use my startup cloud credits?

Today, we do not support cloud credits you may have in your account, as we run the clusters in our own accounts.

### Can you run my CockroachDB cluster on-premise?

Today, we do not have an offering that manages running CockroachDB on customer premises. In the future, we expect to have a private cloud offering that will allow you to run multiple CockroachDB clusters on your premises using the same tools that we use internally for our managed offering.

### Do you have a private cloud offering?

[See above.](#can-you-run-my-cockroachdb-cluster-on-premise)

### Can I see a demo?

Yes, [contact us](https://support.cockroachlabs.com/hc/en-us) and we’d be happy to show you a demo of our managed CockroachDB offering.

### Do you have a UI? How can I see details?

All customers of our managed service can view their clusters in the [Console](https://cockroachlabs.cloud/).
