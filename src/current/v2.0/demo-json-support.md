---
title: JSON Support
summary: Use a local cluster to explore how CockroachDB can store and query unstructured JSONB data.
toc: true
---

<span class="version-tag">New in v2.0:</span> This page walks you through a simple demonstration of how CockroachDB can store and query unstructured [`JSONB`](jsonb.html) data from a third-party API, as well as how an [inverted index](inverted-indexes.html) can optimize your queries.


## Step 1. Install prerequisites

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="go">Go</button>
    <button class="filter-button" data-scope="python">Python</button>
</div>

<div class="filter-content" markdown="1" data-scope="go">
- Install the latest version of [CockroachDB](install-cockroachdb.html).
- Install the latest version of [Go](https://golang.org/dl/): `brew install go`
- Install the [PostgreSQL driver](https://github.com/lib/pq): `go get github.com/lib/pq`
</div>

<div class="filter-content" markdown="1" data-scope="python">
- Install the latest version of [CockroachDB](install-cockroachdb.html).
- Install the [Python psycopg2 driver](http://initd.org/psycopg/docs/install.html): `pip install psycopg2`
- Install the [Python Requests library](https://requests.readthedocs.io/en/latest/): `pip install requests`
</div>

## Step 2. Start a single-node cluster

For the purpose of this tutorial, you need only one CockroachDB node running in insecure mode:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--store=json-test \
--host=localhost
~~~

## Step 3. Create a user

In a new terminal, as the `root` user, use the [`cockroach user`](create-and-manage-users.html) command to create a new user, `maxroach`.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach user set maxroach --insecure
~~~

## Step 4. Create a database and grant privileges

As the `root` user, open the [built-in SQL client](use-the-built-in-sql-client.html):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure
~~~

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
+--------------+-------------------------------------------------+
|    Table     |                   CreateTable                   |
+--------------+-------------------------------------------------+
| programming  | CREATE TABLE programming (                      |
|              |     id UUID NOT NULL DEFAULT uuid_v4()::UUID,   |
|              |     posts JSON NULL,                            |
|              |     CONSTRAINT "primary" PRIMARY KEY (id ASC),  |
|              |     FAMILY "primary" (id, posts)                |
|              | )                                               |
+--------------+-------------------------------------------------+
~~~

## Step 6. Run the code

Now that you have a database, user, and a table, let's run code to insert rows into the table.

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="go">Go</button>
    <button class="filter-button" data-scope="python">Python</button>
</div>

<section class="filter-content" markdown="1" data-scope="go">
The code queries the [Reddit API](https://www.reddit.com/dev/api/) for posts in [/r/programming](https://www.reddit.com/r/programming/). The Reddit API only returns 25 results per page; however, each page returns an `"after"` string that tells you how to get the next page. Therefore, the program does the following in a loop:

1. Makes a request to the API.
2. Inserts the results into the table and grabs the `"after"` string.
3. Uses the new `"after"` string as the basis for the next request.

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
</section>

<section class="filter-content" markdown="1" data-scope="python">
The code queries the [Reddit API](https://www.reddit.com/dev/api/) for posts in [/r/programming](https://www.reddit.com/r/programming/). The Reddit API only returns 25 results per page; however, each page returns an `"after"` string that tells you how to get the next page. Therefore, the program does the following in a loop:

1. Makes a request to the API.
2. Grabs the `"after"` string.
3. Inserts the results into the table.
4. Uses the new `"after"` string as the basis for the next request.

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
</section>

The program will take awhile to finish, but you can start querying the data right away.

## Step 7. Query the data

Back in the terminal where the SQL shell is running, verify that rows of data are being inserted into your table:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT count(*) FROM programming;
~~~
~~~
+-------+
| count |
+-------+
|  1120 |
+-------+
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT count(*) FROM programming;
~~~
~~~
+-------+
| count |
+-------+
|  2400 |
+-------+
~~~

Now, retrieve all the current entries where the link is pointing to somewhere on GitHub:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT id FROM programming \
WHERE posts @> '{"data": {"domain": "github.com"}}';
~~~
~~~
+--------------------------------------+
|                  id                  |
+--------------------------------------+
| 0036d489-3fe3-46ec-8219-2eaee151af4b |
| 00538c2f-592f-436a-866f-d69b58e842b6 |
| 00aff68c-3867-4dfe-82b3-2a27262d5059 |
| 00cc3d4d-a8dd-4c9a-a732-00ed40e542b0 |
| 00ecd1dd-4d22-4af6-ac1c-1f07f3eba42b |
| 012de443-c7bf-461a-b563-925d34d1f996 |
| 014c0ac8-4b4e-4283-9722-1dd6c780f7a6 |
| 017bfb8b-008e-4df2-90e4-61573e3a3f62 |
| 0271741e-3f2a-4311-b57f-a75e5cc49b61 |
| 02f31c61-66a7-41ba-854e-1ece0736f06b |
| 035f31a1-b695-46be-8b22-469e8e755a50 |
| 03bd9793-7b1b-4f55-8cdd-99d18d6cb3ea |
| 03e0b1b4-42c3-4121-bda9-65bcb22dcf72 |
| 0453bc77-4349-4136-9b02-3a6353ea155e |
...
+--------------------------------------+
(334 rows)

Time: 105.877736ms
~~~

{{site.data.alerts.callout_info}}Since you are querying live data, your results for this and the following steps may vary from the results documented in this tutorial.{{site.data.alerts.end}}

## Step 8. Create an inverted index to optimize performance

The query in the previous step took 105.877736ms. To optimize the performance of queries that filter on the `JSONB` column, let's create an [inverted index](inverted-indexes.html) on the column:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INVERTED INDEX ON programming(posts);
~~~

## Step 9. Run the query again

Now that there is an inverted index, the same query will run much faster:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT id FROM programming \
WHERE posts @> '{"data": {"domain": "github.com"}}';
~~~
~~~
(334 rows)

Time: 28.646769ms
~~~

Instead of 105.877736ms, the query now takes 28.646769ms.

## What's Next?

Use a local cluster to explore these other core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Automatic Rebalancing](demo-automatic-rebalancing.html)
- [Cross-Cloud Migration](demo-automatic-cloud-migration.html)
- [Follow-the-Workload](demo-follow-the-workload.html)
- [Orchestration](orchestrate-a-local-cluster-with-kubernetes-insecure.html)

You may also want to learn more about the [`JSONB`](jsonb.html) data type and [inverted indexes](inverted-indexes.html).
