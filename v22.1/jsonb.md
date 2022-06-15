---
title: JSONB
summary: The JSONB data type stores JSON (JavaScript Object Notation) data.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
docs_area: reference.sql
---

The `JSONB` [data type](data-types.html) stores JSON (JavaScript Object Notation) data as a binary representation of the `JSONB` value, which eliminates whitespace, duplicate keys, and key ordering. `JSONB` supports [GIN indexes](inverted-indexes.html).

{{site.data.alerts.callout_success}}For a hands-on demonstration of storing and querying JSON data from a third-party API, see the <a href="demo-json-support.html">JSON tutorial</a>.{{site.data.alerts.end}}

## Alias

In CockroachDB, `JSON` is an alias for `JSONB`.

{{site.data.alerts.callout_info}}In PostgreSQL, <code>JSONB</code> and <code>JSON</code> are two different data types. In CockroachDB, the <code>JSONB</code> / <code>JSON</code> data type is similar in behavior to the <a href="https://www.postgresql.org/docs/current/static/datatype-json.html"><code>JSONB</code> data type in PostgreSQL</a>.
{{site.data.alerts.end}}

## Index `JSONB` data

To [index](indexes.html) a `JSONB` column you can use a [GIN index](inverted-indexes.html) or [index an expression on the column](expression-indexes.html#use-an-expression-to-index-a-field-in-a-jsonb-column).

## Syntax

The syntax for the `JSONB` data type follows the format specified in [RFC8259](https://tools.ietf.org/html/rfc8259). You can express a constant value of type `JSONB` using an [interpreted literal](sql-constants.html#interpreted-literals) or a string literal [annotated with](scalar-expressions.html#explicitly-typed-expressions) type `JSONB`.

There are six types of `JSONB` values:

- `null`
- Boolean
- String
- Number (i.e., [`decimal`](decimal.html), **not** the standard `int64`)
- Array (i.e., an ordered sequence of `JSONB` values)
- Object (i.e., a mapping from strings to `JSONB` values)

Examples:

- `'[{"foo":"bar"}]'`
- `'{"type": "account creation", "username": "harvestboy93"}'`
- `'{"first_name": "Ernie", "status": "Looking for treats", "location" : "Brooklyn"}'`
- `'{"prices" : [ { "05/01/2022" : 100.5 } , { "06/01/2022" : 101.5 } ]}'`

{{site.data.alerts.callout_info}}If duplicate keys are included in the input, only the last value is kept.{{site.data.alerts.end}}

## Size

The size of a `JSONB` value is variable, but we recommend that you keep values under 1 MB to ensure satisfactory performance. Above that threshold, [write amplification](architecture/storage-layer.html#write-amplification) and other considerations may cause significant performance degradation.

## Operators

Operator | Description | Example |
---------|-------------|---------|
`->` | Access a `JSONB` field, returning a `JSONB` value. | `SELECT '[{"foo":"bar"}]'::JSONB->0->'foo'; = "bar"::JSONB`
`->>` | Access a `JSONB` field, returning a string. | `SELECT '{"foo":"bar"}'::JSONB->>'foo'; = bar::STRING;`
`@>` | Tests whether the left `JSONB` field contains the right `JSONB` field. | `SELECT ('{"foo": {"baz": 3}, "bar": 2}'::JSONB@>'{"foo": {"baz":3}}'::JSONB ); = true;`
`#> ` | Access a `JSONB` field at the specified path, returning a `JSONB` value.  | `SELECT '[{"foo":"bar"}]'::JSONB#>'{0,foo}'; = "bar"::JSONB`
`#>>` | Access a `JSONB` field at the specified path, returning a string. | `SELECT '[{"foo":"bar"}]'::JSONB#>>'{0,foo}'; = bar::STRING`

For the full list of supported `JSONB` operators, see [Operators](functions-and-operators.html#operators).

## Functions

Function | Description
---------|------------
`jsonb_array_elements(<jsonb>)` | Expands a `JSONB` array to a set of `JSONB` values. See [Map a `JSONB` array field into rows](#map-a-jsonb-array-field-into-rows).
`jsonb_build_object(<any_element>...)` | Builds a `JSONB` object out of a variadic argument list that alternates between keys and values.
`jsonb_each(<jsonb>)` | Expands the outermost `JSONB` object into a set of key-value pairs. See [Retrieve key-value pairs from a `JSONB` field](#retrieve-key-value-pairs-from-a-jsonb-field).
`jsonb_object_keys(<jsonb>)` | Returns sorted set of keys in the outermost `JSONB` object. See [Retrieve the distinct keys from a `JSONB` field](#retrieve-the-distinct-keys-from-a-jsonb-field).
`jsonb_pretty(<jsonb>)` | Returns the given `JSONB` value as a `STRING` indented and with newlines. See [Retrieve formatted `JSONB` data](#retrieve-formatted-jsonb-data).
`jsonb_set(val: jsonb, path: string[], to: jsonb)` | Returns the JSON value pointed to by the variadic arguments. See [Update an array element](#update-an-array-element).

For the full list of supported `JSONB` functions, see [JSONB functions](functions-and-operators.html#jsonb-functions).

## Known limitations

- You cannot use [primary key](primary-key.html), [foreign key](foreign-key.html), and [unique](unique.html) [constraints](constraints.html) on `JSONB` values.

- {% include {{page.version.version}}/sql/jsonb-comparison.md %}

- You cannot [order](order-by.html) queries using `JSONB` and `JSON`-typed columns.

    [Tracking issue](https://github.com/cockroachdb/cockroach/issues/35706)

- If the execution of a [join](joins.html) query exceeds the limit set for [memory-buffering operations](vectorized-execution.html#disk-spilling-operations) (i.e., the value set for the `sql.distsql.temp_storage.workmem` [cluster setting](cluster-settings.html)), CockroachDB will spill the intermediate results of computation to disk. If the join operation spills to disk, and at least one of the columns is of type `JSON`, CockroachDB returns the error `unable to encode table key: *tree.DJSON`. If the memory limit is not reached, then the query will be processed without error.

    [Tracking issue](https://github.com/cockroachdb/cockroach/issues/35706)

## Examples

This section shows how to create tables with `JSONB` columns and use operators and functions to access and update `JSONB` data. For the full list of operators and functions, see [Operators](functions-and-operators.html#operators) and [JSONB functions](functions-and-operators.html#jsonb-functions).

### Create a table with a `JSONB` column

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE users (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    last_updated TIMESTAMP DEFAULT now(),
    user_profile JSONB
  );
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM users;
~~~

~~~
  column_name  | data_type | is_nullable |  column_default   | generation_expression |  indices     | is_hidden
---------------+-----------+-------------+-------------------+-----------------------+--------------+------------
  profile_id   | UUID      |    false    | gen_random_uuid() |                       | {users_pkey} |   false
  last_updated | TIMESTAMP |    true     | now():::TIMESTAMP |                       | {users_pkey} |   false
  user_profile | JSONB     |    true     | NULL              |                       | {users_pkey} |   false
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO users (user_profile) VALUES
    ('{"first_name": "Lola", "last_name": "Dog", "location": "NYC", "online" : true, "friends" : 547}'),
    ('{"first_name": "Ernie", "status": "Looking for treats", "location" : "Brooklyn"}');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM users;
~~~
~~~
+--------------------------------------+----------------------------------+----------------------------------------------------------------------------------------------+
|              profile_id              |           last_updated           |                               user_profile                                                   |
+--------------------------------------+----------------------------------+----------------------------------------------------------------------------------------------+
| 33c0a5d8-b93a-4161-a294-6121ee1ade93 | 2022-02-27 16:39:28.155024+00:00 | {"first_name": "Lola", "friends": 547, "last_name": "Dog", "location":"NYC", "online": true} |
| 6a7c15c9-462e-4551-9e93-f389cf63918a | 2022-02-27 16:39:28.155024+00:00 | {"first_name": "Ernie", "location": "Brooklyn", "status": "Looking for treats}               |
+--------------------------------------+----------------------------------+----------------------------------------------------------------------------------------------+
~~~

### Retrieve formatted `JSONB` data

To retrieve `JSONB` data with easier-to-read formatting, use the `jsonb_pretty()` function. For example, retrieve data from the table you created in the [first example](#create-a-table-with-a-jsonb-column):

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT profile_id, last_updated, jsonb_pretty(user_profile) FROM users;
~~~
~~~
+--------------------------------------+----------------------------------+------------------------------------+
|              profile_id              |           last_updated           |            jsonb_pretty            |
+--------------------------------------+----------------------------------+------------------------------------+
| 33c0a5d8-b93a-4161-a294-6121ee1ade93 | 2022-02-27 16:39:28.155024+00:00 | {                                  |
|                                      |                                  |     "first_name": "Lola",          |
|                                      |                                  |     "friends": 547,                |
|                                      |                                  |     "last_name": "Dog",            |
|                                      |                                  |     "location": "NYC",             |
|                                      |                                  |     "online": true                 |
|                                      |                                  | }                                  |
| 6a7c15c9-462e-4551-9e93-f389cf63918a | 2022-02-27 16:39:28.155024+00:00 | {                                  |
|                                      |                                  |     "first_name": "Ernie",         |
|                                      |                                  |     "location": "Brooklyn",        |
|                                      |                                  |     "status": "Looking for treats" |
|                                      |                                  | }                                  |
+--------------------------------------+----------------------------------+------------------------------------+
~~~

### Retrieve a specific field from `JSONB` data

To retrieve a specific field from `JSONB` data, use the `->` operator. For example, retrieve a field from the table you created in [Create a table with a `JSONB` column](#create-a-table-with-a-jsonb-column), run:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT user_profile->'first_name',user_profile->'location' FROM users;
~~~

~~~
+----------------------------+--------------------------+
| user_profile->'first_name' | user_profile->'location' |
+----------------------------+--------------------------+
| "Lola"                     | "NYC"                    |
| "Ernie"                    | "Brooklyn"               |
+----------------------------+--------------------------+
~~~

Use the `->>` operator to return `JSONB` fields as `STRING` values:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT user_profile->>'first_name', user_profile->>'location' FROM users;
~~~
~~~
+-----------------------------+---------------------------+
| user_profile->>'first_name' | user_profile->>'location' |
+-----------------------------+---------------------------+
| Lola                        | NYC                       |
| Ernie                       | Brooklyn                  |
+-----------------------------+---------------------------+
~~~

Use the `@>` operator to filter the values in a field in a `JSONB` column:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT user_profile->'first_name', user_profile->'location' FROM users WHERE user_profile @> '{"location":"NYC"}';
~~~
~~~
+-----------------------------+---------------------------+
| user_profile->>'first_name' | user_profile->>'location' |
+-----------------------------+---------------------------+
| Lola                        | NYC                       |
+-----------------------------+---------------------------+
~~~

Use the `#>>` operator with a path to return all first names:

{% include_cached copy-clipboard.html %}
~~~ sql
select user_profile#>>'{first_name}' as "first name" from users;
~~~

~~~
  first name
--------------
  Lola
  Ernie
(2 rows)
~~~

### Retrieve the distinct keys from a `JSONB` field

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT DISTINCT jsonb_object_keys(user_profile) AS keys FROM users;
~~~

~~~
     keys
--------------
  first_name
  friends
  last_name
  location
  online
  status
(6 rows)
~~~

### Retrieve key-value pairs from a `JSONB` field

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_each(user_profile) AS pairs FROM users;
~~~

~~~
                pairs
-------------------------------------
  (first_name,"""Lola""")
  (friends,547)
  (last_name,"""Dog""")
  (location,"""NYC""")
  (online,true)
  (first_name,"""Ernie""")
  (location,"""Brooklyn""")
  (status,"""Looking for treats""")
(8 rows)
~~~

### Group and order `JSONB` values

To organize your `JSONB` field values, use the `GROUP BY` and `ORDER BY` clauses with the `->>` operator. For example, organize the `first_name` values from the table you created in the [first example](#create-a-table-with-a-jsonb-column):

For this example, we will add a few more records to the existing table. This will help us see clearly how the data is grouped.

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO users (user_profile) VALUES
    ('{"first_name": "Lola", "last_name": "Kim", "location": "Seoul", "online": false, "friends": 600}'),
    ('{"first_name": "Parvati", "last_name": "Patil", "location": "London", "online": false, "friends": 500}');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT user_profile->>'first_name' AS first_name, user_profile->>'location' AS location FROM users;
~~~

~~~
  first_name | location
-------------+-----------
  Ernie      | Brooklyn
  Lola       | NYC
  Parvati    | London
  Lola       | Seoul
~~~

Group and order the data.

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT user_profile->>'first_name' first_name, count(*) total FROM users group by user_profile->>'first_name' order by total;
~~~

~~~
  first_name | total
-------------+-------
  Ernie      | 1
  Parvati    | 1
  Lola       | 2
~~~

The `->>` operator returns `STRING` and uses string comparison rules to order the data. If you want numeric ordering, [cast the resulting data](#supported-casting-and-conversion) to `FLOAT`.

### Map a `JSONB` array field into rows

To map a `JSONB` array field into rows, use the `jsonb_array_elements` function:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE commodity (id varchar(10), data jsonb);
INSERT INTO commodity (id, data) values ('silver', '{"prices" : [ { "05/01/2022" : 100.5 } , { "06/01/2022" : 101.5 } ]}');
INSERT INTO commodity (id, data) values ('gold', '{"prices" : [ { "05/01/2022" : 200.5 } , { "06/01/2022" : 211.5 } ]}');
SELECT * FROM commodity;
~~~

~~~
    id   |                            data
---------+-------------------------------------------------------------
  silver | {"prices": [{"05/01/2022": 100.5}, {"06/01/2022": 101.5}]}
  gold   | {"prices": [{"05/01/2022": 200.5}, {"06/01/2022": 211.5}]}
(2 rows)

~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT id, jsonb_array_elements(commodity.data->'prices') FROM commodity;
~~~

~~~
    id   | jsonb_array_elements
---------+------------------------
  silver | {"05/01/2022": 100.5}
  silver | {"06/01/2022": 101.5}
  gold   | {"05/01/2022": 200.5}
  gold   | {"06/01/2022": 211.5}
(4 rows)
~~~

### Access nested `JSONB` fields

To display the commodity prices for May, run:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT id AS commodity, data->'prices'->0->'05/01/2022' AS "May prices" from commodity;
~~~

~~~
  commodity | May prices
------------+-------------
  silver    |      100.5
  gold      |      200.5
(2 rows)
~~~

### Update an array element

To update a field value, use the `jsonb_set` function. For example, to update the price of `silver` on `06/01/2022` to `90.5`, run:

{% include_cached copy-clipboard.html %}
~~~ sql
UPDATE commodity SET data = jsonb_set(data, '{prices, 1, "06/01/2022"}', '90.5') where id = 'silver';
UPDATE 1
~~~

~~~ sql
SELECT * FROM commodity;
~~~

~~~
    id   |                            data
---------+-------------------------------------------------------------
  silver | {"prices": [{"05/01/2022": 100.5}, {"06/01/2022": 90.5}]}
  gold   | {"prices": [{"05/01/2022": 200.5}, {"06/01/2022": 211.5}]}
(2 rows)
~~~

### Create a table with a `JSONB` column and a computed column

{% include {{ page.version.version }}/computed-columns/jsonb.md %}

### Create a table with a `JSONB` column and a virtual computed column

{% include {{ page.version.version }}/computed-columns/virtual.md %}

## Supported casting and conversion

This section describes how to cast and convert `JSONB` values.

You can [cast](data-types.html#data-type-conversions-and-casts) all `JSONB` values to the following data type:

- [`STRING`](string.html)

You can cast numeric `JSONB` values to the following numeric data types:

- [`DECIMAL`](decimal.html)
- [`FLOAT`](float.html)
- [`INT`](int.html)

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT '100'::JSONB::INT;
~~~

~~~
  int8
--------
   100
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT '100000'::JSONB::FLOAT;
~~~

~~~
  float8
----------
  100000
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT '100.50'::JSONB::DECIMAL;
~~~

~~~
  numeric
-----------
   100.50
(1 row)
~~~

You use the [`parse_timestamp` function](functions-and-operators.html) to parse strings in `TIMESTAMP` format.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT parse_timestamp ('2022-05-28T10:53:25.160Z');
~~~

~~~
      parse_timestamp
--------------------------
2022-05-28 10:53:25.16
(1 row)
~~~

You can use the `parse_timestamp` function to retrieve string representations of timestamp data within `JSONB` columns in `TIMESTAMP` format.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE events (
  raw JSONB,
  event_created TIMESTAMP AS (parse_timestamp(raw->'event'->>'created')) VIRTUAL
);
INSERT INTO events (raw) VALUES ('{"event":{"created":"2022-05-28T10:53:25.160Z"}}');
SELECT event_created FROM events;
~~~

~~~
CREATE TABLE

INSERT 1

      event_created
--------------------------
  2022-05-28 10:53:25.16
(1 row)
~~~

## See also

- [JSON tutorial](demo-json-support.html)
- [GIN Indexes](inverted-indexes.html)
- [Use an expression to index a field in a JSONB column](expression-indexes.html#use-an-expression-to-index-a-field-in-a-jsonb-column)
- [Computed Columns](computed-columns.html)
- [Data Types](data-types.html)
- [Functions and Operators](functions-and-operators.html)
