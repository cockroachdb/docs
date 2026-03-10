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

Sizing a connection pool is critical to maximizing application performance. Too few connections and the application will be blocked, waiting for the connection pool to establish a new connection, or for an existing connection to become available. Conversely, a connection pool with too many connections actively executing a query at the same time can also result in high latency as the cluster cycles through every connection concurrently, decreasing efficiency as the cluster incurs a cost every time it context-switches through every query. For example, the time it takes for many threads to complete many queries in parallel is typically higher than that for a smaller number of threads scaled to the number of available vCPUs or IOPs.

{{site.data.alerts.callout_success}}
To read more about connection pooling, see our [What is Connection Pooling, and Why Should You Care](https://www.cockroachlabs.com/blog/what-is-connection-pooling/) blog post.
{{site.data.alerts.end}}

## Recommended settings for connection pools

These are Cockroach Labs recommendations for settings common to most connection pooling software. If your application has multiple workers, each worker should be configured based on the kinds of queries required for its workload.

### Set the maximum lifetime of connections

The maximum lifetime of a connection should be set to between 5 and 30 minutes. CockroachDB {{ site.data.products.cloud }} clusters support 30 minutes as the maximum connection lifetime. When a node is shut down or restarted, client connections can be reset after 30 minutes, causing a disruption to applications.

Cockroach Labs recommends starting with a 5 minute maximum connection lifetime and increasing the connection lifetime if there is an impact on tail latency, normally seen when there are large numbers of connections to a cluster. Setting the connection lifetime below 5 minutes is possible, but there is little benefit, and comes at a cost of increased CPU usage for clients and servers. The maximum connection lifetime changes the [rate of new connections per second](#monitor-new-connections) (i.e., average new connections per second = total connections / maximum connection age).

Configure your connection pooling with [connection jitter](#avoid-spikes-in-new-connections) to prevent connection storms.

### Set the maximum lifetime of idle connections

Set the maximum lifetime of idle connections to the same value as the [maximum lifetime of connections](#set-the-maximum-lifetime-of-connections).

### Set the maximum number of open connections

The maximum number of open connections should be set to a value that is greater than the maximum number of concurrent queries that your application worker expects to make. Doing so minimizes the need to establish new connections.

### Set the maximum number of idle connections

Set the maximum number of idle connections to the same value as the [maximum number of open connections](#set-the-maximum-number-of-open-connections).

## Optimize your connection pool

Follow these additional recommendations optimize the performance of your connection pool software.

### Avoid spikes in new connections

If possible configure your connection pool to avoid periodic spikes in new connections, also known as "thundering herds" or "connection storms." Most connection pools offer the ability to stagger their connection age through the use of a connection lifetime "jitter," where the wait time between new connections is randomized. Using a connection jitter of 10% of the maximum connection lifetime smooths out the rate of new connections to a cluster. For example, for a maximum connection lifetime of 1800 seconds (30 minutes), set the connection jitter to 500 seconds (3 minutes).

### Validate connections in a pool

After a connection pool initializes connections to CockroachDB clusters, those connections can occasionally break. This could be due to changes in the cluster topology, or rolling upgrades and restarts, or network disruptions.

Validating connections is typically handled automatically by the connection pool. For example, in HikariCP the connection is validated whenever you request a connection from the pool, and the [`keepaliveTime` property](https://github.com/brettwooldridge/HikariCP#frequently-used) allows you to configure an interval to periodically check if the connections in the pool are valid. Whatever connection pool you use, make sure connection validation is enabled when running your application.

## Size connection pools

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="shared"><strong>{{ site.data.products.basic }}/{{ site.data.products.standard }}</strong></button>
  <button class="filter-button page-level" data-scope="advanced"><strong>{{ site.data.products.advanced }}</strong></button>
  <button class="filter-button page-level" data-scope="selfhosted"><strong>{{ site.data.products.core }}</strong></button>
</div>

If your connection pool is properly configured, the total number of open connections to your cluster will typically be at least 100 times larger than the number of new connections per second to your cluster.

Idle connections in CockroachDB do not consume many resources compared to PostgreSQL. Unlike PostgreSQL, which has a hard limit of 5000 connections, CockroachDB can safely support tens of thousands of connections.

<section class="filter-content" markdown="1" data-scope="shared">

The [**SQL Connection** graph]({% link cockroachcloud/metrics-sql.md %}#sql-connections) shows how many new connections are being created each second. The [**Open SQL Sessions** graph]({% link cockroachcloud/metrics-sql.md %}#open-sql-sessions) shows the total number of SQL client connections across the cluster. To determine if your connection pool is correctly configured use the metrics from these graphs in the following formula:

**SQL Connection Attempts < SQL Open Sessions/100**

That is, divide the number of open SQL sessions by 100. This result should be less than the number of new SQL connections per second.

Configure the minimum number of connections to equal to the maximum number of connections, creating a fixed pool size.

Configure the maximum connection lifetime to 30 minutes.

Multi-region {{ site.data.products.basic }} and {{ site.data.products.standard }} clusters have the same recommendations as single-region clusters.

</section>

<section class="filter-content" markdown="1" data-scope="advanced selfhosted">

Use the following formula as a starting point to size the connection pool:

**active connections = (number of cores * 4)**

If you have a large number of services connecting to the same cluster, make sure the number of [concurrent active connections](#monitor-active-connections) across all the services does not exceed this recommendation. If each service has its own connection pool, ensure the total number of concurrent active connections across all services stays within this limit.

For multi-region clusters, create a connection pool per region, and apply the same active connection limits for each region in your cluster. For example, if you have 3 regions in your cluster, and each region has 12 vCPUs, the concurrent active connection limit **per region** is 48 (12 [processor cores] * 4).

{{site.data.alerts.callout_info}}
[Connection pool sizes](#set-the-maximum-number-of-open-connections) can be much larger than the active connections limit, since most connections will be idle and have almost no overhead.
{{site.data.alerts.end}}

{% include {{page.version.version}}/sql/server-side-connection-limit.md %}

</section>

Cockroach Labs strongly recommends that your application instance run in the same region as your CockroachDB cluster.

## Monitor SQL connections

To validate that your connection pool is correctly configured, monitor the SQL connection metrics and graphs on your cluster.

### Monitor new connections

<section class="filter-content" markdown="1" data-scope="advanced selfhosted">
The [`sql.new_conns` metric]({% link {{ page.version.version }}/metrics.md %}#available-metrics) and [**SQL Connection Rate** graph]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#sql-connection-rate) expose the number of new SQL connections per second.
</section>

<section class="filter-content" markdown="1" data-scope="shared">
The [**SQL Connections** graph]({% link cockroachcloud/metrics-sql.md %}#sql-connections) shows the number of new SQL connections per second.
</section>

A misconfigured connection pool will result in most database operations requiring a new connection to be established, which will increase query latency.

### Monitor active connections

<section class="filter-content" markdown="1" data-scope="advanced selfhosted">

The [`sql.conns` metric]({% link {{ page.version.version }}/metrics.md %}#available-metrics) and [**Open SQL Sessions** graph]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#open-sql-sessions) show the number of open connections on your cluster or node.

The [`sql.statements.active` metric]({% link {{ page.version.version }}/metrics.md %}#available-metrics) and [**Active SQL Statements** graph]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#active-sql-statements) show the number of **active** connections on your cluster or node. A connection is "active" when it is actively executing a query.

Using the following formula:

**active connections = (number of cores * 4)**

If the number of concurrent active connections exceeds 4 times the number of cores in your cluster, your application is likely not achieving maximum throughput. You should reduce the concurrent workload across your applications, or scale the cluster by adding more nodes or cores per node. Reducing the number of active connections may increase overall throughput, possibly at the expense of increased tail latency for your queries.

</section>

<section class="filter-content" markdown="1" data-scope="shared">

The [**Open SQL Sessions** graph]({% link cockroachcloud/metrics-sql.md %}#open-sql-sessions) shows the number of open connections on your cluster.

</section>

If your connection pool is properly configured, the total number of open connections to your cluster should be at least 100 times larger than the number of new connections per second to your cluster.

## Serverless functions

{{site.data.alerts.callout_info}}
"Serverless" refers to stateless, programmatic functions deployed in a cloud environment that provides an execution framework to provision resources dynamically, such as Amazon Lambda functions.
{{site.data.alerts.end}}

If your application uses serverless functions to connect to CockroachDB, use a connection pool if you plan to invoke functions frequently. To ensure that the connection pool is reused across invocations of the same function instance, initialize the connection pool variable outside the scope of the serverless function definition. Set the maximum connection pool size to 1, unless your function is multi-threaded and establishes multiple concurrent requests to your database within a single function instance.

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

The maximum lifetime of a connection is set to 300000 milliseconds, or 5 minutes.

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
config.setMaxLifetime(300000);
config.setKeepaliveTime(150000);

HikariDataSource ds = new HikariDataSource(config);

Connection conn = ds.getConnection();
~~~

</section>

<section class="filter-content" markdown="1" data-scope="go">

In this example, a Go application similar to the [basic pgx example]({% link {{ page.version.version }}/build-a-go-app-with-cockroachdb.md %}) uses the [pgxpool library](https://pkg.go.dev/github.com/jackc/pgx/v5/pgxpool) to create a connection pool on a CockroachDB cluster. The database is being run on 10 cores across the cluster.

Using the connection pool formula above:

**connections = (10 [processor cores] * 4)**

The connection pool size should be 40, and is set using the `pool_max_conns` query parameter.

The `pool_max_conn_lifetime` query parameter sets the maximum age of a connection to 300 seconds, or 5 minutes.

The `pool_max_conn_lifetime_jitter` query parameter sets the connection jitter to 30 seconds, or 10% of the maximum connection age.

~~~ go
// Set connection pool configuration, with maximum connection pool size.
config, err := pgxpool.ParseConfig("postgres://max:roach@127.0.0.1:26257/bank?sslmode=require&pool_max_conns=40&pool_max_conn_lifetime=300s&pool_max_conn_lifetime_jitter=30s")
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

For a full list of connection pool configuration parameters for pgxpool, see [the pgxpool documentation](https://pkg.go.dev/github.com/jackc/pgx/v5/pgxpool#Config).

</section>

## Known limitations

{% include {{ page.version.version }}/known-limitations/client-connections-limitations.md %}
