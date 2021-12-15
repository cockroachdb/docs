---
title: Connect to the Database
summary: How to connect to a CockroachDB cluster from your application
toc: true
---

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="cockroachcloud">Use {{ site.data.products.serverless-plan }}</button>
  <button class="filter-button page-level" data-scope="local">Use a Local Cluster</button>
</div>

CockroachDB supports both native drivers and the PostgreSQL wire protocol. Most client drivers and ORM frameworks connect to CockroachDB like they connect to PostgreSQL.

## Before you connect

Do the following:

<div class="filter-content" markdown="1" data-scope="cockroachcloud">
- <a href="https://cockroachlabs.cloud/signup?referralId={{page.referral_id}}" rel="noopener" target="_blank">Sign up for a {{ site.data.products.db }} account</a>.

- Start a [{{ site.data.products.db }} cluster](../cockroachcloud/quickstart.html).
</div>

<div class="filter-content" markdown="1" data-scope="local">
- Start a [local CockroachDB cluster](secure-a-cluster.html)
</div>

- [Install a client driver or ORM framework](install-client-drivers.html).

## Connect

<div class="filter-content" markdown="1" data-scope="cockroachcloud">
Use the connection information provided by the {{ site.data.products.db }} Console to configure your client to connect to CockroachDB.
</div>

<div class="filter-content" markdown="1" data-scope="local">
Use the connection information provided by the [`cockroach start`](cockroach-start.html)/[`cockroach start single-node`](cockroach-start-single-node.html) output to configure your client to connect to CockroachDB.
</div>

See the [client connection reference](connection-reference.html) page for details on how to connect with a supported client.

## What's next?

<a name="tasks"></a>

- [Design a Database Schema](schema-design-overview.html)
- [Insert Data](insert-data.html)
- [Query Data](query-data.html)
- [Update Data](update-data.html)
- [Delete Data](delete-data.html)

You might also be interested in the following pages:

- [Connection Pooling](connection-pooling.html)
- [Connection Parameters][connection_params]
- [Manual Deployments][manual]
- [Orchestrated Deployments][orchestrated]
- [Start a Local Cluster][local_secure]
- [Error Handling and Troubleshooting](error-handling-and-troubleshooting.html)
- [Make Queries Fast](make-queries-fast.html)
- [Hello World example apps](hello-world-example-apps.html)

<!-- Reference Links -->

[manual]: manual-deployment.html
[orchestrated]: orchestration.html
[local_secure]: secure-a-cluster.html
[connection_params]: connection-parameters.html
