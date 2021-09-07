---
title: CockroachCloud Architecture
summary: Learn more about CockroachCloud architecture
toc: true
---

CockroachCloud is a fully-managed deployment of CockroachDB. This page describes CockroachCloud's architecture and how it relates to CockroachDB.

<div class="filters clearfix">
  <button class="filter-button" data-scope="serverless">CockroachCloud Serverless </button>
  <button class="filter-button" data-scope="dedicated">CockroachCloud Dedicated</button>
</div>

<section class="filter-content" markdown="1" data-scope="serverless">

## CockroachCloud Serverless

CockroachCloud Serverless (beta) is a fully-managed, auto-scaling deployment of CockroachDB. Being familiar with the following concepts will help you understand what our Serverless architecture achieves.

### Concepts

Term | Definition
-----|-----------
**Serverless cluster** | A cluster that’s automatically billed and scaled in response to the resources it consumes (as opposed to a dedicated cluster, which is billed and scaled statically).
**Request Unit (RU)** | Request Units represent the compute and I/O resources used by a query. All database operations in CockroachCloud Serverless cost a certain amount of RUs depending on the resources used. For example, a "small read" might cost 1 RU, and a "large read" such as a full table scan with indexes could cost 100 RUs. You can see how many Request Units your cluster has used on the [**Cluster Overview**](serverless-cluster-management.html#view-cluster-overview) page.
**Spend limit** | The maximum amount of money you indicate you want to be billed in a particular billing period for a cluster. The actual amount you are billed is based on the resources used during that billing period. A cluster's budget is allocated across storage and burst performance.
**Projected usage** | The amount of usage that Cockroach Labs projects a cluster will consume during a billing period. This is important for setting a cluster’s spend limit, because we always reserve enough budget to pay for storage for the rest of the billing period.
**Baseline performance** | The minimum compute and I/O performance that you can expect from your cluster at all times. This is 100 RUs per second for all Serverless clusters (free and paid). The actual usage of a cluster may be lower than the baseline performance depending on application traffic, because not every application will need 100 RU/s at all times. 
**Burst capacity** | Burst capacity is the ability of the Serverless cluster to perform above the baseline. Supporting application traffic that “bursts,” i.e., can fluctuate above baseline traffic, is a key feature of Serverless clusters. Every Serverless cluster starts with a certain amount of burst capacity. If the actual usage of a cluster is lower than the baseline performance, the cluster can “store up” Request Units that can be used for burst capacity for the rest of the month. 
**Storage** | Disk space for permanently storing data over time. All data in CockroachCloud Serverless (beta) is automatically replicated three times and distributed across Availability Zones to survive outages. Storage is measured in units of GiB-months, which is the amount of data stored multiplied by how long it was stored. Storing 10 GiB for a month and storing 1 GiB for 10 months are both 10 GiB-months. The storage you see in the [Cluster Overview](serverless-cluster-management.html#view-cluster-overview) page is the amount of data before considering the replication multiplier.

### Performance 

Serverless clusters scale based on your application's workload. Free clusters include 250M RUs with 10M RUs reserved for [burst performance](#concepts) and 5GiB of storage per month. They have a guaranteed baseline performance of 100 RUs per second, or up to 100 QPS. If you set a spend limit for your cluster, you will have access to additional resources without throttling.

Depending on your workload, your budget will be used differently. For example, a cluster using very little storage space will have more of its budget available for Request Units, and vice versa. If you hit your spend limit, your cluster will be throttled down to baseline performance levels. If this occurs, you can opt to increase your spend limit, adjust your workload to stay within the current spend limit, or stay at the baseline performance level until the next month.

Storage always gets first priority in the budget since you need to be able to store the data first and foremost. The remainder of the budget is allocated to burst performance. You can theoretically reach your spend limit for burst performance in the first few minutes of a cluster being created. If this happens, the cluster will be throttled back to the baseline performance and can reaccumulate burst capacity by using fewer RUs.

Serverless clusters also have the ability to scale to zero and consume no resources when there are no active queries. When there are no active queries, you will pay for the storage your app is using, but not for Request Units. To avoid wasted resources, CockroachCloud automatically pauses Serverless clusters that are inactive, which is defined by having no connection to the cluster for two consecutive minutes. Once the user attempts to reconnect to the cluster, the cluster will automatically resume. Pausing, resuming, and scaling clusters is a fully-managed process and will not disrupt or affect the user experience. However, it is important for your application to have connection retry logic in the event of node restarts or network disruptions. For more information, see the [Production Checklist](production-checklist.html).

### Architecture

Traffic comes in from the public internet and is routed by the cloud provider’s load balancer to a Kubernetes cluster that hosts CockroachDB. However, unlike a self-hosted CockroachDB cluster where the SQL and KV layers run in the same process, our serverless architecture fully decouples the SQL layer from the KV layer so that both layers run in separate processes running in separate Kubernetes pods.

<img src="{{ 'images/cockroachcloud/serverless-diagram.jpeg' | relative_url }}" alt="Serverless architecture" style="max-width:100%" />

</section>

<section class="filter-content" markdown="1" data-scope="dedicated">

## CockroachCloud Dedicated

If you need a single-tenant cluster with no shared resources, we recommend CockroachCloud Dedicated. CockroachCloud Dedicated supports single and multi-region clusters in Amazon Web Services and Google Cloud Platform.

### Hardware

We use the Kubernetes offerings in AWS and GCP (EKS and GKE respectively) to run CockroachCloud offerings. GCP clusters use [N1 standard](https://cloud.google.com/compute/docs/machine-types#n1_machine_types) machine types and [Persistent Disk storage](https://cloud.google.com/compute/docs/disks#pdspecs). AWS clusters use [M5 instance types](https://aws.amazon.com/ec2/instance-types/m5/#Product_Details) and [Elastic Block Store (EBS)](https://aws.amazon.com/ebs/features/). Each single region cluster has a minimum of three nodes spread across three availability zones (AZ) in a cloud provider region. Multi-region clusters are similar to single-region clusters, with nodes spread across three or more AZs in each region.

### Security and Connection

CockroachCloud Dedicated clusters are single-tenant. This means each new cluster gets its own project in GCP or its own account in AWS. No two Dedicated clusters share any resources with each other. Since these clusters are within their own accounts and projects, they are also in a default virtual private cloud (VPC). Users connect to a Dedicated cluster by using a load balancer in front of each region which leads to one connection string per region. Unless you set up [VPC peering](network-authorization.html#vpc-peering) or [AWS PrivateLink](network-authorization.html#aws-privatelink), your cluster will use TLS 1.2 protocol for encrypting inter-node and client-node communication.

CockroachCloud clusters also use digital certificates for inter-node authentication, [SSL modes](authentication.html#ssl-mode-settings) for node identity verification, and password authentication for client identity verification. See [Authentication](authentication.html) for more details.

[Backups](backups-page.html) are encrypted in S3 and GCS buckets using the cloud provider keys. 

### Multi-region architecture

<img src="{{ 'images/cockroachcloud/multiregion-diagram.png' | relative_url }}" alt="Multi-region architecture" style="max-width:100%" />

</section>

## Learn more

See the [CockroachDB architecture](../{{site.versions["stable"]}}/architecture/overview.html) documentation for more information.