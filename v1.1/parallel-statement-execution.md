---
title: Parallel Statement Execution
summary: The parallel statement execution feature allows parallel execution of multiple independent SQL statements within a transaction.
toc: false
---

CockroachDB supports parallel execution of independent [`INSERT`](insert.html), [`UPDATE`](update.html), [`UPSERT`](upsert.html), and [`DELETE`](delete.html) statements within a single [transaction](https://www.cockroachlabs.com/docs/dev/transactions.html). Executing statements in parallel helps reduce aggregate latency and improve performance. 

<div id="toc"></div>

## Why Use Parallel Statement Execution

To understand why parallel statement execution is required, let's consider a sample scenario to demonstrate how SQL statements are executed. 

Consider a scenario where a user's last name, favorite movie, and favorite song are to be updated on a social networking application. Suppose the database has three tables: username, movies, and songs, that need to be updated to update the user information. Also suppose that the user's ID is 1. Then the traditional transaction to update the user's information is as follows:

~~~ sql
> BEGIN;
> UPDATE username SET last_name = 'Smith' WHERE id = 1;
> UPDATE movies SET favorite_movie = 'The Matrix' WHERE id = 1;
> UPDATE songs SET favorite_song = 'All this time' WHERE id = 1;
> COMMIT;
~~~

In this case, the statements are executed sequentially. Sequential execution of SQL statements returns a return value immediately from the server. After the return value is received, the next SQL statement is executed. The following conceptual diagram shows the sequential execution of the statements.

<img src="{{ 'images/Sequential_Statement_Execution.png' | relative_url }}" alt="CockroachDB Parallel Statement Execution Error Mismatch" style="border:1px solid #eee;max-width:100%" />

Traditional SQL engines execute the statements sequentially without affecting performance. But in case of globally-distributed CockroachDB clusters, sequential execution of statements adds to aggregate latency. This is because to maintain strong consistency across a globally-distributed cluster, CockroachDB replicates writes using the Raft [consensus protocol](https://www.cockroachlabs.com/blog/consensus-made-thrive/). The protocol requires majority of replicas to agree before a write is committed. Replicas always live on separate nodes, and communication between these nodes takes time. Executing SQL statements sequentially leads to higher cumulative communication latency. 

With parallel statement execution, however, multiple SQL statements within a transaction are executed at the same time, thereby reducing the aggregate latency over multiple SQL statements. 

## How Parallel Statement Execution Works

SQL statements within a single transaction can be executed in parallel if the statements are independent. CockroachDB considers SQL statements within a single transaction to be independent if their execution can be safely reordered without affecting their results. 

As seen earlier, sequential execution of SQL statements returns a return value immediately from the server. The next statement is executed only after the return value is received. Appending the `RETURNING NOTHING` clause with SQL statements prevents the server from sending return values and allows CockroachDB to execute the statements in parallel. To execute statements in parallel, append the `RETURNING NOTHING` suffix to the SQL statements. The statements are executed in parallel till CockroachDB encounters a **barrier statement**. A barrier statement is a statement that needs to be executed sequentially.

In our example, the transaction would be as follows:

~~~ sql
> BEGIN;
> UPDATE username SET last_name = 'Smith' WHERE id = 1 RETURNING NOTHING;
> UPDATE movies SET favorite_movie = 'The Matrix' WHERE id = 1 RETURNING NOTHING;
> UPDATE songs SET favorite_song = 'All this time' WHERE id = 1 RETURNING NOTHING;
> COMMIT;
~~~

In this case, because the statements within the transaction are independent of each other, they can be executed in parallel without affecting the results. The COMMIT statement is executed sequentially, and thus acts as a barrier statement. Barrier statements are executed only after all the parallel statements are executed.

The following conceptual diagram shows how the transaction is executed sequentially and in parallel. The diagram also shows how executing statements in parallel reduces the aggregate latency.

<img src="{{ 'images/Parallel_Statement_Normal_Execution.png' | relative_url }}" alt="CockroachDB Parallel Statement Execution" style="border:1px solid #eee;max-width:100%" />

### Perceived delay in execution of barrier statements 

As stated earlier, barrier statements are executed only after all parallel statements are executed. Thus it may seem as if the barrier statement is taking longer to execute, but it's in fact waiting on the parallel statements. Even then, the total time required for parallel execution of statements followed by the sequential execution of the SQL statement should be less than time required for the sequential execution of all statements. 

Referring to the previous diagram, all UPDATE statements are executed before executing COMMIT. Hence it might seem as if COMMIT is taking longer to execute, but it is, in fact, waiting on the UPDATE statements to be executed.

### Error message mismatch

In case of parallel statement execution, it is possible to see a mismatch in the error message being displayed and the statement being executed. 

Because the `RETURNING NOTHING` clause is used with parallel statements, CockroachDB cannot return the error for the parallel statement. The error message for the parallel statement is then reported on the next barrier statement. Thus you might see a mismatch with the error message to the statement being executed. 

On encountering the error, CockroachDB will stop the execution of all parallel statements and [abort and retry the transaction](transactions.html#error-handling). So even an error message mismatch occurs, the result will be the same as aborting the transaction.

Revisiting our sample scenario, suppose an error occurs while executing the second UPDATE statement. In sequential execution, the transaction will be aborted and the error message will be sent immediately. But in case of parallel execution, the transaction will be aborted and error message will be sent after COMMIT. The following diagram illustrates the concept of error message mismatch:

<img src="{{ 'images/Parallel_Statement_Execution_Error_Mismatch.png' | relative_url }}" alt="CockroachDB Parallel Statement Execution Error Mismatch" style="border:1px solid #eee;max-width:100%" />

### `RETURNING NOTHING` clause appended to dependent statements

If two consecutive statements are not independent, and yet a `RETURNING NOTHING` clause is added to the statements, CockroachDB will detect the dependence and serialize the execution. You can thus use the `RETURNING NOTHING` clause with SQL statements without worrying about their dependence.

Revising our sample scenario, suppose we want to create a new user on the social networking app. We need to create entries for the last name of the user, their favorite movie, and favorite song. We need to insert entries into three tables: username, movies, and songs. The transaction would be as follows:

~~~ sql
> BEGIN;
> id = 2;
> INSERT INTO username VALUES last_name = 'Pavlo' WHERE id = 2 RETURNING NOTHING;
> INSERT INTO movies VALUES favorite_movie = 'Godfather' WHERE id = 2 RETURNING NOTHING;
> INSERT INTO songs VALUES favorite_song = 'Remember' WHERE id = 2 RETURNING NOTHING;
> COMMIT;
~~~

In this case, the second and third INSERT statements are dependent on the first INSERT statement. Thus even though we appended the RETURNING NOTHING clause to the first statement, CockroachDB will execute the first statement sequentially. After the first statement is executed, the second and third statements will be executed in parallel. The following conceptual diagram shows how the transaction will be executed in sequential and parallel modes:

<img src="{{ 'images/Parallel_Statement_Hybrid_Execution.png' | relative_url }}" alt="CockroachDB Parallel Statement Hybrid Execution" style="border:1px solid #eee;max-width:100%" />

## Independent SQL statements

As mentioned earlier, CockroachDB considers SQL statements within a single transaction to be independent if their execution can be safely reordered without affecting their results. 

For example, the following statements are considered independent since reordering the statements will not affect the results:

~~~ sql
> INSERT INTO a VALUES (100);
> INSERT INTO b VALUES (100);
~~~

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


{{site.data.alerts.callout_info}}Parallel statement execution in CockroachDB is different than parallel query execution in PostgreSQL. For PostgreSQL, parallel query execution refers to “creating multiple query processes that divide the workload of a single SQL statement and executing them in parallel”. For CockroachDB’s parallel statement execution, an individual SQL statement is not divided into processes. Instead, multiple independent SQL statements within a single transaction are executed in parallel.{{site.data.alerts.end}}

## See Also

- [`INSERT`](insert.html)
- [`UPDATE`](update.html)
- [`DELETE`](delete.html)
- [`UPSERT`](upsert.html)
