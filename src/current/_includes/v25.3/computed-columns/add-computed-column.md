In this example, create a table:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE x (
    a INT NULL,
    b INT NULL AS (a * 2) STORED,
    c INT NULL AS (a + 4) STORED,
    FAMILY "primary" (a, b, rowid, c)
  );
~~~

Then, insert a row of data:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO x VALUES (6);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM x;
~~~

~~~
+---+----+----+
| a | b  | c  |
+---+----+----+
| 6 | 12 | 10 |
+---+----+----+
(1 row)
~~~

Now add another virtual computed column to the table:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE x ADD COLUMN d INT AS (a // 2) VIRTUAL;
~~~

The `d` column is added to the table and computed from the `a` column divided by 2.

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM x;
~~~

~~~
+---+----+----+---+
| a | b  | c  | d |
+---+----+----+---+
| 6 | 12 | 10 | 3 |
+---+----+----+---+
(1 row)
~~~
