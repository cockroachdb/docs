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

Creating the appropriate size pool of connections is critical to gaining maximum performance in an application. Too few connections in the pool will result in high latency as each operation waits for a connection to open up. But adding too many connections to the pool can also result in high latency as each connection thread is being run in parallel by the system. The time it takes for many threads to complete in parallel is higher than the time it takes a smaller number of threads to run sequentially.

This seems counterintuitive. Shouldn't a pool maintain more threads so each operation can immediately get a connection to the database server, and then let the system process these threads in parallel? Each processor core, however, can only execute one thread at a time. When there are more threads than processor cores, the system will use context switching to time slice the thread execution. For example, if you have a system with a single core and two threads, processing threads 1 and 2 in parallel results in the system context switching to pause execution of thread 1 and begin executing thread 2, and then pause execution of thread 2 to resume executing thread 1. Executing thread 1 completely and then executing thread 2 will be faster because the system doesn't need to context switch, even though thread 2 had to wait until thread 1 fully completed to begin executing.

Processor performance isn't the only factor, however. Storage and network performance also will affect the ability of a thread to fully execute. If a thread is blocked by network or storage latency, adding connections to the pool is a good idea so other threads can execute while the original thread is being blocked.

If your storage system uses disks, disk latency from the spinning disk platters will result in blocking in thread execution. Using non-disk storage like SSDs will usually result in better latency. However like the processor core limitation, using SSDs doesn't mean that you should increase the connection pool size. It means you should keep the connection pool size closer to the number of processor cores.

Network latency is typically the least important factor in determining the connection pool size.

The HikariCP project recommends the following formula for sizing your connection pool:

~~~
connections = ((number of cores * 2)) + effective spindle count)
~~~

The "effective spindle count" is the number of disks that are active after the storage data has filled any disk cache. If the data is fully cached, the effective spindle count is zero. If there is no disk cache, the effective spindle count is the number of disk spindles.

This formula is a good starting point for testing your application performance.

## Example using HikariCP and JDBC

In this example, a Java application similar to the [basic JDBC example](build-a-java-app-with-cockroachdb.html) uses the PostgreSQL JDBC driver and HikariCP as the connection pool layer to connect to a CockroachDB cluster. The application is being run on a 10 core server that uses 2 disks as storage.

Using the connection pool formula above:

~~~
connections = ((10 [processor cores] * 2)) + 2 [spindles] )
~~~

The connection pool size should be 22.

~~~ java
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:postgresql://localhost:26257/bank");
config.setUsername("maxroach");
config.setPassword("password");
config.addDataSourceProperty("ssl", "true");
config.addDataSourceProperty("sslMode", "require")
config.addDataSourceProperty("reWriteBatchedInserts", "true");
config.setAutoCommit(false);
config.setMaximumPoolSize(22);

HikariDataSource ds = new HikariDataSource(config);

Connection conn = ds.getConnection();
~~~
