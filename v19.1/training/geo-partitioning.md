---
title: Geo-Partitioning
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vTv2TOeo0h6p5GlTfTXnloz9wfRaqlwfDk8yqDUjCoNC61_l7sRR91dvliZyzTmDotsDW9MwBJ2kWRk/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>

## Before you begin

Make sure you have already completed [Locality and Replication Zones](locality-and-replication-zones.html) and have 9 nodes running locally across 3 distinct localities:

- `--locality=region=us-east,datacenter=us-east1`
- `--locality=region=us-west,datacenter=us-west1`
- `--locality=region=us-west,datacenter=us-west2`

## Step 1. Add an Enterprise license

The table partitioning feature requires an Enterprise license. For the purpose of this training, we've created a temporary license.

1. Enable the temporary enterprise license:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SET CLUSTER SETTING cluster.organization = 'Cockroach Labs Training';"
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SET CLUSTER SETTING enterprise.license = '{{site.training.ccl_license}}';"
    ~~~


## Step 2. Import the Movr dataset

Now you'll import Movr data representing users, vehicles, and rides in 3 eastern US cities (New York, Boston, and Washington DC) and 3 western US cities (Los Angeles, San Francisco, and Seattle).

1. Start the [built-in SQL shell](../use-the-built-in-sql-client.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql --insecure --host=localhost
    ~~~

2. Create the `movr` database and set it as the default:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE movr;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET DATABASE = movr;
    ~~~

3. Run the [`IMPORT`](../import.html) statement to create and populate the `users`, `vehicles,` and `rides` tables, using CSV files we've made publicly available Amazon S3 storage:

    {% include copy-clipboard.html %}
    ~~~ sql
    > IMPORT TABLE users (
      	id UUID NOT NULL,
        city STRING NOT NULL,
      	name STRING NULL,
      	address STRING NULL,
      	credit_card STRING NULL,
        CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC)
    )
    CSV DATA (
        'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/perf-tuning/users/n1.0.csv'
    );
    ~~~

    ~~~
            job_id       |  status   | fraction_completed | rows | index_entries | system_records | bytes
    +--------------------+-----------+--------------------+------+---------------+----------------+--------+
      390345990764396545 | succeeded |                  1 | 1998 |             0 |              0 | 241052
    (1 row)
    ~~~    

    {% include copy-clipboard.html %}
    ~~~ sql
    > IMPORT TABLE vehicles (
        id UUID NOT NULL,
        city STRING NOT NULL,
        type STRING NULL,
        owner_id UUID NULL,
        creation_time TIMESTAMP NULL,
        status STRING NULL,
        ext JSON NULL,
        mycol STRING NULL,
        CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC)
    )
    CSV DATA (
        'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/perf-tuning/vehicles/n1.0.csv'
    );
    ~~~

    ~~~
            job_id       |  status   | fraction_completed | rows  | index_entries | system_records |  bytes
    +--------------------+-----------+--------------------+-------+---------------+----------------+---------+
      390346109887250433 | succeeded |                  1 | 19998 |         19998 |              0 | 3558767
    (1 row)
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > IMPORT TABLE rides (
      	id UUID NOT NULL,
        city STRING NOT NULL,
        vehicle_city STRING NULL,
      	rider_id UUID NULL,
      	vehicle_id UUID NULL,
      	start_address STRING NULL,
      	end_address STRING NULL,
      	start_time TIMESTAMP NULL,
      	end_time TIMESTAMP NULL,
      	revenue DECIMAL(10,2) NULL,
        CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC)
    )
    CSV DATA (
        'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/perf-tuning/rides/n1.0.csv',
        'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/perf-tuning/rides/n1.1.csv',
        'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/perf-tuning/rides/n1.2.csv',
        'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/perf-tuning/rides/n1.3.csv',
        'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/perf-tuning/rides/n1.4.csv',
        'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/perf-tuning/rides/n1.5.csv',
        'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/perf-tuning/rides/n1.6.csv',
        'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/perf-tuning/rides/n1.7.csv',
        'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/perf-tuning/rides/n1.8.csv',
        'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/perf-tuning/rides/n1.9.csv'
    );
    ~~~

    ~~~
            job_id       |  status   | fraction_completed |  rows  | index_entries | system_records |   bytes
    +--------------------+-----------+--------------------+--------+---------------+----------------+-----------+
      390346325693792257 | succeeded |                  1 | 999996 |       1999992 |              0 | 339741841
    (1 row)
    ~~~

    {{site.data.alerts.callout_success}}
    You can observe the progress of imports as well as all schema change operations (e.g., adding secondary indexes) on the <a href="http://localhost:8080/#/jobs" data-proofer-ignore><strong>Jobs</strong> page</a> of the Web UI.
    {{site.data.alerts.end}}

