### Create a Dedicated cluster

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="curl"><strong>curl</strong></button>
    <button class="filter-button page-level" data-scope="raw"><strong>Raw</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="curl">
<!-- all the below is wrong, cribbed from serverless -->
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
  - `{cloud_provider}` is the name of the cloud infrastructure provider on which you want your cluster to run. Possible values are: `GCP`, `AWS`, `AZURE`.
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

Where:<!-- all the below is wrong, cribbed from serverless -->

  - `{cloud_provider}` is the name of the cloud infrastructure provider on which you want your cluster to run. Possible values are: `GCP`, `AWS`, `AZURE`.
  - `{cluster_id}` is the unique ID of this cluster. Use this ID when making API requests for this particular cluster.
    {{site.data.alerts.callout_info}}
    The cluster ID used in the Cloud API is different than the routing ID used when [connecting to clusters](connect-to-a-serverless-cluster.html).
    {{site.data.alerts.end}}
  - `{cluster_name}` is the name of the cluster you specified when creating the cluster.
  - `{account_id}` is the ID of the account that created the cluster. If the cluster was created using the API, this will be the service account ID associated with the secret key used when creating the cluster.
  - `{region_name}` is the zone code of the cloud infrastructure provider where the cluster is located.
  - `{routing_id}` is the cluster name and tenant ID of the cluster used when [connecting to clusters](connect-to-a-serverless-cluster.html). For example, `funky-skunk-123`.
  - `{server_host}` is the DNS name of the host on which the cluster is located.