import random
from math import floor
from pony.orm import *

db = Database()

# The Account class corresponds to the "accounts" database table.


class Account(db.Entity):
    _table_ = 'accounts'
    id = PrimaryKey(int)
    balance = Required(int)


db_params = dict(provider='cockroach', user='maxroach',
                 host='localhost', port=26257, database='bank', sslmode='disable')


sql_debug(True)  # Print all generated SQL queries to stdout
db.bind(**db_params)  # Bind Database object to the real database
db.generate_mapping(create_tables=True)  # Create tables


# Store the account IDs we create for later use.

seen_account_ids = set()


# The code below generates random IDs for new accounts.

@db_session  # db_session decorator manages the transactions
def create_random_accounts(n):
    elems = iter(range(n))
    for i in elems:
        billion = 1000000000
        new_id = floor(random.random() * billion)
        seen_account_ids.add(new_id)
        # Create new account
        Account(id=new_id, balance=floor(random.random() * 1000000))


create_random_accounts(100)


def get_random_account_id():
    id = random.choice(tuple(seen_account_ids))
    return id


@db_session(retry=10)  # retry of the optimistic transaction
def transfer_funds_randomly():
    """
    Cuts a randomly selected account's balance in half, and gives the
    other half to some other randomly selected account.
    """

    source_id = get_random_account_id()
    sink_id = get_random_account_id()

    source = Account.get(id=source_id)
    amount = floor(source.balance / 2)

    if source.balance < amount:
        raise "Insufficient funds"

    source.balance -= amount
    sink = Account.get(id=sink_id)
    sink.balance += amount
