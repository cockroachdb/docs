---
title: EXPLAIN
summary: The EXPLAIN statement provides information you can use to optimize SQL queries.
toc: true
---

The `EXPLAIN` [statement](sql-statements.html) returns CockroachDB's query plan for an [explainable statement](#explainable-statements). You can then use this information to optimize the query.


## Explainable Statements

You can use `EXPLAIN` on the following statements:

- [`ALTER TABLE`](alter-table.html)
- [`CREATE DATABASE`](create-database.html), [`CREATE INDEX`](create-index.html), [`CREATE TABLE`](create-table.html), [`CREATE TABLE AS`](create-table-as.html), [`CREATE USER`](create-user.html), [`CREATE VIEW`](create-view.html)
- [`DELETE`](delete.html)
- `EXPLAIN`
- [`INSERT`](insert.html)
- [`SELECT`](select.html)
- [`SHOW COLUMNS`](show-columns.html), [`SHOW CONSTRAINTS`](show-constraints.html), [`SHOW CREATE TABLE`](show-create-table.html), [`SHOW CREATE VIEW`](show-create-view.html), [`SHOW CLUSTER SETTING`](show-cluster-setting.html), [`SHOW DATABASES`](show-databases.html), [`SHOW GRANTS`](show-grants.html), [`SHOW INDEX`](show-index.html), [`SHOW TABLES`](show-tables.html), [`SHOW USERS`](show-users.html)
- [`UPDATE`](update.html)

## Query Optimization

Using `EXPLAIN`'s output, you can optimize your queries by taking the following points into consideration:

- Queries with fewer levels execute more quickly. Restructuring queries to require fewer levels of processing will generally improve performance.

- Avoid scanning an entire table, which is the slowest way to access data. You can avoid this by [creating indexes](indexes.html) that contain at least one of the columns that the query is filtering in its `WHERE` clause.

You can find out if your queries are performing entire table scans by using `EXPLAIN` to see which:

- Indexes the query uses; shown as the **Description** value of rows with the **Field** value of `table`

- Key values in the index are being scanned; shown as the **Description** value of rows with the **Field** value of `spans`

