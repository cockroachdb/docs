---
title: Manage CMEK for Dedicated
summary: Tutorial for getting a dedicated cluster up and running with Customer-Managed Encryption Keys (CMEK)
toc: true
docs_area: manage.security
---

[Customer-Managed Encryption Keys (CMEK)]({% link cockroachcloud/cmek.md %}) for CockroachDB {{ site.data.products.dedicated }} advanced allows the customer to delegate responsibility for the work of encrypting their cluster data to CockroachDB {{ site.data.products.cloud }}, while maintaining the ability to completely revoke CockroachDB {{ site.data.products.cloud }}'s access.

This page shows how to enable [Customer-Managed Encryption Keys (CMEK)]({% link cockroachcloud/cmek.md %}) for a CockroachDB {{ site.data.products.dedicated }} advanced cluster.

**Prerequisites**:

- {% include cockroachcloud/cluster-operator-prereq.md %}
- Permission to create and manage identity and access management (IAM) and key management (KMS) resources in your organization's Google Cloud Platform (GCP) project or Amazon Web Services (AWS) account.
- CMEK can be enabled only on a CockroachDB {{ site.data.products.dedicated }} advanced [private cluster]({% link cockroachcloud/private-clusters.md %}). CMEK is not supported on CockroachDB {{ site.data.products.serverless }}.

{{site.data.alerts.callout_info}}
CMEK is not yet available for [CockroachDB {{ site.data.products.dedicated }} on Azure]({% link cockroachcloud/cockroachdb-dedicated-on-azure.md %}).
{{site.data.alerts.end}}

See also:

