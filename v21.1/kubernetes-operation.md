---
title: Operate CockroachDB on Kubernetes
summary: How to operate and manage a secure 3-node CockroachDB cluster with Kubernetes.
toc: true
toc_not_nested: true
secure: true
---

{{site.data.alerts.callout_info}}
This article assumes you have already [deployed CockroachDB on a single Kubernetes cluster](deploy-cockroachdb-with-kubernetes.html). However, it's possible to configure these settings before starting CockroachDB on Kubernetes.
{{site.data.alerts.end}}

You can configure, scale, and upgrade a CockroachDB deployment on Kubernetes by updating its StatefulSet values. This page describes how to:

- [Allocate CPU and memory resources](#allocate-resources)
- [Provision and expand volumes](#provision-volumes)
- [Scale the cluster](#scale-the-cluster)
- [Configure ports](#configure-ports)
- [Perform rolling upgrades](#upgrade-the-cluster)

{% comment %}
- [Rotate security certificates](#rotate-security-certificates)
{% endcomment %}

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

## Apply settings

<section class="filter-content" markdown="1" data-scope="operator">
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
crdbcluster.crdb.cockroachlabs.com/cockroachdb configured
~~~

The Operator will trigger a rolling restart of the pods to effect the change, if necessary. You can observe this by running `kubectl get pods`.
</section>

<section class="filter-content" markdown="1" data-scope="manual">
Cluster parameters are configured in the StatefulSet manifest. We provide several StatefulSet templates:

- [Secure deployment](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/bring-your-own-certs/cockroachdb-statefulset.yaml)
- [Insecure deployment](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset.yaml)

It's easiest to keep a local copy of the manifest file. After you modify its parameters, run this command to apply the new values to the cluster:

{% include copy-clipboard.html %}
~~~ shell
$ kubectl apply -f {manifest filename}.yaml
~~~

You will see:

~~~
crdbcluster.crdb.cockroachlabs.com/cockroachdb configured
~~~
</section>

<section class="filter-content" markdown="1" data-scope="helm">
Cluster parameters are set in our Helm chart's [`values.yaml`](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/values.yaml):

If you want to change the values in the Helm chart, it's easiest to create a local `my-values.yaml` file that contains your own values. After you modify these values, run this command to override the defaults in `values.yaml`:

{% include copy-clipboard.html %}
~~~ shell
$ helm upgrade -f my-values.yaml {release-name} cockroachdb/cockroachdb
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
Specify CPU and memory values in `resources.requests` and `resources.limits` in your values file:

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

Then [apply](#apply-settings) the new values.

The Operator updates the StatefulSet and triggers a rolling restart of the pods with the new storage capacity. 

To verify that the storage capacity has been updated, run `kubectl get pvc` to view the persistent volume claims (PVCs). It will take a few minutes before the PVCs are completely updated.
</section>

<section class="filter-content" markdown="1" data-scope="manual">
{% include {{ page.version.version }}/orchestration/kubernetes-expand-disk-size.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
{% include {{ page.version.version }}/orchestration/kubernetes-expand-disk-size.md %}
</section>

<section class="filter-content" markdown="1" data-scope="operator">

## Use a custom CA

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

Then [apply](#apply-settings) the new values.

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

{% comment %}
<!-- ## Rotate security certificates -->
{% endcomment %}

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
  grpcPort: 5432
~~~

Then [apply](#apply-settings) the new values.

The Operator updates the StatefulSet and triggers a rolling restart of the pods with the new port settings. 
</section>

## Scale the cluster

### Add nodes

<section class="filter-content" markdown="1" data-scope="operator">
Before scaling CockroachDB, ensure that your Kubernetes cluster has enough worker nodes to host the number of pods you want to add. This is to ensure that two pods are not placed on the same worker node, as recommended in our [production guidance](recommended-production-settings.html#topology).

For example, if you want to scale from 3 CockroachDB nodes to 4, your Kubernetes cluster should have at least 4 worker nodes. You can verify the size of your Kubernetes cluster by running `kubectl get nodes`.

1. If you need to add worker nodes, run this command and specify the desired number of nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    gcloud container clusters resize cockroachdb --num-nodes 4
    ~~~

1. Update `nodes` in the custom resource with the target size of the CockroachDB cluster:

    ~~~
    nodes: 4
    ~~~

    This value refers to the number of CockroachDB nodes. Each node runs in one Kubernetes pod.

    {{site.data.alerts.callout_info}}
    Note that you must scale by updating the `nodes` value in the custom resource. Using `kubectl scale statefulset <cluster-name> --replicas=4` will result in new pods immediately being terminated.
    {{site.data.alerts.end}}

1. [Apply](#apply-settings) the new value.

1. To verify that the new pods were successfully started, run `kubectl get pods`.
</section>

{% include {{ page.version.version }}/orchestration/kubernetes-scale-cluster.md %}

### Remove nodes

Before removing a node from your cluster, you must first decommission the node. This lets a node finish in-flight requests, rejects any new requests, and transfers all range replicas and range leases off the node.

{{site.data.alerts.callout_danger}}
If you remove nodes without first telling CockroachDB to decommission them, you may cause data or even cluster unavailability. For more details about how this works and what to consider before removing nodes, see [Decommission Nodes](remove-nodes.html).
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
Do **not** scale down to fewer than 3 nodes. This is considered an anti-pattern on CockroachDB and will cause errors.
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="operator">
1. Use the [`cockroach node status`](cockroach-node.html) command to get the internal IDs of nodes. For example, if you followed the steps in [Deploy CockroachDB with Kubernetes](deploy-cockroachdb-with-kubernetes.html#step-3-use-the-built-in-sql-client) to launch a secure client pod, get a shell into the `cockroachdb-client-secure` pod:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach node status \
    --certs-dir=/cockroach/cockroach-certs \
    --host=cockroachdb-public
    ~~~

    ~~~
      id |                 address                 |               sql_address               |  build  |            started_at            |            updated_at            | locality | is_available | is_live
    -----+-----------------------------------------+-----------------------------------------+---------+----------------------------------+----------------------------------+----------+--------------+----------
       1 | cockroachdb-0.cockroachdb.default:26257 | cockroachdb-0.cockroachdb.default:26257 | v20.1.4 | 2020-10-22 23:02:10.084425+00:00 | 2020-10-27 20:18:22.117115+00:00 |          | true         | true
       2 | cockroachdb-1.cockroachdb.default:26257 | cockroachdb-1.cockroachdb.default:26257 | v20.1.4 | 2020-10-22 23:02:46.533911+00:00 | 2020-10-27 20:18:22.558333+00:00 |          | true         | true
       3 | cockroachdb-2.cockroachdb.default:26257 | cockroachdb-2.cockroachdb.default:26257 | v20.1.4 | 2020-10-26 21:46:38.90803+00:00  | 2020-10-27 20:18:22.601021+00:00 |          | true         | true
       4 | cockroachdb-3.cockroachdb.default:26257 | cockroachdb-3.cockroachdb.default:26257 | v20.1.4 | 2020-10-27 19:54:04.714241+00:00 | 2020-10-27 20:18:22.74559+00:00  |          | true         | true
    (4 rows)
    ~~~

1. Use the [`cockroach node decommission`](cockroach-node.html) command to decommission the node with the highest number in its address, specifying its ID (in this example, `4`):

    {{site.data.alerts.callout_info}}
    It's important to decommission the node with the highest number in its address because, when you reduce the replica count, Kubernetes will remove the pod for that node.
    {{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach node decommission 4 \
    --certs-dir=/cockroach/cockroach-certs \
    --host=cockroachdb-public
    ~~~

    You'll then see the decommissioning status print to `stderr` as it changes:

    ~~~
     id | is_live | replicas | is_decommissioning | is_draining  
    +---+---------+----------+--------------------+-------------+
      4 |  true   |       73 |        true        |    false     
    (1 row)
    ~~~

    Once the node has been fully decommissioned and stopped, you'll see a confirmation:

    ~~~
     id | is_live | replicas | is_decommissioning | is_draining  
    +---+---------+----------+--------------------+-------------+
      4 |  true   |        0 |        true        |    false     
    (1 row)

    No more data reported on target nodes. Please verify cluster health before removing the nodes.
    ~~~

1. Once the node has been decommissioned, update the number of `nodes` in the custom resource:

    ~~~
    nodes: 3
    ~~~

1. [Apply](#apply-settings) the new value.

    The Operator will remove the node with the highest number in its address (in this case, the address including `cockroachdb-3`) from the cluster. It will also remove the persistent volume that was mounted to the pod.
    
1. To verify that the pod was successfully removed, run `kubectl get pods`.
</section>

{% include {{ page.version.version }}/orchestration/kubernetes-remove-nodes-secure.md %}

## Upgrade the cluster

It is strongly recommended that you regularly upgrade your CockroachDB version in order to pick up bug fixes, performance improvements, and new features. The [CockroachDB upgrade documentation](upgrade-cockroach-version.html) describes how to perform a "rolling upgrade" of a CockroachDB cluster by stopping and restarting nodes one at a time. This is to ensure that the cluster remains available during the upgrade.

The corresponding process on Kubernetes is a [staged update](https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/#staging-an-update), in which the Docker image is updated in the CockroachDB StatefulSet and then applied to the pods one at a time.

<section class="filter-content" markdown="1" data-scope="operator">
The Operator automatically sets the `cluster.preserve_downgrade_option` [cluster setting](cluster-settings.html) to the version you are upgrading from. This disables auto-finalization of the upgrade so that you can monitor the stability and performance of the upgraded cluster before manually finalizing the upgrade.

{{site.data.alerts.callout_info}}
This only applies when performing a feature version upgrade (for example, from v20.2.x to v21.1). Patch version upgrades (for example, within the v21.1.x series) are auto-finalized.
{{site.data.alerts.end}}

1. Change the desired Docker image in the custom resource:

    ~~~
    image:
      name: cockroachdb/cockroach:{{page.release_info.version}}
    ~~~

{% comment %}
<!-- tk PodDisruptionBudget

~~~ yaml
spec:
  maxUnavailable: 1
  minAvailable: 1
~~~

`maxUnavailable` is The maximum number of pods that can be unavailable during a rolling update. This number is set in the PodDistruptionBudget and defaults to 1.

`minAvailable` is The min number of pods that can be available during a rolling update. This number is set in the PodDistruptionBudget and defaults to 1. -->
{% endcomment %}

1. [Apply](#apply-settings) the new value.

    The Operator will perform the staged update.

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
        --host=cockroachdb-public
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

{% include {{ page.version.version }}/orchestration/kubernetes-upgrade-cluster.md %}

## See also

- [Kubernetes Multi-Cluster Deployment](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html)
- [Kubernetes Performance Guide](kubernetes-performance.html)
{% include {{ page.version.version }}/prod-deployment/prod-see-also.md %}
