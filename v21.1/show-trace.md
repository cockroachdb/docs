---
title: SHOW TRACE FOR SESSION
summary: The SHOW TRACE FOR SESSION statement returns details about how CockroachDB executed a statement or series of statements recorded during a session.
toc: true
---

The `SHOW TRACE FOR SESSION` [statement](sql-statements.html) returns details about how CockroachDB executed a statement or series of statements recorded during a session. These details include messages and timing information from all nodes involved in the execution, providing visibility into the actions taken by CockroachDB across all of its software layers.

You can use `SHOW TRACE FOR SESSION` to debug why a query is not performing as expected, to add more information to bug reports, or to generally learn more about how CockroachDB works.

{{site.data.alerts.callout_info}}
Statement traces can be obtained in plaintext, JSON, and [Jaeger-compatible](query-behavior-troubleshooting.html#visualize-statement-traces-in-jaeger) formats by activating [statement diagnostics](ui-statements-page.html#diagnostics) on the DB Console Statements Page or running [`EXPLAIN ANALYZE (DEBUG)`](explain-analyze.html#debug-option).
{{site.data.alerts.end}}

## Usage overview

`SHOW TRACE FOR SESSION` returns messages and timing information for all statements recorded during a session. It's important to note the following:

- `SHOW TRACE FOR SESSION` only returns the most recently recorded traces, or for a currently active recording of traces.
    - To start recording traces during a session, enable the `tracing` session variable via [`SET tracing = on;`](set-vars.html#set-tracing).
    - To stop recording traces during a session, disable the `tracing` session variable via [`SET tracing = off;`](set-vars.html#set-tracing).

- Recording traces during a session does not effect the execution of any statements traced. This means that errors encountered by statements during a recording are returned to clients. CockroachDB will [automatically retry](transactions.html#automatic-retries) individual statements (considered implicit transactions) and multi-statement transactions sent as a single batch when [retry errors](transactions.html#error-handling) are encountered due to contention. Also, clients will receive retry errors required to handle [client-side retries](transactions.html#client-side-intervention). As a result, traces of all transaction retries will be captured during a recording.


## Required privileges

For `SHOW TRACE FOR SESSION`, no privileges are required.

## Syntax

<div>
{% include {{ page.version.version }}/sql/diagrams/show_trace.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`COMPACT` | If specified, fewer columns are returned by the statement. See [Response](#response) for more details.
`KV` | If specified, the returned messages are restricted to those describing requests to and responses from the underlying key-value [storage layer](architecture/storage-layer.html), including per-result-row messages.<br><br>For `SHOW KV TRACE FOR SESSION`, per-result-row messages are included only if the session was/is recording with `SET tracing = kv;`.

## Trace description

CockroachDB's definition of a "trace" is a specialization of [OpenTracing's](http://opentracing.io/documentation/#what-is-a-trace) definition. Internally, CockroachDB uses OpenTracing libraries for tracing, which also means that
it can be easily integrated with OpenTracing-compatible trace collectors; for example, [Jaeger](query-behavior-troubleshooting.html#visualize-statement-traces-in-jaeger), Lightstep, and Zipkin are already supported.

Concept | Description
--------|------------
**trace** | Information about the sub-operations performed as part of a high-level operation (a query or a transaction). This information is internally represented as a tree of "spans", with a special "root span" representing a whole SQL transaction in the case of `SHOW TRACE FOR SESSION`.
**span** | A named, timed operation that describes a contiguous segment of work in a trace. Each span links to "child spans", representing sub-operations; their children would be sub-sub-operations of the grandparent span, etc.<br><br>Different spans can represent (sub-)operations that executed either sequentially or in parallel with respect to each other. (This possibly-parallel nature of execution is one of the important things that a trace is supposed to describe.) The operations described by a trace may be _distributed_, that is, different spans may describe operations executed by different nodes.
**message** | A string with timing information. Each span can contain a list of these. They are produced by CockroachDB's logging infrastructure and are the same messages that can be found in node [log files](debug-and-error-logs.html) except that a trace contains message across all severity levels, whereas log files, by default, do not. Thus, a trace is much more verbose than logs but only contains messages produced in the context of one particular traced operation.

To further clarify these concepts, let's look at a visualization of a trace for one statement. This particular trace is [visualized by Jaeger](query-behavior-troubleshooting.html#visualize-statement-traces-in-jaeger). The image shows spans and log messages. You can see names of operations and sub-operations, along with parent-child relationships and timing information, and it's easy to see which operations are executed in parallel.

<img src="{{ 'images/v21.1/jaeger-trace-log-messages.png' | relative_url }}" alt="Jaeger Trace Log Messages" style="border:1px solid #eee;max-width:100%" />

## Response

{{site.data.alerts.callout_info}}The format of the <code>SHOW TRACE FOR SESSION</code> response may change in future versions.{{site.data.alerts.end}}

CockroachDB outputs traces in linear tabular format. Each result row represents either a span start (identified by the `=== SPAN START: <operation> ===` message) or a log message from a span. Rows are generally listed in their timestamp order (i.e., the order in which the events they represent occurred) with the exception that messages from child spans are interleaved in the parent span according to their timing. Messages from sibling spans, however, are not interleaved with respect to one another.

The following diagram shows the order in which messages from different spans would be interleaved in an example trace. Each box is a span; inner-boxes are child spans. The numbers indicate the order in which the log messages would appear in the virtual table.

~~~
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
~~~

Each row contains the following columns:

Column | Type | Description
-------|------|------------
`timestamp` | timestamptz | The absolute time when the message occurred.
`age` | interval | The age of the message relative to the beginning of the trace (i.e., the beginning of the statement execution in the case of `SHOW TRACE FOR <stmt>` and the beginning of the recording in the case of `SHOW TRACE FOR SESSION`.
`message` | string | The log message.
`tag` | string | Meta-information about the message's context. This is the same information that appears in the beginning of log file messages in between square brackets (e.g, `[client=[::1]:49985,user=root,n1]`).
`location` | string | The file:line location of the line of code that produced the message. Only some of the messages have this field set; it depends on specifically how the message was logged. The `--vmodule` flag passed to the node producing the message also affects what rows get this field populated. Generally, if `--vmodule=<file>=<level>` is specified, messages produced by that file will have the field populated.
`operation` | string | The name of the operation (or sub-operation) on whose behalf the message was logged.
`span` | int | The index of the span within the virtual list of all spans if they were ordered by the span's start time.

{{site.data.alerts.callout_info}}If the <code>COMPACT</code> keyword was specified, only the <code>age</code>, <code>message</code>, <code>tag</code> and <code>operation</code> columns are returned. In addition, the value of the <code>location</code> columns is prepended to <code>message</code>.{{site.data.alerts.end}}

## Examples

### Trace a session

{% include copy-clipboard.html %}
~~~ sql
> SET tracing = on;
~~~

~~~
SET TRACING
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW TRACE FOR SESSION;
~~~

~~~
+----------------------------------+---------------+-------------------------------------------------------+------------------------------------------------+----------+-----------------------------------+------+
|            timestamp             |      age      |                        message                        |                      tag                       | location |             operation             | span |
+----------------------------------+---------------+-------------------------------------------------------+------------------------------------------------+----------+-----------------------------------+------+
| 2018-03-08 21:22:18.266373+00:00 | 0s            | === SPAN START: sql txn ===                           |                                                |          | sql txn                           |    0 |
| 2018-03-08 21:22:18.267341+00:00 | 967µs713ns    | === SPAN START: session recording ===                 |                                                |          | session recording                 |    5 |
| 2018-03-08 21:22:18.267343+00:00 | 969µs760ns    | === SPAN START: starting plan ===                     |                                                |          | starting plan                     |    1 |
| 2018-03-08 21:22:18.267367+00:00 | 993µs551ns    | === SPAN START: consuming rows ===                    |                                                |          | consuming rows                    |    2 |
| 2018-03-08 21:22:18.267384+00:00 | 1ms10µs504ns  | Scan /Table/51/{1-2}                                  | [n1,client=[::1]:58264,user=root]              |          | sql txn                           |    0 |
| 2018-03-08 21:22:18.267434+00:00 | 1ms60µs392ns  | === SPAN START: dist sender ===                       |                                                |          | dist sender                       |    3 |
| 2018-03-08 21:22:18.267444+00:00 | 1ms71µs136ns  | querying next range at /Table/51/1                    | [client=[::1]:58264,user=root,txn=76d25cda,n1] |          | dist sender                       |    3 |
| 2018-03-08 21:22:18.267462+00:00 | 1ms88µs421ns  | r20: sending batch 1 Scan to (n1,s1):1                | [client=[::1]:58264,user=root,txn=76d25cda,n1] |          | dist sender                       |    3 |
| 2018-03-08 21:22:18.267465+00:00 | 1ms91µs570ns  | sending request to local server                       | [client=[::1]:58264,user=root,txn=76d25cda,n1] |          | dist sender                       |    3 |
| 2018-03-08 21:22:18.267467+00:00 | 1ms93µs707ns  | === SPAN START: /cockroach.roachpb.Internal/Batch === |                                                |          | /cockroach.roachpb.Internal/Batch |    4 |
| 2018-03-08 21:22:18.267469+00:00 | 1ms96µs103ns  | 1 Scan                                                | [n1]                                           |          | /cockroach.roachpb.Internal/Batch |    4 |
| 2018-03-08 21:22:18.267471+00:00 | 1ms97µs437ns  | read has no clock uncertainty                         | [n1]                                           |          | /cockroach.roachpb.Internal/Batch |    4 |
| 2018-03-08 21:22:18.267474+00:00 | 1ms101µs60ns  | executing 1 requests                                  | [n1,s1]                                        |          | /cockroach.roachpb.Internal/Batch |    4 |
| 2018-03-08 21:22:18.267479+00:00 | 1ms105µs912ns | read-only path                                        | [n1,s1,r20/1:/Table/5{1-2}]                    |          | /cockroach.roachpb.Internal/Batch |    4 |
| 2018-03-08 21:22:18.267483+00:00 | 1ms110µs94ns  | command queue                                         | [n1,s1,r20/1:/Table/5{1-2}]                    |          | /cockroach.roachpb.Internal/Batch |    4 |
| 2018-03-08 21:22:18.267487+00:00 | 1ms114µs240ns | waiting for read lock                                 | [n1,s1,r20/1:/Table/5{1-2}]                    |          | /cockroach.roachpb.Internal/Batch |    4 |
| 2018-03-08 21:22:18.26752+00:00  | 1ms146µs596ns | read completed                                        | [n1,s1,r20/1:/Table/5{1-2}]                    |          | /cockroach.roachpb.Internal/Batch |    4 |
| 2018-03-08 21:22:18.267566+00:00 | 1ms192µs724ns | plan completed execution                              | [n1,client=[::1]:58264,user=root]              |          | consuming rows                    |    2 |
| 2018-03-08 21:22:18.267568+00:00 | 1ms195µs60ns  | resources released, stopping trace                    | [n1,client=[::1]:58264,user=root]              |          | consuming rows                    |    2 |
+----------------------------------+---------------+-------------------------------------------------------+------------------------------------------------+----------+-----------------------------------+------+
(19 rows)
~~~

### Trace conflicting transactions

In this example, we use two terminals concurrently to generate conflicting transactions.

1. In terminal 1, create a table:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE t (k INT);
    ~~~

2. Still in terminal 1, open a transaction and perform a write without closing the transaction:

    {% include copy-clipboard.html %}
    ~~~ sql
    > BEGIN;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO t VALUES (1);
    ~~~

    Press enter one more time to send these statements to the server.

3. In terminal 2, turn tracing on:

    ~~~
    > SET tracing = on;
    ~~~

4.  Still in terminal 2, execute a conflicting read:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM t;
    ~~~

    You'll see that this statement is blocked until the transaction in terminal 1 finishes.

4. Back in terminal 1, finish the transaction:

    {% include copy-clipboard.html %}
    ~~~ sql
    > COMMIT;
    ~~~

5. In terminal 2, you'll see the completed read:

    ~~~
      k
    +---+
      1
    (1 row)
    ~~~

6. Still in terminal 2, stop tracing and then view the completed trace:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET tracing = off;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW TRACE FOR SESSION;
    ~~~

    ~~~
                 timestamp             |       age       |                                                                                                                        message                                                                                                                         |                        tag                         | location |             operation             | span  
    +----------------------------------+-----------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+----------------------------------------------------+----------+-----------------------------------+------+
      2019-11-11 16:30:15.748466+00:00 | 00:00:00        | === SPAN START: session recording ===                                                                                                                                                                                                                  |                                                    |          | session recording                 |    0  
      2019-11-11 16:30:15.748476+00:00 | 00:00:00.00001  | === SPAN START: sync ===                                                                                                                                                                                                                               |                                                    |          | sync                              |    1  
      2019-11-11 16:30:15.748488+00:00 | 00:00:00.000022 | [NoTxn pos:21] executing Sync                                                                                                                                                                                                                          | [n1,client=127.0.0.1:50611,user=root]              |          | sync                              |    1  
      2019-11-11 16:30:15.748643+00:00 | 00:00:00.000177 | === SPAN START: exec stmt ===                                                                                                                                                                                                                          |                                                    |          | exec stmt                         |    2  
      2019-11-11 16:30:15.748662+00:00 | 00:00:00.000196 | [NoTxn pos:22] executing ExecStmt: SHOW TRANSACTION STATUS                                                                                                                                                                                             | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |    2  
      2019-11-11 16:30:15.748668+00:00 | 00:00:00.000202 | executing: SHOW TRANSACTION STATUS in state: NoTxn                                                                                                                                                                                                     | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |    2  
      2019-11-11 16:30:15.748676+00:00 | 00:00:00.00021  | === SPAN START: sync ===                                                                                                                                                                                                                               |                                                    |          | sync                              |    3  
      2019-11-11 16:30:15.748681+00:00 | 00:00:00.000215 | [NoTxn pos:23] executing Sync                                                                                                                                                                                                                          | [n1,client=127.0.0.1:50611,user=root]              |          | sync                              |    3  
      2019-11-11 16:30:15.748779+00:00 | 00:00:00.000313 | === SPAN START: exec stmt ===                                                                                                                                                                                                                          |                                                    |          | exec stmt                         |    4  
      2019-11-11 16:30:15.748793+00:00 | 00:00:00.000327 | [NoTxn pos:24] executing ExecStmt: SHOW database                                                                                                                                                                                                       | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |    4  
      2019-11-11 16:30:15.748801+00:00 | 00:00:00.000335 | executing: SHOW database in state: NoTxn                                                                                                                                                                                                               | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |    4  
      2019-11-11 16:30:15.74881+00:00  | 00:00:00.000344 | === SPAN START: sql txn ===                                                                                                                                                                                                                            |                                                    |          | sql txn                           |    5  
      2019-11-11 16:30:15.74885+00:00  | 00:00:00.000384 | === SPAN START: exec stmt ===                                                                                                                                                                                                                          |                                                    |          | exec stmt                         |    6  
      2019-11-11 16:30:15.748858+00:00 | 00:00:00.000392 | [Open pos:24] executing ExecStmt: SHOW database                                                                                                                                                                                                        | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |    6  
      2019-11-11 16:30:15.748862+00:00 | 00:00:00.000396 | executing: SHOW database in state: Open                                                                                                                                                                                                                | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |    6  
      2019-11-11 16:30:15.748875+00:00 | 00:00:00.000409 | planning starts: SHOW                                                                                                                                                                                                                                  | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |    6  
      2019-11-11 16:30:15.748877+00:00 | 00:00:00.000411 | generating optimizer plan                                                                                                                                                                                                                              | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |    6  
      2019-11-11 16:30:15.749101+00:00 | 00:00:00.000635 | planning ends                                                                                                                                                                                                                                          | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |    6  
      2019-11-11 16:30:15.749111+00:00 | 00:00:00.000645 | checking distributability                                                                                                                                                                                                                              | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |    6  
      2019-11-11 16:30:15.749117+00:00 | 00:00:00.000651 | query not supported for distSQL: unsupported node *sql.delayedNode                                                                                                                                                                                     | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |    6  
      2019-11-11 16:30:15.749119+00:00 | 00:00:00.000653 | will distribute plan: false                                                                                                                                                                                                                            | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |    6  
      2019-11-11 16:30:15.749121+00:00 | 00:00:00.000655 | execution starts: distributed engine                                                                                                                                                                                                                   | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |    6  
      2019-11-11 16:30:15.749122+00:00 | 00:00:00.000656 | === SPAN START: consuming rows ===                                                                                                                                                                                                                     |                                                    |          | consuming rows                    |    7  
      2019-11-11 16:30:15.74913+00:00  | 00:00:00.000664 | creating DistSQL plan with isLocal=true                                                                                                                                                                                                                | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |    6  
      2019-11-11 16:30:15.74916+00:00  | 00:00:00.000694 | running DistSQL plan                                                                                                                                                                                                                                   | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |    6  
      2019-11-11 16:30:15.749168+00:00 | 00:00:00.000702 | === SPAN START: flow ===                                                                                                                                                                                                                               |                                                    |          | flow                              |    8  
      2019-11-11 16:30:15.749187+00:00 | 00:00:00.000721 | starting (0 processors, 0 startables)                                                                                                                                                                                                                  | [n1,client=127.0.0.1:50611,user=root]              |          | flow                              |    8  
      2019-11-11 16:30:15.749289+00:00 | 00:00:00.000823 | execution ends                                                                                                                                                                                                                                         | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |    6  
      2019-11-11 16:30:15.74929+00:00  | 00:00:00.000824 | rows affected: 1                                                                                                                                                                                                                                       | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |    6  
      2019-11-11 16:30:15.749312+00:00 | 00:00:00.000846 | AutoCommit. err: <nil>                                                                                                                                                                                                                                 | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |    6  
      2019-11-11 16:30:15.749335+00:00 | 00:00:00.000869 | === SPAN START: sync ===                                                                                                                                                                                                                               |                                                    |          | sync                              |    9  
      2019-11-11 16:30:15.749342+00:00 | 00:00:00.000876 | [NoTxn pos:25] executing Sync                                                                                                                                                                                                                          | [n1,client=127.0.0.1:50611,user=root]              |          | sync                              |    9  
      2019-11-11 16:30:20.069895+00:00 | 00:00:04.321429 | === SPAN START: exec stmt ===                                                                                                                                                                                                                          |                                                    |          | exec stmt                         |   10  
      2019-11-11 16:30:20.069923+00:00 | 00:00:04.321457 | [NoTxn pos:26] executing ExecStmt: SHOW SYNTAX 'select * from t;'                                                                                                                                                                                      | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   10  
      2019-11-11 16:30:20.069932+00:00 | 00:00:04.321466 | executing: SHOW SYNTAX 'select * from t;' in state: NoTxn                                                                                                                                                                                              | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   10  
      2019-11-11 16:30:20.070003+00:00 | 00:00:04.321537 | === SPAN START: sync ===                                                                                                                                                                                                                               |                                                    |          | sync                              |   11  
      2019-11-11 16:30:20.07001+00:00  | 00:00:04.321544 | [NoTxn pos:27] executing Sync                                                                                                                                                                                                                          | [n1,client=127.0.0.1:50611,user=root]              |          | sync                              |   11  
      2019-11-11 16:30:20.070142+00:00 | 00:00:04.321676 | === SPAN START: exec stmt ===                                                                                                                                                                                                                          |                                                    |          | exec stmt                         |   12  
      2019-11-11 16:30:20.070156+00:00 | 00:00:04.32169  | [NoTxn pos:28] executing ExecStmt: SELECT * FROM t                                                                                                                                                                                                     | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   12  
      2019-11-11 16:30:20.07016+00:00  | 00:00:04.321694 | executing: SELECT * FROM t in state: NoTxn                                                                                                                                                                                                             | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   12  
      2019-11-11 16:30:20.07017+00:00  | 00:00:04.321704 | === SPAN START: sql txn ===                                                                                                                                                                                                                            |                                                    |          | sql txn                           |   13  
      2019-11-11 16:30:20.070186+00:00 | 00:00:04.32172  | === SPAN START: exec stmt ===                                                                                                                                                                                                                          |                                                    |          | exec stmt                         |   14  
      2019-11-11 16:30:20.070191+00:00 | 00:00:04.321725 | [Open pos:28] executing ExecStmt: SELECT * FROM t                                                                                                                                                                                                      | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   14  
      2019-11-11 16:30:20.070201+00:00 | 00:00:04.321735 | executing: SELECT * FROM t in state: Open                                                                                                                                                                                                              | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   14  
      2019-11-11 16:30:20.070216+00:00 | 00:00:04.32175  | planning starts: SELECT                                                                                                                                                                                                                                | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   14  
      2019-11-11 16:30:20.070222+00:00 | 00:00:04.321756 | generating optimizer plan                                                                                                                                                                                                                              | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   14  
      2019-11-11 16:30:20.070248+00:00 | 00:00:04.321782 | added table 'test.public.t' to table collection                                                                                                                                                                                                        | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   14  
      2019-11-11 16:30:20.070276+00:00 | 00:00:04.32181  | found table in table collection for table 'test.public.t'                                                                                                                                                                                              | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   14  
      2019-11-11 16:30:20.070318+00:00 | 00:00:04.321852 | query cache hit but needed update                                                                                                                                                                                                                      | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   14  
      2019-11-11 16:30:20.070339+00:00 | 00:00:04.321873 | planning ends                                                                                                                                                                                                                                          | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   14  
      2019-11-11 16:30:20.070342+00:00 | 00:00:04.321876 | checking distributability                                                                                                                                                                                                                              | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   14  
      2019-11-11 16:30:20.070351+00:00 | 00:00:04.321885 | will distribute plan: true                                                                                                                                                                                                                             | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   14  
      2019-11-11 16:30:20.070356+00:00 | 00:00:04.32189  | execution starts: distributed engine                                                                                                                                                                                                                   | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   14  
      2019-11-11 16:30:20.070357+00:00 | 00:00:04.321891 | === SPAN START: consuming rows ===                                                                                                                                                                                                                     |                                                    |          | consuming rows                    |   15  
      2019-11-11 16:30:20.070375+00:00 | 00:00:04.321909 | creating DistSQL plan with isLocal=false                                                                                                                                                                                                               | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   14  
      2019-11-11 16:30:20.070399+00:00 | 00:00:04.321933 | querying next range at /Table/61/1                                                                                                                                                                                                                     | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   14  
      2019-11-11 16:30:20.070432+00:00 | 00:00:04.321966 | running DistSQL plan                                                                                                                                                                                                                                   | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   14  
      2019-11-11 16:30:20.070435+00:00 | 00:00:04.321969 | === SPAN START: flow ===                                                                                                                                                                                                                               |                                                    |          | flow                              |   16  
      2019-11-11 16:30:20.070475+00:00 | 00:00:04.322009 | starting (0 processors, 0 startables)                                                                                                                                                                                                                  | [n1,client=127.0.0.1:50611,user=root]              |          | flow                              |   16  
      2019-11-11 16:30:20.070477+00:00 | 00:00:04.322011 | === SPAN START: table reader ===                                                                                                                                                                                                                       |                                                    |          | table reader                      |   29  
                                       |                 | cockroach.processorid: 0                                                                                                                                                                                                                               |                                                    |          |                                   |       
                                       |                 | cockroach.stat.tablereader.bytes.read: 37 B                                                                                                                                                                                                            |                                                    |          |                                   |       
                                       |                 | cockroach.stat.tablereader.input.rows: 1                                                                                                                                                                                                               |                                                    |          |                                   |       
                                       |                 | cockroach.stat.tablereader.stalltime: 5.237165s                                                                                                                                                                                                        |                                                    |          |                                   |       
      2019-11-11 16:30:20.07048+00:00  | 00:00:04.322014 | starting scan with limitBatches true                                                                                                                                                                                                                   | [n1,client=127.0.0.1:50611,user=root]              |          | table reader                      |   29  
      2019-11-11 16:30:20.070491+00:00 | 00:00:04.322025 | Scan /Table/61/{1-2}                                                                                                                                                                                                                                   | [n1,client=127.0.0.1:50611,user=root]              |          | table reader                      |   29  
      2019-11-11 16:30:20.070494+00:00 | 00:00:04.322028 | === SPAN START: txn coordinator send ===                                                                                                                                                                                                               |                                                    |          | txn coordinator send              |   30  
      2019-11-11 16:30:20.070502+00:00 | 00:00:04.322036 | === SPAN START: dist sender send ===                                                                                                                                                                                                                   |                                                    |          | dist sender send                  |   31  
      2019-11-11 16:30:20.070509+00:00 | 00:00:04.322043 | querying next range at /Table/61/1                                                                                                                                                                                                                     | [n1,client=127.0.0.1:50611,user=root,txn=9dfb9bb2] |          | dist sender send                  |   31  
      2019-11-11 16:30:20.070528+00:00 | 00:00:04.322062 | r44: sending batch 1 Scan to (n1,s1):1                                                                                                                                                                                                                 | [n1,client=127.0.0.1:50611,user=root,txn=9dfb9bb2] |          | dist sender send                  |   31  
      2019-11-11 16:30:20.070532+00:00 | 00:00:04.322066 | sending request to local client                                                                                                                                                                                                                        | [n1,client=127.0.0.1:50611,user=root,txn=9dfb9bb2] |          | dist sender send                  |   31  
      2019-11-11 16:30:20.070535+00:00 | 00:00:04.322069 | === SPAN START: /cockroach.roachpb.Internal/Batch ===                                                                                                                                                                                                  |                                                    |          | /cockroach.roachpb.Internal/Batch |   32  
      2019-11-11 16:30:20.070537+00:00 | 00:00:04.322071 | 1 Scan                                                                                                                                                                                                                                                 | [n1]                                               |          | /cockroach.roachpb.Internal/Batch |   32  
      2019-11-11 16:30:20.070547+00:00 | 00:00:04.322081 | executing 1 requests                                                                                                                                                                                                                                   | [n1,s1]                                            |          | /cockroach.roachpb.Internal/Batch |   32  
      2019-11-11 16:30:20.070555+00:00 | 00:00:04.322089 | read-only path                                                                                                                                                                                                                                         | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   32  
      2019-11-11 16:30:20.070559+00:00 | 00:00:04.322093 | read has no clock uncertainty                                                                                                                                                                                                                          | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   32  
      2019-11-11 16:30:20.070566+00:00 | 00:00:04.3221   | acquire latches                                                                                                                                                                                                                                        | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   32  
      2019-11-11 16:30:20.070573+00:00 | 00:00:04.322107 | waited 4µs to acquire latches                                                                                                                                                                                                                          | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   32  
      2019-11-11 16:30:20.070575+00:00 | 00:00:04.322109 | waiting for read lock                                                                                                                                                                                                                                  | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   32  
      2019-11-11 16:30:20.070726+00:00 | 00:00:04.32226  | conflicting intents on /Table/61/1/502724716918734849/0                                                                                                                                                                                                | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   32  
      2019-11-11 16:30:20.070734+00:00 | 00:00:04.322268 | replica.Send got error: conflicting intents on /Table/61/1/502724716918734849/0                                                                                                                                                                        | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   32  
      2019-11-11 16:30:20.070746+00:00 | 00:00:04.32228  | adding 9dfb9bb2 to contention queue on intent /Table/61/1/502724716918734849/0 @7e266164                                                                                                                                                               | [n1,s1]                                            |          | /cockroach.roachpb.Internal/Batch |   32  
      2019-11-11 16:30:20.070758+00:00 | 00:00:04.322292 | pushing 1 transaction(s)                                                                                                                                                                                                                               | [n1,s1]                                            |          | /cockroach.roachpb.Internal/Batch |   32  
      2019-11-11 16:30:20.070762+00:00 | 00:00:04.322296 | === SPAN START: dist sender send ===                                                                                                                                                                                                                   |                                                    |          | dist sender send                  |   33  
      2019-11-11 16:30:20.070768+00:00 | 00:00:04.322302 | querying next range at /Table/61/1/502724716918734849/0                                                                                                                                                                                                | [n1,s1]                                            |          | dist sender send                  |   33  
      2019-11-11 16:30:20.070778+00:00 | 00:00:04.322312 | r44: sending batch 1 PushTxn to (n1,s1):1                                                                                                                                                                                                              | [n1,s1]                                            |          | dist sender send                  |   33  
      2019-11-11 16:30:20.07078+00:00  | 00:00:04.322314 | sending request to local client                                                                                                                                                                                                                        | [n1,s1]                                            |          | dist sender send                  |   33  
      2019-11-11 16:30:20.070781+00:00 | 00:00:04.322315 | === SPAN START: /cockroach.roachpb.Internal/Batch ===                                                                                                                                                                                                  |                                                    |          | /cockroach.roachpb.Internal/Batch |   34  
      2019-11-11 16:30:20.070787+00:00 | 00:00:04.322321 | 1 PushTxn                                                                                                                                                                                                                                              | [n1]                                               |          | /cockroach.roachpb.Internal/Batch |   34  
      2019-11-11 16:30:20.070795+00:00 | 00:00:04.322329 | executing 1 requests                                                                                                                                                                                                                                   | [n1,s1]                                            |          | /cockroach.roachpb.Internal/Batch |   34  
      2019-11-11 16:30:20.070801+00:00 | 00:00:04.322335 | read-write path                                                                                                                                                                                                                                        | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   34  
      2019-11-11 16:30:20.070809+00:00 | 00:00:04.322343 | acquire latches                                                                                                                                                                                                                                        | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   34  
      2019-11-11 16:30:20.070816+00:00 | 00:00:04.32235  | waited 4µs to acquire latches                                                                                                                                                                                                                          | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   34  
      2019-11-11 16:30:20.07082+00:00  | 00:00:04.322354 | applied timestamp cache                                                                                                                                                                                                                                | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   34  
      2019-11-11 16:30:20.0709+00:00   | 00:00:04.322434 | evaluated request                                                                                                                                                                                                                                      | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   34  
      2019-11-11 16:30:20.070916+00:00 | 00:00:04.32245  | replica.Send got error: failed to push id=7e266164 key=/Table/61/1/502724716918734849/0 rw=true pri=0.01542089 stat=PENDING epo=0 ts=1573489808.235912000,0 orig=0.000000000,0 min=1573489808.235912000,0 max=0.000000000,0 wto=false seq=1            | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   34  
      2019-11-11 16:30:20.070925+00:00 | 00:00:04.322459 | 9dfb9bb2 pushing 7e266164 (1 pending)                                                                                                                                                                                                                  | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   34  
      2019-11-11 16:30:20.07096+00:00  | 00:00:04.322494 | querying pushee                                                                                                                                                                                                                                        | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   34  
      2019-11-11 16:30:20.070964+00:00 | 00:00:04.322498 | === SPAN START: dist sender send ===                                                                                                                                                                                                                   |                                                    |          | dist sender send                  |   35  
      2019-11-11 16:30:20.070976+00:00 | 00:00:04.32251  | querying next range at /Table/61/1/502724716918734849/0                                                                                                                                                                                                | [n1,s1,r44/1:/{Table/61-Max}]                      |          | dist sender send                  |   35  
      2019-11-11 16:30:20.070988+00:00 | 00:00:04.322522 | r44: sending batch 1 QueryTxn to (n1,s1):1                                                                                                                                                                                                             | [n1,s1,r44/1:/{Table/61-Max}]                      |          | dist sender send                  |   35  
      2019-11-11 16:30:20.07099+00:00  | 00:00:04.322524 | sending request to local client                                                                                                                                                                                                                        | [n1,s1,r44/1:/{Table/61-Max}]                      |          | dist sender send                  |   35  
      2019-11-11 16:30:20.070992+00:00 | 00:00:04.322526 | === SPAN START: /cockroach.roachpb.Internal/Batch ===                                                                                                                                                                                                  |                                                    |          | /cockroach.roachpb.Internal/Batch |   36  
      2019-11-11 16:30:20.071+00:00    | 00:00:04.322534 | 1 QueryTxn                                                                                                                                                                                                                                             | [n1]                                               |          | /cockroach.roachpb.Internal/Batch |   36  
      2019-11-11 16:30:20.071003+00:00 | 00:00:04.322537 | executing 1 requests                                                                                                                                                                                                                                   | [n1,s1]                                            |          | /cockroach.roachpb.Internal/Batch |   36  
      2019-11-11 16:30:20.071006+00:00 | 00:00:04.32254  | read-only path                                                                                                                                                                                                                                         | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   36  
      2019-11-11 16:30:20.071011+00:00 | 00:00:04.322545 | acquire latches                                                                                                                                                                                                                                        | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   36  
      2019-11-11 16:30:20.071016+00:00 | 00:00:04.32255  | waited 2µs to acquire latches                                                                                                                                                                                                                          | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   36  
      2019-11-11 16:30:20.071018+00:00 | 00:00:04.322552 | waiting for read lock                                                                                                                                                                                                                                  | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   36  
      2019-11-11 16:30:20.071055+00:00 | 00:00:04.322589 | read completed                                                                                                                                                                                                                                         | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   36  
      2019-11-11 16:30:24.246186+00:00 | 00:00:08.49772  | querying pushee                                                                                                                                                                                                                                        | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   34  
      2019-11-11 16:30:24.246222+00:00 | 00:00:08.497756 | === SPAN START: dist sender send ===                                                                                                                                                                                                                   |                                                    |          | dist sender send                  |   37  
      2019-11-11 16:30:24.246283+00:00 | 00:00:08.497817 | querying next range at /Table/61/1/502724716918734849/0                                                                                                                                                                                                | [n1,s1,r44/1:/{Table/61-Max}]                      |          | dist sender send                  |   37  
      2019-11-11 16:30:24.246373+00:00 | 00:00:08.497907 | r44: sending batch 1 QueryTxn to (n1,s1):1                                                                                                                                                                                                             | [n1,s1,r44/1:/{Table/61-Max}]                      |          | dist sender send                  |   37  
      2019-11-11 16:30:24.24638+00:00  | 00:00:08.497914 | sending request to local client                                                                                                                                                                                                                        | [n1,s1,r44/1:/{Table/61-Max}]                      |          | dist sender send                  |   37  
      2019-11-11 16:30:24.246387+00:00 | 00:00:08.497921 | === SPAN START: /cockroach.roachpb.Internal/Batch ===                                                                                                                                                                                                  |                                                    |          | /cockroach.roachpb.Internal/Batch |   38  
      2019-11-11 16:30:24.246395+00:00 | 00:00:08.497929 | 1 QueryTxn                                                                                                                                                                                                                                             | [n1]                                               |          | /cockroach.roachpb.Internal/Batch |   38  
      2019-11-11 16:30:24.246415+00:00 | 00:00:08.497949 | executing 1 requests                                                                                                                                                                                                                                   | [n1,s1]                                            |          | /cockroach.roachpb.Internal/Batch |   38  
      2019-11-11 16:30:24.246427+00:00 | 00:00:08.497961 | read-only path                                                                                                                                                                                                                                         | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   38  
      2019-11-11 16:30:24.246449+00:00 | 00:00:08.497983 | acquire latches                                                                                                                                                                                                                                        | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   38  
      2019-11-11 16:30:24.246463+00:00 | 00:00:08.497997 | waited 6µs to acquire latches                                                                                                                                                                                                                          | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   38  
      2019-11-11 16:30:24.24647+00:00  | 00:00:08.498004 | waiting for read lock                                                                                                                                                                                                                                  | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   38  
      2019-11-11 16:30:24.246579+00:00 | 00:00:08.498113 | read completed                                                                                                                                                                                                                                         | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   38  
      2019-11-11 16:30:25.301366+00:00 | 00:00:09.5529   | result of pending push: id=7e266164 key=/Table/61/1/502724716918734849/0 rw=true pri=0.01542089 stat=COMMITTED epo=0 ts=1573489808.235912000,0 orig=1573489808.235912000,0 min=1573489808.235912000,0 max=1573489808.235912000,0 wto=false seq=2 ifw=1 | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   34  
      2019-11-11 16:30:25.301369+00:00 | 00:00:09.552903 | push request is satisfied                                                                                                                                                                                                                              | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   34  
      2019-11-11 16:30:25.301407+00:00 | 00:00:09.552941 | 7e266164-f676-48ba-aebe-3ac5d323117e is now COMMITTED                                                                                                                                                                                                  | [n1,s1]                                            |          | /cockroach.roachpb.Internal/Batch |   32  
      2019-11-11 16:30:25.301413+00:00 | 00:00:09.552947 | resolving intents [wait=false]                                                                                                                                                                                                                         | [n1,s1]                                            |          | /cockroach.roachpb.Internal/Batch |   32  
      2019-11-11 16:30:25.307527+00:00 | 00:00:09.559061 | read-only path                                                                                                                                                                                                                                         | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   32  
      2019-11-11 16:30:25.307533+00:00 | 00:00:09.559067 | read has no clock uncertainty                                                                                                                                                                                                                          | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   32  
      2019-11-11 16:30:25.307548+00:00 | 00:00:09.559082 | acquire latches                                                                                                                                                                                                                                        | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   32  
      2019-11-11 16:30:25.307555+00:00 | 00:00:09.559089 | waited 3µs to acquire latches                                                                                                                                                                                                                          | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   32  
      2019-11-11 16:30:25.307557+00:00 | 00:00:09.559091 | waiting for read lock                                                                                                                                                                                                                                  | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   32  
      2019-11-11 16:30:25.307586+00:00 | 00:00:09.55912  | read completed                                                                                                                                                                                                                                         | [n1,s1,r44/1:/{Table/61-Max}]                      |          | /cockroach.roachpb.Internal/Batch |   32  
      2019-11-11 16:30:25.307611+00:00 | 00:00:09.559145 | 9dfb9bb2 finished, leaving intent? false (owned by <nil>)                                                                                                                                                                                              | [n1,s1]                                            |          | /cockroach.roachpb.Internal/Batch |   32  
      2019-11-11 16:30:25.307773+00:00 | 00:00:09.559307 | execution ends                                                                                                                                                                                                                                         | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   14  
      2019-11-11 16:30:25.307775+00:00 | 00:00:09.559309 | rows affected: 1                                                                                                                                                                                                                                       | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   14  
      2019-11-11 16:30:25.3078+00:00   | 00:00:09.559334 | AutoCommit. err: <nil>                                                                                                                                                                                                                                 | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   14  
      2019-11-11 16:30:25.307833+00:00 | 00:00:09.559367 | releasing 1 tables                                                                                                                                                                                                                                     | [n1,client=127.0.0.1:50611,user=root]              |          | session recording                 |    0  
      2019-11-11 16:30:25.307842+00:00 | 00:00:09.559376 | === SPAN START: sync ===                                                                                                                                                                                                                               |                                                    |          | sync                              |   17  
      2019-11-11 16:30:25.307849+00:00 | 00:00:09.559383 | [NoTxn pos:29] executing Sync                                                                                                                                                                                                                          | [n1,client=127.0.0.1:50611,user=root]              |          | sync                              |   17  
      2019-11-11 16:30:25.308119+00:00 | 00:00:09.559653 | === SPAN START: exec stmt ===                                                                                                                                                                                                                          |                                                    |          | exec stmt                         |   18  
      2019-11-11 16:30:25.308132+00:00 | 00:00:09.559666 | [NoTxn pos:30] executing ExecStmt: SHOW TRANSACTION STATUS                                                                                                                                                                                             | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   18  
      2019-11-11 16:30:25.308137+00:00 | 00:00:09.559671 | executing: SHOW TRANSACTION STATUS in state: NoTxn                                                                                                                                                                                                     | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   18  
      2019-11-11 16:30:25.308145+00:00 | 00:00:09.559679 | === SPAN START: sync ===                                                                                                                                                                                                                               |                                                    |          | sync                              |   19  
      2019-11-11 16:30:25.30815+00:00  | 00:00:09.559684 | [NoTxn pos:31] executing Sync                                                                                                                                                                                                                          | [n1,client=127.0.0.1:50611,user=root]              |          | sync                              |   19  
      2019-11-11 16:30:25.308254+00:00 | 00:00:09.559788 | === SPAN START: exec stmt ===                                                                                                                                                                                                                          |                                                    |          | exec stmt                         |   20  
      2019-11-11 16:30:25.30827+00:00  | 00:00:09.559804 | [NoTxn pos:32] executing ExecStmt: SHOW database                                                                                                                                                                                                       | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   20  
      2019-11-11 16:30:25.308278+00:00 | 00:00:09.559812 | executing: SHOW database in state: NoTxn                                                                                                                                                                                                               | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   20  
      2019-11-11 16:30:25.308287+00:00 | 00:00:09.559821 | === SPAN START: sql txn ===                                                                                                                                                                                                                            |                                                    |          | sql txn                           |   21  
      2019-11-11 16:30:25.308302+00:00 | 00:00:09.559836 | === SPAN START: exec stmt ===                                                                                                                                                                                                                          |                                                    |          | exec stmt                         |   22  
      2019-11-11 16:30:25.308307+00:00 | 00:00:09.559841 | [Open pos:32] executing ExecStmt: SHOW database                                                                                                                                                                                                        | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   22  
      2019-11-11 16:30:25.30831+00:00  | 00:00:09.559844 | executing: SHOW database in state: Open                                                                                                                                                                                                                | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   22  
      2019-11-11 16:30:25.308316+00:00 | 00:00:09.55985  | planning starts: SHOW                                                                                                                                                                                                                                  | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   22  
      2019-11-11 16:30:25.308318+00:00 | 00:00:09.559852 | generating optimizer plan                                                                                                                                                                                                                              | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   22  
      2019-11-11 16:30:25.308485+00:00 | 00:00:09.560019 | planning ends                                                                                                                                                                                                                                          | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   22  
      2019-11-11 16:30:25.308495+00:00 | 00:00:09.560029 | checking distributability                                                                                                                                                                                                                              | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   22  
      2019-11-11 16:30:25.308501+00:00 | 00:00:09.560035 | query not supported for distSQL: unsupported node *sql.delayedNode                                                                                                                                                                                     | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   22  
      2019-11-11 16:30:25.308502+00:00 | 00:00:09.560036 | will distribute plan: false                                                                                                                                                                                                                            | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   22  
      2019-11-11 16:30:25.308504+00:00 | 00:00:09.560038 | execution starts: distributed engine                                                                                                                                                                                                                   | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   22  
      2019-11-11 16:30:25.308508+00:00 | 00:00:09.560042 | === SPAN START: consuming rows ===                                                                                                                                                                                                                     |                                                    |          | consuming rows                    |   23  
      2019-11-11 16:30:25.308519+00:00 | 00:00:09.560053 | creating DistSQL plan with isLocal=true                                                                                                                                                                                                                | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   22  
      2019-11-11 16:30:25.308542+00:00 | 00:00:09.560076 | running DistSQL plan                                                                                                                                                                                                                                   | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   22  
      2019-11-11 16:30:25.308545+00:00 | 00:00:09.560079 | === SPAN START: flow ===                                                                                                                                                                                                                               |                                                    |          | flow                              |   24  
      2019-11-11 16:30:25.308566+00:00 | 00:00:09.5601   | starting (0 processors, 0 startables)                                                                                                                                                                                                                  | [n1,client=127.0.0.1:50611,user=root]              |          | flow                              |   24  
      2019-11-11 16:30:25.308661+00:00 | 00:00:09.560195 | execution ends                                                                                                                                                                                                                                         | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   22  
      2019-11-11 16:30:25.308663+00:00 | 00:00:09.560197 | rows affected: 1                                                                                                                                                                                                                                       | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   22  
      2019-11-11 16:30:25.308672+00:00 | 00:00:09.560206 | AutoCommit. err: <nil>                                                                                                                                                                                                                                 | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   22  
      2019-11-11 16:30:25.308682+00:00 | 00:00:09.560216 | === SPAN START: sync ===                                                                                                                                                                                                                               |                                                    |          | sync                              |   25  
      2019-11-11 16:30:25.308686+00:00 | 00:00:09.56022  | [NoTxn pos:33] executing Sync                                                                                                                                                                                                                          | [n1,client=127.0.0.1:50611,user=root]              |          | sync                              |   25  
      2019-11-11 16:30:37.342087+00:00 | 00:00:21.593621 | === SPAN START: exec stmt ===                                                                                                                                                                                                                          |                                                    |          | exec stmt                         |   26  
      2019-11-11 16:30:37.342141+00:00 | 00:00:21.593675 | [NoTxn pos:34] executing ExecStmt: SHOW SYNTAX 'set tracing = off;'                                                                                                                                                                                    | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   26  
      2019-11-11 16:30:37.342157+00:00 | 00:00:21.593691 | executing: SHOW SYNTAX 'set tracing = off;' in state: NoTxn                                                                                                                                                                                            | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   26  
      2019-11-11 16:30:37.342227+00:00 | 00:00:21.593761 | === SPAN START: sync ===                                                                                                                                                                                                                               |                                                    |          | sync                              |   27  
      2019-11-11 16:30:37.342236+00:00 | 00:00:21.59377  | [NoTxn pos:35] executing Sync                                                                                                                                                                                                                          | [n1,client=127.0.0.1:50611,user=root]              |          | sync                              |   27  
      2019-11-11 16:30:37.342383+00:00 | 00:00:21.593917 | === SPAN START: exec stmt ===                                                                                                                                                                                                                          |                                                    |          | exec stmt                         |   28  
      2019-11-11 16:30:37.342393+00:00 | 00:00:21.593927 | [NoTxn pos:36] executing ExecStmt: SET TRACING = off                                                                                                                                                                                                   | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   28  
      2019-11-11 16:30:37.342398+00:00 | 00:00:21.593932 | executing: SET TRACING = off in state: NoTxn                                                                                                                                                                                                           | [n1,client=127.0.0.1:50611,user=root]              |          | exec stmt                         |   28  
    (173 rows)
    ~~~

### Trace a transaction retry

In this example, we use session tracing to show an [automatic transaction retry](transactions.html#automatic-retries). Like in the previous example, we'll have to use two terminals because retries are induced by unfortunate interactions between transactions.

1. In terminal 1, turn on trace recording and then start a transaction:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET tracing = on;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > BEGIN;
    ~~~

    Starting a transaction gets us an early timestamp, i.e., we "lock" the snapshot of the data on which the transaction is going to operate.

2. In terminal 2, perform a read:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM t;
    ~~~

    This read is performed at a timestamp higher than the timestamp of the transaction running in terminal 1. Because we're running at the [`SERIALIZABLE` transaction isolation level](architecture/transaction-layer.html#isolation-levels), if the system allows terminal 1's transaction to commit, it will have to ensure that ordering terminal 1's transaction *before* terminal 2's transaction is valid; this will become relevant in a second.

3. Back in terminal 1, execute and trace a conflicting write:

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO t VALUES (1);
    ~~~

    At this point, the system will detect the conflict and realize that the transaction can no longer commit because allowing it to commit would mean that we have changed history with respect to terminal 2's read. As a result, it will automatically retry the transaction so it can be serialized *after* terminal 2's transaction. The trace will reflect this retry.

4. Turn off trace recording and request the trace:

    {% include copy-clipboard.html %}
  	~~~ sql
  	> SET tracing = off;
  	~~~

    {% include copy-clipboard.html %}
  	~~~ sql
  	> SELECT age, message FROM [SHOW TRACE FOR SESSION];
  	~~~

    {{site.data.alerts.callout_success}}Check the lines starting with <code>#Annotation</code> for insights into how the retry is traced.{{site.data.alerts.end}}

  	~~~ shell
  	+--------------------+---------------------------------------------------------------------------------------------------------------+
  	|        age         |        message                                                                                                |
  	+--------------------+---------------------------------------------------------------------------------------------------------------+
  	| 0s                 | === SPAN START: sql txn implicit ===                                                                          |
  	| 123µs317ns         | AutoCommit. err: <nil>                                                                                        |
  	|                    | txn: "sql txn implicit" id=64d34fbc key=/Min rw=false pri=0.02500536 iso=SERIALIZABLE stat=COMMITTED ...      |
  	| 1s767ms959µs448ns  | === SPAN START: sql txn ===                                                                                   |
  	| 1s767ms989µs448ns  | executing 1/1: BEGIN TRANSACTION                                                                              |
  	| # Annotation: First execution of INSERT.                                                                                           |
  	| 13s536ms79µs67ns   | executing 1/1: INSERT INTO t VALUES (1)                                                                       |
  	| 13s536ms134µs682ns | client.Txn did AutoCommit. err: <nil>                                                                         |
  	|                    | txn: "unnamed" id=329e7307 key=/Min rw=false pri=0.01354772 iso=SERIALIZABLE stat=COMMITTED epo=0 ...         |
  	| 13s536ms143µs145ns | added table 't' to table collection                                                                           |
  	| 13s536ms305µs103ns | query not supported for distSQL: mutations not supported                                                      |
  	| 13s536ms365µs919ns | querying next range at /Table/61/1/285904591228600321/0                                                       |
  	| 13s536ms400µs155ns | r42: sending batch 1 CPut, 1 BeginTxn to (n1,s1):1                                                            |
  	| 13s536ms422µs268ns | sending request to local server                                                                               |
  	| 13s536ms434µs962ns | === SPAN START: /cockroach.roachpb.Internal/Batch ===                                                         |
  	| 13s536ms439µs916ns | 1 CPut, 1 BeginTxn                                                                                            |
  	| 13s536ms442µs413ns | read has no clock uncertainty                                                                                 |
  	| 13s536ms447µs42ns  | executing 2 requests                                                                                          |
  	| 13s536ms454µs413ns | read-write path                                                                                               |
  	| 13s536ms462µs456ns | command queue                                                                                                 |
  	| 13s536ms497µs475ns | applied timestamp cache                                                                                       |
  	| 13s536ms637µs637ns | evaluated request                                                                                             |
  	| 13s536ms646µs468ns | acquired {raft,replica}mu                                                                                     |
  	| 13s536ms947µs970ns | applying command                                                                                              |
  	| 13s537ms34µs667ns  | coordinator spawns                                                                                            |
  	| 13s537ms41µs171ns  | === SPAN START: [async] kv.TxnCoordSender: heartbeat loop ===                                                 |
  	| # Annotation: The conflict is about to be detected in the form of a retriable error.                                               |
  	| 13s537ms77µs356ns  | automatically retrying transaction: sql txn (id: b4bd1f60-30d9-4465-bdb6-6b553aa42a96) because of error:      |
  	|                      HandledRetryableTxnError: serializable transaction timestamp pushed (detected by SQL Executor)                |
  	| # Annotation: Second execution of INSERT.                                                                                          |
  	| 13s537ms83µs369ns  | executing 1/1: INSERT INTO t VALUES (1)                                                                       |
  	| 13s537ms109µs516ns | client.Txn did AutoCommit. err: <nil>                                                                         |
  	|                    | txn: "unnamed" id=1228171b key=/Min rw=false pri=0.02917782 iso=SERIALIZABLE stat=COMMITTED epo=0             |
  	|                      ts=1507321556.991937203,0 orig=1507321556.991937203,0 max=1507321557.491937203,0 wto=false rop=false          |
  	| 13s537ms111µs738ns | releasing 1 tables                                                                                            |
  	| 13s537ms116µs944ns | added table 't' to table collection                                                                           |
  	| 13s537ms163µs155ns | query not supported for distSQL: writing txn                                                                  |
  	| 13s537ms192µs584ns | querying next range at /Table/61/1/285904591231418369/0                                                       |
  	| 13s537ms209µs601ns | r42: sending batch 1 CPut to (n1,s1):1                                                                        |
  	| 13s537ms224µs219ns | sending request to local server                                                                               |
  	| 13s537ms233µs350ns | === SPAN START: /cockroach.roachpb.Internal/Batch ===                                                         |
  	| 13s537ms236µs572ns | 1 CPut                                                                                                        |
  	| 13s537ms238µs39ns  | read has no clock uncertainty                                                                                 |
  	| 13s537ms241µs255ns | executing 1 requests                                                                                          |
  	| 13s537ms245µs473ns | read-write path                                                                                               |
  	| 13s537ms248µs915ns | command queue                                                                                                 |
  	| 13s537ms261µs543ns | applied timestamp cache                                                                                       |
  	| 13s537ms309µs401ns | evaluated request                                                                                             |
  	| 13s537ms315µs302ns | acquired {raft,replica}mu                                                                                     |
  	| 13s537ms580µs149ns | applying command                                                                                              |
  	| 18s378ms239µs968ns | executing 1/1: COMMIT TRANSACTION                                                                             |
  	| 18s378ms291µs929ns | querying next range at /Table/61/1/285904591228600321/0                                                       |
  	| 18s378ms322µs473ns | r42: sending batch 1 EndTxn to (n1,s1):1                                                                      |
  	| 18s378ms348µs650ns | sending request to local server                                                                               |
  	| 18s378ms364µs928ns | === SPAN START: /cockroach.roachpb.Internal/Batch ===                                                         |
  	| 18s378ms370µs772ns | 1 EndTxn                                                                                                      |
  	| 18s378ms373µs902ns | read has no clock uncertainty                                                                                 |
  	| 18s378ms378µs613ns | executing 1 requests                                                                                          |
  	| 18s378ms386µs573ns | read-write path                                                                                               |
  	| 18s378ms394µs316ns | command queue                                                                                                 |
  	| 18s378ms417µs576ns | applied timestamp cache                                                                                       |
  	| 18s378ms588µs396ns | evaluated request                                                                                             |
  	| 18s378ms597µs715ns | acquired {raft,replica}mu                                                                                     |
  	| 18s383ms388µs599ns | applying command                                                                                              |
  	| 18s383ms494µs709ns | coordinator stops                                                                                             |
  	| 23s169ms850µs906ns | === SPAN START: sql txn implicit ===                                                                          |
  	| 23s169ms885µs921ns | executing 1/1: SET tracing = off                                                                              |
  	| 23s169ms919µs90ns  | query not supported for distSQL: SET / SET CLUSTER SETTING should never distribute                            |
  	+--------------------+---------------------------------------------------------------------------------------------------------------+
  	~~~

## See also

- [`EXPLAIN`](explain.html)
- [`SET (session settings)`](set-vars.html)
