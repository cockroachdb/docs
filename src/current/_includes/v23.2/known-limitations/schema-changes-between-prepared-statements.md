When the schema of a table targeted by a prepared statement changes before the prepared statement is executed, CockroachDB allows the prepared statement to return results based on the changed table schema, for example:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE users (id INT PRIMARY KEY);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> PREPARE prep1 AS SELECT * FROM users;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ADD COLUMN name STRING;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO users VALUES (1, 'Max Roach');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> EXECUTE prep1;
~~~

~~~
  id |   name
-----+------------
   1 | Max Roach
(1 row)
~~~

It's therefore recommended to **not** use `SELECT *` in queries that will be repeated, via prepared statements or otherwise.

Also, a prepared [`INSERT`]({% link {{ page.version.version }}/insert.md %}), [`UPSERT`]({% link {{ page.version.version }}/upsert.md %}), or [`DELETE`]({% link {{ page.version.version }}/delete.md %}) statement acts inconsistently when the schema of the table being written to is changed before the prepared statement is executed:

- If the number of columns has increased, the prepared statement returns an error but nonetheless writes the data.
- If the number of columns remains the same but the types have changed, the prepared statement writes the data and does not return an error.
