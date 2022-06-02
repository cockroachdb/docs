
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

### Get the connection string

Open the **General connection string** section, then copy the connection string provided and save it in a secure location.

{{site.data.alerts.callout_info}}
The connection string is pre-populated with your username, password, cluster name, and other details. Your password, in particular, will be provided *only once*. Save it in a secure place (Cockroach Labs recommends a password manager) to connect to your cluster in the future. If you forget your password, you can reset it by going to the [**SQL Users** page](../cockroachcloud/user-authorization.html).
{{site.data.alerts.end}}

</section>

<section class="filter-content" markdown="1" data-scope="local">

{% include {{ page.version.version }}/setup/start-single-node-insecure.md %}

</section>
