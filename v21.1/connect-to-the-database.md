---
title: Connect to the Database
summary: How to connect to a CockroachDB cluster from your application
toc: true
---

This page has instructions for connecting to a CockroachDB or CockroachCloud cluster from your application using various programming languages. Each example shows a [connection string][connection_params] for a secure cluster to a `bank` database. Depending on your cluster's configuration, you may need to edit this connection string.

The connection strings listed on this page set the required authentication options to connect to either [local](authentication.html) or [free CockroachCloud](cockroachcloud/authentication.html) clusters. Local clusters use self-signed SSL certificates. CockroachCloud clusters use a signed certificate generated for your cluster that you download from the CockroachCloud console.

For a reference that lists all of the supported cluster connection parameters, see [Connection Parameters][connection_params].

<div class="filters filters-big clearfix">
  <button class="filter-button" data-scope="local">Local</button>
  <button class="filter-button" data-scope="cockroachcloud">CockroachCloud</button>
</div>

## Before you begin

Do the following:

- Set up either a local CockroachDB or a CockroachCloud cluster:
-- [Create](install-cockroachdb.html) and [configure](secure-a-cluster.html) a local cluster.
-- [Create](cockroachcloud/create-your-cluster.html) and [configure](cockroachcloud/connect-to-your-cluster.html) a CockroachCloud cluster.
- [Installed a Postgres client](install-client-drivers.html).

## Connect

<div class="filters clearfix">
  <button class="filter-button" data-scope="sql">SQL</button>
  <button class="filter-button" data-scope="go">Go</button>
  <button class="filter-button" data-scope="java">Java</button>
  <button class="filter-button" data-scope="python">Python</button>
</div>

<section class="filter-content" markdown="1" data-scope="sql">

<section class="filter-content" markdown="1" data-scope="cockroachcloud">
{% remote_include https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/cockroachcloud/connect_to_crc.md|<!-- BEGIN CRC free sql -->|<!-- END CRC free sql --> %}
</section>

<section class="filter-content" markdown="1" data-scope="local">
{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs --host=localhost:26257
~~~
</section>

For more information about how to use the built-in SQL client, see the [`cockroach sql`](cockroach-sql.html) reference docs.

</section>

<section class="filter-content" markdown="1" data-scope="go">

<section class="filter-content" markdown="1" data-scope="cockroachcloud">
{% include copy-clipboard.html %}
~~~ go
import (
    "database/sql"
    "fmt"
    "log"
    _ "github.com/lib/pq"
)

db, err := sql.Open("postgres",
        "postgresql://<user>:<password>@<global host>:26257/bank?sslmode=verify-full&sslrootcert=<path to the CA certificate>&options=--cluster=<cluster_name>")
if err != nil {
    log.Fatal("error connecting to the database: ", err)
}
defer db.Close()
~~~
</section>

<section class="filter-content" markdown="1" data-scope="local">
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
</section>

{% include {{page.version.version}}/app/for-a-complete-example-go.md %}

</section>

<section class="filter-content" markdown="1" data-scope="java">

<section class="filter-content" markdown="1" data-scope="cockroachcloud">
{% include copy-clipboard.html %}
~~~ java
import java.sql.*;
import javax.sql.DataSource;

PGSimpleDataSource ds = new PGSimpleDataSource();
ds.setServerName("<global host>");
ds.setPortNumber(26257);
ds.setDatabaseName("<cluster name>.bank");
ds.setUser("<username>");
ds.setPassword("<password>");
ds.setSsl(true);
ds.setSslMode("verify-full");
ds.setSslrootCert("<path to the CA certificate>");
ds.setReWriteBatchedInserts(true); // add `rewriteBatchedInserts=true` to pg connection string
ds.setApplicationName("BasicExample");
~~~
</section>

<section class="filter-content" markdown="1" data-scope="local">
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
</section>

{% include {{page.version.version}}/app/for-a-complete-example-java.md %}

</section>

<section class="filter-content" markdown="1" data-scope="python">

<section class="filter-content" markdown="1" data-scope="cockroachcloud">
{% include copy-clipboard.html %}
~~~ python
import psycopg2

conn = psycopg2.connect(
    database='bank',
    user='<username>',
    password='<password>'
    sslmode='verify-full',
    sslrootcert='<path to the CA certificate>',
    port=26257,
    host='<global host>',
    options="--cluster=<cluster_name>"
)
~~~
</section>

<section class="filter-content" markdown="1" data-scope="local">
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
</section>

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
