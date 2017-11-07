---
title: Orchestrate CockroachDB with Kubernetes
summary: How to orchestrate the deployment and management of a secure 3-node CockroachDB cluster with Kubernetes.
toc: false
---

<div class="filters filters-big clearfix">
  <button class="filter-button current"><strong>Secure</strong></button>
  <a href="orchestrate-cockroachdb-with-kubernetes-insecure.html"><button class="filter-button">Insecure</button></a>
</div>

This page shows you how to orchestrate the deployment and management of a secure 3-node CockroachDB cluster with [Kubernetes](http://kubernetes.io/), using the beta [StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) feature.

If you are only testing CockroachDB, or you are not concerned with protecting network communication with TLS encryption, you can use an insecure cluster instead. Select **Insecure** above for instructions.

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
[CSR](https://kubernetes.io/docs/tasks/tls/managing-tls-in-a-cluster/) | A CSR, or Certificate Signing Request, is a request to have a TLS certificate signed by the Kubernetes cluster's built-in CA. As each pod is created, it issues a CSR for the CockroachDB node running in the pod, which must be manually checked and approved. The same is true for clients as they connect to the cluster.

{% include orchestration/kubernetes-limitations.md %}

{% include orchestration/start-kubernetes.md %}

## Step 3. Start the CockroachDB cluster

From your local workstation, use our [`cockroachdb-statefulset-secure.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset-secure.yaml) file to create the StatefulSet:

{% include copy-clipboard.html %}
~~~ shell
$ kubectl create -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cockroachdb-statefulset-secure.yaml
~~~

~~~
service "cockroachdb-public" created
service "cockroachdb" created
poddisruptionbudget "cockroachdb-budget" created
statefulset "cockroachdb" created
~~~

## Step 4. Approve node certificates

As each pod is created, it issues a Certificate Signing Request, or CSR, to have the node's certificate signed by the Kubernetes CA. You must manually check and approve each node's certificates, at which point the CockroachDB node is started in the pod.

1. Wait for pod 1 to reach status `Init:1/2`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME            READY     STATUS     RESTARTS   AGE
    cockroachdb-0   0/1       Init:1/2   0          32s
    ~~~

2. Get the name of the `Pending` CSR for pod 1:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get csr
    ~~~

    ~~~
    NAME                                                   AGE       REQUESTOR                               CONDITION
    default.node.cockroachdb-0                             1m        system:serviceaccount:default:default   Pending
    node-csr-0Xmb4UTVAWMEnUeGbW4KX1oL4XV_LADpkwjrPtQjlZ4   4m        kubelet                                 Approved,Issued
    node-csr-NiN8oDsLhxn0uwLTWa0RWpMUgJYnwcFxB984mwjjYsY   4m        kubelet                                 Approved,Issued
    node-csr-aU78SxyU69pDK57aj6txnevr7X-8M3XgX9mTK0Hso6o   5m        kubelet                                 Approved,Issued
    ~~~

3. Examine the CSR for pod 1:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl describe csr default.node.cockroachdb-0
    ~~~

    ~~~
    Name:               default.node.cockroachdb-0
    Labels:             <none>
    Annotations:        <none>
    CreationTimestamp:  Thu, 09 Nov 2017 13:39:37 -0500
    Requesting User:    system:serviceaccount:default:default
    Status:             Pending
    Subject:
      Common Name:    node
      Serial Number:
      Organization:   Cockroach
    Subject Alternative Names:
             DNS Names:     localhost
                            cockroachdb-0.cockroachdb.default.svc.cluster.local
                            cockroachdb-public
             IP Addresses:  127.0.0.1
                            10.48.1.6
    Events:  <none>
    ~~~

4. If everything looks correct, approve the CSR for pod 1:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl certificate approve default.node.cockroachdb-0
    ~~~

    ~~~
    certificatesigningrequest "default.node.cockroachdb-0" approved
    ~~~

    Otherwise, run:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl certificate deny default.node.cockroachdb-0
    ~~~

5. Repeat steps 1-4 for the other 2 pods.

## Step 5. Verify the cluster and its resources

1. Verify that three pods are `Running` successfully:

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

2. Verify that the persistent volumes and corresponding claims were created successfully for all three pods:

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

{{site.data.alerts.callout_success}}The StatefulSet configuration sets all CockroachDB nodes to write to <code>stderr</code>, so if you ever need access to a pod/node's logs to troubleshoot, use <code>kubectl logs &lt;podname&gt;</code> rather than checking the log on the pod itself.{{site.data.alerts.end}}

## Step 6. Test the cluster

To use the built-in SQL client, you need to launch a pod that runs indefinitely with the `cockroach` binary inside it, check and approve the CSR for the pod, get a shell into the pod, and then start the built-in SQL client.

1. From your local workstation, use our [`cockroachdb-client-secure.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset.yaml) file to launch a pod and keep it running indefinitely:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cockroachdb-client-secure.yaml
    ~~~

2. Get the name of the `Pending` CSR for the new pod:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get csr
    ~~~

    ~~~
    NAME                                                   AGE       REQUESTOR                               CONDITION
    default.client.root                                    17s       system:serviceaccount:default:default   Pending
    default.node.cockroachdb-0                             33m       system:serviceaccount:default:default   Approved,Issued
    default.node.cockroachdb-1                             21m       system:serviceaccount:default:default   Approved,Issued
    default.node.cockroachdb-2                             18m       system:serviceaccount:default:default   Approved,Issued
    node-csr-0Xmb4UTVAWMEnUeGbW4KX1oL4XV_LADpkwjrPtQjlZ4   36m       kubelet                                 Approved,Issued
    node-csr-NiN8oDsLhxn0uwLTWa0RWpMUgJYnwcFxB984mwjjYsY   36m       kubelet                                 Approved,Issued
    node-csr-aU78SxyU69pDK57aj6txnevr7X-8M3XgX9mTK0Hso6o   36m       kubelet                                 Approved,Issued
    ~~~

3. Examine the CSR for the new pod:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl describe csr default.client.root
    ~~~

    ~~~
    Name:               default.client.root
    Labels:             <none>
    Annotations:        <none>
    CreationTimestamp:  Fri, 10 Nov 2017 10:03:35 -0500
    Requesting User:    system:serviceaccount:default:default
    Status:             Pending
    Subject:
             Common Name:    root
             Serial Number:
             Organization:   Cockroach
    Events:  <none>
    ~~~

4. If everything looks correct, approve the CSR for the new pod:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl certificate approve default.client.root
    ~~~

    ~~~
    certificatesigningrequest "default.client.root" approved
    ~~~

    Otherwise, run:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl certificate deny default.client.root
    ~~~

5. Get the name of the new pod:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                                         READY     STATUS    RESTARTS   AGE
    cockroachdb-client-secure-3534299328-h1vp7   1/1       Running   0          1m
    cockroachdb-0                                1/1       Running   0          34m
    cockroachdb-1                                1/1       Running   0          23m
    cockroachdb-2                                1/1       Running   0          20m
    ~~~

6. Get a shell into the pod and start the CockroachDB [built-in SQL client](use-the-built-in-sql-client.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure-3534299328-h1vp7 -- ./cockroach sql --certs-dir=/cockroach-certs --host=cockroachdb-public
    ~~~

    ~~~
    # Welcome to the cockroach SQL interface.
    # All statements must be terminated by a semicolon.
    # To exit: CTRL + D.
    #
    # Server version: CockroachDB CCL v1.1.2 (linux amd64, built 2017/11/02 19:32:03, go1.8.3) (same version as client)
    # Cluster ID: 3292fe08-939f-4638-b8dd-848074611dba
    #
    # Enter \? for a brief introduction.
    #
    root@cockroachdb-public:26257/>
    ~~~

7. Run some basic [CockroachDB SQL statements](learn-cockroachdb-sql.html):

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

3. When you're done with the SQL shell, use **CTRL + D**, **CTRL + C**, or `\q` to exit the pod.

{{site.data.alerts.callout_success}}This pod will continue running indefinitely, so any time you need to reopen the built-in SQL client or run any other <a href="cockroach-commands.html"><code>cockroach</code> client commands</a>, such as <code>cockorach node</code> or <code>cockroach zone</code>, repeat step 6 using the appropriate <code>cockroach</code> command.<br>{{site.data.alerts.end}}

## Step 7. Monitor the cluster

To access the cluster's [Admin UI](admin-ui-overview.html):

1. Port-forward from your local machine to one of the pods:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl port-forward cockroachdb-0 8080
    ~~~

    ~~~
    Forwarding from 127.0.0.1:8080 -> 8080
    ~~~

2. Go to <a href="https://localhost:8080/">https://localhost:8080</a>. Note that your browser will consider the CockroachDB-created certificate invalid; you’ll need to click through a warning message to get to the UI.

3. In the UI, verify that the cluster is running as expected:
    - Click **View nodes list** on the right to ensure that all nodes successfully joined the cluster.
    - Click the **Databases** tab on the left to verify that `bank` is listed.

## Step 8. Simulate node failure

{% include orchestration/kubernetes-simulate-failure.md %}

## Step 9. Scale the cluster

{% include orchestration/kubernetes-scale-cluster.md %}

3. Wait for the new pod to reach status `Init:1/2`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                                         READY     STATUS     RESTARTS   AGE
    cockroachdb-client-secure-3534299328-h1vp7   1/1       Running    0          1h
    cockroachdb-0                                1/1       Running    0          1h
    cockroachdb-1                                1/1       Running    0          1h
    cockroachdb-2                                1/1       Running    0          5m
    cockroachdb-3                                0/1       Init:1/2   0          21s
    ~~~

4. Get the name of the `Pending` CSR for the new pod:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get csr
    ~~~

    ~~~
    NAME                                                   AGE       REQUESTOR                               CONDITION
    default.client.root                                    1h        system:serviceaccount:default:default   Approved,Issued
    default.node.cockroachdb-0                             1h        system:serviceaccount:default:default   Approved,Issued
    default.node.cockroachdb-1                             1h        system:serviceaccount:default:default   Approved,Issued
    default.node.cockroachdb-2                             1h        system:serviceaccount:default:default   Approved,Issued
    default.node.cockroachdb-3                             2m        system:serviceaccount:default:default   Pending
    node-csr-0Xmb4UTVAWMEnUeGbW4KX1oL4XV_LADpkwjrPtQjlZ4   1h        kubelet                                 Approved,Issued
    node-csr-NiN8oDsLhxn0uwLTWa0RWpMUgJYnwcFxB984mwjjYsY   1h        kubelet                                 Approved,Issued
    node-csr-aU78SxyU69pDK57aj6txnevr7X-8M3XgX9mTK0Hso6o   1h        kubelet                                 Approved,Issued
    ~~~

5. Examine the CSR for the new pod:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl describe csr default.node.cockroachdb-3
    ~~~

    ~~~
    Name:               default.node.cockroachdb-0
    Labels:             <none>
    Annotations:        <none>
    CreationTimestamp:  Thu, 09 Nov 2017 13:39:37 -0500
    Requesting User:    system:serviceaccount:default:default
    Status:             Pending
    Subject:
      Common Name:    node
      Serial Number:
      Organization:   Cockroach
    Subject Alternative Names:
             DNS Names:     localhost
                            cockroachdb-0.cockroachdb.default.svc.cluster.local
                            cockroachdb-public
             IP Addresses:  127.0.0.1
                            10.48.1.6
    Events:  <none>
    ~~~

6. If everything looks correct, approve the CSR for the new pod:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl certificate approve default.node.cockroachdb-3
    ~~~

    ~~~
    certificatesigningrequest "default.node.cockroachdb-3" approved
    ~~~

    Otherwise, run:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl certificate deny default.node.cockroachdb-3
    ~~~

7. Verify that the new pod started successfully:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                                         READY     STATUS    RESTARTS   AGE
    cockroachdb-client-secure-3534299328-h1vp7   1/1       Running   0          1h
    cockroachdb-0                                1/1       Running   0          1h
    cockroachdb-1                                1/1       Running   0          1h
    cockroachdb-2                                1/1       Running   0          9m
    cockroachdb-3                                1/1       Running   0          4m
    ~~~

8. Back in the Admin UI, click **View nodes list** on the right to ensure that the fourth node successfully joined the cluster.

## Step 10. Stop the cluster

To shut down the CockroachDB cluster:

1. Delete all of the resources associated with the `cockroachdb` label, including the logs and remote persistent volumes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pods,statefulsets,services,persistentvolumeclaims,persistentvolumes,poddisruptionbudget,deployments \
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
    deployment "cockroachdb-client-secure" deleted
    ~~~

3. Get the names of the CSRs for the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get csr
    ~~~

    ~~~
    NAME                                                   AGE       REQUESTOR                               CONDITION
    default.client.root                                    1h        system:serviceaccount:default:default   Approved,Issued
    default.node.cockroachdb-0                             1h        system:serviceaccount:default:default   Approved,Issued
    default.node.cockroachdb-1                             1h        system:serviceaccount:default:default   Approved,Issued
    default.node.cockroachdb-2                             1h        system:serviceaccount:default:default   Approved,Issued
    default.node.cockroachdb-3                             12m       system:serviceaccount:default:default   Approved,Issued
    node-csr-0Xmb4UTVAWMEnUeGbW4KX1oL4XV_LADpkwjrPtQjlZ4   1h        kubelet                                 Approved,Issued
    node-csr-NiN8oDsLhxn0uwLTWa0RWpMUgJYnwcFxB984mwjjYsY   1h        kubelet                                 Approved,Issued
    node-csr-aU78SxyU69pDK57aj6txnevr7X-8M3XgX9mTK0Hso6o   1h        kubelet                                 Approved,Issued
    ~~~

4. Delete the CSRs:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete csr default.client.root,default.node.cockroachdb-0,default.node.cockroachdb-1,default.node.cockroachdb-2,default.node.cockroachdb-3,node-csr-0Xmb4UTVAWMEnUeGbW4KX1oL4XV_LADpkwjrPtQjlZ4,node-csr-NiN8oDsLhxn0uwLTWa0RWpMUgJYnwcFxB984mwjjYsY,node-csr-aU78SxyU69pDK57aj6txnevr7X-8M3XgX9mTK0Hso6o
    ~~~

    ~~~
    certificatesigningrequest "default.client.root" deleted
    certificatesigningrequest "default.node.cockroachdb-0" deleted
    certificatesigningrequest "default.node.cockroachdb-1" deleted
    certificatesigningrequest "default.node.cockroachdb-2" deleted
    certificatesigningrequest "default.node.cockroachdb-3" deleted
    certificatesigningrequest "node-csr-0Xmb4UTVAWMEnUeGbW4KX1oL4XV_LADpkwjrPtQjlZ4" deleted
    certificatesigningrequest "node-csr-NiN8oDsLhxn0uwLTWa0RWpMUgJYnwcFxB984mwjjYsY" deleted
    certificatesigningrequest "node-csr-aU78SxyU69pDK57aj6txnevr7X-8M3XgX9mTK0Hso6o" deleted
    ~~~

5. Get the names of the secrets for the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get csr
    ~~~

    ~~~
    NAME                         TYPE                                  DATA      AGE
    default-token-f3b4d          kubernetes.io/service-account-token   3         1h
    default.client.root          Opaque                                2         1h
    default.node.cockroachdb-0   Opaque                                2         1h
    default.node.cockroachdb-1   Opaque                                2         1h
    default.node.cockroachdb-2   Opaque                                2         1h
    default.node.cockroachdb-3   Opaque                                2         16m
    ~~~

6. Delete the secrets:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete secrets default.client.root,default.node.cockroachdb-0,default.node.cockroachdb-1,default.node.cockroachdb-2,default.node.cockroachdb-3
    ~~~

    ~~~
    secret "default.client.root" deleted
    secret "default.node.cockroachdb-0" deleted
    secret "default.node.cockroachdb-1" deleted
    secret "default.node.cockroachdb-2" deleted
    secret "default.node.cockroachdb-3" deleted
    ~~~

7. Stop Kubernetes:

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
