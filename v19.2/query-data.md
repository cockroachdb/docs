---
title: Query Data
summary: How to send SQL queries to CockroachDB from various programming languages
toc: true
---

This page has instructions for making SQL [selection queries][selection] against CockroachDB from various programming languages.

## Before you begin

Make sure you have already:

- Set up a [local cluster](secure-a-cluster.html).
- [Installed a Postgres client](install-client-drivers.html).
- [Connected to the database](connect-to-the-database.html).
- [Inserted data](insert-data.html) that you now want to run queries against.

{% include {{page.version.version}}/app/retry-errors.md %}

## Simple selects

<div class="filters clearfix">
  <button class="filter-button" data-scope="sql">SQL</button>
  <button class="filter-button" data-scope="go">Go</button>
  <button class="filter-button" data-scope="java">Java</button>
  <button class="filter-button" data-scope="python">Python</button>
</div>

<section class="filter-content" markdown="1" data-scope="sql">

{% include copy-clipboard.html %}
~~~ sql
SELECT id, balance from accounts;
~~~

For more information about how to use the built-in SQL client, see the [`cockroach sql`](cockroach-sql.html) reference docs.

</section>

<section class="filter-content" markdown="1" data-scope="go">

{% include copy-clipboard.html %}
~~~ go
// 'db' is an open database connection

rows, err := db.Query("SELECT id, balance FROM accounts")
if err != nil {
    log.Fatal(err)
}
defer rows.Close()
fmt.Println("Initial balances:")
for rows.Next() {
    var id, balance int
    if err := rows.Scan(&id, &balance); err != nil {
        log.Fatal(err)
    }
    fmt.Printf("%d %d\n", id, balance)
}
~~~

{% include {{page.version.version}}/app/for-a-complete-example-go.md %}

</section>

<section class="filter-content" markdown="1" data-scope="java">

{% include copy-clipboard.html %}
~~~ java
// ds is an org.postgresql.ds.PGSimpleDataSource

try (Connection connection = ds.getConnection()) {
    Statement stmt = connection.createStatement();
    ResultSet rs = stmt.executeQuery("SELECT id, balance FROM accounts");

    while (rs.next()) {
        int id = rs.getInt(1);
        int bal = rs.getInt(2);
        System.out.printf("ID: %10s\nBalance: %5s\n", id, bal);
    }
    rs.close();

} catch (SQLException e) {
    System.out.printf("sql state = [%s]\ncause = [%s]\nmessage = [%s]\n",
                      e.getSQLState(), e.getCause(), e.getMessage());
}
~~~

{% include {{page.version.version}}/app/for-a-complete-example-java.md %}

</section>

<section class="filter-content" markdown="1" data-scope="python">

{% include copy-clipboard.html %}
~~~ python
# conn is a psycopg2 connection

with conn.cursor() as cur:
    cur.execute("SELECT id, balance FROM accounts")
    rows = cur.fetchall()
    for row in rows:
        print([str(cell) for cell in row])
~~~

{% include {{page.version.version}}/app/for-a-complete-example-python.md %}

</section>

## Joins

The syntax for a [selection query][selection] with a two-way [join][joins] is shown below.

{% include copy-clipboard.html %}
~~~ sql
SELECT
	a.col1, b.col1
FROM
	some_table AS a
	JOIN
    some_other_table AS b
    ON
    a.id = b.id
WHERE
	a.col2 > 100 AND a.col3 > now()
ORDER BY
	a.col2 DESC
LIMIT
	25;
~~~

Join performance can be a big factor in your application's performance.  For more information about how to make sure your SQL performs well, see [Make queries fast][fast].

## Pagination

For pagination queries, we strongly recommend keyset pagination (also known as "the seek method").  The syntax for a keyset pagination query is shown below.

{% include copy-clipboard.html %}
~~~ sql
SELECT * FROM t AS OF SYSTEM TIME ${time}
  WHERE key > ${value}
  ORDER BY key
  LIMIT ${amount};
~~~

For a tutorial explaining keyset pagination queries and showing how to write them, see [Paginate through limited results][paginate].

## Query optimization

For instructions showing how to optimize your SQL queries, see [Make queries fast][fast].

## See also

Reference information related to this task:

- [Selection queries][selection]
- [`SELECT`](select-clause.html)
- [Joins][joins]
- [Paginate through limited results][paginate]
- [Understanding and Avoiding Transaction Contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention)

Other common tasks:

- [Connect to the Database](connect-to-the-database.html)
- [Insert Data](insert-data.html)
- [Update Data](update-data.html)
- [Delete Data](delete-data.html)
- [Run Multi-Statement Transactions](run-multi-statement-transactions.html)
- [Error Handling and Troubleshooting](error-handling-and-troubleshooting.html)
- [Make Queries Fast][fast]
- [Hello World Example apps](hello-world-example-apps.html)

<!-- Reference Links -->

[selection]: selection-queries.html
[manual]: manual-deployment.html
[orchestrated]: orchestration.html
[fast]: make-queries-fast.html
[paginate]: selection-queries.html#paginate-through-limited-results
[joins]: joins.html
