#### Kubernetes version

To deploy CockroachDB {{page.version.version}}, Kubernetes 1.18 or higher is required. Cockroach Labs strongly recommends that you use a Kubernetes version that is [eligible for patch support by the Kubernetes project](https://kubernetes.io/releases/).

#### Kubernetes Operator

- The CockroachDB Kubernetes Operator currently deploys clusters in a single region. For multi-region deployments using manual configs, see [Orchestrate CockroachDB Across Multiple Kubernetes Clusters]({% link "{{ page.version.version }}/orchestrate-cockroachdb-with-kubernetes-multi-cluster.md" %}).

- Using the Operator, you can give a new cluster an arbitrary number of [labels](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/). However, a cluster's labels cannot be modified after it is deployed. To track the status of this limitation, refer to [#993](https://github.com/cockroachdb/cockroach-operator/issues/993) in the Operator project's issue tracker.

{% unless page.name == "orchestrate-cockroachdb-with-kubernetes-multi-cluster.md" %}
#### Helm version

The CockroachDB Helm chart requires Helm 3.0 or higher. If you attempt to use an incompatible Helm version, an error like the following occurs:

~~~ shell
Error: UPGRADE FAILED: template: cockroachdb/templates/tests/client.yaml:6:14: executing "cockroachdb/templates/tests/client.yaml" at <.Values.networkPolicy.enabled>: nil pointer evaluating interface {}.enabled
~~~

The CockroachDB Helm chart is currently not under active development, and no new features are planned. However, Cockroach Labs remains committed to fully supporting the Helm chart by addressing defects, providing security patches, and addressing breaking changes due to deprecations in Kubernetes APIs.

A deprecation notice for the Helm chart will be provided to customers a minimum of 6 months in advance of actual deprecation.
{% endunless %}

#### Network

Service Name Indication (SNI) is an extension to the TLS protocol which allows a client to indicate which hostname it is attempting to connect to at the start of the TCP handshake process. The server can present multiple certificates on the same IP address and TCP port number, and one server can serve multiple secure websites or API services even if they use different certificates.

Due to its order of operations, the PostgreSQL wire protocol's implementation of TLS is not compatible with SNI-based routing in the Kubernetes ingress controller. Instead, use a TCP load balancer for CockroachDB that is not shared with other services.

#### Resources

When starting Kubernetes, select machines with at least **4 vCPUs** and **16 GiB** of memory, and provision at least **2 vCPUs** and **8 Gi** of memory to CockroachDB per pod. These minimum settings are used by default in this deployment guide, and are appropriate for testing purposes only. On a production deployment, you should adjust the resource settings for your workload. For details, see [Resource management]({% link "{{ page.version.version }}/configure-cockroachdb-kubernetes.md" %}#memory-and-cpu).

#### Storage

Kubernetes deployments use external persistent volumes that are often replicated by the provider. CockroachDB replicates data automatically, and this redundant layer of replication can impact performance. Using [local volumes](https://kubernetes.io/docs/concepts/storage/volumes/#local) may improve performance.
