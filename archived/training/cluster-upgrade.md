---
title: Cluster Upgrade
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
block_search: false
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vQFwUiv1205icOGxTN4OlMuMYSGjbx9Co3Ggx2mRsI9F9-pEUsvwkaJjOXb92ws1oOG-OY0j-C43G-j/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>

## Before you begin

In this lab, you'll start with a fresh cluster, so make sure you've stopped and cleaned up the cluster from the previous labs.

## Step 1. Install CockroachDB v19.1

1. Download the CockroachDB v19.1 archive for your OS, and extract the binary:

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>
    <p></p>

    <div class="filter-content" markdown="1" data-scope="mac">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-v19.1.1.darwin-10.9-amd64.tgz \
    | tar -xz
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-v19.1.1.linux-amd64.tgz \
    | tar -xz
    ~~~
    </div>

2. Move the v19.1 binary into the parent `cockroachdb-training` directory:

    <div class="filter-content" markdown="1" data-scope="mac">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mv cockroach-v19.1.1.darwin-10.9-amd64/cockroach ./cockroach-v19.1 \
    ; rm -rf cockroach-v19.1.1.darwin-10.9-amd64
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mv cockroach-v19.1.1.linux-amd64/cockroach ./cockroach-v19.1 \
    ; rm -rf cockroach-v19.1.1.linux-amd64
    ~~~
    </div>

## Step 2. Start a cluster running v19.1

Start and initialize a cluster like you did in previous modules, but this time using the v19.1 binary.

1. In a new terminal, start node 1:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach-v19.1 start \
    --insecure \
    --store=node1 \
    --host=localhost \
    --port=26257 \
    --http-port=8080 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

2. In a new terminal, start node 2:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach-v19.1 start \
    --insecure \
    --store=node2 \
    --host=localhost \
    --port=26258 \
    --http-port=8081 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

3. In a new terminal, start node 3:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach-v19.1 start \
    --insecure \
    --store=node3 \
    --host=localhost \
    --port=26259 \
    --http-port=8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

4. In a new terminal, perform a one-time initialization of the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach-v19.1 init --insecure
    ~~~

{{site.data.alerts.callout_info}}
You can disable a (manual or automatic) cluster version upgrade from the specified version until you reset your cluster by using the `cluster.preserve_downgrade_option` cluster setting. See the full [Cluster Upgrade](../upgrade-cockroach-version.html) documentation for details.
{{site.data.alerts.end}}

## Step 3. Upgrade the first node to v19.2

1. In node 1's terminal, press **CTRL-C** to terminate the `cockroach` process.

2. Verify that node 1 has been terminated:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ps | grep cockroach
    ~~~

    You should **not** see a `cockroach` process with `--store=node1` and `--port=26257`.

    ~~~
    49659 ttys001    0:02.43 ./cockroach-v19.1 start --insecure --store=node2 --host=localhost --port=26258 --http-port=8081 --join=localhost:26257,localhost:26258,localhost:26259
    49671 ttys002    0:02.32 ./cockroach-v19.1 start --insecure --store=node3 --host=localhost --port=26259 --http-port=8082 --join=localhost:26257,localhost:26258,localhost:26259
    49705 ttys015    0:00.00 grep cockroach
    ~~~~

3. In node 1's terminal, restart the node using the v19.2 binary:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node1 \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

4. Go to the Admin UI at <a href="http://localhost:8081" data-proofer-ignore>http://localhost:8081</a> to view the **Node List** and then verify that the node has rejoined the cluster using the new version of the binary.

## Step 4. Upgrade the rest of the nodes to v19.2

1. In node 2's terminal, press **CTRL-C** to terminate the `cockroach` process.

2. Verify that node 2 has been terminated:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ps | grep cockroach
    ~~~

    You should not see a `cockroach` process with `--store=node2` and `--port=26258`.

    ~~~
    49659 ttys001    0:07.05 ./cockroach-v19.1 start --insecure --store=node3 --host=localhost --port=26259 --http-port=8082 --join=localhost:26257,localhost:26258,localhost:26259
    49824 ttys002    0:00.00 grep cockroach
    49717 ttys015    0:05.76 ./cockroach start --insecure --store=node1 --listen-addr=localhost:26257 --http-addr=localhost:8080 --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

3. Restart the node using the v19.2 binary:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

4. Wait 1 minute.

5. In node 3's terminal, press **CTRL-C** to terminate the `cockroach` process.

6. Verify that node 3 has been terminated:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ps | grep cockroach
    ~~~

    You should not see a `cockroach` process with `--store=node3` and `--port=26259`.

    ~~~
    49869 ttys001    0:00.01 grep cockroach
    49849 ttys002    0:02.38 ./cockroach start --insecure --store=node2 --listen-addr=localhost:26258 --http-addr=localhost:8081 --join=localhost:26257,localhost:26258,localhost:26259
    49717 ttys015    0:10.88 ./cockroach start --insecure --store=node1 --listen-addr=localhost:26257 --http-addr=localhost:8080 --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

7. Restart the node using the v19.2 binary:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

## Step 5. Check your cluster's versions

Back in the Admin UI, you'll see that all 3 nodes now have the same, upgraded version. You can also use the `cockroach node status` command to check each node's version:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach node status \
--insecure
~~~

~~~
  id |     address     |   sql_address   |                  build                  |            started_at            |            updated_at            | locality | is_available | is_live
+----+-----------------+-----------------+-----------------------------------------+----------------------------------+----------------------------------+----------+--------------+---------+
   1 | localhost:26257 | localhost:26257 | v19.2.0-alpha.20190606-2479-gd98e0839dc | 2019-10-01 20:14:55.249457+00:00 | 2019-10-01 20:16:07.283866+00:00 |          | true         | true
   2 | localhost:26258 | localhost:26258 | v19.2.0-alpha.20190606-2479-gd98e0839dc | 2019-10-01 20:14:55.445079+00:00 | 2019-10-01 20:16:02.972943+00:00 |          | true         | true
   3 | localhost:26259 | localhost:26259 | v19.2.0-alpha.20190606-2479-gd98e0839dc | 2019-10-01 20:14:55.857631+00:00 | 2019-10-01 20:16:03.389338+00:00 |          | true         | true
(3 rows)
~~~

## Step 6. Clean up

This is the last module of the training, so feel free to stop you cluster and clean things up.

1. Stop all CockroachDB nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach
    ~~~

2. Remove the nodes' data directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node1 node2 node3
    ~~~
