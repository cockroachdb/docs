extern crate postgres;

use postgres::{Connection, TlsMode};
use postgres::tls::openssl::OpenSsl;
use postgres::tls::openssl::openssl::ssl::{SslConnectorBuilder, SslMethod};
use postgres::tls::openssl::openssl::x509::X509_FILETYPE_PEM;

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

    // Insert two rows into the "accounts" table.
    conn.execute(
        "INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)",
        &[],
    ).unwrap();

    // Print out the balances.
    println!("Initial balances:");
    for row in &conn.query("SELECT id, balance FROM accounts", &[]).unwrap() {
        let id: i64 = row.get(0);
        let balance: i64 = row.get(1);
        println!("{} {}", id, balance);
    }
}
