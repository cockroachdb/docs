## Querying partitions programmatically

The `crdb_internal.partitions` internal table contains information about the partitions in your database. In testing, scripting, and other programmatic environments, we recommend querying this table for partition information instead of using the `SHOW PARTITIONS` statement. For example, to get all `us_west` partitions of in your database, you can run the following query:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM crdb_internal.partitions WHERE name='us_west';
~~~

~~~
  table_id | index_id | parent_name |  name   | columns | column_names |                   list_value                    | range_value | zone_id | subzone_id
+----------+----------+-------------+---------+---------+--------------+-------------------------------------------------+-------------+---------+------------+
        53 |        1 | NULL        | us_west |       1 | city         | ('seattle'), ('san francisco'), ('los angeles') | NULL        |       0 |          0
        54 |        1 | NULL        | us_west |       1 | city         | ('seattle'), ('san francisco'), ('los angeles') | NULL        |      54 |          1
        54 |        2 | NULL        | us_west |       1 | city         | ('seattle'), ('san francisco'), ('los angeles') | NULL        |      54 |          2
        55 |        1 | NULL        | us_west |       1 | city         | ('seattle'), ('san francisco'), ('los angeles') | NULL        |      55 |          1
        55 |        2 | NULL        | us_west |       1 | city         | ('seattle'), ('san francisco'), ('los angeles') | NULL        |      55 |          2
        55 |        3 | NULL        | us_west |       1 | vehicle_city | ('seattle'), ('san francisco'), ('los angeles') | NULL        |      55 |          3
        56 |        1 | NULL        | us_west |       1 | city         | ('seattle'), ('san francisco'), ('los angeles') | NULL        |      56 |          1
        58 |        1 | NULL        | us_west |       1 | city         | ('seattle'), ('san francisco'), ('los angeles') | NULL        |      58 |          1
(8 rows)
~~~

Other internal tables, like `crdb_internal.tables`, include information that could be useful in conjunction with `crdb_internal.partitions`.

For example, if you want the output for your partitions to include the name of the table and database, you can perform a join of the two tables:

{% include copy-clipboard.html %}
~~~ sql
> SELECT
  partitions.name AS partition_name, column_names, list_value, tables.name AS table_name, database_name
  FROM crdb_internal.partitions JOIN crdb_internal.tables ON partitions.table_id=tables.table_id
  WHERE tables.name='users';
~~~

~~~
  partition_name | column_names |                   list_value                    | table_name | database_name
+----------------+--------------+-------------------------------------------------+------------+---------------+
  us_west        | city         | ('seattle'), ('san francisco'), ('los angeles') | users      | movr
  us_east        | city         | ('new york'), ('boston'), ('washington dc')     | users      | movr
  europe_west    | city         | ('amsterdam'), ('paris'), ('rome')              | users      | movr
(3 rows)
~~~
