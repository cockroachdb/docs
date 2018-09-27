---
title: EXPLAIN ANALYZE
summary: The EXPLAIN ANALYZE statement will execute the query and generate a physical query plan with execution statistics.
toc: true
---

<span class="version-tag">New in v2.1:</span> The `EXPLAIN ANALYZE` [statement](sql-statements.html) **will execute the SQL query** and return execution statistics.

The `DISTSQL` option generates a physical query plan for a distributed query. Query plans provide information around SQL execution, which can be used to troubleshoot slow queries by figuring out where time is being spent, how long a processor is not doing work, etc. For more information about distributed SQL queries, see the [DistSQL section](architecture/sql-layer.html#distsql) of our SQL Layer Architecture docs.

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/explain.html %}</section>

## Required privileges

The user requires the appropriate [privileges](privileges.html) for the statement being explained.

## Parameters

Parameter | Description
-----------|-----------
`DISTSQL` |  Generate a link to a distributed SQL physical query plan tree.
`explainable_stmt` | The [explainable statement](sql-grammar.html#explainable_stmt) you want details about.

## Success responses

For the `DISTSQL` option, successful `EXPLAIN ANALYZE` statements return a table with the following columns:

 Column | Description
--------|------------
automatic | If `true`, the query is distributed.
url | The URL generated for a physical query plan that provides high level information about how a query will be distributed. For more details about the physical query plan, see [DistSQL Plan Viewer](#distsql-plan-viewer).

#### DistSQL Plan Viewer

For `EXPLAIN ANALYZE (DISTSQL)`, the DistSQL Plan Viewer displays the physical query plan, as well as execution statistics:

Field | Description
------+------------
&lt;ProcessorName&gt;/&lt;n&gt; | The processor and processor ID used to read data into the SQL execution engine.
&lt;index&gt;@&lt;table&gt; | The index used.
Out | The output columns.
@&lt;n&gt; | The index of the column relative to the input.
&lt;function&gt; (@&lt;n&gt;) | The aggregation function used for any column.
Render | The stage that renders the output.
unordered / ordered | _(Blue box)_ A synchronizer that takes one or more output streams and merges them to be consumable by a processor. An ordered synchronizer is used to merge ordered streams and keeps the rows in sorted order.
left(@&lt;n&gt;)=right(@&lt;n&gt;) | The equality columns used in the join.
rows read | The number of rows read by the processor.
stall time | How long the processor spent not doing work. This is aggregated into the stall time numbers as the query progresses down the tree (i.e., stall time is added up and overlaps with previous time).
stored side | The smaller table that was stored as an in-memory hash table.
max memory used | How much memory (if any) is used to buffer rows.
by hash | _(Orange box)_ The router, which sends row results to a specific node to be aggregated.
max disk used | How much disk (if any) is used to buffer rows. The router will spill to disk buffering if there is not enough memory to buffer the rows.
rows routed | How many rows were sent by routers, which can be used to understand network usage.
bytes sent | The number of actual bytes sent (i.e., encoding of the rows). This is only relevant when doing network communication.
Response | The response back to the client.

{{site.data.alerts.callout_info}}
Any or all of the above fields may display for a given query plan.
{{site.data.alerts.end}}

## Example

`EXPLAIN ANALYZE (DISTSQL)` will execute the query and generate a physical query plan with execution statistics.

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN ANALYZE (DISTSQL) SELECT l_shipmode, AVG(l_extendedprice) FROM lineitem GROUP BY l_shipmode;
~~~

~~~
  automatic |                      url                      
+-----------+----------------------------------------------+
    true    | https://cockroachdb.github.io/distsqlplan...
~~~

Point your browser to the URL provided to view the [DistSQL Plan Viewer](#distsql-plan-viewer):

<img src="{{ 'images/v2.1/explain-analyze-distsql-plan.png' | relative_url }}" alt="EXPLAIN ANALYZE (DISTSQL)" style="border:1px solid #eee;max-width:100%" />

## See also

- [`ALTER TABLE`](alter-table.html)
- [`ALTER SEQUENCE`](alter-sequence.html)
- [`BACKUP`](backup.html)
- [`CANCEL JOB`](cancel-job.html)
- [`CREATE DATABASE`](create-database.html)
- [`DROP DATABASE`](drop-database.html)
- [`EXPLAIN`](explain.html)
- [`EXECUTE`](sql-grammar.html#execute_stmt)
- [`IMPORT`](import.html)
- [Indexes](indexes.html)
- [`INSERT`](insert.html)
- [`PAUSE JOB`](pause-job.html)
- [`RESET`](reset-vars.html)
- [`RESTORE`](restore.html)
- [`RESUME JOB`](resume-job.html)
- [`SELECT`](select-clause.html)
- [Selection Queries](selection-queries.html)
- [`SET`](set-vars.html)
- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`SHOW COLUMNS`](show-columns.html)
- [`UPDATE`](update.html)
- [`UPSERT`](upsert.html)
