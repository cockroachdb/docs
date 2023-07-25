---
title: Use the MOLT Verify tool
summary: Learn how to use the MOLT Verify tool to check for post-migration data discrepancies.
toc: true
docs_area: migrate
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

The MOLT Verify tool checks for data discrepancies between a source and a target database during a [database migration](migration-overview.html).

The tool performs the following verifications to ensure data integrity during a migration:

- **Table Verification:** Check that the structure of tables between the source database and the target database are the same.
- **Column Definition Verification:** Check that the column names, data types, constraints, nullability, and other attributes between the source database and the target database are the same. 
- **Row Value Verification:** Check that the actual data in the tables is the same between the source database and the target database.

For a demo of the MOLT Verify tool, watch the following video:

{% include_cached youtube.html video_id="6mfebmCLClY" %}

## Supported databases

The following databases are currently supported:

- PostgreSQL
- MySQL
- CockroachDB

## Use the MOLT Verify tool

1. Get the JDBC connection strings for the source and target databases you want to compare.
1. Make sure the SQL user running MOLT Verify has read privileges on the necessary tables.
1. From the [Releases](https://github.com/cockroachdb/molt/releases/) page, download the binary that matches your system:
  - For Mac: molt.darwin.*, arm64 for M1/M2s, amd64 otherwise
  - For windows: .exe
  - For Linux: molt.linux.amd64
   
    Optionally, add the binary to your `PATH` so you can execute the `molt verify` command from any shell.
1. Run MOLT Verify: 

    The `molt verify` command takes two or more JDBC connection strings as arguments. You can append a name for easier readability using `<name>===` in front of the JDBC string. The first argument is considered the "source of truth". 
    
    Examples:

    The following example compares a PostgreSQL database with a CockroachDB database:
    
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

1. Review the verification results:

    Running the MOLT Verify tool will show if there are any missing rows or extraneous tables in the target database. If any data is missing, you can [add the missing data](insert.html) to the target database and run `./molt verify` again.

    {{site.data.alerts.callout_info}} 
    Be aware of data type differences. For example, if your source MySQL table uses an auto-incrementing ID, MOLT will identify a difference in the table definitions when comparing with CockroachDB's UUID type. In such cases, you might have to perform extra steps, such as [creating composite types](create-type.html#create-a-composite-data-type) within the target database that use the auto-incrementing ID and other types to maintain referential integrity.
    {{site.data.alerts.end}}

## Supported flags

Flag | Description
----------|------------
`--concurrency int` | Number of shards to process at a time. <br>Default value: 16 <br>For faster verification, set this flag to a higher value. <br>Note: Table splitting by shard only works for `int`, `uuid`, and `float` data types.
`--table_splits int` | Number of shards to split the table into. <br>Default value: 16
`--row_batch_size int` | Number of rows to get from a table at a time. <br>Default value: 20000

## Limitations

- While verifying data, the tool pages 20,000 rows at a time by default, and row values can change in between, which can lead to temporary inconsistencies in data. You can change the row batch size using the `--row_batch_size int` [flag](#supported-flags).
- MySQL enums and set types are not supported.
- The tool only supports comparing one MySQL database to a whole CockroachDB schema (which is assumed to be "public").
- The tool might give an error in case of schema changes on either the source or target database.
- Geospatial types cannot yet be compared.

## See also

- [Migration Overview](migration-overview.html)
