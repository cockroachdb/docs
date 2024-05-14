---
title: CockroachDB Cloud Infrastructure
summary: Learn more about CockroachDB Cloud architecture
toc: true
docs_area: reference.architecture
cloud: true
---

CockroachDB {{ site.data.products.cloud }} is a fully-managed deployment of CockroachDB. This page describes CockroachDB {{ site.data.products.cloud }}'s architecture and how it relates to CockroachDB.

{{site.data.alerts.callout_success}}
For an intro to CockroachDB's core architecture and capabilities, see [CockroachDB Architecture](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/architecture/overview) or take the free [Introduction to Distributed SQL and CockroachDB](https://university.cockroachlabs.com/courses/course-v1:crl+intro-to-distributed-sql-and-cockroachdb+self-paced/about) course on Cockroach University.
{{site.data.alerts.end}}

{% include common/basic-terms.md %}

## CockroachDB {{ site.data.products.dedicated }}

If you need a single tenant cluster with no shared resources, we recommend CockroachDB {{ site.data.products.dedicated }}. CockroachDB {{ site.data.products.dedicated }} supports single and multi-region clusters in Amazon Web Services and Google Cloud Platform. CockroachDB {{ site.data.products.dedicated }} is recommended for all workloads: lightweight and critical production.

### Hardware

We use the Kubernetes offerings in AWS, GCP, and Azure (EKS, GKE, and AKS respectively) to run CockroachDB {{ site.data.products.cloud }} offerings.

Each single-region cluster has a minimum of three nodes spread across three availability zones (AZ) in a cloud provider region. Multi-region clusters are similar to single-region clusters, with nodes spread across three or more AZs in each region.

### Security and Connection

