---
title: SHOW TRACE
summary: The SHOW TRACE statement returns details about how CockroachDB executed a statement or series of statements.
toc: true
---

The `SHOW TRACE` [statement](sql-statements.html) returns details about how CockroachDB executed a statement or series of statements. These details include messages and timing information from all nodes involved in the execution, providing visibility into the actions taken by CockroachDB across all of its software layers.

You can use `SHOW TRACE` to debug why a query is not performing as expected, to add more information to bug reports, or to generally learn more about how CockroachDB works.


## Usage Overview

There are two distinct ways to use `SHOW TRACE`:

Statement | Usage
----------|------
[`SHOW TRACE FOR <stmt>`](#show-trace-for-stmt) | Execute a single [explainable](sql-grammar.html#explainable_stmt) statement and return a trace of its actions.
[`SHOW TRACE FOR SESSION`](#show-trace-for-session) | Return a trace of all executed statements recorded during a session.

### SHOW TRACE FOR &lt;stmt&gt;

This use of `SHOW TRACE` executes a single [explainable](explain.html#explainable-statements) statement and then returns messages and timing information from all nodes involved in its execution. It's important to note the following:

- `SHOW TRACE FOR <stmt>` executes the target statement and, once execution has completed, then returns a trace of the actions taken. For example, tracing an `INSERT` statement inserts data and then returns a trace, a `DELETE` statement deletes data and then returns a trace, etc. This is different than the [`EXPLAIN`](explain.html) statement, which does not execute its target statement but instead returns details about its predicted execution plan.
    - The target statement must be an [`explainable`](explain.html#explainable-statements) statement. All non-explainable statements are not supported.
    - The target statement is always executed with the local SQL engine. Due to this [known limitation](https://github.com/cockroachdb/cockroach/issues/16562), the trace will not reflect the way in which some statements would have been executed when not the target of `SHOW TRACE FOR <stmt>`. This limitation does not apply to `SHOW TRACE FOR SESSION`.

- If the target statement encounters errors, those errors are not returned to the client. Instead, they are included in the trace. This has the following important implications for [transaction retries](transactions.html#transaction-retries):
    - Normally, individual statements (considered implicit transactions) and multi-statement transactions batched by the client are [automatically retried](transactions.html#automatic-retries) by CockroachDB when [retryable errors](transactions.html#error-handling) are encountered due to contention. However, when such statements are the target of `SHOW TRACE FOR <stmt>`, CockroachDB does **not** automatically retry.
    - When each statement in a multi-statement transaction is sent individually (as opposed to being batched), if one of the statements is the target or `SHOW TRACE <stmt>`, retryable errors encountered by that statement will not be returned to the client.

    {{site.data.alerts.callout_success}}Given these implications, when you expect transaction retries or want to trace across retries, it's recommended to use <code>SHOW TRACE FOR SESSION</code>.{{site.data.alerts.end}}

- When tracing an individual statement (i.e., an implicit transaction), the tracing
  might change the way in which the statement commits its data; tracing
  inhibits the "one-phase commit" optimization for transactions that touch a
  single range. The trace will not reflect the committing of the transaction.
  `SHOW TRACE FOR SESSION` does not have this effect.

### SHOW TRACE FOR SESSION

This use of `SHOW TRACE` returns messages and timing information for all statements recorded during a session. It's important to note the following:

- `SHOW TRACE FOR SESSION` only returns the most recently recorded traces, or for a currently active recording of traces.
    - To start recording traces during a session, enable the `tracing` session variable via [`SET tracing = on;`](set-vars.html#set-tracing).
    - To stop recording traces during a session, disable the `tracing` session variable via [`SET tracing = off;`](set-vars.html#set-tracing).

- In contrast to `SHOW TRACE FOR <stmt>`, recording traces during a session does not effect the execution of any statements traced. This means that errors encountered by statements during a recording are returned to clients. CockroachDB will [automatically retry](transactions.html#automatic-retries) individual statements (considered implicit transactions) and multi-statement transactions sent as a single batch when [retryable errors](transactions.html#error-handling) are encountered due to contention. Also, clients will receive retryable errors required to handle [client-side retries](transactions.html#client-side-intervention). As a result, traces of all transaction retries will be captured during a recording.

- `SHOW TRACE FOR <stmt>` overwrites the last recorded trace. This means that if you enable session recording, disable session recording, execute `SHOW TRACE FOR <stmt>`, and then execute `SHOW TRACE FOR SESSION`, the response will be the trace for `SHOW TRACE FOR <stmt>`, not for the previously recorded session.

## Required Privileges

For `SHOW TRACE FOR <stmt>`, the user must have the appropriate [privileges](privileges.html) for the statement being traced. For `SHOW TRACE FOR SESSION`, no privileges are required.

## Syntax

<section>{% include {{ page.version.version }}/sql/diagrams/show_trace.html %}</section>

## Parameters

Parameter | Description
----------|------------
`KV` | If specified, the returned messages are restricted to those describing requests to and responses from the underlying key-value [storage layer](architecture/storage-layer.html), including per-result-row messages.<br><br>For `SHOW KV TRACE FOR <stmt>`, per-result-row messages are included.<br><br>For `SHOW KV TRACE FOR SESSION`, per-result-row messages are included only if the session was/is recording with `SET tracing = kv;`.
`COMPACT` | <span class="version-tag">New in v2.0:</span> If specified, fewer columns are returned by the statement. See [Response](#response) for more details.
`explainable_stmt` | The statement to execute and trace. Only [explainable](explain.html#explainable-statements) statements are supported.

## Trace Description

CockroachDB's definition of a "trace" is a specialization of [OpenTracing's](https://opentracing.io/docs/overview/what-is-tracing/#what-is-opentracing) definition. Internally, CockroachDB uses OpenTracing libraries for tracing, which also means that
it can be easily integrated with OpenTracing-compatible trace collectors; for example, Lightstep and Zipkin are already supported.

Concept | Description
--------|------------
**trace** | Information about the sub-operations performed as part of a high-level operation (a query or a transaction). This information is internally represented as a tree of "spans", with a special "root span" representing a query execution in the case of `SHOW TRACE FOR <stmt>` or a whole SQL transaction in the case of `SHOW TRACE FOR SESSION`.
**span** | A named, timed operation that describes a contiguous segment of work in a trace. Each span links to "child spans", representing sub-operations; their children would be sub-sub-operations of the grandparent span, etc.<br><br>Different spans can represent (sub-)operations that executed either sequentially or in parallel with respect to each other. (This possibly-parallel nature of execution is one of the important things that a trace is supposed to describe.) The operations described by a trace may be _distributed_, that is, different spans may describe operations executed by different nodes.
**message** | A string with timing information. Each span can contain a list of these. They are produced by CockroachDB's logging infrastructure and are the same messages that can be found in node [log files](debug-and-error-logs.html) except that a trace contains message across all severity levels, whereas log files, by default, do not. Thus, a trace is much more verbose than logs but only contains messages produced in the context of one particular traced operation.

To further clarify these concepts, let's look at a visualization of a trace for one statement. This particular trace is visualized by [Lightstep](http://lightstep.com/) (docs on integrating Lightstep with CockroachDB coming soon). The image only shows spans, but in the tool, it would be possible drill down to messages. You can see names of operations and sub-operations, along with parent-child relationships and timing information, and it's easy to see which operations are executed in parallel.

<div style="text-align: center;"><img src="{{ 'images/v2.0/trace.png' | relative_url }}" alt="Lightstep example" style="border:1px solid #eee;max-width:100%" /></div>

## Response

{{site.data.alerts.callout_info}}The format of the <code>SHOW TRACE</code> response may change in future versions.{{site.data.alerts.end}}

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
`loc` | string | <span class="version-tag">New in v2.0:</span> The file:line location of the line of code that produced the message. Only some of the messages have this field set; it depends on specifically how the message was logged. The `--vmodule` flag passed to the node producing the message also affects what rows get this field populated. Generally, if `--vmodule=<file>=<level>` is specified, messages produced by that file will have the field populated.
`operation` | string | The name of the operation (or sub-operation) on whose behalf the message was logged.
`span` | int | The index of the span within the virtual list of all spans if they were ordered by the span's start time.

{{site.data.alerts.callout_info}}If the <code>COMPACT</code> keyword was specified, only the <code>age</code>, <code>message</code>, <code>tag</code> and <code>operation</code> columns are returned. In addition, the value of the <code>loc</code> columns is prepended to <code>message</code>.{{site.data.alerts.end}}

## Examples

### Trace a simple `SELECT`

~~~ sql
> SHOW TRACE FOR SELECT * FROM foo;
~~~

~~~
+----------------------------------+---------------+-------------------------------------------------------+------------------------------------------------+-----+-----------------------------------+------+
|            timestamp             |      age      |                        message                        |                      tag                       | loc |             operation             | span |
+----------------------------------+---------------+-------------------------------------------------------+------------------------------------------------+-----+-----------------------------------+------+
| 2018-03-08 21:22:18.266373+00:00 | 0s            | === SPAN START: sql txn ===                           |                                                |     | sql txn                           |    0 |
| 2018-03-08 21:22:18.267341+00:00 | 967µs713ns    | === SPAN START: session recording ===                 |                                                |     | session recording                 |    5 |
| 2018-03-08 21:22:18.267343+00:00 | 969µs760ns    | === SPAN START: starting plan ===                     |                                                |     | starting plan                     |    1 |
| 2018-03-08 21:22:18.267367+00:00 | 993µs551ns    | === SPAN START: consuming rows ===                    |                                                |     | consuming rows                    |    2 |
| 2018-03-08 21:22:18.267384+00:00 | 1ms10µs504ns  | Scan /Table/51/{1-2}                                  | [n1,client=[::1]:58264,user=root]              |     | sql txn                           |    0 |
| 2018-03-08 21:22:18.267434+00:00 | 1ms60µs392ns  | === SPAN START: dist sender ===                       |                                                |     | dist sender                       |    3 |
| 2018-03-08 21:22:18.267444+00:00 | 1ms71µs136ns  | querying next range at /Table/51/1                    | [client=[::1]:58264,user=root,txn=76d25cda,n1] |     | dist sender                       |    3 |
| 2018-03-08 21:22:18.267462+00:00 | 1ms88µs421ns  | r20: sending batch 1 Scan to (n1,s1):1                | [client=[::1]:58264,user=root,txn=76d25cda,n1] |     | dist sender                       |    3 |
| 2018-03-08 21:22:18.267465+00:00 | 1ms91µs570ns  | sending request to local server                       | [client=[::1]:58264,user=root,txn=76d25cda,n1] |     | dist sender                       |    3 |
| 2018-03-08 21:22:18.267467+00:00 | 1ms93µs707ns  | === SPAN START: /cockroach.roachpb.Internal/Batch === |                                                |     | /cockroach.roachpb.Internal/Batch |    4 |
| 2018-03-08 21:22:18.267469+00:00 | 1ms96µs103ns  | 1 Scan                                                | [n1]                                           |     | /cockroach.roachpb.Internal/Batch |    4 |
| 2018-03-08 21:22:18.267471+00:00 | 1ms97µs437ns  | read has no clock uncertainty                         | [n1]                                           |     | /cockroach.roachpb.Internal/Batch |    4 |
| 2018-03-08 21:22:18.267474+00:00 | 1ms101µs60ns  | executing 1 requests                                  | [n1,s1]                                        |     | /cockroach.roachpb.Internal/Batch |    4 |
| 2018-03-08 21:22:18.267479+00:00 | 1ms105µs912ns | read-only path                                        | [n1,s1,r20/1:/Table/5{1-2}]                    |     | /cockroach.roachpb.Internal/Batch |    4 |
| 2018-03-08 21:22:18.267483+00:00 | 1ms110µs94ns  | command queue                                         | [n1,s1,r20/1:/Table/5{1-2}]                    |     | /cockroach.roachpb.Internal/Batch |    4 |
| 2018-03-08 21:22:18.267487+00:00 | 1ms114µs240ns | waiting for read lock                                 | [n1,s1,r20/1:/Table/5{1-2}]                    |     | /cockroach.roachpb.Internal/Batch |    4 |
| 2018-03-08 21:22:18.26752+00:00  | 1ms146µs596ns | read completed                                        | [n1,s1,r20/1:/Table/5{1-2}]                    |     | /cockroach.roachpb.Internal/Batch |    4 |
| 2018-03-08 21:22:18.267566+00:00 | 1ms192µs724ns | plan completed execution                              | [n1,client=[::1]:58264,user=root]              |     | consuming rows                    |    2 |
| 2018-03-08 21:22:18.267568+00:00 | 1ms195µs60ns  | resources released, stopping trace                    | [n1,client=[::1]:58264,user=root]              |     | consuming rows                    |    2 |
+----------------------------------+---------------+-------------------------------------------------------+------------------------------------------------+-----+-----------------------------------+------+
(19 rows)
~~~

{{site.data.alerts.callout_success}}You can use <code>SHOW TRACE</code> as the <a href="table-expressions.html">data source</a> for a <code>SELECT</code> statement, and then filter the values with the <code>WHERE</code> clause. For example, to see only messages about spans starting, you might execute <code>SELECT * FROM [SHOW TRACE FOR <stmt>] where message LIKE '=== SPAN START%'</code>.{{site.data.alerts.end}}

### Trace conflicting transactions

In this example, we use two terminals concurrently to generate conflicting transactions.

1. In terminal 1, create a table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE t (k INT);
    ~~~

2. Still in terminal 1, open a transaction and perform a write without closing the transaction:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > BEGIN;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO t VALUES (1);
    ~~~

    Press enter one more time to send these statements to the server.

3. In terminal 2, execute and trace a conflicting read:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT age, span, message FROM [SHOW TRACE FOR SELECT * FROM t];
    ~~~

    You'll see that this statement is blocked until the transaction in terminal 1 finishes.

4. Back in terminal 1, finish the transaction:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > COMMIT;
    ~~~

5. Back in terminal 2, you'll see the completed trace:

    {{site.data.alerts.callout_success}}Check the lines starting with <code>#Annotation</code> for insights into how the conflict is traced.{{site.data.alerts.end}}

	~~~ shell
	+-------------------+--------+-------------------------------------------------------------------------------------------------------+
	|        age        |  span  |            message                                                                                    |
	+-------------------+--------+-------------------------------------------------------------------------------------------------------+
	| 0s                | (0,0)  | === SPAN START: sql txn implicit ===                                                                  |
	| 409µs750ns        | (0,1)  | === SPAN START: starting plan ===                                                                     |
	| 417µs68ns         | (0,2)  | === SPAN START: consuming rows ===                                                                    |
	| 446µs968ns        | (0,0)  | querying next range at /Table/61/1                                                                    |
	| 474µs387ns        | (0,0)  | r42: sending batch 1 Scan to (n1,s1):1                                                                |
	| 491µs800ns        | (0,0)  | sending request to local server                                                                       |
	| 503µs260ns        | (0,3)  | === SPAN START: /cockroach.roachpb.Internal/Batch ===                                                 |
	| 506µs135ns        | (0,3)  | 1 Scan                                                                                                |
	| 508µs385ns        | (0,3)  | read has no clock uncertainty                                                                         |
	| 512µs176ns        | (0,3)  | executing 1 requests                                                                                  |
	| 518µs675ns        | (0,3)  | read-only path                                                                                        |
	| 525µs357ns        | (0,3)  | command queue                                                                                         |
	| 531µs990ns        | (0,3)  | waiting for read lock                                                                                 |
    | # Annotation: The following line identifies the conflict, and some of the lines below it describe the conflict resolution          |
	| 603µs363ns        | (0,3)  | conflicting intents on /Table/61/1/285895906846146561/0                                               |
	| 611µs228ns        | (0,3)  | replica.Send got error: conflicting intents on /Table/61/1/285895906846146561/0                       |
	| # Annotation: The read is now going to wait for the writer to finish by executing a PushTxn request.                               |
	| 615µs680ns        | (0,3)  | pushing 1 transaction(s)                                                                              |
	| 630µs734ns        | (0,3)  | querying next range at /Table/61/1/285895906846146561/0                                               |
	| 646µs292ns        | (0,3)  | r42: sending batch 1 PushTxn to (n1,s1):1                                                             |
	| 658µs613ns        | (0,3)  | sending request to local server                                                                       |
	| 665µs738ns        | (0,4)  | === SPAN START: /cockroach.roachpb.Internal/Batch ===                                                 |
	| 668µs765ns        | (0,4)  | 1 PushTxn                                                                                             |
	| 671µs770ns        | (0,4)  | executing 1 requests                                                                                  |
	| 677µs182ns        | (0,4)  | read-write path                                                                                       |
	| 681µs909ns        | (0,4)  | command queue                                                                                         |
	| 693µs718ns        | (0,4)  | applied timestamp cache                                                                               |
	| 794µs20ns         | (0,4)  | evaluated request                                                                                     |
	| 807µs125ns        | (0,4)  | replica.Send got error: failed to push "sql txn" id=23fce0c4 key=/Table/61/1/285895906846146561/0 ... |
	| 812µs917ns        | (0,4)  | 62cddd0b pushing 23fce0c4 (1 pending)                                                                 |
	| 4s348ms604µs506ns | (0,4)  | result of pending push: "sql txn" id=23fce0c4 key=/Table/61/1/285895906846146561/0 rw=true pri=0  ... |
	| # Annotation: The writer is detected to have finished.                                                                             |
	| 4s348ms609µs635ns | (0,4)  | push request is satisfied                                                                             |
	| 4s348ms657µs576ns | (0,3)  | 23fce0c4-1d22-4321-9779-35f0f463b2d5 is now COMMITTED                                                 |
    | # Annotation: The write has committed. Some cleanup follows.                                                                       |
	| 4s348ms659µs899ns | (0,3)  | resolving intents [wait=true]                                                                         |
	| 4s348ms669µs431ns | (0,17) | === SPAN START: storage.intentResolve: resolving intents ===                                          |
	| 4s348ms726µs582ns | (0,17) | querying next range at /Table/61/1/285895906846146561/0                                               |
	| 4s348ms746µs398ns | (0,17) | r42: sending batch 1 ResolveIntent to (n1,s1):1                                                       |
	| 4s348ms758µs761ns | (0,17) | sending request to local server                                                                       |
	| 4s348ms769µs344ns | (0,18) | === SPAN START: /cockroach.roachpb.Internal/Batch ===                                                 |
	| 4s348ms772µs713ns | (0,18) | 1 ResolveIntent                                                                                       |
	| 4s348ms776µs159ns | (0,18) | executing 1 requests                                                                                  |
	| 4s348ms781µs364ns | (0,18) | read-write path                                                                                       |
	| 4s348ms786µs536ns | (0,18) | command queue                                                                                         |
	| 4s348ms797µs901ns | (0,18) | applied timestamp cache                                                                               |
	| 4s348ms868µs521ns | (0,18) | evaluated request                                                                                     |
	| 4s348ms875µs924ns | (0,18) | acquired {raft,replica}mu                                                                             |
	| 4s349ms150µs556ns | (0,18) | applying command                                                                                      |
	| 4s349ms232µs373ns | (0,3)  | read-only path                                                                                        |
	| 4s349ms237µs724ns | (0,3)  | command queue                                                                                         |
	| 4s349ms241µs857ns | (0,3)  | waiting for read lock                                                                                 |
	| # Annotation: This is where we would have been if there hadn't been a conflict.                                                    |
	| 4s349ms280µs702ns | (0,3)  | read completed                                                                                        |
	| 4s349ms330µs707ns | (0,2)  | output row: [1]                                                                                       |
	| 4s349ms333µs718ns | (0,2)  | output row: [1]                                                                                       |
	| 4s349ms336µs53ns  | (0,2)  | output row: [1]                                                                                       |
	| 4s349ms338µs212ns | (0,2)  | output row: [1]                                                                                       |
	| 4s349ms339µs111ns | (0,2)  | plan completed execution                                                                              |
	| 4s349ms341µs476ns | (0,2)  | resources released, stopping trace                                                                    |
	+-------------------+--------+-------------------------------------------------------------------------------------------------------+
	~~~

### Trace a transaction retry

In this example, we use session tracing to show an [automatic transaction retry](transactions.html#automatic-retries). Like in the previous example, we'll have to use two terminals because retries are induced by unfortunate interactions between transactions.

1. In terminal 1, unset the `smart_prompt` shell option, turn on trace recording, and then start a transaction:

    {% include_cached copy-clipboard.html %}

    ~~~ sql
    > \unset smart_prompt
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SET tracing = cluster;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > BEGIN;
    ~~~

    Starting a transaction gets us an early timestamp, i.e., we "lock" the snapshot of the data on which the transaction is going to operate.

2. In terminal 2, perform a read:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM t;
    ~~~

    This read is performed at a timestamp higher than the timestamp of the transaction running in terminal 1. Because we're running at the [`SERIALIZABLE` transaction isolation level](architecture/transaction-layer.html#isolation-levels) (the default), if the system allows terminal 1's transaction to commit, it will have to ensure that ordering terminal 1's transaction *before* terminal 2's transaction is valid; this will become relevant in a second.

3. Back in terminal 1, execute and trace a conflicting write:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO t VALUES (1);
    ~~~

    At this point, the system will detect the conflict and realize that the transaction can no longer commit because allowing it to commit would mean that we have changed history with respect to terminal 2's read. As a result, it will automatically retry the transaction so it can be serialized *after* terminal 2's transaction. The trace will reflect this retry.

4. Turn off trace recording and request the trace:

    {% include_cached copy-clipboard.html %}
	~~~ sql
	> SET tracing = off;
	~~~

    {% include_cached copy-clipboard.html %}
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

## See Also

- [`EXPLAIN`](explain.html)
- [`SET (session settings)`](set-vars.html)
