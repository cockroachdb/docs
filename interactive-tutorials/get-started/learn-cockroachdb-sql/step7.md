To update rows in a table, use [`UPDATE`](https://www.cockroachlabs.com/docs/stable/update.html) followed by the table name, a `SET` clause identifying the columns to update and their new values, and a `WHERE` clause identifying the rows to update:

```sql
UPDATE promo_codes
  SET (description, rules) = ('EXPIRED', '{"type": "percent_discount", "value": "0%"}')
  WHERE expiration_time < '2019-01-22 03:04:05+00:00';
```{{execute}}

```sql
SELECT code, description, rules FROM promo_codes LIMIT 10;
```{{execute}}

If a table has a primary key, you can use that in the `WHERE` clause to reliably update specific rows; otherwise, each row matching the `WHERE` clause is updated. When there's no `WHERE` clause, all rows in the table are updated.
