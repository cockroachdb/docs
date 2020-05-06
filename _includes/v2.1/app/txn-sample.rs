use openssl::error::ErrorStack;
use openssl::ssl::{SslConnector, SslFiletype, SslMethod};
use postgres::{error::SqlState, Client, Error, Transaction};
use postgres_openssl::MakeTlsConnector;

/// Runs op inside a transaction and retries it as needed.
/// On non-retryable failures, the transaction is aborted and
/// rolled back; on success, the transaction is committed.
fn execute_txn<T, F>(client: &mut Client, op: F) -> Result<T, Error>
where
    F: Fn(&mut Transaction) -> Result<T, Error>,
{
    let mut txn = client.transaction()?;
    loop {
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

fn transfer_funds(txn: &mut Transaction, from: i64, to: i64, amount: i64) -> Result<(), Error> {
    // Read the balance.
    let from_balance: i64 = txn
        .query_one("SELECT balance FROM accounts WHERE id = $1", &[&from])?
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

fn ssl_config() -> Result<MakeTlsConnector, ErrorStack> {
    let mut builder = SslConnector::builder(SslMethod::tls())?;
    builder.set_ca_file("certs/ca.crt")?;
    builder.set_certificate_chain_file("certs/client.maxroach.crt")?;
    builder.set_private_key_file("certs/client.maxroach.key", SslFiletype::PEM)?;
    Ok(MakeTlsConnector::new(builder.build()))
}

fn main() {
    let connector = ssl_config().unwrap();
    let mut client =
        Client::connect("postgresql://maxroach@localhost:26257/bank", connector).unwrap();

    // Run a transfer in a transaction.
    execute_txn(&mut client, |txn| transfer_funds(txn, 1, 2, 100)).unwrap();

    // Check account balances after the transaction.
    for row in &client
        .query("SELECT id, balance FROM accounts", &[])
        .unwrap()
    {
        let id: i64 = row.get(0);
        let balance: i64 = row.get(1);
        println!("{} {}", id, balance);
    }
}
