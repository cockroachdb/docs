---
title: Inverted Indexes
summary: Inverted indexes improve your database's performance and usefulness by helping SQL locate schemaless data in a JSONB column.
toc: true
---

Inverted indexes improve your database's performance by helping SQL locate the schemaless data in a [`JSONB`](jsonb.html) column.

{{site.data.alerts.callout_success}}For a hands-on demonstration of using an inverted index to improve query performance on a <code>JSONB</code> column, see the <a href="demo-json-support.html">JSON tutorial</a>.{{site.data.alerts.end}}


## How do inverted indexes work?

Standard [indexes](indexes.html) work well for searches based on prefixes of sorted data. However, schemaless data like [`JSONB`](jsonb.html) cannot be queried without a full table scan, since it does not adhere to ordinary value prefix comparison operators. `JSONB` needs to be indexed in a more detailed way than what a standard index provides. This is where inverted indexes prove useful.

Inverted indexes filter on components of tokenizable data. The `JSONB` data type is built on two structures that can be tokenized:

- **Objects** - Collections of key-value pairs where each key-value pair is a token.
- **Arrays** - Ordered lists of values where every value in the array is a token.

For example, take the following `JSONB` value in column `person`:

~~~ json
{
  "firstName": "John",
  "lastName": "Smith",
  "age": 25,
  "address": {
    "state": "NY",
    "postalCode": "10021"
  },
  "cars": [
    "Subaru",
    "Honda"
  ]
}
~~~

An inverted index for this object would have an entry per component, mapping it back to the original object:

~~~
"firstName": "John"
"lastName": "Smith"
"age": 25
"address": "state": "NY"
"address": "postalCode": "10021"
"cars" : "Subaru"
"cars" : "Honda"
~~~

This lets you to search based on subcomponents.

### Creation

You can use inverted indexes to improve the performance of queries using `JSONB` columns. You can create them:

