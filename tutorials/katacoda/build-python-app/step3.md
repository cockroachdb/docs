In a new terminal, download the Python code:

`curl -O https://raw.githubusercontent.com/cockroachlabs/hello-world-python-psycopg2/master/example.py`{{execute T2}}

Open the file: `example.py`{{open}}

You'll see that the Python code is a command-line utility that does the following:

- Creates an accounts table and inserts some rows.
- Transfers funds between two accounts inside a [transaction](https://www.cockroachlabs.com/docs/stable/transactions.html).
- Deletes the accounts from the table before exiting so you can re-run the example code.

To [handle transaction retry errors](https://www.cockroachlabs.com/docs/stable/error-handling-and-troubleshooting.html#transaction-retry-errors), the code uses an application-level retry loop that, in case of error, sleeps before trying the funds transfer again. If it encounters another retry error, it sleeps for a longer interval, implementing [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff).
