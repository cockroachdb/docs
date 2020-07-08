---
title: Disaster Recovery
summary: Learn how about CockrachDB disaster recovery capabilities and what to do if you encounter an issue.
toc: true
---

CockroachDB is built to be [fault-tolerant and to recover automatically](demo-fault-tolerance-and-recovery.html), but sometimes disasters happen. A _disaster_ is any event that puts your cluster at risk, and usually means your cluster is experiencing [hardware failure](#hardware-failure), [data failure](#data-failure), or has [compromised security keys](#compromised-security-keys). Having a disaster recovery plan enables you to recover quickly, while limiting the consequences.

## Hardware failure

When planning to survive hardware failures, these are the minimum replication factors to apply in order to have greater resilience.

{{site.data.alerts.callout_info}}
Increasing data replication factors may have an impact on [transaction](transactions.html) performance, since quorum levels are increasing.
{{site.data.alerts.end}}

### Single-region survivability planning

The table below displays the minimum replication factor needed to survive simultaneous hardware failures (e.g., disk, node, availability zone (AZ), etc.) for a single-region CockroachDB cluster:

<table>
  <thead>
    <tr>
      <th>Simultaneous Failure</th>
      <th>3 nodes <br>(3 AZ/Racks)</th>
      <th>4 nodes <br>(4 AZ/Racks)</th>
      <th>5 nodes <br>(5 AZ/Racks)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="color:#46a417"><b>Disk</b></td>
      <td>Rep Factor = 3</td>
      <td>Rep Factor = 3</td>
      <td>Rep Factor = 3</td>
    </tr>
      <td style="color:#46a417"><b>Node</b></td>
      <td>Rep Factor = 3</td>
      <td>Rep Factor = 3</td>
      <td>Rep Factor = 3</td>
    <tr>
      <td style="color:#46a417"><b>AZ/Rack</b></td>
      <td>Rep Factor = 3</td>
      <td>Rep Factor = 3</td>
      <td>Rep Factor = 3</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>2 Nodes</b></td>
      <td>Rep Factor = 5</td>
      <td>Rep Factor = 5</td>
      <td>Rep Factor = 5</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>AZ/Rack + Node</b></td>
      <td>Rep Factor = 9</td>
      <td>Rep Factor = 7</td>
      <td>Rep Factor = 5</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>2 AZ/Racks</b></td>
      <td>Not possible</td>
      <td>Not possible</td>
      <td>Rep Factor = 5</td>
    </tr>
  </tbody>
</table>

For example, a single-region, 3-node cluster would need a minimum replication factor of 3 to survive a disk failure.

### Single-region recovery

For hardware failures in a single-region cluster, the recovery actions vary and depend on the type of infrastructure used (e.g., virtual machines, Kubernetes, bare metal).

For example, consider a CockroachBD cluster with the following setup:

- Single-region
- 5 nodes
- Each node is in a separate availability zone or rack
- Replication factor of 5

The table below describes what actions to take to recover from various hardware failures in this example cluster:

<table>
  <thead>
    <tr>
      <th>Simultaneous Failure</th>
      <th>Availability</th>
      <th>Consequence</th>
      <th>Action to Take</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="color:#46a417"><b>1 Disk</td>
      <td style="color:#228B22"><b>√</b></td>
      <td rowspan="7">Fewer resources are available. Some data will be under-replicated until the failed node is marked dead. <br><br>Once marked dead, data is replicated to other nodes and the cluster remains healthy.
      </td>
      <td><a href="start-a-node.html">Restart the node</a> with a new disk.</td>
    </tr>
      <td style="color:#46a417"><b>1 Node</td>
      <td style="color:#228B22"><b>√</b></td>
      <td rowspan="6">If using a Kubenetes StatefulSet, a node will be restarted automatically. <br><br>If the Server, Rack or AZ becomes available, check the <a href="admin-ui-overview-dashboard.html">Overview dashboard</a> on the Admin UI:
      <br><br>- If the down server is marked <b>Suspect</b>, try <a href="start-a-node.html">restarting the node</a>.
      <br>- If the down server is marked <b>Dead</b>, <a href="remove-nodes.html">decommission the node</a> and add a new server. If you try to rejoin the same decommissioned node back into the server, you should wipe the store path before rejoining.</td>
    <tr>
      <td style="color:#46a417"><b>1 Rack</b></td>
      <td style="color:#228B22"><b>√</b></td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>1 AZ</b></td>
      <td style="color:#228B22"><b>√</b></td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>2 Nodes</b></td>
      <td style="color:#228B22"><b>√</b></td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>1 AZ + 1 Node</b></td>
      <td style="color:#228B22"><b>√</b></td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>2 AZ</b></td>
      <td style="color:#228B22"><b>√</b></td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>3 Nodes</b></td>
      <td style="color:#FF0000"><b>X</b></td>
      <td>Cluster will become unavailable.</td>
      <td>Recover one of the 3 nodes that are down to regain quorum. <br><br>If you can’t recover one of the 3 failed nodes, <a href="https://support.cockroachlabs.com">contact Cockroach Labs support</a> so we can assist in your cluster’s recovery.</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>1 Region</td>
      <td style="color:#FF0000"><b>X</b></td>
      <td>Cluster will become unavailable. <br><br>Potential data loss between last backup and time of outage if region and servers did not come back online. <br><br>This would be a considerable disaster (i.e., an entire data center was destroyed).</td>
      <td>When the region comes back online, try <a href="cockroach-start.html">restarting the nodes</a> in the cluster. <br><br>If region does not come back online and servers are lost or destroyed, try <a href="restore.html">restoring the latest cluster backup</a> into a new cluster.</td>
    </tr>
  </tbody>
</table>

<span style="color:#228B22"><b>√</b></span> = Available
<span style="color:#FF0000"><b>X</b></span> = Outage

### Multi-region survivability planning

The table below displays the minimum replication factor needed to survive simultaneous hardware failures (e.g., disk, node, availability zone (AZ), etc.) for a multi-region CockroachDB cluster:

{{site.data.alerts.callout_danger}}
The chart below describes the CockroachDB default behavior when locality flags are correctly set. It does not use geo-partitioning or a specific [topology pattern](topology-patterns.html). For a multi-region cluster in production, we do not recommend using the default behavior, as the cluster's performance will be negatively affected.
{{site.data.alerts.end}}

<table>
  <thead>
    <tr>
      <th>Simultaneous Failure</th>
      <th>3 Regions <br>(3 AZ/Racks) <br>(9 Nodes)</th>
      <th>4 Regions <br>(4 AZ/Racks) <br>(12 Nodes)</th>
      <th>5 Regions <br>(5 AZ/Racks) <br>(15 Nodes)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="color:#46a417"><b>Disk</b></td>
      <td>Rep Factor = 3</td>
      <td>Rep Factor = 3</td>
      <td>Rep Factor = 3</td>
    </tr>
      <td style="color:#46a417"><b>Node</b></td>
      <td>Rep Factor = 3</td>
      <td>Rep Factor = 3</td>
      <td>Rep Factor = 3</td>
    <tr>
      <td style="color:#46a417"><b>AZ/Rack</b></td>
      <td>Rep Factor = 3</td>
      <td>Rep Factor = 3</td>
      <td>Rep Factor = 3</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>Region</b></td>
      <td>Rep Factor = 3</td>
      <td>Rep Factor = 3</td>
      <td>Rep Factor = 3</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>Region + 1 Node</b></td>
      <td>Rep Factor = 7</td>
      <td>Rep Factor = 7</td>
      <td>Rep Factor = 5</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>2 Nodes</b></td>
      <td>Rep Factor = 5</td>
      <td>Rep Factor = 5</td>
      <td>Rep Factor = 5</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>2 Regions</b></td>
      <td>Not possible</td>
      <td>Not possible</td>
      <td>Rep Factor = 5</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>2 Regions + 1 Node</b></td>
      <td>Not possible</td>
      <td>Not possible</td>
      <td>Rep Factor = 11</td>
    </tr>
  </tbody>
</table>

For example, a 3-region, 9-node cluster would need a minimum replication factor of 3 to survive a disk failure.

### Multi-region recovery

For hardware failures in a multi-region cluster, the actions taken to recover vary and depend on the type of infrastructure used (e.g., virtual machines, Kubernetes, bare metal).

For example, consider a CockroachBD cluster with the following setup:

- Multi-region
- 9 nodes
- Each node is in a separate availability zone
- 3 nodes in each region
- Replication factor of 3

The table below describes what actions to take to recover from various hardware failures in this example cluster:

<table>
  <thead>
    <tr>
      <th>Simultaneous Failure</th>
      <th>Availability</th>
      <th>Consequence</th>
      <th>Action to Take</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="color:#46a417"><b>1 Disk</td>
      <td style="color:#228B22"><b>√</b></td>
      <td rowspan="5">Under-replicated data. Less resources for workload.</td>
      <td><a href="start-a-node.html">Restart the node</a> with a new disk.</td>
    </tr>
      <td style="color:#46a417"><b>1 Server</td>
      <td style="color:#228B22"><b>√</b></td>
      <td rowspan="3">If using a Kubenetes StatefulSet, a node will be restarted automatically. <br><br>If the server, rack, or AZ becomes available check the <a href="admin-ui-overview-dashboard.html">Overview dashboard</a> on the Admin UI:
      <br><br>- If the down server is marked <b>Suspect</b>, try <a href="start-a-node.html">restarting the node</a>.
      <br>- If the down server is marked <b>Dead</b>, <a href="remove-nodes.html">decommission the node</a> and add a new server. If you try to rejoin the same decommissioned node back into the server, you should wipe the store path before rejoining.</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>1 Rack</b></td>
      <td style="color:#228B22"><b>√</b></td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>1 AZ</b></td>
      <td style="color:#228B22"><b>√</b></td>
      <td></td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>1 Region</b></td>
      <td style="color:#228B22"><b>√</b></td>
      <td>Check the <a href="admin-ui-overview-dashboard.html">Overview dashboard</a> on the Admin UI. If servers are marked <b>Dead</b>, <a href="remove-nodes.html">decommission the nodes</a> and add 3 new servers in a new region.</td>
    </tr>
    <tr>
      <td style="color:#46a417"><b>2 or More Regions</b></td>
      <td style="color:#FF0000"><b>X</b></td>
      <td>Cluster will be unavailable. <br><br>Potential data loss between last backup and time of outage if region and servers did not come back online. This would be a considerable disaster (i.e., 2 or more data centers destroyed).</td>
      <td>When the regions comes back online, try <a href="cockroach-start.html">restarting the nodes</a> in the cluster. <br><br>If the regions do not come back online and servers are lost or destroyed, try <a href="restore.html">restoring the latest cluster backup</a> into a new cluster.</td>
    </tr>
  </tbody>
</table>

<span style="color:#228B22"><b>√</b></span> = Available
<span style="color:#FF0000"><b>X</b></span> = Outage

## Data failure

When dealing with data failure due to bad actors, rogue applications, or data corruption, domain expertise is required for long-term solutions. However, there are a few options for short term remediation that you can take:

#### Basic recovery actions

- Using your backup file, [restore to a point in time](backup-and-restore-advanced-options.html#point-in-time-restore) for the corrupted data to a point where you are certain there was no corruption.

    {{site.data.alerts.callout_success}}
    Instead of dropping the corrupted table or database, we recommend [renaming the table](rename-table.html) or [renaming the database](rename-database.html) so you have historical data to compare to later.
    {{site.data.alerts.end}}

- Run [`AS OF SYSTEM TIME`](as-of-system-time.html) queries and use [`CREATE TABLE AS … SELECT * FROM`](create-table-as.html) to create comparison data and run “diffs” to find the offending rows to fix.

#### Advanced recovery actions

- While you clean up the data, put your application in “read only” mode and only run [`AS OF SYSTEM TIME`](as-of-system-time.html) queries from the application.
- If your cluster is running and you do not have a backup that encapsulates the time you want to restore to, immediately trigger a new [backup `with_revision_history`](backup-and-restore-advanced-options.html#backup-with-revision-history-and-point-in-time-restore) and you will have a backup you can use to restore to the desired point in time.

### Recover from corrupted data in table

[Restore the table](restore.html#tables) from a prior [backup](backup.html) or a [point in time](backup-and-restore-advanced-options.html#backup-with-revision-history-and-point-in-time-restore) if revision history is in the backup. If the table has [foreign keys](foreign-key.html), [careful consideration](backup-and-restore-advanced-options.html#remove-the-foreign-key-before-restore) should be applied to make sure data integrity is maintained during the restore process.

### Recover from corrupted data in a database

[Restore the database](restore.html#databases) from a prior [backup](backup.html) or a [point in time](backup-and-restore-advanced-options.html#backup-with-revision-history-and-point-in-time-restore) if revision history is in the backup.

## Compromised security keys

CockroachDB maintains a secure environment for your data. However, there are bad actors who may find ways to gain access or expose important security information. In the event that this happens, there are a few things you can do to get ahead of a security issue (see the linked sections for more details):

- If you have [changefeeds to cloud storage sinks](#changefeeds-to-cloud-storage), cancel the changefeed job and restart it with new access credentials.
- If you are using [encryption at rest](#encryption-at-rest), rotate the store key(s).
- If you are using [wire encryption / TLS](#wire-encryption-tls), rotate your keys.

{{site.data.alerts.callout_success}}
As a best practice, keys should be rotated on an occasional basis to ensure an extra layer of security.
{{site.data.alerts.end}}

### Changefeeds to cloud storage

1. [Cancel the changefeed job](cancel-job.html) immediately and [record the high water timestamp](change-data-capture.html#monitor-a-changefeed) for where the changefeed was stopped.
2. Remove the access keys from the identify management system of your cloud provider and replace with a new set of access keys.
3. [Create a new changefeed](create-changefeed.html#start-a-new-changefeed-where-another-ended) with the new access credentials using the last high water timestamp.

### Encryption at rest

If you believe the user-defined store keys have been compromised, quickly attempt to rotate your store keys that are being used for your encryption at rest setup. If this key has already been compromised and the store keys were rotated by a bad actor, the cluster should be wiped if possible and [restored](restore.html) from a prior backup.

If the compromised key were not rotated by a bad actor, quickly attempt to [rotate the store key](encryption.html#rotating-keys) by restarting each of the nodes with the old key and the new key. For an example on how to do this, see [Encryption](encryption.html#changing-encryption-algorithm-or-keys).

Once all of the nodes are restarted with the new key, put in a request to revoke the old key from the Certificate Authority.

{{site.data.alerts.callout_info}}
CockroachDB does not allow prior store keys to be used again.
{{site.data.alerts.end}}

### Wire Encryption / TLS

As a best practice, [keys should be rotated](rotate-certificates.html). In the event that keys have been compromised, quickly attempt to rotate your keys. This can include rotating node certificates, client certificates, and the CA certificate.
