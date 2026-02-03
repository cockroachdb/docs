---
title: Physical Cluster Replication for Resiliency
summary: Set up physical cluster replication (PCR) in a Cloud deployment.
toc: true
---

{{site.data.alerts.callout_info}}
{% include feature-phases/limited-access.md %}
{{site.data.alerts.end}}

CockroachDB **physical cluster replication (PCR)** continuously sends all data at the cluster level from a _primary_ cluster to an independent _standby_ cluster. Existing data and ongoing changes on the active primary cluster, which is serving application data, replicate asynchronously to the passive standby cluster.

PCR provides a **two-datacenter resiliency strategy (2DC)** where clusters are limited to two regions. In a disaster recovery scenario, you can [fail over](#fail-over-to-the-standby-cluster) from the unavailable primary cluster to the available standby cluster. This will stop the PCR stream, reset the standby cluster to a point in time where all ingested data is consistent, and mark the standby as ready to accept application traffic.

## Set up PCR on CockroachDB {{ site.data.products.advanced }}

In this guide, you'll use the [{{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}) to set up PCR from a primary cluster to a standby cluster, monitor the PCR stream, and fail over from the primary to the standby cluster.

{{site.data.alerts.callout_info}}
PCR is supported on CockroachDB {{ site.data.products.advanced }} and CockroachDB {{ site.data.products.core }} clusters. For a guide to setting up PCR on CockroachDB {{ site.data.products.core }}, refer to the [Set Up Physical Cluster Replication]({% link {{ site.current_cloud_version }}/set-up-physical-cluster-replication.md %}) tutorial.
{{site.data.alerts.end}}

You can also refer to instructions for [failover](#fail-over-to-the-standby-cluster) and [failback](#fail-back-to-the-primary-cluster).

### Before you begin

You'll need the following:

- **Two CockroachDB {{ site.data.products.advanced }} clusters with the [`supports_cluster_virtualization` flag enabled](#step-1-create-the-clusters).** For more information about cluster virtualization, read the [documentation]({% link {{ site.versions["stable"] }}/cluster-virtualization-overview.md %}). To set up PCR successfully, configure your clusters as per the following:
    - Clusters must be in the same cloud (AWS, GCP, or Azure).
    - Clusters must be single [region]({% link cockroachcloud/regions.md %}) (multiple availability zones per cluster is supported).
    - The primary and standby cluster in AWS and Azure must be in different regions.
    - The primary and standby cluster in GCP can be in the same region, but must not have overlapping CIDR ranges.
    - Clusters can have different [node topology]({% link cockroachcloud/plan-your-cluster-advanced.md %}#cluster-topology) and [hardware configurations]({% link cockroachcloud/plan-your-cluster-advanced.md %}#cluster-sizing-and-scaling). To avoid performance constraints (failover and redirecting application traffic to a standby), we recommend configuring the primary and standby clusters with similar hardware.

    {{site.data.alerts.callout_success}}
    We recommend [enabling Prometheus metrics export]({% link cockroachcloud/export-metrics.md %}) on your cluster before starting a PCR stream. For details on metrics to track, refer to [Monitor the PCR stream](#step-3-monitor-the-pcr-stream).
    {{site.data.alerts.end}}
- **[Cloud API Access]({% link cockroachcloud/managing-access.md %}#api-access).**
    To set up and manage PCR on CockroachDB {{ site.data.products.advanced }} clusters, you'll use the `'https://cockroachlabs.cloud/api/v1/physical-replication-streams'` endpoint. Access to the `physical-replication-streams` endpoint requires a valid CockroachDB {{ site.data.products.cloud }} [service account]({% link cockroachcloud/managing-access.md %}#manage-service-accounts) with the correct permissions.

    The following describes the required roles for the `physical-replication-streams` endpoint methods. These can be assigned at the [organization]({% link cockroachcloud/authorization.md %}#organization-user-roles), [folder]({% link cockroachcloud/folders.md %}), or cluster scope:

    Method | Required roles | Description
    -------+----------------+------------
    `POST` | [Cluster Admin]({% link cockroachcloud/authorization.md %}#cluster-admin) | Create a PCR stream. Required on the primary and standby clusters.
    `GET` | [Cluster Admin]({% link cockroachcloud/authorization.md %}#cluster-admin), [Cluster Operator]({% link cockroachcloud/authorization.md %}#cluster-operator), [Cluster Developer]({% link cockroachcloud/authorization.md %}#cluster-developer) | Retrieve information for the PCR stream. Required on either the primary or standby cluster.
    `PATCH` | [Cluster Admin]({% link cockroachcloud/authorization.md %}#cluster-admin) | Update the PCR stream to fail over. Required on either the primary or standby cluster.

    Using the same cluster roles on each cluster will provide the best visibility into the PCR stream.

    {{site.data.alerts.callout_success}}
    We recommend creating service accounts with the [principle of least privilege](https://wikipedia.org/wiki/Principle_of_least_privilege), and giving each application that accesses the API its own service account and API key. This allows fine-grained access to the cluster and PCR streams.
    {{site.data.alerts.end}}

For the schema of each API response, refer to the [CockroachDB Cloud API reference documentation](https://www.cockroachlabs.com/docs/api/cloud/v1.html#get-/api/v1/physical-replication-streams).

### Step 1. Create the clusters

To use PCR, it is necessary to set the `supports_cluster_virtualization` field to `true`. This setting enables cluster virtualization, which is the architecture that supports PCR. For details on supported cluster cloud provider and region setup, refer to the [prerequisites section](#before-you-begin).

{{site.data.alerts.callout_info}}
If you are creating clusters in AWS or Azure, you must start the primary and standby clusters in different regions.
{{site.data.alerts.end}}

1. Send a `POST` [request](https://www.cockroachlabs.com/docs/api/cloud/v1.html#post-/api/v1/physical-replication-streams) to create the primary cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --location --request POST 'https://cockroachlabs.cloud/api/v1/clusters' \
    --header "Authorization: Bearer {api_secret_key}" \
    --header "content-type: application/json" \
    --data '{
      "name": "{primary_cluster_name}", 
      "provider": "AWS", 
      "spec": {
        "dedicated": {
          "cockroachVersion": "v25.2", 
          "hardware": {
            "disk_iops": 0,
            "machine_spec": {
              "num_virtual_cpus": 4
            }, 
            "storage_gib": 16
          }, 
          "region_nodes": {
            "us-east-1": 3
          }, 
          "supports_cluster_virtualization": true
        }
      }
    }'
    ~~~

Replace:

- `{api_secret_key}` with your API secret key.
- `{primary_cluster_id}` with the cluster ID returned after creating the primary cluster.

Ensure that you replace each of the values for the cluster specification as per your requirements. For details on the cluster specifications, refer to [Create a cluster]({% link cockroachcloud/cloud-api.md %}#create-a-cluster).

1. Send a `POST` [request](https://www.cockroachlabs.com/docs/api/cloud/v1.html#post-/api/v1/physical-replication-streams) to create the standby cluster that includes your necessary cluster specification. Ensure that you include `supports_cluster_virtualization` set to `true`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --location --request POST 'https://cockroachlabs.cloud/api/v1/clusters' \
    --header "Authorization: Bearer {api_secret_key}" \
    --header "content-type: application/json" \
    --data '{
      "name": "{standby_cluster_name}", 
      "provider": "AWS", 
      "spec": {
        "dedicated": {
          "cockroachVersion": "v25.2", "hardware": {
            "disk_iops": 0, "machine_spec": {
              "num_virtual_cpus": 4
            }, 
            "storage_gib": 16
          }, 
          "region_nodes": {
            "us-east-2": 3
          }, 
          "supports_cluster_virtualization": true
        }
      }
    }'
    ~~~

Replace:

- `{api_secret_key}` with your API secret key.
- `{standby_cluster_id}` with the cluster ID returned after creating the standby cluster.

{{site.data.alerts.callout_success}}
We recommend [enabling Prometheus metrics export]({% link cockroachcloud/export-metrics.md %}) on your cluster before starting a PCR stream. For details on metrics to track, refer to [Monitor the PCR stream](#step-3-monitor-the-pcr-stream).
{{site.data.alerts.end}}

### Step 2. Start the PCR stream

{{site.data.alerts.callout_info}}
We recommend using an empty standby cluster when starting PCR. When you initiate the PCR stream, CockroachDB {{ site.data.products.cloud }} will take a full cluster backup of the standby cluster, delete all data from the standby, and then start the PCR stream, which ensures that the standby will be fully consistent with the primary during PCR.
{{site.data.alerts.end}}

With the primary and standby clusters set up, you can now start a PCR stream.

1. Send a `POST` [request](https://www.cockroachlabs.com/docs/api/cloud/v1.html#post-/api/v1/physical-replication-streams) to the `/v1/physical-replication-streams` endpoint to start the PCR stream:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST --url https://cockroachlabs.cloud/api/v1/physical-replication-streams \
--header "Authorization: Bearer {api_secret_key}" \
--json '{
  "primary_cluster_id": "{primary_cluster_id}",
  "standby_cluster_id": "{standby_cluster_id}"
}'
~~~

Replace:

- `{api_secret_key}` with your API secret key.
- `{primary_cluster_id}` with the cluster ID returned after creating the primary cluster.
- `{standby_cluster_id}` with the cluster ID returned after creating the standby cluster.

You can find the cluster IDs in the cluster creation output, or in the URL of the single cluster overview page: `https://cockroachlabs.cloud/cluster/{your_cluster_id}/overview`. The ID will resemble `ad1e8630-729a-40f3-87e4-9f72eb3347a0`.

{{site.data.alerts.callout_info}}
Once you have started PCR, the standby cluster cannot accept writes and reads, therefore the [Cloud Console]({% link cockroachcloud/cluster-overview-page.md %}) and SQL shell will be unavailable prior to [failover](#fail-over-to-the-standby-cluster).
{{site.data.alerts.end}}

You will receive a response similar to:

~~~ json
{
  "id": "c3d35c84-a4ea-41b3-8452-553c5ded3b85",
  "status": "STARTING",
  "primary_cluster_id": "3fabc29e-5ced-48d9-b31e-000000000000",
  "standby_cluster_id": "f9b1d580-9be3-47f8-ac28-000000000000",
  "created_at": "2025-05-01T18:57:50.038137Z"
}
~~~

- `"id"`: The PCR stream's [job ID]({% link {{ site.current_cloud_version }}/show-jobs.md %}).
- `"status"`: The status of the PCR stream. For descriptions, refer to [Status](#status).
- `"primary_cluster_id"`, `"standby_cluster_id"`: The cluster IDs of the primary and standby clusters.
- `"created_at"`: The [time]({% link {{ site.current_cloud_version }}/timestamp.md %}) at which the PCR stream was created.

To start PCR between clusters, CockroachDB {{ site.data.products.cloud }} sets up [VPC peering]({% link cockroachcloud/network-authorization.md %}#vpc-peering) between clusters and validates the connectivity. As a result, it may take around 5 minutes to initialize the PCR job during which the status will be `STARTING`.

### Step 3. Monitor the PCR stream

For monitoring the current status of the PCR stream, send a `GET` [request](https://www.cockroachlabs.com/docs/api/cloud/v1.html#get-/api/v1/physical-replication-streams/-id-) to the `/v1/physical-replication-streams` endpoint along with the ID of the PCR stream:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET "https://cockroachlabs.cloud/api/v1/physical-replication-streams/{job_id}" \
--header "Authorization: Bearer {api_secret_key}" 
~~~

Replace:

- `{api_secret_key}` with your API secret key.
- `{job_id}` with the PCR job's ID. You can find this in the response from when you created the PCR stream.

This will return a response similar to:

~~~json
{
  "id": "c3d35c84-a4ea-41b3-8452-553c5ded3b85",
  "status": "REPLICATING",
  "primary_cluster_id": "3fabc29e-5ced-48d9-b31e-000000000000",
  "standby_cluster_id": "f9b1d580-9be3-47f8-ac28-000000000000",
  "created_at": "2025-05-01T18:57:50.038137Z",
  "retained_time": "2025-05-01T19:02:36.462825Z",
  "replicated_time": "2025-05-01T19:05:25Z",
  "replication_lag_seconds": 9
}
~~~

- `"id"`: The ID of the PCR stream.
- `"status"`: The status of the PCR stream. For descriptions, refer to [Status](#status).
- `"primary_cluster_id"`, `"standby_cluster_id"`: The cluster IDs of the primary and standby clusters.
- `"created_at"`: The time at which the PCR stream was created.
- `"retained_time"`: The timestamp indicating the lower bound that the PCR stream can failover to. The tracked replicated time and the advancing [protected timestamp]({% link {{ site.current_cloud_version }}/architecture/storage-layer.md %}#protected-timestamps) allows PCR to also track [_retained time_](#technical-reference).
- `"replicated_time"`: The latest time at which the standby cluster has consistent data. This field will be present when the PCR stream is in the `REPLICATING` [state](#status).
- `"replication_lag_seconds"`: The [_replication lag_](#technical-reference) in seconds. This field will be present when the PCR stream is in the `REPLICATING` [state](#status).

You can also list PCR streams and query using different parameters. Refer to the [CockroachDB Cloud API Reference](https://www.cockroachlabs.com/docs/api/cloud/v1.html#get-/api/v1/physical-replication-streams) for more details.

#### Status

Status | Description
-------+------------
`STARTING` | Setting up [VPC peering]({% link cockroachcloud/network-authorization.md %}#vpc-peering) between clusters and validating the connectivity.
`REPLICATING` | Completing an initial scan and then continuing ongoing replication between the primary and standby clusters.
`FAILING_OVER` | Initiating the [failover](#fail-over-to-the-standby-cluster) from the primary to the standby cluster.
`COMPLETED` | The failover is complete and the standby cluster is now independent from the primary cluster.

#### Metrics

For continual monitoring of PCR, track the following metrics with [Prometheus]({% link cockroachcloud/export-metrics.md %}): 

- `physical_replication.logical_bytes`: The logical bytes (the sum of all keys and values) ingested by all PCR streams.
- `physical_replication.sst_bytes`: The SST bytes (compressed) sent to the [KV layer]({% link {{ site.current_cloud_version }}/architecture/storage-layer.md %}) by all PCR streams.
- `physical_replication.replicated_time_seconds`: The replicated time of the PCR stream in seconds since the Unix epoch.

### Fail over to the standby cluster

Failing over from the primary cluster to the standby cluster will stop the PCR stream, reset the standby cluster to a point in time where all ingested data is consistent, and mark the standby as ready to accept application traffic. You can schedule the failover to:

- The latest consistent time.
- A time in the past within the [`retained_time`](#technical-reference).
- A time up to 1 hour in the future.

#### Fail over to the latest consistent time

To fail over to the latest consistent time, you only need to include `"status": "FAILING_OVER"` in your `PATCH` [request](https://www.cockroachlabs.com/docs/api/cloud/v1.html#patch-/api/v1/physical-replication-streams/-id-) with the PCR stream ID:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request PATCH --url https://cockroachlabs.cloud/api/v1/physical-replication-streams/{job_id} \
--header "Authorization: Bearer {api_secret_key}" \
--json '{
  "status": "FAILING_OVER"
}'
~~~
~~~json
{
  "id": "c3d35c84-a4ea-41b3-8452-553c5ded3b85",
  "status": "FAILING_OVER",
  "primary_cluster_id": "3fabc29e-5ced-48d9-b31e-000000000000",
  "standby_cluster_id": "f9b1d580-9be3-47f8-ac28-000000000000",
  "created_at": "2025-05-01T18:57:50.038137Z"
}
~~~

#### Fail over to a specific time

To specify a timestamp, send a `PATCH` [request](https://www.cockroachlabs.com/docs/api/cloud/v1.html#patch-/api/v1/physical-replication-streams/-id-) to the `/v1/physical-replication-streams` endpoint along with the primary cluster, standby cluster, or the ID of the PCR stream. Include the `failover_at` field with your required timestamp:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request PATCH "https://cockroachlabs.cloud/api/v1/physical-replication-streams/{job_id}" \
--header "Authorization: Bearer {api_secret_key}" \
--json '{
  "status": "STARTING", "failover_at": "2025-05-01T19:39:39.731939Z"
}'
~~~
~~~json
{
  "id": "30cb4c91-9a46-4b62-865f-d0a035278ef8",
  "status": "FAILING_OVER",
  "primary_cluster_id": "3fabc29e-5ced-48d9-b31e-000000000000",
  "standby_cluster_id": "f9b1d580-9be3-47f8-ac28-000000000000",
  "created_at": "2025-05-01T19:39:31.306821Z",
  "failover_at": "2025-05-01T19:39:39.731939Z"
}
~~~

- `failover_at`: The requested timestamp for failover. You can use `"status":"FAILING_OVER"` to initiate the failover and omit `failover_at`, the failover time will default to the latest consistent replicated time.

After the failover is complete, both clusters can receive traffic and operate as separate clusters. It is necessary to redirect application traffic manually.

Run a `GET` [request](https://www.cockroachlabs.com/docs/api/cloud/v1.html#get-/api/v1/physical-replication-streams/-id-) to check when the failover is complete:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET "https://cockroachlabs.cloud/api/v1/physical-replication-streams/{job_id}" \
--header "Authorization: Bearer {api_secret_key}" 
~~~
~~~json
{
  "id": "c3d35c84-a4ea-41b3-8452-553c5ded3b85",
  "status": "COMPLETED",
  "primary_cluster_id": "3fabc29e-5ced-48d9-b31e-000000000000",
  "standby_cluster_id": "f9b1d580-9be3-47f8-ac28-000000000000",
  "created_at": "2025-05-01T18:57:50.038137Z",
  "activated_at": "2025-05-01T19:28:10Z"
}
~~~

- `activated_at`: The CockroachDB system time at which failover is finalized, which could be different from the time that failover was requested. This field will return a response when the PCR stream is in [`COMPLETED` status](#status).

{{site.data.alerts.callout_info}}
PCR replicates on the cluster level, which means that the [job]({% link {{ site.current_cloud_version }}/show-jobs.md %}) also replicates all system tables. Users that need to access the standby cluster after failover should use the user roles for the primary cluster, because the standby cluster is a copy of the primary cluster. PCR overwrites all previous system tables on the standby cluster.
{{site.data.alerts.end}}

### Fail back to the primary cluster

To fail back from the standby to the primary cluster, start another PCR stream with the standby cluster as the `primary_cluster_id` and the original primary cluster as the `standby_cluster_id`.

## Technical reference

The replication happens at the byte level, which means that the job is unaware of databases, tables, row boundaries, and so on. However, when a [failover](#fail-over-to-the-standby-cluster) to the standby cluster is initiated, the PCR job ensures that the cluster is in a transactionally consistent state as of a certain point in time. Beyond the application data, the job will also replicate users, privileges, and schema changes.

At startup, the PCR job will set up VPC peering between the primary and standby {{ site.data.products.advanced }} clusters and validate the connectivity.

During the job, [rangefeeds]({% link {{ site.current_cloud_version }}/create-and-configure-changefeeds.md %}#enable-rangefeeds) are periodically emitting _resolved timestamps_, which is the time where the ingested data is known to be consistent. Resolved timestamps provide a guarantee that there are no new writes from before that timestamp. This allows the [protected timestamp]({% link {{ site.current_cloud_version }}/architecture/storage-layer.md %}#protected-timestamps) to move forward as the replicated timestamp advances, which permits the [garbage collection]({% link {{ site.current_cloud_version }}/architecture/storage-layer.md %}#garbage-collection) to continue as the PCR stream on the standby cluster advances.

{{site.data.alerts.callout_info}}
If the primary cluster does not receive replicated time information from the standby after 24 hours, it cancels the replication job. This ensures that an inactive replication job will not prevent garbage collection.
{{site.data.alerts.end}}

The tracked replicated time and the advancing protected timestamp provide the PCR job with enough information to track _retained time_, which is a timestamp in the past indicating the lower bound that the PCR stream could fail over to. Therefore, the _failover window_ for a PCR stream falls between the retained time and the replicated time.

<img src="{{ 'images/v25.1/failover.svg' | relative_url }}" alt="Timeline showing how the failover window is between the retained time and replicated time." style="border:0px solid #eee;width:100%" />

_Replication lag_ is the time between the most up-to-date replicated time and the actual time. While the PCR stream keeps as current as possible to the actual time, this replication lag window is where there is potential for data loss.

For the [failover process](#fail-over-to-the-standby-cluster), the standby cluster waits until it has reached the specified failover time, which can be in the past (up to the retained time), the latest consistent timestamp, or in the future (up to 1 hour). Once that timestamp has been reached, the PCR stream stops and any data in the standby cluster that is **above** the failover time is removed. Depending on how much data the standby needs to revert, this can affect the duration of [RTO (recovery time objective)]({% link {{ site.current_cloud_version }}/disaster-recovery-overview.md %}).

After reverting any necessary data, the standby cluster is promoted as available to serve traffic.

## See also

- [Physical Cluster Replication Overview]({% link {{ site.current_cloud_version }}/physical-cluster-replication-overview.md %})
- [CockroachDB {{ site.data.products.cloud }} API reference](https://www.cockroachlabs.com/docs/api/cloud/v1)
- [Disaster Recovery Overview]({% link {{ site.current_cloud_version }}/disaster-recovery-overview.md %})
