---
title: CockroachCloud Quickstart
summary: Learn how to create and use your CockroachCloud cluster.
toc: true
---

This page shows you how to create and connect to a 30-day free CockroachCloud cluster and run your first query.

## Before you begin

If you haven't already, [sign up for a CockroachCloud account](https://cockroachlabs.cloud/signup).

## Create a free CockroachCloud cluster

For this tutorial, we will create a 3-node GCP cluster in the `us-west` region.

1. [Log in](https://cockroachlabs.cloud/) to your CockroachCloud account.
2. On the **Overview** page, click **Create Cluster**.
3. On the **Create new cluster** page, for **Cloud provider**, select **Google Cloud**.
4. For **Regions & nodes**, use the default selection of `California (us-west)` region and 3 nodes.
5. For **Hardware per node**, select `Option 1` (2vCPU, 60 GB disk).
6. Name the cluster. The cluster name must be 6-20 characters in length, and can include lowercase letters, numbers, and dashes (but no leading or trailing dashes).
7. Click **Next**.
8. On the **Summary** page, enter your credit card details.

    {{site.data.alerts.callout_info}}
    You won't be charged until after your free trial expires in 30 days.
    {{site.data.alerts.end}}

9. In the **Trial Code** field, enter `CRDB30`. Click **Apply**.
10. Click **Create cluster**.

Your cluster will be created in approximately 20-30 minutes. Watch this [Getting Started with CockroachCloud](https://youtu.be/3hxSBeE-1tM) video while you wait.

Once your cluster is created, you will be redirected to the **Cluster Overview** page.

## Get the connection string

### Step 1. Create a SQL user

1. In the left navigation bar, click **SQL Users**.
2. Click **Add User**. The **Add User** modal displays.
3. Enter a **Username** and **Password**.
4. Click **Save**.

### Step 2. Authorize your network

1. In the left navigation bar, click **Networking**.
2. Click **Add Network**. The **Add Network** modal displays.
3. From the **Network** dropdown, select **Current Network** to auto-populate your local machine's IP address.
4. To allow the network to access the cluster's Admin UI and to use the CockroachDB client to access the databases, select the **Admin UI to monitor the cluster** and **CockroachDB Client to access the databases** checkboxes.
5. Click **Apply**.

### Step 3. Get the connection string

1. In the top-right corner of the Console, click the **Connect** button. The **Connect** modal displays.
2. From the **User** dropdown, select the SQL user you created in [Step 1. Create a SQL user](#step-1-create-a-sql-user).
3. Verify that the `us-west2 GCP` region and `default_db` database are selected.
4. Click **Continue**. The **Connect** tab is displayed.
5. Click **Connection string** to get the connection string for your cluster.
6. Create a `certs` directory on your local workstation.
7. Click the name of the `ca.crt` file to download the CA certificate to your local machine.
8. Move the downloaded `ca.crt` file to the `certs` directory.


## Connect to the cluster and run your first query

For this tutorial, we will use the [`movr` workload](movr.html) to run the first query. On your local machine:

1. [Download the CockroachDB binary](install-cockroachdb.html):

    For Mac:
    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.darwin-10.9-amd64.tgz \
    | tar -xJ
    ~~~

    For Linux:
    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar  xvz
    ~~~

2. Copy the binary into the `PATH` so it's easy to run the SQL client from any location:

    For Mac:
    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{ page.release_info.version }}.darwin-10.9-amd64/cockroach /usr/local/bin/
    ~~~

    For Linux:
    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

3. Initialize the `movr` workload using the `cockroach workload` command and the [connection string](#step-3-get-the-connection-string).

    In the connection string, the SQL user's username is prepopulated. Replace `<password>` with the SQL user's password that you entered in [Step 1](#step-1-create-a-sql-user). Replace the `<certs_dir>` placeholder with the path to the `certs` directory that you created in [Step 3](#step-3-get-the-connection-string).

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload init movr 'postgres://<username>:<password>@<global host>:26257/movr?sslmode=verify-full&sslrootcert=<certs_dir>/<ca.crt>'
    ~~~

4. Use the built-in SQL client to view the database:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --url='postgres://<username>:<password>@<global host>:26257/movr?sslmode=verify-full&sslrootcert=<certs_dir>/<ca.crt>'
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW TABLES FROM movr;
    ~~~

    ~~~
                  table_name
    ------------------------------
      promo_codes
      rides
      user_promo_codes
      users
      vehicle_location_histories
      vehicles
    (6 rows)
    ~~~

5. Run your first query:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM movr.users WHERE city='new york';
    ~~~

    ~~~
                           id                  |   city   |       name       |           address           | credit_card
    ---------------------------------------+----------+------------------+-----------------------------+--------------
      00000000-0000-4000-8000-000000000000 | new york | Robert Murphy    | 99176 Anderson Mills        | 8885705228
      051eb851-eb85-4ec0-8000-000000000001 | new york | James Hamilton   | 73488 Sydney Ports Suite 57 | 8340905892
      0a3d70a3-d70a-4d80-8000-000000000002 | new york | Judy White       | 18580 Rosario Ville Apt. 61 | 2597958636
      0f5c28f5-c28f-4c00-8000-000000000003 | new york | Devin Jordan     | 81127 Angela Ferry Apt. 8   | 5614075234
      147ae147-ae14-4b00-8000-000000000004 | new york | Catherine Nelson | 1149 Lee Alley              | 0792553487
      19999999-9999-4a00-8000-000000000005 | new york | Nicole Mcmahon   | 11540 Patton Extensions     | 0303726947
    (6 rows)
    ~~~

## Before you move into production

Before using your free cluster in production, make sure you have [authorized the network](cockroachcloud-connect-to-your-cluster.html#step-1-authorize-your-network) from which your app will access the cluster. Also, download the `ca.crt` file to every machine from which you want to [connect to the cluster](cockroachcloud-connect-to-your-cluster.html#step-3-select-a-connection-method).

## What's next

- [Secure your cluster](cockroachcloud-security-overview.html)
- [Build a "Hello, World" app](build-a-python-app-with-cockroachdb-django.html)
