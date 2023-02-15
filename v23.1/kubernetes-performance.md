---
title: CockroachDB Performance on Kubernetes
summary: How running CockroachDB in Kubernetes affects its performance and how to get the best possible performance when running in Kubernetes.
toc: true
docs_area: deploy
---

Kubernetes provides many useful abstractions for deploying and operating distributed systems, but some of the abstractions come with a performance overhead and an increase in underlying system complexity. This page explains potential bottlenecks to be aware of when [running CockroachDB in Kubernetes](kubernetes-overview.html) and shows you how to optimize your deployment for better performance.

<div id="toc"></div>

## Before you begin

Before you focus on optimizing a Kubernetes-orchestrated CockroachDB cluster:

1. Before deploying on Kubernetes, ensure that performance is optimized for your workload on identical hardware. You may find that you first need to [modify your workload](performance-best-practices-overview.html) or use [different machine specs](recommended-production-settings.html#hardware) to achieve the performance you need.
1. Go through the documentation for [deploying CockroachDB in a single Kubernetes cluster](deploy-cockroachdb-with-kubernetes.html) to familiarize yourself with the necessary Kubernetes terminology and deployment abstractions.

## Performance factors

A number of independent factors affect performance when running CockroachDB on Kubernetes. Most are easiest to change before you create your CockroachDB cluster. If you need to modify a CockroachDB cluster that is already running on Kubernetes, extra care and testing is strongly recommended.

The following sections show how to modify excerpts from our provided Kubernetes configuration YAML files. You can find the most up-to-date versions of these files on GitHub: [one for running CockroachDB in secure mode](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset-secure.yaml) and one for [running CockroachDB in insecure mode](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset.yaml).

You can also use a [performance-optimized configuration file for secure mode](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/performance/cockroachdb-statefulset-secure.yaml) or [insecure mode](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/performance/cockroachdb-statefulset-insecure.yaml). Be sure to modify the file wherever there is a `TODO` comment.

### Version of CockroachDB

Because CockroachDB is under very active development, there are typically substantial performance gains in each release. If you aren't running the latest release and aren't getting the performance you desire, you should try the latest and see how much it helps.

### Client workload

Your workload is the single most important factor in database performance. Read through our [SQL performance best practices](performance-best-practices-overview.html) to determine whether there are any easy changes that you can make to speed up your application.

### Machine size

The size of the machines you're using isn't a Kubernetes-specific concern, but it's always a good place to start if you want more performance. See our [hardware recommendations](recommended-production-settings.html#hardware) for specific suggestions, but using machines with more CPU will almost always allow for greater throughput. Be aware that because Kubernetes runs a set of processes on every machine in a cluster, you typically will get more bang for your buck by using fewer large machines than more small machines.

### Disk type

CockroachDB makes heavy use of the disks you provide it, so using faster disks is an easy way to improve your cluster's performance. Our provided configuration does not specify what type of disks it wants, so in most environments Kubernetes will auto-provision disks of the default type. In the common cloud environments (AWS, GCP, Azure) this means you'll get slow disks that aren't optimized for database workloads (e.g.,HDDs on GCE, SSDs without provisioned IOPS on AWS). However, we [strongly recommend using SSDs](recommended-production-settings.html#hardware) for the best performance, and Kubernetes makes it relatively easy to use them.

#### Creating a different disk type

Kubernetes exposes the disk types used by its volume provisioner via its [`StorageClass` API object](https://kubernetes.io/docs/concepts/storage/storage-classes/). Each cloud environment has its own default `StorageClass`, but you can easily change the default or create a new named class which you can then ask for when asking for volumes. To do this, pick the type of volume provisioner you want to use from the list in the [Kubernetes documentation](https://kubernetes.io/docs/concepts/storage/storage-classes/), take the example YAML file they provide, modify it to have the disk type you want, then run `kubectl create -f <your-storage-class-file.yaml>`. For example, in order to use the `pd-ssd` disk type on Google Compute Engine or Google Kubernetes Engine, you can use a `StorageClass` file like this:

~~~ yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: <your-ssd-class-name>
provisioner: kubernetes.io/gce-pd
parameters:
  type: pd-ssd
~~~

You can then use this new disk type either by configuring the CockroachDB YAML file to request it or by making it the default. You may also want to set additional parameters as documented in the list of Kubernetes storage classes, such as configuring the `iopsPerGB` if you're creating a `StorageClass` for AWS's `io1` Provisioned IOPS volume type.

#### Configuring the disk type used by CockroachDB

To use a new `StorageClass` without making it the default in your cluster, you have to modify your application's YAML file to ask for it. In the CockroachDB StatefulSet configuration, that means adding a line to its `VolumeClaimTemplates` section. For example, that would mean taking these lines of the CockroachDB config file:

~~~ yaml
  volumeClaimTemplates:
  - metadata:
      name: datadir
    spec:
      accessModes:
        - "ReadWriteOnce"
      resources:
        requests:
          storage: 1Gi
~~~

And adding a `storageClassName` field to the `spec`, changing them to:

~~~ yaml
  volumeClaimTemplates:
  - metadata:
      name: datadir
    spec:
      accessModes:
        - "ReadWriteOnce"
      storageClassName: <your-ssd-class-name>
      resources:
        requests:
          storage: 1Gi
~~~

If you make this change then run `kubectl create -f` on your YAML file, Kubernetes should create volumes for you using your new `StorageClass`.

#### Changing the default disk type

If you want your new `StorageClass` to be the default for all volumes in your cluster, you have to run a couple of commands to inform Kubernetes of what you want. First, get the names of your `StorageClass`es. Then remove the current default and add yours as the new default.

{% include_cached copy-clipboard.html %}
~~~ shell
$ kubectl get storageclasses
~~~

~~~
NAME                 PROVISIONER
ssd                  kubernetes.io/gce-pd
standard (default)   kubernetes.io/gce-pd
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ kubectl patch storageclass standard -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'
~~~

~~~
storageclass "standard" patched
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ kubectl patch storageclass ssd -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
~~~

~~~
storageclass "ssd" patched
~~~

Note that if you are running an older version of Kubernetes, you may need to use a beta version of the annotation instead of the form used above. In particular, on v1.8 of Kubernetes you need to use `storageclass.beta.kubernetes.io/is-default-class`. To determine for sure which to use, run `kubectl describe storageclass` and copy the annotation used by the current default.

### Disk size

On some cloud providers (notably including all GCP disks and the AWS io1 disk type), the number of IOPS available to a disk is directly correlated to the size of the disk. In such cases, increasing the size of your disks can make for significantly better CockroachDB performance, as well as less risk of filling them up. Doing so is easy -- before you create your CockroachDB cluster, modify the `VolumeClaimTemplate` in the CockroachDB YAML file to ask for more space. For example, to give each CockroachDB instance 1TB of disk space, you'd change:

~~~ yaml
  volumeClaimTemplates:
  - metadata:
      name: datadir
    spec:
      accessModes:
        - "ReadWriteOnce"
      resources:
        requests:
          storage: 1Gi
~~~

To instead be:

~~~ yaml
  volumeClaimTemplates:
  - metadata:
      name: datadir
    spec:
      accessModes:
        - "ReadWriteOnce"
      resources:
        requests:
          storage: 1024Gi
~~~

Since [GCE disk IOPS scale linearly with disk size](https://cloud.google.com/compute/docs/disks/performance#type_comparison), a 1TiB disk gives 1024 times as many IOPS as a 1GiB disk, which can make a very large difference for write-heavy workloads.

### Local disks

Up to this point, we have assumed the use of auto-provisioned, remotely attached disks. However, local disks typically provide better performance than remotely attached disks. For example, SSD Instance Store Volumes outperform EBS Volumes on AWS, and Local SSDs outperform Persistent Disks on GCE. As of v1.14, Kubernetes supports [`local` volumes](https://kubernetes.io/docs/concepts/storage/volumes/#local).

Note that when running with local disks, there is a greater chance of experiencing a disk failure than when using the cloud providers' network-attached disks that are often replicated underneath the covers. Consequently, you may want to [configure replication zones](configure-replication-zones.html) to increase the replication factor of your data to 5 from its default of 3 when using local disks.

### Resource requests and limits

When you ask Kubernetes to run a pod, either directly or indirectly through another resource type such as a StatefulSet, you can tell it to reserve certain amounts of CPU and/or memory for each container in the pod or to limit the CPU and/or memory of each container. Doing one or both of these can have different implications depending on how utilized your Kubernetes cluster is. For the authoritative information on this topic, see the [Kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/).

#### Resource requests

Resource requests allow you to reserve a certain amount of CPU or memory for your container. If you add resource requests to your CockroachDB YAML file, Kubernetes will schedule each CockroachDB pod onto a node with sufficient unreserved resources and will ensure the pods are guaranteed the reserved resources using the applicable Linux container primitives. If you are running other workloads in your Kubernetes cluster, setting resource requests is very strongly recommended to ensure good performance, because if you do not set them then CockroachDB could be starved of CPU cycles or [OOM stopped](cluster-setup-troubleshooting.html#out-of-memory-oom-crash) before less important processes.

To determine how many resources are usable on your Kubernetes nodes, you can run:

{% include_cached copy-clipboard.html %}
~~~ shell
$ kubectl describe nodes
~~~

~~~
Name:               gke-perf-default-pool-aafee20c-k4t8
[...]
Capacity:
 cpu:     4
 memory:  15393536Ki
 pods:    110
Allocatable:
 cpu:     3920m
 memory:  12694272Ki
 pods:    110
[...]
Non-terminated Pods:         (2 in total)
  Namespace                  Name                                              CPU Requests  CPU Limits  Memory Requests  Memory Limits
  ---------                  ----                                              ------------  ----------  ---------------  -------------
  kube-system                kube-dns-778977457c-kqtlr                         260m (6%)     0 (0%)      110Mi (0%)       170Mi (1%)
  kube-system                kube-proxy-gke-perf-default-pool-aafee20c-k4t8    100m (2%)     0 (0%)      0 (0%)           0 (0%)
Allocated resources:
  (Total limits may be over 100 percent, i.e., overcommitted.)
  CPU Requests  CPU Limits  Memory Requests  Memory Limits
  ------------  ----------  ---------------  -------------
  360m (9%)     0 (0%)      110Mi (0%)       170Mi (1%)
~~~

This will output a lot of information for each of the nodes in your cluster, but if you focus in on the right parts you'll see how many "allocatable" resources are available on each node and how many resources are already being used by other pods. The "allocatable" resources are how much CPU and memory Kubernetes is willing to provide to pods running on the machine. The difference between the node's "capacity" and its "allocatable" resources is taken up by the operating system and Kubernetes's management processes. The "m" in "3920m" stands for "milli-CPUs", meaning "thousandths of a CPU".

You'll also see a number of pods running here that you may not have realized were in your cluster. Kubernetes runs a handful of pods in the `kube-system` namespace that are part of the cluster infrastructure. These may make it tough to attempt to reserve all the allocatable space on your nodes for CockroachDB, since some of them are essential for the Kubernetes cluster's health. If you want to run CockroachDB on every node in your cluster, you'll have to leave room for these processes. If you are only running CockroachDB on a subset of the nodes in your cluster, you can choose to take up all the "allocatable" space other than what is being used by the `kube-system` pods that are on all the nodes in the cluster, such as `kube-proxy` or the `fluentd` logging agent.

Note that it will be difficult to truly use up all of the allocatable space in the current versions of Kubernetes (v1.10 or older) because you'd have to manually preempt the `kube-system` pods that are already on the nodes you want CockroachDB to run on (by deleting them). This should become easier in future versions of Kubernetes when its [Pod Priority](https://kubernetes.io/docs/concepts/configuration/pod-priority-preemption/) feature gets promoted from alpha to beta. Once that feature is more widely available, you could set the CockroachDB pods to a higher priority, causing the Kubernetes scheduler to preempt and reschedule the `kube-system` pods onto other machines.

Once you've picked out an amount of CPU and memory to reserve for Cockroach, you'll have to configure the resource request in your CockroachDB YAML file. They should go underneath the `containers` heading. For example, to use most of the available resources on the machines described above, you'd change these lines of your YAML config file:

~~~ yaml
      containers:
      - name: cockroachdb
        image: {{page.release_info.docker_image}}:{{page.release_info.version}}
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 26257
          name: grpc
        - containerPort: 8080
          name: http
~~~

To be:

~~~ yaml
      containers:
      - name: cockroachdb
        image: {{page.release_info.docker_image}}:{{page.release_info.version}}
        imagePullPolicy: IfNotPresent
        resources:
          requests:
            cpu: "3500m"
            memory: "12300Mi"
        ports:
        - containerPort: 26257
          name: grpc
        - containerPort: 8080
          name: http
~~~

When you create the StatefulSet, you'll want to check to make sure that all the CockroachDB pods are scheduled successfully. If you see any get stuck in the pending state, run `kubectl describe pod <podname>` and check the `Events` for information about why they're still pending. You may need to manually preempt pods on one or more nodes by running `kubectl delete pod` on them to make room for the CockroachDB pods. As long as the pods you delete were created by a higher-level Kubernetes object such as a `Deployment` or a StatefulSet, they'll be safely recreated on another node.

#### Resource limits

Resource limits are conceptually similar to resource requests, but serve a different purpose. They let you cap the resources used by a pod to no more than the provided limit, which can have a couple of different uses. For one, it makes for more predictable performance because your pods will not be allowed to use any excess capacity on their machines, meaning that they will not have more resources available to them at some times (during lulls in traffic) than others (busy periods where the other pods on a machine are also fully utilizing their reserved resources). Secondly, it also increases the ["Quality of Service" guaranteed by the Kubernetes runtime](https://github.com/kubernetes/community/blob/master/contributors/design-proposals/node/resource-qos.md) on Kubernetes versions 1.8 and below, making the pods less likely to be preempted when a machine is oversubscribed. Finally, memory limits in particular limit the amount of memory that the container knows is available to it, which help when you specify percentages for the CockroachDB `--cache` and `--max-sql-memory` flags, as our default configuration file does.

Setting resource limits works about the same as setting resource requests. If you wanted to set resource limits in addition to requests on the config from the [Resource Requests](#resource-requests) section above, you'd change the config to:

~~~ yaml
      containers:
      - name: cockroachdb
        image: {{page.release_info.docker_image}}:{{page.release_info.version}}
        imagePullPolicy: IfNotPresent
        resources:
          requests:
            cpu: "3500m"
            memory: "12300Mi"
          limits:
            cpu: "3500m"
            memory: "12300Mi"
        ports:
        - containerPort: 26257
          name: grpc
        - containerPort: 8080
          name: http
~~~

The pods would then be restricted to only use the resource they have reserved and guaranteed to not be preempted except in very exceptional circumstances. This typically will not give you better performance on an under-utilized Kubernetes cluster, but will give you more predictable performance as other workloads are run.

{{site.data.alerts.callout_danger}}While setting memory limits is strongly recommended, <a href="https://github.com/kubernetes/kubernetes/issues/51135">setting CPU limits can hurt tail latencies as currently implemented by Kubernetes</a>. We recommend not setting CPU limits at all unless you have explicitly enabled the non-default <a href="https://kubernetes.io/docs/tasks/administer-cluster/cpu-management-policies/#static-policy">Static CPU Management Policy</a> when setting up your Kubernetes cluster, and even then only setting integer (non-fractional) CPU limits and memory limits exactly equal to the corresponding requests.{{site.data.alerts.end}}

#### Default resource requests and limits

Note that even if you do not manually set resource requests yourself, you're likely unknowingly using them anyways. In many installations of Kubernetes, a [`LimitRange`](https://kubernetes.io/docs/tasks/administer-cluster/cpu-default-namespace/) is preconfigured for the `default` namespace that applies a default CPU request of `100m`, or one-tenth of a CPU. You can see this configuration by running

{% include_cached copy-clipboard.html %}
~~~ shell
$ kubectl describe limitranges
~~~

~~~
Name:       limits
Namespace:  default
Type        Resource  Min  Max  Default Request  Default Limit  Max Limit/Request Ratio
----        --------  ---  ---  ---------------  -------------  -----------------------
Container   cpu       -    -    100m             -              -
~~~

Experimentally, this does not appear to have a noticeable effect on CockroachDB's performance when a Kubernetes cluster isn't heavily utilized, but do not be surprised if you see CPU requests on your pods that you didn't set.

### Other pods on the same machines as CockroachDB

As discovered in the above section on [Resource Requests and Limits](#resource-requests-and-limits), there will always be pods other than just CockroachDB running in your Kubernetes cluster, even if you do not create any other pods of your own. You can see them at any time by running:

{% include_cached copy-clipboard.html %}
~~~ shell
$ kubectl get pods --all-namespaces
~~~

~~~
NAMESPACE     NAME                                             READY     STATUS    RESTARTS   AGE
kube-system   event-exporter-v0.1.7-5c4d9556cf-6v7lf           2/2       Running   0          2m
kube-system   fluentd-gcp-v2.0.9-6rvmk                         2/2       Running   0          2m
kube-system   fluentd-gcp-v2.0.9-m2xgp                         2/2       Running   0          2m
kube-system   fluentd-gcp-v2.0.9-sfgps                         2/2       Running   0          2m
kube-system   fluentd-gcp-v2.0.9-szwwn                         2/2       Running   0          2m
kube-system   heapster-v1.4.3-968544ffd-5tsb8                  3/3       Running   0          1m
kube-system   kube-dns-778977457c-4s7vv                        3/3       Running   0          1m
kube-system   kube-dns-778977457c-ls6fq                        3/3       Running   0          2m
kube-system   kube-dns-autoscaler-7db47cb9b7-x2cc4             1/1       Running   0          2m
kube-system   kube-proxy-gke-test-default-pool-828d39a7-dbn0   1/1       Running   0          2m
kube-system   kube-proxy-gke-test-default-pool-828d39a7-nr06   1/1       Running   0          2m
kube-system   kube-proxy-gke-test-default-pool-828d39a7-rc4m   1/1       Running   0          2m
kube-system   kube-proxy-gke-test-default-pool-828d39a7-trd1   1/1       Running   0          2m
kube-system   kubernetes-dashboard-768854d6dc-v7ng8            1/1       Running   0          2m
kube-system   l7-default-backend-6497bcdb4d-2kbh4              1/1       Running   0          2m
~~~

These ["cluster add-ons"](https://github.com/kubernetes/kubernetes/tree/master/cluster/addons) provide a variety of basic services like managing DNS entries for services within the cluster, powering the Kubernetes dashboard UI, or collecting logs or metrics from all the pods running in the cluster. If you do not like having them take up space in your cluster, you can prevent some of them from running by configuring your Kubernetes cluster appropriately. For example, on GKE, you can create a cluster with the minimal set of addons by running:

{% include_cached copy-clipboard.html %}
~~~ shell
$ gcloud container clusters create <your-cluster-name> --no-enable-cloud-logging --no-enable-cloud-monitoring --addons=""
~~~

However, essentials like `kube-proxy` and `kube-dns` are effectively required to have a compliant Kubernetes cluster. This means that you'll always have some pods that aren't yours running in your cluster, so it's important to understand and account for the possible effects of CockroachDB having to share a machine with other processes. The more processes there are on the same machine as a CockroachDB pod, the worse and less predictable its performance will likely be. To protect against this, it's strongly recommended to run with [Resource Requests](#resource-requests) on your CockroachDB pods to provide some level of CPU and memory isolation.

Setting resource requests isn't a panacea, though. There can still be contention for shared resources like network I/O or, in [exceptional](https://sysdig.com/blog/container-isolation-gone-wrong/) cases, internal kernel data structures. For these reasons and because of the Kubernetes infrastructure processes running on each machine, CockroachDB running on Kubernetes simply cannot reach quite the same levels of performance as running directly on dedicated machines. Thankfully, it can at least get quite close if you use Kubernetes wisely.

If for some reason setting appropriate resource requests still isn't getting you the performance you expect, you might want to consider going all the way to [dedicated nodes](#dedicated-nodes).

#### Client applications on the same machines as CockroachDB

Running client applications such as benchmarking applications on the same machines as CockroachDB can be even worse than just having Kubernetes system pods on the same machines. They are very likely to end up competing for resources, because when the applications get more loaded than usual, so will the CockroachDB processes. The best way to avoid this is to [set resource requests and limits](#resource-requests-and-limits), but if you are unwilling or unable to do that for some reason, you can also set [anti-affinity scheduling policies](https://kubernetes.io/docs/concepts/configuration/assign-pod-node/#affinity-and-anti-affinity) on your client applications. Anti-affinity policies are placed in the pod spec, so if you wanted to change our provided example load generator app, you'd change [these lines](https://github.com/cockroachdb/cockroach/blob/98c506c48f3517d1ac1aadb6a09e1b23ad672c37/cloud/kubernetes/example-app.yaml#L11-L12):

~~~ yaml
    spec:
      containers:
~~~

To be:

~~~ yaml
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - loadgen
              topologyKey: kubernetes.io/hostname
          - weight: 99
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - cockroachdb
              topologyKey: kubernetes.io/hostname
      containers:
~~~

This configuration will first prefer to put the `loadgen` pods on different nodes from each other, which is important for the fault tolerance of the `loadgen` pods themselves. As a secondary priority, it will attempt to put the pods on nodes that do not already have a running `CockroachDB` pod. This will ensure the best possible balance of fault tolerance and performance for the load generator and CockroachDB cluster.

### Networking

[Kubernetes asks a lot of the network that it runs on](https://kubernetes.io/docs/concepts/cluster-administration/networking/) in order to provide a routable IP address and an isolated Linux network namespace to each pod in the cluster, among its other requirements. While this document isn't nearly large enough to properly explain the details, and those details themselves can depend heavily on specifically how you have set up the network for your cluster, it suffices to say that Docker and Kubernetes's networking abstractions often come with a performance penalty for high-throughput distributed applications such as CockroachDB.

If you really want to eke more performance out of your cluster, networking is a good target to at least experiment with. You can either replace your cluster's networking solution with a more performant one or bypass most of the networking overhead by using the host machines' networks directly.

#### Networking solutions

If you aren't using a hosted Kubernetes service, you'll typically have to choose how to set up the network when you're creating a Kubernetes cluster. There are [a lot of solutions out there](https://kubernetes.io/docs/concepts/cluster-administration/networking/#how-to-achieve-this), and they can have significantly different performance characteristics and functionality. We do not endorse any networking software or configurations in particular, but want to call out that your choice can have a meaningful affect on performance compared to running CockroachDB outside of Kubernetes.

#### Using the host's network

If you are already content with your cluster's networking setup or do not want to have to mess with it, Kubernetes does offer an escape hatch for exceptional cases that lets you avoid network performance overhead -- the `hostNetwork` setting, which allows you to run pods using their host machine's network directly and bypass the layers of abstraction. This comes with a number of downsides, of course. For example, two pods using `hostNetwork` on the same machine cannot use the same ports, and it also can have serious security implications if your machines are reachable on the public Internet. If you want to give it a try, though, to see what effects it has for your workload, you just have to add two lines to the CockroachDB YAML configuration file and to any client applications that desperately need better performance, changing:

~~~ yaml
    spec:
      affinity:
~~~

To be:

~~~ yaml
    spec:
      hostNetwork: true
      dnsPolicy: ClusterFirstWithHostNet
      affinity:
~~~

`hostNetwork: true` tells Kubernetes to put the pods in the host machine's network namespace, using its IP address, hostname, and entire networking stack. The `dnsPolicy: ClusterFirstWithHostNet` line tells Kubernetes to configure the pods to still be able to use the cluster's DNS infrastructure for service discovery.

This will not work miracles, so use it with caution. In our testing, it pretty reliably gives about a 6% improvement in database throughput when running [our `kv` load generator](https://hub.docker.com/r/cockroachdb/loadgen-kv/) against a 3-node cluster on GKE.

### Running in a DaemonSet

A [DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/) is a Kubernetes resource that runs a pod on all nodes that match some selection criteria. This can be a more natural abstraction for using [dedicated nodes](#dedicated-nodes), and naturally pairs with [using the host's network](#using-the-hosts-network) since it couples CockroachDB processes one-to-one with nodes.

{{site.data.alerts.callout_danger}}
We strongly recommend **against** using DaemonSets due to their weaker fault tolerance and data survivability capabilities, in comparison to StatefulSets. In most Kubernetes environments, nodes are considered ephemeral. However, a DaemonSet pod ties a CockroachDB node to a specific Kubernetes node, and cannot be rescheduled to another Kubernetes node in the event of an automatic upgrade or hardware failure. Unless you have manually set up persistent volumes, DaemonSet deployments will lose all their data when Kubernetes nodes are replaced in a cluster.

This limits Kubernetes's ability to help your cluster recover from failures, and matches the behavior of running CockroachDB directly on a set of physical machines that are only manually replaced by human operators.
{{site.data.alerts.end}}

### Dedicated nodes

If your Kubernetes cluster is made up of heterogeneous hardware, it's likely that you'd like to make sure CockroachDB only runs on certain machines. If you want to get as much performance as possible out of a set of machines, you might also want to make sure that only CockroachDB is run on them.

For more information, see [Pod scheduling](schedule-cockroachdb-kubernetes.html).

## See also

- [Orchestrate CockroachDB with Kubernetes](deploy-cockroachdb-with-kubernetes.html)
- [Production Checklist](recommended-production-settings.html)
- [SQL Performance Best Practices](performance-best-practices-overview.html)
- [Troubleshooting Performance Issues](query-behavior-troubleshooting.html)
