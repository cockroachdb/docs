---
title: Change Data Capture Transformations
summary: Filter the changefeed data that emits to the changefeed sink.
toc: true
docs_area: stream
key: cdc-queries.html
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

{% include_cached new-in.html version="v22.2" %} Change data capture transformations allow you to define the change data emitted to your sink when you create a changefeed. The expression [syntax](#syntax) provides a way to select columns and apply filters to further restrict or transform the data in your [changefeed messages](changefeed-messages.html).

You can use CDC transformations to do the following:

- Filter out specific rows and columns from changefeed messages to decrease the load on your downstream sink and support outbox workloads.
- Modify data before it emits to reduce the time and operational burden of filtering or transforming data downstream.
- Stabilize or customize the schema of your changefeed messages for increased compatibility with external systems.

You can use any CockroachDB-supported SQL expression syntax that is not listed in [limitations](#limitations) to build a changefeed query.

See the [Examples](#examples) section for further use cases.

{{site.data.alerts.callout_info}}
Change data capture transformations have been updated in v23.1. While there is general backward compatibility, the updated CDC queries may produce different message output. If you are using CDC transformations in v22.2 and upgrade, we recommend closely [monitoring](monitor-and-debug-changefeeds.html) any running changefeeds during the upgrade. Or, you can [stop](cancel-job.html) and recreate the changefeed after the upgrade is finalized.

For details on the updates, see the v23.1 [Change Data Capture Queries](../v23.1/cdc-queries.html) page.
{{site.data.alerts.end}}

## Syntax

There are two possible components to CDC transformations:

- _Projections_ select the columns that you want to emit data from. 
- _Predicates_ restrict the resulting column change data based on the filters you apply.

~~~ sql
CREATE CHANGEFEED [INTO sink] [WITH options] AS SELECT projection FROM table [WHERE predicate];
~~~

Parameter        | Description
-----------------+---------------
`sink`             | Specify the sink URL to emit change data to. See [Changefeed Sinks](changefeed-sinks.html) for a list of supported sinks. It is also possible to run a changefeed without a sink `CREATE CHANGEFEED WITH...`, which will send changes to the active SQL session.
`options`          | Set options on the changefeed. See the [Options](create-changefeed.html#options) table for a full list.
`projection`       | Select the columns from which to emit data.
`table`            | Define the table to which the columns belong.
`predicate`        | Apply optional filters with a `WHERE` clause.

For a SQL diagram of the CDC transformation syntax, see the [`CREATE CHANGEFEED`](create-changefeed.html#synopsis) page.

## Limitations

{% include {{ page.version.version }}/known-limitations/cdc-transformations.md %}

## CDC transformation function support

You can use the following functions in CDC transformation queries:

- Functions marked as "Immutable" on the [Functions and Operators page](functions-and-operators.html).
- The following changefeed functions are available to use in CDC transformations in v22.2:

    Function                  | Description
    --------------------------+----------------------
    `cdc_is_delete() `        | Returns `true` if the event is a deletion event.
    `cdc_prev()`              | Returns a JSON representation of a row's previous state. 
    `cdc_updated_timestamp()` | Returns the event's update timestamp. This is typically the MVCC timestamp, but can differ, such as when the table is undergoing [schema changes](online-schema-changes.html).

    {{site.data.alerts.callout_info}}
    CDC transformations using the deprecated functions, listed in this table, will continue to run successfully after upgrading to v23.1. However, we recommend closely [monitoring](monitor-and-debug-changefeeds.html) any running changefeeds during an upgrade to v23.1 because this may result in different message output. 
    {{site.data.alerts.end}}

- The following "Stable" functions:
  - `jsonb_build_array()`
  - `jsonb_build_object()`
  - `to_json()`
  - `to_jsonb()`
  - `row_to_json()`
  - `overlaps()`
  - `pg_collation_for()`
  - `pg_typeof()`
  - `quote_literal()`
  - `quote_nullable()`

### Unsupported functions

You can **not** use the following functions with CDC transformations:

- Functions marked as "Volatile" on the [Functions and Operators page](functions-and-operators.html).
- Functions listed in the [Limitations](#limitations) section on this page.
- Functions marked as "Stable" on the [Functions and Operators page](functions-and-operators.html), **except** for those listed previously.

## Examples

CDC transformations allow you to customize your changefeed for particular scenarios. This section outlines several possible use cases for CDC transformations. 

See [`CREATE CHANGEFEED`](create-changefeed.html) for examples on using the foundational syntax to create a changefeed. For information on sinks, see the [Changefeed Sinks](changefeed-sinks.html) page.

### Filter columns

To only emit data from specific columns in a table, you can use `SELECT {columns}` to define the table's columns.

As an example, using the `users` table from the [`movr` database](movr.html#the-movr-database), you can create a changefeed that will emit messages including only the `name` and `city` column data:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED INTO "scheme://sink-URI" WITH updated, schema_change_policy = 'stop' AS SELECT name, city FROM users;
~~~
~~~
{"record":{"users":{"name":{"string":"Steven Lara"},"city":{"string":"los angeles"}}}}
{"record":{"users":{"city":{"string":"los angeles"},"name":{"string":"Carl Russell"}}}}
{"record":{"users":{"name":{"string":"Brett Porter"},"city":{"string":"boston"}}}}
{"record":{"users":{"name":{"string":"Vanessa Rivera"},"city":{"string":"los angeles"}}}}
{"record":{"users":{"name":{"string":"Tony Henderson"},"city":{"string":"los angeles"}}}}
{"record":{"users":{"city":{"string":"boston"},"name":{"string":"Emily Hill"}}}}
{"record":{"users":{"name":{"string":"Dustin Kramer"},"city":{"string":"boston"}}}}
{"record":{"users":{"name":{"string":"Dawn Roman"},"city":{"string":"boston"}}}}
~~~

### Filter delete messages

To remove the [delete messages](changefeed-messages.html#delete-messages) from a changefeed stream, use the [`cdc_is_delete()`](#cdc-transformation-function-support) function:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED INTO sink WITH schema_change_policy = 'stop' AS SELECT * FROM table WHERE NOT cdc_is_delete();
~~~

Filtering delete messages from your changefeed is helpful for certain outbox table use cases. See [Transformations and the outbox pattern](#transformations-and-the-outbox-pattern) for further detail.

### Geofilter a changefeed

When you are working with a [`REGIONAL BY ROW` table](alter-table.html#regional-by-row), you can filter the changefeed on the `crdb_region` column to create a region-specific changefeed:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED INTO sink WITH schema_change_policy = 'stop' AS SELECT * FROM table WHERE crdb_region = 'europe-west2';
~~~

For more detail on targeting `REGIONAL BY ROW` tables with changefeeds, see [Changefeeds in Multi-Region Deployments](changefeeds-in-multi-region-deployments.html).

### Stabilize the changefeed message schema

As changefeed messages emit from the database, message formats can vary as tables experience [schema changes](changefeed-messages.html#schema-changes). You can select columns with [typecasting](data-types.html#data-type-conversions-and-casts) to prevent message fields from changing during a changefeed's lifecycle: 

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED INTO sink WITH schema_change_policy = 'stop' AS SELECT id::int, name::varchar, admin::bool FROM users;
~~~

### Shard changefeed messages

CDC transformations allow you to emit changefeed messages from the same table to different endpoints. As a result, you can use transformations to load balance messages across changefeed sinks without the need for an intermediate system.

In this example, the transformation uses the `ride_id` column's [`UUID`](uuid.html) to shard the messages. The [`left()`](functions-and-operators.html#string-and-byte-functions) function filters the first character from the `ride_id` column and finds the specified initial characters. The example shards successfully by running a changefeed on the same table and dividing the 16 possible beginning `UUID` characters through to `f`. 

Therefore, the first changefeed created:

{% include_cached copy-clipboard.html %}
~~~sql 
CREATE CHANGEFEED INTO 'scheme://sink-URI-1' 
WITH schema_change_policy='stop' 
AS SELECT * FROM movr.vehicle_location_histories 
WHERE left(ride_id::string, 1) IN ('0','1','2','3');
~~~

The final changefeed created:

{% include_cached copy-clipboard.html %}
~~~sql 
CREATE CHANGEFEED INTO 'scheme://sink-URI-4' 
WITH schema_change_policy='stop' 
AS SELECT * FROM movr.vehicle_location_histories 
WHERE left(ride_id::string, 1) IN ('c','d','e','f');
~~~

### View recent changes to a row

You can use CDC transformations as a tool for debugging or investigating issues from the SQL shell. 

For example, you may need to identify what recently changed in a specific row. You can use the [`cursor`](create-changefeed.html#cursor-option) option with the desired start time and a `WHERE` clause describing the row in question. Instead of sending to a sink, a "sinkless" changefeed will allow you to view the results in the SQL shell. 

1. Find the start time. Use the [`cluster_logical_timestamp()`](functions-and-operators.html#system-info-functions) function to calculate the logical time. This will return the logical timestamp for an hour earlier than the statement run time:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    SELECT cluster_logical_timestamp() - 3600000000000;
    ~~~

    ~~~
                 ?column?
    ----------------------------------
      1663938662092036106.0000000000
    (1 row)
    ~~~

1. Run the changefeed without a sink and pass the start time to the `cursor` option:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    CREATE CHANGEFEED WITH cursor='1663938662092036106.0000000000', schema_change_policy='stop' AS SELECT * FROM vehicle_location_histories  WHERE ride_id::string LIKE 'f2616bb3%';
    ~~~

1. To find changes within a time period, use `cursor` with the [`end_time`](create-changefeed.html#end-time) option:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    CREATE CHANGEFEED WITH cursor='1663938662092036106.0000000000', end_time='1663942405825479261.0000000000', schema_change_policy='stop' AS SELECT * FROM vehicle_location_histories  WHERE ride_id::string LIKE 'f2616bb3%';
    ~~~

### Recover lost messages

In the event that an incident downstream has affected some rows, you may need a way to recover or evaluate the specific rows. Create a new changefeed that only watches for the affected row(s). Here, the example uses the row's primary key:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED INTO 'scheme://sink-URI' WITH schema_change_policy='stop' AS SELECT * FROM movr.vehicle_location_histories WHERE ride_id = 'ff9df988-ebda-4066-b0fc-ecbc45f8d12b';
~~~

The changefeed will return messages for the specified rows:

~~~
{"key":"[\"washington dc\", \"ff9df988-ebda-4066-b0fc-ecbc45f8d12b\", \"2022-09-22T20:10:05.405737\"]","table":"vehicle_location_histories","value":"{\"city\": \"washington dc\", \"lat\": 128, \"long\": 11, \"ride_id\": \"ff9df988-ebda-4066-b0fc-ecbc45f8d12b\", \"timestamp\": \"2022-09-22T20:10:05.405737\"}"}
{"key":"[\"washington dc\", \"ff9df988-ebda-4066-b0fc-ecbc45f8d12b\", \"2022-09-22T20:10:05.478217\"]","table":"vehicle_location_histories","value":"{\"city\": \"washington dc\", \"lat\": 45, \"long\": -66, \"ride_id\": \"ff9df988-ebda-4066-b0fc-ecbc45f8d12b\", \"timestamp\": \"2022-09-22T20:10:05.478217\"}"}
{"key":"[\"washington dc\", \"ff9df988-ebda-4066-b0fc-ecbc45f8d12b\", \"2022-09-22T20:10:05.487198\"]","table":"vehicle_location_histories","value":"{\"city\": \"washington dc\", \"lat\": -34, \"long\": -49, \"ride_id\": \"ff9df988-ebda-4066-b0fc-ecbc45f8d12b\", \"timestamp\": \"2022-09-22T20:10:05.487198\"}"}
{"key":"[\"washington dc\", \"ff9df988-ebda-4066-b0fc-ecbc45f8d12b\", \"2022-09-22T20:10:05.535764\"]","table":"vehicle_location_histories","value":"{\"city\": \"washington dc\", \"lat\": 1E+1, \"long\": -27, \"ride_id\": \"ff9df988-ebda-4066-b0fc-ecbc45f8d12b\", \"timestamp\": \"2022-09-22T20:10:05.535764\"}"}
{"key":"[\"washington dc\", \"ff9df988-ebda-4066-b0fc-ecbc45f8d12b\", \"2022-09-22T20:10:05.575483\"]","table":"vehicle_location_histories","value":"{\"city\": \"washington dc\", \"lat\": 83, \"long\": 84, \"ride_id\": \"ff9df988-ebda-4066-b0fc-ecbc45f8d12b\", \"timestamp\": \"2022-09-22T20:10:05.575483\"}"}
~~~

The output will only include the row's history that has been changed within the [garbage collection window](architecture/storage-layer.html#garbage-collection). If the change occurred outside of the garbage collection window, it will not be returned as part of this output. See [Garbage collection and changefeeds](changefeed-messages.html#garbage-collection-and-changefeeds) for more detail on how the garbage collection window interacts with changefeeds.

### Customize changefeed messages

You can adapt your [changefeed messages](changefeed-messages.html) by filtering the columns, but it is also possible to build message fields with SQL expressions. 

In this example, the transformation adds a `summary` field to the changefeed message:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED WITH schema_change_policy = 'stop' AS SELECT *, owner_id::string || ' takes passengers by ' || type || '. They are currently ' || status AS summary FROM vehicles;
~~~
~~~
{"key":"[\"seattle\", \"e88af90e-1212-4d10-ad13-5b30cfe3bd16\"]","table":"vehicles","value":"{\"city\": \"seattle\", \"creation_time\": \"2019-01-02T03:04:05\", \"current_location\": \"49128 Gerald Mall\", \"ext\": {\"color\": \"yellow\"}, \"id\": \"e88af90e-1212-4d10-ad13-5b30cfe3bd16\", \"owner_id\": \"28df0fab-cde9-4bc1-a11e-769f4b915171\", \"status\": \"in_use\", \"summary\": \"28df0fab-cde9-4bc1-a11e-769f4b915171 takes passengers by skateboard. They are currently in_use\", \"type\": \"skateboard\"}"}
{"key":"[\"seattle\", \"f00edb5f-d951-4dfd-8c1c-d0b34ebc38be\"]","table":"vehicles","value":"{\"city\": \"seattle\", \"creation_time\": \"2019-01-02T03:04:05\", \"current_location\": \"2521 Jaclyn Place Apt. 68\", \"ext\": {\"color\": \"yellow\"}, \"id\": \"f00edb5f-d951-4dfd-8c1c-d0b34ebc38be\", \"owner_id\": \"d4b05249-afed-4f89-b7a9-d5533f687a13\", \"status\": \"available\", \"summary\": \"d4b05249-afed-4f89-b7a9-d5533f687a13 takes passengers by scooter. They are currently available\", \"type\": \"scooter\"}"}
~~~

### Transformations and the outbox pattern

The transactional outbox pattern provides a way to publish events reliably through an outbox table before sending to the messaging system. CDC transformations can help to streamline this process by eliminating the need for an outbox table in the database. If you also have a requirement to transform the data or remove delete messages from the changefeed payload, transformations can achieve this. 

For example, you have three tables: `users`, `accounts`, and `dogs`. You need to send all changes to any of those tables to a single Kafka endpoint using a specific structure. Namely, a JSON object like the following:

~~~json
{
  "event_timestamp": 1663698160437524000,
  "table": "dogs",
  "type": "create",
  "data": "{ \"good_boy\": true }"
}
~~~

To achieve this, you create changefeeds directly on the tables and transform the result into the required format. 

For the previous JSON example:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED INTO 'kafka://endpoint?topic_name=events' WITH schema_change_policy='stop' 
AS SELECT cdc_updated_timestamp()::int AS event_timestamp,
'dogs' AS table,
IF (cdc_is_delete(),'delete','create') AS type,
jsonb_build_object('good_boy',good_boy) AS data
FROM dogs;
~~~

This statement does the following:

- Selects the `event_timestamp` of the event and casts to an `INT`.
- Sets the `type` of change as `delete` or `create` using the [`cdc_is_delete()` function](#cdc-transformation-function-support).
- Uses [`jsonb_build_object()`](functions-and-operators.html) to construct the desired data field.

For the remaining tables, you use the same statement structure to create changefeeds that will send messages to the Kafka endpoint: 

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED INTO 'kafka://endpoint?topic_name=events' WITH schema_change_policy='stop' 
AS SELECT cdc_updated_timestamp()::int AS event_timestamp,
'users' AS table,
IF (cdc_is_delete(),'delete','create') AS type,
jsonb_build_object('email', email, 'admin', admin) AS data
FROM users;
~~~

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED INTO 'kafka://endpoint?topic_name=events' WITH schema_change_policy='stop'  
AS SELECT cdc_updated_timestamp()::int AS event_timestamp,
'accounts' AS table,
IF (cdc_is_delete(),'delete','create') AS type,
jsonb_build_object('owner', owner) AS data
FROM accounts;
~~~

For a different usage of the outbox pattern, you may still want an events table to track and manage the lifecycle of an event. You can also use CDC transformations in this case to filter the event management metadata out of a message. 

For example, when you delete a message in your outbox table after processing it (or with [row-level TTL](row-level-ttl.html)). You can filter the [delete messages](#filter-delete-messages) from your changefeed:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED INTO 'kafka://endpoint?topic_name=events' WITH schema_change_policy='stop' AS SELECT * FROM outbox WHERE NOT cdc_is_delete();
~~~

Similarly, if you have a status column in your outbox table tracking its lifecycle, you can filter out updates as well so that only the initial insert sends a message:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED INTO 'scheme://sink-URI' WITH schema_change_policy='stop' AS SELECT status FROM outbox WHERE cdc_prev()->'status' IS NULL;
~~~

Since all non-primary key columns will be `NULL` in the [`cdc_prev()`](#cdc-transformation-function-support) output for an insert message, insert messages will be sent. Updates will not send, as long as the status was not previously `NULL`.

## See also

- [`CREATE CHANGEFEED`](create-changefeed.html)
- [Changefeed Messages](changefeed-messages.html)
- [Changefeed Sinks](changefeed-sinks.html)

