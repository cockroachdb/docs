---
title: SHOW LOGICAL REPLICATION JOBS
summary: The SHOW LOGICAL REPLICATION JOBS statement provides details on LDR jobs on the cluster.
toc: true
---

{{site.data.alerts.callout_info}}
{% include "feature-phases/preview.md" %}

Logical data replication is only supported in CockroachDB {{ site.data.products.core }} clusters.
{{site.data.alerts.end}}

The `SHOW LOGICAL REPLICATION JOBS` statement shows details of [**logical data replication (LDR)**]({% link "{{ page.version.version }}/logical-data-replication-overview.md" %}) jobs on a cluster.

This page is a reference for the `SHOW LOGICAL REPLICATION JOBS` SQL statement, which includes information on its parameters and possible options. For more details on monitoring LDR, refer to the [Monitor Logical Data Replication]({% link "{{ page.version.version }}/logical-data-replication-monitoring.md" %}) page.

## Required privileges

You must have one of the following to run `SHOW LOGICAL REPLICATION JOBS`:

- The [`admin` role]({% link "{{ page.version.version }}/security-reference/authorization.md" %}#admin-role).
- The [`VIEWJOB` system privilege]({% link "{{ page.version.version }}/security-reference/authorization.md" %}), which can view all jobs (including `admin`-owned jobs).

Use the [`GRANT SYSTEM`]({% link "{{ page.version.version }}/grant.md" %}) statement:

{% include "copy-clipboard.html" %}
~~~ sql
GRANT SYSTEM VIEWJOB TO user;
~~~

## Synopsis

<div>
{% dynamic_include page.version.version, "/ldr/show_logical_replication_jobs_stmt.html" %}
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

{% dynamic_include page.version.version, "/ldr/show-logical-replication-responses.md" %}

## Example

In the destination cluster's SQL shell, you can query `SHOW LOGICAL REPLICATION JOBS` to view the LDR jobs running on the cluster:

{% include "copy-clipboard.html" %}
~~~ sql
SHOW LOGICAL REPLICATION JOBS;
~~~
~~~
        job_id        | status  |          tables           | replicated_time
----------------------+---------+---------------------------+------------------
1012877040439033857   | running | {database.public.table}   | NULL
(1 row)
~~~

For additional detail on each LDR job, use the `WITH details` option:

{% include "copy-clipboard.html" %}
~~~ sql
SHOW LOGICAL REPLICATION JOBS WITH details;
~~~
~~~
        job_id        |  status  |            tables              |        replicated_time        |    replication_start_time     | conflict_resolution_type |                                      command
----------------------+----------+--------------------------------+-------------------------------+-------------------------------+--------------------------+-----------------------------------------------------------------------------------------
  1010959260799270913 | running  | {movr.public.promo_codes}      | 2024-10-24 17:50:05+00        | 2024-10-10 20:04:42.196982+00 | LWW                      | LOGICAL REPLICATION STREAM into movr.public.promo_codes from external://cluster_a
  1014047902397333505 | canceled | {defaultdb.public.office_dogs} | 2024-10-24 17:30:25+00        | 2024-10-21 17:54:20.797643+00 | LWW                      | LOGICAL REPLICATION STREAM into defaultdb.public.office_dogs from external://cluster_a
~~~

## See also

- [`CREATE LOGICAL REPLICATION STREAM`]({% link "{{ page.version.version }}/create-logical-replication-stream.md" %})
- [Set Up Logical Data Replication]({% link "{{ page.version.version }}/set-up-logical-data-replication.md" %})