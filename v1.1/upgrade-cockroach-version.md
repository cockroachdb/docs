---
title: Upgrade a Cluster's Version
summary: Learn how to upgrade your CockroachDB cluster to a new version.
toc: false
toc_not_nested: true
---

Because of CockroachDB's multi-active availability design, you can perform a "rolling upgrade" of CockroachDB on your cluster. This means you can upgrade individual nodes in your cluster one at a time without any downtime for your cluster.

However, there are a few things you should keep in mind:

  - For rolling upgrades to work, your cluster must be behind a load balancer or your clients must be configured to talk to multiple nodes. If your application communicates with a single node, bringing it down to upgrade its CockroachDB binary will cause your application to fail when the node goes offline.

  - We recommend creating scripts to upgrade CockroachDB and not attempting to do so by hand.

  - Bring down only one node at a time, and wait at least one minute after it rejoins the cluster to bring down the next node. This reduces the number of nodes you have offline at any point in time, minimizing the chance you'll lose a majority of the nodes in your cluster which can cause service outages.

## Perform a Rolling Upgrade

For each node in your cluster, complete the following steps.

1. Connect to the node.

2. Download and install the CockroachDB binary you want to use:
    - **Mac**:

        ~~~ shell
        $ curl -O https://binaries.cockroachdb.com/cockroach-{{page.release_info.version}}.darwin-10.9-amd64.tgz
        $ tar xfz cockroach-{{page.release_info.version}}.darwin-10.9-amd64.tgz

        # Optional: Place cockroach in your $PATH
        $ cp -i cockroach-{{page.release_info.version}}.darwin-10.9-amd64/cockroach /usr/local/bin/cockroach
        ~~~
    - **Linux**:

        ~~~ shell
        $ wget https://binaries.cockroachdb.com/cockroach-{{page.release_info.version}}.linux-amd64.tgz
        $ tar xfz cockroach-{{page.release_info.version}}.linux-amd64.tgz

        # Optional: Place cockroach in your $PATH
        $ cp -i cockroach-{{page.release_info.version}}.linux-amd64/cockroach /usr/local/bin/cockroach
        ~~~

3. Stop the `cockroach` process.

    Without a process manager, use this command:

    ~~~ shell
    $ pkill cockroach
    ~~~

    Then verify that the process has stopped:

    ~~~ shell
    $ ps aux | grep cockroach
    ~~~

    Alternately, you can check the node's logs for the message `server drained and shutdown completed`.

4. If you use `cockroach` in your `$PATH`, rename the outdated `cockroach` binary, and then move the new one into its place:
    - **Mac**:

        ~~~ shell
        $ i="$(which cockroach)"; mv "$i" "$i"_old
        $ cp -i cockroach-{{page.release_info.version}}.darwin-10.9-amd64/cockroach /usr/local/bin/cockroach
        ~~~
    - **Linux**:

        ~~~ shell
        $ i="$(which cockroach)"; mv "$i" "$i"_old
        $ cp -i cockroach-{{page.release_info.version}}.linux-amd64/cockroach /usr/local/bin/cockroach
        ~~~

    If you leave versioned binaries on your servers, you don't need to do anything.

5. If you're running with a process manager, have the node rejoin the cluster by starting it.

    Without a process manager, use this command:

    ~~~ shell
    $ cockroach start --join=[any other node's IP address] [other flags]
    ~~~
    `[other flags]` includes any flags you [use to a start node](start-a-node.html), such as it    --host`.

6. Verify the node has rejoined the cluster through its output to `stdout` or through the [admin UI](explore-the-admin-ui.html).

7. If you use `cockroach` in your `$PATH`, you can remove the old binary:

    ~~~ shell
    $ rm /usr/local/bin/cockroach_old
    ~~~

8. Wait at least one minute after the node has rejoined the cluster, and then repeat these steps for the next node.

## See Also

- [View Version Details](view-version-details.html)
- [Release notes for our latest version](../releases/{{page.release_info.version}}.html)
