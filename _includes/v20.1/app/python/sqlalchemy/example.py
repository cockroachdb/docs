"""This module performs the following steps sequentially:
    1. Reads in existing account IDs (if any) from the bank database.
    2. Creates additional accounts with randomly generated IDs. Then, it adds a bit of money to each new account.
    3. Chooses two accounts at random and takes half of the money from the first and deposits it into the second.
"""

import random
from math import floor
from sqlalchemy import create_engine, Column, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from cockroachdb.sqlalchemy import run_transaction

Base = declarative_base()



class Account(Base):
    """The Account class corresponds to the "accounts" database table.
    """
    __tablename__ = 'accounts'
    id = Column(Integer, primary_key=True)
    balance = Column(Integer)


# Create an engine to communicate with the database. The
# "cockroachdb://" prefix for the engine URL indicates that we are
# connecting to CockroachDB using the 'cockroachdb' dialect.
# For more information, see
# https://github.com/cockroachdb/sqlalchemy-cockroachdb.

engine = create_engine(
    # For cockroach demo:
    'cockroachdb://<username>:<password>@<hostname>:<port>/bank?sslmode=require',
    echo=True                   # Log SQL queries to stdout
)

# Automatically create the "accounts" table based on the Account class.
Base.metadata.create_all(engine)


# Store the account IDs we create for later use.

seen_account_ids = set()


# The code below generates random IDs for new accounts.

def create_random_accounts(sess, num):
    """Create N new accounts with random IDs and random account balances.
    Note that since this is a demo, we don't do any work to ensure the
    new IDs don't collide with existing IDs.
    """
    new_accounts = []
    while num > 0:
        billion = 1000000000
        new_id = floor(random.random()*billion)
        seen_account_ids.add(new_id)
        new_accounts.append(
            Account(
                id=new_id,
                balance=floor(random.random()*1000000)
            )
        )
        num = num - 1
    sess.add_all(new_accounts)


run_transaction(sessionmaker(bind=engine),
                lambda s: create_random_accounts(s, 100))


def get_random_account_id():
    """ Helper function for getting random existing account IDs.
    """
    random_id = random.choice(tuple(seen_account_ids))
    return random_id


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
