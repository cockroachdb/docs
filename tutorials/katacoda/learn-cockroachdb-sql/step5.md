[Indexes](https://www.cockroachlabs.com/docs/stable/indexes.html) help locate data without having to look through every row of a table. They're automatically created for the [primary key](https://www.cockroachlabs.com/docs/stable/primary-key.html) of a table and any columns with a [`UNIQUE` constraint](https://www.cockroachlabs.com/docs/stable/unique.html).

To create an index for non-unique columns, use [`CREATE INDEX`](create-index.html) followed by an optional index name and an `ON` clause identifying the table and column(s) to index.  For each column, you can choose whether to sort ascending (`ASC`) or descending (`DESC`).

```sql
CREATE INDEX name_idx ON users (name DESC);
```{{execute}}

You can create indexes during table creation as well; just include the `INDEX` keyword followed by an optional index name and the column(s) to index:

```sql
CREATE TABLE IF NOT EXISTS drivers (
  id UUID NOT NULL,
  city STRING NOT NULL,
  name STRING,
  dl STRING,
  address STRING,
  INDEX name_idx (name),
  CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC)
);
```{{execute}}
