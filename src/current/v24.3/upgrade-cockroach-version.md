---
title: Upgrade to CockroachDB v24.3
summary: Learn how to upgrade your CockroachDB cluster to v24.3.
toc: true
docs_area: manage
---

{% assign DEBUG = true %}

{% assign rd = site.data.versions | where_exp: "rd", "rd.major_version == page.version.version" | first %}

{% assign released = false %}
{% assign skippable = false %}
{% assign lts = false %}

{% if rd.release_date != "N/A" and rd.maint_supp_exp_date != "N/A" %}
    {% assign released = true %}
    {% if rd.asst_supp_exp_date == "N/A" %}
        {% assign skippable = true %}
    {% elsif rd.initial_lts_patch != "N/A" %}
        {% assign lts = true %}
    {% endif %}
{% endif %}

{% assign latest = site.data.releases | where_exp: "latest", "latest.major_version == page.version.version" | sort: "release_date" | last %}

{% capture major_version_numeric %}{{ page.version.version | remove_first: 'v' }}{% endcapture %}

{% assign upgrade_from = rd.upgrade_from | split: ";" | sort_natural %}
{% assign upgrade_from_numeric = upgrade_from | remove: 'v' %}
{% assign num_upgrade_from_versions = upgrade_from.size %}

{% if DEBUG == true %}
released: {{ released }}<br />
skippable: {{ skippable }}<br />
lts: {{ lts }}<br />
latest: {{ latest }}<br /><br />
major_version_numeric: {{ major_version_numeric }}<br />
upgrade_from: {{ upgrade_from }}<br /><br />
upgrade_from_numeric: {{ upgrade_from_numeric }}<bkr /><br />
num_upgrade_from_versions: {{ num_upgrade_from_versions }}<br /><br />
{% endif %}

Because of CockroachDB's [multi-active availability]({% link {{ page.version.version }}/multi-active-availability.md %}) design, you can perform a "rolling upgrade" of your CockroachDB cluster. This means that you can upgrade nodes one at a time without interrupting the cluster's overall health and operations.

