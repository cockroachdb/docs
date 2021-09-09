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
- [Configure ports](#configure-ports)
</section>

<section class="filter-content" markdown="1" data-scope="manual">
- [Allocate CPU and memory resources](#allocate-resources)
- [Provision and expand volumes](#provision-volumes)
</section>

<section class="filter-content" markdown="1" data-scope="helm">
- [Allocate CPU and memory resources](#allocate-resources)
- [Provision and expand volumes](#provision-volumes)
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

## Apply settings

<section class="filter-content" markdown="1" data-scope="operator">
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

<section class="filter-content" markdown="1" data-scope="helm">
The cluster is configured by overriding the default parameters in the Helm chart's [`values.yaml`](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/values.yaml).

It's simplest to create a local values file that specifies your custom values. This should be a YAML file containing fields written in the same format as those you wish to override in `values.yaml`. For more context on Helm chart values, see the [Helm documentation](https://helm.sh/docs/chart_template_guide/values_files/).

Run the following command to override the Helm chart values with your own:

{% include copy-clipboard.html %}
~~~ shell
helm upgrade -f {custom-values}.yaml my-release cockroachdb/cockroachdb
~~~

You will see:

~~~
tk
~~~
</section>




## See also

- [Kubernetes Multi-Cluster Deployment](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html)
- [Kubernetes Performance Guide](kubernetes-performance.html)
{% include {{ page.version.version }}/prod-deployment/prod-see-also.md %}
