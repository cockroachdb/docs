---
title: Cluster Upgrade
toc: false
toc_not_nested: true
sidebar_data: sidebar-data-training.json
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vQFwUiv1205icOGxTN4OlMuMYSGjbx9Co3Ggx2mRsI9F9-pEUsvwkaJjOXb92ws1oOG-OY0j-C43G-j/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>
<div id="toc"></div>

## Before You Begin

Make sure you have completed [Planned Maintenance](planned-maintenance.html) and have 3 nodes running CockroachDB v1.1. In this lab, you'll upgrade to the latest testing release of CockroachDB v2.0.

## Step 1. Install CockroachDB v2.0

1. Download a CockroachDB v2.0 archive for OS X, and extract the binary:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl -O https://binaries.cockroachdb.com/cockroach-v2.0-alpha.20180129.darwin-10.9-amd64.tgz | tar -xJ
    ~~~

You can overwrite the existing `cockroach` binary with this new version.

## Step 2. Perform the rolling upgrade on node1

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

## Step 3. Upgrade the rest of the nodes

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

## What's Next?

- [Node Decommissioning](node-decommissioning.html)
