---
title: Manage CMEK for CockroachDB Advanced
summary: Tutorial for getting a CockroachDB Advanced cluster up and running with Customer-Managed Encryption Keys (CMEK)
toc: true
docs_area: manage.security
---

[Customer-Managed Encryption Keys (CMEK)]({% link cockroachcloud/cmek.md %}) for CockroachDB {{ site.data.products.dedicated }} advanced allows the customer to delegate responsibility for the work of encrypting their cluster data to CockroachDB {{ site.data.products.cloud }}, while maintaining the ability to completely revoke CockroachDB {{ site.data.products.cloud }}'s access.

This page shows how to enable [Customer-Managed Encryption Keys (CMEK)]({% link cockroachcloud/cmek.md %}) for CockroachDB {{ site.data.products.advanced }} advanced.

## Before you begin

To enable CMEK for a cluster, you need:

- An IAM role in your AWS account or a cross-tenant service account in your GCP project. CockroachDB Cloud will use this identity to encrypt and decrypt using the CMEK. This page shows how to provision a new identity, but you can use an existing identity instead. CMEK is not yet available for [CockroachDB {{ site.data.products.advanced }} on Azure]({% link cockroachcloud/cockroachdb-advanced-on-azure.md %}).
- A CMEK key for your cluster stored in AWS KMS or GCP KMS. CockroachDB Cloud never has access to the CMEK itself. This page shows how to provision a new CMEK directly in your KMS or using Hashicorp Vault, but you can use an existing key instead.
- A new CockroachDB {{ site.data.products.advanced }} [private cluster]({% link cockroachcloud/private-clusters.md %}) with [advanced security features]({% link cockroachcloud/create-an-advanced-cluster.md %}#step-6-configure-advanced-security-features) enabled. A private cluster's nodes communicate only over private Cloud infrastructure, avoiding public networks.<br /><br />Advanced security features can be enabled only during cluster creation. If necessary, create a new CockroachDB {{ site.data.products.advanced }} private cluster and enable advanced security features. Complete the steps in this page before inserting data into the cluster.
- A [ CockroachDB {{ site.data.products.cloud }} service account]({% link cockroachcloud/managing-access.md %}#manage-service-accounts) and a [CockroachDB Cloud API key]({% link cockroachcloud/managing-access.md %}#create-api-keys) for the service account. You will use the service account to authenticate to the CockroachDB Cloud API and configure CMEK on your cluster.

## Enable CMEK

This section shows how to enable CMEK on a CockroachDB {{ site.data.products.advanced }} cluster.

<div class="filters clearfix">
  <button class="filter-button" data-scope="aws">AWS</button>
  <button class="filter-button" data-scope="gcp">GCP</button>
</div>

<section class="filter-content" markdown="1" data-scope="aws">

### Step 1. Provision the cross-account IAM role

Follow these steps to create a cross-account IAM role and give it permission to access the CMEK in AWS KMS. CockroachDB Cloud will assume this role to encrypt and decrypt using the CMEK.

1. In CockroachDB Cloud, visit the CockroachDB {{ site.data.products.cloud }} [organization settings page](https://cockroachlabs.cloud/settings). Copy your organization ID, which you will need to create the IAM role:

1. Visit the [Clusters page](https://cockroachlabs.cloud/clusters). Click on the name of your cluster to open its cluster overview page. In the URL, copy the cluster ID: `https://cockroachlabs.cloud/cluster/{YOUR_CLUSTER_ID}/overview`.

1. Use the CockroachDB Cloud API to find the ID of the AWS account managed by CockroachDB {{ site.data.products.cloud }} that is associated with your cluster (not your own AWS account):

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request GET \
         --url https://cockroachlabs.cloud/api/v1/clusters/{YOUR_CLUSTER_ID} \
         --header 'Authorization: Bearer {YOUR_API_KEY}'
    ~~~

    In the response, the ID is stored in the `account_id` field.

1. In the AWS console, visit the [IAM page](https://console.aws.amazon.com/iam/) and select **Roles** and click **Create role**.
  - For **Trusted entity type**, select **AWS account**.
  - Select **Another AWS account** and set **Account ID**, provide the AWS account ID for your cluster.
  - Select **Require external ID** and set **External ID** to your CockroachDB {{ site.data.products.cloud }} organization ID.
  - Provide a name for the role. Do not enable any permissions.

1. Make a note of the Amazon Resource Name (ARN) for the new IAM role.

</section>

<section class="filter-content" markdown="1" data-scope="gcp">

1. In CockroachDB Cloud, visit the CockroachDB {{ site.data.products.cloud }} [organization settings page](https://cockroachlabs.cloud/settings). Copy your organization ID, which you will need to create the cross-tenant service account.

1. Visit the [Clusters page](https://cockroachlabs.cloud/clusters). Click on the name of your cluster to open its cluster overview page. In the URL, copy the cluster ID: `https://cockroachlabs.cloud/cluster/{YOUR_CLUSTER_ID}/overview`.

1. Use the CockroachDB Cloud API to find the ID of the AWS account managed by CockroachDB {{ site.data.products.cloud }} that is associated with your cluster (not your own GCP project):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    CLUSTER_ID= #{ your cluster ID }
    API_KEY= #{ your API key }
    curl --request GET \
      --url https://cockroachlabs.cloud/api/v1/clusters/${CLUSTER_ID} \
      --header "Authorization: Bearer ${API_KEY}"
    ~~~

    In the response, the ID is stored in the `account_id` field.

1. In the GCP Console, visit the [IAM service accounts page](https://console.cloud.google.com/iam-admin/serviceaccounts) for your project and click **+ Create service account**. Select **Cross-tenant**.
1. Click the new service account to open its details.
1. In **PERMISSIONS**, click **GRANT ACCESS**.
    - For **New principals**, enter the service account ID for your cluster, which you found earlier.
    - For **Role**, enter **Service Account Token Creator**.

  Click **SAVE**.
1. Make a note of the email address for the new service account.

</section>

### Step 2. Create the CMEK key

If you intend to use an existing key as the CMEK, skip this step.

<section class="filter-content" markdown="1" data-scope="aws">

You can create the CMEK directly in the AWS Console or using [HashiCorp Vault]({% link {{site.current_cloud_version}}/hashicorp-integration.md %}).

  <div class="filters clearfix">
    <button class="filter-button" data-scope="aws-console">AWS Console</button>
    <button class="filter-button" data-scope="hashicorp-vault">Hashicorp Vault</button>
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

  <section class="filter-content" markdown="1" data-scope="hashicorp-vault">

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

You can create the CMEK directly in the GCP Console or using [HashiCorp Vault]({% link {{site.current_cloud_version}}/hashicorp-integration.md %}).

  <div class="filters clearfix">
    <button class="filter-button" data-scope="gcp-console">GCP Console</button>
    <button class="filter-button" data-scope="hashicorp-vault">Hashicorp Vault</button>
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

  <section class="filter-content" markdown="1" data-scope="hashicorp-vault">

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

</section>

<section class="filter-content" markdown="1" data-scope="gcp">
1. Set the required information as environment variables:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    export CLUSTER_REGION= # the region of the {{ site.data.products.dedicated}}-controlled GCP project where your cluster is located
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

1. Use the shell utility JQ to inspect JSON payload:

    {{site.data.alerts.callout_info}}
    On a Mac, install JQ with `brew install jq`
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~shell
    cat cmek_config.json | jq
    ~~~

After you have built your CMEK configuration manifest with the details of your cluster and provisioned the service account and KMS key in GCP, return to [Enabling CMEK for a CockroachDB {{ site.data.products.dedicated }} cluster]({% link cockroachcloud/managing-cmek.md %}#step-4-activate-cmek).

### Step 4. Activate CMEK

Using the CockroachDB {{ site.data.products.cloud }} API, send a `POST` request with the contents of `cmek_config.json` to the cluster's `cmek` endpoint.

{% include_cached copy-clipboard.html %}
~~~ shell
CLUSTER_ID= #{ your cluster ID }
API_KEY= #{ your API key }
curl --request POST \
  --url https://cockroachlabs.cloud/api/v1/clusters/${CLUSTER_ID}/cmek \
  --header "Authorization: Bearer ${API_KEY}" \
  --header 'content-type: application/json' \
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
      --header 'content-type: application/json' \
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
      --url "https://cockroachlabs.cloud/api/v1/clusters/${CLUSTER_ID}" \
      --header "Authorization: Bearer ${API_KEY}" \
      --header 'content-type: application/json' \
      --data "@cmek_config.json"
    ~~~

## Revoke CMEK for a cluster

When you revoke access to the CMEK in your KMS, CockroachDB Cloud can no longer encrypt or decrypt your cluster's data. All access to the cluster's data will be prevented until you you restore access. In general, revoke access to the CMEK only when you are permanently decommissioning the cluster or to mitigate a critical security breach or at the request of Cockroach Labs support.

Within your KMS platform, you can revoke access to the CMEK temporarily or permanently.

{{site.data.alerts.callout_danger}}
Within your KMS, **do not revoke** access to a CMEK that is in use by one or more clusters. The CMEK is an external resource and is never stored in CockroachDB {{ site.data.products.cloud }}.
{{site.data.alerts.end}}

1. In your cloud provider's KMS platform, revoke CockroachDB {{ site.data.products.cloud }}'s access to your CMEK key at the IAM level, either by removing the authorization the cross-account IAM role or by removing the cross-account IAM role's permission to access the key.

   This will **not** immediately stop your cluster from encrypting and decrypting data, which does not take effect until you update your cluster in the next step. That is because CockroachDB does not use your CMEK key to encrypt/decrypt your cluster data itself. CockroachDB {{ site.data.products.dedicated }} accesses your CMEK key to encrypt/decrypt a key encryption key (KEK). This KEK is used to encrypt a data encryption key (DEK), which is used to encrypt/decrypt your application data. Your cluster will continue to use the already-provisioned DEK until you make the Cloud API call to revoke CMEK.

1. Your cluster will continue to operate with the CMEK until you update it to revoke CMEK. To revoke access:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --request PATCH \
      --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/cmek \
      --header "Authorization: Bearer ${API_KEY}" \
      --header 'content-type: application/json' \
      --data '{"action":"REVOKE"}'
    ~~~

1. [Check your CMEK status](#check-cmek-status) to confirm the revocation has taken effect.

1. Once you have resolved the security incident, re-authorize CMEK for your cluster to return to normal operations. Contact your account team, or [create a support ticket](https://support.cockroachlabs.com/).

<section class="filter-content" markdown="1" data-scope="aws">

## Appendix: IAM policy for the CMEK key

This IAM policy is to be attached to the CMEK key. It grants the required KMS permissions to the cross-account IAM role to be used by CockroachDB {{ site.data.products.dedicated }}.

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
