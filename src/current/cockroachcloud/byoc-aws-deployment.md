---
title: Prepare a CockroachDB Cloud BYOC Deployment in Amazon Web Services
summary: Prepare an Amazon Web Services account to host a BYOC deployment of CockroachDB
toc: true
keywords: deployment, byoc
---

This page describes how to prepare a cloud service account to host a [BYOC deployment]({% link cockroachcloud/byoc-overview.md %}) of CockroachDB {{ site.data.products.cloud }} {{ site.data.products.advanced }} in Amazon Web Services (AWS).

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

## Prerequisites

{% include cockroachcloud/byoc/byoc-common-prerequisites.md %}

- Create an [API service account]({% link cockroachcloud/managing-access.md %}#create-api-keys) to use the [{{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}) with your {{ site.data.products.cloud }} organization.

## Step 1. Create a new AWS account

Provision a new AWS account with no existing infrastructure, dedicated to your CockroachDB {{ site.data.products.cloud }} deployment. The account configuration for BYOC requires you to grant Cockroach Labs permissions to access and modify resources in this account, so this step is necessary to isolate these permissions from non-CockroachDB Cloud resources.

## Step 2. Collect the Cockroach Labs IAM role ARN

Cockroach Labs uses cross-account resource management to provision and manage resources in your AWS account. This requires two **IAM roles**:

- An IAM role owned by Cockroach Labs which must be granted permissions to access an IAM role in your AWS account.
- An intermediary IAM role in your AWS account which must be granted permissions to create and manage infrastructure. This IAM role is the target used by Cockroach Labs for cross-account management.

In this step, use the [{{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}) to get the **Amazon Resource Name (ARN)** of the IAM role provisioned by Cockroach Labs for your account.

Send a `GET` request to the `/v1/organization` endpoint of the [CockroachDB {{ site.data.products.cloud }} API](https://www.cockroachlabs.com/docs/api/cloud/v1.html#get-/api/v1/organization) similar to the following example:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/organization \
  --header 'Authorization: Bearer {secret_key}'
~~~

Record the value of `cockroach_cloud_service_principals.aws.user_arn` in the response:

~~~ json
{
  "cockroach_cloud_service_principals": {
    "aws": {
      "user_arn": "arn:aws:iam::{AWS Account ID}:example/arn"
    }
  }
}
~~~

## Step 3. Create intermediary IAM role and apply permissions

In this step, create the intermediary IAM role in your AWS account, then apply a trust relationship policy and permissions that allow Cockroach Labs to assume the intermediary role as needed.

Follow these steps to create the intermediate IAM role:

1. Open the AWS IAM console.
1. Create a new role. You can choose any name for this role. In these instructions the example role is named `CRLBYOCAdmin`.
1. Use the following trust relationship policy for the new role, using the ARN collected in the previous step:
    {% include_cached copy-clipboard.html %}
    ~~~ json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "AWS": "arn:aws:iam::{AWS Account ID}:example/arn"
          },
          "Action": "sts:AssumeRole"
        }
      ]
    }
    ~~~
