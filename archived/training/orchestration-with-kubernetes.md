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
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one or more Docker containers. In this tutorial, all pods will run on your local workstation, each containing one Docker container running a single CockroachDB node. You'll start with 3 pods and grow to 4.
[StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) | A StatefulSet is a group of pods treated as stateful units, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart. StatefulSets require Kubernetes version 1.9 or newer.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | A persistent volume is a piece of storage mounted into a pod. The lifetime of a persistent volume is decoupled from the lifetime of the pod that's using it, ensuring that each CockroachDB node binds back to the same storage on restart.<br><br>When using `minikube`, persistent volumes are external temporary directories that endure until they are manually deleted or until the entire Kubernetes cluster is deleted.
[persistent volume claim](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) | When pods are created (one per CockroachDB node), each pod will request a persistent volume claim to “claim” durable storage for its node.

## Step 1. Start Kubernetes

1. Follow Kubernetes' [documentation](https://kubernetes.io/docs/tasks/tools/install-minikube/) to install `minikube`, the tool used to run Kubernetes locally, for your OS. This includes installing a hypervisor and `kubectl`, the command-line tool used to manage Kubernetes from your local workstation.

    {{site.data.alerts.callout_info}}
    Make sure you install `minikube` version 0.21.0 or later. Earlier versions do not include a Kubernetes server that supports the `maxUnavailability` field and `PodDisruptionBudget` resource type used in the CockroachDB StatefulSet configuration.
    {{site.data.alerts.end}}

2. Start a local Kubernetes cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ minikube start
    ~~~

## Step 2. Start CockroachDB

To start your CockroachDB cluster, you can use our StatefulSet configuration and related files directly.

