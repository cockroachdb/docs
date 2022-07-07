#### Kubernetes version

Kubernetes 1.18 or higher is required in order to use our current configuration files. If you need to run on an older version of Kubernetes, we keep configuration files in the versioned subdirectories of [https://github.com/cockroachdb/cockroach/tree/master/cloud/kubernetes](https://github.com/cockroachdb/cockroach/tree/master/cloud/kubernetes) (e.g., [v1.7](https://github.com/cockroachdb/cockroach/tree/master/cloud/kubernetes/v1.7)).

#### Kubernetes Operator

The CockroachDB Kubernetes Operator currently deploys clusters in a single region. For multi-region deployments using manual configs, see [Orchestrate CockroachDB Across Multiple Kubernetes Clusters](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html).

#### Helm version

Helm 3.0 or higher is required when using our instructions to deploy via Helm. If you attempt to use Helm 2.x, an error like the following occurs:

~~~ shell
Error: UPGRADE FAILED: template: cockroachdb/templates/tests/client.yaml:6:14: executing "cockroachdb/templates/tests/client.yaml" at <.Values.networkPolicy.enabled>: nil pointer evaluating interface {}.enabled
~~~

This error occurs because in Helm 2, each version of CockroachDB is represented by a separate chart. To use Helm 2 to deploy and manage CockroachDB, you must download the version-specific chart and make additional modifications. We do not recommend using Helm 2 to deploy and manage CockroachDB.

The CockroachDB Helm chart is compatible with Kubernetes versions 1.22 and earlier (the latest version as of this writing). However, no new feature development is currently planned. 

#### Resources

When starting Kubernetes, select machines with at least **4 vCPUs** and **16 GiB** of memory, and provision at least **2 vCPUs** and **8 Gi** of memory to CockroachDB per pod. These minimum settings are used by default in this deployment guide, and are appropriate for testing purposes only. On a production deployment, you should adjust the resource settings for your workload. For details, see [Operate CockroachDB on Kubernetes](operate-cockroachdb-kubernetes.html#allocate-resources).

#### Storage

At this time, orchestrations of CockroachDB with Kubernetes use external persistent volumes that are often replicated by the provider. Because CockroachDB already replicates data automatically, this additional layer of replication is unnecessary and can negatively impact performance. High-performance use cases on a private Kubernetes cluster may want to consider using [local volumes](https://kubernetes.io/docs/concepts/storage/volumes/#local).
