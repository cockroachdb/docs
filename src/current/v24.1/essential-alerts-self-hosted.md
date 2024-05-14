---
title: Essential Alerts for CockroachDB Self-Hosted Deployments
summary: Essential Alerts for Self-Hosted Deployments
toc: true
---

**Action**

## Changefeeds

{{site.data.alerts.callout_info}}
During [rolling maintenance]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}), the [changefeed jobs]({% link {{ page.version.version }}/change-data-capture-overview.md %}) restart following node restarts. **Mute alerts described below during routine maintenance procedures** to avoid unnecessary distractions.
{{site.data.alerts.end}}

### Changefeed Failure

Changefeeds can suffer permanent failures (that the [jobs system]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}) will not try to restart). Any increase in this metric counter should prompt investigative action.

**Metric**    [`changefeed.failures`]({% link {{ page.version.version }}/essential-metrics-self-hosted.md %}#changefeed-failures)

**Rule**        CRITICAL:  If `changefeed.failures` is greater than 0. 

**Action**

1. If the alert is triggered during cluster maintenance, mute it. Otherwise start investigation with the following query:

    {% include_cached copy-clipboard.html %}
    ```sql
    select job_id, status,((high_water_timestamp/1000000000)::int::timestamp)-now() as "changefeed latency",created, left(description,60),high_water_timestamp from crdb_internal.jobs where job_type = 'CHANGEFEED' and status in ('running', 'paused','pause-requested') order by created desc;
    ```

2. If the cluster is not undergoing maintenance, check the health of [sink]({% link {{ page.version.version }}/changefeed-sinks.md %}) endpoints. If the sink is [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka), check for sink connection errors such as `ERROR: connecting to kafka: path.to.cluster:port: kafka: client has run out of available brokers to talk to (Is your cluster reachable?)`.

### Frequent Changefeed Restarts

Changefeeds automatically restart in case of transient errors. However "too many" restarts (outside of a routine maintenance procedure) may be due to a systemic condition and should be investigated.

**Metric**    [`changefeed.error_retries`]({% link {{ page.version.version }}/essential-metrics-self-hosted.md %}#changefeed-error-retries)

**Rule**        WARNING:  If `changefeed.error_retries` is greater than `50` for more than `15 minutes`.

**Action**

Follow the action for a [changefeed failure](#changefeed-failure).

### Changefeed Falling Behind

Changefeed has fallen behind. This is determined by the end-to-end lag between a committed change and that change applied at the destination. This can be due to cluster capacity or changefeed sink availability.

**Metric**    [`changefeed.commit_latency`]({% link {{ page.version.version }}/essential-metrics-self-hosted.md %}#changefeed-commit-latency)

**Rule**        WARNING:  Max end-to-end lag for any changefeed is greater than `10 minutes`.

                  CRITICAL:  Max end-to-end lag for any changefeed is greater than `15 minutes`.

**Action**

1. Open changefeeds metrics dashboard for the cluster (e.g. https://url/#/metrics/changefeeds/cluster) and check max latency. Alternatively, individual changefeed latency can be verified by using the SQL cli:

    {% include_cached copy-clipboard.html %}
    ```sql
    select job_id, status,((high_water_timestamp/1000000000)::int::timestamp)-now() as "changefeed latency",created, left(description,60),high_water_timestamp from crdb_internal.jobs where job_type = 'CHANGEFEED' and status in ('running', 'paused','pause-requested') order by created desc;
    ```

2. Copy the job number for the changefeed job with highest latency and pause it

    {% include_cached copy-clipboard.html %}
    ```sql
    PAUSE JOB 681491311976841286;
    ```

3. Check the status of the pause request by running the same query from step 1. If the job status is `pause-requested`, check again in few minutes.

4. After the job is `paused`, resume the job.

```sql
RESUME JOB 681491311976841286;
```

5. The changefeed latency may not progress after above steps due to lack of cluster resources, availability of changefeed sink, etc.  Escalate to L2 Support.





-----------------

### Alert: Changefeed has been Paused for long time 

#### Purpose of this Alert

A hedge against an operational error. Changefeed jobs should not be  paused for long time b/c the protected timestamp prevents garbage collections.  This is a safety catch to guard against an inadvertently "forgotten" pause. 

------

#### Monitoring Metric

```
jobs.changefeed.currently_paused
```


#### Alert Rule

| Tier     | Definition                                                   |
| -------- | ------------------------------------------------------------ |
| WARNING  | The number of paused changefeeds is greater than `0` for more than `15 minutes` |
| CRITICAL | The number of paused changefeeds is greater than `0` for more than `60 minutes` |


#### Alert Response

1. Open SQL cli and check status of each changefeed. 

```sql
select job_id, status,((high_water_timestamp/1000000000)::int::timestamp)-now() as "changefeed latency",created, left(description,60),high_water_timestamp from crdb_internal.jobs where job_type = 'CHANGEFEED' and status in ('running', 'paused','pause-requested') order by created desc;
```
2. If all the changefeeds are in `running` state, one or more feed may have ran into an error and recovered. Check the UI (e.g. `https://<cluster_url>/#/metrics/changefeeds/cluster`) for number of changefeed restarts. 
3.  Resume paused changefeed(s) with the job id (e.g. `RESUME JOB 681491311976841286;`).


## Expirations

### Alert: Enterprise License Expiration

#### Purpose of this Alert

Avoid enterprise license expiration.

------

#### Monitoring Metric

```
seconds.until.enterprise.license.expiry
```

Seconds until enterprise license expiry. If no license is present, this metric is 0.



#### Alert Rule

| Tier     | Definition                                                   |
| -------- | ------------------------------------------------------------ |
| WARNING  | Less than 1814400 seconds (3 weeks) until enterprise license expiry |
| CRITICAL | Less than 259200 seconds (3 days) until enterprise license expiry |

#### Alert Response

Renew the enterprise license.

---------------------------------





### Alert: Security Certificate Expiration

#### Purpose of this Alert

Avoid security certificate expiration.

------

#### Monitoring Metric

```
security.certificate.expiration.ca
security.certificate.expiration.client-ca
security.certificate.expiration.ui-ca
security.certificate.expiration.node
security.certificate.expiration.node-client
security.certificate.expiration.ui
```

Expiration timestamp in seconds since Unix epoch for the certificate. 0 means no certificate or error.

Set the alert for each type of certificate.



#### Alert Rule

| Tier     | Definition                                                   |
| -------- | ------------------------------------------------------------ |
| WARNING  | Less than 1814400 seconds (3 weeks) until enterprise license expiry |
| CRITICAL | Less than 259200 seconds (3 days) until enterprise license expiry |

#### Alert Response

Rotate the expiring certificates.

## Intent Buildup

### Alert: Intent Buildup

#### Purpose of this Alert

This alert brings operator's attention to very large transactions that are [locking](https://www.cockroachlabs.com/docs/v22.1/architecture/transaction-layer.html#write-intents) millions of keys (rows). A common example of such transaction is a very large scope DELETE. Transactions with an excessively large scope are often inadvertent, for example due to a non-selective filter and specific data distribution that was not anticipated by an application developer.

Transactions that create a large number of intents could have a negative effect on the workload's performance:

- By creating locking contention, thus limiting concurrency, and therefore reducing the throughput, leading to stalled workloads in extreme cases
- Transactions may take non-intuitively larger amount of time to complete, with significant variations in execution latency. This would be caused by an exhaustion of the memory budget to track intents.
  The maximum number of bytes used to track locks in a transaction is configured with a cluster setting `kv.transaction.max_intents_bytes`. When a transaction modifies keys, it keeps track of the keys it has written, e.g. `a,d,g`. This allows intent resolution to know exactly which intents were written, providing a direct / point resolution.  However, if this list exceeds the memory budget, the point intent resolutions changes to range intent resolutions, which stores `a-g`, i.e. “I wrote some keys between `a` and `g`”. When another transaction  needs to resolve these intents, it has to scan everything in `a-g`, looking for those intents. Cleaning up range intents also takes a considerably larger amount of time and processing resources vs. the list of point intents.
  In v21.1 or earlier, this meant scanning all data in that range, which could take a significant amount of time, particularly when that scan encountered write intents that would block that scan.
  In v21.2, intents are stored separately from regular data, so this scan is much faster, resulting in a more limited performance overhead.

------

#### Monitoring Metric

```
intentcount
```

Operators can also create custom alerts on `intentbytes` (maximum number of bytes used to track locks in transactions) to track the memory utilization against the budget (cluster setting `kv.transaction.max_intents_bytes`).

Related messages in the log:

*`... a transaction has hit the intent tracking limit (kv.transaction.max_intents_bytes); is it a bulk operation?*`*



#### Alert Rule

| Tier     | Definition                                                |
| -------- | --------------------------------------------------------- |
| CRITICAL | Total cluster-wide intent count exceeds 10M for 5 minutes |
| WARNING  | Total cluster-wide intent count exceeds 10M for 2 minutes |

Operators may elect to lower the intent count threshold that triggers an alert, for tighter transaction scope scruitiny.



#### Alert Response

Upon receiving this the alert, an operator can take any of the following actions:

- Identify the large scope transactions that acquire a lot of locks. Consider reducing the scope of large transactions, implementing them as several smaller scope transactions. For example, if the alert is triggered by a large scope DELETE, consider "paging" DELETEs that target thousands of records instead of millions. This is often the most effective resolution, however it generally means an application level [refactoring](https://www.cockroachlabs.com/docs/stable/bulk-update-data.html).
- As a hedge against non-intuitive SQL response time variations, adjust the cluster setting `kv.transaction.max_intents_bytes`.
  A larger value increases the memory budget for a point intent resolution list.
  In v21.1 or earlier, the default for this setting is low and can be increased to a safe limit of 4 MB.
  In v21.2 the default for this setting is [4 MB](https://github.com/cockroachdb/cockroach/issues/54029).
  Increasing this setting beyond the 21.2 default may be warranted in specific circumstances, however an operator should keep in perspective that this setting is per-transaction and therefore, if set to a high value, may lead to an out-of-memory (OOM) event in high concurrency environments.
- After reviewing the workload, an operator may conclude that a possible performance impact (discussed above) of allowing transactions to take a large number of intents is not a concern. For example, a large delete of obsolete, not-in-use data may create no concurrency implications and the elapsed time to execute that transaction may not be material. In that case, "doing-nothing" could be a valid response to this alert.
- An operator may enable a "circuit breaker" that would prevent any transaction exceeding the lock tracking memory budget. A cluster setting `kv.transaction.reject_over_max_intents_budget.enabled` allows an operator to control the behavior of CockroachDB when a transaction exceeds the memory budget for the point intents list.
  If `kv.transaction.reject_over_max_intents_budget.enabled`  is true, a SQL transaction that exceeds the intent list memory budget would be rejected with an error 53400 ("configuration limit exceeded"). 

## LSM Health

### Alert: Node LSM Storage Health

#### Purpose of this Alert

CockroachDB is using a LSM-Tree Pebble storage engine (a custom RocksDB re-write in Go). The health of an LSM tree can be measured by the *read amplification*, which is the average number of SSTables being checked per read operation.

A node reporting a high read amplification is an indication of a problem on that node that is likely to affect the workload.

A `rocksdb.read-amplification` in the single digits is characteristic of a healthy LSM tree.

A `rocksdb.read-amplification` in the double/triple/quadruple digits suggests an inverted LSM.

Possible root causes of LSM inversion and its harmful effects are outlined in  [the common problems experienced by CockroachDB users](../most-common-problems/README.md) section.



------

#### Monitoring Metric
```
rocksdb.read-amplification
```



#### Alert Rule

| Tier     | Definition                                    |
| -------- | --------------------------------------------- |
| WARNING  | Read Amplification exceeds 50 for 1 hour      |
| CRITICAL | Read Amplification exceeds 150 for 15 minutes |



#### Alert Response

The actual response varies depending on the alert tier, i.e. the severity of potential consequences.

- Check the history of read amplification via DB Console

- Check the periodic `Compaction Stats [default]` messages in the CockroachDB logs for confirmation of the degree of the Read Amplification

- Compaction may be "starved of CPU" if a high Read Amplification coincides with a high CPU utilization.  Address the high CPU utilization by reducing the workload concurrency. Compaction should "catch up" and the Read Amplification should be be gradually reduced to normal

In a severe case, a manual intervention may be required. The options are:

  1. [Run the offline manual compaction on the problem node](../emergency-procedures/lsm-compact.md)
  
  1. [Replace the problem node](../emergency-procedures/node-replace.md)
  
  1. [Wipe the problem node](../emergency-procedures/node-wipe.md)

## Node CPU

### Alert:  Hot CPU

#### Purpose of this Alert

I node with a high CPU utilization (a.k.a. an "overloaded" node) has a limited ability to process the user workload and increases the risks of cluster instability. Potential causes of node CPU overload are outlined in the "Insufficient CPU" Section of [the common problems experienced by CockroachDB users](../most-common-problems/README.md).

------

#### Monitoring Metric

```
sys.cpu.combined.percent-normalized, sys.cpu.host.combined.percent-normalized
```



#### Alert Rule

| Tier     | Definition                                   |
| -------- | -------------------------------------------- |
| WARNING  | Node CPU Utilization exceeds 80% for 4 hours |
| CRITICAL | Node CPU Utilization exceeds 90% for 1 hour  |




#### Alert Response

Confirm the high CPU utilization of cluster nodes.  Observe the following metrics in CockroachDB Console:

- Metrics --> Hardware Dashboard --> "CPU Percent" showing a high CPU utilization on cluster nodes
- Metrics --> SQL Dashboard --> "Active SQL Statements" showing the true concurrency of the workload, possibly exceeding the cluster capacity planning guidance of no more than 4 active statements per vCPU (core)

A persistently high CPU utilization of all nodes in a CockroachDB cluster suggests the current compute resources may be insufficient to support the user workload's concurrency requirements. If confirmed, the number of processors (vCPUs/cores) in the CockroachDB cluster needs to be adjusted to sustain the required level of workload concurrency.

For a prompt resolution, either [add cluster nodes](../routine-maintenance/node-add.md) or throttle down the workload concurrency, for example by reducing the number of concurrent connections, to not exceed 4 active statements per vCPU/core.

For more deliberate planning, review [cluster right-sizing, expansion strategy](../system-overview/_under-construction_.md).

For additional insights, review the "Insufficient CPU to support the scale of the workload" section of [the common problems experienced by CockroachDB users](../most-common-problems/README.md).





### Alert: Hot Node (Hotspot)

#### Purpose of this Alert

Unbalanced utilization of CockroachDB nodes in a cluster may negatively affect the cluster's performance and stability, with some nodes getting overloaded while others remain relatively underutilized. Potential causes of node hotspots are outlined in the "Hotspots" section of [the common problems experienced by CockroachDB users](../most-common-problems/README.md).



------

#### Monitoring Metric

```
sys.cpu.combined.percent-normalized, sys.cpu.host.combined.percent-normalized
```



#### Alert Rule

| Tier    | Definition                                                   |
| ------- | ------------------------------------------------------------ |
| WARNING | The MAX CPU utilization across nodes exceeds the cluster's MEDIAN CPU utilization by 30 for 2 hours |


#### Alert Response

Confirm the Hotspot by observing the graphs in the CockroachDB Console and identify the likely cause. It could be application processing dynamic (spot processing of a high volume of activity for some key, e.g. user id, account number), or uneven distribution of data across ranges, or a skew in connection load balancing, etc.  Observe the following metrics in CockroachDB Console:

- Metrics --> Hardware Dashboard --> "CPU Percent" showing a significantly higher CPU utilization on an small number of nodes relatively to the cluster median. This would confirm a hotspot/overloaded node.
- Metrics --> SQL Dashboard --> "Open SQL Sessions" showing an uneven distribution of connections (sessions). If a Hot node has significantly more connections vs other nodes, this may explain the cause of the Hotspot. This would be a probably cause yet not a proof since connections could be idling.
- Metrics --> SQL Dashboard --> "Active SQL Statements" showing the true concurrency of the workload exceeding the cluster sizing guidance (no more than 4 active statements per vCPU). In combination with a possible connection distribution skew, this may be a lead to investigate.
- Advanced Debug --> Hot Ranges --> "All Nodes" may show the most active ranges in the cluster concentrated on a Hot node. This would suggest either an application processing hotspot or a schema design choice leading to poor data distribution across ranges.

To eliminate a Hotspot caused by a data distribution / design issue, review the Hotspot Prevention/Resolution section of [the common problems experienced by CockroachDB users](../most-common-problems/README.md).


## Node Health

### UNDER CONSTRUCTION

> 
>
> ✅  During rolling maintenance and/or planned cluster resizing, the nodes' state and count will be changing. 
>
> Operators can mute alerts described below during routine maintenance procedures to avoid unnecessary distractions.
>
> 



### Alert: Heartbeat Latency



#### Purpose of this Alert

Monitor the cluster health for early signs of instability.





------

#### Monitoring Metric

```
liveness.heartbeatlatency
```

If this metric exceeds 1 sec,  it's a sign of instability. The recommended alert rule: warning if 0.5 sec,  critical if 3secs



#### Alert Rule

| Tier     | Definition |
| -------- | ---------- |
| WARNING  |            |
| CRITICAL |            |

#### Alert Response

< TODO >



--------------------



### Alert: Live Node Count Change

#### Purpose of this Alert

Live node count change



The liveness checks reported by a node is inconsistent with the rest of the cluster.

Inconsistent Liveness check



------

#### Alert Rule

| Tier     | Definition                                                   |
| -------- | ------------------------------------------------------------ |
| WARNING  | max cluster (liveness.livenodes) - min (liveness.livenodes) > 0 for 2 minutes |
| CRITICAL | max cluster (liveness.livenodes) - min (liveness.livenodes) > 0 for 5 minutes |



#### Alert Response

The actual response varies depending on the alert tier, i.e. the severity of potential consequences.

- Check ....

- 









doing regular maintenance (upgrade, rehydrate, ...) you will also get these messages, so you need to control your monitoring alarms during maintenance.

## Node Memory

### Alert: Node Memory Utilization

#### Purpose of this Alert

I node with high memory utilization is a cluster stability risk. Potential causes of high memory utilization are outlined in "Insufficient RAM" section of [the common problems experienced by CockroachDB users](../most-common-problems/README.md).



------

#### Monitoring Metric

```
sys.rss
```



#### Alert Rule

| Tier     | Definition                                      |
| -------- | ----------------------------------------------- |
| WARNING  | Node Memory Utilization exceeds 80% for 4 hours |
| CRITICAL | Node Memory Utilization exceeds 90% for 1 hour  |




#### Alert Response

High memory utilization is a prelude to a node's OOM (process termination by the OS when the system is critically low on memory). OOM condition is not expected to occur if a CockroachDB cluster is provisioned and sized per Cockroach Labs guidance:

- All CockroachDB VMs are provisioned with [sufficient RAM](https://www.cockroachlabs.com/docs/stable/recommended-production-settings#memory).

## Node Storage

> 
>
> ✅  **Clarification about `write stall` and `disk stall` conditions**
>
> There are 2 distinctly different conditions referring to "stalls" in I/O operations. Operators don't need to create alerts for either condition, in spite of their alarming names.
>
> ----
>
> `write stall` is an internal Pebble concept caused by too many memtables' flushes, which usually indicates an excessive write rate by a client. `write stall` messages in logs do not require operator's immediate attention. CockroachDB node can log write stall messages when the disk is churning through a large amount of data ingestion (flushing memtables).
>
> Examples when high write rates can cause `write stall` log messages:
>
> \- A sharp increase (spike) in insert throughput from user workload or some job
>
> \- A large scope delete, such as a TTL job running on a very large set of data or on a large table, triggering a large influx of memtable flushes
>
> A slow disk is less often the culprit. However, if potential causes above pointing to behavior within the database causing the `write stall`s are ruled out, the customer may want to investigate the health and IO capacity of their disks.
>
> ----
>
> `disk stall` is a condition that occurs when a disk IO system call time takes more than a configurable time deadline. The deadline for CockroachDB data IO is configurable via a cluster setting `storage.max_sync_duration` for the max allowable time an IO operation can be waiting in the storage layer. `COCKROACH_LOG_MAX_SYNC_DURATION` environment variable (there is no equivalent cluster setting) sets the max allowable time an IO operation can be waiting in the message logging framework.
>
> Disk stalls are covered in the broader [data availability](../system-overview/data-availability.md#disk-stalls) article.
>
> 



---

### Alert: Node Storage Capacity

#### Purpose of this Alert

CockroachDB node will not able to operate if there is no free disk space on CockroachDB store volume.

------

#### Monitoring Metric

```
capacity.available
```



#### Alert Rule

| Tier     | Definition                                         |
| -------- | -------------------------------------------------- |
| WARNING  | Node free disk space is less than 30% for 24 hours |
| CRITICAL | Node free disk space is less than 10% for 1 hour   |




#### Alert Response

Increase the size of CockroachDB node storage capacity.  CockroachDB  storage volumes should not be utilized more than 60% (40% free space). In an "disk full" situation, operator may be able to get a node "unstuck" by removing the [ballast file](https://www.cockroachlabs.com/docs/stable/cluster-setup-troubleshooting#automatic-ballast-files).



-----

### Alert: Node Storage Performance

#### Purpose of this Alert

Under-configured or under-provisioned disk storage is a common root cause of inconsistent CockroachDB cluster performance and could also lead to cluster instability. Review the "Insufficient Disk IO performance" Section of [the common problems experienced by CockroachDB users](../most-common-problems/README.md).

------

#### Monitoring Metric

```
sys.host.disk.iopsinprogress (storage device average queue length)
```



#### Alert Rule

| Tier     | Definition                                                   |
| -------- | ------------------------------------------------------------ |
| WARNING  | Storage device average queue length is greater than 10 for 10 seconds |
| CRITICAL | Storage device average queue length is greater than 20       |



#### Alert Response

See Resolution in the "Insufficient Disk IO performance" Section of [the common problems experienced by CockroachDB users](../most-common-problems/README.md).

## Version Mismatch

### Alert: Version Mismatch

#### Purpose of this Alert

All CockroachDB cluster nodes are running exactly the same executable (with identical build label). This warning is a safety catch to guard against an operational error when some node(s) were not upgraded.

------

#### Monitoring Metric

```
build.timestamp
```



#### Alert Rule

| Tier    | Definition                                                   |
| ------- | ------------------------------------------------------------ |
| WARNING | Non-uniform executable Build version across cluster nodes for more than 4 hours. |



#### Alert Response

Ensure all cluster nodes are running exactly the same CockroachDB version, including the patch release version number.



-----

### Alert: Major Upgrade Un-finalized

#### Purpose of this Alert

A major upgrade should not be left un-finalized for an extended period of time, beyond a small number of days necessary to gain confidence in the new release. This warning is a safety catch to guard against an operational error when a major upgrade is left un-finalized.

------

#### Monitoring Metric

```
No metric is available. Monitor via a query against system tables.
```



#### Monitoring Result of SQL Query

*Run the check query provided* in the [CockroachDB version upgrade article](../routine-maintenance/release-upgrade.md#finalizing-a-major-release-upgrade). If the query returns `false`, the last major upgrade has not been finalized.



#### Alert Rule

| Tier    | Definition                                              |
| ------- | ------------------------------------------------------- |
| WARNING | Major release upgrade has not been finalized for 3 days |



#### Alert Response

Finalize the upgrade.

