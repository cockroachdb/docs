---
title: Orchestrate CockroachDB with Kubernetes (Insecure)
summary: How to orchestrate the deployment and management of an insecure 3-node CockroachDB cluster with Kubernetes.
toc: false
---

<div class="filters filters-big clearfix">
  <a href="orchestrate-cockroachdb-with-kubernetes.html"><button class="filter-button">Secure</button>
  <button class="filter-button current"><strong>Insecure</strong></button></a>
</div>

This page shows you how to orchestrate the deployment and management of an insecure 3-node CockroachDB cluster with [Kubernetes](http://kubernetes.io/), using the beta [StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) feature.

{{site.data.alerts.callout_danger}}If you plan to use CockroachDB in production, we strongly recommend using a secure cluster instead. Select <strong>Secure</strong> above for instructions.{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}Running a stateful application such as CockroachDB on Kubernetes requires using some of Kubernetes' more complex features at a <a href="http://kubernetes.io/docs/api/#api-versioning">beta level</a> of support. There are easier ways to run CockroachDB on Kubernetes for testing purposes, but the method presented here is destined to become a production deployment once Kubernetes matures sufficiently.{{site.data.alerts.end}}

<div id="toc"></div>

## Before You Begin

Before getting started, it's helpful to review some Kubernetes-specific terminology and current limitations.

### Kubernetes Terminology

Feature | Description
--------|------------
instance | A physical or virtual machine. In this tutorial, you'll create GCE or AWS instances and join them into a single Kubernetes cluster from your local workstation.
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one of more Docker containers. In this tutorial, each pod will run on a separate instance and include one Docker container running a single CockroachDB node. You'll start with 3 pods and grow to 4.
[StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) | A StatefulSet is a group of pods treated as stateful units, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart. StatefulSets are a beta feature as of Kubernetes version 1.5.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | A persistent volume is a piece of networked storage (Persistent Disk on GCE, Elastic Block Store on AWS) mounted into a pod. The lifetime of a persistent volume is decoupled from the lifetime of the pod that's using it, ensuring that each CockroachDB node binds back to the same storage on restart.<br><br>This tutorial assumes that dynamic volume provisioning is available. When that is not the case, [persistent volume claims](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) need to be created manually.

{% include orchestration/kubernetes-limitations.md %}

{% include orchestration/start-kubernetes.md %}

## Step 3. Start CockroachDB nodes

From your local workstation, use our [`cockroachdb-statefulset.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset.yaml) file to create the StatefulSet:

{% include copy-clipboard.html %}
~~~ shell
$ kubectl create -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cockroachdb-statefulset.yaml
~~~

~~~
service "cockroachdb-public" created
service "cockroachdb" created
poddisruptionbudget "cockroachdb-budget" created
statefulset "cockroachdb" created
~~~

## Step 4. Initialize the cluster

{% include orchestration/initialize-cluster-insecure.md %}

## Step 5. Test the cluster

{% include orchestration/test-cluster-insecure.md %}

## Step 6. Monitor the cluster

{% include orchestration/monitor-cluster-insecure.md %}

## Step 7. Simulate node failure

{% include orchestration/kubernetes-simulate-failure.md %}

## Step 8. Scale the cluster

{% include orchestration/kubernetes-scale-cluster.md %}

3. Verify that a fourth pod was added successfully:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME            READY     STATUS    RESTARTS   AGE
    cockroachdb-0   1/1       Running   0          2h
    cockroachdb-1   1/1       Running   0          2h
    cockroachdb-2   1/1       Running   0          9m
    cockroachdb-3   1/1       Running   0          46s
    ~~~

## Step 9. Stop the cluster

To shut down the CockroachDB cluster:

1. Delete all of the resources you created, including the logs and remote persistent volumes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pods,statefulsets,services,persistentvolumeclaims,persistentvolumes,poddisruptionbudget \
    -l app=cockroachdb
    ~~~

    ~~~
    pod "cockroachdb-0" deleted
    pod "cockroachdb-1" deleted
    pod "cockroachdb-2" deleted
    pod "cockroachdb-3" deleted
    statefulset "cockroachdb" deleted
    service "cockroachdb" deleted
    service "cockroachdb-public" deleted
    persistentvolumeclaim "datadir-cockroachdb-0" deleted
    persistentvolumeclaim "datadir-cockroachdb-1" deleted
    persistentvolumeclaim "datadir-cockroachdb-2" deleted
    persistentvolumeclaim "datadir-cockroachdb-3" deleted
    poddisruptionbudget "cockroachdb-budget" deleted
    ~~~

2. Stop Kubernetes:

{% include orchestration/stop-kubernetes.md %}

## See Also

- [Orchestrate CockroachDB with Docker Swarm](orchestrate-cockroachdb-with-docker-swarm.html)
- [Cloud Deployment](cloud-deployment.html)
- [Manual Deployment](manual-deployment.html)
- [Local Deployment](start-a-local-cluster.html)
