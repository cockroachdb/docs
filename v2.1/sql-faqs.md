---
title: SQL FAQs
summary: Get answers to frequently asked questions about CockroachDB SQL.
toc: false
---

<div id="toc"></div>

## How do I bulk insert data into CockroachDB?

Currently, you can bulk insert data with batches of [`INSERT`](insert.html) statements not exceeding a few MB. The size of your rows determines how many you can use, but 1,000 - 10,000 rows typically works best. For more details, see [Import Data](import-data.html).

## How do I auto-generate unique row IDs in CockroachDB?

{% include faq/auto-generate-unique-ids_v1.1.html %}

## How do I generate unique, slowly increasing sequential numbers in CockroachDB?

{% include faq/sequential-numbers.md %}

## What are the differences between `UUID`, sequences and `unique_rowid()`?

{% include faq/differences-between-numberings.md %}

## How do I order writes to a table to closely follow time in CockroachDB?

{% include faq/sequential-transactions.md %}

## How do I get the last ID/SERIAL value inserted into a table?

There’s no function in CockroachDB for returning last inserted values, but you can use the [`RETURNING` clause](insert.html#insert-and-return-values) of the `INSERT` statement.

For example, this is how you’d use `RETURNING` to return an auto-generated [`SERIAL`](serial.html) value:

~~~ sql
> CREATE TABLE users (id SERIAL, name STRING);

> INSERT INTO users (name) VALUES ('mike') RETURNING id;
~~~

## Does CockroachDB support `JOIN`?

CockroachDB has basic, non-optimized support for SQL `JOIN`, whose performance we're working to improve.

To learn more, see our blog posts on CockroachDB's JOINs:
- [Modesty in Simplicity: CockroachDB's JOIN](https://www.cockroachlabs.com/blog/cockroachdbs-first-join/).
- [On the Way to Better SQL Joins](https://www.cockroachlabs.com/blog/better-sql-joins-in-cockroachdb/)

## When should I use interleaved tables?

[Interleaving tables](interleave-in-parent.html) improves query performance by optimizing the key-value structure of closely related tables, attempting to keep data on the same key-value range if it's likely to be read and written together.

{% include faq/when-to-interleave-tables.html %}

## Does CockroachDB support JSON or Protobuf datatypes?

Yes, as of v2.0, the [`JSONB`](jsonb.html) data type is supported.

## How do I know which index CockroachDB will select for a query?

To see which indexes CockroachDB is using for a given query, you can use the [`EXPLAIN`](explain.html) statement, which will print out the query plan, including any indexes that are being used:

~~~ sql
> EXPLAIN SELECT col1 FROM tbl1;
~~~

If you'd like to tell the query planner which index to use, you can do so via some [special syntax for index hints](table-expressions.html#force-index-selection):

~~~ sql
> SELECT col1 FROM tbl1@idx1;
~~~

## How do I log SQL queries?

There are several ways to log SQL queries.  The type of logging you use will depend on your requirements.

- For per-table audit logs, turn on [SQL audit logs](#sql-audit-logs).
- For system troubleshooting and performance optimization, turn on [cluster-wide execution logs](#cluster-wide-execution-logs).
- For local testing, turn on [per-node execution logs](#per-node-execution-logs).

### SQL audit logs

{% include experimental-warning.md %}

SQL audit logging is useful if you want to log all queries that are run against specific tables.

- For a tutorial, see [SQL Audit Logging](sql-audit-logging.html).

- For SQL reference documentation, see [`ALTER TABLE ... EXPERIMENTAL_AUDIT`](experimental-audit.html).

### Cluster-wide execution logs

For production clusters, the best way to log all queries is to turn on the [cluster-wide setting](cluster-settings.html) `sql.trace.log_statement_execute`:

~~~ sql
> SET CLUSTER SETTING sql.trace.log_statement_execute = true;
~~~

With this setting on, each node of the cluster writes all SQL queries it executes to its log file. When you no longer need to log queries, you can turn the setting back off:

~~~ sql
> SET CLUSTER SETTING sql.trace.log_statement_execute = false;
~~~

### Per-node execution logs

Alternatively, if you are testing CockroachDB locally and want to log queries executed just by a specific node, you can either pass a CLI flag at node startup, or execute a SQL function on a running node.

Using the CLI to start a new node, pass the `--vmodule` flag to the [`cockroach start`](start-a-node.html) command. For example, to start a single node locally and log all SQL queries it executes, you'd run:

~~~ shell
$ cockroach start --insecure --host=localhost --vmodule=exec_log=2
~~~

From the SQL prompt on a running node, execute the `crdb_internal.set_vmodule()` [function](functions-and-operators.html):

{% include copy-clipboard.html %}
~~~ sql
> select crdb_internal.set_vmodule('exec_log=2');
~~~

This will result in the following output:

~~~
+---------------------------+
| crdb_internal.set_vmodule |
+---------------------------+
|                         0 |
+---------------------------+
(1 row)
~~~

Once the logging is enabled, all of the node's queries will be written to the [CockroachDB log file](debug-and-error-logs.html) as follows:

~~~
I180402 19:12:28.112957 394661 sql/exec_log.go:173  [n1,client=127.0.0.1:50155,user=root] exec "psql" {} "SELECT version()" {} 0.795 1 ""
~~~

## Does CockroachDB support a UUID type?

Yes. For more details, see [`UUID`](uuid.html).

## How does CockroachDB sort results when `ORDER BY` is not used?

When an [`ORDER BY`](query-order.html) clause is not used in a query, rows are processed or returned in a
non-deterministic order. "Non-deterministic" means that the actual order
can depend on the logical plan, the order of data on disk, the topology
of the CockroachDB cluster, and is generally variable over time.

## Why are my `INT` columns returned as strings in JavaScript?

In CockroachDB, all `INT`s are represented with 64 bits of precision, but JavaScript numbers only have 53 bits of precision. This means that large integers stored in CockroachDB are not exactly representable as JavaScript numbers. For example, JavaScript will round the integer `235191684988928001` to the nearest representable value, `235191684988928000`. Notice that the last digit is different. This is particularly problematic when using the `unique_rowid()` [function](functions-and-operators.html), since `unique_rowid()` nearly always returns integers that require more than 53 bits of precision to represent.

To avoid this loss of precision, Node's [`pg` driver](https://github.com/brianc/node-postgres) will, by default, return all CockroachDB `INT`s as strings.

~~~ javascript
// Schema: CREATE TABLE users (id INT DEFAULT unique_rowid(), name STRING);
pgClient.query("SELECT id FROM users WHERE name = 'Roach' LIMIT 1", function(err, res) {
  var idString = res.rows[0].id;
  // idString === '235191684988928001'
  // typeof idString === 'string'
});
~~~

To perform another query using the value of `idString`, you can simply use `idString` directly, even where an `INT` type is expected. The string will automatically be coerced into a CockroachDB `INT`.

~~~ javascript
pgClient.query("UPDATE users SET name = 'Ms. Roach' WHERE id = $1", [idString], function(err, res) {
  // All should be well!
});
~~~

If you instead need to perform arithmetic on `INT`s in JavaScript, you will need to use a big integer library like [Long.js](https://www.npmjs.com/package/long). Do _not_ use the built-in `parseInt` function.

~~~ javascript
parseInt(idString, 10) + 1; // WRONG: returns 235191684988928000
require('long').fromString(idString).add(1).toString(); // GOOD: returns '235191684988928002'
~~~

## See Also

- [Product FAQs](frequently-asked-questions.html)
- [Operational FAQS](operational-faqs.html)
