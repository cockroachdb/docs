#### Kubernetes version

Kubernetes 1.15 or higher is required in order to use our current configuration files. If you need to run on an older version of Kubernetes, we keep configuration files in the versioned subdirectories of [https://github.com/cockroachdb/cockroach/tree/master/cloud/kubernetes](https://github.com/cockroachdb/cockroach/tree/master/cloud/kubernetes) (e.g., [v1.7](https://github.com/cockroachdb/cockroach/tree/master/cloud/kubernetes/v1.7)).

#### Helm version

Helm 3.0 or higher is required when using our instructions to deploy via Helm.

#### Storage

At this time, orchestrations of CockroachDB with Kubernetes use external persistent volumes that are often replicated by the provider. Because CockroachDB already replicates data automatically, this additional layer of replication is unnecessary and can negatively impact performance. High-performance use cases on a private Kubernetes cluster may want to consider using [local volumes](https://kubernetes.io/docs/concepts/storage/volumes/#local).