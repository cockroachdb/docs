---
title: Upgrade CockroachDB self-hosted
summary: Learn how to upgrade a self-hosted CockroachDB cluster.
toc: true
docs_area: manage
---

This page describes how major-version and patch upgrades work and shows how to upgrade a self-hosted CockroachDB. 

To upgrade a cluster in CockroachDB {{ site.data.products.cloud }}, refer to [Upgrade a cluster in CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/upgrade-cockroach-version.md %}) instead.

To upgrade a cluster with with [physical cluster replication (PCR)]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}), refer to [Upgrade a Cluster Running PCR]({% link {{ page.version.version }}/upgrade-with-pcr.md %}).

## Overview

{% include common/upgrade/overview.md %}

{% include_cached {{ page.version.version }}/upgrade-requirements.md %}

CockroachDB's [multi-active availability]({% link {{ page.version.version }}/multi-active-availability.md %}) means that your cluster remains available while you upgrade one node at a time in a rolling fashion. While a node is being upgraded, its resources are not available to the cluster.

{% include common/upgrade/upgrade-high-level.md %}

## Prepare to upgrade

{% include_cached common/upgrade/prepare-to-upgrade-self-hosted.md %}

### Ensure you have a valid license key

{% include common/upgrade-cockroach-version-license-limitations.md %}

## Perform a patch upgrade

{% include_cached common/upgrade/patch-upgrade-self-hosted.md %}

### Roll back a patch upgrade

{% include_cached common/upgrade/patch-rollback-self-hosted.md %}

## Perform a major-version upgrade

{% include_cached common/upgrade/major-version-upgrade-self-hosted.md %}

### Finalize a major-version upgrade manually

{% include common/upgrade/finalize-self-hosted.md %}

### Roll back a major-version upgrade

{% include_cached common/upgrade/rollback-self-hosted.md %}

## Disable auto-finalization

{% include_cached common/upgrade/disable-auto-finalization.md %}

## Troubleshooting

{% include common/upgrade/troubleshooting-self-hosted.md %}

## See also

{% include common/upgrade/see-also-self-hosted.md %}
