# Use bundler inline - these would typically go in a Gemfile
require 'bundler/inline'
gemfile do
  source 'https://rubygems.org'
  gem 'pg'
  gem 'activerecord', '5.2.0'

  # CockroachDB ActiveRecord adapter dependency
  gem 'activerecord-cockroachdb-adapter', '5.2.0'
end

require 'pg'
require 'active_record'
require 'activerecord-cockroachdb-adapter'

# Connect to CockroachDB using ActiveRecord.
# In Rails, this configuration would go in config/database.yml as usual.
ActiveRecord::Base.establish_connection(

  # Specify the CockroachDB ActiveRecord adapter
  adapter:     'cockroachdb',
  username:    'maxroach',
  database:    'bank',
  host:        'localhost',
  port:        26257,
  sslmode:     'disable'
)

# Define the Account model.
# In Rails, this would go in app/models/ as usual.
class Account < ActiveRecord::Base
  validates :balance, presence: true
end

# Define a migration for the accounts table.
# In Rails, this would go in db/migrate/ as usual.
class Schema < ActiveRecord::Migration[5.0]
  def change
    create_table :accounts, force: true do |t|
      t.integer :balance
    end
  end
end

# Run the schema migration programmatically.
# In Rails, this would be done via rake db:migrate as usual.
Schema.new.change()

# Create two accounts, inserting two rows into the accounts table.
Account.create!(id: 1, balance: 1000)
Account.create!(id: 2, balance: 250)

# Retrieve accounts and print out the balances
Account.all.each do |acct|
  puts "account: #{acct.id} balance: #{acct.balance}"
end