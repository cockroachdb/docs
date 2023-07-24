---
title: Connect to the Database (CockroachDB Cloud)
summary: How to connect to a CockroachDB Cloud cluster from your application
toc: true
---

<div class="filters filters-big clearfix">
  <a href="connect-to-the-database.html"><button class="filter-button">Local</button></a>
  <button class="filter-button current">{{ site.data.products.db }}</button>
</div>

This page has instructions for connecting to a {{ site.data.products.db }} cluster from your application using various programming languages. Each example shows a [connection string][connection_params] for a secure cluster to a `bank` database. Depending on your cluster's configuration, you may need to edit this connection string.

The connection strings listed on this page set the required authentication options to connect to [free {{ site.data.products.db }}](../cockroachcloud/authentication.html) clusters. {{ site.data.products.db }} clusters use a signed certificate generated for your cluster that you download from the {{ site.data.products.db }} console.

For a reference that lists all of the supported cluster connection parameters, see [Connection Parameters][connection_params].

## Before you begin

Do the following:

 <a name="set-up-your-cluster-connection"></a>

- Set up a {{ site.data.products.db }} cluster:
  - [Create a {{ site.data.products.db }} cluster](../cockroachcloud/create-your-cluster.html).
  - [Connect to the {{ site.data.products.db }} cluster](../cockroachcloud/connect-to-your-cluster.html).
- [Install a client driver or ORM framework](install-client-drivers.html).

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
$ cockroach sql \
--url='postgres://{username}:{password}@{globalhost}:26257/{cluster_name}.{database}?sslmode=verify-full&sslrootcert={path to the CA certificate}'
~~~

{% include {{page.version.version}}/app/cc-free-tier-params.md %}

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
        "postgresql://{username}:{password}@{globalhost}:26257/bank?sslmode=verify-full&sslrootcert={path to the CA certificate}&options=--cluster={cluster_name}")
if err != nil {
    log.Fatal("error connecting to the database: ", err)
}
defer db.Close()
~~~

{% include {{page.version.version}}/app/cc-free-tier-params.md %}

{% include {{page.version.version}}/app/for-a-complete-example-go.md %}

</section>

<section class="filter-content" markdown="1" data-scope="java">

{% include copy-clipboard.html %}
~~~ java
import java.sql.*;
import javax.sql.DataSource;

PGSimpleDataSource ds = new PGSimpleDataSource();
ds.setServerName("{globalhost}");
ds.setPortNumber(26257);
ds.setDatabaseName("{cluster_name}.bank");
ds.setUser("{username}");
ds.setPassword("{password}");
ds.setSsl(true);
ds.setSslMode("verify-full");
ds.setSslrootCert("{path to the CA certificate}");
ds.setReWriteBatchedInserts(true); // add `rewriteBatchedInserts=true` to pg connection string
ds.setApplicationName("BasicExample");
~~~

{% include {{page.version.version}}/app/cc-free-tier-params.md %}

{% include {{page.version.version}}/app/for-a-complete-example-java.md %}

</section>

<section class="filter-content" markdown="1" data-scope="python">

{% include copy-clipboard.html %}
~~~ python
import psycopg2

conn = psycopg2.connect(
    database='bank',
    user='{username}',
    password='{password}'
    sslmode='verify-full',
    sslrootcert='{path to the CA certificate}',
    port=26257,
    host='{globalhost}',
    options="--cluster={cluster_name}"
)
~~~

{% include {{page.version.version}}/app/cc-free-tier-params.md %}

{% include {{page.version.version}}/app/for-a-complete-example-python.md %}

</section>

{% include cockroachcloud/cc-no-user-certs.md %}

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
- [Optimize Query Performance](make-queries-fast.html)
- [Hello World example apps](example-apps.html)

<!-- Reference Links -->

[manual]: manual-deployment.html
[orchestrated]: orchestration.html
[local_secure]: secure-a-cluster.html
[connection_params]: connection-parameters.html
