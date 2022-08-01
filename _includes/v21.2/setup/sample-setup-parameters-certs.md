
<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="cockroachcloud">Use {{ site.data.products.serverless }}</button>
  <button class="filter-button page-level" data-scope="local">Use a Local Cluster</button>
</div>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

### Create a free cluster

{% include {{ page.version.version }}/setup/create-a-free-cluster.md %}

### Create a SQL user

{% include {{ page.version.version }}/setup/create-first-sql-user.md %}

### Get the root certificate

The **Connect to cluster** dialog shows information about how to connect to your cluster.

1. Select **General connection string** from the **Select option** dropdown.
1. Open a new terminal on your local machine, and run the **CA Cert download command** provided in the **Download CA Cert** section. The client driver used in this tutorial requires this certificate to connect to {{ site.data.products.db }}.

### Get the connection information

1. Select **Parameters only** from the **Select option** dropdown.
1. Copy the connection information for each parameter displayed and save it in a secure location.

</section>

<section class="filter-content" markdown="1" data-scope="local">

{% include {{ page.version.version }}/setup/start-single-node-insecure.md %}

</section>
