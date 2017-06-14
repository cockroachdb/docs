---
title: Diagnostics Reporting
summary: Learn about the diagnostic details that get shared with CockroachDB and how to opt out of sharing.
toc: false
---

By default, each node of a CockroachDB cluster shares anonymous usage details with Cockroach Labs on an hourly basis. These details, which are completely scrubbed of identifiable information, greatly help us understand and improve how the system behaves in real-world scenarios.

This page explains the details that get shared and how to opt out of sharing.

{{site.data.alerts.callout_success}}For insights into your cluster's performance and health, use the built-in <a href="explore-the-admin-ui.html">Admin UI</a> or a third-party monitoring tool like <a href="monitor-cockroachdb-with-prometheus.html">Prometheus</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## What Gets Shared

When diagnostics reporting is on, each node of a CockroachDB cluster shares anonymized storage details, SQL table structure details, and SQL query statistics with Cockroach Labs on an hourly basis, as well as crash reports as they occur. Please note that the details that get shared may change over time, but as that happens, we will update this page and announce the changes in release notes.

### Storage Details

Each node of a CockroachDB cluster shares the following storage details on an hourly basis:

Detail | Description
-------|------------
Node ID | The internal ID of the node.
Store ID | The internal ID of each store on the node.
Bytes | The amount of live data used by applications and the CockroachDB system on the node and per store. This excludes historical and deleted data.
Range Count | The number of ranges on the node and per store.
Key Count | The number of keys stored on the node and per store.

#### Example

This JSON example shows what storage details look like when sent to Cockroach Labs, in this case for a node with two stores.

~~~ json
{
   "node":{
      "node_id":1,
      "bytes":64828,
      "key_count":138,
      "range_count":12
   },
   "stores":[
      {
         "node_id":1,
         "store_id":1,
         "bytes":64828,
         "key_count":138,
         "range_count":12
      },
      {
         "node_id":1,
         "store_id":2,
         "bytes":0,
         "key_count":0,
         "range_count":0
      }
   ]
}
~~~

### SQL Table Structure Details

Each node of a CockroachDB cluster shares the following details about the structure of each table stored on the node on an hourly basis:

{{site.data.alerts.callout_info}}No actual table data or table/column names are shared, just metadata about the structure of tables. All names and other string values are scrubbed and replaced with underscores.{{site.data.alerts.end}}

Detail | Description
-------|------------
Table | Metadata about each table, such as its internal ID, when it was last modified, and how many times it has been renamed. Table names are replaced with underscores.
Column | Metadata about each column in a table, such as its internal ID and type. Column names are replaced with underscores.
Column Families | Metadata about [column families](column-families.html) in a table, such as its internal ID and the columns included in the family. Family and column names are replaced with underscores.
Indexes | Metadata about the primary index and any secondary indexes on the table, such as the internal ID of an index and the columns covered by an index. All index, column, and other strings are replaced with underscores.
Privileges | Metadata about user [privileges](privileges.html) on the table, such as the number of privileges granted to each user. Usernames are replaced with underscores.
Checks | Metadata about any [check constraints](check.html) on the table. Check constraint names and expressions are replaced with underscores.

#### Example

This JSON example shows an excerpt of what table structure details look like when sent to Cockroach Labs, in this case for a node with just one table. Note that all names and other strings have been scrubbed and replaced with underscores.

~~~ json
{
   "schema":[
      {
         "name":"_",
         "id":51,
         "parent_id":50,
         "version":1,
         "up_version":false,
         "modification_time":{
            "wall_time":0,
            "logical":0
         },
         "columns":[
            {
               "name":"_",
               "id":1,
               "type":{
                  "kind":1,
                  "width":0,
                  "precision":0
               },
               "nullable":true,
               "default_expr":"_",
               "hidden":false
            },
            ...
         ],
         ...
      }
   ]
}
~~~

### SQL Query Statistics

Each node of a CockroachDB cluster shares the following statistics about the SQL queries it has executed on an hourly basis:

