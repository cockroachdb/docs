---
title: Data Corruption Troubleshooting
toc: false
toc_not_nested: true
sidebar_data: sidebar-data-training.json
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vQuOKrRv9JEUuEnbvs-_YY8rRaDIzxkaH6G54lOWba3DvCwZCfEl-Vq9842__lPPRL6IdOh86plx8hs/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>
<div id="toc"></div>

## Before You Begin

In this lab, you'll start with a fresh cluster, so make sure you've stopped and cleaned up the cluster from the previous labs.

## Step 1. Start a 3-node cluster

1. In a new terminal, start node 1:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=datacenter=us-east-1 \
    --store=node1 \
    --host=localhost \
    --port=26257 \
    --http-port=8080 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --logtostderr=WARNING
    ~~~~

2. In a new terminal, start node 2:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=datacenter=us-east-1 \
    --store=node2 \
    --host=localhost \
    --port=26258 \
    --http-port=8081 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --logtostderr=WARNING
    ~~~

3. In a new terminal, start node 3:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=datacenter=us-east-1 \
    --store=node3 \
    --host=localhost \
    --port=26259 \
    --http-port=8082 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --logtostderr=WARNING
    ~~~

4. In a new terminal, perform a one-time initialization of the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach init --insecure
    ~~~

## Step 2. Prepare to simulate the problem

Before you can manually corrupt data, you need to import enough data so that the cluster creates persistent `.sst` files.

1. In the same terminal, enable the "experimental" [`IMPORT`](../v1.1/import.html) feature:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="SET CLUSTER SETTING experimental.importcsv.enabled = true;"
    ~~~

2. Create a database into which you'll import a new table:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="CREATE DATABASE import_test;"
    ~~~

3. Run the [`IMPORT`](../v1.1/import.html) command, using schema and data files we've made publicly available on Google Cloud Storage:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --database="import_test" \
    --execute="IMPORT TABLE orders CREATE USING 'https://storage.googleapis.com/cockroach-fixtures/tpch-csv/schema/orders.sql' CSV DATA ('https://storage.googleapis.com/cockroach-fixtures/tpch-csv/sf-1/orders.tbl.1') WITH temp = 'nodelocal:///tmp', delimiter = '|';"
    ~~~

    The import will take a minute or two. Once it completes, you'll see a confirmation with details:

    ~~~
    +--------------------+-----------+--------------------+--------+---------------+----------------+----------+
    |       job_id       |  status   | fraction_completed |  rows  | index_entries | system_records |  bytes   |
    +--------------------+-----------+--------------------+--------+---------------+----------------+----------+
    | 320453737551659009 | succeeded |                  1 | 187500 |        375000 |              0 | 36389148 |
    +--------------------+-----------+--------------------+--------+---------------+----------------+----------+
    (1 row)
    ~~~

## Step 2. Simulate the problem

1. In the same terminal, look in the data directory of node3:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ls node3
    ~~~

    ~~~
    000003.log                000009.sst                IDENTITY                  MANIFEST-000007           cockroach.advertise-addr  local/
    000006.sst                COCKROACHDB_VERSION       LOCK                      OPTIONS-000005            cockroach.http-addr       logs/
    000008.sst                CURRENT                   MANIFEST-000001           auxiliary/                cockroach.listen-addr
    ~~~

2. Open one of the `.sst` files and delete several lines.

3. In the terminal where node 3 is running, press **CTRL + C** to stop it.

4. Try to restart node 3:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=datacenter=us-east-1 \
    --store=node3 \
    --host=localhost \
    --port=26259 \
    --http-port=8082 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --logtostderr=WARNING
    ~~~

    The startup process will fail, and you'll see the following printed to `stderr`:

    ~~~
    W180209 10:45:03.684512 1 cli/start.go:697  Using the default setting for --cache (128 MiB).
      A significantly larger value is usually needed for good performance.
      If you have a dedicated server a reasonable setting is --cache=25% (2.0 GiB).
    W180209 10:45:03.805541 37 gossip/gossip.go:1241  [n?] no incoming or outgoing connections
    E180209 10:45:03.808537 1 cli/error.go:68  cockroach server exited with error: failed to create engines: could not open rocksdb instance: Corruption: Sst file size mismatch: /Users/jesseseldess/cockroachdb-training/cockroach-v1.1.4.darwin-10.9-amd64/node3/000006.sst. Size recorded in manifest 2626945, actual size 2626210
    *
    * ERROR: cockroach server exited with error: failed to create engines: could not open rocksdb instance: Corruption: Sst file size mismatch: /Users/jesseseldess/cockroachdb-training/cockroach-v1.1.4.darwin-10.9-amd64/node3/000006.sst. Size recorded in manifest 2626945, actual size 2626210
    *
    *
    Failed running "start"
    ~~~

    The error tells you that the failure has to do with RocksDB-level (i.e., storage-level) corruption. Because the node's data is corrupt, the node won't restart.

## Step 3. Resolve the problem

Because only 1 node's data is corrupt, the solution is to completely remove the node's data directory and restart the node.

1. Remove the `node3` data directory:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node3
    ~~~

2. In the terminal where node 3 was running, restart the node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=datacenter=us-east-1 \
    --store=node3 \
    --host=localhost \
    --port=26259 \
    --http-port=8082 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --logtostderr=WARNING
    ~~~

In this case, the cluster repairs the node using data from the other nodes. In more severe emergencies where multiple disks are corrupted, there are tools like `cockroach debug rocksdb` to let you inspect the files in more detail and try to repair them. If enough nodes/files are corrupted, [restoring to a enterprise backup](../v1.1/restore.html) is best.

{{site.data.alerts.callout_danger}}In all cases of data corruption, you should <a href="how-to-get-support.html">get support from Cockroach Labs</a>.{{site.data.alerts.end}}

## What's Next?

[Software Panic Troubleshooting](software-panic-troubleshooting.html)
