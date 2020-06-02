---
title: CockroachCloud Quickstart
summary: Learn how to create and use your CockroachCloud cluster.
toc: true
build_for: [cockroachcloud]
---

This page shows you how to create and connect to a 30-day free CockroachCloud cluster and run your first query.

## Before you begin

If you haven't already, [sign up for a CockroachCloud account](https://cockroachlabs.cloud/signup).

## Create a free CockroachCloud cluster

For this quickstart, we will create a 3-node GCP cluster in the `us-west` region.

1. [Log in](https://cockroachlabs.cloud/) to your CockroachCloud account.
2. On the **Overview** page, click **Create Cluster**.
3. On the **Create new cluster** page, for **Cloud provider**, select **Google Cloud**.
4. For **Regions & nodes**, use the default selection of `California (us-west)` region and 3 nodes.
5. For **Hardware per node**, select `Option 1` (2vCPU, 60 GB disk).
6. For **Cluster name**,  enter `free-trial` in the text box.
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
3. For **Username**, enter `trial_user`.
4. For **Password**, enter `trial_password`.
4. Click **Save**.

### Step 2. Authorize your network

1. In the left navigation bar, click **Networking**.
2. Click **Add Network**. The **Add Network** modal displays.
3. From the **Network** dropdown, select **Public (Insecure)** to allow all networks.

     {{site.data.alerts.callout_info}}
     Use this with caution as your cluster will be vulnerable to denial-of-service and brute force password attacks.
     {{site.data.alerts.end}}

4. To allow the network to access the cluster's Admin UI and to use the CockroachDB client to access the databases, select the **Admin UI to monitor the cluster** and **CockroachDB Client to access the databases** checkboxes.
5. Click **Apply**.

### Step 3. Get the connection string

1. In the top-right corner of the Console, click the **Connect** button. The **Connect** modal displays.
2. The `trial_user`, `us-west2 GCP` region, and `default_db` database are selected by default.
3. Click **Continue**. The **Connect** tab is displayed.
4. Click **Connection string** to get the connection string for your cluster.

## Connect to the cluster and run your first query

For this quickstart, we will use the [`movr` workload](movr.html) to run the first query. On your local machine:

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

    In the connection string, replace `<password>` with `trial_password` and the `ca.crt` path placeholder with `sslmode-require`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload init movr 'postgres://trial_user:trial_password@<global host>:26257/movr?sslmode=require'
    ~~~

4. Use the built-in SQL client to view the database:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --url='postgres://trial_user:trial_password@<global host>:26257/movr?sslmode=require'
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

## What's next

- [Secure your cluster](cockroachcloud-security-overview.html)
- [Build a "Hello, World" app](build-a-python-app-with-cockroachdb-django.html)
