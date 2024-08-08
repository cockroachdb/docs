---
title: Upgrade to CockroachDB v24.2
summary: Learn how to upgrade a cluster in CockroachDB Cloud to v24.2
toc: true
docs_area: manage
page_version: v24.2
pre_production_preview: true

---
{% assign DEBUG = false %}

{% comment %}Determine Cloud support{% endcomment %}

{% comment %}Date to compare support dates against. To test, replace today with YYYY-MM-DD.{% endcomment %}
{% assign today = "today" | date: "%s" %}

{% comment %}Get the major version object{% endcomment %}
{% assign x = site.data.versions | where_exp: "m", "m.major_version == page.page_version" | first %}

{% comment %}Is it Production?{% endcomment %}
{% assign released = false %}
{% if x.release_date == "N/A" and x.maint_supp_exp_date == "N/A" %}
  {% comment %}Get the object for the latest Testing release in the major version{% endcomment %}
  {% assign latest_patch = site.data.releases | where_exp: "releases", "releases.major_version == page.page_version" | where_exp: "releases", "release_type == Testing" | sort: "release_date" | reverse | first %}
{% else %}
  {% comment %}Get the object for the latest Production release in the major version{% endcomment %}
  {% assign released = true %}
  {% assign latest_patch = site.data.releases | where_exp: "releases", "releases.major_version == page.page_version" | where_exp: "releases", "release_type == Production" | sort: "release_date" | reverse | first %}
{% endif %}

{% if DEBUG %}
x: {{ x }}<br /><br />
x.major_version: {{ x.major_version }}<br />
x.release_date: {{ x.release_date }}<br />
x.maint_supp_exp_date: {{ x.maint_supp_exp_date }}<br />
x.previous_version: {{ x.previous_version }}<br />
released: {{ released }}<br /><br />
latest_patch: {{ latest_patch }}<br /><br />
{% endif %}

{% assign released = false %}
{% unless x.release_date == "N/A" and x.maint_supp_exp_date == "N/A" %}
  {% assign released = true %}
{% endunless %}

{% assign skippable = false %}
{% assign supported = false %}
{% assign purple_date = 0 %}
{% assign red_date = 0 %}
{% assign red_result = 0 %}
{% assign purple_result = 0 %}

{% if released == true %}
  {% if x.asst_supp_exp_date != "N/A" %}
    {% assign eos_date = x.asst_supp_exp_date %}
    {% assign eos = eos_date | date: "%s" %}
    {% capture purple_date %}{{ eos | minus: 10368000 }}{% endcapture %}{% comment %}4 months in seconds{% endcomment %}
    {% capture red_date %}{{ eos | minus: 5184000 }} {% endcapture %}{% comment %}2 months in seconds{% endcomment %}
  {% elsif x.maint_supp_exp_date != "N/A" %}
    {% assign skippable = true %}
    {% assign eos_date = x.maint_supp_exp_date %}
    {% assign eos = eos_date | date: "%s" %}
    {% capture purple_date %}{{ eos | minus: 5184000 }}{% endcapture%}{% comment %}2 months in seconds{% endcomment %}
    {% capture red_date %}{{ eos | minus: 2592000 }} {% endcapture %}{% comment %}1 month in seconds{% endcomment %}
  {% endif %}

  {% if today < eos %}
    {% assign supported = true %}
    {% assign red_result = today | minus: red_date %}
    {% assign purple_result = today | minus: purple_date %}
  {% endif %}
{% endif %}

{% if DEBUG == true %}
skippable: {{ skippable }}<br />
supported: {{ supported }}<br />
today: {{ today }}<br />
eos: {{ eos }}<br />
eos_date: {{ eos_date }}<br />
purple_date: {{ purple_date }}<br />
red_date: {{ red_date }}<br /><br />
purple_result: {{ purple_result }}<br /><br />
red_result: {{ red_result }}<br />
{% endif %}

{% capture testing_release_message %}
{{site.data.alerts.callout_info}}
CockroachDB {{ x.major_version }} is a testing release{% if page.pre_production_preview == false %} and is not yet available in CockroachDB {{ site.data.products.cloud }}{% endif %}. [Testing releases]({% link releases/index.md %}#release-naming) are not qualified for production environments and not eligible for support or uptime SLA commitments. This page is provided for reference only and is subject to change.
{{site.data.alerts.end}}
{% endcapture %}

{% capture support_ending_soon %}
Support for CockroachDB v24.2 will end on **{{ eos_date }}** at the end of its Maintenance Support phase.{% if skippable == true %} Optional innovation releases are not eligible for Assistance Support.{% endif %} Prior to that date, upgrade to a newer version. For more details, refer to [CockroachDB Cloud Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}).
{% endcapture %}

