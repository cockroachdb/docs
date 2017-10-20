---
title: Deploy CockroachDB on Microsoft Azure
summary: Learn how to deploy CockroachDB on Microsoft Azure.
toc: false
toc_not_nested: true
ssh-link: https://docs.microsoft.com/en-us/azure/virtual-machines/linux/mac-create-ssh-keys
---

<div class="filters filters-big clearfix">
  <button class="filter-button current"><strong>Secure</strong></button>
  <a href="deploy-cockroachdb-on-microsoft-azure-insecure.html"><button class="filter-button">Insecure</button></a>
</div>

This page shows you how to manually deploy a secure multi-node CockroachDB cluster on Microsoft Azure, using Azure's managed load balancing service to distribute client traffic.

If you are only testing CockroachDB, or you are not concerned with protecting network communication with TLS encryption, you can use an insecure cluster instead. Select **Insecure** above for instructions.

<div id="toc"></div>

## Requirements

{% include prod_deployment/secure-requirements.md %}

## Recommendations

{% include prod_deployment/secure-recommendations.md %}

## Step 1. Configure your network

CockroachDB requires TCP communication on two ports:

- **26257** (`tcp:26257`) for inter-node communication (i.e., working as a cluster), for applications to connect to the load balancer, and for routing from the load balancer to nodes
- **8080** (`tcp:8080`) for exposing your Admin UI

To enable this in Azure, you must create a Resource Group, Virtual Network, and Network Security Group.

1. [Create a Resource Group](https://azure.microsoft.com/en-us/updates/create-empty-resource-groups/).
2. [Create a Virtual Network](https://docs.microsoft.com/en-us/azure/virtual-network/virtual-networks-create-vnet-arm-pportal) that uses your **Resource Group**.
3. [Create a Network Security Group](https://docs.microsoft.com/en-us/azure/virtual-network/virtual-networks-create-nsg-arm-pportal) that uses your **Resource Group**, and then add the following rules to it:
    - **Admin UI support**:

        | Field | Recommended Value |
        |-------|-------------------|
        | Name | **cockroachadmin** |
        | Priority | Any value > 1000 |
        | Source | **CIDR block** |
        | IP address range | Your local network’s IP ranges |
        | Service | **Custom** |
        | Protocol | **TCP** |
        | Port range | **8080** |
        | Action | **Allow** |
    - **Application support:**

        {{site.data.alerts.callout_success}}If your application is also hosted on the same Azure     Virtual Network, you won't need to create a firewall rule for your application to communicate     with your load balancer.{{site.data.alerts.end}}

        | Field | Recommended Value |
        |-------|-------------------|
        | Name | **cockroachapp** |
        | Priority | Any value > 1000 |
        | Source | **CIDR block** |
        | IP address range | Your application’s IP ranges |
        | Service | **Custom** |
        | Protocol | **TCP** |
        | Port range | **26257** |
        | Action | **Allow** |

## Step 2. Create VMs

[Create Linux VMs](https://docs.microsoft.com/en-us/azure/virtual-machines/virtual-machines-linux-quick-create-portal) for each node you plan to have in your cluster. We [recommend](recommended-production-settings.html#cluster-topology):

- Running at least 3 nodes to ensure survivability.
- Selecting the same continent for all of your VMs for best performance.

When creating the VMs, make sure to select the **Resource Group**, **Virtual Network**, and **Network Security Group** you created.

## Step 3. Set up load balancing

Each CockroachDB node is an equally suitable SQL gateway to your cluster, but to ensure client performance and reliability, it's important to use TCP load balancing:

- **Performance:** Load balancers spread client traffic across nodes. This prevents any one node from being overwhelmed by requests and improves overall cluster performance (queries per second).

- **Reliability:** Load balancers decouple client health from the health of a single CockroachDB node. In cases where a node fails, the load balancer redirects client traffic to available nodes.

Microsoft Azure offers fully-managed load balancing to distribute traffic between instances.

1.  [Add Azure load balancing](https://docs.microsoft.com/en-us/azure/load-balancer/load-balancer-overview). Be sure to:
  - Set forwarding rules to route TCP traffic from the load balancer's port **26257** to port **26257** on the node Droplets.
  - Configure health checks to use HTTP port **8080** and path `/health`.

2.  Note the provisioned **IP Address** for the load balancer. You'll use this later to test load balancing and to connect your application to the cluster.

{{site.data.alerts.callout_info}}If you would prefer to use HAProxy instead of Azure's managed load balancing, see <a href="manual-deployment.html">Manual Deployment</a> for guidance.{{site.data.alerts.end}}

## Step 4. Generate certificates

{% include prod_deployment/secure-generate-certificates.md %}

## Step 5. Start nodes

{% include prod_deployment/secure-start-nodes.md %}

## Step 6. Initialize the cluster

{% include prod_deployment/secure-initialize-cluster.md %}

## Step 7. Test the cluster

{% include prod_deployment/secure-test-cluster.md %}

## Step 8. Test load balancing

{% include prod_deployment/secure-test-load-balancing.md %}

## Step 9. Use the database

{% include prod_deployment/use-cluster.md %}

## Step 10. Monitor the cluster

{% include prod_deployment/secure-monitor-cluster.md %}

## Step 11. Scale the cluster

{% include prod_deployment/secure-scale-cluster.md %}

## See Also

- [GCE Deployment](deploy-cockroachdb-on-google-cloud-platform.html)
- [Digital Ocean Deployment](deploy-cockroachdb-on-digital-ocean.html)
- [AWS Deployment](deploy-cockroachdb-on-aws.html)
- [Manual Deployment](manual-deployment.html)
- [Orchestration](orchestration.html)
