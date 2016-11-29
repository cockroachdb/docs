---
title: Configure Replication Zones
summary: In CockroachDB, you use replication zones to control the number and location of replicas for specific sets of data.
keywords: ttl, time to live, availability zone
toc: false
---

In CockroachDB, you use **replication zones** to control the number and location of replicas for specific sets of data. Initially, there is a single, default replication zone for the entire cluster. You can adjust this default zone as well as add zones for individual databases and tables as needed. For example, you might use the default zone to replicate most data in a cluster normally within a single datacenter, while creating a specific zone to more highly replicate a certain database or table across multiple datacenters and geographies.

This page explains how replication zones work and how to use the `cockroach zone` [command](cockroach-commands.html) to configure them.

{{site.data.alerts.callout_info}}Currently, only the <code>root</code> user can configure replication zones.{{site.data.alerts.end}}   

<div id="toc"></div>

## Overview

### Replication Zone Levels

There are three replication zone levels:

- **Cluster:** CockroachDB comes with a single, default replication zone for the entire cluster. See [View the Default Replication Zone](#view-the-default-replication-zone) and [Edit the Default Replication Zone](#edit-the-default-replication-zone) for more details.
- **Database:** You can add replication zones for specific databases. See [Create a Replication Zone for a Database](#create-a-replication-zone-for-a-database) for more details.
- **Table:** You can add replication zones for specific tables. See [Create a Replication Zone for a Table](#create-a-replication-zone-for-a-table) for more details.

When replicating a piece of data, CockroachDB uses the most granular zone available: If there's a replication zone for the table containing the data, CockroachDB uses it; otherwise, it uses the replication zone for the database containing the data. If there's no applicable table or database replication zone, CockroachDB uses the cluster-wide replication zone. 

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
`range_max_bytes` | The maximum size, in bytes, for a range of data in the zone. When a range reaches this size, CockroachDB will spit it into two ranges.<br><br>**Default:** `67108864` (64MB)
`ttlseconds` | The number of seconds overwritten values will be retained before garbage collection. Smaller values can save disk space if values are frequently overwritten; larger values increase the range allowed for `AS OF SYSTEM TIME` queries. It is not recommended to set this below `600` (10 minutes).<br><br>**Default:** `86400` (24 hours)
`num_replicas` | The number of replicas in the zone.<br><br>**Default:** `3` 
`constraints` | A comma-separated list of attributes from nodes and/or stores where replicas should be located.<br><br>Node-level and store-level attributes are arbitrary strings specified when starting a node. You must match these strings exactly here in order for replication to work as you intend, so be sure to check carefully. See [Start a Node](start-a-node.html) for more details about node and store attributes.<br><br>**Default:** No constraints, with CockroachDB locating each replica on a unique node

### Node/Replica Recommendations

When running a cluster with more than one node, each replica will be on a different node and a majority of replicas must remain available for the cluster to make progress. Therefore: 

- When running a cluster with more than one node, you should run at least three to ensure that a majority of replicas (2/3) remains available when a node goes down. 

- Configurations with odd numbers of replicas are more robust than those with even numbers. Clusters of three and four nodes can each tolerate one node failure and still reach a quorum (2/3 and 3/4 respectively), so the fourth replica doesn't add any extra fault-tolerance. To survive two simultaneous failures, you must have five replicas.

- When replicating across datacenters, you should use datacenters on a single continent to ensure peformance (cross-continent scenarios will be better supported in the future). If the average network round-trip latency between your datacenters is greater than 200ms, you should adjust the [`raft-tick-interval`](start-a-node.html#flags) flag on each node. 
 
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

The `zone` command and subcommands support the following flags, as well as [logging flags](cockroach-commands.html#logging-flags). 

Flag | Description 
-----|------------
`--ca-cert` | The path to the [CA certificate](create-security-certificates.html). This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_CA_CERT`
`--cert` | The path to the [client certificate](create-security-certificates.html). This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_CERT`
`--database`<br>`-d` | Not currently implemented. 
`--disable-replication` | Disable replication in the zone by setting the zone's replica count to 1. This is equivalent to setting `num_replicas: 1`.
`--file`<br>`-f` | The path to the [YAML file](#replication-zone-format) defining the zone configuration. To pass the zone configuration via the standard input, set this flag to `-`.<br><br>This flag is relevant only for the `set` subcommand.
`--host` | The server host to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** `localhost`
`--insecure` | Set this only if the cluster is insecure and running on multiple machines.<br><br>If the cluster is insecure and local, leave this out. If the cluster is secure, leave this out and set the `--ca-cert`, `--cert`, and `-key` flags.<br><br>**Env Variable:** `COCKROACH_INSECURE`
`--key` | The path to the [client key](create-security-certificates.html) protecting the client certificate. This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_KEY`
`--port`<br>`-p` | The server port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`
`--url` | The connection URL. If you use this flag, do not set any other connection flags.<br><br>For insecure connections, the URL format is: <br>`--url=postgresql://<user>@<host>:<port>/<database>?sslmode=disable`<br><br>For secure connections, the URL format is:<br>`--url=postgresql://<user>@<host>:<port>/<database>`<br>with the following parameters in the query string:<br>`sslcert=<path-to-client-crt>`<br>`sslkey=<path-to-client-key>`<br>`sslmode=verify-full`<br>`sslrootcert=<path-to-ca-crt>`<br><br>**Env Variable:** `COCKROACH_URL` 
`--user`<br>`-u` | The user connecting to the database. Currently, only the `root` user can configure replication zones. <br><br>**Env Variable:** `COCKROACH_USER`<br>**Default:** `root`

## Examples

- [View the Default Replication Zone](#view-the-default-replication-zone)
- [Edit the Default Replication Zone](#edit-the-default-replication-zone)
- [Create a Replication Zone for a Database](#create-a-replication-zone-for-a-database)
- [Create a Replication Zone for a Table](#create-a-replication-zone-for-a-table)

###  View the Default Replication Zone

The cluster-wide replication zone (`.default`) is initially set to replicate data to any three nodes in your cluster, with ranges in each replica splitting once they get larger than 67108864 bytes. 

To view the default replication zone, use the `cockroach zone get .default` command with appropriate flags:

~~~ shell
$ cockroach zone get .default
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

Let's say you want to run a three-node cluster across three datacenters, two on the US east coast and one on the US west coast. You want data replicated three times by default, with each replica stored on a specific node in a specific datacenter. 

1. Start each node with the relevant datacenter location specified in the `--attrs` field: 

   ~~~ shell
   # Start node in first US east coast datacenter:
   $ cockroach start --host=node1-hostname --attrs=us-east-1a

   # Start node in second US east coast datacenter:
   $ cockroach start --host=node2-hostname --attrs=us-east-1b --join=node1-hostname:27257

   # Start node in US west coast datacenter:
   $ cockroach start --host=node3-hostname --attrs=us-west-1a --join=node1-hostname:27257
   ~~~

2. Create a YAML file with the node attributes listed as constraints:

   ~~~ shell
   $ cat default_update.yaml
   ~~~

   ~~~
   constraints: [us-west-1a, us-east-1b, us-west-1a]
   ~~~

3. Use the file to update the default zone configuration:
 
   ~~~ shell
   $ cockroach zone set .default -f default_update.yaml
   ~~~

   ~~~
   range_min_bytes: 1048576
   range_max_bytes: 67108864
   gc:
     ttlseconds: 86400
   num_replicas: 3
   constraints: [us-west-1a, us-east-1b, us-west-1a]
   ~~~

   Alternately, you can pass the YAML content via the standard input:

   ~~~ shell
   $ echo 'constraints: [us-west-1a, us-east-1b, us-west-1a]' | cockroach zone set .default -f -
   ~~~

### Create a Replication Zone for a Database

Let's say you want to run a cluster across five nodes, three of which have ssd storage devices. You want data in the `bank` database replicated to these ssd devices. 

1. When starting the three nodes that have ssd storage, specify `ssd` as an attribute of the stores, and when starting the other two nodes, leave the attribute out:

   ~~~ shell
   # Start nodes with ssd storage:
   $ cockroach start --insecure --host=node1-hostname --store=path=node1-data,attrs=ssd
   $ cockroach start --insecure --host=node2-hostname --store=path=node2-data,attrs=ssd --join=node1-hostname:27257
   $ cockroach start --insecure --host=node3-hostname --store=path=node3-data,attrs=ssd --join=node1-hostname:27257

   # Start nodes without ssd storage:
   $ cockroach start --insecure --host=node4-hostname --store=path=node4-data --join=node1-hostname:27257
   $ cockroach start --insecure --host=node5-hostname --store=path=node5-data --join=node1-hostname:27257
   ~~~

2. Create a YAML file with the `ssd` attribute listed as a constraint:

   ~~~ shell
   $ cat bank_zone.yaml
   ~~~

   ~~~
   constraints: [ssd]
   ~~~

3. Use the file to update the zone configuration for the `bank` database:

   ~~~ shell
   $ cockroach zone set bank -f bank_zone.yaml
   ~~~

   ~~~
   range_min_bytes: 1048576
   range_max_bytes: 67108864
   gc:
     ttlseconds: 86400
   num_replicas: 3
   constraints: [ssd]
   ~~~

   Alternately, you can pass the YAML content via the standard input:

   ~~~ shell
   $ echo 'constraints: [ssd]' | cockroach zone set bank -f -
   ~~~

### Create a Replication Zone for a Table

Let's say you want to run a cluster across five nodes, three of which have ssd storage devices. You want data in the `bank.accounts` table replicated to these ssd devices. 

1. When starting the three nodes that have ssd storage, specify `ssd` as an attribute of the stores, and when starting the other two nodes, leave the attribute out: 

   ~~~ shell
   # Start nodes with ssd storage:
   $ cockroach start --insecure --host=node1-hostname --store=path=node1-data,attrs=ssd
   $ cockroach start --insecure --host=node2-hostname --store=path=node2-data,attrs=ssd --join=node1-hostname:27257
   $ cockroach start --insecure --host=node3-hostname --store=path=node3-data,attrs=ssd --join=node1-hostname:27257

   # Start nodes without ssd storage:
   $ cockroach start --insecure --host=node4-hostname --store=path=node4-data --join=node1-hostname:27257
   $ cockroach start --insecure --host=node5-hostname --store=path=node5-data --join=node1-hostname:27257
   ~~~

2. Create a YAML file with the `ssd` attribute listed as a constraint:

   ~~~ shell
   $ cat accounts_zone.yaml
   ~~~

   ~~~
   constraints: [ssd]
   ~~~

3. Use the file to update the zone configuration for the `bank` database:

   ~~~ shell
   $ cockroach zone set bank.accounts -f accounts_zone.yaml
   ~~~

   ~~~
   range_min_bytes: 1048576
   range_max_bytes: 67108864
   gc:
     ttlseconds: 86400
   num_replicas: 3
   constraints: [ssd]
   ~~~

   Alternately, you can pass the YAML content via the standard input:

   ~~~ shell
   $ echo 'constraints: [ssd]' | cockroach zone set bank.accounts -f -
   ~~~

## See Also

[Other Cockroach Commands](cockroach-commands.html)