---
title: Upgrade to CockroachDB v23.1
summary: Learn how to upgrade your CockroachDB cluster to v23.1.
toc: true
docs_area: manage
---

{% assign previous_version = site.data.versions | where_exp: "previous_version", "previous_version.major_version == page.version.version" | map: "previous_version" | first %}
{% assign earliest = site.data.releases | where_exp: "earliest", "earliest.major_version == page.version.version" | sort: "release_date" | first %}
{% assign latest = site.data.releases | where_exp: "latest", "latest.major_version == page.version.version" | sort: "release_date" | last %}
{% assign prior = site.data.releases | where_exp: "prior", "prior.major_version == page.version.version" | sort: "release_date" | pop | last %}
{% assign previous_latest_prod = site.data.releases | where_exp: "previous_latest_prod", "previous_latest_prod.major_version == previous_version" | where: "release_type", "Production" | sort: "release_date" | last %}
{% assign actual_latest_prod = site.data.releases | where: "major_version", site.versions["stable"] | where: "release_type", "Production" | sort: "release_date" | last %}

Because of CockroachDB's [multi-active availability]({% link {{ page.version.version }}/multi-active-availability.md %}) design, you can perform a "rolling upgrade" of your CockroachDB cluster. This means that you can upgrade nodes one at a time without interrupting the cluster's overall health and operations.

