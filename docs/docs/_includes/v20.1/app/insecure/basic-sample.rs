use postgres::{Client, NoTls};

fn main() {
    let mut client = Client::connect("postgresql://maxroach@localhost:26257/bank", NoTls).unwrap();

    // Create the "accounts" table.
    client
        .execute(
            "CREATE TABLE IF NOT EXISTS accounts (id INT PRIMARY KEY, balance INT)",
            &[],
        )
        .unwrap();

    // Insert two rows into the "accounts" table.
    client
        .execute(
            "INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)",
            &[],
        )
        .unwrap();

    // Print out the balances.
    println!("Initial balances:");
    for row in &client
        .query("SELECT id, balance FROM accounts", &[])
        .unwrap()
    {
        let id: i64 = row.get(0);
        let balance: i64 = row.get(1);
        println!("{} {}", id, balance);
    }
}
