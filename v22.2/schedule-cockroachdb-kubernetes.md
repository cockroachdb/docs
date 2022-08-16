---
title: Pod scheduling
summary: Schedule CockroachDB pods on Kubernetes using the Operator.
toc: true
toc_not_nested: true
secure: true
docs_area: deploy
---

This page describes how to configure the following, using the [Operator](https://github.com/cockroachdb/cockroach-operator):

- [Node selectors](#node-selectors)
- [Node affinities](#add-a-node-affinity)
- [Pod affinities and anti-affinities](#add-a-pod-affinity-or-anti-affinity)
- [Taints and tolerations](#taints-and-tolerations)
- [Topology spread constraints](#topology-spread-constraints)
- [Resource labels and annotations](#resource-labels-and-annotations)

These settings control how CockroachDB pods can be identified or scheduled onto worker nodes.

{% include {{ page.version.version }}/orchestration/operator-check-namespace.md %}

## Enable feature gates

{% capture latest_operator_version %}{% include_cached latest_operator_version.md %}{% endcapture %}

To enable the [affinity](#affinities-and-anti-affinities), [toleration](#taints-and-tolerations), and [topology spread constraint](#topology-spread-constraints) rules, [download the Operator manifest](https://raw.githubusercontent.com/cockroachdb/cockroach-operator/v{{ latest_operator_version }}/install/operator.yaml) and add the following line to the `spec.containers.args` field:

{% include_cached copy-clipboard.html %}
~~~ yaml
spec:
  containers:
  - args:
    - -feature-gates=TolerationRules=true,AffinityRules=true,TopologySpreadRules=true
~~~

## Node selectors

A pod with a *node selector* will be scheduled onto a worker node that has matching [labels](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/), or key-value pairs.

Specify the labels in `nodeSelector` in the Operator's custom resource, which is used to [deploy the cluster](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster). If you specify multiple `nodeSelector` labels, the node must match all of them.

The following configuration causes CockroachDB pods to be scheduled onto worker nodes that have *both* the labels `worker-pool-name=crdb-workers` and `kubernetes.io/arch=amd64`:

{% include_cached copy-clipboard.html %}
~~~ yaml
spec:
  nodeSelector:
    worker-pool-name: crdb-workers
    kubernetes.io/arch: amd64
~~~

For an example of labeling nodes, see [Scheduling CockroachDB onto labeled nodes](#example-scheduling-cockroachdb-onto-labeled-nodes).

## Affinities and anti-affinities

{{site.data.alerts.callout_info}}
To use the affinity rules, first [enable the feature gates](#enable-feature-gates).
{{site.data.alerts.end}}

A pod with a *node affinity* seeks out worker nodes that have matching [labels](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/). A pod with a *pod affinity* seeks out pods that have matching labels. A pod with a *pod anti-affinity* avoids pods that have matching labels.

Affinities and anti-affinities can be used together with `operator` fields to:

- Require CockroachDB pods to be scheduled onto a labeled worker node.
- Require CockroachDB pods to be co-located with labeled pods (e.g., on a node or region).
- Prevent CockroachDB pods from being scheduled onto a labeled worker node.
- Prevent CockroachDB pods from being co-located with labeled pods (e.g., on a node or region).

For an example, see [Scheduling CockroachDB onto labeled nodes](#example-scheduling-cockroachdb-onto-labeled-nodes).

### Add a node affinity

Specify node affinities in `affinity.nodeAffinity` in the Operator's custom resource, which is used to [deploy the cluster](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster). If you specify multiple `matchExpressions` labels, the node must match all of them. If you specify multiple `values` for a label, the node can match any of the values.

The following configuration requires that CockroachDB pods are scheduled onto worker nodes running either an `intel` or `amd64` CPU, with a preference against worker nodes in the `us-east4-b` availability zone.

{% include_cached copy-clipboard.html %}
~~~ yaml
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/arch
            operator: In
            values: 
            - intel
            - amd64
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        preference:
          matchExpressions:
          - key: topology.kubernetes.io/zone
            operator: NotIn
            values:
            - us-east4-b
~~~

The `requiredDuringSchedulingIgnoredDuringExecution` node affinity rule, using the `In` operator, requires CockroachDB pods to be scheduled onto nodes with _either_ the matching label `kubernetes.io/arch=intel` or `kubernetes.io/arch=amd64`. It will not evict pods that are already running on nodes that do not match the affinity requirements.

The `preferredDuringSchedulingIgnoredDuringExecution` node affinity rule, using the `NotIn` operator and specified `weight`, discourages (but does not disallow) CockroachDB pods from being scheduled onto nodes with the label `topology.kubernetes.io/zone=us-east4-b`. This achieves a similar effect as a `PreferNoSchedule` [taint](#taints-and-tolerations).

For more context on how these rules work, see the [Kubernetes documentation](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/). The [custom resource definition](https://github.com/cockroachdb/cockroach-operator/v{{ latest_operator_version }}/config/crd/bases/crdb.cockroachlabs.com_crdbclusters.yaml) details the fields supported by the Operator.

### Add a pod affinity or anti-affinity

Specify pod affinities and anti-affinities in `affinity.podAffinity` and `affinity.podAntiAffinity` in the Operator's custom resource, which is used to [deploy the cluster](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster). If you specify multiple `matchExpressions` labels, the node must match all of them. If you specify multiple `values` for a label, the node can match any of the values.

The following configuration attempts to schedule CockroachDB pods in the same zones as the pods that run our example [load generator](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/example-app.yaml) app. It disallows CockroachDB pods from being co-located on the same worker node.

{% include_cached copy-clipboard.html %}
~~~ yaml
spec:
  affinity:
    podAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
            - key: app
              operator: In
              values:
              - loadgen
          topologyKey: topology.kubernetes.io/zone
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
          - key: app.kubernetes.io/instance
            operator: In
            values:
            - cockroachdb
        topologyKey: kubernetes.io/hostname
~~~

The `preferredDuringSchedulingIgnoredDuringExecution` pod affinity rule, using the `In` operator and specified `weight`, encourages (but does not require) CockroachDB pods to be co-located with pods labeled `app=loadgen` already running in the same zone, as specified with `topologyKey`.

The `requiredDuringSchedulingIgnoredDuringExecution` pod anti-affinity rule, using the `In` operator, requires CockroachDB pods not to be co-located on a worker node, as specified with `topologyKey`.

For more context on how these rules work, see the [Kubernetes documentation](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/). The [custom resource definition](https://raw.github.com/cockroachdb/cockroach-operator/v{{ latest_operator_version }}/config/crd/bases/crdb.cockroachlabs.com_crdbclusters.yaml) details the fields supported by the Operator.

### Example: Scheduling CockroachDB onto labeled nodes

In this example, CockroachDB has not yet been deployed to a running Kubernetes cluster. We use a combination of node affinity and pod anti-affinity rules to schedule 3 CockroachDB pods onto 3 labeled worker nodes.

1. List the worker nodes on the running Kubernetes cluster:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	kubectl get nodes
	~~~

	~~~
	NAME                                         STATUS   ROLES    AGE   VERSION
	gke-cockroachdb-default-pool-263138a5-kp3v   Ready    <none>   3m56s   v1.20.10-gke.301
	gke-cockroachdb-default-pool-263138a5-nn62   Ready    <none>   3m56s   v1.20.10-gke.301
	gke-cockroachdb-default-pool-41796213-75c9   Ready    <none>   3m56s   v1.20.10-gke.301
	gke-cockroachdb-default-pool-41796213-bw3z   Ready    <none>   3m54s   v1.20.10-gke.301
	gke-cockroachdb-default-pool-ccd74623-dghs   Ready    <none>   3m54s   v1.20.10-gke.301
	gke-cockroachdb-default-pool-ccd74623-p5mf   Ready    <none>   3m55s   v1.20.10-gke.301
	~~~
	
1. Add a `node=crdb` label to 3 of the running worker nodes.

	{% include_cached copy-clipboard.html %}
	~~~ shell
	kubectl label nodes gke-cockroachdb-default-pool-263138a5-kp3v gke-cockroachdb-default-pool-41796213-75c9 gke-cockroachdb-default-pool-ccd74623-dghs node=crdb
	~~~

	~~~
	node/gke-cockroachdb-default-pool-5726e554-77r7 labeled
	node/gke-cockroachdb-default-pool-ee4d4d67-0922 labeled
	node/gke-cockroachdb-default-pool-ee4d4d67-w18b labeled
	~~~

	In this example, 6 GKE nodes are deployed in 3 [node pools](https://cloud.google.com/kubernetes-engine/docs/concepts/node-pools), and each node pool resides in a separate availability zone. To maintain an even distribution of CockroachDB pods as specified in our [topology recommendations](recommended-production-settings.html#topology), each of the 3 labeled worker nodes must belong to a different node pool.

	{{site.data.alerts.callout_success}}
	This also ensures that the CockroachDB pods, which will be bound to persistent volumes in the same 3 availability zones, can be scheduled onto worker nodes in their respective zones.
	{{site.data.alerts.end}}

1. Add the following rules to the Operator's custom resource, which is used to [deploy the cluster](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster):

	{% include_cached copy-clipboard.html %}
	~~~ yaml
	spec:
	  affinity:
	    nodeAffinity:
	      requiredDuringSchedulingIgnoredDuringExecution:
	        nodeSelectorTerms:
	        - matchExpressions:
	          - key: node
	            operator: In
	            values:
	            - crdb
	    podAntiAffinity:
	      requiredDuringSchedulingIgnoredDuringExecution:
	      - labelSelector:
	          matchExpressions:
	          - key: app.kubernetes.io/instance
	            operator: In
	            values:
	            - cockroachdb
	        topologyKey: kubernetes.io/hostname 		  	  
	~~~

	The `nodeAffinity` rule requires CockroachDB pods to be scheduled onto worker nodes with the label `node=crdb`.	The `podAntiAffinity` rule requires CockroachDB pods not to be co-located on a worker node, as specified with `topologyKey`.

1. Apply the settings to the cluster:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	kubectl apply -f example.yaml
	~~~

1. The CockroachDB pods will be deployed to the 3 labeled nodes. To observe this:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	kubectl get pods -o wide
	~~~

	~~~
	NAME                                 READY   STATUS    RESTARTS   AGE    IP           NODE                                         NOMINATED NODE   READINESS GATES
	cockroach-operator-bfdbfc9c7-tbpsw   1/1     Running   0          171m   10.32.2.4    gke-cockroachdb-default-pool-263138a5-kp3v   <none>           <none>
	cockroachdb-0                        1/1     Running   0          100s   10.32.4.10   gke-cockroachdb-default-pool-ccd74623-dghs   <none>           <none>
	cockroachdb-1                        1/1     Running   0          100s   10.32.2.6    gke-cockroachdb-default-pool-263138a5-kp3v   <none>           <none>
	cockroachdb-2                        1/1     Running   0          100s   10.32.0.5    gke-cockroachdb-default-pool-41796213-75c9   <none>           <none>
	~~~

## Taints and tolerations

{{site.data.alerts.callout_info}}
To use the toleration rules, first [enable the feature gates](#enable-feature-gates).
{{site.data.alerts.end}}

When a *taint* is added to a Kubernetes worker node, pods are prevented from being scheduled onto that node. This effect is ignored by adding a *toleration* to a pod that specifies a matching taint.

Taints and tolerations are useful if you want to:

- Prevent CockroachDB pods from being scheduled onto a labeled worker node.
- Evict CockroachDB pods from a labeled worker node on which they are currently running.

For an example, see [Evicting CockroachDB from a running worker node](#example-evicting-cockroachdb-from-a-running-worker-node).

### Add a toleration

Specify pod tolerations in the `tolerations` object of the Operator's custom resource, which is used to [deploy the cluster](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster). 

The following toleration matches a taint with the specified key, value, and `NoSchedule` effect, using the `Equal` operator. A toleration that uses the `Equal` operator must include a `value` field:

{% include_cached copy-clipboard.html %}
~~~ yaml
spec:
  tolerations:
    - key: "test"
      operator: "Equal"
      value: "example"
      effect: "NoSchedule"
~~~

A `NoSchedule` taint on a node prevents pods from being scheduled onto the node. The matching toleration allows a pod to be scheduled onto the node. A `NoSchedule` toleration is therefore best included before [deploying the cluster](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster).

{{site.data.alerts.callout_info}}
A `PreferNoSchedule` taint discourages, but does not disallow, pods from being scheduled onto the node.
{{site.data.alerts.end}}

The following toleration matches every taint with the specified key and `NoExecute` effect, using the `Exists` operator. A toleration that uses the `Exists` operator must exclude a `value` field:

{% include_cached copy-clipboard.html %}
~~~ yaml
spec:
  tolerations:
    - key: "test"
      operator: "Exists"
      effect: "NoExecute"
      tolerationSeconds: 3600
~~~

A `NoExecute` taint on a node prevents pods from being scheduled onto the node, and evicts pods from the node if they are already running on the node. The matching toleration allows a pod to be scheduled onto the node, and to continue running on the node if `tolerationSeconds` is not specified. If `tolerationSeconds` is specified, the pod is evicted after this number of seconds. 

For more information on using taints and tolerations, see the [Kubernetes documentation](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/). The [custom resource definition](https://raw.github.com/cockroachdb/cockroach-operator/v{{ latest_operator_version }}/config/crd/bases/crdb.cockroachlabs.com_crdbclusters.yaml) details the fields supported by the Operator.

### Example: Evicting CockroachDB from a running worker node

In this example, CockroachDB has already been deployed on a Kubernetes cluster. We use the `NoExecute` effect to evict one of the CockroachDB pods from its worker node.

1. List the worker nodes on the running Kubernetes cluster:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	kubectl get nodes
	~~~

	~~~
	NAME                                         STATUS   ROLES    AGE   VERSION
	gke-cockroachdb-default-pool-4e5ce539-68p5   Ready    <none>   56m   v1.20.9-gke.1001
	gke-cockroachdb-default-pool-4e5ce539-j1h1   Ready    <none>   56m   v1.20.9-gke.1001
	gke-cockroachdb-default-pool-95fde00d-173d   Ready    <none>   56m   v1.20.9-gke.1001
	gke-cockroachdb-default-pool-95fde00d-hw04   Ready    <none>   56m   v1.20.9-gke.1001
	gke-cockroachdb-default-pool-eb2b2889-q15v   Ready    <none>   56m   v1.20.9-gke.1001
	gke-cockroachdb-default-pool-eb2b2889-q704   Ready    <none>   56m   v1.20.9-gke.1001
	~~~

1. Add a taint to a running worker node:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	kubectl taint nodes gke-cockroachdb-default-pool-4e5ce539-j1h1 test=example:NoExecute
	~~~

	~~~
	node/gke-cockroachdb-default-pool-4e5ce539-j1h1 tainted
	~~~

1. Add a matching `tolerations` object to the Operator's custom resource, which was used to [deploy the cluster](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster):

	~~~ yaml
	spec:
	  tolerations:
	    - key: "test"
	      operator: "Exists"
	      effect: "NoExecute"
	~~~

	Because no `tolerationSeconds` is specified, CockroachDB will be evicted immediately from the tainted worker node.

1. Apply the new settings to the cluster:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	$ kubectl apply -f example.yaml
	~~~

1. The CockroachDB pod running on the tainted node (in this case, `cockroachdb-2`) will be evicted and started on a different worker node. To observe this:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	kubectl get pods -o wide
	~~~

	~~~
	NAME                                 READY   STATUS    RESTARTS   AGE     IP           NODE                                         NOMINATED NODE   READINESS GATES
	cockroach-operator-c9fc6cb5c-bl6rs   1/1     Running   0          44m     10.32.2.4    gke-cockroachdb-default-pool-4e5ce539-68p5   <none>           <none>
	cockroachdb-0                        1/1     Running   0          9m21s   10.32.4.10   gke-cockroachdb-default-pool-95fde00d-173d   <none>           <none>
	cockroachdb-1                        1/1     Running   0          9m21s   10.32.2.6    gke-cockroachdb-default-pool-eb2b2889-q15v   <none>           <none>
	cockroachdb-2                        0/1     Running   0          6s      10.32.0.5    gke-cockroachdb-default-pool-4e5ce539-68p5   <none>           <none>
	~~~

	`cockroachdb-2` is now scheduled onto the `gke-cockroachdb-default-pool-4e5ce539-68p5` node.

## Topology spread constraints

{{site.data.alerts.callout_info}}
To use the topology spread constraint rules, first [enable the feature gates](#enable-feature-gates).
{{site.data.alerts.end}}

A pod with a *topology spread constraint* must satisfy its conditions when being deployed to a given topology. This is used to control the degree to which pods are unevenly distributed across failure domains.

### Add a topology spread constraint

Specify pod topology spread constraints in the `topologySpreadConstraints` object of the Operator's custom resource, which is used to [deploy the cluster](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster). If you specify multiple `topologySpreadConstraints` objects, the matching pods must satisfy all of the constraints.

The following topology spread constraint ensures that CockroachDB pods deployed with the label `environment=production` will not be unevenly distributed across zones by more than `1` pod:

{% include_cached copy-clipboard.html %}
~~~ yaml
spec:
  topologySpreadConstraints:
  - maxSkew: 1
    topologyKey: topology.kubernetes.io/zone
    whenUnsatisfiable: DoNotSchedule
    labelSelector:
      matchLabels:
        environment: production
~~~

The `DoNotSchedule` condition prevents labeled pods from being scheduled onto Kubernetes worker nodes when doing so would fail to meet the spread and topology constraints specified with `maxSkew` and `topologyKey`, respectively.

For more context on how these rules work, see the [Kubernetes documentation](https://kubernetes.io/docs/concepts/workloads/pods/pod-topology-spread-constraints/). The [custom resource definition](https://raw.github.com/cockroachdb/cockroach-operator/v{{ latest_operator_version }}/config/crd/bases/crdb.cockroachlabs.com_crdbclusters.yaml) details the fields supported by the Operator.

## Resource labels and annotations

To assist in working with your cluster, you can add labels and annotations to your resources.

Specify labels in `additionalLabels` and annotations in `additionalAnnotations` in the Operator's custom resource, which is used to [deploy the cluster](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster):

{% include_cached copy-clipboard.html %}
~~~ yaml
spec:
  additionalLabels:
    app.kubernetes.io/version: {{page.release_info.version}}
  additionalAnnotations:
    operator: https://raw.github.com/cockroachdb/cockroach-operator/v{{ latest_operator_version }}/install/operator.yaml
~~~

To verify that the labels and annotations were applied to a pod, for example, run `kubectl describe pod {pod-name}`.

For more information about [labels](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/) and [annotations](https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/), see the Kubernetes documentation.