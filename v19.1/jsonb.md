---
title: JSONB
summary: The JSONB data type stores JSON (JavaScript Object Notation) data.
toc: true
---

The `JSONB` [data type](data-types.html) stores JSON (JavaScript Object Notation) data as a binary representation of the `JSONB` value, which eliminates whitespace, duplicate keys, and key ordering. `JSONB` supports [inverted indexes](inverted-indexes.html).

{{site.data.alerts.callout_success}}For a hands-on demonstration of storing and querying JSON data from a third-party API, see the <a href="demo-json-support.html">JSON tutorial</a>.{{site.data.alerts.end}}


## Alias

In CockroachDB, `JSON` is an alias for `JSONB`.

{{site.data.alerts.callout_info}}In PostgreSQL, <code>JSONB</code> and <code>JSON</code> are two different data types. In CockroachDB, the <code>JSONB</code> / <code>JSON</code> data type is similar in behavior to the <a href="https://www.postgresql.org/docs/current/static/datatype-json.html"><code>JSONB</code> data type in PostgreSQL</a>.
{{site.data.alerts.end}}

## Considerations

- The [primary key](primary-key.html), [foreign key](foreign-key.html), and [unique](unique.html) [constraints](constraints.html) cannot be used on `JSONB` values.
- A standard [index](indexes.html) cannot be created on a `JSONB` column; you must use an [inverted index](inverted-indexes.html).

## Syntax

