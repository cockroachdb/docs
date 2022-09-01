---
title: Changefeed Expressions
summary: Filter the changefeed data that emits to the changefeed sink
toc: true
docs_area: stream
---

{% include feature-phases/preview.md %}

{% include_cached new-in.html version="v22.1" %} Changefeed expressions allow you to define the change data emitted to your sink when you create a changefeed. The expression [syntax](#syntax) provides a way to select columns and apply filters to further restrict or transform the data in your [changefeed messages](changefeed-messages.html).  

You can use changefeed expressions to do the following:

- Filter out specific rows and columns from changefeed messages to decrease the load on your downstream sink and support outbox workloads.
- Modify data before it emits to reduce the time and operational burden of filtering or transforming data downstream.
- Stabilize or customize the schema of your changefeed messages for increased compatibility with external systems.

You can use any CockroachDB-supported SQL expression syntax that is not listed in [limitations](#limitations) to build a changefeed query.

See the [Examples](#examples) section for further use cases.

## Syntax

There are two possible components to changefeed expressions:

- _Projections_ will select the columns that you want to emit data from. 
- _Predicates_ will restrict the selected column change data based on the filters you apply.

~~~ sql
CREATE CHANGEFEED INTO {sink} WITH {options} AS SELECT {columns, [column, ...]} FROM {table} WHERE {filter};
~~~

Parameter        | Description
-----------------+---------------
`sink`             | Specify the sink URL to emit change data to. See [Changefeed Sinks](changefeed-sinks.html) for a list of supported sinks. It is also possible to run a changefeed without a sink `CREATE CHANGEFEED WITH...`, which will send changes to the active SQL session.
`options`          | Set options on the changefeed. See the [Options](create-changefeed.html#options) table for a full list.
`columns`           | Select the columns from which to emit data.
`table`            | Define the table to which the columns belong.
`filter`           | Apply filters with a `WHERE` clause.

For a SQL diagram of the changefeed expression syntax, see the [`CREATE CHANGEFEED`](create-changefeed.html#synopsis) page.

## Limitations

- It is necessary to pass the [`schema_change_policy='stop'`](create-changefeed.html#schema-policy) option in the changefeed creation statement when using the expression format. [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/85143).
- You can only apply changefeed expressions on a single table in each statement.
- Some stable functions, notably functions that return MVCC timestamps, are overridden to return the MVCC timestamp of the event.
- You cannot [alter](alter-changefeed.html) a changefeed that uses an expression.

The following are not permitted in a changefeed expression:

- [Volatile functions](functions-and-operators.html#function-volatility)
- Sub-select queries
- [Aggregate](functions-and-operators.html#aggregate-functions) and [window functions](window-functions.html) (i.e., functions operating over many rows).

## Changefeed functions

You can use any function from the [Functions and Operators page](functions-and-operators.html) unless it is marked as ["Volatile"](functions-and-operators.html#function-volatility). The following functions are changefeed specific:

Function                  | Description
--------------------------+----------------------
`cdc_is_delete() `        | Returns `true` if the event is a deletion event.
`cdc_prev()`              | Returns a JSON representation of a row's previous state.
`cdc_updated_timestamp()` | Returns the event's update timestamp. This is typically the MVCC timestamp, but can differ. For example, if the table is undergoing [schema changes](online-schema-changes.html).

## Examples

Changefeed expressions allow you to customize your changefeed for particular scenarios. This section outlines several possible use cases for changefeed expressions. 

See [`CREATE CHANGEFEED`](create-changefeed.html) for examples on using the foundational syntax to create a changefeed. For information on sinks, see the [Changefeed Sinks](changefeed-sinks.html) page.

### Filter columns

To only emit data from specific columns in a table, you can use `SELECT {columns}` to define the table's columns.

As an example, you can create a changefeed watching specific rows in the following table:

~~~sql
CREATE TABLE office_dogs (
   id INT PRIMARY KEY,
   name STRING,
   owner STRING,
   dog_breed STRING,
   age INT8
 );
~~~

With this statement, you can create a changefeed that will emit messages including only the `name` and `owner` column data:

~~~ sql
CREATE CHANGEFEED INTO "scheme://sink-URI" WITH updated, schema_change_policy = 'stop' AS SELECT name, owner;
~~~

~~~
{"after":{"office_dogs":{"owner":{"string":"Ashley"},"name":{"string":"Roach"}}},"updated":{"string":"1662044737959974465.0000000000"}}
{"after":{"office_dogs":{"owner":{"string":"Lauren"},"name":{"string":"Petee"}}},"updated":{"string":"1662044737959974465.0000000000"}}
{"after":{"office_dogs":{"name":{"string":"Roach"},"owner":{"string":"Ashley"}}},"updated":{"string":"1662044737959974465.0000000000"}}
{"updated":{"string":"1662044737959974465.0000000000"},"after":{"office_dogs":{"name":{"string":"Patch"},"owner":{"string":"Sammy"}}}}
{"after":{"office_dogs":{"name":{"string":"Patch"},"owner":{"string":"Sammy"}}},"updated":{"string":"1662044737959974465.0000000000"}}
{"after":{"office_dogs":{"name":{"string":"Max"},"owner":{"string":"Taylor"}}},"updated":{"string":"1662044737959974465.0000000000"}}
{"after":{"office_dogs":{"owner":{"string":"Taylor"},"name":{"string":"Max"}}},"updated":{"string":"1662044737959974465.0000000000"}}
~~~

### Filter delete messages

To remove the [delete messages](changefeed-messages.html#delete-messages) from a changefeed stream, use the [`cdc_is_delete()`](#changefeed-functions) function:

~~~ sql
CREATE CHANGEFEED INTO sink WITH schema_change_policy = 'stop' AS SELECT * FROM table WHERE NOT cdc_is_delete();
~~~

Filtering delete messages from your changefeed is helpful for certain outbox table use cases. See [Changefeed expressions and the outbox pattern](#changefeed-expressions-and-the-outbox-pattern) for further detail.

### Stabilize the changefeed message schema

As changefeed messages emit from the database, message formats can vary as tables experience [schema changes](changefeed-messages.html#schema-changes). You can select columns with typecasting to prevent message fields from changing during a changefeed's lifecycle: 

~~~sql
CREATE CHANGEFEED INTO sink WITH schema_change_policy = 'stop' AS SELECT id::int, name::varchar, admin::bool FROM users;
~~~

### Shard changefeed messages

Changefeed expressions allow you to emit changefeed messages from the same table to different endpoints. As a result, you can use expressions to load balance messages across changefeed sinks without the need for an intermediate system.

In this example, the expression uses the `ride_id` column's [`UUID`](uuid.html) to shard the messages. The [`left()`](functions-and-operators.html#string-and-byte-functions) function filters the first character from the `ride_id` column and finds the specified initial characters. The example shards successfully by running a changefeed on the same table and dividing the 16 possible beginning `UUID` characters through to `f`. 

Therefore, the first changefeed created:

~~~sql 
CREATE CHANGEFEED INTO 'scheme://sink-URI' WITH schema_change_policy='stop' AS SELECT * FROM movr.vehicle_location_histories WHERE left(ride_id::string, 1) IN ('0','1','2','3');
~~~

The final changefeed created:

~~~sql 
CREATE CHANGEFEED INTO 'scheme://sink-URI' WITH schema_change_policy='stop' AS SELECT * FROM movr.vehicle_location_histories WHERE left(ride_id::string, 1) IN ('c','d','e','f');
~~~

### View recent changes to a row

You can use changefeed expressions as a tool for debugging or investigation from the SQL shell. 

For example, you may need to identify what recently changed in a specific row. You can use the [`cursor`](create-changefeed.html#cursor-option) option with the desired start time and a `WHERE` clause describing the row in question. Instead of sending to a sink, a "sinkless" changefeed will allow you to view the results in the SQL shell. 

First, find the start time. Use the [`cluster_logical_timestamp()`](functions-and-operators.html#system-info-functions) function to calculate the logical time. This will return the logical timestamp for an hour earlier than the statement run time:

~~~sql
SELECT cluster_logical_timestamp() - 3600000000000;
~~~
~~~
             ?column?
----------------------------------
  1663938662092036106.0000000000
(1 row)
~~~

Next, run the changefeed without a sink and pass the start time to the `cursor` option:

~~~sql
CREATE CHANGEFEED WITH cursor='1663938662092036106.0000000000', schema_change_policy='stop' AS SELECT * FROM vehicle_location_histories  WHERE ride_id::string LIKE 'f2616bb3%';
~~~

To find changes within a time period, use `cursor` with the [`end_time`](create-changefeed.html#end-time) option:

~~~sql
CREATE CHANGEFEED WITH cursor='1663938662092036106.0000000000', end_time='1663942405825479261.0000000000', schema_change_policy='stop' AS SELECT * FROM vehicle_location_histories  WHERE ride_id::string LIKE 'f2616bb3%';
~~~

### Recover lost messages

In the event that an incident downstream has affected some rows, you may need a way to recover or evaluate the specific rows. Create a new changefeed that only watches for the affected row(s):

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

### Customize changefeed messages

You can adapt your [changefeed messages](changefeed-messages.html) by filtering the columns, but it is also possible to build message fields with SQL expressions. 

In this example, the expression adds a `summary` field to the changefeed message:

~~~sql
CREATE CHANGEFEED WITH schema_change_policy = 'stop' AS SELECT *, owner_id::string || ' takes passengers by ' || type || '. They are currently ' || status AS summary FROM vehicles;
~~~
~~~
{"key":"[\"seattle\", \"e88af90e-1212-4d10-ad13-5b30cfe3bd16\"]","table":"vehicles","value":"{\"city\": \"seattle\", \"creation_time\": \"2019-01-02T03:04:05\", \"current_location\": \"49128 Gerald Mall\", \"ext\": {\"color\": \"yellow\"}, \"id\": \"e88af90e-1212-4d10-ad13-5b30cfe3bd16\", \"owner_id\": \"28df0fab-cde9-4bc1-a11e-769f4b915171\", \"status\": \"in_use\", \"summary\": \"28df0fab-cde9-4bc1-a11e-769f4b915171 takes passengers by skateboard. They are currently in_use\", \"type\": \"skateboard\"}"}
{"key":"[\"seattle\", \"f00edb5f-d951-4dfd-8c1c-d0b34ebc38be\"]","table":"vehicles","value":"{\"city\": \"seattle\", \"creation_time\": \"2019-01-02T03:04:05\", \"current_location\": \"2521 Jaclyn Place Apt. 68\", \"ext\": {\"color\": \"yellow\"}, \"id\": \"f00edb5f-d951-4dfd-8c1c-d0b34ebc38be\", \"owner_id\": \"d4b05249-afed-4f89-b7a9-d5533f687a13\", \"status\": \"available\", \"summary\": \"d4b05249-afed-4f89-b7a9-d5533f687a13 takes passengers by scooter. They are currently available\", \"type\": \"scooter\"}"}
~~~

### Changefeed expressions and the outbox pattern

The transactional outbox pattern provides a way to publish events reliably through an outbox table before sending to the messaging system. Changefeed expressions can help to streamline this process by eliminating the need for an outbox table in the database. If you also have a requirement to transform the data or remove delete messages from the changefeed payload, expressions can achieve this. 

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

~~~sql
CREATE CHANGEFEED INTO 'kafka://endpoint?topic_name=events' AS SELECT
cdc_updated_timestamp()::int AS event_timestamp,
'dogs' AS table,
IF (cdc_is_delete(),'delete','create') AS type,
jsonb_build_object('good_boy',good_boy) AS data
FROM dogs;
~~~

This statement does the following:

- Selects the `event_timestamp` of the event and casts to an `INT`.
- Sets the `type` of change as `delete` or `create` using the [`cdc_is_delete()` function](#changefeed-functions).
- Uses [`jsonb_build_object()`](functions-and-operators.html) to construct the desired data field.

For the remaining tables, you use the same statement structure to create changefeeds that will send messages to the Kafka endpoint: 

~~~sql
CREATE CHANGEFEED INTO 'kafka://endpoint?topic_name=events' AS SELECT
cdc_updated_timestamp()::int AS event_timestamp,
'users' AS table,
IF (cdc_is_delete(),'delete','create') AS type,
jsonb_build_object('email', email, 'admin', admin) AS data
FROM users;
~~~

~~~sql
CREATE CHANGEFEED INTO 'kafka://endpoint?topic_name=events' AS SELECT
cdc_updated_timestamp()::int AS event_timestamp,
'accounts' AS table,
IF (cdc_is_delete(),'delete','create') AS type,
jsonb_build_object('owner', owner) AS data
FROM accounts;
~~~

For a different usage of the outbox pattern, you may still want an events table to track and manage the lifecycle of an event. You can also use changefeed expressions in this case to filter the event management metadata out of a message. 

For example, when you delete a message in your outbox table after processing it (or with [row-level TTL](row-level-ttl.html)). You can filter the [delete messages](#filter-delete-messages) from your changefeed:

~~~sql
CREATE CHANGEFEED INTO ‘kafka://endpoint?topic_name=events’ AS SELECT * FROM outbox WHERE NOT cdc_is_delete();
~~~

Similarly, if you have a status column in your outbox table tracking its lifecycle, you can filter out updates as well so that only the initial insert sends a message:

~~~sql
CREATE CHANGEFEED INTO 'scheme://sink-URI' WITH schema_change_policy='stop' AS SELECT status FROM outbox WHERE cdc_prev()->'status' IS NULL;
~~~

Since all non-primary key columns will be `NULL` in the [`cdc_prev()`](#changefeed-functions) output for an insert message, the changefeed will not send any update messages.

## See also

- [`CREATE CHANGEFEED`](create-changefeed.html)
- [Changefeed Messages](changefeed-messages.html)
- [Changefeed Sinks](changefeed-sinks.html)

