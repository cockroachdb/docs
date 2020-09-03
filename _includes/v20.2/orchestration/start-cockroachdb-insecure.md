1. From your local workstation, use our [`cockroachdb-statefulset.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset.yaml) file to create the StatefulSet that automatically creates 3 pods, each with a CockroachDB node running inside it.

    Download [`cockroachdb-statefulset.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset.yaml):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl -O https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cockroachdb-statefulset.yaml
    ~~~

    {{site.data.alerts.callout_danger}}
    To avoid running out of memory when CockroachDB is not the only pod on a Kubernetes instance, you *must* set `resources.requests.memory` and `resources.limits.memory` to explicit values in the CockroachDB `containers` spec. This is because CockroachDB does not detect the amount of memory allocated to its pod when run in Kubernetes. 

    For example, to allocate 8Gi of memory to CockroachDB in each pod: 

    ~~~
    containers:
      - name: cockroachdb
        ...
          resources:
            requests:
              memory: "8Gi"
            limits:
              memory: "8Gi"
    ~~~
    {{site.data.alerts.end}}
    
    Use the file to create the StatefulSet and start the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f cockroachdb-statefulset.yaml
    ~~~

    ~~~
    service/cockroachdb-public created
    service/cockroachdb created
    poddisruptionbudget.policy/cockroachdb-budget created
    statefulset.apps/cockroachdb created
    ~~~

    Alternatively, if you'd rather start with a configuration file that has been customized for performance:

    1. Download our [performance version of `cockroachdb-statefulset-insecure.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/performance/cockroachdb-statefulset-insecure.yaml):

        {% include copy-clipboard.html %}
        ~~~ shell
        $ curl -O https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/performance/cockroachdb-statefulset-insecure.yaml
        ~~~

    2. Modify the file wherever there is a `TODO` comment.

    3. Use the file to create the StatefulSet and start the cluster:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl create -f cockroachdb-statefulset-insecure.yaml
        ~~~

2. Confirm that three pods are `Running` successfully. Note that they will not
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

3. Confirm that the persistent volumes and corresponding claims were created successfully for all three pods:

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

4. Use our [`cluster-init.yaml`](https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cluster-init.yaml) file to perform a one-time initialization that joins the CockroachDB nodes into a single cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl create \
    -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cluster-init.yaml
    ~~~

    ~~~
    job.batch/cluster-init created
    ~~~

5. Confirm that cluster initialization has completed successfully. The job should be considered successful and the Kubernetes pods should soon be considered `Ready`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get job cluster-init
    ~~~

    ~~~
    NAME           COMPLETIONS   DURATION   AGE
    cluster-init   1/1           7s         27s
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                 READY   STATUS      RESTARTS   AGE
    cluster-init-cqf8l   0/1     Completed   0          56s
    cockroachdb-0        1/1     Running     0          7m51s
    cockroachdb-1        1/1     Running     0          7m51s
    cockroachdb-2        1/1     Running     0          7m51s
    ~~~

{{site.data.alerts.callout_success}}
The StatefulSet configuration sets all CockroachDB nodes to log to `stderr`, so if you ever need access to a pod/node's logs to troubleshoot, use `kubectl logs <podname>` rather than checking the log on the persistent volume.
{{site.data.alerts.end}}
