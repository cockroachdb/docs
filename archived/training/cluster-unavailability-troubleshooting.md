---
title: Cluster Unavailability Troubleshooting
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
block_search: false
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vSBf1F3mGsVQs7pqcTuRe-mW_3X7TxDZ2TjGbQfdExMJ4c6G-IfEhB4olJXpfbgOKjQhjX7kftKSa5X/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>

## Before you begin

Make sure you have already completed [Under-Replication Troubleshooting](under-replication-troubleshooting.html) and have a cluster of 3 nodes running.

## Step 1. Simulate the problem

1. In the terminal where node 2 is running, press **CTRL-C**.

2. In the terminal where node 3 is running, press **CTRL-C**. You may need to press **CRTL + C** a second time to force this node to terminate.  

## Step 2. Troubleshoot the problem

1. Go back to the Admin UI:

    <img src="{{ 'images/v20.1/training-13.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

    You'll notice that an error is shown and timeseries metrics  are no longer being reported.

2. In a new terminal, try to query the one node that was not terminated:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SHOW DATABASES;" \
    --logtostderr=WARNING
    ~~~

    Because all ranges in the cluster, specifically the system ranges, no longer have a majority of their replicas, the cluster as a whole cannot make progress, and so the query will hang indefinitely.

## Step 3. Resolve the problem

1. In the terminal where node 2 was running, restart the node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

2. In the terminal where node 3 was running, restart the node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

3. Go back to the terminal where you issued the query.

    All ranges have a majority of their replicas again, and so the query executes and succeeds:

    ~~~
      database_name
    +---------------+
      defaultdb
      postgres
      system
    (3 rows)
    ~~~

## Clean up

In the next module, you'll start a new cluster from scratch, so take a moment to clean things up.

1. Terminate all CockroachDB nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach
    ~~~

2. Remove the nodes' data directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node1 node2 node3
    ~~~

## What's next?

[Data Unavailability Troubleshooting](data-unavailability-troubleshooting.html)
