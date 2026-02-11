---
title: SHOW LOGICAL REPLICATION JOBS
summary: The SHOW LOGICAL REPLICATION JOBS statement provides details on LDR jobs on the cluster.
toc: true
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}

Logical data replication is only supported in CockroachDB {{ site.data.products.core }} clusters.
{{site.data.alerts.end}}

The `SHOW LOGICAL REPLICATION JOBS` statement shows details of [**logical data replication (LDR)**]({% link {{ page.version.version }}/logical-data-replication-overview.md %}) jobs on a cluster.

This page is a reference for the `SHOW LOGICAL REPLICATION JOBS` SQL statement, which includes information on its parameters and possible options. For more details on monitoring LDR, refer to the [Monitor Logical Data Replication]({% link {{ page.version.version }}/logical-data-replication-monitoring.md %}) page.

## Required privileges

You must have one of the following to run `SHOW LOGICAL REPLICATION JOBS`:

- The [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role).
- The [`VIEWJOB` system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}), which can view all jobs (including `admin`-owned jobs).

Use the [`GRANT SYSTEM`]({% link {{ page.version.version }}/grant.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT SYSTEM VIEWJOB TO user;
~~~

## Synopsis

<div>
{% include {{ page.version.version }}/ldr/show_logical_replication_jobs_stmt.html %}
</div>

### Parameters

Parameter | Description
----------+------------
`show_logical_replication_jobs_options` | [Option](#options) to modify the output.

## Options

Option | Description
-------+------------
`details` | Includes the additional columns: `replication_start_time`, `conflict_resolution_type`, `description`.

## Responses

{% include {{ page.version.version }}/ldr/show-logical-replication-responses.md %}

## Example

In the destination cluster's SQL shell, you can query `SHOW LOGICAL REPLICATION JOBS` to view the LDR jobs running on the cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW LOGICAL REPLICATION JOBS;
~~~
~~~
        job_id        | status  |          tables          |    replicated_time
----------------------+---------+--------------------------+-------------------------
  1131000153784844289 | running | {db_b.public.test_table} | 2025-12-09 19:33:20+00
  1131000167682211841 | running | {db_a.public.test_table} | 2025-12-09 19:33:20+00
(2 rows)
~~~

For additional detail on each LDR job, use the `WITH details` option:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW LOGICAL REPLICATION JOBS WITH details;
~~~
~~~
        job_id        | status  |          tables          |    replicated_time     |    replication_start_time     | conflict_resolution_type |                                                                             command
----------------------+---------+--------------------------+------------------------+-------------------------------+--------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------
  1131000153784844289 | running | {db_b.public.test_table} | 2025-12-09 19:35:50+00 | 2025-12-08 20:04:15.512126+00 | LWW                      | CREATE LOGICALLY REPLICATED TABLE test_table FROM TABLE test_table ON 'external://conn_a' WITH OPTIONS (BIDIRECTIONAL ON 'external://conn_b')
  1131000167682211841 | running | {db_a.public.test_table} | 2025-12-09 19:35:50+00 | 2025-12-08 20:04:19.758587+00 | LWW                      | CREATE LOGICAL REPLICATION STREAM FROM TABLE test_table ON 'external://conn_b' INTO TABLE test_table WITH OPTIONS (CURSOR = $1, PARENT = '1131000153784844289')
~~~

## See also

- [`CREATE LOGICAL REPLICATION STREAM`]({% link {{ page.version.version }}/create-logical-replication-stream.md %})
- [Set Up Logical Data Replication]({% link {{ page.version.version }}/set-up-logical-data-replication.md %})