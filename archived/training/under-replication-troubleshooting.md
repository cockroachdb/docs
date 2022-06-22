---
title: Under-Replication Troubleshooting
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
block_search: false

---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vTSFeWLn6dr-ikvcXIXsdG7l4yWTfHiW4QA28LH9bS7MqSgm5MDNwBF2QZT_z6t4aSETvcEMpvMvqbv/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>

## Before you begin

In this lab, you'll start with a fresh cluster, so make sure you've stopped and cleaned up the cluster from the previous labs.

## Step 1. Start a 3-node cluster

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

2. In another terminal, start node 2:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

3. In another terminal, start node 3:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

4. In another terminal, perform a one-time initialization of the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --insecure --host=localhost:26257
    ~~~

## Step 2. Simulate the problem

1. In the same terminal, reduce the amount of time the cluster waits before considering a node dead to just 1 minute and 15 seconds:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SET CLUSTER SETTING server.time_until_store_dead = '1m15s';"
    ~~~

2. In the terminal where node 3 is running, press **CTRL-C** to stop the node.

## Step 3. Troubleshoot the problem

1. Open the Admin UI at <a href="http://localhost:8080" data-proofer-ignore>http://localhost:8080</a> and click **Metrics** on the left.

2. In the upper right you'll see the **Replication Status** widget:

    <img src="{{ 'images/v20.1/training-11.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

    You'll see that there are 24 ranges total, and 24 ranges are under-replicated, which means that every range in the cluster is missing 1 of 3 replicas. This is a vulnerable state because, if another node were to go offline, all ranges would lose consensus, and the entire cluster would become unavailable.

## Step 4. Resolve the problem

To bring the cluster back to a safe state, you need to either restart the down node or add a new node.

1. In the terminal where node 3 was running, restart the node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

3. Soon, you'll see that there are no longer any under-replicated ranges.

## What's next?

[Cluster Unavailability Troubleshooting](cluster-unavailability-troubleshooting.html)
