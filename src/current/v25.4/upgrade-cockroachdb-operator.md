---
title: Upgrade a cluster in Kubernetes with the CockroachDB Operator
summary: How to upgrade a secure CockroachDB cluster deployed with the CockroachDB operator.
toc: true
toc_not_nested: true
secure: true
docs_area: deploy
---

This page describes how to upgrade a CockroachDB cluster that is [deployed on a Kubernetes cluster]({% link {{ page.version.version }}/deploy-cockroachdb-with-cockroachdb-operator.md %}) with the {{ site.data.products.cockroachdb-operator }}.

{{site.data.alerts.callout_info}}
The {{ site.data.products.cockroachdb-operator }} is in [Preview]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}).
{{site.data.alerts.end}}

## Overview

{% include common/upgrade/overview.md %}

On Kubernetes, the upgrade is a staged update in which each pod's container image for CockroachDB is updated in a rolling fashion. The cluster remains available during the upgrade.

## Before you begin

{% include {{ page.version.version }}/orchestration/operator-check-namespace.md %}
{% include common/upgrade/prepare-to-upgrade-self-hosted.md %}

### Ensure you have a valid license key

{% include common/upgrade-cockroach-version-license-limitations.md %}

## Perform a patch upgrade

To upgrade from one patch release to another within the same major version, perform the following steps on one node at a time:

1. Change the container image in the custom resource:

    ~~~ yaml
    cockroachdb:
      crdbCluster:
        image:
          name: cockroachdb/cockroach:v25.3.2
    ~~~

1. Apply the new settings to the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    helm upgrade --reuse-values $CRDBCLUSTER ./cockroachdb-parent/charts/cockroachdb --values ./cockroachdb-parent/charts/cockroachdb/values.yaml -n $NAMESPACE
    ~~~

    The operator will perform the staged update.

1. To check the status of the rolling upgrade, run `kubectl get pods`.

1. Verify that all pods have been upgraded:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get pods \
    -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}'
    ~~~

You can also check the CockroachDB version of each node in the [DB Console]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}#node-details).

### Roll back a patch upgrade

{% include_cached common/upgrade/patch-rollback-kubernetes.md %}

## Perform a major-version upgrade

To perform a major upgrade:

1. Change the container image in the values file:

    ~~~ yaml
    cockroachdb:
      crdbCluster:
        image:
          name: cockroachdb/cockroach:v25.1.4
    ~~~

1. Apply the new settings to the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    helm upgrade --reuse-values $CRDBCLUSTER ./cockroachdb-parent/charts/cockroachdb --values ./cockroachdb-parent/charts/cockroachdb/values.yaml -n $NAMESPACE
    ~~~

    The operator will perform the staged update.

1. To check the status of the rolling upgrade, run `kubectl get pods`.

1. Verify that all pods have been upgraded:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get pods \
    -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}'
    ~~~

1. If auto-finalization is enabled (the default), finalization begins as soon as the last node rejoins the cluster. When finalization finishes, the upgrade is complete.

1. If auto-finalization is disabled, follow your organization's testing procedures to decide whether to [finalize the upgrade](#finalize-a-major-version-upgrade-manually) or [roll back](#roll-back-a-major-version-upgrade) the upgrade. After finalization begins, you can no longer roll back to the cluster's previous major version.

### Finalize a major-version upgrade manually

{% include common/upgrade/finalize-kubernetes.md %}

### Roll back a major-version upgrade

To roll back to the previous major version before an upgrade is finalized:

1. Change the container image in the custom resource to use the previous major version:

    ~~~ yaml
    cockroachdb:
      crdbCluster:
        image:
          name: cockroachdb/cockroach:v24.3
    ~~~

1. Apply the new settings to the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    helm upgrade --reuse-values $CRDBCLUSTER ./cockroachdb-parent/charts/cockroachdb --values ./cockroachdb-parent/charts/cockroachdb/values.yaml -n $NAMESPACE
    ~~~

    The operator will perform the staged rollback.

1. To check the status of the rollback, run `kubectl get pods`.

1. Verify that all pods have been rolled back:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get pods \
    -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}'
    ~~~

Rollbacks do not require finalization.

## Disable auto-finalization

{% include common/upgrade/disable-auto-finalization.md %}

## Troubleshooting

{% include common/upgrade/troubleshooting-self-hosted.md %}
