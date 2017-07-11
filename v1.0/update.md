---
title: UPDATE
summary: The UPDATE statement updates rows in a table.
toc: false
---

The `UPDATE` [statement](sql-statements.html) updates rows in a table.

<div id="toc"></div>

## Required Privileges 

The user must have the `SELECT` and `UPDATE` [privileges](privileges.html) on the table.

## Synopsis

<div>{% include sql/diagrams/update.html %}</div>


### Update and Return Values

In this example, the `RETURNING` clause returns the `id` values of the rows updated, which are generated server-side by the `unique_rowid()` function. The language-specific versions assume that you have installed the relevant [client drivers](install-client-drivers.html).

{{site.data.alerts.callout_success}}This use of <code>RETURNING</code> mirrors the behavior of MySQL's <code>last_insert_id()</code> function.{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}When a driver provides a <code>query()</code> method for statements that return results and an <code>exec()</code> method for statements that don't (e.g., Go), it's likely necessary to use the <code>query()</code> method for <code>UPDATE</code> statements with <code>RETURNING</code>.{{site.data.alerts.end}}

<div class="filters clearfix">
    <button class="filter-button" data-scope="shell">Shell</button>
    <button class="filter-button" data-scope="python">Python</button>
    <button class="filter-button" data-scope="ruby">Ruby</button>
    <button class="filter-button" data-scope="go">Go</button>
    <button class="filter-button" data-scope="js">Node.js</button>
</div>

<div class="filter-content" markdown="1" data-scope="shell">
<p></p>
~~~ sql
> UPDATE accounts SET balance = DEFAULT WHERE id = 1 RETURNING id;
~~~

~~~
+----+
| id |
+----+
|  1 |
+----+
(1 row)
~~~

</div>

<div class="filter-content" markdown="1" data-scope="python">
<p></p>

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
    'UPDATE accounts SET balance = DEFAULT WHERE id = 1 RETURNING id'
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
['1']
~~~

</div>

<div class="filter-content" markdown="1" data-scope="ruby">
<p></p>

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
    'UPDATE accounts SET balance = DEFAULT WHERE id = 1 RETURNING id'
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
{"id"=>"1"}
~~~

</div>

<div class="filter-content" markdown="1" data-scope="go">
<p></p>

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
                "UPDATE accounts SET balance = DEFAULT WHERE id = 1 RETURNING id",
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
1
~~~

</div>

<div class="filter-content" markdown="1" data-scope="js">
<p></p>

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
        `UPDATE accounts SET balance = DEFAULT WHERE id = 1 RETURNING id`,
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

The printed values would like like:

~~~
IDs:
{ id: '1' }
~~~

</div>

## Parameters

