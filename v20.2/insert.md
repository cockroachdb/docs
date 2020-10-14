---
title: INSERT
summary: The INSERT statement inserts one or more rows into a table.
toc: true
---

The `INSERT` [statement](sql-statements.html) inserts one or more rows into a table. In cases where inserted values conflict with uniqueness constraints, the `ON CONFLICT` clause can be used to update rather than insert rows.


## Performance best practices

- To bulk-insert data into an existing table, batch multiple rows in one [multi-row `INSERT`](#insert-multiple-rows-into-an-existing-table) statement. Experimentally determine the optimal batch size for your application by monitoring the performance for different batch sizes (10 rows, 100 rows, 1000 rows). Do not include multi-row `INSERT` statements within an explicit transaction.

    {{site.data.alerts.callout_success}}
    You can also use the [`IMPORT INTO`](import-into.html) statement to bulk-insert CSV data into an existing table.
    {{site.data.alerts.end}}

    {{site.data.alerts.callout_info}}
    Large multi-row `INSERT` queries can lead to long-running transactions that result in [transaction retry errors](transaction-retry-error-reference.html). If a multi-row `INSERT` query results in an error code [`40001` with the message `"transaction deadline exceeded"`](transaction-retry-error-reference.html#retry_commit_deadline_exceeded), we recommend breaking up the query up into smaller batches of rows.
    {{site.data.alerts.end}}

- To bulk-insert data into a new table, the [`IMPORT`](import.html) statement performs better than `INSERT`.
- In traditional SQL databases, generating and retrieving unique IDs involves using `INSERT` with `SELECT`. In CockroachDB, use `RETURNING` clause with `INSERT` instead. See [Insert and Return Values](#insert-and-return-values) for more details.

## Required privileges

The user must have the `INSERT` [privilege](authorization.html#assign-privileges) on the table.
To use `ON CONFLICT`, the user must also have the `SELECT` privilege on the table.
To use `ON CONFLICT DO UPDATE`, the user must additionally have the `UPDATE` privilege on the table.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/insert.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`common_table_expr` | See [Common Table Expressions](common-table-expressions.html).
`table_name` | The table you want to write data to.|
`AS table_alias_name` | An alias for the table name. When an alias is provided, it completely hides the actual table name.
`column_name` | The name of a column to populate during the insert.
`select_stmt` | A [selection query](selection-queries.html). Each value must match the [data type](data-types.html) of its column. Also, if column names are listed after `INTO`, values must be in corresponding order; otherwise, they must follow the declared order of the columns in the table.
`DEFAULT VALUES` | To fill all columns with their [default values](default-value.html), use `DEFAULT VALUES` in place of `select_stmt`. To fill a specific column with its default value, leave the value out of the `select_stmt` or use `DEFAULT` at the appropriate position. See the [Insert Default Values](#insert-default-values) examples below.
`RETURNING target_list` | Return values based on rows inserted, where `target_list` can be specific column names from the table, `*` for all columns, or computations using [scalar expressions](scalar-expressions.html). See the [Insert and Return Values](#insert-and-return-values) example below.

### `ON CONFLICT` clause

<div>
  {% include {{ page.version.version }}/sql/diagrams/on_conflict.html %}
</div>

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
statement. However, `UPSERT` does not let you specify the column(s) with
the unique constraint; it always uses the column(s) from the primary
key. Using `ON CONFLICT` is therefore more flexible.

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Insert a single row

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO users (id, city, name, address, credit_card) VALUES
    ('c28f5c28-f5c2-4000-8000-000000000026', 'new york', 'Petee', '101 5th Ave', '1234567890');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM users WHERE city='new york';
~~~

~~~
                   id                  |   city   |       name       |           address           | credit_card
+--------------------------------------+----------+------------------+-----------------------------+-------------+
  00000000-0000-4000-8000-000000000000 | new york | Robert Murphy    | 99176 Anderson Mills        | 8885705228
  051eb851-eb85-4ec0-8000-000000000001 | new york | James Hamilton   | 73488 Sydney Ports Suite 57 | 8340905892
  0a3d70a3-d70a-4d80-8000-000000000002 | new york | Judy White       | 18580 Rosario Ville Apt. 61 | 2597958636
  0f5c28f5-c28f-4c00-8000-000000000003 | new york | Devin Jordan     | 81127 Angela Ferry Apt. 8   | 5614075234
  147ae147-ae14-4b00-8000-000000000004 | new york | Catherine Nelson | 1149 Lee Alley              | 0792553487
  c28f5c28-f5c2-4000-8000-000000000026 | new york | Petee            | 101 5th Ave                 | 1234567890
(6 rows)
~~~

If you do not list column names, the statement will use the columns of the table in their declared order:

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM users;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
+-------------+-----------+-------------+----------------+-----------------------+-----------+-----------+
  id          | UUID      |    false    | NULL           |                       | {primary} |   false
  city        | STRING    |    false    | NULL           |                       | {primary} |   false
  name        | STRING    |    true     | NULL           |                       | {}        |   false
  address     | STRING    |    true     | NULL           |                       | {}        |   false
  credit_card | STRING    |    true     | NULL           |                       | {}        |   false
(5 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO users VALUES
    ('1eb851eb-851e-4800-8000-000000000006', 'chicago', 'Adam Driver', '201 E Randolph St', '2468013579');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM users WHERE city IN ('chicago', 'new york');
~~~

~~~
                   id                  |   city   |       name       |            address             | credit_card
+--------------------------------------+----------+------------------+--------------------------------+-------------+
  1eb851eb-851e-4800-8000-000000000006 | chicago  | Adam Driver      | 201 E Randolph St              | 2468013579
  80000000-0000-4000-8000-000000000019 | chicago  | Matthew Clay     | 49220 Lisa Junctions           | 9132291015
  851eb851-eb85-4000-8000-00000000001a | chicago  | Samantha Coffey  | 6423 Jessica Underpass Apt. 87 | 9437219051
  8a3d70a3-d70a-4000-8000-00000000001b | chicago  | Jessica Martinez | 96676 Jennifer Knolls Suite 91 | 1601930189
  8f5c28f5-c28f-4000-8000-00000000001c | chicago  | John Hines       | 45229 Howard Manors Suite 22   | 7541086746
  947ae147-ae14-4800-8000-00000000001d | chicago  | Kenneth Barnes   | 35627 Chelsey Tunnel Suite 94  | 2099932769
  00000000-0000-4000-8000-000000000000 | new york | Robert Murphy    | 99176 Anderson Mills           | 8885705228
  051eb851-eb85-4ec0-8000-000000000001 | new york | James Hamilton   | 73488 Sydney Ports Suite 57    | 8340905892
  0a3d70a3-d70a-4d80-8000-000000000002 | new york | Judy White       | 18580 Rosario Ville Apt. 61    | 2597958636
  0f5c28f5-c28f-4c00-8000-000000000003 | new york | Devin Jordan     | 81127 Angela Ferry Apt. 8      | 5614075234
  147ae147-ae14-4b00-8000-000000000004 | new york | Catherine Nelson | 1149 Lee Alley                 | 0792553487
  c28f5c28-f5c2-4000-8000-000000000026 | new york | Petee            | 101 5th Ave                    | 1234567890
(12 rows)
~~~


### Insert multiple rows into an existing table

Multi-row inserts are faster than multiple single-row `INSERT` statements. As a performance best practice, we recommend batching multiple rows in one multi-row `INSERT` statement instead of using multiple single-row `INSERT` statements. Experimentally determine the optimal batch size for your application by monitoring the performance for different batch sizes (10 rows, 100 rows, 1000 rows).

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO users (id, city, name, address, credit_card) VALUES
    ('8a3d70a3-d70a-4000-8000-00000000001b', 'seattle', 'Eric', '400 Broad St', '0987654321'),
    ('9eb851eb-851e-4800-8000-00000000001f', 'new york', 'Harry Potter', '214 W 43rd St', '5678901234');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM users WHERE city IN ('seattle', 'new york');
~~~

~~~
                   id                  |   city   |       name       |            address            | credit_card
+--------------------------------------+----------+------------------+-------------------------------+-------------+
  00000000-0000-4000-8000-000000000000 | new york | Robert Murphy    | 99176 Anderson Mills          | 8885705228
  051eb851-eb85-4ec0-8000-000000000001 | new york | James Hamilton   | 73488 Sydney Ports Suite 57   | 8340905892
  0a3d70a3-d70a-4d80-8000-000000000002 | new york | Judy White       | 18580 Rosario Ville Apt. 61   | 2597958636
  0f5c28f5-c28f-4c00-8000-000000000003 | new york | Devin Jordan     | 81127 Angela Ferry Apt. 8     | 5614075234
  147ae147-ae14-4b00-8000-000000000004 | new york | Catherine Nelson | 1149 Lee Alley                | 0792553487
  9eb851eb-851e-4800-8000-00000000001f | new york | Harry Potter     | 214 W 43rd St                 | 5678901234
  c28f5c28-f5c2-4000-8000-000000000026 | new york | Petee            | 101 5th Ave                   | 1234567890
  428f5c28-f5c2-4000-8000-00000000000d | seattle  | Anita Atkinson   | 27684 Laura Villages Suite 80 | 9800065169
  47ae147a-e147-4000-8000-00000000000e | seattle  | Patricia Herrera | 80588 Perez Camp              | 6812041796
  4ccccccc-cccc-4c00-8000-00000000000f | seattle  | Holly Williams   | 95153 Harvey Street Suite 5   | 2165526885
  51eb851e-b851-4c00-8000-000000000010 | seattle  | Ryan Hickman     | 21187 Dennis Village          | 1635328127
  8a3d70a3-d70a-4000-8000-00000000001b | seattle  | Eric             | 400 Broad St                  | 0987654321
(12 rows)
~~~

{{site.data.alerts.callout_info}}
You can also use the [`IMPORT INTO`](import-into.html) statement to bulk-insert CSV data into an existing table.
{{site.data.alerts.end}}

### Insert multiple rows into a new table

The [`IMPORT`](import.html) statement performs better than `INSERT` when inserting rows into a new table.

### Insert from a `SELECT` statement

Suppose that you want MovR to offer ride-sharing services, in addition to vehicle-sharing services. You can create a `drivers` table from a subset of the `users` table.

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE drivers (
    id UUID DEFAULT gen_random_uuid(),
    city STRING,
    name STRING,
    dl STRING UNIQUE CHECK (LENGTH(dl) < 8),
    address STRING,
    CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC)
);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO drivers (id, city, name, address)
    SELECT id, city, name, address FROM users
    WHERE name IN ('Anita Atkinson', 'Devin Jordan');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM drivers;
~~~

~~~
                   id                  |   city   |      name      |  dl  |            address
+--------------------------------------+----------+----------------+------+-------------------------------+
  0f5c28f5-c28f-4c00-8000-000000000003 | new york | Devin Jordan   | NULL | 81127 Angela Ferry Apt. 8
  428f5c28-f5c2-4000-8000-00000000000d | seattle  | Anita Atkinson | NULL | 27684 Laura Villages Suite 80
(2 rows)
~~~

### Insert default values

To check the [default values](default-value.html) for columns in a table, use the [`SHOW CREATE TABLE`](show-create.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE drivers;
~~~

~~~
  table_name |                     create_statement
+------------+----------------------------------------------------------+
  drivers    | CREATE TABLE drivers (
             |     id UUID NOT NULL DEFAULT gen_random_uuid(),
             |     city STRING NOT NULL,
             |     name STRING NULL,
             |     dl STRING NULL,
             |     address STRING NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     UNIQUE INDEX drivers_dl_key (dl ASC),
             |     FAMILY "primary" (id, city, name, dl, address),
             |     CONSTRAINT check_dl CHECK (length(dl) < 8)
             | )
(1 row)
~~~

If the `DEFAULT` value constraint is not specified and an explicit value is not given, a value of *NULL* is assigned to the column.

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO drivers (city, name) VALUES ('seattle', 'Bobby');
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO drivers (city, name, id) VALUES ('chicago', 'Terry', DEFAULT);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM drivers WHERE name in ('Bobby', 'Terry');
~~~

~~~
                   id                  |  city   | name  |  dl  | address
+--------------------------------------+---------+-------+------+---------+
  c8d36f0e-9eb4-439f-b3d0-029af184d24b | chicago | Terry | NULL | NULL
  af2e8122-bf87-4736-bde9-a42ad0857351 | seattle | Bobby | NULL | NULL
(2 rows)
~~~

To create a new row with only default values, use `INSERT INTO <table> DEFAULT VALUES`. Running this command on the `drivers` table results in an error because the `city` column in `drivers` cannot be *NULL*, and has no default value specified.

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO drivers DEFAULT VALUES;
~~~

~~~
pq: null value in column "city" violates not-null constraint
~~~

### Insert and return values

In this example, the `RETURNING` clause returns the `id` values of the rows inserted, which are generated server-side by the `gen_random_uuid()` function. The language-specific versions assume that you have installed the relevant [client drivers](install-client-drivers.html).

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
> INSERT INTO drivers (id, city)
  VALUES (DEFAULT, 'seattle'), (DEFAULT, 'chicago')
  RETURNING id;
~~~

~~~
                   id
+--------------------------------------+
  b7750a60-91f2-404e-9cd1-5a3c310c1c9d
  c85e637e-2b03-4a52-bc54-1e1f6d7fd89b
(2 rows)
~~~

</section>

<section class="filter-content" markdown="1" data-scope="python">

{% include copy-clipboard.html %}
~~~ python
# Import the driver.
import psycopg2

# Connect to the "movr" database.
conn = psycopg2.connect(
    database='movr',
    user='root',
    host='localhost',
    port=26257
)

# Make each statement commit immediately.
conn.set_session(autocommit=True)

# Open a cursor to perform database operations.
cur = conn.cursor()

# Insert two rows into the "drivers" table
# and return the "id" values generated server-side.
cur.execute(
    "INSERT INTO drivers (id, city) "
    "VALUES (DEFAULT, 'seattle'), (DEFAULT, 'chicago') "
    "RETURNING id"
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
['cdd379e3-2d0b-4622-8ba8-4f0a1edfbc8e']
['4224b360-b1b0-4e4d-aba2-a35c64cdf404']
~~~

</section>

<section class="filter-content" markdown="1" data-scope="ruby">

{% include copy-clipboard.html %}
~~~ ruby
# Import the driver.
require 'pg'

# Connect to the "movr" database.
conn = PG.connect(
    user: 'root',
    dbname: 'movr',
    host: 'localhost',
    port: 26257
)

# Insert two rows into the "drivers" table
# and return the "id" values generated server-side.
conn.exec(
    "INSERT INTO drivers (id, city) "\
    "VALUES (DEFAULT, 'seattle'), (DEFAULT, 'chicago') "\
    "RETURNING id"
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
{"id"=>"cdd379e3-2d0b-4622-8ba8-4f0a1edfbc8e"}
{"id"=>"4224b360-b1b0-4e4d-aba2-a35c64cdf404"}
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
	//Connect to the "movr" database.
	db, err := sql.Open(
		"postgres",
		"postgresql://root@localhost:26257/movr?sslmode=disable",
	)
	if err != nil {
		log.Fatal("error connecting to the database: ", err)
	}

	// Insert two rows into the "drivers" table
	// and return the "id" values generated server-side.
	rows, err := db.Query(
		"INSERT INTO drivers (id, city) " +
			"VALUES (DEFAULT, 'seattle'), (DEFAULT, 'chicago') " +
			"RETURNING id",
	)
	if err != nil {
		log.Fatal(err)
	}

	// Print out the returned values.
	defer rows.Close()
	fmt.Println("IDs:")
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			log.Fatal(err)
		}
		fmt.Printf("%s\n", id)
	}
}
~~~

The printed values would look like:

~~~
IDs:
cdd379e3-2d0b-4622-8ba8-4f0a1edfbc8e
4224b360-b1b0-4e4d-aba2-a35c64cdf404
~~~

</section>

<section class="filter-content" markdown="1" data-scope="js">

{% include copy-clipboard.html %}
~~~ js
var async = require('async')
var pg = require('pg')

// Config to connect to the "movr" database.
var config = {
    user: 'root',
    host: 'localhost',
    database: 'movr',
    port: 26257
  }

// Create pool
var pool = new pg.Pool(config)

pool.connect(function (err, client, done) {

    // Close communication with the database and exit.
    var finish = function () {
        done()
        process.exit()
    }

    if (err) {
        console.error('could not connect to cockroachdb', err)
        finish()
    }
  async.waterfall([
    function (next) {
      // Insert two rows into the "drivers" table
      // and return the "id" values generated server-side.
      client.query(
        `INSERT INTO drivers (id, city)
         VALUES (DEFAULT, 'seattle'), (DEFAULT, 'chicago')
         RETURNING id`,
        next
      )
    }
  ],
  function (err, results) {
    if (err) {
      console.error('error inserting into and selecting from drivers', err)
      finish()
    }
    // Print out the returned values.
    console.log('IDs:')
    results.rows.forEach(function (row) {
      console.log(row)
    })

    finish()
  })
})
~~~

The printed values would look like:

~~~
IDs:
{ id: 'cdd379e3-2d0b-4622-8ba8-4f0a1edfbc8e' }
{ id: '4224b360-b1b0-4e4d-aba2-a35c64cdf404' }
~~~

</section>

### Update values `ON CONFLICT`

When a uniqueness conflict is detected, CockroachDB stores the row in a temporary table called `excluded`. This example demonstrates how you use the columns in the temporary `excluded` table to apply updates on conflict.

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO user_promo_codes (city, user_id, code, "timestamp", usage_count)
    VALUES ('new york', '147ae147-ae14-4b00-8000-000000000004', 'promo_code', now(), 1)
    ON CONFLICT (city, user_id, code)
    DO UPDATE SET usage_count = excluded.usage_count;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM user_promo_codes WHERE code = 'promo_code';
~~~

~~~
    city   |               user_id                |    code    |            timestamp             | usage_count
+----------+--------------------------------------+------------+----------------------------------+-------------+
  new york | 147ae147-ae14-4b00-8000-000000000004 | promo_code | 2019-08-12 14:23:52.262849+00:00 |           1
(1 row)
~~~

You can also update the row using an existing value:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO user_promo_codes (city, user_id, code, "timestamp", usage_count)
    VALUES ('new york', '147ae147-ae14-4b00-8000-000000000004', 'promo_code', now(), 1)
    ON CONFLICT (city, user_id, code)
    DO UPDATE SET ("timestamp", usage_count) = (now(), user_promo_codes.usage_count + excluded.usage_count);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM user_promo_codes WHERE code = 'promo_code';
~~~

~~~
    city   |               user_id                |    code    |            timestamp             | usage_count
+----------+--------------------------------------+------------+----------------------------------+-------------+
  new york | 147ae147-ae14-4b00-8000-000000000004 | promo_code | 2019-08-12 14:26:50.697382+00:00 |           2
(1 row)
~~~

You can also use a `WHERE` clause to apply the `DO UPDATE SET` expression conditionally:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO user_promo_codes (city, user_id, code, "timestamp", usage_count)
    VALUES ('new york', '147ae147-ae14-4b00-8000-000000000004', 'promo_code', now(), 3)
    ON CONFLICT (city, user_id, code)
    DO UPDATE SET ("timestamp", usage_count) = (now(), user_promo_codes.usage_count + excluded.usage_count)
    WHERE excluded.usage_count = 1;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM user_promo_codes WHERE code = 'promo_code';
~~~

~~~
    city   |               user_id                |    code    |            timestamp             | usage_count
+----------+--------------------------------------+------------+----------------------------------+-------------+
  new york | 147ae147-ae14-4b00-8000-000000000004 | promo_code | 2019-08-12 14:26:50.697382+00:00 |           2
(1 row)
~~~

### Do not update values `ON CONFLICT`

In this example, we get an error from a uniqueness conflict.

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO user_promo_codes (city, user_id, code, "timestamp", usage_count)
    VALUES ('new york', '147ae147-ae14-4b00-8000-000000000004', 'promo_code', now(), 1);
~~~

~~~
pq: duplicate key value (city,user_id,code)=('new york','147ae147-ae14-4b00-8000-000000000004','promo_code') violates unique constraint "primary"
~~~

In this example, we use `ON CONFLICT DO NOTHING` to ignore the uniqueness error and prevent the affected row from being updated:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO user_promo_codes (city, user_id, code, "timestamp", usage_count)
    VALUES ('new york', '147ae147-ae14-4b00-8000-000000000004', 'promo_code', now(), 1)
    ON CONFLICT (city, user_id, code)
    DO NOTHING;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM user_promo_codes WHERE code = 'promo_code';
~~~

~~~
    city   |               user_id                |    code    |            timestamp             | usage_count
+----------+--------------------------------------+------------+----------------------------------+-------------+
  new york | 147ae147-ae14-4b00-8000-000000000004 | promo_code | 2019-08-12 14:26:50.697382+00:00 |           2
(1 row)
~~~

In this example, `ON CONFLICT DO NOTHING` prevents the first row from updating while allowing the second row to be inserted:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO user_promo_codes (city, user_id, code, "timestamp", usage_count)
    VALUES ('new york', '147ae147-ae14-4b00-8000-000000000004', 'promo_code', now(), 1), ('new york', '147ae147-ae14-4b00-8000-000000000004', 'new_promo', now(), 1)
    ON CONFLICT (city, user_id, code)
    DO NOTHING;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM user_promo_codes WHERE code in ('promo_code', 'new_promo');
~~~

~~~
    city   |               user_id                |    code    |            timestamp             | usage_count
+----------+--------------------------------------+------------+----------------------------------+-------------+
  new york | 147ae147-ae14-4b00-8000-000000000004 | new_promo  | 2019-08-12 14:30:16.666848+00:00 |           1
  new york | 147ae147-ae14-4b00-8000-000000000004 | promo_code | 2019-08-12 14:26:50.697382+00:00 |           2
(2 rows)
~~~

### Import data containing duplicate rows using `ON CONFLICT` and `DISTINCT ON`

If the input data for `INSERT ON CONFLICT` contains duplicate rows,
you must use [`DISTINCT
ON`](select-clause.html#eliminate-duplicate-rows) to remove these
duplicates.

For example:

{% include copy-clipboard.html %}
~~~ sql
> WITH inputrows (city, user_id, code, "timestamp", usage_count)
    AS (VALUES ('new york', '147ae147-ae14-4b00-8000-000000000004'::uuid, 'promo_code', now()::timestamp, 0), ('new york', '147ae147-ae14-4b00-8000-000000000004'::uuid, 'new_promo', now()::timestamp, 2))
    INSERT INTO user_promo_codes (city, user_id, code, "timestamp", usage_count)
    (SELECT DISTINCT ON(city, user_id, code) * FROM inputrows)
    ON CONFLICT (city, user_id, code)
    DO NOTHING;
~~~

The `DISTINCT ON` clause does not guarantee which of the duplicates is
considered. To force the selection of a particular duplicate, use an
`ORDER BY` clause:

{% include copy-clipboard.html %}
~~~ sql
> WITH inputrows (city, user_id, code, "timestamp", usage_count)
    AS (VALUES ('new york', '147ae147-ae14-4b00-8000-000000000004'::uuid, 'promo_code', now()::timestamp, 0), ('new york', '147ae147-ae14-4b00-8000-000000000004'::uuid, 'new_promo', now()::timestamp, 2))
    INSERT INTO user_promo_codes (city, user_id, code, "timestamp", usage_count)
    (SELECT DISTINCT ON(city, user_id, code) * FROM inputrows ORDER BY (city, user_id, code, usage_count))
    ON CONFLICT (city, user_id, code)
    DO NOTHING;
~~~

{{site.data.alerts.callout_info}}
Using `DISTINCT ON` incurs a performance cost to search and eliminate duplicates.
For best performance, avoid using it when the input is known to not contain duplicates.
{{site.data.alerts.end}}

## See also

- [Ordering of rows in DML statements](query-order.html#ordering-rows-in-dml-statements)
- [Selection Queries](selection-queries.html)
- [`DELETE`](delete.html)
- [`UPDATE`](update.html)
- [`UPSERT`](upsert.html)
- [`TRUNCATE`](truncate.html)
- [`ALTER TABLE`](alter-table.html)
- [`DROP TABLE`](drop-table.html)
- [`DROP DATABASE`](drop-database.html)
- [Other SQL Statements](sql-statements.html)
