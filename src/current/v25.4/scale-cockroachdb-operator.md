---
title: Cluster Scaling with the CockroachDB Operator
summary: How to scale a secure CockroachDB cluster deployed with the CockroachDB operator.
toc: true
toc_not_nested: true
secure: true
docs_area: deploy
---

This page explains how to add and remove CockroachDB nodes on Kubernetes.

{{site.data.alerts.callout_info}}
The {{ site.data.products.cockroachdb-operator }} is in [Preview]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}).
{{site.data.alerts.end}}

## Add nodes

Before scaling up CockroachDB, note the following [topology recommendations]({% link {{ page.version.version }}/recommended-production-settings.md %}#topology):

- Each CockroachDB node (running in its own pod) should run on a separate Kubernetes worker node.
- Each availability zone should have the same number of CockroachDB nodes.

If your cluster has 3 CockroachDB nodes distributed across 3 availability zones (as in our [deployment example]({% link {{ page.version.version }}/deploy-cockroachdb-with-cockroachdb-operator.md %}#initialize-the-cluster)), Cockroach Labs recommends scaling up by a multiple of 3 to retain an even distribution of nodes. You should therefore scale up to a minimum of 6 CockroachDB nodes, with 2 nodes in each zone.

1. Run `kubectl get nodes` to list the worker nodes in your Kubernetes cluster. There should be at least as many worker nodes as pods you plan to add. This ensures that no more than one pod will be placed on each worker node.

1. If you need to add worker nodes, resize your cluster by specifying the desired number of worker nodes in each zone. Using Google Kubernetes Engine as an example:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    gcloud container clusters resize {cluster-name} --region {region-name} --num-nodes 2
    ~~~

    This example distributes 2 worker nodes across the default 3 zones, raising the total to 6 worker nodes.

1. Update `cockroachdb.crdbCluster.regions.code.nodes` in the values file used to [deploy the cluster]({% link {{ page.version.version }}/deploy-cockroachdb-with-cockroachdb-operator.md %}#initialize-the-cluster), with the target size of the CockroachDB cluster in the specified region. This value refers to the number of CockroachDB nodes, each running in one pod:

    ~~~ yaml
    cockroachdb:
      crdbCluster:
        regions:
        - code: us-central1
          cloudProvider: gcp
          domain: cluster.domain.us-central
          nodes: 6
    ~~~

1. Apply the new settings to the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    helm upgrade --reuse-values $CRDBCLUSTER ./cockroachdb-parent/charts/cockroachdb --values ./cockroachdb-parent/charts/cockroachdb/values.yaml -n $NAMESPACE
    ~~~

1. Verify that the new pods were successfully started:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get pods -n $NAMESPACE
    ~~~
    ~~~ shell
    NAME                                    READY   STATUS    RESTARTS   AGE
    crdb-operator-655fbf7847-zn9v8            1/1     Running   0          30m
    cockroachdb-9swcg                         1/1     Running   0          24m
    cockroachdb-bn6f7                         2/2     Running   0          24m
    cockroachdb-nk2dw                         2/2     Running   0          24m
    cockroachdb-f83nd                         2/2     Running   0          30s
    cockroachdb-8d2ck                         2/2     Running   0          30s
    cockroachdb-qopc2                         2/2     Running   0          30s
    ~~~

    Each pod should be running in one of the 6 worker nodes.

## Remove nodes

If your nodes are distributed across 3 availability zones (as in our [deployment example]({% link {{ page.version.version }}/deploy-cockroachdb-with-cockroachdb-operator.md %}#initialize-the-cluster)), Cockroach Labs recommends scaling down by a multiple of 3 to retain an even distribution. If your cluster has 6 CockroachDB nodes, you should therefore scale down to 3, with 1 node in each zone.

{{site.data.alerts.callout_danger}}
Do not scale down to fewer than 3 nodes. This is considered an anti-pattern on CockroachDB and will cause errors. Before scaling down CockroachDB, note that each availability zone should have the same number of CockroachDB nodes.
{{site.data.alerts.end}}

1. Update `cockroachdb.crdbCluster.regions.code.nodes` in the values file used to [deploy the cluster]({% link {{ page.version.version }}/deploy-cockroachdb-with-cockroachdb-operator.md %}#initialize-the-cluster), with the target size of the CockroachDB cluster. For instance, to scale a cluster in Google Cloud down to 3 nodes:

    ~~~ yaml
    cockroachdb:
      crdbCluster:
        regions:
        - code: us-central1
          cloudProvider: gcp
          domain: cluster.domain.us-central
          nodes: 3
    ~~~

1. Apply the new settings to the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    helm upgrade --reuse-values $CRDBCLUSTER ./cockroachdb-parent/charts/cockroachdb --values ./cockroachdb-parent/charts/cockroachdb/values.yaml -n $NAMESPACE
    ~~~

1. Verify that the pods were successfully removed:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get pods
    ~~~

## Decommission nodes

When a Kubernetes node is scheduled for removal or maintenance, the {{ site.data.products.cockroachdb-operator }} can be instructed to decommission the CockroachDB nodes scheduled on this Kubernetes node. Decommissioning safely moves data and workloads away before the node goes offline.

{{site.data.alerts.callout_info}}
Once annotated, the Kubernetes node is cordoned so no further pods are scheduled on the node. The annotation is not a mark for future removal, as CockroachDB is decommissioned on the node immediately.

If cluster capacity is limited, replacement pods may remain in the `Pending` state until new nodes are available.
{{site.data.alerts.end}}

The following prerequisites are necessary for the {{ site.data.products.cockroachdb-operator }} to be able to decommission a CockroachDB node:

- The `--enable-k8s-node-/controller=true` flag must be enabled in the operator's `.yaml` values file, for example:
    {% include_cached copy-clipboard.html %}
    {% raw %}
    ~~~ yaml
    containers:
        - name: cockroach-operator
          image: {{ .Values.image.registry }}/{{ .Values.image.repository }}:{{ .Values.image.tag }}
          args:
            - "-enable-k8s-node-controller=true"
    ~~~
    {% endraw %}
- At least one replica of the operator must not be on the target node.
- There must be no under-replicated ranges on the CockroachDB cluster.

To mark a node for decommissioning, follow these steps:

1. Identify the name of the Kubernetes node that is to be removed.

1. Annotate the Kubernetes node with `crdb.cockroachlabs.com/decommission="true"`. The decommissioning process begins immediately after this annotation is applied. Using `kubectl`, for example:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl annotate node {example-node-name} crdb.cockroachlabs.com/decommission="true"
    ~~~

1. Monitor the cluster:
    - Confirm the decommissioned node's cordoned status:
      {% include_cached copy-clipboard.html %}
      ~~~ shell
      kubectl describe node {example-node-name}
      ~~~
    - Monitor operator events and logs for decommission start and completion messages:
      {% include_cached copy-clipboard.html %}
      ~~~ shell
      kubectl logs pod {operator-pod-name}
      ~~~

If the replacement pods remain in a `Pending` state, this typically means there is not enough available capacity in the cluster for these pods to be scheduled.
