---
title: Managing AWS PrivateLink for a cluster
summary: Instructions for establishing AWS PrivateLink network access for a cluster.
toc: true
docs_area: manage
---

Amazon Web Services (AWS) PrivateLink support allows customers to establish SQL access to their clusters entirely through private AWS infrastructure, without exposure to the public internet, affording enhanced security and performance. PrivateLink is supported for {{ site.data.products.dedicated }} clusters and multi-region {{ site.data.products.serverless }} clusters deployed on AWS.

For broader context, refer to [Network Authorization for {{ site.data.products.db }} Clusters](network-authorization.html).

This page describes the steps to setting up an AWS PrivateLink connection for {{ site.data.products.dedicated }} and multi-region {{ site.data.products.serverless }} clusters from your AWS VPC Console.

<div class="filters clearfix">
  <button class="filter-button" data-scope="dedicated">{{ site.data.products.dedicated }}</button>
  <button class="filter-button" data-scope="serverless">Multi-region {{ site.data.products.serverless }}</button>
</div>

<section class="filter-content" markdown="1" data-scope="dedicated">

{{site.data.alerts.callout_success}}
You must also configure the AWS PrivateLink connection for your {{ site.data.products.dedicated }} cluster using the Console UI, Cloud API or Terraform Provider, so that {{ site.data.products.db }} can accept the new connection. For help, refer to [Establish VPC Peering or AWS PrivateLink](connect-to-your-cluster.html#establish-gcp-vpc-peering-or-aws-privatelink).

If you have multiple clusters, you will have to repeat these steps for each cluster that you want to connect to using AWS PrivateLink.
{{site.data.alerts.end}}

</section>

<section class="filter-content" markdown="1" data-scope="serverless">

{{site.data.alerts.callout_success}}
For each region where you deploy {{ site.data.products.serverless }} clusters with private connections, you must also configure the AWS PrivateLink connection for {{ site.data.products.serverless }} using the Console UI, Cloud API or Terraform Provider, so that {{ site.data.products.db }} can accept the new connection.

All {{ site.data.products.serverless }} clusters in your organization that use private connections in a given region connect over the same shared VPC. You will have to complete these steps once per region you want to connect to using AWS PrivateLink.
{{site.data.alerts.end}}

</section>

## Step 1. Set up a cluster

<section class="filter-content" markdown="1" data-scope="dedicated">

1. Use the {{ site.data.products.db }} Console to [create your {{ site.data.products.dedicated }} cluster](create-your-cluster.html) on AWS in the same region as your application.

    {{site.data.alerts.callout_info}}
    If you have a multi-region cluster, you will have to create a PrivateLink connection for each region you are operating in.
    {{site.data.alerts.end}}

1. Navigate to the **Networking** page.
1. Select the **PrivateLink** tab.
1. Click **Add Connection** to open the connection modal.

</section>

<section class="filter-content" markdown="1" data-scope="serverless">

1. Use the {{ site.data.products.db }} Console to [create a multi-region {{ site.data.products.serverless }} cluster](create-a-serverless-cluster.html) on AWS in the same region as your application.

    {{site.data.alerts.callout_info}}
    **Multi-region for {{ site.data.products.serverless }} is in [preview](../{{site.versions["stable"]}}/cockroachdb-feature-availability.html)** and subject to change. You cannot currently add or remove regions once a cluster has been created. To share feedback and/or issues, contact [Support](https://support.cockroachlabs.com/).
    {{site.data.alerts.end}}

1. Navigate to the **Networking** page.
1. Select the **PrivateLink** tab. PrivateLink connections that have already been configured are shown. A maximum of one PrivateLink connection can be configured.
1. To add a new private connection, click **Add Connection** to open the connection modal.

</section>

## Step 2. Create an AWS endpoint

{% capture security_group_substeps %}
    <ul><li>In the **Security group name** field, enter a name for the security group.</li>
    <li>In the **Description** field, enter a description for the security group.</li>
    <li>From the **VPC** dropdown, select the VPC you chose in Step 4.</li>
    <li><ul><li>In the **Inbound rules** section, click **Add rule**.</li><li>Enter *26257* in the **Port range** field.</li><li>In the **Source** field, enter the CIDR range from Step 5.</li></ul></li>
    <li>Click **Create security group**.</li></ul>
{% endcapture %}

<section class="filter-content" markdown="1" data-scope="dedicated">

1. <a name="step-1"></a>Select the region to create a connection in.

1. Copy the **Service Name** shown in the connection modal.

1. On the [Amazon VPC Console](https://console.aws.amazon.com/vpc/) in your AWS account, click **Your VPCs** in the sidebar.

1. <a name="step-4"></a>Locate the VPC ID of the VPC you want to create your endpoint in. Cockroach Labs recommends that you create the VPC in the availability zones where your cluster is deployed, and as near as possible to the availability zones where your application or service is deployed. You can also choose a different VPC as long as it is peered to the VPC your application is running in and the private endpoint is configured to be DNS-accessible across the peered VPCs.

1. On the **Your VPCs** page, locate the IPv4 CIDR corresponding to the VPC you chose in [step 4](#step-4).

1. Click **Subnets** in the sidebar.

1. Locate the subnet IDs corresponding to the VPC you chose in [step 4](#step-4).

1. Click **Security Groups** in the sidebar.

1. <a name="step-8"></a>Click **Create security group** to create a security group within your VPC that allows inbound access from your application or source program on Port 26257: {{ security_group_substeps }}

Use either the Amazon VPC Console or the [AWS Command Line Interface (CLI)](https://aws.amazon.com/cli/) to continue:

</section>

<section class="filter-content" markdown="1" data-scope="dedicated">

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="aws-console">AWS Console</button>
  <button style="width: 15%" class="filter-button" data-scope="aws-cli">AWS CLI</button>
</div>

<section class="filter-content" markdown="1" data-scope="aws-console">

1. Click **Endpoints** in the sidebar.
1. Click **Create Endpoint**.
1. On the **Create Endpoint** page, for the **Service Category** field, select **Find service by name**.
1. In the **Service Name** field, enter the **Service Name** copied from the connection modal in [Step 1](#step-1).
1. Click **Verify**.
1. In the **VPC** field, enter the ID of the VPC you want to create your endpoint in.
1. Verify that the subnets are pre-populated.
1. In the **Security group** section, select the security group you created in [Step 8](#step-8) and uncheck the box for **default** security group.
1. Click **Create Endpoint**.

    The VPC Endpoint ID displays.

1. Copy the Endpoint ID to your clipboard and return to {{ site.data.products.db }}'s **Add PrivateLink** modal.

</section>

<section class="filter-content" markdown="1" data-scope="aws-cli">

1. Substitute the values from the previous steps and run the following AWS CLI command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    aws ec2 create-vpc-endpoint --region {REGION} \
                                  --vpc-id {VPC_ID} \
                                  --subnet-ids {SUBNET_ID1} {SUBNET_ID2} \
                                  --vpc-endpoint-type Interface \
                                  --security-group-ids {SECURITY_GROUP_ID1} {SECURITY_GROUP_ID2} \
                                  --service-name {SERVICE_NAME_PROVIDED_BY_COCKROACH}
    ~~~

1. Locate the VPC Endpoint ID in the CLI output.

1. Copy the Endpoint ID to your clipboard and return to {{ site.data.products.db }}'s **Add PrivateLink** modal.

</section>

</section>

<section class="filter-content" markdown="1" data-scope="serverless">

1. <a name="step-1"></a>Select the region to create a connection in. All of your {{ site.data.products.serverless }} clusters in this region that use PrivateLink will share this connection.
1. Copy the **Service Name** shown in the connection modal. Make a note of the availability zones where your cluster is deployed in this region.
1. On the [Amazon VPC Console](https://console.aws.amazon.com/vpc/) in your AWS account, click **Your VPCs** in the sidebar.
1. <a name="step-4"></a>Locate the VPC ID of the VPC you want to create your endpoint in. Cockroach Labs recommends that you create the VPC in the availability zones where your cluster is deployed, and as near as possible to the availability zones where your application or service is deployed. You can also choose a different VPC as long as it is peered to the VPC your application is running in and the private endpoint is configured to be DNS-accessible across the peered VPCs.

1. On the **Your VPCs** page, locate the IPv4 CIDR corresponding to the VPC you chose in [step 4](#step-4).
1. Click **Subnets** in the sidebar.
1. Locate the subnet IDs corresponding to the VPC you chose in [step 4](#step-4).
1. Click **Security Groups** in the sidebar.
1. <a name="step-8"></a>Click **Create security group** to create a security group within your VPC that allows inbound access from your application or source program on Port 26257: {{ security_group_substeps }}

Use either the Amazon VPC Console or the [AWS Command Line Interface (CLI)](https://aws.amazon.com/cli/) to continue:

</section>

<section class="filter-content" markdown="1" data-scope="serverless">

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="aws-console">AWS Console</button>
  <button style="width: 15%" class="filter-button" data-scope="aws-cli">AWS CLI</button>
</div>

<section class="filter-content" markdown="1" data-scope="aws-console">

1. Click **Endpoints** in the sidebar.
1. Click **Create Endpoint**.
1. On the **Create Endpoint** page, for the **Service Category** field, select **Find service by name**.
1. In the **Service Name** field, enter the **Service Name** copied from the connection modal in [Step 1](#step-1).
1. Click **Verify**.
1. In the **VPC** field, enter the ID of the VPC you want to create your endpoint in.
1. Verify that the subnets are pre-populated.
1. In the **Security group** section, select the security group you created in [Step 8](#step-8) and uncheck the box for **default** security group.
1. Click **Create Endpoint**.

    The VPC Endpoint ID displays.

1. Copy the Endpoint ID to your clipboard and return to {{ site.data.products.db }}'s **Add PrivateLink** modal.

</section>

<section class="filter-content" markdown="1" data-scope="aws-cli">

1. Substitute the values from the previous steps and run the following AWS CLI command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    aws ec2 create-vpc-endpoint --region {REGION} \
                                  --vpc-id {VPC_ID} \
                                  --subnet-ids {SUBNET_ID1} {SUBNET_ID2} \
                                  --vpc-endpoint-type Interface \
                                  --security-group-ids {SECURITY_GROUP_ID1} {SECURITY_GROUP_ID2} \
                                  --service-name {SERVICE_NAME_PROVIDED_BY_COCKROACH}
    ~~~

1. Locate the VPC Endpoint ID in the CLI output.

1. Copy the Endpoint ID to your clipboard and return to {{ site.data.products.db }}'s **Add PrivateLink** modal.

</section>

</section>

## Step 3. Verify the endpoint ID

<section class="filter-content" markdown="1" data-scope="dedicated">

1. Click **Next**.
1. Enter the Endpoint ID, then click **Validate**. If validation fails, check the endpoint ID and try again. Otherwise, click **Next**.
1. Follow the instructions in the modal to enable **private DNS name** for the endpoint in AWS. When this option is enabled, {{ site.data.products.db }} maintains private DNS records in the VPC for the cluster.
1. Click **Complete** to save the configuration and close the modal.

</section>

<section class="filter-content" markdown="1" data-scope="dedicated">

1. Click **Next**.
1. Enter the Endpoint ID, then click **Validate**. If validation fails, check the endpoint ID and try again. Otherwise, click **Next**.
1. Follow the instructions in the modal to enable **private DNS name** for the endpoint in AWS. When this option is enabled, {{ site.data.products.db }} maintains private DNS records in the VPC for each {{ site.data.products.serverless }} cluster with PrivateLink enabled in the region.
1. Click **Complete** to save the configuration and close the modal.

</section>

## Step 4. Enable private DNS

<section class="filter-content" markdown="1" data-scope="dedicated">

Allow {{ site.data.products.db }} to modify the **private DNS name** for the endpoint in AWS. When this option is enabled, {{ site.data.products.db }} maintains private DNS records in the VPC for your cluster.

</section>

<section class="filter-content" markdown="1" data-scope="serverless">

Allow {{ site.data.products.db }} to modify the **private DNS name** for the endpoint in AWS. When this option is enabled, {{ site.data.products.db }} maintains private DNS records in the VPC for your {{ site.data.products.serverless }} clusters that use private connections.

</section>

Use either the Amazon VPC Console or the [AWS Command Line Interface (CLI)](https://aws.amazon.com/cli/) to continue:

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="aws-console">AWS Console</button>
  <button style="width: 15%" class="filter-button" data-scope="aws-cli">AWS CLI</button>
</div>

<section class="filter-content" markdown="1" data-scope="aws-console">

1. On the Amazon VPC Console **Endpoints** page, select the endpoint you created.
1. Click **Actions**.
1. Click **Modify Private DNS Names**.
1. Check the **Enable Private DNS Name** checkbox.
1. Click **Modify Private DNS Name**.
1. In the {{ site.data.products.db }} Console, click **Complete** to save the configuration and close the modal.

</section>

<section class="filter-content" markdown="1" data-scope="aws-cli">

After the endpoint status changes to Available, run the following AWS CLI command:

{% include_cached copy-clipboard.html %}
~~~ shell
aws ec2 modify-vpc-endpoint --region {REGION} \
                              --vpc-endpoint-id {VPC_ENDPOINT_ID} \
                              --private-dns-enabled
~~~

The endpoint status will change to Pending.

</section>

<section class="filter-content" markdown="1" data-scope="dedicated">

After a short (less than 5 minute) delay, the status will change to Available. You can now [connect to your cluster](connect-to-your-cluster.html)

</section>

<section class="filter-content" markdown="1" data-scope="serverless">

After a short (less than 5 minute) delay, the status will change to Available. You can now [connect to your cluster](connect-to-a-serverless-cluster.html).

</section>

<section class="filter-content" markdown="1" data-scope="dedicated serverless">

## What's next?

- [Client Connection Parameters](../{{site.current_cloud_version}}/connection-parameters.html)
- [Connect to Your {{ site.data.products.dedicated }} Cluster](connect-to-your-cluster.html)
- [Connect to a {{ site.data.products.serverless }} cluster](connect-to-a-serverless-cluster.html)

</section>
