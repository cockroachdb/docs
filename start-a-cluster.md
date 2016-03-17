---
title: Start a Cluster
toc: false
---

Once you've [installed CockroachDB](install-cockroachdb.html), it takes only a few minutes to start a single- or multi-node cluster locally and talk to it via the built-in SQL client. This page shows you how.  

{{site.data.alerts.callout_info}} Want to deploy CockroachDB in production? See <a href="manual-deployment.html">Manual Deployment</a> or <a href="cloud-deployment.html">Cloud Deployment</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Insecure Cluster

Starting an insecure local cluster is the fastest way to learn CockroachDB, but there's no client/server authentication or encryption, so it's suitable only for limited testing and development.

1. From the directory with the `cockroach` binary, [start your first node](start-a-node.html):

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
   </div>

2. For each additional node, repeat step 1 with a few extra flags:

   ~~~ shell
   $ ./cockroach start --insecure --store=node2-data --port=26258 --http-port=8081 --join=localhost:26257 &
   ~~~

   <button type="button" class="btn details collapsed" data-toggle="collapse" data-target="#details2">Details</button>
   <div id="details2" class="collapse">
      <ul>
         <li>Set the <code>--store</code> flag to a storage location not in use by other nodes. To use multiple stores, set this flag separately for each.</li>
         <li>Set the <code>--port</code> and <code>--http-port</code> flags to ports not in use by other nodes.</li>
         <li>The <code>--join</code> flag connects the new node to the cluster. Set this flag to <code>localhost</code> and the port of the first node.</li>
   </div>

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

## Secure Cluster

Starting a cluster with authenticated, encrypted client/server communication involves creating certificates and passing a few additional command line options, but it's still simple.

1. From the directory with the `cockroach` binary, create security certificates:

   ~~~ shell
   $ mkdir certs
   $ ./cockroach cert create-ca --ca-cert=certs/ca.cert --ca-key=certs/ca.key
   $ ./cockroach cert create-node localhost $(hostname) --ca-cert=certs/ca.cert --ca-key=certs/ca.key --cert=certs/node.cert --key=certs/node.key
   $ ./cockroach cert create-client root --ca-cert=certs/ca.cert --ca-key=certs/ca.key --cert=certs/root.cert --key=certs/root.key
   ~~~

   <button type="button" class="btn details collapsed" data-toggle="collapse" data-target="#details-secure1">Details</button>
   <div id="details-secure1" class="collapse">
      <ul>
         <li>The first command makes a new directory for the certificates.</li>
         <li>The second command creates the Certificate Authority (CA) certificate and key: <code>ca.cert</code> and <code>ca.key</code>.</li>
         <li>The third command creates the node certificate and key: <code>node.cert</code> and <code>node.key</code>. These files will be used to secure communication between nodes. Typically, you would generate these separately for each node since each node has unique addresses; in this case, however, since all nodes will be running locally, you need to generate only one node certificate and key.</li>
         <li>The fourth command creates the client certificate and key, in this case for the <code>root</code> user: <code>root.cert</code> and <code>root.key</code>. These files will be used to secure communication between the built-in SQL shell and the cluster (see step 4).</li>
   </div>

2. [Start your first node](start-a-node.html):
 
   ~~~ shell
   $ ./cockroach start --ca-cert=certs/ca.cert --cert=certs/node.cert --key=certs/node.key &

   build:     alpha.v1-903-g51388a2 @ 2016/03/11 14:15:26 (go1.6)
   admin:     https://ROACHs-MBP:8080
   sql:       postgresql://root@ROACHs-MBP:26257?sslcert=%2FUsers%2F...
   logs:      cockroach-data/logs
   store[0]:  path=cockroach-data
   ~~~

   <button type="button" class="btn details collapsed" data-toggle="collapse" data-target="#details-secure2">Details</button>
   <div id="details-secure2" class="collapse">
      <ul>
         <li>The <code>--ca-cert</code>, <code>--cert</code>, and <code>--key</code> flags point to the CA certificate and the node certificate and key created in step 1. </li>
         <li>Secure internal and client communicate defaults to port 26257, and secure HTTP requests from the Admin UI default to port 8080. To bind to different ports, set <code>--port=&#60;port&#62;</code> and <code>--http-port=&#60;port&#62;</code>.</li>
         <li>Node storage defaults to the <code>cockroach-data</code> directory. To store to a different location, set <code>--store=&#60;filepath&#62;</code>. To use multiple stores, set this flag separately for each.</li>
         <li>The standard output gives you a helpful summary of the CockroachDB version, the URL for the admin UI, the SQL URL for your client code, and the storage locations for node and debug log data.</li>
   </div>

3. For each additional node, repeat step 2 with a few extra flags:

   ~~~ shell
   $ ./cockroach start --store=node2-data --port=26258 --http-port=8081 --join=localhost:26257 --ca-cert=certs/ca.cert --cert=certs/node.cert --key=certs/node.key &
   ~~~

   <button type="button" class="btn details collapsed" data-toggle="collapse" data-target="#details-secure3">Details</button>
   <div id="details-secure3" class="collapse">
      <ul>
         <li>Set the <code>--store</code> flag to a storage location not in use by other nodes. To use multiple stores, set this flag separately for each.</li>
         <li>Set the <code>--port</code> and <code>--http-port</code> flags to ports not in use by other nodes.</li>
         <li>The <code>--join</code> flag connects the new node to the cluster. Set this flag to <code>localhost</code> and the port of the first node.</li>
   </div>

4. Start the [built-in SQL client](use-the-built-in-sql-client.html) as an interactive shell:

   ~~~ shell
   $ ./cockroach sql --ca-cert=certs/ca.cert --cert=certs/root.cert --key=certs/root.key
   # Welcome to the cockroach SQL interface.
   # All statements must be terminated by a semicolon.
   # To exit: CTRL + D.
   ~~~

   <button type="button" class="btn details collapsed" data-toggle="collapse" data-target="#details-secure4">Details</button>
   <div id="details-secure4" class="collapse">
      <ul>
         <li>The <code>--ca-cert</code>, <code>--cert</code>, and <code>--key</code> flags point to the CA certificate and the certificate and key for the <code>root</code> user created in step 1.</li>
         <li>Secure communicate defaults to port 26257. To bind to a different port, set <code>--port=&#60;port&#62;</code>.</li>
   </div>

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

## Next Steps

- Learn more about [CockroachDB SQL](learn-cockroachdb-sql.html) and the [built-in SQL client](use-the-built-in-sql-client.html)
- [Install the client driver](install-client-drivers.html) for your preferred language
- [Build a test app](build-a-test-app.html)

<style>
/* Button for expanding/collapsing content */
.btn.details, .btn.details:active {
    background: #fff;
    border: none;
    font-family: Avernir-Black, sans-serif;
    font-size: 15px;
    font-weight: bold;
    padding: 5px;
    line-height: 20px;
    color: #142848;
    border-radius: 35px;
    margin-bottom: 0px;
    outline: none;
    box-shadow:none;
}
/* Icon when the content is shown */
.btn.details:after {
   font-family: "Glyphicons Halflings";
   content: "\e114";
   float: right;
   margin-left: 10px;
}
/* Icon when the content is hidden */
.btn.details.collapsed:after {
   font-family: "Glyphicons Halflings";
   float: right;
   margin-left: 10px;
   content: "\e080";
}
</style>
