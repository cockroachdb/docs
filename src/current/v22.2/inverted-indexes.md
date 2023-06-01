---
title: Generalized Inverted Indexes
summary: Generalized inverted indexes (GIN) improve your database's performance and usefulness by helping SQL locate data in JSONB or ARRAY columns.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
docs_area: develop
---

Generalized inverted indexes, or GIN indexes, store mappings from values within a container column (such as a [`JSONB`](jsonb.html) document) to the row that holds that value. They are used to speed up containment searches, e.g., "show me all of the rows from this table which have a JSON column that contains the key-value pair `{"location":"NYC"}`". GIN indexes are commonly used in [document retrieval systems](https://en.wikipedia.org/wiki/Document_retrieval).

CockroachDB stores the contents of the following data types in GIN indexes:

- [JSONB](jsonb.html)
- [Arrays](array.html)
- [Spatial data (`GEOMETRY` and `GEOGRAPHY` types)](spatial-indexes.html)
- [Strings (using trigram indexes)](trigram-indexes.html)

{{site.data.alerts.callout_success}}For a hands-on demonstration of using GIN indexes to improve query performance on a <code>JSONB</code> column, see the <a href="demo-json-support.html">JSON tutorial</a>.{{site.data.alerts.end}}

## How do GIN indexes work?

Standard [indexes](indexes.html) work well for searches based on prefixes of sorted data. However, data types like [`JSONB`](jsonb.html) or [arrays](array.html) cannot be queried without a full table scan, since they do not adhere to ordinary value prefix comparison operators. `JSONB` in particular needs to be indexed in a more detailed way than what a standard index provides. This is where GIN indexes prove useful.

GIN indexes filter on components of tokenizable data. The `JSONB` data type is built on two structures that can be tokenized:

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

A GIN index for this object would have an entry per component, mapping it back to the original object:

~~~
"firstName": "John"
"lastName": "Smith"
"age": 25
"address": "state": "NY"
"address": "postalCode": "10021"
"cars" : "Subaru"
"cars" : "Honda"
~~~

This lets you search based on subcomponents.

### Creation

You can use GIN indexes to improve the performance of queries using `JSONB` or `ARRAY` columns. You can create them:

- Using the PostgreSQL-compatible syntax [`CREATE INDEX ... USING GIN`](create-index.html):

    ~~~ sql
    CREATE INDEX {optional name} ON {table} USING GIN ({column});
    ~~~

    You can also specify the `jsonb_ops` or `array_ops` opclass (for `JSONB` and `ARRAY` columns, respectively) using the syntax:

    ~~~ sql
    CREATE INDEX {optional name} ON {table} USING GIN ({column} {opclass});
    ~~~

- While creating the table, using the syntax [`CREATE INVERTED INDEX`](create-table.html#create-a-table-with-secondary-and-gin-indexes):

    ~~~ sql
    CREATE INVERTED INDEX {optional name} ON {table} ({column});
    ~~~

### Selection

If a query contains a filter against an indexed `JSONB` or `ARRAY` column that uses any of the [supported operators](#comparisons), the GIN index is added to the set of index candidates.

In most cases CockroachDB selects the index it calculates will scan the fewest rows (i.e., the fastest). Cases where CockroachDB will use multiple indexes include certain queries that use disjunctions (i.e., predicates with `OR`), as well as [zigzag joins](cost-based-optimizer.html#zigzag-joins) for some other queries. To learn how to use the [`EXPLAIN`](explain.html) statement for your query to see which index is being used, see [Index Selection in CockroachDB](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/).

To override CockroachDB's index selection, you can also force a query to use [a specific index](table-expressions.html#force-index-selection) (also known as "index hinting") or use [an inverted join hint](cost-based-optimizer.html#supported-join-algorithms).

### Storage

CockroachDB stores indexes directly in your key-value store. You can find more information in our blog post [Mapping Table Data to Key-Value Storage](https://www.cockroachlabs.com/blog/sql-in-cockroachdb-mapping-table-data-to-key-value-storage/).

### Locking

Tables are not locked during index creation due to CockroachDB's [schema change procedure](https://www.cockroachlabs.com/blog/how-online-schema-changes-are-possible-in-cockroachdb/).

### Performance

Indexes create a trade-off: they greatly improve the speed of queries, but slightly slow down writes (because new values have to be copied and sorted). The first index you create has the largest impact, but additional indexes introduce only marginal overhead.

### Comparisons

This section describes how to perform comparisons on `JSONB` and `ARRAY` columns.

#### JSONB

GIN indexes on `JSONB` columns support the following comparison operators:

- **is contained by**: [`<@`](functions-and-operators.html#operators)
- **contains**: [`@>`](functions-and-operators.html#operators)
- **equals**: [`=`](functions-and-operators.html#operators). To use `=`, you must also reach into the JSON document with the [`->`](functions-and-operators.html#supported-operations) operator. For example:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM a WHERE j ->'foo' = '"1"';
    ~~~

    This is equivalent to using `@>`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM a WHERE j @> '{"foo": "1"}';
    ~~~

If you require comparisons using [`<`](functions-and-operators.html#operators), [`<=`](functions-and-operators.html#operators), etc., you can create an index on a [computed column](computed-columns.html) using your JSON payload, and then create a standard index on that. To write a query where the value of `foo` is greater than three:

1. Create a table with a computed column:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE test (
        id INT,
        data JSONB,
        foo INT AS ((data->>'foo')::INT) STORED
        );
    ~~~

1. Create an index on the computed column:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE INDEX test_idx ON test (foo);
    ~~~

1. Execute the query with the comparison:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM test where foo > 3;
    ~~~

#### Arrays

GIN indexes on [`ARRAY`](array.html) columns support the following comparison operators:

- **is contained by**: [`<@`](functions-and-operators.html#operators)
- **contains**: [`@>`](functions-and-operators.html#operators)

## Partial GIN indexes

You can create a [partial](partial-indexes.html) GIN index, a GIN index on a subset of `JSON`, `ARRAY`, or geospatial container column data. Just like partial indexes that use non-container data types, you create a partial GIN index by including a clause, like a `WHERE` clause, that evaluates to `true` on a boolean predicate.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE test (
  id INT,
  data JSONB,
  INVERTED INDEX idx_data(data) WHERE id > 10
);
~~~

## GIN indexes on `REGIONAL BY ROW` tables in multi-region databases

{% include {{page.version.version}}/sql/indexes-regional-by-row.md %}

For an example that uses unique indexes but applies to all indexes on `REGIONAL BY ROW` tables, see [Add a unique index to a `REGIONAL BY ROW` table](alter-table.html#add-a-unique-index-to-a-regional-by-row-table).

## Multi-column GIN indexes

You can create a GIN index with multiple columns. The last indexed column must be one of the inverted types such as `JSON`, `ARRAY`, `GEOMETRY`, and `GEOGRAPHY`. All preceding columns must have types that are indexable. These indexes may be used for queries that constrain all index columns.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE users (
  profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type STRING,
  user_profile JSONB,
  INVERTED INDEX (user_type, user_profile)
);
~~~

## Examples

### Create a table with GIN index on a JSONB column

In this example, let's create a table with a `JSONB` column and a GIN index:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE users (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    last_updated TIMESTAMP DEFAULT now(),
    user_profile JSONB,
    INVERTED INDEX user_details (user_profile)
  );
~~~

Then, insert a few rows of data:

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
(3 rows)
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

### Add a GIN index to a table with an array column

In this example, let's create a table with an `ARRAY` column first, and add the GIN index later:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE students (
    student_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marks INT ARRAY
  );
~~~

Insert a few rows of data:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO students (marks) VALUES
    (ARRAY[10,20,50]),
    (ARRAY[20,40,100]),
    (ARRAY[100,20,70]
  );
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM students;
~~~

~~~
+--------------------------------------+--------------+
|              student_id              |    marks     |
+--------------------------------------+--------------+
| 11cdc77c-2f12-48d4-8bb4-ddee7c705e00 | {10,20,50}   |
|                                      |              |
| 2526c746-0b32-4f6b-a2b4-7ce6d411c1c2 | {20,40,100}  |
|                                      |              |
| eefdc32e-4485-45ca-9df1-80c0f42d73c0 | {100,20,70}  |
|                                      |              |
+--------------------------------------+--------------+
(3 rows)
~~~

Now, let’s add a GIN index to the table and run a query that filters on the `ARRAY`:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INVERTED INDEX student_marks ON students (marks);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM students where marks @> ARRAY[100];
~~~

~~~
+--------------------------------------+--------------+
|              student_id              |    marks     |
+--------------------------------------+--------------+
| 2526c746-0b32-4f6b-a2b4-7ce6d411c1c2 | {20,40,100}  |
|                                      |              |
| eefdc32e-4485-45ca-9df1-80c0f42d73c0 | {100,20,70}  |
|                                      |              |
+--------------------------------------+--------------+
(2 rows)
~~~

### Create a table with a partial GIN index on a JSONB column

In the same `users` table from [Create a table with GIN index on a JSONB column](#create-a-table-with-gin-index-on-a-jsonb-column), create a partial GIN index for online users.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE INVERTED INDEX idx_online_users ON users(user_profile) WHERE user_profile -> 'online' = 'true';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM users WHERE user_profile -> 'online' = 'true';
~~~

~~~
               profile_id              |            last_updated             |                                         user_profile
---------------------------------------+-------------------------------------+------------------------------------------------------------------------------------------------
  b6df0cae-d619-4a08-ab4f-2815da7b981f | 2021-04-13 20:54:35.660734+00:00:00 | {"first_name": "Lola", "friends": 547, "last_name": "Dog", "location": "NYC", "online": true}
(1 row)
~~~

Now, use index hinting with the partial GIN index.

~~~ sql
SELECT * FROM users@idx_online_users WHERE user_profile->'online' = 'true' AND user_profile->'location' = '"NYC"';
~~~

~~~
               profile_id              |            last_updated             |                                         user_profile
---------------------------------------+-------------------------------------+------------------------------------------------------------------------------------------------
  ea1db57e-51c3-449d-b928-adab11191085 | 2021-04-14 20:45:39.960443+00:00:00 | {"first_name": "Lola", "friends": 547, "last_name": "Dog", "location": "NYC", "online": true}
(1 row)
~~~

### Create a trigram index on a STRING column

For an example showing how to create a trigram index on a [`STRING`](string.html) column, see [Trigram Indexes](trigram-indexes.html#examples).

### Inverted join examples

{% include {{ page.version.version }}/sql/inverted-joins.md %}

## See also

- [Indexes](indexes.html)
- [Trigram Indexes](trigram-indexes.html)
- [`JSONB`](jsonb.html)
- [Arrays](array.html)
- [Spatial data (`GEOMETRY` and `GEOGRAPHY` types)](spatial-indexes.html)
- [`STRING`](string.html)
- [`CREATE INDEX`](create-index.html)
- [Computed Columns](computed-columns.html)
- [SQL Statements](sql-statements.html)