## Step 3. Check data distribution before partitioning

At this point, the data for the three Movr tables (`users`, `rides`, and `vehicles`) is evenly distributed across all three localities. For example, let's check where the replicas of the `vehicles` and `users` tables are located:

{% include copy-clipboard.html %}
~~~ sql
> SHOW EXPERIMENTAL_RANGES FROM TABLE vehicles;
~~~

~~~
  start_key | end_key | range_id | replicas | lease_holder
+-----------+---------+----------+----------+--------------+
  NULL      | NULL    |       24 | {2,4,9}  |            4
(1 row)
~~~    

{% include copy-clipboard.html %}
~~~ sql
> SHOW EXPERIMENTAL_RANGES FROM TABLE users;
~~~

~~~
  start_key | end_key | range_id | replicas | lease_holder
+-----------+---------+----------+----------+--------------+
  NULL      | NULL    |       36 | {3,4,8}  |            8
(1 row)
~~~

For added clarity, here's a key showing how nodes map to localities:

Node IDs | Locality
---------|---------
1 - 3 | `--locality=region=us-east,datacenter=us-east1`
4 - 6 | `--locality=region=us-west,datacenter=us-west1`
7 - 9 | `--locality=region=us-west,datacenter=us-west2`

In this case, for the single range containing `vehicles` data, one replica is in each datacenter, and the leaseholder is in the `us-west1` datacenter. The same is true for the single range containing `users` data, but the leaseholder is in the `us-west2` datacenter.

## Step 4. Consider performance before partitioning

In a real deployment, with nodes truly distributed across 3 regions of the US, having the Movr data evenly spread out would mean that reads and writes would often bounce back and forth across the country, causing high read and write latencies.

### Reads

For example, imagine you are a Movr administrator in New York, and you want to get the IDs and descriptions of all New York-based bikes that are currently in use. You issue the following query to one of the nodes in the `us-east1` datacenter:

{% include copy-clipboard.html %}
~~~ sql
> SELECT id, ext FROM vehicles \
WHERE city = 'new york' AND type = 'bike' AND status = 'in_use';
~~~

All requests initially go to the leaseholder for the relevant range. As you saw earlier, the leaseholder for the single range of the `vehicles` table is in the `us-west1` datacenter, so in this case, the following would happen:

1. The node receiving the request (the gateway node) in the `us-east1` datacenter would route the request to the node in the `us-west1` datacenter with the leaseholder.

2. The leaseholder node would execute the query and return the data to the gateway node.

3. The gateway node would return the data to the client.

In summary, this simple read request have to travel back and forth across the entire country.

### Writes

The geographic distribution of the Movr data is even more likely to impact write performance. For example, imagine that a user in Seattle and a user in New York want to create new Movr accounts:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO users \
VALUES (gen_random_uuid(), 'seattle', 'Seatller', '111 East Street', '1736352379937347');
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO users \
VALUES (gen_random_uuid(), 'new york', 'New Yorker', '111 West Street', '9822222379937347');
~~~

For the single range containing `users` data, one replica is in each datacenter, with the leaseholder in the `us-west2` datacenter. This means that:

