---
title: Deploy CockroachDB in a Single Kubernetes Cluster
summary: Deploy a secure 3-node CockroachDB cluster with Kubernetes.
toc: true
toc_not_nested: true
secure: true
docs_area:
---


This page shows you how to start and stop a secure 3-node CockroachDB cluster in a single [Kubernetes](http://kubernetes.io/) cluster. You can use any of the following approaches:

- [CockroachDB Kubernetes Operator](https://github.com/cockroachdb/cockroach-operator)

    {{site.data.alerts.callout_info}}
    The CockroachDB Kubernetes Operator is also available on platforms such as [Red Hat OpenShift]({{ page.version.version }}/deploy-cockroachdb-with-kubernetes-openshift.md) and [IBM Cloud Pak for Data](https://www.ibm.com/products/cloud-pak-for-data).
    {{site.data.alerts.end}}

- Manual [StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) configuration

- [Helm](https://helm.sh/) package manager for Kubernetes


## Best practices


## Step 1. Start Kubernetes


## Step 2. Start CockroachDB

Choose how you want to deploy and maintain the CockroachDB cluster.

{{site.data.alerts.callout_info}}
The [CockroachDB Kubernetes Operator](https://github.com/cockroachdb/cockroach-operator) eases CockroachDB cluster creation and management on a single Kubernetes cluster.

The Operator does not provision or apply an Enterprise license key. To use CockroachDB with the Operator, [set a license]({{ page.version.version }}/licensing-faqs.md#set-a-license) in the SQL shell.
{{site.data.alerts.end}}

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="operator">Use Operator</button>
    <button class="filter-button" data-scope="manual">Use Configs</button>
    <button class="filter-button" data-scope="helm">Use Helm</button>
</div>

<section class="filter-content" markdown="1" data-scope="operator">
</section>

<section class="filter-content" markdown="1" data-scope="manual">
</section>

<section class="filter-content" markdown="1" data-scope="helm">
</section>

## Step 3. Use the built-in SQL client


## Step 4. Access the DB Console


## Step 5. Stop the cluster

{{site.data.alerts.callout_info}}
If you want to continue using this cluster, refer the documentation on [configuring]({{ page.version.version }}/configure-cockroachdb-kubernetes.md), [scaling]({{ page.version.version }}/scale-cockroachdb-kubernetes.md), [monitoring]({{ page.version.version }}/monitor-cockroachdb-kubernetes.md), and [upgrading]({{ page.version.version }}/upgrade-cockroachdb-kubernetes.md) the cluster.
{{site.data.alerts.end}}


### Stop Kubernetes

To delete the Kubernetes cluster:

- Hosted GKE:

    ~~~ shell
    $ gcloud container clusters delete cockroachdb --region {region-name}
    ~~~
- Hosted EKS:

    ~~~ shell
    $ eksctl delete cluster --name cockroachdb
    ~~~
- Manual GCE:

    ~~~ shell
    $ cluster/kube-down.sh
    ~~~
- Manual AWS:

    ~~~ shell
    $ cluster/kube-down.sh
    ~~~

{{site.data.alerts.callout_danger}}
If you stop Kubernetes without first deleting the persistent volumes, they will still exist in your cloud project.
{{site.data.alerts.end}}

## See also

- [Resource management]({{ page.version.version }}/configure-cockroachdb-kubernetes.md)
- [Certificate management]({{ page.version.version }}/secure-cockroachdb-kubernetes.md)
- [Cluster monitoring]({{ page.version.version }}/monitor-cockroachdb-kubernetes.md)
- [Kubernetes Multi-Cluster Deployment]({{ page.version.version }}/orchestrate-cockroachdb-with-kubernetes-multi-cluster.md)
- [Optimize Performance on Kubernetes]({{ page.version.version }}/kubernetes-performance.md)
- [Production Checklist]({{ page.version.version }}/recommended-production-settings.md)