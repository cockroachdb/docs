To import a table from `userfile`, use the following command:

{% include_cached copy-clipboard.html %}
~~~sql
IMPORT TABLE customers (
        id UUID PRIMARY KEY,
        name TEXT,
        INDEX name_idx (name)
)
   CSV DATA ('userfile:///test-data.csv');
~~~

`userfile:///` references the default path (`userfile://defaultdb.public.userfiles_$user/`).

~~~
        job_id       |  status   | fraction_completed |  rows  | index_entries |  bytes
---------------------+-----------+--------------------+--------+---------------+-----------
  599865027685613569 | succeeded |                  1 | 300024 |             0 | 13389972
(1 row)
~~~

For more import options, see [`IMPORT`](../{{site.current_cloud_version}}/import-into.html).
