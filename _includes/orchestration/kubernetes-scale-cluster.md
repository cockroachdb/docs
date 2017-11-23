The Kubernetes cluster contains 4 nodes, one master and 3 workers. Pods get placed only on worker nodes, so to ensure that you don't have two pods on the same node (as recommended in our [production best practices](recommended-production-settings.html)), you need to add a new worker node and then edit your StatefulSet configuration to add another pod.

1. Add a worker node:
    - On GCE, resize your [Managed Instance Group](https://cloud.google.com/compute/docs/instance-groups/).
    - On AWS, resize your [Auto Scaling Group](https://docs.aws.amazon.com/autoscaling/latest/userguide/as-manual-scaling.html).

2. Use the `kubectl scale` command to add a pod to your StatefulSet:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl scale statefulset cockroachdb --replicas=4
    ~~~

    ~~~
    statefulset "cockroachdb" scaled
    ~~~
