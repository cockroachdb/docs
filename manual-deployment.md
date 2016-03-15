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
$ ./cockroach cert create-client username1 --ca-cert=ca.cert --ca-key=ca.key --cert=username1.cert --key=username1.key
$ ./cockroach cert create-client username2 --ca-cert=ca.cert --ca-key=ca.key --cert=username2.cert --key=username2.key
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

### 5. Connect a client to the cluster

Copy the CA certificate and client certificates and keys to the machine with the client.  