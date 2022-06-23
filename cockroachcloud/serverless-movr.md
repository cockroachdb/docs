---
title: Estimate Serverless Usage with MovR
summary: Run the MovR sample application to estimate RU usage in CockroachDB Serverless.
toc: true
referral_id: docs_serverless_movr
docs_area: get_started
---

This tutorial shows you how to initialize and run the MovR workload on a {{ site.data.products.serverless }} cluster, then use your Request Unit consumption data to estimate a sufficient budget for your cluster.

## Before you begin

Make sure you have already [installed CockroachDB](../{{site.versions["stable"]}}/install-cockroachdb.html).

## Step 1. Create a {{ site.data.products.serverless }} cluster

{% include cockroachcloud/quickstart/create-a-free-cluster.md %}

## Step 2. Set up your cluster connection

{% include cockroachcloud/quickstart/set-up-your-cluster-connection-no-cert.md %}

## Step 3. Load the `movr` workload

Load the dataset using the SQL connection string you copied in [Step 2](#step-2-set-up-your-cluster-connection):

  {% include copy-clipboard.html %}
  ~~~ shell
  $ cockroach workload init movr \
  'postgresql://<username>:<password>@serverless-host>:26257/movr?sslmode=verify-full&options=--cluster%3D<routing-id>'
  ~~~

  Where:
  
  - `<username>` is the SQL user. By default, this is your {{ site.data.products.db }} account username.
  - `<password>` is the password for the SQL user. The password will be shown only once in the **Connection info** dialog after creating the cluster.
  - `<serverless-host>` is the hostname of the {{ site.data.products.serverless }} cluster.
  - `<routing-id>` identifies your tenant cluster on a [multi-tenant host](https://www.cockroachlabs.com/docs/cockroachcloud/architecture.html#architecture). For example, `funny-skunk-123`.

## Step 4. Run the workload

Run the `movr` workload for 1 minute using the same SQL connection string as before:

  {% include copy-clipboard.html %}
  ~~~ shell
  $ cockroach workload run movr \
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
    
## Step 5. Calculate your budget

1. In the {{ site.data.products.db }} Console, close the **Connection info** dialog to return to your cluster's [**Overview** page](cluster-overview-page.html).

1. In the **Usage this month** section, note the number of RUs your cluster used. You can also see the **Request Units** graph for a breakdown of how many RUs per second you were using over the last minute.

1. Multiply your usage over one minute by the number of minutes in a month (43800) to estimate how many RUs the workload would use in a month. For example, if you used 1800 RUs: 1800 RUs/min * 43800 min = 78,840,000 RUs.

1. Calculate your budget. The workload is estimated to use about 79 million RUs per month, and you are given up to 250M free RUs per month, so the free {{ site.data.products.serverless }} offering should be sufficient for your usage.

## Step 6. Adjust for growth

Let's say Movr is planning to expand, and you expect to have three times as many users this month, so you need to estimate a new budget.

1. PLACEHOLDER

1. In the {{ site.data.products.db }} Console, [edit your spend limit](serverless-cluster-management.html). RUs cost $1 per 10 million RUs, so you will need to budget $5.25 (52.5 million / 10 million). To leave room for storage costs or unexpected usage, you can round up to $6. No matter what you set your spend limit to, you will only be charged for the resources you use.

## Next steps

You can monitor your usage in the {{ site.data.products.db }} Console, and you will receive emails when your cluster approaches 50%, 75%, and 100% of its spend limit.

To estimate an actual budget for your cluster, you should run your real workload and gather usage data. You can always [edit your spend limit](serverless-cluster-management.html) if your initial estimate turns out to be inaccurate.

## See also

- [Serverless Performance Benchmarking](serverless-benchmarking.html)
- [Manage a CockroachDB Serverless Cluster](serverless-cluster-management.html)
- [The MovR Example Application](../stable/movr.html)
- [Example Apps](../stable/example-apps.html)
