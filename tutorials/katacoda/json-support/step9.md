Now that there is an inverted index, the same query will run much faster:

```sql
SELECT id FROM programming
WHERE posts @> '{"data": {"domain": "github.com"}}';
```{{execute T2}}

Compare the `TIME` before and after this inverted index was created.
