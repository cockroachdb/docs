Before scaling CockroachDB, ensure that your Kubernetes cluster has enough worker nodes to host the number of pods you want to add. This is to ensure that two pods are not placed on the same worker node, as recommended in our [production guidance](recommended-production-settings.html#topology).

For example, if you want to scale from 3 CockroachDB nodes to 4, your Kubernetes cluster should have at least 4 worker nodes. You can verify the size of your Kubernetes cluster by running `kubectl get nodes`.

1. On a production deployment, first add a worker node, bringing the total from 3 to 4:
    - On GKE, [resize your cluster](https://cloud.google.com/kubernetes-engine/docs/how-to/resizing-a-cluster).
    - On EKS, resize your [Worker Node Group](https://eksctl.io/usage/managing-nodegroups/#scaling).
    - On GCE, resize your [Managed Instance Group](https://cloud.google.com/compute/docs/instance-groups/).
    - On AWS, resize your [Auto Scaling Group](https://docs.aws.amazon.com/autoscaling/latest/userguide/as-manual-scaling.html).

1. Edit your StatefulSet configuration to add another pod for the new CockroachDB node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl scale statefulset cockroachdb --replicas=4
    ~~~

    ~~~
    statefulset.apps/cockroachdb scaled
    ~~~

1. Verify that the new pod started successfully:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                        READY     STATUS    RESTARTS   AGE
    cockroachdb-0               1/1       Running   0          51m
    cockroachdb-1               1/1       Running   0          47m
    cockroachdb-2               1/1       Running   0          3m
    cockroachdb-3               1/1       Running   0          1m
    cockroachdb-client-secure   1/1       Running   0          15m
    ...
    ~~~

1. You can also open the [**Node List**](ui-cluster-overview-page.html#node-list) in the DB Console to ensure that the fourth node successfully joined the cluster.