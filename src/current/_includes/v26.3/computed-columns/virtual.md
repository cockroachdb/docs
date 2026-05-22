In this example, create a table with a `JSONB` column and virtual computed columns:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile JSONB,
    full_name STRING AS (concat_ws(' ',profile->>'firstName', profile->>'lastName')) VIRTUAL,
    birthday TIMESTAMP AS (parse_timestamp(profile->>'birthdate')) VIRTUAL
);
~~~

Then, insert a few rows of data:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO student_profiles (profile) VALUES
    ('{"id": "d78236", "firstName": "Arthur", "lastName": "Read", "birthdate": "2010-01-25", "school": "PVPHS", "credits": 120, "sports": "none"}'),
    ('{"firstName": "Buster", "lastName": "Bunny", "birthdate": "2011-11-07", "id": "f98112", "school": "THS", "credits": 67, "clubs": "MUN"}'),
    ('{"firstName": "Ernie", "lastName": "Narayan", "school" : "Brooklyn Tech", "id": "t63512", "sports": "Track and Field", "clubs": "Chess"}');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM student_profiles;
~~~
~~~
                   id                  |                                                                   profile                                                                   |   full_name   |      birthday
---------------------------------------+---------------------------------------------------------------------------------------------------------------------------------------------+---------------+----------------------
  0e420282-105d-473b-83e2-3b082e7033e4 | {"birthdate": "2011-11-07", "clubs": "MUN", "credits": 67, "firstName": "Buster", "id": "f98112", "lastName": "Bunny", "school": "THS"}     | Buster Bunny  | 2011-11-07 00:00:00
  6e9b77cd-ec67-41ae-b346-7b3d89902c72 | {"birthdate": "2010-01-25", "credits": 120, "firstName": "Arthur", "id": "d78236", "lastName": "Read", "school": "PVPHS", "sports": "none"} | Arthur Read   | 2010-01-25 00:00:00
  f74b21e3-dc1e-49b7-a648-3c9b9024a70f | {"clubs": "Chess", "firstName": "Ernie", "id": "t63512", "lastName": "Narayan", "school": "Brooklyn Tech", "sports": "Track and Field"}     | Ernie Narayan | NULL
(3 rows)


Time: 2ms total (execution 2ms / network 0ms)
~~~

The virtual column `full_name` is computed as a field from the `profile` column's data. The first name and last name are concatenated and separated by a single whitespace character using the [`concat_ws` string function]({% link {{ page.version.version }}/functions-and-operators.md %}#string-and-byte-functions).

The virtual column `birthday` is parsed as a `TIMESTAMP` value from the `profile` column's `birthdate` string value. The [`parse_timestamp` function]({% link {{ page.version.version }}/functions-and-operators.md %}) is used to parse strings in `TIMESTAMP` format.
