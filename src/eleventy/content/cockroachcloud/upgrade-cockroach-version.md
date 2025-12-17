---
title: Upgrade a cluster in CockroachDB Cloud
summary: Learn how to upgrade a cluster in CockroachDB Cloud
toc: true
docs_area: manage
---

This page describes how major-version and patch upgrades work and shows how to upgrade a cluster in CockroachDB {{ site.data.products.cloud }}. To upgrade a CockroachDB {{ site.data.products.core }} cluster, refer to [Upgrade to {{ site.current_cloud_version }}]({% link "{{ site.current_cloud_version }}/upgrade-cockroach-version.md" %}) instead.

## Overview

{% include "common/upgrade/overview.md" %}

A list of [currently supported major versions]({% link "cockroachcloud/upgrade-policy.md" %}#currently-supported-versions) with links to their release notes is available in the CockroachDB Cloud [Upgrade Policy]({% link "cockroachcloud/upgrade-policy.md" %}).

### Availability during an upgrade

For CockroachDB {{ site.data.products.standard }} and {{ site.data.products.basic }}, a cluster remains available during an upgrade.

For CockroachDB {{ site.data.products.advanced }}, nodes are upgraded one at a time in a rolling fashion. Multi-node clusters will remain available during the upgrade, but will have reduced capacity as each node restarts. Single-node clusters will be unavailable while the node restarts.

### Upgrades and maintenance windows

If you have [configured a maintenance window]({% link "cockroachcloud/advanced-cluster-management.md" %}) for a CockroachDB {{ site.data.products.advanced }} cluster, automatic patch upgrades are applied during the maintenance window. Major-version upgrades are initiated manually.

{{site.data.alerts.callout_info}}
Maintenance operations that are critical for cluster security or stability may be applied outside of the maintenance window, and upgrades that begin in a maintenance window may not always be completed by the end of the window.
{{site.data.alerts.end}}

For more information, refer to the [Cloud Upgrade Policy]({% link "cockroachcloud/upgrade-policy.md" %}).

## Prepare to upgrade

{% include "common/upgrade/prepare-to-upgrade-cloud.md" %}

## Perform a major-version upgrade

{% include "common/upgrade/major-version-upgrade-cloud.md" %}

### Finalize a major-version upgrade manually

{% include "common/upgrade/finalize-cloud.md" %}

### Roll back a major-version upgrade

{% include "common/upgrade/rollback-cloud.md" %}

## Troubleshooting

{% include "common/upgrade/troubleshooting-cloud.md" %}

## See also

{% include "common/upgrade/see-also-cloud.md" %}

