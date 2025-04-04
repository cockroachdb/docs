{% assign previous_version = site.data.versions | where_exp: "previous_version", "previous_version.major_version == page.version.version" | first | map: "previous_version" %}

1. Verify that you can upgrade.

    To upgrade to a new major version, you must first be on a production release of the previous version. The release does not need to be the latest production release of the previous version, but it must be a production [release](../releases/index.html) and not a testing release (alpha/beta).

    Therefore, in order to upgrade to {{ page.version.version }}, you must be on a production release of {{ previous_version }}.

    1. If you are upgrading to {{ page.version.version }} from a production release earlier than {{ previous_version }}, or from a testing release (alpha/beta), first [upgrade to a production release of {{ previous_version }}]({% link {{ previous_version }}/upgrade-cockroachdb-kubernetes.md %}?filters=helm). Be sure to complete all the steps.

    1. Then return to this page and perform a second upgrade to {{ page.version.version }}.

    1. If you are upgrading from any production release of {{ previous_version }}, or from any earlier {{ page.version.version }} patch release, you do not have to go through intermediate releases; continue to step 2.

1. Verify the overall health of your cluster using the [DB Console](ui-overview.html). On the **Overview**:
    - Under **Node Status**, make sure all nodes that should be live are listed as such. If any nodes are unexpectedly listed as suspect or dead, identify why the nodes are offline and either restart them or [decommission](scale-cockroachdb-kubernetes.html?filters=helm#remove-nodes) them before beginning your upgrade. If there are dead and non-decommissioned nodes in your cluster, it will not be possible to finalize the upgrade (either automatically or manually).
    - Under **Replication Status**, make sure there are 0 under-replicated and unavailable ranges. Otherwise, performing a rolling upgrade increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability. Therefore, it's important to [identify and resolve the cause of range under-replication and/or unavailability](cluster-setup-troubleshooting.html#replication-issues) before beginning your upgrade.
    - In the **Node List**:
        - Make sure all nodes are on the same version. If not all nodes are on the same version, upgrade them to the cluster's highest current version first, and then start this process over.
        - Make sure capacity and memory usage are reasonable for each node. Nodes must be able to tolerate some increase in case the new version uses more resources for your workload. Also go to **Metrics > Dashboard: Hardware** and make sure CPU percent is reasonable across the cluster. If there's not enough headroom on any of these metrics, consider [adding nodes](scale-cockroachdb-kubernetes.html?filters=helm#add-nodes) to your cluster before beginning your upgrade.

{% assign rd = site.data.versions | where_exp: "rd", "rd.major_version == page.version.version" | first %}

1. Review the [backward-incompatible changes in {{ page.version.version }}](../releases/{{ page.version.version }}.html{% unless rd.release_date == "N/A" or rd.release_date > today %}#{{ page.version.version | replace: ".", "-" }}-0-backward-incompatible-changes{% endunless %}) and [deprecated features](../releases/{{ page.version.version }}.html#{% unless rd.release_date == "N/A" or rd.release_date > today %}{{ page.version.version | replace: ".", "-" }}-0-deprecations{% endunless %}). If any affect your deployment, make the necessary changes before starting the rolling upgrade to {{ page.version.version }}.

1. Decide how the upgrade will be finalized.

    By default, after all nodes are running the new version, the upgrade process will be **auto-finalized**. This will enable certain [features and performance improvements introduced in {{ page.version.version }}](upgrade-cockroach-version.html#features-that-require-upgrade-finalization). After finalization, however, it will no longer be possible to perform a downgrade to {{ previous_version }}. In the event of a catastrophic failure or corruption, the only option is to start a new cluster using the old binary and then restore from a [backup](take-full-and-incremental-backups.html) created prior to the upgrade. For this reason, **we recommend disabling auto-finalization** so you can monitor the stability and performance of the upgraded cluster before finalizing the upgrade, but note that you will need to follow all of the subsequent directions, including the manual finalization in a later step.

    {{site.data.alerts.callout_info}}
    Finalization only applies when performing a major version upgrade (for example, from {{ previous_version }}.x to {{ page.version.version }}). Patch version upgrades (for example, within the {{ page.version.version }}.x series) can always be downgraded.
    {{site.data.alerts.end}}

    {% if page.secure == true %}

    1. Get a shell into the pod with the `cockroach` binary created earlier and start the CockroachDB [built-in SQL client](cockroach-sql.html):

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-client-secure \
        -- ./cockroach sql \
        --certs-dir=/cockroach-certs \
        --host=my-release-cockroachdb-public
        ~~~

    {% else %}

    1. Launch a temporary interactive pod and start the [built-in SQL client](cockroach-sql.html) inside it:

        {% include_cached copy-clipboard.html %}
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

    1. Set the `cluster.preserve_downgrade_option` [cluster setting](cluster-settings.html) to the version you are upgrading from:

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        > SET CLUSTER SETTING cluster.preserve_downgrade_option = '{{ previous_version | remove_first: "v" }}';
        ~~~

    1. Exit the SQL shell and delete the temporary pod:

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        > \q
        ~~~

1. Add a [partition](https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/#staging-an-update) to the update strategy defined in the StatefulSet. Only the pods numbered greater than or equal to the partition value will be updated. For a cluster with 3 pods (e.g., `cockroachdb-0`, `cockroachdb-1`, `cockroachdb-2`) the partition value should be 2:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ helm upgrade \
    my-release \
    cockroachdb/cockroachdb \
    --set statefulset.updateStrategy.rollingUpdate.partition=2
    ~~~

1. Kick off the upgrade process by changing the Docker image used in the CockroachDB StatefulSet:

    {{site.data.alerts.callout_info}}
    For Helm, you must remove the cluster initialization job from when the cluster was created before the cluster version can be changed.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete job my-release-cockroachdb-init
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ helm upgrade \
    my-release \
    cockroachdb/cockroachdb \
    --set image.tag={{page.release_info.version}} \
    --reuse-values
    ~~~

1. Check the status of your cluster's pods. You should see one of them being restarted:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
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

1. After the pod has been restarted with the new image, start the CockroachDB [built-in SQL client](cockroach-sql.html):

    {% if page.secure == true %}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach sql \
    --certs-dir=/cockroach-certs \
    --host=my-release-cockroachdb-public
    ~~~

    {% else %}

    {% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

1. Decrement the partition value by 1 to allow the next pod in the cluster to update:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ helm upgrade \
    my-release \
    cockroachdb/cockroachdb \
    --set statefulset.updateStrategy.rollingUpdate.partition=1 \
    ~~~

1. Repeat steps 4-8 until all pods have been restarted and are running the new image (the final partition value should be `0`).

1. Check the image of each pod to confirm that all have been upgraded:

    {% include_cached copy-clipboard.html %}
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

    You can also check the CockroachDB version of each node in the [DB Console](ui-cluster-overview-page.html#node-details).


1. If you disabled auto-finalization earlier, monitor the stability and performance of your cluster until you are comfortable with the upgrade (generally at least a day).

    If you decide to roll back the upgrade, repeat the rolling restart procedure with the old binary.

    {{site.data.alerts.callout_info}}
    This is only possible when performing a major version upgrade (for example, from {{ previous_version }}.x to {{ page.version.version }}). Patch version upgrades (for example, within the {{ page.version.version }}.x series) are auto-finalized.
    {{site.data.alerts.end}}

    To finalize the upgrade, re-enable auto-finalization:

    {% if page.secure == true %}

    1. Get a shell into the pod with the `cockroach` binary created earlier and start the CockroachDB [built-in SQL client](cockroach-sql.html):

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-client-secure \
        -- ./cockroach sql \
        --certs-dir=/cockroach-certs \
        --host=my-release-cockroachdb-public
        ~~~

    {% else %}

    1. Launch a temporary interactive pod and start the [built-in SQL client](cockroach-sql.html) inside it:

        {% include_cached copy-clipboard.html %}
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

    2. Re-enable auto-finalization:

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        > RESET CLUSTER SETTING cluster.preserve_downgrade_option;
        ~~~

    3. Exit the SQL shell and delete the temporary pod:

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        > \q
        ~~~