- When creating the user in Seattle, the request doesn't have to leave the region to reach the leaseholder. However, since a write requires consensus from its replica group, the write has to wait for confirmation from either the replica in `us-west1` (Los Angeles, San Francisco) or `us-east1` (New York, Boston, Washington DC) before committing and then returning confirmation to the client.

- When creating the user in New York, there are more network hops and, thus, increased latency. The request first needs to travel across the continent to the leaseholder in `us-west1`. It then has to wait for confirmation from either the replica in us-west2 (Los Angeles, San Francisco) or `us-east1` (New York, Boston, Washington DC) before committing and then returning confirmation to the client back in the east.

## Step 5. Partition data by city

For this service, the most effective technique for improving read and write latency is to geo-partition the data by city. In essence, this means changing the way data is mapped to ranges. Instead of an entire table and its indexes mapping to a specific range or set of ranges, all rows in the table and its indexes with a given city will map to a range or set of ranges.

{{site.data.alerts.callout_info}}
The following steps partition each table by city to demonstrate the feature. In production, it is recommended that you use a `region` constraint on the database instead.
{{site.data.alerts.end}}

1. Partition the `users` table by city:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE users \
    PARTITION BY LIST (city) ( \
        PARTITION new_york VALUES IN ('new york'), \
        PARTITION boston VALUES IN ('boston'), \
        PARTITION washington_dc VALUES IN ('washington dc'), \
        PARTITION seattle VALUES IN ('seattle'), \
        PARTITION san_francisco VALUES IN ('san francisco'), \
        PARTITION los_angeles VALUES IN ('los angeles') \
    );
    ~~~

2. Partition the `vehicles` table by city:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE vehicles \
    PARTITION BY LIST (city) ( \
        PARTITION new_york VALUES IN ('new york'), \
        PARTITION boston VALUES IN ('boston'), \
        PARTITION washington_dc VALUES IN ('washington dc'), \
        PARTITION seattle VALUES IN ('seattle'), \
        PARTITION san_francisco VALUES IN ('san francisco'), \
        PARTITION los_angeles VALUES IN ('los angeles') \
    );
    ~~~

3. Partition the `rides` table by city:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE rides \
    PARTITION BY LIST (city) ( \
        PARTITION new_york VALUES IN ('new york'), \
        PARTITION boston VALUES IN ('boston'), \
        PARTITION washington_dc VALUES IN ('washington dc'), \
        PARTITION seattle VALUES IN ('seattle'), \
        PARTITION san_francisco VALUES IN ('san francisco'), \
        PARTITION los_angeles VALUES IN ('los angeles') \
    );
    ~~~

{{site.data.alerts.callout_info}}
You didn't create any secondary indexes on your Movr tables. However, if you had, it would be important to partition the secondary indexes as well.
{{site.data.alerts.end}}

## Step 6. Pin partitions close to users

