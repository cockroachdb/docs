---
title: Performance Tuning
summary: Essential techniques for getting fast reads and writes in a single- and multi-region CockroachDB deployment.
toc: true
---

This tutorial shows you essential techniques for getting fast reads and writes in CockroachDB, starting with a single-region deployment and expanding into multiple regions.

For a comprehensive list of tuning recommendations, only some of which are demonstrated here, see [SQL Performance Best Practices](performance-best-practices-overview.html).

## Overview

### Topology

You'll start with a 3-node CockroachDB cluster in a single Google Compute Engine (GCE) zone, with an extra instance for running a client application workload:

<img src="{{ 'images/v2.0/perf_tuning_single_region_topology.png' | relative_url }}" alt="Perf tuning topology" style="max-width:100%" />

{{site.data.alerts.callout_info}}
Within a single GCE zone, network latency between instances should be sub-millisecond.
{{site.data.alerts.end}}

You'll then scale the cluster to 9 nodes running across 3 GCE regions, with an extra instance in each region for a client application workload:

<img src="{{ 'images/v2.0/perf_tuning_multi_region_topology.png' | relative_url }}" alt="Perf tuning topology" style="max-width:100%" />

To reproduce the performance demonstrated in this tutorial:

- For each CockroachDB node, you'll use the [`n1-standard-4`](https://cloud.google.com/compute/docs/machine-types#standard_machine_types) machine type (4 vCPUs, 15 GB memory) with the Ubuntu 16.04 OS image and a [local SSD](https://cloud.google.com/compute/docs/disks/#localssds) disk.
- For running the client application workload, you'll use smaller instances, such as `n1-standard-1`.

### Schema

