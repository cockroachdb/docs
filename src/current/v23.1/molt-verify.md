---
title: Use the MOLT Verify tool
summary: Learn how to use the MOLT Verify tool to check for post-migration data discrepancies.
toc: true
docs_area: migrate
---

The MOLT Verify tool checks for data discrepancies between a source and a target database during a [database migration](migration-overview.html).

The tool performs the following verifications to ensure post-migration data integrity:

- **Table Verification:** Check that the structure of tables between the source database and the target database are the same.
- **Column Definition Verification:** Check that the column names, data types, constraints, nullability, and other attributes between the source database and the target database are the same. 
- **Row Value Verification:** Check that the actual data in the tables are the same between the source database and the target database.

## Supported databases

The following databases are currently supported:

- PostgreSQL
- MySQL

## Use the MOLT Verify tool

1. Get the JDBC connection strings for the source and target databases you want to compare.
2. Make sure the SQL user running MOLT Verify has access to the necessary tables.
3. Install and build the tool: 

    Run the following commands on your local machine:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    git clone https://github.com/cockroachdb/molt.git
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd molt
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    go build .
    ~~~
    
    To cross-compile, use:
    
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    GOOS=linux GOARCH=amd64 go build -v .
    ~~~ 
    
    Run the following command to verify the installation:
	  
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ./molt verify --help
    ~~~

4. Run MOLT Verify: 

    The `molt verify` command takes two or more JDBC connection strings as arguments. You can append a name for easier readability using `<name>===` in front of the JDBC string. The first argument is considered as the "source of truth". 
    
    Examples:

    The following example compares a PostgreSQL database with a CockroachDB database (simplified naming for both instances):
    
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ./molt verify \
      'pg_truth===postgres://<username>:<password>@url:<port>/<database>' \
      'crdb_compare===postgresql://<username>:<password>@<host>:<port>/<database>?sslmode=verify-full'
    ~~~

    The following example compares a MySQL database with a CockroachDB database (simplified naming for both instances):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ./molt verify \
      'mysql===jdbc:mysql://root@tcp(<host>:<port>)/<database>' \         
      'postgresql://<username>:<password>@<host>:<port>/<database>?sslmode=verify-full'
    ~~~

    Optionally, you can use [supported flags](#supported-flags) to customize the verification results.

5. Review the verification results:

    Running the MOLT Verify tool will show if there are any missing rows or extraneous tables in the target database. If any data is missing, you can add the missing data to the target database and run `./molt verify` again.

    {{site.data.alerts.callout_info}} 
    Be aware of data type differences. For example, if your source MySQL table uses an auto-incrementing ID, MOLT will identify a difference in the table definitions when comparing with CockroachDB's UUID type. In such cases, you might have to perform extra steps such as creating composite types within the target database that use the auto-incrementing ID and other types to maintain referential integrity.
    {{site.data.alerts.end}}

## Supported flags

Flag | Description
----------|------------
--concurrency int | Number of shards to process at a time. <br>Default value: 16 <br>For faster verification, set this flag to a higher value. <br>Note: Table splitting by shard only works for `int`, `uuid`, and `float` data types.
--table_splits int | Number of shards to split the table into. <br>Default value: 16
--row_batch_size int | Number of rows to get from a table at a time. <br>Default value: 20000

## Limitations

- While verifying data, the tool pages 20,000 rows at a time by default, and row values can change in between, which can lead to temporary inconsistencies in data. You can change the row batch size using the `--row_batch_size int` [flag](#supported-flags).
- MySQL enums and set types are not supported.
- The tool only supports comparing one MySQL database vs a whole CockroachDB schema (which is assumed to be "public").
- The tool does not handle schema changes between commands well.
- Geospatial types cannot yet be compared.


