---
title: Upgrade to CockroachDB v2.1
summary: Learn how to upgrade your CockroachDB cluster to a new version.
toc: true
toc_not_nested: true
---

Because of CockroachDB's [multi-active availability](multi-active-availability.html) design, you can perform a "rolling upgrade" of your CockroachDB cluster. This means that you can upgrade nodes one at a time without interrupting the cluster's overall health and operations.

{{site.data.alerts.callout_info}}
This page shows you how to upgrade to the latest v2.1 release ({{page.release_info.version}}) from v2.0.x, or from any patch release in the v2.1.x series. To upgrade within the v2.0.x series, see [the v2.0 version of this page](https://www.cockroachlabs.com/docs/v2.0/upgrade-cockroach-version.html).
{{site.data.alerts.end}}

## Step 1. Verify that you can upgrade

If you are upgrading from v2.0.5 or later to v2.1, you do not have to go through intermediate releases; continue to step 2. However, if you are upgrading from 2.0.4 or earlier to v2.1, complete the following steps first:

1. [Upgrade to v2.0.5 or any later patch release in the 2.0.x series](../v2.0/upgrade-cockroach-version.html). If upgrading from v1.1.x, be sure to complete all the steps, including the [finalization step](../v2.0/upgrade-cockroach-version.html#finalize-the-upgrade).

2. Return to this page and perform a second rolling upgrade to v2.1.

## Step 2. Prepare to upgrade

Before starting the upgrade, complete the following steps.

1. Make sure your cluster is behind a [load balancer](recommended-production-settings.html#load-balancing), or your clients are configured to talk to multiple nodes. If your application communicates with a single node, stopping that node to upgrade its CockroachDB binary will cause your application to fail.

2. Verify the overall health of your cluster using the [Admin UI](admin-ui-access-and-navigate.html). On the **Cluster Overview**:
    - Under **Node Status**, make sure all nodes that should be live are listed as such. If any nodes are unexpectedly listed as suspect or dead, identify why the nodes are offline and either restart them or [decommission](remove-nodes.html) them before beginning your upgrade. If there are dead and non-decommissioned nodes in your cluster, it will not be possible to finalize the upgrade (either automatically or manually).
    - Under **Replication Status**, make sure there are 0 under-replicated and unavailable ranges. Otherwise, performing a rolling upgrade increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability. Therefore, it's important to identify and resolve the cause of range under-replication and/or unavailability before beginning your upgrade.
    - In the **Node List**:
        - Make sure all nodes are on the same version. If any nodes are behind, upgrade them to the cluster's current version first, and then start this process over.
        - Make sure capacity and memory usage are reasonable for each node. Nodes must be able to tolerate some increase in case the new version uses more resources for your workload. Also go to **Metrics > Dashboard: Hardware** and make sure CPU percent is reasonable across the cluster. If there's not enough headroom on any of these metrics, consider [adding nodes](start-a-node.html) to your cluster before beginning your upgrade.

3. Capture the cluster's current state by running the [`cockroach debug zip`](debug-zip.html) command against any node in the cluster. If the upgrade does not go according to plan, the captured details will help you and Cockroach Labs troubleshoot issues.

4. [Back up the cluster](backup-and-restore.html). If the upgrade does not go according to plan, you can use the data to restore your cluster to its previous state.

## Step 3. Decide how the upgrade will be finalized

{{site.data.alerts.callout_info}}
This step is relevant only when upgrading from v2.0.x to v2.1. For upgrades within the v2.1.x series, skip this step.
{{site.data.alerts.end}}

By default, after all nodes are running the new version, the upgrade process will be **auto-finalized**. This will enable certain performance improvements and bug fixes introduced in v2.1. After finalization, however, it will no longer be possible to perform a downgrade to v2.0. In the event of a catastrophic failure or corruption, the only option will be to start a new cluster using the old binary and then restore from one of the backups created prior to performing the upgrade.

We recommend disabling auto-finalization so you can monitor the stability and performance of the upgraded cluster before finalizing the upgrade, but note that you will need to follow all of the subsequent directions, including the manual finalization in step 5:

1. [Upgrade to v2.0](../v2.0/upgrade-cockroach-version.html), if you haven't already. The `cluster.preserve_downgrade_option` setting mentioned below is available only as of v2.0.3.

2. Start the [`cockroach sql`](use-the-built-in-sql-client.html) shell against any node in the cluster.

3. Set the `cluster.preserve_downgrade_option` [cluster setting](cluster-settings.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING cluster.preserve_downgrade_option = '2.0';
    ~~~

    It is only possible to set this setting to the current cluster version.

## Step 4. Perform the rolling upgrade

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

    Without a process manager like `systemd`, re-run the [`cockroach start`](start-a-node.html) command that you used to start the node initially, for example:

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

6. Verify the node has rejoined the cluster through its output to `stdout` or through the [Admin UI](admin-ui-access-and-navigate.html).

    {{site.data.alerts.callout_info}}
    To access the Admin UI for a secure cluster, [create a user with a password](create-user.html#create-a-user-with-a-password). Then open a browser and go to `https://<any node's external IP address>:8080`. On accessing the Admin UI, you will see a Login screen, where you will need to enter your username and password.
    {{site.data.alerts.end}}

7. If you use `cockroach` in your `$PATH`, you can remove the old binary:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm /usr/local/bin/cockroach_old
    ~~~

    If you leave versioned binaries on your servers, you do not need to do anything.

8. Wait at least one minute after the node has rejoined the cluster, and then repeat these steps for the next node.

## Step 5. Finish the upgrade

{{site.data.alerts.callout_info}}
This step is relevant only when upgrading from v2.0.x to v2.1. For upgrades within the v2.1.x series, skip this step.
{{site.data.alerts.end}}

If you disabled auto-finalization in step 3 above, monitor the stability and performance of your cluster for as long as you require to feel comfortable with the upgrade (generally at least a day). If during this time you decide to roll back the upgrade, repeat the rolling restart procedure with the old binary.

Once you are satisfied with the new version, re-enable auto-finalization:

1. Start the [`cockroach sql`](use-the-built-in-sql-client.html) shell against any node in the cluster.
2. Re-enable auto-finalization:

    {% include copy-clipboard.html %}
    ~~~ sql
    > RESET CLUSTER SETTING cluster.preserve_downgrade_option;
    ~~~

## Step 6. Troubleshooting

After the upgrade has finalized (whether manually or automatically), it is no longer possible to downgrade to the previous release. If you are experiencing problems, we therefore recommend that you:

1. Run the [`cockroach debug zip`](debug-zip.html) command against any node in the cluster to capture your cluster's state.
2. [Reach out for support](support-resources.html) from Cockroach Labs, sharing your debug zip.

In the event of catastrophic failure or corruption, the only option will be to start a new cluster using the old binary and then restore from one of the backups created prior to performing the upgrade.

## See also

- [View Node Details](view-node-details.html)
- [Collect Debug Information](debug-zip.html)
- [View Version Details](view-version-details.html)
- [Release notes for our latest version](../releases/{{page.version.version}}.html)
