---
title: Use the CockroachDB Cloud API
summary: The Cloud API is used to manage clusters within an organization
toc: true
docs_area: manage
cloud: true
---

The Cloud API is a [REST interface](https://wikipedia.org/wiki/Representational_state_transfer) that allows you programmatic access to manage the lifecycle of clusters within your organization.

This document covers the `latest` version (`2024-09-16`) of the API's `v1` endpoints. For for more detailed coverage of API endpoints for this version and prior verisons, refer to the [API reference documentation](https://www.cockroachlabs.com/docs/api/cloud/v1). 

Alternatively, you can make use of the [CockroachDB Cloud Terraform provider]({% link cockroachcloud/provision-a-cluster-with-terraform.md %}) for cluster management.

{{site.data.alerts.callout_info}}
If you used the API to manage CockroachDB Serverless clusters that have been migrated to CockroachDB Basic, ensure your code is updated to work with CockroachDB Basic.
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
  --url 'https://cockroachlabs.cloud/api/v1/clusters' \
  --header 'Authorization: Bearer {secret_key}'
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

The `Cc-Version` HTTP header specifies the version of the Cloud API to use. If you omit the `Cc-Version` header, the Cloud API will default to version `2022-03-31` (the initial release of the Cloud API). The Cloud API uses date-based versions of the form `YYYY-MM-DD`, in [ISO 8601 format](https://www.w3.org/TR/NOTE-datetime).

If you set an invalid version, you will get an HTTP 400 response with the message "invalid Cc-Version."

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="curl"><strong>curl</strong></button>
    <button class="filter-button page-level" data-scope="raw"><strong>Raw</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="curl">
{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url 'https://cockroachlabs.cloud/api/v1/clusters' \
  --header 'Authorization: Bearer {secret_key}' \
  --header 'Cc-Version: {version}'
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

## Create a new cluster

To create a cluster, send a `POST` request to the `/v1/clusters` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Administrator or Cluster Creator [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
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
  --header 'Authorization: Bearer {secret_key}' \
  --data '{"name":"{cluster_name}","provider":"{cloud_provider}","plan":"STANDARD","spec":{"serverless":{"regions":["{region_name}"],"usage_limits":{"provisioned_virtual_cpus":"2"}}}}'
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

  - `{cluster_name}`: the name of the cluster. This should be a short string with no whitespace.
  - `{cloud_provider}` is the name of the cloud infrastructure provider on which you want your cluster to run. Possible values are: `GCP`, `AWS`, `AZURE`.
  - `{region_name}`: the name of a CockroachDB Cloud [region]({% link cockroachcloud/regions.md %}). Region names are set by the cloud provider. For example,`us-west2` is a GCP region. Available regions vary based on both the selected plan type (`BASIC`, `STANDARD`, or `ADVANCED`) and the cloud provider.

  - `plan`: the cluster's plan, `BASIC`, `STANDARD`, or `ADVANCED`. The default is `STANDARD`.
  - The `usage_limits` field specifies the resource limits for the cluster. The `provisioned_virtual_cpus` field () indicates the maximum number of virtual CPUs (vCPUs) the cluster can provision.

For example, to create a new Standard cluster named `notorious-moose` using the default values for the cloud infrastructure provider and region:

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="curl"><strong>curl</strong></button>
    <button class="filter-button page-level" data-scope="raw"><strong>Raw</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="curl">

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
  --url https://cockroachlabs.cloud/api/v1/clusters \
  --header 'Authorization: Bearer {secret_key}' \
  --data '{"name":"notorious-moose","provider":"GCP","plan":"STANDARD","spec":{"serverless":{"regions":["us-central1"],"usage_limits":{"provisioned_virtual_cpus":"2"}}}}'
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

If the request was successful, the API will return information about the newly created cluster.

{% include_cached copy-clipboard.html %}
~~~ json
{
  "account_id": "",
  "cloud_provider": "{cloud_provider}",
  "cockroach_version": "v23.2.4",
  "config": {
    "serverless": {
      "routing_id": "{routing_id}",
      "upgrade_type": "{upgrade_type}",
      "usage_limits": {
        "provisioned_virtual_cpus": "2"
      }
    }
  },
  "created_at": "2022-03-22T20:23:11.285067Z",
  "creator_id": "{account_id}",
  "id": "{cluster_id}",
  "name": "{cluster_name}",
  "operation_status": "UNSPECIFIED",
  "plan": "STANDARD",
  "regions": [
    {
      "internal_dns": "{internal_dns}",
      "name": "{region_name}",
      "node_count": 0,
      "private_endpoint_dns": "{private_endpoint_dns}",
      "sql_dns": "{server_host}",
      "ui_dns": ""
    }
  ],
  "state": "CREATED",
  "updated_at": "2022-03-22T20:23:11.879593Z",
  "upgrade_status": "UPGRADE_AVAIALBLE"
}
~~~

Where:

  - `{cloud_provider}` is the name of the cloud infrastructure provider. Possible values are: `GCP`, `AWS`, `AZURE`.
  - `serverless` displays configuration for a CockroachDB Basic or Standard cluster
    - `{routing_id}` is the cluster name and tenant ID of the cluster used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}). For example, `funky-skunk-123`.
    - `{upgrade_type}` specifies whether the cluster will receive `AUTOMATIC` or `MANUAL` major version upgrades. `MANUAL` is not available for CockroachDB Basic.
    - For Basic clusters
      - `{request_unit_limit}` is the maximum number of request units that the cluster can consume during the month.
      - `{storage_mib_limit}` is the maximum number of Mebibytes of storage that the cluster can have at any time during the month.
    - For Standard clusters
      - `{provisioned_virtual_cpus}` is the maximum number of virtual CPUs (vCPUs) that the cluster can use. Once this limit is reached, operation latency may increase due to throttling.
  - `dedicated`, if present, represents configuration for a CockroachDB Advanced cluster.
  - `{account_id}` is the ID of the account that created the cluster. If the cluster was created using the API, this will be the service account ID associated with the secret key used when creating the cluster.
  - `{cluster_id}` is the unique ID of this cluster.
  {{site.data.alerts.callout_info}}
  The cluster ID used in the Cloud API is different from the routing ID used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}).
  {{site.data.alerts.end}}
  - `{cluster_name}` is the name of the cluster.
  - `{internal_dns}` is the internal DNS name of the cluster within the cloud provider's network. It is used to connect to the cluster with AWS PrivateLink, Azure Private Link, and GCP VPC Peering, but not GCP Private Service Connect. 

