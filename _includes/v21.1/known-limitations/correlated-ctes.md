CockroachDB does not support correlated common table expressions. This means that a CTE cannot refer to a variable defined outside the scope of that CTE.

For example, the following query returns an error:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM users
  WHERE id =
    (WITH rides_home AS
      (SELECT revenue FROM rides
       WHERE end_address = address)
     SELECT rider_id FROM rides_home);
~~~

~~~
ERROR: CTEs may not be correlated
SQLSTATE: 0A000
~~~

This query returns an error because the `WITH rides_home` clause references a column (`address`) returned by the `SELECT` statement at the top level of the query, outside the `rides_home` CTE definition.