1. From your local workstation, use our [`cockroachdb-statefulset-secure.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset-secure.yaml) file to create the StatefulSet that automatically creates 3 pods, each with a CockroachDB node running inside it:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cockroachdb-statefulset-secure.yaml
    ~~~

    ~~~
    serviceaccount/cockroachdb created
    role.rbac.authorization.k8s.io/cockroachdb created
    clusterrole.rbac.authorization.k8s.io/cockroachdb created
    rolebinding.rbac.authorization.k8s.io/cockroachdb created
    clusterrolebinding.rbac.authorization.k8s.io/cockroachdb created
    service/cockroachdb-public created
    service/cockroachdb created
    poddisruptionbudget.policy/cockroachdb-budget created
    statefulset.apps/cockroachdb created
    ~~~

2. As each pod is created, it issues a Certificate Signing Request, or CSR, to have the node's certificate signed by the Kubernetes CA. You must manually check and approve each node's certificates, at which point the CockroachDB node is started in the pod.

    1. Get the name of the `Pending` CSR for the first pod:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl get csr
        ~~~

        ~~~
        NAME                         AGE       REQUESTOR                                   CONDITION
        default.node.cockroachdb-0   24s       system:serviceaccount:default:cockroachdb   Pending
        default.node.cockroachdb-1   23s       system:serviceaccount:default:cockroachdb   Pending
        default.node.cockroachdb-2   23s       system:serviceaccount:default:cockroachdb   Pending
        ~~~

        If you do not see a `Pending` CSR, wait a minute and try again.

    2. Examine the CSR for the first pod:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl describe csr default.node.cockroachdb-0
        ~~~

        ~~~
        Name:               default.node.cockroachdb-0
        Labels:             <none>
        Annotations:        <none>
        CreationTimestamp:  Wed, 15 May 2019 17:11:34 -0400
        Requesting User:    system:serviceaccount:default:cockroachdb
        Status:             Pending
        Subject:
          Common Name:    node
          Serial Number:
          Organization:   Cockroach
        Subject Alternative Names:
                 DNS Names:     localhost
                                cockroachdb-0.cockroachdb.default.svc.cluster.local
                                cockroachdb-0.cockroachdb
                                cockroachdb-public
                                cockroachdb-public.default.svc.cluster.local
                 IP Addresses:  127.0.0.1
        Events:  <none>
        ~~~

    3. If everything looks correct, approve the CSR for the first pod:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl certificate approve default.node.cockroachdb-0
        ~~~

        ~~~
        certificatesigningrequest.certificates.k8s.io/default.node.cockroachdb-0 approved
        ~~~

    4. Repeat steps 1-3 for the other 2 pods.

3. Initialize the cluster:

    1. Confirm that three pods are `Running` successfully. Note that they will not
       be considered `Ready` until after the cluster has been initialized:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl get pods
        ~~~

        ~~~
        NAME            READY     STATUS    RESTARTS   AGE
        cockroachdb-0   0/1       Running   0          2m
        cockroachdb-1   0/1       Running   0          2m
        cockroachdb-2   0/1       Running   0          2m
        ~~~

    2. Confirm that the persistent volumes and corresponding claims were created successfully for all three pods:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl get persistentvolumes
        ~~~

        ~~~
        NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                                      STORAGECLASS   REASON    AGE
        pvc-01ba3ca6-7756-11e9-b9fb-080027246063   100Gi      RWO            Delete           Bound     default/datadir-cockroachdb-0              standard                 13m
        pvc-01ccc75a-7756-11e9-b9fb-080027246063   100Gi      RWO            Delete           Bound     default/datadir-cockroachdb-1              standard                 13m
        pvc-01d111aa-7756-11e9-b9fb-080027246063   100Gi      RWO            Delete           Bound     default/datadir-cockroachdb-2              standard                 13m
        ~~~

    3. Use our [`cluster-init-secure.yaml`](https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cluster-init-secure.yaml) file to perform a one-time initialization that joins the nodes into a single cluster:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl create \
        -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cluster-init-secure.yaml
        ~~~

        ~~~
        job.batch/cluster-init-secure created
        ~~~

    4. Approve the CSR for the one-off pod from which cluster initialization happens:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl certificate approve default.client.root
        ~~~

        ~~~
        certificatesigningrequest.certificates.k8s.io/default.client.root approved
        ~~~

    5. Confirm that cluster initialization has completed successfully. The job
       should be considered successful and the CockroachDB pods should soon be
       considered `Ready`:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl get job cluster-init-secure
        ~~~

        ~~~
        NAME                  COMPLETIONS     DURATION      AGE
        cluster-init-secure   1/1             10s           16s
        ~~~

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl get pods
        ~~~

        ~~~
        NAME                                READY     STATUS      RESTARTS   AGE
        cluster-init-secure-fxdjl           0/1       Completed   0          53s
        cockroachdb-0                       1/1       Running     0          15m
        cockroachdb-1                       1/1       Running     0          15m
        cockroachdb-2                       1/1       Running     0          15m
        ~~~

{{site.data.alerts.callout_success}}
The StatefulSet configuration sets all CockroachDB nodes to log to `stderr`, so if you ever need access to a pod/node's logs to troubleshoot, use `kubectl logs <podname>` rather than checking the log on the persistent volume.
{{site.data.alerts.end}}

## Step 3. Use the built-in SQL client

To use the built-in SQL client, you need to launch a pod that runs indefinitely with the `cockroach` binary inside it, get a shell into the pod, and then start the built-in SQL client.

1. From your local workstation, use our [`client-secure.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/client-secure.yaml) file to launch a pod and keep it running indefinitely:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create \
    -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/client-secure.yaml
    ~~~

    ~~~
    pod/cockroachdb-client-secure created
    ~~~

    The pod uses the `root` client certificate created earlier to initialize the cluster, so there's no CSR approval required.

2. Get a shell into the pod and start the CockroachDB [built-in SQL client](../cockroach-sql.html):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach sql \
    --certs-dir=/cockroach-certs \
    --host=cockroachdb-public
    ~~~

    ~~~
    # Welcome to the cockroach SQL interface.
    # All statements must be terminated by a semicolon.
    # To exit: CTRL + D.
    #
    # Server version: CockroachDB CCL v19.1.0 (x86_64-unknown-linux-gnu, built 2019/04/29 18:36:40, go1.11.6) (same version as client)
    # Cluster ID: 7e1db24d-0f11-45d4-b472-bbd5f1fff858
    #
    # Enter \? for a brief introduction.
    #
    root@cockroachdb-public:26257/defaultdb>
    ~~~

3. Run some basic [CockroachDB SQL statements](../learn-cockroachdb-sql.html):

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

