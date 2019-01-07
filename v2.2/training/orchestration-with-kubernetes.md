---
title: Orchestration with Kubernetes
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vT1GMwEQx4USCuIdhsKVWECdBcyXgjB69uO3tLiePzec3ULRAx46jiq-9FKCBar-wp2UMPJVC5UTNqD/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

## Before you begin

In this lab, you'll start with a fresh cluster, so make sure you've stopped and cleaned up the cluster from the previous labs.

Also, before getting started, it's helpful to review some Kubernetes-specific terminology:

Feature | Description
--------|------------
[minikube](http://kubernetes.io/docs/getting-started-guides/minikube/) | This is the tool you'll use to run a Kubernetes cluster inside a VM on your local workstation.
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one of more Docker containers. In this tutorial, all pods will run on your local workstation, each containing one Docker container running a single CockroachDB node. You'll start with 3 pods and grow to 4.
[StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) | A StatefulSet is a group of pods treated as stateful units, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart. StatefulSets require Kubernetes version 1.9 or newer.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | A persistent volume is a piece of storage mounted into a pod. The lifetime of a persistent volume is decoupled from the lifetime of the pod that's using it, ensuring that each CockroachDB node binds back to the same storage on restart.<br><br>When using `minikube`, persistent volumes are external temporary directories that endure until they are manually deleted or until the entire Kubernetes cluster is deleted.
[persistent volume claim](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) | When pods are created (one per CockroachDB node), each pod will request a persistent volume claim to “claim” durable storage for its node.

## Step 1. Start Kubernetes

1. Follow Kubernetes' [documentation](https://kubernetes.io/docs/tasks/tools/install-minikube/) to install `minikube`, the tool used to run Kubernetes locally, for your OS. This includes installing a hypervisor and `kubectl`, the command-line tool used to managed Kubernetes from your local workstation.

    {{site.data.alerts.callout_info}}
    Make sure you install `minikube` version 0.21.0 or later. Earlier versions do not include a Kubernetes server that supports the `maxUnavailability` field and `PodDisruptionBudget` resource type used in the CockroachDB StatefulSet configuration.
    {{site.data.alerts.end}}

2. Start a local Kubernetes cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ minikube start
    ~~~

## Step 2. Start CockroachDB

To start your CockroachDB cluster, you can use our StatefulSet configuration and related files directly.

{% include {{ page.version.version }}/orchestration/start-cockroachdb-secure-training.md %}

## Step 3. Use the built-in SQL client

{% include {{ page.version.version }}/orchestration/test-cluster-secure.md %}

## Step 4. Access the Admin UI

{% include {{ page.version.version }}/orchestration/monitor-cluster.md %}

## Step 5. Simulate node failure

{% include {{ page.version.version }}/orchestration/kubernetes-simulate-failure.md %}

## Step 6. Add nodes

1. Use the `kubectl scale` command to add a pod for another CockroachDB node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl scale statefulset cockroachdb --replicas=4
    ~~~

    ~~~
    statefulset "cockroachdb" scaled
    ~~~

2. Verify that the pod for a fourth node, `cockroachdb-3`, was added successfully:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                      READY     STATUS    RESTARTS   AGE
    cockroachdb-0             1/1       Running   0          28m
    cockroachdb-1             1/1       Running   0          27m
    cockroachdb-2             1/1       Running   0          10m
    cockroachdb-3             1/1       Running   0          5s
    example-545f866f5-2gsrs   1/1       Running   0          25m
    ~~~

## Step 7. Remove nodes

{% include {{ page.version.version }}/orchestration/kubernetes-remove-nodes-secure.md %}

## Step 8. Clean up

In the next module, you'll start with a fresh, non-orchestrated cluster. Delete the StatefulSet configuration file and use the `minikube delete` command to shut down and delete the minikube virtual machine and all the resources you created, including persistent volumes:

{% include copy-clipboard.html %}
~~~ shell
$ kubectl delete -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cockroachdb-statefulset.yaml
~~~

{% include copy-clipboard.html %}
~~~ shell
$ kubectl delete job.batch/cluster-init
~~~

{% include copy-clipboard.html %}
~~~ shell
$ minikube delete
~~~

~~~
Deleting local Kubernetes cluster...
Machine deleted.
~~~

{{site.data.alerts.callout_success}}
To retain logs, copy them from each pod's `stderr` before deleting the cluster and all its resources. To access a pod's standard error stream, run `kubectl logs &lt;podname&gt;`.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
For information on how to optimize your deployment of CockroachDB on Kubernetes, see [CockroachDB Performance on Kubernetes](kubernetes-performance.html).
{{site.data.alerts.end}}

## What's next?

[Performance Benchmarking](performance-benchmarking.html)
