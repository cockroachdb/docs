---
title: Upgrade to CockroachDB v21.1
summary: Learn how to upgrade your CockroachDB cluster to v21.1.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
---

{% assign previous_version = site.data.versions | where_exp: "previous_version", "previous_version.major_version == page.version.version" | map: "previous_version" | first %}
{% assign earliest = site.data.releases | where_exp: "earliest", "earliest.major_version == page.version.version" | sort: "release_date" | first %}
{% assign latest = site.data.releases | where_exp: "latest", "latest.major_version == page.version.version" | sort: "release_date" | last %}
{% assign prior = site.data.releases | where_exp: "prior", "prior.major_version == page.version.version" | sort: "release_date" | pop | last %}
{% assign previous_latest_prod = site.data.releases | where_exp: "previous_latest_prod", "previous_latest_prod.major_version == previous_version" | where: "release_type", "Production" | sort: "release_date" | last %}
{% assign actual_latest_prod = site.data.releases | where: "release_type", "Production" | sort: "release_date" | last %}

Because of CockroachDB's [multi-active availability](multi-active-availability.html) design, you can perform a "rolling upgrade" of your CockroachDB cluster. This means that you can upgrade nodes one at a time without interrupting the cluster's overall health and operations.

This page describes how to upgrade to the latest **{{ page.version.version }}** release, **{{ latest.version }}**.

## Terminology

Before upgrading, review the CockroachDB [release](../releases/) terminology:

- A new *major release* is performed every 6 months. The major version number indicates the year of release followed by the release number, which will be either 1 or 2. For example, the latest major release is {{ actual_latest_prod.major_version }} (also written as {{ actual_latest_prod.major_version }}.0).
- Each [supported](../releases/release-support-policy.html) major release is maintained across *patch releases* that fix crashes, security issues, and data correctness issues. Each patch release increments the major version number with its corresponding patch number. For example, patch releases of {{ actual_latest_prod.major_version }} use the format {{ actual_latest_prod.major_version }}.x.
- All major and patch releases are suitable for production usage, and are therefore considered "production releases". For example, the latest production release is {{ actual_latest_prod.version }}.
- Prior to an upcoming major release, alpha and beta releases and release candidates are made available. These "testing releases" are not suitable for production usage. They are intended for users who need early access to a feature before it is available in a production release. These releases append the terms `alpha`, `beta`, or `rc` to the version number.

{{site.data.alerts.callout_info}}
There are no "minor releases" of CockroachDB.
{{site.data.alerts.end}}

## Step 1. Verify that you can upgrade

Run [`cockroach sql`](cockroach-sql.html) against any node in the cluster to open the SQL shell. Then check your current cluster version:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CLUSTER SETTING version;
~~~

