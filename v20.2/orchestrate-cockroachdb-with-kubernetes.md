---
title: Orchestrate CockroachDB in a Single Kubernetes Cluster
summary: How to orchestrate the deployment, management, and monitoring of a secure 3-node CockroachDB cluster with Kubernetes.
toc: true
toc_not_nested: true
secure: true
canonical: /stable/deploy-cockroachdb-with-kubernetes.html
---

<div class="filters filters-big clearfix">
  <button class="filter-button current"><strong>Secure</strong></button>
  <a href="orchestrate-cockroachdb-with-kubernetes-insecure.html"><button class="filter-button">Insecure</button></a>
</div>

This page shows you how to orchestrate the deployment, management, and monitoring of a secure 3-node CockroachDB cluster in a single [Kubernetes](http://kubernetes.io/) cluster, using the [StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) feature directly or via the [Helm](https://helm.sh/) package manager for Kubernetes.

To deploy across multiple Kubernetes clusters in different geographic regions instead, see [Kubernetes Multi-Cluster Deployment](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html). Also, for details about potential performance bottlenecks to be aware of when running CockroachDB in Kubernetes and guidance on how to optimize your deployment for better performance, see [CockroachDB Performance on Kubernetes](kubernetes-performance.html).

{% include cockroachcloud/use-cockroachcloud-instead.md %}

## Before you begin

Before getting started, it's helpful to review some Kubernetes-specific terminology and current limitations.

- [Kubernetes terminology](#kubernetes-terminology)
- [Limitations](#limitations)

### Kubernetes terminology

Feature | Description
--------|------------
[node](https://kubernetes.io/docs/concepts/architecture/nodes/) | A physical or virtual machine. In this tutorial, you'll create GCE or AWS instances and join them as worker nodes into a single Kubernetes cluster from your local workstation.
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one of more Docker containers. In this tutorial, each pod will run on a separate Kubernetes node and include one Docker container running a single CockroachDB node. You'll start with 3 pods and grow to 4.
[StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) | A StatefulSet is a group of pods treated as stateful units, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart. StatefulSets are considered stable as of Kubernetes version 1.9 after reaching beta in version 1.5.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | A persistent volume is a piece of networked storage (Persistent Disk on GCE, Elastic Block Store on AWS) mounted into a pod. The lifetime of a persistent volume is decoupled from the lifetime of the pod that's using it, ensuring that each CockroachDB node binds back to the same storage on restart.<br><br>This tutorial assumes that dynamic volume provisioning is available. When that is not the case, [persistent volume claims](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) need to be created manually.
[RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) | RBAC, or Role-Based Access Control, is the system Kubernetes uses to manage permissions within the cluster. In order to take an action (e.g., `get` or `create`) on an API resource (e.g., a `pod`), the client must have a `Role` that allows it to do so. This tutorial creates the RBAC resources necessary for CockroachDB to create and access certificates.

### Limitations

{% include {{ page.version.version }}/orchestration/kubernetes-limitations.md %}

## Step 1. Start Kubernetes

{% include {{ page.version.version }}/orchestration/start-kubernetes.md %}

## Step 2. Start CockroachDB

Choose how you want to deploy and maintain the CockroachDB cluster:

- [CockroachDB Kubernetes Operator](https://github.com/cockroachdb/cockroach-operator) (recommended)
- [Helm](https://helm.sh/) package manager
- Manually apply our StatefulSet configuration and related files

{{site.data.alerts.callout_success}}
<span class="version-tag">New in v20.2:</span> The [CockroachDB Kubernetes Operator](https://github.com/cockroachdb/cockroach-operator) eases the creation of StatefulSets, pod authentication, cluster scaling, and rolling upgrades. The Operator is currently in **beta** and is not yet production-ready.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
The CockroachDB Kubernetes Operator can also be run on platforms such as [Red Hat OpenShift](https://marketplace.redhat.com/en-us/products/cockroachdb-operator) and [IBM Cloud Pak for Data](https://www.ibm.com/products/cloud-pak-for-data).
{{site.data.alerts.end}}

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="operator">Use Operator</button>
    <button class="filter-button" data-scope="helm">Use Helm</button>
    <button class="filter-button" data-scope="manual">Use Configs</button>
</div>

<section class="filter-content" markdown="1" data-scope="operator">
{% include {{ page.version.version }}/orchestration/start-cockroachdb-operator-secure.md %}
</section>

<section class="filter-content" markdown="1" data-scope="manual">
{% include {{ page.version.version }}/orchestration/start-cockroachdb-secure.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
{% include {{ page.version.version }}/orchestration/start-cockroachdb-helm-secure.md %}
</section>

## Step 3. Use the built-in SQL client

{% include {{ page.version.version }}/orchestration/test-cluster-secure.md %}

## Step 4. Access the DB Console

{% include {{ page.version.version }}/orchestration/monitor-cluster.md %}

## Step 5. Simulate node failure

{% include {{ page.version.version }}/orchestration/kubernetes-simulate-failure.md %}

## Step 6. Monitor the cluster

{% include {{ page.version.version }}/orchestration/kubernetes-prometheus-alertmanager.md %}

## Step 7. Maintain the cluster

- [Add nodes](#add-nodes)
- [Remove nodes](#remove-nodes)
- [Expand disk size](#expand-disk-size)
- [Upgrade the cluster](#upgrade-the-cluster)
- [Stop the cluster](#stop-the-cluster)

### Add nodes

{% include {{ page.version.version }}/orchestration/kubernetes-scale-cluster.md %}

### Remove nodes

{% include {{ page.version.version }}/orchestration/kubernetes-remove-nodes-secure.md %}

### Expand disk size

<section class="filter-content" markdown="1" data-scope="operator">
{{site.data.alerts.callout_info}}
Expansion of persistent volumes with the Operator is forthcoming. See the [GitHub project](https://github.com/cockroachdb/cockroach-operator) for progress.
{{site.data.alerts.end}}
</section>

{% include {{ page.version.version }}/orchestration/kubernetes-expand-disk-size.md %}

### Upgrade the cluster

{% include {{ page.version.version }}/orchestration/kubernetes-upgrade-cluster.md %}

### Stop the cluster

{% include {{ page.version.version }}/orchestration/kubernetes-stop-cluster.md %}

#### Stop Kubernetes

To delete the Kubernetes cluster:

- Hosted GKE:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters delete cockroachdb --region {region-name}
    ~~~
- Hosted EKS:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ eksctl delete cluster --name cockroachdb
    ~~~

{{site.data.alerts.callout_danger}}
If you stop Kubernetes without first deleting the persistent volumes, they will still exist in your cloud project.
{{site.data.alerts.end}}

## See also

- [Kubernetes Multi-Cluster Deployment](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html)
- [Kubernetes Performance Guide](kubernetes-performance.html)
{% include {{ page.version.version }}/prod-deployment/prod-see-also.md %}
