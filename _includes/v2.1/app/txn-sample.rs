extern crate postgres;

use postgres::{Connection, TlsMode, Result};
use postgres::tls::openssl::OpenSsl;
use postgres::tls::openssl::openssl::ssl::{SslConnectorBuilder, SslMethod};
use postgres::tls::openssl::openssl::x509::X509_FILETYPE_PEM;
use postgres::transaction::Transaction;
use postgres::error::T_R_SERIALIZATION_FAILURE;

/// Runs op inside a transaction and retries it as needed.
/// On non-retryable failures, the transaction is aborted and
/// rolled back; on success, the transaction is committed.
fn execute_txn<T, F>(conn: &Connection, mut op: F) -> Result<T>
where
    F: Fn(&Transaction) -> Result<T>,
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

fn ssl_config() -> OpenSsl {
    // Warning! This API will be changing in the next version of these crates.
    let mut connector_builder = SslConnectorBuilder::new(SslMethod::tls()).unwrap();
    connector_builder.set_ca_file("certs/ca.crt").unwrap();
    connector_builder.set_certificate_chain_file("certs/client.maxroach.crt").unwrap();
    connector_builder.set_private_key_file("certs/client.maxroach.key", X509_FILETYPE_PEM).unwrap();

    let mut ssl = OpenSsl::new().unwrap();
    *ssl.connector_mut() = connector_builder.build();
    ssl
}

fn main() {
    let tls_mode = TlsMode::Require(&ssl_config());
    let conn = Connection::connect("postgresql://maxroach@localhost:26257/bank", tls_mode)
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
