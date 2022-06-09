---
title: Provisioning Google Cloud Platform (GCP) for CMEK
summary: Tutorial for provisioning CMEK in GCP, covering initial set-up, revocation, and recovery scenarios.
toc: true
docs_area: manage.security
---

This page covers the procedures required to provision a Customer Managed Encryption Key (CMEK) for your {{ site.data.products.dedicated }} cluster with Google Cloud Platform (GCP).

This is part of the larger process of [Enabling CMEK for a {{ site.data.products.dedicated }} cluster](managing-cmek.html#enable-cmek).

{{site.data.alerts.callout_info}}
For multi-region clusters, you must provide a key and authorized service account combination per region. You can either:

- provide the same key for all your cluster regions.
- provide a different key per cluster region.
- provide a single dual- or multi-region key or global key for the entire cluster. See [GCP's Cloud KMS location docs](https://cloud.google.com/kms/docs/locations).
{{site.data.alerts.end}}

## Step 1: Provision the cross-tenant service account

Here we will create a cross-tenant service account that can be temporarily assumed by users in another account, in this case, Cockroach Labs' account. This service account will have permissions to use the key for encryption and decryption.

{{site.data.alerts.callout_info}}
To create this link, you will also need your {{ site.data.products.dedicated }} Organization ID, which you can find from the {{ site.data.products.db }} console [clusters page](https://cockroachlabs.cloud/cluster).

Make sure you have the updated Organization ID from after CMEK has been enabled for your organization.
{{site.data.alerts.end}}

1. Find Cockroach Labs' GCP Project ID
	
	You must find the Project ID of Cockroach Labs' GCP Project associated with your cluster, as well as your cluster id. To find this information, query the clusters endpoint of the {{ site.data.products.db }} API.

	{% include_cached copy-clipboard.html %}
	```shell
	curl --request GET \
	  --url https://cockroachlabs.cloud/api/v1/clusters/{YOUR_CLUSTER_ID} \
	  --header 'Authorization: Bearer {YOUR_API_KEY}' | jq
	```
	Record the following:
	- `account_id`: (the associated GCP Project ID)
	- `id`: your cluster id

1.  Create a a cross-tenant service account in your GCP project:

	1. In the GCP console, visit the [IAM service accounts page](https://console.cloud.google.com/iam-admin/serviceaccounts) for your project.
	1. Click **+ Create service account**. At this stage, you do not need to add permissions.
	

## Step 2: Create the CMEK

1. In the GCP console, visit the [KMS page](https://console.cloud.google.com/security/kms).
1. Click **+ CREATE KEY RING** and fill in the details to complete the key ring.
1. Fill in the details and **CREATE** your encryption key:
	1. **Type**: **Generated key**.
	1. **Protection level**: **Software** 
	1. **Purpose**: **Symmetric encrypt/decrypt**

## Step 3: Authorize the service account on the CMEK


