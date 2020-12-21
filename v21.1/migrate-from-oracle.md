---
title: Migrate from Oracle
summary: Learn how to migrate data from Oracle into a CockroachDB cluster.
toc: true
---

This page has instructions for migrating data from Oracle into CockroachDB by [importing](import.html) CSV files. Note that `IMPORT` only works for creating new tables. For information on how to add CSV data to existing tables, see [`IMPORT INTO`](import-into.html).

To illustrate this process, we use the following sample data and tools:

- [Swingbench OrderEntry data set](http://www.dominicgiles.com/swingbench.html), which is based on the `oe` schema that ships with Oracle Database 11g and Oracle Database 12c.
- [Oracle Data Pump](https://docs.oracle.com/en/database/oracle/oracle-database/12.2/sutil/oracle-data-pump.html), which enables the movement of data and metadata from one database to another, and comes with all Oracle installations.
- [SQL*Plus](https://docs.oracle.com/database/121/SQPUG/ch_three.htm), the interactive and batch query tool that comes with every Oracle Database installation.

{% include {{ page.version.version }}/misc/import-perf.md %}

## Step 1. Export the Oracle schema

Using [Oracle's Data Pump Export utility](https://docs.oracle.com/en/database/oracle/oracle-database/12.2/sutil/oracle-data-pump-export-utility.html), export the schema:

{% include copy-clipboard.html %}
~~~ shell
$ expdp user/password directory=datapump dumpfile=oracle_example.dmp content=metadata_only logfile=example.log
~~~

The schema is stored in an Oracle-specific format (e.g., `oracle_example.dmp`).

## Step 2. Convert the Oracle schema to SQL

Using [Oracle's Data Pump Import utility](https://docs.oracle.com/en/database/oracle/oracle-database/12.2/sutil/datapump-import-utility.html), load the exported DMP file to convert it to a SQL file:

{% include copy-clipboard.html %}
~~~ shell
$ impdp user/password directory=datapump dumpfile=oracle_example.dmp sqlfile=example_sql.sql TRANSFORM=SEGMENT_ATTRIBUTES:N:table PARTITION_OPTIONS=MERGE
~~~

This SQL output will be used later, in [Step 7](#step-7-map-oracle-to-cockroachdb-data-types).

## Step 3. Export table data

You need to extract each table's data into a data list file (`.lst`). We wrote a simple SQL script (`spool.sql`) to do this:

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

ALTER SESSION SET nls_date_format = 'YYYY-MM-DD HH24:MI:SS';
  # Used to set a properly formatted date for CockroachDB

SELECT * from &1;

SPOOL OFF

SET PAGESIZE 24
SET FEEDBACK ON
SET TERMOUT ON
~~~

{{site.data.alerts.callout_info}}
In the example SQL script, `|` is used as a delimiter. Choose a delimiter that will not also occur in the rows themselves. For more information, see [`IMPORT`](import.html#delimiter).
{{site.data.alerts.end}}

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

## Step 4. Configure and convert the table data to CSV

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
      writer = csv.writer(fo)
      for rec in reader:
        writer.writerow(map(string.strip, rec))
~~~

{% include copy-clipboard.html %}
~~~ shell
$ python2 fix.py CUSTOMERS.lst ADDRESSES.lst CARD_DETAILS.lst WAREHOUSES.lst ORDER_ITEMS.lst ORDERS.lst INVENTORIES.lst PRODUCT_INFORMATION.lst LOGON.lst PRODUCT_DESCRIPTIONS.lst ORDERENTRY_METADATA.lst
~~~

Format the generated CSV files to meet the CockroachDB's [CSV requirements](#csv-requirements).

### CSV requirements

You will need to export one CSV file per table, with the following requirements:

- Files must be in [valid CSV format](https://tools.ietf.org/html/rfc4180).
- Files must be UTF-8 encoded.
- If one of the following characters appears in a field, the field must be enclosed by double quotes:
    - delimiter (`,` by default)
    - double quote (`"`)
    - newline (`\n`)
    - carriage return (`\r`)
- If double quotes are used to enclose fields, then a double quote appearing inside a field must be escaped by preceding it with another double quote.  For example: `"aaa","b""bb","ccc"`
- If a column is of type [`BYTES`](bytes.html), it can either be a valid UTF-8 string or a [hex-encoded byte literal](sql-constants.html#hexadecimal-encoded-byte-array-literals) beginning with `\x`. For example, a field whose value should be the bytes `1`, `2` would be written as `\x0102`.

### CSV configuration options

The following options are available to [`IMPORT ... CSV`](import.html):

- [Column delimiter](migrate-from-csv.html#column-delimiter)
- [Comment syntax](migrate-from-csv.html#comment-syntax)
- [Skip header rows](migrate-from-csv.html#skip-header-rows)
- [Null strings](migrate-from-csv.html#null-strings)
- [File compression](migrate-from-csv.html#file-compression)

For usage examples, see [Migrate from CSV - Configuration Options](migrate-from-csv.html#configuration-options).

## Step 5. Compress the CSV files

Compress the CSV files for a faster import:

{% include copy-clipboard.html %}
~~~ shell
$ gzip CUSTOMERS.csv ADDRESSES.csv CARD_DETAILS.csv WAREHOUSES.csv ORDER_ITEMS.csv ORDERS.csv INVENTORIES.csv PRODUCT_INFORMATION.csv LOGON.csv PRODUCT_DESCRIPTIONS.csv ORDERENTRY_METADATA.csv
~~~

These compressed CSV files will be used to import your data into CockroachDB.

## Step 6. Host the files where the cluster can access them

Each node in the CockroachDB cluster needs to have access to the files being imported. There are several ways for the cluster to access the data; for more information on the types of storage [`IMPORT`](import.html) can pull from, see the following:

- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)
- [Use a Local File Server for Bulk Operations](use-a-local-file-server-for-bulk-operations.html)

{{site.data.alerts.callout_success}}
We strongly recommend using cloud storage such as Amazon S3 or Google Cloud to host the data files you want to import.
{{site.data.alerts.end}}

## Step 7. Map Oracle to CockroachDB data types

Using the SQL file created in [Step 2](#step-2-convert-the-oracle-schema-to-sql), write [`IMPORT TABLE`](import.html) statements that match the schemas of the table data you're importing.

Remove all Oracle-specific attributes, remap all Oracle data types, refactor all [`CREATE TABLE`](create-table.html) statements to include [primary keys](primary-key.html).

### Data type mapping

Use the table below for data type mappings:

 Oracle Data Type | CockroachDB Data Type
------------------+-----------------------
`BLOB` | [`BYTES`](bytes.html) [<sup>1</sup>](#considerations)
`CHAR(n)`, `CHARACTER(n)`<br>n < 256 | [`CHAR(n)`, `CHARACTER(n)`](string.html)
`CLOB` | [`STRING`](string.html) [<sup>1</sup>](#considerations)
`DATE` | [`DATE`](date.html)
`FLOAT(n)` | [`DECIMAL(n)`](decimal.html)
`INTERVAL YEAR(p) TO MONTH `| [`VARCHAR`](string.html), [`INTERVAL`](interval.html)
`INTERVAL DAY(p) TO SECOND(s)` | [`VARCHAR`](string.html), [`INTERVAL`](interval.html)
`JSON` | [`JSON`](jsonb.html) [<sup>2</sup>](#considerations)
`LONG` | [`STRING`](string.html)
`LONG RAW` | [`BYTES`](bytes.html)
`NCHAR(n)`<br>n < 256 | [`CHAR(n)`](string.html )
`NCHAR(n)`<br>n > 255 | [`VARCHAR`, `STRING`](string.html)
`NCLOB` | [`STRING`](string.html)
`NUMBER(p,0)`, `NUMBER(p)`<br>1 <= p < 5 | [`INT2`](int.html) [<sup>3</sup>](#considerations)
`NUMBER(p,0)`, `NUMBER(p)`<br>5 <= p < 9 | [`INT4`](int.html) [<sup>3</sup>](#considerations)
`NUMBER(p,0)`, `NUMBER(p)`<br>9 <= p < 19 | [`INT8`](int.html) [<sup>3</sup>](#considerations)
`NUMBER(p,0)`, `NUMBER(p)`<br>19 <= p <= 38 | [`DECIMAL(p)`](decimal.html)
`NUMBER(p,s)`<br>s > 0 | [`DECIMAL(p,s)`](decimal.html)
`NUMBER`, `NUMBER(\*)` | [`DECIMAL`](decimal.html)
`NVARCHAR2(n)` | [`VARCHAR(n)`](string.html)
`RAW(n)` | [`BYTES`](bytes.html)
`TIMESTAMP(p)` | [`TIMESTAMP`](timestamp.html)
`TIMESTAMP(p) WITH TIME ZONE` | [`TIMESTAMP WITH TIMEZONE`](timestamp.html)
`VARCHAR(n)`, `VARCHAR2(n)` | [`VARCHAR(n)`](string.html)
`XML` | [`JSON`](jsonb.html) [<sup>2</sup>](#considerations)

<a name="considerations"></a>

- <sup>1</sup> `BLOBS` and `CLOBS` should be converted to [`BYTES`](bytes.html), or [`STRING`](string.html) where the size is variable, but it's recommended to keep values under 1 MB to ensure performance. Anything above 1 MB would require refactoring into an object store with a pointer embedded in the table in place of the object.
- <sup>2</sup> `JSON` and `XML` types can be converted to [`JSONB`](jsonb.html) using any XML to JSON conversion. `XML` must be converted to `JSONB` before importing into CockroachDB.
- <sup>3</sup> When converting `NUMBER(p,0)`, consider `NUMBER` types with Base-10 limits map to the Base-10 Limits for CockroachDB [`INT`](int.html) types. Optionally, `NUMBERS` can be converted to [`DECIMAL`](decimal.html).

When moving from Oracle to CockroachDB data types, consider the following:

- [Schema changes within transactions](known-limitations.html#schema-changes-within-transactions)
- [Schema changes between executions of prepared statements](online-schema-changes.html#no-schema-changes-between-executions-of-prepared-statements)
- If [`JSON`](jsonb.html) columns are used only for payload, consider switching to [`BYTES`](bytes.html).
- Max size of a single column family (512 MiB by default).

For more information, see [Known Limitations](known-limitations.html), [Online Schema Changes](online-schema-changes.html), and [Transactions](transactions.html).

### NULLs

For information on how CockroachDB handles `NULL`s, see [NULL Handling](null-handling.html) and [NOT NULL Constraint](not-null.html).

### Primary key, constraints, and secondary indexes

Cockroach distributes a table by the [primary key](primary-key.html) or by a default `ROWID` when a primary key is not provided. This also requires the primary key creation to be part of the table creation. Using the above [data type mapping](#data-type-mapping), refactor each table DDL to include the [primary key](primary-key.html), [constraints](constraints.html), and [secondary indexes](indexes.html).

For more information and examples, refer to the following:

- [`CREATE TABLE` - Create a table](create-table.html)
- [Define Table Partitions](partitioning.html)
- [Constraints - Supported constraints](constraints.html#supported-constraints)

### Privileges for users and roles

The Oracle privileges for [users](create-user.html) and [roles](create-role.html) must be rewritten for CockroachDB. Once the CockroachDB cluster is [secured](security-overview.html), CockroachDB follows the same [role-based access control](authorization.html) methodology as Oracle.   


## Step 8. Import the CSV

For example, to import the data from `CUSTOMERS.csv.gz` into a new `CUSTOMERS` table, issue the following statement in the CockroachDB SQL shell:

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
        'https://your-bucket-name.s3.us-east-2.amazonaws.com/CUSTOMERS.csv.gz'
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

{% include {{ page.version.version }}/sql/use-import-into.md %}

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

## Step 9. Refactor application SQL

The last phase of the migration process is to change the [transactional behavior](#transactions-locking-and-concurrency-control) and [SQL dialect](#sql-dialect) of your application.

### Transactions, locking, and concurrency control

Both Oracle and CockroachDB support [multi-statement transactions](transactions.html), which are atomic and guarantee ACID semantics. However, CockroachDB operates in a serializable isolation mode while Oracle defaults to read committed, which can create both non-repeatable reads and phantom reads when a transaction reads data twice. It is typical that Oracle developers will use `SELECT FOR UPDATE` to work around read committed issues. The [`SELECT FOR UPDATE`](select-for-update.html) statement is also supported in CockroachDB.

Regarding locks, Cockroach utilizes a [lightweight latch](architecture/transaction-layer.html#latch-manager) to serialize access to common keys across concurrent transactions. Oracle and CockroachDB transaction control flows only have a few minor differences; for more details, refer to [Transactions - SQL statements](transactions.html#sql-statements).  

As CockroachDB does not allow serializable anomalies, [transactions](begin-transaction.html) may experience deadlocks or [read/write contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention). This is expected during concurrency on the same keys. These can be addressed with either [automatic retries](transactions.html#automatic-retries) or [client-side intervention techniques](transactions.html#client-side-intervention).  

### SQL dialect

Cockroach is ANSI SQL compliant with a Postgres dialect, which allows you to use [native drivers](install-client-drivers.html) to connect applications and ORMs to CockroachDB. CockroachDB’s [SQL Layer](architecture/sql-layer.html#sql-api) supports full relational schema and SQL (similar to Oracle).

You will have to refactor Oracle SQL and functions that do not comply with [ANSI SQL-92](https://en.wikipedia.org/wiki/SQL-92) in order to work with CockroachDB. For more information about the [Cockroach SQL Grammar](sql-grammar.html) and a [SQL comparison](detailed-sql-support.html), see below:

- [SQL best practices](performance-best-practices-overview.html)
- [Common table expressions (CTE)](common-table-expressions.html)
- `DUAL` table

    Oracle requires use of the `DUAL` table, as Oracle requires a `SELECT ... FROM`. In CockroachDB, all reference to the `DUAL` table should be eliminated.

- [Function call syntax](functions-and-operators.html#string-and-byte-functions)
- [Hints](cost-based-optimizer.html#join-hints)

    See also: [Table Expressions - Force index selection](table-expressions.html#force-index-selection)

- [Joins](joins.html)

    CockroachDB supports [`HASH`](joins.html#hash-joins), [`MERGE`](joins.html#merge-joins), and [`LOOKUP`](joins.html#lookup-joins) joins. Oracle uses the `+` operator for `LEFT` and `RIGHT` joins, but CockroachDB uses the ANSI join syntax.

- [Sequences](create-sequence.html)

    Sequences in CockroachDB do not require a trigger to self-increment; place the sequence in the table DDL:

    ~~~
    > CREATE TABLE customer_list (
        id INT PRIMARY KEY DEFAULT nextval('customer_seq'),
        customer string,
        address string
      );
    ~~~  

- [Subqueries](subqueries.html)
- `SYSDATE`

    CockroachDB does not support `SYSDATE`; however, it does support date and time with the following:

    ~~~
    > SELECT Transaction_timestamp(), clock_timestamp();
    ~~~

    ~~~
    > SELECT current_timestamp
    ~~~

    ~~~
    > SELECT now();
    ~~~

- [Window functions](window-functions.html)

## See also

- [`IMPORT`](import.html)
- [Import Performance Best Practices](import-performance-best-practices.html)
- [Migrate from CSV](migrate-from-csv.html)
- [Migrate from MySQL](migrate-from-mysql.html)
- [Migrate from Postgres](migrate-from-postgres.html)
- [SQL Dump (Export)](cockroach-dump.html)
- [Back Up and Restore Data](backup-and-restore.html)
- [Use the Built-in SQL Client](cockroach-sql.html)
- [Other Cockroach Commands](cockroach-commands.html)
