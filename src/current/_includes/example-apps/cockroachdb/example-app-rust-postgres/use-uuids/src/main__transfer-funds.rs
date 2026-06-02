fn transfer_funds(txn: &mut Transaction, from: Uuid, to: Uuid, amount: i64) -> Result<(), Error> {
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
