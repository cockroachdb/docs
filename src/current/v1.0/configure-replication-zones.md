---
title: Configure Replication Zones
summary: In CockroachDB, you use replication zones to control the number and location of replicas for specific sets of data.
keywords: ttl, time to live, availability zone
toc: true
---

In CockroachDB, you use **replication zones** to control the number and location of replicas for specific sets of data, both when replicas are first added and when they are rebalanced to maintain cluster equilibrium. Initially, there is a single, default replication zone for the entire cluster. You can adjust this default zone as well as add zones for individual databases and tables as needed. For example, you might use the default zone to replicate most data in a cluster normally within a single datacenter, while creating a specific zone to more highly replicate a certain database or table across multiple datacenters and geographies.

This page explains how replication zones work and how to use the `cockroach zone` [command](cockroach-commands.html) to configure them.

{{site.data.alerts.callout_info}}Currently, only the <code>root</code> user can configure replication zones.{{site.data.alerts.end}}


## Overview

### Replication Zone Levels

There are three replication zone levels:

- **Cluster:** CockroachDB comes with a single, default replication zone for the entire cluster. See [View the Default Replication Zone](#view-the-default-replication-zone) and [Edit the Default Replication Zone](#edit-the-default-replication-zone) for more details.
- **Database:** You can add replication zones for specific databases. See [Create a Replication Zone for a Database](#create-a-replication-zone-for-a-database) for more details.
- **Table:** You can add replication zones for specific tables. See [Create a Replication Zone for a Table](#create-a-replication-zone-for-a-table) for more details.

When replicating a piece of data, CockroachDB uses the most granular zone available: If there's a replication zone for the table containing the data, CockroachDB uses it; otherwise, it uses the replication zone for the database containing the data. If there's no applicable table or database replication zone, CockroachDB uses the cluster-wide replication zone.

In addition to the databases and tables that are visible via SQL, CockroachDB stores additional internal data in what are called system ranges. You can configure replication zones for parts of these internal data ranges if you'd like to override the cluster-wide settings. See [Create a Replication Zone for System Ranges](#create-a-replication-zone-for-system-ranges) for more details.

### Replication Zone Format

A replication zone is specified in [YAML](https://en.wikipedia.org/wiki/YAML) format and looks like this:

~~~ yaml
range_min_bytes: <size-in-bytes>
range_max_bytes: <size-in-bytes>
gc:
  ttlseconds: <time-in-seconds>
num_replicas: <number-of-replicas>
constraints: [comma-separated constraint list]
~~~

Field | Description
------|------------
`range_min_bytes` | Not yet implemented.
`range_max_bytes` | The maximum size, in bytes, for a range of data in the zone. When a range reaches this size, CockroachDB will split it into two ranges.<br><br>**Default:** `67108864` (64MiB)
`ttlseconds` | The number of seconds overwritten values will be retained before garbage collection. Smaller values can save disk space if values are frequently overwritten; larger values increase the range allowed for `AS OF SYSTEM TIME` queries, also know as [Time Travel Queries](select.html#select-historical-data-time-travel).<br><br>It is not recommended to set this below `600` (10 minutes); doing so will cause problems for long-running queries. Also, since all versions of a row are stored in a single range that never splits, it is not recommended to set this so high that all the changes to a row in that time period could add up to more than 64MiB; such oversized ranges could contribute to the server running out of memory or other problems.<br><br>**Default:** `86400` (24 hours)
`num_replicas` | The number of replicas in the zone.<br><br>**Default:** `3`
`constraints` | A comma-separated list of required and/or prohibited constraints influencing the location of replicas. See [Constraints in Replication Zones](#constraints-in-replication-zones) for more details.<br><br>**Default:** No constraints, with CockroachDB locating each replica on a unique node and attempting to spread replicas evenly across localities.

### Replication Constraints

The location of replicas, both when they are first added and when they are rebalanced to maintain cluster equilibrium, is based on the interplay between descriptive attributes assigned to nodes and constraints set in zone configurations.

{{site.data.alerts.callout_success}}For demonstrations of how to set node attributes and replication constraints in different scenarios, see <a href="#scenario-based-examples">Scenario-based Examples</a> below.{{site.data.alerts.end}}

#### Descriptive Attributes Assigned to Nodes

When starting a node with the [`cockroach start`](start-a-node.html) command, you can assign the following types of descriptive attributes:

Attribute Type | Description
---------------|------------
**Node Locality** | Using the `--locality` flag, you can assign arbitrary key-value pairs that describe the locality of the node. Locality might include country, region, datacenter, rack, etc. CockroachDB attempts to spread replicas evenly across the cluster based on locality.<br><br>The key-value pairs should be ordered from most inclusive to least inclusive. For example, a country locality should be specified before datacenter, which should in turn be specified before rack. Also, the keys and the order of key-value pairs must be the same on all nodes, and it's typically better to include more pairs than fewer. For example:<br><br>`--locality=region=east,datacenter=us-east-1`<br>`--locality=region=east,datacenter=us-east-2`<br>`--locality=region=west,datacenter=us-west-1`
**Node Capability** | Using the `--attrs` flag, you can specify node capability, which might include specialized hardware or number of cores, for example:<br><br>`--attrs=ram:64gb`
**Store Type/Capability** | Using the `attrs` field of the `--store` flag, you can specify disk type or capability, for example:<br><br>`--store=path=/mnt/ssd01,attrs=ssd`<br>`--store=path=/mnt/hda1,attrs=hdd:7200rpm`

#### Constraints in Replication Zones

The node-level and store-level descriptive attributes mentioned above can be used as the following types of constraints in replication zones to influence the location of replicas. However, note the following general guidance:

- When locality is the only consideration for replication, it's recommended to set locality on nodes without specifying any constraints in zone configurations. In the absence of constraints, CockroachDB attempts to spread replicas evenly across the cluster based on locality.
- Required and prohibited constraints are useful in special situations where, for example, data must or must not be stored in a specific country or on a specific type of machine.

Constraint Type | Description | Syntax
----------------|-------------|-------
**Required** | When placing replicas, the cluster will consider only nodes/stores with matching attributes. When there are no matching nodes/stores with capacity, new replicas will not be added. | `[+ssd]`
**Prohibited** | When placing replicas, the cluster will ignore nodes/stores with matching attributes. When there are no alternate nodes/stores with capacity, new replicas will not be added. | `[-ssd]`

### Node/Replica Recommendations

See [Cluster Topography](recommended-production-settings.html#cluster-topology) recommendations for production deployments.

## Subcommands

Subcommand | Usage
-----------|------
`ls` | List all replication zones.
`get` | View the YAML contents of a replication zone.
`set` | Create or edit a replication zone.
`rm` | Remove a replication zone.

## Synopsis

~~~ shell
# List all replication zones:
$ cockroach zone ls <flags>

# View the default replication zone for the cluster:
$ cockroach zone get .default <flags>

# View the replication zone for a database:
$ cockroach zone get <database> <flags>

# View the replication zone for a table:
$ cockroach zone get <database.table> <flags>

# Edit the default replication zone for the cluster:
$ cockroach zone set .default --file=<zone-content.yaml> <flags>

# Create/edit the replication zone for a database:
$ cockroach zone set <database> --file=<zone-conent.yaml> <flags>

# Create/edit the replication zone for a table:
$ cockroach zone set <database.table> --file=<zone-content.yaml> <flags>

# Remove the replication zone for a database:
$ cockroach zone rm <database> <flags>

# Remove the replication zone for a table:
$ cockroach zone rm <database.table> <flags>

# View help:
$ cockroach zone --help
$ cockroach zone ls --help
$ cockroach zone get --help
$ cockroach zone set --help
$ cockroach zone rm --help
~~~

## Flags

The `zone` command and subcommands support the following [general-use](#general) and [logging](#logging) flags.

### General

Flag | Description
-----|------------
`--certs-dir` | The path to the [certificate directory](create-security-certificates.html). The directory must contain valid certificates if running in secure mode.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--database`<br>`-d` | Not currently implemented.
`--disable-replication` | Disable replication in the zone by setting the zone's replica count to 1. This is equivalent to setting `num_replicas: 1`.
`--file`<br>`-f` | The path to the [YAML file](#replication-zone-format) defining the zone configuration. To pass the zone configuration via the standard input, set this flag to `-`.<br><br>This flag is relevant only for the `set` subcommand.
`--host` | The server host to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** `localhost`
`--insecure` | Run in insecure mode. If this flag is not set, the `--certs-dir` flag must point to valid certificates.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--port`<br>`-p` | The server port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`
`--url` | The connection URL. If you use this flag, do not set any other connection flags.<br><br>For insecure connections, the URL format is: <br>`--url=postgresql://<user>@<host>:<port>/<database>?sslmode=disable`<br><br>For secure connections, the URL format is:<br>`--url=postgresql://<user>@<host>:<port>/<database>`<br>with the following parameters in the query string:<br>`sslcert=<path-to-client-crt>`<br>`sslkey=<path-to-client-key>`<br>`sslmode=verify-full`<br>`sslrootcert=<path-to-ca-crt>`<br><br>**Env Variable:** `COCKROACH_URL`
`--user`<br>`-u` | The user connecting to the database. Currently, only the `root` user can configure replication zones. <br><br>**Env Variable:** `COCKROACH_USER`<br>**Default:** `root`

### Logging

By default, the `zone` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

## Basic Examples

These examples focus on the basic approach and syntax for working with zone configuration. For examples demonstrating how to use constraints, see [Scenario-based Examples](#scenario-based-examples).

###  View the Default Replication Zone

The cluster-wide replication zone (`.default`) is initially set to replicate data to any three nodes in your cluster, with ranges in each replica splitting once they get larger than 67108864 bytes.

To view the default replication zone, use the `cockroach zone get .default` command with appropriate flags:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach zone get .default --insecure
~~~

~~~
.default
range_min_bytes: 1048576
range_max_bytes: 67108864
gc:
  ttlseconds: 86400
num_replicas: 3
constraints: []
~~~

### Edit the Default Replication Zone

To edit the default replication zone, create a YAML file defining only the values you want to change (other values will not be affected), and use the `cockroach zone set .default -f <file.yaml>` command with appropriate flags:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cat default_update.yaml
~~~

~~~
num_replicas: 5
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach zone set .default --insecure -f default_update.yaml
~~~

~~~
range_min_bytes: 1048576
range_max_bytes: 67108864
gc:
  ttlseconds: 86400
num_replicas: 5
constraints: []
~~~

Alternately, you can pass the YAML content via the standard input:

{% include_cached copy-clipboard.html %}
~~~ shell
$ echo 'num_replicas: 5' | cockroach zone set .default --insecure -f -
~~~

### Create a Replication Zone for a Database

To control replication for a specific database, create a YAML file defining only the values you want to change (other values will not be affected), and use the `cockroach zone set <database> -f <file.yaml>` command with appropriate flags:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cat database_zone.yaml
~~~

~~~
num_replicas: 7
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach zone set db1 --insecure -f database_zone.yaml
~~~

~~~
range_min_bytes: 1048576
range_max_bytes: 67108864
gc:
  ttlseconds: 86400
num_replicas: 5
constraints: []
~~~

Alternately, you can pass the YAML content via the standard input:

{% include_cached copy-clipboard.html %}
~~~ shell
$ echo 'num_replicas: 5' | cockroach zone set db1 --insecure -f -
~~~

### Create a Replication Zone for a Table

To control replication for a specific table, create a YAML file defining only the values you want to change (other values will not be affected), and use the `cockroach zone set <database.table> -f <file.yaml>` command with appropriate flags:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cat table_zone.yaml
~~~

~~~
num_replicas: 7
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach zone set db1.t1 --insecure -f table_zone.yaml
~~~

~~~
range_min_bytes: 1048576
range_max_bytes: 67108864
gc:
  ttlseconds: 86400
num_replicas: 7
constraints: []
~~~

Alternately, you can pass the YAML content via the standard input:

{% include_cached copy-clipboard.html %}
~~~ shell
$ echo 'num_replicas: 7' | cockroach zone set db1.t1 --insecure -f -
~~~

### Create a Replication Zone for System Ranges

In addition to the databases and tables that are visible via the SQL interface, CockroachDB stores additional data in what are called system ranges. There are three categories of system ranges for which replication zones can be set:

Zone Name | Description
----------|------------
**.meta** | The "meta" ranges contain the authoritative information about the location of all data in the cluster. If your cluster is running in multiple datacenters, it's a best practice to configure the meta ranges to have a copy in each datacenter.
**.system** | The ".system" zone config controls the replication of a variety of important internal data, including information needed to allocate new table IDs and track the health of a cluster's nodes.
**.timeseries** | The "timeseries" ranges contain monitoring data about the cluster that powers the graphs in CockroachDB's admin UI.

To control replication for one of the above sets of system ranges, create a YAML file defining only the values you want to change (other values will not be affected), and use the `cockroach zone set <zone-name> -f <file.yaml>` command with appropriate flags:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cat meta_zone.yaml
~~~

~~~
num_replicas: 7
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach zone set .meta --insecure -f meta_zone.yaml
~~~

~~~
range_min_bytes: 1048576
range_max_bytes: 67108864
gc:
  ttlseconds: 86400
num_replicas: 7
constraints: []
~~~

Alternately, you can pass the YAML content via the standard input:

{% include_cached copy-clipboard.html %}
~~~ shell
$ echo 'num_replicas: 7' | cockroach zone set .meta --insecure -f -
~~~

## Scenario-based Examples

### Even Replication Across Datacenters

**Scenario:**

- You have 6 nodes across 3 datacenters, 2 nodes in each datacenter.
- You want data replicated 3 times, with replicas balanced evenly across all three datacenters.

**Approach:**

Start each node with its datacenter location specified in the `--locality` flag:

~~~ shell
# Start the two nodes in datacenter 1:
$ cockroach start --insecure --host=<node1 hostname> --locality=datacenter=us-1
$ cockroach start --insecure --host=<node2 hostname> --locality=datacenter=us-1 \
--join=<node1 hostname>:26257

# Start the two nodes in datacenter 2:
$ cockroach start --insecure --host=<node3 hostname> --locality=datacenter=us-2 \
--join=<node1 hostname>:26257
$ cockroach start --insecure --host=<node4 hostname> --locality=datacenter=us-2 \
--join=<node1 hostname>:26257

# Start the two nodes in datacenter 3:
$ cockroach start --insecure --host=<node5 hostname> --locality=datacenter=us-3 \
--join=<node1 hostname>:26257
$ cockroach start --insecure --host=<node6 hostname> --locality=datacenter=us-3 \
--join=<node1 hostname>:26257
~~~

There's no need to make zone configuration changes; by default, the cluster is configured to replicate data three times, and even without explicit constraints, the cluster will aim to diversify replicas across node localities.

### Multiple Applications Writing to Different Databases

**Scenario:**

- You have 2 independent applications connected to the same CockroachDB cluster, each application using a distinct database.
- You have 6 nodes across 2 datacenters, 3 nodes in each datacenter.
- You want the data for application 1 to be replicated 5 times, with replicas evenly balanced across both datacenters.
- You want the data for application 2 to be replicated 3 times, with all replicas in a single datacenter.

**Approach:**

1. Start each node with its datacenter location specified in the `--locality` flag:

    ~~~ shell
    # Start the three nodes in datacenter 1:
    $ cockroach start --insecure --host=<node1 hostname> --locality=datacenter=us-1
    $ cockroach start --insecure --host=<node2 hostname> --locality=datacenter=us-1 \
    --join=<node1 hostname>:26257
    $ cockroach start --insecure --host=<node3 hostname> --locality=datacenter=us-1 \
    --join=<node1 hostname>:26257

    # Start the three nodes in datacenter 2:
    $ cockroach start --insecure --host=<node4 hostname> --locality=datacenter=us-2 \
    --join=<node1 hostname>:26257
    $ cockroach start --insecure --host=<node5 hostname> --locality=datacenter=us-2 \
    --join=<node1 hostname>:26257
    $ cockroach start --insecure --host=<node6 hostname> --locality=datacenter=us-2 \
    --join=<node1 hostname>:26257
    ~~~

2. On any node, configure a replication zone for the database used by application 1:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # Create a YAML file with the replica count set to 5:
    $ cat app1_zone.yaml
    ~~~

    ~~~
    num_replicas: 5
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # Apply the replication zone to the database used by application 1:
    $ cockroach zone set app1_db --insecure -f app1_zone.yaml
    ~~~

    ~~~
    range_min_bytes: 1048576
    range_max_bytes: 67108864
    gc:
      ttlseconds: 86400
    num_replicas: 5
    constraints: []
    ~~~
    Nothing else is necessary for application 1's data. Since all nodes specify their datacenter locality, the cluster will aim to balance the data in the database used by application 1 between datacenters 1 and 2.

3. On any node, configure a replication zone for the database used by application 2:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # Create a YAML file with 1 datacenter as a required constraint:
    $ cat app2_zone.yaml
    ~~~

    ~~~
    constraints: [+datacenter=us-2]
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # Apply the replication zone to the database used by application 2:
    $ cockroach zone set app2_db --insecure -f app2_zone.yaml
    ~~~

    ~~~
    range_min_bytes: 1048576
    range_max_bytes: 67108864
    gc:
     ttlseconds: 86400
    num_replicas: 3
    constraints: [+datacenter=us-2]
    ~~~
    The required constraint will force application 2's data to be replicated only within the `us-2` datacenter.

### Stricter Replication for a Specific Table

**Scenario:**

- You have 7 nodes, 5 with SSD drives and 2 with HDD drives.
- You want data replicated 3 times by default.
- Speed and availability are important for a specific table that is queried very frequently, however, so you want the data in that table to be replicated 5 times, preferably on nodes with SSD drives.

**Approach:**

1. Start each node with `ssd` or `hdd` specified as store attributes:

    ~~~ shell
    # Start the 5 nodes with SSD storage:
    $ cockroach start --insecure --host=<node1 hostname> --store=path=node1,attrs=ssd
    $ cockroach start --insecure --host=<node2 hostname> --store=path=node2,attrs=ssd \
    --join=<node1 hostname>:26257
    $ cockroach start --insecure --host=<node3 hostname> --store=path=node3,attrs=ssd \
    --join=<node1 hostname>:26257
    $ cockroach start --insecure --host=<node4 hostname> --store=path=node4,attrs=ssd \
    --join=<node1 hostname>:26257
    $ cockroach start --insecure --host=<node5 hostname> --store=path=node5,attrs=ssd \
    --join=<node1 hostname>:26257

    # Start the 2 nodes with HDD storage:
    $ cockroach start --insecure --host=<node6 hostname> --store=path=node6,attrs=hdd \
    --join=<node1 hostname>:26257
    $ cockroach start --insecure --host=<node7 hostname> --store=path=node2,attrs=hdd \
    --join=<node1 hostname>:26257
    ~~~

2. On any node, configure a replication zone for the table that must be replicated more strictly:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # Create a YAML file with the replica count set to 5
    # and the ssd attribute as a required constraint:
    $ cat table_zone.yaml
    ~~~

    ~~~
    num_replicas: 5
    constraints: [+ssd]
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # Apply the replication zone to the table:
    $ cockroach zone set db.important_table --insecure -f table_zone.yaml
    ~~~

    ~~~
    range_min_bytes: 1048576
    range_max_bytes: 67108864
    gc:
     ttlseconds: 86400
    num_replicas: 5
    constraints: [+ssd]
    ~~~
    Data in the table will be replicated 5 times, and the required constraint will place data in the table on nodes with `ssd` drives.

### Tweaking the Replication of System Ranges

**Scenario:**

- You have nodes spread across 7 datacenters.
- You want data replicated 5 times by default.
- For better performance, you want a copy of the meta ranges in all of the datacenters.
- To save disk space, you only want the internal timeseries data replicated 3 times by default.

**Approach:**

1. Start each node with a different locality attribute:

   ~~~ shell
   $ cockroach start --insecure --host=<node1 hostname> --locality=datacenter=us-1
   $ cockroach start --insecure --host=<node2 hostname> --locality=datacenter=us-2 \
   --join=<node1 hostname>:26257
   $ cockroach start --insecure --host=<node3 hostname> --locality=datacenter=us-3 \
   --join=<node1 hostname>:26257
   $ cockroach start --insecure --host=<node4 hostname> --locality=datacenter=us-4 \
   --join=<node1 hostname>:26257
   $ cockroach start --insecure --host=<node5 hostname> --locality=datacenter=us-5 \
   --join=<node1 hostname>:26257
   $ cockroach start --insecure --host=<node6 hostname> --locality=datacenter=us-6 \
   --join=<node1 hostname>:26257
   $ cockroach start --insecure --host=<node7 hostname> --locality=datacenter=us-7 \
   --join=<node1 hostname>:26257
   ~~~

2. On any node, configure the default replication zone:

    {% include_cached copy-clipboard.html %}
   ~~~ shell
   echo 'num_replicas: 5' | cockroach zone set .default --insecure -f -
   ~~~

   ~~~
   range_min_bytes: 1048576
   range_max_bytes: 67108864
   gc:
     ttlseconds: 86400
   num_replicas: 5
   constraints: []
   ~~~

   All data in the cluster will be replicated 5 times, including both SQL data and the internal system data.

3. On any node, configure the `.meta` replication zone:

    {% include_cached copy-clipboard.html %}
   ~~~ shell
   echo 'num_replicas: 7' | cockroach zone set .meta --insecure -f -
   ~~~

   ~~~
   range_min_bytes: 1048576
   range_max_bytes: 67108864
   gc:
     ttlseconds: 86400
   num_replicas: 7
   constraints: []
   ~~~

   The `.meta` addressing ranges will be replicated such that one copy is in all 7 datacenters, while all other data will be replicated 5 times.

4. On any node, configure the `.timeseries` replication zone:

    {% include_cached copy-clipboard.html %}
   ~~~ shell
   echo 'num_replicas: 3' | cockroach zone set .timeseries --insecure -f -
   ~~~

   ~~~
   range_min_bytes: 1048576
   range_max_bytes: 67108864
   gc:
     ttlseconds: 86400
   num_replicas: 7
   constraints: []
   ~~~

   The timeseries data will only be replicated 3 times without affecting the configuration of all other data.

## See Also

[Other Cockroach Commands](cockroach-commands.html)