1. Apply an IAM policy to the intermediate role granting the following list of permissions:
    {% include_cached copy-clipboard.html %}
    ~~~ text
    // Auto Scaling permissions
    "autoscaling:CreateAutoScalingGroup",
    "autoscaling:DeleteAutoScalingGroup",
    "autoscaling:Describe*",
    "autoscaling:Get*",
    "autoscaling:SetInstanceProtection",
    "autoscaling:TerminateInstanceInAutoScalingGroup",
    "autoscaling:UpdateAutoScalingGroup",

    // EC2 permissions
    "ec2:AcceptVpcEndpointConnections",
    "ec2:AcceptVpcPeeringConnection",
    "ec2:AssociateRouteTable",
    "ec2:AssociateVpcCidrBlock",
    "ec2:AttachInternetGateway",
    "ec2:AuthorizeSecurityGroupEgress",
    "ec2:AuthorizeSecurityGroupIngress",
    "ec2:CreateFlowLogs",
    "ec2:CreateInternetGateway",
    "ec2:CreateLaunchTemplate",
    "ec2:CreateLaunchTemplateVersion",
    "ec2:CreateNatGateway",
    "ec2:CreateRoute",
    "ec2:CreateRouteTable",
    "ec2:CreateSecurityGroup",
    "ec2:CreateSubnet",
    "ec2:CreateTags",
    "ec2:CreateVpc",
    "ec2:CreateVpcEndpoint",
    "ec2:CreateVpcPeeringConnection",
    "ec2:DeleteFlowLogs",
    "ec2:DeleteInternetGateway",
    "ec2:DeleteLaunchTemplate",
    "ec2:DeleteLaunchTemplateVersions",
    "ec2:DeleteNatGateway",
    "ec2:DeleteRoute",
    "ec2:DeleteRouteTable",
    "ec2:DeleteSecurityGroup",
    "ec2:DeleteSubnet",
    "ec2:DeleteVpc",
    "ec2:DeleteVpcEndpoints",
    "ec2:DeleteVpcEndpointServiceConfigurations",
    "ec2:DeleteVpcPeeringConnection",
    "ec2:Describe*",
    "ec2:DetachInternetGateway",
    "ec2:DisableEbsEncryptionByDefault",
    "ec2:DisassociateRouteTable",
    "ec2:DisassociateVpcCidrBlock",
    "ec2:EnableEbsEncryptionByDefault",
    "ec2:Get*",
    "ec2:List*",
    "ec2:ModifySubnetAttribute",
    "ec2:ModifyVolume",
    "ec2:ModifyVpcAttribute",
    "ec2:ModifyVpcEndpointServiceConfiguration",
    "ec2:ModifyVpcEndpointServicePermissions",
    "ec2:RejectVpcEndpointConnections",
    "ec2:RevokeSecurityGroupEgress",
    "ec2:RevokeSecurityGroupIngress",
    "ec2:RunInstances",
    "ec2:StartVpcEndpointServicePrivateDnsVerification",

    // EKS permissions
    "eks:AssociateAccessPolicy",
    "eks:CreateAccessEntry",
    "eks:CreateCluster",
    "eks:DeleteAccessEntry",
    "eks:DeleteCluster",
    "eks:Describe*",
    "eks:DisassociateAccessPolicy",
    "eks:List*",
    "eks:UpdateAccessEntry",
    "eks:UpdateClusterConfig",
    "eks:UpdateClusterVersion",

    // Elastic Load Balancing permissions
    "elasticloadbalancing:Describe*",

    // IAM permissions
    "iam:AddRoleToInstanceProfile",
    "iam:AttachRolePolicy",
    "iam:AttachUserPolicy",
    "iam:CreateAccessKey",
    "iam:CreateAccountAlias",
    "iam:CreateInstanceProfile",
    "iam:CreateOpenIDConnectProvider",
    "iam:CreatePolicy",
    "iam:CreateRole",
    "iam:CreateServiceLinkedRole",
    "iam:CreateUser",
    "iam:DeleteAccessKey",
    "iam:DeleteInstanceProfile",
    "iam:DeleteLoginProfile",
    "iam:DeleteOpenIDConnectProvider",
    "iam:DeletePolicy",
    "iam:DeletePolicyVersion",
    "iam:DeleteRole",
    "iam:DeleteRolePolicy",
    "iam:DeleteUser",
    "iam:DeleteUserPolicy",
    "iam:DetachRolePolicy",
    "iam:DetachUserPolicy",
    "iam:Get*",
    "iam:List*",
    "iam:PassRole",
    "iam:PutRolePolicy",
    "iam:PutUserPolicy",
    "iam:RemoveRoleFromInstanceProfile",
    "iam:TagPolicy",

    // Kafka permissions
    "kafka:List*",

    // CloudWatch Logs permissions
    "logs:CreateLogGroup",
    "logs:DeleteLogGroup",
    "logs:Describe*",
    "logs:Get*",
    "logs:List*",
    "logs:PutRetentionPolicy",
    "logs:PutSubscriptionFilter",

    // S3 permissions
    "s3:CreateBucket",
    "s3:DeleteBucketPolicy",
    "s3:Describe*",
    "s3:Get*",
    "s3:List*",
    "s3:PutBucketTagging",
    "s3:PutEncryptionConfiguration",
    "s3:PutLifecycleConfiguration",

    // Service Quotas permissions
    "servicequotas:GetServiceQuota",
    ~~~

## Step 4. (Optional) Enable additional regions

If you plan to use non-default AWS regions, you must manually enable them in the AWS Management Console. You must also activate [global STS tokens](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_region-endpoints.html) for these regions to work with CockroachDB.

You may also need to adjust quotas for vCPU and EBS disk storage for the regions in which you plan to create your cluster.

## Step 5. Create the CockroachDB {{ site.data.products.cloud }} cluster

In BYOC deployments, CockroachDB clusters can be deployed in the {{ site.data.products.cloud }} Console or with the [{{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}).

### Create a cluster with the {{ site.data.products.cloud }} Console

Follow these steps to create a CockroachDB cluster in the {{ site.data.products.cloud }} console:

1. Open the {{ site.data.products.cloud }} Console and select the organization that has been enabled for BYOC.
1. Click **Create cluster**.
1. Under **Select a plan**, click **{{ site.data.products.advanced }}**.
1. Under **Cloud & Regions**, click **Bring Your Own Cloud** and select AWS.
1. Under **Cloud account**, click **Select your cloud account > Add new cloud account**. Enter the ARN associated with the intermediate IAM role that you created, *not* the ARN of the Cockroach Labs IAM role.
1. Follow the rest of the **Create Cluster** steps to configure your cluster's regions, capacity, and features as desired. Read the [Plan a CockroachDB {{ site.data.products.advanced}} Cluster]({% link cockroachcloud/plan-your-cluster-advanced.md %}) documentation for more details.

### Create a cluster with the {{ site.data.products.cloud }} API

Send a `POST` request to the the `/v1/clusters` endpoint to [create a CockroachDB {{ site.data.products.cloud }} {{ site.data.products.advanced }} cluster]({% link cockroachcloud/cloud-api.md %}#create-an-advanced-cluster).

The following example request creates a 3-node {{ site.data.products.advanced }} cluster in the `us-east-2` region, specifying the ARN associated with your intermediate IAM role:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
    --url https://cockroachlabs.cloud/api/v1/clusters \
    --header 'Authorization: Bearer {secret_key}' \
    --json '{
      "name": "byoc-aws-cluster-1",
      "provider": "AWS",
      "spec": {
        "dedicated": {
          "hardware": {
            "machine_spec": {"num_virtual_cpus": 4},
            "storage_gib": 16
          },
          "region_nodes": {"us-east-2": 3}
        },
        "plan": "ADVANCED",
        "customer_cloud_account": {
          "aws": {
            "arn": "arn:aws:iam::{AWS Account ID}:example/arn"
          }
        }
      }
    }'
~~~

## Next steps

- [Connect to your cluster]({% link cockroachcloud/connect-to-an-advanced-cluster.md %})
- [Manage your cluster using the {{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %})
- [Prepare your deployment for production]({% link cockroachcloud/production-checklist.md %})
