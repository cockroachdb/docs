---
title: Expression Indexes
summary: Expression indexes apply a scalar or functional expression to one or more columns.
toc: true
---

<span class="version-tag">New in v21.2</span>

An _expression index_ is an index created by applying an [expression](scalar-expressions.html) to a column. For example, to facilitate fast, case insensitive lookups of user names you could create an index by applying the function `lower` to the `name` column: `CREATE INDEX users_name_idx ON users (lower(name))`. The value of the expression is stored only in the expression index, not in the primary family index.

Both [standard indexes](create-index.html) and [inverted indexes](inverted-indexes.html) support expressions. You can use expressions in [unique indexes](create-index.html#unique-indexes) and [partial indexes](partial-indexes.html).

## Create an expression index

To create an expression index, use the syntax:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE INDEX index_name ON table_name (expression(column_name));
~~~

## View index expression

To view the expression used to generate the index, run `SHOW CREATE TABLE`:

{% include_cached copy-clipboard.html %}
~~~sql
> SHOW CREATE TABLE users;
~~~

~~~
 table_name |                                  create_statement
-------------+--------------------------------------------------------------------------------------
  users      | CREATE TABLE public.users (
...
             |     INDEX users_name_idx (lower(name:::STRING) ASC),
...
             | )
(1 row)
~~~


## Examples

### Simple examples

Suppose you have a table with the following columns:
{% include_cached copy-clipboard.html %}
~~~sql
CREATE TABLE t (i INT, b BOOL, s STRING, j JSON);
~~~

The following examples illustrate how to create various types of expression indexes.

A partial, multi-column index, where one column is defined with an expression:
{% include_cached copy-clipboard.html %}
~~~sql
CREATE INDEX ON t (lower(s), b) WHERE i > 0;
~~~

A unique, partial, multi-column index, where one column is defined with an expression:
{% include_cached copy-clipboard.html %}
~~~sql
CREATE UNIQUE INDEX ON t (lower(s), b) WHERE i > 0;
~~~

An inverted, partial, multi-column index, where one column is defined with an expression:
{% include_cached copy-clipboard.html %}
~~~sql
CREATE INVERTED INDEX ON t (lower(s), i, j) WHERE b;
~~~

### Use an expression to index a field in a `JSONB` column

You can use an [expression](expression-indexes.html) in an index definition to index a field in a JSON column. You can also use an expression to create an [inverted index](inverted-indexes.html) on a subset of the JSON column.

The following example creates a table of users with a JSON object in `user_profile` column and then an index on the `birthdate` field in that column:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE TABLE users (
  profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_updated TIMESTAMP DEFAULT now(),
  user_profile JSONB
);

INSERT INTO users (user_profile) VALUES
  ('{"id": "d78236", "firstName": "Arthur", "lastName": "Read", "birthdate": "2010-01-25", "school": "PVPHS", "credits": 120, "sports": ["none"], "clubs": ["Robotics"]}'),
  ('{"id": "f98112", "firstName": "Buster", "lastName": "Bunny", "birthdate": "2011-11-07",  "school": "THS", "credits": 67, "sports": ["Gymnastics"], "clubs": ["Theater"]}'),
  ('{"id": "t63512", "firstName": "Jane", "lastName": "Narayan", "birthdate": "2012-12-12", "school" : "Brooklyn Tech", "credits": 98, "sports": ["Track and Field"], "clubs": ["Chess"]}');

CREATE INDEX timestamp_idx ON users (parse_timestamp(user_profile->>'birthdate'));
~~~

To query for a specific birthdate, run the following:

{% include_cached copy-clipboard.html %}
~~~sql
> SELECT jsonb_pretty(user_profile) FROM users@timestamp_idx WHERE user_profile->'birthdate' = '"2011-11-07"';
~~~

~~~
           jsonb_pretty
----------------------------------
  {
      "birthdate": "2011-11-07",
      "clubs": [
          "Theater"
      ],
      "credits": 67,
      "firstName": "Buster",
      "id": "f98112",
      "lastName": "Bunny",
      "school": "THS",
      "sports": [
          "Gymnastics"
      ]
  }
(1 row)
~~~


## Known limitations

Expression indexes have the following limitations:

- The expression cannot reference columns outside the index's table.
- The expression cannot reference [computed columns](computed-columns.html). [Tracking issue](https://github.com/cockroachdb/cockroach/issues/67900)
- Functional expression output must be determined by the input arguments. For example, you can't use the function `now()` to create an index because its output depends on more than just the function arguments.


## See also

- [Computed Columns](computed-columns.html)
- [`CREATE INDEX`](create-index.html)
- [`DROP INDEX`](drop-index.html)
- [`RENAME INDEX`](rename-index.html)
- [`SHOW INDEX`](show-index.html)
- [Indexes](indexes.html)
- [SQL Statements](sql-statements.html)
