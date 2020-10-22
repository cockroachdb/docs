To query a table, use [`SELECT`](https://www.cockroachlabs.com/docs/stable/select-clause.html) followed by a comma-separated list of the columns to be returned and the table from which to retrieve the data. You can also use the [`LIMIT`](https://www.cockroachlabs.com/docs/stable/limit-offset.html) clause to restrict the number of rows retrieved:

```sql
SELECT name FROM users LIMIT 10;
```{{execute}}

To retrieve all columns, use the `*` wildcard:

```sql
SELECT * FROM users LIMIT 10;
```{{execute}}

To filter the results, add a `WHERE` clause identifying the columns and values to filter on:

```sql
SELECT id, name FROM users WHERE city = 'san francisco';
```{{execute}}


To sort the results, add an `ORDER BY` clause identifying the columns to sort by. For each column, you can choose whether to sort ascending (`ASC`) or descending (`DESC`).

```sql
SELECT city, type, current_location FROM vehicles ORDER BY city, type DESC;
```{{execute}}