The syntax for the `JSONB` data type follows the format specified in [RFC8259](https://tools.ietf.org/html/rfc8259). A constant value of type `JSONB` can be expressed using an
[interpreted literal](sql-constants.html#interpreted-literals) or a
string literal
[annotated with](scalar-expressions.html#explicitly-typed-expressions)
type `JSONB`.

There are six types of `JSONB` values:

- `null`
- Boolean
- String
- Number (i.e., [`decimal`](decimal.html), **not** the standard `int64`)
- Array (i.e., an ordered sequence of `JSONB` values)
- Object (i.e., a mapping from strings to `JSONB` values)

Examples:

- `'{"type": "account creation", "username": "harvestboy93"}'`
- `'{"first_name": "Ernie", "status": "Looking for treats", "location" : "Brooklyn"}'`

{{site.data.alerts.callout_info}}If duplicate keys are included in the input, only the last value is kept.{{site.data.alerts.end}}

## Size

The size of a `JSONB` value is variable, but it's recommended to keep values under 1 MB to ensure performance. Above that threshold, [write amplification](https://en.wikipedia.org/wiki/Write_amplification) and other considerations may cause significant performance degradation.

## `JSONB` Functions

Function | Description | Example |
---------|-------------|---------|
`jsonb_array_elements(<jsonb>)` | Expands a `JSONB` array to a set of `JSONB` values. | `SELECT jsonb_array_elements('[1,true, 2,false]');`
`jsonb_build_object(<any_element>...)` | Builds a `JSONB` object out of a variadic argument list that alternates between keys and values. | `SELECT json_build_object('Zoo',1,'Enter',2);`
`jsonb_each(<jsonb>)` | Expands the outermost `JSONB` object into a set of key-value pairs. | `SELECT * from json_each('{"a":"Apple", "b":"ball"}');`
`jsonb_object_keys(<jsonb>)` | Returns sorted set of keys in the outermost `JSONB` object. | `SELECT * from jsonb_object_keys('{"fb1":"abc123","fb2":{"fb3":"ant", "f4":"ball"}}');`
`jsonb_pretty(<jsonb>)` | Returns the given `JSONB` value as a `STRING` indented and with newlines. | See the [example](#retrieve-formatted-jsonb-data) below.

For the full list of supported `JSONB` functions, see [Functions and Operators](functions-and-operators.html#jsonb-functions).

## `JSONB` Operators

Operator | Description | Example |
---------|-------------|---------|
`->` | Access a `JSONB` field, returning a `JSONB` value. | `SELECT '[{"foo":"bar"}]'::JSONB->0->'foo' = '"bar"'::JSONB;`
`->>` | Access a `JSONB` field, returning a string. | `SELECT '{"foo":"bar"}'::JSONB->>'foo' = 'bar'::STRING;`
`@>` | Tests whether the left `JSONB` field contains the right `JSONB` field. | `SELECT ('{"foo": {"baz": 3}, "bar": 2}'::JSONB @> '{"foo": {"baz":3}}'::JSONB ) = true;`

For the full list of supported `JSONB` operators, see [Functions and Operators](functions-and-operators.html).

## Examples

### Create a Table with a `JSONB` Column

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE users (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    last_updated TIMESTAMP DEFAULT now(),
    user_profile JSONB
  );
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM users;
~~~

~~~
+--------------+-----------+-------------+-------------------+-----------------------+-------------+
| column_name  | data_type | is_nullable |  column_default   | generation_expression |   indices   |
+--------------+-----------+-------------+-------------------+-----------------------+-------------+
| profile_id   | UUID      |    false    | gen_random_uuid() |                       | {"primary"} |
| last_updated | TIMESTAMP |    true     | now()             |                       | {}          |
| user_profile | JSON      |    true     | NULL              |                       | {}          |
+--------------+-----------+-------------+-------------------+-----------------------+-------------+
(3 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO users (user_profile) VALUES
    ('{"first_name": "Lola", "last_name": "Dog", "location": "NYC", "online" : true, "friends" : 547}'),
    ('{"first_name": "Ernie", "status": "Looking for treats", "location" : "Brooklyn"}');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM users;
~~~
~~~
+--------------------------------------+----------------------------------+--------------------------------------------------------------------------+
|              profile_id              |           last_updated           |                               user_profile                               |
+--------------------------------------+----------------------------------+--------------------------------------------------------------------------+
| 33c0a5d8-b93a-4161-a294-6121ee1ade93 | 2018-02-27 16:39:28.155024+00:00 | {"first_name": "Lola", "friends": 547, "last_name": "Dog", "location":   |
|                                      |                                  | "NYC", "online": true}                                                   |
| 6a7c15c9-462e-4551-9e93-f389cf63918a | 2018-02-27 16:39:28.155024+00:00 | {"first_name": "Ernie", "location": "Brooklyn", "status": "Looking for   |
|                                      |                                  | treats"}                                                                 |
+--------------------------------------+----------------------------------+--------------------------------------------------------------------------+
~~~

### Retrieve formatted `JSONB` data

To retrieve `JSONB` data with easier-to-read formatting, use the `jsonb_pretty()` function. For example, retrieve data from the table you created in the [first example](#create-a-table-with-a-jsonb-column):

{% include copy-clipboard.html %}
~~~ sql
> SELECT profile_id, last_updated, jsonb_pretty(user_profile) FROM users;
~~~
~~~
+--------------------------------------+----------------------------------+------------------------------------+
|              profile_id              |           last_updated           |            jsonb_pretty            |
+--------------------------------------+----------------------------------+------------------------------------+
| 33c0a5d8-b93a-4161-a294-6121ee1ade93 | 2018-02-27 16:39:28.155024+00:00 | {                                  |
|                                      |                                  |     "first_name": "Lola",          |
|                                      |                                  |     "friends": 547,                |
|                                      |                                  |     "last_name": "Dog",            |
|                                      |                                  |     "location": "NYC",             |
|                                      |                                  |     "online": true                 |
|                                      |                                  | }                                  |
| 6a7c15c9-462e-4551-9e93-f389cf63918a | 2018-02-27 16:39:28.155024+00:00 | {                                  |
|                                      |                                  |     "first_name": "Ernie",         |
|                                      |                                  |     "location": "Brooklyn",        |
|                                      |                                  |     "status": "Looking for treats" |
|                                      |                                  | }                                  |
+--------------------------------------+----------------------------------+------------------------------------+
~~~

### Retrieve specific fields from a `JSONB` value

To retrieve a specific field from a `JSONB` value, use the `->` operator. For example, retrieve a field from the table you created in the [first example](#create-a-table-with-a-jsonb-column):

{% include copy-clipboard.html %}
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

You can also use the `->>` operator to return `JSONB` field values as `STRING` values:

{% include copy-clipboard.html %}
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

For the full list of functions and operators we support, see [Functions and Operators](functions-and-operators.html).

### Create a table with a `JSONB` column and a computed column

{% include {{ page.version.version }}/computed-columns/jsonb.md %}

## Supported casting and conversion

`JSONB` values can be [cast](data-types.html#data-type-conversions-and-casts) to the following data type:

- `STRING`

## See also

- [JSON tutorial](demo-json-support.html)
- [Inverted Indexes](inverted-indexes.html)
- [Computed Columns](computed-columns.html)
- [Data Types](data-types.html)
- [Functions and Operators](functions-and-operators.html)
