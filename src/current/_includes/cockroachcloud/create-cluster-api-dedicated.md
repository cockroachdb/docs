**API request**

To create a **Dedicated** cluster, send a `POST` request to the `/v1/clusters` endpoint, specifying the following parameters:

- `name`: your cluster's name, a short string with no whitespace.
- `provider`: "GCP", "AWS", or`AZURE`. Note that support for Azure is in [limited access](/docs/{{site.versions["stable"]}}/cockroachdb-feature-availability.html).
- `hardware`:
  - `machine_spec`
    - `machine_type`: machine type, e.g. "n2-standard-2".
  - `storage_gib`: (int) storage in GiB.
- `region_nodes`: a hash where each key is a region name and each value is the desired number of nodes (if not 0).
- `spend_limit`: specified in dollars
- `network_visibility`: PRIVATE or PUBLIC
- `restrict_egress_traffic`: true or false

[API reference](https://www.cockroachlabs.com/docs/api/cloud/v1.html#post-/api/v1/clusters)

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
--url 'https://management-staging.crdb.io/api/v1/clusters' \
--header 'Authorization: Bearer { api key }' \
--data @create-dedicated-cluster.json
~~~

{% include_cached copy-clipboard.html %}
~~~ json
#create-dedicated-cluster-create.json
{
  "name": "docstestcluster",
  "provider": "GCP",
  "spec": {
    "dedicated": {
      "hardware": {
        "machine_spec": {"machine_type": "n2-standard-2"},
        "storage_gib":15
      },
      "region_nodes": {
        "us-west2": 1
      },
      "spend_limit": 0,
     "network_visibility": "PRIVATE",
     "restrict_egress_traffic": true
    }
  }
}
~~~

**API response**

Upon success, the API will return information about the newly created cluster.
Save your cluster's UUID, in the `id` field, so you can use the API to [Get information about your cluster](#get-information-about-a-specific-cluster), or inspect it in the {{ site.data.products.db }} console at:
`https://cockroachlabs.cloud/cluster/{ your cluster id}`


{% include_cached copy-clipboard.html %}
~~~ json
{
  "id": "b453f920-8e9a-488a-8ef5-23f2e86fcc0e",
  "name": "docstestcluster2",
  "cockroach_version": "v23.1.1",
  "upgrade_status": "FINALIZED",
  "plan": "DEDICATED",
  "cloud_provider": "GCP",
  "account_id": "crl-staging-7765",
  "state": "CREATING",
  "creator_id": "b9ad8253-8c60-46fd-afc2-62fd39e7d2ed",
  "operation_status": "UNSPECIFIED",
  "config": {
    "dedicated": {
      "machine_type": "n2-standard-2",
      "num_virtual_cpus": 2,
      "storage_gib": 15,
      "memory_gib": 8,
      "disk_iops": 450
    }
  },
  "regions": [
    {
      "name": "us-west2",
      "sql_dns": "docstestcluster2-7765.gcp-us-west2.crdb.io",
      "ui_dns": "admin-docstestcluster2-7765.gcp-us-west2.crdb.io",
      "internal_dns": "",
      "node_count": 1,
      "primary": false
    }
  ],
  "created_at": "2023-07-06T01:22:00.916592Z",
  "updated_at": "2023-07-06T01:22:02.304708Z",
  "deleted_at": null,
  "sql_dns": "docstestcluster2-7765.crdb.io",
  "network_visibility": "PRIVATE",
  "egress_traffic_policy": "UNSPECIFIED"
}
~~~