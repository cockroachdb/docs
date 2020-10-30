In a new terminal, download the Python code:

`curl -O https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v20.2/app/python/psycopg2/example.py`{{execute T2}}

Open the file: `example.py`{{open}}

You'll see that the Python code is a command-line utility that accepts the connection string to CockroachDB as the `--dsn` flag.

Run this command in the second terminal, replacing `<port>` with the port in you noted in step 1:

`python3 example.py --dsn='postgresql://python:test@127.0.0.1:<port>/bank?sslmode=require'`

The output should show the account balances before and after the funds transfer:

```
Balances at Sun Oct 11 14:32:18 2020
['1', '1000']
['2', '250']
Balances at Sun Oct 11 14:32:18 2020
['1', '900']
['2', '350']
```
