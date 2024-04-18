---
title: Upgrade to CockroachDB v24.1 Pre-Production Preview
summary: Learn how to upgrade a cluster in CockroachDB Cloud to v24.1 Pre-Production Preview
toc: true
docs_area: manage
page_version: v24.1
prev_version: v23.2
pre_production_preview: true
pre_production_preview_version: v24.1.0-beta.1
---

{% if page.pre_production_preview == true %}
[CockroachDB {{ page.pre_production_preview_version }}](https://www.cockroachlabs.com/docs/releases/{{ page.page_version }}#{{ page.pre_production_preview_version | replace: ".","-"}}) is available to CockroachDB {{ site.data.products.dedicated }} clusters for testing and experimentation.

{{site.data.alerts.callout_danger}}
This [testing release]({% link releases/index.md %}#release-naming) is not qualified for production environments and not eligible for support or uptime SLA commitments.
{{site.data.alerts.end}}

An [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) can upgrade your CockroachDB {{ site.data.products.dedicated }} cluster from the CockroachDB {{ site.data.products.cloud }} Console. This page shows how to upgrade a CockroachDB {{ site.data.products.dedicated }} cluster to {{ page.pre_production_preview_version }} for testing and experimentation.

{{site.data.alerts.callout_success}}
Upgrading from {{ page.prev_version }} to {{ page.pre_production_preview_version }} is a major-version upgrade. Upgrading a CockroachDB {{ site.data.products.dedicated }} cluster to a new major version is opt-in. Before proceeding, review the CockroachDB {{ site.data.products.cloud }} [CockroachDB Cloud Upgrade Policy](https://cockroachlabs.com/docs/cockroachcloud/upgrade-policy#pre-production-preview). After a cluster is upgraded to a Pre-Production Preview release, it is automatically upgraded to all subsequent releases within the same major version—including additional beta and RC releases, the GA release, and subsequent patch releases after GA, as patch version upgrades. To learn more, refer to [Patch Version Upgrades]({% link cockroachcloud/upgrade-policy.md %}#patch-version-upgrades).
{{site.data.alerts.end}}

{% else %}
Now that [CockroachDB {{ page.page_version }}](https://www.cockroachlabs.com/docs/releases/ {{ page.page_version }}) is available, an [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) can upgrade your CockroachDB {{ site.data.products.dedicated }} cluster from the CockroachDB {{ site.data.products.cloud }} Console. This page shows how to upgrade a cluster in CockroachDB Cloud to {{ page.page_version }}.

{{site.data.alerts.callout_success}}
Upgrading a CockroachDB {{ site.data.products.dedicated }} cluster to a new major version is opt-in. Before proceeding, review the CockroachDB {{ site.data.products.cloud }} [CockroachDB Cloud Upgrade Policy](https://cockroachlabs.com/docs/cockroachcloud/upgrade-policy).
{{site.data.alerts.end}}

{% endif %}

## Step 1. Verify that you can upgrade

To upgrade to CockroachDB {{ page.page_version}}, you must be running {{ page.prev_version }}. If you are not running {{ page.prev_version }}, first [upgrade to {{ page.prev_version }}]({% link cockroachcloud/upgrade-to-{{ page.prev_version }}.md %}). Then return to this page and continue to [Step 2](#step-2-select-your-cluster-size).

## Step 2. Select your cluster size

The upgrade process depends on the number of nodes in your cluster. Select whether your cluster has multiple nodes or a single node:

<div class="filters filters-big clearfix">
  <button class="filter-button" data-scope="multi-node">Multi-node</button>
  <button class="filter-button" data-scope="single-node">Single-node</button>
</div>

## Step 3. Understand the upgrade process

<section class="filter-content" markdown="1" data-scope="multi-node">
In a multi-node cluster, the upgrade does not interrupt the cluster's overall health and availability. CockroachDB {{ site.data.products.cloud }} stops one node at a time and restarts it with the new version, waits a few minutes to observe the upgraded node's behavior, then moves on to the next node. This "rolling upgrade" takes approximately 4-5 minutes per node and is enabled by CockroachDB's [multi-active availability](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/multi-active-availability) design.

Approximately 72 hours after all nodes are running {{ page.page_version }}, the upgrade will be automatically finalized. This enables certain [features and performance improvements introduced in {{ page.page_version }}](#expect-temporary-limitations). Finalization also removes the ability to roll back to {{ page.prev_version }}, so it's important to monitor your applications during this 72-hour window and, if you see unexpected behavior, [roll back the upgrade](#roll-back-the-upgrade) from the CockroachDB {{ site.data.products.cloud }} Console.
</section>

<section class="filter-content" markdown="1" data-scope="single-node">
When you start the upgrade, the cluster will be unavailable for a few minutes while the node is stopped and restarted with {{ page.page_version }}.

Approximately 72 hours after the node has been restarted, the upgrade will be automatically finalized. This enables certain [features and performance improvements introduced in {{ page.page_version }}](#expect-temporary-limitations). Finalization also removes the ability to roll back to {{ page.prev_version }}, so it's important to monitor your applications during this 72-hour window and, if you see unexpected behavior, [roll back the upgrade](#roll-back-the-upgrade) from the CockroachDB {{ site.data.products.cloud }} Console.
</section>

{{site.data.alerts.callout_danger}}
If you choose to roll back a major version upgrade, your cluster will be rolled back to the latest patch release of {{ page.prev_version }}, which may differ from the patch release you were running before you initiated the upgrade. To learn more, refer to [CockroachDB Cloud Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}).
{{site.data.alerts.end}}

## Step 4. Prepare to upgrade

Before starting the upgrade, complete the following steps.

<section class="filter-content" markdown="1" data-scope="single-node">

### Prepare for brief unavailability

Your cluster will be unavailable while its single node is stopped and restarted with {{ page.page_version }}. Prepare your application for this brief downtime, typically a few minutes.

The [**SQL Users**]({% link cockroachcloud/managing-access.md %}#create-a-sql-user) and [**Tools**]({% link cockroachcloud/tools-page.md %}) tabs in the CockroachDB {{ site.data.products.cloud }} Console will also be disabled during this time.

</section>

### Review breaking changes

{% comment %} Be careful with this logic and the page-level variable page_version {% endcomment %}
{% assign rd = site.data.versions | where_exp: "rd", "rd.major_version == page.page_version" | first %}

{% if page.pre_production_preview == true %}
Review the backward-incompatible changes and deprecated features announced in each {{ page.page_version }} testing release. If any affect your applications, make the necessary changes before proceeding.
{% else %}
Review the backward-incompatible changes and deprecated features announced in the [{{ page.page_version }} release notes](https://www.cockroachlabs.com/docs/releases/{{ page.page_version }})
{% endif %}

### Reset SQL statistics

Before upgrading to CockroachDB {{ page.page_version }}, it is recommended to reset the cluster's [SQL statistics]({% link {{ page.page_version }}/cost-based-optimizer.md %}#table-statistics). Otherwise, it may take longer for the upgrade to complete on a cluster with large statement or transaction statistics tables. This is due to the addition of a new column and a new index to these tables. To reset SQL statistics, issue the following SQL command:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT crdb_internal.reset_sql_stats();
~~~

## Step 5. Start the upgrade

To start the upgrade process:

1. [Sign in](https://cockroachlabs.cloud/) to your CockroachDB {{ site.data.products.cloud }} account.

1. In the **Clusters** list, select the cluster you want to upgrade.

1. Select **Actions > Upgrade {% if page.pre_production_preview == true %}to Pre-Production Preview{% else %}major version{% endif %}**.

1. In the **Upgrade your cluster** dialog, review the pre-upgrade message and then click {% if page.pre_production_preview == true %}to Pre-Production Preview{% else %}major version{% endif %}.

<section class="filter-content" markdown="1" data-scope="multi-node">
Your cluster will be upgraded one node at a time without interrupting the cluster's overall health and availability. This "rolling upgrade" will take approximately 4-5 minutes per node.
</section>

<section class="filter-content" markdown="1" data-scope="single-node">
Your single-node cluster will be unavailable for a few minutes while the node is stopped and restarted with CockroachDB {{ page.page_version }}.
</section>

After it is started, an upgrade cannot be cancelled. Instead, you can wait for the upgrade to finish, then [roll it back](#roll-back-the-upgrade) for up to 72 hours, after which time it will be finalized and cannot be rolled back.

## Step 6. Monitor the upgrade

Once your cluster is running CockroachDB {{ page.page_version }}, you will have approximately 72 hours before the upgrade is automatically finalized. During this time, it is important to [monitor your applications](#monitor-your-application) and [expect temporary limitations](#expect-temporary-limitations).

If you see unexpected behavior, you can [roll back](#roll-back-the-upgrade) to {{ page.prev_version }} during the 72-hour window.

### Monitor your application

Use the [DB Console]({% link cockroachcloud/tools-page.md %}) or your own tooling to monitor your application for any unexpected behavior.

- If everything looks good, you can wait for the upgrade to automatically finalize or you can [manually trigger finalization](#finalize-the-upgrade).

- If you see unexpected behavior, you can [roll back to the latest patch release of {{ page.prev_version }}](#roll-back-the-upgrade) during the 72-hour window.

### Expect temporary limitations

Most {{ page.page_version }} features can be used right away, but some will be enabled only after the upgrade has been finalized. Attempting to use these features before finalization will result in errors. {% comment %}TODO: List of temporary limitations for GA{% endcomment %}

For an expanded list of features included in {{ page.page_version }}, temporary limitations, backward-incompatible changes, and deprecated features in the [{{ page.page_version }} release notes](https://www.cockroachlabs.com/docs/releases/{{ page.page_version }}).

### Roll back the upgrade

If you see unexpected behavior, you can roll back the upgrade during the 72-hour window.

To stop the upgrade and roll back to {{ page.prev_version }}, click **Roll back** in the banner at the top of the CockroachDB {{ site.data.products.cloud }} Console, and then click **Roll back upgrade**.

<section class="filter-content" markdown="1" data-scope="multi-node">
During rollback, nodes will be reverted to the latest production patch release of {{ page.prev_version }} one at a time without interrupting the cluster's health and availability.
</section>

<section class="filter-content" markdown="1" data-scope="single-node">
Because your cluster contains a single node, the cluster will be briefly unavailable while the node is stopped and restarted with the latest production patch release of {{ page.prev_version }}. Be sure to [prepare for this brief unavailability](#prepare-for-brief-unavailability) before starting the rollback.
</section>

## Step 7. Complete the upgrade

If everything looks good, you can wait for the upgrade to automatically finalize, or you can manually finalize the upgrade to lift the [temporary limitations](#expect-temporary-limitations) on the cluster more quickly.

### Finalize the upgrade

The upgrade is automatically finalized after 72 hours.

To manually finalize the upgrade, click **Finalize** in the banner at the top of the CockroachDB {{ site.data.products.cloud }} Console, and then click **Finalize upgrade**.

After finalization, all [temporary limitations](#expect-temporary-limitations) will be lifted and all {{ page.page_version }} features will be available for use. However, it will no longer be possible to roll back to {{ page.prev_version }}. If you see unexpected behavior after the upgrade has been finalized, [contact support](https://support.cockroachlabs.com/hc/requests/new).

## See also

- [CockroachDB Cloud Upgrade Policy](https://cockroachlabs.com/docs/cockroachcloud/upgrade-policy)
- [CockroachDB {{ page.page_version }} Release Notes](https://www.cockroachlabs.com/docs/releases/{{ page.page_version }})
