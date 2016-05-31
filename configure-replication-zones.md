---
title: Configure Replication Zones
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

### Replicaton Zone Format

A replication zone is specified in [YAML](https://en.wikipedia.org/wiki/YAML) format and looks like this:

~~~ yaml
replicas:
- attrs: [comma-separated attribute list]
- attrs: [comma-separated attribute list]
- attrs: [comma-separated attribute list]
range_max_bytes: <size-in-bytes>
~~~

Field | Description
------|------------
`replicas` | The number and location of replicas for the zone. Each `attrs` line equals one replica. See [Node/Replica Recommendations](#nodereplica-recommendations) below. <br><br>It's normal and sufficient to define the number of replicas by listing `attrs` lines without any specific attributes (i.e., `- attrs: []`). But if you do set specific attributes for a replica (i.e., `- attrs: [us-east-1a, ssd]`), the replica will be placed on the nodes/stores with the matching attributes.<br><br>Node-level and store-level attributes are arbitrary strings specified when starting a node. You must match these strings exactly here in order for replication to work as you intend, so be sure to check carefully. See [Start a Node](start-a-node.html) for more details about node and store attributes.<br><br>**Default:** 3 replicas with no specific attributes 
`range_max_bytes` | The maximum size, in bytes, for a range of data in the zone. When a range reaches this size, CockroachDB will spit it into two ranges.<br><br>**Default:** 64MB

Each zone can also contain `range_min_bytes` and `ttlseconds` fields, but the former is not yet implemented and the latter is not yet useful.  

### Node/Replica Recommendations

When running a cluster with more than one node, each replica will be on a different node and a majority of replicas must remain available for the cluster to make progress. Therefore: 

- When running a cluster with more than one node, you should run at least three to ensure that a majority of replicas (2/3) remains available when a node goes down. 

- Configurations with odd numbers of replicas are more robust than those with even numbers. Clusters of three and four nodes can each tolerate one node failure and still reach a quorum (2/3 and 3/4 respectively), so the fourth replica doesn't add any extra fault-tolerance. To survive two simultaneous failures, you must have five replicas.

- When replicating across datacenters, you should use datacenters on a single continent to ensure peformance (cross-continent scenarios will be better supported in the future). If the average network round-trip latency between your datacenters is greater than 100ms, you should adjust the [`raft-tick-interval`](start-a-node.html#flags) flag on each node. 
 
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
$ ./cockroach zone ls <flags>

# View the default replication zone for the cluster:
$ ./cockroach zone get .default <flags>

# View the replication zone for a database:
$ ./cockroach zone get <database> <flags>

# View the replication zone for a table:
$ ./cockroach zone get <database.table> <flags>

# Edit the default replication zone for the cluster:
$ ./cockroach zone set .default <flags> 'YAML content'

# Create/edit the replication zone for a database:
$ ./cockroach zone set <database> <flags> 'YAML content'

# Create/edit the replication zone for a table:
$ ./cockroach zone set <database.table> <flags> 'YAML content'

# Remove the replication zone for a database:
$ ./cockroach zone rm <database> <flags>

# Remove the replication zone for a table:
$ ./cockroach zone rm <database.table> <flags>

# View help:
$ ./cockroach help zone
$ ./cockroach help zone ls
$ ./cockroach help zone get
$ ./cockroach help zone set
$ ./cockroach help zone rm
~~~

## Flags

The `zone` command and subcommands support the following flags, as well as [logging flags](cockroach-commands.html#logging-flags). 

Flag | Description 
-----|------------
`--ca-cert` | The path to the [CA certificate](create-security-certificates.html). This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_CA_CERT`
`--cert` | The path to the [client certificate](create-security-certificates.html). This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_CERT`
`--database`<br>`-d` | Not currently implemented. 
`--host` | The address of the node to connect to. This can be the address of any node in the cluster.<br><br>**Env Variable:** `COCKROACH_HOST`
`--insecure` | Set this only if the cluster is insecure and running on multiple machines.<br><br>If the cluster is insecure and local, leave this out. If the cluster is secure, leave this out and set the `--ca-cert`, `--cert`, and `-key` flags.<br><br>**Env Variable:** `COCKROACH_INSECURE`
`--key` | The path to the [client key](create-security-certificates.html) protecting the client certificate. This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_KEY`
`--port`<br>`-p` | The port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`
`--url` | The connection URL. If you use this flag, do not set any other connection flags.<br><br>For insecure connections, the URL format is: <br>`--url=postgresql://<user>@<host>:<port>/<database>?sslmode=disable`<br><br>For secure connections, the URL format is:<br>`--url=postgresql://<user>@<host>:<port>/<database>`<br>with the following parameters in the query string:<br>`sslcert=<path-to-client-crt>`<br>`sslkey=<path-to-client-key>`<br>`sslmode=verify-full`<br>`sslrootcert=<path-to-ca-crt>`<br><br>**Env Variable:** `COCKROACH_URL` 
`--user`<br>`-u` | The user connecting to the database. Currently, only the `root` user can configure replication zones. <br><br>**Env Variable:** `COCKROACH_USER`<br>**Default:** `root`

## Examples

- [View the Default Replication Zone](#view-the-default-replication-zone)
- [Edit the Default Replication Zone](#edit-the-default-replication-zone)
- [Create a Replication Zone for a Database](#create-a-replication-zone-for-a-database)
- [Create a Replication Zone for a Table](#create-a-replication-zone-for-a-table)

###  View the Default Replication Zone

The cluster-wide replication zone (`.default`) is initially set to replicate data to any three nodes in your cluster, with ranges in each replica splitting once they get larger than 67108864 bytes. 

To view the default replication zone, use the `./cockroach zone get .default` command with appropriate flags as follows:

~~~ shell
$ ./cockroach zone get .default --insecure
.default
replicas:
- attrs: []
- attrs: []
- attrs: []
range_min_bytes: 1048576
range_max_bytes: 67108864
gc:
  ttlseconds: 86400
~~~

### Edit the Default Replication Zone

To edit the default replication zone, use the `./cockroach zone set .default` command with appropriate flags and the YAML changes specified as a string. 

For example, let's say you want to run a three-node cluster across three datacenters, two on the US east coast and one on the US west coast. You want data replicated three times by default, with each replica stored on a specific node in a specific datacenter. So you start each node with the relevant datacenter location specified in the `--attrs` field. 

~~~ shell
# Start node in first US east coast datacenter:
$ ./cockroach start --insecure --host=node1-hostname --attrs=us-east-1a

# Start node in second US east coast datacenter:
$ ./cockroach start --insecure --host=node2-hostname --attrs=us-east-1b --join=node1-hostname:27257

# Start node in US west coast datacenter:
$ ./cockroach start --insecure --host=node3-hostname --attrs=us-west-1a --join=node1-hostname:27257
~~~

You then edit the default zone configuration with one datacenter attribute set for each replica.

~~~ shell
$ ./cockroach zone set .default --insecure 'replicas:
- attrs: [us-east-1a]
- attrs: [us-east-1b]
- attrs: [us-west-1a]'
~~~

The `zone set` command automatically echoes the full zone configuration, so you can easily validate your changes without needing to run `zone get`.

~~~ shell
UPDATE 1
replicas:
- attrs: [us-east-1a]
- attrs: [us-east-1b]
- attrs: [us-west-1a]
range_min_bytes: 1048576
range_max_bytes: 67108864
gc:
  ttlseconds: 86400
~~~

### Create a Replication Zone for a Database

To create a replication zone for a specific database, use the `./cockroach zone set`, specifying the database name, any appropriate flags, and the zone settings as a YAML string. 

For example, let's say you want to run a cluster across five nodes, three of which have ssd storage devices. You want data in the `bank` database replicated to these ssd devices. So when starting the three nodes with these devices, you specify `ssd` as an attribute of the stores, and when starting the other two nodes, you leave the attribute out.

~~~ shell
# Start nodes with ssd storage devices:
$ ./cockroach start --insecure --host=node1-hostname --store=path=node1-data,attr=ssd
$ ./cockroach start --insecure --host=node2-hostname --store=path=node2-data,attr=ssd --join=node1-hostname:27257
$ ./cockroach start --insecure --host=node3-hostname --store=path=node3-data,attr=ssd --join=node1-hostname:27257

# Start nodes without ssd storage devices:
$ ./cockroach start --insecure --host=node4-hostname --store=path=node4-data --join=node1-hostname:27257
$ ./cockroach start --insecure --host=node5-hostname --store=path=node5-data --join=node1-hostname:27257
~~~

You then create a zone configuration for the `bank` database with `ssd` set as the attribute for each replica. 

~~~ shell
$ ./cockroach zone set bank --insecure 'replicas:
- attrs: [ssd]
- attrs: [ssd]
- attrs: [ssd]
range_max_bytes: 67108864'
~~~

The `zone set` command automatically echoes the full zone configuration, so you can easily validate your changes without needing to run `zone get`.

~~~ shell
INSERT 1
replicas:
- attrs: [ssd]
- attrs: [ssd]
- attrs: [ssd]
range_min_bytes: 1048576
range_max_bytes: 67108864
gc:
  ttlseconds: 86400
~~~

### Create a Replication Zone for a Table

To create a replication zone for a specific table, use the `./cockroach zone set`, specifying the table name in `database.table` format, any appropriate flags, and the zone settings as a YAML string. 

For example, let's say you want to run a cluster across five nodes, three of which have ssd storage devices. You want data in the `bank.accounts` table replicated to these ssd devices. So when starting the three nodes with these devices, you specify `ssd` as an attribute of the stores. When starting the other two nodes, you leave the attribute out. 

~~~ shell
# Start nodes with ssd storage devices:
$ ./cockroach start --insecure --host=node1-hostname --store=path=node1-data,attr=ssd
$ ./cockroach start --insecure --host=node2-hostname --store=path=node2-data,attr=ssd --join=node1-hostname:27257
$ ./cockroach start --insecure --host=node3-hostname --store=path=node3-data,attr=ssd --join=node1-hostname:27257

# Start nodes without ssd storage devices:
$ ./cockroach start --insecure --host=node4-hostname --store=path=node4-data --join=node1-hostname:27257
$ ./cockroach start --insecure --host=node5-hostname --store=path=node5-data --join=node1-hostname:27257
~~~

You then create a zone configuration for the `bank.accounts` table with `ssd` set as the attribute for each replica.

~~~ shell
$ ./cockroach zone set bank.accounts --insecure 'replicas:
- attrs: [ssd]
- attrs: [ssd]
- attrs: [ssd]
range_max_bytes: 67108864'
~~~

The `zone set` command automatically echoes the full zone configuration, so you can easily validate your changes without needing to run `zone get`.

~~~ shell
INSERT 1
replicas:
- attrs: [ssd]
- attrs: [ssd]
- attrs: [ssd]
range_min_bytes: 1048576
range_max_bytes: 67108864
gc:
  ttlseconds: 86400
~~~

## See Also

[Other Cockroach Commands](cockroach-commands.html)