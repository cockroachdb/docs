---
title: Upgrade to CockroachDB v21.2
summary: Learn how to upgrade your CockroachDB cluster to a new version.
toc: true
docs_area: manage
---

Because of CockroachDB's [multi-active availability](multi-active-availability.html) design, you can perform a "rolling upgrade" of your CockroachDB cluster. This means that you can upgrade nodes one at a time without interrupting the cluster's overall health and operations.

## Step 1. Verify that you can upgrade

To upgrade to a new version, you must first be on a [production release](../releases/#production-releases) of the previous version. The release does not need to be the latest production release of the previous version, but it **must be a production release** and not a [testing release (alpha/beta)](../releases/#testing-releases).

Therefore, to upgrade to v21.2:

- If your current CockroachDB version is a v20.2 release or earlier, or a v21.1 testing release (alpha/beta):
    1. First [upgrade to a production release of v21.1](../v21.1/upgrade-cockroach-version.html). Be sure to complete all the steps.
    1. Return to this page and perform a second rolling upgrade to v21.2, starting from [step 2](#step-2-prepare-to-upgrade).

- If your current CockroachDB version is any v21.1 production release, or any earlier v21.2 release, you do not have to go through intermediate releases; continue to [step 2](#step-2-prepare-to-upgrade).

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

Review the [changes in v21.2](../releases/v21.2.0.html). If any affect your deployment, make the necessary changes before starting the rolling upgrade to v21.2.

- Interleaved tables and interleaved indexes have been removed. Before upgrading to v21.2, [convert interleaved tables](../v21.1/interleave-in-parent.html#convert-interleaved-tables) and [replace interleaved indexes](../v21.1/interleave-in-parent.html#replace-interleaved-indexes). Clusters with interleaved tables and indexes cannot finalize the v21.2 upgrade.
- Previously, CockroachDB only supported the YMD format for parsing timestamps from strings. It now also supports the MDY format to better align with PostgreSQL. A timestamp such as `1-1-18`, which was previously interpreted as `2001-01-18`, will now be interpreted as `2018-01-01`. To continue interpreting the timestamp in the YMD format, the first number can be represented with 4 digits, `2001-1-18`.
- The deprecated [cluster setting](cluster-settings.html) `cloudstorage.gs.default.key` has been removed, and the behavior of the `AUTH` parameter in Google Cloud Storage [`BACKUP`](../v21.2/backup.html) and `IMPORT` URIs has been changed. The default behavior is now that of `AUTH=specified`, which uses the credentials passed in the `CREDENTIALS` parameter, and the previous default behavior of using the node's implicit access (via its machine account or role) now requires explicitly passing `AUTH=implicit`.
- We have switched types from `TEXT` to `"char"` for compatibility with PostgreSQL in the following columns: `pg_constraint` (`confdeltype`, `confmatchtype`, `confudptype`, `contype`) `pg_operator` (`oprkind`), `pg_prog` (`proargmodes`), `pg_rewrite` (`ev_enabled`, `ev_type`), and `pg_trigger` (`tgenabled`).

## Step 3. Decide how the upgrade will be finalized

{{site.data.alerts.callout_info}}
This step is relevant only when upgrading from v21.1.x to v21.2. For upgrades within the v21.2.x series, skip this step.
{{site.data.alerts.end}}

By default, after all nodes are running the new version, the upgrade process will be **auto-finalized**. This will enable certain [features and performance improvements introduced in v21.2](#features-that-require-upgrade-finalization). However, it will no longer be possible to perform a downgrade to v21.1. In the event of a catastrophic failure or corruption, the only option will be to start a new cluster using the old binary and then restore from one of the backups created prior to performing the upgrade. For this reason, **we recommend disabling auto-finalization** so you can monitor the stability and performance of the upgraded cluster before finalizing the upgrade, but note that you will need to follow all of the subsequent directions, including the manual finalization in [step 5](#step-5-finish-the-upgrade):

1. [Upgrade to v21.1](../v21.1/upgrade-cockroach-version.html), if you haven't already.

2. Start the [`cockroach sql`](cockroach-sql.html) shell against any node in the cluster.

3. Set the `cluster.preserve_downgrade_option` [cluster setting](cluster-settings.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING cluster.preserve_downgrade_option = '21.1';
    ~~~

    It is only possible to set this setting to the current cluster version.

### Features that require upgrade finalization

When upgrading from v21.1 to v21.2, certain features and performance improvements will be enabled only after finalizing the upgrade, including but not limited to:

- **Expression indexes:** [Indexes on expressions](expression-indexes.html) can now be created. These indexes speed up queries that filter on the result of that expression, and are especially useful for indexing only a specific field of a `JSON` object.
- **Privilege inheritance:** CockroachDB's model for inheritance of privileges that cascade from schema objects now matches PostgreSQL. Added support for [`ALTER DEFAULT PRIVILEGES`](alter-default-privileges.html) and [`SHOW DEFAULT PRIVILEGES`](show-default-privileges.html).
- **Bounded staleness reads:** [Bounded staleness reads](follower-reads.html#bounded-staleness-reads) are now available in CockroachDB. These use a dynamic, system-determined timestamp to minimize staleness while being more tolerant to replication lag than exact staleness reads. This dynamic timestamp is returned by the `with_min_timestamp()` or `with_max_staleness()` [functions](functions-and-operators.html). In addition, bounded staleness reads provide the ability to serve reads from local replicas even in the presence of network partitions or other failures.
- **Restricted and default placement:** You can now use the [`ALTER DATABASE ... PLACEMENT RESTRICTED`](placement-restricted.html) statement to constrain the replica placement for a [multi-region database](multiregion-overview.html)'s [regional tables](regional-tables.html) to the [home regions](set-locality.html#crdb_region) associated with those tables.
- **`ON UPDATE` expressions:** An [`ON UPDATE` expression](add-column.html#add-a-column-with-an-on-update-expression) can now be added to a column to update column values when an [`UPDATE`](update.html) or [`UPSERT`](upsert.html) statement modifies a different column value in the same row, or when an `ON UPDATE CASCADE` expression on a different column modifies an existing value in the same row.

For an expanded list of features included in the v21.2 release, see the [v21.2 release notes](../releases/v21.2.0.html).

## Step 4. Perform the rolling upgrade

For each node in your cluster, complete the following steps. Be sure to upgrade only one node at a time, and wait at least one minute after a node rejoins the cluster to upgrade the next node. Simultaneously upgrading more than one node increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability.

{{site.data.alerts.callout_success}}
We recommend creating scripts to perform these steps instead of performing them manually. Also, if you are running CockroachDB on Kubernetes, see our documentation on [single-cluster](upgrade-cockroachdb-kubernetes.html) and/or [multi-cluster](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html#upgrade-the-cluster) orchestrated deployments for upgrade guidance instead.
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
    $ curl https://binaries.cockroachdb.com/cockroach-{{page.release_info.version}}.darwin-10.9-amd64.tgz|tar -xzf -
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{page.release_info.version}}.linux-amd64.tgz|tar -xzf -
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
This step is relevant only when upgrading from v21.1.x to v21.2. For upgrades within the v21.2.x series, skip this step.
{{site.data.alerts.end}}

If you disabled auto-finalization in [step 3](#step-3-decide-how-the-upgrade-will-be-finalized), monitor the stability and performance of your cluster for as long as you require to feel comfortable with the upgrade (generally at least a day). If during this time you decide to roll back the upgrade, repeat the rolling restart procedure with the old binary.

Once you are satisfied with the new version:

1. Start the [`cockroach sql`](cockroach-sql.html) shell against any node in the cluster.

2. Re-enable auto-finalization:

    {% include copy-clipboard.html %}
    ~~~ sql
    > RESET CLUSTER SETTING cluster.preserve_downgrade_option;
    ~~~

    {{site.data.alerts.callout_info}}
    This statement can take up to a minute to complete, depending on the amount of data in the cluster, as it kicks off various internal maintenance and migration tasks. During this time, the cluster will experience a small amount of additional load.
    {{site.data.alerts.end}}

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
