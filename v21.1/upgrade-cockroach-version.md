---
title: Upgrade to CockroachDB v21.1
summary: Learn how to upgrade your CockroachDB cluster to a new version.
toc: true
---

Because of CockroachDB's [multi-active availability](multi-active-availability.html) design, you can perform a "rolling upgrade" of your CockroachDB cluster. This means that you can upgrade nodes one at a time without interrupting the cluster's overall health and operations.

## Step 1. Verify that you can upgrade

To upgrade to a new version, you must first be on a [production release](../releases/#production-releases) of the previous version. The release does not need to be the **latest** production release of the previous version, but it must be a production release rather than a testing release (alpha/beta).

Therefore, if you are upgrading from v20.1 to v20.2, or from a testing release (alpha/beta) of v20.2 to v21.1:

1. First [upgrade to a production release of v20.2](../v20.2/upgrade-cockroach-version.html). Be sure to complete all the steps.

2. Then return to this page and perform a second rolling upgrade to v21.1.

If you are upgrading from any production release of v20.2, or from any earlier v21.1 release, you do not have to go through intermediate releases; continue to step 2.

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

### Review breaking changes

TBD

<!-- Review the [backward-incompatible changes in v20.2](../releases/v20.2.0.html#backward-incompatible-changes) and [deprecated features](../releases/v20.2.0.html#deprecations). If any affect your application, make the necessary changes. -->

### Check ongoing jobs

Make sure there are no [bulk imports](import.html) or [schema changes](online-schema-changes.html) in progress. These are complex operations that involve coordination across nodes and can increase the potential for unexpected behavior during an upgrade.

<!-- In addition, make sure there are fewer than 100 jobs of all types, including backups, in a non-terminal state (i.e., any state other than `succeeded`, `failed`, or `canceled`). Otherwise, v20.2 nodes will hang and never successfully start. Note that this will be fixed in a later v20.2 patch release. For more context, see [Known Limitations in CockroachDB v20.2](known-limitations.html#upgrading-to-v20-2-with-100-or-more-non-terminal-jobs). -->

To check for ongoing jobs, use [`SHOW JOBS`](show-jobs.html#show-schema-changes) or check the [**Jobs** page](ui-jobs-page.html) in the DB Console.

<!-- {{site.data.alerts.callout_danger}}
If there are any ongoing schema changes that were started when the cluster was running v19.2 or earlier and that have not reached a terminal state (`succeeded`, `failed`, or `canceled`) after the upgrade to v20.1, wait for them to finish running before upgrading to v20.2. Otherwise, they will be marked as `failed` during the upgrade to v20.2.

Also, schema changes that have not reached a terminal state due to bugs in prior versions will be marked as `failed` during the upgrade to v20.2.
{{site.data.alerts.end}} -->

## Step 3. Decide how the upgrade will be finalized

{{site.data.alerts.callout_info}}
This step is relevant only when upgrading from v20.2.x to v21.1. For upgrades within the v21.1.x series, skip this step.
{{site.data.alerts.end}}

By default, after all nodes are running the new version, the upgrade process will be **auto-finalized**. This will enable certain [features and performance improvements introduced in v21.1](#features-that-require-upgrade-finalization). However, it will no longer be possible to perform a downgrade to v20.1. In the event of a catastrophic failure or corruption, the only option will be to start a new cluster using the old binary and then restore from one of the backups created prior to performing the upgrade. For this reason, **we recommend disabling auto-finalization** so you can monitor the stability and performance of the upgraded cluster before finalizing the upgrade, but note that you will need to follow all of the subsequent directions, including the manual finalization in [step 5](#step-5-finish-the-upgrade):

1. [Upgrade to v20.2](../v20.2/upgrade-cockroach-version.html), if you haven't already.

2. Start the [`cockroach sql`](cockroach-sql.html) shell against any node in the cluster.

3. Set the `cluster.preserve_downgrade_option` [cluster setting](cluster-settings.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING cluster.preserve_downgrade_option = '20.2';
    ~~~

    It is only possible to set this setting to the current cluster version.

### Features that require upgrade finalization

When upgrading from v20.2 to v21.1, certain features and performance improvements will be enabled only after finalizing the upgrade, including but not limited to:

TBD

## Step 4. Perform the rolling upgrade

For each node in your cluster, complete the following steps. Be sure to upgrade only one node at a time, and wait at least one minute after a node rejoins the cluster to upgrade the next node. Simultaneously upgrading more than one node increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability.

{{site.data.alerts.callout_success}}
We recommend creating scripts to perform these steps instead of performing them manually. Also, if you are running CockroachDB on Kubernetes, see our documentation on [single-cluster](orchestrate-cockroachdb-with-kubernetes.html#upgrade-the-cluster) and/or [multi-cluster](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html#upgrade-the-cluster) orchestrated deployments for upgrade guidance instead.
{{site.data.alerts.end}}

1. Drain and stop the node using one of the following methods:

    {% include {{ page.version.version }}/prod-deployment/node-shutdown.md %}

    Verify that the process has stopped:

    {% include copy-clipboard.html %}
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
    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl -O https://binaries.cockroachdb.com/cockroach-{{page.release_info.version}}.darwin-10.9-amd64.tgz
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ tar xfz cockroach-{{page.release_info.version}}.darwin-10.9-amd64.tgz
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget https://binaries.cockroachdb.com/cockroach-{{page.release_info.version}}.linux-amd64.tgz
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ tar xfz cockroach-{{page.release_info.version}}.linux-amd64.tgz
    ~~~
    </div>

1. If you use `cockroach` in your `$PATH`, rename the outdated `cockroach` binary, and then move the new one into its place:

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>
    <p></p>

    <div class="filter-content" markdown="1" data-scope="mac">
    {% include copy-clipboard.html %}
    ~~~ shell
    i="$(which cockroach)"; mv "$i" "$i"_old
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{page.release_info.version}}.darwin-10.9-amd64/cockroach /usr/local/bin/cockroach
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    i="$(which cockroach)"; mv "$i" "$i"_old
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{page.release_info.version}}.linux-amd64/cockroach /usr/local/bin/cockroach
    ~~~
    </div>

1. Start the node to have it rejoin the cluster.

    {{site.data.alerts.callout_danger}}
    For maximum availability, do not wait more than a few minutes before restarting the node with the new binary. See [this open issue](https://github.com/cockroachdb/cockroach/issues/37906) for context.
    {{site.data.alerts.end}}

    Without a process manager like `systemd`, re-run the [`cockroach start`](cockroach-start.html) command that you used to start the node initially, for example:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --advertise-addr=<node address> \
    --join=<node1 address>,<node2 address>,<node3 address>
    ~~~

    If you are using `systemd` as the process manager, run this command to start the node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ systemctl start <systemd config filename>
    ~~~

1. Verify the node has rejoined the cluster through its output to [`stdout`](cockroach-start.html#standard-output) or through the [DB Console](ui-cluster-overview-page.html#node-status).

1. If you use `cockroach` in your `$PATH`, you can remove the old binary:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm /usr/local/bin/cockroach_old
    ~~~

    If you leave versioned binaries on your servers, you do not need to do anything.

1. After the node has rejoined the cluster, ensure that the node is ready to accept a SQL connection.

    Unless there are tens of thousands of ranges on the node, it's usually sufficient to wait one minute. To be certain that the node is ready, run the following command:

    {% include copy-clipboard.html %}
    ~~~ shell
    cockroach sql -e 'select 1'
    ~~~

    The command will automatically wait to complete until the node is ready.

1. Repeat these steps for the next node.

## Step 5. Finish the upgrade

{{site.data.alerts.callout_info}}
This step is relevant only when upgrading from v20.2.x to v21.1. For upgrades within the v21.1.x series, skip this step.
{{site.data.alerts.end}}

If you disabled auto-finalization in [step 3](#step-3-decide-how-the-upgrade-will-be-finalized), monitor the stability and performance of your cluster for as long as you require to feel comfortable with the upgrade (generally at least a day) and remember to prevent new schema changes and changes to user privileges. If during this time you decide to roll back the upgrade, repeat the rolling restart procedure with the old binary.

Once you are satisfied with the new version:

1. Start the [`cockroach sql`](cockroach-sql.html) shell against any node in the cluster.

2. Re-enable auto-finalization:

    {% include copy-clipboard.html %}
    ~~~ sql
    > RESET CLUSTER SETTING cluster.preserve_downgrade_option;
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
- [Release notes for our latest version](../releases/{{page.release_info.version}}.html)
