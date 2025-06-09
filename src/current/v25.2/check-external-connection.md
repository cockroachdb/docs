---
title: CHECK EXTERNAL CONNECTION
summary: Test the connection of each node to your cloud storage location.
toc: true
---

The `CHECK EXTERNAL CONNECTION` tests the connection from each node in the cluster to an external cloud storage location. `CHECK EXTERNAL CONNECTION` will measure the time it takes each node to write a file, read it, and delete it from the specified storage location. You can adjust the number and concurrency of the test runs as well as the size of the file to write and read for each test.

{{site.data.alerts.callout_info}}
You can use the `CHECK EXTERNAL CONNECTION` to test the connection to [**cloud storage**]({% link {{ page.version.version }}/use-cloud-storage.md %}) locations. 
{{site.data.alerts.end}}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/check_external_connection.html %}
</div>

## Parameters

Parameter | Description
----------+------------
`connection_uri` | The URI to the external storage. Specify the [provider's URI]({% link {{ page.version.version }}/use-cloud-storage.md %}) (e.g., `gs://bucket_name?AUTH...`) or a user-defined [external connection]({% link {{ page.version.version }}/create-external-connection.md %}) (e.g., `external://gcs`).

## Options

Option  | Value | Description
--------+-------+------------
`concurrently` | `INT` | Run multiple connection tests concurrently. If you also set the `time` option, it will run the specified number of concurrent tests until the time has elapsed. By default, only `1` connection test will run.
`time` | `STRING` | Run the test repeatedly until the duration has elapsed.
`transfer` | `STRING` | The size of the file that is written and read during each iteration of the connection test. By default, this will transfer a `32MiB` file.

## Responses

Field | Value | Description
------|-------|------------
`node` | `INT` | The node ID.
`locality` | `STRING` | The [locality]({% link {{ page.version.version }}/cockroach-start.md %}#locality) of the node.
`ok` | `BOOL` | Whether the test run succeeded.
`error` | `STRING` | Errors encountered during the test run.
`transferred` | `STRING` | The size of the file transferred during the test.
`read_speed` | `STRING` | The speed at which the node read the test file.
`write_speed` | `STRING` | The speed at which the node wrote the test file.
`can_delete` | `BOOL` | Whether file deletion succeeded.

## Test an external connection

Specify the connection URI to the [external storage location]({% link {{ page.version.version }}/use-cloud-storage.md %}), or a created [external connection]({% link {{ page.version.version }}/create-external-connection.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
CHECK EXTERNAL CONNECTION 'external://cloud-storage';
~~~

~~~
  node |                 locality                  | ok | error | transferred | read_speed  | write_speed | can_delete
-------+-------------------------------------------+----+-------+-------------+-------------+-------------+-------------
     1 | cloud=gce,region=us-east1,zone=us-east1-b | t  |       | 32 MiB      | 66.17 MiB/s | 37.52 MiB/s |     t
     3 | cloud=gce,region=us-east1,zone=us-east1-b | t  |       | 32 MiB      | 41.77 MiB/s | 33.55 MiB/s |     t
     2 | cloud=gce,region=us-east1,zone=us-east1-b | t  |       | 32 MiB      | 14.23 MiB/s | 37.12 MiB/s |     t
~~~

To modify the testing parameters, use one or a combination of the options: `concurrently`, `time`, `transfer`. For details on each, refer to [Options](#options).

{% include_cached copy-clipboard.html %}
~~~ sql
CHECK EXTERNAL CONNECTION 'external://cloud-storage' WITH transfer = '50MiB', concurrently = 5, time = '1ms';
~~~
~~~
  node |                 locality                  | ok | error | transferred | read_speed  | write_speed | can_delete
-------+-------------------------------------------+----+-------+-------------+-------------+-------------+-------------
     2 | cloud=gce,region=us-east1,zone=us-east1-b | t  |       | 50 MiB      | 59.85 MiB/s | 34.99 MiB/s |     t
     1 | cloud=gce,region=us-east1,zone=us-east1-b | t  |       | 50 MiB      | 58.26 MiB/s | 34.91 MiB/s |     t
     1 | cloud=gce,region=us-east1,zone=us-east1-b | t  |       | 50 MiB      | 57.69 MiB/s | 32.30 MiB/s |     t
     2 | cloud=gce,region=us-east1,zone=us-east1-b | t  |       | 50 MiB      | 55.51 MiB/s | 33.02 MiB/s |     t
     3 | cloud=gce,region=us-east1,zone=us-east1-b | t  |       | 50 MiB      | 59.29 MiB/s | 31.45 MiB/s |     t
     3 | cloud=gce,region=us-east1,zone=us-east1-b | t  |       | 50 MiB      | 55.61 MiB/s | 32.58 MiB/s |     t
     3 | cloud=gce,region=us-east1,zone=us-east1-b | t  |       | 50 MiB      | 61.04 MiB/s | 29.63 MiB/s |     t
     1 | cloud=gce,region=us-east1,zone=us-east1-b | t  |       | 50 MiB      | 47.69 MiB/s | 34.04 MiB/s |     t
     1 | cloud=gce,region=us-east1,zone=us-east1-b | t  |       | 50 MiB      | 55.66 MiB/s | 30.39 MiB/s |     t
     1 | cloud=gce,region=us-east1,zone=us-east1-b | t  |       | 50 MiB      | 57.77 MiB/s | 29.64 MiB/s |     t
     2 | cloud=gce,region=us-east1,zone=us-east1-b | t  |       | 50 MiB      | 44.95 MiB/s | 34.41 MiB/s |     t
     2 | cloud=gce,region=us-east1,zone=us-east1-b | t  |       | 50 MiB      | 46.77 MiB/s | 33.31 MiB/s |     t
     2 | cloud=gce,region=us-east1,zone=us-east1-b | t  |       | 50 MiB      | 57.64 MiB/s | 28.96 MiB/s |     t
     3 | cloud=gce,region=us-east1,zone=us-east1-b | t  |       | 50 MiB      | 58.99 MiB/s | 26.65 MiB/s |     t
     3 | cloud=gce,region=us-east1,zone=us-east1-b | t  |       | 50 MiB      | 15.14 MiB/s | 33.45 MiB/s |     t
~~~

## See also

- [Use Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %})
- [Backup and Restore Overview]({% link {{ page.version.version }}/backup-and-restore-overview.md %})
- [`CREATE EXTERNAL CONNECTION`]({% link {{ page.version.version }}/create-external-connection.md %})