extern crate postgres;

use postgres::{Connection, TlsMode, Result};
use postgres::transaction::Transaction;
use self::postgres::error::T_R_SERIALIZATION_FAILURE;

/// Runs op inside a transaction and retries it as needed.
/// On non-retryable failures, the transaction is aborted and
/// rolled back; on success, the transaction is committed.
fn execute_txn<T, F>(conn: &Connection, mut op: F) -> Result<T>
where
    F: FnMut(&Transaction) -> Result<T>,
{
    let txn = conn.transaction()?;
    loop {
        let sp = txn.savepoint("cockroach_restart")?;
        match op(&sp).and_then(|t| sp.commit().map(|_| t)) {
            Err(ref err) if err.as_db()
                               .map(|e| e.code == T_R_SERIALIZATION_FAILURE)
                               .unwrap_or(false) => {},
            r => break r,
        }
    }.and_then(|t| txn.commit().map(|_| t))
}

fn transfer_funds(txn: &Transaction, from: i64, to: i64, amount: i64) -> Result<()> {
    // Read the balance.
    let from_balance: i64 = txn.query("SELECT balance FROM accounts WHERE id = $1", &[&from])?
        .get(0)
        .get(0);

    assert!(from_balance >= amount);

    // Perform the transfer.
    txn.execute(
        "UPDATE accounts SET balance = balance - $1 WHERE id = $2",
        &[&amount, &from],
    )?;
    txn.execute(
        "UPDATE accounts SET balance = balance + $1 WHERE id = $2",
        &[&amount, &to],
    )?;
    Ok(())
}

fn main() {
    let conn = Connection::connect("postgresql://maxroach@localhost:26257/bank", TlsMode::None)
        .unwrap();

    // Run a transfer in a transaction.
    execute_txn(&conn, |txn| transfer_funds(txn, 1, 2, 100)).unwrap();

    // Check account balances after the transaction.
    for row in &conn.query("SELECT id, balance FROM accounts", &[]).unwrap() {
        let id: i64 = row.get(0);
        let balance: i64 = row.get(1);
        println!("{} {}", id, balance);
    }
}
