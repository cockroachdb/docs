#### Set up configuration file

1. Download and modify our [StatefulSet configuration](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/bring-your-own-certs/cockroachdb-statefulset.yaml):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl -O https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/bring-your-own-certs/cockroachdb-statefulset.yaml
    ~~~

1. Allocate CPU and memory resources to CockroachDB on each pod. These settings should be appropriate for your workload. For more context on provisioning CPU and memory, see the [Production Checklist](recommended-production-settings.html#hardware).

    {{site.data.alerts.callout_success}}
    Resource `requests` and `limits` should have identical values. 
    {{site.data.alerts.end}}

    ~~~
    resources:
      requests:
        cpu: "2"
        memory: "8Gi"
      limits:
        cpu: "2"
        memory: "8Gi"
    ~~~

    {{site.data.alerts.callout_info}}
    If no resource limits are specified, the pods will be able to consume the maximum available CPUs and memory. However, to avoid overallocating resources when another memory-intensive workload is on the same instance, always set resource requests and limits explicitly.
    {{site.data.alerts.end}}

1. In the `volumeClaimTemplates` specification, you may want to modify `resources.requests.storage` for your use case. This configuration defaults to 100Gi of disk space per pod. For more details on customizing disks for performance, see [these instructions](kubernetes-performance.html#disk-type).

    ~~~
    resources:
      requests:
        storage: "100Gi"
    ~~~

#### Initialize the cluster

{{site.data.alerts.callout_info}}
The below steps use [`cockroach cert` commands](cockroach-cert.html) to quickly generate and sign the CockroachDB node and client certificates. If you use a different method of generating certificates, make sure to update `secret.secretName` in the StatefulSet configuration with the name of your node secret.
{{site.data.alerts.end}}

1. Create two directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs my-safe-directory
    ~~~

    Directory | Description
    ----------|------------
    `certs` | You'll generate your CA certificate and all node and client certificates and keys in this directory.
    `my-safe-directory` | You'll generate your CA key in this directory and then reference the key when generating node and client certificates.

2. Create the CA certificate and key pair:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

3. Create a client certificate and key pair for the root user:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    root \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

4. Upload the client certificate and key to the Kubernetes cluster as a secret:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.client.root \
    --from-file=certs
    ~~~

    ~~~
    secret/cockroachdb.client.root created
    ~~~

5. Create the certificate and key pair for your CockroachDB nodes:

    {% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.node \
    --from-file=certs
    ~~~

    ~~~
    secret/cockroachdb.node created
    ~~~

7. Check that the secrets were created on the cluster:

    {% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
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
        $ kubectl get pv
        ~~~

        ~~~
        NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                           STORAGECLASS   REASON   AGE
        pvc-9e435563-fb2e-11e9-a65c-42010a8e0fca   100Gi      RWO            Delete           Bound    default/datadir-cockroachdb-0   standard                51m
        pvc-9e47d820-fb2e-11e9-a65c-42010a8e0fca   100Gi      RWO            Delete           Bound    default/datadir-cockroachdb-1   standard                51m
        pvc-9e4f57f0-fb2e-11e9-a65c-42010a8e0fca   100Gi      RWO            Delete           Bound    default/datadir-cockroachdb-2   standard                51m
        ~~~

    3. Run `cockroach init` on one of the pods to complete the node startup process and have them join together as a cluster:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-0 \
        -- /cockroach/cockroach init \
        --certs-dir=/cockroach/cockroach-certs
        ~~~

        ~~~
        Cluster successfully initialized
        ~~~

    4. Confirm that cluster initialization has completed successfully. The job should be considered successful and the Kubernetes pods should soon be considered `Ready`:

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