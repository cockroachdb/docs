#### Kubernetes version

Kubernetes 1.18 or higher is required in order to use our current configuration files. If you need to run on a previous version of Kubernetes, we keep configuration files in the versioned subdirectories of the [CockroachDB Kubernetes repository](https://github.com/cockroachdb/cockroach/tree/master/cloud/kubernetes) (e.g., [v1.7](https://github.com/cockroachdb/cockroach/tree/master/cloud/kubernetes/v1.7)).

#### Kubernetes Operator

The CockroachDB Kubernetes Operator currently deploys clusters in a single region. For multi-region deployments using manual configs, see [Orchestrate CockroachDB Across Multiple Kubernetes Clusters](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html).

#### Helm version

The CockroachDB Helm chart requires Helm 3.0 or higher. If you attempt to use an incompatible Helm version, an error like the following occurs:

~~~ shell
Error: UPGRADE FAILED: template: cockroachdb/templates/tests/client.yaml:6:14: executing "cockroachdb/templates/tests/client.yaml" at <.Values.networkPolicy.enabled>: nil pointer evaluating interface {}.enabled
~~~

The CockroachDB Helm chart is compatible with Kubernetes versions 1.22 and earlier (the latest version as of this writing). However, no new feature development is currently planned. 

#### Resources

When starting Kubernetes, select machines with at least **4 vCPUs** and **16 GiB** of memory, and provision at least **2 vCPUs** and **8 Gi** of memory to CockroachDB per pod. These minimum settings are used by default in this deployment guide, and are appropriate for testing purposes only. On a production deployment, you should adjust the resource settings for your workload. For details, see [Resource management](configure-cockroachdb-kubernetes.html#memory-and-cpu).

#### Storage

At this time, orchestrations of CockroachDB with Kubernetes use external persistent volumes that are often replicated by the provider. Because CockroachDB already replicates data automatically, this additional layer of replication is unnecessary and can negatively impact performance. High-performance use cases on a private Kubernetes cluster may want to consider using [local volumes](https://kubernetes.io/docs/concepts/storage/volumes/#local).
