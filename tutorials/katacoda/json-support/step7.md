To optimize the performance of queries that filter on the `JSONB` column, let's create an [inverted index](https://www.cockroachlabs.com/docs/stable/inverted-indexes.html) on the column:

```sql
CREATE INVERTED INDEX ON programming(posts);
```{{execute T2}}
