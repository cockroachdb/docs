In this example, create a table with a `JSONB` column and a stored computed column:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE student_profiles (
    id STRING PRIMARY KEY AS (profile->>'id') STORED,
    profile JSONB
);
~~~

Create a compute column after you create a table:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE student_profiles ADD COLUMN age INT AS ( (profile->>'age')::INT) STORED;
~~~

Then, insert a few rows of data:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO student_profiles (profile) VALUES
    ('{"id": "d78236", "name": "Arthur Read", "age": "16", "school": "PVPHS", "credits": 120, "sports": "none"}'),
    ('{"name": "Buster Bunny", "age": "15", "id": "f98112", "school": "THS", "credits": 67, "clubs": "MUN"}'),
    ('{"name": "Ernie Narayan", "school" : "Brooklyn Tech", "id": "t63512", "sports": "Track and Field", "clubs": "Chess"}');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM student_profiles;
~~~
~~~
+--------+---------------------------------------------------------------------------------------------------------------------+------+
|   id   |                                                       profile                                                       | age  |
---------+---------------------------------------------------------------------------------------------------------------------+------+
| d78236 | {"age": "16", "credits": 120, "id": "d78236", "name": "Arthur Read", "school": "PVPHS", "sports": "none"}           |   16 |
| f98112 | {"age": "15", "clubs": "MUN", "credits": 67, "id": "f98112", "name": "Buster Bunny", "school": "THS"}               |   15 |
| t63512 | {"clubs": "Chess", "id": "t63512", "name": "Ernie Narayan", "school": "Brooklyn Tech", "sports": "Track and Field"} | NULL |
+--------+---------------------------------------------------------------------------------------------------------------------+------|
~~~

The primary key `id` is computed as a field from the `profile` column.  Additionally the `age` column is computed from the profile column data as well.
