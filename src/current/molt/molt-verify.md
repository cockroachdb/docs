---
title: MOLT Verify
summary: Learn how to use the MOLT Verify tool to check for data discrepancies during and after a migration.
toc: true
docs_area: migrate
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

MOLT Verify checks for data discrepancies between a source database and CockroachDB during a [database migration]({% link molt/migration-overview.md %}).

The tool performs the following verifications to ensure data integrity during a migration:

- **Table Verification:** Check that the structure of tables between the source database and the target database are the same.
- **Column Definition Verification:** Check that the column names, data types, constraints, nullability, and other attributes between the source database and the target database are the same. 
- **Row Value Verification:** Check that the actual data in the tables is the same between the source database and the target database.

For a demo of MOLT Verify, watch the following video:

{% include_cached youtube.html video_id="6mfebmCLClY" %}

## Supported databases

The following source databases are currently supported:

- PostgreSQL 12-16
- MySQL 5.7, 8.0 and later
- Oracle Database 19c (Enterprise Edition) and 21c (Express Edition)

## Installation

{% include molt/molt-install.md %}

## Setup

Complete the following items before using MOLT Verify:

- The SQL user running MOLT Verify must have the [`SELECT` privilege]({% link {{site.current_cloud_version}}/grant.md %}#supported-privileges) on both the source and target CockroachDB tables.

- Percent-encode the connection strings for the source database and [CockroachDB]({% link {{site.current_cloud_version}}/connect-to-the-database.md %}). This ensures that the MOLT tools can parse special characters in your password.

  - Given a password `a$52&`, pass it to the `molt escape-password` command with single quotes:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        molt escape-password --password 'a$52&'
        ~~~

        ~~~
        Substitute the following encoded password in your original connection url string:
        a%2452%26
        ~~~

  - Use the encoded password in your connection string. For example:

        ~~~
        postgres://postgres:a%2452%26@localhost:5432/molt
        ~~~

## Flags

Flag | Description
----------|------------
`--source` | (Required) Connection string for the source database.
`--target` | (Required) Connection string for the target database.
`--concurrency` | Number of threads to process at a time when reading the tables. <br>**Default:** 16 <br>For faster verification, set this flag to a higher value. {% comment %}<br>Note: Table splitting by shard only works for [`INT`]({% link {{site.current_cloud_version}}/int.md %}), [`UUID`]({% link {{site.current_cloud_version}}/uuid.md %}), and [`FLOAT`]({% link {{site.current_cloud_version}}/float.md %}) data types.{% endcomment %}
`--log-file` | Write messages to the specified log filename. If no filename is provided, messages write to `verify-{datetime}.log`. If `"stdout"` is provided, messages write to `stdout`.
`--metrics-listen-addr` | Address of the metrics endpoint, which has the path `{address}/metrics`.<br><br>**Default:** `'127.0.0.1:3030'`                                                                                                                                                                                                                                                                                                                                                                                 |
`--row-batch-size` | Number of rows to get from a table at a time. <br>**Default:** 20000
`--schema-filter` | Verify schemas that match a specified [regular expression](https://wikipedia.org/wiki/Regular_expression).<br><br>**Default:** `'.*'`
`--table-filter` | Verify tables that match a specified [regular expression](https://wikipedia.org/wiki/Regular_expression).<br><br>**Default:** `'.*'`

## Usage

`molt verify` takes two SQL connection strings as `--source` and `--target` arguments.

To compare a PostgreSQL database with a CockroachDB database:

{% include_cached copy-clipboard.html %}
~~~ shell
molt verify \
  --source 'postgresql://{username}:{password}@{host}:{port}/{database}' \
  --target 'postgresql://{username}:{password}@{host}:{port}/{database}?sslmode=verify-full'
~~~

To compare a MySQL database with a CockroachDB database:

{% include_cached copy-clipboard.html %}
~~~ shell
molt verify \
  --source 'mysql://{username}:{password}@{protocol}({host}:{port})/{database}' \
  --target 'postgresql://{username}:{password}@{host}:{port}/{database}?sslmode=verify-full'
~~~

Use the optional [flags](#flags) to customize the verification results.

When verification completes, the output displays a summary message like the following:

~~~ json
{"level":"info","type":"summary","table_schema":"public","table_name":"common_table","num_truth_rows":6,"num_success":3,"num_conditional_success":0,"num_missing":2,"num_mismatch":1,"num_extraneous":2,"num_live_retry":0,"num_column_mismatch":0,"message":"finished row verification on public.common_table (shard 1/1)"}
~~~

- `num_missing` is the number of rows that are missing on the target database. You can [add any missing data]({% link {{site.current_cloud_version}}/insert.md %}) to the target database and run `molt verify` again.
- `num_mismatch` is the number of rows with mismatched values on the target database.
- `num_extraneous` is the number of extraneous tables on the target database.
- `num_column_mismatch` is the number of columns with mismatched types on the target database, preventing `molt verify` from comparing the column's rows. For example, if your source table uses an auto-incrementing ID, MOLT Verify will identify a mismatch with CockroachDB's [`UUID`]({% link {{site.current_cloud_version}}/uuid.md %}) type. In such cases, you might fix the mismatch by [creating a composite type]({% link {{site.current_cloud_version}}/create-type.md %}#create-a-composite-data-type) on CockroachDB that uses the auto-incrementing ID.
- `num_success` is the number of rows that matched.
- `num_conditional_success` is the number of rows that matched while having a column mismatch due to a type difference. This value indicates that all other columns that could be compared have matched successfully. You should manually review the warnings and errors in the output to determine whether the column mismatches can be ignored.

## Docker usage

{% include molt/molt-docker.md %}

## Known limitations

- MOLT Verify compares 20,000 rows at a time by default, and row values can change between batches, potentially resulting in temporary inconsistencies in data. To configure the row batch size, use the `--row_batch_size` [flag](#flags).
- MOLT Verify checks for collation mismatches on [primary key]({% link {{site.current_cloud_version}}/primary-key.md %}) columns. This may cause validation to fail when a [`STRING`]({% link {{site.current_cloud_version}}/string.md %}) is used as a primary key and the source and target databases are using different [collations]({% link {{site.current_cloud_version}}/collate.md %}).
- MOLT Verify might give an error in case of schema changes on either the source or target database.
- [Geospatial types]({% link {{site.current_cloud_version}}/spatial-data-overview.md %}#spatial-objects) cannot yet be compared.

The following limitation is specific to MySQL:

- MOLT Verify only supports comparing one MySQL database to a whole CockroachDB schema (which is assumed to be `public`).

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})