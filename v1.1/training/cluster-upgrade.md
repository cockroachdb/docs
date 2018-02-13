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

In this lab, you'll start with a fresh cluster, so make sure you've stopped and cleaned up the cluster from the previous labs.

## Step 1. Start a cluster running v1.1

Start and initialize a cluster like you did in previous modules.

1. In a new terminal, start node 1:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --store=node1 \
    --host=localhost \
    --port=26257 \
    --http-port=8080 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

2. In a new terminal, start node 2:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --store=node2 \
    --host=localhost \
    --port=26258 \
    --http-port=8081 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

3. In a new terminal, start node 3:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --store=node3 \
    --host=localhost \
    --port=26259 \
    --http-port=8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

4. In a new terminal, perform a one-time initialization of the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach init --insecure
    ~~~

## Step 2. Install CockroachDB v2.0

1. Download the CockroachDB v2.0 archive for your OS, and extract the binary:

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>
    <p></p>

    <div class="filter-content" markdown="1" data-scope="mac">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-v2.0-alpha.20180212.darwin-10.9-amd64.tgz \
    | tar -xJ
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-v2.0-alpha.20180212.linux-amd64.tgz \
    | tar  xvz
    ~~~
    </div>

2. Move the v2.0 binary into the parent `cockroachdb-training` directory:

    <div class="filter-content" markdown="1" data-scope="mac">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ mv cockroach-v2.0-alpha.20180212.darwin-10.9-amd64/cockroach ./cockroach-v2.0 \
    | rm -rf cockroach-v2.0-alpha.20180212.darwin-10.9-amd64
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ mv cockroach-v2.0-alpha.20180212.linux-amd64/cockroach ./cockroach-v2.0 \
    | rm -rf cockroach-v2.0-alpha.20180212.linux-amd64
    ~~~
    </div>

## Step 3. Upgrade the first node to v2.0

1. In node 1's terminal, press **CTRL + C** to stop the `cockroach` process.

2. Open the Admin UI at <a href="http://localhost:8081" data-proofer-ignore>http://localhost:8081</a>, click **View nodes list** and verify that the node has been stopped.

3. In node 1's terminal, restart the node using the v2.0 binary:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach-v2.0 start \
    --insecure \
    --store=node1 \
    --host=localhost \
    --port=26257 \
    --http-port=8080 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

4. Back in the Admin UI, verify that the node has rejoined the cluster and that it is using the new version of the binary:

    <img src="{{ 'images/training-20.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

## Step 4. Upgrade the rest of the nodes

1. In node 2's terminal, press **CTRL + C** to stop the `cockroach` process.

2. Restart the node using the v2.0 binary:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach-v2.0 start \
    --insecure \
    --store=node2 \
    --host=localhost \
    --port=26258 \
    --http-port=8081 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

3. Wait 1 minute.

4. In node 3's terminal, press **CTRL + C** to stop the `cockroach` process.

5. Restart the node using the v2.0 binary:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach-v2.0 start \
    --insecure \
    --store=node3 \
    --host=localhost \
    --port=26259 \
    --http-port=8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

## Step 5. Check your cluster's versions

Back in the Admin UI, you'll see that all 3 nodes now have the same, upgraded version:

<img src="{{ 'images/training-21.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

You can also use the `cockroach node status` command to check each node's version:

{% include copy-clipboard.html %}
~~~ shell
$ ./cockroach node status \
--insecure
~~~

~~~
+----+-----------------+---------------------+---------------------+---------------------+
| id |     address     |        build        |     updated_at      |     started_at      |
+----+-----------------+---------------------+---------------------+---------------------+
|  1 | localhost:26257 | v2.0-alpha.20180212 | 2018-02-13 10:59:42 | 2018-02-13 10:47:22 |
|  2 | localhost:26258 | v2.0-alpha.20180212 | 2018-02-13 10:59:49 | 2018-02-13 10:55:49 |
|  3 | localhost:26259 | v2.0-alpha.20180212 | 2018-02-13 10:59:42 | 2018-02-13 10:56:12 |
+----+-----------------+---------------------+---------------------+---------------------+
(3 rows)
~~~

## Step 6. Finalize the upgrade 

## What's Next?

- [Node Decommissioning](node-decommissioning.html)
