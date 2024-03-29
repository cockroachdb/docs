---
title: Orchestrate CockroachDB with Kubernetes (Insecure)
summary: How to orchestrate the deployment, management, and monitoring of an insecure 3-node CockroachDB cluster with Kubernetes.
toc: true
canonical: /stable/deploy-cockroachdb-with-kubernetes-insecure
---

<div class="filters filters-big clearfix">
  <a href="orchestrate-cockroachdb-with-kubernetes.html"><button class="filter-button">Secure</button>
  <button class="filter-button current"><strong>Insecure</strong></button></a>
</div>

This page shows you how to orchestrate the deployment, management, and monitoring of an insecure 3-node CockroachDB cluster in a single [Kubernetes](http://kubernetes.io/) cluster, using the [StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) feature.

To deploy across multiple Kubernetes clusters in different geographic regions instead, see [Kubernetes Multi-Cluster Deployment](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html). Also, for details about potential performance bottlenecks to be aware of when running CockroachDB in Kubernetes and guidance on how to optimize your deployment for better performance, see [CockroachDB Performance on Kubernetes](kubernetes-performance.html).

{{site.data.alerts.callout_danger}}If you plan to use CockroachDB in production, we strongly recommend using a secure cluster instead. Select <strong>Secure</strong> above for instructions.{{site.data.alerts.end}}

## Before you begin

Before getting started, it's helpful to review some Kubernetes-specific terminology and current limitations.

### Kubernetes terminology

Feature | Description
--------|------------
instance | A physical or virtual machine. In this tutorial, you'll create GCE or AWS instances and join them into a single Kubernetes cluster from your local workstation.
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one or more Docker containers. In this tutorial, each pod will run on a separate instance and include one Docker container running a single CockroachDB node. You'll start with 3 pods and grow to 4.
[StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) | A StatefulSet is a group of pods treated as stateful units, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart. StatefulSets are considered stable as of Kubernetes version 1.9 after reaching beta in version 1.5.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | A persistent volume is a piece of networked storage (Persistent Disk on GCE, Elastic Block Store on AWS) mounted into a pod. The lifetime of a persistent volume is decoupled from the lifetime of the pod that's using it, ensuring that each CockroachDB node binds back to the same storage on restart.<br><br>This tutorial assumes that dynamic volume provisioning is available. When that is not the case, [persistent volume claims](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) need to be created manually.

### Limitations

{% include {{ page.version.version }}/orchestration/kubernetes-limitations.md %}

## Step 1. Start Kubernetes

{% include {{ page.version.version }}/orchestration/start-kubernetes.md %}

## Step 2. Start CockroachDB nodes

{% include {{ page.version.version }}/orchestration/start-cluster.md %}

## Step 3. Initialize the cluster

{% include {{ page.version.version }}/orchestration/initialize-cluster-insecure.md %}

## Step 4. Use the built-in SQL client

{% include {{ page.version.version }}/orchestration/test-cluster-insecure.md %}

## Step 5. Access the Admin UI

{% include {{ page.version.version }}/orchestration/monitor-cluster.md %}

## Step 6. Simulate node failure

{% include {{ page.version.version }}/orchestration/kubernetes-simulate-failure.md %}

## Step 7. Set up monitoring and alerting

{% include {{ page.version.version }}/orchestration/kubernetes-prometheus-alertmanager.md %}

## Step 8. Maintain the cluster

### Scale the cluster

{% include {{ page.version.version }}/orchestration/kubernetes-scale-cluster.md %}

3. Verify that a fourth pod was added successfully:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                                   READY     STATUS    RESTARTS   AGE
    alertmanager-cockroachdb-0             2/2       Running   0          2m
    alertmanager-cockroachdb-1             2/2       Running   0          2m
    alertmanager-cockroachdb-2             2/2       Running   0          2m
    cockroachdb-0                          1/1       Running   0          9m
    cockroachdb-1                          1/1       Running   0          9m
    cockroachdb-2                          1/1       Running   0          7m
    cockroachdb-3                          0/1       Pending   0          5s
    prometheus-cockroachdb-0               3/3       Running   1          5m
    prometheus-operator-85dd478dbb-66lvb   1/1       Running   0          6m
    ~~~

### Upgrade the cluster

{% include {{ page.version.version }}/orchestration/kubernetes-upgrade-cluster.md %}

### Stop the cluster

To shut down the CockroachDB cluster:

1. Delete all of the resources you created, including the logs and remote persistent volumes:

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

2. Stop Kubernetes:

{% include {{ page.version.version }}/orchestration/stop-kubernetes.md %}

## See also

- [Kubernetes Multi-Cluster Deployment](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html)
- [Kubernetes Performance Guide](kubernetes-performance.html)
{% include {{ page.version.version }}/prod-deployment/prod-see-also.md %}
