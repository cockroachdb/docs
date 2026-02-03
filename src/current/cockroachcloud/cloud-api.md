---
title: Use the CockroachDB Cloud API
summary: The Cloud API is used to manage clusters within an organization
toc: true
docs_area: manage
cloud: true
---

The Cloud API is a [REST interface](https://wikipedia.org/wiki/Representational_state_transfer) that allows you programmatic access to manage the lifecycle of clusters within your organization.

This document pertains to the `latest` version of the API's `v1` endpoints, `2024-09-16`. For more detailed coverage of API endpoints for this version and prior versions, refer to the [API reference documentation](https://www.cockroachlabs.com/docs/api/cloud/v1). 

To manage clusters and other resources in CockroachDB Cloud, you can also use the [CockroachDB Cloud Terraform provider]({% link cockroachcloud/provision-a-cluster-with-terraform.md %}), which implements the API.

{{site.data.alerts.callout_info}}
If you used the API to manage CockroachDB Serverless clusters that have been migrated to CockroachDB Basic, ensure your code is updated to work with CockroachDB Basic.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
The Cloud API is rate-limited to 10 requests per second per user. When a request exceeds this limit, it receives an HTTP response with the `Retry-After` header and a "rate limit exceeded" message.
{{site.data.alerts.end}}

## Call the API

The API uses [bearer token authentication](https://swagger.io/docs/specification/authentication/bearer-authentication/), and each request requires a [secret key]({% link cockroachcloud/managing-access.md %}#api-access). The secret key is associated with a service account, and inherits the [permissions of the account]({% link cockroachcloud/managing-access.md %}#manage-service-accounts).

To send the secret key when making an API call, add the secret key to the `Authorization` HTTP header sent with the request.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="curl"><strong>curl</strong></button>
    <button class="filter-button page-level" data-scope="raw"><strong>Raw</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="curl">

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters \
  --header "Authorization: Bearer {secret_key}"
~~~

</section>

<section class="filter-content" markdown="1" data-scope="raw">

{% include_cached copy-clipboard.html %}
~~~ text
Authorization: Bearer {secret_key}
~~~

</section>

Replace `{secret_key}` with the secret key string you stored when you [created the API key in the Console]({% link cockroachcloud/managing-access.md %}#create-api-keys).

## Set the API version

The Cloud API uses date-based versions of the form `YYYY-MM-DD`, in [ISO 8601 format](https://www.w3.org/TR/NOTE-datetime). It is strongly recommended that you use the `Cc-Version` HTTP header to specify the version of the Cloud API to use. If you omit the `Cc-Version` header, the Cloud API defaults to the latest version. If you don’t specify the version your application expects, breakage may occur. While we try to minimize the risk of breaking API changes, passing the version explicitly helps to mitigate against this risk and is strongly recommended.

If you set an invalid version, you recieve an HTTP 400 response with the message "invalid Cc-Version."

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="curl"><strong>curl</strong></button>
    <button class="filter-button page-level" data-scope="raw"><strong>Raw</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="curl">
{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters \
  --header "Authorization: Bearer {secret_key}" \
  --header "Cc-Version: {version}"
~~~
</section>

<section class="filter-content" markdown="1" data-scope="raw">
{% include_cached copy-clipboard.html %}
~~~ text
Authorization: Bearer {secret_key}
Cc-Version: {version}
~~~
</section>

Where `{secret_key}` is the [secret key string you stored when you created the API key in the Console]({% link cockroachcloud/managing-access.md %}#create-api-keys) and `{version}` is the version of the Cloud API.

## Create a cluster

Get started by creating a new CockroachDB [Basic](#create-a-basic-cluster), [Standard](#create-a-standard-cluster), or [Advanced](#create-an-advanced-cluster) cluster.

### Create a Basic cluster

To create a cluster, send a `POST` request to the `/v1/clusters` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Admin or Cluster Creator [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="curl"><strong>curl</strong></button>
    <button class="filter-button page-level" data-scope="raw"><strong>Raw</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="curl">

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
  --url https://cockroachlabs.cloud/api/v1/clusters \
  --header "Authorization: Bearer {secret_key}" \
  --json '{"name":"{cluster_name}","provider":"{cloud_provider}","plan":"BASIC","spec":{"serverless":{"regions":["{region_name}"]}}}'
~~~

</section>

<section class="filter-content" markdown="1" data-scope="raw">

{% include_cached copy-clipboard.html %}
~~~ json
{
  "name": "{cluster_name}",
  "provider": "{cloud_provider}",
  "plan": "BASIC",
  "spec": {
    "serverless": {
      "regions": [
        "{region_name}"
      ]
    }
  }
}
~~~

</section>

Where:

  - `{cluster_name}` is the name of the cluster. The name must be 6-20 characters in length and can include numbers, lowercase letters, and dashes (but no leading or trailing dashes).
  - `{cloud_provider}` is the name of the cloud provider on which you want your cluster to run: `AWS`, `AZURE`, or `GCP`.
  - `{region_name}` is the name of a CockroachDB Cloud [region]({% link cockroachcloud/regions.md %}). Region names are set by the cloud provider. For example, `us-central1` is a GCP region. Available regions vary based on both the selected plan type (`BASIC`, `STANDARD`, or `ADVANCED`) and the cloud provider.
  - `plan` is set to `BASIC` for a Basic cluster.

For example, to create a new Basic cluster named `basic-test` using GCP as the cloud provider and setting specific usage limits:

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="curl"><strong>curl</strong></button>
    <button class="filter-button page-level" data-scope="raw"><strong>Raw</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="curl">

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
  --url https://cockroachlabs.cloud/api/v1/clusters \
  --header "Authorization: Bearer {secret_key}" \
  --json '{"name":"basic-test","provider":"GCP","plan":"BASIC","spec":{"serverless":{"regions":["us-central1"]}}}'
~~~

</section>

<section class="filter-content" markdown="1" data-scope="raw">

{% include_cached copy-clipboard.html %}
~~~ JSON
{
  "name": "basic-test",
  "provider": "GCP",
  "plan": "BASIC",
  "spec": {
    "serverless": {
      "regions": [
        "us-central1"
      ]
    }
  }
}
~~~

</section>

If the request is successful, the API returns information about the new cluster.

For details about returned fields, refer to the [response example and schema](https://www.cockroachlabs.com/docs/api/cloud/v1.html#post-/api/v1/clusters) in the API reference.

### Create a Standard cluster

To create a cluster, send a `POST` request to the `/v1/clusters` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Admin or Cluster Creator [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="curl"><strong>curl</strong></button>
    <button class="filter-button page-level" data-scope="raw"><strong>Raw</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="curl">

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
  --url https://cockroachlabs.cloud/api/v1/clusters \
  --header "Authorization: Bearer {secret_key}" \
  --json '{"name":"{cluster_name}","provider":"{cloud_provider}","plan":"STANDARD","spec":{"serverless":{"regions":["{region_name}"],"usage_limits":{"provisioned_virtual_cpus":"2"}}}}'
~~~

</section>

<section class="filter-content" markdown="1" data-scope="raw">

{% include_cached copy-clipboard.html %}
~~~ json
{
  "name": "{cluster_name}",
  "provider": "{cloud_provider}",
  "plan": "STANDARD",
  "spec": {
    "serverless": {
      "regions": [
        "{region_name}"
      ],
      "usage_limits": {
        "provisioned_virtual_cpus": "2"
      }
    }
  }
}
~~~

</section>

Where:

  - `{cluster_name}` is the name of the cluster. The name must be 6-20 characters in length and can include numbers, lowercase letters, and dashes (but no leading or trailing dashes).
  - `{cloud_provider}` is the name of the cloud provider on which you want your cluster to run: `AWS`, `AZURE`, or `GCP`.
  - `{region_name}` is the name of a CockroachDB Cloud [region]({% link cockroachcloud/regions.md %}). Region names are set by the cloud provider. For example,`us-west2` is a GCP region. Available regions vary based on both the selected plan type (`BASIC`, `STANDARD`, or `ADVANCED`) and the cloud provider.
  - `plan` is the cluster's plan, `BASIC`, `STANDARD`, or `ADVANCED`. The default is `STANDARD`.
  - The `usage_limits` field specifies the resource limits for the cluster. The `provisioned_virtual_cpus` field indicates the maximum number of virtual CPUs (vCPUs) the cluster can provision.

For example, to create a new Standard cluster named `notorious-moose` using the default values for the cloud provider and region:

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="curl"><strong>curl</strong></button>
    <button class="filter-button page-level" data-scope="raw"><strong>Raw</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="curl">

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
  --url https://cockroachlabs.cloud/api/v1/clusters \
  --header "Authorization: Bearer {secret_key}" \
  --json '{"name":"notorious-moose","provider":"GCP","plan":"STANDARD","spec":{"serverless":{"regions":["us-central1"],"usage_limits":{"provisioned_virtual_cpus":"2"}}}}'
~~~

</section>

<section class="filter-content" markdown="1" data-scope="raw">

{% include_cached copy-clipboard.html %}
~~~ JSON
{
  "name": "notorious-moose",
  "provider": "GCP",
  "plan": "STANDARD",
  "spec": {
    "serverless": {
      "regions": [
        "us-central1"
      ],
      "usage_limits": {
        "provisioned_virtual_cpus": "2"
      }
    }
  }
}
~~~

</section>

If the request is successful, the API returns information about the new cluster.

For details about returned fields, refer to the [response example and schema](https://www.cockroachlabs.com/docs/api/cloud/v1.html#post-/api/v1/clusters) in the API reference.

### Create an Advanced cluster

To create a cluster, send a `POST` request to the `/v1/clusters` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Admin or Cluster Creator [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="curl"><strong>curl</strong></button>
    <button class="filter-button page-level" data-scope="raw"><strong>Raw</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="curl">

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
  --url https://cockroachlabs.cloud/api/v1/clusters \
  --header "Authorization: Bearer {secret_key}" \
  --json '{"name":"{cluster_name}","provider":"{cloud_provider}","plan":"ADVANCED","spec":{"dedicated":{"region_nodes":{"{region_name}":3},"hardware":{"machine_spec":{"num_virtual_cpus":{num_vcpus}}},"cockroach_version":"{version}"}}}'
~~~

</section>

<section class="filter-content" markdown="1" data-scope="raw">

{% include_cached copy-clipboard.html %}
~~~ json
{
  "name": "{cluster_name}",
  "provider": "{cloud_provider}",
  "plan": "ADVANCED",
  "spec": {
    "dedicated": {
      "region_nodes": {
        "{region_name}": 3
      },
      "hardware": {
        "machine_spec": {
          "num_virtual_cpus": {num_vcpus}
        }
      },
      "cockroach_version": "{version}"
    }
  }
}
~~~

</section>

Where:

  - `{cluster_name}` is the name of the cluster. The name must be 6-20 characters in length and can include numbers, lowercase letters, and dashes (but no leading or trailing dashes).
  - `{cloud_provider}` is the name of the cloud provider on which you want your cluster to run: `AWS`, `AZURE`, or `GCP`.
  - `plan` is set to `ADVANCED` for an Advanced cluster.
  - `{region_name}` is the name of a CockroachDB Cloud [region]({% link cockroachcloud/regions.md %}). Region names are set by the cloud provider. For example, `us-east-1` is an AWS region. Available regions vary based on both the selected plan type and the cloud provider.
  - The `region_nodes` field specifies the number of nodes in each region. The minimum is 3 nodes per region for an Advanced cluster.
  - `{num_cpus}` is the number of virtual CPUs per node in the cluster. This value determines the machine type that is provisioned.
  - `{version}` is the CockroachDB version for the cluster. This field is optional; if omitted, the current version is used.

For example, to create a new Advanced cluster named `advanced-test` using AWS as the cloud provider:

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="curl"><strong>curl</strong></button>
    <button class="filter-button page-level" data-scope="raw"><strong>Raw</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="curl">

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
  --url https://cockroachlabs.cloud/api/v1/clusters \
  --header "Authorization: Bearer {secret_key}" \
  --json '{"name":"advanced-test","provider":"AWS","plan":"ADVANCED","spec":{"dedicated":{"region_nodes":{"us-east-1":3},"hardware":{"machine_spec":{"num_virtual_cpus":4}},"cockroach_version":"v23.1.2"}}}'
~~~

</section>

<section class="filter-content" markdown="1" data-scope="raw">

{% include_cached copy-clipboard.html %}
~~~ JSON
{
  "name": "advanced-test",
  "provider": "AWS",
  "plan": "ADVANCED",
  "spec": {
    "dedicated": {
      "region_nodes": {
        "us-east-1": 3
      },
      "hardware": {
        "machine_spec": {
          "num_virtual_cpus": 4
        }
      },
      "cockroach_version": "v23.1.2"
    }
  }
}
~~~

</section>

If the request is successful, the API returns information about the new cluster.

For details about returned fields, refer to the [response example and schema](https://www.cockroachlabs.com/docs/api/cloud/v1.html#post-/api/v1/clusters) in the API reference.

## Get information about a specific cluster

To retrieve detailed information about a specific cluster, make a `GET` request to the `/v1/clusters/{cluster_id}` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Admin or Cluster Developer [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id} \
  --header "Authorization: Bearer {secret_key}"
~~~

Where:

  - `{cluster_id}` is the cluster ID returned after creating the cluster.
  {{site.data.alerts.callout_info}}
  The cluster ID used in the Cloud API is different from the routing ID used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}).
  {{site.data.alerts.end}}
  - `{secret_key}` is the secret key for the service account.

If the request is successful, the API returns detailed information about the cluster.

For details about returned fields, refer to the [response example and schema](https://www.cockroachlabs.com/docs/api/cloud/v1#post-/api/v1/clusters) in the API reference.

## Get information about a cluster's nodes

To retrieve information about a cluster's nodes, including the node status, make a `GET` request to the `/v1/clusters/{cluster_id}/nodes` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Admin or Cluster Developer [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/nodes \
  --header "Authorization: Bearer {secret_key}"
~~~

Where:

  - `{cluster_id}` is the cluster ID returned after creating the cluster.
  {{site.data.alerts.callout_info}}
  The cluster ID used in the Cloud API is different from the routing ID used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}).
  {{site.data.alerts.end}}
  - `{secret_key}` is the secret key for the service account.

If the request is successful, the API returns detailed information about the nodes in the cluster.

~~~ json
{
  "nodes": [
    {
      "name": "<node_name}",
      "region_name": "{region_name}",
      "status": "{status}"
    }
  ],
  "pagination": {
    "next": 0,
    "last": 0,
    "limit": 0,
    "total_results": 0,
    "time": "2022-03-14T14:15:22Z",
    "order": "ASC"
  }
}
~~~

Where:

- `{node_name}` is the name of the node.
- `{region_name}` is the cloud provider region where the cluster is located.
- `{status}` is the status of the node: `LIVE` or `NOT_READY`.

## Set or update resource limits for a Basic cluster

To specify the maximum RU or storage limits for a cluster, send a `PATCH` request to the `/v1/clusters/{cluster_id}` endpoint with an updated `serverless.usage_limits` field.

{{site.data.alerts.callout_info}}
The `spend_limit` field, which was deprecated in Serverless, is not supported on Basic or Standard. Instead, use `usage_limits`.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Admin or Cluster Developer [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="curl"><strong>curl</strong></button>
    <button class="filter-button page-level" data-scope="raw"><strong>Raw</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="curl">

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request PATCH \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id} \
  --header "Authorization: Bearer {secret_key}" \
  --json '{"serverless":{"usage_limits":{"storage_mib_limit":"5242880","request_unit_limit":"50000000"}}}'
~~~

</section>

<section class="filter-content" markdown="1" data-scope="raw">

{% include_cached copy-clipboard.html %}
~~~ json
{
  "serverless": {
    "usage_limits": {
      "storage_mib_limit": "5242880",
      "request_unit_limit": "100000000"
    }
  }
}
~~~

</section>

Where:

  - `{cluster_id}` is the unique ID of this cluster.
  {{site.data.alerts.callout_info}}
  The cluster ID used in the Cloud API is different from the routing ID used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}).
  {{site.data.alerts.end}}
  - `{secret_key}` is the secret key for the service account.
  - `storage_mib_limit` is the maximum number of MiB of storage that the cluster can use at any time during the month. If this limit is exceeded, then the cluster is throttled, where only one SQL connection is allowed at a time, with the expectation that it is used to delete data to reduce storage usage. It is an error for this value to be zero.
  - `request_unit_limit` is the maximum number of request units that the cluster can consume during the month. If this limit is exceeded, then the cluster is disabled until the limit is increased, or until the beginning of the next month when more request units are granted. It is an error for this to be zero.

If the request is successful, the API returns the updated cluster details.

For details about returned fields, refer to the [response example and schema](https://www.cockroachlabs.com/docs/api/cloud/v1.html#patch-/api/v1/clusters/-cluster_id-) in the API reference.

## Change the number of provisioned vCPUs for a Standard cluster

To update the [provisioned capacity for a Standard cluster]({% link cockroachcloud/plan-your-cluster.md %}), send a `PATCH` request to the `/v1/clusters/{cluster_id}` endpoint with an updated `serverless.usage_limits` field to provide a new number of provisioned vCPUs.

{{site.data.alerts.callout_success}}
You can decrease the provisioned capacity only three times within a 7-day period. You can increase the provisioned capacity at any time.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Admin or Cluster Developer [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="curl"><strong>curl</strong></button>
    <button class="filter-button page-level" data-scope="raw"><strong>Raw</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="curl">

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request PATCH \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id} \
  --header "Authorization: Bearer {secret_key}" \
  --json '{"serverless":{"usage_limits":{"provisioned_virtual_cpus":"{provisioned_virtual_cpus}"}}}'
~~~

</section>

<section class="filter-content" markdown="1" data-scope="raw">

{% include_cached copy-clipboard.html %}
~~~ json
{
  "serverless": {
    "usage_limits": {
      "provisioned_virtual_cpus": "{provisioned_virtual_cpus}"
    }
  }
}
~~~

</section>

Where:

  - `{cluster_id}` is the unique ID of this cluster.
  {{site.data.alerts.callout_info}}
  The cluster ID used in the Cloud API is different from the routing ID used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}).
  {{site.data.alerts.end}}
  - `{secret_key}` is the secret key for the service account.
  - `{provisioned_virtual_cpus}` is the number of virtual CPUs (vCPUs) the cluster provides. Once this limit is reached, operation latency may increase due to throttling.

If the request is successful, the API returns the updated cluster details.

For details about returned fields, refer to the [response example and schema](https://www.cockroachlabs.com/docs/api/cloud/v1.html#patch-/api/v1/clusters/-cluster_id-) in the API reference.

## Change the resources for a CockroachDB Advanced cluster

To change the hardware specifications (e.g., number of vCPUs or number of nodes) for a CockroachDB Advanced cluster, use the `/v1/clusters/{cluster_id}` endpoint with the `PATCH` method. The API endpoint spawns a job to handle the change in resources. The duration of this job can vary depending on the amount of storage and the cloud provider.

For example, to change the number of vCPUs per node to 8:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request PATCH \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id} \
  --header "Authorization: Bearer {secret_key}" \
  --json '{
    "spec": {
      "dedicated": {
        "hardware": {
          "machine_spec": {
            "num_virtual_cpus": 8
          }
        }
      }
    }
  }'
~~~

To change the number of nodes in a region:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request PATCH \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id} \
  --header "Authorization: Bearer {secret_key}" \
  --json '{
    "spec": {
      "dedicated": {
        "region_nodes": {
          "us-east-1": 5
        }
      }
    }
  }'
~~~

Where `{cluster_id}` is the ID of your cluster and `{secret_key}` is your API key.

## Create and managed Customer-Managed Encryption Keys (CMEK)

CockroachDB {{ site.data.products.cloud }} {{ site.data.products.advanced }} clusters support Customer-Managed Encryption Keys (CMEK) to secure connections with a key that you control and host. Learn more about [CMEK in CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/cmek.md %}).

### Enable CMEK on a cluster

Follow the instructions in [Build your CMEK configuration manifest]({% link cockroachcloud/managing-cmek.md %}#step-3-build-your-cmek-configuration-manifest) to create a `cmek_config.json` file with your CMEK configuration details.

To enable CMEK on a cluster, send a `POST` request to the `v1/clusters/{cluster_id}` endpoint with the contents of `cmek_config.json`:

{% include_cached copy-clipboard.html %}
~~~ shell
CLUSTER_ID= #{ your cluster ID }
API_KEY= #{ your API key }
curl --request POST \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/cmek \
  --header "Authorization: Bearer {secret_key}" \
  --header "content-type: application/json" \
  --data "@cmek_config.json"
~~~

### Check CMEK status

To view your cluster's CMEK status, send a `GET` request to the `v1/clusters/{cluster_id}/cmek` endpoint:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/cmek \
  --header "Authorization: Bearer {secret_key}"
~~~

### Rotate a CMEK key

Modify the `cmek_config.json` manifest as described in the [CMEK key rotation documentation]({% link cockroachcloud/managing-cmek.md %}#rotate-a-cmek-key), then send a `PUT` request with the updated manifest to the `v1/clusters/{cluster_id}/cmek` endpoint:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request PUT \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/cmek \
  --header "Authorization: Bearer {secret_key}" \
  --header "content-type: application/json" \
  --data "@cmek_config.json"
~~~

### Modify a CMEK configuration

To modify individual parts of a CMEK configuration, such as [adding a region]({% link cockroachcloud/managing-cmek.md %}#add-a-region-to-a-cmek-enabled-cluster), modify the `cmek_config.json` manifest as needed and send a `PATCH` request with the updated manifest to the `v1/clusters/{cluster_id}/cmek` endpoint:

{% include_cached copy-clipboard.html %}
~~~shell
curl --request PATCH \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id} \
  --header "Authorization: Bearer {secret_key} \
  --header "content-type: application/json" \
  --data "@cmek_config.json"
~~~

### Revoke CMEK on a cluster

Revoking access to a CMEK key does not immediately stop the cluster from encrypting and decrypting data. See the [revoke CMEK documentation]({% link cockroachcloud/managing-cmek.md %}#revoke-cmek-for-a-cluster) for more information.

To revoke access to CMEK on a cluster, send a `PATCH` request to the `v1/clusters/{cluster_id}/cmek` endpoint with a payload of `{"action":"REVOKE"}`:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request PATCH \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/cmek \
  --header "Authorization: Bearer {secret_key} \
  --header "content-type: application/json" \
  --data '{"action":"REVOKE"}'
~~~

## Managed backups and restores

For information on using the Cloud API to handle [managed backups and restore jobs]({% link cockroachcloud/backup-and-restore-overview.md %}), see the respective managed backup documentation for [Basic]({% link cockroachcloud/managed-backups-basic.md %}#cloud-api), [Standard]({% link cockroachcloud/managed-backups.md %}#cloud-api), and [Advanced]({% link cockroachcloud/managed-backups-advanced.md %}#cloud-api) plans.

## Change a cluster's plan

This section shows how to change a cluster's plan using the CockroachDB {{ site.data.products.cloud }} API. To use Terraform instead, refer to [Provision a cluster with Terraform]({% link cockroachcloud/provision-a-cluster-with-terraform.md %}#change-a-clusters-plan).
.
To change a cluster's plan from CockroachDB {{ site.data.products.basic }} to CockroachDB {{ site.data.products.standard }} in place:

1. Edit the API command or application code that was used to create the cluster. In the JSON header, replace the contents of `serverless {}` (which may be empty) with the provisioned vCPUs for the cluster. This field is required for CockroachDB {{ site.data.products.standard }}. It is not possible to set storage limitations on CockroachDB {{ site.data.products.standard }}. Refer to [CockroachDB API: Create a Standard cluster](https://cockroachlabs.com/docs/api/cloud/v1.html#post-/api/v1/clusters) for the specification for CockroachDB {{ site.data.products.standard }}.
1. Run the command or application code.

To migrate from CockroachDB {{ site.data.products.standard }} to CockroachDB {{ site.data.products.basic }}:

1. Edit the API command or application code that was used to create the cluster. In the JSON header:
  - Replace the `serverless.usage_limits.provisioned_virtual_cpus` field with an empty value for no resource limits, or optionally values for `request_unit_limit` and `storage_mib_limit`. It is not possible to reserve compute on CockroachDB {{ site.data.products.basic }}. Refer to [CockroachDB API: Create a Standard cluster](https://cockroachlabs.com/docs/docs/api/cloud/v1.html#post-/api/v1/clusters) for the specification for CockroachDB {{ site.data.products.basic }}.
  - Remove configurations for features that are unsupported on CockroachDB {{ site.data.products.basic }}, such as private connectivity. Otherwise, running the updated command or application code fails.

{{site.data.alerts.callout_info}}
To change a cluster's plan between CockroachDB {{ site.data.products.advanced }} and CockroachDB {{ site.data.products.standard }}, you must create and configure a new cluster, back up the existing cluster's data, and restore the backup to the new cluster. Migration in place is not supported. Refer to [Self-managed backups]({% link cockroachcloud/backup-and-restore-overview.md %}#self-managed-backups).
{{site.data.alerts.end}}

## Delete a cluster

To delete a cluster, send a `DELETE` request to the `/v1/clusters/{cluster_id}` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Admin or Cluster Creator [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
Sending a `DELETE` request permanently deletes the cluster and all the data within the cluster. Deleted clusters can not be restored.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request DELETE \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id} \
  --header "Authorization: Bearer {secret_key}"
~~~

Where:

  - `{cluster_id}` is the unique ID of this cluster.
  {{site.data.alerts.callout_info}}
  The cluster ID used in the Cloud API is different from the routing ID used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}).
  {{site.data.alerts.end}}
  - `{secret_key}` is the secret key for the service account.

If the `DELETE` request is successful the client does not receive a response payload.

<a id="cloud-audit-logs"></a>

## Export Cloud Organization audit logs

{{site.data.alerts.callout_info}}
{% include_cached feature-phases/limited-access.md %}
{{site.data.alerts.end}}

To export audit logs for activities and events related to your Cloud organization, send a `GET` request to the `/v1/auditlogevents` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Admin [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/auditlogevents?starting_from={timestamp}&sort_order={sort_order}&limit={limit} \
  --header "Authorization: Bearer {secret_key}" \
  --header "Cc-Version: {api_version}"
~~~

Where:

  - `{timestamp}` is an [RFC3339 timestamp](https://www.ietf.org/rfc/rfc3339.txt) that indicates the first log entry to fetch. If unspecified, defaults to the time when the Cloud organization was created if `{sort_order}` is `ASC`, or the current time if `{sort_order}` is `DESC`.
  - `{sort_order}` is either `ASC` (the default) or `DESC`.
  - `{limit}` indicates roughly how many entries to return. If any entries would be returned for a timestamp, all entries for that timestamp are always returned. Defaults to `200`.
  - `{api_version}` is the [Cloud API version](#set-the-api-version).

A request that includes no parameters exports roughly 200 entries in ascending order, starting from when your CockroachDB {{ site.data.products.cloud }} organization was created.

If the request is successful, the client receives a JSON array consisting of a list of log `entries` and, depending on the circumstances, a `next_starting_from` field.

- If `{sort_order}` is `ASC`, `next_starting_from` is always returned.
- If `{sort_order}` is `DESC`, then `next_starting_from` is returned as long as earlier audit logs are available. It is not returned when the earliest log entry is reached (when the CockroachDB {{ site.data.products.cloud }} organization was created).

{% include_cached copy-clipboard.html %}
~~~ json
{
  "entries": [
    "{entry_array}"
  ],
  "next_starting_from": "{timestamp}"
}
~~~

Where:

  - `{entry_array}` is a structured JSON array of audit log entries.
  - `{timestamp}` indicates the timestamp to send to export the next batch of results.

## Get invoices for an organization

To list all [invoices billed]({% link cockroachcloud/billing-management.md %}#view-invoices) to an organization, send a `GET` request to the `/v1/invoices` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Billing Coordinator or Cluster Admin [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/invoices \
  --header "Authorization: Bearer {secret_key}"
~~~

If the request is successful, the client receives a list of invoices billed to the organization. Each invoice object includes the start and end of the corresponding billing period, with each past invoice showing a `status` of `FINALIZED`. An invoice object is also returned for the current billing period showing usage so far with a `status` of `DRAFT`.

~~~ json
{
  "invoices": [
    {<current_invoice_object>},
    {<past_invoice_object1>},
    {<past_invoice_object2>}
  ],
  "pagination": null
}    
~~~

You can request a specific invoice by providing the invoice ID in a `GET` request to the `/v1/invoices/{invoice_id}` endpoint:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/invoices/{invoice_id} \
  --header "Authorization: Bearer {secret_key}"
~~~
~~~ json
{
  "invoices": [
    {<invoice_object>}
  ],
  "pagination": null
}    
~~~

## List all clusters in an organization

To list all active clusters within an organization, send a `GET` request to the `/v1/clusters` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Admin or Cluster Developer [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters \
  --header "Authorization: Bearer {secret_key}"
~~~

To return both active clusters and clusters that have been deleted or failed to initialize, send the `show_inactive=true` query parameter.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters?show_inactive=true \
  --header "Authorization: Bearer {secret_key}"
~~~

Where:

  - `{secret_key}` is the secret key for the service account.

If the request is successful, the client receives a list of all clusters within the organization, in the following format.

~~~ json
{
  "clusters": [
    {<cluster_object1>},
    {<cluster_object2>},
    {<cluster_object3>}
  ],
  "pagination": null
}    
~~~

## List the available regions for a cloud provider

To list the [available regions]({% link cockroachcloud/regions.md %}) for creating new clusters, send a `GET` request to the `/v1/clusters/available-regions?provider={cloud_provider}` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Admin or Cluster Developer [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters/available-regions?provider={cloud_provider} \
  --header "Authorization: Bearer {secret_key}"
~~~

Where:

  - `{cloud_provider}` is the name of the cloud provider: `AWS`, `AZURE`, or `GCP`.
  - `{secret_key}` is the secret key for the service account.

If the request is successful, the client receives a list of available regions for the specified cloud provider.

~~~ json
{
  "regions": [
    "<region_array>"
  ]
}
~~~

Where:

  - `<region_array>` is a string array of regions available from the cloud provider.

## List the SQL users in a cluster

To list the SQL users in a cluster, send a `GET` request to the `/v1/clusters/{cluster_id}/sql-users` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Admin or Cluster Developer [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/sql-users \
  --header "Authorization: Bearer {secret_key}"
~~~

Where:

  - `{cluster_id}` is the unique ID of this cluster.
  {{site.data.alerts.callout_info}}
  The cluster ID used in the Cloud API is different from the routing ID used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}).
  {{site.data.alerts.end}}
  - `{secret_key}` is the secret key for the service account.

If the request is successful, the client receives a list of SQL users.

~~~ json
{
  "users": [
    {
      "name": "<SQL-username>"
    },
    {
      "name": "<SQL-username>"
    }
  ],
  "pagination": {
    "next_page": "<next_page_token>"
  }
}
~~~

Where:

- `<SQL-username>` is the SQL username of the user.
- `<next_page_token>` is the token to use for retrieving the next page of results, if any.

## Create a SQL user

To create a SQL user, send a `POST` request to the `/v1/clusters/{cluster_id}/sql-users` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Admin or Cluster Creator [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
By default, a new SQL user created using the UI or Cloud API is granted the SQL `admin` role. An `admin` SQL user has full privileges for all databases and tables in the cluster, and can create additional SQL users and manage their privileges.
When possible, it is best practice to [limit each user's privileges]({% link cockroachcloud/managing-access.md %}#use-sql-roles-to-manage-access) to the minimum necessary for their tasks, in keeping with the [Principle of Least Privilege (PoLP)](https://wikipedia.org/wiki/Principle_of_least_privilege).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/sql-users \
  --header "Authorization: Bearer {secret_key}" \
  --json '{"name":"{sql_username}","password":"{password}"}'
~~~

Where:

- `{cluster_id}` is the unique ID of this cluster.
{{site.data.alerts.callout_info}}
The cluster ID used in the Cloud API is different from the routing ID used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}).
{{site.data.alerts.end}}
- `{secret_key}` is the secret key for the service account.
- `{sql_username}` is the username of the new SQL user you want to create.
- `{password}` is the new user's password.

If the request is successful, the client receives a response with the name of the new user.

~~~ json
{
  "name": "<sql_username>"
}
~~~

Where `<sql_username>` is the username of the newly created SQL user.

{{site.data.alerts.callout_info}}
Ensure that you store the password securely, as it cannot be retrieved later. If the password is lost, you'll need to reset it.
{{site.data.alerts.end}}

## Delete a SQL user

To delete a SQL user, send a `DELETE` request to the `/v1/clusters/{cluster_id}/sql-users/{sql_username}` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Admin or Cluster Creator [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request DELETE \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/sql-users/{sql_username} \
  --header "Authorization: Bearer {secret_key}"
~~~

Where:

- `{cluster_id}` is the unique ID of this cluster.
{{site.data.alerts.callout_info}}
The cluster ID used in the Cloud API is different from the routing ID used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}).
{{site.data.alerts.end}}
- `{sql_username}` is the username of the SQL user you want to delete.
- `{secret_key}` is the secret key for the service account.

If the request is successful, the client receives a response with the name of the deleted user.

~~~ json
{
  "name": "<sql_username>"
}
~~~

{{site.data.alerts.callout_danger}}
Deleting a SQL user cannot be undone.
{{site.data.alerts.end}}

## Change a SQL user's password

To change a SQL user's password send a `PUT` request to the `/v1/clusters/{cluster_id}/sql-users/{sql_username}/password` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Admin or Cluster Creator [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request PUT \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/sql-users/{sql_username}/password \
  --header "Authorization: Bearer {secret_key}" \
  --json '{"password":"{new_password}"}'
~~~

Where:

- `{cluster_id}` is the unique ID of this cluster.
{{site.data.alerts.callout_info}}
The cluster ID used in the Cloud API is different from the routing ID used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}).
{{site.data.alerts.end}}
- `{sql_username}` is the username of the SQL user whose password you want to change.
- `{new_password}` is the new password for the SQL user.

If the request is successful, the client receives a response with the name of the SQL user whose password was changed.

~~~ json
{
  "name": "<sql_username>"
}
~~~

Where `<sql_username>` is the name of the SQL user whose password was changed.

## Configure a CockroachDB Advanced cluster's maintenance window

To configure a [maintenance window]({% link cockroachcloud/advanced-cluster-management.md %}#set-a-maintenance-window) on a CockroachDB {{ site.data.products.advanced }} cluster, send a `PUT` request to the `/v1/clusters/{cluster_id}/maintenance-window` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Admin or Cluster Operator [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request PUT \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/maintenance-window \
  --header "Authorization: Bearer REPLACE_BEARER_TOKEN" \
  --json '{"offset_duration":"{offset_duration}","window_duration":"{window_duration}"}'
~~~

Where:

- `{cluster_id}` is the unique ID of this cluster.
{{site.data.alerts.callout_info}}
The cluster ID used in the Cloud API is different from the routing ID used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}).
{{site.data.alerts.end}}
- `{offset_duration}` is the start of the maintenance window, calculated as the amount of time after the start of a week (Monday 00:00 UTC) to begin the window.
- `{window_duration}` is the length of the maintenance window, which must be greater than 6 hours and less than one week.

To view a cluster's existing maintenance window, send a `GET` request to the `/api/v1/clusters/{cluster_id}/maintenance-window` endpoint:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/maintenance-window \
  --header "Authorization: Bearer REPLACE_BEARER_TOKEN"
~~~

~~~ json
{
  "offset_duration": "172800s",
  "window_duration": "21600s"
}
~~~

To remove a cluster's maintenance window, send a `DELETE` request to the `/api/v1/clusters/{cluster_id}/maintenance-window` endpoint:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request DELETE \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/maintenance-window \
  --header "Authorization: Bearer REPLACE_BEARER_TOKEN"
~~~

~~~ json
{
  "offset_duration": "172800s",
  "window_duration": "21600s"
}
~~~

### Set a patch upgrade deferral policy

Automatic patch upgrades can be delayed for a period of 30, 60, or 90 days to ensure that development and testing clusters are upgraded before production clusters. This setting applies only to patch upgrades and not to major version upgrades.

To set a patch upgrade deferral policy, send a `PUT` request to the `/api/v1/clusters/{cluster_id}/version-deferral` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Admin or Cluster Operator [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request PUT \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/version-deferral \
  --header "Authorization: Bearer REPLACE_BEARER_TOKEN" \
  --json '{"deferral_policy":"{deferral_policy}"}'
~~~

Where:

- `{cluster_id}` is the unique ID of this cluster.
{{site.data.alerts.callout_info}}
The cluster ID used in the Cloud API is different from the routing ID used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}).
{{site.data.alerts.end}}
- `{deferral_policy} is the length of the deferral window, set to `"DEFERRAL_30_DAYS"`, `"DEFERRAL_60_DAYS"`, or `"DEFERRAL_90_DAYS"`. Set to `"NOT_DEFERRED"` to remove the deferral policy and apply automatic patch upgrades immediately.

To view the existing patch deferral policy and current patch upgrade deferrals, send a `GET` request to the `/api/v1/clusters/{cluster_id}/version-deferral` endpoint.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/version-deferral \
  --header "Authorization: Bearer REPLACE_BEARER_TOKEN"
~~~

~~~ json
{
  "deferral_policy": "DEFERRAL_60_DAYS",
  "deferred_until": "2025-12-15T00:00:00Z"
}
~~~