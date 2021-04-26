In this example, create a table with a `JSONB` column and a virtual computed column:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile JSONB,
    full_name STRING AS (concat_ws(' ',profile->>'firstName', profile->>'lastName')) VIRTUAL
);
~~~

Then, insert a few rows of data:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO student_profiles (profile) VALUES
    ('{"id": "d78236", "firstName": "Arthur", "lastName": "Read", "birthdate": "2010-01-25", "school": "PVPHS", "credits": 120, "sports": "none"}'),
    ('{"firstName": "Buster", "lastName": "Bunny", "birthdate": "2011-11-07", "id": "f98112", "school": "THS", "credits": 67, "clubs": "MUN"}'),
    ('{"firstName": "Ernie", "lastName": "Narayan", "school" : "Brooklyn Tech", "id": "t63512", "sports": "Track and Field", "clubs": "Chess"}');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM student_profiles;
~~~
~~~
                   id                  |                                                                   profile                                                                   |   full_name
---------------------------------------+---------------------------------------------------------------------------------------------------------------------------------------------+----------------
  4ebb11a5-8e9a-49dc-905d-fade67027990 | {"clubs": "Chess", "firstName": "Ernie", "id": "t63512", "lastName": "Narayan", "school": "Brooklyn Tech", "sports": "Track and Field"}     | Ernie Narayan
  6724adfa-610a-4efe-b53d-fd67bd3bd9ba | {"birthdate": "2010-01-25", "credits": 120, "firstName": "Arthur", "id": "d78236", "lastName": "Read", "school": "PVPHS", "sports": "none"} | Arthur Read
  75e253d7-a8b6-4be3-a133-bc75611f376e | {"birthdate": "2011-11-07", "clubs": "MUN", "credits": 67, "firstName": "Buster", "id": "f98112", "lastName": "Bunny", "school": "THS"}     | Buster Bunny
(3 rows)

Time: 1ms total (execution 1ms / network 0ms)
~~~

The virtual column `full_name` is computed as a field from the `profile` column's data. The first name and last name are concatenated and separated by a single whitespace character using the [`concat_ws` string function](functions-and-operators.html#string-and-byte-functions).
