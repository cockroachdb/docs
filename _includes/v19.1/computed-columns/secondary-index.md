In this example, create a table with a computed columns and an index on that column:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE gymnastics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete STRING,
    vault DECIMAL,
    bars DECIMAL,
    beam DECIMAL,
    floor DECIMAL,
    combined_score DECIMAL AS (vault + bars + beam + floor) STORED,
    INDEX total (combined_score DESC)
  );
~~~

Then, insert a few rows a data:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO gymnastics (athlete, vault, bars, beam, floor) VALUES
    ('Simone Biles', 15.933, 14.800, 15.300, 15.800),
    ('Gabby Douglas', 0, 15.766, 0, 0),
    ('Laurie Hernandez', 15.100, 0, 15.233, 14.833),
    ('Madison Kocian', 0, 15.933, 0, 0),
    ('Aly Raisman', 15.833, 0, 15.000, 15.366);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM gymnastics;
~~~
~~~
+--------------------------------------+------------------+--------+--------+--------+--------+----------------+
|                  id                  |     athlete      | vault  |  bars  |  beam  | floor  | combined_score |
+--------------------------------------+------------------+--------+--------+--------+--------+----------------+
| 3fe11371-6a6a-49de-bbef-a8dd16560fac | Aly Raisman      | 15.833 |      0 | 15.000 | 15.366 |         46.199 |
| 56055a70-b4c7-4522-909b-8f3674b705e5 | Madison Kocian   |      0 | 15.933 |      0 |      0 |         15.933 |
| 69f73fd1-da34-48bf-aff8-71296ce4c2c7 | Gabby Douglas    |      0 | 15.766 |      0 |      0 |         15.766 |
| 8a7b730b-668d-4845-8d25-48bda25114d6 | Laurie Hernandez | 15.100 |      0 | 15.233 | 14.833 |         45.166 |
| b2c5ca80-21c2-4853-9178-b96ce220ea4d | Simone Biles     | 15.933 | 14.800 | 15.300 | 15.800 |         61.833 |
+--------------------------------------+------------------+--------+--------+--------+--------+----------------+
~~~

Now, run a query using the secondary index:

{% include copy-clipboard.html %}
~~~ sql
> SELECT athlete, combined_score FROM gymnastics ORDER BY combined_score DESC;
~~~
~~~
+------------------+----------------+
|     athlete      | combined_score |
+------------------+----------------+
| Simone Biles     |         61.833 |
| Aly Raisman      |         46.199 |
| Laurie Hernandez |         45.166 |
| Madison Kocian   |         15.933 |
| Gabby Douglas    |         15.766 |
+------------------+----------------+
~~~

The athlete with the highest combined score of 61.833 is Simone Biles.
