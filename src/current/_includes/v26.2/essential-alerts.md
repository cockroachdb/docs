{% if include.deployment == 'self-hosted' %}
## Platform

### High CPU

A node with a high CPU utilization, an *overloaded* node, has a limited ability to process the user workload and increases the risks of cluster instability.

**Metric**
<br>[`sys.cpu.combined.percent-normalized`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#sys-cpu-combined-percent-normalized)
<br>[`sys.cpu.host.combined.percent-normalized`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#sys-cpu-host-combined-percent-normalized)

**Rule**
<br>Set alerts for each node for each of the listed metrics:
<br>WARNING:  Metric greater than `0.80` for `4 hours`
<br>CRITICAL:  Metric greater than `0.90` for `1 hour`

**Action**

- Refer to [CPU Usage]({% link {{ page.version.version }}/common-issues-to-monitor.md %}#cpu-usage) and [Workload Concurrency]({% link {{ page.version.version }}/common-issues-to-monitor.md %}#workload-concurrency).

- In the DB Console, navigate to **Metrics**, [**Hardware** dashboard]({% link {{ page.version.version }}/ui-hardware-dashboard.md %}) for the cluster and check for high values on the [**CPU Percent** graph]({% link {{ page.version.version }}/ui-hardware-dashboard.md %}#cpu-percent) and the [**Host CPU Percent** graph]({% link {{ page.version.version }}/ui-hardware-dashboard.md %}#host-cpu-percent).

- In the DB Console, navigate to **Metrics**, [**SQL** dashboard]({% link {{ page.version.version }}/ui-sql-dashboard.md %}) for the cluster and check for high values on the [**Active SQL Statements** graph]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#active-sql-statements). This graph shows the true concurrency of the workload, which may exceed the cluster capacity planning guidance of no more than 4 active statements per vCPU or core.

- A persistently high CPU utilization of all nodes in a CockroachDB cluster suggests the current compute resources may be insufficient to support the user workload's concurrency requirements. If confirmed, the number of processors (vCPUs or cores) in the CockroachDB cluster needs to be adjusted to sustain the required level of workload concurrency. For a prompt resolution, either add cluster nodes or throttle the workload concurrency, for example, by reducing the number of concurrent connections to not exceed 4 active statements per vCPU or core.

### Hot node (hotspot)

Unbalanced utilization of CockroachDB nodes in a cluster may negatively affect the cluster's performance and stability, with some nodes getting overloaded while others remain relatively underutilized.

**Metric**
<br>[`sys.cpu.combined.percent-normalized`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#sys-cpu-host-combined-percent-normalized)
<br>[`sys.cpu.host.combined.percent-normalized`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#sys-cpu-host-combined-percent-normalized)

**Rule**
<br>Set alerts for each of the listed metrics:
<br>WARNING: The max CPU utilization across all nodes exceeds the cluster's median CPU utilization by `30` for `2 hours`

**Action**

- Refer to [Understand hotspots]({% link {{ page.version.version }}/understand-hotspots.md %}).

### Node memory utilization

One node with high memory utilization is a cluster stability risk. High memory utilization is a prelude to a node's [out-of-memory (OOM) crash]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#out-of-memory-oom-crash) — the process is terminated by the OS when the system is critically low on memory. An OOM condition is not expected to occur if a CockroachDB cluster is provisioned and sized per [Cockroach Labs guidance]({% link {{ page.version.version }}/common-issues-to-monitor.md %}#memory-planning).

**Metric**
<br>[`sys.rss`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#sys-rss)

**Rule**
<br>Set alerts for each node:
<br>WARNING:  `sys.rss` greater than `0.80` for `4 hours`
<br>CRITICAL:  `sys.rss` greater than `0.90` for `1 hour`

**Action**

- Provision all CockroachDB VMs or machines with [sufficient RAM]({% link {{ page.version.version }}/recommended-production-settings.md %}#memory).

### Node storage performance

Under-configured or under-provisioned disk storage is a common root cause of inconsistent CockroachDB cluster performance and could also lead to cluster instability. Refer to [Disk IOPS]({% link {{ page.version.version }}/common-issues-to-monitor.md %}#disk-iops).

**Metric**
<br>[`sys.host.disk.iopsinprogress`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#sys-host-disk-iopsinprogress)

**Rule**
<br>WARNING:  `sys.host.disk.iopsinprogress` greater than `10` for `10 seconds`
<br>CRITICAL:  `sys.host.disk.iopsinprogress` greater than `20` for `10 seconds`

**Action**

- Provision enough storage capacity for CockroachDB data, and configure your volumes to maximize disk I/O. Refer to [Storage and disk I/O]({% link {{ page.version.version }}/common-issues-to-monitor.md %}#storage-and-disk-i-o).

### Version mismatch

All CockroachDB cluster nodes should be running the same exact executable (with identical build label). This warning guards against an operational error where some nodes were not upgraded.

**Metric**
<br>`build.timestamp`

**Rule**
<br>Set alerts for each node:
<br>WARNING:  `build.timestamp` not the same across cluster nodes for more than `4 hours`

**Action**

- Ensure all cluster nodes are running exactly the same CockroachDB version, including the patch release version number.

### High open file descriptor count

Send an alert when a cluster is getting close to the open file descriptor limit.

**Metric**
<br>`sys.fd.open`
<br>`sys.fd.softlimit`

**Rule**
<br>Set alerts for each node:
<br>WARNING:  `sys_fd_open` / `sys_fd_softlimit` greater than `0.8` for `10 minutes`

**Action**

- Refer to [File descriptors limit]({% link {{ page.version.version }}/recommended-production-settings.md %}#file-descriptors-limit).
{% endif %}

## Storage

### Node storage capacity

A CockroachDB node will not able to operate if there is no free disk space on a CockroachDB [store]({% link {{ page.version.version }}/cockroach-start.md %}#store) volume.

**Metric**
<br>[`capacity`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#capacity)
<br>[`capacity.available`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#capacity-available)

**Rule**
<br>Set alerts for each node:
<br>WARNING:  `capacity.available`/`capacity` is less than `0.30` for `24 hours`
<br>CRITICAL:  `capacity.available`/`capacity` is less than `0.10` for `1 hour`

**Action**

- Refer to [Storage Capacity]({% link {{ page.version.version }}/common-issues-to-monitor.md %}#storage-capacity).
- Increase the size of CockroachDB node storage capacity.  CockroachDB  storage volumes should not be utilized more than 60% (40% free space).
- In a "disk full" situation, you may be able to get a node "unstuck" by removing the [automatically created emergency ballast file]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#automatic-ballast-files).

{% if include.deployment == 'self-hosted' %}
### Write stalls

A high `write-stalls` value means CockroachDB is unable to write to a disk in an acceptable time, resulting in CockroachDB facing a disk latency issue and not responding to writes.

**Metric**
<br>[`storage.write-stalls`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#storage-write-stalls)

**Rule**
<br>Set alerts for each node:
<br>WARNING:  `storage.write-stalls` per minute is greater than or equal to `1` per minute
<br>CRITICAL:  `storage.write-stalls` per second is greater than or equal to `1` per second

**Action**

- Refer to [Disk stalls]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#disk-stalls).
{% endif %}

{% if include.deployment == 'self-hosted' %}
## Health

### Node restarting too frequently

Send an alert if a node has restarted more than once in the last 10 minutes. Calculate this using the number of times the `sys.uptime` metric was reset back to zero.

**Metric**
<br>[`sys.uptime`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#sys-uptime)

**Rule**
<br>Set alerts for each node:
<br>WARNING:  `sys.uptime` resets greater than `1` in the last `10 minutes`

**Action**

- Refer to [Node process restarts]({% link {{ page.version.version }}/common-issues-to-monitor.md %}#node-process-restarts).

### Node LSM storage health

CockroachDB uses the [Pebble]({% link {{ page.version.version }}/architecture/storage-layer.md %}#pebble) storage engine that uses a [Log-structured Merge-tree (LSM tree)]({% link {{ page.version.version }}/architecture/storage-layer.md %}#log-structured-merge-trees) to manage data storage. The health of an LSM tree can be measured by the [*read amplification*]({% link {{ page.version.version }}/architecture/storage-layer.md %}#inverted-lsms), which is the average number of [SST files]({% link {{ page.version.version }}/architecture/storage-layer.md %}#log-structured-merge-trees) being checked per read operation. A value in the single digits is characteristic of a healthy LSM tree. A value in the double, triple, or quadruple digits suggests an [inverted LSM]({% link {{ page.version.version }}/architecture/storage-layer.md %}#inverted-lsms). A node reporting a high read amplification is an indication of a problem on that node that is likely to affect the workload.

**Metric**
<br>`rocksdb.read-amplification`

**Rule**
<br>Set alerts for each node:
<br>WARNING: `rocksdb.read-amplification` greater than `50` for `1 hour`
<br>CRITICAL:  `rocksdb.read-amplification` greater than `150` for `15 minutes`

**Action**

- Refer to [LSM Health]({% link {{ page.version.version }}/common-issues-to-monitor.md %}#lsm-health).

## Expiration of license and certificates

### Enterprise license expiration

Avoid [license]({% link {{ page.version.version }}/licensing-faqs.md %}#types-of-licenses) expiration to avoid any disruption to feature access.

**Metric**
<br>[`seconds.until.enterprise.license.expiry`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#seconds-until-enterprise-license-expiry)

**Rule**
<br>WARNING:  `seconds.until.enterprise.license.expiry` is greater than `0` and less than `1814400` seconds (3 weeks)
<br>CRITICAL:  `seconds.until.enterprise.license.expiry` is greater than `0` and less than `259200` seconds (3 days)

**Action**

[Renew the enterprise license]({% link {{ page.version.version }}/licensing-faqs.md %}#renew-an-expired-license).

### Security certificate expiration

Avoid [security certificate]({% link {{ page.version.version }}/cockroach-cert.md %}) expiration.

**Metric**
<br>[`security.certificate.expiration.ca`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#security-certificate-expiration-ca)
<br>[`security.certificate.expiration.client-ca`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#security-certificate-expiration-client-ca)
<br>[`security.certificate.expiration.ui`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#security-certificate-expiration-ui)
<br>[`security.certificate.expiration.ui-ca`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#security-certificate-expiration-ui-ca)
<br>[`security.certificate.expiration.node`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#security-certificate-expiration-node)
<br>[`security.certificate.expiration.node-client`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#security-certificate-expiration-node-client)

**Rule**
<br>Set alerts for each of the listed metrics:
<br>WARNING:  Metric is greater than `0` and less than `1814400` seconds (3 weeks) until enterprise license expiration
<br>CRITICAL:  Metric is greater than `0` and less than `259200` seconds (3 days) until enterprise license expiration

**Action**

[Rotate the expiring certificates]({% link {{ page.version.version }}/rotate-certificates.md %}).
{% endif %}

{% if include.deployment == 'self-hosted' %}
## KV distributed

{{site.data.alerts.callout_info}}
During [rolling maintenance]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}) or planned cluster resizing, the nodes' state and count will be changing. **Mute KV distributed alerts described in the following sections during routine maintenance procedures** to avoid unnecessary distractions.
{{site.data.alerts.end}}

### Heartbeat latency

Monitor the cluster health for early signs of instability. If this metric exceeds 1 second, it is a sign of instability. 

**Metric**
<br>[`liveness.heartbeatlatency`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#liveness-heartbeatlatency)

**Rule**
<br>WARNING: `liveness.heartbeatlatency` greater than `0.5s`
<br>CRITICAL: `liveness.heartbeatlatency` greater than `3s`

**Action**

- Refer to [Node liveness issues]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#node-liveness-issues).

### Live node count change

The liveness checks reported by a node is inconsistent with the rest of the cluster. Number of live nodes in the cluster (will be 0 if this node is not itself live). This is a critical metric that tracks the live nodes in the cluster.

**Metric**
<br>[`liveness.livenodes`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#liveness-livenodes)

**Rule**
<br>Set alerts for each node:
<br>WARNING: max(`liveness.livenodes`) for the cluster - min(`liveness.livenodes`) for node > `0` for `2 minutes`
<br>CRITICAL: max(`liveness.livenodes`) for the cluster - min(`liveness.livenodes`) for node > `0` for `5 minutes`

**Action**

- Refer to [Node liveness issues]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#node-liveness-issues).

### Intent buildup

Send an alert when very large transactions are [locking]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#write-intents) millions of keys (rows). A common example is a transaction with a [`DELETE`]({% link {{ page.version.version }}/delete.md %}) that affects a large number of rows. Transactions with an excessively large scope are often inadvertent, perhaps due to a non-selective filter and a specific data distribution that was not anticipated by an application developer.

Transactions that create a large number of [write intents]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#write-intents) could have a negative effect on the workload's performance. These transactions may create locking contention, thus limiting concurrency. This would reduce throughput, and in extreme cases, lead to stalled workloads.

**Metric**
<br>`intentcount`

**Rule**
<br>WARNING:  `intentcount` greater than 10,000,000 for 2 minutes
<br>CRITICAL:  `intentcount` greater than 10,000,000 for 5 minutes
<br>For tighter transaction scope scrutiny, lower the `intentcount` threshold that triggers an alert.

**Action**

- Identify the large scope transactions that acquire a lot of locks. Consider reducing the scope of large transactions, implementing them as several smaller scope transactions. For example, if the alert is triggered by a large scope `DELETE`, consider "paging" `DELETE`s that target thousands of records instead of millions. This is often the most effective resolution, however it generally means an application level [refactoring]({% link {{ page.version.version }}/bulk-update-data.md %}).
- After reviewing the workload, you may conclude that a possible performance impact of allowing transactions to take a large number of intents is not a concern. For example, a large delete of obsolete, not-in-use data may create no concurrency implications and the elapsed time to execute that transaction may not be impactful. In that case, no response could be a valid way to handle this alert.
{% endif %}

{% if include.deployment == 'self-hosted' %}
## KV replication

### Unavailable ranges

Send an alert when the number of ranges with fewer live replicas than needed for quorum is non-zero for too long.

**Metric**
<br>[`ranges.unavailable`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#ranges-unavailable)

**Rule**
<br>WARNING:  `ranges.unavailable` greater than `0` for `10 minutes`

**Action**

- Refer to [Replication issues]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#replication-issues).

### Tripped replica circuit breakers

Send an alert when a replica stops serving traffic due to other replicas being offline for too long.

**Metric**
<br>`kv.replica_circuit_breaker.num_tripped_replicas`

**Rule**
<br>WARNING:  `kv.replica_circuit_breaker.num_tripped_replicas` greater than `0` for `10 minutes`

**Action**

- Refer to [Per-replica circuit breakers]({% link {{ page.version.version }}/architecture/replication-layer.md %}#per-replica-circuit-breakers) and [Replication issues]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#replication-issues).

### Under-replicated ranges

Send an alert when the number of ranges with replication below the replication factor is non-zero for too long.

**Metric**
<br>[`ranges.underreplicated`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#ranges-underreplicated)

**Rule**
<br>WARNING:  `ranges.underreplicated` greater than `0` for `1 hour`

**Action**

- Refer to [Replication issues]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#replication-issues).

### Requests stuck in Raft

Send an alert when requests are taking a very long time in replication. An (evaluated) request has to pass through the replication layer, notably the quota pool and raft. If it fails to do so within a highly permissive duration, the gauge is incremented (and decremented again once the request is either applied or returns an error). A nonzero value indicates range or replica unavailability, and should be investigated. This can also be a symptom of a [leader-leaseholder split]({% link {{ page.version.version }}/architecture/replication-layer.md %}#leader-leaseholder-splits).

**Metric**
<br>`requests.slow.raft`

**Rule**
<br>WARNING:  `requests.slow.raft` greater than `0` for `10 minutes`

**Action**

- Refer to [Raft]({% link {{ page.version.version }}/architecture/replication-layer.md %}#raft) and [Replication issues]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#replication-issues).
{% endif %}

## SQL 

### Node not executing SQL

Send an alert when a node is not executing SQL despite having connections. `sql.conns` shows the number of connections as well as the distribution, or balancing, of connections across cluster nodes. An imbalance can lead to nodes becoming overloaded.

**Metric**
<br>[`sql.conns`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#sql-conns)
<br>`sql.query.count`

**Rule**
<br>Set alerts for each node:
<br>WARNING:  `sql.conns` greater than `0` while `sql.query.count` equals `0`

**Action**

- Refer to [Connection Pooling]({% link {{ page.version.version }}/connection-pooling.md %}).

### SQL query failure

Send an alert when the query failure count exceeds a user-determined threshold based on their application's SLA.

**Metric**
<br>[`sql.failure.count`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#sql-failure-count)

**Rule**
<br>WARNING:  `sql.failure.count` is greater than a threshold (based on the user’s application SLA)

**Action**

-  Use the [**Insights** page]({% link {{ page.version.version }}/ui-insights-page.md %}) to find failed executions with their error code to troubleshoot or use application-level logs, if instrumented, to determine the cause of error.

### SQL queries experiencing high latency

Send an alert when the query latency exceeds a user-determined threshold based on their application’s SLA.

**Metric**
<br>[`sql.service.latency`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#sql-service-latency)
<br>[`sql.conn.latency`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#sql-conn-latency)

**Rule**
<br>WARNING:  (p99 or p90 of `sql.service.latency` plus average of `sql.conn.latency`) is greater than a threshold (based on the user’s application SLA)

**Action**

- Apply the time range of the alert to the [**SQL Activity** pages]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#sql-activity-pages) to investigate. Use the [**Statements** page]({% link {{ page.version.version }}/ui-statements-page.md %}) P90 Latency and P99 latency columns to correlate [statement fingerprints]({% link {{ page.version.version }}/ui-statements-page.md %}#sql-statement-fingerprints) with this alert.

{% if include.deployment == 'self-hosted' %}
## Backup

### Backup failure

While CockroachDB is a distributed product, there is always a need to ensure backups complete.

**Metric**
<br>[`schedules.BACKUP.failed`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#schedules-BACKUP-failed)

**Rule**
<br>Set alerts for each node:
<br>WARNING:  `schedules.BACKUP.failed` is greater than `0`

**Action**

- Refer to [Backup and Restore Monitoring]({% link {{ page.version.version }}/backup-and-restore-monitoring.md %}).
{% endif %}

## Changefeeds

{{site.data.alerts.callout_info}}
During [rolling maintenance]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}), [changefeed jobs]({% link {{ page.version.version }}/change-data-capture-overview.md %}) restart following node restarts. **Mute changefeed alerts described in the following sections during routine maintenance procedures** to avoid unnecessary distractions.
{{site.data.alerts.end}}

### Changefeed failure

Changefeeds can suffer permanent failures (that the [jobs system]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}) will not try to restart). Any increase in this metric counter should prompt investigative action.

**Metric**
<br>[`changefeed.failures`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#changefeed-failures)

**Rule**
<br>CRITICAL:  If `changefeed.failures` is greater than `0`

**Action**

1. If the alert is triggered during cluster maintenance, mute it. Otherwise start investigation with the following query:

    {% include_cached copy-clipboard.html %}
    ```sql
    SELECT job_id, status, ((high_water_timestamp/1000000000)::INT::TIMESTAMP) - NOW() AS "changefeed latency", created, LEFT(description, 60), high_water_timestamp FROM crdb_internal.jobs WHERE job_type = 'CHANGEFEED' AND status IN ('running', 'paused', 'pause-requested') ORDER BY created DESC;
    ```

2. If the cluster is not undergoing maintenance, check the health of [sink]({% link {{ page.version.version }}/changefeed-sinks.md %}) endpoints. If the sink is [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka), check for sink connection errors such as `ERROR: connecting to kafka: path.to.cluster:port: kafka: client has run out of available brokers to talk to (Is your cluster reachable?)`.

### Frequent changefeed restarts

Changefeeds automatically restart in case of transient errors. However too many restarts outside of a routine maintenance procedure may be due to a systemic condition and should be investigated.

**Metric**
<br>[`changefeed.error_retries`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#changefeed-error-retries)

**Rule**
<br>WARNING:  If `changefeed.error_retries` is greater than `50` for more than `15 minutes`

**Action**

- Follow the action for a [changefeed failure](#changefeed-failure).

### Changefeed falling behind

Changefeed has fallen behind. This is determined by the end-to-end lag between a committed change and that change applied at the destination. This can be due to cluster capacity or changefeed sink availability.

**Metric**
<br>[`changefeed.commit_latency`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#changefeed-commit-latency)

**Rule**
<br>WARNING:  `changefeed.commit_latency` is greater than `10 minutes`
<br>CRITICAL:  `changefeed.commit_latency` is greater than `15 minutes`

**Action**

1. In the DB Console, navigate to **Metrics**, [**Changefeeds** dashboard]({% link {{ page.version.version }}/ui-cdc-dashboard.md %}) for the cluster and check the maximum values on the [**Commit Latency** graph]({% link {{ page.version.version }}/ui-cdc-dashboard.md %}#commit-latency). Alternatively, individual changefeed latency can be verified by using the following SQL query:

    {% include_cached copy-clipboard.html %}
    ```sql
    SELECT job_id, status, ((high_water_timestamp/1000000000)::INT::TIMESTAMP) - NOW() AS "changefeed latency", created, LEFT(description, 60), high_water_timestamp FROM crdb_internal.jobs WHERE job_type = 'CHANGEFEED' AND status IN ('running', 'paused', 'pause-requested') ORDER BY created DESC;
    ```

2. Copy the `job_id` for the changefeed job with highest `changefeed latency` and pause the job:

    {% include_cached copy-clipboard.html %}
    ```sql
    PAUSE JOB 681491311976841286;
    ```

3. Check the status of the pause request by running the query from step 1. If the job status is `pause-requested`, check again in a few minutes.

4. After the job is `paused`, resume the job.

    {% include_cached copy-clipboard.html %}
    ```sql
    RESUME JOB 681491311976841286;
    ```

5. If the changefeed latency does not progress after these steps due to lack of cluster resources or availability of the changefeed sink, [contact Support](https://support.cockroachlabs.com).

### Changefeed has been paused a long time 

Changefeed jobs should not be paused for a long time because [the protected timestamp prevents garbage collection]({% link {{ page.version.version }}/protect-changefeed-data.md %}). To protect against an operational error, this alert guards against an inadvertently forgotten pause. 

**Metric**
<br>[`jobs.changefeed.currently_paused`]({% link {{ page.version.version }}/essential-metrics-{{ include.deployment }}.md %}#jobs-changefeed-currently-paused)

**Rule**
<br>WARNING:  `jobs.changefeed.currently_paused` is greater than `0` for more than `15 minutes`
<br>CRITICAL:  `jobs.changefeed.currently_paused` is greater than `0` for more than `60 minutes`

**Action**

1. Check the status of each changefeed using the following SQL query: 

    {% include_cached copy-clipboard.html %}
    ```sql
    SELECT job_id, status, ((high_water_timestamp/1000000000)::INT::TIMESTAMP) - NOW() AS "changefeed latency",created, LEFT(description, 60), high_water_timestamp FROM crdb_internal.jobs WHERE job_type = 'CHANGEFEED' AND status IN ('running', 'paused','pause-requested') ORDER BY created DESC;
    ```

2. If all the changefeeds have status as `running`, one or more changefeeds may have run into an error and recovered. In the DB Console, navigate to **Metrics**, [**Changefeeds** dashboard]({% link {{ page.version.version }}/ui-cdc-dashboard.md %}) for the cluster and check the [**Changefeed Restarts** graph]({% link {{ page.version.version }}/ui-cdc-dashboard.md %}#changefeed-restarts).

3. Resume paused changefeed(s) with the `job_id` using:
   
    {% include_cached copy-clipboard.html %}
    ```sql
    RESUME JOB 681491311976841286;
    ```

### Changefeed experiencing high latency

Send an alert when the maximum latency of any running changefeed exceeds a specified threshold, which is less than the [`gc.ttlseconds`]({% link {{ page.version.version }}/configure-replication-zones.md %}#replication-zone-variables) variable set in the cluster. This alert ensures that the changefeed progresses faster than the garbage collection TTL, preventing a changefeed's protected timestamp from delaying garbage collection.

**Metric**
<br>[`changefeed.checkpoint_progress`]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#metrics)

**Rule**
<br>WARNING: (current time minus `changefeed.checkpoint_progress`) is greater than a threshold (that is less than `gc.ttlseconds` variable)

**Action**

- Refer to [Monitor and Debug Changefeeds]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#recommended-changefeed-metrics-to-track).

## See also

- [Events to alert on]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#events-to-alert-on)
- [Common Issues to Monitor]({% link {{ page.version.version }}/common-issues-to-monitor.md %})
{% if include.deployment == 'self-hosted' %}
- [Essential Metrics for CockroachDB Self-Hosted Deployments]({% link {{ page.version.version }}/essential-metrics-self-hosted.md %})
{% elsif include.deployment == 'advanced' %}
- [Essential Metrics for CockroachDB Advanced Deployments]({% link {{ page.version.version }}/essential-metrics-advanced.md %})
{% endif %}

