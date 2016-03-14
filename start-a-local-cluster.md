---
title: Start a Local Cluster
toc: false
---

Once you've [installed CockroachDB](install-cockroachdb.html), it's easy to start a single- or multi-node cluster locally and talk to it via the built-in SQL client. Your cluster can be insecure or secure:

- [Insecure](#insecure)  
This is the fastest way to start up a cluster and learn CockroachDB, but there's no client/server authentication or encryption, so it's suitable only for limited testing and development.

- [Secure](#secure)  
Starting up a cluster with authenticated, encrypted client/server communication involves creating certificates and passing a few additional command line options, but it's still simple. 

{{site.data.alerts.callout_info}} Want to deploy CockroachDB in production? See <a href="manual-deployment.html">Manual Deployment</a> or <a href="cloud-deployment.html">Cloud Deployment</a>.{{site.data.alerts.end}}

## Insecure

1. From the directory with the `cockroach` binary, [start your first node](start-a-node.html):

   ~~~ shell
   $ ./cockroach start --insecure &

   build:     alpha.v1-903-g51388a2 @ 2016/03/11 14:15:26 (go1.6)
   admin:     http://ROACHs-MBP:8080
   sql:       postgresql://root@ROACHs-MBP:26257?sslmode=disable
   logs:      cockroach-data/logs
   store[0]:  path=cockroach-data
   ~~~

   - The `--insecure` flag defaults the port for internal and client communication to 26257 and the port for HTTP requests from the Admin UI to 8080. To bind to different ports, set `--port=<port>` and `--http-port=<port>`.

   - Node storage defaults to the `cockroach-data` directory. To store to a different location, set `--store=<filepath>`. To use multiple stores, set this flag separately for each.

   - The standard output gives you a helpful summary of the CockroachDB version, the URL for the admin UI, the SQL URL for your client code, and the storage locations for node and debug log data. 

2. For each additional node, repeat step 1 with a few extra flags:

   ~~~ shell
   $ ./cockroach start --insecure --store=node2-data --port=26258 --http-port=8081 --join=localhost:26257 &
   ~~~

   - Set the `--store` flag to a storage location not in use by other nodes. To use multiple stores, set this flag separately for each.

   - Set the `--port` and `--http-port` flags to ports not in use by other nodes.
  
   - The `--join` flag connects the new node to the cluster. Set this flag to `localhost` and the port of the first node.

3. Start the [built-in SQL client](use-the-built-in-sql-client.html) as an interactive shell:

   ~~~ shell
   $ ./cockroach sql --insecure
   # Welcome to the cockroach SQL interface.
   # All statements must be terminated by a semicolon.
   # To exit: CTRL + D.
   ~~~

4. Run some [CockroachDB SQL statements](learn-cockroachdb-sql.html):

   ~~~ shell
   root@:26257> CREATE DATABASE bank;
   CREATE DATABASE

   root@:26257> SET DATABASE = bank;
   SET DATABASE

   root@:26257> CREATE TABLE accounts (id INT PRIMARY KEY, balance DECIMAL);
   CREATE TABLE

   root@26257> INSERT INTO accounts VALUES (1234, DECIMAL '10000');
   INSERT 1

   root@26257> SELECT * FROM accounts;
   +------+---------+
   |  id  | balance |
   +------+---------+
   | 1234 |   10000 |
   +------+---------+
   ~~~
 
5. [Check out the Admin UI](explore-the-admin-ui.html) by pointing your browser to `http://<local host>:8080`. You can find the complete address in the standard output as well (see step 1).

## Secure

1. From the directory with the `cockroach` binary, create security certificates:

   ~~~ shell
   $ mkdir certs
   $ ./cockroach cert create-ca --ca-cert=certs/ca.cert --ca-key=certs/ca.key
   $ ./cockroach cert create-node localhost $(hostname) --ca-cert=certs/ca.cert --ca-key=certs/ca.key --cert=certs/node.cert --key=certs/node.key
   $ ./cockroach cert create-client root --ca-cert=certs/ca.cert --ca-key=certs/ca.key --cert=certs/root.cert --key=certs/root.key
   ~~~

   - The first command makes a new directory for the certificates.  
  
   - The second command creates the Certificate Authority (CA) certificate and key: `ca.cert` and `ca.key`. 

   - The third command creates the node certificate and key: `node.cert` and `node.key`. These files will be used to secure communication between nodes. Typically, you would generate these separately for each node since each node has unique addresses; in this case, however, since all nodes will be running locally, you need to generate only one node certificate and key. 

   - The fourth command creates the client certificate and key, in this case for the `root` user: `root.cert` and `root.key`. These files will be used to secure communication between the built-in SQL shell and the cluster (see step 4).  

2. [Start your first node](start-a-node.html):
 
   ~~~ shell
   $ ./cockroach start --ca-cert=certs/ca.cert --cert=certs/node.cert --key=certs/node.key &

   build:     alpha.v1-903-g51388a2 @ 2016/03/11 14:15:26 (go1.6)
   admin:     https://ROACHs-MBP:8080
   sql:       postgresql://root@ROACHs-MBP:26257?sslcert=%2FUsers%2F...
   logs:      cockroach-data/logs
   store[0]:  path=cockroach-data
   ~~~

   - The `--ca-cert`, `--cert`, and `--key` flags point to the CA certificate and the node certificate and key created in step 1. 

   - Secure internal and client communicate defaults to port 26257, and secure HTTP requests from the Admin UI default to port 8080. To bind to different ports, set `--port=<port>` and `--http-port=<port>`.
  
   - Node storage defaults to the `cockroach-data` directory. To store to a different location, set `--store=<filepath>`. To use multiple stores, set this flag separately for each.

   - The standard output gives you a helpful summary of the CockroachDB version, the URL for the admin UI, the SQL URL for your client code, and the storage locations for node and debug log data. 

3. For each additional node, repeat step 2 with a few extra flags:

   ~~~ shell
   $ ./cockroach start --store=node2-data --port=26258 --http-port=8081 --join=localhost:26257 --ca-cert=certs/ca.cert --cert=certs/node.cert --key=certs/node.key &
   ~~~

   - Set the `--store` flag to a storage location not in use by other nodes. To use multiple stores, set this flag separately for each.

   - Set the `--port` and `--http-port` flags to ports not in use by other nodes.
  
   - The `--join` flag connects the new node to the cluster. Set this flag to `localhost` and the port of the first node.

4. Start the [built-in SQL client](use-the-built-in-sql-client.html) as an interactive shell:

   ~~~ shell
   $ ./cockroach sql --ca-cert=certs/ca.cert --cert=certs/root.cert --key=certs/root.key
   # Welcome to the cockroach SQL interface.
   # All statements must be terminated by a semicolon.
   # To exit: CTRL + D.
   ~~~

   - The `--ca-cert`, `--cert`, and `--key` flags point to the CA certificate and the certificate and key for the `root` user created in step 1. 
   
   - Secure communicate defaults to port 26257. To bind to a different port, set `--port=<port>`.

5. Run some [CockroachDB SQL statements](learn-cockroachdb-sql.html):

   ~~~ shell
   root@:26257> CREATE DATABASE bank;
   CREATE DATABASE

   root@:26257> SET DATABASE = bank;
   SET DATABASE

   root@:26257> CREATE TABLE accounts (id INT PRIMARY KEY, balance DECIMAL);
   CREATE TABLE

   root@26257> INSERT INTO accounts VALUES (1234, DECIMAL '10000');
   INSERT 1

   root@26257> SELECT * FROM accounts;
   +------+---------+
   |  id  | balance |
   +------+---------+
   | 1234 |   10000 |
   +------+---------+
   ~~~
 
6. [Check out the Admin UI](explore-the-admin-ui.html) by pointing your browser to `https://<local host>:8080`. You can find the complete address in the standard output as well (see step 2). Note that your browser will consider the cockroach-created certificate invalid; you'll need to click through a warning message to get to the UI.

## What's Next?

- Learn more about [CockroachDB SQL](learn-cockroachdb-sql.html) and the [built-in SQL client](use-the-built-in-sql-client.html)
- [Install the client driver](install-client-drivers.html) for your preferred language
- [Build a test app](build-a-test-app.html)