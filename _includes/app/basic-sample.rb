# Import the driver.
require 'pg'

# Connect to the cluster.
conn = PG.connect(user: 'root', host: 'localhost', port: 26257)

# Make each statement commit immediately.
# conn.exec('SET AUTOCOMMIT = ON')

# Create a "bank" database and set it as default.
conn.exec("CREATE DATABASE bank")
conn.exec("SET DATABASE = bank")

# Create an "accounts" table.
conn.exec("CREATE TABLE accounts (id INT PRIMARY KEY, balance INT)")

# Insert two rows into the table.
conn.exec("INSERT INTO accounts (id, balance) VALUES (1, 1000),(2, 230)")

# Check account balances.
puts "Account balances:"
conn.exec("SELECT id, balance FROM accounts") do |res|
        res.each do |row|
                puts row
        end
end

# Close communication with the database.
conn.close()