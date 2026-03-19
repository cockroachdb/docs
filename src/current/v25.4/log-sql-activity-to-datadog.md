---
title: Log SQL Activity to Datadog
summary: Examples of common logging use cases and possible CockroachDB logging sink configurations.
toc: true
docs_area: manage
---

This tutorial describes how to configure logging of telemetry events, including [`sampled_query`]({% link {{ page.version.version }}/eventlog.md %}#sampled_query) and [`sampled_transaction`]({% link {{ page.version.version }}/eventlog.md %}#sampled_query), to [Datadog](https://www.datadoghq.com/) for finer granularity and long-term retention of SQL activity. The `sampled_query` and `sampled_transaction` events contain common SQL event and execution details for [statements]({% link {{ page.version.version }}/sql-statements.md %}) and [transactions]({% link {{ page.version.version }}/transactions.md %}).

{{site.data.alerts.callout_info}}
`sampled_query` and `sampled_transaction` events, which are sent by default to the [`TELEMETRY`]({% link {{ page.version.version }}/logging-overview.md %}#telemetry) channel in {{ page.version.version }} and earlier versions, will instead be routed by default to the [`SQL_EXEC`]({% link {{ page.version.version }}/logging-overview.md %}#sql_exec) channel in a future major release.

To prepare for the change and assess potential downstream impacts on your logging setup and pipelines, review the [`log.channel_compatibility_mode.enabled`]({% link {{ page.version.version }}/logging-overview.md %}#log-channel_compatibility_mode-enabled) cluster setting. After reviewing the documentation, set `log.channel_compatibility_mode.enabled` to `false` in a non-production environment to log `sampled_query` and `sampled_transaction` events to the [SQL_EXEC]({% link {{ page.version.version }}/logging-overview.md %}#sql_exec) channel.
{{site.data.alerts.end}}

CockroachDB supports a built-in integration with Datadog which sends these events as logs via the [Datadog HTTP API](https://docs.datadoghq.com/api/latest/logs/). This integration is the recommended path to achieve high throughput data ingestion, which will in turn provide more query and transaction events for greater workload observability.

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

## Step 1. Create a Datadog API key

1. In Datadog, navigate to [**Organization Settings > API keys**](https://app.datadoghq.com/organization-settings/api-keys).
1. Follow the steps in the Datadog documentation on how to [add an API key](https://docs.datadoghq.com/account_management/api-app-keys/#add-an-api-key-or-client-token).
1. Copy the newly created API key to be used in Step 2.

## Step 2. Configure an HTTP network collector for Datadog

Configure an [HTTP network collector]({% link {{ page.version.version }}/configure-logs.md %}#output-to-http-network-collectors) by creating or modifying the [`logs.yaml` file]({% link {{ page.version.version }}/configure-logs.md %}#yaml-payload).

In this `logs.yaml` example:

   1. To send telemetry events directly to Datadog without writing events to disk, override telemetry default configuration by setting `file-groups: telemetry: channels:` to `[]`.
   {{site.data.alerts.callout_danger}}
    Given the [volume of `sampled_query` and `sampled_transaction` events](#step-3-configure-cockroachdb-to-emit-query-events), do not write these events to disk, or [`file-groups`]({% link {{ page.version.version }}/configure-logs.md %}#output-to-files). Writing a high volume of `sampled_query` and `sampled_transaction` events to a file group will unnecessarily consume cluster resources and impact workload performance.

    To disable the creation of a telemetry file and avoid writing `sampled_query` and `sampled_transaction` events and other [telemetry events]({% link {{ page.version.version }}/eventlog.md %}#telemetry-events) to disk, change the telemetry `file-groups` setting from the [default of `channels: [TELEMETRY]`]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration) to `channels: []`.
   {{site.data.alerts.end}}
   1. To connect to Datadog, replace `{DATADOG API KEY}` with the value you copied in Step 1.
   1. To control the ingestion and potential drop rate for telemetry events, configure the following `buffering` values depending on your workload:

   - `max-staleness`: The maximum time a log message will wait in the buffer before a flush is triggered. Set to `0` to disable flushing based on elapsed time. Default: `5s`
   - `flush-trigger-size`: The number of bytes that will trigger the buffer to flush. Set to `0` to disable flushing based on accumulated size. Default: `1MiB`. In this example, override to `2.5MiB`.
   - `max-buffer-size`: The maximum size of the buffer: new log messages received when the buffer is full cause older messages to be dropped. Default: `50MiB`

{% include_cached copy-clipboard.html %}
~~~ yaml
sinks:
  http-servers:
    datadog:
      channels: [TELEMETRY]
      address: https://http-intake.logs.datadoghq.com/api/v2/logs
      format: json
      method: POST
      compression: gzip
      headers: {DD-API-KEY: "DATADOG_API_KEY"} # replace with actual DATADOG API key
      buffering:
        format: json-array
        max-staleness: 5s
        flush-trigger-size: 2.5MiB # override default value
        max-buffer-size: 50MiB
  file-groups: # override default configuration
    telemetry:  # do not write telemetry events to disk
      channels: [] # set to empty square brackets
~~~

{{site.data.alerts.callout_success}}
If you prefer to keep the `DD-API-KEY` in a file other than the `logs.yaml`, replace the `headers` parameter with the [`file-based-headers` parameter]({% link {{ page.version.version }}/configure-logs.md %}#file-based-headers):

{% include_cached copy-clipboard.html %}
~~~ yaml
      file-based-headers: {DD-API-KEY: "path/to/file"} # replace with path of file containing DATADOG API key
~~~

The value in the file containing the Datadog API key can be updated without restarting the `cockroach` process. Instead, send SIGHUP to the `cockroach` process to notify it to refresh the value.
{{site.data.alerts.end}}

Pass the [`logs.yaml` file]({% link {{ page.version.version }}/configure-logs.md %}#yaml-payload) to the  `cockroach` process with either `--log-config-file` or ` --log` flag.

## Step 3. Configure CockroachDB to emit query events

Enable the [`sql.telemetry.query_sampling.enabled` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-telemetry-query-sampling-enabled) so that executed queries will emit an event on the telemetry [logging channel]({% link {{ page.version.version }}/logging-overview.md %}#logging-channels):

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.telemetry.query_sampling.enabled = true;
~~~

Set the [`sql.telemetry.query_sampling.mode` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to `statement` so that `sampled_query` events are emitted (`sampled_transaction` events will not be emitted):

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.telemetry.query_sampling.mode = 'statement';
~~~

Configure the following [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to a value that is dependent on the level of granularity you require and how much performance impact from frequent logging you can tolerate:

- [`sql.telemetry.query_sampling.max_event_frequency`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-telemetry-query-sampling-max-event-frequency) (default `8`) is the max event frequency (events per second) at which we sample executed queries for telemetry. If sampling mode is set to `'transaction'`, this setting is ignored. In practice, this means that we only sample an executed query if 1/`max_event_frequency` seconds have elapsed since the last executed query was sampled. Sampling impacts the volume of query events emitted which can have downstream impact to workload performance and third-party processing costs. Slowly increase this sampling threshold and monitor potential impact.

    Logs are sampled for statements of type [DML (data manipulation language)]({% link {{ page.version.version }}/sql-statements.md %}#data-manipulation-statements) or [TCL (transaction control language)]({% link {{ page.version.version }}/sql-statements.md %}#transaction-control-statements).

    Logs are always captured for statements under the following conditions:

    - Statements that are not of type [DML (data manipulation language)]({% link {{ page.version.version }}/sql-statements.md %}#data-manipulation-statements) or [TCL (transaction control language)]({% link {{ page.version.version }}/sql-statements.md %}#transaction-control-statements). These statement types are:
        - [DDL (data definition language)]({% link {{ page.version.version }}/sql-statements.md %}#data-definition-statements)
        - [DCL (data control language)]({% link {{ page.version.version }}/sql-statements.md %}#data-control-statements)
    - Statements that are in [sessions with tracing enabled]({% link {{ page.version.version }}/set-vars.md %}#set-tracing).
    - Statements that are from the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) when [cluster setting `sql.telemetry.query_sampling.internal_console.enabled`]({% link {{ page.version.version }}/cluster-settings.md %}) is `true` (default). These events have `ApplicationName` set to `$ internal-console`.


{{site.data.alerts.callout_info}}
The `sql.telemetry.query_sampling.max_event_frequency` cluster setting and the `buffering` options in the `logs.yaml` control how many events are emitted to Datadog and that can be potentially dropped. Adjust this setting and these options according to your workload, depending on the size of events and the queries per second (QPS) observed through monitoring.
{{site.data.alerts.end}}

## Step 4. Configure CockroachDB to emit query and transaction events (optional)

Enable the [`sql.telemetry.query_sampling.enabled` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-telemetry-query-sampling-enabled) so that executed queries and transactions will emit an event on the telemetry [logging channel]({% link {{ page.version.version }}/logging-overview.md %}#logging-channels):

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.telemetry.query_sampling.enabled = true;
~~~

Set the [`sql.telemetry.query_sampling.mode` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to `transaction` so that `sampled_query` and `sampled_transaction` events are emitted:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.telemetry.query_sampling.mode = 'transaction';
~~~

Configure the following [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}) to values that are dependent on the level of granularity you require and how much performance impact from frequent logging you can tolerate:

- [`sql.telemetry.transaction_sampling.max_event_frequency`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-telemetry-transaction-sampling-max-event-frequency) (default `8`) is the max event frequency (events per second) at which we sample transactions for telemetry. If sampling mode is set to `'statement'`, this setting is ignored. In practice, this means that we only sample a transaction if 1/`max_event_frequency` seconds have elapsed since the last transaction was sampled. Sampling impacts the volume of transaction events emitted which can have downstream impact to workload performance and third-party processing costs. Slowly increase this sampling threshold and monitor potential impact.
- [`sql.telemetry.transaction_sampling.statement_events_per_transaction.max`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-telemetry-transaction-sampling-statement-events-per-transaction-max) (default `50`) is the maximum number of statement events to log for every sampled transaction. Note that statements that are always captured do not adhere to this limit.

    Logs are always captured for statements under the following conditions:

    - Statements that are not of type [DML (data manipulation language)]({% link {{ page.version.version }}/sql-statements.md %}#data-manipulation-statements) or [TCL (transaction control language)]({% link {{ page.version.version }}/sql-statements.md %}#transaction-control-statements). These statement types are:
        - [DDL (data definition language)]({% link {{ page.version.version }}/sql-statements.md %}#data-definition-statements)
        - [DCL (data control language)]({% link {{ page.version.version }}/sql-statements.md %}#data-control-statements)
    - Statements that are in [sessions with tracing enabled]({% link {{ page.version.version }}/set-vars.md %}#set-tracing).
    - Statements that are from the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) when [cluster setting `sql.telemetry.query_sampling.internal_console.enabled`]({% link {{ page.version.version }}/cluster-settings.md %}) is `true` (default). These events have `ApplicationName` set to `$ internal-console`.

### Correlating query events with a specific transaction

Each `sampled_query` and `sampled_transaction` event has an `event.TransactionID` attribute. To correlate a `sampled_query` with a specific `sampled_transaction`, filter for a given value of this attribute.

## Step 5. Monitor TELEMETRY logs in Datadog

1. Navigate to [**Datadog > Logs**](https://app.datadoghq.com/logs).
1. Search for `@event.EventType:(sampled_query OR sampled_transaction)` to see the logs for the query and transaction events that are emitted. For example:

<img src="{{ 'images/v25.4/datadog-telemetry-logs.png' | relative_url }}" alt="Datadog Telemetry Logs" style="border:1px solid #eee;max-width:100%" />

## See also

- [Notable Event Types]({% link {{ page.version.version }}/eventlog.md %})
- [Configure logs]({% link {{ page.version.version }}/configure-logs.md %})
- [Cluster Settings]({% link {{ page.version.version }}/cluster-settings.md %})
