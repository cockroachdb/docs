---
title: Query Data
summary: How to send SQL queries to CockroachDB from various programming languages
toc: true
docs_area: develop
---

This page has instructions for making SQL [selection queries][selection] against CockroachDB from various programming languages.

## Before you begin

Before reading this page, do the following:

- [Create a CockroachDB {{ site.data.products.standard }} cluster](quickstart.md) or [start a local cluster](quickstart.md?filters=local).
- [Install a Driver or ORM Framework]({{ page.version.version }}/install-client-drivers.md).
- [Connect to the database]({{ page.version.version }}/connect-to-the-database.md).
- [Insert data]({{ page.version.version }}/insert-data.md) that you now want to run queries against.


## Simple selects

<div class="filters clearfix">
  <button class="filter-button" data-scope="sql">SQL</button>
  <button class="filter-button" data-scope="go">Go</button>
  <button class="filter-button" data-scope="java">Java</button>
  <button class="filter-button" data-scope="python">Python</button>
</div>

<section class="filter-content" markdown="1" data-scope="sql">

~~~ sql
SELECT id, balance from accounts;
~~~

For more information about how to use the built-in SQL client, see the [`cockroach sql`]({{ page.version.version }}/cockroach-sql.md) reference docs.

</section>

<section class="filter-content" markdown="1" data-scope="go">

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


</section>

<section class="filter-content" markdown="1" data-scope="java">

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


</section>

<section class="filter-content" markdown="1" data-scope="python">

~~~ python
# conn is a psycopg2 connection

with conn.cursor() as cur:
    cur.execute("SELECT id, balance FROM accounts")
    rows = cur.fetchall()
    for row in rows:
        print([str(cell) for cell in row])
~~~


</section>

## Order results

To order the results of a query, use an `ORDER BY` clause.

For example:

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

For reference documentation and more examples, see the [`ORDER BY`]({{ page.version.version }}/order-by.md) syntax page.

## Limit results

To limit the results of a query, use a `LIMIT` clause.

For example:

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

For reference documentation and more examples, see the [`LIMIT`/`OFFSET`]({{ page.version.version }}/limit-offset.md) syntax page.

## Joins

The syntax for a [selection query][selection] with a two-way [join][joins] is shown below.

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

Join performance can be a big factor in your application's performance.  For more information about how to make sure your SQL performs well, see [Optimize Statement Performance][fast].

## See also

Reference information related to this task:

- [Selection queries][selection]
- [`SELECT`]({{ page.version.version }}/select-clause.md)
- [Joins][joins]
- [Paginate through limited results][paginate]
- [Transaction Contention]({{ page.version.version }}/performance-best-practices-overview.md#transaction-contention)

Other common tasks:

- [Connect to the Database]({{ page.version.version }}/connect-to-the-database.md)
- [Insert Data]({{ page.version.version }}/insert-data.md)
- [Update Data]({{ page.version.version }}/update-data.md)
- [Delete Data]({{ page.version.version }}/delete-data.md)
- [Run Multi-Statement Transactions]({{ page.version.version }}/run-multi-statement-transactions.md)
- [Troubleshoot SQL Statements]({{ page.version.version }}/query-behavior-troubleshooting.md)
- [Optimize Statement Performance][fast]
- [Example Apps]({{ page.version.version }}/example-apps.md)

{% comment %} Reference Links {% endcomment %}

[selection]: selection-queries.html
[manual]: manual-deployment.html
[orchestrated]: orchestration.html
[fast]: make-queries-fast.html
[paginate]: pagination.html
[joins]: joins.html