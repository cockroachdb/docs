---
title: Troubleshoot Query Behavior
summary: Learn how to troubleshoot issues with specific queries with CockroachDB
toc: false
---

If a query returns an unexpected result or takes longer than expected to process, this page will help you troubleshoot the issue.

<div id="toc"></div>

## Correctness Issues

If your queries return unexpected results, there are several possibilities:

- You’ve encountered a [known limitation](https://github.com/cockroachdb/cockroach/issues?q=is%3Aopen+is%3Aissue+label%3Aknown-limitation), [UX surprise](https://github.com/cockroachdb/cockroach/issues?utf8=%E2%9C%93&q=is%3Aopen%20is%3Aissue%20label%3Aux-surprise) or other problem with [SQL semantics](https://github.com/cockroachdb/cockroach/issues?utf8=%E2%9C%93&q=is%3Aopen%20is%3Aissue%20label%3Asql-semantics). Feel free to leave a comment on the existing issue indicating that you’ve encountered a problem as well.
- Your application has a bug. It's always worthwhile to check and double-check your application’s logic before filing an issue. That said, you can always [reach out for support](support-resources.html).
- CockroachDB has a bug. Please [file an issue](file-an-issue.html).

## Performance Issues

If queries are taking longer than expected to process, there are a few things you can check into:

- Review your deployment's monitoring. General network latency or partitioning events can affect query response times.

- [Identify and cancel long-running queries](manage-long-running-queries.html).

If you're still unable to determine why the query executes slowly, please [file an issue](file-an-issue.html).

## `bad connection` & `closed` Responses

If you receive a response of `bad connection` or `closed`, this normally indicates that the node you connected to died. You can check this by connecting to another node in the cluster and running [`cockroach node status`](view-node-details.html#show-the-status-of-all-nodes).

Once you find the downed node, you can check its [logs](debug-and-error-logs.html) (stored in `cockroach-data/logs` by default).

Because this kind of behavior is entirely unexpected, you should [file an issue](file-an-issue.html).

## `result is ambiguous` Responses

In a distributed system, some errors can have ambiguous results. For
example, if you receive a `connection closed` error while processing a
`COMMIT` statement, you can't tell whether the transaction
successfully committed or not. These errors are possible in any
database, but CockroachDB is somewhat more likely to produce them than
other databases because ambiguous results can be caused by failures
between the nodes of a cluster. These errors are reported with the
PostgreSQL error code `40003` (`statement_completion_unknown`) and the
message `result is ambiguous`.

Ambiguous errors can be cause by nodes crashing, network failures, or
timeouts. If you experience a lot of these errors when things are
otherwise stable, look for performance issues.

In general, you should handle ambiguous errors the same way as
`connection closed` errors. If your transaction is
[idempotent](https://en.wikipedia.org/wiki/Idempotence#Computer_science_meaning),
it is safe to retry it on ambiguous errors. `UPSERT` operations are
typically idempotent, and other transactions can be written to be
idempotent by verifying the expected state before performing any
writes. Increment operations such as `UPDATE my_table SET x=x+1 WHERE
id=$1` are typical examples of operations that cannot easily be made
idempotent. If your transaction is not idempotent, then you should
decide whether to retry or not based on whether it would be better for
your application to apply the transaction twice or return an error to
the user.

## Something Else?

If we don't have a solution here, you can try using our other [support resources](support-resources.html), including:

- [StackOverflow](http://stackoverflow.com/questions/tagged/cockroachdb)
- [CockroachDB Community Forum](https://forum.cockroachlabs.com)
- [Chatting with our developers on Gitter](https://gitter.im/cockroachdb/cockroach) (To open Gitter without leaving these docs, click **Help** in the lower-right corner of any page.)
