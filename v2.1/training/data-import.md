---
title: Data Import
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
block_search: false
redirect_from: /training/data-import.html
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vRg_445dWS0Ag1Ta3jdMdyfyOIvpP72U0W3XklF8ScJmUlLkdezZUy7JK1jca3A5fWoZiEpq8iu_OMd/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>

## Before you begin

In this lab, you'll start with a fresh cluster, so make sure you've stopped and cleaned up the cluster from the previous lab.

## Step 1. Start a 3-node cluster

Start and initialize a cluster like you did in previous modules.

1. In a new terminal, start node 1:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --store=node1 \
    --host=localhost \
    --port=26257 \
    --http-port=8080 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

2. In a new terminal, start node 2:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --store=node2 \
    --host=localhost \
    --port=26258 \
    --http-port=8081 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

3. In a new terminal, start node 3:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --store=node3 \
    --host=localhost \
    --port=26259 \
    --http-port=8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

4. In a new terminal, perform a one-time initialization of the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach init --insecure
    ~~~

## Step 2. Import tabular data from remote file storage

The [`IMPORT`](../import.html) feature is one of the most efficient ways to get data into a cluster, so let's start with it.

1. Create a database into which you'll import a new table:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="CREATE DATABASE import_test;"
    ~~~

2. Run the `IMPORT` command, using schema and data files we've made publicly available on Google Cloud Storage:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --database="import_test" \
    --execute="IMPORT TABLE orders CREATE USING 'https://storage.googleapis.com/cockroach-fixtures/tpch-csv/schema/orders.sql' CSV DATA ('https://storage.googleapis.com/cockroach-fixtures/tpch-csv/sf-1/orders.tbl.1') WITH delimiter = '|';"
    ~~~

    The import will take a minute or two. Once it completes, you'll see a confirmation with details:

    ~~~
    +--------------------+-----------+--------------------+--------+---------------+----------------+----------+
    |       job_id       |  status   | fraction_completed |  rows  | index_entries | system_records |  bytes   |
    +--------------------+-----------+--------------------+--------+---------------+----------------+----------+
    | 320453737551659009 | succeeded |                  1 | 187500 |        375000 |              0 | 36389148 |
    +--------------------+-----------+--------------------+--------+---------------+----------------+----------+
    (1 row)
    ~~~

3. Check the schema of the imported `orders` table:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --database="import_test" \
    --execute="SHOW CREATE TABLE orders;"
    ~~~

    ~~~
    +--------+--------------------------------------------------------------------------+
    | Table  |                               CreateTable                                |
    +--------+--------------------------------------------------------------------------+
    | orders | CREATE TABLE orders (                                                    |
    |        |                                                                          |
    |        |     o_orderkey INTEGER NOT NULL,                                         |
    |        |                                                                          |
    |        |     o_custkey INTEGER NOT NULL,                                          |
    |        |                                                                          |
    |        |     o_orderstatus STRING(1) NOT NULL,                                    |
    |        |                                                                          |
    |        |     o_totalprice DECIMAL(15,2) NOT NULL,                                 |
    |        |                                                                          |
    |        |     o_orderdate DATE NOT NULL,                                           |
    |        |                                                                          |
    |        |     o_orderpriority STRING(15) NOT NULL,                                 |
    |        |                                                                          |
    |        |     o_clerk STRING(15) NOT NULL,                                         |
    |        |                                                                          |
    |        |     o_shippriority INTEGER NOT NULL,                                     |
    |        |                                                                          |
    |        |     o_comment STRING(79) NOT NULL,                                       |
    |        |                                                                          |
    |        |     CONSTRAINT "primary" PRIMARY KEY (o_orderkey ASC),                   |
    |        |                                                                          |
    |        |     INDEX o_ck (o_custkey ASC),                                          |
    |        |                                                                          |
    |        |     INDEX o_od (o_orderdate ASC),                                        |
    |        |                                                                          |
    |        |     FAMILY "primary" (o_orderkey, o_custkey, o_orderstatus,              |
    |        | o_totalprice, o_orderdate, o_orderpriority, o_clerk, o_shippriority,     |
    |        | o_comment)                                                               |
    |        |                                                                          |
    |        | )                                                                        |
    +--------+--------------------------------------------------------------------------+
    (1 row)
    ~~~

