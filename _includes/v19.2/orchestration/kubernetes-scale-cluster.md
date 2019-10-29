Your Kubernetes cluster contains 3 Kubernetes nodes that can run pods. Since a CockroachDB node runs in each pod, ensure that two pods are not placed on the same Kubernetes node (as recommended in our [production best practices](recommended-production-settings.html#topology)). 

To do this, add a new worker node and then edit your StatefulSet configuration to add another pod for the new CockroachDB node.

1. Add a worker node, bringing the total from 3 to 4:
    - On GKE, [resize your cluster](https://cloud.google.com/kubernetes-engine/docs/how-to/resizing-a-cluster).
    - On EKS, resize your [Worker Node Group](https://docs.aws.amazon.com/eks/latest/userguide/update-stack.html).
    - On GCE, resize your [Managed Instance Group](https://cloud.google.com/compute/docs/instance-groups/).
    - On AWS, resize your [Auto Scaling Group](https://docs.aws.amazon.com/autoscaling/latest/userguide/as-manual-scaling.html).

2. Add a pod for the new CockroachDB node:

    <section class="filter-content" markdown="1" data-scope="manual">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl scale statefulset cockroachdb --replicas=4
    ~~~

    ~~~
    statefulset "cockroachdb" scaled
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ helm upgrade \
    my-release \
    stable/cockroachdb \
    --set Replicas=4 \
    --reuse-values
    ~~~

    ~~~
    Release "my-release" has been upgraded. Happy Helming!
    LAST DEPLOYED: Tue May 14 14:06:43 2019
    NAMESPACE: default
    STATUS: DEPLOYED

    RESOURCES:
    ==> v1beta1/PodDisruptionBudget
    NAME                           AGE
    my-release-cockroachdb-budget  51m

    ==> v1/Pod(related)

    NAME                               READY  STATUS     RESTARTS  AGE
    my-release-cockroachdb-0           1/1    Running    0         38m
    my-release-cockroachdb-1           1/1    Running    0         39m
    my-release-cockroachdb-2           1/1    Running    0         39m
    my-release-cockroachdb-3           0/1    Pending    0         0s
    my-release-cockroachdb-init-nwjkh  0/1    Completed  0         39m

    ...
    ~~~
    </section>