This page describes how to upgrade to the latest **{{ page.version.version }}** release, **{{ latest.release_name }}**
{% if released == false %}
, which is a testing release. Testing releases are intended for testing and experimentation only, and are not qualified for production environments or eligible for support or uptime SLA commitments. Refer to [Release Support Policy]({% link releases/release-support-policy.md %}).
{% else %}
    {% if lts == true %}&nbsp;([LTS]({% link releases/release-support-policy.md %}#support-types)).{% endif %}
{% endif %}

To upgrade CockroachDB on Kubernetes, refer to [single-cluster]({% link {{ page.version.version }}/upgrade-cockroachdb-kubernetes.md %}) or [multi-cluster]({% link {{ page.version.version }}/orchestrate-cockroachdb-with-kubernetes-multi-cluster.md %}#upgrade-the-cluster) instead.

## Step 1. Verify that you can upgrade

{{site.data.alerts.callout_info}}
A cluster cannot be upgraded from an alpha binary of a prior release or from a binary built from the `master` branch of the CockroachDB source code.
{{site.data.alerts.end}}

{% if released == false %}
CockroachDB {{ page.version.version }} is a testing release. Testing releases are intended for testing and experimentation only, and are not qualified for production environments or eligible for support or uptime SLA commitments. Refer to [Release Support Policy]({% link releases/release-support-policy.md %}).
{% else %}
  {% if skippable == true %}
CockroachDB {{ page.version.version }} is an optional [Innovation release]({% link releases/release-support-policy.md %}#innovation-releases). If you skip it, you must upgrade to the next [Regular release]({% link releases/release-support-policy.md %}#regular-releases) when it is available to maintain support.
  {% else %}
CockroachDB {{ page.version.version }}{% if lts == true %}&nbsp;([LTS]({% link releases/release-support-policy.md %}#support-types)).{% endif %} is a required [Regular release]({% link releases/release-support-policy.md %}#regular-releases).
  {% endif %}
{% endif %}

To upgrade to {{ page.version.version }}, you must be running either a previous patch in {{ page.version.version }} or a patch release in
{% if num_upgrade_from_versions > 1 %}
one of the following prior versions:
<ul>{% for version in upgrade_from %}<li markdown="1">[{{ version }}]({% link releases/{{ version }}.md %})</li>{% endfor %}</ul>
{% else %}[{{ upgrade_from }}]({% link {{ upgrade_from }}}).
{% endif %}

If you are running a version prior to {{ upgrade_from | first }}, you must [upgrade to {{ upgrade_from | first }}]({% link {{ upgrade_from | first }}/upgrade-cockroach-version.md %}) before beginning an upgrade to {{ page.version.version }}.

To check your cluster's version, run [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}) against any node in the cluster to open the SQL shell, then query the cluster's version:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CLUSTER SETTING version;
~~~

When you are ready to upgrade to {{ latest.release_name }}, continue to [step 2](#step-2-prepare-to-upgrade).

## Step 2. Prepare to upgrade

Before beginning an upgrade, review the [{{ page.version.version }} release notes]({% link releases/{{ page.version.version }}/.md %}), which describe new features, backward-incompatible changes, deprecated features, and key cluster setting changes.

If you are upgrading from a prior major version, complete the following steps.

### Check load balancing

Make sure your cluster is behind a [load balancer]({% link {{ page.version.version }}/recommended-production-settings.md %}#load-balancing), or your clients are configured to connect to multiple nodes. If your application communicates with a single node, your cluster will be unavailable during the upgrade and connections will fail.

### Check cluster health

Verify the overall health of your cluster using the [DB Console]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}):

- Under **Node Status**, make sure all nodes that should be live are listed as such. If any nodes are unexpectedly listed as `SUSPECT` or `DEAD`, identify why the nodes are offline and either restart them or [decommission](node-shutdown.html?filters=decommission#remove-nodes) them before beginning your upgrade. If there are `DEAD` and non-decommissioned nodes in your cluster, it will not be possible to finalize the upgrade (either automatically or manually).

- Under **Replication Status**, make sure there are `0` under-replicated and unavailable ranges. Otherwise, performing a rolling upgrade increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability. Therefore, it's important to identify and resolve the cause of range under-replication and/or unavailability before beginning your upgrade.

- In the **Node List**:
    - Make sure all nodes are on the same version. If any nodes are behind, upgrade them to the cluster's current version first, and then start this process over.

- In the **Metrics** dashboards:
    - Make sure [CPU]({% link {{ page.version.version }}/common-issues-to-monitor.md %}#cpu-usage), [memory]({% link {{ page.version.version }}/common-issues-to-monitor.md %}#database-memory-usage), and [storage]({% link {{ page.version.version }}/common-issues-to-monitor.md %}#storage-capacity) capacity are within acceptable values for each node. Nodes must be able to tolerate some increase in case the new version uses more resources for your workload. If any of these metrics is above healthy limits, consider [adding nodes]({% link {{ page.version.version }}/cockroach-start.md %}) to your cluster before beginning your upgrade.

### Check decommissioned nodes

If your cluster contains partially-decommissioned nodes, they will block a major-version upgrade attempt. It's a good idea to check for partially-decommissioned nodes even before a patch upgrade, to help prevent problems with a future major-version upgrade.

1. To check the status of decommissioned nodes, run  the [`cockroach node status --decommission`]({% link {{ page.version.version }}/cockroach-node.md %}#show-the-status-of-all-nodes) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach node status --decommission
    ~~~

    In the output, verify that the value of the `membership` field of each node is `decommissioned`. If any node's `membership` value is `decommissioning`, that node is not fully decommissioned.

1. If any node is not fully decommissioned, try the following:

    1. First, reissue the [decommission command](node-shutdown.html?filters=decommission#decommission-the-node). The second command typically succeeds within a few minutes.
    1. If the second decommission command does not succeed, [recommission](node-shutdown.html?filters=decommission#recommission-nodes) and then decommission it again. Before continuing the upgrade, the node must be marked as `decommissioned`.

### Review breaking changes

Skip this step if you are upgrading from a patch within {{ page.version.version }}.

Review the [backward-incompatible changes]({% link releases/{{ page.version.version }}.md %}{% unless rd.release_date == "N/A" or rd.release_date > today %}#{{ page.version.version | replace: ".", "-" }}-0-backward-incompatible-changes{% endunless %}), [deprecated features]({% link releases/{{ page.version.version }}.md %}#{% unless rd.release_date == "N/A" or rd.release_date > today %}{{ page.version.version | replace: ".", "-" }}-0-deprecations{% endunless %}), and [key cluster setting changes]({% link releases/{{ page.version.version }}.md %}#{% unless rd.release_date == "N/A" or rd.release_date > today %}{{ page.version.version | replace: ".", "-" }}-0-cluster-settings{% endunless %}) in {{ page.version.version }}. If necessary, make adjustments to your cluster's settings or workloads before starting a major-version rolling upgrade to {{ page.version.version }}.

### Back up cluster

{% include {{page.version.version}}/backups/recommend-backups-for-upgrade.md %}

See our [support policy for restoring backups across versions]({% link {{ page.version.version }}/restoring-backups-across-versions.md %}#support-for-restoring-backups-into-a-newer-version).

## Step 3. Decide how a major-version upgrade will be finalized

Skip this step if you are upgrading from a patch within {{ page.version.version }}.

By default, after all nodes are upgraded to {{ page.version.version }} from a prior major version, the upgrade process will be **auto-finalized**. After the upgrade is finalized, it will no longer be possible to [roll back to the previous major version](#step-5-roll-back-the-upgrade-optional). Certain features and performance improvements introduced in {{ page.version.version }} may not be available until the upgrade to {{ page.version.version }} is finalized. If applicable, these features are listed in [Features that require upgrade finalization](#features-that-require-upgrade-finalization). Finalization is always required to finish a major-version upgrade.

 To disable auto-finalization and preserve the ability to roll back to the cluster's previous version, **we recommend disabling auto-finalization** so you can monitor the stability and performance of the upgraded cluster before finalizing the upgrade. To disable auto-finalization, carefully follow all of these steps, then manually finalize the cluster upgrade to {{ page.version.version }} by following the instructions in [step 6. Finish the upgrade](#step-6-finish-the-upgrade). The upgrade is not complete until it is finalized, and the cluster will continue to report that it is on the current version.

1. Start the [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}) shell against any node in the cluster.

1. Set the `cluster.preserve_downgrade_option` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to your cluster's current version, which you found in [Step 1. Verify that you can upgrade](#step-1-verify-that-you-can-upgrade). Replace `{current_version}` with your cluster's current major version, omitting the leading `v`.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING cluster.preserve_downgrade_option = '{current_version}';
    ~~~

    For example:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING cluster.preserve_downgrade_option = '{{ upgrade_from_numeric | first }}';
    ~~~

    Attempting to set the `preserve_downgrade_option` setting to any value other than the cluster's current version will result in an error.

### Features that require upgrade finalization

When upgrading from one major version to another, certain features and performance improvements will be enabled only after finalizing the upgrade.

{{site.data.alerts.callout_info}}
Finalization is always required to complete a major-version upgrade.
{{site.data.alerts.end}}

{% if released == true %}
For more details about a given feature, refer to the [CockroachDB {{ page.version.version}}.0 release notes]({% link releases/{{ page.version.version }}.md %}#{{ page.version.version | replace: '.','-' }}).
{% endif %}

## Step 4. Perform the rolling upgrade

{{site.data.alerts.callout_success}}
Cockroach Labs recommends creating scripts to perform these steps instead of performing them manually.
{{site.data.alerts.end}}

Follow these steps on one node at a time to perform a rolling upgrade to {{ page.version.version }} or to upgrade from one {{ page.version.version }} patch to another. To upgrade CockroachDB on Kubernetes, refer to [single-cluster]({% link {{ page.version.version }}/upgrade-cockroachdb-kubernetes.md %}) or [multi-cluster]({% link {{ page.version.version }}/orchestrate-cockroachdb-with-kubernetes-multi-cluster.md %}#upgrade-the-cluster) instead.

Be sure to upgrade only one node at a time, and wait at least one minute after a node rejoins the cluster to upgrade the next node. Simultaneously upgrading more than one node increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability.

{{site.data.alerts.callout_danger}}
After beginning a major-version upgrade, Cockroach Labs recommends upgrading all nodes as quickly as possible. In a cluster with nodes running different major versions of CockroachDB, a query that is sent to an upgraded node can be distributed only among other upgraded nodes. Data accesses that would otherwise be local may become remote, and the performance of these queries can suffer.
{{site.data.alerts.end}}

These steps perform an upgrade to the latest {{ page.version.version }} release, **{{ latest.release_name }}**.

1. [Drain and shut down the node]({% link {{ page.version.version }}/node-shutdown.md %}#perform-node-shutdown).

1. Visit [What's New in {{ page.version.version }}?]({% link releases/{{ page.version.version }}.md %}) and download the **CockroachDB {{ latest.release_name }} full binary** for your architecture.

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

1. If a cluster has corrupt descriptors, a major-version upgrade cannot be finalized. Automatic descriptor repair is enabled by default in {{ page.version.version }}. After restarting each cluster node on {{ page.version.version }}, monitor the [cluster logs]({% link {{ page.version.version }}/logging.md %}) for errors. If a descriptor cannot be repaired automatically, [contact support](https://support.cockroachlabs.com/hc) for assistance completing the upgrade. To disable automatic descriptor repair (not generally recommended), set the environment variable `COCKROACH_RUN_FIRST_UPGRADE_PRECONDITION` to `false`.

1. Start the node so that it can rejoin the cluster.

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

1. Verify the node has rejoined the cluster through its output to [`stdout`]({% link {{ page.version.version }}/cockroach-start.md %}#standard-output) or through the [DB Console]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}#node-status).

1. If you use `cockroach` in your `$PATH`, you can remove the previous binary:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    rm /usr/local/bin/cockroach_old
    ~~~

    If you leave versioned binaries on your servers, you do not need to do anything.

1. After the node has rejoined the cluster, ensure that the node is ready to accept a SQL connection.

    Unless there are tens of thousands of ranges on the node, it's usually sufficient to wait one minute. To be certain that the node is ready, run the following command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql -e 'select 1'
    ~~~

    The command will automatically wait to complete until the node is ready.

1. Repeat these steps for each node.

## Step 5. Roll back an upgrade (optional)

If you decide to roll back after attempting a major-version upgrade, you must do so before the upgrade has been [finalized](#step-6-finish-the-upgrade), as described in the next section. It is always possible to roll back to a previous patch within {{ page.version.version }}.

To roll back an upgrade, do the following on each cluster node:

1. [Perform a rolling upgrade](#step-4-perform-the-rolling-upgrade), as described in the previous section, but replace the upgraded `cockroach` binary on each node with the binary for the previous version.
1. Restart the `cockroach` process on the node and verify that it has rejoined the cluster before rolling back the upgrade on the next node.
1. After all nodes have been rolled back and rejoined the cluster, [finalize the rollback](#step-6-finish-the-upgrade) in the same way as you would finalize an upgrade, as described in the next section.

## Step 6. Finish the upgrade

Skip this step if you are upgrading from a patch within {{ page.version.version }}.

Before finalizing a major-version upgrade, Cockroach Labs recommends that you monitor the stability and performance of your cluster with the upgraded binary for at least a day before deciding to finalize the upgrade.

1. If you disabled auto-finalization in [step 3](#step-3-decide-how-the-upgrade-will-be-finalized), monitor the stability and performance of your cluster for at least a day. If you decide to roll back the upgrade, repeat the [rolling restart procedure](#step-4-perform-the-rolling-upgrade) with the previous binary. Otherwise, perform the following steps to re-enable upgrade finalization to complete the upgrade to {{ page.version.version }}. Cockroach Labs recommends that you either finalize or roll back a major-version upgrade within a relative short period of time; running in a partially-upgraded state is not recommended.

    {{site.data.alerts.callout_danger}}
    A cluster that is not finalized after a major-version upgrade cannot be upgraded to a newer major version until the prior upgrade is finalized.
    {{site.data.alerts.end}}

1. Once you are satisfied with the new version, run [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}) against any node in the cluster to open the SQL shell, then reset the `preserve_downgrade_option` cluster setting:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > RESET CLUSTER SETTING cluster.preserve_downgrade_option;
    ~~~

    A series of migration jobs runs to enable certain types of features and changes in the new major version that cannot be rolled back. These include changes to system schemas, indexes, and descriptors, and enabling certain types of improvements and new features. Until the upgrade is finalized, these features and functions will not be available and the command `SHOW CLUSTER SETTING version` will return the cluster's previous version rather than `{{ major_version_numeric }}`.

    You can monitor the process of the migration in the DB Console [Jobs page]({% link {{ page.version.version }}/ui-jobs-page.md %}). Migration jobs have names in the format `{{ major_version_numeric }}-{migration-id}`. If you are upgrading to a Regular release and skipping the intermittent Innovation release, migrations for the skipped version are run before the migrations for {{ page.version.version }} are run. If a migration job fails or stalls, Cockroach Labs can use the migration ID to help diagnose and troubleshoot the problem. Each major version has different migration jobs with different IDs.

    {{site.data.alerts.callout_info}}
    All [schema change]({% link {{ page.version.version }}/online-schema-changes.md %}) jobs must reach a terminal state before finalization can complete. Finalization can therefore take as long as the longest-running schema change. Otherwise, the amount of time required for finalization depends on the amount of data in the cluster, as the process runs various internal maintenance and migration tasks. During this time, the cluster will experience a small amount of additional load.
    {{site.data.alerts.end}}

    When all migration jobs have completed, the upgrade is complete.

1. To confirm that finalization has completed, check the cluster version:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW CLUSTER SETTING version;
    ~~~

    If the cluster does not return `{{ major_version_numeric }}`, finalization has not completed. If auto-finalization is enabled but finalization has not completed, check for the existence of [decommissioning nodes]({% link {{ page.version.version }}/node-shutdown.md %}?filters=decommission#status-change) where decommission has stalled. In most cases, issuing the `decommission` command again resolves the issue. If you have trouble upgrading, [contact Support](https://cockroachlabs.com/support/hc/).

{{site.data.alerts.callout_success}}
{% include {{page.version.version}}/storage/compaction-concurrency.md %}
{{site.data.alerts.end}}

## Troubleshooting

After a major-version upgrade has finalized (whether manually or automatically), it is no longer possible to roll back to the previous release. If you are experiencing problems, we recommend that you run the [`cockroach debug zip`]({% link {{ page.version.version }}/cockroach-debug-zip.md %}) command on any cluster node to capture your cluster's state, then [open a support request]({% link {{ page.version.version }}/support-resources.md %}) and share your debug zip.

In the event of catastrophic failure or corruption, it may be necessary to [restore]({% link {{ page.version.version }}/restore.md %}) from a backup to a new cluster running the prior version.

## See also

- [Release Support Policy]({% link releases/release-support-policy.md %})
- [View Node Details]({% link {{ page.version.version }}/cockroach-node.md %})
- [Collect Debug Information]({% link {{ page.version.version }}/cockroach-debug-zip.md %})
- [View Version Details]({% link {{ page.version.version }}/cockroach-version.md %})
- [Release notes for {{ page.version.version }}]({% link releases/{{page.version.version}}.md %})
