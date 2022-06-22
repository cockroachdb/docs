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

3. Update your Helm chart repositories to ensure that you're using the latest CockroachDB chart:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ helm repo update
    ~~~

4. Install the CockroachDB Helm chart, providing a "release" name to identify and track this particular deployment of the chart:

    {{site.data.alerts.callout_info}}
    This tutorial uses `my-release` as the release name. If you use a different value, be sure to adjust the release name in subsequent commands.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ helm install --name my-release --set Resources.requests.memory="<your memory allocation>",CacheSize="<your cache size>",MaxSQLMemory="<your SQL memory size>" cockroachdb/cockroachdb
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
    You can customize your deployment by passing [configuration parameters](https://github.com/cockroachdb/helm-charts/tree/master/cockroachdb#configuration) to `helm install` using the `--set key=value[,key=value]` flag. For a production cluster, you should consider modifying the `Storage` and `StorageClass` parameters. This chart defaults to 100 GiB of disk space per pod, but you may want more or less depending on your use case, and the default persistent volume `StorageClass` in your environment may not be what you want for a database (e.g., on GCE and Azure the default is not SSD).
    {{site.data.alerts.end}}

5. Confirm that three pods are `Running` successfully and that the one-time cluster initialization has `Completed`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                                READY     STATUS      RESTARTS   AGE
    my-release-cockroachdb-0            1/1       Running     0          1m
    my-release-cockroachdb-1            1/1       Running     0          1m
    my-release-cockroachdb-2            1/1       Running     0          1m
    my-release-cockroachdb-init-k6jcr   0/1       Completed   0          1m
    ~~~

6. Confirm that the persistent volumes and corresponding claims were created successfully for all three pods:

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
