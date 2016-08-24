---
title: Orchestrate CockroachDB with Kubernetes
summary: 
toc: false
---

[Kubernetes](http://kubernetes.io/) is an open-source system for automating the deployment, scaling, and management of containerized applications. Although Kubernetes is not yet production-ready for stateful applications such as CockroachDB, you can use Kubernetes' [`minikube`](https://github.com/kubernetes/minikube) tool to test out CockroachDB on Kubernetes locally, using persistent volumes and the alpha [Pet Set](http://kubernetes.io/docs/user-guide/petset/) feature to ensure persistent identity and storage for CockroachDB nodes. This page shows you how.

<div id="toc"></div>

## Step 1. Install and start Kubernetes locally

Follow Kubernetes' [documentation](http://kubernetes.io/docs/getting-started-guides/minikube/) to install `minikube` and `kubectl` for your OS. Then start a local Kubernetes cluster:

~~~ shell
$ minikube start
Starting local Kubernetes cluster...
Kubectl is now configured to use the cluster.
~~~

## Step 2. Create persistent volumes and volume claims

Each CockroachDB node will run in a [pod](http://kubernetes.io/docs/user-guide/pods/), which is a group of one or more Docker containers that can share resources. In our case, each pod will have only one container running a CockroachDB node. 

Normally, on-disk files in a pod are ephemeral. If a pod crashes and Kubernetes starts a new one, the on-disk files are lost. To prevent that from happening, create and run the following bash script to mount local temporary directories as [persistent volumes](http://kubernetes.io/docs/user-guide/persistent-volumes/) that will endure for as long as the Kubernetes cluster is running. The bash script also creates [persistent volume claims](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims). In step 4, when pods are created (one per node), each pod will request a persistent volume claim to "claim" durable storage for its node.

~~~ bash
#!/usr/bin/env bash
# Excerpted from https://github.com/kubernetes/kubernetes/blob/master/examples/cockroachdb/minikube.sh

set -exuo pipefail

for i in $(seq 0 5); do
  cat <<EOF | kubectl create -f -
kind: PersistentVolume
apiVersion: v1
metadata:
  name: pv${i}
  labels:
    type: local
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/tmp/${i}"
EOF

  cat <<EOF | kubectl create -f -
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: datadir-cockroachdb-${i}
  labels:
    app: cockroachdb
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
EOF
done;
~~~

Use the [`kubectl get pv`](http://kubernetes.io/docs/user-guide/kubectl/kubectl_get/) command to verify that persistent volumes and corresponding claims were created successfully:

~~~ shell
$ kubectl get pv
NAME      CAPACITY   ACCESSMODES   STATUS    CLAIM                           REASON    AGE
pv0       1Gi        RWO           Bound     default/datadir-cockroachdb-0             27s
pv1       1Gi        RWO           Bound     default/datadir-cockroachdb-1             26s
pv2       1Gi        RWO           Bound     default/datadir-cockroachdb-2             26s
pv3       1Gi        RWO           Bound     default/datadir-cockroachdb-3             26s
pv4       1Gi        RWO           Bound     default/datadir-cockroachdb-4             26s
pv5       1Gi        RWO           Bound     default/datadir-cockroachdb-5             26s
~~~

## Step 3. Create the Pet Set configuration

In Kubernetes, pods are normally treated as stateless units. The [Pet Set](http://kubernetes.io/docs/user-guide/petset/) feature, however, causes pods to have persistent identity and storage. Using this feature, if a pod crashes or is otherwise removed, Kubernetes will create another pod with the same identity and storage (as demonstrated in [step 6](#step-6-simulate-node-failure)). 

Create the following Pet Set yaml file. Note that the `replicas: 5` line specifies that the CockroachDB cluster will contain five pods/nodes.

~~~ yaml
# Excerpted from https://github.com/kubernetes/kubernetes/blob/master/examples/cockroachdb/cockroachdb-petset.yaml

apiVersion: v1
kind: Service
metadata:
  # This service is meant to be used by clients of the database. It exposes a ClusterIP that will
  # automatically load balance connections to the different database pods.
  name: cockroachdb-public
  labels:
    app: cockroachdb-public
spec:
  ports:
  # The main port, served by gRPC, serves Postgres-flavor SQL, internode
  # traffic and the cli.
  - port: 26257
    targetPort: 26257
    name: grpc
  # The secondary port serves the UI as well as health and debug endpoints.
  - port: 8080
    targetPort: 8080
    name: http
  selector:
    app: cockroachdb
---
apiVersion: v1
kind: Service
metadata:
  annotations:
    # Make sure DNS is resolvable during initialization.
    service.alpha.kubernetes.io/tolerate-unready-endpoints: "true"
    # Enable automatic monitoring of all instances when Prometheus is running in the cluster.
    prometheus.io/scrape: "true"
    prometheus.io/path: "_status/vars"
    prometheus.io/port: "8080"
  # This service only exists to create DNS entries for each pet in the petset such that they can resolve
  # each other's IP addresses. It does not create a load-balanced ClusterIP and should not be used
  # directly by clients in most circumstances.
  name: cockroachdb
  labels:
    app: cockroachdb
spec:
  ports:
  - port: 26257
    targetPort: 26257
    name: grpc
  - port: 8080
    targetPort: 8080
    name: http
  clusterIP: None
  selector:
    app: cockroachdb
---
apiVersion: apps/v1alpha1
kind: PetSet
metadata:
  name: cockroachdb
spec:
  serviceName: "cockroachdb"
  replicas: 5
  template:
    metadata:
      labels:
        app: cockroachdb
      annotations:
        pod.alpha.kubernetes.io/initialized: "true"
    spec:
      containers:
      - name: cockroachdb
        image: cockroachdb/cockroach:{{site.data.strings.version}}
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 26257
          name: grpc
        - containerPort: 8080
          name: http
        livenessProbe:
          httpGet:
            path: /_admin/v1/health
            port: http
          initialDelaySeconds: 30
        readinessProbe:
          httpGet:
            path: /_admin/v1/health
            port: http
          initialDelaySeconds: 10
        # No pre-stop hook is required, a SIGTERM plus some time is all that's needed for graceful
        # shutdown of a node.
        terminationGracePeriodSeconds: 60
        volumeMounts:
        - name: datadir
          mountPath: /cockroach/cockroach-data
        command:
          - "/bin/bash"
          - "-ecx"
          - |
            # The use of qualified `hostname -f` is crucial:
            # Other nodes aren't able to look up the unqualified hostname.
            CRARGS=("start" "--logtostderr" "--insecure" "--host" "$(hostname -f)")
            if [ ! "$(hostname)" == "cockroachdb-0" ] || \
               [ -e "/cockroach/cockroach-data/COCKROACHDB_VERSION" ]
            then
              CRARGS+=("--join" "cockroachdb")
            fi
            /cockroach/cockroach ${CRARGS[*]}
      volumes:
      - name: datadir
        persistentVolumeClaim:
          claimName: datadir
  volumeClaimTemplates:
  - metadata:
      name: datadir
      annotations:
        volume.alpha.kubernetes.io/storage-class: anything
    spec:
      accessModes:
        - "ReadWriteOnce"
      resources:
        requests:
          storage: 1Gi
~~~

## Step 4. Start the CockroachDB cluster

To create pods and start the CockroachDB cluster, run the [`kubectl create`](http://kubernetes.io/docs/user-guide/kubectl/kubectl_create/) command against your Pet Set yaml file, in this case called `cockroachdb-petset.yaml`:

~~~ shell
$ kubectl create -f cockroachdb-petset.yaml
service "cockroachdb-public" created
service "cockroachdb" created
petset "cockroachdb" created
~~~

Wait a minute, and then verify that five pods were created successfully. If you don't see five pods, wait longer and try again.

~~~ shell
$ kubectl get pod
NAME            READY     STATUS    RESTARTS   AGE
cockroachdb-0   1/1       Running   0          3m
cockroachdb-1   1/1       Running   0          3m
cockroachdb-2   1/1       Running   0          3m
cockroachdb-3   1/1       Running   0          2m
cockroachdb-4   1/1       Running   0          2m
~~~

{{site.data.alerts.callout_success}}The Pet Set configuration sets all CockroachDB nodes to write to <code>stderr</code>, so if you ever need access to a pod/node's logs to troubleshoot, use <code>kubectl logs PODNAME</code> rather than checking the log on the pod itself.{{site.data.alerts.end}}  

## Step 5. Use the Built-in SQL Client 

Use the [`kubectl exec`](http://kubernetes.io/docs/user-guide/kubectl/kubectl_exec/) command to start a Bash session in any pod:

~~~ shell
$ kubectl exec -it cockroachdb-0 bash
~~~

Start the [built-in SQL client](use-the-built-in-sql-client.html) in interactive mode:

~~~ shell
root@cockroachdb-0:/cockroach# ./cockroach sql --host $(hostname)
# Welcome to the cockroach SQL interface.
# All statements must be terminated by a semicolon.
# To exit: CTRL + D.
~~~

Then run some [CockroachDB SQL statements](sql-statements.html):

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

When you're done with the SQL shell, use **CTRL + D**, **CTRL + C**, or `\q` to exit. Then use **CTRL + D** to exit the Bash session.

## Step 6. Simulate node failure

Based on the `replicas: 5` line in the Pet Set configuration, Kubernetes ensure that five pods/nodes are running at all times. If a pod/node fails, Kubernetes will automatically create another pod/node with the same identity and storage.

To see this in action, kill one of the pods:

~~~ shell
$ kubectl exec cockroachdb-3 -- /bin/bash -c "while true; do kill 1; done"
~~~

Verify that the pod was restarted:

~~~ shell
$ kubectl get pod cockroachdb-3
NAME            READY     STATUS             RESTARTS   AGE
cockroachdb-3   0/1       CrashLoopBackOff   1          1m
~~~

Wait a bit and then verify that the pod is ready:

~~~ shell
$ kubectl get pod cockroachdb-3
NAME            READY     STATUS    RESTARTS   AGE
cockroachdb-3   1/1       Running   1          1m
~~~

## Step 7. Scale the cluster up or down

To increase or decrease the number of pods/nodes in your cluster, use the [`kubectl patch`](http://kubernetes.io/docs/user-guide/kubectl/kubectl_patch/) command to alter the `replicas: 5` configuration for your Pet Set. 

For example, since the script in [step 2](#step-2-create-persistent-volumes-and-volume-claims) created six persistent volumes and volume claims, and only five of them are in use by pods, you can add a replica and safely assume that it will claim the final persistent volume:

~~~ shell
$ kubectl patch petset cockroachdb -p '{"spec":{"replicas":6}}'
"cockroachdb" patched
~~~ 

Verify that a sixth pod was added successfully: 

~~~ shell
$ kubectl get pod
NAME            READY     STATUS    RESTARTS   AGE
cockroachdb-0   1/1       Running   0          20m
cockroachdb-1   1/1       Running   0          19m
cockroachdb-2   1/1       Running   0          19m
cockroachdb-3   1/1       Running   4          11m
cockroachdb-4   1/1       Running   0          18m
cockroachdb-5   1/1       Running   0          57s 
~~~

## Step 8. Stop the cluster 

When you've finished testing out CockroachDB on Kubernetes, stop the Kubernetes cluster: 

~~~ shell
$ minikube stop
Stopping local Kubernetes cluster...
Machine stopped.
~~~

{{site.data.alerts.callout_success}}Stopping the Kubernetes cluster will delete the persistent storage, which was bound to temp directories, so if you want to retain logs, copy them from each pod's <code>stderr</code> before shutting down the cluster. To access a pod's standard error stream, run <code>kubectl logs PODNAME</code>.{{site.data.alerts.end}}

Alternately, if you'd rather keep the Kubernetes cluster running but remove all of the CockroachDB resources, run the following:

~~~ shell
$ kubectl delete pods,pvc,petsets,svc -l app=cockroachdb
$ kubectl delete svc -l app=cockroachdb-public
$ kubectl delete pv pv0 pv1 pv2 pv3 pv4 pv5
~~~
