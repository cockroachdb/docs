---
title: Performance Tuning
summary: Essential techniques for getting fast reads and writes in a single- and multi-region CockroachDB deployment.
toc: true
drift: true
---

This tutorial shows you essential techniques for getting fast reads and writes in CockroachDB, starting with a single-region deployment and expanding into multiple regions.

For a comprehensive list of tuning recommendations, only some of which are demonstrated here, see [SQL Performance Best Practices](performance-best-practices-overview.html).

## Overview

### Topology

You'll start with a 3-node CockroachDB cluster in a single Google Compute Engine (GCE) zone, with an extra instance for read/write testing using a simple Python client:

<img src="{{ 'images/v2.0/perf_tuning_single_region_topology.png' | relative_url }}" alt="Perf tuning topology" style="max-width:100%" />

{{site.data.alerts.callout_info}}
Within a single GCE zone, network latency between instances should be sub-millisecond.
{{site.data.alerts.end}}

You'll then scale the cluster to 9 nodes running across 3 GCE regions, with an extra instance in each region for read/write testing:

<img src="{{ 'images/v2.0/perf_tuning_multi_region_topology.png' | relative_url }}" alt="Perf tuning topology" style="max-width:100%" />

To reproduce the performance demonstrated in this tutorial:

- For CockroachDB nodes, you'll use [`n1-standard-4`](https://cloud.google.com/compute/docs/machine-types#standard_machine_types) instances (4 vCPUs, 15 GB memory) with [local SSDs](https://cloud.google.com/compute/docs/disks/#localssds).
- For read/write testing, you'll use smaller instances, such as `n1-standard-1`.

### Schema

