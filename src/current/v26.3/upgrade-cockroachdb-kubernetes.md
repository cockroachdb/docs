---
title: Upgrade a cluster in Kubernetes
summary: How to upgrade a secure 3-node CockroachDB cluster with Kubernetes.
toc: true
toc_not_nested: true
secure: true
docs_area: deploy
---

This page shows how to upgrade a CockroachDB cluster that is [deployed on a Kubernetes cluster]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md %}).

This page is for Kubernetes deployments that are not using the {{ site.data.products.cockroachdb-operator }}. For guidance specific to the {{ site.data.products.cockroachdb-operator }}, read [Upgrade a Cluster in Kubernetes with the {{ site.data.products.cockroachdb-operator }}]({% link {{ page.version.version }}/upgrade-cockroachdb-operator.md %}).

{% include {{ page.version.version }}/cockroachdb-operator-recommendation.md %}

## Overview

{% include common/upgrade/overview.md %}

On Kubernetes, the upgrade is a [staged update](https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/#staging-an-update) in which each pod's container image for CockroachDB is updated in a rolling fashion. The cluster remains available during the upgrade.

Select the cluster's deployment method to continue.

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="operator">{{ site.data.products.public-operator }}</button>
    <button class="filter-button" data-scope="manual">Manual configs</button>
    <button class="filter-button" data-scope="helm">Helm</button>
</div>

## Before you begin

{{site.data.alerts.callout_success}}
If you [deployed CockroachDB on Red Hat OpenShift]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes-openshift.md %}), substitute `kubectl` with `oc` in the following commands.
{{site.data.alerts.end}}

{% include {{ page.version.version }}/orchestration/operator-check-namespace.md %}
{% include common/upgrade/prepare-to-upgrade-self-hosted.md %}

### Ensure you have a valid license key

{% include common/upgrade-cockroach-version-license-limitations.md %}

## Perform a patch upgrade

{% include_cached common/upgrade/patch-upgrade-kubernetes.md %}

### Roll back a patch upgrade

{% include_cached common/upgrade/patch-rollback-kubernetes.md %}

## Perform a major-version upgrade

{% include common/upgrade/major-version-upgrade-kubernetes.md %}

### Finalize a major-version upgrade manually

{% include common/upgrade/finalize-kubernetes.md %}

### Roll back a major-version upgrade

{% include common/upgrade/rollback-kubernetes.md %}

## Disable auto-finalization

{% include common/upgrade/disable-auto-finalization.md %}

## Troubleshooting

{% include common/upgrade/troubleshooting-self-hosted.md %}

## See also
