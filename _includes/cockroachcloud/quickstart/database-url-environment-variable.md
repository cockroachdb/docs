<section class="filter-content" markdown="1" data-scope="unix">
Set the `DATABASE_URL` environment variable to the connection string that you copied earlier:

{% include_cached copy-clipboard.html %}
~~~ shell
export DATABASE_URL="<connection-string>"
~~~

The code sample uses the connection string stored in the environment variable `DATABASE_URL` to connect to your cluster.
</section>

<section class="filter-content" markdown="1" data-scope="windows">

Set the `DATABASE_URL` environment variable to the connection string that you copied earlier:

{% include_cached copy-clipboard.html %}
~~~ shell
$env:DATABASE_URL = "<connection-string>"
~~~

The code sample uses the connection string stored in the environment variable `DATABASE_URL` to connect to your cluster.

</section>

{{site.data.alerts.callout_success}}
For reference information about connecting to CockroachDB with supported client drivers, see [Connect to a CockroachDB Cluster](../stable/connect-to-the-database.html).
{{site.data.alerts.end}}