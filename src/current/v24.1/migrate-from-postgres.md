---
title: Migrate from PostgreSQL
summary: Learn how to migrate data from PostgreSQL into a CockroachDB cluster.
toc: true
docs_area: migrate
---

This page describes basic considerations and provides a basic [example](#example-migrate-frenchtowns-to-cockroachdb) of migrating data from PostgreSQL to CockroachDB. The information on this page assumes that you have read [Migration Overview]({% link {{ page.version.version }}/migration-overview.md %}), which describes the broad phases and considerations of migrating a database to CockroachDB. 

The [PostgreSQL migration example](#example-migrate-frenchtowns-to-cockroachdb) on this page demonstrates how to use [MOLT tooling]({% link {{ page.version.version }}/migration-overview.md %}#molt) to update the PostgreSQL schema, perform an initial load of data, and validate the data. These steps are essential when [preparing for a full migration]({% link {{ page.version.version }}/migration-overview.md %}#prepare-for-migration).

{{site.data.alerts.callout_success}}
If you need help migrating to CockroachDB, contact our <a href="mailto:sales@cockroachlabs.com">sales team</a>.
{{site.data.alerts.end}}

## Syntax differences

CockroachDB supports the [PostgreSQL wire protocol](https://www.postgresql.org/docs/current/protocol.html) and is largely compatible with PostgreSQL syntax. 

For syntax differences, refer to [Features that differ from PostgreSQL]({% link {{ page.version.version }}/postgresql-compatibility.md %}#features-that-differ-from-postgresql).

### Unsupported features

The following PostgreSQL features do not yet exist in CockroachDB:

{% include {{page.version.version}}/sql/unsupported-postgres-features.md %}

## Load PostgreSQL data

You can use one of the following methods to migrate PostgreSQL data to CockroachDB:

- {% include {{ page.version.version }}/migration/load-data-import-into.md %} 

       {% include {{ page.version.version }}/misc/import-perf.md %}

- {% include {{ page.version.version }}/migration/load-data-third-party.md %}

- {% include {{ page.version.version }}/migration/load-data-copy-from.md %}

The [following example](#example-migrate-frenchtowns-to-cockroachdb) uses `IMPORT INTO` to perform the initial data load.

## Example: Migrate `frenchtowns` to CockroachDB

The following steps demonstrate [converting a schema]({% link {{ page.version.version }}/migration-overview.md %}#convert-the-schema), performing an [initial load of data]({% link {{ page.version.version }}/migration-overview.md %}#load-test-data), and [validating data consistency]({% link {{ page.version.version }}/migration-overview.md %}#validate-queries) during a migration.

In the context of a full migration, these steps ensure that PostgreSQL data can be properly migrated to CockroachDB and your application queries tested against the cluster. For details, see the [Migration Overview]({% link {{ page.version.version }}/migration-overview.md %}#prepare-for-migration).

### Before you begin

The example uses a modified version of the PostgreSQL `french-towns-communes-francais` data set and demonstrates how to migrate the schema and data to a {{ site.data.products.serverless }} cluster. To follow along with these steps:

1. Download the `frenchtowns` data set:

       {% include_cached copy-clipboard.html %}
       ~~~ shell
       curl -O https://cockroachdb-migration-examples.s3.us-east-1.amazonaws.com/postgresql/frenchtowns/frenchtowns.sql
       ~~~

1. Create a `frenchtowns` database on your PostgreSQL instance:

       {% include_cached copy-clipboard.html %}
       ~~~ shell
       createdb frenchtowns
       ~~~

1. Load the `frenchtowns` data into PostgreSQL, specifying the path of the downloaded file:

       {% include_cached copy-clipboard.html %}
       ~~~ shell
       psql frenchtowns -a -f frenchtowns.sql
       ~~~

1. Create a free [{{ site.data.products.cloud }} account]({% link cockroachcloud/create-an-account.md %}), which is used to access the [Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}) and create the {{ site.data.products.serverless }} cluster.

{{site.data.alerts.callout_success}}
{% include cockroachcloud/migration/sct-self-hosted.md %}
{{site.data.alerts.end}}

### Step 1. Convert the PostgreSQL schema

Use the [Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}) to convert the `frenchtowns` schema for compatibility with CockroachDB. The schema has three tables: `regions`, `departments`, and `towns`.

1. Dump the PostgreSQL `frenchtowns` schema with the following [`pg_dump`](https://www.postgresql.org/docs/15/app-pgdump.html) command:

       {% include_cached copy-clipboard.html %}
       ~~~ shell
       pg_dump --schema-only frenchtowns > frenchtowns_schema.sql
       ~~~

1. Open the [Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}) in the {{ site.data.products.cloud }} Console and [add a new PostgreSQL schema]({% link cockroachcloud/migrations-page.md %}#convert-a-schema).

       After conversion is complete, [review the results]({% link cockroachcloud/migrations-page.md %}#review-the-schema). The [**Summary Report**]({% link cockroachcloud/migrations-page.md %}#summary-report) shows that there are errors under **Required Fixes**. You must resolve these in order to migrate the schema to CockroachDB.

       {{site.data.alerts.callout_success}}
       You can also [add your PostgreSQL database credentials]({% link cockroachcloud/migrations-page.md %}#use-credentials) to have the Schema Conversion Tool obtain the schema directly from the PostgreSQL database.
       {{site.data.alerts.end}}

1. `Missing user: postgres` errors indicate that the SQL user `postgres` is missing from CockroachDB. Click **Add User** to create the user.

1. `Miscellaneous Errors` includes a `SELECT pg_catalog.set_config('search_path', '', false)` statement that can safely be removed. Click **Delete** to remove the statement from the schema.

1. Review the `CREATE SEQUENCE` statements listed under **Suggestions**. Cockroach Labs does not recommend using a sequence to define a primary key column. For more information, see [Unique ID best practices]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#unique-id-best-practices).

       For this example, **Acknowledge** the suggestion without making further changes. In practice, after [conducting the full migration]({% link {{ page.version.version }}/migration-overview.md %}#conduct-the-migration) to CockroachDB, you would modify your CockroachDB schema to use unique and non-sequential primary keys.

1. Click **Retry Migration**. The **Summary Report** now shows that there are no errors. This means that the schema is ready to migrate to CockroachDB.

       This example migrates directly to a {{ site.data.products.serverless }} cluster. {% include cockroachcloud/migration/sct-self-hosted.md %}

1. Click [**Migrate Schema**]({% link cockroachcloud/migrations-page.md %}#migrate-the-schema) to create a new {{ site.data.products.serverless }} cluster with the converted schema. Name the database `frenchtowns`.

       You can view this database on the [**Databases** page]({% link cockroachcloud/databases-page.md %}) of the {{ site.data.products.cloud }} Console.

### Step 2. Load the PostgreSQL data

Load the `frenchtowns` data into CockroachDB using [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) with CSV-formatted data. {% include {{ page.version.version }}/sql/export-csv-tsv.md %}

{{site.data.alerts.callout_info}}
By default, [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) invalidates all [foreign key]({% link {{ page.version.version }}/foreign-key.md %}) constraints on the target table.
{{site.data.alerts.end}}

1. Dump each table in the PostgreSQL `frenchtowns` database to a CSV-formatted file:

       {% include_cached copy-clipboard.html %}
       ~~~ shell
       psql frenchtowns -c "COPY regions TO stdout DELIMITER ',' CSV;" > regions.csv
       ~~~

       {% include_cached copy-clipboard.html %}
       ~~~ shell
       psql frenchtowns -c "COPY departments TO stdout DELIMITER ',' CSV;" > departments.csv
       ~~~

       {% include_cached copy-clipboard.html %}
       ~~~ shell
       psql frenchtowns -c "COPY towns TO stdout DELIMITER ',' CSV;" > towns.csv
       ~~~

1. Host the files where the CockroachDB cluster can access them.

       Each node in the CockroachDB cluster needs to have access to the files being imported. There are several ways for the cluster to access the data; for more information on the types of storage [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) can pull from, see the following:
       - [Use Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %})
       - [Use a Local File Server]({% link {{ page.version.version }}/use-a-local-file-server.md %})

       Cloud storage such as Amazon S3 or Google Cloud is highly recommended for hosting the data files you want to import. 

       The dump files generated in the preceding step are already hosted on a public S3 bucket created for this example.

1. Open a SQL shell to the CockroachDB `frenchtowns` cluster. To find the command, open the **Connect** dialog in the {{ site.data.products.cloud }} Console and select the `frenchtowns` database and **CockroachDB Client** option. It will look like:

       {% include_cached copy-clipboard.html %}
       ~~~ shell
       cockroach sql --url "postgresql://{username}@{hostname}:{port}/frenchtowns?sslmode=verify-full" 
       ~~~

1. Use [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) to import each PostgreSQL dump file into the corresponding table in the `frenchtowns` database.

       The following commands point to a public S3 bucket where the `frenchtowns` data dump files are hosted for this example.

       {{site.data.alerts.callout_success}}
       You can add the `row_limit` [option]({% link {{ page.version.version }}/import-into.md %}#import-options) to specify the number of rows to import. For example, `row_limit = '10'` will import the first 10 rows of the table. This option is useful for finding errors quickly before executing a more time- and resource-consuming import.
       {{site.data.alerts.end}}

       {% include_cached copy-clipboard.html %}
       ~~~ sql
       IMPORT INTO regions
         CSV DATA (
           'https://cockroachdb-migration-examples.s3.us-east-1.amazonaws.com/postgresql/frenchtowns/regions.csv'
         );
       ~~~

       ~~~
               job_id       |  status   | fraction_completed | rows | index_entries | bytes
       ---------------------+-----------+--------------------+------+---------------+--------
         893753132185026561 | succeeded |                  1 |   26 |            52 |  2338
       ~~~

       {% include_cached copy-clipboard.html %}
       ~~~ sql
       IMPORT INTO departments
         CSV DATA (
           'https://cockroachdb-migration-examples.s3.us-east-1.amazonaws.com/postgresql/frenchtowns/departments.csv'
         );
       ~~~

       ~~~
               job_id       |  status   | fraction_completed | rows | index_entries | bytes
       ---------------------+-----------+--------------------+------+---------------+--------
         893753147892465665 | succeeded |                  1 |  100 |           300 | 11166
       ~~~

       {% include_cached copy-clipboard.html %}
       ~~~ sql
       IMPORT INTO towns
         CSV DATA (
           'https://cockroachdb-migration-examples.s3.us-east-1.amazonaws.com/postgresql/frenchtowns/towns.csv'
         );
       ~~~

       ~~~
               job_id       |  status   | fraction_completed | rows  | index_entries |  bytes
       ---------------------+-----------+--------------------+-------+---------------+----------
         893753162225680385 | succeeded |                  1 | 36684 |         36684 | 2485007
       ~~~

1. Recall that `IMPORT INTO` invalidates all [foreign key]({% link {{ page.version.version }}/foreign-key.md %}) constraints on the target table. View the constraints that are defined on `departments` and `towns`:

       {% include_cached copy-clipboard.html %}
       ~~~ sql
       SHOW CONSTRAINTS FROM departments;
       ~~~

       ~~~
         table_name  |     constraint_name     | constraint_type |                         details                         | validated
       --------------+-------------------------+-----------------+---------------------------------------------------------+------------
         departments | departments_capital_key | UNIQUE          | UNIQUE (capital ASC)                                    |     t
         departments | departments_code_key    | UNIQUE          | UNIQUE (code ASC)                                       |     t
         departments | departments_name_key    | UNIQUE          | UNIQUE (name ASC)                                       |     t
         departments | departments_pkey        | PRIMARY KEY     | PRIMARY KEY (id ASC)                                    |     t
         departments | departments_region_fkey | FOREIGN KEY     | FOREIGN KEY (region) REFERENCES regions(code) NOT VALID |     f
       ~~~

       {% include_cached copy-clipboard.html %}
       ~~~ sql
       SHOW CONSTRAINTS FROM towns;
       ~~~

       ~~~
         table_name |      constraint_name      | constraint_type |                             details                             | validated
       -------------+---------------------------+-----------------+-----------------------------------------------------------------+------------
         towns      | towns_code_department_key | UNIQUE          | UNIQUE (code ASC, department ASC)                               |     t
         towns      | towns_department_fkey     | FOREIGN KEY     | FOREIGN KEY (department) REFERENCES departments(code) NOT VALID |     f
         towns      | towns_pkey                | PRIMARY KEY     | PRIMARY KEY (id ASC)                                            |     t
       ~~~

1. To validate the foreign keys, issue an [`ALTER TABLE ... VALIDATE CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#validate-constraint) statement for each table:

       {% include_cached copy-clipboard.html %}
       ~~~ sql
       ALTER TABLE departments VALIDATE CONSTRAINT departments_region_fkey;
       ~~~

       {% include_cached copy-clipboard.html %}
       ~~~ sql
       ALTER TABLE towns VALIDATE CONSTRAINT towns_department_fkey;
       ~~~

### Step 3. Validate the migrated data

Use [MOLT Verify]({% link molt/molt-verify.md %}) to check that the data on PostgreSQL and CockroachDB are consistent.

1. [Install MOLT Verify.]({% link molt/molt-verify.md %})

1. In the directory where you installed MOLT Verify, use the following command to compare the two databases, specifying the PostgreSQL connection string with `--source` and the CockroachDB connection string with `--target`:

       {{site.data.alerts.callout_success}}
       To find the CockroachDB connection string, open the **Connect** dialog in the {{ site.data.products.cloud }} Console and select the `frenchtowns` database and the **General connection string** option.
       {{site.data.alerts.end}}

       {% include_cached copy-clipboard.html %}
       ~~~ shell
       ./molt verify --source 'postgresql://{username}:{password}@{host}:{port}/frenchtowns' --target 'postgresql://{user}:{password}@{host}:{port}/frenchtowns?sslmode=verify-full'
       ~~~

       You will see the initial output:

       ~~~
       <nil> INF verification in progress
       ~~~

       The following output indicates that MOLT Verify has completed verification:

       ~~~
       <nil> INF finished row verification on public.regions (shard 1/1): truth rows seen: 26, success: 26, missing: 0, mismatch: 0, extraneous: 0, live_retry: 0
       <nil> INF finished row verification on public.departments (shard 1/1): truth rows seen: 100, success: 100, missing: 0, mismatch: 0, extraneous: 0, live_retry: 0
       <nil> INF progress on public.towns (shard 1/1): truth rows seen: 10000, success: 10000, missing: 0, mismatch: 0, extraneous: 0, live_retry: 0
       <nil> INF progress on public.towns (shard 1/1): truth rows seen: 20000, success: 20000, missing: 0, mismatch: 0, extraneous: 0, live_retry: 0
       <nil> INF progress on public.towns (shard 1/1): truth rows seen: 30000, success: 30000, missing: 0, mismatch: 0, extraneous: 0, live_retry: 0
       <nil> INF finished row verification on public.towns (shard 1/1): truth rows seen: 36684, success: 36684, missing: 0, mismatch: 0, extraneous: 0, live_retry: 0
       <nil> INF verification complete
       ~~~

With the schema migrated and the initial data load verified, the next steps in a real-world migration are to ensure that you have made any necessary [application changes]({% link {{ page.version.version }}/migration-overview.md %}#application-changes), [validate application queries]({% link {{ page.version.version }}/migration-overview.md %}#validate-queries), and [perform a dry run]({% link {{ page.version.version }}/migration-overview.md %}#perform-a-dry-run) before [conducting the full migration]({% link {{ page.version.version }}/migration-overview.md %}#conduct-the-migration).

To learn more, see the [Migration Overview]({% link {{ page.version.version }}/migration-overview.md %}).

## See also

- [Migration Overview]({% link {{ page.version.version }}/migration-overview.md %})
- [Use the Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %})
- [Use the MOLT Verify tool]({% link molt/molt-verify.md %})
- [Import Performance Best Practices]({% link {{ page.version.version }}/import-performance-best-practices.md %})
- [Migrate from CSV]({% link {{ page.version.version }}/migrate-from-csv.md %})
- [Migrate from MySQL]({% link {{ page.version.version }}/migrate-from-mysql.md %})
- [Can a PostgreSQL or MySQL application be migrated to CockroachDB?]({% link {{ page.version.version }}/frequently-asked-questions.md %}#can-a-postgresql-or-mysql-application-be-migrated-to-cockroachdb)
