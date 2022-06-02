Let's create the `products` table and add a hash-sharded primary key on the `ts` column:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE products (
    ts DECIMAL PRIMARY KEY USING HASH,
    product_id INT8
    );
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM products;
~~~

~~~
  table_name |  index_name   | non_unique | seq_in_index |        column_name        | direction | storing | implicit
-------------+---------------+------------+--------------+---------------------------+-----------+---------+-----------
  products   | products_pkey |   false    |            1 | crdb_internal_ts_shard_16 | ASC       |  false  |   true
  products   | products_pkey |   false    |            2 | ts                        | ASC       |  false  |  false
  products   | products_pkey |   false    |            3 | product_id                | N/A       |  true   |  false
(3 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM products;
~~~

~~~
         column_name        | data_type | is_nullable | column_default |               generation_expression               |     indices     | is_hidden
----------------------------+-----------+-------------+----------------+---------------------------------------------------+-----------------+------------
  crdb_internal_ts_shard_16 | INT8      |    false    | NULL           | mod(fnv32(crdb_internal.datums_to_bytes(ts)), 16) | {products_pkey} |   true
  ts                        | DECIMAL   |    false    | NULL           |                                                   | {products_pkey} |   false
  product_id                | INT8      |    true     | NULL           |                                                   | {products_pkey} |   false
(3 rows)
~~~
