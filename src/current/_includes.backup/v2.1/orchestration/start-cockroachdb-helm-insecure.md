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

3. Install the CockroachDB Helm chart, providing a "release" name to identify and track this particular deployment of the chart:

    {{site.data.alerts.callout_info}}
    This tutorial uses `my-release` as the release name. If you use a different value, be sure to adjust the release name in subsequent commands.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ helm install --name my-release cockroachdb/cockroachdb
    ~~~

    Behind the scenes, this command uses our `cockroachdb-statefulset.yaml` file to create the StatefulSet that automatically creates 3 pods, each with a CockroachDB node running inside it, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart.

    {{site.data.alerts.callout_info}}
    You can customize your deployment by passing [configuration parameters](https://github.com/cockroachdb/helm-charts/tree/master/cockroachdb#configuration) to `helm install` using the `--set key=value[,key=value]` flag. For a production cluster, you should consider modifying the `Storage` and `StorageClass` parameters. This chart defaults to 100 GiB of disk space per pod, but you may want more or less depending on your use case, and the default persistent volume `StorageClass` in your environment may not be what you want for a database (e.g., on GCE and Azure the default is not SSD).
    {{site.data.alerts.end}}

4. Confirm that three pods are `Running` successfully:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                       READY     STATUS    RESTARTS   AGE
    my-release-cockroachdb-0   1/1       Running   0          48s
    my-release-cockroachdb-1   1/1       Running   0          47s
    my-release-cockroachdb-2   1/1       Running   0          47s
    ~~~

5. Confirm that the persistent volumes and corresponding claims were created successfully for all three pods:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get persistentvolumes
    ~~~

    ~~~
    NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                                      STORAGECLASS   REASON    AGE
    pvc-64878ebf-f3f0-11e8-ab5b-42010a8e0035   100Gi      RWO            Delete           Bound     default/datadir-my-release-cockroachdb-0   standard                 51s
    pvc-64945b4f-f3f0-11e8-ab5b-42010a8e0035   100Gi      RWO            Delete           Bound     default/datadir-my-release-cockroachdb-1   standard                 51s
    pvc-649d920d-f3f0-11e8-ab5b-42010a8e0035   100Gi      RWO            Delete           Bound     default/datadir-my-release-cockroachdb-2   standard                 51s
    ~~~

{{site.data.alerts.callout_success}}
The StatefulSet configuration sets all CockroachDB nodes to log to `stderr`, so if you ever need access to a pod/node's logs to troubleshoot, use `kubectl logs <podname>` rather than checking the log on the persistent volume.
{{site.data.alerts.end}}
