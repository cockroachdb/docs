You can convert a stored, computed column into a regular column by using `ALTER TABLE`.

In this example, create a simple table with a computed column:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE office_dogs (
    id INT PRIMARY KEY,
    first_name STRING,
    last_name STRING,
    full_name STRING AS (CONCAT(first_name, ' ', last_name)) STORED
  );
~~~

Then, insert a few rows of data:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO office_dogs (id, first_name, last_name) VALUES
    (1, 'Petee', 'Hirata'),
    (2, 'Carl', 'Kimball'),
    (3, 'Ernie', 'Narayan');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM office_dogs;
~~~

~~~
+----+------------+-----------+---------------+
| id | first_name | last_name |   full_name   |
+----+------------+-----------+---------------+
|  1 | Petee      | Hirata    | Petee Hirata  |
|  2 | Carl       | Kimball   | Carl Kimball  |
|  3 | Ernie      | Narayan   | Ernie Narayan |
+----+------------+-----------+---------------+
(3 rows)
~~~

The `full_name` column is computed from the `first_name` and `last_name` columns without the need to define a [view](views.html). You can view the column details with the [`SHOW COLUMNS`](show-columns.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM office_dogs;
~~~

~~~
+-------------+-----------+-------------+----------------+------------------------------------+-------------+
| column_name | data_type | is_nullable | column_default |       generation_expression        |   indices   |
+-------------+-----------+-------------+----------------+------------------------------------+-------------+
| id          | INT       |    false    | NULL           |                                    | {"primary"} |
| first_name  | STRING    |    true     | NULL           |                                    | {}          |
| last_name   | STRING    |    true     | NULL           |                                    | {}          |
| full_name   | STRING    |    true     | NULL           | concat(first_name, ' ', last_name) | {}          |
+-------------+-----------+-------------+----------------+------------------------------------+-------------+
(4 rows)
~~~

Now, convert the computed column (`full_name`) to a regular column:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE office_dogs ALTER COLUMN full_name DROP STORED;
~~~

Check that the computed column was converted:

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM office_dogs;
~~~

~~~
+-------------+-----------+-------------+----------------+-----------------------+-------------+
| column_name | data_type | is_nullable | column_default | generation_expression |   indices   |
+-------------+-----------+-------------+----------------+-----------------------+-------------+
| id          | INT       |    false    | NULL           |                       | {"primary"} |
| first_name  | STRING    |    true     | NULL           |                       | {}          |
| last_name   | STRING    |    true     | NULL           |                       | {}          |
| full_name   | STRING    |    true     | NULL           |                       | {}          |
+-------------+-----------+-------------+----------------+-----------------------+-------------+
(4 rows)
~~~

The computed column is now a regular column and can be updated as such:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO office_dogs (id, first_name, last_name, full_name) VALUES (4, 'Lola', 'McDog', 'This is not computed');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM office_dogs;
~~~

~~~
+----+------------+-----------+----------------------+
| id | first_name | last_name |      full_name       |
+----+------------+-----------+----------------------+
|  1 | Petee      | Hirata    | Petee Hirata         |
|  2 | Carl       | Kimball   | Carl Kimball         |
|  3 | Ernie      | Narayan   | Ernie Narayan        |
|  4 | Lola       | McDog     | This is not computed |
+----+------------+-----------+----------------------+
(4 rows)
~~~
