1. From your local workstation, use our [`cockroachdb-statefulset-secure.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset-secure.yaml) file to create the StatefulSet that automatically creates 3 pods, each with a CockroachDB node running inside it.

    Download [`cockroachdb-statefulset-secure.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset-secure.yaml):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl -O https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cockroachdb-statefulset-secure.yaml
    ~~~

    {{site.data.alerts.callout_danger}}
    To avoid running out of memory when CockroachDB is not the only pod on a Kubernetes node, you must set memory limits explicitly. This is because CockroachDB does not detect the amount of memory allocated to its pod when run in Kubernetes. Specify this amount by adjusting `resources.requests.memory` and `resources.limits.memory` in `cockroachdb-statefulset-secure.yaml`. Their values should be identical.

    We recommend setting `cache` and `max-sql-memory` each to 1/4 of your memory allocation. For example, if you are allocating 8Gi of memory to each CockroachDB node, substitute the following values in [this line](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset-secure.yaml#L247):
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    --cache 2Gi --max-sql-memory 2Gi
    ~~~
    
    Use the file to create the StatefulSet and start the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f cockroachdb-statefulset-secure.yaml
    ~~~

    ~~~
    serviceaccount/cockroachdb created
    role.rbac.authorization.k8s.io/cockroachdb created
    clusterrole.rbac.authorization.k8s.io/cockroachdb created
    rolebinding.rbac.authorization.k8s.io/cockroachdb created
    clusterrolebinding.rbac.authorization.k8s.io/cockroachdb created
    service/cockroachdb-public created
    service/cockroachdb created
    poddisruptionbudget.policy/cockroachdb-budget created
    statefulset.apps/cockroachdb created
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

    {{site.data.alerts.callout_success}}
    If you change the StatefulSet name from the default `cockroachdb`, be sure to start and end with an alphanumeric character and otherwise use lowercase alphanumeric characters, `-`, or `.` so as to comply with [CSR naming requirements](orchestrate-cockroachdb-with-kubernetes.html#csr-names).
    {{site.data.alerts.end}}

2. As each pod is created, it issues a Certificate Signing Request, or CSR, to have the node's certificate signed by the Kubernetes CA. You must manually check and approve each node's certificates, at which point the CockroachDB node is started in the pod.

    1. Get the names of the `Pending` CSRs:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl get csr
        ~~~

        ~~~
        NAME                         AGE   REQUESTOR                                   CONDITION
        default.node.cockroachdb-0   1m    system:serviceaccount:default:cockroachdb   Pending
        default.node.cockroachdb-1   1m    system:serviceaccount:default:cockroachdb   Pending
        default.node.cockroachdb-2   1m    system:serviceaccount:default:cockroachdb   Pending
        ...
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
        Requesting User:    system:serviceaccount:default:cockroachdb
        Status:             Pending
        Subject:
          Common Name:    node
          Serial Number:
          Organization:   Cockroach
        Subject Alternative Names:
                 DNS Names:     localhost
                                cockroachdb-0.cockroachdb.default.svc.cluster.local
                                cockroachdb-0.cockroachdb
                                cockroachdb-public
                                cockroachdb-public.default.svc.cluster.local
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

    4. Repeat steps 2 and 3 for the other 2 pods.

3. Initialize the CockroachDB cluster:

    1. Confirm that three pods are `Running` successfully. Note that they will not be considered `Ready` until after the cluster has been initialized:

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
        NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                           STORAGECLASS   REASON   AGE
        pvc-9e435563-fb2e-11e9-a65c-42010a8e0fca   100Gi      RWO            Delete           Bound    default/datadir-cockroachdb-0   standard                51m
        pvc-9e47d820-fb2e-11e9-a65c-42010a8e0fca   100Gi      RWO            Delete           Bound    default/datadir-cockroachdb-1   standard                51m
        pvc-9e4f57f0-fb2e-11e9-a65c-42010a8e0fca   100Gi      RWO            Delete           Bound    default/datadir-cockroachdb-2   standard                51m
        ~~~

    3. Use our [`cluster-init-secure.yaml`](https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cluster-init-secure.yaml) file to perform a one-time initialization that joins the CockroachDB nodes into a single cluster:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl create \
        -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cluster-init-secure.yaml
        ~~~

        ~~~
        job.batch/cluster-init-secure created
        ~~~

    4. Approve the CSR for the one-off pod from which cluster initialization happens:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl certificate approve default.client.root
        ~~~

        ~~~
        certificatesigningrequest.certificates.k8s.io/default.client.root approved
        ~~~

    5. Confirm that cluster initialization has completed successfully. The job should be considered successful and the Kubernetes pods should soon be considered `Ready`:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl get job cluster-init-secure
        ~~~

        ~~~
        NAME                  COMPLETIONS   DURATION   AGE
        cluster-init-secure   1/1           23s        35s
        ~~~

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl get pods
        ~~~

        ~~~
        NAME                        READY     STATUS      RESTARTS   AGE
        cluster-init-secure-q8s7v   0/1       Completed   0          55s
        cockroachdb-0               1/1       Running     0          3m
        cockroachdb-1               1/1       Running     0          3m
        cockroachdb-2               1/1       Running     0          3m
        ~~~

{{site.data.alerts.callout_success}}
The StatefulSet configuration sets all CockroachDB nodes to log to `stderr`, so if you ever need access to a pod/node's logs to troubleshoot, use `kubectl logs <podname>` rather than checking the log on the persistent volume.
{{site.data.alerts.end}}