CockroachDB {{ site.data.products.dedicated }} clusters are single tenant. This means that each new cluster gets its own virtual network, compute (cluster nodes), data storage (cluster disks) and IAM resources. Users connect to a CockroachDB {{ site.data.products.dedicated }} cluster by using a load balancer in front of each region which leads to one connection string per region. Clusters use TLS 1.3 for encrypting inter-node and client-node communication. [VPC peering]({% link cockroachcloud/network-authorization.md %}#vpc-peering) and [AWS PrivateLink]({% link cockroachcloud/network-authorization.md %}#aws-privatelink) optionally ensure that cluster traffic does not flow to cloud infrastructure over public networks.

{{site.data.alerts.callout_info}}
Azure Private Link is not yet available for [CockroachDB {{ site.data.products.dedicated }} on Azure]({% link cockroachcloud/cockroachdb-dedicated-on-azure.md %}).
{{site.data.alerts.end}}

CockroachDB {{ site.data.products.cloud }} clusters also use digital certificates for inter-node authentication, [SSL modes]({% link cockroachcloud/authentication.md %}#ssl-mode-settings) for node identity verification, and password authentication or [digital certificates]({% link cockroachcloud/client-certs-dedicated.md %}) can be used for client identity verification. Refer to [Authentication]({% link cockroachcloud/authentication.md %}) for more details.

[Backups]({% link cockroachcloud/use-managed-service-backups.md %}) are encrypted in S3 and GCS buckets using the cloud provider keys.

### Multi-region architecture

The diagram below shows a high-level representation of a CockroachDB {{ site.data.products.dedicated }} multi-region cluster:

<img src="{{ 'images/cockroachcloud/multiregion-diagram.png' | relative_url }}" alt="Multi-region architecture" style="width:100%; max-width:800px" />

## CockroachDB {{ site.data.products.serverless }}

CockroachDB {{ site.data.products.serverless }} is a fully-managed, auto-scaling deployment of CockroachDB. Being familiar with the following concepts will help you understand our Serverless architecture. CockroachDB {{ site.data.products.serverless }} is ideal for lightweight applications, starter projects, development environments, and proofs of concept.

### Architecture

CockroachDB {{ site.data.products.serverless }} is a managed multi-tenant deployment of CockroachDB. A Serverless cluster is an isolated, virtualized tenant running on a much larger physical CockroachDB deployment.

CockroachDB {{ site.data.products.serverless }} has separate compute and storage layers. The storage pods (KV pods) can be shared across users, and the compute pods (SQL pods) are unique to each user. These shared resources make CockroachDB {{ site.data.products.serverless }} architecture "multi-tenant," in contrast to the single tenant architecture of [CockroachDB {{ site.data.products.dedicated }}](?filters=dedicated#security-and-connection).

Traffic comes in from the public internet and is routed by the cloud provider’s load balancer to a Kubernetes (K8s) cluster that hosts CockroachDB. K8s pods allow CockroachDB {{ site.data.products.serverless }} to limit SQL resource consumption for each user. They also minimize interference between pods that are scheduled on the same machine, giving each user a high-quality experience even when other users are running heavy workloads.

The following diagram is a high-level representation of what a typical Serverless cluster looks like:

<img src="{{ 'images/cockroachcloud/serverless-diagram.png' | relative_url }}" alt="Serverless architecture" style="width:100%; max-width:800px" />

Proxy pods allow many users to share the same IP address, balance loads across a user's available SQL pods, and automatically resume clusters that have been paused due to inactivity. They also detect and respond to suspected abuse of the service.

After the cloud load balancer routes a new connection to one of the proxy pods, the proxy pod will in turn forward that connection to a SQL pod owned by the connecting user. Each SQL pod is dedicated to just one user, and multiple SQL pods can be owned by the same user. Network security rules prevent SQL pods from communicating with one another unless they are owned by the same user.

Finally, the SQL pods communicate with the KV layer to access data managed by the shared storage pods, each of which stores that data in an [AWS](https://aws.amazon.com/ebs/features/) or [GCP](https://cloud.google.com/compute/docs/disks#pdspecs) block storage system.

### Performance

Your cluster's [resource limits](#resource-limits) are the maximum amount of storage and RUs you can use in a month. If you reach your storage limit, your cluster will be throttled and you will only be able to delete data or increase your storage limit. If you reach your RU limit, your cluster will be disabled until the end of the billing cycle unless you increase your RU limit.

#### Free

All CockroachDB {{ site.data.products.cloud }} organizations are given 50 million [Request Units]({% link cockroachcloud/plan-your-cluster-serverless.md %}#request-units) and 10 GiB of storage for free each month. Free resources can be spent across all CockroachDB {{ site.data.products.serverless }} clusters in an organization and will appear as a deduction on your monthly invoice.

#### Paid

You must enter billing information and set [resource limits](#resource-limits) if you've already created one free CockroachDB {{ site.data.products.serverless }} cluster. Higher resource limits will allow your cluster to scale to meet your application's needs and maintain a high level of performance. You can set your storage and RU limits separately to reflect your usage, or choose an unlimited amount of resources to prevent your cluster from ever being throttled or disabled.

### Autoscaling

Serverless clusters also have the ability to scale to zero and consume no compute resources when there are no active queries. When there are no active queries, you will pay for the storage your app is using, but not for Request Units. To avoid wasted resources, CockroachDB {{ site.data.products.cloud }} automatically pauses Serverless clusters that are inactive, which is defined by having no connection to the cluster for five consecutive minutes. Once the user attempts to reconnect to the cluster, the cluster will automatically resume. Pausing, resuming, and scaling clusters is a fully-managed process and will not disrupt or affect the user experience. However, it is important for your application to have connection retry logic in the event of node restarts or network disruptions. For more information, see the [Production Checklist]({% link cockroachcloud/production-checklist.md %}).

The diagrams below shows how CockroachDB {{ site.data.products.serverless }} autoscales with your application's traffic:

<img src="{{ 'images/cockroachcloud/serverless-low-traffic.png' | relative_url }}" alt="Serverless low traffic state" style="width:100%; max-width:800px" />

<img src="{{ 'images/cockroachcloud/serverless-high-traffic.png' | relative_url }}" alt="Serverless scaling" style="width:100%; max-width:800px" />

## Learn more

See the [CockroachDB architecture](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/architecture/overview) documentation for more information.
