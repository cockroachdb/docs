### Topology

You'll start with a 3-node CockroachDB cluster in a single Google Compute Engine (GCE) zone, with an extra instance for running a client application workload:

<img src="{{ 'images/v19.1/perf_tuning_single_region_topology.png' | relative_url }}" alt="Perf tuning topology" style="max-width:100%" />

{{site.data.alerts.callout_info}}
Within a single GCE zone, network latency between instances should be sub-millisecond.
{{site.data.alerts.end}}

You'll then scale the cluster to 9 nodes running across 3 GCE regions, with an extra instance in each region for a client application workload:

<img src="{{ 'images/v19.1/perf_tuning_multi_region_topology.png' | relative_url }}" alt="Perf tuning topology" style="max-width:100%" />

To reproduce the performance demonstrated in this tutorial:

- For each CockroachDB node, you'll use the [`n1-standard-4`](https://cloud.google.com/compute/docs/machine-types#standard_machine_types) machine type (4 vCPUs, 15 GB memory) with the Ubuntu 16.04 OS image and a [local SSD](https://cloud.google.com/compute/docs/disks/#localssds) disk.
- For running the client application workload, you'll use smaller instances, such as `n1-standard-1`.

### Schema

Your schema and data will be based on the fictional peer-to-peer vehicle-sharing app, MovR, that was featured in the [CockroachDB 2.0 demo](https://www.youtube.com/watch?v=v2QK5VgLx6E):

<img src="{{ 'images/v19.1/perf_tuning_movr_schema.png' | relative_url }}" alt="Perf tuning schema" style="max-width:100%" />

A few notes about the schema:

- There are just three self-explanatory tables: In essence, `users` represents the people registered for the service, `vehicles` represents the pool of vehicles for the service, and `rides` represents when and where users have participated.   
- Each table has a composite primary key, with `city` being first in the key. Although not necessary initially in the single-region deployment, once you scale the cluster to multiple regions, these compound primary keys will enable you to [geo-partition data at the row level](partitioning.html#partition-using-primary-key) by `city`. As such, this tutorial demonstrates a schema designed for future scaling.
- The [`IMPORT`](import.html) feature you'll use to import the data does not support foreign keys, so you'll import the data without [foreign key constraints](foreign-key.html). However, the import will create the secondary indexes required to add the foreign keys later.
- The `rides` table contains both `city` and the seemingly redundant `vehicle_city`. This redundancy is necessary because, while it is not possible to apply more than one foreign key constraint to a single column, you will need to apply two foreign key constraints to the `rides` table, and each will require city as part of the constraint. The duplicate `vehicle_city`, which is kept in synch with `city` via a [`CHECK` constraint](check.html), lets you overcome [this limitation](https://github.com/cockroachdb/cockroach/issues/23580).

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

<img src="{{ 'images/v19.1/perf_tuning_concepts1.png' | relative_url }}" alt="Perf tuning concepts" style="max-width:100%" />

In this case:

1. Node 2 (the gateway node) receives the request to read from table 3.
2. The leaseholder for table 3 is on node 3, so the request is routed there.
3. Node 3 returns the data to node 2.
4. Node 2 responds to the client.

If the query is received by the node that has the leaseholder for the relevant range, there are fewer network hops:

<img src="{{ 'images/v19.1/perf_tuning_concepts2.png' | relative_url }}" alt="Perf tuning concepts" style="max-width:100%" />

#### Write scenario

Now imagine a simple write scenario where a query is executed against node 3 to write to table 1:

<img src="{{ 'images/v19.1/perf_tuning_concepts3.png' | relative_url }}" alt="Perf tuning concepts" style="max-width:100%" />

In this case:

1. Node 3 (the gateway node) receives the request to write to table 1.
2. The leaseholder for table 1 is on node 1, so the request is routed there.
3. The leaseholder is the same replica as the Raft leader (as is typical), so it simultaneously appends the write to its own Raft log and notifies its follower replicas on nodes 2 and 3.
4. As soon as one follower has appended the write to its Raft log (and thus a majority of replicas agree based on identical Raft logs), it notifies the leader and the write is committed to the key-values on the agreeing replicas. In this diagram, the follower on node 2 acknowledged the write, but it could just as well have been the follower on node 3. Also note that the follower not involved in the consensus agreement usually commits the write very soon after the others.
5. Node 1 returns acknowledgement of the commit to node 3.
6. Node 3 responds to the client.

Just as in the read scenario, if the write request is received by the node that has the leaseholder and Raft leader for the relevant range, there are fewer network hops:

<img src="{{ 'images/v19.1/perf_tuning_concepts4.png' | relative_url }}" alt="Perf tuning concepts" style="max-width:100%" />

#### Network and I/O bottlenecks

With the above examples in mind, it's always important to consider network latency and disk I/O as potential performance bottlenecks. In summary:

- For reads, hops between the gateway node and the leaseholder add latency.
- For writes, hops between the gateway node and the leaseholder/Raft leader, and hops between the leaseholder/Raft leader and Raft followers, add latency. In addition, since Raft log entries are persisted to disk before a write is committed, disk I/O is important.
