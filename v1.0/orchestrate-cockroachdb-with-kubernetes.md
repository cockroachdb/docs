---
title: Orchestrate CockroachDB with Kubernetes
summary: How to orchestrate the deployment and management of an insecure 3-node CockroachDB cluster with Kubernetes.
toc: true
---

This page shows you how to orchestrate the deployment and management of an insecure 3-node CockroachDB cluster with [Kubernetes](http://kubernetes.io/), using the [StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) feature.

{{site.data.alerts.callout_danger}}Deploying an <strong>insecure</strong> cluster is not recommended for data in production. We'll update this page after improving the process to deploy secure clusters.{{site.data.alerts.end}}


## Step 1. Choose your deployment environment

Choose the environment where you will run CockroachDB with Kubernetes. The instructions below will adjust based on your choice.

<div class="filters filters-big clearfix">
  <button class="filter-button" data-scope="cloud">Cloud</button>
  <button class="filter-button" data-scope="local">Local</button>
</div><p></p>

It might also be helpful to review some Kubernetes-specific terminology:

<div class="filter-content" markdown="1" data-scope="cloud">

Feature | Description
--------|------------
instance | A physical or virtual machine. In this tutorial, you'll run a Kubernetes script from your local workstation that will create 4 GCE or AWS instances and join them into a single Kubernetes cluster.
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one or more Docker containers. In this tutorial, each pod will run on a separate instance and contain one Docker container running a single CockroachDB node. You'll start with 3 pods and grow to 4.
[StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) | A StatefulSet is a group of pods treated as stateful units, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart. StatefulSets are considered stable as of Kubernetes version 1.9 after reaching beta in version 1.5.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | A persistent volume is a piece of networked storage (Persistent Disk on GCE, Elastic Block Store on AWS) mounted into a pod. The lifetime of a persistent volume is decoupled from the lifetime of the pod that's using it, ensuring that each CockroachDB node binds back to the same storage on restart.<br><br>This tutorial assumes that dynamic volume provisioning is available. When that is not the case, [persistent volume claims](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) need to be created manually.

</div>

<div class="filter-content" markdown="1" data-scope="local">

Feature | Description
--------|------------
[minikube](http://kubernetes.io/docs/getting-started-guides/minikube/) | This is the tool you'll use to run a single-node Kubernetes cluster inside a VM on your computer.
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one of more Docker containers. In this tutorial, each pod will run on a separate instance and contain one Docker container running a single CockroachDB node. You'll start with 3 pods and grow to 4.
[StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) | A StatefulSet is a group of pods treated as stateful units, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart. StatefulSets are considered stable as of Kubernetes version 1.9 after reaching beta in version 1.5.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | A persistent volume is a piece of local storage mounted into a pod. The lifetime of a persistent volume is decoupled from the lifetime of the pod that's using it, ensuring that each CockroachDB node binds back to the same storage on restart.<br><br>When using `minikube`, persistent volumes are external temporary directories that endure until they are manually deleted or until the entire Kubernetes cluster is deleted.
[persistent volume claim](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) | When pods are created (one per CockroachDB node), each pod will request a persistent volume claim to “claim” durable storage for its node.

</div>

## Step 2. Install and start Kubernetes

<div class="filter-content" markdown="1" data-scope="cloud">

From your local workstation, install prerequisites and start a Kubernetes cluster as described in the Kubernetes documentation:

- For GCE-specific instructions, see [Running Kubernetes on Google Compute Engine](https://v1-18.docs.kubernetes.io/docs/setup/production-environment/turnkey/gce/).
- For AWS-specific instructions, see [Running Kubernetes on AWS EC2](https://v1-18.docs.kubernetes.io/docs/setup/production-environment/turnkey/aws/)

The heart of this step is running a Kubernetes script that creates 4 GCE or AWS instances and joins them into a single Kubernetes cluster, all from your local workstation. You'll run subsequent steps from your local workstation as well.

</div>

<section class="filter-content" markdown="1" data-scope="local">

Follow Kubernetes' [documentation](http://kubernetes.io/docs/getting-started-guides/minikube/) to install `minikube` and `kubectl` for your OS. Then start a local Kubernetes cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ minikube start
~~~

~~~
Starting local Kubernetes cluster...
Kubectl is now configured to use the cluster.
~~~

</section>

## Step 3. Start the CockroachDB cluster

<section class="filter-content" markdown="1" data-scope="cloud">

2. From your local workstation, use our [`cockroachdb-statefulset.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset.yaml) file to create the StatefulSet:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cockroachdb-statefulset.yaml
    ~~~

2. Use the `kubectl get` command to verify that the persistent volumes and corresponding claims were created successfully:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get persistentvolumes
    ~~~

    ~~~
    NAME                                       CAPACITY   ACCESSMODES   RECLAIMPOLICY   STATUS    CLAIM                           REASON    AGE
    pvc-52f51ecf-8bd5-11e6-a4f4-42010a800002   1Gi        RWO           Delete          Bound     default/datadir-cockroachdb-0             26s
    pvc-52fd3a39-8bd5-11e6-a4f4-42010a800002   1Gi        RWO           Delete          Bound     default/datadir-cockroachdb-1             27s
    pvc-5315efda-8bd5-11e6-a4f4-42010a800002   1Gi        RWO           Delete          Bound     default/datadir-cockroachdb-2             27s
    ~~~

3. Wait a bit and then verify that three pods were created successfully. If you do not see three pods, wait longer and check again.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME            READY     STATUS    RESTARTS   AGE
    cockroachdb-0   1/1       Running   0          2m
    cockroachdb-1   1/1       Running   0          2m
    cockroachdb-2   1/1       Running   0          2m
    ~~~

</section>

<section class="filter-content" markdown="1" data-scope="local">

1. Use our [`cockroachdb-statefulset.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset.yaml) file to create the StatefulSet:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cockroachdb-statefulset.yaml
    ~~~

2. Use the `kubectl get` command to verify that the persistent volumes and corresponding claims were created successfully:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get persistentvolumes
    ~~~

    ~~~
    NAME      CAPACITY   ACCESSMODES   STATUS    CLAIM                           REASON    AGE
    pv0       1Gi        RWO           Bound     default/datadir-cockroachdb-0             27s
    pv1       1Gi        RWO           Bound     default/datadir-cockroachdb-1             26s
    pv2       1Gi        RWO           Bound     default/datadir-cockroachdb-2             26s
    ~~~

3. Wait a bit and then verify that three pods were created successfully. If you do not see three pods, wait longer and check again.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME            READY     STATUS    RESTARTS   AGE
    cockroachdb-0   1/1       Running   0          2m
    cockroachdb-1   1/1       Running   0          2m
    cockroachdb-2   1/1       Running   0          2m
    ~~~

</section>

{{site.data.alerts.callout_success}}The StatefulSet configuration sets all CockroachDB nodes to write to <code>stderr</code>, so if you ever need access to a pod/node's logs to troubleshoot, use <code>kubectl logs &lt;podname&gt;</code> rather than checking the log on the pod itself.{{site.data.alerts.end}}

## Step 4. Use the built-in SQL client

1. Start the [built-in SQL client](use-the-built-in-sql-client.html) in a one-off interactive pod, using the `cockroachdb-public` hostname to access the CockroachDB cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl run cockroachdb -it --image=cockroachdb/cockroach --rm --restart=Never \
    -- sql --insecure --host=cockroachdb-public
    ~~~

2. Run some [CockroachDB SQL statements](sql-statements.html):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO bank.accounts VALUES (1234, 10000.50);
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM bank.accounts;
    ~~~

    ~~~
    +------+----------+
    |  id  | balance  |
    +------+----------+
    | 1234 | 10000.50 |
    +------+----------+
    (1 row)
    ~~~

4. When you're done with the SQL shell, use **CTRL-D**, **CTRL-C**, or `\q` to exit and delete the temporary pod.

## Step 5. Simulate node failure

Based on the `replicas: 3` line in the StatefulSet configuration, Kubernetes ensures that three pods/nodes are running at all times. If a pod/node fails, Kubernetes will automatically create another pod/node with the same network identity and persistent storage.

To see this in action:

1. Stop one of CockroachDB nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pod cockroachdb-2
    ~~~

    ~~~
    pod "cockroachdb-2" deleted
    ~~~

2. Verify that the pod was restarted:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pod cockroachdb-2
    ~~~
    ~~~
    NAME            READY     STATUS              RESTARTS   AGE
    cockroachdb-2   0/1       ContainerCreating   0          3s
    ~~~

3. Wait a bit and then verify that the pod is ready:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pod cockroachdb-2
    ~~~

    ~~~
    NAME            READY     STATUS    RESTARTS   AGE
    cockroachdb-2   1/1       Running   0          1m
    ~~~

## Step 6. Scale the cluster

<section class="filter-content" markdown="1" data-scope="cloud">

The Kubernetes script created 4 nodes, one master and 3 workers. Pods get placed only on worker nodes, so to ensure that you do not have two pods on the same node (as recommended in our [production best practices](recommended-production-settings.html)), you need to add a new worker node and then edit your StatefulSet configuration to add another pod.

1. Add a worker node:
  - On GCE, resize your [Managed Instance Group](https://cloud.google.com/compute/docs/instance-groups/).
  - On AWS, resize your [Auto Scaling Group](https://docs.aws.amazon.com/autoscaling/latest/userguide/as-manual-scaling.html).

2. Use the `kubectl scale` command to add a pod to your StatefulSet:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl scale statefulset cockroachdb --replicas=4
    ~~~

    ~~~
    statefulset "cockroachdb" scaled
    ~~~

3. Verify that a fourth pod was added successfully:

    {% include_cached copy-clipboard.html %}
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

</section>

<section class="filter-content" markdown="1" data-scope="local">

To increase the number of pods in your cluster, use the `kubectl scale` command to alter the `replicas: 3` configuration for your StatefulSet:

{% include_cached copy-clipboard.html %}
~~~ shell
$ kubectl scale statefulset cockroachdb --replicas=4
~~~

~~~
statefulset "cockroachdb" scaled
~~~

Verify that a fourth pod was added successfully:

{% include_cached copy-clipboard.html %}
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

</section>

## Step 7. Stop the cluster

<section class="filter-content" markdown="1" data-scope="cloud">

To shut down the CockroachDB cluster:

1. Use the `kubectl delete` command to clean up all of the resources you created, including the logs and remote persistent volumes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pods,statefulsets,services,persistentvolumeclaims,persistentvolumes,poddisruptionbudget \
    -l app=cockroachdb
    ~~~

2. Run the `cluster/kube-down.sh` script in the `kubernetes` directory to stop Kubernetes.

{{site.data.alerts.callout_danger}}If you stop Kubernetes without first deleting resources, the remote persistent volumes will still exist in your cloud project.{{site.data.alerts.end}}

</section>

<section class="filter-content" markdown="1" data-scope="local">

- **If you plan to restart the cluster**, use the `minikube stop` command. This shuts down the minikube virtual machine but preserves all the resources you created:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ minikube stop
    ~~~

    ~~~
    Stopping local Kubernetes cluster...
    Machine stopped.
    ~~~

    You can restore the cluster to its previous state with `minikube start`.

- **If you do not plan to restart the cluster**, use the `minikube delete` command. This shuts down and deletes the minikube virtual machine and all the resources you created, including persistent volumes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ minikube delete
    ~~~

    ~~~
    Deleting local Kubernetes cluster...
    Machine deleted.
    ~~~

    {{site.data.alerts.callout_success}}To retain logs, copy them from each pod's <code>stderr</code> before deleting the cluster and all its resources. To access a pod's standard error stream, run <code>kubectl logs &lt;podname&gt;</code>.{{site.data.alerts.end}}

</section>

## See Also

- [Orchestrate CockroachDB with Docker Swarm](orchestrate-cockroachdb-with-docker-swarm.html)
- [Cloud Deployment](cloud-deployment.html)
- [Manual Deployment](manual-deployment.html)
- [Local Deployment](start-a-local-cluster.html)
