---
title: Upgrade to CockroachDB v20.1
summary: Learn how to upgrade your CockroachDB cluster to a new version.
toc: true
---

Because of CockroachDB's [multi-active availability](multi-active-availability.html) design, you can perform a "rolling upgrade" of your CockroachDB cluster. This means that you can upgrade nodes one at a time without interrupting the cluster's overall health and operations.

## Step 1. Verify that you can upgrade

To upgrade to a new version, you must first be on a [production release](../releases/#production-releases) of the previous version. The release does not need to be the **latest** production release of the previous version, but it must be a production release rather than a testing release (alpha/beta).

Therefore, if you are upgrading from v19.1 to v20.1, or from a testing release (alpha/beta) of v19.2 to v20.1:

1. First [upgrade to a production release of v19.2](../v19.2/upgrade-cockroach-version.html). Be sure to complete all the steps.

2. Then return to this page and perform a second rolling upgrade to v20.1.

If you are upgrading from any production release of v19.2, or from any earlier v20.1 release, you do not have to go through intermediate releases; continue to step 2.

## Step 2. Prepare to upgrade

Before starting the upgrade, complete the following steps.

### Check load balancing

Make sure your cluster is behind a [load balancer](recommended-production-settings.html#load-balancing), or your clients are configured to talk to multiple nodes. If your application communicates with a single node, stopping that node to upgrade its CockroachDB binary will cause your application to fail.

### Check cluster health

Verify the overall health of your cluster using the [Admin UI](admin-ui-overview.html). On the **Cluster Overview**:

  - Under **Node Status**, make sure all nodes that should be live are listed as such. If any nodes are unexpectedly listed as suspect or dead, identify why the nodes are offline and either restart them or [decommission](remove-nodes.html) them before beginning your upgrade. If there are dead and non-decommissioned nodes in your cluster, it will not be possible to finalize the upgrade (either automatically or manually).

  - Under **Replication Status**, make sure there are 0 under-replicated and unavailable ranges. Otherwise, performing a rolling upgrade increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability. Therefore, it's important to identify and resolve the cause of range under-replication and/or unavailability before beginning your upgrade.

  - In the **Node List**:
      - Make sure all nodes are on the same version. If any nodes are behind, upgrade them to the cluster's current version first, and then start this process over.
      - Make sure capacity and memory usage are reasonable for each node. Nodes must be able to tolerate some increase in case the new version uses more resources for your workload. Also go to **Metrics > Dashboard: Hardware** and make sure CPU percent is reasonable across the cluster. If there's not enough headroom on any of these metrics, consider [adding nodes](cockroach-start.html) to your cluster before beginning your upgrade.

### Review breaking changes

Review the [backward-incompatible changes in v20.1](../releases/v20.1.0.html#backward-incompatible-changes), and if any affect your application, make necessary changes.

### Let ongoing bulk operations finish

Make sure there are no [bulk imports](import.html) or [schema changes](online-schema-changes.html) in progress. These are complex operations that involve coordination across nodes and can increase the potential for unexpected behavior during an upgrade.

To check for ongoing imports or schema changes, use [`SHOW JOBS`](show-jobs.html#show-schema-changes) or check the [**Jobs** page](admin-ui-jobs-page.html) in the Admin UI.

{{site.data.alerts.callout_info}}
Once all nodes are running v20.1, but before the upgrade has been finalized, any schema changes still running will stop making progress, but [`SHOW JOBS`](show-jobs.html) and the [**Jobs** page](admin-ui-jobs-page.html) in the Admin UI will show them as running until the upgrade has been finalized. During this time, it will not be possible to manipulate these schema changes via [`PAUSE JOB`](pause-job.html)/[`RESUME JOB`](resume-job.html)/[`CANCEL JOB`](cancel-job.html) statements. Once the upgrade has been finalized, these schema changes will run to completion.

Note that this behavior is specific to upgrades from v19.2 to v20.1; it does not apply to other upgrades.
{{site.data.alerts.end}}

### Review temporary limitations

Once all nodes are running v20.1, but before the upgrade has been finalized:

- New [schema changes](online-schema-changes.html) will be blocked and return an error, with the exception of [`CREATE TABLE`](create-table.html) statements without foreign key references and no-op schema change statements that use `IF NOT EXISTS`. Update your application or tooling to prevent disallowed schema changes during this period. Once the upgrade has been finalized, new schema changes can resume.

- [`GRANT`](grant.html) and [`REVOKE`](revoke.html) statements will be blocked and return an error. This is because privileges are stored with table metadata and, therefore, privilege changes are considered schema changes, from an internal perspective. Update your application or tooling to prevent privilege changes during this period. Once the upgrade has been finalized, changes to user privileges can resume.

Note that these limitations are specific to upgrades from v19.2 to v20.1; they do not apply to other upgrades.

## Step 3. Decide how the upgrade will be finalized

{{site.data.alerts.callout_info}}
This step is relevant only when upgrading from v19.2.x to v20.1. For upgrades within the v20.1.x series, skip this step.
{{site.data.alerts.end}}

By default, after all nodes are running the new version, the upgrade process will be **auto-finalized**. This will enable certain [features and performance improvements introduced in v20.1](#features-that-require-upgrade-finalization). However, it will no longer be possible to perform a downgrade to v19.2. In the event of a catastrophic failure or corruption, the only option will be to start a new cluster using the old binary and then restore from one of the backups created prior to performing the upgrade. For this reason, **we recommend disabling auto-finalization** so you can monitor the stability and performance of the upgraded cluster before finalizing the upgrade, but note that you will need to follow all of the subsequent directions, including the manual finalization in [step 5](#step-5-finish-the-upgrade):

1. [Upgrade to v19.2](../v19.2/upgrade-cockroach-version.html), if you haven't already.

2. Start the [`cockroach sql`](cockroach-sql.html) shell against any node in the cluster.

3. Set the `cluster.preserve_downgrade_option` [cluster setting](cluster-settings.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING cluster.preserve_downgrade_option = '19.2';
    ~~~

    It is only possible to set this setting to the current cluster version.

### Features that require upgrade finalization

When upgrading from v19.2 to v20.1, certain features and performance improvements will be enabled only after finalizing the upgrade, including but not limited to:

- **Primary key changes:** After finalization, it will be possible to change the primary key of an existing table using the [`ALTER TABLE ... ALTER PRIMARY KEY`](../v20.1/alter-primary-key.html) statement, or using [`DROP CONSTRAINT` and then `ADD CONSTRAINT`](../v20.1/add-constraint.html#drop-and-add-a-primary-key-constraint) in the same transaction.

- **Additional authentication methods:** After finalization, it will be possible to set the `server.host_based_authentication.configuration` [cluster setting](../v20.1/cluster-settings.html) to `trust` or `reject` to unconditionally allow or deny matching connection attempts.

- **Password for the `root` user**: After finalization, it will be possible to use [`ALTER USER root WITH PASSWORD`](../v20.1/alter-user.html) to set a password for the `root` user.

- **Dropping indexes used by foreign keys:** After finalization, it will be possible to drop an index used by a foreign key constraint if another index exists that fulfills the [indexing requirements](../v20.1/foreign-key.html#rules-for-creating-foreign-keys).

- **Hash-sharded indexes:** After finalization, it will be possible to use [hash-sharded indexes](../v20.1/create-index.html#create-a-hash-sharded-secondary-index) to distribute sequential traffic uniformly across ranges, eliminating single-range hotspots and improving write performance on sequentially-keyed indexes. This is an experimental feature that must be enabled by setting the `experimental_enable_hash_sharded_indexes` session variable to `on`.

- **`CREATEROLE` and `NOCREATEROLE` privileges:** After finalization, it will be possible to [allow or disallow a user or role to create, alter, or drop other roles](create-user.html#allow-the-user-to-create-other-users) via the `CREATEROLE` or `NOCREATEROLE` privilege.

- **Nested transactions:** After finalization, it will be possible to create [nested transactions](transactions.html#nested-transactions) using [`SAVEPOINT`s](savepoint.html).

- **`TIMETZ` data type:** After finalization, it will be possible to use the [`TIMETZ`](../v20.1/time.html#timetz) data type to store a time of day with a time zone offset from UTC.

- **`TIME`/`TIMETZ` and `INTERVAL` precision:** After finalization, it will be possible to specify precision levels from 0 (seconds) to 6 (microseconds) for [`TIME`/`TIMETZ`](time.html#precision) and [`INTERVAL`](interval.html#precision) values.

## Step 4. Perform the rolling upgrade

For each node in your cluster, complete the following steps. Be sure to upgrade only one node at a time, and wait at least one minute after a node rejoins the cluster to upgrade the next node. Simultaneously upgrading more than one node increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability.

{{site.data.alerts.callout_danger}}
Once all nodes are running v20.1, but before the upgrade has been finalized, new [schema changes](online-schema-changes.html) will be blocked and return an error, with the exception of [`CREATE TABLE`](create-table.html) statements without foreign key references and no-op schema change statements that use `IF NOT EXISTS`. Be sure to update your application or tooling to prevent disallowed schema changes during the upgrade process.

Note that this behavior is specific to upgrades from v19.2 to v20.1; it does not apply to other upgrades.
{{site.data.alerts.end}}

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

1. Verify the node has rejoined the cluster through its output to [`stdout`](cockroach-start.html#standard-output) or through the [Admin UI](admin-ui-cluster-overview-page.html#node-status). 

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
This step is relevant only when upgrading from v19.2.x to v20.1. For upgrades within the v20.1.x series, skip this step.
{{site.data.alerts.end}}

If you disabled auto-finalization in [step 3](#step-3-decide-how-the-upgrade-will-be-finalized), monitor the stability and performance of your cluster for as long as you require to feel comfortable with the upgrade (generally at least a day) and remember to prevent new schema changes and changes to user privileges as mention [earlier](#review-temporary-limitations). If during this time you decide to roll back the upgrade, repeat the rolling restart procedure with the old binary.

Once you are satisfied with the new version:

1. Start the [`cockroach sql`](cockroach-sql.html) shell against any node in the cluster.

2. Re-enable auto-finalization:

    {% include copy-clipboard.html %}
    ~~~ sql
    > RESET CLUSTER SETTING cluster.preserve_downgrade_option;
    ~~~

3. Update your application or tooling to re-enable schema changes that were disallowed during the upgrade process. Note that this applies only to upgrades from v19.2 to v20.1. It does not apply to other upgrades.

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