## Get information about a specific cluster

To retrieve detailed information about a specific cluster, make a `GET` request to the `/v1/clusters/{cluster_id}` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Administrator or Cluster Developer [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id} \
  --header 'Authorization: Bearer {secret_key}'
~~~

Where:

  - `{cluster_id}` is the cluster ID returned after creating the cluster.
  {{site.data.alerts.callout_info}}
  The cluster ID used in the Cloud API is different from the routing ID used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}).
  {{site.data.alerts.end}}
  - `{secret_key}` is the secret key for the service account.

If the request was successful, the API will return detailed information about the cluster.

{% include_cached copy-clipboard.html %}
~~~ json
{
  "account_id": "",
  "cloud_provider": "{cloud_provider}",
  "cockroach_version": "v23.2.4",
  "config": {
    "serverless": {
      "routing_id": "{routing_id}",
      "upgrade_type": "{upgrade_type}",
      "usage_limits": {
        "provisioned_virtual_cpus": "2"
      }
    }
  },
  "created_at": "2022-03-22T20:23:11.285067Z",
  "creator_id": "{account_id}",
  "id": "{cluster_id}",
  "name": "{cluster_name}",
  "operation_status": "UNSPECIFIED",
  "plan": "STANDARD",
  "regions": [
    {
      "internal_dns": "{internal_dns}",
      "name": "{region_name}",
      "node_count": 0,
      "private_endpoint_dns": "{private_endpoint_dns}",
      "sql_dns": "{server_host}",
      "ui_dns": ""
    }
  ],
  "state": "CREATED",
  "updated_at": "2022-03-22T20:23:11.879593Z",
  "upgrade_status": "UPGRADE_AVAIALBLE"
}
~~~

