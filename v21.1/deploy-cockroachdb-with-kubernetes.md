---
title: Deploy CockroachDB in a Single Kubernetes Cluster
summary: Deploy a secure 3-node CockroachDB cluster with Kubernetes.
toc: true
toc_not_nested: true
secure: true
redirect_from: orchestrate-cockroachdb-with-kubernetes.html
---

<div class="filters filters-big clearfix">
  <button class="filter-button current"><strong>Secure</strong></button>
  <a href="deploy-cockroachdb-with-kubernetes-insecure.html"><button class="filter-button">Insecure</button></a>
</div>

This page shows you how to start and stop a secure 3-node CockroachDB cluster in a single [Kubernetes](http://kubernetes.io/) cluster, using one of the following:

- [CockroachDB Kubernetes Operator](https://github.com/cockroachdb/cockroach-operator)
    
    {{site.data.alerts.callout_info}}
    The CockroachDB Kubernetes Operator is also available from the [Red Hat Marketplace](https://marketplace.redhat.com/en-us/products/cockroachdb-operator). To deploy a cluster on OpenShift, see [Deploy CockroachDB on Red Hat OpenShift](deploy-cockroachdb-with-kubernetes-openshift.html).
    {{site.data.alerts.end}}

- Manual [StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) configuration

- [Helm](https://helm.sh/) package manager for Kubernetes

If you have already deployed a CockroachDB cluster on Kubernetes, see [Operate CockroachDB on Kubernetes](kubernetes-operation.html) for details on configuring, scaling, and upgrading the cluster.

{{site.data.alerts.callout_success}}
To deploy across multiple Kubernetes clusters in different geographic regions instead, see [Kubernetes Multi-Cluster Deployment](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html). Also, for details about potential performance bottlenecks to be aware of when running CockroachDB in Kubernetes and guidance on how to optimize your deployment for better performance, see [CockroachDB Performance on Kubernetes](kubernetes-performance.html).
{{site.data.alerts.end}}

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
[CSR](https://kubernetes.io/docs/tasks/tls/managing-tls-in-a-cluster/) | A CSR, or certificate signing request, is a request to have a TLS certificate signed by the Kubernetes cluster's built-in CA. As each pod is created, it issues a CSR for the CockroachDB node running in the pod, which must be manually checked and approved. The same is true for clients as they connect to the cluster. Note that Kubernetes environments that don't support CSRs, such as Amazon EKS, can use a different certificate authority than the one Kubernetes uses.
[RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) | RBAC, or Role-Based Access Control, is the system Kubernetes uses to manage permissions within the cluster. In order to take an action (e.g., `get` or `create`) on an API resource (e.g., a `pod` or `CSR`), the client must have a `Role` that allows it to do so. This tutorial creates the RBAC resources necessary for CockroachDB to create and access certificates.

### Limitations

{% include {{ page.version.version }}/orchestration/kubernetes-limitations.md %}

## Step 1. Start Kubernetes

{% include {{ page.version.version }}/orchestration/start-kubernetes.md %}

## Step 2. Start CockroachDB

Choose how you want to deploy and maintain the CockroachDB cluster.

{{site.data.alerts.callout_info}}
The [CockroachDB Kubernetes Operator](https://github.com/cockroachdb/cockroach-operator) eases CockroachDB cluster creation and management on a single Kubernetes cluster.

Note that the Operator does not provision or apply an enterprise license key. To use [enterprise features](enterprise-licensing.html) with the Operator, [set a license](licensing-faqs.html#set-a-license) in the SQL shell.
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

## Step 5. Stop the cluster

{% include {{ page.version.version }}/orchestration/kubernetes-stop-cluster.md %}

### Stop Kubernetes

To delete the Kubernetes cluster:

- Hosted GKE:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters delete cockroachdb
    ~~~
- Hosted EKS:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ eksctl delete cluster --name cockroachdb
    ~~~   
- Manual GCE:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cluster/kube-down.sh
    ~~~
- Manual AWS:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cluster/kube-down.sh
    ~~~

{{site.data.alerts.callout_danger}}
If you stop Kubernetes without first deleting the persistent volumes, they will still exist in your cloud project.
{{site.data.alerts.end}}