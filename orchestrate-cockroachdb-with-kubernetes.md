---
title: Orchestrate CockroachDB with Kubernetes
summary: 
toc: false
---

This page shows you how to orchestrate the deployment and management of an insecure 3-node CockroachDB cluster with [Kubernetes](http://kubernetes.io/), using the alpha [PetSet](http://kubernetes.io/docs/user-guide/petset/) feature.

{{site.data.alerts.callout_info}}Running a stateful application such as CockroachDB on Kubernetes requires using some of Kubernetes' more complex features available only in alpha versions. There are easier ways to run CockroachDB on Kubernetes for testing purposes, but the method presented here is destined to become a production deployment once Kubernetes matures sufficiently.{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}Deploying an <strong>insecure</strong> cluster is not recommended for data in production. We'll update this page after improving the process to deploy secure clusters.{{site.data.alerts.end}}

<div id="toc"></div>

## Before You Begin

Before you begin, it's helpful to review some terminology:

Feature | Description
--------|------------
instance | A physical or virtual machine. In this tutorial, you'll run a Kubernetes script from your local workstation that will create 4 GCE or AWS instances and join them into a single Kubernetes cluster. 
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one of more Docker containers. In this tutorial, each pod will run on a separate instance and contain one Docker container running a single CockroachDB node. You'll start with 3 pods and grow to 4.
[PetSet](http://kubernetes.io/docs/user-guide/petset/) | A PetSet is a group of pods treated as stateful units, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart. PetSets are an alpha feature as of Kubernetes version 1.4. As such, they may not be available in some production-ready hosting environments.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | Because each CockroachDB node must bind back to the same persistent storage on restart, external temporary directories will be dynamically mounted as persistent volumes that will endure for as long as the Kubernetes cluster is running.<br><br>This tutorial assumes that dynamic volume provisioning is available. When that is not the case, [persistent volume claims](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) need to be created manually. See our [`minikube.sh`](https://github.com/cockroachdb/cockroach/tree/master/cloud/kubernetes/minikube.sh) script for the necessary steps.

## Step 1. Start Kubernetes

From your local workstation, install prerequisites and start a Kubernetes cluster as described in the Kubernetes documentation:

- For GCE-specific instructions, see [Running Kubernetes on Google Compute Engine](http://kubernetes.io/docs/getting-started-guides/gce/).
- For AWS-specific instructions, see [Running Kubernetes on AWS EC2](http://kubernetes.io/docs/getting-started-guides/aws/)

The heart of this step is running a Kubernetes script that creates 4 GCE or AWS instances and joins them into a single Kubernetes cluster, all from your local workstation. You'll run subsequent steps from your local workstation as well.

{{site.data.alerts.callout_info}}If you want to run the Kubernetes cluster locally instead of in the cloud, follow the instructions in <a href="http://kubernetes.io/docs/getting-started-guides/minikube/">Running Kubernetes Locally via Minikube</a>, and then download and run our <a href="https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/minikube.sh"><code>minikube.sh</code></a> script.{{site.data.alerts.end}}

## Step 3. Start the CockroachDB cluster
 
2. From your local worstation, download the [`cockroachdb-petset.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-petset.yaml) configuration file:

   ~~~ shell
   $ wget https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cockroachdb-petset.yaml
   ~~~
 
3. Create the PetSet: 

   ~~~ shell
   $ kubectl create -f cockroachdb-petset.yaml
   ~~~

3. Use the [`kubectl get`](http://kubernetes.io/docs/user-guide/kubectl/kubectl_get/) command to verify that the persistent volumes and corresponding claims were created successfully:

   ~~~ shell
   $ kubectl get persistentvolumes
   ~~~
   
   ~~~
   NAME                                       CAPACITY   ACCESSMODES   RECLAIMPOLICY   STATUS    CLAIM                           REASON    AGE
   pvc-52f51ecf-8bd5-11e6-a4f4-42010a800002   1Gi        RWO           Delete          Bound     default/datadir-cockroachdb-0             26s
   pvc-52fd3a39-8bd5-11e6-a4f4-42010a800002   1Gi        RWO           Delete          Bound     default/datadir-cockroachdb-1             27s
   pvc-5315efda-8bd5-11e6-a4f4-42010a800002   1Gi        RWO           Delete          Bound     default/datadir-cockroachdb-2             27s
   ~~~

4. Wait a bit and then verify that three pods were created successfully. If you don't see three pods, wait longer and check again.

   ~~~ shell
   $ kubectl get pods
   ~~~

   ~~~
   NAME            READY     STATUS    RESTARTS   AGE
   cockroachdb-0   1/1       Running   0          3m
   cockroachdb-1   1/1       Running   0          3m
   cockroachdb-2   1/1       Running   0          2m
   ~~~

{{site.data.alerts.callout_success}}The PetSet configuration sets all CockroachDB nodes to write to <code>stderr</code>, so if you ever need access to a pod/node's logs to troubleshoot, use <code>kubectl logs &lt;podname&gt;</code> rather than checking the log on the pod itself.{{site.data.alerts.end}}

## Step 3. Use the Built-in SQL Client 

1. Start the [built-in SQL client](use-the-built-in-sql-client.html) in a one-off interactive pod, using the `cockroachdb-public` hostname to access the CockroachDB cluster::

   ~~~ shell
   $ kubectl run cockroachdb -it --image=cockroachdb/cockroach --rm --restart=Never \
   -- sql --host=cockroachdb-public
   ~~~

2. Run some [CockroachDB SQL statements](sql-statements.html):

   ~~~ sql
   > CREATE DATABASE bank;
   
   > CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
   
   > INSERT INTO bank.accounts VALUES (1234, 10000.50);
   
   > SELECT * FROM bank.accounts;
   ~~~

   ~~~ shell
   +------+----------+
   |  id  | balance  |
   +------+----------+
   | 1234 | 10000.50 |
   +------+----------+
   (1 row)
   ~~~

4. When you're done with the SQL shell, use **CTRL + D**, **CTRL + C**, or `\q` to exit and delete the temporary pod.

## Step 4. Simulate node failure

Based on the `replicas: 3` line in the PetSet configuration, Kubernetes ensures that three pods/nodes are running at all times. If a pod/node fails, Kubernetes will automatically create another pod/node with the same network identity and persistent storage.

To see this in action:

1. Kill one of CockroachDB nodes:

   ~~~ shell
   $ kubectl delete pod cockroachdb-2
   ~~~

   ~~~
   pod "cockroachdb-2" deleted
   ~~~

2. Verify that the pod was restarted:

   ~~~ shell
   $ kubectl get pod cockroachdb-2
   ~~~
   ~~~
   NAME            READY     STATUS              RESTARTS   AGE
   cockroachdb-2   0/1       ContainerCreating   0          3s
   ~~~

3. Wait a bit and then verify that the pod is ready:

   ~~~ shell
   $ kubectl get pod cockroachdb-2
   ~~~

   ~~~
   NAME            READY     STATUS    RESTARTS   AGE
   cockroachdb-2   1/1       Running   0          1m
   ~~~

## Step 5. Scale the cluster up or down

To increase or decrease the number of pods/nodes in your cluster, use the [`kubectl patch`](http://kubernetes.io/docs/user-guide/kubectl/kubectl_patch/) command to alter the `replicas: 3` configuration for your PetSet. 

For example, since the Kubernetes script create 4 VMs, and only 3 of them are in use by pods, you can add a replica and safely assume that it will run on the final VM:

~~~ shell
$ kubectl patch petset cockroachdb -p '{"spec":{"replicas":4}}'
~~~

~~~
"cockroachdb" patched
~~~ 

Verify that a fourth pod was added successfully: 

~~~ shell
$ kubectl get pods
NAME            READY     STATUS    RESTARTS   AGE
cockroachdb-0   1/1       Running   0          2h
cockroachdb-1   1/1       Running   0          2h
cockroachdb-2   1/1       Running   0          9m
cockroachdb-3   1/1       Running   0          46s
~~~

## Step 6. Stop the cluster 

To shut down the CockroachDB cluster and clean up all of the resources you created, run:

~~~ shell
$ kubectl delete pods,petsets,services,persistentvolumeclaims,persistentvolumes \
--selector app=cockroachdb
~~~

Alternately, to stop the entire Kubernetes cluster, run the `kube-down.sh` script in the `kubernetes` directory. 

{{site.data.alerts.callout_success}}Stopping the Kubernetes cluster will delete the persistent storage, which was bound to temp directories, so if you want to retain logs, copy them from each pod's <code>stderr</code> before shutting down the cluster. To access a pod's standard error stream, run <code>kubectl logs &lt;podname&gt;</code>.{{site.data.alerts.end}}
