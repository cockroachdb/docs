---
title: Change Data Capture Overview
summary: Stream data out of CockroachDB with efficient, distributed, row-level change subscriptions (changefeeds).
toc: true
docs_area: stream_data
key: stream-data-out-of-cockroachdb-using-changefeeds.html
---

Change data capture (CDC) detects row-level data changes in CockroachDB and sends the change as a message to a configurable sink for downstream processing purposes. While CockroachDB is an excellent system of record, it also needs to coexist with other systems.

For example, you might want to:

- Stream messages to Kafka to trigger notifications in an application.
- Keep your data mirrored in full-text indexes, analytics engines, or big data pipelines.
- Export a snaphot of tables to backfill new applications.
- Send updates to data stores for machine learning models.

The main feature of CockroachDB CDC is the _changefeed_, which targets an allowlist of tables, or "watched rows".

## Stream row-level changes with changefeeds

Changefeeds are customizable jobs that track row-level changes and send data in realtime in your preferred format to your specified destination, known as a _sink_. Each version of a row emitted to the sink are subject to an at-least-once delivery guarantee and are ordered by timestamp.

CockroachDB has two implementations of changefeeds:

| [Core changefeeds](create-and-configure-changefeeds.html?filters=core)  | [{{ site.data.products.enterprise }} changefeeds](create-and-configure-changefeeds.html) |
--------------------------------------------------|-----------------------------------------------------------------|
| Useful for prototyping or quick testing. | Recommended for production use. |
| Available in all products. | Available in {{ site.data.products.dedicated }} or with an [{{ site.data.products.enterprise }} license](enterprise-licensing.html) in {{ site.data.products.core }} or {{ site.data.products.serverless }}. |
| Streams indefinitely until underlying SQL connection is closed. | Maintains connection to configured sink ([Kafka](changefeed-sinks.html#kafka), [Google Cloud Pub/Sub](changefeed-sinks.html#google-cloud-pub-sub), [Amazon S3](changefeed-sinks.html#amazon-s3), [Google Cloud Storage](changefeed-sinks.html#google-cloud-storage), [Azure Storage](changefeed-sinks.html#azure-blob-storage), [HTTP](changefeed-sinks.html#http), [Webhook](changefeed-sinks.html#webhook-sink)). |
| Create with [`EXPERIMENTAL CHANGEFEED FOR`](changefeed-for.html). | Create with [`CREATE CHANGEFEED`](create-changefeed.html).<br>Use `CREATE CHANGEFEED` with [CDC queries](cdc-queries.html) to define the emitted change data.<br>Create a scheduled changefeed with [`CREATE SCHEDULE FOR CHANGEFEED`](create-schedule-for-changefeed.html).<br>Use [`execution_locality`](changefeeds-in-multi-region-deployments.html#run-a-changefeed-job-by-locality) to determine node locality for changefeed job execution.  |
| Watches one or multiple tables in a comma-separated list. Emits every change to a "watched" row as a record. | Watches one or multiple tables in a comma-separated list. Emits every change to a "watched" row as a record in a configurable format (JSON, CSV, Avro) to a [configurable sink](changefeed-sinks.html) (e.g., [Kafka](https://kafka.apache.org/)). |
| [`CREATE`](create-and-configure-changefeeds.html?filters=core) changefeed and cancel by closing the connection. | Manage changefeed with [`CREATE`](create-and-configure-changefeeds.html#create), [`PAUSE`](create-and-configure-changefeeds.html#pause), [`RESUME`](create-and-configure-changefeeds.html#resume), [`ALTER`](alter-changefeed.html), and [`CANCEL`](create-and-configure-changefeeds.html#cancel), as well as [monitor](monitor-and-debug-changefeeds.html#monitor-a-changefeed) and [debug](monitor-and-debug-changefeeds.html#debug-a-changefeed). |

## Get started with changefeeds

To get started with changefeeds in CockroachDB, refer to:

- [Create and Configure Changefeeds](create-and-configure-changefeeds.html): Learn about the fundamentals of using SQL statements to create and manage Enterprise and Core changefeeds.
- [Changefeed Sinks](changefeed-sinks.html): The downstream system to which the changefeed emits changed row data. Learn about the supported sinks that Enterprise changefeeds can emit to.
- [Changefeed Messages](changefeed-messages.html): The change events that emit from the changefeed to your sink. Learn about how messages are ordered at your sink and the options to configure and format messages.
- [Changefeed Examples](changefeed-examples.html): Step-by step-examples for connecting to each changefeed sink.

### Authenticate to your changefeed sink

To send changefeed messages to a sink, it is necessary to provide the `CREATE CHANGEFEED` statement with authentication credentials. The following pages detail the supported authentication:

Sink | Authentication page
-----+---------------------
Cloud Storage | Refer to [Cloud Storage Authentication](cloud-storage-authentication.html) for detail on setting up:<br>IAM roles with assume role authentication.<br>Workload identity authentication.<br>Implicit authentication.<br>Specified authentication.
Kafka | Refer to:<br>[Connect to a Changefeed Kafka Sink with OAuth Using Okta](connect-to-a-changefeed-kafka-sink-with-oauth-using-okta.html) to connect to your Kafka sink using OAuth authentication.<br>[Stream a Changefeed to a Confluent Cloud Kafka Cluster](stream-a-changefeed-to-a-confluent-cloud-kafka-cluster.html) to authenticate to a Confluent Cloud Kafka cluster with a Confluent Schema Registry.<br>[Query parameters](changefeed-sinks.html#kafka) to supply your own certificate credentials.
Webhook | [Query parameters](changefeed-sinks.html#webhook-sink) to supply your own certificate credentials.
Google Cloud Pub/Sub | Refer to:<br>[Query parameters](changefeed-sinks.html#google-cloud-pub-sub) for a general list of the supported query parameters.<br>[Cloud Storage Authentication](cloud-storage-authentication.html?filters=gcs#google-cloud-storage-assume-role) for detail on IAM roles with assume role authentication.

## Optimize your changefeeds

### Filter your change data with CDC queries

_Change data capture queries_ allow you to define and filter the change data emitted to your sink when your create an Enterprise changefeed.

For example, you use CDC queries to:

- [Filter out rows and columns](cdc-queries.html#filter-columns) from changefeed messages to decrease the load on your downstream sink.
- [Modify data before it emits](cdc-queries.html#customize-changefeed-messages) to reduce the time and operational burden of filtering or transforming data downstream.
- [Stabilize or customize the schema](cdc-queries.html#stabilize-the-changefeed-message-schema) of your changefeed messages for increased compatibility with external systems.

Refer to the [Change Data Capture Queries](cdc-queries.html) page for more example use cases.

### Use changefeeds to export a table

Changefeeds can export a single table scan to your sink. The benefits of using changefeeds for exports include: job management, observability, and sink configurability. You can also schedule changefeeds to export tables, which may be useful to avoid table scans during peak periods.

For examples and more detail, refer to:

- [Export Data with Changefeeds](export-data-with-changefeeds.html)
- [`CREATE SCHEDULE FOR CHANGEFEED`](create-schedule-for-changefeed.html)

### Determine the nodes running a changefeed by locality

CockroachDB supports an option to set locality filter requirements that nodes must meet in order to take part in a changefeed job. This is helpful in multi-region clusters to ensure the nodes that physically closest to the sink emit changefeed messages. For syntax and further technical detail, refer to [Run a changefeed job by locality](changefeeds-in-multi-region-deployments.html#run-a-changefeed-job-by-locality).