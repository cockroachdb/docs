---
title: Inverted Indexes
summary: Inverted indexes improve your database's performance and usefulness by helping SQL locate schemaless data.
toc: false
toc_not_nested: true
---

<span class="version-tag">New in v2.0:</span> Inverted indexes improve your database's performance by helping SQL locate schemaless data (i.e., [`JSONB`](jsonb.html)).

<div id="toc"></div>

## How Do Inverted Indexes Work?

Standard [indexes](indexes.html) work well for searches based on prefixes of sorted data. However, schemaless data like `JSONB` cannot be queried without a full table scan, since it does not adhere to ordinary value prefix comparison operators. `JSONB` needs to be indexed in a more detailed way than what a standard index provides. This is where inverted indexes prove useful.

Inverted indexes filter on components of tokenizable data. The `JSONB` data type is tokenized by key-value pairs.

For example, take the following `JSONB` value in column `person`:

~~~ json
{
  "firstName": "John",
  "lastName": "Smith",
  "age": 25,
  "address": {
    "state": "NY",
    "postalCode": "10021"
  }
  "cars": [“Subaru”,
     “Honda”]
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

This allows us to search based on subcomponents.

### Creation

You can use inverted indexes to improve the performance of queries using `JSONB` columns. You can create them:

- At the same time as the table with the `INVERTED INDEX` clause of [`CREATE TABLE`](create-table.html#create-a-table-with-secondary-and-inverted-indexes-new-in-v2-0).
- For existing tables with [`CREATE INVERTED INDEX`](create-index.html).
- Using the following PostgreSQL-compatible syntax:

   ~~~ sql
   > CREATE INDEX <optional name> ON <table> USING GIN(<column> jsonb_path_ops);
   ~~~

### Selection

If a query contains a constraint against an indexed `JSONB` column that uses any of the supported operators, the inverted index is added to the set of index candidates.

Because each query can use only a single index, CockroachDB selects the index it calculates will scan the fewest rows (i.e., the fastest). For more detail, check out our blog post [Index Selection in CockroachDB](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/).

To override CockroachDB's index selection, you can also force [queries to use a specific index](select.html#force-index-selection-index-hints) (also known as "index hinting").

### Storage

CockroachDB stores indexes directly in your key-value store. You can find more information in our blog post [Mapping Table Data to Key-Value Storage](https://www.cockroachlabs.com/blog/sql-in-cockroachdb-mapping-table-data-to-key-value-storage/).

### Locking

Tables are not locked during index creation thanks to CockroachDB's [schema change procedure](https://www.cockroachlabs.com/blog/how-online-schema-changes-are-possible-in-cockroachdb/).

### Performance

Indexes create a trade-off: they greatly improve the speed of queries, but slightly slow down writes (because new values have to be copied and sorted). The first index you create has the largest impact, but additional indexes only introduce marginal overhead.

## Example

Let's see how an inverted index can optimize the performance of a query on a `JSONB` column.

First, create a table and add some data:

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
> INSERT INTO users (user_profile) VALUES
    ('{"first_name": "Lola", "last_name": "Dog", "location": "NYC", "online" : true, "friends" : 547}'),
    ('{"first_name": "Ernie", "status": "Looking for treats", "location" : "Brooklyn"}'),
    ('{"first_name": "Carl", "last_name": "Kimball", "location": "NYC", "breed": "Boston Terrier"}'
  );
~~~

Now, let's run a query:

{% include copy-clipboard.html %}
~~~ sql
SELECT * FROM users where user_profile @> '{"location":"NYC"}';
~~~
~~~
+--------------------------------------+----------------------------------+--------------------------------------------------------------------------+
|              profile_id              |           last_updated           |                               user_profile                               |
+--------------------------------------+----------------------------------+--------------------------------------------------------------------------+
| 079e4836-3571-4126-9632-3abc1358c226 | 2018-03-07 17:52:39.469827+00:00 | {"first_name": "Lola", "friends": 547, "last_name": "Dog", "location":   |
|                                      |                                  | "NYC", "online": true}                                                   |
| 3a34e39f-4d32-4716-bbf1-9a50bb30b391 | 2018-03-07 17:52:39.469827+00:00 | {"breed": "Boston Terrier", "first_name": "Carl", "last_name":           |
|                                      |                                  | "Kimball", "location": "NYC"}                                            |
+--------------------------------------+----------------------------------+--------------------------------------------------------------------------+
(2 rows)

Time: 11.406928ms
~~~

The query took 11.406928ms. An inverted index will optimize the performance. Let's create an inverted index:

{% include copy-clipboard.html %}
~~~ sql
CREATE INVERTED INDEX user_details ON users(user_profile);
~~~

Now, run the query again:

{% include copy-clipboard.html %}
~~~ sql
SELECT * FROM users where user_profile @> '{"location":"NYC"}';
~~~
~~~
+--------------------------------------+----------------------------------+--------------------------------------------------------------------------+
|              profile_id              |           last_updated           |                               user_profile                               |
+--------------------------------------+----------------------------------+--------------------------------------------------------------------------+
| 079e4836-3571-4126-9632-3abc1358c226 | 2018-03-07 17:52:39.469827+00:00 | {"first_name": "Lola", "friends": 547, "last_name": "Dog", "location":   |
|                                      |                                  | "NYC", "online": true}                                                   |
| 3a34e39f-4d32-4716-bbf1-9a50bb30b391 | 2018-03-07 17:52:39.469827+00:00 | {"breed": "Boston Terrier", "first_name": "Carl", "last_name":           |
|                                      |                                  | "Kimball", "location": "NYC"}                                            |
+--------------------------------------+----------------------------------+--------------------------------------------------------------------------+
(2 rows)

Time: 2.536174ms
~~~

After creating the inverted index, the query now takes 2.536174ms.

## See Also

- [`CREATE INDEX`](create-index.html)
- [`DROP INDEX`](drop-index.html)
- [`RENAME INDEX`](rename-index.html)
- [`SHOW INDEX`](show-index.html)
- [Indexes](indexes.html)
- [SQL Statements](sql-statements.html)
