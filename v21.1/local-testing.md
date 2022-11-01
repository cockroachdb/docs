---
title: Test Your Application Locally
summary: Best practices for locally testing an application built on CockroachDB
toc: true
---

This page documents best practices for unit testing applications built on CockroachDB in a local environment.

If you are deploying a self-hosted cluster, see the [Production Checklist](recommended-production-settings.html) for information about preparing your cluster for production.

## Use a local, single-node cluster with in-memory storage

The [`cockroach start-single-node`](cockroach-start-single-node.html) command starts a single-node, insecure cluster with [in-memory storage](cockroach-start-single-node.html#store):

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start-single-node --insecure --store=type=mem,size=0.25 --advertise-addr=localhost
~~~

Using in-memory storage improves the speed of the cluster for local testing purposes.

## Log test output to a file

By default, `cockroach start-single-node` logs cluster activity to a file with the [default logging configuration](configure-logs.html#default-logging-configuration). When you specify the `--store=type=mem` flag, the command prints cluster activity directly to the console instead.

To customize logging behavior for local clusters, use the [`--log` flag](cockroach-start-single-node.html#logging):

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start-single-node --insecure --store=type=mem,size=0.25 --advertise-addr=localhost --log="{file-defaults: {dir: /path/to/logs}, sinks: {stderr: {filter: NONE}}}"
~~~

The `log` flag has two suboptions:

- `file-defaults`, which specifies the path of the file in which to log events (`/path/to/logs`).
- `sinks`, which provides a secondary destination to which to log events (`stderr`).

For more information about logging, see [Configure logs](configure-logs.html).

## Use a local file server for bulk operations

To test bulk operations like [`IMPORT`](import.html), [`BACKUP`](backup.html), or [`RESTORE`](restore.html), we recommend using a local file server.

For more details, see [Use a Local File Server for Bulk Operations](use-a-local-file-server-for-bulk-operations.html).

## See also

- [Error Handling and Troubleshooting](error-handling-and-troubleshooting.html)
- [Optimize Statement Performance](make-queries-fast.html)