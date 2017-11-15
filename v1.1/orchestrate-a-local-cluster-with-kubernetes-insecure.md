---
title: Automated Operations
summary: Orchestrate the deployment and management of an local cluster using Kubernetes.
toc: false
---

Other tutorials in this section feature the automated operations built into CockroachDB, from [data replication and sharding](demo-data-replication.html) to [high availability](demo-fault-tolerance-and-recovery.html) to [automatic rebalancing](demo-automatic-rebalancing.html). On top of this built-in automation, you can use a third-party orchestration system to simplify and automate even more of your operations, from deployment to scaling to overall cluster management.

This page walks you through a simple demonstration of how to orchestrate the deployment and management of a CockroachDB cluster using the open-source Kubernetes [`minikube`](http://kubernetes.io/docs/getting-started-guides/minikube/) tool. Starting with a few configuration files, you'll quickly create a 3-node local cluster. You'll run a load generator against the cluster and then simulating node failure, watching how Kubernetes auto-restarts without the need for any manual intervention. You'll then scale the cluster with a single command before shutting the cluster down, again with a single command.

{{site.data.alerts.callout_info}}To orchestrate a physically distributed cluster in production, see <a href="orchestrate-cockroachdb-with-kubernetes.html">Orchestrate CockroachDB with Kubernetes</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Before You Begin

Before getting started, it's helpful to review some Kubernetes-specific terminology:

Feature | Description
--------|------------
instance | A physical or virtual machine. In this tutorial, you'll run a Kubernetes script from your local workstation that will create 4 GCE or AWS instances and join them into a single Kubernetes cluster.
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one of more Docker containers. In this tutorial, each pod will run on a separate instance and contain one Docker container running a single CockroachDB node. You'll start with 3 pods and grow to 4.
[StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) | A StatefulSet is a group of pods treated as stateful units, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart. StatefulSets are a beta feature as of Kubernetes version 1.5.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | A persistent volume is a piece of networked storage (Persistent Disk on GCE, Elastic Block Store on AWS) mounted into a pod. The lifetime of a persistent volume is decoupled from the lifetime of the pod that's using it, ensuring that each CockroachDB node binds back to the same storage on restart.<br><br>This tutorial assumes that dynamic volume provisioning is available. When that is not the case, [persistent volume claims](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) need to be created manually.

## Step 1. Start Kubernetes

Follow Kubernetes' [documentation](http://kubernetes.io/docs/getting-started-guides/minikube/) to install `minikube` and `kubectl` for your OS. Then start a local Kubernetes cluster:

{% include copy-clipboard.html %}
~~~ shell
$ minikube start
~~~

{{site.data.alerts.callout_info}}Make sure you install <code>minikube</code> version 0.21.0 or later. Earlier versions do not include a Kubernetes server that supports the <code>maxUnavailability</code> field and <code>PodDisruptionBudget</code> resource type used in the CockroachDB StatefulSet configuration.
{{site.data.alerts.end}}

## Step 2. Start CockroachDB nodes

Use our [`cockroachdb-statefulset.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset.yaml) file to create the StatefulSet:

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

## Step 3. Initialize the cluster

{% include orchestration/initialize-cluster-insecure.md %}

## Step 4. Test the cluster

{% include orchestration/test-cluster-insecure.md %}

## Step 5. Monitor the cluster

{% include orchestration/monitor-cluster.md %}

## Step 6. Simulate node failure

{% include orchestration/kubernetes-simulate-failure.md %}

## Step 7. Scale the cluster

To increase the number of pods in your cluster, use the `kubectl scale` command to alter the `replicas: 3` configuration for your StatefulSet:

{% include copy-clipboard.html %}
~~~ shell
$ kubectl scale statefulset cockroachdb --replicas=4
~~~

~~~
statefulset "cockroachdb" scaled
~~~

Verify that a fourth pod was added successfully:

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

## Step 8. Stop the cluster

- **If you plan to restart the cluster**, use the `minikube stop` command. This shuts down the minikube virtual machine but preserves all the resources you created:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ minikube stop
    ~~~

    ~~~
    Stopping local Kubernetes cluster...
    Machine stopped.
    ~~~

    You can restore the cluster to its previous state with `minikube start`.

- **If you do not plan to restart the cluster**, use the `minikube delete` command. This shuts down and deletes the minikube virtual machine and all the resources you created, including persistent volumes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ minikube delete
    ~~~

    ~~~
    Deleting local Kubernetes cluster...
    Machine deleted.
    ~~~

    {{site.data.alerts.callout_success}}To retain logs, copy them from each pod's <code>stderr</code> before deleting the cluster and all its resources. To access a pod's standard error stream, run <code>kubectl logs &lt;podname&gt;</code>.{{site.data.alerts.end}}

## See Also

Use a local cluster to explore these other core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Automatic Rebalancing](demo-automatic-rebalancing.html)
- [Automatic Cloud Migration](demo-automatic-cloud-migration.html)

You might also want to learn how to [orchestrate a production deployment of CockroachDB with Kubernetes](orchestrate-cockroachdb-with-kubernetes.html).
