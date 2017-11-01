---
title: Upgrade a Cluster
summary: Learn how to upgrade a CockroachDB cluster to a new version.
toc: false
sidebar_data: sidebar-data-training.json
---

## Presentation

[Upgrade Your Custer](https://docs.google.com/presentation/d/1V_Y-V5EjUXNnw7RVgpdZx5Z0_JYP4IqYgkeklvqV5EA)

## Lab

In this lab, we'll upgrade your cluster to use the latest beta.

### Before You Begin

To complete this lab, you'll need a 3-node insecure cluster.

### Rolling Upgrade Process

1. Connect to the node.

2. Stop the `cockroach` process.

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

3. Download and install the CockroachDB binary you want to use:

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>
    <p></p>

    <div class="filter-content" markdown="1" data-scope="mac">
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
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
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
    $ i="$(which cockroach)"; mv "$i" "$i"_old
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{page.release_info.version}}.darwin-10.9-amd64/cockroach /usr/local/bin/cockroach
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ i="$(which cockroach)"; mv "$i" "$i"_old
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{page.release_info.version}}.linux-amd64/cockroach /usr/local/bin/cockroach
    ~~~
    </div>

5. If you're running with a process manager, have the node rejoin the cluster by starting it.

    Without a process manager, use this command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start --join=[IP address of any other node] [other flags]
    ~~~
    `[other flags]` includes any flags you [use to a start node](start-a-node.html), such as it `--host`.

6. Verify the node has rejoined the cluster through its output to `stdout` or through the [admin UI](admin-ui-access-and-navigate.html).

7. If you use `cockroach` in your `$PATH`, you can remove the old binary:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm /usr/local/bin/cockroach_old
    ~~~

    If you leave versioned binaries on your servers, you don't need to do anything.

8. Wait at least one minute after the node has rejoined the cluster, and then repeat these steps for the next node.

## Up Next

- [Decommission Nodes](decommission-nodes.html)
