**API request**

To create a **Serverless** cluster, send a `POST` request to the `/v1/clusters` endpoint, specifying the following parameters:

- `name`: your cluster's name, a short string with no whitespace.
- `provider`: "GCP" or "AWS".
- `primary_region`: (optional) Specify which region should be made the primary region. This is only applicable to multi-region Serverless clusters. This field is required if you create the cluster in more than one region.
- `regions`: An array of strings specifying the cloud provider's zone codes. For example, for Oregon, set region_name to "us-west2" for GCP and "us-west-2" for AWS.
- `usage_limits`:
  - `request_unit_limit`: (int64) the maximum number of request units that the cluster can consume during the month. If this limit is exceeded, then the cluster is disabled until the limit is increased, or until the beginning of the next month when more free request units are granted. It is an error for this to be zero.
  - `storage_mib_limit`: (int64) the maximum number of Mebibytes of storage that the cluster can have at any time during the month. If this limit is exceeded, then the cluster is throttled; only one SQL connection is allowed at a time, with the expectation that it is used to delete data to reduce storage usage. It is an error for this to be zero.
- `spend_limit`: (integer) the maximum monthly charge for a cluster, in US cents. We recommend using `usage_limits` instead, since `spend_limit` will be deprecated in the future.

[API reference](https://www.cockroachlabs.com/docs/api/cloud/v1.html#post-/api/v1/clusters)

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
--url 'https://management-staging.crdb.io/api/v1/clusters' \
--header "Authorization: Bearer $COCKROACH_API_KEY" \
--data @create-serverless-cluster-create.json
~~~

{% include_cached copy-clipboard.html %}
~~~ json
#create-serverless-cluster-create.json
{
  "name": "exemplary-cockroach",
  "provider": "GCP",
  "spec": {
    "serverless": {
      "regions": [
        "us-central1"
      ]
    }
  }
}
~~~

**API response**

Upon success, the API will return information about the newly created cluster:

Refer to the [API reference](https://www.cockroachlabs.com/docs/api/cloud/v1.html#post-/api/v1/clusters) for full details.
  - `id`: Your cluster's UUID.
  - `name`: The name of the cluster you specified when creating the cluster.
  - `cockroach_version`: The [release version of CockroachDB](../releases/index.html) running on your cluster.
  - `account_id`: <!-- ??? why is this null when I do it?  -->
  - `creator_id`: The UUID of the service account that created the cluster.

  - `account_id` is the ID of the account that created the cluster. If the cluster was created using the API, this will be the service account ID associated with the secret key used when creating the cluster.
  - `region_name` is the zone code of the cloud infrastructure provider where the cluster is located.
  - `routing_id` is the cluster name and tenant ID of the cluster used when [connecting to clusters](connect-to-a-serverless-cluster.html). For example, `exemplary-cockroach-6622`.
  - `sql_dns`: DNS name of the host on which the cluster is located.
{% include_cached copy-clipboard.html %}
~~~ json
{
  "id": "5c507da3-9ff8-4493-bf07-ab8cfa321499",
  "name": "exemplary-cockroach",
  "cockroach_version": "v23.1.4",
  "upgrade_status": "FINALIZED",
  "plan": "SERVERLESS",
  "cloud_provider": "GCP",
  "account_id": "",
  "state": "CREATED",
  "creator_id": "267ebd80-d419-4e0f-8e5d-801df4e3df14",
  "operation_status": "UNSPECIFIED",
  "config": {
    "serverless": {
      "spend_limit": 0,
      "routing_id": "exemplary-cockroach-6622",
      "usage_limits": null
    }
  },
  "regions": [
    {
      "name": "us-central1",
      "sql_dns": "serverless-us-c-1.gcp-us-central1.crdb.io",
      "ui_dns": "",
      "internal_dns": "",
      "node_count": 0,
      "primary": true
    }
  ],
  "created_at": "2023-07-20T17:04:07.561396Z",
  "updated_at": "2023-07-20T17:04:09.330533Z",
  "deleted_at": null,
  "sql_dns": "exemplary-cockroach-6622.6h5c.crdb.io",
  "network_visibility": "PUBLIC",
  "egress_traffic_policy": "UNSPECIFIED"
}
~~~
