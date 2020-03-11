---
title: Experimental Features
summary: Learn about the experimental features available in CockroachDB
toc: true
---

This page lists the experimental features that are available in CockroachDB v19.1.

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
| `experimental_force_split_at`       | `'off'`       | Indicates whether checks to prevent incorrect usage of [`ALTER TABLE ... SPLIT AT`](split-at.html) should be skipped.                                                                                                                                                                                   |
| `experimental_enable_zigzag_join`   | `'off'`       | Indicates whether the [cost-based optimizer](cost-based-optimizer.html) will plan certain queries using a zig-zag merge join algorithm, which searches for the desired intersection by jumping back and forth between the indexes based on the fact that they share a sorted order in their key suffix. |
| `experimental_serial_normalization` | `'rowid'`     | If set to `'virtual_sequence'`, make the [`SERIAL`](serial.html) pseudo-type optionally auto-create a sequence for [better compatibility with Hibernate sequences](https://forum.cockroachlabs.com/t/hibernate-sequence-generator-returns-negative-number-and-ignore-unique-rowid/).                    |

## SQL statements

### Keep SQL audit logs

Log queries against a table to a file. For more information, see [`ALTER TABLE ... EXPERIMENTAL_AUDIT`](experimental-audit.html).

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

### Show a table's ranges

Show the ranges that make up a table or index.  For more information, see [`SHOW EXPERIMENTAL_RANGES`](show-experimental-ranges.html).

{% include copy-clipboard.html %}
~~~ sql
SHOW EXPERIMENTAL_RANGES FROM TABLE t;
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
This example uses the `users` table from our open-source, fictional peer-to-peer ride-sharing application,[MovR](https://github.com/cockroachdb/movr).
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

## Functions and Operators

The table below lists the experimental SQL functions and operators available in CockroachDB.  For more information, see each function's documentation at [Functions and Operators](functions-and-operators.html).

| Function                                                                         | Description                                     |
|----------------------------------------------------------------------------------+-------------------------------------------------|
| [`experimental_strftime`](functions-and-operators.html#date-and-time-functions)  | Format time using standard `strftime` notation. |
| [`experimental_strptime`](functions-and-operators.html#date-and-time-functions)  | Format time using standard `strptime` notation. |
| [`experimental_uuid_v4()`](functions-and-operators.html#id-generation-functions) | Return a UUID.                                  |

## See Also

- [`SHOW` (session)](show-vars.html)
- [Functions and Operators](functions-and-operators.html)
- [`ALTER TABLE ... EXPERIMENTAL_AUDIT`](experimental-audit.html)
- [`SHOW EXPERIMENTAL_RANGES`](show-experimental-ranges.html)
- [`SHOW TRACE FOR SESSION`](show-trace.html)
