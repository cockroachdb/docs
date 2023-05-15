<section class="filter-content" markdown="1" data-scope="operator">
1. Get a shell into one of the pods and start the CockroachDB [built-in SQL client](cockroach-sql.html):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-2 \
    -- ./cockroach sql \
    --certs-dir cockroach-certs
    ~~~

    ~~~
    # Welcome to the CockroachDB SQL shell.
    # All statements must be terminated by a semicolon.
    # To exit, type: \q.
    #
    # Server version: CockroachDB CCL v20.2.0 (x86_64-unknown-linux-gnu, built 2020/07/29 22:56:36, go1.13.9) (same version as client)
    # Cluster ID: f82abd88-5d44-4493-9558-d6c75a3b80cc
    #
    # Enter \? for a brief introduction.
    #
    root@:26257/defaultdb>
    ~~~

{% include {{ page.version.version }}/orchestration/kubernetes-basic-sql.md %}
</section>

<section class="filter-content" markdown="1" data-scope="manual">
To use the built-in SQL client, you need to launch a pod that runs indefinitely with the `cockroach` binary inside it, get a shell into the pod, and then start the built-in SQL client.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create \
    -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/bring-your-own-certs/client.yaml
    ~~~
    
    ~~~
    pod/cockroachdb-client-secure created
    ~~~

1. Get a shell into the pod and start the CockroachDB [built-in SQL client](cockroach-sql.html):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach sql \
    --certs-dir=/cockroach-certs \
    --host=cockroachdb-public
    ~~~

    ~~~
    # Welcome to the CockroachDB SQL shell.
    # All statements must be terminated by a semicolon.
    # To exit, type: \q.
    #
    # Server version: CockroachDB CCL v20.2.0 (x86_64-unknown-linux-gnu, built 2020/07/29 22:56:36, go1.13.9) (same version as client)
    # Cluster ID: f82abd88-5d44-4493-9558-d6c75a3b80cc
    #
    # Enter \? for a brief introduction.
    #
    root@:26257/defaultdb>
    ~~~

    {{site.data.alerts.callout_success}}
    This pod will continue running indefinitely, so any time you need to reopen the built-in SQL client or run any other [`cockroach` client commands](cockroach-commands.html) (e.g., `cockroach node`), repeat step 2 using the appropriate `cockroach` command.

    If you'd prefer to delete the pod and recreate it when needed, run `kubectl delete pod cockroachdb-client-secure`.
    {{site.data.alerts.end}}

{% include {{ page.version.version }}/orchestration/kubernetes-basic-sql.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
To use the built-in SQL client, you need to launch a pod that runs indefinitely with the `cockroach` binary inside it, get a shell into the pod, and then start the built-in SQL client.

1. From your local workstation, use our [`client-secure.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/client-secure.yaml) file to launch a pod and keep it running indefinitely.

    1. Download the file:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ curl -OOOOOOOOO \
        https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/client-secure.yaml
        ~~~

    1. In the file, change `serviceAccountName: cockroachdb` to `serviceAccountName: my-release-cockroachdb`.

    1. Use the file to launch a pod and keep it running indefinitely:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl create -f client-secure.yaml
        ~~~

        ~~~
        pod "cockroachdb-client-secure" created
        ~~~

1. Get a shell into the pod and start the CockroachDB [built-in SQL client](cockroach-sql.html):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach sql \
    --certs-dir=/cockroach-certs \
    --host=my-release-cockroachdb-public
    ~~~

    ~~~
    # Welcome to the CockroachDB SQL shell.
    # All statements must be terminated by a semicolon.
    # To exit, type: \q.
    #
    # Server version: CockroachDB CCL v20.2.0 (x86_64-unknown-linux-gnu, built 2020/07/29 22:56:36, go1.13.9) (same version as client)
    # Cluster ID: f82abd88-5d44-4493-9558-d6c75a3b80cc
    #
    # Enter \? for a brief introduction.
    #
    root@:26257/defaultdb>
    ~~~

    {{site.data.alerts.callout_success}}
    This pod will continue running indefinitely, so any time you need to reopen the built-in SQL client or run any other [`cockroach` client commands](cockroach-commands.html) (e.g., `cockroach node`), repeat step 2 using the appropriate `cockroach` command.

    If you'd prefer to delete the pod and recreate it when needed, run `kubectl delete pod cockroachdb-client-secure`.
    {{site.data.alerts.end}}

{% include {{ page.version.version }}/orchestration/kubernetes-basic-sql.md %}
</section>