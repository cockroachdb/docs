---
title: Network Authorization
summary: Learn about the network authorization features for CockroachCloud CockroachDB clusters.
toc: true
---

To prevent denial-of-service and brute force password attacks, CockroachCloud requires you to authorize networks that can access your cluster by [allowlisting the public IP addresses](#ip-allowlisting) for your application. Optionally, you can [set up Virtual Private Cloud (VPC) peering](#vpc-peering) or [AWS PrivateLink](#aws-privatelink) for your cluster for enhanced network security and lower network latency.

## IP allowlisting

Authorize your application server’s network and your local machine’s network by [adding their public IP addresses (in the CIDR format) to the CockroachCloud cluster's allowlist](connect-to-your-cluster.html#step-1-authorize-your-network). If you change your location, you will need to authorize the new location’s network, else the connection from that network will be rejected.

- In a development environment, you need to authorize your application server’s network and your local machine’s network. If you change your location, you need to authorize the new location’s network, or else the connection from that network will be rejected.
- In a production environment, you need to authorize your application server’s network.

{{site.data.alerts.callout_info}}
While developing and testing your application, you may add `0.0.0.0/0` to the allowlist, which allows all networks. However, before moving into production, make sure you delete the `0.0.0.0/0` network.
{{site.data.alerts.end}}

If your application servers’ IP addresses are not static or you want to limit your cluster's exposure to the public network, you can connect to your CockroachCloud clusters using VPC Peering or AWS PrivateLink instead.

## VPC peering

If you select GCP as your cloud provider while [creating your CockroachCloud cluster](create-your-cluster.html), you can use [Google Cloud's VPC Network Peering](https://cloud.google.com/vpc/docs/vpc-peering) feature to connect your GCP application directly to your CockroachCloud cluster using internal IP addresses, thus limiting exposure to the public network and reducing network latency.

Setting up a VPC peering connection between your CockroachCloud cluster and GCP application is a two-part process:

1. [Configure the IP range and size while creating the CockroachCloud cluster](#configure-the-ip-range-and-size-while-creating-your-cockroachcloud-cluster)
1. [Configure a peering connection after creating the cluster](#establish-a-vpc-peering-connection-after-creating-your-cockroachcloud-cluster)

{{site.data.alerts.callout_info}}
Self-service VPC peering setup is available only while creating a new CockroachCloud cluster. To set up VPC peering for existing clusters, [contact us](https://support.cockroachlabs.com/hc/en-us/requests/new).
{{site.data.alerts.end}}

### Configure the IP range and size while creating your CockroachCloud cluster

While creating your CockroachCloud cluster, [enable VPC peering](create-your-cluster.html) and configure the IP address range and size (in CIDR format) for the CockroachCloud network based on the following considerations:

-  To adhere to [GCP's overlapping subnets restriction](https://cloud.google.com/vpc/docs/vpc-peering#restrictions), configure an IP range that doesn't overlap with the IP ranges in your application network.
- The IP range and size cannot be changed after the cluster is created. Configuring a smaller IP range size may limit your ability to expand into multiple regions in the future. We recommend configuring an IP range size of `/16` or lower.

Alternatively, you can use CockroachCloud's default IP range and size (`172.28.0.0/14`) as long as it doesn't overlap with the IP ranges in your network.

### Establish a VPC Peering connection after creating your CockroachCloud cluster

After creating your CockroachCloud cluster, [request a peering connection](connect-to-your-cluster.html#establish-a-vpc-peering-connection) from CockroachCloud's **Networking** page. Then accept the request by running the `gcloud` command displayed your screen. You can check the status of the connection on the **Peering** tab on the **Networking** page. The status is shown as `PENDING` until you accept the connection request from the GCP side. After the connection is successfully established, the status changes to `ACTIVE`. You can then [select a connection method](connect-to-your-cluster.html#step-3-select-a-connection-method) and [connect to your cluster](connect-to-your-cluster.html#step-4-connect-to-your-cluster).

## AWS PrivateLink

If your cloud provider is AWS, you can use [AWS PrivateLink](https://aws.amazon.com/privatelink/) to securely connect your AWS application with your CockroachCloud cluster using a private endpoint. Like VPC Peering, a PrivateLink connection will prevent your traffic from being exposed to the public internet and reduce network latency.

There are four steps to setting up an AWS PrivateLink connection between your CockroachCloud cluster and AWS application:

1.  [Set up a cluster](#set-up-a-cluster)
1.  [Create an AWS endpoint](#create-an-aws-endpoint)
1.  [Verify the endpoint ID](#verify-the-endpoint-id)
1.  [Enable private DNS](#enable-private-dns)

### Set up a cluster

1. Use the CockroachCloud Console to [create your CockroachCloud cluster](https://www.cockroachlabs.com/docs/cockroachcloud/stable/cockroachcloud-create-your-cluster.html) on AWS in the same region as your application. 
1. Navigate to the **Networking** page.
1. Select the **PrivateLink** tab. 
1. Click **Set up a PrivateLink connection** to open the connection modal.

### Create an AWS endpoint

1. On the [Amazon VPC Console](https://console.aws.amazon.com/vpc/), click **Your VPCs** in the sidebar. 
1. Locate the VPC ID of the VPC you want to create your endpoint in.

    This will probably be the same VPC as the VPC your EC2 instances and application are running in. You can also choose a different VPC, as long as it is peered to the VPC your application is running in.
    
1. On the **Your VPCs** page, locate the IPv4 CIDR corresponding to the VPC you chose in Step 1.
1. Navigate to the **Subnets** page. 
1. Locate the subnet IDs corresponding to the VPC you chose in Step 1.
1. Click **Security Groups** in the sidebar. 
1. Click **Create Security Group** to create a security group within your VPC that allows inbound access from your EC2 instances on Port 26257:
  - In the **Security group name** field, enter a descriptive name for the security group. 
  - From the **VPC** dropdown, select the VPC you chose in Step 1.
  - In the **Inbound rules** section, click **Add rule**. Enter *26257* in the **Port Range** field. In the Source field, enter the CIDR range from Step 3. 
  - Click Create security group.
  - Substitute the values from Steps 2 and 3 and run the following AWS CLI command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ aws ec2 create-vpc-endpoint --region $REGION \
    --vpc-id $VPC_ID --subnet-ids $SUBNET_ID1 $SUBNET_ID2 \ 
    --vpc-endpoint-type Interface --security-group-ids \
    $SECURITY_GROUP_ID1 $SECURITY_GROUP_ID2 --service-name \
    $SERVICE_NAME_PROVIDED_BY_COCKROACH
    ~~~


Alternatively, use the AWS Console to create the endpoint:

1.  On the VPC Dashboard, click **Endpoints** from the sidebar.
1.  Click **Create Endpoint**.
1.  On the **Create Endpoint** page, for the **Service Category** field, select **Find Service by name**.
1.  In the **Service Name** field, enter the service name copied from Step 1 in the CockroachCloud Console.
1.  Click **Verify**.
1.  In the **VPC** field, enter the ID of the VPC you want to create your endpoint in. 
1.  Verify that the subnets are pre-populated.
1.  In the **Security group** section, select the security group you created in Step 4 and uncheck the box for **default** security group. 
1.  Click **Create Endpoint**.

    The VPC Endpoint ID displays.  
    
1.  Copy the Endpoint ID to your clipboard and return to CockroachCloud's **Add PrivateLink** modal.

### Verify the endpoint ID

CockroachCloud will accept the endpoint request. You can verify the request acceptance by checking if the status is listed as Available on the **Endpoints** page.

### Enable private DNS

After the status changes to Available, run the following AWS CLI command:

{% include copy-clipboard.html %}
~~~ shell
$ aws ec2 modify-vpc-endpoint --region $REGION \
--private-dns-enabled --vpc-endpoint-id $VPC_ENDPOINT_ID
~~~

Alternatively, use the AWS Console to modify the Private DNS Name:

1.  On the **Endpoints** page, click **Actions**.
1.  Click **Modify Private DNS Names**.
1.  Check the **Enable Private DNS Name** checkbox.
1.  Click **Modify Private DNS Name**.

The endpoint status will change to Pending.
  
After a short (less than 5 minute) delay, the status changes to Available. You can now [connect to your cluster](connect-to-your-cluster.html).

## See also

- [Client Connection Parameters](../stable/connection-parameters.html)
- [Connect to Your CockroachCloud Cluster](connect-to-your-cluster.html)
