---
title: Quickstart with CockroachDB Advanced
summary: Learn how to create and use a CockroachDB Advanced cluster.
toc: true
docs_area: get_started
---

This page shows you how to deploy a CockroachDB cluster on CockroachDB {{ site.data.products.advanced }} (free for a 30-day trial for your first cluster), connect to it using a sample workload, and run your first query.

To run CockroachDB on your local machine instead, see [Start a Local Cluster](quickstart.html?filters=local).

## Step 1. Create a free trial cluster

For this tutorial, you will create a 3-node GCP cluster in the `us-west2` region.

1. If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs_quickstart_trial" rel="noopener" target="_blank">sign up for a CockroachDB {{ site.data.products.cloud }} account</a>.
1. [Log in](https://cockroachlabs.cloud/) to your CockroachDB {{ site.data.products.cloud }} account.
1. On the **Overview** page, click **Create cluster**.
1. On the **Create Cluster** page, select **Advanced**.
1. For **Cloud provider**, select **Google Cloud**.
1. For **Regions & nodes**, select `California (us-west)` region and 3 nodes.

    {{site.data.alerts.callout_info}}
    To create a [multi-region]({% link cockroachcloud/plan-your-cluster-advanced.md %}#multi-region-clusters) trial cluster, you can select 3 regions with 3 nodes per region, 9 nodes in total.
    {{site.data.alerts.end}}

1. For **VPC Peering**, use the default selection of **Use the default IP range**. Click **Next: Capacity**.

1. On the **Capacity page**, select 4 vCPU for **Compute per node** and a 35 GiB disk for **Storage per node**.

    {{site.data.alerts.callout_info}}
    You can select up to 9 nodes, 4 vCPUs of compute, and 150 GiB of storage. The trial code will not apply to larger clusters.
    {{site.data.alerts.end}}

1. Click **Next: Finalize**.

1. On the **Finalize** page, enter your credit card details.

    {{site.data.alerts.callout_info}}
    You will not be charged until after your free trial expires in 30 days.
    {{site.data.alerts.end}}

1. Name the cluster. The cluster name must be 6-20 characters in length, and can include lowercase letters, numbers, and dashes (but no leading or trailing dashes).

1. Click **Create cluster**.

Your cluster will be created in approximately 20-30 minutes.

Once your cluster is created, you will be redirected to the **Cluster Overview** page.

## Step 2. Create a SQL user

1. In the left navigation bar, click **SQL Users**.
1. Click **Add User**. The **Add User** dialog displays.
1. Enter a username and click **Generate & Save Password**.
1. Copy the generated password to a secure location, such as a password manager.
1. Click **Close**.

## Step 3. Authorize your network

1. In the left navigation bar, click **Networking**.
1. Click **Add Network**. The **Add Network** dialog displays.
1. From the **Network** dropdown, select **Current Network** to auto-populate your local machine's IP address.
1. To allow the network to access the cluster's DB Console and to use the CockroachDB client to access the databases, select the **DB Console to monitor the cluster** and **CockroachDB Client to access the databases** checkboxes.
1. Click **Apply**.

## Step 4. Connect to the cluster

To download CockroachDB locally and configure it to connect to the cluster with the SQL user you just created, refer to [Connect to a CockroachDB Advanced cluster]({% link cockroachcloud/connect-to-an-advanced-cluster.md %}). Make a note of the `cockroach sql` command provided in the **Connect** dialog.

## Step 5. Use the built-in SQL client

1. In your terminal, use the `cockroach sql` command from [Step 4. Connect to the cluster](#step-4-connect-to-the-cluster) to connect to the cluster using the binary you just configured.

    {{site.data.alerts.callout_danger}}
    This connection string contains your password, which will be provided only once. Save it in a secure place (e.g., in a password manager) to connect to your cluster in the future. If you forget your password, you can reset it by going to the **SQL Users** page for the cluster, found at `https://cockroachlabs.cloud/cluster/<CLUSTER ID>/users`.
    {{site.data.alerts.end}}

    {% include cockroachcloud/sql-connection-string.md %}

1. Enter the SQL user's password and hit enter.

    {% include cockroachcloud/postgresql-special-characters.md %}

    A welcome message displays:

    ~~~
    #
    # Welcome to the CockroachDB SQL shell.
    # All statements must be terminated by a semicolon.
    # To exit, type: \q.
    #
    ~~~

1. You can now run [CockroachDB SQL statements]({% link {{site.current_cloud_version}}/sql-statements.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO bank.accounts VALUES (1, 1000.50);
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM bank.accounts;
    ~~~

    ~~~
      id | balance
    -----+----------
       1 | 1000.50
    (1 row)
    ~~~

1. To exit the SQL shell:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

## What's next?

Learn more:

- Use the [built-in SQL client]({% link {{site.current_cloud_version}}/cockroach-sql.md %}) to connect to your cluster and learn [CockroachDB SQL]({% link {{site.current_cloud_version}}/sql-statements.md %}).
- Build a ["Hello World" app with the Django framework]({% link {{site.current_cloud_version}}/build-a-python-app-with-cockroachdb-django.md %}), or [install a client driver]({% link {{site.current_cloud_version}}/install-client-drivers.md %}) for your favorite language.
- Use a local cluster to [explore CockroachDB capabilities like fault tolerance and automated repair]({% link {{site.current_cloud_version}}/demo-cockroachdb-resilience.md %}).

Before you move into production:

- [Authorize the network]({% link cockroachcloud/connect-to-an-advanced-cluster.md %}#authorize-your-network) from which your app will access the cluster.
- Configure every machine from which you want to [connect to the cluster]({% link cockroachcloud/connect-to-an-advanced-cluster.md %}#connect-to-your-cluster).
- Review the [production checklist]({% link cockroachcloud/production-checklist.md %}).
