---
title: Frequently Asked Questions
summary:
toc: true
build_for: [managed]
---

## Cluster basics

### Is my cluster secure?

Yes. We create individual sub-accounts and VPCs for all clusters within the cloud provider. These VPCs are firewalled from each other and any other outside connection, unless whitelisted for SQL and Web UI ports. We use `ca.certs` for each cluster and all connections to the cluster over the open internet are TLS 1.2 certified with password authentication.

### Is my cluster isolated? Does it share resources with any other clusters?

Managed CockroachDB is a single-tenant offering and resources are not shared between clusters.

### Why do you need a whitelist of IPs?

The whitelist of IPs prevents anyone with the right password connecting to the SQL or Web UI ports of the managed cluster. The whitelist ensures only recognized connections are able to connect to the cluster.

### How do I connect to my cluster?

We will provide you with a connection string for each region (or one region if its a single region cluster) as well as a global load balancer, a `ca.cert`, and your first database username and password. You can use this information to connect to your cluster.

### What permissions do I have on my cluster?

**[answer]**

### What machines do you run your cluster on?

All our machines run with standard 4 CPUs. See our [Production Checklist](recommended-production-settings.html) for our recommendations for production deployments of CockroachDB.

### How does CockroachDB survive failures?

CockroachDB is designed to survive software and hardware failures, from server restarts to datacenter outages. This is accomplished without confusing artifacts typical of other distributed systems (e.g., stale reads) using strongly-consistent replication as well as automated repair after failures.

**Replication**

CockroachDB replicates your data for availability and guarantees consistency between replicas using the [Raft consensus algorithm](https://raft.github.io/), a popular alternative to [Paxos](http://research.microsoft.com/en-us/um/people/lamport/pubs/paxos-simple.pdf). You can [define the location of replicas](configure-replication-zones.html) in various ways, depending on the types of failures you want to secure against and your network topology. You can locate replicas on:

- Different servers within a rack to tolerate server failures
- Different servers on different racks within a datacenter to tolerate rack power/network failures
- Different servers in different datacenters to tolerate large scale network or power outages

When replicating across datacenters, be aware that the round-trip latency between datacenters will have a direct effect on your database's performance. Latency in cross-continent clusters will be noticeably worse than in clusters where all nodes are geographically close together.

**Automated Repair**

For short-term failures, such as a server restart, CockroachDB uses Raft to continue seamlessly as long as a majority of replicas remain available. Raft makes sure that a new “leader” for each group of replicas is elected if the former leader fails, so that transactions can continue and affected replicas can rejoin their group once they’re back online. For longer-term failures, such as a server/rack going down for an extended period of time or a datacenter outage, CockroachDB automatically rebalances replicas from the missing nodes, using the unaffected replicas as sources. Using capacity information from the gossip network, new locations in the cluster are identified and the missing replicas are re-replicated in a distributed fashion using all available nodes and the aggregate disk and network bandwidth of the cluster.

## Cluster maintenance

### How do I change the configurations on my cluster?

Today, you can reach out to us through [Support]([Support](https://support.cockroachlabs.com/hc/en-us) or your private Slack channel for most cluster changes. In early 2019, you will be able to make changes using a self-service management console.

### How do I add nodes?

To add nodes, you can reach out to us through [Support]([Support](https://support.cockroachlabs.com/hc/en-us) or your private Slack channel to request to add nodes.

### Do you auto-scale?

Today, we do not automatically scale nodes based on your capacity usage. There are plans to allow auto-scaling in the future.

### Who is responsible for backup?

Cockroach Labs will run daily full backups and hourly incremental backups for all of your managed clusters.

## Product features

### Are enterprise features like partitioning or change data capture available to me?

Yes, the managed clusters run the enterprise version of CockroachDB and all enterprise features are available to you. We encourage you to work with our Sales Engineering team to set up [partitioning](partitioning.html), [change data capture](change-data-capture.html) and other advanced features, as we have best practices and reference architectures we would be happy to share with you.

## Cluster troubleshooting

### What do I do if my queries are too slow?

To optimize schema design to achieve your performance goals, we recommend working with our Sales Engineering team before you set up your cluster. You can also reach out to us through [Support](https://support.cockroachlabs.com/hc/en-us) or your private Slack channel.

### Can I use my startup cloud credits?

Today, we do not support cloud credits you may have in your account, as we run the clusters in our own accounts.

### Can you run my CockroachDB cluster on-premise?

Today, we do not have an offering that manages running CockroachDB on customer premises. In the future, we expect to have a private cloud offering that will allow you to run multiple CockroachDB clusters on your premises using the same tools that we use internally for our managed offering.

### Do you have a private cloud offering?

[See above.](#can-you-run-my-cockroachdb-cluster-on-premise)

### Can I see a demo?

Yes, [contact us](https://support.cockroachlabs.com/hc/en-us) and we’d be happy to show you a demo of our managed CockroachDB offering.

### Do you have a UI? How can I see details?

In early 2019, there will be a self-service management console where you can connect to your cluster, view details of your cluster, and make changes to your existing cluster.

## Pricing

### How does pricing work when I need to add nodes?

Today, to add nodes or regions, request the modification through [Support](https://support.cockroachlabs.com/hc/en-us) or your private Slack channel. Our Sales team will work with you to update your cluster configurations. We expect this to be self-service next year.
