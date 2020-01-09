#### Kubernetes version

Kubernetes 1.8 or higher is required in order to use our most up-to-date configuration files. Earlier Kubernetes releases do not support some of the options used in our configuration files. If you need to run on an older version of Kubernetes, we have kept around configuration files that work on older Kubernetes releases in the versioned subdirectories of [https://github.com/cockroachdb/cockroach/tree/master/cloud/kubernetes](https://github.com/cockroachdb/cockroach/tree/master/cloud/kubernetes) (e.g., [v1.7](https://github.com/cockroachdb/cockroach/tree/master/cloud/kubernetes/v1.7)).

#### Helm version

Helm 3.0 or higher is required when using our instructions to [deploy via Helm](orchestrate-cockroachdb-with-kubernetes.html#step-2-start-cockroachdb).

#### Storage

At this time, orchestrations of CockroachDB with Kubernetes use external persistent volumes that are often replicated by the provider. Because CockroachDB already replicates data automatically, this additional layer of replication is unnecessary and can negatively impact performance. High-performance use cases on a private Kubernetes cluster may want to consider a [DaemonSet](kubernetes-performance.html#running-in-a-daemonset) deployment until StatefulSets support node-local storage.