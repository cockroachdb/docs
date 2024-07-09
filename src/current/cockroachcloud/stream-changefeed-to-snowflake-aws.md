---
title: Stream a Changefeed to Snowflake
summary: Use a CockroachDB Cloud cluster to stream changefeed messages to a Snowflake cluster.
toc: true
docs_area: stream_data
---

While CockroachDB is an excellent system of record, it also needs to coexist with other systems. For example, you might want to keep your data mirrored in full-text indexes, analytics engines, or big data pipelines.

This page demonstrates how to use an [{{ site.data.products.enterprise }} changefeed](../{{site.current_cloud_version}}/create-changefeed.html) to stream row-level changes to [Snowflake](https://www.snowflake.com/), an online analytical processing (OLAP) database.

{{site.data.alerts.callout_info}}
Snowflake is optimized for inserts and batch rewrites over streaming updates. This tutorial sets up a changefeed to stream data to S3 with Snowpipe sending changes to Snowflake. Snowpipe imports previously unseen files and does not address uniqueness for primary keys, which means that target tables in Snowflake can contain multiple records per primary key.

This tutorial focuses on inserts into Snowflake. However, for some workarounds to address multiple records on the same primary key in Snowflake tables, refer to [Remove multiple records from Snowflake target tables](#remove-multiple-records-from-snowflake-target-tables).
{{site.data.alerts.end}}

## Before you begin

Before you begin, make sure you have:

- Admin access to a [CockroachDB {{ site.data.products.cloud }} account](https://cockroachlabs.cloud/)
- Write access to an [AWS S3 bucket](https://s3.console.aws.amazon.com)

    {{site.data.alerts.callout_info}}
    This tutorial uses AWS S3 for cloud storage, but Snowflake also supports [Azure](https://docs.snowflake.net/manuals/user-guide/data-load-snowpipe-auto-azure.html) and [Google Cloud Storage](https://docs.snowflake.com/user-guide/data-load-snowpipe-auto-gcs.html).
    {{site.data.alerts.end}}

- [Read and write access](https://docs.snowflake.net/manuals/user-guide/security-access-control-overview.html) to a Snowflake cluster
- {% include cockroachcloud/cdc/tutorial-privilege-check.md %}

## Step 1. Create a cluster

If you have not done so already, [create a cluster]({% link cockroachcloud/create-your-cluster.md %}).

## Step 2. Connect to your cluster

Refer to [Connect to a CockroachDB Dedicated cluster](https://cockroachlabs.com/docs/cockroachcloud/connect-to-your-cluster) for detailed instructions on how to to:

1. Download and install CockroachDB and your cluster's CA certificate locally.
1. Generate the `cockroach sql` command that you will use to connect to the cluster from the command line as a SQL user with [admin] privileges in the cluster.

## Step 3. Configure your cluster

1. In your terminal, enter the `cockroach sql` command and connection string from [Step 2. Connect to your cluster](#step-2-connect-to-your-cluster) to start the [built-in SQL client](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroach-sql.html).

1. Enable [rangefeeds](../{{site.current_cloud_version}}/create-and-configure-changefeeds.html#enable-rangefeeds). Note that rangefeeds are enabled by default on {{ site.data.products.serverless }} clusters:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

## Step 4. Create a database

1. In the built-in SQL shell, create a database called `cdc_test`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE DATABASE cdc_test;
    ~~~

1. Set it as the default:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET DATABASE = cdc_test;
    ~~~

## Step 5. Create tables

Before you can start a changefeed, you need to create at least one table for the changefeed to target. The targeted table's rows are referred to as the "watched rows".

Create a table called `order_alerts` to target:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE order_alerts (
    id   INT PRIMARY KEY,
    name STRING
);
~~~

## Step 6. Create an S3 bucket in the AWS Console

Every change to a watched row is emitted as a record in a configurable format (i.e., `JSON` for cloud storage sinks). To configure an AWS S3 bucket as the cloud storage sink:

1. Log in to your [AWS S3 Console](https://s3.console.aws.amazon.com/).

1. Create an S3 bucket where streaming updates from the watched tables will be collected.

    You will need the name of the S3 bucket when you [create your changefeed](#step-7-create-an-enterprise-changefeed). Ensure you have a set of IAM credentials with write access on the S3 bucket that you will use during [changefeed setup](#step-7-create-an-enterprise-changefeed).

## Step 7. Create an enterprise changefeed

Back in the built-in SQL shell, [create an enterprise changefeed](../{{site.current_cloud_version}}/create-changefeed.html). Replace the placeholders with your AWS access key ID and AWS secret access key:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE order_alerts
    INTO 's3://{bucket name}?AWS_ACCESS_KEY_ID={access key ID}&AWS_SECRET_ACCESS_KEY={secret access key}'
    WITH
        updated;
~~~

Refer to the [Cloud Storage Authentication](../{{site.versions["stable"]}}/cloud-storage-authentication.html) page for more detail on authenticating to Amazon S3 and other cloud providers.

~~~
        job_id
+--------------------+
  000000000000000000
(1 row)
~~~

You will receive the changefeed's job ID that you can use to [manage the changefeed](../{{site.current_cloud_version}}/create-and-configure-changefeeds.html#configure-a-changefeed) if needed.

## Step 8. Insert data into the tables

1. In the built-in SQL shell, insert data into the `order_alerts` table that the changefeed is targeting:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    INSERT INTO order_alerts
        VALUES
            (1, 'Order received'),
            (2, 'Order processed');
    ~~~

1. Navigate back to the [S3 bucket](https://s3.console.aws.amazon.com/) to confirm that the data is now streaming to the bucket. A new date-based directory should display on the **Objects** tab.

    {{site.data.alerts.callout_info}}
    If your changefeed is running but data is not displaying in your S3 bucket, you might have to [debug your changefeed](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/monitor-and-debug-changefeeds#debug-a-changefeed).
    {{site.data.alerts.end}}

## Step 9. Configure Snowflake

1. Log in to Snowflake as a user with [read and write access](https://docs.snowflake.net/manuals/user-guide/security-access-control-overview.html) to a cluster.

1. Navigate to the **Worksheets** page and select a worksheet.

1. Create a table to store the data to be ingested:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE order_alerts (
       changefeed_record VARIANT
      );
    ~~~

    This will store all of the data in a single [`VARIANT` column](https://docs.snowflake.net/manuals/user-guide/semistructured-considerations.html#storing-semi-structured-data-in-a-variant-column-vs-flattening-the-nested-structure) as JSON. You can then access this field with valid JSON and query the column as if it were a table.

1. **Run** the statement.

1. In the worksheet, create a [stage](https://docs.snowflake.com/en/user-guide/data-load-s3-create-stage) called `cdc-stage`, which tells Snowflake where your data files reside in S3. Replace the placeholders with your AWS access key ID and AWS secret access key:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE STAGE cdc_stage url='s3://changefeed-example/' credentials=(aws_key_id='<KEY>' aws_secret_key='<SECRET_KEY>') file_format = (type = json);
    ~~~

1. In the worksheet, create a Snowpipe called `cdc-pipe`, which tells Snowflake to auto-ingest data:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE PIPE cdc_pipe auto_ingest = TRUE as COPY INTO order_alerts FROM @cdc_stage;
    ~~~

    {{site.data.alerts.callout_info}}
    Auto-ingest in Snowflake works with [AWS](https://docs.snowflake.com/user-guide/data-load-snowpipe-auto-s3.html), [Azure](https://docs.snowflake.net/manuals/user-guide/data-load-snowpipe-auto-azure.html), and [Google Cloud Storage](https://docs.snowflake.com/user-guide/data-load-snowpipe-auto-gcs.html).
    {{site.data.alerts.end}}

1. In the worksheet, view the Snowpipe:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW PIPES;
    ~~~

1. Copy the **ARN** of the SQS queue for your stage, which displays in the **notification_channel** column. You will use this information to [configure the S3 bucket](#step-10-configure-the-s3-bucket).

## Step 10. Configure the S3 bucket

1. [Navigate back to your S3 bucket](https://s3.console.aws.amazon.com/).

1. Configure an event notification for the S3 bucket. In the **Properties** tab, click **Create event notification**. Use the following parameters:
    - **Event name:** Name of the event notification (e.g., Auto-ingest Snowflake).
    - **Event types:** Select the **All object create events**.
    - **Destination:** Select **SQS Queue**.
    - **Specify SQS queue:** Select **Enter SQS queue ARN** from the drop-down.
    - **SQS queue ARN:** Paste the SQS queue name from the `SHOW PIPES` output (from [Step 9](#step-9-configure-snowflake)).

1. Navigate back to Snowflake.

1. Ingest the data from your stage:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER PIPE cdc_pipe refresh;
    ~~~

1. To view the data in Snowflake, query the `order_alerts` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT * FROM order_alerts;
    ~~~

    The ingested rows will display in the **Results** panel. It may take a few minutes for the data to load into the Snowflake cluster. To check on the progress of data being written to the destination table, refer to [Snowflake's documentation on querying a stage](https://docs.snowflake.com/user-guide/querying-stage.html).

Your changefeed is now streaming to Snowflake.

## Remove multiple records from Snowflake target tables

In some cases, you may need to remove multiple records for the same primary key caused by updates to a row. Although it is not possible to remove duplicates with Snowpipe before they arrive at the target table, Snowflake offers some features that you can use to automate removing multiple records from the table downstream.

The following points outline two potential workarounds. For detailed instructions on each feature, we recommend reading the linked Snowflake documentation:

- Use Snowflake [streams](https://docs.snowflake.com/en/user-guide/streams-intro) and [tasks](https://docs.snowflake.com/en/user-guide/tasks-intro) to write into a new de-duplicated table.
    - Set up a stream that will watch for changes on the table that Snowpipe uploads into. The stream will create a snapshot of the changes at a specific point in time.
    - Create the new table in Snowflake that will hold the de-duplicated entries using the stream's `METADATA$ACTION` column.
    - Create a task to run a SQL statement that will pull data from the stream and merge it into a new table for the "unique" entries. You can set this task to run when there are new records in the stream and by a cron job schedule.

    Refer to [Snowflake's examples on creating a stream](https://docs.snowflake.com/en/user-guide/streams-examples#basic-example).
- Use Snowflake [materialized views](https://docs.snowflake.com/en/user-guide/views-materialized) to maintain a de-duplicated table.
    - Create a materialized view that includes a selection query partitioning on the primary key with the Snowflake [`QUALIFY`](https://docs.snowflake.com/en/sql-reference/constructs/qualify) command.

    For example, in your materialized view statement, query the required columns and partition, rank, and select only the first row for each primary key:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    SELECT * FROM order_alerts QUALIFY row_number() OVER (PARTITION BY id ORDER BY modified DESC) = 1;
    ~~~

    {{site.data.alerts.callout_info}}
    Materialized views are an Enterprise feature in Snowflake.
    {{site.data.alerts.end}}

## Known limitations

- Snowflake cannot filter streaming updates by table. Because of this, we recommend creating a changefeed that watches only one table.
- Snowpipe is unaware of CockroachDB [resolved timestamps](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/create-changefeed#resolved). This means CockroachDB transactions will not be loaded atomically and partial transactions can briefly be returned from Snowflake.
- Snowpipe works best with append-only workloads, as Snowpipe lacks native ETL capabilities to perform updates to data. You may need to pre-process data before uploading it to Snowflake.

Refer to the [Create and Configure Changefeeds](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/create-and-configure-changefeeds#known-limitations) page for more general changefeed known limitations.
