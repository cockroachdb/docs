To access the cluster's [Admin UI](admin-ui-overview.html):

1. Port-forward from your local machine to one of the pods:

    <section class="filter-content" markdown="1" data-scope="manual">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl port-forward cockroachdb-0 8080
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl port-forward my-release-cockroachdb-0 8080
    ~~~
    </section>

    ~~~
    Forwarding from 127.0.0.1:8080 -> 8080
    ~~~

    {{site.data.alerts.callout_info}}The <code>port-forward</code> command must be run on the same machine as the web browser in which you want to view the Admin UI. If you have been running these commands from a cloud instance or other non-local shell, you will not be able to view the UI without configuring <code>kubectl</code> locally and running the above <code>port-forward</code> command on your local machine.{{site.data.alerts.end}}

{% if page.secure == true %}

2. Go to <a href="https://localhost:8080/" data-proofer-ignore>https://localhost:8080</a> and log in with the username and password you created earlier.

{% else %}

2. Go to <a href="http://localhost:8080/" data-proofer-ignore>http://localhost:8080</a>.

{% endif %}

3. In the UI, verify that the cluster is running as expected:
    - Click **View nodes list** on the right to ensure that all nodes successfully joined the cluster.
    - Click the **Databases** tab on the left to verify that `bank` is listed.
