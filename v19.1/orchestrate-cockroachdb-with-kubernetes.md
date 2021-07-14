---
title: Orchestrate CockroachDB in a Single Kubernetes Cluster
summary: How to orchestrate the deployment, management, and monitoring of a secure 3-node CockroachDB cluster with Kubernetes.
toc: true
toc_not_nested: true
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

- [Kubernetes terminology](#kubernetes-terminology)
- [Limitations](#limitations)

### Kubernetes terminology

Feature | Description
--------|------------
[node](https://kubernetes.io/docs/concepts/architecture/nodes/) | A physical or virtual machine. In this tutorial, you'll create GCE or AWS instances and join them as worker nodes into a single Kubernetes cluster from your local workstation.
[pod](http://kubernetes.io/docs/user-guide/pods/) | A pod is a group of one of more Docker containers. In this tutorial, each pod will run on a separate Kubernetes node and include one Docker container running a single CockroachDB node. You'll start with 3 pods and grow to 4.
[StatefulSet](http://kubernetes.io/docs/concepts/abstractions/controllers/statefulsets/) | A StatefulSet is a group of pods treated as stateful units, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart. StatefulSets are considered stable as of Kubernetes version 1.9 after reaching beta in version 1.5.
[persistent volume](http://kubernetes.io/docs/user-guide/persistent-volumes/) | A persistent volume is a piece of networked storage (Persistent Disk on GCE, Elastic Block Store on AWS) mounted into a pod. The lifetime of a persistent volume is decoupled from the lifetime of the pod that's using it, ensuring that each CockroachDB node binds back to the same storage on restart.<br><br>This tutorial assumes that dynamic volume provisioning is available. When that is not the case, [persistent volume claims](http://kubernetes.io/docs/user-guide/persistent-volumes/#persistentvolumeclaims) need to be created manually.
[CSR](https://kubernetes.io/docs/tasks/tls/managing-tls-in-a-cluster/) | A CSR, or Certificate Signing Request, is a request to have a TLS certificate signed by the Kubernetes cluster's built-in CA. As each pod is created, it issues a CSR for the CockroachDB node running in the pod, which must be manually checked and approved. The same is true for clients as they connect to the cluster. Note that Kubernetes environments that do not support CSRs, such as Amazon EKS, can [use a different certificate authority](https://github.com/cockroachdb/cockroach/tree/master/cloud/kubernetes/bring-your-own-certs) than the one Kubernetes uses.
[RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) | RBAC, or Role-Based Access Control, is the system Kubernetes uses to manage permissions within the cluster. In order to take an action (e.g., `get` or `create`) on an API resource (e.g., a `pod` or `CSR`), the client must have a `Role` that allows it to do so. This tutorial creates the RBAC resources necessary for CockroachDB to create and access certificates.

### Limitations

{% include {{ page.version.version }}/orchestration/kubernetes-limitations.md %}

#### CSR names

When Kubernetes issues a [CSR](https://kubernetes.io/docs/tasks/tls/managing-tls-in-a-cluster/) (Certificate Signing Request) to have a node or client certificate signed by the Kubernetes CA, Kubernetes requires the CSR name to start and end with an alphanumeric character and otherwise consist of lowercase alphanumeric characters, `-`, or `.`

CSR names contain the StatefulSet or Helm chart `name`, so if you customize that value, be sure to conform to these naming requirements. For client certificates, CSR names also contain the username of the SQL user for which the certificate is being generated, so be sure SQL usernames also conform to these naming requirements. For example, avoid using the underscore character (`_`) in these names.

## Step 1. Start Kubernetes

{% include {{ page.version.version }}/orchestration/start-kubernetes.md %}

## Step 2. Start CockroachDB

To start your CockroachDB cluster, you can either use our StatefulSet configuration and related files directly, or you can use the [Helm](https://helm.sh/) package manager for Kubernetes to simplify the process.

{{site.data.alerts.callout_danger}}
Secure CockroachDB deployments on Amazon EKS via Helm are [not yet supported](https://github.com/cockroachdb/cockroach/issues/38847). In the meantime, use a StatefulSet configuration to deploy on EKS.

Note that when running on Amazon EKS, certificates signed by Kubernetes' built-in CA are not supported, so use [this configuration file](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/bring-your-own-certs/cockroachdb-statefulset.yaml) instead of `cockroachdb-statefulset-secure.yaml` referenced below. Follow the steps at the top of the file to load externally created certificates into Kubernetes and initialize the CockroachDB cluster.
{{site.data.alerts.end}}

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

3. Get the name of the `Pending` CSR for the new pod:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get csr
    ~~~

    <section class="filter-content" markdown="1" data-scope="manual">
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
    ...
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    ~~~
    NAME                                                   AGE       REQUESTOR                               CONDITION
    default.client.root                                    1h        system:serviceaccount:default:default   Approved,Issued
    default.node.my-release-cockroachdb-0                  1h        system:serviceaccount:default:default   Approved,Issued
    default.node.my-release-cockroachdb-1                  1h        system:serviceaccount:default:default   Approved,Issued
    default.node.my-release-cockroachdb-2                  1h        system:serviceaccount:default:default   Approved,Issued
    default.node.my-release-cockroachdb-3                  2m        system:serviceaccount:default:default   Pending
    node-csr-0Xmb4UTVAWMEnUeGbW4KX1oL4XV_LADpkwjrPtQjlZ4   1h        kubelet                                 Approved,Issued
    node-csr-NiN8oDsLhxn0uwLTWa0RWpMUgJYnwcFxB984mwjjYsY   1h        kubelet                                 Approved,Issued
    node-csr-aU78SxyU69pDK57aj6txnevr7X-8M3XgX9mTK0Hso6o   1h        kubelet                                 Approved,Issued
    ...
    ~~~
    </section>

    If you do not see a `Pending` CSR, wait a minute and try again.

4. Examine the CSR for the new pod:

    <section class="filter-content" markdown="1" data-scope="manual">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl describe csr default.node.cockroachdb-3
    ~~~

    ~~~
    Name:               default.node.cockroachdb-3
    Labels:             <none>
    Annotations:        <none>
    CreationTimestamp:  Wed, 30 Oct 2019 13:46:52 -0400
    Requesting User:    system:serviceaccount:default:cockroachdb
    Status:             Pending
    Subject:
      Common Name:    node
      Serial Number:
      Organization:   Cockroach
    Subject Alternative Names:
             DNS Names:     localhost
                            cockroachdb-3.cockroachdb.default.svc.cluster.local
                            cockroachdb-3.cockroachdb
                            cockroachdb-public
                            cockroachdb-public.default.svc.cluster.local
             IP Addresses:  127.0.0.1
    Events:  <none>
    ~~~    
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl describe csr default.node.my-release-cockroachdb-3
    ~~~

    ~~~
    Name:               default.node.my-release-cockroachdb-3
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
                            my-release-cockroachdb-3.my-release-cockroachdb.default.svc.cluster.local
                            my-release-cockroachdb-3.my-release-cockroachdb
                            my-release-cockroachdb-public
                            my-release-cockroachdb-public.default.svc.cluster.local
             IP Addresses:  127.0.0.1
                            10.48.1.6
    Events:  <none>
    ~~~
    </section>

5. If everything looks correct, approve the CSR for the new pod:

    <section class="filter-content" markdown="1" data-scope="manual">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl certificate approve default.node.cockroachdb-3
    ~~~

    ~~~
    certificatesigningrequest.certificates.k8s.io/default.node.cockroachdb-3 approved
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl certificate approve default.node.my-release-cockroachdb-3
    ~~~

    ~~~
    certificatesigningrequest.certificates.k8s.io/default.node.my-release-cockroachdb-3 approved
    ~~~
    </section>

6. Verify that the new pod started successfully:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    <section class="filter-content" markdown="1" data-scope="manual">
    ~~~
    NAME                        READY     STATUS    RESTARTS   AGE
    cockroachdb-0               1/1       Running   0          51m
    cockroachdb-1               1/1       Running   0          47m
    cockroachdb-2               1/1       Running   0          3m
    cockroachdb-3               1/1       Running   0          1m
    cockroachdb-client-secure   1/1       Running   0          15m
    ...
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    ~~~
    NAME                        READY     STATUS    RESTARTS   AGE
    my-release-cockroachdb-0    1/1       Running   0          51m
    my-release-cockroachdb-1    1/1       Running   0          47m
    my-release-cockroachdb-2    1/1       Running   0          3m
    my-release-cockroachdb-3    1/1       Running   0          1m
    cockroachdb-client-secure   1/1       Running   0          15m
    ...
    ~~~
    </section>

8. Back in the Admin UI, view **Node List** to ensure that the fourth node successfully joined the cluster.

### Remove nodes

{% include {{ page.version.version }}/orchestration/kubernetes-remove-nodes-secure.md %}

### Expand disk size

{% include {{ page.version.version }}/orchestration/kubernetes-expand-disk-size.md %}

### Upgrade the cluster

{% include {{ page.version.version }}/orchestration/kubernetes-upgrade-cluster.md %}

### Stop the cluster

To shut down the CockroachDB cluster:

1. Delete all of the resources associated with the `cockroachdb` label, including the logs, remote persistent volumes, and Prometheus and Alertmanager resources:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pods,statefulsets,services,persistentvolumeclaims,persistentvolumes,poddisruptionbudget,jobs,rolebinding,clusterrolebinding,role,clusterrole,serviceaccount,alertmanager,prometheus,prometheusrule,serviceMonitor -l app=cockroachdb
    ~~~

    ~~~
    pod "cockroachdb-0" deleted
    pod "cockroachdb-1" deleted
    pod "cockroachdb-2" deleted
    statefulset.apps "alertmanager-cockroachdb" deleted
    statefulset.apps "prometheus-cockroachdb" deleted
    service "alertmanager-cockroachdb" deleted
    service "cockroachdb" deleted
    service "cockroachdb-public" deleted
    persistentvolumeclaim "datadir-cockroachdb-0" deleted
    persistentvolumeclaim "datadir-cockroachdb-1" deleted
    persistentvolumeclaim "datadir-cockroachdb-2" deleted
    persistentvolumeclaim "datadir-cockroachdb-3" deleted
    poddisruptionbudget.policy "cockroachdb-budget" deleted
    job.batch "cluster-init-secure" deleted
    rolebinding.rbac.authorization.k8s.io "cockroachdb" deleted
    clusterrolebinding.rbac.authorization.k8s.io "cockroachdb" deleted
    clusterrolebinding.rbac.authorization.k8s.io "prometheus" deleted
    role.rbac.authorization.k8s.io "cockroachdb" deleted
    clusterrole.rbac.authorization.k8s.io "cockroachdb" deleted
    clusterrole.rbac.authorization.k8s.io "prometheus" deleted
    serviceaccount "cockroachdb" deleted
    serviceaccount "prometheus" deleted
    alertmanager.monitoring.coreos.com "cockroachdb" deleted
    prometheus.monitoring.coreos.com "cockroachdb" deleted
    prometheusrule.monitoring.coreos.com "prometheus-cockroachdb-rules" deleted
    servicemonitor.monitoring.coreos.com "cockroachdb" deleted
    ~~~

2. Delete the pod created for `cockroach` client commands, if you didn't do so earlier:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pod cockroachdb-client-secure
    ~~~

    ~~~
    pod "cockroachdb-client-secure" deleted
    ~~~

3. Get the names of the CSRs for the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get csr
    ~~~

    <section class="filter-content" markdown="1" data-scope="manual">
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
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    ~~~
    NAME                                                   AGE       REQUESTOR                               CONDITION
    default.client.root                                    1h        system:serviceaccount:default:default   Approved,Issued
    default.node.my-release-cockroachdb-0                  1h        system:serviceaccount:default:default   Approved,Issued
    default.node.my-release-cockroachdb-1                  1h        system:serviceaccount:default:default   Approved,Issued
    default.node.my-release-cockroachdb-2                  1h        system:serviceaccount:default:default   Approved,Issued
    default.node.my-release-cockroachdb-3                  12m       system:serviceaccount:default:default   Approved,Issued
    node-csr-0Xmb4UTVAWMEnUeGbW4KX1oL4XV_LADpkwjrPtQjlZ4   1h        kubelet                                 Approved,Issued
    node-csr-NiN8oDsLhxn0uwLTWa0RWpMUgJYnwcFxB984mwjjYsY   1h        kubelet                                 Approved,Issued
    node-csr-aU78SxyU69pDK57aj6txnevr7X-8M3XgX9mTK0Hso6o   1h        kubelet                                 Approved,Issued
    ...
    ~~~
    </section>

4. Delete the CSRs that you created:

    <section class="filter-content" markdown="1" data-scope="manual">
    {% include copy-clipboard.html %}
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
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete csr default.client.root default.node.my-release-cockroachdb-0 default.node.my-release-cockroachdb-1 default.node.my-release-cockroachdb-2 default.node.my-release-cockroachdb-3
    ~~~

    ~~~
    certificatesigningrequest "default.client.root" deleted
    certificatesigningrequest "default.node.my-release-cockroachdb-0" deleted
    certificatesigningrequest "default.node.my-release-cockroachdb-1" deleted
    certificatesigningrequest "default.node.my-release-cockroachdb-2" deleted
    certificatesigningrequest "default.node.my-release-cockroachdb-3" deleted
    ~~~
    </section>

5. Get the names of the secrets for the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get secrets
    ~~~

    <section class="filter-content" markdown="1" data-scope="manual">
    ~~~
    NAME                              TYPE                                  DATA      AGE
    alertmanager-cockroachdb          Opaque                                1         1h
    default-token-d9gff               kubernetes.io/service-account-token   3         5h
    default.client.root               Opaque                                2         5h
    default.node.cockroachdb-0        Opaque                                2         5h
    default.node.cockroachdb-1        Opaque                                2         5h
    default.node.cockroachdb-2        Opaque                                2         5h
    default.node.cockroachdb-3        Opaque                                2         5h
    prometheus-operator-token-bpdv8   kubernetes.io/service-account-token   3         3h    
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    ~~~
    NAME                                     TYPE                                  DATA      AGE
    alertmanager-cockroachdb                 Opaque                                1         1h
    default-token-d9gff                      kubernetes.io/service-account-token   3         5h
    default.client.root                      Opaque                                2         5h
    default.node.my-release-cockroachdb-0    Opaque                                2         5h
    default.node.my-release-cockroachdb-1    Opaque                                2         5h
    default.node.my-release-cockroachdb-2    Opaque                                2         5h
    default.node.my-release-cockroachdb-3    Opaque                                2         5h
    prometheus-operator-token-bpdv8          kubernetes.io/service-account-token   3         3h
    ~~~
    </section>

6. Delete the secrets that you created:

    <section class="filter-content" markdown="1" data-scope="manual">
    {% include copy-clipboard.html %}
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
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete secrets alertmanager-cockroachdb default.client.root default.node.my-release-cockroachdb-0 default.node.my-release-cockroachdb-1 default.node.my-release-cockroachdb-2 default.node.my-release-cockroachdb-3
    ~~~

    ~~~
    secret "alertmanager-cockroachdb" deleted
    secret "default.client.root" deleted
    secret "default.node.my-release-cockroachdb-0" deleted
    secret "default.node.my-release-cockroachdb-1" deleted
    secret "default.node.my-release-cockroachdb-2" deleted
    secret "default.node.my-release-cockroachdb-3" deleted
    ~~~
    </section>

7. Stop Kubernetes:
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

## See also

- [Kubernetes Multi-Cluster Deployment](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html)
- [Kubernetes Performance Guide](kubernetes-performance.html)
{% include {{ page.version.version }}/prod-deployment/prod-see-also.md %}
