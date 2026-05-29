/// Runs op inside a transaction and retries it as needed.
/// On non-retryable failures, the transaction is aborted and
/// rolled back; on success, the transaction is committed.
fn execute_txn<T, F>(client: &mut Client, op: F) -> Result<T, Error>
where
    F: Fn(&mut Transaction) -> Result<T, Error>,
{
    let mut txn = client.transaction()?;
    loop {
        // Set a retry savepoint
        // See https://www.cockroachlabs.com/docs/stable/advanced-client-side-transaction-retries
        let mut sp = txn.savepoint("cockroach_restart")?;
        match op(&mut sp).and_then(|t| sp.commit().map(|_| t)) {
            Err(ref err)
                if err
                    .code()
                    .map(|e| *e == SqlState::T_R_SERIALIZATION_FAILURE)
                    .unwrap_or(false) => {}
            r => break r,
        }
    }
    .and_then(|t| txn.commit().map(|_| t))
}
