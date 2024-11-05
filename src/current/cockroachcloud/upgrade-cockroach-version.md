---
title: Upgrade a cluster in CockroachDB Cloud
summary: Learn how to upgrade a cluster in CockroachDB Cloud
toc: true
docs_area: manage
---

This page describes how major-version and patch upgrades work and shows how to upgrade a cluster in CockroachDB {{ site.data.products.cloud }}. To upgrade a CockroachDB {{ site.data.products.core }} cluster, refer to [Upgrade to {{ site.current_cloud_version }}]({% link {{ site.current_cloud_version }}/upgrade-cockroach-version.md %}) instead.

## Overview

{% include common/upgrade/overview.md %}

{% include_cached {{ site.current_cloud_version }}/upgrade_requirements.md %}

{% include common/upgrade/upgrade-high-level.md %}

### Availability during an upgrade

For CockroachDB {{ site.data.products.standard }} and CockroachDB {{ site.data.products.basic }}, a cluster's resources are not impacted by an ongoing upgrade.

For CockroachDB {{ site.data.products.advanced }}, nodes are upgraded one at a time in a rolling fashion, and the cluster's resources are reduced as each node is upgraded. If you have [configured a maintenance window]({% link cockroachcloud/advanced-cluster-management.md %}) for a CockroachDB {{ site.data.products.advanced }} cluster, automatic patch upgrades are applied during the maintenance window. Major-version upgrades must be initiated manually.

{{site.data.alerts.callout_info}}
Maintenance operations that are critical for cluster security or stability may be applied outside of the maintenance window, and upgrades that begin in a maintenance window may not always be completed by the end of the window.
{{site.data.alerts.end}}

Refer to [Cloud Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}).

## Prepare to upgrade

{% include common/upgrade/prepare-to-upgrade-cloud.md %}

## Perform a major-version upgrade

{% include common/upgrade/major-version-upgrade-cloud.md %}

### Finalize a major-version upgrade manually

{% include_cached finalize-cloud.md %}

### Roll back a major-version upgrade

{% include_cached rollback-cloud.md %}

## Troubleshooting

{% include common/upgrade/troubleshooting-cloud.md %}

## See also

{% include see-also-cloud.md %}
