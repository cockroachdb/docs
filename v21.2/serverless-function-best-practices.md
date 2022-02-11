---
title: Serverless Function Best Practices
summary: Best practices for optimizing the performance of serverless functions (e.g., AWS Lambda functions or Google Cloud Functions) that connect to CockroachDB.
toc: true
referral_id: docs_serverless_functions
---

This page provides best practices for optimizing the performance of serverless functions (e.g., [AWS Lambda functions](https://aws.amazon.com/lambda) and [Google Cloud Functions](https://cloud.google.com/functions)) that connect to CockroachDB.

## Configure connection pools based on the concurrency support of the serverless runtime

We recommend using connection pools to manage the lifecycle of database connections established by serverless functions. Connection pools health-check connections and re-establish broken connections in the event of a communication error.

When you create connection pools in serverless functions:

- The connection pool size should not exceed the maximum number of concurrent requests that a single instance of your serverless function can make to the database.

    [AWS Lambda functions](https://docs.aws.amazon.com/lambda/latest/dg/configuration-concurrency.html) and [Google Cloud Functions](https://cloud.google.com/functions/docs/concepts/exec#auto-scaling_and_concurrency) implement concurrency by scaling the number of function instances that run in parallel. Each instance only executes a single request at a time. As a result, AWS Lambda functions and Google Cloud Functions should establish and reuse a single database connection from a connection pool with a maximum pool size of 1.

- Do not set a minimum idle connection count. The connection pool should be free to open connections as needed.

## Persist database connections across function invocations

If you plan to invoke a serverless function at a high frequency, you should configure your serverless function to persist database connections across function invocations to limit the number of new connections to the database. This is typically done by initializing the database connection outside the scope of the serverless function definition.

For example, suppose you are writing an AWS Lambda function that [`INSERT`](insert.html)s data into a table on a CockroachDB cluster, and you plan to run this query every few seconds. To persist the connection to the cluster across invocations, initialize the connection variables outside of the [handler function](https://docs.aws.amazon.com/lambda/latest/dg/foundation-progmodel.html) definition and then open a new connection in the handler if the connection is no longer open.

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="node">node.JS</button>
  <button class="filter-button page-level" data-scope="python">Python</button>
</div>

<section class="filter-content" markdown="1" data-scope="node">

A node.JS function that implements this pattern could look similar to the following:

{% include_cached copy-clipboard.html %}
~~~ js
const { Pool } = require('pg')

let client
let pool

const insertAccounts = async (client) => {
  await client.query('INSERT INTO table (col1, col2) VALUES (val1, val2)')
}

exports.handler = async (event, context) => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    pool = new Pool({
      connectionString,
      max: 1,
      min: 0
    })
  }
  if (!client) { client = await pool.connect() }

  await insertAccounts(client)
}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="python">

A Python function that implements this pattern could look similar to the following:

{% include_cached copy-clipboard.html %}
~~~ python
from psycopg2.extras import register_uuid
from psycopg2.pool import SimpleConnectionPool

pool = None
conn = None


def query(conn):
  with conn.cursor() as cur:
      cur.execute("INSERT INTO table (col1, col2) VALUES (val1, val2)")

def lambda_handler(event, context):
    global pool
    global conn

    if not pool:
        pool = SimpleConnectionPool(0, 1, dsn=os.environ['DATABASE_URL'])
    if not conn:
        conn = pool.getconn()

    return
~~~

</section>

## Use CockroachDB {{ site.data.products.serverless }}

As a database-as-a-service, CockroachDB {{ site.data.products.serverless }} abstracts away the complexity of deploying, scaling, and load-balancing your database. Additionally, idle database connections to CockroachDB use very little memory (~20-30 KiB) when compared to PostgreSQL (~2-10 MiB).

To create a free CockroachDB {{ site.data.products.serverless }} cluster:

{% include cockroachcloud/quickstart/create-a-free-cluster.md %}

## Deploy serverless functions in the same region as your database

To minimize network latency, you should deploy your serverless functions in the same region as your database deployment. If your serverless function provider does not offer deployments in the same region as your database deployment, choose the region closest to the region where your database is deployed.

## See also

- [Create and Deploy an AWS Lambda Function Built on CockroachDB](deploy-lambda-function.html)
- [Connect to your Cluster](connect-to-the-database.html)
