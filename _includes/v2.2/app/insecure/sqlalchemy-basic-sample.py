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
# connecting to CockroachDB using the 'cockroachdb-python' dialect.
# For more information, see
# https://github.com/cockroachdb/cockroachdb-python.

engine = create_engine(
    'cockroachdb://maxroach@localhost:26257/bank',
    connect_args={
        'sslmode': 'disable',
    },
    echo=True                   # Log SQL queries to stdout
)

# Automatically create the "accounts" table based on the Account class.
Base.metadata.create_all(engine)

# The code below (1) checks the DB for existing IDs, and (2) generates
# random IDs for new accounts, while ensuring the new IDs don't
# collide with any existing ones.

# Get and store existing account IDs for later collision checks during
# random account ID creation.

res = engine.execute('SELECT id from accounts;')
seen = {}
for elem in res:
    val = elem[0]
    if val not in seen:
        seen[val] = 1


def create_random_accounts(sess, seen, n):
    """Create N new accounts with random IDs and random account balances.

    Note that we do some work to avoid account ID collisions by
    inspecting the contents of the SEEN dictionary.
    """
    new_accounts = []
    elems = iter(range(n))
    for i in elems:
        maybe_id = floor(random.random()*1_000_000)
        if maybe_id not in seen:
            new_accounts.append(
                Account(
                    id=maybe_id,
                    balance=floor(random.random()*1_000_000)
                )
            )
            seen[maybe_id] = 1
        else:
            # Skip account IDs that already exist.
            next(elems)
    sess.add_all(new_accounts)


run_transaction(sessionmaker(bind=engine),
                lambda s: create_random_accounts(s, seen, 100))


# Helper for getting random existing account IDs.

def get_random_account_id():
    return random.choice(list(seen.keys()))


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
