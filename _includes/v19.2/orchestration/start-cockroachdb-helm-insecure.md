1. [Install the Helm client](https://helm.sh/docs/intro/install/).

2. Install the Helm server, known as Tiller.

    In the likely case that your Kubernetes cluster uses RBAC (e.g., if you are using GKE), you first need to create [RBAC resources](https://docs.helm.sh/using_helm/#role-based-access-control) to grant Tiller access to the Kubernetes API:

    1. Create a `rbac-config.yaml` file to define a role and service account:

        {% include copy-clipboard.html %}
        ~~~
        cat > rbac-config.yaml <<EOF
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
        EOF
        ~~~

    2. Create the service account:

        {% include copy-clipboard.html %}
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


        {% include copy-clipboard.html %}
        ~~~ shell
        $ helm init --service-account tiller --override spec.selector.matchLabels.'name'='tiller',spec.selector.matchLabels.'app'='helm' --output yaml | sed 's@apiVersion: extensions/v1beta1@apiVersion: apps/v1@' | kubectl apply -f -
        ~~~

        ~~~
        deployment.apps/tiller-deploy created
        service/tiller-deploy created
        ~~~

3. Update your Helm chart repositories to ensure that you're using the [latest CockroachDB chart](https://github.com/helm/charts/blob/master/stable/cockroachdb/Chart.yaml):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ helm repo update
    ~~~

4. Modify our Helm chart's [`values.yaml`](https://github.com/helm/charts/blob/master/stable/cockroachdb/values.yaml) parameters for your deployment scenario.

    Create a `my-values.yaml` file to override the defaults in `values.yaml`, substituting your own values in this example based on the guidelines below.

    {% include copy-clipboard.html %}
    ~~~
    cat > my-values.yaml <<EOF
    statefulset:
      resources:
        limits:
          memory: "8Gi"
        requests:
          memory: "8Gi"
    conf:
      cache: "2Gi"
      max-sql-memory: "2Gi"
    EOF
    ~~~

    1. To avoid running out of memory when CockroachDB is not the only pod on a Kubernetes node, you *must* set memory limits explicitly. This is because CockroachDB does not detect the amount of memory allocated to its pod when run in Kubernetes. We recommend setting `conf.cache` and `conf.max-sql-memory` each to 1/4 of the `memory` allocation specified in `statefulset.resources.requests` and `statefulset.resources.limits`. 

        {{site.data.alerts.callout_success}}
        For example, if you are allocating 8Gi of `memory` to each CockroachDB node, allocate 2Gi to `cache` and 2Gi to `max-sql-memory`.
        {{site.data.alerts.end}}

    2. You may want to modify `storage.persistentVolume.size` for your use case. This chart defaults to 100Gi of disk space per pod. For more details on customizing disks for performance, see [these instructions](kubernetes-performance.html#disk-type).

        {{site.data.alerts.callout_info}}
        If necessary, you can [expand disk size](#expand-disk-size) after the cluster is live.
        {{site.data.alerts.end}}

5. Install the CockroachDB Helm chart. 

    Provide a "release" name to identify and track this particular deployment of the chart, and override the default values with those in `my-values.yaml`.

    {{site.data.alerts.callout_info}}
    This tutorial uses `my-release` as the release name. If you use a different value, be sure to adjust the release name in subsequent commands. Also be sure to start and end the name with an alphanumeric character and otherwise use lowercase alphanumeric characters, `-`, or `.` so as to comply with [CSR naming requirements](orchestrate-cockroachdb-with-kubernetes.html#csr-names).
    {{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~ shell
    $ helm install --name my-release --values my-values.yaml stable/cockroachdb
    ~~~

    Behind the scenes, this command uses our `cockroachdb-statefulset.yaml` file to create the StatefulSet that automatically creates 3 pods, each with a CockroachDB node running inside it, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart.

5. Confirm that three pods are `Running` successfully and that the one-time cluster initialization has `Completed`:

    {% include copy-clipboard.html %}
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

    {% include copy-clipboard.html %}
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