- At the same time as the table with the `INVERTED INDEX` clause of [`CREATE TABLE`](create-table.html#create-a-table-with-secondary-and-inverted-indexes).
- For existing tables with [`CREATE INVERTED INDEX`](create-index.html).
- Using the following PostgreSQL-compatible syntax:

    ~~~ sql
    > CREATE INDEX <optional name> ON <table> USING GIN (<column>);
    ~~~

### Selection

If a query contains a filter against an indexed `JSONB` column that uses any of the supported operators, the inverted index is added to the set of index candidates.

Because each query can use only a single index, CockroachDB selects the index it calculates will scan the fewest rows (i.e., the fastest). For more detail, check out our blog post [Index Selection in CockroachDB](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/).

To override CockroachDB's index selection, you can also force [queries to use a specific index](table-expressions.html#force-index-selection) (also known as "index hinting").

### Storage

CockroachDB stores indexes directly in your key-value store. You can find more information in our blog post [Mapping Table Data to Key-Value Storage](https://www.cockroachlabs.com/blog/sql-in-cockroachdb-mapping-table-data-to-key-value-storage/).

### Locking

Tables are not locked during index creation thanks to CockroachDB's [schema change procedure](https://www.cockroachlabs.com/blog/how-online-schema-changes-are-possible-in-cockroachdb/).

### Performance

Indexes create a trade-off: they greatly improve the speed of queries, but slightly slow down writes (because new values have to be copied and sorted). The first index you create has the largest impact, but additional indexes only introduce marginal overhead.

### Comparisons
Currently, inverted indexes only support equality comparisons using the `=` operator. If you require comparisons using `>`, `<=`, etc., you can create an index on a computed column using your JSON payload, and then create a regular index on that. So if you wanted to write a query where the value of "foo" is greater than three, you would:

1. Create your table with a computed column: 

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE test (
        id INT, 
        data JSONB, 
        foo INT AS ((data->>'foo')::INT) STORED
        );
    ~~~

2. Create an index on your computed column: 

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE INDEX test_idx ON test (foo);
    ~~~

3. Execute your query with your comparison: 

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM test where foo > 3;
    ~~~

## Example

In this example, let's create a table with a `JSONB` column and an inverted index:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE users (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    last_updated TIMESTAMP DEFAULT now(),
    user_profile JSONB,
    INVERTED INDEX user_details (user_profile)
  );
~~~

Then, insert a few rows a data:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO users (user_profile) VALUES
    ('{"first_name": "Lola", "last_name": "Dog", "location": "NYC", "online" : true, "friends" : 547}'),
    ('{"first_name": "Ernie", "status": "Looking for treats", "location" : "Brooklyn"}'),
    ('{"first_name": "Carl", "last_name": "Kimball", "location": "NYC", "breed": "Boston Terrier"}'
  );
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT *, jsonb_pretty(user_profile) FROM users;
~~~
~~~
+--------------------------------------+----------------------------------+--------------------------------------------------------------------------+------------------------------------+
|              profile_id              |           last_updated           |                               user_profile                               |            jsonb_pretty            |
+--------------------------------------+----------------------------------+--------------------------------------------------------------------------+------------------------------------+
| 81330a51-80b2-44aa-b793-1b8d84ba69c9 | 2018-03-13 18:26:24.521541+00:00 | {"breed": "Boston Terrier", "first_name": "Carl", "last_name":           | {                                  |
|                                      |                                  | "Kimball", "location": "NYC"}                                            |                                    |
|                                      |                                  |                                                                          |     "breed": "Boston Terrier",     |
|                                      |                                  |                                                                          |     "first_name": "Carl",          |
|                                      |                                  |                                                                          |     "last_name": "Kimball",        |
|                                      |                                  |                                                                          |     "location": "NYC"              |
|                                      |                                  |                                                                          | }                                  |
| 81c87adc-a49c-4bed-a59c-3ac417756d09 | 2018-03-13 18:26:24.521541+00:00 | {"first_name": "Ernie", "location": "Brooklyn", "status": "Looking for   | {                                  |
|                                      |                                  | treats"}                                                                 |                                    |
|                                      |                                  |                                                                          |     "first_name": "Ernie",         |
|                                      |                                  |                                                                          |     "location": "Brooklyn",        |
|                                      |                                  |                                                                          |     "status": "Looking for treats" |
|                                      |                                  |                                                                          | }                                  |
| ec0a4942-b0aa-4a04-80ae-591b3f57721e | 2018-03-13 18:26:24.521541+00:00 | {"first_name": "Lola", "friends": 547, "last_name": "Dog", "location":   | {                                  |
|                                      |                                  | "NYC", "online": true}                                                   |                                    |
|                                      |                                  |                                                                          |     "first_name": "Lola",          |
|                                      |                                  |                                                                          |     "friends": 547,                |
|                                      |                                  |                                                                          |     "last_name": "Dog",            |
|                                      |                                  |                                                                          |     "location": "NYC",             |
|                                      |                                  |                                                                          |     "online": true                 |
|                                      |                                  |                                                                          | }                                  |
+--------------------------------------+----------------------------------+--------------------------------------------------------------------------+------------------------------------+
~~~

Now, run a query that filters on the `JSONB` column:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM users where user_profile @> '{"location":"NYC"}';
~~~
~~~
+--------------------------------------+----------------------------------+--------------------------------------------------------------------------+
|              profile_id              |           last_updated           |                               user_profile                               |
+--------------------------------------+----------------------------------+--------------------------------------------------------------------------+
| 81330a51-80b2-44aa-b793-1b8d84ba69c9 | 2018-03-13 18:26:24.521541+00:00 | {"breed": "Boston Terrier", "first_name": "Carl", "last_name":           |
|                                      |                                  | "Kimball", "location": "NYC"}                                            |
| ec0a4942-b0aa-4a04-80ae-591b3f57721e | 2018-03-13 18:26:24.521541+00:00 | {"first_name": "Lola", "friends": 547, "last_name": "Dog", "location":   |
|                                      |                                  | "NYC", "online": true}                                                   |
+--------------------------------------+----------------------------------+--------------------------------------------------------------------------+
(2 rows)
~~~


## See also

- [`JSONB`](jsonb.html)
- [JSON tutorial](demo-json-support.html)
- [Computed Columns](computed-columns.html)
- [`CREATE INDEX`](create-index.html)
- [`DROP INDEX`](drop-index.html)
- [`RENAME INDEX`](rename-index.html)
- [`SHOW INDEX`](show-index.html)
- [Indexes](indexes.html)
- [SQL Statements](sql-statements.html)
