Most of the guidance in this page is most relevant to manual deployments that don't use Kubernetes. If you use Kubernetes to deploy CockroachDB, draining and decommissioning work the same way for the `cockroach` process, but Kubernetes handles them on your behalf. In a deployment without Kubernetes, an administrator initiates decommissioning or draining directly. In a Kubernetes deployment, an administrator modifies the desired configuration of the Kubernetes cluster and Kubernetes makes the required changes to the cluster, including decommissioning or draining nodes as required.

- Whether you deployed a cluster using the CockroachDB Operator, Helm, or a manual StatefulSet, the resulting deployment is a StatefulSet. Due to the nature of StatefulSets, it's safe to decommission **only** the Cockroach node with the highest StatefulSet ordinal in preparation for scaling down the StatefulSet. If you think you need to decommission any other node, consider the following recommendations and [contact Support](https://support.cockroachlabs.com/hc/en-us) for assistance.

    - If you deployed a cluster using the [CockroachDB Kubernetes Operator]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md %}), the best way to scale down a cluster is to update the specification for the Kubernetes deployment to reduce the value of `nodes:` and apply the change using a [rolling update](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/). Kubernetes will notice that there are now too many nodes and will reduce them and clean up their storage automatically.

    - If you deployed the cluster using [Helm]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md %}?filters=helm) or a [manual StatefulSet]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md %}?filters=manual), the best way to scale down a cluster is to interactively decommission and drain the highest-order node. After that node is decommissioned, drained, and terminated, you can repeat the process to further reduce the cluster's size.

    Refer to [Cluster Scaling]({% link {{ page.version.version }}/scale-cockroachdb-kubernetes.md %}).

- There is generally no need to interactively drain a node that is not being decommissioned, regardless of how you deployed the cluster in Kubernetes. When you upgrade, downgrade, or change the configuration of a CockroachDB deployment on Kubernetes, you apply the changes using a [rolling update](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/), which applies the change to one node at a time. On a given node, Kubernetes sends a `SIGTERM` signal to the `cockroach` process. When the `cockroach` process receives this signal, it starts draining itself. After draining is complete or the [termination grace period]({% link {{ page.version.version }}/drain-a-node.md %}#termination-grace-period-on-kubernetes) expires (whichever happens first), Kubernetes terminates the `cockroach` process and then removes the node from the Kubernetes cluster. Kubernetes then applies the updated deployment to the cluster node, restarts the `cockroach` process, and re-joins the cluster. Refer to [Cluster Upgrades]({% link {{ page.version.version }}/upgrade-cockroachdb-kubernetes.md %}).

- Although the `kubectl drain` command is used for manual maintenance of Kubernetes clusters, it has little direct relevance to the concept of draining a node in a CockroachDB cluster. The `kubectl drain` command gracefully terminates each pod running on a Kubernetes node so that the node can be shut down (in the case of physical hardware) or deleted (in the case of a virtual machine). For details on this command, see the [Kubernetes documentation](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/).

Refer to [Termination grace period on Kubernetes]({% link {{ page.version.version }}/drain-a-node.md %}#termination-grace-period-on-kubernetes). For more details about managing CockroachDB on Kubernetes, refer to [Cluster upgrades]({% link {{ page.version.version }}/upgrade-cockroachdb-kubernetes.md %}) and [Cluster scaling]({% link {{ page.version.version }}/scale-cockroachdb-kubernetes.md %}).

### Termination grace period on Kubernetes

After Kubernetes issues a termination request to the `cockroach` process on a cluster node, it waits for a maximum of the deployment's [`terminationGracePeriodSeconds`](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination) before forcibly terminating the process. If `terminationGracePeriodSeconds` is too short, the `cockroach` process may be terminated before it can shut down cleanly and client applications may be disrupted.

If undefined, Kubernetes sets `terminationGracePeriodSeconds` to 30 seconds. This is too short for the `cockroach` process to stop gracefully before Kubernetes terminates it forcibly. Do not set `terminationGracePeriodSeconds` to `0`, which prevents Kubernetes from detecting and terminating a stuck pod.

For clusters deployed using the CockroachDB Public Operator, `terminationGracePeriodSeconds` defaults to 300 seconds (5 minutes).
For clusters deployed using the CockroachDB Helm chart or a manual StatefulSet, the default depends upon the values file or manifest you used when you created the cluster.

Cockroach Labs recommends that you:

- Set `terminationGracePeriodSeconds` to no shorter than 300 seconds (5 minutes). This recommendation has been validated over time for many production workloads. In most cases, a value higher than 300 seconds (5 minutes) is not required. If CockroachDB takes longer than 5 minutes to gracefully stop, this may indicate an underlying configuration problem. Test the value you select against representative workloads before rolling out the change to production clusters.
- Set `terminationGracePeriodSeconds` to be at least 5 seconds longer than the configured [drain timeout](#server-shutdown-connections-timeout), to allow the node to complete draining before Kubernetes removes the Kubernetes pod for the CockroachDB node.
- Ensure that the **sum** of the following `server.shutdown.*` settings for the CockroachDB cluster do not exceed the deployment's `terminationGracePeriodSeconds`, to reduce the likelihood that a node must be terminated forcibly.

  - [`server.shutdown.initial_wait`](#server-shutdown-initial_wait)
  - [`server.shutdown.connections.timeout`](#server-shutdown-connections-timeout)
  - [`server.shutdown.transactions.timeout`](#server-shutdown-transactions-timeout) times two
  - [`server.shutdown.lease_transfer_iteration.timeout`](#server-shutdown-lease_transfer_iteration-timeout)

    For more information about these settings, refer to [Cluster settings](#cluster-settings). Refer also to the [Kubernetes documentation about pod termination](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination).

  A client application's connection pool should have a maximum lifetime that is shorter than the Kubernetes deployment's [`server.shutdown.connections.timeout`](#server-shutdown-connections-timeout) setting.
