Once your cluster is created, the **Connect to cluster-name** dialog displays. Use the information provided in the dialog to set up your cluster connection for the SQL user that was created by default:

1. In your terminal, run the second command from the dialog to create a new `certs` directory on your local machine and download the CA certificate to that directory:

    <div class="filters clearfix">
      <button class="filter-button page-level" data-scope="mac">Mac</button>
      <button class="filter-button page-level" data-scope="linux">Linux</button>
      <button class="filter-button page-level" data-scope="windows">Windows</button>
    </div>

    {% include cockroachcloud/download-the-cert-free.md %}

1. Copy the connection string provided, which will be used in the next steps (and to connect to your cluster in the future).

    {{site.data.alerts.callout_danger}}
    This connection string contains your password, which will be provided only once. If you forget your password, you can reset it by going to the [**SQL Users** page](https://www.cockroachlabs.com/docs/cockroachcloud/managing-access.html).
    {{site.data.alerts.end}}
    
    {% include cockroachcloud/sql-connection-string-free.md %}
