---
title: Connect to the Database
summary: How to connect to a CockroachDB cluster from your application
toc: true
---

<div class="filters filters-big clearfix">
  <button class="filter-button current">Local</button>
  <a href="connect-to-the-database-cockroachcloud.html"><button class="filter-button">{{ site.data.products.db }}</button></a>
</div>

This page has instructions for connecting to a CockroachDB cluster from your application using various programming languages. Each example shows a [connection string][connection_params] for a secure cluster to a `bank` database. Depending on your cluster's configuration, you may need to edit this connection string.

The connection strings listed on this page set the required authentication options to connect to [local](authentication.html) clusters. Local clusters use self-signed SSL certificates.

For a reference that lists all of the supported cluster connection parameters, see [Connection Parameters][connection_params].

## Before you begin

Do the following:

- Set up a local CockroachDB cluster:
  - [Install CockroachDB](install-cockroachdb.html).
  - [Start a local cluster](secure-a-cluster.html).
- [Install a client driver or ORM framework](install-client-drivers.html).

## Connect

<div class="filters clearfix">
  <button class="filter-button" data-scope="sql">SQL</button>
  <button class="filter-button" data-scope="go">Go</button>
  <button class="filter-button" data-scope="java">Java</button>
  <button class="filter-button" data-scope="python">Python</button>
</div>

<section class="filter-content" markdown="1" data-scope="sql">

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs --host=localhost:26257
~~~

For more information about how to use the built-in SQL client, see the [`cockroach sql`](cockroach-sql.html) reference docs.

</section>

<section class="filter-content" markdown="1" data-scope="go">

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

{{site.data.alerts.callout_success}}
{% include {{page.version.version}}/app/pkcs8-gen.md %}
{{site.data.alerts.end}}

{% include {{page.version.version}}/app/for-a-complete-example-java.md %}

</section>

<section class="filter-content" markdown="1" data-scope="python">

{% include_cached copy-clipboard.html %}
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

## What's next?

<a name="tasks"></a>

- [Design a Database Schema](schema-design-overview.html)
- [Insert Data](insert-data.html)
- [Query Data](query-data.html)
- [Update Data](update-data.html)
- [Delete Data](delete-data.html)

You might also be interested in the following pages:

- [Connection Pooling](connection-pooling.html)
- [Connection Parameters][connection_params]
- [Manual Deployments][manual]
- [Orchestrated Deployments][orchestrated]
- [Start a Local Cluster][local_secure]
- [Error Handling and Troubleshooting](error-handling-and-troubleshooting.html)
- [Optimize Statement Performance](make-queries-fast.html)
- [Hello World example apps](hello-world-example-apps.html)

<!-- Reference Links -->

[manual]: manual-deployment.html
[orchestrated]: orchestration.html
[local_secure]: secure-a-cluster.html
[connection_params]: connection-parameters.html
