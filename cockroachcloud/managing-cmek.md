---
title: Managing Customer-Managed Encryption Keys (CMEK) for CockroachDB Dedicated
summary: Tutorial for getting a dedicated cluster up and running with Customer-Managed Encryption Keys (CMEK)
toc: true
docs_area: manage.security
---

[Customer-Managed Encryption Keys (CMEK)](cmek.html) for {{ site.data.products.dedicated }} allow the customer to delegate responsibility for the work of encrypting their cluster data to {{ site.data.products.dedicated }}, while maintaining the ability to completely revoke {{ site.data.products.dedicated }}'s access.

{% include cockroachcloud/cockroachcloud-ask-admin.md %}

This page shows how to enable [Customer-Managed Encryption Keys (CMEK)](cmek.html) for a {{ site.data.products.dedicated }} cluster.

To follow this procedure requires admin access to your {{ site.data.products.dedicated }} organization, and the ability to create and manage identity and access management (IAM) and key management (KMS) services in your organization's cloud, i.e., your Google Cloud Platform (GCP) project or Amazon Web Services (AWS) account.

See also:

- [Customer-Managed Encryption Key (CMEK) frequently asked questions (FAQ)](cmek-faq.html)
- [Encryption at Rest (Enterprise)](../{{site.versions["stable"]}}/security-reference/encryption.html#encryption-at-rest)

## Overview of CMEK management procedures

This section gives a high level overview of the operations involved with implementing CMEK with your {{ site.data.products.dedicated }} cluster.

- [Enabling CMEK](#enable-cmek) for a {{ site.data.products.dedicated }} requires several steps:

  - Request enrollment of your {{ site.data.products.db }} organization in the CMEK preview.
  - Provision an encryption key with your cloud provider's key management service (KMS).
  - Grant {{ site.data.products.db }} access to use the new encryption key.
  - Switch your cluster to use the new encryption key for CMEK.

- [Check CMEK status](#check-cmek-status) allows you to inspect the CMEK state of your cluster with a call to the Cluster API.

- [Rotate a CMEK key](#rotate-a-cmek-key) allows you to begin using a new CMEK key for one or more cluster regions.

- [Revoke CMEK for a cluster](#revoke-cmek-for-a-cluster) by revoking {{ site.data.products.dedicated }}'s access to your CMEK at the IAM/KMS level.

- [Restore CMEK following a revocation event](#restore-cmek-following-a-revocation-event) by reauthorizing {{ site.data.products.db }} to use your key, and coordinating with our support team to assist in recovering your Organization.

## Enable CMEK

### Step 1. Prepare your {{ site.data.products.dedicated }} Organization

1. To start the process, contact {{ site.data.products.dedicated }} by reaching out to your account team, or [creating a support ticket](https://support.cockroachlabs.com/). You must provide your **Organization ID**, which you can find in your [Organization settings page](https://cockroachlabs.cloud/settings).

They will enable the CMEK feature for your {{ site.data.products.db }} Organization.

1. [Create a {{ site.data.products.db }} service account](console-access-management.html#service-accounts).
1. [Create an API key](console-access-management.html#create-api-keys) for the service account to use.

### Step 2. Provision your cluster

Create a new {{ site.data.products.dedicated }} cluster. There are two ways to do this:

- [Using the {{ site.data.products.db }} console clusters page](https://cockroachlabs.cloud/cluster).
- [Using the Cloud API](cloud-api.html#create-a-new-cluster). 

### Step 3. Provision IAM and KMS in your Cloud

Next, you must provision the resources required resources in your Cloud, whether this is AWS or GCP:

1. The key itself.
1. The principal that is authorized to encrypt and decrypt using the key, which is an IAM role in AWS or a cross-tenant service account in GCP.

Follow the instructions that correspond to your cluster's deployment environment:

- [Provisioning Amazon Web Services (AWS) for CMEK](cmek-ops-aws.html)
- [Provisioning Google Cloud Platform (GCP) for CMEK](cmek-ops-gcp.html) 

### Step 4. Activate CMEK for your {{ site.data.products.dedicated }} Cluster

Activate CMEK with a call to the clusters CMEK endpoint, using the cloud-specific CMEK configuration manifest you built in [Step 3. Provision IAM and KMS in your Cloud](#step-3-provision-iam-and-kms-in-your-cloud).

See the [API specification](../api/cloud/v1.html#operation/CockroachCloud_EnableCMEK).

1. Create a new file named `cmek_config.json`. This file will contain a JSON array of `region_spec` objects, each of which includes the name of a {{ site.data.products.db }} region and a `key_spec` that is specific to the target KMS platform and specifies the URI of the CMEK key and the principal that is authorized to encrypt and decrypt using the key.

    Start from the example for your KMS platform and replace the placeholder values. Each of these examples includes `region_spec` objects for two {{ site.data.products.db }} regions; when enabling CMEK, you must include a `region_spec` for each region in the cluster.
    - **AWS**:

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
    - **GCP**:

        {% include_cached copy-clipboard.html %}
        ~~~ json
        {
          "region_specs": [
            {
              "region": "{COCKROACHDB_CLOUD_REGION}",
              "key_spec": {
                "type": "GCP_CLOUD_KMS",
                "uri": "{YOUR_GCP_KMS_KEY_RESOURCE_ID_EXCLUDING_VERSION}",
                "auth_principal": "{YOUR_GCP_SERVICE_ACCOUNT_ID}"
              }
            },
            {
              "region": "{COCKROACHDB_CLOUD_REGION}",
              "key_spec": {
                "type": "GCP_CLOUD_KMS",
                "uri": "{YOUR_GCP_KMS_KEY_RESOURCE_ID_EXCLUDING_VERSION}",
                "auth_principal": "{YOUR_GCP_SERVICE_ACCOUNT_ID}"
              }
            }
          ]
        }
        ~~~

    {{site.data.alerts.callout_info}}
    When enabling CMEK on a multi-region cluster, your `region_spec` must include an entry for each of the cluster's regions. Otherwise, an error occurs and CMEK is not enabled.
    {{site.data.alerts.end}}

1. Using the {{ site.data.products.db }} API, send a `POST` request with the contents of `cmek_config.json` to the cluster's `cmek` endpoint.

    {% include_cached copy-clipboard.html %}
    ```shell
    CLUSTER_ID= #{ your cluster ID }
    API_KEY= #{ your API key }
    curl --request POST \
      --url https://cockroachlabs.cloud/api/v1/clusters/${CLUSTER_ID}/cmek \
      --header "Authorization: Bearer ${API_KEY}" \
      --header 'content-type: application/json' \
      --data "@cmek_config.json"
    ```

## Check CMEK status

An API call displays information about your cluster's use of CMEK: 

See the [API specification](../api/cloud/v1.html#operation/CockroachCloud_GetCMEKClusterInfo).

{% include_cached copy-clipboard.html %}
```shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/cmek \
  --header "Authorization: Bearer ${API_KEY}"
```

## Rotate a CMEK key

{% include cockroachcloud/cmek-rotation-types.md %}

The API to rotate a CMEK key is nearly identical to the API to [activate CMEK on a cluster](#step-4-activate-cmek-for-your-cockroachdb-dedicated-cluster), with one notable exception. When you activate CMEK, you use a `POST` request that includes a CMEK key for each of the cluster's regions. When you rotate a CMEK key, you use a `PUT` request that includes a CMEK key for each region you intend to rotate.

<!-- TODO update when available
See the [API specification](../api/cloud/v1.html#operation/CockroachCloud_EnableCMEK).
-->

To rotate the CMEK keys for one or more cluster regions:

1. Create a new file named `cmek_config.json`. This file will contain a JSON array of `region_spec` objects, each of which includes the name of a {{ site.data.products.db }} region and a `key_spec` that is specific to the target KMS platform and specifies the URI of the CMEK key and the principal that is authorized to encrypt and decrypt using the key.

    Start from the example for your KMS platform and replace the placeholder values. Each of these examples includes `region_spec` objects for two {{ site.data.products.db }} regions; you need only include regions for which you want to rotate the CMEK key.
    - **AWS**:

        {% include_cached copy-clipboard.html %}
        ```json
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
      ```
    - **GCP**:

        {% include_cached copy-clipboard.html %}
        ```json
        {
        "region_specs": [
          {
            "region": "{COCKROACHDB_CLOUD_REGION}",
            "key_spec": {
              "type": "GCP_CLOUD_KMS",
              "uri": "{YOUR_GCP_KMS_KEY_RESOURCE_ID_EXCLUDING_VERSION}",
              "auth_principal": "{YOUR_GCP_SERVICE_ACCOUNT_ID}"
            }
          },
          {
            "region": "{COCKROACHDB_CLOUD_REGION}",
            "key_spec": {
              "type": "GCP_CLOUD_KMS",
              "uri": "{YOUR_GCP_KMS_KEY_RESOURCE_ID_EXCLUDING_VERSION}",
              "auth_principal": "{YOUR_GCP_SERVICE_ACCOUNT_ID}"
            }
          }
        ]
      }
      ```

1. Using the {{ site.data.products.db }} API, send a `PUT` request with the contents of `cmek_config.json` to the cluster's `cmek` endpoint.

    {% include_cached copy-clipboard.html %}
    ```shell
    CLUSTER_ID= #{ your cluster ID }
    API_KEY= #{ your API key }
    curl --request PUT \
      --url https://cockroachlabs.cloud/api/v1/clusters/${CLUSTER_ID}/cmek \
      --header "Authorization: Bearer ${API_KEY}" \
      --header 'content-type: application/json' \
      --data "@cmek_config.json"
    ```

## Add a region to a multi-region CMEK-enabled cluster

To add a region to a multi-region cluster, update your cluster's region definitions using the CockroachDB Cloud API [Update Cluster](https://www.cockroachlabs.com/docs/api/cloud/v1#operation/CockroachCloud_UpdateCluster) endpoint.

1. Construct the data payload JSON to update you region definitions.

    The payload format depends on ccording to which cloud provider you use:
    - **AWS**:
        {% include_cached copy-clipboard.html %}
        ```json
        # cmek_config.json
        {
            "dedicated": {
                "region_nodes": {
                    "us-west1": 3,
                    "us-central1": 5
                },
                "cmek_region_specs": [
                    {
                        "region": "us-west1",
                        "key_spec": {
                            "type": "AWS_KMS",
                            "uri": "id-of-key",
                            "auth_principal": "name-of-role-with-kms-access"
                        }
                    },
                    {
                        "region": "us-central1",
                        "key_spec": {
                            "type": "AWS_KMS",
                            "uri": "id-of-key-2",
                            "auth_principal": "name-of-role-with-kms-access-2"
                        }
                    }
                ],
                "hardware": {
                    "machine_type": "n2-standard-8"
                }
            }
        }
        ```
    - **GCP**:

        {% include_cached copy-clipboard.html %}
        ```json

        ```
1. Send the request to the update cluster endpoint:

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

    ~~~txt

    ~~~

## Revoke CMEK for a cluster

Revoking access to the CMEK means disabling all encryption/decryption of data in your cluster, which means preventing reading and writing any data from or to your cluster. This likely implies a shutdown of your service, with significant business implications. This is a disaster mitigation tactic to be used only in a scenario involving a severe, business critical security breach.

This can be done temporarily or permanently. This action is performed at the level of your cloud provider.

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
      --header "Authorization: Bearer ${API_KEY}" \
      --header 'content-type: application/json' \
      --data '{"action":"REVOKE"}'
    ```

1. [Check your CMEK status](#check-cmek-status) to confirm the revocation has taken effect.

### Step 3. Assess and resolve the situation

Once you have resolved the security incident, re-authorize CMEK for your cluster to return to normal operations.

## Restore CMEK following a revocation event

To restore CMEK after the incident has been resolved, reach out to your account team, or [create a support ticket](https://support.cockroachlabs.com/).