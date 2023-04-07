Choose whether to run a temporary local cluster or a free CockroachDB cluster on {{ site.data.products.serverless }}. The instructions below will adjust accordingly.

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="cockroachcloud">Use {{ site.data.products.serverless }}</button>
  <button class="filter-button page-level" data-scope="local">Use a Local Cluster</button>
</div>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

### Create a free cluster

{% include cockroachcloud/quickstart/create-a-free-cluster.md %}

### Set up your cluster connection

The **Connection info** dialog shows information about how to connect to your cluster.

1. Click the **Choose your OS** dropdown, and select the operating system of your local machine.

1. Click the **Connection string** tab in the **Connection info** dialog.

1. Open a new terminal on your local machine, and run the command provided in step **1** to download the CA certificate. This certificate is required by some clients connecting to {{ site.data.products.db }}.

1. Copy the connection string provided in step **2** to a secure location.

    {{site.data.alerts.callout_info}}
    The connection string is pre-populated with your username, password, cluster name, and other details. Your password, in particular, will be provided *only once*. Save it in a secure place (Cockroach Labs recommends a password manager) to connect to your cluster in the future. If you forget your password, you can reset it by going to the [**SQL Users** page](../cockroachcloud/managing-access.html).
    {{site.data.alerts.end}}

</section>

<section class="filter-content" markdown="1" data-scope="local">

1. If you haven't already, [download the CockroachDB binary](install-cockroachdb.html).
1. Run the [`cockroach demo`](cockroach-demo.html) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach demo \
    --no-example-database
    ~~~

    This starts a temporary, in-memory cluster and opens an interactive SQL shell to the cluster. Any changes to the database will not persist after the cluster is stopped.

    {{site.data.alerts.callout_info}}
    If `cockroach demo` fails due to SSL authentication, make sure you have cleared any previously downloaded CA certificates from the directory `~/.postgresql`.
    {{site.data.alerts.end}}

1. Take note of the `(sql)` connection string in the SQL shell welcome text:

    ~~~
    # Connection parameters:
    #   (webui)    http://127.0.0.1:8080/demologin?password=demo76950&username=demo
    #   (sql)      postgres://demo:demo76950@127.0.0.1:26257?sslmode=require
    #   (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26257
    ~~~

</section>
