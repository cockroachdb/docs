---
title: Deploy CockroachDB in a Single Kubernetes Cluster
summary: Deploy a secure 3-node CockroachDB cluster with Kubernetes.
toc: true
toc_not_nested: true
secure: true
redirect_from: orchestrate-cockroachdb-with-kubernetes.html
docs_area:
---

{% include {{ page.version.version }}/filter-tabs/crdb-single-kubernetes.md %}

This page shows you how to start and stop a secure 3-node CockroachDB cluster in a single [Kubernetes](http://kubernetes.io/) cluster, using one of the following:

- [CockroachDB Kubernetes Operator](https://github.com/cockroachdb/cockroach-operator)

    {{site.data.alerts.callout_info}}
    The CockroachDB Kubernetes Operator is also available on platforms such as [Red Hat OpenShift](deploy-cockroachdb-with-kubernetes-openshift.html) and [IBM Cloud Pak for Data](https://www.ibm.com/products/cloud-pak-for-data).
    {{site.data.alerts.end}}

- Manual [StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) configuration

- [Helm](https://helm.sh/) package manager for Kubernetes

{% include cockroachcloud/use-cockroachcloud-instead.md %}

## Limitations

{% include {{ page.version.version }}/orchestration/kubernetes-limitations.md %}

## Step 1. Start Kubernetes

{% include {{ page.version.version }}/orchestration/start-kubernetes.md %}

## Step 2. Start CockroachDB

Choose how you want to deploy and maintain the CockroachDB cluster.

{{site.data.alerts.callout_info}}
The [CockroachDB Kubernetes Operator](https://github.com/cockroachdb/cockroach-operator) eases CockroachDB cluster creation and management on a single Kubernetes cluster.

Note that the Operator does not provision or apply an Enterprise license key. To use [Enterprise features](enterprise-licensing.html) with the Operator, [set a license](licensing-faqs.html#set-a-license) in the SQL shell.
{{site.data.alerts.end}}

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="operator">Use Operator</button>
    <button class="filter-button" data-scope="manual">Use Configs</button>
    <button class="filter-button" data-scope="helm">Use Helm</button>
</div>

<section class="filter-content" markdown="1" data-scope="operator">
{% include {{ page.version.version }}/orchestration/start-cockroachdb-operator-secure.md %}
</section>

<section class="filter-content" markdown="1" data-scope="manual">
{% include {{ page.version.version }}/orchestration/start-cockroachdb-secure.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
{% include {{ page.version.version }}/orchestration/start-cockroachdb-helm-secure.md %}
</section>

## Step 3. Use the built-in SQL client

{% include {{ page.version.version }}/orchestration/test-cluster-secure.md %}

## Step 4. Access the DB Console

{% include {{ page.version.version }}/orchestration/monitor-cluster.md %}

## Step 5. Stop the cluster

{{site.data.alerts.callout_info}}
If you want to continue using this cluster, see the documentation on [configuring](configure-cockroachdb-kubernetes.html), [scaling](scale-cockroachdb-kubernetes.html), [monitoring](monitor-cockroachdb-kubernetes.html), and [upgrading](upgrade-cockroachdb-kubernetes.html) the cluster.
{{site.data.alerts.end}}

{% include {{ page.version.version }}/orchestration/kubernetes-stop-cluster.md %}

### Stop Kubernetes

To delete the Kubernetes cluster:

- Hosted GKE:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters delete cockroachdb --region {region-name}
    ~~~
- Hosted EKS:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ eksctl delete cluster --name cockroachdb
    ~~~
- Manual GCE:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cluster/kube-down.sh
    ~~~
- Manual AWS:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cluster/kube-down.sh
    ~~~

{{site.data.alerts.callout_danger}}
If you stop Kubernetes without first deleting the persistent volumes, they will still exist in your cloud project.
{{site.data.alerts.end}}

## See also

- [Resource management](configure-cockroachdb-kubernetes.html)
- [Certificate management](secure-cockroachdb-kubernetes.html)
- [Cluster monitoring](monitor-cockroachdb-kubernetes.html)
- [Kubernetes Multi-Cluster Deployment](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html)
- [Optimize Performance on Kubernetes](kubernetes-performance.html)
- [Production Checklist](recommended-production-settings.html)
