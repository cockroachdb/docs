### Rename an index

~~~ sql
> CREATE INDEX on users(name);
~~~

~~~ sql
> SHOW INDEXES FROM users;
~~~

~~~
  table_name | index_name | non_unique | seq_in_index | column_name | direction | storing | implicit | visible
-------------+------------+------------+--------------+-------------+-----------+---------+----------+----------
  users      | name_idx   |     t      |            1 | name        | DESC      |    f    |    f     |    t
  users      | name_idx   |     t      |            2 | city        | ASC       |    f    |    t     |    t
  users      | name_idx   |     t      |            3 | id          | ASC       |    f    |    t     |    t
  users      | users_pkey |     f      |            1 | city        | ASC       |    f    |    f     |    t
  users      | users_pkey |     f      |            2 | id          | ASC       |    f    |    f     |    t
  users      | users_pkey |     f      |            3 | name        | N/A       |    t    |    f     |    t
  users      | users_pkey |     f      |            4 | address     | N/A       |    t    |    f     |    t
  users      | users_pkey |     f      |            5 | credit_card | N/A       |    t    |    f     |    t
(8 rows)
~~~

~~~ sql
> ALTER INDEX users@name_idx RENAME TO users_name_idx;
~~~

~~~ sql
> SHOW INDEXES FROM users;
~~~

~~~
  table_name |   index_name   | non_unique | seq_in_index | column_name | direction | storing | implicit | visible
-------------+----------------+------------+--------------+-------------+-----------+---------+----------+----------
  users      | users_name_idx |     t      |            1 | name        | DESC      |    f    |    f     |    t
  users      | users_name_idx |     t      |            2 | city        | ASC       |    f    |    t     |    t
  users      | users_name_idx |     t      |            3 | id          | ASC       |    f    |    t     |    t
  users      | users_pkey     |     f      |            1 | city        | ASC       |    f    |    f     |    t
  users      | users_pkey     |     f      |            2 | id          | ASC       |    f    |    f     |    t
  users      | users_pkey     |     f      |            3 | name        | N/A       |    t    |    f     |    t
  users      | users_pkey     |     f      |            4 | address     | N/A       |    t    |    f     |    t
  users      | users_pkey     |     f      |            5 | credit_card | N/A       |    t    |    f     |    t
(8 rows)
~~~