{{site.data.alerts.callout_info}}No query results are shared, just the queries themselves, with all names and other strings scrubbed and replaced with underscores, and statistics about the queries.{{site.data.alerts.end}}

Detail | Description
-------|------------
Query | The query executed. Names and other strings are replaced with underscores.
Counts | The number of times the query was executed, the number of times the query was committed on the first attempt (without retries), and the maximum observed number of times the query was retried automatically.
Last Error | The last error the query encountered.
Rows | The number of rows returned or observed.
Latencies | The amount of time involved in various aspects of the query, for example, the time to parse the query, the time to plan the query, and the time to run the query and fetch/compute results.

#### Example

This JSON example shows an excerpt of what query statistics look like when sent to Cockroach Labs. Note that all names and other strings have been scrubbed from the queries and replaced with underscores.

~~~ json
{
   "sqlstats": {
      "-3750763034362895579": {
         "CREATE DATABASE _": {
            "count": 1,
            "first_attempt_count": 1,
            "max_retries": 0,
            "last_err": "",
            "num_rows": {
               "mean": 0,
               "squared_diffs": 0
            },
            "parse_lat": {
               "mean": 0.00010897,
               "squared_diffs": 0
            },
            "plan_lat": {
               "mean": 0.000011004,
               "squared_diffs": 0
            },
            "run_lat": {
               "mean": 0.002049073,
               "squared_diffs": 0
            },
            "service_lat": {
               "mean": 0.00220478,
               "squared_diffs": 0
            },
            "overhead_lat": {
               "mean": 0.0000357329999999996,
               "squared_diffs": 0
            }
         },
         "INSERT INTO _ VALUES (_)": {
            "count": 10,
            "first_attempt_count": 10,
            "max_retries": 0,
            "last_err": "",
            "num_rows": {
               "mean": 2,
               "squared_diffs": 0
            },
            "parse_lat": {
               "mean": 0.000021831200000000002,
               "squared_diffs": 5.024879776000002e-10
            },
            "plan_lat": {
               "mean": 0.00007221249999999999,
               "squared_diffs": 7.744142312499998e-9
            },
            "run_lat": {
               "mean": 0.0003641647,
               "squared_diffs": 1.0141981141410002e-7
            },
            "service_lat": {
               "mean": 0.00048527110000000004,
               "squared_diffs": 2.195025173849e-7
            },
            "overhead_lat": {
               "mean": 0.00002706270000000002,
               "squared_diffs": 2.347266118100001e-9
            }
         },
         ...
      }
   }
}
~~~

## Opt Out of Diagnostics Reporting

### At Cluster Initialization

To make sure that absolutely no diagnostic details are shared, you can set the environment variable `COCKROACH_SKIP_ENABLING_DIAGNOSTIC_REPORTING=true` before starting the first node of the cluster. Note that this works only when set before starting the first node of the cluster. Once the cluster is running, you need to use the `SET` method described below.

### After Cluster Initialization

To stop sending diagnostic details to Cockroach Labs once a cluster is running, [use the built-in SQL client](use-the-built-in-sql-client.html) to execute the following [`SET CLUSTER SETTING`](set-cluster-setting.html) statement, which switches the `diagnostics.reporting.enabled` [cluster setting](cluster-settings.html) to `false`:

~~~ sql
> SET CLUSTER SETTING diagnostics.reporting.enabled = false;
~~~

This change will not be instantaneous, as it must be propagated to other nodes in the cluster.

## Check the State of Diagnostics Reporting

To check the state of diagnostics reporting, [use the built-in SQL client](use-the-built-in-sql-client.html) to execute the following [`SHOW CLUSTER SETTING`](show-cluster-setting.html) statement:

~~~ sql
> SHOW CLUSTER SETTING diagnostics.reporting.enabled;
~~~

~~~
+-------------------------------+
| diagnostics.reporting.enabled |
+-------------------------------+
| false                         |
+-------------------------------+
(1 row)
~~~

If the setting is `false`, diagnostics reporting is off; if the setting is `true`, diagnostics reporting is on.

## See Also

- [Cluster Settings](cluster-settings.html)
- [Start a Node](start-a-node.html)
