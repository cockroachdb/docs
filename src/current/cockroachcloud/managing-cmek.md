---
title: Manage CMEK for CockroachDB Advanced
summary: Tutorial for getting a CockroachDB Advanced cluster up and running with Customer-Managed Encryption Keys (CMEK)
toc: true
docs_area: manage.security
---

[Customer-Managed Encryption Keys (CMEK)]({% link cockroachcloud/cmek.md %}) for CockroachDB {{ site.data.products.cloud }} advanced allows the customer to delegate responsibility for the work of encrypting their cluster data to CockroachDB {{ site.data.products.cloud }}, while maintaining the ability to completely revoke CockroachDB {{ site.data.products.cloud }}'s access.

This page shows how to enable [Customer-Managed Encryption Keys (CMEK)]({% link cockroachcloud/cmek.md %}) for CockroachDB {{ site.data.products.advanced }}.

## Prerequisites

To enable CMEK for a cluster, you need a CockroachDB {{ site.data.products.advanced }} [private cluster]({% link cockroachcloud/private-clusters.md %}) with [advanced security features]({% link cockroachcloud/create-an-advanced-cluster.md %}#step-6-configure-advanced-security-features) enabled. Advanced security features can be enabled only during cluster creation. Complete the steps in this guide before inserting data into the cluster.

This guide will walk you through creating the necessary cloud identities and encryption keys:

- An IAM role in your AWS account, a cross-tenant service account in your GCP project, or admin consent for CockroachDB Cloud to access your Azure Key Vault. CockroachDB Cloud will use this identity to encrypt and decrypt using the CMEK.
- A CMEK key for your cluster stored in AWS KMS, GCP KMS, or Azure Key Vault. CockroachDB Cloud never has access to the CMEK itself. You can use an existing key or create a new one following the instructions in this guide.

## Enable CMEK

This section shows how to enable CMEK on a CockroachDB {{ site.data.products.advanced }} cluster.

<div class="filters clearfix">
  <button class="filter-button" data-scope="aws">AWS</button>
  <button class="filter-button" data-scope="gcp">GCP</button>
  <button class="filter-button" data-scope="azure">Azure</button>
</div>

### Before you begin

<section class="filter-content" markdown="1" data-scope="aws">

1. Make a note of your {{ site.data.products.cloud }} organization ID in the [Organization settings page](https://cockroachlabs.cloud/settings).
1. Find your CockroachDB {{ site.data.products.advanced }} cluster's ID. From the CockroachDB {{ site.data.products.cloud }} console [Clusters list](https://cockroachlabs.cloud/clusters), click the name of a cluster to open its **Cluster Overview** page. From the page's URL make a note of the **last 12 digits** of the portion of the URL before `/overview/`. This is the cluster ID.
1. Use the cluster ID to find the cluster's associated cross-account IAM role, which is managed by CockroachDB {{ site.data.products.cloud }}.
    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request GET \
      --url https://cockroachlabs.cloud/api/v1/clusters/{YOUR_CLUSTER_ID} \
      --header "Authorization: Bearer {YOUR_API_KEY}" | jq .account_id
    ~~~

    In the response, verify that the `id` field matches the cluster ID you specified, then make a note of the `account_id`, which is the ID for the cross-account IAM role.

</section>

<section class="filter-content" markdown="1" data-scope="gcp">

1. Make a note of your {{ site.data.products.cloud }} organization ID in the [Organization settings page](https://cockroachlabs.cloud/settings).
1. Find your CockroachDB {{ site.data.products.advanced }} cluster's ID. From the CockroachDB {{ site.data.products.cloud }} console [Clusters list](https://cockroachlabs.cloud/clusters), click the name of a cluster to open its **Cluster Overview** page. From the page's URL make a note of the **last 12 digits** of the portion of the URL before `/overview/`. This is the cluster ID.
1. Use the cluster ID to find the cluster's associated GCP Project ID, which is managed by CockroachDB {{ site.data.products.cloud }}. Query the `clusters/` endpoint of the CockroachDB {{ site.data.products.cloud }} API:

    {% include_cached copy-clipboard.html %}
    ```shell
    CLUSTER_ID= #{ your cluster ID }
    API_KEY= #{ your API key }
    curl --request GET \
      --url https://cockroachlabs.cloud/api/v1/clusters/${CLUSTER_ID} \
      --header "Authorization: Bearer ${API_KEY}"
    ```

    In the response, verify that the `id` field matches the cluster ID you specified, then make a note of the following:
      - `account_id`: the GCP project ID.
      - `regions`/`name`: one entry for each of the cluster's regions. CMEK must be configured in each of a cluster's regions.

      ```json
      {
        "id": "blahblahblah-9ebd-43d9-8f42-589c9e6fc081",
        "name": "crl-prod-xyz",
        "cockroach_version": "v22.1.1",
        "plan": "DEDICATED",
        "cloud_provider": "GCP",
        "account_id": "crl-prod-xyz",
        "state": "CREATED",
        "creator_id": "blahblahblah-3457-471c-b0cb-c2ab15834329",
        "operation_status": "CLUSTER_STATUS_UNSPECIFIED",
        "config": {
          "dedicated": {
            "machine_type": "n1-standard-2",
            "num_virtual_cpus": 2,
            "storage_gib": 15,
            "memory_gib": 7.5,
            "disk_iops": 450
          }
        },
        "regions": [
          {
            "name": "us-east4",
            "sql_dns": "crl-prod-xyz.gcp-us-east4.cockroachlabs.cloud",
            "ui_dns": "crl-prod-xyz.gcp-us-east4.cockroachlabs.cloud",
            "node_count": 1
          }
        ],
        "created_at": "2022-06-16T17:24:06.262259Z",
        "updated_at": "2022-06-16T17:43:59.189571Z",
        "deleted_at": null
      }
      ```

1. Formulate the service account's email address, which is in the following format. Replace `{cluster_id}` with the cluster ID, and replace `{account_id}` with the GCP project ID.

    {% include_cached copy-clipboard.html %}
    ~~~ text
    crl-kms-user-{cluster_id}@{account_id}.iam.gserviceaccount.com
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="azure">

1. Find your CockroachDB {{ site.data.products.advanced }} cluster's ID. From the CockroachDB {{ site.data.products.cloud }} console [Clusters list](https://cockroachlabs.cloud/clusters), click the name of a cluster to open its **Cluster Overview** page. From the page's URL make a note of the part of the URL between `cluster/` and `/overview`. This is the cluster ID.
1. Make a note of your Azure tenant ID. You can find this in the Azure portal under **Azure Active Directory** > **Overview** > **Tenant information**.

</section>

<section class="filter-content" markdown="1" data-scope="aws">

### Step 1. Provision the cross-account IAM role

Follow these steps to create a cross-account IAM role and give it permission to access the CMEK in AWS KMS. CockroachDB Cloud will assume this role to encrypt and decrypt using the CMEK.

1. Use the CockroachDB Cloud API to find the ID of the AWS account managed by CockroachDB {{ site.data.products.cloud }} that is associated with your cluster (not your own AWS account):

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request GET \
         --url https://cockroachlabs.cloud/api/v1/clusters/{YOUR_CLUSTER_ID} \
         --header "Authorization: Bearer {YOUR_API_KEY}"
    ~~~

    In the response, the ID is stored in the `account_id` field.

1. In the AWS console, visit the [IAM page](https://console.aws.amazon.com/iam/) and select **Roles** and click **Create role**.
  - For **Trusted entity type**, select **AWS account**.
  - Select **Another AWS account** and set **Account ID**, provide the AWS account ID that you found in [Before you begin](#before-you-begin).
  - Select **Require external ID** and set **External ID** to your CockroachDB {{ site.data.products.cloud }} organization ID, which you found in [Before you begin](#before-you-begin).
  - Provide a name for the role. Do not enable any permissions.

1. Make a note of the Amazon Resource Name (ARN) for the new IAM role.

</section>

<section class="filter-content" markdown="1" data-scope="gcp">

### Step 1. Provision the cross-tenant service account

1. In the GCP Console, visit the [IAM service accounts page](https://console.cloud.google.com/iam-admin/serviceaccounts) for your project and click **+ Create service account**. Select **Cross-tenant**.
1. Click the new service account to open its details.
1. In **PERMISSIONS**, click **GRANT ACCESS**.
    - For **New principals**, enter the service account ID for your cluster, which you found in [Before you begin](#before-you-begin),
    - For **Role**, enter **Service Account Token Creator**.

    Click **SAVE**.
1. Make a note of the email address for the new service account.

</section>

<section class="filter-content" markdown="1" data-scope="azure">

### Step 1. Set up Azure identity and permissions

1. Use the CockroachDB Cloud API to get your cluster's identity ID:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    CLUSTER_ID= #{ your cluster ID }
    API_KEY= #{ your API key }
    curl --request GET \
      --url https://cockroachlabs.cloud/api/v1/clusters/${CLUSTER_ID} \
      --header "Authorization: Bearer ${API_KEY}"
    ~~~

1. In the response, find the `azure_cluster_identity_client_id` field and store its value for a future step.

1. Navigate to the following URL in your browser, replacing the placeholders with your values:

    ~~~text
    https://login.microsoftonline.com/{YOUR_TENANT_ID}/adminconsent?client_id={CLUSTER_IDENTITY_ID}
    ~~~

1. Sign in with your Azure administrator credentials.
1. Review the requested permissions ("Sign in and read user profile") and click **Accept**.

This creates an enterprise application in your Azure tenant that CockroachDB Cloud can use to access your Key Vault. It is named using the following format:

~~~
CockroachDB Cloud - <CLUSTER_ID>
~~~


</section>

### Step 2. Create the CMEK key

If you intend to use an existing key as the CMEK, skip this step.

<section class="filter-content" markdown="1" data-scope="aws">

You can create the CMEK directly in the AWS Console or using <a href="https://www.cockroachlabs.com/docs/stable/hashicorp-integration">HashiCorp Vault</a>.

<div class="filters clearfix">
  <button class="filter-button" data-scope="aws-console">AWS Console</button>
  <button class="filter-button" data-scope="aws-hashicorp-vault">Hashicorp Vault</button>
</div>

<section class="filter-content" markdown="1" data-scope="aws-console">

1. In the AWS console, visit [AWS KMS](https://console.aws.amazon.com/kms/).
1. To create the key, select **Customer managed keys** and click **Create Key**.
    - Set **Key type** to **Symmetric Key**.
    - Set **Key usage** to **Encrypt and decrypt**.
    - Under **Advanced options**, set **Key material** to **KMS**, then choose whether to create a single-region or multi-region key. For optimal performance, we recommend serving the key in each of your cluster's regions.
    - Set **Alias** to a name for the key.
1. Configure the permissions for your key using the following IAM policy:

    {% include_cached copy-clipboard.html %}
    ~~~json
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

    ~~~

1. Finish creating the key.

</section>

<section class="filter-content" markdown="1" data-scope="aws-hashicorp-vault">

{% capture vault_client_steps %}1. [Install Vault Enterprise Edition installed locally](https://learn.hashicorp.com/tutorials/nomad/hashicorp-enterprise-license?in=vault/enterprise).

1. Configure Vault's authentication details:

    {% include_cached copy-clipboard.html %}
    ~~~shell
      export VAULT_ADDR={YOUR_VAULT_TARGET}
      export VAULT_TOKEN={YOUR_VAULT_TOKEN}
      export VAULT_NAMESPACE="admin"
    ~~~

1. Enable Vault KMS Secrets Engine:
    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault secrets enable keymgmt
    ~~~{% endcapture %}

{{ vault_client_steps }}

1. Connect Vault to your AWS account by creating a KMS provider entry:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault write keymgmt/kms/awskms \
      provider="awskms" \
      key_collection="us-east-1" \
      credentials=access_key="{your access key}" \
      credentials=secret_key="{your secret key}"
    ~~~

1. Create an encryption key in Vault. The key has not yet been imported into AWS KMS.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault write keymgmt/key/crdb-cmek-vault type="aes256-gcm96"
    ~~~

1. Import the key into AWS KMS:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault write keymgmt/kms/awskms/key/crdb-cmek-vault \
        purpose="encrypt,decrypt" \
        protection="hsm"
    ~~~

1. In the AWS console, visit the [KMS page](https://console.aws.amazon.com/kms/).
1. Choose **Customer managed keys**.
1. Select the key you just created in Vault, which will be prefixed with `crdb-cmek-vault`.
1. Set the permissions policy for your key with the `crdb-cmek-kms` IAM policy provided in the [Appendix](#appendix-iam-policy-for-the-cmek-key).
1. Save to finish creating the key.

</section>

</section>

<section class="filter-content" markdown="1" data-scope="gcp">

You can create the CMEK directly in the GCP Console or using <a href="https://www.cockroachlabs.com/docs/stable/hashicorp-integration">HashiCorp Vault</a>.

<div class="filters clearfix">
  <button class="filter-button" data-scope="gcp-console">GCP Console</button>
  <button class="filter-button" data-scope="gcp-hashicorp-vault">Hashicorp Vault</button>
</div>

<section class="filter-content" markdown="1" data-scope="gcp-console">

1. In the GCP console, visit the [KMS page](https://console.cloud.google.com/security/kms).
1. Click **+ CREATE KEY RING** and fill in the details to complete the key ring.
1. In the next screen, configure your encryption key as desired. Set the following:
    - **Type**: **Generated key**.
    - **Protection level**: **Software**
    - **Purpose**: **Symmetric encrypt/decrypt**

    Click **Create**.

Make a note of the key ring name.

</section>

<section class="filter-content" markdown="1" data-scope="gcp-hashicorp-vault">

1. In the GCP Console, visit the [KMS page](https://console.cloud.google.com/security/kms) and click **+ CREATE KEY RING** to create a key ring for your encryption key. Make a note of the name of the key ring, which you will provide to Vault to create your encryption key.

1. Visit the [GCP IAM roles page](https://console.cloud.google.com/iam-admin/roles) and create a new role called `cmek-vault-role`. Add the required permissions specified in the [Vault GCP-KMS documentation](https://learn.hashicorp.com/tutorials/vault/key-management-secrets-engine-gcp-cloud-kms?in=vault/key-management#configure-cloud-kms). Also add the permission `cloudkms.importJobs.useToImport`, which allows the role to import keys into GCP.

1. Visit the [GCP IAM service accounts page](https://console.cloud.google.com/iam-admin/serviceaccounts) and create a service account, called `cmek-vault-agent`. Vault will use this service account to create your CMEK key.

1. From the service account's details page, select the **PERMISSIONS** tab, and attach the `cmek-vault-role`.

1. To generate credentials for the service account, select the **keys** tab, and click **ADD KEY**. Choose **Create new key**, then select **JSON** to generate a credential file in JSON format and download it. You will need the credential JSON file generated by GCP for the service account. Store it in a secure location such as a password manager.

{{ vault_client_steps }}

1. Connect Vault to your GCP project by creating a KMS provider entry. Replace `{SERVICE_ACCOUNT_FILE}` with the path to the JSON file you downloaded earlier and replace `{YOUR_PROJECT_NAME}` with your GCP project ID.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    vault write keymgmt/kms/gcpckms \
    provider="gcpckms" \
    key_collection="projects/{YOUR_PROJECT_NAME}/locations/global/keyRings/{YOUR_KEY_RING_NAME}" \
    credentials=service_account_file="{SERVICE_ACCOUNT_FILE}"
    ~~~

1. Create the encryption key in Vault:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    vault write keymgmt/key/crdb-cmek-vault type="aes256-gcm96"
    ~~~

1. Import the key into GCP KMS:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    vault write keymgmt/kms/gcpkms/key/crdb-cmek-vault \
        purpose="encrypt,decrypt" \
        protection="hsm"
    ~~~

1. To authorize the service account to use the CMEK key, visit the [GCP console KMS page](https://console.cloud.google.com/security/kms) and select your KMS key, which will be prefixed with `crdb-cmek-vault`. From the the **PERMISSIONS** tab, click **ADD**.
     - For **New principals**, enter the email address for your cross-tenant service account.
    -  Click **Select a role** and enter **Cloud KMS CryptoKey Encrypter/Decrypter**.

    Click **SAVE**. Make a note of the key ring name.

</section>
</section>

<section class="filter-content" markdown="1" data-scope="azure">

For these instructions, you can use an existing Azure Key Vault, or create a new key vault using the [Azure portal](https://learn.microsoft.com/azure/key-vault/general/quick-create-portal) or [CLI](https://learn.microsoft.com/azure/key-vault/general/quick-create-cli).

1. In the Azure portal, navigate to your Key Vault.
1. On the Key Vault left-hand sidebar, select **Objects** then select **Keys**.
1. **Select + Generate/Import**.
1. Enter a **Name** for the key, and click **Create**.
1. Click the key name, and under Current Version, click the key.
1. In the **Key Identifier** field, click the copy button. The URL will use the following format. Store it for a future step. 
    
    ~~~text
    https://<keyVaultName>.vault.azure.net/keys/<keyName>/<version>
    ~~~

1. Navigate to your Key Vault > **Access control (IAM)** > **Add role assignment**.
1. Select the **Key Vault Crypto Officer** role, and select the option to assign access to **User, group, or service principal**.
1. Click **Select members**, then search for the enterprise application created above: `CockroachDB Cloud - <CLUSTER_ID>`.

</section>
</section>

### Step 3. Build your CMEK configuration manifest

Compile the information about the service account and key we've just created into a manifest, which you will use to activate CMEK on your cluster with the CockroachDB {{ site.data.products.cloud }} API.

<section class="filter-content" markdown="1" data-scope="aws">
1. Create a new file named `cmek_config.json` with the following contents. This file will contain a JSON array of `region_spec` objects, each of which includes the name of a CockroachDB {{ site.data.products.cloud }} region and a `key_spec` that specifies the URI of the CMEK key and the principal that is authorized to encrypt and decrypt using the key.

    Replace the placeholder values, being careful to include one `region_spec` object per cluster region. When enabling CMEK, you must include a `region_spec` for each region in the cluster.

    {% include_cached copy-clipboard.html %}
    ~~~ json
    {
      "region_specs": [
        {
          "region": "{COCKROACHDB_CLOUD_REGION}",
          "key_spec": {
            "type": "AWS_KMS",
            "uri": "{YOUR_AWS_KMS_KEY_ARN}",
            "auth_principal": "{YOUR_AWS_IAM_ROLE_ARN}"
          }
        },
        {
          "region": "{COCKROACHDB_CLOUD_REGION}",
          "key_spec": {
            "type": "AWS_KMS",
            "uri": "{YOUR_AWS_KMS_KEY_ARN}",
            "auth_principal": "{YOUR_AWS_IAM_ROLE_ARN}"
          }
        }
      ]
    }
    ~~~

</section>

<section class="filter-content" markdown="1" data-scope="gcp">
1. Set the required information as environment variables:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    export CLUSTER_REGION= # the region of the {{ site.data.products.advanced}}-controlled GCP project where your cluster is located
    export GCP_PROJECT_ID= # your GCP project ID
    export KEY_LOCATION= # location of your KMS key (region or 'global')
    export KEY_RING= # your KMS key ring name
    export KEY_NAME= # your CMEK key name, i.e., crdb-cmek-vault-{RANDOM_SUFFIX}
    export SERVICE_ACCOUNT_EMAIL= # email for your cross-tenant service account
    ~~~

1. Then copy paste the following heredoc command to generate the YAML file, populating the values from your shell environment. (Alternatively, you can manually create the YAML file).

    {% include_cached copy-clipboard.html %}
    ~~~shell
    <<YML > cmek_config.yml
    ---
    region_specs:
    - region: "${CLUSTER_REGION}"
      key_spec:
        type: GCP_CLOUD_KMS
        uri: "projects/${GCP_PROJECT_ID}/locations/${KEY_LOCATION}/keyRings/${KEY_RING}/cryptoKeys/${KEY_NAME}"
        auth_principal: "${SERVICE_ACCOUNT_EMAIL}"
    YML
    ~~~

1. Use Ruby or another tool to compile human-editable YAML into API-parsable JSON:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    ruby -ryaml -rjson -e 'puts(YAML.load(ARGF.read).to_json)' < cmek_config.yml > cmek_config.json
    ~~~

</section>

<section class="filter-content" markdown="1" data-scope="azure">

1. Create a new file named `cmek_config.json` with the following contents. Replace the placeholder values, being careful to include one `region_spec` object per cluster region. When enabling CMEK, you must include a `region_spec` for each region in the cluster.

    {% include_cached copy-clipboard.html %}
    ~~~ json
    {
      "region_specs": [
        {
          "region": "{COCKROACHDB_CLOUD_REGION}",
          "key_spec": {
            "type": "AZURE_KEY_VAULT",
            "uri": "{YOUR_KEY_IDENTIFIER_URL}",
            "auth_principal": "{YOUR_TENANT_ID}"
          }
        }
      ]
    }
    ~~~

    Replace the placeholder values:
    - `{COCKROACHDB_CLOUD_REGION}`: Your cluster's region (e.g., "centralindia")
    - `{YOUR_KEY_IDENTIFIER_URL}`: The Key Identifier URL you copied in Step 2
    - `{YOUR_TENANT_ID}`: Your Azure tenant ID

</section>

1. Use the shell utility JQ to inspect JSON payload:

    {{site.data.alerts.callout_info}}
    On a Mac, install JQ with `brew install jq`
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~shell
    cat cmek_config.json | jq
    ~~~

After you have built your CMEK configuration manifest with the details of your cluster and provisioned the necessary cloud identity and encryption key, proceed to Step 4.

### Step 4. Activate CMEK

Using the CockroachDB {{ site.data.products.cloud }} API, send a `POST` request with the contents of `cmek_config.json` to the cluster's `cmek` endpoint.

{% include_cached copy-clipboard.html %}
~~~ shell
CLUSTER_ID= #{ your cluster ID }
API_KEY= #{ your API key }
curl --request POST \
  --url https://cockroachlabs.cloud/api/v1/clusters/${CLUSTER_ID}/cmek \
  --header "Authorization: Bearer ${API_KEY}" \
  --header "content-type: application/json" \
  --data "@cmek_config.json"
~~~

## Check CMEK status

To view your cluster's CMEK status, send a `GET` request:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/cmek \
  --header "Authorization: Bearer ${API_KEY}"
~~~

## Rotate a CMEK key

{% include cockroachcloud/cmek-rotation-types.md %}

{{site.data.alerts.callout_danger}}
Within your KMS, **do not** revoke access to, disable, schedule for destruction, or destroy a CMEK after it is rotated. It is still required to access data that was written using it. that is in use by one or more clusters. The CMEK is an external resource and is never stored in CockroachDB {{ site.data.products.cloud }}. If the CMEK for a cluster or region is not available in your KMS, nodes that are configured to use it cannot rejoin the cluster if they are restarted, and the cluster's managed CockroachDB {{ site.data.products.cloud }} backups will fail. Even if access to the CMEK is restored, affected nodes cannot automatically recover. For assistance in that situation, contact your Cockroach Labs account team.
{{site.data.alerts.end}}

To rotate a CMEK key:

1. Edit or recreate the cluster's `cmek_config.json` to update the `region_spec` objects, each of which includes the name of a CockroachDB {{ site.data.products.cloud }} region and a `key_spec` that specifies the URI of the CMEK key and the principal that is authorized to encrypt and decrypt using the key.

1. Using the CockroachDB {{ site.data.products.cloud }} API, send a `PUT` request with the contents of `cmek_config.json` to the cluster's `cmek` endpoint:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    CLUSTER_ID= #{ your cluster ID }
    API_KEY= #{ your API key }
    curl --request PUT \
      --url https://cockroachlabs.cloud/api/v1/clusters/${CLUSTER_ID}/cmek \
      --header "Authorization: Bearer ${API_KEY}" \
      --header "content-type: application/json" \
      --data "@cmek_config.json"
    ~~~

## Add a region to a CMEK-enabled cluster

To add a region to a cluster that already has CMEK enabled:

1. Edit or recreate the cluster's `cmek_config.json` to update the `region_spec` objects, each of which includes the name of a CockroachDB {{ site.data.products.cloud }} region and a `key_spec` that specifies the URI of the CMEK key and the principal that is authorized to encrypt and decrypt using the key.

1. Send the payload as a `PATCH` request to the cluster endpoint:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    CLUSTER_ID= #{ your cluster ID }
    API_KEY= #{ your API key }
    curl --request PATCH \
      --url https://cockroachlabs.cloud/api/v1/clusters/${CLUSTER_ID} \
      --header "Authorization: Bearer ${API_KEY}" \
      --header "content-type: application/json" \
      --data "@cmek_config.json"
    ~~~

## Revoke CMEK for a cluster

When you revoke access to the CMEK in your KMS, CockroachDB Cloud can no longer encrypt or decrypt your cluster's data. All access to the cluster's data will be prevented until you you restore access. In general, revoke access to the CMEK only when you are permanently decommissioning the cluster or to mitigate a critical security breach or at the request of Cockroach Labs support.

Within your KMS platform, you can revoke access to the CMEK temporarily or permanently.

{{site.data.alerts.callout_danger}}
Within your KMS, **do not revoke** access to a CMEK that is in use by one or more clusters. The CMEK is an external resource and is never stored in CockroachDB {{ site.data.products.cloud }}.
{{site.data.alerts.end}}

1. In your cloud provider's KMS platform, revoke CockroachDB {{ site.data.products.cloud }}'s access to your CMEK key at the IAM level, either by removing the authorization the cross-account IAM role or by removing the cross-account IAM role's permission to access the key.

   This will **not** immediately stop your cluster from encrypting and decrypting data, which does not take effect until you update your cluster in the next step. That is because CockroachDB does not use your CMEK key to encrypt/decrypt your cluster data itself. CockroachDB {{ site.data.products.advanced }} accesses your CMEK key to encrypt/decrypt a key encryption key (KEK). This KEK is used to encrypt a data encryption key (DEK), which is used to encrypt/decrypt your application data. Your cluster will continue to use the already-provisioned DEK until you make the Cloud API call to revoke CMEK.

1. Your cluster will continue to operate with the CMEK until you update it to revoke CMEK. To revoke access:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --request PATCH \
      --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/cmek \
      --header "Authorization: Bearer ${API_KEY}" \
      --header "content-type: application/json" \
      --data '{"action":"REVOKE"}'
    ~~~

1. [Check your CMEK status](#check-cmek-status) to confirm the revocation has taken effect.

1. Once you have resolved the security incident, re-authorize CMEK for your cluster to return to normal operations. Contact your account team, or [create a support ticket](https://support.cockroachlabs.com/).

<section class="filter-content" markdown="1" data-scope="aws">

## Appendix: IAM policy for the CMEK key

This IAM policy is to be attached to the CMEK key. It grants the required KMS permissions to the cross-account IAM role to be used by CockroachDB {{ site.data.products.advanced }}.

Note that this IAM policy refers to the ARN for the cross-account IAM role you created at the end of [Step 1. Provision the cross-account IAM role](#step-1-provision-the-cross-account-iam-role).

{% include_cached copy-clipboard.html %}
~~~json
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

~~~

</section>
