Your Kubernetes cluster includes 3 worker nodes, or instances, that can run pods. A CockroachDB node runs in each pod. As recommended in our [production best practices](recommended-production-settings.html#topology), you should ensure that two pods are not placed on the same worker node. 

<section class="filter-content" markdown="1" data-scope="operator">
1. Open and edit `example.yaml`.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ vi example.yaml
    ~~~

1. In `example.yaml`, update the number of `nodes`:

    ~~~
    nodes: 4
    ~~~

    {{site.data.alerts.callout_info}}
    Note that you must scale by updating the `nodes` value in the Operator configuration. Using `kubectl scale statefulset <cluster-name> --replicas=4` will result in new pods immediately being terminated.
    {{site.data.alerts.end}}

1. Apply `example.yaml` with the new configuration:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply -f example.yaml
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
    ...
    ~~~

1. Back in the DB Console, view the **Node List** to ensure that the fourth node successfully joined the cluster.
</section>

<section class="filter-content" markdown="1" data-scope="manual">
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

    {{site.data.alerts.callout_success}}
    If you aren't using the Kubernetes CA to sign certificates, you can now skip to step 6.
    {{site.data.alerts.end}}

1. Get the name of the `Pending` CSR for the new pod:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get csr
    ~~~

    ~~~
    NAME                                                   AGE       REQUESTOR                               CONDITION
    default.client.root                                    1h        system:serviceaccount:default:default   Approved,Issued
    default.node.cockroachdb-0                             1h        system:serviceaccount:default:default   Approved,Issued
    default.node.cockroachdb-1                             1h        system:serviceaccount:default:default   Approved,Issued
    default.node.cockroachdb-2                             1h        system:serviceaccount:default:default   Approved,Issued
    default.node.cockroachdb-3                             2m        system:serviceaccount:default:default   Pending
    node-csr-0Xmb4UTVAWMEnUeGbW4KX1oL4XV_LADpkwjrPtQjlZ4   1h        kubelet                                 Approved,Issued
    node-csr-NiN8oDsLhxn0uwLTWa0RWpMUgJYnwcFxB984mwjjYsY   1h        kubelet                                 Approved,Issued
    node-csr-aU78SxyU69pDK57aj6txnevr7X-8M3XgX9mTK0Hso6o   1h        kubelet                                 Approved,Issued
    ...
    ~~~

1. Examine the CSR for the new pod:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl describe csr default.node.cockroachdb-3
    ~~~

    ~~~
    Name:               default.node.cockroachdb-3
    Labels:             <none>
    Annotations:        <none>
    CreationTimestamp:  Wed, 30 Oct 2019 13:46:52 -0400
    Requesting User:    system:serviceaccount:default:cockroachdb
    Status:             Pending
    Subject:
      Common Name:    node
      Serial Number:
      Organization:   Cockroach
    Subject Alternative Names:
             DNS Names:     localhost
                            cockroachdb-1.cockroachdb.default.svc.cluster.local
                            cockroachdb-1.cockroachdb
                            cockroachdb-public
                            cockroachdb-public.default.svc.cluster.local
             IP Addresses:  127.0.0.1
    Events:  <none>
    ~~~    

1. If everything looks correct, approve the CSR for the new pod:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl certificate approve default.node.cockroachdb-3
    ~~~

    ~~~
    certificatesigningrequest.certificates.k8s.io/default.node.cockroachdb-3 approved
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

1. Back in the DB Console, view the **Node List** to ensure that the fourth node successfully joined the cluster.
</section>

<section class="filter-content" markdown="1" data-scope="helm">
1. Edit your StatefulSet configuration to add another pod for the new CockroachDB node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ helm upgrade \
    my-release \
    cockroachdb/cockroachdb \
    --set statefulset.replicas=4 \
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

1. Get the name of the `Pending` CSR for the new pod:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get csr
    ~~~

    ~~~
    NAME                                                   AGE       REQUESTOR                               CONDITION
    default.client.root                                    1h        system:serviceaccount:default:default   Approved,Issued
    default.node.my-release-cockroachdb-0                  1h        system:serviceaccount:default:default   Approved,Issued
    default.node.my-release-cockroachdb-1                  1h        system:serviceaccount:default:default   Approved,Issued
    default.node.my-release-cockroachdb-2                  1h        system:serviceaccount:default:default   Approved,Issued
    default.node.my-release-cockroachdb-3                  2m        system:serviceaccount:default:default   Pending
    node-csr-0Xmb4UTVAWMEnUeGbW4KX1oL4XV_LADpkwjrPtQjlZ4   1h        kubelet                                 Approved,Issued
    node-csr-NiN8oDsLhxn0uwLTWa0RWpMUgJYnwcFxB984mwjjYsY   1h        kubelet                                 Approved,Issued
    node-csr-aU78SxyU69pDK57aj6txnevr7X-8M3XgX9mTK0Hso6o   1h        kubelet                                 Approved,Issued
    ...
    ~~~

    If you do not see a `Pending` CSR, wait a minute and try again.

1. Examine the CSR for the new pod:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl describe csr default.node.my-release-cockroachdb-3
    ~~~

    ~~~
    Name:               default.node.my-release-cockroachdb-3
    Labels:             <none>
    Annotations:        <none>
    CreationTimestamp:  Thu, 09 Nov 2017 13:39:37 -0500
    Requesting User:    system:serviceaccount:default:default
    Status:             Pending
    Subject:
      Common Name:    node
      Serial Number:
      Organization:   Cockroach
    Subject Alternative Names:
             DNS Names:     localhost
                            my-release-cockroachdb-1.my-release-cockroachdb.default.svc.cluster.local
                            my-release-cockroachdb-1.my-release-cockroachdb
                            my-release-cockroachdb-public
                            my-release-cockroachdb-public.default.svc.cluster.local
             IP Addresses:  127.0.0.1
                            10.48.1.6
    Events:  <none>
    ~~~

1. If everything looks correct, approve the CSR for the new pod:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl certificate approve default.node.my-release-cockroachdb-3
    ~~~

    ~~~
    certificatesigningrequest.certificates.k8s.io/default.node.my-release-cockroachdb-3 approved
    ~~~

1. Verify that the new pod started successfully:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                        READY     STATUS    RESTARTS   AGE
    my-release-cockroachdb-0    1/1       Running   0          51m
    my-release-cockroachdb-1    1/1       Running   0          47m
    my-release-cockroachdb-2    1/1       Running   0          3m
    my-release-cockroachdb-3    1/1       Running   0          1m
    cockroachdb-client-secure   1/1       Running   0          15m
    ...
    ~~~

1. Back in the DB Console, view the **Node List** to ensure that the fourth node successfully joined the cluster.
</section>
