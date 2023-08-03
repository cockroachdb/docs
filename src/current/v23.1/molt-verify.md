---
title: Use the MOLT Verify tool
summary: Learn how to use the MOLT Verify tool to check for post-migration data discrepancies.
toc: true
docs_area: migrate
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

MOLT Verify checks for data discrepancies between a source and a target database during a [database migration](migration-overview.html).

The tool performs the following verifications to ensure data integrity during a migration:

- **Table Verification:** Check that the structure of tables between the source database and the target database are the same.
- **Column Definition Verification:** Check that the column names, data types, constraints, nullability, and other attributes between the source database and the target database are the same. 
- **Row Value Verification:** Check that the actual data in the tables is the same between the source database and the target database.

For a demo of MOLT Verify, watch the following video:

{% include_cached youtube.html video_id="6mfebmCLClY" %}

## Supported databases

The following databases are currently supported:

- PostgreSQL
- MySQL
- CockroachDB

## Use the MOLT Verify tool

1. [Download the binary](https://github.com/cockroachdb/molt/releases/) that matches your system:
  - For Mac: `molt.darwin.amd64` for Intel or `molt.darwin.arm64` for ARM
  - For Windows: `molt.amd64.exe`
  - For Linux: `molt.linux.amd64`
   
    Rename the binary to `molt` and add it to your `PATH` so you can execute the `molt verify` command from any shell.

1. Get the connection strings for the source and target databases you want to compare.
1. Make sure the SQL user running MOLT Verify has read privileges on the necessary tables.
1. Run MOLT Verify: 

    The `molt verify` command takes two or more SQL connection strings as arguments. 
    
    Examples:

    The following example compares a PostgreSQL database with a CockroachDB database. 
    
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ./molt verify \
      --source 'postgres://{username}:{password}@url:{port}/{database}' \
      --target 'postgresql://{username}:{password}@{host}:{port}/{database}?sslmode=verify-full'
    ~~~

    The following example compares a MySQL database with a CockroachDB database (simplified naming for both instances):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ./molt verify \
      --source 'jdbc:mysql://root@tcp({host}:{port})/{database}' \
      --target 'postgresql://{username}:{password}@{host}:{port}/{database}?sslmode=verify-full'
    ~~~

    You can use optional [supported flags](#supported-flags) to customize the verification results.

1. Review the verification results:

    Running the MOLT Verify tool will show if there are any missing rows or extraneous tables in the target database. If any data is missing, you can [add the missing data](insert.html) to the target database and run `./molt verify` again.

    {{site.data.alerts.callout_info}} 
    Be aware of data type differences. For example, if your source MySQL table uses an auto-incrementing ID, MOLT Verify will identify a difference in the table definitions when comparing with CockroachDB's [`UUID`](uuid.html) type. In such cases, you might have to perform extra steps, such as [creating composite types](create-type.html#create-a-composite-data-type) within the target database that use the auto-incrementing ID and other types to maintain referential integrity.
    {{site.data.alerts.end}}

## Supported flags

Flag | Description
----------|------------
`--source` | (Required) Connection string for the source database.
`--target` | (Required) Connection string for the target database.
`--concurrency` | Number of shards to process at a time. <br />**Default:** `16` <br />For faster verification, set this flag to a higher value. <br />Note: Table splitting by shard only works for [`INT`](int.html), [`UUID`](uuid.html), and `FLOAT` data types.
`--table_splits` | Number of shards to split the table into. <br />**Default:** `16`
`--row_batch_size` | Number of rows to get from a table at a time. <br />**Default:** `20000`
{% comment %}
`--continuous` | Verify tables in a continuous loop. <br />**Default:** `false`
`--table-filter` | tk
`--schema-filter` | tk
`--live` | tk. <br />**Default:** `false`
{% endcomment %}

## Limitations

- While verifying data, MOLT Verify pages 20,000 rows at a time by default, and row values can change in between, which can lead to temporary inconsistencies in data. You can change the row batch size using the `--row_batch_size int` [flag](#supported-flags).
- MySQL enums and set types are not supported.
- When a `STRING` is used as a [primary key](primary-key.html), MOLT Verify may generate additional warnings due to differences in how CockroachDB and other databases handle case sensitivity in strings.
- MOLT Verify only supports comparing one MySQL database to a whole CockroachDB schema (which is assumed to be "public").
- MOLT Verify might give an error in case of schema changes on either the source or target database.
- Geospatial types cannot yet be compared.

## See also

- [Migrate Your Database to CockroachDB](migration-overview.html)