This page describes how to upgrade to the latest **{{ page.version.version }}** release, **{{ latest.release_name }}**. To upgrade CockroachDB on Kubernetes, refer to [single-cluster]({% link {{ page.version.version }}/upgrade-cockroachdb-kubernetes.md %}) or [multi-cluster]({% link {{ page.version.version }}/orchestrate-cockroachdb-with-kubernetes-multi-cluster.md %}#upgrade-the-cluster) instead.

## Terminology

Before upgrading, review the CockroachDB [release](../releases/) terminology:

- A new *major release* is performed every 6 months. The major version number indicates the year of release followed by the release number, which will be either 1 or 2. For example, the latest major release is {{ actual_latest_prod.major_version }} (also written as {{ actual_latest_prod.major_version }}.0).
- Each [supported](https://www.cockroachlabs.com/docs/releases/release-support-policy) major release is maintained across *patch releases* that fix crashes, security issues, and data correctness issues. Each patch release increments the major version number with its corresponding patch number. For example, patch releases of {{ actual_latest_prod.major_version }} use the format {{ actual_latest_prod.major_version }}.x.
- All major and patch releases are suitable for production usage, and are therefore considered "production releases". For example, the latest production release is {{ actual_latest_prod.release_name }}.
- Prior to an upcoming major release, alpha and beta releases and release candidates are made available. These "testing releases" are not suitable for production usage. They are intended for users who need early access to a feature before it is available in a production release. These releases append the terms `alpha`, `beta`, or `rc` to the version number.

{{site.data.alerts.callout_info}}
There are no "minor releases" of CockroachDB.
{{site.data.alerts.end}}

## Step 1. Verify that you can upgrade

{{site.data.alerts.callout_danger}}
In CockroachDB v22.2.x and above, a cluster that is upgraded to an alpha binary of CockroachDB or a binary that was manually built from the `master` branch cannot subsequently be upgraded to a production release.
{{site.data.alerts.end}}

Run [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}) against any node in the cluster to open the SQL shell. Then check your current cluster version:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CLUSTER SETTING version;
~~~

To upgrade to {{ latest.release_name }}, you must be running{% if prior.release_name %} either{% endif %}:

{% if prior.release_name %}
- **Any earlier {{ page.version.version }} release:** {{ earliest.release_name }} to {{ prior.release_name }}.
{% endif %}
- **A {{ previous_version }} production release:** {{ previous_version }}.0 to {{ previous_latest_prod.release_name }}.

If you are running any other version, take the following steps **before** continuing on this page:

|                    Version                     |                                                                           Action(s) before upgrading to any {{ page.version.version }} release                                                                          |
|------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Pre-{{ page.version.version }} testing release | Upgrade to a corresponding production release; then upgrade through each subsequent major release, [ending with a {{ previous_version }} production release](https://www.cockroachlabs.com/docs/{{ previous_version }}/upgrade-cockroach-version). |
| Pre-{{ previous_version }} production release  | Upgrade through each subsequent major release, [ending with a {{ previous_version }} production release](https://www.cockroachlabs.com/docs/{{ previous_version }}/upgrade-cockroach-version).                                                     |
| {{ previous_version}} testing release          | [Upgrade to a {{ previous_version }} production release](https://www.cockroachlabs.com/docs/{{ previous_version }}/upgrade-cockroach-version).                                                                                                     |

When you are ready to upgrade to {{ latest.release_name }}, continue to [step 2](#step-2-prepare-to-upgrade).

## Step 2. Prepare to upgrade

Before starting the upgrade, complete the following steps.

### Review breaking changes

{% assign rd = site.data.versions | where_exp: "rd", "rd.major_version == page.version.version" | first %}

Review the [backward-incompatible changes](https://www.cockroachlabs.com/docs/releases/{{ page.version.version }}{% unless rd.release_date == "N/A" or rd.release_date > today %}#{{ page.version.version | replace: ".", "-" }}-0-backward-incompatible-changes{% endunless %}), [deprecated features](https://www.cockroachlabs.com/docs/releases/{{ page.version.version }}#{% unless rd.release_date == "N/A" or rd.release_date > today %}{{ page.version.version | replace: ".", "-" }}-0-deprecations{% endunless %}), and [key cluster setting changes](https://www.cockroachlabs.com/docs/releases/{{ page.version.version }}#{% unless rd.release_date == "N/A" or rd.release_date > today %}{{ page.version.version | replace: ".", "-" }}-0-cluster-settings{% endunless %}) in {{ page.version.version }}. If any affect your deployment, make the necessary changes before starting the rolling upgrade to {{ page.version.version }}.

### Check load balancing

Make sure your cluster is behind a [load balancer]({% link {{ page.version.version }}/recommended-production-settings.md %}#load-balancing), or your clients are configured to talk to multiple nodes. If your application communicates with a single node, stopping that node to upgrade its CockroachDB binary will cause your application to fail.

### Check cluster health

Verify the overall health of your cluster using the [DB Console]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}):

- Under **Node Status**, make sure all nodes that should be live are listed as such. If any nodes are unexpectedly listed as `SUSPECT` or `DEAD`, identify why the nodes are offline and either restart them or [decommission](node-shutdown.html?filters=decommission#remove-nodes) them before beginning your upgrade. If there are `DEAD` and non-decommissioned nodes in your cluster, it will not be possible to finalize the upgrade (either automatically or manually).

- Under **Replication Status**, make sure there are `0` under-replicated and unavailable ranges. Otherwise, performing a rolling upgrade increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability. Therefore, it's important to identify and resolve the cause of range under-replication and/or unavailability before beginning your upgrade.

- In the **Node List**:
    - Make sure all nodes are on the same version. If any nodes are behind, upgrade them to the cluster's current version first, and then start this process over.

- In the **Metrics** dashboards:
    - Make sure [CPU]({% link {{ page.version.version }}/common-issues-to-monitor.md %}#cpu-usage), [memory]({% link {{ page.version.version }}/common-issues-to-monitor.md %}#database-memory-usage), and [storage]({% link {{ page.version.version }}/common-issues-to-monitor.md %}#storage-capacity) capacity are within acceptable values for each node. Nodes must be able to tolerate some increase in case the new version uses more resources for your workload. If any of these metrics is above healthy limits, consider [adding nodes]({% link {{ page.version.version }}/cockroach-start.md %}) to your cluster before beginning your upgrade.

### Check decommissioned nodes

If your cluster contains partially-decommissioned nodes, they will block an upgrade attempt.

1. To check the status of decommissioned nodes, run  the [`cockroach node status --decommission`]({% link {{ page.version.version }}/cockroach-node.md %}#show-the-status-of-all-nodes) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach node status --decommission
    ~~~

    In the output, verify that the value of the `membership` field of each node is `decommissioned`. If any node's `membership` value is `decommissioning`, that node is not fully decommissioned.

1. If any node is not fully decommissioned, try the following:

    1. First, reissue the [decommission command](node-shutdown.html?filters=decommission#decommission-the-node). The second command typically succeeds within a few minutes.
    1. If the second decommission command does not succeed, [recommission](node-shutdown.html?filters=decommission#recommission-nodes) and then decommission it again. Before continuing the upgrade, the node must be marked as `decommissioned`.

### Back up cluster

{% include {{page.version.version}}/backups/recommend-backups-for-upgrade.md%}
See our [support policy for restoring backups across versions]({% link {{ page.version.version }}/restoring-backups-across-versions.md %}#support-for-restoring-backups-into-a-newer-version).

### Reset SQL statistics

Before upgrading to CockroachDB v23.1, it is recommended to reset the cluster's SQL statistics. Otherwise, it may take longer for the upgrade to complete on a cluster with large statement or transaction statistics tables. This is due to the addition of a new column and a new index to these tables. To reset SQL statistics, issue the following SQL command:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT crdb_internal.reset_sql_stats();
~~~

## Step 3. Decide how the upgrade will be finalized

{{site.data.alerts.callout_info}}
This step is relevant only when upgrading from {{ previous_version }}.x to {{ page.version.version }}. For upgrades within the {{ page.version.version }}.x series, skip this step.
{{site.data.alerts.end}}

By default, after all nodes are running the new version, the upgrade process will be **auto-finalized**. This will enable certain [features and performance improvements introduced in {{ page.version.version }}](#features-that-require-upgrade-finalization). However, it will no longer be possible to [roll back to {{ previous_version }}](#step-5-roll-back-the-upgrade-optional) if auto-finalization is enabled. In the event of a catastrophic failure or corruption, the only option will be to start a new cluster using the previous binary and then restore from one of the backups created prior to performing the upgrade. For this reason, **we recommend disabling auto-finalization** so you can monitor the stability and performance of the upgraded cluster before finalizing the upgrade, but note that you will need to follow all of the subsequent directions, including the manual finalization in [step 5](#step-6-finish-the-upgrade):

1. [Upgrade to {{ previous_version }}](https://www.cockroachlabs.com/docs/{{ previous_version }}/upgrade-cockroach-version), if you haven't already.

1. Start the [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}) shell against any node in the cluster.

1. Set the `cluster.preserve_downgrade_option` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING cluster.preserve_downgrade_option = '{{ previous_version | slice: 1, 4 }}';
    ~~~

    It is only possible to set this setting to the current cluster version.

### Features that require upgrade finalization

When upgrading from {{ previous_version }} to {{ page.version.version }}, certain features and performance improvements will be enabled only after finalizing the upgrade, including but not limited to:

- The [`CREATE SCHEDULE FOR CHANGEFEED`]({% link {{ page.version.version }}/create-schedule-for-changefeed.md %}) statement allows you to create scheduled changefeeds.
- The [`MODIFYSQLCLUSTERSETTING` and `VIEWJOB` system privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges).

For an expanded list of features included in the {{ page.version.version }} release, see the [{{ page.version.version }} release notes](https://www.cockroachlabs.com/docs/releases/{{ page.version.version }}).

## Step 4. Perform the rolling upgrade

{{site.data.alerts.callout_success}}
Cockroach Labs recommends creating scripts to perform these steps instead of performing them manually.
{{site.data.alerts.end}}

Follow these steps to perform the rolling upgrade. To upgrade CockroachDB on Kubernetes, refer to [single-cluster]({% link {{ page.version.version }}/upgrade-cockroachdb-kubernetes.md %}) or [multi-cluster]({% link {{ page.version.version }}/orchestrate-cockroachdb-with-kubernetes-multi-cluster.md %}#upgrade-the-cluster) instead.

For each node in your cluster, complete the following steps. Be sure to upgrade only one node at a time, and wait at least one minute after a node rejoins the cluster to upgrade the next node. Simultaneously upgrading more than one node increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability.

{{site.data.alerts.callout_danger}}
After beginning a major-version upgrade, Cockroach Labs recommends upgrading all nodes as quickly as possible. In a cluster with nodes running different major versions of CockroachDB, a query that is sent to an upgraded node can be distributed only among other upgraded nodes. Data accesses that would otherwise be local may become remote, and the performance of these queries can suffer.
{{site.data.alerts.end}}

These steps perform an upgrade to the latest {{ page.version.version }} release, **{{ latest.release_name }}**.

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>

1. [Drain and shut down the node]({% link {{ page.version.version }}/node-shutdown.md %}#perform-node-shutdown).

1. Visit [What's New in {{ page.version.version }}?](https://www.cockroachlabs.com/docs/releases/{{ page.version.version }}) and download the **CockroachDB {{ latest.release_name }} full binary** for your architecture.

1. Extract the archive. In the following instructions, replace `{COCKROACHDB_DIR}` with the path to the extracted archive directory.

1. If you have a previous version of the `cockroach` binary in your `$PATH`, rename the outdated `cockroach` binary, and then move the new one into its place.

    If you get a permission error because the `cockroach` binary is located in a system directory, add `sudo` before each command. The binary will be owned by the effective user, which is `root` if you use `sudo`.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    i="$(which cockroach)"; mv "$i" "$i"_old
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cp -i {COCKROACHDB_DIR}/cockroach /usr/local/bin/cockroach
    ~~~

1. If a cluster has corrupt descriptors, a major-version upgrade cannot be finalized. In CockroachDB v23.1.6 and subsequent 23.1 versions, automatic descriptor repair is enabled and cannot be disabled. In CockroachDB v23.1.11 and above, automatic descriptor repair is available but disabled by default. To enable it in these versions, set the environment variable `COCKROACH_RUN_FIRST_UPGRADE_PRECONDITION` to `true` after installing the v23.1 binary but before restarting the `cockroach` process on the node. Monitor the [cluster logs](https://www.cockroachlabs.com/docs/{{ page.version.version }}/logging) for errors. If a descriptor cannot be repaired automatically, [contact support](https://support.cockroachlabs.com/hc) for assistance completing the upgrade.

1. Start the node so that it can rejoin the cluster.

    <div class="filter-content" markdown="1" data-scope="linux">

    Without a process manager like `systemd`, re-run the [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) command that you used to start the node initially, for example:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach start \
        --certs-dir=certs \
        --advertise-addr={node address} \
        --join={node1 address},{node2 address},{node3 address}
    ~~~

    If you are using `systemd` as the process manager, run this command to start the node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    systemctl start {systemd config filename}
    ~~~

    </div>

    <div class="filter-content" markdown="1" data-scope="mac">

    Re-run the [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) command that you used to start the node initially, for example:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach start \
        --certs-dir=certs \
        --advertise-addr={node address} \
        --join={node1 address},{node2 address},{node3 address}
    ~~~

    </div>

1. Verify the node has rejoined the cluster through its output to [`stdout`]({% link {{ page.version.version }}/cockroach-start.md %}#standard-output) or through the [DB Console]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}#node-status).

1. If you use `cockroach` in your `$PATH`, you can remove the previous binary:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    rm /usr/local/bin/cockroach_old
    ~~~

    <div class="filter-content" markdown="1" data-scope="linux">

    If you leave versioned binaries on your servers, you do not need to do anything.

    </div>

1. After the node has rejoined the cluster, ensure that the node is ready to accept a SQL connection.

    Unless there are tens of thousands of ranges on the node, it's usually sufficient to wait one minute. To be certain that the node is ready, run the following command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql -e 'select 1'
    ~~~

    The command will automatically wait to complete until the node is ready.

1. Repeat these steps for the next node.

## Step 5. Roll back the upgrade (optional)

If you decide to roll back to {{previous_version}}, you must do so before the upgrade has been [finalized](#step-6-finish-the-upgrade), as described in the next section. It is always possible to roll back to a previous {{ page.version.version }} version.

To roll back an upgrade, do the following on each cluster node:

1. [Perform a rolling upgrade](#step-4-perform-the-rolling-upgrade), as described in the previous section, but replace the upgraded `cockroach` binary on each node with the binary for the previous version.
1. Restart the `cockroach` process on the node and verify that it has rejoined the cluster before rolling back the upgrade on the next node.
1. After all nodes have been rolled back and rejoined the cluster, [finalize the rollback](#step-6-finish-the-upgrade) in the same way as you would finalize an upgrade, as described in the next section.

## Step 6. Finish the upgrade

{{site.data.alerts.callout_info}}
This step is relevant only when upgrading from {{ previous_version }}.x to {{ page.version.version }}. For upgrades within the {{ page.version.version }}.x series, skip this step.
{{site.data.alerts.end}}

If you disabled auto-finalization in [step 3](#step-3-decide-how-the-upgrade-will-be-finalized), monitor the stability and performance of your cluster for as long as you require to feel comfortable with the upgrade (generally at least a day). If during this time you decide to roll back the upgrade, repeat the rolling restart procedure with the previous binary.

Once you are satisfied with the new version:

1. Run [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}) against any node in the cluster to open the SQL shell.

1. Re-enable auto-finalization:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > RESET CLUSTER SETTING cluster.preserve_downgrade_option;
    ~~~

    {{site.data.alerts.callout_info}}
    All [schema change]({% link {{ page.version.version }}/online-schema-changes.md %}) jobs must reach a terminal state before finalization can complete. Finalization can therefore take as long as the longest-running schema change. Otherwise, the amount of time required for finalization depends on the amount of data in the cluster, as it kicks off various internal maintenance and migration tasks. During this time, the cluster will experience a small amount of additional load.
    {{site.data.alerts.end}}

1. Check the cluster version to confirm that the finalize step has completed:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW CLUSTER SETTING version;
    ~~~

    When the upgrade has been finalized, the cluster will report that it is on the new version. If the cluster continues to report that it is on the previous version, finalization has not completed. When finalization is in progress but has not yet finished, the output still shows the previous major version, but may include additional details about the finalization progress. If auto-finalization is enabled but finalization has not completed, check for the existence of [decommissioning nodes](https://www.cockroachlabs.com/docs/v23.1/node-shutdown?filters=decommission#status-change) where decommission has not finished. If you have trouble upgrading, [contact Support](https://cockroachlabs.com/support/hc/).

After the upgrade to {{ page.version.version }} is finalized, you may notice an increase in compaction activity due to a background migration within the storage engine. To observe the migration's progress, check the **Compactions** section of the [Storage Dashboard]({% link {{ page.version.version }}/ui-storage-dashboard.md %}) in the DB Console or monitor the `storage.marked-for-compaction-files` time-series metric. When the metric's value nears or reaches `0`, the migration is complete and compaction activity will return to normal levels.

## Troubleshooting

After the upgrade has finalized (whether manually or automatically), it is no longer possible to downgrade to the previous release. If you are experiencing problems, we therefore recommend that you:

1. Run the [`cockroach debug zip`]({% link {{ page.version.version }}/cockroach-debug-zip.md %}) command against any node in the cluster to capture your cluster's state.

1. [Reach out for support]({% link {{ page.version.version }}/support-resources.md %}) from Cockroach Labs, sharing your debug zip.

In the event of catastrophic failure or corruption, the only option will be to start a new cluster using the previous binary and then restore from one of the backups created prior to performing the upgrade.

## See also

- [Release Support Policy](https://www.cockroachlabs.com/docs/releases/release-support-policy)
- [View Node Details]({% link {{ page.version.version }}/cockroach-node.md %})
- [Collect Debug Information]({% link {{ page.version.version }}/cockroach-debug-zip.md %})
- [View Version Details]({% link {{ page.version.version }}/cockroach-version.md %})
- [Release notes for our latest version](https://www.cockroachlabs.com/docs/releases/{{page.version.version}})
