---
title: Data Import
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
block_search: false
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

{{site.data.alerts.callout_info}}
To simplify the process of running multiple nodes on your local computer, you'll start them in the [background](../cockroach-start.html#general) instead of in separate terminals.
{{site.data.alerts.end}}

1. In a new terminal, start node 1:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node1 \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~~

2. Start node 2:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

3. Start node 3:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

4. Perform a one-time initialization of the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --insecure --host=localhost:26257
    ~~~

## Step 2. Import CSV data from remote file storage

1. In a new terminal, create a database into which you'll import a new table:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="CREATE DATABASE IF NOT EXISTS tabular_import;"
    ~~~

2. Run the [`IMPORT`](../import.html) statement, using schema and data files we've made publicly available on Google Cloud Storage:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --database="tabular_import" \
    --execute="IMPORT TABLE orders CREATE USING 'https://storage.googleapis.com/cockroach-fixtures/tpch-csv/schema/orders.sql' CSV DATA ('https://storage.googleapis.com/cockroach-fixtures/tpch-csv/sf-1/orders.tbl.1') WITH delimiter = '|';"
    ~~~

    The import will take a minute or two. To check the status of the import, navigate to the **Admin UI > [Jobs page](../admin-ui-jobs-page.html)**. Once it completes, you'll see a confirmation with details:

    ~~~
            job_id       |  status   | fraction_completed |  rows  | index_entries | system_records |  bytes
    +--------------------+-----------+--------------------+--------+---------------+----------------+----------+
      378471816945303553 | succeeded |                  1 | 187500 |        375000 |              0 | 26346739
    (1 row)
    ~~~

3. Check the schema of the imported `orders` table:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --database="tabular_import" \
    --execute="SHOW CREATE orders;"
    ~~~

    ~~~
      table_name |                                                              create_statement
    +------------+---------------------------------------------------------------------------------------------------------------------------------------------+
      orders     | CREATE TABLE orders (
                 |     o_orderkey INTEGER NOT NULL,
                 |     o_custkey INTEGER NOT NULL,
                 |     o_orderstatus STRING(1) NOT NULL,
                 |     o_totalprice DECIMAL(15,2) NOT NULL,
                 |     o_orderdate DATE NOT NULL,
                 |     o_orderpriority STRING(15) NOT NULL,
                 |     o_clerk STRING(15) NOT NULL,
                 |     o_shippriority INTEGER NOT NULL,
                 |     o_comment STRING(79) NOT NULL,
                 |     CONSTRAINT "primary" PRIMARY KEY (o_orderkey ASC),
                 |     INDEX o_ck (o_custkey ASC),
                 |     INDEX o_od (o_orderdate ASC),
                 |     FAMILY "primary" (o_orderkey, o_custkey, o_orderstatus, o_totalprice, o_orderdate, o_orderpriority, o_clerk, o_shippriority, o_comment)
                 | )
    (1 row)
    ~~~

    {{site.data.alerts.callout_info}}
    You can also view the schema by navigating to the **Admin UI > [Databases](../admin-ui-databases-page.html)** page and clicking on the table name.
    {{site.data.alerts.end}}

4. Read some data from the imported `orders` table:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --database="tabular_import" \
    --execute="SELECT o_orderkey, o_custkey, o_comment FROM orders WHERE o_orderstatus = 'O' LIMIT 10;"
    ~~~

    ~~~
      o_orderkey | o_custkey |                                   o_comment
    +------------+-----------+-------------------------------------------------------------------------------+
               1 |     36901 | nstructions sleep furiously among
               2 |     78002 |  foxes. pending accounts at the pending, silent asymptot
               4 |    136777 | sits. slyly regular warthogs cajole. regular, regular theodolites acro
               7 |     39136 | ly special requests
              32 |    130057 | ise blithely bold, regular requests. quickly unusual dep
              34 |     61001 | ly final packages. fluffily final deposits wake blithely ideas. spe
              35 |    127588 | zzle. carefully enticing deposits nag furio
              36 |    115252 |  quick packages are blithely. slyly silent accounts wake qu
              38 |    124828 | haggle blithely. furiously express ideas haggle blithely furiously regular re
              39 |     81763 | ole express, ironic requests: ir
    (10 rows)
    ~~~

## Step 3. Import a PostgreSQL dump file

If you're importing data from a PostgreSQL database, you can import the `.sql` file generated by the [`pg_dump`][pg_dump] command, after editing the file to be compatible with CockroachDB.

{{site.data.alerts.callout_success}}
The `.sql` files generated by `pg_dump` provide better performance because they use the `COPY` statement instead of bulk `INSERT` statements.
{{site.data.alerts.end}}

