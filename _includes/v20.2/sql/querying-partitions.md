## Querying partitions

Similar to [indexes](indexes.html), partitions can improve query performance by limiting the numbers of rows that a query must scan. In the case of [geo-partitioned data](topology-geo-partitioned-replicas.html), partitioning can limit a query scan to data in a specific region.

### Filtering on an indexed column

If you filter the query of a partitioned table on a [column in the index directly following the partition prefix](indexes.html#indexing-columns), the [cost-based optimizer](cost-based-optimizer.html) creates a query plan that scans each partition in parallel, rather than performing a costly sequential scan of the entire table.

For example, suppose that the tables in the [`movr`](movr.html) database are geo-partitioned by region, and you want to query the `users` table for information about a specific user.

Here is the `CREATE TABLE` statement for the `users` table:

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
  table_name |                                  create_statement
+------------+-------------------------------------------------------------------------------------+
  users      | CREATE TABLE users (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     name VARCHAR NULL,
             |     address VARCHAR NULL,
             |     credit_card VARCHAR NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     FAMILY "primary" (id, city, name, address, credit_card)
             | ) PARTITION BY LIST (city) (
             |     PARTITION us_west VALUES IN (('seattle'), ('san francisco'), ('los angeles')),
             |     PARTITION us_east VALUES IN (('new york'), ('boston'), ('washington dc')),
             |     PARTITION europe_west VALUES IN (('amsterdam'), ('paris'), ('rome'))
             | );
             | ALTER PARTITION europe_west OF INDEX movr.public.users@primary CONFIGURE ZONE USING
             |     constraints = '[+region=europe-west1]';
             | ALTER PARTITION us_east OF INDEX movr.public.users@primary CONFIGURE ZONE USING
             |     constraints = '[+region=us-east1]';
             | ALTER PARTITION us_west OF INDEX movr.public.users@primary CONFIGURE ZONE USING
             |     constraints = '[+region=us-west1]'
(1 row)
~~~

If you know the user's id, you can filter on the `id` column:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM users WHERE id='00000000-0000-4000-8000-000000000000';
~~~

~~~
                   id                  |   city   |     name      |       address        | credit_card
+--------------------------------------+----------+---------------+----------------------+-------------+
  00000000-0000-4000-8000-000000000000 | new york | Robert Murphy | 99176 Anderson Mills | 8885705228
(1 row)
~~~

An [`EXPLAIN`](explain.html) statement shows more detail about the cost-based optimizer's plan:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM users WHERE id='00000000-0000-4000-8000-000000000000';
~~~

~~~
  tree |    field    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       description
+------+-------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
       | distributed | true
       | vectorized  | false
  scan |             |
       | table       | users@primary
       | spans       | -/"amsterdam" /"amsterdam"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"amsterdam"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"/# /"amsterdam\x00"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"boston" /"boston"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"boston"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"/# /"boston\x00"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"los angeles" /"los angeles"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"los angeles"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"/# /"los angeles\x00"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"new york" /"new york"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"new york"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"/# /"new york\x00"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"paris" /"paris"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"paris"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"/# /"paris\x00"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"rome" /"rome"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"rome"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"/# /"rome\x00"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"san francisco" /"san francisco"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"san francisco"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"/# /"san francisco\x00"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"seattle" /"seattle"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"seattle"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"/# /"seattle\x00"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"washington dc" /"washington dc"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"washington dc"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"/# /"washington dc\x00"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-
       | filter      | id = '00000000-0000-4000-8000-000000000000'
(6 rows)
~~~

Because the `id` column is in the primary index, directly after the partition prefix (`city`), the optimal query is constrained by the partitioned values. This means the query scans each partition in parallel for the unique `id` value.

If you know the set of all possible partitioned values, adding a check constraint to the table's create statement can also improve performance. For example:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ADD CONSTRAINT check_city CHECK (city IN ('amsterdam','boston','los angeles','new york','paris','rome','san francisco','seattle','washington dc'));
~~~

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM users WHERE id='00000000-0000-4000-8000-000000000000';
~~~

~~~
  tree |    field    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    description
+------+-------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
       | distributed | false
       | vectorized  | false
  scan |             |
       | table       | users@primary
       | spans       | /"amsterdam"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"amsterdam"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"/# /"boston"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"boston"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"/# /"los angeles"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"los angeles"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"/# /"new york"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"new york"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"/# /"paris"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"paris"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"/# /"rome"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"rome"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"/# /"san francisco"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"san francisco"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"/# /"seattle"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"seattle"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"/# /"washington dc"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"-/"washington dc"/"\x00\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x00"/#
       | parallel    |
(6 rows)
~~~


To see the performance improvement over a query that performs a full table scan, compare these queries to a query with a filter on a column that is not in the index.

### Filtering on a non-indexed column

Suppose that you want to query the `users` table for information about a specific user, but you only know the user's name.

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM users WHERE name='Robert Murphy';
~~~

~~~
                   id                  |   city   |     name      |       address        | credit_card
+--------------------------------------+----------+---------------+----------------------+-------------+
  00000000-0000-4000-8000-000000000000 | new york | Robert Murphy | 99176 Anderson Mills | 8885705228
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM users WHERE name='Robert Murphy';
~~~

~~~
  tree |    field    |      description
+------+-------------+------------------------+
       | distributed | true
       | vectorized  | false
  scan |             |
       | table       | users@primary
       | spans       | ALL
       | filter      | name = 'Robert Murphy'
(6 rows)
~~~

The query returns the same result, but because `name` is not an indexed column, the query performs a full table scan that spans across all partition values.

### Filtering on an partitioned column

If you know which partition contains the data that you are querying, using a filter (e.g. a [`WHERE` clause](select-clause.html#filter-rows)) on the column that is used for the partition can further improve performance by limiting the scan to the specific partition(s) that contain the data that you are querying.

Now suppose that you know the user's name and location. You can query the table with a filter on the user's name and city:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM users WHERE name='Robert Murphy' AND city='new york';
~~~

~~~
  tree |    field    |            description
+------+-------------+-----------------------------------+
       | distributed | true
       | vectorized  | false
  scan |             |
       | table       | users@primary
       | spans       | /"new york"-/"new york"/PrefixEnd
       | filter      | name = 'Robert Murphy'
(6 rows)
~~~

The table returns the same results as before, but at a much lower cost, as the query scan now spans just the `new york` partition value.
