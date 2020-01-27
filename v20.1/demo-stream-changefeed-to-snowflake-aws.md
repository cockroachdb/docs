---
title: Stream a changefeed to Snowflake
summary: Use a CockroachCloud cluster to stream changefeed messages to a Snowflake cluster.
toc: true
homepage: true
contribute: false
build_for: [cockroachcloud]
cta: false
---

While CockroachDB is an excellent system of record, it also needs to coexist with other systems. For example, you might want to keep your data mirrored in full-text indexes, analytics engines, or big data pipelines.

This page walks you through a demonstration of how to use an [enterprise changefeed](create-changefeed.html) to stream row-level changes to [Snowflake](https://www.snowflake.com/), an online analytical processing (OLAP) database.

{{site.data.alerts.callout_info}}
Snowflake is optimized for `INSERT`s and batch rewrites over streaming updates. This means that CockroachDB changefeeds are unable to send `UPDATE`s and `DELETE`s to Snowflake. If this is necessary, additional setup (not covered in this tutorial) can allow entire tables to be replaced in batch.
{{site.data.alerts.end}}

## Before you begin

Before you begin, make sure you have:

- Admin access to a [CockroachCloud account](cockroachcloud-create-your-account.html)
- Write access to an [AWS S3 bucket](https://s3.console.aws.amazon.com)
- `SYSADMIN` access to a [Snowflake](https://www.snowflake.com) cluster

<!-- <div class="filters filters-big clearfix">
    <a href="demo-stream-changefeed-to-snowflake-aws.html"><button class="filter-button current">Use <strong>AWS</strong></button></a>
    <a href="demo-stream-changefeed-to-snowflake-gcs.html"><button class="filter-button">Use <strong>GCS</strong></button></a>
</div> -->

## Step 1. Create a cluster

If you have not done so already, [create a cluster](cockroachcloud-create-your-cluster.html) with **AWS** as your preferred cloud provider.

## Step 2. Configure your cluster

1. Connect to the built-in SQL shell as a user with Admin privileges, replacing the placeholders in the [client connection string](cockroachcloud-connect-to-your-cluster.html#step-3-generate-the-connection-string) with the correct username, password, and path to the `ca.cert`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --url='postgres://<username>:<password>@<global host>:26257?sslmode=verify-full&sslrootcert=certs/ca.crt'
    ~~~

    {{site.data.alerts.callout_info}}
    If you haven't connected to your CockroachCloud cluster before, see [Connect to your CockroachCloud Cluster](cockroachcloud-connect-to-your-cluster.html) for information on how to initially connect.
    {{site.data.alerts.end}}

2. Enable the `kv.rangefeed.enabled` [cluster setting](cluster-settings.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~
    ~~~
    SET CLUSTER SETTING
    ~~~

## Step 3. Create a databases

1. In the built-in SQL shell, create a database called `cdc_test`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE cdc_test;
    ~~~
    ~~~
    CREATE DATABASE
    ~~~

2. Set it as the default:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET DATABASE = cdc_test;
    ~~~
    ~~~
    SET
    ~~~

## Step 4. Create tables

Before you can start a changefeed, you need to create at least one table for the changefeed to target. The targeted table's rows are referred to as the "watched rows".

Let's create a table called `order_alerts` to target:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE order_alerts (
    id   INT PRIMARY KEY,
    name STRING
);
~~~
~~~
CREATE TABLE
~~~

## Step 5. Create an S3 bucket in the AWS Console

Every change to a watched row is emitted as a record in a configurable format (i.e., `JSON` for cloud storage sinks). To configure an AWS S3 bucket as the cloud storage sink:

1. Log in to your [AWS S3 Console](https://s3.console.aws.amazon.com/).
2. Create an S3 bucket, called `changefeed-example`, where streaming updates from the watched tables will be collected.

    The name of the S3 bucket is needed when you [create your changefeed](#create-an-enterprise-changefeed). Be sure that the you have write access on the S3 bucket.

## Step 6. Create an enterprise changefeed

Back in the built-in SQL shell, [create an enterprise changefeed](create-changefeed.html):

{% include copy-clipboard.html %}
~~~ sql
> CREATE CHANGEFEED FOR TABLE order_alerts
    INTO 'experimental-s3://changefeed-example?AWS_ACCESS_KEY_ID=<KEY>&AWS_SECRET_ACCESS_KEY=<SECRET_KEY>'
    WITH
        updated,
        resolved='10s';
~~~
~~~
        job_id
+--------------------+
  000000000000000000
(1 row)
~~~

Be sure to replace the placeholders with AWS key and secret key.

## Step 7. Insert data into the tables

1. In the built-in SQL shell, insert data into the `order_alerts` table that the changefeed is targeting:

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO order_alerts
        VALUES
            (1, 'Order received'),
            (2, 'Order processed');
    ~~~
    ~~~
    INSERT 2
    ~~~

2. Navigate to back to the [S3 bucket](https://s3.console.aws.amazon.com/) to confirm that the data is now streaming to the bucket. A new directory should display on the **Overview** tab.

## Step 8. Configure Snowflake

1. Log in to Snowflake as a `SYSADMIN` user.
2. Navigate to the **Worksheet** view.
3. Create a table to store the data to be ingested:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE order_alerts (
       changefeed_record VARIANT
      );
    ~~~

    This will store all of the data in a single [`VARIANT` column](https://docs.snowflake.net/manuals/user-guide/semistructured-considerations.html#storing-semi-structured-data-in-a-variant-column-vs-flattening-the-nested-structure) as JSON. You can then access this field with valid JSON and query the column as if it were a table.

4. Click **Run**.

5. In the Worksheet, create a stage called `cdc-stage`, which tells Snowflake where your data files reside in S3:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE STAGE cdc_stage url='s3://changefeed-example/'credentials=(aws_key_id='<KEY>' aws_secret_key='<SECRET_KEY>') file_format = (type = json);
    ~~~

    Be sure to replace the placeholders with AWS key and secret key.

6. In the Worksheet, create a snowpipe called `cdc-pipe`, which tells Snowflake to auto-ingest data:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE PIPE cdc_pipe auto_ingest = TRUE as COPY INTO order_alerts FROM @cdc_stage;
    ~~~

7. In the Worksheet, view the snowpipe:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW PIPES;
    ~~~

8. Copy the **ARN** of the SQS queue for your stage (displays in the **notification_channel** column). You will use this information to [configure the S3 bucket](#step-9-configure-the-s3-bucket).

## Step 9. Configure the S3 bucket

1. [Navigate back to your S3 bucket](https://s3.console.aws.amazon.com/).
2. Configure an event notification for the S3 bucket. Use the following parameters:
    - **Name:** Name of the event notification (e.g., Auto-ingest Snowflake).
    - **Events:** Select the **All object create events**.
    - **Send to:** Select **SQS Queue** from the drop-down.
    - **SQS:** Select **Add SQS queue ARN** from the drop-down.
    - **SQS queue ARN:** Paste the SQS queue name from the `SHOW PIPES` output (from [Step 8](#step-8-configure-snowflake)).

3. Navigate back to Snowflake.
4. Ingest the data from your stage:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER PIPE cdc_pipe refresh;
    ~~~

5. To view the data Snowflake, query the `order_alerts` table:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM order_alerts;
    ~~~

    The ingested rows will display in the **Results** panel. It may take a few minutes for the data to load into the Snowflake cluster.

Your changefeed is now streaming to Snowflake.

## Known limitations

- Snowflake cannot filter streaming updates by table. Because of this, we recommend creating a changefeed that watches only one table.
- Snowpipe is unaware of CockroachDB resolved timestamps. This means CockroachDB transactions will not be loaded atomically and partial transactions can briefly be returned from Snowflake.
- Changefeeds do not share internal buffers, so each running changefeed will increase total memory usage
