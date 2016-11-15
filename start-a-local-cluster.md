---
title: Start a Cluster
summary: Run a multi-node CockroachDB cluster locally with each node listening on a different port.
toc: false
toc_not_nested: true
asciicast: true
---

<style>
.filters .scope-button {
  width: 20%;
  height: 65px;
  margin: 30px 15px 10px 0px;
}
.filters a:hover {
  border-bottom: none;
}
</style>

<div id="step-three-filters" class="filters clearfix">
  <button class="filter-button scope-button current">From <strong>Binary</strong></button>
  <a href="start-a-local-cluster-in-docker.html"><button class="filter-button scope-button">In <strong>Docker</strong></button></a>
</div><p></p>

Once you've [installed the CockroachDB binary](install-cockroachdb.html), it's simple to start a multi-node cluster locally with each node listening on a different port. 

{{site.data.alerts.callout_info}}Running multiple nodes on a single host is useful for testing out CockroachDB, but it's not recommended for production deployments. To run a physically distributed cluster in production, see <a href="manual-deployment.html">Manual Deployment</a>, <a href="cloud-deployment.html">Cloud Deployment</a>, or <a href="orchestration.html">Orchestration</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Watch a Demo

Feel free to watch this process in action before going through the steps yourself. Note that you can copy commands directly from the video, and you can use **<** and **>** to go back and forward.

<asciinema-player src="asciicasts/start-a-local-cluster.json" cols="150" speed="2" theme="solarized-dark" poster="npt:0:30" title="Start a Local Cluster"></asciinema-player>

## Step 1. Start your first node

~~~ shell
$ cockroach start --background
~~~

~~~
CockroachDB node starting at {{site.data.strings.start_time}}
build:      {{site.data.strings.version}} @ {{site.data.strings.build_time}}
admin:      http://localhost:8080
sql:        postgresql://root@localhost:26257?sslmode=disable
logs:       cockroach-data/logs
store[0]:   path=cockroach-data
status:     initialized new cluster
clusterID:  {dab8130a-d20b-4753-85ba-14d8956a294c}
nodeID:     1
~~~

This command starts a node, accepting all [`cockroach start`](start-a-node.html) defaults.

- Communication is insecure, with the server listening only on `localhost` on port `26257` for internal and client communication and on port `8080` for HTTP requests from the Admin UI. 
   - To bind to different ports, set `--port=<port>` and `--http-port=<port>`. 
   - To bind the Admin UI to a private IP address or host, set `--http-host=<private-addr>`.
   - To listen on an external hostname or IP address, set `--insecure` and `--host=<external address>`. For a demonstration, see [Manual Deployment](manual-deployment.html). 

- Node data is stored in the `cockroach-data` directory. To store data in a different location, set `--store=<filepath>`. To use multiple stores, set this flag separately for each.

- The `--background` flag runs the node in the background so you can continue the next steps in the same shell. 

- The [standard output](start-a-node.html#standard-output) gives you a helpful summary: the CockroachDB version; the URL for the admin UI; the SQL URL for your client code; the storage locations for node and debug log data; whether the node is the first in the cluster, joined an existing cluster for the first time, or rejoined an existing cluster; the cluster ID; and the node ID.

{{site.data.alerts.callout_success}}By default, each node's cache is limited to 25% of available memory. This default is reasonable when running one node per host. When running multiple nodes on a single host, however, it may lead to out of memory errors, especially when testing against the cluster in a serious way. To avoid such errors, you can manually limit each node's cache size by setting the <a href="start-a-node.html#flags"><code>--cache</code></a> flag in the <code>start</code> command.{{site.data.alerts.end}}

## Step 2. Add nodes to the cluster
   
~~~ shell
# Start your second node:
$ cockroach start --background \
--store=node2 \
--port=26258 \
--http-port=8081 \
--join=localhost:26257

# Start your third node:
$ cockroach start --background \
--store=node3 \
--port=26259 \
--http-port=8082 \
--join=localhost:26257
~~~

These commands add two nodes to the cluster, but you can add as many as you like. For each node:

- Set the `--store` flag to a storage location not in use by other nodes. To use multiple stores, set this flag separately for each.

- Set the `--port` and `--http-port` flags to ports not in use by other nodes.

- The `--join` flag connects the new node to the cluster. Set this flag to `localhost` and the port of the first node. 

- The `--background` flag runs the node in the background so you can continue the next steps in the same shell.

{{site.data.alerts.callout_success}}If you don't plan to use more than one node, you can avoid unnecessary log messages about replication by editing the default <a href="configure-replication-zones.html">replication zone</a> to specify one node instead of three. See <a href="troubleshoot.html#replication-error-in-a-single-node-cluster">here</a> for more details.{{site.data.alerts.end}}

## Step 3. Use the built-in SQL client

Start the [built-in SQL shell](use-the-built-in-sql-client.html) on node 1:

~~~ shell
$ cockroach sql
# Welcome to the cockroach SQL interface.
# All statements must be terminated by a semicolon.
# To exit: CTRL + D.
~~~

Then run some [CockroachDB SQL statements](learn-cockroachdb-sql.html):

~~~ sql
> CREATE DATABASE bank;
~~~

~~~
CREATE DATABASE
~~~

~~~ sql
> CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
~~~

~~~
CREATE TABLE
~~~

~~~ sql
> INSERT INTO bank.accounts VALUES (1, 1000.50);
~~~

~~~
INSERT 1
~~~

~~~ sql
> SELECT * FROM bank.accounts;
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  1 |  1000.5 |
+----+---------+
(1 row)
~~~

When you're done, use **CTRL + D**, **CTRL + C**, or `\q` to exit the SQL shell.

## Step 4. Open the Admin UI

The CockroachDB [Admin UI](explore-the-admin-ui.html) lets you monitor cluster-wide, node-level, and database-level metrics and events. To start up the Admin UI, point your browser to `http://localhost:8080`. You can also find the address in the `admin` field in the standard output of any node on startup.

<img src="images/admin_ui.png" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

## Step 5.  Stop the cluster

You can stop the nodes (and therefore the cluster) as follows:

~~~ shell
# Stop node 1:
$ cockroach quit

# Stop node 2: 
$ cockroach quit --port=26258

# Stop node 3:
$ cockroach quit --port=26259
~~~

For more details about the `cockroach quit` command, see [Stop a Node](stop-a-node.html).

## What's Next?

[Secure your cluster](secure-a-cluster.html) with authentication and encryption. You might also be interested in:

- [Manual Deployment](manual-deployment.html): How to run CockroachDB across multiple machines
- [Cloud Deployment](cloud-deployment.html): How to run CockroachDB in the cloud
- [Orchestration](orchestration.html): How to further automate CockroachDB with orchestration tools
