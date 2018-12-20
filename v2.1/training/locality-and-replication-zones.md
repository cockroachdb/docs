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
To simplify the process of running multiple nodes on your local computer, you'll start them in the [background](../start-a-node.html#general) instead of in separate terminals.
{{site.data.alerts.end}}

1. In a new terminal, start node 1:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=region=us-east,datacenter=us-east1 \
    --store=node1 \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~~

2. Start node 2:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=region=us-east,datacenter=us-east1 \
    --store=node2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

3. Start node 3:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=region=us-east,datacenter=us-east1 \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

4. Use the [`cockroach init`](../initialize-a-cluster.html) command to perform a one-time initialization of the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach init --insecure --host=localhost:26257
    ~~~

## Step 2. Check data distribution

By default, CockroachDB tries to balance data evenly across specified "localities". At this point, since all three of the initial nodes have the same locality, the data is distributed across the 3 nodes. This means that for each range, one replica is on each node.

To check this, open the Web UI at <a href="http://localhost:8080" data-proofer-ignore>http://localhost:8080</a>, view **Node List**, and check the replica count is the same on all nodes.

<img src="{{ 'images/v2.1/training-1.png' | relative_url }}" alt="CockroachDB Web UI" style="border:1px solid #eee;max-width:100%" />

## Step 3. Expand into 2 more US regions

Add 6 more nodes, this time using the [`--locality`](../configure-replication-zones.html#descriptive-attributes-assigned-to-nodes) flag to indicate that all 6 nodes are in the `us-west` region, with 3 nodes in the `us-west1` datacenter and 3 nodes in the `us-west2` datacenter.

1. In a new terminal, start node 4:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=region=us-west,datacenter=us-west1 \
    --store=node4 \
    --listen-addr=localhost:26260 \
    --http-addr=localhost:8083 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~~

2. Start node 5:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=region=us-west,datacenter=us-west1 \
    --store=node5 \
    --listen-addr=localhost:26261 \
    --http-addr=localhost:8084 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

3. Start node 6:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=region=us-west,datacenter=us-west1 \
    --store=node6 \
    --listen-addr=localhost:26262 \
    --http-addr=localhost:8085 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

    You started nodes 4, 5, and 6 in the `us-west1` datacenter in the `us-west` region.

4. Start node 7:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=region=us-west,datacenter=us-west2 \
    --store=node7 \
    --listen-addr=localhost:26263 \
    --http-addr=localhost:8086 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~~

5. Start node 8:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=region=us-west,datacenter=us-west2 \
    --store=node8 \
    --listen-addr=localhost:26264 \
    --http-addr=localhost:8087 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

6. Start node 9:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=region=us-west,datacenter=us-west2 \
    --store=node9 \
    --listen-addr=localhost:26265 \
    --http-addr=localhost:8088 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

    You started nodes 7, 8, and 9 in the `us-west2` datacenter in the `us-west` region.

## Step 4. Write data and verify data distribution

Now that there are 3 distinct localities in the cluster, the cluster will automatically ensure that, for every range, one replica is on a node in the `us-east1` datacenter, one is on a node in `us-west1` datacenter, and one is on a node in the `us-west2` datacenter.

To check this, let's create a table, which initially maps to a single underlying range, and check where the replicas of the range end up.

1. Use the `cockroach gen` command to generate an example `intro` database:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach gen example-data intro | ./cockroach sql \
    --insecure \
    --host=localhost:26257
    ~~~

2. Use the `cockroach sql` command to verify that the table was added:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
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

3. Use the `SHOW EXPERIMENTAL_RANGES` SQL command to find the IDs of the nodes where the new table's replicas ended up:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SHOW EXPERIMENTAL_RANGES FROM TABLE intro.mytable;"
    ~~~

    ~~~
      start_key | end_key | range_id | replicas | lease_holder
    +-----------+---------+----------+----------+--------------+
      NULL      | NULL    |       32 | {1,4,8}  |            8
    (1 row)
    ~~~

    In this case, one replica is on node 1 in `us-east1`, one is on node 4 in `us-west1`, and one is on node 8 in `us-west2`.

    You can also use the Web UI's <a href="http://localhost:8080/#/data-distribution" data-proofer-ignore>Data Distribution matrix</a> to view the distribution of data across nodes:

    <img src="{{ 'images/v2.1/training-1.1.png' | relative_url }}" alt="CockroachDB Web UI" style="border:1px solid #eee;max-width:100%" />

## Step 5. Add US East-only data

Now imagine that the `intro` database you created earlier is storing data for users across the US, but you want a completely separate database to store data for an application running only in the US East.

1. Use the `cockroach gen` command to generate an example `startrek` database with 2 tables, `episodes` and `quotes`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach gen example-data startrek | ./cockroach sql \
    --insecure \
    --host=localhost:26257
    ~~~

2. Use the `cockroach sql` command to verify that the tables were added:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
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

## Step 6. Constrain data to the US East

Because you used the `--locality` flag to indicate the region and datacenter for each of your nodes, constraining data to specific localities is simple.

1. Use the [`ALTER DATABASE ... CONFIGURE ZONE`](../configure-zone.html) statement to create a replication zone for the `startrek` database, forcing all the data in the database to be located on nodes in the `us-east` region:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql --execute="ALTER DATABASE startrek CONFIGURE ZONE USING constraints='[+region=us-east]';" --insecure --host=localhost:26257
    ~~~

## Step 7. Verify data distribution

Now verify that the data for the table in the `intro` database is still located across all US-based nodes, and the data for the tables in the `startrek` database is located only on nodes in the `us-east` region.

1. Find the IDs of the nodes where replicas are stored for the `intro.mytable`, `startrek.episodes`, and `startrek.quotes` tables:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SHOW EXPERIMENTAL_RANGES FROM TABLE intro.mytable;" \
    --execute="SHOW EXPERIMENTAL_RANGES FROM TABLE startrek.episodes;" \
    --execute="SHOW EXPERIMENTAL_RANGES FROM TABLE startrek.quotes;"    
    ~~~

    ~~~
      start_key | end_key | range_id | replicas | lease_holder
    +-----------+---------+----------+----------+--------------+
      NULL      | NULL    |       32 | {1,4,8}  |            8
    (1 row)
      start_key | end_key | range_id | replicas | lease_holder
    +-----------+---------+----------+----------+--------------+
      NULL      | NULL    |       34 | {1,2,3}  |            3
    (1 row)
      start_key | end_key | range_id | replicas | lease_holder
    +-----------+---------+----------+----------+--------------+
      NULL      | NULL    |       35 | {1,2,3}  |            1
    (1 row)
    ~~~

2. For each table, check the node IDs (in the `replicas` column) against the following key to verify that replicas are in the correct locations:

    Node IDs | Region
    --------|-------
    1 - 3 | `us-east`
    4 - 9 | `us-west`

    You can also use the Web UI's <a href="http://localhost:8080/#/data-distribution" data-proofer-ignore>Data Distribution matrix</a> to view the distribution of data across nodes:

    <img src="{{ 'images/v2.1/training-1.2.png' | relative_url }}" alt="CockroachDB Web UI" style="border:1px solid #eee;max-width:100%" />

## What's next?

[Geo-Partitioning](geo-partitioning.html): In the next module, you'll take what you learned about locality and replication zones and use it in combination with row-level partitioning for performant geographically distributed deployments.  
