Now suppose that you want MovR to offer ride-sharing services, in addition to vehicle-sharing services. You'll need to add a table for drivers to the `movr` database.

To create a table, use [`CREATE TABLE`](https://www.cockroachlabs.com/docs/stable/create-table.html) followed by a table name, the column names, and the [data type](https://www.cockroachlabs.com/docs/stable/data-types.html) and [constraint](https://www.cockroachlabs.com/docs/stable/constraints.html), if any, for each column:

```sql
CREATE TABLE drivers (
  id UUID NOT NULL,
  city STRING NOT NULL,
  name STRING,
  dl STRING UNIQUE,
  address STRING,
  CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC)
);
```{{execute}}

Table and column names must follow [these rules](https://www.cockroachlabs.com/docs/stable/keywords-and-identifiers.html#identifiers). Also, when you do not explicitly define a [primary key](https://www.cockroachlabs.com/docs/stable/primary-key.html), CockroachDB will automatically add a hidden `rowid` column as the primary key.

To avoid an error in case the table already exists, you can include `IF NOT EXISTS`:

```sql
CREATE TABLE IF NOT EXISTS drivers (
  id UUID NOT NULL,
  city STRING NOT NULL,
  name STRING,
  dl STRING UNIQUE,
  address STRING,
  CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC)
);
```{{execute}}

To show all of the columns from a table, use the [`SHOW COLUMNS FROM <table>`](https://www.cockroachlabs.com/docs/stable/show-columns.html) statement or the `\d <table>` [shell command](https://www.cockroachlabs.com/docs/stable/cockroach-sql.html#commands):

```sql
SHOW COLUMNS FROM drivers;
```{{execute}}

```sql
\d drivers
```{{execute}}
