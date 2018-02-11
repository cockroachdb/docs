---
title: Cluster Unavailability Troubleshooting
toc: false
toc_not_nested: true
sidebar_data: sidebar-data-training.json
---

In this lab, you'll cause all ranges in a cluster, including system ranges, to lose a majority of their replicas (2 of 3). This will make the cluster unavailable. You'll then troubleshoot and resolve the problem.

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>
<div id="toc"></div>

## Before You Begin

Make sure you have already completed [Under-Replication Troubleshooting](under-replication-troubleshooting.html) and have a cluster of 3 nodes running.

## Step 1. Simulate the problem

1. In the terminal where node 2 is running, press **CTRL + C**.

2. In the terminal where node 3 is running, press **CTRL + C**. You may need to press **CRTL + C** a second time to force this node to stop.  

## Step 2. Troubleshoot the problem

1. Go back to the Admin UI:

    <img src="{{ 'images/training-13.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

    You'll notice that an error is shown and timeseries metrics  are no longer being reported.

2. In a new terminal, try to query the one node that was not stopped:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --certs-dir=certs \
    --port=26257 \
    --execute="SHOW DATABASES;" \
    --logtostderr=WARNING
    ~~~

    Because all ranges in the cluster, specifically the system ranges, no longer have a majority of their replicas, the cluster as a whole cannot make progress, and so the query will hang indefinitely.

## Step 3. Resolve the problem

1. In the terminal where node 2 was running, restart the node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --locality=datacenter=us-east-1 \
    --store=node2 \
    --host=localhost \
    --port=26258 \
    --http-port=8081 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

2. In the terminal where node 3 was running, restart the node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --locality=datacenter=us-east-1 \
    --store=node3 \
    --host=localhost \
    --port=26259 \
    --http-port=8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

3. Go back to the terminal where you issued the query.

    All ranges have a majority of their replicas again, and so the query executes and succeeds:

    ~~~
    +--------------------+
    |      Database      |
    +--------------------+
    | crdb_internal      |
    | information_schema |
    | pg_catalog         |
    | system             |
    +--------------------+
    (4 rows)
    ~~~

## What's Next?

[Data Unavailability Troubleshooting](data-unavailability-troubleshooting.html)
