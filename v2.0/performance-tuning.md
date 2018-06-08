---
title: Performance Tuning
summary: Essential techniques for getting fast reads and writes in a single- and multi-region CockroachDB deployment.
toc: true
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

You'll then scale the cluster to 9 nodes running across 3 GCE region, with an extra instance in each region for read/write testing:

<img src="{{ 'images/v2.0/perf_tuning_multi_region_topology.png' | relative_url }}" alt="Perf tuning topology" style="max-width:100%" />

To reproduce the performance demonstrated in this tutorial:

- For CockroachDB nodes, you'll use [`n1-standard-4`](https://cloud.google.com/compute/docs/machine-types#standard_machine_types) instances (4 vCPUs, 15 GB memory) with [local SSDs](https://cloud.google.com/compute/docs/disks/#localssds).
- For read/write testing, you'll use smaller instances, such as `n1-standard-1`.

### Schema

You'll use sample schema and data for Cockroach Lab's fictional vehicle-sharing company, [MovR](https://github.com/cockroachdb/movr):

<img src="{{ 'images/v2.0/perf_tuning_movr_schema.png' | relative_url }}" alt="Perf tuning schema" style="max-width:100%" />

{{site.data.alerts.callout_info}}
The [`IMPORT`](import.html) feature you'll use to import the data does not support foreign keys, so you'll import the data without the [foreign key constraints](foreign-key.html) but with the secondary indexes required to add the foreign key constraints after import.
{{site.data.alerts.end}}

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
1. Reserve 4 VMs: roachprod create jesse-crdb -n 4 --local-ssd
2. Optimize the local SSDs for write performance: roachprod run jesse-crdb:1-3 -- 'sudo umount /mnt/data1; sudo mount -o discard,defaults,nobarrier /dev/disk/by-id/google-local-ssd-0 /mnt/data1/; mount | grep /mnt/data1'
3. Put cockroach` on all VM: `roachprod run jesse-crdb "curl https://binaries.cockroachdb.com/cockroach-v2.0.3.linux-amd64.tgz | tar -xvz; mv cockroach-v2.0.3.linux-amd64/cockroach cockroach"
4. Start the cluster: roachprod start jesse-crdb:1-3
5. List the IP address of all instances: roachprod list -d jesse-crdb
6. SSH onto instance 4: roachprod run jesse-crdb:4
7. Start sql shell: ./cockroach sql --insecure --host=<IP address of any node>
8. Run the SQL commands in Step 4 below.
9. Still on instance 4, install the Python client. See step 5.
-->

### Step 1. Configure your network

CockroachDB requires TCP communication on two ports:

- **26257** (`tcp:26257`) for inter-node communication (i.e., working as a cluster)
- **8080** (`tcp:8080`) for accessing the Admin UI

Since GCE instances communicate on their internal IP addresses by default, you don't need to take any action to enable inter-node communication. However, if you want to access the Admin UI from your local network, you must [create a firewall rule for your project](https://cloud.google.com/vpc/docs/using-firewalls):

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

1. [Create 3 instances](https://cloud.google.com/compute/docs/instances/create-start-instance) for your CockroachDB nodes. While creating each instance:  
    - Select the **us-east1-b** [zone](https://cloud.google.com/compute/docs/regions-zones/).
    - Use the `n1-standard-4` machine type (4 vCPUs, 15 GB memory).
    - [Create and mount a local SSD](https://cloud.google.com/compute/docs/disks/local-ssd#create_local_ssd).
    - To apply the Admin UI firewall rule you created earlier, click **Management, disk, networking, SSH keys**, select the **Networking** tab, and then enter `cockroachdb` in the **Network tags** field.

2. Note the internal IP address of each `n1-standard-4` instance. You'll need these addresses when starting the CockroachDB nodes.

3. SSH to each instance and [optimize the local SSD for write performance](https://cloud.google.com/compute/docs/disks/performance#optimize_local_ssd) (see the **Disable write cache flushing** section).

4. Create a separate instance for read/write testing, also in the **us-east1-b** zone. This instance can be smaller, such as `n1-standard-1`.

### Step 3. Start a 3-node cluster

1. SSH to the first `n1-standard-4` instance.

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

4. Run the [`cockroach start`](start-a-node.html) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --advertise-host=<node1 internal address> \
    --join=<node1 internal address>:26257,<node2 internal address>:26257,<node3 internal address>:26257 \
    --cache=.25 \
    --max-sql-memory=.25 \
    --background
    ~~~

5. Repeat steps 1 - 4 for the other two `n1-standard-4` instances.

6. On any of the `n1-standard-4` instances, run the [`cockroach init`](initialize-a-cluster.html) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --insecure --host=localhost
    ~~~

    Each node then prints helpful details to the [standard output](start-a-node.html#standard-output), such as the CockroachDB version, the URL for the admin UI, and the SQL URL for clients.

### Step 4. Import the Movr dataset

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
    | 364858539979014145 | succeeded |                  1 |    0 |             0 |              0 |     0 |
    +--------------------+-----------+--------------------+------+---------------+----------------+-------+
    (1 row)

    Time: 2.716821727s
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
        mycol STRING NULL,
      	ext JSON NULL,
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
    | 364860420800708609 | succeeded |                  1 |    0 |             0 |              0 |     0 |
    +--------------------+-----------+--------------------+------+---------------+----------------+-------+
    (1 row)

    Time: 4.554006725s
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
    | 364861341888217089 | succeeded |                  1 |    0 |             0 |              0 |     0 |
    +--------------------+-----------+--------------------+------+---------------+----------------+-------+
    (1 row)

    Time: 49.622076145s
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

    As mentioned above, it wasn't possible to put these relationships in place during `IMPORT`, but it was possible to create the required secondary indexes. Now, let's add the foreign key constraints:

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

    **Add a note about why we need vehicle_city and link to ticket. Basically, we can't have 2 foreign keys constraints on the same column (city). So we duplicate city as vehicle_city and add check constraint to ensure that they are identical. https://github.com/cockroachdb/cockroach/issues/23580**

### Step 5. Install the Python client

When measuring SQL performance, it's best to run a given statement multiple times and look at the average and/or cumulative latency. For that purpose, you'll install and use a Python testing client.

1. SSH to the fourth instance, the one not running a CockroachDB node.

2. Make sure all of the system software is up-to-date:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo apt-get update && sudo apt-get -y upgrade
    ~~~

3. Install Pip:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo apt-get install python-pip
    ~~~

4. Use Pip to install the `psycopg2` driver:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pip install psycopg2-binary
    ~~~

5. Download the Python client:

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
--statement="SELECT * FROM rides WHERE city = 'amsterdam' AND id = '000041ed-82d4-4d72-b822-fdb50ae49928'" \
--repeat=20
~~~

~~~
Result:
['id', 'city', 'vehicle_city', 'rider_id', 'vehicle_id', 'start_address', 'end_address', 'start_time', 'end_time', 'revenue']
['000041ed-82d4-4d72-b822-fdb50ae49928', 'amsterdam', 'amsterdam', 'ad8d4327-6f66-441a-b153-f9769b80bf63', '29023f4a-0c23-4681-8d6d-ccff1b7520f2', '024 Joseph Road\nNorth Lindaton, NY 89020-0096', '4730 Peterson Neck\nPort Nicholas, NJ 16287-1322', '2018-06-26 16:04:19.039034', '2018-06-26 16:16:19.039034', '55.28']

Average time (seconds):
0.00116972923279
~~~

Retrieving a subset of columns will be even faster:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="SELECT vehicle_id, start_address, end_address \
FROM rides \
WHERE city = 'amsterdam' AND id = '000041ed-82d4-4d72-b822-fdb50ae49928'" \
--repeat=20
~~~

~~~
Result:
['vehicle_id', 'start_address', 'end_address']
['29023f4a-0c23-4681-8d6d-ccff1b7520f2', '024 Joseph Road\nNorth Lindaton, NY 89020-0096', '4730 Peterson Neck\nPort Nicholas, NJ 16287-1322']

Average time (seconds):
0.000961458683014
~~~

#### Filtering by a non-indexed column (full table scan)

You'll get generally poor performance when retrieving a single row based on a column that is not in the primary key or any secondary index:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="SELECT * FROM users WHERE name = 'Casey Bell'" \
--repeat=20
~~~

~~~
Result:
['id', 'city', 'name', 'address', 'credit_card']
['011fefdc-5bf9-42df-9277-cc49bbae39ad', 'amsterdam', 'Casey Bell', '088 Tiffany Union\nLake Emilytown, MS 72223', '4924427245134960']

Average time (seconds):
0.00316574573517
~~~

To understand why this query performs poorly, use the SQL client built into the `cockroach` binary to [`EXPLAIN`](explain.html) the query plan:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="EXPLAIN SELECT * FROM users WHERE name = 'Casey Bell';"
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
--statement="\ (gen on users (name)" \
--repeat=1
~~~

The query will now return much faster:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="SELECT * FROM users WHERE name = 'Casey Bell'" \
--repeat=20
~~~

~~~
Result:
['id', 'city', 'name', 'address', 'credit_card']
['011fefdc-5bf9-42df-9277-cc49bbae39ad', 'amsterdam', 'Casey Bell', '088 Tiffany Union\nLake Emilytown, MS 72223', '4924427245134960']

Average time (seconds):
0.000671005249023
~~~

To understand why performance improved from 3.16ms (without index) to 0.67ms (with index), use [`EXPLAIN`](explain.html) to see the new query plan:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="EXPLAIN SELECT * FROM users WHERE name = 'Casey Bell';"
~~~

~~~
+------------+-------+---------------------------------------+
|    Tree    | Field |              Description              |
+------------+-------+---------------------------------------+
| index-join |       |                                       |
|  ├── scan  |       |                                       |
|  │         | table | users@users_name_idx                  |
|  │         | spans | /"Casey Bell"-/"Casey Bell"/PrefixEnd |
|  └── scan  |       |                                       |
|            | table | users@primary                         |
+------------+-------+---------------------------------------+
(6 rows)
~~~

This shows you that CockroachDB starts with the secondary index (`table | users@users_name_idx`). Because it is sorted by `name`, the query can jump directly to the relevant value (`spans | /"Casey Bell"-/"Casey Bell"/PrefixEnd`). However, the query needs to return values not in the secondary index, so CockroachDB grabs the primary key (`city`/`id`) stored with the `name` value (the primary key is always stored with entries in a secondary index), jumps to that value in the primary index, and then returns the full row.

Thinking back to the [earlier discussion of ranges and leaseholders](#important-concepts), because the `users` table is small (under 64 MiB), the primary index and all secondary indexes are contained in a single range with a single leaseholder. If the table were bigger, however, the primary index and secondary index could reside in separate ranges, each with its own leaseholder. In this case, if the leaseholders were on different nodes, the query would require more network hops, further increasing latency.

#### Filtering by a secondary index storing additional columns

When you have a query that filters by a specific column but retrieves a subset of the table's total columns, you can improve performance by [storing](indexes.html#storing-columns) those additional columns in the secondary index to prevent the query from needing to scan the primary index as well.

For example, let's say you frequently retrieve a user's name and credit card number. As seen above, with the current secondary index on `name`, CockroachDB still needs to scan the primary index to get the credit card number:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="EXPLAIN SELECT name, credit_card FROM users WHERE name = 'Casey Bell';"
~~~

~~~
+-----------------+-------+---------------------------------------+
|      Tree       | Field |              Description              |
+-----------------+-------+---------------------------------------+
| render          |       |                                       |
|  └── index-join |       |                                       |
|       ├── scan  |       |                                       |
|       │         | table | users@users_name_idx                  |
|       │         | spans | /"Casey Bell"-/"Casey Bell"/PrefixEnd |
|       └── scan  |       |                                       |
|                 | table | users@primary                         |
+-----------------+-------+---------------------------------------+
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
--statement="\ (gen on users (name) STORING (credit_card)" \
--repeat=1
~~~

Now that `credit_card` values are stored in the index on `name`, CockroachDB only needs to scan that index:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="EXPLAIN SELECT name, credit_card FROM users WHERE name = 'Casey Bell';"
~~~

~~~
+-----------+-------+---------------------------------------+
|   Tree    | Field |              Description              |
+-----------+-------+---------------------------------------+
| render    |       |                                       |
|  └── scan |       |                                       |
|           | table | users@users_name_idx                  |
|           | spans | /"Casey Bell"-/"Casey Bell"/PrefixEnd |
+-----------+-------+---------------------------------------+
(4 rows)
~~~

This results in even faster performance, reducing latency from 0.67ms (index without storing) to 0.52ms (index with storing):

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="SELECT name, credit_card FROM users WHERE name = 'Casey Bell'" \
--repeat=20
~~~

~~~
Result:
['name', 'credit_card']
['Casey Bell', '4924427245134960']

Average time (seconds):
0.000526654720306
~~~

#### Joining data from different tables

Secondary indexes are crucial when [joining](joins.html) data from different tables as well.

For example, let's say you want to count the number of users who started rides within a given hour. To do this, you need to use a join to get the relevant rides from the `rides` table and then map the `rider_id` for each of those rides to the corresponding `id` in the `users` table, counting each mapping only once:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="SELECT count(DISTINCT users.id) \
FROM users \
INNER JOIN rides ON rides.rider_id = users.id \
WHERE start_time BETWEEN '2018-06-26 16:00:00' AND '2018-06-26 17:00:00'" \
--repeat=20
~~~

~~~
Result:
['count']
['1537']

Average time (seconds):
1.45326458216
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
WHERE start_time BETWEEN '2018-06-26 16:00:00' AND '2018-06-26 17:00:00';"
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
+--------------------------------------------------------------------------+--------------------------------------------------------------------------+----------+----------+--------------+
|                                Start Key                                 |                                 End Key                                  | Range ID | Replicas | Lease Holder |
+--------------------------------------------------------------------------+--------------------------------------------------------------------------+----------+----------+--------------+
| NULL                                                                     | /"boston"/"v_\x8a\xf3\x0emJ\x82\x95nb\u0093\x0e\x97q"/PrefixEnd          |       52 | {1,2,3}  |            2 |
| /"boston"/"v_\x8a\xf3\x0emJ\x82\x95nb\u0093\x0e\x97q"/PrefixEnd          | /"los                                                                    |       42 | {1,2,3}  |            3 |
|                                                                          | angeles"/"\xe9\xb3\u007f\xbd\x01\x9dLT\xa9~\x9dc\x0f\xa1\x8a-"/PrefixEnd |          |          |              |
| /"los                                                                    | /"paris"/"b\xa7\x01\xf9\xd6\x0fN\xbc\x81\xb5:\\\x963l="/PrefixEnd        |       46 | {1,2,3}  |            2 |
| angeles"/"\xe9\xb3\u007f\xbd\x01\x9dLT\xa9~\x9dc\x0f\xa1\x8a-"/PrefixEnd |                                                                          |          |          |              |
| /"paris"/"b\xa7\x01\xf9\xd6\x0fN\xbc\x81\xb5:\\\x963l="/PrefixEnd        | /"rome"/"\xe7:\xe2 {\x1bE\x81\x97E\x1c\xe0XG\x84\xfb"/PrefixEnd          |       47 | {1,2,3}  |            2 |
| /"rome"/"\xe7:\xe2 {\x1bE\x81\x97E\x1c\xe0XG\x84\xfb"/PrefixEnd          | /"san francisco"/"\xb0\xa2\x1c\x87!kDx\xa8\x857n\v\a\xdcA"               |       49 | {1,2,3}  |            2 |
| /"san francisco"/"\xb0\xa2\x1c\x87!kDx\xa8\x857n\v\a\xdcA"               | /"washington dc"/"$}Y\xb0\x15e@㩙\x8b\xe4U\x94\xf0q"/PrefixEnd           |       51 | {1,2,3}  |            2 |
| /"washington dc"/"$}Y\xb0\x15e@㩙\x8b\xe4U\x94\xf0q"/PrefixEnd           | NULL                                                                     |       41 | {1,2,3}  |            2 |
+--------------------------------------------------------------------------+--------------------------------------------------------------------------+----------+----------+--------------+
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
| NULL      | NULL    |       27 | {1,2,3}  |            1 |
+-----------+---------+----------+----------+--------------+
(1 row)
~~~

The results above tell us that the `rides` table is split across 7 ranges, with 1 range's leaseholder on node 3 and the leaseholders for the rest of the ranges on node 2, and the leaseholder of the single range for `users` is on node 1.

With this information, we can visualize what's happening, assuming the request is sent to node 1 and ignoring non-involved ranges:

<img src="{{ 'images/v2.0/perf_tuning_join1.png' | relative_url }}" alt="Perf tuning concepts" style="max-width:100%" />

Now, given the `WHERE` condition of the join, the full table scan of `rides`, across all of its 7 ranges, is particularly wasteful. To speed up the query, you can create a secondary index on the `WHERE` condition (`rides.start_time`) storing the join key (`rides.rider_id`) and then re-run the join:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="CREATE INDEX ON rides (start_time) STORING (rider_id)" \
--repeat=1
~~~

~~~
Average time (seconds):
66.1792008877
~~~

{{site.data.alerts.callout_info}}
The `rides` table contains 1 million rows, so adding this index will take a minute or two.
{{site.data.alerts.end}}

Adding the secondary index reduced the query time from 1.45s to 48.93ms:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="SELECT count(DISTINCT users.id) \
FROM users \
INNER JOIN rides ON rides.rider_id = users.id \
WHERE start_time BETWEEN '2018-06-26 16:00:00' AND '2018-06-26 17:00:00'" \
--repeat=20
~~~

~~~
Result:
['count']
['1537']

Average time (seconds):
0.0489381194115
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
WHERE start_time BETWEEN '2018-06-26 16:00:00' AND '2018-06-26 17:00:00';"
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
|                     | spans    | /2018-06-26T16:00:00Z-/2018-06-26T17:00:00.000000001Z |
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
+---------------------------------------------------------------------------------------+---------------------------------------------------------------------------------------+----------+----------+--------------+
|                                       Start Key                                       |                                        End Key                                        | Range ID | Replicas | Lease Holder |
+---------------------------------------------------------------------------------------+---------------------------------------------------------------------------------------+----------+----------+--------------+
| NULL                                                                                  | /2018-06-16T16:07:50.038549Z/"amsterdam"/"\xec\xc7\x02\x05\x1d]K\xbb\xa0\xd6µ]\x1d2#" |       43 | {1,2,3}  |            1 |
| /2018-06-16T16:07:50.038549Z/"amsterdam"/"\xec\xc7\x02\x05\x1d]K\xbb\xa0\xd6µ]\x1d2#" | /2018-06-29T16:28:10.863198Z/"new                                                     |       34 | {1,2,3}  |            1 |
|                                                                                       | york"/"\xcev\xeb\x9ah\x80C<\x86\xb6\x83\x00\xc4\x1f\xc6\x04"                          |          |          |              |
| /2018-06-29T16:28:10.863198Z/"new                                                     | NULL                                                                                  |       35 | {1,2,3}  |            1 |
| york"/"\xcev\xeb\x9ah\x80C<\x86\xb6\x83\x00\xc4\x1f\xc6\x04"                          |                                                                                       |          |          |              |
+---------------------------------------------------------------------------------------+---------------------------------------------------------------------------------------+----------+----------+--------------+
(3 rows)
~~~

This tells us the the index is stored in 3 ranges, with the leaseholders for all of them on node 1. We already know that the leaseholder for the `users` table is also on node 1.

With this information, we can visualize what's happening now, still assuming the request is sent to node 1 and ignoring non-involved ranges:

<img src="{{ 'images/v2.0/perf_tuning_join2.png' | relative_url }}" alt="Perf tuning concepts" style="max-width:100%" />

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
--repeat=20
~~~

~~~
Result:
['vehicle_id', 'max']
['e1801dda-f8f5-4571-9379-023206697e63', '2018-07-12 17:31:31.111566']
['7193da42-1aea-43ec-a4a9-02411b5c1f4e', '2018-07-12 16:50:57.171841']
['a92deee5-7df2-45a5-a558-58799921e862', '2018-07-12 16:28:54.957921']
['a24102db-9f93-48a4-9493-56167d25be1c', '2018-07-12 16:32:21.469963']
['7e2c4757-149c-4d41-bd0f-59fc7c8cc6c8', '2018-07-12 16:51:52.118150']

Average time (seconds):
5.31894932985
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

This is a complex query plan, but the important thing to note is the full table scan of `rides@primary` above the `subquery`. This shows you that, after the subquery returns the IDs of the top 5 vehicles, CockroachDB scans the entire primary index to find the rows with `max(end_time)` for each `vehicle_id`, although you might expect CockroachDB to more efficiently use the secondary index on `vehicle_id`.

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
--repeat=20
~~~

~~~
Result:
['vehicle_id']
['a92deee5-7df2-45a5-a558-58799921e862']
['7e2c4757-149c-4d41-bd0f-59fc7c8cc6c8']
['a24102db-9f93-48a4-9493-56167d25be1c']
['7193da42-1aea-43ec-a4a9-02411b5c1f4e']
['e1801dda-f8f5-4571-9379-023206697e63']

Average time (seconds):
1.19682677984
~~~

And then put the results into the `IN` list to get the most recent rides of the vehicles:

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="SELECT vehicle_id, max(end_time) \
FROM rides \
WHERE vehicle_id IN ( \
  'a92deee5-7df2-45a5-a558-58799921e862', \
  '7e2c4757-149c-4d41-bd0f-59fc7c8cc6c8', \
  'a24102db-9f93-48a4-9493-56167d25be1c', \
  '7193da42-1aea-43ec-a4a9-02411b5c1f4e', \
  'e1801dda-f8f5-4571-9379-023206697e63' \
) \
GROUP BY vehicle_id;" \
--repeat=20
~~~

~~~
Result:
['vehicle_id', 'max']
['7193da42-1aea-43ec-a4a9-02411b5c1f4e', '2018-07-12 16:50:57.171841']
['7e2c4757-149c-4d41-bd0f-59fc7c8cc6c8', '2018-07-12 16:51:52.118150']
['a92deee5-7df2-45a5-a558-58799921e862', '2018-07-12 16:28:54.957921']
['a24102db-9f93-48a4-9493-56167d25be1c', '2018-07-12 16:32:21.469963']
['e1801dda-f8f5-4571-9379-023206697e63', '2018-07-12 17:31:31.111566']

Average time (seconds):
1.33713431358
~~~

This approach reduced the query time from 5.31s (query with subquery) to 2.52s (2 distinct queries).

### Step 7. Test/tune write performance

- [Bulk inserting into an existing table](#bulk-inserting-into-an-existing-table)
- [Minimizing unused indexes](#minimizing-unused-indexes)
- [Retrieving the ID of a newly inserted row](#retrieving-the-id-of-a-newly-inserted-row)

#### Bulk inserting into an existing table

Moving on to writes, let's imagine that you have a batch of 100 new users to insert into the `users` table. The most obvious approach is to insert each row using 100 separate `INSERT` statements:  

{{site.data.alerts.callout_info}}
For the purpose of demonstration, the command below inserts the same user 100 times, each time with a different unique ID. Note also that you're now adding the `--cumulative` flag to print the total time across all 100 inserts.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="INSERT INTO users VALUES (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347')" \
--repeat=100 \
--cumulative
~~~

~~~
Average time (seconds):
0.00152776479721

Cumulative time (seconds):
0.152776479721
~~~

The 100 inserts took 152.77ms to complete, which isn't bad. However, it's significantly faster to use a single `INSERT` statement with 100 comma-separated `VALUES` clauses:

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
0.00958895683289

Cumulative time (seconds):
0.00958895683289
~~~

As you can see, this multi-row `INSERT` technique reduced the total time for 100 inserts from 152.77ms to 9.58ms. It's useful to note that this technique is equally effective for `UPSERT` and `DELETE` statements as well.

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
['168']

Average time (seconds):
0.00696015357971
~~~

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="UPDATE users \
SET name = 'Blah Blah' \
WHERE name LIKE 'C%'" \
--repeat=1
~~~

~~~
Average time (seconds):
0.0284731388092
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
0.216127157211
~~~

{% include copy-clipboard.html %}
~~~ shell
$ python tuning.py \
--host=<address of any node> \
--statement="UPDATE users \
SET name = 'Yo Yo' \
WHERE name = 'Blah Blah'" \
--repeat=1
~~~

~~~
Average time (seconds):
0.0113959312439
~~~

Before, when both the primary and secondary indexes needed to be updated, the updates took 28.47ms. Now, after dropping the secondary index, an equivalent update took only 11.39ms.

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
0.00267601013184
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
['814e63fb-36b7-42f6-b1f0-01865c7b9fbc']

Average time (seconds):
0.00518202781677
~~~

Combined, these statements are relatively fast, at 7.85ms, but an even more performant approach is to append `RETURNING id` to the end of the `INSERT`:

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
['ddc2afef-67e3-4110-b124-eba872ba3565']

Average time (seconds):
0.00249600410461
~~~

At just 2.49ms, this approach is faster due to the write and read executing in one instead of two client-server roundtrips. Note also that, as discussed earlier, if the leaseholder for the table happens to be on a different node than the query is running against, that introduces additional network hops and latency.

<!-- - upsert instead of insert/update
- update using case expressions (instead of 2 separate updates)
- returning nothing
- insert with returning (auto gen ID) instead of select to get auto gen ID
- Maybe interleaved tables -->

## Multi-region deployment

### Step 8. Create more instances

### Step 9. Scale to 9 nodes across 3 regions

### Step 10. Test performance before partitioning

### Step 11. Partition your data by city

### Step 12. Test performance after partitioning
