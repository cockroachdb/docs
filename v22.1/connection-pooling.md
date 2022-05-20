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

## Sizing connection pools

Idle connections in CockrochDB do not consume many resources compared to PostgreSQL. Cockroach Labs estimates the memory overhead of idle connections in CockrochDB is 20 kB to 30 kB per connection.

Creating the appropriate size pool of connections is critical to gaining maximum performance in an application. Too few connections in the pool will result in high latency as each operation waits for a connection to open up. But adding too many connections to the pool can also result in high latency as each connection thread is being run in parallel by the system. The time it takes for many threads to complete in parallel is typically higher than the time it takes a smaller number of threads to run sequentially.

Each processor core can only execute one thread at a time. When there are more threads than processor cores, the system will use context switching to [time-slice](https://en.wikipedia.org/wiki/Preemption_(computing)#Time_slice) the thread execution. For example, if you have a system with a single core and two threads, processing threads 1 and 2 in parallel results in the system context switching to pause execution of thread 1 and begin executing thread 2, and then pause execution of thread 2 to resume executing thread 1. Executing thread 1 completely and then executing thread 2 will be faster because the system doesn't need to context switch, even though thread 2 had to wait until thread 1 fully completed to begin executing.

Storage and network performance also will affect the ability of a thread to fully execute. If a thread is blocked by network or storage latency, adding connections to the pool is a good idea so other threads can execute while the original thread is being blocked.

Cockroach Labs performed lab testing of various customer workloads and found no improvement in scalability beyond:

**connections = (number of cores * 4)**

Many workloads perform best when the maximum number of active connections is between 2 and 4 times the number of CPU cores in the cluster.

If you have a large number of services connecting to the same cluster, make sure the number of concurrent active connections across all the services does not exceed this recommendation by a large amount. If each service has its own connection pool, then you should make sure the sum of all the pool sizes is close to our maximum connections recommendation. Each workload and application is different, so you should conduct testing to determine the best-performing pool sizes for each service in your architecture.

In addition to setting a maximum connection pool size, set the maximum number of idle connections if possible. Cockroach Labs recommends setting the maximum number of idle connections to the maximum pool size. While this uses more memory, it allows many connections when concurrency is high without having to create a new connection for every new operation.

{% include {{page.version.version}}/sql/server-side-connection-limit.md %} This may be useful in addition to your connection pool settings.

## Validating connections in a pool

After a connection pool initializes connections to CockroachDB clusters, those connections can occasionally break. This could be due to changes in the cluster topography, or rolling upgrades and restarts, or network disruptions. {{ site.data.products.db }} clusters periodically are restarted for patch version updates, for example, so previously established connections would be invalid after the restart.

Validating connections is typically handled automatically by the connection pool. For example, in HikariCP the connection is validated whenever you request a connection from the pool, and the `keepaliveTime` property allows you to configure an interval to periodically check if the connections in the pool are valid. Whatever connection pool you use, make sure connection validation is enabled when running your application.

## Example

<div class="filters clearfix">
  <button class="filter-button" data-scope="java">Java (Hikari/JDBC)</button>
  <button class="filter-button" data-scope="go">Go (pgxpool)</button>
</div>

<section class="filter-content" markdown="1" data-scope="java">

In this example, a Java application similar to the [basic JDBC example](build-a-java-app-with-cockroachdb.html) uses the [PostgreSQL JDBC driver](https://jdbc.postgresql.org/) and [HikariCP](https://github.com/brettwooldridge/HikariCP) as the connection pool layer to connect to a CockroachDB cluster. The database is being run on 10 cores across the cluster.

Using the connection pool formula above:

**connections = (10 [processor cores] * 4)**

The connection pool size should be 40.

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

In this example, a Go application similar to the [basic pgx example](build-a-go-app-with-cockroachdb.html) uses the [pgxpool library](https://pkg.go.dev/github.com/jackc/pgx/v4/pgxpool) to create a connection pool on a CockroachDB cluster. The database is being run on 10 cores across the cluster.

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

This example uses the `pool_max_conns` parameter to set the maximum number of connections in the connection pool to 30.

For a full list of connection pool configuration parameters for pgxpool, see [the pgxpool documentation](https://pkg.go.dev/github.com/jackc/pgx/v4/pgxpool#Config).

</section>

## Implementing connection retry logic

Some operational processes involve [node shutdown](node-shutdown.html). During the shutdown sequence, the server forcibly closes all SQL client connections to the node. If any open transactions were interrupted or not admitted by the server because of the connection closure, they will fail with a connection error.

To be resilient to connection closures, your application should use a retry loop to reissue transactions that were open when a connection was closed. This allows procedures such as [rolling upgrades](upgrade-cockroach-version.html) to complete without interrupting your service. For details, see [Connection retry loop](node-shutdown.html#connection-retry-loop).

If you cannot tolerate connection errors during node drain, you can change the `server.shutdown.connection_wait` [cluster setting](cluster-settings.html) to allow SQL client connections to gracefully close before CockroachDB forcibly closes them. For guidance, see [Node Shutdown](node-shutdown.html#server-shutdown-connection_wait).