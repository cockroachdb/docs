---
title: Kubernetes Overview
summary: An overview of deployment and management of a CockroachDB cluster on Kubernetes.
toc: true
toc_not_nested: true
secure: true
redirect_from: orchestration.html
---

CockroachDB can be deployed and managed on Kubernetes using the following methods:

- [CockroachDB Kubernetes Operator](https://github.com/cockroachdb/cockroach-operator)
    
    {{site.data.alerts.callout_info}}
    The CockroachDB Kubernetes Operator is also available on platforms such as [Red Hat OpenShift](deploy-cockroachdb-with-kubernetes-openshift.html) and [IBM Cloud Pak for Data](https://www.ibm.com/products/cloud-pak-for-data).
    {{site.data.alerts.end}}

- Manual [StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) configuration

- [Helm](https://helm.sh/) package manager for Kubernetes

## CockroachDB on Kubernetes

This guide describes how to handle the following tasks when running CockroachDB on Kubernetes:

- [Deploying CockroachDB on a single Kubernetes cluster](deploy-cockroachdb-kubernetes.html)
- [Configuring CockroachDB resources on Kubernetes](configure-cockroachdb-kubernetes.html)
- [Managing certificates on Kubernetes](secure-cockroachdb-kubernetes.html)
- [Scaling CockroachDB on Kubernetes](scale-cockroachdb-kubernetes.html)
- [Monitoring CockroachDB on Kubernetes using Prometheus and Alertmanager](monitor-cockroachdb-kubernetes.html)
- [Upgrading CockroachDB on Kubernetes](upgrade-cockroachdb-kubernetes.html)
- [Optimizing CockroachDB performance on Kubernetes](kubernetes-performance.html)

### Additional topics

- [Deploying CockroachDB on Red Hat OpenShift](deploy-cockroachdb-with-kubernetes-openshift.html)
- [Orchestrating CockroachDB across multiple Kubernetes clusters](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html)

## Kubernetes terminology

Before starting, review some basic Kubernetes terminology. Note that CockroachDB [nodes](architecture/overview.html#terms) are distinct from Kubernetes "nodes" or "worker nodes".

Feature | Description
--------|------------
[node](https://kubernetes.io/docs/concepts/architecture/nodes/) | A physical or virtual machine. In the [deployment tutorial](deploy-cockroachdb-kubernetes.html), you'll create GCE or AWS instances and join them as worker nodes into a single Kubernetes cluster from your local workstation.
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one of more Docker containers. In the [deployment tutorial](deploy-cockroachdb-kubernetes.html), each pod will run on a separate Kubernetes worker node and include one Docker container running a single CockroachDB node, reflecting our [topology recommendations](recommended-production-settings.html#topology).
[StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) | A StatefulSet is a group of pods treated as stateful units, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart. StatefulSets are considered stable as of Kubernetes version 1.9 after reaching beta in version 1.5.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | A persistent volume is a piece of networked storage (Persistent Disk on GCE, Elastic Block Store on AWS) mounted into a pod. The lifetime of a persistent volume is decoupled from the lifetime of the pod that's using it, ensuring that each CockroachDB node binds back to the same storage on restart.<br><br>The [deployment tutorial](deploy-cockroachdb-kubernetes.html) assumes that dynamic volume provisioning is available. When that is not the case, [persistent volume claims](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) need to be created manually.
[RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) | RBAC, or Role-Based Access Control, is the system Kubernetes uses to manage permissions within the cluster. In order to take an action (e.g., `get` or `create`) on an API resource (e.g., a `pod`), the client must have a `Role` that allows it to do so. The [deployment tutorial](deploy-cockroachdb-kubernetes.html) creates the RBAC resources necessary for CockroachDB to create and access certificates.