Before scaling up CockroachDB, note the following [topology recommendations]({% link {{ page.version.version }}/recommended-production-settings.md %}#topology):

- Each CockroachDB node (running in its own pod) should run on a separate Kubernetes worker node.
- Each availability zone should have the same number of CockroachDB nodes.

If your cluster has 3 CockroachDB nodes distributed across 3 availability zones (as in our [deployment example](deploy-cockroachdb-with-kubernetes.html?filters=manual)), we recommend scaling up by a multiple of 3 to retain an even distribution of nodes. You should therefore scale up to a minimum of 6 CockroachDB nodes, with 2 nodes in each zone.

1. Run `kubectl get nodes` to list the worker nodes in your Kubernetes cluster. There should be at least as many worker nodes as pods you plan to add. This ensures that no more than one pod will be placed on each worker node.

1. Add worker nodes if necessary:
    - On GKE, [resize your cluster](https://cloud.google.com/kubernetes-engine/docs/how-to/resizing-a-cluster). If you deployed a [regional cluster](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-regional-cluster) as we recommended, you will use `--num-nodes` to specify the desired number of worker nodes in each zone. For example:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        gcloud container clusters resize {cluster-name} --region {region-name} --num-nodes 2
        ~~~
    - On EKS, resize your [Worker Node Group](https://eksctl.io/usage/managing-nodegroups/#scaling).
    - On GCE, resize your [Managed Instance Group](https://cloud.google.com/compute/docs/instance-groups/).
    - On AWS, resize your [Auto Scaling Group](https://docs.aws.amazon.com/autoscaling/latest/userguide/as-manual-scaling.html).

1. Edit your StatefulSet configuration to add pods for each new CockroachDB node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl scale statefulset cockroachdb --replicas=6
    ~~~

    ~~~
    statefulset.apps/cockroachdb scaled
    ~~~

1. Verify that the new pod started successfully:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                        READY     STATUS    RESTARTS   AGE
    cockroachdb-0               1/1       Running   0          51m
    cockroachdb-1               1/1       Running   0          47m
    cockroachdb-2               1/1       Running   0          3m
    cockroachdb-3               1/1       Running   0          1m
    cockroachdb-4               1/1       Running   0          1m
    cockroachdb-5               1/1       Running   0          1m
    cockroachdb-client-secure   1/1       Running   0          15m
    ...
    ~~~

1. You can also open the [**Node List**]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}#node-list) in the DB Console to ensure that the fourth node successfully joined the cluster.