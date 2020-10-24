Back in the terminal where the SQL shell is running, verify that rows of data are being inserted into your table:

```sql
SELECT count(*) FROM programming;
```{{execute T2}}

```sql
SELECT count(*) FROM programming;
```{{execute T2}}

You should see the count increasing. Keep checking until you see 1000 rows.

Now, retrieve all the current entries where the link is pointing to somewhere on GitHub:

```sql
SELECT id FROM programming
WHERE posts @> '{"data": {"domain": "github.com"}}';
```{{execute T2}}

Note the `TIME` this query takes.
