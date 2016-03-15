---
title: Manual Deployment
toc: false
---

This page shows you how to manually deploy a multi-node CockroachDB cluster on multiple machines. 

{{site.data.alerts.callout_info}} For deployment on AWS and other cloud providers, see <a href="cloud-deployment.html">Cloud Deployment</a>. For local testing and development, see <a href="start-a-local-cluster.html">Start a Local Cluster</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Requirements

This process assumes the following:

- You have the [CockroachDB binary](install-cockroachdb.html).
- You have SSH access to each machine. This is necessary for distributing binaries and, in the case of a secure cluster, certificates. 
- Your network configuration allows the machines to talk to each other and clients to talk to the machines.

## Recommendations

- Put each node on a different machine. Since CockroachDB replicates across nodes, placing more than one node on a single machine increases the risk of data unavailability when a machine fails.  
- Run [NTP](http://www.ntp.org/) or other clock synchronization software on each machine. CockroachDB needs moderately accurate time; if the machines' clocks drift too far apart, transactions will never succeed and the cluster will crash. 

## Insecure Cluster

### 1. Set up the first node

Copy the `cockroach` binary to the first machine and then start the node:

~~~ shell
$ ./cockroach start --insecure --host=node1.example.com
~~~

This command sets the node to insecure and identifies the address at which other nodes can reach it. Otherwise, it uses all available defaults. For example, the node stores data in the `cockroach-data` directory, listens for internal and client communication on port 26257, and listens for HTTP requests from the Admin UI on port 8080. To set these options manually, see [Start a Node](start-a-node.html). 

### 2. Set up the second node

Copy the `cockroach` binary to the second machine and then start the node:
    
~~~ shell
$ ./cockroach start --insecure --join=node1.example.com:26257
~~~

The only difference when starting the second node is that you connect it to the cluster with the `--join` flag, which takes the address and port of the first node. Otherwise, it's fine to accept all defaults; since each node is on a unique machine, using identical ports won't cause conflicts.

### 3. Set up additional nodes

Repeat step 2 for each additional node.

### 4. Use the Built-in SQL Client

Start the built-in SQL client from any machine with the `cockroach` binary. This could be one of the node machines or a different machine. 

~~~ shell
$ ./cockroach sql --insecure --url=postgresql://root@node1.example.com:26257?sslmode=disable
# Welcome to the cockroach SQL interface.
# All statements must be terminated by a semicolon.
# To exit: CTRL + D.
~~~

This command uses the `--url` flag to identify the client user and the hostname and port of the node to connect to. You can also specify these details with distinct flags. For more information, see [Use the Built-In SQL Client](use-the-built-in-sql-client.html).

Once you're connected, run some [SQL statements](learn-cockroachdb-sql.html): 

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

## Secure Cluster

### 1. Create security certificates

On a machine that won't be part of the cluster, create the CA, node, and client certificates and keys:

~~~ shell
# Create the CA certificate and key.
$ ./cockroach cert create-ca --ca-cert=ca.cert --ca-key=ca.key
   
# Create the certificate and key for nodes.
# Be sure to include the hostnames of each machine in the cluster.
$ ./cockroach cert create-node node1.example.com node2.example.com node3.example.com --ca-cert=ca.cert --cert=node.cert --key=node.cert

# Create a certificate and key for each client user. 
$ ./cockroach cert create-client root --ca-cert=ca.cert --ca-key=ca.key --cert=root.cert --key=root.key
$ ./cockroach cert create-client maxroach --ca-cert=ca.cert --ca-key=ca.key --cert=maxroach.cert --key=maxroach.key
~~~

Store the CA key somewhere safe and keep a backup; if you lose it, you will not be able to add new nodes or clients to your cluster.

### 2. Set up the first node

Copy the `cockroach` binary, CA certificate, node certificate, and node key to the first machine and then start the node:

~~~ shell
$ ./cockroach start --ca-cert=certs/ca.cert --cert=certs/node.cert --key=node.key --host=node1.example.com
~~~

This command specifies the location of certificates and the address at which other nodes can reach it. Otherwise, it uses all available defaults. For example, the node stores data in the `cockroach-data` directory, listens for internal and client communication on port 26257, and listens for HTTP requests from the Admin UI on port 8080. To set these options manually, see [Start a Node](start-a-node.html). 

### 3. Set up the second node

Copy the `cockroach` binary, CA certificate, node certificate, and node key to the second machine and then start the node:

~~~ shell
./cockroach start --ca-cert=certs/ca.cert --cert=certs/node.cert --key=node.key --host=node2.example.com --join=node1.example.com:26257
~~~

The only difference when starting the second node is that you connect it to the cluster with the `--join` flag, which takes the address and port of the first node. Otherwise, it's fine to accept all defaults; since each node is on a unique machine, using identical ports won't cause conflicts.

### 4. Set up additional nodes

Repeat step 3 for each additional node. 

### 5. Use the built-in SQL client

You can run the built-in SQL client from any machine with the `cockroach` binary, CA cert, client certificate, and client key. Make sure the machine you want to use has these files and then start the client:  

~~~ shell
$ ./cockroach sql --url=postgresql://root@node1.example.com.com:26257?sslcert=certs/root.client.crt&sslkey=certs/root.client.key&sslmode=verify-full&sslrootcert=certs/ca.crt
# Welcome to the cockroach SQL interface.
# All statements must be terminated by a semicolon.
# To exit: CTRL + D.
~~~

This command uses the `--url` flag to identify the client user, the hostname and port of the node to connect to, and the location of the CA certificate and client certificate and key. You can also specify these details with distinct flags. For more information, see [Use the Built-In SQL Client](use-the-built-in-sql-client.html).

Once you're connected, run some [SQL statements](learn-cockroachdb-sql.html): 

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