You'll use sample schema and data for Cockroach Lab's fictional vehicle-sharing company, [MovR](https://github.com/cockroachdb/movr):

<img src="{{ 'images/v2.0/perf_tuning_movr_schema.png' | relative_url }}" alt="Perf tuning schema" style="max-width:100%" />

A few notes about the schema:

- Each table has a compound primary key, with `city` being first in the key. Although not necessary initially in the single-region deployment, once you scale the cluster to multiple regions, these compound primary keys will enable you to [geo-partition data at the row level](partitioning.html#partition-using-primary-key) by `city`. As such, this tutorial demonstrates a schema designed for future scaling.
- The [`IMPORT`](import.html) feature you'll use to import the data does not support foreign keys, so you'll import the data without [foreign key constraints](foreign-key.html). However, the import will create the secondary indexes required to add the foreign keys later.
- The `rides` table contains both `city` and the seemingly redundant `vehicle_city`. This redundancy is necessary because, while it is not possible to apply more than one foreign key constraint to a single column, you will need to apply two foreign key constraints to the `rides` table, and each will require city as part of the constraint. The duplicate `vehicle_city`, which is kept in synch with `city` via a [`CHECK` constraint](check.html), lets you overcome [this limitation](https://github.com/cockroachdb/cockroach/issues/23580).

### Important concepts

To understand the techniques in this tutorial, and to be able to apply them in your own scenarios, it's important to first review some important [CockroachDB architectural concepts](architecture/overview.html):

Concept | Description
--------|------------
**Cluster** | Your CockroachDB deployment, which acts as a single logical application.
**Node** | An individual machine running CockroachDB. Many nodes join together to create your cluster.
**Range** | CockroachDB stores all user data (tables, indexes, etc.) and almost all system data in a giant sorted map of key-value pairs. This keyspace is divided into "ranges", contiguous chunks of the keyspace, so that every key can always be found in a single range.<br><br>From a SQL perspective, a table and its secondary indexes initially map to a single range, where each key-value pair in the range represents a single row in the table (also called the primary index because the table is sorted by the primary key) or a single row in a secondary index. As soon as a range reaches 64 MiB in size, it splits into two ranges. This process continues as the table and its indexes continue growing.
**Replica** | CockroachDB replicates each range (3 times by default) and stores each replica on a different node.
**Leaseholder** | For each range, one of the replicas holds the "range lease". This replica, referred to as the "leaseholder", is the one that receives and coordinates all read and write requests for the range.
**Raft Leader** | For each range, one of the replicas is the "leader" for write requests. Via the [Raft consensus protocol](architecture/replication-layer.html#raft), this replica ensures that a majority of replicas (the leader and enough followers) agree before committing the write. The Raft leader is almost always the same replica as the leaseholder.

As mentioned above, when a query is executed, the cluster routes the request to the leaseholder for the range containing the relevant data. If the query touches multiple ranges, the request goes to multiple leaseholders. For a read request, only the leaseholder of the relevant range retrieves the data. For a write request, the Raft consensus protocol dictates that a majority of the replicas of the relevant range must agree before the write is committed.

Let's consider how these mechanics play out in some hypothetical queries.

First, imagine a simple read scenario where:

- There are 3 nodes in the cluster.
- There are 3 small tables, each fitting in a single range.
- Ranges are replicated 3 times (the default).
- A query is executed against node 2 to read from table 3.

<img src="{{ 'images/v2.0/perf_tuning_concepts1.png' | relative_url }}" alt="Perf tuning concepts" style="max-width:100%" />

In this case:

1. Node 2 (the gateway node) receives the request to read from table 3.
2. The leaseholder for table 3 is on node 3, so the request is routed there.
3. Node 3 returns the data to node 2.
4. Node 2 responds to the client.

If the query is received by the node that has the leaseholder for the relevant range, there are fewer network hops:

<img src="{{ 'images/v2.0/perf_tuning_concepts2.png' | relative_url }}" alt="Perf tuning concepts" style="max-width:100%" />

Now imagine a simple write scenario where a query is executed against node 3 to write to table 1:

<img src="{{ 'images/v2.0/perf_tuning_concepts3.png' | relative_url }}" alt="Perf tuning concepts" style="max-width:100%" />

In this case:

1. Node 3 (the gateway node) receives the request to write to table 1.
2. The leaseholder for table 1 is on node 1, so the request is routed there.
3. The leaseholder is the same replica as the Raft leader (as is typical), so it applies the provisional write to itself and then proposes the write to its follower replicas on nodes 2 and 3.
4. As soon as one of the followers acknowledges the provisional write (and thus a majority of replicas agree), the write is committed by the two agreeing replicas. In this diagram, the follower on node 2 acknowledged the provisional write, but it could just as well have been the follower on node 3. Also note that the follower not involved in the consensus agreement usually commits the write very soon after the others.
5. Node 1 returns acknowledgement of the commit to node 3.
6. Node 3 responds to the client.

Just as in the read scenario, if the write request is received by the node that has the leaseholder and Raft leader for the relevant range, there are fewer network hops:

<img src="{{ 'images/v2.0/perf_tuning_concepts4.png' | relative_url }}" alt="Perf tuning concepts" style="max-width:100%" />

## Single-region deployment

<!-- roachprod instructions for single-region deployment
1. Reserve 12 VMs across 3 GCE zone: roachprod create jesse-perf-tuning --geo --gce-zones us-east1-b,us-west1-a,us-west2-a --local-ssd -n 12
2. Put cockroach` on all VM: `roachprod run jesse-perf-tuning "curl https://binaries.cockroachdb.com/cockroach-v2.0.4.linux-amd64.tgz | tar -xvz; mv cockroach-v2.0.4.linux-amd64/cockroach cockroach"
3. Start the cluster in us-east1-b: roachprod start jesse-perf-tuning:1-3
4. List the IP address of all instances: roachprod list -d jesse-perf-tuning
5. SSH onto instance 4: roachprod run jesse-perf-tuning:4
6. Start sql shell: ./cockroach sql --insecure --host=<IP address of any running node>
7. Run the SQL commands in Step 4 below.
8. Still on instance 4, install the Python client. See step 5.
-->

### Step 1. Configure your network

CockroachDB requires TCP communication on two ports:

- **26257** (`tcp:26257`) for inter-node communication (i.e., working as a cluster)
- **8080** (`tcp:8080`) for accessing the Web UI

Since GCE instances communicate on their internal IP addresses by default, you don't need to take any action to enable inter-node communication. However, if you want to access the Web UI from your local network, you must [create a firewall rule for your project](https://cloud.google.com/vpc/docs/using-firewalls):

Field | Recommended Value
------|------------------
Name | **cockroachadmin**
Source filter | IP ranges
Source IP ranges | Your local network's IP ranges
Allowed protocols | **tcp:8080**
Target tags | `cockroachdb`

{{site.data.alerts.callout_info}}
The **tag** feature will let you easily apply the rule to your instances.
{{site.data.alerts.end}}

### Step 2. Create instances

You'll start with a 3-node CockroachDB cluster in the `us-east1-b` GCE zone, with an extra instance for read/write testing using a simple Python client.

1. [Create 3 instances](https://cloud.google.com/compute/docs/instances/create-start-instance) for your CockroachDB nodes. While creating each instance:  
    - Select the **us-east1-b** [zone](https://cloud.google.com/compute/docs/regions-zones/).
    - Use the `n1-standard-4` machine type (4 vCPUs, 15 GB memory).
    - [Create and mount a local SSD](https://cloud.google.com/compute/docs/disks/local-ssd#create_local_ssd).
    - To apply the Web UI firewall rule you created earlier, click **Management, disk, networking, SSH keys**, select the **Networking** tab, and then enter `cockroachdb` in the **Network tags** field.

2. Note the internal IP address of each `n1-standard-4` instance. You'll need these addresses when starting the CockroachDB nodes.

3. Create a separate instance for read/write testing, also in the **us-east1-b** zone. This instance can be smaller, such as `n1-standard-1`.

### Step 3. Start a 3-node cluster

1. SSH to the first `n1-standard-4` instance.

2. Download the [CockroachDB archive](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz) for Linux, extract the binary, and copy it into the `PATH`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar  xvz
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin
    ~~~

    If you get a permissions error, prefix the command with `sudo`.

3. Run the [`cockroach start`](start-a-node.html) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --advertise-host=<node1 internal address> \
    --join=<node1 internal address>:26257,<node2 internal address>:26257,<node3 internal address>:26257 \
    --locality=cloud=gce,region=us-east1,zone=us-east1-b \
    --cache=.25 \
    --max-sql-memory=.25 \
    --background
    ~~~

4. Repeat steps 1 - 3 for the other two `n1-standard-4` instances.

5. On any of the `n1-standard-4` instances, run the [`cockroach init`](initialize-a-cluster.html) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --insecure --host=localhost
    ~~~

    Each node then prints helpful details to the [standard output](start-a-node.html#standard-output), such as the CockroachDB version, the URL for the Web UI, and the SQL URL for clients.

### Step 4. Import the Movr dataset

Now you'll import Movr data representing users, vehicles, and rides in 3 eastern US cities (New York, Boston, and Washington DC) and 3 western US cities (Los Angeles, San Francisco, and Seattle).

1. SSH to the fourth instance, the one not running a CockroachDB node.

2. Download the [CockroachDB archive](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz) for Linux, and extract the binary:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar  xvz
    ~~~

3. Copy the binary into the `PATH`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin
    ~~~

    If you get a permissions error, prefix the command with `sudo`.

4. Start the [built-in SQL shell](use-the-built-in-sql-client.html), pointing it one of the CockroachDB nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure --host=<address of any node>
    ~~~

5. Create the `movr` database and set it as the default:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE movr;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET DATABASE = movr;
    ~~~

6. Use the [`IMPORT`](import.html) statement to create and populate the `users`, `vehicles,` and `rides` tables:

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
    +--------------------+-----------+--------------------+------+---------------+----------------+-------+
    |       job_id       |  status   | fraction_completed | rows | index_entries | system_records | bytes |
    +--------------------+-----------+--------------------+------+---------------+----------------+-------+
    | 370636591722889217 | succeeded |                  1 |    0 |             0 |              0 |     0 |
    +--------------------+-----------+--------------------+------+---------------+----------------+-------+
    (1 row)

    Time: 3.409449563s
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
        CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
        INDEX vehicles_auto_index_fk_city_ref_users (city ASC, owner_id ASC)
    )
    CSV DATA (
        'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/perf-tuning/vehicles/n1.0.csv'
    );
    ~~~

    ~~~
    +--------------------+-----------+--------------------+------+---------------+----------------+-------+
    |       job_id       |  status   | fraction_completed | rows | index_entries | system_records | bytes |
    +--------------------+-----------+--------------------+------+---------------+----------------+-------+
    | 370636877487505409 | succeeded |                  1 |    0 |             0 |              0 |     0 |
    +--------------------+-----------+--------------------+------+---------------+----------------+-------+
    (1 row)

    Time: 5.646142826s
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
        CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
        INDEX rides_auto_index_fk_city_ref_users (city ASC, rider_id ASC),
        INDEX rides_auto_index_fk_vehicle_city_ref_vehicles (vehicle_city ASC, vehicle_id ASC),
        CONSTRAINT check_vehicle_city_city CHECK (vehicle_city = city)
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
    +--------------------+-----------+--------------------+------+---------------+----------------+-------+
    |       job_id       |  status   | fraction_completed | rows | index_entries | system_records | bytes |
    +--------------------+-----------+--------------------+------+---------------+----------------+-------+
    | 370636986413285377 | succeeded |                  1 |    0 |             0 |              0 |     0 |
    +--------------------+-----------+--------------------+------+---------------+----------------+-------+
    (1 row)

    Time: 42.781522085s
    ~~~

    {{site.data.alerts.callout_success}}
    You can observe the progress of imports as well as all schema change operations (e.g., adding secondary indexes) on the [**Jobs** page](admin-ui-jobs-page.html) of the Web UI.
    {{site.data.alerts.end}}

7. Logically, there should be a number of [foreign key](foreign-key.html) relationships between the tables:

    Referencing columns | Referenced columns
    --------------------|-------------------
    `vehicles.city/vehicles.owner_id` | `users.city/users.id`
    `rides.city/rides.rider_id` | `users.city/users.id`
    `rides.vehicle_city/rides.vehicle_id` | `vehicles.city/vehicles.id`

    As mentioned earlier, it wasn't possible to put these relationships in place during `IMPORT`, but it was possible to create the required secondary indexes. Now, let's add the foreign key constraints:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE vehicles
    ADD CONSTRAINT fk_city_ref_users
    FOREIGN KEY (city, owner_id)
    REFERENCES users (city, id);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE rides
    ADD CONSTRAINT fk_city_ref_users
    FOREIGN KEY (city, rider_id)
    REFERENCES users (city, id);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE rides
    ADD CONSTRAINT fk_vehicle_city_ref_vehicles
    FOREIGN KEY (vehicle_city, vehicle_id)
    REFERENCES vehicles (city, id);
    ~~~

8. Exit the built-in SQL shell:

    {% include copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

### Step 5. Install the Python client

When measuring SQL performance, it's best to run a given statement multiple times and look at the average and/or cumulative latency. For that purpose, you'll install and use a Python testing client.

1. Still on the fourth instance, make sure all of the system software is up-to-date:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo apt-get update && sudo apt-get -y upgrade
    ~~~

2. Install Pip:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo apt-get install python-pip
    ~~~

3. Use Pip to install the `psycopg2` driver:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pip install psycopg2-binary
    ~~~

4. Download the Python client:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/performance/tuning.py
    ~~~

    As you'll see below, this client lets you pass command-line flags:

    Flag | Description
    -----|------------
    `--host` | The IP address of the target node. This is used in the client's connection string.
    `--statement` | The SQL statement to execute.
    `--repeat` | The number of times to repeat the statement. This defaults to 20.

    When run, the client prints the average time in seconds across all repetitions of the statement. Optionally, you can pass two other flags, `--time` to print the execution time in seconds for each repetition of the statement, and `--cumulative` to print the cumulative time in seconds for all repetitions. `--cumulative` is particularly useful when testing writes.

    {{site.data.alerts.callout_success}}
    To get similar help directly in your shell, use `python tuning.py --help`.
    {{site.data.alerts.end}}

### Step 6. Test/tune read performance

<!-- {{site.data.alerts.callout_success}}
When reading from a table or index for the first time, the query will be slower than usual because the node issuing the query loads the schema of the table or index into memory first. For this reason, if you see an unusually slow query when first reading from a table, run the query a few more times to see more typical latencies.
{{site.data.alerts.end}} -->

- [Filtering by the primary key](#filtering-by-the-primary-key)
- [Filtering by a non-indexed column (full table scan)](#filtering-by-a-non-indexed-column-full-table-scan)
- [Filtering by a secondary index](#filtering-by-a-secondary-index)
- [Filtering by a secondary index storing additional columns](#filtering-by-a-secondary-index-storing-additional-columns)
- [Joining data from different tables](#joining-data-from-different-tables)
- [Using `IN (list)` with a subquery](#using-in-list-with-a-subquery)
- [Using `IN (list)` with explicit values](#using-in-list-with-explicit-values)

#### Filtering by the primary key

Retrieving a single row based on the primary key will usually return in 2ms or less:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="SELECT * FROM rides WHERE city = 'boston' AND id = '000007ef-fa0f-4a6e-a089-ce74aa8d2276'" \
--repeat=20 \
--times
~~~

~~~
Result:
['id', 'city', 'vehicle_city', 'rider_id', 'vehicle_id', 'start_address', 'end_address', 'start_time', 'end_time', 'revenue']
['000007ef-fa0f-4a6e-a089-ce74aa8d2276', 'boston', 'boston', 'd66c386d-4b7b-48a7-93e6-f92b5e7916ab', '6628bbbc-00be-4891-bc00-c49f2f16a30b', '4081 Conner Courts\nSouth Taylor, VA 86921', '2808 Willis Wells Apt. 931\nMccoyberg, OH 10303-4879', '2018-07-20 01:46:46.003070', '2018-07-20 02:27:46.003070', '44.25']

Times (seconds):
[0.0010800361633300781, 0.00084686279296875, 0.0005657672882080078, 0.0006098747253417969, 0.0007770061492919922, 0.0005829334259033203, 0.0006110668182373047, 0.0005359649658203125, 0.0006079673767089844, 0.0005729198455810547, 0.0005409717559814453, 0.0005869865417480469, 0.0005261898040771484, 0.0005090236663818359, 0.0005309581756591797, 0.0009059906005859375, 0.0005719661712646484, 0.0006320476531982422, 0.000514984130859375, 0.0008339881896972656]

Average time (seconds):
0.000647175312042
~~~

Retrieving a subset of columns will usually be even faster:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="SELECT rider_id, vehicle_id \
FROM rides \
WHERE city = 'boston' AND id = '000007ef-fa0f-4a6e-a089-ce74aa8d2276'" \
--repeat=20 \
--times
~~~

~~~
Result:
['rider_id', 'vehicle_id']
['d66c386d-4b7b-48a7-93e6-f92b5e7916ab', '6628bbbc-00be-4891-bc00-c49f2f16a30b']

Times (seconds):
[0.0009799003601074219, 0.0005009174346923828, 0.00048613548278808594, 0.0005409717559814453, 0.0005581378936767578, 0.00045800209045410156, 0.0004870891571044922, 0.0005230903625488281, 0.00045800209045410156, 0.0004839897155761719, 0.0004699230194091797, 0.0005090236663818359, 0.000476837158203125, 0.0004990100860595703, 0.0005068778991699219, 0.0005059242248535156, 0.00047087669372558594, 0.0004489421844482422, 0.0005090236663818359, 0.00044608116149902344]

Average time (seconds):
0.000515937805176
~~~

#### Filtering by a non-indexed column (full table scan)

You'll get generally poor performance when retrieving a single row based on a column that is not in the primary key or any secondary index:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="SELECT * FROM users WHERE name = 'Natalie Cunningham'" \
--repeat=20 \
--times
~~~

~~~
Result:
['id', 'city', 'name', 'address', 'credit_card']
['02cc9e5b-1e91-4cdb-87c4-726b4ea7219a', 'boston', 'Natalie Cunningham', '97477 Lee Path\nKimberlyport, CA 65960', '4532613656695680']

Times (seconds):
[0.026278972625732422, 0.004083871841430664, 0.003732919692993164, 0.0037200450897216797, 0.0037081241607666016, 0.0037050247192382812, 0.003620147705078125, 0.003258943557739258, 0.003325939178466797, 0.003280162811279297, 0.0036420822143554688, 0.003031015396118164, 0.0031991004943847656, 0.003309011459350586, 0.0038309097290039062, 0.0033729076385498047, 0.0030660629272460938, 0.003774881362915039, 0.0036859512329101562, 0.0036399364471435547]

Average time (seconds):
0.00466330051422
~~~

To understand why this query performs poorly, use the SQL client built into the `cockroach` binary to [`EXPLAIN`](explain.html) the query plan:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="EXPLAIN SELECT * FROM users WHERE name = 'Natalie Cunningham';"
~~~

~~~
+------+-------+---------------+
| Tree | Field |  Description  |
+------+-------+---------------+
| scan |       |               |
|      | table | users@primary |
|      | spans | ALL           |
+------+-------+---------------+
(3 rows)
~~~

The row with `spans | ALL` shows you that, without a secondary index on the `name` column, CockroachDB scans every row of the `users` table, ordered by the primary key (`city`/`id`), until it finds the row with the correct `name` value.

#### Filtering by a secondary index

To speed up this query, add a secondary index on `name`:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="CREATE INDEX on users (name)" \
--repeat=1
~~~

The query will now return much faster:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="SELECT * FROM users WHERE name = 'Natalie Cunningham'" \
--repeat=20 \
--times
~~~

~~~
Result:
['id', 'city', 'name', 'address', 'credit_card']
['02cc9e5b-1e91-4cdb-87c4-726b4ea7219a', 'boston', 'Natalie Cunningham', '97477 Lee Path\nKimberlyport, CA 65960', '4532613656695680']

Times (seconds):
[0.002452850341796875, 0.0013418197631835938, 0.0013599395751953125, 0.0014269351959228516, 0.0014050006866455078, 0.0013370513916015625, 0.0016591548919677734, 0.0017900466918945312, 0.0014328956604003906, 0.0013840198516845703, 0.001508951187133789, 0.0013611316680908203, 0.0012998580932617188, 0.0015838146209716797, 0.0014171600341796875, 0.0015020370483398438, 0.0014908313751220703, 0.0013768672943115234, 0.001447916030883789, 0.0014200210571289062]

Average time (seconds):
0.00149991512299
~~~

To understand why performance improved from 4.66ms (without index) to 1.46ms (with index), use [`EXPLAIN`](explain.html) to see the new query plan:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="EXPLAIN SELECT * FROM users WHERE name = 'Natalie Cunningham';"
~~~

~~~
+------------+-------+-------------------------------------------------------+
|    Tree    | Field |                      Description                      |
+------------+-------+-------------------------------------------------------+
| index-join |       |                                                       |
|  ├── scan  |       |                                                       |
|  │         | table | users@users_name_idx                                  |
|  │         | spans | /"Natalie Cunningham"-/"Natalie Cunningham"/PrefixEnd |
|  └── scan  |       |                                                       |
|            | table | users@primary                                         |
+------------+-------+-------------------------------------------------------+
(6 rows)
~~~

This shows you that CockroachDB starts with the secondary index (`table | users@users_name_idx`). Because it is sorted by `name`, the query can jump directly to the relevant value (`spans | /"Natalie Cunningham"-/"Natalie Cunningham"/PrefixEnd`). However, the query needs to return values not in the secondary index, so CockroachDB grabs the primary key (`city`/`id`) stored with the `name` value (the primary key is always stored with entries in a secondary index), jumps to that value in the primary index, and then returns the full row.

Thinking back to the [earlier discussion of ranges and leaseholders](#important-concepts), because the `users` table is small (under 64 MiB), the primary index and all secondary indexes are contained in a single range with a single leaseholder. If the table were bigger, however, the primary index and secondary index could reside in separate ranges, each with its own leaseholder. In this case, if the leaseholders were on different nodes, the query would require more network hops, further increasing latency.

#### Filtering by a secondary index storing additional columns

When you have a query that filters by a specific column but retrieves a subset of the table's total columns, you can improve performance by [storing](indexes.html#storing-columns) those additional columns in the secondary index to prevent the query from needing to scan the primary index as well.

For example, let's say you frequently retrieve a user's name and credit card number:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="SELECT name, credit_card FROM users WHERE name = 'Natalie Cunningham'" \
--repeat=20 \
--times
~~~

~~~
Result:
['name', 'credit_card']
['Natalie Cunningham', '4532613656695680']

Times (seconds):
[0.0023179054260253906, 0.0012519359588623047, 0.0012669563293457031, 0.0012290477752685547, 0.0016200542449951172, 0.0014350414276123047, 0.001255035400390625, 0.0013058185577392578, 0.0012810230255126953, 0.0015408992767333984, 0.001352071762084961, 0.0013499259948730469, 0.001294851303100586, 0.0013821125030517578, 0.0013370513916015625, 0.0013339519500732422, 0.0013740062713623047, 0.0013701915740966797, 0.001294851303100586, 0.0013802051544189453]

Average time (seconds):
0.00139864683151
~~~

With the current secondary index on `name`, CockroachDB still needs to scan the primary index to get the credit card number:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="EXPLAIN SELECT name, credit_card FROM users WHERE name = 'Natalie Cunningham';"
~~~

~~~
+-----------------+-------+-------------------------------------------------------+
|      Tree       | Field |                      Description                      |
+-----------------+-------+-------------------------------------------------------+
| render          |       |                                                       |
|  └── index-join |       |                                                       |
|       ├── scan  |       |                                                       |
|       │         | table | users@users_name_idx                                  |
|       │         | spans | /"Natalie Cunningham"-/"Natalie Cunningham"/PrefixEnd |
|       └── scan  |       |                                                       |
|                 | table | users@primary                                         |
+-----------------+-------+-------------------------------------------------------+
(7 rows)
~~~

Let's drop and recreate the index on `name`, this time storing the `credit_card` value in the index:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="DROP INDEX users_name_idx" \
--repeat=1
~~~

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="CREATE INDEX ON users (name) STORING (credit_card)" \
--repeat=1
~~~

Now that `credit_card` values are stored in the index on `name`, CockroachDB only needs to scan that index:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="EXPLAIN SELECT name, credit_card FROM users WHERE name = 'Natalie Cunningham';"
~~~

~~~
+-----------+-------+-------------------------------------------------------+
|   Tree    | Field |                      Description                      |
+-----------+-------+-------------------------------------------------------+
| render    |       |                                                       |
|  └── scan |       |                                                       |
|           | table | users@users_name_idx                                  |
|           | spans | /"Natalie Cunningham"-/"Natalie Cunningham"/PrefixEnd |
+-----------+-------+-------------------------------------------------------+
(4 rows)
~~~

This results in even faster performance, reducing latency from 1.39ms (index without storing) to 0.88ms (index with storing):

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="SELECT name, credit_card FROM users WHERE name = 'Natalie Cunningham'" \
--repeat=20 \
--times
~~~

~~~
Result:
['name', 'credit_card']
['Natalie Cunningham', '4532613656695680']

Times (seconds):
[0.0018100738525390625, 0.001093149185180664, 0.0007748603820800781, 0.0009019374847412109, 0.0009698867797851562, 0.0008130073547363281, 0.0007948875427246094, 0.0008280277252197266, 0.0008668899536132812, 0.0007891654968261719, 0.0008230209350585938, 0.0007350444793701172, 0.0007348060607910156, 0.0007479190826416016, 0.0007529258728027344, 0.0007338523864746094, 0.0007660388946533203, 0.0010318756103515625, 0.0008831024169921875, 0.0008199214935302734]

Average time (seconds):
0.000883519649506
~~~

#### Joining data from different tables

Secondary indexes are crucial when [joining](joins.html) data from different tables as well.

For example, let's say you want to count the number of users who started rides on a given day. To do this, you need to use a join to get the relevant rides from the `rides` table and then map the `rider_id` for each of those rides to the corresponding `id` in the `users` table, counting each mapping only once:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="SELECT count(DISTINCT users.id) \
FROM users \
INNER JOIN rides ON rides.rider_id = users.id \
WHERE start_time BETWEEN '2018-07-20 00:00:00' AND '2018-07-21 00:00:00'" \
--repeat=20 \
--times
~~~

~~~
Result:
['count']
['1998']

Times (seconds):
[0.7758419513702393, 0.774806022644043, 0.8030791282653809, 1.1019928455352783, 1.119262933731079, 1.11879301071167, 1.1011440753936768, 1.1259739398956299, 1.1259307861328125, 1.1105000972747803, 1.1096389293670654, 1.1185541152954102, 1.1049299240112305, 1.1261420249938965, 1.0914278030395508, 1.1200439929962158, 1.095339059829712, 1.0843729972839355, 1.1110708713531494, 1.1015660762786865]

Average time (seconds):
1.06102052927
~~~

To understand what's happening, use [`EXPLAIN`](explain.html) to see the query plan:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="EXPLAIN SELECT count(DISTINCT users.id) \
FROM users \
INNER JOIN rides ON rides.rider_id = users.id \
WHERE start_time BETWEEN '2018-07-20 00:00:00' AND '2018-07-21 00:00:00';"
~~~

~~~
+---------------------+----------+-------------------+
|        Tree         |  Field   |    Description    |
+---------------------+----------+-------------------+
| group               |          |                   |
|  └── render         |          |                   |
|       └── join      |          |                   |
|            │        | type     | inner             |
|            │        | equality | (id) = (rider_id) |
|            ├── scan |          |                   |
|            │        | table    | users@primary     |
|            │        | spans    | ALL               |
|            └── scan |          |                   |
|                     | table    | rides@primary     |
|                     | spans    | ALL               |
+---------------------+----------+-------------------+
(11 rows)
~~~

Reading from bottom up, you can see that CockroachDB does a full table scan (`spans    | ALL`) first on `rides` to get all rows with a `start_time` in the specified range and then does another full table scan on `users` to find matching rows and calculate the count.

Given that the `rides` table is large, its data is split across several ranges. Each range is replicated and has a leaseholder. At least some of these leaseholders are likely located on different nodes. This means that the full table scan of `rides` involves several network hops to various leaseholders before finally going to the leaseholder for `users` to do a full table scan there.

To track this specifically, let's use the [`SHOW EXPERIMENTAL_RANGES`](show-experimental-ranges.html) statement to find out where the relevant leaseholders reside for `rides` and `users`:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="SHOW EXPERIMENTAL_RANGES FROM TABLE rides;"
~~~

~~~
+------------------------------------------------------------------------+------------------------------------------------------------------------+----------+----------+--------------+
|                               Start Key                                |                                End Key                                 | Range ID | Replicas | Lease Holder |
+------------------------------------------------------------------------+------------------------------------------------------------------------+----------+----------+--------------+
| NULL                                                                   | /"boston"/"\xfe\xdd?\xbb4\xabOV\x84\x00M\x89#-a6"/PrefixEnd            |       25 | {1,2,3}  |            1 |
| /"boston"/"\xfe\xdd?\xbb4\xabOV\x84\x00M\x89#-a6"/PrefixEnd            | /"los angeles"/"\xf1\xe8\x99eǵI\x16\xb9w\a\xd01\xcc\b\xa4"/PrefixEnd   |       26 | {1,2,3}  |            2 |
| /"los angeles"/"\xf1\xe8\x99eǵI\x16\xb9w\a\xd01\xcc\b\xa4"/PrefixEnd   | /"new york"/"\xebV\xf5\xe6P%L$\x92\xd2\xdf&\a\x81\xeeO"/PrefixEnd      |       30 | {1,2,3}  |            3 |
| /"new york"/"\xebV\xf5\xe6P%L$\x92\xd2\xdf&\a\x81\xeeO"/PrefixEnd      | /"san francisco"/"\xda\xc5B\xe0\x0e\fK)\x98:\xe6[@\x05\x91*"/PrefixEnd |       33 | {1,2,3}  |            1 |
| /"san francisco"/"\xda\xc5B\xe0\x0e\fK)\x98:\xe6[@\x05\x91*"/PrefixEnd | /"seattle"/"\xd4ˆ?\x98\x98FA\xa7m\x84\xba\xac\xf5\xbfI"/PrefixEnd      |       34 | {1,2,3}  |            1 |
| /"seattle"/"\xd4ˆ?\x98\x98FA\xa7m\x84\xba\xac\xf5\xbfI"/PrefixEnd      | /"washington dc"/"5\x94\x90q#MOm\x8fQ\xdbg\x86\x16;\xb2"               |       36 | {1,2,3}  |            1 |
| /"washington dc"/"5\x94\x90q#MOm\x8fQ\xdbg\x86\x16;\xb2"               | NULL                                                                   |       38 | {1,2,3}  |            3 |
+------------------------------------------------------------------------+------------------------------------------------------------------------+----------+----------+--------------+
(7 rows)
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="SHOW EXPERIMENTAL_RANGES FROM TABLE users;"
~~~

~~~
+-----------+---------+----------+----------+--------------+
| Start Key | End Key | Range ID | Replicas | Lease Holder |
+-----------+---------+----------+----------+--------------+
| NULL      | NULL    |       24 | {1,2,3}  |            2 |
+-----------+---------+----------+----------+--------------+
(1 row)
~~~

The results above tell us that the `rides` table is split across 7 ranges, with four leaseholders on node 1, one leaseholder on node 2, and two leaseholders on node 3. The `users` table is just a single range with its leaseholder on node 2.

Now, given the `WHERE` condition of the join, the full table scan of `rides`, across all of its 7 ranges, is particularly wasteful. To speed up the query, you can create a secondary index on the `WHERE` condition (`rides.start_time`) storing the join key (`rides.rider_id`):

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="CREATE INDEX ON rides (start_time) STORING (rider_id)" \
--repeat=1
~~~

~~~
Average time (seconds):
229.562023878
~~~

{{site.data.alerts.callout_info}}
The `rides` table contains 1 million rows, so adding this index will take a few minutes.
{{site.data.alerts.end}}

Adding the secondary index reduced the query time from 1.06s to 58.45ms:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="SELECT count(DISTINCT users.id) \
FROM users \
INNER JOIN rides ON rides.rider_id = users.id \
WHERE start_time BETWEEN '2018-07-20 00:00:00' AND '2018-07-21 00:00:00'" \
--repeat=20 \
--times
~~~

~~~
Result:
['count']
['1998']

Times (seconds):
[0.12521815299987793, 0.06466078758239746, 0.058393001556396484, 0.05342888832092285, 0.054624080657958984, 0.05586600303649902, 0.05405998229980469, 0.054296016693115234, 0.053735971450805664, 0.053442955017089844, 0.053819894790649414, 0.05259585380554199, 0.051380157470703125, 0.05359792709350586, 0.054162025451660156, 0.05439305305480957, 0.059927940368652344, 0.05692005157470703, 0.05255579948425293, 0.05212092399597168]

Average time (seconds):
0.0584599733353
~~~

To understand why performance improved, again use [`EXPLAIN`](explain.html) to see the new query plan:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="EXPLAIN SELECT count(DISTINCT users.id) \
FROM users \
INNER JOIN rides ON rides.rider_id = users.id \
WHERE start_time BETWEEN '2018-07-20 00:00:00' AND '2018-07-21 00:00:00';"
~~~

~~~
+---------------------+----------+-------------------------------------------------------+
|        Tree         |  Field   |                      Description                      |
+---------------------+----------+-------------------------------------------------------+
| group               |          |                                                       |
|  └── render         |          |                                                       |
|       └── join      |          |                                                       |
|            │        | type     | inner                                                 |
|            │        | equality | (id) = (rider_id)                                     |
|            ├── scan |          |                                                       |
|            │        | table    | users@primary                                         |
|            │        | spans    | ALL                                                   |
|            └── scan |          |                                                       |
|                     | table    | rides@rides_start_time_idx                            |
|                     | spans    | /2018-07-20T00:00:00Z-/2018-07-21T00:00:00.000000001Z |
+---------------------+----------+-------------------------------------------------------+
(11 rows)
~~~

Notice that CockroachDB now starts by using `rides@rides_start_time_idx` secondary index to retrieve the relevant rides without needing to scan the full `rides` table.

Let's check the ranges for the new index:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="SHOW EXPERIMENTAL_RANGES FROM INDEX rides@rides_start_time_idx;"
~~~

~~~
+--------------------------------------------------------------------------+--------------------------------------------------------------------------+----------+----------+--------------+
|                                Start Key                                 |                                 End Key                                  | Range ID | Replicas | Lease Holder |
+--------------------------------------------------------------------------+--------------------------------------------------------------------------+----------+----------+--------------+
| NULL                                                                     | /2018-07-08T02:20:52.56557Z/"los                                         |       29 | {1,2,3}  |            1 |
|                                                                          | angeles"/"\xce\xf0\xbd\x01JHFޛ\x18\xbd\x81N\xcd\x00\x03"                 |          |          |              |
| /2018-07-08T02:20:52.56557Z/"los                                         | NULL                                                                     |       39 | {1,2,3}  |            1 |
| angeles"/"\xce\xf0\xbd\x01JHFޛ\x18\xbd\x81N\xcd\x00\x03"                 |                                                                          |          |          |              |
+--------------------------------------------------------------------------+--------------------------------------------------------------------------+----------+----------+--------------+
(2 rows)
~~~

This tells us that the index is stored in 2 ranges, with the leaseholders for both of them on node 1. We already know that the leaseholder for the `users` table is on node 2.

#### Using `IN (list)` with a subquery

Now let's say you want to get the latest ride of each of the 5 most used vehicles. To do this, you might think to use a subquery to get the IDs of the 5 most frequent vehicles from the `rides` table, passing the results into the `IN` list of another query to get the most recent ride of each of the 5 vehicles:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="SELECT vehicle_id, max(end_time) \
FROM rides \
WHERE vehicle_id IN ( \
    SELECT vehicle_id \
    FROM rides \
    GROUP BY vehicle_id \
    ORDER BY count(*) DESC \
    LIMIT 5 \
) \
GROUP BY vehicle_id" \
--repeat=20 \
--times
~~~

~~~
Result:
['vehicle_id', 'max']
['78fdd6f8-c6a1-42df-a89f-cd65b7bb8be9', '2018-08-02 02:47:43.755989']
['c6541da5-9858-4e3f-9b49-992e206d2c50', '2018-08-02 02:14:50.543760']
['35752c4c-b878-4436-8330-8d7246406a55', '2018-08-02 03:08:49.823209']
['3c950d36-c2b8-48d0-87d3-e0d6f570af62', '2018-08-02 03:06:31.293184']
['0962cdca-9d85-457c-9616-cc2ae2d32008', '2018-08-02 03:01:25.414512']

Times (seconds):
[4.206338167190552, 3.951693058013916, 3.969815969467163, 3.954353094100952, 3.9102602005004883, 4.307512998580933, 4.046299934387207, 3.8423678874969482, 3.793987989425659, 3.898207187652588, 3.9140031337738037, 3.932142972946167, 3.925255060195923, 3.96528697013855, 3.919390916824341, 3.9831998348236084, 4.144302845001221, 3.965345859527588, 3.9077210426330566, 3.8876781463623047]

Average time (seconds):
3.97125816345
~~~

However, as you can see, this query is slow because, currently, when the `WHERE` condition of a query comes from the result of a subquery, CockroachDB scans the entire table, even if there is an available index. Use `EXPLAIN` to see this in more detail:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="EXPLAIN SELECT vehicle_id, max(end_time) \
FROM rides \
WHERE vehicle_id IN ( \
    SELECT vehicle_id \
    FROM rides \
    GROUP BY vehicle_id \
    ORDER BY count(*) DESC \
    LIMIT 5 \
) \
GROUP BY vehicle_id;"
~~~

~~~
+------------------------------------+-----------+--------------------------------------------------------------------------+
|                Tree                |   Field   |                               Description                                |
+------------------------------------+-----------+--------------------------------------------------------------------------+
| root                               |           |                                                                          |
|  ├── group                         |           |                                                                          |
|  │    │                            | group by  | @1-@1                                                                    |
|  │    └── render                   |           |                                                                          |
|  │         └── scan                |           |                                                                          |
|  │                                 | table     | rides@primary                                                            |
|  │                                 | spans     | ALL                                                                      |
|  └── subquery                      |           |                                                                          |
|       │                            | id        | @S1                                                                      |
|       │                            | sql       | (SELECT vehicle_id FROM rides GROUP BY vehicle_id ORDER BY count(*) DESC |
|                                    |           | LIMIT 5)                                                                 |
|       │                            | exec mode | all rows normalized                                                      |
|       └── limit                    |           |                                                                          |
|            └── sort                |           |                                                                          |
|                 │                  | order     | -count                                                                   |
|                 │                  | strategy  | top 5                                                                    |
|                 └── group          |           |                                                                          |
|                      │             | group by  | @1-@1                                                                    |
|                      └── render    |           |                                                                          |
|                           └── scan |           |                                                                          |
|                                    | table     | rides@primary                                                            |
|                                    | spans     | ALL                                                                      |
+------------------------------------+-----------+--------------------------------------------------------------------------+
(21 rows)
~~~

This is a complex query plan, but the important thing to note is the full table scan of `rides@primary` above the `subquery`. This shows you that, after the subquery returns the IDs of the top 5 vehicles, CockroachDB scans the entire primary index to find the rows with `max(end_time)` for each `vehicle_id`, although you might expect CockroachDB to more efficiently use the secondary index on `vehicle_id` (CockroachDB is working to remove this limitation in a future version).

#### Using `IN (list)` with explicit values

Because CockroachDB won't use an available secondary index when using `IN (list)` with a subquery, it's much more performant to have your application first select the top 5 vehicles:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="SELECT vehicle_id \
FROM rides \
GROUP BY vehicle_id \
ORDER BY count(*) DESC \
LIMIT 5" \
--repeat=20 \
--times
~~~

~~~
Result:
['vehicle_id']
['35752c4c-b878-4436-8330-8d7246406a55']
['0962cdca-9d85-457c-9616-cc2ae2d32008']
['c6541da5-9858-4e3f-9b49-992e206d2c50']
['78fdd6f8-c6a1-42df-a89f-cd65b7bb8be9']
['3c950d36-c2b8-48d0-87d3-e0d6f570af62']

Times (seconds):
[0.7322061061859131, 0.6978278160095215, 0.7311060428619385, 0.7258210182189941, 0.7138988971710205, 0.7246308326721191, 0.7103369235992432, 0.7103481292724609, 0.7149500846862793, 0.7098441123962402, 0.7234179973602295, 0.7134239673614502, 0.7018671035766602, 0.6976101398468018, 0.7302029132843018, 0.7164201736450195, 0.709122896194458, 0.7351589202880859, 0.7286410331726074, 0.726417064666748]

Average time (seconds):
0.717662608624
~~~

And then put the results into the `IN` list to get the most recent rides of the vehicles:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="SELECT vehicle_id, max(end_time) \
FROM rides \
WHERE vehicle_id IN ( \
  '35752c4c-b878-4436-8330-8d7246406a55', \
  '0962cdca-9d85-457c-9616-cc2ae2d32008', \
  'c6541da5-9858-4e3f-9b49-992e206d2c50', \
  '78fdd6f8-c6a1-42df-a89f-cd65b7bb8be9', \
  '3c950d36-c2b8-48d0-87d3-e0d6f570af62' \
) \
GROUP BY vehicle_id;" \
--repeat=20 \
--times
~~~

~~~
Result:
['vehicle_id', 'max']
['3c950d36-c2b8-48d0-87d3-e0d6f570af62', '2018-08-02 03:06:31.293184']
['78fdd6f8-c6a1-42df-a89f-cd65b7bb8be9', '2018-08-02 02:47:43.755989']
['35752c4c-b878-4436-8330-8d7246406a55', '2018-08-02 03:08:49.823209']
['0962cdca-9d85-457c-9616-cc2ae2d32008', '2018-08-02 03:01:25.414512']
['c6541da5-9858-4e3f-9b49-992e206d2c50', '2018-08-02 02:14:50.543760']

Times (seconds):
[0.8875288963317871, 0.8804519176483154, 0.861987829208374, 0.8759191036224365, 0.8635928630828857, 0.8506829738616943, 0.8587000370025635, 0.863288164138794, 0.8509171009063721, 0.8478240966796875, 0.8318009376525879, 0.821984052658081, 0.8587448596954346, 0.8775198459625244, 0.9111788272857666, 0.84427809715271, 0.835906982421875, 0.8653831481933594, 0.8694000244140625, 0.8706419467926025]

Average time (seconds):
0.861386585236
~~~

This approach reduced the query time from 3.97s (query with subquery) to 1.57s (2 distinct queries).

### Step 7. Test/tune write performance

- [Bulk inserting into an existing table](#bulk-inserting-into-an-existing-table)
- [Minimizing unused indexes](#minimizing-unused-indexes)
- [Retrieving the ID of a newly inserted row](#retrieving-the-id-of-a-newly-inserted-row)

#### Bulk inserting into an existing table

Moving on to writes, let's imagine that you have a batch of 100 new users to insert into the `users` table. The most obvious approach is to insert each row using 100 separate [`INSERT`](insert.html) statements:  

{{site.data.alerts.callout_info}}
For the purpose of demonstration, the command below inserts the same user 100 times, each time with a different unique ID. Note also that you're now adding the `--cumulative` flag to print the total time across all 100 inserts.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="INSERT INTO users VALUES (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347')" \
--repeat=100 \
--times \
--cumulative
~~~

~~~
Times (seconds):
[0.030857086181640625, 0.013014078140258789, 0.013461112976074219, 0.008593082427978516, 0.007416963577270508, 0.008838176727294922, 0.007848024368286133, 0.007557868957519531, 0.008249044418334961, 0.009274005889892578, 0.008640050888061523, 0.00881505012512207, 0.007550954818725586, 0.008877038955688477, 0.009969949722290039, 0.009127140045166016, 0.007889032363891602, 0.008471965789794922, 0.009897947311401367, 0.00890207290649414, 0.009326934814453125, 0.008376836776733398, 0.009438037872314453, 0.007573127746582031, 0.00745391845703125, 0.008942127227783203, 0.009109020233154297, 0.008573055267333984, 0.008787870407104492, 0.007277965545654297, 0.0073528289794921875, 0.008642196655273438, 0.00869894027709961, 0.008134126663208008, 0.00820302963256836, 0.0073070526123046875, 0.008308887481689453, 0.008894920349121094, 0.007400035858154297, 0.0073931217193603516, 0.009109973907470703, 0.00875091552734375, 0.01731395721435547, 0.007832050323486328, 0.008805990219116211, 0.008580207824707031, 0.008847951889038086, 0.007673978805541992, 0.008129119873046875, 0.009077072143554688, 0.008433103561401367, 0.008664131164550781, 0.008584022521972656, 0.009250879287719727, 0.007338047027587891, 0.009618997573852539, 0.00989985466003418, 0.008685111999511719, 0.007817983627319336, 0.009194135665893555, 0.008004903793334961, 0.009038925170898438, 0.008832931518554688, 0.008471965789794922, 0.008790969848632812, 0.007178068161010742, 0.007308006286621094, 0.008577823638916016, 0.008918046951293945, 0.008402109146118164, 0.016204118728637695, 0.009094953536987305, 0.01294088363647461, 0.00882101058959961, 0.009661197662353516, 0.00859522819519043, 0.007420063018798828, 0.007200002670288086, 0.008748054504394531, 0.009141921997070312, 0.017475128173828125, 0.007709980010986328, 0.0073719024658203125, 0.007448911666870117, 0.00836491584777832, 0.008117198944091797, 0.008465051651000977, 0.009288787841796875, 0.007342100143432617, 0.008190155029296875, 0.007562160491943359, 0.008868217468261719, 0.010197162628173828, 0.009553909301757812, 0.0070040225982666016, 0.008983850479125977, 0.0073909759521484375, 0.008926868438720703, 0.00906991958618164, 0.007947921752929688]

Average time (seconds):
0.00906682491302

Cumulative time (seconds):
0.906682491302
~~~

The 100 inserts took 906.68ms to complete, which isn't bad. However, it's significantly faster to use a single `INSERT` statement with 100 comma-separated `VALUES` clauses:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="INSERT INTO users VALUES \
(gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), \
(gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), \
(gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), \
(gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), \
(gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), \
(gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), \
(gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), \
(gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), \
(gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), \
(gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347')" \
--repeat=1 \
--cumulative
~~~

~~~
Average time (seconds):
0.0161929130554

Cumulative time (seconds):
0.0161929130554
~~~

As you can see, this multi-row `INSERT` technique reduced the total time for 100 inserts from 906.68ms to 16.19ms. It's useful to note that this technique is equally effective for [`UPSERT`](upsert.html) and [`DELETE`](delete.html) statements as well.

#### Minimizing unused indexes

Earlier, we saw how important secondary indexes are for read performance. For writes, however, it's important to recognized the overhead that they create.

Let's consider the `users` table:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="SHOW INDEXES FROM users;"
~~~

~~~
+-------+----------------+--------+-----+-------------+-----------+---------+----------+
| Table |      Name      | Unique | Seq |   Column    | Direction | Storing | Implicit |
+-------+----------------+--------+-----+-------------+-----------+---------+----------+
| users | primary        |  true  |   1 | city        | ASC       |  false  |  false   |
| users | primary        |  true  |   2 | id          | ASC       |  false  |  false   |
| users | users_name_idx | false  |   1 | name        | ASC       |  false  |  false   |
| users | users_name_idx | false  |   2 | credit_card | N/A       |  true   |  false   |
| users | users_name_idx | false  |   3 | city        | ASC       |  false  |   true   |
| users | users_name_idx | false  |   4 | id          | ASC       |  false  |   true   |
+-------+----------------+--------+-----+-------------+-----------+---------+----------+
(6 rows)
~~~

This table has the primary index (the full table) and a secondary index on `name` that is also storing `credit_card`. This means that whenever a row is inserted, or whenever `name`, `credit_card`, `city`, or `id` are modified in existing rows, both indexes are updated.

To make this more concrete, let's count how many rows have a name that starts with `C` and then update those rows to all have the same name:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="SELECT count(*) \
FROM users \
WHERE name LIKE 'C%'" \
--repeat=1
~~~

~~~
Result:
['count']
['179']

Average time (seconds):
0.00267601013184
~~~

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="UPDATE users \
SET name = 'Carl Kimball' \
WHERE name LIKE 'C%'" \
--repeat=1
~~~

~~~
Average time (seconds):
0.101613998413
~~~

Because `name` is in both the `primary` and `users_name_idx` indexes, for each of the 168 rows, 2 keys were updated.

Now, assuming that the `users_name_idx` index is no longer needed, lets drop the index and execute an equivalent query:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="DROP INDEX users_name_idx" \
--repeat=1
~~~

~~~
Average time (seconds):
0.662317991257
~~~

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="UPDATE users \
SET name = 'Peedie Hirata' \
WHERE name = 'Carl Kimball'" \
--repeat=1
~~~

~~~
Average time (seconds):
0.0233561992645
~~~

Before, when both the primary and secondary indexes needed to be updated, the updates took 101.61ms. Now, after dropping the secondary index, an equivalent update took only 23.35ms.

#### Retrieving the ID of a newly inserted row

Now let's focus on the common case of inserting a row into a table and then retrieving the ID of the new row to do some follow-up work. One approach is to execute two statements, an `INSERT` to insert the row and then a `SELECT` to get the new ID:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="INSERT INTO users VALUES (gen_random_uuid(), 'new york', 'Toni Brooks', '800 Camden Lane, Brooklyn, NY 11218', '98244843845134960')" \
--repeat=1
~~~

~~~
Average time (seconds):
0.00896215438843
~~~

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="SELECT id FROM users WHERE name = 'Toni Brooks'" \
--repeat=1
~~~

~~~
Result:
['id']
['256da899-8f67-4bc9-9796-7fabc3e2bacc']

Average time (seconds):
0.00455498695374
~~~

Combined, these statements are relatively fast, at 13.51ms, but an even more performant approach is to append `RETURNING id` to the end of the `INSERT`:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="INSERT INTO users VALUES (gen_random_uuid(), 'new york', 'Brian Brooks', '800 Camden Lane, Brooklyn, NY 11218', '98244843845134960') \
RETURNING id" \
--repeat=1
~~~

~~~
Result:
['id']
['3f01031c-76b8-45fa-ad1c-b9275d357c20']

Average time (seconds):
0.0084228515625
~~~

At just 8.42ms, this approach is faster due to the write and read executing in one instead of two client-server roundtrips. Note also that, as discussed earlier, if the leaseholder for the table happens to be on a different node than the query is running against, that introduces additional network hops and latency.

<!-- - upsert instead of insert/update
- update using case expressions (instead of 2 separate updates)
- returning nothing
- insert with returning (auto gen ID) instead of select to get auto gen ID
- Maybe interleaved tables -->

## Multi-region deployment

Given that Movr is active on both US coasts, you'll now scale the cluster into two new regions, us-west1-a and us-west2-a, each with 3 nodes and an extra instance for simulating regional client traffic.

### Step 8. Create more instances

1. [Create 6 more instances](https://cloud.google.com/compute/docs/instances/create-start-instance), 3 in the **us-west1-a** zone (Oregon), and 3 in the **us-west2-a** zone (Los Angeles). While creating each instance:
    - Use the `n1-standard-4` machine type (4 vCPUs, 15 GB memory).
    - [Create and mount a local SSD](https://cloud.google.com/compute/docs/disks/local-ssd#create_local_ssd).
    - To apply the Web UI firewall rule you created earlier, click **Management, disk, networking, SSH keys**, select the **Networking** tab, and then enter `cockroachdb` in the **Network tags** field.

2. Note the internal IP address of each `n1-standard-4` instance. You'll need these addresses when starting the CockroachDB nodes.

3. Create an additional instance in the **us-west1-a** and **us-west2-a** zones. These can be smaller, such as `n1-standard-1`.

### Step 9. Scale the cluster

1. SSH to one of the `n1-standard-4` instances in the **us-west1-a** zone.

2. Download the [CockroachDB archive](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz) for Linux, extract the binary, and copy it into the `PATH`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar  xvz
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin
    ~~~

    If you get a permissions error, prefix the command with `sudo`.

3. Run the [`cockroach start`](start-a-node.html) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --advertise-host=<node internal address> \
    --join=<same as earlier> \
    --locality=cloud=gce,region=us-west1,zone=us-west1-a \
    --cache=.25 \
    --max-sql-memory=.25 \
    --background
    ~~~

4. Repeat steps 1 - 3 for the other two `n1-standard-4` instances in the **us-west1-a** zone.

5. SSH to one of the `n1-standard-4` instances in the **us-west2-a** zone.

6. Download the [CockroachDB archive](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz) for Linux, extract the binary, and copy it into the `PATH`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar  xvz
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin
    ~~~

    If you get a permissions error, prefix the command with `sudo`.

7. Run the [`cockroach start`](start-a-node.html) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --advertise-host=<node1 internal address> \
    --join=<same as earlier> \
    --locality=cloud=gce,region=us-west2,zone=us-west2-a \
    --cache=.25 \
    --max-sql-memory=.25 \
    --background
    ~~~

8. Repeat steps 5 - 7 for the other two `n1-standard-4` instances in the **us-west2-a** zone.

### Step 10. Install the Python client

In each of the new zones, SSH to the instance not running a CockroachDB node, and install the Python testing client as described in [step 5](#step-5-install-the-python-client) above.

### Step 11. Check rebalancing

Since you started each node with the `--locality` flag set to its GCE zone, over the next minutes, CockroachDB will rebalance data evenly across the zones.

To check this, access the Web UI on any node at `<node address>:8080` and look at the **Node List**. You'll see that the range count is more or less even across all nodes:

<img src="{{ 'images/v2.0/perf_tuning_multi_region_rebalancing.png' | relative_url }}" alt="Perf tuning rebalancing" style="border:1px solid #eee;max-width:100%" />

For reference, here's how the nodes map to zones:

Node IDs | Zone
---------|-----
1-3 | us-east1-b (South Carolina)
4-6 | us-west1-a (Oregon)
7-9 | us-west2-a (Los Angeles)

To verify even balancing at range level, SSH to one of the instances not running CockroachDB and run the `SHOW EXPERIMENTAL_RANGES` statement:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="SHOW EXPERIMENTAL_RANGES FROM TABLE vehicles;"
~~~

~~~
+-----------+---------+----------+----------+--------------+
| Start Key | End Key | Range ID | Replicas | Lease Holder |
+-----------+---------+----------+----------+--------------+
| NULL      | NULL    |       51 | {2,5,7}  |            5 |
+-----------+---------+----------+----------+--------------+
(1 row)
~~~

In this case, we can see that, for the single range containing `vehicles` data, one replica is in each zone, and the leaseholder is in the us-west1-a zone.

### Step 12. Test performance

In general, all of the tuning techniques featured in the single-region scenario above still apply in a multi-region deployment. However, the fact that data and leaseholders are spread across the US means greater latencies in many cases.

#### Reads

For example, imagine we are a Movr administrator in New York, and we want to get the IDs and descriptions of all New York-based bikes that are currently in use:

1. SSH to the instance in us-east1-b with the Python client.

2. Query for the data:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ python tuning.py \
    --host=<address of a node in us-east1-b> \
    --statement="SELECT id, ext FROM vehicles \
    WHERE city = 'new york' \
        AND type = 'bike' \
        AND status = 'in_use'" \
    --repeat=20 \
    --times
    ~~~

    ~~~
    Result:
    ['id', 'ext']
    ['0068ee24-2dfb-437d-9a5d-22bb742d519e', "{u'color': u'green', u'brand': u'Kona'}"]
    ['01b80764-283b-4232-8961-a8d6a4121a08', "{u'color': u'green', u'brand': u'Pinarello'}"]
    ['02a39628-a911-4450-b8c0-237865546f7f', "{u'color': u'black', u'brand': u'Schwinn'}"]
    ['02eb2a12-f465-4575-85f8-a4b77be14c54', "{u'color': u'black', u'brand': u'Pinarello'}"]
    ['02f2fcc3-fea6-4849-a3a0-dc60480fa6c2', "{u'color': u'red', u'brand': u'FujiCervelo'}"]
    ['034d42cf-741f-428c-bbbb-e31820c68588', "{u'color': u'yellow', u'brand': u'Santa Cruz'}"]
    ...

    Times (seconds):
    [0.21941494941711426, 0.07756304740905762, 0.076995849609375, 0.07703113555908203, 0.07726788520812988, 0.0768740177154541, 0.07699108123779297, 0.0771939754486084, 0.07709598541259766, 0.07707500457763672, 0.07711911201477051, 0.07710695266723633, 0.07673311233520508, 0.0768880844116211, 0.07702398300170898, 0.07713508605957031, 0.07724881172180176, 0.07672810554504395, 0.07661294937133789, 0.07683897018432617]

    Average time (seconds):
    0.0841469049454
    ~~~

As we saw earlier, the leaseholder for the `vehicles` table is in us-west1-a (Oregon), so our query had to go from the gateway node in us-east1-b all the way to the west coast and then back again before returning data to the client.

For contrast, imagine we are now a Movr administrator in Seattle, and we want to get the IDs and descriptions of all Seattle-based bikes that are currently in use:

1. SSH to the instance in us-west1-a with the Python client.

2. Query for the data:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ python tuning.py \
    --host=<address of a node in us-west1-a> \
    --statement="SELECT id, ext FROM vehicles \
    WHERE city = 'seattle' \
        AND type = 'bike' \
        AND status = 'in_use'" \
    --repeat=20 \
    --times
    ~~~

    ~~~
    Result:
    ['id', 'ext']
    ['00078349-94d4-43e6-92be-8b0d1ac7ee9f', "{u'color': u'blue', u'brand': u'Merida'}"]
    ['003f84c4-fa14-47b2-92d4-35a3dddd2d75', "{u'color': u'red', u'brand': u'Kona'}"]
    ['0107a133-7762-4392-b1d9-496eb30ee5f9', "{u'color': u'yellow', u'brand': u'Kona'}"]
    ['0144498b-4c4f-4036-8465-93a6bea502a3', "{u'color': u'blue', u'brand': u'Pinarello'}"]
    ['01476004-fb10-4201-9e56-aadeb427f98a', "{u'color': u'black', u'brand': u'Merida'}"]

    Times (seconds):
    [0.015386104583740234, 0.007433891296386719, 0.00727391242980957, 0.0071489810943603516, 0.007225990295410156, 0.007175922393798828, 0.007027149200439453, 0.00709986686706543, 0.006872892379760742, 0.006968975067138672, 0.00710296630859375, 0.0073850154876708984, 0.00710296630859375, 0.011546134948730469, 0.007370948791503906, 0.007235050201416016, 0.00710606575012207, 0.007116079330444336, 0.007057905197143555, 0.007016897201538086]

    Average time (seconds):
    0.00778268575668
    ~~~

Because the leaseholder for `vehicles` is in the same zone as the client request, this query took just 7.78ms compared to the similar query in New York that took 84.14ms.  

#### Writes

The geographic distribution of data impacts write performance as well. For example, imagine 100 people in New York and 100 people in Los Angeles want to create new Movr accounts:

1. SSH to the instance in us-east1-b with the Python client.

2. Create 100 NY-based users:

    {% include copy-clipboard.html %}
    ~~~ shell
    python tuning.py \
    --host=<address of a node in us-east1-b> \
    --statement="INSERT INTO users VALUES (gen_random_uuid(), 'new york', 'New Yorker', '111 East Street', '1736352379937347')" \
    --repeat=100 \
    --times
    ~~~

    ~~~
    Times (seconds):
    [0.6714589595794678, 0.07639288902282715, 0.0752859115600586, 0.0764150619506836, 0.07594609260559082, 0.07563400268554688, 0.07622909545898438, 0.07652401924133301, 0.07493305206298828, 0.07553482055664062, 0.07646608352661133, 0.07673192024230957, 0.0751500129699707, 0.07670903205871582, 0.07698702812194824, 0.07653212547302246, 0.07573103904724121, 0.08075284957885742, 0.07599091529846191, 0.07509589195251465, 0.07484793663024902, 0.0749969482421875, 0.0765998363494873, 0.07585883140563965, 0.07512998580932617, 0.07515096664428711, 0.07483911514282227, 0.07616710662841797, 0.07634806632995605, 0.07551693916320801, 0.07638883590698242, 0.07649779319763184, 0.07510995864868164, 0.07621598243713379, 0.0741729736328125, 0.07663893699645996, 0.07673215866088867, 0.0752711296081543, 0.07562804222106934, 0.07534408569335938, 0.07645702362060547, 0.07613301277160645, 0.07684707641601562, 0.0766289234161377, 0.07591390609741211, 0.07527494430541992, 0.07494521141052246, 0.07664299011230469, 0.07572197914123535, 0.0762031078338623, 0.07476496696472168, 0.07534098625183105, 0.0752561092376709, 0.07623100280761719, 0.07565498352050781, 0.07640910148620605, 0.07605099678039551, 0.07643699645996094, 0.07492995262145996, 0.07500410079956055, 0.07579898834228516, 0.0765690803527832, 0.07478499412536621, 0.07501411437988281, 0.07515788078308105, 0.0750880241394043, 0.07849693298339844, 0.07435417175292969, 0.0756690502166748, 0.07696700096130371, 0.07620000839233398, 0.07477903366088867, 0.07564401626586914, 0.07404804229736328, 0.07712006568908691, 0.07569503784179688, 0.07677006721496582, 0.07529711723327637, 0.07581686973571777, 0.07653093338012695, 0.07652711868286133, 0.07580709457397461, 0.07696008682250977, 0.07594108581542969, 0.07653212547302246, 0.0757298469543457, 0.07556796073913574, 0.07446599006652832, 0.07658195495605469, 0.07529091835021973, 0.07618594169616699, 0.07528305053710938, 0.0767979621887207, 0.0765221118927002, 0.0769491195678711, 0.0756378173828125, 0.07606887817382812, 0.0765841007232666, 0.07562589645385742, 0.07528400421142578]

    Average time (seconds):
    0.0818694829941
    ~~~

3. SSH to the instance in us-west2-a with the Python client.

4. Create 100 new Los Angeles-based users:

    {% include copy-clipboard.html %}
    ~~~ shell
    python tuning.py \
    --host=<address of a node in us-west2-a> \
    --statement="INSERT INTO users VALUES (gen_random_uuid(), 'los angeles', 'Los Angel', '111 West Street', '9822222379937347')" \
    --repeat=100 \
    --times
    ~~~

    ~~~
    Times (seconds):
    [0.13872694969177246, 0.13959693908691406, 0.1385641098022461, 0.14054203033447266, 0.13927793502807617, 0.137984037399292, 0.13989615440368652, 0.1410520076751709, 0.1385939121246338, 0.13822698593139648, 0.13682913780212402, 0.13848614692687988, 0.13852405548095703, 0.1383068561553955, 0.1392219066619873, 0.13934993743896484, 0.13752293586730957, 0.13835620880126953, 0.13915801048278809, 0.13971900939941406, 0.13719415664672852, 0.13735699653625488, 0.13897013664245605, 0.1374959945678711, 0.13857007026672363, 0.13880705833435059, 0.13756299018859863, 0.13879108428955078, 0.1387009620666504, 0.13945603370666504, 0.13792085647583008, 0.1376798152923584, 0.13746213912963867, 0.13860297203063965, 0.13760709762573242, 0.13918399810791016, 0.1370530128479004, 0.1392960548400879, 0.1391298770904541, 0.13768696784973145, 0.13859891891479492, 0.13876819610595703, 0.13826394081115723, 0.13748788833618164, 0.13735389709472656, 0.13851189613342285, 0.13878679275512695, 0.1368710994720459, 0.1392989158630371, 0.1395268440246582, 0.13918685913085938, 0.13799190521240234, 0.13922405242919922, 0.13824915885925293, 0.13936591148376465, 0.13903498649597168, 0.13809680938720703, 0.13932204246520996, 0.13969683647155762, 0.13826203346252441, 0.13962006568908691, 0.13848495483398438, 0.13889312744140625, 0.13620209693908691, 0.13854503631591797, 0.14294815063476562, 0.13912487030029297, 0.13945293426513672, 0.13765382766723633, 0.13927888870239258, 0.13942599296569824, 0.13892102241516113, 0.1394820213317871, 0.13924407958984375, 0.13817596435546875, 0.13852405548095703, 0.13794589042663574, 0.13872694969177246, 0.13785409927368164, 0.13929510116577148, 0.14283108711242676, 0.14198517799377441, 0.1396040916442871, 0.1382589340209961, 0.139268159866333, 0.14015889167785645, 0.13858413696289062, 0.13799691200256348, 0.13921213150024414, 0.1382758617401123, 0.1389000415802002, 0.139509916305542, 0.13865399360656738, 0.14020109176635742, 0.13837909698486328, 0.13908600807189941, 0.13843202590942383, 0.13906002044677734, 0.14122295379638672, 0.1394650936126709]

    Average time (seconds):
    0.13881247282
    ~~~

On average, it took 81.86ms to create a user in New York and 138.81ms to create a user in Los Angeles. To better understand this discrepancy, let's look at the distribution of data for the `users` table:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="SHOW EXPERIMENTAL_RANGES FROM TABLE users;"
~~~

~~~
+-----------+---------+----------+----------+--------------+
| Start Key | End Key | Range ID | Replicas | Lease Holder |
+-----------+---------+----------+----------+--------------+
| NULL      | NULL    |       24 | {2,6,8}  |            2 |
+-----------+---------+----------+----------+--------------+
(1 row)
~~~

For the single range containing `users` data, one replica is in each zone, with the leaseholder in the us-east1-b zone. This means that:

- When creating a user in New York, the request doesn't have to leave the zone to reach the leaseholder. However, since a write requires consensus from its replica group, the write has to wait for confirmation from either the replica in us-west1-a (Oregon) or us-west2-a (Los Angeles) before committing and then returning confirmation to the client.
- When creating a user in Los Angeles, there are more network hops and, thus, increased latency. The request first needs to travel across the continent to the leaseholder in us-east1-b. It then has to wait for confirmation from either the replica in us-west1-a (Oregon) or us-west2-a (Los Angeles) before committing and then returning confirmation to the client back in the west.

### Step 13. Partition data by city

For this service, the most effective technique for improving read and write latency is to [geo-partition](partitioning.html) the data by city. In essence, this means changing the way data is mapped to ranges. Instead of an entire table and its indexes mapping to a specific range or set of ranges, all rows in the table and its indexes with a given city will map to a range or set of ranges. Once ranges are defined in this way, we can then use the [replication zone](configure-replication-zones.html) feature to pin partitions to specific locations, ensuring that read and write requests from users in a specific city don't have to leave that region.

1. Partitioning is an enterprise feature, so start off by [registering for a 30-day trial license](https://www.cockroachlabs.com/pricing/start-trial/).

2. Once you've received the trial license, SSH to any node in your cluster and [apply the license](enterprise-licensing.html#set-the-trial-or-enterprise-license-key):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=<address of any node> \
    --execute="SET CLUSTER SETTING cluster.organization = '<your org name>';"
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=<address of any node> \
    --execute="SET CLUSTER SETTING enterprise.license = '<your license>';"
    ~~~

3. Define partitions for all tables and their secondary indexes.

    Start with the `users` table:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --database=movr \
    --host=<address of any node> \
    --execute="ALTER TABLE users \
    PARTITION BY LIST (city) ( \
        PARTITION new_york VALUES IN ('new york'), \
        PARTITION boston VALUES IN ('boston'), \
        PARTITION washington_dc VALUES IN ('washington dc'), \
        PARTITION seattle VALUES IN ('seattle'), \
        PARTITION san_francisco VALUES IN ('san francisco'), \
        PARTITION los_angeles VALUES IN ('los angeles') \
    );"
    ~~~

    Now define partitions for the `vehicles` table and its secondary indexes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --database=movr \
    --host=<address of any node> \
    --execute="ALTER TABLE vehicles \
    PARTITION BY LIST (city) ( \
        PARTITION new_york VALUES IN ('new york'), \
        PARTITION boston VALUES IN ('boston'), \
        PARTITION washington_dc VALUES IN ('washington dc'), \
        PARTITION seattle VALUES IN ('seattle'), \
        PARTITION san_francisco VALUES IN ('san francisco'), \
        PARTITION los_angeles VALUES IN ('los angeles') \
    );"
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --database=movr \
    --host=<address of any node> \
    --execute="ALTER INDEX vehicles_auto_index_fk_city_ref_users \
    PARTITION BY LIST (city) ( \
        PARTITION new_york_idx VALUES IN ('new york'), \
        PARTITION boston_idx VALUES IN ('boston'), \
        PARTITION washington_dc_idx VALUES IN ('washington dc'), \
        PARTITION seattle_idx VALUES IN ('seattle'), \
        PARTITION san_francisco_idx VALUES IN ('san francisco'), \
        PARTITION los_angeles_idx VALUES IN ('los angeles') \
    );"
    ~~~

    Next, define partitions for the `rides` table and its secondary indexes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --database=movr \
    --host=<address of any node> \
    --execute="ALTER TABLE rides \
    PARTITION BY LIST (city) ( \
        PARTITION new_york VALUES IN ('new york'), \
        PARTITION boston VALUES IN ('boston'), \
        PARTITION washington_dc VALUES IN ('washington dc'), \
        PARTITION seattle VALUES IN ('seattle'), \
        PARTITION san_francisco VALUES IN ('san francisco'), \
        PARTITION los_angeles VALUES IN ('los angeles') \
    );"
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --database=movr \
    --host=<address of any node> \
    --execute="ALTER INDEX rides_auto_index_fk_city_ref_users \
    PARTITION BY LIST (city) ( \
        PARTITION new_york_idx1 VALUES IN ('new york'), \
        PARTITION boston_idx1 VALUES IN ('boston'), \
        PARTITION washington_dc_idx1 VALUES IN ('washington dc'), \
        PARTITION seattle_idx1 VALUES IN ('seattle'), \
        PARTITION san_francisco_idx1 VALUES IN ('san francisco'), \
        PARTITION los_angeles_idx1 VALUES IN ('los angeles') \
    );"
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --database=movr \
    --host=<address of any node> \
    --execute="ALTER INDEX rides_auto_index_fk_vehicle_city_ref_vehicles \
    PARTITION BY LIST (vehicle_city) ( \
        PARTITION new_york_idx2 VALUES IN ('new york'), \
        PARTITION boston_idx2 VALUES IN ('boston'), \
        PARTITION washington_dc_idx2 VALUES IN ('washington dc'), \
        PARTITION seattle_idx2 VALUES IN ('seattle'), \
        PARTITION san_francisco_idx2 VALUES IN ('san francisco'), \
        PARTITION los_angeles_idx2 VALUES IN ('los angeles') \
    );"
    ~~~

    Finally, drop an unused index on `rides` rather than partition it:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --database=movr \
    --host=<address of any node> \
    --execute="DROP INDEX rides_start_time_idx;"
    ~~~

    {{site.data.alerts.callout_info}}
    The `rides` table contains 1 million rows, so dropping this index will take a few minutes.
    {{site.data.alerts.end}}

7. Now [create replication zones](configure-replication-zones.html#create-a-replication-zone-for-a-table-partition-new-in-v2-0) to require city data to be stored on specific nodes based on node locality.

    City | Locality
    -----|---------
    New York | `zone=us-east1-b`
    Boston | `zone=us-east1-b`
    Washington DC | `zone=us-east1-b`
    Seattle | `zone=us-west1-a`
    San Francisco | `zone=us-west2-a`
    Los Angelese | `zone=us-west2-a`

    {{site.data.alerts.callout_info}}
    Since our nodes are located in 3 specific GCE zones, we're only going to use the `zone=` portion of node locality. If we were using multiple zones per regions, we would likely use the `region=` portion of the node locality instead.
    {{site.data.alerts.end}}

    Start with the `users` table partitions:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.users.new_york \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.users.boston \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.users.washington_dc \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west1-a]' | \
    cockroach zone set movr.users.seattle \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.users.san_francisco \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.users.los_angeles \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    Move on to the `vehicles` table and secondary index partitions:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.vehicles.new_york \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.vehicles.new_york_idx \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.vehicles.boston \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.vehicles.boston_idx \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.vehicles.washington_dc \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.vehicles.washington_dc_idx \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west1-a]' | \
    cockroach zone set movr.vehicles.seattle \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west1-a]' | \
    cockroach zone set movr.vehicles.seattle_idx \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.vehicles.san_francisco \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.vehicles.san_francisco_idx \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.vehicles.los_angeles \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.vehicles.los_angeles_idx \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    Finish with the `rides` table and secondary index partitions:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.rides.new_york \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.rides.new_york_idx1 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.rides.new_york_idx2 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.rides.boston \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.rides.boston_idx1 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.rides.boston_idx2 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.rides.washington_dc \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.rides.washington_dc_idx1 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.rides.washington_dc_idx2 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west1-a]' | \
    cockroach zone set movr.rides.seattle \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west1-a]' | \
    cockroach zone set movr.rides.seattle_idx1 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west1-a]' | \
    cockroach zone set movr.rides.seattle_idx2 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.rides.san_francisco \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.rides.san_francisco_idx1 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.rides.san_francisco_idx2 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.rides.los_angeles \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.rides.los_angeles_idx1 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.rides.los_angeles_idx2 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

### Step 14. Check rebalancing after partitioning

Over the next minutes, CockroachDB will rebalance all partitions based on the constraints you defined.

To check this at a high level, access the Web UI on any node at `<node address>:8080` and look at the **Node List**. You'll see that the range count is still close to even across all nodes but much higher than before partitioning:

<img src="{{ 'images/v2.0/perf_tuning_multi_region_rebalancing_after_partitioning.png' | relative_url }}" alt="Perf tuning rebalancing" style="border:1px solid #eee;max-width:100%" />

To check at a more granular level, SSH to one of the instances not running CockroachDB and run the `SHOW EXPERIMENTAL_RANGES` statement on the `vehicles` table:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="SELECT * FROM \
[SHOW EXPERIMENTAL_RANGES FROM TABLE vehicles] \
WHERE \"Start Key\" IS NOT NULL \
    AND \"Start Key\" NOT LIKE '%Prefix%';"
~~~

~~~
+------------------+----------------------------+----------+----------+--------------+
|    Start Key     |          End Key           | Range ID | Replicas | Lease Holder |
+------------------+----------------------------+----------+----------+--------------+
| /"boston"        | /"boston"/PrefixEnd        |      179 | {1,2,3}  |            2 |
| /"los angeles"   | /"los angeles"/PrefixEnd   |      231 | {7,8,9}  |            7 |
| /"new york"      | /"new york"/PrefixEnd      |      175 | {1,2,3}  |            1 |
| /"san francisco" | /"san francisco"/PrefixEnd |      219 | {7,8,9}  |            7 |
| /"seattle"       | /"seattle"/PrefixEnd       |      217 | {4,5,6}  |            6 |
| /"washington dc" | /"washington dc"/PrefixEnd |      213 | {1,2,3}  |            2 |
+------------------+----------------------------+----------+----------+--------------+
(6 rows)
~~~

For reference, here's how the nodes map to zones:

Node IDs | Zone
---------|-----
1-3 | us-east1-b (South Carolina)
4-6 | us-west1-a (Oregon)
7-9 | us-west2-a (Los Angeles)

We can see that, after partitioning, the replicas for New York, Boston, and Washington DC are located on nodes 1-3 in us-east1-b, replicas for Seattle are located on nodes 4-6 in us-west1-a, and replicas for San Francisco and Los Angeles are located on nodes 7-9 in us-west2-a.

### Step 15. Test performance after partitioning

After partitioning, reads and writers for a specific city will be much faster because all replicas for that city are now located on the nodes closest to the city.

To check this, let's repeat a few of the read and write queries that we executed before partitioning in [step 12](#step-12-test-performance).

#### Reads

Again imagine we are a Movr administrator in New York, and we want to get the IDs and descriptions of all New York-based bikes that are currently in use:

1. SSH to the instance in us-east1-b with the Python client.

2. Query for the data:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ python tuning.py \
    --host=<address of a node in us-east1-b> \
    --statement="SELECT id, ext FROM vehicles \
    WHERE city = 'new york' \
        AND type = 'bike' \
        AND status = 'in_use'" \
    --repeat=20 \
    --times
    ~~~

    ~~~
    Result:
    ['id', 'ext']
    ['0068ee24-2dfb-437d-9a5d-22bb742d519e', "{u'color': u'green', u'brand': u'Kona'}"]
    ['01b80764-283b-4232-8961-a8d6a4121a08', "{u'color': u'green', u'brand': u'Pinarello'}"]
    ['02a39628-a911-4450-b8c0-237865546f7f', "{u'color': u'black', u'brand': u'Schwinn'}"]
    ['02eb2a12-f465-4575-85f8-a4b77be14c54', "{u'color': u'black', u'brand': u'Pinarello'}"]
    ['02f2fcc3-fea6-4849-a3a0-dc60480fa6c2', "{u'color': u'red', u'brand': u'FujiCervelo'}"]
    ['034d42cf-741f-428c-bbbb-e31820c68588', "{u'color': u'yellow', u'brand': u'Santa Cruz'}"]
    ...

    Times (seconds):
    [0.016993999481201172, 0.007067203521728516, 0.007095813751220703, 0.006834983825683594, 0.007122039794921875, 0.006812095642089844, 0.007057905197143555, 0.007050037384033203, 0.007055997848510742, 0.007024049758911133, 0.007100105285644531, 0.007370948791503906, 0.006949186325073242, 0.006871938705444336, 0.012002944946289062, 0.007463932037353516, 0.007152080535888672, 0.006829023361206055, 0.007062196731567383, 0.006926059722900391]

    Average time (seconds):
    0.00779212713242
    ~~~

Before partitioning, this query took 84.14ms on average. After partitioning, the query took only 7.79ms on average.

#### Writes

Now let's again imagine 100 people in New York and 100 people in Los Angeles want to create new Movr accounts:

1. SSH to the instance in us-east1-b with the Python client.

2. Create 100 NY-based users:

    {% include copy-clipboard.html %}
    ~~~ shell
    python tuning.py \
    --host=<address of a node in us-east1-b> \
    --statement="INSERT INTO users VALUES (gen_random_uuid(), 'new york', 'New Yorker', '111 East Street', '1736352379937347')" \
    --repeat=100 \
    --times
    ~~~

    ~~~
    Times (seconds):
    [0.009444952011108398, 0.007665157318115234, 0.009157180786132812, 0.009312868118286133, 0.009885072708129883, 0.007704973220825195, 0.00907588005065918, 0.009167909622192383, 0.008596181869506836, 0.011962890625, 0.009131908416748047, 0.013782024383544922, 0.01882791519165039, 0.008872032165527344, 0.013983964920043945, 0.010020017623901367, 0.01625800132751465, 0.014447212219238281, 0.016345977783203125, 0.009738922119140625, 0.00857090950012207, 0.01053309440612793, 0.00946187973022461, 0.00869894027709961, 0.01318216323852539, 0.01042318344116211, 0.008270978927612305, 0.009155988693237305, 0.009374856948852539, 0.008859872817993164, 0.007263898849487305, 0.0071680545806884766, 0.008274078369140625, 0.00892782211303711, 0.009694099426269531, 0.008069992065429688, 0.010267019271850586, 0.008785009384155273, 0.020442962646484375, 0.010144948959350586, 0.028335094451904297, 0.0159609317779541, 0.017171144485473633, 0.008543968200683594, 0.014740943908691406, 0.016849994659423828, 0.008788108825683594, 0.009524822235107422, 0.015004873275756836, 0.014819860458374023, 0.013712167739868164, 0.010118961334228516, 0.00934600830078125, 0.011625051498413086, 0.008626937866210938, 0.009073972702026367, 0.008317947387695312, 0.008546829223632812, 0.008774995803833008, 0.009417057037353516, 0.008713006973266602, 0.008201837539672852, 0.008626937866210938, 0.007649898529052734, 0.009073972702026367, 0.009231090545654297, 0.008633852005004883, 0.00821995735168457, 0.0087890625, 0.008959054946899414, 0.00870513916015625, 0.010051965713500977, 0.008788824081420898, 0.009289026260375977, 0.008433818817138672, 0.008102893829345703, 0.008455038070678711, 0.00786900520324707, 0.007704973220825195, 0.009142875671386719, 0.00934290885925293, 0.00933218002319336, 0.00937795639038086, 0.008035898208618164, 0.008751153945922852, 0.008807182312011719, 0.008679866790771484, 0.011729001998901367, 0.009994983673095703, 0.007502079010009766, 0.010048866271972656, 0.007591962814331055, 0.007812023162841797, 0.010078191757202148, 0.010416984558105469, 0.007843017578125, 0.008979082107543945, 0.008517980575561523, 0.008469820022583008, 0.008516073226928711]

    Average time (seconds):
    0.0101871991158
    ~~~

    Before partitioning, this query took 84.86ms on average. After partitioning, the query took only 10.18ms on average.

3. SSH to the instance in us-west2-a with the Python client.

4. Create 100 new Los Angeles-based users:

    {% include copy-clipboard.html %}
    ~~~ shell
    python tuning.py \
    --host=<address of a node in us-west2-a> \
    --statement="INSERT INTO users VALUES (gen_random_uuid(), 'los angeles', 'Los Angel', '111 West Street', '9822222379937347')" \
    --repeat=100 \
    --times
    ~~~

    ~~~
    Times (seconds):
    [0.020039081573486328, 0.01777195930480957, 0.01576399803161621, 0.01437997817993164, 0.014649152755737305, 0.015197992324829102, 0.014456033706665039, 0.014695882797241211, 0.014876127243041992, 0.015021085739135742, 0.015058040618896484, 0.014045953750610352, 0.014014005661010742, 0.014796972274780273, 0.014877796173095703, 0.01542806625366211, 0.014912128448486328, 0.013672113418579102, 0.013108015060424805, 0.013121843338012695, 0.013231039047241211, 0.012846946716308594, 0.015540838241577148, 0.017364025115966797, 0.017375946044921875, 0.013559818267822266, 0.01997089385986328, 0.01485300064086914, 0.014752864837646484, 0.0161898136138916, 0.015482187271118164, 0.01728200912475586, 0.014661073684692383, 0.01738905906677246, 0.014000177383422852, 0.015074014663696289, 0.016113996505737305, 0.0212709903717041, 0.015341997146606445, 0.014533042907714844, 0.01923394203186035, 0.014566183090209961, 0.014284849166870117, 0.014132976531982422, 0.013025999069213867, 0.012939929962158203, 0.013168096542358398, 0.01414799690246582, 0.013550043106079102, 0.014257192611694336, 0.01324605941772461, 0.012845039367675781, 0.01318502426147461, 0.01363992691040039, 0.012994050979614258, 0.012917041778564453, 0.016546010971069336, 0.01288294792175293, 0.013133049011230469, 0.013183116912841797, 0.012843132019042969, 0.013171195983886719, 0.013313055038452148, 0.013455867767333984, 0.012791872024536133, 0.013545036315917969, 0.013504981994628906, 0.01733994483947754, 0.01703500747680664, 0.017106056213378906, 0.015326976776123047, 0.014261007308959961, 0.014874935150146484, 0.015451908111572266, 0.0175020694732666, 0.015249967575073242, 0.015176057815551758, 0.014071941375732422, 0.014862060546875, 0.014670133590698242, 0.01705193519592285, 0.014616012573242188, 0.014895915985107422, 0.014254093170166016, 0.013842105865478516, 0.01409912109375, 0.014586925506591797, 0.014189004898071289, 0.013956069946289062, 0.014365196228027344, 0.014170169830322266, 0.015768051147460938, 0.015504121780395508, 0.02086496353149414, 0.015269994735717773, 0.0164639949798584, 0.014205217361450195, 0.014553070068359375, 0.017592906951904297, 0.014912843704223633]

    Average time (seconds):
    0.0149531435966

    Average time (seconds):
    0.13881247282
    ~~~

    Before partitioning, this query took 138.81ms on average. After partitioning, the query took only 14.95ms on average.
