---
title: CockroachDB Cloud Architecture
summary: Learn more about CockroachDB Cloud architecture
toc: true
---

{{ site.data.products.db }} is a fully-managed deployment of CockroachDB. This page describes {{ site.data.products.db }}'s architecture and how it relates to CockroachDB.

<div class="filters clearfix">
  <button class="filter-button" data-scope="serverless">{{ site.data.products.serverless-plan }}</button>
  <button class="filter-button" data-scope="dedicated">{{ site.data.products.dedicated }}</button>
</div>

<section class="filter-content" markdown="1" data-scope="serverless">

## {{ site.data.products.serverless-plan }}

{{ site.data.products.serverless }} is a fully-managed, auto-scaling deployment of CockroachDB. Being familiar with the following concepts will help you understand what our Serverless architecture achieves.

### Concepts

Term | Definition
-----|-----------
**Serverless cluster** | A cluster that’s automatically billed and scaled in response to the resources it consumes (as opposed to a Dedicated cluster, which is billed for resources provisioned).
**Request Unit (RU)** | Request Units represent the compute and I/O resources used by a query. All database operations in {{ site.data.products.serverless-plan }} cost a certain amount of RUs depending on the resources used. For example, a "small read" might cost 2 RUs, and a "large read" such as a full table scan with indexes could cost a large number RUs. You can see how many Request Units your cluster has used on the [**Cluster Overview**](serverless-cluster-management.html#view-cluster-overview) page.
**Spend limit** | The maximum amount of money you indicate you want to be billed in a particular billing period for a cluster. The actual amount you are billed is based on the resources used during that billing period. A cluster's budget is allocated across storage and burst performance.
**Projected usage** | The amount of usage that Cockroach Labs projects a cluster will consume during a billing period. This is important for setting a cluster’s spend limit, because we always reserve enough budget to pay for storage for the rest of the billing period.
**Baseline performance** | The minimum compute and I/O performance that you can expect from your cluster at all times. This is 100 RUs per second for all Serverless clusters (free and paid). The actual usage of a cluster may be lower than the baseline performance depending on application traffic, because not every application will need 100 RU/s at all times. 
**Burst capacity** | Burst capacity is the ability of the Serverless cluster to perform above the baseline. Supporting application traffic that “bursts,” i.e., can fluctuate above baseline traffic, is a key feature of Serverless clusters. Every Serverless cluster starts with a certain amount of burst capacity. If the actual usage of a cluster is lower than the baseline performance, the cluster can accrue Request Units that can be used for burst capacity for the rest of the month. 
**Storage** | Disk space for permanently storing data over time. All data in {{ site.data.products.serverless }} is automatically replicated three times and distributed across Availability Zones to survive outages. Storage is measured in units of GiB-months, which is the amount of data stored multiplied by how long it was stored. Storing 10 GiB for a month and storing 1 GiB for 10 months are both 10 GiB-months. The storage you see in the [Cluster Overview](serverless-cluster-management.html#view-cluster-overview) page is the amount of data before considering the replication multiplier.

### Architecture

Traffic comes in from the public internet and is routed by the cloud provider’s load balancer to a Kubernetes (K8s) cluster that hosts CockroachDB. Each node runs in its own K8s pod, which allows {{ site.data.products.serverless }} to limit SQL resource consumption for each tenant. It also minimizes interference between pods that are scheduled on the same machine, giving each tenant a high-quality experience even when other tenants are running heavy workloads.

The following diagram is a high-level representation of what a typical Serverless cluster looks like:

<img src="{{ 'images/cockroachcloud/serverless-diagram.png' | relative_url }}" alt="Serverless architecture" style="max-width:100%" />

Proxy pods allow many tenants to share the same IP address, balance loads across a tenant’s available SQL pods, and automatically resume tenant clusters that have been paused due to inactivity. They also detect and respond to suspected abuse of the service.

After the cloud load balancer routes a new connection to one of the proxy pods, the proxy pod will in turn forward that connection to a SQL pod owned by the connecting tenant. Each SQL pod is dedicated to just one tenant, and multiple SQL pods can be owned by the same tenant. Network security rules prevent SQL pods from talking to one another unless they are owned by the same tenant. 

Finally, the SQL pods communicate with the KV layer to access data managed by the shared storage pods, each of which stores that data in an [AWS](https://aws.amazon.com/ebs/features/) or [GCP](https://cloud.google.com/compute/docs/disks#pdspecs) block storage system.

### Performance 

Serverless clusters scale based on your workload. Clusters start with 10M RUs of free [burst capacity](#concepts) and accrue 100 RUs per second up to a maximum of 250M free RUs per month. Accrued RUs can be used for burst performance, and once they have been used the cluster will revert to the baseline performance of 100 RUs per second.

If you set a spend limit, your cluster will not be throttled to baseline performance once you use all of your free accrued RUs. Instead, it will continue to use burst performance as needed until you reach the spend limit. You will only be charged for the resources you use up to your spend limit. If you reach your spend limit, your cluster will revert to the baseline performance of 100 RUs per second. All [Console Admins](console-access-management.html#console-admin) will receive email alerts when your cluster reaches 50%, 75%, and 100% of its spend limit, burst capacity, or storage limit.

Depending on your workload, your budget will be used differently. For example, a cluster using very little storage space will have more of its budget available for burst performance, and vice versa. If you hit your spend limit, your cluster will be throttled down to baseline performance levels. If this occurs, you can opt to increase your spend limit, adjust your workload to stay within the current spend limit, or stay at the baseline performance level until the next month.

Storage always gets first priority in the budget since you need to be able to store the data first and foremost. The remainder of the budget is allocated to burst performance. You can theoretically reach your spend limit for burst performance in the first few minutes of a cluster being created. If this happens, the cluster will be throttled back to the baseline performance and can reaccumulate burst capacity by using fewer RUs.

Serverless clusters also have the ability to scale to zero and consume no resources when there are no active queries. When there are no active queries, you will pay for the storage your app is using, but not for Request Units. To avoid wasted resources, {{ site.data.products.db }} automatically pauses Serverless clusters that are inactive, which is defined by having no connection to the cluster for two consecutive minutes. Once the user attempts to reconnect to the cluster, the cluster will automatically resume. Pausing, resuming, and scaling clusters is a fully-managed process and will not disrupt or affect the user experience. However, it is important for your application to have connection retry logic in the event of node restarts or network disruptions. For more information, see the [Production Checklist](production-checklist.html).

The diagram below shows how {{ site.data.products.serverless }} autoscales in four different scenarios:

<img src="{{ 'images/cockroachcloud/serverless-scaling.png' | relative_url }}" alt="Serverless scaling" style="max-width:100%" />

</section>

<section class="filter-content" markdown="1" data-scope="dedicated">

## {{ site.data.products.dedicated }}

If you need a single-tenant cluster with no shared resources, we recommend {{ site.data.products.dedicated }}. {{ site.data.products.dedicated }} supports single and multi-region clusters in Amazon Web Services and Google Cloud Platform.

### Hardware

We use the Kubernetes offerings in AWS and GCP (EKS and GKE respectively) to run {{ site.data.products.db }} offerings. GCP clusters use [N1 standard](https://cloud.google.com/compute/docs/machine-types#n1_machine_types) machine types and [Persistent Disk storage](https://cloud.google.com/compute/docs/disks#pdspecs). AWS clusters use [M5 instance types](https://aws.amazon.com/ec2/instance-types/m5/#Product_Details) and [Elastic Block Store (EBS)](https://aws.amazon.com/ebs/features/). Each single region cluster has a minimum of three nodes spread across three availability zones (AZ) in a cloud provider region. Multi-region clusters are similar to single-region clusters, with nodes spread across three or more AZs in each region.

### Security and Connection

{{ site.data.products.dedicated }} clusters are single-tenant. This means each new cluster gets its own project in GCP or its own account in AWS. No two Dedicated clusters share any resources with each other. Since these clusters are within their own accounts and projects, they are also in a default virtual private cloud (VPC). Users connect to a Dedicated cluster by using a load balancer in front of each region which leads to one connection string per region. Unless you set up [VPC peering](network-authorization.html#vpc-peering) or [AWS PrivateLink](network-authorization.html#aws-privatelink), your cluster will use TLS 1.2 protocol for encrypting inter-node and client-node communication.

{{ site.data.products.db }} clusters also use digital certificates for inter-node authentication, [SSL modes](authentication.html#ssl-mode-settings) for node identity verification, and password authentication for client identity verification. See [Authentication](authentication.html) for more details.

[Backups](backups-page.html) are encrypted in S3 and GCS buckets using the cloud provider keys. 

### Multi-region architecture

<img src="{{ 'images/cockroachcloud/multiregion-diagram.png' | relative_url }}" alt="Multi-region architecture" style="max-width:100%" />

</section>

## Learn more

See the [CockroachDB architecture](../{{site.versions["stable"]}}/architecture/overview.html) documentation for more information.