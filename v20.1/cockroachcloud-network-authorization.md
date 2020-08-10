---
title: Network security
summary: Learn about the network security features for CockroachCloud clusters.
toc: true
build_for: [cockroachcloud]
---

To prevent denial-of-service and brute force password attacks, CockroachCloud allows you to authorize networks that can access your cluster by allowlisting IP addresses or setting up VPC peering.

## IP allowlisting

Authorize your application server’s network and your local machine’s network by [adding their IP addresses (in the CIDR notation) to the CockroachCloud cluster's allowlist](cockroachcloud-connect-to-your-cluster.html#step-1-authorize-your-network). If you change your location, you will need to authorize the new location’s network, else the connection from that network will be rejected.

- In a development environment, you need to authorize your application server’s network and your local machine’s network. If you change your location, you need to authorize the new location’s network, or else the connection from that network will be rejected.
- In a production environment, you need to authorize your application server’s network.

{{site.data.alerts.callout_info}}
While developing and testing your application, you may add `0.0.0.0/0` to the allowlist, which allows all networks. However, before moving into production, make sure you delete the `0.0.0.0/0` network since it allows anybody who uses your password to reach the CockroachDB nodes.
{{site.data.alerts.end}}

If your application servers’ IP addresses are not static, you can connect to your CockroachCloud clusters using VPC Peering instead.

## VPC peering

VPC peering allows you to connect your GCP or AWS application servers directly to your CockroachCloud cluster using internal IP addresses, thus limiting exposure to the public network. Use VPC peering for lower network latency and enhanced network security.

{{site.data.alerts.callout_info}}
Self-service VPC peering setup is available only for GCP clusters. For AWS clusters, [contact us](https://support.cockroachlabs.com/hc/en-us/requests/new).
{{site.data.alerts.end}}

Setting up a VPC peering connection between your CockroachCloud cluster and GCP application network is a two-part process: Specifying the VPC subnet during CockroachCloud creation and establishing the peering connection after cluster creation.

### Specifying the VPC subnet during CockroachCloud cluster creation

To set up VPC peering for your CockroachCloud cluster, [enable VPC peering](cockroachcloud-create-your-cluster.html) while creating the cluster and specify the IP address range (in CIDR notation) and size for the CockroachCloud network. The IP range and size cannot be changed after the cluster is created and may limit your ability to expand into multiple regions in the future. Use the default IP range only if it does not overlap with the IP ranges in your application network.

At the time of peering, Google Cloud checks to see if there are any subnets with overlapping IP ranges between the two VPC networks or any of their peered networks. If there is an overlap, peering is not established. Since a full mesh connectivity is created between VM instances, subnets in the peered VPC networks can't have overlapping IP ranges as this would cause routing issues.

If there were any subnets with overlapping IP ranges between peers of a given VPC network, it would cause a routing conflict. "

"Overlapping subnets when creating or expanding subnets
When a VPC subnet is created or a subnet IP range is expanded, Google Cloud performs a check to make sure the new subnet range does not overlap with IP ranges of subnets in the same VPC network or in directly peered VPC networks. If it does, the creation or expansion action fails.

Google Cloud also ensures that no overlapping subnet IP ranges are allowed across VPC networks that have a peered network in common. If it does, the creation or expansion action fails."

### Establishing the peering connection after CockroachCloud cluster creation

"Each side of a peering association is set up independently. Peering will be active only when the configuration from both sides matches. Either side can choose to delete the peering association at any time."

"Before you begin, you must have the name of the VPC network to which you will peer with. If that network is located in another project, you must also have the project ID of that project.

A peering configuration establishes the intent to connect to another VPC network. Your network and the other network are not connected until each one has a peering configuration for the other. After the other network has a corresponding configuration to peer with your network, the peering state changes to ACTIVE in both networks, and they are connected. If there's no matching peering configuration in the other network, the peering state remains INACTIVE, indicating that your network is not connected to the other one."

Get the customer’s project ID and network name.
Create the VPC peering connection.
Provide the customer our own GCP project ID and VPC name, so they can create the mutual connection. Instruct them how to do so (gcloud CLI / web console).
