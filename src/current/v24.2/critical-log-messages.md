---
title: Critical Log Messages
summary: Critical logs messages to externalize and how to interpret them. 
toc: true
---

## Disk Stall

- **Message**: `disk stall detected: unable to sync log files within`

    - **Severity**: High
    - **Description**: A disk stall is any disk operation that does not terminate in a reasonable amount of time. This usually manifests as write-related system calls such as `fsync(2)` (aka `fdatasync`) taking a lot longer than expected (e.g., more than 20 seconds).
    - **Impact**: Increased latency and eventual termination of the CockroachDB process. 
    - **Action**: Restart node. Provision disk with sufficient disk bandwidth/IOPs. Review active workload and check if write throughput has increased over the recent period (weeks).
    - **Related metrics**:

        - `storage.write-stalls`: Number of instances of intentional write stalls to backpressure incoming writes
        - `storage.write-stall-nanos`: Total write stall duration in nanos
        - `storage.disk-stalled`: Number of instances of disk operations taking longer than 20s 

    - **See also**: [Disk stalls]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#disk-stalls)

## Node Decommission

- **Message**: `possible decommission stall detected`

    - **Severity**: Medium
    - **Description**: When the node decommissioning process can not find another node to migrate replicas to, the decommission will hang.
    - **Impact**: Decommission is prevented.
    - **Action**: Provide sufficient extra node capacity and ensure nodes are available in the desired localities before decommission.
    - **Related metrics**: NONE
    - **See also**:
        - [Node decommission]({% link {{ page.version.version }}/cockroach-node.md %}#node-decommission)
        - [Decommissioning issues]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#decommissioning-issues)

- **Message**: `ERROR: drain timeout` or `error releasing lease`

    - **Severity**: Medium
    - **Description**: when the decommissioning process can not find another node to migrate leaseholders to, the decommission will hang. 
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
        - [context deadline exceeded]({% link {{ page.version.version }}/common-errors.md %}#context-deadline-exceeded)

- **Message**: `unable to connect to n16: failed to connect to n16 at ‹hostname:port›: ‹initial connection heartbeat failed›`

    - **Severity**: Medium
    - **Description**: This is likely an indication that, at the time of failure, there was a network-related issue that occurred in the environment that affected the listed node, `n16` in this example. 
    - **Impact**: Any leaseholders that are on the affected node will be unavailable and other nodes will need to re-elect a new leaseholder. As leaseholder election can take up to 9 seconds, the SQL service latency can increase significantly during this time, if records are accessed from a leaseholder on the impacted node.
    - **Action**: Check if the node:
        - has been purposely removed from the cluster by the user,
        - has been affected by an asymmetrical network partition,
        - experienced resource exhaustion, such as an OOM or CPU saturation, or
        - has had any recent hardware changes.
    - **Related metrics**: NONE
    - **See also**: [Network partition]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#network-partition)

- **Message**:
    - `slow range RPC: have been waiting 78.90s (3 attempts) for RPC Scan`
    - `retrying liveness update after ‹×›: ‹×›`
    - `slow heartbeat took 4.500410541s; err=context deadline exceeded`
    - `failed node liveness heartbeat: ‹×›: context deadline exceeded`

    - **Description**: this is likely an indication of a network partition. 
    - **Action**: debugging network connectivity.
    - **Impact**: SQL service latency will likely increase. In the event of a network partition, ranges can be unavailable until an election is executed and in the extreme case there can be a cluster outage..
    - **Severity**: High
    - **Related metrics**:
liveness_heartbeatfailures
Liveness_heartbeatlatency
    - **See also**: NONE

## Infrastructure

clock synchronization error: this node is more than 500ms away from at least half of the known nodes
`

    - **Description**: this error indicates that a node has spontaneously shut down because it detected that its clock is out of sync with at least half of the other nodes in the cluster by 80% of the maximum offset allowed (500ms by default).  The node won't be able to provide a consistent window to enforce SQL Serializability. 
CockroachDB requires moderate levels of clock synchronization to preserve data consistency, so the node shutting down in this way avoids the risk of consistency anomalies.
    - **Action**: ensuring that clocks are synchronized using the NTP/PTP time protocols within a high frequency in a second.
    - **Impact**: The node that has drifted by ~400ms will eject itself from the cluster.
    - **Severity**: High
    - **Related metrics**:
clock_offset_meannanos
    - **See also**: Common Errors and Solutions

- **Message**: `file write stall detected: %s`

    - **Description**: every time the storage engine writes to the main cockroach.log file, the engine waits 30 seconds for the write to succeed (configurable with the COCKROACH_LOG_MAX_SYNC_DURATION environment variable).
    - **Action**: provisioning disks with sufficient disk bandwidth/IOPs and then restarting the node.
    - **Impact**: The CRDB node process is terminated and the file write stall detected: %s message is written to stderr / cockroach.log.
    - **Severity**: High. 
    - **Related metrics**: 
storage_write_stalls
    - **See also**: Disk Stalls

## Cluster or Node Availability

- **Message**: `cannot acquire lease when draining`

    - **Description**: Node is unable to acquire a lease as part of the shutdown process.
    - **Action**: checking for network issues. 
For K8s deployments the pod will be terminated after the configured grace period. 
With other types of deployment, the operator may need to manually terminate the cockroach process:
    - **Impact**: Node may be unable to shutdown cleanly.
    - **Severity**: Medium
    - **Related metrics**: NONE
    - **See also**: Node Shutdown

- **Message**: `WARNING: The server appears to be unable to contact the other nodes in the cluster.`

    - **Description**: during cluster setup or startup there are a number of possible causes:
Cluster has not been initialized
Network/ firewall issues
Incorrect configuration of node(s)
Node/CA/Client certificate(s) have expired
    - **Action**: following Docs troubleshooting guide Troubleshoot Cluster Setup.
    - **Impact**: Node is unable to join the cluster on startup
    - **Severity**: Medium/High
    - **Related metrics**:
security_certificate_expiration_ca
security_certificate_expiration_node
security_certificate_expiration_node_client
    - **See also**:  Troubleshoot Cluster Setup

- **Message**: `latency jump (prev avg {XXX}ms, current {YYY}ms)`

    - **Description**: this can be an indication of highly variable inter-node latency.
    - **Action**: looking for resource and network issues if latency jumps are consistently more than 10ms. 
    - **Impact**: Node is unable to join the cluster on startup.
    - **Severity**: Low
    - **Related metrics**: NONE
    - **See also**: NONE

- **Message**: `released orphaned lease`

    - **Description**: CRDB is tidying up leases,  often when a failed or restarted node rejoins the cluster.
    - **Action**: do not need to respond to this log message.    - **Impact**: NONE
    - **Severity**: Low
    - **Related metrics**: NONE
    - **See also**: NONE

- **Message**: `inbound streams timed out after 10s; propagated error throughout flow`

    - **Description**: this message may indicate a network issue or an issue with local resources (CPU, disk). 
    - **Action**: checking the status of underlying infrastructure and networking between nodes.
    - **Impact**: Some client read/write access operations may fail.
    - **Severity**: Low
    - **Related metrics**: NONE
    - **See also**: NONE

- **Message**: `transport: Error while dialing cannot reuse client connection`

    - **Description**: the connection between nodes has been dropped.
    - **Action**: checking the status of the network.
    - **Impact**: Some client read/write access operations may fail.
    - **Severity**: Medium
    - **Related metrics**: NONE
    - **See also**: NONE

- **Message**: `first range unavailable; trying remaining addresses
first range unavailable; resolvers exhausted`

    - **Description**: Range 1 (internal system range) is not available for reads/writes.
    - **Action**: checking the status of underlying infrastructure and networking between nodes.
    - **Impact**: Entire cluster is unavailable for a period of time.
    - **Severity**: High
    - **Related metrics**: NONE
    - **See also**: NONE

- **Message**: `failed to heartbeat own liveness record: context canceled`

    - **Description**: liveness range may be slow or unavailable.
    - **Action**: checking for nodes failing their liveness check and also checking for network issues.
    - **Impact**: One or more nodes may not be able to operate for periods of time.
    - **Severity**: High
    - **Related metrics**: NONE
    - **See also**: NONE

- **Message**: `health alerts detected`

    - **Description**: a metric has crossed an alert threshold.
    - **Action**: looking for details of metrics in the log message.
    - **Impact**: Various situations depending on the metric and alert.
    - **Severity**: Low (to High)
    - **Related metrics**: 
requests_slow_latch
requests_slow_raft
requests_slow_lease
requests_slow_distsender
liveness_heartbeatfailures
    - **See also**: NONE

## Replication

- **Message**: `raft receive queue for r{nn} is full`

    - **Description**: the RAFT receive queue for a specific range is full and can no longer queue requests.
    - **Action**: Identifying if the range has a disproportionate amount of load and mitigate appropriately (e.g. split range manually, use a hash-sharded index).
    - **Impact**: May cause higher latencies for operations that need to write to that range.
    - **Severity**: Medium
    - **Related metrics**: NONE
    - **See also**: Hot Ranges

## Data Availability

- **Message**: `range unavailable: have been waiting 60.00s for proposing command RequestLease`

    - **Description**: an individual range is unavailable for reads/writes.
    - **Action**: checking the DB Console for unavailable ranges to assess the severity of the issue and determine where the replicas / previous leaseholder were located.
    - **Impact**: A subset of the data on the cluster will be unavailable for reads & writes.
    - **Severity**: Medium
    - **Related metrics**: 
ranges_unavailable
    - **See also**: KV replication & DB Console shows under-replicated/unavailable ranges

## See also

- [Logging Best Practices]({% link {{ page.version.version }}/logging-best-practices.md %})
- [Troubleshoot Self-Hosted Setup]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %})
- [Common Errors and Solutions]({% link {{ page.version.version }}/common-errors.md %})