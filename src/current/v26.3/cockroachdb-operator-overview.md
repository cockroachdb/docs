---
title: CockroachDB Operator Overview
summary: An overview of deployment and management of a CockroachDB cluster using the CockroachDB operator with Kubernetes.
toc: true
toc_not_nested: true
secure: true
docs_area: deploy
key: operate-cockroachdb-kubernetes-operator.html
---

The {{ site.data.products.cockroachdb-operator }} is a fully-featured [Kubernetes operator](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/) that allows you to deploy and manage CockroachDB self-hosted clusters.

{{site.data.alerts.callout_info}}
The {{ site.data.products.cockroachdb-operator }} is in [Preview]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}).

For information on the generally-available {{ site.data.products.public-operator }}, read the [{{ site.data.products.public-operator }} documentation]({% link {{ page.version.version }}/kubernetes-overview.md %}) and see the [GitHub repository](https://github.com/cockroachdb/cockroach-operator).
{{site.data.alerts.end}}

With the {{ site.data.products.cockroachdb-operator }}, you can deploy CockroachDB clusters across multiple regions with separate operator instances per region. Using [Helm](https://helm.sh/), set configurations that manage the operator and CockroachDB nodes across regions.

## {{ site.data.products.cockroachdb-operator }}

This section describes how to:

- [Deploy a CockroachDB cluster using the {{ site.data.products.cockroachdb-operator }}]({% link {{page.version.version}}/deploy-cockroachdb-with-cockroachdb-operator.md %}).
- Migrate from an existing CockroachDB Kubernetes deployment using [Helm]({% link {{page.version.version}}/migrate-cockroachdb-kubernetes-helm.md %}) or the [{{ site.data.products.public-operator }}]({% link {{page.version.version}}/migrate-cockroachdb-kubernetes-operator.md %}).
- Operate a CockroachDB cluster:

    - [Manage pod scheduling]({% link {{page.version.version}}/schedule-cockroachdb-operator.md %}).
    - [Manage cluster resources]({% link {{page.version.version}}/configure-cockroachdb-operator.md %}).
    - [Manage certificates]({% link {{page.version.version}}/secure-cockroachdb-operator.md %}).
    - [Scale a cluster]({% link {{page.version.version}}/scale-cockroachdb-operator.md %}).
    - [Monitor a cluster]({% link {{page.version.version}}/monitor-cockroachdb-operator.md %}).
    - [Upgrade a cluster]({% link {{page.version.version}}/upgrade-cockroachdb-operator.md %}).
    - [Override deployment templates]({% link {{page.version.version}}/override-templates-cockroachdb-operator.md %}).
    - [Improve cluster performance]({% link {{page.version.version}}/cockroachdb-operator-performance.md %}).

## Kubernetes terminology

Before starting, review some basic Kubernetes terminology. Note that CockroachDB [nodes]({% link {{ page.version.version }}/architecture/glossary.md %}#cockroachdb-architecture-terms) are distinct from Kubernetes "nodes" or "worker nodes".

Feature | Description
--------|------------
[node](https://kubernetes.io/docs/concepts/architecture/nodes/) | A physical or virtual machine. In the [deployment guide]({% link {{ page.version.version }}/deploy-cockroachdb-with-cockroachdb-operator.md %}), you'll create instances and join them as worker nodes into a single Kubernetes cluster.
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one of more Docker containers. In the [deployment guide]({% link {{ page.version.version }}/deploy-cockroachdb-with-cockroachdb-operator.md %}), each pod will run on a separate Kubernetes worker node and include one Docker container running a single CockroachDB node, reflecting our [topology recommendations]({% link {{ page.version.version }}/recommended-production-settings.md %}#topology).
[operator](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/) | An operator is an extension to Kubernetes that uses custom resources to efficiently manage specific applications. The {{ site.data.products.cockroachdb-operator }} includes two custom resource definitions to manage CockroachDB, `CrdbCluster` and `CrdbNode`. Unlike the older [{{ site.data.products.public-operator }}](https://github.com/cockroachdb/cockroach-operator), the {{ site.data.products.cockroachdb-operator }} does not use StatefulSets and is designed to simplify multi-region deployments.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | A persistent volume is a piece of networked storage (Persistent Disk on GCE, Elastic Block Store on AWS) mounted into a pod. The lifetime of a persistent volume is decoupled from the lifetime of the pod that's using it, ensuring that each CockroachDB node binds back to the same storage on restart.<br><br>The [deployment guide]({% link {{ page.version.version }}/deploy-cockroachdb-with-cockroachdb-operator.md %}) assumes that dynamic volume provisioning is available. When that is not the case, [persistent volume claims](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) need to be created manually.
[RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) | RBAC, or Role-Based Access Control, is the system Kubernetes uses to manage permissions within the cluster. In order to take an action (e.g., `get` or `create`) on an API resource (e.g., a `pod`), the client must have a `Role` that allows it to do so. The [deployment guide]({% link {{ page.version.version }}/deploy-cockroachdb-with-cockroachdb-operator.md %}) creates the RBAC resources necessary for CockroachDB to create and access certificates.
