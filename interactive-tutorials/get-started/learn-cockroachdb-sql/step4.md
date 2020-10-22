To insert a row into a table, use [`INSERT INTO`](https://www.cockroachlabs.com/docs/stable/insert.html) followed by the table name and then the column values listed in the order in which the columns appear in the table:

```sql
INSERT INTO drivers VALUES
  ('c28f5c28-f5c2-4000-8000-000000000026', 'new york', 'Petee', 'ABC-1234', '101 5th Ave');
```{{execute}}

If you want to pass column values in a different order, list the column names explicitly and provide the column values in the corresponding order:

```sql
INSERT INTO drivers (name, city, dl, address, id) VALUES
  ('Adam Driver', 'chicago', 'DEF-5678', '201 E Randolph St', '1eb851eb-851e-4800-8000-000000000006');
```{{execute}}

To insert multiple rows into a table, use a comma-separated list of parentheses, each containing column values for one row:

```sql
INSERT INTO drivers VALUES
  ('8a3d70a3-d70a-4000-8000-00000000001b', 'seattle', 'Eric', 'GHI-9123', '400 Broad St'),
  ('9eb851eb-851e-4800-8000-00000000001f', 'new york', 'Harry Potter', 'JKL-456', '214 W 43rd St');
```{{execute}}

[Defaults values](https://www.cockroachlabs.com/docs/stable/default-value.html) are used when you leave specific columns out of your statement, or when you explicitly request default values. For example, both of the following statements create a row where the `name`, `dl`, and `address` entries each contain their default value, in this case `NULL`:

```sql
INSERT INTO drivers (id, city) VALUES
  ('70a3d70a-3d70-4400-8000-000000000016', 'chicago');
```{{execute}}

```sql
INSERT INTO drivers (id, city, name, dl, address) VALUES
  ('b851eb85-1eb8-4000-8000-000000000024', 'seattle', DEFAULT, DEFAULT, DEFAULT);
```{{execute}}

```sql
SELECT * FROM drivers WHERE id in ('70a3d70a-3d70-4400-8000-000000000016', 'b851eb85-1eb8-4000-8000-000000000024');
```{{execute}}
