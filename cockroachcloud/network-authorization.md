---
title: Network Authorization
summary: Learn about the network authorization features for {{ site.data.products.db }} clusters.
toc: true
docs_area: manage
---

To prevent denial-of-service and brute force password attacks, {{ site.data.products.dedicated }} requires you to authorize networks that can access your cluster by [allowlisting the public IP addresses](#ip-allowlisting) for your application. Optionally, you can [set up Virtual Private Cloud (VPC) peering](#vpc-peering) or [AWS PrivateLink](#aws-privatelink) for your cluster for enhanced network security and lower network latency.

{{site.data.alerts.callout_success}}
For additional cluster security, you can learn more about [Private Clusters (Preview)](private-clusters.html). A private cluster's nodes have no public IP addresses.
{{site.data.alerts.end}}

## IP allowlisting

Authorize your application server’s network and your local machine’s network by [adding their public IP addresses (in the CIDR format) to the {{ site.data.products.dedicated }} cluster's allowlist](connect-to-your-cluster.html#step-1-authorize-your-network). If you change your location, you will need to authorize the new location’s network, else the connection from that network will be rejected.

- In a development environment, you need to authorize your application server’s network and your local machine’s network. If you change your location, you need to authorize the new location’s network, or else the connection from that network will be rejected.
- In a production environment, you need to authorize your application server’s network.

{{site.data.alerts.callout_info}}
While developing and testing your application, you may add `0.0.0.0/0` to the allowlist, which allows all networks. However, before moving into production, make sure you delete the `0.0.0.0/0` network.
{{site.data.alerts.end}}

You can add up to 20 IP addresses to your allowlist. If your application servers’ IP addresses are not static, or you want to limit your cluster's exposure to the public network, you can connect to your {{ site.data.products.dedicated }} clusters using VPC Peering or AWS PrivateLink instead.

## VPC peering

If you select GCP as your cloud provider while [creating your {{ site.data.products.dedicated }} cluster](create-your-cluster.html), you can use [Google Cloud's VPC Network Peering](https://cloud.google.com/vpc/docs/vpc-peering) feature to connect your GCP application directly to your {{ site.data.products.dedicated }} cluster using internal IP addresses, thus limiting exposure to the public network and reducing network latency.

GKE users should note that we recommend deploying your application to a VPC-native cluster that uses [alias IP addresses](https://cloud.google.com/kubernetes-engine/docs/how-to/alias-ips). If you are connecting from a [routes-based GKE cluster](https://cloud.google.com/kubernetes-engine/docs/how-to/routes-based-cluster) instead, you will have to [export custom routes](https://cloud.google.com/vpc/docs/vpc-peering#importing-exporting-routes). {{ site.data.products.db }} will import your custom routes by default.

Setting up a VPC peering connection between your {{ site.data.products.dedicated }} cluster and GCP application is a two-part process:

1. [Configure the IP range and size while creating the {{ site.data.products.dedicated }} cluster](create-your-cluster.html#step-7-enable-vpc-peering-optional)
1. [Establish a VPC Peering connection after creating the cluster](connect-to-your-cluster.html#establish-vpc-peering-or-aws-privatelink)

{{site.data.alerts.callout_info}}
Self-service VPC peering setup is not supported for {{ site.data.products.dedicated }} clusters deployed before March 5, 2020. If your cluster was deployed before March 5, 2020, you will have to [create a new cluster](create-your-cluster.html) with VPC peering enabled, then [export your data](backups-page.html) from the old cluster to the new cluster. If your cluster was deployed on or after March 5, 2020, it will be locked into {{ site.data.products.dedicated }}'s default IP range (`172.28.0.0/14`) unless you explicitly configured a different IP range during cluster creation.
{{site.data.alerts.end}}

## AWS PrivateLink

If your cloud provider is AWS, you can use [AWS PrivateLink](https://aws.amazon.com/privatelink/) to securely connect your AWS application with your {{ site.data.products.dedicated }} cluster using a private endpoint. Like VPC Peering, a PrivateLink connection will prevent your traffic from being exposed to the public internet and reduce network latency. If you have multiple clusters, you will have to repeat these steps for each cluster that you want to connect to using AWS PrivateLink.

There are four steps to setting up an AWS PrivateLink connection between your {{ site.data.products.dedicated }} cluster and AWS application:

1.  [Set up a cluster](#set-up-a-cluster)
1.  [Create an AWS endpoint](#create-an-aws-endpoint)
1.  [Verify the endpoint ID](#verify-the-endpoint-id)
1.  [Enable private DNS](#enable-private-dns)

### Set up a cluster

1.  Use the {{ site.data.products.db }} Console to [create your {{ site.data.products.dedicated }} cluster](create-your-cluster.html) on AWS in the same region as your application.

    {{site.data.alerts.callout_info}}
    If you have a multi-region cluster, you will have to create a PrivateLink connection for each region you are operating in.
    {{site.data.alerts.end}}

1.  Navigate to the **Networking** page.
1.  Select the **PrivateLink** tab.
1.  Click **Set up a PrivateLink connection** to open the connection modal.

### Create an AWS endpoint

1. If you have a multi-region cluster, select the region to create a connection in. Skip this step if you have a single-region cluster.
1. <a name="step-1"></a> Copy the **Service Name** shown in the connection modal.
1. On the [Amazon VPC Console](https://console.aws.amazon.com/vpc/), click **Your VPCs** in the sidebar.
1. Locate the VPC ID of the VPC you want to create your endpoint in.

    This will probably be the same VPC as the VPC your EC2 instances and application are running in. You can also choose a different VPC as long as it is peered to the VPC your application is running in.

1. On the **Your VPCs** page, locate the IPv4 CIDR corresponding to the VPC you chose in Step 4.
1. Click **Subnets** in the sidebar.
1. Locate the subnet IDs corresponding to the VPC you chose in Step 4.
1. Click **Security Groups** in the sidebar.
1. <a name="step-8"></a> Click **Create security group** to create a security group within your VPC that allows inbound access from your EC2 instances on Port 26257:
  - In the **Security group name** field, enter a name for the security group.
  - In the **Description** field, enter a description for the security group.
  - From the **VPC** dropdown, select the VPC you chose in Step 4.
  - In the **Inbound rules** section, click **Add rule**. Enter *26257* in the **Port range** field. In the **Source** field, enter the CIDR range from Step 5.
  - Click **Create security group**.

Use either the Amazon VPC Console or the [AWS Command Line Interface (CLI)](https://aws.amazon.com/cli/) to continue:

  <div class="filters clearfix">
    <button style="width: 15%" class="filter-button" data-scope="aws-console">AWS Console</button>
    <button style="width: 15%" class="filter-button" data-scope="aws-cli">AWS CLI</button>
  </div>

<section class="filter-content" markdown="1" data-scope="aws-console">

1.  Click **Endpoints** in the sidebar.
1.  Click **Create Endpoint**.
1.  On the **Create Endpoint** page, for the **Service Category** field, select **Find service by name**.
1.  In the **Service Name** field, enter the **Service Name** copied from the connection modal in [Step 1](#step-1).
1.  Click **Verify**.
1.  In the **VPC** field, enter the ID of the VPC you want to create your endpoint in.
1.  Verify that the subnets are pre-populated.
1.  In the **Security group** section, select the security group you created in [Step 8](#step-8) and uncheck the box for **default** security group.
1.  Click **Create Endpoint**.

      The VPC Endpoint ID displays.

1.  Copy the Endpoint ID to your clipboard and return to {{ site.data.products.db }}'s **Add PrivateLink** modal.

  </section>

  <section class="filter-content" markdown="1" data-scope="aws-cli">

1.  Substitute the values from the previous steps and run the following AWS CLI command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ aws ec2 create-vpc-endpoint --region $REGION \
    --vpc-id $VPC_ID --subnet-ids $SUBNET_ID1 $SUBNET_ID2 \
    --vpc-endpoint-type Interface --security-group-ids \
    $SECURITY_GROUP_ID1 $SECURITY_GROUP_ID2 --service-name \
    $SERVICE_NAME_PROVIDED_BY_COCKROACH
    ~~~

1.  Locate the VPC Endpoint ID in the CLI output.

1.  Copy the Endpoint ID to your clipboard and return to {{ site.data.products.db }}'s **Add PrivateLink** modal.

  </section>

### Verify the endpoint ID

1.  Paste the Endpoint ID you created into the **VPC Endpoint ID** field.
1.  Click **Verify**.
1.  {{ site.data.products.db }} will accept the endpoint request. You can confirm the request acceptance by checking if the status is listed as Available on the Amazon VPC Console **Endpoints** page.

### Enable private DNS

1.  On the Amazon VPC Console **Endpoints** page, select the endpoint you created.
1.  Click **Actions**.
1.  Click **Modify Private DNS Names**.
1.  Check the **Enable Private DNS Name** checkbox.
1.  Click **Modify Private DNS Name**.

Alternatively, use the AWS CLI to modify the Private DNS Name:

1.  After the endpoint status changes to Available, run the following AWS CLI command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ aws ec2 modify-vpc-endpoint --region $REGION \
    --private-dns-enabled --vpc-endpoint-id $VPC_ENDPOINT_ID
    ~~~

The endpoint status will change to Pending.

After a short (less than 5 minute) delay, the status will change to Available. You can now [connect to your cluster](connect-to-your-cluster.html).

## See also

- [Client Connection Parameters](../{{site.current_cloud_version}}/connection-parameters.html)
- [Connect to Your {{ site.data.products.dedicated }} Cluster](connect-to-your-cluster.html)
