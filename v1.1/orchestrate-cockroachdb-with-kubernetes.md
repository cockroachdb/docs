---
title: Orchestrate CockroachDB with Kubernetes
summary: How to orchestrate the deployment and management of a secure 3-node CockroachDB cluster with Kubernetes.
toc: true
secure: true
---

<div class="filters filters-big clearfix">
  <button class="filter-button current"><strong>Secure</strong></button>
  <a href="orchestrate-cockroachdb-with-kubernetes-insecure.html"><button class="filter-button">Insecure</button></a>
</div>

This page shows you how to orchestrate the deployment and management of a secure 3-node CockroachDB cluster with [Kubernetes](http://kubernetes.io/), using the [StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) feature.

If you are only testing CockroachDB, or you are not concerned with protecting network communication with TLS encryption, you can use an insecure cluster instead. Select **Insecure** above for instructions.

{{site.data.alerts.callout_success}}For details about potential performance bottlenecks to be aware of when running CockroachDB in Kubernetes and guidance on how to optimize your deployment for better performance, see <a href="kubernetes-performance.html">CockroachDB Performance on Kubernetes</a>.{{site.data.alerts.end}}


## Before You Begin

Before getting started, it's helpful to review some Kubernetes-specific terminology and current limitations.

### Kubernetes Terminology

Feature | Description
--------|------------
instance | A physical or virtual machine. In this tutorial, you'll create GCE or AWS instances and join them into a single Kubernetes cluster from your local workstation.
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one or more Docker containers. In this tutorial, each pod will run on a separate instance and include one Docker container running a single CockroachDB node. You'll start with 3 pods and grow to 4.
[StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) | A StatefulSet is a group of pods treated as stateful units, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart. StatefulSets are considered stable as of Kubernetes version 1.9 after reaching beta in version 1.5.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | A persistent volume is a piece of networked storage (Persistent Disk on GCE, Elastic Block Store on AWS) mounted into a pod. The lifetime of a persistent volume is decoupled from the lifetime of the pod that's using it, ensuring that each CockroachDB node binds back to the same storage on restart.<br><br>This tutorial assumes that dynamic volume provisioning is available. When that is not the case, [persistent volume claims](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) need to be created manually.
[CSR](https://kubernetes.io/docs/tasks/tls/managing-tls-in-a-cluster/) | A CSR, or Certificate Signing Request, is a request to have a TLS certificate signed by the Kubernetes cluster's built-in CA. As each pod is created, it issues a CSR for the CockroachDB node running in the pod, which must be manually checked and approved. The same is true for clients as they connect to the cluster.
[RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) | RBAC, or Role-Based Access Control, is the system Kubernetes uses to manage permissions within the cluster. In order to take an action (e.g., `get` or `create`) on an API resource (e.g., a `pod` or `CSR`), the client must have a `Role` that allows it to do so. This tutorial creates the RBAC resources necessary for CockroachDB to create and access certificates.

{% include {{ page.version.version }}/orchestration/kubernetes-limitations.md %}

{% include {{ page.version.version }}/orchestration/start-kubernetes.md %}

## Step 3. Start CockroachDB nodes

{% include {{ page.version.version }}/orchestration/start-cluster.md %}

## Step 4. Approve node certificates

As each pod is created, it issues a Certificate Signing Request, or CSR, to have the node's certificate signed by the Kubernetes CA. You must manually check and approve each node's certificates, at which point the CockroachDB node is started in the pod.

1. Get the name of the `Pending` CSR for pod 1:

    {% include_cached copy-clipboard.html %}
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

    If you do not see a `Pending` CSR, wait a minute and try again.

2. Examine the CSR for pod 1:

    {% include_cached copy-clipboard.html %}
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

3. If everything looks correct, approve the CSR for pod 1:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl certificate approve default.node.cockroachdb-0
    ~~~

    ~~~
    certificatesigningrequest "default.node.cockroachdb-0" approved
    ~~~

4. Repeat steps 1-3 for the other 2 pods.

## Step 5. Initialize the cluster

1. Confirm that three pods are `Running` successfully:

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

2. Confirm that the persistent volumes and corresponding claims were created successfully for all three pods:

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

3. Use our [`cluster-init-secure.yaml`](https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cluster-init-secure.yaml) file to perform a one-time initialization that joins the nodes into a single cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cluster-init-secure.yaml
    ~~~

    ~~~
    job "cluster-init-secure" created
    ~~~

4. Approve the CSR for the one-off pod from which cluster initialization happens:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl certificate approve default.client.root
    ~~~

    ~~~
    certificatesigningrequest "default.client.root" approved
    ~~~

5. Confirm that cluster initialization has completed successfully:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get job cluster-init-secure
    ~~~

    ~~~
    NAME                  DESIRED   SUCCESSFUL   AGE
    cluster-init-secure   1         1            19m
    ~~~

{{site.data.alerts.callout_success}}
The StatefulSet configuration sets all CockroachDB nodes to log to `stderr`, so if you ever need access to a pod/node's logs to troubleshoot, use `kubectl logs <podname>` rather than checking the log on the persistent volume.
{{site.data.alerts.end}}

## Step 6. Test the cluster

To use the built-in SQL client, you need to launch a pod that runs indefinitely with the `cockroach` binary inside it, check and approve the CSR for the pod, get a shell into the pod, and then start the built-in SQL client.

1. From your local workstation, use our [`client-secure.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/client-secure.yaml) file to launch a pod and keep it running indefinitely:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/client-secure.yaml
    ~~~

    ~~~
    pod "cockroachdb-client-secure" created
    ~~~

    The pod uses the `root` client certificate created earlier to initialize the cluster, so there's no CSR approval required.

2. Get a shell into the pod and start the CockroachDB [built-in SQL client](use-the-built-in-sql-client.html):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure -- ./cockroach sql --certs-dir=/cockroach-certs --host=cockroachdb-public
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

3. Run some basic [CockroachDB SQL statements](learn-cockroachdb-sql.html):

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
    > INSERT INTO bank.accounts VALUES (1, 1000.50);
    ~~~

    {% include_cached copy-clipboard.html %}
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

3. Exit the SQL shell and pod:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

{{site.data.alerts.callout_success}}This pod will continue running indefinitely, so any time you need to reopen the built-in SQL client or run any other <a href="cockroach-commands.html"><code>cockroach</code> client commands</a>, such as <code>cockroach node</code> or <code>cockroach zone</code>, repeat step 2 using the appropriate <code>cockroach</code> command.<br></br>If you'd prefer to delete the pod and recreate it when needed, run <code>kubectl delete pod cockroachdb-client-secure</code>{{site.data.alerts.end}}

## Step 7. Monitor the cluster

{% include {{ page.version.version }}/orchestration/monitor-cluster.md %}

## Step 8. Simulate node failure

{% include {{ page.version.version }}/orchestration/kubernetes-simulate-failure.md %}

## Step 9. Scale the cluster

{% include {{ page.version.version }}/orchestration/kubernetes-scale-cluster.md %}

3. Get the name of the `Pending` CSR for the new pod:

    {% include_cached copy-clipboard.html %}
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

    If you do not see a `Pending` CSR, wait a minute and try again.

4. Examine the CSR for the new pod:

    {% include_cached copy-clipboard.html %}
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

5. If everything looks correct, approve the CSR for the new pod:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl certificate approve default.node.cockroachdb-3
    ~~~

    ~~~
    certificatesigningrequest "default.node.cockroachdb-3" approved
    ~~~

6. Verify that the new pod started successfully:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                        READY     STATUS    RESTARTS   AGE
    cockroachdb-0               1/1       Running   0          51m
    cockroachdb-1               1/1       Running   0          47m
    cockroachdb-2               1/1       Running   0          3m
    cockroachdb-3               1/1       Running   0          1m
    cockroachdb-client-secure   1/1       Running   0          15m
    ~~~

8. Back in the Admin UI, click **View nodes list** on the right to ensure that the fourth node successfully joined the cluster.

## Step 10. Upgrade the cluster

{% include {{ page.version.version }}/orchestration/kubernetes-upgrade-cluster.md %}

4. If this was an upgrade between minor or major versions (e.g., between v1.0.x and v1.1.y or between v1.1.y and v2.0.z), then you'll want to [finalize the upgrade](upgrade-cockroach-version.html#finalize-the-upgrade) if you're happy with the new version. Assuming you upgraded to the v1.1 minor version, you'd run:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure -- ./cockroach sql --certs-dir=/cockroach-certs --host=cockroachdb-public -e "SET CLUSTER SETTING version = '1.1';"
    ~~~

    ~~~
    SET CLUSTER SETTING
    ~~~

## Step 11. Stop the cluster

To shut down the CockroachDB cluster:

1. Delete all of the resources associated with the `cockroachdb` label, including the logs and remote persistent volumes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pods,statefulsets,services,persistentvolumeclaims,persistentvolumes,poddisruptionbudget,jobs,rolebinding,clusterrolebinding,role,clusterrole,serviceaccount -l app=cockroachdb
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
    job "cluster-init-secure" deleted
    rolebinding "cockroachdb" deleted
    clusterrolebinding "cockroachdb" deleted
    role "cockroachdb" deleted
    clusterrole "cockroachdb" deleted
    serviceaccount "cockroachdb" deleted
    ~~~

2. Delete the pod created for `cockroach` client commands, if you didn't do so earlier:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pod cockroachdb-client-secure
    ~~~

    ~~~
    pod "cockroachdb-client-secure" deleted
    ~~~

3. Get the names of the CSRs for the cluster:

    {% include_cached copy-clipboard.html %}
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

4. Delete the CSRs that you created:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete csr default.client.root default.node.cockroachdb-0 default.node.cockroachdb-1 default.node.cockroachdb-2 default.node.cockroachdb-3
    ~~~

    ~~~
    certificatesigningrequest "default.client.root" deleted
    certificatesigningrequest "default.node.cockroachdb-0" deleted
    certificatesigningrequest "default.node.cockroachdb-1" deleted
    certificatesigningrequest "default.node.cockroachdb-2" deleted
    certificatesigningrequest "default.node.cockroachdb-3" deleted
    ~~~

5. Get the names of the secrets for the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get secrets
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

6. Delete the secrets that you created:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete secrets default.client.root default.node.cockroachdb-0 default.node.cockroachdb-1 default.node.cockroachdb-2 default.node.cockroachdb-3
    ~~~

    ~~~
    secret "default.client.root" deleted
    secret "default.node.cockroachdb-0" deleted
    secret "default.node.cockroachdb-1" deleted
    secret "default.node.cockroachdb-2" deleted
    secret "default.node.cockroachdb-3" deleted
    ~~~

7. Stop Kubernetes:

{% include {{ page.version.version }}/orchestration/stop-kubernetes.md %}

## See Also

- [Kubernetes Performance Guide](kubernetes-performance.html)
{% include {{ page.version.version }}/prod-deployment/prod-see-also.md %}
