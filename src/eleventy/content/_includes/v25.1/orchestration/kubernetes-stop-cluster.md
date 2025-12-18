To shut down the CockroachDB cluster:

<section class="filter-content" markdown="1" data-scope="operator">
{% capture latest_operator_version %}{% include "latest_operator_version.md" %}{% endcapture %}

1. Delete the previously created custom resource:

    ~~~ shell
    kubectl delete -f example.yaml
    ~~~

1. Remove the Operator:

    ~~~ shell
    kubectl delete -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/v{{ latest_operator_version }}/install/operator.yaml
    ~~~

    This will delete the CockroachDB cluster being run by the Operator. It intentionally does **not** delete:
    - The persistent volumes that were attached to the pods, to avoid the risk of data loss. Before deleting a cluster's persistent volumes, be sure to back them up. For more information, refer to [Delete a Cluster's Persistent Volumes](#delete-a-clusters-persistent-volumes) in the Kubernetes project's documentation.
    - Any secrets you may have created. For more information on managing secrets, refer to [Managing Secrets Using `kubectl`](https://kubernetes.io/docs/tasks/configmap-secret/managing-secret-using-kubectl) in the Kubernetes project's documentation.

</section>

<section class="filter-content" markdown="1" data-scope="manual">

This procedure shuts down the CockroachDB cluster and deletes the resources you just created, including the logs and Prometheus and Alertmanager resources. This command intentionally does **not** delete:

- The persistent volumes that were attached to the pods, to avoid the risk of data loss. Before deleting a cluster's persistent volumes, be sure to back them up. For more information, refer to [Delete a Cluster's Persistent Volumes](#delete-a-clusters-persistent-volumes) in the Kubernetes project's documentation.
- Any secrets you may have created. For more information on managing secrets, refer to [Managing Secrets Using `kubectl`](https://kubernetes.io/docs/tasks/configmap-secret/managing-secret-using-kubectl) in the Kubernetes project's documentation.

{{site.data.alerts.callout_danger}}
Do **not** use the `--all` flag to `kubectl delete`, to avoid the risk of data loss.
{{site.data.alerts.end}}

1. Delete the resources associated with the `cockroachdb` label, including the logs and Prometheus and Alertmanager resources. This command is very long; you may need to scroll your browser to read all of it.

    ~~~ shell
    kubectl delete \
      pods,statefulsets,services,poddisruptionbudget,jobs,rolebinding,clusterrolebinding,role,clusterrole,serviceaccount,alertmanager,prometheus,prometheusrule,serviceMonitor \
      -l app=cockroachdb
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

    ~~~ shell
    kubectl delete pod cockroachdb-client-secure
    ~~~

    ~~~
    pod "cockroachdb-client-secure" deleted
    ~~~

{% capture get_issuers_command %}

    ~~~ shell
    kubectl get issuer
    ~~~
    ~~~ shell
    kubectl delete issuer {issuer_name}
    ~~~
{% endcapture %}

{% capture get_csrs_command %}

    ~~~ shell
    kubectl get csr
    ~~~
    ~~~ shell
    kubectl delete csr default.client.root default.{node_name}
    ~~~
{% endcapture %}

1. Delete the cluster's cryptographic resources.
    <ul><li>If your cluster's certificates are managed using <code>cert-manager</code> (recommended but not default), get the names of the cluster's <code>issuers</code> and delete them: {{ get_issuers_command }}</li><li>If your cluster uses self-signed certificates (the default), get the names of any CSRs for the cluster, then delete them: {{ get_csrs_command }}</li></ul>

</section>

<section class="filter-content" markdown="1" data-scope="helm">
1. Uninstall the release:

    ~~~ shell
    helm uninstall my-release
    ~~~

    ~~~
    release "my-release" deleted
    ~~~

1. Delete the pod created for `cockroach` client commands, if you didn't do so earlier:

    ~~~ shell
    kubectl delete pod cockroachdb-client-secure
    ~~~

    ~~~
    pod "cockroachdb-client-secure" deleted
    ~~~

1. Delete the cluster's cryptographic resources.
    <ul><li>If your cluster's certificates are managed using <code>cert-manager</code> (recommended but not default), get the names of the cluster's <code>issuers</code> and delete them: {{ get_issuers_command }}</li><li>If your cluster uses self-signed certificates (the default), get the names of any CSRs for the cluster, then delete them: {{ get_csrs_command }}</li></ul>

</section>

### Delete a cluster's persistent volumes

If you need to free up the storage used by CockroachDB, you can optionally delete the persistent volumes that were attached to the pods, after first backing up your data.

{{site.data.alerts.callout_danger}}
Before you delete a cluster's persistent volumes, be sure you have a backup copy of your data. Data **cannot** be recovered once the persistent volumes are deleted. For more information, see the [Kubernetes documentation](https://kubernetes.io/docs/tasks/run-application/delete-stateful-set/#persistent-volumes).
{{site.data.alerts.end}}

Refer to the Kubernetes project's documentation for more information and recommendations.
