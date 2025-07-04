---
title: Manage AWS PrivateLink
summary: Instructions for establishing AWS PrivateLink network access for a cluster in CockroachDB Cloud.
toc: true
docs_area: manage
---

Amazon Web Services (AWS) PrivateLink support allows customers to establish SQL access to their clusters entirely through private AWS infrastructure, without exposure to the public internet, affording enhanced security and performance. PrivateLink is supported for CockroachDB {{ site.data.products.advanced }} CockroachDB {{ site.data.products.standard }} clusters deployed on AWS.

This page shows how to set up AWS PrivateLink for CockroachDB {{ site.data.products.advanced }} and CockroachDB {{ site.data.products.standard }} clusters, both in CockroachDB {{ site.data.products.cloud }}and in your AWS account. For broader context, refer to [Network Authorization for CockroachDB {{ site.data.products.cloud }} Clusters]({% link cockroachcloud/network-authorization.md %}).

{% include_cached common/aws-privatelink-basic.md %}

<div class="filters clearfix">
  <button class="filter-button" data-scope="advanced">CockroachDB {{ site.data.products.advanced }}</button>
  <button class="filter-button" data-scope="standard">CockroachDB {{ site.data.products.standard }}</button>
</div>

{{site.data.alerts.callout_success}}
You must configure the AWS PrivateLink connection for your cluster both in CockroachDB {{ site.data.products.cloud }} and in AWS. For CockroachDB {{ site.data.products.cloud }}, you can use the CockroachDB {{ site.data.products.cloud }} Console, [Cloud API]({% link cockroachcloud/cloud-api.md %}) or [Terraform Provider]({% link cockroachcloud/provision-a-cluster-with-terraform.md %}).

