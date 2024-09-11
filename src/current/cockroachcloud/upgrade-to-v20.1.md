---
title: Upgrade to CockroachDB v20.1
summary: Learn how to upgrade your CockroachDB cluster to v20.1.
toc: true
docs_area: manage
---

Now that [CockroachDB v20.1]({% link releases/v20.1.md %}) is available, your [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) can upgrade your cluster directly from the CockroachDB {{ site.data.products.cloud }} Console. This page walks through the process.

{% include_cached youtube.html video_id="PKpCcAtXxjo" %}

## Step 1. Select your cluster size

The upgrade process depends on the number of nodes in your cluster. Select whether your cluster has multiple nodes or a single node:

<div class="filters filters-big clearfix">
  <button class="filter-button" data-scope="multi-node">Multi-node</button>
  <button class="filter-button" data-scope="single-node">Single-node</button>
</div>

## Step 2. Understand the process

<section class="filter-content" markdown="1" data-scope="multi-node">

In a multi-node cluster, the upgrade happens without interrupting the cluster's overall health and availability. One node is stopped and restarted with the new version, then the next, and so on, with a few minutes pause between each. In total, this "rolling upgrade" approach takes approximately 4-5 minutes per node and is possible due to CockroachDB's [multi-active availability]({% link {{site.current_cloud_version}}/multi-active-availability.md %}) design.

