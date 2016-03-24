---
title: Start a Cluster
toc: false
expand: true
---

Once you've [installed CockroachDB](install-cockroachdb.html), you can quickly start a local single- or multi-node cluster with each node listening on a different port. For details about running CockroachDB on multiple machines or in the cloud, see <a href="manual-deployment.html">Manual Deployment</a> or <a href="cloud-deployment.html">Cloud Deployment</a>.

1.  From the directory with the `cockroach` binary, start your first node:

    ~~~ shell
    $ ./cockroach start --insecure &

    build:     alpha.v1-903-g51388a2 @ 2016/03/11 14:15:26 (go1.6)
    admin:     http://ROACHs-MBP:8080
    sql:       postgresql://root@ROACHs-MBP:26257?sslmode=disable
    logs:      cockroach-data/logs
    store[0]:  path=cockroach-data
    ~~~

    <button type="button" class="btn details collapsed" data-toggle="collapse" data-target="#details1">Details</button>
    <div id="details1" class="collapse">
      <ul>
        <li> The <code>--insecure</code> flag sets client/server communication to insecure on the default port, 26257. To bind to different port, set <code>--port=&#60;port&#62;</code> and <code>--http-port=&#60;port&#62;</code>.</li>
        <li>Node storage defaults to the <code>cockroach-data</code> directory. To store to a different location, set <code>--store=&#60;filepath&#62;</code>. To use multiple stores, set this flag separately for each.</li>
        <li>The standard output gives you a helpful summary of the CockroachDB version, the URL for the admin UI, the SQL URL for your client code, and the storage locations for node and debug log data.</li>
        <li>For more details about the <code>cockroach start</code> command, see <a href="start-a-node.html">Start a Node</a>.</li>
      </ul>
    </div>

2.  For each additional node, repeat step 1 with a few extra flags:
   
    ~~~ shell
    $ ./cockroach start --insecure --store=cockroach-data2 --port=26258 --http-port=8081 --join=localhost:26257 &
    $ ./cockroach start --insecure --store=cockroach-data3 --port=26259 --http-port=8082 --join=localhost:26257 &
    ~~~

    <button type="button" class="btn details collapsed" data-toggle="collapse" data-target="#details2">Details</button>
    <div id="details2" class="collapse">
      <p>These commands add two nodes to the cluster, but you can add as many as you like. For each node:
      <ul>
        <li>Set the <code>--store</code> flag to a storage location not in use by other nodes. To use multiple stores, set this flag separately for each.</li>
        <li>Set the <code>--port</code> and <code>--http-port</code> flags to ports not in use by other nodes.</li>
        <li>The <code>--join</code> flag connects the new node to the cluster. Set this flag to <code>localhost</code> and the port of the first node.</li>
      </ul>
    </div>

3.  Start the [built-in SQL client](use-the-built-in-sql-client.html) as an interactive shell:

    ~~~ shell
    $ ./cockroach sql --insecure
    # Welcome to the cockroach SQL interface.
    # All statements must be terminated by a semicolon.
    # To exit: CTRL + D.
    ~~~

4.  Run some [CockroachDB SQL statements](learn-cockroachdb-sql.html):

    ~~~ shell
    root@:26257> CREATE DATABASE bank;
    CREATE DATABASE

    root@:26257> SET DATABASE = bank;
    SET

    root@:26257> CREATE TABLE accounts (id INT PRIMARY KEY, balance DECIMAL);
    CREATE TABLE

    root@26257> INSERT INTO accounts VALUES (1234, DECIMAL '10000.50');
    INSERT 1

    root@26257> SELECT * FROM accounts;
    +------+----------+
    |  id  | balance  |
    +------+----------+
    | 1234 | 10000.50 |
    +------+----------+
    ~~~

    When you're done using the SQL shell, press **CTRL + D** to exit.
 
5.  [Check out the Admin UI](explore-the-admin-ui.html) by pointing your browser to `http://<localhost>:8080`. You can find the complete address in the `admin` field in the standard output of any node on startup.

    <img src="images/admin_ui.png" style="border:1px solid #eee;max-width:100%" />

## What's Next?

[Secure your cluster](secure-a-cluster.html) with authentication and encryption.
