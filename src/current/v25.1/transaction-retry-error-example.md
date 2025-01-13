---
title: Transaction Retry Error Example
summary: Client side transaction retry error retry handling example and testing
toc: true
docs_area: reference.transaction_retry_error_example
---

{% include {{ page.version.version }}/sql/serializable-tutorial.md %}

When a [transaction]({% link {{ page.version.version }}/transactions.md %}) is unable to complete due to [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) with another concurrent or recent transaction attempting to write to the same data, CockroachDB will [automatically attempt to retry the failed transaction]({% link {{ page.version.version }}/transactions.md %}#automatic-retries) without involving the client (i.e., silently). An automatic retry may not always succeed if the transaction is `SERIALIZABLE`. In this case, a [transaction retry error]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}) is emitted to the client.

This page presents an [example of an application's transaction retry logic](#client-side-retry-handling-example), as well as a manner by which that logic can be [tested and verified](#test-transaction-retry-logic) against your application's needs.

## Client-side retry handling example

The Python-like pseudocode below shows how to implement an application-level retry loop; it does not require your driver or ORM to implement [advanced retry handling logic]({% link {{ page.version.version }}/advanced-client-side-transaction-retries.md %}), so it can be used from any programming language or environment. In particular, your retry loop must:

- Raise an error if the `max_retries` limit is reached
- Retry on `40001` error codes
- [`COMMIT`]({% link {{ page.version.version }}/commit-transaction.md %}) at the end of the `try` block
- Implement [exponential backoff](https://wikipedia.org/wiki/Exponential_backoff) logic as shown below for best performance

~~~ python
while true:
    n++
    if n == max_retries:
        throw Error("did not succeed within N retries")
    try:
        # add logic here to run all your statements
        conn.exec('COMMIT')
        break
    catch error:
        if error.code != "40001":
            throw error
        else:
            # This is a retry error, so we roll back the current transaction
            # and sleep for a bit before retrying. The sleep time increases
            # for each failed transaction.  Adapted from
            # https://colintemple.com/2017/03/java-exponential-backoff/
            conn.exec('ROLLBACK');
            sleep_ms = int(((2**n) * 100) + rand( 100 - 1 ) + 1)
            sleep(sleep_ms) # Assumes your sleep() takes milliseconds
~~~

## Test transaction retry logic

To test your application's transaction retry logic, use the [`inject_retry_errors_enabled` session variable]({% link {{ page.version.version }}/set-vars.md %}#supported-variables). When `inject_retry_errors_enabled` is set to `true`, any statement (with the exception of [`SET` statements]({% link {{ page.version.version }}/set-vars.md %})) executed in the session inside of an explicit transaction will return a [transaction retry error]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}) with the message ```restart transaction: TransactionRetryWithProtoRefreshError: injected by `inject_retry_errors_enabled` session variable```.

If the client retries the transaction using the special [`cockroach_restart` `SAVEPOINT` name]({% link {{ page.version.version }}/savepoint.md %}#savepoints-for-client-side-transaction-retries), after the 3rd retry, the transaction will proceed as normal. Otherwise, the errors will continue until the client issues a `SET inject_retry_errors_enabled=false` statement.

For example, suppose you've written a wrapper function with some retry logic named `run_transaction` that you want to use to execute statements across a [`psycopg2`](https://www.psycopg.org/) connection. In this example, `run_transaction` takes a SQL-executing function `op(conn)` and attempts to run the function, retrying on serialization failures (exposed in pscyopg2 as the [`SerializationFailure` exception class](https://www.psycopg.org/docs/errors.html#sqlstate-exception-classes)) with exponential backoff, until reaching a maximum number of tries:

~~~ python
def run_transaction(conn, op, max_retries=3):    
    """
    Execute the operation *op(conn)* retrying serialization failures.

    If the database returns an error asking to retry the transaction, retry it
    *max_retries* times before giving up (and propagate it).
    """
    # leaving this block the transaction will commit or rollback
    # (if leaving with an exception)
    with conn:
        for retry in range(1, max_retries + 1):
            try:
                op(conn)
                # If we reach this point, we were able to commit, so we break
                # from the retry loop.
                return

            except SerializationFailure as e:
                # This is a retry error, so we roll back the current
                # transaction and sleep for a bit before retrying. The
                # sleep time increases for each failed transaction.
                logging.debug("got error: %s", e)
                conn.rollback()
                sleep_ms = (2 ** retry) * 0.1 * (random.random() + 0.5)
                logging.debug("Sleeping %s seconds", sleep_ms)
                time.sleep(sleep_ms)

            except psycopg2.Error as e:
                logging.debug("got error: %s", e)
                raise e

        raise ValueError(f"Transaction did not succeed after {max_retries} retries")
~~~

You can add a quick test to this function using the `inject_retry_errors_enabled` session variable.

~~~ python
def run_transaction(conn, op=None, max_retries=3):
    """
    Execute the operation *op(conn)* retrying serialization failure.
    If no op is specified, the function runs a test, using the
    inject_retry_errors_enabled session variable to inject errors.

    If the database returns an error asking to retry the transaction, retry it
    *max_retries* times before giving up (and propagate it).
    """
    # leaving this block the transaction will commit or rollback
    # (if leaving with an exception)
    with conn:
        for retry in range(1, max_retries + 1):
            try:
                if not op:
                    with conn.cursor() as cur:
                        if retry == 1:
                            cur.execute("SET inject_retry_errors_enabled = 'true'")
                        if retry == max_retries:
                            cur.execute("SET inject_retry_errors_enabled = 'false'")
                        cur.execute("SELECT now()")
                        logging.debug("status message: %s", cur.statusmessage)
                else:
                    op(conn)
                # If we reach this point, we were able to commit, so we break
                # from the retry loop.
                return

            except SerializationFailure as e:
                # This is a retry error, so we roll back the current
                # transaction and sleep for a bit before retrying. The
                # sleep time increases for each failed transaction.
                logging.debug("got error: %s", e)
                conn.rollback()
                sleep_ms = (2 ** retry) * 0.1 * (random.random() + 0.5)
                logging.debug("Sleeping %s seconds", sleep_ms)
                time.sleep(sleep_ms)

            except psycopg2.Error as e:
                logging.debug("got error: %s", e)
                raise e

        raise ValueError(f"Transaction did not succeed after {max_retries} retries")
~~~

Calling `run_transaction` without an `op` input sets `inject_retry_errors_enabled` as `true` until the final retry attempt, before which the `inject_retry_errors_enabled` is set back to `false`. For all attempts except the last one, CockroachDB will inject a retryable serialization error for the client to handle. If the client cannot handle the error properly, the retry logic isn't working properly.