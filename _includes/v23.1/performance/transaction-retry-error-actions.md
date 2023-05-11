In most cases, the correct actions to take when encountering transaction retry errors are:

1. Update your application to support [client-side retry handling](transaction-retry-error-reference.html#client-side-retry-handling) when transaction retry errors are encountered. Follow the guidance for the [specific error type](transaction-retry-error-reference.html#transaction-retry-error-reference).

1. Take steps to [minimize transaction retry errors](transaction-retry-error-reference.html#minimize-transaction-retry-errors) in the first place. This means reducing transaction contention overall, and increasing the likelihood that CockroachDB can [automatically retry](transactions.html#automatic-retries) a failed transaction.