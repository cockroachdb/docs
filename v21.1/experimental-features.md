---
title: Experimental Features
summary: Learn about the experimental features available in CockroachDB
toc: true
---

This page lists the experimental features that are available in CockroachDB {{ page.version.version }}.

{{site.data.alerts.callout_danger}}
**This page describes experimental features.**  Their interfaces and outputs are subject to change, and there may be bugs.
<br />
<br />
If you encounter a bug, please [file an issue](file-an-issue.html).
{{site.data.alerts.end}}

## Session variables

The table below lists the experimental session settings that are available.  For a complete list of session variables, see [`SHOW` (session settings)](show-vars.html).

| Variable                            | Default Value | Description                                                                                                                                                                                                                                                                                             |
|-------------------------------------+---------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enable_experimental_alter_column_type_general`       | `'false'`       |  If set to `'true'`, enables [column type altering](#alter-column-types) for general cases, with some limitations.                                                                                                                                                                                   |
| `experimental_enable_hash_sharded_indexes`       | `'off'`       |  If set to `'on'`, enables [hash-sharded indexes](#hash-sharded-indexes) with `USING HASH`.                                                                                                                                                                                   |
| `experimental_enable_temp_tables`       | `'off'`       |  If set to `'on'`, enables [temporary objects](#temporary-objects), including [temporary tables](temporary-tables.html), [temporary views](views.html#temporary-views), and [temporary sequences](create-sequence.html#temporary-sequences).                                                                                                                                                                                   |

## SQL statements

### Keep SQL audit logs

Log all queries against a table to a file, for security purposes. For more information, see [`ALTER TABLE ... EXPERIMENTAL_AUDIT`](experimental-audit.html).

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE t EXPERIMENTAL_AUDIT SET READ WRITE;
~~~

### Relocate leases and replicas

You have the following options for controlling lease and replica location:

1. Relocate leases and replicas using `EXPERIMENTAL_RELOCATE`
2. Relocate just leases using `EXPERIMENTAL_RELOCATE LEASE`

For example, to distribute leases and ranges for N primary keys across N stores in the cluster, run a statement with the following structure:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE t EXPERIMENTAL_RELOCATE SELECT ARRAY[<storeid1>, <storeid2>, ..., <storeidN>], <primarykeycol1>, <primarykeycol2>, ..., <primarykeycolN>;
~~~

To relocate just the lease without moving the replicas, run a statement like the one shown below, which moves the lease for the range containing primary key 'foo' to store 1.

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE t EXPERIMENTAL_RELOCATE LEASE SELECT 1, 'foo';
~~~

### Show table fingerprints

Table fingerprints are used to compute an identification string of an entire table, for the purpose of gauging whether two tables have the same data. This is useful, for example, when restoring a table from backup.

Example:

{% include copy-clipboard.html %}
~~~ sql
> SHOW EXPERIMENTAL_FINGERPRINTS FROM TABLE t;
~~~

~~~
 index_name |     fingerprint     
------------+---------------------
 primary    | 1999042440040364641
(1 row)
~~~

### Turn on KV event tracing

Use session tracing (via [`SHOW TRACE FOR SESSION`](show-trace.html)) to report the replicas of all KV events that occur during its execution.

Example:

{% include copy-clipboard.html %}
~~~ sql
> SET tracing = on;
> SELECT * from t;
> SET tracing = off;
> SHOW EXPERIMENTAL_REPLICA TRACE FOR SESSION;
~~~

~~~
            timestamp             | node_id | store_id | replica_id
----------------------------------+---------+----------+------------
 2018-10-18 15:50:13.345879+00:00 |       3 |        3 |          7
 2018-10-18 15:50:20.628383+00:00 |       2 |        2 |         26
~~~

### Check for constraint violations with `SCRUB`

Checks the consistency of [`UNIQUE`](unique.html) indexes, [`CHECK`](check.html) constraints, and more.  Partially implemented; see [cockroachdb/cockroach#10425](https://github.com/cockroachdb/cockroach/issues/10425) for details.

{{site.data.alerts.callout_info}}
This example uses the `users` table from our open-source, fictional peer-to-peer vehicle-sharing application, [MovR](movr.html).
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
>  EXPERIMENTAL SCRUB table movr.users;
~~~

~~~
 job_uuid |        error_type        | database | table |                       primary_key                        |         timestamp         | repaired |                                                                                                                                                                         details                                                                                                                                                                         
----------+--------------------------+----------+-------+----------------------------------------------------------+---------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
          | index_key_decoding_error | movr     | users | ('boston','0009eeb5-d779-4bf8-b1bd-8566533b105c')        | 2018-10-18 16:00:38.65916 | f        | {"error_message": "key ordering did not match datum ordering. IndexDescriptor=ASC", "index_name": "primary", "row_data": {"address": "e'06484 Christine Villages\\nGrantport, TN 01572'", "city": "'boston'", "credit_card": "'4634253150884'", "id": "'0009eeb5-d779-4bf8-b1bd-8566533b105c'", "name": "'Jessica Webb'"}}
          | index_key_decoding_error | movr     | users | ('los angeles','0001252c-fc16-4006-b6dc-c6b1a0fd1f5b')   | 2018-10-18 16:00:38.65916 | f        | {"error_message": "key ordering did not match datum ordering. IndexDescriptor=ASC", "index_name": "primary", "row_data": {"address": "e'91309 Warner Springs\\nLake Danielmouth, PR 33400'", "city": "'los angeles'", "credit_card": "'3584736360686445'", "id": "'0001252c-fc16-4006-b6dc-c6b1a0fd1f5b'", "name": "'Rebecca Gibson'"}}
          | index_key_decoding_error | movr     | users | ('new york','000169a5-e337-4441-b664-dae63e682980')      | 2018-10-18 16:00:38.65916 | f        | {"error_message": "key ordering did not match datum ordering. IndexDescriptor=ASC", "index_name": "primary", "row_data": {"address": "e'0787 Christopher Highway Apt. 363\\nHamptonmouth, TX 91864-2620'", "city": "'new york'", "credit_card": "'4578562547256688'", "id": "'000169a5-e337-4441-b664-dae63e682980'", "name": "'Christopher Johnson'"}}
          | index_key_decoding_error | movr     | users | ('paris','00089fc4-e5b1-48f6-9f0b-409905f228c4')         | 2018-10-18 16:00:38.65916 | f        | {"error_message": "key ordering did not match datum ordering. IndexDescriptor=ASC", "index_name": "primary", "row_data": {"address": "e'46735 Martin Summit\\nMichaelview, OH 10906-5889'", "city": "'paris'", "credit_card": "'5102207609888778'", "id": "'00089fc4-e5b1-48f6-9f0b-409905f228c4'", "name": "'Nicole Fuller'"}}
          | index_key_decoding_error | movr     | users | ('rome','000209fc-69a1-4dd5-8053-3b5e5769876d')          | 2018-10-18 16:00:38.65916 | f        | {"error_message": "key ordering did not match datum ordering. IndexDescriptor=ASC", "index_name": "primary", "row_data": {"address": "e'473 Barrera Vista Apt. 890\\nYeseniaburgh, CO 78087'", "city": "'rome'", "credit_card": "'3534605564661093'", "id": "'000209fc-69a1-4dd5-8053-3b5e5769876d'", "name": "'Sheryl Shea'"}}
          | index_key_decoding_error | movr     | users | ('san francisco','00058767-1e83-4e18-999f-13b5a74d7225') | 2018-10-18 16:00:38.65916 | f        | {"error_message": "key ordering did not match datum ordering. IndexDescriptor=ASC", "index_name": "primary", "row_data": {"address": "e'5664 Acevedo Drive Suite 829\\nHernandezview, MI 13516'", "city": "'san francisco'", "credit_card": "'376185496850202'", "id": "'00058767-1e83-4e18-999f-13b5a74d7225'", "name": "'Kevin Turner'"}}
          | index_key_decoding_error | movr     | users | ('seattle','0002e904-1256-4528-8b5f-abad16e695ff')       | 2018-10-18 16:00:38.65916 | f        | {"error_message": "key ordering did not match datum ordering. IndexDescriptor=ASC", "index_name": "primary", "row_data": {"address": "e'81499 Samuel Crescent Suite 631\\nLake Christopherborough, PR 50401'", "city": "'seattle'", "credit_card": "'38743493725890'", "id": "'0002e904-1256-4528-8b5f-abad16e695ff'", "name": "'Mark Williams'"}}
          | index_key_decoding_error | movr     | users | ('washington dc','00007caf-2014-4696-85b0-840e7d8b6db9') | 2018-10-18 16:00:38.65916 | f        | {"error_message": "key ordering did not match datum ordering. IndexDescriptor=ASC", "index_name": "primary", "row_data": {"address": "e'4578 Holder Trafficway\\nReynoldsside, IL 23520-7418'", "city": "'washington dc'", "credit_card": "'30454993082943'", "id": "'00007caf-2014-4696-85b0-840e7d8b6db9'", "name": "'Marie Miller'"}}
(8 rows)
~~~

### Show range information for a specific row

The [`SHOW RANGE ... FOR ROW`](show-range-for-row.html) statement shows information about a [range](architecture/overview.html#glossary) for a particular row of data. This information is useful for verifying how SQL data maps to underlying ranges, and where the replicas for a range are located.

## Functions and Operators

The table below lists the experimental SQL functions and operators available in CockroachDB.  For more information, see each function's documentation at [Functions and Operators](functions-and-operators.html).

| Function                                                                         | Description                                     |
|----------------------------------------------------------------------------------+-------------------------------------------------|
| [`experimental_strftime`](functions-and-operators.html#date-and-time-functions)  | Format time using standard `strftime` notation. |
| [`experimental_strptime`](functions-and-operators.html#date-and-time-functions)  | Format time using standard `strptime` notation. |
| [`experimental_uuid_v4()`](functions-and-operators.html#id-generation-functions) | Return a UUID.                                  |

## Alter column types

 CockroachDB supports altering the column types of existing tables, with certain limitations. For more information, see [Altering column data types](alter-column.html#altering-column-data-types).

## Temporary objects

 Support for [temporary tables](temporary-tables.html), [temporary views](views.html#temporary-views), and [temporary sequences](create-sequence.html#temporary-sequences) is currently experimental in CockroachDB. If you create too many temporary objects in a session, the performance of DDL operations will degrade. Performance limitations could persist long after creating the temporary objects. For more details, see [cockroachdb/cockroach#46260](https://github.com/cockroachdb/cockroach/issues/46260).

## Hash-sharded indexes

 CockroachDB supports hash-sharded indexes with the [`USING HASH`](create-index.html#parameters) keywords. Hash-sharded indexes distribute sequential traffic uniformly across ranges, eliminating single-range hotspots and improving write performance on sequentially-keyed indexes at a small cost to read performance. For more information, see [Hash-sharded indexes](indexes.html#hash-sharded-indexes).

## Password authentication without TLS

   For deployments where transport security is already handled at the infrastructure level (e.g. IPSec with DMZ), and TLS-based transport security is not possible or not desirable, CockroachDB now supports delegating transport security to the infrastructure with the new experimental flag `--accept-sql-without-tls` for [`cockroach start`](cockroach-start.html#security).

  With this flag, SQL clients can establish a session over TCP without a TLS handshake. They still need to present valid authentication credentials, for example a password in the default configuration. Different authentication schemes can be further configured as per `server.host_based_authentication.configuration`.

  Example:
  {% include copy-clipboard.html %}
  ~~~ shell
  $ cockroach sql --user=jpointsman --insecure
  ~~~

  ~~~
    # Welcome to the CockroachDB SQL shell.
    # All statements must be terminated by a semicolon.
    # To exit, type: \q.
    #
    Enter password:
  ~~~

## See Also

- [`SHOW` (session)](show-vars.html)
- [Functions and Operators](functions-and-operators.html)
- [`ALTER TABLE ... EXPERIMENTAL_AUDIT`](experimental-audit.html)
- [`SHOW TRACE FOR SESSION`](show-trace.html)
- [`SHOW RANGE ... FOR ROW`](show-range-for-row.html)
