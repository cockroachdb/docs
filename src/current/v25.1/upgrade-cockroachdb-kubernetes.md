---
title: Upgrade a cluster in Kubernetes
summary: How to upgrade a secure 3-node CockroachDB cluster with Kubernetes.
toc: true
toc_not_nested: true
secure: true
docs_area: deploy
---

This page shows how to upgrade a CockroachDB cluster that is [deployed on a Kubernetes cluster]({{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md).

## Overview


On Kubernetes, the upgrade is a [staged update](https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/#staging-an-update) in which each pod's container image for CockroachDB is updated in a rolling fashion. The cluster remains available during the upgrade.

Select the cluster's deployment method to continue.

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="operator">Operator</button>
    <button class="filter-button" data-scope="manual">Manual Configs</button>
    <button class="filter-button" data-scope="helm">Helm</button>
</div>

## Before you begin

{{site.data.alerts.callout_success}}
If you [deployed CockroachDB on Red Hat OpenShift]({{ page.version.version }}/deploy-cockroachdb-with-kubernetes-openshift.md), substitute `kubectl` with `oc` in the following commands.
{{site.data.alerts.end}}


### Ensure you have a valid license key


## Perform a patch upgrade


### Roll back a patch upgrade


## Perform a major-version upgrade


### Finalize a major-version upgrade manually


### Roll back a major-version upgrade


## Disable auto-finalization

## Troubleshooting


## See also