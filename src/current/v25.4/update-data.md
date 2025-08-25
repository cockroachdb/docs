---
title: Update Data
summary: How to update the data in CockroachDB from various programming languages
toc: true
docs_area: develop
---

This page has instructions for updating existing rows of data in CockroachDB, using the following [SQL statements]({% link {{ page.version.version }}/sql-statements.md %}):

- [`UPDATE`](#use-update), which updates existing rows in a table.
- [`UPSERT`](#use-upsert), which inserts new rows in a table, updating existing rows that conflict on a primary key.
- [`INSERT ... ON CONFLICT ... DO UPDATE`](#use-insert-on-conflict), which inserts new rows in a table, updating existing rows in the event of a conflict on specified, `UNIQUE`-constrained columns.

## Before you begin

Before reading this page, do the following:

- [Create a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/quickstart.md %}) or [start a local cluster]({% link cockroachcloud/quickstart.md %}?filters=local).
- [Install a Driver or ORM Framework]({% link {{ page.version.version }}/install-client-drivers.md %}).
- [Connect to the database]({% link {{ page.version.version }}/connect-to-the-database.md %}).
- [Create a database schema]({% link {{ page.version.version }}/schema-design-overview.md %}).
- [Insert data]({% link {{ page.version.version }}/insert-data.md %}) that you now want to update.

    In the examples on this page, we use sample [`movr`]({% link {{ page.version.version }}/movr.md %}) data imported with the [`cockroach workload` command]({% link {{ page.version.version }}/cockroach-workload.md %}).

## Use `UPDATE`

To update existing rows in a table, use an [`UPDATE` statement]({% link {{ page.version.version }}/update.md %}) with a `WHERE` clause that filters on the columns that identify the rows that you want to update.

{{site.data.alerts.callout_info}}
To update a large number of rows (i.e., tens of thousands of rows or more), we recommend iteratively updating subsets of the rows that you want to update, until all of the rows have been updated. You can write a script to do this, or you can write a loop into your application.

For guidance and an example, see [Bulk-update Data]({% link {{ page.version.version }}/bulk-update-data.md %}).
{{site.data.alerts.end}}

### `UPDATE` SQL syntax

In SQL, `UPDATE` statements generally take the following form:

~~~
UPDATE {table} SET {update_column} = {update_value} WHERE {filter_column} = {filter_value}
~~~

Where:

- `{table}` is the table to update.
- `{update_column}` is the column to update.
- `{update_value}` is the new value of the column in the matching row.
- `{filter_column}` is the column to filter on.
- `{filter_value}` is the matching value for the filter.

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `UPDATE` statement, including additional examples, see the [`UPDATE` syntax page]({% link {{ page.version.version }}/update.md %}).
{{site.data.alerts.end}}

### `UPDATE` best practices

Here are some best practices to follow when updating rows:

- Always specify a `WHERE` clause in `UPDATE` queries. If no `WHERE` clause is specified, CockroachDB will update all of the rows in the specified table.
- To update a large number of rows (i.e., tens of thousands of rows or more), use a [batch-update loop]({% link {{ page.version.version }}/bulk-update-data.md %}).
- When executing `UPDATE` statements from an application, make sure that you wrap the SQL-executing functions in [a retry loop that handles transaction errors]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}#transaction-retry-errors) that can occur under [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention).

### `UPDATE` example

Suppose you want to change the status of all of the vehicles owned by a particular MovR user. To update all rows in the `vehicles` table with the `owner_id` equal to `bd70a3d7-0a3d-4000-8000-000000000025`:

<div class="filters clearfix">
  <button class="filter-button" data-scope="sql">SQL</button>
  <button class="filter-button" data-scope="go">Go (lib/pq)</button>
  <button class="filter-button" data-scope="java">Java (JDBC)</button>
  <button class="filter-button" data-scope="python">Python (psycopg2)</button>
</div>

<section class="filter-content" markdown="1" data-scope="sql">

{% include_cached copy-clipboard.html %}
~~~ sql
UPDATE vehicle SET status = 'unavailable' WHERE owner_id = 'bd70a3d7-0a3d-4000-8000-000000000025';
~~~

</section>

<section class="filter-content" markdown="1" data-scope="go">

{% include_cached copy-clipboard.html %}
~~~ go
// 'conn' is an open database connection

ownerID := "bd70a3d7-0a3d-4000-8000-000000000025"

err = conn.QueryRow(context.Background(), "UPDATE vehicle SET status = 'unavailable' WHERE owner_id = $1", ownerID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "QueryRow failed: %v\n", err)
		os.Exit(1)
	}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="java">

{% include_cached copy-clipboard.html %}
~~~ java
// ds is an org.postgresql.ds.PGSimpleDataSource

