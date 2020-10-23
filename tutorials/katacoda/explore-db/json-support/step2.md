In the second terminal, open the [built-in SQL shell](https://www.cockroachlabs.com/docs/stable/cockroach-sql.html) as the `root` user and create a new user, `maxroach`:

```shell
cockroach sql --insecure --host=localhost:26257
```{{execute T2}}

```sql
CREATE USER maxroach;
```{{execute T2}}
