extern crate postgres;

use postgres::{Connection, TlsMode};

fn main() {
    let conn = Connection::connect("postgresql://maxroach@localhost:26257/bank", TlsMode::None)
        .unwrap();

    // Create the "accounts" table.
    conn.execute(
        "CREATE TABLE IF NOT EXISTS accounts (id INT PRIMARY KEY, balance INT)",
        &[],
    ).unwrap();

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
