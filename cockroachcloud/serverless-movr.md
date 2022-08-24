---
title: Estimate Serverless Usage with MovR
summary: Run the MovR sample application to estimate RU usage in CockroachDB Serverless.
toc: true
referral_id: docs_serverless_movr
docs_area: get_started
---

This tutorial shows you how to initialize and run the [MovR](../{{site.versions["stable"]}}/movr.html) workload on a {{ site.data.products.serverless }} cluster, then use the [Request Unit](serverless-faqs.html#what-is-a-request-unit) consumption data to estimate a sufficient budget for the MovR workload.

## Overview

[MovR](../{{site.versions["stable"]}}/movr.html) is a fictional company that offers users a platform for sharing vehicles, like scooters, bicycles, and skateboards, in select cities across the United States and Europe. The MovR team wants to use {{ site.data.products.serverless }} to run their high-growth, variable workload. They decide to test out a sample workload to see how it will perform and how much it will cost to run.

## Before you begin

- Make sure you have already [installed CockroachDB](../{{site.versions["stable"]}}/install-cockroachdb.html).
- [Create a {{ site.data.products.serverless }} cluster](quickstart.html).

## Step 1. Get the cluster connection string

1. On the cluster's [**Overview** page](cluster-overview-page.html), click **Connect**.
1. Select **General connection string** from the **Select option** dropdown.
1. Open the **General connection string** section, then copy the connection string provided and save it in a secure location.

## Step 2. Create the `movr` database

1. Connect to the SQL shell using the connection string you copied in [Step 1](#step-1-get-the-cluster-connection-string):

    {% include copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url \
    'postgresql://<username>:<password>@serverless-host>:26257/defaultdb?sslmode=verify-full&options=--cluster%3D<routing-id>'
    ~~~
    
    Where:
      - `<username>` is the SQL user. By default, this is your {{ site.data.products.db }} account username.
      - `<password>` is the password for the SQL user. The password will be shown only once in the **Connect to cluster** dialog after creating the cluster.
      - `<serverless-host>` is the hostname of the {{ site.data.products.serverless }} cluster.
      - `<routing-id>` identifies your tenant cluster on a [multi-tenant host](architecture.html#architecture). For example, `funny-skunk-123`.

1. In the SQL shell, create the `movr` database:

    {% include copy-clipboard.html %}
    ~~~ sql
    CREATE DATABASE movr;
    ~~~
  
1. Return to the **Connect to cluster** dialog from [Step 1](#step-1-get-the-cluster-connection-string) and select `movr` from the **Database** dropdown. You may have to refresh the page for `movr` to appear in the dropdown.

1. Copy the new **General connection string**.

## Step 3. Load the `movr` workload

Exit the SQL shell and [load the `movr` dataset](../{{site.versions["stable"]}}/cockroach-workload.html#movr-workload) using the new connection string:

  {% include copy-clipboard.html %}
  ~~~ shell
  cockroach workload init movr \
  'postgresql://<username>:<password>@serverless-host>:26257/movr?sslmode=verify-full&options=--cluster%3D<routing-id>'
  ~~~

## Step 4. Run the workload

Run the `movr` workload for 1 minute using the same SQL connection string as before:

  {% include copy-clipboard.html %}
  ~~~ shell
  cockroach workload run movr \
  --duration=1m \
  'postgresql://<username>:<password>@serverless-host>:26257/movr?sslmode=verify-full&options=--cluster%3D<routing-id>'
  ~~~

  You'll see per-operation statistics print to standard output every second:

  ~~~
  _elapsed___errors__ops/sec(inst)___ops/sec(cum)__p50(ms)__p95(ms)__p99(ms)_pMax(ms)
      1.0s        0           31.9           32.0      0.5      0.6      1.4      1.4 addUser
      1.0s        0            6.0            6.0      1.2      1.4      1.4      1.4 addVehicle
      1.0s        0           10.0           10.0      2.2      6.3      6.3      6.3 applyPromoCode
      1.0s        0            2.0            2.0      0.5      0.6      0.6      0.6 createPromoCode
      1.0s        0            9.0            9.0      0.9      1.6      1.6      1.6 endRide
      1.0s        0         1407.5         1407.8      0.3      0.5      0.7      4.1 readVehicles
      1.0s        0           27.0           27.0      2.1      3.1      4.7      4.7 startRide
      1.0s        0           86.8           86.9      4.7      8.4     11.5     15.2 updateActiveRides
      2.0s        0           26.0           29.0      0.5      1.1      1.4      1.4 addUser
      2.0s        0            8.0            7.0      1.2      2.8      2.8      2.8 addVehicle
      2.0s        0            2.0            6.0      2.6      2.8      2.8      2.8 applyPromoCode
      2.0s        0            0.0            1.0      0.0      0.0      0.0      0.0 createPromoCode
      2.0s        0            6.0            7.5      0.8      1.7      1.7      1.7 endRide
      2.0s        0         1450.4         1429.1      0.3      0.6      0.9      2.6 readVehicles
      2.0s        0           17.0           22.0      2.1      3.3      5.5      5.5 startRide
      2.0s        0           59.0           72.9      6.3     11.5     11.5     14.2 updateActiveRides
  ...
  ~~~

  After the specified duration (1 minute in this case), the workload will stop and you'll see totals printed to standard output:

  ~~~
  _elapsed___errors_____ops(total)___ops/sec(cum)__avg(ms)__p50(ms)__p95(ms)__p99(ms)_pMax(ms)__result
     60.0s        0          85297         1421.6      0.7      0.3      2.6      7.1     30.4
  ~~~
      
## Step 5. View your usage costs

1. In the {{ site.data.products.db }} Console, close the **Connect to cluster** dialog to return to your cluster's [**Overview** page](cluster-overview-page.html).

1. In the **Usage this month** section, click **Estimate usage cost**.

    The **Estimate cost based on usage** dialog appears.
    
1. Select **Past 30 minutes** as the time frame.

    Your **Monthly estimate for this workload** is displayed.

The **Spend over time** graph will be populated with the RU and storage you used running the `movr` workload, as well as any other usage you had over the last 30 minutes. The **Monthly estimate for this workload** is calculated based on this usage. Ideally your spend limit should be higher than this estimate to allow for any variability in the workload over the month. A cluster's spend limit is meant to prevent you from accidentally spending more than you are comfortable with, not to be the most accurate prediction of your costs.

## Next steps

The MovR team can monitor their usage in the {{ site.data.products.db }} Console, and they will receive [email alerts](alerts-page.html#configure-alerts) when the cluster approaches 50%, 75%, and 100% of its spend limit. If their workload grows and they reach the limits of the {{ site.data.products.serverless }} free offering, they can then [set a spend limit](serverless-cluster-management.html#edit-your-spend-limit).

To estimate the actual costs for your cluster, you should run your real workload and gather usage data. You can always [edit your spend limit](serverless-cluster-management.html) if your initial estimate turns out to be inaccurate or your budget changes.

## See also

- [Serverless Performance Benchmarking](serverless-benchmarking.html)
- [Manage a CockroachDB Serverless Cluster](serverless-cluster-management.html)
- [The MovR Example Application](../stable/movr.html)
- [Example Apps](../stable/example-apps.html)
