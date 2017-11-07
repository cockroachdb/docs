### Limitations

#### Kubernetes Version

Kubernetes 1.7 or higher is required. Earlier versions do not support the `maxUnavailability` field and `PodDisruptionBudget` resource type used in the CockroachDB StatefulSet configuration.

#### Storage

At this time, orchestrations of CockroachDB with Kubernetes use external persistent volumes that are often replicated by the provider. Because CockroachDB already replicates data automatically, this additional layer of replication is unnecessary and can negatively impact performance. High-performance use cases on a private Kubernetes cluster may want to consider a [DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/) deployment until StatefulSets support node-local storage.
