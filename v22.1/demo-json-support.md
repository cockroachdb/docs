---
title: JSON Support
summary: Use a local cluster to explore how CockroachDB can store and query unstructured JSONB data.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
docs_area: deploy
---

This page guides you through a simple demonstration of how CockroachDB can store and query unstructured [`JSONB`](jsonb.html) data from a third-party API, as well as how a [GIN index](inverted-indexes.html) can optimize your queries.

<div class="clearfix">
  <a class="btn btn-outline-primary" href="../tutorials/demo-json-support-interactive.html" target="_blank" rel="noopener">Run this in your browser &rarr;</a>
</div>

## Step 1. Install prerequisites

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="python">Python</button>
    <button class="filter-button page-level " data-scope="go">Go</button>
</div>

<div class="filter-content" markdown="1" data-scope="go">
- Install the latest version of [CockroachDB](install-cockroachdb.html).
- Install the latest version of [Go](https://golang.org/dl/): `brew install go`
- Install the [PostgreSQL driver](https://github.com/lib/pq): `go get github.com/lib/pq`
</div>

<div class="filter-content" markdown="1" data-scope="python">
- Install the latest version of [CockroachDB](install-cockroachdb.html).
- Install the [Python psycopg2 driver](http://initd.org/psycopg/docs/install.html): `pip install psycopg2`
- Install the [Python Requests library](http://docs.python-requests.org/en/master/): `pip install requests`
</div>

## Step 2. Start a single-node cluster

For the purpose of this tutorial, you need only one CockroachDB node running in insecure mode, so use the [`cockroach start-single-node`](cockroach-start-single-node.html) command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start-single-node \
--insecure \
--store=json-test \
--listen-addr=localhost:26257 \
--http-addr=localhost:8080 \
--background
~~~

## Step 3. Create a user

Open the [built-in SQL shell](cockroach-sql.html) as the `root` user and create a new user, `maxroach`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --host=localhost:26257
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE USER maxroach;
~~~

## Step 4. Create a database and grant privileges

Next, create a database called `jsonb_test`:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE DATABASE jsonb_test;
~~~

Set the database as the default:

{% include_cached copy-clipboard.html %}
~~~ sql
> SET DATABASE = jsonb_test;
~~~

Then [grant privileges](grant.html) to the `maxroach` user:

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT ALL ON DATABASE jsonb_test TO maxroach;
~~~

## Step 5. Create a table

Still in the SQL shell, create a table called `programming`:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE programming (
    id UUID DEFAULT uuid_v4()::UUID PRIMARY KEY,
    posts JSONB
  );
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE programming;
~~~

~~~
  table_name  |                create_statement
+-------------+------------------------------------------------+
  programming | CREATE TABLE programming (
              |     id UUID NOT NULL DEFAULT uuid_v4()::UUID,
              |     posts JSONB NULL,
              |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
              |     FAMILY "primary" (id, posts)
              | )
(1 row)
~~~

## Step 6. Run the code

Now that you have a database, user, and a table, let's run code to insert rows into the table.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="python">Python</button>
    <button class="filter-button page-level " data-scope="go">Go</button>
</div>

<section class="filter-content" markdown="1" data-scope="go">
Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/json/json-sample.go" download><code>json-sample.go</code></a> file, or create the file yourself and copy the code into it:

{% include_cached copy-clipboard.html %}
~~~ go
{% include {{ page.version.version }}/json/json-sample.go %}
~~~

In a new terminal window, navigate to your sample code file and run it:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go run json-sample.go
~~~

The code queries the [Reddit API](https://www.reddit.com/dev/api/) for posts in [/r/programming](https://www.reddit.com/r/programming/). The Reddit API only returns 25 results per page; however, each page returns an `"after"` string that tells you how to get the next page. Therefore, the program does the following in a loop:

1. Makes a request to the API.
2. Inserts the results into the table and grabs the `"after"` string.
3. Uses the new `"after"` string as the basis for the next request.
</section>

<section class="filter-content" markdown="1" data-scope="python">
Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/json/json-sample.py" download><code>json-sample.py</code></a> file, or create the file yourself and copy the code into it:

{% include_cached copy-clipboard.html %}
~~~ python
{% include {{ page.version.version }}/json/json-sample.py %}
~~~

In a new terminal window, navigate to your sample code file and run it:

{% include_cached copy-clipboard.html %}
~~~ shell
$ python json-sample.py
~~~

The code queries the [Reddit API](https://www.reddit.com/dev/api/) for posts in [/r/programming](https://www.reddit.com/r/programming/). The Reddit API only returns 25 results per page; however, each page returns an `"after"` string that tells you how to get the next page. Therefore, the program does the following in a loop:

1. Makes a request to the API.
2. Grabs the `"after"` string.
3. Inserts the results into the table.
4. Uses the new `"after"` string as the basis for the next request.
</section>

The program will loop through that 40 times, but you can start querying the data right away.

## Step 7. Query the data

Back in the terminal where the SQL shell is running, verify that rows of data are being inserted into your table:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT count(*) FROM programming;
~~~

~~~
  count
+-------+
    675
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT count(*) FROM programming;
~~~

~~~
  count
+-------+
    825
(1 row)
~~~

You should see the count increasing. Keep checking until you see 1000 rows.

Now, retrieve all the current entries where the link is pointing to somewhere on GitHub:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT id FROM programming \
WHERE posts @> '{"data": {"domain": "github.com"}}';
~~~

~~~
                   id
+--------------------------------------+
  05348629-d8f1-4c90-99cc-11e8ab313edb
  059a1562-0054-49ff-adc7-aec82c6f74fb
  1b5ea86d-c892-43ba-b40a-c63761aff3ea
  25ac5bfe-44e2-4c6a-892c-959f859ee4e7
  2ab49796-3e55-4a33-8a83-9decef9fbccc
  2df2e3ac-757b-4689-844d-935876df75e9
  4506e0b8-a572-499c-a9c1-2a5075a021f8
  5209ce99-2253-4490-bceb-fd881ff6d962
  56cf90cd-43a9-49e9-a078-3e28c115232f
  57f287a3-d396-460a-a649-9fa41c4315e4
  ...
(90 rows)

Time: 103.748ms
~~~

{{site.data.alerts.callout_info}}
Since you are querying live data, your results for this and the following steps may vary from the results documented in this tutorial.
{{site.data.alerts.end}}

## Step 8. Create a GIN index to optimize performance

The query in the previous step took 103.748ms. To optimize the performance of queries that filter on the `JSONB` column, let's create a [GIN index](inverted-indexes.html) on the column:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INVERTED INDEX ON programming(posts);
~~~

## Step 9. Run the query again

Now that there is a GIN index, the same query will run much faster:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT id FROM programming \
WHERE posts @> '{"data": {"domain": "github.com"}}';
~~~
~~~
(109 rows)

Time: 6.862ms
~~~

Instead of 103.748ms, the query now takes 6.862ms.

## Step 10. Clean up

If the program is still running, press `ctrl-c` to terminate it.

Get the process ID of the node:

{% include_cached copy-clipboard.html %}
~~~ shell
ps -ef | grep cockroach | grep -v grep
~~~

~~~
  501  8099     1   0  2:59PM ttys002    0:01.12 cockroach start-single-node --insecure --store=json-test --listen-addr=localhost:26257 --http-addr=localhost:8080
~~~

Then gracefully shut down the node, specifying its process ID:

{% include_cached copy-clipboard.html %}
~~~ shell
kill -TERM 8099
~~~

If you do not plan to restart the cluster, remove the node's data store:

{% include_cached copy-clipboard.html %}
~~~ shell
$ rm -rf json-test
~~~

## What's next?

Explore other core CockroachDB benefits and features:

{% include {{ page.version.version }}/misc/explore-benefits-see-also.md %}

You may also want to learn more about the [`JSONB`](jsonb.html) data type and [GIN indexes](inverted-indexes.html).