Parameter | Description
----------|------------
`table_name` | The name of the table that contains the rows you want to update.
`AS name` | An alias for the table name. When an alias is provided, it completely hides the actual table name.
`column_name` | The name of the column whose values you want to update. To update the values of multiple columns, use a comma-separated list of column names.
`a_expr` | The new value you want to use, the [aggregate function](functions-and-operators.html#aggregate-functions) you want to perform, or the [value expression](sql-expressions.html) you want to use.
`DEFAULT` | To fill columns with their [default values](default-value.html), use `DEFAULT VALUES` in place of `a_expr`. To fill a specific column with its default value, leave the value out of the `a_expr` or use `DEFAULT` at the appropriate position. 
`column_name_list` | A comma-separated list of column names, in parentheses.
`select_with_parens` | A comma-separated list of values or [value expressions](sql-expressions.html), in parentheses. To update values of multiple rows, use a comma-separated list of parentheses. <br><br>Each value must match the [data type](data-types.html) of its column. Also, if column names are listed (`qualified_name_list`), values must be in corresponding order; otherwise, they must follow the declared order of the columns in the table.
`WHERE a_expr`| `a_expr` must be an expression that returns Boolean values using columns (e.g. `<column> = <value>`). Update rows that return `TRUE`.<br><br>__Without a `WHERE` clause in your statement, `UPDATE` updates all rows from the table.
`RETURNING target_list` | Return values based on rows updated, where `target_list` can be specific column names from the table, `*` for all columns, or a computation on specific columns. <br><br>To return nothing in the response, not even the number of rows updated, use `RETURNING NOTHING`.<br><br>.

## Examples

### Update a Single Row

~~~ sql
> SELECT * FROM accounts;
~~~
~~~
+----+----------+----------+
| id | balance  | customer |
+----+----------+----------+
|  1 | 10000.50 | michael  |
|  2 |   4000.0 | jim      |
|  3 |   8700.0 | pam      |
|  4 |   3400.0 | andy     |
+----+----------+----------+
(4 rows)
~~~

~~~ sql
> UPDATE accounts SET balance = 5000.0 WHERE id = 2;

> SELECT * FROM accounts;
~~~
~~~
+----+----------+----------+
| id | balance  | customer |
+----+----------+----------+
|  1 | 10000.50 | michael  |
|  2 |   5000.0 | jim      |
|  3 |   8700.0 | pam      |
|  4 |   3400.0 | andy     |
+----+----------+----------+
(4 rows)
~~~

~~~ sql
> UPDATE accounts SET (balance, customer) = (9000.0, 'kelly') WHERE id = 2;

> SELECT * FROM accounts;
~~~
~~~
+----+----------+----------+
| id | balance  | customer |
+----+----------+----------+
|  1 | 10000.50 | michael  |
|  2 |   9000.0 | kelly   |
|  3 |   8700.0 | pam      |
|  4 |   3400.0 | andy     |
+----+----------+----------+
(4 rows)
~~~

~~~ sql
> UPDATE accounts SET balance = 6300.0, customer = 'stanley' WHERE id = 3;

> SELECT * FROM accounts;
~~~

~~~
+----+----------+----------+
| id | balance  | customer |
+----+----------+----------+
|  1 | 10000.50 | michael  |
|  2 |   9000.0 | kelly   |
|  3 |   6300.0 | stanley  |
|  4 |   3400.0 | andy     |
+----+----------+----------+
(4 rows)
~~~

### Update with default values

~~~ sql
> UPDATE accounts SET balance = DEFAULT where customer = 'stanley';

> SELECT * FROM accounts;
~~~
~~~
+----+----------+----------+
| id | balance  | customer |
+----+----------+----------+
|  1 | 10000.50 | michael  |
|  2 |   9000.0 | kelly    |
|  3 | NULL     | stanley  |
|  4 |   3400.0 | andy     |
+----+----------+----------+
(4 rows)
~~~

### Update from a SELECT statement
~~~ sql
> UPDATE accounts SET (balance, customer) = (SELECT balance, customer FROM accounts WHERE id = 2) WHERE id = 4;

> SELECT * FROM accounts;
~~~

~~~
+----+----------+----------+
| id | balance  | customer |
+----+----------+----------+
|  1 | 10000.50 | michael  |
|  2 |   9000.0 | kelly    |
|  3 | NULL     | stanley  |
|  4 |   9000.0 | kelly    |
+----+----------+----------+
(4 rows)
~~~

### Update All Rows

{{site.data.alerts.callout_danger}}If you don't use the WHERE clause to specify the rows to be updated, the values for all rows will be updated.{{site.data.alerts.end}}

~~~ sql
> UPDATE accounts SET balance = 5000.0;

> SELECT * FROM accounts;
~~~ 
~~~
+----+---------+----------+
| id | balance | customer |
+----+---------+----------+
|  1 |  5000.0 | michael  |
|  2 |  5000.0 | kelly    |
|  3 |  5000.0 | stanley  |
|  4 |  5000.0 | kelly    |
+----+---------+----------+
(4 rows)
~~~


### Update and return values

~~~ sql
> UPDATE accounts SET balance = DEFAULT WHERE id = 1 RETURNING *;
~~~
~~~
+----+---------+----------+
| id | balance | customer |
+----+---------+----------+
|  1 | NULL    | michael  |
+----+---------+----------+
(1 row)
~~~




















