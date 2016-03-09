---
title: Start a Local Cluster
toc: false
---

Once you've [installed CockroachDB](install-cockroachdb.html), it's easy to start a single- or multi-node cluster locally and talk to it via the built-in SQL shell. Your cluster can be insecure or secure:

- [Insecure](#insecure)  
This is the fastest way to start up a cluster and learn CockroachDB, but there's no client/server authentication or encryption, so it's suitable only for limited testing and development.

- [Secure](#secure)  
Starting up a cluster with authenticated, encrypted client/server communication involves creating certificates and passing a few additional command line options, but it's still simple. 

{{site.data.alerts.callout_info}} Want to deploy CockroachDB in production? See <a href="manual-deployment.html">Manual Deployment</a> or <a href="cloud-deployment.html">Cloud Deployment</a>.{{site.data.alerts.end}}

## Insecure

1. From the directory with the `cockroach` binary, [start your first node](start-a-node.html):

   ~~~ shell
   $ ./cockroach start --insecure &

   build:     alpha.v1-362-g723805f @ 2016/02/24 16:03:23 (go1.6)
   admin:     http://ROACHs-MacBook-Pro.local:26257
   sql:       postgresql://root@ROACHs-MacBook-Pro.local:26257?sslmode=disable
   logs:      cockroach-data/logs
   store[0]:  cockroach-data
   ~~~

   - The `--insecure` flag sets client/server communication to insecure on the default port, 26257. To bind to different port, set `--port=<port>`.

   - Node storage defaults to the `cockroach-data` directory. To store to a different location, set `--store=<filepath>`. To use multiple stores, set this flag separately for each.

   - The standard output gives you a helpful summary of the CockroachDB version, the URL for the admin UI, the SQL URL for your client code, and the storage locations for node data and logs. 

2. For each additional node, repeat step 1 with a few extra flags:

   ~~~ shell
   $ ./cockroach start --insecure --store=<filepath> --port=26258 --join=localhost:26257 &
   ~~~

   - Set the `--store` flag to a storage location not in use by other nodes. To use multiple stores, set this flag separately for each.

   - Set the `--port` flag to a port not in use by other nodes.
  
   - The `--join` flag connects the new node to the cluster. Set this flag to `localhost` and the port of the first node.

3. Use the [built-in SQL client](use-the-built-in-sql-client.html) to [run some statements](learn-cockroachdb-sql.html):

   ~~~ shell
   $ ./cockroach sql --insecure
   # Welcome to the cockroach SQL interface.
   # All statements must be terminated by a semicolon.
   # To exit: CTRL + D.

   root@:26257> CREATE DATABASE bank;
   CREATE DATABASE

   root@:26257> SET DATABASE = bank;
   SET DATABASE

   root@:26257> CREATE TABLE accounts (id INT PRIMARY KEY, balance DECIMAL);
   CREATE TABLE

   root@26257> INSERT INTO accounts VALUES(1234, DECIMAL '10000');
   INSERT 1

   root@26257> SELECT * FROM accounts;
   +------+---------+
   |  id  | balance |
   +------+---------+
   | 1234 |   10000 |
   +------+---------+
   ~~~
 
4. [Check out the Admin UI](explore-the-admin-ui.html) by pointing your browser to `http://<local host>:26257`. You can find the complete address in the standard output as well (see step 1).

## Secure

1. From the directory with the `cockroach` binary, create security certificates:

   ~~~ shell
   $ ./cockroach cert create-ca
   $ ./cockroach cert create-node localhost $(hostname)
   $ ./cockroach cert create-client root
   ~~~

   - The first two commands create a default `certs` directory and add the certificate authority files and files for the node: `ca.cert`, `ca.key`,`node.server.crt`, `node.server.key`, `node.client.crt`, and `node.client.key`. 
   
   - The last command adds the files for the SQL client: `root.client.crt` and `root.client.key`.

2. [Start your secure first node](start-a-node.html):
 
   ~~~ shell
   $ ./cockroach start &

   build:     alpha.v1-362-g723805f @ 2016/02/24 16:03:23 (go1.6)
   admin:     https://ROACHs-MacBook-Pro.local:26257
   sql:       postgresql://root@ROACHs-MacBook-Pro.local:26257?sslcert=%2FUsers%2F...
   logs:      cockroach-data/logs
   store[0]:  cockroach-data
   ~~~

   - Secure communication uses the certificates in the `certs` directory and defaults to port 26257. To bind to a different port, set `--port=<port>`.

   - Node storage defaults to the `cockroach-data` directory. To store to a different location, set `--store=<filepath>`. To use multiple stores, set this flag separately for each.

   - The standard output gives you a helpful summary of the CockroachDB version, the URL for the admin UI, the SQL URL for your client code, and the storage locations for node data and logs. 

3. For each additional node, repeat step 2 with a few extra flags:

   ~~~ shell
   $ ./cockroach start --store=<filepath> --port=26258 --join=localhost:26257 &
   ~~~

   - Set the `--store` flag to a storage location not in use by other nodes. To use multiple stores, set this flag separately for each.

   - Set the `--port` flag to a port not in use by other nodes.
  
   - The `--join` flag connects the new node to the cluster. Set this flag to `localhost` and the port of the first node.

4. Use the [built-in SQL client](use-the-built-in-sql-client.html) to [run some statements](learn-cockroachdb-sql.html):

   ~~~ shell
   $ ./cockroach sql
   # Welcome to the cockroach SQL interface.
   # All statements must be terminated by a semicolon.
   # To exit: CTRL + D.

   root@:26257> CREATE DATABASE bank;
   CREATE DATABASE

   root@:26257> SET DATABASE = bank;
   SET DATABASE

   root@:26257> CREATE TABLE accounts (id INT PRIMARY KEY, balance DECIMAL);
   CREATE TABLE

   root@26257> INSERT INTO accounts VALUES(1234, DECIMAL '10000');
   INSERT 1

   root@26257> SELECT * FROM accounts;
   +------+---------+
   |  id  | balance |
   +------+---------+
   | 1234 |   10000 |
   +------+---------+
   ~~~

5. [Check out the Admin UI](explore-the-admin-ui.html) by pointing your browser to `https://<local host>:26257`. You can find the complete address in the standard output as well (see step 2). Note that your browser will consider the cockroach-created certificate invalid; you'll need to click through a warning message to get to the UI.

## What's Next?

- Learn more about [CockroachDB SQL](learn-cockroachdb-sql.html) and the [built-in SQL client](use-the-built-in-sql-client.html)
- [Install the client driver](install-client-drivers.html) for your preferred language
- [Build a test app](build-a-test-app.html)