{% capture eos_message %}
{{site.data.alerts.callout_danger}}
As of **{{ eos_date }}**, CockroachDB {{ x.major_version }} is no longer supported. For more details, refer to [CockroachDB Cloud Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}). This page is provided for reference purposes only.
{{site.data.alerts.end}}
{% endcapture %}

{% if released == true %}
  {% if supported == false %}
    {{ eos_message }}
  {% else %}
{% elsif released %}

    {% if red_result < eos %}
{{site.data.alerts.callout_danger}}
{{ support_ending_soon }}
{{site.data.alerts.end}}
    {% elsif purple_result < eos %}
{{site.data.alerts.callout_version}}
{{ support_ending_soon }}
{{site.data.alerts.end}}
    {% endif %}
  {% endif %}
{% else %}
{{ testing_release_message }}
{% endif %}

{% capture previous_version_numeric %}{{ x.major_version | remove_first: 'v' }}{% endcapture %}
{% capture major_version_numeric %}{{ x.previous_version | remove_first: 'v' }}{% endcapture %}

{% if DEBUG == true %}
previous_version_numeric: {{ previous_version_numeric }}<br />
major_version_numeric: {{ major_version_numeric }}<br />
{% endif %}

{% if page.pre_production_preview == true and released == false %}
[CockroachDB {{ latest_patch.release_name }}](https://www.cockroachlabs.com/docs/releases/{{ x.major_version }}#{{ page.pre_production_preview_version | replace: ".","-"}}) is available to CockroachDB {{ site.data.products.dedicated }} clusters as an opt-in upgrade for testing and experimentation.

{{site.data.alerts.callout_danger}} [Testing releases]({% link releases/index.md %}#release-naming) are not qualified for production environments and not eligible for support or uptime SLA commitments.
{{site.data.alerts.end}}

An [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) can upgrade your CockroachDB {{ site.data.products.dedicated }} cluster from the CockroachDB {{ site.data.products.cloud }} Console. This page shows how to upgrade a CockroachDB {{ site.data.products.dedicated }} cluster to {{ page.pre_production_preview_version }} for testing and experimentation.

{{site.data.alerts.callout_success}}
Upgrading from {{ x.previous_version }} to {{ page.pre_production_preview_version }} is a major-version upgrade. Upgrading a CockroachDB {{ site.data.products.dedicated }} cluster to a new major version is opt-in. Before proceeding, review the CockroachDB {{ site.data.products.cloud }} [CockroachDB Cloud Upgrade Policy](https://cockroachlabs.com/docs/cockroachcloud/upgrade-policy#pre-production-preview). After a cluster is upgraded to a Pre-Production Preview release, it is automatically upgraded to all subsequent releases within the same major version—including additional beta and RC releases, the GA release, and subsequent patch releases after GA, as patch version upgrades. To learn more, refer to [Patch Version Upgrades]({% link cockroachcloud/upgrade-policy.md %}#patch-version-upgrades).
{{site.data.alerts.end}}

{% elsif released == true %}

Now that [CockroachDB {{ x.major_version }}](https://www.cockroachlabs.com/docs/releases/{{ x.major_version }}) is available, an [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) can upgrade your CockroachDB {{ site.data.products.dedicated }} cluster from the [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud). This page shows how to upgrade a cluster in CockroachDB Cloud to {{ x.major_version }}.

{% endif %}

CockroachDB {{ x.major_version }} is a{% if skippable == true %}n [Innovation release]({% link cockroachcloud/upgrade-policy.md %}#patch-version-upgrades), which is optional for CockroachDB {{ site.data.products.dedicated }} clusters but required for CockroachDB {{ site.data.products.serverless }}{% else %} [Regular release]({% link cockroachcloud/upgrade-policy.md %}#patch-version-upgrades), which is a required upgrade for both CockroachDB {{ site.data.products.dedicated }} and CockroachDB {{ site.data.products.serverless }}.{% endif %}
Refer to [CockroachDB Cloud Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}) before installing or upgrading for release timing and support details.

{{site.data.alerts.callout_success}}
Upgrading a CockroachDB {{ site.data.products.dedicated }} cluster to a new major version is opt-in. Before proceeding, review the [CockroachDB Cloud Upgrade Policy](https://cockroachlabs.com/docs/cockroachcloud/upgrade-policy).
{{site.data.alerts.end}}

## Step 1. Verify that you can upgrade

To upgrade to CockroachDB {{ x.major_version}}, you must be running {{ x.previous_version }}. If you are not running {{ x.previous_version }}, first [upgrade to {{ x.previous_version }}](../cockroachcloud/upgrade-to{{ x.previous_version }}.html). Then return to this page and continue to [Step 2](#step-2-select-your-cluster-size).

## Step 2. Select your cluster size

The upgrade process depends on the number of nodes in your cluster. Select whether your cluster has multiple nodes or a single node:

<div class="filters filters-big clearfix">
  <button class="filter-button" data-scope="multi-node">Multi-node</button>
  <button class="filter-button" data-scope="single-node">Single-node</button>
</div>

## Step 3. Understand the upgrade process

<section class="filter-content" markdown="1" data-scope="multi-node">
In a multi-node cluster, the upgrade does not interrupt the cluster's overall health and availability. CockroachDB {{ site.data.products.cloud }} stops one node at a time and restarts it with the new version, waits a few minutes to observe the upgraded node's behavior, then moves on to the next node. This "rolling upgrade" takes approximately 4-5 minutes per node and is enabled by CockroachDB's [multi-active availability](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/multi-active-availability) design.
</section>

<section class="filter-content" markdown="1" data-scope="single-node">
When you start the upgrade, the cluster will be unavailable for a few minutes while the node is stopped and restarted with {{ x.major_version }}.
</section>

If you are upgrading from {{ x.previous_version }} to {{ x.major_version }}, the upgrade must be finalized. This is not required for subsequent patch upgrades. Approximately 72 hours after all nodes are running {{ x.major_version }}, the upgrade will be automatically [finalized](../{{ x.major_version }}/upgrade-cockroach-version.html#step-6-finish-the-upgrade). It's important to monitor your cluster and applications during this 72-hour window, so that you can [roll back the upgrade](#roll-back-the-upgrade) from the CockroachDB {{ site.data.products.cloud }} Console if you see [unexpected behavior according to key metrics](../{{ x.major_version }}/essential-metrics-dedicated.html) or if you experience application or database issues.

During a major-version upgrade, certain features and performance improvements may not be available until the upgrade is finalized. However, when upgrading from {{ x.previous_version }} to {{ x.major_version }}, all features are available immediately, and no features require finalization.

{{site.data.alerts.callout_info}}
Finalization is always required to complete an upgrade.
{{site.data.alerts.end}}

When finalization is complete, it is no longer possible to roll back to {{ x.previous_version }}.

{{site.data.alerts.callout_info}}
If you choose to roll back a major version upgrade, your cluster will be rolled back to the latest patch release of {{ x.previous_version }}, which may differ from the patch release you were running before you initiated the upgrade. To learn more, refer to [CockroachDB {{ site.data.products.cloud }} Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}).
{{site.data.alerts.end}}

When finalization begins, a series of migration jobs run to enable certain types of features and changes in the new major version that cannot be rolled back. These include changes to system schemas, indexes, and descriptors, and [enabling certain types of improvements and new features](#expect-temporary-limitations). Until the upgrade is finalized, these features and functions will not be available and the command `SHOW CLUSTER SETTING version` will return `{{ previous_version_numeric }}`.

You can monitor the process of the migration in the CockroachDB {{ site.data.products.cloud }} [**Jobs** page]({% link cockroachcloud/jobs-page.md %}). Migration jobs have names in the format `{{ major_version_numeric }}-{migration-id}`. If a migration job fails or stalls, Cockroach Labs can use the migration ID to help diagnose and troubleshoot the problem. Each major version has different migration jobs with different IDs.

Finalization is complete when all migration jobs have completed. After migration is complete, the command `SHOW CLUSTER SETTING version` will return `{{ major_version_numeric }}`.

## Step 4. Prepare to upgrade

Before starting the upgrade, complete the following steps.

<section class="filter-content" markdown="1" data-scope="single-node">

### Prepare for brief unavailability

Your cluster will be unavailable while its single node is stopped and restarted with {{ x.major_version }}. Prepare your application for this brief downtime, typically a few minutes.

The [**SQL Users**]({% link cockroachcloud/managing-access.md %}#create-a-sql-user) and [**Tools**]({% link cockroachcloud/tools-page.md %}) tabs in the CockroachDB {{ site.data.products.cloud }} Console will also be disabled during this time.

</section>

### Review breaking changes

{% comment %} Be careful with this logic and the page-level variable page_version {% endcomment %}
{% assign rd = site.data.versions | where_exp: "rd", "rd.major_version == x.major_version" | first %}

{% if page.pre_production_preview == true %}
Review the backward-incompatible changes and deprecated features announced in each {{ x.major_version }} testing release. If any affect your applications, make the necessary changes before proceeding.
{% else %}
Review the backward-incompatible changes and deprecated features announced in the [{{ x.major_version }} release notes](../releases/{{ x.major_version }}.html). If any affect your applications, make the necessary changes before proceeding.
{% endif %}

## Step 5. Start the upgrade

To start the upgrade process:

1. [Sign in](https://cockroachlabs.cloud/) to your CockroachDB {{ site.data.products.cloud }} account.

1. In the **Clusters** list, select the cluster you want to upgrade.

1. Select **Actions > Upgrade {% if page.pre_production_preview == true and supported == false %}to Pre-Production Preview{% else %}major version{% endif %}**.

1. In the **Upgrade your cluster** dialog, review the pre-upgrade message and then click {% if page.pre_production_preview == true and supported == false %}to Pre-Production Preview{% else %}major version{% endif %}.

<section class="filter-content" markdown="1" data-scope="multi-node">
Your cluster will be upgraded one node at a time without interrupting the cluster's overall health and availability. This "rolling upgrade" will take approximately 4-5 minutes per node.
</section>

<section class="filter-content" markdown="1" data-scope="single-node">
Your single-node cluster will be unavailable for a few minutes while the node is stopped and restarted with CockroachDB {{ x.major_version }}.
</section>

After it is started, an upgrade cannot be cancelled. Instead, you can wait for the upgrade to finish, then [roll it back](#roll-back-the-upgrade) for up to 72 hours, after which time it will be finalized and cannot be rolled back.

## Step 6. Monitor the upgrade

Once your cluster is running CockroachDB {{ x.major_version }}, you will have approximately 72 hours before the upgrade is automatically finalized. During this time, it is important to [monitor your applications](#monitor-your-application) and [expect temporary limitations](#expect-temporary-limitations).

If you see unexpected behavior, you can [roll back](#roll-back-the-upgrade) to {{ x.major_version }} during the 72-hour window.

### Monitor your application

Use the [DB Console]({% link cockroachcloud/tools-page.md %}) or your own tooling to monitor your application for any unexpected behavior.

- If everything looks good, you can wait for the upgrade to automatically finalize or you can [manually trigger finalization](#finalize-the-upgrade).

- If you see unexpected behavior, you can [roll back to the latest patch release of {{ x.previous_version }}](#roll-back-the-upgrade) during the 72-hour window.

### Expect temporary limitations
{% comment %}This situation is unique to v24.2{% endcomment %}
All v24.2 features can be used right away. However, finalization is always required to complete a major-version upgrade.

For an expanded list of features included in {{ x.major_version }}, temporary limitations, backward-incompatible changes, and deprecated features, refer to the [{{ x.major_version }} release notes]({% link releases/{{ x.major_version }}.md %}).

### Roll back the upgrade

If you see unexpected behavior, you can roll back the upgrade during the 72-hour window.

To stop the upgrade and roll back to {{ x.previous_version }}, click **Roll back** in the banner at the top of the CockroachDB {{ site.data.products.cloud }} Console, and then click **Roll back upgrade**.

<section class="filter-content" markdown="1" data-scope="multi-node">
During rollback, nodes will be reverted to the latest production patch release of {{ x.previous_version }} one at a time without interrupting the cluster's health and availability.
</section>

<section class="filter-content" markdown="1" data-scope="single-node">
Because your cluster contains a single node, the cluster will be briefly unavailable while the node is stopped and restarted with the latest production patch release of {{ x.previous_version }}. Be sure to [prepare for this brief unavailability](#prepare-for-brief-unavailability) before starting the rollback.
</section>

<a id="finalize-the-upgrade"></a>

## Step 7. Complete the upgrade

If everything looks good, you can wait for the upgrade to automatically finalize after 72 hours, or you can manually finalize the upgrade to lift any [temporary limitations](#expect-temporary-limitations) on the cluster more quickly.

To manually finalize the upgrade, click **Finalize** in the banner at the top of the CockroachDB {{ site.data.products.cloud }} Console, and then click **Finalize upgrade**.

After finalization, any [temporary limitations](#expect-temporary-limitations) will be lifted and all {{ x.major_version }} features will be available for use. No such features exist for v24.2.{% comment %}This situation is unique for v24.2{% endcomment %}

After finalization, it will no longer be possible to roll back to {{ x.previous_version }}. If you see unexpected behavior after the upgrade has been finalized, [contact support](https://support.cockroachlabs.com/hc/requests/new).

## See also

- [CockroachDB Cloud Upgrade Policy](https://cockroachlabs.com/docs/cockroachcloud/upgrade-policy)
- [CockroachDB {{ x.major_version }} Release Notes](https://www.cockroachlabs.com/docs/releases/{{ x.major_version }})
