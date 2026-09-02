---
title: Log SQL Activity to Datadog
summary: Examples of common logging use cases and possible CockroachDB logging sink configurations.
toc: true
docs_area: manage
---

{% include_cached new-in.html version="v23.1.4" %} This tutorial describes how to configure logging of [`sampled_query` events]({% link {{ page.version.version }}/eventlog.md %}#sampled_query) to [Datadog](https://www.datadoghq.com/) for finer granularity and long-term retention of SQL activity. The `sampled_query` events contain common SQL event and execution details for sessions, transactions, and statements.

CockroachDB supports a built-in integration with Datadog which sends query events as logs via the [Datadog HTTP API](https://docs.datadoghq.com/api/latest/logs/). This integration is the recommended path to achieve high throughput data ingestion, which will in turn provide more query events for greater workload observability.

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

## Step 1. Create a Datadog API key

1. In Datadog, navigate to [**Organization Settings > API keys**](https://app.datadoghq.com/organization-settings/api-keys).
1. Follow the steps in the Datadog documentation on how to [add an API key](https://docs.datadoghq.com/account_management/api-app-keys/#add-an-api-key-or-client-token).
1. Copy the newly created API key to be used in Step 2.

## Step 2. Configure an HTTP network collector for Datadog

Configure an [HTTP network collector]({% link {{ page.version.version }}/configure-logs.md %}#output-to-http-network-collectors) by creating or modifying the [`logs.yaml` file]({% link {{ page.version.version }}/configure-logs.md %}#yaml-payload).

{{site.data.alerts.callout_danger}}
Given the [volume of `sampled_query` events](#step-3-configure-cockroachdb-to-emit-query-events), do not write `sampled_query` events to disk, or [`file-groups`]({% link {{ page.version.version }}/configure-logs.md %}#output-to-files). Writing a high volume of `sampled_query` events to a file group will unnecessarily consume cluster resources and impact workload performance. 

To disable the creation of a telemetry file and avoid writing `sampled_query` events and other [telemetry events]({% link {{ page.version.version }}/eventlog.md %}#telemetry-events) to disk, change the telemetry `file-groups` setting from the [default of `channels: [TELEMETRY]`]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration) to `channels: []`.
{{site.data.alerts.end}}

In this `logs.yaml` example:

   1. To send `sampled_query` events directly to Datadog without writing events to disk, override telemetry default configuration by setting `file-groups: telemetry: channels:` to `[]`.
   1. To connect to Datadog, replace `{DATADOG API KEY}` with the value you copied in Step 1.
   1. To control the ingestion and potential drop rate for `sampled_query` events, configure the following `buffering` values depending on your workload:

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
      headers: {DD-API-KEY: "{DATADOG API KEY}"} # replace with actual API key
      buffering:
        format: json-array
        max-staleness: 5s
        flush-trigger-size: 2.5MiB # override default value
        max-buffer-size: 50MiB
  file-groups: # override default configuration
    telemetry:  # do not write telemetry events to disk
      channels: [] # set to empty square brackets
~~~

Pass the [`logs.yaml` file]({% link {{ page.version.version }}/configure-logs.md %}#yaml-payload) to the  `cockroach` process with either `--log-config-file` or ` --log` flag.

## Step 3. Configure CockroachDB to emit query events

Enable the [`sql.telemetry.query_sampling.enabled` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-telemetry-query-sampling-enabled) so that executed queries will emit an event on the telemetry [logging channel]({% link {{ page.version.version }}/logging-overview.md %}#logging-channels):

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.telemetry.query_sampling.enabled = true;
~~~

Configure the following [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to a value that is dependent on the level of granularity you require and how much performance impact from frequent logging you can tolerate:

- `sql.telemetry.query_sampling.max_event_frequency` (default `8`) is the max event frequency (events per second) at which we sample executed queries for telemetry. In practice, this means that we only sample an executed query if 1/`max_event_frequency` seconds have elapsed since the last executed query was sampled. Sampling impacts the volume of query events emitted which can have downstream impact to workload performance and third-party processing costs. Slowly increase this sampling threshold and monitor potential impact.

{{site.data.alerts.callout_info}}
The `sql.telemetry.query_sampling.max_event_frequency` cluster setting and the `buffering` options in the `logs.yaml` control how many events are emitted to Datadog and that can be potentially dropped. Adjust this setting and these options according to your workload, depending on the size of events and the queries per second (QPS) observed through monitoring.
{{site.data.alerts.end}}

## Step 4. Monitor TELEMETRY logs in Datadog

1. Navigate to [**Datadog > Logs**](https://app.datadoghq.com/logs).
1. Filter by **OTHERS > channel: TELEMETRY** to see the logs for the query events that are emitted. For example:

<img src="/docs/images/{{ page.version.version }}/datadog-telemetry-logs.png" alt="Datadog Telemetry Logs" style="border:1px solid #eee;max-width:100%" />

## See also

- [Notable Event Types]({% link {{ page.version.version }}/eventlog.md %})
- [Configure logs]({% link {{ page.version.version }}/configure-logs.md %})
- [Cluster Settings]({% link {{ page.version.version }}/cluster-settings.md %})