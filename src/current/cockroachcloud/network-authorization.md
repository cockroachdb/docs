---
title: Network Authorization for CockroachDB Cloud
summary: Learn about the network authorization features for CockroachDB Cloud.
toc: true
docs_area: manage
---

To prevent denial-of-service attacks, brute force password attacks, and other forms of malicious activity, Cockroach Labs recommends restricting your network to allow access only from specific IP address ranges controlled by your organization. These might include specific networks for your application deployments, hardened administrator access points, or disaster recovery pipelines.

This page describes these options and how they help to protect clusters in CockroachDB {{ site.data.products.cloud }}.

## Options for controlling network access

You can authorize network access to your cluster by:

- [Adding an authorized range of public IP addresses](#ip-allowlisting).
- Setting up private connectivity so that inbound connections to your cluster from your cloud tenant are made over the cloud provider's private network rather than over the public internet, for enhanced network security and reduced network latency. Available for CockroachDB {{ site.data.products.advanced }} and CockroachDB {{ site.data.products.standard }}. If you use IP allowlisting rules together with private connectivity, private networks do not need to be added to that allowlist.

    - <a id="gcp-private-service-connect"></a><a id="gcp-vpc-peering"></a><a id="vpc-peering"></a>CockroachDB {{ site.data.products.advanced }} or {{ site.data.products.standard }} clusters deployed on GCP can connect privately using GCP Private Service Connect (PSC) or GCP VPC peering. PSC allows you to connect your cluster directly to a VPC within your Google Cloud project, while VPC Peering allows you to peer your cluster's VPC in CockroachDB {{ site.data.products.cloud }} to a VPC within your Google Cloud project.
    - <a id="aws-privatelink"></a>CockroachDB {{ site.data.products.advanced }} or {{ site.data.products.standard }} clusters deployed on AWS can connect privately using AWS PrivateLink, which allows you to connect your cluster to a VPC within your AWS account.
    - <a id="azure-private-link"></a>CockroachDB {{ site.data.products.advanced }} clusters deployed on Azure can connect privately using Azure Private Link, which allows you to connect your cluster to a virtual network within your Azure tenant.

    For detailed instructions, refer to [Establish private connectivity]({% link cockroachcloud/connect-to-your-cluster.md %}#establish-private-connectivity).


{{site.data.alerts.callout_info}}
{% include cockroachcloud/cdc/kafka-vpc-limitation.md %}
{{site.data.alerts.end}}

**Prerequisite**: {% include cockroachcloud/cluster-operator-prereq.md %}

Use private connectivity if:

- You need to allowlist more defined IP address ranges than the [default maximum](#ip-allowlisting).
- Your servers’ IP addresses are not static.
- You have a requirement to avoid exposing your cluster to the public internet.

Learn more about [Private Clusters (Preview)]({% link cockroachcloud/private-clusters.md %}), which offer enhanced cluster security. A private cluster's nodes have no public IP addresses.

{{site.data.alerts.callout_info}}
Neither Azure Private Link nor private clusters are available for [CockroachDB {{ site.data.products.advanced }} on Azure]({% link cockroachcloud/cockroachdb-advanced-on-azure.md %}).
{{site.data.alerts.end}}

## Cluster default network configuration

CockroachDB {{ site.data.products.advanced }} clusters differ from CockroachDB {{ site.data.products.standard }} clusters in their default network configuration:

- On creation, a CockroachDB {{ site.data.products.standard }} cluster is open to all traffic as it is created with a `0.0.0.0/0` IP allowlist entry.
- On creation, a CockroachDB {{ site.data.products.advanced }} cluster is "locked down" and has no access until an authorized network is created.

CockroachDB {{ site.data.products.cloud }} clusters can accept SQL connections only from [allowed IP addresses](#ip-allowlisting).

## IP allowlisting

Authorized network access can be managed from the CockroachDB {{ site.data.products.cloud }} console Network Authorization page at:

`https://cockroachlabs.cloud/cluster/{ your cluster UUID}/networking`

{{ site.data.products.standard }} and {{ site.data.products.advanced }} clusters support different maximum numbers of IP allowlist rules:

Cluster Type                | IP allowlist rule max
----------------------------|------------
Advanced (AWS)              | 20
Advanced (GCP and Azure)    | 200
Standard or Basic           | 50

If you need to add more than the maximum number of allowlist rules, [contact Support](https://support.cockroachlabs.com).

{{site.data.alerts.callout_info}}
While developing and testing your application, you may add `0.0.0.0/0` to the allowlist, which allows all networks. However, before moving into production, it is recommenced that you remove the `0.0.0.0/0` network from the allowlist.
{{site.data.alerts.end}}

If your application servers’ IP addresses are not static, or you want to limit your cluster's exposure to the public network, you can connect to a CockroachDB {{ site.data.products.advanced }} cluster privately instead.

Refer to:

- [Connect to a CockroachDB {{ site.data.products.basic }} Cluster: Authorize your network]({% link cockroachcloud/connect-to-a-basic-cluster.md %}#authorize-your-network).
- - [Connect to a CockroachDB {{ site.data.products.standard }} Cluster: Authorize your network]({% link cockroachcloud/connect-to-your-cluster.md %}#authorize-your-network).
- [Connect to a CockroachDB {{ site.data.products.advanced }} Cluster: Authorize your network]({% link cockroachcloud/connect-to-an-advanced-cluster.md %}#authorize-your-network).

## DB Console

The DB Console provides details about a CockroachDB {{ site.data.products.advanced }} cluster's configuration, and helps you optimize cluster performance. The DB Console is not available on CockroachDB {{ site.data.products.standard }} or {{ site.data.products.basic }}.

{{site.data.alerts.callout_info}}
Users must have the Cluster Developer, Cluster Operator, Cluster Admin, or Cluster Creator on a specific cluster role to access its DB Console.
Refer to [Organization user roles]({% link cockroachcloud/authorization.md %}#organization-user-roles)
{{site.data.alerts.end}}

For information on functionality, refer to: [DB Console Overview]({% link {{site.current_cloud_version}}/ui-overview.md %}).

To access the DB Console, you must first authorize your current IP address:

1. Visit your cluster's IP allowlist page:

    {% include_cached copy-clipboard.html %}
    ~~~txt
    https://cockroachlabs.cloud/cluster/{ your cluster UUID }/networking/allowlist
    ~~~

1. Click **Add Network**.

1. Add your **Current Network**:

    1. Give it a **Name** indicating its use for DB Console access from your current location.

    1.  Under **Allow this network to access**, select **DB Console to monitor the cluster**.

    1. Click **Apply**.

{{site.data.alerts.callout_danger}}
When you have finished your work with the DB Console, it is recommended to remove your authorized network from the allowlist, in the interest of the general best practice of restricting network access as much as possible.

Remove an authorized network by selecting **Delete** from the **Action** dropdown its row on the the cluster's **Networking** page.
{{site.data.alerts.end}}

To access your cluster's DB Console:

1. Navigate to your CockroachDB {{ site.data.products.advanced }} cluster's [**Tools** page]({% link cockroachcloud/tools-page.md %}) in the **Monitoring** section of the CockroachDB {{ site.data.products.cloud }} Console.

1. Click **Open DB Console**. Your browser will attempt to access the DB console in a new tab.

  You can also access the DB Console by navigating to `https://admin-{cluster-name}.crdb.io:8080/#/metrics/overview/cluster`. Replace the `{cluster-name}` placeholder with the name of your cluster.

(Optional) To find the IP addresses for your cluster's DB Console, perform DNS lookup on the DB Console URL that opens in the browser. These IP addresses are static for the lifecycle of the cluster. For example, to use the `dig` command:

{% include_cached copy-clipboard.html %}
~~~shell
dig examplary-advanced-clusterberry-77tq.cockroachlabs.cloud | grep -A3 'ANSWER SECTION'
~~~

~~~txt
;; ANSWER SECTION:
examplary-advanced-clusterberry-77tq.cockroachlabs.cloud. 300 IN A 35.245.55.160
examplary-advanced-clusterberry-77tq.cockroachlabs.cloud. 300 IN A 34.129.61.133
examplary-advanced-clusterberry-77tq.cockroachlabs.cloud. 300 IN A 34.117.21.266
~~~
