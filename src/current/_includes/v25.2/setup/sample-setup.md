
<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="cockroachcloud">Use CockroachDB {{ site.data.products.basic }}</button>
  <button class="filter-button page-level" data-scope="local">Use a Local Cluster</button>
</div>

<div class="filter-content" markdown="1" data-scope="cockroachcloud">

<h3>Choose your installation method</h3>

You can install a CockroachDB {{ site.data.products.basic }} cluster using either the CockroachDB Cloud Console, a web-based graphical user interface (GUI) tool, or <code>ccloud</code>, a command-line interface (CLI) tool.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="console">Use the Cloud Console (GUI)<strong></strong></button>
    <button class="filter-button page-level" data-scope="ccloud"><strong>Use <code>ccloud</code> (CLI)</strong></button>
</div>

<div class="filter-content" markdown="1" data-scope="console">

### Create a free cluster

{% include cockroachcloud/quickstart/create-a-free-cluster.md %}

### Create a SQL user

{% include {{ page.version.version }}/setup/create-first-sql-user.md %}

### Get the connection string

The **Connect to cluster** dialog shows information about how to connect to your cluster.

1. Select **General connection string** from the **Select option** dropdown.
1. Open the **General connection string** section, then copy the connection string provided and save it in a secure location.

    The sample application used in this tutorial uses system CA certificates for server certificate verification, so you can skip the **Download CA Cert** instructions.

    {{site.data.alerts.callout_info}}
    The connection string is pre-populated with your username, password, cluster name, and other details. Your password, in particular, will be provided *only once*. Save it in a secure place (Cockroach Labs recommends a password manager) to connect to your cluster in the future. If you forget your password, you can reset it by going to the **SQL Users** page for the cluster, found at `https://cockroachlabs.cloud/cluster/<CLUSTER ID>/users`.
    {{site.data.alerts.end}}

</div>

<div class="filter-content" markdown="1" data-scope="ccloud">

Follow these steps to create a CockroachDB {{ site.data.products.basic }} cluster using the <code>ccloud</code> CLI tool.

{{site.data.alerts.callout_info}}
The <code>ccloud</code> CLI tool is in Preview.
{{site.data.alerts.end}}

<h3>Install <code>ccloud</code></h3>

{% include cockroachcloud/ccloud/install-ccloud.md %}

### Run `ccloud quickstart` to create a new cluster, create a SQL user, and retrieve the connection string.

{% include cockroachcloud/ccloud/quickstart.md %}

Select **General connection string**, then copy the connection string displayed and save it in a secure location. The connection string is the line starting `postgresql://`.

~~~
? How would you like to connect? General connection string
Retrieving cluster info: succeeded
 Downloading cluster cert to /Users/maxroach/.postgresql/root.crt: succeeded
postgresql://maxroach:ThisIsNotAGoodPassword@blue-dog-147.6wr.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=%2FUsers%2Fmaxroach%2F.postgresql%2Froot.crt
~~~
</div>

</div>

<section class="filter-content" markdown="1" data-scope="local">

{% include {{ page.version.version }}/setup/start-single-node-insecure.md %}

</section>