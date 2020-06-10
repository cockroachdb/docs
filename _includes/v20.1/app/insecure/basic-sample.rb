# Import the driver.
require 'pg'

# Connect to the "bank" database.
conn = PG.connect(
  user: 'maxroach',
  dbname: 'bank',
  host: 'localhost',
  port: 26257,
  sslmode: 'disable'
)

# Create the "accounts" table.
conn.exec('CREATE TABLE IF NOT EXISTS accounts (id INT PRIMARY KEY, balance INT)')

# Insert two rows into the "accounts" table.
conn.exec('INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)')

# Print out the balances.
puts 'Initial balances:'
conn.exec('SELECT id, balance FROM accounts') do |res|
  res.each do |row|
    puts "id: #{row['id']} balance: #{row['balance']}"
  end
end

# Close the database connection.
conn.close()