With the data partitioned by city, you can now use [replication zones](../configure-replication-zones.html#create-a-replication-zone-for-a-table-or-secondary-index-partition) to require that city data be stored on specific nodes based on locality:

City | Locality
-----|---------
New York | `datacenter=us-east1`
Boston | `datacenter=us-east1`
Washington DC | `datacenter=us-east1`
Seattle | `datacenter=us-west1`
San Francisco | `datacenter=us-west2`
Los Angelese | `datacenter=us-west2`

{{site.data.alerts.callout_info}}
Since our nodes are located in 3 specific datacenters, we're only going to use the `datacenter=` portion of node locality. If we were using multiple datacenters per regions, we would likely use the `region=` portion of the node locality instead.
{{site.data.alerts.end}}

1. Start with the `users` table partitions:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER PARTITION new_york OF TABLE movr.users \
    CONFIGURE ZONE USING constraints='[+datacenter=us-east1]';

    > ALTER PARTITION boston OF TABLE movr.users \
    CONFIGURE ZONE USING constraints='[+datacenter=us-east1]';

    > ALTER PARTITION washington_dc OF TABLE movr.users \
    CONFIGURE ZONE USING constraints='[+datacenter=us-east1]';

    > ALTER PARTITION seattle OF TABLE movr.users \
    CONFIGURE ZONE USING constraints='[+datacenter=us-west1]';

    > ALTER PARTITION san_francisco OF TABLE movr.users \
    CONFIGURE ZONE USING constraints='[+datacenter=us-west2]';

    > ALTER PARTITION los_angeles OF TABLE movr.users \
    CONFIGURE ZONE USING constraints='[+datacenter=us-west2]';
    ~~~

2. Move on to the `vehicles` table partitions:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER PARTITION new_york OF TABLE movr.vehicles \
    CONFIGURE ZONE USING constraints='[+datacenter=us-east1]';

    > ALTER PARTITION boston OF TABLE movr.vehicles \
    CONFIGURE ZONE USING constraints='[+datacenter=us-east1]';

    > ALTER PARTITION washington_dc OF TABLE movr.vehicles \
    CONFIGURE ZONE USING constraints='[+datacenter=us-east1]';

    > ALTER PARTITION seattle OF TABLE movr.vehicles \
    CONFIGURE ZONE USING constraints='[+datacenter=us-west1]';

    > ALTER PARTITION san_francisco OF TABLE movr.vehicles \
    CONFIGURE ZONE USING constraints='[+datacenter=us-west2]';

    > ALTER PARTITION los_angeles OF TABLE movr.vehicles \
    CONFIGURE ZONE USING constraints='[+datacenter=us-west2]';
    ~~~

3. Finish with the `rides` table partitions:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER PARTITION new_york OF TABLE movr.rides \
    CONFIGURE ZONE USING constraints='[+datacenter=us-east1]';

    > ALTER PARTITION boston OF TABLE movr.rides \
    CONFIGURE ZONE USING constraints='[+datacenter=us-east1]';

    > ALTER PARTITION washington_dc OF TABLE movr.rides \
    CONFIGURE ZONE USING constraints='[+datacenter=us-east1]';

    > ALTER PARTITION seattle OF TABLE movr.rides \
    CONFIGURE ZONE USING constraints='[+datacenter=us-west1]';

    > ALTER PARTITION san_francisco OF TABLE movr.rides \
    CONFIGURE ZONE USING constraints='[+datacenter=us-west2]';

    > ALTER PARTITION los_angeles OF TABLE movr.rides \
    CONFIGURE ZONE USING constraints='[+datacenter=us-west2]';
    ~~~

{{site.data.alerts.callout_info}}
If you had created any secondary index partitions, it would be important to create replication zones for each such partition as well.
{{site.data.alerts.end}}

## Step 7. Check data distribution after partitioning

Over the next minutes, CockroachDB will rebalance all partitions based on the constraints you defined.

To check this, run the `SHOW EXPERIMENTAL_RANGES` statement on the `vehicles` and `users` tables:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW EXPERIMENTAL_RANGES FROM TABLE vehicles] \
WHERE "start_key" NOT LIKE '%Prefix%';
~~~

~~~
     start_key     |          end_key           | range_id | replicas | lease_holder
+------------------+----------------------------+----------+----------+--------------+
  /"boston"        | /"boston"/PrefixEnd        |       72 | {1,2,3}  |            3
  /"los angeles"   | /"los angeles"/PrefixEnd   |       85 | {7,8,9}  |            8
  /"new york"      | /"new york"/PrefixEnd      |       70 | {1,2,3}  |            1
  /"san francisco" | /"san francisco"/PrefixEnd |      113 | {7,8,9}  |            7
  /"seattle"       | /"seattle"/PrefixEnd       |      111 | {4,5,6}  |            5
  /"washington dc" | /"washington dc"/PrefixEnd |       74 | {1,2,3}  |            3
(6 rows)
~~~    

{{site.data.alerts.callout_info}}
The `WHERE` clause in this query excludes the empty ranges between the city ranges. These empty ranges use the default replication zone configuration, not the zone configuration you set for the cities.
{{site.data.alerts.end}}

