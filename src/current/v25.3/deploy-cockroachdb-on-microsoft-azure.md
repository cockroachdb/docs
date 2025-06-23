---
title: Deploy CockroachDB on Microsoft Azure
summary: Learn how to deploy CockroachDB on Microsoft Azure.
toc: true
toc_not_nested: true
ssh-link: https://docs.microsoft.com/azure/virtual-machines/linux/mac-create-ssh-keys
docs_area:
---

{% include {{ page.version.version }}/filter-tabs/deploy-crdb-ma.md %}

This page shows you how to manually deploy a secure multi-node CockroachDB cluster on Microsoft Azure, using Azure's managed load balancing service to distribute client traffic.

If you are only testing CockroachDB, or you are not concerned with protecting network communication with TLS encryption, you can use an insecure cluster instead. Select **Insecure** above for instructions.

{% include cockroachcloud/use-cockroachcloud-instead.md %}

## Before you begin

### Requirements

{% include {{ page.version.version }}/prod-deployment/secure-requirements.md %}

### Recommendations

{% include {{ page.version.version }}/prod-deployment/secure-recommendations.md %}

## Step 1. Configure your network

CockroachDB requires TCP communication on two ports:

- **26257** (`tcp:26257`) for inter-node communication (i.e., working as a cluster), for applications to connect to the load balancer, and for routing from the load balancer to nodes
- **8080** (`tcp:8080`) for exposing your DB Console

To enable this in Azure, you must create a Resource Group, Virtual Network, and Network Security Group.

1. [Create a Resource Group](https://azure.microsoft.com/updates/create-empty-resource-groups/).
1. [Create a Virtual Network](https://docs.microsoft.com/azure/virtual-network/virtual-networks-create-vnet-arm-pportal) that uses your **Resource Group**.
1. [Create a Network Security Group](https://docs.microsoft.com/azure/virtual-network/virtual-networks-create-nsg-arm-pportal) that uses your **Resource Group**, and then add the following **inbound** rules to it:
    - **DB Console support**:

         Field | Recommended Value
        -------|-------------------
         Name | **cockroachadmin**
         Source | **IP Addresses**
         Source IP addresses/CIDR ranges | Your local network’s IP ranges
         Source port ranges | *
         Destination | **Any**
         Destination port range | **8080**
         Protocol | **TCP**
         Action | **Allow**
         Priority | Any value > 1000
    - **Application support**:

        {{site.data.alerts.callout_success}}If your application is also hosted on the same Azure     Virtual Network, you will not need to create a firewall rule for your application to communicate     with your load balancer.{{site.data.alerts.end}}

         Field | Recommended Value
        -------|-------------------
         Name | **cockroachapp**
         Source | **IP Addresses**
         Source IP addresses/CIDR ranges | Your local network’s IP ranges
         Source port ranges | *
         Destination | **Any**
         Destination port range | **26257**
         Protocol | **TCP**
         Action | **Allow**
         Priority | Any value > 1000

## Step 2. Create VMs

[Create Linux VMs](https://docs.microsoft.com/azure/virtual-machine-scale-sets/quick-create-portal) for each node you plan to have in your cluster. If you plan to run a sample workload against the cluster, create a separate VM for that workload.

- Run at least 3 nodes to [ensure survivability]({% link {{ page.version.version }}/recommended-production-settings.md %}#topology).

{% include {{ page.version.version }}/prod-deployment/recommended-instances-azure.md %}

- When creating the VMs, make sure to select the **Resource Group**, **Virtual Network**, and **Network Security Group** you created.

For more details, see [Hardware Recommendations]({% link {{ page.version.version }}/recommended-production-settings.md %}#hardware) and [Cluster Topology]({% link {{ page.version.version }}/recommended-production-settings.md %}#topology).

## Step 3. Synchronize clocks

{% include {{ page.version.version }}/prod-deployment/synchronize-clocks.md %}

## Step 4. Set up load balancing

Each CockroachDB node is an equally suitable SQL gateway to your cluster, but to ensure client performance and reliability, it's important to use load balancing:

- **Performance:** Load balancers spread client traffic across nodes. This prevents any one node from being overwhelmed by requests and improves overall cluster performance (queries per second).

- **Reliability:** Load balancers decouple client health from the health of a single CockroachDB node. In cases where a node fails, the load balancer redirects client traffic to available nodes.

Microsoft Azure offers fully-managed load balancing to distribute traffic between instances.

1.  [Add Azure load balancing](https://docs.microsoft.com/azure/load-balancer/load-balancer-overview). Be sure to:
  - Set forwarding rules to route TCP traffic from the load balancer's port **26257** to port **26257** on the nodes.
  - Configure health checks to use HTTP port **8080** and path `/health?ready=1`. This [health endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#health-ready-1) ensures that load balancers do not direct traffic to nodes that are live but not ready to receive requests.

1.  Note the provisioned **IP Address** for the load balancer. You'll use this later to test load balancing and to connect your application to the cluster.

{{site.data.alerts.callout_info}}If you would prefer to use HAProxy instead of Azure's managed load balancing, see the <a href="deploy-cockroachdb-on-premises.html">On-Premises</a> tutorial for guidance.{{site.data.alerts.end}}

## Step 5. Generate certificates

{% include {{ page.version.version }}/prod-deployment/secure-generate-certificates.md %}

## Step 6. Start nodes

{% include {{ page.version.version }}/prod-deployment/secure-start-nodes.md %}

## Step 7. Initialize the cluster

{% include {{ page.version.version }}/prod-deployment/secure-initialize-cluster.md %}

## Step 8. Test the cluster

{% include {{ page.version.version }}/prod-deployment/secure-test-cluster.md %}

## Step 9. Run a sample workload

{% include {{ page.version.version }}/prod-deployment/secure-test-load-balancing.md %}

## Step 10. Monitor the cluster

{% include {{ page.version.version }}/prod-deployment/monitor-cluster.md %}

## Step 11. Scale the cluster

{% include {{ page.version.version }}/prod-deployment/secure-scale-cluster.md %}

## Step 12. Use the database

{% include {{ page.version.version }}/prod-deployment/use-cluster.md %}

## See also

{% include {{ page.version.version }}/prod-deployment/prod-see-also.md %}
