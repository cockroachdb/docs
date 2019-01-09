---
title: Cluster Topology Patterns
summary: An illustration of common topology patterns.
toc: true
---

This is page covers common cluster topology patterns with setup examples and performance considerations.

## Considerations

When selecting a pattern for your cluster, the following must be taken into consideration:

- The function of a CockroachDB [leaseholder](architecture/replication-layer.html#leases).
- The impacts of the [leaseholder](architecture/life-of-a-distributed-transaction.html#leaseholder-node) on read and write activities.
- The leaseholders are local to reader and writers within the datacenter.
- The leaseholder migration among the datacenters is minimized by using the [partitioning feature](partitioning.html).
- Whether the application is designed to use the [partitioning feature](partitioning.html) or not.
- The `--locality` flag must be set properly on each node to enable [follow-the-workload](demo-follow-the-workload.html).

Before you select a candidate pattern for your cluster, use the following broad patterns as a starting point and consider trade-offs.

{{site.data.alerts.callout_info}}
This page does not factor in hardware differences.
{{site.data.alerts.end}}

## Single (local) datacenter clusters

A local deployment is a single datacenter deployment. The network latency among the nodes is expected to be the same, around 1ms.

### Basic structure for minimum resilience

In the diagrams below:

- `App` is an application that accesses CockroachDB
- `HA-Proxy` is a software based load balancer
- `1`, `2`, and `3` each represents a CockroachDB node
- The nodes are all running in a single datacenter

Normal operating mode:

~~~
      App
       |
    HA-Proxy
  /    |    \
 /     |     \
1------2------3
 \___________/
~~~

If node `1` goes down, the database and app are still fully operational:

~~~
      App
       |
    HA-Proxy
  /    |    \
 /     |     \
x------2------3
 \___________/
~~~

If node `2` is down, the database and app are still fully operational:

~~~
      App
       |
    HA-Proxy
  /    |    \
 /     |     \
1------x------3
 \___________/
~~~

If node `3` is down, the database and app are still fully operational:

~~~
      App
       |
    HA-Proxy
  /    |    \
 /     |     \
1------2------x
 \___________/
~~~

### More resilient structure

Three or more nodes are recommended to provide high availability, share the load, and spread the capacity. Dynamically scaling out the nodes from three to four, four to five, or any other intervals is supported. There are no constraints on the server increments.

The diagram below depicts each node as a letter (i.e., `A`, `B`, `C`, `D`, `E`):

~~~
A------C         A-----C           A-----C
 \    /  online  |     |  online   | \ / |
  \  /   ------> |     |  ------>  |  E  |
   \/            |     |           | / \ |
   B             B-----D           B-----D
~~~

## Multi-region clusters

The sample patterns in this section represent multi-region clusters and show a broad placement of datacenters as `West`, `East` and `Central`. The latency numbers (e.g., `60ms`) represent network round-trip from one datacenter to another.

### Basic structure for minimum resilience

The diagram below depicts an asymmetrical setup where `Central` is closer to the `West` than the `East`. This configuration will provide better write latency to the write workloads in the `West` and `Central`.

~~~
A---C         A---C
 \ /           \ /
  B             B
  West---80m---East
     \         /  
    20ms    60ms  
       \    /
        \  /
         \/
       Central
        A---C   
         \ /
          B
~~~

#### CockroachDB configuration

In this pattern:

- Each region defines an availability zone.
- Three or more regions are recommended.
- Similar to the [local](#single-local-datacenter-clusters) topology, more regions can be added dynamically.
- A homogenous configuration among the regions for simplified operations is recommended.
- For sophisticated workloads, each region can have different node count and node specification. This heterogeneous configuration could better handle regional specific concurrency and load characteristics.

#### Availability expectations

- Each region defines an availability zone, and three or more regions are recommended.
- Can survive a single datacenter failure

#### Performance expectations

- The network latency among the regions is expected to be linear to the distance among the nodes.

<!-- ### More resilient / different structure

_Add description_ -->

### Locality-aware load balancing

Modern [multi-tier architecture](https://en.wikipedia.org/wiki/Multitier_architecture) is simplified as `App` and `LB` layers in the below diagram:

~~~
         Clients
           |
          GSLB
           |
  +--------+---------+
West    Central    East
  |        |         |
 App  |   App   |   App
 ---  |   ---   |   ---    
  LB  |    LB   |    LB
      |         |

  West---Central ---East
    \               /
     \ CockroachDB /  
      -------------
~~~

#### CockroachDB configuration

- A client connects to geographically close app server via `GSLB`.
- The app servers connect to one of the CockroachDB nodes within their geography via local balancer (`LB`).
- The configuration for the software-based load balancer (`HAProxy`), located on the app server, is provided by CockroachDB. A network-based load balancer can also be used.

#### Availability expectations

- Can survive a single datacenter failure

#### Performance expectations

<!-- Add -->

#### Application expectations

When locality is enabled, `haproxy` should be setup to load balance on the database nodes within the same locality as the app servers first:

- The `West` app servers should connect to the West CockroachDB servers.
- The `Central` app servers should connect to the Central CockroachDB servers.
- The `East` app servers should connect to the East CockroachDB servers.

If all of the nodes for a preferred locality are down, then the app will try databases in other localities.

### High-Performance

Some applications have high-performance requirements. In the diagram below, `NJ` and `NY` depict two separate datacenters that are connected by a high bandwidth low-latency network:

~~~
   NJ ---1ms--- NY
     \       /  
     20ms  20ms  
        \  /
         \/  
       Central
         /\  
        /  \
     20ms  20ms  
     /       \  
  CA ---1ms--- NV
~~~

#### CockroachDB configuration

In this pattern:

- `NJ` and `NY` have the performance characteristics of the [local topology](#single-local-datacenter-clusters), but the benefit of Zero RPO and near Zero RTO disaster recovery SLA.
- `CA` and `NV` have been set up with a network capability
- The `Central` region serves as the quorum.

#### Availability expectations

- The cluster can survive a single datacenter failure.

#### Performance expectations

<!-- Add -->

#### Application expectations

<!-- Add -->

## Global clusters

### Basic structure for minimum resilience

The global pattern connects [multiple regional clusters](#multi-region-clusters) together to form a single database that is globally distributed. Transactions are globally consistent.

~~~
    West-----East            West-------East
       \      /                \        /
        \Asia/                  \Europe/
         \  /                    \    /
          \/                      \  /
        Central                 Central
                Asia------Europe
                   \     /  
                    \   /  
                     \ /  
                   Americas

               West---------East
                  \          /
                   \Americas/  
                    \      /
                    Central
~~~


#### CockroachDB configuration

<!-- Add -->

#### Availability expectations

- The cluster can survive a single datacenter failure.

#### Performance expectations

<!-- Add -->

#### Application expectations

<!-- Add -->

## Partitioned clusters

The sample patterns in this section assume the usage of the [geo-partitioning feature](partitioning.html), with `West`, `East` and `Central` indicating a broad placement of datacenters. The latency numbers (e.g., `60ms`) represent network round-trip from one datacenter to another.


Topology                                              | West                         | Central                | East
------------------------------------------------------+------------------------------+------------------------+------------------------
[Symmetrical](#symmetrical-clusters)                  | Read local, Write 60ms       | Read local, Write 60ms | Read local, Write 60ms
[Dual East](#dual-east-datacenters)                   | East	Read local, Write 60ms |                        | Read local, Write 5ms
[Dual East and West](#dual-east-and-west-datacenters) | Read local, Write 5ms        |	                      |

### Symmetrical clusters

During normal operations:

~~~
App                App
 \                  /
West ---60ms--- East
     \          /  
    60ms     60ms  
        \    /
         \  /  
       Central
          |
         App
~~~

#### Replicas and leaseholders

- Tables are [partitioned](partitioning.html) at row-level by locality.
- Rows with the `West` partition have their leaseholder in the `West` datacenter.
- Rows with the `Central` partition have their leaseholder in the `Central` datacenter.
- Rows with the `East` partition have their leaseholder in the `East` datacenter.
- Replicas are evenly distributed among the three datacenters.

#### Availability expectations

- The cluster can survive a single datacenter failure.

#### Performance expectations

- Reads respond in a few milliseconds.
- Writes respond in 60ms.
- Symmetrical latency between datacenters.

#### Application expectations

- West `App` servers connect to the `West` CockroachDB nodes.
- Central `App` servers connect to the `Central` CockroachDB nodes.
- East `App` servers connect to the `East` CockroachDB nodes.

#### CockroachDB configuration

- Abbreviated startup flag for each datacenter:

    ~~~
    --loc=Region=East
    --loc=Region=Central
    --loc=Region=West
    ~~~

### Dual East datacenters

During normal operations:

~~~
App                App
 \                  /
West ---60ms--- East1
     \           |
       \        5ms
        60ms     |
           \____East2
~~~

#### Replicas and leaseholders

- Rows with the `West` partition will have the leaseholder in the `West` datacenter.
- Rows with the `East` partition will have the leaseholder in the `East1` datacenter.
- The 3 replicas will be evenly distributed among the three datacenters.

#### Availability expectations

- The cluster can survive a single datacenter failure.

#### Performance expectations

- The reader can expect to have a couple of milliseconds response time.
- The `East` writers can expect to have a 5ms response time.
- The `West` writers can expect to have a 60ms response time.

#### Application expectations

- West `App` servers connect to the `West` CockroachDB nodes
- East `App` servers connect to the `East1` CockroachDB nodes

#### CockroachDB configuration

- Abbreviated startup flag for each datacenter:

    ~~~
    --loc=Region=East,DC=1
    --loc=Region=East,DC=2
    --loc=Region=West
    ~~~

### Dual East and West datacenters

During normal operations:

~~~
App                App
 \                  /
West1 ---60ms--- East1
  |   \        /   |
  5ms  - 60ms -    5ms
  |   /        \   |
West2----60ms----East2
~~~

#### Replicas and leaseholders

- Rows with the `West` partition will have the leaseholder in the `West1` datacenter.
- Rows with the `East` partition will have the leaseholder in the `East1` datacenter.
- West partitions will have 1 replica each in `West1` and `West2`, then 1 replica in `East1` or `East2`.
- East partitions will have 1 replica each in `East1` and `East2`, then 1 replica in `West1` or `West2`.

#### Availability expectations

- The cluster can survive a single datacenter failure.

#### Performance expectations

- The reader can expect to have a couple of milliseconds response time.
- The writers can expect to have a 5ms response time.

#### Application expectations

- West `App` servers connect to the `West` CockroachDB nodes.
- East `App` servers connect to the `East` CockroachDB nodes.

#### CockroachDB configuration

- Abbreviated startup flag for each datacenter:

    ~~~
    --loc=Region=West,DC=1
    --loc=Region=West,DC=2
    --loc=Region=East,DC=1
    --loc=Region=East,DC=2
    ~~~

## Anti-patterns

_Do we want to add a section for bad patterns (i.e., two datacenters, even # of replicas)?_
