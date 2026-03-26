---
title: Change Data Capture Queries
summary: Filter the changefeed data that emits to the changefeed sink.
toc: true
docs_area: stream
key: cdc-transformations.html
---



Change data capture queries allow you to define the change data emitted to your sink when you create a changefeed. The expression [syntax](#syntax) provides a way to select columns and apply filters to further restrict or transform the data in your [changefeed messages]({% link {{ page.version.version }}/changefeed-messages.md %}).

You can use CDC queries to do the following:

- Filter out specific rows and columns from changefeed messages to decrease the load on your downstream sink and support outbox workloads.
- Modify data before it emits to reduce the time and operational burden of filtering or transforming data downstream.
- Stabilize or customize the schema of your changefeed messages for increased compatibility with external systems.

You can use any CockroachDB-supported SQL expression syntax that is not listed in [Known limitations](#known-limitations) to build a changefeed query.

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
`sink`             | Specify the sink URL to emit change data to. See [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}) for a list of supported sinks. It is also possible to run a changefeed without a sink `CREATE CHANGEFEED WITH...`, which will send changes to the active SQL session.
`options`          | Set options on the changefeed. See the [Options]({% link {{ page.version.version }}/create-changefeed.md %}#options) table for a full list.
`projection`       | Select the columns from which to emit data.
`table`            | Define the table to which the columns belong.
`predicate`        | Apply optional filters with a `WHERE` clause.

For a SQL diagram of the CDC query syntax, see the [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}#synopsis) page.

To emit different properties for a row, specify the following explicitly in CDC queries:

- `cdc_prev`: A tuple-typed column that gives changefeeds access to the previous state of a row. For newly inserted rows in a table, the `cdc_prev` column will emit as `NULL`. See the [Emit the previous state of a row](#emit-the-previous-state-of-a-row) example for more detail.
- CDC queries support [system columns]({% link {{ page.version.version }}/crdb-internal.md %}), for example:
  - <a name="crdb-internal-mvcc-timestamp"></a>`crdb_internal_mvcc_timestamp`: Records the timestamp of each row created in a table. If you do not have a timestamp column in the target table, you can access `crdb_internal_mvcc_timestamp` in a changefeed. See the [Determine the age of a row](#determine-the-age-of-a-row) example.

{% include {{ page.version.version }}/cdc/composite-key-delete-insert.md %}

## Known limitations

{% include {{ page.version.version }}/known-limitations/cdc-queries.md %}
- {% include {{ page.version.version }}/known-limitations/alter-changefeed-cdc-queries.md %}
- {% include {{ page.version.version }}/known-limitations/cdc-queries-column-families.md %}

## CDC query function support

The following table outlines functions that are useful with CDC queries:

Function                  | Description
--------------------------+----------------------
`changefeed_creation_timestamp()` | Returns the decimal MVCC timestamp when the changefeed was created. Use this function to build CDC queries that restrict emitted events by time. `changefeed_creation_timestamp()` can serve a similar purpose to the [`now()` time function]({% link {{ page.version.version }}/functions-and-operators.md %}#date-and-time-functions), which is not supported with CDC queries.
`event_op()`              | Returns a string describing the type of event. If a changefeed is running with the [`diff`]({% link {{ page.version.version }}/create-changefeed.md %}#diff) option, then this function returns `'insert'`, `'update'`, or `'delete'`. If a changefeed is running without the `diff` option, it is not possible to determine an update from an insert, so `event_op()` returns [`'upsert'`](https://www.cockroachlabs.com/blog/sql-upsert/) or `'delete'`.<br><br>If you're using CDC queries to filter only for the type of change operation, we recommend specifying the [`envelope=enriched` option]({% link {{ page.version.version }}/changefeed-message-envelopes.md %}#route-events-based-on-operation-type) for this metadata instead.
`event_schema_timestamp()` | Returns the timestamp of [schema change]({% link {{ page.version.version }}/online-schema-changes.md %}) events that cause a [changefeed message]({% link {{ page.version.version }}/changefeed-messages.md %}) to emit. When the schema change event does not result in a table backfill or scan, `event_schema_timestamp()` will return the event's timestamp. When the schema change event does result in a table backfill or scan, `event_schema_timestamp()` will return the timestamp at which the backfill/scan is read — the [high-water mark time]({% link {{ page.version.version }}/how-does-a-changefeed-work.md %}) of the changefeed.

You can also use the following functions in CDC queries:

- Functions marked as "Immutable" on the [Functions and Operators page]({% link {{ page.version.version }}/functions-and-operators.md %}).
- Non-volatile [user-defined functions]({% link {{ page.version.version }}/user-defined-functions.md %}). See the [Queries and user-defined functions](#queries-and-user-defined-functions) example.
- Functions that rely on [session data]({% link {{ page.version.version }}/show-sessions.md %}). At the time of changefeed creation, information about the current session is saved. When a CDC query includes one of the functions that use session data, the query will evaluate the saved session data.
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

- Functions marked as "Volatile" on the [Functions and Operators page]({% link {{ page.version.version }}/functions-and-operators.md %}).
- Functions listed in the [Known limitations](#known-limitations) section on this page.
- Functions marked as "Stable" on the [Functions and Operators page]({% link {{ page.version.version }}/functions-and-operators.md %}), **except** for those listed previously.

## Examples

CDC queries allow you to customize your changefeed for particular scenarios. This section outlines several possible use cases for CDC queries.

{% include {{ page.version.version }}/cdc/bare-envelope-cdc-queries.md %} Refer to the [Changefeed Message Envelopes]({% link {{ page.version.version }}/changefeed-message-envelopes.md %}#bare) page for more detail.

Depending on how you are filtering or adapting the message envelope with a CDC query and which sink you're emitting to, message output may vary from some of the example cases in this section.

Refer to [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}) for examples on using the foundational syntax to create a changefeed. For information on sinks, refer to the [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}) page.

### Filter columns

To only emit data from specific columns in a table, you can use `SELECT {columns}` to define the table's columns.

As an example, using the `users` table from the [`movr` database]({% link {{ page.version.version }}/movr.md %}#the-movr-database), you can create a changefeed that will emit messages including only the `name` and `city` column data:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED INTO "scheme://sink-URI" WITH updated AS SELECT name, city FROM users;
~~~
~~~
{"__crdb__": {"updated": "1685718676799158675.0000000000"}, "city": "amsterdam", "name": "Thomas Harris"}
{"__crdb__": {"updated": "1685718676799158675.0000000000"}, "city": "amsterdam", "name": "Guy Williams"}
{"__crdb__": {"updated": "1685718676799158675.0000000000"}, "city": "amsterdam", "name": "Guy Williams"}
{"__crdb__": {"updated": "1685718676799158675.0000000000"}, "city": "amsterdam", "name": "Tyler Hunter"}
{"__crdb__": {"updated": "1685718676799158675.0000000000"}, "city": "amsterdam", "name": "Tyler Hunter"}
{"__crdb__": {"updated": "1685718676799158675.0000000000"}, "city": "amsterdam", "name": "Tyler Dalton"}
{"__crdb__": {"updated": "1685718676799158675.0000000000"}, "city": "amsterdam", "name": "Dillon Martin"}
{"__crdb__": {"updated": "1685718676799158675.0000000000"}, "city": "amsterdam", "name": "Lisa Sandoval"}
{"__crdb__": {"updated": "1685718676799158675.0000000000"}, "city": "amsterdam", "name": "Deborah Carson"}
{"__crdb__": {"updated": "1685718676799158675.0000000000"}, "city": "amsterdam", "name": "David Stanton"}
{"__crdb__": {"updated": "1685718676799158675.0000000000"}, "city": "amsterdam", "name": "Maria Weber"}
~~~

### Filter delete messages

To remove the [delete messages]({% link {{ page.version.version }}/changefeed-messages.md %}#delete-messages) from a changefeed stream, use the [`event_op()`](#cdc-query-function-support) function:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED INTO sink AS SELECT * FROM table WHERE NOT event_op() = 'delete';
~~~

Filtering delete messages from your changefeed is helpful for certain outbox table use cases. See [Queries and the outbox pattern](#queries-and-the-outbox-pattern) for further detail.

### Capture delete messages

Delete changefeed messages will only contain the [primary key]({% link {{ page.version.version }}/primary-key.md %}) value and all other columns will emit as `NULL` (see the [Known limitations](#known-limitations)). To emit the deleted values, use the [`envelope=wrapped`]({% link {{ page.version.version }}/create-changefeed.md %}#envelope), [`format=json`]({% link {{ page.version.version }}/create-changefeed.md %}#format), and [`diff`]({% link {{ page.version.version }}/create-changefeed.md %}#diff) options:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED INTO 'external://cloud' WITH envelope='wrapped', format='json', diff AS SELECT * FROM users WHERE event_op() = 'delete';
~~~

This will produce a JSON object with `before` and `after` keys that contain the prior and current states of the row:

~~~
{"after": null, "before": {"address": "95913 Thomas Key Apt. 99", "city": "washington dc", "credit_card": "2702281601", "id": "49a8c43d-8ed8-4d50-ad99-fb314cbe20a1", "name": "Tina Jones"}}
~~~

The `before` value in the delete message, produced by the `diff` option, will include the entire row. That is, it will not include any [projections](#syntax) from a CDC query.

### Emit the previous state of a row

Changefeeds can access the `cdc_prev` hidden column on a table to emit the previous state of a row or column. `cdc_prev` is a tuple-typed column that contains the table's columns.

To emit the previous state of a row, it is necessary to explicitly call `cdc_prev`:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED INTO 'external://sink' AS SELECT rider_id, vehicle_id, cdc_prev FROM movr.rides;
~~~

To emit the previous state of a column, you can specify this as a named field from the `cdc_prev` tuple with the following syntax:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED INTO 'external://sink' AS SELECT owner_id, (cdc_prev).current_location AS previous_location FROM movr.vehicles WHERE (cdc_prev).status = 'in_use';
~~~

For newly inserted rows in a table, the `cdc_prev` column will emit as `NULL`.

{{site.data.alerts.callout_info}}
If you do not need to select specific columns in a table or filter rows from a changefeed, you can instead create a changefeed using the [`diff` option]({% link {{ page.version.version }}/create-changefeed.md %}#diff) to emit a `before` field with each message. This field includes the value of the row before the update was applied.
{{site.data.alerts.end}}

### Reference TTL in a CDC query

In CockroachDB, table row deletes occur as a result of [regular SQL transactions]({% link {{ page.version.version }}/delete-data.md %}) or through [row-level TTL]({% link {{ page.version.version }}/row-level-ttl.md %}). When your changefeed emits [delete event messages]({% link {{ page.version.version }}/changefeed-messages.md %}#delete-messages), you may need to distinguish between these two types of deletion. For example, only emitting messages for row-level TTL deletes from your changefeed.

If you have TTL logic defined with [`ttl_expiration_expression`](#ttl_expiration_expression) or [`ttl_expire_after`](#ttl_expire_after), you can leverage CDC queries to determine whether or not a given row was expired at the time of the changefeed event, including a delete event.

{{site.data.alerts.callout_info}}
{% include {{page.version.version}}/sql/row-level-ttl-prefer-ttl-expiration-expressions.md %}

For more detail, refer to the [Batch Delete Expire Data with Row-Level TTL]({% link {{ page.version.version }}/row-level-ttl.md %}) page.
{{site.data.alerts.end}}

#### `ttl_expiration_expression`

In some cases, you may have custom expiration logic on rows in a table. You can also write a CDC query to emit rows that have deleted through row-level TTL using a custom TTL expression.

In the following example, the table uses the [`ttl_expiration_expression`]({% link {{ page.version.version }}/row-level-ttl.md %}#syntax-overview) storage parameter to reference the `expired_at` column. To create a changefeed on this table to explicitly emit the previous state of the row for TTL deletions:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED INTO 'external://sink'
AS SELECT cdc_prev FROM ttl_test_per_row
WHERE event_op() = 'delete'
AND (cdc_prev).expired_at < statement_timestamp();
~~~

For the `CREATE TABLE` statement and further details on `ttl_expiration_expression`, refer to [Using `ttl_expiration_expression`]({% link {{ page.version.version }}/row-level-ttl.md %}#using-ttl_expiration_expression).

#### `ttl_expire_after`

When the table uses the `ttl_expire_after` storage parameter, you can emit rows that were deleted after expiring from the changefeed with syntax similar to:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED INTO 'external://sink'
AS SELECT cdc_prev FROM test_table
WHERE event_op() = 'delete'
AND (cdc_prev).crdb_internal_expiration < statement_timestamp();
~~~

This changefeed statement:

- Accesses the `cdc_prev` column for the previous state of the row.
- Searches for `delete` events in that previous state.
- Finds the TTL expiration timestamp of the deleted rows where it is earlier than the current statement timestamp.

For the `CREATE TABLE` statement and further details on `ttl_expire_after`, refer to [Using `ttl_expire_after`]({% link {{ page.version.version }}/row-level-ttl.md %}#using-ttl_expire_after).

{{site.data.alerts.callout_info}}
This will only emit rows that were deleted **after** expiring. Furthermore, consider that a [transactional SQL delete]({% link {{ page.version.version }}/delete-data.md %}) during the window between the row expiring and the TTL job running will also cause this message to emit from the changefeed.
{{site.data.alerts.end}}

Equally, you can remove the delete messages for expired rows so that they do not emit from your changefeed:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED AS SELECT cdc_prev FROM test_table
WHERE NOT (event_op() = 'delete'
AND (cdc_prev).crdb_internal_expiration < statement_timestamp());
~~~

### Geofilter a changefeed

When you are working with a [`REGIONAL BY ROW` table]({% link {{ page.version.version }}/alter-table.md %}#regional-by-row), you can filter the changefeed on the `crdb_region` column to create a region-specific changefeed:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED INTO sink AS SELECT * FROM table WHERE crdb_region = 'europe-west2';
~~~

For more detail on targeting `REGIONAL BY ROW` tables with changefeeds, see [Changefeeds in Multi-Region Deployments]({% link {{ page.version.version }}/changefeeds-in-multi-region-deployments.md %}).

{{site.data.alerts.callout_success}}
If you are running changefeeds from a [multi-region]({% link {{ page.version.version }}/multiregion-overview.md %}) cluster, you may want to define which nodes take part in running the changefeed job. You can use the [`execution_locality` option]({% link {{ page.version.version }}/changefeeds-in-multi-region-deployments.md %}#run-a-changefeed-job-by-locality) with key-value pairs to specify the [locality designations]({% link {{ page.version.version }}/cockroach-start.md %}#locality) nodes must meet.
{{site.data.alerts.end}}

### Stabilize the changefeed message schema

As changefeed messages emit from the database, message formats can vary as tables experience [schema changes]({% link {{ page.version.version }}/changefeed-messages.md %}#schema-changes). You can select columns with [typecasting]({% link {{ page.version.version }}/data-types.md %}#data-type-conversions-and-casts) to prevent message fields from changing during a changefeed's lifecycle:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED INTO sink AS SELECT id::int, name::varchar, admin::bool FROM users;
~~~

### Shard changefeed messages

CDC queries allow you to emit changefeed messages from the same table to different endpoints. As a result, you can use queries to load balance messages across changefeed sinks without the need for an intermediate system.

In this example, the query uses the `ride_id` column's [`UUID`]({% link {{ page.version.version }}/uuid.md %}) to shard the messages. The [`left()`]({% link {{ page.version.version }}/functions-and-operators.md %}#string-and-byte-functions) function filters the first character from the `ride_id` column and finds the specified initial characters. The example shards successfully by running a changefeed on the same table and dividing the 16 possible beginning `UUID` characters through to `f`.

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

For example, you may need to identify what recently changed in a specific row. You can use the [`cursor`]({% link {{ page.version.version }}/create-changefeed.md %}#cursor) option with the desired start time and a `WHERE` clause describing the row in question. Instead of sending to a sink, a "sinkless" changefeed will allow you to view the results in the SQL shell.

1. Find the start time. Use the [`cluster_logical_timestamp()`]({% link {{ page.version.version }}/functions-and-operators.md %}#system-info-functions) function to calculate the logical time. This will return the logical timestamp for an hour earlier than the statement run time:

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

1. To find changes within a time period, use `cursor` with the [`end_time`]({% link {{ page.version.version }}/create-changefeed.md %}#end-time) option:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    CREATE CHANGEFEED WITH cursor='1663938662092036106.0000000000', end_time='1663942405825479261.0000000000'
    AS SELECT * FROM vehicle_location_histories
    WHERE ride_id::string LIKE 'f2616bb3%';
    ~~~

### Determine the age of a row

You can determine the age of a row by using the `crdb_internal_mvcc_timestamp` system column and `cdc_prev` to [access the row's previous state](#emit-the-previous-state-of-a-row):

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
CREATE CHANGEFEED INTO 'scheme://cloud'
AS SELECT * FROM movr.vehicle_location_histories
WHERE ride_id = 'efe6468e-f443-463f-a21c-4cb0f6ecf235';
~~~

The changefeed will return messages for the specified rows:

~~~
{"city": "washington dc", "lat": 128, "long": 11, "ride_id": "efe6468e-f443-463f-a21c-4cb0f6ecf235", "timestamp": "2023-06-02T15:11:30.316547"}
{"city": "washington dc", "lat": 45, "long": -66, "ride_id": "efe6468e-f443-463f-a21c-4cb0f6ecf235", "timestamp": "2023-06-02T15:11:33.700297"}
{"city": "washington dc", "lat": -34, "long": -49, "ride_id": "efe6468e-f443-463f-a21c-4cb0f6ecf235", "timestamp": "2023-06-02T15:11:34.050312"}
{"city": "washington dc", "lat": 1E+1, "long": -27, "ride_id": "efe6468e-f443-463f-a21c-4cb0f6ecf235", "timestamp": "2023-06-02T15:11:36.408561"}
{"city": "washington dc", "lat": 83, "long": 84, "ride_id": "efe6468e-f443-463f-a21c-4cb0f6ecf235", "timestamp": "2023-06-02T15:11:38.026542"}
~~~

The output will only include the row's history that has been changed within the [garbage collection window]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection). If the change occurred outside of the garbage collection window, it will not be returned as part of this output. See [Garbage collection and changefeeds]({% link {{ page.version.version }}/protect-changefeed-data.md %}) for more detail on how the garbage collection window interacts with changefeeds.

### Customize changefeed messages

You can adapt your [changefeed messages]({% link {{ page.version.version }}/changefeed-messages.md %}) by filtering the columns, but it is also possible to build message fields with SQL expressions.

In this example, the query adds a `summary` field to the changefeed message:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED INTO 'external://cloud' AS SELECT *, owner_id::string || ' takes passengers by ' || type || '. They are currently ' || status AS summary FROM vehicles;
~~~
~~~
{"city": "los angeles", "creation_time": "2019-01-02T03:04:05", "current_location": "43051 Jonathan Fords Suite 36", "ext": {"color": "red"}, "id": "99999999-9999-4800-8000-000000000009", "owner_id": "9eb851eb-851e-4800-8000-00000000001f", "status": "in_use", "summary": "9eb851eb-851e-4800-8000-00000000001f takes passengers by scooter. They are currently in_use", "type": "scooter"}
{"city": "new york", "creation_time": "2019-01-02T03:04:05", "current_location": "64110 Richard Crescent", "ext": {"color": "black"}, "id": "00000000-0000-4000-8000-000000000000", "owner_id": "051eb851-eb85-4ec0-8000-000000000001", "status": "in_use", "summary": "051eb851-eb85-4ec0-8000-000000000001 takes passengers by skateboard. They are currently in_use", "type": "skateboard"}
{"city": "new york", "creation_time": "2019-01-02T03:04:05", "current_location": "64297 Ballard Hollow Suite 30", "ext": {"brand": "Pinarello", "color": "blue"}, "id": "0d393d59-82c0-4762-84d0-71a445283c53", "owner_id": "521a31b0-c8ff-40c4-baac-23f7daa66562", "status": "available", "summary": "521a31b0-c8ff-40c4-baac-23f7daa66562 takes passengers by bike. They are currently available", "type": "bike"}
{"city": "new york", "creation_time": "2019-01-02T03:04:05", "current_location": "86667 Edwards Valley", "ext": {"color": "black"}, "id": "11111111-1111-4100-8000-000000000001", "owner_id": "147ae147-ae14-4b00-8000-000000000004", "status": "in_use", "summary": "147ae147-ae14-4b00-8000-000000000004 takes passengers by scooter. They are currently in_use", "type": "scooter"}
{"city": "new york", "creation_time": "2019-01-02T03:04:05", "current_location": "64297 Ballard Hollow Suite 30", "ext": {"brand": "Pinarello", "color": "blue"}, "id": "64b6fc6a-8019-4b1f-bc30-0a186197ec68", "owner_id": "30583448-8eeb-48e6-8b0d-9842bb26e991", "status": "available", "summary": "30583448-8eeb-48e6-8b0d-9842bb26e991 takes passengers by bike. They are currently available", "type": "bike"}
{"city": "new york", "creation_time": "2019-01-02T03:04:05", "current_location": "64297 Ballard Hollow Suite 30", "ext": {"brand": "Pinarello", "color": "blue"}, "id": "7bd82867-8e7b-4811-a4f9-3e938792fe6c", "owner_id": "e1f215d8-1c47-47a2-b6f8-e8128db2eefb", "status": "available", "summary": "e1f215d8-1c47-47a2-b6f8-e8128db2eefb takes passengers by bike. They are currently available", "type": "bike"}
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
- Uses [`jsonb_build_object()`]({% link {{ page.version.version }}/functions-and-operators.md %}) to construct the desired data field.

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

For example, when you delete a message in your outbox table after processing it (or with [row-level TTL]({% link {{ page.version.version }}/row-level-ttl.md %})). You can filter the [delete messages](#filter-delete-messages) from your changefeed:

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

You can create CDC queries that include [user-defined functions]({% link {{ page.version.version }}/user-defined-functions.md %}).

The following [`CREATE FUNCTION`]({% link {{ page.version.version }}/create-function.md %}) statement builds the `doubleRevenue()` function at the database level:

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

### Video Demo

For a demo on how to harness CDC Queries to filer and produce JSON events, watch the following video:

{% include_cached youtube.html video_id="mea4czXi7tI" %}

## See also

- [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %})
- [Changefeed Messages]({% link {{ page.version.version }}/changefeed-messages.md %})
- [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %})
- [Functions and Operators]({% link {{ page.version.version }}/functions-and-operators.md %})
- [User-Defined Functions]({% link {{ page.version.version }}/user-defined-functions.md %})
