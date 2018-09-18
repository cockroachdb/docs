---
title: Cluster Upgrade
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
block_search: false
redirect_from: /training/cluster-upgrade.html
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vQFwUiv1205icOGxTN4OlMuMYSGjbx9Co3Ggx2mRsI9F9-pEUsvwkaJjOXb92ws1oOG-OY0j-C43G-j/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>

## Before you begin

In this lab, you'll start with a fresh cluster, so make sure you've stopped and cleaned up the cluster from the previous labs.

## Step 1. Install CockroachDB v2.0

1. Download the CockroachDB v2.0 archive for your OS, and extract the binary:

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>
    <p></p>

    <div class="filter-content" markdown="1" data-scope="mac">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-v2.0.5.darwin-10.9-amd64.tgz \
    | tar -xJ
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-v2.0.5.linux-amd64.tgz \
    | tar  xvz
    ~~~
    </div>

2. Move the v1.1 binary into the parent `cockroachdb-training` directory:

    <div class="filter-content" markdown="1" data-scope="mac">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ mv cockroach-v2.0.5.darwin-10.9-amd64/cockroach ./cockroach-v2.0 \
    ; rm -rf cockroach-v2.0.5.darwin-10.9-amd64
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ mv cockroach-v2.0.5.linux-amd64/cockroach ./cockroach-v2.0 \
    ; rm -rf cockroach-v2.0.5.linux-amd64
    ~~~
    </div>

## Step 2. Start a cluster running v2.0

Start and initialize a cluster like you did in previous modules, but this time using the v2.0 binary.

1. In a new terminal, start node 1:

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

2. In a new terminal, start node 2:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach-v2.0 start \
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
    $ ./cockroach-v2.0 start \
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
    $ ./cockroach-v2.0 init --insecure
    ~~~

## Step 3. Upgrade the first node to v2.1

1. In node 1's terminal, press **CTRL-C** to stop the `cockroach` process.

2. Verify that node 1 has stopped:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ps | grep cockroach
    ~~~

    You should **not** see a `cockroach` process with `--store=node1` and `--port=26257`.

    ~~~
    49659 ttys001    0:02.43 ./cockroach-v2.0 start --insecure --store=node2 --host=localhost --port=26258 --http-port=8081 --join=localhost:26257,localhost:26258,localhost:26259
    49671 ttys002    0:02.32 ./cockroach-v2.0 start --insecure --store=node3 --host=localhost --port=26259 --http-port=8082 --join=localhost:26257,localhost:26258,localhost:26259
    49705 ttys015    0:00.00 grep cockroach
    ~~~~

3. In node 1's terminal, restart the node using the v2.1 binary:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --store=node1 \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

4. Go to the Admin UI at <a href="http://localhost:8081" data-proofer-ignore>http://localhost:8081</a> to view the **Node List** and then verify that the node has rejoined the cluster using the new version of the binary:

    <img src="{{ 'images/v2.1/training-20.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

## Step 4. Upgrade the rest of the nodes to v2.1

1. In node 2's terminal, press **CTRL-C** to stop the `cockroach` process.

2. Verify that node 2 has stopped:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ps | grep cockroach
    ~~~

    You should not see a `cockroach` process with `--store=node2` and `--port=26258`.

    ~~~
    49659 ttys001    0:07.05 ./cockroach-v2.0 start --insecure --store=node3 --host=localhost --port=26259 --http-port=8082 --join=localhost:26257,localhost:26258,localhost:26259
    49824 ttys002    0:00.00 grep cockroach
    49717 ttys015    0:05.76 ./cockroach start --insecure --store=node1 --listen-addr=localhost:26257 --http-addr=localhost:8080 --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

3. Restart the node using the v2.1 binary:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --store=node2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

4. Wait 1 minute.

5. In node 3's terminal, press **CTRL-C** to stop the `cockroach` process.

6. Verify that node 3 has stopped:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ps | grep cockroach
    ~~~

    You should not see a `cockroach` process with `--store=node3` and `--port=26259`.

    ~~~
    49869 ttys001    0:00.01 grep cockroach
    49849 ttys002    0:02.38 ./cockroach start --insecure --store=node2 --listen-addr=localhost:26258 --http-addr=localhost:8081 --join=localhost:26257,localhost:26258,localhost:26259
    49717 ttys015    0:10.88 ./cockroach start --insecure --store=node1 --listen-addr=localhost:26257 --http-addr=localhost:8080 --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

7. Restart the node using the v2.1 binary:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

## Step 5. Check your cluster's versions

Back in the Admin UI, you'll see that all 3 nodes now have the same, upgraded version:

<img src="{{ 'images/v2.1/training-21.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

You can also use the `cockroach node status` command to check each node's version:

{% include copy-clipboard.html %}
~~~ shell
$ ./cockroach node status \
--insecure
~~~

~~~
  id |     address     |        build         |            started_at            |            updated_at            | is_live
+----+-----------------+----------------------+----------------------------------+----------------------------------+---------+
   1 | localhost:26257 | v2.1.0-beta.20180910 | 2018-09-13 22:27:29.290335+00:00 | 2018-09-13 22:37:32.314011+00:00 | true
   2 | localhost:26259 | v2.1.0-beta.20180910 | 2018-09-13 22:34:17.468613+00:00 | 2018-09-13 22:37:35.491432+00:00 | true
   3 | localhost:26258 | v2.1.0-beta.20180910 | 2018-09-13 22:36:06.252257+00:00 | 2018-09-13 22:37:31.770426+00:00 | true
(3 rows)
~~~

## Step 6. Clean up

This is the last module of the training, so feel free to stop you cluster and clean things up.

1. Stop all CockroachDB nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach
    ~~~

2. Remove the nodes' data directories:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node1 node2 node3
    ~~~
