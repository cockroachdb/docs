---
title: Deploy CockroachDB on AWS EC2 (Insecure)
summary: Learn how to deploy CockroachDB on Amazon's AWS EC2 platform.
toc: false
toc_not_nested: true
ssh-link: http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html
---

<div class="filters filters-big clearfix">
  <a href="deploy-cockroachdb-on-aws.html"><button class="filter-button">Secure</button>
  <button class="filter-button current"><strong>Insecure</strong></button></a>
</div>

This page shows you how to manually deploy an insecure multi-node CockroachDB cluster on Amazon's AWS EC2 platform, using AWS's managed load balancing service to distribute client traffic.

{{site.data.alerts.callout_danger}}If you plan to use CockroachDB in production, we strongly recommend using a secure cluster instead. Select <strong>Secure</strong> above for instructions.{{site.data.alerts.end}}

<div id="toc"></div>

## Requirements

{% include prod_deployment/insecure-requirements.md %}

## Recommendations

{% include prod_deployment/insecure-recommendations.md %}

- All instances running CockroachDB should be members of the same Security Group.

## Step 1. Configure your network

CockroachDB requires TCP communication on two ports:

- `26257` for inter-node communication (i.e., working as a cluster), for applications to connect to the load balancer, and for routing from the load balancer to nodes
- `8080` for exposing your Admin UI

You can create these rules using [Security Groups' Inbound Rules](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-network-security.html#adding-security-group-rule).

#### Inter-node and load balancer-node communication

| Field | Recommended Value |
|-------|-------------------|
| Type | Custom TCP Rule |
| Protocol | TCP |
| Port Range | **26257** |
| Source | The name of your security group (e.g., *sg-07ab277a*) |

#### Admin UI

| Field | Recommended Value |
|-------|-------------------|
| Type | Custom TCP Rule |
| Protocol | TCP |
| Port Range | **8080** |
| Source | Your network's IP ranges |

#### Application data

| Field | Recommended Value |
|-------|-------------------|
| Type | Custom TCP Rules |
| Protocol | TCP |
| Port Range | **26257** |
| Source | Your application's IP ranges |

## Step 2. Create instances

[Create an instance](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/launching-instance.html) for each node you plan to have in your cluster.

- Run at least 3 nodes to [ensure survivability](recommended-production-settings.html#cluster-topology).

- Use `m` (general purpose), `c` (compute-optimized), or `i` (storage-optimized) [instances](https://aws.amazon.com/ec2/instance-types/), with SSD-backed [EBS volumes](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSVolumeTypes.html) or [Instance Store volumes](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ssd-instance-store.html). For example, Cockroach Labs has used `m3.large` instances (2 vCPUs and 7.5 GiB of RAM per instance) for internal testing.

- **Do not** use ["burstable" `t2` instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/t2-instances.html), which limit the load on a single core.

For more details, see [Hardware Recommendations](recommended-production-settings.html#hardware) and [Cluster Topology](recommended-production-settings.html#cluster-topology).

## Step 3. Synchronize clocks

{% include prod_deployment/synchronize-clocks.md %}

## Step 4. Set up load balancing

Each CockroachDB node is an equally suitable SQL gateway to your cluster, but to ensure client performance and reliability, it's important to use TCP load balancing:

- **Performance:** Load balancers spread client traffic across nodes. This prevents any one node from being overwhelmed by requests and improves overall cluster performance (queries per second).

- **Reliability:** Load balancers decouple client health from the health of a single CockroachDB node. In cases where a node fails, the load balancer redirects client traffic to available nodes.

AWS offers fully-managed load balancing to distribute traffic between instances.

1. [Add AWS load balancing](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-increase-availability.html). Be sure to:
	- Set forwarding rules to route TCP traffic from the load balancer's port **26257** to port **26257** on the node Droplets.
	- Configure health checks to use HTTP port **8080** and path `/health`.
2. Note the provisioned **IP Address** for the load balancer. You'll use this later to test load balancing and to connect your application to the cluster.

{{site.data.alerts.callout_info}}If you would prefer to use HAProxy instead of AWS's managed load balancing, see <a href="manual-deployment-insecure.html">Manual Deployment</a> for guidance.{{site.data.alerts.end}}

## Step 5. Start nodes

{% include prod_deployment/insecure-start-nodes.md %}

## Step 6. Initialize the cluster

{% include prod_deployment/insecure-initialize-cluster.md %}

## Step 7. Test the cluster

{% include prod_deployment/insecure-test-cluster.md %}

## Step 8. Test load balancing

{% include prod_deployment/insecure-test-load-balancing.md %}

## Step 9. Use the cluster

Now that your deployment is working, you can:

1. [Implement your data model](sql-statements.html).
2. [Create users](create-and-manage-users.html) and [grant them privileges](grant.html).
3. [Connect your application](install-client-drivers.html). Be sure to connect your application to the AWS load balancer, not to a CockroachDB node.

## Step 10. Monitor the cluster

{% include prod_deployment/insecure-monitor-cluster.md %}

## Step 11. Scale the cluster

{% include prod_deployment/insecure-scale-cluster.md %}

## See Also

- [Google Cloud Platform GCE Deployment](deploy-cockroachdb-on-google-cloud-platform.html)
- [Digital Ocean Deployment](deploy-cockroachdb-on-digital-ocean.html)
- [Azure Deployment](deploy-cockroachdb-on-microsoft-azure.html)
- [Manual Deployment](manual-deployment.html)
- [Orchestration](orchestration.html)
- [Start a Local Cluster](start-a-local-cluster.html)
