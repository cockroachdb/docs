To import from `userfile`, first create the table that you would like to import into:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE TABLE customers (
  id INT,
  dob DATE,
  first_name STRING,
  last_name STRING,
  joined DATE
);
~~~

Then, use `IMPORT INTO` to import data into the table:

{% include_cached copy-clipboard.html %}
~~~sql
IMPORT INTO customers (id, dob, first_name, last_name, joined)
   CSV DATA ('userfile:///test-data.csv');
~~~

`userfile:///` references the default path (`userfile://defaultdb.public.userfiles_$user/`).

~~~
        job_id       |  status   | fraction_completed |  rows  | index_entries |  bytes
---------------------+-----------+--------------------+--------+---------------+-----------
  599865027685613569 | succeeded |                  1 | 300024 |             0 | 13389972
(1 row)
~~~

For more import options, see [`IMPORT INTO`](import-into.html).
