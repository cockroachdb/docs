---
title: Planned Maintenance
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
block_search: false

---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vTrGKGxMrzuXTAYGI376H5WfBYaJ9htl8EuPWL30dvfK6S-konovWV1QG2G9t-Xdsel3BdvMzmF29pb/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>

## Before you begin

In this lab, you'll start with a fresh cluster, so make sure you've stopped and cleaned up the cluster from the previous labs.

## Step 1. Start a 3-node cluster

Start and initialize an insecure cluster like you did in previous modules.

1. In a new terminal, start node 1:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node1 \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

2. In a new terminal, start node 2:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

3. In a new terminal, start node 3:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

4. In a new terminal, perform a one-time initialization of the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --insecure --host=localhost:26257
    ~~~

## Step 2. Increase the time until a node is considered dead

Let's say you need to perform some maintenance on each of your nodes, e.g., upgrade system software. For each node, you expect the maintenance and restart process to take no more than 15 minutes, and you do not want the cluster to consider a node dead and rebalance its data during this process.

1. In the same terminal, increase the `server.time_until_store_dead` cluster setting:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SET CLUSTER SETTING server.time_until_store_dead = '15m0s';"
    ~~~

    {{site.data.alerts.callout_info}}
    Use caution when changing the `server.time_until_store_dead` setting. Setting it too high creates some risk of unavailability since CockroachDB does not respond to down nodes as quickly. However, setting it too low causes increased network and disk I/O costs, as CockroachDB rebalances data around temporary outages.
    {{site.data.alerts.end}}

2. Then verify the new setting:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SHOW CLUSTER SETTING server.time_until_store_dead;"
    ~~~

    ~~~
      server.time_until_store_dead
    +------------------------------+
      15m
    (1 row)
    ~~~

## Step 3. Stop, maintain, and restart nodes

Stop, maintain, and restart one node at a time. This ensures that, at any point, the cluster has a majority of replicas and remains available.

1. In the first node's terminal, press **CTRL-C** to stop the node.

2. Imagine that you are doing some maintenance on the node.

    While the node is offline, you can verify the cluster's health by pointing the Admin UI to one of the nodes that is still up: <a href="http://localhost:8081" data-proofer-ignore>http://localhost:8081</a> or <a href="http://localhost:8082" data-proofer-ignore>http://localhost:8082</a>.

3. In the same terminal, rejoin the node to the cluster, using the same command that you used to start it initially:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node1 \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

4. In the second node's terminal, press **CTRL-C** to stop the node.

5. Imagine that you are doing some maintenance on the node.

    While the node is offline, you can verify the cluster's health by pointing the Admin UI to one of the nodes that is still up: <a href="http://localhost:8080" data-proofer-ignore>http://localhost:8080</a> or <a href="http://localhost:8082" data-proofer-ignore>http://localhost:8082</a>.

6. In the same terminal, rejoin the node to the cluster, using the same command that you used to start it initially:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

7. In the third node's terminal, press **CTRL-C** to stop the node.

8. Imagine that you are doing some maintenance on the node.

    While the node is offline, you can verify the cluster's health by pointing the Admin UI to one of the nodes that is still up: <a href="http://localhost:8080" data-proofer-ignore>http://localhost:8080</a> or <a href="http://localhost:8081" data-proofer-ignore>http://localhost:8081</a>.

9. In the same terminal, rejoin the node to the cluster, using the same command that you used to start it initially:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

## Step 4. Reset the time until a node is considered dead

 Now that all nodes have been maintained and restarted, you can reset the time until the cluster considers a node dead and rebalances its data.

1. In a new terminal, change the `server.time_until_store_dead` cluster setting back to the default of `5m0s`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="RESET CLUSTER SETTING server.time_until_store_dead;"
    ~~~

2. Then verify the new setting:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SHOW CLUSTER SETTING server.time_until_store_dead;"
    ~~~

    ~~~
      server.time_until_store_dead
    +------------------------------+
      5m
    (1 row)
    ~~~

## What's next?

[Node Decommissioning](node-decommissioning.html)
