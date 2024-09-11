To use the CockroachDB SQL client, first launch a secure pod running the `cockroach` binary.

<section class="filter-content" markdown="1" data-scope="operator">

{% capture latest_operator_version %}{% include_cached latest_operator_version.md %}{% endcapture %}

1. From your local workstation, use the [Kubernetes Operator](https://github.com/cockroachdb/cockroach-operator/) file to launch a pod and keep it running indefinitely.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create \
    -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/v{{ latest_operator_version }}/examples/client-secure-operator.yaml
    ~~~

</section>

<section class="filter-content" markdown="1" data-scope="manual">

1. From your local workstation, apply the [example `client.yaml` StatefulSet](https://github.com/cockroachdb/cockroach/master/cloud/kubernetes/bring-your-own-certs/client.yaml).

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create \
    -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/bring-your-own-certs/client.yaml
    ~~~

    ~~~
    pod/cockroachdb-client-secure created
    ~~~

</section>

<section class="filter-content" markdown="1" data-scope="helm">

1. From your local workstation, download our [`client-secure.yaml`](https://github.com/cockroachdb/helm-charts/blob/master/examples/client-secure.yaml) example:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl -OOOOOOOOO \
    https://raw.githubusercontent.com/cockroachdb/helm-charts/master/examples/client-secure.yaml
    ~~~

1. In the file, set the following values:
    - `spec.serviceAccountName: my-release-cockroachdb`
    - `spec.image: cockroachdb/cockroach: {your CockroachDB version}`
    - `spec.volumes[0].project.sources[0].secret.name: my-release-cockroachdb-client-secret`

1. Use the file to launch a pod.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f client-secure.yaml
    ~~~

    ~~~
    pod "cockroachdb-client-secure" created
    ~~~

</section>

    {{site.data.alerts.callout_success}}
    This pod will continue running indefinitely, so any time you need to reopen the built-in SQL client or run any other [`cockroach` client commands]({% link {{ page.version.version }}/cockroach-commands.md %}) (e.g., `cockroach node`), repeat step 2 using the appropriate `cockroach` command.

    If you'd prefer to delete the pod and recreate it when needed, run `kubectl delete pod cockroachdb-client-secure`.
    {{site.data.alerts.end}}

1. Get a shell into the pod and start the CockroachDB [built-in SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach sql \
    --certs-dir=/cockroach/cockroach-certs \
    --host=cockroachdb-public
    ~~~

    ~~~
    # Welcome to the CockroachDB SQL shell.
    # All statements must be terminated by a semicolon.
    # To exit, type: \q.
    #
    # Server version: CockroachDB CCL v21.1.0 (x86_64-unknown-linux-gnu, built 2021/04/23 13:54:57, go1.13.14) (same version as client)
    # Cluster ID: a96791d9-998c-4683-a3d3-edbf425bbf11
    #
    # Enter \? for a brief introduction.
    #
    root@cockroachdb-public:26257/defaultdb>
    ~~~

{% include common/orchestration/kubernetes-basic-sql.md %}
