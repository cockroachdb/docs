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
<<<<<<< HEAD
	- From the {{ site.data.products.db }} console [clusters page](https://cockroachlabs.cloud/cluster).
	- [Using the Cloud API](cloud-api.html#create-a-new-cluster).
=======
	- [Using the {{ site.data.products.db }} console clusters page](https://cockroachlabs.cloud/cluster).
	- [Using the Cloud API](cloud-api.html#create-a-new-cluster). 
>>>>>>> cb68e2f85 (WIP CMEK tutorials)

### Step 3. Provision IAM and KMS in your IaaS

Next, you must provision the resources required resources in your IaaS, whether this is AWS or GCP:

1. The cross-account IAM role that Cockroach Labs will use to access your key.

1. The key itself.

Follow the instructions depending on your IaaS:

- [Provisioning Amazon Web Services (AWS) for CMEK](cmek-ops-aws.html)
- [Provisioning Google Cloud Platform (GCP) for CMEK](cmek-ops-gcp.html)

### Step 4. Enable CMEK for your CockroachDB Cluster

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

### Step 1. Revoke IAM access

Revoke CMEK for a cluster by revoking {{ site.data.products.db }}'s access to your key at the IAM level with your infrastructure provider. This will immediately prevent all access to your data, but can be reversed by reauthorizing access to the key.

Deleting the key will permanently prevent decryption of your data, preventing all possible access and rendering the database unusable and data inaccessible.

### Step 2. Assess and resolve the situation

Eventually, you'll resolve the security incident and re-authorize CMEK for your cluster to return to normal operations.

## Restore CMEK following a revocation event

To restore CMEK after the incident has been resolved, reach out to your account team, or [creating a support ticket](https://support.cockroachlabs.com/)

## Disable CMEK for your cluster

It is possible to disable the CMEK feature to return to using {{ site.data.products.db }}-managed encryption.

1. [Revoke CMEK](#revoking-cmek-for-a-cluster) for your cluster.
1. Provision a symmetric encryption key in your own organization's infrastructure account, either Google Cloud Platform (GCP) or Amazon Web Services (AWS).
1. Create a service account in your organization that has permission to encrypt and decrypt with that key.
1. Revoke CMEK with a call to the Cloud API.
	
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