Approximately 72 hours after all nodes are running v20.1, the upgrade will be automatically finalized. This enables certain [features and performance improvements introduced in v20.1](#respect-temporary-limitations). Finalization also removes the ability to roll back to v19.2, so it's important to monitor your application during this 72-hour window and, if you see unexpected behavior, trigger a rollback from the CockroachDB {{ site.data.products.cloud }} Console. Also, there are some [temporary limitations](#review-temporary-limitations) during this 72-hour window, so if everything looks good, you'll have the choice to finalize the upgrade more quickly so as to lift these limitations.

</section>
<section class="filter-content" markdown="1" data-scope="single-node">

When you start the upgrade, the cluster will be unavailable for a few minutes while the node is stopped and restarted with v20.1.

Approximately 72 hours after the node has been restarted, the upgrade will be automatically finalized. This enables certain [features and performance improvements introduced in v20.1](#respect-temporary-limitations). Finalization also removes the ability to roll back to v19.2, so it's important to monitor your application during this 72-hour window and, if you see unexpected behavior, trigger a rollback from the CockroachDB {{ site.data.products.cloud }} Console. Also, there are some [temporary limitations](#review-temporary-limitations) during this 72-hour window, so if everything looks good, you'll have the choice to finalize the upgrade more quickly so as to lift these limitations.

</section>

## Step 3. Prepare to upgrade

Before starting the upgrade, it's important to complete the following steps.

<section class="filter-content" markdown="1" data-scope="single-node">

### Prepare for brief unavailability

Because your cluster will be unavailable while its single node is stopped and restarted with v20.1, prepare your application for this brief downtime, typically a few minutes. Also during this time, the [**SQL Users**]({% link cockroachcloud/managing-access.md %}#create-a-sql-user) and [**Tools**]({% link cockroachcloud/tools-page.md %}) pages in the CockroachDB {{ site.data.products.cloud }} Console will be disabled.

</section>

### Review breaking changes

Review the following list of backward-incompatible changes in v20.1, and if any affect your application, make necessary changes:

- The `extract()` [built-in function]({% link {{site.current_cloud_version}}/functions-and-operators.md %}) with sub-second arguments (millisecond, microsecond) is now PostgreSQL-compatible and returns the total number of seconds in addition to sub-seconds instead of returning only sub-seconds.

- Casting intervals to integers and floats is now PostgreSQL-compatible and values a year at 365.25 days in seconds instead of 365 days.

- The combination of the [`CHANGEFEED`]({% link {{site.current_cloud_version}}/change-data-capture-overview.md %}) options `format=experimental_avro`, `envelope=key_only`, and `updated` is now rejected. This is because the use of `key_only` prevents any rows with updated fields from being emitted, which renders the `updated` option meaningless.

- The `cockroach user` CLI command has been removed. It was previously deprecated in CockroachDB v19.2. Note that a v19.2 client (supporting `cockroach user`) can still operate user accounts in a v20.1 server.

- The [`GRANT`]({% link {{site.current_cloud_version}}/grant.md %}) and [`REVOKE`]({% link {{site.current_cloud_version}}/revoke.md %}) statements now require that the requesting user already have the target privileges themselves. For example, `GRANT SELECT ON t TO foo` requires that the requesting user already have the `SELECT` privilege on `t`.

### Let ongoing bulk operations finish

Make sure there are no [bulk imports]({% link {{site.current_cloud_version}}/import-into.md %}) or [schema changes]({% link {{site.current_cloud_version}}/online-schema-changes.md %}) in progress. These are complex operations that can increase the potential for unexpected behavior during an upgrade.</span>

To check for ongoing bulk operations, use [`SHOW JOBS`]({% link {{ site.current_cloud_version }}/show-jobs.md %}#show-schema-changes) or check the [**Jobs** page]({% link {{site.current_cloud_version}}/ui-jobs-page.md %}) in the DB Console.

{{site.data.alerts.callout_info}}
Once your cluster is running v20.1, but before the upgrade has been finalized, any ongoing schema changes will stop making progress, but [`SHOW JOBS`]({% link {{site.current_cloud_version}}/show-jobs.md %}) and the [**Jobs** page]({% link {{site.current_cloud_version}}/ui-jobs-page.md %}) in the DB Console will show them as running until the upgrade has been finalized. During this time, it will not be possible to manipulate these schema changes via [`PAUSE JOB`]({% link {{site.current_cloud_version}}/pause-job.md %})/[`RESUME JOB`]({% link {{site.current_cloud_version}}/resume-job.md %})/[`CANCEL JOB`]({% link {{site.current_cloud_version}}/cancel-job.md %}) statements. Once the upgrade has been finalized, these schema changes will run to completion.

Note that this behavior is specific to upgrades from v19.2 to v20.1; it does not apply to other upgrades.
{{site.data.alerts.end}}

### Review temporary limitations

Once your cluster is running v20.1, but before the upgrade has been finalized:

- New [schema changes]({% link {{site.current_cloud_version}}/online-schema-changes.md %}) will be blocked and return an error, with the exception of [`CREATE TABLE`]({% link {{site.current_cloud_version}}/create-table.md %}) statements without foreign key references and no-op schema change statements that use `IF NOT EXISTS`. Update your application or tooling to prevent disallowed schema changes during this period. Once the upgrade has been finalized, new schema changes can resume.

- [`GRANT`]({% link {{site.current_cloud_version}}/grant.md %}) and [`REVOKE`]({% link {{site.current_cloud_version}}/revoke.md %}) statements will be blocked and return an error. This is because privileges are stored with table metadata and, therefore, privilege changes are considered schema changes, from an internal perspective. Update your application or tooling to prevent privilege changes during this period. Once the upgrade has been finalized, changes to user privileges can resume.

   - This limitation also means that you will not be able to add or delete SQL users, or change existing users' passwords, on the [**SQL Users**]({% link cockroachcloud/managing-access.md %}#create-a-sql-user) tab of the CockroachDB {{ site.data.products.cloud }} Console until the upgrade has been finalized. Attempting to do so will result in an error.

{{site.data.alerts.callout_info}}
Note that these limitations are specific to upgrades from v19.2 to v20.1; they do not apply to other upgrades.
{{site.data.alerts.end}}

## Step 4. Start the upgrade

To start the upgrade process:

1. [Sign in](https://cockroachlabs.cloud/) to your CockroachDB {{ site.data.products.cloud }} account.

1. In the **Clusters** list, select the cluster you want to upgrade.

1. Select **Actions > Upgrade cluster**.

1. On the **Upgrade your cluster** dialog, confirm that you have reviewed the pre-upgrade guidance and then click **Start Upgrade**.

<section class="filter-content" markdown="1" data-scope="multi-node">
As mentioned earlier, your cluster will be upgraded one node at a time without interrupting the cluster's overall health and availability. This "rolling upgrade" approach will take approximately 4-5 minutes per node.
</section>

<section class="filter-content" markdown="1" data-scope="single-node">
As mentioned earlier, your single-node cluster will be unavailable for a few minutes while the node is stopped and restarted with v20.1.
</section>

## Step 5. Monitor the upgrade

Once your cluster is running v20.1, you will have approximately 72 hours before the upgrade is automatically finalized. During this time, it is important to monitor your application and respect temporary limitations.

### Monitor your application

Use the [DB Console]({% link cockroachcloud/tools-page.md %}) or your own tooling to monitor your application for any unexpected behavior.

- If everything looks good, you can wait for the upgrade to automatically finalize or you can [trigger finalization more quickly](#finalize-the-upgrade).

- If you see unexpected behavior, you can [rollback to v19.2](#roll-back-the-upgrade). This option is available only during the 72-hour window. If you see unexpected behavior after the upgrade has been finalized, you will have to [reach out to support](https://support.cockroachlabs.com/hc/requests/new).

### Respect temporary limitations

Before your upgrade has been finalized, remember to prevent new schema changes and changes to user privileges as mention [earlier](#review-temporary-limitations).

Also, most v20.1 features can be used right way, but there are some that will be enabled only after the upgrade has been finalized. Attempting to use these features before then will result in errors:

- **Primary key changes:** After finalization, it will be possible to change the primary key of an existing table using the [`ALTER TABLE ... ALTER PRIMARY KEY`]({% link {{site.current_cloud_version}}/alter-table.md %}#alter-primary-key) statement, or using `DROP CONSTRAINT` and then `ADD CONSTRAINT` in the same transaction.

- **Dropping indexes used by foreign keys:** After finalization, it will be possible to drop an index used by a foreign key constraint if another index exists that fulfills the [indexing requirements]({% link {{ site.current_cloud_version }}/foreign-key.md %}#rules-for-creating-foreign-keys).

- **Hash-sharded indexes:** After finalization, it will be possible to use [hash-sharded indexes]({% link {{ site.current_cloud_version }}/create-index.md %}#create-a-hash-sharded-secondary-index) to distribute sequential traffic uniformly across ranges, eliminating single-range hotspots and improving write performance on sequentially-keyed indexes. This is an experimental feature that must be enabled by setting the `experimental_enable_hash_sharded_indexes` session variable to `on`.

- **`CREATEROLE` and `NOCREATEROLE` privileges:** After finalization, it will be possible to [allow or disallow a user or role to create, alter, or drop other roles]({% link {{ site.current_cloud_version }}/create-user.md %}) via the `CREATEROLE` or `NOCREATEROLE` privilege.

- **Nested transactions:** After finalization, it will be possible to create [nested transactions]({% link {{ site.current_cloud_version }}/transactions.md %}#nested-transactions) using [`SAVEPOINT`s]({% link {{site.current_cloud_version}}/savepoint.md %}).

- **`TIMETZ` data type:** After finalization, it will be possible to use the [`TIMETZ`]({% link {{ site.current_cloud_version }}/time.md %}#timetz) data type to store a time of day with a time zone offset from UTC.

- **`TIME`/`TIMETZ` and `INTERVAL` precision:** After finalization, it will be possible to specify precision levels from 0 (seconds) to 6 (microseconds) for `TIME`/`TIMETZ` and [`INTERVAL`]({% link {{ site.current_cloud_version }}/interval.md %}#precision) values.

## Step 6. Finish the upgrade

During the 72-hour window before the upgrade is automatically finalized, if you see unexpected behavior, you can trigger a rollback to v19.2. If everything looks good, you also have the choice to finalize the upgrade more quickly so as to lift the [temporary limitations](#review-temporary-limitations) in place during the upgrade.

### Finalize the upgrade

To finalize the upgrade, click **Finalize** in the banner at the top of the CockroachDB {{ site.data.products.cloud }} Console, and then click **Finalize upgrade**.

At this point, all [temporary limitations](#review-temporary-limitations) are lifted, and all v20.1 features are available for use. However, it's no longer possible to roll back to v19.2. If you see unexpected behavior, [reach out to support](https://support.cockroachlabs.com/hc/requests/new).

### Roll back the upgrade

To stop the upgrade and roll back to v19.2, click **Roll back** in the banner at the top of the CockroachDB {{ site.data.products.cloud }} Console, and then click **Roll back upgrade**.

<section class="filter-content" markdown="1" data-scope="multi-node">
During rollback, nodes will be reverted to v19.2 one at a time without interrupting the cluster's health and availability.
</section>

<section class="filter-content" markdown="1" data-scope="single-node">
Because your cluster contains a single node, the cluster will be briefly unavailable while the node is stopped and restarted with v19.2. Be sure to prepare for this brief unavailability before starting the rollback.
</section>

## See also

- [Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %})
- [CockroachDB v20.1 Release Notes]({% link releases/v20.1.md %})
