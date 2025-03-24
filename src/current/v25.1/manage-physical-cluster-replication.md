---
title: Manage Physical Cluster Replication
summary: Learn how to manage a physical cluster replication (PCR) stream.
toc: true
---

[Physical cluster replication (PCR)]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) enables continuous replication of data from an active primary cluster to a passive standby cluster, supporting high availability and disaster recovery scenarios. 
This page describes:

- [Connecting to and interacting with](#connection-reference) the system virtual cluser and virtual clusters on each physical cluster. 
- [Managing PCR](#manage-replication-in-the-sql-shell) using SQL statements.
- [Upgrading CockroachDB](#upgrade-the-cluster-version-on-the-primary-and-standby) on both the primary and standby clusters. 

## Connection reference

This table outlines the connection strings to connect to the primary and standby cluster's [virtual clusters]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}).

{{site.data.alerts.callout_success}}
You can use an [external connection]({% link {{ page.version.version }}/create-external-connection.md %}) to define a name for connections using the `postgresql://` scheme.
{{site.data.alerts.end}}

The table uses `main` as an example name for the virtual cluster that contains user table data in the primary and standby clusters.

Cluster | Virtual Cluster | Usage | URL and Parameters
--------+-----------------+-------+-------------------
Primary | System | Set up a replication user and view running virtual clusters. Connect with [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}). | `"postgresql://root@{node IP or hostname}:{26257}?options=-ccluster=system&sslmode=verify-full"`<br><br><ul><li>`options=-ccluster=system`</li><li>`sslmode=verify-full`</li></ul>Use the `--certs-dir` flag to specify the path to your certificate.
Primary | Main | Add and run a workload with [`cockroach workload`]({% link {{ page.version.version }}/cockroach-workload.md %}). | `"postgresql://root@{node IP or hostname}:{26257}?options=-ccluster=main&sslmode=verify-full&sslrootcert=certs/ca.crt&sslcert=certs/client.root.crt&sslkey=certs/client.root.key"`<br><br>{% include {{ page.version.version }}/connect/cockroach-workload-parameters.md %} As a result, for the example in this tutorial, you will need:<br><br><ul><li>`options=-ccluster={virtual_cluster_name}`</li><li>`sslmode=verify-full`</li><li>`sslrootcert={path}/certs/ca.crt`</li><li>`sslcert={path}/certs/client.root.crt`</li><li>`sslkey={path}/certs/client.root.key`</li></ul>
Standby | System | Manage the replication stream. Connect with [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}). | `"postgresql://root@{node IP or hostname}:{26257}?options=-ccluster=system&sslmode=verify-full"`<br><br><ul><li>`options=-ccluster=system`</li><li>`sslmode=verify-full`</li></ul>Use the `--certs-dir` flag to specify the path to your certificate.
Standby/Primary | System | Connect to the other cluster. | `"postgresql://{replication user}:{password}@{node IP or hostname}:{26257}/defaultdb?options=-ccluster%3Dsystem&sslinline=true&sslmode=verify-full&sslrootcert=-----BEGIN+CERTIFICATE-----{encoded_cert}-----END+CERTIFICATE-----%0A"`<br><br>Generate the connection string with [`cockroach encode-uri`]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-3-manage-the-cluster-certificates). Use the generated connection string in:<br><br><ul><li>`CREATE VIRTUAL CLUSTER` statements to [start the replication stream]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-4-start-replication).</li><li>`ALTER VIRTUAL CLUSTER` statements to [fail back to the primary cluster]({% link {{ page.version.version }}/failover-replication.md %}#failback).</li></ul>
Standby | Read only | Run read queries on the standby's replicating virtual cluster | `"postgresql://root@{node IP or hostname}:{26257}?options=-ccluster=main-readonly&sslmode=verify-full"`<br><br><ul><li>`options=-ccluster=main-readonly`</li><li>`sslmode=verify-full`</li></ul>Use the `--certs-dir` flag to specify the path to your certificate.

For additional detail on the standard CockroachDB connection parameters, refer to [Client Connection Parameters]({% link {{ page.version.version }}/connection-parameters.md %}#connect-using-a-url).

## Manage replication in the SQL shell

To start, manage, and observe PCR, you can use the following SQL statements:

Statement | Action
----------+------
[`CREATE VIRTUAL CLUSTER ... FROM REPLICATION OF ...`]({% link {{ page.version.version }}/create-virtual-cluster.md %}) | Start a PCR stream and [configure the stream's behavior]({% link {{ page.version.version }}/create-virtual-cluster.md %}#options).
[`ALTER VIRTUAL CLUSTER`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}) | Pause and resume PCR streams, [initiate a failover]({% link {{ page.version.version }}/alter-virtual-cluster.md %}#start-the-failover-process), and configure a running stream's behavior.
[`SHOW VIRTUAL CLUSTER`]({% link {{ page.version.version }}/show-virtual-cluster.md %}) | Show all virtual clusters and PCR stream status in the physical cluster.
[`DROP VIRTUAL CLUSTER`]({% link {{ page.version.version }}/drop-virtual-cluster.md %}) | Remove a virtual cluster.

## Upgrade the cluster version on the primary and standby

{{site.data.alerts.callout_danger}}
The standby cluster must be at the same version as, or one version ahead of, the primary's virtual cluster.
{{site.data.alerts.end}}

To upgrade the primary and standby clusters in PCR, complete the following steps in order:

### Step 1. Upgrade the binary on both clusters

Upgrade the binary on **every node** in both the primary and standby clusters:

1. Replace the `cockroach` binary on each node.
1. Restart CockroachDB each node.

You can find more details on upgrading the binary in [Perform a major-version upgrade]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#perform-a-major-version-upgrade).

### Step 2. Finalize the upgrade on each virtual cluster

You must finalize the upgrade on each virtual cluster in this order:

1. Standby system virtual cluster  
1. Primary system virtual cluster  
1. Standby application virtual cluster  
1. Primary application virtual cluster  

Repeat these steps for **each** virtual cluster in the specified order. To finalize a virtual cluster:

1. Connect to the virtual cluster using the SQL shell:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql "<connection string>"
    ~~~

    Use the [Connection reference](#connection-reference) to find the correct connection strings.

1. Run the following command, replacing `{VERSION}` with the target major version (e.g., `{{ page.version.version }}`):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING version = '{VERSION}';
    ~~~

This upgrades the standby cluster before the primary cluster. Within the primary and standby CockroachDB clusters, the system virtual cluster must be at a cluster version greater than or equal to the virtual cluster.

{{site.data.alerts.callout_info}}
It is possible to perform a failover from the primary to the standby during the upgrade; however, you will not be able perform a failback from the promoted original standby when it is a version ahead of the original primary cluster.
{{site.data.alerts.end}}

For more details on finalizing or rolling back the upgrade, refer to [Upgrade CockroachDB self-hosted]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}) page.