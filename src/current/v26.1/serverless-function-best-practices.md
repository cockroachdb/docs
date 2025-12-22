---
title: Serverless Function Best Practices
summary: Best practices for optimizing the performance of serverless functions that connect to CockroachDB, such AWS Lambda functions or Google Cloud Functions.
toc: true
referral_id: docs_serverless_functions
docs_area: get_started
---

This page provides best practices for optimizing the performance of serverless functions that connect to CockroachDB, such as [AWS Lambda functions](https://aws.amazon.com/lambda) and [Google Cloud Functions](https://cloud.google.com/functions).

## Use connection pools that persist across function invocations

Use [connection pools]({% link {{ page.version.version }}/connection-pooling.md %}) to manage the lifecycle of database connections established by serverless functions. Connection pools check connection health and re-establish broken connections in the event of a communication error.

When creating connection pools in serverless functions:

- Set the maximum connection pool size to 1, unless your function is multi-threaded and establishes multiple concurrent requests to your database within a single function instance.
- Do not set a minimum idle connection count. The connection pool should be free to open connections as needed.
- If supported by your pooling library, set the maximum lifetime on the connection pool to 30 minutes.

If you plan to invoke a serverless function frequently, configure the function to persist connection pools across function invocations. This helps to limit the number of new connection attempts to the cluster. One way to do this is to initialize the connection pool variable outside the scope of the serverless function definition.

For example if an AWS Lambda function uses [`INSERT`]({% link {{ page.version.version }}/insert.md %}) to add data to a table and runs every few seconds, initialize the connection pool variable outside of the [handler function](https://docs.aws.amazon.com/lambda/latest/dg/foundation-progmodel.html) definition, then define the connection pool in the handler only if the pool does not already exist.

Select either node.js or Python to continue.

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="node">node.JS</button>
  <button class="filter-button page-level" data-scope="python">Python</button>
</div>

<section class="filter-content" markdown="1" data-scope="node">

The following node.js code implements this pattern:

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

The following Python code implements this pattern:

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

## Use CockroachDB {{ site.data.products.standard }}

As a database-as-a-service, CockroachDB {{ site.data.products.standard }} abstracts away the complexity of deploying, scaling, and load-balancing your database.

To create a free CockroachDB {{ site.data.products.standard }} cluster:

{% include_cached cockroachcloud/quickstart/create-free-trial-standard-cluster.md %}

## Deploy serverless functions in the same region as your cluster

To minimize network latency, you should deploy your serverless functions in the same region as your cluster. If your serverless function provider does not offer deployments in the same region as your database deployment, choose the region nearest to the region where your database is deployed.

## See also

- [Create and Deploy an AWS Lambda Function Built on CockroachDB]({% link {{ page.version.version }}/deploy-lambda-function.md %})
- [Connect to your Cluster]({% link {{ page.version.version }}/connect-to-the-database.md %})
