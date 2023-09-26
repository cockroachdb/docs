---
title: Common Errors
summary: Learn how to troubleshoot issues with a single-node cluster
toc: true
---

This page helps with general troubleshooting steps that apply to many different scenarios, such as not being able to connect to a node.

{{site.data.alerts.callout_info}}If you cannot find what you're looking for, we also have more detailed <a href="troubleshooting-overview.html">troubleshooting steps for specific issues</a>.{{site.data.alerts.end}}


## Common Troubleshooting Steps

If you run into issues with CockroachDB, there are a few steps you can always take:

- Check your [logs](debug-and-error-logs.html) for errors related to your issue. Logs are generated on a per-node basis, so you must either identify the node where the issue occurred or [collect the logs from all active nodes in your cluster](debug-zip.html).

- [Stop](stop-a-node.html) and [restart](start-a-node.html) problematic nodes with the `--logtostderr` flag. This option prints logs to your terminal through `stderr`, letting you see all of your cluster's activities as they occur.

## Common Errors

### `getsockopt: connection refused` Error

This error indicates that the `cockroach` binary is either not running or is not listening on the interfaces (i.e., hostname or port) you specified.

To resolve this issue, you must do one of the following:

- [Start your CockroachDB node](start-a-node.html).
- If you specified a `--host` flag when starting your node, you must include it with all other [`cockroach` commands](cockroach-commands.html).
- If you specified a `--port` flag when starting your node, you must include it with all other [`cockroach` commands](cockroach-commands.html) or change the `COCKROACH_PORT` environment variable.

If you're not sure what the `--host` and `--port` values might have been, you can end the `cockroach` process, and then restart the node:

~~~ shell
$ pkill cockroach
$ cockroach start [flags]
~~~

### Replication Error in a Single-Node Cluster

When running a single-node CockroachDB cluster, an error about replicas failing will eventually show up in the node's log files, for example:

~~~ shell
E160407 09:53:50.337328 storage/queue.go:511  [replicate] 7 replicas failing with "0 of 1 store with an attribute matching []; likely not enough nodes in cluster"
~~~

This error occurs because CockroachDB expects three nodes by default. If you do not intend to add additional nodes, you can stop this error by updating your default zone configuration to expect only one node:

~~~ shell
# Insecure cluster:
$ cockroach zone set .default --insecure --disable-replication

# Secure cluster:
$ cockroach zone set .default --certs-dir=[path to certs directory] --disable-replication
~~~

The `--disable-replication` flag automatically reduces the zone's replica count to 1, but you can do this manually as well:

~~~ shell
# Insecure cluster:
$ echo 'num_replicas: 1' | cockroach zone set .default --insecure -f -

# Secure cluster:
$ echo 'num_replicas: 1' | cockroach zone set .default --certs-dir=[path to certs directory] -f -
~~~

See [Configure Replication Zones](configure-replication-zones.html) for more details.

## Something Else?

If we do not have a solution here, you can try using our other [support resources](support-resources.html), including:

- [CockroachDB Community Forum](https://forum.cockroachlabs.com)
- [CockroachDB Community Slack](https://cockroachdb.slack.com)
- [StackOverflow](http://stackoverflow.com/questions/tagged/cockroachdb)
- [CockroachDB Support Portal](https://support.cockroachlabs.com)