For added clarity, here's a key showing how nodes map to datacenters and cities:

Node IDs | Datacenter | Cities
---------|------------|-------
1 - 3 | `datacenter=us-east1` | New York, Boston, Washington DC
4 - 6 | `datacenter=us-west1` | Seattle
7 - 9 | `datacenter=us-west2` | San Francisco, Los Angeles

We can see that, after partitioning, the replicas for New York, Boston, and Washington DC are located on nodes 1-3 in `us-east1`, replicas for Seattle are located on nodes 4-6 in `us-west1`, and replicas for San Francisco and Los Angeles are located on nodes 7-9 in `us-west2`.

The same data distribution is in place for the partitions of other tables as well. For example, here's the `users` table:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW EXPERIMENTAL_RANGES FROM TABLE users] \
WHERE "start_key" IS NOT NULL AND "start_key" NOT LIKE '%Prefix%';
~~~

~~~
     start_key     |          end_key           | range_id | replicas | lease_holder
+------------------+----------------------------+----------+----------+--------------+
  /"boston"        | /"boston"/PrefixEnd        |       64 | {1,2,3}  |            1
  /"los angeles"   | /"los angeles"/PrefixEnd   |       68 | {7,8,9}  |            8
  /"new york"      | /"new york"/PrefixEnd      |       62 | {1,2,3}  |            2
  /"san francisco" | /"san francisco"/PrefixEnd |       83 | {7,8,9}  |            8
  /"seattle"       | /"seattle"/PrefixEnd       |       81 | {4,5,6}  |            6
  /"washington dc" | /"washington dc"/PrefixEnd |       66 | {1,2,3}  |            2
(6 rows)
~~~

## Step 8. Consider performance after partitioning

After partitioning, reads and writes for a specific city will be much faster because all replicas for that city are now located on the nodes closest to the city. To think this through, let's reconsider the read and write examples from before partitioning.

### Reads

Once again, imagine you are a Movr administrator in New York, and you want to get the IDs and descriptions of all New York-based bikes that are currently in use. You issue the following query to one of the nodes in the `us-east1` datacenter:

{% include copy-clipboard.html %}
~~~ sql
> SELECT id, ext FROM vehicles \
WHERE city = 'new york' AND type = 'bike' AND status = 'in_use';
~~~

- Before partitioning, the leaseholder for the `vehicles` table was in the `us-west1` datacenter, causing the request to travel back and forth across the entire country.

- Now, as you saw above, the leaseholder for the New York partition of the `vehicles` table is the `us-east1` datacenter. This means that the read request does not need to leave the region.

### Writes

Now once again imagine that a user in Seattle and a user in New York want to create new Movr accounts.

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO users \
VALUES (gen_random_uuid(), 'seattle', 'Seatller', '111 East Street', '1736352379937347');
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO users \
VALUES (gen_random_uuid(), 'new york', 'New Yorker', '111 West Street', '9822222379937347');
~~~

- Before partitioning, the leaseholder wasn't necessarily in the same region as the node receiving the request, and replicas required to reach consensus were spread across all regions, causing increased latency.

- Now, as you saw above, all 3 replicas for the Seattle partition of the `users` table are in the `us-west1` datacenter, and all 3 replicas for the New York partition of the `users` table are the `us-east1` datacenter. This means that the write requests to do not need to leave their respective regions to achieve consensus and commit.

## Step 9. Clean up

In the next module, you'll start with a fresh cluster, so take a moment to clean things up.

1. Exit the SQL shell:

    {% include copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

2. Stop all CockroachDB nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach
    ~~~

    This simplified shutdown process is only appropriate for a lab/evaluation scenario.

3. Remove the nodes' data directories:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node1 node2 node3 node4 node5 node6 node7 node8 node9
    ~~~

## What's next?

[Orchestration with Kubernetes](orchestration-with-kubernetes.html)
