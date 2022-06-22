---
title: Locality and Replication Zones
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vQExkRfyBBEOBe5-0uGDsIK7MhwE6eEN7Ok9xpTw83gq7XEkQAT3kZ0rdxwUVRHJEwo6E3H7bgontsX/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>

## Before you begin

In this lab, you'll start with a fresh cluster, so make sure you've stopped and cleaned up the cluster from the previous labs.

## Step 1. Start a cluster in a single US region

Start a cluster like you did previously, but this time use the [`--locality`](../configure-replication-zones.html#descriptive-attributes-assigned-to-nodes) flag to indicate that the nodes are all in a datacenter in the Eastern region of the US.

{{site.data.alerts.callout_info}}
To simplify the process of running multiple nodes on your local computer, you'll start them in the [background](../cockroach-start.html#general) instead of in separate terminals.
{{site.data.alerts.end}}

1. In a new terminal, start node 1:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=region=us,datacenter=us-east \
    --store=node1 \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~~

2. Start node 2:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=region=us,datacenter=us-east \
    --store=node2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

3. Start node 3:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=region=us,datacenter=us-east \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

4. Use the [`cockroach init`](../cockroach-init.html) command to perform a one-time initialization of the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --insecure --host=localhost:26257
    ~~~

## Step 2. Check data distribution

By default, CockroachDB tries to balance data evenly across specified "localities". At this point, since all three of the initial nodes have the same locality, the data is distributed across the 3 nodes. This means that for each range, one replica is on each node.

To check this, open the Web UI at <a href="http://localhost:8080" data-proofer-ignore>http://localhost:8080</a>, view **Node List**, and check the replica count is the same on all nodes.

## Step 3. Expand into 2 more US regions

Add 6 more nodes, this time using the [`--locality`](../configure-replication-zones.html#descriptive-attributes-assigned-to-nodes) flag to indicate that 3 nodes are in the Central region and 3 nodes are in the Western region of the US.

1. In a new terminal, start node 4:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=region=us,datacenter=us-central \
    --store=node4 \
    --listen-addr=localhost:26260 \
    --http-addr=localhost:8083 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~~

2. Start node 5:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=region=us,datacenter=us-central \
    --store=node5 \
    --listen-addr=localhost:26261 \
    --http-addr=localhost:8084 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

3. Start node 6:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=region=us,datacenter=us-central \
    --store=node6 \
    --listen-addr=localhost:26262 \
    --http-addr=localhost:8085 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

    You started nodes 4, 5, and 6 in the Central region.

4. Start node 7:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=region=us,datacenter=us-west \
    --store=node7 \
    --listen-addr=localhost:26263 \
    --http-addr=localhost:8086 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~~

5. Start node 8:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=region=us,datacenter=us-west \
    --store=node8 \
    --listen-addr=localhost:26264 \
    --http-addr=localhost:8087 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

6. Start node 9:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=region=us,datacenter=us-west \
    --store=node9 \
    --listen-addr=localhost:26265 \
    --http-addr=localhost:8088 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

    You started nodes 7, 8, and 9 in the West region.

## Step 4. Write data and verify data distribution

Now that there are 3 distinct localities in the cluster, the cluster will automatically ensure that, for every range, one replica is on a node in `us-east`, one is on a node in `us-central`, and one is on a node in `us-west`.

To check this, let's create a table, which initially maps to a single underlying range, and check where the replicas of the range end up.

1. Use the `cockroach gen` command to generate an example `intro` database:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach gen example-data intro | cockroach sql \
    --insecure \
    --host=localhost:26257
    ~~~

2. Use the `cockroach sql` command to verify that the table was added:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SELECT * FROM intro.mytable WHERE (l % 2) = 0;"
    ~~~

    ~~~
      l  |                          v
    +----+------------------------------------------------------+
       0 | !__aaawwmqmqmwwwaas,,_        .__aaawwwmqmqmwwaaa,,
       2 | !"VT?!"""^~~^"""??T$Wmqaa,_auqmWBT?!"""^~~^^""??YV^
       4 | !                    "?##mW##?"-
       6 | !  C O N G R A T S  _am#Z??A#ma,           Y
       8 | !                 _ummY"    "9#ma,       A
      10 | !                vm#Z(        )Xmms    Y
      12 | !              .j####mmm#####mm#m##6.
      14 | !   W O W !    jmm###mm######m#mmm##6
      16 | !             ]#me*Xm#m#mm##m#m##SX##c
      18 | !             dm#||+*$##m#mm#m#Svvn##m
      20 | !            :mmE=|+||S##m##m#1nvnnX##;     A
      22 | !            :m#h+|+++=Xmm#m#1nvnnvdmm;     M
      24 | ! Y           $#m>+|+|||##m#1nvnnnnmm#      A
      26 | !  O          ]##z+|+|+|3#mEnnnnvnd##f      Z
      28 | !   U  D       4##c|+|+|]m#kvnvnno##P       E
      30 | !       I       4#ma+|++]mmhvnnvq##P`       !
      32 | !        D I     ?$#q%+|dmmmvnnm##!
      34 | !           T     -4##wu#mm#pw##7'
      36 | !                   -?$##m####Y'
      38 | !             !!       "Y##Y"-
      40 | !
    (21 rows)
    ~~~

