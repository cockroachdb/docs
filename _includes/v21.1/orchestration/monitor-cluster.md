To access the cluster's [DB Console](ui-overview.html):

{% if page.secure == true %}

1. On secure clusters, [certain pages of the DB Console](ui-overview.html#db-console-access) can only be accessed by `admin` users.

    Get a shell into the pod and start the CockroachDB [built-in SQL client](cockroach-sql.html):

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
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach sql \
    --certs-dir=/cockroach-certs \
    --host=my-release-cockroachdb-public
    </section>

1.  Assign `roach` to the `admin` role (you only need to do this once):

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT admin TO roach;
    ~~~

1. Exit the SQL shell and pod:

    {% include copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~
    
{% endif %}

1. In a new terminal window, port-forward from your local machine to the `cockroachdb-public` service:

    <section class="filter-content" markdown="1" data-scope="operator">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl port-forward service/cockroachdb-public 8080
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="manual">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl port-forward service/cockroachdb-public 8080
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl port-forward service/my-release-cockroachdb-public 8080
    ~~~
    </section>

    ~~~
    Forwarding from 127.0.0.1:8080 -> 8080
    ~~~

    {{site.data.alerts.callout_info}}The <code>port-forward</code> command must be run on the same machine as the web browser in which you want to view the DB Console. If you have been running these commands from a cloud instance or other non-local shell, you will not be able to view the UI without configuring <code>kubectl</code> locally and running the above <code>port-forward</code> command on your local machine.{{site.data.alerts.end}}

{% if page.secure == true %}

1. Go to <a href="https://localhost:8080/" data-proofer-ignore>https://localhost:8080</a> and log in with the username and password you created earlier.

    {% include {{ page.version.version }}/misc/chrome-localhost.md %}

{% else %}

1. Go to <a href="http://localhost:8080/" data-proofer-ignore>http://localhost:8080</a>.

{% endif %}

1. In the UI, verify that the cluster is running as expected:
    - View the [Node List](ui-cluster-overview-page.html#node-list) to ensure that all nodes successfully joined the cluster.
    - Click the **Databases** tab on the left to verify that `bank` is listed.
