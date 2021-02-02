---
title: Connection Pooling
summary: How to create connection pools to CockroachDB
toc: true
---

This page has information on planning, configuring, and using connection pools when using drivers or frameworks with CockroachDB.

## About connection pools

A typical database operation consists of several steps.

1. The driver uses a configuration to start a connection the database server.
1. A network socket is opened on the client that connects to the database server.
1. Data is read or written through the network socket.
1. The connection is closed down.
1. The network socket is closed down and its resources freed.

For simple database operations, these steps are not expensive, but as an application scales up the performance of the application will suffer as each connection is created and destroyed. One pattern for improving performance is a connection pool, a group of already configured and established network connections between the client and database that can be reused for data operations within an application.

Each time an application reads or writes data, it will request one of the connections in the pool. After the data operation completes, the connection is returned to the pool so other operations can use it.

Connection pooling can be a enabled as a feature of the driver, a separate library used in conjunction with a driver, a feature of an application server, or a proxy server that acts as a gateway to the database server.

## Sizing connection pools

Creating the appropriate size pool of connections is critical to gaining maximum performance in an application. Too few connections in the pool will result in high latency as each operation waits for a connection to open up. But adding too many connections to the pool can also result in high latency as each connection thread is being run in parallel by the system. The time it takes for many threads to complete in parallel is typically higher than the time it takes a smaller number of threads to run sequentially.

Each processor core can only execute one thread at a time. When there are more threads than processor cores, the system will use context switching to [time-slice](https://en.wikipedia.org/wiki/Preemption_(computing)#Time_slice) the thread execution. For example, if you have a system with a single core and two threads, processing threads 1 and 2 in parallel results in the system context switching to pause execution of thread 1 and begin executing thread 2, and then pause execution of thread 2 to resume executing thread 1. Executing thread 1 completely and then executing thread 2 will be faster because the system doesn't need to context switch, even though thread 2 had to wait until thread 1 fully completed to begin executing.

Storage and network performance also will affect the ability of a thread to fully execute. If a thread is blocked by network or storage latency, adding connections to the pool is a good idea so other threads can execute while the original thread is being blocked.

Cockroach Labs performed lab testing of various customer workloads and found no improvement in scalability beyond:

connections = (number of cores * 4)

Many workloads perform best when the number of connections was between 2 and 4 times the number of CPU cores in the cluster.

## Validating connections in a pool

After a connection pool initializes connections to CockroachDB clusters, those connections can occasionally break. This could be due to changes in the cluster topography, or rolling upgrades and restarts, or network disruptions. CockroachCloud clusters periodically are restarted for minor version updates, for example, so previously established connections would be invalid after the restart.

Validating connections is typically handled automatically by the connection pool. For example, in HikariCP the connection is validated whenever you request a connection from the pool, and the `keepaliveTime` property allows you to configure an interval to periodically check if the connections in the pool are valid. Whatever connection pool you use, make sure connection validation is enabled when running your application.

## Example using HikariCP and JDBC

In this example, a Java application similar to the [basic JDBC example](build-a-java-app-with-cockroachdb.html) uses the [PostgreSQL JDBC driver](https://jdbc.postgresql.org/) and [HikariCP](https://github.com/brettwooldridge/HikariCP) as the connection pool layer to connect to a CockroachDB cluster. The database is being run on 10 cores across the cluster.

Using the connection pool formula above:

connections = (10 [processor cores] * 3)

The connection pool size should be 30.

~~~ java
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:postgresql://localhost:26257/bank");
config.setUsername("maxroach");
config.setPassword("password");
config.addDataSourceProperty("ssl", "true");
config.addDataSourceProperty("sslMode", "require")
config.addDataSourceProperty("reWriteBatchedInserts", "true");
config.setAutoCommit(false);
config.setMaximumPoolSize(30);
config.setKeepaliveTime(150000);

HikariDataSource ds = new HikariDataSource(config);

Connection conn = ds.getConnection();
~~~
