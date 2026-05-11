---
title: Common Issues to Monitor
summary: How to configure and monitor your CockroachDB cluster to prevent commonly encountered issues.
toc: true
docs_area: manage
---

This page summarizes how to configure and monitor your cluster to prevent issues commonly encountered with:

- [CPU](#cpu)
- [Memory](#memory)
- [Storage and disk I/O](#storage-and-disk-i-o)

## CPU

{% include {{ page.version.version }}/prod-deployment/terminology-vcpu.md %}

Issues with CPU most commonly arise when there is insufficient CPU to support the scale of the workload.

### CPU planning

Provision enough CPU to support your operational and workload concurrency requirements:

{% capture cpu_recommendation_minimum %}For cluster stability, Cockroach Labs recommends a _minimum_ of {% include {{ page.version.version }}/prod-deployment/provision-cpu.md threshold='minimum' %}, and strongly recommends no fewer than {% include {{ page.version.version }}/prod-deployment/provision-cpu.md threshold='absolute_minimum' %} per node. In a cluster with too few CPU resources, foreground client workloads will compete with the cluster's background maintenance tasks.{% endcapture %}

{% capture cpu_recommendation_maximum %}Cockroach Labs does not extensively test clusters with more than {% include {{ page.version.version }}/prod-deployment/provision-cpu.md threshold='maximum' %} per node. This is the recommended _maximum_ threshold.{% endcapture %}

| Category | Recommendations                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| CPU      | <ul><li>{{ cpu_recommendation_minimum | strip_newlines }}</li><li>{{ cpu_recommendation_maximum | strip_newlines }}</li><li>Use larger VMs to handle temporary workload spikes and processing [hotspots]({% link {{ page.version.version }}/understand-hotspots.md %}).</li><li>Use connection pooling to manage workload concurrency. {% include {{ page.version.version }}/prod-deployment/prod-guidance-connection-pooling.md %} For more details, refer to [Size connection pools]({% link {{ page.version.version }}/connection-pooling.md %}#size-connection-pools).</li><li>For additional CPU recommendations, refer to [Recommended Production Settings]({% link {{ page.version.version }}/recommended-production-settings.md %}#sizing).</li></ul> |

### CPU monitoring

Monitor possible signs of CPU starvation:

| Parameter                                     | Description                                                                          |
|-----------------------------------------------|--------------------------------------------------------------------------------------|
| [Service latency](#service-latency)           | The time between when the cluster receives a query and finishes executing the query. |
| [CPU usage](#cpu-usage)                       | The CPU consumption by the CockroachDB node process.                                 |
| [Workload concurrency](#workload-concurrency) | The number of SQL statements being executed on the cluster at the same time.         |
| [LSM health](#lsm-health)                     | The health of the persistent stores.                                                 |
| [Node health](#node-health)                   | The operational status of the nodes.                                                 |

#### Service latency

Degradation in SQL response time is the most common symptom of CPU starvation. It can also be a symptom of [insufficient disk I/O](#storage-and-disk-i-o).

- The [**Service Latency: SQL Statements, 99th percentile**]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#service-latency-sql-99th-percentile) and [**Service Latency: SQL Statements, 90th percentile**]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#service-latency-sql-90th-percentile) graphs on the SQL dashboard show the time in nanoseconds between when the cluster [receives a query and finishes executing the query]({% link {{ page.version.version }}/architecture/sql-layer.md %}). This time does not include returning results to the client.

If latencies are consistently high, check for:

- High [CPU usage](#cpu-usage).
- An [I/O bottleneck](#disk-iops).

#### CPU usage

[Compaction on the storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}#compaction) uses CPU to run concurrent worker threads.

- The [**CPU Utilization**]({% link {{ page.version.version }}/ui-overload-dashboard.md %}#cpu-utilization) graph on the Hardware and Overload dashboards shows the CPU consumption by the CockroachDB process, and excludes other processes on the node.

    {% include {{ page.version.version }}/prod-deployment/healthy-cpu-percent.md %}

If CPU usage is high, check whether [workload concurrency](#workload-concurrency) is exceeding CPU resources.

{{site.data.alerts.callout_success}}
{% include {{page.version.version}}/storage/compaction-concurrency.md %}
{{site.data.alerts.end}}

#### Workload concurrency

The number of concurrent active SQL statements should be proportionate to your provisioned CPU.

- The [**SQL Queries Per Second**]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#sql-queries-per-second) graph on the Overview and SQL dashboards shows the 10-second moving average of `SELECT`, `UPDATE`, `INSERT`, and `DELETE` statements being executed per second on the cluster or node, as well as `Total queries`. The latest QPS value for the cluster is also displayed with the **Queries per second** counter on the Metrics page.

    {% include {{ page.version.version }}/prod-deployment/healthy-workload-concurrency.md %}

If workload concurrency exceeds CPU resources, you will observe:

- High [CPU usage](#cpu-usage).
- Degradation in [SQL response time](#service-latency).
- Over time, an [unhealthy LSM](#lsm-health) and [cluster instability](#node-health).

{{site.data.alerts.callout_success}}
{% include {{ page.version.version }}/prod-deployment/resolution-excessive-concurrency.md %}
{{site.data.alerts.end}}

#### LSM health

Issues at the storage layer, including an [inverted LSM]({% link {{ page.version.version }}/architecture/storage-layer.md %}#inverted-lsms) and high [read amplification]({% link {{ page.version.version }}/architecture/storage-layer.md %}#read-amplification), can be observed when [compaction]({% link {{ page.version.version }}/architecture/storage-layer.md %}#compaction) falls behind due to insufficient CPU or excessively high [recovery and rebalance rates]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#excessive-snapshot-rebalance-and-recovery-rates).

- The [**IO Overload**]({% link {{ page.version.version }}/ui-overload-dashboard.md %}#io-overload) graph on the Overload dashboard shows the health of the [persistent stores]({% link {{ page.version.version }}/architecture/storage-layer.md %}), which are implemented as log-structured merge (LSM) trees. Level 0 is the highest level of the LSM tree and consists of files containing the latest data written to the [Pebble storage engine]({% link {{ page.version.version }}/cockroach-start.md %}#storage-engine). For more information about LSM levels and how LSMs work, see [Log-structured Merge-trees]({% link {{ page.version.version }}/architecture/storage-layer.md %}#log-structured-merge-trees).

    {% include {{ page.version.version }}/prod-deployment/healthy-lsm.md %}

    {{site.data.alerts.callout_info}}
    An unhealthy LSM can be caused by other factors, including [under-provisioned storage](#storage-and-disk-i-o). To correlate this symptom with CPU starvation, check for high [CPU usage](#cpu-usage) and excessive [workload concurrency](#workload-concurrency).
    {{site.data.alerts.end}}

- The **Read Amplification** graph on the [Storage Dashboard]({% link {{ page.version.version }}/ui-storage-dashboard.md %}) shows the average number of disk reads per logical SQL statement, also known as the [read amplification]({% link {{ page.version.version }}/architecture/storage-layer.md %}#read-amplification) factor.

    {% include {{ page.version.version }}/prod-deployment/healthy-read-amplification.md %}

- The `STORAGE` [logging channel]({% link {{ page.version.version }}/logging-overview.md %}#logging-channels) indicates an unhealthy LSM with the following:

    - Frequent `compaction` status messages.

    - High-read-amplification warnings, e.g., `sstables (read amplification = 54)`.

{{site.data.alerts.callout_success}}
{% include {{ page.version.version }}/prod-deployment/resolution-inverted-lsm.md %}
{{site.data.alerts.end}}

#### Node health

If [issues at the storage layer](#lsm-health) remain unresolved, affected nodes will eventually become unresponsive.

- The [**Node status**]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}#node-status) on the Cluster Overview page indicates whether nodes are online (`LIVE`) or have crashed (`SUSPECT` or `DEAD`).

- The `/health` endpoint of the [Cluster API]({% link {{ page.version.version }}/cluster-api.md %}) returns a `500` error when a node is unhealthy.

- A [Prometheus alert]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#node-is-down) can notify when a node has been down for 15 minutes or more.

If nodes have shut down, this can also be caused by [insufficient storage capacity](#storage-capacity).

{% include {{ page.version.version }}/prod-deployment/cluster-unavailable-monitoring.md %}

## Memory

CockroachDB is [resilient]({% link {{ page.version.version }}/demo-cockroachdb-resilience.md %}) to node crashes. However, frequent node restarts caused by [out-of-memory (OOM) crashes]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#out-of-memory-oom-crash) can impact cluster stability and performance.

### Memory planning

Provision enough memory and allocate an appropriate portion for data caching:

- Provision at least {% include {{ page.version.version }}/prod-deployment/provision-memory.md %}.

- {% include {{ page.version.version }}/prod-deployment/prod-guidance-disable-swap.md %}

- {% include {{ page.version.version }}/prod-deployment/prod-guidance-cache-max-sql-memory.md %}

For additional memory recommendations, refer to [Recommended Production Settings: Memory]({% link {{ page.version.version }}/recommended-production-settings.md %}#memory) and [Recommended Production Setting: Cache and SQL memory size]({% link {{ page.version.version }}/recommended-production-settings.md %}#cache-and-sql-memory-size).

### Memory monitoring

Monitor memory usage and node behavior for [OOM errors]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#out-of-memory-oom-crash):

 Metric or event                                    | Description
----------------------------------------------------|--------------------------------------
 [Node process restarts](#node-process-restarts) | Nodes restarting after crashes
 [SQL memory usage](#sql-memory-usage)           | The memory allocated to the SQL layer
 [Database memory usage](#database-memory-usage) | The memory in use by CockroachDB processes

#### Node process restarts

CockroachDB attempts to restart nodes after they crash. Nodes that frequently restart following an abrupt process exit may point to an underlying memory issue.

- The [**Node status**]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}#node-status) on the Cluster Overview page indicates whether nodes are online (`LIVE`) or have crashed (`SUSPECT` or `DEAD`).

- When deploying on [Kubernetes]({% link {{ page.version.version }}/kubernetes-overview.md %}), the `kubectl get pods` output contains a `RESTARTS` column that tracks the number of restarts for each CockroachDB pod.

- The `OPS` [logging channel]({% link {{ page.version.version }}/logging-overview.md %}#logging-channels) will record a [`node_restart` event]({% link {{ page.version.version }}/eventlog.md %}#node_restart) whenever a node rejoins the cluster after being offline.

- A [Prometheus alert]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#node-is-restarting-too-frequently) can notify when a node has restarted more than once in the last 10 minutes.

##### Verify OOM errors

If you observe nodes frequently restarting, confirm that the crashes are caused by [OOM errors]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#out-of-memory-oom-crash):

- Monitor `dmesg` to determine if a node crashed because it ran out of memory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ sudo dmesg | grep -iC 3 "cockroach"
    ~~~

    The following output indicates the node crashed due to insufficient memory:

    ~~~ shell
    $ host kernel: Out of Memory: Killed process <process_id> (cockroach).
    ~~~

- When deploying on [Kubernetes]({% link {{ page.version.version }}/kubernetes-overview.md %}), run `kubectl logs {pod-name}` and look for OOM errors in the log messages.

{{site.data.alerts.callout_success}}
{% include {{ page.version.version }}/prod-deployment/resolution-oom-crash.md %}
{{site.data.alerts.end}}

If you confirm that nodes are crashing due to OOM errors, also check whether [SQL queries](#sql-memory-usage) may be responsible.

#### SQL memory usage

An untuned SQL query can consume significant resources and impact the performance of other workloads.

- The [**SQL Memory**]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#sql-memory) graph on the SQL dashboard shows the current amount of memory in KiB allocated to the SQL layer.

    {% include {{ page.version.version }}/prod-deployment/healthy-sql-memory.md %}

-  The "active query dump", enabled by default with the `diagnostics.active_query_dumps.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}), is a record of anonymized active queries that is written to disk when a node is detected to be under memory pressure.

    You can use the active query dump to correlate specific queries to OOM crashes. Active query dumps have the filename `activequeryprof.{date-and-time}.csv` and are found in the `heap_profiler` directory in the configured [logging directory]({% link {{ page.version.version }}/configure-logs.md %}#logging-directory). They are also included when running [`cockroach debug zip`]({% link {{ page.version.version }}/cockroach-debug-zip.md %}).

- A `SHOW STATEMENTS` statement can [identify long-running queries]({% link {{ page.version.version }}/manage-long-running-queries.md %}#identify-long-running-queries) on the cluster that may be consuming excessive memory.

- A [`memory budget exceeded`]({% link {{ page.version.version }}/common-errors.md %}#memory-budget-exceeded) error in the logs indicates that `--max-sql-memory`, the memory allocated to the SQL layer, was exceeded by the operation referenced in the error. For guidance on resolving this issue, see [Common Errors]({% link {{ page.version.version }}/common-errors.md %}#memory-budget-exceeded).

{{site.data.alerts.callout_success}}
{% include {{ page.version.version }}/prod-deployment/resolution-untuned-query.md %}
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
{% include {{page.version.version}}/sql/add-size-limits-to-indexed-columns.md %}
{{site.data.alerts.end}}

#### Database memory usage

CockroachDB memory usage includes both accounted memory, such as the amount allocated to `--cache` and `--max-sql-memory`; and unaccounted memory, such as uncollected Go garbage and process overhead.

- The [**Memory Usage**]({% link {{ page.version.version }}/ui-runtime-dashboard.md %}#memory-usage) graph on the Runtime dashboard shows the total memory in use by CockroachDB processes. The RSS (resident set size) metric represents actual CockroachDB memory usage from the OS/Linux/pod point of view. The Go and CGo metrics represent memory allocation and total usage from a CockroachDB point of view.

    {% include {{ page.version.version }}/prod-deployment/healthy-crdb-memory.md %}

For more context on acceptable memory usage, see [Suspected memory leak]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#suspected-memory-leak).

## Storage and disk I/O

The cluster will underperform if storage is not provisioned or configured correctly. This can lead to further issues such as [disk stalls]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#disk-stalls) and node shutdown.

### Storage and disk planning

Provision enough storage capacity for CockroachDB data, and configure your volumes to maximize disk I/O:

<table markdown="1">
<thead>
<tr>
  <th>Category</th>
  <th>Recommendations</th>
</tr>
</thead>
<tbody>
<tr>
  <td>Storage</td>
  <td>
    <ul>
      <li>Provision volumes with {% include {{ page.version.version }}/prod-deployment/provision-storage.md %}.</li>
      <li>{% include {{ page.version.version }}/prod-deployment/prod-guidance-store-volume.md %}</li>
      <li>{% include {{ page.version.version }}/prod-deployment/prod-guidance-log-volume.md %}</li>
      <li>See additional storage recommendations in the <a href="{% link {{ page.version.version }}/recommended-production-settings.md %}#storage">Recommended Production Settings</a>.</li>
    </ul>
  </td>
</tr>
<tr>
  <td>Disk I/O</td>
  <td>
    <ul>
      <li>Disks must be able to achieve {% include {{ page.version.version }}/prod-deployment/provision-disk-io.md %}.</li>
      <li>{% include {{ page.version.version }}/prod-deployment/prod-guidance-lvm.md %}</li>
      <li>See additional disk I/O recommendations in the <a href="{% link {{ page.version.version }}/recommended-production-settings.md %}#disk-i-o">Recommended Production Settings</a>.</li>
    </ul>
  </td>
</tbody>
</table>

### Storage and disk monitoring

Monitor storage capacity and disk performance:

| Metric or event                                   | Description                                                                                                          |
|---------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| [Storage capacity](#storage-capacity)             | The available and used disk capacity in the CockroachDB [store]({% link {{ page.version.version }}/cockroach-start.md %}#store).                         |
| [Disk IOPS](#disk-iops)                           | The I/O requests per second.                                                                                         |
| [Node heartbeat latency](#node-heartbeat-latency) | The time between [node liveness]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#node-liveness-issues) heartbeats.                |
| [Command commit latency](#command-commit-latency) | The speed at which [Raft commands]({% link {{ page.version.version }}/architecture/replication-layer.md %}) are being committed by nodes in the cluster. |

#### Storage capacity

CockroachDB requires disk space in order to accept writes. When a node runs out of disk space, it [shuts down](#node-health) and cannot be restarted until space is freed up.

- The [**Capacity**]({% link {{ page.version.version }}/ui-storage-dashboard.md %}#capacity) graph on the Overview and Storage dashboards shows the available and used disk capacity in the CockroachDB [store]({% link {{ page.version.version }}/cockroach-start.md %}#store).

    {% include {{ page.version.version }}/prod-deployment/healthy-storage-capacity.md %}

- A [Prometheus alert]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#node-is-running-low-on-disk-space) can notify when a node has less than 15% of free space remaining.

{{site.data.alerts.callout_success}}
Ensure that you [provision sufficient storage]({% link {{ page.version.version }}/recommended-production-settings.md %}#storage). If storage is correctly provisioned and is running low, CockroachDB automatically creates an emergency ballast file that can free up space. For details, see [Disks filling up]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#disks-filling-up).
{{site.data.alerts.end}}

{% include {{page.version.version}}/storage/free-up-disk-space.md %}

#### Disk IOPS

Insufficient disk I/O can cause [poor SQL performance](#service-latency) and potentially [disk stalls]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#disk-stalls).

- The [**Disk Ops In Progress**]({% link {{ page.version.version }}/ui-hardware-dashboard.md %}#disk-ops-in-progress) graph on the Hardware dashboard shows the number of disk reads and writes in queue.

    {% include {{ page.version.version }}/prod-deployment/healthy-disk-ops-in-progress.md %}

- The Linux tool `iostat` (part of `sysstat`) can be used to monitor IOPS. In the device status output, `avgqu-sz` corresponds to the **Disk Ops In Progress** metric. If service times persist in double digits on any node, this means that your storage device is saturated and is likely under-provisioned or misconfigured.

With insufficient disk I/O, you may also see:

- Degradation in [SQL response time](#service-latency).
- An [unhealthy LSM](#lsm-health).

#### Node heartbeat latency

- The [**Node Heartbeat Latency: 99th percentile**]({% link {{ page.version.version }}/ui-distributed-dashboard.md %}#node-heartbeat-latency-99th-percentile) and [**Node Heartbeat Latency: 90th percentile**]({% link {{ page.version.version }}/ui-distributed-dashboard.md %}#node-heartbeat-latency-90th-percentile) graphs on the [Distributed Dashboard]({% link {{ page.version.version }}/ui-distributed-dashboard.md %}) show the time elapsed between node heartbeats.

    {% include {{ page.version.version }}/prod-deployment/healthy-node-heartbeat-latency.md %}

{% include {{ page.version.version }}/leader-leases-node-heartbeat-use-cases.md %}

#### Command commit latency

- The **Command Commit Latency: 50th percentile** and **Command Commit Latency: 99th percentile** graphs on the [Storage dashboard]({% link {{ page.version.version }}/ui-storage-dashboard.md %}) show how quickly [Raft commands]({% link {{ page.version.version }}/architecture/replication-layer.md %}) are being committed by nodes in the cluster. This is a good signal of I/O load.

    {% include {{ page.version.version }}/prod-deployment/healthy-command-commit-latency.md %}

## See also

- [Recommended Production Settings]({% link {{ page.version.version }}/recommended-production-settings.md %})
- [Monitoring and Alerting]({% link {{ page.version.version }}/monitoring-and-alerting.md %})
- [Common Errors and Solutions]({% link {{ page.version.version }}/common-errors.md %})
- [Operational FAQs]({% link {{ page.version.version }}/operational-faqs.md %})
- [Performance Tuning Recipes]({% link {{ page.version.version }}/performance-recipes.md %})
- [Troubleshoot Cluster Setup]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %})
- [Troubleshoot SQL Behavior]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %})
- [Admission Control]({% link {{ page.version.version }}/admission-control.md %})
- [Metrics]({% link {{ page.version.version }}/metrics.md %})
- [Alerts Page]({% link cockroachcloud/alerts-page.md %}) (CockroachDB {{ site.data.products.advanced }})
