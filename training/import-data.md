---
title: Importing Data to Your Cluster
summary: Learn how to import data from pg_dump and CSV files into your CockroachDB cluster.
toc: false
sidebar_data: sidebar-data-training.json
---

<div id="toc"></div>

## Presentation

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vRg_445dWS0Ag1Ta3jdMdyfyOIvpP72U0W3XklF8ScJmUlLkdezZUy7JK1jca3A5fWoZiEpq8iu_OMd/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

## Lab

In this lab, we'll download a dump from PostgreSQL (generated with `pg_dump`), reformat it, and then import it into CockroachDB.

### Before You Begin

To complete this lab, you need a [local cluster of 3 nodes](3-node-local-secure-cluster.html).

### Step 1. Download PostgreSQL

For this lab, we'll install the [PostgreSQL](https://www.postgresql.org/download/). If you're on a Mac and using Homebrew, use `brew install postgres`.

### Step 2. Download Postgres dump

Download our prepared [PostgreSQL dump file](resources/pg_dump.sql).

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
  <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
</div>
<p></p>

<div class="filter-content" markdown="1" data-scope="mac">
{% include copy-clipboard.html %}
~~~ shell
# Get the CockroachDB tarball:
$ curl -O {{site.url}}/docs/training/resources/pg_dump.sql
~~~
</div>

<div class="filter-content" markdown="1" data-scope="linux">
{% include copy-clipboard.html %}
~~~ shell
# Get the CockroachDB tarball:
$ wget {{page.url}}/training/resources/pg_dump.sql
~~~
</div>

### Step 3. Clean up the dump file

1. Review and understand the schema from `pg_dump.sql`. It contains 2 tables, `customers` and `accounts`, as well as some constraints on both tables.
2. Rewrite the two [`CREATE TABLE`](../stable/create-table.html) statements to contain all of the constraints identified in the file, including each table's [`PRIMARY KEY`](../stable/primary-key.html#syntax).
  This has to be done manually because PostgreSQL attempts to add the primary key after creating the table, but CockroachDB requires the primary key be defined upon table creation.
3. Remove all statements from the file besides the `CREATE TABLE` and `COPY` statements.

### Step 4. Import the dump

1. Create a database you can use for the import:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure -e "CREATE DATABASE import_test;"
    ~~~

2. Import the dump:
	
	{% include copy-clipboard.html %}
    ~~~ shell
    $ psql -p 26257 -h localhost -d import_test -U root < pg_dump.sql
    ~~~

### Step 5. Read from the imported data

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure -e "SELECT customers.name, accounts.balance FROM import_test.accounts JOIN import_test.customers ON accounts.customer_id = customers.id"
~~~

## Up Next

- [Identity and Access Management](identity-and-access-management.html)
