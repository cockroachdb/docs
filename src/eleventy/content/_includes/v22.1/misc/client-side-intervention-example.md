The Python-like pseudocode below shows how to implement an application-level retry loop; it does not require your driver or ORM to implement [advanced retry handling logic](advanced-client-side-transaction-retries.html), so it can be used from any programming language or environment. In particular, your retry loop must:

- Raise an error if the `max_retries` limit is reached
- Retry on `40001` error codes
- [`COMMIT`](commit-transaction.html) at the end of the `try` block
- Implement [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff) logic as shown below for best performance

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
