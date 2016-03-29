# Import the driver.
require 'pg'

# Connect to the cluster.
conn = PG.connect(user: 'maxroach', dbname: 'bank', host: 'localhost', port: 26257)

# Insert two rows into the table.
conn.exec("INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)")

# Check account balances.
puts "Initial account balances:"
conn.exec("SELECT id, balance FROM accounts") do |res|
        res.each do |row|
                puts row
        end
end

# Close communication with the database.
conn.close()
