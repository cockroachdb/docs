---
title: Deploy CockroachDB on Digital Ocean (Insecure)
summary: Learn how to deploy CockroachDB on Digital Ocean.
toc: true
toc_not_nested: true
ssh-link: https://www.digitalocean.com/community/tutorials/how-to-connect-to-your-droplet-with-ssh
---

<div class="filters filters-big clearfix">
  <a href="deploy-cockroachdb-on-digital-ocean.html"><button class="filter-button">Secure</button>
  <button class="filter-button current"><strong>Insecure</strong></button></a>
</div>

This page shows you how to deploy an insecure multi-node CockroachDB cluster on Digital Ocean, using Digital Ocean's managed load balancing service to distribute client traffic.

{% include {{ page.version.version }}/prod-deployment/insecure-flag.md %}

{% include cockroachcloud/use-cockroachcloud-instead.md %}

## Before you begin

### Requirements

{% include {{ page.version.version }}/prod-deployment/insecure-requirements.md %}

### Recommendations

{% include {{ page.version.version }}/prod-deployment/insecure-recommendations.md %}

- If all of your CockroachDB nodes and clients will run on Droplets in a single region, consider using [private networking](https://www.digitalocean.com/community/tutorials/how-to-set-up-and-use-digitalocean-private-networking).

## Step 1. Create Droplets

[Create Droplets](https://www.digitalocean.com/community/tutorials/how-to-create-your-first-digitalocean-droplet) for each node you plan to have in your cluster. If you plan to run a sample workload against the cluster, create a separate droplet for that workload.

- Run at least 3 nodes to [ensure survivability](recommended-production-settings.html#topology).

- Use any [droplets](https://www.digitalocean.com/pricing/) except standard droplets with only 1 GB of RAM, which is below our minimum requirement. All Digital Ocean droplets use SSD storage.

For more details, see [Hardware Recommendations](recommended-production-settings.html#hardware) and [Cluster Topology](recommended-production-settings.html#topology).

## Step 2. Synchronize clocks

{% include {{ page.version.version }}/prod-deployment/synchronize-clocks.md %}

## Step 3. Set up load balancing

Each CockroachDB node is an equally suitable SQL gateway to your cluster, but to ensure client performance and reliability, it's important to use load balancing:

- **Performance:** Load balancers spread client traffic across nodes. This prevents any one node from being overwhelmed by requests and improves overall cluster performance (queries per second).

- **Reliability:** Load balancers decouple client health from the health of a single CockroachDB node. In cases where a node fails, the load balancer redirects client traffic to available nodes.

Digital Ocean offers fully-managed load balancers to distribute traffic between Droplets.

1. [Create a Digital Ocean Load Balancer](https://www.digitalocean.com/community/tutorials/an-introduction-to-digitalocean-load-balancers). Be sure to:
	- Set forwarding rules to route TCP traffic from the load balancer's port **26257** to port **26257** on the node Droplets.
	- Configure health checks to use HTTP port **8080** and path `/health?ready=1`. This [health endpoint](monitoring-and-alerting.html#health-ready-1) ensures that load balancers do not direct traffic to nodes that are live but not ready to receive requests.
2. Note the provisioned **IP Address** for the load balancer. You'll use this later to test load balancing and to connect your application to the cluster.

{{site.data.alerts.callout_info}}If you would prefer to use HAProxy instead of Digital Ocean's managed load balancing, see the <a href="deploy-cockroachdb-on-premises-insecure.html">On-Premises</a> tutorial for guidance.{{site.data.alerts.end}}

## Step 4. Configure your network

Set up a firewall for each of your Droplets, allowing TCP communication on the following two ports:

- **26257** (`tcp:26257`) for inter-node communication (i.e., working as a cluster), for applications to connect to the load balancer, and for routing from the load balancer to nodes
- **8080** (`tcp:8080`) for exposing your DB Console

For guidance, you can use Digital Ocean's guide to configuring firewalls based on the Droplet's OS:

- Ubuntu and Debian can use [`ufw`](https://www.digitalocean.com/community/tutorials/how-to-setup-a-firewall-with-ufw-on-an-ubuntu-and-debian-cloud-server).
- FreeBSD can use [`ipfw`](https://www.digitalocean.com/community/tutorials/recommended-steps-for-new-freebsd-10-1-servers).
- Fedora can use [`iptables`](https://www.digitalocean.com/community/tutorials/initial-setup-of-a-fedora-22-server).
- CoreOS can use [`iptables`](https://www.digitalocean.com/community/tutorials/how-to-secure-your-coreos-cluster-with-tls-ssl-and-firewall-rules).
- CentOS can use [`firewalld`](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-using-firewalld-on-centos-7).

## Step 5. Start nodes

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
2. [Create users](create-and-manage-users.html) and [grant them privileges](grant.html).
3. [Connect your application](install-client-drivers.html). Be sure to connect your application to the Digital Ocean Load Balancer, not to a CockroachDB node.

## See also

{% include {{ page.version.version }}/prod-deployment/prod-see-also.md %}
