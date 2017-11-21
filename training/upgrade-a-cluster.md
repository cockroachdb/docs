---
title: Upgrade a Cluster
summary: Learn how to upgrade a CockroachDB cluster to a new version.
toc: false
sidebar_data: sidebar-data-training.json
---

<div id="toc"></div>

## Presentation

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vQFwUiv1205icOGxTN4OlMuMYSGjbx9Co3Ggx2mRsI9F9-pEUsvwkaJjOXb92ws1oOG-OY0j-C43G-j/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

## Lab

In this lab, we'll upgrade your cluster to use the latest dev release.

### Before You Begin

To complete this lab, you need a [local cluster of 3 nodes](3-node-local-secure-cluster.html).

### Step 1. Install the dev binary

[Download and install the latest dev binary](../dev/install-cockroachdb.html).

You can overwrite the existing `cockroach` binary with this new version.

### Step 2. Perform the rolling upgrade on node1

1. Stop node 1 the `cockroach` process:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --certs-dir=certs --port=26257
    ~~~

    Then verify that the process has stopped:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach node status --certs-dir=certs --port=26258
    ~~~

    The node's `updated_at` column will stop being updated once the process stops, while the other node's values will continue to increase.

2. Restart the node (which will use the new binary and update the version of the node):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node1 \
    --host=localhost \
    --http-host=localhost \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

3. Verify the node has rejoined the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach node status --certs-dir=certs
    ~~~

### Step 3. Upgrade the rest of the nodes

1. Bring down node2:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --certs-dir=certs --port=26258
    ~~~

2. Upgrade node2:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node2 \
    --host=localhost \
    --port=26258 \
    --http-port=8081 \
    --http-host=localhost \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

 3. Wait 1 minute.

 4. Bring down node3:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --certs-dir=certs --port=26259
    ~~~

2. Upgrade node2:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node3 \
    --host=localhost \
    --port=26259 \
    --http-port=8082 \
    --http-host=localhost \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

## Step 4. Check your cluster's versions

{% include copy-clipboard.html %}
~~~ shell
$ cockroach node status --certs-dir=certs
~~~

You should now see that all 3 nodes in your cluster have the same, upgraded version.

## Up Next

- [Decommission Nodes](decommission-nodes.html)
