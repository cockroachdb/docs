---
title: Cluster scaling
summary: How to scale a secure 3-node CockroachDB cluster with Kubernetes.
toc: true
toc_not_nested: true
secure: true
docs_area: deploy
---

{{site.data.alerts.callout_info}}
This article assumes you have already [deployed CockroachDB on a single Kubernetes cluster](deploy-cockroachdb-with-kubernetes.html).
{{site.data.alerts.end}}

This page explains how to add and remove CockroachDB nodes on Kubernetes.

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="operator">Operator</button>
    <button class="filter-button" data-scope="manual">Manual Configs</button>
    <button class="filter-button" data-scope="helm">Helm</button>
</div>

<section class="filter-content" markdown="1" data-scope="operator">
{% include {{ page.version.version }}/orchestration/operator-check-namespace.md %}

{{site.data.alerts.callout_success}}
If you [deployed CockroachDB on Red Hat OpenShift](deploy-cockroachdb-with-kubernetes-openshift.html), substitute `kubectl` with `oc` in the following commands.
{{site.data.alerts.end}}
</section>

## Add nodes

<section class="filter-content" markdown="1" data-scope="operator">
Before scaling up CockroachDB, note the following [topology recommendations](recommended-production-settings.html#topology):

- Each CockroachDB node (running in its own pod) should run on a separate Kubernetes worker node.
- Each availability zone should have the same number of CockroachDB nodes.

If your cluster has 3 CockroachDB nodes distributed across 3 availability zones (as in our [deployment example](deploy-cockroachdb-with-kubernetes.html)), we recommend scaling up by a multiple of 3 to retain an even distribution of nodes. You should therefore scale up to a minimum of 6 CockroachDB nodes, with 2 nodes in each zone.

1. Run `kubectl get nodes` to list the worker nodes in your Kubernetes cluster. There should be at least as many worker nodes as pods you plan to add. This ensures that no more than one pod will be placed on each worker node.

1. If you need to add worker nodes, resize your GKE cluster by specifying the desired number of worker nodes in each zone:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    gcloud container clusters resize {cluster-name} --region {region-name} --num-nodes 2
    ~~~

    This example distributes 2 worker nodes across the default 3 zones, raising the total to 6 worker nodes.

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
        datadir-cockroachdb-3   Bound    pvc-63ce836a-1258-4c58-8b37-d966ed12d50a   60Gi       RWO            standard       24m
        datadir-cockroachdb-4   Bound    pvc-1ylabv86-6512-6n12-bw3g-i0dh2zxvfhd0   60Gi       RWO            standard       24m
        datadir-cockroachdb-5   Bound    pvc-2vka2c9x-7824-41m5-jk45-mt7dzq90q97x   60Gi       RWO            standard       24m
        ~~~

  1. The PVC names correspond to the pods they are bound to. For example, if the pods `cockroachdb-3`, `cockroachdb-4`, and `cockroachdb-5` had been removed by [scaling the cluster down](#remove-nodes) from 6 to 3 nodes, `datadir-cockroachdb-3`, `datadir-cockroachdb-4`, and `datadir-cockroachdb-5` would be the PVCs for the orphaned persistent volumes. To verify that a PVC is not currently bound to a pod:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        kubectl describe pvc datadir-cockroachdb-5
        ~~~

        The output will include the following line:

        ~~~
        Mounted By:    <none>
        ~~~

        If the PVC is bound to a pod, it will specify the pod name.

  1. Remove the orphaned persistent volumes by deleting their PVCs:

        {{site.data.alerts.callout_danger}}
        Before deleting any persistent volumes, be sure you have a backup copy of your data. Data **cannot** be recovered once the persistent volumes are deleted. For more information, see the [Kubernetes documentation](https://kubernetes.io/docs/tasks/run-application/delete-stateful-set/#persistent-volumes).
        {{site.data.alerts.end}}

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        kubectl delete pvc datadir-cockroachdb-3 datadir-cockroachdb-4 datadir-cockroachdb-5
        ~~~

        ~~~
        persistentvolumeclaim "datadir-cockroachdb-3" deleted
        persistentvolumeclaim "datadir-cockroachdb-4" deleted
        persistentvolumeclaim "datadir-cockroachdb-5" deleted
        ~~~

1. Update `nodes` in the Operator's custom resource, which you downloaded when [deploying the cluster](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster), with the target size of the CockroachDB cluster. This value refers to the number of CockroachDB nodes, each running in one pod:

    ~~~
    nodes: 6
    ~~~

    {{site.data.alerts.callout_info}}
    Note that you must scale by updating the `nodes` value in the custom resource. Using `kubectl scale statefulset <cluster-name> --replicas=4` will result in new pods immediately being terminated.
    {{site.data.alerts.end}}

1. Apply the new settings to the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply -f example.yaml
    ~~~

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
    cockroachdb-4                         1/1     Running   0          30s
    cockroachdb-5                         1/1     Running   0          30s
    ~~~

    Each pod should be running in one of the 6 worker nodes.
</section>

<section class="filter-content" markdown="1" data-scope="manual">
{% include {{ page.version.version }}/orchestration/kubernetes-scale-cluster-manual.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
{% include {{ page.version.version }}/orchestration/kubernetes-scale-cluster-helm.md %}
</section>

## Remove nodes

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

Before scaling down CockroachDB, note the following [topology recommendation](recommended-production-settings.html#topology):

- Each availability zone should have the same number of CockroachDB nodes.

If your nodes are distributed across 3 availability zones (as in our [deployment example](deploy-cockroachdb-with-kubernetes.html)), we recommend scaling down by a multiple of 3 to retain an even distribution. If your cluster has 6 CockroachDB nodes, you should therefore scale down to 3, with 1 node in each zone.

1. Update `nodes` in the custom resource, which you downloaded when [deploying the cluster](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster), with the target size of the CockroachDB cluster. For instance, to scale down to 3 nodes:

    ~~~
    nodes: 3
    ~~~

    {{site.data.alerts.callout_info}}
    Before removing a node, the Operator first decommissions the node. This lets a node finish in-flight requests, rejects any new requests, and transfers all range replicas and range leases off the node.
    {{site.data.alerts.end}}

1. Apply the new settings to the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply -f example.yaml
    ~~~

    The Operator will remove nodes from the cluster one at a time, starting from the pod with the highest number in its address.
    
1. Verify that the pods were successfully removed:

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

### Automatic PVC pruning

To enable the Operator to automatically remove persistent volumes when [scaling down](#remove-nodes) a cluster, turn on automatic PVC pruning through a feature gate.

{{site.data.alerts.callout_danger}}
This workflow is unsupported and should be enabled at your own risk.
{{site.data.alerts.end}}

1. Download the Operator manifest:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl -0 https://raw.githubusercontent.com/cockroachdb/cockroach-operator/{{ latest_operator_version }}/install/operator.yaml
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
    ~~~

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