String ownerId = "bd70a3d7-0a3d-4000-8000-000000000025";

try (Connection connection = ds.getConnection()) {
    PreparedStatement p = connection.prepareStatement("UPDATE vehicles SET status = 'unavailable' WHERE owner_id = ?");
    p.setString(1, ownerId);
    p.executeUpdate();

} catch (SQLException e) {
    System.out.printf("sql state = [%s]\ncause = [%s]\nmessage = [%s]\n", e.getSQLState(), e.getCause(),
            e.getMessage());
}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="python">

{% include_cached copy-clipboard.html %}
~~~ python
# conn is a psycopg2 connection

ownerID = 'bd70a3d7-0a3d-4000-8000-000000000025'

with conn.cursor() as cur:
    cur.execute(
        "UPDATE vehicles SET status = 'unavailable' WHERE owner_id = %s", (ownerID,))
~~~

</section>

## Use `UPSERT`

To insert new rows into a table, and update rows that conflict with the primary key value(s) of the new rows, use an [`UPSERT` statement]({% link {{ page.version.version }}/upsert.md %}).

### `UPSERT` SQL syntax

In SQL, `UPSERT` statements take the following form:

~~~
UPSERT INTO {table} ({upsert_columns}) VALUES ({upsert_values});
~~~

Where:

- `{table}` is the table to update.
- `{upsert_columns}` is a comma-separated list of the columns to which you want to insert values.
- `{upsert_values}` is a comma-separated list of values that you want to insert.

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `UPSERT` statement, including additional examples, see the [`UPSERT` syntax page]({% link {{ page.version.version }}/upsert.md %}).
{{site.data.alerts.end}}

### `UPSERT` best practices

Here are some best practices to follow when using `UPSERT`:

- Limit the number of `UPSERT` statements that you execute. It's more efficient to insert multiple rows with a single statement than to execute multiple `UPSERT` statements that each insert a single row.
- When executing `UPSERT` statements from an application, make sure that you wrap the SQL-executing functions in [a retry loop that handles transaction errors]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}#transaction-retry-errors) that can occur under contention.

### `UPSERT` example

Suppose you want to add some promo codes to the MovR platform, and overwrite any existing promos with the same code. To insert new rows into the `promo_codes` table, and update any rows that have the same primary key `code` value:

<div class="filters clearfix">
  <button class="filter-button" data-scope="sql">SQL</button>
  <button class="filter-button" data-scope="go">Go (lib/pq)</button>
  <button class="filter-button" data-scope="java">Java (JDBC)</button>
  <button class="filter-button" data-scope="python">Python (psycopg2)</button>
</div>

<section class="filter-content" markdown="1" data-scope="sql">

{% include_cached copy-clipboard.html %}
~~~ sql
UPSERT INTO promo_codes (code, description, rules)
  VALUES ('0_explain_theory_something','Fifteen percent off.', '{"type": "percent_discount", "value": "15%"}'),
    ('100_address_garden_certain','Twenty percent off.','{"type": "percent_discount", "value": "20%"}'),
    ('1000_do_write_words','Twenty-five percent off.','{"type": "percent_discount", "value": "25%"}');
~~~

</section>

<section class="filter-content" markdown="1" data-scope="go">

{% include_cached copy-clipboard.html %}
~~~ go
// 'db' is an open database connection

codeOne := "0_explain_theory_something"
descriptionOne := "Fifteen percent off."
rulesOne := `{"type": "percent_discount", "value\": "15%"}`
codeTwo := "100_address_garden_certain"
descriptionTwo := "Twenty percent off."
rulesTwo := `{"type": "percent_discount", "value": "20%"}`
codeThree := "1000_do_write_words"
descriptionThree := "Twenty-five percent off."
rulesThree := `{"type": "percent_discount", "value": "25%"}`

if _, err := db.Exec("UPSERT INTO promo_codes (code, description, rules) "+
  "values ($1, $2, $3), ($4, $5, $6), ($7, $8, $9)",
  codeOne, descriptionOne, rulesOne, codeTwo, descriptionTwo,
  rulesTwo, codeThree, descriptionThree, rulesThree); err != nil {
  return err
}
return nil
~~~

</section>

<section class="filter-content" markdown="1" data-scope="java">

{% include_cached copy-clipboard.html %}
~~~ java
// ds is an org.postgresql.ds.PGSimpleDataSource

String codeOne = "0_explain_theory_something";
String descriptionOne = "Fifteen percent off.";
String rulesOne = "{\"type\": \"percent_discount\", \"value\": \"15%\"}";
String codeTwo = "100_address_garden_certain";
String descriptionTwo = "Twenty percent off.";
String rulesTwo = "{\"type\": \"percent_discount\", \"value\": \"20%\"}";
String codeThree = "1000_do_write_words";
String descriptionThree = "Twenty-five percent off.";
String rulesThree = "{\"type\": \"percent_discount\", \"value\": \"25%\"}";

