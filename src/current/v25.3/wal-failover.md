---
title: WAL Failover
summary: Mitigate the effects of disk stalls in cloud deployments by failing over WAL writes to a secondary store.
toc: true
docs_area: deploy
---

{% include {{ page.version.version }}/wal-failover-intro.md %}

This page has detailed information about WAL failover, including:

- How WAL failover works.
- How to enable WAL failover.
- How to disable WAL failover.
- How to test WAL failover.
- How to monitor WAL failover.
- How to configure WAL failover in multi-store configurations.
- Frequently Asked Questions about WAL failover.

For basic information about WAL failover, see [`cockroach start` > WAL failover]({% link {{ page.version.version }}/cockroach-start.md %}#write-ahead-log-wal-failover).

## Why WAL failover?

In cloud environments, transient [disk stalls]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#disk-stalls) are common, often lasting on the order of several seconds. This will negatively impact latency for the user-facing foreground workload. In the field, Cockroach Labs has observed that stalls while writing to the WAL are the most impactful to foreground latencies. Most other writes, such as flushes and compactions, happen asynchronously in the background, and foreground operations do not need to wait for them.

When a disk stalls on a node, it could be due to complete hardware failure or it could be a transient stall. When a disk backing a [store]({% link {{ page.version.version}}/cockroach-start.md %}#store) stalls in CockroachDB, all the writes to [ranges]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) for which the node is [leaseholder]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-leaseholder) will be blocked until the disk stall clears, or the node is crashed (after default interval defined by [`COCKROACH_ENGINE_MAX_SYNC_DURATION_DEFAULT`](#important-environment-variables)), moving any leaseholders on this store to other stores.

WAL failover uses a secondary disk to fail over WAL writes to when transient disk stalls occur. This limits the write impact to a few hundreds of milliseconds (the [failover threshold, which is configurable](#unhealthy-op-threshold)). Note that WAL failover **only preserves availability of writes**. If reads to the underlying storage are also stalled, operations that read and do not find data in the block cache or page cache will stall.

The following diagram shows how WAL failover works at a high level. For more information about the WAL, memtables, and SSTables, refer to the [Architecture &raquo; Storage Layer documentation]({% link {{ page.version.version }}/architecture/storage-layer.md %}).

<img src="{{ 'images/{{ page.version.version }}/wal-failover-overview.png' | relative_url }}" alt="WAL failover overview diagram"  style="border:1px solid #eee;max-width:100%" />

## Create and configure a cluster to be ready for WAL failover

The steps to provision a cluster that has a single data store versus a multi-store cluster are slightly different. In this section, we will provide high-level instructions for setting up each of these configurations. We will use [GCE](https://cloud.google.com/compute/docs) as the environment. You will need to translate these instructions into the steps used by the deployment tools in your environment.

<a name="multi-store-config"></a>

### Provision a multi-store cluster for WAL failover

This section explains how to provision a multi-store cluster and configure it for WAL failover.

#### 1. Create the cluster

Provision a 3-node cluster with 4 SSDs for each node. Deploy each node to a different region (e.g., [in GCE](https://cloud.google.com/compute/docs/regions-zones), `us-east4-a`, `us-west2-b`, `us-central1-c`). Be sure to [create a separate volume for each SSD](https://cloud.google.com/compute/docs/disks).

#### 2. Stage the cluster

[Install CockroachDB]({% link {{ page.version.version }}/install-cockroachdb-linux.md %}) on each node.

#### 3. Log configuration for WAL failover

If you are logging to a [file-based sink]({% link {{ page.version.version }}/configure-logs.md %}#output-to-files), create a `logs.yaml` file. Later on, you will pass this file to `cockroach start` when starting each node in the cluster. Not doing so will negate the positive impact of enabling WAL failover, because writes to the diagnostic logs may block indefinitely during the disk stall, effectively stalling the node.

{% include {{ page.version.version }}/wal-failover-log-config.md %}

After creating this file, transfer it to the nodes on the cluster.

For more information about how to configure CockroachDB logs, refer to [Configure logs]({% link {{ page.version.version }}/configure-logs.md %}).

#### 4. Start the multi-store cluster with WAL failover enabled

To enable WAL failover when you start the cluster, either pass the [`--wal-failover=among-stores` to `cockroach start`]({% link {{ page.version.version }}/cockroach-start.md%}#enable-wal-failover)

 *OR*

set [the environment variable `COCKROACH_WAL_FAILOVER=among-stores`]({% link {{ page.version.version }}/cockroach-start.md%}#enable-wal-failover) before starting the cluster.

Additionally, you must set the value of the environment variable `COCKROACH_ENGINE_MAX_SYNC_DURATION_DEFAULT` to `40s`. By default, CockroachDB detects prolonged stalls and crashes the node after `20s`. With WAL failover enabled, CockroachDB should be able to survive stalls of up to `40s` with minimal impact to the workload.

You must also [configure logs]({% link {{ page.version.version }}/configure-logs.md %}) by passing in the `logs.yaml` file that you configured in [Step 3](#3-sidecar-configure-logs).

Replicate the shell commands below on each node using your preferred deployment model. Be sure to edit the values of the flags passed to [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) as needed for your environment.

{% include_cached copy-clipboard.html %}
~~~ shell
$ export COCKROACH_LOG_MAX_SYNC_DURATION=40s
$ export COCKROACH_ENGINE_MAX_SYNC_DURATION_DEFAULT=40s
$ cockroach start --certs-dir certs --listen-addr=:26257 --http-addr=:26258 --advertise-addr=10.150.0.69:26257 --join=34.48.91.20:26257 --store path=/mnt/data1/cockroach,attrs=store1:node1:node1store1 --store path=/mnt/data2/cockroach,attrs=store2:node1:node1store2 --store path=/mnt/data3/cockroach,attrs=store3:node1:node1store3 --store path=/mnt/data4/cockroach,attrs=store4:node1:node1store4 --locality=cloud=gce,region=us-east4,zone=us-east4-a,rack=0 --wal-failover=among-stores --log-config-file=logs.yaml
~~~

Notice the flags passed to `cockroach start`:

- Multiple `--store` paths
- `--wal-failover=among-stores` since there are multiple stores to choose from for WAL failover
- `--log-config-file` uses the `logs.yaml` created in [Step 3](#3-log-configuration-for-wal-failover)

<a name="single-store-config"></a>

### Provision a single-store cluster and side disk for WAL failover

When you have a cluster with a single data store and you want to configure the cluster with WAL failover, make sure that you have at least two disks on each node of the cluster: one for the data store, and one small side disk to use for WAL failover. The side disk should have the following properties:

{% include {{ page.version.version }}/wal-failover-side-disk.md %}

<a name="1-sidecar-create"></a>

#### 1. Create the cluster

Provision a 3-node cluster with 2 SSDs for each node. Deploy each node to a different region (e.g. [in GCE](https://cloud.google.com/compute/docs/regions-zones), `us-east4-a`, `us-west2-b`, `us-central1-c`). Be sure to [create a separate volume for each SSD](https://cloud.google.com/compute/docs/disks).

<a name="2-sidecar-stage"></a>

#### 2. Stage the cluster

[Install CockroachDB]({% link {{ page.version.version }}/install-cockroachdb-linux.md %}) on each node.

<a name="3-sidecar-configure-logs"></a>

#### 3. Log configuration for WAL failover

If you are logging to a file-based sink, create a `logs.yaml` file. Later on, you will pass this file to `cockroach start` when starting each node in the cluster. Not doing so will negate the positive impact of enabling WAL failover, because writes to the diagnostic logs may block indefinitely during the disk stall, effectively stalling the node.

{% include {{ page.version.version }}/wal-failover-log-config.md %}

After creating this file, transfer it to the nodes on the cluster.

For more information about how to configure CockroachDB logs, refer to [Configure logs]({% link {{ page.version.version }}/configure-logs.md %}).

<a name="4-sidecar-prepare-failover-disk"></a>

#### 4. Prepare the WAL failover side disk on the cluster

To enable WAL failover on a single data store cluster with a side disk, you need to:

1. Make sure that each node has an additional disk available for WAL failover before starting the cluster (as described in [Step 1](#1-sidecar-create)).
1. Know the path to this side disk.

To find out the path to the side disk, `ssh` to one of the nodes in the cluster and use the `lsblk` command to see the path to the `data2` volume. The output should look like the following:

{% include_cached copy-clipboard.html %}
~~~ shell
NAME    MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
loop0     7:0    0  63.9M  1 loop /snap/core20/2182
loop1     7:1    0 354.3M  1 loop /snap/google-cloud-cli/223
loop2     7:2    0    87M  1 loop /snap/lxd/27428
loop3     7:3    0  39.1M  1 loop /snap/snapd/21184
sda       8:0    0    10G  0 disk
├─sda1    8:1    0   9.9G  0 part /
├─sda14   8:14   0     4M  0 part
└─sda15   8:15   0   106M  0 part /boot/efi
nvme0n1 259:0    0   375G  0 disk /mnt/data1
nvme0n2 259:1    0   375G  0 disk /mnt/data2
~~~

The preceding output shows that the path to `data2` volume is `/mnt/data2`. For each node, create the directory `/mnt/data2/cockroach` on the side disk volume where the WAL failover data can be written. `/mnt/data1` will be used as the single store for the cluster.

{% include_cached copy-clipboard.html %}
~~~ shell
mkdir /mnt/data2/cockroach
~~~

<a name="5-sidecar-start"></a>

#### 5. Start the cluster with WAL failover enabled

To enable WAL failover when you start the cluster, either pass the [`--wal-failover=path={ path-to-my-side-disk-for-wal-failover }` to `cockroach start`]({% link {{ page.version.version }}/cockroach-start.md%}#enable-wal-failover)

 *OR*

set [the environment variable `COCKROACH_WAL_FAILOVER=path={ path-to-my-side-disk-for-wal-failover }`]({% link {{ page.version.version }}/cockroach-start.md%}#enable-wal-failover) before starting the cluster.

Additionally, you must set the value of the environment variable `COCKROACH_ENGINE_MAX_SYNC_DURATION_DEFAULT` to `40s`. By default, CockroachDB detects prolonged stalls and crashes the node after `20s`. With WAL failover enabled, CockroachDB should be able to survive stalls of up to `40s` with minimal impact to the workload.

You must also [configure logs]({% link {{ page.version.version }}/configure-logs.md %}) by passing in the `logs.yaml` file that you configured in [Step 3](#3-sidecar-configure-logs).

Replicate the shell commands below on each node using your preferred deployment model. Be sure to edit the values of the flags passed to [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) as needed for your environment.

{% include_cached copy-clipboard.html %}
~~~ shell
$ export COCKROACH_LOG_MAX_SYNC_DURATION=40s
$ export COCKROACH_ENGINE_MAX_SYNC_DURATION_DEFAULT=40s
$ cockroach start --certs-dir certs --listen-addr=:26257 --http-addr=:26258 --advertise-addr=10.150.0.54:26257 --join=34.48.145.131:26257 --store path=/mnt/data1/cockroach,attrs=store1:node1:node1store1 --cache=25% --locality=cloud=gce,region=us-east4,zone=us-east4-a,rack=0 --log-config-file=logs.yaml --wal-failover=path=/mnt/data2/cockroach
~~~

Notice the flags passed to `cockroach start`:

- `--wal-failover`'s value is `path=/mnt/data2/cockroach` since that is the single failover disk
- `--log-config-file` is `logs.yaml`
- The data store (store 1) path in `--store` is `/mnt/data1/cockroach`

## WAL failover in action

The instructions in this section show how to trigger WAL failover by introducing disk stalls on one of the nodes in the cluster. Note that the steps are the same for [single-store](#single-store-config) or [multi-store](#multi-store-config) clusters.

### 1. Set up a node with scripts to trigger WAL Failover

Trigger WAL failover on a node by slowing down the read bytes per second (`rbps`) and write bytes per second (`wbps`) for a disk.

`ssh` into the node whose disk you want to stall and unstall.

Run the `lsblk` command, and look for `MAJ:MIN` values for `/mnt/data1` in `lsblk` output. In this case it is `259:0`; you will use this for the disk stall/unstall scripts.

{% include_cached copy-clipboard.html %}
~~~ shell
roachprod ssh $CLUSTER:1 lsblk
NAME    MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
loop0     7:0    0  63.9M  1 loop /snap/core20/2182
loop1     7:1    0 354.3M  1 loop /snap/google-cloud-cli/223
loop2     7:2    0    87M  1 loop /snap/lxd/27428
loop3     7:3    0  39.1M  1 loop /snap/snapd/21184
sda       8:0    0    10G  0 disk
├─sda1    8:1    0   9.9G  0 part /
├─sda14   8:14   0     4M  0 part
└─sda15   8:15   0   106M  0 part /boot/efi
nvme0n1 259:0    0   375G  0 disk /mnt/data1
nvme0n2 259:1    0   375G  0 disk /mnt/data2
nvme0n3 259:2    0   375G  0 disk /mnt/data3
nvme0n4 259:3    0   375G  0 disk /mnt/data4
~~~

Create scripts for stalling and unstalling the disk on this node. The script will add a line in `/sys/fs/cgroup/system.slice/cockroach-system.service/io.max` to change the [cgroup](https://en.wikipedia.org/wiki/Cgroups) settings "read bytes per second" (`rbps`) and "write bytes per second" (`wbps`) of the disk to a very low value for stalling, and a max value for unstalling.

Create a shell script that will invoke the commands to stall and unstall alternately. Call this script `wal-flip.sh` with the content shown below:

{% include_cached copy-clipboard.html %}
~~~ shell
# wal-flip.sh
# We are alternatively running stall and unstall at increasing periods of 5s up to 40s
while (true)
do
    date
    echo "Stalling"
    sudo echo '259:0 rbps=4 wbps=4' > /sys/fs/cgroup/system.slice/cockroach-system.service/io.max
    sleep 5
    date
    echo "Unstalling"
    sudo echo '259:0 rbps=max wbps=max' > /sys/fs/cgroup/system.slice/cockroach-system.service/io.max
    sleep 10
    date
    echo "Stalling"
    sudo echo '259:0 rbps=4 wbps=4' > /sys/fs/cgroup/system.slice/cockroach-system.service/io.max
    sleep 15
    date
    echo "Unstalling"
    sudo echo '259:0 rbps=max wbps=max' > /sys/fs/cgroup/system.slice/cockroach-system.service/io.max
    sleep 20
    date
    echo "Stalling"
    sudo echo '259:0 rbps=4 wbps=4' > /sys/fs/cgroup/system.slice/cockroach-system.service/io.max
    sleep 40
    echo "UnStalling"
    sudo echo '259:0 rbps=max wbps=max' > /sys/fs/cgroup/system.slice/cockroach-system.service/io.max
    sleep 600
    exit
done
# eof
~~~

Next, make the script file executable:

{% include_cached copy-clipboard.html %}
~~~ shell
chmod 777 wal-flip.sh
~~~

Optionally, you can run a [workload]({% link {{ page.version.version }}/cockroach-workload.md %}) at this point, if you want to see your workload continue during WAL failover. However, the presence of the workload does not have any bearing on the operation of WAL failover.

### 2. WAL failover during transient disk stalls

#### Cause transient disk stall

Before triggering a WAL failover, open the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) so that you can observe WAL failover metrics.

Trigger WAL failover by introducing a transient disk stall that is shorter in duration than the value of [`COCKROACH_ENGINE_MAX_SYNC_DURATION_DEFAULT`](#important-environment-variables). To do so, run the `wal-flip.sh` script that you created in [Step 1](#1-set-up-a-node-with-scripts-to-trigger-wal-failover).

{% include_cached copy-clipboard.html %}
~~~ shell
wal-flip.sh
~~~

#### WAL failover metrics

{% include {{ page.version.version }}/wal-failover-metrics.md %}

Whenever a WAL failover occurs on a disk, `wal.failover.switch.count` for the associated store will increment by 1.

In [DB Console's **Advanced Debug** page]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}), click on **Custom Time series chart**. On the custom chart page, add three charts: one for each of the preceding metrics.

Set the source of these metrics to be the node where you are running the disk stall/unstall script.

<img src="{{ 'images/{{ page.version.version }}/wal-failover-metrics-chart.jpg' | relative_url }}" alt="WAL Failover Metrics Chart" style="border:1px solid #eee;max-width:100%" />

Notice there is a switchover followed by each stall. The node with the stalled disk continues to perform normal operations during and after WAL failover, as the stalls are transient and shorter than the current value of [`COCKROACH_ENGINE_MAX_SYNC_DURATION_DEFAULT`](#important-environment-variables).

You can confirm that the node is still live and available using [`cockroach node status`]({% link {{ page.version.version }}/cockroach-node.md %}#node-status).

### 3. WAL failover during long disk stalls

#### Cause long disk stall

Before triggering a WAL failover, open the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) so that you can observe WAL failover metrics.

Trigger WAL failover by introducing a transient disk stall that is `100s` in duration (longer than the value of [`COCKROACH_ENGINE_MAX_SYNC_DURATION_DEFAULT`](#important-environment-variables)).

Create a file named `long-stall.sh` with the following content, which will cause long disk stalls:

{% include_cached copy-clipboard.html %}
~~~ shell
while (true)
do
    date
    echo "Stalling for 100 seconds"
    sudo echo '259:0 rbps=4 wbps=4' > /sys/fs/cgroup/system.slice/cockroach-system.service/io.max
    sleep 100
    date
    echo "Unstalling"
    sudo echo '259:0 rbps=max wbps=max' > /sys/fs/cgroup/system.slice/cockroach-system.service/io.max
    sleep 10
    date
    exit
done
~~~

Make the script file executable:

{% include_cached copy-clipboard.html %}
~~~ shell
chmod 777 wal-flip.sh
~~~

Cause a long stall:

{% include_cached copy-clipboard.html %}
~~~ shell
long-stall.sh
~~~

#### WAL failover metrics

{% include {{ page.version.version }}/wal-failover-metrics.md %}

Whenever a WAL failover occurs on a disk, `wal.failover.switch.count` for the associated store will increment by 1.

When the disk continues to be stalled for longer than the duration of [`COCKROACH_ENGINE_MAX_SYNC_DURATION_DEFAULT`](#important-environment-variables), the node goes down, and there is no more metrics data coming from that node.

You can confirm that the node is down (no longer live and available) using [`cockroach node status`]({% link {{ page.version.version }}/cockroach-node.md %}#node-status).

## Summary

### Important environment variables

Variable | Description | Default | Recommended value with WAL failover enabled
---------|-------------|---------|---------------------------------------------
`COCKROACH_ENGINE_MAX_SYNC_DURATION_DEFAULT` | The threshold above which an observed engine sync duration triggers a fatal error. This environment variable is the default for the [`storage.max_sync_duration`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-storage-max-sync-duration) cluster setting. If that cluster setting is explicitly set, it takes precedence over this environment variable. | `20s` | `40s`
`COCKROACH_LOG_MAX_SYNC_DURATION` | The maximum duration the file sink is allowed to take to write a log entry before the `cockroach` process is killed due to a disk stall. | `20s` | `40s`

### To enable WAL Failover

Set up your cluster for WAL failover with either [multiple stores](#multi-store-config) or a [side disk](#single-store-config).

For [multiple stores](#multi-store-config), pass `--wal-failover=among-stores` to [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}).

For a [side disk on a single-store config](#single-store-config), pass `--wal-failover={ path-to-my-side-disk-for-wal-failover }` to [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}).

Use remote log sinks, or if you use file-based logging, enable asynchronous buffering of `file-groups` log sinks:

{% include {{ page.version.version }}/wal-failover-log-config.md %}

Change the value of `COCKROACH_ENGINE_MAX_SYNC_DURATION_DEFAULT` by setting it as follows:

1. Before starting the cluster, set it using the [`COCKROACH_ENGINE_MAX_SYNC_DURATION_DEFAULT`](#important-environment-variables) environment variable.
1. After starting the cluster, set it by changing the [`storage.max_sync_duration`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-storage-max-sync-duration) cluster setting. When WAL failover is enabled, [Cockroach Labs recommends using `40s` for this setting](#4-what-is-the-best-practice-storage-max_sync_duration). If WAL failover is not enabled, **do not change the default value of this setting**.

### To monitor WAL failover

{% include {{ page.version.version }}/wal-failover-metrics.md %}

### WAL failover behavior

If a disk stalls for less than the duration of [`COCKROACH_ENGINE_MAX_SYNC_DURATION_DEFAULT`](#important-environment-variables), WAL failover will trigger and the node will continue to operate normally.

If a disk stalls for longer than the duration of [`COCKROACH_ENGINE_MAX_SYNC_DURATION_DEFAULT`](#important-environment-variables), a WAL failover will trigger. Following that, since the duration of [`COCKROACH_ENGINE_MAX_SYNC_DURATION_DEFAULT`](#important-environment-variables) has been exceeded, the node will go down.

In a [multi-store](#multi-store-config) cluster, if a disk for a store has a transient stall, WAL will failover to the second store's disk. When the stall on the first disk clears, the WAL will failback to the first disk. WAL failover will daisy-chain from store _A_ to store _B_ to store _C_.

The following diagram shows the behavior of WAL writes during a disk stall with and without WAL failover enabled.

<img src="{{ 'images/{{ page.version.version }}/wal-failover-behavior.png' | relative_url }}" alt="how long WAL writes take during a disk stall with and without WAL failover enabled"  style="border:1px solid #eee;max-width:100%" />

## FAQs

### 1. What are the benefits of WAL failover?

WAL failover provides the following benefits:

- Improves resiliency against transient [disk stalls]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#disk-stalls).
- Minimizes the impact of disk stalls on write latency. Bounds [Raft log]({% link {{ page.version.version }}/architecture/replication-layer.md %}#raft) latencies to about `100ms` in the event of a stall, which helps reduce the stall's impact on query tail latencies.

### 2. For single-data store clusters, what should be the size of an additional side disk for WAL failover?

The side disk should have the following properties:

{% include {{ page.version.version }}/wal-failover-side-disk.md %}

### 3. Where should WAL failover be enabled?

WAL failover should be enabled for any cloud deployments on AWS, GCP, or Azure.

It's also a good practice in on-premise deployments; however, it is at the discretion of the DBA or cluster administrator.

### 4. What is the best practice `storage.max_sync_duration`?

If you **are using** WAL failover, it provides a mitigation for shorter disk stalls, and setting the [`storage.max_sync_duration`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-storage-max-sync-duration) cluster setting (or the [`COCKROACH_ENGINE_MAX_SYNC_DURATION_DEFAULT`](#important-environment-variables) environment variable) to a lower setting will do more harm than good. Therefore, it is recommended to set it to `40s` for handling disk stalls that don't abate in a reasonable time.

If you **are not using** WAL failover, you will want to configure the [`storage.max_sync_duration`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-storage-max-sync-duration) cluster setting (or the [`COCKROACH_ENGINE_MAX_SYNC_DURATION_DEFAULT`](#important-environment-variables) environment variable before startup) reasonably low so that it will crash the node if you experience a reasonably long stall. This will allow other nodes to take over the [leases]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-leaseholder) so the workload can continue.

### 5. What metric(s) indicate that WAL failover took place?

{% include {{ page.version.version }}/wal-failover-metrics.md %}

### 6. How can I disable WAL failover?

If you are restarting an entire cluster or just one node in a cluster:

- For a [multi-store cluster](#multi-store-config), pass `--wal-failover=disabled` to [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}#disable-wal-failover).
- For a [single-store cluster with a side disk](#single-store-config) for failover, pass `--wal-failover=disabled,prev_path={ path-to-failover-disk }` to [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}#disable-wal-failover).

If you want to disable WAL failover on a running cluster, set the value of the [`storage.wal_failover.unhealthy_op_threshold`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-storage-wal-failover-unhealthy-op-threshold) cluster setting to a value greater than the [`storage.max_sync_duration`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-storage-max-sync-duration) cluster setting as follows:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING storage.wal_failover.unhealthy_op_threshold = '${duration greater than storage.max_sync_duration}'
~~~

### 7. How can I enable WAL failover during runtime in a multi-store cluster?

To enable WAL failover at runtime on a [multi-store cluster](#multi-store-config), make sure to configure log buffering as described in [Enable WAL failover]({% link {{ page.version.version }}/cockroach-start.md %}#enable-wal-failover).

<a name="unhealthy-op-threshold"></a>

Next, make sure the value of the [`storage.wal_failover.unhealthy_op_threshold`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-storage-wal-failover-unhealthy-op-threshold) cluster setting is a duration less than the [`storage.max_sync_duration`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-storage-max-sync-duration) cluster setting:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING storage.wal_failover.unhealthy_op_threshold = '${value less than storage.max_sync_duration}'
~~~

The recommended value of the [`storage.wal_failover.unhealthy_op_threshold`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-storage-wal-failover-unhealthy-op-threshold) cluster setting is `100ms`.

### 8. Can I enable WAL failover during runtime for a single data store cluster?

Yes: If the side disk for WAL failover was configured before the cluster was started, set the [`storage.wal_failover.unhealthy_op_threshold`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-storage-wal-failover-unhealthy-op-threshold) cluster setting to a value less than the [`storage.max_sync_duration`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-storage-max-sync-duration) cluster setting to enable WAL failover.

No: If the side disk for WAL failover was **not** pre-configured before the cluster was started, changing the value of the [`storage.wal_failover.unhealthy_op_threshold`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-storage-wal-failover-unhealthy-op-threshold) cluster setting to something less than the [`storage.max_sync_duration`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-storage-max-sync-duration) cluster setting **will not have any effect, and when the disk stalls, WAL failover will not trigger**. In other words, you cannot enable WAL failover at runtime for a single-store cluster if you did not [pre-configure a side disk](#single-store-config).

The recommended default value of the [`storage.wal_failover.unhealthy_op_threshold`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-storage-wal-failover-unhealthy-op-threshold) cluster setting is `100ms`.

### 9. Can I change the log buffering on a node before enabling WAL failover?

Yes.

### 10. Can I change the value of the `storage.max_sync_duration` cluster setting at cluster runtime?

Yes. To change [`storage.max_sync_duration`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-storage-max-sync-duration), issue a statement like the following:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING storage.max_sync_duration = '${desired_duration}';
~~~

### 11. When will Cockroach revert to writing a store's WAL on it's primary storage device? What if the secondary storage device stalls?

CockroachDB will monitor the latencies of the primary storage device in the background. As soon as latencies return to acceptable levels, the store will begin writing to the primary device. If the secondary stalls while in use by WAL failover, WAL failover will be unable to limit tail latencies, and the user workload will experience latencies until either the primary or the secondary recovers.

### 12. If there are more than 2 stores, will the WAL failover cascade from store A to B to C?

Store _A_ will failover to store _B_, store _B_ will failover to store _C_, and store _C_ will failover to store _A_, but store A will never failover to store C.

However, the WAL failback operation will not cascade back until **all drives are available** - that is, if store _A_'s disk unstalls while store _B_ is still stalled, store _C_ will not failback to store _A_ until _B_ also becomes available again. In other words, _C_ must failback to _B_, which must then failback to _A_.

### 13. Can I use an ephemeral disk for the secondary storage device?

No, the secondary (failover) disk **must be durable and retain its data across VM or instance restarts**. Using an ephemeral volume (for example, the root volume of a cloud VM that is recreated on reboot) risks permanent data loss: if CockroachDB has failed over recent WAL entries to that disk and the disk is subsequently wiped, the node will start up with an incomplete [Raft log]({% link {{ page.version.version }}/architecture/replication-layer.md %}#raft) and will refuse to join the cluster. In this scenario the node must be treated as lost and replaced.

Always provision the failover disk with the same persistence guarantees as the primary store.

### 14. Can I relocate or rename the WAL directory?

No. When WAL failover is enabled, the WAL directory path is stored as an absolute path in the [store]({% link {{ page.version.version}}/cockroach-start.md %}#store)'s data. It is not treated as a relative path. As a result, it is not sufficient to stop CockroachDB, move or rename that directory, and restart with a different `--wal-failover` path.

Instead, to change the WAL directory path, you must first [disable WAL failover]({% link {{ page.version.version }}/cockroach-start.md %}#disable-wal-failover), [restart the node(s)]({% link {{ page.version.version }}/node-shutdown.md %}#stop-and-restart-a-node), and then [re-enable WAL failover with the new path]({% link {{ page.version.version }}/cockroach-start.md %}#enable-wal-failover). 

Using filesystem indirection such as symlinks or mount-point changes is not supported or tested by Cockroach Labs.

## Video demo: WAL failover

For a demo of WAL Failover in CockroachDB and what happens when you enable or disable it, play the following video:

{% include_cached youtube.html video_id="R-BuPePPU-k" %}

## See also

+ [Data Resilience]({% link {{ page.version.version }}/data-resilience.md %})
+ [`cockroach start` > WAL Failover]({% link {{ page.version.version }}/cockroach-start.md %}#write-ahead-log-wal-failover)
