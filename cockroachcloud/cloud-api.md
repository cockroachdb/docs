---
title: Use the Cloud API
summary: The Cloud API is used to manage clusters within an organization
toc: true
docs_area: manage
---

The Cloud API is a [REST interface](https://en.wikipedia.org/wiki/Representational_state_transfer) that allows you programmatic access to manage the lifecycle of clusters within your organization.

## API reference

Refer to the [full API reference documentation](../api/cloud/v1.html) for detailed descriptions of the API endpoints and options.

## Call the API

The API uses [bearer token authentication](https://swagger.io/docs/specification/authentication/bearer-authentication/), and each request requires a [secret key](console-access-management.html#api-access). The secret key is associated with a service account, and inherits the [permissions of the account](console-access-management.html#service-accounts).

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

Where `{secret_key}` is the [secret key string you stored when you created the API key in the Console](console-access-management.html#create-api-keys).

## Create a new cluster

To create a cluster, send a `POST` request to the `/v1/clusters` endpoint. The service account associated with the secret key must have `ADMIN` or `CREATE` [permission](console-access-management.html#service-accounts) to create new clusters.

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
  --data '{"name":"{cluster_name}","provider":"{cloud_provider}","spec":{"serverless":{"regions":["{region_name}"],"spendLimit":{spend_limit}}}}'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="raw">
{% include_cached copy-clipboard.html %}
~~~ json
{
  "name": "{cluster_name}",
  "provider": "{cloud_provider}",
  "spec": {
    "serverless": {
      "regions": [
        "{region_name}"
      ],
      "spendLimit": {spend_limit}
    }
  }
}
~~~
</section>

Where:

  - `{cluster_name}` is the name of the cluster. This should be a short string with no whitespace.
  - `{cloud_provider}` is the name of the cloud infrastructure provider on which you want your cluster to run. Possible values are: `GCP` and `AWS`.
  - `{region_name}` is the zone code of the cloud infrastructure provider. For example, on GCP you can set the "us-west2" zone code.
  - `{spend_limit}` is the [maximum amount of money, in US cents, you want to spend per month](plan-your-cluster.html) on this cluster.

For example, to create a new free Serverless cluster named "notorious-moose" using the default values for the cloud infrastructure provider and region:

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
  --data '{"name":"notorious-moose","provider":"GCP","spec":{"serverless":{"regions":["us-central1"],"spendLimit":0}}}'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="raw">
{% include_cached copy-clipboard.html %}
~~~ JSON
{
  "name": "notorious-moose",
  "provider": "GCP",
  "spec": {
    "serverless": {
      "regions": [
        "us-central1"
      ],
      "spendLimit": 0
    }
  }
}
~~~
</section>

If the request was successful, the API will return information about the newly created cluster.

{% include_cached copy-clipboard.html %}
~~~ json
{
  "cloud_provider": "{cloud_provider}",
  "created_at": "2022-03-14T14:15:22Z",
  "creator_id": "{account_id}",
  "deleted_at": "2022-03-14T14:15:22Z",
  "id": "{cluster_id}",
  "operation_status": "CLUSTER_STATUS_UNSPECIFIED",
  "name": "{cluster_name}",
  "plan": "SERVERLESS",
  "regions": [
    {
      "name": "{region_name}",
      "sql_dns": "{server_host}",
      "ui_dns": ""
    }
  ],
  "config": {
    "serverless": {
      "regions": [
        "{region_name}"
      ],
      "spend_limit": 0,
      "routing_id": "{routing_id}"
    }
  },
  "state": "CREATING",
  "updated_at": "2022-03-14T14:15:22Z"
}
~~~

Where:

  - `{cloud_provider}` is the name of the cloud infrastructure provider on which you want your cluster to run. Possible values are: `GCP` and `AWS`.
  - `{cluster_id}` is the unique ID of this cluster. Use this ID when making API requests for this particular cluster.
    {{site.data.alerts.callout_info}}
    The cluster ID used in the Cloud API is different than the routing ID used when [connecting to clusters](connect-to-a-serverless-cluster.html).
    {{site.data.alerts.end}}
  - `{cluster_name}` is the name of the cluster you specified when creating the cluster.
  - `{account_id}` is the ID of the account that created the cluster. If the cluster was created using the API, this will be the service account ID associated with the secret key used when creating the cluster.
  - `{region_name}` is the zone code of the cloud infrastructure provider where the cluster is located.
  - `{routing_id}` is the cluster name and tenant ID of the cluster used when [connecting to clusters](connect-to-a-serverless-cluster.html). For example, `funky-skunk-123`.
  - `{server_host}` is the DNS name of the host on which the cluster is located.

## Get information about a specific cluster

To retrieve detailed information about a specific cluster, make a `GET` request to the `/v1/clusters/{cluster_id}` endpoint. The service account associated with the secret key must have `ADMIN` or `READ` [permission](console-access-management.html#service-accounts) to retrieve information about an organization's clusters.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id} \
  --header 'Authorization: Bearer {secret_key}'
~~~

Where:

  - `{cluster_id}` is the cluster ID returned after creating the cluster.
  {{site.data.alerts.callout_info}}
  The cluster ID used in the Cloud API is different than the routing ID used when [connecting to clusters](connect-to-a-serverless-cluster.html).
  {{site.data.alerts.end}}
  - `{secret_key}` is the secret key for the service account.

If the request was successful, the API will return detailed information about the cluster.

{% include_cached copy-clipboard.html %}
~~~ json
{
  "cloud_provider": "{cloud_provider}",
  "created_at": "2022-03-14T14:15:22Z",
  "creator_id": "{account_id}",
  "deleted_at": "2022-03-14T14:15:22Z",
  "id": "{cluster_id}",
  "operation_status": "CLUSTER_STATUS_UNSPECIFIED",
  "name": "{cluster_name}",
  "plan": "SERVERLESS",
  "regions": [
    {
      "name": "{region_name}",
      "sql_dns": "{server_host}",
      "ui_dns": ""
    }
  ],
  "config": {
    "serverless": {
      "regions": [
        "{region_name}"
      ],
      "spend_limit": {spend_limit},
      "routing_id": "{routing_id}"
    }
  },
  "state": "CREATING",
  "updated_at": "2022-03-14T14:15:22Z"
}
~~~

Where:

  - `{cluster_id}` is the unique ID of this cluster. Use this ID when making API requests for this particular cluster.
  {{site.data.alerts.callout_info}}
  The cluster ID used in the Cloud API is different than the routing ID used when [connecting to clusters](connect-to-a-serverless-cluster.html).
  {{site.data.alerts.end}}
  - `{cluster_name}` is the name of the cluster you specified when creating the cluster.
  - `{cloud_provider}` is the name of the cloud infrastructure provider on which you want your cluster to run. Possible values are: `GCP` and `AWS`.
  - `{account_id}` is the ID of the account that created the cluster. If the cluster was created using the API, this will be the service account ID associated with the secret key used when creating the cluster.
  - `{region_name}` is the cloud infrastructure provider region where the cluster is located.
  - `{spend_limit}` is the [maximum amount of money, in US cents, you want to spend per month](plan-your-cluster.html) on this cluster.
  - `{routing_id}` is the cluster name and tenant ID of the cluster used when [connecting to clusters](connect-to-a-serverless-cluster.html). For example, `funky-skunk-123`.
  - `{server_host}` is the DNS name of the host on which the cluster is located.

## Get information about a cluster's nodes

To retrieve information about a cluster's nodes, including the node status, make a `GET` request to the `/v1/clusters/{cluster_id}/nodes` endpoint. The service account associated with the secret key must have `ADMIN` or `READ` [permission](console-access-management.html#service-accounts) to retrieve information about an organization's clusters.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/nodes \
  --header 'Authorization: Bearer {secret_key}'
~~~

Where:

  - `{cluster_id}` is the cluster ID returned after creating the cluster.
  {{site.data.alerts.callout_info}}
  The cluster ID used in the Cloud API is different than the routing ID used when [connecting to clusters](connect-to-a-serverless-cluster.html).
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

## Set the maximum spend limit of a Serverless cluster

To set the maximum spend limit for a Serverless cluster, send a `PUT` request to the `/v1/clusters/{cluster_id}/spend-limit` endpoint. The service account associated with the secret key must have `ADMIN` or `EDIT` [permission](console-access-management.html#service-accounts) to retrieve information about an organization's clusters.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="curl"><strong>curl</strong></button>
    <button class="filter-button page-level" data-scope="raw"><strong>Raw</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="curl">
{% include_cached copy-clipboard.html %}
~~~ shell
curl --request PUT \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/spend-limit \
  --header 'Authorization: Bearer {secret_key}' \
  --data '{"spendLimit": {spend_limit}}'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="raw">
{% include_cached copy-clipboard.html %}
~~~ json
{
  "spendLimit": {spend_limit}
}
~~~
</section>

Where:

  - `{cluster_id}` is the unique ID of this cluster.
  {{site.data.alerts.callout_info}}
  The cluster ID used in the Cloud API is different than the routing ID used when [connecting to clusters](connect-to-a-serverless-cluster.html).
  {{site.data.alerts.end}}
  - `{secret_key}` is the secret key for the service account.
  - `{spend_limit}` is the [maximum amount of money, in US cents, you want to spend per month](plan-your-cluster.html) on this cluster.

If the request was successful, the client will not receive a response payload.

## Delete a cluster

To delete a cluster, send a `DELETE` request to the `/v1/clusters/{cluster_id}` endpoint. The service account associated with the secret key must have `ADMIN` or `DELETE` [permission](console-access-management.html#service-accounts) to delete an organization's clusters.

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
  The cluster ID used in the Cloud API is different than the routing ID used when [connecting to clusters](connect-to-a-serverless-cluster.html).
  {{site.data.alerts.end}}
  - `{secret_key}` is the secret key for the service account.

If the `DELETE` request was successful the client will not receive a response payload.

## List all clusters in an organization

To list all active clusters within an organization, send a `GET` request to the `/v1/clusters` endpoint. The service account associated with the secret key must have `ADMIN` or `READ` [permission](console-access-management.html#service-accounts) to list an organization's clusters.

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
      "cloud_provider": "{cloud_provider}",
      "created_at": "2022-03-14T14:15:22Z",
      "creator_id": "{account_id}",
      "deleted_at": "2022-03-14T14:15:22Z",
      "id": "{cluster_id}",
      "operation_status": "CLUSTER_STATUS_UNSPECIFIED",
      "name": "{cluster_name}",
      "plan": "SERVERLESS",
      "regions": [
        {
          "name": "{region_name}",
          "sql_dns": "{server_host}",
          "ui_dns": ""
        }
      ],
      "config": {
        "serverless": {
          "regions": [
            "{region_name}"
          ],
          "spend_limit": {spend_limit},
          "routing_id": "{routing_id}"
        }
      },
      "state": "CREATING",
      "updated_at": "2022-03-14T14:15:22Z"
    }
  ],
  ...
  }
}
~~~

Where:

  - `{cluster_id}` is the unique ID of this cluster.
  {{site.data.alerts.callout_info}}
  The cluster ID used in the Cloud API is different than the routing ID used when [connecting to clusters](connect-to-a-serverless-cluster.html).
  {{site.data.alerts.end}}
  - `{cluster_name}` is the name of the cluster.
  - `{cloud_provider}` is the name of the cloud infrastructure provider. Possible values are: `GCP` and `AWS`.
  - `{account_id}` is the ID of the account that created the cluster. If the cluster was created using the API, this will be the service account ID associated with the secret key used when creating the cluster.
  - `{region_name}` is the zone code of the cloud infrastructure provider where the cluster is located.
  - `{spend_limit}` is the [maximum amount of money, in US cents, you want to spend per month](plan-your-cluster.html) on this cluster.

## List the available regions for a cloud infrastructure provider

To list the available regions for creating new clusters, send a `GET` request to the `/v1/clusters/available-regions?provider={cloud_provider}` endpoint. The service account associated with the secret key must have `ADMIN` or `READ` [permission](console-access-management.html#service-accounts) to list the available regions.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url 'https://cockroachlabs.cloud/api/v1/clusters/available-regions?provider={cloud_provider}' \
  --header 'Authorization: Bearer {secret_key}'
~~~

Where:

  - `{cloud_provider}` is the name of the cloud infrastructure provider. Possible values are: `GCP` and `AWS`.
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
