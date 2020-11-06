The command-line utility accepts a connection string to CockroachDB as an argument.

Run this command in the second terminal, replacing `<port>` with the port you noted in step 1:

`python3 example.py 'postgresql://python:test@127.0.0.1:<port>/bank?sslmode=require'`

The output will show the account balances before and after the funds transfer:

```
Balances at Fri Oct 30 18:27:00 2020:
(1, 1000)
(2, 250)
Balances at Fri Oct 30 18:27:00 2020:
(1, 900)
(2, 350)
```
