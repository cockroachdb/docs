Choose whether to run a temporary local cluster or a free CockroachDB cluster on CockroachCloud. The instructions below will adjust accordingly.

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="cockroachcloud">Use CockroachCloud</button>
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

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach demo \
    --empty
    ~~~

    This starts a temporary, in-memory cluster and opens an interactive SQL shell to the cluster. Any changes to the database will not persist after the cluster is stopped.
1. Take note of the `(sql/tcp)` connection string in the SQL shell welcome text:

    ~~~
    # Connection parameters:
    #   (console) http://127.0.0.1:8080/demologin?password=demo11762&username=demo
    #   (sql)     postgres://demo:demo11762@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo382139081&port=26257
    #   (sql/tcp) postgres://demo:demo11762@127.0.0.1:26257?sslmode=require
    ~~~

</section>
