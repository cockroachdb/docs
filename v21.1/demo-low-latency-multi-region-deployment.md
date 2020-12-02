---
title: Low Latency Reads and Writes in a Multi-Region Cluster
summary: Use data topologies to get low-latency reads and writes in a multi-region CockroachDB cluster.
toc: true
toc_not_nested: true
redirect_from: demo-geo-partitioning.html
key: demo-geo-partitioning.html
---

In CockroachDB, data is replicated and distributed across the nodes of a cluster for consistency and resiliency, and [read and write requests are automatically routed between nodes](architecture/reads-and-writes-overview.html) as appropriate. In a single-region cluster, this behavior doesn't affect performance because network latency between nodes is sub-millisecond. In a cluster spread across multiple geographic regions, however, the distribution of data becomes a key performance bottleneck, and for that reason, it is important to think about the latency requirements of each table and then use the appropriate [data topologies](topology-patterns.html) to locate data for optimal performance.

This tutorial walks you through the process of deploying a 9-node CockroachDB cluster across 3 US regions, 3 AZs per region, with a fictional vehicle-sharing application called [MovR](movr.html) running concurrently in each region. Initially, you'll see the effect of network latency when requests must move back and forth across the US. Then you'll use two important multi-region data topologies, [Geo-Partitioned Replicas](topology-geo-partitioned-replicas.html) and [Duplicate Indexes](topology-duplicate-indexes.html), to remove this bottleneck and dramatically lower latency, with the majority of reads and writes executing in 2 milliseconds or less. Finally, you'll experience the cluster's resiliency to AZ-level failure.

## See it in action

### Watch a demo

Watch [this webinar recording](https://www.cockroachlabs.com/webinars/implementation-topologies-for-distributed-sql
) to see a demonstration of the concepts and features in this tutorial.

<!-- Older demo video
<iframe width="640" height="385" src="https://www.youtube.com/embed/TgnQwOOk9Js" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> -->

### Read a case study

