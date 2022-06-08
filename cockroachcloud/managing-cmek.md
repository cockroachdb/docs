---
title: Managing Customer Managed Encryption Keys (CMEK) for Cockroach Dedicated
summary: Tutorial for getting a dedicated cluster up and running with Customer Managed Encryption Keys (CMEK)
toc: true
docs_area: manage.security
---

Customer Managed Encryption Keys (CMEK) for {{ site.data.products.dedicated }} allows the customer to delegate responsibility for the work of encrypting their application data to Cockroach Labs, while maintaining the ability to completely revoke Cockroach Labs' access with a single operation.

This page walks the user through the process of enabling Customer Managed Encryption Keys (CMEK) for your {{ site.data.products.dedicated }} cluster.

See also:

- [Customer Managed Encryption Key (CMEK) frequently asked questions (FAQ)](cmek-faq.html)
- [Encryption at Rest (enterprise)](../{{site.versions["stable"]}}/security-reference/encryption.html#encryption-at-rest-enterprise)

## Overview of CMEK management procedures

This section gives a high level sketch of the operations involved with implementing CMEK with your CockroachDB cluster.

- [Enabling CMEK](#enable-cmek) for a {{ site.data.products.dedicated }} requires several steps:

	- Turning on the {{ site.data.products.dedicated }} feature.
	- Provisioning an encryption key with your infrastructure as a service (IaaS) provider's key management service (KMS).
	- Granting {{ site.data.products.db }} access to the CMEK i.e. the key you control.
	- Switching your cluster to use the CMEK.

- [Checking CMEK status](#check-cmek-status) allows you to inspect the CMEK state of your cluster with a call to the Cluster API.

- [Revoking CMEK for a cluster](#revoking-cmek-for-a-cluster) by revoking Cockroach Labs' access to your CMEK at the IAM/KMS level.

- [Restore CMEK following a revocation event](#restore-cmek-following-a-revocation-event) by reauthorizing {{ site.data.products.db }} to use your key, and coordinating with our service team to assist in recovering your Organization.

- [Disabling CMEK](#disable-cmek-for-your-cluster) to return to {{ site.data.products.db }}-managed encryption: The {{ site.data.products.dedicated }} feature can disabled, allowing your cluster to return to the default state of using encryption keys managed by Cockroach Labs.

## Enable CMEK

### Step 1. Prepare your {{ site.data.products.dedicated }} Organization

1. To start the process, contact Cockroach Labs by reaching out to your account team, or [creating a support ticket](https://support.cockroachlabs.com/). You must provide your **Organization ID**, which you can find in your [Organization settings page](https://cockroachlabs.cloud/settings).

	They will enable the [Cloud API](cloud-api.html) and CMEK for your {{ site.data.products.dedicated }} Organization.

	{{site.data.alerts.callout_info}}
	The upgrade process will generate a new Organization ID. You will need this new Organization ID when provisioning the crucial cross-account IAM role that will allow Cockroach Labs to encrypt/decrypt on your behalf with the CMEK.
	{{site.data.alerts.end}}

1. [Create a {{ site.data.products.db }} service account](console-access-management.html#service-accounts).

1. [Create an API key](console-access-management.html#create-api-keys) for the service account to use.

### Step 2. Provision your cluster

1. Create a new {{ site.data.products.dedicated }} cluster. You can do this either of two ways:
	- [Using the {{ site.data.products.db }} console clusters page](https://cockroachlabs.cloud/cluster).
	- [Using the Cloud API](cloud-api.html#create-a-new-cluster). 

### Step 3. Provision IAM and KMS in your IaaS

Next, you must provision the resources required resources in your IaaS, whether this is AWS or GCP:

1. The cross-account IAM role that Cockroach Labs will use to access your key.

1. The key itself.

Follow the instructions depending on your IaaS:

- [Provisioning Amazon Web Services (AWS) for CMEK](cmek-ops-aws.html)
- [Provisioning Google Cloud Platform (GCP) for CMEK](cmek-ops-gcp.html) 

### Step 4. Enable CMEK for your CockroachDB Cluster

Enable CMEK for your cluster with a call to the clusters CMEK endpoint:

[API specification](../api/cloud/v1.html#operation/CockroachCloud_EnableCMEK)

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

[API specification](../api/cloud/v1.html#operation/CockroachCloud_GetCMEKClusterInfo)

{% include_cached copy-clipboard.html %}
```shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/cmek \
  --header 'Authorization: Bearer REPLACE_BEARER_TOKEN'
```

## Revoking CMEK for a cluster

Revoking access to the CMEK means disabling all encryption/decryption of data in your database, which means preventing reading and writing any data from or to your database. This likely implies a shutdown of your service, with significant business implications. This is a disaster mitigation tactic to be used only in scenario involving a severe, business critical security breach.

This can be done temporarily or permanently. This action is performed at the level of your infrastructure (IaaS).

### Step 1: Revoke IAM access

{{site.data.alerts.callout_danger}}
Do not delete the CMEK key.
Deleting the CMEK key will permanently prevent decryption of your data, preventing all possible access and rendering the data inaccessible.
{{site.data.alerts.end}}

First, revoke Cockroach Labs' access to your key at the IAM level with your infrastructure provider. 

This will **not** immediately stop your cluster from encrypting and decrypting data, which does not take effect until you update your cluster in the next step.

That is because CockroachDB does not use your CMEK key to encrypt/decrypt data, but only to encrypt/decrypt a key encryption key (KEK). The KEK is used to encrypt a data encryption key (DEK), which is used to encrypt/decrypt your application data.

Your cluster will continue to use the already-provisioned DEK until you make the Cloud API call to revoke CMEK.



### Step 2: Update your cluster to stop using the CMEK key for encryption
	
Your cluster will continue to operate with the encryption keys it has provisioned with your CMEK key until you order it to switch off of CMEK, and use a Cockroach Labs managed encryption key instead.

1. Update your cluster with the the Cloud API as follows:

	[API specification](../api/cloud/v1.html#operation/CockroachCloud_UpdateCMEKStatus)

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

Eventually, you'll resolve the security incident and re-authorize CMEK for your cluster to return to normal operations.

## Restore CMEK following a revocation event

To restore CMEK after the incident has been resolved, reach out to your account team, or [creating a support ticket](https://support.cockroachlabs.com/)


