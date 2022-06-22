---
title: Upgrade a Cluster's Version
summary: Learn how to upgrade your CockroachDB cluster to a new version.
toc: true
toc_not_nested: true
---

Because of CockroachDB's [multi-active availability](multi-active-availability.html) design, you can perform a "rolling upgrade" of your CockroachDB cluster. This means that you can upgrade nodes one at a time without interrupting the cluster's overall health and operations.

{{site.data.alerts.callout_info}}This page shows you how to upgrade from v1.0 to a patch release in the 1.0.x series. To upgrade from v1.0.x to v1.1, see <a href="https://www.cockroachlabs.com/docs/v1.1/upgrade-cockroach-version.html">the 1.1 version of this page</a>.{{site.data.alerts.end}}


## Step 1. Prepare to upgrade

Before starting the upgrade, complete the following steps.

1. Make sure your cluster is behind a load balancer, or your clients are configured to talk to multiple nodes. If your application communicates with a single node, stopping that node to upgrade its CockroachDB binary will cause your application to fail.

2. Verify the cluster's overall health by running the [`cockroach node status`](view-node-details.html) command against any node in the cluster.

    In the response:
    - If any nodes that should be live are not listed, identify why the nodes are offline and restart them before begining your upgrade.
    - Make sure the `build` field shows the same version of CockroachDB for all nodes. If any nodes are behind, upgrade them to the cluster's current version first, and then start this process over.
    - Make sure `ranges_unavailable` and `ranges_underreplicated` show `0` for all nodes. If there are unavailable or underreplicated ranges in your cluster, performing a rolling upgrade increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability. Therefore, it's important to identify and resolve the cause of range unavailability and underreplication before beginning your upgrade.

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
    `[other flags]` includes any flags you [use to a start node](start-a-node.html), such as `--host`.

6. Verify the node has rejoined the cluster through its output to `stdout` or through the [admin UI](explore-the-admin-ui.html).

7. If you use `cockroach` in your `$PATH`, you can remove the old binary:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm /usr/local/bin/cockroach_old
    ~~~

    If you leave versioned binaries on your servers, you do not need to do anything.

8. Wait at least one minute after the node has rejoined the cluster, and then repeat these steps for the next node.

## Step 3. Monitor the upgraded cluster

After upgrading all nodes in the cluster, monitor the cluster's stability and performance for at least one day.

If you experience any problems, follow these steps to troubleshoot and, if necessary, downgrade the cluster:

1. Run the [`cockroach debug zip`](debug-zip.html) command against any node in the cluster to capture your cluster's state.

2. [Reach out for support](support-resources.html) from Cockroach Labs, sharing your debug zip.

3. If necessary, downgrade the cluster by repeating the [rolling upgrade process](#step-2-perform-the-rolling-upgrade), but this time switching each node back to the previous version in the 1.0.x series.

## See Also

- [View Node Details](view-node-details.html)
- [Collect Debug Information](debug-zip.html)
- [View Version Details](view-version-details.html)
- [Release notes for our latest version](../releases/{{page.release_info.version}}.html)