Your schema and data will be based on the fictional peer-to-peer vehicle-sharing app, MovR, that was featured in the [CockroachDB 2.0 demo](https://www.youtube.com/watch?v=v2QK5VgLx6E):

<img src="{{ 'images/v2.0/perf_tuning_movr_schema.png' | relative_url }}" alt="Perf tuning schema" style="max-width:100%" />

A few notes about the schema:

- There are just three self-explanatory tables: In essence, `users` represents the people registered for the service, `vehicles` represents the pool of vehicles for the service, and `rides` represents when and where users have participated.   
- Each table has a composite primary key, with `city` being first in the key. Although not necessary initially in the single-region deployment, once you scale the cluster to multiple regions, these compound primary keys will enable you to [geo-partition data at the row level](partitioning.html#partition-using-primary-key) by `city`. As such, this tutorial demonstrates a schema designed for future scaling.
- The [`IMPORT`](import.html) feature you'll use to import the data does not support foreign keys, so you'll import the data without [foreign key constraints](foreign-key.html). However, the import will create the secondary indexes required to add the foreign keys later.
- The `rides` table contains both `city` and the seemingly redundant `vehicle_city`. This redundancy is necessary because, while it is not possible to apply more than one foreign key constraint to a single column, you will need to apply two foreign key constraints to the `rides` table, and each will require city as part of the constraint. The duplicate `vehicle_city`, which is kept in sync with `city` via a [`CHECK` constraint](check.html), lets you overcome [this limitation](https://github.com/cockroachdb/cockroach/issues/23580).

### Important concepts

To understand the techniques in this tutorial, and to be able to apply them in your own scenarios, it's important to first review some important [CockroachDB architectural concepts](architecture/overview.html):

{% include {{ page.version.version }}/misc/basic-terms.md %}

As mentioned above, when a query is executed, the cluster routes the request to the leaseholder for the range containing the relevant data. If the query touches multiple ranges, the request goes to multiple leaseholders. For a read request, only the leaseholder of the relevant range retrieves the data. For a write request, the Raft consensus protocol dictates that a majority of the replicas of the relevant range must agree before the write is committed.

Let's consider how these mechanics play out in some hypothetical queries.

#### Read scenario

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

#### Write scenario

Now imagine a simple write scenario where a query is executed against node 3 to write to table 1:

<img src="{{ 'images/v2.0/perf_tuning_concepts3.png' | relative_url }}" alt="Perf tuning concepts" style="max-width:100%" />

In this case:

1. Node 3 (the gateway node) receives the request to write to table 1.
2. The leaseholder for table 1 is on node 1, so the request is routed there.
3. The leaseholder is the same replica as the Raft leader (as is typical), so it simultaneously appends the write to its own Raft log and notifies its follower replicas on nodes 2 and 3.
4. As soon as one follower has appended the write to its Raft log (and thus a majority of replicas agree based on identical Raft logs), it notifies the leader and the write is committed to the key-values on the agreeing replicas. In this diagram, the follower on node 2 acknowledged the write, but it could just as well have been the follower on node 3. Also note that the follower not involved in the consensus agreement usually commits the write very soon after the others.
5. Node 1 returns acknowledgement of the commit to node 3.
6. Node 3 responds to the client.

Just as in the read scenario, if the write request is received by the node that has the leaseholder and Raft leader for the relevant range, there are fewer network hops:

<img src="{{ 'images/v2.0/perf_tuning_concepts4.png' | relative_url }}" alt="Perf tuning concepts" style="max-width:100%" />

#### Network and I/O bottlenecks

With the above examples in mind, it's always important to consider network latency and disk I/O as potential performance bottlenecks. In summary:

- For reads, hops between the gateway node and the leaseholder add latency.
- For writes, hops between the gateway node and the leaseholder/Raft leader, and hops between the leaseholder/Raft leader and Raft followers, add latency. In addition, since Raft log entries are persisted to disk before a write is committed, disk I/O is important.

## Single-region deployment

<!-- roachprod instructions for single-region deployment
1. Reserve 12 instances across 3 GCE zone: roachprod create <yourname>-tuning --geo --gce-zones us-east1-b,us-west1-a,us-west2-a --local-ssd -n 12
2. Put cockroach` on all instances:
   - roachprod run <yourname>-tuning "curl https://binaries.cockroachdb.com/cockroach-v2.0.4.linux-amd64.tgz | tar -xvz"
   - roachprod run <yourname>-tuning "sudo cp -i cockroach-v2.0.4.linux-amd64/cockroach /usr/local/bin/"
3. Start the cluster in us-east1-b: roachprod start -b "/usr/local/bin/cockroach" <yourname>-tuning:1-3
4. You'll need the addresses of all instances later, so list and record them somewhere: roachprod list -d <yourname>-tuning
5. Import the Movr dataset:
   - SSH onto instance 4: roachprod run <yourname>-tuning:4
   - Run the SQL commands in Step 4 below.
8. Install the Python client:
   - Still on instance 4, run commands in Step 5 below.
9. Test/tune read performance:
   - Still on instance 4, run commands in Step 6.
10. Test/tune write performance:
   - Still on instance 4, run commands in Step 7.
-->

### Step 1. Configure your network

CockroachDB requires TCP communication on two ports:

- **26257** (`tcp:26257`) for inter-node communication (i.e., working as a cluster)
- **8080** (`tcp:8080`) for accessing the Web UI

Since GCE instances communicate on their internal IP addresses by default, you do not need to take any action to enable inter-node communication. However, if you want to access the Web UI from your local network, you must [create a firewall rule for your project](https://cloud.google.com/vpc/docs/using-firewalls):

Field | Recommended Value
------|------------------
Name | **cockroachweb**
Source filter | IP ranges
Source IP ranges | Your local network's IP ranges
Allowed protocols | **tcp:8080**
Target tags | `cockroachdb`

{{site.data.alerts.callout_info}}
The **tag** feature will let you easily apply the rule to your instances.
{{site.data.alerts.end}}

### Step 2. Create instances

You'll start with a 3-node CockroachDB cluster in the `us-east1-b` GCE zone, with an extra instance for running a client application workload.

1. [Create 3 instances](https://cloud.google.com/compute/docs/instances/create-start-instance) for your CockroachDB nodes. While creating each instance:  
    - Select the `us-east1-b` [zone](https://cloud.google.com/compute/docs/regions-zones/).
    - Use the `n1-standard-4` machine type (4 vCPUs, 15 GB memory).
    - Use the Ubuntu 16.04 OS image.
    - [Create and mount a local SSD](https://cloud.google.com/compute/docs/disks/local-ssd#create_local_ssd).
    - To apply the Web UI firewall rule you created earlier, click **Management, disk, networking, SSH keys**, select the **Networking** tab, and then enter `cockroachdb` in the **Network tags** field.

2. Note the internal IP address of each `n1-standard-4` instance. You'll need these addresses when starting the CockroachDB nodes.

3. Create a separate instance for running a client application workload, also in the `us-east1-b` zone. This instance can be smaller, such as `n1-standard-1`.

### Step 3. Start a 3-node cluster

1. SSH to the first `n1-standard-4` instance.

2. Download the [CockroachDB archive](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz) for Linux, extract the binary, and copy it into the `PATH`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar -xz
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

3. Run the [`cockroach start`](start-a-node.html) command:

    {% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --insecure --host=localhost
    ~~~

    Each node then prints helpful details to the [standard output](start-a-node.html#standard-output), such as the CockroachDB version, the URL for the Web UI, and the SQL URL for clients.

### Step 4. Import the Movr dataset

Now you'll import Movr data representing users, vehicles, and rides in 3 eastern US cities (New York, Boston, and Washington DC) and 3 western US cities (Los Angeles, San Francisco, and Seattle).

1. SSH to the fourth instance, the one not running a CockroachDB node.

2. Download the [CockroachDB archive](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz) for Linux, and extract the binary:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar -xz
    ~~~

3. Copy the binary into the `PATH`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

4. Start the [built-in SQL shell](use-the-built-in-sql-client.html), pointing it at one of the CockroachDB nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure --host=<address of any node>
    ~~~

5. Create the `movr` database and set it as the default:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE movr;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SET DATABASE = movr;
    ~~~

6. Use the [`IMPORT`](import.html) statement to create and populate the `users`, `vehicles,` and `rides` tables:

    {% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
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
    `vehicles.city`, `vehicles.owner_id` | `users.city`, `users.id`
    `rides.city`, `rides.rider_id` | `users.city`, `users.id`
    `rides.vehicle_city`, `rides.vehicle_id` | `vehicles.city`, `vehicles.id`

    As mentioned earlier, it wasn't possible to put these relationships in place during `IMPORT`, but it was possible to create the required secondary indexes. Now, let's add the foreign key constraints:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE vehicles
    ADD CONSTRAINT fk_city_ref_users
    FOREIGN KEY (city, owner_id)
    REFERENCES users (city, id);
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE rides
    ADD CONSTRAINT fk_city_ref_users
    FOREIGN KEY (city, rider_id)
    REFERENCES users (city, id);
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE rides
    ADD CONSTRAINT fk_vehicle_city_ref_vehicles
    FOREIGN KEY (vehicle_city, vehicle_id)
    REFERENCES vehicles (city, id);
    ~~~

8. Exit the built-in SQL shell:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

### Step 5. Install the Python client

When measuring SQL performance, it's best to run a given statement multiple times and look at the average and/or cumulative latency. For that purpose, you'll install and use a Python testing client.

1. Still on the fourth instance, make sure all of the system software is up-to-date:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ sudo apt-get update && sudo apt-get -y upgrade
    ~~~

2. Install the `psycopg2` driver:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ sudo apt-get install python-psycopg2
    ~~~

3. Download the Python client:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ wget https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/performance/tuning.py \
    && chmod +x tuning.py
    ~~~

    As you'll see below, this client lets you pass command-line flags:

    Flag | Description
    -----|------------
    `--host` | The IP address of the target node. This is used in the client's connection string.
    `--statement` | The SQL statement to execute.
    `--repeat` | The number of times to repeat the statement. This defaults to 20.

    When run, the client prints the average time in seconds across all repetitions of the statement. Optionally, you can pass two other flags, `--time` to print the execution time in seconds for each repetition of the statement, and `--cumulative` to print the cumulative time in seconds for all repetitions. `--cumulative` is particularly useful when testing writes.

    {{site.data.alerts.callout_success}}
    To get similar help directly in your shell, use `./tuning.py --help`.
    {{site.data.alerts.end}}

### Step 6. Test/tune read performance

- [Filtering by the primary key](#filtering-by-the-primary-key)
- [Filtering by a non-indexed column (full table scan)](#filtering-by-a-non-indexed-column-full-table-scan)
- [Filtering by a secondary index](#filtering-by-a-secondary-index)
- [Filtering by a secondary index storing additional columns](#filtering-by-a-secondary-index-storing-additional-columns)
- [Joining data from different tables](#joining-data-from-different-tables)
- [Using `IN (list)` with a subquery](#using-in-list-with-a-subquery)
- [Using `IN (list)` with explicit values](#using-in-list-with-explicit-values)

#### Filtering by the primary key

Retrieving a single row based on the primary key will usually return in 2ms or less:

{% include_cached copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="SELECT * FROM rides WHERE city = 'boston' AND id = '000007ef-fa0f-4a6e-a089-ce74aa8d2276'" \
--repeat=50 \
--times
~~~

~~~
Result:
['id', 'city', 'vehicle_city', 'rider_id', 'vehicle_id', 'start_address', 'end_address', 'start_time', 'end_time', 'revenue']
['000007ef-fa0f-4a6e-a089-ce74aa8d2276', 'boston', 'boston', 'd66c386d-4b7b-48a7-93e6-f92b5e7916ab', '6628bbbc-00be-4891-bc00-c49f2f16a30b', '4081 Conner Courts\nSouth Taylor, VA 86921', '2808 Willis Wells Apt. 931\nMccoyberg, OH 10303-4879', '2018-07-20 01:46:46.003070', '2018-07-20 02:27:46.003070', '44.25']

Times (milliseconds):
[24.547100067138672, 0.7688999176025391, 0.6949901580810547, 0.8230209350585938, 0.698089599609375, 0.7278919219970703, 0.6978511810302734, 0.5998611450195312, 0.7150173187255859, 0.7338523864746094, 0.6768703460693359, 0.7460117340087891, 0.7028579711914062, 0.7121562957763672, 0.7579326629638672, 0.8080005645751953, 1.0089874267578125, 0.7259845733642578, 0.6411075592041016, 0.7269382476806641, 0.6339550018310547, 0.7460117340087891, 0.9441375732421875, 0.8139610290527344, 0.6990432739257812, 0.6339550018310547, 0.7319450378417969, 0.637054443359375, 0.6501674652099609, 0.7278919219970703, 0.7069110870361328, 0.5779266357421875, 0.6208419799804688, 0.9050369262695312, 0.7741451263427734, 0.5650520324707031, 0.6079673767089844, 0.6191730499267578, 0.7388591766357422, 0.5598068237304688, 0.6401538848876953, 0.6659030914306641, 0.6489753723144531, 0.621795654296875, 0.7548332214355469, 0.6010532379150391, 0.6990432739257812, 0.6699562072753906, 0.6210803985595703, 0.7240772247314453]

Average time (milliseconds):
1.18108272552
~~~

{{site.data.alerts.callout_info}}
When reading from a table or index for the first time in a session, the query will be slower than usual because the node issuing the query loads the schema of the table or index into memory first. For this reason, the first query took 24ms, whereas all others were sub-millisecond.
{{site.data.alerts.end}}

Retrieving a subset of columns will usually be even faster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="SELECT rider_id, vehicle_id \
FROM rides \
WHERE city = 'boston' AND id = '000007ef-fa0f-4a6e-a089-ce74aa8d2276'" \
--repeat=50 \
--times
~~~

~~~
Result:
['rider_id', 'vehicle_id']
['d66c386d-4b7b-48a7-93e6-f92b5e7916ab', '6628bbbc-00be-4891-bc00-c49f2f16a30b']

Times (milliseconds):
[1.2311935424804688, 0.7009506225585938, 0.5898475646972656, 0.6151199340820312, 0.5660057067871094, 0.6620883941650391, 0.5691051483154297, 0.5369186401367188, 0.5609989166259766, 0.5290508270263672, 0.5939006805419922, 0.5769729614257812, 0.5638599395751953, 0.5381107330322266, 0.61798095703125, 0.5879402160644531, 0.6008148193359375, 0.5900859832763672, 0.5190372467041016, 0.5409717559814453, 0.51116943359375, 0.5400180816650391, 0.5490779876708984, 0.4870891571044922, 0.5340576171875, 0.49591064453125, 0.5669593811035156, 0.4971027374267578, 0.5729198455810547, 0.514984130859375, 0.5309581756591797, 0.5099773406982422, 0.5550384521484375, 0.5328655242919922, 0.5559921264648438, 0.5319118499755859, 0.5059242248535156, 0.5719661712646484, 0.49614906311035156, 0.6041526794433594, 0.5080699920654297, 0.5240440368652344, 0.49591064453125, 0.5681514739990234, 0.5118846893310547, 0.5359649658203125, 0.5450248718261719, 0.5650520324707031, 0.5249977111816406, 0.5669593811035156]

Average time (milliseconds):
0.566024780273
~~~

#### Filtering by a non-indexed column (full table scan)

You'll get generally poor performance when retrieving a single row based on a column that is not in the primary key or any secondary index:

{% include_cached copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="SELECT * FROM users WHERE name = 'Natalie Cunningham'" \
--repeat=50 \
--times
~~~

~~~
Result:
['id', 'city', 'name', 'address', 'credit_card']
['02cc9e5b-1e91-4cdb-87c4-726b4ea7219a', 'boston', 'Natalie Cunningham', '97477 Lee Path\nKimberlyport, CA 65960', '4532613656695680']

Times (milliseconds):
[31.939983367919922, 4.055023193359375, 3.988981246948242, 4.395008087158203, 4.045009613037109, 3.838062286376953, 6.09898567199707, 4.03904914855957, 3.9091110229492188, 5.933046340942383, 6.157875061035156, 6.323814392089844, 4.379987716674805, 3.982067108154297, 4.28009033203125, 4.118919372558594, 4.222869873046875, 4.041910171508789, 3.9288997650146484, 4.031896591186523, 4.085063934326172, 3.996133804321289, 4.001140594482422, 6.031990051269531, 5.98597526550293, 4.163026809692383, 5.931854248046875, 5.897998809814453, 3.9229393005371094, 3.8909912109375, 3.7729740142822266, 3.9768218994140625, 3.9958953857421875, 4.265069961547852, 4.204988479614258, 4.142999649047852, 4.3659210205078125, 6.074190139770508, 4.015922546386719, 4.418849945068359, 3.9381980895996094, 4.222869873046875, 4.694938659667969, 3.9060115814208984, 3.857851028442383, 3.8509368896484375, 3.969907760620117, 4.241943359375, 4.032135009765625, 3.9670467376708984]

Average time (milliseconds):
4.99066352844
~~~

To understand why this query performs poorly, use the SQL client built into the `cockroach` binary to [`EXPLAIN`](explain.html) the query plan:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="CREATE INDEX on users (name);"
~~~

The query will now return much faster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="SELECT * FROM users WHERE name = 'Natalie Cunningham'" \
--repeat=50 \
--times
~~~

~~~
Result:
['id', 'city', 'name', 'address', 'credit_card']
['02cc9e5b-1e91-4cdb-87c4-726b4ea7219a', 'boston', 'Natalie Cunningham', '97477 Lee Path\nKimberlyport, CA 65960', '4532613656695680']

Times (milliseconds):
[3.4589767456054688, 1.6651153564453125, 1.547098159790039, 1.9190311431884766, 1.7499923706054688, 1.6219615936279297, 1.5749931335449219, 1.7859935760498047, 1.5561580657958984, 1.6391277313232422, 1.5120506286621094, 1.5139579772949219, 1.6808509826660156, 1.708984375, 1.4798641204833984, 1.544952392578125, 1.653909683227539, 1.6129016876220703, 1.7309188842773438, 1.5811920166015625, 1.7628669738769531, 1.5459060668945312, 1.6429424285888672, 1.6558170318603516, 1.7898082733154297, 1.6138553619384766, 1.6868114471435547, 1.5490055084228516, 1.7120838165283203, 1.6911029815673828, 1.5289783477783203, 1.5990734100341797, 1.6109943389892578, 1.5058517456054688, 1.5058517456054688, 1.6798973083496094, 1.7499923706054688, 1.5850067138671875, 1.4929771423339844, 1.6651153564453125, 1.5921592712402344, 1.6739368438720703, 1.6529560089111328, 1.6019344329833984, 1.6429424285888672, 1.5649795532226562, 1.605987548828125, 1.550912857055664, 1.6069412231445312, 1.6779899597167969]

Average time (milliseconds):
1.66565418243
~~~

To understand why performance improved from 4.99ms (without index) to 1.66ms (with index), use [`EXPLAIN`](explain.html) to see the new query plan:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="SELECT name, credit_card FROM users WHERE name = 'Natalie Cunningham'" \
--repeat=50 \
--times
~~~

~~~
Result:
['name', 'credit_card']
['Natalie Cunningham', '4532613656695680']

Times (milliseconds):
[2.338886260986328, 1.7859935760498047, 1.9490718841552734, 1.550912857055664, 1.4331340789794922, 1.4619827270507812, 1.425027847290039, 1.8270015716552734, 1.6829967498779297, 1.6028881072998047, 1.628875732421875, 1.4889240264892578, 1.497030258178711, 1.5380382537841797, 1.486063003540039, 1.5859603881835938, 1.7290115356445312, 1.7409324645996094, 1.5869140625, 1.6489028930664062, 1.7418861389160156, 1.5971660614013672, 1.619100570678711, 1.6379356384277344, 1.6028881072998047, 1.6531944274902344, 1.667022705078125, 1.6241073608398438, 1.5468597412109375, 1.5778541564941406, 1.6779899597167969, 1.5718936920166016, 1.5950202941894531, 1.6407966613769531, 1.538991928100586, 1.8379688262939453, 1.7008781433105469, 1.837015151977539, 1.5687942504882812, 1.7828941345214844, 1.7290115356445312, 1.6810894012451172, 1.7969608306884766, 1.5821456909179688, 1.569986343383789, 1.5740394592285156, 1.8229484558105469, 1.7371177673339844, 1.7681121826171875, 1.6360282897949219]

Average time (milliseconds):
1.65812492371
~~~

With the current secondary index on `name`, CockroachDB still needs to scan the primary index to get the credit card number:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="DROP INDEX users_name_idx;"
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="CREATE INDEX ON users (name) STORING (credit_card);"
~~~

Now that `credit_card` values are stored in the index on `name`, CockroachDB only needs to scan that index:

{% include_cached copy-clipboard.html %}
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

This results in even faster performance, reducing latency from 1.65ms (index without storing) to 1.04ms (index with storing):

{% include_cached copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="SELECT name, credit_card FROM users WHERE name = 'Natalie Cunningham'" \
--repeat=50 \
--times
~~~

~~~
Result:
['name', 'credit_card']
['Natalie Cunningham', '4532613656695680']

Times (milliseconds):
[1.8949508666992188, 1.2660026550292969, 1.2140274047851562, 1.110076904296875, 1.4989376068115234, 1.1739730834960938, 1.2331008911132812, 0.9701251983642578, 0.9019374847412109, 0.9038448333740234, 1.016855239868164, 0.9331703186035156, 0.9179115295410156, 0.9288787841796875, 0.888824462890625, 0.9429454803466797, 0.9410381317138672, 1.001119613647461, 0.9438991546630859, 0.9849071502685547, 1.0221004486083984, 1.013040542602539, 1.0149478912353516, 0.9579658508300781, 1.0061264038085938, 1.0559558868408203, 1.0788440704345703, 1.0411739349365234, 0.9610652923583984, 0.9639263153076172, 1.1239051818847656, 0.9639263153076172, 1.058816909790039, 0.949859619140625, 0.9739398956298828, 1.046895980834961, 0.9260177612304688, 1.0569095611572266, 1.033782958984375, 1.1029243469238281, 0.9710788726806641, 1.0311603546142578, 0.9870529174804688, 1.1179447174072266, 1.0349750518798828, 1.088857650756836, 1.1060237884521484, 1.0170936584472656, 1.0180473327636719, 1.0519027709960938]

Average time (milliseconds):
1.04885578156
~~~

#### Joining data from different tables

Secondary indexes are crucial when [joining](joins.html) data from different tables as well.

For example, let's say you want to count the number of users who started rides on a given day. To do this, you need to use a join to get the relevant rides from the `rides` table and then map the `rider_id` for each of those rides to the corresponding `id` in the `users` table, counting each mapping only once:

{% include_cached copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="SELECT count(DISTINCT users.id) \
FROM users \
INNER JOIN rides ON rides.rider_id = users.id \
WHERE start_time BETWEEN '2018-07-20 00:00:00' AND '2018-07-21 00:00:00'" \
--repeat=50 \
--times
~~~

~~~
Result:
['count']
['1998']

Times (milliseconds):
[1663.2239818572998, 841.871976852417, 844.9788093566895, 1043.7190532684326, 1047.544002532959, 1049.0870475769043, 1079.737901687622, 1049.543857574463, 1069.1118240356445, 1104.2020320892334, 1071.1669921875, 1080.1141262054443, 1066.741943359375, 1071.8858242034912, 1073.8670825958252, 1054.008960723877, 1089.4761085510254, 1048.2399463653564, 1033.8318347930908, 1078.5980224609375, 1054.8391342163086, 1095.6230163574219, 1056.9767951965332, 1082.8359127044678, 1048.3272075653076, 1050.3859519958496, 1084.2180252075195, 1082.1950435638428, 1101.97114944458, 1079.9469947814941, 1065.234899520874, 1051.058053970337, 1105.48996925354, 1119.469165802002, 1089.8759365081787, 1082.5989246368408, 1074.9430656433105, 1067.4428939819336, 1066.5888786315918, 1069.6449279785156, 1067.9738521575928, 1082.4880599975586, 1037.9269123077393, 1042.2871112823486, 1130.7330131530762, 1150.7518291473389, 1165.3728485107422, 1136.9531154632568, 1120.3861236572266, 1126.8589496612549]

Average time (milliseconds):
1081.04698181
~~~

To understand what's happening, use [`EXPLAIN`](explain.html) to see the query plan:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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
| NULL                                                                   | /"boston"/"\xfe\xdd?\xbb4\xabOV\x84\x00M\x89#-a6"/PrefixEnd            |       23 | {1,2,3}  |            1 |
| /"boston"/"\xfe\xdd?\xbb4\xabOV\x84\x00M\x89#-a6"/PrefixEnd            | /"los angeles"/"\xf1\xe8\x99eǵI\x16\xb9w\a\xd01\xcc\b\xa4"/PrefixEnd   |       25 | {1,2,3}  |            2 |
| /"los angeles"/"\xf1\xe8\x99eǵI\x16\xb9w\a\xd01\xcc\b\xa4"/PrefixEnd   | /"new york"/"\xebV\xf5\xe6P%L$\x92\xd2\xdf&\a\x81\xeeO"/PrefixEnd      |       26 | {1,2,3}  |            1 |
| /"new york"/"\xebV\xf5\xe6P%L$\x92\xd2\xdf&\a\x81\xeeO"/PrefixEnd      | /"san francisco"/"\xda\xc5B\xe0\x0e\fK)\x98:\xe6[@\x05\x91*"/PrefixEnd |       27 | {1,2,3}  |            2 |
| /"san francisco"/"\xda\xc5B\xe0\x0e\fK)\x98:\xe6[@\x05\x91*"/PrefixEnd | /"seattle"/"\xd4ˆ?\x98\x98FA\xa7m\x84\xba\xac\xf5\xbfI"/PrefixEnd      |       28 | {1,2,3}  |            3 |
| /"seattle"/"\xd4ˆ?\x98\x98FA\xa7m\x84\xba\xac\xf5\xbfI"/PrefixEnd      | /"washington dc"/"Ņ\x06\x9d\xc2LEq\xb8<KG\a(\x18\xf6"/PrefixEnd        |       29 | {1,2,3}  |            1 |
| /"washington dc"/"Ņ\x06\x9d\xc2LEq\xb8<KG\a(\x18\xf6"/PrefixEnd        | NULL                                                                   |       30 | {1,2,3}  |            1 |
+------------------------------------------------------------------------+------------------------------------------------------------------------+----------+----------+--------------+
(7 rows)
~~~

{% include_cached copy-clipboard.html %}
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
| NULL      | NULL    |       51 | {1,2,3}  |            2 |
+-----------+---------+----------+----------+--------------+
(1 row)
~~~

The results above tell us:

- The `rides` table is split across 7 ranges, with four leaseholders on node 1, two leaseholders on node 2, and one leaseholder on node 3.
- The `users` table is just a single range with its leaseholder on node 2.

Now, given the `WHERE` condition of the join, the full table scan of `rides`, across all of its 7 ranges, is particularly wasteful. To speed up the query, you can create a secondary index on the `WHERE` condition (`rides.start_time`) storing the join key (`rides.rider_id`):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="CREATE INDEX ON rides (start_time) STORING (rider_id);"
~~~

{{site.data.alerts.callout_info}}
The `rides` table contains 1 million rows, so adding this index will take a few minutes.
{{site.data.alerts.end}}

Adding the secondary index reduced the query time from 1081.04ms to 71.89ms:

{% include_cached copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="SELECT count(DISTINCT users.id) \
FROM users \
INNER JOIN rides ON rides.rider_id = users.id \
WHERE start_time BETWEEN '2018-07-20 00:00:00' AND '2018-07-21 00:00:00'" \
--repeat=50 \
--times
~~~

~~~
Result:
['count']
['1998']

Times (milliseconds):
[124.19795989990234, 83.74285697937012, 84.76495742797852, 76.9808292388916, 65.74702262878418, 62.478065490722656, 60.26411056518555, 59.99302864074707, 67.10195541381836, 73.45199584960938, 67.09504127502441, 60.45889854431152, 68.6960220336914, 61.94710731506348, 61.53106689453125, 60.44197082519531, 62.22796440124512, 89.34903144836426, 77.64196395874023, 71.43712043762207, 66.09010696411133, 63.668012619018555, 65.31286239624023, 77.1780014038086, 73.52113723754883, 68.84908676147461, 65.11712074279785, 65.34600257873535, 65.8869743347168, 76.90095901489258, 76.9491195678711, 69.39697265625, 64.23306465148926, 75.0880241394043, 69.34094429016113, 57.55496025085449, 65.79995155334473, 83.74285697937012, 75.32310485839844, 74.08809661865234, 77.33798027038574, 73.95505905151367, 71.85482978820801, 77.95405387878418, 74.30601119995117, 72.24106788635254, 75.28901100158691, 78.2630443572998, 74.97286796569824, 79.50282096862793]

Average time (milliseconds):
71.8922615051
~~~

To understand why performance improved, again use [`EXPLAIN`](explain.html) to see the new query plan:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="SHOW EXPERIMENTAL_RANGES FROM INDEX rides@rides_start_time_idx;"
~~~

~~~
+-----------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------------+----------+----------+--------------+
|                                        Start Key                                        |                                         End Key                                         | Range ID | Replicas | Lease Holder |
+-----------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------------+----------+----------+--------------+
| NULL                                                                                    | /2018-07-15T02:32:47.564891Z/"seattle"/"r\x8f\xbc\xd4\f\x18E\x9f\x85\xc2\"H\\\xe7k\xf1" |       34 | {1,2,3}  |            1 |
| /2018-07-15T02:32:47.564891Z/"seattle"/"r\x8f\xbc\xd4\f\x18E\x9f\x85\xc2\"H\\\xe7k\xf1" | NULL                                                                                    |       35 | {1,2,3}  |            1 |
+-----------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------------+----------+----------+--------------+
(2 rows)
~~~

This tells us that the index is stored in 2 ranges, with the leaseholders for both of them on node 1. Based on the output of `SHOW EXPERIMENTAL_RANGES FROM TABLE users` that we saw earlier, we already know that the leaseholder for the `users` table is on node 2.

#### Using `IN (list)` with a subquery

Now let's say you want to get the latest ride of each of the 5 most used vehicles. To do this, you might think to use a subquery to get the IDs of the 5 most frequent vehicles from the `rides` table, passing the results into the `IN` list of another query to get the most recent ride of each of the 5 vehicles:

{% include_cached copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
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
['c6541da5-9858-4e3f-9b49-992e206d2c50', '2018-08-02 02:14:50.543760']
['78fdd6f8-c6a1-42df-a89f-cd65b7bb8be9', '2018-08-02 02:47:43.755989']
['3c950d36-c2b8-48d0-87d3-e0d6f570af62', '2018-08-02 03:06:31.293184']
['35752c4c-b878-4436-8330-8d7246406a55', '2018-08-02 03:08:49.823209']
['0962cdca-9d85-457c-9616-cc2ae2d32008', '2018-08-02 03:01:25.414512']

Times (milliseconds):
[4368.9610958099365, 4373.898029327393, 4396.070957183838, 4382.591962814331, 4274.624824523926, 4369.847059249878, 4373.079061508179, 4287.877082824707, 4307.362079620361, 4368.865966796875, 4363.792896270752, 4310.600996017456, 4378.695011138916, 4340.383052825928, 4338.238000869751, 4373.046875, 4327.131986618042, 4386.303901672363, 4429.6300411224365, 4383.068084716797]

Average time (milliseconds):
4356.7034483
~~~

However, as you can see, this query is slow because, currently, when the `WHERE` condition of a query comes from the result of a subquery, CockroachDB scans the entire table, even if there is an available index. Use `EXPLAIN` to see this in more detail:

{% include_cached copy-clipboard.html %}
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

Because CockroachDB will not use an available secondary index when using `IN (list)` with a subquery, it's much more performant to have your application first select the top 5 vehicles:

{% include_cached copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
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

Times (milliseconds):
[787.0969772338867, 782.2480201721191, 741.5878772735596, 790.3921604156494, 767.4920558929443, 733.0870628356934, 768.8038349151611, 754.1589736938477, 716.4630889892578, 726.3698577880859, 721.092939376831, 737.1737957000732, 747.978925704956, 736.1149787902832, 727.1649837493896, 725.5918979644775, 746.1550235748291, 752.6230812072754, 728.59787940979, 733.4978580474854]

Average time (milliseconds):
746.184563637
~~~

And then put the results into the `IN` list to get the most recent rides of the vehicles:

{% include_cached copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
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

Times (milliseconds):
[828.5520076751709, 826.6720771789551, 837.0990753173828, 865.441083908081, 870.556116104126, 842.6721096038818, 859.3161106109619, 861.4299297332764, 866.6350841522217, 833.0469131469727, 838.021993637085, 841.0389423370361, 878.7519931793213, 879.6770572662354, 861.1328601837158, 855.1840782165527, 856.5502166748047, 882.9760551452637, 873.0340003967285, 858.4709167480469]

Average time (milliseconds):
855.812931061
~~~

This approach reduced the query time from 4356.70ms (query with subquery) to 1601.99ms (2 distinct queries).

### Step 7. Test/tune write performance

- [Bulk inserting into an existing table](#bulk-inserting-into-an-existing-table)
- [Minimizing unused indexes](#minimizing-unused-indexes)
- [Retrieving the ID of a newly inserted row](#retrieving-the-id-of-a-newly-inserted-row)

#### Bulk inserting into an existing table

Moving on to writes, let's imagine that you have a batch of 100 new users to insert into the `users` table. The most obvious approach is to insert each row using 100 separate [`INSERT`](insert.html) statements:  

{{site.data.alerts.callout_info}}
For the purpose of demonstration, the command below inserts the same user 100 times, each time with a different unique ID. Note also that you're now adding the `--cumulative` flag to print the total time across all 100 inserts.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="INSERT INTO users VALUES (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347')" \
--repeat=100 \
--times \
--cumulative
~~~

~~~
Times (milliseconds):
[33.28299522399902, 13.558149337768555, 14.67585563659668, 8.835077285766602, 9.104013442993164, 8.157968521118164, 10.174989700317383, 8.877992630004883, 9.196996688842773, 8.93402099609375, 9.894132614135742, 9.97304916381836, 8.221149444580078, 9.334087371826172, 9.270191192626953, 8.980035781860352, 7.210969924926758, 8.212089538574219, 8.048057556152344, 7.8639984130859375, 7.489204406738281, 9.547948837280273, 9.073972702026367, 9.660005569458008, 9.325981140136719, 9.338140487670898, 9.240865707397461, 7.958889007568359, 8.417844772338867, 8.075952529907227, 7.896184921264648, 9.118080139160156, 8.161067962646484, 9.071111679077148, 8.996963500976562, 7.790803909301758, 7.8220367431640625, 9.695053100585938, 9.470939636230469, 8.415937423706055, 9.287118911743164, 9.29117202758789, 9.618043899536133, 9.107828140258789, 8.491039276123047, 7.998943328857422, 9.282827377319336, 7.735013961791992, 9.161949157714844, 9.70005989074707, 8.910894393920898, 9.124994277954102, 9.028911590576172, 9.568929672241211, 10.931968688964844, 8.813858032226562, 14.040946960449219, 7.773876190185547, 9.801864624023438, 7.989168167114258, 8.188962936401367, 9.398937225341797, 9.705066680908203, 9.213924407958984, 9.569168090820312, 9.19198989868164, 9.664058685302734, 9.52601432800293, 8.01396369934082, 8.30698013305664, 8.03995132446289, 8.166074752807617, 9.335994720458984, 7.915019989013672, 9.584903717041016, 8.049964904785156, 7.803916931152344, 8.125066757202148, 9.367942810058594, 9.21487808227539, 9.630918502807617, 9.505033493041992, 9.830951690673828, 8.285045623779297, 8.095979690551758, 9.876012802124023, 8.067131042480469, 9.438037872314453, 8.147001266479492, 8.9111328125, 9.560108184814453, 8.78596305847168, 9.341955184936523, 10.293006896972656, 9.062051773071289, 14.008045196533203, 9.293079376220703, 9.57798957824707, 14.974832534790039, 8.59689712524414]

Average time (milliseconds):
9.41696166992

Cumulative time (milliseconds):
941.696166992
~~~

The 100 inserts took 941.69ms to complete, which isn't bad. However, it's significantly faster to use a single `INSERT` statement with 100 comma-separated `VALUES` clauses:

{% include_cached copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
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
Average time (milliseconds):
18.965959549

Cumulative time (milliseconds):
18.965959549
~~~

As you can see, this multi-row `INSERT` technique reduced the total time for 100 inserts from 941.69ms to 18.96ms. It's useful to note that this technique is equally effective for [`UPSERT`](upsert.html) and [`DELETE`](delete.html) statements as well.

#### Minimizing unused indexes

Earlier, we saw how important secondary indexes are for read performance. For writes, however, it's important to recognized the overhead that they create.

Let's consider the `users` table:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
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

Average time (milliseconds):
2.52413749695
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="UPDATE users \
SET name = 'Carl Kimball' \
WHERE name LIKE 'C%'" \
--repeat=1
~~~

~~~
Average time (milliseconds):
110.701799393
~~~

Because `name` is in both the `primary` and `users_name_idx` indexes, for each of the 168 rows, 2 keys were updated.

Now, assuming that the `users_name_idx` index is no longer needed, lets drop the index and execute an equivalent query:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="DROP INDEX users_name_idx;"
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="UPDATE users \
SET name = 'Peedie Hirata' \
WHERE name = 'Carl Kimball'" \
--repeat=1
~~~

~~~
Average time (milliseconds):
21.7709541321
~~~

Before, when both the primary and secondary indexes needed to be updated, the updates took 110.70ms. Now, after dropping the secondary index, an equivalent update took only 21.77ms.

#### Retrieving the ID of a newly inserted row

Now let's focus on the common case of inserting a row into a table and then retrieving the ID of the new row to do some follow-up work. One approach is to execute two statements, an `INSERT` to insert the row and then a `SELECT` to get the new ID:

{% include_cached copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="INSERT INTO users VALUES (gen_random_uuid(), 'new york', 'Toni Brooks', '800 Camden Lane, Brooklyn, NY 11218', '98244843845134960')" \
--repeat=1
~~~

~~~
Average time (milliseconds):
9.97304916382
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="SELECT id FROM users WHERE name = 'Toni Brooks'" \
--repeat=1
~~~

~~~
Result:
['id']
['cc83e0bd-2ea0-4507-a683-a707cfbe0aba']

Average time (milliseconds):
7.32207298279
~~~

Combined, these statements are relatively fast, at 17.29ms, but an even more performant approach is to append `RETURNING id` to the end of the `INSERT`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="INSERT INTO users VALUES (gen_random_uuid(), 'new york', 'Brian Brooks', '800 Camden Lane, Brooklyn, NY 11218', '98244843845134960') \
RETURNING id" \
--repeat=1
~~~

~~~
Result:
['id']
['3d16500e-cb2e-462e-9c83-db0965d6deaf']

Average time (milliseconds):
9.48596000671
~~~

At just 9.48ms, this approach is faster due to the write and read executing in one instead of two client-server roundtrips. Note also that, as discussed earlier, if the leaseholder for the table happens to be on a different node than the query is running against, that introduces additional network hops and latency.

<!-- - upsert instead of insert/update
- update using case expressions (instead of 2 separate updates)
- returning nothing
- insert with returning (auto gen ID) instead of select to get auto gen ID
- Maybe interleaved tables -->

## Multi-region deployment

<!-- roachprod instructions for multi-region deployment
You created all instanced up front, so no need to add more now.
1. Start the nodes in us-west1-a: roachprod start -b "/usr/local/bin/cockroach" <yourname>-tuning:5-7
2. Start the nodes in us-west2-a: roachprod start -b "/usr/local/bin/cockroach" <yourname>-tuning:9-11
3. Install the Python client on instance 8:
   - SSH to instance 8: roachprod run <yourname>-tuning:8
   - Run commands in Step 5 above.
4. Install the Python client on instance 12:
   - SSH onto instance 12: roachprod run <yourname>-tuning:12
   - Run commands in Step 5 above.
5. Check rebalancing:
   - SSH to instance 4, 8, or 12.
   - Run `SHOW EXPERIMENTAL_RANGES` from Step 11 below.
6. Test performance:
   - Run the SQL commands in Step 12 below. You'll need to SSH to instance 8 or 12 as suggested.
7. Partition the data:
   - SSH to any node and run the SQL in Step 13 below.
8. Check rebalancing after partitioning:
   - SSH to instance 4, 8, or 12.
   - Run `SHOW EXPERIMENTAL_RANGES` from Step 14 below.
8. Test performance after partitioning:
   - Run the SQL commands in Step 15 below. You'll need to SSH to instance 8 or 12 as suggested.
-->

Given that Movr is active on both US coasts, you'll now scale the cluster into two new regions, `us-west1-a` and `us-west2-a`, each with 3 nodes and an extra instance for simulating regional client traffic.

### Step 8. Create more instances

1. [Create 6 more instances](https://cloud.google.com/compute/docs/instances/create-start-instance), 3 in the `us-west1-a` zone (Oregon), and 3 in the `us-west2-a` zone (Los Angeles). While creating each instance:
    - Use the `n1-standard-4` machine type (4 vCPUs, 15 GB memory).
    - Use the Ubuntu 16.04 OS image.
    - [Create and mount a local SSD](https://cloud.google.com/compute/docs/disks/local-ssd#create_local_ssd).
    - To apply the Web UI firewall rule you created earlier, click **Management, disk, networking, SSH keys**, select the **Networking** tab, and then enter `cockroachdb` in the **Network tags** field.

2. Note the internal IP address of each `n1-standard-4` instance. You'll need these addresses when starting the CockroachDB nodes.

3. Create an additional instance in the `us-west1-a` and `us-west2-a` zones. These can be smaller, such as `n1-standard-1`.

### Step 9. Scale the cluster

1. SSH to one of the `n1-standard-4` instances in the `us-west1-a` zone.

2. Download the [CockroachDB archive](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz) for Linux, extract the binary, and copy it into the `PATH`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar -xz
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

3. Run the [`cockroach start`](start-a-node.html) command:

    {% include_cached copy-clipboard.html %}
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

4. Repeat steps 1 - 3 for the other two `n1-standard-4` instances in the `us-west1-a` zone.

5. SSH to one of the `n1-standard-4` instances in the `us-west2-a` zone.

6. Download the [CockroachDB archive](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz) for Linux, extract the binary, and copy it into the `PATH`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar -xz
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

7. Run the [`cockroach start`](start-a-node.html) command:

    {% include_cached copy-clipboard.html %}
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

8. Repeat steps 5 - 7 for the other two `n1-standard-4` instances in the `us-west2-a` zone.

### Step 10. Install the Python client

In each of the new zones, SSH to the instance not running a CockroachDB node, and install the Python client as described in [step 5](#step-5-install-the-python-client) above.

### Step 11. Check rebalancing

Since you started each node with the `--locality` flag set to its GCE zone, over the next minutes, CockroachDB will rebalance data evenly across the zones.

To check this, access the Web UI on any node at `<node address>:8080` and look at the **Node List**. You'll see that the range count is more or less even across all nodes:

<img src="{{ 'images/v2.0/perf_tuning_multi_region_rebalancing.png' | relative_url }}" alt="Perf tuning rebalancing" style="border:1px solid #eee;max-width:100%" />

For reference, here's how the nodes map to zones:

Node IDs | Zone
---------|-----
1-3 | `us-east1-b` (South Carolina)
4-6 | `us-west1-a` (Oregon)
7-9 | `us-west2-a` (Los Angeles)

To verify even balancing at range level, SSH to one of the instances not running CockroachDB and run the `SHOW EXPERIMENTAL_RANGES` statement:

{% include_cached copy-clipboard.html %}
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
| NULL      | NULL    |       22 | {1,6,9}  |            6 |
+-----------+---------+----------+----------+--------------+
(1 row)
~~~

In this case, we can see that, for the single range containing `vehicles` data, one replica is in each zone, and the leaseholder is in the `us-west1-a` zone.

### Step 12. Test performance

In general, all of the tuning techniques featured in the single-region scenario above still apply in a multi-region deployment. However, the fact that data and leaseholders are spread across the US means greater latencies in many cases.

#### Reads

For example, imagine we are a Movr administrator in New York, and we want to get the IDs and descriptions of all New York-based bikes that are currently in use:

1. SSH to the instance in `us-east1-b` with the Python client.

2. Query for the data:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ./tuning.py \
    --host=<address of a node in us-east1-b> \
    --statement="SELECT id, ext FROM vehicles \
    WHERE city = 'new york' \
        AND type = 'bike' \
        AND status = 'in_use'" \
    --repeat=50 \
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

    Times (milliseconds):
    [1123.0790615081787, 190.16599655151367, 127.28595733642578, 72.94511795043945, 72.0360279083252, 70.50704956054688, 70.83487510681152, 73.11201095581055, 72.81899452209473, 71.35510444641113, 71.6249942779541, 70.8611011505127, 72.17597961425781, 71.78997993469238, 70.75691223144531, 76.08985900878906, 72.6480484008789, 71.91896438598633, 70.59216499328613, 71.07686996459961, 71.86722755432129, 71.01583480834961, 71.29812240600586, 71.74086570739746, 72.67093658447266, 71.03395462036133, 71.78306579589844, 71.5029239654541, 70.33801078796387, 72.91483879089355, 71.23708724975586, 72.81684875488281, 71.70701026916504, 71.32506370544434, 71.68197631835938, 70.78695297241211, 72.80707359313965, 73.0600357055664, 71.69818878173828, 71.40707969665527, 70.53804397583008, 71.83694839477539, 70.08099555969238, 71.96617126464844, 71.03586196899414, 72.6020336151123, 71.23398780822754, 71.03800773620605, 72.12519645690918, 71.77996635437012]

    Average time (milliseconds):
    96.2521076202
    ~~~

As we saw earlier, the leaseholder for the `vehicles` table is in `us-west1-a` (Oregon), so our query had to go from the gateway node in `us-east1-b` all the way to the west coast and then back again before returning data to the client.

For contrast, imagine we are now a Movr administrator in Seattle, and we want to get the IDs and descriptions of all Seattle-based bikes that are currently in use:

1. SSH to the instance in `us-west1-a` with the Python client.

2. Query for the data:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ./tuning.py \
    --host=<address of a node in us-west1-a> \
    --statement="SELECT id, ext FROM vehicles \
    WHERE city = 'seattle' \
        AND type = 'bike' \
        AND status = 'in_use'" \
    --repeat=50 \
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

    Times (milliseconds):
    [83.34112167358398, 35.54201126098633, 36.23318672180176, 35.546064376831055, 39.82996940612793, 35.067081451416016, 35.12001037597656, 34.34896469116211, 35.05301475524902, 35.52699089050293, 34.442901611328125, 33.95986557006836, 35.25996208190918, 35.26592254638672, 35.75301170349121, 35.50601005554199, 35.93301773071289, 32.97090530395508, 35.09712219238281, 35.33005714416504, 34.66916084289551, 34.97791290283203, 34.68203544616699, 34.09695625305176, 35.676002502441406, 33.01596641540527, 35.39609909057617, 33.804893493652344, 33.6918830871582, 34.37995910644531, 33.71405601501465, 35.18819808959961, 34.35802459716797, 34.191131591796875, 33.44106674194336, 34.84678268432617, 35.51292419433594, 33.80894660949707, 33.6911678314209, 36.14497184753418, 34.671783447265625, 35.28904914855957, 33.84900093078613, 36.21387481689453, 36.26894950866699, 34.7599983215332, 34.73687171936035, 34.715890884399414, 35.101890563964844, 35.4609489440918]

    Average time (milliseconds):
    35.9096717834
    ~~~

Because the leaseholder for `vehicles` is in the same zone as the client request, this query took just 35.90ms compared to the similar query in New York that took 96.25ms.  

#### Writes

The geographic distribution of data impacts write performance as well. For example, imagine 100 people in New York and 100 people in Los Angeles want to create new Movr accounts:

1. SSH to the instance in `us-east1-b` with the Python client.

2. Create 100 NY-based users:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ./tuning.py \
    --host=<address of a node in us-east1-b> \
    --statement="INSERT INTO users VALUES (gen_random_uuid(), 'new york', 'New Yorker', '111 East Street', '1736352379937347')" \
    --repeat=100 \
    --times
    ~~~

    ~~~
    Times (milliseconds):
    [710.5610370635986, 75.03294944763184, 76.18403434753418, 76.6599178314209, 75.54292678833008, 77.10099220275879, 76.49803161621094, 76.12395286560059, 75.13093948364258, 76.4460563659668, 74.74899291992188, 76.11799240112305, 74.95307922363281, 75.22797584533691, 75.01792907714844, 76.11393928527832, 75.35195350646973, 76.23100280761719, 75.17099380493164, 76.05600357055664, 76.4470100402832, 76.4310359954834, 75.02388954162598, 76.38192176818848, 78.89008522033691, 76.27677917480469, 75.12402534484863, 74.9521255493164, 75.08397102355957, 76.21502876281738, 75.15192031860352, 77.74996757507324, 73.84800910949707, 85.68978309631348, 75.08993148803711, 77.28886604309082, 76.8439769744873, 76.6448974609375, 75.1500129699707, 76.38287544250488, 75.12092590332031, 76.92408561706543, 76.86591148376465, 76.45702362060547, 76.61795616149902, 75.77109336853027, 81.47501945495605, 83.72306823730469, 76.41983032226562, 75.19102096557617, 74.01609420776367, 77.21996307373047, 76.61914825439453, 75.56986808776855, 76.94005966186523, 75.74892044067383, 76.63488388061523, 76.73311233520508, 75.73890686035156, 75.3028392791748, 76.58910751342773, 76.70807838439941, 76.36213302612305, 75.05607604980469, 76.99084281921387, 79.19192314147949, 75.69003105163574, 76.53594017028809, 75.3641128540039, 76.4620304107666, 75.81305503845215, 76.84993743896484, 75.74915885925293, 77.1799087524414, 76.67183876037598, 75.85597038269043, 77.18396186828613, 78.25303077697754, 76.66516304016113, 75.4399299621582, 76.98297500610352, 75.69122314453125, 77.4688720703125, 81.50601387023926, 76.74908638000488, 76.9951343536377, 75.34193992614746, 76.82991027832031, 76.4460563659668, 75.76298713684082, 76.63083076477051, 75.43802261352539, 76.47705078125, 78.95708084106445, 75.60205459594727, 75.70815086364746, 76.48301124572754, 76.65586471557617, 75.71196556091309, 74.09906387329102]

    Average time (milliseconds):
    82.7817606926
    ~~~

3. SSH to the instance in `us-west2-a` with the Python client.

4. Create 100 new Los Angeles-based users:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ./tuning.py \
    --host=<address of a node in us-west2-a> \
    --statement="INSERT INTO users VALUES (gen_random_uuid(), 'los angeles', 'Los Angel', '111 West Street', '9822222379937347')" \
    --repeat=100 \
    --times
    ~~~

    ~~~
    Times (milliseconds):
    [213.47904205322266, 140.0778293609619, 138.11588287353516, 138.22197914123535, 143.43595504760742, 139.0368938446045, 138.3199691772461, 138.7031078338623, 139.38307762145996, 139.53304290771484, 138.78607749938965, 140.59996604919434, 138.1399631500244, 138.94009590148926, 138.17405700683594, 137.9709243774414, 138.02003860473633, 137.82405853271484, 140.13099670410156, 139.08815383911133, 138.0600929260254, 139.01615142822266, 138.05103302001953, 137.76111602783203, 139.38617706298828, 137.42399215698242, 137.89701461791992, 138.40818405151367, 138.6868953704834, 139.13893699645996, 139.24717903137207, 138.7009620666504, 137.4349594116211, 137.24017143249512, 138.99493217468262, 138.77201080322266, 138.624906539917, 139.19997215270996, 139.4331455230713, 143.18394660949707, 138.0319595336914, 137.6488208770752, 137.27498054504395, 136.3968849182129, 139.0249729156494, 137.9079818725586, 139.37997817993164, 139.32204246520996, 140.045166015625, 137.9718780517578, 139.36805725097656, 139.6927833557129, 139.63794708251953, 138.016939163208, 145.32899856567383, 138.261079788208, 139.56904411315918, 139.6658420562744, 138.02599906921387, 139.7988796234131, 138.24796676635742, 139.9519443511963, 136.5041732788086, 139.43004608154297, 138.16499710083008, 138.2119655609131, 139.69111442565918, 140.30194282531738, 138.14496994018555, 140.00296592712402, 139.44697380065918, 139.35494422912598, 137.9709243774414, 140.78497886657715, 136.4901065826416, 138.44680786132812, 138.69094848632812, 139.2819881439209, 140.45214653015137, 138.3049488067627, 139.4188404083252, 139.9250030517578, 140.40303230285645, 138.7009620666504, 136.9321346282959, 139.20903205871582, 138.14496994018555, 140.14315605163574, 139.30511474609375, 139.58096504211426, 141.16501808166504, 138.66591453552246, 138.3810043334961, 137.39800453186035, 139.9540901184082, 138.4589672088623, 138.72814178466797, 138.3681297302246, 139.1599178314209, 139.29295539855957]

    Average time (milliseconds):
    139.702253342
    ~~~

On average, it took 82.78ms to create a user in New York and 139.70ms to create a user in Los Angeles. To better understand this discrepancy, let's look at the distribution of data for the `users` table:

{% include_cached copy-clipboard.html %}
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
| NULL      | NULL    |       51 | {2,6,7}  |            2 |
+-----------+---------+----------+----------+--------------+
(1 row)
~~~

For the single range containing `users` data, one replica is in each zone, with the leaseholder in the `us-east1-b` zone. This means that:

- When creating a user in New York, the request doesn't have to leave the zone to reach the leaseholder. However, since a write requires consensus from its replica group, the write has to wait for confirmation from either the replica in `us-west1-a` (Oregon) or `us-west2-a` (Los Angeles) before committing and then returning confirmation to the client.
- When creating a user in Los Angeles, there are more network hops and, thus, increased latency. The request first needs to travel across the continent to the leaseholder in `us-east1-b`. It then has to wait for confirmation from either the replica in `us-west1-a` (Oregon) or `us-west2-a` (Los Angeles) before committing and then returning confirmation to the client back in the west.

### Step 13. Partition data by city

For this service, the most effective technique for improving read and write latency is to [geo-partition](partitioning.html) the data by city. In essence, this means changing the way data is mapped to ranges. Instead of an entire table and its indexes mapping to a specific range or set of ranges, all rows in the table and its indexes with a given city will map to a range or set of ranges. Once ranges are defined in this way, we can then use the [replication zone](configure-replication-zones.html) feature to pin partitions to specific locations, ensuring that read and write requests from users in a specific city do not have to leave that region.

1. Partitioning is an enterprise feature, so start off by [registering for a 30-day trial license](https://www.cockroachlabs.com/pricing/start-trial/).

2. Once you've received the trial license, SSH to any node in your cluster and [apply the license](enterprise-licensing.html#set-the-trial-or-enterprise-license-key):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=<address of any node> \
    --execute="SET CLUSTER SETTING cluster.organization = '<your org name>';"
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=<address of any node> \
    --execute="SET CLUSTER SETTING enterprise.license = '<your license>';"
    ~~~

3. Define partitions for all tables and their secondary indexes.

    Start with the `users` table:

    {% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
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

7. Now [create replication zones](configure-replication-zones.html#create-a-replication-zone-for-a-table-or-secondary-index-partition-new-in-v2-0) to require city data to be stored on specific nodes based on node locality.

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

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.users.new_york \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.users.boston \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.users.washington_dc \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west1-a]' | \
    cockroach zone set movr.users.seattle \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.users.san_francisco \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.users.los_angeles \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    Move on to the `vehicles` table and secondary index partitions:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.vehicles.new_york \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.vehicles.new_york_idx \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.vehicles.boston \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.vehicles.boston_idx \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.vehicles.washington_dc \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.vehicles.washington_dc_idx \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west1-a]' | \
    cockroach zone set movr.vehicles.seattle \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west1-a]' | \
    cockroach zone set movr.vehicles.seattle_idx \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.vehicles.san_francisco \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.vehicles.san_francisco_idx \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.vehicles.los_angeles \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.vehicles.los_angeles_idx \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    Finish with the `rides` table and secondary index partitions:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.rides.new_york \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.rides.new_york_idx1 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.rides.new_york_idx2 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.rides.boston \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.rides.boston_idx1 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.rides.boston_idx2 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.rides.washington_dc \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.rides.washington_dc_idx1 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-east1-b]' | \
    cockroach zone set movr.rides.washington_dc_idx2 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west1-a]' | \
    cockroach zone set movr.rides.seattle \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west1-a]' | \
    cockroach zone set movr.rides.seattle_idx1 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west1-a]' | \
    cockroach zone set movr.rides.seattle_idx2 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.rides.san_francisco \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.rides.san_francisco_idx1 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.rides.san_francisco_idx2 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.rides.los_angeles \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+zone=us-west2-a]' | \
    cockroach zone set movr.rides.los_angeles_idx1 \
    --insecure \
    --host=<address of any node> \
    -f -
    ~~~

    {% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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
| /"boston"        | /"boston"/PrefixEnd        |       95 | {1,2,3}  |            2 |
| /"los angeles"   | /"los angeles"/PrefixEnd   |      111 | {7,8,9}  |            9 |
| /"new york"      | /"new york"/PrefixEnd      |       91 | {1,2,3}  |            1 |
| /"san francisco" | /"san francisco"/PrefixEnd |      107 | {7,8,9}  |            7 |
| /"seattle"       | /"seattle"/PrefixEnd       |      103 | {4,5,6}  |            4 |
| /"washington dc" | /"washington dc"/PrefixEnd |       99 | {1,2,3}  |            1 |
+------------------+----------------------------+----------+----------+--------------+
(6 rows)
~~~

For reference, here's how the nodes map to zones:

Node IDs | Zone
---------|-----
1-3 | `us-east1-b` (South Carolina)
4-6 | `us-west1-a` (Oregon)
7-9 | `us-west2-a` (Los Angeles)

We can see that, after partitioning, the replicas for New York, Boston, and Washington DC are located on nodes 1-3 in `us-east1-b`, replicas for Seattle are located on nodes 4-6 in `us-west1-a`, and replicas for San Francisco and Los Angeles are located on nodes 7-9 in `us-west2-a`.

### Step 15. Test performance after partitioning

After partitioning, reads and writers for a specific city will be much faster because all replicas for that city are now located on the nodes closest to the city.

To check this, let's repeat a few of the read and write queries that we executed before partitioning in [step 12](#step-12-test-performance).

#### Reads

Again imagine we are a Movr administrator in New York, and we want to get the IDs and descriptions of all New York-based bikes that are currently in use:

1. SSH to the instance in `us-east1-b` with the Python client.

2. Query for the data:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ./tuning.py \
    --host=<address of a node in us-east1-b> \
    --statement="SELECT id, ext FROM vehicles \
    WHERE city = 'new york' \
        AND type = 'bike' \
        AND status = 'in_use'" \
    --repeat=50 \
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

    Times (milliseconds):
    [17.27890968322754, 9.554147720336914, 7.483959197998047, 7.407903671264648, 7.538795471191406, 7.39288330078125, 7.623910903930664, 7.172822952270508, 7.15184211730957, 7.201910018920898, 7.063865661621094, 7.602930068969727, 7.246971130371094, 6.966829299926758, 7.369041442871094, 7.277965545654297, 7.650852203369141, 7.177829742431641, 7.266998291015625, 7.150173187255859, 7.303953170776367, 7.1048736572265625, 7.218122482299805, 7.168054580688477, 7.258176803588867, 7.375955581665039, 7.013797760009766, 7.2078704833984375, 7.277965545654297, 7.352113723754883, 7.0400238037109375, 7.379055023193359, 7.227897644042969, 7.266044616699219, 6.883859634399414, 7.344961166381836, 7.222175598144531, 7.149934768676758, 7.241010665893555, 6.999969482421875, 7.40504264831543, 7.191896438598633, 7.192134857177734, 7.2231292724609375, 7.10296630859375, 7.291078567504883, 6.976127624511719, 7.338047027587891, 6.918191909790039, 7.070064544677734]

    Average time (milliseconds):
    7.48650074005
    ~~~

Before partitioning, this query took 96.25ms on average. After partitioning, the query took only 7.48ms on average.

#### Writes

Now let's again imagine 100 people in New York and 100 people in Los Angeles want to create new Movr accounts:

1. SSH to the instance in `us-east1-b` with the Python client.

2. Create 100 NY-based users:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ./tuning.py \
    --host=<address of a node in us-east1-b> \
    --statement="INSERT INTO users VALUES (gen_random_uuid(), 'new york', 'New Yorker', '111 East Street', '1736352379937347')" \
    --repeat=100 \
    --times
    ~~~

    ~~~
    Times (milliseconds):
    [9.378910064697266, 7.173061370849609, 9.769916534423828, 8.235931396484375, 9.124040603637695, 9.358882904052734, 8.581161499023438, 7.482051849365234, 8.441925048828125, 8.306026458740234, 8.775949478149414, 8.685827255249023, 6.851911544799805, 9.104013442993164, 9.664058685302734, 7.126092910766602, 8.738994598388672, 8.75997543334961, 9.040117263793945, 8.374929428100586, 8.384943008422852, 10.58506965637207, 8.538961410522461, 7.405996322631836, 9.508132934570312, 8.268117904663086, 11.46697998046875, 9.343147277832031, 8.31294059753418, 7.085084915161133, 8.779048919677734, 7.356166839599609, 8.732080459594727, 9.31406021118164, 8.460044860839844, 8.933067321777344, 8.610963821411133, 7.01904296875, 9.474039077758789, 8.276939392089844, 9.40704345703125, 9.205818176269531, 8.270025253295898, 7.443904876708984, 8.999824523925781, 8.215904235839844, 8.124828338623047, 8.324861526489258, 8.156061172485352, 8.740901947021484, 8.39996337890625, 7.437944412231445, 8.78000259399414, 8.615970611572266, 8.795022964477539, 8.683919906616211, 7.111072540283203, 7.770061492919922, 8.922100067138672, 9.526968002319336, 7.8411102294921875, 8.287191390991211, 10.084152221679688, 8.744001388549805, 8.032083511352539, 7.095098495483398, 8.343935012817383, 8.038997650146484, 8.939027786254883, 8.714914321899414, 6.999969482421875, 7.087945938110352, 9.23299789428711, 8.90803337097168, 7.808923721313477, 8.558034896850586, 7.122993469238281, 8.755922317504883, 8.379936218261719, 8.464813232421875, 8.405923843383789, 7.163047790527344, 9.139060974121094, 8.706092834472656, 7.130146026611328, 12.811899185180664, 9.733915328979492, 7.981061935424805, 9.001016616821289, 8.28409194946289, 7.188081741333008, 9.055137634277344, 9.569883346557617, 7.223844528198242, 8.78596305847168, 6.941080093383789, 8.934974670410156, 8.980989456176758, 7.564067840576172, 9.202003479003906]

    Average time (milliseconds):
    8.51003170013
    ~~~

    Before partitioning, this query took 82.78ms on average. After partitioning, the query took only 8.51ms on average.

3. SSH to the instance in `us-west2-a` with the Python client.

4. Create 100 new Los Angeles-based users:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ./tuning.py \
    --host=<address of a node in us-west2-a> \
    --statement="INSERT INTO users VALUES (gen_random_uuid(), 'los angeles', 'Los Angel', '111 West Street', '9822222379937347')" \
    --repeat=100 \
    --times
    ~~~

    ~~~
    Times (milliseconds):
    [20.322084426879883, 14.09602165222168, 14.353036880493164, 25.568008422851562, 15.157938003540039, 27.19593048095703, 29.092073440551758, 14.515876770019531, 14.114141464233398, 19.414901733398438, 15.073060989379883, 13.965845108032227, 13.913869857788086, 15.218019485473633, 13.844013214111328, 14.110088348388672, 13.943910598754883, 13.73600959777832, 13.262033462524414, 14.648914337158203, 14.066219329833984, 13.91911506652832, 14.122962951660156, 14.724016189575195, 17.747879028320312, 16.537904739379883, 13.921022415161133, 14.027118682861328, 15.810012817382812, 14.811992645263672, 14.551877975463867, 14.912128448486328, 14.078140258789062, 14.576196670532227, 19.381046295166016, 14.536857604980469, 14.664888381958008, 14.539957046508789, 15.054941177368164, 17.20881462097168, 14.64700698852539, 14.211177825927734, 15.089988708496094, 14.193058013916016, 14.544010162353516, 14.680862426757812, 14.32490348815918, 15.841007232666016, 14.069080352783203, 14.59503173828125, 14.837026596069336, 14.315128326416016, 14.558792114257812, 14.645099639892578, 14.82701301574707, 14.699935913085938, 15.035152435302734, 14.724016189575195, 16.10708236694336, 14.612913131713867, 14.641046524047852, 14.706850051879883, 14.29295539855957, 14.779090881347656, 15.485048294067383, 17.444133758544922, 15.172004699707031, 20.865917205810547, 14.388084411621094, 14.241218566894531, 14.343976974487305, 14.602899551391602, 14.64390754699707, 13.908147811889648, 20.69687843322754, 15.130043029785156, 14.754056930541992, 14.123916625976562, 14.760017395019531, 14.25480842590332, 14.446020126342773, 14.229059219360352, 15.10000228881836, 14.275789260864258, 14.42098617553711, 14.935970306396484, 15.175819396972656, 27.69613265991211, 14.856815338134766, 14.902830123901367, 15.029191970825195, 15.143871307373047, 15.524148941040039, 14.510869979858398, 18.740177154541016, 14.97197151184082, 15.30003547668457, 15.158891677856445, 14.423847198486328, 35.25400161743164]

    Average time (milliseconds):
    15.7462859154
    ~~~

    Before partitioning, this query took 139.70ms on average. After partitioning, the query took only 15.74ms on average.

## See also

- [SQL Performance Best Practices](performance-best-practices-overview.html)
- [Performance Benchmarking](performance-benchmarking-with-tpc-c.html)
- [Production Checklist](recommended-production-settings.html)
