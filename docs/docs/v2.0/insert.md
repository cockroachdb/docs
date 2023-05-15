---
title: INSERT
summary: The INSERT statement inserts one or more rows into a table.
toc: true
---

The `INSERT` [statement](sql-statements.html) inserts one or more rows into a table. In cases where inserted values conflict with uniqueness constraints, the `ON CONFLICT` clause can be used to update rather than insert rows.


## Performance Best Practices

- A single [multi-row `INSERT`](#insert-multiple-rows-into-an-existing-table) statement is faster than multiple single-row `INSERT` statements. To bulk-insert data into an existing table, use a multi-row `INSERT` instead of multiple single-row `INSERT` statements.
- The [`IMPORT`](import.html) statement performs better than `INSERT` when inserting rows into a new table.
- In traditional SQL databases, generating and retrieving unique IDs involves using `INSERT` with `SELECT`. In CockroachDB, use `RETURNING` clause with `INSERT` instead. See [Insert and Return Values](#insert-and-return-values) for more details.

## Required Privileges

The user must have the `INSERT` [privilege](privileges.html) on the table. To use `ON CONFLICT DO UPDATE`, the user must also have the `UPDATE` privilege on the table.

## Synopsis

<div>{% include {{ page.version.version }}/sql/diagrams/insert.html %}</div>

## Parameters

Parameter | Description
----------|------------
`common_table_expr` | See [Common Table Expressions](common-table-expressions.html).
`table_name` | The table you want to write data to.|
`AS table_alias_name` | An alias for the table name. When an alias is provided, it completely hides the actual table name.
`column_name` | The name of a column to populate during the insert.
`select_stmt` | A [selection query](selection-queries.html). Each value must match the [data type](data-types.html) of its column. Also, if column names are listed after `INTO`, values must be in corresponding order; otherwise, they must follow the declared order of the columns in the table.
`DEFAULT VALUES` | To fill all columns with their [default values](default-value.html), use `DEFAULT VALUES` in place of `select_stmt`. To fill a specific column with its default value, leave the value out of the `select_stmt` or use `DEFAULT` at the appropriate position. See the [Insert Default Values](#insert-default-values) examples below.
`RETURNING target_list` | Return values based on rows inserted, where `target_list` can be specific column names from the table, `*` for all columns, or computations using [scalar expressions](scalar-expressions.html). See the [Insert and Return Values](#insert-and-return-values) example below.<br><br>Within a [transaction](transactions.html), use `RETURNING NOTHING` to return nothing in the response, not even the number of rows affected.

### `ON CONFLICT` clause

<div>{% include {{ page.version.version }}/sql/diagrams/on_conflict.html %}</div>

Normally, when inserted values
conflict with a `UNIQUE` constraint on one or more columns, CockroachDB
returns an error. To update the affected rows instead, use an `ON
CONFLICT` clause containing the column(s) with the unique constraint
and the `DO UPDATE SET` expression set to the column(s) to be updated
(any `SET` expression supported by the [`UPDATE`](update.html)
statement is also supported here, including those with `WHERE`
clauses). To prevent the affected rows from updating while allowing
new rows to be inserted, set `ON CONFLICT` to `DO NOTHING`. See the
[Update Values `ON CONFLICT`](#update-values-on-conflict) and [Do Not
Update Values `ON CONFLICT`](#do-not-update-values-on-conflict)
examples below.

If the values in the `SET` expression cause uniqueness conflicts,
CockroachDB will return an error.

As a short-hand alternative to the `ON
CONFLICT` clause, you can use the [`UPSERT`](upsert.html)
statement. However, `UPSERT` does not let you specify the column with
the unique constraint; it assumes that the column is the primary
key. Using `ON CONFLICT` is therefore more flexible.

## Examples

All of the examples below assume you've already created a table `accounts`:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE accounts(
    id INT DEFAULT unique_rowid(),
    balance DECIMAL
);
~~~

### Insert a Single Row

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts (balance, id) VALUES (10000.50, 1);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  1 | 10000.5 |
+----+---------+
~~~

If you do not list column names, the statement will use the columns of the table in their declared order:

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM accounts;
~~~

~~~
+---------+---------+-------+----------------+
|  Field  |  Type   | Null  |    Default     |
+---------+---------+-------+----------------+
| id      | INT     | false | unique_rowid() |
| balance | DECIMAL | true  | NULL           |
+---------+---------+-------+----------------+
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts VALUES (2, 20000.75);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
~~~

~~~
+----+----------+
| id | balance  |
+----+----------+
|  1 | 10000.50 |
|  2 | 20000.75 |
+----+----------+
~~~

### Insert Multiple Rows into an Existing Table

{{site.data.alerts.callout_success}} Multi-row inserts are faster than multiple single-row <code>INSERT</code> statements. As a performance best practice, we recommend batching multiple rows in one multi-row <code>INSERT</code> statement instead of using multiple single-row <code>INSERT</code> statements. Experimentally determine the optimal batch size for your application by monitoring the performance for different batch sizes (10 rows, 100 rows, 1000 rows). {{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts (id, balance) VALUES (3, 8100.73), (4, 9400.10);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
~~~

~~~
+----+----------+
| id | balance  |
+----+----------+
|  1 | 10000.50 |
|  2 | 20000.75 |
|  3 |  8100.73 |
|  4 |  9400.10 |
+----+----------+
~~~

### Insert Multiple Rows into a New Table

The [`IMPORT`](import.html) statement performs better than `INSERT` when inserting rows into a new table.

### Insert from a `SELECT` Statement

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMS FROM other_accounts;
~~~

~~~
+--------+---------+-------+---------+
| Field  |  Type   | Null  | Default |
+--------+---------+-------+---------+
| number | INT     | false | NULL    |
| amount | DECIMAL | true  | NULL    |
+--------+---------+-------+---------+
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts (id, balance) SELECT number, amount FROM other_accounts WHERE id > 4;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
~~~

~~~
+----+----------+
| id | balance  |
+----+----------+
|  1 |  10000.5 |
|  2 | 20000.75 |
|  3 |  8100.73 |
|  4 |   9400.1 |
|  5 |    350.1 |
|  6 |      150 |
|  7 |    200.1 |
+----+----------+
~~~

### Insert Default Values

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts (id) VALUES (8);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts (id, balance) VALUES (9, DEFAULT);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts WHERE id in (8, 9);
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  8 | NULL    |
|  9 | NULL    |
+----+---------+
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts DEFAULT VALUES;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
~~~

~~~
+--------------------+----------+
|         id         | balance  |
+--------------------+----------+
|                  1 |  10000.5 |
|                  2 | 20000.75 |
|                  3 |  8100.73 |
|                  4 |   9400.1 |
|                  5 |    350.1 |
|                  6 |      150 |
|                  7 |    200.1 |
|                  8 | NULL     |
|                  9 | NULL     |
| 142933248649822209 | NULL     |
+--------------------+----------+
~~~

### Insert and Return Values

In this example, the `RETURNING` clause returns the `id` values of the rows inserted, which are generated server-side by the `unique_rowid()` function. The language-specific versions assume that you have installed the relevant [client drivers](install-client-drivers.html).

{{site.data.alerts.callout_success}}This use of <code>RETURNING</code> mirrors the behavior of MySQL's <code>last_insert_id()</code> function.{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}When a driver provides a <code>query()</code> method for statements that return results and an <code>exec()</code> method for statements that do not (e.g., Go), it's likely necessary to use the <code>query()</code> method for <code>INSERT</code> statements with <code>RETURNING</code>.{{site.data.alerts.end}}

<div class="filters clearfix">
    <button class="filter-button" data-scope="shell">Shell</button>
    <button class="filter-button" data-scope="python">Python</button>
    <button class="filter-button" data-scope="ruby">Ruby</button>
    <button class="filter-button" data-scope="go">Go</button>
    <button class="filter-button" data-scope="js">Node.js</button>
</div>

<section class="filter-content" markdown="1" data-scope="shell">

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts (id, balance)
  VALUES (DEFAULT, 1000), (DEFAULT, 250)
  RETURNING id;
~~~

~~~
+--------------------+
|         id         |
+--------------------+
| 190018410823680001 |
| 190018410823712769 |
+--------------------+
(2 rows)
~~~

</section>

<section class="filter-content" markdown="1" data-scope="python">

{% include copy-clipboard.html %}
~~~ python
# Import the driver.
import psycopg2

# Connect to the "bank" database.
conn = psycopg2.connect(
    database='bank',
    user='root',
    host='localhost',
    port=26257
)

# Make each statement commit immediately.
conn.set_session(autocommit=True)

# Open a cursor to perform database operations.
cur = conn.cursor()

# Insert two rows into the "accounts" table
# and return the "id" values generated server-side.
cur.execute(
    'INSERT INTO accounts (id, balance) '
    'VALUES (DEFAULT, 1000), (DEFAULT, 250) '
    'RETURNING id'
)

# Print out the returned values.
rows = cur.fetchall()
print('IDs:')
for row in rows:
    print([str(cell) for cell in row])

# Close the database connection.
cur.close()
conn.close()
~~~

The printed values would look like:

~~~
IDs:
['190019066706952193']
['190019066706984961']
~~~

</section>

<section class="filter-content" markdown="1" data-scope="ruby">

{% include copy-clipboard.html %}
~~~ ruby
# Import the driver.
require 'pg'

# Connect to the "bank" database.
conn = PG.connect(
    user: 'root',
    dbname: 'bank',
    host: 'localhost',
    port: 26257
)

# Insert two rows into the "accounts" table
# and return the "id" values generated server-side.
conn.exec(
    'INSERT INTO accounts (id, balance) '\
    'VALUES (DEFAULT, 1000), (DEFAULT, 250) '\
    'RETURNING id'
) do |res|

# Print out the returned values.
puts "IDs:"
    res.each do |row|
        puts row
    end
end

# Close communication with the database.
conn.close()
~~~

The printed values would look like:

~~~
IDs:
{"id"=>"190019066706952193"}
{"id"=>"190019066706984961"}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="go">

{% include copy-clipboard.html %}
~~~ go
package main

import (
        "database/sql"
        "fmt"
        "log"

        _ "github.com/lib/pq"
)

func main() {
        //Connect to the "bank" database.
        db, err := sql.Open(
                "postgres",
                "postgresql://root@localhost:26257/bank?sslmode=disable"
        )
        if err != nil {
                log.Fatal("error connecting to the database: ", err)
        }

        // Insert two rows into the "accounts" table
        // and return the "id" values generated server-side.
        rows, err := db.Query(
                "INSERT INTO accounts (id, balance) " +
                "VALUES (DEFAULT, 1000), (DEFAULT, 250) " +
                "RETURNING id",
        )
        if err != nil {
                log.Fatal(err)
        }

        // Print out the returned values.
        defer rows.Close()
        fmt.Println("IDs:")
        for rows.Next() {
                var id int
                if err := rows.Scan(&id); err != nil {
                        log.Fatal(err)
                }
                fmt.Printf("%d\n", id)
        }
}
~~~

The printed values would look like:

~~~
IDs:
190019066706952193
190019066706984961
~~~

</section>

<section class="filter-content" markdown="1" data-scope="js">

{% include copy-clipboard.html %}
~~~ js
var async = require('async');

// Require the driver.
var pg = require('pg');

// Connect to the "bank" database.
var config = {
  user: 'root',
  host: 'localhost',
  database: 'bank',
  port: 26257
};

pg.connect(config, function (err, client, done) {
  // Closes communication with the database and exits.
  var finish = function () {
    done();
    process.exit();
  };

  if (err) {
    console.error('could not connect to cockroachdb', err);
    finish();
  }
  async.waterfall([
    function (next) {
      // Insert two rows into the "accounts" table
      // and return the "id" values generated server-side.
      client.query(
        `INSERT INTO accounts (id, balance)
         VALUES (DEFAULT, 1000), (DEFAULT, 250)
         RETURNING id;`,
        next
      );
    }
  ],
  function (err, results) {
    if (err) {
      console.error('error inserting into and selecting from accounts', err);
      finish();
    }
    // Print out the returned values.
    console.log('IDs:');
    results.rows.forEach(function (row) {
      console.log(row);
    });

    finish();
  });
});
~~~

The printed values would look like:

~~~
IDs:
{ id: '190019066706952193' }
{ id: '190019066706984961' }
~~~

</section>

### Update Values `ON CONFLICT`

When a uniqueness conflict is detected, CockroachDB stores the row in a temporary table called `excluded`. This example demonstrates how you use the columns in the temporary `excluded` table to apply updates on conflict:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts (id, balance)
    VALUES (8, 500.50)
    ON CONFLICT (id)
    DO UPDATE SET balance = excluded.balance;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts WHERE id = 8;
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  8 |  500.50 |
+----+---------+
~~~


You can also update the row using an existing value:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts (id, balance)
    VALUES (8, 500.50)
    ON CONFLICT (id)
    DO UPDATE SET balance = accounts.balance + excluded.balance;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts WHERE id = 8;
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  8 | 1001.00 |
+----+---------+
~~~

You can also use a `WHERE` clause to apply the `DO UPDATE SET` expression conditionally:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts (id, balance)
    VALUES (8, 700)
    ON CONFLICT (id)
    DO UPDATE SET balance = excluded.balance
    WHERE excluded.balance > accounts.balance;
~~~

~~~ sql
> SELECT * FROM accounts WHERE id = 8;
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  8 |     800 |
+----+---------+
(1 row)
~~~

### Do Not Update Values `ON CONFLICT`

In this example, we get an error from a uniqueness conflict:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts WHERE id = 8;
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  8 |   500.5 |
+----+---------+
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts (id, balance) VALUES (8, 125.50);
~~~

~~~
pq: duplicate key value (id)=(8) violates unique constraint "primary"
~~~

In this example, we use `ON CONFLICT DO NOTHING` to ignore the uniqueness error and prevent the affected row from being updated:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts (id, balance)
    VALUES (8, 125.50)
    ON CONFLICT (id)
    DO NOTHING;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts WHERE id = 8;
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  8 |   500.5 |
+----+---------+
~~~

In this example, `ON CONFLICT DO NOTHING` prevents the first row from updating while allowing the second row to be inserted:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts (id, balance)
    VALUES (8, 125.50), (10, 450)
    ON CONFLICT (id)
    DO NOTHING;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts WHERE id in (8, 10);
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  8 |   500.5 |
| 10 |     450 |
+----+---------+
~~~

## See Also

- [Selection Queries](selection-queries.html)
- [`DELETE`](delete.html)
- [`UPDATE`](update.html)
- [`UPSERT`](upsert.html)
- [`TRUNCATE`](truncate.html)
- [`ALTER TABLE`](alter-table.html)
- [`DROP TABLE`](drop-table.html)
- [`DROP DATABASE`](drop-database.html)
- [Other SQL Statements](sql-statements.html)
