---
title: Orchestrate a Local Cluster with Kubernetes (Insecure)
summary: Use Kubernetes to orchestrate an insecure multi-node CockroachDB cluster locally with each node listening on a different port.
toc: false
---

<div class="filters filters-big clearfix">
  <a href="orchestrate-a-local-cluster-with-kubernetes.html"><button class="filter-button">Secure</button></a>
  <button class="filter-button current"><strong>Insecure</strong></button>
</div>

Orchestration systems such as Kubernetes automate the deployment, scaling, and management of containerized applications. Combined with CockroachDB's [automated sharding](frequently-asked-questions.html#how-does-cockroachdb-scale) and [fault tolerance](frequently-asked-questions.html#how-does-cockroachdb-survive-failures), they have the potential to lower operator overhead to almost nothing.

This page shows you how to orchestrate an **insecure** multi-node CockroachDB cluster locally using the Kubernetes' [`minikube`](http://kubernetes.io/docs/getting-started-guides/minikube/) tool and beta [StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) feature.

<div id="toc"></div>

## Step 1. Install and start Kubernetes

Follow Kubernetes' [documentation](http://kubernetes.io/docs/getting-started-guides/minikube/) to install `minikube` and `kubectl` for your OS. Then start a local Kubernetes cluster:

{% include copy-clipboard.html %}
~~~ shell
$ minikube start
~~~

## Step 2. Start the CockroachDB cluster

1. Use our [`cockroachdb-statefulset.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset.yaml) file to create the StatefulSet:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cockroachdb-statefulset.yaml
    ~~~

2. Use the `kubectl get` command to verify that the persistent volumes and corresponding claims were created successfully:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get persistentvolumes
    ~~~

    ~~~
    NAME      CAPACITY   ACCESSMODES   STATUS    CLAIM                           REASON    AGE
    pv0       1Gi        RWO           Bound     default/datadir-cockroachdb-0             27s
    pv1       1Gi        RWO           Bound     default/datadir-cockroachdb-1             26s
    pv2       1Gi        RWO           Bound     default/datadir-cockroachdb-2             26s
    ~~~

3. Wait a bit and then verify that three pods were created successfully. If you don't see three pods, wait longer and check again.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME            READY     STATUS    RESTARTS   AGE
    cockroachdb-0   1/1       Running   0          2m
    cockroachdb-1   1/1       Running   0          2m
    cockroachdb-2   1/1       Running   0          2m
    ~~~

{{site.data.alerts.callout_success}}The StatefulSet configuration sets all CockroachDB nodes to write to <code>stderr</code>, so if you ever need access to a pod/node's logs to troubleshoot, use <code>kubectl logs &lt;podname&gt;</code> rather than checking the log on the pod itself.{{site.data.alerts.end}}

## Step 3. Test the cluster

1. Start the [built-in SQL client](use-the-built-in-sql-client.html) in a one-off interactive pod, using the `cockroachdb-public` hostname to access the CockroachDB cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl run cockroachdb -it --image=cockroachdb/cockroach --rm --restart=Never \
    -- sql --insecure --host=cockroachdb-public
    ~~~

2. Run some basic [CockroachDB SQL statements](learn-cockroachdb-sql.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO bank.accounts VALUES (1, 1000.50);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM bank.accounts;
    ~~~

    ~~~
    +----+---------+
    | id | balance |
    +----+---------+
    |  1 |  1000.5 |
    +----+---------+
    (1 row)
    ~~~

3. When you're done with the SQL shell, use **CTRL + D**, **CTRL + C**, or `\q` to exit and delete the temporary pod.

## Step 4. Simulate node failure

Based on the `replicas: 3` line in the StatefulSet configuration, Kubernetes ensures that three pods/nodes are running at all times. If a pod/node fails, Kubernetes will automatically create another pod/node with the same network identity and persistent storage.

To see this in action:

1. Kill one of CockroachDB nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pod cockroachdb-2
    ~~~

    ~~~
    pod "cockroachdb-2" deleted
    ~~~

2. Verify that the pod was restarted:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pod cockroachdb-2
    ~~~

    ~~~
    NAME            READY     STATUS              RESTARTS   AGE
    cockroachdb-2   0/1       ContainerCreating   0          3s
    ~~~

3. Wait a bit and then verify that the pod is ready:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pod cockroachdb-2
    ~~~

    ~~~
    NAME            READY     STATUS    RESTARTS   AGE
    cockroachdb-2   1/1       Running   0          1m
    ~~~

## Step 5. Scale the cluster

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

## Step 6. Stop the cluster

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
