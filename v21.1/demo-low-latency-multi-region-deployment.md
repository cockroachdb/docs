---
title: Low Latency Reads and Writes in a Multi-Region Cluster
summary: Use data topologies to get low-latency reads and writes in a multi-region CockroachDB cluster.
toc: true
toc_not_nested: true
redirect_from: demo-geo-partitioning.html
key: demo-geo-partitioning.html
---

<span class="version-tag">New in v21.1:</span> CockroachDB has improved multi-region capabilities that make it easier to run global applications. For an overview of these capabilities, see the [Multi-region Overview](multiregion-overview.html).

In multi-region clusters, the distribution of data becomes a performance consideration. This makes it important to think about the [survival goals](multiregion-overview.html#survival-goals) of each database. Then, for each table in the database, use the right [table locality](multiregion-overview.html#table-locality) to locate data for optimal performance.

In this tutorial, you will:

1. Simulate a multi-region CockroachDB cluster on your local machine.
1. Run a workload on the cluster using our fictional vehicle-sharing application called [MovR](movr.html).
1. See the effects of network latency on SQL query performance in the default (non-multi-region) configuration.
1. Configure the cluster for good multi-region performance by issuing SQL statements that choose the right [survival goals](multiregion-overview.html#survival-goals) and [table localities](multiregion-overview.html#table-locality).

## Considerations

This page describes a demo cluster; it does not show best practices for a production deployment. For more information about production deployments of multi-region applications, see [Orchestrate CockroachDB Across Multiple Kubernetes Clusters](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html) and the [Production Checklist](recommended-production-settings.html).

Because the instructions on this page describe how to simulate a multi-region cluster on a single machine, the absolute performance numbers described below are not reflective of [the performance you can expect of single-point reads and writes against CockroachDB in a production setting](frequently-asked-questions.html#single-row-perf). Instead, the instructions are designed with the following goals:

- To show the _relative_ magnitude of the performance improvements to expect when you configure a multi-region cluster correctly.
- To be as easy to try as possible with minimal configuration and setup.

## Prerequisites

- [A basic understanding of the MovR application](#a-basic-understanding-of-the-movr-application)
- [Docker](https://www.docker.com) installed on the local machine

### A basic understanding of the MovR application

The workload you'll run against the cluster is our open-source, fictional, peer-to-peer vehicle-sharing app, [MovR](movr.html). Each instance represents users in a specific region:

- `europe-west1`, covering the cities of Amsterdam, Paris, and Rome.
- `us-east1`, covering the cities of New York, Boston, and Washington, D.C.
- `us-west1`, covering the cities of Los Angeles, San Francisco, and Seattle.

#### The MovR schema

{% include {{ page.version.version }}/misc/movr-schema.md %}

All of the tables except `promo_codes` have a composite primary key of `city` and `id`, in that order. This means that the rows in these tables are ordered by their geography. These tables are read from and written to very frequently. To keep read and write latency low, you'll use the [Regional table locality pattern](multiregion-overview.html#regional-by-row-tables) for these tables.

The data in the `promo_codes` table is different: it is not tied to geography, and it is rarely updated. This type of table is often referred to as a "reference table" or "lookup table". In this case, you'll use the [Global table locality pattern](multiregion-overview.html#global-tables) to keep read latencies low.

For a description of the sequence of SQL statements issued by the MovR application in response to user actions, see [How the MovR application works](movr.html#how-the-movr-application-works).

## Step 1. Simulate a multi-region cluster on your local machine

{% include {{page.version.version}}/sql/start-a-multi-region-demo-cluster.md %}

To verify that the simulated latencies are working as expected, check the [Network Latency Page](ui-network-latency-page.html) in the DB Console. Round trip times between  `us-west1` and `europe-west1` should be in the 150 ms range.

## Step 2. Determine which nodes are in which regions

To determine which nodes are in which regions, you will need to refer to two (2) things:

1. The output of the `\demo ls` from the SQL shell, which shows the TCP ports on the local machine that we will connect to from the MovR application.
1. The node IDs shown on the **Network Latency Page**.

Here is the output of `\demo ls` from the SQL shell.

{% include copy-clipboard.html %}
~~~ sql
> \demo ls
~~~

~~~
node 1:
  (console) http://127.0.0.1:8080
  (sql)     postgres://root:unused@?host=%2Fvar%2Ffolders%2Fbh%2F_32m6zhj67z534slcg79nm_w0000gp%2FT%2Fdemo731561476&port=26257
  (sql/tcp) postgres://root@127.0.0.1:26257?sslmode=disable

node 8:
  (console) http://127.0.0.1:8081
  (sql)     postgres://root:unused@?host=%2Fvar%2Ffolders%2Fbh%2F_32m6zhj67z534slcg79nm_w0000gp%2FT%2Fdemo731561476&port=26264
  (sql/tcp) postgres://root@127.0.0.1:26258?sslmode=disable

node 3:
  (console) http://127.0.0.1:8082
  (sql)     postgres://root:unused@?host=%2Fvar%2Ffolders%2Fbh%2F_32m6zhj67z534slcg79nm_w0000gp%2FT%2Fdemo731561476&port=26259
  (sql/tcp) postgres://root@127.0.0.1:26259?sslmode=disable

node 6:
  (console) http://127.0.0.1:8083
  (sql)     postgres://root:unused@?host=%2Fvar%2Ffolders%2Fbh%2F_32m6zhj67z534slcg79nm_w0000gp%2FT%2Fdemo731561476&port=26262
  (sql/tcp) postgres://root@127.0.0.1:26260?sslmode=disable

node 9:
  (console) http://127.0.0.1:8084
  (sql)     postgres://root:unused@?host=%2Fvar%2Ffolders%2Fbh%2F_32m6zhj67z534slcg79nm_w0000gp%2FT%2Fdemo731561476&port=26265
  (sql/tcp) postgres://root@127.0.0.1:26261?sslmode=disable

node 4:
  (console) http://127.0.0.1:8085
  (sql)     postgres://root:unused@?host=%2Fvar%2Ffolders%2Fbh%2F_32m6zhj67z534slcg79nm_w0000gp%2FT%2Fdemo731561476&port=26260
  (sql/tcp) postgres://root@127.0.0.1:26262?sslmode=disable

node 2:
  (console) http://127.0.0.1:8086
  (sql)     postgres://root:unused@?host=%2Fvar%2Ffolders%2Fbh%2F_32m6zhj67z534slcg79nm_w0000gp%2FT%2Fdemo731561476&port=26258
  (sql/tcp) postgres://root@127.0.0.1:26263?sslmode=disable

node 5:
  (console) http://127.0.0.1:8087
  (sql)     postgres://root:unused@?host=%2Fvar%2Ffolders%2Fbh%2F_32m6zhj67z534slcg79nm_w0000gp%2FT%2Fdemo731561476&port=26261
  (sql/tcp) postgres://root@127.0.0.1:26264?sslmode=disable

node 7:
  (console) http://127.0.0.1:8088
  (sql)     postgres://root:unused@?host=%2Fvar%2Ffolders%2Fbh%2F_32m6zhj67z534slcg79nm_w0000gp%2FT%2Fdemo731561476&port=26263
  (sql/tcp) postgres://root@127.0.0.1:26265?sslmode=disable
~~~

And here is the view on the **Network Latency Page**, which shows which nodes are in which cluster regions:

<img src="{{ 'images/v21.1/geo-partitioning-network-latency.png' | relative_url }}" alt="Geo-partitioning network latency" style="max-width:100%" />

You can see by referring back and forth between `\demo ls` and the **Network Latency Page** that the cluster has the following region/node/port correspondences, which we can use to determine how to connect MovR from various regions:

| Node ID | Region       | Port on localhost |
|---------+--------------+-------------------|
| N2      | europe-west1 |             26263 |
| N5      | europe-west1 |             26264 |
| N7      | europe-west1 |             26265 |
| N4      | us-west1     |             26262 |
| N6      | us-west1     |             26260 |
| N9      | us-west1     |             26261 |
| N1      | us-east1     |             26257 |
| N3      | us-east1     |             26259 |
| N8      | us-east1     |             26258 |

## Step 3. Load and run MovR

Follow the steps below to start 3 instances of MovR. Each instance is pointed at a node in a different region. This will simulate load from that region.

1. In the SQL shell, create the `movr` database:

    {% include copy-clipboard.html %}
    ~~~ sql
    CREATE DATABASE movr;
    ~~~

1. Open a second terminal and run the command below to populate the MovR data set. The options are mostly self-explanatory. We limit the application to 1 thread because using multiple threads quickly overloads this small demo cluster's ability to ingest data. As a result, loading the data takes about 90 seconds on a fast laptop.

    {% include copy-clipboard.html %}
    ~~~ shell
        docker run -it --rm cockroachdb/movr:20.11.1 \
            --app-name "movr-load" \
            --url "postgres://root@docker.for.mac.localhost:26257/movr?sslmode=disable" \
            --num-threads 1 \
            load \
            --num-users 100 \
            --num-rides 100 \
            --num-vehicles 10 \
            --city "boston" \
            --city "new york" \
            --city "washington dc" \
            --city="amsterdam" \
            --city="paris" \
            --city="rome" \
            --city="los angeles" \
            --city="san francisco" \
            --city="seattle"
    ~~~

    ~~~ 
    [INFO] (MainThread) connected to movr database @ postgres://root@docker.for.mac.localhost:26257/movr?sslmode=disable
    [INFO] (MainThread) Loading single region MovR
    [INFO] (MainThread) initializing tables
    [INFO] (MainThread) loading cities ['boston', 'new york', 'washington dc', 'amsterdam', 'paris', 'rome', 'los angeles', 'san francisco', 'seattle']
    [INFO] (MainThread) loading movr data with ~100 users, ~10 vehicles, ~100 rides, ~1000 histories, and ~1000 promo codes
    [INFO] (Thread-1  ) Generating user data for boston...
    ... output snipped ...
    [INFO] (Thread-1  ) Generating 1000 promo codes...
    [INFO] (MainThread) populated 9 cities in 86.986230 seconds
    ~~~

1. In the same terminal window, run the following command:

    {% include copy-clipboard.html %}
    ~~~ shell
    docker run -it --rm cockroachdb/movr:20.11.1 \
        --app-name "movr-us-east" \
        --url "postgres://root@docker.for.mac.localhost:26257/movr?sslmode=disable" \
        run \
        --city="boston" \
        --city="new york" \
        --city="washington dc"
    ~~~

    ~~~
    [INFO] (MainThread) connected to movr database @ postgres://root@docker.for.mac.localhost:26257/movr?sslmode=disable
    [INFO] (MainThread) simulating movr load for cities ['boston', 'new york', 'washington dc']
    [INFO] (MainThread) warming up....
    [INFO] (MainThread) running single region queries...
    ...
    ~~~

1. Open a third terminal and run the following command:

    {% include copy-clipboard.html %}
    ~~~ shell
    docker run -it --rm cockroachdb/movr:20.11.1 \
        --app-name "movr-us-west" \
        --url "postgres://root@docker.for.mac.localhost:26260/movr?sslmode=disable" \
        run \
        --city="los angeles" \
        --city="san francisco" \
        --city="seattle"
    ~~~

    ~~~
    [INFO] (MainThread) connected to movr database @ postgres://root@docker.for.mac.localhost:26260/movr?sslmode=disable
    [INFO] (MainThread) simulating movr load for cities ['los angeles', 'san francisco', 'seattle']
    [INFO] (MainThread) warming up....
    [INFO] (MainThread) running single region queries...
    ~~~

1. In the same terminal, run the following command:

    {% include copy-clipboard.html %}
    ~~~ shell
    docker run -it --rm cockroachdb/movr:20.11.1 \
       --app-name "movr-eu-west" \
       --url "postgres://root@docker.for.mac.localhost:26264/movr?sslmode=disable" \
       run \
       --city="amsterdam" \
       --city="paris" \
       --city="rome"
    ~~~

    ~~~
    [INFO] (MainThread) connected to movr database @ postgres://root@docker.for.mac.localhost:26264/movr?sslmode=disable
    [INFO] (MainThread) simulating movr load for cities ['amsterdam', 'paris', 'rome']
    [INFO] (MainThread) warming up....
    [INFO] (MainThread) running single region queries...
    ...
    ~~~

## Step 4. Check latencies in the DB Console

Now that you have load hitting the cluster from different regions, let's see how the service latencies look before we do any multi-region configuration from SQL. This is the "before" case in the "before and after".

In the [DB Console](admin-ui-overview.html) at <a data-proofer-ignore href="http://127.0.0.1:8080">http://127.0.0.1:8080</a>, click [**Metrics**](ui-overview-dashboard.html) on the left and hover over the [**Service Latency: SQL, 99th percentile**](ui-overview-dashboard.html#service-latency-sql-99th-percentile) timeseries graph. You should see the effects of network latency on this workload. 

<img src="{{ 'images/v21.1/geo-partitioning-sql-latency-before.png' | relative_url }}" alt="Geo-partitioning SQL latency" style="max-width:100%" />

For each of the 3 nodes that we are pointing the movr workload at, the max latency of 99% of queries are in the 1-2 seconds range.

The SQL latency is high because of the network latency between regions.

To see the network latency between any two nodes in the cluster, click [**Network Latency**](ui-network-latency-page.html) in the left-hand navigation.

<img src="{{ 'images/v21.1/geo-partitioning-network-latency.png' | relative_url }}" alt="Geo-partitioning network latency" style="max-width:100%" />

Within a single region, round-trip latency is under 6 ms (milliseconds). Across regions, round-trip latency is significantly higher. 

For example:

- Round-trip latency between **N2** in `europe-west1` and **N3** in `us-east1` is  87 ms.
- Round-trip latency between **N2** in `europe-west1` and **N4** in `us-west1` is 196 ms.

## Step 5. Execute multi-region SQL statements

The SQL statements described below will tell CockroachDB about:

- [The database's available regions](#configure-database-regions).
- [Which data should be optimized for access from which region](#configure-table-localities).

This information is necessary so that CockroachDB can move data around to optimize access to particular data from particular regions. The main focus is reducing latency in a global deployment. For more information about how this works at a high level, see the [Multi-Region Overview](multiregion-overview.html).

{{site.data.alerts.callout_info}}
The `ALTER` statements described below will take some seconds to run, since the cluster is under load.
{{site.data.alerts.end}}

### Configure database regions

Back in the SQL shell, switch to the `movr` database:

{% include copy-clipboard.html %}
~~~ sql
USE movr;
~~~

Execute the following statements. They will tell CockroachDB about the database's regions. This information is necessary so that CockroachDB can later move data around to optimize access to particular data from particular regions. For more information about how this works at a high level, see [Database Regions](multiregion-overview.html#database-regions).

{% include copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr PRIMARY REGION "us-east1";
ALTER DATABASE movr ADD REGION "europe-west1";
ALTER DATABASE movr ADD REGION "us-west1";
~~~

### Configure table localities

#### Configure GLOBAL tables

As mentioned earlier, all of the tables except `promo_codes` are geographically specific. Because the data in `promo_codes` is not updated frequently (a.k.a. "read-mostly"), and needs to be available from any region, we choose the [`GLOBAL` table locality](multiregion-overview.html#global-tables).

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE promo_codes SET locality GLOBAL;
~~~

Next, alter the `user_promo_codes` table to have a foreign key into the `promo_codes` table. This step is necessary to modify the MovR schema design to take full advantage of the multi-region features in v21.1+.

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE user_promo_codes ADD CONSTRAINT user_promo_codes_code_fk FOREIGN KEY (code) REFERENCES promo_codes (code) ON UPDATE CASCADE;
~~~

#### Configure REGIONAL BY ROW tables

All of the tables except `promo_codes` are geographically specific, and updated very frequently. For these tables, the right table locality setting for optimizing access to their data is the [`REGIONAL BY ROW` table locality](multiregion-overview.html#regional-by-row-tables).

To apply this setting to the `rides` table, issue the statement below. It uses a `CASE` statement to put data for a given city in the right region for that city.

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE rides ADD COLUMN region crdb_internal_region AS (
  CASE WHEN city = 'amsterdam' THEN 'europe-west1'
       WHEN city = 'paris' THEN 'europe-west1'
       WHEN city = 'rome' THEN 'europe-west1'
       WHEN city = 'new york' THEN 'us-east1'
       WHEN city = 'boston' THEN 'us-east1'
       WHEN city = 'washington dc' THEN 'us-east1'
       WHEN city = 'san francisco' THEN 'us-west1'
       WHEN city = 'seattle' THEN 'us-east1'
       WHEN city = 'los angeles' THEN 'us-east1'
  END
) STORED;
ALTER TABLE rides ALTER COLUMN REGION SET NOT NULL;
ALTER TABLE rides SET LOCALITY REGIONAL BY ROW AS "region";
~~~

Next, issue the statement shown above for each of the following tables, substituting the new table name in for `rides`.

- `user_promo_codes`
- `users`
- `vehicle_location_histories`
- `vehicles`

## Step 7. Re-check latency

As the multi-region schema changes complete, you should see changes to the following metrics:

- _SQL Queries_: This number should go up, since the cluster can service more load due to better performance (due to better data locality and lower latency). In this particular run, **the QPS has almost doubled, from 87 to 164**.
- _Service Latency: SQL, 99th percentile_: In general, even on a small demo cluster like this, the P99 latency should drop and also get less spiky over time, as schema changes finish and data is moved around. For this particular run, **the P99 latency has dropped from ~1200 ms to ~870 ms, an over 25% improvement**.
- _Replicas per node_: This will increase, since the data needs to be spread across more nodes in order to service the multi-region workload appropriately. There is nothing you need to do about this, except to note that it happens, and is required for CockroachDB's improved multi-region performance features to work.

{{site.data.alerts.callout_info}}
The small demo cluster used in this example is essentially in a state of overload from the start. The performance numbers shown here only reflect the direction of the performance improvements. You should expect to see much better absolute performance numbers [in a production deployment](recommended-production-settings.html) than those described here.
{{site.data.alerts.end}}

<img src="{{ 'images/v21.1/geo-partitioning-sql-latency-after-1.png' | relative_url }}" alt="Geo-partitioning SQL latency" style="max-width:100%" />

## See also

- [Multi-region Overview](multiregion-overview.html)
- [Choosing a multi-region configuration](choosing-a-multi-region-configuration.html)
- [When to use `ZONE` vs. `REGION` survival goals](when-to-use-zone-vs-region-survival-goals.html)
- [When to use `REGIONAL` vs. `GLOBAL` tables](when-to-use-regional-vs-global-tables.html)
- [Reads and Writes in CockroachDB](architecture/reads-and-writes-overview.html)
- [Install CockroachDB](install-cockroachdb.html)
