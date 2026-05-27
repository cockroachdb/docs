---
title: Critical Log Messages
summary: Critical logs messages to externalize and how to interpret them. 
toc: true
---

## Disk Stall

- **Message**: `disk stall detected: unable to sync log files within`

    - **Severity**: High
    - **Description**: A disk stall is any disk operation that does not terminate in a reasonable amount of time. This usually manifests as write-related system calls such as `fsync(2)` (aka `fdatasync`) taking a lot longer than expected (e.g., more than 20 seconds).
    - **Impact**: Increased latency and eventual termination of the `cockroach` process. 
    - **Action**: Restart node. Provision disk with sufficient disk bandwidth/IOPs. Review active workload and check if write throughput has increased over the recent period (weeks).
    - **Related metrics**:
        - `storage.write-stalls`: Number of instances of intentional write stalls to backpressure incoming writes
        - `storage.write-stall-nanos`: Total write stall duration in nanos
        - `storage.disk-stalled`: Number of instances of disk operations taking longer than 20s 
    - **See also**: [Disk stalls]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#disk-stalls)

## Node Decommission Stall

- **Message**: `possible decommission stall detected`

    - **Severity**: Medium
    - **Description**: When the node decommissioning process can not find another node to migrate replicas to, the decommission will hang.
    - **Impact**: Decommission is prevented.
    - **Action**: Provide sufficient extra node capacity and ensure nodes are available in the desired localities before decommission.
    - **Related metrics**: NONE
    - **See also**:
        - [Node decommission]({% link {{ page.version.version }}/cockroach-node.md %}#node-decommission)
        - [Decommissioning issues]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#decommissioning-issues)

- **Message**: One or more of the following:
    <br><br>`ERROR: drain timeout`
    <br><br>`error releasing lease`

    - **Severity**: Medium
    - **Description**: When the decommissioning process can not find another node to migrate leaseholders to, the decommission will hang. 
    - **Impact**: Decommission is prevented.
    - **Action**: To continue the drain, re-initiate the command. A very long drain may indicate an anomaly, and you should manually inspect the server to determine what blocks the drain.
    - **Related metrics**: NONE
    - **See also**: [Drain timeout]({% link {{ page.version.version }}/node-shutdown.md %}#drain-timeout)

## Network

- **Message**: `slow heartbeat took %s; err=context deadline exceeded`

    - **Severity**: Medium
    - **Description**: An attempt to heartbeat its liveness record by the node took a considerable amount of time.
    - **Impact**: The node is unlikely to be able to service requests within a desirable period of time.
    - **Action**: Check if the node is resource constrained; the node may be overloaded, unable to connect to other nodes, CPU-constrained, or may not have sufficient disk throughput. 
    - **Related metrics**:
        - `liveness.heartbeatfailures`: Number of failed node liveness heartbeats from this node
        - `liveness.heartbeatlatency`: Node liveness heartbeat latency
    - **See also**:
        - [Node liveness issues]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#node-liveness-issues)
        - [`context deadline exceeded`]({% link {{ page.version.version }}/common-errors.md %}#context-deadline-exceeded)

- **Message**: `unable to connect to n%d: failed to connect to n%d at ‹hostname:port›: ‹initial connection heartbeat failed›`

    - **Severity**: Medium
    - **Description**: At the time of failure, there was a network-related issue that occurred in the environment that affected the listed node. 
    - **Impact**: Any leaseholders that are on the affected node will be unavailable and other nodes will need to re-elect a new leaseholder. As leaseholder election can take multiple seconds, the SQL service latency can increase significantly during this time, if records are accessed from a leaseholder on the impacted node.
    - **Action**: Check if the node has experienced one of the following:
        - The user has purposefully removed the node from the cluster.
        - Asymmetrical network partitioning.
        - Resource exhaustion, such as an OOM or CPU saturation.
        - Recent hardware changes.
    - **Related metrics**: NONE
    - **See also**: [Network partition]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#network-partition)

- **Message**: One or more of the following:
    <br><br>`slow range RPC: have been waiting  %.2fs (%d attempts) for RPC Scan`
    <br><br>`retrying liveness update after ‹×›: ‹×›`
    <br><br>`slow heartbeat took %s; err=context deadline exceeded`
    <br><br>`failed node liveness heartbeat: ‹×›: context deadline exceeded`

    - **Severity**: High
    - **Description**: Indicates a network partition. 
    - **Impact**: SQL service latency will likely increase. In the event of a network partition, ranges can be unavailable until an election is executed and in the extreme case there can be a cluster outage.
    - **Action**: Debug network connectivity.
    - **Related metrics**:
        - `liveness.heartbeatfailures`: Number of failed node liveness heartbeats from this node
        - `liveness.heartbeatlatency`: Node liveness heartbeat latency
    - **See also**: [Network partition]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#network-partition)

## Infrastructure

- **Message**: `clock synchronization error: this node is more than 500ms away from at least half of the known nodes`

    - **Severity**: High
    - **Description**: A node has spontaneously shut down because it detected that its clock is out of sync with at least half of the other nodes in the cluster by 80% of the maximum offset allowed (500ms by default).  The node will not be able to provide a consistent time window to enforce SQL Serializability. CockroachDB requires moderate levels of clock synchronization to preserve data consistency, so the node shutting down in this way avoids the risk of consistency anomalies.
    - **Impact**: The node that has drifted by ~400ms will eject itself from the cluster.
    - **Action**: Ensure that clocks are synchronized using the NTP/PTP time protocols within a high frequency in a second.
    - **Related metrics**:
        - `clock-offset.meannanos`: Mean clock offset with other nodes
    - **See also**: [`clock synchronization error: this node is more than 500ms away from at least half of the known nodes`]({% link {{ page.version.version }}/common-errors.md %}#clock-synchronization-error-this-node-is-more-than-500ms-away-from-at-least-half-of-the-known-nodes)

- **Message**: `file write stall detected: %s`

    - **Severity**: High
    - **Description**: Every time the storage engine writes to the main `cockroach.log` file, the engine waits 20 seconds for the write to succeed (configurable with the `COCKROACH_LOG_MAX_SYNC_DURATION` environment variable).
    - **Impact**: The write to the log failed, the `cockroach` process is terminated and this message is written to `stderr` / `cockroach.log`.
    - **Action**: Provision disks with sufficient disk bandwidth/IOPs and then restart the node.
    - **Related metrics**: 
        - `storage.write-stalls`: Number of instances of intentional write stalls to backpressure incoming writes
    - **See also**: [Disk stalls]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#disk-stalls)

## Cluster/Node Availability

- **Message**: `cannot acquire lease when draining`

    - **Severity**: Medium
    - **Description**: Node is unable to acquire a lease as part of the shutdown process.
    - **Impact**: Node may be unable to shutdown cleanly.
    - **Action**: Check for network issues. For Kubernetes deployments the pod will be terminated after the configured grace period. With other types of deployment, the operator may need to terminate the `cockroach` process manually.
    - **Related metrics**: NONE
    - **See also**: [Drain timeout]({% link {{ page.version.version }}/node-shutdown.md %}#drain-timeout)

- **Message**: `WARNING: The server appears to be unable to contact the other nodes in the cluster.`

    - **Severity**: Medium/High
    - **Description**: During cluster setup or node startup, possible causes for this message are:
        - cluster has not been initialized,
        - network or firewall issues,
        - incorrect configuration of node(s), or
        - node/ca/client certificate(s) have expired.
    - **Impact**: Node is unable to join the cluster on startup.
    - **Action**: Follow Troubleshoot Self-Hosted Setup guide.
    - **Related metrics**:
        - `security.certificate.expiration.ca`: Expiration for the CA certificate. 0 means no certificate or error
        - `security.certificate.expiration.node`: Expiration for the node certificate. 0 means no certificate or error
        - `security.certificate.expiration.node-client`: Expiration for the node's client certificate. 0 means no certificate or error
    - **See also**: [Troubleshoot Self-Hosted Setup]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %})

- **Message**: `latency jump (prev avg {XXX}ms, current {YYY}ms)`

    - **Severity**: Low
    - **Description**: Indicates highly variable inter-node latency.
    - **Impact**: Node is unable to join the cluster on startup.
    - **Action**: Check for resource and network issues if latency jumps are consistently more than `10ms`. 
    - **Related metrics**: NONE
    - **See also**: NONE

- **Message**: `released orphaned lease`

    - **Severity**: Low
    - **Description**: CockroachDB is cleaning up leases, particularly when a failed or restarted node rejoins the cluster.
    - **Impact**: NONE
    - **Action**: No response necessary.
    - **Related metrics**: NONE
    - **See also**: NONE

- **Message**: `inbound streams timed out after 10s; propagated error throughout flow`

    - **Severity**: Low
    - **Description**: Indicates a network issue or an issue with local resources (CPU, disk). 
    - **Impact**: Some client read/write access operations may fail.
    - **Action**: Check the status of underlying infrastructure and networking between nodes.
    - **Related metrics**: NONE
    - **See also**: NONE

- **Message**: `transport: Error while dialing cannot reuse client connection`

    - **Severity**: Medium
    - **Description**: The connection between nodes has been dropped.
    - **Action**: Check the status of the network.
    - **Impact**: Some client read/write access operations may fail.
    - **Related metrics**: NONE
    - **See also**: NONE

- **Message**: One or more of the following:
    <br><br>`first range unavailable; trying remaining addresses`
    <br><br>`first range unavailable; resolvers exhausted`

    - **Severity**: High
    - **Description**: Range 1 (internal system range) is not available for reads/writes.
    - **Impact**: Entire cluster is unavailable for a period of time.
    - **Action**: Check the status of underlying infrastructure and networking between nodes.
    - **Related metrics**: NONE
    - **See also**: NONE

- **Message**: `failed to heartbeat own liveness record: context canceled`

    - **Severity**: High
    - **Description**: Liveness range may be slow or unavailable.
    - **Impact**: One or more nodes may not be able to operate for periods of time.
    - **Action**: Check for nodes failing their liveness check and also check for network issues.
    - **Related metrics**: NONE
    - **See also**: NONE

- **Message**: `health alerts detected`

    - **Severity**: Low/Medium/High
    - **Description**: A metric has crossed an alert threshold.
    - **Impact**: Various situations depending on the metric and alert.
    - **Action**: Check for details of metrics in the message.
    - **Related metrics**: 
        - `requests.slow.latch`: Number of requests that have been stuck for a long time acquiring latches. Latches moderate access to the KV keyspace for the purpose of evaluating and replicating commands. A slow latch acquisition attempt is often caused by another request holding and not releasing its latches in a timely manner. This in turn can either be caused by a long delay in evaluation (for example, under severe system overload) or by delays at the replication layer. This gauge registering a nonzero value usually indicates a serious problem and should be investigated.
        - `requests.slow.raft`: Number of requests that have been stuck for a long time in the replication layer. An (evaluated) request has to pass through the replication layer. If it fails to do so within a highly permissive duration, the gauge is incremented (and decremented again once the request is either applied or returns an error).
        - `requests.slow.lease`: Number of requests that have been stuck for a long time acquiring a lease. This gauge registering a nonzero value usually indicates range or replica unavailability, and should be investigated. Often, you may also notice `requests.slow.raft` register a nonzero value, indicating that the lease requests are not getting a timely response from the replication layer.
        - `requests.slow.distsender`: Number of range-bound RPCs currently stuck or retrying for a long time. Note that this is not a good signal for KV health. The remote side of the RPCs tracked here may experience contention, so it is easy to cause values for this metric to emit by leaving a transaction open for a long time and contending with it using a second transaction.
        - `liveness.heartbeatfailures`: Number of failed node liveness heartbeats from this node
    - **See also**: NONE

## Replication

- **Message**: `raft receive queue for r{nn} is full`

    - **Severity**: Medium
    - **Description**: The raft receive queue for a specific range is full and can no longer queue requests.
    - **Impact**: May cause higher latencies for operations that need to write to that range.
    - **Action**: Identify if the range has a disproportionate amount of load and mitigate appropriately, such as splitting ranges manually or using a hash-sharded index.
    - **Related metrics**: NONE
    - **See also**: [Top Ranges page]({% link {{ page.version.version }}/ui-top-ranges-page.md %})

## Data Availability

- **Message**: `range unavailable: have been waiting 60.00s for proposing command RequestLease`

    - **Severity**: Medium
    - **Description**: An individual range is unavailable for reads and writes.
    - **Impact**: A subset of the data on the cluster will be unavailable for reads and writes.
    - **Action**: Check the DB Console for unavailable ranges to assess the severity of the issue and determine where the replicas or previous leaseholder were located.
    - **Related metrics**: 
        - `ranges.unavailable`: Number of ranges with fewer live replicas than needed for quorum
    - **See also**:
        - [KV replication]({% link {{ page.version.version }}/essential-metrics-self-hosted.md %}#kv-replication)
        - [Replication issues]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#replication-issues)

## See also

- [Logging Best Practices]({% link {{ page.version.version }}/logging-best-practices.md %})
- [Troubleshoot Self-Hosted Setup]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %})
- [Common Errors and Solutions]({% link {{ page.version.version }}/common-errors.md %})
- [Essential Metrics for CockroachDB Self-Hosted Deployments]({% link {{ page.version.version }}/essential-metrics-self-hosted.md %})
