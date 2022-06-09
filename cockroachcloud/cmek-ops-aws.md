---
title: Provisioning Amazon Web Services (AWS) for CMEK
summary: Tutorial for provisioning CMEK in AWS, covering initial set-up, revocation, and recovery scenarios.
toc: true
docs_area: manage.security
---

This page covers the procedures required to provision a Customer Managed Encryption Key (CMEK) for your {{ site.data.products.dedicated }} cluster with Amazon Web Services (AWS).

This is part of the larger process of [Enabling CMEK for a {{ site.data.products.dedicated }} cluster](managing-cmek.html#enable-cmek).

{{site.data.alerts.callout_info}}
For multi-region clusters, you must provide a key and IAM role combination per region. You can provide the same key for all your cluster regions, a different key per cluster region, or any mapping of keys to regions you may choose. It does not matter if the key is a single- or multi-region key.
{{site.data.alerts.end}}

## Step 1: Provision the cross-account IAM role

Here we will create a *cross-account IAM role*. This is a role in your AWS account that can be temporarily assumed by users in another account, in this case, the {{ site.data.products.dedicated }} account. This role will have permissions to use the key.

1. Find your {{ site.data.products.dedicated }} organization ID in the {{ site.data.products.db }} [organization settings page] [cluster page](https://cockroachlabs.cloud/settings).

1. Find your {{ site.data.products.dedicated }} cluster ID:
	
	1. Visit the {{ site.data.products.db }} console [cluster page](https://cockroachlabs.cloud/clusters).
	1. Click on the name of your cluster.
	1. Find your cluster ID in the URL of the single cluster overview page: `https://cockroachlabs.cloud/cluster/<YOUR_CLUSTER_ID>/overview`.

1. Find your {{ site.data.products.dedicated }} cluster's associated  AWS Account ID.

	You must find the Account ID of the AWS account that {{ site.data.products.dedicated }} will use for this purpose. To find the ID of the AWS account associated with your cluster, query the clusters endpoint of the {{ site.data.products.db }} API. The value is under the `account_id` field:

	{% include_cached copy-clipboard.html %}
	```shell
	curl --request GET \
	  --url https://cockroachlabs.cloud/api/v1/clusters/{YOUR_CLUSTER_ID} \
	  --header 'Authorization: Bearer {YOUR_API_KEY}' | jq .account_id
	```

1.  Create a cross-account IAM role in your AWS account:

	1. In the AWS console, visit the [IAM page](https://console.aws.amazon.com/iam/).
	1. Select **Roles** and click **Create role**.
	1. For **Trusted entity type**, select **AWS account**.
	1. Choose **Another AWS account**.
		1. For **Account ID**, provide the {{ site.data.products.dedicated }} AWS Account ID that you found previously by querying your cluster's Cloud API.
		1. Select the option to **Require external ID**, and for the value of **External ID**, provide your {{ site.data.products.dedicated }} Organization ID.
	1. Finish creating the IAM role with a suitable name. You do not need to add any permissions.

	{{site.data.alerts.callout_info}}
	You will need the Amazon Resource Name (ARN) for your cross-account IAM role in the next step.
	{{site.data.alerts.end}}

## Step 2: Create the CMEK

1. In the AWS console, visit the [KMS page](https://console.aws.amazon.com/kms/). 
1. Choose **Customer managed keys** and click the **Create Key** button.
1. For **Key type**, specify **Symmetric Key**.
1. For **Key usage**, specify **Encrypt and decrypt**.
1. Under **Advanced options**, choose **KMS** for **Key material**.
1. Select whether you will use your key for a single region or a multi-region cluster.
1. Give the key a suitable name, or **alias**.
1. Set the permissions for your key with the following IAM policy, using the ARN for your cross-account IAM role you created at the end of [Step 1: Provision the cross-account IAM role](#step-1-provision-the-cross-account-iam-role).
	{% include_cached copy-clipboard.html %}
	```json
		{
		"Version": "2012-10-17",
		"Id": "key-consolepolicy-3",
		"Statement": [
		    {
		        "Sid": "Allow use of the key",
		        "Effect": "Allow",
		        "Principal": {
		            "AWS": <YOUR_IAM_ROLE_ARN>
		        },
		        "Action": [
		            "kms:Encrypt",
		            "kms:Decrypt",
		            "kms:GenerateDataKey*",
		            "kms:DescribeKey",
		            "kms:ReEncrypt*",
		        ],
		        "Resource": "*"
		    }
		]
	}	
	```

1. Finish creating the key.

Now that you have provisioned the IAM role and KMS key for your CockroachDB cluster's CMEK, return to [Enabling CMEK for a {{ site.data.products.dedicated }} cluster](managing-cmek.html#step-4-enable-cmek-for-your-cockroachdb-dedicated-cluster).