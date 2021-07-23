---
title: CockroachCloud Architecture
summary: Learn more about CockroachCloud architecture
toc: true
---

CockroachCloud is a fully-managed deployment of CockroachDB. This page describes CockroachCloud's architecture and how it relates to CockroachDB.

## CockroachCloud Serverless

CockroachCloud Serverless (beta) is a fully-managed, multi-tenant deployment of CockroachDB. All CockroachCloud Serverless (beta) clusters share resources, however, SQL pods are not shared--only the KV layer is shared.

### Request Units

All resource usage in CockroachCloud Serverless (beta) is measured in Request Units, or RUs. RUs represent the compute and I/O resources used by a read or a write query. All database operations cost a certain amount of RUs depending on the resources used. For example, a "small read" might cost 1 RU, and a "large read" such as a full table scan with indexes could cost 100 RUs. You can see how many request units your cluster has used on the [Cluster Overview](serverless-cluster-management.html#view-cluster-overview) page.

RUs = SQL CPU + ReadRequests + ReadBytes + WriteRequests + WriteBytes

### Performance 

Serverless clusters scale based on the application load they are serving. Paid clusters can scale up to the amount of resources being paid for, and free clusters can scale up to 100M Request Units and 5GB of storage.

Depending on your workload, your budget will be used differently. For example, a cluster using very little storage space will have more of its budget available for Request Units, and vice versa. If you hit your budget, your cluster will be throttled down to free-tier performance levels. In this case, you can increase your budget or adjust your workload to stay within budget.

Burst capacity is the ability of the Serverless (beta) cluster to scale above baseline performance. Supporting application traffic that “burst” i.e., can fluctuate above baseline traffic is a key feature of Serverless clusters.

CockroachCloud Serverless (beta) clusters have the ability to scale to zero and consume no resources when there are no active queries. When there are no active queries, you will pay for storage your app is using, but not for Request Units. To avoid wasted resources, CockroachCloud automatically pauses free clusters that are inactive, which is defined by having no connection to the cluster for 2 consecutive minutes. Once the user attempts to reconnect to the cluster, the cluster will automatically resume. Pausing, resuming, and scaling  clusters is a fully-managed process and will not disrupt or affect the user experience.

### Storage

All data in CockroachCloud Serverless (beta) is automatically replicated three times and distributed across Availability Zones to survive outages. Storage is measured in units of GiB-months, which is the amount of data stored multiplied by how long it was stored. Storing 10 GiB for a month and storing 1 GiB for 10 months are both 10 GiB-months. The storage users see in the [Cluster Overview](serverless-cluster-management.html#view-cluster-overview) page is the amount of data before considering the replication multiplier.

### Diagram

## CockroachCloud Dedicated

CockroachDB Serverless may not be right for enterprises that have rigorous security requirements due to its multi-tenant architecture. For those use cases we recommend CockroachDB Dedicated. CockroachCloud Dedicated supports single and multi-region clusters in Amazon Web Services and Google Cloud Platform.

### Hardware

We use the Kubernetes offerings in AWS and GCP to run our offering - EKS and GKE respectively. For compute we use the C5 series of machines in AWS and the N1-standard machine types in GCP. For storage we use Elastic Block Storage with provisioned iops in AWS, and Persistent Disks in GCP. Each single region cluster has a minimum of three nodes spread across three availability zones (AZ) in a cloud provider region. For multi-region clusters, similarly, nodes are spread across three or more AZs in each region.

### Security and Connection

CockroachCloud Dedicated clusters are single tenant. This means each new cluster gets its own project in GCP or its own account in AWS. No two clusters share any resources between each other. Since these clusters are within their own accounts and projects, they are also in a default virtual private cloud (VPC). Currently a customer connects to them using the load balancer in front of each region leading to one connection string if the cluster is single region and multiple connection strings (one per region) if the cluster is multi-region. Since we don’t support VPC peering (yet), the connections are over TLS 1.2 secure over the internet.

All clusters are secure by default, and we use a combination of certificates and passwords authentication. We generate one certificate per cluster. We use certificates (verify-full SSL mode) for the nodes to authenticate each other, and for the nodes to authenticate the client. We use passwords for the client to authenticate the node. We use a network security model where IPs must be whitelisted for SQL connections to be allowed to the cluster - this prevents denial of service and brute password attacks.

Backups are encrypted in S3 and GCS buckets using the cloud provider keys. 

### Multi-region

Diagram placeholder

## Learn more

See the [CockroachDB architecture](../{{site.versions["stable"]}}/architecture/overview.html) documentation for more information.