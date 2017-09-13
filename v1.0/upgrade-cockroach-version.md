---
title: Upgrade a Cluster's Version
summary: Learn how to upgrade your CockroachDB cluster to a new version.
toc: false
toc_not_nested: true
---

Because of CockroachDB's multi-active availability design, you can perform a "rolling upgrade" of CockroachDB on your cluster. This means you can upgrade individual nodes in your cluster one at a time without any downtime for your cluster.

<div id="toc"></div>

## Considerations

- Make sure your cluster is behind a load balancer, or your clients are configured to talk to multiple nodes. If your application communicates with a single node, stopping that node to upgrade its CockroachDB binary will cause your application to fail.

- By default, if a node stays offline for more than 5 minutes, the cluster will consider it dead and will rebalance its data to other nodes. Therefore, if you expect any nodes to be down for more than 5 minutes during a rolling upgrade, you should first set the `server.time_until_store_dead` [cluster setting](cluster-settings.html) to higher than the `5m0s` default. For example, if you think a node might be offline for up to 8 minutes, you might change this setting as follows:

    ~~~ sql
    > SET CLUSTER SETTING server.time_until_store_dead = 10m0s;
    ~~~

    After upgrading all nodes in the cluster, you would then change the setting back to its default:

    ~~~ sql
    > SET CLUSTER SETTING server.time_until_store_dead = 5m0s;
    ~~~

## Step 1. Verify cluster health

1. SSH to any node in the cluster.

2. Run the [`cockroach node status`](view-node-details.html) command.

    In the response, if any nodes that should be live are not listed, identify why the nodes are offline and restart them before begining your upgrade.

    Also make sure `ranges_unavailable` and `ranges_underreplicated` show `0` for all nodes. If there are unavailable or underreplicated ranges in your cluster, performing a rolling upgrade increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability. Therefore, it's important to identify and resolve the cause of range unavailability and underreplication before beginning your upgrade.

## Step 2. Collect debug information

Run the [`cockroach debug zip`](debug-zip.html) command to capture your cluster's state before the upgrade. If the upgrade does not go according to plan, the captured details will help you and Cockroach Labs troubleshoot issues.

## Step 3. Perform the rolling upgrade

For each node in your cluster, complete the following steps.

{{site.data.alerts.callout_success}}We recommend creating scripts to perform these steps instead of performing them by hand.{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}Upgrade only one node at a time, and wait at least one minute after a node rejoins the cluster to upgrade the next node. Simultaneously upgrading more than one node increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability.{{site.data.alerts.end}}

1. Connect to the node.

2. Download and install the CockroachDB binary you want to use:
    - **Mac**:

        {% include copy-clipboard.html %}
        ~~~ shell
        # Get the CockroachDB tarball:
        $ curl -O https://binaries.cockroachdb.com/cockroach-{{page.release_info.version}}.darwin-10.9-amd64.tgz
        ~~~

        {% include copy-clipboard.html %}
        ~~~ shell
        # Extract the binary:
        $ tar xfz cockroach-{{page.release_info.version}}.darwin-10.9-amd64.tgz
        ~~~

        {% include copy-clipboard.html %}
        ~~~ shell
        # Optional: Place cockroach in your $PATH
        $ cp -i cockroach-{{page.release_info.version}}.darwin-10.9-amd64/cockroach /usr/local/bin/cockroach
        ~~~
    - **Linux**:

        {% include copy-clipboard.html %}
        ~~~ shell
        # Get the CockroachDB tarball:
        $ wget https://binaries.cockroachdb.com/cockroach-{{page.release_info.version}}.linux-amd64.tgz
        ~~~

        {% include copy-clipboard.html %}
        ~~~ shell
        # Extract the binary:
        $ tar xfz cockroach-{{page.release_info.version}}.linux-amd64.tgz
        ~~~

        {% include copy-clipboard.html %}
        ~~~ shell
        # Optional: Place cockroach in your $PATH
        $ cp -i cockroach-{{page.release_info.version}}.linux-amd64/cockroach /usr/local/bin/cockroach
        ~~~

3. Stop the `cockroach` process.

    Without a process manager, use this command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pkill cockroach
    ~~~

    Then verify that the process has stopped:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ps aux | grep cockroach
    ~~~

    Alternately, you can check the node's logs for the message `server drained and shutdown completed`.

4. If you use `cockroach` in your `$PATH`, rename the outdated `cockroach` binary, and then move the new one into its place:
    - **Mac**:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ i="$(which cockroach)"; mv "$i" "$i"_old
        ~~~

        {% include copy-clipboard.html %}
        ~~~ shell
        $ cp -i cockroach-{{page.release_info.version}}.darwin-10.9-amd64/cockroach /usr/local/bin/cockroach
        ~~~
    - **Linux**:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ i="$(which cockroach)"; mv "$i" "$i"_old
        ~~~

        {% include copy-clipboard.html %}
        ~~~ shell
        $ cp -i cockroach-{{page.release_info.version}}.linux-amd64/cockroach /usr/local/bin/cockroach
        ~~~

    If you leave versioned binaries on your servers, you don't need to do anything.

5. If you're running with a process manager, have the node rejoin the cluster by starting it.

    Without a process manager, use this command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start --join=[IP address of any other node] [other flags]
    ~~~
    `[other flags]` includes any flags you [use to a start node](start-a-node.html), such as `--host`.

6. Verify the node has rejoined the cluster through its output to `stdout` or through the [admin UI](explore-the-admin-ui.html).

7. If you use `cockroach` in your `$PATH`, you can remove the old binary:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm /usr/local/bin/cockroach_old
    ~~~

8. Wait at least one minute after the node has rejoined the cluster, and then repeat these steps for the next node.

## See Also

- [View Node Details](view-node-details.html)
- [Collect Debug Information](debug-zip.html)
- [View Version Details](view-version-details.html)
- [Release notes for our latest version](../releases/{{page.release_info.version}}.html)
