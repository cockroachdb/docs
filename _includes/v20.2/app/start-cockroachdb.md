Choose whether to run a temporary local cluster or a free CockroachDB cluster on {{ site.data.products.serverless }}. The instructions below will adjust accordingly.

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="cockroachcloud">Use {{ site.data.products.serverless-plan }}</button>
  <button class="filter-button page-level" data-scope="local">Use a Local Cluster</button>
</div>

  <section class="filter-content" markdown="1" data-scope="cockroachcloud">

### Create a free cluster

{% include cockroachcloud/quickstart/create-a-free-cluster.md %}

### Set up your cluster connection

{% include cockroachcloud/quickstart/set-up-your-cluster-connection.md %}

  </section>

<section class="filter-content" markdown="1" data-scope="local">

1. If you haven't already, [download the CockroachDB binary](install-cockroachdb.html).
1. Run the [`cockroach demo`](cockroach-demo.html) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach demo \
    --empty
    ~~~

    This starts a temporary, in-memory cluster and opens an interactive SQL shell to the cluster. Any changes to the database will not persist after the cluster is stopped.
1. Take note of the `(sql/tcp)` connection string in the SQL shell welcome text:

    ~~~
    # Connection parameters:
    #   (console) http://127.0.0.1:61009
    #   (sql)     postgres://root:admin@?host=%2Fvar%2Ffolders%2Fk1%2Fr048yqpd7_9337rgxm9vb_gw0000gn%2FT%2Fdemo255013852&port=26257
    #   (sql/tcp) postgres://root:admin@127.0.0.1:61011?sslmode=require    
    ~~~

    In this example, the port number is 61011. You will use the port number in your application code later.

</section>
