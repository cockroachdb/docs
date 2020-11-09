It is strongly recommended that you regularly upgrade your CockroachDB version in order to pick up bug fixes, performance improvements, and new features. The [CockroachDB upgrade documentation](upgrade-cockroach-version.html) describes how to perform a "rolling upgrade" of a CockroachDB cluster by stopping and restarting nodes one at a time. This is to ensure that the cluster remains available during the upgrade.

The corresponding process on Kubernetes is a [staged update](https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/#staging-an-update), in which the Docker image is updated in the CockroachDB StatefulSet and then applied to the pods one at a time.

1. Decide how the upgrade will be finalized.

    {{site.data.alerts.callout_info}}
    This step is relevant only when upgrading from v20.1.x to v20.2. For upgrades within the v20.2.x series, skip this step.
    {{site.data.alerts.end}}

    By default, after all nodes are running the new version, the upgrade process will be **auto-finalized**. This will enable certain performance improvements and bug fixes introduced in v20.2. After finalization, however, it will no longer be possible to perform a downgrade to v20.1. In the event of a catastrophic failure or corruption, the only option will be to start a new cluster using the old binary and then restore from one of the backups created prior to performing the upgrade.

    We recommend disabling auto-finalization so you can monitor the stability and performance of the upgraded cluster before finalizing the upgrade:

    {% if page.secure == true %}

    1. Start the CockroachDB [built-in SQL client](cockroach-sql.html):

        <section class="filter-content" markdown="1" data-scope="operator">
        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-2 \
        -- ./cockroach sql \
        --certs-dir cockroach-certs
        ~~~
        </section>

        <section class="filter-content" markdown="1" data-scope="manual">
        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-client-secure \-- ./cockroach sql \
        --certs-dir=/cockroach-certs \
        --host=cockroachdb-public
        ~~~
        </section>

        <section class="filter-content" markdown="1" data-scope="helm">
        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-client-secure \
        -- ./cockroach sql \
        --certs-dir=/cockroach-certs \
        --host=my-release-cockroachdb-public
        ~~~
        </section>

    {% else %}

    1. Launch a temporary interactive pod and start the [built-in SQL client](cockroach-sql.html) inside it:

        <section class="filter-content" markdown="1" data-scope="manual">
        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl run cockroachdb -it \
        --image=cockroachdb/cockroach \
        --rm \
        --restart=Never \
        -- sql \
        --insecure \
        --host=cockroachdb-public
        ~~~
        </section>

        <section class="filter-content" markdown="1" data-scope="helm">
        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl run cockroachdb -it \
        --image=cockroachdb/cockroach \
        --rm \
        --restart=Never \
        -- sql \
        --insecure \
        --host=my-release-cockroachdb-public
        ~~~
        </section>

    {% endif %}

    1. Set the `cluster.preserve_downgrade_option` [cluster setting](cluster-settings.html) to the version you are upgrading from:

        {% include copy-clipboard.html %}
        ~~~ sql
        > SET CLUSTER SETTING cluster.preserve_downgrade_option = '20.1';
        ~~~
        
    1. Exit the SQL shell and pod:

        {% include copy-clipboard.html %}
        ~~~ sql
        > \q
        ~~~

1. Change the desired Docker image:

    <section class="filter-content" markdown="1" data-scope="operator">

    Open and edit `example.yaml`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ vi example.yaml
    ~~~

    ~~~
    image:
      name: cockroachdb/cockroach:{{page.release_info.version}}
    ~~~

    Apply `example.yaml` with the new image:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply -f example.yaml
    ~~~

    The Operator will perform the staged update.
    </section>

    <section class="filter-content" markdown="1" data-scope="manual">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl patch statefulset cockroachdb \
    --type='json' \
    -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value":"cockroachdb/cockroach:{{page.release_info.version}}"}]'
    ~~~

    ~~~
    statefulset.apps/cockroachdb patched
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    {{site.data.alerts.callout_info}}
    For Helm, you must remove the cluster initialization job from when the cluster was created before the cluster version can be changed.
    {{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete job my-release-cockroachdb-init
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ helm upgrade \
    my-release \
    cockroachdb/cockroachdb \
    --set image.tag={{page.release_info.version}} \
    --reuse-values
    ~~~
    </section>

1. If you then check the status of your cluster's pods, you should see them being restarted:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    <section class="filter-content" markdown="1" data-scope="operator">
    ~~~
    NAME            READY     STATUS        RESTARTS   AGE
    cockroachdb-0   1/1       Running       0          2m
    cockroachdb-1   1/1       Running       0          2m
    cockroachdb-2   1/1       Running       0          2m
    cockroachdb-3   0/1       Terminating   0          1m
    ...
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="manual">
    ~~~
    NAME            READY     STATUS        RESTARTS   AGE
    cockroachdb-0   1/1       Running       0          2m
    cockroachdb-1   1/1       Running       0          2m
    cockroachdb-2   0/1       Terminating   0          1m
    ...
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
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
    </section>    
    
1. This will continue until all of the pods have restarted and are running the new image. To check the image of each pod to determine whether they've all be upgraded, run:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods \
    -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}'
    ~~~

    <section class="filter-content" markdown="1" data-scope="operator">
    ~~~
    cockroachdb-0   cockroachdb/cockroach:{{page.release_info.version}}
    cockroachdb-1   cockroachdb/cockroach:{{page.release_info.version}}
    cockroachdb-2   cockroachdb/cockroach:{{page.release_info.version}}
    cockroachdb-3   cockroachdb/cockroach:{{page.release_info.version}}
    ...
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="manual">
    ~~~
    cockroachdb-0   cockroachdb/cockroach:{{page.release_info.version}}
    cockroachdb-1   cockroachdb/cockroach:{{page.release_info.version}}
    cockroachdb-2   cockroachdb/cockroach:{{page.release_info.version}}
    ...
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    ~~~
    my-release-cockroachdb-0    cockroachdb/cockroach:{{page.release_info.version}}
    my-release-cockroachdb-1    cockroachdb/cockroach:{{page.release_info.version}}
    my-release-cockroachdb-2    cockroachdb/cockroach:{{page.release_info.version}}
    ...
    ~~~
    </section>

    You can also check the CockroachDB version of each node in the [DB Console](ui-cluster-overview-page.html#node-details).

1. Finish the upgrade.

    {{site.data.alerts.callout_info}}
    This step is relevant only when upgrading from v20.1.x to v20.2. For upgrades within the v20.2.x series, skip this step.
    {{site.data.alerts.end}}

    If you disabled auto-finalization in step 1 above, monitor the stability and performance of your cluster for as long as you require to feel comfortable with the upgrade (generally at least a day). If during this time you decide to roll back the upgrade, repeat the rolling restart procedure with the old binary.

    Once you are satisfied with the new version, re-enable auto-finalization.

    {% if page.secure == true %}
    
    1. Start the CockroachDB [built-in SQL client](cockroach-sql.html):

        <section class="filter-content" markdown="1" data-scope="operator">
        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-2 \
        -- ./cockroach sql \
        --certs-dir cockroach-certs
        ~~~    
        </section>

        <section class="filter-content" markdown="1" data-scope="manual">
        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-client-secure \
        -- ./cockroach sql \
        --certs-dir=/cockroach-certs \
        --host=cockroachdb-public
        ~~~
        </section>

        <section class="filter-content" markdown="1" data-scope="helm">
        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-client-secure \
        -- ./cockroach sql \
        --certs-dir=/cockroach-certs \
        --host=my-release-cockroachdb-public
        ~~~
        </section>

    {% else %}

    1. Launch a temporary interactive pod and start the [built-in SQL client](cockroach-sql.html) inside it:

        <section class="filter-content" markdown="1" data-scope="manual">
        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl run cockroachdb -it \
        --image=cockroachdb/cockroach \
        --rm \
        --restart=Never \
        -- sql \
        --insecure \
        --host=cockroachdb-public
        ~~~
        </section>

        <section class="filter-content" markdown="1" data-scope="helm">
        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl run cockroachdb -it \
        --image=cockroachdb/cockroach \
        --rm \
        --restart=Never \
        -- sql \
        --insecure \
        --host=my-release-cockroachdb-public
        ~~~
        </section>      

    {% endif %}

    1. Re-enable auto-finalization:

        {% include copy-clipboard.html %}
        ~~~ sql
        > RESET CLUSTER SETTING cluster.preserve_downgrade_option;
        ~~~

    1. Exit the SQL shell and pod:

        {% include copy-clipboard.html %}
        ~~~ sql
        > \q
        ~~~
