---
title: Managing Customer-Managed Encryption Keys (CMEK) for CockroachDB Dedicated
summary: Tutorial for getting a dedicated cluster up and running with Customer-Managed Encryption Keys (CMEK)
toc: true
docs_area: manage.security
---

Customer-Managed Encryption Keys (CMEK) for {{ site.data.products.dedicated }} allows the customer to delegate responsibility for the work of encrypting their cluster data to {{ site.data.products.dedicated }}, while maintaining the ability to completely revoke {{ site.data.products.dedicated }}'s access.

{{site.data.alerts.callout_info}}
This feature is a Private Preview release, limited to customers for whom it is enabled, upon their request.
{{site.data.alerts.end}}

This page guides the user through the process of enabling Customer-Managed Encryption Keys (CMEK) for your {{ site.data.products.dedicated }} cluster.

To follow this procedure requires admin access to your {{ site.data.products.dedicated }} organization, and the ability to create and manage identity and access management (IAM) and key management (KMS) services in your organization's cloud, i.e., your Google Cloud Platform (GCP) project or Amazon Web Services (AWS) account.

See also:

- [Customer-Managed Encryption Key (CMEK) frequently asked questions (FAQ)](cmek-faq.html)
- [Encryption at Rest (Enterprise)](../{{site.versions["stable"]}}/security-reference/encryption.html#encryption-at-rest)

## Overview of CMEK management procedures

This section gives a high level overview of the operations involved with implementing CMEK with your {{ site.data.products.dedicated }} cluster.

- [Enabling CMEK](#enable-cmek) for a {{ site.data.products.dedicated }} requires several steps:

	- Turning on the {{ site.data.products.dedicated }} CMEK feature.
	- Provisioning an encryption key with your cloud provider's key management service (KMS).
	- Granting {{ site.data.products.db }} access to the CMEK i.e., the key you control.
	- Switching your cluster to use the CMEK.

- [Checking CMEK status](#check-cmek-status) allows you to inspect the CMEK state of your cluster with a call to the Cluster API.

- [Revoking CMEK for a cluster](#revoking-cmek-for-a-cluster) by revoking {{ site.data.products.dedicated }}'s access to your CMEK at the IAM/KMS level.

- [Restore CMEK following a revocation event](#restore-cmek-following-a-revocation-event) by reauthorizing {{ site.data.products.db }} to use your key, and coordinating with our support team to assist in recovering your Organization.

## Enable CMEK

### Step 1. Prepare your {{ site.data.products.dedicated }} Organization

1. To start the process, contact {{ site.data.products.dedicated }} by reaching out to your account team, or [creating a support ticket](https://support.cockroachlabs.com/). You must provide your **Organization ID**, which you can find in your [Organization settings page](https://cockroachlabs.cloud/settings).

	They will enable the CMEK feature for your {{ site.data.products.dedicated }} Organization.

1. [Create a {{ site.data.products.db }} service account](console-access-management.html#service-accounts).

1. [Create an API key](console-access-management.html#create-api-keys) for the service account to use.

### Step 2. Provision your cluster

1. Create a new {{ site.data.products.dedicated }} cluster. There are two ways to do this:
	- [Using the {{ site.data.products.db }} console clusters page](https://cockroachlabs.cloud/cluster).
	- [Using the Cloud API](cloud-api.html#create-a-new-cluster). 

### Step 3. Provision IAM and KMS in your Cloud

Next, you must provision the resources required resources in your Cloud, whether this is AWS or GCP:

1. The cross-account IAM role (in AWS) or service account (in GCP) that {{ site.data.products.dedicated }} will use to access your key.

1. The key itself.

Follow the instructions depending on your cloud provider:

- [Provisioning Amazon Web Services (AWS) for CMEK](cmek-ops-aws.html)
- [Provisioning Google Cloud Platform (GCP) for CMEK](cmek-ops-gcp.html) 

### Step 4. Enable CMEK for your {{ site.data.products.dedicated }} Cluster

Enable CMEK for your cluster with a call to the clusters CMEK endpoint:

See the [API specification](../api/cloud/v1.html#operation/CockroachCloud_EnableCMEK).

{% include_cached copy-clipboard.html %}
```shell
curl --request POST \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/cmek \
  --header 'Authorization: Bearer REPLACE_BEARER_TOKEN' \
  --header 'content-type: application/json' \
  --data '{"region_specs":[{"region":"us-central1","key_spec":{"type":"AWS_KMS","uri":"arn:aws:kms:us-west-2:111122223333:key/id-of-kms-key","auth_principal":"arn:aws:iam::account:role/role-name-with-path"}}]}'
```

## Check CMEK status

An API call displays information about your cluster's use of CMEK: 

See the [API specification](../api/cloud/v1.html#operation/CockroachCloud_GetCMEKClusterInfo).

{% include_cached copy-clipboard.html %}
```shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/cmek \
  --header 'Authorization: Bearer REPLACE_BEARER_TOKEN'
```

## Revoking CMEK for a cluster

Revoking access to the CMEK means disabling all encryption/decryption of data in your cluster, which means preventing reading and writing any data from or to your cluster. This likely implies a shutdown of your service, with significant business implications. This is a disaster mitigation tactic to be used only in a scenario involving a severe, business critical security breach.

This can be done temporarily or permanently. This action is performed at the level of your Cloud Provider.

### Step 1. Revoke IAM access

{{site.data.alerts.callout_danger}}
Do not delete the CMEK key.
Deleting the CMEK key will permanently prevent decryption of your data, preventing all possible access and rendering the data inaccessible.
{{site.data.alerts.end}}

First, revoke {{ site.data.products.dedicated }}'s access to your key at the IAM level with your cloud provider. 

You can do this two ways:

- Remove the authorization granted to CockroachDB Dedicated cluster with your cross-account IAM role.
- Remove the KMS key permissions from the IAM policy attached to your cross-account IAM role.

This will **not** immediately stop your cluster from encrypting and decrypting data, which does not take effect until you update your cluster in the next step.

That is because CockroachDB does not use your CMEK key to encrypt/decrypt your cluster data itself. {{ site.data.products.dedicated }} accesses your CMEK key to encrypt/decrypt a key encryption key (KEK). This KEK is used to encrypt a data encryption key (DEK), which is used to encrypt/decrypt your application data. Your cluster will continue to use the already-provisioned DEK until you make the Cloud API call to revoke CMEK.

### Step 2. Update your cluster to stop using the CMEK key for encryption
	
Your cluster will continue to operate with the encryption keys it has provisioned with your CMEK key until you update it to revoke CMEK.

1. Update your cluster with the the Cloud API as follows:

	See the [API specification](../api/cloud/v1.html#operation/CockroachCloud_UpdateCMEKStatus).

	{% include_cached copy-clipboard.html %}
	```shell
	curl --request PATCH \
	  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/cmek \
	  --header 'Authorization: Bearer REPLACE_BEARER_TOKEN' \
	  --header 'content-type: application/json' \
	  --data '{"action":"REVOKE"}'
	```

1. [Check your CMEK status](#check-cmek-status) to confirm the revocation has taken effect.

### Step 3. Assess and resolve the situation

Once you have resolved the security incident, re-authorize CMEK for your cluster to return to normal operations.

## Restore CMEK following a revocation event

To restore CMEK after the incident has been resolved, reach out to your account team, or [create a support ticket](https://support.cockroachlabs.com/).