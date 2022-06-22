---
title: Orchestrate CockroachDB in a Single Kubernetes Cluster
summary: How to orchestrate the deployment, management, and monitoring of a secure 3-node CockroachDB cluster with Kubernetes.
toc: true
secure: true
---

<div class="filters filters-big clearfix">
  <button class="filter-button current"><strong>Secure</strong></button>
  <a href="orchestrate-cockroachdb-with-kubernetes-insecure.html"><button class="filter-button">Insecure</button></a>
</div>

This page shows you how to orchestrate the deployment, management, and monitoring of a secure 3-node CockroachDB cluster in a single [Kubernetes](http://kubernetes.io/) cluster, using the [StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) feature directly or via the [Helm](https://helm.sh/) package manager for Kubernetes.

To deploy across multiple Kubernetes clusters in different geographic regions instead, see [Kubernetes Multi-Cluster Deployment](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html). Also, for details about potential performance bottlenecks to be aware of when running CockroachDB in Kubernetes and guidance on how to optimize your deployment for better performance, see [CockroachDB Performance on Kubernetes](kubernetes-performance.html).

## Before you begin

Before getting started, it's helpful to review some Kubernetes-specific terminology and current limitations.

### Kubernetes terminology

Feature | Description
--------|------------
instance | A physical or virtual machine. In this tutorial, you'll create GCE or AWS instances and join them into a single Kubernetes cluster from your local workstation.
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one or more Docker containers. In this tutorial, each pod will run on a separate instance and include one Docker container running a single CockroachDB node. You'll start with 3 pods and grow to 4.
[StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) | A StatefulSet is a group of pods treated as stateful units, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart. StatefulSets are considered stable as of Kubernetes version 1.9 after reaching beta in version 1.5.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | A persistent volume is a piece of networked storage (Persistent Disk on GCE, Elastic Block Store on AWS) mounted into a pod. The lifetime of a persistent volume is decoupled from the lifetime of the pod that's using it, ensuring that each CockroachDB node binds back to the same storage on restart.<br><br>This tutorial assumes that dynamic volume provisioning is available. When that is not the case, [persistent volume claims](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) need to be created manually.
[CSR](https://kubernetes.io/docs/tasks/tls/managing-tls-in-a-cluster/) | A CSR, or Certificate Signing Request, is a request to have a TLS certificate signed by the Kubernetes cluster's built-in CA. As each pod is created, it issues a CSR for the CockroachDB node running in the pod, which must be manually checked and approved. The same is true for clients as they connect to the cluster.
[RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) | RBAC, or Role-Based Access Control, is the system Kubernetes uses to manage permissions within the cluster. In order to take an action (e.g., `get` or `create`) on an API resource (e.g., a `pod` or `CSR`), the client must have a `Role` that allows it to do so. This tutorial creates the RBAC resources necessary for CockroachDB to create and access certificates.

### Limitations

{% include {{ page.version.version }}/orchestration/kubernetes-limitations.md %}

## Step 1. Start Kubernetes

{% include {{ page.version.version }}/orchestration/start-kubernetes.md %}

## Step 2. Start CockroachDB

To start your CockroachDB cluster, you can either use our StatefulSet configuration and related files directly, or you can use the [Helm](https://helm.sh/) package manager for Kubernetes to simplify the process.

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="helm">Use Helm</button>
    <button class="filter-button" data-scope="manual">Use Configs</button>
</div>

<section class="filter-content" markdown="1" data-scope="manual">
{% include {{ page.version.version }}/orchestration/start-cockroachdb-secure.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
{% include {{ page.version.version }}/orchestration/start-cockroachdb-helm-secure.md %}
</section>

## Step 3. Use the built-in SQL client

{% include {{ page.version.version }}/orchestration/test-cluster-secure.md %}

## Step 4. Access the Admin UI

{% include {{ page.version.version }}/orchestration/monitor-cluster.md %}

## Step 5. Simulate node failure

{% include {{ page.version.version }}/orchestration/kubernetes-simulate-failure.md %}

## Step 6. Set up monitoring and alerting

{% include {{ page.version.version }}/orchestration/kubernetes-prometheus-alertmanager.md %}

## Step 7. Maintain the cluster

### Add nodes

{% include {{ page.version.version }}/orchestration/kubernetes-scale-cluster.md %}

3. Get the name of the `Pending` CSR for the new pod:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get csr
    ~~~

    ~~~
    NAME                                                   AGE       REQUESTOR                               CONDITION
    default.client.root                                    1h        system:serviceaccount:default:default   Approved,Issued
    default.node.cockroachdb-0                             1h        system:serviceaccount:default:default   Approved,Issued
    default.node.cockroachdb-1                             1h        system:serviceaccount:default:default   Approved,Issued
    default.node.cockroachdb-2                             1h        system:serviceaccount:default:default   Approved,Issued
    default.node.cockroachdb-3                             2m        system:serviceaccount:default:default   Pending
    node-csr-0Xmb4UTVAWMEnUeGbW4KX1oL4XV_LADpkwjrPtQjlZ4   1h        kubelet                                 Approved,Issued
    node-csr-NiN8oDsLhxn0uwLTWa0RWpMUgJYnwcFxB984mwjjYsY   1h        kubelet                                 Approved,Issued
    node-csr-aU78SxyU69pDK57aj6txnevr7X-8M3XgX9mTK0Hso6o   1h        kubelet                                 Approved,Issued
    ~~~

    If you do not see a `Pending` CSR, wait a minute and try again.

4. Examine the CSR for the new pod:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl describe csr default.node.cockroachdb-3
    ~~~

    ~~~
    Name:               default.node.cockroachdb-0
    Labels:             <none>
    Annotations:        <none>
    CreationTimestamp:  Thu, 09 Nov 2017 13:39:37 -0500
    Requesting User:    system:serviceaccount:default:default
    Status:             Pending
    Subject:
      Common Name:    node
      Serial Number:
      Organization:   Cockroach
    Subject Alternative Names:
             DNS Names:     localhost
                            cockroachdb-0.cockroachdb.default.svc.cluster.local
                            cockroachdb-public
             IP Addresses:  127.0.0.1
                            10.48.1.6
    Events:  <none>
    ~~~

5. If everything looks correct, approve the CSR for the new pod:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl certificate approve default.node.cockroachdb-3
    ~~~

    ~~~
    certificatesigningrequest "default.node.cockroachdb-3" approved
    ~~~

6. Verify that the new pod started successfully:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                        READY     STATUS    RESTARTS   AGE
    cockroachdb-0               1/1       Running   0          51m
    cockroachdb-1               1/1       Running   0          47m
    cockroachdb-2               1/1       Running   0          3m
    cockroachdb-3               1/1       Running   0          1m
    cockroachdb-client-secure   1/1       Running   0          15m
    ~~~

8. Back in the Admin UI, view **Node List** to ensure that the fourth node successfully joined the cluster.

### Remove nodes

{% include {{ page.version.version }}/orchestration/kubernetes-remove-nodes-secure.md %}

### Upgrade the cluster

{% include {{ page.version.version }}/orchestration/kubernetes-upgrade-cluster.md %}

### Stop the cluster

To shut down the CockroachDB cluster:

1. Delete all of the resources associated with the `cockroachdb` label, including the logs, remote persistent volumes, and Prometheus and Alertmanager resources:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pods,statefulsets,services,persistentvolumeclaims,persistentvolumes,poddisruptionbudget,jobs,rolebinding,clusterrolebinding,role,clusterrole,serviceaccount,alertmanager,prometheus,prometheusrule,serviceMonitor -l app=cockroachdb
    ~~~

    ~~~
    pod "cockroachdb-0" deleted
    pod "cockroachdb-1" deleted
    pod "cockroachdb-2" deleted
    service "alertmanager-cockroachdb" deleted
    service "cockroachdb" deleted
    service "cockroachdb-public" deleted
    persistentvolumeclaim "datadir-cockroachdb-0" deleted
    persistentvolumeclaim "datadir-cockroachdb-1" deleted
    persistentvolumeclaim "datadir-cockroachdb-2" deleted
    poddisruptionbudget "cockroachdb-budget" deleted
    job "cluster-init-secure" deleted
    rolebinding "cockroachdb" deleted
    clusterrolebinding "cockroachdb" deleted
    clusterrolebinding "prometheus" deleted
    role "cockroachdb" deleted
    clusterrole "cockroachdb" deleted
    clusterrole "prometheus" deleted
    serviceaccount "cockroachdb" deleted
    serviceaccount "prometheus" deleted
    alertmanager "cockroachdb" deleted
    prometheus "cockroachdb" deleted
    prometheusrule "prometheus-cockroachdb-rules" deleted
    servicemonitor "cockroachdb" deleted
    ~~~

2. Delete the pod created for `cockroach` client commands, if you didn't do so earlier:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pod cockroachdb-client-secure
    ~~~

    ~~~
    pod "cockroachdb-client-secure" deleted
    ~~~

3. Get the names of the CSRs for the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get csr
    ~~~

    ~~~
    NAME                                                   AGE       REQUESTOR                               CONDITION
    default.client.root                                    1h        system:serviceaccount:default:default   Approved,Issued
    default.node.cockroachdb-0                             1h        system:serviceaccount:default:default   Approved,Issued
    default.node.cockroachdb-1                             1h        system:serviceaccount:default:default   Approved,Issued
    default.node.cockroachdb-2                             1h        system:serviceaccount:default:default   Approved,Issued
    default.node.cockroachdb-3                             12m       system:serviceaccount:default:default   Approved,Issued
    node-csr-0Xmb4UTVAWMEnUeGbW4KX1oL4XV_LADpkwjrPtQjlZ4   1h        kubelet                                 Approved,Issued
    node-csr-NiN8oDsLhxn0uwLTWa0RWpMUgJYnwcFxB984mwjjYsY   1h        kubelet                                 Approved,Issued
    node-csr-aU78SxyU69pDK57aj6txnevr7X-8M3XgX9mTK0Hso6o   1h        kubelet                                 Approved,Issued
    ~~~

4. Delete the CSRs that you created:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete csr default.client.root default.node.cockroachdb-0 default.node.cockroachdb-1 default.node.cockroachdb-2 default.node.cockroachdb-3
    ~~~

    ~~~
    certificatesigningrequest "default.client.root" deleted
    certificatesigningrequest "default.node.cockroachdb-0" deleted
    certificatesigningrequest "default.node.cockroachdb-1" deleted
    certificatesigningrequest "default.node.cockroachdb-2" deleted
    certificatesigningrequest "default.node.cockroachdb-3" deleted
    ~~~

5. Get the names of the secrets for the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get secrets
    ~~~

    ~~~
    NAME                         TYPE                                  DATA      AGE
    alertmanager-cockroachdb          Opaque                                1         1h
    default-token-d9gff               kubernetes.io/service-account-token   3         5h
    default.client.root               Opaque                                2         5h
    default.node.cockroachdb-0        Opaque                                2         5h
    default.node.cockroachdb-1        Opaque                                2         5h
    default.node.cockroachdb-2        Opaque                                2         5h
    default.node.cockroachdb-3        Opaque                                2         5h
    prometheus-operator-token-bpdv8   kubernetes.io/service-account-token   3         3h
    ~~~

6. Delete the secrets that you created:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete secrets alertmanager-cockroachdb default.client.root default.node.cockroachdb-0 default.node.cockroachdb-1 default.node.cockroachdb-2 default.node.cockroachdb-3
    ~~~

    ~~~
    secret "alertmanager-cockroachdb" deleted
    secret "default.client.root" deleted
    secret "default.node.cockroachdb-0" deleted
    secret "default.node.cockroachdb-1" deleted
    secret "default.node.cockroachdb-2" deleted
    secret "default.node.cockroachdb-3" deleted
    ~~~

7. Stop Kubernetes:
    - Hosted GKE:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ gcloud container clusters delete cockroachdb
        ~~~
    - Manual GCE:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ cluster/kube-down.sh
        ~~~
    - Manual AWS:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ cluster/kube-down.sh
        ~~~

    {{site.data.alerts.callout_danger}}
    If you stop Kubernetes without first deleting the persistent volumes, they will still exist in your cloud project.
    {{site.data.alerts.end}}

## See also

- [Kubernetes Multi-Cluster Deployment](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html)
- [Kubernetes Performance Guide](kubernetes-performance.html)
{% include {{ page.version.version }}/prod-deployment/prod-see-also.md %}
