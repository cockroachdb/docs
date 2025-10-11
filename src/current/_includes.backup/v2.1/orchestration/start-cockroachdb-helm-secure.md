1. [Install the Helm client](https://docs.helm.sh/using_helm/#installing-the-helm-client).

2. [Install the Helm server, known as Tiller](https://docs.helm.sh/using_helm/#installing-tiller).

    In the likely case that your Kubernetes cluster uses RBAC (e.g., if you are using GKE), you need to create [RBAC resources](https://docs.helm.sh/using_helm/#role-based-access-control) to grant Tiller access to the Kubernetes API:

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
        serviceaccount "tiller" created
        clusterrolebinding "tiller" created
        ~~~    

    3. Start the Helm server:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ helm init --service-account tiller
        ~~~

3. Install the CockroachDB Helm chart, providing a "release" name to identify and track this particular deployment of the chart and setting the `Secure.Enabled` parameter to `true`:

    {{site.data.alerts.callout_info}}
    This tutorial uses `my-release` as the release name. If you use a different value, be sure to adjust the release name in subsequent commands.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ helm install --name my-release --set Secure.Enabled=true cockroachdb/cockroachdb
    ~~~

    Behind the scenes, this command uses our `cockroachdb-statefulset.yaml` file to create the StatefulSet that automatically creates 3 pods, each with a CockroachDB node running inside it, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart.

    {{site.data.alerts.callout_info}}
    You can customize your deployment by passing additional [configuration parameters](https://github.com/cockroachdb/helm-charts/tree/master/cockroachdb#configuration) to `helm install` using the `--set key=value[,key=value]` flag. For a production cluster, you should consider modifying the `Storage` and `StorageClass` parameters. This chart defaults to 100 GiB of disk space per pod, but you may want more or less depending on your use case, and the default persistent volume `StorageClass` in your environment may not be what you want for a database (e.g., on GCE and Azure the default is not SSD).
    {{site.data.alerts.end}}

4. As each pod is created, it issues a Certificate Signing Request, or CSR, to have the node's certificate signed by the Kubernetes CA. You must manually check and approve each node's certificates, at which point the CockroachDB node is started in the pod.

    1. Get the name of the `Pending` CSR for the first pod:

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
                                10.48.1.6
        Events:  <none>
        ~~~

    3. If everything looks correct, approve the CSR for the first pod:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl certificate approve default.node.my-release-cockroachdb-0
        ~~~

        ~~~
        certificatesigningrequest "default.node.my-release-cockroachdb-0" approved
        ~~~

    4. Repeat steps 1-3 for the other 2 pods.

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
    certificatesigningrequest "default.client.root" approved
    ~~~

7. Confirm that cluster initialization has completed successfully, with each pod showing `1/1` under `READY`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                       READY     STATUS    RESTARTS   AGE
    my-release-cockroachdb-0   1/1       Running   0          8m
    my-release-cockroachdb-1   1/1       Running   0          8m
    my-release-cockroachdb-2   1/1       Running   0          8m
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
