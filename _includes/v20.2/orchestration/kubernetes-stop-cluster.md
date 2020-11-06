To shut down the CockroachDB cluster:

<section class="filter-content" markdown="1" data-scope="operator">
1. Delete the previously created custom resource:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete -f example.yaml
    ~~~

1. Remove the Operator:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/master/manifests/operator.yaml
    ~~~

1. Delete the persistent volumes and persistent volume claims:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pv,pvc --all
    ~~~

1. Get the names of any CSRs for the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get csr
    ~~~

    ~~~
    NAME                                                   AGE   REQUESTOR                                                  CONDITION
    csr-hjrr5                                              97m   system:node:gke-cockroachdb-default-pool-e0f7fb86-40hb     Approved,Issued
    csr-lhwvc                                              94m   system:node:gke-cockroachdb-default-pool-e0f7fb86-p2sn     Approved,Issued
    csr-wvt4t                                              95m   system:node:gke-cockroachdb-default-pool-e0f7fb86-svzq     Approved,Issued
    node-csr-26nkIg8dIy_U_BjUaYZVejh0ZmsBJxyHUU8Y021LKVs   97m   kubelet                                                    Approved,Issued
    node-csr-C6vvc3q1ghjA2K-tsjFqGy11enckseDD3wlAaYfeACc   96m   kubelet                                                    Approved,Issued
    node-csr-q_WCj6-Hl5dRrXk8igqjOfpb1rfRXEQhxiIUaqqvi_A   98m   kubelet                                                    Approved,Issued
    node.cockroachdb.default.svc.cluster.local             29m   system:serviceaccount:default:cockroach-operator-default   Approved,Issued
    root.cockroachdb.default.svc.cluster.local             19m   system:serviceaccount:default:cockroach-operator-default   Approved,Issued
    ~~~

1. Delete any CSRs that you created:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete csr node.cockroachdb.default.svc.cluster.local root.cockroachdb.default.svc.cluster.local 
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="manual">
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

1. Delete the pod created for `cockroach` client commands, if you didn't do so earlier:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pod cockroachdb-client-secure
    ~~~

    ~~~
    pod "cockroachdb-client-secure" deleted
    ~~~

1. Get the names of any CSRs for the cluster:

    {% include copy-clipboard.html %}
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

1. Delete any CSRs that you created:

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

1. Get the names of the secrets for the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get secrets
    ~~~

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

1. Delete the secrets that you created:

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
1. Uninstall the release:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ helm uninstall my-release
    ~~~

    ~~~
    release "my-release" deleted
    ~~~

1. Delete the pod created for `cockroach` client commands, if you didn't do so earlier:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pod cockroachdb-client-secure
    ~~~

    ~~~
    pod "cockroachdb-client-secure" deleted
    ~~~

1. Get the names of any CSRs for the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get csr
    ~~~

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

1. Delete any CSRs that you created:

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

1. Get the names of the secrets for the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get secrets
    ~~~

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

1. Delete the secrets that you created:

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