- [Customer-Managed Encryption Key (CMEK) frequently asked questions (FAQ)]({% link cockroachcloud/cmek.md %}#faqs)
- [Encryption at Rest (Enterprise)]({% link {{site.current_cloud_version}}/security-reference/encryption.md %}#encryption-at-rest)


## Overview of CMEK management procedures

This section gives a high level overview of the operations involved with implementing CMEK with your CockroachDB {{ site.data.products.dedicated }} cluster.

- [Enabling CMEK](#enable-cmek) for a CockroachDB {{ site.data.products.dedicated }} requires several steps:

  - Provision an encryption key with your cloud provider's key management service (KMS).
  - Grant CockroachDB {{ site.data.products.cloud }} access to use the new encryption key.
  - Switch your cluster to use the new encryption key for CMEK.

- [Check CMEK status](#check-cmek-status) allows you to inspect the CMEK state of your cluster with a call to the Cluster API.

- [Rotate a CMEK key](#rotate-a-cmek-key) allows you to begin using a new CMEK key for one or more cluster regions.

- [Revoke CMEK for a cluster](#revoke-cmek-for-a-cluster) by revoking CockroachDB {{ site.data.products.dedicated }}'s access to your CMEK at the IAM/KMS level.

- [Restore CMEK following a revocation event](#restore-cmek-following-a-revocation-event) by reauthorizing CockroachDB {{ site.data.products.cloud }} to use your key, and coordinating with our support team to assist in recovering your Organization.

## Enable CMEK

The following sections show how to enable CMEK on a cluster.

### Step 1. Prepare your CockroachDB {{ site.data.products.cloud }} organization

1. [Create a CockroachDB {{ site.data.products.cloud }} service account]({% link cockroachcloud/managing-access.md %}#manage-service-accounts).
1. [Create an API key]({% link cockroachcloud/managing-access.md %}#create-api-keys) for the service account to use.

### Step 2. Provision your cluster

[Create a new private cluster]({% link cockroachcloud/private-clusters.md %}) on CockroachDB {{ site.data.products.dedicated }} advanced.

### Step 3. Provision IAM and KMS resources in your cloud tenant

Next, you must provision the required IAM and KMS resources in your organization's AWS account or GCP project:

1. The key itself.
1. The principal that is authorized to encrypt and decrypt using the key, which is an IAM role in your AWS account or a cross-tenant service account in your GCP project.

Follow the instructions that correspond to your cluster's deployment environment:

- [Provisioning Amazon Web Services (AWS) for CMEK]({% link cockroachcloud/cmek-ops-aws.md %})
- [Provisioning Google Cloud Platform (GCP) for CMEK]({% link cockroachcloud/cmek-ops-gcp.md %})

### Step 4. Activate CMEK

Follow the steps in this section to activate CMEK with a call to the cluster's `/cmek` endpoint, using the cloud-specific CMEK configuration manifest you built in [Step 3. Provision IAM and KMS in your Cloud](#step-3-provision-iam-and-kms-resources-in-your-cloud-tenant).

Refer to the [API specification](https://www.cockroachlabs.com/docs/api/cloud/v1).

1. Create a new file named `cmek_config.json`. This file will contain a JSON array of `region_spec` objects, each of which includes the name of a CockroachDB {{ site.data.products.cloud }} region and a `key_spec` that is specific to the target KMS platform and specifies the URI of the CMEK key and the principal that is authorized to encrypt and decrypt using the key.

    Start from the example for your KMS platform and replace the placeholder values. Each of these examples includes `region_spec` objects for two CockroachDB {{ site.data.products.cloud }} regions; when enabling CMEK, you must include a `region_spec` for each region in the cluster.
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

1. Using the CockroachDB {{ site.data.products.cloud }} API, send a `POST` request with the contents of `cmek_config.json` to the cluster's `cmek` endpoint.

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

See the [API specification](https://www.cockroachlabs.com/docs/api/cloud/v1).

{% include_cached copy-clipboard.html %}
```shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/cmek \
  --header "Authorization: Bearer ${API_KEY}"
```

## Rotate a CMEK key

{% include cockroachcloud/cmek-rotation-types.md %}

The API to rotate a CMEK key is nearly identical to the API to [activate CMEK on a cluster](#step-4-activate-cmek), with one notable exception. When you activate CMEK, you use a `POST` request that includes a CMEK key for each of the cluster's regions. When you rotate a CMEK key, you use a `PUT` request that includes a CMEK key for each region you intend to rotate.

See the [API specification](https://www.cockroachlabs.com/docs/api/cloud/v1).

{{site.data.alerts.callout_danger}}
Within your KMS, **do not** revoke access to, disable, schedule for destruction, or destroy a CMEK that is in use by one or more clusters. The CMEK is an external resource and is never stored in CockroachDB {{ site.data.products.cloud }}. If the CMEK for a cluster or region is not available in your KMS, nodes that are configured to use it cannot rejoin the cluster if they are restarted, and the cluster's managed CockroachDB {{ site.data.products.cloud }} backups will fail. Even if access to the CMEK is restored, affected nodes cannot automatically recover. For assistance in that situation, contact your Cockroach Labs account team.

When rotating the CMEK, **do not** delete or revoke access to the old key until rotation is complete.
{{site.data.alerts.end}}

To rotate the CMEK keys for one or more cluster regions:

1. Create a new file named `cmek_config.json`. This file will contain a JSON array of `region_spec` objects, each of which includes the name of a CockroachDB {{ site.data.products.cloud }} region and a `key_spec` that is specific to the target KMS platform and specifies the URI of the CMEK key and the principal that is authorized to encrypt and decrypt using the key.

    Start from the example for your KMS platform and replace the placeholder values. Each of these examples includes `region_spec` objects for two CockroachDB {{ site.data.products.cloud }} regions; you need only include regions for which you want to rotate the CMEK key.
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

1. Using the CockroachDB {{ site.data.products.cloud }} API, send a `PUT` request with the contents of `cmek_config.json` to the cluster's `cmek` endpoint.

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

1. When rotation is complete and the cluster's configuration has been validated, and you have verified that no other clusters are using the prior CMEK, you can optionally disable the prior CMEK or schedule it for destruction. It can be useful to check your KMS's audit logs for encryption and decryption calls to the key. Check the documentation for your KMS for details, including how to restore a destroyed key (if possible) and when destruction becomes permanent.

## Add a region to a CMEK-enabled cluster

To add a region to a cluster that already has CMEK enabled, update your cluster's region definitions using the CockroachDB {{ site.data.products.cloud }} API [Update Cluster](https://www.cockroachlabs.com/docs/api/cloud/v1#operation/CockroachCloud_UpdateCluster) endpoint.

1. Construct the data payload JSON to update you region definitions.

    The payload format depends on which cloud provider you use:
    - **AWS**:
        {% include_cached copy-clipboard.html %}
        ```json
        # cmek_aws_config.json
        {
            "dedicated": {
                "region_nodes": {
                    "us-west-1": 3,
                    "us-central-1": 5
                },
                "cmek_region_specs": [
                    {
                        "region": "us-west-1",
                        "key_spec": {
                            "type": "AWS_KMS",
                            "uri": "{id-of-key}",
                            "auth_principal": "{role-with-kms-access}"
                        }
                    },
                    {
                        "region": "us-central-1",
                        "key_spec": {
                            "type": "AWS_KMS",
                            "uri": "{id-of-another-key}",
                            "auth_principal": "{another-role-with-kms-access}"
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
        # cmek_gcp_config.json
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
                            "type": "GCP_CLOUD_KMS",
                            "uri": "{id-of-key}",
                            "auth_principal": "{service-account-with-kms-access}"
                        }
                    },
                    {
                        "region": "us-central1",
                        "key_spec": {
                            "type": "GCP_CLOUD_KMS",
                            "uri": "{id-of-another-key}",
                            "auth_principal": "{another-service-account-with-kms-access}"
                        }
                    }
                ],
                "hardware": {
                    "machine_type": "n2-standard-8"
                }
            }
        }
        ```
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

When you revoke access to the CMEK, this disables all encryption and decryption of data at rest in your cluster and prevents access to the cluster's data until you restore access. In general, revoke access to the CMEK only when you are permanently decommissioning the cluster or to mitigate a critical security breach.

Within your KMS platform, you can revoke access to the CMEK temporarily or permanently.

{{site.data.alerts.callout_danger}}
Within your KMS, **do not revoke** access to a CMEK that is in use by one or more clusters. The CMEK is an external resource and is never stored in CockroachDB {{ site.data.products.cloud }}.
{{site.data.alerts.end}}

### Step 1. Revoke IAM access

First, revoke CockroachDB {{ site.data.products.dedicated }}'s access to your key at the IAM level in your cloud provider's KMS platform.

You can do this two ways:

- Remove the authorization granted to CockroachDB Dedicated cluster with your cross-account IAM role.
- Remove the KMS key permissions from the IAM policy attached to your cross-account IAM role.

This will **not** immediately stop your cluster from encrypting and decrypting data, which does not take effect until you update your cluster in the next step.

That is because CockroachDB does not use your CMEK key to encrypt/decrypt your cluster data itself. CockroachDB {{ site.data.products.dedicated }} accesses your CMEK key to encrypt/decrypt a key encryption key (KEK). This KEK is used to encrypt a data encryption key (DEK), which is used to encrypt/decrypt your application data. Your cluster will continue to use the already-provisioned DEK until you make the Cloud API call to revoke CMEK.

### Step 2. Update your cluster to stop using the CMEK key for encryption

Your cluster will continue to operate with the encryption keys it has provisioned with your CMEK key until you update it to revoke CMEK.

1. Update your cluster with the the Cloud API as follows:

    See the [API specification](https://www.cockroachlabs.com/docs/api/cloud/v1).

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

To restore CMEK after the incident has been resolved, contact your account team, or [create a support ticket](https://support.cockroachlabs.com/).
