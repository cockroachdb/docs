---
title: Connect to the Database
summary: How to connect to a CockroachDB cluster from your application
toc: true
---

This page has instructions for connecting to a CockroachDB cluster from your application using various programming languages. Each example shows a [connection string][connection_params] for a [secure local cluster][local_secure] to a `bank` database by a user named `maxroach`. Depending on your cluster's configuration, you may need to edit this connection string.

For a reference that lists all of the supported cluster connection parameters, see [Connection Parameters][connection_params].

## Before you begin

Make sure you have already:

- Set up a [local cluster](secure-a-cluster.html).
- [Installed a Postgres client](install-client-drivers.html).

## Connect

<div class="filters clearfix">
  <button class="filter-button" data-scope="sql">SQL</button>
  <button class="filter-button" data-scope="go">Go</button>
  <button class="filter-button" data-scope="java">Java</button>
  <button class="filter-button" data-scope="python">Python</button>
</div>

<section class="filter-content" markdown="1" data-scope="sql">

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs --host=localhost:26257
~~~

For more information about how to use the built-in SQL client, see the [`cockroach sql`](cockroach-sql.html) reference docs.

</section>

<section class="filter-content" markdown="1" data-scope="go">

{% include copy-clipboard.html %}
~~~ go
import (
    "database/sql"
    "fmt"
    "log"
    _ "github.com/lib/pq"
)

db, err := sql.Open("postgres",
        "postgresql://maxroach@localhost:26257/bank?ssl=true&sslmode=require&sslrootcert=certs/ca.crt&sslkey=certs/client.maxroach.key&sslcert=certs/client.maxroach.crt")
if err != nil {
    log.Fatal("error connecting to the database: ", err)
}
defer db.Close()
~~~

{% include {{page.version.version}}/app/for-a-complete-example-go.md %}

</section>

<section class="filter-content" markdown="1" data-scope="java">

{% include copy-clipboard.html %}
~~~ java
import java.sql.*;
import javax.sql.DataSource;

PGSimpleDataSource ds = new PGSimpleDataSource();
ds.setServerName("localhost");
ds.setPortNumber(26257);
ds.setDatabaseName("bank");
ds.setUser("maxroach");
ds.setPassword(null);
ds.setSsl(true);
ds.setSslMode("require");
ds.setSslCert("certs/client.maxroach.crt");
ds.setSslKey("certs/client.maxroach.key.pk8");
ds.setReWriteBatchedInserts(true); // add `rewriteBatchedInserts=true` to pg connection string
ds.setApplicationName("BasicExample");
~~~

{% include {{page.version.version}}/app/for-a-complete-example-java.md %}

</section>

<section class="filter-content" markdown="1" data-scope="python">

{% include copy-clipboard.html %}
~~~ python
import psycopg2

conn = psycopg2.connect(
    database='bank',
    user='maxroach',
    sslmode='require',
    sslrootcert='certs/ca.crt',
    sslkey='certs/client.maxroach.key',
    sslcert='certs/client.maxroach.crt',
    port=26257,
    host='localhost'
)
~~~

{% include {{page.version.version}}/app/for-a-complete-example-python.md %}

</section>

## See also

Reference information related to this task:

- [Connection parameters][connection_params]
- [Manual deployments][manual]
- [Orchestrated deployments][orchestrated]
- [Start a local cluster (secure)][local_secure]

<a name="tasks"></a>

Other common tasks:

- [Insert Data](insert-data.html)
- [Query Data](query-data.html)
- [Update Data](update-data.html)
- [Delete Data](delete-data.html)
- [Run Multi-Statement Transactions](run-multi-statement-transactions.html)
- [Error Handling and Troubleshooting](error-handling-and-troubleshooting.html)
- [Make Queries Fast](make-queries-fast.html)
- [Hello World Example apps](hello-world-example-apps.html)

<!-- Reference Links -->

[manual]: manual-deployment.html
[orchestrated]: orchestration.html
[local_secure]: secure-a-cluster.html
[connection_params]: connection-parameters.html
