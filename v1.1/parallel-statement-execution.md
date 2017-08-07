---
title: Parallel Statement Execution
summary: The parallel statement execution feature allows parallel execution of multiple independent SQL statements within a transaction.
toc: false
---

CockroachDB supports parallel execution of independent INSERT, UPDATE, UPSERT, and DELETE statements within a single transaction. 

To execute statements in parallel, use the `RETURNING NOTHING` clause for the independent SQL statements.

<div id="toc"></div>

## Independent SQL statements

CockroachDB considers SQL statements to be independent if they operate on independent tables and their execution can be safely reordered without affecting their results. 

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


## Examples

### Executing independent SQL statements in parallel

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

The execution timeline for the parallel execution of the independent statements is:

BEGIN &nbsp; &nbsp; &nbsp; INSERT-----\INSERT &nbsp; &nbsp; &nbsp; COMMIT
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; INSERT-----\INSERT </p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; UPDATE-----\UPDATE </p>


### Handling independent and dependent SQL statements  

If two consecutive statements are not independent, and yet a `RETURNING NOTHING` clause is added to the statements, CockroachDB will detect the dependence and serialize the execution. You can thus use the `RETURNING NOTHING` clause with SQL statements without worrying about their dependence.

~~~ sql
> BEGIN; 
> INSERT INTO accounts(id, balance, customer) VALUES (6, 2563, 'Enzo') RETURNING NOTHING;
> UPDATE accounts SET balance = 3420 WHERE id = 1 RETURNING NOTHING;
> UPDATE accounts SET balance = 9200 WHERE id = 1 RETURNING NOTHING;
> COMMIT;
~~~

The execution timeline for the parallel execution of the statements is:

BEGIN &nbsp; &nbsp; &nbsp; INSERT-----\INSERT &nbsp; &nbsp; &nbsp; UPDATE-----\UPDATE &nbsp; &nbsp; &nbsp; COMMIT
 <p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; UPDATE-----\UPDATE </p>


If you execute a dependent statement after running a batch of independent statements, the dependent statement is executed after all the independent statements are done executing. Thus it may seem as if the dependent statement is taking longer to execute, but it's in fact waiting on the independent statements. Even then, the total time required for parallel execution of independent statements followed by the execution of the dependent statement should be less than time required for the sequential execution of all statements. 

### Handling error message mismatch 

It is possible to see a mismatch in the error message being displayed and the transaction being executed. Consider a scenario where a dependent statement is executed after a batch of independent statements, and one of the independent statements results in an error. Now because the `RETURNING NOTHING` clause is used with the independent statements, CockroachDB cannot return the error for the independent statement. The error message for the independent statement is then reported on the next dependent statement. Thus you might see a mismatch with the error message to the statement being executed. 

On encountering the error, CockroachDB will stop the execution of all parallel statements and [abort and retry the transaction](transactions.html#error-handling). So even if there is an error message mismatch, the result will be the same as aborting the transaction.

{{site.data.alerts.callout_info}}Parallel statement execution in CockroachDB is different than parallel query execution in PostgreSQL. For PostgreSQL, parallel query execution refers to “creating multiple query processes that divide the workload of a single SQL statement and executing them in parallel”. For CockroachDB’s parallel statement execution, an individual SQL statement is not divided into query processes. Instead, multiple independent SQL statements within a single transaction are executed in parallel.{{site.data.alerts.end}}

## See Also

- [`INSERT`](insert.html)
- [`UPDATE`](update.html)
- [`DELETE`](delete.html)
- [`UPSERT`](upsert.html)
