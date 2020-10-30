In a new terminal, download the Python code:

`https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v20.2/app/python/psycopg2/example.py`{{execute T2}}

Open the file: `example.py`{{open}}

You'll see that the Python code is a command-line utility that accepts the connection string to CockroachDB as the `--dsn` flag.

Run this command in the second terminal, updating the connection string as follows:

- Replace `<username>` and `<password>` with the SQL username and password that you created earlier.
- Replace `<port>` with the port in the `(sql/tcp)` connection string from SQL shell welcome text.

`python3 example.py --dsn='postgresql://<username>:<password>@127.0.0.1:<port>/bank?sslmode=require'`

The output should show the account balances before and after the funds transfer:

```
Balances at Sun Oct 11 14:32:18 2020
['1', '1000']
['2', '250']
Balances at Sun Oct 11 14:32:18 2020
['1', '900']
['2', '350']
```
