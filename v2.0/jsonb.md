---
title: JSONB
summary: The JSONB data type stores JSON (JavaScript Object Notation) data.
toc: false
---

<span class="version-tag">New in v2.0:</span> The `JSONB` [data type](data-types.html) stores JSON (JavaScript Object Notation) data as a binary representation of the `JSONB` value, which eliminates whitespace, duplicate keys, and key ordering. JSONB supports inverted indexing.

<!--To Do:
- This is a good opportunity to communicate how useful this feature is.
- Docs will leverage blog content for this (Andy to draft in early March) -->

<div id="toc"></div>

## Alias

In CockroachDB, the `JSON` is an alias for `JSONB`.

## Considerations

- The [primary key](primary-key.html) and [unique](unique.html) [constraints](constraints.html) cannot be used on `JSONB` values.
- A standard [index](indexes.html) cannot be created on a `JSONB` column; you must use an inverted index.

## Syntax

The syntax for the `JSONB` data type follows the format specified in [RFC8259](https://tools.ietf.org/html/rfc8259). A constant value of type `JSONB` can be expressed using an
[interpreted literal](sql-constants.html#interpreted-literals) or a
string literal
[annotated with](sql-expressions.html#explicitly-typed-expressions)
type `JSONB`.

There are seven types of `JSONB` values:

- `true`
- `false`
-  `null`
- Strings
- Numbers (i.e., [`decimal`](decimal))
- Arrays (i.e., an ordered sequence of `JSONB` values)
- Objects (i.e., a mapping from strings to `JSONB` values)

Examples:

- `'{"type": "account creation", "username": "harvestboy93"}'`
- `'{"first_name": "Ernie", "status": "Looking for treats", "location" : "Brooklyn"}'`

{{site.data.alerts.callout_info}}If duplicate keys are included in the input, only the last value is kept.{{site.data.alerts.end}}

## Size

The size of a `JSONB` value is variable, but it's recommended to keep values under 1 MB to ensure performance. Above that threshold, [write amplification](https://en.wikipedia.org/wiki/Write_amplification) and other considerations may cause significant performance degradation.

## Example

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
+--------------+-----------+-------+-------------------+-------------+
|    Field     |   Type    | Null  |      Default      |   Indices   |
+--------------+-----------+-------+-------------------+-------------+
| profile_id   | UUID      | false | gen_random_uuid() | {"primary"} |
| last_updated | TIMESTAMP | true  | now()             | {}          |
| user_profile | JSON      | true  | NULL              | {}          |
+--------------+-----------+-------+-------------------+-------------+
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO users (user_profile) VALUES
    ('{"first_name": "Lola", "last_name": "Dog", "location": "NYC", "online" : true, "friends" : 547}'),
    ('{"first_name": "Ernie", "status": "Looking for treats", "location" : "Brooklyn"}'
  );
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM users;
~~~
~~~
+--------------------------------------+----------------------------------+--------------------------------------------------------------------------------------+
|              profile_id              |           last_updated           |                                     user_profile                                     |
+--------------------------------------+----------------------------------+--------------------------------------------------------------------------------------+
| 59d6fbd5-71d7-4a3d-af8c-ecb95cd56146 | 2018-02-21 18:13:45.997355+00:00 | {"first_name":"Ernie","location":"Brooklyn","status":"Looking for treats"}           |
| de672e78-a20c-49f6-ac7a-64b4b7c802c5 | 2018-02-21 18:13:45.997355+00:00 | {"first_name":"Lola","friends":547,"last_name":"Dog","location":"NYC","online":true} |
+--------------------------------------+----------------------------------+--------------------------------------------------------------------------------------+
~~~

## Supported Casting & Conversion

`JSONB` values can be [cast](data-types.html#data-type-conversions-casts) to the following data type:

- `STRING`

## See Also

- [Data Types](data-types.html)

<!-- - [`JSONB` Tutorials]()
- [Inverted Indexes]() -->
