---
title: Orchestrate CockroachDB with Kubernetes
summary: How to orchestrate the deployment and management of an insecure 3-node CockroachDB cluster with Kubernetes.
toc: false
---

This page shows you how to orchestrate the deployment and management of an insecure 3-node CockroachDB cluster with [Kubernetes](http://kubernetes.io/), using the alpha [PetSet](http://kubernetes.io/docs/user-guide/petset/) feature.

{{site.data.alerts.callout_info}}Running a stateful application such as CockroachDB on Kubernetes requires using some of Kubernetes' more complex features available only in alpha versions. There are easier ways to run CockroachDB on Kubernetes for testing purposes, but the method presented here is destined to become a production deployment once Kubernetes matures sufficiently.{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}Deploying an <strong>insecure</strong> cluster is not recommended for data in production. We'll update this page after improving the process to deploy secure clusters.{{site.data.alerts.end}}

<div id="toc"></div>

## Step 1. Choose your deployment environment

Choose the environment where you will run CockroachDB with Kubernetes. The instructions below will adjust based on your choice. 

<style>
.filters .scope-button {
  width: 20%;
  height: 65px;
  margin: 15px 15px 10px 0px;
}
.filters a:hover {
  border-bottom: none;
}
</style>

<div class="filters clearfix">
  <button class="filter-button scope-button current" data-scope="cloud">Cloud</button>
  <button class="filter-button scope-button" data-scope="local">Local</button>
</div><p></p>

It might also be helpful to review some Kubernetes-specific terminology:

<div class="filter-content current" markdown="1" data-scope="cloud">

Feature | Description
--------|------------
instance | A physical or virtual machine. In this tutorial, you'll run a Kubernetes script from your local workstation that will create 4 GCE or AWS instances and join them into a single Kubernetes cluster. 
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one of more Docker containers. In this tutorial, each pod will run on a separate instance and contain one Docker container running a single CockroachDB node. You'll start with 3 pods and grow to 4.
[PetSet](http://kubernetes.io/docs/user-guide/petset/) | A PetSet is a group of pods treated as stateful units, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart. PetSets are an alpha feature as of Kubernetes version 1.4. As such, they may not be available in some production-ready hosting environments.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | Because each CockroachDB node must bind back to the same persistent storage on restart, external temporary directories will be dynamically mounted as persistent volumes that will endure for as long as the Kubernetes cluster is running.<br><br>This tutorial assumes that dynamic volume provisioning is available. When that is not the case, [persistent volume claims](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) need to be created manually. See our [`minikube.sh`](https://github.com/cockroachdb/cockroach/tree/master/cloud/kubernetes/minikube.sh) script for the necessary steps.

</div>

<div class="filter-content" markdown="1" data-scope="local">

Feature | Description
--------|------------
[minikube](http://kubernetes.io/docs/getting-started-guides/minikube/) | This is the tool you'll use to run a single-node Kubernetes cluster inside a VM on your computer.
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one of more Docker containers. In this tutorial, each pod will run on a separate instance and contain one Docker container running a single CockroachDB node. You'll start with 3 pods and grow to 4.
[PetSet](http://kubernetes.io/docs/user-guide/petset/) | A PetSet is a group of pods treated as stateful units, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart. PetSets are an alpha feature as of Kubernetes version 1.4. As such, they may not be available in some production-ready hosting environments.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | Because each CockroachDB node must bind back to the same persistent storage on restart, external temporary directories will be dynamically mounted as persistent volumes that will endure for as long as the Kubernetes cluster is running.
[persistent volume claim](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) | When pods are created (one per CockroachDB node), each pod will request a persistent volume claim to “claim” durable storage for its node.

</div>

## Step 2. Install and start Kubernetes

<div class="filter-content current" markdown="1" data-scope="cloud">

From your local workstation, install prerequisites and start a Kubernetes cluster as described in the Kubernetes documentation:

- For GCE-specific instructions, see [Running Kubernetes on Google Compute Engine](http://kubernetes.io/docs/getting-started-guides/gce/).
- For AWS-specific instructions, see [Running Kubernetes on AWS EC2](http://kubernetes.io/docs/getting-started-guides/aws/)

The heart of this step is running a Kubernetes script that creates 4 GCE or AWS instances and joins them into a single Kubernetes cluster, all from your local workstation. You'll run subsequent steps from your local workstation as well.

</div>

<div class="filter-content" markdown="1" data-scope="local">

Follow Kubernetes' [documentation](http://kubernetes.io/docs/getting-started-guides/minikube/) to install `minikube` and `kubectl` for your OS. Then start a local Kubernetes cluster:

~~~ shell
$ minikube start
Starting local Kubernetes cluster...
Kubectl is now configured to use the cluster.
~~~

</div>

## Step 3. Start the CockroachDB cluster

<div class="filter-content current" markdown="1" data-scope="cloud">

2. From your local workstation, use our [`cockroachdb-petset.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-petset.yaml) file to create the PetSet:

   ~~~ shell
   $ kubectl create -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cockroachdb-petset.yaml
   ~~~
 
2. Use the [`kubectl get`](http://kubernetes.io/docs/user-guide/kubectl/kubectl_get/) command to verify that the persistent volumes and corresponding claims were created successfully:

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

   ~~~ shell
   $ kubectl get pods
   ~~~

   ~~~
   NAME            READY     STATUS    RESTARTS   AGE
   cockroachdb-0   1/1       Running   0          2m
   cockroachdb-1   1/1       Running   0          2m
   cockroachdb-2   1/1       Running   0          2m
   ~~~

{{site.data.alerts.callout_success}}The PetSet configuration sets all CockroachDB nodes to write to <code>stderr</code>, so if you ever need access to a pod/node's logs to troubleshoot, use <code>kubectl logs &lt;podname&gt;</code> rather than checking the log on the pod itself.{{site.data.alerts.end}}

</div>

<div class="filter-content" markdown="1" data-scope="local">

1. Download the [`minikube.sh`](https://github.com/cockroachdb/cockroach/tree/master/cloud/kubernetes/minikube.sh) script:

   ~~~ shell
   $ wget https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/minikube.sh
   ~~~

2. Download the [`cockroachdb-petset.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-petset.yaml) configuration file:

   ~~~ shell
   $ wget https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cockroachdb-petset.yaml
   ~~~

3. Run the script:

   ~~~ shell
   $ sh minikube.sh
   ~~~

   The script automates the process of creating [persistent volumes](http://kubernetes.io/docs/user-guide/persistent-volumes/)  and [persistent volume claims](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims). It also runs the [`kubectl create`](http://kubernetes.io/docs/user-guide/kubectl/kubectl_create/) command against the `cockroachdb-petset.yaml` file to create the [Pet Set](http://kubernetes.io/docs/user-guide/petset/).

3. Use the [`kubectl get`](http://kubernetes.io/docs/user-guide/kubectl/kubectl_get/) command to verify that the persistent volumes and corresponding claims were created successfully:

   ~~~ shell
   $ kubectl get persistentvolumes
   ~~~

   ~~~
   NAME      CAPACITY   ACCESSMODES   STATUS    CLAIM                           REASON    AGE
   pv0       1Gi        RWO           Bound     default/datadir-cockroachdb-0             27s
   pv1       1Gi        RWO           Bound     default/datadir-cockroachdb-1             26s
   pv2       1Gi        RWO           Bound     default/datadir-cockroachdb-2             26s
   ~~~

4. Wait a bit and then verify that three pods were created successfully. If you don't see three pods, wait longer and check again.

   ~~~ shell
   $ kubectl get pods
   ~~~
   
   ~~~
   NAME            READY     STATUS    RESTARTS   AGE
   cockroachdb-0   1/1       Running   0          2m
   cockroachdb-1   1/1       Running   0          2m
   cockroachdb-2   1/1       Running   0          2m
   ~~~

{{site.data.alerts.callout_success}}The Pet Set configuration sets all CockroachDB nodes to write to <code>stderr</code>, so if you ever need access to a pod/node's logs to troubleshoot, use <code>kubectl logs PODNAME</code> rather than checking the log on the pod itself.{{site.data.alerts.end}}

</div>

## Step 4. Use the Built-in SQL Client 

<div class="filter-content current" markdown="1" data-scope="cloud">

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

</div>

<div class="filter-content" markdown="1" data-scope="local">

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

4. When you're done with the SQL shell, use **CTRL + D**, **CTRL + C**, or `\q` to exit. Then use **CTRL + D** to exit the Bash session.

</div>

## Step 5. Simulate node failure

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

## Step 6. Scale the cluster

<div class="filter-content current" markdown="1" data-scope="cloud">

The Kubernetes script created 4 nodes, one master and 3 workers. Pods only get placed on worker nodes, so to ensure that you don't have two pods on the same node, you need to add a new worker node and then edit your PetSet configuration to add an additional pod.

1.  Add a worker node:

    - On GCE, resize your [Managed Instance Group](https://cloud.google.com/compute/docs/instance-groups/).
    - On AWS, resize your [Auto Scaling Group](http://docs.aws.amazon.com/autoscaling/latest/userguide/as-manual-scaling.html).  

2.  Use the [`kubectl patch`](http://kubernetes.io/docs/user-guide/kubectl/kubectl_patch/) command to add a pod to your PetSet:

    ~~~ shell
    $ kubectl patch petset cockroachdb -p '{"spec":{"replicas":4}}'
    ~~~

    ~~~
    "cockroachdb" patched
    ~~~ 

3.  Verify that a fourth pod was added successfully: 

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

</div>

<div class="filter-content" markdown="1" data-scope="local">

To increase the number of pods in your cluster, use the [`kubectl patch`](http://kubernetes.io/docs/user-guide/kubectl/kubectl_patch/) command to alter the `replicas: 3` configuration for your PetSet. 

For example, since the [`minikube.sh`](https://github.com/cockroachdb/cockroach/tree/master/cloud/kubernetes/minikube.sh) script created four persistent volumes and volume claims, and only three of them are in use by pods, you can add a replica and safely assume that it will claim the final persistent volume:

~~~ shell
$ kubectl patch petset cockroachdb -p '{"spec":{"replicas":4}}'
~~~

~~~
"cockroachdb" patched
~~~ 

Verify that a fourth pod was added successfully: 

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

</div>

## Step 7. Stop the cluster 

To shut down the CockroachDB cluster:

<div class="filter-content current" markdown="1" data-scope="cloud">

1. Use the [`kubectl delete`](http://kubernetes.io/docs/user-guide/kubectl/kubectl_delete/) command to clean up all of the resources you created, including the logs and remote persistent volumes:

   ~~~ shell
   $ kubectl delete pods,petsets,services,persistentvolumeclaims,persistentvolumes \
   --selector app=cockroachdb
   ~~~

2. Run the `kube-down.sh` script in the `kubernetes` directory to stop Kubernetes.

{{site.data.alerts.callout_danger}}If you stop Kubernetes without first deleting resources, the remote persistent volumes will still exist in your cloud project.{{site.data.alerts.end}}

</div>

<div class="filter-content" markdown="1" data-scope="local">

1. Use the [`kubectl delete`](http://kubernetes.io/docs/user-guide/kubectl/kubectl_delete/) command to clean up all of the resources you created, including the remote persistent volumes and logs:

   ~~~ shell
   $ kubectl delete pods,petsets,services,persistentvolumeclaims,persistentvolumes \
   --selector app=cockroachdb
   ~~~

2. Use the [`minikube stop`](https://github.com/kubernetes/minikube/blob/master/docs/minikube_stop.md) command stop Kubernetes:

   ~~~ shell
   $ minikube stop
   ~~~

   ~~~
   Stopping local Kubernetes cluster...
   Machine stopped.
   ~~~

{{site.data.alerts.callout_success}}If you want to retain logs, be sure to copy them from each pod's <code>stderr</code> before removing resources or stopping Kubernetes. To access a pod's standard error stream, run <code>kubectl logs &lt;podname&gt;</code>.{{site.data.alerts.end}}

</div>

## See Also

- [Orchestrate CockroachDB with Docker Swarm](orchestrate-cockroachdb-with-docker-swarm.html)
- [Cloud Deployment](cloud-deployment.html)
- [Manual Deployment](manual-deployment.html)
- [Local Deployment](start-a-local-cluster.html)

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

