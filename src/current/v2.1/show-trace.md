---
title: SHOW TRACE FOR SESSION
summary: The SHOW TRACE FOR SESSION statement returns details about how CockroachDB executed a statement or series of statements recorded during a session.
toc: true
---

The `SHOW TRACE FOR SESSION` [statement](sql-statements.html) returns details about how CockroachDB executed a statement or series of statements recorded during a session. These details include messages and timing information from all nodes involved in the execution, providing visibility into the actions taken by CockroachDB across all of its software layers.

You can use `SHOW TRACE FOR SESSION` to debug why a query is not performing as expected, to add more information to bug reports, or to generally learn more about how CockroachDB works.

## Usage overview

`SHOW TRACE FOR SESSION` returns messages and timing information for all statements recorded during a session. It's important to note the following:

- `SHOW TRACE FOR SESSION` only returns the most recently recorded traces, or for a currently active recording of traces.
    - To start recording traces during a session, enable the `tracing` session variable via [`SET tracing = on;`](set-vars.html#set-tracing).
    - To stop recording traces during a session, disable the `tracing` session variable via [`SET tracing = off;`](set-vars.html#set-tracing).

- Recording traces during a session does not effect the execution of any statements traced. This means that errors encountered by statements during a recording are returned to clients. CockroachDB will [automatically retry](transactions.html#automatic-retries) individual statements (considered implicit transactions) and multi-statement transactions sent as a single batch when [retryable errors](transactions.html#error-handling) are encountered due to contention. Also, clients will receive retryable errors required to handle [client-side retries](transactions.html#client-side-intervention). As a result, traces of all transaction retries will be captured during a recording.


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
it can be easily integrated with OpenTracing-compatible trace collectors; for example, Lightstep and Zipkin are already supported.

Concept | Description
--------|------------
**trace** | Information about the sub-operations performed as part of a high-level operation (a query or a transaction). This information is internally represented as a tree of "spans", with a special "root span" representing a whole SQL transaction in the case of `SHOW TRACE FOR SESSION`.
**span** | A named, timed operation that describes a contiguous segment of work in a trace. Each span links to "child spans", representing sub-operations; their children would be sub-sub-operations of the grandparent span, etc.<br><br>Different spans can represent (sub-)operations that executed either sequentially or in parallel with respect to each other. (This possibly-parallel nature of execution is one of the important things that a trace is supposed to describe.) The operations described by a trace may be _distributed_, that is, different spans may describe operations executed by different nodes.
**message** | A string with timing information. Each span can contain a list of these. They are produced by CockroachDB's logging infrastructure and are the same messages that can be found in node [log files](debug-and-error-logs.html) except that a trace contains message across all severity levels, whereas log files, by default, do not. Thus, a trace is much more verbose than logs but only contains messages produced in the context of one particular traced operation.

To further clarify these concepts, let's look at a visualization of a trace for one statement. This particular trace is visualized by [Lightstep](http://lightstep.com/) (docs on integrating Lightstep with CockroachDB coming soon). The image only shows spans, but in the tool, it would be possible drill down to messages. You can see names of operations and sub-operations, along with parent-child relationships and timing information, and it's easy to see which operations are executed in parallel.

<div style="text-align: center;"><img src="{{ 'images/v2.1/trace.png' | relative_url }}" alt="Lightstep example" style="border:1px solid #eee;max-width:100%" /></div>

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

{% include_cached copy-clipboard.html %}
~~~ sql
> SET tracing = on;
~~~

~~~
SET TRACING
~~~

{% include_cached copy-clipboard.html %}
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

3. In terminal 2, turn tracing on:

    ~~~
    > SET tracing = on;
    ~~~

4.  Still in terminal 2, execute a conflicting read:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM t;
    ~~~

    You'll see that this statement is blocked until the transaction in terminal 1 finishes.

4. Back in terminal 1, finish the transaction:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > COMMIT;
    ~~~

5. In terminal 2, you'll see the completed read:

    ~~~
    +---+
    | k |
    +---+
    | 1 |
    +---+
    ~~~

6. Still in terminal 2, stop tracing and then view the completed trace:

    {{site.data.alerts.callout_success}}Check the lines starting with <code>#Annotation</code> for insights into how the conflict is traced.{{site.data.alerts.end}}

    ~~~
    +--------------------+------+--------------------------------------------------------------------------+
    |        age         | span |                                 message                                  |
    +--------------------+------+--------------------------------------------------------------------------+
    | 0s                 |    0 | === SPAN START: session recording ===                                    |
    | 26µs841ns          |    0 | [NoTxn pos:25] executing Sync                                            |
    | 214µs31ns          |    0 | [NoTxn pos:26] executing ExecStmt: SHOW TRANSACTION STATUS               |
    ...
    | 6s289ms100µs820ns  |    3 | === SPAN START: sql txn ===                                              |
    | 6s289ms136µs804ns  |    3 | [Open pos:34] executing ExecStmt: SELECT * FROM t                        |
    | 6s289ms147µs236ns  |    3 | executing: SELECT * FROM t in state: Open                                |
    | 6s289ms169µs623ns  |    3 | planning starts: SELECT                                                  |
    | 6s289ms171µs400ns  |    3 | generating optimizer plan                                                |
    | 6s289ms203µs35ns   |    3 | added table 'defaultdb.public.t' to table collection                     |
    | 6s289ms300µs796ns  |    3 | optimizer plan succeeded                                                 |
    | 6s289ms301µs851ns  |    3 | planning ends                                                            |
    | 6s289ms305µs338ns  |    3 | checking distributability                                                |
    | 6s289ms308µs608ns  |    3 | distributable plan: true                                                 |
    | 6s289ms314µs399ns  |    3 | execution starts: distributed                                            |
    | 6s289ms315µs380ns  |    4 | === SPAN START: consuming rows ===                                       |
    | 6s289ms327µs736ns  |    3 | creating DistSQL plan                                                    |
    | 6s289ms360µs73ns   |    3 | querying next range at /Table/52/1                                       |
    | 6s289ms397µs745ns  |    3 | running DistSQL plan                                                     |
    | 6s289ms411µs676ns  |    5 | === SPAN START: flow ===                                                 |
    | 6s289ms459µs347ns  |    5 | starting (1 processors, 0 startables)                                    |
    | 6s289ms476µs196ns  |    8 | === SPAN START: table reader ===                                         |
    |                    |      |                                                                          |
    |                    |      | cockroach.stat.tablereader.stalltime: 7µs                                |
    |                    |      |                                                                          |
    |                    |      | cockroach.processorid: 0                                                 |
    |                    |      |                                                                          |
    |                    |      | cockroach.stat.tablereader.input.rows: 2                                 |
    | 6s290ms23µs213ns   |    8 | Scan /Table/52/{1-2}                                                     |
    | 6s290ms39µs563ns   |    9 | === SPAN START: dist sender ===                                          |
    | 6s290ms82µs250ns   |    9 | querying next range at /Table/52/1                                       |
    | 6s290ms106µs319ns  |    9 | r23: sending batch 1 Scan to (n1,s1):1                                   |
    | 6s290ms112µs72ns   |    9 | sending request to local server                                          |
    | 6s290ms156µs75ns   |   10 | === SPAN START: /cockroach.roachpb.Internal/Batch ===                    |
    | 6s290ms160µs422ns  |   10 | 1 Scan                                                                   |
    | 6s290ms166µs984ns  |   10 | executing 1 requests                                                     |
    | 6s290ms175µs94ns   |   10 | read-only path                                                           |
    | 6s290ms179µs708ns  |   10 | read has no clock uncertainty                                            |
    | 6s290ms186µs84ns   |   10 | command queue                                                            |
    | 6s290ms203µs789ns  |   10 | waiting for read lock                                                    |
    | # Annotation: The following line identifies the conflict and describes the conflict resolution.      |
    | 6s290ms318µs839ns  |   10 | conflicting intents on /Table/52/1/372254698480435201/0                  |
    | 6s290ms337µs353ns  |   10 | replica.Send got error: conflicting intents on                           |
    |                    |      | /Table/52/1/372254698480435201/0                                         |
    | 6s290ms352µs992ns  |   10 | adding f4a8193b to contention queue on intent                            |
    |                    |      | /Table/52/1/372254698480435201/0 @c4203a16                               |
    | # Annotation: The read is now going to wait for the writer to finish by executing a PushTxn request. |
    | 6s290ms362µs345ns  |   10 | pushing 1 transaction(s)                                                 |
    | 6s290ms370µs927ns  |   11 | === SPAN START: dist sender ===                                          |
    | 6s290ms378µs722ns  |   11 | querying next range at /Table/52/1/372254698480435201/0                  |
    | 6s290ms389µs560ns  |   11 | r23: sending batch 1 PushTxn to (n1,s1):1                                |
    | 6s290ms392µs349ns  |   11 | sending request to local server                                          |
    | 6s290ms455µs709ns  |   12 | === SPAN START: /cockroach.roachpb.Internal/Batch ===                    |
    | 6s290ms461µs351ns  |   12 | 1 PushTxn                                                                |
    | 6s290ms464µs607ns  |   12 | executing 1 requests                                                     |
    | 6s290ms471µs394ns  |   12 | read-write path                                                          |
    | 6s290ms476µs558ns  |   12 | command queue                                                            |
    | 6s290ms484µs12ns   |   12 | applied timestamp cache                                                  |
    | 6s290ms593µs363ns  |   12 | evaluated request                                                        |
    | 6s290ms606µs183ns  |   12 | replica.Send got error: failed to push "sql txn" id=c4203a16             |
    |                    |      | key=/Table/52/1/372254698480435201/0 rw=true pri=0.03424799              |
    |                    |      | iso=SERIALIZABLE stat=PENDING epo=0 ts=1533673518.429352831,0            |
    |                    |      | orig=1533673518.429352831,0 max=1533673518.429352831,0 wto=false         |
    |                    |      | rop=false seq=1                                                          |
    | 6s290ms617µs794ns  |   12 | f4a8193b pushing c4203a16 (1 pending)                                    |
    | 6s290ms655µs798ns  |   12 | querying pushee                                                          |
    ...
    | 11s777ms251µs907ns |   20 | === SPAN START: /cockroach.roachpb.Internal/Batch ===                    |
    | 11s777ms261µs211ns |   20 | 1 QueryTxn                                                               |
    | 11s777ms286µs672ns |   20 | executing 1 requests                                                     |
    | 11s777ms300µs370ns |   20 | read-only path                                                           |
    | 11s777ms371µs665ns |   20 | command queue                                                            |
    | 11s777ms393µs277ns |   20 | waiting for 1 overlapping requests                                       |
    | 11s779ms520µs651ns |   20 | waited 2.113298ms for overlapping requests                               |
    | 11s779ms543µs461ns |   20 | waiting for read lock                                                    |
    | 11s779ms641µs611ns |   20 | read completed                                                           |
    | 12s440ms469µs377ns |   12 | result of pending push: "sql txn" id=c4203a16                            |
    |                    |      | key=/Table/52/1/372254698480435201/0 rw=true pri=0.03424799              |
    |                    |      | iso=SERIALIZABLE stat=COMMITTED epo=0 ts=1533673518.429352831,0          |
    |                    |      | orig=1533673518.429352831,0 max=1533673518.429352831,0 wto=false         |
    |                    |      | rop=false seq=3                                                          |
    | # Annotation: The writer is detected to have finished.                                               |
    | 12s440ms473µs127ns |   12 | push request is satisfied                                                |
    | 12s440ms546µs916ns |   10 | c4203a16-78c5-4841-92f3-9a0c966ba9db is now COMMITTED                    |
    | # Annotation: The write has committed. Some cleanup follows.                                         |
    | 12s440ms551µs686ns |   10 | resolving intents [wait=false]                                           |
    | 12s440ms603µs878ns |   21 | === SPAN START: dist sender ===                                          |
    | 12s440ms648µs131ns |   21 | querying next range at /Table/52/1/372254698480435201/0                  |
    | 12s440ms692µs427ns |   21 | r23: sending batch 1 ResolveIntent to (n1,s1):1                          |
    | 12s440ms699µs732ns |   21 | sending request to local server                                          |
    | 12s440ms703µs670ns |   22 | === SPAN START: /cockroach.roachpb.Internal/Batch ===                    |
    | 12s440ms708µs476ns |   22 | 1 ResolveIntent                                                          |
    | 12s440ms714µs221ns |   22 | executing 1 requests                                                     |
    | 12s440ms720µs853ns |   22 | read-write path                                                          |
    | 12s440ms733µs90ns  |   22 | command queue                                                            |
    | 12s440ms742µs916ns |   22 | applied timestamp cache                                                  |
    | 12s440ms831µs18ns  |   22 | evaluated request                                                        |
    | 12s440ms857µs118ns |   10 | read-only path                                                           |
    | 12s440ms860µs848ns |   10 | read has no clock uncertainty                                            |
    | 12s440ms867µs261ns |   10 | command queue                                                            |
    | 12s440ms873µs171ns |   10 | waiting for read lock                                                    |
    | # Annotation: This is where we would have been if there hadn't been a conflict.                      |
    | 12s440ms913µs370ns |   10 | read completed                                                           |
    | 12s440ms961µs323ns |   10 | f4a8193b finished, leaving intent? false (owned by <nil>)                |
    | 12s441ms989µs325ns |    3 | execution ends                                                           |
    | 12s441ms991µs398ns |    3 | rows affected: 2                                                         |
    | 12s442ms22µs953ns  |    3 | AutoCommit. err: <nil>                                                   |
    | 12s442ms44µs376ns  |    0 | releasing 1 tables                                                       |
    | 12s442ms57µs49ns   |    0 | [NoTxn pos:35] executing Sync                                            |
    | 12s442ms449µs324ns |    0 | [NoTxn pos:36] executing ExecStmt: SHOW TRANSACTION STATUS               |
    | 12s442ms457µs347ns |    0 | executing: SHOW TRANSACTION STATUS in state: NoTxn                       |
    | 12s442ms466µs126ns |    0 | [NoTxn pos:37] executing Sync                                            |
    | 12s442ms586µs65ns  |    0 | [NoTxn pos:38] executing ExecStmt: SHOW database                         |
    | 12s442ms591µs342ns |    0 | executing: SHOW database in state: NoTxn                                 |
    | 12s442ms599µs279ns |    6 | === SPAN START: sql txn ===                                              |
    | 12s442ms621µs543ns |    6 | [Open pos:38] executing ExecStmt: SHOW database                          |
    | 12s442ms624µs632ns |    6 | executing: SHOW database in state: Open                                  |
    | 12s442ms639µs579ns |    6 | planning starts: SHOW                                                    |
    | 12s442ms641µs610ns |    6 | generating optimizer plan                                                |
    | 12s442ms657µs397ns |    6 | optimizer plan failed: unsupported statement: *tree.ShowVar              |
    | 12s442ms659µs345ns |    6 | optimizer falls back on heuristic planner                                |
    | 12s442ms666µs926ns |    6 | query is correlated: false                                               |
    | 12s442ms667µs859ns |    6 | heuristic planner starts                                                 |
    | 12s442ms765µs327ns |    6 | heuristic planner optimizes plan                                         |
    | 12s442ms811µs772ns |    6 | heuristic planner optimizes subqueries                                   |
    | 12s442ms812µs988ns |    6 | planning ends                                                            |
    | 12s442ms815µs950ns |    6 | checking distributability                                                |
    | 12s442ms825µs105ns |    6 | query not supported for distSQL: unsupported node *sql.valuesNode        |
    | 12s442ms826µs599ns |    6 | distributable plan: false                                                |
    | 12s442ms828µs79ns  |    6 | execution starts: local                                                  |
    | 12s442ms832µs803ns |    7 | === SPAN START: consuming rows ===                                       |
    | 12s442ms845µs752ns |    6 | execution ends                                                           |
    | 12s442ms846µs750ns |    6 | rows affected: 1                                                         |
    | 12s442ms860µs278ns |    6 | AutoCommit. err: <nil>                                                   |
    | 12s442ms869µs681ns |    0 | [NoTxn pos:39] executing Sync                                            |
    | 12s442ms975µs847ns |    0 | [NoTxn pos:40] executing ExecStmt: SHOW TRANSACTION STATUS               |
    | 12s442ms979µs816ns |    0 | executing: SHOW TRANSACTION STATUS in state: NoTxn                       |
    | 12s442ms987µs160ns |    0 | [NoTxn pos:41] executing Sync                                            |
    | 21s727ms852µs808ns |    0 | [NoTxn pos:42] executing ExecStmt: SHOW SYNTAX 'set tracing = off;'      |
    | 21s727ms875µs564ns |    0 | executing: SHOW SYNTAX 'set tracing = off;' in state: NoTxn              |
    | 21s727ms955µs982ns |    0 | [NoTxn pos:43] executing Sync                                            |
    | 21s728ms150µs348ns |    0 | [NoTxn pos:44] executing ExecStmt: SET TRACING = off                     |
    | 21s728ms163µs798ns |    0 | executing: SET TRACING = off in state: NoTxn                             |
    +--------------------+------+--------------------------------------------------------------------------+
    ~~~

### Trace a transaction retry

In this example, we use session tracing to show an [automatic transaction retry](transactions.html#automatic-retries). Like in the previous example, we'll have to use two terminals because retries are induced by unfortunate interactions between transactions.

1. In terminal 1, turn on trace recording and then start a transaction:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SET tracing = on;
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

    This read is performed at a timestamp higher than the timestamp of the transaction running in terminal 1. Because we're running at the [`SERIALIZABLE` transaction isolation level](architecture/transaction-layer.html#isolation-levels), if the system allows terminal 1's transaction to commit, it will have to ensure that ordering terminal 1's transaction *before* terminal 2's transaction is valid; this will become relevant in a second.

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

## See also

- [`EXPLAIN`](explain.html)
- [`SET (session settings)`](set-vars.html)
