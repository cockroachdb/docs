---
title: Deploy CockroachDB on Google Cloud Platform GCE (Insecure)
summary: Learn how to deploy CockroachDB on Google Cloud Platform's Compute Engine.
toc: true
toc_not_nested: true
ssh-link: https://cloud.google.com/compute/docs/instances/connecting-to-instance
---

<div class="filters filters-big clearfix">
  <a href="deploy-cockroachdb-on-google-cloud-platform.html"><button class="filter-button">Secure</button>
  <button class="filter-button current"><strong>Insecure</strong></button></a>
</div>

This page shows you how to manually deploy an insecure multi-node CockroachDB cluster on Google Cloud Platform's Compute Engine (GCE), using Google's TCP Proxy Load Balancing service to distribute client traffic.

{% include {{ page.version.version }}/prod-deployment/insecure-flag.md %}

{% include cockroachcloud/use-cockroachcloud-instead.md %}

## Before you begin

### Requirements

{% include {{ page.version.version }}/prod-deployment/insecure-requirements.md %}

- This article covers the use of Linux instances with GCE. You may wish to review the instructions for [connecting to Windows instances](https://cloud.google.com/compute/docs/instances/connecting-to-instance#windows).

### Recommendations

{% include {{ page.version.version }}/prod-deployment/insecure-recommendations.md %}

## Step 1. Configure your network

CockroachDB requires TCP communication on two ports:

- `26257` for inter-node communication (i.e., working as a cluster)
- `8080` for exposing your DB Console

To expose your DB Console and allow traffic from the TCP proxy load balancer and health checker to your instances, [create firewall rules](https://cloud.google.com/compute/docs/vpc/firewalls) for your project. When creating firewall rules, we recommend using Google Cloud Platform's **tag** feature to apply the rule only to instances with the same tag.

#### DB Console

 Field | Recommended Value
-------|-------------------
 Name | **cockroachadmin**
 Source filter | IP ranges
 Source IP ranges | Your local network's IP ranges
 Allowed protocols... | **tcp:8080**
 Target tags | **cockroachdb**

#### Application data

Applications will not connect directly to your CockroachDB nodes. Instead, they'll connect to GCE's TCP Proxy Load Balancing service, which automatically routes traffic to the instances that are closest to the user. Because this service is implemented at the edge of the Google Cloud, you'll need to create a firewall rule to allow traffic from the load balancer and health checker to your instances. This is covered in [Step 4](#step-4-set-up-load-balancing).

## Step 2. Create instances

[Create an instance](https://cloud.google.com/compute/docs/instances/create-start-instance) for each node you plan to have in your cluster. If you plan to run a sample workload against the cluster, create a separate instance for that workload.

- Run at least 3 nodes to [ensure survivability](recommended-production-settings.html#topology).

- Use `n1-standard` or `n1-highcpu` [predefined VMs](https://cloud.google.com/compute/pricing#predefined_machine_types), or [custom VMs](https://cloud.google.com/compute/pricing#custommachinetypepricing), with [Local SSDs](https://cloud.google.com/compute/docs/disks/#localssds) or [SSD persistent disks](https://cloud.google.com/compute/docs/disks/#pdspecs). For example, Cockroach Labs has used `n1-standard-16` (16 vCPUs and 60 GB of RAM per VM, local SSD) for internal testing.

- **Do not** use `f1` or `g1` [shared-core machines](https://cloud.google.com/compute/docs/machine-types#sharedcore), which limit the load on a single core.

- If you used a tag for your firewall rules, when you create the instance, click **Management, security, disks, networking, sole tenancy**. Under the **Networking** tab, in the **Network tags** field, enter **cockroachdb**.

For more details, see [Hardware Recommendations](recommended-production-settings.html#hardware) and [Cluster Topology](recommended-production-settings.html#topology).

## Step 3. Synchronize clocks

{% include {{ page.version.version }}/prod-deployment/synchronize-clocks.md %}

## Step 4. Set up load balancing

Each CockroachDB node is an equally suitable SQL gateway to your cluster, but to ensure client performance and reliability, it's important to use load balancing:

- **Performance:** Load balancers spread client traffic across nodes. This prevents any one node from being overwhelmed by requests and improves overall cluster performance (queries per second).

- **Reliability:** Load balancers decouple client health from the health of a single CockroachDB node. In cases where a node fails, the load balancer redirects client traffic to available nodes.

GCE offers fully-managed [TCP Proxy Load Balancing](https://cloud.google.com/load-balancing/docs/tcp/). This service lets you use a single IP address for all users around the world, automatically routing traffic to the instances that are closest to the user.

{{site.data.alerts.callout_danger}}
When using TCP Proxy Load Balancing, you cannot use firewall rules to control access to the load balancer. If you need such control, consider using [Network TCP Load Balancing](https://cloud.google.com/compute/docs/load-balancing/network/) instead, but note that it cannot be used across regions. You might also consider using the HAProxy load balancer (see the [On-Premises](deploy-cockroachdb-on-premises-insecure.html) tutorial for guidance).
{{site.data.alerts.end}}

To use GCE's TCP Proxy Load Balancing service:

1. For each zone in which you're running an instance, [create a distinct instance group](https://cloud.google.com/compute/docs/instance-groups/creating-groups-of-unmanaged-instances).
    - To ensure that the load balancer knows where to direct traffic, specify a port name mapping, with `tcp26257` as the **Port name** and `26257` as the **Port number**.
2. [Add the relevant instances to each instance group](https://cloud.google.com/compute/docs/instance-groups/creating-groups-of-unmanaged-instances#addinstances).
3. [Configure Proxy Load Balancing](https://cloud.google.com/load-balancing/docs/tcp/setting-up-tcp#configure_load_balancer).
    - During backend configuration, create a health check, setting the **Protocol** to `HTTP`, the **Port** to `8080`, and the **Request path** to path `/health?ready=1`. This [health endpoint](monitoring-and-alerting.html#health-ready-1) ensures that load balancers do not direct traffic to nodes that are live but not ready to receive requests.
        - If you want to maintain long-lived SQL connections that may be idle for more than tens of seconds, increase the backend timeout setting accordingly.
    - During frontend configuration, reserve a static IP address and choose a port. Note this address/port combination, as you'll use it for all of you client connections.
4. [Create a firewall rule](https://cloud.google.com/load-balancing/docs/tcp/setting-up-tcp#config-hc-firewall) to allow traffic from the load balancer and health checker to your instances. This is necessary because TCP Proxy Load Balancing is implemented at the edge of the Google Cloud.
    - Be sure to set **Source IP ranges** to `130.211.0.0/22` and `35.191.0.0/16` and set **Target tags** to `cockroachdb` (not to the value specified in the linked instructions).

## Step 5. Start nodes

{{site.data.alerts.callout_info}}
By default, inter-node communication uses the internal IP addresses of your GCE instances.
{{site.data.alerts.end}}

{% include {{ page.version.version }}/prod-deployment/insecure-start-nodes.md %}

## Step 6. Initialize the cluster

{% include {{ page.version.version }}/prod-deployment/insecure-initialize-cluster.md %}

## Step 7. Test the cluster

{% include {{ page.version.version }}/prod-deployment/insecure-test-cluster.md %}

## Step 8. Run a sample workload

{% include {{ page.version.version }}/prod-deployment/insecure-test-load-balancing.md %}

## Step 9. Monitor the cluster

{% include {{ page.version.version }}/prod-deployment/monitor-cluster.md %}

## Step 10. Scale the cluster

{% include {{ page.version.version }}/prod-deployment/insecure-scale-cluster.md %}

## Step 11. Use the cluster

Now that your deployment is working, you can:

1. [Implement your data model](sql-statements.html).
2. [Create users](create-user.html) and [grant them privileges](grant.html).
3. [Connect your application](install-client-drivers.html). Be sure to connect your application to the GCE load balancer, not to a CockroachDB node.

## See also

{% include {{ page.version.version }}/prod-deployment/prod-see-also.md %}
