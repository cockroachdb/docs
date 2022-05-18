---
title: Upgrade to CockroachDB v22.1
summary: Learn how to upgrade your CockroachDB cluster to v22.1.
toc: true
docs_area: manage
---

{% assign previous_version = site.data.versions | where_exp: "previous_version", "previous_version.major_version == page.version.version" | first | map: "previous_version" %}

Because of CockroachDB's [multi-active availability](multi-active-availability.html) design, you can perform a "rolling upgrade" of your CockroachDB cluster. This means that you can upgrade nodes one at a time without interrupting the cluster's overall health and operations.

## Step 1. Verify that you can upgrade

To upgrade to a new version, you must first be on a production [release](../releases/) of the previous version. The release does not need to be the latest production release of the previous version, but it **must be a production release** and not a testing release (alpha/beta).

Therefore, to upgrade to {{ page.version.version }}:

- If your current CockroachDB version is a production release earlier than {{ previous_version }}, or is a {{ previous_version }} testing release (alpha/beta):
    1. First [upgrade to a production release of {{ previous_version }}](../{{ previous_version }}/upgrade-cockroach-version.html). Be sure to complete all the steps.
    1. Return to this page and perform a second rolling upgrade to {{ page.version.version }}, starting from [step 2](#step-2-prepare-to-upgrade).

- If your current CockroachDB version is any {{ previous_version }} production release, or any earlier {{ page.version.version }} release, you do not have to go through intermediate releases; continue to [step 2](#step-2-prepare-to-upgrade).

## Step 2. Prepare to upgrade

Before starting the upgrade, complete the following steps.

### Check load balancing

Make sure your cluster is behind a [load balancer](recommended-production-settings.html#load-balancing), or your clients are configured to talk to multiple nodes. If your application communicates with a single node, stopping that node to upgrade its CockroachDB binary will cause your application to fail.

### Check cluster health

Verify the overall health of your cluster using the [DB Console](ui-cluster-overview-page.html):

- Under **Node Status**, make sure all nodes that should be live are listed as such. If any nodes are unexpectedly listed as `SUSPECT` or `DEAD`, identify why the nodes are offline and either restart them or [decommission](node-shutdown.html?filters=decommission#remove-nodes) them before beginning your upgrade. If there are `DEAD` and non-decommissioned nodes in your cluster, it will not be possible to finalize the upgrade (either automatically or manually).

    - Make sure any decommissioning nodes have been fully decommissioned. Check the `membership` field in the [output of `cockroach node status --decommission`](node-shutdown.html?filters=decommission#cockroach-node-status). Nodes with `decommissioned` membership are fully decommissioned, while nodes with `decommissioning` membership have not completed the process. In case the decommissioning process is hung, [recommission](node-shutdown.html?filters=decommission#recommission-nodes) and then [decommission those nodes](node-shutdown.html?filters=decommission#remove-nodes) again, and confirm that their membership changes to `decommissioned`.

- Under **Replication Status**, make sure there are `0` under-replicated and unavailable ranges. Otherwise, performing a rolling upgrade increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability. Therefore, it's important to identify and resolve the cause of range under-replication and/or unavailability before beginning your upgrade.

- In the **Node List**:
    - Make sure all nodes are on the same version. If any nodes are behind, upgrade them to the cluster's current version first, and then start this process over.

- In the **Metrics** dashboards:
    - Make sure [CPU](common-issues-to-monitor.html#cpu-usage), [memory](common-issues-to-monitor.html#database-memory-usage), and [storage](common-issues-to-monitor.html#storage-capacity) capacity are within acceptable values for each node. Nodes must be able to tolerate some increase in case the new version uses more resources for your workload. If any of these metrics is above healthy limits, consider [adding nodes](cockroach-start.html) to your cluster before beginning your upgrade.

### Review breaking changes

{% assign rd = site.data.versions | where_exp: "rd", "rd.major_version == page.version.version" | map: "release_date" %}

Review the [backward-incompatible changes in {{ page.version.version }}](../releases/{{ page.version.version }}.html{% unless rd == "N/A" or rd > today %}#{{ page.version.version | replace: ".", "-" }}-0-backward-incompatible-changes{% endunless %}) and [deprecated features](../releases/{{ page.version.version }}.html#{% unless rd == "N/A" or rd > today %}{{ page.version.version | replace: ".", "-" }}-0-deprecations{% endunless %}). If any affect your deployment, make the necessary changes before starting the rolling upgrade to {{ page.version.version }}.

## Step 3. Decide how the upgrade will be finalized

{{site.data.alerts.callout_info}}
This step is relevant only when upgrading from {{ previous_version }}.x to {{ page.version.version }}. For upgrades within the {{ page.version.version }}.x series, skip this step.
{{site.data.alerts.end}}

By default, after all nodes are running the new version, the upgrade process will be **auto-finalized**. This will enable certain [features and performance improvements introduced in {{ page.version.version }}](#features-that-require-upgrade-finalization). However, it will no longer be possible to perform a downgrade to {{ previous_version }}. In the event of a catastrophic failure or corruption, the only option will be to start a new cluster using the old binary and then restore from one of the backups created prior to performing the upgrade. For this reason, **we recommend disabling auto-finalization** so you can monitor the stability and performance of the upgraded cluster before finalizing the upgrade, but note that you will need to follow all of the subsequent directions, including the manual finalization in [step 5](#step-5-finish-the-upgrade):

1. [Upgrade to {{ previous_version }}](../{{ previous_version }}/upgrade-cockroach-version.html), if you haven't already.

2. Start the [`cockroach sql`](cockroach-sql.html) shell against any node in the cluster.

3. Set the `cluster.preserve_downgrade_option` [cluster setting](cluster-settings.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING cluster.preserve_downgrade_option = '{{ previous_version }}';
    ~~~

    It is only possible to set this setting to the current cluster version.

### Features that require upgrade finalization

When upgrading from {{ previous_version }} to {{ page.version.version }}, certain features and performance improvements will be enabled only after finalizing the upgrade, including but not limited to:

- SCRAM authentication
- Row-level time to live (TTL)
- Table-level automatic statistics collection

For an expanded list of features included in the {{ page.version.version }} release, see the [{{ page.version.version }} release notes](../releases/{{ page.version.version }}.html).

## Step 4. Perform the rolling upgrade

For each node in your cluster, complete the following steps. Be sure to upgrade only one node at a time, and wait at least one minute after a node rejoins the cluster to upgrade the next node. Simultaneously upgrading more than one node increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability.

{{site.data.alerts.callout_success}}
We recommend creating scripts to perform these steps instead of performing them manually. Also, if you are running CockroachDB on Kubernetes, see our documentation on [single-cluster](upgrade-cockroachdb-kubernetes.html) and/or [multi-cluster](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html#upgrade-the-cluster) orchestrated deployments for upgrade guidance instead.
{{site.data.alerts.end}}

1. [Drain and shut down the node.](node-shutdown.html#perform-node-shutdown)

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
This step is relevant only when upgrading from {{ previous_version }}.x to {{ page.version.version }}. For upgrades within the {{ page.version.version }}.x series, skip this step.
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
- [Release notes for our latest version](../releases/{{page.version.version}}.html)
