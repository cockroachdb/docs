---
title: Data Corruption Troubleshooting
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
block_search: false
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vQuOKrRv9JEUuEnbvs-_YY8rRaDIzxkaH6G54lOWba3DvCwZCfEl-Vq9842__lPPRL6IdOh86plx8hs/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

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
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --logtostderr=WARNING
    ~~~~

2. In a new terminal, start node 2:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --logtostderr=WARNING
    ~~~

3. In a new terminal, start node 3:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --logtostderr=WARNING
    ~~~

4. In a new terminal, perform a one-time initialization of the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --insecure --host=localhost:26257
    ~~~

## Step 2. Prepare to simulate the problem

Before you can manually corrupt data, you need to import enough data so that the cluster creates persistent `.sst` files.

1. Create a database into which you'll import a new table:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="CREATE DATABASE import_test;"
    ~~~

2. Run the [`IMPORT`](../import.html) command, using schema and data files we've made publicly available on Google Cloud Storage:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --database="import_test" \
    --execute="IMPORT TABLE orders CREATE USING 'https://storage.googleapis.com/cockroach-fixtures/tpch-csv/schema/orders.sql' CSV DATA ('https://storage.googleapis.com/cockroach-fixtures/tpch-csv/sf-1/orders.tbl.1') WITH delimiter = '|';"
    ~~~

    The import will take a minute or two. Once it completes, you'll see a confirmation with details:

    ~~~
            job_id       |  status   | fraction_completed |  rows  | index_entries | system_records |  bytes
    +--------------------+-----------+--------------------+--------+---------------+----------------+----------+
      378521252933861377 | succeeded |                  1 | 187500 |        375000 |              0 | 26346739
    (1 row)
    ~~~

## Step 2. Simulate the problem

1. In the same terminal, look in the data directory of `node3`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ls node3
    ~~~

    ~~~
    000003.log			IDENTITY			OPTIONS-000005			cockroach.http-addr
    000006.sst			LOCK				auxiliary			cockroach.listen-addr
    COCKROACHDB_VERSION		MANIFEST-000001			cockroach-temp478417278		logs
    CURRENT				MANIFEST-000007			cockroach.advertise-addr	temp-dirs-record.txt
    ~~~

2. Delete one of the `.sst` files.

3. In the terminal where node 3 is running, press **CTRL-C** to stop it.

4. Try to restart node 3:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --logtostderr=WARNING
    ~~~

    The startup process will fail, and you'll see the following printed to `stderr`:

    ~~~
    W180209 10:45:03.684512 1 cli/start.go:697  Using the default setting for --cache (128 MiB).
      A significantly larger value is usually needed for good performance.
      If you have a dedicated server a reasonable setting is --cache=25% (2.0 GiB).
    W180209 10:45:03.805541 37 gossip/gossip.go:1241  [n?] no incoming or outgoing connections
    E180209 10:45:03.808537 1 cli/error.go:68  cockroach server exited with error: failed to create engines: could not open rocksdb instance: Corruption: Sst file size mismatch: /Users/jesseseldess/cockroachdb-training/cockroach-{{page.release_info.version}}.darwin-10.9-amd64/node3/000006.sst. Size recorded in manifest 2626945, actual size 2626210
    *
    * ERROR: cockroach server exited with error: failed to create engines: could not open rocksdb instance: Corruption: Sst file size mismatch: /Users/jesseseldess/cockroachdb-training/cockroach-{{page.release_info.version}}.darwin-10.9-amd64/node3/000006.sst. Size recorded in manifest 2626945, actual size 2626210
    *
    *
    Failed running "start"
    ~~~

    The error tells you that the failure has to do with RocksDB-level (i.e., storage-level) corruption. Because the node's data is corrupt, the node will not restart.

## Step 3. Resolve the problem

Because only 1 node's data is corrupt, the solution is to completely remove the node's data directory and restart the node.

1. Remove the `node3` data directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node3
    ~~~

2. In the terminal where node 3 was running, restart the node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --logtostderr=WARNING
    ~~~

In this case, the cluster repairs the node using data from the other nodes. In more severe emergencies where multiple disks are corrupted, there are tools like `cockroach debug rocksdb` to let you inspect the files in more detail and try to repair them. If enough nodes/files are corrupted, [restoring to a enterprise backup](../restore.html) is best.

{{site.data.alerts.callout_danger}}
In all cases of data corruption, you should [get support from Cockroach Labs](how-to-get-support.html).
{{site.data.alerts.end}}

## What's next?

[Software Panic Troubleshooting](software-panic-troubleshooting.html)
