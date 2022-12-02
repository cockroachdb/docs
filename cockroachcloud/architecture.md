---
title: CockroachDB Cloud Architecture
summary: Learn more about CockroachDB Cloud architecture
toc: true
docs_area: reference.architecture
cloud: true
---

{{ site.data.products.db }} is a fully-managed deployment of CockroachDB. This page describes {{ site.data.products.db }}'s architecture and how it relates to CockroachDB.

{{site.data.alerts.callout_success}}
For an intro to CockroachDB's core architecture and capabilities, see [CockroachDB Architecture](../stable/architecture/overview.html) or take the free [Introduction to Distributed SQL and CockroachDB](https://university.cockroachlabs.com/courses/course-v1:crl+intro-to-distributed-sql-and-cockroachdb+self-paced/about) course on Cockroach University.
{{site.data.alerts.end}}

{% include common/basic-terms.md %}

## {{ site.data.products.dedicated }}

If you need a single tenant cluster with no shared resources, we recommend {{ site.data.products.dedicated }}. {{ site.data.products.dedicated }} supports single and multi-region clusters in Amazon Web Services and Google Cloud Platform. {{ site.data.products.dedicated }} is recommended for all workloads: lightweight and critical production.

### Hardware

We use the Kubernetes offerings in AWS and GCP (EKS and GKE respectively) to run {{ site.data.products.db }} offerings. GCP clusters use [N1 standard](https://cloud.google.com/compute/docs/machine-types#n1_machine_types) machine types and [Persistent Disk storage](https://cloud.google.com/compute/docs/disks#pdspecs). AWS clusters use [M5 instance types](https://aws.amazon.com/ec2/instance-types/m5/#Product_Details) and [Elastic Block Store (EBS)](https://aws.amazon.com/ebs/features/). Each single-region cluster has a minimum of three nodes spread across three availability zones (AZ) in a cloud provider region. Multi-region clusters are similar to single-region clusters, with nodes spread across three or more AZs in each region.

### Security and Connection

{{ site.data.products.dedicated }} clusters are single tenant. This means that each new cluster gets its own virtual network (VPC in AWS and GCP), compute (cluster nodes), data storage (cluster disks) and IAM resources. Users connect to a {{ site.data.products.dedicated }} cluster by using a load balancer in front of each region which leads to one connection string per region. Unless you set up [VPC peering](network-authorization.html#vpc-peering) or [AWS PrivateLink](network-authorization.html#aws-privatelink), your cluster will use TLS 1.3 protocol for encrypting inter-node and client-node communication.

{{ site.data.products.db }} clusters also use digital certificates for inter-node authentication, [SSL modes](authentication.html#ssl-mode-settings) for node identity verification, and password authentication for client identity verification. See [Authentication](authentication.html) for more details.

[Backups](backups-page.html) are encrypted in S3 and GCS buckets using the cloud provider keys.

### Multi-region architecture

The diagram below shows a high-level representation of a {{ site.data.products.dedicated }} multi-region cluster:

<img src="{{ 'images/cockroachcloud/multiregion-diagram.png' | relative_url }}" alt="Multi-region architecture" style="width:100%; max-width:800px" />

## {{ site.data.products.serverless }}

{{ site.data.products.serverless }} is a fully-managed, auto-scaling deployment of CockroachDB. Being familiar with the following concepts will help you understand our Serverless architecture. {{ site.data.products.serverless }} is ideal for lightweight applications, starter projects, development environments, and proofs of concept.

### Architecture

{{ site.data.products.serverless }} is a managed multi-tenant deployment of CockroachDB. A Serverless cluster is an isolated, virtualized tenant running on a much larger physical CockroachDB deployment.

{{ site.data.products.serverless }} has separate compute and storage layers. The storage pods (KV pods) can be shared across users, and the compute pods (SQL pods) are unique to each user. These shared resources make {{ site.data.products.serverless }} architecture "multi-tenant," in contrast to the single tenant architecture of [{{ site.data.products.dedicated }}](?filters=dedicated#security-and-connection).

Traffic comes in from the public internet and is routed by the cloud provider’s load balancer to a Kubernetes (K8s) cluster that hosts CockroachDB. K8s pods allow {{ site.data.products.serverless }} to limit SQL resource consumption for each user. They also minimize interference between pods that are scheduled on the same machine, giving each user a high-quality experience even when other users are running heavy workloads.

The following diagram is a high-level representation of what a typical Serverless cluster looks like:

<img src="{{ 'images/cockroachcloud/serverless-diagram.png' | relative_url }}" alt="Serverless architecture" style="width:100%; max-width:800px" />

Proxy pods allow many users to share the same IP address, balance loads across a user's available SQL pods, and automatically resume clusters that have been paused due to inactivity. They also detect and respond to suspected abuse of the service.

After the cloud load balancer routes a new connection to one of the proxy pods, the proxy pod will in turn forward that connection to a SQL pod owned by the connecting user. Each SQL pod is dedicated to just one user, and multiple SQL pods can be owned by the same user. Network security rules prevent SQL pods from communicating with one another unless they are owned by the same user.

Finally, the SQL pods communicate with the KV layer to access data managed by the shared storage pods, each of which stores that data in an [AWS](https://aws.amazon.com/ebs/features/) or [GCP](https://cloud.google.com/compute/docs/disks#pdspecs) block storage system.

### Performance

#### Baseline

Baseline performance for a Serverless cluster is 100 [Request Units](learn-about-request-units.html), or RUs, per second, and any usage above that is called [burst performance](#cockroachdb-cloud-terms). Clusters start with 10M RUs of free burst capacity each month and earn 100 RUs per second up to a maximum of 250M free RUs per month. Earned RUs can be used immediately or accumulated as burst capacity. If you use all of your burst capacity, your cluster will revert to baseline performance.

The following diagram shows how RUs are accumulated and consumed:

<img src="{{ 'images/cockroachcloud/ru-diagram.png' | relative_url }}" alt="RU diagram" style="width:100%; max-width:800px" />

#### Paid

You can set your spend limit higher to maintain a high level of performance with larger workloads. If you have a spend limit, your cluster will not be throttled to baseline performance once you use all of your free earned RUs. Instead, it will continue to use burst performance as needed until you reach your spend limit. You will only be charged for the resources you use up to your spend limit. If you reach your spend limit, your cluster will revert to the baseline performance of 100 RUs per second.

Depending on your workload, your budget will be used differently. For example, a cluster using very little storage space will have more of its budget available for burst performance, and vice versa. If you hit your spend limit, your cluster will be throttled down to baseline performance levels. If this occurs, you can opt to increase your spend limit, adjust your workload to stay within the current spend limit, or stay at the baseline performance level until the next month.

Storage always gets first priority in the budget since you need to be able to store your data first and foremost. The remainder of the budget is allocated to burst performance. You can theoretically reach your spend limit on burst performance in the first few minutes of a cluster being created. If this happens, the cluster will be throttled back to the baseline performance and can reaccumulate burst capacity by using fewer RUs.

### Autoscaling

Serverless clusters also have the ability to scale to zero and consume no compute resources when there are no active queries. When there are no active queries, you will pay for the storage your app is using, but not for Request Units. To avoid wasted resources, {{ site.data.products.db }} automatically pauses Serverless clusters that are inactive, which is defined by having no connection to the cluster for five consecutive minutes. Once the user attempts to reconnect to the cluster, the cluster will automatically resume. Pausing, resuming, and scaling clusters is a fully-managed process and will not disrupt or affect the user experience. However, it is important for your application to have connection retry logic in the event of node restarts or network disruptions. For more information, see the [Production Checklist](production-checklist.html).

The diagrams below shows how {{ site.data.products.serverless }} autoscales with your application's traffic:

<img src="{{ 'images/cockroachcloud/serverless-low-traffic.png' | relative_url }}" alt="Serverless low traffic state" style="width:100%; max-width:800px" />

<img src="{{ 'images/cockroachcloud/serverless-high-traffic.png' | relative_url }}" alt="Serverless scaling" style="width:100%; max-width:800px" />

## Learn more

See the [CockroachDB architecture](../{{site.versions["cloud"]}}/architecture/overview.html) documentation for more information.
