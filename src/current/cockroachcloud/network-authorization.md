---
title: Network Authorization for CockroachDB Cloud Clusters
summary: Learn about the network authorization features for CockroachDB Cloud clusters.
toc: true
docs_area: manage
---

To prevent denial-of-service attacks, brute force password attacks, and other forms of malicious activity, Cockroach Labs recommends restricting your network to allow access only from specific IP address ranges controlled by your organization. These might include specific networks for your application deployments, hardened administrator access points, or disaster recovery pipelines.

This page describes these options and how they help to protect {{ site.data.products.dedicated }} and {{ site.data.products.serverless }} clusters.

## Options for controlling network access

You can authorize network access to your cluster by:

- [Adding an authorized range of public IP addresses](#ip-allowlisting).
- Setting up private connectivity so that inbound connections to your cluster from your cloud tenant are made the cloud provider's private network rather than the public internet, for enhanced network security and reduced network latency. If you use IP allowlisting rules together with private connectivity, private networks do not need to be added to that allowlist.

    For {{ site.data.products.dedicated }} clusters deployed on GCP, refer to [Google Cloud Platform (GCP) Virtual Private Cloud (VPC) peering](#vpc-peering). For {{ site.data.products.dedicated }} clusters or multi-region {{ site.data.products.serverless }} clusters deployed on AWS, refer to [Amazon Web Service (AWS) PrivateLink](#aws-privatelink).

**Prerequisite**: {% include cockroachcloud/cluster-operator-prereq.md %}

{{site.data.alerts.callout_success}}
Use GCP VPC Peering or AWS PrivateLink if:

- You need to allowlist more defined IP address ranges than allowed by the maximum (20 for {{ site.data.products.dedicated }} clusters and 50 for {{ site.data.products.serverless }}). For {{ site.data.products.dedicated }} clusters on AWS, reach out to your Cockroach Labs team or support to increase the limit if needed.
- Your servers’ IP addresses are not static.
- You want avoid exposing your cluster to the public internet.

Learn more about [Private Clusters (Preview)](private-clusters.html), which offer enhanced cluster security. A private cluster's nodes have no public IP addresses.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}

During [limited access](/docs/{{site.versions["stable"]}}/cockroachdb-feature-availability.html), neither Azure Private Link nor private clusters are available for {{ site.data.products.dedicated }} clusters on Azure. Refer to [{{ site.data.products.dedicated }} on Azure](cockroachdb-dedicated-on-azure.html).
{{site.data.alerts.end}}

## Cluster default network configuration

{{ site.data.products.dedicated }} and Serverless clusters differ in their default network configuration:

- On creation, a Serverless cluster is open to all traffic as it is created with a `0.0.0.0/0` IP allowlist entry.
- On creation, a Dedicated cluster is "locked down" and has no access until an authorized network is created.

{{ site.data.products.db }} clusters can only accept SQL connections from [allowed IP addresses](#ip-allowlisting).

## IP allowlisting

Authorized network access can be managed from the {{ site.data.products.db }} console Network Authorization page at:

`https://cockroachlabs.cloud/cluster/{ your cluster UUID}/networking`

Serverless and Dedicated clusters support different maximum numbers of IP allowlist rules:

Cluster Type | IP allowlist rule max
--------|------------
Dedicated|20
Serverless|50

{{site.data.alerts.callout_info}}
While developing and testing your application, you may add `0.0.0.0/0` to the allowlist, which allows all networks. However, before moving into production, make sure you delete the `0.0.0.0/0` network.
{{site.data.alerts.end}}

If your application servers’ IP addresses are not static, or you want to limit your cluster's exposure to the public network, you can connect to your {{ site.data.products.dedicated }} clusters using VPC Peering or AWS PrivateLink instead.

Refer to:

- [Connect to a {{ site.data.products.serverless }} Cluster: Authorize your network](connect-to-a-serverless-cluster.html#authorize-your-network).
- [Connect to a {{ site.data.products.dedicated }} Cluster: Authorize your network](connect-to-your-cluster.html#authorize-your-network).

## VPC peering

If you select GCP as your cloud provider while [creating your {{ site.data.products.dedicated }} cluster](create-your-cluster.html), you can use [Google Cloud's VPC Network Peering](https://cloud.google.com/vpc/docs/vpc-peering) feature to connect your GCP application directly to your {{ site.data.products.dedicated }} cluster using internal IP addresses, thus limiting exposure to the public network and reducing network latency.

GKE users should note that we recommend deploying your application to a VPC-native cluster that uses [alias IP addresses](https://cloud.google.com/kubernetes-engine/docs/how-to/alias-ips). If you are connecting from a [routes-based GKE cluster](https://cloud.google.com/kubernetes-engine/docs/how-to/routes-based-cluster) instead, you will have to [export custom routes](https://cloud.google.com/vpc/docs/vpc-peering#importing-exporting-routes). {{ site.data.products.db }} will import your custom routes by default.

Setting up a VPC peering connection between your {{ site.data.products.dedicated }} cluster and GCP application is a two-part process:

1. [Configure the IP range and size while creating the {{ site.data.products.dedicated }} cluster](create-your-cluster.html#step-7-enable-vpc-peering-optional)
1. [Establish a VPC Peering connection after creating the cluster](connect-to-your-cluster.html#establish-gcp-vpc-peering-or-aws-privatelink)

{{site.data.alerts.callout_info}}
Self-service VPC peering setup is not supported for {{ site.data.products.dedicated }} clusters deployed before March 5, 2020. If your cluster was deployed before March 5, 2020, you will have to [create a new cluster](create-your-cluster.html) with VPC peering enabled, then [export your data](use-managed-service-backups.html) from the old cluster to the new cluster. If your cluster was deployed on or after March 5, 2020, it will be locked into {{ site.data.products.dedicated }}'s default IP range (`172.28.0.0/14`) unless you explicitly configured a different IP range during cluster creation.
{{site.data.alerts.end}}

## AWS PrivateLink

If your cloud provider is AWS, you can use [AWS PrivateLink](https://aws.amazon.com/privatelink/) to securely connect your AWS application with your {{ site.data.products.dedicated }} or multi-region {{ site.data.products.serverless }} clusters using private endpoints. Like VPC Peering, a PrivateLink connection will prevent your traffic from being exposed to the public internet and reduce network latency.

Refer to:
- [Managing AWS PrivateLink for a {{ site.data.products.dedicated }} Cluster](aws-privatelink.html)
- [Managing AWS PrivateLink for a multi-region {{ site.data.products.serverless }} Cluster](aws-privatelink.html?filters=serverless)

## DB Console

The DB Console provides details about your cluster and database configuration, and helps you optimize cluster performance.

For information on functionality, refer to: [DB Console Overview](../{{site.versions["stable"]}}/ui-overview.html).

To access the DB Console, you must first authorize your current IP address:

1. Visit your Dedicated cluster's IP allowlist page:

    {% include_cached copy-clipboard.html %}
    ~~~txt
    https://cockroachlabs.io/cluster/{ your cluster UUID }/networking/allowlist
    ~~~

1. Click **Add Network**.

1. Add your **Current Network**:

    1. Give it a **Name** indicating its use for DB Console access from your current location.

    1.  Under **Allow this network to access**, select **DB Console to monitor the cluster**.

    1. Click **Apply**.

{{site.data.alerts.callout_danger}}
When you have finished your work with the DB Console, it is recommended to remove your authorized network from the allowlist, in the interest of the general best practice of restricting network access as much as possible.

Remove an authorized network by selecting **Delete** from the **Action** dropdown its row on the allowlist page.
{{site.data.alerts.end}}

To get the URL for your cluster's DB Console:

1. Visit your Dedicated cluster's monitoring page:

    {% include_cached copy-clipboard.html %}
    ~~~txt
    https://cockroachlabs.io/cluster/{ cluster ID }/monitoring
    ~~~

1. Click **Open DB Console**. Your browser will attempt to access the DB console in a new tab.

(Optional) To find the IP addresses for your cluster's DB Console, perform DNS lookup on the DB Console URL that opens in the browser. These IP addresses are static for the lifecycle of the cluster.

{% include_cached copy-clipboard.html %}
~~~shell
dig examplary-dedicated-clusterberry-77tq.cockroachlabs.cloud | grep -A3 'ANSWER SECTION'
~~~

~~~txt
;; ANSWER SECTION:
examplary-dedicated-clusterberry-77tq.cockroachlabs.cloud. 300 IN A 35.245.55.160
examplary-dedicated-clusterberry-77tq.cockroachlabs.cloud. 300 IN A 34.129.61.133
examplary-dedicated-clusterberry-77tq.cockroachlabs.cloud. 300 IN A 34.117.21.266
~~~