try (Connection connection = ds.getConnection()) {
    PreparedStatement p = connection.prepareStatement("UPSERT INTO promo_codes (code, description, rules) values (?, ?, ?), (?, ?, ?), (?, ?, ?)");
    p.setString(1, codeOne);
    p.setString(2, descriptionOne);
    p.setString(3, rulesOne);
    p.setString(4, codeTwo);
    p.setString(5, descriptionTwo);
    p.setString(6, rulesTwo);
    p.setString(7, codeThree);
    p.setString(8, descriptionThree);
    p.setString(9, rulesThree);
    p.executeUpdate();


} catch (SQLException e) {
    System.out.printf("sql state = [%s]\ncause = [%s]\nmessage = [%s]\n", e.getSQLState(), e.getCause(),
            e.getMessage());
}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="python">

{% include_cached copy-clipboard.html %}
~~~ python
# conn is a psycopg2 connection

codeOne = '0_explain_theory_something'
descriptionOne = 'Fifteen percent off.'
rulesOne = '{"type": "percent_discount", "value": "15%"}'
codeTwo = '100_address_garden_certain'
descriptionTwo = 'Twenty percent off.'
rulesTwo = '{"type": "percent_discount", "value": "20%"}'
codeThree = '1000_do_write_words'
descriptionThree = 'Twenty-five percent off.'
rulesThree = '{"type": "percent_discount", "value": "25%"}'

with conn.cursor() as cur:
    cur.execute("UPSERT INTO promo_codes (code, description, rules) values (%s,%s,%s), (%s,%s,%s), (%s,%s,%s)",
                (codeOne, descriptionOne, rulesOne, codeTwo, descriptionTwo, rulesTwo, codeThree, descriptionThree, rulesThree))
~~~

</section>

## Use `INSERT ON CONFLICT`

To insert new rows into a table, and to update rows with `UNIQUE`-constrained values that conflict with any values of the new rows, use an `INSERT ... ON CONFLICT ... DO UPDATE` statement.

`INSERT ... ON CONFLICT ... DO UPDATE` is semantically identical to `UPSERT`, when the conflicting values are in the primary key and the action to take on conflict is to update the conflicting rows with the new rows. `INSERT ... ON CONFLICT` is more flexible than `UPSERT`, and can be used to consider uniqueness for columns not in the primary key. With `INSERT ... ON CONFLICT`, you can also control how to update rows in the event of a conflict. This contrasts with the behavior of an `UPSERT` statement, which just overwrites conflicting rows with new rows.

[Hash-sharded indexes]({% link {{ page.version.version }}/hash-sharded-indexes.md %}) can be used for uniqueness checks.

{{site.data.alerts.callout_info}}
 Note that if you are inserting to/updating all columns of a table, and the table has no secondary indexes, `UPSERT` will be faster than the equivalent `INSERT ON CONFLICT` statement, as it will write without first reading.
{{site.data.alerts.end}}

### `INSERT ON CONFLICT` SQL syntax

In SQL, `INSERT ... ON CONFLICT ... DO UPDATE` statements take the following form:

~~~
INSERT INTO {table} ({insert_columns}) VALUES ({insert_values})
  ON CONFLICT ({conflict_columns}) DO UPDATE SET {update_column} = {update value};
~~~

Where:

- `{table}` is the table to update.
- `{insert_columns}` is a comma-separated list of the columns to which you want to insert values.
- `{insert_values}` is a comma-separated list of values that you want to insert.
- `{conflict_columns}` is a comma-separated list of the columns to evaluate for a conflict.
- `{update_column}` is the column to update, on conflict.
- `{update_values}` is the value to assign the update column.

Note that the statement contains an `UPDATE` clause, which is semantically identical to an `UPDATE` statement.

### `INSERT ON CONFLICT` best practices

Here are some best practices to follow when using `INSERT ... ON CONFLICT ... DO UPDATE`:

