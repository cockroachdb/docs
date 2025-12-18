To perform a major upgrade:

<section class="filter-content" markdown="1" data-scope="operator">

1. Change the container image image in the custom resource:

    ~~~
    image:
      name: cockroachdb/cockroach:{{page.release_info.version}}
    ~~~

1. Apply the new settings to the cluster:

    ~~~ shell
    kubectl apply -f example.yaml
    ~~~

    The Operator will perform the staged update.

1. To check the status of the rolling upgrade, run `kubectl get pods`.
1. Verify that all pods have been upgraded:

    ~~~ shell
    $ kubectl get pods \
    -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}'
    ~~~

    You can also check the CockroachDB version of each node in the [DB Console]({% link "{{ page.version.version }}/ui-cluster-overview-page.md" %}#node-details).

1. Before beginning a major-version upgrade, the Operator disables auto-finalization by setting the cluster setting `cluster.preserve_downgrade_option` to the cluster's current major version. Before finalizing an upgrade, follow your organization's testing procedures to decide whether to [finalize](#finalize-a-major-version-upgrade-manually) or [roll back](#roll-back-a-major-version-upgrade) the upgrade. After finalization begins, you can no longer roll back to the cluster's previous major version.

</section>

<section class="filter-content" markdown="1" data-scope="manual">

1.
1. Add a [partition](https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/#staging-an-update) to the update strategy defined in the StatefulSet. Only the pods numbered greater than or equal to the partition value will be updated. For a cluster with 3 pods (e.g., `cockroachdb-0`, `cockroachdb-1`, `cockroachdb-2`) the partition value should be 2:

    ~~~ shell
    $ kubectl patch statefulset cockroachdb \
    -p='{"spec":{"updateStrategy":{"type":"RollingUpdate","rollingUpdate":{"partition":2}}}}'
    ~~~

    ~~~
    statefulset.apps/cockroachdb patched
    ~~~

1. Change the container image in the StatefulSet:

    ~~~ shell
    $ kubectl patch statefulset cockroachdb \
    --type='json' \
    -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value":"cockroachdb/cockroach:{{page.release_info.version}}"}]'
    ~~~

    ~~~
    statefulset.apps/cockroachdb patched
    ~~~

1. To check the status of the rolling upgrade, run `kubectl get pods`.
1. After the pod has been restarted with the new image, start the CockroachDB [built-in SQL client]({% link "{{ page.version.version }}/cockroach-sql.md" %}):

    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure \-- ./cockroach sql \
    --certs-dir=/cockroach-certs \
    --host=cockroachdb-public
    ~~~

1. Run the following SQL query to verify that the number of underreplicated ranges is zero:

    ~~~ sql
    SELECT sum((metrics->>'ranges.underreplicated')::DECIMAL)::INT AS ranges_underreplicated FROM crdb_internal.kv_store_status;
    ~~~

    ~~~
      ranges_underreplicated
    --------------------------
                           0
    (1 row)
    ~~~

    This indicates that it is safe to proceed to the next pod.

1. Exit the SQL shell:

    ~~~ sql
    > \q
    ~~~

1. Decrement the partition value by 1 to allow the next pod in the cluster to update:

    ~~~ shell
    $ kubectl patch statefulset cockroachdb \
    -p='{"spec":{"updateStrategy":{"type":"RollingUpdate","rollingUpdate":{"partition":1}}}}'
    ~~~

    ~~~
    statefulset.apps/cockroachdb patched
    ~~~

1. Repeat steps 4-8 until all pods have been restarted and are running the new image (the final partition value should be `0`).

1. Check the image of each pod to confirm that all have been upgraded:

    ~~~ shell
    $ kubectl get pods \
    -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}'
    ~~~

    ~~~
    cockroachdb-0   cockroachdb/cockroach:{{page.release_info.version}}
    cockroachdb-1   cockroachdb/cockroach:{{page.release_info.version}}
    cockroachdb-2   cockroachdb/cockroach:{{page.release_info.version}}
    ...
    ~~~

    You can also check the CockroachDB version of each node in the [DB Console]({% link "{{ page.version.version }}/ui-cluster-overview-page.md" %}#node-details).
1. If auto-finalization is disabled, the upgrade is not complete until you [finalize the upgrade](#finalize-a-major-version-upgrade-manually).

</section>

<section class="filter-content" markdown="1" data-scope="helm">

1. Add a [partition](https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/#staging-an-update) to the update strategy defined in the StatefulSet. Only the pods numbered greater than or equal to the partition value will be updated. For a cluster with 3 pods (e.g., `cockroachdb-0`, `cockroachdb-1`, `cockroachdb-2`) the partition value should be 2:

    ~~~ shell
    $ helm upgrade \
    my-release \
    cockroachdb/cockroachdb \
    --set statefulset.updateStrategy.rollingUpdate.partition=2
    ~~~

1. Connect to the cluster using the SQL shell:

    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach sql \
    --certs-dir=/cockroach-certs \
    --host=my-release-cockroachdb-public
    ~~~

1. Remove the cluster initialization job from when the cluster was created:

    ~~~ shell
    $ kubectl delete job my-release-cockroachdb-init
    ~~~

1. Change the container image in the StatefulSet:

    ~~~ shell
    $ helm upgrade \
    my-release \
    cockroachdb/cockroachdb \
    --set image.tag={{page.release_info.version}} \
    --reuse-values
    ~~~

    ~~~
    NAME                                READY     STATUS              RESTARTS   AGE
    my-release-cockroachdb-0            1/1       Running             0          2m
    my-release-cockroachdb-1            1/1       Running             0          3m
    my-release-cockroachdb-2            0/1       ContainerCreating   0          25s
    my-release-cockroachdb-init-nwjkh   0/1       ContainerCreating   0          6s
    ...
    ~~~

    {{site.data.alerts.callout_info}}
    Ignore the pod for cluster initialization. It is re-created as a byproduct of the StatefulSet configuration but does not impact your existing cluster.
    {{site.data.alerts.end}}

1. After the pod has been restarted with the new image, start the CockroachDB [built-in SQL client]({% link "{{ page.version.version }}/cockroach-sql.md" %}):

    {% if page.secure == true %}

    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach sql \
    --certs-dir=/cockroach-certs \
    --host=my-release-cockroachdb-public
    ~~~

    {% else %}

    ~~~ shell
    $ kubectl run cockroachdb -it \
    --image=cockroachdb/cockroach \
    --rm \
    --restart=Never \
    -- sql \
    --insecure \
    --host=my-release-cockroachdb-public
    ~~~
    {% endif %}

1. Run the following SQL query to verify that the number of underreplicated ranges is zero:

    ~~~ sql
    SELECT sum((metrics->>'ranges.underreplicated')::DECIMAL)::INT AS ranges_underreplicated FROM crdb_internal.kv_store_status;
    ~~~

    ~~~
      ranges_underreplicated
    --------------------------
                           0
    (1 row)
    ~~~

    This indicates that it is safe to proceed to the next pod.

1. Exit the SQL shell:

    ~~~ sql
    > \q
    ~~~

1. Decrement the partition value by 1 to allow the next pod in the cluster to update:

    ~~~ shell
    $ helm upgrade \
    my-release \
    cockroachdb/cockroachdb \
    --set statefulset.updateStrategy.rollingUpdate.partition=1 \
    ~~~

1. Repeat steps 4-8 until all pods have been restarted and are running the new image (the final partition value should be `0`).

1. Check the image of each pod to confirm that all have been upgraded:

    ~~~ shell
    $ kubectl get pods \
    -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}'
    ~~~

    ~~~
    my-release-cockroachdb-0    cockroachdb/cockroach:{{page.release_info.version}}
    my-release-cockroachdb-1    cockroachdb/cockroach:{{page.release_info.version}}
    my-release-cockroachdb-2    cockroachdb/cockroach:{{page.release_info.version}}
    ...
    ~~~

    You can also check the CockroachDB version of each node in the [DB Console]({% link "{{ page.version.version }}/ui-cluster-overview-page.md" %}#node-details).

1. If auto-finalization is disabled, the upgrade is not complete until you [finalize the upgrade](#finalize-a-major-version-upgrade-manually).

</section>
