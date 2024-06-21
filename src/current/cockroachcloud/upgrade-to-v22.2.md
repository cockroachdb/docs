---
title: Upgrade to CockroachDB v22.2
summary: Learn how to upgrade your CockroachDB cluster to v22.2.
toc: true
docs_area: manage
page_version: v22.2
prev_version: v22.1
---

{% capture previous_version_numeric %}{{ page.prev_version | remove_first: 'v' }}{% endcapture %}
{% capture major_version_numeric %}{{ page.page_version | remove_first: 'v' }}{% endcapture %}

Now that [CockroachDB v22.2](https://www.cockroachlabs.com/docs/releases/v22.2) is available, an [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) can upgrade your CockroachDB {{ site.data.products.dedicated }} cluster from the CockroachDB {{ site.data.products.cloud }} Console. This page guides you through the process for an Admin.

{{site.data.alerts.callout_success}}
Upgrading a CockroachDB {{ site.data.products.dedicated }} cluster to a new major version is opt-in. Before proceeding, review the CockroachDB {{ site.data.products.cloud }} [upgrade policy]({% link cockroachcloud/upgrade-policy.md %}).
{{site.data.alerts.end}}

## Step 1. Verify that you can upgrade

To upgrade to v22.2, you must be running v22.1. If you are not running v22.1, first [upgrade to v22.1]({% link cockroachcloud/upgrade-to-v22.1.md %}). Then return to this page and continue to [Step 2](#step-2-select-your-cluster-size).

## Step 2. Select your cluster size

The upgrade process depends on the number of nodes in your cluster. Select whether your cluster has multiple nodes or a single node:

<div class="filters filters-big clearfix">
  <button class="filter-button" data-scope="multi-node">Multi-node</button>
  <button class="filter-button" data-scope="single-node">Single-node</button>
</div>

## Step 3. Understand the upgrade process

In a multi-node cluster, the upgrade does not interrupt the cluster's overall health and availability. CockroachDB {{ site.data.products.cloud }} stops one node at a time and restarts it with the new version, waits a few minutes to observe the upgraded node's behavior, then moves on to the next node. This "rolling upgrade" takes approximately 4-5 minutes per node and is enabled by CockroachDB's [multi-active availability](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/multi-active-availability) design.
</section>

<section class="filter-content" markdown="1" data-scope="single-node">
When you start the upgrade, the cluster will be unavailable for a few minutes while the node is stopped and restarted with v22.2.
</section>

Approximately 72 hours after all nodes are running {{ page.page_version }}, the upgrade will be automatically [finalized]({% link {{ page.page_version }}/upgrade-cockroach-version.md %}#step-6-finish-the-upgrade). It's important to monitor your cluster and applications during this 72-hour window, so that you can [roll back the upgrade](#roll-back-the-upgrade) from the CockroachDB {{ site.data.products.cloud }} Console if you see unexpected behavior. Finalization enables certain [features and performance improvements introduced in {{ page.page_version }}](#expect-temporary-limitations). When finalization is complete, it is no longer possible to roll back to {{ page.prev_version }}.

{{site.data.alerts.callout_info}}
If you choose to roll back a major version upgrade, your cluster will be rolled back to the latest patch release of {{ page.prev_version }}, which may differ from the patch release you were running before you initiated the upgrade. To learn more, refer to [CockroachDB Cloud Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}).
{{site.data.alerts.end}}

When finalization begins, a series of migration jobs run to enable certain types of features and changes in the new major version that cannot be rolled back. These include changes to system schemas, indexes, and descriptors, and [enabling certain types of improvements and new features](#expect-temporary-limitations). Until the upgrade is finalized, these features and functions will not be available and the command `SHOW CLUSTER SETTING version` will return `{{ previous_version_numeric }}`.

You can monitor the process of the migration in the CockroachDB {{ site.data.products.cloud }} [**Jobs** page]({% link cockroachcloud/jobs-page.md %}). Migration jobs have names in the format `{{ major_version_numeric }}-{migration-id}`. If a migration job fails or stalls, Cockroach Labs can use the migration ID to help diagnose and troubleshoot the problem. Each major version has different migration jobs with different IDs.

Finalization is complete when all migration jobs have completed. After migration is complete, the command `SHOW CLUSTER SETTING version` will return `{{ major_version_numeric }}`.

## Step 4. Prepare to upgrade

Before starting the upgrade, complete the following steps.

<section class="filter-content" markdown="1" data-scope="single-node">

### Prepare for brief unavailability

Your cluster will be unavailable while its single node is stopped and restarted with v22.2. Prepare your application for this brief downtime, typically a few minutes.

The [**SQL Users**]({% link cockroachcloud/managing-access.md %}#create-a-sql-user) and [**Tools**]({% link cockroachcloud/tools-page.md %}) tabs in the CockroachDB {{ site.data.products.cloud }} Console will also be disabled during this time.

</section>

### Review breaking changes

{% comment %} Be careful with this logic and the page-level variable page_version {% endcomment %}
{% assign rd = site.data.versions | where_exp: "rd", "rd.major_version == page.page_version" | first %}

Review the [backward-incompatible changes in {{ page.page_version }}](https://www.cockroachlabs.com/docs/releases/{{ page.page_version }}{% unless rd.release_date == "N/A" or rd.release_date > today %}#{{ page.page_version | replace: ".", "-" }}-0-backward-incompatible-changes{% endunless %}) and [deprecated features](https://www.cockroachlabs.com/docs/releases/{{ page.page_version }}#{% unless rd.release_date == "N/A" or rd.release_date > today %}{{ page.page_version | replace: ".", "-" }}-0-deprecations{% endunless %}). If any affect your applications, make the necessary changes before proceeding.

## Step 5. Start the upgrade

To start the upgrade process:

1. [Sign in](https://cockroachlabs.cloud/) to your CockroachDB {{ site.data.products.cloud }} account.

1. In the **Clusters** list, select the cluster you want to upgrade.

1. Select **Actions > Upgrade major version**.

1. In the **Upgrade your cluster** dialog, review the pre-upgrade message and then click **Start Upgrade**.

<section class="filter-content" markdown="1" data-scope="multi-node">
Your cluster will be upgraded one node at a time without interrupting the cluster's overall health and availability. This "rolling upgrade" will take approximately 4-5 minutes per node.
</section>

<section class="filter-content" markdown="1" data-scope="single-node">
Your single-node cluster will be unavailable for a few minutes while the node is stopped and restarted with v22.2.
</section>

## Step 6. Monitor the upgrade

Once your cluster is running v22.2, you will have approximately 72 hours before the upgrade is automatically finalized. During this time, it is important to [monitor your application](#monitor-your-application) and [respect temporary limitations](#expect-temporary-limitations).

If you see unexpected behavior, you can [roll back](#roll-back-the-upgrade) to v22.1 during the 72-hour window.

### Monitor your application

Use the [DB Console]({% link cockroachcloud/tools-page.md %}) or your own tooling to monitor your application for any unexpected behavior.

- If everything looks good, you can wait for the upgrade to automatically finalize or you can [manually trigger finalization](#finalize-the-upgrade).

- If you see unexpected behavior, you can [roll back to v22.1](#roll-back-the-upgrade) during the 72-hour window.

### Expect temporary limitations

Most v22.2 features can be used right away, but some will be enabled only after the upgrade has been finalized. Attempting to use these features before finalization will result in errors:

- The [`CREATE FUNCTION`](https://www.cockroachlabs.com/docs/v22.2/create-function) statement creates [user-defined functions](https://www.cockroachlabs.com/docs/v22.2/user-defined-functions).
- [Inverted trigram indexes](https://www.cockroachlabs.com/docs/v22.2/trigram-indexes) are a type of inverted index used to efficiently search for strings in large tables without providing an exact search term (fuzzy search).
- [Predicates and projections in `CREATE CHANGEFEED` statements](https://www.cockroachlabs.com/docs/v22.2/create-changefeed). Projections allow users to emit specific columnar data, including computed columns, while predicates (i.e., filters) allow users to restrict the data that emits to only those events that match the filter.

For an expanded list of features included in the v22.2 release, see the [v22.2 release notes](https://www.cockroachlabs.com/docs/releases/v22.2).

### Roll back the upgrade

If you see unexpected behavior, you can roll back the upgrade during the 72-hour window.

To stop the upgrade and roll back to v22.1, click **Roll back** in the banner at the top of the CockroachDB {{ site.data.products.cloud }} Console, and then click **Roll back upgrade**.

<section class="filter-content" markdown="1" data-scope="multi-node">
During rollback, nodes will be reverted to v22.1 one at a time without interrupting the cluster's health and availability.
</section>

<section class="filter-content" markdown="1" data-scope="single-node">
Because your cluster contains a single node, the cluster will be briefly unavailable while the node is stopped and restarted with v22.1. Be sure to [prepare for this brief unavailability](#prepare-for-brief-unavailability) before starting the rollback.
</section>

## Step 7. Complete the upgrade

If everything looks good, you can wait for the upgrade to automatically finalize, or you can manually finalize the upgrade to lift the [temporary limitations](#expect-temporary-limitations) on the cluster more quickly.

### Finalize the upgrade

The upgrade is automatically finalized after 72 hours.

To manually finalize the upgrade, click **Finalize** in the banner at the top of the CockroachDB {{ site.data.products.cloud }} Console, and then click **Finalize upgrade**.

After finalization, all [temporary limitations](#expect-temporary-limitations) will be lifted, and all v22.2 features are available for use. However, it will no longer be possible to roll back to v22.1. If you see unexpected behavior after the upgrade has been finalized, [contact support](https://support.cockroachlabs.com/hc/requests/new).

After the upgrade to {{ page.version.version }} is finalized, you may notice an increase in compaction activity due to a background migration within the storage engine. To observe the migration's progress, check the **Compactions** section of the [Storage Dashboard](https://www.cockroachlabs.com/docs/v22.2/ui-storage-dashboard) in the DB Console or monitor the `storage.marked-for-compaction-files` time-series metric. When the metric's value nears or reaches `0`, the migration is complete and compaction activity will return to normal levels.

## See also

- [Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %})
- [CockroachDB v22.2 Release Notes](https://www.cockroachlabs.com/docs/releases/v22.2)
