---
title: Changefeeds in Multi-Region Deployments
summary: Understand limitations and usage of changefeeds in multi-region deployments.
toc: true
docs_area: stream_data
---

This page describes features that you can use for changefeeds running on multi-region deployments.

- [Run a changefeed job by locality](#run-a-changefeed-job-by-locality).
- [Run changefeeds on regional by row tables](#run-changefeeds-on-regional-by-row-tables).

## Run a changefeed job by locality

Use the `execution_locality` option to set locality filter requirements that a node must meet to take part in executing a [changefeed]({% link {{ page.version.version }}/create-changefeed.md %}) job. This will pin the [coordination of the changefeed job]({% link {{ page.version.version }}/how-does-a-changefeed-work.md %}) and the nodes that process the [changefeed messages]({% link {{ page.version.version }}/changefeed-messages.md %}) to the defined locality.

Defining an execution locality for a changefeed job, could be useful in the following cases:

- Your [changefeed sink]({% link {{ page.version.version }}/changefeed-sinks.md %}) is only available in one region. There is no network connectivity between regions and you need to send all changefeed messages through the node(s) in the sink's region.
- Your cluster runs on a [hybrid topology]({% link {{ page.version.version }}/topology-patterns.md %}#multi-region) and you need to send changefeed messages within the same environment.
- Your cluster is [multi-region]({% link {{ page.version.version }}/multiregion-overview.md %}) and you need the nodes that are physically closest to the sink to emit changefeed messages. This can avoid cross-regional traffic to reduce expense.
- Your cluster is running through VPC peering connections and you need all the data sent through a particular locality.

### Syntax

To specify the locality requirements for the coordinating node, run `execution_locality` with key-value pairs that represent the [locality designations]({% link {{ page.version.version }}/cockroach-start.md %}#locality) assigned to the cluster at startup.

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED FOR TABLE movr.vehicles INTO 'external://cdc' WITH execution_locality='region=us-east-2,cloud=aws';
~~~

When you run a changefeed with `execution_locality`, consider the following:

- The changefeed job will fail if no nodes match the locality filter.
- [Selection of the coordinating node](#job-coordination-using-the-execution-locality-option) that matches the locality filter may noticeably increase the startup latency of the changefeed job.
- Even though a changefeed job has been pinned to a locality, it does not guarantee the job will **not** read from another locality if there are no replicas in the defined locality.

{{site.data.alerts.callout_success}}
To define and filter the change data included in changefeed messages emitted to the sink, see [Change Data Capture Queries]({% link {{ page.version.version }}/cdc-queries.md %}).
{{site.data.alerts.end}}

### Job coordination using the execution locality option

When you start or [resume]({% link {{ page.version.version }}/resume-job.md %}) a changefeed with `execution_locality`, it is necessary to determine the coordinating node for the job. If a node that does not match the locality filter is the first node to claim the job, it will find a node that does match the filter and transfer the execution to it. This can result in a short delay in starting or resuming a changefeed job that has execution locality requirements. When there is no node matching the specified locality, CockroachDB will return an error.

Once the coordinating node is determined, nodes that match the locality requirements will take part in emitting changefeed messages to the sink. The following will happen in different cases:

- If a [replica]({% link {{ page.version.version }}/architecture/reads-and-writes-overview.md %}#architecture-replica) for the change data matches the filter, it will emit the changefeed messages.
- If a replica does not match the locality filter, a node will be selected matching the locality filter with a preference for nodes with localities that are more similar to a replica.

When a node matching the locality filter takes part in the changefeed job, that node will read from the closest [replica]({% link {{ page.version.version }}/architecture/reads-and-writes-overview.md %}#architecture-replica). If the node is a replica, it can read from itself. In the scenario where no replicas are available in the region of the assigned node, it may then read from a replica in a different region. As a result, you may want to consider [placing replicas]({% link {{ page.version.version }}/configure-replication-zones.md %}), including potentially [non-voting replicas]({% link {{ page.version.version }}/architecture/replication-layer.md %}#non-voting-replicas) that will have less impact on read latency, in the locality or region that you plan on pinning for changefeed job execution.

For an overview of how a changefeed job works, refer to the [How does a changefeed work?]({% link {{ page.version.version }}/how-does-a-changefeed-work.md %}) page.

## Run changefeeds on regional by row tables

Changefeeds are supported on [regional by row tables]({% link {{ page.version.version }}/table-localities.md %}#regional-by-row-tables). When working with changefeeds on regional by row tables, it is necessary to consider the following:

- Setting a table's locality to [`REGIONAL BY ROW`]({% link {{ page.version.version }}/alter-table.md %}#regional-by-row) is equivalent to a [schema change]({% link {{ page.version.version }}/online-schema-changes.md %}) as the [`crdb_region` column]({% link {{ page.version.version }}/alter-table.md %}#crdb_region) becomes a hidden column for each of the rows in the table and is part of the [primary key]({% link {{ page.version.version }}/primary-key.md %}). Therefore, when existing tables targeted by changefeeds are made regional by row, it will trigger a backfill of the table through the changefeed. (See [Schema changes with a column backfill]({% link {{ page.version.version }}/changefeed-messages.md %}#schema-changes-with-column-backfill) for more details on the effects of schema changes on changefeeds.)

{{site.data.alerts.callout_info}}
If the [`schema_change_policy`]({% link {{ page.version.version }}/create-changefeed.md %}#options) changefeed option is configured to `stop`, the backfill will cause the changefeed to fail.
{{site.data.alerts.end}}

- Setting a table to `REGIONAL BY ROW` will have an impact on the changefeed's output as a result of the schema change. The backfill and future updated or inserted rows will emit output that includes the newly added `crdb_region` column as part of the schema. Therefore, it is necessary to ensure that programs consuming the changefeed can manage the new format of the primary keys.

- [Changing a row's region]({% link {{ page.version.version }}/alter-table.md %}#update-a-rows-home-region) will appear as an insert and delete in the emitted changefeed output. For example, in the following output in which the region has been updated to `us-east1`, the insert messages are emitted followed by the [delete messages]({% link {{ page.version.version }}/changefeed-messages.md %}#delete-messages):

~~~
. . .
{"after": {"city": "washington dc", "crdb_region": "us-east1", "creation_time": "2019-01-02T03:04:05", "current_location": "52372 Katherine Plains", "ext": {"color": "black"}, "id": "54a69217-35ee-4000-8000-0000000001f0", "owner_id": "3dcc63f1-4120-4c00-8000-0000000004b7", "status": "in_use", "type": "scooter"}, "updated": "1632241564629087669.0000000000"}
{"after": {"city": "washington dc", "crdb_region": "us-east1", "creation_time": "2019-01-02T03:04:05", "current_location": "75024 Patrick Bridge", "ext": {"color": "black"}, "id": "54d242e6-bdc8-4400-8000-0000000001f1", "owner_id": "3ab9f559-b3d0-4c00-8000-00000000047b", "status": "in_use", "type": "scooter"}, "updated": "1632241564629087669.0000000000"}
{"after": {"city": "washington dc", "crdb_region": "us-east1", "creation_time": "2019-01-02T03:04:05", "current_location": "45597 Jackson Inlet", "ext": {"brand": "Schwinn", "color": "red"}, "id": "54fdf3b6-45a1-4c00-8000-0000000001f2", "owner_id": "4339c0eb-edfa-4400-8000-000000000521", "status": "in_use", "type": "bike"}, "updated": "1632241564629087669.0000000000"}
{"after": {"city": "washington dc", "crdb_region": "us-east1", "creation_time": "2019-01-02T03:04:05", "current_location": "18336 Katherine Port", "ext": {"color": "yellow"}, "id": "5529a485-cd7b-4000-8000-0000000001f3", "owner_id": "452bd3c3-6113-4000-8000-000000000547", "status": "in_use", "type": "scooter"}, "updated": "1632241564629087669.0000000000"}
{"after": null, "updated": "1632241564629087669.0000000000"}
{"after": null, "updated": "1632241564629087669.0000000000"}
{"after": null, "updated": "1632241564629087669.0000000000"}
{"after": null, "updated": "1632241564629087669.0000000000"}
. . .
~~~

See the changefeed [messages]({% link {{ page.version.version }}/changefeed-messages.md %}) page for more general information on the messages emitted from a changefeed.

## See also

- [Changefeed Messages]({% link {{ page.version.version }}/changefeed-messages.md %})
- [`SET LOCALITY`]({% link {{ page.version.version }}/alter-table.md %}#set-locality)
- [Multi-Region Overview]({% link {{ page.version.version }}/multiregion-overview.md %})
- [Primary Key Constraint]({% link {{ page.version.version }}/primary-key.md %})
