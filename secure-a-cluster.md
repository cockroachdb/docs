---
title: Secure a Cluster
summary: Learn how to secure a CockroachDB cluster with authentication and encryption.
toc: false
asciicast: true
---

Now that you've seen how easy it is to start, use, and stop a [local cluster](start-a-local-cluster.html), let's secure the cluster with authentication and encryption. This involves creating certificates and restarting nodes with a few additional flags.

<div id="toc"></div>

## Watch a Demo

Feel free to watch this process in action before going through the steps yourself. Note that you can copy commands directly from the video, and you can use **<** and **>** to go back and forward.

<asciinema-player class="asciinema-demo" src="asciicasts/secure-a-cluster.json" cols="107" speed="2" theme="monokai" poster="npt:0:52" title="Secure a Cluster"></asciinema-player>

## Step 1.  Create security certificates

~~~ shell
# Create a certs directory:
$ mkdir certs

# Create the CA key pair:
$ cockroach cert create-ca \
--ca-cert=certs/ca.cert \
--ca-key=certs/ca.key

# Create a client key pair for the root user:
$ cockroach cert create-client \
root \
--ca-cert=certs/ca.cert \
--ca-key=certs/ca.key \
--cert=certs/root.cert \
--key=certs/root.key

# Create a key pair for the nodes:
$ cockroach cert create-node \
localhost \
$(hostname) \
--ca-cert=certs/ca.cert \
--ca-key=certs/ca.key \
--cert=certs/node.cert \
--key=certs/node.key
~~~

- The first command makes a new directory for the certificates.
- The second command creates the Certificate Authority (CA) certificate and key: `ca.cert` and `ca.key`.
- The third command creates the client certificate and key, in this case for the `root` user: `root.cert` and `root.key`. These files will be used to secure communication between the built-in SQL shell and the cluster (see step 5).
- The fourth command creates the node certificate and key: `node.cert` and `node.key`. These files will be used to secure communication between nodes. Typically, you would generate these separately for each node since each node has unique addresses; in this case, however, since all nodes will be running locally, you need to generate only one node certificate and key.

## Step 2.  Restart the first node

~~~ shell
$ cockroach start --background \
--http-host=localhost \
--ca-cert=certs/ca.cert \
--cert=certs/node.cert \
--key=certs/node.key
~~~

~~~
CockroachDB node starting at {{site.data.strings.start_time}}
build:      {{site.data.strings.version}} @ {{site.data.strings.build_time}}
admin:      https://ROACHs-MBP:8080
sql:        postgresql://root@ROACHs-MBP:26257?sslcert=%2FUsers%2F...
logs:       cockroach-data/logs
store[0]:   path=cockroach-data
status:     restarted pre-existing node
clusterID:  {dab8130a-d20b-4753-85ba-14d8956a294c}
nodeID:     1
~~~

This command restarts your first node with its existing data, but securely. The command is the same as before with the following additions: 

- The `--ca-cert`, `--cert`, and `--key` flags to point to the CA certificate and the node certificate and key created in step 2. 
- When certs are used, the Admin UI defaults to listening on all interfaces. The `--http-host` flag is therefore used to restrict Admin UI access to the specified interface, in this case, `localhost`.

## Step 3.  Restart additional nodes

~~~ shell
$ cockroach start --background \
--store=node2 \
--port=26258 \
--http-port=8081 \
--http-host=localhost \
--ca-cert=certs/ca.cert \
--cert=certs/node.cert \
--key=certs/node.key \
--join=localhost:26257

$ cockroach start --background \
--store=node3 \
--port=26259 \
--http-port=8082 \
--http-host=localhost \
--ca-cert=certs/ca.cert \
--cert=certs/node.cert \
--key=certs/node.key \
--join=localhost:26257
~~~

These commands restart additional nodes with their existing data, but securely. The commands are the same as before with the following additions:

- The `--ca-cert`, `--cert`, and `--key` flags to point to the CA certificate and the node certificate and key created in step 2. 
- When certs are used, the Admin UI defaults to listening on all interfaces. The `--http-host` flags are therefore used to restrict Admin UI access to the specified interface, in this case, `localhost`.

## Step 4.  Restart the built-in SQL client as an interactive shell

~~~ shell
$ cockroach sql \
--ca-cert=certs/ca.cert \
--cert=certs/root.cert \
--key=certs/root.key
# Welcome to the cockroach SQL interface.
# All statements must be terminated by a semicolon.
# To exit: CTRL + D.
~~~

This command is the same as before, but now uses the additional `--ca-cert`, `--cert`, and `--key` flags to point to the CA certificate and the certificate and key for the `root` user created in step 2.

## Step 5.  Run more CockroachDB SQL statements

~~~ sql
> SELECT * FROM bank.accounts;
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  1 |  1000.5 |
|  2 |    2000 |
|  3 |    3000 |
+----+---------+
(3 rows)
~~~

~~~ sql
> INSERT INTO bank.accounts VALUES (4, 250.75);
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
|  2 |    2000 |
|  3 |    3000 |
|  4 |  250.75 |
+----+---------+
(4 rows)
~~~

When you're done, press **CTRL + D** to exit the SQL shell.
 
## Step 6.  Access the Admin UI

Reopen the [Admin UI](explore-the-admin-ui.html) by pointing your browser to `https://localhost:8080`. You can also find the address in the `admin` field in the standard output of any node on startup. 

Note that your browser will consider the CockroachDB-created certificate invalid; you’ll need to click through a warning message to get to the UI.

## Step 7.  Stop the cluster

You can stop the nodes (and therefore the cluster) as follows:

~~~ shell
# Stop node 1:
$ cockroach quit \
--host=localhost \
--ca-cert=certs/ca.cert \
--cert=certs/root.cert \
--key=certs/root.key

# Stop node 2:
$ cockroach quit \
--host=localhost \
--port=26258 \
--ca-cert=certs/ca.cert \
--cert=certs/root.cert \
--key=certs/root.key

# Stop node 3:
$ cockroach quit \
--host=localhost \
--port=26259 \
--ca-cert=certs/ca.cert \
--cert=certs/root.cert \
--key=certs/root.key
~~~

For more details about the `cockroach quit` command, see [Stop a Node](stop-a-node.html).

## What's Next?

- Learn more about [CockroachDB SQL](learn-cockroachdb-sql.html) and the [built-in SQL client](use-the-built-in-sql-client.html)
- [Install the client driver](install-client-drivers.html) for your preferred language
- [Build an app with CockroachDB](build-an-app-with-cockroachdb.html)
