---
title: Query Data
summary: How to send SQL queries to CockroachDB from various programming languages
toc: true
---

This page has instructions for making SQL [selection queries][selection] against CockroachDB from various programming languages.

## Before you begin

Before reading this page, do the following:

- [Install CockroachDB](install-cockroachdb.html).
- [Start a local cluster](secure-a-cluster.html), or [create a {{ site.data.products.db }} cluster](../cockroachcloud/create-your-cluster.html).
- [Install a Postgres client](install-client-drivers.html).
- [Connect to the database](connect-to-the-database.html).
- [Insert data](insert-data.html) that you now want to run queries against.

{% include {{page.version.version}}/app/retry-errors.md %}

## Simple selects

<div class="filters clearfix">
  <button class="filter-button" data-scope="sql">SQL</button>
  <button class="filter-button" data-scope="go">Go</button>
  <button class="filter-button" data-scope="java">Java</button>
  <button class="filter-button" data-scope="python">Python</button>
</div>

<section class="filter-content" markdown="1" data-scope="sql">

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT id, balance from accounts;
~~~

For more information about how to use the built-in SQL client, see the [`cockroach sql`](cockroach-sql.html) reference docs.

</section>

<section class="filter-content" markdown="1" data-scope="go">

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

## Order results

To order the results of a query, use an `ORDER BY` clause.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM bank ORDER BY balance;
~~~

~~~
  id | balance |                                               payload
-----+---------+-------------------------------------------------------------------------------------------------------
   0 |    -500 | initial-dTqnRurXztAPkykhZWvsCmeJkMwRNcJAvTlNbgUEYfagEQJaHmfPsquKZUBOGwpAjPtATpGXFJkrtQCEJODSlmQctvyh
   1 |    -499 | initial-PCLGABqTvrtRNyhAyOhQdyLfVtCmRykQJSsdwqUFABkPOMQayVEhiAwzZKHpJUiNmVaWYZnReMKfONZvRKbTETaIDccE
   2 |    -498 | initial-VNfyUJHfCmMeAUoTgoSVvnByDyvpHNPHDfVoNWdXBFQpwMOBgNVtNijyTjmecvFqyeLHlDbIBRrbCzSeiHWSLmWbhIvh
   3 |    -497 | initial-llflzsVuQYUlfwlyoaqjdwKUNgNFVgvlnINeOUUVyfxyvmOiAelxqkTBfpBBziYVHgQLLEuCazSXmURnXBlCCfsOqeji
   4 |    -496 | initial-rmGzVVucMqbYnBaccWilErbWvcatqBsWSXvrbxYUUEhmOnccXzvqcsGuMVJNBjmzKErJzEzzfCzNTmLQqhkrDUxdgqDD
(5 rows)
~~~

For reference documentation and more examples, see the [`ORDER BY`](order-by.html) syntax page.

## Limit results

To limit the results of a query, use a `LIMIT` clause.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM bank LIMIT 5;
~~~

~~~
  id | balance |                                               payload
-----+---------+-------------------------------------------------------------------------------------------------------
   0 |       0 | initial-dTqnRurXztAPkykhZWvsCmeJkMwRNcJAvTlNbgUEYfagEQJaHmfPsquKZUBOGwpAjPtATpGXFJkrtQCEJODSlmQctvyh
   1 |       0 | initial-PCLGABqTvrtRNyhAyOhQdyLfVtCmRykQJSsdwqUFABkPOMQayVEhiAwzZKHpJUiNmVaWYZnReMKfONZvRKbTETaIDccE
   2 |       0 | initial-VNfyUJHfCmMeAUoTgoSVvnByDyvpHNPHDfVoNWdXBFQpwMOBgNVtNijyTjmecvFqyeLHlDbIBRrbCzSeiHWSLmWbhIvh
   3 |       0 | initial-llflzsVuQYUlfwlyoaqjdwKUNgNFVgvlnINeOUUVyfxyvmOiAelxqkTBfpBBziYVHgQLLEuCazSXmURnXBlCCfsOqeji
   4 |       0 | initial-rmGzVVucMqbYnBaccWilErbWvcatqBsWSXvrbxYUUEhmOnccXzvqcsGuMVJNBjmzKErJzEzzfCzNTmLQqhkrDUxdgqDD
(5 rows)
~~~

For reference documentation and more examples, see the [`LIMIT`/`OFFSET`](limit-offset.html) syntax page.

## Joins

The syntax for a [selection query][selection] with a two-way [join][joins] is shown below.

{% include_cached copy-clipboard.html %}
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

Join performance can be a big factor in your application's performance.  For more information about how to make sure your SQL performs well, see [Optimize Query Performance][fast].

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
- [Optimize Query Performance][fast]
- [Hello World Example apps](hello-world-example-apps.html)

<!-- Reference Links -->

[selection]: selection-queries.html
[manual]: manual-deployment.html
[orchestrated]: orchestration.html
[fast]: make-queries-fast.html
[paginate]: pagination.html
[joins]: joins.html
