In this example, let's create a simple table with a computed column:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        city STRING,
        first_name STRING,
        last_name STRING,
        full_name STRING AS (CONCAT(first_name, ' ', last_name)) STORED,
        address STRING,
        credit_card STRING,
        dl STRING UNIQUE CHECK (LENGTH(dl) < 8)
);
~~~

Then, insert a few rows of data:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO users (first_name, last_name) VALUES
    ('Lola', 'McDog'),
    ('Carl', 'Kimball'),
    ('Ernie', 'Narayan');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM users;
~~~
~~~
                   id                  | city | first_name | last_name |   full_name   | address | credit_card |  dl
+--------------------------------------+------+------------+-----------+---------------+---------+-------------+------+
  5740da29-cc0c-47af-921c-b275d21d4c76 | NULL | Ernie      | Narayan   | Ernie Narayan | NULL    | NULL        | NULL
  e7e0b748-9194-4d71-9343-cd65218848f0 | NULL | Lola       | McDog     | Lola McDog    | NULL    | NULL        | NULL
  f00e4715-8ca7-4d5a-8de5-ef1d5d8092f3 | NULL | Carl       | Kimball   | Carl Kimball  | NULL    | NULL        | NULL
(3 rows)
~~~

The `full_name` column is computed from the `first_name` and `last_name` columns without the need to define a [view](views.html).
