---
title: Locality and Replication Zones
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
redirect_from: /training/locality-and-replication-zones.html
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
To simplify the process of running multiple nodes on your local computer, you'll start themin the [background](../start-a-node.html#general) instead of in separate terminals.
{{site.data.alerts.end}}

1. In a new terminal, start node 1:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=region=us,datacenter=us-east \
    --store=node1 \
    --host=localhost \
    --port=26257 \
    --http-port=8080 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~~

2. Start node 2:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=region=us,datacenter=us-east \
    --store=node2 \
    --host=localhost \
    --port=26258 \
    --http-port=8081 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

3. Start node 3:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=region=us,datacenter=us-east \
    --store=node3 \
    --host=localhost \
    --port=26259 \
    --http-port=8082 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

4. Use the [`cockroach init`](../initialize-a-cluster.html) command to perform a one-time initialization of the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach init --insecure
    ~~~

## Step 2. Check data distribution

By default, CockroachDB tries to balance data evenly across specified "localities". At this point, since all three of the initial nodes have the same locality, the data is distributed across the 3 nodes. This means that for each range, one replica is on each node.

To check this, open the Web UI at <a href="http://localhost:8080" data-proofer-ignore>http://localhost:8080</a>, view **Node List**, and check the replica count is the same on all nodes.

<img src="{{ 'images/v2.1/training-1.png' | relative_url }}" alt="CockroachDB Web UI" style="border:1px solid #eee;max-width:100%" />

## Step 3. Expand into 2 more US regions

Add 6 more nodes, this time using the [`--locality`](../configure-replication-zones.html#descriptive-attributes-assigned-to-nodes) flag to indicate that 3 nodes are in the Central region and 3 nodes are in the Western region of the US.

1. In a new terminal, start node 4:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=region=us,datacenter=us-central \
    --store=node4 \
    --host=localhost \
    --port=26260 \
    --http-port=8083 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~~

2. Start node 5:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=region=us,datacenter=us-central \
    --store=node5 \
    --host=localhost \
    --port=26261 \
    --http-port=8084 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

3. Start node 6:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=region=us,datacenter=us-central \
    --store=node6 \
    --host=localhost \
    --port=26262 \
    --http-port=8085 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

    You started nodes 4, 5, and 6 in the Central region.

4. Start node 7:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=region=us,datacenter=us-west \
    --store=node7 \
    --host=localhost \
    --port=26263 \
    --http-port=8086 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~~

5. Start node 8:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=region=us,datacenter=us-west \
    --store=node8 \
    --host=localhost \
    --port=26264 \
    --http-port=8087 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

6. Start node 9:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=region=us,datacenter=us-west \
    --store=node9 \
    --host=localhost \
    --port=26265 \
    --http-port=8088 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

    You started nodes 7, 8, and 9 in the East region.

## Step 4. Write data and verify data distribution

Now that there are 3 distinct localities in the cluster, the cluster will automatically ensure that, for every range, one replica is on a node in `us-east`, one is on a node in `us-central`, and one is on a node in `us-west`.

To check this, let's create a table, which initially maps to a single underlying range, and check where the replicas of the range end up.

1. Use the `cockroach gen` command to generate an example `intro` database:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach gen example-data intro | ./cockroach sql --insecure
    ~~~

2. Use the `cockroach sql` command to verify that the table was added:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="SELECT * FROM intro.mytable WHERE (l % 2) = 0;"
    ~~~

    ~~~
    +----+------------------------------------------------------+
    | l  |                          v                           |
    +----+------------------------------------------------------+
    |  0 | !__aaawwmqmqmwwwaas,,_        .__aaawwwmqmqmwwaaa,,  |
    |  2 | !"VT?!"""^~~^"""??T$Wmqaa,_auqmWBT?!"""^~~^^""??YV^  |
    |  4 | !                    "?##mW##?"-                     |
    |  6 | !  C O N G R A T S  _am#Z??A#ma,           Y         |
    |  8 | !                 _ummY"    "9#ma,       A           |
    | 10 | !                vm#Z(        )Xmms    Y             |
    | 12 | !              .j####mmm#####mm#m##6.                |
    | 14 | !   W O W !    jmm###mm######m#mmm##6                |
    | 16 | !             ]#me*Xm#m#mm##m#m##SX##c               |
    | 18 | !             dm#||+*$##m#mm#m#Svvn##m               |
    | 20 | !            :mmE=|+||S##m##m#1nvnnX##;     A        |
    | 22 | !            :m#h+|+++=Xmm#m#1nvnnvdmm;     M        |
    | 24 | ! Y           $#m>+|+|||##m#1nvnnnnmm#      A        |
    | 26 | !  O          ]##z+|+|+|3#mEnnnnvnd##f      Z        |
    | 28 | !   U  D       4##c|+|+|]m#kvnvnno##P       E        |
    | 30 | !       I       4#ma+|++]mmhvnnvq##P`       !        |
    | 32 | !        D I     ?$#q%+|dmmmvnnm##!                  |
    | 34 | !           T     -4##wu#mm#pw##7'                   |
    | 36 | !                   -?$##m####Y'                     |
    | 38 | !             !!       "Y##Y"-                       |
    | 40 | !                                                    |
    +----+------------------------------------------------------+
    (21 rows)
    ~~~

