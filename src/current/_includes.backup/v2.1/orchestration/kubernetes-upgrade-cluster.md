As new versions of CockroachDB are released, it's strongly recommended to upgrade to newer versions in order to pick up bug fixes, performance improvements, and new features. The [general CockroachDB upgrade documentation](upgrade-cockroach-version.html) provides best practices for how to prepare for and execute upgrades of CockroachDB clusters, but the mechanism of actually stopping and restarting processes in Kubernetes is somewhat special.

Kubernetes knows how to carry out a safe rolling upgrade process of the CockroachDB nodes. When you tell it to change the Docker image used in the CockroachDB StatefulSet, Kubernetes will go one-by-one, stopping a node, restarting it with the new image, and waiting for it to be ready to receive client requests before moving on to the next one. For more information, see [the Kubernetes documentation](https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/#updating-statefulsets).

1. Decide how the upgrade will be finalized.

    {{site.data.alerts.callout_info}}
    This step is relevant only when upgrading from v2.0.x to v2.1. For upgrades within the v2.1.x series, skip this step.
    {{site.data.alerts.end}}

    By default, after all nodes are running the new version, the upgrade process will be **auto-finalized**. This will enable certain performance improvements and bug fixes introduced in v2.1. After finalization, however, it will no longer be possible to perform a downgrade to v2.0. In the event of a catastrophic failure or corruption, the only option will be to start a new cluster using the old binary and then restore from one of the backups created prior to performing the upgrade.

    We recommend disabling auto-finalization so you can monitor the stability and performance of the upgraded cluster before finalizing the upgrade:

    {% if page.secure == true %}

    1. Get a shell into the pod with the `cockroach` binary created earlier and start the CockroachDB [built-in SQL client](use-the-built-in-sql-client.html):

        <section class="filter-content" markdown="1" data-scope="manual">
        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-client-secure -- ./cockroach sql --certs-dir=/cockroach-certs --host=cockroachdb-public
        ~~~
        </section>

        <section class="filter-content" markdown="1" data-scope="helm">
        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-client-secure -- ./cockroach sql --certs-dir=/cockroach-certs --host=my-release-cockroachdb-public
        ~~~
        </section>


    {% else %}

    1. Launch a temporary interactive pod and start the [built-in SQL client](use-the-built-in-sql-client.html) inside it:

        <section class="filter-content" markdown="1" data-scope="manual">
        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl run cockroachdb -it --image=cockroachdb/cockroach --rm --restart=Never \
        -- sql --insecure --host=cockroachdb-public
        ~~~
        </section>

        <section class="filter-content" markdown="1" data-scope="helm">
        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl run cockroachdb -it --image=cockroachdb/cockroach --rm --restart=Never \
        -- sql --insecure --host=my-release-cockroachdb-public
        ~~~
        </section>

    {% endif %}

    2. Set the `cluster.preserve_downgrade_option` [cluster setting](cluster-settings.html):

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        > SET CLUSTER SETTING cluster.preserve_downgrade_option = '2.0';
        ~~~

2. Kick off the upgrade process by changing the desired Docker image. To do so, pick the version that you want to upgrade to, then run the following command, replacing "VERSION" with your desired new version:

    <section class="filter-content" markdown="1" data-scope="manual">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl patch statefulset cockroachdb --type='json' -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value":"cockroachdb/cockroach:VERSION"}]'
    ~~~

    ~~~
    statefulset "cockroachdb" patched
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl patch statefulset my-release-cockroachdb --type='json' -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value":"cockroachdb/cockroach:VERSION"}]'
    ~~~

    ~~~
    statefulset "my-release0-cockroachdb" patched
    ~~~
    </section>

3. If you then check the status of your cluster's pods, you should see one of them being restarted:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    <section class="filter-content" markdown="1" data-scope="manual">
    ~~~
    NAME            READY     STATUS        RESTARTS   AGE
    cockroachdb-0   1/1       Running       0          2m
    cockroachdb-1   1/1       Running       0          2m
    cockroachdb-2   1/1       Running       0          2m
    cockroachdb-3   0/1       Terminating   0          1m
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    ~~~
    NAME                       READY     STATUS        RESTARTS   AGE
    my-release-cockroachdb-0   1/1       Running       0          2m
    my-release-cockroachdb-1   1/1       Running       0          2m
    my-release-cockroachdb-2   1/1       Running       0          2m
    my-release-cockroachdb-3   0/1       Terminating   0          1m
    ~~~
    </section>    

4. This will continue until all of the pods have restarted and are running the new image. To check the image of each pod to determine whether they've all be upgraded, run:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}'
    ~~~

    <section class="filter-content" markdown="1" data-scope="manual">
    ~~~
    cockroachdb-0	cockroachdb/cockroach:{{page.release_info.version}}
    cockroachdb-1	cockroachdb/cockroach:{{page.release_info.version}}
    cockroachdb-2	cockroachdb/cockroach:{{page.release_info.version}}
    cockroachdb-3	cockroachdb/cockroach:{{page.release_info.version}}
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    ~~~
    my-release-cockroachdb-0	cockroachdb/cockroach:{{page.release_info.version}}
    my-release-cockroachdb-1	cockroachdb/cockroach:{{page.release_info.version}}
    my-release-cockroachdb-2	cockroachdb/cockroach:{{page.release_info.version}}
    my-release-cockroachdb-3	cockroachdb/cockroach:{{page.release_info.version}}
    ~~~
    </section>

5. Finish the upgrade.

    {{site.data.alerts.callout_info}}This step is relevant only when upgrading from v2.0.x to v2.1. For upgrades within the v2.1.x series, skip this step.{{site.data.alerts.end}}

    If you disabled auto-finalization in step 1 above, monitor the stability and performance of your cluster for as long as you require to feel comfortable with the upgrade (generally at least a day). If during this time you decide to roll back the upgrade, repeat the rolling restart procedure with the old binary.

    Once you are satisfied with the new version, re-enable auto-finalization:

    {% if page.secure == true %}

    1. Get a shell into the pod with the `cockroach` binary created earlier and start the CockroachDB [built-in SQL client](use-the-built-in-sql-client.html):

        <section class="filter-content" markdown="1" data-scope="manual">
        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-client-secure -- ./cockroach sql --certs-dir=/cockroach-certs --host=cockroachdb-public
        ~~~
        </section>

        <section class="filter-content" markdown="1" data-scope="helm">
        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-client-secure -- ./cockroach sql --certs-dir=/cockroach-certs --host=my-release-cockroachdb-public
        ~~~
        </section>

    {% else %}

    1. Launch a temporary interactive pod and start the [built-in SQL client](use-the-built-in-sql-client.html) inside it:

        <section class="filter-content" markdown="1" data-scope="manual">
        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl run cockroachdb -it --image=cockroachdb/cockroach --rm --restart=Never \
        -- sql --insecure --host=cockroachdb-public
        ~~~
        </section>

        <section class="filter-content" markdown="1" data-scope="helm">
        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl run cockroachdb -it --image=cockroachdb/cockroach --rm --restart=Never \
        -- sql --insecure --host=my-release-cockroachdb-public
        ~~~
        </section>      

    {% endif %}

    2. Re-enable auto-finalization:

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        > RESET CLUSTER SETTING cluster.preserve_downgrade_option;
        ~~~
