This page provides information about hybrid and multi-cloud self-hosted deployments of CockroachDB. Each of these types of deployments can help an organization to meet its service-level and disaster recovery objectives.

- In a _hybrid deployment_, a cluster's nodes are deployed in a combination of infrastructure you manage, private cloud provider infrastructure, and public cloud provider infrastructure.
- In a _multi-cloud deployment_, a cluster's nodes are deployed in multiple cloud providers' infrastructure public or private infrastructure.

Often, the two terms are used interchangeably.

A hybrid or multi-cloud deployment can help you to:

- Power a single application with data stored across multiple clouds.
- Use data that is created in one cloud to perform analysis in another cloud without having to move data manually.
- Enhance the mobility of applications by being able to move them from one cloud to another.
- Protect against a single cloud provider becoming a single point of failure (SPOF).

Hybrid and multi-cloud deployments are more complex to manage than a simpler deployment. Without care, this type of deployment may experience increased latency, because most cloud providers optimize their networks to minimize network latency for traffic that stays within their infrastructure. In addition, these deployments may incur additional costs for network traffic that egresses from the cloud provider's infrastructure.

{{site.data.alerts.callout_success}}
CockroachDB makes no distinction between a deployment in a single cloud provider, a hybrid deployment, and a multi-cloud deployment.
{{site.data.alerts.end}}

This page provides information to help you decide if a hybrid or multi-cloud deployment is appropriate for your workload, and to optimize the performance of this type of deployment.

{{site.data.alerts.callout_info}}
CockroachDB {{ site.data.products.cloud }} does not support hybrid or multi-cloud deployments.
{{site.data.alerts.end}}

## Configure a hybrid or multi-cloud deployment

To set up a hybrid or multi-cloud deployment:

- **Each node must be able to communicate with and route traffic to each of the cluster's other nodes** using the hostnames or IP addresses referenced by the `--join` flag of the [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) command. A node's network is configured at the level of the node's operating system. Nodes could be connected by peering cloud provider virtual private cloud (VPC) networks together, using a VPN, encrypted network tunnels, by a combination of routing and port forwarding, or using another mechanism.

    CockroachDB could route SQL client requests to any cluster node, regardless of where the client connection originates.
- **There must be no overlapping IP address ranges** across the cluster. It is an error for multiple nodes to have the same IP address or to resolve to the same hostname.

    DNS name resolution is particularly complex in a Kubernetes deployment. On GKE, we recommend that you replace `kube-dns` with Core DNS. Refer to [Deploy CockroachDB on GKE](https://github.com/mbookham7/crdb-multi-cloud-k8s/blob/master/markdown/5-deploy-cockroach.md) for details.
- **In a multi-region deployment, we recommend that you use manifests. Refer to [Deploy CockroachDB on GKE](https://github.com/mbookham7/crdb-multi-cloud-k8s/blob/master/markdown/5-deploy-cockroach.md) for details.
- **Each node deployed in the same environment must share locality** to ensure that the cluster's replicas are spread across deployment environments and to prevent single points of failure or hot spots. To specify a node's locality, use the `--locality` flag, which accepts an arbitrary set of key-value pairs that describe the location of the node. For example, if nodes are deployed in both Azure and Digital Ocean, you could set each node's locality to either `--locality data-center=azure` or `--locality data-center=digital-ocean`.

    If nodes are deployed in multiple regions within the same cloud provider, specify the region as an additional locality, to ensure that replicas are spread across regions in each cloud provider's infrastructure.

## Simulate an outage

This section shows some ways to simulate an outage and validate disaster recovery procedures in a hybrid or multi-cloud deployment.

- **To simulate a single-node outage**, you could down the host or VM where the node is running, or disable its network interface.
- **To simulate a single-region cloud-provider outage**, you could shut down all hosts or VMs in that region on that cloud provider, or disable their network interfaces.
- **To simulate a cloud-provider-wide outage**, you could shut down all hosts or VMs on that cloud provider, disable their network interfaces, or disconnect that cloud provider's network from your other nodes' networks.

As long as the cluster has enough available nodes to achieve quorum, queries will succeed during the simulated outage.

{{site.data.alerts.callout_info}}
If a node is offline for longer than the duration of the [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) `server.time_until_store_dead` (5 minutes by default), the node's status changes to `DEAD` and the node's replicas will be moved to other nodes. After this point, if the node rejoins the cluster, it joins as a new node.
{{site.data.alerts.end}}

## See also

- CockroachDB Blog posts:
    - [Why we need a multi-cloud database, and how to build one](https://www.cockroachlabs.com/blog/why-multicloud-database/)
    - [Multi-cloud demystified: pros, cons, and considerations according to the expert](https://www.cockroachlabs.com/blog/multi-cloud-report/)
    - [What is a multi-cloud database, and how to deploy one?](https://www.cockroachlabs.com/blog/multi-cloud-deployment/)
    - [Multi-cloud architecture: Three real-world examples from fintech](https://www.cockroachlabs.com/blog/fintech-multi-cloud-architecture/)
- [Webinar: Going cloud-native across clouds](https://www.cockroachlabs.com/webinars/going-cloud-native-across-clouds-with-form3-/)
- [Video: Navigating the Multi-Cloud Maze with CockroachDB](https://www.youtube.com/watch?v=3MdLIwFa_ns)
- [CockroachDB multi-cloud Kubernetes deployment examples](https://github.com/mbookham7/crdb-multi-cloud-k8s) on GitHub
- [Multi-cloud deep dive](https://dantheengineer.com/multi-cloud-database-deep-dive/) by a Cockroach Labs engineer
