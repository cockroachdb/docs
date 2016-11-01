---
title: INSERT
summary: The INSERT statement inserts one or more rows into a table.
toc: false
---

The `INSERT` [statement](sql-statements.html) inserts one or more rows into a table. In cases where inserted values conflict with uniqueness constraints, the `ON CONFLICT` clause can be used to update rather than insert rows. 

<div id="toc"></div>

## Required Privileges

The user must have the `INSERT` [privilege](privileges.html) on the table. To use `ON CONFLICT DO UPDATE`, the user must also have the `UPDATE` privilege on the table.

## Synopsis

{% include sql/diagrams/insert.html %}

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

Parameter | Description
----------|------------
`qualified_name` | The name of the table to insert into.
`AS name` | An alias for the table name. When an alias is provided, it completely hides the actual table name. 
`qualified_name_list` | A comma-separated list of column names, in parentheses.
`select_stmt` | A comma-separated list of column values for a single row, in parentheses. To insert values into multiple rows, use a comma-separated list of parentheses. Alternately, you can use [`SELECT`](select.html) statements to retrieve values from other tables and insert them as new rows. See the [Insert a Single Row](#insert-a-single-row), [Insert Multiple Rows](#insert-multiple-rows), [Insert from a `SELECT` Statement](#insert-from-a-select-statement) examples below.<br><br>Each value must match the [data type](data-types.html) of its column. Also, if column names are listed (`qualified_name_list`), values must be in corresponding order; otherwise, they must follow the declared order of the columns in the table. 
`DEFAULT VALUES` | To fill all columns with their [default values](constraints.html#default-value), use `DEFAULT VALUES` in place of `select_stmt`. To fill a specific column with its default value, leave the value out of the `select_stmt` or use `DEFAULT` at the appropriate position. See the [Insert Default Values](#insert-default-values) examples below.
`RETURNING target_list` | Return values based on rows inserted, where `target_list` can be specific column names from the table, `*` for all columns, or a computation on specific columns. See the [Insert and Return Values](#insert-and-return-values) example below.<br><br>Note that `RETURNING` is not supported for `INSERT` statements with `ON CONFLICT` clauses. 
`on_conflict` | Normally, when inserted values conflict with a `UNIQUE` constraint on one or more columns, CockroachDB returns an error. To update the affected rows instead, use an `ON CONFLICT` clause containing the column(s) with the unique constraint and the `DO UPDATE SET` expression set to the column(s) to be updated (any `SET` expression supported by the [`UPDATE`](update.html) statement is also supported here). To prevent the affected rows from updating while allowing new rows to be inserted, set `ON CONFLICT` to `DO NOTHING`. See the [Update Values `ON CONFLICT`](#update-values-on-conflict) and [Do Not Update Values `ON CONFLICT`](#do-not-update-values-on-conflict) examples below.<br><br>Note that it's not possible to update the same row twice with a single `INSERT ON CONFLICT` statement. Also, if the values in the `SET` expression cause uniqueness conflicts, CockroachDB will return an error.<br><br>As a short-hand alternative to the `ON CONFLICT` clause, you can use the [`UPSERT`](upsert.html) statement. However, `UPSERT` does not let you specify the column with the unique constraint; it assumes that the column is the primary key. Using `ON CONFLICT` is therefore more flexible.

## Examples

### Insert a Single Row

~~~ sql
> INSERT INTO accounts (balance, id) VALUES (10000.50, 1);

> SELECT * FROM accounts;
~~~
~~~
+----+---------+
| id | balance |
+----+---------+
|  1 | 10000.5 |
+----+---------+
~~~

If you don't list column names, the statement will use the columns of the table in their declared order:

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
~~~ sql
> INSERT INTO accounts VALUES (2, 20000.75);

> SELECT * FROM accounts;
+----+----------+
| id | balance  |
+----+----------+
|  1 |  10000.5 |
|  2 | 20000.75 |
+----+----------+
~~~

### Insert Multiple Rows

~~~ sql
> INSERT INTO accounts (id, balance) VALUES (3, 8100.73), (4, 9400.10);

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
+----+----------+
~~~

### Insert from a `SELECT` Statement

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
~~~ sql
> INSERT INTO accounts (id, balance) SELECT number, amount FROM other_accounts WHERE id > 4;

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

~~~ sql
> INSERT INTO accounts (id) VALUES (8);
> INSERT INTO accounts (id, balance) VALUES (9, DEFAULT);

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
~~~ sql
> INSERT INTO accounts DEFAULT VALUES;

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
  
In this example, the `RETURNING` clause returns the `id` and `balance` of the rows inserted. The language-specific versions assume that you have installed the relevant [client drivers](install-client-drivers.html). 
{{site.data.alerts.callout_success}}To mirror the behavior of MySQL's <code>LAST_INSERT_ID()</code> function, you would use <code>RETURNING</code> to return just the column containing the row ID.{{site.data.alerts.end}}

<div id="step-three-filters" class="filters clearfix">
    <button class="filter-button current" data-language="shell">Shell</button>
    <button class="filter-button" data-language="python">Python</button>
    <button class="filter-button" data-language="go">Go</button>
</div>

<div class="filter-content current" markdown="1" data-language="shell">
<p></p>
~~~ sql
> INSERT INTO accounts (id, balance) 
  VALUES (1, 1000), (2, 250) 
  RETURNING id, balance;
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  1 |    1000 |
|  2 |     250 |
+----+---------+
(2 rows)
~~~

</div>

<div class="filter-content" markdown="1" data-language="python">
<p></p>

~~~ py
# Import the driver.
import psycopg2

# Connect to the "bank" database.
conn = psycopg2.connect(database='bank', user='root', host='localhost', port=26257)

# Make each statement commit immediately.
conn.set_session(autocommit=True)

# Open a cursor to perform database operations.
cur = conn.cursor()

# Insert two rows into the "accounts" table and return the values inserted.
cur.execute("INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250) RETURNING id, balance")

# Print out the returned values.
rows = cur.fetchall()
print('Initial balances:')
for row in rows:
    print([str(cell) for cell in row])

# Close the database connection.
cur.close()
conn.close()
~~~

The printed values would look like:

~~~
Initial balances:
['1', '1000']
['2', '250']
~~~

</div>

<div class="filter-content" markdown="1" data-language="go">
<p></P>

~~~ go
package main

import (
        "database/sql"
        "fmt"
        "log"

        _ "github.com/lib/pq"
)

func main() {
        db, err := sql.Open("postgres", "postgresql://root@localhost:26257/bank?sslmode=disable")
        if err != nil {
                log.Fatalf("error connection to the database: %s", err)
        }

        // Insert two rows into the "accounts" table and return the values inserted.
        rows, err := db.Query(
                "INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250) RETURNING id, balance",
        )
        if err != nil {
                log.Fatal(err)
        }

        // Print out the returned values.
        defer rows.Close()
        fmt.Println("Initial balances:")
        for rows.Next() {
                var id, balance int
                if err := rows.Scan(&id, &balance); err != nil {
                        log.Fatal(err)
                }
                fmt.Printf("%d %d\n", id, balance)
        }
}
~~~

The printed values would look like:

~~~
Initial balances:
1 1000
2 250
~~~

</div>

### Update Values `ON CONFLICT`

When a uniqueness conflict is detected, CockroachDB stores the row in a temporary table called <code>excluded</code>. This example demonstrates how you use the columns in the temporary <code>excluded</code> table to apply updates on conflict:

~~~ sql
> INSERT INTO accounts (id, balance) 
    VALUES (8, 500.50) 
    ON CONFLICT (id) 
    DO UPDATE SET balance = excluded.balance;

> SELECT * FROM accounts WHERE id = 8;
~~~
~~~
+----+---------+
| id | balance |
+----+---------+
|  8 |   500.5 |
+----+---------+
~~~ 

### Do Not Update Values `ON CONFLICT`

In this example, we get an error from a uniqueness conflict:

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
~~~ sql
> INSERT INTO accounts (id, balance) VALUES (8, 125.50);
~~~
~~~
pq: duplicate key value (id)=(8) violates unique constraint "primary"
~~~

In this example, we use `ON CONFLICT DO NOTHING` to ignore the uniqueness error and prevent the affected row from being updated:

~~~ sql
> INSERT INTO accounts (id, balance) 
    VALUES (8, 125.50) 
    ON CONFLICT (id) 
    DO NOTHING;

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

~~~ sql
> INSERT INTO accounts (id, balance)
    VALUES (8, 125.50), (10, 450)
    ON CONFLICT (id)
    DO NOTHING;

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

- [`UPSERT`](upsert.html)
- [Other SQL Statements](sql-statements.html)

<script>
$(document).ready(function(){
    
    var $filter_button = $('.filter-button');

    $filter_button.on('click', function(){
        var language = $(this).data('language'), 
        $current_tab = $('.filter-button.current'), $current_content = $('.filter-content.current');

        //remove current class from tab and content
        $current_tab.removeClass('current');
        $current_content.removeClass('current');

        //add current class to clicked button and corresponding content block
        $('.filter-button[data-language="'+language+'"]').addClass('current');
        $('.filter-content[data-language="'+language+'"]').addClass('current');
    });
});
</script>
