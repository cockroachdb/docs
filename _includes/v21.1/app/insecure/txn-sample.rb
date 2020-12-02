# Import the driver.
require 'pg'

# Wrapper for a transaction.
# This automatically re-calls "op" with the open transaction as an argument
# as long as the database server asks for the transaction to be retried.
def run_transaction(conn)
  conn.transaction do |txn|
    txn.exec('SAVEPOINT cockroach_restart')
    while
      begin
        # Attempt the work.
        yield txn

        # If we reach this point, commit.
        txn.exec('RELEASE SAVEPOINT cockroach_restart')
        break
      rescue PG::TRSerializationFailure
        txn.exec('ROLLBACK TO SAVEPOINT cockroach_restart')
      end
    end
  end
end

def transfer_funds(txn, from, to, amount)
  txn.exec_params('SELECT balance FROM accounts WHERE id = $1', [from]) do |res|
    res.each do |row|
      raise 'insufficient funds' if Integer(row['balance']) < amount
    end
  end
  txn.exec_params('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, from])
  txn.exec_params('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, to])
end

# Connect to the "bank" database.
conn = PG.connect(
  user: 'maxroach',
  dbname: 'bank',
  host: 'localhost',
  port: 26257,
  sslmode: 'disable'
)

run_transaction(conn) do |txn|
  transfer_funds(txn, 1, 2, 100)
end

# Close the database connection.
conn.close()
