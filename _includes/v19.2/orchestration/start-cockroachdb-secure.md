1. From your local workstation, use our [`cockroachdb-statefulset-secure.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset-secure.yaml) file to create the StatefulSet that automatically creates 3 pods, each with a CockroachDB node running inside it.

    Download [`cockroachdb-statefulset-secure.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset-secure.yaml):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl -O https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cockroachdb-statefulset-secure.yaml
    ~~~

    Specify the amount of memory to allocate to each CockroachDB node. Add a `resources.requests.memory` parameter inside the `containers` object in the config file:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ resources:
          requests:
            memory: "<your memory allocation>"
    ~~~    

    {{site.data.alerts.callout_danger}}
    To avoid running out of memory when CockroachDB is not the only pod on a Kubernetes node, you must set memory limits explicitly. This is because CockroachDB does not detect the amount of memory allocated to its pod when run in Kubernetes.

    We recommend setting `CacheSize` and `MaxSQLMemory` each to 1/4 of the memory specified in your `resources.requests.memory` parameter. For example, if you are allocating 8GiB of memory to each CockroachDB node, substitute the following values in [this line](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset-secure.yaml#L232) of `cockroachdb-statefulset-secure.yaml`:
    {{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~ shell
    --cache 2GiB --max-sql-memory 2GiB
    ~~~

    Use the file to create the StatefulSet and start the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f cockroachdb-statefulset-secure.yaml
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

        {% include copy-clipboard.html %}
        ~~~ shell
        $ curl -O https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/performance/cockroachdb-statefulset-secure.yaml
        ~~~

    2. Modify the file wherever there is a `TODO` comment.

    3. Use the file to create the StatefulSet and start the cluster:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl create -f cockroachdb-statefulset-secure.yaml
        ~~~

    {{site.data.alerts.callout_success}}
    If you change the StatefulSet name from the default `cockroachdb`, be sure to start and end with an alphanumeric character and otherwise use lowercase alphanumeric characters, `-`, or `.` so as to comply with [CSR naming requirements](orchestrate-cockroachdb-with-kubernetes.html#csr-names).
    {{site.data.alerts.end}}

2. As each pod is created, it issues a Certificate Signing Request, or CSR, to have the node's certificate signed by the Kubernetes CA. You must manually check and approve each node's certificates, at which point the CockroachDB node is started in the pod.

    1. Get the name of the `Pending` CSR for the first pod:

        {% include copy-clipboard.html %}
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

        {% include copy-clipboard.html %}
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

        {% include copy-clipboard.html %}
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

        {% include copy-clipboard.html %}
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

        {% include copy-clipboard.html %}
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

        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl create \
        -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cluster-init-secure.yaml
        ~~~

        ~~~
        job "cluster-init-secure" created
        ~~~

    4. Approve the CSR for the one-off pod from which cluster initialization happens:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl certificate approve default.client.root
        ~~~

        ~~~
        certificatesigningrequest "default.client.root" approved
        ~~~

    5. Confirm that cluster initialization has completed successfully. The job
       should be considered successful and the CockroachDB pods should soon be
       considered `Ready`:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl get job cluster-init-secure
        ~~~

        ~~~
        NAME                  DESIRED   SUCCESSFUL   AGE
        cluster-init-secure   1         1            2m
        ~~~

        {% include copy-clipboard.html %}
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
