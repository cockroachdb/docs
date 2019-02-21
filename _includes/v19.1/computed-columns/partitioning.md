{{site.data.alerts.callout_info}}Partioning is an enterprise feature. To request and enable a trial or full enterprise license, see <a href="enterprise-licensing.html">Enterprise Licensing</a>.{{site.data.alerts.end}}

In this example, create a table with geo-partitioning and a computed column:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE user_locations (
    locality STRING AS (CASE
      WHEN country IN ('ca', 'mx', 'us') THEN 'north_america'
      WHEN country IN ('au', 'nz') THEN 'australia'
    END) STORED,
    id SERIAL,
    name STRING,
    country STRING,
    PRIMARY KEY (locality, id))
    PARTITION BY LIST (locality)
    (PARTITION north_america VALUES IN ('north_america'),
    PARTITION australia VALUES IN ('australia'));
~~~

Then, insert a few rows of data:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO user_locations (name, country) VALUES
    ('Leonard McCoy', 'us'),
    ('Uhura', 'nz'),
    ('Spock', 'ca'),
    ('James Kirk', 'us'),
    ('Scotty', 'mx'),
    ('Hikaru Sulu', 'us'),
    ('Pavel Chekov', 'au');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM user_locations;
~~~
~~~
+---------------+--------------------+---------------+---------+
|   locality    |         id         |     name      | country |
+---------------+--------------------+---------------+---------+
| australia     | 333153890100609025 | Uhura         | nz      |
| australia     | 333153890100772865 | Pavel Chekov  | au      |
| north_america | 333153890100576257 | Leonard McCoy | us      |
| north_america | 333153890100641793 | Spock         | ca      |
| north_america | 333153890100674561 | James Kirk    | us      |
| north_america | 333153890100707329 | Scotty        | mx      |
| north_america | 333153890100740097 | Hikaru Sulu   | us      |
+---------------+--------------------+---------------+---------+
~~~

The `locality` column is computed from the `country` column.
