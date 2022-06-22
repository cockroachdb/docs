---
title: Automated Operations
summary: Orchestrate the deployment and management of an local cluster using Kubernetes.
toc: true
---

Other tutorials in this section feature the ways that CockroachDB automates operations for you. On top of this built-in automation, you can use a third-party [orchestration](orchestration.html) system to simplify and automate even more of your operations, from deployment to scaling to overall cluster management.

This page walks you through a simple demonstration, using the open-source Kubernetes orchestration system. Starting with a few configuration files, you'll quickly create an insecure 3-node local cluster. You'll run a load generator against the cluster and then simulate node failure, watching how Kubernetes auto-restarts without the need for any manual intervention. You'll then scale the cluster with a single command before shutting the cluster down, again with a single command.

{{site.data.alerts.callout_info}}To orchestrate a physically distributed cluster in production, see <a href="orchestration.html">Orchestrated Deployment</a>.{{site.data.alerts.end}}


## Before You Begin

Before getting started, it's helpful to review some Kubernetes-specific terminology:

Feature | Description
--------|------------
[minikube](http://kubernetes.io/docs/getting-started-guides/minikube/) | This is the tool you'll use to run a Kubernetes cluster inside a VM on your local workstation.
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one or more Docker containers. In this tutorial, all pods will run on your local workstation, each containing one Docker container running a single CockroachDB node. You'll start with 3 pods and grow to 4.
[StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) | A StatefulSet is a group of pods treated as stateful units, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart. StatefulSets are considered stable as of Kubernetes version 1.9 after reaching beta in version 1.5.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | A persistent volume is a piece of local storage mounted into a pod. The lifetime of a persistent volume is decoupled from the lifetime of the pod that's using it, ensuring that each CockroachDB node binds back to the same storage on restart.<br><br>When using `minikube`, persistent volumes are external temporary directories that endure until they are manually deleted or until the entire Kubernetes cluster is deleted.
[persistent volume claim](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) | When pods are created (one per CockroachDB node), each pod will request a persistent volume claim to “claim” durable storage for its node.

## Step 1. Start Kubernetes

1. Follow Kubernetes' [documentation](https://kubernetes.io/docs/tasks/tools/install-minikube/) to install `minikube`, the tool used to run Kubernetes locally, for your OS. This includes installing a hypervisor and `kubectl`, the command-line tool used to managed Kubernetes from your local workstation.

    {{site.data.alerts.callout_info}}Make sure you install <code>minikube</code> version 0.21.0 or later. Earlier versions do not include a Kubernetes server that supports the <code>maxUnavailability</code> field and <code>PodDisruptionBudget</code> resource type used in the CockroachDB StatefulSet configuration.{{site.data.alerts.end}}

2. Start a local Kubernetes cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ minikube start
    ~~~

## Step 2. Start CockroachDB nodes

When starting a cluster manually, you run the <code>cockroach start</code> command multiple times, once per node. In this step, you use a Kubernetes StatefulSet configuration instead, reducing the effort of starting 3 nodes to a single command.

{% include {{ page.version.version }}/orchestration/start-cluster.md %}

## Step 3. Initialize the cluster

{% include {{ page.version.version }}/orchestration/initialize-cluster-insecure.md %}

## Step 4. Test the cluster

To test the cluster, launch a temporary pod for using the built-in SQL client, and then use a deployment configuration file to run a high-traffic load generator against the cluster from another pod.

{% include {{ page.version.version }}/orchestration/test-cluster-insecure.md %}

4. Use our [`example-app.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/example-app.yaml) file to launch a pod and run a load generator against the cluster from the pod:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/example-app.yaml
    ~~~

    ~~~
    deployment "example" created
    ~~~

5. Verify that the pod for the load generator was added successfully:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                      READY     STATUS    RESTARTS   AGE
    cockroachdb-0             1/1       Running   0          28m
    cockroachdb-1             1/1       Running   0          27m
    cockroachdb-2             1/1       Running   0          10m
    example-545f866f5-2gsrs   1/1       Running   0          25m
    ~~~

## Step 5. Monitor the cluster

To access the [Admin UI](admin-ui-overview.html) and monitor the cluster's state and the load generator's activity:

1. Port-forward from your local machine to one of the pods:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl port-forward cockroachdb-0 8080
    ~~~

    ~~~
    Forwarding from 127.0.0.1:8080 -> 8080
    ~~~

2. Go to <a href="http://localhost:8080/" data-proofer-ignore>http://localhost:8080</a>.

3. On the **Cluster Overview**, note that there are 3 healthy nodes with many SQL inserts executing per second across them.

    <img src="{{ 'images/v1.1/automated-operations1.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

4. Click the **Databases** tab on the left to verify that the `bank` database you created manually, as well as the `kv` database created by the load generated, are listed.

## Step 6. Simulate node failure

{% include {{ page.version.version }}/orchestration/kubernetes-simulate-failure.md %}

## Step 7. Scale the cluster

1. Use the `kubectl scale` command to add a pod for another CockroachDB node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl scale statefulset cockroachdb --replicas=4
    ~~~

    ~~~
    statefulset "cockroachdb" scaled
    ~~~

2. Verify that the pod for a fourth node, `cockroachdb-3`, was added successfully:

    {% include_cached copy-clipboard.html %}
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

## Step 8. Stop the cluster

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

## See Also

Use a local cluster to explore these other core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Automatic Rebalancing](demo-automatic-rebalancing.html)
- [Cross-Cloud Migration](demo-automatic-cloud-migration.html)
- [Follow-the-Workload](demo-follow-the-workload.html)

You might also want to learn how to [orchestrate a production deployment of CockroachDB with Kubernetes](orchestrate-cockroachdb-with-kubernetes.html).