<section class="filter-content" markdown="1" data-scope="advanced">
For help, refer to [Establish private connectivity]({% link cockroachcloud/connect-to-an-advanced-cluster.md %}#establish-private-connectivity).
</section>

<section class="filter-content" markdown="1" data-scope="standard">
For help, refer to [Establish private connectivity]({% link cockroachcloud/connect-to-your-cluster.md %}#establish-private-connectivity).
</section>

If you have multiple clusters, you will have to repeat these steps for each cluster that you want to connect to using AWS PrivateLink.
{{site.data.alerts.end}}

## Step 1. Set up a cluster

<section class="filter-content" markdown="1" data-scope="advanced">

1. Use the CockroachDB {{ site.data.products.cloud }} Console to [create your CockroachDB {{ site.data.products.advanced }} cluster]({% link cockroachcloud/create-an-advanced-cluster.md %}) on AWS in the same regions as your application.

1. Navigate to the **Networking** page.
1. Select the **PrivateLink** tab.
1. Click **Add Connection** to open the connection dialog.

Continue to [Step 3. Create an AWS endpoint](#step-3-create-an-aws-endpoint).

</section>

<section class="filter-content" markdown="1" data-scope="standard">

1. Use the CockroachDB {{ site.data.products.cloud }} Console to [create a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/create-a-basic-cluster.md %}) on AWS in the same regions as your application.
1. Navigate to the **Networking** page.
1. Select the **PrivateLink** tab. PrivateLink connections that have already been configured are shown as a private endpoint allowlist.
1. Click **Add Connection** to open the connection dialog.

Continue to [Step 3. Create an AWS endpoint](#step-3-create-an-aws-endpoint).

</section>

<section class="filter-content" markdown="1" data-scope="advanced">

## Step 2. (Optional) Configure private endpoint trusted owners

{{site.data.alerts.callout_info}}
{% include_cached feature-phases/limited-access.md %}
{{site.data.alerts.end}}

Optionally, you can restrict the AWS accounts that can connect to your cluster privately using private endpoints. To configure trusted owners, you must use the [CockroachDB {{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}) or [Terraform Provider](https://github.com/cockroachdb/terraform-provider-cockroach/).

Your service account must have one of the following roles on the cluster, either directly or by inheritance:

- [Cluster Admin]({% link cockroachcloud/authorization.md %}#cluster-admin) to add or remove private endpoint trusted owners. The Cluster Admin role includes all of the capabilities of the Cluster Operator role.
- [Cluster Operator]({% link cockroachcloud/authorization.md %}#cluster-operator) to list or get details about private endpoint trusted owners.

### Add a private endpoint trusted owner

To [add a private endpoint trusted owner](https://www.cockroachlabs.com/docs/api.html/cloud/v1#post-/api.html/v1/clusters/-cluster_id-/networking/private-endpoint-trusted-owners):

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
  --url https://cockroachlabs.cloud/api.html/v1/clusters/{cluster_id}/networking/private-endpoint-trusted-owners \
  --header 'Authorization: Bearer {bearer_token' \
  --header 'content-type: application/json' \
  --data '{"external_owner_id":"{aws_account_id}","type":"AWS_ACCOUNT_ID"}'
~~~

Replace:

- `{cluster_id}`: The ID of the cluster.
- `{bearer_token}`: The service account's API key.
- `{aws_account_id}`: The ID of the AWS account to trust.

The response includes details about the trusted owner, including a unique trusted owner ID. This ID is required to get details about or remove a trusted owner.

Next, you can [create an AWS endpoint](#step-3-create-an-aws-endpoint).

### List private endpoint trusted owners

To [list private endpoint trusted owners](https://www.cockroachlabs.com/docs/api.html/cloud/v1#get-/api.html/v1/clusters/-cluster_id-/networking/private-endpoint-trusted-owners) for a cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api.html/v1/clusters/{cluster_id}/networking/private-endpoint-trusted-owners \
  --header 'Authorization: Bearer {bearer_token}'
~~~

Replace:

- `{cluster_id}`: The ID of the cluster.
- `{bearer_token}`: The service account's API key.

### Get details about a trusted owner

To [get details about a private endpoint trusted owner](https://www.cockroachlabs.com/docs/api.html/cloud/v1#get-/api.html/v1/clusters/-cluster_id-/networking/private-endpoint-trusted-owners/-owner_id-):

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api.html/v1/clusters/{cluster_id}/networking/private-endpoint-trusted-owners/{owner_id} \
  --header 'Authorization: Bearer {bearer_token}'
~~~

Replace:

- `{cluster_id}`: The ID of the cluster.
- `{owner_id}`: The UUID of a private endpoint trusted owner entry.
- `{bearer_token}`: The service account's API key.

### Remove a trusted owner

To [remove a private endpoint trusted owner](https://www.cockroachlabs.com/docs/api.html/cloud/v1#delete-/api.html/v1/clusters/-cluster_id-/networking/private-endpoint-trusted-owners/-owner_id-):

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request DELETE \
  --url https://cockroachlabs.cloud/api.html/v1/clusters/{cluster_id}/networking/private-endpoint-trusted-owners/{owner_id} \
  --header 'Authorization: {bearer_token}'
~~~

Replace:

- `{cluster_id}`: The ID of the cluster.
- `{owner_id}`: The UUID of a private endpoint trusted owner entry.
- `{bearer_token}`: The service account's API key

</section>

## Step 3. Create an AWS endpoint

{% capture security_group_substeps %}
    <ul><li>In the **Security group name** field, enter a name for the security group.</li>
    <li>In the **Description** field, enter a description for the security group.</li>
    <li>From the **VPC** dropdown, select the VPC you chose in Step 4.</li>
    <li><ul><li>In the **Inbound rules** section, click **Add rule**.</li><li>Enter *26257* in the **Port range** field.</li><li>In the **Source** field, enter the CIDR range from Step 5.</li></ul></li>
    <li>Click **Create security group**.</li></ul>
{% endcapture %}

{{site.data.alerts.callout_success}}
Complete these steps once for each private endpoint in your AWS account that will be used to privately connect to one or more of your clusters. If you connect additional clusters to the same private endpoint, you do not need to make additional changes in your AWS account.
{{site.data.alerts.end}}

1. <a name="step-1"></a>In the **Add connection** dialog in the CockroachDB {{ site.data.products.cloud }} Console, select the region to create a connection in.

1. Copy the **Service Name** shown in the connection dialog.

    Make a note of the availability zones where your cluster is deployed in this region.

1. On the [Amazon VPC Console](https://console.aws.amazon.com/vpc/) in your AWS account, click **Your VPCs** in the sidebar.

    Locate the VPC ID of the VPC you want to create your endpoint in, and make a note of its IPv4 CIDR.

    Cockroach Labs recommends that you use a VPC that has subnets in the availability zones where your cluster is deployed, and that your application or service is also deployed in the same availability zones. You can choose a different VPC for the private endpoint as long as it is peered to the VPC your application is running in and the private endpoint is configured to be DNS-accessible across the peered VPCs.

1. Click **Subnets** in the sidebar. Make a note of the subnet ID of each subnet that corresponds to your chosen VPC.
1. Click **Security Groups** in the sidebar.
1. <a name="step-8"></a>Click **Create security group** to create a security group within your VPC. The security group allows inbound access from your application or source program on Port 26257: {{ security_group_substeps }}

Use either the Amazon VPC Console or the [AWS Command Line Interface (CLI)](https://aws.amazon.com/cli/) to continue:

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="aws-console">AWS Console</button>
  <button style="width: 15%" class="filter-button" data-scope="aws-cli">AWS CLI</button>
</div>

<section class="filter-content" markdown="1" data-scope="aws-console">

1. Click **Endpoints** in the sidebar.
1. Click **Create Endpoint**.
1. On the **Create Endpoint** page, for the **Service Category** field, select **Find service by name**.
1. In the **Service Name** field, enter the **Service Name** you copied from the connection dialog in [Step 3. Create an AWS endpoint](#step-3-create-an-aws-endpoint).
1. Click **Verify**.
1. In the **VPC** field, enter the ID of the VPC you want to create your endpoint in.
1. Verify that the subnets are pre-populated.
1. In the **Security group** section, select the security group you created in [Step 3. Create an AWS endpoint](#step-3-create-an-aws-endpoint) and uncheck the box for **default** security group.
1. Click **Create Endpoint**.

    The VPC Endpoint ID displays.

1. Copy the Endpoint ID to your clipboard and return to CockroachDB {{ site.data.products.cloud }}'s **Add PrivateLink** dialog.

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

1. Copy the Endpoint ID to your clipboard and return to CockroachDB {{ site.data.products.cloud }}'s **Add PrivateLink** dialog.

</section>

## Step 4. Verify the endpoint ID

1. Click **Next**.
1. Enter the Endpoint ID, then click **Validate**. If validation fails, check the endpoint ID and try again. Otherwise, click **Next**.
1. Follow the instructions in the dialog to enable **private DNS name** for the endpoint in AWS. When this option is enabled, CockroachDB {{ site.data.products.cloud }} maintains private DNS records in the VPC for the cluster.
1. Click **Complete** to save the configuration and close the dialog.

## Step 5. Enable private DNS

Allow CockroachDB {{ site.data.products.cloud }} to modify the **private DNS name** for the endpoint in AWS. When this option is enabled, CockroachDB {{ site.data.products.cloud }} maintains private DNS records in the VPC for your cluster.

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
1. In the CockroachDB {{ site.data.products.cloud }} Console, click **Complete** to save the configuration and close the dialog.

</section>

<section class="filter-content" markdown="1" data-scope="aws-cli">

After the endpoint status changes to **Available** on the Amazon VPC Console **Endpoints** page, run the following AWS CLI command:

{% include_cached copy-clipboard.html %}
~~~ shell
aws ec2 modify-vpc-endpoint --region {REGION} \
                              --vpc-endpoint-id {VPC_ENDPOINT_ID} \
                              --private-dns-enabled
~~~

The endpoint status will change to Pending.

After a short (less than 5 minute) delay, the status will change from **Pending Request** to **Pending** and then to **Available**. You can now [connect to your cluster]({% link cockroachcloud/connect-to-your-cluster.md %}).

</section>

## What's next?

- [Client Connection Parameters]({% link {{site.current_cloud_version}}/connection-parameters.md %})
<section class="filter-content" markdown="1" data-scope="advanced">
- [Connect to your CockroachDB {{ site.data.products.advanced }} Cluster]({% link cockroachcloud/connect-to-an-advanced-cluster.md %})
</section>
<section class="filter-content" markdown="1" data-scope="standard">
- [Connect to a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/connect-to-your-cluster.md %})
</section>