For more information, see [Find the Indexes and Key Ranges a Query Uses](#find-the-indexes-and-key-ranges-a-query-uses).

## Synopsis

{% include {{ page.version.version }}/sql/diagrams/explain.html %}

## Required Privileges

The user requires the appropriate [privileges](privileges.html) for the statement being explained.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `EXPRS` | Include the SQL expressions that are involved in each processing stage. |
| `QUALIFY` | Include table names when referencing columns, which might be important to verify the behavior of joins across tables with the same column names.<br/><br/>To list qualified names, `QUALIFY` requires you to include the `EXPRS` option. |
| `METADATA` | Include the columns each level uses in the **Columns** column, as well as **Ordering** detail. |
| `VERBOSE`  | Imply the `EXPRS`, `METADATA`, and `QUALIFY` options. |
| `TYPES` | Include the intermediate [data types](data-types.html) CockroachDB chooses to evaluate intermediate SQL expressions. <br/><br/>`TYPES` also implies `METADATA` and `EXPRS` options.|
| `explainable_stmt` | The [statement](#explainable-statements) you want details about. |

{{site.data.alerts.callout_danger}}<code>EXPLAIN</code> also includes other modes besides query plans that are useful only to CockroachDB developers, which are not documented here.{{site.data.alerts.end}}

## Success Responses

Successful `EXPLAIN` statements return tables with the following columns:

| Column | Description |
|-----------|-------------|
| **Level** | The level of hierarchy of the query plan. <br/><br/>`0` represents the last processing stage that produces the results sent to the SQL client receiving the data; the highest level represents the operation at the key-value layer accessing data. <br/><br/>The query plan has a tree structure; it is thus possible to see multiple processing stages at the same level, which indicates they are sibling stages feeding data to the previous processing stage with a lower level.|
| **Type** | The query plan node's type, which are described in the [CockroachDB source on GitHub](https://github.com/cockroachdb/cockroach/pull/10055/files#diff-542aa8b21b245d1144c920577333ceedR764). |
| **Field** | The type of parameter being used by the query plan node. |
| **Description** | Additional information describing the **Field** value. |
| **Columns** | The columns provided to the processes at lower levels of the hierarchy. <br/><br>This column displays only if the `METADATA` option is specified or implied. |
| **Ordering** | The order in which results are presented to the processes at lower levels of the hierarchy. <br/><br>This column displays only if the `METADATA` option is specified or implied. |

## Examples

### Default Query Plans

By default, `EXPLAIN` includes the least detail about the query plan but can be useful to find out which indexes and keys a query uses.

~~~ sql
> EXPLAIN SELECT * FROM kv WHERE v > 3 ORDER BY v;
~~~
~~~
+-------+------+-------+-------------+
| Level | Type | Field | Description |
+-------+------+-------+-------------+
|     0 | sort |       |             |
|     0 |      | order | +v          |
|     1 | scan |       |             |
|     1 |      | table | kv@primary  |
|     1 |      | spans | ALL         |
+-------+------+-------+-------------+
~~~

### `EXPRS` Option

The `EXPRS` option includes SQL expressions that are involved in each processing stage, providing more granular detail about which portion of your query is represented at each level.

~~~ sql
> EXPLAIN (EXPRS) SELECT * FROM kv WHERE v > 3 ORDER BY v;
~~~
~~~
+-------+------+--------+-------------+
| Level | Type | Field  | Description |
+-------+------+--------+-------------+
|     0 | sort |        |             |
|     0 |      | order  | +v          |
|     1 | scan |        |             |
|     1 |      | table  | kv@primary  |
|     1 |      | spans  | ALL         |
|     1 |      | filter | v > 3       |
+-------+------+--------+-------------+
~~~

### `METADATA` Option

The `METADATA` option includes detail about which columns are being used by each level, as well as how columns are being ordered.

~~~ sql
> EXPLAIN (METADATA) SELECT * FROM kv WHERE v > 3 ORDER BY v;
~~~
~~~
+-------+------+-------+-------------+---------+--------------+
| Level | Type | Field | Description | Columns |   Ordering   |
+-------+------+-------+-------------+---------+--------------+
|     0 | sort |       |             | (k, v)  | +v           |
|     0 |      | order | +v          |         |              |
|     1 | scan |       |             | (k, v)  | +k,+v,unique |
|     1 |      | table | kv@primary  |         |              |
|     1 |      | spans | ALL         |         |              |
+-------+------+-------+-------------+---------+--------------+
~~~

When looking at the **Ordering** column, we can also sort by descending (`DESC`) values of `k`, which is indicated by the `-` sign.

~~~ sql
> EXPLAIN (METADATA) SELECT * FROM kv WHERE v > 3 ORDER BY v DESC;
~~~
~~~
+-------+------+-------+-------------+---------+--------------+
| Level | Type | Field | Description | Columns |   Ordering   |
+-------+------+-------+-------------+---------+--------------+
|     0 | sort |       |             | (k, v)  | -v           |
|     0 |      | order | -v          |         |              |
|     1 | scan |       |             | (k, v)  | +k,+v,unique |
|     1 |      | table | kv@primary  |         |              |
|     1 |      | spans | ALL         |         |              |
+-------+------+-------+-------------+---------+--------------+
~~~

{{site.data.alerts.callout_info}}In some cases the <strong>Ordering</strong> details report a column ordering with an equal sign (e.g., <code>=k</code>). This is a side effect of the internal ordering analysis performed by CockroachDB and merely indicates that CockroachDB has found that only one row matches a <code>WHERE</code> expression.{{site.data.alerts.end}}

### `QUALIFY` Option

`QUALIFY` uses `<table name>.<column name>` notation for columns in the query plan. However, `QUALIFY` must be used with `EXPRS` to show the SQL values used.

~~~ sql
> EXPLAIN (EXPRS, QUALIFY) SELECT a.v, b.v FROM t.kv AS a, t.kv AS b;
~~~
~~~
+-------+--------+----------+-------------+
| Level |  Type  |  Field   | Description |
+-------+--------+----------+-------------+
|     0 | render |          |             |
|     0 |        | render 0 | a.v         |
|     0 |        | render 1 | b.v         |
|     1 | join   |          |             |
|     1 |        | type     | cross       |
|     2 | scan   |          |             |
|     2 |        | table    | kv@primary  |
|     2 | scan   |          |             |
|     2 |        | table    | kv@primary  |
+-------+--------+----------+-------------+
~~~

You can contrast this with the same statement not including the `QUALIFY` option to see that the column references are not qualified, which can lead to ambiguity if multiple tables have columns with the same names.

~~~ sql
>  EXPLAIN (EXPRS) SELECT a.v, b.v FROM t.kv AS a, t.kv AS b;
~~~
~~~
+-------+--------+----------+-------------+
| Level |  Type  |  Field   | Description |
+-------+--------+----------+-------------+
|     0 | render |          |             |
|     0 |        | render 0 | v           |
|     0 |        | render 1 | v           |
|     1 | join   |          |             |
|     1 |        | type     | cross       |
|     2 | scan   |          |             |
|     2 |        | table    | kv@primary  |
|     2 | scan   |          |             |
|     2 |        | table    | kv@primary  |
+-------+--------+----------+-------------+
~~~

### `VERBOSE` Option

The `VERBOSE` option implies the `EXPRS`, `METADATA`, and `QUALIFY` options.

~~~ sql
> EXPLAIN (VERBOSE) SELECT * FROM kv AS a JOIN kv USING (k) WHERE a.v > 3 ORDER BY a.v DESC;
~~~
~~~
+-------+--------+----------+-------------+-------------------------------------------------+--------------+
| Level |  Type  |  Field   | Description |                     Columns                     |   Ordering   |
+-------+--------+----------+-------------+-------------------------------------------------+--------------+
|     0 | sort   |          |             | (k, v, v)                                       | -v           |
|     0 |        | order    | -v          |                                                 |              |
|     1 | render |          |             | (k, v, v)                                       |              |
|     1 |        | render 0 | k           |                                                 |              |
|     1 |        | render 1 | a.v         |                                                 |              |
|     1 |        | render 2 | bank.kv.v   |                                                 |              |
|     2 | join   |          |             | (k, k[hidden,omitted], v, k[hidden,omitted], v) |              |
|     2 |        | type     | inner       |                                                 |              |
|     2 |        | equality | (k) = (k)   |                                                 |              |
|     3 | scan   |          |             | (k, v)                                          | +k,+v,unique |
|     3 |        | table    | kv@primary  |                                                 |              |
|     3 |        | spans    | ALL         |                                                 |              |
|     3 |        | filter   | v > 3       |                                                 |              |
|     3 | scan   |          |             | (k, v)                                          | +k,+v,unique |
|     3 |        | table    | kv@primary  |                                                 |              |
+-------+--------+----------+-------------+-------------------------------------------------+--------------+
~~~

### `TYPES` Option

The `TYPES` mode includes the types of the values used in the query plan, as well as implying the `METADATA` and `EXPRS` options.

~~~ sql
> EXPLAIN (TYPES) SELECT * FROM kv WHERE v > 3 order by v;
~~~
~~~
+-------+------+--------+-----------------------------+----------------+--------------+
| Level | Type | Field  |         Description         |    Columns     |   Ordering   |
+-------+------+--------+-----------------------------+----------------+--------------+
|     0 | sort |        |                             | (k int, v int) | +v           |
|     0 |      | order  | +v                          |                |              |
|     1 | scan |        |                             | (k int, v int) | +k,+v,unique |
|     1 |      | table  | kv@primary                  |                |              |
|     1 |      | spans  | ALL                         |                |              |
|     1 |      | filter | ((v)[int] > (3)[int])[bool] |                |              |
+-------+------+--------+-----------------------------+----------------+--------------+
~~~

### Find the Indexes and Key Ranges a Query Uses

You can use `EXPLAIN` to understand which indexes and key ranges queries use, which can help you ensure a query isn't performing a full table scan.

~~~ sql
> CREATE TABLE kv (k INT PRIMARY KEY, v INT);
~~~

Because column `v` is not indexed, queries filtering on it alone scan the entire table:

~~~ sql
> EXPLAIN SELECT * FROM kv WHERE v BETWEEN 4 AND 5;
~~~
~~~
+-------+------+-------+-------------+
| Level | Type | Field | Description |
+-------+------+-------+-------------+
|     0 | scan |       |             |
|     0 |      | table | kv@primary  |
|     0 |      | spans | ALL         |
+-------+------+-------+-------------+
~~~

However, in the following query, column `k` is sorted in the `primary` index, so CockroachDB can avoid scanning the entire table:

~~~ sql
> EXPLAIN SELECT * FROM kv WHERE k BETWEEN 4 AND 5;
~~~
~~~
+-------+------+-------+-------------+
| Level | Type | Field | Description |
+-------+------+-------+-------------+
|     0 | scan |       |             |
|     0 |      | table | kv@primary  |
|     0 |      | spans | /4-/6       |
+-------+------+-------+-------------+
~~~

## See Also

- [`ALTER TABLE`](alter-table.html)
- [`CREATE DATABASE`](create-database.html)
- [`CREATE TABLE`](create-table.html)
- [`DELETE`](delete.html)
- [Indexes](indexes.html)
- [`INSERT`](insert.html)
- [`SELECT`](select.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`SHOW CREATE TABLE`](show-create-table.html)
- [`UPDATE`](update.html)
