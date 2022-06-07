---
title: Provisioning Google Cloud Platform (GCP) for CMEK
summary: Tutorial for provisioning CMEK in GCP, covering initial set-up, revocation, and recovery scenarios.
toc: true
docs_area: manage.security
---

This page covers the procedures requried to provision a Customer Managed Encryption Key (CMEK) for your {{ site.data.products.dedicated }} cluster with Google Cloud Platform (GCP).

This is part of the larger process of [Enabling CMEK for a {{ site.data.products.dedicated }} cluster](managing-cmek.html#enabling-cmek).




{{site.data.alerts.callout_info}}
For multi-region clusters, you must provide a key and IAM role combination per region. You can either:

- provide the same key for all your cluster regions.
- provide a different key per cluster region.
- provide a single multi-region key for the entire cluster.
{{site.data.alerts.end}}

## Step 1: Provision the IAM role

## Step 2: Create the key

1. Navigate to the GCP console [KMS page](https://console.cloud.google.com/security/kms).
1. Select **+ CREATE KEY RING** and create a key ring for your cluster's CMEK.
1. Configure your new key:
	1. Select **Generated key**.
	1. Select **Symmetric encrypt/decrypt** for **Purpose**.


Note down the resource IDs of the KMS Key(s). Do not specify a version as CockroachDB Dedicated will use the latest active version for encryption, and any previous rotated versions for decryption (if data being accessed was last written & encrypted before automatic rotation). 

The resource ID format should look like the following:

projects/{project-id}/locations/{project-location}/keyRings/{key-ring-name}/cryptoKeys/{key-name}

