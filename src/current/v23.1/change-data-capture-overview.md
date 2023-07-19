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

Changefeeds are customizable _jobs_ that track row-level changes and send data in realtime in a preferred format to your specified destination, known as a _sink_. Each version of a row emitted to the sink are subject to an at-least-once delivery guarantee and are ordered by timestamp.

CockroachDB has two implementations of changefeeds:

<table class="comparison-chart">
  <tr>
    <th></th>
    <th>Core changefeeds</th>
    <th>Enterprise changefeeds</th>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Use case</b>
    </td>
    <td>Useful for prototyping or quick testing.</td>
    <td>Recommended for production use.</a></td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Product availability</b>
    </td>
    <td>All products</td>
    <td>{{ site.data.products.dedicated }} or with an <a href="enterprise-licensing.html">{{ site.data.products.enterprise }} license</a> in {{ site.data.products.core }} or {{ site.data.products.serverless }}.</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Message delivery</b>
    </td>
    <td>Streams indefinitely until underlying SQL connection is closed.</td>
    <td>Maintains connection to configured <a href="changefeed-sinks.html">sink</a>: <br>Kafka, Google Cloud Pub/Sub, Amazon S3, Google Cloud Storage, Azure Storage, HTTP, Webhook.</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>SQL statement</b>
    </td>
    <td>Create with <a href="changefeed-for.html"><code>EXPERIMENTAL CHANGEFEED FOR</code></a></td>
    <td>Create with <a href="create-changefeed.html"><code>CREATE CHANGEFEED</code></a></td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Targets</b>
    </td>
    <td>Watches one or multiple tables in a comma-separated list.</td>
    <td>Watches one or multiple tables in a comma-separated list.</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Filter change data</b>
    </td>
    <td>Not supported</td>
    <td>Use <a href="cdc-queries.html">CDC queries</a> to define the emitted change data.</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Schedule changefeeds</b>
    </td>
    <td>Not supported</td>
    <td>Create a scheduled changefeed with <a href="create-schedule-for-changefeed.html"><code>CREATE SCHEDULE FOR CHANGEFEED</code></a>.</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Job execution locality</b>
    </td>
    <td>Not supported</td>
    <td>Use <a href="changefeeds-in-multi-region-deployments.html#run-a-changefeed-job-by-locality"><code>execution_locality</code></a> to determine the node locality for changefeed job execution.</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Message format</b>
    </td>
    <td>Emits every change to a "watched" row as a record to the current SQL session.</td>
    <td>Emits every change to a "watched" row as a record in a configurable format (JSON, CSV, Avro).</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Management</b>
    </td>
    <td>Create the changefeed and cancel by closing the connection.</td>
    <td><a href="create-and-configure-changefeeds.html">Manage changefeed</a> with <code>CREATE</code>, <code>PAUSE</code>, <code>RESUME</code>, <code>ALTER</code>, and <code>CANCEL</code>.</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Monitoring</b>
    </td>
    <td>Not supported</td>
    <td><a href="monitor-and-debug-changefeeds.html">Metrics</a> available to monitor in the DB Console and Prometheus.<br>Job observability with <a href="show-jobs.html#show-changefeed-jobs"><code>SHOW CHANGEFEED JOBS</code></a>.</td>
  </tr>

</table>

## Get started with changefeeds

To get started with changefeeds in CockroachDB, refer to:

- [Create and Configure Changefeeds](create-and-configure-changefeeds.html): Learn about the fundamentals of using SQL statements to create and manage Enterprise and Core changefeeds.
- [Changefeed Sinks](changefeed-sinks.html): The downstream system to which the changefeed emits changes. Learn about the supported sinks and configuration capabilities.
- [Changefeed Messages](changefeed-messages.html): The change events that emit from the changefeed to your sink. Learn about how messages are ordered at your sink and the options to configure and format messages.
- [Changefeed Examples](changefeed-examples.html): Step-by-step examples for connecting to each changefeed sink.

### Authenticate to your changefeed sink

To send changefeed messages to a sink, it is necessary to provide the `CREATE CHANGEFEED` statement with authentication credentials.

The following pages detail the supported authentication:

Sink | Authentication page
-----+---------------------
Cloud Storage | Refer to [Cloud Storage Authentication](cloud-storage-authentication.html) for detail on setting up:<ul><li>IAM roles with assume role authentication.</li><li>Workload identity authentication.</li><li>Implicit authentication.</li><li>Specified authentication.</li></ul>
Kafka | Refer to:<ul><li>[Connect to a Changefeed Kafka Sink with OAuth Using Okta](connect-to-a-changefeed-kafka-sink-with-oauth-using-okta.html) to connect to your Kafka sink using OAuth authentication.</li><li>[Stream a Changefeed to a Confluent Cloud Kafka Cluster](stream-a-changefeed-to-a-confluent-cloud-kafka-cluster.html) to authenticate to a Confluent Cloud Kafka cluster with a Confluent Schema Registry.</li><li>[Query parameters](changefeed-sinks.html#kafka) to supply your own certificate credentials.</li></ul>
Webhook | Refer to:<ul><li>[Query parameters](changefeed-sinks.html#webhook-sink) to supply your own certificate credentials.</li></ul>
Google Cloud Pub/Sub | Refer to:<ul><li>[Query parameters](changefeed-sinks.html#google-cloud-pub-sub) for a general list of the supported query parameters.</li><li>[Cloud Storage Authentication](cloud-storage-authentication.html?filters=gcs#google-cloud-storage-assume-role) for detail on IAM roles with assume role authentication.</li></ul>

## Monitor your changefeed job

It is a best practice to monitor your changefeed jobs. You can use the following tools for monitoring:

- The [Changefeed Dashboard](ui-cdc-dashboard.html) on the DB Console
- The [`SHOW CHANGEFEED JOBS`](show-jobs.html#show-changefeed-jobs) statement
- [Changefeed metrics labels](monitor-and-debug-changefeeds.html#using-changefeed-metrics-labels)

Refer to the [Monitor and Debug Changefeeds](monitor-and-debug-changefeeds.html) page for recommendations on metrics to track.

## Optimize a changefeed for your workload

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