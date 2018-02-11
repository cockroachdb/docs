---
title: Software Panic Troubleshooting
toc: false
toc_not_nested: true
sidebar_data: sidebar-data-training.json
---

In this lab, you'll cause a node to panic. You'll then troubleshoot and resolve the problem.

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>
<div id="toc"></div>

## Before You Begin

Make sure you have already completed [Data Corruption Troubleshooting](data-corruption-troubleshooting.html) and have a cluster of 3 nodes running.

## Step 1. Simulate the problem

In a new terminal, issue a "query of death" against node 3:

~~~ shell
$ cockroach sql \
--insecure \
--port=26259 \
--execute="SELECT crdb_internal.force_panic('foo');"
~~~

The query will crash the node, the connection will then fail, and you'll see the following printed to `stderr`:

~~~
Error: driver: bad connection
Failed running "sql"
~~~

## Step 2. Troubleshoot the problem

In the terminal where node 3 was running, check the `stdout` for details:

{{site.data.alerts.callout_info}}You can also look in the node's full logs at <code>node3/logs</code>.{{site.data.alerts.end}}

~~~
E180209 14:47:54.819282 2149 sql/session.go:1370  [client=127.0.0.1:53558,user=root,n1] a SQL panic has occurred!
*
* ERROR: [client=127.0.0.1:53558,user=root,n1] a SQL panic has occurred!
*
E180209 14:47:54.819378 2149 util/log/crash_reporting.go:113  [n1] a panic has occurred!
*
* ERROR: [n1] a panic has occurred!
*
panic while executing "select crdb_internal.force_panic('foo');": foo

goroutine 2149 [running]:
runtime/debug.Stack(0x8246800, 0xc42038e540, 0x3)
	/usr/local/go/src/runtime/debug/stack.go:24 +0x79
github.com/cockroachdb/cockroach/pkg/util/log.ReportPanic(0x8246800, 0xc42038e540, 0xc4201d2000, 0x56f2fe0, 0xc4203632a0, 0x1)
...
~~~

The cause of the panic is clearly identified before the stack trace:

~~~
panic while executing "select crdb_internal.force_panic('foo');": foo
~~~

## Step 3. Resolve the problem

With the cause identified, you should:

1. Update your application to stop issuing the "query of death".

2. Restart the down node.

3. File an issue with Cockroach Labs. We'll cover the ideal way to do this in an upcoming module.

## Step 4. Clean up

In the next lab, you'll start a new cluster from scratch, so take a moment to clean things up.

1. Stop the other CockroachDB nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach
    ~~~

2. Remove the nodes' data directories:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node1 node2 node3
    ~~~

## What's Next?

[Network Partition Troubleshooting](network-partition-troubleshooting.html)
