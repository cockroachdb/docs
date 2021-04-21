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

CockroachDB's definition of a "trace" is a specialization of [OpenTracing's](https://opentracing.io/docs/overview/what-is-tracing/#what-is-opentracing) definition. Internally, CockroachDB uses OpenTracing libraries for tracing, which also means that
it can be easily integrated with OpenTracing-compatible trace collectors; for example, [Jaeger](query-behavior-troubleshooting.html#visualize-statement-traces-in-jaeger), Lightstep, and Zipkin are already supported.

Concept | Description
--------|------------
**trace** | Information about the sub-operations performed as part of a high-level operation (a query or a transaction). This information is internally represented as a tree of "spans", with a special "root span" representing a whole SQL transaction in the case of `SHOW TRACE FOR SESSION`.
**span** | A named, timed operation that describes a contiguous segment of work in a trace. Each span links to "child spans", representing sub-operations; their children would be sub-sub-operations of the grandparent span, etc.<br><br>Different spans can represent (sub-)operations that executed either sequentially or in parallel with respect to each other. (This possibly-parallel nature of execution is one of the important things that a trace is supposed to describe.) The operations described by a trace may be _distributed_, that is, different spans may describe operations executed by different nodes.
**message** | A string with timing information. Each span can contain a list of these. They are produced by CockroachDB's logging infrastructure and are the same messages that can be found in node [log files](debug-and-error-logs.html) except that a trace contains message across all severity levels, whereas log files, by default, do not. Thus, a trace is much more verbose than logs but only contains messages produced in the context of one particular traced operation.

To further clarify these concepts, let's look at a visualization of a trace for one statement. This particular trace is [visualized by Jaeger](query-behavior-troubleshooting.html#visualize-statement-traces-in-jaeger). The image shows spans and log messages. You can see names of operations and sub-operations, along with parent-child relationships and timing information, and it's easy to see which operations are executed in parallel.

<img src="{{ 'images/v20.2/jaeger-trace-log-messages.png' | relative_url }}" alt="Jaeger Trace Log Messages" style="border:1px solid #eee;max-width:100%" />

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
             timestamp             |       age       |                                                                                                                                  message                                                                                                                                  |                      tag                      |               location               |     operation     | span
-----------------------------------+-----------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------------------------------------------+--------------------------------------+-------------------+-------
  2021-04-13 20:09:03.617303+00:00 | 00:00:00        | === SPAN START: session recording ===                                                                                                                                                                                                                                     |                                               |                                      | session recording |    0
  2021-04-13 20:09:03.617312+00:00 | 00:00:00.000009 | === SPAN START: sync ===                                                                                                                                                                                                                                                  |                                               |                                      | sync              |    1
  2021-04-13 20:09:03.617465+00:00 | 00:00:00.000162 | [NoTxn pos:13] executing Sync                                                                                                                                                                                                                                             | [n1,client=127.0.0.1:61283,hostssl,user=root] | sql/conn_executor.go:1428            | sync              |    1
  2021-04-13 20:09:03.617794+00:00 | 00:00:00.000491 | === SPAN START: exec stmt ===                                                                                                                                                                                                                                             |                                               |                                      | exec stmt         |    2
  2021-04-13 20:09:03.617836+00:00 | 00:00:00.000533 | [NoTxn pos:14] executing ExecStmt: SHOW LAST QUERY STATISTICS                                                                                                                                                                                                             | [n1,client=127.0.0.1:61283,hostssl,user=root] | sql/conn_executor.go:1428            | exec stmt         |    2
  2021-04-13 20:09:03.617875+00:00 | 00:00:00.000572 | executing: SHOW LAST QUERY STATISTICS in state: NoTxn                                                                                                                                                                                                                     | [n1,client=127.0.0.1:61283,hostssl,user=root] | sql/conn_executor_exec.go:70         | exec stmt         |    2
...

(66 rows)
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
    -----
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
                  timestamp             |       age       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        message                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |                            tag                             |                         location                          |             operation             | span
     -----------------------------------+-----------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------------------------------------------------------------+-----------------------------------------------------------+-----------------------------------+-------
       2021-04-13 20:10:51.981766+00:00 | 00:00:00        | === SPAN START: session recording ===                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |                                                            |                                                           | session recording                 |    0
       2021-04-13 20:10:51.981828+00:00 | 00:00:00.000062 | === SPAN START: sync ===                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |                                                            |                                                           | sync                              |    1
       2021-04-13 20:10:51.981933+00:00 | 00:00:00.000167 | [NoTxn pos:13] executing Sync                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | [n1,client=127.0.0.1:61293,hostssl,user=root]              | sql/conn_executor.go:1428                                 | sync                              |    1
       2021-04-13 20:10:51.982373+00:00 | 00:00:00.000607 | === SPAN START: exec stmt ===                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |                                                            |                                                           | exec stmt                         |    2
       2021-04-13 20:10:51.982438+00:00 | 00:00:00.000672 | [NoTxn pos:14] executing ExecStmt: SHOW LAST QUERY STATISTICS                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | [n1,client=127.0.0.1:61293,hostssl,user=root]              | sql/conn_executor.go:1428                                 | exec stmt                         |    2
       2021-04-13 20:10:51.982467+00:00 | 00:00:00.000701 | executing: SHOW LAST QUERY STATISTICS in state: NoTxn                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | [n1,client=127.0.0.1:61293,hostssl,user=root]              | sql/conn_executor_exec.go:70                              | exec stmt                         |    2
       2021-04-13 20:10:51.982514+00:00 | 00:00:00.000748 | === SPAN START: sync ===                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |                                                            |                                                           | sync                              |    3
       2021-04-13 20:10:51.982533+00:00 | 00:00:00.000767 | [NoTxn pos:15] executing Sync                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | [n1,client=127.0.0.1:61293,hostssl,user=root]              | sql/conn_executor.go:1428                                 | sync                              |    3
       2021-04-13 20:10:51.982977+00:00 | 00:00:00.001211 | === SPAN START: exec stmt ===                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |                                                            |                                                           | exec stmt                         |    4
       2021-04-13 20:10:51.983035+00:00 | 00:00:00.001269 | [NoTxn pos:16] executing ExecStmt: SHOW TRANSACTION STATUS                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | [n1,client=127.0.0.1:61293,hostssl,user=root]              | sql/conn_executor.go:1428                                 | exec stmt                         |    4
       2021-04-13 20:10:51.983055+00:00 | 00:00:00.001289 | executing: SHOW TRANSACTION STATUS in state: NoTxn                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | [n1,client=127.0.0.1:61293,hostssl,user=root]              | sql/conn_executor_exec.go:70                              | exec stmt                         |    4
       2021-04-13 20:10:51.983066+00:00 | 00:00:00.0013   | === SPAN START: sync ===                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |                                                            |                                                           | sync                              |    5
...
(210 rows)
    ~~~

## See also

- [`EXPLAIN`](explain.html)
- [`SET (session settings)`](set-vars.html)
