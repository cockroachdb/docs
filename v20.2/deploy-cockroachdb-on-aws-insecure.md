---
title: Deploy CockroachDB on AWS EC2 (Insecure)
summary: Learn how to deploy CockroachDB on Amazon's AWS EC2 platform.
toc: true
toc_not_nested: true
ssh-link: http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html
---

<div class="filters filters-big clearfix">
  <a href="deploy-cockroachdb-on-aws.html"><button class="filter-button">Secure</button>
  <button class="filter-button current"><strong>Insecure</strong></button></a>
</div>

This page shows you how to manually deploy an insecure multi-node CockroachDB cluster on Amazon's AWS EC2 platform, using AWS's managed load balancing service to distribute client traffic.

{% include {{ page.version.version }}/prod-deployment/insecure-flag.md %}

{% include cockroachcloud/use-cockroachcloud-instead.md %}

## Before you begin

### Requirements

{% include {{ page.version.version }}/prod-deployment/insecure-requirements.md %}

### Recommendations

{% include {{ page.version.version }}/prod-deployment/insecure-recommendations.md %}

- All Amazon EC2 instances running CockroachDB should be members of the same [security group](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-network-security.html).

## Step 1. Create instances

Open the [Amazon EC2 console](https://console.aws.amazon.com/ec2/) and [launch an instance](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/launching-instance.html#launch-instance-console) for each node you plan to have in your cluster. If you plan to [run our sample workload](#step-8-run-a-sample-workload) against the cluster, create a separate instance for that workload.

- Run at least 3 nodes to ensure survivability.

- Your instances will rely on Amazon Time Sync Service for clock synchronization. When choosing an AMI, note that some machines are preconfigured to use Amazon Time Sync Service (e.g., Amazon Linux AMIs) and others are not.

- Use `m` (general purpose), `c` (compute-optimized), or `i` (storage-optimized) instance types, with SSD-backed [EBS volumes](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSVolumeTypes.html) or [Instance Store volumes](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ssd-instance-store.html). For example, Cockroach Labs has used `c5d.4xlarge` (16 vCPUs and 32 GiB of RAM per instance, EBS) for internal testing.

	- **Do not** use ["burstable" `t2` instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/t2-instances.html), which limit the load on a single core.

- Note the ID of the VPC you select. You will need to look up its IP range when setting inbound rules for your security group.

- Make sure all your instances are in the same security group.

	- If you are creating a new security group, add the [inbound rules](#step-2-configure-your-network) from the next step. Otherwise note the ID of the security group.

For more details, see [Hardware Recommendations](recommended-production-settings.html#hardware) and [Cluster Topology](recommended-production-settings.html#topology).

## Step 2. Configure your network

[Add Custom TCP inbound rules](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-network-security.html#adding-security-group-rule) to your security group to allow TCP communication on two ports:

- `26257` for inter-node and client-node communication. This enables the nodes to work as a cluster, the load balancer to route traffic to the nodes, and applications to connect to the load balancer.
- `8080` for exposing the DB Console to the user, and for routing the load balancer to the health check endpoint.

{% include {{ page.version.version }}/prod-deployment/aws-inbound-rules.md %}

## Step 3. Synchronize clocks

{% include {{ page.version.version }}/prod-deployment/synchronize-clocks.md %}

## Step 4. Set up load balancing

Each CockroachDB node is an equally suitable SQL gateway to your cluster, but to ensure client performance and reliability, it's important to use load balancing:

- **Performance:** Load balancers spread client traffic across nodes. This prevents any one node from being overwhelmed by requests and improves overall cluster performance (queries per second).

- **Reliability:** Load balancers decouple client health from the health of a single CockroachDB node. In cases where a node fails, the load balancer redirects client traffic to available nodes.

AWS offers fully-managed load balancing to distribute traffic between instances.

1. [Add AWS load balancing](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/network-load-balancer-getting-started.html). Be sure to:
	- Select a **Network Load Balancer** and use the ports we specify below.
	- Select the VPC and *all* availability zones of your instances. This is important, as you cannot change the availability zones once the load balancer is created. The availability zone of an instance is determined by its subnet, found by inspecting the instance in the Amazon EC2 Console.
	- Set the load balancer port to **26257**.
    - Create a new target group that uses TCP port **26257**. Traffic from your load balancer is routed to this target group, which contains your instances.
    - Configure health checks to use HTTP port **8080** and path `/health?ready=1`. This [health endpoint](monitoring-and-alerting.html#health-ready-1) ensures that load balancers do not direct traffic to nodes that are live but not ready to receive requests.
    - Register your instances with the target group you created, specifying port **26257**. You can add and remove instances later.
2. To test load balancing and connect your application to the cluster, you will need the provisioned internal (private) **IP address** for the load balancer. To find this, open the Network Interfaces section of the Amazon EC2 console and look up the load balancer by its name.

{{site.data.alerts.callout_info}}If you would prefer to use HAProxy instead of AWS's managed load balancing, see the <a href="deploy-cockroachdb-on-premises-insecure.html">On-Premises</a> tutorial for guidance.{{site.data.alerts.end}}

## Step 5. Start nodes

{% include {{ page.version.version }}/prod-deployment/insecure-start-nodes.md %}

## Step 6. Initialize the cluster

{% include {{ page.version.version }}/prod-deployment/insecure-initialize-cluster.md %}

## Step 7. Test the cluster

{% include {{ page.version.version }}/prod-deployment/insecure-test-cluster.md %}

## Step 8. Run a sample workload

{% include {{ page.version.version }}/prod-deployment/insecure-test-load-balancing.md %}

## Step 9. Monitor the cluster

In the Target Groups section of the Amazon EC2 console, [check the health](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/target-group-health-checks.html) of your instances by inspecting your target group and opening the Targets tab.

{% include {{ page.version.version }}/prod-deployment/monitor-cluster.md %}

## Step 10. Scale the cluster

Before adding a new node, [create a new instance](#step-1-create-instances) as you did earlier.

{% include {{ page.version.version }}/prod-deployment/insecure-scale-cluster.md %}

## Step 11. Use the cluster

Now that your deployment is working, you can:

1. [Implement your data model](sql-statements.html).
2. [Create users](create-and-manage-users.html) and [grant them privileges](grant.html).
3. [Connect your application](install-client-drivers.html). Be sure to connect your application to the AWS load balancer, not to a CockroachDB node.

## See also

{% include {{ page.version.version }}/prod-deployment/prod-see-also.md %}
