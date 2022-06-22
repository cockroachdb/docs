In this example, let's create a simple table with a computed column:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE names (
    id INT PRIMARY KEY,
    first_name STRING,
    last_name STRING,
    full_name STRING AS (CONCAT(first_name, ' ', last_name)) STORED
  );
~~~

Then, insert a few rows of data:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO names (id, first_name, last_name) VALUES
    (1, 'Lola', 'McDog'),
    (2, 'Carl', 'Kimball'),
    (3, 'Ernie', 'Narayan');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM names;
~~~
~~~
+----+------------+-------------+----------------+
| id | first_name |  last_name  |   full_name    |
+----+------------+-------------+----------------+
|  1 | Lola       | McDog       | Lola McDog     |
|  2 | Carl       | Kimball     | Carl Kimball   |
|  3 | Ernie      | Narayan     | Ernie Narayan  |
+----+------------+-------------+----------------+
~~~

The `full_name` column is computed from the `first_name` and `last_name` columns without the need to define a [view](views.html).
