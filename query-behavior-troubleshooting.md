---
title: Query Behavior Troubleshooting
summary: Learn how to troubleshoot issues with specific queries with CockroachDB 
toc: false
---

You run a query, either by hand or through your application, and receive an unexpected result.

<div id="toc"></div>

## `bad connection` & `closed` Responses

If you receive a response of `bad connection` or `closed`, this normally indicates that the node you connected to died. You can check this by connecting to the cluster and running [`cockroach node status`](view-node-details.html#show-the-status-of-all-nodes).

Once you find the downed node, you can check its [error logs](error-logs.html) (stored in `cockroach-data/logs` by default).

Because this kind of result is entirely unexpected, you should [file an issue](file-an-issue.html).

## Correctness Issues

If your queries return unexpected results, there are several possibilities:

- Your application has a bug. It's always worthwhile to check and double-check your application’s logic before filing an issue. That said, you can always [reach out for support](support-resources.html).
- You’ve encountered a [known limitation](https://github.com/cockroachdb/cockroach/issues?q=is%3Aopen+is%3Aissue+label%3Aknown-limitation), [UX surprise](https://github.com/cockroachdb/cockroach/issues?utf8=%E2%9C%93&q=is%3Aopen%20is%3Aissue%20label%3Aux-surprise) or other problem with [SQL semantics](https://github.com/cockroachdb/cockroach/issues?utf8=%E2%9C%93&q=is%3Aopen%20is%3Aissue%20label%3Asql-semantics). Feel free to ping the existing issue indicating that you’ve encountered it as well.
 - CockroachDB has a bug. Please [file an issue](file-an-issue.html).

## Performance Issues

If your queries take much longer than expected, we have general guidance:

- Log long-running queries to your [error logs](error-logs.html) with `sql.trace.txn.threshold`:

  ~~~ shell
  $ cockroach sql -e "SET CLUSTER SETTING sql.trace.txn.threshold = '[time]'"
  ~~~

  The `[time]` accepts common time specifiers, such as `100ms` or `2s`.

  After finding which queries are slow, use [`EXPLAIN`](explain.html) to examine them. It's possible that it's performing a full-table scan and you could improve its performance by [adding an index](create-index.html).

  This feature includes tracing for all elements, which increases the resources each query consumes, so should be used only when tracking down a problem. After resolving the problem, you should disable it:

  ~~~ shell
  $ cockroach sql -e "SET CLUSTER SETTING sql.trace.txn.threshold = '0s'"
  ~~~

- Review your deployment's monitoring. General network latency could affect query response times, or perhaps your network experienced a partitioning event.

If you're still unable to determine why the query executes slowly, please [file an issue](file-an-issue.html).

## Something Else?

If we don't have an solution here, you can try:

- [StackOverflow](http://stackoverflow.com/questions/tagged/cockroachdb)
- [CockroachDB Community Forum](https://forum.cockroachlabs.com)
- [Chatting with our developers on Gitter](https://gitter.im/cockroachdb/cockroach) (To open Gitter without leaving these docs, click **Help** in the lower-right corner of any page.)
