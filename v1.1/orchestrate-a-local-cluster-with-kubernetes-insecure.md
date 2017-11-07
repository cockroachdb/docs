---
title: Orchestrate a Local Cluster with Kubernetes (Insecure)
summary: Use Kubernetes to orchestrate an insecure multi-node CockroachDB cluster locally with each node listening on a different port.
toc: false
---

Orchestration systems such as Kubernetes automate the deployment, scaling, and management of containerized applications. Combined with CockroachDB's [automated sharding](frequently-asked-questions.html#how-does-cockroachdb-scale) and [fault tolerance](frequently-asked-questions.html#how-does-cockroachdb-survive-failures), they have the potential to lower operator overhead to almost nothing.

This page shows you how to orchestrate an **insecure** multi-node CockroachDB cluster locally using the Kubernetes' [`minikube`](http://kubernetes.io/docs/getting-started-guides/minikube/) tool and beta [StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) feature. Guidance on **secure** local orchestration are coming soon.

{{site.data.alerts.callout_info}}To orchestrate a production deployment of CockroachDB, see <a href="orchestrate-cockroachdb-with-kubernetes.html">Orchestrate CockroachDB with Kubernetes</a>.{{site.data.alerts.end}}

<div id="toc"></div>

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

{% include orchestration/monitor-cluster-insecure.md %}

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

- Learn how to [orchestrate a production deployment of CockroachDB with Kubernetes](orchestrate-cockroachdb-with-kubernetes.html)
- Learn more about [CockroachDB SQL](learn-cockroachdb-sql.html) and the [built-in SQL client](use-the-built-in-sql-client.html)
- [Install the client driver](install-client-drivers.html) for your preferred language
- [Build an app with CockroachDB](build-an-app-with-cockroachdb.html)
- [Explore core CockroachDB features](demo-data-replication.html) like automatic replication, rebalancing, and fault tolerance
