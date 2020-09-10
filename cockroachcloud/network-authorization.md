
---
title: Network Authorization
summary: Learn about the user authorization features for CockroachCloud clusters.
toc: true
---

To prevent denial-of-service and brute force password attacks, CockroachCloud requires you to authorize networks that can access your cluster by [allowlisting the public IP addresses](#ip-allowlisting) for your application. Optionally, you can [set up Virtual Private Cloud (VPC) peering](#vpc-peering) for your cluster for enhanced network security and lower network latency.

## IP allowlisting

Authorize your application server’s network and your local machine’s network by [adding their public IP addresses (in the CIDR format) to the CockroachCloud cluster's allowlist](connect-to-your-cluster.html#step-1-authorize-your-network). If you change your location, you will need to authorize the new location’s network, else the connection from that network will be rejected.

- In a development environment, you need to authorize your application server’s network and your local machine’s network. If you change your location, you need to authorize the new location’s network, or else the connection from that network will be rejected.
- In a production environment, you need to authorize your application server’s network.

{{site.data.alerts.callout_info}}
While developing and testing your application, you may add `0.0.0.0/0` to the allowlist, which allows all networks. However, before moving into production, make sure you delete the `0.0.0.0/0` network since it allows anybody who uses your password to reach the CockroachDB nodes.
{{site.data.alerts.end}}

If your application servers’ IP addresses are not static or you want to limit your cluster's exposure to the public network, you can connect to your CockroachCloud clusters using VPC Peering instead.

## VPC peering

{{site.data.alerts.callout_info}}
Self-service VPC peering is a limited-availability feature for GCP clusters. For AWS clusters, [contact us](https://support.cockroachlabs.com/hc/en-us/requests/new).
{{site.data.alerts.end}}

If you select GCP as your Cloud provider while [creating your CockroachCloud cluster](create-your-cluster.html), you can use [Google Cloud's VPC Network Peering](https://cloud.google.com/vpc/docs/vpc-peering) feature to connect your GCP application directly to your CockroachCloud cluster using internal IP addresses, thus limiting exposure to the public network and reducing network latency.

Setting up a VPC peering connection between your CockroachCloud cluster and GCP application is a two-part process:

- Configure the IP range and size while creating the CockroachCloud cluster
- Configure a peering connection after creating the cluster

{{site.data.alerts.callout_info}}
Self-service VPC peering setup is available only while creating a new CockroachCloud cluster. To set up VPC peering for existing clusters, [contact us](https://support.cockroachlabs.com/hc/en-us/requests/new).
{{site.data.alerts.end}}

### Configure the IP range and size while creating your CockroachCloud cluster

While creating your CockroachCloud cluster, [enable VPC peering](create-your-cluster.html) and configure the IP address range and size (in CIDR format) for the CockroachCloud network based on the following considerations:

-  To adhere to [GCP's overlapping subnets restriction](https://cloud.google.com/vpc/docs/vpc-peering#restrictions), configure an IP range that doesn't overlap with the IP ranges in your application network.
- The IP range and size cannot be changed after the cluster is created. Configuring a smaller IP range size may limit your ability to expand into multiple regions in the future. We recommend configuring an IP range size of `/16` or lower.

Alternatively, you can use CockroachCloud's default IP range and size (`172.28.0.0/14`) as long as it doesn't overlap with the IP ranges in your network.

### Establish a VPC Peering connection after creating your CockroachCloud cluster

After creating your CockroachCloud cluster, [request a peering connection](connect-to-your-cluster.html#Establish-a-vpc-peering-connection) from CockroachCloud's **Networking** page. Then accept the request by running the `gcloud` command displayed your screen. You can check the status of the connection on the **Peering** tab on the **Networking** page. The status is shown as `PENDING` until you accept the connection request from the GCP side. After the connection is successfully established, the status changes to `ACTIVE`. You can then [select a connection method](connect-to-your-cluster.html#step-3-select-a-connection-method) and [connect to your cluster](connect-to-your-cluster.html#step-4-connect-to-your-cluster).