4. Read some data from the imported `orders` table:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --database="import_test" \
    --execute="SELECT o_orderkey, o_custkey, o_comment FROM orders WHERE o_orderstatus = 'O' LIMIT 10;"
    ~~~

    ~~~
    +------------+-----------+--------------------------------------------------------------------------+
    | o_orderkey | o_custkey |                                o_comment                                 |
    +------------+-----------+--------------------------------------------------------------------------+
    |          1 |     36901 | nstructions sleep furiously among                                        |
    |          2 |     78002 |  foxes. pending accounts at the pending, silent asymptot                 |
    |          4 |    136777 | sits. slyly regular warthogs cajole. regular, regular theodolites acro   |
    |          7 |     39136 | ly special requests                                                      |
    |         32 |    130057 | ise blithely bold, regular requests. quickly unusual dep                 |
    |         34 |     61001 | ly final packages. fluffily final deposits wake blithely ideas. spe      |
    |         35 |    127588 | zzle. carefully enticing deposits nag furio                              |
    |         36 |    115252 |  quick packages are blithely. slyly silent accounts wake qu              |
    |         38 |    124828 | haggle blithely. furiously express ideas haggle blithely furiously       |
    |            |           | regular re                                                               |
    |         39 |     81763 | ole express, ironic requests: ir                                         |
    +------------+-----------+--------------------------------------------------------------------------+
    (10 rows)
    ~~~

## Step 3. Import a generic SQL file

You can also import data from a generic `.sql` file containing CockroachDB-compatible SQL statements.

1. Download our sample SQL file:

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>
    <p></p>

    <div class="filter-content" markdown="1" data-scope="mac">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl -O {{site.url}}/docs/v2.0/training/resources/startrek.sql
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget {{site.url}}/docs/v2.0/training/resources/startrek.sql
    ~~~
    </div>

    This file contains CockroachDB-compatible SQL statements to:
    - Create a `startrek` database
    - Create two tables, `episodes` and `quotes`
    - Insert rows into the tables

2. Use `cockroach sql` to execute the SQL statements in the file:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql --insecure < startrek.sql
    ~~~

3. Check the schema of the imported `episodes` table:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --database="startrek" \
    --execute="SHOW CREATE TABLE episodes;"
    ~~~

    ~~~
    +----------+---------------------------------------------------------+
    |  Table   |                       CreateTable                       |
    +----------+---------------------------------------------------------+
    | episodes | CREATE TABLE episodes (                                 |
    |          |                                                         |
    |          |     id INT NOT NULL,                                    |
    |          |                                                         |
    |          |     season INT NULL,                                    |
    |          |                                                         |
    |          |     num INT NULL,                                       |
    |          |                                                         |
    |          |     title STRING NULL,                                  |
    |          |                                                         |
    |          |     stardate DECIMAL NULL,                              |
    |          |                                                         |
    |          |     CONSTRAINT "primary" PRIMARY KEY (id ASC),          |
    |          |                                                         |
    |          |     FAMILY "primary" (id, season, num, title, stardate) |
    |          |                                                         |
    |          | )                                                       |
    +----------+---------------------------------------------------------+
    (1 row)
    ~~~

