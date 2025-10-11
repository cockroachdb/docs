{{site.data.alerts.callout_info}}
If you want to use a different certificate authority than the one Kubernetes uses, or if your Kubernetes cluster doesn't fully support certificate-signing requests (e.g., in Amazon EKS), use [these configuration files](https://github.com/cockroachdb/cockroach/tree/master/cloud/kubernetes/bring-your-own-certs) instead of the ones referenced below.
{{site.data.alerts.end}}

1. From your local workstation, use our [`cockroachdb-statefulset-secure.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset-secure.yaml) file to create the StatefulSet that automatically creates 3 pods, each with a CockroachDB node running inside it:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cockroachdb-statefulset-secure.yaml
    ~~~

    ~~~
    serviceaccount "cockroachdb" created
    role "cockroachdb" created
    clusterrole "cockroachdb" created
    rolebinding "cockroachdb" created
    clusterrolebinding "cockroachdb" created
    service "cockroachdb-public" created
    service "cockroachdb" created
    poddisruptionbudget "cockroachdb-budget" created
    statefulset "cockroachdb" created
    ~~~

    Alternatively, if you'd rather start with a configuration file that has been customized for performance:

    1. Download our [performance version of `cockroachdb-statefulset-secure.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/performance/cockroachdb-statefulset-secure.yaml):

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ curl -O https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/performance/cockroachdb-statefulset-secure.yaml
        ~~~

    2. Modify the file wherever there is a `TODO` comment.

    3. Use the file to create the StatefulSet and start the cluster:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl create -f cockroachdb-statefulset-secure.yaml
        ~~~

2. As each pod is created, it issues a Certificate Signing Request, or CSR, to have the node's certificate signed by the Kubernetes CA. You must manually check and approve each node's certificates, at which point the CockroachDB node is started in the pod.

    1. Get the name of the `Pending` CSR for the first pod:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl get csr
        ~~~

        ~~~
        NAME                                                   AGE       REQUESTOR                               CONDITION
        default.node.cockroachdb-0                             1m        system:serviceaccount:default:default   Pending
        node-csr-0Xmb4UTVAWMEnUeGbW4KX1oL4XV_LADpkwjrPtQjlZ4   4m        kubelet                                 Approved,Issued
        node-csr-NiN8oDsLhxn0uwLTWa0RWpMUgJYnwcFxB984mwjjYsY   4m        kubelet                                 Approved,Issued
        node-csr-aU78SxyU69pDK57aj6txnevr7X-8M3XgX9mTK0Hso6o   5m        kubelet                                 Approved,Issued
        ~~~

        If you do not see a `Pending` CSR, wait a minute and try again.

    2. Examine the CSR for the first pod:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl describe csr default.node.cockroachdb-0
        ~~~

        ~~~
        Name:               default.node.cockroachdb-0
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
                                cockroachdb-0.cockroachdb.default.svc.cluster.local
                                cockroachdb-public
                 IP Addresses:  127.0.0.1
                                10.48.1.6
        Events:  <none>
        ~~~

    3. If everything looks correct, approve the CSR for the first pod:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl certificate approve default.node.cockroachdb-0
        ~~~

        ~~~
        certificatesigningrequest "default.node.cockroachdb-0" approved
        ~~~

    4. Repeat steps 1-3 for the other 2 pods.

3. Initialize the cluster:

    1. Confirm that three pods are `Running` successfully. Note that they will not
       be considered `Ready` until after the cluster has been initialized:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl get pods
        ~~~

        ~~~
        NAME            READY     STATUS    RESTARTS   AGE
        cockroachdb-0   0/1       Running   0          2m
        cockroachdb-1   0/1       Running   0          2m
        cockroachdb-2   0/1       Running   0          2m
        ~~~

    2. Confirm that the persistent volumes and corresponding claims were created successfully for all three pods:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl get persistentvolumes
        ~~~

        ~~~
        NAME                                       CAPACITY   ACCESSMODES   RECLAIMPOLICY   STATUS    CLAIM                           REASON    AGE
        pvc-52f51ecf-8bd5-11e6-a4f4-42010a800002   1Gi        RWO           Delete          Bound     default/datadir-cockroachdb-0             26s
        pvc-52fd3a39-8bd5-11e6-a4f4-42010a800002   1Gi        RWO           Delete          Bound     default/datadir-cockroachdb-1             27s
        pvc-5315efda-8bd5-11e6-a4f4-42010a800002   1Gi        RWO           Delete          Bound     default/datadir-cockroachdb-2             27s
        ~~~

    3. Use our [`cluster-init-secure.yaml`](https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cluster-init-secure.yaml) file to perform a one-time initialization that joins the nodes into a single cluster:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl create -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cluster-init-secure.yaml
        ~~~

        ~~~
        job "cluster-init-secure" created
        ~~~

    4. Approve the CSR for the one-off pod from which cluster initialization happens:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl certificate approve default.client.root
        ~~~

        ~~~
        certificatesigningrequest "default.client.root" approved
        ~~~

    5. Confirm that cluster initialization has completed successfully. The job
       should be considered successful and the CockroachDB pods should soon be
       considered `Ready`:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl get job cluster-init-secure
        ~~~

        ~~~
        NAME                  DESIRED   SUCCESSFUL   AGE
        cluster-init-secure   1         1            2m
        ~~~

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl get pods
        ~~~

        ~~~
        NAME            READY     STATUS    RESTARTS   AGE
        cockroachdb-0   1/1       Running   0          3m
        cockroachdb-1   1/1       Running   0          3m
        cockroachdb-2   1/1       Running   0          3m
        ~~~

{{site.data.alerts.callout_success}}
The StatefulSet configuration sets all CockroachDB nodes to log to `stderr`, so if you ever need access to a pod/node's logs to troubleshoot, use `kubectl logs <podname>` rather than checking the log on the persistent volume.
{{site.data.alerts.end}}
