---
title: Upgrade to CockroachDB v1.1
summary: Learn how to upgrade your CockroachDB cluster to a new version.
toc: true
toc_not_nested: true
---

Because of CockroachDB's [multi-active availability](multi-active-availability.html) design, you can perform a "rolling upgrade" of your CockroachDB cluster. This means that you can upgrade nodes one at a time without interrupting the cluster's overall health and operations.

{{site.data.alerts.callout_info}} When upgrading, you can skip patch releases, but you cannot skip full releases. Since v1.1 is the second full CockroachDB release, you do not have to go through intermediate releases. You can upgrade to any v1.1.x release from any v1.0.x release, or from any patch release in the v1.1.x series.<br><br>To upgrade within the v1.0.x series, see <a href="https://www.cockroachlabs.com/docs/v1.0/upgrade-cockroach-version.html">the v1.0 version of this page</a>. {{site.data.alerts.end}}


## Step 1. Prepare to upgrade

Before starting the upgrade, complete the following steps.

1. Make sure your cluster is behind a [load balancer](recommended-production-settings.html#load-balancing), or your clients are configured to talk to multiple nodes. If your application communicates with a single node, stopping that node to upgrade its CockroachDB binary will cause your application to fail.

2. Verify the cluster's overall health by running the [`cockroach node status`](view-node-details.html) command against any node in the cluster.

    In the response:
    - If any nodes that should be live are not listed, identify why the nodes are offline and restart them before begining your upgrade.
    - Make sure the `build` field shows the same version of CockroachDB for all nodes. If any nodes are behind, upgrade them to the cluster's current version first, and then start this process over.
    - Make sure `ranges_unavailable` and `ranges_underreplicated` show `0` for all nodes. If there are unavailable or underreplicated ranges in your cluster, performing a rolling upgrade increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability. Therefore, it's important to identify and resolve the cause of range unavailability and underreplication before beginning your upgrade.
        {{site.data.alerts.callout_info}}When upgrading within the v1.1.x series, pass the <code>--ranges</code> or <code>--all</code> flag to include these range details in the response.{{site.data.alerts.end}}

3. Capture the cluster's current state by running the [`cockroach debug zip`](debug-zip.html) command against any node in the cluster. If the upgrade does not go according to plan, the captured details will help you and Cockroach Labs troubleshoot issues.

4. [Back up the cluster](back-up-data.html). If the upgrade does not go according to plan, you can use the data to restore your cluster to its previous state.

## Step 2. Perform the rolling upgrade

For each node in your cluster, complete the following steps.

{{site.data.alerts.callout_success}}We recommend creating scripts to perform these steps instead of performing them by hand.{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}Upgrade only one node at a time, and wait at least one minute after a node rejoins the cluster to upgrade the next node. Simultaneously upgrading more than one node increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability.{{site.data.alerts.end}}

1. Connect to the node.

2. Terminate the `cockroach` process.

    Without a process manager, use this command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pkill cockroach
    ~~~

    Then verify that the process has stopped:

    {% include_cached copy-clipboard.html %}
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
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{page.release_info.version}}.darwin-10.9-amd64.tgz
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ tar -xzf cockroach-{{page.release_info.version}}.darwin-10.9-amd64.tgz
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{page.release_info.version}}.linux-amd64.tgz
    ~~~

    {% include_cached copy-clipboard.html %}
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
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    i="$(which cockroach)"; mv "$i" "$i"_old
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{page.release_info.version}}.darwin-10.9-amd64/cockroach /usr/local/bin/cockroach
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    i="$(which cockroach)"; mv "$i" "$i"_old
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{page.release_info.version}}.linux-amd64/cockroach /usr/local/bin/cockroach
    ~~~
    </div>

5. If you're running with a process manager, have the node rejoin the cluster by starting it.

    Without a process manager, use this command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start --join=[IP address of any other node] [other flags]
    ~~~
    `[other flags]` includes any flags you [use to a start node](start-a-node.html), such as it `--host`.

6. Verify the node has rejoined the cluster through its output to `stdout` or through the [admin UI](admin-ui-access-and-navigate.html).

7. If you use `cockroach` in your `$PATH`, you can remove the old binary:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm /usr/local/bin/cockroach_old
    ~~~

    If you leave versioned binaries on your servers, you do not need to do anything.

8. Wait at least one minute after the node has rejoined the cluster, and then repeat these steps for the next node.

## Step 3. Monitor the upgraded cluster

After upgrading all nodes in the cluster, monitor the cluster's stability and performance for at least one day.

{{site.data.alerts.callout_danger}}During this phase, avoid using any new v1.1 features. Doing so will prevent you from being able to perform a rolling downgrade to v1.0, if necessary.{{site.data.alerts.end}}

## Step 4. Finalize or revert the upgrade

Once you have monitored the upgraded cluster for at least one day:

- If you are satisfied with the new version, complete the steps under [Finalize the upgrade](#finalize-the-upgrade).

- If you are experiencing problems, follow the steps under [Revert the upgrade](#revert-the-upgrade).

### Finalize the upgrade

{{site.data.alerts.callout_info}}These final steps are required after upgrading from v1.0.x to v1.1. For upgrades within the v1.1.x series, you do not need to take any further action.{{site.data.alerts.end}}

1. [Back up the cluster](back-up-data.html).

2. Start the [`cockroach sql`](use-the-built-in-sql-client.html) shell against any node in the cluster and execute the following query:

    ~~~ sql
    > SET CLUSTER SETTING version = '1.1';
    ~~~

    {{site.data.alerts.callout_info}}This step assumes you've upgraded to at least v1.1.1.{{site.data.alerts.end}}

    This step enables certain performance improvements and bug fixes that were introduced in v1.1. Note, however, that after completing this step, it will no longer be possible to perform a rolling downgrade to v1.0. In the event of a catastrophic failure or corruption due to usage of new features requiring v1.1, the only option is to start a new cluster using the old binary and then restore from one of the backups created prior to finalizing the upgrade.

### Revert the upgrade

1. Run the [`cockroach debug zip`](debug-zip.html) command against any node in the cluster to capture your cluster's state.

2. [Reach out for support](support-resources.html) from Cockroach Labs, sharing your debug zip.

3. If necessary, downgrade the cluster by repeating the [rolling upgrade process](#step-2-perform-the-rolling-upgrade), but this time switching each node back to the previous version.

## See Also

- [View Node Details](view-node-details.html)
- [Collect Debug Information](debug-zip.html)
- [View Version Details](view-version-details.html)
- [Release notes for our latest version](../releases/{{page.release_info.version}}.html)
