---
title: Build a Simple CRUD Node.js App with CockroachDB and Knex.js
summary: Learn how to use CockroachDB from a simple CRUD application that uses the Knex.js query builder.
toc: true
twitter: false
referral_id: docs_node_knexjs
filter_category: crud_js
filter_html: Use <strong>KnexJS</strong>
filter_sort: 3
doc_area: 
product_area: 
---

{% include filter-tabs.md %}

This tutorial shows you how build a simple Node.js application with CockroachDB and [Knex.js](https://knexjs.org/).

## Step 1. Start CockroachDB

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="cockroachcloud">Use {{ site.data.products.serverless }}</button>
  <button class="filter-button page-level" data-scope="local">Use a Local Cluster</button>
</div>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

{% include cockroachcloud/quickstart/create-a-free-cluster.md %}

{% include cockroachcloud/quickstart/set-up-your-cluster-connection-no-cert.md %}

</section>

<section class="filter-content" markdown="1" data-scope="local">

1. If you haven't already, [download the CockroachDB binary](install-cockroachdb.html).
1. Run the [`cockroach start-single-node`](cockroach-start-single-node.html) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start-single-node --advertise-addr 'localhost' --insecure
    ~~~

    This starts an insecure, single-node cluster.

{% include {{ page.version.version }}/prod-deployment/insecure-flag.md %}

</section>

## Step 2. Get the code

Clone the code's GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachlabs/example-app-node-knex
~~~

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

Check out the `serverless` branch:

{% include_cached copy-clipboard.html %}
~~~ shell
git checkout serverless
~~~

Update the configuration settings in the `app.js` file using the connection information that you retrieved from the {{ site.data.products.db }} Console.

</section>

## Step 3. Run the code

1. Install the app requirements:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npm install
    ~~~

1. Run the app:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npm run run
    ~~~

    The output should look like this:

    ~~~
    Initializing accounts table...
    New account balances:
    { id: 'bc0f7136-7103-4dc4-88fc-102d5bbd312f', balance: '1000' }
    { id: '35bde7d0-29c9-4277-a117-3eb80c85ae16', balance: '250' }
    { id: '18cc1b2d-be61-4a8d-942c-480f5a6bc207', balance: '0' }
    Transferring funds...
    New account balances:
    { id: 'bc0f7136-7103-4dc4-88fc-102d5bbd312f', balance: '900' }
    { id: '35bde7d0-29c9-4277-a117-3eb80c85ae16', balance: '350' }
    { id: '18cc1b2d-be61-4a8d-942c-480f5a6bc207', balance: '0' }
    Deleting a row...
    New account balances:
    { id: 'bc0f7136-7103-4dc4-88fc-102d5bbd312f', balance: '900' }
    { id: '18cc1b2d-be61-4a8d-942c-480f5a6bc207', balance: '0' }
    ~~~

## What's next?

{% include {{page.version.version}}/app/see-also-links.md %}
