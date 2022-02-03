{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEXES FROM users;
~~~

~~~
+------------+------------+------------+--------------+-------------+-----------+---------+----------+
| table_name | index_name | non_unique | seq_in_index | column_name | direction | storing | implicit |
+------------+------------+------------+--------------+-------------+-----------+---------+----------+
| users      | primary    |   false    |            1 | id          | ASC       |  false  |  false   |
| users      | name_idx   |    true    |            1 | name        | ASC       |  false  |  false   |
| users      | name_idx   |    true    |            2 | id          | ASC       |  false  |   true   |
+------------+------------+------------+--------------+-------------+-----------+---------+----------+
(3 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX users@name_idx RENAME TO users_name_idx;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEXES FROM users;
~~~

~~~
+------------+----------------+------------+--------------+-------------+-----------+---------+----------+
| table_name |   index_name   | non_unique | seq_in_index | column_name | direction | storing | implicit |
+------------+----------------+------------+--------------+-------------+-----------+---------+----------+
| users      | primary        |   false    |            1 | id          | ASC       |  false  |  false   |
| users      | users_name_idx |    true    |            1 | name        | ASC       |  false  |  false   |
| users      | users_name_idx |    true    |            2 | id          | ASC       |  false  |   true   |
+------------+----------------+------------+--------------+-------------+-----------+---------+----------+
(3 rows)
~~~
