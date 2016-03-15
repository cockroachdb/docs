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
- You have SSH access to each machine. This is necessary for distributing binaries and, in the case of a secure cluster, certificates to each machine. 
- Your network configuration allows the machines to talk to each other and clients to talk to the machines.

## Recommendations

- Put each node on a different machine. Since CockroachDB replicates across nodes, placing more than one node on a single machine increases the risk of data unavailability when a machine fails.  
- Run [NTP](http://www.ntp.org/) or other clock synchronization software on each machine. CockroachDB needs moderately accurate time; if the machines' clocks drift too far apart, transactions will never succeed and the cluster will crash. 

## Insecure Cluster

1. Copy the `cockroach` binary to the first machine.

2. Start a node on the first machine:

   ~~~ shell
   ./cockroach start --insecure --host=node1.example.com
   ~~~

   This command sets the node to insecure and identifies the address at which other nodes can reach it. Otherwise, the command uses all available defaults. For example, the node stores data in the `cockroach-data` directory, listens for internal and client communication on port 26257, and listens for HTTP requests from the Admin UI on port 8080. To set these options manually, see [Start a Node](start-a-node.html). 

3. Copy the `cockroach` binary to the second machine.

4. Start a node on the second machine:
    
   ~~~ shell
   ./cockroach start --insecure --join=node1.example.com:26257
   ~~~

   The only difference when starting the second node is that you connect it to the cluster with the `--join` flag, which takes the address and port of the first node. Otherwise, it's fine to accept all defaults; since each node is on a unique machine, using identical ports and other settings won't cause conflicts.

5. Repeat steps 3 and 4 for each additional node.

## Secure Cluster

1. Copy the `cockroach` binary to the first machine.

2. Start a node on the first machine:

   ~~~ shell
   ./cockroach start --insecure --host=node1.example.com
   ~~~

   This command sets the node to insecure and identifies the address at which other nodes can reach it. Otherwise, the command uses all available defaults. For example, the node stores data in the `cockroach-data` directory, listens for internal and client communication on port 26257, and listens for HTTP requests from the Admin UI on port 8080. To set these options manually, see [Start a Node](start-a-node.html). 

3. Copy the `cockroach` binary to the second machine.

4. Start a node on the second machine:
    
   ~~~ shell
   ./cockroach start --insecure --join=node1.example.com:26257
   ~~~

   The only difference when starting the second node is that you connect it to the cluster with the `--join` flag, which takes the address and port of the first node. Otherwise, it's fine to accept all defaults; since each node is on a unique machine, using identical ports and other settings won't cause conflicts.

5. Repeat steps 3 and 4 for each additional node.