Before scaling CockroachDB, ensure that your Kubernetes cluster has enough worker nodes to host the number of pods you want to add. This is to ensure that two pods are not placed on the same worker node, as recommended in our [production guidance](recommended-production-settings.html#topology).

For example, if you want to scale from 3 CockroachDB nodes to 4, your Kubernetes cluster should have at least 4 worker nodes. You can verify the size of your Kubernetes cluster by running `kubectl get nodes`.

1. Edit your StatefulSet configuration to add another pod for the new CockroachDB node:

    {% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl certificate approve default.node.my-release-cockroachdb-3
    ~~~

    ~~~
    certificatesigningrequest.certificates.k8s.io/default.node.my-release-cockroachdb-3 approved
    ~~~

1. Verify that the new pod started successfully:

    {% include_cached copy-clipboard.html %}
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

1. You can also open the [**Node List**](ui-cluster-overview-page.html#node-list) in the DB Console to ensure that the fourth node successfully joined the cluster.