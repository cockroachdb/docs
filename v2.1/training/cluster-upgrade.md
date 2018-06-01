---
title: Cluster Upgrade
toc: false
toc_not_nested: true
sidebar_data: sidebar-data-training.json
block_search: true
redirect_from: /training/cluster-upgrade.html
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vQFwUiv1205icOGxTN4OlMuMYSGjbx9Co3Ggx2mRsI9F9-pEUsvwkaJjOXb92ws1oOG-OY0j-C43G-j/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>
<div id="toc"></div>

## Before you begin

In this lab, you'll start with a fresh cluster, so make sure you've stopped and cleaned up the cluster from the previous labs.

## Step 1. Install CockroachDB v1.1

1. Download the CockroachDB v1.1 archive for your OS, and extract the binary:

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>
    <p></p>

    <div class="filter-content" markdown="1" data-scope="mac">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-v1.1.7.darwin-10.9-amd64.tgz \
    | tar -xJ
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-v1.1.7.linux-amd64.tgz \
    | tar  xvz
    ~~~
    </div>

2. Move the v1.1 binary into the parent `cockroachdb-training` directory:

    <div class="filter-content" markdown="1" data-scope="mac">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ mv cockroach-v1.1.7.darwin-10.9-amd64/cockroach ./cockroach-v1.1 \
    ; rm -rf cockroach-v1.1.7.darwin-10.9-amd64
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ mv cockroach-v1.1.7.linux-amd64/cockroach ./cockroach-v1.1 \
    ; rm -rf cockroach-v1.1.7.linux-amd64
    ~~~
    </div>

## Step 2. Start a cluster running v1.1

Start and initialize a cluster like you did in previous modulesm, but this time using the v1.1 binary.

1. In a new terminal, start node 1:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach-v1.1 start \
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
    $ ./cockroach-v1.1 start \
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
    $ ./cockroach-v1.1 start \
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
    $ ./cockroach-v1.1 init --insecure
    ~~~

## Step 3. Upgrade the first node to v2.0

1. In node 1's terminal, press **CTRL-C** to stop the `cockroach` process.

2. Verify that node 1 has stopped:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ps | grep cockroach
    ~~~

    You should **not** see a `cockroach` process with `--store=node1` and `--port=26257`.

    ~~~
    6521 ttys001    0:00.86 ./cockroach-v1.1 start --insecure --store=node3 --host=localhost --port=26259 --http-port=8082 --join=localhost:26257,localhost:26258,localhost:26259
    6543 ttys002    0:00.00 grep cockroach-v1.1
    6509 ttys004    0:00.98 ./cockroach-v1.1 start --insecure --store=node2 --host=localhost --port=26258 --http-port=8081 --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

3. In node 1's terminal, restart the node using the v2.0 binary:

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

4. Go to the Admin UI at <a href="http://localhost:8081" data-proofer-ignore>http://localhost:8081</a> to view the **Node List** and then verify that the node has rejoined the cluster using the new version of the binary:

    <img src="{{ 'images/v2.0/training-20.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

    You can also use the `cockroach node status` command to check each node's version:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach node status \
    --insecure
    ~~~

    ~~~
    +----+-----------------+--------+---------------------+---------------------+---------+
    | id |     address     | build  |     updated_at      |     started_at      | is_live |
    +----+-----------------+--------+---------------------+---------------------+---------+
    |  1 | localhost:26257 | v2.0.0 | 2018-04-13 10:17:29 | 2018-04-13 10:15:59 | true    |
    |  2 | localhost:26258 | v1.1.7 | 2018-04-13 10:17:30 | 2018-04-13 10:14:30 | true    |
    |  3 | localhost:26259 | v1.1.7 | 2018-04-13 10:17:30 | 2018-04-13 10:14:30 | true    |
    +----+-----------------+--------+---------------------+---------------------+---------+
    (3 rows)
    ~~~

## Step 4. Upgrade the rest of the nodes

1. In node 2's terminal, press **CTRL-C** to stop the `cockroach` process.

2. Verify that node 2 has stopped:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ps | grep cockroach
    ~~~

    You should not see a `cockroach` process with `--store=node2` and `--port=26258`.

    ~~~
    6521 ttys001    0:04.61 ./cockroach-v1.1 start --insecure --store=node3 --host=localhost --port=26259 --http-port=8082 --join=localhost:26257,localhost:26258,localhost:26259
    6564 ttys002    0:03.68 ./cockroach start --insecure --store=node1 --host=localhost --port=26257 --http-port=8080 --join=localhost:26257,localhost:26258,localhost:26259
    6641 ttys004    0:00.00 grep cockroach
    ~~~

3. Restart the node using the v2.0 binary:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --store=node2 \
    --host=localhost \
    --port=26258 \
    --http-port=8081 \
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
    6688 ttys001    0:00.00 grep cockroach
    6564 ttys002    0:04.90 ./cockroach start --insecure --store=node1 --host=localhost --port=26257 --http-port=8080 --join=localhost:26257,localhost:26258,localhost:26259
    6668 ttys004    0:01.22 ./cockroach start --insecure --store=node2 --host=localhost --port=26258 --http-port=8081 --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

7. Restart the node using the v2.0 binary:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --store=node3 \
    --host=localhost \
    --port=26259 \
    --http-port=8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

## Step 5. Check your cluster's versions

Back in the Admin UI, you'll see that all 3 nodes now have the same, upgraded version:

<img src="{{ 'images/v2.0/training-21.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

You can also use the `cockroach node status` command to check each node's version:

{% include copy-clipboard.html %}
~~~ shell
$ ./cockroach node status \
--insecure
~~~

~~~
+----+-----------------+--------+---------------------+---------------------+---------+
| id |     address     | build  |     updated_at      |     started_at      | is_live |
+----+-----------------+--------+---------------------+---------------------+---------+
|  1 | localhost:26257 | v2.0.0 | 2018-04-13 10:22:49 | 2018-04-13 10:15:59 | true    |
|  2 | localhost:26258 | v2.0.0 | 2018-04-13 10:22:45 | 2018-04-13 10:20:24 | true    |
|  3 | localhost:26259 | v2.0.0 | 2018-04-13 10:22:49 | 2018-04-13 10:21:59 | true    |
+----+-----------------+--------+---------------------+---------------------+---------+
(3 rows)
~~~

## Step 6. Finalize the upgrade

Once all nodes are on the same upgraded version, update the `version` cluster setting to enable certain backwards-incompatible performance improvements and bug fixes that were introduced in v2.0:

{% include copy-clipboard.html %}
~~~ shell
$ ./cockroach sql \
--insecure \
--execute="SET CLUSTER SETTING version = crdb_internal.node_executable_version();"
~~~

{{site.data.alerts.callout_info}}This final step is required after upgrading from v1.1.x to v2.0. For upgrades within the 2.0.x series, you do not need to take any further action. Note that, after completing this step, it will no longer be possible to perform a rolling downgrade to v1.1. In the event of a catastrophic failure or corruption due to usage of new features requiring v2.0, the only option is to start a new cluster using the old binary and then restore from one of the backups created prior to finalizing the upgrade.{{site.data.alerts.end}}

## Step 7. Clean up

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
