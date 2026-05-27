---
title: Change Data Capture Overview
summary: Stream data out of CockroachDB with efficient, distributed, row-level change subscriptions (changefeeds).
toc: true
docs_area: stream_data
key: stream-data-out-of-cockroachdb-using-changefeeds.html
---

**Change data capture (CDC)** detects row-level data changes in CockroachDB and emits those changes as messages for downstream processing. While CockroachDB is an excellent system of record, CDC allows it to integrate with other systems in your data ecosystem.

For example, you might want to:

- Stream messages to Kafka to trigger notifications in an application.
- Mirror your data in full-text indexes, analytics engines, or big data pipelines.
- Export a snapshot of tables to backfill new applications.
- Feed updates to data stores powering machine learning models.

<a id="watched-table"></a>
{% include common/define-watched-cdc.md %}

## Stream row-level changes with changefeeds

Changefeeds are customizable _jobs_ that monitor row-level changes in a table and emit updates in real time. These updates are delivered in your preferred format to a specified destination, known as a _sink_.

In production, changefeeds are typically configured with an external sink such as Kafka or cloud storage. However, for development and testing purposes, _sinkless changefeeds_ allow you to stream change data directly to your SQL client.

Each emitted row change is delivered at least once, and the first emit of every event for the same key is ordered by timestamp.

<table class="comparison-chart">
  <tr>
    <th></th>
    <th>Sinkless changefeeds</th>
    <th>Changefeeds</th>
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
    <td>All products</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Message delivery</b>
    </td>
    <td>Streams indefinitely until underlying SQL connection is closed.</td>
    <td>Maintains connection to configured <a href="{% link {{ page.version.version }}/changefeed-sinks.md %}">sink</a>.</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>SQL statement</b>
    </td>
    <td>Create with <a href="create-changefeed.html"><code>CREATE CHANGEFEED FOR TABLE table_name;</code></a></td>
    <td>Create with <a href="create-changefeed.html"><code>CREATE CHANGEFEED FOR TABLE table_name INTO 'sink';</code></a></td>
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
    <td>Use <a href="{% link {{ page.version.version }}/cdc-queries.md %}">CDC queries</a> to define the emitted change data.</td>
    <td>Use <a href="{% link {{ page.version.version }}/cdc-queries.md %}">CDC queries</a> to define the emitted change data.</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Schedule changefeeds</b>
    </td>
    <td>Not supported</td>
    <td>Create a scheduled changefeed with <a href="{% link {{ page.version.version }}/create-schedule-for-changefeed.md %}"><code>CREATE SCHEDULE FOR CHANGEFEED</code></a>.</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Job execution locality</b>
    </td>
    <td>Not supported</td>
    <td>Use <a href="{% link {{ page.version.version }}/changefeeds-in-multi-region-deployments.md %}#run-a-changefeed-job-by-locality"><code>execution_locality</code></a> to determine the node locality for changefeed job execution.</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Message format</b>
    </td>
    <td>Emits every change to a "watched" row as a record to the current SQL session.</td>
    <td>Emits every change to a "watched" row as a record in a <a href="{% link {{ page.version.version }}/changefeed-messages.md %}#message-formats">configurable format</a>.</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Management</b>
    </td>
    <td>Create the changefeed and cancel by closing the SQL connection.</td>
    <td><a href="{% link {{ page.version.version }}/create-and-configure-changefeeds.md %}">Manage changefeed</a> with <code>CREATE</code>, <code>PAUSE</code>, <code>RESUME</code>, <code>ALTER</code>, and <code>CANCEL</code>.</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Monitoring</b>
    </td>
    <td>Not supported</td>
    <td><a href="{% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}">Metrics</a> available to monitor in the DB Console and Prometheus.<br>Job observability with <a href="{% link {{ page.version.version }}/show-jobs.md %}#show-changefeed-jobs"><code>SHOW CHANGEFEED JOBS</code></a>.</td>
  </tr>

</table>

## Get started with changefeeds

To get started with changefeeds in CockroachDB, refer to:

- [Create and Configure Changefeeds]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}): Learn about the fundamentals of using SQL statements to create and manage changefeeds.
- [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}): The downstream system to which the changefeed emits changes. Learn about the supported sinks and configuration capabilities.
- [Changefeed Messages]({% link {{ page.version.version }}/changefeed-messages.md %}): The change events that emit from the changefeed. Learn about how messages are ordered and the options to configure and format messages.
- [Changefeed Examples]({% link {{ page.version.version }}/changefeed-examples.md %}): Step-by-step examples for connecting to changefeed sinks or running sinkless changefeeds.

