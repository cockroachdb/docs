---
title: Provisioning AWS KMS Keys and IAM Roles for CMEK
summary: Tutorial for provisioning CMEK in AWS, covering initial set-up, revocation, and recovery scenarios.
toc: true
docs_area: manage.security
---

This page covers the procedures required to provision a Customer Managed Encryption Key (CMEK) for your {{ site.data.products.dedicated }} cluster with Amazon Web Services (AWS).

This is part of the larger process of [Enabling CMEK for a {{ site.data.products.dedicated }} cluster](managing-cmek.html#enable-cmek).

## Overview

- In [Step 1. Provision the cross-account IAM role](#step-1-provision-the-cross-account-iam-role), we will create an IAM role that will be used by {{ site.data.products.dedicated }} to access the CMEK key.
- In [Step 2. Create the CMEK key](#step-2-create-the-cmek-key), we will explore two ways of creating the required key:
	- Directly in the AWS key management service (KMS) console
	- By setting up a Vault KMS secrets engine with to AWS KMS, in order to leverage the security advantages of Vault's additional layer of abstraction.

{{site.data.alerts.callout_info}}
For multi-region clusters, you must provide a key and IAM role combination per region. You can provide the same key for all your cluster regions, a different key per cluster region, or any mapping of keys to regions you may choose. It does not matter if the key is a single- or multi-region key.
{{site.data.alerts.end}}

## Step 1. Provision the cross-account IAM role

Here we will create a *cross-account IAM role*. This is a role in your AWS account that can be temporarily assumed by users in another account, in this case, the {{ site.data.products.dedicated }} account. This role will have permissions to use the key.

1. Find your {{ site.data.products.dedicated }} organization ID in the {{ site.data.products.db }} [organization settings page](https://cockroachlabs.cloud/settings).

1. Find your {{ site.data.products.dedicated }} cluster ID:
	
	1. Visit the {{ site.data.products.db }} console [cluster page](https://cockroachlabs.cloud/clusters).
	1. Click on the name of your cluster.
	1. Find your cluster ID in the URL of the single cluster overview page: `https://cockroachlabs.cloud/cluster/{YOUR_CLUSTER_ID}/overview`.

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

## Step 2. Create the CMEK key

You can create the CMEK key two ways:

- [Directly in the AWS console](#option-a-use-the-aws-console-to-create-the-cmek-key)
- By setting up a [Vault AWS-KMS secrets engine](#option-b-use-the-vault-aws-kms-secrets-engine-to-create-the-cmek-key) with access to AWS KMS, in order to leverage the security advantages of Vault's additional layer of abstraction.
		{{site.data.alerts.callout_info}}
		Learn more about [CockroachDB - HashiCorp Vault integrations](../{{site.versions["stable"]}}/hashicorp-integration.html).
		{{site.data.alerts.end}}

### Option A: Use the AWS Console to create the CMEK key
1. In the AWS console, visit the [KMS page](https://console.aws.amazon.com/kms/). 
1. Choose **Customer managed keys** and click the **Create Key** button.
1. For **Key type**, specify **Symmetric Key**.
1. For **Key usage**, specify **Encrypt and decrypt**.
1. Under **Advanced options**, choose **KMS** for **Key material**.
1. Select whether you will use your key for a single region or a multi-region cluster.
1. Give the key a suitable name, or **alias**.
1. Set the permissions for your key with the `crdb-cmek-kms` IAM policy provided in the [Appendix](#appendix-iam-policy-for-the-cmek-key).
1. Finish creating the key.

After you have provisioned the IAM role and KMS key for your CockroachDB cluster's CMEK, return to [Enabling CMEK for a {{ site.data.products.dedicated }} cluster](managing-cmek.html#step-4-enable-cmek-for-your-cockroachdb-dedicated-cluster).

### Option B: Use the Vault AWS-KMS secrets engine to create the CMEK key

Pre-requisites: 

- Vault enterprise license
- Vault enterprise edition installed locally

1. Initialize your shell for Vault:
	{% include_cached copy-clipboard.html %}
	```shell
	 export VAULT_ADDR={YOUR_VAULT_TARGET}
	 export VAULT_TOKEN={YOUR_VAULT_TOKEN}
	 export VAULT_NAMESPACE="admin"
	```
1. Enable the KMS secrets engine:
	{% include_cached copy-clipboard.html %}
	```shell
	vault secrets enable keymgmt
	```
	```txt
	Success! Enabled the keymgmt secrets engine at: keymgmt/
	```
1. Connect Vault to your AWS account by creating a KMS provider entry:

	{% include_cached copy-clipboard.html %}
	```shell
	vault write keymgmt/kms/awskms \
    provider="awskms" \
    key_collection="us-east-1" \
    credentials=access_key="AKIAX4BORNLVYTAPSZ5L" \
    credentials=secret_key="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"
	```
	
	```txt
	Success! Data written to: keymgmt/kms/awskms
	```

1. Create an encryption key in Vault.

	This will generate the encryption key and store it in Vault. Note that at this point the key has not been imported into your AWS account's KMS service.

	{% include_cached copy-clipboard.html %}
	```shell
	vault write keymgmt/key/crdb-cmek-vault type="aes256-gcm96"
	```
	
	```txt
	Success! Data written to: keymgmt/key/aes256-gcm96
	```

1. Propogate the key to your KMS service

	{% include_cached copy-clipboard.html %}
	```shell
	vault write keymgmt/kms/awskms/key/crdb-cmek-vault \
	    purpose="encrypt,decrypt" \
	    protection="hsm"
	```

	```txt
	Success! Data written to: keymgmt/kms/awskms/key/crdb-cmek-vault
	```
1. In the AWS console, visit the [KMS page](https://console.aws.amazon.com/kms/).
1. Choose **Customer managed keys**.
1. Select your key, which will be named `crdb-cmek-vault-{RANDOM_SUFFIX}` where RANDOM_SUFFIX is a string of random numbers.
1. Set the permissions policy for your key with the `crdb-cmek-kms` IAM policy provided in the [Appendix](#appendix-iam-policy-for-the-cmek-key).
1. Save.

After you have provisioned the IAM role and KMS key for your CockroachDB cluster's CMEK, return to [Enabling CMEK for a {{ site.data.products.dedicated }} cluster](managing-cmek.html#step-4-enable-cmek-for-your-cockroachdb-dedicated-cluster).

## Appendix: IAM policy for the CMEK key

This IAM policy is to be attached to the CMEK key. It grants the required KMS permissions to the cross-account IAM role to be used by {{ site.data.products.dedicated }}.

Note that this IAM policy refers to the ARN for the cross-account IAM role you created at the end of [Step 1. Provision the cross-account IAM role](#step-1-provision-the-cross-account-iam-role).

{% include_cached copy-clipboard.html %}
```json
{
	"Version": "2012-10-17",
	"Id": "crdb-cmek-kms",
	"Statement": [
	    {
	        "Sid": "Allow use of the key for CMEK",
	        "Effect": "Allow",
	        "Principal": {
	            "AWS": "{ARN_OF_CROSS_ACCOUNT_IAM_ROLE}"
	        },
	        "Action": [
	            "kms:Encrypt",
	            "kms:Decrypt",
	            "kms:GenerateDataKey*",
	            "kms:DescribeKey",
	            "kms:ReEncrypt*"
	        ],
	        "Resource": "*"
	    },
	    {
			{OTHER_POLICY_STATEMENT_FOR_ADMINISTRATING_KEY}
	    }
	]
}

```


