import random
from math import floor
from sqlalchemy import create_engine, Column, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from cockroachdb.sqlalchemy import run_transaction

Base = declarative_base()


# The Account class corresponds to the "accounts" database table.
class Account(Base):
    __tablename__ = 'accounts'
    id = Column(Integer, primary_key=True)
    balance = Column(Integer)


# Create an engine to communicate with the database. The
# "cockroachdb://" prefix for the engine URL indicates that we are
# connecting to CockroachDB using the 'cockroachdb' dialect.
# For more information, see
# https://github.com/cockroachdb/sqlalchemy-cockroachdb.

secure_cluster = True           # Set to False for insecure clusters
connect_args = {}

if secure_cluster:
    connect_args = {
        'sslmode': 'require',
        'sslrootcert': 'certs/ca.crt',
        'sslkey': 'certs/client.maxroach.key',
        'sslcert': 'certs/client.maxroach.crt'
    }
else:
    connect_args = {'sslmode': 'disable'}

engine = create_engine(
    'cockroachdb://maxroach@localhost:26257/bank',
    connect_args=connect_args,
    echo=True                   # Log SQL queries to stdout
)

# Automatically create the "accounts" table based on the Account class.
Base.metadata.create_all(engine)


# Store the account IDs we create for later use.

seen_account_ids = set()


# The code below generates random IDs for new accounts.

def create_random_accounts(sess, n):
    """Create N new accounts with random IDs and random account balances.

    Note that since this is a demo, we do not do any work to ensure the
    new IDs do not collide with existing IDs.
    """
    new_accounts = []
    elems = iter(range(n))
    for i in elems:
        billion = 1000000000
        new_id = floor(random.random()*billion)
        seen_account_ids.add(new_id)
        new_accounts.append(
            Account(
                id=new_id,
                balance=floor(random.random()*1000000)
            )
        )
    sess.add_all(new_accounts)


run_transaction(sessionmaker(bind=engine),
                lambda s: create_random_accounts(s, 100))


# Helper for getting random existing account IDs.

def get_random_account_id():
    id = random.choice(tuple(seen_account_ids))
    return id


def transfer_funds_randomly(session):
    """Transfer money randomly between accounts (during SESSION).

    Cuts a randomly selected account's balance in half, and gives the
    other half to some other randomly selected account.
    """
    source_id = get_random_account_id()
    sink_id = get_random_account_id()

    source = session.query(Account).filter_by(id=source_id).one()
    amount = floor(source.balance/2)

    # Check balance of the first account.
    if source.balance < amount:
        raise "Insufficient funds"

    source.balance -= amount
    session.query(Account).filter_by(id=sink_id).update(
        {"balance": (Account.balance + amount)}
    )


# Run the transfer inside a transaction.

run_transaction(sessionmaker(bind=engine), transfer_funds_randomly)
