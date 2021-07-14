---
title: CockroachCloud Architecture
summary: Learn more about CockroachCloud architecture
toc: true
---

CockroachCloud is a fully-managed deployment of CockroachDB. This page describes CockroachCloud's architecture and how it relates to CockroachDB.

## Architecture Overview

CockroachCloud clusters come in two types: Serverless and Dedicated.

## CockroachCloud Serverless

CockroachCloud Serverless (beta) is a fully-managed, multi-tenant deployment of CockroachDB. All CockroachCloud Serverless (beta) clusters share resources, however, SQL pods are not shared--only the KV layer is shared.

Serverless clusters scale based on the application load they are serving. Paid clusters can scale up to the amount of resources being paid for, and free clusters can scale up to 100M Request Units and 5GB of storage.

Depending on your workload, your budget will be used differently. For example, a cluster using very little storage space will have more of its budget available for Request Units, and vice versa. If you hit your budget, your cluster will be throttled down to free-tier performance levels. In this case, you can increase your budget or adjust your workload to stay within budget.

CockroachCloud Serverless (beta) clusters have the ability to scale to zero and consume no resources when there are no active queries. When there are no active queries, you will pay for storage your app is using, but not for Request Units. To avoid wasted resources, CockroachCloud automatically pauses free clusters that are inactive, which is defined by having no connection to the cluster for 2 consecutive minutes. Once the user attempts to reconnect to the cluster, the cluster will automatically resume. Pausing, resuming, and scaling  clusters is a fully-managed process and will not disrupt or affect the user experience.

All data in CockroachCloud Serverless (beta) is automatically replicated three times and distributed across Availability Zones to survive outages. Currently, you can pick the region your cluster is deployed in. In the future, CockroachCloud Serverless (beta) will have multi-region capabilities.

## CockroachCloud Dedicated

CockroachDB Serverless may not be right for enterprises that have rigorous security requirements due to its multi-tenant architecture. For those use cases we recommend CockroachDB Dedicated.

### Single region

All CockroachCloud clusters use 3 Availability Zones (AZs). For balanced data distribution and best performance, we recommend using a number of nodes that is a multiple of 3 (e.g., 3, 6, or 9 nodes per region).

### Multi-region

- Multi-region clusters must contain at least 3 regions to ensure that data replicated across regions can survive the loss of one region. For example, this applies to internal system data that is important for overall cluster operations as well as tables with the [`GLOBAL`](../{{site.versions["stable"]}}/global-tables.html) table locality or the [`REGIONAL BY TABLE`](../{{site.versions["stable"]}}/regional-tables.html#regional-tables) table locality and [`REGION` survival goal](../{{site.versions["stable"]}}/multiregion-overview.html#surviving-region-failures). 
-  Each region of a multi-region cluster must contain at least 3 nodes to ensure that data located entirely in a region can survive the loss of one node in that region. For example, this applies to tables with the [`REGIONAL BY ROW`](../{{site.versions["stable"]}}/regional-tables.html#regional-by-row-tables) table locality. 
- You can have a maximum of 9 regions per cluster through the Console. If you need to add more regions, [contact us](https://support.cockroachlabs.com).

## CockroachDB architecture

See the [CockroachDB architecture](../{{site.versions["stable"]}}/architecture/overview.html) documentation for more information.