---
title: crdb_internal
summary: The crdb_internal schema contains read-only views that you can use for introspection into CockroachDB internals.
toc: true
---

The `crdb_internal` [virtual schema](virtual-schemas.html) contains information about internal objects, processes, and metrics related to a specific database.

{{site.data.alerts.callout_danger}}
We do not recommend using `crdb_internal` tables in production environments for the following reasons:
- The contents of `crdb_internal` are unstable, and subject to change in new releases of CockroachDB.
- There are memory and latency costs associated with each table in `crdb_internal`. Accessing the tables in the schema can impact cluster stability and performance.
{{site.data.alerts.end}}

## Data exposed by `crdb_internal`

Each table in `crdb_internal` corresponds to an internal object, process, or metric, for a specific database. `crdb_internal` tables are read-only.

To see the `crdb_internal` tables for the [current database](sql-name-resolution.html#current-database), use the following [`SHOW TABLES`](show-tables.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM crdb_internal;
~~~

~~~
   schema_name  |         table_name          | type  | owner | estimated_row_count
----------------+-----------------------------+-------+-------+----------------------
  crdb_internal | backward_dependencies       | table | NULL  |                NULL
  crdb_internal | builtin_functions           | table | NULL  |                NULL
  crdb_internal | cluster_database_privileges | table | NULL  |                NULL
  ...
~~~

## Querying `crdb_internal` tables

To get detailed information about objects, processes, or metrics related to your database, you can read from the `crdb_internal` table that corresponds to the item of interest.

{{site.data.alerts.callout_success}}
To ensure that you can view all of the tables in `crdb_internal`, query the tables as a user with [`admin` privileges](authorization.html#admin-role).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Unless specified otherwise, queries to `crdb_internal` assume the [current database](sql-name-resolution.html#current-database).
{{site.data.alerts.end}}

For example, to return the `crdb_internal` table for the ranges of the [`movr`](movr.html) database, you can use the following statement:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM movr.crdb_internal.ranges;
~~~

~~~
  range_id |                                                                         start_key                                                                          |                                        start_pretty                                         |                                                                          end_key                                                                           |                                         end_pretty                                          | database_name |           table_name            | index_name | replicas |    replica_localities    | learner_replicas |       split_enforced_until       | lease_holder | range_size
-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------+---------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------+---------------------------------------------------------------------------------------------+---------------+---------------------------------+------------+----------+--------------------------+------------------+----------------------------------+--------------+-------------
         1 |                                                                                                                                                            | /Min                                                                                        | \004\000liveness-                                                                                                                                          | /System/NodeLiveness                                                                        |               |                                 |            | {1}      | {"region=us-east1,az=b"} | {}               | NULL                             |            1 |       8323
         2 | \004\000liveness-                                                                                                                                          | /System/NodeLiveness                                                                        | \004\000liveness.                                                                                                                                          | /System/NodeLivenessMax                                                                     |               |                                 |            | {1}      | {"region=us-east1,az=b"} | {}               | NULL                             |            1 |       9278
         3 | \004\000liveness.                                                                                                                                          | /System/NodeLivenessMax                                                                     | \004tsd                                                                                                                                                    | /System/tsd                                                                                 |               |                                 |            | {1}      | {"region=us-east1,az=b"} | {}               | NULL                             |            1 |      32377
         4 | \004tsd                                                                                                                                                    | /System/tsd                                                                                 | \004tse                                                                                                                                                    | /System/"tse"                                                                               |               |                                 |            | {1}      | {"region=us-east1,az=b"} | {}               | NULL                             |            1 |    4067446
(65 rows)
~~~

## See also

- [`SHOW`](show-vars.html)
- [`SHOW COLUMNS`](show-columns.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`SHOW CREATE`](show-create.html)
- [`SHOW DATABASES`](show-databases.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW INDEX`](show-index.html)
- [`SHOW SCHEMAS`](show-schemas.html)
- [`SHOW TABLES`](show-tables.html)
- [SQL Name Resolution](sql-name-resolution.html)
- [Virtual Schemas](virtual-schemas.html)
