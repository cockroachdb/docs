To access the cluster's [Admin UI](admin-ui-overview.html):

1. Port-forward from your local machine to one of the pods:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl port-forward cockroachdb-0 8080
    ~~~

    ~~~
    Forwarding from 127.0.0.1:8080 -> 8080
    ~~~

2. Go to <a href="http://localhost:8080/" data-proofer-ignore>http://localhost:8080</a>.

3. In the UI, verify that the cluster is running as expected:
    - Click **View nodes list** on the right to ensure that all nodes successfully joined the cluster.
    - Click the **Databases** tab on the left to verify that `bank` is listed.
