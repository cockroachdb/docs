{% if page.secure == true %}

From your local workstation, use our [`cockroachdb-statefulset-secure.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset-secure.yaml) file to create the StatefulSet that automatically creates 3 pods, each with a CockroachDB node running inside it:

{% include_cached copy-clipboard.html %}
~~~ shell
$ kubectl create -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cockroachdb-statefulset-secure.yaml
~~~

~~~
serviceaccount "cockroachdb" created
role "cockroachdb" created
clusterrole "cockroachdb" created
rolebinding "cockroachdb" created
clusterrolebinding "cockroachdb" created
service "cockroachdb-public" created
service "cockroachdb" created
poddisruptionbudget "cockroachdb-budget" created
statefulset "cockroachdb" created
~~~

{% else %}

1. From your local workstation, use our [`cockroachdb-statefulset.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset.yaml) file to create the StatefulSet that automatically creates 3 pods, each with a CockroachDB node running inside it:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cockroachdb-statefulset.yaml
    ~~~

    ~~~
    service "cockroachdb-public" created
    service "cockroachdb" created
    poddisruptionbudget "cockroachdb-budget" created
    statefulset "cockroachdb" created
    ~~~

2. Confirm that three pods are `Running` successfully. Note that they will not
   be considered `Ready` until after the cluster has been initialized:

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

3. Confirm that the persistent volumes and corresponding claims were created successfully for all three pods:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get persistentvolumes
    ~~~

    ~~~
    NAME                                       CAPACITY   ACCESSMODES   RECLAIMPOLICY   STATUS    CLAIM                           REASON    AGE
    pvc-52f51ecf-8bd5-11e6-a4f4-42010a800002   1Gi        RWO           Delete          Bound     default/datadir-cockroachdb-0             26s
    pvc-52fd3a39-8bd5-11e6-a4f4-42010a800002   1Gi        RWO           Delete          Bound     default/datadir-cockroachdb-1             27s
    pvc-5315efda-8bd5-11e6-a4f4-42010a800002   1Gi        RWO           Delete          Bound     default/datadir-cockroachdb-2             27s
    ~~~

{% endif %}
