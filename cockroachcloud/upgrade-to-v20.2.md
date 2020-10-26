---
title: Upgrade to CockroachDB v20.1
summary:
toc: true
redirect_from:
- ../stable/cockroachcloud-upgrade-to-v20.1.html
- upgrade-to-v20.1.html
---

Now that [CockroachDB v20.2](https://www.cockroachlabs.com/docs/releases/v20.2.0.html) is available, your [Console Admin](console-access-management.html#console-admin) can upgrade your cluster directly from the CockroachCloud Console. This page walks through the process.

## Step 1. Select your cluster size

The upgrade process depends on the number of nodes in your cluster. Select whether your cluster has multiple nodes or a single node:

<div class="filters filters-big clearfix">
  <button class="filter-button" data-scope="multi-node">Multi-node</button>
  <button class="filter-button" data-scope="single-node">Single-node</button>
</div>

## Step 2. Understand the process

<section class="filter-content" markdown="1" data-scope="multi-node">

In a multi-node cluster, the upgrade happens without interrupting the cluster's overall health and availability. One node is stopped and restarted with the new version, then the next, and so on, with a few minutes pause between each. In total, this "rolling upgrade" approach takes approximately 4-5 minutes per node and is possible due to CockroachDB's [multi-active availability](../stable/multi-active-availability.html) design.

Approximately 72 hours after all nodes are running v20.2, the upgrade will be automatically finalized. This enables certain [features and performance improvements introduced in v20.2](#respect-temporary-limitations). Finalization also removes the ability to roll back to v20.1, so it's important to monitor your application during this 72-hour window and, if you see unexpected behavior, trigger a rollback from the CockroachCloud Console. Also, there are some [temporary limitations](#review-temporary-limitations) during this 72-hour window, so if everything looks good, you'll have the choice to finalize the upgrade more quickly so as to lift these limitations.

</section>
<section class="filter-content" markdown="1" data-scope="single-node">

When you start the upgrade, the cluster will be unavailable for a few minutes while the node is stopped and restarted with v20.2.

Approximately 72 hours after the node has been restarted, the upgrade will be automatically finalized. This enables certain [features and performance improvements introduced in v20.2](#respect-temporary-limitations). Finalization also removes the ability to roll back to v20.1, so it's important to monitor your application during this 72-hour window and, if you see unexpected behavior, trigger a rollback from the CockroachCloud Console. Also, there are some [temporary limitations](#review-temporary-limitations) during this 72-hour window, so if everything looks good, you'll have the choice to finalize the upgrade more quickly so as to lift these limitations.

</section>

## Step 3. Prepare to upgrade

 Before starting the upgrade, it's important to complete the following steps.

<section class="filter-content" markdown="1" data-scope="single-node">

### Prepare for brief unavailability

Because your cluster will be unavailable while its single node is stopped and restarted with v20.2, prepare your application for this brief downtime, typically a few minutes. Also during this time, the [**SQL Users**](connect-to-your-cluster.html#step-2-create-a-sql-user) and [**Monitoring**](monitoring-page.html) tabs in the CockroachCloud Console will be disabled.

</section>

### Review breaking changes

Review the [backward-incompatible changes in v20.2](../releases/v20.2.0.html#backward-incompatible-changes), and if any affect your application, make necessary changes.

### Let ongoing bulk operations finish

Make sure there are no [bulk imports](../stable/import.html) or [schema changes](../stable/online-schema-changes.html) in progress. These are complex operations that can increase the potential for unexpected behavior during an upgrade.</span>

To check for ongoing bulk operations, use [`SHOW JOBS`](https://www.cockroachlabs.com/docs/stable/show-jobs.html#show-schema-changes) or check the [**Jobs** page](../stable/admin-ui-jobs-page.html) in the Admin UI.

{{site.data.alerts.callout_danger}}
If any ongoing schema changes started when the cluster was running v19.2 or earlier have not reached a terminal state (i.e., `succeeded`, `failed`, or `canceled`) and have not finished undergoing an automatic internal migration during the upgrade to v20.1, wait for them to finish running on v20.1 before upgrading to v20.2. Otherwise, such schema changes will be marked as `failed` during the upgrade to v20.2.
{{site.data.alerts.end}}

## Step 4. Start the upgrade

To start the upgrade process:

1. [Sign in](https://cockroachlabs.cloud/) to your CockroachCloud account.

2. In the **Clusters** list, select the cluster you want to upgrade.

3. Select **Actions > Upgrade cluster**.

4. On the **Upgrade your cluster** dialog, confirm that you have review the pre-upgrade guidance and then click **Start Upgrade**.

<section class="filter-content" markdown="1" data-scope="multi-node">
As mentioned earlier, your cluster will be upgraded one node at a time without interrupting the cluster's overall health and availability. This "rolling upgrade" approach will take approximately 4-5 minutes per node.
</section>

<section class="filter-content" markdown="1" data-scope="single-node">
As mentioned earlier, your single-node cluster will be unavailable for a few minutes while the node is stopped and restarted with v20.2.
</section>

## Step 5. Monitor the upgrade

Once your cluster is running v20.2, you will have approximately 72 hours before the upgrade is automatically finalized. During this time, it is important to monitor your application and respect temporary limitations.

### Monitor your application

Use the [Admin UI](monitoring-page.html) or your own tooling to monitor your application for any unexpected behavior.

- If everything looks good, you can wait for the upgrade to automatically finalize or you can [trigger finalization more quickly](#finalize-the-upgrade).

- If you see unexpected behavior, you can [rollback to v20.1](#roll-back-the-upgrade). This option is available only during the 72-hour window. If you see unexpected behavior after the upgrade has been finalized, you will have to [reach out to support](https://support.cockroachlabs.com/hc/en-us/requests/new).

### Respect temporary limitations

Most v20.2 features can be used right away, but there are some that will be enabled only after the upgrade has been finalized. Attempting to use these features before then will result in errors:

- **Spatial features:** After finalization, it will be possible to use [spatial indexes](../v20.2/spatial-indexes.html), and [spatial functions](../v20.2/functions-and-operators#spatial-functions), as well as the ability to migrate spatial data from various formats such as [Shapefiles](../v20.2/migrate-from-shapefiles), [GeoJSON](../v20.2/migrate-from-geojson), [GeoPackages](../v20.2/migrate-from-geopackage), and [OpenStreetMap](../v20.2/migrate-from-openstreetmap).

- **`ENUM` data types:** After finalization, it will be possible to create and manage [user-defined `ENUM` data types](../v20.2/enum.html) consisting of sets of enumerated, static values.

- **Altering column data types:** After finalization, it will be possible to [alter column data types](../v20.2/alter-column.html#altering-column-data-types) where column data must be rewritten.

- **User-defined schemas:** After finalization, it will be possible to [create user-defined logical schemas](../v20.2/create-schema.html), as well [alter user-defined schemas](../v20.2/alter-schema.html), [drop user-defined schemas](../v20.2/drop-schema.html), and [convert databases to user-defined schemas](../v20.2/convert-to-schema.html).

- **Foreign key index requirement:** After finalization, it will no longer be required to have an index on the referencing columns of a [`FOREIGN KEY`](../v20.2/foriegn-key.html) constraint.

- **Minimum password length:** After finalization, the `server.user_login.min_password_length` [cluster setting](../v20.2/cluster-settings.html) will be respected as the minimum length for passwords.

- **Materialized views:** After finalization, it will be possible to create [materialized views](../v20.2/views.html#materialized-views), or views that store their selection query results on-disk.

- **`CREATELOGIN` privilege:** After finalization, the `CREATELOGIN` privilege will be required to define or change authentication principals or their credentials.  

## Step 6. Finish the upgrade

During the 72-hour window before the upgrade is automatically finalized, if you see unexpected behavior, you can trigger a rollback to v20.1. If everything looks good, you also have the choice to finalize the upgrade more quickly so as to lift the [temporary limitations](#respect-temporary-limitations) in place during the upgrade.

### Finalize the upgrade

To finalize the upgrade, click **Finalize** in the banner at the top of the CockroachCloud Console, and then click **Finalize upgrade**.

At this point, all [temporary limitations](#respect-temporary-limitations) are lifted, and all v20.2 features are available for use. However, it's no longer possible to roll back to v20.1. If you see unexpected behavior, [reach out to support](https://support.cockroachlabs.com/hc/en-us/requests/new).

### Roll back the upgrade

To stop the upgrade and roll back to v20.1, click **Roll back** in the banner at the top of the CockroachCloud Console, and then click **Roll back upgrade**.

<section class="filter-content" markdown="1" data-scope="multi-node">
During rollback, nodes will be reverted to v20.1 one at a time without interrupting the cluster's health and availability.
</section>

<section class="filter-content" markdown="1" data-scope="single-node">
Because your cluster contains a single node, the cluster will be briefly unavailable while the node is stopped and restarted with v20.1. Be sure to prepare for this brief unavailability before starting the rollback.
</section>

## See also

- [Upgrade Policy](upgrade-policy.html)
- [CockroachDB v20.2 Release Notes](https://www.cockroachlabs.com/docs/releases/v20.2.0.html)
