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
{{site.data.alerts.callout_success}}
If you [deployed CockroachDB on Red Hat OpenShift](deploy-cockroachdb-with-kubernetes-openshift.html), substitute `kubectl` with `oc` in the following commands.
{{site.data.alerts.end}}
</section>

<section class="filter-content" markdown="1" data-scope="operator">
## Apply settings

Cluster parameters are configured in a `CrdbCluster` custom resource object. This tells the Operator how to configure the Kubernetes cluster. We provide a custom resource template called [`example.yaml`](https://github.com/cockroachdb/cockroach-operator/blob/master/examples/example.yaml):

~~~ yaml
{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach-operator/master/examples/example.yaml|# limitations under the License.\n| %}
~~~

It's easiest to keep a local copy of the custom resource manifest. After you modify its parameters, run this command to apply the new values to the cluster:

{% include copy-clipboard.html %}
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

It's easiest to keep a local copy of the manifest file. After you modify its parameters, run this command to apply the new values to the cluster:

{% include copy-clipboard.html %}
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

Then [apply](#apply-settings) the new values.

We recommend using identical values for `resources.requests` and `resources.limits`. When setting the new values, note that not all of a pod's resources will be available to the CockroachDB container. This is because a fraction of the CPU and memory is reserved for Kubernetes. For more information on how Kubernetes handles resource requests and limits, see the [Kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/).

{{site.data.alerts.callout_info}}
If no resource limits are specified, the pods will be able to consume the maximum available CPUs and memory. However, to avoid overallocating resources when another memory-intensive workload is on the same instance, always set resource requests and limits explicitly.
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="operator">
### Cache and SQL memory size

Each CockroachDB node reserves a portion of its available memory for its cache and for storing temporary data for SQL queries. For more information on these settings, see the [Production Checklist](recommended-production-settings#cache-and-sql-memory-size).

Our Kubernetes manifests dynamically set cache size and SQL memory size each to 1/4 (the recommended fraction) of the available memory, which depends on the memory request and limit you [specified](#memory-and-cpu) for your configuration. If you want to customize these values, set them explicitly.

Specify `cache` and `maxSQLMemory` in the custom resource:

~~~ yaml
spec:
  cache: "4Gi"
  maxSQLMemory: "4Gi"
~~~

Then [apply](#apply-settings) the new values.

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

Then [apply](#apply-settings) the new values. The Operator updates the StatefulSet and triggers a rolling restart of the pods with the new storage capacity. 

To verify that the storage capacity has been updated, run `kubectl get pvc` to view the persistent volume claims (PVCs). It will take a few minutes before the PVCs are completely updated.
</section>

<section class="filter-content" markdown="1" data-scope="operator">
{% comment %}
<!-- ## Use a custom CA

By default, the Operator will generate and sign certificates to secure the cluster. 

If you want to authenticate with certificates that you generated using a custom CA, add `nodeTLSSecret` and `clientTLSSecret` to the custom resource. These specify the names of your generated node and client secrets.

~~~ yaml
spec:
  nodeTLSSecret: {node secret name}
  clientTLSSecret: {client secret name}
~~~

{{site.data.alerts.callout_info}}
You should have also created Kubernetes secrets using these names. For details on this, see the [Kubernetes documentation](https://kubernetes.io/docs/tasks/configmap-secret/managing-secret-using-kubectl/).
{{site.data.alerts.end}}

Then [apply](#apply-settings) the new values. -->
{% endcomment %}

{% comment %}
<!-- ### Example: Authenticating with `cockroach cert`

1. Create two directories:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs my-safe-directory
    ~~~

    Directory | Description
    ----------|------------
    `certs` | You'll generate your CA certificate and all node and client certificates and keys in this directory.
    `my-safe-directory` | You'll generate your CA key in this directory and then reference the key when generating node and client certificates.

1. Create the CA certificate and key pair:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Create a client certificate and key pair for the root user:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    root \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Upload the client certificate and key to the Kubernetes cluster as a secret:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.client.root \
    --from-file=certs/client.root.key \
    --from-file=certs/client.root.crt \
    --from-file=certs/ca.crt
    ~~~

    ~~~
    secret/cockroachdb.client.root created
    ~~~

1. Create the certificate and key pair for your CockroachDB nodes:

    {% include copy-clipboard.html %}
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

1. In the `certs` directory, rename `node.key` to `tls.key`.

    {% include copy-clipboard.html %}
    ~~~ shell
    mv certs/node.key certs/tls.key
    ~~~

    Rename `node.crt` to `tls.crt`.

    {% include copy-clipboard.html %}
    ~~~ shell
    mv certs/node.crt certs/tls.crt
    ~~~

    These filenames are currently required by the Operator.

1. Upload the node certificate and key to the Kubernetes cluster as a secret:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.node \
    --from-file=certs/tls.key \
    --from-file=certs/tls.crt \
    --from-file=certs/ca.crt
    ~~~

    ~~~
    secret/cockroachdb.node created
    ~~~

1. Check that the secrets were created on the cluster:

    {% include copy-clipboard.html %}
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
      nodeTLSSecret: cockroachdb.node
      clientTLSSecret: cockroachdb.client.root
    ~~~

    Then [apply](#apply-settings) the new values.
</section> -->
{% endcomment %}
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

Then [apply](#apply-settings) the new values. The Operator updates the StatefulSet and triggers a rolling restart of the pods with the new port settings. 

{{site.data.alerts.callout_danger}}
Currently, only the pods are updated with new ports. To connect to the cluster, you need to ensure that the `public` service is also updated to use the new port. You can do this by deleting the service with `kubectl delete service {cluster-name}-public`. When service is recreated by the Operator, it will use the new port. This is a known limitation that will be fixed in an Operator update.
{{site.data.alerts.end}}
</section>

## Scale the cluster

### Add nodes

<section class="filter-content" markdown="1" data-scope="operator">
Before scaling CockroachDB, ensure that your Kubernetes cluster has enough worker nodes to host the number of pods you want to add. This is to ensure that two pods are not placed on the same worker node, as recommended in our [production guidance](recommended-production-settings.html#topology).

If you want to scale from 3 CockroachDB nodes to 4, your Kubernetes cluster should therefore have at least 4 worker nodes. You can verify the size of your Kubernetes cluster by running `kubectl get nodes`. If you need to add worker nodes on GKE, for example, run this command and specify the desired number of nodes:

{% include copy-clipboard.html %}
~~~ shell
gcloud container clusters resize {cluster-name} --num-nodes 4
~~~

Update `nodes` in the custom resource with the target size of the CockroachDB cluster. This value refers to the number of CockroachDB nodes, each running in one Kubernetes pod:

~~~
nodes: 4
~~~

Then [apply](#apply-settings) the new value.

{{site.data.alerts.callout_info}}
Note that you must scale by updating the `nodes` value in the custom resource. Using `kubectl scale statefulset <cluster-name> --replicas=4` will result in new pods immediately being terminated.
{{site.data.alerts.end}}

To verify that the new pods were successfully started, run `kubectl get pods`.
</section>

<section class="filter-content" markdown="1" data-scope="manual">
{% include {{ page.version.version }}/orchestration/kubernetes-scale-cluster-manual.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
{% include {{ page.version.version }}/orchestration/kubernetes-scale-cluster-helm.md %}</section>

### Remove nodes

{{site.data.alerts.callout_danger}}
Do **not** scale down to fewer than 3 nodes. This is considered an anti-pattern on CockroachDB and will cause errors.
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="operator">
{{site.data.alerts.callout_info}}
Before removing a node, the Operator first decommissions the node. This lets a node finish in-flight requests, rejects any new requests, and transfers all range replicas and range leases off the node.
{{site.data.alerts.end}}

Update `nodes` in the custom resource with the target size of the CockroachDB cluster. For instance, to scale from 4 down to 3 nodes:

~~~
nodes: 3
~~~

Then [apply](#apply-settings) the new value.

The Operator will remove the node with the highest number in its address (in this case, the address including `cockroachdb-3`) from the cluster. It will also remove the persistent volume that was mounted to the pod.
    
To verify that the pod was successfully removed, run `kubectl get pods`.
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

    To upgrade to a new feature version, you must first be on a [production release](releases/index.html#production-releases) of the previous version. The release does not need to be the latest production release of the previous version, but it must be a production release and not a testing release (alpha/beta).

    Therefore, in order to upgrade to v21.1, you must be on a production release of v20.2.

    1. If you are upgrading to v21.1 from a production release earlier than v20.2, or from a testing release (alpha/beta), first [upgrade to a production release of v20.2](../v20.2/orchestrate-cockroachdb-with-kubernetes.html#upgrade-the-cluster). Be sure to complete all the steps.

    1. Then return to this page and perform a second upgrade to v21.1.

    1. If you are upgrading from a production release of v20.2, or from any earlier v21.1 patch release, you do not have to go through intermediate releases; continue to step 2.

1. Verify the overall health of your cluster using the [DB Console](ui-overview.html). On the **Overview**:
    - Under **Node Status**, make sure all nodes that should be live are listed as such. If any nodes are unexpectedly listed as suspect or dead, identify why the nodes are offline and either restart them or [decommission](#remove-nodes) them before beginning your upgrade. If there are dead and non-decommissioned nodes in your cluster, it will not be possible to finalize the upgrade (either automatically or manually).
    - Under **Replication Status**, make sure there are 0 under-replicated and unavailable ranges. Otherwise, performing a rolling upgrade increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability. Therefore, it's important to identify and resolve the cause of range under-replication and/or unavailability before beginning your upgrade.
    - In the **Node List**:
        - Make sure all nodes are on the same version. If any nodes are behind, upgrade them to the cluster's current version first, and then start this process over.
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

    Finalization only applies when performing a feature version upgrade (for example, from v20.2.x to v21.1). Patch version upgrades (for example, within the v21.1.x series) can always be downgraded.
    {{site.data.alerts.end}}

1. To check the status of the rolling upgrade, run `kubectl get pods`. The pods are restarted one at a time with the new image.

1. Verify that all pods have been upgraded by running:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods \
    -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}'
    ~~~

    You can also check the CockroachDB version of each node in the [DB Console](ui-cluster-overview-page.html#node-details).

1. Monitor the stability and performance of your cluster until you are comfortable with the upgrade (generally at least a day). 

    If you decide to roll back the upgrade, revert the image name in the custom resource and apply the new value.

    {{site.data.alerts.callout_info}}
    This is only possible when performing a feature version upgrade (for example, from v20.2.x to v21.1). Patch version upgrades (for example, within the v21.1.x series) are auto-finalized.
    {{site.data.alerts.end}}

    To finalize the upgrade, re-enable auto-finalization:

    1. Start the CockroachDB [built-in SQL client](cockroach-sql.html). For example, if you followed the steps in [Deploy CockroachDB with Kubernetes](deploy-cockroachdb-with-kubernetes.html#step-3-use-the-built-in-sql-client) to launch a secure client pod, get a shell into the `cockroachdb-client-secure` pod:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-client-secure \-- ./cockroach sql \
        --certs-dir=/cockroach/cockroach-certs \
        --host={cluster-name}-public
        ~~~

    1. Re-enable auto-finalization:

        {% include copy-clipboard.html %}
        ~~~ sql
        > RESET CLUSTER SETTING cluster.preserve_downgrade_option;
        ~~~

    1. Exit the SQL shell and pod:

        {% include copy-clipboard.html %}
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
