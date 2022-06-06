---
title: Provisioning Amazon Web Services (AWS) for CMEK
summary: Tutorial for provisioning CMEK in AWS, covering initial set-up, revocation, and recovery scenarios.
toc: true
docs_area: manage.security
---

This page covers the procedures requried to provision a Customer Managed Encryption Key (CMEK) for your {{ site.data.products.dedicated }} cluster with Amazon Web Services (AWS).

This is part of the larger process of [Enabling CMEK for a {{ site.data.products.dedicated }} cluster](managing-cmek.html#enabling-cmek).

{{site.data.alerts.callout_info}}
For multi-region clusters, you must provide a key and IAM role combination per region. You can either:

- provide the same key for all your cluster regions.
- provide a different key per cluster region.
- provide a single multi-region key for the entire cluster.
{{site.data.alerts.end}}

## Step 1: Create the key

1. In the AWS console, visit the [KMS page](console.aws.amazon.com/kms/).
1. Choose **Customer managed keys** and click the **Create Key** button.
1. For **Key type**, specify **Symmetric Key**.
1. For **Key usage**, specify **Encrypt and decrypt**.
1. Under **Advanced options**, choose **KMS* for **Key material**.
1. Select whether you will use your key for a single region or a multi-region cluster.
1. Finish creating the key. At this stage, you do not need to add IAM roles to the key, and can use the default policy.

## Step 2: Provision the IAM role

1. Find the correct cross-account ID

	Recall that the premise of CMEK is that you, the customer, maintain control over your encryption key, while (temporarily) granting access to Cockroach Labs' to encrypt and data for you. You must find the Account ID of the AWS account that Cockroach Labs will use for this purpose. To find the ID of the AWS account associated with your cluster, query the clusters endpoint of the {{ site.data.products.db }} API. The value is under the `account_id` field:

	{% include_cached copy-clipboard.html %}
	```shell
	curl --request GET \
	  --url https://cockroachlabs.cloud/api/v1/clusters/{YOUR_CLUSTER_ID} \
	  --header 'Authorization: Bearer {YOUR_API_KEY}' | jq .account_id
	```

1.  Create a cross-account IAM role in your AWS account, configuring a policy with the following permissions on the KMS key(s) created in Step 3:

- kms:Decrypt
- kms:DescribeKey
- kms:Encrypt
- kms:GenerateDataKey*
- kms:ReEncrypt*


Setup the trust relationship / federation with the cluster’s AWS Account id noted in Step 2, and specify the external id as the Organization Id noted in Step 0. This would allow your cluster to access the KMS key(s) in your AWS account.



<img src="{{ 'images/cockroachcloud/create-kms.png' | relative_url }}" alt="SQL users" style="border:1px solid #eee;max-width:100%" />


Allows access to the AWS account and enables IAM policies

https://docs.aws.amazon.com/kms/latest/developerguide/key-policy-default.html#key-policy-default-allow-root-enable-iam

https://docs.aws.amazon.com/kms/latest/developerguide/iam-policies.html
