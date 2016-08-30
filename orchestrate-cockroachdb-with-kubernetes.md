---
title: Orchestrate CockroachDB with Kubernetes
summary: 
toc: false
---

[Kubernetes](http://kubernetes.io/) is an open-source system for automating the deployment, scaling, and management of containerized applications. This page shows you how to use Kubernetes' [`minikube`](https://github.com/kubernetes/minikube) tool to test out CockroachDB on Kubernetes locally, using the alpha [Pet Set](http://kubernetes.io/docs/user-guide/petset/) feature and [persistent volumes](http://kubernetes.io/docs/user-guide/persistent-volumes/) to ensure distinguishable network identity and persistent storage for CockroachDB nodes. Docs for running CockroachDB on Kubernetes in a cloud environment are coming soon. 

{{site.data.alerts.callout_info}}Running a stateful application such as CockroachDB on Kubernetes requires using some of Kubernetes' more complex features available only in alpha versions. There are easier ways to run CockroachDB on Kubernetes for testing purposes, but the method presented here is destined to become a production deployment once Kubernetes matures sufficiently.{{site.data.alerts.end}}

<div id="toc"></div>

## Before You Begin

This tutorial shows you how to run a 5-node CockroachDB cluster on Kubernetes locally. Before you begin, it's helpful to understand some Kubernetes-specific terminology:

Feature | Description
--------|------------
[minikube](http://kubernetes.io/docs/getting-started-guides/minikube/) | This is the tool you'll use to run a single-node Kubernetes cluster inside a VM on your computer.
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one of more Docker containers. In our case, each pod will contain one Docker container running a single CockroachDB node. You'll start with 5 pods and grow to 6.
[Pet Set](http://kubernetes.io/docs/user-guide/petset/) | You'll run CockroachDB as a Pet Set to ensure that each pod has distinguishable network identity and always binds back to the same persistent storage on restart. Pet Sets are only available in Kubernetes clusters that have alpha features enabled.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | Because each CockroachDB node must bind back to the same persistent storage on restart, you'll mount local temporary directories as persistent volumes that will endure for as long as the Kubernetes cluster is running.
[persistent volume claim](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) | When pods are created (one per CockroachDB node), each pod will request a persistent volume claim to “claim” durable storage for its node.

## Step 1. Install and start Kubernetes locally

Follow Kubernetes' [documentation](http://kubernetes.io/docs/getting-started-guides/minikube/) to install `minikube` and `kubectl` for your OS. Then start a local Kubernetes cluster:

~~~ shell
$ minikube start
Starting local Kubernetes cluster...
Kubectl is now configured to use the cluster.
~~~

## Step 2. Start the CockroachDB cluster

1. Download the [`minikube.sh`](https://github.com/cockroachdb/cockroach/tree/develop/cloud/kubernetes/minikube.sh) script:

   ~~~ shell
   $ wget https://raw.githubusercontent.com/cockroachdb/cockroach/develop/cloud/kubernetes/minikube.sh
   ~~~
 
2. Download the [`cockroachdb-petset.yaml`](https://github.com/cockroachdb/cockroach/blob/develop/cloud/kubernetes/cockroachdb-petset.yaml) configuration file:

   ~~~ shell
   $ wget https://raw.githubusercontent.com/cockroachdb/cockroach/develop/cloud/kubernetes/cockroachdb-petset.yaml
   ~~~
 
3. Run the script: 

   ~~~ shell
   $ sh minikube.sh
   ~~~

   The script automates the process of creating [persistent volumes](http://kubernetes.io/docs/user-guide/persistent-volumes/)  and [persistent volume claims](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims). It also runs the [`kubectl create`](http://kubernetes.io/docs/user-guide/kubectl/kubectl_create/) command against the `cockroachdb-petset.yaml` file to create the [Pet Set](http://kubernetes.io/docs/user-guide/petset/).

3. Use the [`kubectl get`](http://kubernetes.io/docs/user-guide/kubectl/kubectl_get/) command to verify that the persistent volumes and corresponding claims were created successfully:

   ~~~ shell
   $ kubectl get persistentvolumes
   NAME      CAPACITY   ACCESSMODES   STATUS    CLAIM                           REASON    AGE
   pv0       1Gi        RWO           Bound     default/datadir-cockroachdb-0             27s
   pv1       1Gi        RWO           Bound     default/datadir-cockroachdb-1             26s
   pv2       1Gi        RWO           Bound     default/datadir-cockroachdb-2             26s
   pv3       1Gi        RWO           Bound     default/datadir-cockroachdb-3             26s
   pv4       1Gi        RWO           Bound     default/datadir-cockroachdb-4             26s
   pv5       1Gi        RWO           Bound     default/datadir-cockroachdb-5             26s
   ~~~

4. Wait a bit and then verify that five pods were created successfully. If you don't see five pods, wait longer and check again.

   ~~~ shell
   $ kubectl get pods
   NAME            READY     STATUS    RESTARTS   AGE
   cockroachdb-0   1/1       Running   0          3m
   cockroachdb-1   1/1       Running   0          3m
   cockroachdb-2   1/1       Running   0          3m
   cockroachdb-3   1/1       Running   0          2m
   cockroachdb-4   1/1       Running   0          2m
   ~~~

{{site.data.alerts.callout_success}}The Pet Set configuration sets all CockroachDB nodes to write to <code>stderr</code>, so if you ever need access to a pod/node's logs to troubleshoot, use <code>kubectl logs PODNAME</code> rather than checking the log on the pod itself.{{site.data.alerts.end}}

## Step 3. Use the Built-in SQL Client 

1. Use the [`kubectl exec`](http://kubernetes.io/docs/user-guide/kubectl/kubectl_exec/) command to start a Bash session in any pod:

   ~~~ shell
   $ kubectl exec -it cockroachdb-0 bash
   ~~~

2. Start the [built-in SQL client](use-the-built-in-sql-client.html) in interactive mode:

   ~~~ shell
   root@cockroachdb-0:/cockroach# ./cockroach sql --host $(hostname)
   # Welcome to the cockroach SQL interface.
   # All statements must be terminated by a semicolon.
   # To exit: CTRL + D.
   ~~~

3. Run some [CockroachDB SQL statements](sql-statements.html):

   ~~~ shell
   root@cockroachdb-0:26257> CREATE DATABASE bank;
   CREATE DATABASE

   root@cockroachdb-0:26257> CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
   CREATE TABLE

   root@cockroachdb-0:26257> INSERT INTO bank.accounts VALUES (1234, 10000.50);
   INSERT 1

   root@cockroachdb-0:26257> SELECT * FROM bank.accounts;
   +------+----------+
   |  id  | balance  |
   +------+----------+
   | 1234 | 10000.50 |
   +------+----------+
   (1 row)
   ~~~

   {{site.data.alerts.callout_danger}}As you type commands in the CockroachDB SQL shell, the history incrementally disappears. The is a <a href="https://github.com/cockroachdb/cockroach/issues/8788">known issue</a> currently being investigated.{{site.data.alerts.end}}

4. When you're done with the SQL shell, use **CTRL + D**, **CTRL + C**, or `\q` to exit. Then use **CTRL + D** to exit the Bash session.

## Step 4. Simulate node failure

Based on the `replicas: 5` line in the Pet Set configuration, Kubernetes ensures that five pods/nodes are running at all times. If a pod/node fails, Kubernetes will automatically create another pod/node with the same network identity and storage.

To see this in action:

1. Kill one of CockroachDB nodes:

   ~~~ shell
   $ kubectl exec cockroachdb-3 -- /bin/bash -c "while true; do kill 1; done"
   error: error executing remote command: error executing command in container: Error executing in Docker Container: 137
   ~~~

2. Verify that the pod was restarted:

   ~~~ shell
   $ kubectl get pod cockroachdb-3
   NAME            READY     STATUS             RESTARTS   AGE
   cockroachdb-3   0/1       CrashLoopBackOff   1          1m
   ~~~

3. Wait a bit and then verify that the pod is ready:

   ~~~ shell
   $ kubectl get pod cockroachdb-3
   NAME            READY     STATUS    RESTARTS   AGE
   cockroachdb-3   1/1       Running   1          1m
   ~~~

## Step 5. Scale the cluster up or down

To increase or decrease the number of pods/nodes in your cluster, use the [`kubectl patch`](http://kubernetes.io/docs/user-guide/kubectl/kubectl_patch/) command to alter the `replicas: 5` configuration for your Pet Set. 

For example, since you created six persistent volumes and volume claims in [step 2](#step-2-start-the-cockroachdb-cluster), and only five of them are in use by pods, you can add a replica and safely assume that it will claim the final persistent volume:

~~~ shell
$ kubectl patch petset cockroachdb -p '{"spec":{"replicas":6}}'
"cockroachdb" patched
~~~ 

Verify that a sixth pod was added successfully: 

~~~ shell
$ kubectl get pods
NAME            READY     STATUS    RESTARTS   AGE
cockroachdb-0   1/1       Running   0          20m
cockroachdb-1   1/1       Running   0          19m
cockroachdb-2   1/1       Running   0          19m
cockroachdb-3   1/1       Running   1          11m
cockroachdb-4   1/1       Running   0          18m
cockroachdb-5   1/1       Running   0          57s 
~~~

## Step 6. Stop the cluster 

When you've finished testing out CockroachDB on Kubernetes, stop the Kubernetes cluster: 

~~~ shell
$ minikube stop
Stopping local Kubernetes cluster...
Machine stopped.
~~~

{{site.data.alerts.callout_success}}Stopping the Kubernetes cluster will delete the persistent storage, which was bound to temp directories, so if you want to retain logs, copy them from each pod's <code>stderr</code> before shutting down the cluster. To access a pod's standard error stream, run <code>kubectl logs PODNAME</code>.{{site.data.alerts.end}}

Alternately, if you'd rather keep the Kubernetes cluster running, run the following command to delete all of the CockroachDB resources:

~~~ shell
$ kubectl delete petsets,pods,persistentvolumes,persistentvolumeclaims,services -l app=cockroachdb
~~~

<script>
$(document).ready(function(){

  var $filter_button = $('.filter-button');

    $filter_button.on('click', function(){
      var scope = $(this).data('scope'),
      $current_tab = $('.filter-button.current'), $current_content = $('.filter-content.current');

      //remove current class from tab and content
      $current_tab.removeClass('current');
      $current_content.removeClass('current');

      //add current class to clicked button and corresponding content block
      $('.filter-button[data-scope="'+scope+'"').addClass('current');
      $('.filter-content[data-scope="'+scope+'"').addClass('current');
    });
});
</script>

<style>
.filters .scope-button {
  width: 15%;
}
</style>