4. Read some data from the imported `episodes` table:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --database="startrek" \
    --execute="SELECT * FROM episodes LIMIT 10;"
    ~~~

    ~~~
    +----+--------+-----+--------------------------------+----------+
    | id | season | num |             title              | stardate |
    +----+--------+-----+--------------------------------+----------+
    |  1 |      1 |   1 | The Man Trap                   |   1531.1 |
    |  2 |      1 |   2 | Charlie X                      |   1533.6 |
    |  3 |      1 |   3 | Where No Man Has Gone Before   |   1312.4 |
    |  4 |      1 |   4 | The Naked Time                 |   1704.2 |
    |  5 |      1 |   5 | The Enemy Within               |   1672.1 |
    |  6 |      1 |   6 | Mudd's Women                   |   1329.8 |
    |  7 |      1 |   7 | What Are Little Girls Made Of? |   2712.4 |
    |  8 |      1 |   8 | Miri                           |   2713.5 |
    |  9 |      1 |   9 | Dagger of the Mind             |   2715.1 |
    | 10 |      1 |  10 | The Corbomite Maneuver         |   1512.2 |
    +----+--------+-----+--------------------------------+----------+
    (10 rows)
    ~~~

## Step 4. Import a PostgreSQL dump

If you're importing data from a PostgreSQL deployment, you can import the `.sql` file generated by the `pg_dump` command, after cleaning the file to be compatible with CockroachDB.

{{site.data.alerts.callout_success}}The <code>.sql</code> files generated by <code>pg_dump</code> provide better performance because they use the <code>COPY</code> statement instead of bulk <code>INSERT</code> statements.{{site.data.alerts.end}}

1. Install the [PostgreSQL](https://www.postgresql.org/download/) database. If you're on a Mac and use Homebrew, run:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ brew install postgres
    ~~~

2. Download our sample [`pg_dump.sql`](resources/pg_dump.sql) file:

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>
    <p></p>

    <div class="filter-content" markdown="1" data-scope="mac">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl -O {{site.url}}/docs/v2.0/training/resources/pg_dump.sql
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget {{site.url}}/docs/v2.0/training/resources/pg_dump.sql
    ~~~
    </div>

3. Take a look at the `pg_dump.sql` file, which contains 2 tables, `customers` and `accounts`, as well as some constraints on both tables.

    Before this file can be used to import into CockroachDB, the SQL must be edited for compatibility with CockroachDB:
    - The two [`CREATE TABLE`](../create-table.html) statements must be rewritten to contain all of the constraints identified in the file, including each table's [`PRIMARY KEY`](../primary-key.html#syntax) and the `accounts` table's [`FOREIGN KEY` constraint](../foreign-key.html#syntax). **This must be done manually** because PostgreSQL attempts to add the primary key after creating the table, but CockroachDB requires the primary key be defined upon table creation.
    - Everything but the `CREATE TABLE` and `COPY` statements must be removed.
    - The `CREATE TABLE` and `COPY` statements for the `customers` table must be reordered to come before the `CREATE TABLE` and `COPY` statements for the `accounts` table because of the `FOREIGN KEY` constraint.

4. Instead of manually cleaning the file, you can download our pre-cleaned version:

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>
    <p></p>

    <div class="filter-content" markdown="1" data-scope="mac">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl -O {{site.url}}/docs/v2.0/training/resources/pg_dump_cleaned.sql
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget {{site.url}}/docs/v2.0/training/resources/pg_dump_cleaned.sql
    ~~~
    </div>

5. Create a database you can use for the import:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="CREATE DATABASE pg_import;"
    ~~~

5. Import the dump:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ psql -p 26257 -h localhost -d pg_import -U root < pg_dump_cleaned.sql
    ~~~

6. Read from the imported data:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="SELECT customers.name, accounts.balance FROM pg_import.accounts JOIN pg_import.customers ON accounts.customer_id = customers.id;"
    ~~~

    ~~~
    +------------------+---------+
    |       name       | balance |
    +------------------+---------+
    | Bjorn Fairclough |     100 |
    | Arturo Nevin     |     200 |
    | Naseem Joossens  |     200 |
    | Juno Studwick    |     400 |
    | Eutychia Roberts |     200 |
    +------------------+---------+
    (5 rows)    
    ~~~

## What's next?

[Users and Privileges](users-and-privileges.html)
