---
title: Operate CockroachDB on Kubernetes
summary: How to operate and manage a secure 3-node CockroachDB cluster with Kubernetes.
toc: true
toc_not_nested: true
secure: true
---

{{site.data.alerts.callout_info}}
This article assumes you have already [deployed CockroachDB securely on a single Kubernetes cluster](deploy-cockroachdb-with-kubernetes.html). However, it's possible to configure these settings before starting CockroachDB on Kubernetes.
{{site.data.alerts.end}}

You can configure, scale, and upgrade a CockroachDB deployment on Kubernetes by updating its StatefulSet values. This page describes how to:

<section class="filter-content" markdown="1" data-scope="operator">
- [Allocate CPU and memory resources](#allocate-resources)
- [Use a custom CA](#use-a-custom-ca)
- [Provision and expand volumes](#provision-volumes)
- [Scale the cluster](#scale-the-cluster)
- [Configure ports](#configure-ports)
- [Perform rolling upgrades](#upgrade-the-cluster)
</section>

<section class="filter-content" markdown="1" data-scope="manual">
- [Allocate CPU and memory resources](#allocate-resources)
- [Provision and expand volumes](#provision-volumes)
- [Scale the cluster](#scale-the-cluster)
- [Perform rolling upgrades](#upgrade-the-cluster)
</section>

<section class="filter-content" markdown="1" data-scope="helm">
- [Allocate CPU and memory resources](#allocate-resources)
- [Provision and expand volumes](#provision-volumes)
- [Scale the cluster](#scale-the-cluster)
- [Perform rolling upgrades](#upgrade-the-cluster)
</section>

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="operator">Operator</button>
    <button class="filter-button" data-scope="manual">Manual Configs</button>
    <button class="filter-button" data-scope="helm">Helm</button>
</div>

<section class="filter-content" markdown="1" data-scope="operator">
{{site.data.alerts.callout_info}}
The Operator is currently in **beta** and is not yet production-ready.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
If you [deployed CockroachDB on Red Hat OpenShift](deploy-cockroachdb-with-kubernetes-openshift.html), substitute `kubectl` with `oc` in the following commands.
{{site.data.alerts.end}}
</section>

<section class="filter-content" markdown="1" data-scope="operator">
## Apply settings

Cluster parameters are configured in a `CrdbCluster` custom resource object. This tells the Operator how to configure the Kubernetes cluster. We provide a custom resource template called [`example.yaml`](https://github.com/cockroachdb/cockroach-operator/blob/master/examples/example.yaml):

~~~ yaml
{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach-operator/master/examples/example.yaml|# Generated, do not edit. Please edit this file instead: config/templates/example.yaml.in\n#\n| %}
~~~

It's simplest to download and customize a local copy of the custom resource manifest. After you modify its parameters, run this command to apply the new values to the cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ kubectl apply -f example.yaml
~~~

You will see:

~~~
crdbcluster.crdb.cockroachlabs.com/{cluster-name} configured
~~~

The Operator will trigger a rolling restart of the pods to effect the change, if necessary. You can observe its progress by running `kubectl get pods`.
</section>

<section class="filter-content" markdown="1" data-scope="manual">
## Apply settings

Cluster parameters are configured in the StatefulSet manifest. We provide a [StatefulSet template](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/bring-your-own-certs/cockroachdb-statefulset.yaml) for use in our [deployment tutorial](deploy-cockroachdb-with-kubernetes.html).

It's simplest to download and customize a local copy of the manifest file. After you modify its parameters, run this command to apply the new values to the cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ kubectl apply -f {manifest-filename}.yaml
~~~

You will see:

~~~
crdbcluster.crdb.cockroachlabs.com/{cluster-name} configured
~~~
</section>

## Allocate resources

On a production cluster, the resources you allocate to CockroachDB should be proportionate to your machine types and workload. We recommend that you determine and set these values before deploying the cluster, but you can also update the values on a running cluster.

{{site.data.alerts.callout_success}}
Run `kubectl describe nodes` to see the available resources on the instances that you have provisioned.
{{site.data.alerts.end}}

### Memory and CPU

You can set the CPU and memory resources allocated to the CockroachDB container on each pod. 

{{site.data.alerts.callout_info}}
1 CPU in Kubernetes is equivalent to 1 vCPU or 1 hyperthread. For best practices on provisioning CPU and memory for CockroachDB, see the [Production Checklist](recommended-production-settings.html#hardware).
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="operator">
Specify CPU and memory values in `resources.requests` and `resources.limits` in the custom resource:

~~~ yaml
spec:
  resources:
    requests:
      cpu: "4"
      memory: "16Gi"
    limits:
      cpu: "4"
      memory: "16Gi"
~~~
</section>

<section class="filter-content" markdown="1" data-scope="manual">
Specify CPU and memory values in `resources.requests` and `resources.limits` in the StatefulSet manifest:

~~~ yaml
spec:
  template:
    containers:
    - name: cockroachdb
      resources:
        requests:
          cpu: "4"
          memory: "16Gi"
        limits:
          cpu: "4"
          memory: "16Gi"
~~~
</section>

<section class="filter-content" markdown="1" data-scope="helm">
Specify CPU and memory values in `resources.requests` and `resources.limits` in your [values file](deploy-cockroachdb-with-kubernetes.html?filters=helm#step-2-start-cockroachdb):

~~~ yaml
statefulset:
  resources:
    limits:
      cpu: "4"
      memory: "16Gi"
    requests:
      cpu: "4"
      memory: "16Gi"
~~~
</section>

Then [apply](#apply-settings) the new values to the cluster.

We recommend using identical values for `resources.requests` and `resources.limits`. When setting the new values, note that not all of a pod's resources will be available to the CockroachDB container. This is because a fraction of the CPU and memory is reserved for Kubernetes. For more information on how Kubernetes handles resource requests and limits, see the [Kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/).

{{site.data.alerts.callout_info}}
If no resource limits are specified, the pods will be able to consume the maximum available CPUs and memory. However, to avoid overallocating resources when another memory-intensive workload is on the same instance, always set resource requests and limits explicitly.
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="operator">
### Cache and SQL memory size

Each CockroachDB node reserves a portion of its available memory for its cache and for storing temporary data for SQL queries. For more information on these settings, see the [Production Checklist](recommended-production-settings.html#cache-and-sql-memory-size).

Our Kubernetes manifests dynamically set cache size and SQL memory size each to 1/4 (the recommended fraction) of the available memory, which depends on the memory request and limit you [specified](#memory-and-cpu) for your configuration. If you want to customize these values, set them explicitly.

Specify `cache` and `maxSQLMemory` in the custom resource:

~~~ yaml
spec:
  cache: "4Gi"
  maxSQLMemory: "4Gi"
~~~

Then [apply](#apply-settings) the new values to the cluster.

{{site.data.alerts.callout_info}}
Specifying these values is equivalent to using the `--cache` and `--max-sql-memory` flags with [`cockroach start`](cockroach-start.html#flags).
{{site.data.alerts.end}}
</section>

For more information on resources, see the [Kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/).

## Provision volumes

When you start your cluster, Kubernetes dynamically provisions and mounts a persistent volume into each pod. For more information on persistent volumes, see the [Kubernetes documentation](https://kubernetes.io/docs/concepts/storage/persistent-volumes/).

<section class="filter-content" markdown="1" data-scope="operator">
The storage capacity of each volume is set in `pvc.spec.resources` in the custom resource:

~~~ yaml
spec:
  dataStore:
    pvc:
      spec:
        resources:
          limits:
            storage: "60Gi"
          requests:
            storage: "60Gi"
~~~
</section>

<section class="filter-content" markdown="1" data-scope="manual">
The storage capacity of each volume is initially set in `volumeClaimTemplates.spec.resources` in the StatefulSet manifest:

~~~ yaml
volumeClaimTemplates:
  spec:
    resources:
      requests:
        storage: 100Gi
~~~
</section>

<section class="filter-content" markdown="1" data-scope="helm">
The storage capacity of each volume is initially set in the Helm chart's [`values.yaml`](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/values.yaml):

~~~ yaml
persistentVolume:
  size: 100Gi
~~~
</section>

You should provision an appropriate amount of disk storage for your workload. For recommendations on this, see the [Production Checklist](recommended-production-settings.html#storage).

### Expand disk size

If you discover that you need more capacity, you can expand the persistent volumes on a running cluster. Increasing disk size is often [beneficial for CockroachDB performance](kubernetes-performance.html#disk-size).

<section class="filter-content" markdown="1" data-scope="operator">
Specify a new volume size in `resources.requests` and `resources.limits` in the custom resource:

~~~ yaml
spec:
  dataStore:
    pvc:
      spec:
        resources:
          limits:
            storage: "100Gi"
          requests:
            storage: "100Gi"
~~~

Then [apply](#apply-settings) the new values to the cluster. The Operator updates the StatefulSet and triggers a rolling restart of the pods with the new storage capacity. 

To verify that the storage capacity has been updated, run `kubectl get pvc` to view the persistent volume claims (PVCs). It will take a few minutes before the PVCs are completely updated.
</section>

<section class="filter-content" markdown="1" data-scope="operator">
## Use a custom CA

By default, the Operator will generate and sign 1 client and 1 node certificate to secure the cluster. 

To use your own certificate authority instead, add `clientTLSSecret` and `nodeTLSSecret` to the custom resource. These should specify the names of Kubernetes secrets that contain your generated certificates and keys. For details on creating Kubernetes secrets, see the [Kubernetes documentation](https://kubernetes.io/docs/tasks/configmap-secret/managing-secret-using-kubectl/).

{{site.data.alerts.callout_info}}
Currently, the Operator requires that the client and node secrets each contain the filenames `tls.crt` and `tls.key`. For an example of working with this, see [Authenticating with `cockroach cert`](#example-authenticating-with-cockroach-cert).
{{site.data.alerts.end}}

~~~ yaml
spec:
  nodeTLSSecret: {node secret name}
  clientTLSSecret: {client secret name}
~~~

Then [apply](#apply-settings) the new values to the cluster.

### Example: Authenticating with `cockroach cert`

These steps demonstrate how certificates and keys generated by [`cockroach cert`](https://www.cockroachlabs.com/docs/v21.1/cockroach-cert) can be used by the Operator.

1. Create two directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs my-safe-directory
    ~~~

    Directory | Description
    ----------|------------
    `certs` | You'll generate your CA certificate and all node and client certificates and keys in this directory.
    `my-safe-directory` | You'll generate your CA key in this directory and then reference the key when generating node and client certificates.

1. Create the CA certificate and key pair:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Create a client certificate and key pair for the root user:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    root \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Upload the client certificate and key to the Kubernetes cluster as a secret, renaming them to the filenames required by the Operator:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.client.root \
    --from-file=tls.key=certs/client.root.key \
    --from-file=tls.crt=certs/client.root.crt \
    --from-file=ca.crt=certs/ca.crt
    ~~~

    ~~~
    secret/cockroachdb.client.root created
    ~~~

1. Create the certificate and key pair for your CockroachDB nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach cert create-node \
    localhost 127.0.0.1 \
    cockroachdb-public \
    cockroachdb-public.default \
    cockroachdb-public.default.svc.cluster.local \
    *.cockroachdb \
    *.cockroachdb.default \
    *.cockroachdb.default.svc.cluster.local \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Upload the node certificate and key to the Kubernetes cluster as a secret, renaming them to the filenames required by the Operator:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.node \
    --from-file=tls.key=certs/node.key \
    --from-file=tls.crt=certs/node.crt \
    --from-file=ca.crt=certs/ca.crt
    ~~~

    ~~~
    secret/cockroachdb.node created
    ~~~

1. Check that the secrets were created on the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get secrets
    ~~~

    ~~~
    NAME                      TYPE                                  DATA   AGE
    cockroachdb.client.root   Opaque                                3      13s
    cockroachdb.node          Opaque                                3      3s
    default-token-6js7b       kubernetes.io/service-account-token   3      9h
    ~~~

1. Add `nodeTLSSecret` and `clientTLSSecret` to the custom resource, specifying the generated secret names:

    ~~~ yaml
    spec:
      clientTLSSecret: cockroachdb.client.root
      nodeTLSSecret: cockroachdb.node
    ~~~

    Then [apply](#apply-settings) the new values to the cluster.
</section>

<section class="filter-content" markdown="1" data-scope="manual">
{% include {{ page.version.version }}/orchestration/kubernetes-expand-disk-manual.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
{% include {{ page.version.version }}/orchestration/kubernetes-expand-disk-helm.md %}
</section>

<section class="filter-content" markdown="1" data-scope="operator">
## Configure ports

The Operator separates traffic into three ports:

| Protocol | Default | Description                                                         | Custom Resource Field |
|----------|---------|---------------------------------------------------------------------|-----------------------|
| gRPC     | 26258   | Used for node connections                                           | `grpcPort`            |
| HTTP     | 8080    | Used to [access the DB Console](ui-overview.html#db-console-access) | `httpPort`            |
| SQL      | 26257   | Used for SQL shell access                                           | `sqlPort`             |

Specify alternate port numbers in the custom resource (for example, to match the default port `5432` on PostgreSQL):

~~~ yaml
spec:
  sqlPort: 5432
~~~

Then [apply](#apply-settings) the new values to the cluster. The Operator updates the StatefulSet and triggers a rolling restart of the pods with the new port settings. 

{{site.data.alerts.callout_danger}}
Currently, only the pods are updated with new ports. To connect to the cluster, you need to ensure that the `public` service is also updated to use the new port. You can do this by deleting the service with `kubectl delete service {cluster-name}-public`. When service is recreated by the Operator, it will use the new port. This is a known limitation that will be fixed in an Operator update.
{{site.data.alerts.end}}
</section>

## Scale the cluster

### Add nodes

<section class="filter-content" markdown="1" data-scope="operator">
1. Before scaling CockroachDB, ensure that your Kubernetes cluster has enough worker nodes to host the number of pods you want to add. This is to ensure that two pods are not placed on the same worker node, as recommended in our [production guidance](recommended-production-settings.html#topology).

    If you want to scale from 3 CockroachDB nodes to 4, your Kubernetes cluster should therefore have at least 4 worker nodes. You can verify the size of your Kubernetes cluster by running `kubectl get nodes`. If you need to add worker nodes on GKE, for example, run this command and specify the desired number of nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    gcloud container clusters resize {cluster-name} --region {region-name} --num-nodes 4
    ~~~

  1. If you are adding nodes after previously [scaling down](#remove-nodes), and have not enabled [automatic PVC pruning](#automatic-pvc-pruning), you must first manually delete any persistent volumes that were orphaned by node removal.

        {{site.data.alerts.callout_info}}
        Due to a [known issue](https://github.com/cockroachdb/cockroach-operator/issues/542), automatic pruning of PVCs is currently disabled by default. This means that after decommissioning and removing a node, the Operator will not remove the persistent volume that was mounted to its pod. 
        {{site.data.alerts.end}}

        View the PVCs on the cluster:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        kubectl get pvc
        ~~~

        ~~~
        NAME                    STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
        datadir-cockroachdb-0   Bound    pvc-f1ce6ed2-ceda-40d2-8149-9e5b59faa9df   60Gi       RWO            standard       24m
        datadir-cockroachdb-1   Bound    pvc-308da33c-ec77-46c7-bcdf-c6e610ad4fea   60Gi       RWO            standard       24m
        datadir-cockroachdb-2   Bound    pvc-6816123f-29a9-4b86-a4e2-b67f7bb1a52c   60Gi       RWO            standard       24m
        datadir-cockroachdb-3   Bound    pvc-63ce836a-1258-4c58-8b37-d966ed12d50a   60Gi       RWO            standard       33s
        ~~~

  1. The PVC names correspond to the pods they are bound to. For example, if the pod `cockroachdb-3` had been removed by [scaling the cluster down](#remove-nodes) from 4 to 3 nodes, `datadir-cockroachdb-3` would be the PVC for the orphaned persistent volume. To verify that the PVC is not currently bound to a pod:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        kubectl describe pvc datadir-cockroachdb-3
        ~~~

        The output will have the following line:

        ~~~
        Mounted By:    <none>
        ~~~

        A PVC that is bound to a pod, in contrast, will specify the pod name.

  1. Remove the orphaned persistent volume by deleting the PVC:

        {{site.data.alerts.callout_danger}}
        Before deleting any persistent volumes, be sure you have a backup copy of your data. Data **cannot** be recovered once the persistent volumes are deleted. For more information, see the [Kubernetes documentation](https://kubernetes.io/docs/tasks/run-application/delete-stateful-set/#persistent-volumes).
        {{site.data.alerts.end}}

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        kubectl delete pvc datadir-cockroachdb-3
        ~~~

        ~~~
        persistentvolumeclaim "datadir-cockroachdb-3" deleted
        ~~~

1. Update `nodes` in the custom resource with the target size of the CockroachDB cluster. This value refers to the number of CockroachDB nodes, each running in one Kubernetes pod:

    ~~~
    nodes: 4
    ~~~

    {{site.data.alerts.callout_info}}
    Note that you must scale by updating the `nodes` value in the custom resource. Using `kubectl scale statefulset <cluster-name> --replicas=4` will result in new pods immediately being terminated.
    {{site.data.alerts.end}}

1. [Apply](#apply-settings) the new value.

1. Verify that the new pods were successfully started:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get pods
    ~~~

    ~~~
    NAME                                  READY   STATUS    RESTARTS   AGE
    cockroach-operator-655fbf7847-zn9v8   1/1     Running   0          30m
    cockroachdb-0                         1/1     Running   0          24m
    cockroachdb-1                         1/1     Running   0          24m
    cockroachdb-2                         1/1     Running   0          24m
    cockroachdb-3                         1/1     Running   0          30s
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="manual">
{% include {{ page.version.version }}/orchestration/kubernetes-scale-cluster-manual.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
{% include {{ page.version.version }}/orchestration/kubernetes-scale-cluster-helm.md %}
</section>

### Remove nodes

{{site.data.alerts.callout_danger}}
Do **not** scale down to fewer than 3 nodes. This is considered an anti-pattern on CockroachDB and will cause errors.
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="operator">
{{site.data.alerts.callout_danger}}
Due to a [known issue](https://github.com/cockroachdb/cockroach-operator/issues/542), automatic pruning of PVCs is currently disabled by default. This means that after decommissioning and removing a node, the Operator will not remove the persistent volume that was mounted to its pod. 

If you plan to eventually [scale up](#add-nodes) the cluster after scaling down, you will need to manually delete any PVCs that were orphaned by node removal before scaling up. For more information, see [Add nodes](#add-nodes).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
If you want to enable the Operator to automatically prune PVCs when scaling down, see [Automatic PVC pruning](#automatic-pvc-pruning). However, note that this workflow is currently unsupported.
{{site.data.alerts.end}}

1. Update `nodes` in the custom resource with the target size of the CockroachDB cluster. For instance, to scale from 4 down to 3 nodes:

    ~~~
    nodes: 3
    ~~~

    {{site.data.alerts.callout_info}}
    Before removing a node, the Operator first decommissions the node. This lets a node finish in-flight requests, rejects any new requests, and transfers all range replicas and range leases off the node.
    {{site.data.alerts.end}}

1. [Apply](#apply-settings) the new value.

    The Operator will remove the node with the highest number in its address (in this case, the address including `cockroachdb-3`) from the cluster. 
    
1. Verify that the pod was successfully removed:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get pods
    ~~~

    ~~~
    NAME                                  READY   STATUS    RESTARTS   AGE
    cockroach-operator-655fbf7847-zn9v8   1/1     Running   0          32m
    cockroachdb-0                         1/1     Running   0          26m
    cockroachdb-1                         1/1     Running   0          26m
    cockroachdb-2                         1/1     Running   0          26m
    ~~~

#### Automatic PVC pruning

To enable the Operator to automatically remove persistent volumes when [scaling down](#remove-nodes) a cluster, turn on automatic PVC pruning through a feature gate.

{{site.data.alerts.callout_danger}}
This workflow is unsupported and should be enabled at your own risk.
{{site.data.alerts.end}}

1. Download the Operator manifest:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl -0 https://raw.githubusercontent.com/cockroachdb/cockroach-operator/master/manifests/operator.yaml
    ~~~

1. Uncomment the following lines in the Operator manifest:

    ~~~ yaml
    - feature-gates
    - AutoPrunePVC=true
    ~~~

1. Reapply the Operator manifest:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply -f operator.yaml
    ~

1. Validate that the Operator is running:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                                  READY   STATUS    RESTARTS   AGE
    cockroach-operator-6f7b86ffc4-9ppkv   1/1     Running   0          22s
    ...
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="manual">
{% include {{ page.version.version }}/orchestration/kubernetes-remove-nodes-manual.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
{% include {{ page.version.version }}/orchestration/kubernetes-remove-nodes-helm.md %}
</section>

## Upgrade the cluster

We strongly recommend that you regularly upgrade your CockroachDB version in order to pick up bug fixes, performance improvements, and new features.  

The upgrade process on Kubernetes is a [staged update](https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/#staging-an-update) in which the Docker image is applied to the pods one at a time, with each pod being stopped and restarted in turn. This is to ensure that the cluster remains available during the upgrade.

<section class="filter-content" markdown="1" data-scope="operator">
1. Verify that you can upgrade.

    To upgrade to a new major version, you must first be on a production release of the previous version. The release does not need to be the latest production release of the previous version, but it must be a production release and not a testing release (alpha/beta).

    Therefore, in order to upgrade to v21.1, you must be on a production release of v20.2.

    1. If you are upgrading to v21.1 from a production release earlier than v20.2, or from a testing release (alpha/beta), first [upgrade to a production release of v20.2](../v20.2/orchestrate-cockroachdb-with-kubernetes.html#upgrade-the-cluster). Be sure to complete all the steps.

    1. Then return to this page and perform a second upgrade to v21.1.

    1. If you are upgrading from a production release of v20.2, or from any earlier v21.1 patch release, you do not have to go through intermediate releases; continue to step 2.

1. Verify the overall health of your cluster using the [DB Console](ui-overview.html). On the **Overview**:
    - Under **Node Status**, make sure all nodes that should be live are listed as such. If any nodes are unexpectedly listed as suspect or dead, identify why the nodes are offline and either restart them or [decommission](#remove-nodes) them before beginning your upgrade. If there are dead and non-decommissioned nodes in your cluster, it will not be possible to finalize the upgrade (either automatically or manually).
    - Under **Replication Status**, make sure there are 0 under-replicated and unavailable ranges. Otherwise, performing a rolling upgrade increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability. Therefore, it's important to [identify and resolve the cause of range under-replication and/or unavailability](cluster-setup-troubleshooting.html#replication-issues) before beginning your upgrade.
    - In the **Node List**:
        - Make sure all nodes are on the same version. If not all nodes are on the same version, upgrade them to the cluster's highest current version first, and then start this process over.
        - Make sure capacity and memory usage are reasonable for each node. Nodes must be able to tolerate some increase in case the new version uses more resources for your workload. Also go to **Metrics > Dashboard: Hardware** and make sure CPU percent is reasonable across the cluster. If there's not enough headroom on any of these metrics, consider [adding nodes](#add-nodes) to your cluster before beginning your upgrade.

1. Review the [backward-incompatible changes in v21.1](../releases/v21.1.0.html#backward-incompatible-changes) and [deprecated features](../releases/v21.1.0.html#deprecations). If any affect your deployment, make the necessary changes before starting the rolling upgrade to v21.1.

1. Change the desired Docker image in the custom resource:

    ~~~
    image:
      name: cockroachdb/cockroach:{{page.release_info.version}}
    ~~~

1. [Apply](#apply-settings) the new value. The Operator will perform the staged update.

    {{site.data.alerts.callout_info}}
    The Operator automatically sets the `cluster.preserve_downgrade_option` [cluster setting](cluster-settings.html) to the version you are upgrading from. This disables auto-finalization of the upgrade so that you can monitor the stability and performance of the upgraded cluster before manually finalizing the upgrade. This will enable certain [features and performance improvements introduced in v21.1](upgrade-cockroach-version.html#features-that-require-upgrade-finalization).

    Note that after finalization, it will no longer be possible to perform a downgrade to v20.2. In the event of a catastrophic failure or corruption, the only option will be to start a new cluster using the old binary and then restore from a [backup](take-full-and-incremental-backups.html) created prior to performing the upgrade.

    Finalization only applies when performing a major version upgrade (for example, from v20.2.x to v21.1). Patch version upgrades (for example, within the v21.1.x series) can always be downgraded.
    {{site.data.alerts.end}}

1. To check the status of the rolling upgrade, run `kubectl get pods`. The pods are restarted one at a time with the new image.

1. Verify that all pods have been upgraded by running:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods \
    -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}'
    ~~~

    You can also check the CockroachDB version of each node in the [DB Console](ui-cluster-overview-page.html#node-details).

1. Monitor the stability and performance of your cluster until you are comfortable with the upgrade (generally at least a day). 

    If you decide to roll back the upgrade, revert the image name in the custom resource and apply the new value.

    {{site.data.alerts.callout_info}}
    This is only possible when performing a major version upgrade (for example, from v20.2.x to v21.1). Patch version upgrades (for example, within the v21.1.x series) are auto-finalized.
    {{site.data.alerts.end}}

    To finalize the upgrade, re-enable auto-finalization:

    1. Start the CockroachDB [built-in SQL client](cockroach-sql.html). For example, if you followed the steps in [Deploy CockroachDB with Kubernetes](deploy-cockroachdb-with-kubernetes.html#step-3-use-the-built-in-sql-client) to launch a secure client pod, get a shell into the `cockroachdb-client-secure` pod:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-client-secure \-- ./cockroach sql \
        --certs-dir=/cockroach/cockroach-certs \
        --host={cluster-name}-public
        ~~~

    1. Re-enable auto-finalization:

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        > RESET CLUSTER SETTING cluster.preserve_downgrade_option;
        ~~~

    1. Exit the SQL shell and pod:

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        > \q
        ~~~

</section>

<section class="filter-content" markdown="1" data-scope="manual">
{% include {{ page.version.version }}/orchestration/kubernetes-upgrade-cluster-manual.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
{% include {{ page.version.version }}/orchestration/kubernetes-upgrade-cluster-helm.md %}
</section>

## See also

- [Kubernetes Multi-Cluster Deployment](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html)
- [Kubernetes Performance Guide](kubernetes-performance.html)
{% include {{ page.version.version }}/prod-deployment/prod-see-also.md %}
