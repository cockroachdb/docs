---
title: IMPORT INTO
summary: Import CSV, Avro, or delimited data into an existing CockroachDB table.
toc: true
docs_area: reference.sql
---

The `IMPORT INTO` [statement]({% link {{ page.version.version }}/sql-statements.md %}) imports CSV, Avro, or delimited data into an existing table by appending new rows to the table.

## Considerations

- `IMPORT INTO` takes the table **offline** before importing the data. The table will be online again once the [job](#view-and-control-import-jobs) has completed successfully.
- `IMPORT INTO` works with existing tables. To import data into a new table, see [Import into a new table from a CSV file](#import-into-a-new-table-from-a-csv-file).
- `IMPORT INTO` cannot be used during a [rolling upgrade]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}).
- `IMPORT INTO` is a blocking statement. To run an `IMPORT INTO` job asynchronously, use the [`DETACHED`](#options-detached) option.
- `IMPORT INTO` invalidates all [foreign keys]({% link {{ page.version.version }}/foreign-key.md %}) on the target table. To validate the foreign key(s), use the [`ALTER TABLE ... VALIDATE CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#validate-constraint) statement.
- `IMPORT INTO` is an insert-only statement; it cannot be used to [update]({% link {{ page.version.version }}/update.md %}) existing rows. Imported rows cannot conflict with primary keys in the existing table, or any other [`UNIQUE`]({% link {{ page.version.version }}/unique.md %}) constraint on the table.
- `IMPORT INTO` does not offer `SELECT` or `WHERE` clauses to specify subsets of rows. To add a subset of rows to a table, use [`INSERT`]({% link {{ page.version.version }}/insert.md %}#insert-from-a-select-statement).
- `IMPORT INTO` will cause any [changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}) running on the targeted table to fail.
- `IMPORT INTO` supports importing into [`REGIONAL BY ROW`]({% link {{ page.version.version }}/alter-table.md %}#regional-by-row) tables.
- At the beginning of an `IMPORT INTO` job, CockroachDB calculates and stores all [user-defined types]({% link {{ page.version.version }}/enum.md %}) referenced by the table being imported into, including the [`crdb_internal_region` type descriptor]({% link {{ page.version.version }}/alter-table.md %}#crdb_region) used in [multi-region clusters]({% link {{ page.version.version }}/multiregion-overview.md %}). At the end of the job, CockroachDB checks if any user-defined types have been modified. If so, the `IMPORT INTO` job fails. Do not make modifications to your multi-region configuration or create or alter multi-region tables while running `IMPORT INTO` jobs.

{{site.data.alerts.callout_success}}
Optimize import operations in your applications by following our [Import Performance Best Practices]({% link {{ page.version.version }}/import-performance-best-practices.md %}).
{{site.data.alerts.end}}

## Before you begin

Before using `IMPORT INTO`, you should have:

- An existing CockroachDB table to import into. `IMPORT INTO` supports [computed columns]({% link {{ page.version.version }}/computed-columns.md %}) and certain [`DEFAULT` expressions](#supported-default-expressions).

- Sufficient capacity in the [CockroachDB store](#available-storage) for the imported data.

- The CSV or Avro data you want to import, preferably hosted on cloud storage. The [import file location](#import-file-location) must be equally accessible to all nodes using the same import file location. This is necessary because the `IMPORT INTO` statement is issued once by the client, but is executed concurrently across all nodes of the cluster.

### Supported `DEFAULT` expressions

`IMPORT INTO` supports the following [`DEFAULT`]({% link {{ page.version.version }}/default-value.md %}) expressions:

- `DEFAULT` expressions with [user-defined types]({% link {{ page.version.version }}/enum.md %}).

- Constant `DEFAULT` expressions, which are expressions that return the same value in different statements. Examples include:

    - Literals (booleans, strings, integers, decimals, dates).
    - Functions where each argument is a constant expression and the functions themselves depend solely on their arguments (e.g., arithmetic operations, boolean logical operations, string operations).

- `random()`
- `gen_random_uuid()`
- `unique_rowid()`
- `nextval()`

- Current [`TIMESTAMP`]({% link {{ page.version.version }}/timestamp.md %}) functions that record the transaction timestamp, which include:

    - `current_date()`
    - `current_timestamp()`
    - `localtimestamp()`
    - `now()`
    - `statement_timestamp()`
    - `timeofday()`
    - `transaction_timestamp()`

### Available storage

Each node in the cluster is assigned an equal part of the imported data, and so must have enough temp space to store it. In addition, data is persisted as a normal table, and so there must also be enough space to hold the final, replicated data. The node's first-listed/default [`store`]({% link {{ page.version.version }}/cockroach-start.md %}#store) directory must have enough available storage to hold its portion of the data.

On [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}), if you set `--max-disk-temp-storage`, it must also be greater than the portion of the data a node will store in temp space.

### Import file location

CockroachDB uses the URL provided to construct a secure API call to the service you specify. The URL structure depends on the type of file storage you are using. For more information, see the following:

- [Use Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %})
- [Use a Local File Server]({% link {{ page.version.version }}/use-a-local-file-server.md %})

{% include {{ page.version.version }}/misc/external-connection-note.md %}

## Required privileges

### Table privileges

The user must have the `INSERT` and `DROP` [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the specified table. (`DROP` is required because the table is taken offline during the `IMPORT INTO`.)

### Source privileges

{% include {{ page.version.version }}/misc/external-io-privilege.md %}

Either the `EXTERNALIOIMPLICITACCESS` [system-level privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) or the [`admin`]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) role is required for the following scenarios:

- Interacting with a cloud storage resource using [`IMPLICIT` authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}).
- Using a [custom endpoint](https://docs.aws.amazon.com/sdk-for-go/api/aws/endpoints/) on S3.
- Using the [`cockroach nodelocal upload`]({% link {{ page.version.version }}/cockroach-nodelocal-upload.md %}) command.
- Using [HTTP]({% link {{ page.version.version }}/use-a-local-file-server.md %}) or HTTPS.

No special privilege is required for: 

- Interacting with an Amazon S3 and Google Cloud Storage resource using `SPECIFIED` credentials. Azure Storage is always `SPECIFIED` by default.
- Using [`userfile`]({% link {{ page.version.version }}/use-userfile-storage.md %}) storage.

{% include {{ page.version.version }}/misc/bulk-permission-note.md %}

{% include {{ page.version.version }}/misc/s3-compatible-warning.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/import_into.html %}
</div>

{{site.data.alerts.callout_info}}
While importing into an existing table, the table is taken offline.
{{site.data.alerts.end}}

## Parameters

Parameter | Description
----------|------------
`table_name` | The name of the table you want to import into.
`column_name` | The table columns you want to import.<br><br>**Note:** Currently, target columns are not enforced.
`file_location` | The [URL](#import-file-location) of a CSV or Avro file containing the table data. This can be a comma-separated list of URLs. For an example, see [Import into an existing table from multiple CSV files](#import-into-an-existing-table-from-multiple-csv-files) below.
`<option> [= <value>]` | Control your import's behavior with [import options](#import-options).

#### Delimited data files

The `DELIMITED DATA` format can be used to import delimited data from any text file type, while ignoring characters that need to be escaped, like the following:

- The file's delimiter (`\t` by default).
- Double quotes (`"`).
- Newline (`\n`).
- Carriage return (`\r`).

For examples showing how to use the `DELIMITED DATA` format, see the [Examples](#import-into-an-existing-table-from-a-delimited-data-file) section below.

### Import options

You can control the `IMPORT` process's behavior using any of the following key-value pairs as a `<option>  [= <value>]`.

|                    Key                    |         <div style="width:130px">Context</div>         |                                                                                                                                                                                                                                                                                                                                                                                    Value                                                                                                                                                                                                                                                                                                                                                                                    |
|-------------------------------------------|--------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `allow_quoted_null`                       | `CSV DATA`                                             | If included with `nullif`, both quoted and unquoted CSV input values can match the `nullif` setting.<br><br> Example: To interpret both empty columns and `""` as `NULL`: `IMPORT INTO ... CSV DATA ('file.csv') WITH nullif = '', allow_quoted_null;`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `comment`                                 | `CSV DATA`                                             | The unicode character that identifies rows to skip. <br><br> Example: `IMPORT INTO ... CSV DATA ('file.csv') WITH comment = '#';`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `data_as_binary_records`                  | `AVRO DATA`                                            | Use when [importing a binary file containing Avro records]({% link {{ page.version.version }}/migrate-from-avro.md %}#import-binary-or-json-records).  The schema is not included in the file, so you need to specify the schema with either the `schema` or `schema_uri` option. <br><br> Example: `IMPORT INTO ... AVRO DATA ('file.bjson') WITH data_as_binary_records, schema_uri='..';`                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `data_as_json_records`                    | `AVRO DATA`                                            | Use when [importing a JSON file containing Avro records]({% link {{ page.version.version }}/migrate-from-avro.md %}#import-binary-or-json-records). The schema is not included in the file, so you need to specify the schema with either the `schema` or `schema_uri` option. <br><br> Example: `IMPORT INTO ... AVRO DATA ('file.bjson') WITH data_as_json_records, schema='{ "type": "record",..}';`                                                                                                                                                                                                                                                                                                                                                                                                         |
| `decompress`                              | General                                                | The decompression codec to be used: `gzip`, `bzip`, `auto`, or `none`.  **Default: `'auto'`**, which guesses based on file extension (`.gz`, `.bz`, `.bz2`). `none` disables decompression. <br><br> Example: `IMPORT INTO ... WITH decompress = 'bzip';`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `delimiter`                               | `CSV DATA`                                             | The unicode character that delimits columns in your rows. **Default: `,`**. <br><br> Example: To use tab-delimited values: `IMPORT INTO ... CSV DATA ('file.csv') WITH delimiter = e'\t';`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| <a name="options-detached"></a>`DETACHED` | N/A                                                    | When an import runs in `DETACHED` mode, it will execute asynchronously and the job ID will be returned immediately without waiting for the job to finish. Note that with `DETACHED` specified, further job information and the job completion status will not be returned. To check on the job status, use the [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %}) statement. <br><br>To run an import within a [transaction]({% link {{ page.version.version }}/transactions.md %}), use the `DETACHED` option.                                                                                                                                                                                                                                                                                                                      |
| `fields_enclosed_by`                      | [`DELIMITED DATA`](#delimited-data-files)              | The unicode character that encloses fields. **Default:** `"` <br><br> Example: `IMPORT INTO ... WITH fields_enclosed_by='"';`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `fields_escaped_by`                       | [`DELIMITED DATA`](#delimited-data-files)              | The unicode character, when preceding one of the above `DELIMITED DATA` options, to be interpreted literally. <br><br> Example: `IMPORT INTO ... WITH fields_escaped_by='\';`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `fields_terminated_by`                    | [`DELIMITED DATA`](#delimited-data-files)              | The unicode character used to separate fields in each input line. **Default:** `\t` <br><br> Example: `IMPORT INTO ... WITH fields_terminated_by='.';`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `nullif`                                  | `CSV DATA`, [`DELIMITED DATA`](#delimited-data-files)  | Use `nullif` to specify a column value that should be interpreted as `NULL`.<br><br>Example: To interpret an empty column as `NULL`: `IMPORT INTO ... CSV DATA ('file.csv') WITH nullif = '';`<br><br>Example: To interpret `value` as `NULL`: `IMPORT INTO ... CSV DATA ('file.csv') WITH nullif = 'value';`<br><br>**Note:** When importing CSV files, `nullif` matches column values that are unquoted. Any CSV input value that is enclosed in double quotes, including an empty value, is interpreted as a string. To match both quoted and unquoted CSV input values to the `nullif` setting, include the `allow_quoted_null` option.<br><br>When importing from CSV without `nullif`, empty values are interpreted as `NULL` by default, unless enclosed in double quotes. When importing `DELIMITED DATA` files without `nullif`, empty values are interpreted as empty strings by default.</li></ul> |
| `records_terminated_by`                   | `AVRO DATA`                                            | The unicode character to indicate new lines in the input binary or JSON file. This is not needed for Avro OCF. **Default:** `\n` <br><br> Example: To use tab-terminated records: `IMPORT INTO ... AVRO DATA ('file.csv') WITH records_terminated_by = e'\t';`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `row_limit`                               | General                                                | The number of rows to import. Useful for doing a test run of an import and finding errors quickly. This option will import the first *n* rows from each table in the dump file.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `rows_terminated_by`                      | [`DELIMITED DATA`](#delimited-data-files)              | The unicode character to indicate new lines in the input file. **Default:** `\n` <br><br> Example: `IMPORT INTO ... WITH rows_terminated_by='\m';`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `schema`                                  | `AVRO DATA`                                            | The schema of the Avro records included in the binary or JSON file. This is not needed for Avro OCF. <br> See `data_as_json_records` example above.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `schema_uri`                              | `AVRO DATA`                                            | The URI of the file containing the schema of the Avro records include in the binary or JSON file. This is not needed for Avro OCF. <br> See `data_as_binary_records` example above.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `skip`                                    | `CSV DATA `, [`DELIMITED DATA`](#delimited-data-files) | The number of rows to be skipped while importing a file. **Default: `'0'`**. <br><br> Example: To import CSV files with column headers: `IMPORT INTO ... CSV DATA ('file.csv') WITH skip = '1';`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `strict_validation`                       | `AVRO DATA`                                            | Rejects Avro records that do not have a one-to-one mapping between Avro fields to the target CockroachDB schema. By default, CockroachDB ignores unknown Avro fields and sets missing SQL fields to `NULL`. CockroachDB will also attempt to convert the Avro field to the CockroachDB [data type][datatypes]; otherwise, it will report an error. <br><br> Example: `IMPORT INTO ... AVRO DATA ('file.avro') WITH strict_validation;`                                                                                                                                                                                                                                                                                                                                      |

For examples showing how to use these options, see the [Examples section]({% link {{ page.version.version }}/import-into.md %}#examples).

For instructions and working examples showing how to migrate data from other databases and formats, see the [Migration Overview]({% link molt/migration-overview.md %}).

## View and control import jobs

After CockroachDB successfully initiates an import into an existing table, it registers the import as a job, which you can view with [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %}).

After the import has been initiated, you can control it with [`PAUSE JOB`]({% link {{ page.version.version }}/pause-job.md %}), [`RESUME JOB`]({% link {{ page.version.version }}/resume-job.md %}), and [`CANCEL JOB`]({% link {{ page.version.version }}/cancel-job.md %}).

If initiated correctly, the statement returns when the import is finished or if it encounters an error. In some cases, the import can continue after an error has been returned (the error message will tell you that the import has resumed in background).

{{site.data.alerts.callout_danger}}
Pausing and then resuming an `IMPORT INTO` job will cause it to restart from the beginning.
{{site.data.alerts.end}}

## Examples

{% include {{ page.version.version }}/import-export-auth.md %}

### Import into a new table from a CSV file

To import into a new table, use [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %}) followed by `IMPORT INTO`.

1. Create the new table with the necessary columns and data types:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    CREATE TABLE users (
            id UUID PRIMARY KEY,
            city STRING,
            name STRING,
            address STRING,
            credit_card STRING
          );
    ~~~

1. Use `IMPORT INTO` to import the data into the new table:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    IMPORT INTO users (id, city, name, address, credit_card)
        CSV DATA (
          's3://{BUCKET NAME}/{customers.csv}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
        );
    ~~~

### Import into an existing table from a CSV file

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      's3://{BUCKET NAME}/{customers.csv}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
    );
~~~

{{site.data.alerts.callout_info}}
The column order in your `IMPORT` statement must match the column order in the CSV being imported, regardless of the order in the existing table's schema.
{{site.data.alerts.end}}

### Import into an existing table from multiple CSV files

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      's3://{BUCKET NAME}/{customers.csv}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}',
      's3://{BUCKET NAME}/{customers2.csv}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}',
      's3://{BUCKET NAME}/{customers3.csv}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}',
      's3://{BUCKET NAME}/{customers4.csv}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}',
    );
~~~

### Import into an existing table using a wildcard

You can specify [file patterns to match](https://golang.org/pkg/path/filepath/#Match) instead of explicitly listing every file. Paths are matched using the `*` wildcard character to include matching files directly under the specified path. Use a wildcard to include:

- All files in a given directory (e.g.,`s3://bucket-name/path/to/data/*`).
- All files in a given directory that end with a given string (e.g., `s3://bucket-name/files/*.csv`).
- All files in a given directory that start with a given string (e.g., `s3://bucket-name/files/data*`).
- All files in a given directory that start and end with a given string (e.g., `s3://bucket-name/files/data*.csv`).

These only match files directly under the specified path and do not descend into additional directories recursively.

{% include_cached copy-clipboard.html %}
~~~ sql
IMPORT INTO users (id, city, name, address, credit_card)
  CSV DATA (
    's3://{BUCKET NAME}/*.csv?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
  );
~~~

### Import into an existing table from an Avro file

 [Avro OCF data]({% link {{ page.version.version }}/migrate-from-avro.md %}#import-an-object-container-file), [JSON records, or binary records]({% link {{ page.version.version }}/migrate-from-avro.md %}#import-binary-or-json-records) can be imported. The following are examples of importing Avro OCF data.

To specify the table schema in-line:

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers
    AVRO DATA (
      's3://{BUCKET NAME}/{customers.avro}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
    );
~~~

For more information about importing data from Avro, including examples, see [Migrate from Avro]({% link {{ page.version.version }}/migrate-from-avro.md %}).

### Import into an existing table from a delimited data file

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers
    DELIMITED DATA (
      's3://{BUCKET NAME}/{customers.csv}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
    )
    WITH
      fields_terminated_by='|',
      fields_enclosed_by='"',
      fields_escaped_by='\';
~~~

## Known limitations

{% include {{ page.version.version }}/known-limitations/import-into-limitations.md %}

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Use Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %})
- [Import Performance Best Practices]({% link {{ page.version.version }}/import-performance-best-practices.md %})
