#### Kubernetes version

To deploy CockroachDB {{page.version.version}}, Kubernetes 1.18 or higher is required. Cockroach Labs strongly recommends that you use a Kubernetes version that is [eligible for patch support by the Kubernetes project](https://kubernetes.io/releases/).

#### Helm version

Helm 3.0 or higher is required when using our instructions to [deploy via Helm](orchestrate-cockroachdb-with-kubernetes.html#step-2-start-cockroachdb).

#### Resources

When starting Kubernetes, select machines with at least **4 vCPUs** and **16 GiB** of memory, and provision at least **2 vCPUs** and **8 Gi** of memory to CockroachDB per pod. These minimum settings are used by default in this deployment guide, and are appropriate for testing purposes only. On a production deployment, you should adjust the resource settings for your workload.

#### Storage

At this time, orchestrations of CockroachDB with Kubernetes use external persistent volumes that are often replicated by the provider. Because CockroachDB already replicates data automatically, this additional layer of replication is unnecessary and can negatively impact performance. High-performance use cases on a private Kubernetes cluster may want to consider using [local volumes](https://kubernetes.io/docs/concepts/storage/volumes/#local).
