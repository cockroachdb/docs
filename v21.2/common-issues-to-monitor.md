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

| Category | Recommendations                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| CPU      | <ul><li>Each node should have {% include {{ page.version.version }}/prod-deployment/provision-cpu.md %}.</li><li>Use larger VMs to handle temporary workload spikes and processing hot spots.</li><li>Use connection pooling to manage workload concurrency. {% include {{ page.version.version }}/prod-deployment/prod-guidance-connection-pooling.md %} For more details, see [Sizing connection pools](connection-pooling.html#sizing-connection-pools).</li><li>See additional CPU recommendations in the [Production Checklist](recommended-production-settings.html#sizing).</li></ul> |

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

- The [**Service Latency: SQL Statements, 99th percentile**](ui-sql-dashboard.html#service-latency-sql-99th-percentile) and [**Service Latency: SQL Statements, 90th percentile**](ui-sql-dashboard.html#service-latency-sql-90th-percentile) graphs on the SQL dashboard show the time in nanoseconds between when the cluster [receives a query and finishes executing the query](architecture/sql-layer.html). This time does not include returning results to the client.

If latencies are consistently high, check for:

- High [CPU usage](#cpu-usage).
- An [I/O bottleneck](#disk-iops).

#### CPU usage

Compaction on the [storage layer](architecture/storage-layer.html) uses CPU to run concurrent worker threads.

- The [**CPU Percent**](ui-overload-dashboard.html#cpu-percent) graph on the Hardware and Overload dashboards shows the CPU consumption by the CockroachDB process, and excludes other processes on the node.

    {% include {{ page.version.version }}/prod-deployment/healthy-cpu-percent.md %}

If CPU usage is high, check whether [workload concurrency](#workload-concurrency) is exceeding CPU resources.

#### Workload concurrency

The number of concurrent active SQL statements should be proportionate to your provisioned CPU.

- The [**SQL Statements**](ui-sql-dashboard.html#sql-statements) graph on the Overview and SQL dashboards shows the 10-second average of `SELECT`, `UPDATE`, `INSERT`, and `DELETE` statements being executed per second on the cluster or node. The latest QPS value for the cluster is also displayed with the **Queries per second** counter on the Metrics page.

    {% include {{ page.version.version }}/prod-deployment/healthy-workload-concurrency.md %}

If workload concurrency exceeds CPU resources, you will observe:

- High [CPU usage](#cpu-usage).
- Degradation in [SQL response time](#service-latency).
- Over time, an [unhealthy LSM](#lsm-health) and [cluster instability](#node-health).

{{site.data.alerts.callout_success}}
{% include {{ page.version.version }}/prod-deployment/resolution-excessive-concurrency.md %}
{{site.data.alerts.end}}

#### LSM health

Issues at the [storage layer](architecture/storage-layer.html), including a misshapen LSM and high [read amplification](architecture/storage-layer.html#read-amplification), can be observed when compaction falls behind due to insufficient CPU.

- The [**LSM L0 Health**](ui-overload-dashboard.html#lsm-l0-health) graph on the Overload dashboard shows the health of the [persistent stores](architecture/storage-layer.html), which are implemented as log-structured merge (LSM) trees. Level 0 is the highest level of the LSM tree and consists of files containing the latest data written to the [Pebble storage engine](cockroach-start.html#storage-engine). For more information about LSM levels and how LSMs work, see [Log-structured Merge-trees](architecture/storage-layer.html#log-structured-merge-trees).

    {% include {{ page.version.version }}/prod-deployment/healthy-lsm.md %}

    {{site.data.alerts.callout_info}}
    An unhealthy LSM can be caused by other factors, including [under-provisioned storage](#storage-and-disk-i-o). To correlate this symptom with CPU starvation, check for high [CPU usage](#cpu-usage) and excessive [workload concurrency](#workload-concurrency).
    {{site.data.alerts.end}}

- The **Read Amplification** graph on the [Storage Dashboard](ui-storage-dashboard.html) shows the average number of disk reads per logical SQL statement, also known as the [read amplification](architecture/storage-layer.html#read-amplification) factor.

    {% include {{ page.version.version }}/prod-deployment/healthy-read-amplification.md %}

- The `STORAGE` [logging channel](logging-overview.html#logging-channels) indicates an unhealthy LSM with the following:

    - Frequent `compaction` status messages.

    - High-read-amplification warnings, e.g., `sstables (read amplification = 54)`.

{{site.data.alerts.callout_success}}
{% include {{ page.version.version }}/prod-deployment/resolution-inverted-lsm.md %}
{{site.data.alerts.end}}

#### Node health

If [issues at the storage layer](#lsm-health) remain unresolved, affected nodes will miss their liveness heartbeats, causing the cluster to lose nodes and eventually become unresponsive.

- The [**Node status**](ui-cluster-overview-page.html#node-status) on the Cluster Overview page indicates whether nodes are online (`LIVE`) or have crashed (`SUSPECT` or `DEAD`).

- The `/health` endpoint of the [Cluster API](cluster-api.html) returns a `500` error when a node is unhealthy.

- A [Prometheus alert](monitoring-and-alerting.html#node-is-down) can notify when a node has been down for 5 minutes or more.

If nodes have shut down, this can also be caused by [insufficient storage capacity](#storage-capacity).

{% include {{ page.version.version }}/prod-deployment/cluster-unavailable-monitoring.md %}

## Memory

CockroachDB is [resilient](demo-fault-tolerance-and-recovery.html) to node crashes. However, frequent node restarts caused by [out-of-memory (OOM) crashes](cluster-setup-troubleshooting.html#out-of-memory-oom-crash) can impact cluster stability and performance.

### Memory planning

Provision enough memory and allocate an appropriate portion for data caching:

| Category | Recommendations                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Memory   | <ul><li>Provision at least {% include {{ page.version.version }}/prod-deployment/provision-memory.md %}.</li><li>{% include {{ page.version.version }}/prod-deployment/prod-guidance-cache-max-sql-memory.md %} For more details, see the [Production Checklist](recommended-production-settings.html#cache-and-sql-memory-size).</li><li>{% include {{ page.version.version }}/prod-deployment/prod-guidance-disable-swap.md %}</li><li>See additional memory recommendations in the [Production Checklist](recommended-production-settings.html#memory).</li> |

### Memory monitoring

Monitor memory usage and node behavior for [OOM errors](cluster-setup-troubleshooting.html#out-of-memory-oom-crash):

| Metric or event                                 | Description                                 |
|-------------------------------------------------|---------------------------------------------|
| [Node process restarts](#node-process-restarts) | Nodes restarting after crashes.             |
| [SQL memory usage](#sql-memory-usage)           | The memory allocated to the SQL layer.      |
| [Database memory usage](#database-memory-usage) | The memory in use by CockroachDB processes. |

#### Node process restarts

CockroachDB attempts to restart nodes after they crash. Nodes that frequently restart following an abrupt process exit may point to an underlying memory issue.

- The [**Node status**](ui-cluster-overview-page.html#node-status) on the Cluster Overview page indicates whether nodes are online (`LIVE`) or have crashed (`SUSPECT` or `DEAD`).

- When deploying on [Kubernetes](kubernetes-overview.html), the `kubectl get pods` output contains a `RESTARTS` column that tracks the number of restarts for each CockroachDB pod.

- The `OPS` [logging channel](logging-overview.html#logging-channels) will record a [`node_restart` event](eventlog.html#node_restart) whenever a node rejoins the cluster after being offline.

- A [Prometheus alert](monitoring-and-alerting.html#node-is-restarting-too-frequently) can notify when a node has restarted more than 5 times in 10 minutes.

##### Verify OOM errors

If you observe nodes frequently restarting, confirm that the crashes are caused by [OOM errors](cluster-setup-troubleshooting.html#out-of-memory-oom-crash):

- Monitor `dmesg` to determine if a node crashed because it ran out of memory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ sudo dmesg | grep -iC 3 "cockroach"
    ~~~

    The following output indicates the node crashed due to insufficient memory:

    ~~~ shell
    $ host kernel: Out of Memory: Killed process <process_id> (cockroach).
    ~~~

- When deploying on [Kubernetes](kubernetes-overview.html), run `kubectl logs {pod-name}` and look for OOM errors in the log messages.

{{site.data.alerts.callout_success}}
{% include {{ page.version.version }}/prod-deployment/resolution-oom-crash.md %}
{{site.data.alerts.end}}

If you confirm that nodes are crashing due to OOM errors, also check whether [SQL queries](#sql-memory-usage) may be responsible.

#### SQL memory usage

An untuned SQL query can consume significant resources and impact the performance of other workloads.

- The [**SQL Memory**](ui-sql-dashboard.html#sql-memory) graph on the SQL dashboard shows the current amount of memory in KiB allocated to the SQL layer.

    {% include {{ page.version.version }}/prod-deployment/healthy-sql-memory.md %}

- {% include_cached new-in.html version="v21.2" %} The "active query dump", enabled by default with the `diagnostics.active_query_dumps.enabled` [cluster setting](cluster-settings.html), is a record of anonymized active queries that is written to disk when a node is detected to be under memory pressure.

    You can use the active query dump to correlate specific queries to OOM crashes. Active query dumps have the filename `activequeryprof.{date-and-time}.csv` and are found in the `heap_profiler` directory in the configured [logging directory](configure-logs.html#logging-directory). They are also included when running [`cockroach debug zip`](cockroach-debug-zip.html).

- A `SHOW STATEMENTS` statement can [identify long-running queries](manage-long-running-queries.html#identify-long-running-queries) on the cluster that may be consuming excessive memory.

- A [`memory budget exceeded`](common-errors.html#memory-budget-exceeded) error in the logs indicates that `--max-sql-memory`, the memory allocated to the SQL layer, was exceeded by the operation referenced in the error. For guidance on resolving this issue, see [Common Errors](common-errors.html#memory-budget-exceeded).

{{site.data.alerts.callout_success}}
{% include {{ page.version.version }}/prod-deployment/resolution-untuned-query.md %}
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
{% include {{page.version.version}}/sql/add-size-limits-to-indexed-columns.md %}
{{site.data.alerts.end}}

#### Database memory usage

CockroachDB memory usage includes both accounted memory, such as the amount allocated to `--cache` and `--max-sql-memory`; and unaccounted memory, such as uncollected Go garbage and process overhead.

- The [**Memory Usage**](ui-runtime-dashboard.html#memory-usage) graph on the Runtime dashboard shows the total memory in use by CockroachDB processes. The RSS (resident set size) metric represents actual CockroachDB memory usage from the OS/Linux/pod point of view. The Go and CGo metrics represent memory allocation and total usage from a CockroachDB point of view.

    {% include {{ page.version.version }}/prod-deployment/healthy-crdb-memory.md %}

For more context on acceptable memory usage, see [Suspected memory leak](cluster-setup-troubleshooting.html#suspected-memory-leak).

## Storage and disk I/O

The cluster will underperform if storage is not provisioned or configured correctly. This can lead to further issues such as [disk stalls](cluster-setup-troubleshooting.html#disk-stalls) and node shutdown.

### Storage and disk planning

Provision enough storage capacity for CockroachDB data, and configure your volumes to maximize disk I/O:

| Category | Recommendations                                                                                                                                                                                                                                                                                                                                                                                                                            |
|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Storage  | <ul><li>Provision volumes with {% include {{ page.version.version }}/prod-deployment/provision-storage.md %}.</li><li>{% include {{ page.version.version }}/prod-deployment/prod-guidance-store-volume.md %}</li><li>{% include {{ page.version.version }}/prod-deployment/prod-guidance-log-volume.md %}</li><li>See additional storage recommendations in the [Production Checklist](recommended-production-settings.html#storage).</li> |
| Disk I/O | <ul><li>Disks must be able to achieve {% include {{ page.version.version }}/prod-deployment/provision-disk-io.md %}.</li><li>{% include {{ page.version.version }}/prod-deployment/prod-guidance-lvm.md %}</li><li>See additional disk I/O recommendations in the [Production Checklist](recommended-production-settings.html#disk-i-o).</li>                                                                                              |

### Storage and disk monitoring

Monitor storage capacity and disk performance:

| Metric or event                                   | Description                                                                                                          |
|---------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| [Storage capacity](#storage-capacity)             | The available and used disk capacity in the CockroachDB [store](cockroach-start.html#store).                         |
| [Disk IOPS](#disk-iops)                           | The I/O requests per second.                                                                                         |
| [Node heartbeat latency](#node-heartbeat-latency) | The time between [node liveness](cluster-setup-troubleshooting.html#node-liveness-issues) heartbeats.                |
| [Command commit latency](#command-commit-latency) | The speed at which [Raft commands](architecture/replication-layer.html) are being committed by nodes in the cluster. |

#### Storage capacity

CockroachDB requires disk space in order to accept writes and report node liveness. When a node runs out of disk space, it [shuts down](#node-health) and cannot be restarted until space is freed up.

- The [**Capacity**](ui-storage-dashboard.html#capacity) graph on the Overview and Storage dashboards shows the available and used disk capacity in the CockroachDB [store](cockroach-start.html#store).

    {% include {{ page.version.version }}/prod-deployment/healthy-storage-capacity.md %}

- A [Prometheus alert](monitoring-and-alerting.html#node-is-running-low-on-disk-space) can notify when a node has less than 15% of free space remaining.

{{site.data.alerts.callout_success}}
Ensure that you [provision sufficient storage](recommended-production-settings.html#storage). If storage is correctly provisioned and is running low, CockroachDB automatically creates an emergency ballast file that can free up space. For details, see [Disks filling up](cluster-setup-troubleshooting.html#disks-filling-up).
{{site.data.alerts.end}}

#### Disk IOPS

Insufficient disk I/O can cause [poor SQL performance](#service-latency) and potentially [disk stalls](cluster-setup-troubleshooting.html#disk-stalls).

- The [**Disk Ops In Progress**](ui-hardware-dashboard.html#disk-ops-in-progress) graph on the Hardware dashboard shows the number of disk reads and writes in queue.

    {% include {{ page.version.version }}/prod-deployment/healthy-disk-ops-in-progress.md %}

- The Linux tool `iostat` (part of `sysstat`) can be used to monitor IOPS. In the device status output, `avgqu-sz` corresponds to the **Disk Ops In Progress** metric. If service times persist in double digits on any node, this means that your storage device is saturated and is likely under-provisioned or misconfigured.

{{site.data.alerts.callout_success}}
Ensure that you [properly configure storage](#storage-and-disk-monitoring) to prevent I/O bottlenecks. Afterward, if service times consistently exceed 1-5 ms, you can add more devices or expand the cluster to reduce the disk latency.
{{site.data.alerts.end}}

With insufficient disk I/O, you may also see:

- Degradation in [SQL response time](#service-latency).
- An [unhealthy LSM](#lsm-health).

#### Node heartbeat latency

Because each node needs to update a liveness record on disk, maxing out disk bandwidth can cause liveness heartbeats to be missed.

- The **Node Heartbeat Latency: 99th percentile** and **Node Heartbeat Latency: 90th percentile** graphs on the Distributed Dashboard show the time elapsed between [node liveness](cluster-setup-troubleshooting.html#node-liveness-issues) heartbeats.

    {% include {{ page.version.version }}/prod-deployment/healthy-node-heartbeat-latency.md %}

#### Command commit latency

- The **Command Commit Latency: 50th percentile** and **Command Commit Latency: 99th percentile** graphs on the [Storage dashboard](ui-storage-dashboard.html) show how quickly [Raft commands](architecture/replication-layer.html) are being committed by nodes in the cluster. This is a good signal of I/O load.

    {% include {{ page.version.version }}/prod-deployment/healthy-command-commit-latency.md %}

## See also

- [Production Checklist](recommended-production-settings.html)
- [Monitoring and Alerting](monitoring-and-alerting.html)
- [Common Errors and Solutions](common-errors.html)
- [Operational FAQs](operational-faqs.html)
- [Performance Tuning Recipes](performance-recipes.html)
- [Troubleshoot Cluster Setup](cluster-setup-troubleshooting.html)
- [Troubleshoot SQL Behavior](query-behavior-troubleshooting.html)
- [Admission Control](architecture/admission-control.html)
- [Alerts Page](../cockroachcloud/alerts-page.html) ({{ site.data.products.dedicated }})
