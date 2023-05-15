---
title: Troubleshoot Query Behavior
summary: Learn how to troubleshoot issues with specific queries with CockroachDB
toc: true
---

If a query returns an unexpected result or takes longer than expected to process, this page will help you troubleshoot the issue.


## Correctness Issues

If your queries return unexpected results, there are several possibilities:

- You’ve encountered a [known limitation](https://github.com/cockroachdb/cockroach/issues?q=is%3Aopen+is%3Aissue+label%3Aknown-limitation), [UX surprise](https://github.com/cockroachdb/cockroach/issues?utf8=%E2%9C%93&q=is%3Aopen%20is%3Aissue%20label%3Aux-surprise) or other problem with [SQL semantics](https://github.com/cockroachdb/cockroach/issues?utf8=%E2%9C%93&q=is%3Aopen%20is%3Aissue%20label%3Asql-semantics). Feel free to leave a comment on the existing issue indicating that you’ve encountered a problem as well.
- Your application has a bug. It's always worthwhile to check and double-check your application’s logic before filing an issue. That said, you can always [reach out for support](support-resources.html).
- CockroachDB has a bug. Please [file an issue](file-an-issue.html).

## Performance Issues

If queries are taking longer than expected to process, there are a few things you can check into:

- Review your deployment's monitoring. General network latency or partitioning events can affect query response times.

- [Identify and cancel long-running queries](manage-long-running-queries.html).

- [Turn on SQL logging](#sql-logging).

If you're still unable to determine why the query executes slowly, please [file an issue](file-an-issue.html).

## `bad connection` & `closed` Responses

If you receive a response of `bad connection` or `closed`, this normally indicates that the node you connected to died. You can check this by connecting to another node in the cluster and running [`cockroach node status`](view-node-details.html#show-the-status-of-all-nodes).

Once you find the downed node, you can check its [logs](debug-and-error-logs.html) (stored in `cockroach-data/logs` by default).

Because this kind of behavior is entirely unexpected, you should [file an issue](file-an-issue.html).

## SQL Logging

{% include {{ page.version.version }}/faq/sql-query-logging.md %}

## Something Else?

Try searching the rest of our docs for answers or using our other [support resources](support-resources.html), including:

- [CockroachDB Community Forum](https://forum.cockroachlabs.com)
- [CockroachDB Community Slack](https://cockroachdb.slack.com)
- [StackOverflow](http://stackoverflow.com/questions/tagged/cockroachdb)
- [CockroachDB Support Portal](https://support.cockroachlabs.com)
