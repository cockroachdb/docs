---
title: Orchestrate CockroachDB Across Multiple Kubernetes Clusters
summary: Orchestrate the deployment, management, and monitoring of CockroachDB across multiple Kubernetes clusters in different regions.
toc: true
toc_not_nested: true
---

This page shows you how to orchestrate a secure CockroachDB deployment across three [Kubernetes](http://kubernetes.io/) clusters, each in a different geographic region, using the [StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) feature to manage the containers within each cluster and linking them together via DNS.

To deploy in a single Kubernetes cluster instead, see [Kubernetes Single-Cluster Deployment](orchestrate-cockroachdb-with-kubernetes.html). Also, for details about potential performance bottlenecks to be aware of when running CockroachDB in Kubernetes and guidance on how to optimize your deployment for better performance, see [CockroachDB Performance on Kubernetes](kubernetes-performance.html).

## Before you begin

Before getting started, it's helpful to review some Kubernetes-specific terminology and current limitations.

- [Kubernetes terminology](#kubernetes-terminology)
- [UX differences from running in a single cluster](#ux-differences-from-running-in-a-single-cluster)
- [Limitations](#limitations)

### Kubernetes terminology

Feature | Description
--------|------------
instance | A physical or virtual machine. In this tutorial, you'll run instances as part of three independent Kubernetes clusters, each in a different region.
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one or more Docker containers. In this tutorial, each pod will run on a separate instance and include one Docker container running a single CockroachDB node. You'll start with 3 pods in each region and grow to 4.
[StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) | A StatefulSet is a group of pods treated as stateful units, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart. StatefulSets are considered stable as of Kubernetes version 1.9 after reaching beta in version 1.5.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | A persistent volume is a piece of networked storage (Persistent Disk on GCE, Elastic Block Store on AWS) mounted into a pod. The lifetime of a persistent volume is decoupled from the lifetime of the pod that's using it, ensuring that each CockroachDB node binds back to the same storage on restart.<br><br>This tutorial assumes that dynamic volume provisioning is available. When that is not the case, [persistent volume claims](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) need to be created manually.
[RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) | RBAC, or Role-Based Access Control, is the system Kubernetes uses to manage permissions within the cluster. In order to take an action (e.g., `get` or `create`) on an API resource (e.g., a `pod`), the client must have a `Role` that allows it to do so.
[namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) | A namespace provides a scope for resources and names within a Kubernetes cluster. Names of resources need to be unique within a namespace, but not across namespaces. Most Kubernetes client commands will use the `default` namespace by default, but can operate on resources in other namespaces as well if told to do so.
[kubectl](https://kubernetes.io/docs/reference/kubectl/overview/) | `kubectl` is the command-line interface for running commands against Kubernetes clusters.
[kubectl context](https://kubernetes.io/docs/reference/kubectl/cheatsheet/#kubectl-context-and-configuration) | A `kubectl` "context" specifies a Kubernetes cluster to connect to and authentication for doing so. You can set a context as the default using the `kubectl use-context <context-name>` command such that all future `kubectl` commands will talk to that cluster, or you can specify the `--context=<context-name>` flag on almost any `kubectl` command to tell it which cluster you want to run the command against. We will make heavy use of the `--context` flag in these instructions in order to run commands against the different regions' Kubernetes clusters.

### UX differences from running in a single cluster

These instructions create a StatefulSet that runs CockroachDB in each of the Kubernetes clusters you provide to the configuration scripts. These StatefulSets can be scaled independently of each other by running `kubectl` commands against the appropriate cluster. These steps will also point each Kubernetes cluster's DNS server at the other clusters' DNS servers so that DNS lookups for certain zone-scoped suffixes (e.g., "*.us-west1-a.svc.cluster.local") can be deferred to the appropriate cluster's DNS server. However, in order to make this work, we create the StatefulSets in namespaces named after the zone in which the cluster is running. This means that in order to run a command against one of the pods, you have to run, e.g., `kubectl logs cockroachdb-0 --namespace=us-west1-a` instead of just `kubectl logs cockroachdb-0`. Alternatively, you can [configure your `kubectl` context to default to using that namespace for commands run against that cluster](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/#setting-the-namespace-preference).

Note that the CockroachDB pods being in a non-default namespace means that if we didn't do anything about it then any client applications wanting to talk to CockroachDB from the default namespace would need to talk to a zone-scoped service name such as "cockroachdb-public.us-west1-a" rather than just the normal "cockroachdb-public" that they would use in a single-cluster setting. However, the setup script used by these instructions sets up an additional [`ExternalName` service](https://kubernetes.io/docs/concepts/services-networking/service/#externalname) in the default namespace such that the clients in the default namespace can simply talk to the "cockroachdb-public" address.

Finally, if you haven't worked with multiple Kubernetes clusters often before, you may find yourself forgetting to think about which cluster you want to run a given command against, and thus getting confusing results to your commands. Remember that you will either have to run `kubectl use-context <context-name>` frequently to switch contexts between commands or you will have to append `--context=<context-name>` on most commands you run to ensure they are run on the correct cluster.

### Limitations

#### Kubernetes version

Kubernetes 1.18 or higher is required.

#### Exposing DNS servers

{{site.data.alerts.callout_danger}}
Until December 2019, Google Cloud Platform restricted clients to using a load balancer in the same region. In the approach documented below, the DNS servers from each Kubernetes cluster are hooked together by exposing them via a load balanced IP address that is visible to the public Internet. None of the services in your Kubernetes cluster will be accessible publicly, but their names could leak out to a motivated attacker.

You can now [enable global access](https://cloud.google.com/load-balancing/docs/internal/setting-up-internal#ilb-global-access) on Google Cloud Platform to allow clients from one region to use an internal load balancer in another. We will update this tutorial accordingly.
{{site.data.alerts.end}}

## Step 1. Start Kubernetes clusters

Our multi-region deployment approached relies on pod IP addresses being routable across three distinct Kubernetes clusters and regions. The hosted Google Kubernetes Engine (GKE) service satisfies this requirement, so that is the environment featured here. If you want to run on another cloud or on-premises, use this [basic network test](https://github.com/cockroachdb/cockroach/tree/master/cloud/kubernetes/multiregion#pod-to-pod-connectivity) to see if it will work.

1. Complete the **Before You Begin** steps described in the [Google Kubernetes Engine Quickstart](https://cloud.google.com/kubernetes-engine/docs/quickstart) documentation.

    This includes installing `gcloud`, which is used to create and delete Kubernetes Engine clusters, and `kubectl`, which is the command-line tool used to manage Kubernetes from your workstation.

    {{site.data.alerts.callout_success}}The documentation offers the choice of using Google's Cloud Shell product or using a local shell on your machine. Choose to use a local shell if you want to be able to view the CockroachDB Admin UI using the steps in this guide.{{site.data.alerts.end}}

2. From your local workstation, start the first Kubernetes cluster, specifying the [zone](https://cloud.google.com/compute/docs/regions-zones/) it should run in:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters create cockroachdb1 --zone=<gce-zone>
    ~~~

    ~~~
    Creating cluster cockroachdb1...done.
    ~~~

    This creates GKE instances in the zone specified and joins them into a single Kubernetes cluster named `cockroachdb1`.

    The process can take a few minutes, so do not move on to the next step until you see a `Creating cluster cockroachdb1...done` message and details about your cluster.

3. Start the second Kubernetes cluster, specifying the [zone](https://cloud.google.com/compute/docs/regions-zones/) it should run in:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters create cockroachdb2 --zone=<gce-zone>
    ~~~

    ~~~
    Creating cluster cockroachdb2...done.
    ~~~

4. Start the third Kubernetes cluster, specifying the [zone](https://cloud.google.com/compute/docs/regions-zones/) it should run in:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters create cockroachdb3 --zone=<gce-zone>
    ~~~

    ~~~
    Creating cluster cockroachdb3...done.
    ~~~

5. Get the `kubectl` "contexts" for your clusters:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl config get-contexts
    ~~~

    ~~~
    CURRENT   NAME                                                  CLUSTER                                               AUTHINFO                                              NAMESPACE
    *         gke_cockroach-shared_us-east1-b_cockroachdb1          gke_cockroach-shared_us-east1-b_cockroachdb1          gke_cockroach-shared_us-east1-b_cockroachdb1
              gke_cockroach-shared_us-west1-a_cockroachdb2          gke_cockroach-shared_us-west1-a_cockroachdb2          gke_cockroach-shared_us-west1-a_cockroachdb2
              gke_cockroach-shared_us-central1-a_cockroachdb3       gke_cockroach-shared_us-central1-a_cockroachdb3       gke_cockroach-shared_us-central1-a_cockroachdb3                        
    ~~~

    {{site.data.alerts.callout_info}}
    All of the `kubectl` commands in this tutorial use the `--context` flag to tell `kubectl` which Kubernetes cluster to talk to. Each Kubernetes cluster operates independently; you have to tell each of them what to do separately, and when you want to get the status of something in a particular cluster, you have to make it clear to `kubectl` which cluster you're interested in.

    The context with `*` in the `CURRENT` column indicates the cluster that `kubectl` will talk to by default if you do not specify the `--context` flag.
    {{site.data.alerts.end}}

6. Get the email address associated with your Google Cloud account:

    {% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create clusterrolebinding $USER-cluster-admin-binding --clusterrole=cluster-admin --user=<your.google.cloud.email@example.org> --context=<context-name-of-kubernetes-cluster1>
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create clusterrolebinding $USER-cluster-admin-binding --clusterrole=cluster-admin --user=<your.google.cloud.email@example.org> --context=<context-name-of-kubernetes-cluster2>
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create clusterrolebinding $USER-cluster-admin-binding --clusterrole=cluster-admin --user=<your.google.cloud.email@example.org> --context=<context-name-of-kubernetes-cluster3>
    ~~~

## Step 2. Start CockroachDB

1. Create a directory and download the required script and configuration files into it:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir multiregion
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cd multiregion
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl -OOOOOOOOO \
    https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/multiregion/{README.md,client-secure.yaml,cluster-init-secure.yaml,cockroachdb-statefulset-secure.yaml,dns-lb.yaml,example-app-secure.yaml,external-name-svc.yaml,setup.py,teardown.py}
    ~~~

2. At the top of the `setup.py` script, fill in the `contexts` map with the zones of your clusters and their "context" names, for example:

    ~~~
    context = {
        'us-east1-b': 'gke_cockroach-shared_us-east1-b_cockroachdb1',
        'us-west1-a': 'gke_cockroach-shared_us-west1-a_cockroachdb2',
        'us-central1-a': 'gke_cockroach-shared_us-central1-a_cockroachdb3',
    }
    ~~~

    You retrieved the `kubectl` "contexts" in an earlier step. To get them again, run:

    {% include_cached copy-clipboard.html %}
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

5. Optionally, to optimize your deployment for better performance, review [CockroachDB Performance on Kubernetes](kubernetes-performance.html) and make the desired modifications to the `cockroachdb-statefulset-secure.yaml` file.

6. Run the `setup.py` script:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ python setup.py
    ~~~

    As the script creates various resources and creates and initializes the CockroachDB cluster, you'll see a lot of output, eventually ending with `job "cluster-init-secure" created`.

7. Confirm that the CockroachDB pods in each cluster say `1/1` in the `READY` column, indicating that they've successfully joined the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods --selector app=cockroachdb --all-namespaces --context=<context-name-of-kubernetes-cluster1>
    ~~~

    ~~~
    NAMESPACE    NAME            READY     STATUS    RESTARTS   AGE
    us-east1-b   cockroachdb-0   1/1       Running   0          14m
    us-east1-b   cockroachdb-1   1/1       Running   0          14m
    us-east1-b   cockroachdb-2   1/1       Running   0          14m    
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods --selector app=cockroachdb --all-namespaces --context=<context-name-of-kubernetes-cluster2>
    ~~~

    ~~~
    NAMESPACE       NAME            READY     STATUS    RESTARTS   AGE
    us-central1-a   cockroachdb-0   1/1       Running   0          14m
    us-central1-a   cockroachdb-1   1/1       Running   0          14m
    us-central1-a   cockroachdb-2   1/1       Running   0          14m
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods --selector app=cockroachdb --all-namespaces --context=<context-name-of-kubernetes-cluster3>
    ~~~

    ~~~
    NAMESPACE    NAME            READY     STATUS    RESTARTS   AGE
    us-west1-a   cockroachdb-0   1/1       Running   0          14m
    us-west1-a   cockroachdb-1   1/1       Running   0          14m
    us-west1-a   cockroachdb-2   1/1       Running   0          14m
    ~~~    

    If you notice that only one of the Kubernetes clusters' pods are marked as `READY`, you likely also need to configure a network firewall rule that will allow the pods in the different clusters to talk to each other. You can run the following command to create a firewall rule allowing traffic on port 26257 (the port used by CockroachDB for inter-node traffic) within your private GCE network. It will not allow any traffic in from outside your private network:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud compute firewall-rules create allow-cockroach-internal --allow=tcp:26257 --source-ranges=10.0.0.0/8,172.16.0.0/12,192.168.0.0/16
    ~~~

    ~~~
    Creating firewall...done.
    NAME                      NETWORK  DIRECTION  PRIORITY  ALLOW      DENY
    allow-cockroach-internal  default  INGRESS    1000      tcp:26257
    ~~~

{{site.data.alerts.callout_success}}
In each Kubernetes cluster, the StatefulSet configuration sets all CockroachDB nodes to write to `stderr`, so if you ever need access to a pod/node's logs to troubleshoot, use `kubectl logs <podname> --namespace=<cluster-namespace> --context=<cluster-context>` rather than checking the log on the persistent volume.
{{site.data.alerts.end}}

## Step 3. Use the built-in SQL client

1. Use the `client-secure.yaml` file to launch a pod and keep it running indefinitely, specifying the context of the Kubernetes cluster to run it in:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f client-secure.yaml --context=<cluster-context>
    ~~~

    ~~~
    pod "cockroachdb-client-secure" created
    ~~~

    The pod uses the `root` client certificate created earlier by the `setup.py` script. Note that this will work from any of the three Kubernetes clusters as long as you use the correct namespace and context combination.

2. Get a shell into the pod and start the CockroachDB [built-in SQL client](cockroach-sql.html), again specifying the namespace and context of the Kubernetes cluster where the pod is running:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure --context=<cluster-context> -- ./cockroach sql --certs-dir=/cockroach-certs --host=cockroachdb-public
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

3. [Create a user with a password](create-user.html#create-a-user-with-a-password):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER roach WITH PASSWORD 'Q7gc8rEdS';
    ~~~

      You will need this username and password to [access the Admin UI](#step-4-access-the-admin-ui) in Step 4.

4. Exit the SQL shell and pod:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

    The pod will continue running indefinitely, so any time you need to reopen the built-in SQL client or run any other [`cockroach` client commands](cockroach-commands.html) (e.g., `cockroach node`), repeat step 2 using the appropriate command.

    If you'd prefer to delete the pod and recreate it when needed, run:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pod cockroachdb-client-secure --context=<cluster-context>
    ~~~

## Step 4. Access the Admin UI

To access the cluster's [Admin UI](admin-ui-overview.html):

1. On secure clusters, [certain pages of the Admin UI](admin-ui-overview.html#admin-ui-access) can only be accessed by `admin` users.

    Get a shell into the pod with the `cockroach` binary created earlier and start the CockroachDB [built-in SQL client](cockroach-sql.html):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure --context=<cluster-context> -- ./cockroach sql --certs-dir=/cockroach-certs --host=cockroachdb-public
    ~~~

2.  Assign `roach` to the `admin` role (you only need to do this once):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > GRANT admin TO roach;
    ~~~

3. Exit the SQL shell and pod:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

4. Port-forward from your local machine to a pod in one of your Kubernetes clusters:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl port-forward cockroachdb-0 8080 --namespace=<cluster-namespace> --context=<cluster-context>
    ~~~

    ~~~
    Forwarding from 127.0.0.1:8080 -> 8080
    ~~~

    {{site.data.alerts.callout_info}}
    The `port-forward` command must be run on the same machine as the web browser in which you want to view the Admin UI. If you have been running these commands from a cloud instance or other non-local shell, you will not be able to view the UI without configuring `kubectl` locally and running the above `port-forward` command on your local machine.
    {{site.data.alerts.end}}

5. Go to <a href="https://localhost:8080/" data-proofer-ignore>https://localhost:8080</a> and log in with the username and password created in the [Use the built-in SQL client](#step-3-use-the-built-in-sql-client) step.

6. In the UI, check the **Node List** to verify that all nodes are running, and then click the **Databases** tab on the left to verify that `bank` is listed.

## Step 5. Simulate datacenter failure

One of the major benefits of running a multi-region cluster is that an entire datacenter or region can go down without affecting the availability of the CockroachDB cluster as a whole.

To see this in action:

1. Scale down one of the StatefulSets to zero pods, specifying the namespace and context of the Kubernetes cluster where it's running:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl scale statefulset cockroachdb --replicas=0 --namespace=<cluster-namespace> --context=<cluster-context>
    ~~~

    ~~~
    statefulset "cockroachdb" scaled
    ~~~

2. In the Admin UI, the **Cluster Overview** will soon show the three nodes from that region as **Suspect**. If you wait for 5 minutes or more, they will be listed as **Dead**. Note that even though there are three dead nodes, the other nodes are all healthy, and any clients using the database in the other regions will continue to work just fine.

3. When you're done verifying that the cluster still fully functions with one of the regions down, you can bring the region back up by running:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl scale statefulset cockroachdb --replicas=3 --namespace=<cluster-namespace> --context=<cluster-context>
    ~~~

    ~~~
    statefulset "cockroachdb" scaled
    ~~~

## Step 6. Maintain the cluster

- [Scale the cluster](#scale-the-cluster)
- [Upgrade the cluster](#upgrade-the-cluster)
- [Stop the cluster](#stop-the-cluster)

### Scale the cluster

Each of your Kubernetes clusters contains 3 nodes that pods can run on. To ensure that you do not have two pods on the same node (as recommended in our [production best practices](recommended-production-settings.html)), you need to add a new worker node and then edit your StatefulSet configuration to add another pod.

1. [Resize your cluster](https://cloud.google.com/kubernetes-engine/docs/how-to/resizing-a-cluster).

2. Use the `kubectl scale` command to add a pod to the StatefulSet in the Kubernetes cluster where you want to add a CockroachDB node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl scale statefulset cockroachdb --replicas=4 --namespace=<cluster-namespace> --context=<cluster-context>
    ~~~

    ~~~
    statefulset "cockroachdb" scaled
    ~~~

3. Verify that a fourth pod was added successfully:

    {% include_cached copy-clipboard.html %}
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

As new versions of CockroachDB are released, it's strongly recommended to upgrade to newer versions in order to pick up bug fixes, performance improvements, and new features. The [general CockroachDB upgrade documentation](upgrade-cockroach-version.html) provides best practices for how to prepare for and execute upgrades of CockroachDB clusters, but the mechanism of actually stopping and restarting processes in Kubernetes is somewhat special.

Kubernetes knows how to carry out a safe rolling upgrade process of the CockroachDB nodes. When you tell it to change the Docker image used in the CockroachDB StatefulSet, Kubernetes will go one-by-one, stopping a node, restarting it with the new image, and waiting for it to be ready to receive client requests before moving on to the next one. For more information, see [the Kubernetes documentation](https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/#updating-statefulsets).

1. Decide how the upgrade will be finalized.

    {{site.data.alerts.callout_info}}This step is relevant only when upgrading from v2.0.x to v2.1. For upgrades within the v2.1.x series, skip this step.{{site.data.alerts.end}}

    By default, after all nodes are running the new version, the upgrade process will be **auto-finalized**. This will enable certain performance improvements and bug fixes introduced in v2.1. After finalization, however, it will no longer be possible to perform a downgrade to v2.0. In the event of a catastrophic failure or corruption, the only option will be to start a new cluster using the old binary and then restore from one of the backups created prior to performing the upgrade.

    We recommend disabling auto-finalization so you can monitor the stability and performance of the upgraded cluster before finalizing the upgrade:

    1. Get a shell into the pod with the `cockroach` binary created earlier and start the CockroachDB [built-in SQL client](cockroach-sql.html):

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-client-secure --context=<cluster-context> -- ./cockroach sql --certs-dir=/cockroach-certs --host=cockroachdb-public
        ~~~

    2. Set the `cluster.preserve_downgrade_option` [cluster setting](cluster-settings.html):

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        > SET CLUSTER SETTING cluster.preserve_downgrade_option = '2.0';
        ~~~

2. For each Kubernetes cluster, kick off the upgrade process by changing the desired Docker image. To do so, pick the version that you want to upgrade to, then run the following command, replacing "VERSION" with your desired new version and specifying the relevant namespace and "context" name for the Kubernetes cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl patch statefulset cockroachdb --namespace=<namespace-of-kubernetes-cluster1> --context=<context-name-of-kubernetes-cluster1> --type='json' -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value":"cockroachdb/cockroach:VERSION"}]'
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl patch statefulset cockroachdb --namespace=<namespace-of-kubernetes-cluster2> --context=<context-name-of-kubernetes-cluster2> --type='json' -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value":"cockroachdb/cockroach:VERSION"}]'
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl patch statefulset cockroachdb --namespace=<namespace-of-kubernetes-cluster3> --context=<context-name-of-kubernetes-cluster3> --type='json' -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value":"cockroachdb/cockroach:VERSION"}]'
    ~~~

3. If you then check the status of the pods in each Kubernetes cluster, you should see one of them being restarted:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods --selector app=cockroachdb --all-namespaces --context=<context-name-of-kubernetes-cluster1>
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods --selector app=cockroachdb --all-namespaces --context=<context-name-of-kubernetes-cluster1>
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods --selector app=cockroachdb --all-namespaces --context=<context-name-of-kubernetes-cluster1>
    ~~~

    This will continue until all of the pods have restarted and are running the new image.

4. Finish the upgrade.

    {{site.data.alerts.callout_info}}This step is relevant only when upgrading from v2.0.x to v2.1. For upgrades within the v2.1.x series, skip this step.{{site.data.alerts.end}}

    If you disabled auto-finalization in step 1 above, monitor the stability and performance of your cluster for as long as you require to feel comfortable with the upgrade (generally at least a day). If during this time you decide to roll back the upgrade, repeat the rolling restart procedure with the old binary.

    Once you are satisfied with the new version, re-enable auto-finalization:

    1. Get a shell into the pod with the `cockroach` binary created earlier and start the CockroachDB [built-in SQL client](cockroach-sql.html):

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-client-secure --context=<cluster-context> -- ./cockroach sql --certs-dir=/cockroach-certs --host=cockroachdb-public
        ~~~

    2. Re-enable auto-finalization:

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        > RESET CLUSTER SETTING cluster.preserve_downgrade_option;
        ~~~

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

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters delete cockroachdb1 --zone=<gce-zone>
    ~~~

    ~~~
    Deleting cluster cockroachdb1...done.
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters delete cockroachdb2 --zone=<gce-zone>
    ~~~

    ~~~
    Deleting cluster cockroachdb2...done.
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters delete cockroachdb3 --zone=<gce-zone>
    ~~~

    ~~~
    Deleting cluster cockroachdb3...done.
    ~~~

## See also

- [Kubernetes Single-Cluster Deployment](orchestrate-cockroachdb-with-kubernetes.html)
- [Kubernetes Performance Guide](kubernetes-performance.html)
{% include {{ page.version.version }}/prod-deployment/prod-see-also.md %}
