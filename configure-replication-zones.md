---
title: Configure Replication Zones
toc: false
---

In CockroachDB, a replication zone is a [YAML](https://en.wikipedia.org/wiki/YAML) file that controls how a specific set of data gets replicated. Initially, there is a single replication zone for the entire cluster, but you can add replication zones for individual databases and tables as well. For example, you might decide that most data in a cluster can be replicated normally (say, three times) within a single datacenter, while data in a certain database or in certain tables must be more highly replicated across multiple datacenters and geographies.

This page explains how replication zones work and how to use the `cockroach zone` commands to configure them. 

<div id="toc"></div>

## Overview

### Replication Zone Levels

There are three replication zone levels:

- **Cluster:** CockroachDB comes with a single, default replication zone for the entire cluster.
- **Database:** You can add replication zones for specific databases.
- **Table:** You can add replication zones for specific tables. 

When replicating a piece of data, if there's a replication zone for the table containing the data, CockroachDB uses it; otherwise, it uses a replication zone for the database containing the data. If there's no applicable table or database replication zone, CockroachDB uses the cluster-wide replication zone. 

### Default Replication Zone

The cluster-wide replication zone (`.default`) is initially set to replicate data 3 times, with ranges in each replica splitting into new ranges after XXXX bytes. You can edit the default replication zone to replicate more or less or to split ranges at smaller or larger sizes (see xxx example below). 

### Format

Each replication zone is a [YAML](https://en.wikipedia.org/wiki/YAML) file that looks like this:

~~~ yaml
replicas:
  - attrs: [comma-separated attribute list]
  - attrs: [comma-separated attribute list]
  - attrs: ...
range_min_bytes: <size-in-bytes>
range_max_bytes: <size-in-bytes>
~~~

Field | Description
------|------------
`replicas` | 

Each `attrs` entry in the `replicas` field is a single replica for the zone.

This default replication zone is set to replicate all data 3 times, with ranges in each replica splitting into new ranges after XXXX bytes. You can edit the default replication zone to replicate more or less or to split ranges are smaller or larger sizes (see xxx example below). 

## Subcommands

Subcommand | Usage 
-----------|------
`get` | Create the self-signed CA certificate and key for the entire cluster.
`ls` | Create a certificate and key for a specific node in the cluster. You specify all addresses at which the node can be reached and pass appropriate flags.
`rm` | Create a certificate and key for a specific user accessing the cluster from a client. You specify the username of the user who will use the certificate and pass appropriate flags.  
`set` | Create a certificate and key for a specific user accessing the cluster from a client. You specify the username of the user who will use the certificate and pass appropriate flags.  

## Synopsis

~~~ shell

# Edit the default replication zone for the entire cluster:
$ ./cockroach zone set .default <flags> <YAML content>

# Create/edit the replication zone for a database:
$ ./cockroach zone set <database> <flags> <YAML content>

# Create/edit the replication zone for a table:
$ ./cockroach zone set <database.table> <flags> <YAML content>

# View the default replication zone for the entire cluster:
$ ./cockroach zone get .default <flags>

# View the replicaiton zone for a database:
$ ./cockroach zone get <database> <flags>

# View the replication zone for a table:
$ ./cockroach zone get <database.table> <flags>

# List all replication zones:
$ ./cockroach zone ls <flags>

# Remove the replication zone for a database:
$ ./cockroach zone rm <database> <flags>

# Remove the replication zone for a table:
$ ./cockroach zone rm <database.table> <flags>

# View help:
$ ./cockroach help zone
$ ./cockroach help zone get
$ ./cockroach help zone ls
$ ./cockroach help zone rm
$ ./cockroach help zone set
~~~

## Flags

The `cert` command and subcommands support the following flags, as well as [logging flags](cockroach-commands.html#logging-flags). 

Flag | Description
-----|------------
`--ca-cert` | The path to the CA certificate. <br><br>This flag is required for all subcommands. When used with `create-ca` in particular, this flag defines where to create the certificate and what to call it; the specified directory must exist. 
`--ca-key` | The path to the private key protecting the CA certificate. <br><br>This flag is required for all subcommands. When used with `create-ca` in particular, it defines where to create the certificate and what to call it; the specified directory must exist. 
`--cert` | The path to the node or client certificate. <br><br>This flag is used only with the `create-node` and `create-client` subcommands. It defines where to create the node or client certificate and what to call it; the specified directory must exist.  
`--key` | The path to the private key protecting the node or client certificate. <br><br>This flag is used only with the `create-node` and `create-client` subcommands. It defines where to create the node or client key and what to call it; the specified directory must exist.
`--key-size` | The size of the CA, node, or client key, in bits.<br><br>**Default:** 2048 

## Examples

#### Create the CA certificate and key

~~~ shell
$ ./cockroach cert create-ca --ca-cert=certs/ca.cert --ca-key=certs/ca.key 
~~~

#### Create the certificate and key for a node

~~~ shell
$ ./cockroach cert create-node node1.example.com node1.another-example.com --ca-cert=certs/ca.cert --ca-key=certs/ca.key --cert=certs/node.cert --key=certs/node.key
~~~

#### Create the certificate and key for a client

~~~ shell
$ ./cockroach cert create-client maxroach --ca-cert=certs/ca.cert --ca-key=certs/ca.key --cert=certs/maxroach.cert --key=certs/maxroach.key
~~~

## Related Topics

- [Manual Deployment](manual-deployment.html): Walkthrough starting a multi-node secure cluster and accessing it from a client. 
- [Start a Node](start-a-node.html): Learn more about the flags you pass when adding a node to a secure cluster.

## Raw stuff

let you create and manage replication zones, which are rules for how data in your cluster gets replicated. Initially, there is just one replication zone for the entire cluster (`.default`), but you can add replication zones for specific databases and tables as well. For example, you might decide that most data in a cluster can be replicated normally (say, three times) within a single datacenter, while data in certain tables must be more highly replicated across multiple datacenters and geographies.

The `cockroach zone` commands let you create and manage replication zones, which are rules for how data in your cluster gets replicated. Initially, there is just one replication zone for the entire cluster (`.default`), but you can add replication zones for specific databases and tables as well. For example, you might decide that most data in a cluster can be replicated normally (say, three times) within a single datacenter, while data in certain tables must be more highly replicated across multiple datacenters and geographies.

This page explains how replication zones work in general and how to use the `cockroach zone` commands to configure replication zones.
For each replication zone, you can define:

- The number of replicas
- The location of each replica
- The minimum and maximum size for ranges in each replica

You can control replication at the cluster, database, and table levels. When determine how to replicate a piece of data, CockroachDB first looks to see if there's a replication zone for table containing the data; if not, it looks to see if there's a replication zone for the database containing the data; if not, it replicates the data based ont the cluster-wide replication zone. 


which are YAML files that control how specific sets of data get replicated. Initially, there is just one configuration zone (`.default.yaml`) for the entire cluster, but you can add replication zones for specific databases and tables as well.

The `cockroach zone` commands let you create and manage replication zones, which are YAML files that control how specific sets of data get replicated. Initially, there is just one configuration zone (`.default.yaml`) for the entire cluster, but you can add replication zones for specific databases and tables as well.

 file  each of which controls how a specific set of data is replicated.

configure replication zones, which are rules for how data is replicated across your cluster. Initially, there is just one replication zone for the entire cluster, but you can add replication zones for specific databases and tables as well. 

This page shows you how.

that controls  By default, there's a replication zone for the entire cluster, but you can have replication zones for specific databases and specific tables as well. 

 for how many times 
In CockroachDB, a replication zone controls how many times a specific set of data gets replicated and where. A replication zone can apply to the entire cluster, to a specific database, or to a specific table. 

In CockroachDB, 

You can define replication zones at the cluster, database, and table levels.

The `cockroach zone` commands let you configure replication zones, which are rules for how specific sets of data are replicated. There is one `.default` YAML file controlling replication for the entire cluster, but you can create additional YAML files to define replication rules for specific databases and tables. 



The `cockroach zone` commands let you configure how data is replicated at the cluster, database, and table levels. Each replication zone is formatted as a YAML file and specifies the number of replicas, the location of replicas, and the minimum and maximum size of ranges for the data to which it applies. 




onfigure how data is replicated across your cluster. For example, you might decide that data in a database can be replicated normally (say, three times) within a single data center, while data in specific table must be more highly replicated across multiple datacenters in multiple geographies. 


 threecreate one zone configuration for a certain table that needs to be highly replicated across geographies


Each zone configuration is stored as a YAML file
In each replication zo


## 


You can control replication at the cluster, database, and table levels. When determine how to replicate a piece of data, CockroachDB first looks to see if there's a replication zone for table containing the data; if not, it looks to see if there's a replication zone for the database containing the data; if not, it replicates the data based ont the cluster-wide replication zone. 


For each replication zone, you can define:

- The number of replicas
- The location of each replica
- The minimum and maximum size for ranges in each replica



which are YAML files that control how specific sets of data get replicated. Initially, there is just one configuration zone (`.default.yaml`) for the entire cluster, but you can add replication zones for specific databases and tables as well.

The `cockroach zone` commands let you create and manage replication zones, which are YAML files that control how specific sets of data get replicated. Initially, there is just one configuration zone (`.default.yaml`) for the entire cluster, but you can add replication zones for specific databases and tables as well.
