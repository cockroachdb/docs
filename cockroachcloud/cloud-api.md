---
title: Use the Cloud API
summary: The Cloud API is used to manage clusters within an organization
toc: true
---

The Cloud API is a [REST interface](https://en.wikipedia.org/wiki/Representational_state_transfer) that allows users programmatic access to manage the lifecycle of clusters within their organization.

## API access

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
  --url 'https://cockroachlabs.cloud/api/v1/orgs/{organizationId}/clusters' \
  --header 'Authorization: Bearer {secret key}'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="raw">
{% include_cached copy-clipboard.html %}
~~~ text
Authorization: Bearer {secret key}
~~~
</section>

Where `{secret key}` is the [secret key string you stored when you created the API key in the Console](console-access-management.html#create-api-keys).

You will also need your **Organization ID**, located in the **Settings** page of the Console. Replace `{organizationId}` with your ID in the endpoint URIs.

## Create a new cluster

To create a cluster, send a `POST` request to the `/v1/orgs/{organizationId}/clusters` endpoint. The service account associated with the secret key must have `ADMIN` or `CREATE` permissions to create new clusters.

The `{organizationId}` for an organization can be found in the **Settings** page of the Console under **Organization ID**.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="curl"><strong>curl</strong></button>
    <button class="filter-button page-level" data-scope="raw"><strong>Raw</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="curl">
{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
  --url https://cockroachlabs.cloud/api/v1/orgs/{organizationId}/clusters \
  --header 'Authorization: Bearer {secret key}' \
  --data '{"name":"{cluster name}","provider":"{cloud provider}","serverless":{"regions":["{region name}"],"spendLimit":{spend limit}}}'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="raw">
{% include_cached copy-clipboard.html %}
~~~ json
{
  "name": "{cluster name}",
  "provider": "{cloud provider}",
  "serverless": {
    "regions": [
      "{region name}"
    ],
    "spendLimit": {spend limit}
  }
}
~~~
</section>

Where:

  - `{cluster name}` is the name of the cluster. This should be a short string with no whitespace.
  - `{cloud provider}` is the name of the cloud infrastructure provider on which you want your cluster to run. Possible values are: `GCP` and `AWS`. The default value is `GCP`.
  - `{region name}` is the zone code of the cloud infrastructure provider. For example, on GCP you can set the "us-west2" zone code.
  - `{spend limit}` is the [maximum amount of US dollars you want to spend per month](serverless-cluster-management.html#planning-your-cluster) on this cluster.

For example, to create a new free Serverless cluster named "notorious-moose" using the default values for the cloud infrastructure provider and region:

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="curl"><strong>curl</strong></button>
    <button class="filter-button page-level" data-scope="raw"><strong>Raw</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="curl">
{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
  --url https://cockroachlabs.cloud/api/v1/orgs/{organizationId}/clusters \
  --header 'Authorization: Bearer {secret key}' \
  --data '{"name":"notorious-moose","serverless":{"regions":["us-central1"],"spendLimit":0}}'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="raw">
{% include_cached copy-clipboard.html %}
~~~ JSON
{
  "name": "notorious-moose",
  "serverless": {
    "spendLimit": 0
  }
}
~~~
</section>

If the request was successful, the API will return information about the newly created cluster.

{% include_cached copy-clipboard.html %}
~~~ json
{
  "cluster": {
    "id": "{clusterId}",
    "name": "{cluster name}",
    "cockroachVersion": "{CockroachDB version}",
    "plan": "SERVERLESS",
    "cloudProvider": "GCP",
    "state": "CREATING",
    "creatorId": "{account ID}",
    "longRunningOperationStatus": "NOT_SET",
    "serverless": {
      "regions": [
        "{region name}"
      ],
      "spendLimit": 0
    },
    "createdAt": "2021-09-24T14:15:22Z",
    "updatedAt": "2021-09-24T14:15:22Z",
    "deletedAt": "2021-09-24T14:15:22Z"
  }
}
~~~

Where:

  - `{clusterId}` is the unique ID of this cluster. Use this ID when making API requests for this particular cluster.
  - `{cluster name}` is the name of the cluster you specified when creating the cluster.
  - `{CockroachDB version}` is the version of CockroachDB running on this cluster.
  - `{account ID}` is the ID of the account that created the cluster. If the cluster was created using the API, this will be the service account ID associated with the secret key used when creating the cluster.
  - `{region name}` is the zone code of the cloud infrastructure provider where the cluster is located.

## Retrieve information about a specific cluster

To retrieve detailed information about a specific cluster, make a `GET` request to the `/v1/orgs/{organizationId}/clusters/{clusterId}` endpoint. The service account associated with the secret key must have `ADMIN` or `READ` permissions to retrieve information about an organization's clusters.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/orgs/{organizationId}/clusters/{clusterId} \
  --header 'Authorization: Bearer {secret key}'
~~~

Where:

  - `{organizationId}` is the organization service ID.
  - `{clusterId}` is the cluster ID returned after creating the cluster.
  - `{secret key}` is the secret key for the service account.

If the request was successful, the API will return detailed information about the cluster.

{% include_cached copy-clipboard.html %}
~~~ json
{
  "cluster": {
    "id": "{clusterId}",
    "name": "{cluster name}",
    "cockroachVersion": "{CockroachDB version}",
    "plan": "SERVERLESS",
    "cloudProvider": "{cloud provider}",
    "state": "CREATING",
    "creatorId": "{account ID}",
    "longRunningOperationStatus": "NOT_SET",
    "serverless": {
      "regions": [
        "{region name}"
      ],
      "spendLimit": {spend limit}
    },
    "createdAt": "2021-09-24T14:15:22Z",
    "updatedAt": "2021-09-24T14:15:22Z",
    "deletedAt": "2021-09-24T14:15:22Z"
  },
  "regions": [
    "name": "string",
    "sqlDns": "string",
    "uiDns": "string",
    "nodes": [
      {
        "name": "{node name}",
        "regionName": "{region name}",
        "status": "{node status}"
      }
    ]
  ]
}
~~~

Where:

  - `{clusterId}` is the unique ID of this cluster. Use this ID when making API requests for this particular cluster.
  - `{cluster name}` is the name of the cluster you specified when creating the cluster.
  - `{CockroachDB version}` is the version of CockroachDB running on this cluster.
  - `{cloud provider}` is the name of the cloud infrastructure provider on which you want your cluster to run. Possible values are: `GCP` and `AWS`. The default value is `GCP`.
  - `{account ID}` is the ID of the account that created the cluster. If the cluster was created using the API, this will be the service account ID associated with the secret key used when creating the cluster.
  - `{region name}` is the cloud infrastructure provider region where the cluster is located.
  - `{spend limit}` is the [maximum amount of US dollars you want to spend per month](serverless-cluster-management.html#planning-your-cluster) on this cluster.
  - `{node name}` is the name of the node in the cluster.
  - `{node status}` is the status of the node. Possible values are: `LIVE` and `NOT_READY`

## Set the maximum spend limit of a Serverless cluster

To set the maximum spend limit for a Serverless cluster, send a `PUT` request to the `/v1/orgs/{organizationId}/clusters/{clusterId}/spend-limit` endpoint. The service account associated with the secret key must have `ADMIN` or `EDIT` permissions to retrieve information about an organization's clusters.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="curl"><strong>curl</strong></button>
    <button class="filter-button page-level" data-scope="raw"><strong>Raw</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="curl">
{% include_cached copy-clipboard.html %}
~~~ shell
curl --request PUT \
  --url https://cockroachlabs.cloud/api/v1/orgs/{organizationId}/clusters/{clusterId}/spend-limit \
  --header 'Authorization: Bearer {secret key}' \
  --data '{"spendLimit": {spend limit}}'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="raw">
{% include_cached copy-clipboard.html %}
~~~ json
{
  "spendLimit": {spend limit}
}
~~~
</section>

Where:

  - `{organizationId}` is the organization service ID.
  - `{clusterId}` is the unique ID of this cluster.
  - `{secret key}` is the secret key for the service account.
  - `{spend limit}` is the [maximum amount of US dollars you want to spend per month](serverless-cluster-management.html#planning-your-cluster) on this cluster.

If the request was successful, the client will not receive a response payload.

## Delete a cluster

To delete a cluster, send a `DELETE` request to the `/v1/orgs/{organizationId}/clusters/{clusterId}` endpoint. The service account associated with the secret key must have `ADMIN` or `DELETE` permissions to delete an organization's clusters.

Deleting a cluster will permanently delete the cluster and all the data within the cluster.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request DELETE \
  --url https://cockroachlabs.cloud/api/v1/orgs/{organizationId}/clusters/{clusterId} \
  --header 'Authorization: Bearer {secret key}'
~~~

Where:

  - `{organizationId}` is the organization service ID.
  - `{clusterId}` is the cluster ID.
  - `{secret key}` is the secret key for the service account.

If the `DELETE` request was successful the client will not receive a response payload.

## List all clusters in an organization

To list all clusters within an organization, send a `GET` request to the `/v1/orgs/{organizationId}/clusters` endpoint. The service account associated with the secret key must have `ADMIN` or `READ` permissions to list an organization's clusters.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url 'https://cockroachlabs.cloud/api/v1/orgs/{organizationId}/clusters' \
  --header 'Authorization: Bearer {secret key}'
~~~

Where:

  - `{organizationId}` is the organization service ID.
  - `{secret key}` is the secret key for the service account.

If the request was successful, the client will receive a list of all clusters within the organization.

{% include_cached copy-clipboard.html %}
~~~ json
{
  "clusters": [
    {
      "id": "{clusterId}",
      "name": "{cluster name}",
      "cockroachVersion": "{CockroachDB version}",
      "plan": "SERVERLESS",
      "cloudProvider": "{cloud provider}",
      "state": "CREATING",
      "creatorId": "{account ID}",
      "longRunningOperationStatus": "NOT_SET",
      "serverless": {
        "regions": [
          "{region name}"
        ],
        "spendLimit": {spend limit}
      },
      "createdAt": "2021-09-24T14:15:22Z",
      "updatedAt": "2021-09-24T14:15:22Z",
      "deletedAt": "2021-09-24T14:15:22Z"
    }
    ...
  ]
}
~~~

Where:

  - `{clusterId}` is the unique ID of this cluster.
  - `{cluster name}` is the name of the cluster.
  - `{CockroachDB version}` is the version of CockroachDB running on this cluster.
  - `{cloud provider}` is the name of the cloud infrastructure provider. Possible values are: `GCP` and `AWS`.
  - `{account ID}` is the ID of the account that created the cluster. If the cluster was created using the API, this will be the service account ID associated with the secret key used when creating the cluster.
  - `{region name}` is the zone code of the cloud infrastructure provider where the cluster is located.
  - `{spend limit}` is the [maximum amount of US dollars you want to spend per month](serverless-cluster-management.html#planning-your-cluster) on this cluster.

## List the available regions for a cloud infrastructure provider

To list the available regions for creating new clusters, send a `GET` request to the `/v1/orgs/{organizationId}/clusters/available-regions?provider={cloud provider}` endpoint. The service account associated with the secret key must have `ADMIN` or `READ` permissions to list the available regions.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url 'https://cockroachlabs.cloud/api/v1/orgs/{organizationId}/clusters/available-regions?provider={cloud provider}' \
  --header 'Authorization: Bearer {secret key}'
~~~

Where:

  - `{organizationId}` is the organization service ID.
  - `{cloud provider}` is the name of the cloud infrastructure provider. Possible values are: `GCP` and `AWS`.
  - `{secret key}` is the secret key for the service account.

If the request was successful, the client will receive a list of available regions for the specified cloud infrastructure provider.

{% include_cached copy-clipboard.html %}
~~~ json
{
  "regions": [
    "{region array}"
  ]
}
~~~

Where:

  - `{region array}` is a string array of regions available from the cloud infrastructure provider.
