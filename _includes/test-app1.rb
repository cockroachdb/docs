# Import the driver.
require 'pg'

# Assuming a 'bank' database already exists, connect to it.
conn = PG.connect(dbname: 'bank', user: 'root', host: 'localhost', port: 26257)

# Make every statement have immediate effect.
conn.exec('SET AUTOCOMMIT = ON')

# Create an 'accounts' table.
conn.exec("CREATE TABLE accounts (id INT PRIMARY KEY, balance DECIMAL)")

# Insert two rows into the table.
conn.exec("INSERT INTO accounts (id, balance) VALUES (1, DECIMAL '1000'),(2, DECIMAL '230.50')")

# Update one row.
conn.exec("UPDATE accounts SET balance = balance - DECIMAL '5.50' WHERE id = 1")

# Select rows that match a condition.
conn.exec('SELECT id FROM accounts WHERE balance < 500') do |res|
        res.each do |row|
                puts row[0]
        end
end

# Close communication with the database.
conn.close()