3. Use the `SHOW RANGES` SQL command to find the IDs of the nodes where the new table's replicas ended up:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SHOW RANGES FROM TABLE intro.mytable;"
    ~~~

    ~~~
  start_key | end_key | range_id | range_size_mb | lease_holder |    lease_holder_locality     | replicas |                                        replica_localities
+-----------+---------+----------+---------------+--------------+------------------------------+----------+---------------------------------------------------------------------------------------------------+
  NULL      | NULL    |       45 |      0.003054 |            9 | region=us,datacenter=us-west | {2,4,9}  | {"region=us,datacenter=us-east","region=us,datacenter=us-central","region=us,datacenter=us-west"}
(1 row)
    ~~~

## Step 5. Expand into Europe

Let's say your user-base has expanded into Europe and you want to store data there. To do so, add 3 more nodes, this time using the [`--locality`](../configure-replication-zones.html#descriptive-attributes-assigned-to-nodes) flag to indicate that nodes are in the Western region of Europe.

1. Start node 10:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=region=eu,datacenter=eu-west \
    --store=node10 \
    --listen-addr=localhost:26266 \
    --http-addr=localhost:8089 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~~

2. Start node 11:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=region=eu,datacenter=eu-west \
    --store=node11 \
    --listen-addr=localhost:26267 \
    --http-addr=localhost:8090 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~~

3. Start node 12:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=region=eu,datacenter=eu-west \
    --store=node12 \
    --listen-addr=localhost:26268 \
    --http-addr=localhost:8091 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~~

## Step 6. Add EU-specific data

Now imagine that `intro` database you created earlier is storing data for a US-based application, and you want a completely separate database to store data for an EU-based application.

1. Use the `cockroach gen` command to generate an example `startrek` database with 2 tables, `episodes` and `quotes`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach gen example-data startrek | cockroach sql \
    --insecure \
    --host=localhost:26257
    ~~~

2. Use the `cockroach sql` command to verify that the tables were added:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SELECT * FROM startrek.episodes LIMIT 5;" \
    --execute="SELECT quote FROM startrek.quotes WHERE characters = 'Spock and Kirk';"
    ~~~

    ~~~
      id | season | num |            title             |  stardate
    +----+--------+-----+------------------------------+-------------+
       1 |      1 |   1 | The Man Trap                 | 1531.100000
       2 |      1 |   2 | Charlie X                    | 1533.600000
       3 |      1 |   3 | Where No Man Has Gone Before | 1312.400000
       4 |      1 |   4 | The Naked Time               | 1704.200000
       5 |      1 |   5 | The Enemy Within             | 1672.100000
    (5 rows)
                        quote
    +--------------------------------------------+
      "Beauty is transitory." "Beauty survives."
    (1 row)
    ~~~

