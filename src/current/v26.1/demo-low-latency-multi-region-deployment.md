---
title: Low Latency Reads and Writes in a Multi-Region Cluster
summary: Use data topologies to get low-latency reads and writes in a multi-region CockroachDB cluster.
toc: true
toc_not_nested: true
key: demo-geo-partitioning.html
docs_area:
---

CockroachDB multi-region capabilities make it easier to run global applications. For an overview of these capabilities, see [Multi-Region Capabilities Overview]({% link {{ page.version.version }}/multiregion-overview.md %}).

In multi-region clusters, the distribution of data becomes a performance consideration. This makes it important to think about the [survival goals]({% link {{ page.version.version }}/multiregion-overview.md %}#survival-goals) of each database. Then, for each table in the database, use the right [table locality]({% link {{ page.version.version }}/multiregion-overview.md %}#table-locality) to locate data for optimal performance.

In this tutorial, you will:

1. Simulate a multi-region CockroachDB cluster on your local machine.
1. Run a workload on the cluster using our fictional vehicle-sharing application called [MovR]({% link {{ page.version.version }}/movr.md %}).
1. See the effects of network latency on SQL query performance in the default (non-multi-region) configuration.
1. Configure the cluster for good multi-region performance by issuing SQL statements that choose the right [survival goals]({% link {{ page.version.version }}/multiregion-overview.md %}#survival-goals) and [table localities]({% link {{ page.version.version }}/multiregion-overview.md %}#table-locality).

## Considerations

This page describes a demo cluster; it does not show best practices for a production deployment. For more information about production deployments of multi-region applications, see [Orchestrate CockroachDB Across Multiple Kubernetes Clusters]({% link {{ page.version.version }}/orchestrate-cockroachdb-with-kubernetes-multi-cluster.md %}) and the [Production Checklist]({% link {{ page.version.version }}/recommended-production-settings.md %}).

Because the instructions on this page describe how to simulate a multi-region cluster on a single machine, the absolute performance numbers described below are not reflective of [the performance you can expect of single-point reads and writes against CockroachDB in a production setting]({% link {{ page.version.version }}/frequently-asked-questions.md %}#single-row-perf). Instead, the instructions are designed with the following goals:

- To show the _relative_ magnitude of the performance improvements to expect when you configure a multi-region cluster correctly.
- To be as easy to try as possible with minimal configuration and setup.

## Before you begin

Make sure you have:

- [A basic understanding of the MovR application](#a-basic-understanding-of-the-movr-application)
- [Docker](https://www.docker.com) installed on the local machine

### A basic understanding of the MovR application

The workload you'll run against the cluster is our open-source, fictional, peer-to-peer vehicle-sharing app, [MovR]({% link {{ page.version.version }}/movr.md %}). Each instance represents users in a specific region:

- `europe-west1`, covering the cities of Amsterdam, Paris, and Rome.
- `us-east1`, covering the cities of New York, Boston, and Washington, D.C.
- `us-west1`, covering the cities of Los Angeles, San Francisco, and Seattle.

#### The MovR schema

{% include {{ page.version.version }}/misc/movr-schema.md %}

All of the tables except `promo_codes` have a composite primary key of `city` and `id`, in that order. This means that the rows in these tables are ordered by their geography. These tables are read from and written to very frequently. To keep read and write latency low, you'll use the [`REGIONAL BY ROW` table locality pattern]({% link {{ page.version.version }}/table-localities.md %}#regional-by-row-tables) for these tables.

The data in the `promo_codes` table is different: it is not tied to geography, and it is rarely updated. This type of table is often referred to as a "reference table" or "lookup table". In this case, you'll use the [Global table locality pattern]({% link {{ page.version.version }}/table-localities.md %}#global-tables) to keep read latencies low.

For a description of the sequence of SQL statements issued by the MovR application in response to user actions, see [How the MovR application works]({% link {{ page.version.version }}/movr.md %}#how-the-movr-application-works).

## Step 1. Simulate a multi-region cluster

{% include {{page.version.version}}/sql/start-a-multi-region-demo-cluster.md %}

To verify that the simulated latencies are working as expected, check the [Network Latency Page]({% link {{ page.version.version }}/ui-network-latency-page.md %}) in the DB Console. Round trip times between  `us-west1` and `europe-west1` should be in the 150 ms range.

## Step 2. Determine node locations

To determine which nodes are in which regions, you will need to refer to two (2) things:

1. The output of the `\demo ls` from the SQL shell, which shows the TCP ports on the local machine that we will connect to from the MovR application.
1. The node IDs shown on the **Network Latency Page**.

Here is the output of `\demo ls` from the SQL shell.

{% include_cached copy-clipboard.html %}
~~~
> \demo ls
~~~

~~~
node 1:
  (webui)    http://127.0.0.1:8080/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26257?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26257

node 2:
  (webui)    http://127.0.0.1:8081/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26258?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26258

node 3:
  (webui)    http://127.0.0.1:8082/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26259?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26259

node 4:
  (webui)    http://127.0.0.1:8083/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26260?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26260

node 5:
  (webui)    http://127.0.0.1:8084/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26261?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26261

node 6:
  (webui)    http://127.0.0.1:8085/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26262?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26262

node 7:
  (webui)    http://127.0.0.1:8086/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26263?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26263

node 8:
  (webui)    http://127.0.0.1:8087/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26264?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26264

node 9:
  (webui)    http://127.0.0.1:8088/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26265?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26265
~~~

And here is the view on the **Network Latency Page**, which shows which nodes are in which cluster regions:

<img src="{{ 'images/v26.1/geo-partitioning-network-latency.png' | relative_url }}" alt="Geo-partitioning network latency" style="max-width:100%" />

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

Follow these steps to start 3 instances of MovR. Each instance is pointed at a node in a different region. This will simulate load from that region.

1. In the SQL shell, create the `movr` database:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE DATABASE IF NOT EXISTS movr;
    ~~~

1. Open a second terminal and run the command below to populate the MovR data set. The options are mostly self-explanatory. We limit the application to 1 thread because using multiple threads quickly overloads this small demo cluster's ability to ingest data. As a result, loading the data takes about 90 seconds on a fast laptop.

    {% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
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

1. Open a fourth terminal and run the following command:

    {% include_cached copy-clipboard.html %}
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

## Step 4. Check service latency

Now that you have load hitting the cluster from different regions, check how the service latencies look before you do any multi-region configuration from SQL. This is the "before" case in the "before and after".

In the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) at <a data-proofer-ignore href="http://127.0.0.1:8080">http://127.0.0.1:8080</a>, click [**Metrics**]({% link {{ page.version.version }}/ui-overview-dashboard.md %}) on the left and hover over the [**Service Latency: SQL, 99th percentile**]({% link {{ page.version.version }}/ui-overview-dashboard.md %}#service-latency-sql-99th-percentile) timeseries graph. You should see the effects of network latency on this workload.

<img src="{{ 'images/v26.1/geo-partitioning-sql-latency-before.png' | relative_url }}" alt="Geo-partitioning SQL latency" style="max-width:100%" />

For each of the 3 nodes that you are pointing the movr workload at, the max latency of 99% of queries are in the 1-2 seconds range. The SQL latency is high because of the network latency between regions.

To see the network latency between any two nodes in the cluster, click [**Network Latency**]({% link {{ page.version.version }}/ui-network-latency-page.md %}) in the left-hand navigation.

<img src="{{ 'images/v26.1/geo-partitioning-network-latency.png' | relative_url }}" alt="Geo-partitioning network latency" style="max-width:100%" />

Within a single region, round-trip latency is under 6 ms (milliseconds). Across regions, round-trip latency is significantly higher.

For example:

- Round-trip latency between **N2** in `europe-west1` and **N3** in `us-east1` is  87 ms.
- Round-trip latency between **N2** in `europe-west1` and **N4** in `us-west1` is 196 ms.

## Step 5. Execute multi-region SQL statements

The following SQL statements will configure:

- [The database's available regions](#configure-database-regions).
- [Which data should be optimized for access from which region](#configure-table-localities).

This information is necessary so that CockroachDB can move data around to optimize access to particular data from particular regions. The main focus is reducing latency in a global deployment. For more information about how this works at a high level, see the [Multi-Region Capabilities Overview]({% link {{ page.version.version }}/multiregion-overview.md %}).

{{site.data.alerts.callout_info}}
The following `ALTER` statements will take some seconds to run, since the cluster is under load.
{{site.data.alerts.end}}

### Configure database regions

Back in the SQL shell, switch to the `movr` database:

{% include_cached copy-clipboard.html %}
~~~ sql
USE movr;
~~~

{% include {{page.version.version}}/sql/multiregion-movr-add-regions.md %}

### Configure table localities

#### Configure GLOBAL tables

As mentioned earlier, all of the tables except `promo_codes` are geographically specific.

{% include {{page.version.version}}/sql/multiregion-movr-global.md %}

#### Configure REGIONAL BY ROW tables

{% include {{page.version.version}}/sql/multiregion-movr-regional-by-row.md %}

## Step 6. Re-check service latency

As the multi-region schema changes complete, you should see changes to the following metrics:

- **SQL Queries**: This number should go up, since the cluster can service more load due to better performance (due to better data locality and lower latency). In this particular run, **the QPS has almost doubled, from 87 to 164**.
- **Service Latency: SQL, 99th percentile**: In general, even on a small demo cluster like this, the P99 latency should drop and also get less spiky over time, as schema changes finish and data is moved around. For this particular run, **the P99 latency has dropped from ~1200 ms to ~870 ms, an over 25% improvement**.
- **Replicas per Node**: This will increase, since the data needs to be spread across more nodes in order to service the multi-region workload appropriately. There is nothing you need to do about this, except to note that it happens, and is required for CockroachDB's improved multi-region performance features to work.

{{site.data.alerts.callout_info}}
The small demo cluster used in this example is essentially in a state of overload from the start. The performance numbers shown here only reflect the direction of the performance improvements. You should expect to see much better absolute performance numbers than those described here [in a production deployment]({% link {{ page.version.version }}/recommended-production-settings.md %}).
{{site.data.alerts.end}}

<img src="{{ 'images/v26.1/geo-partitioning-sql-latency-after-1.png' | relative_url }}" alt="Geo-partitioning SQL latency" style="max-width:100%" />

## See also

- [Multi-Region Capabilities Overview]({% link {{ page.version.version }}/multiregion-overview.md %})
- [How to Choose a Multi-Region Configuration]({% link {{ page.version.version }}/choosing-a-multi-region-configuration.md %})
- [When to Use `ZONE` vs. `REGION` Survival Goals]({% link {{ page.version.version }}/multiregion-survival-goals.md %}#when-to-use-zone-vs-region-survival-goals)
- [When to Use `REGIONAL` vs. `GLOBAL` Tables]({% link {{ page.version.version }}/table-localities.md %}#when-to-use-regional-vs-global-tables)
- [Migrate to Multi-Region SQL]({% link {{ page.version.version }}/migrate-to-multiregion-sql.md %})
- [Secondary regions]({% link {{ page.version.version }}/multiregion-overview.md %}#secondary-regions)
- [`SET SECONDARY REGION`]({% link {{ page.version.version }}/alter-database.md %}#set-secondary-region)
- [`DROP SECONDARY REGION`]({% link {{ page.version.version }}/alter-database.md %}#drop-secondary-region)
- [Reads and Writes in CockroachDB]({% link {{ page.version.version }}/architecture/reads-and-writes-overview.md %})
- [Install CockroachDB]({% link {{ page.version.version }}/install-cockroachdb.md %})
