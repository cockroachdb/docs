---
title: Prepare a CockroachDB Cloud BYOC Deployment in AWS
summary: Prepare a cloud service account to self-host a CockroachDB Cloud deployment with the BYOC model
toc: true
keywords: deployment, byoc
---

CockroachDB {{ site.data.products.cloud }} supports a "bring your own cloud" (BYOC) deployment model, where CockroachDB {{ site.data.products.cloud }} {{ site.data.products.advanced }} is hosted in your own account rather than in an account managed by Cockroach Labs. This model allows you to take more control of security and take advantage of existing cloud service credits or discounts.

{{site.data.alerts.callout_info}}
The BYOC {{ site.data.products.cloud }} deployment option is currently in [Preview]({% link {{ site.current_cloud_version }}/cockroachdb-feature-availability.md %}).
{{site.data.alerts.end}}

This page describes how to prepare a cloud service account to host a BYOC deployment of CockroachDB {{ site.data.products.cloud }} {{ site.data.products.advanced }} in Microsoft Azure.

## Shared responsibility model for BYOC

{% include cockroachcloud/byoc/byoc-responsibility-model.md %}

## Prerequisites

{% include cockroachcloud/byoc/byoc-common-prerequisites.md %}

## Step 1. Create a new AWS account

Provision a new AWS account with no existing infrastructure, dedicated to your Cockroach {{ site.data.products.cloud }} deployment. The account configuration for BYOC requires you to grant Cockroach Labs permissions to access and modify resources in this account, so this step is necessary to isolate these permissions from non-Cockroach Cloud resources. This account can be reused for multiple CockroachDB clusters.

## Step 2. Configure intermediate IAM role for Cockroach Labs

Cockroach Labs uses an intermediate IAM role to provision and manage resources in your AWS account. In this step, you will use your CockroachDB {{ site.data.products.cloud }} organization label to determine what the ARN will be for later use.

You can collect the org label for your CockroachDB {{ site.data.products.cloud }} organization in the Console or by using the `/v1/organization` endpoint of the [CockroachDB {{ site.data.products.cloud }} API](https://www.cockroachlabs.com/docs/api/cloud/v1.html#get-/api/v1/organization) with a `GET` request similar to the following example:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/organization \
  --header 'Authorization: Bearer {secret_key}'
~~~

The ARN of this dedicated intermediate service account follows the following schema:

~~~ text
arn:aws:iam::721449411130:user/byoc/CockroachDB-Cloud-managed-BYOC_<org-label>
~~~

For example, if your organization’s org label is `org-32222` then record your ARN as follows:
~~~
arn:aws:iam::721449411130:user/byoc/CockroachDB-Cloud-managed-BYOC_org-32222
~~~

## Step 3. Create IAM role for Cockroach Labs access

Follow these steps to create the IAM role and grant the necessary permissions:

1. In the AWS IAM console, do the following:
   1. Create a new role. This name is arbitrary, in these instructions the role is named `CRLBYOCAdmin`.
   2. Use the following trust relationship policy for the new role, using the ARN collected in the previous step:
    {% include_cached copy-clipboard.html %}
    ~~~ json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "AWS": <intermediate IAM user's ARN>
          },
          "Action": "sts:AssumeRole"
        }
      ]
    }
    ~~~
   3. Apply an IAM policy to the intermediate role granting the following list of permissions:
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

You may also need to adjust quotas for vCPU and EBS disk storage for the regions that you plan to create your cluster in.

## Step 5. Create the CockroachDB {{ site.data.products.cloud }} cluster

In BYOC deployments, CockroachDB clusters are deployed with the {{ site.data.products.cloud }} API and must use the {{ site.data.products.advanced }} plan. Follow the API documentation to [create a CockroachDB {{ site.data.products.cloud }} {{ site.data.products.advanced }} cluster]({% link cockroachcloud/cloud-api.md %}#create-an-advanced-cluster).

The following example request creates a 3-node {{ site.data.products.advanced }} cluster in the `centralus` region, specifying the `subscription-id` and `customer-tenant-id` associated with your Azure subscription:

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
            "arn": "arn:aws:iam::<AWS Account ID>:role/CRLBYOCAdmin"
          }
        }
      }
    }'
~~~

## Next steps

- [Connect to your cluster]({% link cockroachcloud/connect-to-an-advanced-cluster.md %})
- [Manage your cluster using the {{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %})
- [Prepare your deployment for production]({% link cockroachcloud/production-checklist.md %})