## Step 7. Constrain data to specific regions

Because you used the `--locality` flag to indicate the region for each of your nodes, constraining data to specific regions is simple.

1. Use the [`ALTER DATABASE ... CONFIGURE ZONE`](../configure-zone.html) statement to create a replication zone for the `startrek` database, forcing all the data in the database to be located on EU-based nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER DATABASE startrek CONFIGURE ZONE USING constraints='[+region=eu]';" --insecure --host=localhost:26257
    ~~~

2. Use the [`ALTER DATABASE ... CONFIGURE ZONE`](../configure-zone.html) statement to create a distinct replication zone for the `intro` database, forcing all the data in the database to be located on US-based nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER DATABASE intro CONFIGURE ZONE USING constraints='[+region=us]';" --insecure --host=localhost:26257
    ~~~

## Step 8. Verify data distribution

Now verify that the data for the table in the `intro` database is located on US-based nodes, and the data for the tables in the `startrek` database is located on EU-based nodes.

1. Find the IDs of the nodes where replicas are stored for the `intro.mytable`, `startrek.episodes`, and `startrek.quotes` tables:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=127.0.0.1:54942 \
    --execute="SHOW RANGES FROM TABLE intro.mytable;" \
    --execute="SHOW RANGES FROM TABLE startrek.episodes;" \
    --execute="SHOW RANGES FROM TABLE startrek.quotes;"    
    ~~~

    Note: your result set will differ slightly from ours.

    ~~~
      start_key | end_key | range_id | range_size_mb | lease_holder |      lease_holder_locality      | replicas |                                        replica_localities
    +-----------+---------+----------+---------------+--------------+---------------------------------+----------+---------------------------------------------------------------------------------------------------+
      NULL      | NULL    |       45 |      0.003054 |            5 | region=us,datacenter=us-central | {3,5,8}  | {"region=us,datacenter=us-east","region=us,datacenter=us-central","region=us,datacenter=us-west"}
    (1 row)
      start_key | end_key | range_id | range_size_mb | lease_holder |    lease_holder_locality     | replicas |                                        replica_localities
    +-----------+---------+----------+---------------+--------------+------------------------------+----------+---------------------------------------------------------------------------------------------------+
      NULL      | NULL    |       46 |      0.004276 |            8 | region=us,datacenter=us-west | {3,5,8}  | {"region=us,datacenter=us-east","region=us,datacenter=us-central","region=us,datacenter=us-west"}
    (1 row)
      start_key | end_key | range_id | range_size_mb | lease_holder |      lease_holder_locality      | replicas |                                        replica_localities
    +-----------+---------+----------+---------------+--------------+---------------------------------+----------+---------------------------------------------------------------------------------------------------+
      NULL      | NULL    |       47 |       0.03247 |            5 | region=us,datacenter=us-central | {3,5,8}  | {"region=us,datacenter=us-east","region=us,datacenter=us-central","region=us,datacenter=us-west"}
    (1 row)
    ~~~

{{site.data.alerts.callout_info}}
You can also use the Web UI's <a href="http://localhost:8080/#/data-distribution" data-proofer-ignore>Data Distribution matrix</a> to view the distribution of data across nodes.
{{site.data.alerts.end}}

## Step 9. Clean up

Take a moment to clean things up.

1. Stop all CockroachDB nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach
    ~~~

    This simplified shutdown process is only appropriate for a lab/evaluation scenario.

2. Remove the nodes' data directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node{1,2,3,4,5,6,7,8,9,10,11,12}
    ~~~

## What's next?

[Geo-Partitioning](geo-partitioning.html)
