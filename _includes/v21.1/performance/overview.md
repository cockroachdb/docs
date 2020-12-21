### Topology

You'll start with a 3-node CockroachDB cluster in a single Google Compute Engine (GCE) zone, with an extra instance for running a client application workload:

<img src="{{ 'images/v21.1/perf_tuning_single_region_topology.png' | relative_url }}" alt="Perf tuning topology" style="max-width:100%" />

{{site.data.alerts.callout_info}}
Within a single GCE zone, network latency between instances should be sub-millisecond.
{{site.data.alerts.end}}

You'll then scale the cluster to 9 nodes running across 3 GCE regions, with an extra instance in each region for a client application workload:

<img src="{{ 'images/v21.1/perf_tuning_multi_region_topology.png' | relative_url }}" alt="Perf tuning topology" style="max-width:100%" />

{{site.data.alerts.callout_info}}
Network latencies will increase with geographic distance between nodes. You can observe this in the [Network Latency page](ui-network-latency-page.html) of the DB Console.
{{site.data.alerts.end}}

To reproduce the performance demonstrated in this tutorial:

- For each CockroachDB node, you'll use the [`n1-standard-4`](https://cloud.google.com/compute/docs/machine-types#standard_machine_types) machine type (4 vCPUs, 15 GB memory) with the Ubuntu 16.04 OS image and a [local SSD](https://cloud.google.com/compute/docs/disks/#localssds) disk.
- For running the client application workload, you'll use smaller instances, such as `n1-standard-1`.

### Schema

Your schema and data will be based on our open-source, fictional peer-to-peer vehicle-sharing application, [MovR](movr.html).

<img src="{{ 'images/v21.1/perf_tuning_movr_schema.png' | relative_url }}" alt="Perf tuning schema" style="max-width:100%" />

A few notes about the schema:

- There are just three self-explanatory tables: In essence, `users` represents the people registered for the service, `vehicles` represents the pool of vehicles for the service, and `rides` represents when and where users have participated.   
- Each table has a composite primary key, with `city` being first in the key. Although not necessary initially in the single-region deployment, once you scale the cluster to multiple regions, these compound primary keys will enable you to [geo-partition data at the row level](partitioning.html#partition-using-primary-key) by `city`. As such, this tutorial demonstrates a schema designed for future scaling.
- The [`IMPORT`](import.html) feature you'll use to import the data does not support foreign keys, so you'll import the data without [foreign key constraints](foreign-key.html). However, the import will create the secondary indexes required to add the foreign keys later.

### Important concepts

To understand the techniques in this tutorial, and to be able to apply them in your own scenarios, it's important to first understand [how reads and writes work in CockroachDB](architecture/reads-and-writes-overview.html). Review that document before getting started here.
