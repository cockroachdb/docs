---
title: Migrate from MySQL
summary: Learn how to migrate data from MySQL into a CockroachDB cluster.
toc: true
docs_area: migrate
---

This page describes basic considerations and provides a basic [example](#example-migrate-world-to-cockroachdb) of migrating data from MySQL to CockroachDB. The information on this page assumes that you have read [Migration Overview]({% link {{ page.version.version }}/migration-overview.md %}), which describes the broad phases and considerations of migrating a database to CockroachDB. 

The [MySQL migration example](#example-migrate-world-to-cockroachdb) on this page demonstrates how to use [MOLT tooling]({% link {{ page.version.version }}/migration-overview.md %}#molt) to update the MySQL schema, perform an initial load of data, and validate the data. These steps are essential when [preparing for a full migration]({% link {{ page.version.version }}/migration-overview.md %}#prepare-for-migration).

{{site.data.alerts.callout_success}}
If you need help migrating to CockroachDB, contact our <a href="mailto:sales@cockroachlabs.com">sales team</a>.
{{site.data.alerts.end}}

## Syntax differences

You will likely need to make application changes due to differences in syntax between MySQL and CockroachDB. Along with the [general considerations in the migration overview]({% link {{ page.version.version }}/migration-overview.md %}#application-changes), also consider the following MySQL-specific information as you develop your migration plan.

When [using the Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}?filters=mysql#convert-a-schema), MySQL syntax that cannot automatically be converted will be displayed in the [**Summary Report**]({% link cockroachcloud/migrations-page.md %}?filters=mysql#summary-report). These may include the following.

#### String case sensitivity

Strings are case-insensitive in MySQL and case-sensitive in CockroachDB. You may need to edit your MySQL data to get the results you expect from CockroachDB. For example, you may have been doing string comparisons in MySQL that will need to be changed to work with CockroachDB.

For more information about the case sensitivity of strings in MySQL, see [Case Sensitivity in String Searches](https://dev.mysql.com/doc/refman/8.0/en/case-sensitivity.html) from the MySQL documentation. For more information about CockroachDB strings, see [`STRING`]({% link {{ page.version.version }}/string.md %}).

#### Identifier case sensitivity

Identifiers are case-sensitive in MySQL and [case-insensitive in CockroachDB]({% link {{ page.version.version }}/keywords-and-identifiers.md %}#identifiers). When [using the Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}?filters=mysql#convert-a-schema), you can either keep case sensitivity by enclosing identifiers in double quotes, or make identifiers case-insensitive by converting them to lowercase.

#### `AUTO_INCREMENT` attribute

The MySQL [`AUTO_INCREMENT`](https://dev.mysql.com/doc/refman/8.0/en/example-auto-increment.html) attribute, which creates sequential column values, is not supported in CockroachDB. When [using the Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}?filters=mysql#convert-a-schema), columns with `AUTO_INCREMENT` can be converted to use [sequences]({% link {{ page.version.version }}/create-sequence.md %}), `UUID` values with [`gen_random_uuid()`]({% link {{ page.version.version }}/functions-and-operators.md %}#id-generation-functions), or unique `INT8` values using [`unique_rowid()`]({% link {{ page.version.version }}/functions-and-operators.md %}#id-generation-functions). Cockroach Labs does not recommend using a sequence to define a primary key column. For more information, see [Unique ID best practices]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#unique-id-best-practices).

{{site.data.alerts.callout_info}}
Changing a column type during schema conversion will cause [MOLT Verify]({% link molt/molt-verify.md %}) to identify a type mismatch during [data validation](#step-3-validate-the-migrated-data). This is expected behavior.
{{site.data.alerts.end}}

#### `ENUM` type

MySQL `ENUM` types are defined in table columns. On CockroachDB, [`ENUM`]({% link {{ page.version.version }}/enum.md %}) is a standalone type. When [using the Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}?filters=mysql#convert-a-schema), you can either deduplicate the `ENUM` definitions or create a separate type for each column.

#### `TINYINT` type

`TINYINT` data types are not supported in CockroachDB. The [Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}?filters=mysql) automatically converts `TINYINT` columns to [`INT2`]({% link {{ page.version.version }}/int.md %}) (`SMALLINT`).

#### Geospatial types

MySQL geometry types are not converted to CockroachDB [geospatial types]({% link {{ page.version.version }}/spatial-data-overview.md %}#spatial-objects) by the [Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}?filters=mysql). They should be manually converted to the corresponding types in CockroachDB.

#### `FIELD` function

The MYSQL `FIELD` function is not supported in CockroachDB. Instead, you can use the [`array_position`]({% link {{ page.version.version }}/functions-and-operators.md %}#array-functions) function, which returns the index of the first occurrence of element in the array.

Example usage:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT array_position(ARRAY[4,1,3,2],1);
~~~

~~~
  array_position
------------------
               2
(1 row)
~~~

While MySQL returns 0 when the element is not found, CockroachDB returns `NULL`. So if you are using the `ORDER BY` clause in a statement with the `array_position` function, the caveat is that sort is applied even when the element is not found. As a workaround, you can use the [`COALESCE`]({% link {{ page.version.version }}/functions-and-operators.md %}#conditional-and-function-like-operators) operator.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM table_a ORDER BY COALESCE(array_position(ARRAY[4,1,3,2],5),999);
~~~

## Load MySQL data

You can use one of the following methods to migrate MySQL data to CockroachDB:

- {% include {{ page.version.version }}/migration/load-data-import-into.md %} 

       {% include {{ page.version.version }}/misc/import-perf.md %}

- {% include {{ page.version.version }}/migration/load-data-third-party.md %}

The [following example](#example-migrate-world-to-cockroachdb) uses `IMPORT INTO` to perform the initial data load.

## Example: Migrate `world` to CockroachDB

The following steps demonstrate [converting a schema]({% link {{ page.version.version }}/migration-overview.md %}#convert-the-schema), performing an [initial load of data]({% link {{ page.version.version }}/migration-overview.md %}#load-test-data), and [validating data consistency]({% link {{ page.version.version }}/migration-overview.md %}#validate-queries) during a migration.

In the context of a full migration, these steps ensure that MySQL data can be properly migrated to CockroachDB and your application queries tested against the cluster. For details, see the [Migration Overview]({% link {{ page.version.version }}/migration-overview.md %}#prepare-for-migration).

### Before you begin

The example uses the [MySQL `world` data set](https://dev.mysql.com/doc/index-other.html) and demonstrates how to migrate the schema and data to a {{ site.data.products.serverless }} cluster. To follow along with these steps:

1. Download the [`world` data set](https://dev.mysql.com/doc/index-other.html).

1. Create the `world` database on your MySQL instance, specifying the path of the downloaded file:

       {% include_cached copy-clipboard.html %}
       ~~~ shell
       mysqlsh -uroot --sql --file {path}/world-db/world.sql
       ~~~

1. Create a free [{{ site.data.products.cloud }} account]({% link cockroachcloud/create-an-account.md %}), which is used to access the [Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}?filters=mysql) and create the {{ site.data.products.serverless }} cluster.

{{site.data.alerts.callout_success}}
{% include cockroachcloud/migration/sct-self-hosted.md %}
{{site.data.alerts.end}}

### Step 1. Convert the MySQL schema

Use the [Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}?filters=mysql) to convert the `world` schema for compatibility with CockroachDB. The schema has three tables: `city`, `country`, and `countrylanguage`.

1. Dump the MySQL `world` schema with the following [`mysqldump`](https://dev.mysql.com/doc/refman/8.0/en/mysqldump-sql-format.html) command:

       {% include_cached copy-clipboard.html %}
       ~~~ shell
       mysqldump -uroot --no-data world > world_schema.sql
       ~~~

1. Open the [Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}?filters=mysql) in the {{ site.data.products.cloud }} Console and [add a new MySQL schema]({% link cockroachcloud/migrations-page.md %}?filters=mysql#convert-a-schema).

       For **AUTO_INCREMENT Conversion Option**, select the [`unique_rowid()`]({% link {{ page.version.version }}/functions-and-operators.md %}#id-generation-functions) option. This will convert the `ID` column in the `city` table, which has MySQL type `int` and `AUTO_INCREMENT`, to a CockroachDB [`INT8`]({% link {{ page.version.version }}/int.md %}) type with default values generated by [`unique_rowid()`]({% link {{ page.version.version }}/functions-and-operators.md %}#id-generation-functions). For context on this option, see [`AUTO_INCREMENT` attribute](#auto_increment-attribute).

       The `UUID` and `unique_rowid()` options are each preferred for [different use cases]({% link {{ page.version.version }}/sql-faqs.md %}#what-are-the-differences-between-uuid-sequences-and-unique_rowid). For this example, selecting the `unique_rowid()` option makes [loading the data](#step-2-load-the-mysql-data) more straightforward in a later step, since both the source and target columns will have integer types.

1. [Upload `world_schema.sql`]({% link cockroachcloud/migrations-page.md %}?filters=mysql#upload-file) to the Schema Conversion Tool.

       After conversion is complete, [review the results]({% link cockroachcloud/migrations-page.md %}?filters=mysql#review-the-schema). The [**Summary Report**]({% link cockroachcloud/migrations-page.md %}?filters=mysql#summary-report) shows that there are no errors. This means that the schema is ready to migrate to CockroachDB. 

       {{site.data.alerts.callout_success}}
       You can also [add your MySQL database credentials]({% link cockroachcloud/migrations-page.md %}?filters=mysql#use-credentials) to have the Schema Conversion Tool obtain the schema directly from the MySQL database.
       {{site.data.alerts.end}}

       This example migrates directly to a {{ site.data.products.serverless }} cluster. {% include cockroachcloud/migration/sct-self-hosted.md %}

1. Before you migrate the converted schema, click the **Statements** tab to view the [Statements list]({% link cockroachcloud/migrations-page.md %}?filters=mysql#statements-list). Scroll down to the `CREATE TABLE countrylanguage` statement and edit the statement to add a [collation]({% link {{ page.version.version }}/collate.md %}) (`COLLATE en_US`) on the `language` column:

       {% include_cached copy-clipboard.html %}
       ~~~ sql
       CREATE TABLE countrylanguage (
              countrycode VARCHAR(3) DEFAULT '' NOT NULL,
              language VARCHAR(30) COLLATE en_US DEFAULT '' NOT NULL,
              isofficial countrylanguage_isofficial_enum
              DEFAULT 'F'
              NOT NULL,
              percentage DECIMAL(4,1) DEFAULT '0.0' NOT NULL,
              PRIMARY KEY (countrycode, language),
              INDEX countrycode (countrycode),
              CONSTRAINT countrylanguage_ibfk_1
                     FOREIGN KEY (countrycode) REFERENCES country (code)
       )
       ~~~

       Click **Save**.

       This is a workaround to prevent [data validation](#step-3-validate-the-migrated-data) from failing due to collation mismatches. For more details, see the [MOLT Verify] ({% link molt/molt-verify.md %}#known-limitations) documentation.
       
1. Click [**Migrate Schema**]({% link cockroachcloud/migrations-page.md %}?filters=mysql#migrate-the-schema) to create a new {{ site.data.products.serverless }} cluster with the converted schema. Name the database `world`.

       You can view this database on the [**Databases** page]({% link cockroachcloud/databases-page.md %}) of the {{ site.data.products.cloud }} Console.
       
1. Open a SQL shell to the CockroachDB `world` cluster. To find the command, open the **Connect** dialog in the {{ site.data.products.cloud }} Console and select the `world` database and **CockroachDB Client** option. It will look like:

       {% include_cached copy-clipboard.html %}
       ~~~ shell
       cockroach sql --url "postgresql://{username}@{hostname}:{port}/world?sslmode=verify-full" 
       ~~~

1. For large imports, Cockroach Labs recommends [removing indexes prior to loading data]({% link {{ page.version.version }}/import-performance-best-practices.md %}#import-into-a-schema-with-secondary-indexes) and recreating them afterward. This provides increased visibility into the import progress and the ability to retry each step independently.

       Show the indexes on the `world` database:

       {% include_cached copy-clipboard.html %}
       ~~~ sql
       SHOW INDEXES FROM DATABASE world;
       ~~~

       The `countrycode` [foreign key]({% link {{ page.version.version }}/foreign-key.md %}) indexes on the `city` and `countrylanguage` tables can be removed for now:

       ~~~
                   table_name           |                   index_name                    | index_schema | non_unique | seq_in_index |   column_name   |   definition    | direction | storing | implicit | visible
       ---------------------------------+-------------------------------------------------+--------------+------------+--------------+-----------------+-----------------+-----------+---------+----------+----------
       ...
         city                           | countrycode                                     | public       |     t      |            2 | id              | id              | ASC       |    f    |    t     |    t
         city                           | countrycode                                     | public       |     t      |            1 | countrycode     | countrycode     | ASC       |    f    |    f     |    t
       ...
         countrylanguage                | countrycode                                     | public       |     t      |            1 | countrycode     | countrycode     | ASC       |    f    |    f     |    t
         countrylanguage                | countrycode                                     | public       |     t      |            2 | language        | language        | ASC       |    f    |    t     |    t
       ...
       ~~~

1. Drop the `countrycode` indexes:

       {% include_cached copy-clipboard.html %}
       ~~~ sql
       DROP INDEX city@countrycode;
       ~~~

       {% include_cached copy-clipboard.html %}
       ~~~ sql
       DROP INDEX countrylanguage@countrycode;
       ~~~

       You will recreate the indexes after [loading the data](#step-2-load-the-mysql-data).

### Step 2. Load the MySQL data

Load the `world` data into CockroachDB using [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) with CSV-formatted data. {% include {{ page.version.version }}/sql/export-csv-tsv.md %}

{{site.data.alerts.callout_info}}
When MySQL dumps data, the tables are not ordered by [foreign key]({% link {{ page.version.version }}/foreign-key.md %}) constraints, and foreign keys are not placed in the correct dependency order. It is best to disable foreign key checks when loading data into CockroachDB, and revalidate foreign keys on each table after the data is loaded.

By default, [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) invalidates all [foreign key]({% link {{ page.version.version }}/foreign-key.md %}) constraints on the target table.
{{site.data.alerts.end}}

1. Dump the MySQL `world` data with the following [`mysqldump` command](https://dev.mysql.com/doc/refman/8.0/en/mysqldump-delimited-text.html):

       {% include_cached copy-clipboard.html %}
       ~~~ shell
       mysqldump -uroot -T /{path}/world-data --fields-terminated-by ',' --fields-enclosed-by '"' --fields-escaped-by '\' --no-create-info world
       ~~~

       This dumps each table in your database to the path `/{path}/world-data` as a `.txt` file in CSV format.
       - `--fields-terminated-by` specifies that values are separated by commas instead of tabs.
       - `--fields-enclosed-by` and `--fields-escaped-by` specify the characters that enclose and escape column values, respectively.
       - `--no-create-info` dumps only the [data manipulation language (DML)]({% link {{ page.version.version }}/sql-statements.md %}#data-manipulation-statements).

1. Host the files where the CockroachDB cluster can access them.

       Each node in the CockroachDB cluster needs to have access to the files being imported. There are several ways for the cluster to access the data; for more information on the types of storage [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) can pull from, see the following:
       - [Use Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %})
       - [Use a Local File Server]({% link {{ page.version.version }}/use-a-local-file-server.md %})

       Cloud storage such as Amazon S3 or Google Cloud is highly recommended for hosting the data files you want to import. 

       The dump files generated in the preceding step are already hosted on a public S3 bucket created for this example.

1. Open a SQL shell to the CockroachDB `world` cluster, using the same command as before:

       {% include_cached copy-clipboard.html %}
       ~~~ shell
       cockroach sql --url "postgresql://{username}@{hostname}:{port}/world?sslmode=verify-full" 
       ~~~

1. Use [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) to import each MySQL dump file into the corresponding table in the `world` database.

       The following commands point to a public S3 bucket where the `world` data dump files are hosted for this example. The `nullif='\N'` clause specifies that `\N` values, which are produced by the `mysqldump` command, should be read as [`NULL`]({% link {{ page.version.version }}/null-handling.md %}).

       {{site.data.alerts.callout_success}}
       You can add the `row_limit` [option]({% link {{ page.version.version }}/import-into.md %}#import-options) to specify the number of rows to import. For example, `row_limit = '10'` will import the first 10 rows of the table. This option is useful for finding errors quickly before executing a more time- and resource-consuming import.
       {{site.data.alerts.end}}

       ~~~ sql
       IMPORT INTO countrylanguage
         CSV DATA (
           'https://cockroachdb-migration-examples.s3.us-east-1.amazonaws.com/mysql/world/countrylanguage.txt'
         )
         WITH
           nullif='\N';
       ~~~

       ~~~
               job_id       |  status   | fraction_completed | rows | index_entries | bytes
       ---------------------+-----------+--------------------+------+---------------+---------
         887782070812344321 | succeeded |                  1 |  984 |           984 | 171555
       ~~~

       ~~~ sql
       IMPORT INTO country
         CSV DATA (
           'https://cockroachdb-migration-examples.s3.us-east-1.amazonaws.com/mysql/world/country.txt'
         )
         WITH
           nullif='\N';
       ~~~

       ~~~
               job_id       |  status   | fraction_completed | rows | index_entries | bytes
       ---------------------+-----------+--------------------+------+---------------+--------
         887782114360819713 | succeeded |                  1 |  239 |             0 | 33173
       ~~~

       ~~~ sql
       IMPORT INTO city
         CSV DATA (
           'https://cockroachdb-migration-examples.s3.us-east-1.amazonaws.com/mysql/world/city.txt'
         )
         WITH
           nullif='\N';
       ~~~

       ~~~
               job_id       |  status   | fraction_completed | rows | index_entries | bytes
       ---------------------+-----------+--------------------+------+---------------+---------
         887782154421567489 | succeeded |                  1 | 4079 |          4079 | 288140
       ~~~

       {{site.data.alerts.callout_info}}
       After [converting the schema](#step-1-convert-the-mysql-schema) to work with CockroachDB, the `id` column in `city` is an [`INT8`]({% link {{ page.version.version }}/int.md %}) with default values generated by [`unique_rowid()`]({% link {{ page.version.version }}/functions-and-operators.md %}#id-generation-functions). However, `unique_rowid()` values are only generated when new rows are [inserted]({% link {{ page.version.version }}/insert.md %}) without an `id` value. The MySQL data dump still includes the sequential `id` values generated by the MySQL [`AUTO_INCREMENT` attribute](#auto_increment-attribute), and these are imported with the `IMPORT INTO` command. 

       In an actual migration, you can either update the primary key into a [multi-column key]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#use-multi-column-primary-keys) or add a new primary key column that [generates unique IDs]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#unique-id-best-practices).
       {{site.data.alerts.end}}

1. Recreate the indexes that you deleted before importing the data:

       {% include_cached copy-clipboard.html %}
       ~~~ sql
       CREATE INDEX countrycode ON city (countrycode, id);
       ~~~

       {% include_cached copy-clipboard.html %}
       ~~~ sql
       CREATE INDEX countrycode ON countrylanguage (countrycode, language);
       ~~~

1. Recall that `IMPORT INTO` invalidates all [foreign key]({% link {{ page.version.version }}/foreign-key.md %}) constraints on the target table. View the constraints that are defined on `city` and `countrylanguage`:

       {% include_cached copy-clipboard.html %}
       ~~~ sql
       SHOW CONSTRAINTS FROM city;
       ~~~

       ~~~
         table_name | constraint_name | constraint_type |                           details                            | validated
       -------------+-----------------+-----------------+--------------------------------------------------------------+------------
         city       | city_ibfk_1     | FOREIGN KEY     | FOREIGN KEY (countrycode) REFERENCES country(code) NOT VALID |     f
         city       | city_pkey       | PRIMARY KEY     | PRIMARY KEY (id ASC)                                         |     t
       ~~~

       {% include_cached copy-clipboard.html %}
       ~~~ sql
       SHOW CONSTRAINTS FROM countrylanguage;
       ~~~

       ~~~
           table_name    |    constraint_name     | constraint_type |                           details                            | validated
       ------------------+------------------------+-----------------+--------------------------------------------------------------+------------
         countrylanguage | countrylanguage_ibfk_1 | FOREIGN KEY     | FOREIGN KEY (countrycode) REFERENCES country(code) NOT VALID |     f
         countrylanguage | countrylanguage_pkey   | PRIMARY KEY     | PRIMARY KEY (countrycode ASC, language ASC)                  |     t
       ~~~

1. To validate the foreign keys, issue an [`ALTER TABLE ... VALIDATE CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#validate-constraint) statement for each table:

       {% include_cached copy-clipboard.html %}
       ~~~ sql
       ALTER TABLE city VALIDATE CONSTRAINT city_ibfk_1;
       ~~~

       {% include_cached copy-clipboard.html %}
       ~~~ sql
       ALTER TABLE countrylanguage VALIDATE CONSTRAINT countrylanguage_ibfk_1;
       ~~~

### Step 3. Validate the migrated data

Use [MOLT Verify]({% link molt/molt-verify.md %}) to check that the data on MySQL and CockroachDB are consistent.

1. [Install MOLT Verify.]({% link molt/molt-verify.md %})

1. In the directory where you installed MOLT Verify, use the following command to compare the two databases, specifying the [JDBC connection string for MySQL](https://dev.mysql.com/doc/connector-j/8.1/en/connector-j-reference-jdbc-url-format.html) with `--source` and the SQL connection string for CockroachDB with `--target`:

       {{site.data.alerts.callout_success}}
       To find the CockroachDB connection string, open the **Connect** dialog in the {{ site.data.products.cloud }} Console and select the `world` database and the **General connection string** option.
       {{site.data.alerts.end}}

       {% include_cached copy-clipboard.html %}
       ~~~ shell
       ./molt verify --source 'jdbc:mysql://{user}:{password}@tcp({host}:{port})/world' --target 'postgresql://{user}:{password}@{host}:{port}/world?sslmode=verify-full'
       ~~~

       You will see the initial output:

       ~~~
       <nil> INF verification in progress
       ~~~

       The following warnings indicate that the MySQL and CockroachDB columns have different types. This is an expected result, since some columns were [changed to `ENUM` types](#enum-type) when you [converted the schema](#step-1-convert-the-mysql-schema):

       ~~~
       <nil> WRN mismatching table definition mismatch_info="column type mismatch on continent: text vs country_continent_enum" table_name=country table_schema=public
       <nil> WRN mismatching table definition mismatch_info="column type mismatch on isofficial: text vs countrylanguage_isofficial_enum" table_name=countrylanguage table_schema=public
       ~~~

       The following output indicates that MOLT Verify has completed verification:

       ~~~
       <nil> INF finished row verification on public.country (shard 1/1): truth rows seen: 239, success: 239, missing: 0, mismatch: 0, extraneous: 0, live_retry: 0
       <nil> INF finished row verification on public.countrylanguage (shard 1/1): truth rows seen: 984, success: 984, missing: 0, mismatch: 0, extraneous: 0, live_retry: 0
       <nil> INF finished row verification on public.city (shard 1/1): truth rows seen: 4079, success: 4079, missing: 0, mismatch: 0, extraneous: 0, live_retry: 0
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
- [Migrate from PostgreSQL]({% link {{ page.version.version }}/migrate-from-postgres.md %})
- [Can a PostgreSQL or MySQL application be migrated to CockroachDB?]({% link {{ page.version.version }}/frequently-asked-questions.md %}#can-a-postgresql-or-mysql-application-be-migrated-to-cockroachdb)
