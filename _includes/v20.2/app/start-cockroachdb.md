{% comment %}
Choose whether to run a temporary local cluster or a free CockroachDB cluster on CockroachCloud. The instructions below will adjust accordingly.

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="local">Use a Local Cluster</button>
  <button class="filter-button page-level" data-scope="cockroachcloud">Use CockroachCloud</button>
</div>
<p></p>
{% endcomment %}

<section class="filter-content" markdown="1" data-scope="local">

1. If you haven't already, [download the CockroachDB binary](install-cockroachdb.html).
1. Run the [`cockroach demo`](cockroach-demo.html) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach demo \
    --empty
    ~~~

    This starts a temporary, in-memory cluster and opens an interactive SQL shell to the cluster.
1. Take note of the `(sql/tcp)` connection string in the SQL shell welcome text:

    ~~~
    # Connection parameters:
    #   (console) http://127.0.0.1:61009
    #   (sql)     postgres://root:admin@?host=%2Fvar%2Ffolders%2Fk1%2Fr048yqpd7_9337rgxm9vb_gw0000gn%2FT%2Fdemo255013852&port=26257
    #   (sql/tcp) postgres://root:admin@127.0.0.1:61011?sslmode=require    
    ~~~

    You will use it in your application code later.

</section>

{% comment %}
<section class="filter-content" markdown="1" data-scope="cockroachcloud">

### Create a free cluster

1. If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs" rel="noopener" target="_blank">sign up for a CockroachCloud account</a>.
1. [Log in](https://cockroachlabs.cloud/) to your CockroachCloud account.
1. On the **Overview** page, click **Create Cluster**.
1. On the **Create new cluster** page, for **Cloud provider**, select **Google Cloud**.
1. For **Regions & nodes**, use the default selection of `California (us-west)` region and 1 node.
1. For **Hardware per node**, select `Option 1` (2vCPU, 60 GB disk).
1. Name the cluster. The cluster name must be 6-20 characters in length, and can include lowercase letters, numbers, and dashes (but no leading or trailing dashes).
1. Click **Next**.
1. On the **Summary** page, enter your credit card details.

    {{site.data.alerts.callout_info}}
    You won't be charged until after your free trial expires in 30 days.
    {{site.data.alerts.end}}

1. In the **Trial Code** field, enter `CRDB30`. Click **Apply**.
1. Click **Create cluster**.

Your cluster will be created in approximately 20-30 minutes. Watch this [Getting Started with CockroachCloud](https://youtu.be/3hxSBeE-1tM) video while you wait.

Once your cluster is created, you will be redirected to the **Cluster Overview** page.

### Create a SQL user

1. In the left navigation bar, click **SQL Users**.
1. Click **Add User**. The **Add User** modal displays.
1. Enter a **Username** and **Password**.
1. Click **Save**.

### Authorize your network

1. In the left navigation bar, click **Networking**.
1. Click **Add Network**. The **Add Network** modal displays.
1. From the **Network** dropdown, select **Current Network** to auto-populate your local machine's IP address.
1. To allow the network to access the cluster's DB Console and to use the CockroachDB client to access the databases, select the **DB Console to monitor the cluster** and **CockroachDB Client to access the databases** checkboxes.
1. Click **Apply**.

### Get the connection string

1. In the top-right corner of the Console, click the **Connect** button. The **Connect** modal displays.
1. From the **User** dropdown, select the SQL user you created [earlier](#create-a-sql-user).
1. Verify that the `us-west2 GCP` region and `default_db` database are selected.
1. Click **Continue**. The **Connect** tab is displayed.
1. Click **Connection string** and take note of the connection string for your cluster. You will use it in your application code later.
1. Create a `certs` directory on your local workstation.
1. Click the name of the `ca.crt` file to download the CA certificate to your local machine.
1. Move the downloaded `ca.crt` file to the `certs` directory.

</section>
{% endcomment %}
