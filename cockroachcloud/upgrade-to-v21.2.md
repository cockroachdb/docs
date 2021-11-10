---
title: Upgrade to CockroachDB v21.2
summary: Learn how to upgrade your CockroachDB cluster to v21.2.
toc: true
---

Now that [CockroachDB v21.2](../releases/v21.2.0.html) is available, a [Console Admin](console-access-management.html#console-admin) can upgrade your {{ site.data.products.dedicated }} cluster from the {{ site.data.products.db }} Console. This page walks through the process for an Admin.

{{site.data.alerts.callout_success}}
Upgrading a {{ site.data.products.dedicated }} cluster to a new major version is opt-in. Before proceeding, review the {{ site.data.products.db }} [upgrade policy](upgrade-policy.html).
{{site.data.alerts.end}}

## Step 1. Verify that you can upgrade

To upgrade to v21.2, you must be running v21.1. If you are not running v21.1, first [upgrade to v21.1](upgrade-to-v21.1.html). Then return to this page and continue to [Step 2](#step-2-select-your-cluster-size).

## Step 2. Select your cluster size

The upgrade process depends on the number of nodes in your cluster. Select whether your cluster has multiple nodes or a single node:

<div class="filters filters-big clearfix">
  <button class="filter-button" data-scope="multi-node">Multi-node</button>
  <button class="filter-button" data-scope="single-node">Single-node</button>
</div>

## Step 3. Understand the upgrade process

<section class="filter-content" markdown="1" data-scope="multi-node">
In a multi-node cluster, the upgrade does not interrupt the cluster's overall health and availability. One node is stopped and restarted with the new version, then the next, and so on, pausing for a few minutes between each node. This "rolling upgrade" takes approximately 4-5 minutes per node and is enabled by CockroachDB's [multi-active availability](../{{site.versions["stable"]}}/multi-active-availability.html) design.

Approximately 72 hours after all nodes are running v21.2, the upgrade will be automatically finalized. This enables certain [features and performance improvements introduced in v21.2](#respect-temporary-limitations). Finalization also removes the ability to roll back to v21.1, so it's important to monitor your application during this 72-hour window and, if you see unexpected behavior, [roll back the upgrade](#roll-back-the-upgrade) from the {{ site.data.products.db }} Console.
</section>

<section class="filter-content" markdown="1" data-scope="single-node">
When you start the upgrade, the cluster will be unavailable for a few minutes while the node is stopped and restarted with v21.2.

Approximately 72 hours after the node has been restarted, the upgrade will be automatically finalized. This enables certain [features and performance improvements introduced in v21.2](#respect-temporary-limitations). Finalization also removes the ability to roll back to v21.1, so it's important to monitor your application during this 72-hour window and, if you see unexpected behavior, [roll back the upgrade](#roll-back-the-upgrade) from the {{ site.data.products.db }} Console.
</section>

## Step 4. Prepare to upgrade

 Before starting the upgrade, complete the following steps.

<section class="filter-content" markdown="1" data-scope="single-node">

### Prepare for brief unavailability

Your cluster will be unavailable while its single node is stopped and restarted with v21.2. Prepare your application for this brief downtime, typically a few minutes.

The [**SQL Users**](user-authorization.html#create-a-sql-user) and [**Monitoring**](monitoring-page.html) tabs in the {{ site.data.products.db }} Console will also be disabled during this time.

</section>

### Review breaking changes

Review the [backward-incompatible changes in v21.2](../releases/v21.2.0.html#backward-incompatible-changes). If any affect your application, make necessary changes.

## Step 5. Start the upgrade

To start the upgrade process:

1. [Sign in](https://cockroachlabs.cloud/) to your {{ site.data.products.db }} account.

2. In the **Clusters** list, select the cluster you want to upgrade.

3. Select **Actions > Upgrade major version**. 

4. In the **Upgrade your cluster** dialog, review the pre-upgrade message and then click **Start Upgrade**.

<section class="filter-content" markdown="1" data-scope="multi-node">
Your cluster will be upgraded one node at a time without interrupting the cluster's overall health and availability. This "rolling upgrade" will take approximately 4-5 minutes per node.
</section>

<section class="filter-content" markdown="1" data-scope="single-node">
Your single-node cluster will be unavailable for a few minutes while the node is stopped and restarted with v21.2.
</section>

## Step 6. Monitor the upgrade

Once your cluster is running v21.2, you will have approximately 72 hours before the upgrade is automatically finalized. During this time, it is important to [monitor your application](#monitor-your-application) and [respect temporary limitations](#respect-temporary-limitations).

If you see unexpected behavior, you can [roll back](#roll-back-the-upgrade) to v21.1 during the 72-hour window. 

### Monitor your application

Use the [DB Console](monitoring-page.html) or your own tooling to monitor your application for any unexpected behavior.

- If everything looks good, you can wait for the upgrade to automatically finalize or you can [manually trigger finalization](#finalize-the-upgrade).

- If you see unexpected behavior, you can [roll back to v21.1](#roll-back-the-upgrade) during the 72-hour window.

### Respect temporary limitations

Most v21.2 features can be used right away, but some will be enabled only after the upgrade has been finalized. Attempting to use these features before finalization will result in errors:

- Expression indexes
- Default privileges on database objects
- Bounded staleness reads
- Database placement using the `ALTER DATABASE ... PLACEMENT RESTRICTED` syntax
- `GENERATED {ALWAYS | BY DEFAULT} AS IDENTITY` syntax in column definitions
- `ON UPDATE` column expressions

### Roll back the upgrade

If you see unexpected behavior, you can roll back the upgrade during the 72-hour window.

To stop the upgrade and roll back to v21.1, click **Roll back** in the banner at the top of the {{ site.data.products.db }} Console, and then click **Roll back upgrade**.

<section class="filter-content" markdown="1" data-scope="multi-node">
During rollback, nodes will be reverted to v21.1 one at a time without interrupting the cluster's health and availability.
</section>

<section class="filter-content" markdown="1" data-scope="single-node">
Because your cluster contains a single node, the cluster will be briefly unavailable while the node is stopped and restarted with v21.1. Be sure to [prepare for this brief unavailability](#prepare-for-brief-unavailability) before starting the rollback.
</section>

## Step 7. Complete the upgrade

If everything looks good, you can wait for the upgrade to automatically finalize, or you can manually trigger finalization to lift the [temporary limitations](#respect-temporary-limitations) on the cluster more quickly.

### Finalize the upgrade

The upgrade is automatically finalized after 72 hours. 

To manually finalize the upgrade, click **Finalize** in the banner at the top of the {{ site.data.products.db }} Console, and then click **Finalize upgrade**.

After finalization, all [temporary limitations](#respect-temporary-limitations) will be lifted, and all v21.2 features are available for use. However, it will no longer be possible to roll back to v21.1. If you see unexpected behavior after the upgrade has been finalized, [contacts support](https://support.cockroachlabs.com/hc/en-us/requests/new).

## See also

- [Upgrade Policy](upgrade-policy.html)
- [CockroachDB v21.2 Release Notes](../releases/v21.2.0.html)
