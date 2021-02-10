---
title: crdb_internal
summary: The crdb_internal schema contains read-only views that you can use for introspection into your database's tables, columns, indexes, and views.
toc: true
---

CockroachDB provides a [virtual schema](virtual-schemas.html) called `crdb_internal` that contains information about CockroachDB internals related to a specific cluster. `crdb_internal` tables are read-only.

{{site.data.alerts.callout_info}}
The `crdb_internal` views typically represent objects that the current user has privilege to access. To ensure you can view all the objects in a database, access it as a user with [`admin` privileges](authorization.html#admin-role).
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
We do not recommend using `crdb_internal` tables in production environments for the following reasons:
- The contents of `crdb_internal` schema are unstable, and subject to change in new releases of CockroachDB.
- There are memory and latency costs associated with each table in `crdb_internal`. Accessing the tables in the schema can impact cluster stability and performance.
{{site.data.alerts.end}}

## Data exposed by `crdb_internal`

To perform introspection on objects related to your database, you can read from the `crdb_internal` table that corresponds to the object of interest. For example, to get information about the status of long-running [jobs](show-jobs.html) on your cluster, you can query the `crdb_internal.jobs` table, which includes detailed information about all jobs running on your cluster. Similarly, to get information about [table partitions](partitioning.html), you would query the `crdb_internal.partitions` table, or for [zone constraints](configure-replication-zones.html), the `crdb_internal.zones` table.

Unless specified otherwise, queries to `crdb_internal` assume the [current database](sql-name-resolution.html#current-database). For example, if the current database is set as [`movr`](movr.html), to return the `crdb_internal` table for the ranges of the `movr` database, you can use the following statement:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM crdb_internal.ranges;
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
