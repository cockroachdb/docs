---
title: Orchestrate CockroachDB in a Single Kubernetes Cluster (Insecure)
summary: How to orchestrate the deployment, management, and monitoring of an insecure 3-node CockroachDB cluster with Kubernetes.
toc: true
toc_not_nested: true
---

<div class="filters filters-big clearfix">
  <a href="orchestrate-cockroachdb-with-kubernetes.html"><button class="filter-button">Secure</button></a>
  <button class="filter-button current"><strong>Insecure</strong></button>
</div>

This page shows you how to orchestrate the deployment, management, and monitoring of an insecure 3-node CockroachDB cluster in a single [Kubernetes](http://kubernetes.io/) cluster, using the [StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) feature directly or via the [Helm](https://helm.sh/) Kubernetes package manager.

{% include {{ page.version.version }}/prod-deployment/insecure-flag.md %}

To deploy across multiple Kubernetes clusters in different geographic regions instead, see [Kubernetes Multi-Cluster Deployment](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html). Also, for details about potential performance bottlenecks to be aware of when running CockroachDB in Kubernetes and guidance on how to optimize your deployment for better performance, see [CockroachDB Performance on Kubernetes](kubernetes-performance.html).

{% include cockroachcloud/use-cockroachcloud-instead.md %}

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

To start your CockroachDB cluster, you can either use our StatefulSet configuration and related files directly, or you can use the [Helm](https://helm.sh/) package manager for Kubernetes to simplify the process.

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="helm">Use Helm</button>
    <button class="filter-button" data-scope="manual">Use Configs</button>
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

## Step 6. Monitor the cluster

{% include {{ page.version.version }}/orchestration/kubernetes-prometheus-alertmanager.md %}

## Step 7. Maintain the cluster

- [Add nodes](#add-nodes)
- [Remove nodes](#remove-nodes)
- [Expand disk size](#expand-disk-size)
- [Upgrade the cluster](#upgrade-the-cluster)
- [Stop the cluster](#stop-the-cluster)

### Add nodes

{% include {{ page.version.version }}/orchestration/kubernetes-scale-cluster.md %}

### Remove nodes

{% include {{ page.version.version }}/orchestration/kubernetes-remove-nodes-insecure.md %}

### Expand disk size

{% include {{ page.version.version }}/orchestration/kubernetes-expand-disk-size.md %}

### Upgrade the cluster

{% include {{ page.version.version }}/orchestration/kubernetes-upgrade-cluster.md %}

### Stop the cluster

To shut down the CockroachDB cluster:

1. Delete all of the resources you created, including the logs and remote persistent volumes:

    <section class="filter-content" markdown="1" data-scope="manual">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pods,statefulsets,services,persistentvolumeclaims,persistentvolumes,poddisruptionbudget,jobs,rolebinding,clusterrolebinding,role,clusterrole,serviceaccount,alertmanager,prometheus,prometheusrule,serviceMonitor -l app=cockroachdb
    ~~~

    ~~~
    pod "cockroachdb-0" deleted
    pod "cockroachdb-1" deleted
    pod "cockroachdb-2" deleted
    pod "cockroachdb-3" deleted
    service "alertmanager-cockroachdb" deleted
    service "cockroachdb" deleted
    service "cockroachdb-public" deleted
    persistentvolumeclaim "datadir-cockroachdb-0" deleted
    persistentvolumeclaim "datadir-cockroachdb-1" deleted
    persistentvolumeclaim "datadir-cockroachdb-2" deleted
    persistentvolumeclaim "datadir-cockroachdb-3" deleted
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
    {% include copy-clipboard.html %}
    ~~~ shell
    $ helm uninstall my-release
    ~~~

    ~~~
    release "my-release" deleted
    ~~~
    </section>

2. Stop Kubernetes:
    - Hosted GKE:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ gcloud container clusters delete cockroachdb
        ~~~
    - Hosted EKS:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ eksctl delete cluster --name cockroachdb
        ~~~    
    - Manual GCE:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ cluster/kube-down.sh
        ~~~
    - Manual AWS:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ cluster/kube-down.sh
        ~~~

    {{site.data.alerts.callout_danger}}
    If you stop Kubernetes without first deleting the persistent volumes, they will still exist in your cloud project.
    {{site.data.alerts.end}}

## See also

- [Kubernetes Multi-Cluster Deployment](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html)
- [Kubernetes Performance Guide](kubernetes-performance.html)
{% include {{ page.version.version }}/prod-deployment/prod-see-also.md %}
