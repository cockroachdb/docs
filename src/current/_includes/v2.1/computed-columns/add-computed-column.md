In this example, create a table:

{% include "_includes/copy-clipboard.html" %}
~~~ sql
> CREATE TABLE x (
    a INT NULL,
    b INT NULL AS (a * 2) STORED,
    c INT NULL AS (a + 4) STORED,
    FAMILY "primary" (a, b, rowid, c)
  );
~~~

Then, insert a row of data:

{% include "_includes/copy-clipboard.html" %}
~~~ sql
> INSERT INTO x VALUES (6);
~~~

{% include "_includes/copy-clipboard.html" %}
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

Now add another computed column to the table:

{% include "_includes/copy-clipboard.html" %}
~~~ sql
> ALTER TABLE x ADD COLUMN d INT AS (a // 2) STORED;
~~~

The `d` column is added to the table and computed from the `a` column divided by 2.

{% include "_includes/copy-clipboard.html" %}
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
