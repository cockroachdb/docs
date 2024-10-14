---
title: Deploy CockroachDB in a Single Kubernetes Cluster
summary: Deploy a secure 3-node CockroachDB cluster with Kubernetes.
toc: true
toc_not_nested: true
secure: true
docs_area:
---

{% include {{ page.version.version }}/filter-tabs/crdb-single-kubernetes.md %}

This page shows you how to start and stop a secure 3-node CockroachDB cluster in a single [Kubernetes](http://kubernetes.io/) cluster. You can use any of the following approaches:

- [CockroachDB Kubernetes Operator](https://github.com/cockroachdb/cockroach-operator)

    {{site.data.alerts.callout_info}}
    The CockroachDB Kubernetes Operator is also available on platforms such as [Red Hat OpenShift]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes-openshift.md %}) and [IBM Cloud Pak for Data](https://www.ibm.com/products/cloud-pak-for-data).
    {{site.data.alerts.end}}

- Manual [StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) configuration

- [Helm](https://helm.sh/) package manager for Kubernetes

{% include cockroachcloud/use-cockroachcloud-instead.md %}

## Before you begin

Before getting started, it's helpful to review some Kubernetes-specific terminology and current limitations.

- [Kubernetes terminology](#kubernetes-terminology)
- [Best practices](#best-practices)

### Kubernetes terminology

{% include_cached common/orchestration/kubernetes-terminology.md %}

### Best practices

{% include common/orchestration/kubernetes-limitations.md %}

## Step 1. Start Kubernetes

{% include common/orchestration/start-kubernetes.md %}

## Step 2. Start CockroachDB

Choose how you want to deploy and maintain the CockroachDB cluster.

{{site.data.alerts.callout_info}}
The [CockroachDB Kubernetes Operator](https://github.com/cockroachdb/cockroach-operator) eases CockroachDB cluster creation and management on a single Kubernetes cluster.

The Operator does not provision or apply an Enterprise license key. To use [Enterprise features]({% link {{ page.version.version }}/enterprise-licensing.md %}) with the Operator, [set a license]({% link {{ page.version.version }}/licensing-faqs.md %}#set-a-license) in the SQL shell.
{{site.data.alerts.end}}

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="operator">Use Operator</button>
    <button class="filter-button" data-scope="manual">Use Configs</button>
    <button class="filter-button" data-scope="helm">Use Helm</button>
</div>

<section class="filter-content" markdown="1" data-scope="operator">
{% include common/orchestration/start-cockroachdb-operator-secure.md %}
</section>

<section class="filter-content" markdown="1" data-scope="manual">
{% include common/orchestration/start-cockroachdb-secure.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
{% include common/orchestration/start-cockroachdb-helm-secure.md %}
</section>

## Step 3. Use the built-in SQL client

{% include common/orchestration/test-cluster-secure.md %}

## Step 4. Access the DB Console

{% include common/orchestration/monitor-cluster.md %}

## Step 5. Stop the cluster

{{site.data.alerts.callout_info}}
If you want to continue using this cluster, refer the documentation on [configuring]({% link {{ page.version.version }}/configure-cockroachdb-kubernetes.md %}), [scaling]({% link {{ page.version.version }}/scale-cockroachdb-kubernetes.md %}), [monitoring]({% link {{ page.version.version }}/monitor-cockroachdb-kubernetes.md %}), and [upgrading]({% link {{ page.version.version }}/upgrade-cockroachdb-kubernetes.md %}) the cluster.
{{site.data.alerts.end}}

{% include common/orchestration/kubernetes-stop-cluster.md %}

### Stop Kubernetes

{% include_cached common/orchestration/kubernetes-stop.md %}

## See also

- [Resource management]({% link {{ page.version.version }}/configure-cockroachdb-kubernetes.md %})
- [Certificate management]({% link {{ page.version.version }}/secure-cockroachdb-kubernetes.md %})
- [Cluster monitoring]({% link {{ page.version.version }}/monitor-cockroachdb-kubernetes.md %})
- [Kubernetes Multi-Cluster Deployment]({% link {{ page.version.version }}/orchestrate-cockroachdb-with-kubernetes-multi-cluster.md %})
- [Optimize Performance on Kubernetes]({% link {{ page.version.version }}/kubernetes-performance.md %})
- [Production Checklist]({% link {{ page.version.version }}/recommended-production-settings.md %})
