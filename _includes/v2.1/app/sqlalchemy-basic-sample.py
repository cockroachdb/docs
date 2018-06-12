from __future__ import print_function
from sqlalchemy import create_engine, Column, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

# The Account class corresponds to the "accounts" database table.
class Account(Base):
    __tablename__ = 'accounts'
    id = Column(Integer, primary_key=True)
    balance = Column(Integer)

# Create an engine to communicate with the database. The "cockroachdb://" prefix
# for the engine URL indicates that we are connecting to CockroachDB.
engine = create_engine('cockroachdb://maxroach@localhost:26257/bank',
                       connect_args = {
                           'sslmode' : 'require',
                           'sslrootcert': '/tmp/certs/ca.crt',
                           'sslkey':'/tmp/certs/client.maxroach.key',
                           'sslcert':'/tmp/certs/client.maxroach.crt'
                       })
Session = sessionmaker(bind=engine)

# Automatically create the "accounts" table based on the Account class.
Base.metadata.create_all(engine)

# Insert two rows into the "accounts" table.
session = Session()
session.add_all([
    Account(id=1, balance=1000),
    Account(id=2, balance=250),
])
session.commit()

# Print out the balances.
for account in session.query(Account):
    print(account.id, account.balance)
