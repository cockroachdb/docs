
<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="cockroachcloud">Use {{ site.data.products.serverless }}</button>
  <button class="filter-button page-level" data-scope="local">Use a Local Cluster</button>
</div>

<div class="filter-content" markdown="1" data-scope="cockroachcloud">


<h3>Choose your installation method</h3>

You can install a {{ site.data.products.serverless }} cluster using either the CockroachDB Cloud Console, a web-based graphical user interface (GUI) tool, or <code>ccloud</code>, a command-line interface (CLI) tool.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="console">Use the Cloud Console (GUI)<strong></strong></button>
    <button class="filter-button page-level" data-scope="ccloud"><strong>Use <code>ccloud</code> (CLI)</strong></button>
</div>

<div class="filter-content" markdown="1" data-scope="console">

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

</div>

<div class="filter-content" markdown="1" data-scope="ccloud">

Follow these steps to create a {{ site.data.products.serverless }} cluster using the <code>ccloud</code> CLI tool.

{{site.data.alerts.callout_info}}
The <code>ccloud</code> CLI tool is in beta.
{{site.data.alerts.end}}

<h3>Install <code>ccloud</code></h3>

{% include cockroachcloud/ccloud/install-ccloud.md %}

### Run `ccloud quickstart` to create a new cluster, create a SQL user, and retrieve the connection string.

{% include cockroachcloud/ccloud/quickstart.md %}

Select **Parameters only** then copy the connection parameters displayed and save them in a secure location.

~~~
? How would you like to connect? Parameters only
Looking up cluster ID: succeeded
Creating SQL user: succeeded
Success! Created SQL user
 name: maxroach
 cluster: 37174250-b944-461f-b1c1-3a99edb6af32
Retrieving cluster info: succeeded
Connection parameters
 Database:  defaultdb
 Host:      free-tier4.aws-us-west-2.cockroachlabs.cloud
 Options:   --cluster=dim-dog-147
 Password:  ThisIsNotAGoodPassword
 Port:      26257
 Username:  maxroach
~~~

</div>

</div>

<section class="filter-content" markdown="1" data-scope="local">

{% include {{ page.version.version }}/setup/start-single-node-insecure.md %}

</section>