Read about how an [electronic lock manufacturer](https://www.cockroachlabs.com/case-studies/european-electronic-lock-manufacturer-modernizes-iam-system-with-managed-cockroachdb/) and [multi-national bank](https://www.cockroachlabs.com/case-studies/top-five-multinational-bank-modernizes-its-european-core-banking-services-migrating-from-oracle-to-cockroachdb/) are using the Geo-Partitioned Replicas topology in production for improved performance and regulatory compliance.

## Before you begin

- [Request a trial license](#request-a-trial-license)
- [Review important concepts](#review-important-concepts)
- [Review the cluster setup](#review-the-cluster-setup)
- [Review the MovR application](#review-the-movr-application)

### Request a trial license

Some CockroachDB features used in this tutorial require an enterprise license, so [request a 30-day trial license](https://www.cockroachlabs.com/get-cockroachdb/) before you get started.

You should receive your trial license via email within a few minutes. You'll enable your license once your cluster is up-and-running.

### Review important concepts

To understand performance in a geographically distributed CockroachDB cluster, it's important to first review [how reads and writes work in CockroachDB](architecture/reads-and-writes-overview.html).

### Review the cluster setup

You'll deploy a 9-node CockroachDB cluster across 3 GCE regions, with each node on a VM in a distinct availability zone for optimal resiliency:

<img src="{{ 'images/v21.1/topology-patterns/topology_multi-region_hardware.png' | relative_url }}" alt="Multi-region hardware setup" style="max-width:100%" />

A few notes:

- For each CockroachDB node, you'll use the [`n1-standard-4`](https://cloud.google.com/compute/docs/machine-types#standard_machine_types) machine type (4 vCPUs, 15 GB memory) with the Ubuntu 16.04 OS image and a [local SSD](https://cloud.google.com/compute/docs/disks/local-ssd#create_local_ssd) disk.
- You'll start each node with the [`--locality` flag](cockroach-start.html#locality) describing the node's region and availability zone. Initially, this locality information will lead CockroachDB to evenly distribute data across the 3 regions. Then, it will be used to apply data topologies for lower latency.
- There will be an extra VM in each region for an instance of the MovR application and the open-source HAProxy load balancer. The application in each region will be pointed at the local load balancer, which will direct connections only to the CockroachDB nodes in the same region.

### Review the MovR application

For your application, you'll use our open-source, fictional, peer-to-peer vehicle-sharing app, [MovR](movr.html). You'll run 3 instances of MovR, one in each US region, with each instance representing users in a specific city: New York, Chicago, or Seattle.

#### The schema

{% include {{ page.version.version }}/misc/movr-schema.md %}

All of the tables except `promo_codes` have a multi-column primary key of `city` and `id`, with `city` being the first in the key. As such, the rows in these tables are geographically specific and ordered by geography. These tables are read and updated very frequently, and so to keep read and write latency low, you'll use the [Geo-Partitioned Replicas](topology-geo-partitioned-replicas.html) topology for these tables.

In contrast, the data in the `promo_codes` table is not tied to geography, and the data is read frequently but rarely updated. This type of table is often referred to as a "reference table" or "lookup table". In this case, you'll use the [Duplicate Indexes](topology-duplicate-indexes.html) topology to keep just read latency very low, since that's primary.

#### The workflow

{% include {{ page.version.version }}/misc/movr-workflow.md %}

## Step 1. Set up the environment

- [Configure your network](#configure-your-network)
- [Provision VMs](#provision-vms)

### Configure your network

{% include {{ page.version.version }}/performance/configure-network.md %}

### Provision VMs

You need 9 VMs across 3 GCE regions, 3 per region with each VM in a distinct availability zone. You also need 3 extra VMs, 1 per region, for a region-specific version of MovR and the HAProxy load balancer.

1. [Create 9 VMs](https://cloud.google.com/compute/docs/instances/create-start-instance) for CockroachDB nodes.

    When creating each VM:
    - Use the [`n1-standard-4`](https://cloud.google.com/compute/docs/machine-types#standard_machine_types) machine type (4 vCPUs, 15 GB memory) and the Ubuntu 16.04 OS image.
    - Select one of the following [region and availability zone](https://cloud.google.com/compute/docs/regions-zones/) configurations. Be sure to use each region/availability combination only once.

        VM | Region | Availability Zone
        ---|--------|------------------
        1 | `us-east1` | `us-east1-b`
        2 | `us-east1` | `us-east1-c`
        3 | `us-east1` | `us-east1-d`
        4 | `us-central1` | `us-central1-a`
        5 | `us-central1` | `us-central1-b`
        6 | `us-central1` | `us-central1-c`
        7 | `us-west1` | `us-west1-a`
        8 | `us-west1` | `us-west1-b`
        9 | `us-west1` | `us-west1-c`
    - [Create and mount a local SSD](https://cloud.google.com/compute/docs/disks/local-ssd#create_local_ssd).
    - To apply the DB Console firewall rule you created earlier, click **Management, disk, networking, SSH keys**, select the **Networking** tab, and then enter `cockroachdb` in the **Network tags** field.

2. [Create 3 VMs](https://cloud.google.com/compute/docs/instances/create-start-instance) for the region-specific versions of MovR and HAProxy, one in each of the regions mentioned above, using same machine types and OS image as mentioned above.

3. Note the internal IP address of each VM. You'll need these addresses when starting the CockroachDB nodes, configuring HAProxy, and running the MovR application.

## Step 2. Start CockroachDB

Now that you have VMs in place, start your CockroachDB cluster across the three US regions.

- [Start nodes in US East](#start-nodes-in-us-east)
- [Start nodes in US Central](#start-nodes-in-us-central)
- [Start nodes in US West](#start-nodes-in-us-west)
- [Initialize the cluster](#initialize-the-cluster)

### Start nodes in US East

1. SSH to the first VM in the US East region where you want to run a CockroachDB node.

2. Download the [CockroachDB archive](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz) for Linux, extract the binary, and copy it into the `PATH`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar  xvz
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

3. Run the [`cockroach start`](cockroach-start.html) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --advertise-addr=<node1 internal address> \
    --join=<node1 internal address>:26257,<node2 internal address>:26257,<node3 internal address>:26257 \
    --locality=cloud=gce,region=us-east1,zone=<relevant zone> \
    --cache=.25 \
    --max-sql-memory=.25 \
    --background
    ~~~

4. Repeat steps 1 - 3 for the other two CockroachDB nodes in the region. Each time, be sure to:
    - Adjust the `--advertise-addr` flag.
    - Use the appropriate availability zone of the VM in the `zone` portion of the `--locality` flag.

### Start nodes in US Central

1. SSH to the first VM in the US Central region where you want to run a CockroachDB node.

2. Download the [CockroachDB archive](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz) for Linux, extract the binary, and copy it into the `PATH`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar  xvz
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

3. Run the [`cockroach start`](cockroach-start.html) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --advertise-addr=<node1 internal address> \
    --join=<node1 internal address>:26257,<node2 internal address>:26257,<node3 internal address>:26257 \
    --locality=cloud=gce,region=us-central1,zone=<relevant zone> \
    --cache=.25 \
    --max-sql-memory=.25 \
    --background
    ~~~

4. Repeat steps 1 - 3 for the other two CockroachDB nodes in the region. Each time, be sure to:
    - Adjust the `--advertise-addr` flag.
    - Use the appropriate availability zone of the VM in the `zone` portion of the `--locality` flag.

### Start nodes in US West

1. SSH to the first VM in the US West region where you want to run a CockroachDB node.

2. Download the [CockroachDB archive](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz) for Linux, extract the binary, and copy it into the `PATH`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar  xvz
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

3. Run the [`cockroach start`](cockroach-start.html) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --advertise-addr=<node1 internal address> \
    --join=<node1 internal address>:26257,<node2 internal address>:26257,<node3 internal address>:26257 \
    --locality=cloud=gce,region=us-west1,zone=<relevant zone> \
    --cache=.25 \
    --max-sql-memory=.25 \
    --background
    ~~~

4. Repeat steps 1 - 3 for the other two CockroachDB nodes in the region. Each time, be sure to:
    - Adjust the `--advertise-addr` flag.
    - Use the appropriate availability zone of the VM in the `zone` portion of the `--locality` flag.

### Initialize the cluster

On any of the VMs, run the one-time [`cockroach init`](cockroach-init.html) command to join the first nodes into a cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach init --insecure --host=<address of any node>
~~~

## Step 3. Start MovR

- [Set up the client VMs](#set-up-the-client-vms)
- [Configure the cluster for MovR](#configure-the-cluster-for-movr)
- [Start MovR in US East](#start-movr-in-us-east)
- [Start MovR in US Central](#start-movr-in-us-central)
- [Start MovR in US West](#start-movr-in-us-west)

### Set up the client VMs

Next, install Docker and HAProxy on each client VM. Docker is required so you can later run MovR from a Docker image, and HAProxy will serve as the region-specific load balancer for MovR in each region.

1. SSH to the VM in the US East region where you want to run MovR and HAProxy.

2. Install Docker:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo apt-get update && \
    sudo apt-get install -y apt-transport-https ca-certificates curl gnupg-agent software-properties-common && \
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add - && \
    sudo apt-key fingerprint 0EBFCD88 && \
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" && \
    sudo apt-get update && \
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
    ~~~

    If you get an error, run one command at a time or follow the [official Docker instructions](https://docs.docker.com/install/linux/docker-ce/ubuntu/#install-using-the-repository).

3. Install HAProxy:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo apt-get update
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo apt-get install haproxy
    ~~~

4. Download the [CockroachDB archive](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz) for Linux, extract the binary, and copy it into the `PATH`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar  xvz
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

    The `cockroach` binary needs to be on these VMs so you can run some client commands built into the binary, such as the command in the next step and the command for starting the built-in SQL shell.

5. Run the [`cockroach gen haproxy`](cockroach-gen.html) command to generate an HAProxy config file, specifying the address of any CockroachDB node and the `--locality` of nodes in the US East region:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach gen haproxy \
    --insecure \
    --host=<address of any node> \
    --locality=region=us-east1
    ~~~

    The generated configuration file is called `haproxy.cfg` and looks as follows, with the `server` addresses pre-populated with just the nodes in US East based on the `--locality` flag used:

    ~~~
    global
      maxconn 4096

    defaults
        mode                tcp
        # Timeout values should be configured for your specific use.
        # See: https://cbonte.github.io/haproxy-dconv/1.8/configuration.html#4-timeout%20connect
        timeout connect     10s
        timeout client      1m
        timeout server      1m
        # TCP keep-alive on client side. Server already enables them.
        option              clitcpka

    listen psql
        bind :26257
        mode tcp
        balance roundrobin
        option httpchk GET /health?ready=1
        server cockroach1 <node1 address>:26257 check port 8080
        server cockroach2 <node2 address>:26257 check port 8080
        server cockroach3 <node3 address>:26257 check port 8080
    ~~~

6. Start HAProxy, with the `-f` flag pointing to the `haproxy.cfg` file:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ haproxy -f haproxy.cfg &
    ~~~

7. Repeat the steps above for the client VMs in the other two regions. For each region, be sure to adjust the `--locality` flag when running the `cockroach gen haproxy` command.

### Configure the cluster for MovR

Before you can run MovR against the cluster, you must create a `movr` database and enable an enterprise license.

1. SSH to the client VM in the US East region.

2. Use the [`cockroach sql`](cockroach-sql.html) command to start the built-in SQL shell, specifying the address of the HAProxy load balancer in the region:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure --host=<address of HAProxy in US East>
    ~~~

3. In the SQL shell, create the `movr` database:    

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE movr;
    ~~~

4. Enable the trial license you requested earlier:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING cluster.organization = '<your organization>';
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING enterprise.license = '<your license key>';
    ~~~

5. Set the longitude and latitude of the regions where you are running CockroachDB nodes:

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT into system.locations VALUES
        ('region', 'us-east1', 33.836082, -81.163727),
        ('region', 'us-central1', 42.032974, -93.581543),
        ('region', 'us-west1', 43.804133, -120.554201);
    ~~~

    Inserting these coordinates enables you to visualize your cluster on the [**Node Map**](enable-node-map.html) feature of the DB Console.

6. Exit the SQL shell:

    {% include copy-clipboard.html %}
    ~~~ sql
    \q
    ~~~

### Start MovR in US East

{{site.data.alerts.callout_info}}
Be sure to use the exact version of MovR specified in the commands: `movr:19.09.2`. This tutorial relies on the SQL schema in this specific version.
{{site.data.alerts.end}}

1. Still on the client VM in the US East region, load the MovR schema and initial data for the cities of New York, Chicago, and Seattle, pointing at the address of the US East load balancer:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker run -it --rm cockroachdb/movr:19.09.2 \
    --app-name "movr-load" \
    --url "postgres://root@<address of HAProxy in US East>:26257/movr?sslmode=disable" \
    load \
    --num-users 100 \
    --num-rides 100 \
    --num-vehicles 10 \
    --city-pair us_east:"new york" \
    --city-pair central:chicago \
    --city-pair us_west:seattle
    ~~~

    After the Docker image downloads, you'll see data being generated for the specified cities:

    ~~~
    ...
    [INFO] (MainThread) initializing tables
    [INFO] (MainThread) loading cities ['new york', 'chicago', 'seattle']
    [INFO] (MainThread) loading movr data with ~100 users, ~10 vehicles, and ~100 rides
    [INFO] (MainThread) Only using 3 of 5 requested threads, since we only create at most one thread per city
    [INFO] (Thread-1  ) Generating user data for new york...
    [INFO] (Thread-2  ) Generating user data for chicago...
    [INFO] (Thread-3  ) Generating user data for seattle...
    [INFO] (Thread-2  ) Generating vehicle data for chicago...
    [INFO] (Thread-3  ) Generating vehicle data for seattle...
    [INFO] (Thread-1  ) Generating vehicle data for new york...
    [INFO] (Thread-2  ) Generating ride data for chicago...
    [INFO] (Thread-3  ) Generating ride data for seattle...
    [INFO] (Thread-1  ) Generating ride data for new york...
    [INFO] (Thread-2  ) populated chicago in 9.173931 seconds
    [INFO] (Thread-3  ) populated seattle in 9.257723 seconds
    [INFO] (Thread-1  ) populated new york in 9.386243 seconds
    [INFO] (MainThread) populated 3 cities in 20.587325 seconds
    [INFO] (MainThread) - 4.954505 users/second
    [INFO] (MainThread) - 4.954505 rides/second
    [INFO] (MainThread) - 0.582883 vehicles/second
    ~~~   

2. Start MovR in the US East region, representing users in New York. Be sure to point at the address of the US East load balancer:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker run -it --rm cockroachdb/movr:19.09.2 \
    --app-name "movr-east" \
    --url "postgres://root@<address of HAProxy in US East>:26257/movr?sslmode=disable" \
    --num-threads=15 \
    run \
    --city="new york"
    ~~~

### Start MovR in US Central

1. SSH to the client VM in the US Central region.

2. Start MovR in the US Central region, representing users in Chicago. Be sure to point at the address of the US Central load balancer:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker run -it --rm cockroachdb/movr:19.09.2 \
    --app-name "movr-central" \
    --url "postgres://root@<address of HAProxy in US Central>:26257/movr?sslmode=disable" \
    --num-threads=15 \
    run \
    --city="chicago"
    ~~~

### Start MovR in US West

1. SSH to the client VM in the US West region.

2. Start MovR in the US West region, representing users in Seattle. Be sure to point at the address of the US West load balancer:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo docker run -it --rm cockroachdb/movr:19.09.2 \
    --app-name "movr-west" \
    --url "postgres://root@<address of HAProxy in US West>:26257/movr?sslmode=disable" \
    --num-threads=15 \
    run \
    --city="seattle"
    ~~~

## Step 4. Access the DB Console

Now that you've deployed and configured your cluster, take a look at it in the DB Console:

1. Open a browser and go to `http://<external address of any node>:8080`.

2. On the **Cluster Overview** page, select **View: Node Map** to access the [Node Map](enable-node-map.html), which visualizes your CockroachDB cluster on a map of the US:

    <img src="{{ 'images/v21.1/geo-partitioning-node-map-1.png' | relative_url }}" alt="Geo-partitioning node map" style="max-width:100%" />

3. Drill down one level to see your nodes across 3 regions:

    <img src="{{ 'images/v21.1/geo-partitioning-node-map-2.png' | relative_url }}" alt="Geo-partitioning node map" style="max-width:100%" />

4. Drill into a region to see that each node is in a distinct availability zone:

    <img src="{{ 'images/v21.1/geo-partitioning-node-map-3.png' | relative_url }}" alt="Geo-partitioning node map" style="max-width:100%" />

## Step 5. Check latency

Use the DB Console to see the effect of network latency before applying multi-region data topologies.

1. Still in the DB Console, click **Metrics** on the left and hover over the **Service Latency: SQL, 99th percentile** timeseries graph:

    <img src="{{ 'images/v21.1/geo-partitioning-sql-latency-before.png' | relative_url }}" alt="Geo-partitioning SQL latency" style="max-width:100%" />

    For each node, you'll see that the max latency of 99% of queries is in the 100s of milliseconds. To understand why SQL latency is so high, it's important to first look at how long it takes requests to physically travel between the nodes in your cluster.

2. Click **Network Latency** in the left-hand navigation:

    <img src="{{ 'images/v21.1/geo-partitioning-network-latency.png' | relative_url }}" alt="Geo-partitioning network latency" style="max-width:100%" />

    The **Network Latency** page shows the round-trip latency between any two nodes in your cluster. Here's a node/region mapping:

    Nodes | Region
    ------|-------
    1 - 3 | `us-east1`
    4 - 6 | `us-central1`
    7 - 9 | `us-west1`

    As you can see, within a single region, round-trip latency is sub-millisecond. For example, between nodes 5 and 6 in the `us-central1` region, round-trip latency is 0.56ms. However, between nodes in different regions, round-trip latency is significantly higher. For example, between node 2 in `us-east1` and node 7 in `us-west`, round-trip latency is 66.43ms.

## Step 6. Check replica distribution

With network latency in mind, now use the built-in SQL shell to check the distribution of replicas. This will help us understand how SQL queries are moving between the nodes of the cluster and, thus, incurring latency.

1. SSH to the client VM in any region.

2. Use the [`cockroach sql`](cockroach-sql.html) command to start the built-in SQL shell, specifying the address of the HAProxy load balancer in the region:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure --database=movr --host=<address of HAProxy in region>
    ~~~

3. In the SQL shell, use the [`SHOW RANGES`](show-ranges.html) statement to view the location of replicas for the tables and their secondary indexes:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW RANGES FROM TABLE users;
    SHOW RANGES FROM TABLE vehicles;
    SHOW RANGES FROM INDEX vehicles_auto_index_fk_city_ref_users;
    SHOW RANGES FROM TABLE rides;
    SHOW RANGES FROM INDEX rides_auto_index_fk_city_ref_users;
    SHOW RANGES FROM INDEX rides_auto_index_fk_vehicle_city_ref_vehicles;
    SHOW RANGES FROM TABLE user_promo_codes;
    SHOW RANGES FROM TABLE vehicle_location_histories;
    ~~~

    ~~~
      start_key | end_key | range_id | range_size_mb | lease_holder |           lease_holder_locality           | replicas |                                                             replica_localities
    +-----------+---------+----------+---------------+--------------+-------------------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------+
      NULL      | NULL    |       85 |      0.158604 |            1 | cloud=gce,region=us-east1,zone=us-east1-b | {1,6,8}  | {"cloud=gce,region=us-east1,zone=us-east1-b","cloud=gce,region=us-central1,zone=us-central1-c","cloud=gce,region=us-west1,zone=us-west1-b"}
    (1 row)

    Time: 750.045316ms

      start_key | end_key | range_id | range_size_mb | lease_holder |           lease_holder_locality           | replicas |                                                             replica_localities
    +-----------+---------+----------+---------------+--------------+-------------------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------+
      NULL      | NULL    |       37 |      0.298143 |            3 | cloud=gce,region=us-east1,zone=us-east1-d | {3,6,7}  | {"cloud=gce,region=us-east1,zone=us-east1-d","cloud=gce,region=us-central1,zone=us-central1-c","cloud=gce,region=us-west1,zone=us-west1-a"}
    (1 row)

    Time: 473.718371ms

      start_key | end_key | range_id | range_size_mb | lease_holder |           lease_holder_locality           | replicas |                                                             replica_localities
    +-----------+---------+----------+---------------+--------------+-------------------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------+
      NULL      | NULL    |       37 |      0.302683 |            3 | cloud=gce,region=us-east1,zone=us-east1-d | {3,6,7}  | {"cloud=gce,region=us-east1,zone=us-east1-d","cloud=gce,region=us-central1,zone=us-central1-c","cloud=gce,region=us-west1,zone=us-west1-a"}
    (1 row)

    Time: 2.556900719s

      start_key | end_key | range_id | range_size_mb | lease_holder |           lease_holder_locality           | replicas |                                                             replica_localities
    +-----------+---------+----------+---------------+--------------+-------------------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------+
      NULL      | NULL    |       39 |      0.563349 |            7 | cloud=gce,region=us-west1,zone=us-west1-a | {3,6,7}  | {"cloud=gce,region=us-east1,zone=us-east1-d","cloud=gce,region=us-central1,zone=us-central1-c","cloud=gce,region=us-west1,zone=us-west1-a"}
    (1 row)

    Time: 673.337559ms

      start_key | end_key | range_id | range_size_mb | lease_holder |           lease_holder_locality           | replicas |                                                             replica_localities
    +-----------+---------+----------+---------------+--------------+-------------------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------+
      NULL      | NULL    |       39 |      0.571556 |            7 | cloud=gce,region=us-west1,zone=us-west1-a | {3,6,7}  | {"cloud=gce,region=us-east1,zone=us-east1-d","cloud=gce,region=us-central1,zone=us-central1-c","cloud=gce,region=us-west1,zone=us-west1-a"}
    (1 row)

    Time: 3.184113514s

      start_key | end_key | range_id | range_size_mb | lease_holder |           lease_holder_locality           | replicas |                                                             replica_localities
    +-----------+---------+----------+---------------+--------------+-------------------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------+
      NULL      | NULL    |       39 |       0.57792 |            7 | cloud=gce,region=us-west1,zone=us-west1-a | {3,6,7}  | {"cloud=gce,region=us-east1,zone=us-east1-d","cloud=gce,region=us-central1,zone=us-central1-c","cloud=gce,region=us-west1,zone=us-west1-a"}
    (1 row)

    Time: 2.812128768s

      start_key | end_key | range_id | range_size_mb | lease_holder |           lease_holder_locality           | replicas |                                                             replica_localities
    +-----------+---------+----------+---------------+--------------+-------------------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------+
      NULL      | NULL    |       38 |      0.054887 |            9 | cloud=gce,region=us-west1,zone=us-west1-c | {2,6,9}  | {"cloud=gce,region=us-east1,zone=us-east1-c","cloud=gce,region=us-central1,zone=us-central1-c","cloud=gce,region=us-west1,zone=us-west1-c"}
    (1 row)

    Time: 896.010317ms

      start_key | end_key | range_id | range_size_mb | lease_holder |              lease_holder_locality              | replicas |                                                             replica_localities
    +-----------+---------+----------+---------------+--------------+-------------------------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------+
      NULL      | NULL    |       86 |      2.197216 |            6 | cloud=gce,region=us-central1,zone=us-central1-c | {2,6,7}  | {"cloud=gce,region=us-east1,zone=us-east1-c","cloud=gce,region=us-central1,zone=us-central1-c","cloud=gce,region=us-west1,zone=us-west1-a"}
    (1 row)

    Time: 708.643369ms
    ~~~

    Here's the node/region mapping again:

    Nodes | Region
    ------|-------
    1 - 3 | `us-east1`
    4 - 6 | `us-central1`
    7 - 9 | `us-west1`

    You'll see that most tables and indexes map to a single range, and each range has 3 replicas spread across regions with one replica identified as `lease_holder`.

    Thinking back to [how reads and writes work in CockroachDB](architecture/reads-and-writes-overview.html), this tells you that many reads are leaving their region to reach the relevant leaseholder replica, and all writes are spanning regions to achieve Raft consensus. This explains the currently high latencies.

    For example, based on the output above, the replicas for the `users` table are on nodes 1, 6, and 8, with the leaseholder on node 1. This means that when a user in Seattle registers for the MovR service:

    1. A request to write a row to the `users` table goes through the load balancer in US west to a gateway node in US west.
    2. The request is routed to the leaseholder on node 1 in US east.
    3. The leaseholder waits for consensus from a replica in US central or US west.
    4. The leaseholder returns acknowledgement to the gateway node in the US west.
    5. The gateway node responds to the client.

## Step 7. Apply data topologies

- [Partition geo-specific tables](#partition-geo-specific-tables)
- [Duplicate the reference table](#duplicate-the-reference-table)

### Partition geo-specific tables

As mentioned earlier, all of the tables except `promo_codes` are geographically specific, ordered by `city`, and read and updated very frequently. For these tables, the most effective way to prevent the high latency resulting from cross-region operations is to apply the [Geo-Partitioned Replicas](topology-geo-partitioned-replicas.html) data topology. In practice, you will tell CockroachDB to partition these tables and their secondary indexes by `city`, each partition becoming its own range of 3 replicas. You will then tell CockroachDB to pin each partition (all of its replicas) to the relevant region. This means that reads and writes on these tables will always have access to the relevant replicas in each region and, therefore, will have low, intra-region latencies.

1. Back in the SQL shell on one of your client VMs, use [`ALTER TABLE/INDEX ... PARTITION BY`](partition-by.html) statements to define partitions by `city` for the geo-specific tables and their secondary indexes:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE users PARTITION BY LIST (city) (
        PARTITION new_york VALUES IN ('new york'),
        PARTITION chicago VALUES IN ('chicago'),
        PARTITION seattle VALUES IN ('seattle')
      );
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE vehicles PARTITION BY LIST (city) (
        PARTITION new_york VALUES IN ('new york'),
        PARTITION chicago VALUES IN ('chicago'),
        PARTITION seattle VALUES IN ('seattle')
      );
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER INDEX vehicles_auto_index_fk_city_ref_users PARTITION BY LIST (city) (
        PARTITION new_york VALUES IN ('new york'),
        PARTITION chicago VALUES IN ('chicago'),
        PARTITION seattle VALUES IN ('seattle')
      );
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE rides PARTITION BY LIST (city) (
        PARTITION new_york VALUES IN ('new york'),
        PARTITION chicago VALUES IN ('chicago'),
        PARTITION seattle VALUES IN ('seattle')
      );
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER INDEX rides_auto_index_fk_city_ref_users PARTITION BY LIST (city) (
        PARTITION new_york VALUES IN ('new york'),
        PARTITION chicago VALUES IN ('chicago'),
        PARTITION seattle VALUES IN ('seattle')
      );
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER INDEX rides_auto_index_fk_vehicle_city_ref_vehicles PARTITION BY LIST (vehicle_city) (
        PARTITION new_york VALUES IN ('new york'),
        PARTITION chicago VALUES IN ('chicago'),
        PARTITION seattle VALUES IN ('seattle')
      );
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE user_promo_codes PARTITION BY LIST (city) (
        PARTITION new_york VALUES IN ('new york'),
        PARTITION chicago VALUES IN ('chicago'),
        PARTITION seattle VALUES IN ('seattle')
      );
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE vehicle_location_histories PARTITION BY LIST (city) (
        PARTITION new_york VALUES IN ('new york'),
        PARTITION chicago VALUES IN ('chicago'),
        PARTITION seattle VALUES IN ('seattle')
      );
    ~~~

2. Use the [`SHOW CREATE TABLE`](show-create.html) statement to review the partition definition for one of the geo-specific tables:

    {{site.data.alerts.callout_success}}
    The warning at the bottom tells you that partitions are not yet applied because corresponding replication zones still need to be created.
    {{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW CREATE TABLE vehicles;
    ~~~

    ~~~
      table_name |                                          create_statement
    +------------+-----------------------------------------------------------------------------------------------------+
      vehicles   | CREATE TABLE vehicles (
                 |     id UUID NOT NULL,
                 |     city VARCHAR NOT NULL,
                 |     type VARCHAR NULL,
                 |     owner_id UUID NULL,
                 |     creation_time TIMESTAMP NULL,
                 |     status VARCHAR NULL,
                 |     current_location VARCHAR NULL,
                 |     ext JSONB NULL,
                 |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
                 |     CONSTRAINT fk_city_ref_users FOREIGN KEY (city, owner_id) REFERENCES users(city, id),
                 |     INDEX vehicles_auto_index_fk_city_ref_users (city ASC, owner_id ASC) PARTITION BY LIST (city) (
                 |         PARTITION new_york VALUES IN (('new york')),
                 |         PARTITION chicago VALUES IN (('chicago')),
                 |         PARTITION seattle VALUES IN (('seattle'))
                 |     ),
                 |     FAMILY "primary" (id, city, type, owner_id, creation_time, status, current_location, ext)
                 | ) PARTITION BY LIST (city) (
                 |     PARTITION new_york VALUES IN (('new york')),
                 |     PARTITION chicago VALUES IN (('chicago')),
                 |     PARTITION seattle VALUES IN (('seattle'))
                 | )
                 | -- Warning: Partitioned table with no zone configurations.
    (1 row)
    ~~~

3. Use [`ALTER PARTITION ... CONFIGURE ZONE`](configure-zone.html) statements to create replication zones that pin each partition to nodes in the relevant region, using the localities specified when nodes were started:

    {{site.data.alerts.callout_success}}
    The `<table>@*` syntax lets you create zone configurations for all identically named partitions of a table, saving you multiple steps.
    {{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER PARTITION new_york OF INDEX movr.users@*
        CONFIGURE ZONE USING constraints='[+region=us-east1]';
      ALTER PARTITION chicago OF INDEX movr.users@*
        CONFIGURE ZONE USING constraints='[+region=us-central1]';
      ALTER PARTITION seattle OF INDEX movr.users@*
        CONFIGURE ZONE USING constraints='[+region=us-west1]';
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER PARTITION new_york OF INDEX movr.vehicles@*
        CONFIGURE ZONE USING constraints='[+region=us-east1]';
      ALTER PARTITION chicago OF INDEX movr.vehicles@*
        CONFIGURE ZONE USING constraints='[+region=us-central1]';
      ALTER PARTITION seattle OF INDEX movr.vehicles@*
        CONFIGURE ZONE USING constraints='[+region=us-west1]';
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER PARTITION new_york OF INDEX movr.rides@*
        CONFIGURE ZONE USING constraints='[+region=us-east1]';
      ALTER PARTITION chicago OF INDEX movr.rides@*
        CONFIGURE ZONE USING constraints='[+region=us-central1]';
      ALTER PARTITION seattle OF INDEX movr.rides@*
        CONFIGURE ZONE USING constraints='[+region=us-west1]';
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER PARTITION new_york OF INDEX movr.user_promo_codes@*
        CONFIGURE ZONE USING constraints='[+region=us-east1]';
      ALTER PARTITION chicago OF INDEX movr.user_promo_codes@*
        CONFIGURE ZONE USING constraints='[+region=us-central1]';
      ALTER PARTITION seattle OF INDEX movr.user_promo_codes@*
        CONFIGURE ZONE USING constraints='[+region=us-west1]';
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER PARTITION new_york OF INDEX movr.vehicle_location_histories@*
        CONFIGURE ZONE USING constraints='[+region=us-east1]';
      ALTER PARTITION chicago OF INDEX movr.vehicle_location_histories@*
        CONFIGURE ZONE USING constraints='[+region=us-central1]';
      ALTER PARTITION seattle OF INDEX movr.vehicle_location_histories@*
        CONFIGURE ZONE USING constraints='[+region=us-west1]';
    ~~~

3. At this point, you can use the [`SHOW CREATE TABLE`](show-create.html) statement to confirm that partitions are in effect:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW CREATE TABLE vehicles;
    ~~~

    ~~~
      table_name |                                                 create_statement
    +------------+-------------------------------------------------------------------------------------------------------------------+
      vehicles   | CREATE TABLE vehicles (
                 |     id UUID NOT NULL,
                 |     city VARCHAR NOT NULL,
                 |     type VARCHAR NULL,
                 |     owner_id UUID NULL,
                 |     creation_time TIMESTAMP NULL,
                 |     status VARCHAR NULL,
                 |     current_location VARCHAR NULL,
                 |     ext JSONB NULL,
                 |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
                 |     CONSTRAINT fk_city_ref_users FOREIGN KEY (city, owner_id) REFERENCES users(city, id),
                 |     INDEX vehicles_auto_index_fk_city_ref_users (city ASC, owner_id ASC) PARTITION BY LIST (city) (
                 |         PARTITION new_york VALUES IN (('new york')),
                 |         PARTITION chicago VALUES IN (('chicago')),
                 |         PARTITION seattle VALUES IN (('seattle'))
                 |     ),
                 |     FAMILY "primary" (id, city, type, owner_id, creation_time, status, current_location, ext)
                 | ) PARTITION BY LIST (city) (
                 |     PARTITION new_york VALUES IN (('new york')),
                 |     PARTITION chicago VALUES IN (('chicago')),
                 |     PARTITION seattle VALUES IN (('seattle'))
                 | );
                 | ALTER PARTITION chicago OF INDEX movr.public.vehicles@primary CONFIGURE ZONE USING
                 |     constraints = '[+region=us-central1]';
                 | ALTER PARTITION new_york OF INDEX movr.public.vehicles@primary CONFIGURE ZONE USING
                 |     constraints = '[+region=us-east1]';
                 | ALTER PARTITION seattle OF INDEX movr.public.vehicles@primary CONFIGURE ZONE USING
                 |     constraints = '[+region=us-west1]';
                 | ALTER PARTITION chicago OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING
                 |     constraints = '[+region=us-central1]';
                 | ALTER PARTITION new_york OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING
                 |     constraints = '[+region=us-east1]';
                 | ALTER PARTITION seattle OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING
                 |     constraints = '[+region=us-west1]'
    (1 row)
    ~~~

    In contrast to the last time you ran this statement, you can now see the commands for re-creating the replication zone for each partition of the `vehicles` table and its secondary index.

    The [`SHOW PARTITIONS`](show-partitions.html) statement is another way to confirm that partitions are in effect:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW PARTITIONS FROM TABLE vehicles;
    ~~~

    ~~~
      database_name | table_name | partition_name | parent_partition | column_names |                   index_name                   | partition_value |              zone_config              |            full_zone_config
    +---------------+------------+----------------+------------------+--------------+------------------------------------------------+-----------------+---------------------------------------+----------------------------------------+
      movr          | vehicles   | new_york       | NULL             | city         | vehicles@primary                               | ('new york')    | constraints = '[+region=us-east1]'    | range_min_bytes = 134217728,
                    |            |                |                  |              |                                                |                 |                                       | range_max_bytes = 536870912,
                    |            |                |                  |              |                                                |                 |                                       | gc.ttlseconds = 90000,
                    |            |                |                  |              |                                                |                 |                                       | num_replicas = 3,
                    |            |                |                  |              |                                                |                 |                                       | constraints = '[+region=us-east1]',
                    |            |                |                  |              |                                                |                 |                                       | lease_preferences = '[]'
      movr          | vehicles   | new_york       | NULL             | city         | vehicles@vehicles_auto_index_fk_city_ref_users | ('new york')    | constraints = '[+region=us-east1]'    | range_min_bytes = 134217728,
                    |            |                |                  |              |                                                |                 |                                       | range_max_bytes = 536870912,
                    |            |                |                  |              |                                                |                 |                                       | gc.ttlseconds = 90000,
                    |            |                |                  |              |                                                |                 |                                       | num_replicas = 3,
                    |            |                |                  |              |                                                |                 |                                       | constraints = '[+region=us-east1]',
                    |            |                |                  |              |                                                |                 |                                       | lease_preferences = '[]'
      movr          | vehicles   | chicago        | NULL             | city         | vehicles@primary                               | ('chicago')     | constraints = '[+region=us-central1]' | range_min_bytes = 134217728,
                    |            |                |                  |              |                                                |                 |                                       | range_max_bytes = 536870912,
                    |            |                |                  |              |                                                |                 |                                       | gc.ttlseconds = 90000,
                    |            |                |                  |              |                                                |                 |                                       | num_replicas = 3,
                    |            |                |                  |              |                                                |                 |                                       | constraints = '[+region=us-central1]',
                    |            |                |                  |              |                                                |                 |                                       | lease_preferences = '[]'
      movr          | vehicles   | chicago        | NULL             | city         | vehicles@vehicles_auto_index_fk_city_ref_users | ('chicago')     | constraints = '[+region=us-central1]' | range_min_bytes = 134217728,
                    |            |                |                  |              |                                                |                 |                                       | range_max_bytes = 536870912,
                    |            |                |                  |              |                                                |                 |                                       | gc.ttlseconds = 90000,
                    |            |                |                  |              |                                                |                 |                                       | num_replicas = 3,
                    |            |                |                  |              |                                                |                 |                                       | constraints = '[+region=us-central1]',
                    |            |                |                  |              |                                                |                 |                                       | lease_preferences = '[]'
      movr          | vehicles   | seattle        | NULL             | city         | vehicles@primary                               | ('seattle')     | constraints = '[+region=us-west1]'    | range_min_bytes = 134217728,
                    |            |                |                  |              |                                                |                 |                                       | range_max_bytes = 536870912,
                    |            |                |                  |              |                                                |                 |                                       | gc.ttlseconds = 90000,
                    |            |                |                  |              |                                                |                 |                                       | num_replicas = 3,
                    |            |                |                  |              |                                                |                 |                                       | constraints = '[+region=us-west1]',
                    |            |                |                  |              |                                                |                 |                                       | lease_preferences = '[]'
      movr          | vehicles   | seattle        | NULL             | city         | vehicles@vehicles_auto_index_fk_city_ref_users | ('seattle')     | constraints = '[+region=us-west1]'    | range_min_bytes = 134217728,
                    |            |                |                  |              |                                                |                 |                                       | range_max_bytes = 536870912,
                    |            |                |                  |              |                                                |                 |                                       | gc.ttlseconds = 90000,
                    |            |                |                  |              |                                                |                 |                                       | num_replicas = 3,
                    |            |                |                  |              |                                                |                 |                                       | constraints = '[+region=us-west1]',
                    |            |                |                  |              |                                                |                 |                                       | lease_preferences = '[]'
    (6 rows)
    ~~~

      {% include {{page.version.version}}/sql/crdb-internal-partitions.md %}

### Duplicate the reference table

In contrast to the other tables, the `promo_codes` table is not tied to geography, and its data is read frequently but rarely updated. This type of table is often referred to as a "reference table" or "lookup table". For this table, you'll keep read latency low by applying the [Duplicate Indexes](topology-duplicate-indexes.html) data topology. In practice, you will put the leaseholder for the table itself (also called the primary index) in one region, create two secondary indexes on the table, and tell CockroachDB to put the leaseholder for each secondary index in one of the other regions. CockroachDB's [cost-based optimizer](cost-based-optimizer.html) will then make sure that reads from `promo_codes` access the local leaseholder (either for the table itself or for one of the secondary indexes). Writes, however, will still leave the region to get consensus for the table and its secondary indexes, but writes are so rare that this won't impact overall performance.

1. Create two indexes on the `promo_codes` table, and make them complete copies of the primary index:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE INDEX promo_codes_idx_east ON promo_codes (code)
        STORING (description, creation_time, expiration_time, rules);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE INDEX promo_codes_idx_west ON promo_codes (code)
        STORING (description, creation_time, expiration_time, rules);
    ~~~

2. Use [`ALTER TABLE/INDEX ... CONFIGURE ZONE`](configure-zone.html) statements to create replication zones for the primary index and each secondary index, in each case setting a leaseholder preference telling CockroachDB to put the leaseholder for the index in a distinct region:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE promo_codes
        CONFIGURE ZONE USING
          num_replicas = 3,
          constraints = '{"+region=us-central1": 1}',
          lease_preferences = '[[+region=us-central1]]';
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER INDEX promo_codes@promo_codes_idx_east
        CONFIGURE ZONE USING
          num_replicas = 3,
          constraints = '{"+region=us-east1": 1}',
          lease_preferences = '[[+region=us-east1]]';
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql   
    > ALTER INDEX promo_codes@promo_codes_idx_west
        CONFIGURE ZONE USING
          num_replicas = 3,
          constraints = '{"+region=us-west1": 1}',
          lease_preferences = '[[+region=us-west1]]';
    ~~~

## Step 8. Re-check replica distribution

1. Still in the SQL shell on one of your client VMs, use the [`SHOW RANGES`](show-ranges.html) statement to check replica placement of the geo-specific tables after partitioning:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM [SHOW RANGES FROM TABLE users]
        WHERE "start_key" NOT LIKE '%Prefix%';
      SELECT * FROM [SHOW RANGES FROM TABLE vehicles]
        WHERE "start_key" NOT LIKE '%Prefix%';
      SELECT * FROM [SHOW RANGES FROM INDEX vehicles_auto_index_fk_city_ref_users]
        WHERE "start_key" NOT LIKE '%Prefix%';
      SELECT * FROM [SHOW RANGES FROM TABLE rides]
        WHERE "start_key" NOT LIKE '%Prefix%';
      SELECT * FROM [SHOW RANGES FROM INDEX rides_auto_index_fk_city_ref_users]
        WHERE "start_key" NOT LIKE '%Prefix%';
      SELECT * FROM [SHOW RANGES FROM INDEX rides_auto_index_fk_vehicle_city_ref_vehicles]
        WHERE "start_key" NOT LIKE '%Prefix%';
      SELECT * FROM [SHOW RANGES FROM TABLE user_promo_codes]
        WHERE "start_key" NOT LIKE '%Prefix%';
      SELECT * FROM [SHOW RANGES FROM TABLE vehicle_location_histories]
        WHERE "start_key" NOT LIKE '%Prefix%';      
    ~~~

    ~~~
       start_key  |        end_key        | range_id | range_size_mb | lease_holder |              lease_holder_locality              | replicas |                                                                   replica_localities
    +-------------+-----------------------+----------+---------------+--------------+-------------------------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------------------+
      /"new york" | /"new york"/PrefixEnd |      105 |      0.933453 |            3 | cloud=gce,region=us-east1,zone=us-east1-d       | {1,2,3}  | {"cloud=gce,region=us-east1,zone=us-east1-b","cloud=gce,region=us-east1,zone=us-east1-c","cloud=gce,region=us-east1,zone=us-east1-d"}
      /"chicago"  | /"chicago"/PrefixEnd  |      107 |      0.860034 |            6 | cloud=gce,region=us-central1,zone=us-central1-c | {4,5,6}  | {"cloud=gce,region=us-central1,zone=us-central1-a","cloud=gce,region=us-central1,zone=us-central1-b","cloud=gce,region=us-central1,zone=us-central1-c"}
      /"seattle"  | /"seattle"/PrefixEnd  |      109 |      0.895921 |            7 | cloud=gce,region=us-west1,zone=us-west1-a       | {7,8,9}  | {"cloud=gce,region=us-west1,zone=us-west1-a","cloud=gce,region=us-west1,zone=us-west1-b","cloud=gce,region=us-west1,zone=us-west1-c"}
    (3 rows)

    Time: 1.645458616s

       start_key  |        end_key        | range_id | range_size_mb | lease_holder |              lease_holder_locality              | replicas |                                                                   replica_localities
    +-------------+-----------------------+----------+---------------+--------------+-------------------------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------------------+
      /"new york" | /"new york"/PrefixEnd |      125 |       2.11175 |            2 | cloud=gce,region=us-east1,zone=us-east1-c       | {1,2,3}  | {"cloud=gce,region=us-east1,zone=us-east1-b","cloud=gce,region=us-east1,zone=us-east1-c","cloud=gce,region=us-east1,zone=us-east1-d"}
      /"chicago"  | /"chicago"/PrefixEnd  |      129 |        1.9099 |            5 | cloud=gce,region=us-central1,zone=us-central1-b | {4,5,6}  | {"cloud=gce,region=us-central1,zone=us-central1-a","cloud=gce,region=us-central1,zone=us-central1-b","cloud=gce,region=us-central1,zone=us-central1-c"}
      /"seattle"  | /"seattle"/PrefixEnd  |       56 |       2.04172 |            9 | cloud=gce,region=us-west1,zone=us-west1-c       | {7,8,9}  | {"cloud=gce,region=us-west1,zone=us-west1-a","cloud=gce,region=us-west1,zone=us-west1-b","cloud=gce,region=us-west1,zone=us-west1-c"}
    (3 rows)

    Time: 1.260863914s

       start_key  |        end_key        | range_id | range_size_mb | lease_holder |              lease_holder_locality              | replicas |                                                                   replica_localities
    +-------------+-----------------------+----------+---------------+--------------+-------------------------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------------------+
      /"new york" | /"new york"/PrefixEnd |      127 |      0.119543 |            1 | cloud=gce,region=us-east1,zone=us-east1-b       | {1,2,3}  | {"cloud=gce,region=us-east1,zone=us-east1-b","cloud=gce,region=us-east1,zone=us-east1-c","cloud=gce,region=us-east1,zone=us-east1-d"}
      /"chicago"  | /"chicago"/PrefixEnd  |      130 |      0.106442 |            5 | cloud=gce,region=us-central1,zone=us-central1-b | {4,5,6}  | {"cloud=gce,region=us-central1,zone=us-central1-a","cloud=gce,region=us-central1,zone=us-central1-b","cloud=gce,region=us-central1,zone=us-central1-c"}
      /"seattle"  | /"seattle"/PrefixEnd  |       46 |      0.110188 |            9 | cloud=gce,region=us-west1,zone=us-west1-c       | {7,8,9}  | {"cloud=gce,region=us-west1,zone=us-west1-a","cloud=gce,region=us-west1,zone=us-west1-b","cloud=gce,region=us-west1,zone=us-west1-c"}
    (3 rows)

    Time: 3.392228893s

       start_key  |        end_key        | range_id | range_size_mb | lease_holder |              lease_holder_locality              | replicas |                                                                   replica_localities
    +-------------+-----------------------+----------+---------------+--------------+-------------------------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------------------+
      /"new york" | /"new york"/PrefixEnd |       76 |      2.498621 |            2 | cloud=gce,region=us-east1,zone=us-east1-c       | {1,2,3}  | {"cloud=gce,region=us-east1,zone=us-east1-b","cloud=gce,region=us-east1,zone=us-east1-c","cloud=gce,region=us-east1,zone=us-east1-d"}
      /"chicago"  | /"chicago"/PrefixEnd  |       83 |      2.243434 |            5 | cloud=gce,region=us-central1,zone=us-central1-b | {4,5,6}  | {"cloud=gce,region=us-central1,zone=us-central1-a","cloud=gce,region=us-central1,zone=us-central1-b","cloud=gce,region=us-central1,zone=us-central1-c"}
      /"seattle"  | /"seattle"/PrefixEnd  |      148 |       2.39411 |            7 | cloud=gce,region=us-west1,zone=us-west1-a       | {7,8,9}  | {"cloud=gce,region=us-west1,zone=us-west1-a","cloud=gce,region=us-west1,zone=us-west1-b","cloud=gce,region=us-west1,zone=us-west1-c"}
    (3 rows)

    Time: 1.294584902s

       start_key  |        end_key        | range_id | range_size_mb | lease_holder |              lease_holder_locality              | replicas |                                                                   replica_localities
    +-------------+-----------------------+----------+---------------+--------------+-------------------------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------------------+
      /"new york" | /"new york"/PrefixEnd |       78 |      0.533722 |            1 | cloud=gce,region=us-east1,zone=us-east1-b       | {1,2,3}  | {"cloud=gce,region=us-east1,zone=us-east1-b","cloud=gce,region=us-east1,zone=us-east1-c","cloud=gce,region=us-east1,zone=us-east1-d"}
      /"chicago"  | /"chicago"/PrefixEnd  |       82 |      0.477912 |            4 | cloud=gce,region=us-central1,zone=us-central1-a | {4,5,6}  | {"cloud=gce,region=us-central1,zone=us-central1-a","cloud=gce,region=us-central1,zone=us-central1-b","cloud=gce,region=us-central1,zone=us-central1-c"}
      /"seattle"  | /"seattle"/PrefixEnd  |      149 |      0.505345 |            7 | cloud=gce,region=us-west1,zone=us-west1-a       | {7,8,9}  | {"cloud=gce,region=us-west1,zone=us-west1-a","cloud=gce,region=us-west1,zone=us-west1-b","cloud=gce,region=us-west1,zone=us-west1-c"}
    (3 rows)

    Time: 3.346661477s

       start_key  |        end_key        | range_id | range_size_mb | lease_holder |              lease_holder_locality              | replicas |                                                                   replica_localities
    +-------------+-----------------------+----------+---------------+--------------+-------------------------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------------------+
      /"new york" | /"new york"/PrefixEnd |       80 |       0.61871 |            2 | cloud=gce,region=us-east1,zone=us-east1-c       | {1,2,3}  | {"cloud=gce,region=us-east1,zone=us-east1-b","cloud=gce,region=us-east1,zone=us-east1-c","cloud=gce,region=us-east1,zone=us-east1-d"}
      /"chicago"  | /"chicago"/PrefixEnd  |       84 |      0.547892 |            6 | cloud=gce,region=us-central1,zone=us-central1-c | {4,5,6}  | {"cloud=gce,region=us-central1,zone=us-central1-a","cloud=gce,region=us-central1,zone=us-central1-b","cloud=gce,region=us-central1,zone=us-central1-c"}
      /"seattle"  | /"seattle"/PrefixEnd  |      150 |      0.579083 |            7 | cloud=gce,region=us-west1,zone=us-west1-a       | {7,8,9}  | {"cloud=gce,region=us-west1,zone=us-west1-a","cloud=gce,region=us-west1,zone=us-west1-b","cloud=gce,region=us-west1,zone=us-west1-c"}
    (3 rows)

    Time: 3.341758512s

       start_key  |        end_key        | range_id | range_size_mb | lease_holder |              lease_holder_locality              | replicas |                                                                   replica_localities
    +-------------+-----------------------+----------+---------------+--------------+-------------------------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------------------+
      /"new york" | /"new york"/PrefixEnd |      133 |      0.365143 |            1 | cloud=gce,region=us-east1,zone=us-east1-b       | {1,2,3}  | {"cloud=gce,region=us-east1,zone=us-east1-b","cloud=gce,region=us-east1,zone=us-east1-c","cloud=gce,region=us-east1,zone=us-east1-d"}
      /"chicago"  | /"chicago"/PrefixEnd  |      135 |      0.313355 |            6 | cloud=gce,region=us-central1,zone=us-central1-c | {4,5,6}  | {"cloud=gce,region=us-central1,zone=us-central1-a","cloud=gce,region=us-central1,zone=us-central1-b","cloud=gce,region=us-central1,zone=us-central1-c"}
      /"seattle"  | /"seattle"/PrefixEnd  |      137 |      0.343468 |            9 | cloud=gce,region=us-west1,zone=us-west1-c       | {7,8,9}  | {"cloud=gce,region=us-west1,zone=us-west1-a","cloud=gce,region=us-west1,zone=us-west1-b","cloud=gce,region=us-west1,zone=us-west1-c"}
    (3 rows)

    Time: 1.105110359s

       start_key  |        end_key        | range_id | range_size_mb | lease_holder |              lease_holder_locality              | replicas |                                                                   replica_localities
    +-------------+-----------------------+----------+---------------+--------------+-------------------------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------------------+
      /"new york" | /"new york"/PrefixEnd |      112 |     20.852122 |            3 | cloud=gce,region=us-east1,zone=us-east1-d       | {1,2,3}  | {"cloud=gce,region=us-east1,zone=us-east1-b","cloud=gce,region=us-east1,zone=us-east1-c","cloud=gce,region=us-east1,zone=us-east1-d"}
      /"chicago"  | /"chicago"/PrefixEnd  |      114 |     17.631255 |            4 | cloud=gce,region=us-central1,zone=us-central1-a | {4,5,6}  | {"cloud=gce,region=us-central1,zone=us-central1-a","cloud=gce,region=us-central1,zone=us-central1-b","cloud=gce,region=us-central1,zone=us-central1-c"}
      /"seattle"  | /"seattle"/PrefixEnd  |      116 |     19.677135 |            8 | cloud=gce,region=us-west1,zone=us-west1-b       | {7,8,9}  | {"cloud=gce,region=us-west1,zone=us-west1-a","cloud=gce,region=us-west1,zone=us-west1-b","cloud=gce,region=us-west1,zone=us-west1-c"}
    (3 rows)

    Time: 1.612425537s
    ~~~

    You'll see that the replicas for each partition are now located on nodes in the relevant region:
    - New York partitions are on nodes 1 - 3
    - Chicago partitions are on nodes 4 - 6
    - Seattle partitions are on nodes 7 - 9

    This means that requests from users in a city no longer leave the region, thus removing all cross-region latencies.

2. Now use the [`SHOW RANGES`](show-ranges.html) statement to check replica placement of the `promo_codes` reference table and indexes:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW RANGES FROM TABLE promo_codes;
      SHOW RANGES FROM INDEX promo_codes_idx_east;
      SHOW RANGES FROM INDEX promo_codes_idx_west;
    ~~~

    ~~~
      start_key | end_key | range_id | range_size_mb | lease_holder |              lease_holder_locality              | replicas |                                                             replica_localities
    +-----------+---------+----------+---------------+--------------+-------------------------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------+
      NULL      | NULL    |       87 |      0.835044 |            6 | cloud=gce,region=us-central1,zone=us-central1-c | {1,6,9}  | {"cloud=gce,region=us-east1,zone=us-east1-b","cloud=gce,region=us-central1,zone=us-central1-c","cloud=gce,region=us-west1,zone=us-west1-c"}
    (1 row)

    Time: 517.443988ms

      start_key | end_key | range_id | range_size_mb | lease_holder |           lease_holder_locality           | replicas |                                                             replica_localities
    +-----------+---------+----------+---------------+--------------+-------------------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------+
      NULL      | NULL    |       89 |       0.83622 |            1 | cloud=gce,region=us-east1,zone=us-east1-b | {1,6,9}  | {"cloud=gce,region=us-east1,zone=us-east1-b","cloud=gce,region=us-central1,zone=us-central1-c","cloud=gce,region=us-west1,zone=us-west1-c"}
    (1 row)

    Time: 2.449771429s

      start_key | end_key | range_id | range_size_mb | lease_holder |           lease_holder_locality           | replicas |                                                             replica_localities
    +-----------+---------+----------+---------------+--------------+-------------------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------+
      NULL      | NULL    |       90 |      0.836372 |            9 | cloud=gce,region=us-west1,zone=us-west1-c | {1,6,9}  | {"cloud=gce,region=us-east1,zone=us-east1-b","cloud=gce,region=us-central1,zone=us-central1-c","cloud=gce,region=us-west1,zone=us-west1-c"}
    (1 row)

    Time: 2.621930607s
    ~~~

    You'll see that the replicas for each index are spread across regions, with the leaseholders each in a distinct region:
    - The leaseholder for the `promo_codes` primary index is on node 6 in US Central
    - The leaseholder for the `promo_codes_idx_east` secondary index is on node 1 in US East
    - The leaseholder for the `promo_codes_idx_west` secondary index is on node 9 in US West

    As you'll see in a just a bit, with one leaseholder in each region, CockroachDB's cost-based optimizer will make sure that reads always access the local leaseholder, keeping reads from this table very fast.

## Step 9. Re-check latency

1. Now that you've verified that replicas are located properly, go back to the DB Console, click **Metrics** on the left, and hover over the **Service Latency: SQL, 99th percentile** timeseries graph:

    <img src="{{ 'images/v21.1/geo-partitioning-sql-latency-after-1.png' | relative_url }}" alt="Geo-partitioning SQL latency" style="max-width:100%" />

    For each node, you'll see that **99% of all queries are now under 4 milliseconds**.

2. 99th percentile latency can be influenced by occasional slow queries. For a more accurate sense of typical SQL latency, go to the following URL to view a custom graph for 90th percentile latency:

    ~~~
    http://<external address of any node>:8080/#/debug/chart?charts=%5B%7B%22metrics%22%3A%5B%7B%22downsampler%22%3A3%2C%22aggregator%22%3A3%2C%22derivative%22%3A0%2C%22perNode%22%3Atrue%2C%22source%22%3A%22%22%2C%22metric%22%3A%22cr.node.sql.exec.latency-p90%22%7D%5D%2C%22axisUnits%22%3A2%7D%5D
    ~~~

    <img src="{{ 'images/v21.1/geo-partitioning-sql-latency-after-2.png' | relative_url }}" alt="Geo-partitioning SQL latency" style="max-width:100%" />

    As you can see, **90% of all SQL queries execute in less than 2 milliseconds**. In some cases, latency is even sub-millisecond.

3. Most of the latency reduction is due to the geo-partitioned tables. However, the duplicate indexes approach for the `promo_codes` table is also relevant. To validate that the cost-based optimizer is picking the appropriate leaseholder from reads from `promo_codes` in each region, click **Statements** on the left, select **APP > MOVR-EAST**, and then click the `SELECT FROM promo_codes` statement:

    <img src="{{ 'images/v21.1/geo-partitioning-sql-latency-after-3.png' | relative_url }}" alt="Geo-partitioning SQL latency" style="max-width:100%" />    

    In the "Logical Plan" area, note the `table = promo_codes@promo_codes_idx_east` scan. This proves that the cost-based optimizer used the leaseholder for that index and, thus, didn't leave the region for the instance of MovR running in US East.

    To validate this behavior in the other regions, click **Statements** again on the left and follow the same steps for the other apps instances.

## Step 10. Test resiliency

There are various resiliency levels in your cluster:

- For the [geo-partitioned data](topology-geo-partitioned-replicas.html#resiliency), each partition is constrained to a specific region and balanced across the 3 AZs in the region, so one AZ can fail per region without interrupting access to the partitions in that region.
- For the [duplicated reference data](topology-duplicate-indexes.html#resiliency), replicas are balanced across regions, so one entire region can fail without interrupting access.

Given that most of the data in your cluster is geo-partitioned, let's focus on AZ-level failure.

1. SSH to the client VM in the US East region.

2. Use the [`cockroach quit`](cockroach-quit.html) command to stop one node, effectively simulating one of the 3 AZ's failing:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --insecure --host=<address of one node in US East>
    ~~~

3. Back in the DB Console, click **Overview** and note that the cluster now considers that node "suspect":

    <img src="{{ 'images/v21.1/geo-partitioning-resiliency-1.png' | relative_url }}" alt="Geo-partitioning resiliency" style="max-width:100%" />    

4. Despite the node being unavailable, the MovR instance in US East continues to make progress because the other 2 nodes, each in a distinct AZ, remain available, and all partitions in the region therefore remain available. To verify this, click **Metrics**, select node 1 or 2 from the **Graph** menu, and check that SQL traffic continues on the node:

    <img src="{{ 'images/v21.1/geo-partitioning-resiliency-2.png' | relative_url }}" alt="Geo-partitioning resiliency" style="max-width:100%" />    

## See also

- Related Topology Patterns
    - [Geo-Partitioned Replicas Topology](topology-geo-partitioned-replicas.html)
    - [Duplicate Indexes Topology](topology-duplicate-indexes.html)

- Related Case Studies
    - [Electronic lock manufacturer](https://www.cockroachlabs.com/case-studies/european-electronic-lock-manufacturer-modernizes-iam-system-with-managed-cockroachdb/)
    - [Multi-national bank](https://www.cockroachlabs.com/case-studies/top-five-multinational-bank-modernizes-its-european-core-banking-services-migrating-from-oracle-to-cockroachdb/)

- [Reads and Writes in CockroachDB](architecture/reads-and-writes-overview.html)
