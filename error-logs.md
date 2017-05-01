---
title: Error & Debug Logs
summary: Learn how to find and ready CockroachDB error logs
toc: false
---

When your nodes generate errors, CockroachDB stores them in logs on the nodes that generated the error. For example, if CockroachDB crashes it normally logs a stack trace to the cause.

<div id="toc"></div>

## Location

The location of your error logs are included in the [standard output when you start a node](start-a-node.html#standard-output). By default this location is `/cockroach-data/logs`.

### Changing Log Location

Your logs are stored by default in your node's `store`'s `path`. For example, if you [start your node](start-a-node.html) using the following command:

~~~ shell
$ cockroach start --store=path=/node1
~~~

Your error logs are stored in `/node1/logs`.

However, you can also specify an entirely different directory using the `--log-dir` flag. For example, if you start a node using the following command:

~~~ shell
$ cockroach start --store=path=/node1 --log-dir=/cockroach-logs
~~~

Your error logs are stored in `/cockroach-logs`.

## Behavior

By default, the debug logs contain info about certain cluster-level and range-level events. However, you can [increase their verbosity](#verbosity), as well as [include queries](#log-queries).

### Verbosity

However, you can increase the verbosity of the error logging using the following flags with [`cockroach start`](start-a-node.html):

Flag | Description
-----|------------
`--vmodule` | *(Preferred)* Verbose error logging.
`--v` | Very verbose error logging, which causes many log messages per SQL statement which is both distracting and a significant hit to performance. This is generally not recommended.

### Log Queries

To help troubleshoot [query performance issues](query-behavior-troubleshooting.html#performance-issues), you can enable cluster-wide error logging for long-running SQL queries or all queries, regardless of time.


#### Long-Running Queries

You can log only queries that take over a certain amount of time to execute using the cluster-wide setting, `sql.trace.txn.threshold`:

~~~ sql
> SET CLUSTER SETTING sql.trace.txn.threshold = '[time]';
~~~

The `[time]` accepts common time specifiers, such as `100ms` or `2s`.

Once you're done troubleshooting, you should disable this setting to prevent the logging from unnecessarily consuming resources. To disable long-running query logging, set the time to `0s`:

~~~ sql
> SET CLUSTER SETTING sql.trace.txn.threshold = '0s';
~~~

#### All Queries

You can also log all queries, regardless of the time they take to execute using the cluster-wide setting, `sql.trace.log_statement_execute`:

~~~ sql
> SET CLUSTER SETTING sql.trace.log_statement_execute = true;
~~~

Once you're done troubleshooting, you should disable this setting to prevent the logging from unnecessarily consuming resources. To disable query logging, set change the setting to `false`:

~~~ sql
> SET CLUSTER SETTING sql.trace.log_statement_execute = false;
~~~

## See Also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
