### Limitations

#### Kubernetes Version

Kubernetes 1.7 or higher is required. Earlier versions do not support the `maxUnavailabile` field and `PodDisruptionBudget` resource type used in the CockroachDB StatefulSet configuration.

{% if page.secure == true %}

If you want to run on Kubernetes 1.6, you can do so by removing `maxUnavailable` and `PodDisruptionBudget` from the [`cockroachdb-statefulset-secure.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset-secure.yaml) file.

{% else %}

If you want to run on Kubernetes 1.6, you can do so by removing `maxUnavailable` and `PodDisruptionBudget` from the [`cockroachdb-statefulset.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset.yaml) file.

{% endif %}

Running on versions earlier than 1.6 would require more substantial changes.

#### Storage

At this time, orchestrations of CockroachDB with Kubernetes use external persistent volumes that are often replicated by the provider. Because CockroachDB already replicates data automatically, this additional layer of replication is unnecessary and can negatively impact performance. High-performance use cases on a private Kubernetes cluster may want to consider a [DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/) deployment until StatefulSets support node-local storage.