### Authenticate to your changefeed sink

To send changefeed messages to a sink, it is necessary to provide the `CREATE CHANGEFEED` statement with authentication credentials.

The following pages detail the supported authentication:

Sink | Authentication page
-----+---------------------
Cloud Storage | Refer to [Cloud Storage Authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}) for detail on setting up:<ul><li>IAM roles with assume role authentication.</li><li>Workload identity authentication.</li><li>Implicit authentication.</li><li>Specified authentication.</li></ul>
Kafka | Refer to:<ul><li>[Connect to a Changefeed Kafka Sink with OAuth Using Okta]({% link {{ page.version.version }}/connect-to-a-changefeed-kafka-sink-with-oauth-using-okta.md %}) to connect to your Kafka sink using OAuth authentication.</li><li>[Stream a Changefeed to a Confluent Cloud Kafka Cluster]({% link {{ page.version.version }}/stream-a-changefeed-to-a-confluent-cloud-kafka-cluster.md %}) to authenticate to a Confluent Cloud Kafka cluster with a Confluent Schema Registry.</li><li>[Query parameters]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) to supply your own certificate credentials.</li></ul>
Webhook | Refer to:<ul><li>[Query parameters]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink) to supply your own certificate credentials.</li></ul>
Google Cloud Pub/Sub | Refer to:<ul><li>[Query parameters]({% link {{ page.version.version }}/changefeed-sinks.md %}#google-cloud-pub-sub) for a general list of the supported query parameters.</li><li>[Cloud Storage Authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}?filters=gcs#set-up-google-cloud-storage-assume-role) for detail on IAM roles with assume role authentication.</li></ul>

## Monitor your changefeed job

It is a best practice to monitor your changefeed jobs for behavior such as failures and retries.

You can use the following tools for monitoring:

- The [Changefeed Dashboard]({% link {{ page.version.version }}/ui-cdc-dashboard.md %}) on the DB Console
- The [`SHOW CHANGEFEED JOBS`]({% link {{ page.version.version }}/show-jobs.md %}#show-changefeed-jobs) statement
- [Changefeed metrics labels]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#using-changefeed-metrics-labels)

Refer to the [Monitor and Debug Changefeeds]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}) page for recommendations on metrics to track.

For detail on how protected timestamps and garbage collection interact with changefeeds, refer to [Protect Changefeed Data from Garbage Collection]({% link {{ page.version.version }}/protect-changefeed-data.md %}).

## Optimize a changefeed for your workload

### Filter your change data with CDC queries

_Change data capture queries_ allow you to define and filter the change data emitted to your sink when you create an changefeed.

For example, you can use CDC queries to:

- [Filter out rows and columns]({% link {{ page.version.version }}/cdc-queries.md %}#filter-columns) from changefeed messages to decrease the load on your downstream sink.
- [Modify data before it emits]({% link {{ page.version.version }}/cdc-queries.md %}#customize-changefeed-messages) to reduce the time and operational burden of filtering or transforming data downstream.
- [Stabilize or customize the schema]({% link {{ page.version.version }}/cdc-queries.md %}#stabilize-the-changefeed-message-schema) of your changefeed messages for increased compatibility with external systems.

Refer to the [Change Data Capture Queries]({% link {{ page.version.version }}/cdc-queries.md %}) page for more example use cases.

### Use changefeeds to export a table

Changefeeds can export a single table scan to your sink. The benefits of using changefeeds for exports include: job management, observability, and sink configurability. You can also schedule changefeeds to export tables, which may be useful to avoid table scans during peak periods.

For examples and more detail, refer to:

- [Export Data with Changefeeds]({% link {{ page.version.version }}/export-data-with-changefeeds.md %})
- [`CREATE SCHEDULE FOR CHANGEFEED`]({% link {{ page.version.version }}/create-schedule-for-changefeed.md %})

### Determine the nodes running a changefeed by locality

CockroachDB supports an option to set locality filter requirements that nodes must meet in order to take part in a changefeed job. This is helpful in multi-region clusters to ensure the nodes that are physically closest to the sink emit changefeed messages. For syntax and further technical detail, refer to [Run a changefeed job by locality]({% link {{ page.version.version }}/changefeeds-in-multi-region-deployments.md %}#run-a-changefeed-job-by-locality).
