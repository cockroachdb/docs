To delete rows from a table, use [`DELETE FROM`](https://www.cockroachlabs.com/docs/stable/delete.html) followed by the table name and a `WHERE` clause identifying the rows to delete:

```sql
DELETE FROM promo_codes WHERE description = 'EXPIRED';
```{{execute}}

Just as with the `UPDATE` statement, if a table has a primary key, you can use that in the `WHERE` clause to reliably delete specific rows; otherwise, each row matching the `WHERE` clause is deleted. When there's no `WHERE` clause, all rows in the table are deleted.
