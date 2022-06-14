---
title: Provisioning GCP KMS Keys and Service Accounts for CMEK
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

## Step 1. Provision the cross-tenant service account

Here we will create a cross-tenant service account that can be temporarily assumed by users in another GCP project, in this case, a project managed by {{ site.data.products.dedicated }}. This service account will have permissions to use the key for encryption and decryption.

1. Find your {{ site.data.products.dedicated }} organization ID in the {{ site.data.products.db }} [organization settings page](https://cockroachlabs.cloud/settings).

1. Find your {{ site.data.products.dedicated }} cluster ID:
	
	1. Visit the {{ site.data.products.db }} console [cluster page](https://cockroachlabs.cloud/clusters).
	1. Click on the name of your cluster.
	1. Find your cluster ID in the URL of the single cluster overview page: `https://cockroachlabs.cloud/cluster/<YOUR_CLUSTER_ID>/overview`.

1. Find your {{ site.data.products.dedicated }} cluster's associated GCP Project ID.

	You must find the Project ID of the {{ site.data.products.dedicated }}-managed GCP Project associated with your cluster. To find this information, query the clusters endpoint of the {{ site.data.products.db }} API.

	{% include_cached copy-clipboard.html %}
	```shell
	curl --request GET \
	  --url https://cockroachlabs.cloud/api/v1/clusters/{YOUR_CLUSTER_ID} \
	  --header 'Authorization: Bearer {YOUR_API_KEY}' | jq
	```
	Record the following:
	- `account_id`: (the associated GCP Project ID)
	- `id`: your cluster ID

1.  Create a service account in your GCP project:

	1. In the GCP console, visit the [IAM service accounts page](https://console.cloud.google.com/iam-admin/serviceaccounts) for your project.
	1. Click **+ Create service account**.
	
1. Authorize {{ site.data.products.dedicated }}'s GCP project to use the service account (making it *cross-tenant*).
	1. Click your newly created service account's email address to visit its details page.
	1. Select the **PERMISSIONS** tab and click **ADD**.
	1. For **New principals**, enter the service account ID for the {{ site.data.products.dedicated }}-managed service account to which you will grant access to this service account.
		The service account ID takes the following format:
		`crl-kms-user-{CLUSTER_ID}@{PROJECT_ID}.iam.gserviceaccount.com`

		Where `CLUSTER_ID` is the **last 12 digits** of your cluster ID, and `PROJECT_ID` is the GCP project ID, which you obtained previously.
	1. For **Role**, enter **Service Account Token Creator**.
	1. Click **SAVE**.

	{{site.data.alerts.callout_info}}
	Note the **email address** for the service account (or keep the service account tab open), as you'll need it in Step 3.
	{{site.data.alerts.end}}

## Step 2. Create the CMEK

### Option A: Use the GCP console

1. In the GCP console, visit the [KMS page](https://console.cloud.google.com/security/kms).
1. Click **+ CREATE KEY RING** and fill in the details to complete the key ring.
1. Fill in the details and **CREATE** your encryption key:
	1. **Type**: **Generated key**.
	1. **Protection level**: **Software** 
	1. **Purpose**: **Symmetric encrypt/decrypt**

After you have provisioned the IAM role and KMS key for your CockroachDB cluster's CMEK, return to [Enabling CMEK for a {{ site.data.products.dedicated }} cluster](managing-cmek.html#step-4-enable-cmek-for-your-cockroachdb-dedicated-cluster).

### Option B: Use the Vault GCP-KMS secrets engine to create the CMEK key

Pre-requisites: 

- Vault enterprise license
- Vault enterprise edition installed locally

1. Provision a GCP service account for Vault to use to create your CMEK key.

	1. Visit the [GCP IAM roles page](https://console.cloud.google.com/iam-admin/roles) and create a new role called `cmek-vault-role`, adding the required permissions specified in the [Vault GCP-KMS documentation](https://learn.hashicorp.com/tutorials/vault/key-management-secrets-engine-gcp-cloud-kms?in=vault/key-management#configure-cloud-kms)

	1. Visit the [GCP IAM service accounts page](https://console.cloud.google.com/iam-admin/serviceaccounts) and create a service account, called `cmek-vault-agent`.

	1. From the service account's details page, select the **PERMISSIONS** tab, and attach the `cmek-vault-role`.

	1. Generate credentials for the service account.
		1. Select the **keys** tab, and click **ADD KEY**.
		1. Choose **Create new key** and then **JSON**, which will generate a credential JSON and download it to your computer.

	{{site.data.alerts.callout_info}}
	You will need the credential JSON file generated by GCP for the service account.
	{{site.data.alerts.end}}

1. Create a KMS Key Ring in your GCP project.
	1. In the GCP console, visit the [KMS page](https://console.cloud.google.com/security/kms).
	1. Click **+ CREATE KEY RING** and fill in the details to complete the key ring.

	{{site.data.alerts.callout_info}}
	You will need the name of your key ring to configure your KMS provider record in Vault.
	{{site.data.alerts.end}}

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
1. Connect Vault to your GCP account by creating a KMS provider entry:

	{{site.data.alerts.callout_info}}
	`credentials=service_account_file=` must point to your credentials file generated for the service account.
	{{site.data.alerts.end}}

	{% include_cached copy-clipboard.html %}
	```shell
	vault write keymgmt/kms/gcpckms \
    provider="gcpckms" \
    key_collection="projects/{YOUR_PROJECT_NAME}/locations/global/keyRings/{YOUR_KEY_RING_NAME}" \
    credentials=service_account_file="credentials.json"
	```

	```txt
	Success! Data written to: keymgmt/kms/gcp
	```

1. Create an encryption key in Vault.

	This will generate the encryption key and store it in Vault. Note that at this point the key has not been imported into your GCP project's KMS service.

	{% include_cached copy-clipboard.html %}
	```shell
	vault write keymgmt/key/crdb-cmek-vault type="aes256-gcm96"
	```

	```txt
	Success! Data written to: keymgmt/key/aes256-gcm96
	```

1. Propagate the key to your KMS service

	{% include_cached copy-clipboard.html %}
	```shell
	vault write keymgmt/kms/gcpkms/key/crdb-cmek-vault \
	    purpose="encrypt,decrypt" \
	    protection="hsm"
	```

	```txt
	Success! Data written to: keymgmt/kms/gcpkms/key/crdb-cmek-vault
	```

## Step 3. Authorize the service account to use the CMEK key

1. From the [GCP console KMS page](https://console.cloud.google.com/security/kms), select your KMS key, which will be named `crdb-cmek-vault-{RANDOM_SUFFIX}` where RANDOM_SUFFIX is a string of random numbers.
1. Select the **PERMISSIONS** tab.
1. Click **ADD**.
1. For **New principals**, enter the email address for your cross-tenant service account created earlier.
1. Click **Select a role** and enter **Cloud KMS CryptoKey Encrypter/Decrypter**.
1. Click **SAVE**.

After you have provisioned the IAM role and KMS key for your CockroachDB cluster's CMEK, return to [Enabling CMEK for a {{ site.data.products.dedicated }} cluster](managing-cmek.html#step-4-enable-cmek-for-your-cockroachdb-dedicated-cluster).

