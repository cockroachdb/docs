---
title: Migrate from Oracle
summary: Learn how to migrate data from Oracle into a CockroachDB cluster.
toc: true
docs_area: migrate
---

{{site.data.alerts.callout_danger}}
The instructions on this page are outdated. Use the [MOLT Schema Conversion Tool](migrations-page.md?filters=oracle) to convert an Oracle schema into a compatible CockroachDB schema, and a tool such as [AWS Database Migration Service (DMS)]({{ page.version.version }}/aws-dms.md) or [Qlik]({{ page.version.version }}/qlik.md) to migrate data from Oracle to CockroachDB.
{{site.data.alerts.end}}

This page has instructions for migrating data from Oracle into CockroachDB by [importing]({{ page.version.version }}/import-into.md) CSV files.

To illustrate this process, we use the following sample data and tools:

- [Swingbench OrderEntry data set](http://www.dominicgiles.com/swingbench.html), which is based on the `oe` schema that ships with Oracle Database 11g and Oracle Database 12c.
- [Oracle Data Pump](https://docs.oracle.com/en/database/oracle/oracle-database/12.2/sutil/oracle-data-pump.html), which enables the movement of data and metadata from one database to another, and comes with all Oracle installations.
- [SQL*Plus](https://docs.oracle.com/database/121/SQPUG/ch_three.htm), the interactive and batch query tool that comes with every Oracle Database installation.


## Step 1. Export the Oracle schema

Using [Oracle's Data Pump Export utility](https://docs.oracle.com/en/database/oracle/oracle-database/12.2/sutil/oracle-data-pump-export-utility.html), export the schema:

~~~ shell
$ expdp user/password directory=datapump dumpfile=oracle_example.dmp content=metadata_only logfile=example.log
~~~

The schema is stored in an Oracle-specific format (e.g., `oracle_example.dmp`).

## Step 2. Convert the Oracle schema to SQL

Using [Oracle's Data Pump Import utility](https://docs.oracle.com/en/database/oracle/oracle-database/12.2/sutil/datapump-import-utility.html), load the exported DMP file to convert it to a SQL file:

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
In the example SQL script, `|` is used as a delimiter. Choose a delimiter that will not also occur in the rows themselves. For more information, see [`IMPORT INTO`]({{ page.version.version }}/import-into.md#delimited-data-files).
{{site.data.alerts.end}}

To extract the data, we ran the script for each table in SQL*Plus:

~~~ sql
$ sqlplus user/password
~~~

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

  with open(lstfile) as f:
    reader = csv.reader(f, delimiter="|")
    with open(filename+".csv", "w") as fo:
      writer = csv.writer(fo)
      for rec in reader:
        writer.writerow(map(string.strip, rec))
~~~

~~~ shell
$ python3 fix-example.py CUSTOMERS.lst ADDRESSES.lst CARD_DETAILS.lst WAREHOUSES.lst ORDER_ITEMS.lst ORDERS.lst INVENTORIES.lst PRODUCT_INFORMATION.lst LOGON.lst PRODUCT_DESCRIPTIONS.lst ORDERENTRY_METADATA.lst
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
- If a column is of type [`BYTES`]({{ page.version.version }}/bytes.md), it can either be a valid UTF-8 string or a [hex-encoded byte literal]({{ page.version.version }}/sql-constants.md#hexadecimal-encoded-byte-array-literals) beginning with `\x`. For example, a field whose value should be the bytes `1`, `2` would be written as `\x0102`.

### CSV configuration options

The following options are available to [`IMPORT INTO ... CSV DATA`]({{ page.version.version }}/import-into.md):

- [Column delimiter]({{ page.version.version }}/migrate-from-csv.md#column-delimiter)
- [Comment syntax]({{ page.version.version }}/migrate-from-csv.md#comment-syntax)
- [Skip header rows]({{ page.version.version }}/migrate-from-csv.md#skip-header-rows)
- [Null strings]({{ page.version.version }}/migrate-from-csv.md#null-strings)
- [File compression]({{ page.version.version }}/migrate-from-csv.md#file-compression)

For usage examples, see [Migrate from CSV - Configuration Options]({{ page.version.version }}/migrate-from-csv.md#configuration-options).

## Step 5. Compress the CSV files

Compress the CSV files for a faster import:

~~~ shell
$ gzip CUSTOMERS.csv ADDRESSES.csv CARD_DETAILS.csv WAREHOUSES.csv ORDER_ITEMS.csv ORDERS.csv INVENTORIES.csv PRODUCT_INFORMATION.csv LOGON.csv PRODUCT_DESCRIPTIONS.csv ORDERENTRY_METADATA.csv
~~~

These compressed CSV files will be used to import your data into CockroachDB.

## Step 6. Host the files where the cluster can access them

Each node in the CockroachDB cluster needs to have access to the files being imported. There are several ways for the cluster to access the data; for more information on the types of storage [`IMPORT INTO`]({{ page.version.version }}/import-into.md) can pull from, see the following:

- [Use Cloud Storage]({{ page.version.version }}/use-cloud-storage.md)
- [Use a Local File Server]({{ page.version.version }}/use-a-local-file-server.md)

{{site.data.alerts.callout_success}}
We strongly recommend using cloud storage such as Amazon S3 or Google Cloud to host the data files you want to import.
{{site.data.alerts.end}}

## Step 7. Map Oracle to CockroachDB data types

Using the SQL file created in [Step 2](#step-2-convert-the-oracle-schema-to-sql), write [`CREATE TABLE`]({{ page.version.version }}/create-table.md) statements that match the schemas of the table data you're importing. Remove all Oracle-specific attributes and remap all Oracle data types.

For example, to create a `CUSTOMERS` table, issue the following statement in the CockroachDB SQL shell:

~~~ sql
CREATE TABLE customers (
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
 );
~~~

### Data type mapping

Use the table below for data type mappings:

 Oracle Data Type | CockroachDB Data Type
------------------+-----------------------
`BLOB` | [`BYTES`]({{ page.version.version }}/bytes.md) [<sup>1</sup>](#considerations)
`CHAR(n)`, `CHARACTER(n)`<br>n < 256 | [`CHAR(n)`, `CHARACTER(n)`]({{ page.version.version }}/string.md)
`CLOB` | [`STRING`]({{ page.version.version }}/string.md) [<sup>1</sup>](#considerations)
`DATE` | [`DATE`]({{ page.version.version }}/date.md)
`FLOAT(n)` | [`DECIMAL(n)`]({{ page.version.version }}/decimal.md)
`INTERVAL YEAR(p) TO MONTH `| [`VARCHAR`]({{ page.version.version }}/string.md), [`INTERVAL`]({{ page.version.version }}/interval.md)
`INTERVAL DAY(p) TO SECOND(s)` | [`VARCHAR`]({{ page.version.version }}/string.md), [`INTERVAL`]({{ page.version.version }}/interval.md)
`JSON` | [`JSON`]({{ page.version.version }}/jsonb.md) [<sup>2</sup>](#considerations)
`LONG` | [`STRING`]({{ page.version.version }}/string.md)
`LONG RAW` | [`BYTES`]({{ page.version.version }}/bytes.md)
`NCHAR(n)`<br>n < 256 | [`CHAR(n)`]({{ page.version.version }}/string.md )
`NCHAR(n)`<br>n > 255 | [`VARCHAR`, `STRING`]({{ page.version.version }}/string.md)
`NCLOB` | [`STRING`]({{ page.version.version }}/string.md)
`NUMBER(p,0)`, `NUMBER(p)`<br>1 <= p < 5 | [`INT2`]({{ page.version.version }}/int.md) [<sup>3</sup>](#considerations)
`NUMBER(p,0)`, `NUMBER(p)`<br>5 <= p < 9 | [`INT4`]({{ page.version.version }}/int.md) [<sup>3</sup>](#considerations)
`NUMBER(p,0)`, `NUMBER(p)`<br>9 <= p < 19 | [`INT8`]({{ page.version.version }}/int.md) [<sup>3</sup>](#considerations)
`NUMBER(p,0)`, `NUMBER(p)`<br>19 <= p <= 38 | [`DECIMAL(p)`]({{ page.version.version }}/decimal.md)
`NUMBER(p,s)`<br>s > 0 | [`DECIMAL(p,s)`]({{ page.version.version }}/decimal.md)
`NUMBER`, `NUMBER(\*)` | [`DECIMAL`]({{ page.version.version }}/decimal.md)
`NVARCHAR2(n)` | [`VARCHAR(n)`]({{ page.version.version }}/string.md)
`RAW(n)` | [`BYTES`]({{ page.version.version }}/bytes.md)
`TIMESTAMP(p)` | [`TIMESTAMP`]({{ page.version.version }}/timestamp.md)
`TIMESTAMP(p) WITH TIME ZONE` | [`TIMESTAMP WITH TIMEZONE`]({{ page.version.version }}/timestamp.md)
`VARCHAR(n)`, `VARCHAR2(n)` | [`VARCHAR(n)`]({{ page.version.version }}/string.md)
`XML` | [`JSON`]({{ page.version.version }}/jsonb.md) [<sup>2</sup>](#considerations)

<a name="considerations"></a>

- <sup>1</sup> `BLOBS` and `CLOBS` should be converted to [`BYTES`]({{ page.version.version }}/bytes.md), or [`STRING`]({{ page.version.version }}/string.md) where the size is variable, but it's recommended to keep values under 1 MB to ensure performance. Anything above 1 MB would require refactoring into an object store with a pointer embedded in the table in place of the object.
- <sup>2</sup> `JSON` and `XML` types can be converted to [`JSONB`]({{ page.version.version }}/jsonb.md) using any XML to JSON conversion. `XML` must be converted to `JSONB` before importing into CockroachDB.
- <sup>3</sup> When converting `NUMBER(p,0)`, consider `NUMBER` types with Base-10 limits map to the Base-10 Limits for CockroachDB [`INT`]({{ page.version.version }}/int.md) types. Optionally, `NUMBERS` can be converted to [`DECIMAL`]({{ page.version.version }}/decimal.md).

When moving from Oracle to CockroachDB data types, consider the following:

- [Schema changes within transactions]({{ page.version.version }}/known-limitations.md#schema-changes-within-transactions)
- [Schema changes between executions of prepared statements]({{ page.version.version }}/online-schema-changes.md#no-online-schema-changes-between-executions-of-prepared-statements)
- If [`JSON`]({{ page.version.version }}/jsonb.md) columns are used only for payload, consider switching to [`BYTES`]({{ page.version.version }}/bytes.md).
- Max size of a single [column family]({{ page.version.version }}/column-families.md) (by default, the [maximum size of a range]({{ page.version.version }}/configure-replication-zones.md#range-max-bytes)).

For more information, see [Known Limitations]({{ page.version.version }}/known-limitations.md), [Online Schema Changes]({{ page.version.version }}/online-schema-changes.md), and [Transactions]({{ page.version.version }}/transactions.md).

### NULLs

For information on how CockroachDB handles `NULL`s, see [NULL Handling]({{ page.version.version }}/null-handling.md) and [NOT NULL Constraint]({{ page.version.version }}/not-null.md).

### Primary key, constraints, and secondary indexes

Cockroach distributes a table by the [primary key]({{ page.version.version }}/primary-key.md) or by a default `ROWID` when a primary key is not provided. This also requires the primary key creation to be part of the table creation. Using the above [data type mapping](#data-type-mapping), refactor each table DDL to include the [primary key]({{ page.version.version }}/primary-key.md), [constraints]({{ page.version.version }}/constraints.md), and [secondary indexes]({{ page.version.version }}/indexes.md).

For more information and examples, refer to the following:

- [`CREATE TABLE` - Create a table]({{ page.version.version }}/create-table.md)
- [Define Table Partitions]({{ page.version.version }}/partitioning.md)
- [Constraints - Supported constraints]({{ page.version.version }}/constraints.md#supported-constraints)

### Privileges for users and roles

The Oracle privileges for [users]({{ page.version.version }}/create-user.md) and [roles]({{ page.version.version }}/create-role.md) must be rewritten for CockroachDB. Once the CockroachDB cluster is [secured]({{ page.version.version }}/security-reference/security-overview.md), CockroachDB follows the same [role-based access control]({{ page.version.version }}/authorization.md) methodology as Oracle.

## Step 8. Import the CSV

Use [`IMPORT INTO`]({{ page.version.version }}/import-into.md) to import data into each table created in [Step 7](#step-7-map-oracle-to-cockroachdb-data-types).

For example, to import the data from `CUSTOMERS.csv.gz` into an existing `CUSTOMERS` table, issue the following statement in the CockroachDB SQL shell:

~~~ sql
IMPORT INTO CUSTOMERS
  CSV DATA ('https://your-bucket-name.s3.us-east-2.amazonaws.com/CUSTOMERS.csv.gz')
  WITH delimiter = e'\t',
   "nullif" = '',
   decompress = 'gzip';
~~~

~~~
       job_id       |  status   | fraction_completed |  rows  | index_entries | system_records |  bytes
--------------------+-----------+--------------------+--------+---------------+----------------+----------
 381866942129111041 | succeeded |                  1 | 300024 |             0 |              0 | 13258389
(1 row)
~~~

Then add the [computed columns]({{ page.version.version }}/computed-columns.md), [constraints]({{ page.version.version }}/alter-table.md#add-constraint), and [function-based indexes]({{ page.version.version }}/create-index.md). For example:

~~~ sql
> UPDATE CUSTOMERS SET credit_limit = 50000 WHERE credit_limit > 50000;
  ALTER TABLE CUSTOMERS ADD CONSTRAINT CUSTOMER_CREDIT_LIMIT_MAX CHECK (credit_limit <= 50000);
  ALTER TABLE CUSTOMERS ADD COLUMN LOW_CUST_LAST_NAME STRING AS (lower(CUST_LAST_NAME)) STORED;
  ALTER TABLE CUSTOMERS ADD COLUMN LOW_CUST_FIRST_NAME STRING AS (lower(CUST_FIRST_NAME)) STORED;
  CREATE INDEX CUST_FUNC_LOWER_NAME_IX on CUSTOMERS (LOW_CUST_LAST_NAME,CUST_FIRST_NAME);
~~~

Repeat the preceding steps for each CSV file you want to import.

## Step 9. Refactor application SQL

The last phase of the migration process is to change the [transactional behavior](#transactions-locking-and-concurrency-control) and [SQL dialect](#sql-dialect) of your application.

### Transactions, locking, and concurrency control

Both Oracle and CockroachDB support [multi-statement transactions]({{ page.version.version }}/transactions.md), which are atomic and guarantee ACID semantics. However, CockroachDB operates under [`SERIALIZABLE`]({{ page.version.version }}/demo-serializable.md) isolation by default, while Oracle defaults to [`READ COMMITTED`]({{ page.version.version }}/read-committed.md), which can create both [non-repeatable reads and phantom reads]({{ page.version.version }}/read-committed.md#non-repeatable-reads-and-phantom-reads) when a transaction reads data twice. It is typical that Oracle developers will use `SELECT FOR UPDATE` to work around `READ COMMITTED` concurrency anomalies. Both the [`READ COMMITTED`]({{ page.version.version }}/read-committed.md) isolation level and the [`SELECT FOR UPDATE`]({{ page.version.version }}/select-for-update.md) statement are supported in CockroachDB.

Regarding locks, Cockroach utilizes a [lightweight latch]({{ page.version.version }}/architecture/transaction-layer.md#latch-manager) to serialize access to common keys across concurrent transactions. Oracle and CockroachDB transaction control flows only have a few minor differences; for more details, refer to [Transactions - SQL statements]({{ page.version.version }}/transactions.md#sql-statements).

Because CockroachDB does not allow serializable anomalies under `SERIALIZABLE` isolation, [transactions]({{ page.version.version }}/begin-transaction.md) may experience deadlocks or [read/write contention]({{ page.version.version }}/performance-best-practices-overview.md#transaction-contention). This is expected during concurrency on the same keys. These can be addressed with either [automatic retries]({{ page.version.version }}/transactions.md#automatic-retries) or [client-side transaction retry handling]({{ page.version.version }}/transaction-retry-error-reference.md#client-side-retry-handling).

### SQL dialect

Cockroach is ANSI SQL compliant with a PostgreSQL dialect, which allows you to use [native drivers]({{ page.version.version }}/install-client-drivers.md) to connect applications and ORMs to CockroachDB. CockroachDB’s [SQL layer]({{ page.version.version }}/architecture/sql-layer.md#sql-api) supports full relational schema and SQL (similar to Oracle).

You will have to refactor Oracle SQL and functions that do not comply with [ANSI SQL-92](https://wikipedia.org/wiki/SQL-92) in order to work with CockroachDB. For more information about the [Cockroach SQL Grammar]({{ page.version.version }}/sql-grammar.md) and a [SQL comparison]({{ page.version.version }}/sql-feature-support.md), see below:

- [SQL best practices]({{ page.version.version }}/performance-best-practices-overview.md)
- [Common table expressions (CTE)]({{ page.version.version }}/common-table-expressions.md)
- `DUAL` table

    Oracle requires use of the `DUAL` table, as Oracle requires a `SELECT ... FROM`. In CockroachDB, all reference to the `DUAL` table should be eliminated.

- [Function call syntax]({{ page.version.version }}/functions-and-operators.md#string-and-byte-functions)
- [Hints]({{ page.version.version }}/cost-based-optimizer.md#join-hints)

    See also: [Table Expressions - Force index selection]({{ page.version.version }}/table-expressions.md#force-index-selection)

- [Joins]({{ page.version.version }}/joins.md)

    CockroachDB supports [`HASH`]({{ page.version.version }}/joins.md#hash-joins), [`MERGE`]({{ page.version.version }}/joins.md#merge-joins), and [`LOOKUP`]({{ page.version.version }}/joins.md#lookup-joins) joins. Oracle uses the `+` operator for `LEFT` and `RIGHT` joins, but CockroachDB uses the ANSI join syntax.

- [Sequences]({{ page.version.version }}/create-sequence.md)

    Sequences in CockroachDB do not require a trigger to self-increment; place the sequence in the table DDL:

    ~~~
    > CREATE TABLE customer_list (
        id INT PRIMARY KEY DEFAULT nextval('customer_seq'),
        customer string,
        address string
      );
    ~~~

- [Subqueries]({{ page.version.version }}/subqueries.md)
- `SYSDATE`

    CockroachDB does not support `SYSDATE`; however, it does support date and time with the following:

    ~~~
    > SELECT transaction_timestamp(), clock_timestamp();
    ~~~

    ~~~
    > SELECT current_timestamp
    ~~~

    ~~~
    > SELECT now();
    ~~~

- [Window functions]({{ page.version.version }}/window-functions.md)

## See also

- [`IMPORT INTO`]({{ page.version.version }}/import-into.md)
- [Import Performance Best Practices]({{ page.version.version }}/import-performance-best-practices.md)
- [Migrate from CSV]({{ page.version.version }}/migrate-from-csv.md)
- [Migrate from MySQL]({{ page.version.version }}/migrate-from-mysql.md)
- [Migrate from PostgreSQL]({{ page.version.version }}/migrate-from-postgres.md)
- [Back Up and Restore Data]({{ page.version.version }}/take-full-and-incremental-backups.md)
- [Use the Built-in SQL Client]({{ page.version.version }}/cockroach-sql.md)
- [`cockroach` Commands Overview]({{ page.version.version }}/cockroach-commands.md)