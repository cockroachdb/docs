{{site.data.alerts.callout_info}}
Secure CockroachDB deployments on Amazon EKS via Helm are [not yet supported](https://github.com/cockroachdb/cockroach/issues/38847).
{{site.data.alerts.end}}

1. [Install the Helm client](https://helm.sh/docs/intro/install) (version 3.0 or higher) and add the `cockroachdb` chart repository:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ helm repo add cockroachdb https://charts.cockroachdb.com/
    ~~~

    ~~~
    "cockroachdb" has been added to your repositories
    ~~~

2. Update your Helm chart repositories to ensure that you're using the [latest CockroachDB chart](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/Chart.yaml):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ helm repo update
    ~~~

3. On a production cluster, you will need to modify the StatefulSet configuration with values that are appropriate for your workload. Modify our Helm chart's [`values.yaml`](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/values.yaml) parameters:

    Create a `my-values.yaml` file to override the defaults in `values.yaml`, substituting your own values in this example based on the guidelines below.

    {{site.data.alerts.callout_success}}
    Resource `requests` and `limits` should have identical values. 
    {{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~
    statefulset:
      resources:
        limits:
          cpu: "16"
          memory: "8Gi"
        requests:
          cpu: "16"
          memory: "8Gi"
    conf:
      cache: "2Gi"
      max-sql-memory: "2Gi"
    tls:
      enabled: true
    ~~~

    1. To avoid running out of memory when CockroachDB is not the only pod on a Kubernetes node, you *must* set memory limits explicitly. This is because CockroachDB does not detect the amount of memory allocated to its pod when run in Kubernetes. We recommend setting `conf.cache` and `conf.max-sql-memory` each to 1/4 of the `memory` allocation specified in `statefulset.resources.requests` and `statefulset.resources.limits`.

        {{site.data.alerts.callout_success}}
        For example, if you are allocating 8Gi of `memory` to each CockroachDB node, allocate 2Gi to `cache` and 2Gi to `max-sql-memory`.
        {{site.data.alerts.end}}

    2. You may want to modify `storage.persistentVolume.size` and `storage.persistentVolume.storageClass` for your use case. This chart defaults to 100Gi of disk space per pod. For more details on customizing disks for performance, see [these instructions](kubernetes-performance.html#disk-type).

    3. For a secure deployment, set `tls.enabled` to true.

4. Install the CockroachDB Helm chart. 

    Provide a "release" name to identify and track this particular deployment of the chart, and override the default values with those in `my-values.yaml`.

    {{site.data.alerts.callout_info}}
    This tutorial uses `my-release` as the release name. If you use a different value, be sure to adjust the release name in subsequent commands. Also be sure to start and end the name with an alphanumeric character and otherwise use lowercase alphanumeric characters, `-`, or `.` so as to comply with [CSR naming requirements](orchestrate-cockroachdb-with-kubernetes.html#csr-names).
    {{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~ shell
    $ helm install my-release --values my-values.yaml cockroachdb/cockroachdb
    ~~~

    Behind the scenes, this command uses our `cockroachdb-statefulset.yaml` file to create the StatefulSet that automatically creates 3 pods, each with a CockroachDB node running inside it, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart.

6. As each pod is created, it issues a Certificate Signing Request, or CSR, to have the CockroachDB node's certificate signed by the Kubernetes CA. You must manually check and approve each node's certificate, at which point the CockroachDB node is started in the pod.

    1. Get the names of the `Pending` CSRs:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl get csr
        ~~~

        ~~~
        NAME                                    AGE       REQUESTOR                                              CONDITION
        default.client.root                     21s       system:serviceaccount:default:my-release-cockroachdb   Pending
        default.node.my-release-cockroachdb-0   15s       system:serviceaccount:default:my-release-cockroachdb   Pending
        default.node.my-release-cockroachdb-1   16s       system:serviceaccount:default:my-release-cockroachdb   Pending
        default.node.my-release-cockroachdb-2   15s       system:serviceaccount:default:my-release-cockroachdb   Pending
        ...
        ~~~

        If you do not see a `Pending` CSR, wait a minute and try again.

    2. Examine the CSR for the first pod:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl describe csr default.node.my-release-cockroachdb-0
        ~~~

        ~~~
        Name:               default.node.my-release-cockroachdb-0
        Labels:             <none>
        Annotations:        <none>
        CreationTimestamp:  Mon, 10 Dec 2018 05:36:35 -0500
        Requesting User:    system:serviceaccount:default:my-release-cockroachdb
        Status:             Pending
        Subject:
          Common Name:    node
          Serial Number:
          Organization:   Cockroach
        Subject Alternative Names:
                 DNS Names:     localhost
                                my-release-cockroachdb-0.my-release-cockroachdb.default.svc.cluster.local
                                my-release-cockroachdb-0.my-release-cockroachdb
                                my-release-cockroachdb-public
                                my-release-cockroachdb-public.default.svc.cluster.local
                 IP Addresses:  127.0.0.1
        Events:  <none>
        ~~~

    3. If everything looks correct, approve the CSR for the first pod:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl certificate approve default.node.my-release-cockroachdb-0
        ~~~

        ~~~
        certificatesigningrequest.certificates.k8s.io/default.node.my-release-cockroachdb-0 approved
        ~~~

    4. Repeat steps 2 and 3 for the other 2 pods.

7. Confirm that three pods are `Running` successfully:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                                READY     STATUS     RESTARTS   AGE
    my-release-cockroachdb-0            0/1       Running    0          6m
    my-release-cockroachdb-1            0/1       Running    0          6m
    my-release-cockroachdb-2            0/1       Running    0          6m
    my-release-cockroachdb-init-hxzsc   0/1       Init:0/1   0          6m
    ~~~

8. Approve the CSR for the one-off pod from which cluster initialization happens:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl certificate approve default.client.root
    ~~~

    ~~~
    certificatesigningrequest.certificates.k8s.io/default.client.root approved
    ~~~

9. Confirm that CockroachDB cluster initialization has completed successfully, with the pods for CockroachDB showing `1/1` under `READY` and the pod for initialization showing `COMPLETED` under `STATUS`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                                READY     STATUS      RESTARTS   AGE
    my-release-cockroachdb-0            1/1       Running     0          8m
    my-release-cockroachdb-1            1/1       Running     0          8m
    my-release-cockroachdb-2            1/1       Running     0          8m
    my-release-cockroachdb-init-hxzsc   0/1       Completed   0          1h
    ~~~

10. Confirm that the persistent volumes and corresponding claims were created successfully for all three pods:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pv
    ~~~

    ~~~
    NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                                      STORAGECLASS   REASON    AGE
    pvc-71019b3a-fc67-11e8-a606-080027ba45e5   100Gi      RWO            Delete           Bound     default/datadir-my-release-cockroachdb-0   standard                 11m
    pvc-7108e172-fc67-11e8-a606-080027ba45e5   100Gi      RWO            Delete           Bound     default/datadir-my-release-cockroachdb-1   standard                 11m
    pvc-710dcb66-fc67-11e8-a606-080027ba45e5   100Gi      RWO            Delete           Bound     default/datadir-my-release-cockroachdb-2   standard                 11m    
    ~~~

{{site.data.alerts.callout_success}}
The StatefulSet configuration sets all CockroachDB nodes to log to `stderr`, so if you ever need access to a pod/node's logs to troubleshoot, use `kubectl logs <podname>` rather than checking the log on the persistent volume.
{{site.data.alerts.end}}
