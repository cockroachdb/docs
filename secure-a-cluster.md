---
title: Secure a Cluster
summary: Learn how to secure a CockroachDB cluster with authentication and encryption.
toc: false
---

Now that you have a [local cluster](start-a-local-cluster.html) up and running, let's secure it with authentication and encryption. This involves creating certificates and restarting your nodes with a few additional flags.

{{site.data.alerts.callout_danger}}If you didn't <a href="start-a-local-cluster.html#step-5--stop-the-cluster">stop the insecure cluster</a>, when you restart the cluster with security (steps 2 and 3), you'll see "TLS handshake" errors when accessing the Admin UI until you adjust the URL to include <code>https</code> (step 6).{{site.data.alerts.end}}

<div id="toc"></div>

## Step 1.  Create security certificates

~~~ shell
$ mkdir certs
$ cockroach cert create-ca --ca-cert=certs/ca.cert --ca-key=certs/ca.key
$ cockroach cert create-node localhost $(hostname) --ca-cert=certs/ca.cert --ca-key=certs/ca.key --cert=certs/node.cert --key=certs/node.key
$ cockroach cert create-client root --ca-cert=certs/ca.cert --ca-key=certs/ca.key --cert=certs/root.cert --key=certs/root.key
~~~

- The first command makes a new directory for the certificates.
- The second command creates the Certificate Authority (CA) certificate and key: `ca.cert` and `ca.key`.
- The third command creates the node certificate and key: `node.cert` and `node.key`. These files will be used to secure communication between nodes. Typically, you would generate these separately for each node since each node has unique addresses; in this case, however, since all nodes will be running locally, you need to generate only one node certificate and key.
- The fourth command creates the client certificate and key, in this case for the `root` user: `root.cert` and `root.key`. These files will be used to secure communication between the built-in SQL shell and the cluster (see step 5).

## Step 2.  Restart the first node

~~~ shell
$ cockroach start --ca-cert=certs/ca.cert --cert=certs/node.cert --key=certs/node.key --http-host=localhost --background

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
$ cockroach start --store=node2 --port=26258 --http-port=8081 --http-host=localhost --join=localhost:26257 --ca-cert=certs/ca.cert --cert=certs/node.cert --key=certs/node.key --background
$ cockroach start --store=node3 --port=26259 --http-port=8082 --http-host=localhost --join=localhost:26257 --ca-cert=certs/ca.cert --cert=certs/node.cert --key=certs/node.key --background
~~~

These commands restart additional nodes with their existing data, but securely. The commands are the same as before with the following additions:

- The `--ca-cert`, `--cert`, and `--key` flags to point to the CA certificate and the node certificate and key created in step 2. 
- When certs are used, the Admin UI defaults to listening on all interfaces. The `--http-host` flags are therefore used to restrict Admin UI access to the specified interface, in this case, `localhost`.

## Step 4.  Restart the [built-in SQL client](use-the-built-in-sql-client.html) as an interactive shell

~~~ shell
$ cockroach sql --ca-cert=certs/ca.cert --cert=certs/root.cert --key=certs/root.key
# Welcome to the cockroach SQL interface.
# All statements must be terminated by a semicolon.
# To exit: CTRL + D.
~~~

This command is the same as before, but now uses the additional `--ca-cert`, `--cert`, and `--key` flags to point to the CA certificate and the certificate and key for the `root` user created in step 2.

## Step 5.  Run more [CockroachDB SQL statements](learn-cockroachdb-sql.html)

~~~ sql
> SET DATABASE = bank;

> SELECT * FROM accounts;
~~~
~~~
+------+----------+
|  id  | balance  |
+------+----------+
| 1234 | 10000.50 |
+------+----------+
~~~
~~~ sql
> INSERT INTO accounts VALUES (5678, 250.75);

> SELECT * FROM accounts;
~~~
~~~
+------+----------+
|  id  | balance  |
+------+----------+
| 1234 | 10000.50 |
| 5678 | 250.75   |
+------+----------+
~~~

When you're done using the SQL shell, press **CTRL + D** to exit.
 
## Step 6.  Access the Admin UI

Reopen the [Admin UI](explore-the-admin-ui.html) by pointing your browser to `https://localhost:8080`. You can also find the address in the `admin` field in the standard output of any node on startup. 

Note that your browser will consider the CockroachDB-created certificate invalid; you’ll need to click through a warning message to get to the UI.

## Step 7.  Stop the cluster

When you're ready to stop the cluster, quit each node as follows:

~~~ shell
$ cockroach quit --host=localhost --ca-cert=certs/ca.cert --cert=certs/root.cert --key=certs/root.key
$ cockroach quit --host=localhost --port=26258 --ca-cert=certs/ca.cert --cert=certs/root.cert --key=certs/root.key
$ cockroach quit --host=localhost --port=26259 --ca-cert=certs/ca.cert --cert=certs/root.cert --key=certs/root.key
~~~

For more details about the `cockroach quit` command, see [Stop a Node](stop-a-node.html).

## What's Next?

- Learn more about [CockroachDB SQL](learn-cockroachdb-sql.html) and the [built-in SQL client](use-the-built-in-sql-client.html)
- [Install the client driver](install-client-drivers.html) for your preferred language
- [Build a test app](build-a-test-app.html)
