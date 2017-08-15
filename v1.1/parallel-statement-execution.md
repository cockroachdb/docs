---
title: Parallel Statement Execution
summary: The parallel statement execution feature allows parallel execution of multiple independent SQL statements within a transaction.
toc: false
---

CockroachDB supports parallel execution of independent [`INSERT`](insert.html), [`UPDATE`](update.html), [`UPSERT`](upsert.html), and [`DELETE`](delete.html) statements within a single transaction. Parallel execution of SQL statements reduces the overall execution time of multiple SQL statements.

<div id="toc"></div>

## Why Use Parallel Statement Execution

To maintain strong consistency across a globally-distributed cluster, CockroachDB replicates writes using the [consensus protocol](https://www.cockroachlabs.com/blog/consensus-made-thrive/). The protocol requires majority of replicas to agree on a write before committing it. Thus writes to CockroachDB require coordination between globally-distributed nodes. Communication between these nodes takes time and contributes to communication latency. Executing SQL statements sequentially, as in traditional SQL engines, leads to higher cumulative communication latency.

Parallel execution of statements can help reduce the communication latency. With parallel statement execution, multiple SQL statements within a transaction are executed at the same time, thereby reducing the aggregate latency over multiple SQL statements. 

## How Parallel Statement Execution Works

SQL statements within a single transaction can be executed in parallel if the statements are independent. CockroachDB considers SQL statements within a single transaction to be independent if they operate on independent tables and their execution can be safely reordered without affecting their results. 

Normal execution of SQL statements returns a return value immediately from the server. After the return value is received, the next SQL statement is executed. Appending the `RETURNING NOTHING` clause with SQL statements prevents the server from sending return values and allows CockroachDB to execute the statements in parallel. Thus to execute statements in parallel, append the `RETURNING NOTHING` suffix to the SQL statements. 

### `RETURNING NOTHING` clause appended to dependent statements

If two consecutive statements are not independent, and yet a `RETURNING NOTHING` clause is added to the statements, CockroachDB will detect the dependence and serialize the execution. You can thus use the `RETURNING NOTHING` clause with SQL statements without worrying about their dependence.

### Delayed execution of sequentially-executed statements 

The SQL statements to be executed in parallel should have a `RETURNING NOTHING` clause, while sequentially-executed statements do not have the `RETURNING NOTHING` clause. Consider a scenario where a sequentially-executed SQL statement follows a batch of parallely-executed statements within a single transaction. The sequentially-executed statement will be executed after all the parallel statements are done executing. Thus it may seem as if the sequentially-executed statement is taking longer to execute, but it's in fact waiting on the parallel statements. Even then, the total time required for parallel execution of statements followed by the sequential execution of the SQL statement should be less than time required for the sequential execution of all statements. 

### Error message handling with 

It is possible to see a mismatch in the error message being displayed and the statement being executed. Consider a scenario where a sequentially-executed statement is executed after a batch of statements executed in parallel, and one of the parallel statements results in an error. Now because the `RETURNING NOTHING` clause is used with the parallel statements, CockroachDB cannot return the error for the parallel statement. The error message for the parallel statement is then reported on the next sequential statement. Thus you might see a mismatch with the error message to the statement being executed. 

On encountering the error, CockroachDB will stop the execution of all parallel statements and [abort and retry the transaction](transactions.html#error-handling). So even an error message mismatch occurs, the result will be the same as aborting the transaction.

## Independent SQL statements

As mentioned earlier, CockroachDB considers SQL statements within a single transaction to be independent if they operate on independent tables and their execution can be safely reordered without affecting their results. 

For example, the following statements are considered independent since they operate on two independent tables and reordering the statements will not affect the results:

~~~ sql
> INSERT INTO a VALUES (100);
> INSERT INTO b VALUES (100);
~~~

The following statements are not considered independent since they operate on the same table:

~~~ sql
> INSERT INTO a VALUES (100);
> INSERT INTO a VALUES (200);
~~~

The following pairs of statements are dependent since reordering them will affect their results:

~~~ sql
> UPDATE a SET b = 2 WHERE y = 1;
> UPDATE a SET b = 3 WHERE y = 1;
~~~

~~~ sql
> UPDATE a SET y = true  WHERE y = false;
> UPDATE a SET y = false WHERE y = true;
~~~

## Required Privileges

The user must have the `INSERT`, `UPDATE`, `DELETE`, and `UPSERT` [privileges](privileges.html) on the table.


## Example

~~~ sql
> SELECT * FROM accounts;
~~~

~~~
+----+---------+----------+
| id | balance | customer |
+----+---------+----------+
|  1 |  1000.0 | Ilya     |
|  2 |  2000.0 | Nitin    |
|  3 |  3000.0 | Pam      |
+----+---------+----------+
(3 rows)
~~~

~~~ sql
> BEGIN; 
> INSERT INTO accounts(id, balance, customer) VALUES (4, 3782, 'Heer') RETURNING NOTHING; 
> INSERT INTO accounts(id, balance, customer) VALUES (5, 9887, 'Julio') RETURNING NOTHING; 
> UPDATE accounts SET balance = 1099 WHERE id = 2 RETURNING NOTHING;
> COMMIT;
~~~

~~~ sql
SELECT * FROM accounts;
~~~

~~~
+----+---------+----------+
| id | balance | customer |
+----+---------+----------+
|  1 |  1000.0 | Ilya     |
|  2 |    1099 | Nitin    |
|  3 |  3000.0 | Pam      |
|  4 |    3782 | Heer     |
|  5 |    9887 | Julio    |
+----+---------+----------+
(5 rows)
~~~

The execution timeline for the parallel execution of the statements is:

BEGIN &nbsp; &nbsp; &nbsp; INSERT-----\INSERT &nbsp; &nbsp; &nbsp; COMMIT
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; INSERT-----\INSERT </p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; UPDATE-----\UPDATE </p>

{{site.data.alerts.callout_info}}Parallel statement execution in CockroachDB is different than parallel query execution in PostgreSQL. For PostgreSQL, parallel query execution refers to “creating multiple query processes that divide the workload of a single SQL statement and executing them in parallel”. For CockroachDB’s parallel statement execution, an individual SQL statement is not divided into processes. Instead, multiple independent SQL statements within a single transaction are executed in parallel.{{site.data.alerts.end}}

## See Also

- [`INSERT`](insert.html)
- [`UPDATE`](update.html)
- [`DELETE`](delete.html)
- [`UPSERT`](upsert.html)
