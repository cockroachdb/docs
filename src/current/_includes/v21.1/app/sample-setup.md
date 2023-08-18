
<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="cockroachcloud">Use CockroachDB {{ site.data.products.serverless }}</button>
  <button class="filter-button page-level" data-scope="local">Use a Local Cluster</button>
</div>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

### Create a free cluster

{% include cockroachcloud/quickstart/create-a-free-cluster.md %}

### Set up your cluster connection

1. Navigate to the cluster's **Overview** page, and select **Connect**.

1. Under the **Connection String** tab, download the cluster certificate.

1. Take note of the connection string provided. You'll use it to connect to the database later in this tutorial.

</section>

<section class="filter-content" markdown="1" data-scope="local">

1. If you haven't already, [download the CockroachDB binary](install-cockroachdb.html).
1. Run the [`cockroach start-single-node`](cockroach-start-single-node.html) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start-single-node --advertise-addr 'localhost' --insecure
    ~~~

    This starts an insecure, single-node cluster.
1. Take note of the following connection information in the SQL shell welcome text:

    ~~~
    CockroachDB node starting at 2021-08-30 17:25:30.06524 +0000 UTC (took 4.3s)
    build:               CCL v21.1.6 @ 2021/07/20 15:33:43 (go1.15.11)
    webui:               http://localhost:8080
    sql:                 postgresql://root@localhost:26257?sslmode=disable
    ~~~

    You'll use the `sql` connection string to connect to the cluster later in this tutorial.


{% include {{ page.version.version }}/prod-deployment/insecure-flag.md %}

</section>