---
title: Migrate from Oracle
summary: Learn how to migrate data from Oracle into a CockroachDB cluster.
toc: true
build_for: [standard, managed]
---

<span class="version-tag">New in v19.2:</span> This page has instructions for migrating data from Oracle into CockroachDB by [importing](import.html) CSV files. Note that `IMPORT` only works for creating new tables.

The examples below use:

- [Swingbench OrderEntry data set](http://www.dominicgiles.com/swingbench.html), which is based on the `oe` schema that ships with Oracle Database 11g and Oracle Database 12c.
- [Oracle Data Pump](https://docs.oracle.com/en/database/oracle/oracle-database/12.2/sutil/oracle-data-pump.html), which enables the movement of data and metadata from one database to another, and comes with all Oracle installations.

## Step 1. Export the schema

Using [Data Pump Export](https://docs.oracle.com/en/database/oracle/oracle-database/12.2/sutil/oracle-data-pump-export-utility.html), export the schema:

{% include copy-clipboard.html %}
~~~ shell
$ expdp user/password directory=datapump dumpfile=oracle_example.dmp content=metadata_only logfile=example.log
~~~

The schema is stored in an Oracle-specific format (e.g., `oracle_example.dmp`).

## Step 2. Convert the schema to SQL

Using [Data Pump Import](https://docs.oracle.com/en/database/oracle/oracle-database/12.2/sutil/datapump-import-utility.html), load the DMP file you exported in [Step 1](#step-1-export-the-schema) and convert it to a SQL file:

{% include copy-clipboard.html %}
~~~ shell
$ impdp user/password directory=datapump dumpfile=oracle_example.dmp sqlfile=example_sql.sql TRANSFORM=SEGMENT_ATTRIBUTES:N:table PARTITION_OPTIONS=MERGE
~~~

This SQL output will be used later.

## Step 3. Export data

You need to extract each table's data into a data list file (`.lst`). We wrote a simple SQL script(`spool.sql`) to do this:

~~~ shell
$ cat spool.sql

SET ECHO OFF
SET TERMOUT OFF
SET FEEDBACK OFF
SET PAGESIZE 0
SET TRIMSPOOL ON
SET WRAP OFF
set linesize 30000
SET RECSEP OFF
SET VERIFY OFF
SET ARRAYSIZE 10000
SET COLSEP '|'

SPOOL '&1'

ALTER SESSION SET nls_date_format = 'DD-MON-YYYY HH24:MI:SS';
  # Used to set a properly formatted date for CockroachDB

SELECT * from &1;

SPOOL OFF

SET PAGESIZE 24
SET FEEDBACK ON
SET TERMOUT ON
~~~

To extract the data, we ran the script for each table in SQL*Plus:

{% include copy-clipboard.html %}
~~~ sql
$ sqlplus user/password
~~~

{% include copy-clipboard.html %}
~~~ sql
> @spool CUSTOMERS
  @spool ADDRESSES
  @spool CARD_DETAILS
  @spool WAREHOUSES
  @spool ORDER_ITEMS
  @spool ORDERS
  @spool INVENTORIES
  @spool PRODUCT_INFORMATION
  @spool LOGON
  @spool PRODUCT_DESCRIPTIONS
  @spool ORDERENTRY_METADATA
~~~

A data list file (`.lst`) with leading and trailing spaces is created for each table.

Exit SQL*Plus:

{% include copy-clipboard.html %}
~~~ sql
> EXIT
~~~

## Step 4. Configure and convert the data to CSV

Each table's data list file needs to be converted to CSV and formatted for CockroachDB. We wrote a simple Python script (`fix-example.py`) to do this:

~~~ python
$ cat fix-example.py

import csv
import string
import sys

for lstfile in sys.argv[1:]:
  filename = lstfile.split(".")[0]

  with open(sys.argv[1]) as f:
    reader = csv.reader(f, delimiter="|")
    with open(filename+".csv", "w") as fo:
      writer = csv.writer(fo, delimiter="|")
      for rec in reader:
        writer.writerow(map(string.strip, rec))
~~~

{% include copy-clipboard.html %}
~~~ shell
$ python2 fix.py CUSTOMERS.lst ADDRESSES.lst CARD_DETAILS.lst WAREHOUSES.lst ORDER_ITEMS.lst ORDERS.lst INVENTORIES.lst PRODUCT_INFORMATION.lst LOGON.lst PRODUCT_DESCRIPTIONS.lst ORDERENTRY_METADATA.lst
~~~

Format the generated CSV files to meet the CockroachDB's [CSV requirements](#csv-requirements).

Compress the CSV files:

{% include copy-clipboard.html %}
~~~ shell
$ gzip CUSTOMERS.csv ADDRESSES.csv CARD_DETAILS.csv WAREHOUSES.csv ORDER_ITEMS.csv ORDERS.csv INVENTORIES.csv PRODUCT_INFORMATION.csv LOGON.csv PRODUCT_DESCRIPTIONS.csv ORDERENTRY_METADATA.csv
~~~

These compressed CSV files will be used to import your data into CockroachDB.

## CSV requirements

You will need to export one CSV file per table, with the following requirements:

- Files must be in [valid CSV format](https://tools.ietf.org/html/rfc4180), with the caveat that the delimiter must be a single character.  To use a character other than comma (such as a tab), set a custom delimiter using the [`delimiter` option](import.html#delimiter).
- Files must be UTF-8 encoded.
- If one of the following characters appears in a field, the field must be enclosed by double quotes:
    - delimiter (`,` by default)
    - double quote (`"`)
    - newline (`\n`)
    - carriage return (`\r`)
- If double quotes are used to enclose fields, then a double quote appearing inside a field must be escaped by preceding it with another double quote.  For example: `"aaa","b""bb","ccc"`
- If a column is of type [`BYTES`](bytes.html), it can either be a valid UTF-8 string or a [hex-encoded byte literal](sql-constants.html#hexadecimal-encoded-byte-array-literals) beginning with `\x`. For example, a field whose value should be the bytes `1`, `2` would be written as `\x0102`.

## Step 5. Host the files where the cluster can access them

Each node in the CockroachDB cluster needs to have access to the files being imported. There are several ways for the cluster to access the data; for a complete list of the types of storage [`IMPORT`](import.html) can pull from, see [Import File URLs](import.html#import-file-urls).

{{site.data.alerts.callout_success}}
We strongly recommend using cloud storage such as Amazon S3 or Google Cloud to host the data files you want to import.
{{site.data.alerts.end}}

## Step 6. Import the CSV

Using the SQL file created in [Step 2](#step-2-convert-the-schema-to-sql), write [`IMPORT TABLE`](import.html) statements that match the schemas of the table data you're importing.

For example, to import the data from `CUSTOMERS.csv.gz` into a `CUSTOMERS` table, issue the following statement in the CockroachDB SQL shell:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
        customer_id       DECIMAL
                          NOT NULL
                          PRIMARY KEY,
        cust_first_name   VARCHAR(40) NOT NULL,
        cust_last_name    VARCHAR(40) NOT NULL,
        nls_language      VARCHAR(3),
        nls_territory     VARCHAR(30),
        credit_limit      DECIMAL(9,2),
        cust_email        VARCHAR(100),
        account_mgr_id    DECIMAL,
        customer_since    DATE,
        customer_class    VARCHAR(40),
        suggestions       VARCHAR(40),
        dob               DATE,
        mailshot          VARCHAR(1),
        partner_mailshot  VARCHAR(1),
        preferred_address DECIMAL,
        preferred_card    DECIMAL,
        INDEX cust_email_ix (cust_email),
        INDEX cust_dob_ix (dob),
        INDEX cust_account_manager_ix (
            account_mgr_id
        )
       )
   CSV DATA (
        'https://cr-test.s3.us-east-2.amazonaws.com/CUSTOMERS.csv.gz'
       )
  WITH delimiter = '|',
       "nullif" = '',
       decompress = 'gzip';
~~~

~~~
       job_id       |  status   | fraction_completed |  rows  | index_entries | system_records |  bytes   
--------------------+-----------+--------------------+--------+---------------+----------------+----------
 381866942129111041 | succeeded |                  1 | 300024 |             0 |              0 | 13258389
(1 row)
~~~

Then add the [computed columns](computed-columns.html), [constraints](add-constraint.html), and [function-based indexes](create-index.html). For example:

{% include copy-clipboard.html %}
~~~ sql
> UPDATE CUSTOMERS SET credit_limit = 50000 WHERE credit_limit > 50000;
  ALTER TABLE CUSTOMERS ADD CONSTRAINT CUSTOMER_CREDIT_LIMIT_MAX CHECK (credit_limit <= 50000);
  ALTER TABLE CUSTOMERS ADD COLUMN LOW_CUST_LAST_NAME STRING AS (lower(CUST_LAST_NAME)) STORED;
  ALTER TABLE CUSTOMERS ADD COLUMN LOW_CUST_FIRST_NAME STRING AS (lower(CUST_FIRST_NAME)) STORED;
  CREATE INDEX CUST_FUNC_LOWER_NAME_IX on CUSTOMERS (LOW_CUST_LAST_NAME,CUST_FIRST_NAME);
~~~

Repeat the above for each CSV file you want to import.

## Configuration Options

The following options are available to [`IMPORT ... CSV`](import.html):

- [Column delimiter](migrate-from-csv.html#column-delimiter)
- [Comment syntax](migrate-from-csv.html#comment-syntax)
- [Skip header rows](migrate-from-csv.html#skip-header-rows)
- [Null strings](migrate-from-csv.html#null-strings)
- [File compression](migrate-from-csv.html#file-compression)

For usage examples, see [Migrate from CSV - Configuration Options](migrate-from-csv.html#configuration-options).

## See also

- [`IMPORT`](import.html)
- [Migrate from CSV](migrate-from-csv.html)
- [Migrate from MySQL](migrate-from-mysql.html)
- [Migrate from Postgres](migrate-from-postgres.html)
- [SQL Dump (Export)](sql-dump.html)
- [Back Up and Restore Data](backup-and-restore.html)
- [Use the Built-in SQL Client](use-the-built-in-sql-client.html)
- [Other Cockroach Commands](cockroach-commands.html)
