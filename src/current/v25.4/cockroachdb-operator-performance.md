---
title: Performance with the CockroachDB Operator
summary: How running CockroachDB in Kubernetes affects its performance and how to get the best possible performance when using the CockroachDB operator.
toc: true
docs_area: deploy
---

Kubernetes provides many useful abstractions for deploying and operating distributed systems, but some of the abstractions come with a performance overhead and an increase in underlying system complexity. This page outlines potential bottlenecks when running CockroachDB in Kubernetes and how to optimize performance.

{{site.data.alerts.callout_info}}
The {{ site.data.products.cockroachdb-operator }} is in [Preview]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}).
{{site.data.alerts.end}}

## Before you begin

Before you focus on optimizing a Kubernetes-orchestrated CockroachDB cluster:

1. Before deploying on Kubernetes, ensure that performance is optimized for your workload on identical hardware. You may find that you first need to [modify your workload]({% link {{ page.version.version }}/performance-best-practices-overview.md %}) or use [different machine specs]({% link {{ page.version.version }}/recommended-production-settings.md %}#hardware) to achieve the performance you need.

1. Read the documentation for [deploying CockroachDB on a Kubernetes cluster]({% link {{ page.version.version }}/deploy-cockroachdb-with-cockroachdb-operator.md %}#initialize-the-cluster) to familiarize yourself with the necessary Kubernetes terminology and deployment abstractions.

## Performance factors

A number of independent factors affect performance when running CockroachDB on Kubernetes. Most are easiest to change before you create your CockroachDB cluster. If you need to modify a CockroachDB cluster that is already running on Kubernetes, extra care and testing is strongly recommended.

The following sections show how to modify excerpts from the Cockroach Labs-provided Kubernetes configuration YAML files. You can find the most up-to-date version of this file [on GitHub](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb-parent/charts/cockroachdb/values.yaml).

### Version of CockroachDB

Because CockroachDB is under very active development, there are typically substantial performance gains in each release. If you are not experiencing optimal performance and aren't running the latest release, consider upgrading.

### Client workload

Your workload is the single most important factor in database performance. Read through [SQL performance best practices]({% link {{ page.version.version }}/performance-best-practices-overview.md %}) and determine whether you can make workload changes to speed up your application.

### Machine size

The size of the machines you're using is not a Kubernetes-specific concern, but is a good place to start if you want more performance. Using machines with more CPU will almost always allow for greater throughput. Because Kubernetes runs a set of processes on every machine in a cluster, it is typically more efficient to use fewer large machines than more small machines. For specific suggestions, refer to [Hardware]({% link {{ page.version.version }}/recommended-production-settings.md %}#hardware). 

### Disk type

CockroachDB makes heavy use of the disks you provide it, so using faster disks is an easy way to improve your cluster's performance. For the best performance, [SSDs are strongly recommended]({% link {{ page.version.version }}/recommended-production-settings.md %}#hardware).

The Cockroach Labs-provided configuration does not specify disk type, so in most environments Kubernetes will auto-provision disks of the default type. In the common cloud environments (AWS, GCP, Azure) this means you'll get slow disks that aren't optimized for database workloads (e.g., HDDs on GCE, SSDs without provisioned IOPS on AWS).

#### Create a different disk type

Kubernetes exposes the disk types used by its volume provisioner via its [`StorageClass` API object](https://kubernetes.io/docs/concepts/storage/storage-classes/). Each cloud environment has a default `StorageClass`, but you can easily change the default or create a new named class that you can specify later. 

To do this, pick a volume provisioner from the list in the [Kubernetes documentation](https://kubernetes.io/docs/concepts/storage/storage-classes/), modify the example YAML file to specify the disk type you want, then run `kubectl create -f {your-storage-class-file}.yaml`. For example, in order to use the `pd-ssd` disk type on Google Compute Engine or Google Kubernetes Engine, you can use a `StorageClass` file like the following:

~~~ yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: {your-ssd-class-name}
provisioner: kubernetes.io/gce-pd
parameters:
  type: pd-ssd
~~~

You may also want to set additional parameters as documented in the list of Kubernetes [Kubernetes documentation](https://kubernetes.io/docs/concepts/storage/storage-classes/), such as configuring the `iopsPerGB` if you're creating a `StorageClass` for AWS's `io1` Provisioned IOPS volume type.

You can configure this new disk type to only be used by CockroachDB nodes or as the default for all volumes in your cluster:

#### Configure the disk type used by CockroachDB

To use a new `StorageClass` without making it the default in your cluster, modify your application's YAML file to ask for it. In the CockroachDB configuration, that means adding `storageClassName` to `cockroachdb.crdbCluster.dataStore.volumeClaimTemplates`:

~~~ yaml
cockroachdb:
  crdbCluster:
    dataStore:
      volumeClaimTemplate:
        storageClassName: <your-ssd-class-name>
~~~

When running `kubectl create -f` on your modified YAML file, Kubernetes should create volumes using the specified `storageClassName`.

#### Change the default disk type

To make a new `StorageClass` the default for all volumes in your cluster, run the following `kubectl` commands.

{% include_cached copy-clipboard.html %}
~~~ shell
kubectl get storageclasses
~~~
~~~ shell
NAME                 PROVISIONER
ssd                  kubernetes.io/gce-pd
standard (default)   kubernetes.io/gce-pd
~~~
{% include_cached copy-clipboard.html %}
~~~ shell
kubectl patch storageclass standard -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'
~~~
~~~ shell
storageclass "standard" patched
~~~
{% include_cached copy-clipboard.html %}
~~~ shell
kubectl patch storageclass ssd -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
~~~
~~~ shell
storageclass "ssd" patched
~~~

### Disk size

On some cloud providers, including all GCP disks and the AWS `io1` disk type, the number of IOPS available to a disk is directly correlated to the size of the disk. In such cases, increasing the size of your disks can significantly improve CockroachDB performance, and decrease the risk of filling them up. Before you create your CockroachDB cluster, modify the `cockroachdb.crdbCluster.dataStore.volumeClaimTemplate` in the CockroachDB YAML file to ask for more space. The following example sets this value to 1TB:

~~~ yaml
cockroachdb:
  crdbCluster:
    dataStore:
      volumeClaimTemplate:
        spec:
          resources:
            requests:
              storage: 1024Gi
~~~

Since [GCE disk IOPS scale linearly with disk size](https://cloud.google.com/compute/docs/disks/performance#type_comparison), a 1TiB disk gives 1024 times as many IOPS as a 1GiB disk, which can make a very large difference for write-heavy workloads.

### Local disks

The examples thus far assume the use of auto-provisioned, remotely attached disks. However, local disks typically provide better performance than remotely attached disks. For example, SSD Instance Store Volumes outperform EBS Volumes on AWS, and Local SSDs outperform Persistent Disks on GCE. As of v1.14, Kubernetes supports [local volumes](https://kubernetes.io/docs/concepts/storage/volumes/#local).

When using local disks, consider using [replication controls]({% link {{ page.version.version }}/configure-replication-zones.md %}) to increase the replication factor of your data from 3 (default) to 5. This is because local disks have a greater chance of experiencing a disk failure than a cloud provider's network-attached disks, which are often replicated underneath the covers.

### Resource requests and limits

When you ask Kubernetes to run a pod, you can tell it to reserve certain amounts of CPU or memory for each container in the pod, or to limit the CPU or memory of each container. Setting resource [requests](#resource-requests) or [limits](#resource-limits) can have different implications, depending on your Kubernetes cluster's resource utilization. For the authoritative information on this topic, refer to the [Kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/).

#### Resource requests

Resource requests reserve a certain amount of CPU or memory for your container. If you add resource requests to your CockroachDB YAML file, Kubernetes will schedule each CockroachDB pod onto a node with sufficient unreserved resources and ensure the pods are guaranteed the reserved resources using the applicable Linux container primitives. If you are running other workloads in your Kubernetes cluster, setting resource requests is strongly recommended to ensure good performance. If you do not set resource requests, CockroachDB could be starved of CPU cycles or [OOM-stopped]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#out-of-memory-oom-crash) before less important processes.

To determine how many resources are usable on your Kubernetes nodes, you can run:

{% include_cached copy-clipboard.html %}
~~~ shell
kubectl describe nodes
~~~
~~~ shell
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

In the output, the `Allocatable` field shows the `cpu` and `memory` resources Kubernetes will provide to pods running on the machine. The difference between the machine's `Capacity` and its `Allocatable` resources is taken up by the operating system and Kubernetes' management processes. In the preceding output, `3920m` stands for 3920 "milli-CPUs", or "thousandths of a CPU".

Kubernetes runs additional pods in the `kube-system` namespace that are part of the cluster infrastructure. If you want to run CockroachDB on every node in your cluster, you must leave room for these processes, which are essential for the Kubernetes cluster's health. If you are only running CockroachDB on a subset of the Kubernetes machines, you can take up all the `Allocatable` space other than what is used by the `kube-system` pods that are on all the Kubernetes machines, such as `kube-proxy` or the `fluentd` logging agent.

On Kubernetes v1.10 or earlier, it is difficult to truly use all of the allocatable space, because you'd have to manually preempt the `kube-system` pods on each machine (by deleting them). When the Kubernetes [Pod Priority](https://kubernetes.io/docs/concepts/configuration/pod-priority-preemption/) feature is promoted from alpha to beta and becomes more widely available, you could set the CockroachDB pods to a higher priority, causing the Kubernetes scheduler to preempt and reschedule the `kube-system` pods onto other machines.

Once you've picked out an amount of CPU and memory to reserve for Cockroach, configure the resource requests in your CockroachDB YAML file. They should go underneath the `containers` heading. For example, to use most of the available resources on the machines described above, you'd configure the following lines of your values file:

~~~ yaml
cockroachdb:
  crdbCluster:
    podTemplate:
      spec:
        resources:
          requests:
            cpu: 3500m
            memory: 12300Mi
~~~

When you initialize the cluster, check that all the CockroachDB pods are scheduled successfully. If you see any get stuck in the pending state, run `kubectl describe pod {podname}` and check the `Events` for information about why they're still pending. You may need to manually preempt pods on one or more nodes by running `kubectl delete pod` on them to make room for the CockroachDB pods. As long as the pods you delete were created by a higher-level Kubernetes object such as a `Deployment`, they'll be safely recreated on another node.

#### Resource limits

Resource limits cap the resources used by a pod to no more than the provided limit. This makes for more predictable performance because your pods will not be allowed to use any excess capacity on their machines. Pods will not have more resources available to them at some times (e.g., lulls in traffic) than others (e.g., busy periods where the other pods on a machine are also fully utilizing their reserved resources). Resource limits also increase the ["Quality of Service" guaranteed by the Kubernetes runtime](https://github.com/kubernetes/community/blob/master/contributors/design-proposals/node/resource-qos.md) on Kubernetes v1.8 and earlier, making the pods less likely to be preempted when a machine is oversubscribed. Finally, memory limits in particular define the amount of memory the container perceives as available, which is useful when specifying percentage-based values for the CockroachDB `--cache` and `--max-sql-memory` flags, as in our default configuration file.

To set resource limits, in addition to the [resource requests](#resource-requests) described in the preceding section, change the configuration as follows:

~~~ yaml
cockroachdb:
  crdbCluster:
    podTemplate:
      spec:
        resources:
          requests:
            cpu: 3500m
            memory: 12300Mi
          limits:
            memory: 12300Mi
~~~

Pods will be limited to their reserved resources and are unlikely to be preempted, except in rare cases. This will not improve performance on an underutilized Kubernetes cluster, but provides more predictable performance as other workloads run.

{{site.data.alerts.callout_danger}}
While setting memory limits is strongly recommended, [setting CPU limits can hurt tail latencies as currently implemented by Kubernetes](https://github.com/kubernetes/kubernetes/issues/51135). Cockroach Labs recommends not setting CPU limits at all, unless you have explicitly enabled the non-default [Static CPU Management Policy](https://kubernetes.io/docs/tasks/administer-cluster/cpu-management-policies/#static-policy) when setting up your Kubernetes cluster. In this case, set CPU limits as integers and match memory limits exactly to their corresponding requests.
{{site.data.alerts.end}}

#### Default resource requests and limits

Even if you do not manually set resource requests, they are likely being applied. In many installations of Kubernetes, a [LimitRange](https://kubernetes.io/docs/tasks/administer-cluster/cpu-default-namespace/) is preconfigured for the `default` namespace that applies a default CPU request of `100m`, or one-tenth of a CPU. You can see this configuration by running the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
kubectl describe limitranges
~~~

Experimentally, this does not appear to have a noticeable effect on CockroachDB's performance when a Kubernetes cluster isn't heavily utilized, but do not be surprised if you see CPU requests on your pods that you didn't set.

### Other pods on the same machines as CockroachDB

As described in [Resource requests and limits](#resource-requests-and-limits), your Kubernetes cluster will always run pods other than CockroachDB. You can see them by running:

{% include_cached copy-clipboard.html %}
~~~ shell
kubectl get pods --all-namespaces
~~~
~~~ shell
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

These ["cluster add-ons"](https://github.com/kubernetes/kubernetes/tree/master/cluster/addons) provide a variety of basic services like managing DNS entries for services within the cluster, powering the Kubernetes dashboard UI, or collecting logs or metrics from all the pods running in the cluster. If you do not like having them take up space in your cluster, you can prevent some of them from running by configuring your Kubernetes cluster appropriately. For example, on GKE, you can create a cluster with the minimal set of add-ons by running:

{% include_cached copy-clipboard.html %}
~~~ shell
gcloud container clusters create <your-cluster-name> --no-enable-cloud-logging --no-enable-cloud-monitoring --addons=""
~~~

However, some pods like `kube-proxy` and `kube-dns` are required for compliant Kubernetes clusters. Since there will always be pods other than CockroachDB running in your cluster, it's important to understand and account for the effects of having CockroachDB share a machine with other processes. The more processes there are on the same machine as a CockroachDB pod, the slower and less predictable its performance will likely be. To protect against this, it's strongly recommended to specify [resource requests](#resource-requests) on your CockroachDB pods to provide some level of CPU and memory isolation.

Even with resource requests, there can still be contention for shared resources like network I/O or, in [exceptional](https://sysdig.com/blog/container-isolation-gone-wrong/) cases, internal kernel data structures. For these reasons and because of the Kubernetes infrastructure processes running on each machine, CockroachDB running on Kubernetes cannot match the performance of running CockroachDB directly on dedicated machines, although it can get quite close with careful configuration.

If setting appropriate resource requests still isn't getting you the performance you expect, consider using [dedicated nodes](#dedicated-nodes).

#### Client applications on the same machines as CockroachDB

Client applications such as benchmarking applications running on the same machines as CockroachDB are likely to compete for resources. As application load increases, so does the load on CockroachDB processes. The best way to avoid this is to [set resource requests and limits](#resource-requests-and-limits). Alternatively, you can also set [anti-affinity scheduling policies](https://kubernetes.io/docs/concepts/configuration/assign-pod-node/#affinity-and-anti-affinity) on your client applications:

~~~ yaml
cockroachdb:
  crdbCluster:
    podTemplate:
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
~~~

The preceding configuration will first prefer to put the `loadgen` pods on different nodes from each other, which is important for the fault tolerance of the `loadgen` pods themselves. As a secondary priority, it will attempt to put the pods on nodes that do not already have a running `CockroachDB` pod. This will ensure the best possible balance of fault tolerance and performance for the load generator and CockroachDB cluster.

### Networking

[Kubernetes places significant demands on the underlying network](https://kubernetes.io/docs/concepts/cluster-administration/networking/) in order to provide each pod a routable IP address and isolated Linux network namespace, among other requirements. While the impact is heavily dependent on your Kubernetes cluster's network setup, Docker and Kubernetes' networking abstractions often introduce a performance penalty for high-throughput distributed applications such as CockroachDB.

Experimenting with networking can be a way to eke more performance out of your cluster. You can either replace your cluster's networking solution with a more performant one, or bypass most of the networking overhead by using the host machines' networks directly.

#### Networking solutions

If you aren't using a hosted Kubernetes service, you'll need to choose a [networking solution](https://kubernetes.io/docs/concepts/cluster-administration/networking/#how-to-achieve-this) when creating a Kubernetes cluster. While Cockroach Labs does not endorse any specific networking solutions, note that your choice can meaningfully impact CockroachDB's performance compared to running it outside of Kubernetes.

### Dedicated nodes

If your Kubernetes cluster uses heterogeneous hardware, you will likely want to ensure that CockroachDB only runs on specific machines. To optimize performance, it can be beneficial to dedicate those machines exclusively to CockroachDB.

For more information, refer to [Pod scheduling]({% link {{ page.version.version }}/schedule-cockroachdb-operator.md %}).