Where:

  - `{cloud_provider}` is the name of the cloud infrastructure provider. Possible values are: `GCP`, `AWS`, `AZURE`.
  - `serverless` displays configuration for a CockroachDB Basic or Standard cluster
    - `{routing_id}` is the cluster name and tenant ID of the cluster used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}). For example, `funky-skunk-123`.
    - `{upgrade_type}` specifies whether the cluster will receive `AUTOMATIC` or `MANUAL` major version upgrades. `MANUAL` is not available for CockroachDB Basic.
    - For Basic clusters
      - `{request_unit_limit}` is the maximum number of request units that the cluster can consume during the month.
      - `{storage_mib_limit}` is the maximum number of Mebibytes of storage that the cluster can have at any time during the month.
    - For Standard clusters
      - `{provisioned_virtual_cpus}` is the maximum number of virtual CPUs (vCPUs) that the cluster can use. Once this limit is reached, operation latency may increase due to throttling.
  - `dedicated`, if present, represents configuration for a CockroachDB Advanced cluster.
  - `{account_id}` is the ID of the account that created the cluster. If the cluster was created using the API, this will be the service account ID associated with the secret key used when creating the cluster.
  - `{cluster_id}` is the unique ID of this cluster.
  {{site.data.alerts.callout_info}}
  The cluster ID used in the Cloud API is different from the routing ID used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}).
  {{site.data.alerts.end}}
  - `{cluster_name}` is the name of the cluster.
  - `{internal_dns}` is the internal DNS name of the cluster within the cloud provider's network. It is used to connect to the cluster with AWS PrivateLink, Azure Private Link, and GCP VPC Peering, but not GCP Private Service Connect. 

## Get information about a cluster's nodes

To retrieve information about a cluster's nodes, including the node status, make a `GET` request to the `/v1/clusters/{cluster_id}/nodes` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Administrator or Cluster Developer [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/nodes \
  --header 'Authorization: Bearer {secret_key}'
~~~

Where:

  - `{cluster_id}` is the cluster ID returned after creating the cluster.
  {{site.data.alerts.callout_info}}
  The cluster ID used in the Cloud API is different from the routing ID used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}).
  {{site.data.alerts.end}}
  - `{secret_key}` is the secret key for the service account.

If the request was successful, the API will return detailed information about the nodes in the cluster.

