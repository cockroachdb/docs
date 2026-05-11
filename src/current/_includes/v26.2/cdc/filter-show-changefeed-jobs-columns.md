You can filter the columns that `SHOW CHANGEFEED JOBS` displays using a `SELECT` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT job_id, sink_uri, status, format FROM [SHOW CHANGEFEED JOBS] WHERE job_id = 997306743028908033;
~~~
~~~
        job_id       |    sink_uri      | status   | format
---------------------+------------------+----------+---------
  997306743028908033 | external://kafka | running  | json
~~~