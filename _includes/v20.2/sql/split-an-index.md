
Add a new secondary [index](indexes.html) to the `rides` table, on the `revenue` column:

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX revenue_idx ON rides(revenue);
~~~

Then split the table ranges by secondary index values:

{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX rides@revenue_idx SPLIT AT VALUES (25.00), (50.00), (75.00);
~~~
~~~
         key        | pretty |        split_enforced_until
--------------------+--------+--------------------------------------
  \277\214*2\000    | /25    | 2262-04-11 23:47:16.854776+00:00:00
  \277\214*d\000    | /5E+1  | 2262-04-11 23:47:16.854776+00:00:00
  \277\214*\226\000 | /75    | 2262-04-11 23:47:16.854776+00:00:00
(3 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW RANGES FROM INDEX rides@revenue_idx;
~~~
~~~
  start_key | end_key | range_id | range_size_mb | lease_holder | lease_holder_locality | replicas |                             replica_localities
------------+---------+----------+---------------+--------------+-----------------------+----------+-----------------------------------------------------------------------------
  NULL      | /25     |      249 |      0.007464 |            3 | region=us-east1,az=d  | {3,5,7}  | {"region=us-east1,az=d","region=us-west1,az=b","region=europe-west1,az=b"}
  /25       | /5E+1   |      250 |      0.008995 |            3 | region=us-east1,az=d  | {3,5,7}  | {"region=us-east1,az=d","region=us-west1,az=b","region=europe-west1,az=b"}
  /5E+1     | /75     |      251 |      0.008212 |            3 | region=us-east1,az=d  | {3,5,7}  | {"region=us-east1,az=d","region=us-west1,az=b","region=europe-west1,az=b"}
  /75       | NULL    |      252 |      0.009267 |            3 | region=us-east1,az=d  | {3,5,7}  | {"region=us-east1,az=d","region=us-west1,az=b","region=europe-west1,az=b"}
(4 rows)
~~~
