### Limitations

#### Kubernetes Version

Kubernetes 1.6 is the minimum required to successfully run CockroachDB.

#### Storage

At this time, orchestrations of CockroachDB with Kubernetes use external persistent volumes that are often replicated by the provider. Because CockroachDB already replicates data automatically, this additional layer of replication is unnecessary and can negatively impact performance. High-performance use cases on a private Kubernetes cluster may want to consider a [DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/) deployment until StatefulSets support node-local storage.

Also, due to the bootstrapping in the current approach, a storage failure of the first node is special in that the administrator must manually prepopulate the "new" storage medium by running an instance of CockroachDB with the `--join` parameter. If this is not done, the first node will bootstrap a new cluster, which will lead to trouble.
