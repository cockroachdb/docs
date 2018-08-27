---
title: Orchestrate a Multi-Region CockroachDB Cluster with Kubernetes
summary: How to use Kubernetes to orchestrate the deployment, management, and monitoring of an insecure CockroachDB cluster across multiple regions.
toc: true
---

This page shows you how to orchestrate a secure CockroachDB deployment across three [Kubernetes](http://kubernetes.io/) clusters, each in a different geographic region, using the [StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) feature for each cluster and linking them together via DNS.

To deploy in a single geographic region instead, see [Orchestrate a Single-Region CockroachDB Cluster with Kubernetes](orchestrate-cockroachdb-with-kubernetes-insecure.html). Also, for details about potential performance bottlenecks to be aware of when running CockroachDB in Kubernetes and guidance on how to optimize your deployment for better performance, see [CockroachDB Performance on Kubernetes](kubernetes-performance.html).

## Before you begin

Before getting started, it's helpful to review some Kubernetes-specific terminology and current limitations.

### Kubernetes terminology

Feature | Description
--------|------------
instance | A physical or virtual machine. In this tutorial, you'll create GKE instances and join them into three separate Kubernetes clusters from your local workstation.
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one of more Docker containers. In this tutorial, each pod will run on a separate instance and include one Docker container running a single CockroachDB node. You'll start with 3 pods and grow to 4.
[StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) | A StatefulSet is a group of pods treated as stateful units, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart. StatefulSets are considered stable as of Kubernetes version 1.9 after reaching beta in version 1.5.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | A persistent volume is a piece of networked storage (Persistent Disk on GCE, Elastic Block Store on AWS) mounted into a pod. The lifetime of a persistent volume is decoupled from the lifetime of the pod that's using it, ensuring that each CockroachDB node binds back to the same storage on restart.<br><br>This tutorial assumes that dynamic volume provisioning is available. When that is not the case, [persistent volume claims](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) need to be created manually.
[CSR](https://kubernetes.io/docs/tasks/tls/managing-tls-in-a-cluster/) | A CSR, or Certificate Signing Request, is a request to have a TLS certificate signed by a Kubernetes cluster's built-in CA. As each pod is created, it issues a CSR for the CockroachDB node running in the pod, which must be manually checked and approved. The same is true for clients as they connect to the cluster.
[RBAC](https://kubernetes.io/docs/admin/authorization/rbac/) | RBAC, or Role-Based Access Control, is the system Kubernetes uses to manage permissions within the cluster. In order to take an action (e.g., `get` or `create`) on an API resource (e.g., a `pod`), the client must have a `Role` that allows it to do so.

### Limitations

{% include {{ page.version.version }}/orchestration/kubernetes-limitations.md %}

#### Exposing DNS servers

In the approach documented here, the DNS servers from each Kubernetes cluster are hooked together by exposing them via a load balanced IP address that is visible to the public Internet. This is because [Google Cloud Platform's Internal Load Balancers do not currently support clients in one region using a load balancer in another region](https://cloud.google.com/load-balancing/docs/internal/#deploying_internal_load_balancing_with_clients_across_vpn_or_interconnect).

None of the services in your Kubernetes cluster will be accessible publicly, but their names could leak out to a motivated attacker. If this is unacceptable, please let us know and we can demonstrate other options. [Your voice could also help convince Google to allow clients from one region to use an Internal Load Balancer in another](https://issuetracker.google.com/issues/111021512), eliminating the problem.

## Step 1. Start Kubernetes clusters

Our multi-region deployment approached relies on pod IP addresses being routable across three distinct Kubernetes clusters and regions. The hosted Google Kubernetes Engine (GKE) service satisfies this requirement, so that is the environment featured here. If you want to run on another cloud or on-premises, use this [basic network test](https://kubernetes.io/docs/concepts/cluster-administration/networking/) to see if it will work.

1. Complete the **Before You Begin** steps described in the [Google Kubernetes Engine Quickstart](https://cloud.google.com/kubernetes-engine/docs/quickstart) documentation.

    This includes installing `gcloud`, which is used to create and delete Kubernetes Engine clusters, and `kubectl`, which is the command-line tool used to manage Kubernetes from your workstation.

    {{site.data.alerts.callout_success}}The documentation offers the choice of using Google's Cloud Shell product or using a local shell on your machine. Choose to use a local shell if you want to be able to view the CockroachDB Admin UI using the steps in this guide.{{site.data.alerts.end}}

2. From your local workstation, start the first Kubernetes cluster, specifying the [zone](https://cloud.google.com/compute/docs/regions-zones/) it should run in:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters create cockroachdb1 --zone=<gce-zone>
    ~~~

    ~~~
    Creating cluster cockroachdb1...done.
    ~~~

    This creates GKE instances in the zone specified and joins them into a single Kubernetes cluster named `cockroachdb1`.

    The process can take a few minutes, so don't move on to the next step until you see a `Creating cluster cockroachdb1...done` message and details about your cluster.

3. Start the second Kubernetes cluster, specifying the [zone](https://cloud.google.com/compute/docs/regions-zones/) it should run in:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters create cockroachdb2 --zone=<gce-zone>
    ~~~

    ~~~
    Creating cluster cockroachdb2...done.
    ~~~

4. Start the third Kubernetes cluster, specifying the [zone](https://cloud.google.com/compute/docs/regions-zones/) it should run in:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters create cockroachdb3 --zone=<gce-zone>
    ~~~

    ~~~
    Creating cluster cockroachdb3...done.
    ~~~

5. Get the `kubectl` "contexts" for your clusters:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl config get-contexts
    ~~~

    ~~~
    CURRENT   NAME                                                  CLUSTER                                               AUTHINFO                                              NAMESPACE
    *         gke_cockroach-shared_us-east1-b_cockroachdb1          gke_cockroach-shared_us-east1-b_cockroachdb1          gke_cockroach-shared_us-east1-b_cockroachdb1
              gke_cockroach-shared_us-west1-a_cockroachdb2          gke_cockroach-shared_us-west1-a_cockroachdb2          gke_cockroach-shared_us-west1-a_cockroachdb2
              gke_cockroach-shared_us-central1-a_cockroachdb3       gke_cockroach-shared_us-central1-a_cockroachdb3       gke_cockroach-shared_us-central1-a_cockroachdb3                        
    ~~~

6. Get the email address associated with your Google Cloud account:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ gcloud info | grep Account
    ~~~

    ~~~
    Account: [your.google.cloud.email@example.org]
    ~~~

    {{site.data.alerts.callout_danger}}
    This command returns your email address in all lowercase. However, in the next step, you must enter the address using the accurate capitalization. For example, if your address is YourName@example.com, you must use YourName@example.com and not yourname@example.com.
    {{site.data.alerts.end}}

6. For each Kubernetes cluster, [create the RBAC roles](https://cloud.google.com/kubernetes-engine/docs/how-to/role-based-access-control#prerequisites_for_using_role-based_access_control) CockroachDB needs for running on GKE, using the email address and relevant "context" name from the previous steps:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl create clusterrolebinding $USER-cluster-admin-binding --clusterrole=cluster-admin --user=<your.google.cloud.email@example.org> --context=<context-name-of-kubernetes-cluster>
    ~~~

    ~~~
    clusterrolebinding "cluster-admin-binding" created
    ~~~

## Step 2. Start CockroachDB

1. Create a directory and download the required script and configuration files into it:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir multiregion
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cd multiregion
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl -OOOOOOOOO \
    https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/multiregion/{README.md,client-secure.yaml,cluster-init-secure.yaml,cockroachdb-statefulset-secure.yaml,dns-lb.yaml,example-app-secure.yaml,external-name-svc.yaml,setup.py,teardown.py}
    ~~~

2. In the `setup.py` script, fill in the `contexts` map with the zones of your clusters and their "context" names, for example:

    ~~~
    $ context = {
        'us-east1-b': 'gke_cockroach-shared_us-east1-b_cockroachdb1',
        'us-west1-a': 'gke_cockroach-shared_us-west1-a_cockroachdb2',
        'us-central1-a': 'gke_cockroach-shared_us-central1-a_cockroachdb3',
    }
    ~~~

    You retrieved the `kubectl` "contexts" in an earlier step. To get them again, run:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl config get-contexts
    ~~~

3. In the `setup.py` script, fill in the `regions` map with the zones and corresponding regions of your clusters, for example:

    ~~~
    $ regions = {
        'us-east1-b': 'us-east1',
        'us-west1-a': 'us-west1',
        'us-central1-a': 'us-central1',
    }
    ~~~

    Setting regions is optional, but recommended, because it improves CockroachDB's ability to diversify data placement if you use more than one zone in the same region. If you aren't specifying regions, just leave the map empty.

4. If you haven't already, [install CockroachDB locally and add it to your `PATH`](install-cockroachdb.html). The `cockroach` binary will be used to generate certificates.

    If the `cockroach` binary is not on your `PATH`, in the `setup.py` script, set the `cockroach_path` variable to the path to the binary.

5. Optionally, to optimize your deployment for better performance, review [CockroachDB Performance on Kubernetes](kubernetes-performance.html) and make the desired modifications to the `cockroachdb-stateful-secure.yaml` file.

6. Run the `setup.py` script:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ python setup.py
    ~~~

    As the script creates various resources and creates and initializes the CockroachDB cluster, you'll see a lot of output, eventually ending with `job "cluster-init-secure" created`.

7. Confirm that the CockroachDB pods in each cluster are considered `Ready`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods --selector app=cockroachdb --all-namespaces --context=<context-of-first-kubernetes-cluster>
    ~~~

    ~~~
    NAMESPACE    NAME            READY     STATUS    RESTARTS   AGE
    us-east1-b   cockroachdb-0   1/1       Running   0          14m
    us-east1-b   cockroachdb-1   1/1       Running   0          14m
    us-east1-b   cockroachdb-2   1/1       Running   0          14m    
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods --selector app=cockroachdb --all-namespaces --context=<context-of-second-kubernetes-cluster>
    ~~~

    ~~~
    NAMESPACE       NAME            READY     STATUS    RESTARTS   AGE
    us-central1-a   cockroachdb-0   1/1       Running   0          14m
    us-central1-a   cockroachdb-1   1/1       Running   0          14m
    us-central1-a   cockroachdb-2   1/1       Running   0          14m
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods --selector app=cockroachdb --all-namespaces --context=<context-of-third-kubernetes-cluster>
    ~~~

    ~~~
    NAMESPACE    NAME            READY     STATUS    RESTARTS   AGE
    us-west1-a   cockroachdb-0   1/1       Running   0          14m
    us-west1-a   cockroachdb-1   1/1       Running   0          14m
    us-west1-a   cockroachdb-2   1/1       Running   0          14m
    ~~~    

{{site.data.alerts.callout_success}}
In each Kubernetes cluster, the StatefulSet configuration sets all CockroachDB nodes to write to `stderr`, so if you ever need access to a pod/node's logs to troubleshoot, use `kubectl logs <podname> --namespace=<cluster-namespace> --context=<cluster-context>` rather than checking the log on the persistent volume.
{{site.data.alerts.end}}

## Step 3. Use the built-in SQL client

1. Use the `client-secure.yaml` file to launch a pod and keep it running indefinitely, specifying the namespace and context of the Kubernetes cluster to run it in:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f client-secure.yaml --namespace=<cluster-namespace> --context=<cluster-context>
    ~~~

    ~~~
    pod "cockroachdb-client-secure" created
    ~~~

    The pod uses the `root` client certificate created earlier by the `setup.py` script.

2. Get a shell into the pod and start the CockroachDB [built-in SQL client](use-the-built-in-sql-client.html), again specifying the namespace and context of the Kubernetes cluster where the pod is running:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure --namespace=<cluster-namespace> --context=<cluster-context> -- ./cockroach sql --certs-dir=/cockroach-certs --host=cockroachdb-public
    ~~~

    ~~~
    # Welcome to the cockroach SQL interface.
    # All statements must be terminated by a semicolon.
    # To exit: CTRL + D.
    #
    # Server version: CockroachDB CCL v2.0.5 (x86_64-unknown-linux-gnu, built 2018/08/13 17:59:42, go1.10) (same version as client)
    # Cluster ID: 99346e82-9817-4f62-b79b-fdd5d57f8bda
    #
    # Enter \? for a brief introduction.
    #
    warning: no current database set. Use SET database = <dbname> to change, CREATE DATABASE to make a new database.
    root@cockroachdb-public:26257/>
    ~~~

3. Run some basic [CockroachDB SQL statements](learn-cockroachdb-sql.html):

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

3. Exit the SQL shell and pod:

    {% include copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

    The pod will continue running indefinitely, so any time you need to reopen the built-in SQL client or run any other [`cockroach` client commands](cockroach-commands.html), such as `cockroach node` or `cockroach zone`, repeat step 2 using the appropriate command.

    If you'd prefer to delete the pod and recreate it when needed, run:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pod cockroachdb-client-secure --namespace=<cluster-namespace> --context=<cluster-context>
    ~~~

## Step 4. Access the Web UI

To access the cluster's [Web UI](admin-ui-overview.html):

1. Port-forward from your local machine to a pod in one of your Kubernetes clusters:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl port-forward cockroachdb-0 8080 --namespace=<cluster-namespace> --context=<cluster-context>
    ~~~

    ~~~
    Forwarding from 127.0.0.1:8080 -> 8080
    ~~~

    {{site.data.alerts.callout_info}}
    The `port-forward` command must be run on the same machine as the web browser in which you want to view the Web UI. If you have been running these commands from a cloud instance or other non-local shell, you will not be able to view the UI without configuring `kubectl` locally and running the above `port-forward` command on your local machine.
    {{site.data.alerts.end}}

2. Go to <a href="https://localhost:8080/" data-proofer-ignore>https://localhost:8080</a>.

3. In the UI, check the **Node List** to verify that all nodes are running, and then click the **Databases** tab on the left to verify that `bank` is listed.

## Step 5. Simulate node failure

In each Kubernetes cluster, the `replicas: 3` line in the StatefulSet configuration tells Kubernetes to ensure that three pods/nodes are running at all times. When a pod/node fails, Kubernetes automatically creates another pod/node with the same network identity and persistent storage.

To see this in action:

1. Kill a CockroachDB node, specifying the namespace and context of the Kubernetes cluster where it's running:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pod cockroachdb-2 --namespace=<cluster-namespace> --context=<cluster-context>
    ~~~

    ~~~
    pod "cockroachdb-2" deleted
    ~~~

2. In the Admin UI, the **Cluster Overview** will soon show one node as **Suspect**. As Kubernetes auto-restarts the node, watch how the node once again becomes healthy.

3. Back in the terminal, verify that the pod was automatically restarted:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pod cockroachdb-2 --namespace=<cluster-namespace> --context=<cluster-context>
    ~~~

    ~~~
    NAME            READY     STATUS    RESTARTS   AGE
    cockroachdb-2   1/1       Running   0          12s
    ~~~

## Step 6. Maintain the cluster

### Scale the cluster

Each of your Kubernetes clusters contains 4 nodes, one master and 3 workers. Pods get placed only on worker nodes, so to ensure that you don't have two pods on the same node (as recommended in our [production best practices](recommended-production-settings.html)), you need to add a new worker node and then edit your StatefulSet configuration to add another pod.

1. Resize your [Managed Instance Group](https://cloud.google.com/compute/docs/instance-groups/).

2. Use the `kubectl scale` command to add a pod to the StatefulSet in the Kubernetes cluster where you want to add a CockroachDB node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl scale statefulset cockroachdb --replicas=4 --namespace=<cluster-namespace> --context=<cluster-context>
    ~~~

    ~~~
    statefulset "cockroachdb" scaled
    ~~~

3. Verify that a fourth pod was added successfully:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods --namespace=<cluster-namespace> --context=<cluster-context>
    ~~~

    ~~~
    NAME                        READY     STATUS    RESTARTS   AGE
    cockroachdb-0               1/1       Running   0          1h
    cockroachdb-1               1/1       Running   0          1h
    cockroachdb-2               1/1       Running   0          7m
    cockroachdb-3               1/1       Running   0          44s
    cockroachdb-client-secure   1/1       Running   0          26m
    ~~~

### Upgrade the cluster

{% include {{ page.version.version }}/orchestration/kubernetes-upgrade-cluster.md %}

### Stop the cluster

1. To delete all of the resources created in your clusters, copy the `contexts` map from `setup.py` into `teardown.py`, and then run `teardown.py`:

    ~~~ shell
    $ python teardown.py
    ~~~

    ~~~
    namespace "us-east1-b" deleted
    service "kube-dns-lb" deleted
    configmap "kube-dns" deleted
    pod "kube-dns-5dcfcbf5fb-l4xwt" deleted
    pod "kube-dns-5dcfcbf5fb-tddp2" deleted
    namespace "us-west1-a" deleted
    service "kube-dns-lb" deleted
    configmap "kube-dns" deleted
    pod "kube-dns-5dcfcbf5fb-8csc9" deleted
    pod "kube-dns-5dcfcbf5fb-zlzn7" deleted
    namespace "us-central1-a" deleted
    service "kube-dns-lb" deleted
    configmap "kube-dns" deleted
    pod "kube-dns-5dcfcbf5fb-6ngmw" deleted
    pod "kube-dns-5dcfcbf5fb-lcfxd" deleted
    ~~~

2. Stop each Kubernetes cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters delete cockroachdb1 --zone=<gce-zone>
    ~~~

    ~~~
    Deleting cluster cockroachdb1...done.
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters delete cockroachdb2 --zone=<gce-zone>
    ~~~

    ~~~
    Deleting cluster cockroachdb2...done.
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters delete cockroachdb3 --zone=<gce-zone>
    ~~~

    ~~~
    Deleting cluster cockroachdb3...done.
    ~~~

## See also

- [Kubernetes Performance Guide](kubernetes-performance.html)
{% include {{ page.version.version }}/prod-deployment/prod-see-also.md %}
