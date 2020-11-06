Download and modify our StatefulSet configuration, depending on how you want to sign your certificates.

{{site.data.alerts.callout_danger}}
Some environments, such as Amazon EKS, do not support certificates signed by Kubernetes' built-in CA. In this case, use the second configuration below.
{{site.data.alerts.end}}

- Using the Kubernetes CA: [`cockroachdb-statefulset-secure.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset-secure.yaml). 

    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl -O https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cockroachdb-statefulset-secure.yaml
    ~~~

- Using a non-Kubernetes CA: [`cockroachdb-statefulset.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/bring-your-own-certs/cockroachdb-statefulset.yaml)

    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl -O https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/bring-your-own-certs/cockroachdb-statefulset.yaml
    ~~~

#### Set up configuration file

On a production cluster, you will need to modify the StatefulSet configuration with values that are appropriate for your workload.

1. Allocate CPU and memory resources to CockroachDB on each pod. For more context on provisioning CPU and memory, see the [Production Checklist](recommended-production-settings.html#hardware).

    {{site.data.alerts.callout_success}}
    Resource `requests` and `limits` should have identical values. 
    {{site.data.alerts.end}}

    ~~~
    resources:
      requests:
        cpu: "16"
        memory: "8Gi"
      limits:
        cpu: "16"
        memory: "8Gi"
    ~~~

    {{site.data.alerts.callout_info}}
    If no resource limits are specified, the pods will be able to consume the maximum available CPUs and memory. However, to avoid overallocating resources when another memory-intensive workload is on the same instance, always set resource requests and limits explicitly.
    {{site.data.alerts.end}}

2. In the `volumeClaimTemplates` specification, you may want to modify `resources.requests.storage` for your use case. This configuration defaults to 100Gi of disk space per pod. For more details on customizing disks for performance, see [these instructions](kubernetes-performance.html#disk-type).

    ~~~
    resources:
      requests:
        storage: "100Gi"
    ~~~

{{site.data.alerts.callout_success}}
If you change the StatefulSet name from the default `cockroachdb`, be sure to start and end with an alphanumeric character and otherwise use lowercase alphanumeric characters, `-`, or `.` so as to comply with [CSR naming requirements](orchestrate-cockroachdb-with-kubernetes.html#csr-names).
{{site.data.alerts.end}}

#### Initialize the cluster

Choose the authentication method that corresponds to the StatefulSet configuration you downloaded and modified above.

- [Kubernetes CA](#kubernetes-ca)
- [Non-Kubernetes CA](#non-kubernetes-ca)

{{site.data.alerts.callout_success}}
The StatefulSet configuration sets all CockroachDB nodes to log to `stderr`, so if you ever need access to a pod/node's logs to troubleshoot, use `kubectl logs <podname>` rather than checking the log on the persistent volume.
{{site.data.alerts.end}}

##### Kubernetes CA

1. Use the config file you downloaded to create the StatefulSet that automatically creates 3 pods, each running a CockroachDB node:

    {% include copy-clipboard.html %}
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

2. As each pod is created, it issues a Certificate Signing Request, or CSR, to have the node's certificate signed by the Kubernetes CA. You must manually check and approve each node's certificates, at which point the CockroachDB node is started in the pod.

    1. Get the names of the `Pending` CSRs:

        {% include copy-clipboard.html %}
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

        {% include copy-clipboard.html %}
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

        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl certificate approve default.node.cockroachdb-0
        ~~~

        ~~~
        certificatesigningrequest "default.node.cockroachdb-0" approved
        ~~~

    4. Repeat steps 2 and 3 for the other 2 pods.

3. Initialize the CockroachDB cluster:

    1. Confirm that three pods are `Running` successfully. Note that they will not be considered `Ready` until after the cluster has been initialized:

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
        $ kubectl get pv
        ~~~

        ~~~
        NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                           STORAGECLASS   REASON   AGE
        pvc-9e435563-fb2e-11e9-a65c-42010a8e0fca   100Gi      RWO            Delete           Bound    default/datadir-cockroachdb-0   standard                51m
        pvc-9e47d820-fb2e-11e9-a65c-42010a8e0fca   100Gi      RWO            Delete           Bound    default/datadir-cockroachdb-1   standard                51m
        pvc-9e4f57f0-fb2e-11e9-a65c-42010a8e0fca   100Gi      RWO            Delete           Bound    default/datadir-cockroachdb-2   standard                51m
        ~~~

    3. Use our [`cluster-init-secure.yaml`](https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cluster-init-secure.yaml) file to perform a one-time initialization that joins the CockroachDB nodes into a single cluster:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl create \
        -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cluster-init-secure.yaml
        ~~~

        ~~~
        job.batch/cluster-init-secure created
        ~~~

    4. Approve the CSR for the one-off pod from which cluster initialization happens:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl certificate approve default.client.root
        ~~~

        ~~~
        certificatesigningrequest.certificates.k8s.io/default.client.root approved
        ~~~

    5. Confirm that cluster initialization has completed successfully. The job should be considered successful and the Kubernetes pods should soon be considered `Ready`:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl get job cluster-init-secure
        ~~~

        ~~~
        NAME                  COMPLETIONS   DURATION   AGE
        cluster-init-secure   1/1           23s        35s
        ~~~

        {% include copy-clipboard.html %}
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

##### Non-Kubernetes CA

{{site.data.alerts.callout_info}}
The below steps use [`cockroach cert` commands](cockroach-cert.html) to quickly generate and sign the CockroachDB node and client certificates. Read our [Authentication](authentication.html#using-digital-certificates-with-cockroachdb) docs to learn about other methods of signing certificates.
{{site.data.alerts.end}}

1. Create two directories:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs my-safe-directory
    ~~~

    Directory | Description
    ----------|------------
    `certs` | You'll generate your CA certificate and all node and client certificates and keys in this directory.
    `my-safe-directory` | You'll generate your CA key in this directory and then reference the key when generating node and client certificates.

2. Create the CA certificate and key pair:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

3. Create a client certificate and key pair for the root user:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    root \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

4. Upload the client certificate and key to the Kubernetes cluster as a secret:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.client.root \
    --from-file=certs
    ~~~

    ~~~
    secret/cockroachdb.client.root created
    ~~~

5. Create the certificate and key pair for your CockroachDB nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-node \
    localhost 127.0.0.1 \
    cockroachdb-public \
    cockroachdb-public.default \
    cockroachdb-public.default.svc.cluster.local \
    *.cockroachdb \
    *.cockroachdb.default \
    *.cockroachdb.default.svc.cluster.local \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

6. Upload the node certificate and key to the Kubernetes cluster as a secret:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.node \
    --from-file=certs
    ~~~

    ~~~
    secret/cockroachdb.node created
    ~~~

7. Check that the secrets were created on the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get secrets
    ~~~

    ~~~
    NAME                      TYPE                                  DATA   AGE
    cockroachdb.client.root   Opaque                                3      41m
    cockroachdb.node          Opaque                                5      14s
    default-token-6qjdb       kubernetes.io/service-account-token   3      4m
    ~~~

8. Use the config file you downloaded to create the StatefulSet that automatically creates 3 pods, each running a CockroachDB node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f cockroachdb-statefulset.yaml
    ~~~

    ~~~
    serviceaccount/cockroachdb created
    role.rbac.authorization.k8s.io/cockroachdb created
    rolebinding.rbac.authorization.k8s.io/cockroachdb created
    service/cockroachdb-public created
    service/cockroachdb created
    poddisruptionbudget.policy/cockroachdb-budget created
    statefulset.apps/cockroachdb created
    ~~~

9. Initialize the CockroachDB cluster:

    1. Confirm that three pods are `Running` successfully. Note that they will not be considered `Ready` until after the cluster has been initialized:

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
        $ kubectl get pv
        ~~~

        ~~~
        NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                           STORAGECLASS   REASON   AGE
        pvc-9e435563-fb2e-11e9-a65c-42010a8e0fca   100Gi      RWO            Delete           Bound    default/datadir-cockroachdb-0   standard                51m
        pvc-9e47d820-fb2e-11e9-a65c-42010a8e0fca   100Gi      RWO            Delete           Bound    default/datadir-cockroachdb-1   standard                51m
        pvc-9e4f57f0-fb2e-11e9-a65c-42010a8e0fca   100Gi      RWO            Delete           Bound    default/datadir-cockroachdb-2   standard                51m
        ~~~

    3. Run `cockroach init` on one of the pods to complete the node startup process and have them join together as a cluster:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-0 \
        -- /cockroach/cockroach init \
        --certs-dir=/cockroach/cockroach-certs
        ~~~

        ~~~
        Cluster successfully initialized
        ~~~

    4. Confirm that cluster initialization has completed successfully. The job should be considered successful and the Kubernetes pods should soon be considered `Ready`:

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