1. [Install the Helm client](https://docs.helm.sh/using_helm/#installing-the-helm-client).

2. Install the Helm server, known as Tiller.

    In the likely case that your Kubernetes cluster uses RBAC (e.g., if you are using GKE), you first need to create [RBAC resources](https://docs.helm.sh/using_helm/#role-based-access-control) to grant Tiller access to the Kubernetes API:

    1. Create a `rbac-config.yaml` file to define a role and service account:

        {% include_cached copy-clipboard.html %}
        ~~~
        apiVersion: v1
        kind: ServiceAccount
        metadata:
          name: tiller
          namespace: kube-system
        ---
        apiVersion: rbac.authorization.k8s.io/v1
        kind: ClusterRoleBinding
        metadata:
          name: tiller
        roleRef:
          apiGroup: rbac.authorization.k8s.io
          kind: ClusterRole
          name: cluster-admin
        subjects:
          - kind: ServiceAccount
            name: tiller
            namespace: kube-system
        ~~~

    2. Create the service account:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl create -f rbac-config.yaml
        ~~~

        ~~~
        serviceaccount/tiller created
        clusterrolebinding.rbac.authorization.k8s.io/tiller created
        ~~~    

    3. Start the Helm server and [install Tiller](https://docs.helm.sh/using_helm/#installing-tiller):

        {{site.data.alerts.callout_info}}
        Tiller does not currently support [Kubernetes 1.16.0](https://kubernetes.io/blog/2019/07/18/api-deprecations-in-1-16/). The following command includes a workaround to install Tiller for use with 1.16.0.
        {{site.data.alerts.end}}


        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ helm init --service-account tiller --override spec.selector.matchLabels.'name'='tiller',spec.selector.matchLabels.'app'='helm' --output yaml | sed 's@apiVersion: extensions/v1beta1@apiVersion: apps/v1@' | kubectl apply -f -
        ~~~

        ~~~
        deployment.apps/tiller-deploy created
        service/tiller-deploy created
        ~~~

3. Install the CockroachDB Helm chart, providing a "release" name to identify and track this particular deployment of the chart and setting the `Secure.Enabled` parameter to `true`:

    {{site.data.alerts.callout_info}}
    This tutorial uses `my-release` as the release name. If you use a different value, be sure to adjust the release name in subsequent commands. Also be sure to start and end the name with an alphanumeric character and otherwise use lowercase alphanumeric characters, `-`, or `.` so as to comply with [CSR naming requirements](orchestrate-cockroachdb-with-kubernetes.html#csr-names).
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ helm install --name my-release --set Secure.Enabled=true,Resources.requests.memory="<your memory allocation>",CacheSize="<your cache size>",MaxSQLMemory="<your SQL memory size>" cockroachdb/cockroachdb
    ~~~

    Behind the scenes, this command uses our `cockroachdb-statefulset.yaml` file to create the StatefulSet that automatically creates 3 pods, each with a CockroachDB node running inside it, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart.

    {{site.data.alerts.callout_danger}}
    To avoid running out of memory when CockroachDB is not the only pod on a Kubernetes node, you must set memory limits explicitly. This is because CockroachDB does not detect the amount of memory allocated to its pod when run in Kubernetes.

    We recommend setting `CacheSize` and `MaxSQLMemory` each to 1/4 of the memory allocation specified in your `Resources.requests.memory` parameter. For example, if you are allocating 8GiB of memory to each CockroachDB node, use the following values with the `--set` flag in the `helm install` command:
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    Requests.resources.memory="8GiB",CacheSize="2GiB",MaxSQLMemory="2GiB"
    ~~~

    {{site.data.alerts.callout_info}}
    You can customize your deployment by passing additional [configuration parameters](https://github.com/cockroachdb/helm-charts/tree/master/cockroachdb#configuration) to `helm install` using the `--set key=value[,key=value]` flag. For a production cluster, you should consider modifying the `Storage` and `StorageClass` parameters. This chart defaults to 100 GiB of disk space per pod, but you may want more or less depending on your use case, and the default persistent volume `StorageClass` in your environment may not be what you want for a database (e.g., on GCE and Azure the default is not SSD).
    {{site.data.alerts.end}}

4. As each pod is created, it issues a Certificate Signing Request, or CSR, to have the CockroachDB node's certificate signed by the Kubernetes CA. You must manually check and approve each node's certificate, at which point the CockroachDB node is started in the pod.

    1. Get the names of the `Pending` CSRs:

        {% include_cached copy-clipboard.html %}
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

        {% include_cached copy-clipboard.html %}
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

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl certificate approve default.node.my-release-cockroachdb-0
        ~~~

        ~~~
        certificatesigningrequest.certificates.k8s.io/default.node.my-release-cockroachdb-0 approved
        ~~~

    4. Repeat steps 2 and 3 for the other 2 pods.

5. Confirm that three pods are `Running` successfully:

    {% include_cached copy-clipboard.html %}
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

6. Approve the CSR for the one-off pod from which cluster initialization happens:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl certificate approve default.client.root
    ~~~

    ~~~
    certificatesigningrequest.certificates.k8s.io/default.client.root approved
    ~~~

7. Confirm that CockroachDB cluster initialization has completed successfully, with the pods for CockroachDB showing `1/1` under `READY` and the pod for initialization showing `COMPLETED` under `STATUS`:

    {% include_cached copy-clipboard.html %}
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

8. Confirm that the persistent volumes and corresponding claims were created successfully for all three pods:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get persistentvolumes
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
