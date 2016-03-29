# Import the driver.
require 'pg'

# Connect to the "bank" database.
conn = PG.connect(dbname: 'bank', user: 'maxroach', host: 'localhost', port: 26257)

# Insert two rows into the "accounts" table.
conn.exec("INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)")

# Print out the balances.
puts "Initial balances:"
conn.exec("SELECT id, balance FROM accounts") do |res|
        res.each do |row|
                puts row
        end
end

# Close communication with the database.
conn.close()
