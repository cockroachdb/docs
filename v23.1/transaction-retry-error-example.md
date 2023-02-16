---
title: Client side retry handling example
summary: Client side transaction retry error retry handling example and testing
toc: true
docs_area: reference.transaction_retry_error_example
---

When a [transaction](transactions.html) is unable to complete due to [contention](architecture/overview.html#architecture-overview-contention) with another concurrent or recent transaction attempting to write to the same data, CockroachDB will [automatically attempt to retry the failed transaction](transactions.html#automatic-retries) without involving the client (i.e., silently). If the automatic retry is not possible or fails, a [transaction retry error](transaction-retry-error-reference.html)is emitted to the client.

This page presents an [example of an application's transaction retry logic](#client-side-retry-handling-example), as well as a manner by which that logic can be [tested and verified](#testing-transaction-retry-logic) against your application's needs.

## Client-side retry handling example

{% include {{page.version.version}}/misc/client-side-intervention-example.md %}

## Testing transaction retry logic

To test your application's transaction retry logic, use the [`inject_retry_errors_enabled` session variable](set-vars.html#supported-variables). When `inject_retry_errors_enabled` is set to `true`, any statement (with the exception of [`SET` statements](set-vars.html)) executed in the session inside of an explicit transaction will return a [transaction retry error](transaction-retry-error-reference.html) with the message ```restart transaction: TransactionRetryWithProtoRefreshError: injected by `inject_retry_errors_enabled` session variable```.

If the client retries the transaction using the special [`cockroach_restart` `SAVEPOINT` name](savepoint.html#savepoints-for-client-side-transaction-retries), after the 3rd retry, the transaction will proceed as normal. Otherwise, the errors will continue until the client issues a `SET inject_retry_errors_enabled=false` statement.

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

## See also

- [Common Errors and Solutions](common-errors.html)
- [Transactions](transactions.html)
- [Transaction Contention](performance-best-practices-overview.html#transaction-contention)
- [Transaction Retry Error Reference](transaction-retry-error-reference.html)
- [DB Console Transactions Page](ui-transactions-page.html)
- [Architecture - Transaction Layer](architecture/transaction-layer.html)
