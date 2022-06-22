---
title: Deploy CockroachDB in a Single Kubernetes Cluster (Insecure)
summary: Deploy an insecure 3-node CockroachDB cluster with Kubernetes.
toc: true
toc_not_nested: true
redirect_from: orchestrate-cockroachdb-with-kubernetes-insecure.html
filter_category: crdb_single_kubernetes
filter_html: Insecure
filter_sort: 2
docs_area:
---

{% include filter-tabs.md %}

This page shows you how to start and stop a 3-node CockroachDB insecure test cluster in a single [Kubernetes](http://kubernetes.io/) cluster, using one of the following:

- Manual [StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) configuration

- [Helm](https://helm.sh/) package manager for Kubernetes

{% include {{ page.version.version }}/prod-deployment/insecure-flag.md %}

The steps below demonstrate how to quickly deploy and interact with an insecure test cluster. To learn about authenticating, configuring, scaling, and upgrading a CockroachDB cluster on Kubernetes, see [Kubernetes Overview](kubernetes-overview.html).

{% include_cached cockroachcloud/use-cockroachcloud-instead.md %}

## Before you begin

Before getting started, it's helpful to review some Kubernetes-specific terminology and current limitations.

- [Kubernetes terminology](#kubernetes-terminology)
- [Limitations](#limitations)

### Kubernetes terminology

Feature | Description
--------|------------
[node](https://kubernetes.io/docs/concepts/architecture/nodes/) | A physical or virtual machine. In this tutorial, you'll create GCE or AWS instances and join them as worker nodes into a single Kubernetes cluster from your local workstation.
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one or more Docker containers. In this tutorial, each pod will run on a separate Kubernetes node and include one Docker container running a single CockroachDB node. You'll start with 3 pods and grow to 4.
[StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) | A StatefulSet is a group of pods treated as stateful units, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart. StatefulSets are considered stable as of Kubernetes version 1.9 after reaching beta in version 1.5.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | A persistent volume is a piece of networked storage (Persistent Disk on GCE, Elastic Block Store on AWS) mounted into a pod. The lifetime of a persistent volume is decoupled from the lifetime of the pod that's using it, ensuring that each CockroachDB node binds back to the same storage on restart.<br><br>This tutorial assumes that dynamic volume provisioning is available. When that is not the case, [persistent volume claims](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) need to be created manually.

### Limitations

{% include {{ page.version.version }}/orchestration/kubernetes-limitations.md %}

## Step 1. Start Kubernetes

{% include {{ page.version.version }}/orchestration/start-kubernetes.md %}

## Step 2. Start CockroachDB

Choose how you want to deploy and maintain the CockroachDB cluster.

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="manual">Use Configs</button>
    <button class="filter-button" data-scope="helm">Use Helm</button>
</div>

<section class="filter-content" markdown="1" data-scope="manual">
{% include {{ page.version.version }}/orchestration/start-cockroachdb-insecure.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
{% include {{ page.version.version }}/orchestration/start-cockroachdb-helm-insecure.md %}
</section>

## Step 3. Use the built-in SQL client

{% include {{ page.version.version }}/orchestration/test-cluster-insecure.md %}

## Step 4. Access the DB Console

{% include {{ page.version.version }}/orchestration/monitor-cluster.md %}

## Step 5. Simulate node failure

{% include {{ page.version.version }}/orchestration/kubernetes-simulate-failure.md %}

## Step 6. Stop the cluster

To shut down the CockroachDB cluster, delete the resources you created, including the logs:

    {{site.data.alerts.callout_danger}}
    This does not include deleting the persistent volumes that were attached to the pods. If you want to delete the persistent volumes and free up the storage used by CockroachDB, be sure you have a backup copy of your data. Data **cannot** be recovered once the persistent volumes are deleted. For more information, see the [Kubernetes documentation](https://kubernetes.io/docs/tasks/run-application/delete-stateful-set/#persistent-volumes).
    {{site.data.alerts.end}}

    <section class="filter-content" markdown="1" data-scope="manual">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pods,statefulsets,services,poddisruptionbudget,jobs,rolebinding,clusterrolebinding,role,clusterrole,serviceaccount,alertmanager,prometheus,prometheusrule,serviceMonitor -l app=cockroachdb
    ~~~

    ~~~
    pod "cockroachdb-0" deleted
    pod "cockroachdb-1" deleted
    pod "cockroachdb-2" deleted
    pod "cockroachdb-3" deleted
    service "alertmanager-cockroachdb" deleted
    service "cockroachdb" deleted
    service "cockroachdb-public" deleted
    poddisruptionbudget "cockroachdb-budget" deleted
    job "cluster-init" deleted
    clusterrolebinding "prometheus" deleted
    clusterrole "prometheus" deleted
    serviceaccount "prometheus" deleted
    alertmanager "cockroachdb" deleted
    prometheus "cockroachdb" deleted
    prometheusrule "prometheus-cockroachdb-rules" deleted
    servicemonitor "cockroachdb" deleted
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ helm uninstall my-release
    ~~~

    ~~~
    release "my-release" deleted
    ~~~
    </section>

### Stop Kubernetes

To delete the Kubernetes cluster:

- Hosted GKE:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters delete cockroachdb
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

## See also

- [Kubernetes Overview](kubernetes-overview.html)
- [Deploy CockroachDB on Kubernetes](deploy-cockroachdb-with-kubernetes.html)
- [Cluster monitoring](monitor-cockroachdb-kubernetes.html)
- [Kubernetes Multi-Cluster Deployment](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html)
- [Kubernetes Performance Guide](kubernetes-performance.html)
- [Production Checklist](recommended-production-settings.html)
