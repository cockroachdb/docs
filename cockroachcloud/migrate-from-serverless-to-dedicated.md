---
title: Migrate from a CockroachDB Serverless to CockroachDB Dedicated Cluster
summary: Learn how to migrate data from a CockroachDB Serverless cluster into a CockroachDB Dedicated cluster.
toc: true
docs_area: migrate
---

This page has instructions for migrating data from a {{ site.data.products.serverless }} cluster to a {{ site.data.products.dedicated }} cluster, by exporting to CSV and using [`IMPORT INTO`](../{{site.current_cloud_version}}/import-into.html). You may want to migrate to {{ site.data.products.dedicated }} if you want a single-tenant cluster with no shared resources.

The steps below use sample data from the [`tpcc` workload](../{{site.current_cloud_version}}/cockroach-workload.html#workloads).

## Before you start

These instructions assume you already have the following:

- A [{{ site.data.products.serverless }} cluster](quickstart.html) from which you want to migrate data.
- A [paid {{ site.data.products.dedicated }} cluster](quickstart-trial-cluster.html). Your first paid {{ site.data.products.dedicated }} cluster is free for a 30-day trial.
- [Cloud storage](../{{site.current_cloud_version}}/use-cloud-storage-for-bulk-operations.html).

## Step 1. Export data to cloud storage

First, upload your {{ site.data.products.serverless }} data to a cloud storage location where the {{ site.data.products.dedicated }} cluster can access it.

1. [Connect to your {{ site.data.products.serverless }} cluster](connect-to-a-serverless-cluster.html) and run the [`EXPORT`](../{{site.current_cloud_version}}/export.html) statement for each table you need to migrate. For example, the following statement exports the `warehouse` table from the [`tpcc`](../{{site.current_cloud_version}}/cockroach-workload.html#workloads) database to an Amazon S3 bucket:

    {% include copy-clipboard.html %}
    ~~~ sql
    EXPORT INTO CSV
      's3://{BUCKET NAME}/migration-data?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
      FROM TABLE tpcc.warehouse;
    ~~~

    Note that we uploaded the table in CSV format to a `migration-data` directory in the S3 bucket.

    The output shows the programmatically generated filename, which you'll reference when you [import the CSV](#step-2-import-the-csv):

    ~~~
                                  filename                             | rows | bytes
    -------------------------------------------------------------------+------+--------
      export1732f39b0dbe4e2b0000000000000001-n824429310719852545.0.csv |    1 |    43
    ~~~

    The export file contains the following CSV data:

    ~~~
    0,8,17,13,11,SF,640911111,0.0806,300000.00
    ~~~

1. Repeat this step for each table you want to migrate. For example, let's export one more table (`district`) from the `tpcc` database:

    {% include copy-clipboard.html %}
    ~~~ sql
    EXPORT INTO CSV
      's3://{BUCKET NAME}/migration-data?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
      FROM TABLE tpcc.district;
    ~~~

    ~~~
                                  filename                             | rows | bytes
    -------------------------------------------------------------------+------+--------
      export1732f292ceb8a1d80000000000000001-n824425591785291777.0.csv |   10 |   955
    ~~~

    The export file contains the following CSV data:

    ~~~
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

    {{site.data.alerts.callout_success}}
    For more information about using cloud storage with CockroachDB, see [Use Cloud Storage for Bulk Operations](../{{site.current_cloud_version}}/use-cloud-storage-for-bulk-operations.html).
    {{site.data.alerts.end}}

## Step 2. Import the CSV

{{site.data.alerts.callout_success}}
For best practices for optimizing import performance in CockroachDB, see [Import Performance Best Practices](../{{site.current_cloud_version}}/import-performance-best-practices.html).
{{site.data.alerts.end}}

1. [Connect to your {{ site.data.products.dedicated }} cluster](connect-to-your-cluster.html) and [create the database](../{{site.current_cloud_version}}/create-database.html) you want to import the tables into. For example:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE tpcc;
    ~~~

1. Write a [`CREATE TABLE`](../{{site.current_cloud_version}}/create-table.html) statement that matches the schema of the table data you're importing.

    {{site.data.alerts.callout_success}}
    You can use the [`SHOW CREATE TABLE`](../{{site.current_cloud_version}}/show-create.html#show-the-create-table-statement-for-a-table) statement in the {{ site.data.products.serverless }} cluster to view the `CREATE` statement for the table you're migrating.
    {{site.data.alerts.end}}

    {% include v20.2/misc/csv-import-callout.md %}

    For example, to import the `tpcc.warehouse` data into a `warehouse` table, issue the following statement to create the new table:

    {% include copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE tpcc.warehouse (
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
    );
    ~~~

    Next, use `IMPORT INTO` to import the data into the new table, specifying the filename of the export from [Step 1](#step-1-export-data-to-cloud-storage):

    {% include copy-clipboard.html %}
    ~~~ sql
    IMPORT INTO tpcc.warehouse (w_id, w_name, w_street_1, w_street_2, w_city, w_state, w_zip, w_tax, w_ytd)
      CSV DATA ('s3://{BUCKET NAME}/migration-data/{EXPORT FILENAME}?AWS_ACCESS_KEY_ID={ACCESS_KEY}&AWS_SECRET_ACCESS_KEY={SECRET_KEY}')
    ~~~

    ~~~
            job_id       |  status   | fraction_completed | rows | index_entries | bytes
    ---------------------+-----------+--------------------+------+---------------+--------
      652285202857820161 | succeeded |                  1 |   10 |             0 |  1017
    (1 row)
    ~~~

1. Repeat the above for each CSV file you want to import. For example, let's import the `tpcc.district` data:

    Issue the following statement to create a new `district` table:

    {% include copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE tpcc.district (
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
    );
    ~~~

    Next, use `IMPORT INTO` to import the data into the new table, specifying the filename of the export from [Step 1](#step-1-export-data-to-cloud-storage):

    {% include copy-clipboard.html %}
    ~~~ sql
    IMPORT INTO tpcc.district (d_id, d_w_id, d_name, d_street_1, d_street_2, d_city, d_state, d_zip, d_tax, d_ytd, d_next_o_id)
      CSV DATA ('s3://{BUCKET NAME}/migration-data/{EXPORT FILENAME}?AWS_ACCESS_KEY_ID={ACCESS_KEY}&AWS_SECRET_ACCESS_KEY={SECRET_KEY}')
    ~~~

    ~~~
            job_id       |  status   | fraction_completed | rows | index_entries | bytes
    ---------------------+-----------+--------------------+------+---------------+--------
      824426026443571201 | succeeded |                  1 |   10 |             0 |  1067
    (1 row)
    ~~~

1. _(Optional)_ To verify that the data was imported, use [`SHOW TABLES`](../{{site.current_cloud_version}}/show-tables.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW TABLES FROM tpcc;
    ~~~

    ~~~
      schema_name | table_name | type  | owner | estimated_row_count | locality
    --------------+------------+-------+-------+---------------------+-----------
      public      | district   | table | ryan  |                  10 | NULL
      public      | warehouse  | table | ryan  |                   1 | NULL
    (2 rows)
    ~~~

## Step 3. Add any foreign key relationships

Once all of the tables you want to migrate have been imported into the {{ site.data.products.dedicated }} cluster, add the [foreign key](../{{site.current_cloud_version}}/foreign-key.html) relationships. To do this, use [`ALTER TABLE ... ADD CONSTRAINT`](../{{site.current_cloud_version}}/alter-table.html#add-constraint). For example:

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE tpcc.district ADD CONSTRAINT fk_d_w_id_ref_warehouse FOREIGN KEY (d_w_id) REFERENCES tpcc.warehouse(w_id);
~~~

~~~
ALTER TABLE
~~~

## See also

- [`IMPORT`](../{{site.current_cloud_version}}/import.html)
- [Migration Overview](../{{site.current_cloud_version}}/migration-overview.html)
- [Migrate from CSV](../{{site.current_cloud_version}}/migrate-from-csv.html)
- [Import Performance Best Practices](../{{site.current_cloud_version}}/import-performance-best-practices.html)
- [Use the Built-in SQL Client](../{{site.current_cloud_version}}/cockroach-sql.html)
- [Other Cockroach Commands](../{{site.current_cloud_version}}/cockroach-commands.html)