4. [Create a user with a password](../create-user.html#create-a-user-with-a-password):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER roach WITH PASSWORD 'Q7gc8rEdS';
    ~~~

      You will need this username and password to access the Admin UI later.

5. Exit the SQL shell and pod:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

{{site.data.alerts.callout_success}}
This pod will continue running indefinitely, so any time you need to reopen the built-in SQL client or run any other [`cockroach` client commands](../cockroach-commands.html) (e.g., `cockroach node`), repeat step 2 using the appropriate `cockroach` command.

If you'd prefer to delete the pod and recreate it when needed, run `kubectl delete pod cockroachdb-client-secure`.
{{site.data.alerts.end}}

## Step 4. Access the Admin UI

To access the cluster's [Admin UI](../admin-ui-overview.html):

1. Port-forward from your local machine to one of the pods:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl port-forward cockroachdb-0 8080
    ~~~

    ~~~
    Forwarding from 127.0.0.1:8080 -> 8080
    ~~~

    {{site.data.alerts.callout_info}}The <code>port-forward</code> command must be run on the same machine as the web browser in which you want to view the Admin UI. If you have been running these commands from a cloud instance or other non-local shell, you will not be able to view the UI without configuring <code>kubectl</code> locally and running the above <code>port-forward</code> command on your local machine.{{site.data.alerts.end}}

2. Go to <a href="https://localhost:8080/" data-proofer-ignore>https://localhost:8080</a> and log in with the username and password you created earlier.

3. In the UI, verify that the cluster is running as expected:
    - Click **View nodes list** on the right to ensure that all nodes successfully joined the cluster.
    - Click the **Databases** tab on the left to verify that `bank` is listed.

## Step 5. Simulate node failure

Based on the `replicas: 3` line in the StatefulSet configuration, Kubernetes ensures that three pods/nodes are running at all times. When a pod/node fails, Kubernetes automatically creates another pod/node with the same network identity and persistent storage.

To see this in action:

1. Stop one of CockroachDB nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pod cockroachdb-2
    ~~~

    ~~~
    pod "cockroachdb-2" deleted
    ~~~

2. In the Admin UI, the **Cluster Overview** will soon show one node as **Suspect**. As Kubernetes auto-restarts the node, watch how the node once again becomes healthy.

3. Back in the terminal, verify that the pod was automatically restarted:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pod cockroachdb-2
    ~~~

    ~~~
    NAME            READY     STATUS    RESTARTS   AGE
    cockroachdb-2   1/1       Running   0          12s
    ~~~

## Step 6. Add nodes

1. Use the `kubectl scale` command to add a pod for another CockroachDB node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl scale statefulset cockroachdb --replicas=4
    ~~~

    ~~~
    statefulset.apps/cockroachdb scaled
    ~~~

2. Get the name of the `Pending` CSR for the new pod:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get csr
    ~~~

    ~~~
    NAME                         AGE       REQUESTOR                                   CONDITION
    default.client.root          8m        system:serviceaccount:default:cockroachdb   Approved,Issued
    default.node.cockroachdb-0   22m       system:serviceaccount:default:cockroachdb   Approved,Issued
    default.node.cockroachdb-1   22m       system:serviceaccount:default:cockroachdb   Approved,Issued
    default.node.cockroachdb-2   22m       system:serviceaccount:default:cockroachdb   Approved,Issued
    default.node.cockroachdb-3   2m        system:serviceaccount:default:cockroachdb   Pending
    ~~~

3. Approve the CSR for the new pod:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl certificate approve default.node.cockroachdb-3
    ~~~

    ~~~
    certificatesigningrequest.certificates.k8s.io/default.node.cockroachdb-3 approved
    ~~~

4. Confirm that pod for the fourth node, `cockroachdb-3`, is `Running` successfully:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                                READY     STATUS      RESTARTS   AGE
    cluster-init-secure-fxdjl           0/1       Completed   0          13m
    cockroachdb-0                       1/1       Running     1          28m
    cockroachdb-1                       1/1       Running     1          28m
    cockroachdb-2                       1/1       Running     0          8m
    cockroachdb-3                       1/1       Running     0          7m
    cockroachdb-client-secure           1/1       Running     0          12m
    ~~~

## Step 7. Remove nodes

To safely remove a node from your cluster, you must first decommission the node and only then adjust the `--replicas` value of your StatefulSet configuration to permanently remove it. This sequence is important because the decommissioning process lets a node finish in-flight requests, rejects any new requests, and transfers all range replicas and range leases off the node.

{{site.data.alerts.callout_danger}}
If you remove nodes without first telling CockroachDB to decommission them, you may cause data or even cluster unavailability. For more details about how this works and what to consider before removing nodes, see [Decommission Nodes](../remove-nodes.html).
{{site.data.alerts.end}}

1. Get a shell into the `cockroachdb-client-secure` pod you created earlier and use the `cockroach node status` command to get the internal IDs of nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach node status \
    --certs-dir=/cockroach-certs \
    --host=cockroachdb-public
    ~~~

    ~~~
      id |                          address                          |  build  |            started_at            |            updated_at            | is_available | is_live
    +----+-----------------------------------------------------------+---------+----------------------------------+----------------------------------+--------------+---------+
       1 | cockroachdb-0.cockroachdb.default.svc.cluster.local:26257 | v19.1.0 | 2019-05-15 21:37:09.875482+00:00 | 2019-05-15 21:40:41.467829+00:00 | true         | true
       2 | cockroachdb-2.cockroachdb.default.svc.cluster.local:26257 | v19.1.0 | 2019-05-15 21:31:50.21661+00:00  | 2019-05-15 21:40:41.308529+00:00 | true         | true
       3 | cockroachdb-1.cockroachdb.default.svc.cluster.local:26257 | v19.1.0 | 2019-05-15 21:37:09.746432+00:00 | 2019-05-15 21:40:41.336179+00:00 | true         | true
       4 | cockroachdb-3.cockroachdb.default.svc.cluster.local:26257 | v19.1.0 | 2019-05-15 21:37:34.962546+00:00 | 2019-05-15 21:40:44.08081+00:00  | true         | true
    (4 rows)
    ~~~

    The pod uses the `root` client certificate created earlier to initialize the cluster, so there's no CSR approval required.

2. Note the ID of the node with the highest number in its address (in this case, the address including `cockroachdb-3`) and use the [`cockroach node decommission`](../cockroach-node.html) command to decommission it:

    {{site.data.alerts.callout_info}}
    It's important to decommission the node with the highest number in its address because, when you reduce the `--replica` count, Kubernetes will remove the pod for that node.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach node decommission <node ID> \
    --certs-dir=/cockroach-certs \
    --host=cockroachdb-public
    ~~~

    You'll then see the decommissioning status print to `stderr` as it changes:

    ~~~
     id | is_live | replicas | is_decommissioning | is_draining  
    +---+---------+----------+--------------------+-------------+
      4 |  true   |       73 |        true        |    false     
    (1 row)
    ~~~

    Once the node has been fully decommissioned and stopped, you'll see a confirmation:

    ~~~
     id | is_live | replicas | is_decommissioning | is_draining  
    +---+---------+----------+--------------------+-------------+
      4 |  true   |        0 |        true        |    false     
    (1 row)

    No more data reported on target nodes. Please verify cluster health before removing the nodes.
    ~~~

3. Once the node has been decommissioned, use the `kubectl scale` command to remove a pod from your StatefulSet:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl scale statefulset cockroachdb --replicas=3
    ~~~

    ~~~
    statefulset.apps/cockroachdb scaled
    ~~~

## Step 8. Clean up

In the next module, you'll start with a fresh, non-orchestrated cluster. Delete the StatefulSet configuration file and use the `minikube delete` command to shut down and delete the minikube virtual machine and all the resources you created, including persistent volumes:

{% include_cached copy-clipboard.html %}
~~~ shell
$ kubectl delete \
-f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cockroachdb-statefulset.yaml
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ kubectl delete job.batch/cluster-init-secure
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ kubectl delete pod cockroachdb-client-secure

{% include_cached copy-clipboard.html %}
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
For information on how to optimize your deployment of CockroachDB on Kubernetes, see [CockroachDB Performance on Kubernetes](../kubernetes-performance.html).
{{site.data.alerts.end}}

## What's next?

[Performance Benchmarking](performance-benchmarking.html)
