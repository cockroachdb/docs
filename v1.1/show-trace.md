---
title: SHOW TRACE
summary: The SHOW TRACE statement...
toc: false
---

<span class="version-tag">New in v1.1:</span> The `SHOW TRACE` [statement](sql-statements.html) returns details about how CockroachDB executed a statement or series of statements. These details include messages and timing information from all nodes involved in the execution, providing visibility into the actions taken by CockroachDB across all of its software layers.

You can use `SHOW TRACE` to debug why a query is not performing as expected, to add more information to bug reports, or to generally learn more about how CockroachDB works.

<div id="toc"></div>

## Usage Overview

There are two distinct ways to use `SHOW TRACE`:

Statement | Usage
----------|------
[`SHOW TRACE FOR <stmt>`](#show-trace-for-statement) | Execute a single [explainable](explain.html) statement and return a trace of its actions.
[`SHOW TRACE FOR SESSION`](#show-trace-for-session) | Return a trace of all executed statements recorded during a session.

### `SHOW TRACE FOR <stmt>`

This use of `SHOW TRACE` executes a single [explainable](explain.html) statement and then returns messages and timing information from all nodes involved in its execution. It's important to note the following:

- `SHOW TRACE FOR <stmt>` executes the target statement and, once execution has completed, then returns a real trace of the actions taken. For example, tracing an `INSERT` statement inserts data and then returns a trace, a `DELETE` statement deletes data and then returns a trace, etc. This is different than the [`EXPLAIN`](explain.html) statement, which does not execute its target statement but instead returns details about its predicted execution plan.
    - The target statement must be an [`explainable`](explain.html) statement. All non-explainable statements are not supported.
    - The target statement is always executed with the local SQL engine. Due to this [known limitation](https://github.com/cockroachdb/cockroach/issues/16562), the trace will not reflect the way in which some statements would have been executed when not the target of `SHOW TRACE FOR <stmt>`. This limitation does not apply to `SHOW TRACE FOR SESSION`.

- If the target statement encounters errors, those errors are not returned to the client. Instead, they are included in the trace. This has the following important implications for [transaction retries](transactions.html#transaction-retries):
    - Normally, individual statements (considered implicit transactions) and multi-statement transactions sent as a single batch are [automatically retried](transactions.html#automatic-retries) by CockroachDB when [retryable errors](transactions.html#error-handling) are encountered due to contention. However, when such statements are the target of `SHOW TRACE FOR <stmt>`, CockroachDB does **not** automatically retry.
    - When each statement in a multi-statement transaction is sent individually (as opposed to being batched), if one of the statements is the target or `SHOW TRACE <stmt>`, retryable errors encountered by that statement will not be returned to the client. This can cause problems if the client is expecting such errors in order to handle [client-side retries](transactions.html#client-side-intervention).

    {{site.data.alerts.callout_success}}Given these implications, when you expect transaction retries or want to trace across retries, it's recommended to use <code>SHOW TRACE FOR SESSION</code>.{{site.data.alerts.end}}

### `SHOW TRACE FOR SESSION`

This use of `SHOW TRACE` returns messages and timing information for all statements executed during a recorded session. It's important to note the following:

- `SHOW TRACE FOR SESSION` only returns traces for the most recent session recorded, or for the current session if it is actively being recorded.
    - To start recording traces for a session, enable the `tracing` [session variable](set-vars.html) via `SET tracing = on;`.
    - To stop recording traces for a session, disable the `tracing` session variable via `SET tracing = off;`.

- In contrast to `SHOW TRACE FOR <stmt>`, errors encountered by statements traced during a recorded session are returned to clients. CockroachDB will [automatically retry](transactions.html#automatic-retries) individual statements (considered implicit transactions) and multi-statement transactions sent as a single batch when [retryable errors](transactions.html#error-handling) are encountered due to contention. Also, clients will receive retryable errors required to handle [client-side retries](transactions.html#client-side-intervention). As a result, traces of all transaction retries will be captured during a recorded session.

- `SHOW TRACE FOR <stmt>` overwrites the last recorded trace. This means that if you enable session recording, disable session recording, execute `SHOW TRACE FOR <stmt>`, and then execute `SHOW TRACE FOR SESSION`, the respone will be the trace for `SHOW TRACE FOR <stmt>`, not for the previously recorded session.

## Required Privileges

For `SHOW TRACE FOR <stmt>`, the user must have the appropriate [privileges](privileges.html) for the statement being traced. For `SHOW TRACE FOR SESSION`, no privileges are required.

## Syntax

{% include sql/{{ page.version.version }}/diagrams/show_trace.html %}

## Parameters

Parameter | Description
----------|------------
`KV` | If specified, the returned messages are restricted to those describing requests to and responses from the underly key-value storage layer.<br><br>For `SHOW KV TRACE FOR <stmt>`, some per-result-row messages may be returned, whereas that's generally not the case when `KV` is not specified.<br><br>For `SHOW KV FOR SESSION`, per-result-row messages are returned only if the session was/is recording with `SET tracing = kv;`.
`explainable_stmt` | The statement to execute and trace. Only [explainable](explain.html) statements are supported.

##
## Trace description

Before describing the specifics of the `SHOW TRACE` results, this section will
philosophize about what exactly CRDB understands by the "trace" of a query. Our
definition is a specialization of
[OpenTracing's](http://opentracing.io/documentation/#what-is-a-trace) concepts
(CRDB internally uses OpenTracing libraries for tracing, which also means that
it can be easily integrated with OpenTracing-compatible trace collectors -
Lightstep and Zipkin are already supported).

A trace is associated with a high-level operation (a query or a transaction) and
provides information about the sub-operations performed. This information is
internally represented as a tree of "spans", with a special "root span". A
"span" represents a named, timed operation that describes a contiguous segment
of work in that trace. Each span links to "child spans", representing
sub-operations (their children would be sub-sub-operations of the grandparent
span, and so on). Different spans can represent (sub-)operations that executed
either sequentially or in parallel with respect to each other (in fact, the
possibly-parallel nature of execution is one of the important things that a
trace is supposed to describe). The operations described by a trace may be
_distributed_ (different spans may describe operations executed by different
CRDB nodes). A span can contain a list of messages - strings with timing
information. In CRDB, these messages are produced by CRDB's logging
infrastructure, so they are the same messages that one can see in CRDB's log
file (TODO: link), except that, usually, the log file only contains messages
logged at a certain "severity level", whereas the trace contains messages across
all levels (and thus a trace is much more verbose than the log file, but only
contains messages produced in the context of one particular traced operation).
In CRDB, the root spans (and, thus, the high-level operations we're concerned
with) represent either a query execution (in the case of `SHOW TRACE FOR
<stmt>`) or a whole SQL transaction (in the case of recorded sessions).

To give some intuition about the concepts we've just discussed, the following
image shows an example trace for one statement. This particular trace is
"rendered" by Lightstep (this kind of visualization is not currently
available in CRDB alone), and so it is only meant as an illustration. The
rendering, as presented, only shows spans; it does not show any messages (they
could be seen, though, by digging into the boxes). You can see names of
operations and sub-operations, along with parent-child relationships and timing
information, and it's clearly visible what executed in parallel with what else.
![Trace example](trace.png)


## Response

{{site.data.alerts.callout_info}}The format of the <code>SHOW TRACE</code> response may change in future versions.{{site.data.alerts.end}}

CRDB does not currently have a graphical trace visualizer (it does, however,
integrate with other products that do). Instead, traces are listed as regular,
linear tabular results. Each result row represents either a span start or a log
messages from a span. Rows are generally listed in their timestamp order (the
order in which the events they represent occurred), except: messages from child
spans are interleaved in the parent span according to their timing. Messages
from sibling spans, however, are not interleaved with respect to one another.
The following diagram shows the order in which messages from different spans will
be interleaved in an example trace. Each box is a span; inner-boxes are child
spans. The numbers indicate the order in which the log messages will appear in
the virtual table.

```
 +-----------------------+
 |           1           |
 | +-------------------+ |
 | |         2         | |
 | |  +----+           | |
 | |  |    | +----+    | |
 | |  | 3  | | 4  |    | |
 | |  |    | |    |  5 | |
 | |  |    | |    | ++ | |
 | |  +----+ |    |    | |
 | |         +----+    | |
 | |          6        | |
 | +-------------------+ |
 |            7          |
 +-----------------------+
```

Rows corresponding to span start events are identified by the `=== SPAN START: <operation> ===` message.

The `SHOW TRACE` statement returns a table with the following columns:

Column | Type                | Description
-------|---------------------|------------
`timestamp` | timestamptz | The absolute time when the message occurred.
`age` | interval | The age of the message relative to the beginning of the trace (i.e. the beginning of the statement execution in case of `SHOW TRACE FOR <stmt` and the beginning of the recording in case of `SHOW TRACE FOR SESSION`.
`message` | string | The log message.
`context` | string | A prefix of the respective log message indicating meta-information about the message's context. This is the same information that appears in the beginning of log file messages in between square brackets (e.g `[client=[::1]:49985,user=root,n1]`).
`operation` | string | The name of the operation (or sub-operation) on whose behalf the message has been logged.
`span` | tuple(int, int) | A tuple containing {index of the transaction that generated the message (always `0` for `SHOW TRACE FOR <stmt>`); index of the span within the virtual list of all spans if they were ordered by the span's start time}

## Examples


Tracing a simple `SELECT`:

```
root@:26257/t> show trace for select * from foo;
+----------------------------------+------------+-------------------------------------------------------+-----------------------------------+-----------------------------------+-------+
|            timestamp             |    age     |                        message                        |              context              |             operation             | span  |
+----------------------------------+------------+-------------------------------------------------------+-----------------------------------+-----------------------------------+-------+
| 2017-10-03 18:43:06.878722+00:00 | 0s         | === SPAN START: sql txn implicit ===                  | NULL                              | sql txn implicit                  | (0,0) |
| 2017-10-03 18:43:06.879117+00:00 | 395µs810ns | === SPAN START: starting plan ===                     | NULL                              | starting plan                     | (0,1) |
| 2017-10-03 18:43:06.879124+00:00 | 402µs807ns | === SPAN START: consuming rows ===                    | NULL                              | consuming rows                    | (0,2) |
| 2017-10-03 18:43:06.879155+00:00 | 433µs27ns  | querying next range at /Table/51/1                    | [client=[::1]:49985,user=root,n1] | sql txn implicit                  | (0,0) |
| 2017-10-03 18:43:06.879183+00:00 | 461µs194ns | r18: sending batch 1 Scan to (n1,s1):1                | [client=[::1]:49985,user=root,n1] | sql txn implicit                  | (0,0) |
| 2017-10-03 18:43:06.879202+00:00 | 480µs687ns | sending request to local server                       | [client=[::1]:49985,user=root,n1] | sql txn implicit                  | (0,0) |
| 2017-10-03 18:43:06.879216+00:00 | 494µs435ns | === SPAN START: /cockroach.roachpb.Internal/Batch === | NULL                              | /cockroach.roachpb.Internal/Batch | (0,3) |
| 2017-10-03 18:43:06.879219+00:00 | 497µs599ns | 1 Scan                                                | [n1]                              | /cockroach.roachpb.Internal/Batch | (0,3) |
| 2017-10-03 18:43:06.879221+00:00 | 499µs782ns | read has no clock uncertainty                         | [n1]                              | /cockroach.roachpb.Internal/Batch | (0,3) |
| 2017-10-03 18:43:06.879226+00:00 | 504µs105ns | executing 1 requests                                  | [n1,s1]                           | /cockroach.roachpb.Internal/Batch | (0,3) |
| 2017-10-03 18:43:06.879233+00:00 | 511µs539ns | read-only path                                        | [n1,s1,r18/1:/{Table/51-Max}]     | /cockroach.roachpb.Internal/Batch | (0,3) |
| 2017-10-03 18:43:06.87924+00:00  | 518µs150ns | command queue                                         | [n1,s1,r18/1:/{Table/51-Max}]     | /cockroach.roachpb.Internal/Batch | (0,3) |
| 2017-10-03 18:43:06.879247+00:00 | 525µs568ns | waiting for read lock                                 | [n1,s1,r18/1:/{Table/51-Max}]     | /cockroach.roachpb.Internal/Batch | (0,3) |
| 2017-10-03 18:43:06.879287+00:00 | 565µs196ns | read completed                                        | [n1,s1,r18/1:/{Table/51-Max}]     | /cockroach.roachpb.Internal/Batch | (0,3) |
| 2017-10-03 18:43:06.879318+00:00 | 596µs812ns | plan completed execution                              | [client=[::1]:49985,user=root,n1] | consuming rows                    | (0,2) |
| 2017-10-03 18:43:06.87932+00:00  | 598µs552ns | resources released, stopping trace                    | [client=[::1]:49985,user=root,n1] | consuming rows                    | (0,2) |
+----------------------------------+------------+-------------------------------------------------------+-----------------------------------+-----------------------------------+-------+
(16 rows)
```

A trace can be filtered using regular SQL statements by using the `[ <statement> ]`
syntax (TODO: link to secion in table-expressions doc). For example, to see only
messages about spans starting, one could do `SELECT * FROM [SHOW TRACE FOR
<stmt>] where message LIKE '=== SPAN START%'`.

## See Also

- [`EXPLAIN`](explain.html)
- [`SET (session settings)`](set-vars.html)