- Limit the number of `INSERT` statements that you execute. It's more efficient to insert multiple rows with a single statement than to execute multiple `INSERT` statements that each insert a single row.
- When executing `INSERT` statements from an application, make sure that you wrap the SQL-executing functions in [a retry loop that handles transaction errors]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}#transaction-retry-errors) that can occur under contention.
- Follow the [performance best practices listed on the `INSERT`]({% link {{ page.version.version }}/insert.md %}#performance-best-practices) page.

### `INSERT ON CONFLICT` example

Suppose you want to record a particular user's promo code usage count. The `user_promo_codes` table keeps track of user promo usage. If no usage counter exists, you want to insert a new row, and if one does exist, you want to increment the `usage_count` column by 1.

<div class="filters clearfix">
  <button class="filter-button" data-scope="sql">SQL</button>
  <button class="filter-button" data-scope="go">Go (lib/pq)</button>
  <button class="filter-button" data-scope="java">Java (JDBC)</button>
  <button class="filter-button" data-scope="python">Python (psycopg2)</button>
</div>

<section class="filter-content" markdown="1" data-scope="sql">

{% include_cached copy-clipboard.html %}
~~~ sql
INSERT INTO user_promo_codes (city, user_id, code, "timestamp", usage_count)
    VALUES ('new york', '147ae147-ae14-4b00-8000-000000000004', 'promo_code', now(), 1)
    ON CONFLICT (city, user_id, code)
    DO UPDATE SET usage_count = user_promo_codes.usage_count;
~~~

</section>

<section class="filter-content" markdown="1" data-scope="go">

{% include_cached copy-clipboard.html %}
~~~ go
// 'db' is an open database connection

city := "new york"
userId := "147ae147-ae14-4b00-8000-000000000004"
code := "promo_code"
ts := "now()"
usageCount := 1

if _, err := db.Exec("INSERT INTO user_promo_codes "+
  "VALUES ($1, $2, $3, $4, $5) ON CONFLICT (city, user_id, code) "+
  "DO UPDATE SET usage_count = user_promo_codes.usage_count + 1",
  city, userId, code, ts, usageCount); err != nil {
  return err
}
return nil
~~~

</section>

<section class="filter-content" markdown="1" data-scope="java">

{% include_cached copy-clipboard.html %}
~~~ java
// ds is an org.postgresql.ds.PGSimpleDataSource

String city = "new york";
String userId = "147ae147-ae14-4b00-8000-000000000004";
String code = "promo_code";
String ts = "now()";
int usageCount = 1;

try (Connection connection = ds.getConnection()) {
    PreparedStatement p = connection.prepareStatement("INSERT INTO user_promo_codes VALUES (?, ?, ?, ?, ?) ON CONFLICT (city, user_id, code) DO UPDATE SET usage_count = user_promo_codes.usage_count+1");
    p.setString(1, city);
    p.setString(2, userId);
    p.setString(3, code);
    p.setString(4, ts);
    p.setInt(5, usageCount);
    p.executeUpdate();

} catch (SQLException e) {
    System.out.printf("sql state = [%s]\ncause = [%s]\nmessage = [%s]\n", e.getSQLState(), e.getCause(),
            e.getMessage());
}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="python">

{% include_cached copy-clipboard.html %}
~~~ python
# conn is a psycopg2 connection

city = 'new york'
userId = '147ae147-ae14-4b00-8000-000000000004'
code = 'promo_code'
ts = 'now()'
usageCount = 1

with conn.cursor() as cur:
    cur.execute("INSERT INTO user_promo_codes VALUES (%s, %s, %s, %s, %s) ON CONFLICT (city, user_id, code)"
                "DO UPDATE SET usage_count = user_promo_codes.usage_count+1", (city, userId, code, ts, usageCount))
~~~

</section>

## See also

Reference information related to this task:

- [`UPDATE`]({% link {{ page.version.version }}/update.md %})
- [Bulk-update Data]({% link {{ page.version.version }}/bulk-update-data.md %})
- [`UPSERT`]({% link {{ page.version.version }}/update.md %})
- [`INSERT ... ON CONFLICT`]({% link {{ page.version.version }}/insert.md %}#on-conflict-clause)
- [Transaction Contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention)

Other common tasks:

- [Connect to the Database]({% link {{ page.version.version }}/connect-to-the-database.md %})
- [Insert Data]({% link {{ page.version.version }}/insert-data.md %})
- [Query Data]({% link {{ page.version.version }}/query-data.md %})
- [Delete Data]({% link {{ page.version.version }}/delete-data.md %})
- [Bulk-update Data]({% link {{ page.version.version }}/bulk-update-data.md %})
- [Run Multi-Statement Transactions]({% link {{ page.version.version }}/run-multi-statement-transactions.md %})
- [Error Handling and Troubleshooting][error_handling]
- [Optimize Statement Performance]({% link {{ page.version.version }}/make-queries-fast.md %})
- [Example Apps]({% link {{ page.version.version }}/example-apps.md %})

{% comment %} Reference Links {% endcomment %}

[error_handling]: query-behavior-troubleshooting.html
[manual]: manual-deployment.html
[orchestrated]: orchestration.html
[selection]: selection-queries.html
