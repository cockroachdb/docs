---
title: Managing AWS PrivateLink for a Dedicated Cluster
summary: Instructions for establishing AWS PrivateLink network access for a cluster.
toc: true
docs_area: manage
---

Amazon Web Services (AWS) PrivateLink support in {{ site.data.products.dedicated }} allows customers to establish SQL access to their clusters entirely through private AWS infrastructure, without exposure to the public internet, affording enhanced security and performance.

For broader context, refer to [Network Authorization for CockroachDB Cloud Clusters](network-authorization.html).

This page describes the steps to setting up an AWS PrivateLink connection for your {{ site.data.products.dedicated }} cluster from your AWS VPC Console.

{{site.data.alerts.callout_success}}

You must also configure the AWS PrivateLink connection from your CockroachDB cluster, to do this, refer to [Establish VPC Peering or AWS PrivateLink](connect-to-your-cluster.html#establish-gcp-vpc-peering-or-aws-privatelink).

If you have multiple clusters, you will have to repeat these steps for each cluster that you want to connect to using AWS PrivateLink.
{{site.data.alerts.end}}

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
1. On the [Amazon VPC Console](https://console.aws.amazon.com/vpc/) in your AWS account, click **Your VPCs** in the sidebar.
1. Locate the VPC ID of the VPC you want to create your endpoint in.

    This will probably be the VPC which hosts the application or source program which is supposed to access your {{ site.data.products.dedicated }} cluster. You can also choose a different VPC as long as it is peered to the VPC your application is running in and the private endpoint is configured to be DNS-accessible across the peered VPCs.

1. On the **Your VPCs** page, locate the IPv4 CIDR corresponding to the VPC you chose in Step 4.
1. Click **Subnets** in the sidebar.
1. Locate the subnet IDs corresponding to the VPC you chose in Step 4.
1. Click **Security Groups** in the sidebar.
1. <a name="step-8"></a> Click **Create security group** to create a security group within your VPC that allows inbound access from your application or source program on Port 26257:
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
1.  {{ site.data.products.db }} will accept the endpoint request. You can confirm the request acceptance by checking if the status is listed as Available on the Amazon VPC Console **Endpoints** page in your AWS account.

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

**See also**

- [Client Connection Parameters](../{{site.current_cloud_version}}/connection-parameters.html)
- [Connect to Your {{ site.data.products.dedicated }} Cluster](connect-to-your-cluster.html)
