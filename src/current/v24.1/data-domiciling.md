---
title: Data Domiciling with CockroachDB
summary: Learn how to use CockroachDB's multi-region SQL capabilities and the ALTER DATABASE ... ADD SUPER REGION statement as part of your data domiciling approach
toc: true
docs_area: deploy
---

As you scale your usage of [multi-region clusters]({% link {{ page.version.version }}/multiregion-overview.md %}), you may need to keep certain subsets of data in specific localities. Keeping specific data on servers in specific geographic locations is also known as _data domiciling_.

CockroachDB has basic support for data domiciling in multi-region clusters using the [`ALTER DATABASE ... ADD SUPER REGION`]({% link {{ page.version.version }}/alter-database.md %}#add-super-region) statement.

{{site.data.alerts.callout_danger}}
Using CockroachDB as part of your approach to data domiciling has several limitations. For more information, see [Known limitations](#known-limitations).
{{site.data.alerts.end}}

## Overview

This page has instructions for data domiciling in [multi-region clusters]({% link {{ page.version.version }}/multiregion-overview.md %}). At a high level, this process involves:

1. Controlling the placement of specific row or table data using regional tables with the [`REGIONAL BY ROW`]({% link {{ page.version.version }}/table-localities.md %}#regional-by-row-tables) and [`REGIONAL BY TABLE`]({% link {{ page.version.version }}/table-localities.md %}#regional-tables) clauses.
1. Further restricting where the data in those regional tables is stored using the [`ALTER DATABASE ... ADD SUPER REGION`]({% link {{ page.version.version }}/alter-database.md %}#add-super-region), which creates a set of [database regions]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions) such that [regional tables]({% link {{ page.version.version }}/table-localities.md %}#regional-tables) and [regional by row tables]({% link {{ page.version.version }}/table-localities.md %}#regional-by-row-tables) whose [home regions]({% link {{ page.version.version }}/table-localities.md %}) are in the super region will have all of their [replicas]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-replica) stored _only_ in regions that are members of the super region. For more information, see [Super regions]({% link {{ page.version.version }}/multiregion-overview.md %}#super-regions).

{{site.data.alerts.callout_info}}
An alternative method to the [`ALTER DATABASE ... ADD SUPER REGION`]({% link {{ page.version.version }}/alter-database.md %}#add-super-region) statement is to use the [`ALTER DATABASE ... PLACEMENT RESTRICTED`]({% link {{ page.version.version }}/alter-database.md %}#placement) statement. 

**`PLACEMENT RESTRICTED` is not recommended, and is documented for backwards compatibility. Most users should use `ADD SUPER REGION`, which allows for region survival as well as providing data placement.**
{{site.data.alerts.end}}

## Before you begin

This page assumes you are already familiar with:

- CockroachDB's [multi-region SQL abstractions]({% link {{ page.version.version }}/multiregion-overview.md %}). If you are not using them, the instructions on this page will not apply.
- The fact that CockroachDB stores your data in [a distributed key-value store, which is split into chunks called ranges]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#overview).

## Example

In the following example, you will go through the process of configuring the [MovR]({% link {{ page.version.version }}/movr.md %}) data set using [multi-region SQL statements]({% link {{ page.version.version }}/multiregion-overview.md %}). 

Then, as part of implementing a data domiciling strategy, you will apply restricted replica settings in [Step 4](#step-4-apply-stricter-replica-placement-settings) using the [`ALTER DATABASE ... ADD SUPER REGION`]({% link {{ page.version.version }}/alter-database.md %}#add-super-region): It works with databases with [zone survival goals]({% link {{ page.version.version }}/multiregion-survival-goals.md %}#survive-zone-failures) or [region survival goals]({% link {{ page.version.version }}/multiregion-survival-goals.md %}#survive-region-failures). If you need region survival goals, you must use [super regions]({% link {{ page.version.version }}/multiregion-overview.md %}#super-regions).

Finally, you will verify that the resulting replica placements are as expected using the [critical nodes status endpoint](monitoring-and-alerting.html#critical-nodes-endpoint).

For the purposes of this example, the data domiciling requirement is to configure a multi-region deployment of the [MovR database]({% link {{ page.version.version }}/movr.md %}) such that data for EU-based users, vehicles, etc. is being stored on CockroachDB nodes running in EU localities.

### Step 1. Start a simulated multi-region cluster

Use the following [`cockroach demo`](cockroach-demo.html) command to start the cluster. This particular combination of flags results in a demo cluster of 9 nodes, with 3 nodes in each region. It sets the appropriate [node localities](cockroach-start.html#locality) and also simulates the network latency that would occur between nodes in these localities. For more information about each flag, see the [`cockroach demo`](cockroach-demo.html#flags) documentation, especially for [`--global`](cockroach-demo.html#global-flag).

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach demo --global --nodes 9
~~~

When the cluster starts, you'll see a message like the one shown below, followed by a SQL prompt. Note the URLs for:

- Viewing the [DB Console](ui-overview.html): `http://127.0.0.1:8080/demologin?password=demo30570&username=demo`.
- Connecting to the database from a [SQL shell](cockroach-sql.html) or a [programming language](connect-to-the-database.html): `postgresql://demo:demo30570@127.0.0.1:26257/movr?sslmode=require&sslrootcert=%2FUsers%2Frloveland%2F.cockroach-demo%2Fca.crt`.

~~~
# Welcome to the CockroachDB demo database!
#
# You are connected to a temporary, in-memory CockroachDB cluster of 9 nodes.
# Communication between nodes will simulate real world latencies.
#
# WARNING: the use of --global is experimental. Some features may not work as expected.
#
# This demo session will send telemetry to Cockroach Labs in the background.
# To disable this behavior, set the environment variable
# COCKROACH_SKIP_ENABLING_DIAGNOSTIC_REPORTING=true.
#
# Beginning initialization of the movr dataset, please wait...
#
# The cluster has been preloaded with the "movr" dataset
# (MovR is a fictional vehicle sharing company).
#
# Reminder: your changes to data stored in the demo session will not be saved!
#
# If you wish to access this demo cluster using another tool, you will need
# the following details:
#
#   - Connection parameters:
#      (webui)    http://127.0.0.1:8080/demologin?password=demo30570&username=demo
#      (cli)      cockroach sql --certs-dir=/Users/rloveland/.cockroach-demo -u demo -d movr
#      (sql)      postgresql://demo:demo30570@127.0.0.1:26257/movr?sslmode=require&sslrootcert=%2FUsers%2Frloveland%2F.cockroach-demo%2Fca.crt
#
#   To display connection parameters for other nodes, use \demo ls.
#   - Username: "demo", password: "demo30570"
#   - Directory with certificate files (for certain SQL drivers/tools): /Users/rloveland/.cockroach-demo
#
# You can enter \info to print these details again.
#
# Server version: CockroachDB CCL v23.1.2 (x86_64-apple-darwin19, built 2023/05/25 16:10:39, go1.19.4) (same version as client)
# Cluster ID: 21c6756f-7e7e-4990-863a-cbd99e6f737a
# Organization: Cockroach Demo
#
# Enter \? for a brief introduction.
~~~

You now have a cluster running across 9 nodes, with 3 nodes each in the following regions:

- `us-east1`
- `us-west1`
- `europe-west1`

You can verify this using the [`SHOW REGIONS`]({% link {{ page.version.version }}/show-regions.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW REGIONS;
~~~

~~~
     region    |  zones  | database_names | primary_region_of | secondary_region_of
---------------+---------+----------------+-------------------+----------------------
  europe-west1 | {b,c,d} | {}             | {}                | {}
  us-east1     | {b,c,d} | {}             | {}                | {}
  us-west1     | {a,b,c} | {}             | {}                | {}
(3 rows)
~~~

### Step 2. Apply multi-region SQL abstractions

Execute the following statements to set the [database regions]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions). This information is necessary so that CockroachDB can later move data around to optimize access to particular data from particular regions.

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr PRIMARY REGION "europe-west1";
ALTER DATABASE movr ADD REGION "us-east1";
ALTER DATABASE movr ADD REGION "us-west1";
~~~

{% include {{page.version.version}}/sql/multiregion-movr-global.md %}

{% include {{page.version.version}}/sql/multiregion-movr-regional-by-row.md %}

### Step 3. View noncompliant replicas

Next, check the [critical nodes status endpoint](monitoring-and-alerting.html#critical-nodes-endpoint) to see which ranges are still not in compliance with your desired domiciling: that data on EU-based entities (users, etc.) does not leave EU-based nodes.

On a small demo cluster like this one, the data movement from the previous step should finish quickly; on larger clusters, the rebalancing process may take longer. For more information about the performance considerations of rebalancing data in multi-region clusters, see [Performance considerations](migrate-to-multiregion-sql.html#performance-considerations).

With the default settings, you should expect some replicas in the cluster to be violating this constraint. Those replicas will appear in the `violatingConstraints` field of the output. 

This is because [non-voting replicas](architecture/replication-layer.html#non-voting-replicas) are enabled by default in [multi-region clusters](multiregion-overview.html) to enable stale reads of data in [regional tables](regional-tables.html) from outside those tables' [home regions](multiregion-overview.html#table-localities). For many use cases, this is preferred, but it keeps you from meeting the domiciling requirements for this example.

In order to check the critical nodes status endpoint you first need to get an authentication cookie. To get an authentication cookie, run the [`cockroach auth-session login`]({% link {{ page.version.version }}/cockroach-auth-session.md %}#log-in-to-the-http-interface) command:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach auth-session login demo --certs-dir=/Users/rloveland/.cockroach-demo
~~~

It should return output like the following:

~~~
  username |     session ID     |                       authentication cookie
-----------+--------------------+---------------------------------------------------------------------
  demo     | 893413786777878529 | session=CIGA9sfJ5Yy0DBIQ4mlvKAxivkm9bq0or4h3AQ==; Path=/; HttpOnly
(1 row)
#
# Example uses:
#
#     curl [-k] --cookie 'session=CIGA9sfJ5Yy0DBIQ4mlvKAxivkm9bq0or4h3AQ==; Path=/; HttpOnly' https://...
#
#     wget [--no-check-certificate] --header='Cookie: session=CIGA9sfJ5Yy0DBIQ4mlvKAxivkm9bq0or4h3AQ==; Path=/; HttpOnly' https://...
#
~~~

Using the output above, we can craft a `curl` invocation to call the critical nodes status endpoint:

{% include_cached copy-clipboard.html %}
~~~ shell
curl -X POST --cookie 'session=CIGA9sfJ5Yy0DBIQ4mlvKAxivkm9bq0or4h3AQ==; Path=/; HttpOnly' http://localhost:8080/_status/critical_nodes
~~~

~~~ json
{
  "criticalNodes": [
  ],
  "report": {
    "underReplicated": [
    ],
    "overReplicated": [
    ],
    "violatingConstraints": [
      {
        "rangeDescriptor": {
          "rangeId": "93",
          "startKey": "840SwAAB",
          "endKey": "840SwAAC",
          "internalReplicas": [
            {
              "nodeId": 8,
              "storeId": 8,
              "replicaId": 1,
              "type": 0
            },
            {
              "nodeId": 7,
              "storeId": 7,
              "replicaId": 2,
              "type": 0
            },
            {
              "nodeId": 1,
              "storeId": 1,
              "replicaId": 6,
              "type": 0
            },
            {
              "nodeId": 3,
              "storeId": 3,
              "replicaId": 4,
              "type": 5
            },
            {
              "nodeId": 6,
              "storeId": 6,
              "replicaId": 5,
              "type": 5
            }
          ],
          "nextReplicaId": 7,
          "generation": "60",
          "stickyBit": {
            "wallTime": "0",
            "logical": 0,
            "synthetic": false
          }
        },
        "config": {
          "rangeMinBytes": "134217728",
          "rangeMaxBytes": "536870912",
          "gcPolicy": {
            "ttlSeconds": 14400,
            "protectionPolicies": [
            ],
            "ignoreStrictEnforcement": false
          },
          "globalReads": false,
          "numReplicas": 5,
          "numVoters": 3,
          "constraints": [
            {
              "numReplicas": 1,
              "constraints": [
                {
                  "type": 0,
                  "key": "region",
                  "value": "europe-west1"
                }
              ]
            },
            {
              "numReplicas": 1,
              "constraints": [
                {
                  "type": 0,
                  "key": "region",
                  "value": "us-east1"
                }
              ]
            },
            {
              "numReplicas": 1,
              "constraints": [
                {
                  "type": 0,
                  "key": "region",
                  "value": "us-west1"
                }
              ]
            }
          ],
          "voterConstraints": [
            {
              "numReplicas": 0,
              "constraints": [
                {
                  "type": 0,
                  "key": "region",
                  "value": "us-east1"
                }
              ]
            }
          ],
          "leasePreferences": [
            {
              "constraints": [
                {
                  "type": 0,
                  "key": "region",
                  "value": "us-east1"
                }
              ]
            }
          ],
          "rangefeedEnabled": false,
          "excludeDataFromBackup": false
        }
      },
    ...
    ],
    "unavailable": [
    ],
    "unavailableNodeIds": [
    ]
  }
}
~~~

Based on this output, you can see that several replicas are out of compliance for the reason described above: the presence of non-voting replicas in other regions to enable fast stale reads from those regions.

To get more information about the ranges that are out of compliance, you can use a [`SHOW RANGES`](show-ranges.html) SQL statement like the one below.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM [SHOW RANGES FROM DATABASE movr] WHERE range_id = 93;
~~~

~~~
       start_key      |            end_key            | range_id |  replicas   |                                                      replica_localities                                                      | voting_replicas | non_voting_replicas | learner_replicas | split_enforced_until
----------------------+-------------------------------+----------+-------------+------------------------------------------------------------------------------------------------------------------------------+-----------------+---------------------+------------------+-----------------------
  /Table/107/5/"\xc0" | /Table/107/5/"\xc0"/PrefixEnd |       93 | {1,3,6,7,8} | {"region=us-east1,az=b","region=us-east1,az=d","region=us-west1,az=c","region=europe-west1,az=b","region=europe-west1,az=c"} | {8,7,1}         | {3,6}               | {}               | NULL
(1 row)
~~~

### Step 4. Apply stricter replica placement settings

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="super-region"><strong>(Recommended)</strong> Use <code>ADD SUPER REGION</code></button>
  <button class="filter-button page-level" data-scope="placement-restricted"><strong>(Not recommended)</strong> Use <code>PLACEMENT RESTRICTED</code></button>
</div>

<div class="filter-content" markdown="1" data-scope="super-region">

To ensure that data on EU-based users, vehicles, etc. from [`REGIONAL BY ROW` tables]({% link {{ page.version.version }}/regional-tables.md %}#regional-by-row-tables) is stored only on EU-based nodes in the cluster, you can use [Super regions]({% link {{ page.version.version }}/multiregion-overview.md %}#super-regions). This will ensure that [regional tables]({% link {{ page.version.version }}/table-localities.md %}#regional-tables) and [regional by row tables]({% link {{ page.version.version }}/table-localities.md %}#regional-by-row-tables) whose [home regions]({% link {{ page.version.version }}/table-localities.md %}) are in the super region will have all of their [replicas]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-replica) stored _only_ in regions that are members of the super region.

To use this statement, you must set the `enable_super_regions` [session setting]({% link {{ page.version.version }}/set-vars.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER ROLE ALL SET enable_super_regions = on;
~~~

Next, use the [`ALTER DATABASE ... ADD SUPER REGION`]({% link {{ page.version.version }}/alter-database.md %}#add-super-region) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr ADD SUPER REGION "europe" VALUES "europe-west1";
~~~

You have now created a super region with only one region. The updated replica placement settings should start to apply immediately.

{{site.data.alerts.callout_info}}
[`ALTER DATABASE ... ADD SUPER REGION`]({% link {{ page.version.version }}/alter-database.md %}#add-super-region) does not affect the replica placement for [global tables]({% link {{ page.version.version }}/global-tables.md %}), which are designed to provide fast, up-to-date reads from all [database regions]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions).
{{site.data.alerts.end}}

</div>

<div class="filter-content" markdown="1" data-scope="placement-restricted">

**This method is not recommended, and is documented for backwards compatibility. Most users should use `ALTER DATABASE ... ADD SUPER REGION` which allows for region survival as well as providing data placement.**

To ensure that data on EU-based users, vehicles, etc. from [`REGIONAL BY ROW` tables]({% link {{ page.version.version }}/regional-tables.md %}#regional-by-row-tables) is stored only on EU-based nodes in the cluster, you must disable the use of [non-voting replicas]({% link {{ page.version.version }}/architecture/replication-layer.md %}#non-voting-replicas) on all of the [regional tables]({% link {{ page.version.version }}/regional-tables.md %}) in this database. You can do this using the [`ALTER DATABASE ... PLACEMENT RESTRICTED`]({% link {{ page.version.version }}/alter-database.md %}#placement) statement.

To use this statement, you must set the `enable_multiregion_placement_policy` [session setting]({% link {{ page.version.version }}/set-vars.md %}) or the `sql.defaults.multiregion_placement_policy.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
SET enable_multiregion_placement_policy=on;
~~~

Next, use the [`ALTER DATABASE ... PLACEMENT RESTRICTED`]({% link {{ page.version.version }}/alter-database.md %}#placement) statement to disable non-voting replicas for regional tables:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr PLACEMENT RESTRICTED;
~~~

The restricted replica placement settings should start to apply immediately.

{% include {{page.version.version}}/sql/super-regions-for-domiciling-with-region-survivability.md %}

{{site.data.alerts.callout_info}}
[`ALTER DATABASE ... PLACEMENT RESTRICTED`]({% link {{ page.version.version }}/alter-database.md %}#placement) does not affect the replica placement for [global tables]({% link {{ page.version.version }}/global-tables.md %}), which are designed to provide fast, up-to-date reads from all [database regions]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions).
{{site.data.alerts.end}}

{% include {{page.version.version}}/sql/sql-defaults-cluster-settings-deprecation-notice.md %}

</div>

### Step 5. Verify updated replica placement

Now that you have restricted the placement of non-voting replicas for all [regional tables](regional-tables.html), you can check the [critical nodes status endpoint](monitoring-and-alerting.html#critical-nodes-endpoint) to see the effects. In a few seconds, you should see that the `violatingConstraints` key in the JSON response shows that there are no longer any replicas violating their constraints:

{% include_cached copy-clipboard.html %}
~~~ shell
curl -X POST http://localhost:8080/_status/critical_nodes
~~~

~~~ json
{
  "criticalNodes": [
  ],
  "report": {
    "underReplicated": [
    ],
    "overReplicated": [
    ],
    "violatingConstraints": [
    ],
    "unavailable": [
    ],
    "unavailableNodeIds": [
    ]
  }
}
~~~

The output above shows that there are no replicas that do not meet the data domiciling goal. As described above, [`ALTER DATABASE ... PLACEMENT RESTRICTED`](alter-database.html#placement) does not affect the replica placement for [`GLOBAL` tables](global-tables.html), so these replicas are considered to be in compliance.

Now that you have verified that the system is configured to meet the domiciling requirement, it's a good idea to check the [critical nodes status endpoint](monitoring-and-alerting.html#critical-nodes-endpoint) on a regular basis (via automation of some kind) to ensure that the requirement continues to be met.

{{site.data.alerts.callout_info}}
The steps above are necessary but not sufficient to accomplish a data domiciling solution using CockroachDB. Be sure to review the [limitations of CockroachDB for data domiciling](#known-limitations) and design your total solution with those limitations in mind.
{{site.data.alerts.end}}

## Known limitations

Using CockroachDB as part of your approach to data domiciling has several limitations:

{% include {{ page.version.version }}/known-limitations/data-domiciling-limitations.md %}

## See also

- [How to Choose a Multi-region Configuration]({% link {{ page.version.version }}/choosing-a-multi-region-configuration.md %})
- [Migrate to Multi-Region SQL]({% link {{ page.version.version }}/migrate-to-multiregion-sql.md %})
- [Multi-Region Overview]({% link {{ page.version.version }}/multiregion-overview.md %})
- [Low Latency Reads and Writes in a Multi-Region Cluster]({% link {{ page.version.version }}/demo-low-latency-multi-region-deployment.md %})
- [Multi-Region Capabilities Overview]({% link {{ page.version.version }}/multiregion-overview.md %})
- [Reads and Writes in CockroachDB]({% link {{ page.version.version }}/architecture/reads-and-writes-overview.md %})
- [When to Use `REGIONAL` vs. `GLOBAL` Tables]({% link {{ page.version.version }}/table-localities.md %}#when-to-use-regional-vs-global-tables)
- [When to Use `ZONE` vs. `REGION` Survival Goals]({% link {{ page.version.version }}/multiregion-survival-goals.md %}#when-to-use-zone-vs-region-survival-goals)
- [`ADD REGION`]({% link {{ page.version.version }}/alter-database.md %}#add-region)
- [Secondary regions]({% link {{ page.version.version }}/multiregion-overview.md %}#secondary-regions)
- [Zone Config Extensions]({% link {{ page.version.version }}/zone-config-extensions.md %})
- [`ALTER DATABASE ... SET SECONDARY REGION`]({% link {{ page.version.version }}/alter-database.md %}#set-secondary-region)
- [`ALTER DATABASE ... DROP SECONDARY REGION`]({% link {{ page.version.version }}/alter-database.md %}#drop-secondary-region)
