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

## Step 3. Start the CockroachDB cluster

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

2. Use the `kubectl get` command to verify that the persistent volumes and corresponding claims were created successfully:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get persistentvolumes
    ~~~

    ~~~
    NAME                                       CAPACITY   ACCESSMODES   RECLAIMPOLICY   STATUS    CLAIM                           REASON    AGE
    pvc-52f51ecf-8bd5-11e6-a4f4-42010a800002   1Gi        RWO           Delete          Bound     default/datadir-cockroachdb-0             26s
    pvc-52fd3a39-8bd5-11e6-a4f4-42010a800002   1Gi        RWO           Delete          Bound     default/datadir-cockroachdb-1             27s
    pvc-5315efda-8bd5-11e6-a4f4-42010a800002   1Gi        RWO           Delete          Bound     default/datadir-cockroachdb-2             27s
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

## Step 4. Monitor the cluster

To access the cluster's [Admin UI](admin-ui-overview.html):

1. Port-forward from your local machine to one of the pods:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl port-forward cockroachdb-0 8080
    ~~~

    ~~~
    Forwarding from 127.0.0.1:8080 -> 8080
    ~~~

2. Go to <a href="http://localhost:8080/">https://localhost:8080</a>.

3. In the UI, verify that the cluster is running as expected:
    - Click **View nodes list** on the right to ensure that all nodes successfully joined the cluster.
    - Click the **Databases** tab on the left to verify that `bank` is listed.

## Step 5. Simulate node failure

{% include orchestration/kubernetes-simulate-failure.md %}

## Step 6. Scale the cluster

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

## Step 6. Stop the cluster

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

    <div class="filter-content" markdown="1" data-scope="gce-hosted">

    {% include copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters delete cockroachdb
    ~~~

    </div>

    <div class="filter-content" markdown="1" data-scope="gce-manual">

    ~~~ shell
    $ cluster/kube-down.sh
    ~~~

    </div>

    <div class="filter-content" markdown="1" data-scope="aws">

    ~~~ shell
    $ cluster/kube-down.sh
    ~~~

    </div>

    {{site.data.alerts.callout_danger}}If you stop Kubernetes without first deleting resources, the remote persistent volumes will still exist in your cloud project.{{site.data.alerts.end}}

## See Also

- [Orchestrate CockroachDB with Docker Swarm](orchestrate-cockroachdb-with-docker-swarm.html)
- [Cloud Deployment](cloud-deployment.html)
- [Manual Deployment](manual-deployment.html)
- [Local Deployment](start-a-local-cluster.html)
