
To initialize the example database, use the [`cockroach sql`](cockroach-sql.html) command to execute the SQL statements in the `dbinit.sql` file:

{% include_cached copy-clipboard.html %}
~~~ shell
cat dbinit.sql | cockroach sql --url "<connection-string>"
~~~

Where `<connection-string>` is the connection string to the running cluster.

<div class="filter-content" markdown="1" data-scope="cockroachcloud">

{{site.data.alerts.callout_success}}
Use the connection string you obtained earlier from the CockroachCloud Console.
{{site.data.alerts.end}}

</div>

<div class="filter-content" markdown="1" data-scope="local">

{{site.data.alerts.callout_success}}
Use the connection string you obtained earlier from the `cockroach demo` welcome text.
{{site.data.alerts.end}}

</div>

The SQL statements in the initialization file should execute:

~~~
SET

Time: 1ms

SET

Time: 2ms

DROP DATABASE

Time: 1ms

CREATE DATABASE

Time: 2ms

SET

Time: 10ms

CREATE TABLE

Time: 4ms
~~~