3. Use the `SHOW EXPERIMENTAL_RANGES` SQL command to find the IDs of the nodes where the new table's replicas ended up:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="SHOW EXPERIMENTAL_RANGES FROM TABLE intro.mytable;"
    ~~~

    ~~~
    +-----------+---------+----------+----------+--------------+
    | start_key | end_key | range_id | replicas | lease_holder |
    +-----------+---------+----------+----------+--------------+
    | NULL      | NULL    |       32 | {1,6,7}  |            6 |
    +-----------+---------+----------+----------+--------------+
    (1 row)
    ~~~

    In this case, one replica is on node 1 in `us-east`, one is on node 6 in `us-central`, and one is on node 7 in `us-west`.

## Step 5. Expand into Europe

Let's say your user-base has expanded into Europe and you want to store data there. To do so, add 3 more nodes, this time using the [`--locality`](../configure-replication-zones.html#descriptive-attributes-assigned-to-nodes) flag to indicate that nodes are in the Western region of Europe.

1. Start node 10:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=region=eu,datacenter=eu-west \
    --store=node10 \
    --host=localhost \
    --port=26266 \
    --http-port=8089 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~~

2. Start node 11:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=region=eu,datacenter=eu-west \
    --store=node11 \
    --host=localhost \
    --port=26267 \
    --http-port=8090 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~~

3. Start node 12:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=region=eu,datacenter=eu-west \
    --store=node12 \
    --host=localhost \
    --port=26268 \
    --http-port=8091 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~~

## Step 6. Add EU-specific data

Now imagine that `intro` database you created earlier is storing data for a US-based application, and you want a completely separate database to store data for an EU-based application.

1. Use the `cockroach gen` command to generate an example `startrek` database with 2 tables, `episodes` and `quotes`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach gen example-data startrek | ./cockroach sql --insecure
    ~~~

2. Use the `cockroach sql` command to verify that the tables were added:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="SELECT * FROM startrek.episodes LIMIT 5;" \
    --execute="SELECT quote FROM startrek.quotes WHERE characters = 'Spock and Kirk';"
    ~~~

    ~~~
    +----+--------+-----+------------------------------+----------+
    | id | season | num |            title             | stardate |
    +----+--------+-----+------------------------------+----------+
    |  1 |      1 |   1 | The Man Trap                 |   1531.1 |
    |  2 |      1 |   2 | Charlie X                    |   1533.6 |
    |  3 |      1 |   3 | Where No Man Has Gone Before |   1312.4 |
    |  4 |      1 |   4 | The Naked Time               |   1704.2 |
    |  5 |      1 |   5 | The Enemy Within             |   1672.1 |
    +----+--------+-----+------------------------------+----------+
    (5 rows)
    +--------------------------------------------+
    |                   quote                    |
    +--------------------------------------------+
    | "Beauty is transitory." "Beauty survives." |
    +--------------------------------------------+
    (1 row)
    ~~~

