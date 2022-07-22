To shut down the CockroachDB cluster:

<section class="filter-content" markdown="1" data-scope="operator">

{% capture latest_operator_version %}{% include_cached latest_operator_version.md %}{% endcapture %}

1. Delete the previously created custom resource:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete -f example.yaml
    ~~~

1. Remove the Operator:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/{{ latest_operator_version }}/install/operator.yaml
    ~~~

    This will delete the CockroachDB cluster being run by the Operator. It will *not* delete the persistent volumes that were attached to the pods. 

    {{site.data.alerts.callout_danger}}
    If you want to delete the persistent volumes and free up the storage used by CockroachDB, be sure you have a backup copy of your data. Data **cannot** be recovered once the persistent volumes are deleted. For more information, see the [Kubernetes documentation](https://kubernetes.io/docs/tasks/run-application/delete-stateful-set/#persistent-volumes).
    {{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
This does not delete any secrets you may have created. For more information on managing secrets, see the [Kubernetes documentation](https://kubernetes.io/docs/tasks/configmap-secret/managing-secret-using-kubectl).
{{site.data.alerts.end}}
</section>

<section class="filter-content" markdown="1" data-scope="manual">
1. Delete the resources associated with the `cockroachdb` label, including the logs and Prometheus and Alertmanager resources:

    {{site.data.alerts.callout_danger}}
    This does not include deleting the persistent volumes that were attached to the pods. If you want to delete the persistent volumes and free up the storage used by CockroachDB, be sure you have a backup copy of your data. Data **cannot** be recovered once the persistent volumes are deleted. For more information, see the [Kubernetes documentation](https://kubernetes.io/docs/tasks/run-application/delete-stateful-set/#persistent-volumes).
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pods,statefulsets,services,poddisruptionbudget,jobs,rolebinding,clusterrolebinding,role,clusterrole,serviceaccount,alertmanager,prometheus,prometheusrule,serviceMonitor -l app=cockroachdb
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

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pod cockroachdb-client-secure
    ~~~

    ~~~
    pod "cockroachdb-client-secure" deleted
    ~~~

{{site.data.alerts.callout_info}}
This does not delete any secrets you may have created. For more information on managing secrets, see the [Kubernetes documentation](https://kubernetes.io/docs/tasks/configmap-secret/managing-secret-using-kubectl).
{{site.data.alerts.end}}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
1. Uninstall the release:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ helm uninstall my-release
    ~~~

    ~~~
    release "my-release" deleted
    ~~~

1. Delete the pod created for `cockroach` client commands, if you didn't do so earlier:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pod cockroachdb-client-secure
    ~~~

    ~~~
    pod "cockroachdb-client-secure" deleted
    ~~~

1. Get the names of any CSRs for the cluster:

    {% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
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

    {{site.data.alerts.callout_info}}
    This does not delete any secrets you may have created. For more information on managing secrets, see the [Kubernetes documentation](https://kubernetes.io/docs/tasks/configmap-secret/managing-secret-using-kubectl).
    {{site.data.alerts.end}}    
</section>