{% include_cached copy-clipboard.html %}
~~~ json
{
  "nodes": [
    {
      "name": "{node_name}",
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
- `{region_name}` is the cloud infrastructure provider region where the cluster is located.
- `{status}` is the status of the node. Possible values are: `LIVE` and `NOT_READY`.

## Change resource limits for a Basic cluster

To set or update the maximum RU or storage limits for a cluster, send a `PATCH` request to the `/v1/clusters/{cluster_id}` endpoint with an updated `serverless.usage_limits` field.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Administrator or Cluster Developer [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

The service account associated with the secret key must have `ADMIN` or `EDIT` [permission]({% link cockroachcloud/managing-access.md %}#manage-service-accounts) to retrieve information about an organization's clusters.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="curl"><strong>curl</strong></button>
    <button class="filter-button page-level" data-scope="raw"><strong>Raw</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="curl">

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request PATCH \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id} \
  --header 'Authorization: Bearer {secret_key}' \
  --header 'Content-Type: application/json' \
  --data '{"serverless":{"usage_limits":{"storage_mib_limit":"5242880","request_unit_limit":"50000000"}}}'
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
  - `storage_mib_limit` is the maximum number of Mebibytes of storage that the cluster can have at any time during the month. If this limit is exceeded, then the cluster is throttled, where only one SQL connection is allowed at a time, with the expectation that it is used to delete data to reduce storage usage. It is an error for this value to be zero.
  - `request_unit_limit` is the maximum number of request units that the cluster can consume during the month. If this limit is exceeded, then the cluster is disabled until the limit is increased, or until the beginning of the next month when more request units are granted. It is an error for this to be zero.

If the request was successful, the client will not receive a response payload.

{{site.data.alerts.callout_info}}
The `spend_limit` field, which was deprecated in Serverless, is not supported on Basic or Standard. Instead, use `usage_limits`.
{{site.data.alerts.end}}

## Change provisioned vCPUs for a Standard cluster

To update the provisioned vCPUs for a cluster, send a `PATCH` request to the `/v1/clusters/{cluster_id}` endpoint  with an updated `serverless.usage_limits` field.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Administrator or Cluster Developer [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

The service account associated with the secret key must have `ADMIN` or `EDIT` [permission]({% link cockroachcloud/managing-access.md %}#manage-service-accounts) to retrieve information about an organization's clusters.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="curl"><strong>curl</strong></button>
    <button class="filter-button page-level" data-scope="raw"><strong>Raw</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="curl">

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request PATCH \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id} \
  --header 'Authorization: Bearer {secret_key}' \
  --data '{"usage_limits": {"provisioned_virtual_cpus": "{provisioned_virtual_cpus}"}}'
~~~

</section>

<section class="filter-content" markdown="1" data-scope="raw">

{% include_cached copy-clipboard.html %}
~~~ json
{
  "usage_limits": {
    "provisioned_virtual_cpus": "{provisioned_virtual_cpus}"
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
  - `{provisioned_virtual_cpus}` is the maximum number of virtual CPUs (vCPUs) that the cluster can use. Once this limit is reached, operation latency may increase due to throttling.

If the request was successful, the client will not receive a response payload.

## Delete a cluster

To delete a cluster, send a `DELETE` request to the `/v1/clusters/{cluster_id}` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Administrator or Cluster Creator [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

Deleting a cluster will permanently delete the cluster and all the data within the cluster.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request DELETE \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id} \
  --header 'Authorization: Bearer {secret_key}'
~~~

Where:

  - `{cluster_id}` is the unique ID of this cluster.
  {{site.data.alerts.callout_info}}
  The cluster ID used in the Cloud API is different from the routing ID used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}).
  {{site.data.alerts.end}}
  - `{secret_key}` is the secret key for the service account.

If the `DELETE` request was successful the client will not receive a response payload.

<a id="cloud-audit-logs"></a>

## Export Cloud Organization audit logs

{{site.data.alerts.callout_info}}
{% include_cached feature-phases/limited-access.md %}
{{site.data.alerts.end}}

To export audit logs for activities and events related to your Cloud organization, send a `GET` request to the `/v1/auditlogevents` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Administrator [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url 'https://cockroachlabs.cloud/api/v1/auditlogevents?starting_from={timestamp}&sort_order={sort_order}&limit={limit}' \
  --header 'Authorization: Bearer {secret_key}' \
  --header 'Cc-Version: {api_version}'
~~~

Where:

  - `{timestamp}` is an [RFC3339 timestamp](https://www.ietf.org/rfc/rfc3339.txt) that indicates the first log entry to fetch. If unspecified, defaults to the time when the Cloud organization was created if `{sort_order}` is `ASC`, or the current time if `{sort_order}` is `DESC`.
  - `{sort_order}` is either `ASC` (the default) or `DESC`.
  - `{limit}` indicates roughly how many entries to return. If any entries would be returned for a timestamp, all entries for that timestamp are always returned. Defaults to `200`.
  - `{api_version}` is the [Cloud API version](#set-the-api-version).

A request that includes no parameters exports roughly 200 entries in ascending order, starting from when your CockroachDB {{ site.data.products.cloud }} organization was created.

If the request was successful, the client will receive a JSON array consisting of a list of log `entries` and, depending on the circumstances, a `next_starting_from` field.

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

## List all clusters in an organization

To list all active clusters within an organization, send a `GET` request to the `/v1/clusters` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Administrator or Cluster Developer [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url 'https://cockroachlabs.cloud/api/v1/clusters' \
  --header 'Authorization: Bearer {secret_key}'
~~~

To return both active clusters and clusters that have been deleted or failed to initialize, send the `show_inactive=true` query parameter.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url 'https://cockroachlabs.cloud/api/v1/clusters?show_inactive=true' \
  --header 'Authorization: Bearer {secret_key}'
~~~

Where:

  - `{secret_key}` is the secret key for the service account.

If the request was successful, the client will receive a list of all clusters within the organization.

{% include_cached copy-clipboard.html %}
~~~ json
{
  "clusters": [
    {
      "account_id": "",
      "cloud_provider": "{cloud_provider}",
      "cockroach_version": "v23.2.4",
      "config": {
        "serverless": {
          "routing_id": "{routing_id}",
          "upgrade_type": "{upgrade_type}",
          "usage_limits": {
            "provisioned_virtual_cpus": "2"
          }
        }
      },
      "created_at": "2022-03-22T20:23:11.285067Z",
      "creator_id": "{account_id}",
      "id": "{cluster_id}",
      "name": "{cluster_name}",
      "operation_status": "UNSPECIFIED",
      "plan": "STANDARD",
      "regions": [
        {
          "internal_dns": "{internal_dns}",
          "name": "{region_name}",
          "node_count": 0,
          "private_endpoint_dns": "{private_endpoint_dns}",
          "sql_dns": "{server_host}",
          "ui_dns": ""
        }
      ],
      "state": "CREATED",
      "updated_at": "2022-03-22T20:23:11.879593Z",
      "upgrade_status": "UPGRADE_AVAILABLE"
    }
  ],
  "pagination": {
    "next_page": "<string>",
    "previous_page": "<string>"
  }
}
~~~

Where:

  - `{cloud_provider}` is the name of the cloud infrastructure provider. Possible values are: `GCP`, `AWS`, `AZURE`.
  - `serverless` displays configuration for a CockroachDB Basic or Standard cluster
    - `{routing_id}` is the cluster name and tenant ID of the cluster used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}). For example, `funky-skunk-123`.
    - `{upgrade_type}` specifies whether the cluster will receive `AUTOMATIC` or `MANUAL` major version upgrades.
    - For Basic clusters
      - `{request_unit_limit}` is the maximum number of request units that the cluster can consume during the month.
      - `{storage_mib_limit}` is the maximum number of Mebibytes of storage that the cluster can have at any time during the month.
    - For Standard clusters
      - `{provisioned_virtual_cpus}` is the maximum number of virtual CPUs (vCPUs) that the cluster can use. Once this limit is reached, operation latency may increase due to throttling.
  - `dedicated`, if present, represents configuration for a CockroachDB Advanced cluster.
  - `{account_id}` is the ID of the account that created the cluster. If the cluster was created using the API, this will be the service account ID associated with the secret key used when creating the cluster.
  - `{cluster_id}` is the unique ID of this cluster.
  {{site.data.alerts.callout_info}}
  The cluster ID used in the Cloud API is different from the routing ID used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}).
  {{site.data.alerts.end}}
  - `{cluster_name}` is the name of the cluster.
  -  {internal_dns} is the internal DNS name of the cluster within the cloud provider's network. It is used to connect to the cluster with AWS PrivateLink, Azure Private Link, and GCP VPC Peering, but not GCP Private Service Connect.
  - `{region_name}` is the zone code of the cloud infrastructure provider where the cluster is located.
  - `{private_endpoint_dns}` is the DNS name which is used to connect the cluster directly to a VPC within your Google Cloud project using GCP Private Service Connect.

## List the available regions for a cloud provider

To list the [available regions]({% link cockroachcloud/regions.md %}) for creating new clusters, send a `GET` request to the `/v1/clusters/available-regions?provider={cloud_provider}` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Administrator or Cluster Developer [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url 'https://cockroachlabs.cloud/api/v1/clusters/available-regions?provider={cloud_provider}' \
  --header 'Authorization: Bearer {secret_key}'
~~~

Where:

  - `{cloud_provider}` is the name of the cloud infrastructure provider. Possible values are: `GCP`, `AWS`, `AZURE`.
  - `{secret_key}` is the secret key for the service account.

If the request was successful, the client will receive a list of available regions for the specified cloud infrastructure provider.

{% include_cached copy-clipboard.html %}
~~~ json
{
  "regions": [
    "{region_array}"
  ]
}
~~~

Where:

  - `{region_array}` is a string array of regions available from the cloud infrastructure provider.

## List the SQL users in a cluster

To list the SQL users in a cluster, send a `GET` request to the `/v1/clusters/{cluster_id}/sql-users` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Administrator or Cluster Developer [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url 'https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/sql-users' \
  --header 'Authorization: Bearer {secret_key}'
~~~

Where:

  - `{cluster_id}` is the unique ID of this cluster.
  {{site.data.alerts.callout_info}}
  The cluster ID used in the Cloud API is different from the routing ID used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}).
  {{site.data.alerts.end}}
  - `{secret_key}` is the secret key for the service account.

If the request was successful, the client will receive a list of SQL users.

~~~ json
{
  "users": [
    {
      "name": "{user name}"
    }
  ],
  "pagination": {
    "next_page": "{next_page_token}"
  }
}
~~~

Where:
- `{user name}` is the SQL username of the user.
- `{next_page_token}` is the token to use for retrieving the next page of results, if any.

{{site.data.alerts.callout_info}}
TODO - review: This endpoint returns paginated results. Use the `next_page` token in the response to fetch subsequent pages if available.
{{site.data.alerts.end}}
{{site.data.alerts.callout_info}}
TODO - review: The available regions may vary depending on the selected plan type (BASIC, STANDARD, or ADVANCED) and the cloud infrastructure provider.
{{site.data.alerts.end}}

## Create a SQL user

To create a SQL user, send a `POST` request to the `/v1/clusters/{cluster_id}/sql-users` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Administrator or Cluster Creator [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
By default, a new SQL user created using the UI or Cloud API is granted the SQL `admin` role. An `admin` SQL user has full privileges for all databases and tables in the cluster, and can create additional SQL users and manage their privileges.
When possible, it is best practice to [limit each user's privileges]({% link cockroachcloud/managing-access.md %}#use-sql-roles-to-manage-access) to the minimum necessary for their tasks, in keeping with the [Principle of Least Privilege (PoLP)](https://wikipedia.org/wiki/Principle_of_least_privilege).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
  --url 'https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/sql-users' \
  --header 'Authorization: Bearer {secret_key}' \
  --header 'Content-Type: application/json' \
  --data '{"name":"{sql_username}","password":"{password}"}'
~~~

Where:

- `{cluster_id}` is the unique ID of this cluster.
{{site.data.alerts.callout_info}}
The cluster ID used in the Cloud API is different from the routing ID used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}).
{{site.data.alerts.end}}
- `{secret_key}` is the secret key for the service account.
- `{sql_username}` is the username of the new SQL user you want to create.
- `{password}` is the new user's password.

If the request was successful, the client will receive a response with the name of the new user.

~~~ json
{
  "name": "{sql_username}"
}
~~~

Where `{sql_username}` is the username of the newly created SQL user.

{{site.data.alerts.callout_info}}
Ensure that you store the password securely, as it cannot be retrieved later. If the password is lost, you'll need to reset it.
{{site.data.alerts.end}}

## Delete a SQL user

To delete a SQL user, send a `DELETE` request to the `/v1/clusters/{cluster_id}/sql-users/{sql_username}` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Administrator or Cluster Creator [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request DELETE \
  --url 'https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/sql-users/{sql_username}' \
  --header 'Authorization: Bearer {secret_key}'
~~~

Where:
- `{cluster_id}` is the unique ID of this cluster.
{{site.data.alerts.callout_info}}
The cluster ID used in the Cloud API is different from the routing ID used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}).
{{site.data.alerts.end}}
- `{sql_username}` is the username of the SQL user you want to delete.
- `{secret_key}` is the secret key for the service account.

If the request was successful, the client will receive a response with the name of the deleted user.

~~~ json
{
  "name": "{sql_username}"
}
~~~

Where `{sql_username}` is the username of the deleted SQL user.

{{site.data.alerts.callout_danger}}
Deleting a SQL user cannot be undone.
{{site.data.alerts.end}}

## Change a SQL user's password

To change a SQL user's password send a `PUT` request to the `/v1/clusters/{cluster_id}/sql-users/{sql_username}/password` endpoint.

{{site.data.alerts.callout_success}}
The service account associated with the secret key must have the Cluster Administrator or Cluster Creator [role]({% link cockroachcloud/authorization.md %}#organization-user-roles).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request PUT \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/sql-users/{sql_username}/password \
  --header 'Authorization: Bearer {secret_key}' \
  --data '{"password":"{new_password}"}'
~~~

Where:
- `{cluster_id}` is the unique ID of this cluster.
{{site.data.alerts.callout_info}}
The cluster ID used in the Cloud API is different from the routing ID used when [connecting to clusters]({% link cockroachcloud/connect-to-your-cluster.md %}).
{{site.data.alerts.end}}
- `{sql_username}` is the username of the SQL user whose password you want to change.
- `{new_password}` is the new password for the SQL user.


If the request was successful, the client will receive a response with the name of the SQL user whose password was changed.

~~~ json
{
  "name": "{sql_username}"
}
~~~

Where `{sql_username}` is the name of the SQL user whose password was changed.
