---
title: Migrate from a CockroachDB Serverless to CockroachDB Dedicated Cluster
summary: Learn how to migrate data from a CockroachDB Serverless cluster into a CockroachDB Dedicated cluster.
toc: true
redirect_from: migrate-from-free-to-dedicated.html
docs_area: migrate
---

This page has instructions for migrating data from a {{ site.data.products.serverless }} cluster to a {{ site.data.products.dedicated }} cluster, by exporting to CSV and using [`IMPORT`](../{{site.versions["stable"]}}/import.html). You may want to migrate to {{ site.data.products.dedicated }} if you want a single-tenant cluster with no shared resources.

The steps below use sample data from the [`tpcc` workload](../{{site.versions["stable"]}}/cockroach-workload.html#workloads).

## Before you start

These instructions assume you already have the following:

- A [{{ site.data.products.serverless }} cluster](quickstart.html) from which you want to migrate data
- A [paid {{ site.data.products.dedicated }} cluster](quickstart-trial-cluster.html)

    Your first paid {{ site.data.products.dedicated }} cluster is free for a 30-day trial.

- [Cloud storage](../{{site.versions["stable"]}}/use-cloud-storage-for-bulk-operations.html)

## Step 1. Export data to a local CSV file

In {{ site.data.products.serverless }} clusters, all external service integrations are disabled. This means that if you want to export data, you need to use [`cockroach sql --execute`](../{{site.versions["stable"]}}/cockroach-sql.html#general) to query the data you want to export, and then pipe the data to a local file. For example:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--url 'postgres://<username>:<password>@free-tier.<region>.cockroachlabs.cloud:26257?sslmode=verify-full&sslrootcert=<path/to/certs_dir>/cc-ca.crt&options=--cluster=<cluster_name>' \
--execute "SELECT * FROM tpcc.warehouse" --format=csv > /Users/<username>/<path/to/file>/warehouse.csv
~~~

By running the example command above, the following data is exported to the local `warehouse.csv` file:

~~~
w_id,w_name,w_street_1,w_street_2,w_city,w_state,w_zip,w_tax,w_ytd
0,8,17,13,11,SF,640911111,0.0806,300000.00
~~~

Repeat this step for each table you want to migrate. For example, let's export one more table (`district`) from the [`tpcc` database](../{{site.versions["stable"]}}/cockroach-workload.html#workloads):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--url 'postgres://<username>:<password>@free-tier.<region>.cockroachlabs.cloud:26257?sslmode=verify-full&sslrootcert=<path/to/certs_dir>/cc-ca.crt&options=--cluster=<cluster_name>' \
--execute "SELECT * FROM tpcc.district" --format=csv > /Users/<username>/<path/to/file>/district.csv
~~~

This will create the `district.csv` file with the following data:

~~~
d_id,d_w_id,d_name,d_street_1,d_street_2,d_city,d_state,d_zip,d_tax,d_ytd,d_next_o_id
1,0,9cdLXe0Yh,gLRrwsmd68P2b,ElAgrnp8ueW,NXJpBB0ObpVWo1B,QQ,640911111,0.1692,30000.00,3001
2,0,1fcW8Rsa,CXoEzmssaF9m9cdLXe0Y,hgLRrwsmd68P2bElAgr,np8ueWNXJpBB0ObpVW,VW,902211111,0.1947,30000.00,3001
3,0,6rumMm,p6NHnwiwKdcgp,hy3v1U5yraPx,xELo5B1fcW8RsaCXoEz,QQ,230811111,0.0651,30000.00,3001
4,0,ssaF9m9,cdLXe0YhgLRrws,md68P2bElAgrn,p8ueWNXJpBB0ObpVW,SF,308211111,0.1455,30000.00,3001
5,0,Kdcgphy3,v1U5yraPxxELo,5B1fcW8RsaCXoEzm,ssaF9m9cdLXe0YhgLR,CQ,308211111,0.1195,30000.00,3001
6,0,mssaF9m9cd,LXe0YhgLRrwsmd68P,2bElAgrnp8ue,WNXJpBB0ObpVW,WM,223011111,0.0709,30000.00,3001
7,0,zmssaF,9m9cdLXe0YhgLRrws,md68P2bElA,grnp8ueWNX,OA,264011111,0.1060,30000.00,3001
8,0,8RsaCXoEz,mssaF9m9cdLXe0Yh,gLRrwsmd68P2bElAgrnp,8ueWNXJpBB0ObpVWo,VW,022311111,0.0173,30000.00,3001
9,0,fcW8Rs,aCXoEzmssaF9m9,cdLXe0YhgLRrws,md68P2bElAgrnp8ue,JC,230811111,0.0755,30000.00,3001
10,0,RsaCXoEzm,ssaF9m9cdLXe0YhgLRr,wsmd68P2bE,lAgrnp8ueWNXJpBB0Ob,PV,082911111,0.1779,30000.00,3001
~~~

## Step 2. Host the files where the {{ site.data.products.dedicated }} cluster can access them

After you've exported your {{ site.data.products.serverless }} cluster data to your local machine, you now need to upload the files to a storage location where the {{ site.data.products.dedicated }} cluster can access them. **We recommend using [cloud storage](../{{site.versions["stable"]}}/use-cloud-storage-for-bulk-operations.html) or [`userfile`](../{{site.versions["stable"]}}/use-userfile-for-bulk-operations.html).**

In this example, we'll use Amazon S3 to host the two files (`warehouse.csv` and `district.csv`) created in [Step 1](#step-1-export-data-to-a-local-csv-file).

## Step 3. Import the CSV

{{site.data.alerts.callout_success}}
For best practices for optimizing import performance in CockroachDB, see [Import Performance Best Practices](../{{site.versions["stable"]}}/import-performance-best-practices.html).
{{site.data.alerts.end}}

1. [Create the database](../{{site.versions["stable"]}}/create-database.html) you want to import the tables into. For example:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE tpcc;
    ~~~

1. Write an [`IMPORT`](../{{site.versions["stable"]}}/import.html) statement that matches the schema of the table data you're importing.

    {{site.data.alerts.callout_success}}
    You can use the [`SHOW CREATE TABLE`](../{{site.versions["stable"]}}/show-create.html#show-the-create-table-statement-for-a-table) statement in the {{ site.data.products.serverless }} cluster to view the `CREATE` statement for the table you're migrating.
    {{site.data.alerts.end}}

    {% include v20.2/misc/csv-import-callout.md %}

    For example, to import the data from `warehouse.csv` into a `warehouse` table, use the following statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > IMPORT TABLE tpcc.warehouse (
        w_id INT8 NOT NULL,
        w_name VARCHAR(10) NULL,
        w_street_1 VARCHAR(20) NULL,
        w_street_2 VARCHAR(20) NULL,
        w_city VARCHAR(20) NULL,
        w_state CHAR(2) NULL,
        w_zip CHAR(9) NULL,
        w_tax DECIMAL(4,4) NULL,
        w_ytd DECIMAL(12,2) NULL,
        CONSTRAINT "primary" PRIMARY KEY (w_id ASC),
        FAMILY "primary" (w_id, w_name, w_street_1, w_street_2, w_city, w_state, w_zip, w_tax, w_ytd)
      ) CSV DATA ('s3://<bucket_name>/warehouse.csv?AWS_ACCESS_KEY_ID=<access_key>&AWS_SECRET_ACCESS_KEY=<secret_key>')
      WITH
        skip = '1';
    ~~~

    Notice that we used the [`skip` option](../v21.2/import.html#skip-first-n-lines) in the above command. This is because the first line of the CSV file we created in [Step 1](#step-1-export-data-to-a-local-csv-file) is the header row, not actual data to import. For more information about the options available for `IMPORT ... CSV`, see [Import options](../{{site.versions["stable"]}}/import.html#import-options).

    ~~~
            job_id       |  status   | fraction_completed | rows | index_entries | bytes
    ---------------------+-----------+--------------------+------+---------------+--------
      652283814057476097 | succeeded |                  1 |    1 |             0 |    53
    (1 row)
    ~~~

    {{site.data.alerts.callout_info}}
    To import data into an existing table, use [`IMPORT INTO`](../{{site.versions["stable"]}}/import-into.html).
    {{site.data.alerts.end}}

1. Repeat the above for each CSV file you want to import. For example, let's import the second file (`district.csv`) we created earlier:

    {% include copy-clipboard.html %}
    ~~~ sql
    > IMPORT TABLE tpcc.district (
        d_id INT8 NOT NULL,
        d_w_id INT8 NOT NULL,
        d_name VARCHAR(10) NULL,
        d_street_1 VARCHAR(20) NULL,
        d_street_2 VARCHAR(20) NULL,
        d_city VARCHAR(20) NULL,
        d_state CHAR(2) NULL,
        d_zip CHAR(9) NULL,
        d_tax DECIMAL(4,4) NULL,
        d_ytd DECIMAL(12,2) NULL,
        d_next_o_id INT8 NULL,
        CONSTRAINT "primary" PRIMARY KEY (d_w_id ASC, d_id ASC),
        FAMILY "primary" (d_id, d_w_id, d_name, d_street_1, d_street_2, d_city, d_state, d_zip, d_tax, d_ytd, d_next_o_id)                     
      ) CSV DATA ('s3://<bucket_name>/district.csv?AWS_ACCESS_KEY_ID=<access_key>&AWS_SECRET_ACCESS_KEY=<secret_key>')
      WITH
        skip = '1';
    ~~~

    ~~~
            job_id       |  status   | fraction_completed | rows | index_entries | bytes
    ---------------------+-----------+--------------------+------+---------------+--------
      652285202857820161 | succeeded |                  1 |   10 |             0 |  1017
    (1 row)
    ~~~

1. _(Optional)_ To verify that the two tables were imported, use [`SHOW TABLES`](../{{site.versions["stable"]}}/show-tables.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW TABLES FROM tpcc;
    ~~~

    ~~~
      schema_name | table_name | type  | owner  | estimated_row_count
    --------------+------------+-------+--------+----------------------
      public      | district   | table | lauren |                  10
      public      | warehouse  | table | lauren |                   1
    (2 rows)
    ~~~

## Step 4. Add any foreign key relationships

Once all of the tables you want to migrate have been imported into the {{ site.data.products.dedicated }} cluster, add the [foreign key](../{{site.versions["stable"]}}/foreign-key.html) relationships. To do this, use [`ALTER TABLE ... ADD CONSTRAINT`](../{{site.versions["stable"]}}/add-constraint.html). For example:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE tpcc.district ADD CONSTRAINT fk_d_w_id_ref_warehouse FOREIGN KEY (d_w_id) REFERENCES tpcc.warehouse(w_id);
~~~

~~~
ALTER TABLE
~~~

## See also

- [`IMPORT`](../{{site.versions["stable"]}}/import.html)
- [Migrate from CSV](../{{site.versions["stable"]}}/migrate-from-csv.html)
- [Import Performance Best Practices](../{{site.versions["stable"]}}/import-performance-best-practices.html)
- [Use the Built-in SQL Client](../{{site.versions["stable"]}}/cockroach-sql.html)
- [Other Cockroach Commands](../{{site.versions["stable"]}}/cockroach-commands.html)
