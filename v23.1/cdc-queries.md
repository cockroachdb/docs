---
title: Change Data Capture Queries
summary: Filter the changefeed data that emits to the changefeed sink.
toc: true
docs_area: stream
key: cdc-transformations.html
---

{% include enterprise-feature.md %}

Change data capture queries allow you to define the change data emitted to your sink when you create a changefeed. The expression [syntax](#syntax) provides a way to select columns and apply filters to further restrict or transform the data in your [changefeed messages](changefeed-messages.html).  

You can use CDC queries to do the following:

- Filter out specific rows and columns from changefeed messages to decrease the load on your downstream sink and support outbox workloads.
- Modify data before it emits to reduce the time and operational burden of filtering or transforming data downstream.
- Stabilize or customize the schema of your changefeed messages for increased compatibility with external systems.

You can use any CockroachDB-supported SQL expression syntax that is not listed in [limitations](#limitations) to build a changefeed query.

See the [Examples](#examples) section for further use cases.

## Syntax

There are two possible components to CDC queries:

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

For a SQL diagram of the CDC query syntax, see the [`CREATE CHANGEFEED`](create-changefeed.html#synopsis) page.

{% include_cached new-in.html version="v23.1" %} To emit different properties for a row, specify the following explicitly in CDC queries:

- `cdc_prev`: A tuple-typed column that gives changefeeds access to the previous state of a row. See the [Emit the previous state of a row](#emit-the-previous-state-of-a-row) example for more detail.
- CDC queries support [system columns](crdb-internal.html), for example:
  - <a name="crdb-internal-mvcc-timestamp"></a>`crdb_internal_mvcc_timestamp`: Records the timestamp of each row created in a table. If you do not have a timestamp column in the target table, you can access `crdb_internal_mvcc_timestamp` in a changefeed. See the [Determine the age of a row](#determine-the-age-of-a-row) example.

## Limitations

{% include {{ page.version.version }}/known-limitations/cdc-queries.md %}

## CDC query function support

{% include_cached new-in.html version="v23.1" %} The following table outlines functions that are useful with CDC queries:

Function                  | Description
--------------------------+----------------------
`changefeed_creation_timestamp()` | Returns the decimal MVCC timestamp when the changefeed was created.
`event_op()`              | Returns a string describing the type of event. If a changefeed is running with the [`diff`](create-changefeed.html#diff-opt) option, then this function returns `'insert'`, `'update'`, or `'delete'`. If a changefeed is running without the `diff` option, it is not possible to determine an update from an insert, so `event_op()` returns [`'upsert'`](https://www.cockroachlabs.com/blog/sql-upsert/) or `'delete'`.
`event_schema_timestamp()` | Returns the timestamp of the [schema changes](online-schema-changes.html) event.

You can also use the following functions in CDC queries:

- Functions marked as "Immutable" on the [Functions and Operators page](functions-and-operators.html).
- {% include_cached new-in.html version="v23.1" %} Non-volatile [user-defined functions](user-defined-functions.html). See the [Queries and user-defined functions](#queries-and-user-defined-functions) example.
- Functions that rely on [session data](show-sessions.html). At the time of changefeed creation, information about the current session is saved. When a CDC query includes one of the functions that use session data, the query will evaluate the saved session data. 
- The following "Stable" functions:
  - `age()`
  - `array_to_json()`
  - `array_to_string()`
  - `crdb_internal.cluster_id()`
  - `date_part()`
  - `date_trunc()`
  - `extract()`
  - `format()`
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

You can **not** use the following functions with CDC queries:

- Functions marked as "Volatile" on the [Functions and Operators page](functions-and-operators.html).
- Functions listed in the [Limitations](#limitations) section on this page.
- Functions marked as "Stable" on the [Functions and Operators page](functions-and-operators.html), **except** for those listed previously.

## Examples

CDC queries allow you to customize your changefeed for particular scenarios. This section outlines several possible use cases for CDC queries. 

See [`CREATE CHANGEFEED`](create-changefeed.html) for examples on using the foundational syntax to create a changefeed. For information on sinks, see the [Changefeed Sinks](changefeed-sinks.html) page.

{{site.data.alerts.callout_success}}
To optimize the `SELECT` query you run in your changefeed statement, use the [`EXPLAIN`](explain.html) statement to view a statement plan. 

Note that `EXPLAIN` does not have access to [`cdc_prev`](#emit-the-previous-state-of-a-row), therefore you will receive an error if your `SELECT` query contains `cdc_prev`.
{{site.data.alerts.end}}

### Filter columns

To only emit data from specific columns in a table, you can use `SELECT {columns}` to define the table's columns.

As an example, using the `users` table from the [`movr` database](movr.html#the-movr-database), you can create a changefeed that will emit messages including only the `name` and `city` column data:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED INTO "scheme://sink-URI" WITH updated AS SELECT name, city FROM users;
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

To remove the [delete messages](changefeed-messages.html#delete-messages) from a changefeed stream, use the [`event_op()`](#cdc-query-function-support) function:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED INTO sink AS SELECT * FROM table WHERE NOT event_op() = 'delete';
~~~

Filtering delete messages from your changefeed is helpful for certain outbox table use cases. See [Queries and the outbox pattern](#queries-and-the-outbox-pattern) for further detail.

### Emit the previous state of a row

{% include_cached new-in.html version="v23.1" %} Changefeeds can access the `cdc_prev` hidden column on a table to emit the previous state of a row or column. `cdc_prev` is a tuple-typed column that contains the table's columns. 

To emit the previous state of a row, it is necessary to explicitly call `cdc_prev`:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED INTO 'external://sink' AS SELECT *, cdc_prev FROM movr.rides;
~~~

To emit the previous state of a column, you can specify this as a named field from the `cdc_prev` tuple with the following syntax:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED INTO 'external://sink' AS SELECT *, cdc_prev FROM movr.vehicles WHERE (cdc_prev).status = 'in_use';
~~~

### Geofilter a changefeed

When you are working with a [`REGIONAL BY ROW` table](alter-table.html#regional-by-row), you can filter the changefeed on the `crdb_region` column to create a region-specific changefeed:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED INTO sink AS SELECT * FROM table WHERE crdb_region = 'europe-west2';
~~~

For more detail on targeting `REGIONAL BY ROW` tables with changefeeds, see [Changefeeds in Multi-Region Deployments](changefeeds-in-multi-region-deployments.html).

### Stabilize the changefeed message schema

As changefeed messages emit from the database, message formats can vary as tables experience [schema changes](changefeed-messages.html#schema-changes). You can select columns with [typecasting](data-types.html#data-type-conversions-and-casts) to prevent message fields from changing during a changefeed's lifecycle: 

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED INTO sink AS SELECT id::int, name::varchar, admin::bool FROM users;
~~~

### Shard changefeed messages

CDC queries allow you to emit changefeed messages from the same table to different endpoints. As a result, you can use queries to load balance messages across changefeed sinks without the need for an intermediate system.

In this example, the query uses the `ride_id` column's [`UUID`](uuid.html) to shard the messages. The [`left()`](functions-and-operators.html#string-and-byte-functions) function filters the first character from the `ride_id` column and finds the specified initial characters. The example shards successfully by running a changefeed on the same table and dividing the 16 possible beginning `UUID` characters through to `f`. 

Therefore, the first changefeed created:

{% include_cached copy-clipboard.html %}
~~~sql 
CREATE CHANGEFEED INTO 'scheme://sink-URI-1' 
AS SELECT * FROM movr.vehicle_location_histories 
WHERE left(ride_id::string, 1) IN ('0','1','2','3');
~~~

The final changefeed created:

{% include_cached copy-clipboard.html %}
~~~sql 
CREATE CHANGEFEED INTO 'scheme://sink-URI-4' 
AS SELECT * FROM movr.vehicle_location_histories 
WHERE left(ride_id::string, 1) IN ('c','d','e','f');
~~~

### View recent changes to a row

You can use CDC queries as a tool for debugging or investigating issues from the SQL shell. 

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
    CREATE CHANGEFEED WITH cursor='1663938662092036106.0000000000' 
    AS SELECT * FROM vehicle_location_histories 
    WHERE ride_id::string LIKE 'f2616bb3%';
    ~~~

1. To find changes within a time period, use `cursor` with the [`end_time`](create-changefeed.html#end-time) option:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    CREATE CHANGEFEED WITH cursor='1663938662092036106.0000000000', end_time='1663942405825479261.0000000000' 
    AS SELECT * FROM vehicle_location_histories 
    WHERE ride_id::string LIKE 'f2616bb3%';
    ~~~

### Determine the age of a row

{% include_cached new-in.html version="v23.1" %} You can determine the age of a row by using the `crdb_internal_mvcc_timestamp` system column and `cdc_prev` to [access the row's previous state](#emit-the-previous-state-of-a-row):

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED INTO 'external://sink' 
AS SELECT crdb_internal_mvcc_timestamp - (cdc_prev).crdb_internal_mvcc_timestamp 
AS age 
FROM movr.rides;
~~~
~~~
{"age": 1679504962492204986.0000000000}
{"age": 1679577387885735266.0000000000}
{"age": 1679504962492204986.0000000000}
{"age": 1679578262568913199.0000000000}
{"age": 1679504962492381317.0000000000}
{"age": 1679579853238534524.0000000000}
{"age": 1679578374708255008.0000000000}
{"age": 1679504962492381317.0000000000}
{"age": 1679578344852201733.0000000000}
{"age": 1679578242116550285.0000000000}
~~~

### Recover lost messages

In the event that an incident downstream has affected some rows, you may need a way to recover or evaluate the specific rows. Create a new changefeed that only watches for the affected row(s). Here, the example uses the row's primary key:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED INTO 'scheme://sink-URI' 
AS SELECT * FROM movr.vehicle_location_histories 
WHERE ride_id = 'ff9df988-ebda-4066-b0fc-ecbc45f8d12b';
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

In this example, the query adds a `summary` field to the changefeed message:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED AS SELECT *, owner_id::string || ' takes passengers by ' || type || '. They are currently ' || status AS summary FROM vehicles;
~~~
~~~
{"key":"[\"seattle\", \"e88af90e-1212-4d10-ad13-5b30cfe3bd16\"]","table":"vehicles","value":"{\"city\": \"seattle\", \"creation_time\": \"2019-01-02T03:04:05\", \"current_location\": \"49128 Gerald Mall\", \"ext\": {\"color\": \"yellow\"}, \"id\": \"e88af90e-1212-4d10-ad13-5b30cfe3bd16\", \"owner_id\": \"28df0fab-cde9-4bc1-a11e-769f4b915171\", \"status\": \"in_use\", \"summary\": \"28df0fab-cde9-4bc1-a11e-769f4b915171 takes passengers by skateboard. They are currently in_use\", \"type\": \"skateboard\"}"}
{"key":"[\"seattle\", \"f00edb5f-d951-4dfd-8c1c-d0b34ebc38be\"]","table":"vehicles","value":"{\"city\": \"seattle\", \"creation_time\": \"2019-01-02T03:04:05\", \"current_location\": \"2521 Jaclyn Place Apt. 68\", \"ext\": {\"color\": \"yellow\"}, \"id\": \"f00edb5f-d951-4dfd-8c1c-d0b34ebc38be\", \"owner_id\": \"d4b05249-afed-4f89-b7a9-d5533f687a13\", \"status\": \"available\", \"summary\": \"d4b05249-afed-4f89-b7a9-d5533f687a13 takes passengers by scooter. They are currently available\", \"type\": \"scooter\"}"}
~~~

### Create a scheduled changefeed to export filtered data

{% include {{ page.version.version }}/cdc/schedule-query-example.md %}

### Queries and the outbox pattern

The transactional outbox pattern provides a way to publish events reliably through an outbox table before sending to the messaging system. CDC queries can help to streamline this process by eliminating the need for an outbox table in the database. If you also have a requirement to transform the data or remove delete messages from the changefeed payload, queries can achieve this. 

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
CREATE CHANGEFEED INTO 'kafka://endpoint?topic_name=events' AS SELECT
event_schema_timestamp()::int AS event_timestamp,
'dogs' AS table,
event_op() AS type,
jsonb_build_object('good_boy',good_boy) AS data
FROM dogs;
~~~

This statement does the following:

- Selects the `event_timestamp` of the event and casts to an `INT`.
- Sets the `type` of change using the [`event_op()` function](#cdc-query-function-support). 
- Uses [`jsonb_build_object()`](functions-and-operators.html) to construct the desired data field.

For the remaining tables, you use the same statement structure to create changefeeds that will send messages to the Kafka endpoint: 

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED INTO 'kafka://endpoint?topic_name=events' AS SELECT
event_schema_timestamp()::int AS event_timestamp,
'users' AS table,
event_op() AS type,
jsonb_build_object('email', email, 'admin', admin) AS data
FROM users;
~~~

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED INTO 'kafka://endpoint?topic_name=events' AS SELECT
event_schema_timestamp()::int AS event_timestamp,
'accounts' AS table,
event_op() AS type,
jsonb_build_object('owner', owner) AS data
FROM accounts;
~~~

For a different usage of the outbox pattern, you may still want an events table to track and manage the lifecycle of an event. You can also use CDC queries in this case to filter the event management metadata out of a message. 

For example, when you delete a message in your outbox table after processing it (or with [row-level TTL](row-level-ttl.html)). You can filter the [delete messages](#filter-delete-messages) from your changefeed:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED INTO 'kafka://endpoint?topic_name=events' AS SELECT * FROM outbox WHERE event_op() != 'delete';
~~~

Similarly, if you have a status column in your outbox table tracking its lifecycle, you can filter out updates as well so that only the initial insert sends a message:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED INTO 'scheme://sink-URI' AS SELECT status, cdc_prev FROM outbox WHERE (cdc_prev).status IS NULL;
~~~

Since all non-primary key columns will be `NULL` in the `cdc_prev` output for an insert message, insert messages will be sent. Updates will not send, as long as the status was not previously `NULL`.

### Queries and user-defined functions

{% include_cached new-in.html version="v23.1" %} You can create CDC queries that include [user-defined functions](user-defined-functions.html).

The following [`CREATE FUNCTION`](create-function.html) statement builds the `doubleRevenue()` function at the database level: 

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE FUNCTION doubleRevenue(r int)
RETURNS INT IMMUTABLE LEAKPROOF LANGUAGE SQL AS 
$$ SELECT 2 * r $$;
~~~

You can then use this function within a CDC query tagetting a table in the same database:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED INTO 'external://sink' AS SELECT rider_id, doubleRevenue(rides.revenue::int) FROM rides WHERE revenue < 30;
~~~

## See also

- [`CREATE CHANGEFEED`](create-changefeed.html)
- [Changefeed Messages](changefeed-messages.html)
- [Changefeed Sinks](changefeed-sinks.html)
- [Functions and Operators](functions-and-operators.html)
- [User-Defined Functions](user-defined-functions.html)