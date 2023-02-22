---
title: Serverless Function Best Practices
summary: Best practices for optimizing the performance of serverless functions (e.g., AWS Lambda functions or Google Cloud Functions) that connect to CockroachDB.
toc: true
referral_id: docs_serverless_functions
docs_area: get_started
---

This page provides best practices for optimizing the performance of serverless functions (e.g., [AWS Lambda functions](https://aws.amazon.com/lambda) and [Google Cloud Functions](https://cloud.google.com/functions)) that connect to CockroachDB.

## Use connection pools

Use connection pools to manage the lifecycle of database connections established by serverless functions. Connection pools health-check connections and re-establish broken connections in the event of a communication error.

When creating connection pools in serverless functions:

- Set the maximum connection pool size to 1, unless your function is multi-threaded and establishes multiple concurrent requests to your database within a single function instance.

- Do not set a minimum idle connection count. The connection pool should be free to open connections as needed.

- If supported by your pooling library, set the maximum lifetime on the connection pool to 30 minutes.

## Persist connection pools across function invocations

If you plan to invoke a serverless function at a high frequency, you should configure the function to persist connection pools across function invocations, to limit the number of new connection attempts to the database. This is typically done by initializing the connection pool variable outside the scope of the serverless function definition.

For example, suppose you are writing an AWS Lambda function that [`INSERT`](insert.html)s data into a table on a CockroachDB cluster, and you plan to run this query every few seconds. To persist a connection pool across invocations, initialize the connection pool variable outside of the [handler function](https://docs.aws.amazon.com/lambda/latest/dg/foundation-progmodel.html) definition and then define the connection pool in the handler only if the pool does not already exist.

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="node">node.JS</button>
  <button class="filter-button page-level" data-scope="python">Python</button>
</div>

<section class="filter-content" markdown="1" data-scope="node">

A node.JS function that implements this pattern could look similar to the following:

{% include_cached copy-clipboard.html %}
~~~ js
const { Pool } = require('pg')

let pool

const insertRows = async (p) => {
  const client = await p.connect()
  try {
    await client.query('INSERT INTO table (col1, col2) VALUES (val1, val2)')
  } catch (err) {
    console.log(err.stack)
  } finally {
    client.release()
  }
}

exports.handler = async (context) => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    pool = new Pool({
      connectionString,
      max: 1
    })
  }

  await insertRows(pool)
}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="python">

A Python function that implements this pattern could look similar to the following:

{% include_cached copy-clipboard.html %}
~~~ python
from psycopg2.pool import SimpleConnectionPool

pool = None


def query(p):
  conn = p.getconn()
  with conn.cursor() as cur:
      cur.execute("INSERT INTO table (col1, col2) VALUES (val1, val2)")
      conn.commit()

def lambda_handler(context):
    global pool

    if not pool:
        pool = SimpleConnectionPool(0, 1, dsn=os.environ['DATABASE_URL'])

    query(pool)

    return
~~~

</section>

## Use {{ site.data.products.serverless }}

As a database-as-a-service, {{ site.data.products.serverless }} abstracts away the complexity of deploying, scaling, and load-balancing your database. Additionally, idle database connections to CockroachDB use very little memory (~20-30 KiB) when compared to PostgreSQL (~2-10 MiB).

To create a free {{ site.data.products.serverless }} cluster:

{% include cockroachcloud/quickstart/create-a-free-cluster.md %}

## Deploy serverless functions in the same region as your database

To minimize network latency, you should deploy your serverless functions in the same region as your database deployment. If your serverless function provider does not offer deployments in the same region as your database deployment, choose the region closest to the region where your database is deployed.

## See also

- [Create and Deploy an AWS Lambda Function Built on CockroachDB](deploy-lambda-function.html)
- [Connect to your Cluster](connect-to-the-database.html)