{{site.data.alerts.callout_info}}
**Before upgrading from v20.2 to v21.1**, you must ensure that any previously decommissioned nodes are fully decommissioned. Otherwise, they will block the upgrade. For instructions, see [Check decommissioned nodes](#check-decommissioned-nodes).
{{site.data.alerts.end}}

To upgrade to {{ latest.version }}, you must be running{% if prior.version %} either{% endif %}:

{% if prior.version %}
- **Any earlier {{ page.version.version }} release:** {{ earliest.version }} to {{ prior.version }}.
{% endif %}
- **A {{ previous_version }} production release:** {{ previous_version }}.0 to {{ previous_latest_prod.version }}.

If you are running any other version, take the following steps **before** continuing on this page:

|                    Version                     |                                                                           Action(s) before upgrading to any {{ page.version.version }} release                                                                          |
|------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Pre-{{ page.version.version }} testing release | Upgrade to a corresponding production release; then upgrade through each subsequent major release, [ending with a {{ previous_version }} production release](../{{ previous_version }}/upgrade-cockroach-version.html). |
| Pre-{{ previous_version }} production release  | Upgrade through each subsequent major release, [ending with a {{ previous_version }} production release](../{{ previous_version }}/upgrade-cockroach-version.html).                                                     |
| {{ previous_version}} testing release          | [Upgrade to a {{ previous_version }} production release](../{{ previous_version }}/upgrade-cockroach-version.html).                                                                                                     |

When you are ready to upgrade to {{ latest.version }}, continue to [step 2](#step-2-prepare-to-upgrade).

## Step 2. Prepare to upgrade

Before starting the upgrade, complete the following steps.

### Check load balancing

Make sure your cluster is behind a [load balancer](recommended-production-settings.html#load-balancing), or your clients are configured to talk to multiple nodes. If your application communicates with a single node, stopping that node to upgrade its CockroachDB binary will cause your application to fail.

### Check cluster health

Verify the overall health of your cluster using the [DB Console](ui-overview.html). On the **Overview**:

- Under **Node Status**, make sure all nodes that should be live are listed as such. If any nodes are unexpectedly listed as suspect or dead, identify why the nodes are offline and either restart them or [decommission](remove-nodes.html) them before beginning your upgrade. If there are dead and non-decommissioned nodes in your cluster, it will not be possible to finalize the upgrade (either automatically or manually).

- Under **Replication Status**, make sure there are 0 under-replicated and unavailable ranges. Otherwise, performing a rolling upgrade increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability. Therefore, it's important to identify and resolve the cause of range under-replication and/or unavailability before beginning your upgrade.

- In the **Node List**:
    - Make sure all nodes are on the same version. If any nodes are behind, upgrade them to the cluster's current version first, and then start this process over.
    - Make sure capacity and memory usage are reasonable for each node. Nodes must be able to tolerate some increase in case the new version uses more resources for your workload. Also go to **Metrics > Dashboard: Hardware** and make sure CPU percent is reasonable across the cluster. If there's not enough headroom on any of these metrics, consider [adding nodes](cockroach-start.html) to your cluster before beginning your upgrade.

### Check decommissioned nodes

Check the `membership` field in the [output of `cockroach node status --decommission`](cockroach-node.html). Nodes with `decommissioned` membership are fully decommissioned, while nodes with `decommissioning` membership have not completed the process. If there are `decommissioning` nodes in your cluster, this will block the upgrade.

**Before upgrading from v20.2 to v21.1**, you must manually change the status of any `decommissioning` nodes to `decommissioned`. To do this, [run `cockroach node decommission`](remove-nodes.html#step-2-start-the-decommissioning-process-on-the-nodes) on these nodes and confirm that they update to `decommissioned`.

In case a decommissioning process is hung, [recommission](remove-nodes.html#recommission-nodes) and then [decommission those nodes](remove-nodes.html#remove-multiple-nodes) again, and confirm that they update to `decommissioned`.

### Review breaking changes

Review the [backward-incompatible changes in v21.1](../releases/v21.1.html#v21-1-0-backward-incompatible-changes) and [deprecated features](../releases/v21.1.html#v21-1-0-deprecations). If any affect your deployment, make the necessary changes before starting the rolling upgrade to v21.1.

Two changes that are particularly important to note:

- As of v21.1, CockroachDB always uses the [Pebble storage engine](https://github.com/cockroachdb/pebble). As such, `pebble` is the default and only option for the `--storage-engine` flag on the `cockroach start` command. RocksDB can no longer be used as the storage engine.
    - If your cluster currently uses RocksDB as the storage engine, before you upgrade to v21.1, restart each of your nodes, removing `--storage-engine=rocksdb` from the `cockroach start` command. You can follow the same rolling process described in [step 4](#step-4-perform-the-rolling-upgrade) below, but do not change the binary; just remove the `--storage-engine=rocksdb` flag and restart.

- [Interleaving data](interleave-in-parent.html) was deprecated in v20.2, disabled by default in v21.1, and removed from CockroachDB in v21.2. For migration steps, see the [interleave deprecation](interleave-in-parent.html#deprecation) notice.
    - If your cluster includes interleaved data and you perform backups, first make sure you are running [v20.2.10+](../v20.2/upgrade-cockroach-version.html); then update your `BACKUP` commands to use the [`INCLUDE_DEPRECATED_INTERLEAVES` option](backup.html#include-deprecated-interleaves); and only then return to this page and upgrade to v21.1. Note that the `INCLUDE_DEPRECATED_INTERLEAVES` option is a no-op in v20.2.10, but this sequence is the only way to prevent backups including interleaved data from failing on v21.1.

## Step 3. Decide how the upgrade will be finalized

{{site.data.alerts.callout_info}}
This step is relevant only when upgrading from v20.2.x to v21.1. For upgrades within the v21.1.x series, skip this step.
{{site.data.alerts.end}}

By default, after all nodes are running the new version, the upgrade process will be **auto-finalized**. This will enable certain [features and performance improvements introduced in v21.1](#features-that-require-upgrade-finalization). However, it will no longer be possible to perform a downgrade to v20.2. In the event of a catastrophic failure or corruption, the only option will be to start a new cluster using the old binary and then restore from one of the backups created prior to performing the upgrade. For this reason, **we recommend disabling auto-finalization** so you can monitor the stability and performance of the upgraded cluster before finalizing the upgrade, but note that you will need to follow all of the subsequent directions, including the manual finalization in [step 5](#step-5-finish-the-upgrade):

1. [Upgrade to v20.2](../v20.2/upgrade-cockroach-version.html), if you haven't already.

2. Start the [`cockroach sql`](cockroach-sql.html) shell against any node in the cluster.

3. Set the `cluster.preserve_downgrade_option` [cluster setting](cluster-settings.html):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING cluster.preserve_downgrade_option = '20.2';
    ~~~

    It is only possible to set this setting to the current cluster version.

### Features that require upgrade finalization

When upgrading from v20.2 to v21.1, certain features and performance improvements will be enabled only after finalizing the upgrade, including but not limited to:

- **Improved multi-region features:** After finalization, it will be possible to use new and improved [multi-region features](multiregion-overview.html), such as the ability to set database regions, survival goals, and table localities. Internal capabilities supporting these features, such as [non-voting replicas](architecture/replication-layer.html#non-voting-replicas) and [non-blocking transactions](architecture/transaction-layer.html#non-blocking-transactions), will be available after finalization as well.

- **Empty arrays in GIN indexes:** After finalization, newly created [GIN indexes](inverted-indexes.html) will contain rows containing empty arrays in [`ARRAY`](array.html) columns, which allows the indexes to be used for more queries. Note, however, that rows containing `NULL` values in an indexed column will still not be included in GIN indexes.

- **Virtual computed columns:** After finalization, it will be possible to use the `VIRTUAL` keyword to define [virtual computed columns](computed-columns.html).

- **Changefeed support for primary key changes:** After finalization, [changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html) will detect primary key changes.

## Step 4. Perform the rolling upgrade

For each node in your cluster, complete the following steps. Be sure to upgrade only one node at a time, and wait at least one minute after a node rejoins the cluster to upgrade the next node. Simultaneously upgrading more than one node increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability.

{{site.data.alerts.callout_success}}
We recommend creating scripts to perform these steps instead of performing them manually. Also, if you are running CockroachDB on Kubernetes, see our documentation on [single-cluster](operate-cockroachdb-kubernetes.html#upgrade-the-cluster) and/or [multi-cluster](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html#upgrade-the-cluster) orchestrated deployments for upgrade guidance instead.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
These steps perform an upgrade to the latest {{ page.version.version }} release, **{{ latest.version}}**.
{{site.data.alerts.end}}

1. Drain and stop the node using one of the following methods:

    {% include {{ page.version.version }}/prod-deployment/node-shutdown.md %}

    Verify that the process has stopped:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ps aux | grep cockroach
    ~~~

    Alternately, you can check the node's logs for the message `server drained and shutdown completed`.

1. Download and install the CockroachDB binary you want to use:

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>
    <p></p>

    <div class="filter-content" markdown="1" data-scope="mac">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{latest.version}}.darwin-10.9-amd64.tgz|tar -xzf -
    ~~~

    </div>

    <div class="filter-content" markdown="1" data-scope="linux">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{latest.version}}.linux-amd64.tgz|tar -xzf -
    ~~~

    </div>

1. If you use `cockroach` in your `$PATH`, rename the outdated `cockroach` binary, and then move the new one into its place:

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>
    <p></p>

    <div class="filter-content" markdown="1" data-scope="mac">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    i="$(which cockroach)"; mv "$i" "$i"_old
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{latest.version}}.darwin-10.9-amd64/cockroach /usr/local/bin/cockroach
    ~~~

    </div>

    <div class="filter-content" markdown="1" data-scope="linux">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    i="$(which cockroach)"; mv "$i" "$i"_old
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{latest.version}}.linux-amd64/cockroach /usr/local/bin/cockroach
    ~~~

    </div>

1. Start the node to have it rejoin the cluster.

    {{site.data.alerts.callout_danger}}
    For maximum availability, do not wait more than a few minutes before restarting the node with the new binary. See [this open issue](https://github.com/cockroachdb/cockroach/issues/37906) for context.
    {{site.data.alerts.end}}

    Without a process manager like `systemd`, re-run the [`cockroach start`](cockroach-start.html) command that you used to start the node initially, for example:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --advertise-addr=<node address> \
    --join=<node1 address>,<node2 address>,<node3 address>
    ~~~

    If you are using `systemd` as the process manager, run this command to start the node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ systemctl start <systemd config filename>
    ~~~

1. Verify the node has rejoined the cluster through its output to [`stdout`](cockroach-start.html#standard-output) or through the [DB Console](ui-cluster-overview-page.html#node-status).

1. If you use `cockroach` in your `$PATH`, you can remove the old binary:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm /usr/local/bin/cockroach_old
    ~~~

    If you leave versioned binaries on your servers, you do not need to do anything.

1. After the node has rejoined the cluster, ensure that the node is ready to accept a SQL connection.

    Unless there are tens of thousands of ranges on the node, it's usually sufficient to wait one minute. To be certain that the node is ready, run the following command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql -e 'select 1'
    ~~~

    The command will automatically wait to complete until the node is ready.

1. Repeat these steps for the next node.

## Step 5. Finish the upgrade

{{site.data.alerts.callout_info}}
This step is relevant only when upgrading from v20.2.x to v21.1. For upgrades within the v21.1.x series, skip this step.
{{site.data.alerts.end}}

If you disabled auto-finalization in [step 3](#step-3-decide-how-the-upgrade-will-be-finalized), monitor the stability and performance of your cluster for as long as you require to feel comfortable with the upgrade (generally at least a day). If during this time you decide to roll back the upgrade, repeat the rolling restart procedure with the old binary.

Once you are satisfied with the new version:

1. Start the [`cockroach sql`](cockroach-sql.html) shell against any node in the cluster.

2. Re-enable auto-finalization:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > RESET CLUSTER SETTING cluster.preserve_downgrade_option;
    ~~~

    {{site.data.alerts.callout_info}}
    This statement can take up to a minute to complete, depending on the amount of data in the cluster, as it kicks off various internal maintenance and migration tasks. During this time, the cluster will experience a small amount of additional load.
    {{site.data.alerts.end}}

1. Check the cluster version to confirm that the finalize step has completed:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW CLUSTER SETTING version;
    ~~~

## Troubleshooting

After the upgrade has finalized (whether manually or automatically), it is no longer possible to downgrade to the previous release. If you are experiencing problems, we therefore recommend that you:

1. Run the [`cockroach debug zip`](cockroach-debug-zip.html) command against any node in the cluster to capture your cluster's state.

2. [Reach out for support](support-resources.html) from Cockroach Labs, sharing your debug zip.

In the event of catastrophic failure or corruption, the only option will be to start a new cluster using the old binary and then restore from one of the backups created prior to performing the upgrade.

## See also

- [View Node Details](cockroach-node.html)
- [Collect Debug Information](cockroach-debug-zip.html)
- [View Version Details](cockroach-version.html)
- [Release notes for our latest version](../releases/{{page.version.version}}.html)
