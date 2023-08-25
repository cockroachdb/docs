---
title: Connection Pooling
summary: How to plan, configure, and use connection pools when using drivers or frameworks with CockroachDB.
toc: true
docs_area: develop
---

This page has information on planning, configuring, and using connection pools when using drivers or frameworks with CockroachDB.

{% include {{ page.version.version }}/prod-deployment/terminology-vcpu.md %}

## About connection pools

A typical database operation consists of several steps.

1. The driver uses a configuration to start a connection to the database server.
1. A network socket is opened on the client that connects to the database server.
1. Data is read or written through the network socket.
1. The connection is closed down.
1. The network socket is closed down and its resources are freed.

For simple database operations, these steps are not expensive, but as an application scales up, the performance of the application will suffer as each connection is created and destroyed. One pattern for improving performance is a connection pool, a group of already configured and established network connections between the client and database that can be reused for data operations within an application.

Each time an application reads or writes data, it will request one of the connections in the pool. After the data operation completes, the connection is returned to the pool so other operations can use it.

Connection pooling can be a enabled as a feature of the driver, a separate library used in conjunction with a driver, a feature of an application server, or a proxy server that acts as a gateway to the database server.

{{site.data.alerts.callout_success}}
To read more about connection pooling, see our [What is Connection Pooling, and Why Should You Care](https://www.cockroachlabs.com/blog/what-is-connection-pooling/) blog post.
{{site.data.alerts.end}}

## Size connection pools

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="serverless"><strong>{{ site.data.products.serverless }}</strong></button>
  <button class="filter-button page-level" data-scope="dedicated"><strong>{{ site.data.products.dedicated }}</strong></button>
  <button class="filter-button page-level" data-scope="selfhosted"><strong>{{ site.data.products.core }}</strong></button>
</div>

Idle connections in CockroachDB do not consume many resources compared to PostgreSQL. Cockroach Labs estimates the memory overhead of idle connections in CockroachDB is 20 kB to 30 kB per connection.

Creating the appropriate size pool of connections is critical to gaining maximum performance in an application. Too few connections in the pool will result in high latency as each operation waits for a connection to open up. But adding too many connections to the pool can also result in high latency as each connection thread is being run in parallel by the system. The time it takes for many threads to complete in parallel is typically higher than the time it takes a smaller number of threads to run sequentially.

<section class="filter-content" markdown="1" data-scope="serverless">

In {{ site.data.products.serverless }} clusters, the purpose of the connection pool is to reduce connection latency, not to set a maximum number of simultaneous connections. {{ site.data.products.serverless }} clusters will automatically scale up to meet the demand from multiple simultaneous client connections.

Set the connection pool size to match your application and workload.

</section>

<section class="filter-content" markdown="1" data-scope="dedicated selfhosted">

Each processor core can only execute one thread at a time. When there are more threads than processor cores, the system will use context switching to [time-slice](https://wikipedia.org/wiki/Preemption_(computing)#Time_slice) the thread execution. For example, if you have a system with a single core and two threads, processing threads 1 and 2 in parallel results in the system context switching to pause execution of thread 1 and begin executing thread 2, and then pause execution of thread 2 to resume executing thread 1. Executing thread 1 completely and then executing thread 2 will be faster because the system doesn't need to context switch, even though thread 2 had to wait until thread 1 fully completed to begin executing.

Storage and network performance also will affect the ability of a thread to fully execute. If a thread is blocked by network or storage latency, adding connections to the pool is a good idea so other threads can execute while the original thread is being blocked.

Cockroach Labs performed lab testing of various customer workloads and found no improvement in scalability beyond:

**connections = (number of cores * 4)**

Many workloads perform best when the maximum number of active connections is between 2 and 4 times the number of CPU cores in the cluster.

If you have a large number of services connecting to the same cluster, make sure the number of concurrent active connections across all the services does not exceed this recommendation by a large amount. If each service has its own connection pool, then you should make sure the sum of all the pool sizes is close to our maximum connections recommendation. Each workload and application is different, so you should conduct testing to determine the best-performing pool sizes for each service in your architecture.

In addition to setting a maximum connection pool size, set the maximum number of idle connections if possible. Cockroach Labs recommends setting the maximum number of idle connections to the maximum pool size. While this uses more memory, it allows many connections when concurrency is high without having to create a new connection for every new operation.

Configure the minimum number of connections to equal to the maximum number of connections, creating a fixed pool size.

Do not set the connection pool timeout values to be too short, as it may cause the connection pool software to close and reopen connections frequently, causing increased latency. [Monitor the `sql.new_conns` metric](#monitor-new-connections) to make sure the timeout values are set correctly.

{% include {{page.version.version}}/sql/server-side-connection-limit.md %} This may be useful in addition to your connection pool settings.

</section>

### Size connection pools in multi-region clusters

<section class="filter-content" markdown="1" data-scope="serverless">

Similar to single-region {{ site.data.products.serverless }} clusters, the purpose of connection pools in multi-region {{ site.data.products.serverless }} clusters is to reduce connection latency. Add a connection pool for each region, and size the idle pool for your application and workload.

The cluster will automatically scale up to meet demand, so there's no need to set a maximum connection pool size.

</section>

<section class="filter-content" markdown="1" data-scope="dedicated selfhosted">

For multi-region clusters, create a connection pool per region, and size the maximum connection pool for each region in your cluster using the same formula as a single-region cluster.

For example, if you have 3 regions in your cluster, and each region has 12 vCPUs, create a connection pool for each region, with each connection pool having a maximum pool size of 48 (12 [processor cores] * 4).

</section>

## Validate connections in a pool

After a connection pool initializes connections to CockroachDB clusters, those connections can occasionally break. This could be due to changes in the cluster topography, or rolling upgrades and restarts, or network disruptions. CockroachDB {{ site.data.products.cloud }} clusters periodically are restarted for patch version updates, for example, so previously established connections would be invalid after the restart.

Validating connections is typically handled automatically by the connection pool. For example, in HikariCP the connection is validated whenever you request a connection from the pool, and the `keepaliveTime` property allows you to configure an interval to periodically check if the connections in the pool are valid. Whatever connection pool you use, make sure connection validation is enabled when running your application.

<section class="filter-content" markdown="1" data-scope="dedicated selfhosted">

## Monitor new connections

The [`sql.new_conns` metric](metrics.html#available-metrics) exposes the number of new SQL connections per second. A properly configured connection pool will show this value to be in the low single digits. A misconfigured connection pool will result in much higher values. You can expose and monitor this metric in the [DB Console](ui-custom-chart-debug-page.html).

</section>

## Example

<div class="filters clearfix">
  <button class="filter-button" data-scope="java">Java (Hikari/JDBC)</button>
  <button class="filter-button" data-scope="go">Go (pgxpool)</button>
</div>

<section class="filter-content" markdown="1" data-scope="java">

In this example, a Java application similar to the [basic JDBC example]({% link {{ page.version.version }}/build-a-java-app-with-cockroachdb.md %}) uses the [PostgreSQL JDBC driver](https://jdbc.postgresql.org/) and [HikariCP](https://github.com/brettwooldridge/HikariCP) as the connection pool layer to connect to a CockroachDB cluster. The database is being run on 10 cores across the cluster.

Using the connection pool formula above:

**connections = (10 [processor cores] * 4)**

The connection pool size should be 40.

{% include_cached copy-clipboard.html %}
~~~ java
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:postgresql://localhost:26257/bank");
config.setUsername("maxroach");
config.setPassword("password");
config.addDataSourceProperty("ssl", "true");
config.addDataSourceProperty("sslmode", "require");
config.addDataSourceProperty("reWriteBatchedInserts", "true");
config.setAutoCommit(false);
config.setMaximumPoolSize(40);
config.setKeepaliveTime(150000);

HikariDataSource ds = new HikariDataSource(config);

Connection conn = ds.getConnection();
~~~

</section>

<section class="filter-content" markdown="1" data-scope="go">

In this example, a Go application similar to the [basic pgx example]({% link {{ page.version.version }}/build-a-go-app-with-cockroachdb.md %}) uses the [pgxpool library](https://pkg.go.dev/github.com/jackc/pgx/v4/pgxpool) to create a connection pool on a CockroachDB cluster. The database is being run on 10 cores across the cluster.

Using the connection pool formula above:

**connections = (10 [processor cores] * 4)**

The connection pool size should be 40.

~~~ go
// Set connection pool configuration, with maximum connection pool size.
config, err := pgxpool.ParseConfig("postgres://max:roach@127.0.0.1:26257/bank?sslmode=require&pool_max_conns=40")
	if err != nil {
		log.Fatal("error configuring the database: ", err)
	}

// Create a connection pool to the "bank" database.
dbpool, err := pgxpool.ConnectConfig(context.Background(), config)
if err != nil {
	log.Fatal("error connecting to the database: ", err)
}
defer dbpool.Close()
~~~

This example uses the `pool_max_conns` parameter to set the maximum number of connections in the connection pool to 40.

For a full list of connection pool configuration parameters for pgxpool, see [the pgxpool documentation](https://pkg.go.dev/github.com/jackc/pgx/v4/pgxpool#Config).

</section>

## Implement connection retry logic

Some operational processes involve [node shutdown]({% link {{ page.version.version }}/node-shutdown.md %}). During the shutdown sequence, the server forcibly closes all SQL client connections to the node. If any open transactions were interrupted or not admitted by the server because of the connection closure, they will fail with a connection error.

To be resilient to connection closures, your application should use a retry loop to reissue transactions that were open when a connection was closed. This allows procedures such as [rolling upgrades]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}) to complete without interrupting your service. For details, see [Connection retry loop]({% link {{ page.version.version }}/node-shutdown.md %}#connection-retry-loop).

If you cannot tolerate connection errors during node drain, you can change the `server.shutdown.connection_wait` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to allow SQL client connections to gracefully close before CockroachDB forcibly closes them. For guidance, see [Node Shutdown]({% link {{ page.version.version }}/node-shutdown.md %}#server-shutdown-connection_wait).
