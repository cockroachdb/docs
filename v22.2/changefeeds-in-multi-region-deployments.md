---
title: Changefeeds in Multi-Region Deployments
summary: Understand limitations and usage of changefeeds in multi-region deployments.
toc: true
docs_area: stream_data
---

 Changefeeds are supported on [regional by row tables](multiregion-overview.html#regional-by-row-tables). When working with changefeeds on regional by row tables, it is necessary to consider the following:

- Setting a table's locality to [`REGIONAL BY ROW`](set-locality.html#regional-by-row) is equivalent to a [schema change](online-schema-changes.html) as the [`crdb_region` column](set-locality.html#crdb_region) becomes a hidden column for each of the rows in the table and is part of the [primary key](primary-key.html). Therefore, when existing tables targeted by changefeeds are made regional by row, it will trigger a backfill of the table through the changefeed. (See [Schema changes with a column backfill](changefeed-messages.html#schema-changes-with-column-backfill) for more details on the effects of schema changes on changefeeds.)

{{site.data.alerts.callout_info}}
If the [`schema_change_policy`](create-changefeed.html#options) changefeed option is configured to `stop`, the backfill will cause the changefeed to fail.
{{site.data.alerts.end}}

- Setting a table to `REGIONAL BY ROW` will have an impact on the changefeed's output as a result of the schema change. The backfill and future updated or inserted rows will emit output that includes the newly added `crdb_region` column as part of the schema. Therefore, it is necessary to ensure that programs consuming the changefeed can manage the new format of the primary keys.

- [Changing a row's region](set-locality.html#update-a-rows-home-region) will appear as an insert and delete in the emitted changefeed output. For example, in the following output in which the region has been updated to `us-east1`, the insert messages are emitted followed by the [delete messages](changefeed-messages.html#delete-messages):

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

See the changefeed [responses](changefeed-messages.html#responses) section for more general information on the messages emitted from a changefeed.

## See also

- [Changefeed Messages](changefeed-messages.html)
- [`SET LOCALITY`](set-locality.html)
- [Multi-Region Overview](multiregion-overview.html)
- [Primary Key Constraint](primary-key.html)
