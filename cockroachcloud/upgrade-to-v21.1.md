---
title: Upgrade to CockroachDB v21.1
summary: Learn how to upgrade your CockroachDB cluster to v21.1.
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
toc: true
docs_area: manage
---

Now that [CockroachDB v21.1](../releases/v21.1.html) is available, your [Console Admin](console-access-management.html#console-admin) can upgrade your cluster directly from the {{ site.data.products.db }} Console. This page guides you through the process.

## Step 1. Verify that you can upgrade

To upgrade to v21.1, you must be running v20.2. If you are not running v20.2, [upgrade to v20.2](upgrade-to-v20.2.html) and then return to this page and continue to Step 2.

## Step 2. Select your cluster size

The upgrade process depends on the number of nodes in your cluster. Select whether your cluster has multiple nodes or a single node:

<div class="filters filters-big clearfix">
  <button class="filter-button" data-scope="multi-node">Multi-node</button>
  <button class="filter-button" data-scope="single-node">Single-node</button>
</div>

## Step 3. Understand the process

<section class="filter-content" markdown="1" data-scope="multi-node">

In a multi-node cluster, the upgrade happens without interrupting the cluster's overall health and availability. One node is stopped and restarted with the new version, then the next, and so on, with a few minutes pause between each. In total, this "rolling upgrade" approach takes approximately 4-5 minutes per node and is possible due to CockroachDB's [multi-active availability](../{{site.current_cloud_version}}/multi-active-availability.html) design.

Approximately 72 hours after all nodes are running v21.1, the upgrade will be automatically finalized. This enables certain [features and performance improvements introduced in v21.1](#respect-temporary-limitations). Finalization also removes the ability to roll back to v20.2, so it's important to monitor your application during this 72-hour window and, if you see unexpected behavior, trigger a rollback from the {{ site.data.products.db }} Console.

</section>
<section class="filter-content" markdown="1" data-scope="single-node">

When you start the upgrade, the cluster will be unavailable for a few minutes while the node is stopped and restarted with v21.1.

Approximately 72 hours after the node has been restarted, the upgrade will be automatically finalized. This enables certain [features and performance improvements introduced in v21.1](#respect-temporary-limitations). Finalization also removes the ability to roll back to v20.2, so it's important to monitor your application during this 72-hour window and, if you see unexpected behavior, trigger a rollback from the {{ site.data.products.db }} Console.

</section>

## Step 4. Prepare to upgrade

 Before starting the upgrade, it's important to complete the following steps.

<section class="filter-content" markdown="1" data-scope="single-node">

### Prepare for brief unavailability

Because your cluster will be unavailable while its single node is stopped and restarted with v21.1, prepare your application for this brief downtime, typically a few minutes. Also during this time, the [**SQL Users**](managing-access.html#create-a-sql-user) and [**Tools**](tools-page.html) tabs in the {{ site.data.products.db }} Console will be disabled.

</section>

### Review breaking changes

Review the [backward-incompatible changes in v21.1](../releases/v21.1.html#v21-1-0-backward-incompatible-changes), and if any affect your application, make necessary changes.

## Step 5. Start the upgrade

To start the upgrade process:

1. [Sign in](https://cockroachlabs.cloud/) to your {{ site.data.products.db }} account.

1. In the **Clusters** list, select the cluster you want to upgrade.

1. Select **Actions > Upgrade cluster**.

1. On the **Upgrade your cluster** dialog, confirm that you have reviewed the pre-upgrade guidance and then click **Start Upgrade**.

<section class="filter-content" markdown="1" data-scope="multi-node">
As mentioned earlier, your cluster will be upgraded one node at a time without interrupting the cluster's overall health and availability. This "rolling upgrade" approach will take approximately 4-5 minutes per node.
</section>

<section class="filter-content" markdown="1" data-scope="single-node">
As mentioned earlier, your single-node cluster will be unavailable for a few minutes while the node is stopped and restarted with v20.2.
</section>

## Step 6. Monitor the upgrade

Once your cluster is running v21.1, you will have approximately 72 hours before the upgrade is automatically finalized. During this time, it is important to monitor your application and respect temporary limitations.

### Monitor your application

Use the [DB Console](tools-page.html) or your own tooling to monitor your application for any unexpected behavior.

- If everything looks good, you can wait for the upgrade to automatically finalize or you can [trigger finalization more quickly](#finalize-the-upgrade).

- If you see unexpected behavior, you can [rollback to v20.2](#roll-back-the-upgrade). This option is available only during the 72-hour window. If you see unexpected behavior after the upgrade has been finalized, you will have to [reach out to support](https://support.cockroachlabs.com/hc/en-us/requests/new).

### Respect temporary limitations

Most v21.1 features can be used right away, but there are some that will be enabled only after the upgrade has been finalized. Attempting to use these features before then will result in errors:

- **Improved multi-region features:** After finalization, it will be possible to use new and improved [multi-region features](../v21.1/multiregion-overview.html), such as the ability to set database regions, survival goals, and table localities. Internal capabilities supporting these features, such as [non-voting replicas](../v21.1/architecture/replication-layer.html#non-voting-replicas) and [non-blocking transactions](../v21.1/architecture/transaction-layer.html#non-blocking-transactions), will be available after finalization as well.

- **Empty arrays in GIN indexes:** After finalization, newly created [GIN indexes](../v21.1/inverted-indexes.html) will contain rows containing empty arrays in [`ARRAY`](../v21.1/array.html) columns, which allows the indexes to be used for more queries. Note, however, that rows containing `NULL` values in an indexed column will still not be included in GIN indexes.

- **Virtual computed columns:** After finalization, it will be possible to use the `VIRTUAL` keyword to define [virtual computed columns](../v21.1/computed-columns.html).

- **Changefeed support for primary key changes:** After finalization, [changefeeds](../v21.1/stream-data-out-of-cockroachdb-using-changefeeds.html) will detect primary key changes.

## Step 7. Finish the upgrade

During the 72-hour window before the upgrade is automatically finalized, if you see unexpected behavior, you can trigger a rollback to v20.2. If everything looks good, you also have the choice to finalize the upgrade more quickly so as to lift the [temporary limitations](#respect-temporary-limitations) in place during the upgrade.

### Finalize the upgrade

To finalize the upgrade, click **Finalize** in the banner at the top of the {{ site.data.products.db }} Console, and then click **Finalize upgrade**.

At this point, all [temporary limitations](#respect-temporary-limitations) are lifted, and all v21.1 features are available for use. However, it's no longer possible to roll back to v20.2. If you see unexpected behavior, [reach out to support](https://support.cockroachlabs.com/hc/en-us/requests/new).

### Roll back the upgrade

To stop the upgrade and roll back to v20.2, click **Roll back** in the banner at the top of the {{ site.data.products.db }} Console, and then click **Roll back upgrade**.

<section class="filter-content" markdown="1" data-scope="multi-node">
During rollback, nodes will be reverted to v20.2 one at a time without interrupting the cluster's health and availability.
</section>

<section class="filter-content" markdown="1" data-scope="single-node">
Because your cluster contains a single node, the cluster will be briefly unavailable while the node is stopped and restarted with v21.1. Be sure to prepare for this brief unavailability before starting the rollback.
</section>

## See also

- [Upgrade Policy](upgrade-policy.html)
- [CockroachDB v21.1 Release Notes](../releases/v21.1.html)
