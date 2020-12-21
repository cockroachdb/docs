---
title: Disaster Recovery
summary: Learn how about CockrachDB disaster recovery capabilities and what to do if you encounter an issue.
toc: true
---

CockroachDB is built to be [fault-tolerant and to recover automatically](demo-fault-tolerance-and-recovery.html), but sometimes disasters happen. A _disaster_ is any event that puts your cluster at risk, and usually means your cluster is experiencing [hardware failure](#hardware-failure), [data failure](#data-failure), or has [compromised security keys](#compromised-security-keys). Having a disaster recovery plan enables you to recover quickly, while limiting the consequences.

## Hardware failure

When planning to survive hardware failures, start by determining the minimum replication factor you need based on your fault tolerance goals:

- [Single-region survivability planning](#single-region-survivability-planning)
- [Multi-region survivability planning](#multi-region-survivability-planning)

{{site.data.alerts.callout_danger}}
Increasing the replication factor can impact write performance in that more replicas must agree to reach quorum. For more details about the mechanics of writes and the Raft protocol, see [Read and Writes Overview](architecture/reads-and-writes-overview.html).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
For the purposes of choosing a replication factor, disk failure is equivalent to node failure.
{{site.data.alerts.end}}

If you experience hardware failures in a cluster, the recovery actions you need to take will depend on the type of infrastructure and topology pattern used:

- [Single-region recovery](#single-region-recovery)
- [Multi-region recovery](#multi-region-recovery)

### Single-region survivability planning

The table below shows the replication factor (RF) needed to achieve the listed fault tolerance goals for a single region, cloud-deployed cluster with nodes spread as evenly as possible across 3 availability zones (AZs):

{{site.data.alerts.callout_info}}
See our [basic production topology](topology-basic-production.html#configuration) for configuration guidance.
{{site.data.alerts.end}}

<table>
  <thead>
    <tr>
      <th>Fault Tolerance Goals</th>
      <th>3 nodes</th>
      <th>5 nodes</th>
      <th>9 nodes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="color:#46a417"><b>1 Node</b></td>
      <td>RF = 3</td>
      <td>RF = 3</td>
      <td>RF = 3</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>1 AZ</b></td>
      <td>RF = 3</td>
      <td>RF = 3</td>
      <td>RF = 3</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>2 Nodes</b></td>
      <td>Not possible</td>
      <td>RF = 5</td>
      <td>RF = 5</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>AZ + Node</b></td>
      <td>Not possible</td>
      <td>Not possible</td>
      <td>RF = 9</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>2 AZ</b></td>
      <td>Not possible</td>
      <td>Not possible</td>
      <td>Not possible</td>
    </tr>
  </tbody>
</table>

To be able to survive 2+ availability zones failing, scale to a [multi-region](#multi-region-survivability-planning) deployment.

### Single-region recovery

For hardware failures in a single-region cluster, the recovery actions vary and depend on the type of infrastructure used.

For example, consider a cloud-deployed CockroachBD cluster with the following setup:

- Single-region
- 3 nodes
- A node in each availability zone (i.e., 3 AZs)
- Replication factor of 3

The table below describes what actions to take to recover from various hardware failures in this example cluster:

<table>
  <thead>
    <tr>
      <th>Failure</th>
      <th>Availability</th>
      <th>Consequence</th>
      <th>Action to Take</th>
    </tr>
  </thead>
  <tbody class=nohover>
    <tr>
      <td style="color:#46a417"><b>1 Disk</td>
      <td style="color:#228B22"><b>√</b></td>
      <td rowspan="3">Fewer resources are available. Some data will be under-replicated until the failed nodes are marked dead. <br><br>Once marked dead, data is replicated to other nodes and the cluster remains healthy.
      </td>
      <td><a href="start-a-node.html">Restart the node</a> with a new disk.</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>1 Node</td>
      <td style="color:#228B22"><b>√</b></td>
      <td rowspan="2">If the node or AZ becomes unavailable, check the <a href="ui-overview-dashboard.html">Overview dashboard</a> on the DB Console:
      <ul>
      <li>If the down node is marked <b>Suspect</b>, try <a href="start-a-node.html">restarting the node</a>.</li>
      <li>If the down node is marked <b>Dead</b>, <a href="remove-nodes.html">decommission the node</a>, wipe the store path, and then <a href="cockroach-start.html">rejoin it back to the cluster</a>. If the node has additional hardware issues, decommission the node and <a href="cockroach-start.html">add a new node</a> to the cluster. Ensure that <a href="cockroach-start.html#locality">locality flags are set</a> correctly upon node startup.</li></ul></td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>1 AZ</td>
      <td style="color:#228B22"><b>√</b></td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>2 Nodes</b></td>
      <td style="color:#FF0000"><b>X</b></td>
      <td>Cluster is unavailable.</td>
      <td><a href="cockroach-start.html">Restart</a> 1 of the 2 nodes that are down to regain quorum. <br><br>If you can’t recover at least 1 node, <a href="https://support.cockroachlabs.com">contact Cockroach Labs support</a> for assistance.</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>1 AZ + 1 Node</b></td>
      <td style="color:#FF0000"><b>X</b></td>
      <td>Cluster is unavailable.</td>
      <td><a href="cockroach-start.html">Restart</a> the node that is down to regain quorum. When the AZ comes back online, try restarting the node.<br><br>If you can’t recover at least 1 node, <a href="https://support.cockroachlabs.com">contact Cockroach Labs support</a> for assistance.</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>2 AZ</b></td>
      <td style="color:#FF0000"><b>X</b></td>
      <td>Cluster is unavailable.</td>
      <td>When the AZ comes back online, try <a href="cockroach-start.html">restarting</a> at least 1 of the nodes.<br><br>You can also <a href="https://support.cockroachlabs.com">contact Cockroach Labs support</a> for assistance.</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>3 Nodes</b></td>
      <td style="color:#FF0000"><b>X</b></td>
      <td>Cluster is unavailable.</td>
      <td><a href="cockroach-start.html">Restart</a> 2 of the 3 nodes that are down to regain quorum. <br><br>If you can’t recover 2 of the 3 failed nodes, <a href="https://support.cockroachlabs.com">contact Cockroach Labs support</a> for assistance.</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>1 Region</td>
      <td style="color:#FF0000"><b>X</b></td>
      <td>Cluster is unavailable. <br><br>Potential data loss between last backup and time of outage if the region and nodes did not come back online.</td>
      <td>When the region comes back online, try <a href="cockroach-start.html">restarting the nodes</a> in the cluster. <br><br>If the region does not come back online and nodes are lost or destroyed, try <a href="restore.html">restoring the latest cluster backup</a> into a new cluster.<br><br>You can also <a href="https://support.cockroachlabs.com">contact Cockroach Labs support</a> for assistance.</td>
    </tr>
  </tbody>
</table>

{{site.data.alerts.callout_info}}
When using Kubernetes, recovery actions happen automatically in many cases and no action needs to be taken.
{{site.data.alerts.end}}

### Multi-region survivability planning

The table below shows the replication factor (RF) needed to achieve the listed fault tolerance (e.g., survive 1 failed node) for a multi-region, cloud-deployed cluster with 3 availability zones (AZ) per region and one node in each AZ:

{{site.data.alerts.callout_danger}}
The chart below describes the CockroachDB default behavior when locality flags are correctly set. It does not use geo-partitioning or a specific [topology pattern](topology-patterns.html). For a multi-region cluster in production, we do not recommend using the default behavior, as the cluster's performance will be negatively affected.
{{site.data.alerts.end}}

<table>
  <thead>
    <tr>
      <th>Fault Tolerance Goals</th>
      <th>3 Regions<br>(9 Nodes Total)</th>
      <th>4 Regions<br>(12 Nodes Total)</th>
      <th>5 Regions<br>(15 Nodes Total)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="color:#46a417"><b>1 Node</b></td>
      <td>RF = 3</td>
      <td>RF = 3</td>
      <td>RF = 3</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>1 AZ</b></td>
      <td>RF = 3</td>
      <td>RF = 3</td>
      <td>RF = 3</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>1 Region</b></td>
      <td>RF = 3</td>
      <td>RF = 3</td>
      <td>RF = 3</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>2 Nodes</b></td>
      <td>RF = 5</td>
      <td>RF = 5</td>
      <td>RF = 5</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>1 Region + 1 Node</b></td>
      <td>RF = 9</td>
      <td>RF = 7</td>
      <td>RF = 5</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>2 Regions</b></td>
      <td>Not possible</td>
      <td>Not possible</td>
      <td>RF = 5</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>2 Regions + 1 Node</b></td>
      <td>Not possible</td>
      <td>Not possible</td>
      <td>RF = 15</td>
    </tr>
  </tbody>
</table>

### Multi-region recovery

For hardware failures in a multi-region cluster, the actions taken to recover vary and depend on the type of infrastructure used.

For example, consider a cloud-deployed CockroachBD cluster with the following setup:

- 3 regions
- 3 AZs per region
- 9 nodes (1 node per AZ)
- Replication factor of 3

The table below describes what actions to take to recover from various hardware failures in this example cluster:

<table>
  <thead>
    <tr>
      <th>Failure</th>
      <th>Availability</th>
      <th>Consequence</th>
      <th>Action to Take</th>
    </tr>
  </thead>
  <tbody class=nohover>
    <tr>
      <td style="color:#46a417"><b>1 Disk</td>
      <td style="color:#228B22"><b>√</b></td>
      <td rowspan="4">Under-replicated data. Fewer resources for workload.</td>
      <td><a href="start-a-node.html">Restart the node</a> with a new disk.</td>
    </tr>
      <td style="color:#46a417"><b>1 Node</td>
      <td style="color:#228B22"><b>√</b></td>
      <td rowspan="2">If the node or AZ becomes unavailable check the <a href="ui-overview-dashboard.html">Overview dashboard</a> on the DB Console:
      <ul>
      <li>If the down node is marked <b>Suspect</b>, try <a href="start-a-node.html">restarting the node</a>.</li>
      <li>If the down node is marked <b>Dead</b>, <a href="remove-nodes.html">decommission the node</a>, wipe the store path, and then <a href="cockroach-start.html">rejoin it back to the cluster</a>. If the node has additional hardware issues, decommission the node and <a href="cockroach-start.html">add a new node</a> to the cluster. Ensure that <a href="cockroach-start.html#locality">locality flags are set</a> correctly upon node startup.</li>
      </ul>
      </td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>1 AZ</b></td>
      <td style="color:#228B22"><b>√</b></td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>1 Region</b></td>
      <td style="color:#228B22"><b>√</b></td>
      <td>Check the <a href="ui-overview-dashboard.html">Overview dashboard</a> on the DB Console. If nodes are marked <b>Dead</b>, <a href="remove-nodes.html">decommission the nodes</a> and <a href="start-a-node.html">add 3 new nodes</a> in a new region. Ensure that <a href="cockroach-start.html#locality">locality flags are set</a> correctly upon node startup.</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>2 or More Regions</b></td>
      <td style="color:#FF0000"><b>X</b></td>
      <td>Cluster is unavailable. <br><br>Potential data loss between last backup and time of outage if the region and nodes did not come back online.</td>
      <td>When the regions come back online, try <a href="cockroach-start.html">restarting the nodes</a> in the cluster. <br><br>If the regions do not come back online and nodes are lost or destroyed, try <a href="restore.html">restoring the latest cluster backup</a> into a new cluster.<br><br>You can also <a href="https://support.cockroachlabs.com">contact Cockroach Labs support</a> for assistance.</td>
    </tr>
  </tbody>
</table>

{{site.data.alerts.callout_info}}
When using Kubernetes, recovery actions happen automatically in many cases and no action needs to be taken.
{{site.data.alerts.end}}

## Data failure

When dealing with data failure due to bad actors, rogue applications, or data corruption, domain expertise is required to identify the affected rows and determine how to remedy the situation (e.g., remove the incorrectly inserted rows, insert deleted rows, etc.). However, there are a few actions that you can take for short-term remediation:

- If you are within the garbage collection window, [run differentials](#run-differentials).
- If you have a backup file, [restore to a point in time](#restore-to-a-point-in-time).
- If your cluster is running and you do not have a backup with the data you need, [create a new backup](#create-a-new-backup).
- To [recover from corrupted data in a database or table](#recover-from-corrupted-data-in-a-database-or-table), restore the corrupted object.

{{site.data.alerts.callout_success}}
To give yourself more time to recover and clean up the corrupted data, put your application in “read only” mode and only run [`AS OF SYSTEM TIME`](as-of-system-time.html) queries from the application.
{{site.data.alerts.end}}

### Run differentials

If you are within the [garbage collection window](configure-replication-zones.html#replication-zone-variables) (default is 25 hours), run [`AS OF SYSTEM TIME`](as-of-system-time.html) queries and use [`CREATE TABLE AS … SELECT * FROM`](create-table-as.html) to create comparison data and run differentials to find the offending rows to fix.

If you are outside of the garbage collection window, you will need to use a [backup](backup.html) to run comparisons.

### Restore to a point in time

- If you are a core user, use a [backup](backup.html) that was taken with [`AS OF SYSTEM TIME`](as-of-system-time.html) to restore to a specific point.
- If you are an enterprise user, use your [backup](backup.html) file to [restore to a point in time](take-backups-with-revision-history-and-restore-from-a-point-in-time.html) where you are certain there was no corruption. Note that the backup must have been taken with [revision history](backup.html#with-revision-history).

### Create a new backup

If your cluster is running, you do not have a backup that encapsulates the time you want to [restore](restore.html) to, and the data you want to recover is still in the [garbage collection window](configure-replication-zones.html#replication-zone-variables), there are two actions you can take:

- If you are a core user, trigger a [backup](backup.html) using [`AS OF SYSTEM TIME`](as-of-system-time.html) to create a new backup that encapsulates the specific time. The `AS OF SYSTEM TIME` must be within the [garbage collection window](configure-replication-zones.html#replication-zone-variables) (default is 25 hours).
- If you are an enterprise user, trigger a new [backup `with_revision_history`](take-backups-with-revision-history-and-restore-from-a-point-in-time.html) and you will have a backup you can use to restore to the desired point in time within the [garbage collection window](configure-replication-zones.html#replication-zone-variables) (default is 25 hours).

### Recover from corrupted data in a database or table

If you have corrupted data in a database or table, [restore](restore.html) the object from a prior [backup](backup.html). If revision history is in the backup, you can restore from a [point in time](take-backups-with-revision-history-and-restore-from-a-point-in-time.html).

Instead of dropping the corrupted table or database, we recommend [renaming the table](rename-table.html) or [renaming the database](rename-database.html) so you have historical data to compare to later. If you drop a database, the database cannot be referenced with `AS OF SYSTEM TIME` queries (see [#51380](https://github.com/cockroachdb/cockroach/issues/51380) for more information), and you will need to take a backup that is backdated to the system time when the database still existed.

{{site.data.alerts.callout_info}}
If the table you are restoring has foreign keys, [careful consideration](restore.html#remove-the-foreign-key-before-restore) should be applied to make sure data integrity is maintained during the restore process.
{{site.data.alerts.end}}

## Compromised security keys

CockroachDB maintains a secure environment for your data. However, there are bad actors who may find ways to gain access or expose important security information. In the event that this happens, there are a few things you can do to get ahead of a security issue:

- If you have [changefeeds to cloud storage sinks](#changefeeds-to-cloud-storage), cancel the changefeed job and restart it with new access credentials.
- If you are using [encryption at rest](#encryption-at-rest), rotate the store key(s).
- If you are using [wire encryption / TLS](#wire-encryption-tls), rotate your keys.

### Changefeeds to cloud storage

1. [Cancel the changefeed job](cancel-job.html) immediately and [record the high water timestamp](stream-data-out-of-cockroachdb-using-changefeeds.html#monitor-a-changefeed) for where the changefeed was stopped.
2. Remove the access keys from the identity management system of your cloud provider and replace with a new set of access keys.
3. [Create a new changefeed](create-changefeed.html#start-a-new-changefeed-where-another-ended) with the new access credentials using the last high water timestamp.

### Encryption at rest

If you believe the user-defined store keys have been compromised, quickly attempt to rotate your store keys that are being used for your encryption at rest setup. If this key has already been compromised and the store keys were rotated by a bad actor, the cluster should be wiped if possible and [restored](restore.html) from a prior backup.

If the compromised keys were not rotated by a bad actor, quickly attempt to [rotate the store key](encryption.html#rotating-keys) by restarting each of the nodes with the old key and the new key. For an example on how to do this, see [Encryption](encryption.html#changing-encryption-algorithm-or-keys).

Once all of the nodes are restarted with the new key, put in a request to revoke the old key from the Certificate Authority.

{{site.data.alerts.callout_info}}
CockroachDB does not allow prior store keys to be used again.
{{site.data.alerts.end}}

### Wire Encryption / TLS

As a best practice, [keys should be rotated](rotate-certificates.html). In the event that keys have been compromised, quickly attempt to rotate your keys. This can include rotating node certificates, client certificates, and the CA certificate.

## See also

- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Back up and Restore Data](backup-and-restore.html)
- [Topology Patterns](topology-patterns.html)
- [Production Checklist](recommended-production-settings.html)
