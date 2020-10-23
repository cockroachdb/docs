Still in the SQL shell, create a table called `programming`:

```sql
CREATE TABLE programming (id UUID DEFAULT uuid_v4()::UUID PRIMARY KEY, posts JSONB);
```{{execute T2}}

```sql
SHOW CREATE TABLE programming;
```{{execute T2}}