1. Download our sample [`pg_dump.sql`](resources/pg_dump.sql) file using [`curl`][curl] or [`wget`][wget], depending on which you have installed:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl -O {{site.url}}/docs/{{page.version.version}}/training/resources/pg_dump.sql
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ wget {{site.url}}/docs/{{page.version.version}}/training/resources/pg_dump.sql
    ~~~

2. Take a look at the `pg_dump.sql` file, which contains 2 tables, `customers` and `accounts`, as well as some constraints on both tables.

    Before this file can be imported into CockroachDB, it must be edited for compatibility as follows:  
    - The `CREATE SCHEMA` statement must be removed.
    - The `ALTER SCHEMA` statement must be removed.

3. Instead of manually cleaning the file, you can download our pre-cleaned version using [`curl`][curl] or [`wget`][wget]:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl -O {{site.url}}/docs/{{page.version.version}}/training/resources/pg_dump_cleaned.sql
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ wget {{site.url}}/docs/{{page.version.version}}/training/resources/pg_dump_cleaned.sql
    ~~~

4. Create a database you can use for the import:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="CREATE DATABASE IF NOT EXISTS pg_import;"
    ~~~

5. Import the dump:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $  cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --database=pg_import \
    --execute="IMPORT PGDUMP '{{site.url}}/docs/{{page.version.version}}/training/resources/pg_dump_cleaned.sql';"
    ~~~

    ~~~
           job_id       |  status   | fraction_completed | rows | index_entries | system_records | bytes
    --------------------+-----------+--------------------+------+---------------+----------------+-------
     409923615993004033 | succeeded |                  1 |   10 |             5 |              0 |   258
    ~~~

6. Read from the imported data:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --database=pg_import \
    --execute="SELECT customers.name, accounts.balance FROM accounts JOIN customers ON accounts.customer_id = customers.id;"
    ~~~

    ~~~
            name       | balance
    +------------------+---------+
      Bjorn Fairclough |     100
      Arturo Nevin     |     200
      Juno Studwick    |     400
      Naseem Joossens  |     200
      Eutychia Roberts |     200
    (5 rows)
    ~~~

    {{site.data.alerts.callout_info}}
    You can view the schema by navigating to the **Admin UI > [Databases](../admin-ui-databases-page.html)** page and clicking on the table name.
    {{site.data.alerts.end}}

## Step 4. Import a MySQL dump file

If you're importing data from a MySQL database, you can import the `.sql` file generated by the [`mysqldump`][mysqldump] command.

1. Download our sample [`mysql_dump.sql`](resources/mysql_dump.sql) file using [`curl`][curl] or [`wget`][wget]:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl -O {{site.url}}/docs/{{page.version.version}}/training/resources/mysql_dump.sql
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ wget {{site.url}}/docs/{{page.version.version}}/training/resources/mysql_dump.sql
    ~~~

2. Take a look at the `pg_dump.sql` file, which contains 2 tables, `customers` and `accounts`, as well as some constraints on both tables.

3. Create a database you can use for the import:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="CREATE DATABASE IF NOT EXISTS mysql_import;"
    ~~~

4. Import the dump:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $  cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="IMPORT MYSQLDUMP '{{site.url}}/docs/{{page.version.version}}/training/resources/mysql_dump.sql';"
    ~~~

    ~~~
           job_id       |  status   | fraction_completed | rows | index_entries | system_records | bytes
    --------------------+-----------+--------------------+------+---------------+----------------+-------
     409923615993004033 | succeeded |                  1 |   10 |             5 |              0 |   258
    ~~~

5. Read from the imported data:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SELECT customers.name, accounts.balance FROM accounts JOIN customers ON accounts.customer_id = customers.id;"
    ~~~

    ~~~
            name       | balance
    +------------------+---------+
      Bjorn Fairclough |     100
      Arturo Nevin     |     200
      Juno Studwick    |     400
      Naseem Joossens  |     200
      Eutychia Roberts |     200
    (5 rows)
    ~~~

    {{site.data.alerts.callout_info}}
    You can view the schema by navigating to the **Admin UI > [Databases](../admin-ui-databases-page.html)** page and clicking on the table name.
    {{site.data.alerts.end}}

## What's next?

[SQL Basics](sql-basics.html)

<!-- Reference Links -->

[curl]:      https://curl.haxx.se/
[wget]:      https://www.gnu.org/software/wget/
[pg_dump]:   https://www.postgresql.org/docs/current/app-pgdump.html
[mysqldump]: https://dev.mysql.com/doc/refman/8.0/en/mysqldump-sql-format.html