## Step 7. Constrain data to specific regions

Because you used the `--locality` flag to indicate the region for each of your nodes, constraining data to specific regions is simple.

1. Use the [`cockroach zone`](../configure-replication-zones.html) command to create a replication zone for the `startrek` database, forcing all the data in the database to be located on EU-based nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+region=eu]' | ./cockroach zone set startrek --insecure -f -
    ~~~

    ~~~
    range_min_bytes: 1048576
    range_max_bytes: 67108864
    gc:
      ttlseconds: 90000
    num_replicas: 3
    constraints: [+region=eu]
    ~~~

2. Use the [`cockroach zone`](../configure-replication-zones.html) command to create a distinct replication zone for the `intro` database, forcing all the data in the database to be located on US-based nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+region=us]' | ./cockroach zone set intro --insecure -f -
    ~~~

    ~~~
    range_min_bytes: 1048576
    range_max_bytes: 67108864
    gc:
      ttlseconds: 90000
    num_replicas: 3
    constraints: [+region=us]
    ~~~

## Step 8. Verify data distribution

Now verify that the data for the table in the `intro` database is located on US-based nodes, and the data for the tables in the `startrek` database is located on EU-based nodes.

1. Find the IDs of the nodes where replicas are stored for the `intro.mytable`, `startrek.episodes`, and `startrek.quotes` tables:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="SHOW EXPERIMENTAL_RANGES FROM TABLE intro.mytable;" \
    --execute="SHOW EXPERIMENTAL_RANGES FROM TABLE startrek.episodes;" \
    --execute="SHOW EXPERIMENTAL_RANGES FROM TABLE startrek.quotes;"    
    ~~~

    ~~~
    +-----------+---------+----------+----------+--------------+
    | start_key | end_key | range_id | replicas | lease_holder |
    +-----------+---------+----------+----------+--------------+
    | NULL      | NULL    |       32 | {1,6,7}  |            7 |
    +-----------+---------+----------+----------+--------------+
    (1 row)
    +-----------+---------+----------+------------+--------------+
    | start_key | end_key | range_id | replicas   | lease_holder |
    +-----------+---------+----------+------------+--------------+
    | NULL      | NULL    |       42 | {10,11,12} |           11 |
    +-----------+---------+----------+------------+--------------+
    (1 row)
    +-----------+---------+----------+------------+--------------+
    | start_key | end_key | range_id | replicas   | lease_holder |
    +-----------+---------+----------+------------+--------------+
    | NULL      | NULL    |       43 | {10,11,12} |           12 |
    +-----------+---------+----------+------------+--------------+
    (1 row)
    ~~~

2. For each table, check the node IDs (in the `Replicas` column) against the following key to verify that replicas are in the correct region:

    Node IDs | Region
    --------|-------
    1 - 9 | US
    10 - 12 | EU

{{site.data.alerts.callout_info}}
You can also use the Web UI's [Data Distribution matrix](http://localhost:8080/#/data-distribution) to view the distribution of data across nodes.
{{site.data.alerts.end}}

## Step 9. Clean up

Take a moment to clean things up.

1. Stop all CockroachDB nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach
    ~~~

    This simplified shutdown process is only appropriate for a lab/evaluation scenario. In a production environment, you would use `cockroach quit` to gracefully shut down each node.

2. Remove the nodes' data directories:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node1 node2 node3 node4 node5 node6 node7 node8 node9 node10 node11 node12
    ~~~

## What's next?

[Data Import](data-import.html)
