---
title: Upgrade to CockroachDB v2.0
summary: Learn how to upgrade your CockroachDB cluster to a new version.
toc: true
toc_not_nested: true
---

Because of CockroachDB's [multi-active availability](multi-active-availability.html) design, you can perform a "rolling upgrade" of your CockroachDB cluster. This means that you can upgrade nodes one at a time without interrupting the cluster's overall health and operations.

{{site.data.alerts.callout_info}}
This page shows you how to upgrade to the latest v2.0 release ({{page.release_info.version}}) from v1.1.x, or from any patch release in the v2.0.x series. To upgrade within the v1.1.x series, see [the v1.1 version of this page](../v1.1/upgrade-cockroach-version.html).
{{site.data.alerts.end}}

## Step 1. Verify that you can upgrade

When upgrading, you can skip patch releases, **but you cannot skip full releases**. Therefore, if you are upgrading from v1.0.x to v2.0:

1. First [upgrade to v1.1](../v1.1/upgrade-cockroach-version.html). Be sure to complete all the steps, include the [finalization step](../v1.1/upgrade-cockroach-version.html#finalize-the-upgrade) (i.e., `SET CLUSTER SETTING version = '1.1';`).

2. Then return to this page and perform a second rolling upgrade to v2.0.

If you are upgrading from v1.1.x or from any v2.0.x patch release, you do not have to go through intermediate releases; continue to step 2.

## Step 2. Prepare to upgrade

Before starting the upgrade, complete the following steps.

1. Make sure your cluster is behind a [load balancer](recommended-production-settings.html#load-balancing), or your clients are configured to talk to multiple nodes. If your application communicates with a single node, stopping that node to upgrade its CockroachDB binary will cause your application to fail.

2. Verify the cluster's overall health by running the [`cockroach node status`](view-node-details.html) command against any node in the cluster.

    In the response:
    - If any nodes that should be live are not listed, identify why the nodes are offline and restart them before begining your upgrade.
    - Make sure the `build` field shows the same version of CockroachDB for all nodes. If any nodes are behind, upgrade them to the cluster's current version first, and then start this process over.
    - Make sure `ranges_unavailable` and `ranges_underreplicated` show `0` for all nodes. If there are unavailable or underreplicated ranges in your cluster, performing a rolling upgrade increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability. Therefore, it's important to identify and resolve the cause of range unavailability and underreplication before beginning your upgrade.
        {{site.data.alerts.callout_success}}
        Pass the `--ranges` or `--all` flag to include these range details in the response.
        {{site.data.alerts.end}}

3. Capture the cluster's current state by running the [`cockroach debug zip`](debug-zip.html) command against any node in the cluster. If the upgrade does not go according to plan, the captured details will help you and Cockroach Labs troubleshoot issues.

4. [Back up the cluster](back-up-data.html). If the upgrade does not go according to plan, you can use the data to restore your cluster to its previous state.

## Step 3. Perform the rolling upgrade

For each node in your cluster, complete the following steps.

{{site.data.alerts.callout_success}}
We recommend creating scripts to perform these steps instead of performing them manually.
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
Upgrade only one node at a time, and wait at least one minute after a node rejoins the cluster to upgrade the next node. Simultaneously upgrading more than one node increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability.
{{site.data.alerts.end}}

1. Connect to the node.

2. Terminate the `cockroach` process.

    Without a process manager like `systemd`, use this command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pkill cockroach
    ~~~

    If you are using `systemd` as the process manager, use this command to stop a node without `systemd` restarting it:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ systemctl stop <systemd config filename>
    ~~~

    Then verify that the process has stopped:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ps aux | grep cockroach
    ~~~

    Alternately, you can check the node's logs for the message `server drained and shutdown completed`.

3. Download and install the CockroachDB binary you want to use:

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>
    <p></p>

    <div class="filter-content" markdown="1" data-scope="mac">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{page.release_info.version}}.darwin-10.9-amd64.tgz
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ tar -xzf cockroach-{{page.release_info.version}}.darwin-10.9-amd64.tgz
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{page.release_info.version}}.linux-amd64.tgz
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ tar -xzf cockroach-{{page.release_info.version}}.linux-amd64.tgz
    ~~~
    </div>

4. If you use `cockroach` in your `$PATH`, rename the outdated `cockroach` binary, and then move the new one into its place:

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

5. Start the node to have it rejoin the cluster.

    Without a process manager like `systemd`, use this command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start --join=[IP address of any other node] [other flags]
    ~~~
    `[other flags]` includes any flags you [use to a start node](start-a-node.html), such as it `--host`.

    If you are using `systemd` as the process manager, run this command to start the node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ systemctl start <systemd config filename>
    ~~~

6. Verify the node has rejoined the cluster through its output to `stdout` or through the [admin UI](admin-ui-access-and-navigate.html).

7. If you use `cockroach` in your `$PATH`, you can remove the old binary:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm /usr/local/bin/cockroach_old
    ~~~

    If you leave versioned binaries on your servers, you do not need to do anything.

8. Wait at least one minute after the node has rejoined the cluster, and then repeat these steps for the next node.

## Step 4. Monitor the upgraded cluster

After upgrading all nodes in the cluster, monitor the cluster's stability and performance for at least one day.

{{site.data.alerts.callout_danger}}
During this phase, avoid using any new v2.0 features. Doing so may prevent you from being able to perform a rolling downgrade to v1.1, if necessary. Also, it is not recommended to run enterprise [`BACKUP`](backup.html) and [`RESTORE`](restore.html) jobs during this phase, as some features like detecting schema changes or ensuring correct target expansion may behave differently in mixed version clusters.
{{site.data.alerts.end}}

## Step 5. Finalize or revert the upgrade

Once you have monitored the upgraded cluster for at least one day:

- If you are satisfied with the new version, complete the steps under [Finalize the upgrade](#finalize-the-upgrade).

- If you are experiencing problems, follow the steps under [Revert the upgrade](#revert-the-upgrade).

### Finalize the upgrade

{{site.data.alerts.callout_info}}
These final steps are required after upgrading from v1.1.x to v2.0. For upgrades within the v2.0.x series, you do not need to take any further action.
{{site.data.alerts.end}}

1. Start the [`cockroach sql`](use-the-built-in-sql-client.html) shell against any node in the cluster.

2. Use the `crdb_internal.node_executable_version()` [built-in function](functions-and-operators.html) to check the CockroachDB version running on the node:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT crdb_internal.node_executable_version();
    ~~~

    Make sure the version matches your expectations. Since you upgraded each node, this version should be running on all other nodes as well.

3. Use the same function to finalize the upgrade:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING version = crdb_internal.node_executable_version();
    ~~~

    This step enables certain performance improvements and bug fixes that were introduced in v2.0. Note, however, that after completing this step, it will no longer be possible to perform a rolling downgrade to v1.1. In the event of a catastrophic failure or corruption due to usage of new features requiring v2.0, the only option is to start a new cluster using the old binary and then restore from one of the backups created prior to finalizing the upgrade.

### Revert the upgrade

1. Run the [`cockroach debug zip`](debug-zip.html) command against any node in the cluster to capture your cluster's state.

2. [Reach out for support](support-resources.html) from Cockroach Labs, sharing your debug zip.

3. If necessary, downgrade the cluster by repeating the [rolling upgrade process](#step-3-perform-the-rolling-upgrade), but this time switching each node back to the previous version.

## See Also

- [View Node Details](view-node-details.html)
- [Collect Debug Information](debug-zip.html)
- [View Version Details](view-version-details.html)
- [Release notes for our latest version](../releases/{{page.version.version}}.html)
