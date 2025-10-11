The Kubernetes cluster we created contains 3 nodes that pods can be run on. To ensure that you do not have two pods on the same node (as recommended in our [production best practices](recommended-production-settings.html)), you need to add a new node and then edit your StatefulSet configuration to add another pod.

1. Add a worker node:
    - On GKE, [resize your cluster](https://cloud.google.com/kubernetes-engine/docs/how-to/resizing-a-cluster).
    - On GCE, resize your [Managed Instance Group](https://cloud.google.com/compute/docs/instance-groups/).
    - On AWS, resize your [Auto Scaling Group](https://docs.aws.amazon.com/autoscaling/latest/userguide/as-manual-scaling.html).

2. Use the `kubectl scale` command to add a pod to your StatefulSet:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl scale statefulset cockroachdb --replicas=4
    ~~~

    ~~~
    statefulset "cockroachdb" scaled
    ~~~
