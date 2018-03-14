---
title: JSON Support
summary: Use a local cluster to explore how CockroachDB can store and query unstructured JSONB data.
toc: false
---

<span class="version-tag">New in v2.0:</span> CockroachDB now supports [`JSONB`](jsonb.html) columns.

This page walks you through a simple demonstration of how CockroachDB can store and query unstructured `JSONB` data from a third-party API, as well as how an [inverted index](inverted-indexes.html) can optimize your queries.

<div id="toc"></div>

## Step 1. Install prerequisites

- Install the latest version of [CockroachDB](install-cockroachdb.html).
- Install the latest version of [Go](https://golang.org/dl/): `brew install go`

## Step 2. Start a single-node cluster

For the purpose of this tutorial, you need only one CockroachDB node running in insecure mode:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--store=hello-1 \
--host=localhost
~~~

## Step 3. Create a user

In a new terminal, as the `root` user, use the [`cockroach user`](create-and-manage-users.html) command to create a new user, `maxroach`.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach user set maxroach --insecure
~~~

## Step 4. Create a database and grant privileges

As the `root` user, open the [built-in SQL client](use-the-built-in-sql-client.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure
~~~

Next, create a database called `jsonb_test`:

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE jsonb_test;
~~~

Set the database as the default:

{% include copy-clipboard.html %}
~~~ sql
> SET DATABASE = jsonb_test;
~~~

Then [grant privileges](grant.html) to the `maxroach` user:

{% include copy-clipboard.html %}
~~~ sql
> GRANT ALL ON DATABASE jsonb_test TO maxroach
~~~

## Step 5. Create a table

In the [built-in SQL client](use-the-built-in-sql-client.html), create a table called `programming`:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE programming (
    id UUID NULL DEFAULT uuid_v4()::UUID,
    posts JSONB NULL,
    FAMILY "primary" (id, posts, rowid)
  );
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE programming;
~~~
~~~
+-------------+--------------------------------------------+
|    Table    |                CreateTable                 |
+-------------+--------------------------------------------+
| programming | CREATE TABLE programming (                 |
|             |     id UUID NULL DEFAULT uuid_v4()::UUID,  |
|             |     posts JSONB NULL,                      |
|             |     FAMILY "primary" (id, posts, rowid)    |
|             | )                                          |
+-------------+--------------------------------------------+
~~~

## Step 6. Run the code

Now that you have a database, user, and a table, let's run code to insert rows into the table.

The code queries the [Reddit API](https://www.reddit.com/dev/api/) for posts in [/r/programming](https://www.reddit.com/r/programming/). The Reddit API only returns 25 results per page; however, each page returns an `"after"` string that tells you how to get the next page. Therefore, the program does the following in a loop:

1. Makes a request to the API
2. Inserts the results into the table and grabs the `"after"` string
3. Uses the new `"after"` string as the basis for the next request

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/json/json-sample.go" download><code>json-sample.go</code></a> file, or create the file yourself and copy the code into it:

{% include copy-clipboard.html %}
~~~ go
{% include json/json-sample.go %}
~~~

From a new terminal window, navigate to your sample code file and run it:

{% include copy-clipboard.html %}
~~~ shell
$ go run json_sample.go
~~~

The program will take a few minutes to insert rows into your table. If you want to verify that rows of data were inserted into your table,  use the [built-in SQL client](use-the-built-in-sql-client.html):

{% include copy-clipboard.html %}
~~~ sql
> SELECT count(*) FROM programming;
~~~
~~~
+-------+
| count |
+-------+
|  4175 |
+-------+
~~~

{{site.data.alerts.callout_info}}Since you are querying live data, your results for this and the following steps may vary from the results documented in this tutorial.{{site.data.alerts.end}}

## Step 7. Query over the data

Once there is data in your table, run a query:

{% include copy-clipboard.html %}
~~~ sql
> SELECT id FROM programming WHERE posts @> '{"data": {"domain": "youtube.com"}}';
~~~
~~~
(334 rows)

Time: 105.877736ms
~~~

## Step 8. Create an inverted index to optimize performance

The query in the previous step took 105.877736ms. An [inverted index](inverted-indexes.html) will optimize the performance. Let's create an inverted index on the `JSONB` column:

{% include copy-clipboard.html %}
~~~ sql
> CREATE INVERTED INDEX ON programming(posts);
~~~

## Step 9. Run the query again

Now that there is an inverted index, the query should run faster. Run the same query:

{% include copy-clipboard.html %}
~~~ sql
> SELECT id FROM programming WHERE posts @> '{"data": {"domain": "youtube.com"}}';
~~~
~~~
(334 rows)

Time: 28.646769ms
~~~

After creating the inverted index, the query now takes 28.646769ms.

## What's Next?

Use a local cluster to explore these other core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Automatic Rebalancing](demo-automatic-rebalancing.html)
- [Cross-Cloud Migration](demo-automatic-cloud-migration.html)
- [Follow-the-Workload](demo-follow-the-workload.html)
- [Automated Operations](orchestrate-a-local-cluster-with-kubernetes-insecure.html)
