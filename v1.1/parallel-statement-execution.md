---
title: Parallel Statement Execution
summary: The parallel statement execution feature allows parallel execution of multiple independent SQL statements within a transaction.
toc: false
---

CockroachDB supports parallel execution of independent [`INSERT`](insert.html), [`UPDATE`](update.html), [`UPSERT`](upsert.html), and [`DELETE`](delete.html) statements within a single [transaction](https://www.cockroachlabs.com/docs/dev/transactions.html). Executing statements in parallel helps reduce aggregate latency and improve performance. 

<div id="toc"></div>

## Why Use Parallel Statement Execution

To understand why parallel statement execution is required, let's first understand sequential execution of SQL statements.

Consider a scenario where we want to update a user's last name, favorite movie, and favorite song on a social networking application. Suppose the database has three tables: users, favorite_movies, and favorite_songs, that need to be updated to update the user information. Then the traditional transaction to update the user's information is as follows:

~~~ sql
> BEGIN;
> UPDATE users SET last_name = 'Smith' WHERE id = 1;
> UPDATE favorite_movies SET movies = 'The Matrix' WHERE user_id = 1;
> UPDATE favorite_songs SET songs = 'All this time' WHERE user_id = 1;
> COMMIT;
~~~

In this case, the server executes each statement to completion and sends the return value of each statement to the client. Only after the client receives the return value of a statement, it sends the next SQL statement to be executed. This is often described as a "conversational API," as demonstrated by the following conceptual diagram:

<img src="{{ 'images/Sequential_Statement_Execution.png' | relative_url }}" alt="CockroachDB Parallel Statement Execution Error Mismatch" style="border:1px solid #eee;max-width:100%" />

SQL engines traditionally execute the statements sequentially. In case of single-node databases, execution of the statements does not involve any communication latency. However, in case of globally-distributed CockroachDB clusters, statement execution results in communication latency. To maintain strong consistency across a globally-distributed cluster, CockroachDB replicates writes using the Raft [consensus protocol](https://www.cockroachlabs.com/blog/consensus-made-thrive/). The protocol requires a majority of replicas to agree before a write is committed. Replicas always live on separate nodes, and communication between these nodes takes time. Executing SQL statements sequentially, especially when each statement requires long-distance communication, leads to higher cumulative latency.

With parallel statement execution, however, multiple SQL statements within a transaction are executed at the same time, thereby reducing the aggregate latency over multiple SQL statements. 

## How Parallel Statement Execution Works

SQL statements within a single transaction can be executed in parallel if the statements are independent. CockroachDB considers SQL statements within a single transaction to be independent if their execution can be safely reordered without affecting their results. 

As seen earlier, while executing SQL statements sequentially, the server sends a return value after executing a statement. The client can send the next statement to be executed only after it receives the return value of the previous statement. To execute statements in parallel, the client should be able to send the next statement to be executed without waiting for the return value of the earlier statement. In CockroachDB, on appending the `RETURNING NOTHING` clause with SQL statements,  the server sends an acknowledgment immediately, instead of waiting to complete the statement execution and then sending the return value to the client. The client sends the next statement to be executed on receiving the acknowledgment. This allows CockroachDB to execute the statements in parallel. The statements are executed in parallel until CockroachDB encounters a **barrier statement**. A barrier statement is any statement without the `RETURNING NOTHING` clause. The server executes a barrier statement sequentially.

In our sample scenario, the transaction would be as follows:

~~~ sql
> BEGIN;
> UPDATE users SET last_name = 'Smith' WHERE id = 1 RETURNING NOTHING;
> UPDATE favorite_movies SET movies = 'The Matrix' WHERE user_id = 1 RETURNING NOTHING;
> UPDATE favorite_songs SET songs = 'All this time' WHERE user_id = 1 RETURNING NOTHING;
> COMMIT;
~~~

In this case, because the `UPDATE` statements within the transaction are independent of each other, they can be executed in parallel without affecting the results. The `COMMIT` statement is the barrier statement and is executed sequentially. A barrier statement is executed only after all the parallel statements preceding it have finished executing.

The following conceptual diagram shows how the transaction is executed sequentially and in parallel. The diagram also shows how executing statements in parallel reduces the aggregate latency.

<img src="{{ 'images/Parallel_Statement_Normal_Execution.png' | relative_url }}" alt="CockroachDB Parallel Statement Execution" style="border:1px solid #eee;max-width:100%" />

### Perceived delay in execution of barrier statements 

As stated earlier, the server executes a barrier statement only after all the preceding parallel statements have finished executing. So it may seem as if the barrier statement is taking longer to execute, but it is waiting on the parallel statements. Even then, the total time required for parallel execution of statements followed by the sequential execution of the barrier statement should be less than the time required for the sequential execution of all statements. 

Referring to the previous diagram, the server executes all `UPDATE` statements to completion before executing `COMMIT`. Hence it might seem as if `COMMIT` is taking longer to execute, but it is, in fact, waiting on the `UPDATE` statements to finish executing.

### Error message mismatch

In case of parallel statement execution, you might see a mismatch in the error message being displayed and the statement being executed. 

Because the `RETURNING NOTHING` clause is used with parallel statements, CockroachDB cannot return the error for the parallel statement. The server reports the error message for the parallel statement after the next barrier statement. 

On encountering the error, CockroachDB stops the execution of all parallel statements and [aborts and retries the transaction](transactions.html#error-handling). So even if an error message mismatch occurs, the result is the same as aborting the transaction.

Revisiting our sample scenario, suppose an error occurs while executing the second `UPDATE` statement. In sequential execution, the transaction is aborted and the error message is sent immediately. However, in case of parallel execution, the transaction is aborted and the error message is sent after `COMMIT`. The following diagram illustrates the concept of error message mismatch:

<img src="{{ 'images/Parallel_Statement_Execution_Error_Mismatch.png' | relative_url }}" alt="CockroachDB Parallel Statement Execution Error Mismatch" style="border:1px solid #eee;max-width:100%" />

### `RETURNING NOTHING` clause appended to dependent statements

If two consecutive statements are not independent, and yet a `RETURNING NOTHING` clause is added to the statements, CockroachDB detects the dependence and executes the statements sequentially. You can use the `RETURNING NOTHING` clause with SQL statements without worrying about their dependence.

Revising our sample scenario, suppose we want to create a new user on the social networking app. We need to create entries for the last name of the user, their favorite movie, and favorite song. We need to insert entries into three tables: users, favorite_movies, and favorite_songs. The transaction would be as follows:

~~~ sql
> BEGIN;
> INSERT INTO users VALUES last_name = 'Pavlo' WHERE id = 2 RETURNING NOTHING;
> INSERT INTO favorite_movies VALUES movies = 'Godfather' WHERE user_id = 2 RETURNING NOTHING;
> INSERT INTO facvorite_songs VALUES songs = 'Remember' WHERE user_id = 2 RETURNING NOTHING;
> COMMIT;
~~~

In this case, the second and third `INSERT` statements are dependent on the first `INSERT` statement because the movies and songs tables both have a foreign key constraint on the users table. So even though we append the `RETURNING NOTHING` clause to the first statement, CockroachDB executes the first statement sequentially. After the first statement is executed to completion, the second and third `INSERT` statements are executed in parallel. The following conceptual diagram shows how the transaction is executed in sequential and parallel modes:

<img src="{{ 'images/Parallel_Statement_Hybrid_Execution.png' | relative_url }}" alt="CockroachDB Parallel Statement Hybrid Execution" style="border:1px solid #eee;max-width:100%" />

## Independent SQL statements

As mentioned earlier, CockroachDB considers SQL statements within a single transaction to be independent if their execution can be safely reordered without affecting their results. 

For example, the following statements are considered independent since reordering the statements does not affect the results:

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
